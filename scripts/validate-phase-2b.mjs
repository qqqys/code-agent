#!/usr/bin/env node

import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { isDeepStrictEqual } from 'node:util';
import { fileURLToPath } from 'node:url';
import { parse as parseYaml } from 'yaml';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(scriptDir, '..');
const repoRoot = path.resolve(root, '../../..');
const prettier = path.join(repoRoot, 'node_modules', '.bin', 'prettier');

const finalArtifactPath = 'artifacts/phase-2b/safe-wave.json';
const finalArtifactHash =
  'bdbc65635d4e2ec454bd4bed03d5e29c82f97a6154f57dc28ebba00d167a5393';
const runnerHash =
  'ec8dcafc7c1b0f1b6e47a1f8cd2601af08b2ce5728471f1a1d524cd36bb8d175';
const profileHash =
  'ff5f599cad03d5c257827314c5a483e3cffaa2fef2d7b70a433e376ad1c700e6';

const frozenHashes = {
  'artifacts/phase-2b/safe-wave-attempt-1.json':
    'bd6afbb369ef6c71955d4ba3627a042a39cb487051923065cb1e9ae806af9d80',
  'artifacts/phase-2b/safe-wave-attempt-2.json':
    '7f72ac0930c8efcc810ed3739b89b16e51e3f26c6c77ab1e39787d084c7badb9',
  'artifacts/phase-2b/safe-wave-attempt-3.json':
    '89b60df3adb719216761ff449e84dee6cf3aa1c08b77949aea1068145d3812ac',
  'artifacts/phase-2b/safe-wave-attempt-4.json':
    '77fcc71965704621fd8e91f4e24f0bcc3b2157b1717a388fe952b98d8c0d135e',
  [finalArtifactPath]: finalArtifactHash,
  'scripts/run-phase-2b-safe-probes.mjs': runnerHash,
  'scripts/phase-2b-cli.sb': profileHash,
};

const phase2BMarkdownFiles = [
  '17-phase-2b-aligned-runtime-method.md',
  '18-phase-2b-comparison-deltas-and-open-probes.md',
  'probes/04-phase-2b-aligned-runtime-probes.md',
  'evidence/phase-2b-aligned-runtime.md',
  'comparisons/phase-2b-headless-runtime.md',
  'comparisons/phase-2b-diagnostics-and-config-runtime.md',
];

const phase2BFormatFiles = [
  ...phase2BMarkdownFiles,
  'scripts/validate-phase-2b.mjs',
];

const expectedScenarioProducts = {
  'P2B-E0-IDENTITY': ['claude', 'codex', 'qwen'],
  'P2B-E0-INVALID-SCHEMA': ['claude', 'codex', 'qwen'],
  'P2B-E0-EMPTY-EOF': ['claude', 'codex', 'qwen'],
  'P2B-E0-ARGV-NOAUTH': ['claude', 'codex', 'qwen'],
  'P2B-E0-STDIN-NOAUTH': ['claude', 'codex', 'qwen'],
  'P2B-E0-DOCTOR-EMPTY': ['claude', 'codex'],
  'P2B-E0-CONFIG-MALFORMED': ['claude', 'codex', 'qwen'],
  'P2B-E0-CONFIG-UNKNOWN': ['claude', 'codex', 'qwen'],
};

const expectedIdentity = {
  codex: 'codex-cli 0.145.0\n',
  claude: '2.1.212 (Claude Code)\n',
  qwen: '0.21.0\n',
};

const expectedEvidenceRecords = {
  'EVD-codex-RUNTIME-006': {
    product: 'Codex',
    productKey: 'codex',
    version: '0.145.0',
    releaseChannel: 'latest',
    provider: 'OpenAI default; direct network denied',
    featureFlags: ['not-applicable'],
    scenarios: [
      'P2B-E0-INVALID-SCHEMA',
      'P2B-E0-EMPTY-EOF',
      'P2B-E0-ARGV-NOAUTH',
      'P2B-E0-STDIN-NOAUTH',
    ],
    exitCode: {
      invalid_schema: 1,
      empty_eof: 1,
      argv_noauth: 'timeout at 15000ms; no exit code; SIGTERM',
      stdin_noauth: 'timeout at 15000ms; no exit code; SIGTERM',
    },
  },
  'EVD-claude-code-RUNTIME-002': {
    product: 'Claude Code',
    productKey: 'claude',
    version: '2.1.212',
    releaseChannel: 'stable',
    provider:
      'not-applicable; local missing-auth gate before provider/model request',
    featureFlags: ['not-applicable'],
    scenarios: [
      'P2B-E0-INVALID-SCHEMA',
      'P2B-E0-EMPTY-EOF',
      'P2B-E0-ARGV-NOAUTH',
      'P2B-E0-STDIN-NOAUTH',
    ],
    exitCode: {
      invalid_schema: 1,
      empty_eof: 1,
      argv_noauth: 1,
      stdin_noauth: 1,
    },
  },
  'EVD-qwen-code-RUNTIME-003': {
    product: 'Qwen Code',
    productKey: 'qwen',
    version: '0.21.0',
    releaseChannel: 'stable',
    provider: 'OpenAI-compatible via --auth-type openai',
    featureFlags: [
      'safe mode disables hooks/extensions/skills/MCP servers/QWEN.md',
    ],
    scenarios: [
      'P2B-E0-INVALID-SCHEMA',
      'P2B-E0-EMPTY-EOF',
      'P2B-E0-ARGV-NOAUTH',
      'P2B-E0-STDIN-NOAUTH',
    ],
    exitCode: {
      invalid_schema: 52,
      empty_eof: 1,
      argv_noauth: 1,
      stdin_noauth: 1,
    },
  },
  'EVD-codex-RUNTIME-007': {
    product: 'Codex',
    productKey: 'codex',
    version: '0.145.0',
    releaseChannel: 'latest',
    provider:
      'ChatGPT auth reachability in doctor; strict-config exits before provider selection',
    featureFlags: ['default set reported by doctor; no probe override'],
    scenarios: [
      'P2B-E0-DOCTOR-EMPTY',
      'P2B-E0-CONFIG-MALFORMED',
      'P2B-E0-CONFIG-UNKNOWN',
    ],
    exitCode: {
      doctor_empty: 1,
      config_malformed: 1,
      config_unknown: 1,
    },
  },
  'EVD-claude-code-RUNTIME-003': {
    product: 'Claude Code',
    productKey: 'claude',
    version: '2.1.212',
    releaseChannel: 'stable',
    provider: 'not-applicable; no provider/model selection or request observed',
    featureFlags: ['not-applicable'],
    scenarios: [
      'P2B-E0-DOCTOR-EMPTY',
      'P2B-E0-CONFIG-MALFORMED',
      'P2B-E0-CONFIG-UNKNOWN',
    ],
    exitCode: {
      doctor_empty: 0,
      config_malformed: 0,
      config_unknown: 0,
    },
  },
  'EVD-qwen-code-RUNTIME-004': {
    product: 'Qwen Code',
    productKey: 'qwen',
    version: '0.21.0',
    releaseChannel: 'stable',
    provider: 'not-applicable; command exits before provider selection',
    featureFlags: ['not-applicable'],
    scenarios: ['P2B-E0-CONFIG-MALFORMED', 'P2B-E0-CONFIG-UNKNOWN'],
    exitCode: {
      config_malformed: 0,
      config_unknown: 0,
    },
  },
};

