import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(scriptDir, '..');
const repoRoot = path.resolve(root, '../../..');
const prettier = path.join(repoRoot, 'node_modules', '.bin', 'prettier');
const outputDir = path.join(root, 'comparisons');

export const phase2AReviewedAt = '2026-07-26T08:24:57Z';
export const phase2AStatus = 'Frozen';
const phase2AReviewResult = 'Pass';

const frozenInputs = {
  '00-scope-and-version-lock.md':
    'fd178ab9b197f118c90c2db5efcac780ee2465a282585ec1df96a58f86198373',
  '03-atomic-capability-registry.md':
    '95deccb0c7c056b6e89e092ae6b9187e459afd7e0c680f6e972ec2a2c13997f5',
  'claims/codex-cli.md':
    '45a2dff2d36529241a6b91be0553a4470a3cd53d21e61f8c640ef7dbd3905724',
  'claims/claude-code-cli.md':
    '5ae1b170e9aed9bf460721a5a51870239ea10a1d5be6f3fac6e7c7b3e56dd657',
  'claims/qwen-code-cli.md':
    '7702ca8695e6c52e8bed735bfd94398ac969563f1290d3a7064bfdf4bbb56d7a',
  'claims/phase-1d1/codex-secondary-surfaces.md':
    'b7ec885b0795778147dd003126b7c79d7bb06b60e8efd0511cc5034329ece0e2',
  'claims/phase-1d1/claude-code-secondary-surfaces.md':
    '9a0092e28ce61a5ffeb8a24b0232538ca499008783d639f413cfe8ccc892541f',
  'claims/phase-1d1/qwen-code-secondary-surfaces.md':
    'eafd31711bab64b5a2e580dd59032220daddc2b090dbcbe87f48e2c7b2faac58',
};

const productFiles = {
  codex: [
    'claims/codex-cli.md',
    'claims/phase-1d1/codex-secondary-surfaces.md',
  ],
  'claude-code': [
    'claims/claude-code-cli.md',
    'claims/phase-1d1/claude-code-secondary-surfaces.md',
  ],
  'qwen-code': [
    'claims/qwen-code-cli.md',
    'claims/phase-1d1/qwen-code-secondary-surfaces.md',
  ],
};

const productLabels = {
  codex: 'Codex',
  'claude-code': 'Claude Code',
  'qwen-code': 'Qwen Code',
};

const expectedFileClaims = {
  'claims/codex-cli.md': 84,
  'claims/claude-code-cli.md': 132,
  'claims/qwen-code-cli.md': 209,
  'claims/phase-1d1/codex-secondary-surfaces.md': 11,
  'claims/phase-1d1/claude-code-secondary-surfaces.md': 0,
  'claims/phase-1d1/qwen-code-secondary-surfaces.md': 27,
};

const expectedQwenCliSlices = new Set([
  'QWN-0210-CLI-NA-UNKNOWN',
  'QWN-0210-CLI-NA-TTY',
  'QWN-0210-CLI-NA-NONTTY',
  'QWN-0210-CLI-SEATBELT-NA',
  'QWN-0210-CLI-DOCKER-NA',
  'QWN-0210-CLI-PODMAN-NA',
]);

