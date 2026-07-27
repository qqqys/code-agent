#!/usr/bin/env node

import { spawn } from 'node:child_process';
import { createHash } from 'node:crypto';
import {
  lstat,
  mkdir,
  readdir,
  readFile,
  realpath,
  writeFile,
} from 'node:fs/promises';
import path from 'node:path';

const MAX_CAPTURE_BYTES = 4 * 1024 * 1024;
const MAX_HASH_BYTES = 8 * 1024 * 1024;
const REQUEST_TIMEOUT_MS = 8_000;
const STARTUP_TIMEOUT_MS = 20_000;
const SHUTDOWN_TIMEOUT_MS = 8_000;
const TEST_TOKEN = 'ccq-phase1d-fixed-test-token';

function parseArgs(argv) {
  const parsed = {};
  for (let index = 0; index < argv.length; index += 2) {
    const key = argv[index];
    const value = argv[index + 1];
    if (!key?.startsWith('--') || value === undefined) {
      throw new Error(`Invalid argument sequence at ${String(key)}`);
    }
    parsed[key.slice(2)] = value;
  }
  return parsed;
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

function delay(milliseconds) {
  return new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });
}

function withTimeout(promise, milliseconds, label) {
  let timer;
  return Promise.race([
    promise,
    new Promise((_, reject) => {
      timer = setTimeout(() => {
        reject(new Error(`${label} timed out after ${milliseconds}ms`));
      }, milliseconds);
    }),
  ]).finally(() => {
    clearTimeout(timer);
  });
}

function appendBounded(current, chunk) {
  if (Buffer.byteLength(current) >= MAX_CAPTURE_BYTES) {
    return current;
  }
  const remaining = MAX_CAPTURE_BYTES - Buffer.byteLength(current);
  return current + chunk.toString('utf8', 0, remaining);
}

function serializeError(error) {
  if (!(error instanceof Error)) {
    return { message: String(error) };
  }
  return {
    name: error.name,
    message: error.message,
    ...(error.code ? { code: String(error.code) } : {}),
    ...(error.stack ? { stack: error.stack } : {}),
    ...(error.cause ? { cause: serializeError(error.cause) } : {}),
    ...(error.details ? { details: error.details } : {}),
  };
}

class ProbeError extends Error {
  constructor(message, cause, details) {
    super(message, { cause });
    this.name = 'ProbeError';
    this.details = details;
  }
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

function sha256Text(value) {
  return createHash('sha256').update(value).digest('hex');
}

async function sha256File(file) {
  const data = await readFile(file);
  return createHash('sha256').update(data).digest('hex');
}

async function inventoryTree(root, excludedNames = new Set()) {
  const entries = [];

  async function visit(directory) {
    const children = await readdir(directory, { withFileTypes: true });
    children.sort((left, right) => left.name.localeCompare(right.name));
    for (const child of children) {
      const absolute = path.join(directory, child.name);
      const relative = path.relative(root, absolute);
      if (excludedNames.has(relative)) {
        continue;
      }
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
        });
      } else {
        entries.push({
          path: relative,
          type: 'file',
          size: stat.size,
          mode: (stat.mode & 0o777).toString(8),
          ...(stat.size <= MAX_HASH_BYTES
            ? { sha256: await sha256File(absolute) }
            : {}),
        });
      }
    }
  }

  await visit(root);
  return entries;
}

function minimalEnv(tempDirectory, extra = {}) {
  return {
    PATH: '/opt/homebrew/bin:/usr/bin:/bin',
    LANG: 'C',
    LC_ALL: 'C',
    TERM: 'dumb',
    NO_COLOR: '1',
    TMPDIR: `${tempDirectory}${path.sep}`,
    TMP: tempDirectory,
    TEMP: tempDirectory,
    ...extra,
  };
}

function pidIsGone(pid) {
  try {
    process.kill(pid, 0);
    return false;
  } catch (error) {
    return error?.code === 'ESRCH';
  }
}

