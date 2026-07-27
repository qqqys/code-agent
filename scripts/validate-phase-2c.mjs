#!/usr/bin/env node

import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { isDeepStrictEqual } from 'node:util';
import { fileURLToPath } from 'node:url';
import { parse as parseYaml } from 'yaml';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(scriptDir, '..');
const repoRoot = path.resolve(root, '../../..');
const prettier = path.join(repoRoot, 'node_modules', '.bin', 'prettier');

const artifactPath = 'artifacts/phase-2c/config-schema-matrix.json';
const artifactHash =
  '37e6d06dd6ac34cf5dab1de179568f1d5495f669d77ebab365e76148f3dd36b8';
const runnerHash =
  'fd19b1a4ce4ceb9944591e8c88d4ceb1c5435f59c32a6984dd969b637662062a';
const profileHash =
  'ff5f599cad03d5c257827314c5a483e3cffaa2fef2d7b70a433e376ad1c700e6';
const frozenAt = '2026-07-26T12:43:43.496Z';

const frozenHashes = {
  [artifactPath]: artifactHash,
  'scripts/run-phase-2c-config-probes.mjs': runnerHash,
  'scripts/phase-2c-cli.sb': profileHash,
};

const markdownFiles = [
  '19-phase-2c-config-schema-method.md',
  '20-phase-2c-config-schema-results-and-open-probes.md',
  'probes/05-phase-2c-config-schema-probes.md',
  'evidence/phase-2c-config-schema.md',
  'comparisons/phase-2c-config-schema-runtime.md',
];

const scenarioIds = [
  'P2C-R1-1-IDENTITY',
  'P2C-R1-1-CONFIG-VALID',
  'P2C-R1-1-CONFIG-TYPE-ERROR',
  'P2C-R1-1-CONFIG-UNKNOWN',
  'P2C-R1-1-CONFIG-CROSS-FIELD-INVALID',
];
const products = ['claude', 'codex', 'qwen'];
const fixtureKindByScenario = {
  'P2C-R1-1-IDENTITY': null,
  'P2C-R1-1-CONFIG-VALID': 'valid',
  'P2C-R1-1-CONFIG-TYPE-ERROR': 'typeError',
  'P2C-R1-1-CONFIG-UNKNOWN': 'unknown',
  'P2C-R1-1-CONFIG-CROSS-FIELD-INVALID': 'crossFieldInvalid',
};
const evidenceExitKeyByFixtureKind = {
  valid: 'valid',
  typeError: 'type_error',
  unknown: 'unknown',
  crossFieldInvalid: 'cross_field_invalid',
};
const expectedIdentity = {
  codex: 'codex-cli 0.145.0\n',
  claude: '2.1.212 (Claude Code)\n',
  qwen: '0.21.0\n',
};
const expectedClassification = {
  valid: {
    codex: 'accepted-to-local-prompt-gate',
    claude: 'accepted-and-reported-effective',
    qwen: 'accepted-by-startup-loader',
  },
  typeError: {
    codex: 'rejected-with-field-and-type',
    claude: 'source-rejected-with-path-and-type',
    qwen: 'accepted-by-startup-loader-bounded-negative',
  },
  unknown: {
    codex: 'strictly-rejected-with-file-line-field',
    claude: 'accepted-and-preserved-by-passthrough-loader',
    qwen: 'accepted-with-fixture-preserved-on-disk',
  },
  crossFieldInvalid: {
    codex: 'rejected-with-config-object-path',
    claude: 'source-rejected-with-nested-path',
    qwen: 'accepted-by-startup-loader-bounded-negative',
  },
};

const expectedArtifactIdentity = {
  codex: {
    version: '0.145.0',
    sha256:
      '1da3f4e0e96028b8a771814293c3033dafd1971f943f6c7e79b0897fe705f590',
    treeSha256:
      '892f8a81f38ec7e2784938ef12fa6ef6a7bfe1cf5f757984f8c4288835e5f551',
  },
  claude: {
    version: '2.1.212',
    sha256:
      '09ecba2ab2df9b6ee5b0695e26f65dea60fb3b6af3d3542ee09f466838d1e574',
    treeSha256:
      'c2e8651cd407e418b0af7c1cb22314ff9dd36f4ecf1da3016a9ba62d00774e62',
  },
  qwen: {
    version: '0.21.0',
    entrySha256:
      '1db9709bf1753611ca2fec234cf5adf517376efeb1540fcf9e309da010f9ed38',
    bundleSha256:
      '4c05bdb0c903b8b18672cffb6d544b8f6bd96598a55dc1881f478b2ed945e4d1',
    treeSha256:
      'a106a1332b3266bef53839a74fb10c7fb961bec59dd791adbe92cd502eae500e',
    tarballSha256:
      '62fa5ea404a8d1f694edc54446bbd4ca6d3a69e090ec5975977ff51918d2aeca',
    nodeSha256:
      '32e234a5b6bec67d72a016f2baadf7fadf3afd328470b395b73af473fdee0d85',
  },
};
const commonIntegrity = {
  profile: profileHash,
  sandboxExec:
    '8857d087219f0f39d3e3c163e5d0a0aed690cc22f34b50c7eee3d74f93e69688',
  systemSandboxProfile:
    '1b2c4487f32fba48f29ba871bd1fec4f8d74af9543074c8805c3bc7094b9846f',
  dyldSandboxProfile:
    '06215a5d32689aefe395c29710e182eb54ba22162f50df8b4842290f8a19bf1c',
  systemVersion:
    'd90b1755e5dbb837d2ca1e11083c6e36e6219193a0fcf036d0f7cfe5366e031e',
};
const productIntegrity = {
  codex: {
    productTree: expectedArtifactIdentity.codex.treeSha256,
    productBinary: expectedArtifactIdentity.codex.sha256,
  },
  claude: {
    productTree: expectedArtifactIdentity.claude.treeSha256,
    productBinary: expectedArtifactIdentity.claude.sha256,
  },
  qwen: {
    productTree: expectedArtifactIdentity.qwen.treeSha256,
    productEntry: expectedArtifactIdentity.qwen.entrySha256,
    productBundle: expectedArtifactIdentity.qwen.bundleSha256,
    node: expectedArtifactIdentity.qwen.nodeSha256,
    opensslConfig:
      'a65a2cb9f4ee8ffdc7ef4f0ac600c0bdafb95b7b1ab457188ac610a62f5ad6b3',
    nodeRuntimeTrees:
      '88c1d0e37fa0c4d2cc8cf6e6cb92b468cbcd57adae71b44a7e3f276cbc8dd636',
  },
};

