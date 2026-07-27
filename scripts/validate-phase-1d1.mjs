#!/usr/bin/env node

import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(scriptDir, '..');
const repoRoot = path.resolve(root, '../../..');
const prettier = path.join(repoRoot, 'node_modules', '.bin', 'prettier');
const reviewedAt = '2026-07-26T07:51:04Z';
const registryHash =
  '95deccb0c7c056b6e89e092ae6b9187e459afd7e0c680f6e972ec2a2c13997f5';

const productFiles = {
  codex: 'claims/phase-1d1/codex-secondary-surfaces.md',
  'claude-code': 'claims/phase-1d1/claude-code-secondary-surfaces.md',
  'qwen-code': 'claims/phase-1d1/qwen-code-secondary-surfaces.md',
};

const frozenProductFiles = {
  codex: 'claims/codex-secondary-surfaces.md',
  'claude-code': 'claims/claude-code-secondary-surfaces.md',
  'qwen-code': 'claims/qwen-code-secondary-surfaces.md',
};

const frozenFiles = {
  '00-scope-and-version-lock.md':
    'fd178ab9b197f118c90c2db5efcac780ee2465a282585ec1df96a58f86198373',
  'evidence/qwen-code.md':
    'b6a52ba2108001e765fb244b76c408ba93308f9649456eab1a68224b39afddd2',
  'facts/qwen-code.md':
    'ccaed2f4c3fd91b0efa4dc698ed8715faaaf05c066039636ff44bef5a2569ddf',
  'claims/codex-secondary-surfaces.md':
    '6ee967624d24f22186e616ab2d7b80b8d0e7478c6fab1cebf2394fce7eb18ffd',
  'claims/claude-code-secondary-surfaces.md':
    'b96ae3bf31092a93f495d13b6f0207738eeb24cd33b982e0e300c64ad0c48925',
  'claims/qwen-code-secondary-surfaces.md':
    '3c10f0e7011ea16b1cb3b077cdb280bca73a189b68bbe34d50b6c6a0d022931a',
  'evidence/phase-1c2-secondary-surfaces.md':
    '0d2ac2aa89e0b72eabefd6bff87e547c12e2918776a6e712347a84a81ec080eb',
  '08-phase-1c2-secondary-surface-normalization.md':
    '7bd511e6b57f3592587b87daffb4333a6077e5acbf922ff3a273066b27111bf6',
  '09-phase-1c2-coverage-and-open-claims.md':
    'd40b069792fe781c49711dde91385534626f6a598670148a60bd1bfbf9ab53be',
  'evidence/phase-1d-runtime-probes.md':
    'bc71b5853da3fc06edad28e07e6c10e59d0cdb9ee6114560b0be854053e2c481',
  'evidence/phase-1d1-identity-errata.md':
    '2cb12201a9991cd91375067b411cfeb3d0afb382ba4d42b1bbd3ea0e4e4e92db',
};

const expectedCounts = {
  codex: 11,
  'claude-code': 0,
  'qwen-code': 27,
};

const expectedSupport = {
  codex: { Unknown: 11 },
  'claude-code': {},
  'qwen-code': {
    Supported: 3,
    Partial: 2,
    'Not supported': 1,
    Unknown: 21,
  },
};

const expectedRuntime = {
  codex: {
    Reproduced: 4,
    'Not reproduced': 2,
    'Not tested': 5,
  },
  'claude-code': {},
  'qwen-code': {
    Reproduced: 5,
    'Not tested': 22,
  },
};

const expectedConfidence = {
  codex: { Medium: 11 },
  'claude-code': {},
  'qwen-code': { High: 2, Medium: 25 },
};

const expectedSlices = {
  codex: 4,
  'claude-code': 0,
  'qwen-code': 3,
};

const newEvidenceEdges = new Map([
  [
    'EVD-qwen-code-RUNTIME-001',
    new Set([
      'supports:CCQ-qwen-code-CAP-10.07-A01-002',
      'supports:CCQ-qwen-code-CAP-10.08-A04-001',
      'supports:CCQ-qwen-code-CAP-12.05-A01-002',
    ]),
  ],
  [
    'EVD-qwen-code-RUNTIME-002',
    new Set([
      'supports:CCQ-qwen-code-CAP-12.02-A02-002',
      'supports:CCQ-qwen-code-CAP-12.07-A03-002',
    ]),
  ],
  [
    'EVD-codex-RUNTIME-004',
    new Set([
      'supports:CCQ-codex-CAP-10.07-A01-003',
      'qualifies:CCQ-codex-CAP-10.08-A05-002',
    ]),
  ],
  ['EVD-codex-RUNTIME-005', new Set(['supports:CCQ-codex-CAP-10.07-A01-004'])],
  [
    'EVD-codex-SOURCE-002',
    new Set([
      'supports:CCQ-codex-CAP-10.08-A05-001',
      'supports:CCQ-codex-CAP-10.08-A05-002',
    ]),
  ],
  [
    'EVD-codex-SOURCE-003',
    new Set([
      'supports:CCQ-codex-CAP-07.04-A01-001',
      'qualifies:CCQ-codex-CAP-07.04-A02-001',
    ]),
  ],
  [
    'EVD-qwen-code-DOC-044',
    new Set([
      'supports:CCQ-qwen-code-CAP-10.08-A01-001',
      'supports:CCQ-qwen-code-CAP-10.08-A04-001',
    ]),
  ],
]);

const additiveStableEvidence = new Map([
  ['CCQ-codex-CAP-07.04-A01-001', new Set(['EVD-codex-SOURCE-003'])],
  ['CCQ-codex-CAP-07.04-A02-001', new Set(['EVD-codex-SOURCE-003'])],
]);

const newCurrentClaimIds = new Set([
  'CCQ-codex-CAP-10.07-A01-003',
  'CCQ-codex-CAP-10.07-A01-004',
  'CCQ-codex-CAP-10.08-A05-001',
  'CCQ-codex-CAP-10.08-A05-002',
  'CCQ-qwen-code-CAP-10.07-A01-002',
  'CCQ-qwen-code-CAP-10.08-A04-001',
  'CCQ-qwen-code-CAP-12.02-A02-002',
  'CCQ-qwen-code-CAP-12.05-A01-002',
  'CCQ-qwen-code-CAP-12.07-A03-002',
]);

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

const controlledSliceEnums = {
  channel: new Set(['stable', 'latest', 'preview', 'alpha', 'nightly', 'dev']),
  surface: new Set([
    'cli',
    'ide',
    'desktop',
    'web-cloud',
    'sdk-daemon',
    'ci',
    'im-bot',
  ]),
  terminal: new Set(['tty', 'non-tty', 'both', 'not-applicable', 'unknown']),
  isolation: new Set([
    'host',
    'container',
    'vm',
    'remote',
    'other',
    'not-applicable',
    'unknown',
  ]),
};

const assessmentEnums = {
  E: new Set(['Confirmed', 'Inferred', 'Unknown']),
  D: new Set(['Documented', 'Undocumented', 'Not checked', 'Not applicable']),
  R: new Set(['Reproduced', 'Not reproduced', 'Not tested', 'Not applicable']),
  S: new Set(['Supported', 'Partial', 'Not supported', 'Unknown']),
  L: new Set([
    'stable',
    'preview',
    'experimental',
    'alpha',
    'deprecated',
    'removed',
    'dev-only',
    'unknown',
    'not-checked',
    'not-applicable',
  ]),
  F: new Set([
    'none',
    'announced',
    'roadmap',
    'unknown',
    'not-checked',
    'not-applicable',
  ]),
  C: new Set(['High', 'Medium', 'Low']),
};

function sha256(data) {
  return createHash('sha256').update(data).digest('hex');
}

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

