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
  'artifacts/phase-2d/config-identity-layering.json':
    'dc74e8fd2a4caa06cac8481743bb6e1fdb76c403b21229673fce1ef29f3b3187',
  'scripts/run-phase-2d-config-layer-probes.mjs':
    '4ebe1e0582a73fc47e1292b89b5337512a586a1f91b601f0766df36a48474cd7',
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
  '24-stage-3-reopen-and-phase-2d-method.md',
  '25-phase-2d-config-identity-layering-results.md',
  'probes/06-phase-2d-config-identity-layering-probes.md',
  'evidence/phase-2d-config-identity-layering.md',
  'comparisons/phase-2d-config-identity-layering.md',
];
const expectedIds = [
  'P2D-R1-1B-QWEN-SCHEMA-IDENTITY',
  'P2D-R1-2-CODEX-TRUSTED',
  'P2D-R1-2-CODEX-UNTRUSTED',
  'P2D-R1-2-CODEX-SESSION',
  'P2D-R1-2-CLAUDE-ALL-LAYERS',
  'P2D-R1-2-CLAUDE-PROJECT-USER',
  'P2D-R1-2-QWEN-TRUSTED',
  'P2D-R1-2-QWEN-UNTRUSTED',
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

execFileSync(process.execPath, [fullPath('scripts/validate-phase-2c.mjs')], {
  cwd: repoRoot,
  stdio: 'inherit',
});

for (const [relativePath, expected] of Object.entries(frozen)) {
  assert(
    fileHash(relativePath) === expected,
    `${relativePath} hash drift`,
  );
}

execFileSync(prettier, ['--check', ...markdownFiles.map(fullPath)], {
  cwd: repoRoot,
  stdio: 'inherit',
});

const artifact = JSON.parse(
  read('artifacts/phase-2d/config-identity-layering.json'),
);
assert(artifact.phase === 'Phase 2D', 'phase mismatch');
assert(artifact.gate?.passed === true, 'artifact gate is not Pass');
assert(artifact.gate?.failures?.length === 0, 'artifact has failures');
assert(
  artifact.gate.runtimeExecutions === 8,
  'runtime execution count drift',
);
assert(
  artifact.gate.providerOrModelCalls === 0 &&
    artifact.gate.credentialReads === 0 &&
    artifact.gate.modelCost === 0,
  'credential/model boundary drift',
);
assert(
  JSON.stringify(artifact.results.map((result) => result.id)) ===
    JSON.stringify(expectedIds),
  'scenario order/id drift',
);
assert(
  artifact.schemaIdentity?.relation ===
    'Different mechanisms / Not directly comparable',
  'schema relation drift',
);
assert(
  artifact.schemaIdentity?.codex?.root?.version === null &&
    artifact.schemaIdentity?.claude?.editorSchema?.root?.version ===
      null &&
    artifact.schemaIdentity?.qwen?.expectedVersion === 4,
  'schema mechanism drift',
);

const byId = Object.fromEntries(
  artifact.results.map((result) => [result.id, result]),
);
const qwenIdentity =
  byId['P2D-R1-1B-QWEN-SCHEMA-IDENTITY'];
assert(
  qwenIdentity.observed.SETTINGS_VERSION === 4 &&
    qwenIdentity.observed.SETTINGS_VERSION_KEY === '$version',
  'Qwen runtime settings identity drift',
);

const codexExpected = {
  'P2D-R1-2-CODEX-TRUSTED': [
    'codex-project-nested',
    'medium',
    'project',
    'project',
  ],
  'P2D-R1-2-CODEX-UNTRUSTED': [
    'codex-user',
    'low',
    'user',
    'user',
  ],
  'P2D-R1-2-CODEX-SESSION': [
    'codex-session',
    'medium',
    'sessionFlags',
    'project',
  ],
};
for (const [id, expected] of Object.entries(codexExpected)) {
  const result = byId[id].configResponse.result;
  assert(result.config.model === expected[0], `${id} model drift`);
  assert(
    result.config.model_reasoning_effort === expected[1],
    `${id} effort drift`,
  );
  assert(
    result.origins.model.name.type === expected[2] &&
      result.origins.model_reasoning_effort.name.type === expected[3],
    `${id} origin drift`,
  );
}
assert(
  byId['P2D-R1-2-CODEX-UNTRUSTED'].configResponse.result.layers.filter(
    (layer) => layer.name.type === 'project' && layer.disabledReason,
  ).length === 2,
  'Codex untrusted project suppression drift',
);

const claudeAll =
  byId['P2D-R1-2-CLAUDE-ALL-LAYERS'].settingsResponse;
const claudeProject =
  byId['P2D-R1-2-CLAUDE-PROJECT-USER'].settingsResponse;
assert(
  claudeAll.effective.model === 'claude-local' &&
    claudeAll.effective.cleanupPeriodDays === 22,
  'Claude all-layer effective drift',
);
assert(
  claudeProject.effective.model === 'claude-project',
  'Claude project-user effective drift',
);
assert(
  claudeAll.sources.map((source) => source.source).join(',') ===
    'userSettings,projectSettings,localSettings' &&
    claudeProject.sources.map((source) => source.source).join(',') ===
      'userSettings,projectSettings',
  'Claude source projection drift',
);

function qwenSetting(result, key) {
  return result.selected.settings.body.settings.find(
    (setting) => setting.key === key,
  );
}

for (const [id, expected] of [
  ['P2D-R1-2-QWEN-TRUSTED', ['trusted', true, 30]],
  ['P2D-R1-2-QWEN-UNTRUSTED', ['untrusted', false, 20]],
]) {
  const result = byId[id];
  assert(
    qwenSetting(result, 'general.cleanupPeriodDays').values
      .effective === 40,
    `${id} system precedence drift`,
  );
  const threshold = qwenSetting(
    result,
    'general.sessionRecapAwayThresholdMinutes',
  ).values;
  assert(
    threshold.effective === expected[2] &&
      threshold.user === 20 &&
      threshold.workspace === 30,
    `${id} workspace merge drift`,
  );
  assert(
    result.selected.trust.body.effective.state === expected[0] &&
      result.selected.trust.body.effective.source === 'file',
    `${id} trust response drift`,
  );
  assert(
    result.selected.capabilities.body.workspaces.find(
      (workspace) => workspace.primary,
    ).trusted === expected[1],
    `${id} capability trust drift`,
  );
  assert(
    result.shutdown.processGroupVerifiedGone === true &&
      result.postShutdown.transportError,
    `${id} cleanup drift`,
  );
}

for (const result of artifact.results) {
  if (result.runtime) {
    assert(
      result.runtime.timedOut === false &&
        result.runtime.signal === null &&
        result.runtime.spawnError === null &&
        result.runtime.stdout.truncated === false &&
        result.runtime.stderr.truncated === false &&
        result.runtime.cleanup.processGroupVerifiedGone === true,
      `${result.id} runtime safety drift`,
    );
  }
  if (result.fixtures) {
    assert(
      JSON.stringify(result.fixtures) ===
        JSON.stringify(result.fixturesAfter),
      `${result.id} fixture drift`,
    );
  }
}

const readme = read('README.md');
assert(
  readme.includes('25-phase-2d-config-identity-layering-results.md'),
  'README Phase 2D entry drift',
);
for (const relativePath of markdownFiles) {
  const text = read(relativePath);
  assert(!text.includes('Superpowers'), `${relativePath} names banned flow`);
}

process.stdout.write(
  `${JSON.stringify({
    phase: 'Phase 2D',
    status: 'PASS',
    executions: artifact.results.length,
    schemaMechanisms: 3,
    pairwiseLayering: '3 Partial overlap',
    providerOrModelCalls: 0,
  })}\n`,
);
