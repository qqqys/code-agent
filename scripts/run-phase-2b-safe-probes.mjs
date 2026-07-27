#!/usr/bin/env node

import { spawn } from 'node:child_process';
import { createHash } from 'node:crypto';
import { createReadStream } from 'node:fs';
import {
  chmod,
  lstat,
  mkdir,
  mkdtemp,
  readFile,
  readlink,
  readdir,
  realpath,
  writeFile,
} from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const expectedArtifacts = {
  codex:
    '1da3f4e0e96028b8a771814293c3033dafd1971f943f6c7e79b0897fe705f590',
  claude:
    '09ecba2ab2df9b6ee5b0695e26f65dea60fb3b6af3d3542ee09f466838d1e574',
  qwenEntry:
    '1db9709bf1753611ca2fec234cf5adf517376efeb1540fcf9e309da010f9ed38',
  qwenBundle:
    '4c05bdb0c903b8b18672cffb6d544b8f6bd96598a55dc1881f478b2ed945e4d1',
  node: '32e234a5b6bec67d72a016f2baadf7fadf3afd328470b395b73af473fdee0d85',
  profile:
    'ff5f599cad03d5c257827314c5a483e3cffaa2fef2d7b70a433e376ad1c700e6',
  sandboxExec:
    '8857d087219f0f39d3e3c163e5d0a0aed690cc22f34b50c7eee3d74f93e69688',
  opensslConfig:
    'a65a2cb9f4ee8ffdc7ef4f0ac600c0bdafb95b7b1ab457188ac610a62f5ad6b3',
  codexTree:
    '892f8a81f38ec7e2784938ef12fa6ef6a7bfe1cf5f757984f8c4288835e5f551',
  claudeTree:
    'c2e8651cd407e418b0af7c1cb22314ff9dd36f4ecf1da3016a9ba62d00774e62',
  qwenTree:
    'a106a1332b3266bef53839a74fb10c7fb961bec59dd791adbe92cd502eae500e',
  qwenTarball:
    '62fa5ea404a8d1f694edc54446bbd4ca6d3a69e090ec5975977ff51918d2aeca',
  systemSandboxProfile:
    '1b2c4487f32fba48f29ba871bd1fec4f8d74af9543074c8805c3bc7094b9846f',
  dyldSandboxProfile:
    '06215a5d32689aefe395c29710e182eb54ba22162f50df8b4842290f8a19bf1c',
  systemVersion:
    'd90b1755e5dbb837d2ca1e11083c6e36e6219193a0fcf036d0f7cfe5366e031e',
  nodeRuntimeTrees:
    '88c1d0e37fa0c4d2cc8cf6e6cb92b468cbcd57adae71b44a7e3f276cbc8dd636',
};

const nodeRuntimeRoots = [
  '/opt/homebrew/opt/ada-url/lib',
  '/opt/homebrew/opt/brotli/lib',
  '/opt/homebrew/opt/c-ares/lib',
  '/opt/homebrew/opt/hdrhistogram_c/lib',
  '/opt/homebrew/opt/icu4c@78/lib',
  '/opt/homebrew/opt/libnghttp2/lib',
  '/opt/homebrew/opt/libnghttp3/lib',
  '/opt/homebrew/opt/libngtcp2/lib',
  '/opt/homebrew/opt/libuv/lib',
  '/opt/homebrew/opt/llhttp/lib',
  '/opt/homebrew/opt/merve/lib',
  '/opt/homebrew/opt/nbytes/lib',
  '/opt/homebrew/opt/openssl@3/lib',
  '/opt/homebrew/opt/simdjson/lib',
  '/opt/homebrew/opt/simdutf/lib',
  '/opt/homebrew/opt/sqlite/lib',
  '/opt/homebrew/opt/uvwasi/lib',
  '/opt/homebrew/opt/zstd/lib',
  '/opt/homebrew/Cellar/ada-url/3.4.4/lib',
  '/opt/homebrew/Cellar/brotli/1.2.0/lib',
  '/opt/homebrew/Cellar/c-ares/1.34.6/lib',
  '/opt/homebrew/Cellar/hdrhistogram_c/0.11.9/lib',
  '/opt/homebrew/Cellar/icu4c@78/78.3/lib',
  '/opt/homebrew/Cellar/libnghttp2/1.69.0/lib',
  '/opt/homebrew/Cellar/libnghttp3/1.15.0/lib',
  '/opt/homebrew/Cellar/libngtcp2/1.22.1/lib',
  '/opt/homebrew/Cellar/libuv/1.52.1/lib',
  '/opt/homebrew/Cellar/llhttp/9.3.1/lib',
  '/opt/homebrew/Cellar/merve/1.2.2_1/lib',
  '/opt/homebrew/Cellar/nbytes/0.1.4/lib',
  '/opt/homebrew/Cellar/openssl@3/3.6.2/lib',
  '/opt/homebrew/Cellar/simdjson/4.6.3/lib',
  '/opt/homebrew/Cellar/simdutf/9.0.0/lib',
  '/opt/homebrew/Cellar/sqlite/3.53.0/lib',
  '/opt/homebrew/Cellar/uvwasi/0.0.23/lib',
  '/opt/homebrew/Cellar/zstd/1.5.7_1/lib',
];

const nodeRuntimeFiles = [
  '/opt/homebrew/Cellar/node/25.9.0_2/lib/libnode.141.dylib',
];

const fixture = {
  repoReadme: 'CCQ_PHASE2B_E0\n',
  repoReadmeSha256:
    '9ce259db3059c7b293b15a4f6238d6851ddf588386cddec24b300b17f965a4d4',
  sentinel: 'DO_NOT_MODIFY\n',
  sentinelSha256:
    'd43d3a42f91ca5438d4dfabd96083208a3732d011c1d61548395d191fad4b706',
  argvPrompt:
    'CCQ_P2B_E0_ARGV_0001 Reply with exactly CCQ_OK. Do not use tools.',
  argvPromptSha256:
    '058abfaa80b848435a0b1127d7a5b5810065bcffd8f08fe008888b0811034efc',
  stdinPrompt:
    'CCQ_P2B_E0_STDIN_0001\nReply with exactly CCQ_OK. Do not use tools.\n',
  stdinPromptSha256:
    'c05f2c29798fcbbf49fab2d31c8b6c6dc5d95d72c7053b7e6feb0721f4cd373a',
  invalidSchema: '{"type":"object",',
  invalidSchemaSha256:
    '80f67e7668b6730bba0e8221bcf48d90eb09e8cf528024b6560bd634757edfe4',
  validSchema:
    '{"type":"object","additionalProperties":false,"properties":{"probe":{"type":"string","enum":["CCQ_OK"]}},"required":["probe"]}',
  validSchemaSha256:
    '3fc2a34f2574158de4f0297dcbe7e4ecda10dde725e025027408939226b9047b',
};

const maxCaptureBytes = 512 * 1024;
const defaultTimeoutMs = 15_000;
const cleanupWaitMs = 1_000;