async function stopChild(child, exitPromise, protocolClose) {
  const shutdown = {
    requestedAt: now(),
    method: protocolClose,
    forcedSignal: null,
  };
  if (protocolClose === 'stdin_eof') {
    child.stdin.end();
  } else {
    child.kill('SIGTERM');
  }

  try {
    shutdown.exit = await withTimeout(
      exitPromise,
      SHUTDOWN_TIMEOUT_MS,
      'graceful child shutdown',
    );
  } catch {
    shutdown.forcedSignal = 'SIGTERM';
    child.kill('SIGTERM');
    try {
      shutdown.exit = await withTimeout(
        exitPromise,
        2_000,
        'SIGTERM child shutdown',
      );
    } catch {
      shutdown.forcedSignal = 'SIGKILL';
      child.kill('SIGKILL');
      shutdown.exit = await withTimeout(
        exitPromise,
        2_000,
        'SIGKILL child shutdown',
      );
    }
  }
  shutdown.pidGone = pidIsGone(child.pid);
  shutdown.finishedAt = now();
  return shutdown;
}

function createJsonlClient(command, commandArgs, options) {
  const child = spawn(command, commandArgs, {
    cwd: options.cwd,
    env: options.env,
    shell: false,
    stdio: ['pipe', 'pipe', 'pipe'],
  });

  let stdoutRaw = '';
  let stderrRaw = '';
  let lineBuffer = '';
  const messages = [];
  const parseErrors = [];
  const sent = [];
  const pending = new Map();

  const exitPromise = new Promise((resolve) => {
    child.once('exit', (code, signal) => {
      const exit = { code, signal, at: now() };
      for (const waiter of pending.values()) {
        waiter.reject(
          new Error(
            `Child exited before response: code=${String(code)} signal=${String(signal)}`,
          ),
        );
      }
      pending.clear();
      resolve(exit);
    });
  });

  child.once('error', (error) => {
    for (const waiter of pending.values()) {
      waiter.reject(error);
    }
    pending.clear();
  });

  function responseKey(id) {
    return `${typeof id}:${String(id)}`;
  }

  function processLine(line) {
    if (line.trim() === '') {
      return;
    }
    try {
      const parsed = JSON.parse(line);
      const item = { at: now(), raw: line, value: parsed };
      messages.push(item);
      if (
        parsed !== null &&
        typeof parsed === 'object' &&
        Object.hasOwn(parsed, 'id')
      ) {
        const key = responseKey(parsed.id);
        const waiter = pending.get(key);
        if (waiter) {
          pending.delete(key);
          waiter.resolve(item);
        }
      }
    } catch (error) {
      parseErrors.push({ at: now(), raw: line, error: serializeError(error) });
    }
  }

  child.stdout.on('data', (chunk) => {
    const text = chunk.toString('utf8');
    stdoutRaw = appendBounded(stdoutRaw, text);
    lineBuffer += text;
    while (true) {
      const newline = lineBuffer.indexOf('\n');
      if (newline === -1) {
        break;
      }
      const line = lineBuffer.slice(0, newline).replace(/\r$/u, '');
      lineBuffer = lineBuffer.slice(newline + 1);
      processLine(line);
    }
  });

  child.stdout.once('end', () => {
    if (lineBuffer !== '') {
      processLine(lineBuffer);
      lineBuffer = '';
    }
  });

  child.stderr.on('data', (chunk) => {
    stderrRaw = appendBounded(stderrRaw, chunk);
  });

  function send(message) {
    const raw = JSON.stringify(message);
    sent.push({ at: now(), raw, value: message });
    child.stdin.write(`${raw}\n`);
  }

  function request(message, timeoutMs = REQUEST_TIMEOUT_MS) {
    if (!Object.hasOwn(message, 'id')) {
      throw new Error('JSONL request must include an id');
    }
    const key = responseKey(message.id);
    if (pending.has(key)) {
      throw new Error(`Duplicate pending request id ${key}`);
    }
    const response = new Promise((resolve, reject) => {
      pending.set(key, { resolve, reject });
    });
    send(message);
    return withTimeout(response, timeoutMs, `request ${key}`).finally(() => {
      pending.delete(key);
    });
  }

  return {
    child,
    exitPromise,
    messages,
    parseErrors,
    sent,
    request,
    notify: send,
    captures() {
      return { stdoutRaw, stderrRaw };
    },
  };
}

