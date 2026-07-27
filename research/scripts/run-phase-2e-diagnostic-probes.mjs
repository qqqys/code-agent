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

const scriptPath = fileURLToPath(import.meta.url);
const scriptDir = path.dirname(scriptPath);
const researchRoot = path.resolve(scriptDir, '..');
const fixedOutput = path.join(
  researchRoot,
  'artifacts',
  'phase-2e',
  'diagnostic-fault-matrix.json',
);
const qwenToken = 'ccq-phase2e-fixed-synthetic-token';
const maxCaptureBytes = 2 * 1024 * 1024;
const processTimeoutMs = 20_000;
const shutdownTimeoutMs = 3_000;

const expectedHashes = {
  codexBinary:
    '1da3f4e0e96028b8a771814293c3033dafd1971f943f6c7e79b0897fe705f590',
  codexTree:
    '892f8a81f38ec7e2784938ef12fa6ef6a7bfe1cf5f757984f8c4288835e5f551',
  qwenEntry:
    '1db9709bf1753611ca2fec234cf5adf517376efeb1540fcf9e309da010f9ed38',
  qwenTree:
    'a106a1332b3266bef53839a74fb10c7fb961bec59dd791adbe92cd502eae500e',
  node: '32e234a5b6bec67d72a016f2baadf7fadf3afd328470b395b73af473fdee0d85',
  cliProfile:
    'ff5f599cad03d5c257827314c5a483e3cffaa2fef2d7b70a433e376ad1c700e6',
  qwenProfile:
    '995857032aad38d2cea9876a4cbe70c7e29cde577539b9052af30c21d6ff8219',
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

async function runOneShot(spec) {
  const process = launchSandboxed(spec);
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
  return {
    startedAt: process.startedAt,
    finishedAt: now(),
    timedOut,
    exitCode: exit.code,
    signal: exit.signal,
    spawnError: process.spawnError(),
    cleanup: {
      processGroupId: process.processGroupId,
      processGroupVerifiedGone: await waitForProcessGroupExit(
        process.processGroupId,
        shutdownTimeoutMs,
      ),
    },
    ...process.captures(),
  };
}

async function stopProcess(process) {
  const signals = [
    signalProcessGroup(process.processGroupId, 'SIGTERM'),
  ];
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
  return {
    requestedAt: now(),
    timedOut,
    exit,
    signals,
    processGroupId: process.processGroupId,
    processGroupVerifiedGone: await waitForProcessGroupExit(
      process.processGroupId,
      shutdownTimeoutMs,
    ),
  };
}

function commonEnv(stateRoot, executablePath) {
  return {
    HOME: path.join(stateRoot, 'home'),
    XDG_CACHE_HOME: path.join(stateRoot, 'home', '.cache'),
    XDG_CONFIG_HOME: path.join(stateRoot, 'home', '.config'),
    XDG_DATA_HOME: path.join(stateRoot, 'home', '.local', 'share'),
    XDG_STATE_HOME: path.join(stateRoot, 'home', '.local', 'state'),
    PATH: executablePath,
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
  const permittedSensitiveKeys = new Set([
    'CODEX_CA_CERTIFICATE',
    'QWEN_SERVER_TOKEN',
  ]);
  const forbidden =
    /(?:API_KEY|ACCESS_KEY|SECRET|PRIVATE_KEY|PASSWORD|CREDENTIAL|OAUTH|BEARER|PROXY|BASE_URL|ENDPOINT|CERTIFICATE)/iu;
  const unexpected = Object.keys(env).filter(
    (key) =>
      forbidden.test(key) && !permittedSensitiveKeys.has(key),
  );
  if (unexpected.length > 0) {
    throw new Error(
      `${product} environment contains forbidden keys: ${unexpected.join(', ')}`,
    );
  }
  if (
    Object.keys(env).some(
      (key) =>
        /TOKEN/iu.test(key) && key !== 'QWEN_SERVER_TOKEN',
    )
  ) {
    throw new Error(`${product} environment contains a non-probe token`);
  }
}

async function prepareRun(root, scenarioId) {
  const runRoot = path.join(root, 'runs', scenarioId);
  const repoRoot = path.join(runRoot, 'repo');
  const stateRoot = path.join(runRoot, 'state');
  const emptyPath = path.join(runRoot, 'empty-path');
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
    emptyPath,
  ]) {
    await mkdir(directory, { recursive: true });
  }
  await writeFile(path.join(repoRoot, '.git', 'HEAD'), 'ref: refs/heads/main\n');
  await writeFile(path.join(repoRoot, 'README.md'), '# Phase 2E fixture\n');
  await chmod(path.join(repoRoot, '.git', 'HEAD'), 0o444);
  await chmod(path.join(repoRoot, 'README.md'), 0o444);
  await chmod(emptyPath, 0o555);
  return {
    runRoot,
    repoRoot,
    stateRoot,
    emptyPath,
    fixtures: [],
  };
}