const baseEnvironmentKeys = [
  'CI',
  'HOME',
  'LANG',
  'LC_ALL',
  'NO_COLOR',
  'PATH',
  'TEMP',
  'TERM',
  'TMP',
  'TMPDIR',
  'XDG_CACHE_HOME',
  'XDG_CONFIG_HOME',
  'XDG_DATA_HOME',
  'XDG_STATE_HOME',
];
const productEnvironmentKeys = {
  codex: ['CODEX_HOME'],
  claude: [
    'CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC',
    'CLAUDE_CODE_DISABLE_OFFICIAL_MARKETPLACE_AUTOINSTALL',
    'CLAUDE_CODE_TMPDIR',
    'CLAUDE_CONFIG_DIR',
    'DISABLE_AUTOUPDATER',
    'DISABLE_TELEMETRY',
    'DISABLE_UPDATES',
  ],
  qwen: [
    'NODE_DISABLE_COMPILE_CACHE',
    'NO_BROWSER',
    'QWEN_CODE_DISABLE_PRECONNECT',
    'QWEN_CODE_MCP_APPROVALS_PATH',
    'QWEN_CODE_MEMORY_BASE_DIR',
    'QWEN_CODE_NO_BROWSER',
    'QWEN_CODE_SKIP_UPDATE_CHECK_ONCE',
    'QWEN_CODE_SYSTEM_DEFAULTS_PATH',
    'QWEN_CODE_SYSTEM_SETTINGS_PATH',
    'QWEN_CODE_TRUSTED_FOLDERS_PATH',
    'QWEN_HOME',
    'QWEN_RUNTIME_DIR',
    'QWEN_TELEMETRY_ENABLED',
    'QWEN_USAGE_STATISTICS_ENABLED',
  ],
};
const forbiddenEnvironmentKey =
  /(?:API_KEY|ACCESS_KEY|SECRET|PRIVATE_KEY|PASSWORD|CREDENTIAL|TOKEN|OAUTH|BEARER|PROXY|BASE_URL|ENDPOINT)/i;

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function fullPath(relativePath) {
  return path.join(root, relativePath);
}

function read(relativePath) {
  return fs.readFileSync(fullPath(relativePath), 'utf8');
}

function sha256(value) {
  return createHash('sha256').update(value).digest('hex');
}

function fileSha256(relativePath) {
  return sha256(fs.readFileSync(fullPath(relativePath)));
}

function sorted(values) {
  return [...values].sort();
}

function sameSet(actual, expected) {
  return isDeepStrictEqual(sorted(actual), sorted(expected));
}

function expectedEnvironment(result) {
  const state = `${result.runRoot}/state`;
  const base = {
    HOME: `${state}/home`,
    XDG_CACHE_HOME: `${state}/home/.cache`,
    XDG_CONFIG_HOME: `${state}/home/.config`,
    XDG_DATA_HOME: `${state}/home/.local/share`,
    XDG_STATE_HOME: `${state}/home/.local/state`,
    PATH: '/opt/homebrew/bin:/usr/bin:/bin:/usr/sbin:/sbin',
    LANG: 'C',
    LC_ALL: 'C',
    TERM: 'dumb',
    NO_COLOR: '1',
    CI: '1',
    TMPDIR: `${state}/tmp/`,
    TMP: `${state}/tmp`,
    TEMP: `${state}/tmp`,
  };
  if (result.product === 'codex') {
    return { ...base, CODEX_HOME: `${state}/config/codex-home` };
  }
  if (result.product === 'claude') {
    return {
      ...base,
      CLAUDE_CONFIG_DIR: `${state}/config/claude`,
      CLAUDE_CODE_TMPDIR: `${state}/tmp/claude`,
      CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC: '1',
      CLAUDE_CODE_DISABLE_OFFICIAL_MARKETPLACE_AUTOINSTALL: '1',
      DISABLE_AUTOUPDATER: '1',
      DISABLE_UPDATES: '1',
      DISABLE_TELEMETRY: '1',
    };
  }
  return {
    ...base,
    QWEN_HOME: `${state}/qwen-home`,
    QWEN_RUNTIME_DIR: `${state}/qwen-runtime`,
    QWEN_CODE_MEMORY_BASE_DIR: `${state}/qwen-memory`,
    QWEN_CODE_SYSTEM_SETTINGS_PATH: `${state}/config/qwen-system-settings.json`,
    QWEN_CODE_SYSTEM_DEFAULTS_PATH: `${state}/config/qwen-system-defaults.json`,
    QWEN_CODE_TRUSTED_FOLDERS_PATH: `${state}/config/qwen-trusted-folders.json`,
    QWEN_CODE_MCP_APPROVALS_PATH: `${state}/config/qwen-mcp-approvals.json`,
    QWEN_CODE_DISABLE_PRECONNECT: '1',
    QWEN_CODE_NO_BROWSER: '1',
    NO_BROWSER: '1',
    QWEN_CODE_SKIP_UPDATE_CHECK_ONCE: 'true',
    QWEN_TELEMETRY_ENABLED: 'false',
    QWEN_USAGE_STATISTICS_ENABLED: 'false',
    NODE_DISABLE_COMPILE_CACHE: '1',
  };
}

function validateFrozenHashes() {
  for (const [relativePath, expected] of Object.entries(frozenHashes)) {
    assert(fs.existsSync(fullPath(relativePath)), `missing ${relativePath}`);
    assert(
      fileSha256(relativePath) === expected,
      `${relativePath}: frozen SHA-256 drift`,
    );
  }
}

function validatePhase2BFreeze() {
  const output = execFileSync(
    process.execPath,
    [fullPath('scripts/validate-phase-2b.mjs')],
    {
      cwd: repoRoot,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    },
  );
  assert(
    output.includes('Phase 2B validation passed') &&
      output.includes('Upstream dependency: Phase 2A validation passed'),
    'Phase 2B / Phase 2A upstream freeze',
  );
}

function validateStream(stream, label) {
  assert(stream.encoding === 'base64', `${label}: encoding drift`);
  const raw = Buffer.from(stream.data, 'base64');
  assert(raw.length === stream.capturedBytes, `${label}: captured bytes`);
  assert(
    stream.observedBytes === stream.capturedBytes,
    `${label}: observed/captured mismatch`,
  );
  assert(raw.toString('utf8') === stream.utf8, `${label}: UTF-8 drift`);
  assert(sha256(raw) === stream.sha256, `${label}: hash drift`);
  assert(stream.truncated === false, `${label}: truncated`);
}

function mapInventory(entries) {
  return new Map(entries.map((entry) => [entry.path, entry]));
}

function sortInventory(entries) {
  return [...entries].sort((left, right) =>
    left.path.localeCompare(right.path),
  );
}

function validateInventory(result) {
  const label = `${result.scenarioId}/${result.product}`;
  const before = mapInventory(result.inventoryBefore);
  const after = mapInventory(result.inventoryAfter);
  const derived = { created: [], changed: [], removed: [] };
  for (const relativePath of new Set([...before.keys(), ...after.keys()])) {
    const beforeEntry = before.get(relativePath);
    const afterEntry = after.get(relativePath);
    if (!beforeEntry) derived.created.push(afterEntry);
    else if (!afterEntry) derived.removed.push(beforeEntry);
    else if (!isDeepStrictEqual(beforeEntry, afterEntry)) {
      derived.changed.push(afterEntry);
    }
    if (relativePath === 'state' || relativePath.startsWith('state/')) continue;
    assert(
      isDeepStrictEqual(beforeEntry, afterEntry),
      `${label}: delta outside state at ${relativePath}`,
    );
  }
  for (const group of ['created', 'changed', 'removed']) {
    assert(
      isDeepStrictEqual(
        sortInventory(result.sideEffects[group]),
        sortInventory(derived[group]),
      ),
      `${label}: ${group} delta drift`,
    );
    assert(
      result.sideEffects[group].every((entry) =>
        entry.path.startsWith('state/'),
      ),
      `${label}: ${group} outside state`,
    );
  }
  assert(result.sideEffects.removed.length === 0, `${label}: removed state`);
  assert(result.sideEffectBoundaryVerified === true, `${label}: boundary`);
}

function expectedConfigDefinitions(artifact, result, fixtureKind) {
  if (fixtureKind === null) return [];
  const primary = artifact.fixture.configs[result.product][fixtureKind];
  if (result.product !== 'qwen') return [primary];
  return [
    primary,
    artifact.fixture.qwenSupportingConfigs.system,
    artifact.fixture.qwenSupportingConfigs.defaults,
    artifact.fixture.qwenSupportingConfigs.trusted,
    artifact.fixture.qwenSupportingConfigs.approvals,
  ];
}

