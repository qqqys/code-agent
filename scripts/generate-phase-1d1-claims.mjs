import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { buildPhase1C2 } from './generate-phase-1c2-claims.mjs';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(scriptDir, '..');
const outputDir = path.join(root, 'claims', 'phase-1d1');
const repoRoot = path.resolve(root, '../../..');
const prettier = path.join(repoRoot, 'node_modules', '.bin', 'prettier');

export const phase1D1ReviewedAt = '2026-07-26T07:51:04Z';

export const phase1D1LeafOrder = [
  'EP',
  'IN',
  'AD',
  'AG',
  'SX',
  'SO',
  'PE',
  'OH',
  'RM',
  'CE',
  'CC',
  'CL',
  'FS',
  'EB',
  'SB',
  'OB',
];

const frozenPhase1C2 = {
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
};

const phase1DEvidenceHash =
  'bc71b5853da3fc06edad28e07e6c10e59d0cdb9ee6114560b0be854053e2c481';
const registryRevision2Hash =
  '95deccb0c7c056b6e89e092ae6b9187e459afd7e0c680f6e972ec2a2c13997f5';
const identityErrataHash =
  '2cb12201a9991cd91375067b411cfeb3d0afb382ba4d42b1bbd3ea0e4e4e92db';

const productMeta = {
  codex: {
    label: 'Codex',
    version: '0.145.0',
    channel: 'latest',
  },
  'claude-code': {
    label: 'Claude Code',
    version: null,
    channel: null,
  },
  'qwen-code': {
    label: 'Qwen Code',
    version: '0.21.0',
    channel: 'latest',
  },
};

const expectedCounts = {
  codex: 11,
  'claude-code': 0,
  'qwen-code': 27,
};

const expectedSupport = {
  codex: { Unknown: 11 },
  'claude-code': {},
  'qwen-code': {
    Supported: 3,
    Partial: 2,
    'Not supported': 1,
    Unknown: 21,
  },
};

const expectedRuntime = {
  codex: { Reproduced: 4, 'Not reproduced': 2, 'Not tested': 5 },
  'claude-code': {},
  'qwen-code': { Reproduced: 5, 'Not tested': 22 },
};

const expectedConfidence = {
  codex: { Medium: 11 },
  'claude-code': {},
  'qwen-code': { High: 2, Medium: 25 },
};

const newEvidenceRelationCounts = {
  'EVD-qwen-code-RUNTIME-001': 3,
  'EVD-qwen-code-RUNTIME-002': 2,
  'EVD-codex-RUNTIME-004': 2,
  'EVD-codex-RUNTIME-005': 1,
  'EVD-codex-SOURCE-002': 2,
  'EVD-codex-SOURCE-003': 2,
  'EVD-qwen-code-DOC-044': 2,
};

function sha256(data) {
  return createHash('sha256').update(data).digest('hex');
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function relation(id, relationType, note) {
  return { id, relation: relationType, note };
}

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath));
}

function assertFrozenInputs() {
  for (const [relativePath, expectedHash] of Object.entries(frozenPhase1C2)) {
    assert(
      sha256(read(relativePath)) === expectedHash,
      `${relativePath}: frozen Phase 1C.2 input drifted`,
    );
  }
  assert(
    sha256(read('evidence/phase-1d-runtime-probes.md')) === phase1DEvidenceHash,
    'evidence/phase-1d-runtime-probes.md: Phase 1D Evidence drifted',
  );
  const identityErrata = read('evidence/phase-1d1-identity-errata.md');
  assert(
    sha256(identityErrata) === identityErrataHash,
    'evidence/phase-1d1-identity-errata.md: identity erratum drifted',
  );
  for (const expected of [
    'erratum_id: ERR-P1D1-QWEN-CHANNEL-001',
    'recorded_value: stable',
    'effective_value: latest',
    'identity_preserved: true',
  ]) {
    assert(
      identityErrata.includes(expected),
      `identity erratum omits ${expected}`,
    );
  }
  const registryBuffer = read('03-atomic-capability-registry.md');
  assert(
    sha256(registryBuffer) === registryRevision2Hash,
    '03-atomic-capability-registry.md: frozen Registry Revision 2 drifted',
  );
  const registry = registryBuffer.toString('utf8');
  for (const expected of [
    'revision: 2',
    'topic_count: 144',
    'record_count: 550',
    'CAP-10.08-A01',
    'CAP-10.08-A04',
    'CAP-10.08-A05',
  ]) {
    assert(
      registry.includes(expected),
      `Registry Revision 2 omits ${expected}`,
    );
  }
}

function claimById(claims, id) {
  const claim = claims.find((candidate) => candidate.id === id);
  assert(claim, `missing baseline Claim ${id}`);
  return claim;
}

function addEvidence(claim, evidence) {
  assert(
    !claim.evidence.some(({ id }) => id === evidence.id),
    `${claim.id}: duplicate Evidence ${evidence.id}`,
  );
  claim.evidence.push(evidence);
}

function addConfiguration(claim, value) {
  if (!claim.configuration.includes(value)) claim.configuration.push(value);
}

function containedSlice(base, options) {
  return {
    ...base,
    id: options.id,
    isolation: 'other',
    authentication: options.authentication,
    configuration: options.configuration,
    featureFlags: options.featureFlags,
  };
}

function emptyContract(registryRecord) {
  return Object.fromEntries(
    phase1D1LeafOrder.map((leaf) => [
      leaf,
      registryRecord.requiredLeaves.has(leaf) ? 'NC' : 'NA',
    ]),
  );
}

