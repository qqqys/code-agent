#!/usr/bin/env node

import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(scriptDir, '..');
const repoRoot = path.resolve(root, '../../..');
const prettier = path.join(repoRoot, 'node_modules', '.bin', 'prettier');

const frozen = {
  'artifacts/phase-2e/diagnostic-fault-matrix.json':
    '12d72a25792809ddfacff558bf74e9bd24277745d5af3933c3d4c7790d056915',
  'scripts/run-phase-2e-diagnostic-probes.mjs':
    'cdbd9e7cea755095e98903d721f9740026fc90058cc3e6f7d98d544eb7adbf97',
  'scripts/phase-2c-cli.sb':
    'ff5f599cad03d5c257827314c5a483e3cffaa2fef2d7b70a433e376ad1c700e6',
  'scripts/phase-2d-qwen.sb':
    '995857032aad38d2cea9876a4cbe70c7e29cde577539b9052af30c21d6ff8219',
  '21-final-capability-comparison.md':
    'f5e495a49af13331a80251f1d27e0ecb8c2738310cae828d9359fa34ebc13806',
  '22-qwen-opportunities-and-decisions.md':
    'c838363e1aec9cd86fb1c5c1a61d6573b471649e1c5eb2098bd34b22620c3377',
  '23-final-closure.md':
    '7d59da32bbceeffc7404ab2360fd5727086dfa9b3fe83c027ef1df9fd4d35840',
};
const markdownFiles = [
  'README.md',
  '26-phase-2e-diagnostic-fault-method.md',
  '27-phase-2e-diagnostic-fault-results.md',
  'probes/07-phase-2e-diagnostic-fault-probes.md',
  'evidence/phase-2e-diagnostic-faults.md',
  'comparisons/phase-2e-diagnostic-faults.md',
];
const expectedIds = [
  'P2E-CODEX-BASELINE',
  'P2E-CODEX-MISSING-EXECUTABLE',
  'P2E-CODEX-BAD-CA',
  'P2E-CODEX-CORRUPT-CACHE',
  'P2E-QWEN-BASELINE',
  'P2E-QWEN-MISSING-EXECUTABLE',
  'P2E-QWEN-UNWRITABLE-LOG',
];

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function fullPath(relativePath) {
  return path.join(root, relativePath);
}

function read(relativePath) {
  return fs.readFileSync(fullPath(relativePath), 'utf8');
}

function fileHash(relativePath) {
  return createHash('sha256')
    .update(fs.readFileSync(fullPath(relativePath)))
    .digest('hex');
}

execFileSync(process.execPath, [fullPath('scripts/validate-phase-2d.mjs')], {
  cwd: repoRoot,
  stdio: 'inherit',
});

for (const [relativePath, expected] of Object.entries(frozen)) {
  assert(fileHash(relativePath) === expected, `${relativePath} hash drift`);
}

execFileSync(prettier, ['--check', ...markdownFiles.map(fullPath)], {
  cwd: repoRoot,
  stdio: 'inherit',
});

const artifact = JSON.parse(
  read('artifacts/phase-2e/diagnostic-fault-matrix.json'),
);
assert(artifact.phase === 'Phase 2E', 'phase mismatch');
assert(artifact.gate?.passed === true, 'artifact gate is not Pass');
assert(artifact.gate?.runtimeExecutions === 7, 'execution count drift');
assert(
  artifact.gate?.observedCells === 6 &&
    artifact.gate?.notAssessedCells === 1,
  'assessment count drift',
);
assert(
  artifact.gate?.providerOrModelCalls === 0 &&
    artifact.gate?.credentialReads === 0 &&
    artifact.gate?.modelCost === 0,
  'credential/model boundary drift',
);
assert(
  artifact.matrixPolicy?.crossProductRelation === 'Not assessed',
  'cross-product relation drift',
);
assert(
  JSON.stringify(artifact.results.map((result) => result.id)) ===
    JSON.stringify(expectedIds),
  'scenario order/id drift',
);