function validateFixtures(artifact, result, fixtureKind) {
  const label = `${result.scenarioId}/${result.product}`;
  const files = result.materializedFixtureManifest.files;
  const directories = result.materializedFixtureManifest.directories;
  const readme = files.find((entry) => entry.path.endsWith('/repo/README.md'));
  const sentinel = files.find((entry) =>
    entry.path.endsWith('/repo/sentinel.txt'),
  );
  assert(
    readme?.mode === '444' &&
      readme.sha256 === artifact.fixture.repoReadme.sha256,
    `${label}: README fixture`,
  );
  assert(
    sentinel?.mode === '444' &&
      sentinel.sha256 === artifact.fixture.sentinel.sha256,
    `${label}: sentinel fixture`,
  );
  assert(
    directories.length === 2 &&
      directories.every((entry) => entry.mode === '555'),
    `${label}: fixture directories`,
  );
  const definitions = expectedConfigDefinitions(
    artifact,
    result,
    fixtureKind,
  );
  assert(
    result.configFixtures.length === definitions.length,
    `${label}: config fixture count`,
  );
  assert(
    files.length === 2 + definitions.length,
    `${label}: materialized file count`,
  );
  assert(
    result.configFixturesUnchanged === true,
    `${label}: config unchanged assertion`,
  );
  for (const [index, definition] of definitions.entries()) {
    const recorded = result.configFixtures[index];
    assert(
      recorded.mode === '444' && recorded.sha256 === definition.sha256,
      `${label}: config fixture ${index} identity`,
    );
    const relative = path.relative(result.runRoot, recorded.path);
    for (const inventory of [
      result.inventoryBefore,
      result.inventoryAfter,
    ]) {
      const entry = inventory.find((candidate) => candidate.path === relative);
      assert(
        entry?.type === 'file' &&
          entry.mode === '444' &&
          entry.sha256 === definition.sha256,
        `${label}: config fixture ${index} inventory`,
      );
    }
    assert(
      files.some(
        (entry) =>
          entry.path === recorded.path &&
          entry.mode === '444' &&
          entry.sha256 === definition.sha256,
      ),
      `${label}: config fixture ${index} manifest`,
    );
  }
  if (fixtureKind === null) {
    assert(result.configFixture === null, `${label}: identity primary config`);
  } else {
    assert(
      isDeepStrictEqual(result.configFixture, result.configFixtures[0]),
      `${label}: primary config mismatch`,
    );
  }
}

function expectedArgs(artifact, result, fixtureKind) {
  if (fixtureKind === null) {
    return result.product === 'qwen'
      ? [artifact.artifacts.qwen.entryPath, '--version']
      : ['--version'];
  }
  if (result.product === 'codex') {
    return [
      '--strict-config',
      'exec',
      '--skip-git-repo-check',
      '--ephemeral',
      '--sandbox',
      'read-only',
      '--color',
      'never',
      '--json',
      '-',
    ];
  }
  if (result.product === 'claude') {
    return [
      '--bare',
      '--settings',
      result.configFixture.path,
      '--setting-sources',
      '',
      '--print',
      '--input-format',
      'stream-json',
      '--output-format',
      'stream-json',
      '--verbose',
      '--permission-mode',
      'plan',
      '--tools',
      '',
      '--no-session-persistence',
    ];
  }
  return [artifact.artifacts.qwen.entryPath, '--list-extensions'];
}

function parseClaudeResponse(result) {
  const lines = result.runtime.stdout.utf8.trimEnd().split('\n');
  assert(lines.length === 1, `${result.scenarioId}/claude: JSONL count`);
  const outer = JSON.parse(lines[0]);
  assert(
    outer.type === 'control_response' &&
      outer.response?.subtype === 'success' &&
      outer.response?.request_id === 'cfg-1',
    `${result.scenarioId}/claude: control envelope`,
  );
  return outer.response.response;
}

function validateBehavior(result, fixtureKind) {
  const label = `${result.scenarioId}/${result.product}`;
  const runtime = result.runtime;
  if (fixtureKind === null) {
    assert(runtime.exitCode === 0, `${label}: identity exit`);
    assert(runtime.signal === null, `${label}: identity signal`);
    assert(runtime.stdout.utf8 === expectedIdentity[result.product], label);
    assert(runtime.stderr.utf8 === '', `${label}: identity stderr`);
    assert(
      result.outcomeAssessment.classification === 'identity-preflight',
      `${label}: identity classification`,
    );
    return;
  }
  assert(
    result.outcomeAssessment.classification ===
      expectedClassification[fixtureKind][result.product],
    `${label}: classification drift`,
  );
  if (result.product === 'qwen') {
    assert(runtime.exitCode === 0 && runtime.signal === null, `${label}: exit`);
    assert(runtime.stdout.utf8 === 'No extensions installed.\n', label);
    assert(runtime.stderr.utf8 === '', `${label}: stderr`);
    return;
  }
  if (result.product === 'codex') {
    assert(runtime.exitCode === 1 && runtime.signal === null, `${label}: exit`);
    assert(runtime.stdout.utf8 === '', `${label}: stdout`);
    const config = result.configFixture.path;
    const expectedStderr = {
      valid: 'No prompt provided via stdin.\n',
      typeError: `Error loading config.toml:\n${config}:1:31: invalid type: string "false", expected a boolean\n  |\n1 | check_for_update_on_startup = "false"\n  |                               ^^^^^^^\n`,
      unknown: `Error loading config.toml:\n${config}:1:1: unknown configuration field \`phase2c_unknown_key\`\n  |\n1 | phase2c_unknown_key = true\n  | ^^^^^^^^^^^^^^^^^^^\n`,
      crossFieldInvalid: `Error loading config.toml:\n${config}:1:1: url is not supported for stdio\n  |\n1 | [mcp_servers.phase2c]\n  | ^^^^^^^^^^^^^^^^^^^^^\n`,
    };
    assert(
      runtime.stderr.utf8 === expectedStderr[fixtureKind],
      `${label}: stderr drift`,
    );
    return;
  }
  assert(runtime.exitCode === 0 && runtime.signal === null, `${label}: exit`);
  assert(runtime.stderr.utf8 === '', `${label}: stderr`);
  const response = parseClaudeResponse(result);
  if (fixtureKind === 'valid') {
    assert(
      response.effective?.model === 'claude-sonnet-4-5' &&
        response.sources?.length === 1 &&
        response.sources[0]?.source === 'flagSettings' &&
        response.sources[0]?.settings?.model === 'claude-sonnet-4-5' &&
        response.applied?.model === 'claude-sonnet-4-5' &&
        response.errors === undefined,
      `${label}: valid response`,
    );
  } else if (fixtureKind === 'unknown') {
    assert(
      response.effective?.phase2cUnknownKey === true &&
        response.sources?.length === 1 &&
        response.sources[0]?.settings?.phase2cUnknownKey === true &&
        response.errors === undefined,
      `${label}: unknown passthrough`,
    );
  } else {
    const expected =
      fixtureKind === 'typeError'
        ? {
            path: 'model',
            message: 'Expected string, but received number',
          }
        : {
            path: 'extraKnownMarketplaces.alpha.source.name',
            message:
              'Settings-sourced marketplace name must match its extraKnownMarketplaces key (got key "alpha" but source.name "beta")',
          };
    assert(
      Object.keys(response.effective ?? {}).length === 0 &&
        response.sources?.length === 0 &&
        response.errors?.length === 1 &&
        response.errors[0]?.file === result.configFixture.path &&
        response.errors[0]?.path === expected.path &&
        response.errors[0]?.message === expected.message,
      `${label}: validation response`,
    );
  }
}