const comparisonPlans = {
  'CAP-10.01-A01': {
    state: 'surface-only',
    conclusion:
      '三产品都有 exact-version non-interactive CLI Claim，但都未执行模型任务；当前只确认同一 Atomic 下的 pre-runtime Claim co-presence。',
    next: '在同一无 TTY fixture 中提交等价单任务，记录最终输出、stderr、exit 与副作用。',
  },
  'CAP-10.02-A01': {
    state: 'surface-only',
    conclusion:
      '三产品都记录了命令参数任务入口；缺失/非法参数和实际任务边界均未 runtime 复现。',
    next: '用相同参数矩阵运行成功、缺失与非法输入，并绑定 exact exit/output。',
  },
  'CAP-10.02-A02': {
    state: 'surface-only',
    conclusion:
      '三产品都记录了 stdin 输入 Surface；输入字节、编码、EOF 与协议污染尚不可比较。',
    next: '使用相同 UTF-8/空输入/EOF fixture，捕获 stdout、stderr 与退出状态。',
  },
  'CAP-10.03-A01': {
    state: 'surface-only',
    conclusion:
      'Claude Code 与 Qwen Code 有机器可解析最终结果的文档 Claim；两者都未产生可校验的 runtime final object，Codex 当前无该 Atomic Claim。',
    next: '先运行 Claude/Qwen 的最小 structured-final probe；Codex 需先补 exact Atomic Claim。',
  },
  'CAP-10.03-A02': {
    state: 'surface-only',
    conclusion:
      '三产品都有增量结构化事件 Surface Claim；Qwen 另有 TTY Dual Output Claim，但它不等同 non-TTY stream，当前均未验证事件终态。',
    next: '在 non-TTY 下统一验证事件解析、结束/失败事件、stdout/stderr 隔离与中断。',
  },
  'CAP-10.03-A03': {
    state: 'surface-only',
    conclusion:
      '三产品都有 schema-constrained output 的 exact Claim，但成功校验与无法满足 schema 的失败语义均未运行。',
    next: '使用同一简单 schema 与不可满足 schema，检查校验、失败对象和 exit code。',
  },
  'CAP-10.05-A04': {
    state: 'surface-only',
    conclusion:
      'Claude Code 与 Qwen Code 都有结构化自动化错误的版本化 Surface Claim；字段、partial result 与通道隔离未运行。',
    next: '注入相同非法配置和任务失败，比较机器可解析错误、partial result、stderr 与 exit。',
  },
  'CAP-10.07-A01': {
    state: 'gate-asymmetric',
    conclusion:
      'Codex runtime 只覆盖 schema generation 与 denied-home startup failure；Qwen runtime 只覆盖关闭 ACP preheat 后的 management routes。两者都未证明 task-ready 长驻服务。',
    next: '在对齐的 disposable config 与 fake provider 下启动服务，执行 task-ready、多请求、失败与 shutdown matrix。',
  },
  'CAP-10.07-A02': {
    state: 'evidence-asymmetric',
    conclusion:
      'Codex exact schema 复现 thread/start 与 turn/start shape；Qwen 只有 release-commit daemon Claim。两者都未提交任务或验证幽灵任务语义。',
    next: '使用无真实模型副作用的 fake provider，验证 accepted/rejected request、稳定 ID 与无幽灵任务。',
  },
  'CAP-10.07-A05': {
    state: 'evidence-asymmetric',
    conclusion:
      'Codex 只复现 notification schema generation；Qwen 只有 SSE/event 文档 Claim。没有产品在当前 cohort 中运行完整事件流。',
    next: '对齐 fixture task，捕获顺序、终态、断线、重连与流关闭。',
  },
  'CAP-12.02-A02': {
    state: 'evidence-asymmetric',
    conclusion:
      'Qwen contained daemon 已定位并读取 current-run persistent log；Claude Code 只有 Help Surface Claim，尚未创建或读取日志。',
    next: '在相同本地失败场景下生成两产品日志，比较定位、关联字段、持久化、过滤和 redaction。',
  },
  'CAP-12.03-A01': {
    state: 'surface-only',
    conclusion:
      'Claude Code 与 Qwen Code 都有 tracing 文档/实现 Surface Claim；两者均未启用 collector 或验证 span parentage。',
    next: '使用本地 collector 与无外发 fixture，验证 span 层级、状态、失败与敏感字段。',
  },
  'CAP-12.03-A02': {
    state: 'surface-only',
    conclusion:
      'Claude Code 与 Qwen Code 都有 metrics Surface Claim；计数器、时延、资源、错误与标签基数均未 runtime 复现。',
    next: '向本地 collector 运行固定任务，核对指标 schema、值域、标签基数和禁用行为。',
  },
  'CAP-12.03-A04': {
    state: 'surface-only',
    conclusion:
      'Claude Code 与 Qwen Code 都记录 telemetry exporter 配置 Surface；实际目标、失败、缓冲和重试未运行。',
    next: '使用本地成功/拒绝/断连 collector，验证目标选择、缓冲、重试和失败可见性。',
  },
  'CAP-12.03-A07': {
    state: 'surface-only',
    conclusion:
      'Claude Code 与 Qwen Code 都有 telemetry opt-out Claim；当前没有网络/collector runtime 证明 opt-out 后停止产生或发送哪些数据。',
    next: '在本地 collector 下对照启用/退出运行，枚举仍产生、仍发送和强制例外事件。',
  },
  'CAP-12.04-A01': {
    state: 'surface-only',
    conclusion:
      'Claude Code 与 Qwen Code 都有 correlation ID 文档 Claim；跨日志、事件、请求与重启的一致性未验证。',
    next: '运行固定会话并收集所有本地信号，正反向核对 root/session/request IDs。',
  },
  'CAP-12.05-A02': {
    state: 'surface-only',
    conclusion:
      '三产品都有本地诊断/doctor 类入口 Claim；检查项、remediation、失败副作用、隐私边界和 exit 均未运行。',
    next: '在相同缺依赖、坏配置与权限 fixture 中运行只读诊断矩阵。',
  },
  'CAP-12.07-A03': {
    state: 'gate-asymmetric',
    conclusion:
      'Claude Code 只由 changelog 描述 print-mode SIGTERM 清理 Bash process tree；Qwen runtime 只复现 daemon parent/listener graceful cleanup，未创建 child。资源对象和 gate 不对齐。',
    next: '分别建立相同 parent+child+listener fixture，运行 graceful、cancel 与 crash cleanup，并核对遗留资源。',
  },
  'CAP-12.09-A01': {
    state: 'surface-only',
    conclusion:
      'Codex 与 Qwen Code 都有分层配置解析的文档 Claim；最终值、来源层、覆盖顺序和未知项未运行。',
    next: '构造相同多层冲突配置，读取 effective value、source explanation 与 unknown-key 结果。',
  },
  'CAP-12.09-A02': {
    state: 'surface-only',
    conclusion:
      'Codex 与 Qwen Code 都有配置 schema validation Claim；未知字段、错误类型和非法组合未 runtime 验证。',
    next: '对齐 valid/unknown-key/type-error/cross-field-invalid 配置与 schema 版本。',
  },
};