function parseArgs(argv) {
  const result = {};
  for (let index = 0; index < argv.length; index += 2) {
    const key = argv[index];
    const value = argv[index + 1];
    if (!key?.startsWith('--') || value === undefined) {
      throw new Error(`Invalid argument sequence at ${String(key)}`);
    }
    result[key.slice(2)] = value;
  }
  return result;
}

function requireAbsolute(value, label) {
  if (!value || !path.isAbsolute(value)) {
    throw new Error(`${label} must be an absolute path`);
  }
  return value;
}

function now() {
  return new Date().toISOString();
}

function sha256Bytes(value) {
  return createHash('sha256').update(value).digest('hex');
}

async function sha256File(file) {
  const hash = createHash('sha256');
  for await (const chunk of createReadStream(file)) {
    hash.update(chunk);
  }
  return hash.digest('hex');
}

async function sha256Tree(root) {
  const hash = createHash('sha256');

  async function visit(directory) {
    const children = await readdir(directory, { withFileTypes: true });
    children.sort((left, right) => left.name.localeCompare(right.name));
    for (const child of children) {
      const absolute = path.join(directory, child.name);
      const relative = path
        .relative(root, absolute)
        .split(path.sep)
        .join('/');
      const stat = await lstat(absolute);
      const mode = (stat.mode & 0o777).toString(8);
      if (child.isDirectory()) {
        hash.update(`directory\0${relative}\0${mode}\0`);
        await visit(absolute);
      } else if (child.isSymbolicLink()) {
        hash.update(
          `symlink\0${relative}\0${mode}\0${await readlink(absolute)}\0`,
        );
      } else if (child.isFile()) {
        hash.update(`file\0${relative}\0${mode}\0${stat.size}\0`);
        for await (const chunk of createReadStream(absolute)) {
          hash.update(chunk);
        }
        hash.update('\0');
      } else {
        hash.update(`special\0${relative}\0${mode}\0${stat.size}\0`);
      }
    }
  }

  await visit(root);
  return hash.digest('hex');
}

async function sha256TreeManifest(roots) {
  const entries = [];
  for (const root of roots) {
    entries.push({
      path: root,
      resolvedPath: await realpath(root),
      sha256: await sha256Tree(root),
    });
  }
  return {
    sha256: sha256Bytes(JSON.stringify(entries)),
    roots: entries,
  };
}

async function sha256NodeRuntimeManifest() {
  const roots = await sha256TreeManifest(nodeRuntimeRoots);
  const files = [];
  for (const file of nodeRuntimeFiles) {
    files.push({
      path: file,
      resolvedPath: await realpath(file),
      sha256: await sha256File(file),
    });
  }
  return {
    sha256: sha256Bytes(
      JSON.stringify({ roots: roots.roots, files }),
    ),
    roots: roots.roots,
    files,
  };
}

async function captureExecutionIntegrity(product, artifacts, profile) {
  const snapshot = {
    profile: await sha256File(profile),
    sandboxExec: await sha256File('/usr/bin/sandbox-exec'),
    systemSandboxProfile: await sha256File(
      '/System/Library/Sandbox/Profiles/system.sb',
    ),
    dyldSandboxProfile: await sha256File(
      '/System/Library/Sandbox/Profiles/dyld-support.sb',
    ),
    systemVersion: await sha256File(
      '/System/Library/CoreServices/SystemVersion.plist',
    ),
  };

  if (product === 'codex') {
    snapshot.productBinary = await sha256File(artifacts.codex);
    snapshot.productTree = await sha256Tree(artifacts.codexTreeRoot);
  } else if (product === 'claude') {
    snapshot.productBinary = await sha256File(artifacts.claude);
    snapshot.productTree = await sha256Tree(artifacts.claudeTreeRoot);
  } else {
    snapshot.productEntry = await sha256File(artifacts.qwenEntry);
    snapshot.productBundle = await sha256File(artifacts.qwenBundle);
    snapshot.productTree = await sha256Tree(artifacts.qwenTreeRoot);
    snapshot.node = await sha256File(artifacts.node);
    snapshot.opensslConfig = await sha256File(
      '/opt/homebrew/etc/openssl@3/openssl.cnf',
    );
    snapshot.nodeRuntimeTrees = (
      await sha256NodeRuntimeManifest()
    ).sha256;
  }

  return snapshot;
}

function expectedExecutionIntegrity(product, hashes) {
  const expected = {
    profile: hashes.profile,
    sandboxExec: hashes.sandboxExec,
    systemSandboxProfile: hashes.systemSandboxProfile,
    dyldSandboxProfile: hashes.dyldSandboxProfile,
    systemVersion: hashes.systemVersion,
    productTree: hashes[`${product}Tree`],
  };
  if (product === 'codex') {
    expected.productBinary = hashes.codex;
  } else if (product === 'claude') {
    expected.productBinary = hashes.claude;
  } else {
    expected.productEntry = hashes.qwenEntry;
    expected.productBundle = hashes.qwenBundle;
    expected.node = hashes.node;
    expected.opensslConfig = hashes.opensslConfig;
    expected.nodeRuntimeTrees = hashes.nodeRuntimeTrees;
  }
  return expected;
}

function verifyExecutionIntegrity(snapshot, expected, label) {
  for (const [key, expectedHash] of Object.entries(expected)) {
    if (snapshot[key] !== expectedHash) {
      throw new Error(
        `${label} ${key} hash drift: expected ${expectedHash}, got ${String(snapshot[key])}`,
      );
    }
  }
}

function createCapture() {
  const chunks = [];
  let observedBytes = 0;
  let capturedBytes = 0;

  return {
    append(chunk) {
      observedBytes += chunk.length;
      if (capturedBytes >= maxCaptureBytes) return;
      const remaining = maxCaptureBytes - capturedBytes;
      const bounded = chunk.subarray(0, remaining);
      chunks.push(bounded);
      capturedBytes += bounded.length;
    },
    finish() {
      const value = Buffer.concat(chunks);
      return {
        encoding: 'base64',
        data: value.toString('base64'),
        utf8: value.toString('utf8'),
        sha256: sha256Bytes(value),
        capturedBytes,
        observedBytes,
        truncated: observedBytes > capturedBytes,
      };
    },
  };
}

async function inventoryTree(root) {
  const entries = [];

  async function visit(directory) {
    const children = await readdir(directory, { withFileTypes: true });
    children.sort((left, right) => left.name.localeCompare(right.name));
    for (const child of children) {
      const absolute = path.join(directory, child.name);
      const relative = path.relative(root, absolute);
      const stat = await lstat(absolute);
      if (child.isDirectory()) {
        entries.push({
          path: relative,
          type: 'directory',
          mode: (stat.mode & 0o777).toString(8),
        });
        await visit(absolute);
      } else if (child.isSymbolicLink()) {
        entries.push({
          path: relative,
          type: 'symlink',
          size: stat.size,
          mode: (stat.mode & 0o777).toString(8),
          target: await readlink(absolute),
        });
      } else if (child.isFile()) {
        entries.push({
          path: relative,
          type: 'file',
          size: stat.size,
          mode: (stat.mode & 0o777).toString(8),
          sha256: await sha256File(absolute),
        });
      } else {
        const type = child.isSocket()
          ? 'socket'
          : child.isFIFO()
            ? 'fifo'
            : child.isBlockDevice()
              ? 'block-device'
              : child.isCharacterDevice()
                ? 'character-device'
                : 'other';
        entries.push({
          path: relative,
          type,
          size: stat.size,
          mode: (stat.mode & 0o777).toString(8),
        });
      }
    }
  }

  await visit(root);
  return entries;
}

