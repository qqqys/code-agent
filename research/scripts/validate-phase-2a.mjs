#!/usr/bin/env node

import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  phase2AReviewedAt,
  phase2AStatus,
} from './generate-phase-2a-comparisons.mjs';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(scriptDir, '..');
const repoRoot = path.resolve(root, '../../..');
const prettier = path.join(repoRoot, 'node_modules', '.bin', 'prettier');

const frozenInputs = {
  '00-scope-and-version-lock.md':
    'fd178ab9b197f118c90c2db5efcac780ee2465a282585ec1df96a58f86198373',
  '03-atomic-capability-registry.md':
    '95deccb0c7c056b6e89e092ae6b9187e459afd7e0c680f6e972ec2a2c13997f5',
  'claims/codex-cli.md':
    '45a2dff2d36529241a6b91be0553a4470a3cd53d21e61f8c640ef7dbd3905724',
  'claims/claude-code-cli.md':
    '5ae1b170e9aed9bf460721a5a51870239ea10a1d5be6f3fac6e7c7b3e56dd657',
  'claims/qwen-code-cli.md':
    '7702ca8695e6c52e8bed735bfd94398ac969563f1290d3a7064bfdf4bbb56d7a',
  'claims/phase-1d1/codex-secondary-surfaces.md':
    'b7ec885b0795778147dd003126b7c79d7bb06b60e8efd0511cc5034329ece0e2',
  'claims/phase-1d1/claude-code-secondary-surfaces.md':
    '9a0092e28ce61a5ffeb8a24b0232538ca499008783d639f413cfe8ccc892541f',
  'claims/phase-1d1/qwen-code-secondary-surfaces.md':
    'eafd31711bab64b5a2e580dd59032220daddc2b090dbcbe87f48e2c7b2faac58',
};

const claimFiles = {
  'claims/codex-cli.md': {
    product: 'codex',
    label: 'Codex',
    layer: 'cli',
    claims: 84,
  },
  'claims/claude-code-cli.md': {
    product: 'claude-code',
    label: 'Claude Code',
    layer: 'cli',
    claims: 132,
  },
  'claims/qwen-code-cli.md': {
    product: 'qwen-code',
    label: 'Qwen Code',
    layer: 'cli',
    claims: 209,
  },
  'claims/phase-1d1/codex-secondary-surfaces.md': {
    product: 'codex',
    label: 'Codex',
    layer: 'secondary',
    claims: 11,
  },
  'claims/phase-1d1/claude-code-secondary-surfaces.md': {
    product: 'claude-code',
    label: 'Claude Code',
    layer: 'secondary',
    claims: 0,
  },
  'claims/phase-1d1/qwen-code-secondary-surfaces.md': {
    product: 'qwen-code',
    label: 'Qwen Code',
    layer: 'secondary',
    claims: 27,
  },
};

const productOrder = ['codex', 'claude-code', 'qwen-code'];

const qwenCliSlices = new Set([
  'QWN-0210-CLI-NA-UNKNOWN',
  'QWN-0210-CLI-NA-TTY',
  'QWN-0210-CLI-NA-NONTTY',
  'QWN-0210-CLI-SEATBELT-NA',
  'QWN-0210-CLI-DOCKER-NA',
  'QWN-0210-CLI-PODMAN-NA',
]);

const comparisonFiles = {
  10: 'comparisons/phase-2a-cap10-automation-and-programmatic-access.md',
  12: 'comparisons/phase-2a-cap12-observability-and-reliability.md',
};

const methodFile = '15-phase-2a-comparison-cohort-and-method.md';
const coverageFile = '16-phase-2a-coverage-and-open-comparisons.md';
const errataFile = 'evidence/phase-2a-identity-errata.md';
const generatorFile = 'scripts/generate-phase-2a-comparisons.mjs';
const validatorFile = 'scripts/validate-phase-2a.mjs';

const phase2AFiles = [
  methodFile,
  coverageFile,
  errataFile,
  ...Object.values(comparisonFiles),
  generatorFile,
  validatorFile,
];

const allowedStates = new Set([
  'runtime-comparable',
  'gate-asymmetric',
  'evidence-asymmetric',
  'surface-only',
  'single-product',
  'uncovered',
]);

const crossProductStates = {
  'gate-asymmetric': new Set(['CAP-10.07-A01', 'CAP-12.07-A03']),
  'evidence-asymmetric': new Set([
    'CAP-10.07-A02',
    'CAP-10.07-A05',
    'CAP-12.02-A02',
  ]),
  'surface-only': new Set([
    'CAP-10.01-A01',
    'CAP-10.02-A01',
    'CAP-10.02-A02',
    'CAP-10.03-A01',
    'CAP-10.03-A02',
    'CAP-10.03-A03',
    'CAP-10.05-A04',
    'CAP-12.03-A01',
    'CAP-12.03-A02',
    'CAP-12.03-A04',
    'CAP-12.03-A07',
    'CAP-12.04-A01',
    'CAP-12.05-A02',
    'CAP-12.09-A01',
    'CAP-12.09-A02',
  ]),
  'runtime-comparable': new Set(),
};

