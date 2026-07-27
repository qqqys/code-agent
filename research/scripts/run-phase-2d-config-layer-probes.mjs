#!/usr/bin/env node

import { spawn } from 'node:child_process';
import { createHash } from 'node:crypto';
import { createReadStream } from 'node:fs';
import {
  chmod,
  lstat,
  mkdir,
  mkdtemp,
  readdir,
  readFile,
  readlink,
  realpath,
  writeFile,
} from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const scriptPath = fileURLToPath(import.meta.url);
const scriptDir = path.dirname(scriptPath);
const researchRoot = path.resolve(scriptDir, '..');
const fixedOutput = path.join(
  researchRoot,
  'artifacts',
  'phase-2d',
  'config-identity-layering.json',
);
const maxCaptureBytes = 2 * 1024 * 1024;
const processTimeoutMs = 20_000;
const shutdownTimeoutMs = 3_000;
const qwenToken = 'ccq-phase2d-fixed-synthetic-token';
const claudeControlRequest =
  '{"type":"control_request","request_id":"cfg-1","request":{"subtype":"get_settings"}}\n';

const expectedHashes = {
  codexBinary:
    '1da3f4e0e96028b8a771814293c3033dafd1971f943f6c7e79b0897fe705f590',
  codexTree:
    '892f8a81f38ec7e2784938ef12fa6ef6a7bfe1cf5f757984f8c4288835e5f551',
  claudeBinary:
    '09ecba2ab2df9b6ee5b0695e26f65dea60fb3b6af3d3542ee09f466838d1e574',
  claudeTree:
    'c2e8651cd407e418b0af7c1cb22314ff9dd36f4ecf1da3016a9ba62d00774e62',
  qwenEntry:
    '1db9709bf1753611ca2fec234cf5adf517376efeb1540fcf9e309da010f9ed38',
  qwenTree:
    'a106a1332b3266bef53839a74fb10c7fb961bec59dd791adbe92cd502eae500e',
  qwenSettingsChunk:
    'b0226f47c6c0c9afbdde9d00256d9a4399bfaf139ab0e8f63ff83eeba2b0a664',
  qwenServerChunk:
    '5ac596278b65e6b466820d55791ce709fba8c28cec08c7556acf9d146afbd3f6',
  node:
    '32e234a5b6bec67d72a016f2baadf7fadf3afd328470b395b73af473fdee0d85',
  cliProfile:
    'ff5f599cad03d5c257827314c5a483e3cffaa2fef2d7b70a433e376ad1c700e6',
  qwenProfile:
    '995857032aad38d2cea9876a4cbe70c7e29cde577539b9052af30c21d6ff8219',
  codexProtocolAggregate:
    '80727df3cbf8988e82abc75c2a95d766be05c1bdba59910e4dd2b52094fe46f6',
  codexConfigReadParams:
    '9a51989dc089ac297037c6f1fdc65a73f9c8105837e93a998f173a80c7880172',
  codexConfigReadResponse:
    'dc3402b3908b08eda6d09500b8425ca5168cf92d93842ad6fcda69d6d1fc634f',
  codexClientRequest:
    '03e30c97136d6618273e3e9197d8621bad9ac6cfd733c0cfe09dc8754ee6ac5c',
  codexInitializeParams:
    '4f576f99e285beb28f71f48a72b887c1f517dada86fee348fe2af0a35511de23',
};

const schemaIdentity = {
  codex: {
    classification: 'versionless-generated-schema',
    releaseTag: 'rust-v0.145.0',
    path: 'codex-rs/core/config.schema.json',
    sourceUrl:
      'https://raw.githubusercontent.com/openai/codex/rust-v0.145.0/codex-rs/core/config.schema.json',
    contentSha256:
      '03456feaba4d215f3ebbb3e5a5391ebc7e9a108b944d34345142ca3e5ba28bd9',
    root: {
      schema: 'http://json-schema.org/draft-07/schema#',
      id: null,
      title: 'ConfigToml',
      version: null,
      type: 'object',
    },
    generation:
      'exact-tag justfile: write-config-schema = cargo run -p codex-core --bin codex-write-config-schema',
    limitation:
      'Release tag, path, and content hash identify the schema; they do not prove cryptographic build provenance to the released binary.',
  },
  claude: {
    classification: 'versionless-split-editor-and-runtime',
    binaryVersion: '2.1.212',
    binaryGitSha: '8b2783a8f907ce5c5ad1241ecdbab0ff3301c617',
    editorSchema: {
      repository: 'SchemaStore/schemastore',
      commit: 'cfd4af80100400941fdc66787e24e6a2eed7348a',
      committedAt: '2026-07-03T08:55:35Z',
      path: 'src/schemas/json/claude-code-settings.json',
      sourceUrl:
        'https://raw.githubusercontent.com/SchemaStore/schemastore/cfd4af80100400941fdc66787e24e6a2eed7348a/src/schemas/json/claude-code-settings.json',
      contentSha256:
        '2b4004b2af619ce16bd6dafc0a8f1f03974f45740f4212a1f85f236364057d28',
      root: {
        schema: 'http://json-schema.org/draft-07/schema#',
        id: 'https://json.schemastore.org/claude-code-settings.json',
        title: 'Claude Code Settings',
        version: null,
      },
    },
    runtimeIdentity:
      '2.1.212 exact binary SHA plus get_settings control reader; no public runtime schema id/version observed in the selected surface.',
    limitation:
      'The pinned editor schema and the exact binary runtime validator are not assumed to be identical.',
  },
  qwen: {
    classification: 'settings-format-version',
    binaryVersion: '0.21.0',
    expectedVersion: 4,
    expectedKey: '$version',
    migrationEdges: ['v1→v2', 'v2→v3', 'v3→v4', 'v5→v4'],
    limitation:
      'The daemon response envelope v:1 is not the settings $version, and format identity does not close consumer-level validation.',
  },
  relation: 'Different mechanisms / Not directly comparable',
};