function inventoryDelta(before, after) {
  const beforeByPath = new Map(before.map((entry) => [entry.path, entry]));
  const afterByPath = new Map(after.map((entry) => [entry.path, entry]));
  return {
    created: after.filter((entry) => !beforeByPath.has(entry.path)),
    changed: after.filter((entry) => {
      const previous = beforeByPath.get(entry.path);
      return previous && JSON.stringify(previous) !== JSON.stringify(entry);
    }),
    removed: before.filter((entry) => !afterByPath.has(entry.path)),
  };
}

function verifySideEffectBoundary(delta, label) {
  const outsideState = [
    ...delta.created,
    ...delta.changed,
    ...delta.removed,
  ].filter(
    (entry) =>
      entry.path !== 'state' &&
      !entry.path.startsWith(`state${path.sep}`),
  );
  if (outsideState.length > 0) {
    throw new Error(
      `${label} modified protected paths: ${outsideState.map((entry) => entry.path).join(', ')}`,
    );
  }
}

function verifyIdentityPreflight(product, runtime) {
  const expectedStdout = {
    codex: 'codex-cli 0.145.0\n',
    claude: '2.1.212 (Claude Code)\n',
    qwen: '0.21.0\n',
  }[product];
  const passed =
    runtime.exitCode === 0 &&
    runtime.signal === null &&
    !runtime.timedOut &&
    runtime.spawnError === null &&
    !runtime.stdout.truncated &&
    !runtime.stderr.truncated &&
    runtime.stdout.utf8 === expectedStdout &&
    runtime.stderr.observedBytes === 0;
  if (!passed) {
    throw new Error(
      `${product} identity preflight failed: expected exact ${JSON.stringify(expectedStdout)}, got exit=${String(runtime.exitCode)} signal=${String(runtime.signal)} stdout=${JSON.stringify(runtime.stdout.utf8)} stderr=${JSON.stringify(runtime.stderr.utf8)}`,
    );
  }
}

function commonEnv(stateRoot) {
  return {
    HOME: path.join(stateRoot, 'home'),
    XDG_CACHE_HOME: path.join(stateRoot, 'home', '.cache'),
    XDG_CONFIG_HOME: path.join(stateRoot, 'home', '.config'),
    XDG_DATA_HOME: path.join(stateRoot, 'home', '.local', 'share'),
    XDG_STATE_HOME: path.join(stateRoot, 'home', '.local', 'state'),
    PATH: '/opt/homebrew/bin:/usr/bin:/bin:/usr/sbin:/sbin',
    LANG: 'C',
    LC_ALL: 'C',
    TERM: 'dumb',
    NO_COLOR: '1',
    CI: '1',
    TMPDIR: `${path.join(stateRoot, 'tmp')}${path.sep}`,
    TMP: path.join(stateRoot, 'tmp'),
    TEMP: path.join(stateRoot, 'tmp'),
  };
}

async function prepareRun(root, scenarioId, product) {
  const runRoot = path.join(root, 'runs', scenarioId, product);
  const repoRoot = path.join(runRoot, 'repo');
  const fixtureRoot = path.join(runRoot, 'fixtures');
  const stateRoot = path.join(runRoot, 'state');
  const directories = [
    runRoot,
    repoRoot,
    fixtureRoot,
    stateRoot,
    path.join(stateRoot, 'home'),
    path.join(stateRoot, 'tmp'),
    path.join(stateRoot, 'tmp', 'claude'),
    path.join(stateRoot, 'config'),
    path.join(stateRoot, 'qwen-home'),
    path.join(stateRoot, 'qwen-runtime'),
    path.join(stateRoot, 'qwen-memory'),
  ];
  for (const directory of directories) {
    await mkdir(directory, { recursive: true });
  }
  await writeFile(
    path.join(repoRoot, 'README.md'),
    fixture.repoReadme,
  );
  await writeFile(
    path.join(repoRoot, 'sentinel.txt'),
    fixture.sentinel,
  );
  await writeFile(
    path.join(fixtureRoot, 'invalid-schema.json'),
    fixture.invalidSchema,
  );
  await writeFile(
    path.join(fixtureRoot, 'valid-schema.json'),
    fixture.validSchema,
  );
  for (const file of [
    path.join(repoRoot, 'README.md'),
    path.join(repoRoot, 'sentinel.txt'),
    path.join(fixtureRoot, 'invalid-schema.json'),
    path.join(fixtureRoot, 'valid-schema.json'),
  ]) {
    await chmod(file, 0o444);
  }
  await chmod(repoRoot, 0o555);
  await chmod(fixtureRoot, 0o555);
  const materializedFiles = [
    {
      path: path.join(repoRoot, 'README.md'),
      sha256: fixture.repoReadmeSha256,
    },
    {
      path: path.join(repoRoot, 'sentinel.txt'),
      sha256: fixture.sentinelSha256,
    },
    {
      path: path.join(fixtureRoot, 'invalid-schema.json'),
      sha256: fixture.invalidSchemaSha256,
    },
    {
      path: path.join(fixtureRoot, 'valid-schema.json'),
      sha256: fixture.validSchemaSha256,
    },
  ];
  const materializedFixtureManifest = { files: [], directories: [] };
  for (const file of materializedFiles) {
    const stat = await lstat(file.path);
    const mode = (stat.mode & 0o777).toString(8);
    const sha256 = await sha256File(file.path);
    if (mode !== '444' || sha256 !== file.sha256) {
      throw new Error(
        `Materialized fixture drift at ${file.path}: mode=${mode} sha256=${sha256}`,
      );
    }
    materializedFixtureManifest.files.push({
      path: file.path,
      mode,
      sha256,
    });
  }
  for (const directory of [repoRoot, fixtureRoot]) {
    const stat = await lstat(directory);
    const mode = (stat.mode & 0o777).toString(8);
    if (mode !== '555') {
      throw new Error(
        `Materialized fixture directory mode drift at ${directory}: ${mode}`,
      );
    }
    materializedFixtureManifest.directories.push({
      path: directory,
      mode,
    });
  }
  return {
    runRoot,
    repoRoot,
    fixtureRoot,
    stateRoot,
    materializedFixtureManifest,
  };
}