const expectedArtifactIdentity = {
  codex: {
    version: '0.145.0',
    sha256: '1da3f4e0e96028b8a771814293c3033dafd1971f943f6c7e79b0897fe705f590',
    treeSha256:
      '892f8a81f38ec7e2784938ef12fa6ef6a7bfe1cf5f757984f8c4288835e5f551',
  },
  claude: {
    version: '2.1.212',
    sha256: '09ecba2ab2df9b6ee5b0695e26f65dea60fb3b6af3d3542ee09f466838d1e574',
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

const expectedCommonExecutionIntegrity = {
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

const expectedProductExecutionIntegrity = {
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

const forbiddenEnvironmentKey =
  /(?:API_KEY|ACCESS_KEY|SECRET|PRIVATE_KEY|PASSWORD|CREDENTIAL|TOKEN|OAUTH|BEARER|PROXY|BASE_URL|ENDPOINT)/i;

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

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function fullPath(relativePath) {
  return path.join(root, relativePath);
}

function read(relativePath) {
  return fs.readFileSync(fullPath(relativePath), 'utf8');
}

function sha256(data) {
  return createHash('sha256').update(data).digest('hex');
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

function parseJsonLines(text, label) {
  const lines = text.trimEnd().split('\n').filter(Boolean);
  return lines.map((line, index) => {
    try {
      return JSON.parse(line);
    } catch (error) {
      throw new Error(`${label}: line ${index + 1} is not JSON: ${error}`);
    }
  });
}

function mapInventory(entries) {
  return new Map(entries.map((entry) => [entry.path, entry]));
}

function sortInventory(entries) {
  return [...entries].sort((left, right) =>
    left.path.localeCompare(right.path),
  );
}

function findInventory(result, relativePath) {
  const entry = result.inventoryAfter.find(
    (candidate) => candidate.path === relativePath,
  );
  assert(
    entry,
    `${result.scenarioId}/${result.product}: missing inventory ${relativePath}`,
  );
  return entry;
}

function expectedEnvironment(result) {
  const state = `${result.runRoot}/state`;
  const environment = {
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
    return { ...environment, CODEX_HOME: `${state}/config/codex-home` };
  }
  if (result.product === 'claude') {
    return {
      ...environment,
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
    ...environment,
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

function validateStream(stream, label) {
  assert(stream.encoding === 'base64', `${label}: encoding is not base64`);
  const raw = Buffer.from(stream.data, 'base64');
  assert(raw.length === stream.capturedBytes, `${label}: captured byte drift`);
  assert(
    stream.observedBytes === stream.capturedBytes,
    `${label}: observed/captured byte mismatch`,
  );
  assert(raw.toString('utf8') === stream.utf8, `${label}: UTF-8 view drift`);
  assert(sha256(raw) === stream.sha256, `${label}: stream SHA-256 drift`);
  assert(stream.truncated === false, `${label}: output was truncated`);
}

function validateMaterializedFixture(result, artifact) {
  const files = result.materializedFixtureManifest.files;
  const directories = result.materializedFixtureManifest.directories;
  const expectedFiles = {
    'repo/README.md': artifact.fixture.repoReadme.sha256,
    'repo/sentinel.txt': artifact.fixture.sentinel.sha256,
    'fixtures/invalid-schema.json': artifact.fixture.invalidSchema.sha256,
    'fixtures/valid-schema.json': artifact.fixture.validSchema.sha256,
  };
  assert(
    files.length === 4,
    `${result.scenarioId}/${result.product}: fixture files`,
  );
  assert(
    directories.length === 2,
    `${result.scenarioId}/${result.product}: fixture directories`,
  );
  for (const [suffix, expectedHash] of Object.entries(expectedFiles)) {
    const file = files.find((entry) => entry.path.endsWith(`/${suffix}`));
    assert(file, `${result.scenarioId}/${result.product}: missing ${suffix}`);
    assert(
      file.mode === '444',
      `${result.scenarioId}/${result.product}: ${suffix} mode`,
    );
    assert(
      file.sha256 === expectedHash,
      `${result.scenarioId}/${result.product}: ${suffix} hash`,
    );
  }
  for (const directory of directories) {
    assert(
      directory.mode === '555',
      `${result.scenarioId}/${result.product}: read-only directory mode`,
    );
  }
}

function validateInventory(result) {
  const label = `${result.scenarioId}/${result.product}`;
  const before = mapInventory(result.inventoryBefore);
  const after = mapInventory(result.inventoryAfter);
  const allPaths = new Set([...before.keys(), ...after.keys()]);
  const derived = { created: [], changed: [], removed: [] };

  for (const relativePath of allPaths) {
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
      `${label}: persistent delta outside state/: ${relativePath}`,
    );
  }

  for (const group of ['created', 'changed', 'removed']) {
    assert(
      isDeepStrictEqual(
        sortInventory(result.sideEffects[group]),
        sortInventory(derived[group]),
      ),
      `${label}: ${group} inventory delta drift`,
    );
    for (const entry of result.sideEffects[group]) {
      assert(
        entry.path.startsWith('state/'),
        `${label}: ${group} outside state/: ${entry.path}`,
      );
    }
  }
  assert(
    result.sideEffects.removed.length === 0,
    `${label}: unexpected removal`,
  );
  assert(
    result.sideEffectBoundaryVerified === true,
    `${label}: boundary failed`,
  );

  for (const entry of result.inventoryAfter) {
    assert(
      [
        'directory',
        'file',
        'symlink',
        'socket',
        'fifo',
        'block',
        'character',
      ].includes(entry.type),
      `${label}: unknown inventory type ${entry.type}`,
    );
    if (entry.type === 'file') {
      assert(
        /^[a-f0-9]{64}$/.test(entry.sha256),
        `${label}: file without full SHA-256 ${entry.path}`,
      );
    }
    if (entry.type === 'symlink') {
      assert(
        typeof entry.target === 'string',
        `${label}: symlink without target ${entry.path}`,
      );
    }
  }
}

function validateExecution(result, scenario, artifact) {
  const label = `${result.scenarioId}/${result.product}`;
  assert(result.scenarioLabel === scenario.label, `${label}: label drift`);
  assert(result.risk === scenario.risk, `${label}: risk drift`);
  assert(
    isDeepStrictEqual(
      result.candidateAtomics,
      scenario.candidateAtomics[result.product],
    ),
    `${label}: candidate Atomic drift`,
  );
  assert(
    isDeepStrictEqual(
      result.candidateDimensions,
      scenario.candidateDimensions[result.product],
    ),
    `${label}: candidate dimension drift`,
  );
  assert(
    !('qualifiesDimensions' in result),
    `${label}: premature qualification`,
  );
  assert(
    result.command.cwd === `${result.runRoot}/repo`,
    `${label}: cwd is outside isolated repo`,
  );

  const forbiddenKeys = Object.keys(result.command.environment).filter((key) =>
    forbiddenEnvironmentKey.test(key),
  );
  assert(
    forbiddenKeys.length === 0,
    `${label}: forbidden inherited environment keys ${forbiddenKeys.join(', ')}`,
  );
  assert(
    sameSet(Object.keys(result.command.environment), [
      ...baseEnvironmentKeys,
      ...productEnvironmentKeys[result.product],
    ]),
    `${label}: environment allowlist drift`,
  );
  assert(
    isDeepStrictEqual(result.command.environment, expectedEnvironment(result)),
    `${label}: environment value or isolated-root drift`,
  );

  const runtime = result.runtime;
  assert(runtime.timeoutMs === 15000, `${label}: execution timeout drift`);
  assert(runtime.streamHardStopMs === 17000, `${label}: hard-stop drift`);
  assert(
    runtime.totalCleanupBoundMs === 18000,
    `${label}: cleanup bound drift`,
  );
  assert(runtime.streamHardStopReached === false, `${label}: stream hard-stop`);
  assert(runtime.spawnError === null, `${label}: spawn error`);
  assert(runtime.exitObserved === true, `${label}: exit event not observed`);
  assert(runtime.closeObserved === true, `${label}: close event not observed`);
  assert(runtime.stdinDelivery.endCalled === true, `${label}: stdin not ended`);
  assert(
    runtime.stdinDelivery.streamError === null,
    `${label}: stdin stream error`,
  );
  assert(
    runtime.cleanup.processGroupVerifiedGone === true,
    `${label}: original PGID still live`,
  );
  assert(runtime.cleanup.error === null, `${label}: cleanup error`);
  assert(
    Number.isInteger(runtime.cleanup.processGroupId),
    `${label}: missing PGID`,
  );
  validateStream(runtime.stdout, `${label}/stdout`);
  validateStream(runtime.stderr, `${label}/stderr`);

  assert(
    result.executionIntegrity.matched === true,
    `${label}: integrity failed`,
  );
  assert(
    isDeepStrictEqual(result.executionIntegrity.expected, {
      ...expectedCommonExecutionIntegrity,
      ...expectedProductExecutionIntegrity[result.product],
    }),
    `${label}: expected identity is not bound to the frozen cohort`,
  );
  assert(
    isDeepStrictEqual(
      result.executionIntegrity.expected,
      result.executionIntegrity.before,
    ),
    `${label}: pre-execution identity mismatch`,
  );
  assert(
    isDeepStrictEqual(
      result.executionIntegrity.expected,
      result.executionIntegrity.after,
    ),
    `${label}: post-execution identity mismatch`,
  );

  validateMaterializedFixture(result, artifact);
  validateInventory(result);
}

function validateArtifactEnvelope(artifact) {
  assert(artifact.schemaVersion === 2, 'artifact schemaVersion drift');
  assert(artifact.status === 'captured', 'artifact status drift');
  assert(
    artifact.startedAt === '2026-07-26T09:56:10.363Z',
    'capture start drift',
  );
  assert(
    artifact.finishedAt === '2026-07-26T09:57:00.687Z',
    'capture finish drift',
  );
  assert(artifact.platform.os === 'darwin', 'platform OS drift');
  assert(artifact.platform.arch === 'arm64', 'platform architecture drift');
  assert(artifact.platform.node === 'v25.9.0', 'Node version drift');

  const policy = artifact.policy;
  assert(policy.inheritedEnvironment === false, 'environment was inherited');
  assert(policy.credentialsCopied === false, 'credentials were copied');
  assert(
    policy.persistentWritesOutsideStateAllowed === false,
    'writes outside state were allowed',
  );
  assert(policy.networkAllowed === false, 'network was allowed');
  assert(policy.identityPreflight.passed === true, 'identity preflight failed');
  assert(
    policy.sideEffectBoundary.allExecutionsVerified === true,
    'side-effect policy failed',
  );
  assert(
    policy.cleanup.allProcessGroupsVerifiedGone === true,
    'cleanup policy failed',
  );
  assert(
    policy.cleanup.allCloseEventsObserved === true,
    'close observation policy failed',
  );
  assert(policy.runnerSha256 === runnerHash, 'artifact runner hash drift');
  assert(
    policy.sandboxProfileSha256 === profileHash,
    'artifact profile hash drift',
  );
  assert(
    artifact.projectionPolicy.successClaimsAllowed === false,
    'safe wave unexpectedly allows success claims',
  );
  assert(
    artifact.projectionPolicy.supportEdgesCreatedByRunner === false,
    'runner created support edges',
  );
  assert(
    !JSON.stringify(artifact).includes('qualifiesDimensions'),
    'artifact contains premature qualifiesDimensions',
  );

  for (const [product, expected] of Object.entries(expectedArtifactIdentity)) {
    const actual = artifact.artifacts[product];
    for (const [key, value] of Object.entries(expected)) {
      assert(actual[key] === value, `${product} artifact ${key} drift`);
    }
  }
  assert(
    artifact.artifacts.qwen.nodeRuntimeManifest.sha256 ===
      '88c1d0e37fa0c4d2cc8cf6e6cb92b468cbcd57adae71b44a7e3f276cbc8dd636',
    'Node runtime manifest drift',
  );
  assert(
    artifact.artifacts.qwen.nodeRuntimeConfig.sha256 ===
      'a65a2cb9f4ee8ffdc7ef4f0ac600c0bdafb95b7b1ab457188ac610a62f5ad6b3',
    'OpenSSL config drift',
  );
  for (const [name, fixture] of Object.entries(artifact.fixture)) {
    assert(
      sha256(fixture.value) === fixture.sha256,
      `fixture ${name} SHA-256 drift`,
    );
  }
  const formulaRoots = artifact.artifacts.qwen.nodeRuntimeManifest.roots;
  assert(formulaRoots.length === 36, 'Node formula alias/root count drift');
  assert(
    new Set(formulaRoots.map((entry) => entry.resolvedPath)).size === 18,
    'Node canonical formula root count drift',
  );
  assert(
    artifact.artifacts.qwen.nodeRuntimeManifest.files.length === 1,
    'Node direct file allowlist drift',
  );

  assert(artifact.scenarios.length === 8, 'scenario count drift');
  assert(artifact.results.length === 23, 'execution count drift');
  assert(
    sameSet(
      artifact.results
        .filter((result) => result.runtime.timedOut)
        .map((result) => `${result.scenarioId}/${result.product}`),
      ['P2B-E0-ARGV-NOAUTH/codex', 'P2B-E0-STDIN-NOAUTH/codex'],
    ),
    'timeout inventory drift',
  );
  assert(
    sameSet(
      artifact.scenarios.map((scenario) => scenario.id),
      Object.keys(expectedScenarioProducts),
    ),
    'scenario inventory drift',
  );

  for (const scenario of artifact.scenarios) {
    assert(
      sameSet(scenario.products, expectedScenarioProducts[scenario.id]),
      `${scenario.id}: product matrix drift`,
    );
    const results = artifact.results.filter(
      (result) => result.scenarioId === scenario.id,
    );
    assert(
      sameSet(
        results.map((result) => result.product),
        expectedScenarioProducts[scenario.id],
      ),
      `${scenario.id}: execution product matrix drift`,
    );
    for (const result of results) validateExecution(result, scenario, artifact);
  }
}

function createResultLookup(artifact) {
  const lookup = new Map();
  for (const result of artifact.results) {
    const key = `${result.scenarioId}/${result.product}`;
    assert(!lookup.has(key), `duplicate execution ${key}`);
    lookup.set(key, result);
  }
  return (scenarioId, product) => {
    const result = lookup.get(`${scenarioId}/${product}`);
    assert(result, `missing execution ${scenarioId}/${product}`);
    return result;
  };
}

function assertTerminalQwenError(result, label) {
  const records = parseJsonLines(result.runtime.stdout.utf8, label);
  assert(records.length === 1, `${label}: expected one terminal JSON document`);
  const record = records[0];
  assert(record.type === 'result', `${label}: result type drift`);
  assert(
    record.subtype === 'error_during_execution',
    `${label}: terminal subtype drift`,
  );
  assert(record.is_error === true, `${label}: is_error drift`);
  assert(record.num_turns === 0, `${label}: turn count drift`);
  assert(
    isDeepStrictEqual(record.usage, { input_tokens: 0, output_tokens: 0 }),
    `${label}: usage drift`,
  );
  assert(typeof record.session_id === 'string', `${label}: no run correlation`);
  assert(typeof record.uuid === 'string', `${label}: no event UUID`);
  assert(
    sameSet(Object.keys(record.error), ['message']),
    `${label}: error object no longer message-only`,
  );
  assert(
    record.error.message.includes('Missing API key'),
    `${label}: missing-key diagnostic drift`,
  );
  for (const key of ['category', 'stage', 'retryability']) {
    assert(!(key in record), `${label}: unexpected top-level ${key}`);
    assert(!(key in record.error), `${label}: unexpected error.${key}`);
  }
}

function validateHeadlessBehavior(get) {
  for (const [product, stdout] of Object.entries(expectedIdentity)) {
    const result = get('P2B-E0-IDENTITY', product);
    assert(result.runtime.exitCode === 0, `${product} identity exit drift`);
    assert(
      result.runtime.stderr.utf8 === '',
      `${product} identity stderr drift`,
    );
    assert(result.runtime.stdout.utf8 === stdout, `${product} identity drift`);
  }

  const invalidExit = { codex: 1, claude: 1, qwen: 52 };
  for (const [product, exitCode] of Object.entries(invalidExit)) {
    const result = get('P2B-E0-INVALID-SCHEMA', product);
    assert(
      result.runtime.exitCode === exitCode,
      `${product} invalid schema exit`,
    );
    assert(
      result.runtime.stdout.utf8 === '',
      `${product} invalid schema stdout`,
    );
    assert(
      /(?:not valid JSON|JSON Parse error)/i.test(result.runtime.stderr.utf8),
      `${product} invalid schema diagnostic`,
    );
  }

  const emptyCodex = get('P2B-E0-EMPTY-EOF', 'codex');
  const emptyClaude = get('P2B-E0-EMPTY-EOF', 'claude');
  const emptyQwen = get('P2B-E0-EMPTY-EOF', 'qwen');
  assert(emptyCodex.runtime.exitCode === 1, 'Codex empty EOF exit');
  assert(
    emptyCodex.runtime.stderr.utf8 === 'No prompt provided via stdin.\n',
    'Codex empty EOF diagnostic',
  );
  assert(emptyClaude.runtime.exitCode === 1, 'Claude empty EOF exit');
  assert(
    emptyClaude.runtime.stderr.utf8.includes('Input must be provided'),
    'Claude empty EOF diagnostic',
  );
  assertTerminalQwenError(emptyQwen, 'Qwen empty EOF');

  for (const scenarioId of ['P2B-E0-ARGV-NOAUTH', 'P2B-E0-STDIN-NOAUTH']) {
    const codex = get(scenarioId, 'codex');
    assert(codex.runtime.timedOut === true, `${scenarioId}/Codex timeout`);
    assert(
      codex.runtime.forcedSignal === 'SIGTERM',
      `${scenarioId}/Codex signal`,
    );
    assert(
      codex.runtime.signal === 'SIGTERM',
      `${scenarioId}/Codex close signal`,
    );
    assert(codex.runtime.exitCode === null, `${scenarioId}/Codex exit code`);
    const codexEvents = parseJsonLines(
      codex.runtime.stdout.utf8,
      `${scenarioId}/Codex`,
    );
    assert(codexEvents.length === 9, `${scenarioId}/Codex event count`);
    assert(
      codexEvents[0].type === 'thread.started',
      `${scenarioId}/Codex thread`,
    );
    assert(codexEvents[1].type === 'turn.started', `${scenarioId}/Codex turn`);
    assert(
      !codexEvents.some((event) => event.type === 'turn.completed'),
      `${scenarioId}/Codex unexpected terminal`,
    );
    assert(
      codexEvents.some(
        (event) =>
          event.type === 'item.completed' && event.item?.type === 'error',
      ),
      `${scenarioId}/Codex missing transport fallback`,
    );

    const claude = get(scenarioId, 'claude');
    assert(claude.runtime.exitCode === 1, `${scenarioId}/Claude exit`);
    assert(claude.runtime.stderr.utf8 === '', `${scenarioId}/Claude stderr`);
    const claudeEvents = parseJsonLines(
      claude.runtime.stdout.utf8,
      `${scenarioId}/Claude`,
    );
    assert(claudeEvents.length === 3, `${scenarioId}/Claude event count`);
    assert(
      claudeEvents[0].type === 'system' && claudeEvents[0].subtype === 'init',
      `${scenarioId}/Claude init`,
    );
    assert(
      claudeEvents[1].type === 'assistant' &&
        claudeEvents[1].error === 'authentication_failed',
      `${scenarioId}/Claude auth event`,
    );
    assert(
      claudeEvents[2].type === 'result' &&
        claudeEvents[2].subtype === 'success' &&
        claudeEvents[2].is_error === true &&
        claudeEvents[2].terminal_reason === 'api_error',
      `${scenarioId}/Claude terminal result`,
    );

    const qwen = get(scenarioId, 'qwen');
    assert(qwen.runtime.exitCode === 1, `${scenarioId}/Qwen exit`);
    assertTerminalQwenError(qwen, `${scenarioId}/Qwen`);
  }

  for (const product of ['codex', 'claude', 'qwen']) {
    const argvResult = get('P2B-E0-ARGV-NOAUTH', product);
    assert(argvResult.command.stdin === null, `${product} argv stdin drift`);
    assert(
      argvResult.command.args.includes(
        'CCQ_P2B_E0_ARGV_0001 Reply with exactly CCQ_OK. Do not use tools.',
      ),
      `${product} argv prompt drift`,
    );

    const emptyResult = get('P2B-E0-EMPTY-EOF', product);
    const empty = emptyResult.runtime.stdinDelivery;
    assert(
      emptyResult.command.stdin === '',
      `${product} empty EOF input drift`,
    );
    assert(empty.provided === true, `${product} empty EOF not provided`);
    assert(empty.attemptedBytes === 0, `${product} empty EOF byte count`);
    assert(
      empty.writeCallback === 'accepted-by-stream',
      `${product} empty EOF callback`,
    );

    const stdinResult = get('P2B-E0-STDIN-NOAUTH', product);
    const stdin = stdinResult.runtime.stdinDelivery;
    assert(
      stdinResult.command.stdin ===
        'CCQ_P2B_E0_STDIN_0001\nReply with exactly CCQ_OK. Do not use tools.\n',
      `${product} stdin prompt drift`,
    );
    assert(
      Buffer.byteLength(stdinResult.command.stdin) === 67,
      `${product} stdin source byte count`,
    );
    assert(stdin.provided === true, `${product} stdin not provided`);
    assert(stdin.attemptedBytes === 67, `${product} stdin byte count`);
    assert(
      stdin.writeCallback === 'accepted-by-stream',
      `${product} stdin callback`,
    );
  }
}

function validateDiagnosticsAndConfig(get) {
  const codexDoctor = get('P2B-E0-DOCTOR-EMPTY', 'codex');
  const doctor = JSON.parse(codexDoctor.runtime.stdout.utf8);
  assert(codexDoctor.runtime.exitCode === 1, 'Codex doctor exit');
  assert(codexDoctor.runtime.stderr.utf8 === '', 'Codex doctor stderr');
  assert(doctor.schemaVersion === 1, 'Codex doctor schema');
  assert(doctor.overallStatus === 'fail', 'Codex doctor overall status');
  assert(doctor.codexVersion === '0.145.0', 'Codex doctor version');
  assert(Object.keys(doctor.checks).length === 18, 'Codex doctor check count');
  const statusCounts = Object.values(doctor.checks).reduce((counts, check) => {
    counts[check.status] = (counts[check.status] ?? 0) + 1;
    assert(
      check.id && check.category && check.summary,
      `doctor check ${check.id}`,
    );
    return counts;
  }, {});
  assert(
    isDeepStrictEqual(statusCounts, { ok: 13, fail: 3, warning: 2 }),
    'Codex doctor status counts',
  );

  for (const scenarioId of [
    'P2B-E0-DOCTOR-EMPTY',
    'P2B-E0-CONFIG-MALFORMED',
    'P2B-E0-CONFIG-UNKNOWN',
  ]) {
    const claude = get(scenarioId, 'claude');
    assert(claude.runtime.exitCode === 0, `${scenarioId}/Claude exit`);
    assert(claude.runtime.stdout.utf8 === '', `${scenarioId}/Claude stdout`);
    assert(claude.runtime.stderr.utf8 === '', `${scenarioId}/Claude stderr`);
    assert(
      claude.inventoryAfter.some((entry) =>
        entry.path.endsWith('/.claude.json'),
      ),
      `${scenarioId}/Claude state file`,
    );
    assert(
      claude.inventoryAfter.some((entry) =>
        entry.path.includes('/backups/.claude.json.backup.'),
      ),
      `${scenarioId}/Claude backup`,
    );
  }

  const codexMalformed = get('P2B-E0-CONFIG-MALFORMED', 'codex');
  const malformedDoctor = JSON.parse(codexMalformed.runtime.stdout.utf8);
  assert(codexMalformed.runtime.exitCode === 1, 'Codex malformed config exit');
  assert(
    malformedDoctor.checks['config.load'].status === 'fail',
    'Codex malformed config.load status',
  );
  assert(
    malformedDoctor.checks['config.load'].notes.includes(
      'failed to load Codex config',
    ),
    'Codex malformed config note',
  );
  assert(
    malformedDoctor.checks['config.load'].remediation.includes('rerun'),
    'Codex malformed config remediation',
  );

  const codexUnknown = get('P2B-E0-CONFIG-UNKNOWN', 'codex');
  assert(codexUnknown.runtime.exitCode === 1, 'Codex unknown config exit');
  assert(
    codexUnknown.runtime.stdout.utf8 === '',
    'Codex unknown config stdout',
  );
  assert(
    codexUnknown.runtime.stderr.utf8.includes('config.toml:1:1') &&
      codexUnknown.runtime.stderr.utf8.includes('phase2b_unknown_key'),
    'Codex unknown config diagnostic',
  );

  const qwenMalformed = get('P2B-E0-CONFIG-MALFORMED', 'qwen');
  const qwenUnknown = get('P2B-E0-CONFIG-UNKNOWN', 'qwen');
  for (const result of [qwenMalformed, qwenUnknown]) {
    assert(result.runtime.exitCode === 0, `${result.scenarioId}/Qwen exit`);
    assert(
      result.runtime.stdout.utf8 === 'No extensions installed.\n',
      `${result.scenarioId}/Qwen stdout`,
    );
    findInventory(result, 'state/qwen-home/extension-store/state.json');
    findInventory(
      result,
      'state/qwen-home/extensions/extension-enablement.json',
    );
  }
  assert(
    qwenMalformed.runtime.stderr.utf8.includes(
      'Settings file had invalid JSON and was reset',
    ),
    'Qwen malformed config warning',
  );
  assert(qwenUnknown.runtime.stderr.utf8 === '', 'Qwen unknown config stderr');

  const migratedHash = sha256('{\n  "$version": 4\n}');
  assert(
    findInventory(qwenMalformed, 'state/qwen-home/settings.json').sha256 ===
      migratedHash,
    'Qwen malformed user migration',
  );
  assert(
    findInventory(qwenMalformed, 'state/qwen-home/settings.json.corrupted')
      .sha256 === sha256('{\n'),
    'Qwen corrupted backup',
  );
  for (const relativePath of [
    'state/config/qwen-system-settings.json',
    'state/config/qwen-system-defaults.json',
  ]) {
    assert(
      findInventory(qwenMalformed, relativePath).sha256 === migratedHash,
      `Qwen malformed migration ${relativePath}`,
    );
    assert(
      findInventory(qwenUnknown, relativePath).sha256 === migratedHash,
      `Qwen unknown migration ${relativePath}`,
    );
  }
  assert(
    findInventory(qwenUnknown, 'state/qwen-home/settings.json').sha256 ===
      sha256('{"$version":4,"phase2bUnknownKey":true}\n'),
    'Qwen unknown user file preservation',
  );
  assert(
    !qwenUnknown.inventoryAfter.some((entry) =>
      entry.path.endsWith('settings.json.corrupted'),
    ),
    'Qwen unknown config created corrupted backup',
  );
}

function validateEvidenceRecords(content, artifact) {
  const recordKeys = [
    'evidence_id',
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
  ];
  const environmentKeys = [
    'platform',
    'authentication',
    'entitlement',
    'region',
    'provider',
    'model',
    'configuration',
    'feature_flags',
  ];
  const runtimeKeys = [
    'applicability',
    'preconditions',
    'procedure',
    'stdout',
    'stderr',
    'exit_code',
    'side_effects',
    'cleanup',
    'started_at',
    'finished_at',
  ];
  const records = [...content.matchAll(/```yaml\n([\s\S]*?)\n```/g)].map(
    (match, index) => {
      try {
        return parseYaml(match[1]);
      } catch (error) {
        throw new Error(`Evidence YAML block ${index + 1}: ${error}`);
      }
    },
  );
  assert(
    records.length === 6,
    'Phase 2B must contain six full Evidence Records',
  );
  assert(
    sameSet(
      records.map((record) => record.evidence_id),
      Object.keys(expectedEvidenceRecords),
    ),
    'Evidence Record ID inventory drift',
  );

  for (const record of records) {
    const expected = expectedEvidenceRecords[record.evidence_id];
    const label = record.evidence_id;
    assert(expected, `unexpected Evidence Record ${label}`);
    assert(sameSet(Object.keys(record), recordKeys), `${label}: record schema`);
    assert(record.evidence_type === 'RUNTIME', `${label}: Evidence type`);
    assert(record.product === expected.product, `${label}: product`);
    assert(record.version === expected.version, `${label}: version`);
    assert(
      record.release_channel === expected.releaseChannel,
      `${label}: release channel`,
    );
    assert(record.product_surface === 'cli', `${label}: product surface`);
    assert(
      record.source_url_or_path === finalArtifactPath,
      `${label}: source artifact`,
    );
    assert(record.captured_at === artifact.finishedAt, `${label}: captured_at`);
    assert(
      record.artifact_hash_or_excerpt === `sha256:${finalArtifactHash}`,
      `${label}: artifact hash`,
    );

    assert(
      sameSet(Object.keys(record.environment), environmentKeys),
      `${label}: environment schema`,
    );
    for (const key of [
      'platform',
      'authentication',
      'entitlement',
      'configuration',
      'feature_flags',
    ]) {
      assert(
        Array.isArray(record.environment[key]) &&
          record.environment[key].length > 0,
        `${label}: environment.${key}`,
      );
    }
    for (const key of ['region', 'provider', 'model']) {
      assert(
        typeof record.environment[key] === 'string' &&
          record.environment[key].length > 0,
        `${label}: environment.${key}`,
      );
    }
    assert(
      record.environment.provider === expected.provider,
      `${label}: provider boundary`,
    );
    assert(
      isDeepStrictEqual(
        record.environment.feature_flags,
        expected.featureFlags,
      ),
      `${label}: feature-flag boundary`,
    );
    if (label === 'EVD-qwen-code-RUNTIME-004') {
      assert(
        !record.environment.configuration.some((item) =>
          String(item).includes('safe mode'),
        ),
        `${label}: config probe did not pass safe mode`,
      );
    }

    const runtime = record.runtime_probe;
    assert(
      sameSet(Object.keys(runtime), runtimeKeys),
      `${label}: runtime schema`,
    );
    assert(runtime.applicability === 'applicable', `${label}: applicability`);
    for (const key of [
      'preconditions',
      'procedure',
      'side_effects',
      'cleanup',
    ]) {
      assert(
        Array.isArray(runtime[key]) && runtime[key].length > 0,
        `${label}: runtime_probe.${key}`,
      );
    }
    assert(
      runtime.cleanup.every(
        (item) =>
          typeof item === 'string' &&
          item !== 'stream hard-stop' &&
          item !== 'or output truncation',
      ),
      `${label}: ambiguous cleanup wording`,
    );
    assert(
      typeof runtime.stdout === 'string' &&
        runtime.stdout.includes('safe-wave.json'),
      `${label}: stdout artifact reference`,
    );
    assert(
      typeof runtime.stderr === 'string' &&
        runtime.stderr.includes('safe-wave.json'),
      `${label}: stderr artifact reference`,
    );
    assert(
      isDeepStrictEqual(runtime.exit_code, expected.exitCode),
      `${label}: exit-code map`,
    );

    const procedureIds = runtime.procedure.flatMap(
      (item) => String(item).match(/P2B-E0-[A-Z-]+/g) ?? [],
    );
    assert(
      sameSet(procedureIds, expected.scenarios),
      `${label}: procedure scenario inventory`,
    );
    const executions = artifact.results.filter(
      (result) =>
        result.product === expected.productKey &&
        expected.scenarios.includes(result.scenarioId),
    );
    assert(
      executions.length === expected.scenarios.length,
      `${label}: source execution count`,
    );
    const startedAt = sorted(
      executions.map((result) => result.runtime.startedAt),
    )[0];
    const finishedAt = sorted(
      executions.map((result) => result.runtime.finishedAt),
    ).at(-1);
    assert(runtime.started_at === startedAt, `${label}: started_at`);
    assert(runtime.finished_at === finishedAt, `${label}: finished_at`);

    assert(
      Array.isArray(record.record_relations) &&
        record.record_relations.length === 0,
      `${label}: record_relations must remain empty`,
    );
    assert(
      Array.isArray(record.limitations) && record.limitations.length > 0,
      `${label}: limitations`,
    );
  }
}

function validateDocumentation(artifact) {
  const expectedEvidenceIds = Object.keys(expectedEvidenceRecords);
  const combined = phase2BMarkdownFiles.map(read).join('\n');
  for (const relativePath of phase2BMarkdownFiles) {
    const content = read(relativePath);
    assert(
      content.includes(finalArtifactHash),
      `${relativePath}: missing frozen artifact hash`,
    );
  }
  for (const evidenceId of expectedEvidenceIds) {
    assert(combined.includes(evidenceId), `missing Evidence ${evidenceId}`);
  }

  const method = read('17-phase-2b-aligned-runtime-method.md');
  const probes = read('probes/04-phase-2b-aligned-runtime-probes.md');
  const evidence = read('evidence/phase-2b-aligned-runtime.md');
  const headless = read('comparisons/phase-2b-headless-runtime.md');
  const summary = read('18-phase-2b-comparison-deltas-and-open-probes.md');
  validateEvidenceRecords(evidence, artifact);

  assert(method.includes('> 状态：Frozen'), 'method is not frozen');
  assert(
    probes.includes('> 状态：Executed / Frozen'),
    'probe matrix not frozen',
  );
  assert(
    /\|\s*New `runtime-comparable` Comparison Record\s*\|\s*`0`\s*\|/.test(
      summary,
    ),
    'runtime relation count drift',
  );
  assert(
    summary.includes(
      '6 条 Evidence Record 满足 frozen Methodology 完整 schema',
    ),
    'Evidence schema review gate missing',
  );
  assert(
    !combined.includes('Claude/Qwen complete no-auth machine'),
    'Qwen terminal document was upgraded to a shared lifecycle',
  );
  assert(
    !combined.includes('Qwen machine error 缺 stage/retryability'),
    'Qwen missing category was omitted',
  );
  assert(
    headless.includes('缺 category/stage/retryability'),
    'headless Qwen taxonomy boundary missing',
  );
  assert(
    summary.includes('缺 category/stage/retryability'),
    'summary Qwen taxonomy boundary missing',
  );
  assert(
    evidence.includes('只有 correlation；缺 category、stage 与 retryability'),
    'Evidence Index Qwen taxonomy boundary missing',
  );
  for (const limitation of [
    'modify-and-restore',
    '不是 syscall trace',
    'xattr',
    'ACL',
    'mtime',
    'inode',
    'minimal dylib closure',
    'original PGID',
  ]) {
    assert(combined.includes(limitation), `missing limitation: ${limitation}`);
  }

  for (const attemptHash of Object.values(frozenHashes).slice(0, 4)) {
    assert(
      summary.includes(attemptHash),
      `attempt ledger missing ${attemptHash}`,
    );
  }
}

function validateLocalLinks() {
  for (const relativePath of phase2BMarkdownFiles) {
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
      const resolved = path.resolve(
        path.dirname(fullPath(relativePath)),
        decodeURIComponent(target),
      );
      assert(
        fs.existsSync(resolved),
        `${relativePath}: broken link ${match[1]}`,
      );
    }
  }
}

function validatePhase2AFreeze() {
  const output = execFileSync(
    process.execPath,
    [fullPath('scripts/validate-phase-2a.mjs')],
    {
      cwd: repoRoot,
      encoding: 'utf8',
      maxBuffer: 64 * 1024 * 1024,
      stdio: ['ignore', 'pipe', 'pipe'],
    },
  );
  assert(
    output.includes('Phase 2A validation passed'),
    'Phase 2A freeze validator did not pass',
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
      ...phase2BFormatFiles.map(fullPath),
    ],
    {
      cwd: repoRoot,
      encoding: 'utf8',
      maxBuffer: 64 * 1024 * 1024,
      stdio: ['ignore', 'pipe', 'pipe'],
    },
  );

  const allFiles = [
    ...Object.keys(frozenHashes),
    ...phase2BMarkdownFiles,
    'scripts/validate-phase-2b.mjs',
  ];
  for (const relativePath of new Set(allFiles)) {
    const repoRelativePath = path.relative(repoRoot, fullPath(relativePath));
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
      ...[...new Set(allFiles)].map((relativePath) =>
        path.relative(repoRoot, fullPath(relativePath)),
      ),
    ],
    { cwd: repoRoot, encoding: 'utf8' },
  ).trim();
  assert(!tracked, `Phase 2B working artifacts are tracked: ${tracked}`);
}

function main() {
  validateFrozenHashes();
  const artifact = JSON.parse(read(finalArtifactPath));
  validateArtifactEnvelope(artifact);
  const get = createResultLookup(artifact);
  validateHeadlessBehavior(get);
  validateDiagnosticsAndConfig(get);
  validateDocumentation(artifact);
  validateLocalLinks();
  validatePhase2AFreeze();
  validateFormattingAndIgnoreGate();

  process.stdout.write(
    [
      'Phase 2B validation passed',
      `Artifact: sha256:${finalArtifactHash}`,
      'Matrix: 8 scenarios / 23 executions',
      'Safety: 23/23 integrity, state-only boundary, close, original PGID cleanup',
      'Timeouts: 2 Codex deny-network retries / SIGTERM',
      'Evidence: 6 additive Records / 0 support edges / 0 runtime-comparable relations',
      'Upstream dependency: Phase 2A validation passed',
    ].join('\n') + '\n',
  );
}

main();