function buildCodexClaims(baseline, registry) {
  const claims = structuredClone(baseline);
  for (const claim of claims) claim.checked = phase1D1ReviewedAt;
  const containedClaims = structuredClone(baseline);
  for (const claim of containedClaims) claim.checked = phase1D1ReviewedAt;

  const hostInitialize = claimById(claims, 'CCQ-codex-CAP-10.08-A01-001');
  hostInitialize.id = 'CCQ-codex-CAP-10.08-A05-001';
  hostInitialize.atomic = 'CAP-10.08-A05';
  hostInitialize.userJob = registry.get('CAP-10.08-A05').job;
  hostInitialize.statement =
    '冻结 binary 生成的 v2 schema 定义 initialize、客户端身份元数据和响应结构；host Slice 未建立连接，缺失、非法与重复初始化均未验证。';
  hostInitialize.contract.IN =
    'R[clientInfo name/version; optional client capabilities]';
  addEvidence(
    hostInitialize,
    relation(
      'EVD-codex-SOURCE-002',
      'supports',
      'exact-commit source directly supports the bounded client metadata and response-shape statement',
    ),
  );
  addConfiguration(
    hostInitialize,
    'exact-commit source; frozen binary string-consistent without reproducible-build proof',
  );
  hostInitialize.limitations =
    'host Slice 未启动 server 或取得 initialize response；未测试缺失、非法、重复初始化；source 与 binary 无 reproducible-build proof。';

  const appStart = claimById(containedClaims, 'CCQ-codex-CAP-10.07-A01-001');
  appStart.id = 'CCQ-codex-CAP-10.07-A01-003';
  const appContainedSlice = containedSlice(appStart.slice, {
    id: 'CDX-0145-SDK-DAEMON-APP-SERVER-CONTAINED-DARWIN-ARM64',
    authentication: 'not authenticated; credentials unread',
    configuration:
      'frozen binary; deny-default Seatbelt probe; real Codex Home denied; no IP network',
    featureFlags: 'none supplied',
  });
  appStart.slice = appContainedSlice;
  appStart.statement =
    'deny-default probe 启动冻结 app-server 后因 Codex Home SQLite state runtime 初始化失败并退出 1，且无 protocol output；harness 写入的 pre-initialize input 是否被 server 读取未证明，未复现可处理任务的长驻服务。';
  appStart.runtime = 'Not reproduced';
  appStart.support = 'Unknown';
  appStart.confidence = 'Medium';
  appStart.documentation = 'Not checked';
  appStart.lifecycle = 'not-checked';
  appStart.evidence = [
    relation(
      'EVD-codex-RUNTIME-004',
      'supports',
      'contained runtime directly records startup failure with no protocol output; input read is unproven',
    ),
  ];
  appStart.configuration = [
    'frozen binary; deny-default Seatbelt; real Codex Home denied; no IP network',
  ];
  appStart.limitations =
    'containment-induced startup failure；未复现 initialize response、多请求处理、正常关闭或正常 Codex Home 行为。';
  Object.assign(appStart.contract, {
    IN: 'R[one pre-initialize canary request written to stdin by harness; server read not proven]',
    AG: 'NC',
    SX: 'R[attempted Codex Home SQLite state initialization]',
    SO: 'R[process]',
    OH: 'R[startup stderr and exit 1; no protocol stdout]',
    RM: 'R[non-tty]',
    FS: 'R[Codex Home SQLite state initialization failure; no protocol output; input read unproven; exit 1]',
    EB: 'R[stdio process boundary; no protocol output]',
    SB: 'R[sandbox]',
    OB: 'R[stderr; exit code; PID and side-effect inventory]',
  });

  const mcpStart = claimById(containedClaims, 'CCQ-codex-CAP-10.07-A01-002');
  mcpStart.id = 'CCQ-codex-CAP-10.07-A01-004';
  mcpStart.slice = containedSlice(mcpStart.slice, {
    id: 'CDX-0145-SDK-DAEMON-MCP-SERVER-CONTAINED-DARWIN-ARM64',
    authentication: 'not authenticated; credentials unread',
    configuration:
      'frozen binary; deny-default Seatbelt probe; real Codex Home denied; no IP network',
    featureFlags: 'none supplied',
  });
  mcpStart.statement =
    'deny-default probe 启动冻结 `codex mcp-server` 后因 Codex Home config 不可读而退出 1，且无 protocol output；harness 写入的 initialize input 是否被 server 读取未证明，未复现可处理多个请求的服务。';
  mcpStart.runtime = 'Not reproduced';
  mcpStart.support = 'Unknown';
  mcpStart.confidence = 'Medium';
  mcpStart.documentation = 'Not checked';
  mcpStart.lifecycle = 'not-checked';
  mcpStart.evidence = [
    relation(
      'EVD-codex-RUNTIME-005',
      'supports',
      'contained runtime directly records config bootstrap failure with no protocol output; input read is unproven',
    ),
  ];
  mcpStart.configuration = [
    'frozen binary; deny-default Seatbelt; real Codex Home denied; no IP network',
  ];
  mcpStart.limitations =
    'containment-induced config failure；未复现 initialize、tools/list、多请求处理或正常 shutdown。';
  Object.assign(mcpStart.contract, {
    IN: 'R[one initialize line written to stdin by harness; server read not proven]',
    SX: 'R[attempted Codex Home config read]',
    SO: 'R[process]',
    OH: 'R[contained startup stderr and exit 1]',
    RM: 'R[non-tty]',
    FS: 'R[Codex Home config read denied; no protocol output; input read unproven; exit 1]',
    EB: 'R[stdio process boundary; no protocol output]',
    SB: 'R[sandbox]',
    OB: 'R[stderr; exit code; PID and side-effect inventory]',
  });

  const toolDiscovery = claimById(claims, 'CCQ-codex-CAP-07.04-A01-001');
  addEvidence(
    toolDiscovery,
    relation(
      'EVD-codex-SOURCE-003',
      'supports',
      'exact-commit source directly constructs the bounded static tool inventory',
    ),
  );

  const toolInvocation = claimById(claims, 'CCQ-codex-CAP-07.04-A02-001');
  addEvidence(
    toolInvocation,
    relation(
      'EVD-codex-SOURCE-003',
      'qualifies',
      'exact-commit source bounds a safe unknown-tool canary but no frozen runtime call occurred',
    ),
  );

  const oldInitialize = claimById(
    containedClaims,
    'CCQ-codex-CAP-10.08-A01-001',
  );
  oldInitialize.id = 'CCQ-codex-CAP-10.08-A05-002';
  oldInitialize.atomic = 'CAP-10.08-A05';
  oldInitialize.userJob = registry.get('CAP-10.08-A05').job;
  oldInitialize.slice = appContainedSlice;
  oldInitialize.statement =
    'exact source 定义 initialize 的 clientInfo name/version、optional capabilities 与 server metadata response；contained startup 无 protocol output，pre-initialize input 是否被 server 读取未证明，initialize 未发送且未测试。';
  oldInitialize.runtime = 'Not tested';
  oldInitialize.support = 'Unknown';
  oldInitialize.confidence = 'Medium';
  oldInitialize.documentation = 'Not checked';
  oldInitialize.lifecycle = 'not-checked';
  oldInitialize.evidence = [
    relation(
      'EVD-codex-RUNTIME-004',
      'qualifies',
      'contained runtime records startup failure with no protocol output; input read is unproven and initialize was not sent',
    ),
    relation(
      'EVD-codex-SOURCE-002',
      'supports',
      'exact-commit source directly supports the bounded initialize request and response shape',
    ),
  ];
  oldInitialize.configuration = [
    'exact-commit source; frozen binary string-consistent without reproducible-build proof; deny-default Seatbelt; real Codex Home denied; no IP network',
  ];
  oldInitialize.limitations =
    'harness 只写入 pre-initialize unknown request，且 server 是否读取未证明；initialize、缺失/非法/重复初始化与正常 Codex Home 均未测试；source 与 binary 无 reproducible-build proof。';
  Object.assign(oldInitialize.contract, {
    EP: 'R[initialize schema method]',
    IN: 'R[clientInfo name/version; optional client capabilities]',
    AG: 'NC',
    OH: 'R[InitializeResponse codexHome/platformFamily/platformOs/userAgent]',
    RM: 'R[non-tty]',
    FS: 'R[startup dependency failure; no protocol output; input read unproven; initialize not sent or tested]',
    EB: 'R[app-server JSONL protocol boundary]',
    SB: 'R[sandbox]',
    OB: 'R[exact-commit source; contained startup stderr/exit/PID capture]',
  });

  claims.push(appStart, mcpStart, oldInitialize);
  return claims;
}