function validateExecution(artifact, scenario, result) {
  const label = `${result.scenarioId}/${result.product}`;
  const fixtureKind = fixtureKindByScenario[result.scenarioId];
  assert(result.scenarioLabel === scenario.label, `${label}: label`);
  assert(
    result.command.cwd === `${result.runRoot}/repo`,
    `${label}: isolated cwd`,
  );
  assert(
    sameSet(Object.keys(result.command.environment), [
      ...baseEnvironmentKeys,
      ...productEnvironmentKeys[result.product],
    ]),
    `${label}: environment allowlist`,
  );
  assert(
    Object.keys(result.command.environment).every(
      (key) => !forbiddenEnvironmentKey.test(key),
    ),
    `${label}: credential/proxy environment`,
  );
  assert(
    isDeepStrictEqual(result.command.environment, expectedEnvironment(result)),
    `${label}: environment values`,
  );
  assert(
    isDeepStrictEqual(
      result.command.args,
      expectedArgs(artifact, result, fixtureKind),
    ),
    `${label}: argv`,
  );
  const expectedExecutable =
    result.product === 'codex'
      ? artifact.artifacts.codex.path
      : result.product === 'claude'
        ? artifact.artifacts.claude.path
        : artifact.artifacts.qwen.nodePath;
  assert(result.command.executable === expectedExecutable, `${label}: binary`);
  const expectedStdin =
    fixtureKind === null
      ? null
      : result.product === 'codex'
        ? ''
        : result.product === 'claude'
          ? artifact.fixture.claudeControlRequest.value
          : null;
  assert(result.command.stdin === expectedStdin, `${label}: stdin source`);

  const runtime = result.runtime;
  assert(runtime.timeoutMs === 15000, `${label}: timeout`);
  assert(runtime.streamHardStopMs === 17000, `${label}: hard stop`);
  assert(runtime.totalCleanupBoundMs === 18000, `${label}: cleanup bound`);
  assert(runtime.timedOut === false, `${label}: timed out`);
  assert(runtime.streamHardStopReached === false, `${label}: stream hard stop`);
  assert(runtime.spawnError === null, `${label}: spawn error`);
  assert(runtime.exitObserved === true, `${label}: exit event`);
  assert(runtime.closeObserved === true, `${label}: close event`);
  assert(runtime.stdinDelivery.endCalled === true, `${label}: EOF`);
  assert(runtime.stdinDelivery.streamError === null, `${label}: stdin error`);
  assert(
    runtime.stdinDelivery.attemptedBytes ===
      (expectedStdin === null ? 0 : Buffer.byteLength(expectedStdin)),
    `${label}: stdin bytes`,
  );
  assert(
    runtime.cleanup.processGroupVerifiedGone === true,
    `${label}: live process group`,
  );
  assert(runtime.cleanup.error === null, `${label}: cleanup error`);
  validateStream(runtime.stdout, `${label}/stdout`);
  validateStream(runtime.stderr, `${label}/stderr`);

  const expectedIntegrity = {
    ...commonIntegrity,
    ...productIntegrity[result.product],
  };
  assert(
    isDeepStrictEqual(result.executionIntegrity.expected, expectedIntegrity),
    `${label}: expected integrity`,
  );
  assert(
    isDeepStrictEqual(result.executionIntegrity.before, expectedIntegrity),
    `${label}: before integrity`,
  );
  assert(
    isDeepStrictEqual(result.executionIntegrity.after, expectedIntegrity),
    `${label}: after integrity`,
  );
  assert(result.executionIntegrity.matched === true, `${label}: integrity`);

  validateFixtures(artifact, result, fixtureKind);
  validateInventory(result);
  validateBehavior(result, fixtureKind);
}

function validateArtifact(artifact) {
  assert(artifact.schemaVersion === 3, 'artifact schema');
  assert(
    artifact.probeId === 'CCQ-PHASE2C-R1-1-CONFIG-MATRIX-001',
    'probe id',
  );
  assert(artifact.status === 'captured', 'capture status');
  assert(artifact.startedAt === '2026-07-26T12:43:32.691Z', 'start time');
  assert(artifact.finishedAt === frozenAt, 'finish time');
  assert(
    artifact.platform.os === 'darwin' &&
      artifact.platform.arch === 'arm64' &&
      artifact.platform.node === 'v25.9.0',
    'platform',
  );
  const policy = artifact.policy;
  for (const [key, expected] of Object.entries({
    inheritedEnvironment: false,
    credentialsCopied: false,
    userOrModelTurnsSent: false,
    modelRequestsExpected: false,
    persistentWritesOutsideStateAllowed: false,
    networkAllowed: false,
  })) {
    assert(policy[key] === expected, `policy ${key}`);
  }
  assert(policy.runnerSha256 === runnerHash, 'runner hash in artifact');
  assert(policy.sandboxProfileSha256 === profileHash, 'profile hash in artifact');
  assert(policy.identityPreflight.passed === true, 'identity preflight');
  assert(
    policy.sideEffectBoundary.allExecutionsVerified === true,
    'side-effect boundary',
  );
  assert(
    policy.cleanup.allProcessGroupsVerifiedGone === true &&
      policy.cleanup.allCloseEventsObserved === true,
    'cleanup envelope',
  );
  assert(
    artifact.projectionPolicy.supportEdgesCreatedByRunner === false &&
      artifact.projectionPolicy.layerPrecedenceAssessed === false &&
      artifact.projectionPolicy.schemaCompletenessAssessed === false,
    'projection boundary',
  );
  assert(
    artifact.projectionPolicy.qwenBoundedNegative.includes(
      'does not prove all consumers',
    ),
    'Qwen bounded-negative policy',
  );

  for (const [product, expected] of Object.entries(expectedArtifactIdentity)) {
    const actual = artifact.artifacts[product];
    for (const [key, value] of Object.entries(expected)) {
      assert(actual[key] === value, `${product} artifact ${key}`);
    }
  }
  assert(
    artifact.artifacts.qwen.nodeRuntimeManifest.sha256 ===
      productIntegrity.qwen.nodeRuntimeTrees,
    'Node runtime manifest',
  );
  assert(
    artifact.artifacts.qwen.nodeRuntimeConfig.sha256 ===
      productIntegrity.qwen.opensslConfig,
    'OpenSSL config',
  );

  for (const key of ['repoReadme', 'sentinel', 'claudeControlRequest']) {
    const definition = artifact.fixture[key];
    assert(sha256(definition.value) === definition.sha256, `fixture ${key}`);
  }
  for (const definitions of Object.values(artifact.fixture.configs)) {
    for (const definition of Object.values(definitions)) {
      assert(
        sha256(definition.value) === definition.sha256,
        'primary config fixture hash',
      );
    }
  }
  for (const definition of Object.values(
    artifact.fixture.qwenSupportingConfigs,
  )) {
    assert(
      sha256(definition.value) === definition.sha256,
      'Qwen supporting config fixture hash',
    );
  }

  assert(artifact.scenarios.length === 5, 'scenario count');
  assert(artifact.results.length === 15, 'execution count');
  assert(
    sameSet(
      artifact.scenarios.map((scenario) => scenario.id),
      scenarioIds,
    ),
    'scenario inventory',
  );
  const seen = new Set();
  for (const scenario of artifact.scenarios) {
    assert(sameSet(scenario.products, products), `${scenario.id}: products`);
    assert(
      scenario.fixtureKind === fixtureKindByScenario[scenario.id],
      `${scenario.id}: fixture kind`,
    );
    const results = artifact.results.filter(
      (result) => result.scenarioId === scenario.id,
    );
    assert(
      sameSet(
        results.map((result) => result.product),
        products,
      ),
      `${scenario.id}: result products`,
    );
    for (const result of results) {
      const key = `${result.scenarioId}/${result.product}`;
      assert(!seen.has(key), `duplicate ${key}`);
      seen.add(key);
      validateExecution(artifact, scenario, result);
    }
  }
}