function parseRegistry() {
  const content = read('03-atomic-capability-registry.md');
  const revision = Number(content.match(/^revision: (\d+)$/m)?.[1]);
  const topicCount = Number(content.match(/^topic_count: (\d+)$/m)?.[1]);
  const recordCount = Number(content.match(/^record_count: (\d+)$/m)?.[1]);
  const frozenAt = content.match(/^frozen_at: (.+)$/m)?.[1];
  const records = new Map();
  const topics = new Map();
  const unknownDimensions = new Set();
  for (const line of content.split('\n')) {
    if (!line.startsWith('| `CAP-')) continue;
    const cells = splitRow(line);
    if (cells.length !== 5) continue;
    const atomic = ids(cells[0], 'CAP-')[0];
    if (!/^CAP-\d{2}\.\d{2}-A\d{2}$/.test(atomic ?? '')) continue;
    const dimensions = strip(cells[3])
      .split(',')
      .map((value) => value.trim());
    for (const dimension of dimensions) {
      if (!(dimension in dimensionLeaves)) unknownDimensions.add(dimension);
    }
    const required = new Set(
      dimensions.flatMap((dimension) => dimensionLeaves[dimension] ?? []),
    );
    if (records.has(atomic)) throw new Error(`duplicate Atomic ${atomic}`);
    records.set(atomic, {
      id: atomic,
      job: cells[1],
      outcome: cells[2],
      dimensions,
      required,
      boundary: cells[4],
    });
    const topic = atomic.replace(/-A\d{2}$/, '');
    const sequence = Number(atomic.match(/-A(\d{2})$/)?.[1]);
    const topicSequences = topics.get(topic) ?? [];
    topicSequences.push(sequence);
    topics.set(topic, topicSequences);
  }
  return {
    content,
    revision,
    topicCount,
    recordCount,
    frozenAt,
    records,
    topics,
    unknownDimensions,
  };
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
    if (result.has(sliceId)) throw new Error(`duplicate Slice ${sliceId}`);
    result.set(sliceId, {
      id: sliceId,
      product: cells[1],
      version: strip(cells[2]),
      channel: cells[3],
      surface: cells[4],
      os: cells[5],
      arch: cells[6],
      shell: cells[7],
      terminal: cells[8],
      isolation: cells[9],
      authentication: cells[10],
      entitlement: cells[11],
      region: cells[12],
      provider: cells[13],
      model: cells[14],
      configuration: cells[15],
      featureFlags: cells[16],
    });
  }
  return result;
}

function parseAssessment(value) {
  const entries = value.split('; ').map((part) => {
    const index = part.indexOf('=');
    return [part.slice(0, index), part.slice(index + 1)];
  });
  return {
    entries,
    values: Object.fromEntries(entries),
  };
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
    const id = strip(cells[0]);
    if (result.has(id)) throw new Error(`${product}: duplicate Claim ${id}`);
    const factList = ids(cells[3], 'FACT-');
    const evidenceList = ids(cells[7], 'EVD-');
    const assessment = parseAssessment(cells[6]);
    result.set(id, {
      id,
      product,
      atomic: strip(cells[1]),
      sliceId: strip(cells[2]),
      facts: new Set(factList),
      factList,
      userJob: cells[4],
      statement: cells[5],
      assessment: assessment.values,
      assessmentEntries: assessment.entries,
      evidence: new Set(evidenceList),
      evidenceList,
      environment: cells[8],
      conflicts: cells[9],
      limitations: cells[10],
      checked: cells[11],
      comparableCells: cells.slice(1, 11),
    });
  }
  return result;
}

function parseContracts(content) {
  const result = new Map();
  const contractContent = section(
    content,
    '## 3. Behavior Contract Matrix',
    '## 4. Evidence Relation Extension',
  );
  for (const line of contractContent.split('\n')) {
    if (!line.startsWith('| `CCQ-')) continue;
    const cells = splitRow(line);
    if (cells.length !== 17) {
      throw new Error('invalid Behavior Contract column count');
    }
    const id = strip(cells[0]);
    if (result.has(id)) throw new Error(`duplicate Contract ${id}`);
    result.set(
      id,
      Object.fromEntries(
        leafOrder.map((leaf, index) => [leaf, strip(cells[index + 1])]),
      ),
    );
  }
  return result;
}

function parseRelations(content) {
  const result = [];
  const relationContent = section(
    content,
    '## 4. Evidence Relation Extension',
    null,
  );
  for (const line of relationContent.split('\n')) {
    if (!line.startsWith('| `EVD-')) continue;
    const cells = splitRow(line);
    if (cells.length !== 4) {
      throw new Error('invalid Evidence Relation column count');
    }
    for (const claimId of ids(cells[2], 'CCQ-')) {
      result.push({
        evidenceId: strip(cells[0]),
        relation: strip(cells[1]),
        claimId,
        note: cells[3],
      });
    }
  }
  return result;
}

function parseProductFile(relativePath, product) {
  const content = read(relativePath);
  if (
    product === 'claude-code' &&
    content.includes('> 正式 Claim：0') &&
    !content.includes('## 1. Slice Registry')
  ) {
    return {
      content,
      slices: new Map(),
      claims: new Map(),
      contracts: new Map(),
      relations: [],
      zeroClaimExplanation: true,
    };
  }
  return {
    content,
    slices: parseSlices(content),
    claims: parseClaims(content, product),
    contracts: parseContracts(content),
    relations: parseRelations(content),
    zeroClaimExplanation: false,
  };
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

function relationKey(record, mapClaimId = (id) => id) {
  return `${record.evidenceId}\u0000${record.relation}\u0000${mapClaimId(record.claimId)}\u0000${record.note}`;
}

function relationIdentity(record) {
  return `${record.evidenceId}\u0000${record.relation}\u0000${record.claimId}`;
}

function parseFactIds(product) {
  const content = read(`facts/${product}.md`);
  const result = new Set();
  const pattern = new RegExp(`^FACT-${product}-\\d+$`);
  for (const line of content.split('\n')) {
    if (!line.startsWith('| `FACT-')) continue;
    const cells = splitRow(line);
    const factId = strip(cells[0] ?? '');
    if (!pattern.test(factId)) continue;
    if (result.has(factId)) throw new Error(`duplicate Fact record ${factId}`);
    result.add(factId);
  }
  return result;
}

function parsePhase1DEvidenceRecords() {
  const content = read('evidence/phase-1d-runtime-probes.md');
  const records = new Map();
  for (const match of content.matchAll(
    /^### `(EVD-[^`]+)`\n\n```yaml\n([\s\S]*?)\n```/gmu,
  )) {
    const headingId = match[1];
    const yaml = match[2];
    const value = (key) =>
      yaml.match(new RegExp(`^${key}:\\s*(.+)$`, 'm'))?.[1]?.trim();
    const record = {
      id: value('evidence_id'),
      type: value('evidence_type'),
      product: value('product'),
      version: value('version'),
      channel: value('release_channel'),
      surface: value('product_surface'),
    };
    if (headingId !== record.id) {
      throw new Error(
        `Phase 1D Evidence heading/YAML identity mismatch: ${headingId}`,
      );
    }
    if (records.has(record.id)) {
      throw new Error(`duplicate Phase 1D Evidence record ${record.id}`);
    }
    records.set(record.id, record);
  }
  return records;
}

function tableRowById(relativePath, recordId) {
  for (const line of read(relativePath).split('\n')) {
    if (!line.startsWith('|') || !line.includes(`\`${recordId}\``)) continue;
    const cells = splitRow(line);
    if (strip(cells[0]) === recordId) return cells;
  }
  throw new Error(`${relativePath}: missing table row ${recordId}`);
}

function versionChannel(value) {
  const match = strip(value).match(/^(\S+)\s*\/\s*(\S+)$/);
  if (!match) throw new Error(`invalid version/channel cell: ${value}`);
  return { version: match[1], channel: match[2] };
}

function qwenEvidenceMetadata(evidenceId) {
  const phase1B = new Set([
    'EVD-qwen-code-HELP-005',
    'EVD-qwen-code-DOC-018',
    'EVD-qwen-code-DOC-028',
    'EVD-qwen-code-DOC-043',
  ]);
  const phase1C2 = new Set([
    'EVD-qwen-code-DOC-044',
    'EVD-qwen-code-SOURCE-009',
  ]);
  if (phase1B.has(evidenceId)) {
    const ledger = read('evidence/qwen-code.md');
    const row = tableRowById('evidence/qwen-code.md', evidenceId);
    return {
      id: evidenceId,
      product: ledger.includes('> Product：Qwen Code') ? 'Qwen Code' : null,
      version: ledger.match(/> 冻结版本：`([^`]+)`/)?.[1],
      channel: ledger.match(/> 冻结版本：`[^`]+` · `([^`]+)`/)?.[1],
      surface: strip(row[2]),
    };
  }
  const relativePath = phase1C2.has(evidenceId)
    ? 'evidence/phase-1c2-secondary-surfaces.md'
    : 'evidence/phase-1d-runtime-probes.md';
  const row = tableRowById(relativePath, evidenceId);
  return {
    id: evidenceId,
    product: 'Qwen Code',
    ...versionChannel(row[2]),
    surface: strip(row[3]),
  };
}

function qwenFactMetadata(factId) {
  const row = tableRowById('facts/qwen-code.md', factId);
  return {
    id: factId,
    product: 'Qwen Code',
    ...versionChannel(row[2]),
    surfaces: new Set(
      strip(row[3])
        .split('/')
        .map((value) => value.trim()),
    ),
  };
}

function yamlList(block, key) {
  const lines = block.split('\n');
  const start = lines.findIndex((line) => line.trim() === `${key}:`);
  if (start < 0) return [];
  const values = [];
  for (const line of lines.slice(start + 1)) {
    const match = line.match(/^\s+- (.+)$/);
    if (!match) break;
    values.push(match[1].trim());
  }
  return values;
}

function headingSlug(value) {
  return value
    .trim()
    .toLowerCase()
    .replaceAll(/[`*_~]/g, '')
    .replaceAll(/[^\p{Letter}\p{Number}\s-]/gu, '')
    .replaceAll(/\s+/g, '-');
}