function createTextChild(command, commandArgs, options) {
  const child = spawn(command, commandArgs, {
    cwd: options.cwd,
    env: options.env,
    shell: false,
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  let stdoutRaw = '';
  let stderrRaw = '';
  let lineBuffer = '';
  const lines = [];
  const lineWaiters = [];

  const exitPromise = new Promise((resolve) => {
    child.once('exit', (code, signal) => {
      const exit = { code, signal, at: now() };
      for (const waiter of lineWaiters) {
        waiter.reject(
          new Error(
            `Child exited before matching line: code=${String(code)} signal=${String(signal)}`,
          ),
        );
      }
      lineWaiters.length = 0;
      resolve(exit);
    });
  });

  function processLine(line) {
    const item = { at: now(), line };
    lines.push(item);
    for (let index = lineWaiters.length - 1; index >= 0; index -= 1) {
      const waiter = lineWaiters[index];
      const match = waiter.pattern.exec(line);
      if (match) {
        lineWaiters.splice(index, 1);
        waiter.resolve({ ...item, match });
      }
    }
  }

  child.stdout.on('data', (chunk) => {
    const text = chunk.toString('utf8');
    stdoutRaw = appendBounded(stdoutRaw, text);
    lineBuffer += text;
    while (true) {
      const newline = lineBuffer.indexOf('\n');
      if (newline === -1) {
        break;
      }
      const line = lineBuffer.slice(0, newline).replace(/\r$/u, '');
      lineBuffer = lineBuffer.slice(newline + 1);
      processLine(line);
    }
  });
  child.stderr.on('data', (chunk) => {
    stderrRaw = appendBounded(stderrRaw, chunk);
  });

  function waitForLine(pattern, timeoutMs = STARTUP_TIMEOUT_MS) {
    const existing = lines.find(({ line }) => pattern.test(line));
    pattern.lastIndex = 0;
    if (existing) {
      return Promise.resolve({
        ...existing,
        match: pattern.exec(existing.line),
      });
    }
    pattern.lastIndex = 0;
    const pending = new Promise((resolve, reject) => {
      lineWaiters.push({ pattern, resolve, reject });
    });
    return withTimeout(pending, timeoutMs, `stdout line ${String(pattern)}`);
  }

  return {
    child,
    exitPromise,
    lines,
    waitForLine,
    captures() {
      return { stdoutRaw, stderrRaw };
    },
  };
}

async function runCodexAppProbe(input) {
  const probeDir = path.join(input.root, 'codex-app');
  const tempDir = path.join(probeDir, 'tmp');
  const fixtureDir = path.join(probeDir, 'fixture');
  await mkdir(tempDir, { recursive: true });
  await mkdir(fixtureDir, { recursive: true });

  const client = createJsonlClient(
    input.codexBinary,
    ['app-server', '--listen', 'stdio://'],
    {
      cwd: fixtureDir,
      env: minimalEnv(tempDir),
    },
  );

  const protocol = {};
  try {
    protocol.preInitialize = await client.request({
      id: 'preinit-1',
      method: 'ccq/doesNotExist',
      params: {},
    });
    protocol.initialize = await client.request({
      id: 'init-1',
      method: 'initialize',
      params: {
        clientInfo: {
          name: 'ccq_phase1d_probe',
          title: 'CCQ Phase 1D Probe',
          version: '1.0.0',
        },
      },
    });
    client.notify({ method: 'initialized' });
    protocol.repeatInitialize = await client.request({
      id: 'init-2',
      method: 'initialize',
      params: {
        clientInfo: {
          name: 'ccq_phase1d_probe',
          version: '1.0.0',
        },
      },
    });
    protocol.unknownMethod = await client.request({
      id: 'postinit-1',
      method: 'ccq/doesNotExist',
      params: {},
    });
  } catch (error) {
    const shutdown = await stopChild(
      client.child,
      client.exitPromise,
      'stdin_eof',
    );
    throw new ProbeError('Codex app-server protocol probe failed', error, {
      sent: client.sent,
      received: client.messages,
      parseErrors: client.parseErrors,
      captures: client.captures(),
      shutdown,
    });
  }

  const shutdown = await stopChild(
    client.child,
    client.exitPromise,
    'stdin_eof',
  );
  const captures = client.captures();

  return {
    probeId: 'P1C2-CDX-APP-INIT-001',
    status: 'Reproduced',
    command: [
      input.codexBinary,
      'app-server',
      '--listen',
      'stdio://',
    ],
    childPid: client.child.pid,
    envKeys: Object.keys(minimalEnv(tempDir)).sort(),
    framing: 'LF-delimited JSON without jsonrpc field',
    protocol,
    sent: client.sent,
    received: client.messages,
    parseErrors: client.parseErrors,
    stdoutSha256: sha256Text(captures.stdoutRaw),
    stderr: captures.stderrRaw,
    shutdown,
  };
}

async function runCodexMcpProbe(input) {
  const probeDir = path.join(input.root, 'codex-mcp');
  const tempDir = path.join(probeDir, 'tmp');
  const fixtureDir = path.join(probeDir, 'fixture');
  await mkdir(tempDir, { recursive: true });
  await mkdir(fixtureDir, { recursive: true });

  const client = createJsonlClient(input.codexBinary, ['mcp-server'], {
    cwd: fixtureDir,
    env: minimalEnv(tempDir),
  });

  const protocol = {};
  try {
    protocol.initialize = await client.request({
      jsonrpc: '2.0',
      id: 1,
      method: 'initialize',
      params: {
        protocolVersion: '2025-11-25',
        capabilities: {},
        clientInfo: {
          name: 'ccq-phase1d-probe',
          version: '1.0.0',
        },
      },
    });
    client.notify({
      jsonrpc: '2.0',
      method: 'notifications/initialized',
    });
    protocol.toolsList = await client.request({
      jsonrpc: '2.0',
      id: 2,
      method: 'tools/list',
      params: {},
    });
    protocol.unknownTool = await client.request({
      jsonrpc: '2.0',
      id: 3,
      method: 'tools/call',
      params: {
        name: '__ccq_probe_nonexistent__',
        arguments: {},
      },
    });
  } catch (error) {
    const shutdown = await stopChild(
      client.child,
      client.exitPromise,
      'stdin_eof',
    );
    throw new ProbeError('Codex MCP protocol probe failed', error, {
      sent: client.sent,
      received: client.messages,
      parseErrors: client.parseErrors,
      captures: client.captures(),
      shutdown,
    });
  }

  const tools = protocol.toolsList.value?.result?.tools ?? [];
  const toolSchemaHashes = Object.fromEntries(
    tools.map((tool) => [tool.name, sha256Text(canonicalJson(tool))]),
  );
  const shutdown = await stopChild(
    client.child,
    client.exitPromise,
    'stdin_eof',
  );
  const captures = client.captures();

  return {
    probeId: 'P1C2-CDX-MCP-LIST-001',
    status: 'Reproduced',
    command: [input.codexBinary, 'mcp-server'],
    childPid: client.child.pid,
    envKeys: Object.keys(minimalEnv(tempDir)).sort(),
    framing: 'JSON-RPC 2.0, LF-delimited JSON',
    protocol,
    toolNames: tools.map((tool) => tool.name),
    toolSchemaHashes,
    toolsCanonicalSha256: sha256Text(canonicalJson(tools)),
    sent: client.sent,
    received: client.messages,
    parseErrors: client.parseErrors,
    stdoutSha256: sha256Text(captures.stdoutRaw),
    stderr: captures.stderrRaw,
    shutdown,
  };
}

async function httpProbe(label, url, token) {
  const headers = token === undefined ? {} : { Authorization: `Bearer ${token}` };
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers,
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
      at: now(),
      status: response.status,
      headers: {
        contentType: response.headers.get('content-type'),
        retryAfter: response.headers.get('retry-after'),
      },
      body,
    };
  } catch (error) {
    return {
      label,
      at: now(),
      transportError: serializeError(error),
    };
  }
}