function buildQwenClaims(baseline, registry) {
  const claims = structuredClone(baseline);
  for (const claim of claims) {
    claim.checked = phase1D1ReviewedAt;
    claim.slice.channel = 'latest';
  }
  const negotiation = claimById(claims, 'CCQ-qwen-code-CAP-10.08-A01-001');
  negotiation.statement =
    '0.21.0 tagged qwen serve 文档把 bilateral feature negotiation 与 protocol version exchange 明列为后续工作；当前 `/capabilities` 只做单向 discovery，不满足双向版本/能力协商。';
  negotiation.contract.EP = 'CN';
  negotiation.contract.EB =
    'R[bilateral negotiation boundary distinct from /capabilities descriptor]';

  const runtimeSlice = containedSlice(
    claimById(claims, 'CCQ-qwen-code-CAP-10.07-A01-001').slice,
    {
      id: 'QWN-0210-DAEMON-CONTAINED-DARWIN-ARM64-NONTTY',
      authentication: 'fixed non-secret bearer; require-auth',
      configuration:
        'frozen npm artifact; controlled Qwen roots; deny-default Seatbelt; localhost only',
      featureFlags:
        'ACP preheat disabled through frozen artifact test-only gate',
    },
  );

  const service = structuredClone(
    claimById(claims, 'CCQ-qwen-code-CAP-10.07-A01-001'),
  );
  service.id = 'CCQ-qwen-code-CAP-10.07-A01-002';
  service.slice = runtimeSlice;
  service.statement =
    '0.21.0 daemon 在 loopback 上连续处理 health、capability 与 status 管理请求并以 SIGTERM clean shutdown；ACP preheat 被 test gate 关闭，未证明 task-ready child 或任务处理。';
  service.runtime = 'Reproduced';
  service.support = 'Unknown';
  service.confidence = 'Medium';
  service.documentation = 'Not checked';
  service.lifecycle = 'not-checked';
  service.evidence = [
    relation(
      'EVD-qwen-code-RUNTIME-001',
      'supports',
      'runtime directly proves the bounded management-route lifecycle without proving task readiness',
    ),
  ];
  service.configuration = [
    'frozen npm artifact; controlled Qwen roots; deny-default Seatbelt; localhost only; fixed bearer; ACP preheat disabled',
  ];
  service.limitations =
    '只复现管理 route 生命周期；ACP preheat 被 test-only gate 关闭，未创建 session、提交任务、测试并发 client、crash 或 child cleanup。';
  Object.assign(service.contract, {
    EP: 'R[qwen serve]',
    IN: 'R[loopback HTTP requests with correct bearer]',
    AG: 'R[require-auth]',
    SX: 'R[settings migration; daemon log and controlled temp directories]',
    SO: 'R[process;workspace]',
    PE: 'R[local]',
    OH: 'R[bootstrap/runtime/error responses; SIGTERM exit 0]',
    RM: 'R[non-tty]',
    CE: 'NC',
    CL: 'NC',
    FS: 'R[bootstrap degraded; unauthorized on tested /health and unregistered route; invalid detail; authenticated unregistered route; contained preflight error]',
    EB: 'R[HTTP daemon discovery and status boundary]',
    SB: 'R[network;workspace]',
    OB: 'R[raw result; daemon log]',
  });

  const descriptor = {
    product: 'qwen-code',
    atomic: 'CAP-10.08-A04',
    slice: runtimeSlice,
    originFacts: ['FACT-qwen-code-042'],
    userJob: registry.get('CAP-10.08-A04').job,
    statement:
      '0.21.0 `/capabilities` 以机器可解析响应返回服务版本、mode、protocol v1 与 99 个 feature tags；这只闭合单向 descriptor discovery，不表示 bilateral negotiation。',
    epistemic: 'Confirmed',
    documentation: 'Documented',
    runtime: 'Reproduced',
    support: 'Partial',
    lifecycle: 'not-checked',
    future: 'not-checked',
    confidence: 'Medium',
    conflicts: [],
    evidence: [
      relation(
        'EVD-qwen-code-DOC-044',
        'supports',
        'exact release-commit documentation distinguishes descriptor discovery from negotiation',
      ),
      relation(
        'EVD-qwen-code-RUNTIME-001',
        'supports',
        'exact runtime directly returned the bounded versioned descriptor',
      ),
    ],
    configuration: [
      'frozen npm artifact; controlled Qwen roots; deny-default Seatbelt; localhost only; fixed bearer; ACP preheat disabled',
    ],
    limitations:
      '只以正确 bearer 请求 `/capabilities`；endpoint-specific unauthorized、malformed request 与 failure response 未测试，因此 FAIL 与 route-specific SEC 保持 NC。',
    checked: phase1D1ReviewedAt,
    contract: {
      ...emptyContract(registry.get('CAP-10.08-A04')),
      EP: 'R[/capabilities]',
      IN: 'R[correct bearer request]',
      AD: 'NC',
      AG: 'R[require-auth]',
      SX: 'NA',
      SO: 'R[process;workspace]',
      PE: 'NA',
      OH: 'R[Qwen 0.21.0; http-bridge; REST; protocol v1; 99 feature tags]',
      RM: 'R[non-tty]',
      CE: 'NA',
      CC: 'NA',
      CL: 'NA',
      FS: 'NC',
      EB: 'R[HTTP daemon capability descriptor boundary]',
      SB: 'NC',
      OB: 'R[raw capability response; canonical snapshot hash]',
    },
    id: 'CCQ-qwen-code-CAP-10.08-A04-001',
  };

  const log = structuredClone(
    claimById(claims, 'CCQ-qwen-code-CAP-12.02-A02-001'),
  );
  log.id = 'CCQ-qwen-code-CAP-12.02-A02-002';
  log.slice = runtimeSlice;
  log.statement =
    '0.21.0 full status 返回 persistent daemon log path；日志可关联 run、PID、workspace、route error、containment warning 与 shutdown，文件在进程退出后仍可读取。';
  log.runtime = 'Reproduced';
  log.support = 'Supported';
  log.confidence = 'Medium';
  log.documentation = 'Not checked';
  log.lifecycle = 'not-checked';
  log.evidence = [
    relation(
      'EVD-qwen-code-RUNTIME-002',
      'supports',
      'runtime directly locates and reads the persistent diagnostic log with run/process/error context',
    ),
  ];
  log.configuration = [
    'frozen npm artifact; controlled Qwen roots; deny-default Seatbelt; localhost only; fixed bearer; ACP preheat disabled',
  ];
  log.limitations =
    '没有 session 可供关联；ambient runtime env 文件不可读，full status 的 rg/git/npm preflight 被 containment 拒绝。';
  Object.assign(log.contract, {
    EP: 'R[/daemon/status?detail=full; daemon log path]',
    IN: 'R[current daemon run]',
    AD: 'NC',
    AG: 'R[correct bearer]',
    SO: 'R[process;workspace]',
    PE: 'R[local]',
    OH: 'R[persistent log with run/PID/workspace/routes/shutdown]',
    FS: 'R[contained preflight failures and runtime-env warning are logged]',
    SB: 'R[network;workspace]',
    OB: 'R[status logPath; archived daemon log and SHA-256]',
  });

  const health = structuredClone(
    claimById(claims, 'CCQ-qwen-code-CAP-12.05-A01-001'),
  );
  health.id = 'CCQ-qwen-code-CAP-12.05-A01-002';
  health.slice = runtimeSlice;
  health.statement =
    '0.21.0 health route 区分 shallow liveness、bootstrap degraded、runtime ready 与 shutdown unavailable；无/错 bearer 在已测 health route 返回 401。';
  health.runtime = 'Reproduced';
  health.support = 'Supported';
  health.confidence = 'High';
  health.documentation = 'Not checked';
  health.lifecycle = 'not-checked';
  health.evidence = [
    relation(
      'EVD-qwen-code-RUNTIME-001',
      'supports',
      'runtime directly distinguishes liveness, degraded bootstrap, readiness, auth rejection, and unavailable after shutdown',
    ),
  ];
  health.configuration = [
    'frozen npm artifact; controlled Qwen roots; deny-default Seatbelt; localhost only; fixed bearer; ACP preheat disabled',
  ];
  health.limitations =
    '未运行 ACP preheat/session/model；negative bearer matrix 只覆盖 `/health` 与 unknown route，不外推其他 route。';
  Object.assign(health.contract, {
    EP: 'R[/health; /health?deep=1]',
    IN: 'R[no bearer; wrong bearer; correct bearer]',
    AD: 'NC',
    AG: 'R[require-auth]',
    SO: 'R[process;workspace]',
    OH: 'R[401 unauthorized; 200 liveness; 503 bootstrap; 200 ready; ECONNREFUSED after shutdown]',
    RM: 'R[non-tty]',
    FS: 'R[bootstrap degraded with Retry-After=1; listener unavailable after shutdown]',
    EB: 'R[HTTP daemon health boundary]',
    SB: 'R[network;workspace]',
    OB: 'R[raw HTTP status/body/header and post-shutdown transport error]',
  });

  const cleanup = structuredClone(
    claimById(claims, 'CCQ-qwen-code-CAP-12.07-A03-001'),
  );
  cleanup.id = 'CCQ-qwen-code-CAP-12.07-A03-002';
  cleanup.slice = runtimeSlice;
  cleanup.statement =
    'graceful SIGTERM 触发 drain/stopped 日志、exit 0、PID 消失与 listener ECONNREFUSED；未验证 ACP child、crash、legacy listener 或 failed-cleanup warning。';
  cleanup.runtime = 'Reproduced';
  cleanup.support = 'Partial';
  cleanup.confidence = 'Medium';
  cleanup.documentation = 'Not checked';
  cleanup.lifecycle = 'not-checked';
  cleanup.evidence = [
    relation(
      'EVD-qwen-code-RUNTIME-002',
      'supports',
      'runtime directly proves bounded graceful parent/listener cleanup, not crash or child-resource recovery',
    ),
  ];
  cleanup.configuration = [
    'frozen npm artifact; controlled Qwen roots; deny-default Seatbelt; localhost only; fixed bearer; ACP preheat disabled',
  ];
  cleanup.limitations =
    'ACP child 不存在；未制造 crash、遗留资源、legacy process 或 cleanup failure。';
  Object.assign(cleanup.contract, {
    EP: 'R[SIGTERM]',
    IN: 'R[running daemon parent and loopback listener]',
    AG: 'R[graceful shutdown path]',
    SX: 'R[listener close; daemon log finalization]',
    SO: 'R[process]',
    OH: 'R[draining/stopped log; exit 0; PID gone; ECONNREFUSED]',
    CE: 'NC',
    CC: 'R[SIGTERM drain]',
    CL: 'NC',
    FS: 'NC',
    SB: 'R[sandbox]',
    OB: 'R[exit/PID/listener checks and daemon log]',
  });

  claims.push(service, descriptor, log, health, cleanup);
  return claims;
}

