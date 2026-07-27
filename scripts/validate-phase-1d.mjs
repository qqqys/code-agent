#!/usr/bin/env node

import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const EXPECTED = {
  qwenResult:
    '5e5e75bb2fd641aae3ec4ff2144b3695f423fabf7463ed7946a694324c48b284',
  codexAppResult:
    '92bb03269a08861b1ed79ec0fb80c3c1c9bd15d94d2d02e39cb732cc07d4762e',
  codexMcpResult:
    'f1c1971181ab485967ae60422e950c39ccdb4d18c912924e240b149fca0a8548',
  qwenDaemonLog:
    '26ad8c883033092564dbd9d5cca0d351d407b4601ac412aa318ca0c971ec27d2',
  qwenFeatures:
    'a44259350dc419b8c3731aeb6d2acabcd829a03fa8892f7eaf1c318f4db40787',
  qwenCapabilitiesSnapshot:
    'd5bd9b9fde7e3adcee4d9e3ef809a6e78fcb727893c70e2a13ff5bc1d4469da2',
  runner:
    '20e72d1e098626ebd2f93dabef4431e728cf571ce22851a80d5ac30fb9087eac',
  qwenProfile:
    '26490bd39fb83b311ecf3fe1baac61a7f9f7e6f42c177228041ffba3eab9b746',
  codexProfile:
    '5a3617f011685deef63bd12a0fb2ef637ac2f9aef3ce00306f03e041326a6bfc',
  phase1c2: {
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
  },
};

const EVIDENCE_TYPES = new Map([
  ['EVD-qwen-code-RUNTIME-001', 'RUNTIME'],
  ['EVD-qwen-code-RUNTIME-002', 'RUNTIME'],
  ['EVD-codex-RUNTIME-004', 'RUNTIME'],
  ['EVD-codex-RUNTIME-005', 'RUNTIME'],
  ['EVD-codex-SOURCE-002', 'SOURCE'],
  ['EVD-codex-SOURCE-003', 'SOURCE'],
]);

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function sha256(data) {
  return createHash('sha256').update(data).digest('hex');
}

function stableValue(value) {
  if (Array.isArray(value)) {
    return value.map(stableValue);
  }
  if (value !== null && typeof value === 'object') {
    return Object.fromEntries(
      Object.keys(value)
        .sort()
        .map((key) => [key, stableValue(value[key])]),
    );
  }
  return value;
}

function canonicalJson(value) {
  return JSON.stringify(stableValue(value));
}

async function readJson(file, expectedHash) {
  const raw = await readFile(file);
  if (expectedHash) {
    assert(
      sha256(raw) === expectedHash,
      `${file}: locked snapshot SHA-256 mismatch`,
    );
  }
  return JSON.parse(raw.toString('utf8'));
}

function assertContainmentDeclaration(result, loopbackAllowed) {
  assert(
    result.containment?.realHomeReadAllowed === false,
    `${result.mode}: containment manifest must declare real-home denial`,
  );
  assert(
    result.containment?.probeRootWriteOnly === true,
    `${result.mode}: containment manifest must declare probe-root-only writes`,
  );
  assert(
    result.containment?.remoteIpNetworkAllowed === false,
    `${result.mode}: containment manifest must declare remote-IP denial`,
  );
  assert(
    result.containment?.loopbackNetworkAllowed === loopbackAllowed,
    `${result.mode}: unexpected declared loopback policy`,
  );
}

function requestMap(result) {
  return Object.fromEntries(
    result.probe.requests.map((request) => [request.label, request]),
  );
}

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const researchRoot = path.resolve(scriptDirectory, '..');
const supplied = process.argv.slice(2);
let validationMode;
let resultPaths;

if (supplied.length === 0) {
  validationMode = 'locked snapshot';
  resultPaths = [
    'artifacts/phase-1d/qwen-result.json',
    'artifacts/phase-1d/codex-app-result.json',
    'artifacts/phase-1d/codex-mcp-result.json',
  ].map((relative) => path.join(researchRoot, relative));
} else if (supplied[0] === '--semantic' && supplied.length === 4) {
  validationMode = 'semantic rerun';
  resultPaths = supplied.slice(1).map((file) => path.resolve(file));
} else {
  throw new Error(
    'Usage: validate-phase-1d.mjs [--semantic <qwen-result> <codex-app-result> <codex-mcp-result>]',
  );
}