const expectedStateCounts = {
  'runtime-comparable': 0,
  'gate-asymmetric': 2,
  'evidence-asymmetric': 3,
  'surface-only': 15,
  'single-product': 34,
  uncovered: 41,
};

const expectedDomainCounts = {
  10: {
    records: 48,
    claims: 51,
    crossProduct: 10,
    singleProduct: 18,
    uncovered: 20,
    states: {
      'runtime-comparable': 0,
      'gate-asymmetric': 1,
      'evidence-asymmetric': 2,
      'surface-only': 7,
      'single-product': 18,
      uncovered: 20,
    },
    products: {
      codex: { claims: 17, atomics: 12, slices: 6 },
      'claude-code': { claims: 10, atomics: 9, slices: 2 },
      'qwen-code': { claims: 24, atomics: 22, slices: 6 },
    },
  },
  12: {
    records: 47,
    claims: 42,
    crossProduct: 10,
    singleProduct: 16,
    uncovered: 21,
    states: {
      'runtime-comparable': 0,
      'gate-asymmetric': 1,
      'evidence-asymmetric': 1,
      'surface-only': 8,
      'single-product': 16,
      uncovered: 21,
    },
    products: {
      codex: { claims: 5, atomics: 5, slices: 1 },
      'claude-code': { claims: 12, atomics: 12, slices: 2 },
      'qwen-code': { claims: 25, atomics: 20, slices: 4 },
    },
  },
};

const expectedReviewRows = {
  [methodFile]: 6,
  [errataFile]: 4,
  [comparisonFiles['10']]: 5,
  [comparisonFiles['12']]: 5,
  [coverageFile]: 5,
};

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), 'utf8');
}