function tableCell(value) {
  return String(value ?? '')
    .replaceAll('|', '\\|')
    .replaceAll('\n', '<br>');
}

function renderTable(headers, rows) {
  return [
    `| ${headers.join(' | ')} |`,
    `| ${headers.map(() => '---').join(' | ')} |`,
    ...rows.map(
      (row) => `| ${row.map((cell) => tableCell(cell)).join(' | ')} |`,
    ),
  ].join('\n');
}

function assessment(claim) {
  return [
    `E=${claim.epistemic}`,
    `D=${claim.documentation}`,
    `R=${claim.runtime}`,
    `S=${claim.support}`,
    `L=${claim.lifecycle}`,
    `F=${claim.future}`,
    `C=${claim.confidence}`,
  ].join('; ');
}

function relationRows(claims) {
  const grouped = new Map();
  for (const claim of claims) {
    for (const evidence of claim.evidence) {
      const key = `${evidence.id}\u0000${evidence.relation}\u0000${evidence.note}`;
      const group = grouped.get(key) ?? { ...evidence, claims: [] };
      group.claims.push(claim.id);
      grouped.set(key, group);
    }
  }
  const rows = [];
  for (const group of grouped.values()) {
    for (let index = 0; index < group.claims.length; index += 12) {
      rows.push({ ...group, claims: group.claims.slice(index, index + 12) });
    }
  }
  return rows;
}

