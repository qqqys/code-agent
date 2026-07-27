import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

import { buildPhase1C } from './generate-phase-1c-claims.mjs';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(scriptDir, '..');
const claimsDir = path.join(root, 'claims');
const repoRoot = path.resolve(root, '../../..');
const prettier = path.join(repoRoot, 'node_modules', '.bin', 'prettier');

export const phase1C2ReviewedAt = '2026-07-26T04:55:00Z';

const leafOrder = [
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

const productMeta = {
  codex: {
    label: 'Codex',
    version: '0.145.0',
    channel: 'latest',
  },
  'claude-code': {
    label: 'Claude Code',
    version: 'blocked',
    channel: 'blocked',
  },
  'qwen-code': {
    label: 'Qwen Code',
    version: '0.21.0',
    channel: 'stable',
  },
};

const codexSlices = {
  appServer: {
    id: 'CDX-0145-SDK-DAEMON-APP-SERVER-DARWIN-ARM64',
    product: 'Codex',
    version: '0.145.0',
    channel: 'latest',
    surface: 'sdk-daemon',
    os: 'Darwin',
    arch: 'arm64',
    shell: 'zsh 5.9',
    terminal: 'non-tty',
    isolation: 'host',
    authentication: 'not authenticated',
    entitlement: 'not checked',
    region: 'not-applicable',
    provider: 'not-applicable',
    model: 'not-applicable',
    configuration:
      'frozen binary; app-server Help; temp-only JSON Schema generation',
    featureFlags: 'none supplied; schema generator used --experimental',
  },
  mcpServer: {
    id: 'CDX-0145-SDK-DAEMON-MCP-SERVER-DARWIN-ARM64',
    product: 'Codex',
    version: '0.145.0',
    channel: 'latest',
    surface: 'sdk-daemon',
    os: 'Darwin',
    arch: 'arm64',
    shell: 'zsh 5.9',
    terminal: 'non-tty',
    isolation: 'host',
    authentication: 'not authenticated',
    entitlement: 'not checked',
    region: 'not-applicable',
    provider: 'not-applicable',
    model: 'not-applicable',
    configuration: 'frozen binary; mcp-server Help only',
    featureFlags: 'none supplied',
  },
};

const qwenSlices = {
  daemon: {
    id: 'QWN-0210-DAEMON-DARWIN-ARM64-NONTTY',
    product: 'Qwen Code',
    version: '0.21.0',
    channel: 'stable',
    surface: 'sdk-daemon',
    os: 'Darwin',
    arch: 'arm64',
    shell: 'zsh 5.9',
    terminal: 'non-tty',
    isolation: 'host',
    authentication: 'not authenticated',
    entitlement: 'not checked',
    region: 'not-applicable',
    provider: 'not-applicable',
    model: 'not-applicable',
    configuration: 'frozen npm entry; serve Help and tagged docs',
    featureFlags: 'none intentionally supplied',
  },
  imBot: {
    id: 'QWN-0210-IM-BOT-TAGGED-DOCS',
    product: 'Qwen Code',
    version: '0.21.0',
    channel: 'stable',
    surface: 'im-bot',
    os: 'not-applicable',
    arch: 'not-applicable',
    shell: 'not-applicable',
    terminal: 'not-applicable',
    isolation: 'unknown',
    authentication: 'not tested',
    entitlement: 'not checked',
    region: 'not-applicable',
    provider: 'not-applicable',
    model: 'not-applicable',
    configuration:
      'frozen npm artifact plus channel docs pinned to release commit',
    featureFlags: 'not checked',
  },
};

const codexRows = [
  {
    fact: 'FACT-codex-031',
    atomic: 'CAP-07.04-A01',
    slice: codexSlices.mcpServer,
    statement:
      '冻结 mcp-server Help 只确认 stdio server 入口；当前官方文档描述 codex 与 codex-reply 工具，但 0.145.0 未执行 initialize、tools/list 或工具发现。',
    evidence: [
      relation(
        'EVD-codex-HELP-006',
        'qualifies',
        'exact Help confirms only the MCP server entry, not tool discovery',
      ),
      relation(
        'EVD-codex-DOC-025',
        'qualifies',
        'same-surface current docs describe tool inventory but are not version-bound',
      ),
    ],
    lifecycle: 'not-checked',
    runtime: 'Not tested',
    contract: {
      EP: 'R[codex mcp-server]',
      EB: 'R[MCP server over stdio]',
      OB: 'R[frozen Help output]',
    },
  },
  {
    fact: 'FACT-codex-031',
    atomic: 'CAP-07.04-A02',
    slice: codexSlices.mcpServer,
    statement:
      '冻结 mcp-server Help 只确认 stdio server 入口；当前官方文档描述 codex 与 codex-reply 调用合同，但 0.145.0 未调用任何 MCP 工具。',
    evidence: [
      relation(
        'EVD-codex-HELP-006',
        'qualifies',
        'exact Help confirms only the MCP server entry, not a tool call',
      ),
      relation(
        'EVD-codex-DOC-025',
        'qualifies',
        'same-surface current docs describe calls but are not version-bound',
      ),
    ],
    lifecycle: 'not-checked',
    runtime: 'Not tested',
    contract: {
      EP: 'R[codex mcp-server]',
      EB: 'R[MCP server over stdio]',
      OB: 'R[frozen Help output]',
    },
  },
  {
    fact: 'FACT-codex-047',
    atomic: 'CAP-10.07-A01',
    slice: codexSlices.appServer,
    statement:
      '冻结 app-server Help 公开 stdio、Unix socket 与 WebSocket 启动入口；schema 生成成功，但未启动可处理多个请求的服务或验证关闭与失败状态。',
    evidence: [
      relation(
        'EVD-codex-HELP-006',
        'supports',
        'exact Help directly supports the bounded app-server entry and transport statement',
      ),
      relation(
        'EVD-codex-RUNTIME-003',
        'qualifies',
        'schema generation proves protocol artifact generation, not service startup',
      ),
      relation(
        'EVD-codex-DOC-024',
        'qualifies',
        'same-surface current docs constrain the protocol but are not version-bound',
      ),
    ],
    lifecycle: 'experimental',
    runtime: 'Reproduced',
    contract: {
      EP: 'R[codex app-server]',
      IN: 'R[listen=stdio, unix socket, or WebSocket]',
      AG: 'R[experimental Help surface]',
      OH: 'R[Help exit 0]',
      EB: 'R[app-server protocol boundary]',
      OB: 'R[frozen Help output]',
    },
  },
  {
    fact: 'FACT-codex-047',
    atomic: 'CAP-10.07-A02',
    slice: codexSlices.appServer,
    statement:
      '冻结 binary 生成的 v2 schema 包含 thread/start 与 turn/start 方法及参数/响应类型；未提交真实任务，也未验证任务身份、拒绝或幽灵任务语义。',
    evidence: [
      relation(
        'EVD-codex-HELP-006',
        'qualifies',
        'exact Help exposes schema tooling but not task submission behavior',
      ),
      relation(
        'EVD-codex-RUNTIME-003',
        'supports',
        'generated exact-version schema directly contains thread/start and turn/start',
      ),
      relation(
        'EVD-codex-DOC-024',
        'qualifies',
        'same-surface current docs constrain JSON-RPC behavior but are not version-bound',
      ),
    ],
    lifecycle: 'experimental',
    runtime: 'Reproduced',
    contract: {
      EP: 'R[thread/start; turn/start schema methods]',
      IN: 'R[ThreadStartParams; TurnStartParams]',
      OH: 'R[ThreadStartResponse; TurnStartResponse]',
      EB: 'R[generated app-server JSON Schema]',
      OB: 'R[exact generated schema bundle]',
    },
  },
  {
    fact: 'FACT-codex-047',
    atomic: 'CAP-10.07-A05',
    slice: codexSlices.appServer,
    statement:
      '冻结 binary 生成的 v2 schema 包含 item/started、item/completed 与多种 delta notification；未启动事件流或验证顺序、断线、重连与终止。',
    evidence: [
      relation(
        'EVD-codex-HELP-006',
        'qualifies',
        'exact Help exposes schema tooling but not event delivery',
      ),
      relation(
        'EVD-codex-RUNTIME-003',
        'supports',
        'generated exact-version schema directly contains typed notification methods',
      ),
      relation(
        'EVD-codex-DOC-024',
        'qualifies',
        'same-surface current docs constrain event behavior but are not version-bound',
      ),
    ],
    lifecycle: 'experimental',
    runtime: 'Reproduced',
    contract: {
      EP: 'R[item/started; item/completed schema methods]',
      OH: 'R[typed notification schemas]',
      EB: 'R[generated app-server JSON Schema]',
      OB: 'R[exact generated schema bundle]',
    },
  },
  {
    fact: 'FACT-codex-047',
    atomic: 'CAP-10.08-A01',
    slice: codexSlices.appServer,
    statement:
      '冻结 binary 生成的 v2 schema 包含 initialize、InitializeParams 与 InitializeResponse；未建立连接或验证版本/能力交换、拒绝及降级。',
    evidence: [
      relation(
        'EVD-codex-HELP-006',
        'qualifies',
        'exact Help exposes the server and schema tooling but not negotiation',
      ),
      relation(
        'EVD-codex-RUNTIME-003',
        'supports',
        'generated exact-version schema directly contains initialize request types',
      ),
      relation(
        'EVD-codex-DOC-024',
        'qualifies',
        'same-surface current docs constrain initialization but are not version-bound',
      ),
    ],
    lifecycle: 'experimental',
    runtime: 'Reproduced',
    contract: {
      EP: 'R[initialize schema method]',
      IN: 'R[InitializeParams]',
      OH: 'R[InitializeResponse]',
      EB: 'R[generated app-server JSON Schema]',
      OB: 'R[exact generated schema bundle]',
    },
  },
  {
    fact: 'FACT-codex-048',
    atomic: 'CAP-10.07-A01',
    slice: codexSlices.mcpServer,
    statement:
      '冻结 Help 公开 codex mcp-server stdio 入口；未启动 server，因而未确认多请求处理、关闭或失败状态。',
    evidence: [
      relation(
        'EVD-codex-HELP-006',
        'supports',
        'exact Help directly supports the bounded MCP server entry statement',
      ),
      relation(
        'EVD-codex-DOC-025',
        'qualifies',
        'same-surface current docs constrain the server role but are not version-bound',
      ),
    ],
    lifecycle: 'not-checked',
    runtime: 'Not tested',
    contract: {
      EP: 'R[codex mcp-server]',
      IN: 'R[stdio transport]',
      EB: 'R[MCP server boundary]',
      OB: 'R[frozen Help output]',
    },
  },
  {
    fact: 'FACT-codex-048',
    atomic: 'CAP-10.07-A02',
    slice: codexSlices.mcpServer,
    statement:
      '冻结 Help 公开 codex mcp-server stdio 入口；当前官方文档描述由工具新建或继续 session，但 0.145.0 未提交任务或验证任务身份与拒绝语义。',
    evidence: [
      relation(
        'EVD-codex-HELP-006',
        'qualifies',
        'exact Help confirms only the MCP server entry, not task submission',
      ),
      relation(
        'EVD-codex-DOC-025',
        'qualifies',
        'same-surface current docs describe submission semantics but are not version-bound',
      ),
    ],
    lifecycle: 'not-checked',
    runtime: 'Not tested',
    contract: {
      EP: 'R[codex mcp-server]',
      EB: 'R[MCP server boundary]',
      OB: 'R[frozen Help output]',
    },
  },
];

const qwenGroups = [
  {
    fact: 'FACT-qwen-code-004',
    slice: qwenSlices.daemon,
    atomics: ['CAP-01.09-A01', 'CAP-01.09-A02'],
    lifecycle: 'experimental',
    evidence: ['EVD-qwen-code-HELP-005', 'EVD-qwen-code-DOC-028'],
  },
  {
    fact: 'FACT-qwen-code-042',
    slice: qwenSlices.daemon,
    atomics: [
      'CAP-10.07-A01',
      'CAP-10.07-A02',
      'CAP-10.07-A03',
      'CAP-10.07-A04',
      'CAP-10.07-A05',
      'CAP-10.08-A01',
      'CAP-10.08-A02',
      'CAP-10.08-A03',
    ],
    lifecycle: 'experimental',
    evidence: ['EVD-qwen-code-HELP-005', 'EVD-qwen-code-DOC-028'],
  },
  {
    fact: 'FACT-qwen-code-052',
    slice: qwenSlices.imBot,
    atomics: ['CAP-10.11-A01', 'CAP-10.11-A02', 'CAP-10.11-A03'],
    lifecycle: 'not-checked',
    evidence: ['EVD-qwen-code-DOC-018', 'EVD-qwen-code-SOURCE-009'],
  },
  {
    fact: 'FACT-qwen-code-050',
    slice: qwenSlices.daemon,
    atomics: [
      'CAP-12.02-A02',
      'CAP-12.05-A01',
      'CAP-12.07-A02',
      'CAP-12.07-A03',
      'CAP-12.08-A02',
      'CAP-12.08-A03',
      'CAP-12.08-A04',
    ],
    lifecycle: 'experimental',
    evidence: ['EVD-qwen-code-HELP-005', 'EVD-qwen-code-DOC-028'],
  },
  {
    fact: 'FACT-qwen-code-053',
    slice: qwenSlices.daemon,
    atomics: ['CAP-12.03-A01', 'CAP-12.03-A02'],
    lifecycle: 'experimental',
    evidence: ['EVD-qwen-code-DOC-043'],
  },
];

function relation(id, relationType, note) {
  return { id, relation: relationType, note };
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

function emptyContract(registryRecord) {
  return Object.fromEntries(
    leafOrder.map((leaf) => [
      leaf,
      registryRecord.requiredLeaves.has(leaf) ? 'NC' : 'NA',
    ]),
  );
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

function evidenceRelationsForQwen(group, atomic) {
  return group.evidence.map((id) => {
    const helpOnlyQualifies =
      id === 'EVD-qwen-code-HELP-005' &&
      ((group.fact === 'FACT-qwen-code-042' && atomic !== 'CAP-10.07-A01') ||
        (group.fact === 'FACT-qwen-code-050' && atomic === 'CAP-12.02-A02'));
    const artifactOnlyQualifies = id === 'EVD-qwen-code-SOURCE-009';
    const qualifies = helpOnlyQualifies || artifactOnlyQualifies;
    return relation(
      id,
      qualifies ? 'qualifies' : 'supports',
      artifactOnlyQualifies
        ? 'exact release artifact qualifies implementation and release attribution, not runtime behavior'
        : helpOnlyQualifies
          ? 'exact Help qualifies daemon discoverability but not this protocol behavior'
          : id.includes('-HELP-')
            ? 'supports the bounded exact-version Help statement only'
            : 'supports the bounded release-commit documentation statement only',
    );
  });
}

function buildQwenRows(registry, facts) {
  const factMap = new Map(facts.map((fact) => [fact.id, fact]));
  const rows = [];
  for (const group of qwenGroups) {
    const fact = factMap.get(group.fact);
    for (const atomic of group.atomics) {
      const registryRecord = registry.get(atomic);
      const contract = emptyContract(registryRecord);
      let support = 'Unknown';
      let future = 'not-checked';
      let claimEvidence = evidenceRelationsForQwen(group, atomic);
      let statement = `0.21.0 release-commit Evidence 将“${registryRecord.job}”映射到 ${group.slice.surface} Surface；“${registryRecord.outcome}”尚未通过运行闭合。`;
      if (group.fact === 'FACT-qwen-code-052') {
        statement = `0.21.0 npm artifact 内含 generic channel core，release-commit 文档将“${registryRecord.job}”映射到 im-bot Surface；“${registryRecord.outcome}”尚未通过运行闭合。`;
      }
      if (group.fact === 'FACT-qwen-code-004') {
        if (atomic === 'CAP-01.09-A01') {
          support = 'Supported';
          statement =
            '冻结 qwen serve Help 将 HTTP bridge/daemon Surface 明确标为 Stage 1 experimental；该生命周期分类可直接归因于 0.21.0。';
          Object.assign(contract, {
            IN: 'R[qwen serve at version 0.21.0]',
            AD: 'NA',
            AG: 'R[frozen Help surface]',
            OH: 'R[Stage 1 experimental label]',
            OB: 'R[serve Help output]',
          });
        } else {
          statement =
            '冻结 qwen serve Help 显示 --http-bridge flag 的声明默认值为 true；未在干净配置中启动 daemon，默认状态、启停、持久与失败语义均未闭合。';
          Object.assign(contract, {
            EP: 'R[qwen serve --http-bridge]',
            IN: 'R[boolean bridge flag]',
            AD: 'R[default-on]',
            AG: 'R[Stage 1 experimental serve]',
            OH: 'R[Help default value]',
            OB: 'R[serve Help output]',
          });
        }
      }
      if (group.fact === 'FACT-qwen-code-042' && atomic === 'CAP-10.08-A01') {
        support = 'Not supported';
        future = 'announced';
        statement =
          '0.21.0 的 qwen serve 文档把 /capabilities 实际 feature negotiation 明列为后续工作；当前只描述单向 capability discovery，不满足双向版本/能力协商。';
        claimEvidence = [
          relation(
            'EVD-qwen-code-HELP-005',
            'qualifies',
            'exact Help qualifies daemon discoverability but not negotiation',
          ),
          relation(
            'EVD-qwen-code-DOC-044',
            'supports',
            'bounded release-commit excerpt directly supports the scoped negative statement',
          ),
        ];
        Object.assign(contract, {
          EP: 'R[/capabilities discovery]',
          AG: 'R[Stage 1 experimental daemon]',
          OH: 'R[feature negotiation listed as future work]',
          EB: 'R[HTTP daemon capability endpoint]',
          OB: 'R[tagged qwen serve documentation]',
        });
      }
      rows.push({
        product: 'qwen-code',
        atomic,
        slice: group.slice,
        originFacts: [group.fact],
        userJob: registryRecord.job,
        statement,
        epistemic: 'Confirmed',
        documentation: 'Documented',
        runtime: 'Not tested',
        support,
        lifecycle: group.lifecycle,
        future,
        confidence: support === 'Supported' ? 'High' : 'Medium',
        conflicts: [],
        evidence: claimEvidence,
        configuration: [group.slice.configuration],
        limitations: fact.limitations,
        checked: phase1C2ReviewedAt,
        contract,
      });
    }
  }
  return rows;
}

function buildCodexRows(registry, facts) {
  const factMap = new Map(facts.map((fact) => [fact.id, fact]));
  return codexRows.map((row) => {
    const fact = factMap.get(row.fact);
    return {
      product: 'codex',
      atomic: row.atomic,
      slice: row.slice,
      originFacts: [row.fact],
      userJob: registry.get(row.atomic).job,
      statement: row.statement,
      epistemic: 'Confirmed',
      documentation: 'Documented',
      runtime: row.runtime,
      support: 'Unknown',
      lifecycle: row.lifecycle,
      future: 'not-checked',
      confidence: 'Medium',
      conflicts: [],
      evidence: row.evidence,
      configuration: [row.slice.configuration],
      limitations: fact.limitations,
      checked: phase1C2ReviewedAt,
      contract: {
        ...emptyContract(registry.get(row.atomic)),
        ...row.contract,
      },
    };
  });
}

function assignClaimIds(claims, phase1C1Claims) {
  const counters = new Map();
  for (const claim of Object.values(phase1C1Claims).flat()) {
    const key = `${claim.product}:${claim.atomic}`;
    const sequence = Number(claim.id.slice(-3));
    counters.set(key, Math.max(counters.get(key) ?? 0, sequence));
  }
  for (const claim of claims) {
    const key = `${claim.product}:${claim.atomic}`;
    const sequence = (counters.get(key) ?? 0) + 1;
    counters.set(key, sequence);
    claim.id = `CCQ-${claim.product}-${claim.atomic}-${String(sequence).padStart(3, '0')}`;
  }
}

function relationRows(claims) {
  const grouped = new Map();
  for (const claim of claims) {
    for (const evidence of claim.evidence) {
      const key = `${evidence.id}\u0000${evidence.relation}\u0000${evidence.note}`;
      const group = grouped.get(key) ?? {
        ...evidence,
        claims: [],
      };
      group.claims.push(claim.id);
      grouped.set(key, group);
    }
  }
  const rows = [];
  for (const group of grouped.values()) {
    for (let index = 0; index < group.claims.length; index += 12) {
      rows.push({
        ...group,
        claims: group.claims.slice(index, index + 12),
      });
    }
  }
  return rows;
}

function renderClaimDocument(product, claims) {
  const meta = productMeta[product];
  const slices = [
    ...new Map(claims.map((claim) => [claim.slice.id, claim.slice])).values(),
  ];
  const lines = [
    `# ${meta.label} Secondary Surfaces：Phase 1C.2 Claim Records`,
    '',
    `> 正式 Claim：${claims.length}  `,
    `> 版本：${meta.version}  `,
    `> Channel：${meta.channel}  `,
    `> Surface：${claims.length ? [...new Set(claims.map((claim) => claim.slice.surface))].map((surface) => `\`${surface}\``).join('、') : 'none'}  `,
    `> Claim last_checked：${phase1C2ReviewedAt}`,
    '',
    '本文沿用 Phase 1C.1 的关系型 Claim 投影。这里的 `supports` 只表示 Evidence 直接支持当前有界陈述；Atomic 的完整可观察结果是否闭合，仍以 `support_state` 为准。',
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

  if (!claims.length) {
    lines.push(
      '当前没有可绑定 exact secondary Surface build/package/commit 的正式 Claim。候选项全部保留在 [`09-phase-1c2-coverage-and-open-claims.md`](../09-phase-1c2-coverage-and-open-claims.md) 的 Blocked Register。',
      '',
    );
  }

  lines.push(
    '## 3. Behavior Contract Matrix',
    '',
    '编码沿用 [`06-phase-1c-claim-normalization.md`](../06-phase-1c-claim-normalization.md)：`R[value]`、`CN`、`U`、`NC`、`NA`。Registry 未要求的叶为 `NA`；已要求但当前证据未调查的叶为 `NC`。',
    '',
    renderTable(
      ['Claim ID', ...leafOrder],
      claims.map((claim) => [
        `\`${claim.id}\``,
        ...leafOrder.map((leaf) => `\`${claim.contract[leaf]}\``),
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

function assertBuild(claims, registry) {
  const errors = [];
  const ids = new Set();
  for (const [product, productClaims] of Object.entries(claims)) {
    for (const claim of productClaims) {
      if (ids.has(claim.id)) errors.push(`duplicate Claim ID ${claim.id}`);
      ids.add(claim.id);
      if (!registry.has(claim.atomic)) {
        errors.push(`${claim.id}: unknown Atomic ${claim.atomic}`);
      }
      if (claim.slice.surface === 'cli') {
        errors.push(`${claim.id}: CLI leaked into Phase 1C.2`);
      }
      if (/docs@|current|blocked/.test(claim.slice.version)) {
        errors.push(`${claim.id}: non-exact Claim version`);
      }
      for (const leaf of leafOrder) {
        if (!/^(R\[.+\]|CN|U|NC|NA)$/.test(claim.contract[leaf])) {
          errors.push(`${claim.id}: invalid ${leaf}=${claim.contract[leaf]}`);
        }
        if (
          !registry.get(claim.atomic).requiredLeaves.has(leaf) &&
          claim.contract[leaf] !== 'NA'
        ) {
          errors.push(`${claim.id}: non-required ${leaf} must be NA`);
        }
      }
    }
  }
  if (errors.length) throw new Error(errors.join('\n'));
}

export function buildPhase1C2({ write = true, check = false } = {}) {
  const phase1C1 = buildPhase1C({ write: false });
  const claims = {
    codex: buildCodexRows(phase1C1.registry, phase1C1.facts.codex),
    'claude-code': [],
    'qwen-code': buildQwenRows(phase1C1.registry, phase1C1.facts['qwen-code']),
  };
  assignClaimIds([...claims.codex, ...claims['qwen-code']], phase1C1.claims);
  assertBuild(claims, phase1C1.registry);

  const outputs = Object.fromEntries(
    Object.entries(claims).map(([product, productClaims]) => {
      const file = path.join(claimsDir, `${product}-secondary-surfaces.md`);
      return [
        file,
        formatMarkdown(renderClaimDocument(product, productClaims), file),
      ];
    }),
  );

  if (check) {
    const drift = Object.entries(outputs)
      .filter(
        ([file, content]) =>
          !fs.existsSync(file) || fs.readFileSync(file, 'utf8') !== content,
      )
      .map(([file]) => path.relative(root, file));
    if (drift.length) {
      throw new Error(`generated content drift: ${drift.join(', ')}`);
    }
  } else if (write) {
    fs.mkdirSync(claimsDir, { recursive: true });
    for (const [file, content] of Object.entries(outputs)) {
      fs.writeFileSync(file, content);
    }
  }

  return {
    claims,
    registry: phase1C1.registry,
    phase1C1Claims: phase1C1.claims,
    outputs,
  };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const check = process.argv.includes('--check');
  const { claims } = buildPhase1C2({ write: !check, check });
  process.stdout.write(
    `${JSON.stringify(
      Object.fromEntries(
        Object.entries(claims).map(([product, rows]) => [product, rows.length]),
      ),
    )}\n`,
  );
}