function sha256(data) {
  return createHash('sha256').update(data).digest('hex');
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

function section(content, start, end = null) {
  const startIndex = content.indexOf(start);
  assert(startIndex >= 0, `missing section: ${start}`);
  const endIndex =
    end === null
      ? content.length
      : content.indexOf(end, startIndex + start.length);
  assert(endIndex >= 0, `missing section boundary: ${start} -> ${end}`);
  return content.slice(startIndex, endIndex);
}

function sameSet(actual, expected) {
  return (
    JSON.stringify([...actual].sort()) === JSON.stringify([...expected].sort())
  );
}

function countValues(values) {
  const result = {};
  for (const value of values) result[value] = (result[value] ?? 0) + 1;
  return result;
}

function countStates(records) {
  const result = Object.fromEntries(
    [...allowedStates].map((state) => [state, 0]),
  );
  for (const record of records) result[record.state] += 1;
  return result;
}

function assertCountMap(actual, expected, label) {
  assert(
    JSON.stringify(Object.entries(actual).sort()) ===
      JSON.stringify(Object.entries(expected).sort()),
    `${label}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`,
  );
}

function parseAssessment(value, relativePath, claimId) {
  const result = {};
  for (const part of value.split('; ')) {
    const index = part.indexOf('=');
    assert(index > 0, `${relativePath}/${claimId}: malformed assessment`);
    result[part.slice(0, index)] = part.slice(index + 1);
  }
  assert(result.R && result.S, `${relativePath}/${claimId}: missing R/S`);
  return result;
}

function parseClaimFile(relativePath, metadata) {
  const content = read(relativePath);
  const declaredCount = Number(
    content.match(/^> 正式 Claim：(\d+)\s*$/m)?.[1] ?? Number.NaN,
  );
  assert(
    declaredCount === metadata.claims,
    `${relativePath}: declared Claim count drift`,
  );

  const slices = new Map();
  for (const line of content.split('\n')) {
    if (!line.startsWith('| `')) continue;
    const cells = splitRow(line);
    if (cells.length !== 17) continue;
    const id = strip(cells[0]);
    if (!/^(?:CDX|CLC|QWN)-/.test(id)) continue;
    assert(!slices.has(id), `${relativePath}: duplicate Slice ${id}`);
    slices.set(id, {
      id,
      productLabel: cells[1],
      version: strip(cells[2]),
      channel: cells[3],
      surface: cells[4],
      terminal: cells[8],
      isolation: cells[9],
      authentication: cells[10],
      configuration: cells[15],
      featureFlags: cells[16],
    });
  }

  const claims = [];
  const claimCore = content.includes('## 2. Claim Core')
    ? section(content, '## 2. Claim Core', '## 3. Behavior Contract Matrix')
    : '';
  for (const line of claimCore.split('\n')) {
    if (!line.startsWith('| `CCQ-')) continue;
    const cells = splitRow(line);
    assert(cells.length === 12, `${relativePath}: malformed Claim row`);
    const id = strip(cells[0]);
    const atomic = strip(cells[1]);
    const sliceId = strip(cells[2]);
    const slice = slices.get(sliceId);
    assert(slice, `${relativePath}/${id}: missing Slice ${sliceId}`);
    assert(
      id.startsWith(`CCQ-${metadata.product}-`),
      `${relativePath}/${id}: product identity mismatch`,
    );
    assert(
      slice.productLabel === metadata.label,
      `${relativePath}/${sliceId}: product label mismatch`,
    );
    claims.push({
      id,
      atomic,
      sliceId,
      slice,
      product: metadata.product,
      sourceFile: relativePath,
      assessment: parseAssessment(cells[6], relativePath, id),
    });
  }
  assert(
    claims.length === metadata.claims,
    `${relativePath}: expected ${metadata.claims} Claims, got ${claims.length}`,
  );
  if (metadata.claims === 0) {
    assert(slices.size === 0, `${relativePath}: zero-Claim file has Slices`);
  }
  return { ...metadata, relativePath, slices, claims };
}

function parseRegistry() {
  const records = new Map();
  for (const line of read('03-atomic-capability-registry.md').split('\n')) {
    if (!line.startsWith('| `CAP-')) continue;
    const cells = splitRow(line);
    if (cells.length !== 5) continue;
    const id = strip(cells[0]);
    if (!/^CAP-\d{2}\.\d{2}-A\d{2}$/.test(id)) continue;
    assert(!records.has(id), `Registry duplicate Atomic ${id}`);
    records.set(id, {
      id,
      job: cells[1],
      outcome: cells[2],
    });
  }
  assert(records.size === 550, `Registry: expected 550, got ${records.size}`);
  return records;
}

function parseCohort(registry) {
  const files = new Map();
  const claims = [];
  for (const [relativePath, metadata] of Object.entries(claimFiles)) {
    const parsed = parseClaimFile(relativePath, metadata);
    files.set(relativePath, parsed);
    claims.push(...parsed.claims);
  }

  assert(claims.length === 463, `cohort: expected 463, got ${claims.length}`);
  const claimsById = new Map();
  for (const claim of claims) {
    assert(!claimsById.has(claim.id), `duplicate cohort Claim ${claim.id}`);
    assert(
      registry.has(claim.atomic),
      `${claim.id}: unknown Atomic ${claim.atomic}`,
    );
    claimsById.set(claim.id, claim);
  }

  assertCountMap(
    countValues(claims.map((claim) => claim.product)),
    { codex: 95, 'claude-code': 132, 'qwen-code': 236 },
    'cohort products',
  );
  assertCountMap(
    countValues(
      [...files.values()].flatMap((file) => file.claims.map(() => file.layer)),
    ),
    { cli: 425, secondary: 38 },
    'cohort layers',
  );
  assertCountMap(
    Object.fromEntries(
      productOrder.map((product) => [
        product,
        new Set(
          [...files.values()]
            .filter((file) => file.product === product)
            .flatMap((file) => [...file.slices.keys()]),
        ).size,
      ]),
    ),
    { codex: 13, 'claude-code': 9, 'qwen-code': 9 },
    'cohort distinct Slices',
  );

  validateQwenCliErratum(files.get('claims/qwen-code-cli.md'));
  return { files, claims, claimsById };
}

function fencedYaml(content) {
  const match = content.match(/```yaml\n([\s\S]*?)\n```/);
  assert(match, `${errataFile}: missing YAML correction`);
  return match[1];
}

function yamlScalar(yaml, key) {
  const match = yaml.match(new RegExp(`^${key}: (.+)$`, 'm'));
  assert(match, `${errataFile}: missing ${key}`);
  return match[1].trim();
}

function yamlList(yaml, key, nextKey = null) {
  const block = section(
    yaml,
    `${key}:\n`,
    nextKey === null ? null : `${nextKey}:\n`,
  );
  return new Set(
    [...block.matchAll(/^  - (.+)$/gm)].map((match) => match[1].trim()),
  );
}

function validateQwenCliErratum(qwenCli) {
  assert(qwenCli, 'missing Qwen CLI cohort file');
  assert(
    qwenCli.claims.length === 209,
    'Qwen CLI correction must cover 209 Claims',
  );
  assert(
    sameSet(new Set(qwenCli.slices.keys()), qwenCliSlices),
    'Qwen CLI correction Slice selector drift',
  );
  for (const slice of qwenCli.slices.values()) {
    assert(
      slice.productLabel === 'Qwen Code' &&
        slice.version === '0.21.0' &&
        slice.channel === 'stable' &&
        slice.surface === 'cli',
      `${slice.id}: Qwen CLI correction identity drift`,
    );
  }
  assert(
    qwenCli.claims.every((claim) => qwenCliSlices.has(claim.sliceId)),
    'Qwen CLI correction does not contain every Claim in six Slices',
  );

  const content = read(errataFile);
  const yaml = fencedYaml(content);
  const expectedScalars = {
    erratum_id: 'ERR-P2A-QWEN-CLI-CHANNEL-001',
    applies_to: 'phase-2a-comparison-only',
    source_file: 'claims/qwen-code-cli.md',
    source_sha256: frozenInputs['claims/qwen-code-cli.md'],
    expected_claim_count: '209',
    field: 'release_channel',
    recorded_value: 'stable',
    effective_value: 'latest',
    identity_preserved: 'true',
  };
  for (const [key, value] of Object.entries(expectedScalars)) {
    assert(
      yamlScalar(yaml, key) === value,
      `${errataFile}: ${key} must be ${value}`,
    );
  }
  assert(
    sameSet(yamlList(yaml, 'slice_ids', 'immutable_fields'), qwenCliSlices),
    `${errataFile}: slice_ids drift`,
  );
  assert(
    sameSet(
      yamlList(yaml, 'immutable_fields'),
      new Set([
        'claim_id',
        'atomic_capability_id',
        'slice_id',
        'product',
        'version',
        'surface',
        'platform',
        'environment',
        'statement',
        'assessment',
        'evidence_ids',
        'relations',
        'contract',
      ]),
    ),
    `${errataFile}: immutable_fields drift`,
  );
  assert(
    content.includes('> Projection scope：Phase 2A comparison outputs only'),
    `${errataFile}: projection scope drift`,
  );
  assert(
    read(methodFile).includes('ERR-P2A-QWEN-CLI-CHANNEL-001'),
    `${methodFile}: missing Qwen CLI erratum reference`,
  );
}

function claimIds(cell) {
  return [
    ...cell.matchAll(
      /`(CCQ-(codex|claude-code|qwen-code)-CAP-\d{2}\.\d{2}-A\d{2}-\d{3})`/g,
    ),
  ].map((match) => ({ id: match[1], product: match[2] }));
}

function parseClaimCell(cell, expectedProduct, claimsById, context) {
  if (cell === '—') return new Set();
  const entries = claimIds(cell);
  const ids = new Set(entries.map((entry) => entry.id));
  assert(ids.size === entries.length, `${context}: duplicate output Claim`);
  assert(entries.length > 0, `${context}: nonempty Claim cell has no Claim ID`);

  const segments = cell.split('<br><br>');
  assert(
    segments.length === entries.length,
    `${context}: malformed Claim summary list`,
  );
  for (const segment of segments) {
    const match = segment.match(
      /^`(CCQ-(codex|claude-code|qwen-code)-CAP-\d{2}\.\d{2}-A\d{2}-\d{3})`<br>Slice: `([^`]+)`<br>(.+)$/,
    );
    assert(match, `${context}: malformed Claim summary`);
    const [, id, product, sliceId] = match;
    const source = claimsById.get(id);
    assert(source, `${context}: unknown output Claim ${id}`);
    assert(
      product === source.product &&
        (!expectedProduct || product === expectedProduct),
      `${context}/${id}: output product mismatch`,
    );
    const channel =
      source.product === 'qwen-code' &&
      source.sourceFile === 'claims/qwen-code-cli.md' &&
      qwenCliSlices.has(source.sliceId)
        ? 'stable (effective latest via ERR-P2A-QWEN-CLI-CHANNEL-001)'
        : source.slice.channel;
    const expectedSegment =
      `\`${source.id}\`<br>Slice: \`${source.sliceId}\`<br>` +
      `v=${source.slice.version}; channel=${channel}; ` +
      `surface=${source.slice.surface}; terminal=${source.slice.terminal}; ` +
      `isolation=${source.slice.isolation}; ` +
      `auth=${source.slice.authentication}; ` +
      `config=${source.slice.configuration}; ` +
      `flags=${source.slice.featureFlags}; R=${source.assessment.R}; ` +
      `S=${source.assessment.S}`;
    assert(
      sliceId === source.sliceId && segment === expectedSegment,
      `${context}/${id}: output Slice identity/assessment summary drift`,
    );
  }
  return ids;
}