function validateLocalLinks(relativePath) {
  const content = read(relativePath);
  for (const match of content.matchAll(/!?\[[^\]]*]\(([^)]+)\)/g)) {
    let target = match[1].trim();
    if (/^(?:https?:|mailto:|data:)/.test(target) || target.startsWith('#')) {
      continue;
    }
    if (target.startsWith('<') && target.endsWith('>')) {
      target = target.slice(1, -1);
    }
    const [filePart, fragment] = target.split('#', 2);
    const resolved = path.resolve(
      path.dirname(path.join(root, relativePath)),
      filePart,
    );
    check(
      resolved.startsWith(`${root}${path.sep}`) || resolved === root,
      `${relativePath}: local link escapes research root: ${target}`,
    );
    check(
      fs.existsSync(resolved),
      `${relativePath}: broken local link ${target}`,
    );
    if (fragment && fs.existsSync(resolved) && fs.statSync(resolved).isFile()) {
      const linked = fs.readFileSync(resolved, 'utf8');
      const slugs = new Set(
        [...linked.matchAll(/^#{1,6}\s+(.+)$/gm)].map((heading) =>
          headingSlug(heading[1]),
        ),
      );
      check(
        slugs.has(decodeURIComponent(fragment).toLowerCase()),
        `${relativePath}: broken local anchor ${target}`,
      );
    }
  }
}

function validateFrozenDocument(relativePath) {
  const content = read(relativePath);
  check(
    content.includes('> 状态：Frozen'),
    `${relativePath}: status must be Frozen`,
  );
  check(
    content.includes(`> Frozen at：${reviewedAt}`),
    `${relativePath}: Frozen at drift`,
  );
  const gate = section(content, 'Review Gate', null);
  let gateRows = 0;
  for (const line of gate.split('\n')) {
    if (!line.startsWith('|')) continue;
    const cells = splitRow(line);
    if (cells.length !== 2 || strip(cells[0]) === 'Gate') continue;
    if (/^-+$/.test(strip(cells[0]))) continue;
    gateRows++;
    check(
      strip(cells[1]) === 'Pass',
      `${relativePath}: Review Gate is not Pass: ${strip(cells[0])}`,
    );
  }
  check(gateRows > 0, `${relativePath}: Review Gate has no rows`);
}

function claimById(parsed, id) {
  for (const product of Object.values(parsed)) {
    const claim = product.claims.get(id);
    if (claim) return { claim, product };
  }
  throw new Error(`missing Claim ${id}`);
}

const errors = [];
function check(condition, message) {
  if (!condition) errors.push(message);
}

for (const [relativePath, expectedHash] of Object.entries(frozenFiles)) {
  const raw = fs.readFileSync(path.join(root, relativePath));
  check(
    sha256(raw) === expectedHash,
    `${relativePath}: frozen input hash drift`,
  );
}
check(
  sha256(
    fs.readFileSync(path.join(root, '03-atomic-capability-registry.md')),
  ) === registryHash,
  '03-atomic-capability-registry.md: frozen Registry Revision 2 hash drift',
);

const registry = parseRegistry();
check(registry.revision === 2, 'Registry revision must be 2');
check(registry.topicCount === 144, 'Registry topic_count must be 144');
check(registry.recordCount === 550, 'Registry record_count must be 550');
check(registry.frozenAt === reviewedAt, 'Registry frozen_at drift');
check(registry.records.size === 550, 'Registry table must contain 550 records');
check(registry.topics.size === 144, 'Registry table must contain 144 topics');
check(
  registry.unknownDimensions.size === 0,
  `Registry contains uncontrolled dimensions: ${[...registry.unknownDimensions].join(', ')}`,
);
for (const [topic, sequences] of registry.topics) {
  const sorted = [...sequences].sort((left, right) => left - right);
  const expected = Array.from(
    { length: sorted.length },
    (_, index) => index + 1,
  );
  check(
    JSON.stringify(sorted) === JSON.stringify(expected),
    `${topic}: Atomic IDs must be continuous from A01`,
  );
}
const capabilityMapTopics = new Set(
  [...read('02-capability-map.md').matchAll(/\b(CAP-\d{2}\.\d{2})\b/g)].map(
    (match) => match[1],
  ),
);
check(
  capabilityMapTopics.size === 144 &&
    sameSet(capabilityMapTopics, new Set(registry.topics.keys())),
  'Registry topic set must exactly match the 144-topic capability map',
);
check(
  registry.content.includes('change_log:') &&
    registry.content.includes('  - revision: 1') &&
    registry.content.includes('  - revision: 2') &&
    registry.content.includes('affected_ids:') &&
    registry.content.includes('CAP-10.08-A01') &&
    registry.content.includes('CAP-10.08-A04') &&
    registry.content.includes('CAP-10.08-A05') &&
    registry.content.includes('CAP-10.08-A01 保留为双向协议和能力协商') &&
    registry.content.includes(
      '单向对端 descriptor discovery 迁移到 CAP-10.08-A04',
    ) &&
    registry.content.includes(
      '客户端身份、版本和可选能力初始化迁移到 CAP-10.08-A05',
    ),
  'Registry Revision 2 change log or migration ledger incomplete',
);
const a01 = registry.records.get('CAP-10.08-A01');
const a04 = registry.records.get('CAP-10.08-A04');
const a05 = registry.records.get('CAP-10.08-A05');
check(
  a01?.boundary.includes('CAP-10.08-A04') &&
    a01?.boundary.includes('CAP-10.08-A05'),
  'CAP-10.08-A01 split boundary drift',
);
check(
  a04?.job === '发现对端公开的协议版本和能力清单' &&
    a04?.boundary.includes('CAP-10.08-A01') &&
    a04?.boundary.includes('CAP-10.08-A05'),
  'CAP-10.08-A04 Registry record drift',
);
check(
  a05?.job === '在连接建立时声明客户端身份和可选能力' &&
    a05?.boundary.includes('CAP-10.08-A01') &&
    a05?.boundary.includes('CAP-10.08-A04'),
  'CAP-10.08-A05 Registry record drift',
);