const locked = validationMode === 'locked snapshot';
const [qwenPath, codexAppPath, codexMcpPath] = resultPaths;
const [qwen, codexApp, codexMcp] = await Promise.all([
  readJson(qwenPath, locked ? EXPECTED.qwenResult : undefined),
  readJson(codexAppPath, locked ? EXPECTED.codexAppResult : undefined),
  readJson(codexMcpPath, locked ? EXPECTED.codexMcpResult : undefined),
]);

assertContainmentDeclaration(qwen, true);
assertContainmentDeclaration(codexApp, false);
assertContainmentDeclaration(codexMcp, false);

assert(
  qwen.probe?.probeId === 'P1C2-QWN-DAEMON-DISCOVERY-001',
  'Qwen probe ID mismatch',
);
assert(qwen.probe?.status === 'Reproduced', 'Qwen probe did not reproduce');

const qwenRequests = requestMap(qwen);
const qwenDeepRequests = qwen.probe.requests.filter(({ label }) =>
  label.startsWith('health_deep_attempt_'),
);
const qwenFinalDeepRequest = qwenDeepRequests.at(-1);
const independentlyDerivedExpectations = new Map([
  ['health_no_token', qwenRequests.health_no_token?.status === 401],
  ['health_wrong_token', qwenRequests.health_wrong_token?.status === 401],
  ['health_correct_token', qwenRequests.health_correct_token?.status === 200],
  ['health_deep_runtime', qwenFinalDeepRequest?.status === 200],
  ['capabilities', qwenRequests.capabilities?.status === 200],
  [
    'daemon_status_summary',
    qwenRequests.daemon_status_summary?.status === 200,
  ],
  ['daemon_status_full', qwenRequests.daemon_status_full?.status === 200],
  [
    'daemon_status_invalid_detail',
    qwenRequests.daemon_status_invalid_detail?.status === 400,
  ],
  ['unknown_no_token', qwenRequests.unknown_no_token?.status === 401],
  ['unknown_wrong_token', qwenRequests.unknown_wrong_token?.status === 401],
  ['unknown_correct_token', qwenRequests.unknown_correct_token?.status === 404],
  [
    'listener_closed',
    qwen.probe.postShutdown?.transportError?.cause?.code === 'ECONNREFUSED',
  ],
  ['pid_gone', qwen.probe.shutdown?.pidGone === true],
]);
const independentlyFailed = [...independentlyDerivedExpectations]
  .filter(([, pass]) => !pass)
  .map(([name]) => name);
assert(
  independentlyDerivedExpectations.size === 13 &&
    independentlyFailed.length === 0,
  `Qwen independently derived assertions failed: ${independentlyFailed.join(', ')}`,
);

const producerExpectations = new Map(
  qwen.probe.expectations.map(({ name, pass }) => [name, pass]),
);
assert(
  producerExpectations.size === 13 &&
    [...independentlyDerivedExpectations].every(
      ([name, pass]) => producerExpectations.get(name) === pass,
    ),
  'Qwen producer assertion ledger disagrees with independent derivation',
);
assert(
  qwen.probe.shutdown?.exit?.code === 0,
  'Qwen clean shutdown exit mismatch',
);
assert(
  qwenDeepRequests.length >= 2 &&
    qwenDeepRequests
      .slice(0, -1)
      .some(
        (request) =>
          request.status === 503 &&
          request.headers?.retryAfter === '1' &&
          request.body?.reason === 'bootstrap',
      ) &&
    qwenFinalDeepRequest?.status === 200 &&
    qwenFinalDeepRequest?.body?.status === 'ok',
  'Qwen bootstrap/runtime readiness transition mismatch',
);
assert(
  qwenRequests.daemon_status_invalid_detail?.body?.code === 'invalid_detail',
  'Qwen invalid-detail body mismatch',
);