function parseComparisonIdentity(cell, context) {
  const match = cell.match(
    /^`(CMP-P2A-(CAP-\d{2}\.\d{2}-A\d{2}))`<br>`(CAP-\d{2}\.\d{2}-A\d{2})`$/,
  );
  assert(match, `${context}: malformed Comparison / Atomic cell`);
  assert(match[2] === match[3], `${context}: Comparison ID Atomic mismatch`);
  return { id: match[1], atomic: match[2] };
}

function emptyProductClaims() {
  return Object.fromEntries(
    productOrder.map((product) => [product, new Set()]),
  );
}

function parseComparisonRows(
  content,
  relativePath,
  registry,
  claimsById,
  kind,
) {
  const boundaries = {
    cross: [
      '## 2. Cross-product Candidates',
      '## 3. Single-product Claim Presence',
    ],
    single: [
      '## 3. Single-product Claim Presence',
      '## 4. Uncovered Atomic Records',
    ],
    uncovered: ['## 4. Uncovered Atomic Records', '## 5. Review Gate'],
  };
  const rows = [];
  for (const line of section(content, ...boundaries[kind]).split('\n')) {
    if (!line.startsWith('| `CMP-P2A-')) continue;
    const cells = splitRow(line);
    const context = `${relativePath}/${kind}`;
    const identity = parseComparisonIdentity(cells[0], context);
    const registryRecord = registry.get(identity.atomic);
    assert(registryRecord, `${context}: unknown Atomic ${identity.atomic}`);
    assert(
      cells[1] === registryRecord.job,
      `${context}/${identity.atomic}: canonical job drift`,
    );
    const byProduct = emptyProductClaims();
    let state;
    let observedRelation;

    if (kind === 'cross') {
      assert(cells.length === 9, `${context}: expected 9 columns`);
      productOrder.forEach((product, index) => {
        byProduct[product] = parseClaimCell(
          cells[index + 2],
          product,
          claimsById,
          `${context}/${identity.atomic}/${product}`,
        );
      });
      state = strip(cells[5]);
      observedRelation = strip(cells[6]);
    } else if (kind === 'single') {
      assert(cells.length === 7, `${context}: expected 7 columns`);
      const entries = claimIds(cells[2]);
      assert(entries.length > 0, `${context}: missing single-product Claim`);
      const products = new Set(entries.map((entry) => entry.product));
      assert(
        products.size === 1,
        `${context}/${identity.atomic}: multiple products in single row`,
      );
      const product = [...products][0];
      byProduct[product] = parseClaimCell(
        cells[2],
        product,
        claimsById,
        `${context}/${identity.atomic}/${product}`,
      );
      state = strip(cells[3]);
      observedRelation = strip(cells[4]);
    } else {
      assert(cells.length === 6, `${context}: expected 6 columns`);
      state = strip(cells[2]);
      observedRelation = strip(cells[3]);
    }
    rows.push({
      ...identity,
      byProduct,
      state,
      observedRelation,
      kind,
    });
  }
  return rows;
}