const identityErrata = read('evidence/phase-1d1-identity-errata.md');
const expectedErrataEvidence = new Set([
  'EVD-qwen-code-HELP-005',
  'EVD-qwen-code-DOC-018',
  'EVD-qwen-code-DOC-028',
  'EVD-qwen-code-DOC-043',
  'EVD-qwen-code-DOC-044',
  'EVD-qwen-code-SOURCE-009',
  'EVD-qwen-code-RUNTIME-001',
  'EVD-qwen-code-RUNTIME-002',
]);
const expectedErrataFacts = new Set([
  'FACT-qwen-code-004',
  'FACT-qwen-code-042',
  'FACT-qwen-code-050',
  'FACT-qwen-code-052',
  'FACT-qwen-code-053',
]);
const errataYaml = section(identityErrata, '```yaml', '```');
check(
  identityErrata.includes('> 状态：Frozen') &&
    identityErrata.includes(`> Frozen at：${reviewedAt}`) &&
    errataYaml.includes('erratum_id: ERR-P1D1-QWEN-CHANNEL-001') &&
    errataYaml.includes('applies_to: phase-1d1-current') &&
    errataYaml.includes('field: release_channel') &&
    errataYaml.includes('recorded_value: stable') &&
    errataYaml.includes('effective_value: latest') &&
    errataYaml.includes('identity_preserved: true'),
  'Qwen channel identity erratum metadata drift',
);
check(
  sameSet(
    new Set(yamlList(errataYaml, 'evidence_ids')),
    expectedErrataEvidence,
  ),
  'Qwen channel identity erratum Evidence allowlist drift',
);
check(
  sameSet(new Set(yamlList(errataYaml, 'fact_ids')), expectedErrataFacts),
  'Qwen channel identity erratum Fact allowlist drift',
);
check(
  sameSet(
    new Set(yamlList(errataYaml, 'immutable_fields')),
    new Set([
      'record_id',
      'product',
      'version',
      'surface',
      'source',
      'captured_at',
      'artifact_hash_or_observation',
      'relations',
    ]),
  ),
  'Qwen channel identity erratum immutable-field set drift',
);
check(
  /\| Qwen Code\s+\| `0\.21\.0`\s+\| npm `latest`/.test(
    read('00-scope-and-version-lock.md'),
  ),
  'Qwen version lock no longer establishes 0.21.0 npm latest',
);
const qwenEvidenceMetadataById = new Map();
for (const evidenceId of expectedErrataEvidence) {
  const metadata = qwenEvidenceMetadata(evidenceId);
  qwenEvidenceMetadataById.set(evidenceId, metadata);
  check(
    metadata.product === 'Qwen Code' &&
      metadata.version === '0.21.0' &&
      metadata.channel === 'stable' &&
      ['sdk-daemon', 'im-bot'].includes(metadata.surface),
    `${evidenceId}: raw erratum Evidence identity drift`,
  );
}
const qwenFactMetadataById = new Map();
for (const factId of expectedErrataFacts) {
  const metadata = qwenFactMetadata(factId);
  qwenFactMetadataById.set(factId, metadata);
  check(
    metadata.product === 'Qwen Code' &&
      metadata.version === '0.21.0' &&
      metadata.channel === 'stable' &&
      [...metadata.surfaces].every((surface) =>
        ['sdk-daemon', 'im-bot'].includes(surface),
      ),
    `${factId}: raw erratum Fact identity drift`,
  );
}

const phase1DEvidenceRecords = parsePhase1DEvidenceRecords();
const expectedPhase1DEvidenceIdentity = new Map([
  [
    'EVD-qwen-code-RUNTIME-001',
    {
      type: 'RUNTIME',
      product: 'Qwen Code',
      version: '0.21.0',
      channel: 'stable',
      surface: 'sdk-daemon',
    },
  ],
  [
    'EVD-qwen-code-RUNTIME-002',
    {
      type: 'RUNTIME',
      product: 'Qwen Code',
      version: '0.21.0',
      channel: 'stable',
      surface: 'sdk-daemon',
    },
  ],
  [
    'EVD-codex-RUNTIME-004',
    {
      type: 'RUNTIME',
      product: 'Codex',
      version: '0.145.0',
      channel: 'latest',
      surface: 'sdk-daemon',
    },
  ],
  [
    'EVD-codex-RUNTIME-005',
    {
      type: 'RUNTIME',
      product: 'Codex',
      version: '0.145.0',
      channel: 'latest',
      surface: 'sdk-daemon',
    },
  ],
  [
    'EVD-codex-SOURCE-002',
    {
      type: 'SOURCE',
      product: 'Codex',
      version: '0.145.0 / commit 25af12f7e61572b0bc18ddb1008be543b91519b0',
      channel: 'latest',
      surface: 'sdk-daemon',
    },
  ],
  [
    'EVD-codex-SOURCE-003',
    {
      type: 'SOURCE',
      product: 'Codex',
      version: '0.145.0 / commit 25af12f7e61572b0bc18ddb1008be543b91519b0',
      channel: 'latest',
      surface: 'sdk-daemon',
    },
  ],
]);
check(
  phase1DEvidenceRecords.size === expectedPhase1DEvidenceIdentity.size &&
    sameSet(
      new Set(phase1DEvidenceRecords.keys()),
      new Set(expectedPhase1DEvidenceIdentity.keys()),
    ),
  'Phase 1D Evidence record inventory drift',
);
for (const [evidenceId, expected] of expectedPhase1DEvidenceIdentity) {
  const actual = phase1DEvidenceRecords.get(evidenceId);
  check(
    Boolean(actual) &&
      Object.entries(expected).every(
        ([field, value]) => actual[field] === value,
      ),
    `${evidenceId}: raw Phase 1D Evidence identity drift`,
  );
}

const parsed = Object.fromEntries(
  Object.entries(productFiles).map(([product, relativePath]) => [
    product,
    parseProductFile(relativePath, product),
  ]),
);
const frozen = Object.fromEntries(
  Object.entries(frozenProductFiles).map(([product, relativePath]) => [
    product,
    parseProductFile(relativePath, product),
  ]),
);