function sha256(data) {
  return createHash('sha256').update(data).digest('hex');
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), 'utf8');
}

function splitRow(line) {
  return line
    .trim()
    .slice(1, -1)
    .split(/(?<!\\)\|/)
    .map((cell) => cell.trim().replaceAll('\\|', '|'));
}

function strip(value) {
  return value.replaceAll(/[*`]/g, '').trim();
}

function section(content, start, end) {
  const startIndex = content.indexOf(start);
  if (startIndex < 0) return '';
  const endIndex = end ? content.indexOf(end, startIndex + start.length) : -1;
  return content.slice(startIndex, endIndex < 0 ? content.length : endIndex);
}

function parseAssessment(value) {
  return Object.fromEntries(
    value.split('; ').map((part) => {
      const index = part.indexOf('=');
      return [part.slice(0, index), part.slice(index + 1)];
    }),
  );
}

function parseClaimFile(relativePath, product) {
  const content = read(relativePath);
  if (content.includes('> 正式 Claim：0') && !content.includes('## 1. Slice')) {
    return { slices: new Map(), claims: [] };
  }
  const slices = new Map();
  for (const line of section(
    content,
    '## 1. Slice Registry',
    '## 2. Claim Core',
  ).split('\n')) {
    if (!line.startsWith('| `')) continue;
    const cells = splitRow(line);
    if (cells.length !== 17) continue;
    const id = strip(cells[0]);
    if (!/^(?:CDX|CLC|QWN)-/.test(id)) continue;
    slices.set(id, {
      id,
      product: cells[1],
      version: strip(cells[2]),
      channel: cells[3],
      surface: cells[4],
      terminal: cells[8],
      isolation: cells[9],
      authentication: cells[10],
      configuration: cells[15],
      featureFlags: cells[16],
    });
  }
  const claims = [];
  for (const line of section(
    content,
    '## 2. Claim Core',
    '## 3. Behavior Contract Matrix',
  ).split('\n')) {
    if (!line.startsWith('| `CCQ-')) continue;
    const cells = splitRow(line);
    assert(cells.length === 12, `${relativePath}: invalid Claim row`);
    const sliceId = strip(cells[2]);
    const slice = slices.get(sliceId);
    assert(slice, `${relativePath}: missing Slice ${sliceId}`);
    claims.push({
      id: strip(cells[0]),
      atomic: strip(cells[1]),
      sliceId,
      slice,
      product,
      userJob: cells[4],
      statement: cells[5],
      assessment: parseAssessment(cells[6]),
      limitations: cells[10],
      sourceFile: relativePath,
    });
  }
  return { slices, claims };
}

function parseRegistry() {
  const records = new Map();
  for (const line of read('03-atomic-capability-registry.md').split('\n')) {
    if (!line.startsWith('| `CAP-')) continue;
    const cells = splitRow(line);
    if (cells.length !== 5) continue;
    const id = strip(cells[0]);
    if (!/^CAP-\d{2}\.\d{2}-A\d{2}$/.test(id)) continue;
    records.set(id, { id, job: cells[1], outcome: cells[2] });
  }
  return records;
}

function assertFrozenInputs() {
  for (const [relativePath, expected] of Object.entries(frozenInputs)) {
    assert(
      sha256(fs.readFileSync(path.join(root, relativePath))) === expected,
      `${relativePath}: frozen input drift`,
    );
  }
  const errata = read('evidence/phase-2a-identity-errata.md');
  for (const expected of [
    'ERR-P2A-QWEN-CLI-CHANNEL-001',
    'source_sha256: 7702ca8695e6c52e8bed735bfd94398ac969563f1290d3a7064bfdf4bbb56d7a',
    'expected_claim_count: 209',
    'recorded_value: stable',
    'effective_value: latest',
    'identity_preserved: true',
  ]) {
    assert(errata.includes(expected), `Phase 2A erratum omits ${expected}`);
  }
}

function buildCohort() {
  const claims = [];
  const files = new Map();
  for (const [product, relativePaths] of Object.entries(productFiles)) {
    for (const relativePath of relativePaths) {
      const parsed = parseClaimFile(relativePath, product);
      assert(
        parsed.claims.length === expectedFileClaims[relativePath],
        `${relativePath}: Claim count drift`,
      );
      files.set(relativePath, parsed);
      claims.push(...parsed.claims);
    }
  }
  assert(claims.length === 463, `expected 463 cohort Claims`);
  assert(
    new Set(claims.map((claim) => claim.id)).size === claims.length,
    'duplicate current cohort Claim ID',
  );

  const qwenCli = files.get('claims/qwen-code-cli.md');
  assert(
    qwenCli.claims.length === 209 &&
      qwenCli.slices.size === 6 &&
      [...qwenCli.slices.keys()].every((id) => expectedQwenCliSlices.has(id)) &&
      [...qwenCli.slices.values()].every(
        (slice) =>
          slice.product === 'Qwen Code' &&
          slice.version === '0.21.0' &&
          slice.channel === 'stable' &&
          slice.surface === 'cli',
      ) &&
      qwenCli.claims.every((claim) => expectedQwenCliSlices.has(claim.sliceId)),
    'Qwen CLI channel erratum selector drift',
  );
  return claims;
}

function productCell(claims) {
  if (!claims.length) return '—';
  return claims
    .map((claim) => {
      const channel =
        claim.sourceFile === 'claims/qwen-code-cli.md'
          ? `${claim.slice.channel} (effective latest via ERR-P2A-QWEN-CLI-CHANNEL-001)`
          : claim.slice.channel;
      return (
        `\`${claim.id}\`<br>Slice: \`${claim.sliceId}\`<br>` +
        `v=${claim.slice.version}; channel=${channel}; ` +
        `surface=${claim.slice.surface}; terminal=${claim.slice.terminal}; ` +
        `isolation=${claim.slice.isolation}; auth=${claim.slice.authentication}; ` +
        `config=${claim.slice.configuration}; flags=${claim.slice.featureFlags}; ` +
        `R=${claim.assessment.R}; S=${claim.assessment.S}`
      );
    })
    .join('<br><br>');
}

function comparisonId(atomic) {
  return `CMP-P2A-${atomic}`;
}

function stateCounts(records) {
  const result = {};
  for (const record of records) {
    result[record.state] = (result[record.state] ?? 0) + 1;
  }
  return result;
}

function assertInventory(cap10, cap12) {
  const all = [...cap10, ...cap12];
  const expectedStates = {
    'runtime-comparable': 0,
    'gate-asymmetric': 2,
    'evidence-asymmetric': 3,
    'surface-only': 15,
    'single-product': 34,
    uncovered: 41,
  };
  const actualStates = stateCounts(all);
  for (const [state, expected] of Object.entries(expectedStates)) {
    assert(
      (actualStates[state] ?? 0) === expected,
      `${state}: expected ${expected}, got ${actualStates[state] ?? 0}`,
    );
  }
  assert(
    all.every((record) => record.observedRelation === 'Not assessed'),
    'Phase 2A must not assign a behavior relation before aligned runtime',
  );

  const expectedDomains = {
    10: {
      records: 48,
      claims: 51,
      atoms: { codex: 12, 'claude-code': 9, 'qwen-code': 22 },
      claimsByProduct: { codex: 17, 'claude-code': 10, 'qwen-code': 24 },
    },
    12: {
      records: 47,
      claims: 42,
      atoms: { codex: 5, 'claude-code': 12, 'qwen-code': 20 },
      claimsByProduct: { codex: 5, 'claude-code': 12, 'qwen-code': 25 },
    },
  };
  for (const [domain, records] of Object.entries({ 10: cap10, 12: cap12 })) {
    const expected = expectedDomains[domain];
    assert(records.length === expected.records, `CAP-${domain}: record drift`);
    const claims = records.flatMap((record) =>
      Object.values(record.byProduct).flat(),
    );
    assert(
      claims.length === expected.claims,
      `CAP-${domain}: Claim inventory drift`,
    );
    for (const product of Object.keys(productFiles)) {
      const productClaims = claims.filter((claim) => claim.product === product);
      assert(
        productClaims.length === expected.claimsByProduct[product],
        `CAP-${domain}/${product}: Claim count drift`,
      );
      assert(
        new Set(productClaims.map((claim) => claim.atomic)).size ===
          expected.atoms[product],
        `CAP-${domain}/${product}: Atomic count drift`,
      );
    }
  }
}

function renderTable(headers, rows) {
  const cell = (value) =>
    String(value ?? '')
      .replaceAll('|', '\\|')
      .replaceAll('\n', '<br>');
  return [
    `| ${headers.join(' | ')} |`,
    `| ${headers.map(() => '---').join(' | ')} |`,
    ...rows.map((row) => `| ${row.map(cell).join(' | ')} |`),
  ].join('\n');
}

function buildDomain(domain, registry, cohort) {
  const prefix = `CAP-${domain}.`;
  const atomics = [...registry.values()].filter((record) =>
    record.id.startsWith(prefix),
  );
  const records = atomics.map((atomic) => {
    const byProduct = Object.fromEntries(
      Object.keys(productFiles).map((product) => [
        product,
        cohort.filter(
          (claim) => claim.product === product && claim.atomic === atomic.id,
        ),
      ]),
    );
    const presence = Object.values(byProduct).filter(
      (claims) => claims.length,
    ).length;
    const plan = comparisonPlans[atomic.id];
    let state;
    let conclusion;
    let next;
    if (presence >= 2) {
      assert(plan, `${atomic.id}: missing cross-product comparison plan`);
      state = plan.state;
      conclusion = plan.conclusion;
      next = plan.next;
    } else if (presence === 1) {
      state = 'single-product';
      const product = Object.keys(byProduct).find(
        (candidate) => byProduct[candidate].length,
      );
      conclusion = `当前 cohort 只有 ${productLabels[product]} 正式 Claim；这不证明其他产品缺失该能力。`;
      next =
        '为至少一个其他产品锁定同 Atomic 的 exact Claim，再设计 aligned runtime probe。';
    } else {
      state = 'uncovered';
      conclusion =
        '当前三产品均无正式 Claim；这是 cohort 证据空白，不是三产品共同不支持。';
      next =
        '从 exact artifact/Help/docs 建立至少一个 Claim；行为结论仍需对应 runtime Evidence。';
    }
    return {
      id: comparisonId(atomic.id),
      atomic,
      byProduct,
      state,
      observedRelation: 'Not assessed',
      conclusion,
      next,
    };
  });
  const planned = new Set(
    Object.keys(comparisonPlans).filter((id) => id.startsWith(prefix)),
  );
  const crossProduct = new Set(
    records
      .filter(
        (record) =>
          Object.values(record.byProduct).filter((claims) => claims.length)
            .length >= 2,
      )
      .map((record) => record.atomic.id),
  );
  assert(
    JSON.stringify([...planned].sort()) ===
      JSON.stringify([...crossProduct].sort()),
    `CAP-${domain}: comparison plan inventory drift`,
  );
  return records;
}

function renderDomain(domain, records) {
  const title = domain === '10' ? '自动化与编程接入' : '可观测性、可靠性与运维';
  const currentClaims = records.reduce(
    (sum, record) =>
      sum +
      Object.values(record.byProduct).reduce(
        (claimSum, claims) => claimSum + claims.length,
        0,
      ),
    0,
  );
  const candidates = records.filter((record) =>
    ['surface-only', 'evidence-asymmetric', 'gate-asymmetric'].includes(
      record.state,
    ),
  );
  const single = records.filter((record) => record.state === 'single-product');
  const uncovered = records.filter((record) => record.state === 'uncovered');
  const counts = stateCounts(records);
  const timestampLabel =
    phase2AStatus === 'Frozen' ? 'Frozen at' : 'Drafted at';
  const lines = [
    `# Phase 2A：CAP-${domain} ${title}横向比较`,
    '',
    `> 状态：${phase2AStatus}  `,
    `> ${timestampLabel}：${phase2AReviewedAt}  `,
    '> Cohort：425 exact CLI Claims + 38 current secondary Claims  ',
    `> Formal Comparison Records：${records.length}  `,
    '> Observed behavior relation：0',
    '',
    '本文比较同一 Atomic 下的冻结 Claim，不比较产品命令数量。`Not assessed` 表示现有证据不足以判定 Equivalent、Different 或 Functional overlap。',
    '',
    '比较口径见 [`15-phase-2a-comparison-cohort-and-method.md`](../15-phase-2a-comparison-cohort-and-method.md)。Qwen CLI Claim 保留 recorded `stable` Slice，并按 [`ERR-P2A-QWEN-CLI-CHANNEL-001`](../evidence/phase-2a-identity-errata.md) 仅在本 projection 中显示 effective `latest`。',
    '',
    '## 1. Coverage',
    '',
    renderTable(
      ['Metric', 'Count'],
      [
        ['Registry Atomics', records.length],
        ['Claims in this domain', currentClaims],
        ['Cross-product candidates', candidates.length],
        ['Single-product records', single.length],
        ['Uncovered records', uncovered.length],
        ['runtime-comparable', counts['runtime-comparable'] ?? 0],
        ['gate-asymmetric', counts['gate-asymmetric'] ?? 0],
        ['evidence-asymmetric', counts['evidence-asymmetric'] ?? 0],
        ['surface-only', counts['surface-only'] ?? 0],
      ],
    ),
    '',
    '## 2. Cross-product Candidates',
    '',
    renderTable(
      [
        'Comparison / Atomic',
        'Canonical user job',
        'Codex Claim set',
        'Claude Code Claim set',
        'Qwen Code Claim set',
        'Comparison state',
        'Observed relation',
        'Bounded conclusion',
        'Required next evidence',
      ],
      candidates.map((record) => [
        `\`${record.id}\`<br>\`${record.atomic.id}\``,
        record.atomic.job,
        productCell(record.byProduct.codex),
        productCell(record.byProduct['claude-code']),
        productCell(record.byProduct['qwen-code']),
        `\`${record.state}\``,
        `\`${record.observedRelation}\``,
        record.conclusion,
        record.next,
      ]),
    ),
    '',
    '## 3. Single-product Claim Presence',
    '',
    '这些记录只说明 current cohort 中哪个产品有正式 Claim，不允许反推其他产品没有对应能力。',
    '',
    renderTable(
      [
        'Comparison / Atomic',
        'Canonical user job',
        'Current Claim set',
        'Comparison state',
        'Observed relation',
        'Boundary',
        'Required next evidence',
      ],
      single.map((record) => {
        const claims = Object.values(record.byProduct).find(
          (candidate) => candidate.length,
        );
        return [
          `\`${record.id}\`<br>\`${record.atomic.id}\``,
          record.atomic.job,
          productCell(claims),
          '`single-product`',
          '`Not assessed`',
          record.conclusion,
          record.next,
        ];
      }),
    ),
    '',
    '## 4. Uncovered Atomic Records',
    '',
    renderTable(
      [
        'Comparison / Atomic',
        'Canonical user job',
        'Comparison state',
        'Observed relation',
        'Boundary',
        'Required next evidence',
      ],
      uncovered.map((record) => [
        `\`${record.id}\`<br>\`${record.atomic.id}\``,
        record.atomic.job,
        '`uncovered`',
        '`Not assessed`',
        record.conclusion,
        record.next,
      ]),
    ),
    '',
    '## 5. Review Gate',
    '',
    renderTable(
      ['Gate', 'Result'],
      [
        [
          '每个 Registry Atomic 恰有一条 Comparison Record',
          phase2AReviewResult,
        ],
        ['多产品 Claim 未被自动判为 parity 或差异', phase2AReviewResult],
        [
          'single-product / uncovered 未被写成 No counterpart',
          phase2AReviewResult,
        ],
        [
          'host 与 contained Claim 保持独立 Slice identity',
          phase2AReviewResult,
        ],
        ['未生成 Gap、优先级、总分或 roadmap', phase2AReviewResult],
      ],
    ),
    '',
  ];
  return lines.join('\n');
}

function renderCoverage(cap10, cap12) {
  const all = [...cap10, ...cap12];
  const counts = stateCounts(all);
  const timestampLabel =
    phase2AStatus === 'Frozen' ? 'Frozen at' : 'Drafted at';
  const productDomainRows = ['10', '12'].flatMap((domain) => {
    const records = domain === '10' ? cap10 : cap12;
    return Object.keys(productFiles).map((product) => {
      const claims = records.flatMap((record) => record.byProduct[product]);
      return [
        `CAP-${domain} / ${productLabels[product]}`,
        claims.length,
        new Set(claims.map((claim) => claim.atomic)).size,
        new Set(claims.map((claim) => claim.sliceId)).size,
      ];
    });
  });
  return [
    '# Phase 2A：Coverage 与 Open Comparisons',
    '',
    `> 状态：${phase2AStatus}  `,
    `> ${timestampLabel}：${phase2AReviewedAt}  `,
    '> Scope：`CAP-10` + `CAP-12`  ',
    '> Observed behavior relation：0',
    '',
    '比较口径见 [`15-phase-2a-comparison-cohort-and-method.md`](./15-phase-2a-comparison-cohort-and-method.md)；Qwen CLI channel correction 见 [`ERR-P2A-QWEN-CLI-CHANNEL-001`](./evidence/phase-2a-identity-errata.md)。',
    '',
    '## 1. Summary',
    '',
    renderTable(
      ['Metric', 'CAP-10', 'CAP-12', 'Total'],
      [
        ['Registry Comparison Records', cap10.length, cap12.length, all.length],
        [
          'Cross-product candidates',
          cap10.filter((record) =>
            ['surface-only', 'evidence-asymmetric', 'gate-asymmetric'].includes(
              record.state,
            ),
          ).length,
          cap12.filter((record) =>
            ['surface-only', 'evidence-asymmetric', 'gate-asymmetric'].includes(
              record.state,
            ),
          ).length,
          all.filter((record) =>
            ['surface-only', 'evidence-asymmetric', 'gate-asymmetric'].includes(
              record.state,
            ),
          ).length,
        ],
        [
          'Single-product',
          cap10.filter((record) => record.state === 'single-product').length,
          cap12.filter((record) => record.state === 'single-product').length,
          counts['single-product'] ?? 0,
        ],
        [
          'Uncovered',
          cap10.filter((record) => record.state === 'uncovered').length,
          cap12.filter((record) => record.state === 'uncovered').length,
          counts.uncovered ?? 0,
        ],
        [
          'runtime-comparable',
          cap10.filter((record) => record.state === 'runtime-comparable')
            .length,
          cap12.filter((record) => record.state === 'runtime-comparable')
            .length,
          counts['runtime-comparable'] ?? 0,
        ],
      ],
    ),
    '',
    renderTable(
      ['Cohort slice', 'Claims', 'Distinct Atomics', 'Distinct Slices'],
      productDomainRows,
    ),
    '',
    'Phase 2A 找到 20 个“至少两产品有正式 Claim”的候选，但没有一项通过 runtime-comparable gate。这里的 0 不是三产品没有共同能力，而是当前证据尚未在 aligned Slice/gate 下闭合同一 observable outcome。',
    '',
    '## 2. Comparison State Distribution',
    '',
    renderTable(
      ['State', 'Count', 'Meaning in this snapshot'],
      [
        [
          '`runtime-comparable`',
          counts['runtime-comparable'] ?? 0,
          '至少两产品 direct runtime 闭合同一 outcome',
        ],
        [
          '`gate-asymmetric`',
          counts['gate-asymmetric'] ?? 0,
          'bounded statements 绑定的 Surface、gate 或资源对象 materially 不对齐',
        ],
        [
          '`evidence-asymmetric`',
          counts['evidence-asymmetric'] ?? 0,
          '部分产品有 bounded runtime，其他产品仍是未测试 Claim',
        ],
        [
          '`surface-only`',
          counts['surface-only'] ?? 0,
          '只确认同一 Atomic 下 exact pre-runtime Claim co-presence',
        ],
        [
          '`single-product`',
          counts['single-product'] ?? 0,
          '当前只有一个产品存在正式 Claim',
        ],
        ['`uncovered`', counts.uncovered ?? 0, '当前三产品均无正式 Claim'],
      ],
    ),
    '',
    '## 3. Current Evidence Conclusions',
    '',
    '- 三产品的 headless single-task、argv、stdin、event stream 与 output schema 目前只有同一 Atomic 下的 pre-runtime Claim co-presence，不能写成 Surface 或行为等价。',
    '- Codex/Qwen daemon 的 runtime 子句不同：schema generation、contained startup failure 与 management routes 不能互相当作 task-ready service。',
    '- Qwen persistent log/readiness 的 bounded runtime 已闭合当前 Slice，但 Claude/Codex 对应 Atomic 缺少 aligned runtime，不能转成横向领先结论。',
    '- Claude/Qwen telemetry 当前主要是文档、changelog、binary 或 source Surface；本阶段没有启用 exporter 或外部 collector。',
    '- Claude print-mode process-tree termination 与 Qwen daemon listener cleanup 的资源对象和 gate 不同，不能判 parity。',
    '',
    '## 4. Evidence-order Backlog',
    '',
    '这是 comparison evidence 的采集顺序，不是 Qwen 产品优先级。',
    '',
    renderTable(
      ['Order', 'Scenario family', 'Aligned evidence required', 'Risk'],
      [
        [
          'E0',
          '三产品 headless core',
          '同一无 TTY fixture：single task、argv/stdin、structured final/events/schema、failure/exit',
          'R1/R2',
        ],
        [
          'E0',
          '本地 diagnostics/config',
          '相同坏配置、缺依赖与分层冲突：doctor、effective source、schema validation',
          'R1',
        ],
        [
          'E1',
          'Codex/Qwen task service',
          'disposable config + fake provider：task-ready、submit、events、multi-request、shutdown',
          'R1/R2',
        ],
        [
          'E1',
          'logs/telemetry/correlation',
          'local collector、无外发：log location/redaction、span/metric/export/opt-out、ID linkage',
          'R1',
        ],
        [
          'E1',
          'resource cleanup',
          '相同 parent+child+listener fixture：graceful、cancel、crash、failed cleanup',
          'R4',
        ],
      ],
    ),
    '',
    '## 5. Deferred Decisions',
    '',
    '在出现首个 `runtime-comparable` Comparison Record 前，不创建 parity matrix、Qwen Gap 或 roadmap。即使后续出现行为差异，也必须先判断用户影响、适用 Surface、gate 与产品策略，不能把“竞品有”直接转换为开发需求。',
    '',
    '## 6. Review Gate',
    '',
    renderTable(
      ['Gate', 'Result'],
      [
        [
          '95 个 Registry Atomic 全量覆盖为 Comparison Record',
          phase2AReviewResult,
        ],
        [
          '20 个跨产品候选均保持 observed relation=Not assessed',
          phase2AReviewResult,
        ],
        ['41 个 uncovered 记录未被写成共同不支持', phase2AReviewResult],
        [
          'Qwen CLI channel 只在 Phase 2A projection 中勘误',
          phase2AReviewResult,
        ],
        ['未生成 Gap、产品优先级、总分或 roadmap', phase2AReviewResult],
      ],
    ),
    '',
  ].join('\n');
}

function formatMarkdown(content, file) {
  if (!fs.existsSync(prettier)) return `${content.trimEnd()}\n`;
  return execFileSync(
    prettier,
    ['--ignore-path', '/dev/null', '--stdin-filepath', file],
    {
      cwd: repoRoot,
      input: `${content.trimEnd()}\n`,
      encoding: 'utf8',
      maxBuffer: 16 * 1024 * 1024,
    },
  );
}

export function buildPhase2A({ write = false, check = true } = {}) {
  assert(!(write && check), 'write and check modes are mutually exclusive');
  assertFrozenInputs();
  execFileSync(
    process.execPath,
    [path.join(scriptDir, 'validate-phase-1c.mjs')],
    { cwd: repoRoot, stdio: 'pipe' },
  );
  execFileSync(
    process.execPath,
    [path.join(scriptDir, 'validate-phase-1d1.mjs')],
    { cwd: repoRoot, stdio: 'pipe' },
  );

  const registry = parseRegistry();
  assert(registry.size === 550, 'Registry record count drift');
  const cohort = buildCohort();
  const cap10 = buildDomain('10', registry, cohort);
  const cap12 = buildDomain('12', registry, cohort);
  assert(cap10.length === 48, 'CAP-10 Registry count drift');
  assert(cap12.length === 47, 'CAP-12 Registry count drift');
  assertInventory(cap10, cap12);

  const outputs = {
    [path.join(
      outputDir,
      'phase-2a-cap10-automation-and-programmatic-access.md',
    )]: renderDomain('10', cap10),
    [path.join(outputDir, 'phase-2a-cap12-observability-and-reliability.md')]:
      renderDomain('12', cap12),
    [path.join(root, '16-phase-2a-coverage-and-open-comparisons.md')]:
      renderCoverage(cap10, cap12),
  };
  const formatted = Object.fromEntries(
    Object.entries(outputs).map(([file, content]) => [
      file,
      formatMarkdown(content, file),
    ]),
  );

  if (write) {
    fs.mkdirSync(outputDir, { recursive: true });
    for (const [file, content] of Object.entries(formatted)) {
      fs.writeFileSync(file, content);
    }
    assertFrozenInputs();
  } else if (check) {
    const drift = Object.entries(formatted)
      .filter(
        ([file, content]) =>
          !fs.existsSync(file) || fs.readFileSync(file, 'utf8') !== content,
      )
      .map(([file]) => path.relative(root, file));
    assert(!drift.length, `generated content drift: ${drift.join(', ')}`);
  }
  return { registry, cohort, cap10, cap12, outputs: formatted };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  const write = args.includes('--write');
  const check = args.length === 0 || args.includes('--check');
  const unknown = args.filter((arg) => !['--write', '--check'].includes(arg));
  if (unknown.length || (write && check)) {
    throw new Error(
      'Usage: generate-phase-2a-comparisons.mjs [--check | --write]',
    );
  }
  const result = buildPhase2A({ write, check });
  process.stdout.write(
    `${JSON.stringify({
      mode: write ? 'write' : 'check',
      cohortClaims: result.cohort.length,
      cap10: result.cap10.length,
      cap12: result.cap12.length,
      crossProductCandidates: [...result.cap10, ...result.cap12].filter(
        (record) =>
          Object.values(record.byProduct).filter((claims) => claims.length)
            .length >= 2,
      ).length,
      runtimeComparable: [...result.cap10, ...result.cap12].filter(
        (record) => record.state === 'runtime-comparable',
      ).length,
    })}\n`,
  );
}