function yamlBlocks(content) {
  return [...content.matchAll(/```yaml\n([\s\S]*?)\n```/g)].map((match) =>
    parseYaml(match[1]),
  );
}

function walkMarkdownFiles(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(directory, entry.name);
    return entry.isDirectory()
      ? walkMarkdownFiles(entryPath)
      : entry.name.endsWith('.md')
        ? [entryPath]
        : [];
  });
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function validateNewEvidenceIdUniqueness(expectedEvidenceIds) {
  const evidenceRoot = fullPath('evidence');
  const currentPath = fullPath('evidence/phase-2c-config-schema.md');
  const current = fs.readFileSync(currentPath, 'utf8');
  for (const evidenceId of expectedEvidenceIds) {
    const escaped = escapeRegExp(evidenceId);
    assert(
      [...current.matchAll(new RegExp(`^evidence_id: ${escaped}$`, 'gm'))]
        .length === 1,
      `${evidenceId}: YAML declaration count`,
    );
    assert(
      [
        ...current.matchAll(
          new RegExp(`^###(?: [^\\n]*)? \`${escaped}\`$`, 'gm'),
        ),
      ].length === 1,
      `${evidenceId}: heading declaration count`,
    );
    for (const evidencePath of walkMarkdownFiles(evidenceRoot)) {
      if (evidencePath === currentPath) continue;
      const content = fs.readFileSync(evidencePath, 'utf8');
      const legacyTableDeclaration = new RegExp(
        `^\\| \`${escaped}\`\\s*\\|`,
        'm',
      );
      const yamlDeclaration = new RegExp(`^evidence_id: ${escaped}$`, 'm');
      const headingDeclaration = new RegExp(
        `^###(?: [^\\n]*)? \`${escaped}\`$`,
        'm',
      );
      assert(
        !legacyTableDeclaration.test(content) &&
          !yamlDeclaration.test(content) &&
          !headingDeclaration.test(content),
        `${evidenceId}: collides with ${path.relative(root, evidencePath)}`,
      );
    }
  }
}

function expectedEvidenceSpecifications(artifact) {
  const qwenPackageRoot = path.dirname(artifact.artifacts.qwen.entryPath);
  return new Map([
    [
      'EVD-codex-RUNTIME-008',
      {
        evidence_type: 'RUNTIME',
        product: 'Codex',
        version: artifact.artifacts.codex.version,
        release_channel: 'latest',
        product_surface: 'cli',
        source_url_or_path: artifactPath,
        artifact_hash_or_excerpt: `sha256:${artifactHash}`,
        artifactProduct: 'codex',
      },
    ],
    [
      'EVD-claude-code-RUNTIME-004',
      {
        evidence_type: 'RUNTIME',
        product: 'Claude Code',
        version: artifact.artifacts.claude.version,
        release_channel: 'stable',
        product_surface: 'cli',
        source_url_or_path: artifactPath,
        artifact_hash_or_excerpt: `sha256:${artifactHash}`,
        artifactProduct: 'claude',
      },
    ],
    [
      'EVD-qwen-code-RUNTIME-005',
      {
        evidence_type: 'RUNTIME',
        product: 'Qwen Code',
        version: artifact.artifacts.qwen.version,
        release_channel: 'stable',
        product_surface: 'cli',
        source_url_or_path: artifactPath,
        artifact_hash_or_excerpt: `sha256:${artifactHash}`,
        artifactProduct: 'qwen',
      },
    ],
    [
      'EVD-codex-SOURCE-004',
      {
        evidence_type: 'SOURCE',
        product: 'Codex',
        version: `rust-v${artifact.artifacts.codex.version}`,
        release_channel: 'latest',
        product_surface: 'cli',
        source_url_or_path:
          'https://github.com/openai/codex/blob/rust-v0.145.0/codex-rs/config/src/mcp_types.rs',
        artifact_hash_or_excerpt:
          'bounded anchor; RawMcpServerConfig conversion rejects url for stdio',
      },
    ],
    [
      'EVD-claude-code-BINARY-002',
      {
        evidence_type: 'BINARY',
        product: 'Claude Code',
        version: artifact.artifacts.claude.version,
        release_channel: 'stable',
        product_surface: 'cli',
        source_url_or_path: artifact.artifacts.claude.path,
        artifact_hash_or_excerpt: `sha256:${artifact.artifacts.claude.sha256}`,
      },
    ],
    [
      'EVD-qwen-code-SOURCE-010',
      {
        evidence_type: 'SOURCE',
        product: 'Qwen Code',
        version: artifact.artifacts.qwen.version,
        release_channel: 'stable',
        product_surface: 'cli',
        source_url_or_path: [
          path.join(qwenPackageRoot, 'chunks/chunk-TEHGS6UP.js'),
          path.join(qwenPackageRoot, 'chunks/gemini-QS36EBZV.js'),
          path.join(qwenPackageRoot, 'chunks/chunk-PHOF65IG.js'),
        ].join('; '),
        artifact_hash_or_excerpt: `frozen package tree sha256:${artifact.artifacts.qwen.treeSha256}`,
      },
    ],
  ]);
}

function validateNotApplicableProbe(record) {
  assert(
    isDeepStrictEqual(record.runtime_probe, {
      applicability: 'not-applicable',
      preconditions: ['not-applicable'],
      procedure: ['not-applicable'],
      stdout: 'not-applicable',
      stderr: 'not-applicable',
      exit_code: 'not-applicable',
      side_effects: ['not-applicable'],
      cleanup: ['not-applicable'],
      started_at: 'not-applicable',
      finished_at: 'not-applicable',
    }),
    `${record.evidence_id}: non-runtime probe contract`,
  );
}