async function writeFixture(prepared, file, content, mode = 0o444) {
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, content);
  await chmod(file, mode);
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

async function fixtureState(fixtures) {
  const current = [];
  for (const fixture of fixtures) {
    try {
      const stat = await lstat(fixture.path);
      current.push({
        path: fixture.path,
        mode: (stat.mode & 0o777).toString(8),
        bytes: stat.size,
        sha256: await sha256File(fixture.path),
      });
    } catch (error) {
      current.push({
        path: fixture.path,
        missing: true,
        error: errorRecord(error),
      });
    }
  }
  return current;
}

function productSpec({
  profile,
  targetBinary,
  targetRoot,
  prepared,
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
    cwd: prepared.repoRoot,
    args,
    env,
  };
}

function parseJson(text) {
  try {
    return { value: JSON.parse(text), error: null };
  } catch (error) {
    return { value: null, error: errorRecord(error) };
  }
}

function codexAssessment(id, report) {
  if (!report) {
    return {
      state: 'Not assessed',
      basis: 'doctor did not return parseable JSON',
    };
  }
  if (id === 'P2E-CODEX-BASELINE') {
    const checkCount = Object.keys(report.checks ?? {}).length;
    return {
      state:
        report.schemaVersion === 1 &&
        report.codexVersion === '0.145.0' &&
        checkCount > 0
          ? 'Observed'
          : 'Not assessed',
      basis: `schemaVersion=${String(report.schemaVersion)}, checkCount=${checkCount}`,
    };
  }
  if (id === 'P2E-CODEX-MISSING-EXECUTABLE') {
    const check = report.checks?.['git.environment'];
    return {
      state: 'Not assessed',
      basis:
        'the deny-default profile does not expose a controlled git executable for a valid counterfactual, so the empty-PATH result is containment-shaped',
      selectedCheck: check ?? null,
    };
  }
  if (id === 'P2E-CODEX-BAD-CA') {
    const envCheck = report.checks?.['network.env'];
    const reachability =
      report.checks?.['network.provider_reachability'];
    const websocket =
      report.checks?.['network.websocket_reachability'];
    const combined = JSON.stringify({
      envCheck,
      reachability,
      websocket,
    });
    const attributable =
      /no certificates found in PEM file|failed to load CA certificates|failed to load custom CA bundle|ensure it points to a PEM file/iu.test(
        combined,
      ) &&
      !/operation not permitted|os error 1/iu.test(combined);
    return {
      state: attributable ? 'Observed' : 'Not assessed',
      basis: attributable
        ? 'doctor surfaced an error attributable to the explicit invalid custom CA'
        : 'deny-network containment prevented a distinct custom-CA attribution',
      selectedChecks: {
        envCheck: envCheck ?? null,
        reachability: reachability ?? null,
        websocket: websocket ?? null,
      },
    };
  }
  const check = report.checks?.['updates.status'];
  const parseDetail = check?.details?.['version cache parse'];
  const attributable =
    typeof parseDetail === 'string' && parseDetail.length > 0;
  return {
    state: attributable ? 'Observed' : 'Not assessed',
    basis: attributable
      ? 'updates.status attributed the failure to the corrupt version cache'
      : 'updates.status did not expose a distinct corrupt-cache parse failure',
    selectedCheck: check ?? null,
  };
}