const capabilities = qwenRequests.capabilities?.body;
assert(capabilities?.qwenCodeVersion === '0.21.0', 'Qwen version mismatch');
assert(
  capabilities?.protocolVersions?.current === 'v1' &&
    JSON.stringify(capabilities.protocolVersions.supported) ===
      JSON.stringify(['v1']),
  'Qwen protocol descriptor mismatch',
);
assert(
  capabilities?.features?.length === 99,
  'Qwen feature count mismatch',
);
assert(
  sha256(JSON.stringify(capabilities.features)) === EXPECTED.qwenFeatures,
  'Qwen feature array hash mismatch',
);
if (locked) {
  assert(
    sha256(canonicalJson(capabilities)) ===
      EXPECTED.qwenCapabilitiesSnapshot,
    'Qwen locked capability snapshot hash mismatch',
  );
}
assert(
  qwenRequests.daemon_status_summary?.body?.daemon?.startup?.preheat?.status ===
    'not_scheduled',
  'Qwen no-preheat disclosure mismatch',
);
assert(
  qwenRequests.daemon_status_summary?.body?.status === 'ok',
  'Qwen summary status mismatch',
);
assert(
  qwenRequests.daemon_status_full?.body?.status === 'error',
  'Qwen containment-induced full-status error missing',
);

const qwenSideEffects = new Map(
  qwen.sideEffects.map((entry) => [entry.path, entry]),
);
for (const settingsPath of [
  'qwen-daemon/qwen-home/settings.json',
  'qwen-daemon/policy/settings.json',
  'qwen-daemon/policy/system-defaults.json',
]) {
  assert(
    qwenSideEffects.get(settingsPath)?.size === 19,
    `${settingsPath}: expected schema migration output`,
  );
}
const qwenLogEntry = qwenSideEffects.get(
  'qwen-daemon/runtime/debug/daemon/daemon.log',
);
assert(qwenLogEntry?.type === 'file', 'Qwen daemon log was not inventoried');
if (locked) {
  assert(
    qwenLogEntry.sha256 === EXPECTED.qwenDaemonLog,
    'Qwen daemon log manifest hash mismatch',
  );
}
const qwenLogPath = locked
  ? path.join(researchRoot, 'artifacts/phase-1d/qwen-daemon.log')
  : qwenRequests.daemon_status_full?.body?.daemon?.logPath;
assert(qwenLogPath, 'Qwen daemon log path missing');
const qwenLog = await readFile(qwenLogPath);
if (locked) {
  assert(
    sha256(qwenLog) === EXPECTED.qwenDaemonLog,
    'Qwen archived daemon log hash mismatch',
  );
}
const qwenLogText = qwenLog.toString('utf8');
const requiredQwenLogExcerpts = [
  'received SIGTERM, draining',
  'daemon stopped',
];
if (locked) {
  requiredQwenLogExcerpts.push(
    'one or more runtime env files could not be read',
  );
}
for (const excerpt of requiredQwenLogExcerpts) {
  assert(qwenLogText.includes(excerpt), `Qwen daemon log omits: ${excerpt}`);
}

assert(codexApp.status === 'Probe failed', 'Codex app must remain blocked');
assert(
  codexApp.error?.details?.sent?.length === 1 &&
    codexApp.error.details.sent[0].value?.method === 'ccq/doesNotExist',
  'Codex app stdin-write ledger mismatch',
);
assert(
  codexApp.error?.details?.received?.length === 0 &&
    codexApp.error?.details?.captures?.stdoutRaw === '',
  'Codex app unexpectedly returned protocol output',
);
for (const excerpt of [
  'could not create PATH aliases: File exists (os error 17)',
  'failed to initialize sqlite state runtime under /Users/qqqys/.codex',
]) {
  assert(
    codexApp.error?.details?.captures?.stderrRaw?.includes(excerpt),
    `Codex app stderr omits: ${excerpt}`,
  );
}
assert(
  codexApp.error?.details?.shutdown?.exit?.code === 1 &&
    codexApp.error?.details?.shutdown?.pidGone === true,
  'Codex app failed process was not reclaimed',
);
assert(
  codexApp.sideEffects.every((entry) => entry.type === 'directory'),
  'Codex app created a product file in the probe root',
);