function parseComparisonDocument(domain, relativePath, registry, claimsById) {
  const content = read(relativePath);
  const records = [
    ...parseComparisonRows(
      content,
      relativePath,
      registry,
      claimsById,
      'cross',
    ),
    ...parseComparisonRows(
      content,
      relativePath,
      registry,
      claimsById,
      'single',
    ),
    ...parseComparisonRows(
      content,
      relativePath,
      registry,
      claimsById,
      'uncovered',
    ),
  ];
  for (const record of records) {
    assert(
      record.atomic.startsWith(`CAP-${domain}.`),
      `${relativePath}: wrong-domain record ${record.atomic}`,
    );
  }
  return { content, records };
}

function sourceClaimSets(cohort, atomics) {
  const result = new Map();
  for (const atomic of atomics) {
    result.set(atomic, emptyProductClaims());
  }
  for (const claim of cohort.claims) {
    if (!result.has(claim.atomic)) continue;
    result.get(claim.atomic)[claim.product].add(claim.id);
  }
  return result;
}

function expectedStateFor(sourceSets, atomic) {
  const presence = productOrder.filter(
    (product) => sourceSets[product].size > 0,
  ).length;
  if (presence === 0) return 'uncovered';
  if (presence === 1) return 'single-product';
  for (const [state, atomics] of Object.entries(crossProductStates)) {
    if (atomics.has(atomic)) return state;
  }
  throw new Error(`${atomic}: missing cross-product state allowlist entry`);
}

