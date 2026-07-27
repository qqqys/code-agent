import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

import {
  buildPhase1C2,
  phase1C2ReviewedAt,
} from './generate-phase-1c2-claims.mjs';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(scriptDir, '..');
const repoRoot = path.resolve(root, '../../..');
const prettier = path.join(repoRoot, 'node_modules', '.bin', 'prettier');
const preFreeze = process.argv.includes('--pre-freeze');

const productFiles = {
  codex: 'claims/codex-secondary-surfaces.md',
  'claude-code': 'claims/claude-code-secondary-surfaces.md',
  'qwen-code': 'claims/qwen-code-secondary-surfaces.md',
};

const cliFiles = {
  codex: 'claims/codex-cli.md',
  'claude-code': 'claims/claude-code-cli.md',
  'qwen-code': 'claims/qwen-code-cli.md',
};

const expectedCounts = {
  codex: 8,
  'claude-code': 0,
  'qwen-code': 22,
};

const expectedSupport = {
  codex: { Unknown: 8 },
  'claude-code': {},
  'qwen-code': {
    Supported: 1,
    'Not supported': 1,
    Unknown: 20,
  },
};

const expectedAtomCounts = {
  codex: new Map([
    ['CAP-07.04-A01', 1],
    ['CAP-07.04-A02', 1],
    ['CAP-10.07-A01', 2],
    ['CAP-10.07-A02', 2],
    ['CAP-10.07-A05', 1],
    ['CAP-10.08-A01', 1],
  ]),
  'claude-code': new Map(),
  'qwen-code': new Map(
    [
      'CAP-01.09-A01',
      'CAP-01.09-A02',
      'CAP-10.07-A01',
      'CAP-10.07-A02',
      'CAP-10.07-A03',
      'CAP-10.07-A04',
      'CAP-10.07-A05',
      'CAP-10.08-A01',
      'CAP-10.08-A02',
      'CAP-10.08-A03',
      'CAP-10.11-A01',
      'CAP-10.11-A02',
      'CAP-10.11-A03',
      'CAP-12.02-A02',
      'CAP-12.03-A01',
      'CAP-12.03-A02',
      'CAP-12.05-A01',
      'CAP-12.07-A02',
      'CAP-12.07-A03',
      'CAP-12.08-A02',
      'CAP-12.08-A03',
      'CAP-12.08-A04',
    ].map((atomic) => [atomic, 1]),
  ),
};

const expectedFacts = {
  codex: new Set(['FACT-codex-031', 'FACT-codex-047', 'FACT-codex-048']),
  'claude-code': new Set(),
  'qwen-code': new Set([
    'FACT-qwen-code-004',
    'FACT-qwen-code-042',
    'FACT-qwen-code-050',
    'FACT-qwen-code-052',
    'FACT-qwen-code-053',
  ]),
};

const leafOrder = [
  'EP',
  'IN',
  'AD',
  'AG',
  'SX',
  'SO',
  'PE',
  'OH',
  'RM',
  'CE',
  'CC',
  'CL',
  'FS',
  'EB',
  'SB',
  'OB',
];

const dimensionLeaves = {
  ENTRY: ['EP'],
  INPUT: ['IN'],
  AVAIL: ['AD', 'AG'],
  SIDEFX: ['SX'],
  STATE: ['SO'],
  PERSIST: ['PE'],
  OUTPUT: ['OH'],
  MODES: ['RM'],
  CONC: ['CE', 'CC', 'CL'],
  FAIL: ['FS'],
  EXT: ['EB'],
  SEC: ['SB'],
  OBS: ['OB'],
};

const controlledContractEnums = {
  AD: new Set(['default-on', 'default-off']),
  SO: new Set([
    'turn',
    'session',
    'process',
    'project',
    'workspace',
    'user',
    'organization',
    'external-service',
  ]),
  PE: new Set(['memory', 'transcript', 'local', 'remote', 'cross-device']),
  RM: new Set(['interactive', 'non-interactive', 'tty', 'non-tty', 'remote']),
  CE: new Set(['serial', 'queued', 'parallel', 'mixed']),
  SB: new Set([
    'host',
    'sandbox',
    'workspace',
    'network',
    'external-service',
    'other',
  ]),
};

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), 'utf8');
}

function section(content, start, end) {
  const startIndex = content.indexOf(start);
  const endIndex =
    end === null
      ? content.length
      : content.indexOf(end, startIndex + start.length);
  if (startIndex < 0 || endIndex < 0) {
    throw new Error(`missing section boundary: ${start} -> ${end}`);
  }
  return content.slice(startIndex, endIndex);
}