const productLabels = {
  codex: 'Codex',
  'claude-code': 'Claude Code',
  'qwen-code': 'Qwen Code',
};
const factIdsByProduct = Object.fromEntries(
  Object.keys(productFiles).map((product) => [product, parseFactIds(product)]),
);
const allClaims = new Map();
const allRelations = [];
const relationIdentities = new Set();
for (const [product, productData] of Object.entries(parsed)) {
  check(
    productData.claims.size === expectedCounts[product],
    `${product}: Claim count drift`,
  );
  check(
    productData.contracts.size === productData.claims.size,
    `${product}: Claim/Contract count mismatch`,
  );
  check(
    productData.slices.size === expectedSlices[product],
    `${product}: Slice count drift`,
  );
  if (product === 'claude-code') {
    check(
      productData.zeroClaimExplanation &&
        productData.content.includes('secondary Slice 尚未锁定') &&
        !/^> (?:版本|Channel|Surface)：/m.test(productData.content) &&
        !/\b(?:blocked|surface=none)\b/i.test(productData.content),
      'Claude Code zero-Claim projection must be explanation-only',
    );
  } else {
    const expectedVersion = product === 'codex' ? '0.145.0' : '0.21.0';
    check(
      productData.content.includes(`> 版本：${expectedVersion}`) &&
        productData.content.includes('> Channel：latest') &&
        productData.content.includes(`> Claim last_checked：${reviewedAt}`),
      `${product}: current projection header drift`,
    );
  }
  for (const slice of productData.slices.values()) {
    check(
      slice.product === productLabels[product],
      `${slice.id}: Slice Product mismatch`,
    );
    for (const [field, allowed] of Object.entries(controlledSliceEnums)) {
      check(
        allowed.has(slice[field]),
        `${slice.id}: invalid Slice ${field}=${slice[field]}`,
      );
    }
    for (const field of [
      'version',
      'os',
      'arch',
      'shell',
      'authentication',
      'entitlement',
      'region',
      'provider',
      'model',
      'configuration',
      'featureFlags',
    ]) {
      check(Boolean(slice[field]?.trim()), `${slice.id}: empty Slice ${field}`);
    }
  }
  const support = countValues(
    [...productData.claims.values()].map((claim) => claim.assessment.S),
  );
  const runtime = countValues(
    [...productData.claims.values()].map((claim) => claim.assessment.R),
  );
  const confidence = countValues(
    [...productData.claims.values()].map((claim) => claim.assessment.C),
  );
  check(
    sameObject(support, expectedSupport[product]),
    `${product}: support distribution drift`,
  );
  check(
    sameObject(runtime, expectedRuntime[product]),
    `${product}: runtime distribution drift`,
  );
  check(
    sameObject(confidence, expectedConfidence[product]),
    `${product}: confidence distribution drift`,
  );

  for (const claim of productData.claims.values()) {
    check(!allClaims.has(claim.id), `duplicate current Claim ${claim.id}`);
    allClaims.set(claim.id, claim);
    check(
      claim.id.startsWith(`CCQ-${product}-`),
      `${claim.id}: Claim Product mismatch`,
    );
    check(claim.checked === reviewedAt, `${claim.id}: stale last_checked`);
    const assessmentKeys = claim.assessmentEntries.map(([key]) => key);
    check(
      JSON.stringify(assessmentKeys) ===
        JSON.stringify(['E', 'D', 'R', 'S', 'L', 'F', 'C']),
      `${claim.id}: Assessment must contain exactly E/D/R/S/L/F/C`,
    );
    for (const [key, allowed] of Object.entries(assessmentEnums)) {
      check(
        allowed.has(claim.assessment[key]),
        `${claim.id}: invalid Assessment ${key}=${claim.assessment[key]}`,
      );
    }
    if (
      claim.assessment.D === 'Documented' &&
      claim.assessment.R === 'Not reproduced'
    ) {
      check(
        claim.conflicts
          .split(',')
          .map((value) => value.trim())
          .includes('Docs-runtime'),
        `${claim.id}: Documented + Not reproduced requires Docs-runtime conflict`,
      );
    }
    check(
      claim.factList.length === claim.facts.size && claim.factList.length > 0,
      `${claim.id}: duplicate or missing Origin Fact`,
    );
    for (const factId of claim.facts) {
      check(
        factIdsByProduct[product].has(factId),
        `${claim.id}: Origin Fact ${factId} does not belong to ${product}`,
      );
    }
    check(
      claim.evidenceList.length === claim.evidence.size &&
        claim.evidenceList.length > 0,
      `${claim.id}: duplicate or missing Evidence ID`,
    );
    const slice = productData.slices.get(claim.sliceId);
    check(Boolean(slice), `${claim.id}: unknown Slice ${claim.sliceId}`);
    check(
      slice?.surface !== 'cli',
      `${claim.id}: CLI Surface leaked into Phase 1D.1`,
    );
    check(
      slice?.version ===
        (product === 'codex'
          ? '0.145.0'
          : product === 'qwen-code'
            ? '0.21.0'
            : undefined),
      `${claim.id}: non-exact or wrong Slice version`,
    );
    if (product === 'qwen-code') {
      check(slice?.channel === 'latest', `${claim.id}: Qwen erratum missing`);
      for (const factId of claim.facts) {
        const raw = qwenFactMetadataById.get(factId);
        check(
          Boolean(raw) && raw.surfaces.has(slice?.surface),
          `${claim.id}: Fact ${factId} raw Surface mismatch`,
        );
      }
    }
    const registryRecord = registry.records.get(claim.atomic);
    check(
      Boolean(registryRecord),
      `${claim.id}: unknown Atomic ${claim.atomic}`,
    );
    check(
      claim.userJob === registryRecord?.job,
      `${claim.id}: stale Registry user job`,
    );
    const contract = productData.contracts.get(claim.id);
    check(Boolean(contract), `${claim.id}: missing Contract`);
    for (const leaf of leafOrder) {
      const value = contract?.[leaf];
      check(
        /^(R\[.+\]|CN|U|NC|NA)$/.test(value ?? ''),
        `${claim.id}: invalid ${leaf}=${value}`,
      );
      const required = registryRecord?.required.has(leaf);
      if (!required) {
        check(value === 'NA', `${claim.id}: non-required ${leaf} must be NA`);
      } else {
        const approvedNotApplicable =
          claim.id === 'CCQ-qwen-code-CAP-01.09-A01-001' && leaf === 'AD';
        check(
          value !== 'NA' || approvedNotApplicable,
          `${claim.id}: required ${leaf} cannot be NA`,
        );
      }
      check(
        !/^R\[.*(?:unknown|not described|not documented|unspecified|未知|未说明|未描述)/i.test(
          value ?? '',
        ),
        `${claim.id}: unknown encoded as recorded ${leaf}`,
      );
      const allowed = controlledContractEnums[leaf];
      if (allowed && value?.startsWith('R[')) {
        check(
          recordedValues(value).every((item) => allowed.has(item)),
          `${claim.id}: invalid controlled ${leaf}=${value}`,
        );
      }
    }
  }

  for (const relation of productData.relations) {
    allRelations.push({ ...relation, product });
    check(relation.note.trim(), `${relation.claimId}: empty relation note`);
    check(
      !relationIdentities.has(relationIdentity(relation)),
      `${relation.claimId}: duplicate Evidence relation`,
    );
    relationIdentities.add(relationIdentity(relation));
    const claim = productData.claims.get(relation.claimId);
    check(Boolean(claim), `relation references unknown ${relation.claimId}`);
    check(
      claim?.evidence.has(relation.evidenceId),
      `${relation.claimId}: undeclared relation ${relation.evidenceId}`,
    );
    check(
      ['supports', 'qualifies', 'contradicts'].includes(relation.relation),
      `${relation.claimId}: invalid relation ${relation.relation}`,
    );
    if (product === 'qwen-code') {
      const raw = qwenEvidenceMetadataById.get(relation.evidenceId);
      const slice = productData.slices.get(claim?.sliceId);
      check(
        Boolean(raw) &&
          raw.product === 'Qwen Code' &&
          raw.version === slice?.version &&
          raw.channel === 'stable' &&
          slice?.channel === 'latest' &&
          raw.surface === slice?.surface,
        `${relation.claimId}: Qwen Evidence identity/erratum join mismatch for ${relation.evidenceId}`,
      );
    }
    const phase1DRaw = phase1DEvidenceRecords.get(relation.evidenceId);
    if (phase1DRaw) {
      const slice = productData.slices.get(claim?.sliceId);
      const versionMatches =
        phase1DRaw.version === slice?.version ||
        (phase1DRaw.type === 'SOURCE' &&
          phase1DRaw.version?.startsWith(`${slice?.version} / commit `));
      check(
        phase1DRaw.product === productLabels[product] &&
          versionMatches &&
          phase1DRaw.surface === slice?.surface &&
          phase1DRaw.channel ===
            (product === 'qwen-code' ? 'stable' : slice?.channel),
        `${relation.claimId}: raw Phase 1D Evidence identity join mismatch for ${relation.evidenceId}`,
      );
    }
  }
  for (const claim of productData.claims.values()) {
    const linked = new Set(
      productData.relations
        .filter((relation) => relation.claimId === claim.id)
        .map((relation) => relation.evidenceId),
    );
    check(
      sameSet(linked, claim.evidence),
      `${claim.id}: Evidence/relation reverse-link mismatch`,
    );
  }
}

check(allClaims.size === 38, `expected 38 Claims, got ${allClaims.size}`);
check(
  allRelations.length === 75,
  `expected 75 relations, got ${allRelations.length}`,
);
check(
  sameObject(
    countValues(
      allRelations.map(
        (relation) => `${relation.product}:${relation.relation}`,
      ),
    ),
    {
      'codex:qualifies': 17,
      'codex:supports': 10,
      'qwen-code:qualifies': 11,
      'qwen-code:supports': 37,
    },
  ),
  'relation type distribution drift',
);

const frozenIds = new Set(
  Object.values(frozen).flatMap(({ claims }) => [...claims.keys()]),
);
const currentIds = new Set(allClaims.keys());
const removedIds = new Set([...frozenIds].filter((id) => !currentIds.has(id)));
const addedIds = new Set([...currentIds].filter((id) => !frozenIds.has(id)));
check(
  sameSet(removedIds, new Set(['CCQ-codex-CAP-10.08-A01-001'])),
  'unexpected removed Claim inventory',
);
check(
  sameSet(addedIds, newCurrentClaimIds),
  'unexpected added Claim inventory',
);

let stableClaimCount = 0;
for (const [product, currentData] of Object.entries(parsed)) {
  const frozenData = frozen[product];
  for (const [id, currentClaim] of currentData.claims) {
    if (!frozenData.claims.has(id)) continue;
    stableClaimCount++;
    const frozenClaim = frozenData.claims.get(id);
    const exactFields = [
      'atomic',
      'sliceId',
      'userJob',
      'environment',
      'conflicts',
      'limitations',
    ];
    for (const field of exactFields) {
      check(
        currentClaim[field] === frozenClaim[field],
        `${id}: stable Claim ${field} drift`,
      );
    }
    check(
      sameSet(currentClaim.facts, frozenClaim.facts),
      `${id}: stable Origin Fact drift`,
    );
    check(
      JSON.stringify(currentClaim.assessment) ===
        JSON.stringify(frozenClaim.assessment),
      `${id}: stable Assessment drift`,
    );
    const expectedStatement =
      id === 'CCQ-qwen-code-CAP-10.08-A01-001'
        ? '0.21.0 tagged qwen serve 文档把 bilateral feature negotiation 与 protocol version exchange 明列为后续工作；当前 `/capabilities` 只做单向 discovery，不满足双向版本/能力协商。'
        : frozenClaim.statement;
    check(
      currentClaim.statement === expectedStatement,
      `${id}: stable Claim statement drift`,
    );
    const expectedEvidence = new Set(frozenClaim.evidence);
    for (const evidenceId of additiveStableEvidence.get(id) ?? []) {
      expectedEvidence.add(evidenceId);
    }
    check(
      sameSet(currentClaim.evidence, expectedEvidence),
      `${id}: stable Evidence set drift`,
    );
    const currentContract = structuredClone(currentData.contracts.get(id));
    const frozenContract = frozenData.contracts.get(id);
    if (id === 'CCQ-qwen-code-CAP-10.08-A01-001') {
      check(
        currentContract.EP === 'CN' &&
          currentContract.EB ===
            'R[bilateral negotiation boundary distinct from /capabilities descriptor]',
        `${id}: bilateral-negative contract correction drift`,
      );
      currentContract.EP = frozenContract.EP;
      currentContract.EB = frozenContract.EB;
    }
    check(
      JSON.stringify(currentContract) === JSON.stringify(frozenContract),
      `${id}: stable Contract drift outside explicit A01 correction`,
    );
    const currentSlice = structuredClone(
      currentData.slices.get(currentClaim.sliceId),
    );
    const frozenSlice = frozenData.slices.get(frozenClaim.sliceId);
    if (product === 'qwen-code') currentSlice.channel = frozenSlice.channel;
    check(
      JSON.stringify(currentSlice) === JSON.stringify(frozenSlice),
      `${id}: stable 17-field Slice drift outside channel erratum`,
    );
  }
}
check(
  stableClaimCount === 29,
  `expected 29 stable Claims, got ${stableClaimCount}`,
);

const migratedHost = claimById(parsed, 'CCQ-codex-CAP-10.08-A05-001');
const frozenMigrationSource = frozen.codex.claims.get(
  'CCQ-codex-CAP-10.08-A01-001',
);
check(
  migratedHost.claim.atomic === 'CAP-10.08-A05' &&
    migratedHost.claim.userJob === registry.records.get('CAP-10.08-A05')?.job &&
    sameSet(migratedHost.claim.facts, frozenMigrationSource.facts) &&
    JSON.stringify(migratedHost.claim.assessment) ===
      JSON.stringify(frozenMigrationSource.assessment) &&
    JSON.stringify(
      migratedHost.product.slices.get(migratedHost.claim.sliceId),
    ) ===
      JSON.stringify(frozen.codex.slices.get(frozenMigrationSource.sliceId)),
  'Codex A01→A05 migration must retain the exact host Slice and Origin Fact',
);
const containedClaimIds = new Set([
  'CCQ-codex-CAP-10.07-A01-003',
  'CCQ-codex-CAP-10.07-A01-004',
  'CCQ-codex-CAP-10.08-A05-002',
  'CCQ-qwen-code-CAP-10.07-A01-002',
  'CCQ-qwen-code-CAP-10.08-A04-001',
  'CCQ-qwen-code-CAP-12.02-A02-002',
  'CCQ-qwen-code-CAP-12.05-A01-002',
  'CCQ-qwen-code-CAP-12.07-A03-002',
]);
check(
  sameSet(
    new Set([...addedIds].filter((id) => id !== migratedHost.claim.id)),
    containedClaimIds,
  ),
  'contained/new Claim allowlist drift',
);
const expectedContainedSlices = new Map([
  [
    'CDX-0145-SDK-DAEMON-APP-SERVER-CONTAINED-DARWIN-ARM64',
    {
      ...frozen.codex.slices.get('CDX-0145-SDK-DAEMON-APP-SERVER-DARWIN-ARM64'),
      id: 'CDX-0145-SDK-DAEMON-APP-SERVER-CONTAINED-DARWIN-ARM64',
      isolation: 'other',
      authentication: 'not authenticated; credentials unread',
      configuration:
        'frozen binary; deny-default Seatbelt probe; real Codex Home denied; no IP network',
      featureFlags: 'none supplied',
    },
  ],
  [
    'CDX-0145-SDK-DAEMON-MCP-SERVER-CONTAINED-DARWIN-ARM64',
    {
      ...frozen.codex.slices.get('CDX-0145-SDK-DAEMON-MCP-SERVER-DARWIN-ARM64'),
      id: 'CDX-0145-SDK-DAEMON-MCP-SERVER-CONTAINED-DARWIN-ARM64',
      isolation: 'other',
      authentication: 'not authenticated; credentials unread',
      configuration:
        'frozen binary; deny-default Seatbelt probe; real Codex Home denied; no IP network',
      featureFlags: 'none supplied',
    },
  ],
  [
    'QWN-0210-DAEMON-CONTAINED-DARWIN-ARM64-NONTTY',
    {
      ...frozen['qwen-code'].slices.get('QWN-0210-DAEMON-DARWIN-ARM64-NONTTY'),
      id: 'QWN-0210-DAEMON-CONTAINED-DARWIN-ARM64-NONTTY',
      channel: 'latest',
      isolation: 'other',
      authentication: 'fixed non-secret bearer; require-auth',
      configuration:
        'frozen npm artifact; controlled Qwen roots; deny-default Seatbelt; localhost only',
      featureFlags:
        'ACP preheat disabled through frozen artifact test-only gate',
    },
  ],
]);
const expectedContainedSliceByClaim = new Map([
  [
    'CCQ-codex-CAP-10.07-A01-003',
    'CDX-0145-SDK-DAEMON-APP-SERVER-CONTAINED-DARWIN-ARM64',
  ],
  [
    'CCQ-codex-CAP-10.07-A01-004',
    'CDX-0145-SDK-DAEMON-MCP-SERVER-CONTAINED-DARWIN-ARM64',
  ],
  [
    'CCQ-codex-CAP-10.08-A05-002',
    'CDX-0145-SDK-DAEMON-APP-SERVER-CONTAINED-DARWIN-ARM64',
  ],
  [
    'CCQ-qwen-code-CAP-10.07-A01-002',
    'QWN-0210-DAEMON-CONTAINED-DARWIN-ARM64-NONTTY',
  ],
  [
    'CCQ-qwen-code-CAP-10.08-A04-001',
    'QWN-0210-DAEMON-CONTAINED-DARWIN-ARM64-NONTTY',
  ],
  [
    'CCQ-qwen-code-CAP-12.02-A02-002',
    'QWN-0210-DAEMON-CONTAINED-DARWIN-ARM64-NONTTY',
  ],
  [
    'CCQ-qwen-code-CAP-12.05-A01-002',
    'QWN-0210-DAEMON-CONTAINED-DARWIN-ARM64-NONTTY',
  ],
  [
    'CCQ-qwen-code-CAP-12.07-A03-002',
    'QWN-0210-DAEMON-CONTAINED-DARWIN-ARM64-NONTTY',
  ],
]);
check(
  sameSet(new Set(expectedContainedSliceByClaim.keys()), containedClaimIds),
  'contained Claim/Slice mapping allowlist drift',
);
for (const [id, expectedSliceId] of expectedContainedSliceByClaim) {
  const { claim, product } = claimById(parsed, id);
  const slice = product.slices.get(claim.sliceId);
  check(
    claim.sliceId === expectedSliceId &&
      JSON.stringify(slice) ===
        JSON.stringify(expectedContainedSlices.get(expectedSliceId)),
    `${id}: contained 17-field Slice drift outside exact host delta allowlist`,
  );
}

const mapMigratedClaim = (id) =>
  id === 'CCQ-codex-CAP-10.08-A01-001' ? 'CCQ-codex-CAP-10.08-A05-001' : id;
const baselineEdgeKeys = new Set(
  Object.values(frozen)
    .flatMap(({ relations }) => relations)
    .map((relation) => relationKey(relation, mapMigratedClaim)),
);
check(baselineEdgeKeys.size === 62, 'frozen baseline edge count drift');
const currentEdgeKeys = new Set(
  allRelations.map((relation) => relationKey(relation)),
);
for (const key of baselineEdgeKeys) {
  check(currentEdgeKeys.has(key), `baseline relation not carried: ${key}`);
}
const expectedAdditionalRelations = [
  [
    'EVD-codex-SOURCE-003',
    'supports',
    'CCQ-codex-CAP-07.04-A01-001',
    'exact-commit source directly constructs the bounded static tool inventory',
  ],
  [
    'EVD-codex-SOURCE-003',
    'qualifies',
    'CCQ-codex-CAP-07.04-A02-001',
    'exact-commit source bounds a safe unknown-tool canary but no frozen runtime call occurred',
  ],
  [
    'EVD-codex-SOURCE-002',
    'supports',
    'CCQ-codex-CAP-10.08-A05-001',
    'exact-commit source directly supports the bounded client metadata and response-shape statement',
  ],
  [
    'EVD-codex-RUNTIME-004',
    'supports',
    'CCQ-codex-CAP-10.07-A01-003',
    'contained runtime directly records startup failure with no protocol output; input read is unproven',
  ],
  [
    'EVD-codex-RUNTIME-005',
    'supports',
    'CCQ-codex-CAP-10.07-A01-004',
    'contained runtime directly records config bootstrap failure with no protocol output; input read is unproven',
  ],
  [
    'EVD-codex-RUNTIME-004',
    'qualifies',
    'CCQ-codex-CAP-10.08-A05-002',
    'contained runtime records startup failure with no protocol output; input read is unproven and initialize was not sent',
  ],
  [
    'EVD-codex-SOURCE-002',
    'supports',
    'CCQ-codex-CAP-10.08-A05-002',
    'exact-commit source directly supports the bounded initialize request and response shape',
  ],
  [
    'EVD-qwen-code-RUNTIME-001',
    'supports',
    'CCQ-qwen-code-CAP-10.07-A01-002',
    'runtime directly proves the bounded management-route lifecycle without proving task readiness',
  ],
  [
    'EVD-qwen-code-DOC-044',
    'supports',
    'CCQ-qwen-code-CAP-10.08-A04-001',
    'exact release-commit documentation distinguishes descriptor discovery from negotiation',
  ],
  [
    'EVD-qwen-code-RUNTIME-001',
    'supports',
    'CCQ-qwen-code-CAP-10.08-A04-001',
    'exact runtime directly returned the bounded versioned descriptor',
  ],
  [
    'EVD-qwen-code-RUNTIME-002',
    'supports',
    'CCQ-qwen-code-CAP-12.02-A02-002',
    'runtime directly locates and reads the persistent diagnostic log with run/process/error context',
  ],
  [
    'EVD-qwen-code-RUNTIME-001',
    'supports',
    'CCQ-qwen-code-CAP-12.05-A01-002',
    'runtime directly distinguishes liveness, degraded bootstrap, readiness, auth rejection, and unavailable after shutdown',
  ],
  [
    'EVD-qwen-code-RUNTIME-002',
    'supports',
    'CCQ-qwen-code-CAP-12.07-A03-002',
    'runtime directly proves bounded graceful parent/listener cleanup, not crash or child-resource recovery',
  ],
].map(([evidenceId, relation, claimId, note]) =>
  relationKey({ evidenceId, relation, claimId, note }),
);
check(
  sameSet(
    new Set([...currentEdgeKeys].filter((key) => !baselineEdgeKeys.has(key))),
    new Set(expectedAdditionalRelations),
  ),
  'Phase 1D.1 exact relation overlay (including notes) drift',
);

for (const [evidenceId, expectedEdges] of newEvidenceEdges) {
  const actual = new Set(
    allRelations
      .filter((relation) => relation.evidenceId === evidenceId)
      .map((relation) => `${relation.relation}:${relation.claimId}`),
  );
  check(
    sameSet(actual, expectedEdges),
    `${evidenceId}: formal relation set drift`,
  );
}
const doc044Descriptor = allRelations.filter(
  (relation) =>
    relation.evidenceId === 'EVD-qwen-code-DOC-044' &&
    relation.claimId === 'CCQ-qwen-code-CAP-10.08-A04-001' &&
    relation.relation === 'supports',
);
check(
  doc044Descriptor.length === 1,
  'new descriptor Claim must have one DOC-044 supports edge',
);

const evidenceLedger = read('evidence/phase-1d-runtime-probes.md');
const evidenceIndex = [
  ...evidenceLedger.matchAll(
    /^\| `(EVD-[^`]+)`\s+\| `(RUNTIME|SOURCE)`\s+\|/gmu,
  ),
].map((match) => [match[1], match[2]]);
const expectedEvidenceTypes = new Map([
  ['EVD-qwen-code-RUNTIME-001', 'RUNTIME'],
  ['EVD-qwen-code-RUNTIME-002', 'RUNTIME'],
  ['EVD-codex-RUNTIME-004', 'RUNTIME'],
  ['EVD-codex-RUNTIME-005', 'RUNTIME'],
  ['EVD-codex-SOURCE-002', 'SOURCE'],
  ['EVD-codex-SOURCE-003', 'SOURCE'],
]);
check(
  evidenceIndex.length === 6,
  'Phase 1D Evidence index must contain 6 rows',
);
for (const [id, type] of expectedEvidenceTypes) {
  check(
    evidenceIndex.some(
      ([actualId, actualType]) => id === actualId && type === actualType,
    ),
    `${id}: missing Evidence type ${type}`,
  );
}

let requiredLeafCount = 0;
for (const { claim, product } of [...allClaims.values()].map((claim) => ({
  claim,
  product: parsed[claim.product],
}))) {
  const required = registry.records.get(claim.atomic)?.required ?? new Set();
  requiredLeafCount += required.size;
  const contract = product.contracts.get(claim.id);
  check(
    [...required].every(
      (leaf) =>
        contract?.[leaf] !== 'NA' ||
        (claim.id === 'CCQ-qwen-code-CAP-01.09-A01-001' && leaf === 'AD'),
    ),
    `${claim.id}: required Contract coverage gap`,
  );
}
check(
  requiredLeafCount === 499,
  `expected 499 required leaves, got ${requiredLeafCount}`,
);

const qwenNegotiation = claimById(parsed, 'CCQ-qwen-code-CAP-10.08-A01-001');
const qwenNegotiationContract = qwenNegotiation.product.contracts.get(
  qwenNegotiation.claim.id,
);
check(
  qwenNegotiation.claim.assessment.S === 'Not supported' &&
    qwenNegotiation.claim.assessment.R === 'Not tested' &&
    qwenNegotiationContract?.EP === 'CN' &&
    qwenNegotiationContract?.AG.includes('experimental') &&
    qwenNegotiationContract?.OH.includes('future work') &&
    qwenNegotiationContract?.EB ===
      'R[bilateral negotiation boundary distinct from /capabilities descriptor]',
  'Qwen bilateral negotiation contract drift',
);

const qwenDescriptor = claimById(parsed, 'CCQ-qwen-code-CAP-10.08-A04-001');
const qwenDescriptorContract = qwenDescriptor.product.contracts.get(
  qwenDescriptor.claim.id,
);
check(
  qwenDescriptor.claim.assessment.S === 'Partial' &&
    qwenDescriptor.claim.assessment.D === 'Documented' &&
    qwenDescriptor.claim.assessment.R === 'Reproduced' &&
    qwenDescriptor.claim.assessment.C === 'Medium' &&
    qwenDescriptor.claim.assessment.F === 'not-checked' &&
    qwenDescriptorContract?.FS === 'NC' &&
    qwenDescriptorContract?.SB === 'NC' &&
    qwenDescriptor.claim.limitations.includes('route-specific'),
  'Qwen descriptor disposition drift',
);

for (const id of [
  'CCQ-codex-CAP-10.07-A01-003',
  'CCQ-codex-CAP-10.07-A01-004',
]) {
  const { claim, product } = claimById(parsed, id);
  const slice = product.slices.get(claim.sliceId);
  const contract = product.contracts.get(id);
  check(
    claim.assessment.R === 'Not reproduced' &&
      claim.assessment.S === 'Unknown' &&
      claim.assessment.D === 'Not checked' &&
      claim.assessment.L === 'not-checked' &&
      claim.assessment.C === 'Medium' &&
      slice?.isolation === 'other' &&
      contract?.FS.startsWith('R[') &&
      contract?.EB.includes('stdio process boundary') &&
      !/(?:Help|schema)/.test(
        `${claim.statement} ${claim.environment} ${contract?.OH} ${contract?.OB}`,
      ),
    `${id}: Codex containment disposition drift`,
  );
}
const codexContainedInitialize = claimById(
  parsed,
  'CCQ-codex-CAP-10.08-A05-002',
);
const codexContainedInitializeContract =
  codexContainedInitialize.product.contracts.get(
    codexContainedInitialize.claim.id,
  );
check(
  codexContainedInitialize.claim.assessment.R === 'Not tested' &&
    codexContainedInitialize.claim.assessment.S === 'Unknown' &&
    codexContainedInitialize.claim.assessment.D === 'Not checked' &&
    codexContainedInitialize.claim.assessment.L === 'not-checked' &&
    codexContainedInitialize.claim.assessment.C === 'Medium' &&
    codexContainedInitialize.claim.statement.includes(
      'initialize 未发送且未测试',
    ) &&
    codexContainedInitializeContract?.FS.includes(
      'initialize not sent or tested',
    ),
  'Codex contained initialize disposition/provenance drift',
);
for (const id of [
  'CCQ-qwen-code-CAP-10.07-A01-002',
  'CCQ-qwen-code-CAP-10.08-A04-001',
  'CCQ-qwen-code-CAP-12.02-A02-002',
  'CCQ-qwen-code-CAP-12.05-A01-002',
  'CCQ-qwen-code-CAP-12.07-A03-002',
]) {
  const { claim, product } = claimById(parsed, id);
  const slice = product.slices.get(claim.sliceId);
  check(
    slice?.isolation === 'other' &&
      slice.authentication.includes('fixed non-secret bearer') &&
      slice.featureFlags.includes('ACP preheat disabled'),
    `${id}: Qwen runtime Slice environment drift`,
  );
}

for (const [id, support, documentation, confidence, runtimeEvidence] of [
  [
    'CCQ-qwen-code-CAP-10.07-A01-002',
    'Unknown',
    'Not checked',
    'Medium',
    'EVD-qwen-code-RUNTIME-001',
  ],
  [
    'CCQ-qwen-code-CAP-10.08-A04-001',
    'Partial',
    'Documented',
    'Medium',
    'EVD-qwen-code-RUNTIME-001',
  ],
  [
    'CCQ-qwen-code-CAP-12.02-A02-002',
    'Supported',
    'Not checked',
    'Medium',
    'EVD-qwen-code-RUNTIME-002',
  ],
  [
    'CCQ-qwen-code-CAP-12.05-A01-002',
    'Supported',
    'Not checked',
    'High',
    'EVD-qwen-code-RUNTIME-001',
  ],
  [
    'CCQ-qwen-code-CAP-12.07-A03-002',
    'Partial',
    'Not checked',
    'Medium',
    'EVD-qwen-code-RUNTIME-002',
  ],
]) {
  const { claim } = claimById(parsed, id);
  check(
    claim.assessment.S === support &&
      claim.assessment.D === documentation &&
      claim.assessment.R === 'Reproduced' &&
      claim.assessment.C === confidence &&
      claim.evidence.has(runtimeEvidence),
    `${id}: unsupported support-state delta`,
  );
}

const coverage = read('14-phase-1d1-coverage-and-open-claims.md');
const supportSection = section(
  coverage,
  '## 1. Current Secondary-Surface Snapshot',
  '## 2. Runtime 与 Confidence',
);
for (const [label, expected] of [
  ['Codex', [11, 0, 0, 0, 11]],
  ['Claude Code', [0, 0, 0, 0, 0]],
  ['Qwen Code', [27, 3, 2, 1, 21]],
  ['Total', [38, 3, 2, 1, 32]],
]) {
  const row = rowByLabel(supportSection, label);
  check(
    Boolean(row) &&
      JSON.stringify(row.slice(1, 6).map(numericCell)) ===
        JSON.stringify(expected),
    `coverage support row drift for ${label}`,
  );
}
for (const [label, expected] of [
  ['Phase 1C.2 historical Claims', 30],
  ['Current Phase 1D.1 Claims', 38],
  ['Stable Claim IDs carried forward', 29],
  ['Superseded historical Claim IDs', 1],
  ['New current Claim IDs', 9],
  ['Historical Phase 1C.2 relations', 62],
  ['Current Phase 1D.1 relations', 75],
  ['Current required contract leaves', 499],
  ['Phase 1D Evidence Records formalized', 6],
  ['New Phase 1D Evidence relations', 12],
  ['Existing Evidence relation newly added for A04', 1],
]) {
  const row = rowByLabel(supportSection, label);
  check(
    Boolean(row) && numericCell(row[1]) === expected,
    `coverage metric drift for ${label}`,
  );
}
const runtimeSection = section(
  coverage,
  '## 2. Runtime 与 Confidence',
  '## 3. Corrected Conclusions',
);
for (const [label, expected] of [
  ['Codex', [4, 2, 5, 0, 11, 0]],
  ['Claude Code', [0, 0, 0, 0, 0, 0]],
  ['Qwen Code', [5, 0, 22, 2, 25, 0]],
  ['Total', [9, 2, 27, 2, 36, 0]],
]) {
  const row = rowByLabel(runtimeSection, label);
  check(
    Boolean(row) &&
      JSON.stringify(row.slice(1, 7).map(numericCell)) ===
        JSON.stringify(expected),
    `coverage runtime/confidence row drift for ${label}`,
  );
}

for (const relativePath of [
  '12-phase-1d1-registry-revision-2.md',
  '13-phase-1d1-claim-normalization.md',
  '14-phase-1d1-coverage-and-open-claims.md',
  'evidence/phase-1d1-identity-errata.md',
]) {
  validateFrozenDocument(relativePath);
}
for (const relativePath of [
  ...Object.values(productFiles),
  '03-atomic-capability-registry.md',
  '12-phase-1d1-registry-revision-2.md',
  '13-phase-1d1-claim-normalization.md',
  '14-phase-1d1-coverage-and-open-claims.md',
  'evidence/phase-1d1-identity-errata.md',
]) {
  validateLocalLinks(relativePath);
}

try {
  execFileSync(
    process.execPath,
    [path.join(scriptDir, 'validate-phase-1c2.mjs')],
    { cwd: repoRoot, stdio: 'pipe' },
  );
} catch (error) {
  errors.push(`Phase 1C.2 regression validator failed: ${error.stderr}`);
}
try {
  execFileSync(
    process.execPath,
    [path.join(scriptDir, 'validate-phase-1d.mjs')],
    { cwd: repoRoot, stdio: 'pipe' },
  );
} catch (error) {
  errors.push(`Phase 1D regression validator failed: ${error.stderr}`);
}
try {
  execFileSync(
    process.execPath,
    [path.join(scriptDir, 'generate-phase-1d1-claims.mjs'), '--check'],
    { cwd: repoRoot, stdio: 'pipe' },
  );
} catch (error) {
  errors.push(`Phase 1D.1 generator idempotency failed: ${error.stderr}`);
}

const formattedFiles = [
  ...Object.values(productFiles),
  '03-atomic-capability-registry.md',
  '12-phase-1d1-registry-revision-2.md',
  '13-phase-1d1-claim-normalization.md',
  '14-phase-1d1-coverage-and-open-claims.md',
  'evidence/phase-1d1-identity-errata.md',
  'scripts/generate-phase-1d1-claims.mjs',
  'scripts/validate-phase-1d1.mjs',
].map((relativePath) => path.join(root, relativePath));
if (fs.existsSync(prettier)) {
  try {
    execFileSync(
      prettier,
      ['--check', '--ignore-path', '/dev/null', ...formattedFiles],
      { cwd: repoRoot, stdio: 'pipe' },
    );
  } catch {
    errors.push('Phase 1D.1 generated files fail Prettier --check');
  }
}

for (const relativePath of [
  ...Object.values(productFiles),
  '03-atomic-capability-registry.md',
  '12-phase-1d1-registry-revision-2.md',
  '13-phase-1d1-claim-normalization.md',
  '14-phase-1d1-coverage-and-open-claims.md',
  'evidence/phase-1d1-identity-errata.md',
  'scripts/generate-phase-1d1-claims.mjs',
  'scripts/validate-phase-1d1.mjs',
]) {
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
  [
    'Phase 1D.1 validation passed',
    'Registry Revision 2: 144 topics / 550 records',
    'Current projection: 38 Claims / 75 relations / 499 required leaves',
    'Claim migration: 29 stable; Codex A01 -> A05; 8 contained Claims added',
    'New Evidence relations: 12 across 6 Records plus DOC-044 -> Qwen A04',
    'Frozen Phase 1C.2: 30 Claims / 62 relations unchanged',
  ].join('\n') + '\n',
);