function validateComparisonInventory(registry, cohort) {
  const allRecords = [];
  const recordsByDomain = {};
  const expectedAtomicsByDomain = {};

  for (const [domain, relativePath] of Object.entries(comparisonFiles)) {
    const expectedAtomics = [...registry.keys()].filter((atomic) =>
      atomic.startsWith(`CAP-${domain}.`),
    );
    expectedAtomicsByDomain[domain] = expectedAtomics;
    const parsed = parseComparisonDocument(
      domain,
      relativePath,
      registry,
      cohort.claimsById,
    );
    recordsByDomain[domain] = parsed.records;
    allRecords.push(...parsed.records);

    assert(
      expectedAtomics.length === expectedDomainCounts[domain].records,
      `CAP-${domain}: Registry record count drift`,
    );
    assert(
      parsed.records.length === expectedDomainCounts[domain].records,
      `CAP-${domain}: output record count drift`,
    );
    assert(
      sameSet(
        new Set(parsed.records.map((record) => record.atomic)),
        new Set(expectedAtomics),
      ),
      `CAP-${domain}: output Atomic set drift`,
    );
  }

  assert(allRecords.length === 95, 'Phase 2A must contain 95 records');
  assert(
    new Set(allRecords.map((record) => record.id)).size === allRecords.length,
    'duplicate Phase 2A Comparison ID',
  );
  assert(
    new Set(allRecords.map((record) => record.atomic)).size ===
      allRecords.length,
    'duplicate Phase 2A Atomic',
  );
  assert(
    allRecords.every(
      (record) =>
        record.id === `CMP-P2A-${record.atomic}` &&
        allowedStates.has(record.state) &&
        record.observedRelation === 'Not assessed',
    ),
    'Comparison identity/state/observed relation drift',
  );

  const allAtomics = new Set(allRecords.map((record) => record.atomic));
  const sourceSets = sourceClaimSets(cohort, allAtomics);
  const expectedCross = new Set(
    [...sourceSets.entries()]
      .filter(
        ([, sets]) =>
          productOrder.filter((product) => sets[product].size > 0).length >= 2,
      )
      .map(([atomic]) => atomic),
  );
  const allowlistedCross = new Set(
    Object.values(crossProductStates).flatMap((atomics) => [...atomics]),
  );
  assert(expectedCross.size === 20, 'expected 20 cross-product Atomics');
  assert(
    sameSet(expectedCross, allowlistedCross),
    'cross-product state allowlist does not match source Claim presence',
  );

  for (const record of allRecords) {
    const expectedSets = sourceSets.get(record.atomic);
    const expectedState = expectedStateFor(expectedSets, record.atomic);
    assert(
      record.state === expectedState,
      `${record.atomic}: expected state ${expectedState}, got ${record.state}`,
    );
    for (const product of productOrder) {
      assert(
        sameSet(record.byProduct[product], expectedSets[product]),
        `${record.atomic}/${product}: output Claim set drift`,
      );
    }
  }

  assertCountMap(
    countStates(allRecords),
    expectedStateCounts,
    'Phase 2A states',
  );
  assert(
    allRecords.filter((record) => record.kind === 'cross').length === 20 &&
      allRecords.filter((record) => record.kind === 'single').length === 34 &&
      allRecords.filter((record) => record.kind === 'uncovered').length === 41,
    'cross/single/uncovered section inventory drift',
  );

  for (const [domain, records] of Object.entries(recordsByDomain)) {
    const expected = expectedDomainCounts[domain];
    const atomics = new Set(records.map((record) => record.atomic));
    const domainClaims = cohort.claims.filter((claim) =>
      atomics.has(claim.atomic),
    );
    assert(
      domainClaims.length === expected.claims,
      `CAP-${domain}: source Claim count drift`,
    );
    assertCountMap(
      countStates(records),
      expected.states,
      `CAP-${domain} states`,
    );
    assertCountMap(
      countValues(records.map((record) => record.kind)),
      {
        cross: expected.crossProduct,
        single: expected.singleProduct,
        uncovered: expected.uncovered,
      },
      `CAP-${domain} comparison sections`,
    );
    for (const [product, productExpected] of Object.entries(
      expected.products,
    )) {
      const claims = domainClaims.filter((claim) => claim.product === product);
      assert(
        claims.length === productExpected.claims &&
          new Set(claims.map((claim) => claim.atomic)).size ===
            productExpected.atomics &&
          new Set(claims.map((claim) => claim.sliceId)).size ===
            productExpected.slices,
        `CAP-${domain}/${product}: source coverage drift`,
      );
    }
  }

  const outputClaimIds = allRecords.flatMap((record) =>
    productOrder.flatMap((product) => [...record.byProduct[product]]),
  );
  const expectedOutputClaimIds = cohort.claims
    .filter((claim) => allAtomics.has(claim.atomic))
    .map((claim) => claim.id);
  assert(
    outputClaimIds.length === 93 &&
      new Set(outputClaimIds).size === outputClaimIds.length &&
      sameSet(new Set(outputClaimIds), new Set(expectedOutputClaimIds)),
    'Phase 2A output Claim projection must contain 93 exact Claims once each',
  );

  return { allRecords, recordsByDomain };
}

function tableRows(content) {
  return content
    .split('\n')
    .filter((line) => line.startsWith('|'))
    .map(splitRow)
    .filter(
      (cells) =>
        cells.length > 0 &&
        !cells.every((cell) => /^:?-+:?$/.test(cell.replaceAll(' ', ''))),
    );
}

function rowByLabel(rows, label) {
  const matches = rows.filter((row) => strip(row[0]) === label);
  assert(matches.length === 1, `expected one coverage row: ${label}`);
  return matches[0];
}

function numericCells(row) {
  return row.slice(1).map((cell) => {
    const value = Number(strip(cell));
    assert(Number.isFinite(value), `non-numeric cell in row ${row[0]}`);
    return value;
  });
}

function assertNumbers(actual, expected, label) {
  assert(
    JSON.stringify(actual) === JSON.stringify(expected),
    `${label}: expected ${expected.join('/')}, got ${actual.join('/')}`,
  );
}

function validateCoverage(recordsByDomain) {
  const content = read(coverageFile);
  const summaryRows = tableRows(
    section(content, '## 1. Summary', '## 2. Comparison State Distribution'),
  );
  for (const [label, values] of Object.entries({
    'Registry Comparison Records': [48, 47, 95],
    'Cross-product candidates': [10, 10, 20],
    'Single-product': [18, 16, 34],
    Uncovered: [20, 21, 41],
    'runtime-comparable': [0, 0, 0],
  })) {
    assertNumbers(numericCells(rowByLabel(summaryRows, label)), values, label);
  }

  const expectedCohortRows = {
    'CAP-10 / Codex': [17, 12, 6],
    'CAP-10 / Claude Code': [10, 9, 2],
    'CAP-10 / Qwen Code': [24, 22, 6],
    'CAP-12 / Codex': [5, 5, 1],
    'CAP-12 / Claude Code': [12, 12, 2],
    'CAP-12 / Qwen Code': [25, 20, 4],
  };
  for (const [label, values] of Object.entries(expectedCohortRows)) {
    assertNumbers(numericCells(rowByLabel(summaryRows, label)), values, label);
  }

  const stateRows = tableRows(
    section(
      content,
      '## 2. Comparison State Distribution',
      '## 3. Current Evidence Conclusions',
    ),
  );
  for (const [state, count] of Object.entries(expectedStateCounts)) {
    const row = rowByLabel(stateRows, state);
    assertNumbers([Number(strip(row[1]))], [count], `coverage ${state}`);
  }
  assert(
    content.includes('> Observed behavior relation：0'),
    `${coverageFile}: observed relation summary drift`,
  );

  for (const [domain, records] of Object.entries(recordsByDomain)) {
    assert(
      records.length === expectedDomainCounts[domain].records,
      `CAP-${domain}: coverage source drift`,
    );
  }
}