function validateRuntimeEvidence(artifact, record, product) {
  const evidenceId = record.evidence_id;
  const executions = artifact.results.filter(
    (result) =>
      result.product === product &&
      result.scenarioId !== 'P2C-R1-1-IDENTITY',
  );
  assert(executions.length === 4, `${evidenceId}: execution count`);
  const executionByFixtureKind = new Map(
    executions.map((result) => [
      fixtureKindByScenario[result.scenarioId],
      result,
    ]),
  );
  const orderedFixtureKinds = [
    'valid',
    'typeError',
    'unknown',
    'crossFieldInvalid',
  ];
  assert(
    sameSet([...executionByFixtureKind.keys()], orderedFixtureKinds),
    `${evidenceId}: fixture inventory`,
  );

  const expectedExitCode = Object.fromEntries(
    orderedFixtureKinds.map((fixtureKind) => [
      evidenceExitKeyByFixtureKind[fixtureKind],
      executionByFixtureKind.get(fixtureKind).runtime.exitCode,
    ]),
  );
  assert(
    isDeepStrictEqual(record.runtime_probe.exit_code, expectedExitCode),
    `${evidenceId}: exit-code map`,
  );

  const startedAt = executions
    .map((result) => result.runtime.startedAt)
    .sort()[0];
  const finishedAt = executions
    .map((result) => result.runtime.finishedAt)
    .sort()
    .at(-1);
  assert(
    record.runtime_probe.started_at === startedAt,
    `${evidenceId}: started_at`,
  );
  assert(
    record.runtime_probe.finished_at === finishedAt,
    `${evidenceId}: finished_at`,
  );

  const osName =
    artifact.platform.os === 'darwin'
      ? 'Darwin'
      : artifact.platform.os;
  const expectedPlatform = [
    `${osName} ${artifact.platform.arch}`,
    'non-TTY',
  ];
  if (product === 'qwen') {
    expectedPlatform.push(
      `Node ${artifact.platform.node.replace(/^v/, '')}`,
    );
  }
  assert(
    isDeepStrictEqual(record.environment.platform, expectedPlatform),
    `${evidenceId}: artifact-derived platform`,
  );

  const createdCounts = Object.fromEntries(
    orderedFixtureKinds.map((fixtureKind) => [
      fixtureKind,
      executionByFixtureKind.get(fixtureKind).sideEffects.created.length,
    ]),
  );
  assert(
    executions.every(
      (result) =>
        result.sideEffects.changed.length === 0 &&
        result.sideEffects.removed.length === 0,
    ),
    `${evidenceId}: changed or removed entries`,
  );
  assert(
    executions.every(
      (result) =>
        result.runtime.cleanup.processGroupVerifiedGone === true &&
        result.runtime.timedOut === false &&
        result.runtime.stdout.truncated === false &&
        result.runtime.stderr.truncated === false,
    ),
    `${evidenceId}: cleanup envelope`,
  );

  const expectedSummary = {
    codex: {
      stdout: 'exact raw stream in artifact; zero bytes for all four config cases',
      stderr:
        'exact raw stream in artifact; local prompt gate or full file/line/caret validation diagnostic',
      sideEffects: [
        `created inventory entries: valid=${createdCounts.valid}, type=${createdCounts.typeError}, unknown=${createdCounts.unknown}, cross=${createdCounts.crossFieldInvalid}`,
        'no changed or removed entries',
        'config fixture mode and SHA-256 unchanged',
        'every persistent delta under the execution state root',
      ],
    },
    claude: {
      stdout:
        'one exact control_response JSONL record per case; raw bytes and hashes in artifact',
      stderr: 'zero bytes for all four cases',
      sideEffects: [
        'six created inventory entries per case',
        'no changed or removed entries',
        'config fixture mode and SHA-256 unchanged',
        'every persistent delta under the execution state root',
      ],
    },
    qwen: {
      stdout: 'exact "No extensions installed.\\n" for all four cases',
      stderr: 'zero bytes for all four cases',
      sideEffects: [
        'eight created extension-state inventory entries per case',
        'no changed or removed entries',
        'all five config fixture modes and SHA-256 values unchanged',
        'every persistent delta under the execution state root',
      ],
    },
  }[product];
  const outputMatches =
    product === 'codex'
      ? executions.every((result) => result.runtime.stdout.utf8 === '') &&
        executions.every((result) => result.runtime.stderr.utf8 !== '')
      : product === 'claude'
        ? executions.every(
            (result) =>
              result.runtime.stdout.utf8.trimEnd().split('\n').length === 1 &&
              JSON.parse(result.runtime.stdout.utf8).type ===
                'control_response',
          ) &&
          executions.every((result) => result.runtime.stderr.utf8 === '') &&
          Object.values(createdCounts).every((count) => count === 6)
        : executions.every(
            (result) =>
              result.runtime.stdout.utf8 === 'No extensions installed.\n',
          ) &&
          executions.every((result) => result.runtime.stderr.utf8 === '') &&
          Object.values(createdCounts).every((count) => count === 8);
  assert(outputMatches, `${evidenceId}: stream summary`);
  assert(
    record.runtime_probe.stdout === expectedSummary.stdout,
    `${evidenceId}: stdout description`,
  );
  assert(
    record.runtime_probe.stderr === expectedSummary.stderr,
    `${evidenceId}: stderr description`,
  );
  assert(
    isDeepStrictEqual(
      record.runtime_probe.side_effects,
      expectedSummary.sideEffects,
    ),
    `${evidenceId}: side-effect summary`,
  );
  assert(
    isDeepStrictEqual(record.runtime_probe.cleanup, [
      'close observed and original process group verified gone',
      'no timeout or truncated stream',
    ]),
    `${evidenceId}: cleanup description`,
  );
  assert(
    record.runtime_probe.applicability === 'applicable',
    `${evidenceId}: applicability`,
  );
}

function claimDeclarations() {
  const declarations = new Map();
  const pattern =
    /^\| `(?<claimId>CCQ-(?:codex|claude-code|qwen-code)-CAP-\d{2}\.\d{2}-A\d{2}-\d{3})` \| `(?<atomicId>CAP-\d{2}\.\d{2}-A\d{2})` \|/gm;
  for (const claimPath of walkMarkdownFiles(fullPath('claims'))) {
    const content = fs.readFileSync(claimPath, 'utf8');
    for (const match of content.matchAll(pattern)) {
      const entries = declarations.get(match.groups.claimId) ?? [];
      entries.push({
        atomicId: match.groups.atomicId,
        path: path.relative(root, claimPath),
      });
      declarations.set(match.groups.claimId, entries);
    }
  }
  return declarations;
}

function validationCriteriaFromArtifact(artifact, product) {
  const result = (fixtureKind) =>
    artifact.results.find(
      (candidate) =>
        candidate.product === product &&
        fixtureKindByScenario[candidate.scenarioId] === fixtureKind,
    );
  const typeError = result('typeError');
  const unknown = result('unknown');
  const crossFieldInvalid = result('crossFieldInvalid');
  assert(
    typeError && unknown && crossFieldInvalid,
    `${product}: validation fixture inventory`,
  );
  if (product === 'codex') {
    return {
      typeError:
        typeError.runtime.stderr.utf8.includes('expected a boolean') &&
        typeError.runtime.stderr.utf8.includes(':1:31:'),
      unknown:
        unknown.runtime.stderr.utf8.includes(
          'unknown configuration field `phase2c_unknown_key`',
        ) && unknown.runtime.stderr.utf8.includes(':1:1:'),
      crossFieldInvalid:
        crossFieldInvalid.runtime.stderr.utf8.includes(
          'url is not supported for stdio',
        ) && crossFieldInvalid.runtime.stderr.utf8.includes(':1:1:'),
    };
  }
  if (product === 'claude') {
    const typeResponse = parseClaudeResponse(typeError);
    const unknownResponse = parseClaudeResponse(unknown);
    const crossResponse = parseClaudeResponse(crossFieldInvalid);
    return {
      typeError:
        typeResponse.errors?.length === 1 &&
        typeResponse.errors[0]?.path === 'model' &&
        typeResponse.errors[0]?.message ===
          'Expected string, but received number',
      unknown:
        unknownResponse.errors !== undefined &&
        unknownResponse.errors.length > 0,
      crossFieldInvalid:
        crossResponse.errors?.length === 1 &&
        crossResponse.errors[0]?.path ===
          'extraKnownMarketplaces.alpha.source.name',
    };
  }
  return {
    typeError:
      typeError.runtime.exitCode !== 0 ||
      typeError.runtime.stderr.capturedBytes > 0,
    unknown:
      unknown.runtime.exitCode !== 0 ||
      unknown.runtime.stderr.capturedBytes > 0,
    crossFieldInvalid:
      crossFieldInvalid.runtime.exitCode !== 0 ||
      crossFieldInvalid.runtime.stderr.capturedBytes > 0,
  };
}