async function runQwenProbe(input) {
  const probeDir = path.join(input.root, 'qwen-daemon');
  const tempDir = path.join(probeDir, 'tmp');
  const fixtureDir = path.join(probeDir, 'fixture');
  const qwenHome = path.join(probeDir, 'qwen-home');
  const runtimeDir = path.join(probeDir, 'runtime');
  const policyDir = path.join(probeDir, 'policy');
  await Promise.all(
    [tempDir, fixtureDir, qwenHome, runtimeDir, policyDir].map((directory) =>
      mkdir(directory, { recursive: true }),
    ),
  );
  await Promise.all([
    writeFile(path.join(fixtureDir, 'README.md'), '# Phase 1D fixture\n'),
    writeFile(path.join(qwenHome, 'settings.json'), '{}\n'),
    writeFile(path.join(policyDir, 'settings.json'), '{}\n'),
    writeFile(path.join(policyDir, 'system-defaults.json'), '{}\n'),
  ]);

  const qwenEnv = minimalEnv(tempDir, {
    QWEN_HOME: qwenHome,
    QWEN_RUNTIME_DIR: runtimeDir,
    QWEN_CODE_SYSTEM_SETTINGS_PATH: path.join(policyDir, 'settings.json'),
    QWEN_CODE_SYSTEM_DEFAULTS_PATH: path.join(
      policyDir,
      'system-defaults.json',
    ),
    QWEN_CODE_TRUSTED_FOLDERS_PATH: path.join(
      qwenHome,
      'trusted-folders.json',
    ),
    QWEN_CODE_MCP_APPROVALS_PATH: path.join(
      qwenHome,
      'mcp-approvals.json',
    ),
    QWEN_CODE_MEMORY_BASE_DIR: runtimeDir,
    QWEN_SERVE_NO_PERSISTENT_REGISTRATION: '1',
    QWEN_CODE_DISABLE_PRECONNECT: '1',
    QWEN_TELEMETRY_ENABLED: 'false',
    QWEN_CODE_SKIP_UPDATE_CHECK_ONCE: 'true',
    NODE_DISABLE_COMPILE_CACHE: '1',
    QWEN_SERVER_TOKEN: TEST_TOKEN,
    VITEST_WORKER_ID: 'ccq-phase1d-no-preheat',
  });
  const commandArgs = [
    input.qwenEntry,
    'serve',
    '--hostname',
    '127.0.0.1',
    '--port',
    '0',
    '--workspace',
    fixtureDir,
    '--require-auth',
    '--no-web',
    '--max-sessions',
    '1',
    '--max-connections',
    '8',
  ];
  const server = createTextChild(input.nodeBinary, commandArgs, {
    cwd: fixtureDir,
    env: qwenEnv,
  });

  let listening;
  try {
    listening = await server.waitForLine(
      /qwen serve listening on (http:\/\/127\.0\.0\.1:\d+) \(mode=http-bridge, workspace=(.+)\)/u,
    );
  } catch (error) {
    const shutdown = await stopChild(
      server.child,
      server.exitPromise,
      'sigterm',
    );
    throw new ProbeError('Qwen daemon failed before listener readiness', error, {
      lines: server.lines,
      captures: server.captures(),
      shutdown,
    });
  }
  const baseUrl = listening.match[1];
  const requests = [];
  requests.push(await httpProbe('health_no_token', `${baseUrl}/health`));
  requests.push(
    await httpProbe(
      'health_wrong_token',
      `${baseUrl}/health`,
      'ccq-phase1d-wrong-token',
    ),
  );
  requests.push(
    await httpProbe('health_correct_token', `${baseUrl}/health`, TEST_TOKEN),
  );

  let deepHealth;
  for (let attempt = 0; attempt < 40; attempt += 1) {
    deepHealth = await httpProbe(
      `health_deep_attempt_${attempt + 1}`,
      `${baseUrl}/health?deep=1`,
      TEST_TOKEN,
    );
    requests.push(deepHealth);
    if (deepHealth.status === 200 || deepHealth.transportError) {
      break;
    }
    await delay(250);
  }

  const capabilities = await httpProbe(
    'capabilities',
    `${baseUrl}/capabilities`,
    TEST_TOKEN,
  );
  requests.push(capabilities);
  requests.push(
    await httpProbe(
      'daemon_status_summary',
      `${baseUrl}/daemon/status?detail=summary`,
      TEST_TOKEN,
    ),
  );
  requests.push(
    await httpProbe(
      'daemon_status_full',
      `${baseUrl}/daemon/status?detail=full`,
      TEST_TOKEN,
    ),
  );
  requests.push(
    await httpProbe(
      'daemon_status_invalid_detail',
      `${baseUrl}/daemon/status?detail=invalid`,
      TEST_TOKEN,
    ),
  );
  requests.push(
    await httpProbe(
      'unknown_no_token',
      `${baseUrl}/__ccq_probe_unknown__`,
    ),
  );
  requests.push(
    await httpProbe(
      'unknown_wrong_token',
      `${baseUrl}/__ccq_probe_unknown__`,
      'ccq-phase1d-wrong-token',
    ),
  );
  requests.push(
    await httpProbe(
      'unknown_correct_token',
      `${baseUrl}/__ccq_probe_unknown__`,
      TEST_TOKEN,
    ),
  );

  const shutdown = await stopChild(
    server.child,
    server.exitPromise,
    'sigterm',
  );
  const postShutdown = await httpProbe(
    'health_after_shutdown',
    `${baseUrl}/health`,
    TEST_TOKEN,
  );
  const captures = server.captures();
  const capabilitiesBody = capabilities.body;
  const byLabel = Object.fromEntries(
    requests.map((request) => [request.label, request]),
  );
  const expectations = [
    ['health_no_token', byLabel.health_no_token?.status === 401],
    ['health_wrong_token', byLabel.health_wrong_token?.status === 401],
    ['health_correct_token', byLabel.health_correct_token?.status === 200],
    ['health_deep_runtime', deepHealth?.status === 200],
    ['capabilities', capabilities.status === 200],
    ['daemon_status_summary', byLabel.daemon_status_summary?.status === 200],
    ['daemon_status_full', byLabel.daemon_status_full?.status === 200],
    [
      'daemon_status_invalid_detail',
      byLabel.daemon_status_invalid_detail?.status === 400,
    ],
    ['unknown_no_token', byLabel.unknown_no_token?.status === 401],
    ['unknown_wrong_token', byLabel.unknown_wrong_token?.status === 401],
    ['unknown_correct_token', byLabel.unknown_correct_token?.status === 404],
    ['listener_closed', Boolean(postShutdown.transportError)],
    ['pid_gone', shutdown.pidGone === true],
  ].map(([name, pass]) => ({ name, pass }));
  const failedExpectations = expectations
    .filter(({ pass }) => !pass)
    .map(({ name }) => name);

  return {
    probeId: 'P1C2-QWN-DAEMON-DISCOVERY-001',
    status:
      failedExpectations.length === 0 ? 'Reproduced' : 'Not reproduced',
    command: [input.nodeBinary, ...commandArgs],
    childPid: server.child.pid,
    baseUrl,
    workspace: fixtureDir,
    isolationEnvKeys: Object.keys(qwenEnv).sort(),
    testEscapes: {
      VITEST_WORKER_ID:
        'Set only to disable ACP bridge preheat; discovery/runtime routes remain enabled.',
    },
    listening,
    requests,
    capabilitiesCanonicalSha256:
      capabilitiesBody && typeof capabilitiesBody === 'object'
        ? sha256Text(canonicalJson(capabilitiesBody))
        : null,
    capabilitiesFeatureCount: Array.isArray(capabilitiesBody?.features)
      ? capabilitiesBody.features.length
      : null,
    expectations,
    failedExpectations,
    stdout: captures.stdoutRaw,
    stderr: captures.stderrRaw,
    shutdown,
    postShutdown,
  };
}