function parseArgs(argv) {
  const values = {};
  for (let index = 0; index < argv.length; index += 2) {
    const key = argv[index];
    const value = argv[index + 1];
    if (!key?.startsWith('--') || value === undefined) {
      throw new Error(`Invalid argument sequence at ${String(key)}`);
    }
    values[key.slice(2)] = value;
  }
  return values;
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
      }
    }
  }

  await visit(root);
  return hash.digest('hex');
}

async function inventoryTree(root) {
  const entries = [];

  async function visit(directory) {
    const children = await readdir(directory, { withFileTypes: true });
    children.sort((left, right) => left.name.localeCompare(right.name));
    for (const child of children) {
      const absolute = path.join(directory, child.name);
      const stat = await lstat(absolute);
      const entry = {
        path: path.relative(root, absolute).split(path.sep).join('/'),
        mode: (stat.mode & 0o777).toString(8),
      };
      if (child.isDirectory()) {
        entries.push({ ...entry, type: 'directory' });
        await visit(absolute);
      } else if (child.isFile()) {
        entries.push({
          ...entry,
          type: 'file',
          size: stat.size,
          ...(stat.size <= 8 * 1024 * 1024
            ? { sha256: await sha256File(absolute) }
            : {}),
        });
      } else if (child.isSymbolicLink()) {
        entries.push({
          ...entry,
          type: 'symlink',
          target: await readlink(absolute),
        });
      }
    }
  }

  await visit(root);
  return entries;
}