function renderClaimDocument(product, claims) {
  const meta = productMeta[product];
  if (!claims.length) {
    return [
      `# ${meta.label} Secondary Surfaces：Phase 1D.1 Claim Records`,
      '',
      '> 正式 Claim：0  ',
      '> Registry：Revision 2  ',
      `> Projection reviewed at：${phase1D1ReviewedAt}`,
      '',
      '当前没有正式 Claim：Claude Code 的 secondary Slice 尚未锁定 exact build/package/commit，因此本投影不填写伪 version、channel 或 surface 身份字段。',
      '',
      'Phase 1C.2 的历史 0-Claim 文件保持冻结；只有完成 secondary Slice 锁定并取得同 Slice Evidence 后，后续投影才可新增 Claim。',
      '',
    ].join('\n');
  }
  const slices = [
    ...new Map(claims.map((claim) => [claim.slice.id, claim.slice])).values(),
  ];
  const lines = [
    `# ${meta.label} Secondary Surfaces：Phase 1D.1 Claim Records`,
    '',
    `> 正式 Claim：${claims.length}  `,
    `> 版本：${meta.version}  `,
    `> Channel：${meta.channel}  `,
    `> Surface：${claims.length ? [...new Set(claims.map((claim) => claim.slice.surface))].map((surface) => `\`${surface}\``).join('、') : 'none'}  `,
    `> Registry：Revision 2  `,
    `> Claim last_checked：${phase1D1ReviewedAt}`,
    '',
    '本文是 Phase 1D.1 的完整 current projection。Phase 1C.2 的历史 Claim 文件保持冻结；Codex initialization Claim 的 A01→A05 迁移与 Qwen A04 新增只在本投影生效。',
    '',
    '## 1. Slice Registry',
    '',
    renderTable(
      [
        'Slice ID',
        'Product',
        'Version',
        'Channel',
        'Surface',
        'OS',
        'Arch',
        'Shell',
        'Terminal',
        'Isolation',
        'Authentication',
        'Entitlement',
        'Region',
        'Provider',
        'Model',
        'Configuration',
        'Feature flags',
      ],
      slices.map((slice) => [
        `\`${slice.id}\``,
        slice.product,
        `\`${slice.version}\``,
        slice.channel,
        slice.surface,
        slice.os,
        slice.arch,
        slice.shell,
        slice.terminal,
        slice.isolation,
        slice.authentication,
        slice.entitlement,
        slice.region,
        slice.provider,
        slice.model,
        slice.configuration,
        slice.featureFlags,
      ]),
    ),
    '',
    '## 2. Claim Core',
    '',
  ];

  const domains = [...new Set(claims.map((claim) => claim.atomic.slice(0, 6)))];
  for (const domain of domains) {
    const domainClaims = claims.filter((claim) =>
      claim.atomic.startsWith(domain),
    );
    lines.push(
      `### \`${domain}\``,
      '',
      renderTable(
        [
          'Claim ID',
          'Atomic ID',
          'Slice',
          'Origin Fact',
          'User job',
          'Observable Claim',
          'Assessment',
          'Evidence',
          'Environment delta',
          'Conflicts',
          'Limitations',
          'Last checked',
        ],
        domainClaims.map((claim) => [
          `\`${claim.id}\``,
          `\`${claim.atomic}\``,
          `\`${claim.slice.id}\``,
          claim.originFacts.map((id) => `\`${id}\``).join(', '),
          claim.userJob,
          claim.statement,
          assessment(claim),
          claim.evidence.map((item) => `\`${item.id}\``).join(', '),
          claim.configuration.join('; ') || 'none',
          claim.conflicts.length ? claim.conflicts.join(', ') : 'none',
          claim.limitations,
          claim.checked,
        ]),
      ),
      '',
    );
  }

  lines.push(
    '## 3. Behavior Contract Matrix',
    '',
    '编码为 `R[value]`、`CN`、`U`、`NC`、`NA`。Registry 未要求的叶为 `NA`；已要求但当前证据未调查的叶为 `NC`。',
    '',
    renderTable(
      ['Claim ID', ...phase1D1LeafOrder],
      claims.map((claim) => [
        `\`${claim.id}\``,
        ...phase1D1LeafOrder.map((leaf) => `\`${claim.contract[leaf]}\``),
      ]),
    ),
    '',
    '## 4. Evidence Relation Extension',
    '',
    '一行列出多个 Claim ID 时，规范化展开后等价于逐 Claim 的独立 `record_relations`。',
    '',
    renderTable(
      ['Evidence ID', 'Relation', 'Claim ID(s)', 'Note'],
      relationRows(claims).map((row) => [
        `\`${row.id}\``,
        `\`${row.relation}\``,
        row.claims.map((id) => `\`${id}\``).join(', '),
        row.note,
      ]),
    ),
    '',
  );
  return `${lines.join('\n')}\n`;
}