function validateMethod() {
  const content = read(methodFile);
  const rows = tableRows(
    section(
      content,
      '## 2. Current Comparison Cohort',
      '## 3. Comparison Record',
    ),
  );
  const expectedRows = {
    'Phase 1C.1 exact CLI Claims': [84, 132, 209, 425],
    'Phase 1D.1 current secondary': [11, 0, 27, 38],
    'Current comparison cohort': [95, 132, 236, 463],
  };
  for (const [label, values] of Object.entries(expectedRows)) {
    assertNumbers(numericCells(rowByLabel(rows, label)), values, label);
  }
  for (const [relativePath, hash] of Object.entries(frozenInputs)) {
    assert(
      content.includes(relativePath) && content.includes(hash),
      `${methodFile}: missing frozen input ${relativePath}`,
    );
  }
  for (const state of allowedStates) {
    assert(content.includes(state), `${methodFile}: missing state ${state}`);
  }
  for (const relation of [
    'Equivalent',
    'Different',
    'Functional overlap',
    'Not assessed',
  ]) {
    assert(
      content.includes(relation),
      `${methodFile}: missing observed relation ${relation}`,
    );
  }
  assert(
    content.includes('cohort_id: CCQ-P2A-CLI-PLUS-SECONDARY-R2') &&
      content.includes('reviewed_at: ISO-8601 timestamp'),
    `${methodFile}: Comparison Record schema drift`,
  );
}

function documentStatus(content, relativePath) {
  const status = content.match(/^> 状态：(.+?)\s*$/m)?.[1]?.trim();
  assert(status, `${relativePath}: missing status`);
  return status;
}

function validateLifecycle() {
  assert(
    ['Draft', 'Frozen'].includes(phase2AStatus),
    `invalid exported Phase 2A status: ${phase2AStatus}`,
  );
  assert(
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/.test(phase2AReviewedAt) &&
      Number.isFinite(Date.parse(phase2AReviewedAt)),
    `invalid exported Phase 2A timestamp: ${phase2AReviewedAt}`,
  );
  const expectedReview = phase2AStatus === 'Frozen' ? 'Pass' : 'Pending';
  const timestampLabel =
    phase2AStatus === 'Frozen' ? 'Frozen at' : 'Drafted at';

  for (const relativePath of Object.keys(expectedReviewRows)) {
    const content = read(relativePath);
    assert(
      documentStatus(content, relativePath) === phase2AStatus,
      `${relativePath}: status differs from generator export`,
    );
    const gateRows = tableRows(section(content, 'Review Gate'));
    const resultRows = gateRows.filter(
      (row) => strip(row[0]) !== 'Gate' && row.length === 2,
    );
    assert(
      resultRows.length === expectedReviewRows[relativePath],
      `${relativePath}: Review Gate row count drift`,
    );
    assert(
      resultRows.every((row) => strip(row[1]) === expectedReview),
      `${relativePath}: expected all Review Gate rows to be ${expectedReview}`,
    );
  }

  for (const relativePath of [
    coverageFile,
    ...Object.values(comparisonFiles),
  ]) {
    const content = read(relativePath);
    assert(
      content.includes(`> ${timestampLabel}：${phase2AReviewedAt}`),
      `${relativePath}: timestamp/status label drift`,
    );
    const opposite = phase2AStatus === 'Frozen' ? 'Drafted at' : 'Frozen at';
    assert(
      !content.includes(`> ${opposite}：`),
      `${relativePath}: stale lifecycle timestamp label`,
    );
  }

  for (const relativePath of [methodFile, errataFile]) {
    const content = read(relativePath);
    const optionalTimestamp = content.match(
      /^> (?:Drafted at|Frozen at)：(.+?)\s*$/m,
    )?.[1];
    if (optionalTimestamp) {
      assert(
        optionalTimestamp.trim() === phase2AReviewedAt,
        `${relativePath}: optional lifecycle timestamp drift`,
      );
    }
  }
}

function validateFrozenInputs() {
  for (const [relativePath, expectedHash] of Object.entries(frozenInputs)) {
    const actualHash = sha256(fs.readFileSync(path.join(root, relativePath)));
    assert(
      actualHash === expectedHash,
      `${relativePath}: expected ${expectedHash}, got ${actualHash}`,
    );
  }
}