async function prepareQwenSettings(
  stateRoot,
  userContent = '{"$version":4}\n',
) {
  const configRoot = path.join(stateRoot, 'config');
  const qwenHome = path.join(stateRoot, 'qwen-home');
  const files = {
    system: path.join(configRoot, 'qwen-system-settings.json'),
    defaults: path.join(configRoot, 'qwen-system-defaults.json'),
    trusted: path.join(configRoot, 'qwen-trusted-folders.json'),
    approvals: path.join(configRoot, 'qwen-mcp-approvals.json'),
    user: path.join(qwenHome, 'settings.json'),
  };
  await writeFile(files.system, '{}\n');
  await writeFile(files.defaults, '{}\n');
  await writeFile(files.trusted, '{}\n');
  await writeFile(files.approvals, '{}\n');
  await writeFile(files.user, userContent);
  return files;
}

function qwenEnv(stateRoot, files) {
  return {
    ...commonEnv(stateRoot),
    QWEN_HOME: path.join(stateRoot, 'qwen-home'),
    QWEN_RUNTIME_DIR: path.join(stateRoot, 'qwen-runtime'),
    QWEN_CODE_MEMORY_BASE_DIR: path.join(stateRoot, 'qwen-memory'),
    QWEN_CODE_SYSTEM_SETTINGS_PATH: files.system,
    QWEN_CODE_SYSTEM_DEFAULTS_PATH: files.defaults,
    QWEN_CODE_TRUSTED_FOLDERS_PATH: files.trusted,
    QWEN_CODE_MCP_APPROVALS_PATH: files.approvals,
    QWEN_CODE_DISABLE_PRECONNECT: '1',
    QWEN_CODE_NO_BROWSER: '1',
    NO_BROWSER: '1',
    QWEN_CODE_SKIP_UPDATE_CHECK_ONCE: 'true',
    QWEN_TELEMETRY_ENABLED: 'false',
    QWEN_USAGE_STATISTICS_ENABLED: 'false',
    NODE_DISABLE_COMPILE_CACHE: '1',
  };
}

function codexEnv(stateRoot) {
  return {
    ...commonEnv(stateRoot),
    CODEX_HOME: path.join(stateRoot, 'config', 'codex-home'),
  };
}

function claudeEnv(stateRoot) {
  return {
    ...commonEnv(stateRoot),
    CLAUDE_CONFIG_DIR: path.join(stateRoot, 'config', 'claude'),
    CLAUDE_CODE_TMPDIR: path.join(stateRoot, 'tmp', 'claude'),
    CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC: '1',
    CLAUDE_CODE_DISABLE_OFFICIAL_MARKETPLACE_AUTOINSTALL: '1',
    DISABLE_AUTOUPDATER: '1',
    DISABLE_UPDATES: '1',
    DISABLE_TELEMETRY: '1',
  };
}

function errorRecord(error) {
  return {
    name: error instanceof Error ? error.name : 'Error',
    message: error instanceof Error ? error.message : String(error),
    ...(typeof error?.code === 'string' ? { code: error.code } : {}),
  };
}

function processGroupIsAlive(processGroupId) {
  try {
    process.kill(-processGroupId, 0);
    return true;
  } catch (error) {
    if (error.code === 'ESRCH') return false;
    if (error.code === 'EPERM') return true;
    throw error;
  }
}

function signalProcessGroup(processGroupId, signal) {
  try {
    process.kill(-processGroupId, signal);
    return { signal, outcome: 'sent' };
  } catch (error) {
    if (error.code === 'ESRCH') {
      return { signal, outcome: 'already-gone' };
    }
    return { signal, outcome: 'error', error: errorRecord(error) };
  }
}

async function waitForProcessGroupExit(processGroupId, timeoutMs) {
  const deadline = performance.now() + timeoutMs;
  while (performance.now() < deadline) {
    if (!processGroupIsAlive(processGroupId)) return true;
    await new Promise((resolve) => setTimeout(resolve, 25));
  }
  return !processGroupIsAlive(processGroupId);
}