assert(codexMcp.status === 'Probe failed', 'Codex MCP must remain blocked');
assert(
  codexMcp.error?.details?.sent?.length === 1 &&
    codexMcp.error.details.sent[0].value?.method === 'initialize',
  'Codex MCP sent messages after blocked initialize',
);
assert(
  codexMcp.error?.details?.received?.length === 0 &&
    codexMcp.error?.details?.captures?.stdoutRaw === '',
  'Codex MCP unexpectedly returned protocol output',
);
for (const excerpt of [
  'could not create PATH aliases: File exists (os error 17)',
  'Failed to read config file /Users/qqqys/.codex/config.toml: Operation not permitted',
]) {
  assert(
    codexMcp.error?.details?.captures?.stderrRaw?.includes(excerpt),
    `Codex MCP stderr omits: ${excerpt}`,
  );
}
assert(
  codexMcp.error?.details?.shutdown?.exit?.code === 1 &&
    codexMcp.error?.details?.shutdown?.pidGone === true,
  'Codex MCP failed process was not reclaimed',
);
assert(
  codexMcp.sideEffects.every((entry) => entry.type === 'directory'),
  'Codex MCP created a product file in the probe root',
);

for (const [relative, expectedHash] of [
  ['scripts/run-phase-1d-probe.mjs', EXPECTED.runner],
  ['scripts/phase-1d-qwen.sb', EXPECTED.qwenProfile],
  ['scripts/phase-1d-codex.sb', EXPECTED.codexProfile],
]) {
  const raw = await readFile(path.join(researchRoot, relative));
  assert(sha256(raw) === expectedHash, `${relative}: harness hash mismatch`);
}

const documentEntries = await Promise.all(
  [
    '10-phase-1d-runtime-probe-normalization.md',
    '11-phase-1d-runtime-results-and-open-claims.md',
    'evidence/phase-1d-runtime-probes.md',
    'probes/03-phase-1d-executed-runtime-probes.md',
  ].map(async (relative) => ({
    relative,
    text: await readFile(path.join(researchRoot, relative), 'utf8'),
  })),
);
const documents = new Map(
  documentEntries.map(({ relative, text }) => [relative, text]),
);
const allDocuments = documentEntries.map(({ text }) => text).join('\n');
const evidenceDocument = documents.get('evidence/phase-1d-runtime-probes.md');