function createCapture() {
  const chunks = [];
  let observedBytes = 0;
  let capturedBytes = 0;
  return {
    append(chunk) {
      observedBytes += chunk.length;
      if (capturedBytes >= maxCaptureBytes) return;
      const bounded = chunk.subarray(
        0,
        maxCaptureBytes - capturedBytes,
      );
      chunks.push(bounded);
      capturedBytes += bounded.length;
    },
    finish() {
      const value = Buffer.concat(chunks);
      return {
        utf8: value.toString('utf8'),
        base64: value.toString('base64'),
        sha256: sha256Bytes(value),
        observedBytes,
        capturedBytes,
        truncated: observedBytes > capturedBytes,
      };
    },
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

async function waitForProcessGroupExit(processGroupId, timeoutMs) {
  const deadline = performance.now() + timeoutMs;
  while (performance.now() < deadline) {
    if (!processGroupIsAlive(processGroupId)) return true;
    await new Promise((resolve) => setTimeout(resolve, 25));
  }
  return !processGroupIsAlive(processGroupId);
}

function signalProcessGroup(processGroupId, signal) {
  try {
    process.kill(-processGroupId, signal);
    return { signal, outcome: 'sent' };
  } catch (error) {
    return {
      signal,
      outcome: error.code === 'ESRCH' ? 'already-gone' : 'error',
      ...(error.code === 'ESRCH' ? {} : { error: errorRecord(error) }),
    };
  }
}

function sandboxArguments({
  profile,
  targetBinary,
  targetRoot,
  probeRoot,
  writeRoot,
  args,
}) {
  return [
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
}

function launchSandboxed(spec) {
  const startedAt = now();
  const stdout = createCapture();
  const stderr = createCapture();
  const lines = [];
  const waiters = [];
  let lineBuffer = '';
  let spawnError = null;

  const child = spawn(
    '/usr/bin/sandbox-exec',
    sandboxArguments(spec),
    {
      cwd: spec.cwd,
      env: spec.env,
      detached: true,
      shell: false,
      stdio: ['pipe', 'pipe', 'pipe'],
    },
  );
  const processGroupId = child.pid;

  function processLine(line) {
    lines.push(line);
    for (let index = waiters.length - 1; index >= 0; index -= 1) {
      const waiter = waiters[index];
      if (waiter.predicate(line)) {
        waiters.splice(index, 1);
        clearTimeout(waiter.timer);
        waiter.resolve(line);
      }
    }
  }

  child.stdout.on('data', (chunk) => {
    stdout.append(chunk);
    lineBuffer += chunk.toString('utf8');
    while (true) {
      const newline = lineBuffer.indexOf('\n');
      if (newline === -1) break;
      processLine(lineBuffer.slice(0, newline).replace(/\r$/u, ''));
      lineBuffer = lineBuffer.slice(newline + 1);
    }
  });
  child.stderr.on('data', (chunk) => stderr.append(chunk));

  const exitPromise = new Promise((resolve) => {
    child.once('error', (error) => {
      spawnError = errorRecord(error);
      resolve({ code: null, signal: null });
    });
    child.once('close', (code, signal) => {
      if (lineBuffer.length > 0) processLine(lineBuffer);
      for (const waiter of waiters.splice(0)) {
        clearTimeout(waiter.timer);
        waiter.reject(
          new Error(
            `Child closed before line match: code=${String(code)} signal=${String(signal)}`,
          ),
        );
      }
      resolve({ code, signal });
    });
  });

  function waitForLine(predicate, label, timeoutMs = processTimeoutMs) {
    const existing = lines.find(predicate);
    if (existing !== undefined) return Promise.resolve(existing);
    return new Promise((resolve, reject) => {
      const waiter = {
        predicate,
        resolve,
        reject,
        timer: setTimeout(() => {
          const index = waiters.indexOf(waiter);
          if (index >= 0) waiters.splice(index, 1);
          reject(new Error(`${label} timed out after ${timeoutMs}ms`));
        }, timeoutMs),
      };
      waiters.push(waiter);
    });
  }

  return {
    child,
    processGroupId,
    startedAt,
    lines,
    exitPromise,
    waitForLine,
    captures() {
      return { stdout: stdout.finish(), stderr: stderr.finish() };
    },
    spawnError() {
      return spawnError;
    },
  };
}

async function stopProcess(process, graceful = 'stdin-eof') {
  const signals = [];
  if (graceful === 'stdin-eof') {
    process.child.stdin.end();
  } else {
    signals.push(signalProcessGroup(process.processGroupId, 'SIGTERM'));
  }

  let timedOut = false;
  let exit;
  try {
    exit = await Promise.race([
      process.exitPromise,
      new Promise((_, reject) =>
        setTimeout(
          () => reject(new Error('child shutdown timeout')),
          shutdownTimeoutMs,
        ),
      ),
    ]);
  } catch {
    timedOut = true;
    signals.push(signalProcessGroup(process.processGroupId, 'SIGKILL'));
    exit = await process.exitPromise;
  }

  if (processGroupIsAlive(process.processGroupId)) {
    signals.push(signalProcessGroup(process.processGroupId, 'SIGKILL'));
  }
  const processGroupVerifiedGone = await waitForProcessGroupExit(
    process.processGroupId,
    shutdownTimeoutMs,
  );
  return {
    requestedAt: now(),
    graceful,
    timedOut,
    exit,
    signals,
    processGroupId: process.processGroupId,
    processGroupVerifiedGone,
  };
}

async function runOneShot(spec, stdin) {
  const process = launchSandboxed(spec);
  let stdinAccepted = true;
  if (stdin !== null) {
    await new Promise((resolve) => {
      process.child.stdin.write(stdin, (error) => {
        stdinAccepted = error === null || error === undefined;
        resolve();
      });
    });
  }
  process.child.stdin.end();

  let timedOut = false;
  let exit;
  try {
    exit = await Promise.race([
      process.exitPromise,
      new Promise((_, reject) =>
        setTimeout(
          () => reject(new Error('one-shot timeout')),
          processTimeoutMs,
        ),
      ),
    ]);
  } catch {
    timedOut = true;
    signalProcessGroup(process.processGroupId, 'SIGTERM');
    await new Promise((resolve) => setTimeout(resolve, 250));
    if (processGroupIsAlive(process.processGroupId)) {
      signalProcessGroup(process.processGroupId, 'SIGKILL');
    }
    exit = await process.exitPromise;
  }
  const processGroupVerifiedGone = await waitForProcessGroupExit(
    process.processGroupId,
    shutdownTimeoutMs,
  );
  return {
    startedAt: process.startedAt,
    finishedAt: now(),
    timedOut,
    exitCode: exit.code,
    signal: exit.signal,
    spawnError: process.spawnError(),
    stdin: {
      provided: stdin !== null,
      bytes: stdin === null ? 0 : Buffer.byteLength(stdin),
      acceptedByStream: stdinAccepted,
      eof: true,
    },
    cleanup: {
      processGroupId: process.processGroupId,
      processGroupVerifiedGone,
    },
    ...process.captures(),
  };
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

function assertEnvironment(env, product) {
  const forbidden =
    /(?:API_KEY|ACCESS_KEY|SECRET|PRIVATE_KEY|PASSWORD|CREDENTIAL|OAUTH|BEARER|PROXY|BASE_URL|ENDPOINT)/iu;
  const unexpected = Object.keys(env).filter((key) => forbidden.test(key));
  if (unexpected.length > 0) {
    throw new Error(
      `${product} environment contains forbidden keys: ${unexpected.join(', ')}`,
    );
  }
  if (
    Object.keys(env).some(
      (key) => /TOKEN/iu.test(key) && key !== 'QWEN_SERVER_TOKEN',
    )
  ) {
    throw new Error(`${product} environment contains a non-probe token`);
  }
}

async function prepareRun(root, scenarioId) {
  const runRoot = path.join(root, 'runs', scenarioId);
  const repoRoot = path.join(runRoot, 'repo');
  const stateRoot = path.join(runRoot, 'state');
  for (const directory of [
    repoRoot,
    path.join(repoRoot, '.git'),
    stateRoot,
    path.join(stateRoot, 'home', '.cache'),
    path.join(stateRoot, 'home', '.config'),
    path.join(stateRoot, 'home', '.local', 'share'),
    path.join(stateRoot, 'home', '.local', 'state'),
    path.join(stateRoot, 'tmp'),
    path.join(stateRoot, 'config'),
  ]) {
    await mkdir(directory, { recursive: true });
  }
  await writeFile(path.join(repoRoot, '.git', 'HEAD'), 'ref: refs/heads/main\n');
  await writeFile(path.join(repoRoot, 'README.md'), '# Phase 2D fixture\n');
  await chmod(path.join(repoRoot, '.git', 'HEAD'), 0o444);
  await chmod(path.join(repoRoot, 'README.md'), 0o444);
  return { runRoot, repoRoot, stateRoot, fixtures: [] };
}

async function writeFixture(prepared, file, content) {
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, content);
  await chmod(file, 0o444);
  const stat = await lstat(file);
  const record = {
    path: file,
    mode: (stat.mode & 0o777).toString(8),
    bytes: stat.size,
    sha256: await sha256File(file),
  };
  prepared.fixtures.push(record);
  return record;
}

async function verifyFixtures(prepared) {
  const after = [];
  for (const fixture of prepared.fixtures) {
    const stat = await lstat(fixture.path);
    const current = {
      path: fixture.path,
      mode: (stat.mode & 0o777).toString(8),
      bytes: stat.size,
      sha256: await sha256File(fixture.path),
    };
    if (
      current.mode !== fixture.mode ||
      current.bytes !== fixture.bytes ||
      current.sha256 !== fixture.sha256
    ) {
      throw new Error(`Fixture drift at ${fixture.path}`);
    }
    after.push(current);
  }
  return after;
}

function productSpec({
  profile,
  targetBinary,
  targetRoot,
  prepared,
  cwd,
  args,
  env,
}) {
  assertEnvironment(env, path.basename(targetBinary));
  return {
    profile,
    targetBinary,
    targetRoot,
    probeRoot: prepared.runRoot,
    writeRoot: prepared.stateRoot,
    cwd,
    args,
    env,
  };
}

function parseJsonLine(line, label) {
  try {
    return JSON.parse(line);
  } catch (error) {
    throw new Error(
      `${label} returned invalid JSON: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

async function runCodexLayerScenario({
  root,
  artifacts,
  profile,
  id,
  trustLevel,
  sessionOverride,
}) {
  const prepared = await prepareRun(root, id);
  const codexHome = path.join(
    prepared.stateRoot,
    'config',
    'codex-home',
  );
  const sqliteHome = path.join(prepared.stateRoot, 'sqlite');
  const nestedCwd = path.join(prepared.repoRoot, 'sub', 'deep');
  await mkdir(codexHome, { recursive: true });
  await mkdir(sqliteHome, { recursive: true });
  await mkdir(nestedCwd, { recursive: true });

  const escapedRepo = prepared.repoRoot.replaceAll('\\', '\\\\');
  await writeFixture(
    prepared,
    path.join(codexHome, 'config.toml'),
    [
      'model = "codex-user"',
      'model_reasoning_effort = "low"',
      '',
      `[projects."${escapedRepo}"]`,
      `trust_level = "${trustLevel}"`,
      '',
    ].join('\n'),
  );
  await writeFixture(
    prepared,
    path.join(prepared.repoRoot, '.codex', 'config.toml'),
    'model = "codex-project-root"\nmodel_reasoning_effort = "medium"\n',
  );
  await writeFixture(
    prepared,
    path.join(prepared.repoRoot, 'sub', '.codex', 'config.toml'),
    'model = "codex-project-nested"\n',
  );

  const env = {
    ...commonEnv(prepared.stateRoot),
    CODEX_HOME: codexHome,
    CODEX_SQLITE_HOME: sqliteHome,
  };
  const args = [
    ...(sessionOverride
      ? ['-c', 'model="codex-session"']
      : []),
    'app-server',
    '--listen',
    'stdio://',
  ];
  const process = launchSandboxed(
    productSpec({
      profile,
      targetBinary: artifacts.codex,
      targetRoot: artifacts.codexTreeRoot,
      prepared,
      cwd: nestedCwd,
      args,
      env,
    }),
  );

  const sent = [];
  function send(message) {
    sent.push(message);
    process.child.stdin.write(`${JSON.stringify(message)}\n`);
  }
  send({
    id: 'init-1',
    method: 'initialize',
    params: {
      clientInfo: {
        name: 'ccq-phase2d-config-probe',
        version: '1.0.0',
      },
      capabilities: { experimentalApi: true },
    },
  });
  const initializeLine = await process.waitForLine(
    (line) => {
      try {
        return JSON.parse(line).id === 'init-1';
      } catch {
        return false;
      }
    },
    `${id} initialize`,
  );
  send({ method: 'initialized', params: {} });
  send({
    id: 'cfg-1',
    method: 'config/read',
    params: { cwd: nestedCwd, includeLayers: true },
  });
  const configLine = await process.waitForLine(
    (line) => {
      try {
        return JSON.parse(line).id === 'cfg-1';
      } catch {
        return false;
      }
    },
    `${id} config/read`,
  );
  const shutdown = await stopProcess(process, 'stdin-eof');
  const configResponse = parseJsonLine(configLine, id);
  return {
    id,
    product: 'codex',
    risk: 'R1',
    command: {
      executable: artifacts.codex,
      args,
      cwd: nestedCwd,
      environmentKeys: Object.keys(env).sort(),
    },
    sent,
    initialize: parseJsonLine(initializeLine, id),
    configResponse,
    captures: process.captures(),
    shutdown,
    fixtures: prepared.fixtures,
    fixturesAfter: await verifyFixtures(prepared),
    stateInventory: await inventoryTree(prepared.stateRoot),
  };
}

function parseClaudeResponse(runtime, id) {
  const lines = runtime.stdout.utf8
    .split('\n')
    .filter((line) => line.length > 0);
  if (lines.length !== 1) {
    throw new Error(`${id} expected one JSONL line, got ${lines.length}`);
  }
  const record = parseJsonLine(lines[0], id);
  const response = record.response?.response;
  if (
    record.type !== 'control_response' ||
    record.response?.subtype !== 'success' ||
    record.response?.request_id !== 'cfg-1' ||
    typeof response !== 'object'
  ) {
    throw new Error(`${id} returned an unexpected control envelope`);
  }
  return response;
}

async function runClaudeLayerScenario({
  root,
  artifacts,
  profile,
  id,
  localHasModel,
}) {
  const prepared = await prepareRun(root, id);
  const claudeConfig = path.join(
    prepared.stateRoot,
    'config',
    'claude',
  );
  await mkdir(claudeConfig, { recursive: true });
  await mkdir(path.join(prepared.stateRoot, 'tmp', 'claude'), {
    recursive: true,
  });
  await writeFixture(
    prepared,
    path.join(claudeConfig, 'settings.json'),
    '{"model":"claude-user","cleanupPeriodDays":11}\n',
  );
  await writeFixture(
    prepared,
    path.join(prepared.repoRoot, '.claude', 'settings.json'),
    '{"model":"claude-project","cleanupPeriodDays":22}\n',
  );
  await writeFixture(
    prepared,
    path.join(prepared.repoRoot, '.claude', 'settings.local.json'),
    localHasModel ? '{"model":"claude-local"}\n' : '{}\n',
  );

  const env = {
    ...commonEnv(prepared.stateRoot),
    CLAUDE_CONFIG_DIR: claudeConfig,
    CLAUDE_CODE_TMPDIR: path.join(
      prepared.stateRoot,
      'tmp',
      'claude',
    ),
    CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC: '1',
    CLAUDE_CODE_DISABLE_OFFICIAL_MARKETPLACE_AUTOINSTALL: '1',
    DISABLE_AUTOUPDATER: '1',
    DISABLE_UPDATES: '1',
    DISABLE_TELEMETRY: '1',
  };
  const args = [
    '--bare',
    '--setting-sources',
    'user,project,local',
    '--print',
    '--input-format',
    'stream-json',
    '--output-format',
    'stream-json',
    '--verbose',
    '--tools',
    '',
    '--no-session-persistence',
  ];
  const runtime = await runOneShot(
    productSpec({
      profile,
      targetBinary: artifacts.claude,
      targetRoot: artifacts.claudeTreeRoot,
      prepared,
      cwd: prepared.repoRoot,
      args,
      env,
    }),
    claudeControlRequest,
  );
  return {
    id,
    product: 'claude',
    risk: 'R1',
    command: {
      executable: artifacts.claude,
      args,
      cwd: prepared.repoRoot,
      stdin: claudeControlRequest,
      environmentKeys: Object.keys(env).sort(),
    },
    runtime,
    settingsResponse: parseClaudeResponse(runtime, id),
    fixtures: prepared.fixtures,
    fixturesAfter: await verifyFixtures(prepared),
    stateInventory: await inventoryTree(prepared.stateRoot),
  };
}

async function httpGet(label, baseUrl, route) {
  try {
    const response = await fetch(`${baseUrl}${route}`, {
      headers: { Authorization: `Bearer ${qwenToken}` },
      signal: AbortSignal.timeout(3_000),
    });
    const text = await response.text();
    let body;
    try {
      body = JSON.parse(text);
    } catch {
      body = text;
    }
    return {
      label,
      route,
      status: response.status,
      contentType: response.headers.get('content-type'),
      body,
    };
  } catch (error) {
    return { label, route, transportError: errorRecord(error) };
  }
}

async function runQwenLayerScenario({
  root,
  artifacts,
  profile,
  id,
  trustLevel,
}) {
  const prepared = await prepareRun(root, id);
  const qwenHome = path.join(prepared.stateRoot, 'qwen-home');
  const runtimeRoot = path.join(prepared.stateRoot, 'qwen-runtime');
  const memoryRoot = path.join(prepared.stateRoot, 'qwen-memory');
  const policyRoot = path.join(prepared.stateRoot, 'qwen-policy');
  for (const directory of [
    qwenHome,
    runtimeRoot,
    memoryRoot,
    policyRoot,
  ]) {
    await mkdir(directory, { recursive: true });
  }
  const systemPath = path.join(policyRoot, 'system.json');
  const defaultsPath = path.join(policyRoot, 'system-defaults.json');
  const trustedPath = path.join(policyRoot, 'trusted-folders.json');
  const approvalsPath = path.join(policyRoot, 'mcp-approvals.json');
  await writeFixture(
    prepared,
    systemPath,
    '{"$version":4,"security":{"folderTrust":{"enabled":true}},"general":{"cleanupPeriodDays":40}}\n',
  );
  await writeFixture(
    prepared,
    defaultsPath,
    '{"$version":4,"general":{"cleanupPeriodDays":10,"sessionRecapAwayThresholdMinutes":10,"showSessionRecap":false}}\n',
  );
  await writeFixture(
    prepared,
    path.join(qwenHome, 'settings.json'),
    '{"$version":4,"general":{"cleanupPeriodDays":20,"sessionRecapAwayThresholdMinutes":20,"showSessionRecap":true}}\n',
  );
  await writeFixture(
    prepared,
    path.join(prepared.repoRoot, '.qwen', 'settings.json'),
    '{"$version":4,"general":{"cleanupPeriodDays":30,"sessionRecapAwayThresholdMinutes":30}}\n',
  );
  await writeFixture(
    prepared,
    trustedPath,
    `${JSON.stringify({ [prepared.repoRoot]: trustLevel })}\n`,
  );
  await writeFixture(prepared, approvalsPath, '{}\n');

  const env = {
    ...commonEnv(prepared.stateRoot),
    QWEN_HOME: qwenHome,
    QWEN_RUNTIME_DIR: runtimeRoot,
    QWEN_CODE_MEMORY_BASE_DIR: memoryRoot,
    QWEN_CODE_SYSTEM_SETTINGS_PATH: systemPath,
    QWEN_CODE_SYSTEM_DEFAULTS_PATH: defaultsPath,
    QWEN_CODE_TRUSTED_FOLDERS_PATH: trustedPath,
    QWEN_CODE_MCP_APPROVALS_PATH: approvalsPath,
    QWEN_SERVE_NO_PERSISTENT_REGISTRATION: '1',
    QWEN_CODE_DISABLE_PRECONNECT: '1',
    QWEN_CODE_NO_BROWSER: '1',
    QWEN_CODE_SKIP_UPDATE_CHECK_ONCE: 'true',
    QWEN_TELEMETRY_ENABLED: 'false',
    QWEN_USAGE_STATISTICS_ENABLED: 'false',
    NODE_DISABLE_COMPILE_CACHE: '1',
    NO_BROWSER: '1',
    QWEN_SERVER_TOKEN: qwenToken,
    VITEST_WORKER_ID: 'ccq-phase2d-no-preheat',
  };
  const args = [
    artifacts.qwenEntry,
    'serve',
    '--hostname',
    '127.0.0.1',
    '--port',
    '0',
    '--workspace',
    prepared.repoRoot,
    '--require-auth',
    '--no-web',
    '--max-sessions',
    '1',
    '--max-connections',
    '8',
  ];
  const process = launchSandboxed(
    productSpec({
      profile,
      targetBinary: artifacts.node,
      targetRoot: artifacts.qwenTreeRoot,
      prepared,
      cwd: prepared.repoRoot,
      args,
      env,
    }),
  );
  const listeningLine = await process.waitForLine(
    (line) => /qwen serve listening on http:\/\/127\.0\.0\.1:\d+/u.test(line),
    `${id} listener`,
  );
  const match = listeningLine.match(
    /qwen serve listening on (http:\/\/127\.0\.0\.1:\d+)/u,
  );
  if (!match) throw new Error(`${id} missing listener URL`);
  const baseUrl = match[1];

  const requests = [];
  let deepHealth;
  for (let attempt = 0; attempt < 40; attempt += 1) {
    deepHealth = await httpGet(
      `deep-health-${attempt + 1}`,
      baseUrl,
      '/health?deep=1',
    );
    requests.push(deepHealth);
    if (deepHealth.status === 200 || deepHealth.transportError) break;
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  const settings = await httpGet(
    'workspace-settings',
    baseUrl,
    '/workspace/settings',
  );
  const trust = await httpGet(
    'workspace-trust',
    baseUrl,
    '/workspace/trust',
  );
  const capabilities = await httpGet(
    'capabilities',
    baseUrl,
    '/capabilities',
  );
  requests.push(settings, trust, capabilities);
  const shutdown = await stopProcess(process, 'sigterm');
  const postShutdown = await httpGet(
    'post-shutdown-health',
    baseUrl,
    '/health',
  );

  return {
    id,
    product: 'qwen',
    risk: 'R1',
    command: {
      executable: artifacts.node,
      args,
      cwd: prepared.repoRoot,
      environmentKeys: Object.keys(env).sort(),
      syntheticBearerSha256: sha256Bytes(qwenToken),
    },
    listeningLine,
    requests,
    selected: { deepHealth, settings, trust, capabilities },
    postShutdown,
    captures: process.captures(),
    shutdown,
    fixtures: prepared.fixtures,
    fixturesAfter: await verifyFixtures(prepared),
    stateInventory: await inventoryTree(prepared.stateRoot),
  };
}

async function runQwenSchemaIdentity({
  root,
  artifacts,
  profile,
}) {
  const id = 'P2D-R1-1B-QWEN-SCHEMA-IDENTITY';
  const prepared = await prepareRun(root, id);
  const env = {
    ...commonEnv(prepared.stateRoot),
    NODE_DISABLE_COMPILE_CACHE: '1',
  };
  const moduleUrl = pathToFileURL(artifacts.qwenSettingsChunk).href;
  const code = [
    `import { SETTINGS_VERSION, SETTINGS_VERSION_KEY } from ${JSON.stringify(moduleUrl)};`,
    'process.stdout.write(JSON.stringify({SETTINGS_VERSION,SETTINGS_VERSION_KEY}) + "\\n");',
  ].join('\n');
  const args = ['--input-type=module', '--eval', code];
  const runtime = await runOneShot(
    productSpec({
      profile,
      targetBinary: artifacts.node,
      targetRoot: artifacts.qwenTreeRoot,
      prepared,
      cwd: prepared.repoRoot,
      args,
      env,
    }),
    null,
  );
  return {
    id,
    product: 'qwen',
    risk: 'R1',
    command: {
      executable: artifacts.node,
      args,
      cwd: prepared.repoRoot,
      environmentKeys: Object.keys(env).sort(),
    },
    runtime,
    observed: parseJsonLine(runtime.stdout.utf8.trim(), id),
    stateInventory: await inventoryTree(prepared.stateRoot),
  };
}

function qwenSetting(response, key) {
  return response.body?.settings?.find((item) => item.key === key);
}

function evaluateGate(results) {
  const failures = [];
  const check = (condition, label) => {
    if (!condition) failures.push(label);
  };

  const qwenIdentity = results.find(
    (result) => result.id === 'P2D-R1-1B-QWEN-SCHEMA-IDENTITY',
  );
  check(qwenIdentity?.runtime.exitCode === 0, 'qwen identity exit');
  check(
    qwenIdentity?.observed?.SETTINGS_VERSION === 4,
    'qwen SETTINGS_VERSION=4',
  );
  check(
    qwenIdentity?.observed?.SETTINGS_VERSION_KEY === '$version',
    'qwen SETTINGS_VERSION_KEY=$version',
  );

  for (const result of results) {
    const runtime = result.runtime;
    if (runtime) {
      check(!runtime.timedOut, `${result.id} no timeout`);
      check(runtime.signal === null, `${result.id} no signal`);
      check(runtime.spawnError === null, `${result.id} no spawn error`);
      check(
        !runtime.stdout.truncated && !runtime.stderr.truncated,
        `${result.id} capture complete`,
      );
      check(
        runtime.cleanup.processGroupVerifiedGone,
        `${result.id} process group gone`,
      );
    }
    if (result.shutdown) {
      check(
        result.shutdown.processGroupVerifiedGone,
        `${result.id} process group gone`,
      );
    }
  }

  const codexExpected = {
    'P2D-R1-2-CODEX-TRUSTED': {
      model: 'codex-project-nested',
      effort: 'medium',
      modelOrigin: 'project',
      effortOrigin: 'project',
    },
    'P2D-R1-2-CODEX-UNTRUSTED': {
      model: 'codex-user',
      effort: 'low',
      modelOrigin: 'user',
      effortOrigin: 'user',
    },
    'P2D-R1-2-CODEX-SESSION': {
      model: 'codex-session',
      effort: 'medium',
      modelOrigin: 'sessionFlags',
      effortOrigin: 'project',
    },
  };
  for (const [id, expected] of Object.entries(codexExpected)) {
    const result = results.find((item) => item.id === id);
    const payload = result?.configResponse?.result;
    check(payload?.config?.model === expected.model, `${id} model`);
    check(
      payload?.config?.model_reasoning_effort === expected.effort,
      `${id} effort`,
    );
    check(
      payload?.origins?.model?.name?.type === expected.modelOrigin,
      `${id} model origin`,
    );
    check(
      payload?.origins?.model_reasoning_effort?.name?.type ===
        expected.effortOrigin,
      `${id} effort origin`,
    );
    check(Array.isArray(payload?.layers), `${id} layers returned`);
  }

  const claudeAll = results.find(
    (item) => item.id === 'P2D-R1-2-CLAUDE-ALL-LAYERS',
  );
  const claudeProject = results.find(
    (item) => item.id === 'P2D-R1-2-CLAUDE-PROJECT-USER',
  );
  check(claudeAll?.runtime.exitCode === 0, 'claude all layers exit');
  check(
    claudeAll?.settingsResponse?.effective?.model === 'claude-local',
    'claude local > project > user',
  );
  check(
    claudeAll?.settingsResponse?.effective?.cleanupPeriodDays === 22,
    'claude project cleanup > user',
  );
  check(
    claudeProject?.settingsResponse?.effective?.model ===
      'claude-project',
    'claude project > user',
  );
  for (const result of [claudeAll, claudeProject]) {
    const sourceNames = new Set(
      result?.settingsResponse?.sources?.map((source) => source.source),
    );
    check(sourceNames.has('userSettings'), `${result?.id} user source`);
    check(
      sourceNames.has('projectSettings'),
      `${result?.id} project source`,
    );
    check(
      result?.id === 'P2D-R1-2-CLAUDE-ALL-LAYERS'
        ? sourceNames.has('localSettings')
        : !sourceNames.has('localSettings'),
      `${result?.id} non-empty source projection`,
    );
  }

  const qwenExpected = {
    'P2D-R1-2-QWEN-TRUSTED': {
      state: 'trusted',
      trusted: true,
      threshold: 30,
    },
    'P2D-R1-2-QWEN-UNTRUSTED': {
      state: 'untrusted',
      trusted: false,
      threshold: 20,
    },
  };
  for (const [id, expected] of Object.entries(qwenExpected)) {
    const result = results.find((item) => item.id === id);
    const { settings, trust, capabilities, deepHealth } =
      result?.selected ?? {};
    check(deepHealth?.status === 200, `${id} deep health`);
    check(settings?.status === 200, `${id} settings route`);
    check(trust?.status === 200, `${id} trust route`);
    check(capabilities?.status === 200, `${id} capabilities route`);
    check(
      qwenSetting(settings, 'general.cleanupPeriodDays')?.values
        ?.effective === 40,
      `${id} system > lower layers`,
    );
    check(
      qwenSetting(
        settings,
        'general.sessionRecapAwayThresholdMinutes',
      )?.values?.effective === expected.threshold,
      `${id} workspace trust merge`,
    );
    check(
      qwenSetting(settings, 'general.showSessionRecap')?.values
        ?.effective === true,
      `${id} user > defaults`,
    );
    check(
      qwenSetting(
        settings,
        'general.sessionRecapAwayThresholdMinutes',
      )?.values?.workspace === 30,
      `${id} raw workspace preserved`,
    );
    check(
      trust?.body?.effective?.state === expected.state,
      `${id} trust state`,
    );
    check(
      trust?.body?.effective?.source === 'file',
      `${id} trust source`,
    );
    check(
      capabilities?.body?.workspaces?.find(
        (workspace) => workspace.primary,
      )?.trusted === expected.trusted,
      `${id} capability trusted`,
    );
    check(
      Boolean(result?.postShutdown?.transportError),
      `${id} listener closed`,
    );
  }

  return {
    passed: failures.length === 0,
    failures,
    runtimeExecutions: results.length,
    providerOrModelCalls: 0,
    credentialReads: 0,
    modelCost: 0,
  };
}

async function verifyInputs(artifacts) {
  const actual = {
    codexBinary: await sha256File(artifacts.codex),
    codexTree: await sha256Tree(artifacts.codexTreeRoot),
    claudeBinary: await sha256File(artifacts.claude),
    claudeTree: await sha256Tree(artifacts.claudeTreeRoot),
    qwenEntry: await sha256File(artifacts.qwenEntry),
    qwenTree: await sha256Tree(artifacts.qwenTreeRoot),
    qwenSettingsChunk: await sha256File(artifacts.qwenSettingsChunk),
    qwenServerChunk: await sha256File(artifacts.qwenServerChunk),
    node: await sha256File(artifacts.node),
    cliProfile: await sha256File(artifacts.cliProfile),
    qwenProfile: await sha256File(artifacts.qwenProfile),
    codexProtocolAggregate: await sha256File(
      artifacts.codexProtocolAggregate,
    ),
    codexConfigReadParams: await sha256File(
      artifacts.codexConfigReadParams,
    ),
    codexConfigReadResponse: await sha256File(
      artifacts.codexConfigReadResponse,
    ),
    codexClientRequest: await sha256File(artifacts.codexClientRequest),
    codexInitializeParams: await sha256File(
      artifacts.codexInitializeParams,
    ),
  };
  for (const [name, expected] of Object.entries(expectedHashes)) {
    if (actual[name] !== expected) {
      throw new Error(
        `${name} hash drift: expected ${expected}, got ${String(actual[name])}`,
      );
    }
  }
  return actual;
}

async function main() {
  const input = parseArgs(process.argv.slice(2));
  const output = path.resolve(requireAbsolute(input.output, '--output'));
  if (output !== fixedOutput) {
    throw new Error(`--output must be ${fixedOutput}`);
  }
  await mkdir(path.dirname(output), { recursive: true });
  const outputParent = await realpath(path.dirname(output));
  if (outputParent !== path.dirname(output)) {
    throw new Error(`Unsafe output parent ${outputParent}`);
  }

  const artifacts = {
    codex: requireAbsolute(input['codex-binary'], '--codex-binary'),
    claude: requireAbsolute(input['claude-binary'], '--claude-binary'),
    qwenEntry: requireAbsolute(input['qwen-entry'], '--qwen-entry'),
    node: requireAbsolute(input.node, '--node'),
    cliProfile: requireAbsolute(input['cli-profile'], '--cli-profile'),
    qwenProfile: requireAbsolute(
      input['qwen-profile'],
      '--qwen-profile',
    ),
    codexProtocolAggregate: requireAbsolute(
      input['codex-protocol-aggregate'],
      '--codex-protocol-aggregate',
    ),
    codexConfigReadParams: requireAbsolute(
      input['codex-config-read-params'],
      '--codex-config-read-params',
    ),
    codexConfigReadResponse: requireAbsolute(
      input['codex-config-read-response'],
      '--codex-config-read-response',
    ),
    codexClientRequest: requireAbsolute(
      input['codex-client-request'],
      '--codex-client-request',
    ),
    codexInitializeParams: requireAbsolute(
      input['codex-initialize-params'],
      '--codex-initialize-params',
    ),
  };
  artifacts.codexTreeRoot = path.dirname(path.dirname(artifacts.codex));
  artifacts.claudeTreeRoot = path.dirname(artifacts.claude);
  artifacts.qwenTreeRoot = path.dirname(artifacts.qwenEntry);
  artifacts.qwenSettingsChunk = path.join(
    artifacts.qwenTreeRoot,
    'chunks',
    'chunk-TEHGS6UP.js',
  );
  artifacts.qwenServerChunk = path.join(
    artifacts.qwenTreeRoot,
    'chunks',
    'server-4UMH7OIZ.js',
  );

  const startedAt = now();
  const inputHashes = await verifyInputs(artifacts);
  const runRoot = await mkdtemp('/private/tmp/ccq-phase2d-r1-');
  const results = [];

  results.push(
    await runQwenSchemaIdentity({
      root: runRoot,
      artifacts,
      profile: artifacts.cliProfile,
    }),
  );
  results.push(
    await runCodexLayerScenario({
      root: runRoot,
      artifacts,
      profile: artifacts.cliProfile,
      id: 'P2D-R1-2-CODEX-TRUSTED',
      trustLevel: 'trusted',
      sessionOverride: false,
    }),
  );
  results.push(
    await runCodexLayerScenario({
      root: runRoot,
      artifacts,
      profile: artifacts.cliProfile,
      id: 'P2D-R1-2-CODEX-UNTRUSTED',
      trustLevel: 'untrusted',
      sessionOverride: false,
    }),
  );
  results.push(
    await runCodexLayerScenario({
      root: runRoot,
      artifacts,
      profile: artifacts.cliProfile,
      id: 'P2D-R1-2-CODEX-SESSION',
      trustLevel: 'trusted',
      sessionOverride: true,
    }),
  );
  results.push(
    await runClaudeLayerScenario({
      root: runRoot,
      artifacts,
      profile: artifacts.cliProfile,
      id: 'P2D-R1-2-CLAUDE-ALL-LAYERS',
      localHasModel: true,
    }),
  );
  results.push(
    await runClaudeLayerScenario({
      root: runRoot,
      artifacts,
      profile: artifacts.cliProfile,
      id: 'P2D-R1-2-CLAUDE-PROJECT-USER',
      localHasModel: false,
    }),
  );
  results.push(
    await runQwenLayerScenario({
      root: runRoot,
      artifacts,
      profile: artifacts.qwenProfile,
      id: 'P2D-R1-2-QWEN-TRUSTED',
      trustLevel: 'TRUST_FOLDER',
    }),
  );
  results.push(
    await runQwenLayerScenario({
      root: runRoot,
      artifacts,
      profile: artifacts.qwenProfile,
      id: 'P2D-R1-2-QWEN-UNTRUSTED',
      trustLevel: 'DO_NOT_TRUST',
    }),
  );

  const artifact = {
    schemaVersion: 1,
    phase: 'Phase 2D',
    startedAt,
    finishedAt: now(),
    runRoot,
    cohort: {
      codex: '0.145.0/latest/CLI+sdk-daemon/Darwin-arm64/non-TTY',
      claude: '2.1.212/stable/CLI/Darwin-arm64/non-TTY',
      qwen: '0.21.0/effective-latest/CLI+sdk-daemon/Darwin-arm64/non-TTY/Node',
    },
    containment: {
      credentialEnvironmentInherited: false,
      providerEnvironmentInherited: false,
      userConfigurationInherited: false,
      codexClaudeRemoteNetworkAllowed: false,
      qwenRemoteNetworkAllowed: false,
      qwenLoopbackAllowed: true,
      syntheticBearer: true,
      modelTurnCreated: false,
      allowedPersistentWriteScope: 'per-scenario state directory',
      processCleanup:
        'original detached process group; new-session descendants are outside the proof',
    },
    inputHashes,
    schemaIdentity,
    results,
    gate: evaluateGate(results),
  };
  await writeFile(output, `${JSON.stringify(artifact, null, 2)}\n`);
  process.stdout.write(
    `${JSON.stringify({
      phase: artifact.phase,
      status: artifact.gate.passed ? 'PASS' : 'FAIL',
      runRoot,
      executions: results.length,
      failures: artifact.gate.failures,
    })}\n`,
  );
  if (!artifact.gate.passed) process.exitCode = 1;
}

await main();