function formatMarkdown(content, file) {
  if (!fs.existsSync(prettier)) return content;
  return execFileSync(
    prettier,
    ['--ignore-path', '/dev/null', '--stdin-filepath', file],
    {
      cwd: repoRoot,
      input: content,
      encoding: 'utf8',
    },
  );
}

function relationCount(claims) {
  return claims.reduce((sum, claim) => sum + claim.evidence.length, 0);
}

function valueCounts(claims, key) {
  const counts = {};
  for (const claim of claims) {
    counts[claim[key]] = (counts[claim[key]] ?? 0) + 1;
  }
  return counts;
}

function sameObject(left, right) {
  return (
    JSON.stringify(Object.entries(left).sort()) ===
    JSON.stringify(Object.entries(right).sort())
  );
}

function assertBuild(claims, registry, baselineClaims) {
  assert(registry.size === 550, `expected Registry 550, got ${registry.size}`);
  const allClaims = Object.values(claims).flat();
  const slicesById = new Map();
  assert(
    new Set(allClaims.map(({ id }) => id)).size === allClaims.length,
    'duplicate Phase 1D.1 Claim ID',
  );
  for (const [product, productClaims] of Object.entries(claims)) {
    assert(
      productClaims.length === expectedCounts[product],
      `${product}: expected ${expectedCounts[product]} Claims, got ${productClaims.length}`,
    );
    assert(
      sameObject(
        valueCounts(productClaims, 'support'),
        expectedSupport[product],
      ),
      `${product}: support distribution drift`,
    );
    assert(
      sameObject(
        valueCounts(productClaims, 'runtime'),
        expectedRuntime[product],
      ),
      `${product}: runtime distribution drift`,
    );
    assert(
      sameObject(
        valueCounts(productClaims, 'confidence'),
        expectedConfidence[product],
      ),
      `${product}: confidence distribution drift`,
    );
  }
  assert(
    allClaims.length === 38,
    `expected 38 Claims, got ${allClaims.length}`,
  );
  assert(
    relationCount(allClaims) === 75,
    `expected 75 relations, got ${relationCount(allClaims)}`,
  );

  const baselineIds = new Set(
    Object.values(baselineClaims)
      .flat()
      .map(({ id }) => id),
  );
  const currentIds = new Set(allClaims.map(({ id }) => id));
  const removed = [...baselineIds].filter((id) => !currentIds.has(id));
  const added = [...currentIds].filter((id) => !baselineIds.has(id));
  assert(
    JSON.stringify(removed) === JSON.stringify(['CCQ-codex-CAP-10.08-A01-001']),
    `unexpected removed Claim IDs: ${removed.join(', ')}`,
  );
  assert(
    JSON.stringify(added.sort()) ===
      JSON.stringify(
        [
          'CCQ-codex-CAP-10.07-A01-003',
          'CCQ-codex-CAP-10.07-A01-004',
          'CCQ-codex-CAP-10.08-A05-001',
          'CCQ-codex-CAP-10.08-A05-002',
          'CCQ-qwen-code-CAP-10.07-A01-002',
          'CCQ-qwen-code-CAP-10.08-A04-001',
          'CCQ-qwen-code-CAP-12.02-A02-002',
          'CCQ-qwen-code-CAP-12.05-A01-002',
          'CCQ-qwen-code-CAP-12.07-A03-002',
        ].sort(),
      ),
    `unexpected added Claim IDs: ${added.join(', ')}`,
  );

  const baselineById = new Map(
    Object.values(baselineClaims)
      .flat()
      .map((claim) => [claim.id, claim]),
  );
  const currentById = new Map(allClaims.map((claim) => [claim.id, claim]));
  const additiveStableEvidence = new Map([
    ['CCQ-codex-CAP-07.04-A01-001', new Set(['EVD-codex-SOURCE-003:supports'])],
    [
      'CCQ-codex-CAP-07.04-A02-001',
      new Set(['EVD-codex-SOURCE-003:qualifies']),
    ],
  ]);
  for (const [id, baselineClaim] of baselineById) {
    if (id === 'CCQ-codex-CAP-10.08-A01-001') continue;
    const currentClaim = currentById.get(id);
    assert(currentClaim, `${id}: stable Claim missing`);
    const current = structuredClone(currentClaim);
    current.checked = baselineClaim.checked;
    if (current.product === 'qwen-code') {
      assert(current.slice.channel === 'latest', `${id}: Qwen erratum missing`);
      current.slice.channel = baselineClaim.slice.channel;
    }
    if (id === 'CCQ-qwen-code-CAP-10.08-A01-001') {
      current.statement = baselineClaim.statement;
      current.contract.EP = baselineClaim.contract.EP;
      current.contract.EB = baselineClaim.contract.EB;
    }
    const additive = additiveStableEvidence.get(id) ?? new Set();
    current.evidence = current.evidence.filter(
      (edge) => !additive.has(`${edge.id}:${edge.relation}`),
    );
    assert(
      JSON.stringify(current) === JSON.stringify(baselineClaim),
      `${id}: stable Claim changed outside channel/last_checked/additive relation overlay`,
    );
  }
  const migrated = claimById(claims.codex, 'CCQ-codex-CAP-10.08-A05-001');
  const migrationSource = baselineById.get('CCQ-codex-CAP-10.08-A01-001');
  assert(
    JSON.stringify(migrated.slice) === JSON.stringify(migrationSource.slice),
    'Codex A01→A05 migration changed host Slice',
  );
  assert(
    JSON.stringify(migrated.originFacts) ===
      JSON.stringify(migrationSource.originFacts),
    'Codex A01→A05 migration changed Origin Fact',
  );
  const edgeKey = (evidence, claimId) =>
    JSON.stringify([evidence.id, evidence.relation, claimId, evidence.note]);
  const baselineEdges = new Set();
  for (const baselineClaim of baselineById.values()) {
    const targetId =
      baselineClaim.id === 'CCQ-codex-CAP-10.08-A01-001'
        ? 'CCQ-codex-CAP-10.08-A05-001'
        : baselineClaim.id;
    for (const evidence of baselineClaim.evidence) {
      baselineEdges.add(edgeKey(evidence, targetId));
    }
  }
  const currentEdges = new Set(
    allClaims.flatMap((claim) =>
      claim.evidence.map((evidence) => edgeKey(evidence, claim.id)),
    ),
  );
  for (const edge of baselineEdges) {
    assert(currentEdges.has(edge), `baseline relation changed: ${edge}`);
  }
  const expectedAdditionalEdges = new Set(
    [
      [
        'EVD-codex-SOURCE-003',
        'supports',
        'CCQ-codex-CAP-07.04-A01-001',
        'exact-commit source directly constructs the bounded static tool inventory',
      ],
      [
        'EVD-codex-SOURCE-003',
        'qualifies',
        'CCQ-codex-CAP-07.04-A02-001',
        'exact-commit source bounds a safe unknown-tool canary but no frozen runtime call occurred',
      ],
      [
        'EVD-codex-SOURCE-002',
        'supports',
        'CCQ-codex-CAP-10.08-A05-001',
        'exact-commit source directly supports the bounded client metadata and response-shape statement',
      ],
      [
        'EVD-codex-RUNTIME-004',
        'supports',
        'CCQ-codex-CAP-10.07-A01-003',
        'contained runtime directly records startup failure with no protocol output; input read is unproven',
      ],
      [
        'EVD-codex-RUNTIME-005',
        'supports',
        'CCQ-codex-CAP-10.07-A01-004',
        'contained runtime directly records config bootstrap failure with no protocol output; input read is unproven',
      ],
      [
        'EVD-codex-RUNTIME-004',
        'qualifies',
        'CCQ-codex-CAP-10.08-A05-002',
        'contained runtime records startup failure with no protocol output; input read is unproven and initialize was not sent',
      ],
      [
        'EVD-codex-SOURCE-002',
        'supports',
        'CCQ-codex-CAP-10.08-A05-002',
        'exact-commit source directly supports the bounded initialize request and response shape',
      ],
      [
        'EVD-qwen-code-RUNTIME-001',
        'supports',
        'CCQ-qwen-code-CAP-10.07-A01-002',
        'runtime directly proves the bounded management-route lifecycle without proving task readiness',
      ],
      [
        'EVD-qwen-code-DOC-044',
        'supports',
        'CCQ-qwen-code-CAP-10.08-A04-001',
        'exact release-commit documentation distinguishes descriptor discovery from negotiation',
      ],
      [
        'EVD-qwen-code-RUNTIME-001',
        'supports',
        'CCQ-qwen-code-CAP-10.08-A04-001',
        'exact runtime directly returned the bounded versioned descriptor',
      ],
      [
        'EVD-qwen-code-RUNTIME-002',
        'supports',
        'CCQ-qwen-code-CAP-12.02-A02-002',
        'runtime directly locates and reads the persistent diagnostic log with run/process/error context',
      ],
      [
        'EVD-qwen-code-RUNTIME-001',
        'supports',
        'CCQ-qwen-code-CAP-12.05-A01-002',
        'runtime directly distinguishes liveness, degraded bootstrap, readiness, auth rejection, and unavailable after shutdown',
      ],
      [
        'EVD-qwen-code-RUNTIME-002',
        'supports',
        'CCQ-qwen-code-CAP-12.07-A03-002',
        'runtime directly proves bounded graceful parent/listener cleanup, not crash or child-resource recovery',
      ],
    ].map((edge) => JSON.stringify(edge)),
  );
  const additionalEdges = new Set(
    [...currentEdges].filter((edge) => !baselineEdges.has(edge)),
  );
  assert(
    JSON.stringify([...additionalEdges].sort()) ===
      JSON.stringify([...expectedAdditionalEdges].sort()),
    'Phase 1D.1 relation overlay drift',
  );

  const newEvidenceCounts = Object.fromEntries(
    Object.keys(newEvidenceRelationCounts).map((id) => [id, 0]),
  );
  const relationTypes = {};
  const assessmentEnums = {
    epistemic: new Set(['Confirmed', 'Inferred', 'Unknown']),
    documentation: new Set([
      'Documented',
      'Undocumented',
      'Not checked',
      'Not applicable',
    ]),
    runtime: new Set([
      'Reproduced',
      'Not reproduced',
      'Not tested',
      'Not applicable',
    ]),
    support: new Set(['Supported', 'Partial', 'Not supported', 'Unknown']),
    lifecycle: new Set([
      'stable',
      'preview',
      'experimental',
      'alpha',
      'deprecated',
      'removed',
      'dev-only',
      'unknown',
      'not-checked',
      'not-applicable',
    ]),
    future: new Set([
      'none',
      'announced',
      'roadmap',
      'unknown',
      'not-checked',
      'not-applicable',
    ]),
    confidence: new Set(['High', 'Medium', 'Low']),
  };
  const relationKeys = new Set();
  let requiredLeafCount = 0;
  for (const claim of allClaims) {
    const priorSlice = slicesById.get(claim.slice.id);
    assert(
      !priorSlice || JSON.stringify(priorSlice) === JSON.stringify(claim.slice),
      `${claim.id}: conflicting metadata for Slice ${claim.slice.id}`,
    );
    slicesById.set(claim.slice.id, claim.slice);
    assert(registry.has(claim.atomic), `${claim.id}: unknown Atomic`);
    assert(
      claim.slice.product === productMeta[claim.product].label,
      `${claim.id}: Slice Product mismatch`,
    );
    if (claim.product === 'qwen-code') {
      assert(
        claim.slice.channel === 'latest',
        `${claim.id}: Qwen identity erratum not applied`,
      );
    }
    assert(
      claim.checked === phase1D1ReviewedAt,
      `${claim.id}: stale last_checked`,
    );
    for (const [field, values] of Object.entries(assessmentEnums)) {
      assert(values.has(claim[field]), `${claim.id}: invalid ${field}`);
    }
    for (const evidence of claim.evidence) {
      assert(evidence.note.trim(), `${claim.id}: empty Evidence relation note`);
      const relationKey = `${evidence.id}\u0000${evidence.relation}\u0000${claim.id}`;
      assert(!relationKeys.has(relationKey), `${claim.id}: duplicate relation`);
      relationKeys.add(relationKey);
      if (evidence.id in newEvidenceCounts) newEvidenceCounts[evidence.id]++;
      const key = `${claim.product}:${evidence.relation}`;
      relationTypes[key] = (relationTypes[key] ?? 0) + 1;
    }
    for (const leaf of phase1D1LeafOrder) {
      const value = claim.contract[leaf];
      assert(
        /^(R\[.+\]|CN|U|NC|NA)$/.test(value),
        `${claim.id}: invalid ${leaf}=${value}`,
      );
      if (!registry.get(claim.atomic).requiredLeaves.has(leaf)) {
        assert(value === 'NA', `${claim.id}: non-required ${leaf} must be NA`);
      }
    }
    requiredLeafCount += registry.get(claim.atomic).requiredLeaves.size;
  }
  assert(
    requiredLeafCount === 499,
    `expected 499 required leaves, got ${requiredLeafCount}`,
  );
  assert(
    sameObject(newEvidenceCounts, newEvidenceRelationCounts),
    `new Evidence relation distribution drift: ${JSON.stringify(newEvidenceCounts)}`,
  );
  assert(
    sameObject(relationTypes, {
      'codex:qualifies': 17,
      'codex:supports': 10,
      'qwen-code:qualifies': 11,
      'qwen-code:supports': 37,
    }),
    `relation type distribution drift: ${JSON.stringify(relationTypes)}`,
  );

  const qwenNegotiation = claimById(
    claims['qwen-code'],
    'CCQ-qwen-code-CAP-10.08-A01-001',
  );
  assert(
    qwenNegotiation.support === 'Not supported' &&
      qwenNegotiation.runtime === 'Not tested' &&
      qwenNegotiation.contract.EP === 'CN' &&
      qwenNegotiation.contract.EB ===
        'R[bilateral negotiation boundary distinct from /capabilities descriptor]',
    'Qwen inherited A01 disposition drift',
  );
  const qwenDescriptor = claimById(
    claims['qwen-code'],
    'CCQ-qwen-code-CAP-10.08-A04-001',
  );
  assert(
    qwenDescriptor.support === 'Partial' &&
      qwenDescriptor.runtime === 'Reproduced' &&
      qwenDescriptor.confidence === 'Medium' &&
      qwenDescriptor.contract.FS === 'NC' &&
      qwenDescriptor.contract.SB === 'NC',
    'Qwen descriptor disposition drift',
  );
  for (const id of [
    'CCQ-codex-CAP-10.07-A01-003',
    'CCQ-codex-CAP-10.07-A01-004',
  ]) {
    const claim = claimById(claims.codex, id);
    assert(
      claim.runtime === 'Not reproduced' && claim.support === 'Unknown',
      `${id}: containment failure disposition drift`,
    );
  }
  const containedInitialize = claimById(
    claims.codex,
    'CCQ-codex-CAP-10.08-A05-002',
  );
  assert(
    containedInitialize.runtime === 'Not tested' &&
      containedInitialize.support === 'Unknown' &&
      containedInitialize.documentation === 'Not checked',
    'Codex contained initialize disposition drift',
  );
  for (const id of [
    'CCQ-qwen-code-CAP-10.07-A01-002',
    'CCQ-qwen-code-CAP-10.08-A04-001',
    'CCQ-qwen-code-CAP-12.02-A02-002',
    'CCQ-qwen-code-CAP-12.05-A01-002',
    'CCQ-qwen-code-CAP-12.07-A03-002',
  ]) {
    const claim = claimById(claims['qwen-code'], id);
    assert(
      claim.lifecycle === 'not-checked' &&
        !claim.configuration.some((value) =>
          /(?:serve Help|tagged docs)/.test(value),
        ),
      `${id}: contained provenance boundary drift`,
    );
  }
}