async function runSandboxed({
  profile,
  targetBinary,
  targetRoot,
  probeRoot,
  writeRoot,
  cwd,
  args,
  env,
  stdin,
  timeoutMs = defaultTimeoutMs,
}) {
  const startedAt = now();
  const startedMonotonic = performance.now();
  const sandboxArgs = [
    '-f',
    profile,
    '-D',
    `TARGET_BINARY=${targetBinary}`,
    '-D',
    `TARGET_ROOT=${targetRoot}`,
    '-D',
    `PROBE_ROOT=${probeRoot}`,
    '-D',
    `WRITE_ROOT=${writeRoot}`,
    targetBinary,
    ...args,
  ];
  const stdout = createCapture();
  const stderr = createCapture();
  let child;
  let processGroupId = null;
  let timeoutTimer;
  let killTimer;
  let hardStopTimer;
  let timedOut = false;
  let streamHardStopReached = false;
  let forcedSignal = null;
  let spawnError = null;
  const stdinDelivery = {
    provided: stdin !== null,
    attemptedBytes:
      stdin === null ? 0 : Buffer.byteLength(stdin, 'utf8'),
    writeCallback: stdin === null ? 'not-applicable' : 'pending',
    streamError: null,
    endCalled: false,
  };
  let exit = { code: null, signal: null };
  let exitObserved = false;
  let closeObserved = false;
  let cleanupAttempted = false;
  let processGroupVerifiedGone = false;
  let cleanupError = null;
  const cleanupSignals = [];

  try {
    child = spawn('/usr/bin/sandbox-exec', sandboxArgs, {
      cwd,
      env,
      detached: true,
      shell: false,
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    processGroupId = child.pid ?? null;
    child.stdout.on('data', (chunk) => {
      stdout.append(chunk);
    });
    child.stderr.on('data', (chunk) => {
      stderr.append(chunk);
    });
    child.stdin.on('error', (error) => {
      stdinDelivery.streamError = errorRecord(error);
    });
    child.once('exit', (code, signal) => {
      exitObserved = true;
      exit = { code, signal };
    });
    if (stdin !== null) {
      child.stdin.write(stdin, (error) => {
        stdinDelivery.writeCallback =
          error === null || error === undefined
            ? 'accepted-by-stream'
            : errorRecord(error);
      });
    }
    child.stdin.end();
    stdinDelivery.endCalled = true;

    timeoutTimer = setTimeout(() => {
      timedOut = true;
      forcedSignal = 'SIGTERM';
      if (processGroupId !== null) {
        cleanupSignals.push(
          signalProcessGroup(processGroupId, 'SIGTERM'),
        );
      }
      killTimer = setTimeout(() => {
        if (processGroupId !== null) {
          forcedSignal = 'SIGKILL';
          cleanupSignals.push(
            signalProcessGroup(processGroupId, 'SIGKILL'),
          );
        }
      }, cleanupWaitMs);
      killTimer.unref();
    }, timeoutMs);

    exit = await new Promise((resolve) => {
      child.once('error', (error) => {
        spawnError = errorRecord(error);
        resolve({ code: null, signal: null });
      });
      child.once('close', (code, signal) => {
        closeObserved = true;
        resolve({ code, signal });
      });
      hardStopTimer = setTimeout(
        () => {
          streamHardStopReached = true;
          child.stdin.destroy();
          child.stdout.destroy();
          child.stderr.destroy();
          resolve({
            code: child.exitCode,
            signal: child.signalCode,
          });
        },
        timeoutMs + cleanupWaitMs * 2,
      );
    });
  } finally {
    if (timeoutTimer !== undefined) clearTimeout(timeoutTimer);
    if (killTimer !== undefined) clearTimeout(killTimer);
    if (hardStopTimer !== undefined) clearTimeout(hardStopTimer);
    cleanupAttempted = true;
    if (processGroupId === null) {
      processGroupVerifiedGone = true;
    } else {
      try {
        if (processGroupIsAlive(processGroupId)) {
          cleanupSignals.push(
            signalProcessGroup(processGroupId, 'SIGKILL'),
          );
        }
        processGroupVerifiedGone = await waitForProcessGroupExit(
          processGroupId,
          cleanupWaitMs,
        );
      } catch (error) {
        cleanupError = errorRecord(error);
      }
    }
    if (!processGroupVerifiedGone && cleanupError === null) {
      cleanupError = {
        name: 'CleanupVerificationError',
        message: `Process group ${String(processGroupId)} remained alive`,
      };
    }
  }

  if (stdinDelivery.writeCallback === 'pending') {
    stdinDelivery.writeCallback = 'not-observed-before-return';
  }
  return {
    startedAt,
    finishedAt: now(),
    durationMs: Math.round(performance.now() - startedMonotonic),
    timeoutMs,
    streamHardStopMs: timeoutMs + cleanupWaitMs * 2,
    totalCleanupBoundMs: timeoutMs + cleanupWaitMs * 3,
    timedOut,
    streamHardStopReached,
    forcedSignal,
    exitCode: exit.code,
    signal: exit.signal,
    exitObserved,
    closeObserved,
    spawnError,
    stdinDelivery: { ...stdinDelivery },
    cleanup: {
      attempted: cleanupAttempted,
      processGroupId,
      signals: cleanupSignals,
      processGroupVerifiedGone,
      error: cleanupError,
      limitation:
        'Descendants that create a new session or process group are outside this process-group liveness check.',
    },
    stdout: stdout.finish(),
    stderr: stderr.finish(),
  };
}

function scenarioCatalog() {
  const qwenHeadless = [
    '--safe-mode',
    '--approval-mode',
    'plan',
    '--auth-type',
    'openai',
    '--max-wall-time',
    '10s',
    '--max-tool-calls',
    '0',
    '--max-session-turns',
    '1',
  ];
  const codexHeadless = [
    'exec',
    '--skip-git-repo-check',
    '--ephemeral',
    '--ignore-user-config',
    '--sandbox',
    'read-only',
    '--color',
    'never',
  ];
  const claudeHeadless = [
    '--print',
    '--bare',
    '--no-session-persistence',
    '--tools',
    '',
    '--permission-mode',
    'plan',
  ];
  return [
    {
      id: 'P2B-E0-IDENTITY',
      label: 'frozen identity',
      candidateAtomics: {
        codex: [],
        claude: [],
        qwen: [],
      },
      candidateDimensions: {
        codex: [],
        claude: [],
        qwen: [],
      },
      risk: 'R0',
      products: {
        codex: { args: ['--version'], stdin: null },
        claude: { args: ['--version'], stdin: null },
        qwen: { args: ['--version'], stdin: null },
      },
    },
    {
      id: 'P2B-E0-INVALID-SCHEMA',
      label: 'malformed JSON schema rejection',
      candidateAtomics: {
        codex: ['CAP-10.03-A03'],
        claude: ['CAP-10.03-A03'],
        qwen: ['CAP-10.03-A03', 'CAP-10.05-A04'],
      },
      candidateDimensions: {
        codex: ['ENTRY', 'AVAIL', 'FAIL'],
        claude: ['ENTRY', 'AVAIL', 'FAIL'],
        qwen: ['ENTRY', 'AVAIL', 'FAIL'],
      },
      risk: 'R1',
      products: {
        codex: {
          args: [
            ...codexHeadless,
            '--output-schema',
            '{INVALID_SCHEMA_FILE}',
            fixture.argvPrompt,
          ],
          stdin: null,
        },
        claude: {
          args: [
            ...claudeHeadless,
            '--output-format',
            'stream-json',
            '--verbose',
            '--json-schema',
            fixture.invalidSchema,
            fixture.argvPrompt,
          ],
          stdin: null,
        },
        qwen: {
          args: [
            ...qwenHeadless,
            '--output-format',
            'stream-json',
            '--json-schema',
            '@{INVALID_SCHEMA_FILE}',
            '-p',
            fixture.argvPrompt,
          ],
          stdin: null,
        },
      },
    },
    {
      id: 'P2B-E0-EMPTY-EOF',
      label: 'zero-byte stdin followed by EOF',
      candidateAtomics: {
        codex: ['CAP-10.01-A01', 'CAP-10.02-A02'],
        claude: ['CAP-10.01-A01', 'CAP-10.02-A02'],
        qwen: ['CAP-10.01-A01', 'CAP-10.02-A02', 'CAP-10.05-A04'],
      },
      candidateDimensions: {
        codex: ['ENTRY', 'AVAIL', 'FAIL'],
        claude: ['ENTRY', 'AVAIL', 'FAIL'],
        qwen: ['ENTRY', 'AVAIL', 'FAIL'],
      },
      risk: 'R1',
      products: {
        codex: {
          args: [...codexHeadless, '--json', '-'],
          stdin: '',
        },
        claude: {
          args: [
            ...claudeHeadless,
            '--output-format',
            'stream-json',
            '--verbose',
          ],
          stdin: '',
        },
        qwen: {
          args: [...qwenHeadless, '--output-format', 'stream-json'],
          stdin: '',
        },
      },
    },
    {
      id: 'P2B-E0-ARGV-NOAUTH',
      label: 'argv prompt reaches isolated missing-auth gate',
      candidateAtomics: {
        codex: ['CAP-10.01-A01', 'CAP-10.02-A01', 'CAP-10.03-A02'],
        claude: ['CAP-10.01-A01', 'CAP-10.02-A01', 'CAP-10.03-A02'],
        qwen: [
          'CAP-10.01-A01',
          'CAP-10.02-A01',
          'CAP-10.03-A02',
          'CAP-10.05-A04',
        ],
      },
      candidateDimensions: {
        codex: ['ENTRY', 'AVAIL', 'FAIL'],
        claude: ['ENTRY', 'AVAIL', 'FAIL'],
        qwen: ['ENTRY', 'AVAIL', 'FAIL'],
      },
      risk: 'R1',
      products: {
        codex: {
          args: [...codexHeadless, '--json', fixture.argvPrompt],
          stdin: null,
        },
        claude: {
          args: [
            ...claudeHeadless,
            '--verbose',
            '--output-format',
            'stream-json',
            fixture.argvPrompt,
          ],
          stdin: null,
        },
        qwen: {
          args: [
            ...qwenHeadless,
            '--output-format',
            'stream-json',
            '-p',
            fixture.argvPrompt,
          ],
          stdin: null,
        },
      },
    },
    {
      id: 'P2B-E0-STDIN-NOAUTH',
      label: 'stdin prompt reaches isolated missing-auth gate',
      candidateAtomics: {
        codex: ['CAP-10.01-A01', 'CAP-10.02-A02', 'CAP-10.03-A02'],
        claude: ['CAP-10.01-A01', 'CAP-10.02-A02', 'CAP-10.03-A02'],
        qwen: [
          'CAP-10.01-A01',
          'CAP-10.02-A02',
          'CAP-10.03-A02',
          'CAP-10.05-A04',
        ],
      },
      candidateDimensions: {
        codex: ['ENTRY', 'AVAIL', 'FAIL'],
        claude: ['ENTRY', 'AVAIL', 'FAIL'],
        qwen: ['ENTRY', 'AVAIL', 'FAIL'],
      },
      risk: 'R1',
      products: {
        codex: {
          args: [...codexHeadless, '--json', '-'],
          stdin: fixture.stdinPrompt,
        },
        claude: {
          args: [
            ...claudeHeadless,
            '--verbose',
            '--output-format',
            'stream-json',
          ],
          stdin: fixture.stdinPrompt,
        },
        qwen: {
          args: [...qwenHeadless, '--output-format', 'stream-json'],
          stdin: fixture.stdinPrompt,
        },
      },
    },
    {
      id: 'P2B-E0-DOCTOR-EMPTY',
      label: 'empty isolated doctor',
      candidateAtomics: {
        codex: ['CAP-12.05-A02'],
        claude: ['CAP-12.05-A02'],
      },
      candidateDimensions: {
        codex: ['ENTRY', 'AVAIL', 'SIDEFX', 'OUTPUT', 'FAIL', 'OBS'],
        claude: ['ENTRY', 'AVAIL', 'SIDEFX', 'OUTPUT', 'FAIL', 'OBS'],
      },
      risk: 'R1',
      products: {
        codex: { args: ['doctor', '--json'], stdin: null },
        claude: { args: ['--bare', 'doctor'], stdin: null },
      },
    },
    {
      id: 'P2B-E0-CONFIG-MALFORMED',
      label: 'malformed explicit config',
      candidateAtomics: {
        codex: ['CAP-12.05-A02', 'CAP-12.09-A02'],
        claude: ['CAP-12.05-A02'],
        qwen: ['CAP-12.09-A02'],
      },
      candidateDimensions: {
        codex: ['ENTRY', 'AVAIL', 'SIDEFX', 'OUTPUT', 'FAIL', 'OBS'],
        claude: ['ENTRY', 'AVAIL', 'SIDEFX', 'OUTPUT', 'FAIL', 'OBS'],
        qwen: ['ENTRY', 'AVAIL', 'SIDEFX', 'OUTPUT', 'FAIL', 'OBS'],
      },
      risk: 'R1',
      configKind: 'malformed',
      products: {
        codex: { args: ['doctor', '--json'], stdin: null },
        claude: {
          args: [
            '--bare',
            '--settings',
            '{CLAUDE_SETTINGS_FILE}',
            'doctor',
          ],
          stdin: null,
        },
        qwen: {
          args: ['--list-extensions'],
          stdin: null,
        },
      },
    },
    {
      id: 'P2B-E0-CONFIG-UNKNOWN',
      label: 'unknown explicit config field',
      candidateAtomics: {
        codex: ['CAP-12.09-A02'],
        claude: ['CAP-12.05-A02'],
        qwen: ['CAP-12.09-A02'],
      },
      candidateDimensions: {
        codex: ['ENTRY', 'AVAIL', 'SIDEFX', 'OUTPUT', 'FAIL', 'OBS'],
        claude: ['ENTRY', 'AVAIL', 'SIDEFX', 'OUTPUT', 'FAIL', 'OBS'],
        qwen: ['ENTRY', 'AVAIL', 'SIDEFX', 'OUTPUT', 'FAIL', 'OBS'],
      },
      risk: 'R1',
      configKind: 'unknown',
      products: {
        codex: {
          args: [
            '--strict-config',
            'exec',
            '--skip-git-repo-check',
            '--ephemeral',
            '--sandbox',
            'read-only',
            '--color',
            'never',
            '--json',
            fixture.argvPrompt,
          ],
          stdin: null,
        },
        claude: {
          args: [
            '--bare',
            '--settings',
            '{CLAUDE_SETTINGS_FILE}',
            'doctor',
          ],
          stdin: null,
        },
        qwen: {
          args: ['--list-extensions'],
          stdin: null,
        },
      },
    },
  ];
}

async function prepareProductRun({
  scenario,
  product,
  root,
  artifacts,
}) {
  const preparedRun = await prepareRun(root, scenario.id, product);
  const {
    runRoot,
    repoRoot,
    fixtureRoot,
    stateRoot,
    materializedFixtureManifest,
  } = preparedRun;
  const cwd = repoRoot;
  let args = [...scenario.products[product].args];
  let env;
  let launcher;
  let targetRoot;

  if (product === 'codex') {
    const codexHome = path.join(stateRoot, 'config', 'codex-home');
    await mkdir(codexHome, { recursive: true });
    if (scenario.configKind === 'malformed') {
      await writeFile(path.join(codexHome, 'config.toml'), '{\n');
    } else if (scenario.configKind === 'unknown') {
      await writeFile(
        path.join(codexHome, 'config.toml'),
        'phase2b_unknown_key = true\n',
      );
    }
    args = args.map((arg) =>
      arg === '{INVALID_SCHEMA_FILE}'
        ? path.join(fixtureRoot, 'invalid-schema.json')
        : arg,
    );
    env = codexEnv(stateRoot);
    launcher = artifacts.codex;
    targetRoot = artifacts.codexTreeRoot;
  } else if (product === 'claude') {
    const settingsFile = path.join(
      stateRoot,
      'config',
      'claude-settings.json',
    );
    if (scenario.configKind === 'malformed') {
      await writeFile(settingsFile, '{\n');
    } else if (scenario.configKind === 'unknown') {
      await writeFile(
        settingsFile,
        `${JSON.stringify({ phase2bUnknownKey: true })}\n`,
      );
    }
    args = args.map((arg) =>
      arg === '{CLAUDE_SETTINGS_FILE}' ? settingsFile : arg,
    );
    env = claudeEnv(stateRoot);
    launcher = artifacts.claude;
    targetRoot = artifacts.claudeTreeRoot;
  } else {
    const userContent =
      scenario.configKind === 'malformed'
        ? '{\n'
        : scenario.configKind === 'unknown'
          ? `${JSON.stringify({
              $version: 4,
              phase2bUnknownKey: true,
            })}\n`
          : '{"$version":4}\n';
    const files = await prepareQwenSettings(stateRoot, userContent);
    args = args.map((arg) =>
      arg === '@{INVALID_SCHEMA_FILE}'
        ? `@${path.join(fixtureRoot, 'invalid-schema.json')}`
        : arg,
    );
    env = qwenEnv(stateRoot, files);
    launcher = artifacts.node;
    targetRoot = artifacts.qwenTreeRoot;
    args = [artifacts.qwenEntry, ...args];
  }

  return {
    runRoot,
    stateRoot,
    cwd,
    args,
    env,
    launcher,
    targetRoot,
    stdin: scenario.products[product].stdin,
    materializedFixtureManifest,
  };
}

async function main() {
  const runnerPath = fileURLToPath(import.meta.url);
  const input = parseArgs(process.argv.slice(2));
  const output = requireAbsolute(input.output, '--output');
  const artifacts = {
    codex: requireAbsolute(input['codex-binary'], '--codex-binary'),
    claude: requireAbsolute(input['claude-binary'], '--claude-binary'),
    qwenEntry: requireAbsolute(input['qwen-entry'], '--qwen-entry'),
    qwenTarball: requireAbsolute(
      input['qwen-tarball'],
      '--qwen-tarball',
    ),
    node: requireAbsolute(input.node, '--node'),
    profile: requireAbsolute(input.profile, '--profile'),
  };
  artifacts.codexTreeRoot = path.dirname(path.dirname(artifacts.codex));
  artifacts.claudeTreeRoot = path.dirname(artifacts.claude);
  artifacts.qwenTreeRoot = path.dirname(artifacts.qwenEntry);
  artifacts.qwenBundle = path.join(
    artifacts.qwenTreeRoot,
    'cli.js',
  );
  const nodeRuntimeManifest = await sha256NodeRuntimeManifest();

  const actualHashes = {
    codex: await sha256File(artifacts.codex),
    claude: await sha256File(artifacts.claude),
    qwenEntry: await sha256File(artifacts.qwenEntry),
    qwenBundle: await sha256File(artifacts.qwenBundle),
    node: await sha256File(artifacts.node),
    profile: await sha256File(artifacts.profile),
    sandboxExec: await sha256File('/usr/bin/sandbox-exec'),
    opensslConfig: await sha256File(
      '/opt/homebrew/etc/openssl@3/openssl.cnf',
    ),
    runner: await sha256File(runnerPath),
    codexTree: await sha256Tree(artifacts.codexTreeRoot),
    claudeTree: await sha256Tree(artifacts.claudeTreeRoot),
    qwenTree: await sha256Tree(artifacts.qwenTreeRoot),
    qwenTarball: await sha256File(artifacts.qwenTarball),
    systemSandboxProfile: await sha256File(
      '/System/Library/Sandbox/Profiles/system.sb',
    ),
    dyldSandboxProfile: await sha256File(
      '/System/Library/Sandbox/Profiles/dyld-support.sb',
    ),
    systemVersion: await sha256File(
      '/System/Library/CoreServices/SystemVersion.plist',
    ),
    nodeRuntimeTrees: nodeRuntimeManifest.sha256,
  };
  for (const [key, expected] of Object.entries(expectedArtifacts)) {
    if (actualHashes[key] !== expected) {
      throw new Error(
        `${key} hash drift: expected ${expected}, got ${actualHashes[key]}`,
      );
    }
  }
  const actualFixtureHashes = {
    repoReadme: sha256Bytes(fixture.repoReadme),
    sentinel: sha256Bytes(fixture.sentinel),
    argvPrompt: sha256Bytes(fixture.argvPrompt),
    stdinPrompt: sha256Bytes(fixture.stdinPrompt),
    invalidSchema: sha256Bytes(fixture.invalidSchema),
    validSchema: sha256Bytes(fixture.validSchema),
  };
  for (const [key, actual] of Object.entries(actualFixtureHashes)) {
    const expected = fixture[`${key}Sha256`];
    if (actual !== expected) {
      throw new Error(
        `${key} fixture drift: expected ${expected}, got ${actual}`,
      );
    }
  }
  if (process.platform !== 'darwin' || process.arch !== 'arm64') {
    throw new Error(
      `Unsupported platform: ${process.platform}/${process.arch}; expected darwin/arm64`,
    );
  }
  if (
    (await realpath(process.execPath)) !== (await realpath(artifacts.node))
  ) {
    throw new Error(
      `Runner node drift: ${process.execPath} is not ${artifacts.node}`,
    );
  }

  const root = await mkdtemp('/private/tmp/ccq-phase2b-safe-');
  const resolvedRoot = await realpath(root);
  if (!resolvedRoot.startsWith('/private/tmp/ccq-phase2b-safe-')) {
    throw new Error(`Unsafe probe root: ${resolvedRoot}`);
  }
  const frozenInputRoot = path.join(resolvedRoot, 'frozen-inputs');
  await mkdir(frozenInputRoot);
  artifacts.executionProfile = path.join(
    frozenInputRoot,
    'phase-2b-cli.sb',
  );
  await writeFile(
    artifacts.executionProfile,
    await readFile(artifacts.profile),
  );
  await chmod(artifacts.executionProfile, 0o444);
  verifyExecutionIntegrity(
    { profile: await sha256File(artifacts.executionProfile) },
    { profile: actualHashes.profile },
    'frozen profile copy',
  );
  const startedAt = now();
  const results = [];
  const catalog = scenarioCatalog();

  for (const scenario of catalog) {
    for (const product of Object.keys(scenario.products)) {
      const prepared = await prepareProductRun({
        scenario,
        product,
        root: resolvedRoot,
        artifacts,
      });
      const expectedIntegrity = expectedExecutionIntegrity(
        product,
        actualHashes,
      );
      const integrityBefore = await captureExecutionIntegrity(
        product,
        artifacts,
        artifacts.executionProfile,
      );
      verifyExecutionIntegrity(
        integrityBefore,
        expectedIntegrity,
        `${scenario.id}/${product} before execution`,
      );
      const before = await inventoryTree(prepared.runRoot);
      const runtime = await runSandboxed({
        profile: artifacts.executionProfile,
        targetBinary: prepared.launcher,
        targetRoot: prepared.targetRoot,
        probeRoot: prepared.runRoot,
        writeRoot: prepared.stateRoot,
        cwd: prepared.cwd,
        args: prepared.args,
        env: prepared.env,
        stdin: prepared.stdin,
      });
      if (!runtime.cleanup.processGroupVerifiedGone) {
        throw new Error(
          `${scenario.id}/${product} process group cleanup was not verified`,
        );
      }
      if (runtime.spawnError !== null) {
        throw new Error(
          `${scenario.id}/${product} spawn failed: ${runtime.spawnError.message}`,
        );
      }
      const integrityAfter = await captureExecutionIntegrity(
        product,
        artifacts,
        artifacts.executionProfile,
      );
      verifyExecutionIntegrity(
        integrityAfter,
        expectedIntegrity,
        `${scenario.id}/${product} after execution`,
      );
      const after = await inventoryTree(prepared.runRoot);
      const sideEffects = inventoryDelta(before, after);
      verifySideEffectBoundary(
        sideEffects,
        `${scenario.id}/${product}`,
      );
      if (scenario.id === 'P2B-E0-IDENTITY') {
        verifyIdentityPreflight(product, runtime);
      }
      results.push({
        scenarioId: scenario.id,
        scenarioLabel: scenario.label,
        candidateAtomics: scenario.candidateAtomics[product],
        candidateDimensions: scenario.candidateDimensions[product],
        risk: scenario.risk,
        product,
        runRoot: prepared.runRoot,
        command: {
          executable: prepared.launcher,
          args: prepared.args,
          cwd: prepared.cwd,
          stdin: prepared.stdin,
          environment: prepared.env,
        },
        runtime,
        executionIntegrity: {
          expected: expectedIntegrity,
          before: integrityBefore,
          after: integrityAfter,
          matched: true,
          limitation:
            'Pre/post hashing detects drift but cannot exclude a transient modify-and-restore race during execution.',
        },
        materializedFixtureManifest:
          prepared.materializedFixtureManifest,
        inventoryBefore: before,
        inventoryAfter: after,
        sideEffects,
        sideEffectBoundaryVerified: true,
      });
    }
  }

  const record = {
    schemaVersion: 2,
    probeId: 'CCQ-PHASE2B-SAFE-WAVE-001',
    status: 'captured',
    startedAt,
    finishedAt: now(),
    platform: {
      os: process.platform,
      arch: process.arch,
      node: process.version,
      nodeExecutable: process.execPath,
    },
    policy: {
      inheritedEnvironment: false,
      credentialsCopied: false,
      persistentWritesOutsideStateAllowed: false,
      networkAllowed: false,
      directFileProcessNetworkContainmentOnly: true,
      containmentLimitation:
        'The imported system profile retains platform Mach/XPC allowances; this is not complete host isolation.',
      sandboxProfileSource: artifacts.profile,
      sandboxProfile: artifacts.executionProfile,
      sandboxProfileSha256: actualHashes.profile,
      sandboxExec: {
        path: '/usr/bin/sandbox-exec',
        sha256: actualHashes.sandboxExec,
      },
      importedSystemSandboxProfile: {
        path: '/System/Library/Sandbox/Profiles/system.sb',
        sha256: actualHashes.systemSandboxProfile,
      },
      importedDyldSandboxProfile: {
        path: '/System/Library/Sandbox/Profiles/dyld-support.sb',
        sha256: actualHashes.dyldSandboxProfile,
      },
      systemVersionPlistSha256: actualHashes.systemVersion,
      runner: runnerPath,
      runnerSha256: actualHashes.runner,
      probeRoot: resolvedRoot,
      identityPreflight: {
        requiredBeforeNonIdentityScenarios: true,
        passed:
          results
            .filter(
              (result) =>
                result.scenarioId === 'P2B-E0-IDENTITY',
            )
            .length === 3,
      },
      sideEffectBoundary: {
        allowedRootPerExecution: 'state/',
        allExecutionsVerified: results.every(
          (result) => result.sideEffectBoundaryVerified,
        ),
      },
      cleanup: {
        strategy:
          'SIGTERM on timeout, then SIGKILL to the detached process group, followed by a bounded liveness probe',
        executionTimeoutMs: defaultTimeoutMs,
        streamHardStopMs:
          defaultTimeoutMs + cleanupWaitMs * 2,
        totalOriginalGroupCleanupBoundMs:
          defaultTimeoutMs + cleanupWaitMs * 3,
        allProcessGroupsVerifiedGone: results.every(
          (result) => result.runtime.cleanup.processGroupVerifiedGone,
        ),
        allCloseEventsObserved: results.every(
          (result) => result.runtime.closeObserved,
        ),
        limitation:
          'A descendant that creates a new session or process group can escape the recorded process-group check.',
        probeRootRetainedForReview: true,
      },
    },
    artifacts: {
      codex: {
        version: '0.145.0',
        path: artifacts.codex,
        sha256: actualHashes.codex,
        treeRoot: artifacts.codexTreeRoot,
        treeSha256: actualHashes.codexTree,
      },
      claude: {
        version: '2.1.212',
        path: artifacts.claude,
        sha256: actualHashes.claude,
        treeRoot: artifacts.claudeTreeRoot,
        treeSha256: actualHashes.claudeTree,
      },
      qwen: {
        version: '0.21.0',
        entryPath: artifacts.qwenEntry,
        entrySha256: actualHashes.qwenEntry,
        bundlePath: artifacts.qwenBundle,
        bundleSha256: actualHashes.qwenBundle,
        treeRoot: artifacts.qwenTreeRoot,
        treeSha256: actualHashes.qwenTree,
        tarballPath: artifacts.qwenTarball,
        tarballSha256: actualHashes.qwenTarball,
        nodePath: artifacts.node,
        nodeSha256: actualHashes.node,
        nodeRuntimeManifest,
        nodeRuntimeConfig: {
          path: '/opt/homebrew/etc/openssl@3/openssl.cnf',
          sha256: actualHashes.opensslConfig,
        },
      },
    },
    fixture: {
      repoReadme: {
        value: fixture.repoReadme,
        sha256: actualFixtureHashes.repoReadme,
      },
      sentinel: {
        value: fixture.sentinel,
        sha256: actualFixtureHashes.sentinel,
      },
      argvPrompt: {
        value: fixture.argvPrompt,
        sha256: actualFixtureHashes.argvPrompt,
      },
      stdinPrompt: {
        value: fixture.stdinPrompt,
        sha256: actualFixtureHashes.stdinPrompt,
      },
      invalidSchema: {
        value: fixture.invalidSchema,
        sha256: actualFixtureHashes.invalidSchema,
      },
      validSchema: {
        value: fixture.validSchema,
        sha256: actualFixtureHashes.validSchema,
        executionStatus: 'reserved for separately authorized R2 wave',
      },
    },
    projectionPolicy: {
      safeWaveScope:
        'parser, EOF, authentication/provider/config gates, diagnostics, and machine error expression only',
      successClaimsAllowed: false,
      supportEdgesCreatedByRunner: false,
      noauthEntryDoesNotProveTaskExecution: true,
      invalidSchemaDoesNotProveSchemaConstrainedSuccess: true,
      qwenMachineErrorProjection:
        'requires complete parseable JSON/JSONL with category, stage, retryability, and run correlation; a terminal error label alone is insufficient',
      claudeStableMachineErrorProjection:
        'not projected to CAP-10.05-A04 because the frozen stable slice has no such Claim',
    },
    scenarios: catalog.map((scenario) => ({
      id: scenario.id,
      label: scenario.label,
      candidateAtomics: scenario.candidateAtomics,
      candidateDimensions: scenario.candidateDimensions,
      risk: scenario.risk,
      configKind: scenario.configKind ?? null,
      products: Object.keys(scenario.products),
    })),
    results,
  };
  await mkdir(path.dirname(output), { recursive: true });
  await writeFile(output, `${JSON.stringify(record, null, 2)}\n`);
  process.stdout.write(
    `${JSON.stringify({
      output,
      probeRoot: resolvedRoot,
      scenarios: catalog.length,
      executions: results.length,
      timedOut: results.filter((result) => result.runtime.timedOut).length,
    })}\n`,
  );
}

await main();