const tableRecords = [
  ...evidenceDocument.matchAll(
    /^\| `(EVD-[^`]+)`\s+\| `(RUNTIME|SOURCE)`\s+\|/gmu,
  ),
].map((match) => ({ id: match[1], type: match[2] }));
assert(tableRecords.length === 6, 'Evidence index must contain exactly 6 rows');
assert(
  new Set(tableRecords.map(({ id }) => id)).size === 6,
  'Evidence index contains duplicate IDs',
);
for (const [id, type] of EVIDENCE_TYPES) {
  assert(
    tableRecords.some((record) => record.id === id && record.type === type),
    `Evidence index omits ${id} as ${type}`,
  );
}
assert(
  tableRecords.filter(({ type }) => type === 'RUNTIME').length === 4 &&
    tableRecords.filter(({ type }) => type === 'SOURCE').length === 2,
  'Evidence type count must be 4 RUNTIME + 2 SOURCE',
);

const detailedIds = [
  ...evidenceDocument.matchAll(/^evidence_id: (EVD-[^\s]+)$/gmu),
].map((match) => match[1]);
assert(
  detailedIds.length === 6 && new Set(detailedIds).size === 6,
  'Evidence ledger must contain 6 unique detailed Records',
);
for (const [id, type] of EVIDENCE_TYPES) {
  const start = evidenceDocument.indexOf(`evidence_id: ${id}`);
  assert(start !== -1, `Detailed Record missing ${id}`);
  const next = evidenceDocument.indexOf('\nevidence_id: ', start + 1);
  const block = evidenceDocument.slice(
    start,
    next === -1 ? evidenceDocument.length : next,
  );
  assert(
    block.includes('source_url_or_path:'),
    `${id}: source_url_or_path missing`,
  );
  if (type === 'RUNTIME') {
    assert(
      block.includes('applicability: applicable') &&
        block.includes('procedure:') &&
        block.includes('side_effects:') &&
        block.includes('cleanup:'),
      `${id}: incomplete RUNTIME procedure contract`,
    );
  } else {
    assert(
      block.includes('applicability: not-applicable'),
      `${id}: SOURCE applicability mismatch`,
    );
  }
}

assert(
  !evidenceDocument.includes('/blob/rust-v0.145.0/'),
  'Codex SOURCE link must not use a movable tag',
);
assert(
  (
    evidenceDocument.match(
      /\/blob\/25af12f7e61572b0bc18ddb1008be543b91519b0\//gu,
    ) ?? []
  ).length >= 9,
  'Codex SOURCE links are not pinned to the captured commit',
);
for (const forbidden of [
  '收到一条 pre-initialize',
  '收到 initialize line',
  '处理首条 request 前',
  '读取第一条 request 前',
  'Supported or strong',
  'Codex handshake reproduced',
  'Model/provider/authenticated calls',
  '去除 workspace identity/path 后的 core descriptor',
]) {
  assert(
    !allDocuments.includes(forbidden),
    `Phase 1D documents contain forbidden overclaim: ${forbidden}`,
  );
}
assert(
  documents
    .get('10-phase-1d-runtime-probe-normalization.md')
    .match(
      /\| Qwen `CAP-10\.07-A01` long-running service\s+\| `Unknown`\s+\| `Partial`\s+\|/u,
    ),
  'Qwen CAP-10.07-A01 candidate must be exactly Partial',
);
for (const relative of [
  '10-phase-1d-runtime-probe-normalization.md',
  '11-phase-1d-runtime-results-and-open-claims.md',
  'evidence/phase-1d-runtime-probes.md',
  'probes/03-phase-1d-executed-runtime-probes.md',
]) {
  assert(
    documents
      .get(relative)
      .includes('one or more runtime env files could not be read') ||
      documents.get(relative).includes('runtime env 文件不可读') ||
      documents.get(relative).includes('runtime env 文件在 containment 中不可读'),
    `${relative}: Qwen runtime-env containment warning not disclosed`,
  );
}

const phase1c2Entries = await Promise.all(
  Object.entries(EXPECTED.phase1c2).map(async ([relative, expectedHash]) => {
    const text = await readFile(path.join(researchRoot, relative), 'utf8');
    assert(
      sha256(text) === expectedHash,
      `${relative}: frozen Phase 1C.2 lock drifted`,
    );
    return { relative, text };
  }),
);
const secondaryClaimText = phase1c2Entries
  .filter(({ relative }) => relative.startsWith('claims/'))
  .map(({ text }) => text)
  .join('\n');
const phase1c2ClaimIds = new Set(
  [...secondaryClaimText.matchAll(/`(CCQ-[^`]+)`/gu)].map(
    (match) => match[1],
  ),
);
assert(phase1c2ClaimIds.size === 30, 'Phase 1C.2 Claim count drifted');
let phase1c2RelationCount = 0;
for (const { relative, text } of phase1c2Entries.filter(({ relative }) =>
  relative.startsWith('claims/'),
)) {
  const relationSection =
    text.split('## 4. Evidence Relation Extension')[1]?.split(/^## /mu)[0] ??
    '';
  phase1c2RelationCount += [
    ...relationSection.matchAll(/`CCQ-[^`]+`/gu),
  ].length;
}
assert(phase1c2RelationCount === 62, 'Phase 1C.2 relation count drifted');

process.stdout.write(
  [
    `Phase 1D validation passed (${validationMode})`,
    'Qwen assertions independently derived: 13/13',
    'Codex app: blocked before protocol output',
    'Codex MCP: blocked before protocol output',
    'Evidence Records: 6 (4 RUNTIME + 2 SOURCE)',
    'Phase 1C.2 lock: 30 Claims / 62 relations unchanged',
    'Containment: profile-policy checked; no execution binding or remote canary claimed',
  ].join('\n') + '\n',
);