export function buildPhase1D1({ write = false, check = true } = {}) {
  assert(!(write && check), 'write and check modes are mutually exclusive');
  assertFrozenInputs();
  const phase1C2 = buildPhase1C2({ write: false, check: true });
  const baselineCount = Object.values(phase1C2.claims)
    .flat()
    .reduce((sum, claim) => sum + claim.evidence.length, 0);
  assert(
    baselineCount === 62,
    `expected 62 baseline relations, got ${baselineCount}`,
  );

  const claims = {
    codex: buildCodexClaims(phase1C2.claims.codex, phase1C2.registry),
    'claude-code': structuredClone(phase1C2.claims['claude-code']),
    'qwen-code': buildQwenClaims(
      phase1C2.claims['qwen-code'],
      phase1C2.registry,
    ),
  };
  assertBuild(claims, phase1C2.registry, phase1C2.claims);

  const outputs = Object.fromEntries(
    Object.entries(claims).map(([product, productClaims]) => {
      const file = path.join(outputDir, `${product}-secondary-surfaces.md`);
      return [
        file,
        formatMarkdown(renderClaimDocument(product, productClaims), file),
      ];
    }),
  );
  const allowedOutputs = new Set(
    Object.keys(productMeta).map((product) =>
      path.join(outputDir, `${product}-secondary-surfaces.md`),
    ),
  );
  for (const file of Object.keys(outputs)) {
    assert(allowedOutputs.has(file), `refusing unexpected output path ${file}`);
    assert(
      path.dirname(file) === outputDir,
      `refusing output outside Phase 1D.1 directory: ${file}`,
    );
  }

  if (write) {
    fs.mkdirSync(outputDir, { recursive: true });
    for (const [file, content] of Object.entries(outputs)) {
      fs.writeFileSync(file, content);
    }
    assertFrozenInputs();
  } else if (check) {
    const drift = Object.entries(outputs)
      .filter(
        ([file, content]) =>
          !fs.existsSync(file) || fs.readFileSync(file, 'utf8') !== content,
      )
      .map(([file]) => path.relative(root, file));
    if (drift.length) {
      throw new Error(`generated content drift: ${drift.join(', ')}`);
    }
  }

  return {
    claims,
    registry: phase1C2.registry,
    baselineClaims: phase1C2.claims,
    outputs,
  };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  const write = args.includes('--write');
  const check = args.length === 0 || args.includes('--check');
  const unknown = args.filter((arg) => !['--write', '--check'].includes(arg));
  if (unknown.length || (write && check)) {
    throw new Error('Usage: generate-phase-1d1-claims.mjs [--check | --write]');
  }
  const { claims } = buildPhase1D1({ write, check });
  process.stdout.write(
    `${JSON.stringify({
      mode: write ? 'write' : 'check',
      claims: Object.fromEntries(
        Object.entries(claims).map(([product, rows]) => [product, rows.length]),
      ),
      relations: Object.values(claims)
        .flat()
        .reduce((sum, claim) => sum + claim.evidence.length, 0),
    })}\n`,
  );
}