async function runCodexScenario({
  root,
  artifacts,
  id,
  pathMode,
  fault,
}) {
  const prepared = await prepareRun(root, id);
  const codexHome = path.join(
    prepared.stateRoot,
    'config',
    'codex-home',
  );
  await mkdir(codexHome, { recursive: true });
  const env = {
    ...commonEnv(
      prepared.stateRoot,
      pathMode === 'empty'
        ? prepared.emptyPath
        : '/opt/homebrew/bin:/usr/bin:/bin:/usr/sbin:/sbin',
    ),
    CODEX_HOME: codexHome,
  };
  if (fault === 'bad-ca') {
    const badCa = path.join(prepared.runRoot, 'fixtures', 'bad-ca.pem');
    await writeFixture(
      prepared,
      badCa,
      'CCQ_PHASE2E_NOT_A_CERTIFICATE\n',
    );
    env.CODEX_CA_CERTIFICATE = badCa;
  }
  if (fault === 'corrupt-version-cache') {
    await writeFixture(
      prepared,
      path.join(codexHome, 'version.json'),
      '{',
    );
  }

  const inventoryBefore = await inventoryTree(prepared.stateRoot);
  const runtime = await runOneShot(
    productSpec({
      profile: artifacts.cliProfile,
      targetBinary: artifacts.codex,
      targetRoot: artifacts.codexTreeRoot,
      prepared,
      args: ['doctor', '--json'],
      env,
    }),
  );
  const parsed = parseJson(runtime.stdout.utf8);
  return {
    id,
    product: 'codex',
    risk: 'R1',
    fault,
    command: {
      executable: artifacts.codex,
      args: ['doctor', '--json'],
      cwd: prepared.repoRoot,
      environmentKeys: Object.keys(env).sort(),
      pathMode,
    },
    runtime,
    report: parsed.value,
    parseError: parsed.error,
    assessment: codexAssessment(id, parsed.value),
    fixtures: prepared.fixtures,
    fixturesAfter: await fixtureState(prepared.fixtures),
    inventoryBefore,
    inventoryAfter: await inventoryTree(prepared.stateRoot),
  };
}

async function httpGet(baseUrl, route) {
  try {
    const response = await fetch(`${baseUrl}${route}`, {
      headers: { Authorization: `Bearer ${qwenToken}` },
      signal: AbortSignal.timeout(3_000),
    });
    const text = await response.text();
    return {
      route,
      status: response.status,
      body: parseJson(text).value ?? text,
    };
  } catch (error) {
    return { route, transportError: errorRecord(error) };
  }
}

function qwenPreflight(status) {
  return status?.body?.full?.workspace?.preflight?.data?.cells ?? [];
}

function qwenAssessment(id, status, stderr) {
  const body = status?.body;
  if (!body || typeof body !== 'object') {
    return {
      state: 'Not assessed',
      basis: 'full daemon status was not returned',
    };
  }
  if (id === 'P2E-QWEN-BASELINE') {
    return {
      state:
        body.v === 1 &&
        body.detail === 'full' &&
        body.daemon?.qwenCodeVersion === '0.21.0'
          ? 'Observed'
          : 'Not assessed',
      basis: `v=${String(body.v)}, detail=${String(body.detail)}, version=${String(body.daemon?.qwenCodeVersion)}`,
    };
  }
  if (id === 'P2E-QWEN-MISSING-EXECUTABLE') {
    const cells = qwenPreflight(status).filter((cell) =>
      ['git', 'npm'].includes(cell.kind),
    );
    const combined = JSON.stringify(cells);
    const contaminated = /EPERM|operation not permitted/iu.test(combined);
    const attributable =
      !contaminated &&
      cells.length === 2 &&
      cells.every(
        (cell) =>
          cell.status === 'warning' &&
          /not found on PATH\./u.test(cell.hint ?? '') &&
          cell.error === undefined,
      );
    return {
      state: attributable ? 'Observed' : 'Not assessed',
      basis: attributable
        ? 'empty PATH produced product-level missing-tool diagnostics without Seatbelt EPERM'
        : contaminated
          ? 'process-exec containment contaminated the missing-tool result with EPERM'
          : 'preflight did not expose an attributable missing-tool result',
      selectedCells: cells,
    };
  }
  const daemon = body.daemon ?? {};
  const issueCodes = (body.issues ?? []).map((issue) => issue.code);
  const attributable =
    daemon.logMode === 'stderr-only' &&
    daemon.logHealth === 'degraded' &&
    daemon.logIssues?.includes('init_failed') &&
    issueCodes.includes('daemon_log_degraded') &&
    /daemon log disabled.+init failed/iu.test(stderr);
  return {
    state: attributable ? 'Observed' : 'Not assessed',
    basis: attributable
      ? 'unwritable daemon log directory degraded to stderr-only with explicit issue codes'
      : 'daemon did not expose the complete expected log-degradation contract',
    daemon: {
      logMode: daemon.logMode ?? null,
      logHealth: daemon.logHealth ?? null,
      logIssues: daemon.logIssues ?? null,
    },
    issueCodes,
  };
}