const args = parseArgs(process.argv.slice(2));
const mode = args.mode;
if (!['qwen', 'codex-app', 'codex-mcp'].includes(mode)) {
  throw new Error(`Unsupported --mode ${String(mode)}`);
}

const root = requireAbsolute(args.root, '--root');
const resolvedRoot = await realpath(root);
if (!resolvedRoot.startsWith('/private/tmp/ccq-phase1d-')) {
  throw new Error(`Refusing non-probe root ${resolvedRoot}`);
}

const resultName = `${mode}-result.json`;
const resultPath = path.join(resolvedRoot, resultName);
const input = {
  mode,
  root: resolvedRoot,
  nodeBinary: requireAbsolute(args.node, '--node'),
  ...(mode === 'qwen'
    ? { qwenEntry: requireAbsolute(args['qwen-entry'], '--qwen-entry') }
    : {
        codexBinary: requireAbsolute(
          args['codex-binary'],
          '--codex-binary',
        ),
      }),
};
const startedAt = now();
let result;
let exitCode = 0;

try {
  const probe =
    mode === 'qwen'
      ? await runQwenProbe(input)
      : mode === 'codex-app'
        ? await runCodexAppProbe(input)
        : await runCodexMcpProbe(input);
  const sideEffects = await inventoryTree(
    resolvedRoot,
    new Set([resultName]),
  );
  result = {
    schemaVersion: 1,
    mode,
    startedAt,
    finishedAt: now(),
    containment: {
      outer: 'macOS Seatbelt deny-default profile',
      realHomeReadAllowed: false,
      probeRootWriteOnly: true,
      remoteIpNetworkAllowed: false,
      loopbackNetworkAllowed: mode === 'qwen',
      environmentSource: 'allowlisted keys only; parent environment not copied',
    },
    probe,
    sideEffects,
  };
} catch (error) {
  exitCode = 1;
  result = {
    schemaVersion: 1,
    mode,
    startedAt,
    finishedAt: now(),
    containment: {
      outer: 'macOS Seatbelt deny-default profile',
      realHomeReadAllowed: false,
      probeRootWriteOnly: true,
      remoteIpNetworkAllowed: false,
      loopbackNetworkAllowed: mode === 'qwen',
      environmentSource: 'allowlisted keys only; parent environment not copied',
    },
    status: 'Probe failed',
    error: serializeError(error),
    sideEffects: await inventoryTree(
      resolvedRoot,
      new Set([resultName]),
    ).catch((inventoryError) => [
      { inventoryError: serializeError(inventoryError) },
    ]),
  };
}

await writeFile(resultPath, `${JSON.stringify(result, null, 2)}\n`);
process.stdout.write(
  `${JSON.stringify({ mode, resultPath, status: result.probe?.status ?? result.status })}\n`,
);
process.exitCode = exitCode;