function deriveAlignmentState(artifact, leftProduct, rightProduct) {
  const left = validationCriteriaFromArtifact(artifact, leftProduct);
  const right = validationCriteriaFromArtifact(artifact, rightProduct);
  const criteria = Object.keys(left);
  const leftClosed = criteria.filter((criterion) => left[criterion]);
  const rightClosed = criteria.filter((criterion) => right[criterion]);
  if (leftClosed.length === 0 || rightClosed.length === 0) return 'Unknown';
  const common = criteria.filter(
    (criterion) => left[criterion] && right[criterion],
  );
  return common.length > 0 ? 'Partial overlap' : 'Unknown';
}

function validateComparisonGraph(artifact, comparisons) {
  const expected = new Map([
    [
      'CMP-CAP-12.09-A02-codex-claude-code-001',
      {
        left: {
          product: 'Codex',
          claim_ids: ['CCQ-codex-CAP-12.09-A02-001'],
        },
        right: { product: 'Claude Code', claim_ids: [] },
      },
    ],
    [
      'CMP-CAP-12.09-A02-codex-qwen-code-001',
      {
        left: {
          product: 'Codex',
          claim_ids: ['CCQ-codex-CAP-12.09-A02-001'],
        },
        right: {
          product: 'Qwen Code',
          claim_ids: ['CCQ-qwen-code-CAP-12.09-A02-001'],
        },
      },
    ],
    [
      'CMP-CAP-12.09-A02-claude-code-qwen-code-001',
      {
        left: { product: 'Claude Code', claim_ids: [] },
        right: {
          product: 'Qwen Code',
          claim_ids: ['CCQ-qwen-code-CAP-12.09-A02-001'],
        },
      },
    ],
  ]);
  assert(
    sameSet(
      comparisons.map((record) => record.comparison_id),
      [...expected.keys()],
    ),
    'Comparison Record inventory',
  );
  const declarations = claimDeclarations();
  const productSlug = {
    Codex: 'codex',
    'Claude Code': 'claude-code',
    'Qwen Code': 'qwen-code',
  };
  const artifactProduct = {
    Codex: 'codex',
    'Claude Code': 'claude',
    'Qwen Code': 'qwen',
  };
  for (const record of comparisons) {
    const specification = expected.get(record.comparison_id);
    assert(specification, `${record.comparison_id}: expected specification`);
    assert(
      record.atomic_capability_id === 'CAP-12.09-A02',
      `${record.comparison_id}: Atomic`,
    );
    assert(
      record.user_job ===
        '在 provider/model 运行前定位配置类型、未知字段和非法组合',
      `${record.comparison_id}: user job`,
    );
    assert(
      isDeepStrictEqual(record.left, specification.left),
      `${record.comparison_id}: left graph`,
    );
    assert(
      isDeepStrictEqual(record.right, specification.right),
      `${record.comparison_id}: right graph`,
    );
    assert(
      record.alignment_state ===
        deriveAlignmentState(
          artifact,
          artifactProduct[record.left.product],
          artifactProduct[record.right.product],
        ),
      `${record.comparison_id}: alignment`,
    );
    assert(record.confidence === 'Medium', `${record.comparison_id}: confidence`);
    assert(record.last_checked === frozenAt, `${record.comparison_id}: time`);
    for (const side of [record.left, record.right]) {
      for (const claimId of side.claim_ids) {
        const match = claimId.match(
          /^CCQ-(codex|claude-code|qwen-code)-(CAP-\d{2}\.\d{2}-A\d{2})-\d{3}$/,
        );
        assert(match, `${record.comparison_id}: malformed Claim ${claimId}`);
        assert(
          match[1] === productSlug[side.product] &&
            match[2] === record.atomic_capability_id,
          `${record.comparison_id}: Claim identity ${claimId}`,
        );
        const declared = declarations.get(claimId) ?? [];
        assert(
          declared.some(
            (entry) => entry.atomicId === record.atomic_capability_id,
          ),
          `${record.comparison_id}: undeclared Claim ${claimId}`,
        );
      }
    }
  }
}

function schemaIdentityRemainsDeferred(artifact) {
  const registry = read('03-atomic-capability-registry.md');
  const registryRow = registry
    .split('\n')
    .find((line) => line.startsWith('| `CAP-12.09-A02` |'));
  assert(registryRow, 'CAP-12.09-A02 registry row');
  const registryRequiresSchemaVersion = registryRow.includes(
    'schema 版本需记录',
  );
  const artifactRecordsProductSchemaIdentity =
    'productConfigSchemaIdentity' in artifact ||
    'productConfigSchemaVersions' in artifact ||
    'configSchemaIdentity' in artifact.projectionPolicy;
  return (
    registryRequiresSchemaVersion &&
    artifact.projectionPolicy.schemaCompletenessAssessed === false &&
    !artifactRecordsProductSchemaIdentity
  );
}