async function prepareQwenFixture(prepared, makeLogUnwritable) {
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
  await writeFixture(prepared, systemPath, '{"$version":4}\n');
  await writeFixture(prepared, defaultsPath, '{"$version":4}\n');
  await writeFixture(
    prepared,
    path.join(qwenHome, 'settings.json'),
    '{"$version":4,"security":{"folderTrust":{"enabled":true}}}\n',
  );
  await writeFixture(
    prepared,
    trustedPath,
    `${JSON.stringify({ [prepared.repoRoot]: 'TRUST_FOLDER' })}\n`,
  );
  await writeFixture(prepared, approvalsPath, '{}\n');

  let protectedLogDirectory = null;
  if (makeLogUnwritable) {
    protectedLogDirectory = path.join(
      runtimeRoot,
      'debug',
    );
    await mkdir(protectedLogDirectory, { recursive: true });
    await chmod(protectedLogDirectory, 0o555);
  }
  return {
    qwenHome,
    runtimeRoot,
    memoryRoot,
    systemPath,
    defaultsPath,
    trustedPath,
    approvalsPath,
    protectedLogDirectory,
  };
}

async function runQwenScenario({
  root,
  artifacts,
  id,
  pathMode,
  fault,
}) {
  const prepared = await prepareRun(root, id);
  const fixture = await prepareQwenFixture(
    prepared,
    fault === 'unwritable-daemon-log',
  );
  const env = {
    ...commonEnv(
      prepared.stateRoot,
      pathMode === 'empty'
        ? prepared.emptyPath
        : '/opt/homebrew/bin:/usr/bin:/bin:/usr/sbin:/sbin',
    ),
    QWEN_HOME: fixture.qwenHome,
    QWEN_RUNTIME_DIR: fixture.runtimeRoot,
    QWEN_CODE_MEMORY_BASE_DIR: fixture.memoryRoot,
    QWEN_CODE_SYSTEM_SETTINGS_PATH: fixture.systemPath,
    QWEN_CODE_SYSTEM_DEFAULTS_PATH: fixture.defaultsPath,
    QWEN_CODE_TRUSTED_FOLDERS_PATH: fixture.trustedPath,
    QWEN_CODE_MCP_APPROVALS_PATH: fixture.approvalsPath,
    QWEN_SERVE_NO_PERSISTENT_REGISTRATION: '1',
    QWEN_CODE_DISABLE_PRECONNECT: '1',
    QWEN_CODE_NO_BROWSER: '1',
    QWEN_CODE_SKIP_UPDATE_CHECK_ONCE: 'true',
    QWEN_TELEMETRY_ENABLED: 'false',
    QWEN_USAGE_STATISTICS_ENABLED: 'false',
    NODE_DISABLE_COMPILE_CACHE: '1',
    NO_BROWSER: '1',
    QWEN_SERVER_TOKEN: qwenToken,
    VITEST_WORKER_ID: 'ccq-phase2e-no-preheat',
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
  const inventoryBefore = await inventoryTree(prepared.stateRoot);
  const process = launchSandboxed(
    productSpec({
      profile: artifacts.qwenProfile,
      targetBinary: artifacts.node,
      targetRoot: artifacts.qwenTreeRoot,
      prepared,
      args,
      env,
    }),
  );
  let listeningLine;
  try {
    listeningLine = await process.waitForLine(
      (line) =>
        /qwen serve listening on http:\/\/127\.0\.0\.1:\d+/u.test(line),
      `${id} listener`,
    );
  } catch (error) {
    const captures = process.captures();
    throw new Error(
      `${id} listener failed: ${error instanceof Error ? error.message : String(error)}; stderr=${captures.stderr.utf8}`,
    );
  }
  const baseUrl = listeningLine.match(
    /qwen serve listening on (http:\/\/127\.0\.0\.1:\d+)/u,
  )?.[1];
  if (!baseUrl) throw new Error(`${id} missing listener URL`);

  const requests = [];
  let deepHealth;
  for (let attempt = 0; attempt < 40; attempt += 1) {
    deepHealth = await httpGet(baseUrl, '/health?deep=1');
    requests.push(deepHealth);
    if (deepHealth.status === 200 || deepHealth.transportError) break;
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  const status = await httpGet(baseUrl, '/daemon/status?detail=full');
  requests.push(status);
  const shutdown = await stopProcess(process);
  const postShutdown = await httpGet(baseUrl, '/health');
  const captures = process.captures();

  return {
    id,
    product: 'qwen',
    risk: 'R1',
    fault,
    command: {
      executable: artifacts.node,
      args,
      cwd: prepared.repoRoot,
      environmentKeys: Object.keys(env).sort(),
      pathMode,
      syntheticBearerSha256: sha256Bytes(qwenToken),
    },
    listeningLine,
    requests,
    selected: { deepHealth, status },
    captures,
    assessment: qwenAssessment(id, status, captures.stderr.utf8),
    shutdown,
    postShutdown,
    fixtures: prepared.fixtures,
    fixturesAfter: await fixtureState(prepared.fixtures),
    protectedLogDirectory: fixture.protectedLogDirectory,
    inventoryBefore,
    inventoryAfter: await inventoryTree(prepared.stateRoot),
  };
}

function evaluateGate(results) {
  const failures = [];
  for (const result of results) {
    if (result.product === 'codex') {
      if (
        result.runtime.timedOut ||
        result.runtime.signal !== null ||
        result.runtime.spawnError !== null ||
        result.runtime.stdout.truncated ||
        result.runtime.stderr.truncated ||
        !result.runtime.cleanup.processGroupVerifiedGone ||
        result.parseError
      ) {
        failures.push(`${result.id}: runtime hygiene`);
      }
    } else if (
      result.captures.stdout.truncated ||
      result.captures.stderr.truncated ||
      result.shutdown.timedOut ||
      !result.shutdown.processGroupVerifiedGone ||
      !result.postShutdown.transportError
    ) {
      failures.push(`${result.id}: daemon hygiene`);
    }
  }
  const requiredObserved = [
    'P2E-CODEX-BASELINE',
    'P2E-QWEN-BASELINE',
    'P2E-QWEN-UNWRITABLE-LOG',
  ];
  for (const id of requiredObserved) {
    const result = results.find((candidate) => candidate.id === id);
    if (result?.assessment.state !== 'Observed') {
      failures.push(`${id}: required observation not closed`);
    }
  }
  return {
    passed: failures.length === 0,
    failures,
    runtimeExecutions: results.length,
    observedCells: results.filter(
      (result) => result.assessment.state === 'Observed',
    ).length,
    notAssessedCells: results.filter(
      (result) => result.assessment.state === 'Not assessed',
    ).length,
    providerOrModelCalls: 0,
    credentialReads: 0,
    modelCost: 0,
  };
}

async function verifyInputs(artifacts) {
  const actual = {
    codexBinary: await sha256File(artifacts.codex),
    codexTree: await sha256Tree(artifacts.codexTreeRoot),
    qwenEntry: await sha256File(artifacts.qwenEntry),
    qwenTree: await sha256Tree(artifacts.qwenTreeRoot),
    node: await sha256File(artifacts.node),
    cliProfile: await sha256File(artifacts.cliProfile),
    qwenProfile: await sha256File(artifacts.qwenProfile),
    runner: await sha256File(scriptPath),
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
    qwenEntry: requireAbsolute(input['qwen-entry'], '--qwen-entry'),
    node: requireAbsolute(input.node, '--node'),
    cliProfile: requireAbsolute(input['cli-profile'], '--cli-profile'),
    qwenProfile: requireAbsolute(
      input['qwen-profile'],
      '--qwen-profile',
    ),
  };
  artifacts.codexTreeRoot = path.dirname(path.dirname(artifacts.codex));
  artifacts.qwenTreeRoot = path.dirname(artifacts.qwenEntry);

  const startedAt = now();
  const inputHashes = await verifyInputs(artifacts);
  const runRoot = await mkdtemp('/private/tmp/ccq-phase2e-r1-');
  const results = [];

  for (const scenario of [
    {
      id: 'P2E-CODEX-BASELINE',
      pathMode: 'normal',
      fault: 'none',
    },
    {
      id: 'P2E-CODEX-MISSING-EXECUTABLE',
      pathMode: 'empty',
      fault: 'missing-git',
    },
    {
      id: 'P2E-CODEX-BAD-CA',
      pathMode: 'normal',
      fault: 'bad-ca',
    },
    {
      id: 'P2E-CODEX-CORRUPT-CACHE',
      pathMode: 'normal',
      fault: 'corrupt-version-cache',
    },
  ]) {
    results.push(
      await runCodexScenario({
        root: runRoot,
        artifacts,
        ...scenario,
      }),
    );
  }
  for (const scenario of [
    {
      id: 'P2E-QWEN-BASELINE',
      pathMode: 'normal',
      fault: 'none',
    },
    {
      id: 'P2E-QWEN-MISSING-EXECUTABLE',
      pathMode: 'empty',
      fault: 'missing-path-tools',
    },
    {
      id: 'P2E-QWEN-UNWRITABLE-LOG',
      pathMode: 'normal',
      fault: 'unwritable-daemon-log',
    },
  ]) {
    results.push(
      await runQwenScenario({
        root: runRoot,
        artifacts,
        ...scenario,
      }),
    );
  }

  const artifact = {
    schemaVersion: 1,
    phase: 'Phase 2E',
    probe: 'R1-3 diagnostic fault matrix',
    startedAt,
    finishedAt: now(),
    runRoot,
    cohort: {
      codex: '0.145.0/latest/CLI/Darwin-arm64/non-TTY',
      claude: '2.1.212/stable/CLI/Darwin-arm64/not-executed',
      qwen: '0.21.0/effective-latest/CLI+sdk-daemon/Darwin-arm64/non-TTY/Node',
    },
    containment: {
      credentialEnvironmentInherited: false,
      providerEnvironmentInherited: false,
      userConfigurationInherited: false,
      codexRemoteNetworkAllowed: false,
      qwenRemoteNetworkAllowed: false,
      qwenLoopbackAllowed: true,
      syntheticBearer: true,
      modelTurnCreated: false,
      allowedPersistentWriteScope: 'per-scenario state directory',
      processCleanup:
        'original detached process group; new-session descendants are outside the proof',
    },
    matrixPolicy: {
      crossProductAtomic: 'CAP-12.05-A02',
      crossProductRelation: 'Not assessed',
      reason:
        'Codex doctor, Claude interactive install doctor, and Qwen daemon status are different entries and fault targets.',
      notExecuted: {
        claude:
          'Exact --bare doctor is silent in non-TTY mode; interactive doctor may access macOS Keychain, outside the no-credential boundary.',
        codexUnwritableState:
          'doctor checks inspectability rather than a selected write contract.',
        qwenBadCa:
          'daemon status inventories CA environment presence but does not validate trust.',
        qwenCorruptCache:
          'no status-consumed cache path was identified for the selected entry.',
      },
    },
    inputHashes,
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
      observedCells: artifact.gate.observedCells,
      notAssessedCells: artifact.gate.notAssessedCells,
      failures: artifact.gate.failures,
    })}\n`,
  );
  if (!artifact.gate.passed) process.exitCode = 1;
}

await main();