const byId = Object.fromEntries(
  artifact.results.map((result) => [result.id, result]),
);
const codexBaseline = byId['P2E-CODEX-BASELINE'];
assert(
  codexBaseline.report.schemaVersion === 1 &&
    codexBaseline.report.codexVersion === '0.145.0' &&
    Object.keys(codexBaseline.report.checks).length === 18,
  'Codex baseline drift',
);
const codexMissing = byId['P2E-CODEX-MISSING-EXECUTABLE'];
assert(
  codexMissing.assessment.state === 'Not assessed' &&
    codexMissing.report.checks['git.environment'].details[
      'repo detected'
    ] === 'true',
  'Codex missing-executable projection drift',
);
const codexBadCa = byId['P2E-CODEX-BAD-CA'];
const caError =
  codexBadCa.report.checks['network.websocket_reachability'].details[
    'handshake stream error'
  ];
assert(
  codexBadCa.assessment.state === 'Observed' &&
    caError.includes('CODEX_CA_CERTIFICATE') &&
    caError.includes('no certificates found in PEM file'),
  'Codex bad-CA attribution drift',
);
const codexCache = byId['P2E-CODEX-CORRUPT-CACHE'];
assert(
  codexCache.assessment.state === 'Observed' &&
    codexCache.report.checks['updates.status'].details[
      'version cache parse'
    ].includes('EOF while parsing an object'),
  'Codex corrupt-cache attribution drift',
);

const qwenBaseline = byId['P2E-QWEN-BASELINE'];
assert(
  qwenBaseline.selected.status.body.daemon.qwenCodeVersion ===
    '0.21.0' &&
    qwenBaseline.selected.status.body.daemon.logMode === 'stable' &&
    qwenBaseline.selected.status.body.daemon.logHealth === 'ok',
  'Qwen baseline drift',
);
const qwenMissing = byId['P2E-QWEN-MISSING-EXECUTABLE'];
assert(
  qwenMissing.assessment.state === 'Observed' &&
    qwenMissing.assessment.selectedCells.length === 2 &&
    qwenMissing.assessment.selectedCells.every(
      (cell) =>
        cell.status === 'warning' &&
        cell.hint.endsWith('not found on PATH.') &&
        cell.error === undefined,
    ),
  'Qwen missing-tool attribution drift',
);
const qwenLog = byId['P2E-QWEN-UNWRITABLE-LOG'];
const qwenLogDaemon = qwenLog.selected.status.body.daemon;
assert(
  qwenLog.assessment.state === 'Observed' &&
    qwenLogDaemon.logMode === 'stderr-only' &&
    qwenLogDaemon.logHealth === 'degraded' &&
    JSON.stringify(qwenLogDaemon.logIssues) ===
      JSON.stringify(['init_failed']) &&
    qwenLogDaemon.logPath === undefined &&
    qwenLog.selected.status.body.issues.some(
      (issue) => issue.code === 'daemon_log_degraded',
    ),
  'Qwen log-degradation drift',
);

for (const result of artifact.results) {
  assert(
    JSON.stringify(result.fixtures) ===
      JSON.stringify(result.fixturesAfter),
    `${result.id} fixture drift`,
  );
  if (result.product === 'codex') {
    assert(
      result.runtime.timedOut === false &&
        result.runtime.signal === null &&
        result.runtime.spawnError === null &&
        result.runtime.stdout.truncated === false &&
        result.runtime.stderr.truncated === false &&
        result.runtime.cleanup.processGroupVerifiedGone === true &&
        result.parseError === null,
      `${result.id} runtime safety drift`,
    );
  } else {
    assert(
      result.captures.stdout.truncated === false &&
        result.captures.stderr.truncated === false &&
        result.shutdown.timedOut === false &&
        result.shutdown.processGroupVerifiedGone === true &&
        result.postShutdown.transportError,
      `${result.id} daemon safety drift`,
    );
  }
}

const readme = read('README.md');
assert(
  readme.includes('26-phase-2e-diagnostic-fault-method.md') &&
    readme.includes('27-phase-2e-diagnostic-fault-results.md'),
  'README Phase 2E projection drift',
);

process.stdout.write(
  `${JSON.stringify({
    phase: artifact.phase,
    status: 'PASS',
    executions: artifact.gate.runtimeExecutions,
    observed: artifact.gate.observedCells,
    notAssessed: artifact.gate.notAssessedCells,
    providerOrModelCalls: artifact.gate.providerOrModelCalls,
  })}\n`,
);