function validateDocumentSummaries(artifact, comparisons) {
  const method = read('19-phase-2c-config-schema-method.md');
  const results = read('20-phase-2c-config-schema-results-and-open-probes.md');
  const probes = read('probes/05-phase-2c-config-schema-probes.md');
  const evidence = read('evidence/phase-2c-config-schema.md');
  const comparison = read(
    'comparisons/phase-2c-config-schema-runtime.md',
  );
  const identityExecutions = artifact.results.filter(
    (result) => result.scenarioId === 'P2C-R1-1-IDENTITY',
  ).length;
  const configExecutions = artifact.results.length - identityExecutions;
  const timeoutCount = artifact.results.filter(
    (result) => result.runtime.timedOut,
  ).length;
  const signalCount = artifact.results.filter(
    (result) => result.runtime.signal !== null,
  ).length;
  const truncatedCount = artifact.results.filter(
    (result) =>
      result.runtime.stdout.truncated || result.runtime.stderr.truncated,
  ).length;
  const spawnErrorCount = artifact.results.filter(
    (result) => result.runtime.spawnError !== null,
  ).length;
  const runtimeFaultCount =
    timeoutCount + signalCount + truncatedCount + spawnErrorCount;
  const inheritedCredentialCount = Number(
    artifact.policy.inheritedEnvironment ||
      artifact.policy.credentialsCopied,
  );
  const networkAllowedCount = Number(artifact.policy.networkAllowed);
  const modelTurnCount = Number(
    artifact.policy.userOrModelTurnsSent ||
      artifact.policy.modelRequestsExpected,
  );
  const safetyPolicyCount =
    inheritedCredentialCount + networkAllowedCount + modelTurnCount;
  const changedConfigFixtureCount = artifact.results.filter(
    (result) =>
      result.scenarioId !== 'P2C-R1-1-IDENTITY' &&
      result.configFixturesUnchanged !== true,
  ).length;
  const productSourceDriftCount = artifact.results.filter(
    (result) => result.executionIntegrity.matched !== true,
  ).length;
  const alignmentCounts = comparisons.reduce((counts, record) => {
    counts[record.alignment_state] =
      (counts[record.alignment_state] ?? 0) + 1;
    return counts;
  }, {});
  assert(
    schemaIdentityRemainsDeferred(artifact),
    'schema identity/version should remain deferred',
  );

  for (const marker of [
    '> 状态：Frozen',
    '但不宣称\n`CAP-12.09-A02` 或 Phase 2B `R1-1` 已完全闭合',
    '含 Qwen 的 pairwise alignment 保持\n   `Unknown`',
    'R1-1b schema identity/version',
  ]) {
    assert(method.includes(marker), `method marker: ${marker}`);
  }
  for (const marker of [
    '> 状态：Executed / Frozen',
    `共 \`${artifact.scenarios.length}\` 个 scenario、\`${artifact.results.length}\` 个 product execution`,
    `| Identity                                                | \`${identityExecutions}/${identityExecutions}\``,
    `| Config executions                                       | \`${configExecutions}/${configExecutions}\``,
    `| Integrity / fixture / side-effect / PGID cleanup        | \`${artifact.results.length}/${artifact.results.length}\``,
    `| Timeout / signal / truncated stream / spawn error       | \`${runtimeFaultCount}\``,
    `| Network allowed / inherited credential / model turn     | \`${safetyPolicyCount}\``,
    `| Product source file changed                             | \`${productSourceDriftCount}\``,
    'schema identity/version',
    '`R1-1b` 保持 Deferred',
  ]) {
    assert(probes.includes(marker), `probe marker: ${marker}`);
  }
  for (const marker of [
    '> 状态：Frozen',
    `| Scenarios / product executions                           | \`${artifact.scenarios.length} / ${artifact.results.length}\``,
    `| Exact identity preflight                                 | \`${identityExecutions}/${identityExecutions} Pass\``,
    `| Config category executions                               | \`${configExecutions}/${configExecutions} Pass\``,
    `| Integrity / fixture / side-effect / original PGID gate   | \`${artifact.results.length}/${artifact.results.length} Pass\``,
    `| Timeout / signal / truncated output / spawn error        | \`${timeoutCount} / ${signalCount} / ${truncatedCount} / ${spawnErrorCount}\``,
    `| Inherited credential / network / user-model turn         | \`${inheritedCredentialCount} / ${networkAllowedCount} / ${modelTurnCount}\``,
    `| Changed or removed config fixture                        | \`${changedConfigFixtureCount}\``,
    `| Pairwise runtime Comparison Record                       | \`${comparisons.length}\``,
    `| Product source or Phase 2A/2B frozen file modified       | \`${productSourceDriftCount}\``,
    '| R1-1b | schema identity/version |',
    '完整契约仍未闭合',
    '含 Qwen 的两组 pairwise 保持',
    '`Unknown`',
  ]) {
    assert(results.includes(marker), `result marker: ${marker}`);
  }
  for (const marker of [
    '> Atomic：`CAP-12.09-A02`',
    'alignment_state: Partial overlap',
    'alignment_state: Unknown',
    'R1-1b schema identity/version',
  ]) {
    assert(comparison.includes(marker), `comparison marker: ${marker}`);
  }
  assert(
    [...comparison.matchAll(/^alignment_state: Partial overlap$/gm)].length ===
      alignmentCounts['Partial overlap'] &&
      [...comparison.matchAll(/^alignment_state: Unknown$/gm)].length ===
        alignmentCounts.Unknown,
    'comparison alignment summary',
  );
  assert(
    evidence.includes(
      'The four cases do not prove complete schema coverage or a schema version.',
    ),
    'Evidence schema-version boundary',
  );
  for (const [relativePath, content] of [
    ['method', method],
    ['results', results],
    ['probes', probes],
    ['comparison', comparison],
  ]) {
    assert(
      !content.includes('R1-1 config schema matrix` 已闭合') &&
        !content.includes('三组 pairwise alignment 都是 `Partial overlap`'),
      `${relativePath}: stale closure or alignment`,
    );
  }
}

function validateMarkdown(artifact) {
  for (const relativePath of markdownFiles) {
    const content = read(relativePath);
    assert(content.includes(frozenAt), `${relativePath}: frozen time`);
    assert(content.includes(artifactHash), `${relativePath}: artifact hash`);
  }
  const evidence = yamlBlocks(read('evidence/phase-2c-config-schema.md')).filter(
    (record) => record.evidence_id,
  );
  const expectedEvidenceIds = [
    'EVD-codex-RUNTIME-008',
    'EVD-claude-code-RUNTIME-004',
    'EVD-qwen-code-RUNTIME-005',
    'EVD-codex-SOURCE-004',
    'EVD-claude-code-BINARY-002',
    'EVD-qwen-code-SOURCE-010',
  ];
  validateNewEvidenceIdUniqueness(expectedEvidenceIds);
  assert(
    sameSet(
      evidence.map((record) => record.evidence_id),
      expectedEvidenceIds,
    ),
    'Evidence Record inventory',
  );
  const evidenceSpecifications = expectedEvidenceSpecifications(artifact);
  for (const record of evidence) {
    for (const key of [
      'evidence_type',
      'product',
      'version',
      'release_channel',
      'product_surface',
      'source_url_or_path',
      'captured_at',
      'environment',
      'artifact_hash_or_excerpt',
      'runtime_probe',
      'record_relations',
      'limitations',
    ]) {
      assert(key in record, `${record.evidence_id}: missing ${key}`);
    }
    assert(
      record.captured_at === frozenAt,
      `${record.evidence_id}: captured time`,
    );
    assert(
      Array.isArray(record.record_relations) &&
        record.record_relations.length === 0,
      `${record.evidence_id}: premature relation`,
    );
    const specification = evidenceSpecifications.get(record.evidence_id);
    assert(specification, `${record.evidence_id}: specification`);
    for (const key of [
      'evidence_type',
      'product',
      'version',
      'release_channel',
      'product_surface',
      'source_url_or_path',
      'artifact_hash_or_excerpt',
    ]) {
      assert(
        isDeepStrictEqual(record[key], specification[key]),
        `${record.evidence_id}: ${key}`,
      );
    }
    if (specification.artifactProduct) {
      validateRuntimeEvidence(
        artifact,
        record,
        specification.artifactProduct,
      );
    } else {
      validateNotApplicableProbe(record);
    }
  }

  const comparisons = yamlBlocks(
    read('comparisons/phase-2c-config-schema-runtime.md'),
  ).filter((record) => record.comparison_id);
  assert(comparisons.length === 3, 'Comparison Record count');
  validateComparisonGraph(artifact, comparisons);
  assert(
    !read('comparisons/phase-2c-config-schema-runtime.md').includes(
      'alignment_state: Equivalent',
    ),
    'premature Equivalent relation',
  );
  const results = read('20-phase-2c-config-schema-results-and-open-probes.md');
  assert(
    results.includes('| R1-1b | schema identity/version |'),
    'schema identity/version remains open',
  );
  assert(
    !results.includes('R1-1 config schema matrix` 已闭合'),
    'premature R1-1 closure',
  );
  validateDocumentSummaries(artifact, comparisons);
}

function validateFormatting() {
  execFileSync(
    prettier,
    ['--check', ...markdownFiles.map(fullPath), fileURLToPath(import.meta.url)],
    { stdio: 'inherit' },
  );
}

validateFrozenHashes();
validatePhase2BFreeze();
const artifact = JSON.parse(read(artifactPath));
validateArtifact(artifact);
validateMarkdown(artifact);
validateFormatting();

console.log(
  JSON.stringify({
    phase: '2C',
    status: 'PASS',
    scenarios: artifact.scenarios.length,
    executions: artifact.results.length,
    evidenceRecords: 6,
    comparisonRecords: 3,
    artifactSha256: artifactHash,
    runnerSha256: runnerHash,
    profileSha256: profileHash,
  }),
);