function validateLocalLinks() {
  const markdownFiles = [
    methodFile,
    coverageFile,
    errataFile,
    ...Object.values(comparisonFiles),
  ];
  for (const relativePath of markdownFiles) {
    const content = read(relativePath);
    for (const match of content.matchAll(/!?\[[^\]]*]\(([^)]+)\)/g)) {
      let target = match[1].trim();
      if (target.startsWith('#') || /^[a-z][a-z\d+.-]*:/i.test(target)) {
        continue;
      }
      if (target.startsWith('<') && target.endsWith('>')) {
        target = target.slice(1, -1);
      }
      target = target.split('#')[0].split('?')[0];
      const decoded = decodeURIComponent(target);
      const resolved = path.resolve(
        path.dirname(path.join(root, relativePath)),
        decoded,
      );
      assert(
        fs.existsSync(resolved),
        `${relativePath}: broken local link ${match[1]}`,
      );
    }
  }
}

function validateNoDecisionArtifacts() {
  for (const relativePath of [
    coverageFile,
    ...Object.values(comparisonFiles),
  ]) {
    const content = read(relativePath);
    const headings = [...content.matchAll(/^#{1,6}\s+(.+)$/gm)].map((match) =>
      strip(match[1]),
    );
    assert(
      headings.every(
        (heading) =>
          !/(?:qwen\s+gap|product\s+priority|roadmap|score|ranking|产品优先级|总分|排名)/i.test(
            heading,
          ),
      ),
      `${relativePath}: decision artifact section is out of Phase 2A scope`,
    );
    for (const row of tableRows(content)) {
      if (!row.some((cell) => /comparison state/i.test(strip(cell)))) continue;
      assert(
        !row.some((cell) =>
          /^(?:gap|priority|roadmap|score|rank|产品优先级|总分|排名)$/i.test(
            strip(cell),
          ),
        ),
        `${relativePath}: decision field is out of Phase 2A scope`,
      );
    }
  }
}

function runValidationScript(relativePath, args = []) {
  return execFileSync(
    process.execPath,
    [path.join(root, relativePath), ...args],
    {
      cwd: repoRoot,
      encoding: 'utf8',
      maxBuffer: 32 * 1024 * 1024,
      stdio: ['ignore', 'pipe', 'pipe'],
    },
  ).trim();
}

function validateGeneratedAndUpstream() {
  const phase1C = runValidationScript('scripts/validate-phase-1c.mjs');
  const phase1D1 = runValidationScript('scripts/validate-phase-1d1.mjs');
  const generated = runValidationScript(generatorFile, ['--check']);
  assert(
    phase1C.includes('Phase 1C.1 validation passed'),
    'Phase 1C validator did not report success',
  );
  assert(
    phase1D1.includes('Phase 1D.1 validation passed'),
    'Phase 1D.1 validator did not report success',
  );
  assert(
    generated.includes('"mode":"check"') &&
      generated.includes('"cohortClaims":463') &&
      generated.includes('"cap10":48') &&
      generated.includes('"cap12":47'),
    'Phase 2A generator idempotency check did not report expected scope',
  );
}

function validateFormattingAndIgnoreGate() {
  assert(fs.existsSync(prettier), `missing Prettier binary: ${prettier}`);
  execFileSync(
    prettier,
    [
      '--check',
      '--ignore-path',
      '/dev/null',
      ...phase2AFiles.map((relativePath) => path.join(root, relativePath)),
    ],
    {
      cwd: repoRoot,
      encoding: 'utf8',
      maxBuffer: 32 * 1024 * 1024,
      stdio: ['ignore', 'pipe', 'pipe'],
    },
  );

  for (const relativePath of phase2AFiles) {
    const repoRelativePath = path.relative(
      repoRoot,
      path.join(root, relativePath),
    );
    execFileSync('git', ['check-ignore', '-q', '--', repoRelativePath], {
      cwd: repoRoot,
      stdio: 'pipe',
    });
  }
  const tracked = execFileSync(
    'git',
    [
      'ls-files',
      '--',
      ...phase2AFiles.map((relativePath) =>
        path.relative(repoRoot, path.join(root, relativePath)),
      ),
    ],
    { cwd: repoRoot, encoding: 'utf8' },
  ).trim();
  assert(!tracked, `Phase 2A working artifacts are tracked: ${tracked}`);
}

function main() {
  validateFrozenInputs();
  const registry = parseRegistry();
  const cohort = parseCohort(registry);
  const { allRecords, recordsByDomain } = validateComparisonInventory(
    registry,
    cohort,
  );
  validateCoverage(recordsByDomain);
  validateMethod();
  validateLifecycle();
  validateLocalLinks();
  validateNoDecisionArtifacts();
  validateGeneratedAndUpstream();
  validateFormattingAndIgnoreGate();

  process.stdout.write(
    [
      'Phase 2A validation passed',
      `Frozen inputs: ${Object.keys(frozenInputs).length}`,
      'Cohort: 463 Claims (Codex 95 / Claude Code 132 / Qwen Code 236)',
      'CAP-10: 48 Comparison Records / 51 Claims',
      'CAP-12: 47 Comparison Records / 42 Claims',
      `States: ${Object.entries(expectedStateCounts)
        .map(([state, count]) => `${state}=${count}`)
        .join(', ')}`,
      `Observed relations: ${allRecords.length} Not assessed`,
    ].join('\n') + '\n',
  );
}

main();