function splitRow(line) {
  return line
    .trim()
    .slice(1, -1)
    .split(/(?<!\\)\|/)
    .map((cell) => cell.trim().replaceAll('\\|', '|'));
}

function strip(value) {
  return value.replaceAll(/[*`]/g, '').trim();
}

function ids(value, prefix) {
  return [...value.matchAll(new RegExp(`\\b(${prefix}[^\\s,\`]+)`, 'g'))].map(
    (match) => match[1],
  );
}

function countValues(values) {
  const result = {};
  for (const value of values) result[value] = (result[value] ?? 0) + 1;
  return result;
}

function sameObject(actual, expected) {
  return (
    JSON.stringify(Object.entries(actual).sort()) ===
    JSON.stringify(Object.entries(expected).sort())
  );
}

function sameSet(actual, expected) {
  return (
    JSON.stringify([...actual].sort()) === JSON.stringify([...expected].sort())
  );
}

function sameMap(actual, expected) {
  return (
    JSON.stringify([...actual.entries()].sort()) ===
    JSON.stringify([...expected.entries()].sort())
  );
}

function parseRegistry() {
  const records = new Map();
  for (const line of read('03-atomic-capability-registry.md').split('\n')) {
    if (!line.startsWith('| `CAP-')) continue;
    const cells = splitRow(line);
    const atomic = ids(cells[0], 'CAP-')[0];
    if (!/^CAP-\d{2}\.\d{2}-A\d{2}$/.test(atomic ?? '')) continue;
    const dimensions = [...cells[3].matchAll(/\b[A-Z]+\b/g)].map(
      (match) => match[0],
    );
    const required = new Set(
      dimensions.flatMap((dimension) => dimensionLeaves[dimension] ?? []),
    );
    records.set(atomic, { required });
  }
  return records;
}

function parseSlices(content) {
  const result = new Map();
  const sliceContent = section(
    content,
    '## 1. Slice Registry',
    '## 2. Claim Core',
  );
  for (const line of sliceContent.split('\n')) {
    if (!line.startsWith('| `')) continue;
    const cells = splitRow(line);
    if (cells.length !== 17) continue;
    const sliceId = strip(cells[0]);
    if (!/^(CDX|QWN)-/.test(sliceId)) continue;
    if (result.has(sliceId)) {
      throw new Error(`duplicate Slice row ${sliceId}`);
    }
    result.set(sliceId, {
      id: sliceId,
      product: cells[1],
      version: strip(cells[2]),
      channel: cells[3],
      surface: cells[4],
      os: cells[5],
      arch: cells[6],
      terminal: cells[8],
    });
  }
  return result;
}

function parseAssessment(value) {
  return Object.fromEntries(
    value.split('; ').map((part) => {
      const index = part.indexOf('=');
      return [part.slice(0, index), part.slice(index + 1)];
    }),
  );
}

function parseClaims(content, product) {
  const result = new Map();
  const core = section(
    content,
    '## 2. Claim Core',
    '## 3. Behavior Contract Matrix',
  );
  for (const line of core.split('\n')) {
    if (!line.startsWith('| `CCQ-')) continue;
    const cells = splitRow(line);
    if (cells.length !== 12) {
      throw new Error(`${product}: invalid Claim Core column count`);
    }
    const claimId = strip(cells[0]);
    if (result.has(claimId)) {
      throw new Error(`${product}: duplicate Claim Core row ${claimId}`);
    }
    result.set(claimId, {
      id: claimId,
      product,
      atomic: strip(cells[1]),
      sliceId: strip(cells[2]),
      facts: new Set(ids(cells[3], 'FACT-')),
      statement: cells[5],
      assessment: parseAssessment(cells[6]),
      evidence: new Set(ids(cells[7], 'EVD-')),
      checked: cells[11],
    });
  }
  return result;
}

function parseContracts(content) {
  const result = new Map();
  const contracts = section(
    content,
    '## 3. Behavior Contract Matrix',
    '## 4. Evidence Relation Extension',
  );
  for (const line of contracts.split('\n')) {
    if (!line.startsWith('| `CCQ-')) continue;
    const cells = splitRow(line);
    if (cells.length !== 17) {
      throw new Error('invalid Behavior Contract column count');
    }
    const claimId = strip(cells[0]);
    if (result.has(claimId)) {
      throw new Error(`duplicate Behavior Contract row ${claimId}`);
    }
    result.set(
      claimId,
      Object.fromEntries(
        leafOrder.map((leaf, index) => [leaf, strip(cells[index + 1])]),
      ),
    );
  }
  return result;
}

function parseRelations(content) {
  const result = [];
  const relations = section(content, '## 4. Evidence Relation Extension', null);
  for (const line of relations.split('\n')) {
    if (!line.startsWith('| `EVD-')) continue;
    const cells = splitRow(line);
    if (cells.length !== 4) {
      throw new Error('invalid Evidence Relation column count');
    }
    const evidenceId = strip(cells[0]);
    const relation = strip(cells[1]);
    for (const claimId of ids(cells[2], 'CCQ-')) {
      result.push({
        evidenceId,
        relation,
        claimId,
        note: cells[3],
      });
    }
  }
  return result;
}

function evidenceRow(content, evidenceId, expectedType) {
  for (const line of content.split('\n')) {
    if (!line.startsWith(`| \`${evidenceId}\``)) continue;
    const cells = splitRow(line);
    if (strip(cells[1]) === expectedType) return cells;
  }
  throw new Error(`missing Evidence Record ${evidenceId}`);
}

function versionChannel(value) {
  const match = strip(value).match(/^(.+?)\s*\/\s*(\S+)$/);
  if (!match) throw new Error(`invalid version/channel: ${value}`);
  return { version: match[1].trim(), channel: match[2].trim() };
}

function parseEvidenceRecords() {
  const result = new Map();
  const codex = read('evidence/codex.md');
  const increment = read('evidence/phase-1c2-secondary-surfaces.md');
  const qwen = read('evidence/qwen-code.md');

  for (const [id, source, type] of [
    ['EVD-codex-DOC-024', codex, 'DOC'],
    ['EVD-codex-DOC-025', codex, 'DOC'],
    ['EVD-codex-HELP-006', increment, 'HELP'],
    ['EVD-codex-RUNTIME-002', increment, 'RUNTIME'],
    ['EVD-codex-RUNTIME-003', increment, 'RUNTIME'],
    ['EVD-qwen-code-DOC-044', increment, 'DOC'],
    ['EVD-qwen-code-SOURCE-009', increment, 'SOURCE'],
  ]) {
    const cells = evidenceRow(source, id, type);
    const identity = versionChannel(cells[2]);
    result.set(id, {
      id,
      type,
      ...identity,
      surface: strip(cells[3]),
      capturedAt: strip(cells[5]),
      boundedObservation: cells[7],
      provableScope: cells[8],
    });
  }

  const qwenVersion = qwen.match(/^> 冻结版本：`([^`]+)` · `([^`]+)`/m) ?? [];
  const qwenCaptured = qwen.match(/^> Captured at：`([^`]+)`/m)?.[1];
  if (!qwenVersion[1] || !qwenVersion[2] || !qwenCaptured) {
    throw new Error('incomplete Qwen Evidence Ledger identity');
  }
  for (const [id, type] of [
    ['EVD-qwen-code-HELP-005', 'HELP'],
    ['EVD-qwen-code-DOC-018', 'DOC'],
    ['EVD-qwen-code-DOC-028', 'DOC'],
    ['EVD-qwen-code-DOC-043', 'DOC'],
  ]) {
    const cells = evidenceRow(qwen, id, type);
    result.set(id, {
      id,
      type,
      version: qwenVersion[1],
      channel: qwenVersion[2],
      surface: strip(cells[2]),
      capturedAt: qwenCaptured,
      boundedObservation: cells[4],
      provableScope: cells[6],
    });
  }
  return result;
}

function recordedValues(value) {
  const match = value.match(/^R\[(.*)\]$/);
  return match
    ? match[1]
        .split(';')
        .map((item) => item.trim())
        .filter(Boolean)
    : [];
}

function numericCell(value) {
  const number = Number(strip(value).replaceAll(',', ''));
  return Number.isFinite(number) ? number : null;
}

function rowByLabel(content, label) {
  for (const line of content.split('\n')) {
    if (!line.startsWith('|')) continue;
    const cells = splitRow(line);
    if (strip(cells[0]) === label) return cells;
  }
  return null;
}

const errors = [];
const registry = parseRegistry();
const evidence = parseEvidenceRecords();
const parsed = {};
const allSecondaryIds = new Set();
const allRelations = [];

for (const [product, relativePath] of Object.entries(productFiles)) {
  const content = read(relativePath);
  const slices = parseSlices(content);
  const claims = parseClaims(content, product);
  const contracts = parseContracts(content);
  const relations = parseRelations(content);
  parsed[product] = { content, slices, claims, contracts, relations };

  if (claims.size !== expectedCounts[product]) {
    errors.push(
      `${product}: expected ${expectedCounts[product]} claims, got ${claims.size}`,
    );
  }
  if (contracts.size !== claims.size) {
    errors.push(`${product}: Claim/Contract row count mismatch`);
  }
  for (const claimId of claims.keys()) {
    if (allSecondaryIds.has(claimId)) {
      errors.push(`duplicate secondary Claim ID ${claimId}`);
    }
    allSecondaryIds.add(claimId);
  }

  const atomCounts = new Map();
  const facts = new Set();
  const support = {};
  for (const claim of claims.values()) {
    atomCounts.set(claim.atomic, (atomCounts.get(claim.atomic) ?? 0) + 1);
    for (const fact of claim.facts) facts.add(fact);
    support[claim.assessment.S] = (support[claim.assessment.S] ?? 0) + 1;

    const slice = slices.get(claim.sliceId);
    if (!slice) {
      errors.push(`${claim.id}: unknown Slice ${claim.sliceId}`);
      continue;
    }
    if (slice.surface === 'cli') {
      errors.push(`${claim.id}: CLI Surface leaked into Phase 1C.2`);
    }
    if (/docs@|current|blocked|pending/.test(slice.version)) {
      errors.push(`${claim.id}: non-exact Slice version ${slice.version}`);
    }
    if (claim.checked !== phase1C2ReviewedAt) {
      errors.push(`${claim.id}: stale last_checked ${claim.checked}`);
    }
    if (!registry.has(claim.atomic)) {
      errors.push(`${claim.id}: unknown Atomic ${claim.atomic}`);
      continue;
    }

    const contract = contracts.get(claim.id);
    if (!contract) {
      errors.push(`${claim.id}: missing Behavior Contract`);
      continue;
    }
    for (const leaf of leafOrder) {
      const value = contract[leaf];
      if (!/^(R\[.+\]|CN|U|NC|NA)$/.test(value)) {
        errors.push(`${claim.id}: invalid ${leaf}=${value}`);
      }
      const required = registry.get(claim.atomic).required.has(leaf);
      if (!required && value !== 'NA') {
        errors.push(`${claim.id}: non-required ${leaf} must be NA`);
      }
      if (
        required &&
        value === 'NA' &&
        !(
          claim.product === 'qwen-code' &&
          claim.atomic === 'CAP-01.09-A01' &&
          leaf === 'AD'
        )
      ) {
        errors.push(`${claim.id}: required ${leaf} used unapproved NA`);
      }
      if (
        /^R\[.*(?:unknown|not described|not documented|unspecified|未知|未说明|未描述)/i.test(
          value,
        )
      ) {
        errors.push(`${claim.id}: unknown encoded as recorded ${leaf}`);
      }
      const allowed = controlledContractEnums[leaf];
      if (
        allowed &&
        value.startsWith('R[') &&
        recordedValues(value).some((item) => !allowed.has(item))
      ) {
        errors.push(`${claim.id}: invalid controlled ${leaf}=${value}`);
      }
    }
  }
  if (!sameMap(atomCounts, expectedAtomCounts[product])) {
    errors.push(`${product}: Atomic inventory drift`);
  }
  if (!sameSet(facts, expectedFacts[product])) {
    errors.push(`${product}: origin Fact inventory drift`);
  }
  if (!sameObject(support, expectedSupport[product])) {
    errors.push(`${product}: support distribution drift`);
  }

  const relationByClaim = new Map();
  for (const record of relations) {
    allRelations.push({ ...record, product });
    const claim = claims.get(record.claimId);
    if (!claim) {
      errors.push(`${product}: relation references unknown ${record.claimId}`);
      continue;
    }
    const evidenceRecord = evidence.get(record.evidenceId);
    if (!evidenceRecord) {
      errors.push(`${record.evidenceId}: missing parsed Evidence Record`);
      continue;
    }
    if (!claim.evidence.has(record.evidenceId)) {
      errors.push(
        `${record.claimId}: undeclared relation Evidence ${record.evidenceId}`,
      );
    }
    const slice = slices.get(claim.sliceId);
    if (slice && evidenceRecord.surface !== slice.surface) {
      errors.push(
        `${record.claimId}/${record.evidenceId}: cross-Surface relation`,
      );
    }
    if (
      record.relation === 'supports' &&
      slice &&
      (evidenceRecord.version !== slice.version ||
        evidenceRecord.channel !== slice.channel)
    ) {
      errors.push(
        `${record.claimId}/${record.evidenceId}: supports is not exact version/channel`,
      );
    }
    if (!evidenceRecord.provableScope) {
      errors.push(`${record.evidenceId}: empty provable scope`);
    }
    if (claim.checked < evidenceRecord.capturedAt) {
      errors.push(
        `${record.claimId}: last_checked predates ${record.evidenceId}`,
      );
    }
    const values = relationByClaim.get(claim.id) ?? [];
    values.push(record);
    relationByClaim.set(claim.id, values);
  }
  for (const claim of claims.values()) {
    const actualEvidence = new Set(
      (relationByClaim.get(claim.id) ?? []).map((record) => record.evidenceId),
    );
    if (!sameSet(actualEvidence, claim.evidence)) {
      errors.push(`${claim.id}: Evidence/relation reverse-link mismatch`);
    }
  }
}

const negativeClaims = [...parsed['qwen-code'].claims.values()].filter(
  (claim) => claim.assessment.S === 'Not supported',
);
const negativeEvidence = evidence.get('EVD-qwen-code-DOC-044');
if (
  negativeClaims.length !== 1 ||
  negativeClaims[0]?.id !== 'CCQ-qwen-code-CAP-10.08-A01-001' ||
  !negativeClaims[0]?.statement.includes('后续工作') ||
  negativeClaims[0]?.assessment.F !== 'announced' ||
  negativeClaims[0]?.assessment.C !== 'Medium' ||
  !negativeClaims[0]?.evidence.has('EVD-qwen-code-DOC-044') ||
  !negativeEvidence?.boundedObservation.includes('feature negotiation') ||
  !negativeEvidence?.boundedObservation.includes('后续工作')
) {
  errors.push('scoped negative Claim boundary drift');
}

const qwenClaims = [...parsed['qwen-code'].claims.values()];
const bridgeDefaultClaim = qwenClaims.find(
  (claim) => claim.atomic === 'CAP-01.09-A02',
);
if (bridgeDefaultClaim?.assessment.S !== 'Unknown') {
  errors.push('Help-only bridge default must remain support_state=Unknown');
}

const initialSchemaEvidence = evidence.get('EVD-codex-RUNTIME-002');
const timedSchemaEvidence = evidence.get('EVD-codex-RUNTIME-003');
if (
  initialSchemaEvidence?.capturedAt !== '2026-07-26T04:06:35Z' ||
  !initialSchemaEvidence?.boundedObservation.includes(
    '269604d34ee339f861c82ac504459b2ffcb90d1cfc71566074817ab502475458',
  ) ||
  timedSchemaEvidence?.capturedAt !== '2026-07-26T04:42:46Z' ||
  !timedSchemaEvidence?.boundedObservation.includes('2026-07-26T04:42:45Z') ||
  !timedSchemaEvidence?.boundedObservation.includes(
    '33e163c58a7e9c276f18e109d7ac361f01f8c2394881fc8e3f3177efeaed7cf3',
  )
) {
  errors.push('Codex immutable schema Evidence chronology drift');
}
const codexSchemaClaims = [...parsed.codex.claims.values()].filter((claim) =>
  claim.facts.has('FACT-codex-047'),
);
if (
  codexSchemaClaims.length !== 4 ||
  codexSchemaClaims.some(
    (claim) =>
      claim.evidence.has('EVD-codex-RUNTIME-002') ||
      !claim.evidence.has('EVD-codex-RUNTIME-003'),
  )
) {
  errors.push('Codex formal schema Claims must use timed RUNTIME-003');
}

const imArtifactEvidence = evidence.get('EVD-qwen-code-SOURCE-009');
const imClaims = qwenClaims.filter((claim) =>
  claim.atomic.startsWith('CAP-10.11-'),
);
const imArtifactRelations = parsed['qwen-code'].relations.filter(
  (record) => record.evidenceId === 'EVD-qwen-code-SOURCE-009',
);
if (
  imClaims.length !== 3 ||
  imClaims.some((claim) => !claim.evidence.has('EVD-qwen-code-SOURCE-009')) ||
  imArtifactRelations.length !== 3 ||
  imArtifactRelations.some((record) => record.relation !== 'qualifies') ||
  imArtifactEvidence?.surface !== 'im-bot' ||
  imArtifactEvidence?.version !== '0.21.0' ||
  imArtifactEvidence?.channel !== 'stable' ||
  !imArtifactEvidence?.boundedObservation.includes(
    'ecc29064caa2bf14f7ead051d07e759f374ecac815a1dd1cdde9ff7aaaac248e',
  ) ||
  !imArtifactEvidence?.boundedObservation.includes('SessionRouter.resolve')
) {
  errors.push('Qwen IM Bot release-artifact attribution drift');
}

const daemonLogClaim = qwenClaims.find(
  (claim) => claim.atomic === 'CAP-12.02-A02',
);
const daemonLogHelpRelation = parsed['qwen-code'].relations.find(
  (record) =>
    record.claimId === daemonLogClaim?.id &&
    record.evidenceId === 'EVD-qwen-code-HELP-005',
);
if (daemonLogHelpRelation?.relation !== 'qualifies') {
  errors.push('daemon log Help relation must only qualify');
}

const allIdsByGroup = new Map();
for (const [product, relativePath] of Object.entries(cliFiles)) {
  const cliClaims = parseClaims(read(relativePath), product);
  const secondaryClaims = parsed[product].claims;
  for (const claim of [...cliClaims.values(), ...secondaryClaims.values()]) {
    const match = claim.id.match(/^(CCQ-.+-CAP-\d{2}\.\d{2}-A\d{2})-(\d{3})$/);
    if (!match) {
      errors.push(`invalid Claim ID ${claim.id}`);
      continue;
    }
    const sequence = Number(match[2]);
    const values = allIdsByGroup.get(match[1]) ?? [];
    values.push(sequence);
    allIdsByGroup.set(match[1], values);
  }
}
for (const [group, sequences] of allIdsByGroup) {
  const sorted = [...sequences].sort((a, b) => a - b);
  const expected = Array.from(
    { length: sorted.at(-1) },
    (_, index) => index + 1,
  );
  if (JSON.stringify(sorted) !== JSON.stringify(expected)) {
    errors.push(`${group}: non-contiguous or duplicate sequence`);
  }
}

const coverage = read('09-phase-1c2-coverage-and-open-claims.md');
const productLabels = {
  codex: 'Codex',
  'claude-code': 'Claude Code',
  'qwen-code': 'Qwen Code',
};

function surfaceDistribution(claims) {
  const counts = countValues(
    [...claims.values()].map(
      (claim) => parsed[claim.product].slices.get(claim.sliceId)?.surface,
    ),
  );
  delete counts.undefined;
  return Object.entries(counts)
    .map(([surface, count]) => `${surface} ${count}`)
    .join(', ');
}

const coverageSection = section(
  coverage,
  '## 2. 正式 Claim 覆盖',
  '### 2.1 Support state',
);
const derivedCoverage = {};
for (const [product, label] of Object.entries(productLabels)) {
  const claims = parsed[product].claims;
  const expected = [
    claims.size,
    new Set([...claims.values()].map((claim) => claim.atomic)).size,
    new Set([...claims.values()].flatMap((claim) => [...claim.facts])).size,
    new Set([...claims.values()].map((claim) => claim.sliceId)).size,
  ];
  const expectedSurface = claims.size ? surfaceDistribution(claims) : 'none';
  derivedCoverage[product] = { expected, expectedSurface };
  const row = rowByLabel(coverageSection, label);
  const actual = row?.slice(1, 5).map(numericCell);
  if (
    !row ||
    JSON.stringify(actual) !== JSON.stringify(expected) ||
    strip(row[5]) !== expectedSurface
  ) {
    errors.push(`coverage summary drift for ${label}`);
  }
}

const coverageTotalRow = rowByLabel(coverageSection, '合计');
const coverageTotals = Object.values(derivedCoverage).reduce(
  (total, row) => ({
    claims: total.claims + row.expected[0],
    facts: total.facts + row.expected[2],
    slices: total.slices + row.expected[3],
  }),
  { claims: 0, facts: 0, slices: 0 },
);
const totalSurface = surfaceDistribution(
  new Map(Object.values(parsed).flatMap(({ claims }) => [...claims.entries()])),
);
if (
  !coverageTotalRow ||
  numericCell(coverageTotalRow[1]) !== coverageTotals.claims ||
  strip(coverageTotalRow[2]) !== 'product-scoped' ||
  numericCell(coverageTotalRow[3]) !== coverageTotals.facts ||
  numericCell(coverageTotalRow[4]) !== coverageTotals.slices ||
  strip(coverageTotalRow[5]) !== totalSurface
) {
  errors.push('coverage total row drift');
}

const supportSection = section(
  coverage,
  '### 2.1 Support state',
  '### 2.2 Epistemic、runtime、confidence 与 lifecycle',
);
const supportStates = ['Supported', 'Partial', 'Not supported', 'Unknown'];
const supportTotals = Object.fromEntries(
  supportStates.map((state) => [state, 0]),
);
for (const [product, label] of Object.entries(productLabels)) {
  const counts = countValues(
    [...parsed[product].claims.values()].map((claim) => claim.assessment.S),
  );
  const expected = supportStates.map((state) => counts[state] ?? 0);
  for (const [index, state] of supportStates.entries()) {
    supportTotals[state] += expected[index];
  }
  const row = rowByLabel(supportSection, label);
  const actual = row?.slice(1, 5).map(numericCell);
  if (!row || JSON.stringify(actual) !== JSON.stringify(expected)) {
    errors.push(`support summary drift for ${label}`);
  }
}
const supportTotalRow = rowByLabel(supportSection, '合计');
if (
  !supportTotalRow ||
  JSON.stringify(supportTotalRow.slice(1, 5).map(numericCell)) !==
    JSON.stringify(supportStates.map((state) => supportTotals[state]))
) {
  errors.push('support total row drift');
}

const contractExpected = {
  Codex: [106, 33, 73, 0, 0],
  'Claude Code': [0, 0, 0, 0, 0],
  'Qwen Code': [289, 15, 273, 0, 1],
};
const contractSection = section(
  coverage,
  '## 3. Behavior Contract 填写度',
  '## 4. Product Blocked Register',
);
const contractTotals = [0, 0, 0, 0, 0];
for (const [product, label] of Object.entries(productLabels)) {
  const summary = [0, 0, 0, 0, 0];
  for (const claim of parsed[product].claims.values()) {
    const contract = parsed[product].contracts.get(claim.id);
    const required = registry.get(claim.atomic)?.required ?? new Set();
    for (const leaf of required) {
      summary[0]++;
      const value = contract?.[leaf];
      if (value?.startsWith('R[')) summary[1]++;
      else if (value === 'NC') summary[2]++;
      else if (value === 'U') summary[3]++;
      else if (value === 'NA') summary[4]++;
    }
  }
  summary.forEach((value, index) => {
    contractTotals[index] += value;
  });
  const row = rowByLabel(contractSection, label);
  const actual = row?.slice(1, 6).map(numericCell);
  if (!row || JSON.stringify(actual) !== JSON.stringify(summary)) {
    errors.push(`contract coverage drift for ${label}`);
  }
  if (JSON.stringify(summary) !== JSON.stringify(contractExpected[label])) {
    errors.push(`frozen contract inventory drift for ${label}`);
  }
  if (summary[0] !== summary.slice(1).reduce((sum, value) => sum + value, 0)) {
    errors.push(`unaccounted required contract state for ${label}`);
  }
}
const contractTotalRow = rowByLabel(contractSection, '合计');
if (
  !contractTotalRow ||
  JSON.stringify(contractTotalRow.slice(1, 6).map(numericCell)) !==
    JSON.stringify(contractTotals)
) {
  errors.push('contract total row drift');
}

for (const requiredText of [
  '40 - 18 = 22',
  '5 Atomics × 3 languages = 15',
  'qwen_cli_version',
  'starts a new session',
  'CAP-12.03-A03',
  'Secondary subtotal',
  'exact target Slice ready = `0`',
  'EVD-codex-HELP-006',
  'EVD-codex-RUNTIME-003',
  'EVD-qwen-code-DOC-044',
  'EVD-qwen-code-SOURCE-009',
]) {
  if (!coverage.includes(requiredText)) {
    errors.push(`coverage report missing invariant: ${requiredText}`);
  }
}

const probeCatalog = read('probes/02-secondary-surface-runtime-probes.md');
const probeLastUpdated = probeCatalog.match(
  /^> Last updated：(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z)/m,
)?.[1];
if (
  !probeLastUpdated ||
  !timedSchemaEvidence ||
  probeLastUpdated < timedSchemaEvidence.capturedAt ||
  !probeCatalog.includes('2026-07-26T04:42:45Z') ||
  !probeCatalog.includes('EVD-codex-RUNTIME-003')
) {
  errors.push('runtime probe catalog timestamp/evidence drift');
}

if (allRelations.length !== 62) {
  errors.push(`expected 62 expanded relations, got ${allRelations.length}`);
}
const relationCounts = countValues(
  allRelations.map((record) => `${record.product}:${record.relation}`),
);
if (
  !sameObject(relationCounts, {
    'codex:qualifies': 15,
    'codex:supports': 5,
    'qwen-code:qualifies': 11,
    'qwen-code:supports': 31,
  })
) {
  errors.push('expanded Evidence relation distribution drift');
}

const relationSection = section(
  coverage,
  '## 6. Evidence Relation 闭合',
  '## 7. Review Gate',
);
const relationTypes = ['supports', 'qualifies', 'contradicts'];
const relationTotals = [0, 0, 0, 0];
for (const [product, label] of Object.entries(productLabels)) {
  const counts = countValues(
    parsed[product].relations.map((record) => record.relation),
  );
  const expected = relationTypes.map((type) => counts[type] ?? 0);
  expected.push(expected.reduce((sum, value) => sum + value, 0));
  expected.forEach((value, index) => {
    relationTotals[index] += value;
  });
  const row = rowByLabel(relationSection, label);
  const actual = row?.slice(1, 5).map(numericCell);
  if (!row || JSON.stringify(actual) !== JSON.stringify(expected)) {
    errors.push(`relation summary drift for ${label}`);
  }
}
const relationTotalRow = rowByLabel(relationSection, '合计');
if (
  !relationTotalRow ||
  JSON.stringify(relationTotalRow.slice(1, 5).map(numericCell)) !==
    JSON.stringify(relationTotals)
) {
  errors.push('relation total row drift');
}

const normalization = read('08-phase-1c2-secondary-surface-normalization.md');
if (preFreeze) {
  if (!normalization.includes('> 状态：Reviewing')) {
    errors.push('pre-freeze normalization status must be Reviewing');
  }
} else {
  if (
    !normalization.includes('> 状态：Frozen') ||
    normalization.includes('Frozen at：pending') ||
    !coverage.includes('> 状态：Frozen') ||
    coverage.includes('Frozen at：pending')
  ) {
    errors.push('Phase 1C.2 is not frozen');
  }
  const gate = section(coverage, '## 7. Review Gate', '## 8. 下一阶段入口');
  if (gate.includes('Pending') || !gate.includes('Pass')) {
    errors.push('Review Gate is not fully passed');
  }
}

try {
  buildPhase1C2({ write: false, check: true });
} catch (error) {
  errors.push(`generator idempotency: ${error.message}`);
}

const formattedFiles = [
  '08-phase-1c2-secondary-surface-normalization.md',
  '09-phase-1c2-coverage-and-open-claims.md',
  'claims/codex-secondary-surfaces.md',
  'claims/claude-code-secondary-surfaces.md',
  'claims/qwen-code-secondary-surfaces.md',
  'evidence/phase-1c2-secondary-surfaces.md',
  'probes/02-secondary-surface-runtime-probes.md',
  'scripts/generate-phase-1c2-claims.mjs',
  'scripts/validate-phase-1c2.mjs',
].map((relativePath) => path.join(root, relativePath));

if (fs.existsSync(prettier)) {
  try {
    execFileSync(
      prettier,
      ['--check', '--ignore-path', '/dev/null', ...formattedFiles],
      {
        cwd: repoRoot,
        stdio: 'pipe',
      },
    );
  } catch {
    errors.push('Phase 1C.2 files fail Prettier --check');
  }
}

for (const relativePath of Object.values(productFiles)) {
  try {
    execFileSync('git', ['check-ignore', '-q', path.join(root, relativePath)], {
      cwd: repoRoot,
      stdio: 'ignore',
    });
  } catch {
    errors.push(`${relativePath}: research artifact is not ignored`);
  }
}

if (errors.length) {
  process.stderr.write(`${errors.join('\n')}\n`);
  process.exit(1);
}

process.stdout.write(
  `Phase 1C.2 validation passed: ${allSecondaryIds.size} claims, ${allRelations.length} relations, ${preFreeze ? 'pre-freeze' : 'frozen'} mode\n`,
);
