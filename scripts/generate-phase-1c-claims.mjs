import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(scriptDir, '..');
const factsDir = path.join(root, 'facts');
const evidenceDir = path.join(root, 'evidence');
const claimsDir = path.join(root, 'claims');
const phase1CReviewedAt = '2026-07-25T21:40:12Z';

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

const dimensionLeaves = {
  ENTRY: ['EP'],
  INPUT: ['IN'],
  AVAIL: ['AD', 'AG'],
  SIDEFX: ['SX'],
  STATE: ['SO'],
  PERSIST: ['PE'],
  OUTPUT: ['OH'],
  MODES: ['RM'],
  CONC: ['CE', 'CC', 'CL'],
  FAIL: ['FS'],
  EXT: ['EB'],
  SEC: ['SB'],
  OBS: ['OB'],
};

const productMeta = {
  codex: {
    label: 'Codex',
    factFile: 'codex.md',
    evidenceFile: 'codex.md',
  },
  'claude-code': {
    label: 'Claude Code',
    factFile: 'claude-code.md',
    evidenceFile: 'claude-code.md',
  },
  'qwen-code': {
    label: 'Qwen Code',
    factFile: 'qwen-code.md',
    evidenceFile: 'qwen-code.md',
  },
};

const codexStandardFacts = new Set([
  'FACT-codex-003',
  'FACT-codex-005',
  'FACT-codex-006',
  'FACT-codex-007',
  'FACT-codex-010',
  'FACT-codex-011',
  'FACT-codex-014',
  'FACT-codex-016',
  'FACT-codex-017',
  'FACT-codex-021',
  'FACT-codex-022',
  'FACT-codex-023',
  'FACT-codex-024',
  'FACT-codex-025',
  'FACT-codex-028',
  'FACT-codex-030',
  'FACT-codex-032',
  'FACT-codex-041',
  'FACT-codex-042',
  'FACT-codex-045',
  'FACT-codex-050',
  'FACT-codex-052',
  'FACT-codex-056',
  'FACT-codex-057',
  'FACT-codex-059',
]);

const codexExperimentalFacts = new Set([
  'FACT-codex-010',
  'FACT-codex-023',
  'FACT-codex-041',
  'FACT-codex-050',
]);

const codexExactAtomFilters = new Map([
  ['FACT-codex-014', new Set(['CAP-03.11-A02'])],
  ['FACT-codex-028', new Set(['CAP-06.01-A03'])],
  ['FACT-codex-041', new Set(['CAP-08.12-A01'])],
  ['FACT-codex-042', new Set(['CAP-09.03-A01'])],
]);

const claudeDeferred = new Map([
  ['FACT-claude-code-008', new Set(['CAP-02.09-A04'])],
  ['FACT-claude-code-017', '*'],
  ['FACT-claude-code-019', '*'],
  ['FACT-claude-code-035', '*'],
  ['FACT-claude-code-042', '*'],
  ['FACT-claude-code-057', '*'],
]);

const claudeEvidenceOverrides = new Map([
  [
    '047:CAP-11.09-A01',
    ['EVD-claude-code-DOC-022', 'EVD-claude-code-CHANGELOG-001'],
  ],
  ['047:CAP-11.09-A02', ['EVD-claude-code-DOC-022']],
  ['047:CAP-11.09-A05', ['EVD-claude-code-HELP-001']],
]);

const qwenExcludedFacts = new Set([
  'FACT-qwen-code-003',
  'FACT-qwen-code-004',
  'FACT-qwen-code-008',
  'FACT-qwen-code-037',
  'FACT-qwen-code-041',
  'FACT-qwen-code-042',
  'FACT-qwen-code-050',
  'FACT-qwen-code-052',
  'FACT-qwen-code-053',
]);

const qwenEvidenceOverrides = new Map([
  ['001:CAP-01.01-A02', ['EVD-qwen-code-META-002']],
  [
    '001:CAP-01.03-A02',
    [
      'EVD-qwen-code-META-001',
      'EVD-qwen-code-META-002',
      'EVD-qwen-code-HELP-001',
    ],
  ],
  ['001:CAP-01.05-A03', ['EVD-qwen-code-META-002']],
  ['002:CAP-01.01-A01', ['EVD-qwen-code-DOC-001']],
  ['002:CAP-01.01-A02', ['EVD-qwen-code-DOC-001', 'EVD-qwen-code-META-002']],
  ['002:CAP-01.01-A03', ['EVD-qwen-code-DOC-001']],
  ['005:CAP-02.01-A01', ['EVD-qwen-code-DOC-001', 'EVD-qwen-code-DOC-002']],
  ['005:CAP-02.02-A01', ['EVD-qwen-code-DOC-002']],
  ['005:CAP-02.02-A02', ['EVD-qwen-code-DOC-002']],
  ['005:CAP-02.02-A03', ['EVD-qwen-code-DOC-002']],
  ['005:CAP-02.02-A04', ['EVD-qwen-code-DOC-002']],
  [
    '007:CAP-02.10-A02',
    ['EVD-qwen-code-DOC-002', 'EVD-qwen-code-DOC-004', 'EVD-qwen-code-DOC-007'],
  ],
  [
    '007:CAP-02.10-A05',
    ['EVD-qwen-code-DOC-002', 'EVD-qwen-code-DOC-003', 'EVD-qwen-code-DOC-007'],
  ],
  ['012:CAP-03.07-A01', ['EVD-qwen-code-TEST-001']],
  ['012:CAP-03.07-A02', ['EVD-qwen-code-TEST-001']],
  ['012:CAP-03.12-A01', ['EVD-qwen-code-SOURCE-007', 'EVD-qwen-code-TEST-002']],
  ['012:CAP-03.12-A02', ['EVD-qwen-code-DOC-008', 'EVD-qwen-code-TEST-001']],
  ['015:CAP-04.09-A01', ['EVD-qwen-code-DOC-002', 'EVD-qwen-code-HELP-003']],
  ['015:CAP-04.09-A02', ['EVD-qwen-code-DOC-002']],
  ['015:CAP-04.09-A03', ['EVD-qwen-code-HELP-003']],
  ['015:CAP-04.09-A05', ['EVD-qwen-code-DOC-002']],
  ['015:CAP-04.10-A01', ['EVD-qwen-code-DOC-002', 'EVD-qwen-code-HELP-001']],
  ['015:CAP-04.10-A02', ['EVD-qwen-code-DOC-002', 'EVD-qwen-code-HELP-001']],
  ['015:CAP-04.10-A03', ['EVD-qwen-code-DOC-002']],
  ['015:CAP-04.10-A04', ['EVD-qwen-code-DOC-002']],
  ['016:CAP-04.06-A01', ['EVD-qwen-code-DOC-002']],
  ['016:CAP-04.06-A02', ['EVD-qwen-code-DOC-002', 'EVD-qwen-code-DOC-007']],
  ['016:CAP-04.07-A02', ['EVD-qwen-code-DOC-002', 'EVD-qwen-code-DOC-007']],
  ['016:CAP-04.07-A04', ['EVD-qwen-code-DOC-002', 'EVD-qwen-code-DOC-007']],
  ['016:CAP-04.11-A01', ['EVD-qwen-code-DOC-005', 'EVD-qwen-code-DOC-007']],
  ['016:CAP-04.11-A03', ['EVD-qwen-code-DOC-005', 'EVD-qwen-code-DOC-007']],
  [
    '016:CAP-04.12-A01',
    ['EVD-qwen-code-DOC-002', 'EVD-qwen-code-DOC-005', 'EVD-qwen-code-DOC-007'],
  ],
  [
    '016:CAP-04.12-A02',
    ['EVD-qwen-code-DOC-002', 'EVD-qwen-code-DOC-005', 'EVD-qwen-code-DOC-007'],
  ],
  ['016:CAP-04.12-A03', ['EVD-qwen-code-DOC-005', 'EVD-qwen-code-DOC-007']],
  ['016:CAP-04.12-A04', ['EVD-qwen-code-DOC-005', 'EVD-qwen-code-DOC-007']],
  ['016:CAP-04.12-A06', ['EVD-qwen-code-DOC-005', 'EVD-qwen-code-DOC-007']],
  [
    '019:CAP-05.04-A02',
    ['EVD-qwen-code-SOURCE-001', 'EVD-qwen-code-SOURCE-004'],
  ],
  [
    '019:CAP-05.08-A02',
    [
      'EVD-qwen-code-DOC-029',
      'EVD-qwen-code-SOURCE-001',
      'EVD-qwen-code-SOURCE-004',
    ],
  ],
  [
    '019:CAP-05.08-A03',
    [
      'EVD-qwen-code-DOC-029',
      'EVD-qwen-code-SOURCE-001',
      'EVD-qwen-code-SOURCE-004',
    ],
  ],
  [
    '019:CAP-05.08-A04',
    [
      'EVD-qwen-code-DOC-029',
      'EVD-qwen-code-SOURCE-001',
      'EVD-qwen-code-SOURCE-004',
    ],
  ],
  [
    '020:CAP-05.10-A01',
    ['EVD-qwen-code-SOURCE-001', 'EVD-qwen-code-SOURCE-004'],
  ],
  [
    '020:CAP-05.10-A02',
    ['EVD-qwen-code-SOURCE-001', 'EVD-qwen-code-SOURCE-004'],
  ],
  [
    '020:CAP-05.11-A01',
    [
      'EVD-qwen-code-DOC-030',
      'EVD-qwen-code-SOURCE-001',
      'EVD-qwen-code-SOURCE-004',
    ],
  ],
  [
    '020:CAP-05.11-A02',
    [
      'EVD-qwen-code-DOC-030',
      'EVD-qwen-code-SOURCE-001',
      'EVD-qwen-code-SOURCE-004',
    ],
  ],
  [
    '020:CAP-05.11-A03',
    [
      'EVD-qwen-code-DOC-030',
      'EVD-qwen-code-SOURCE-001',
      'EVD-qwen-code-SOURCE-004',
    ],
  ],
  [
    '020:CAP-05.11-A04',
    [
      'EVD-qwen-code-DOC-030',
      'EVD-qwen-code-SOURCE-001',
      'EVD-qwen-code-SOURCE-004',
    ],
  ],
  [
    '020:CAP-05.12-A04',
    ['EVD-qwen-code-SOURCE-001', 'EVD-qwen-code-SOURCE-004'],
  ],
  [
    '020:CAP-05.12-A05',
    ['EVD-qwen-code-SOURCE-001', 'EVD-qwen-code-SOURCE-004'],
  ],
  ['027:CAP-07.03-A01', ['EVD-qwen-code-DOC-015']],
  ['027:CAP-07.03-A02', ['EVD-qwen-code-DOC-015']],
  ['027:CAP-07.03-A03', ['EVD-qwen-code-DOC-015']],
  ['027:CAP-07.03-A04', ['EVD-qwen-code-DOC-015']],
  ['027:CAP-07.03-A05', ['EVD-qwen-code-DOC-015']],
  ['031:CAP-08.06-A01', ['EVD-qwen-code-DOC-019']],
  ['031:CAP-08.06-A02', ['EVD-qwen-code-DOC-019']],
  ['031:CAP-08.06-A04', ['EVD-qwen-code-DOC-019']],
  ['031:CAP-08.07-A01', ['EVD-qwen-code-DOC-019']],
  ['031:CAP-08.07-A02', ['EVD-qwen-code-DOC-019', 'EVD-qwen-code-SOURCE-005']],
  ['031:CAP-08.07-A03', ['EVD-qwen-code-DOC-019', 'EVD-qwen-code-SOURCE-005']],
  ['031:CAP-08.07-A05', ['EVD-qwen-code-DOC-019', 'EVD-qwen-code-SOURCE-005']],
  [
    '038:CAP-09.08-A02',
    [
      'EVD-qwen-code-DOC-020',
      'EVD-qwen-code-DOC-022',
      'EVD-qwen-code-HELP-004',
    ],
  ],
  ['038:CAP-09.10-A01', ['EVD-qwen-code-DOC-022']],
  ['038:CAP-09.10-A02', ['EVD-qwen-code-DOC-022']],
  ['044:CAP-11.01-A01', ['EVD-qwen-code-DOC-025']],
  ['044:CAP-11.01-A02', ['EVD-qwen-code-DOC-024', 'EVD-qwen-code-DOC-025']],
  ['044:CAP-11.01-A03', ['EVD-qwen-code-DOC-024', 'EVD-qwen-code-DOC-025']],
  ['044:CAP-11.02-A01', ['EVD-qwen-code-DOC-025']],
  ['044:CAP-11.02-A02', ['EVD-qwen-code-DOC-025']],
  ['046:CAP-11.03-A04', ['EVD-qwen-code-DOC-025', 'EVD-qwen-code-HELP-001']],
  ['046:CAP-11.04-A01', ['EVD-qwen-code-DOC-002', 'EVD-qwen-code-DOC-007']],
  ['046:CAP-11.04-A03', ['EVD-qwen-code-DOC-007', 'EVD-qwen-code-DOC-025']],
  ['046:CAP-11.06-A02', ['EVD-qwen-code-DOC-007', 'EVD-qwen-code-DOC-025']],
  ['046:CAP-11.06-A03', ['EVD-qwen-code-DOC-002', 'EVD-qwen-code-DOC-007']],
  ['046:CAP-11.12-A02', ['EVD-qwen-code-DOC-007', 'EVD-qwen-code-DOC-025']],
  ['047:CAP-11.08-A01', ['EVD-qwen-code-DOC-026']],
  ['047:CAP-11.08-A04', ['EVD-qwen-code-DOC-026']],
  ['047:CAP-11.09-A01', ['EVD-qwen-code-DOC-007', 'EVD-qwen-code-DOC-026']],
  ['047:CAP-11.09-A02', ['EVD-qwen-code-DOC-007', 'EVD-qwen-code-DOC-026']],
  ['048:CAP-12.01-A01', ['EVD-qwen-code-DOC-002', 'EVD-qwen-code-DOC-004']],
  ['048:CAP-12.01-A02', ['EVD-qwen-code-DOC-002', 'EVD-qwen-code-DOC-004']],
  ['048:CAP-12.04-A01', ['EVD-qwen-code-DOC-004']],
  ['049:CAP-12.03-A01', ['EVD-qwen-code-DOC-037']],
  ['049:CAP-12.03-A02', ['EVD-qwen-code-DOC-037']],
  ['049:CAP-12.03-A03', ['EVD-qwen-code-DOC-037']],
  ['049:CAP-12.03-A04', ['EVD-qwen-code-DOC-037']],
  ['049:CAP-12.03-A07', ['EVD-qwen-code-DOC-037']],
  ['051:CAP-12.05-A02', ['EVD-qwen-code-DOC-032', 'EVD-qwen-code-HELP-001']],
  ['051:CAP-12.06-A01', ['EVD-qwen-code-DOC-007']],
  ['051:CAP-12.06-A02', ['EVD-qwen-code-DOC-007']],
  ['051:CAP-12.09-A01', ['EVD-qwen-code-DOC-008', 'EVD-qwen-code-DOC-032']],
  ['051:CAP-12.09-A02', ['EVD-qwen-code-DOC-008', 'EVD-qwen-code-DOC-032']],
]);

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), 'utf8');
}

function splitRow(line) {
  return line
    .split('|')
    .slice(1, -1)
    .map((cell) => cell.trim());
}

function ids(cell, prefix) {
  return [...cell.matchAll(new RegExp(`\\\`(${prefix}[^\\\`]+)\\\``, 'g'))].map(
    (match) => match[1],
  );
}

function factNumber(factId) {
  return factId.slice(-3);
}

function claudeEvidenceFor(fact, atomic) {
  return (
    claudeEvidenceOverrides.get(`${factNumber(fact.id)}:${atomic}`) ??
    fact.evidence
  );
}

function qwenEvidenceFor(fact, atomic) {
  return (
    qwenEvidenceOverrides.get(`${factNumber(fact.id)}:${atomic}`) ??
    fact.evidence
  );
}

function qwenFact12Contract(atomic, registryRecord) {
  const contract = emptyContract(registryRecord);
  if (atomic === 'CAP-03.07-A01') {
    contract.IN = 'R[same-turn steering input]';
    contract.SO = 'R[turn]';
    contract.CC = 'R[steer]';
    contract.FS = 'R[restore before failure]';
  } else if (atomic === 'CAP-03.07-A02') {
    contract.IN = 'R[queued same-turn input]';
    contract.SO = 'R[turn]';
    contract.CE = 'R[queued]';
    contract.FS = 'R[restore before failure]';
  } else if (atomic === 'CAP-03.12-A01') {
    contract.IN = 'R[repeated tool calls; shell stagnation; repeated content]';
  } else {
    contract.IN = 'R[turn; wall-time; tool-call budgets]';
    contract.CL = 'R[turn budget]';
    contract.FS = 'R[budget guard]';
  }
  return contract;
}

function qwenContractFor(fact, atomic, registryRecord) {
  if (fact.id === 'FACT-qwen-code-012') {
    return qwenFact12Contract(atomic, registryRecord);
  }
  return fact.atomics.length > 1 ? emptyContract(registryRecord) : undefined;
}

function evidenceType(evidenceId) {
  return evidenceId.match(/-([A-Z]+)-\d+$/)?.[1] ?? 'UNKNOWN';
}

function parseRegistry() {
  const records = new Map();
  for (const line of read('03-atomic-capability-registry.md').split('\n')) {
    if (!line.startsWith('| `CAP-')) continue;
    const columns = splitRow(line);
    const atomicId = ids(columns[0], 'CAP-')[0];
    const dimensions = columns[3]
      .replaceAll('`', '')
      .split(',')
      .map((value) => value.trim());
    const requiredLeaves = new Set(
      dimensions.flatMap((dimension) => dimensionLeaves[dimension] ?? []),
    );
    records.set(atomicId, {
      id: atomicId,
      job: columns[1],
      outcome: columns[2],
      dimensions,
      requiredLeaves,
    });
  }
  return records;
}

function parseFacts(product) {
  const meta = productMeta[product];
  const lines = fs
    .readFileSync(path.join(factsDir, meta.factFile), 'utf8')
    .split('\n');
  const records = [];
  for (const line of lines) {
    if (!line.startsWith(`| \`FACT-${product}-`)) continue;
    const columns = splitRow(line);
    if (product === 'codex') {
      records.push({
        id: ids(columns[0], 'FACT-')[0],
        atomics: ids(columns[1], 'CAP-'),
        slice: columns[2],
        observation: columns[3],
        evidence: ids(columns[4], 'EVD-'),
        epistemic: columns[5].includes('Unknown') ? 'Unknown' : 'Confirmed',
        limitations: columns[6],
      });
    } else if (product === 'claude-code') {
      records.push({
        id: ids(columns[0], 'FACT-')[0],
        atomics: ids(columns[1], 'CAP-'),
        slice: columns[2].replaceAll('`', ''),
        observation: columns[3],
        evidence: ids(columns[4], 'EVD-'),
        epistemic: columns[4].includes('Unknown') ? 'Unknown' : 'Confirmed',
        limitations: columns[5],
      });
    } else {
      records.push({
        id: ids(columns[0], 'FACT-')[0],
        atomics: ids(columns[1], 'CAP-'),
        slice: `${columns[2]} / ${columns[3]}`,
        surface: columns[3].replaceAll('`', ''),
        observation: columns[4],
        evidence: ids(columns[5], 'EVD-'),
        epistemic: columns[6].replaceAll('`', ''),
        limitations: columns[7],
      });
    }
  }
  return records;
}

function parseEvidenceIds(product) {
  const content = fs.readFileSync(
    path.join(evidenceDir, productMeta[product].evidenceFile),
    'utf8',
  );
  return new Set(
    [...content.matchAll(/`(EVD-[^`]+)`/g)].map((match) => match[1]),
  );
}

function clean(value) {
  return value
    .replaceAll(/<br\s*\/?>/gi, ' ')
    .replaceAll(/\s+/g, ' ')
    .trim();
}

function bounded(value, limit = 76) {
  const normalized = clean(value).replaceAll('`', '');
  return normalized.length <= limit
    ? normalized
    : `${normalized.slice(0, limit - 1)}…`;
}

function tableCell(value) {
  return String(value)
    .replaceAll('\\', '\\\\')
    .replaceAll('|', '\\|')
    .replaceAll('\n', ' ');
}

function recorded(values) {
  const normalized = [
    ...new Set(values.map((value) => clean(value)).filter(Boolean)),
  ];
  return normalized.length ? `R[${bounded(normalized.join('; '), 96)}]` : null;
}

function emptyContract(registryRecord) {
  return Object.fromEntries(
    leafOrder.map((leaf) => [
      leaf,
      registryRecord.requiredLeaves.has(leaf) ? 'NC' : 'NA',
    ]),
  );
}

function exactTerms(text) {
  return [...text.matchAll(/`([^`]+)`/g)]
    .map((match) => match[1])
    .filter(
      (term) =>
        !term.startsWith('CAP-') &&
        !term.startsWith('FACT-') &&
        !term.startsWith('EVD-'),
    )
    .slice(0, 4);
}

function keywordValues(text, rules) {
  const values = [];
  for (const [pattern, value] of rules) {
    if (pattern.test(text)) values.push(value);
  }
  return values;
}

function controlledContractValue(value, rules) {
  return recorded(keywordValues(clean(value).toLowerCase(), rules));
}

function stateOwnershipValue(value) {
  return controlledContractValue(value, [
    [/\bturns?\b/, 'turn'],
    [/\bsessions?\b|会话/, 'session'],
    [/\bprocess(?:es)?\b|进程/, 'process'],
    [/\bprojects?\b|项目/, 'project'],
    [
      /\bworkspaces?\b|\brepositor(?:y|ies)\b|\brepos?\b|工作区|仓库/,
      'workspace',
    ],
    [/\busers?\b|用户/, 'user'],
    [/\borganizations?\b|\bmanaged\b|组织/, 'organization'],
    [
      /\bexternal[- ]services?\b|\bcloud\b|\bgithub\b|\bproviders?\b|外部服务|远端/,
      'external-service',
    ],
  ]);
}

function persistenceValue(value) {
  return controlledContractValue(value, [
    [/\bmemory\b|记忆/, 'memory'],
    [/\btranscript\b|\bhistory\b|历史/, 'transcript'],
    [/\blocal\b|\bfile\b|\bkeychain\b|本地/, 'local'],
    [/\bremote\b|\bcloud\b|远端/, 'remote'],
    [/\bcross[- ]device\b|跨设备/, 'cross-device'],
  ]);
}

function runtimeModeValue(value) {
  const text = clean(value).toLowerCase();
  const positiveText = text
    .replaceAll(/non[- ]?interactive/g, '')
    .replaceAll(/non-tty/g, '')
    .replaceAll(/非交互/g, '');
  const values = [];
  if (/\binteractive\b|交互/.test(positiveText)) values.push('interactive');
  if (/\bnon[- ]?interactive\b|\bheadless\b|\bprint mode\b|非交互/.test(text)) {
    values.push('non-interactive');
  }
  if (/\btty\b/.test(positiveText)) values.push('tty');
  if (/\bnon-tty\b/.test(text)) values.push('non-tty');
  if (/\bremote\b|远端/.test(text)) values.push('remote');
  return recorded(values);
}

function concurrencyExecutionValue(value) {
  return controlledContractValue(value, [
    [/\bserial\b|串行|顺序/, 'serial'],
    [/\bqueue(?:d)?\b|排队/, 'queued'],
    [/\bparallel\b|\bconcurrent\b|并行|并发/, 'parallel'],
    [
      /\bmixed\b|\bforeground\b.*\bbackground\b|\bbackground\b.*\bforeground\b|\bmultiple\b|混合|前台.*后台|后台.*前台/,
      'mixed',
    ],
  ]);
}

function securityBoundaryValue(value) {
  const mapped = controlledContractValue(value, [
    [/\bhost\b|本机/, 'host'],
    [/\bsandbox\b|\bseatbelt\b|\bcontainer\b|沙箱|容器/, 'sandbox'],
    [/\bworkspace\b|\brepository\b|\brepo\b|工作区|仓库/, 'workspace'],
    [/\bnetwork\b|\bhttp\b|\bweb\b|网络/, 'network'],
    [
      /\bexternal[- ]service\b|\bcloud\b|\bgithub\b|\bprovider\b|外部服务|远端/,
      'external-service',
    ],
  ]);
  return mapped ?? 'R[other]';
}

function insufficientContractValue(value) {
  return /\bunknown\b|\bnot described\b|\bnot documented\b|\bnot explicitly (?:surfaced|described|documented)\b|\bpartly documented\b|\bunspecified\b|未知|未说明|未描述|不明确/i.test(
    value,
  );
}

function heuristicContract(registryRecord, observation) {
  const contract = emptyContract(registryRecord);
  const text = observation.toLowerCase();
  const terms = exactTerms(observation);

  const valueRules = {
    IN: [
      [/prompt|文本|text|stdin/, 'text or prompt'],
      [/file|文件|image|图片|path|目录/, 'file or path'],
      [/id|name|名称|branch|commit|task/, 'identifier or selector'],
      [
        /option|flag|参数|配置|settings|schema|json/,
        'options or configuration',
      ],
      [/url|endpoint|provider|model|credential|key/, 'service configuration'],
      [/event|signal|hook/, 'event or signal'],
    ],
    AG: [
      [/login|auth|credential|登录|凭据/, 'authentication'],
      [/entitlement|subscription|套餐|资格/, 'entitlement'],
      [/trust|trusted|信任/, 'workspace trust'],
      [/config|settings|flag|opt-in|enable|配置|开关/, 'configuration'],
      [
        /platform|macos|linux|windows|darwin|node|os\/arch/,
        'platform prerequisite',
      ],
      [
        /permission|approval|sandbox|policy|权限|审批|策略/,
        'permission or policy',
      ],
    ],
    SX: [
      [/read|list|inspect|读取|查看|列出/, 'local read'],
      [
        /write|edit|apply|install|update|remove|delete|写|编辑|安装|删除|更新/,
        'local mutation',
      ],
      [/run|execute|spawn|start|launch|命令|启动|执行/, 'process execution'],
      [
        /network|http|web|download|upload|send|cloud|网络|远端|发送/,
        'network or external request',
      ],
    ],
    OH: [
      [/stdout|stderr|terminal|终端/, 'terminal output'],
      [/json|jsonl|schema|event|事件/, 'structured output'],
      [/transcript|history|session|历史|会话/, 'session history'],
      [
        /status|diff|result|output|log|summary|结果|输出|日志/,
        'status or result',
      ],
    ],
    FS: [
      [/deny|reject|blocked|refuse|拒绝|阻断/, 'explicit denial'],
      [/error|failure|fail|错误|失败/, 'reported error'],
      [
        /timeout|cancel|signal|exit code|退出码|超时|取消/,
        'termination or timeout',
      ],
      [/cleanup|rollback|恢复|回滚|清理/, 'cleanup or recovery'],
    ],
    EB: [
      [/hook/, 'hooks'],
      [/mcp/, 'MCP'],
      [/skill/, 'skills'],
      [/plugin|extension/, 'plugins or extensions'],
      [/subagent|agent|agent team|arena/, 'agent boundary'],
      [/sdk|api|daemon|serve/, 'programmatic boundary'],
    ],
    OB: [
      [/help|version|status|list|inspect|帮助|版本|状态|列出/, 'CLI discovery'],
      [
        /json|event|log|debug|trace|metric|telemetry|事件|日志/,
        'machine-readable signal',
      ],
      [
        /transcript|history|summary|diff|result|历史|结果/,
        'user-visible record',
      ],
    ],
  };

  if (contract.EP === 'NC' && terms.length) contract.EP = recorded(terms);
  for (const leaf of ['IN', 'AG', 'SX', 'OH', 'FS', 'EB', 'OB']) {
    if (contract[leaf] !== 'NC') continue;
    contract[leaf] = recorded(keywordValues(text, valueRules[leaf])) ?? 'NC';
  }

  if (contract.AD === 'NC') {
    if (/default[- ]?off|默认关闭/.test(text)) contract.AD = 'R[default-off]';
    else if (/default[- ]?on|默认开启|默认启用/.test(text))
      contract.AD = 'R[default-on]';
  }

  if (contract.SO === 'NC') {
    contract.SO =
      recorded(
        keywordValues(text, [
          [/turn/, 'turn'],
          [/session|会话|chat/, 'session'],
          [/process|进程/, 'process'],
          [/project|项目/, 'project'],
          [/workspace|工作区|仓库/, 'workspace'],
          [/user|用户/, 'user'],
          [/organization|组织|managed/, 'organization'],
          [/external|cloud|github|provider|远端/, 'external-service'],
        ]),
      ) ?? 'NC';
  }

  if (contract.PE === 'NC') {
    contract.PE =
      recorded(
        keywordValues(text, [
          [/memory|记忆/, 'memory'],
          [/transcript|history|会话历史/, 'transcript'],
          [/local|file|目录|本地|配置/, 'local'],
          [/remote|cloud|github|远端/, 'remote'],
          [/cross-device|跨设备/, 'cross-device'],
        ]),
      ) ?? 'NC';
  }

  if (contract.RM === 'NC') {
    const positiveModeText = text
      .replaceAll(/non[- ]?interactive/g, '')
      .replaceAll(/non-tty/g, '')
      .replaceAll(/非交互/g, '');
    const modeValues = [];
    if (/interactive|交互/.test(positiveModeText)) {
      modeValues.push('interactive');
    }
    if (/headless|non[- ]?interactive|non-tty|print mode/.test(text)) {
      modeValues.push('non-interactive');
    }
    if (/\btty\b/.test(positiveModeText)) modeValues.push('tty');
    if (/non-tty/.test(text)) modeValues.push('non-tty');
    if (/remote|cloud|远端/.test(text)) modeValues.push('remote');
    contract.RM = recorded(modeValues) ?? 'NC';
  }

  if (contract.CE === 'NC') {
    const values = keywordValues(text, [
      [/parallel|concurrent|并行|并发/, 'parallel'],
      [/queue|排队/, 'queued'],
      [/serial|顺序/, 'serial'],
      [/background|multiple|后台|多个/, 'mixed'],
    ]);
    contract.CE = values.length ? `R[${values[0]}]` : 'NC';
  }
  if (contract.CC === 'NC') {
    contract.CC =
      recorded(
        keywordValues(text, [
          [/cancel|stop|kill|取消|停止/, 'cancel or stop'],
          [
            /pause|resume|attach|steer|继续|恢复|接管/,
            'pause, resume, or steer',
          ],
          [/send_message|message|消息/, 'message control'],
        ]),
      ) ?? 'NC';
  }
  if (contract.CL === 'NC') {
    contract.CL =
      recorded(
        keywordValues(text, [
          [/limit|cap|maximum|最多|上限/, 'declared limit'],
          [/budget|预算/, 'budget'],
          [/timeout|超时/, 'timeout'],
        ]),
      ) ?? 'NC';
  }
  if (contract.SB === 'NC') {
    contract.SB =
      recorded(
        keywordValues(text, [
          [/host|local|本机/, 'host'],
          [/sandbox|seatbelt|container|沙箱|容器/, 'sandbox'],
          [/workspace|path|directory|仓库|工作区|目录/, 'workspace'],
          [/network|http|web|网络/, 'network'],
          [/cloud|github|provider|external|远端/, 'external-service'],
          [/credential|secret|trust|permission|凭据|权限|信任/, 'other'],
        ]),
      ) ?? 'NC';
  }
  return contract;
}

function parseClaudeInlineContract(registryRecord, observation) {
  const contract = emptyContract(registryRecord);
  const matches = [
    ...observation.matchAll(
      /`(ENTRY|INPUT|AVAIL|SIDEFX|STATE|PERSIST|OUTPUT|MODES|CONC(?:\.(?:limits|controls|execution))?|FAIL|EXT|SEC|OBS)=([^`]+)`/g,
    ),
  ];
  for (const match of matches) {
    const [, key, rawValue] = match;
    const value = clean(rawValue);
    if (insufficientContractValue(value)) {
      const unknownLeaves = {
        ENTRY: ['EP'],
        INPUT: ['IN'],
        AVAIL: ['AD', 'AG'],
        SIDEFX: ['SX'],
        STATE: ['SO'],
        PERSIST: ['PE'],
        OUTPUT: ['OH'],
        MODES: ['RM'],
        CONC: ['CE', 'CC', 'CL'],
        'CONC.execution': ['CE'],
        'CONC.controls': ['CC'],
        'CONC.limits': ['CL'],
        FAIL: ['FS'],
        EXT: ['EB'],
        SEC: ['SB'],
        OBS: ['OB'],
      }[key];
      for (const leaf of unknownLeaves ?? []) contract[leaf] = 'U';
      continue;
    }
    if (key === 'ENTRY') contract.EP = `R[${bounded(value)}]`;
    if (key === 'INPUT') contract.IN = `R[${bounded(value)}]`;
    if (key === 'AVAIL') {
      contract.AG = `R[${bounded(value)}]`;
      if (/default[- ]?on/.test(value)) contract.AD = 'R[default-on]';
      if (/default[- ]?off/.test(value)) contract.AD = 'R[default-off]';
    }
    if (key === 'SIDEFX') contract.SX = `R[${bounded(value)}]`;
    if (key === 'OUTPUT') contract.OH = `R[${bounded(value)}]`;
    if (key === 'FAIL') contract.FS = `R[${bounded(value)}]`;
    if (key === 'EXT') contract.EB = `R[${bounded(value)}]`;
    if (key === 'OBS') contract.OB = `R[${bounded(value)}]`;
    if (key === 'STATE') {
      contract.SO = stateOwnershipValue(value) ?? 'U';
    }
    if (key === 'PERSIST') {
      contract.PE = persistenceValue(value) ?? 'U';
    }
    if (key === 'MODES') {
      contract.RM = runtimeModeValue(value) ?? 'U';
    }
    if (key === 'SEC') {
      contract.SB = securityBoundaryValue(value);
    }
    if (key.startsWith('CONC')) {
      if (key === 'CONC' || key.endsWith('.execution')) {
        contract.CE = concurrencyExecutionValue(value) ?? 'U';
      }
      if (key.endsWith('.controls')) {
        contract.CC = `R[${bounded(value)}]`;
      } else if (
        key === 'CONC' &&
        /\bforeground\b.*\bbackground\b|\bbackground\b.*\bforeground\b|前台.*后台|后台.*前台/i.test(
          value,
        )
      ) {
        contract.CC = `R[${bounded(value)}]`;
      }
      if (key.endsWith('.limits')) {
        contract.CL = `R[${bounded(value)}]`;
      }
    }
  }
  for (const leaf of leafOrder) {
    if (!registryRecord.requiredLeaves.has(leaf)) contract[leaf] = 'NA';
  }
  return contract;
}

function claudeFact1Contract(atomic, registryRecord) {
  const contract = emptyContract(registryRecord);
  if (atomic === 'CAP-01.01-A03') {
    contract.EP = 'R[binary --version]';
    contract.IN = 'R[Darwin arm64 native artifact]';
    contract.AG = 'R[Darwin arm64]';
    contract.SX = 'CN';
    contract.OB = 'R[version output; exit 0]';
  } else {
    contract.IN = 'R[artifact; official manifest digest]';
    contract.OH = 'R[SHA-256 match]';
    contract.SB = 'R[other]';
    contract.OB = 'R[checksum comparison]';
  }
  return contract;
}

function claudeContractFor(fact, atomic, registryRecord, observation) {
  if (fact.id === 'FACT-claude-code-001') {
    return claudeFact1Contract(atomic, registryRecord);
  }
  if (fact.atomics.length > 1) return emptyContract(registryRecord);
  return parseClaudeInlineContract(registryRecord, observation);
}

function terminalFor(observation) {
  const text = observation.toLowerCase();
  const positiveTerminalText = text
    .replaceAll(/non[- ]?interactive/g, '')
    .replaceAll(/non-tty/g, '')
    .replaceAll(/非交互/g, '');
  const tty = /\btty\b|interactive|交互/.test(positiveTerminalText);
  const nonTty = /non-tty|non[- ]?interactive|headless|print mode|非交互/.test(
    text,
  );
  if (tty && nonTty) return 'both';
  if (nonTty) return 'non-tty';
  if (tty) return 'tty';
  return 'unknown';
}

function claudeTerminalFor(fact, atomic, observation = fact.observation) {
  if (['FACT-claude-code-009', 'FACT-claude-code-010'].includes(fact.id)) {
    return 'both';
  }
  if (fact.id === 'FACT-claude-code-047') {
    return atomic === 'CAP-11.09-A05' ? 'non-tty' : 'tty';
  }
  if (
    [
      'FACT-claude-code-039',
      'FACT-claude-code-040',
      'FACT-claude-code-041',
      'FACT-claude-code-046',
      'FACT-claude-code-049',
      'FACT-claude-code-052',
      'FACT-claude-code-056',
    ].includes(fact.id)
  ) {
    return 'non-tty';
  }
  if (fact.atomics.length > 1) return 'unknown';
  return terminalFor(observation);
}

function makeSlice(product, options = {}) {
  const terminal = options.terminal ?? 'unknown';
  if (product === 'codex') {
    const os = options.os ?? 'Darwin';
    const arch = options.arch ?? 'arm64';
    const distribution = options.distribution ?? false;
    return {
      id: `CDX-0145-CLI-${os.toUpperCase()}-${arch.toUpperCase()}-${
        distribution ? 'DIST' : terminal.replace('-', '').toUpperCase()
      }`,
      product: 'Codex',
      version: '0.145.0',
      channel: 'latest',
      surface: 'cli',
      os,
      arch,
      shell: distribution ? 'not-applicable' : 'zsh 5.9',
      terminal: distribution ? 'not-applicable' : terminal,
      isolation: 'unknown',
      authentication: 'not authenticated',
      entitlement: 'not checked',
      region: 'not-applicable',
      provider: 'not-applicable',
      model: 'not-applicable',
      configuration: distribution
        ? 'frozen wrapper/platform manifest'
        : 'no user override; frozen binary',
      featureFlags: 'none supplied',
    };
  }
  if (product === 'claude-code') {
    const version = options.version ?? '2.1.212';
    const channel = version === '2.1.220' ? 'latest' : 'stable';
    const provider = options.provider ?? 'not-applicable';
    const providerKey =
      provider === 'not-applicable'
        ? ''
        : `-${provider.replaceAll(/[^a-z0-9]/gi, '').toUpperCase()}`;
    const latestWithoutArtifact = version === '2.1.220';
    const platformKey = latestWithoutArtifact ? 'NA' : 'MAC';
    return {
      id: `CLC-${version.replaceAll('.', '')}-CLI-${platformKey}-${terminal
        .replace('-', '')
        .toUpperCase()}${providerKey}`,
      product: 'Claude Code',
      version,
      channel,
      surface: 'cli',
      os: latestWithoutArtifact ? 'not-applicable' : 'macOS 26.5.1 (25F80)',
      arch: latestWithoutArtifact ? 'not-applicable' : 'arm64',
      shell: latestWithoutArtifact ? 'not-applicable' : 'zsh 5.9',
      terminal,
      isolation: latestWithoutArtifact ? 'not-applicable' : 'host',
      authentication: latestWithoutArtifact
        ? 'not-applicable'
        : 'not authenticated',
      entitlement: 'not checked',
      region: 'not-applicable',
      provider,
      model: 'not-applicable',
      configuration: latestWithoutArtifact
        ? 'versioned changelog only; 2.1.220 binary/help not downloaded'
        : 'frozen binary/help plus version-bounded evidence',
      featureFlags: options.featureFlags ?? 'none supplied',
    };
  }
  const sandboxBackend = options.sandboxBackend;
  if (sandboxBackend) {
    const seatbelt = sandboxBackend === 'Seatbelt';
    return {
      id: `QWN-0210-CLI-${sandboxBackend.toUpperCase()}-NA`,
      product: 'Qwen Code',
      version: '0.21.0',
      channel: 'stable',
      surface: 'cli',
      os: seatbelt ? 'macOS' : 'not-applicable',
      arch: 'not-applicable',
      shell: 'not-applicable',
      terminal: 'unknown',
      isolation: seatbelt ? 'other' : 'container',
      authentication: 'not tested',
      entitlement: 'not checked',
      region: 'not-applicable',
      provider: 'not-applicable',
      model: 'not-applicable',
      configuration: seatbelt
        ? 'sandbox backend=Seatbelt; documented platform=macOS'
        : `sandbox backend=${sandboxBackend}; runtime platform=TBD`,
      featureFlags: 'none supplied',
    };
  }
  return {
    id: `QWN-0210-CLI-NA-${terminal.replace('-', '').toUpperCase()}`,
    product: 'Qwen Code',
    version: '0.21.0',
    channel: 'stable',
    surface: 'cli',
    os: 'not-applicable',
    arch: 'not-applicable',
    shell: 'not-applicable',
    terminal,
    isolation: 'not-applicable',
    authentication: 'not tested',
    entitlement: 'not checked',
    region: 'not-applicable',
    provider: 'not-applicable',
    model: 'not-applicable',
    configuration: 'v0.21.0 tagged docs/source or frozen package surface',
    featureFlags: 'none supplied',
  };
}

function baseClaim(product, fact, atomic, registry, options = {}) {
  const registryRecord = registry.get(atomic);
  if (!registryRecord) throw new Error(`Unknown Atomic ID: ${atomic}`);
  const meta = productMeta[product];
  const contract =
    options.contract ??
    (product === 'claude-code'
      ? parseClaudeInlineContract(registryRecord, fact.observation)
      : emptyContract(registryRecord));
  const evidence = options.evidence ?? fact.evidence;
  const support = options.support ?? 'Unknown';
  const evidenceKinds = [...new Set(evidence.map(evidenceType))].join('+');
  const statement =
    options.statement ??
    (support === 'Partial'
      ? `冻结证据只确认“${registryRecord.job}”的部分契约；完整可观察结果尚未闭合。`
      : `冻结证据确认与“${registryRecord.job}”相关的 ${evidenceKinds} Surface；原子可观察结果尚未闭合。`);
  const documentation = evidence.some((id) =>
    ['DOC', 'CHANGELOG'].includes(evidenceType(id)),
  )
    ? 'Documented'
    : 'Not checked';
  const runtime =
    options.runtime ??
    (product === 'codex' && fact.id === 'FACT-codex-003'
      ? 'Reproduced'
      : product === 'claude-code' && fact.id === 'FACT-claude-code-001'
        ? 'Reproduced'
        : 'Not tested');
  const confidence =
    options.confidence ??
    (runtime === 'Reproduced'
      ? 'High'
      : evidenceKinds.includes('+')
        ? 'Medium'
        : 'Low');
  return {
    product,
    productLabel: meta.label,
    atomic,
    originFacts: options.originFacts ?? [fact.id],
    userJob: registryRecord.job,
    statement,
    evidence,
    epistemic: options.epistemic ?? fact.epistemic,
    documentation,
    runtime,
    support,
    lifecycle: options.lifecycle ?? 'not-checked',
    future: options.future ?? 'not-checked',
    conflicts: options.conflicts ?? [],
    confidence,
    limitations: options.limitations ?? fact.limitations,
    contract,
    slice: options.slice,
    provider: options.provider ?? 'not-applicable',
    configuration: options.configuration ?? [],
    checked: phase1CReviewedAt,
  };
}

function codexTerminalFor(fact) {
  if (fact.id === 'FACT-codex-006') return 'tty';
  if (
    ['FACT-codex-003', 'FACT-codex-014', 'FACT-codex-045'].includes(fact.id)
  ) {
    return 'non-tty';
  }
  return 'unknown';
}

function buildCodex(registry, facts) {
  const claims = [];
  const byId = new Map(facts.map((fact) => [fact.id, fact]));
  const platforms = [
    ['Darwin', 'arm64'],
    ['Darwin', 'x64'],
    ['Linux', 'arm64'],
    ['Linux', 'x64'],
    ['Windows', 'arm64'],
    ['Windows', 'x64'],
  ];
  for (const fact of facts) {
    if (fact.id === 'FACT-codex-001' || fact.id === 'FACT-codex-002') {
      for (const atomic of fact.atomics) {
        for (const [os, arch] of platforms) {
          claims.push(
            baseClaim('codex', fact, atomic, registry, {
              slice: makeSlice('codex', {
                os,
                arch,
                distribution: true,
              }),
              evidence:
                fact.id === 'FACT-codex-001'
                  ? ['EVD-codex-SOURCE-001']
                  : fact.evidence,
              statement: `冻结 wrapper manifest/source 将“${registry.get(atomic).job}”映射到 ${os} ${arch}；该平台正常路径未运行。`,
              configuration: [`target=${os}/${arch}`],
              contract: emptyContract(registry.get(atomic)),
            }),
          );
        }
      }
      continue;
    }
    if (fact.id === 'FACT-codex-004') {
      const inventoryFact = {
        ...fact,
        observation:
          '冻结顶层 Help 公开 interactive CLI、`exec`、`review`、认证、MCP、plugin、session 与 cloud 等一方 CLI 命令 Surface。',
      };
      claims.push(
        baseClaim('codex', inventoryFact, 'CAP-01.08-A01', registry, {
          slice: makeSlice('codex', { terminal: 'non-tty' }),
          statement:
            '冻结顶层 Help 列出 Codex 0.145.0 的一方 CLI 命令 Surface；各入口能力边界尚未逐项运行。',
        }),
      );
      for (const entry of [
        'app-server',
        'remote-control',
        'cloud',
        'exec-server',
      ]) {
        const claim = baseClaim('codex', fact, 'CAP-01.09-A01', registry, {
          slice: makeSlice('codex', { terminal: 'non-tty' }),
          support: 'Supported',
          lifecycle: 'experimental',
          future: 'not-applicable',
          runtime: 'Not applicable',
          confidence: 'High',
          statement: `Codex 0.145.0 的冻结 Help 将 ${entry} 明确标记为 experimental。`,
          configuration: [`entry=${entry}`],
        });
        claim.contract.IN = `R[${entry} at version 0.145.0]`;
        claim.contract.AD = 'NA';
        claim.contract.AG = 'R[frozen Help surface]';
        claim.contract.OH = 'R[experimental label]';
        claim.contract.OB = 'R[CLI Help output]';
        claims.push(claim);
      }
      continue;
    }
    if (!codexStandardFacts.has(fact.id)) continue;
    for (const atomic of fact.atomics) {
      const exactAtoms = codexExactAtomFilters.get(fact.id);
      if (exactAtoms && !exactAtoms.has(atomic)) continue;
      let narrowedFact = fact;
      let originFacts = [fact.id];
      let evidence = fact.evidence;
      let limitations = fact.limitations;
      let statement;
      let configuration = [];
      let lifecycle = codexExperimentalFacts.has(fact.id)
        ? 'experimental'
        : atomic === 'CAP-01.03-A02'
          ? 'not-applicable'
          : 'not-checked';
      if (fact.id === 'FACT-codex-010') {
        evidence = ['EVD-codex-HELP-004'];
        narrowedFact = {
          ...fact,
          observation:
            atomic === 'CAP-02.08-A01'
              ? 'experimental `cloud exec` 公开按 environment/branch 提交远端任务的 CLI Surface。'
              : atomic === 'CAP-02.08-A02'
                ? 'experimental `cloud exec` 公开 environment/branch 选择参数的 CLI Surface。'
                : 'experimental `cloud list/status/diff` 公开按 task 标识访问远端任务状态与 diff 的 CLI Surface。',
        };
        statement = `Codex 0.145.0 Help 公开与“${registry.get(atomic).job}”对应的 experimental cloud CLI 入口；正常路径尚未运行。`;
      }
      if (fact.id === 'FACT-codex-041') {
        evidence = ['EVD-codex-HELP-004'];
        narrowedFact = {
          ...fact,
          observation:
            'experimental `cloud exec --attempts 1..4` 公开请求多个远端 attempts 的 CLI Surface。',
        };
        statement =
          'Codex 0.145.0 Help 公开 cloud exec --attempts 1..4；候选独立性、并行时间线与聚合尚未运行。';
      }
      if (fact.id === 'FACT-codex-023') {
        narrowedFact = {
          ...fact,
          observation:
            '顶层 `apply` 接受 cloud task ID，并声明把该 task 的最新 diff 通过 `git apply` 应用到本地工作树。',
        };
        evidence = ['EVD-codex-HELP-002'];
        statement =
          'Codex 0.145.0 顶层 Help 公开 `apply <TASK_ID>` 本地变更应用入口；冲突、部分应用与回滚未运行。';
        configuration = ['entry=top-level apply'];
        lifecycle = 'not-checked';
      }
      if (fact.id === 'FACT-codex-025' && atomic === 'CAP-06.02-A04') {
        const bypassFact = byId.get('FACT-codex-029');
        originFacts = [fact.id, bypassFact.id];
        evidence = [...new Set([...fact.evidence, ...bypassFact.evidence])];
        limitations = `${fact.limitations} ${bypassFact.limitations}`;
        statement =
          'Codex 0.145.0 冻结 Help 公开 approval/sandbox mode，以及仅供外部 sandbox 使用的 --dangerously-bypass-approvals-and-sandbox 高权限入口；门禁、退出恢复与越界行为未运行。';
      }
      if (fact.id === 'FACT-codex-050') {
        const isDispatch = atomic === 'CAP-10.12-A01';
        narrowedFact = {
          ...fact,
          observation: isDispatch
            ? 'experimental `cloud exec` 按 environment/branch 提交远端任务并返回任务 Surface。'
            : 'experimental `cloud status/list/diff` 按远端 task 标识查询状态或 diff。',
        };
        evidence = ['EVD-codex-HELP-004'];
        statement = isDispatch
          ? 'Codex 0.145.0 Help 公开 experimental `cloud exec` 远端任务提交入口；执行位置、任务 ID 与失败语义未运行。'
          : 'Codex 0.145.0 Help 公开 experimental `cloud status/list/diff` 查询入口；状态准确性与只读性未运行。';
        configuration = [
          `entry=${isDispatch ? 'cloud exec' : 'cloud status/list/diff'}`,
        ];
      }
      const contract = emptyContract(registry.get(atomic));
      if (fact.id === 'FACT-codex-023') {
        contract.EP = 'R[apply <TASK_ID>]';
        contract.IN = 'R[cloud task ID]';
        contract.SX = 'R[git apply mutation of local worktree]';
      }
      if (fact.id === 'FACT-codex-025' && atomic === 'CAP-06.02-A04') {
        contract.EP = 'R[--dangerously-bypass-approvals-and-sandbox]';
        contract.AG = 'R[external sandbox required]';
        contract.SB = 'R[other]';
      }
      if (fact.id === 'FACT-codex-050') {
        const isDispatch = atomic === 'CAP-10.12-A01';
        contract.EP = `R[${isDispatch ? 'cloud exec' : 'cloud status/list/diff'}]`;
        contract.IN = isDispatch
          ? 'R[environment; branch; task]'
          : 'R[cloud task ID]';
        contract.SO = 'R[external-service]';
        contract.RM = 'R[remote]';
        contract.EB = 'R[Codex cloud task service]';
        contract.SB = 'R[external-service]';
        if (isDispatch) {
          contract.SX = 'R[remote task submission request]';
        } else {
          contract.OH = 'R[remote task status or diff surface]';
        }
      }
      claims.push(
        baseClaim('codex', narrowedFact, atomic, registry, {
          slice: makeSlice('codex', {
            terminal: codexTerminalFor(narrowedFact),
          }),
          originFacts,
          evidence,
          limitations,
          statement,
          configuration,
          contract,
          lifecycle,
          future: atomic === 'CAP-01.03-A02' ? 'not-applicable' : 'not-checked',
        }),
      );
    }
  }
  return claims;
}

function isClaudeDeferred(fact, atomic) {
  const rule = claudeDeferred.get(fact.id);
  return rule === '*' || rule?.has(atomic);
}

function claudeLifecycle(fact, atomic, variant) {
  if (fact.id === 'FACT-claude-code-008' && atomic === 'CAP-02.08-A06')
    return 'preview';
  if (fact.id === 'FACT-claude-code-023' && variant === 'auto')
    return 'preview';
  if (fact.id === 'FACT-claude-code-024') return 'unknown';
  if (fact.id === 'FACT-claude-code-027') return 'unknown';
  if (fact.id === 'FACT-claude-code-050' && atomic === 'CAP-12.03-A01')
    return 'preview';
  return 'stable';
}

function buildClaude(registry, facts) {
  const claims = [];
  const byId = new Map(facts.map((fact) => [fact.id, fact]));
  for (const fact of facts) {
    const version = fact.slice === 'L-CLI' ? '2.1.220' : '2.1.212';
    if (fact.id === 'FACT-claude-code-043') {
      for (const atomic of fact.atomics) {
        for (const provider of [
          'Anthropic',
          'Amazon Bedrock',
          'Google Vertex',
        ]) {
          const credentialClaim = atomic === 'CAP-11.01-A02';
          claims.push(
            baseClaim('claude-code', fact, atomic, registry, {
              slice: makeSlice('claude-code', {
                version,
                terminal: claudeTerminalFor(fact, atomic),
                provider,
              }),
              evidence: credentialClaim
                ? fact.evidence
                : fact.evidence.filter(
                    (evidence) => evidence !== 'EVD-claude-code-HELP-001',
                  ),
              lifecycle: 'stable',
              statement: credentialClaim
                ? `冻结 Help 与 current docs 记录 ${provider} 凭据路径；凭据读取、认证请求与失败语义未运行。`
                : `current docs 记录 ${provider} 路径中与“${registry.get(atomic).job}”相关的配置 Surface；它只限定 exact 2.1.212 Claim，未证明该版本 runtime。`,
              contract: emptyContract(registry.get(atomic)),
            }),
          );
        }
      }
      continue;
    }
    for (const atomic of fact.atomics) {
      if (isClaudeDeferred(fact, atomic)) continue;
      if (fact.id === 'FACT-claude-code-033' && atomic === 'CAP-08.07-A02') {
        continue;
      }
      const slice = makeSlice('claude-code', {
        version,
        terminal: claudeTerminalFor(fact, atomic),
      });
      if (fact.id === 'FACT-claude-code-023' && atomic === 'CAP-06.02-A01') {
        const stableClaim = baseClaim('claude-code', fact, atomic, registry, {
          slice,
          lifecycle: 'stable',
          configuration: ['permission modes excluding auto'],
          statement:
            '冻结 CLI 公开 acceptEdits、bypassPermissions、manual、dontAsk 与 plan permission modes；实际 enforcement 未运行。',
          contract: emptyContract(registry.get(atomic)),
        });
        claims.push(stableClaim);
        claims.push(
          baseClaim('claude-code', fact, atomic, registry, {
            slice,
            support: 'Unknown',
            lifecycle: 'preview',
            configuration: ['permission mode=auto'],
            statement:
              '冻结 CLI 公开 auto permission mode，但官方材料将它限定为 research preview，且 enforcement 未运行。',
            contract: emptyContract(registry.get(atomic)),
          }),
        );
        continue;
      }
      let originFacts = [fact.id];
      let evidence = claudeEvidenceFor(fact, atomic);
      let limitations = fact.limitations;
      if (fact.id === 'FACT-claude-code-031' && atomic === 'CAP-08.07-A02') {
        const other = byId.get('FACT-claude-code-033');
        originFacts = [fact.id, other.id];
        evidence = [...new Set([...fact.evidence, ...other.evidence])];
        limitations = `${fact.limitations} ${other.limitations}`;
      }
      const support =
        fact.id === 'FACT-claude-code-001' ? 'Partial' : 'Unknown';
      let narrowedFact = fact;
      let statement;
      if (fact.id === 'FACT-claude-code-052') {
        narrowedFact = {
          ...fact,
          observation:
            '2.1.212 在 print mode 收到 SIGTERM 且 Bash 正运行时，会中止 turn、杀死 command process tree 并以 143 退出。`ENTRY=SIGTERM in print mode`; `INPUT=running Bash`; `AVAIL=print mode`; `SIDEFX=process-tree termination`; `STATE=process/turn`; `OUTPUT=exit 143`; `FAIL=defined termination`; `SEC=resource cleanup`; `OBS=exit/status`',
        };
        statement =
          'Claude Code 2.1.212 changelog 声明 print mode 收到 SIGTERM 时终止运行中的 Bash process tree 并以 143 退出；本轮未发送信号。';
      }
      if (fact.id === 'FACT-claude-code-054') {
        narrowedFact = {
          ...fact,
          observation:
            '2.1.219（包含于 2.1.220）新增 `DirectoryAdded` hook，在 CLI `/add-dir` 于 session 中注册新工作目录后触发。`ENTRY=/add-dir`; `INPUT=new directory`; `STATE=session roots`; `OUTPUT=DirectoryAdded event`; `EXT=hook`; `OBS=hook event`',
        };
        statement =
          'Claude Code 2.1.220 changelog 声明 CLI `/add-dir` 注册新目录后触发 `DirectoryAdded` hook；payload 与失败语义未运行。';
      }
      claims.push(
        baseClaim('claude-code', narrowedFact, atomic, registry, {
          slice,
          originFacts,
          evidence,
          limitations,
          support,
          statement,
          lifecycle: claudeLifecycle(fact, atomic),
          future: 'not-applicable',
          contract: claudeContractFor(
            fact,
            atomic,
            registry.get(atomic),
            narrowedFact.observation,
          ),
          configuration:
            fact.id === 'FACT-claude-code-053'
              ? ['sandbox.network.strictAllowlist=true']
              : [],
        }),
      );
    }
  }
  return claims;
}

function buildQwen(registry, facts) {
  const claims = [];
  const byId = new Map(facts.map((fact) => [fact.id, fact]));
  for (const fact of facts) {
    if (qwenExcludedFacts.has(fact.id)) continue;
    const slice = makeSlice('qwen-code', {
      terminal: terminalFor(fact.observation),
    });
    if (fact.id === 'FACT-qwen-code-024') {
      for (const atomic of fact.atomics) {
        if (
          ['CAP-06.05-A01', 'CAP-06.05-A02', 'CAP-06.05-A03'].includes(atomic)
        ) {
          for (const backend of ['Seatbelt', 'Docker', 'Podman']) {
            claims.push(
              baseClaim('qwen-code', fact, atomic, registry, {
                slice: makeSlice('qwen-code', {
                  sandboxBackend: backend,
                }),
                evidence:
                  backend === 'Seatbelt'
                    ? ['EVD-qwen-code-DOC-012', 'EVD-qwen-code-SOURCE-008']
                    : ['EVD-qwen-code-DOC-012'],
                configuration: [`sandbox backend=${backend}`],
                statement: `冻结${backend === 'Seatbelt' ? '文档/source' : '文档'}记录 ${backend} 中与“${registry.get(atomic).job}”相关的 sandbox Surface；拒绝与逃逸路径未运行。`,
                contract: qwenContractFor(fact, atomic, registry.get(atomic)),
              }),
            );
          }
          continue;
        }
        if (atomic === 'CAP-06.05-A04') {
          for (const backend of ['Docker', 'Podman']) {
            claims.push(
              baseClaim('qwen-code', fact, atomic, registry, {
                slice: makeSlice('qwen-code', {
                  sandboxBackend: backend,
                }),
                evidence: ['EVD-qwen-code-DOC-012'],
                configuration: [`sandbox backend=${backend}`],
                contract: qwenContractFor(fact, atomic, registry.get(atomic)),
              }),
            );
          }
          continue;
        }
        claims.push(
          baseClaim('qwen-code', fact, atomic, registry, {
            slice,
            evidence:
              atomic === 'CAP-06.08-A05'
                ? ['EVD-qwen-code-DOC-019']
                : fact.evidence,
            contract: qwenContractFor(fact, atomic, registry.get(atomic)),
          }),
        );
      }
      continue;
    }
    if (fact.id === 'FACT-qwen-code-039') {
      const headlessFact = {
        ...fact,
        observation:
          'Headless mode 接受 `-p/--prompt` 与 stdin，并在 non-TTY 下公开 text/json/stream-json；文档记录 budget、turn、SIGINT 等退出码及机器错误输出。',
      };
      const dualOutputFact = {
        ...fact,
        observation:
          'Interactive Dual Output 是显式启用的 TTY sidecar JSON event 与 reverse-command stream；它不等同 headless stream-json。',
      };
      for (const atomic of fact.atomics) {
        if (atomic === 'CAP-10.03-A02') {
          const headlessClaim = baseClaim(
            'qwen-code',
            headlessFact,
            atomic,
            registry,
            {
              slice: makeSlice('qwen-code', { terminal: 'non-tty' }),
              evidence: ['EVD-qwen-code-HELP-001', 'EVD-qwen-code-DOC-008'],
              configuration: ['output=stream-json'],
              statement:
                '冻结 Help/文档公开 non-TTY stream-json Surface；事件顺序、结束语义与错误通道未运行。',
              contract: emptyContract(registry.get(atomic)),
            },
          );
          headlessClaim.contract.RM = 'R[non-interactive; non-tty]';
          claims.push(headlessClaim);
          const dualOutputClaim = baseClaim(
            'qwen-code',
            dualOutputFact,
            atomic,
            registry,
            {
              slice: makeSlice('qwen-code', { terminal: 'tty' }),
              evidence: ['EVD-qwen-code-DOC-031'],
              configuration: ['output=interactive dual-output sidecar'],
              statement:
                '冻结文档公开 TTY Interactive Dual Output sidecar；它不与 headless stream-json 合并，且尚未运行。',
              contract: emptyContract(registry.get(atomic)),
            },
          );
          dualOutputClaim.contract.RM = 'R[interactive; tty]';
          claims.push(dualOutputClaim);
        } else {
          const headlessClaim = baseClaim(
            'qwen-code',
            headlessFact,
            atomic,
            registry,
            {
              slice: makeSlice('qwen-code', { terminal: 'non-tty' }),
              evidence: ['EVD-qwen-code-HELP-001', 'EVD-qwen-code-DOC-008'],
              contract: emptyContract(registry.get(atomic)),
            },
          );
          headlessClaim.contract.RM = 'R[non-interactive; non-tty]';
          claims.push(headlessClaim);
        }
      }
      continue;
    }
    for (const atomic of fact.atomics) {
      if (
        (fact.id === 'FACT-qwen-code-006' && atomic === 'CAP-02.10-A03') ||
        (fact.id === 'FACT-qwen-code-036' && atomic === 'CAP-09.02-A01')
      ) {
        continue;
      }
      let originFacts = [fact.id];
      let evidence = qwenEvidenceFor(fact, atomic);
      let limitations = fact.limitations;
      let statement;
      let narrowedFact = fact;
      let claimSlice = slice;
      if (fact.id === 'FACT-qwen-code-012') {
        if (atomic === 'CAP-03.07-A01' || atomic === 'CAP-03.07-A02') {
          narrowedFact = {
            ...fact,
            observation:
              '0.21.0 tag 的 maintainer test 覆盖 same-turn steering 输入的恢复与消费顺序。',
          };
          claimSlice = makeSlice('qwen-code', { terminal: 'unknown' });
        } else if (atomic === 'CAP-03.12-A01') {
          narrowedFact = {
            ...fact,
            observation:
              '0.21.0 tag 的 loop detection source/test 覆盖重复工具调用、shell stagnation 与重复内容检测。',
          };
          claimSlice = makeSlice('qwen-code', { terminal: 'unknown' });
        } else {
          narrowedFact = {
            ...fact,
            observation:
              '0.21.0 headless 文档记录 turn、wall-time、tool-call budgets，maintainer test 覆盖 turn-budget guard。',
          };
          claimSlice = makeSlice('qwen-code', { terminal: 'non-tty' });
        }
      }
      if (fact.id === 'FACT-qwen-code-034' && atomic === 'CAP-08.05-A01') {
        const messagingFact = byId.get('FACT-qwen-code-031');
        originFacts = [fact.id, messagingFact.id];
        evidence = ['EVD-qwen-code-DOC-019', 'EVD-qwen-code-SOURCE-005'];
        narrowedFact = {
          ...fact,
          observation:
            'Qwen Code 0.21.0 tag 的 subagent 文档与 source 公开 generic `send_message`，用于向已存在的 subagent 目标发送消息。',
          epistemic: 'Confirmed',
        };
        limitations =
          '只确认 generic subagent messaging Surface；消息交付、目标身份、失败语义与 Team availability 均未运行。';
        statement =
          '冻结 subagent 文档/source 暴露 generic send_message Surface；它不证明 Agent Team runtime availability。';
      }
      if (fact.id === 'FACT-qwen-code-035' && atomic === 'CAP-09.02-A01') {
        const other = byId.get('FACT-qwen-code-036');
        originFacts = [fact.id, other.id];
        evidence = [...new Set([...fact.evidence, ...other.evidence])];
        limitations = `${fact.limitations} ${other.limitations}`;
      }
      const isApproval =
        fact.id === 'FACT-qwen-code-022' && atomic === 'CAP-06.02-A01';
      const isTeam =
        fact.id === 'FACT-qwen-code-034' && atomic !== 'CAP-08.05-A01';
      const claim = baseClaim('qwen-code', narrowedFact, atomic, registry, {
        slice: claimSlice,
        originFacts,
        evidence,
        limitations,
        support: 'Unknown',
        lifecycle:
          fact.id === 'FACT-qwen-code-033'
            ? 'experimental'
            : isTeam
              ? 'unknown'
              : 'not-checked',
        future: isTeam ? 'announced' : 'not-checked',
        conflicts: isApproval || isTeam ? ['Other'] : [],
        epistemic: isTeam ? 'Unknown' : narrowedFact.epistemic,
        statement,
        contract: qwenContractFor(fact, atomic, registry.get(atomic)),
      });
      if (fact.id === 'FACT-qwen-code-034' && atomic === 'CAP-08.05-A01') {
        claim.contract.SX = 'R[inter-agent message delivery]';
      }
      if (isApproval && atomic === 'CAP-06.02-A01') {
        claim.contract.AD = 'U';
        claim.statement =
          '冻结文档确认五种 approval modes 与切换入口，但同一文档对干净配置默认姿态存在冲突。';
      }
      if (isTeam) {
        claim.statement = `冻结 source/config 暴露与“${registry.get(atomic).job}”相关的 Agent Team Surface，但同版本用户文档称其 planned/not implemented，运行可用性未知。`;
      }
      claims.push(claim);
    }
  }
  return claims;
}

function assignClaimIds(claims) {
  const counters = new Map();
  for (const claim of claims) {
    const key = `${claim.product}:${claim.atomic}`;
    const sequence = (counters.get(key) ?? 0) + 1;
    counters.set(key, sequence);
    claim.id = `CCQ-${claim.product}-${claim.atomic}-${String(sequence).padStart(3, '0')}`;
  }
}

function primaryEvidenceRelation(claim, evidence) {
  const type = evidenceType(evidence);
  if (
    claim.originFacts.includes('FACT-qwen-code-034') &&
    evidence === 'EVD-qwen-code-DOC-021'
  ) {
    return 'contradicts';
  }
  if (type === 'BINARY') return 'qualifies';
  if (
    type === 'DOC' &&
    (claim.product === 'codex' || claim.product === 'claude-code')
  ) {
    return 'qualifies';
  }
  if (
    type === 'CHANGELOG' &&
    claim.product === 'claude-code' &&
    !claim.originFacts.some((factId) =>
      ['FACT-claude-code-052', 'FACT-claude-code-054'].includes(factId),
    )
  ) {
    return 'qualifies';
  }
  return 'supports';
}

function normalizeSupportByEvidence(claims) {
  for (const claim of claims) {
    if (
      claim.support !== 'Unknown' &&
      !claim.evidence.some(
        (evidence) => primaryEvidenceRelation(claim, evidence) === 'supports',
      )
    ) {
      claim.support = 'Unknown';
    }
  }
}

function relationRows(claims) {
  const groups = new Map();
  const add = (evidence, relation, note, claimId) => {
    const key = `${evidence}\u0000${relation}\u0000${note}`;
    const group = groups.get(key) ?? { evidence, relation, note, claims: [] };
    group.claims.push(claimId);
    groups.set(key, group);
  };
  for (const claim of claims) {
    for (const evidence of claim.evidence) {
      const type = evidenceType(evidence);
      const relation = primaryEvidenceRelation(claim, evidence);
      const note =
        relation === 'contradicts'
          ? 'user documentation says Agent Team is planned and not implemented'
          : evidence === 'EVD-qwen-code-DOC-031'
            ? 'supports the isolated exact-version TTY sidecar statement only'
            : relation === 'qualifies' && type === 'BINARY'
              ? 'exact implementation-surface only; runtime availability is not proved'
              : relation === 'qualifies' && type === 'CHANGELOG'
                ? 'versioned release statement constrains the Claim but does not prove runtime behavior'
                : relation === 'qualifies'
                  ? 'current documentation constrains the Claim but does not prove exact-version runtime'
                  : type === 'HELP'
                    ? 'supports the bounded exact-version discoverability statement only'
                    : type === 'SOURCE' || type === 'TEST'
                      ? 'supports the bounded exact-version implementation or maintainer-test statement'
                      : 'directly supports the bounded Claim statement';
      add(evidence, relation, note, claim.id);
      if (
        claim.originFacts.includes('FACT-qwen-code-022') &&
        claim.atomic === 'CAP-06.02-A01' &&
        evidence === 'EVD-qwen-code-DOC-010'
      ) {
        add(
          evidence,
          'contradicts',
          'the same document gives conflicting clean-config default modes',
          claim.id,
        );
      }
    }
  }
  const rows = [];
  for (const group of groups.values()) {
    for (let index = 0; index < group.claims.length; index += 12) {
      rows.push({ ...group, claims: group.claims.slice(index, index + 12) });
    }
  }
  return rows;
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

function renderTable(headers, rows) {
  const header = `| ${headers.join(' | ')} |`;
  const divider = `| ${headers.map(() => '---').join(' | ')} |`;
  const body = rows.map(
    (row) => `| ${row.map((cell) => tableCell(cell)).join(' | ')} |`,
  );
  return [header, divider, ...body].join('\n');
}

export function renderClaimDocument(product, claims) {
  const slices = [
    ...new Map(claims.map((claim) => [claim.slice.id, claim.slice])).values(),
  ];
  const lines = [
    `# ${productMeta[product].label} CLI：Phase 1C.1 Claim Records`,
    '',
    `> 正式 Claim：${claims.length}`,
    `> 版本：${[...new Set(claims.map((claim) => claim.slice.version))].join(', ')}`,
    '> Surface：`cli`',
    `> Claim last_checked：${phase1CReviewedAt}`,
    '',
    '本文是 Claim schema 的关系型 Markdown 投影。每条 Claim 必须同时展开 Slice Registry、Claim Core 与 Behavior Contract Matrix；Evidence Relation Extension 补齐上游 immutable Evidence 的 Claim 级关系。',
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
          claim.evidence.map((id) => `\`${id}\``).join(', '),
          [
            claim.provider !== 'not-applicable'
              ? `provider=${claim.provider}`
              : '',
            ...claim.configuration,
          ]
            .filter(Boolean)
            .join('; ') || 'none',
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
    '编码见 [`06-phase-1c-claim-normalization.md`](../06-phase-1c-claim-normalization.md)：`R[value]`、`CN`、`U`、`NC`、`NA`。Registry 未要求的叶为 `NA`；已要求但当前证据未调查的叶为 `NC`。',
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
        `\`${row.evidence}\``,
        `\`${row.relation}\``,
        row.claims.map((id) => `\`${id}\``).join(', '),
        row.note,
      ]),
    ),
    '',
  );
  return `${lines.join('\n')}\n`;
}

function validateClaims(allClaims, registry, knownEvidence) {
  const expected = { codex: 84, 'claude-code': 132, 'qwen-code': 209 };
  const errors = [];
  const allIds = new Set();
  for (const [product, claims] of Object.entries(allClaims)) {
    if (claims.length !== expected[product]) {
      errors.push(
        `${product}: expected ${expected[product]}, got ${claims.length}`,
      );
    }
    for (const claim of claims) {
      if (allIds.has(claim.id)) errors.push(`duplicate Claim ID ${claim.id}`);
      allIds.add(claim.id);
      if (!registry.has(claim.atomic))
        errors.push(`unknown atomic ${claim.atomic}`);
      if (claim.slice.surface !== 'cli')
        errors.push(`non-CLI claim ${claim.id}`);
      if (
        claim.slice.version.includes('docs@') ||
        claim.slice.version.includes('current')
      ) {
        errors.push(`non-exact version ${claim.id}`);
      }
      for (const leaf of leafOrder) {
        if (!/^(R\[.+\]|CN|U|NC|NA)$/.test(claim.contract[leaf])) {
          errors.push(
            `invalid ${leaf} in ${claim.id}: ${claim.contract[leaf]}`,
          );
        }
        if (
          !registry.get(claim.atomic).requiredLeaves.has(leaf) &&
          claim.contract[leaf] !== 'NA'
        ) {
          errors.push(`non-required ${leaf} in ${claim.id} must be NA`);
        }
      }
      for (const evidence of claim.evidence) {
        if (!knownEvidence[product].has(evidence)) {
          errors.push(`unknown evidence ${evidence} in ${claim.id}`);
        }
      }
      if (
        claim.originFacts.includes('FACT-qwen-code-022') &&
        claim.atomic === 'CAP-06.02-A01' &&
        (claim.contract.AD !== 'U' ||
          claim.support !== 'Unknown' ||
          !claim.conflicts.includes('Other'))
      ) {
        errors.push(`approval conflict upgraded in ${claim.id}`);
      }
      if (
        claim.originFacts.includes('FACT-qwen-code-034') &&
        claim.atomic !== 'CAP-08.05-A01' &&
        (claim.support !== 'Unknown' ||
          claim.lifecycle !== 'unknown' ||
          claim.future !== 'announced' ||
          !claim.conflicts.includes('Other'))
      ) {
        errors.push(`Agent Team conflict upgraded in ${claim.id}`);
      }
    }
  }
  if (errors.length) throw new Error(errors.join('\n'));
}

export function buildPhase1C({ write = true } = {}) {
  const registry = parseRegistry();
  const facts = Object.fromEntries(
    Object.keys(productMeta).map((product) => [product, parseFacts(product)]),
  );
  const knownEvidence = Object.fromEntries(
    Object.keys(productMeta).map((product) => [
      product,
      parseEvidenceIds(product),
    ]),
  );
  const claims = {
    codex: buildCodex(registry, facts.codex),
    'claude-code': buildClaude(registry, facts['claude-code']),
    'qwen-code': buildQwen(registry, facts['qwen-code']),
  };
  for (const productClaims of Object.values(claims)) {
    normalizeSupportByEvidence(productClaims);
    assignClaimIds(productClaims);
  }
  validateClaims(claims, registry, knownEvidence);
  if (write) {
    fs.mkdirSync(claimsDir, { recursive: true });
    const generatedFiles = [];
    for (const [product, productClaims] of Object.entries(claims)) {
      const outputFile = path.join(claimsDir, `${product}-cli.md`);
      fs.writeFileSync(outputFile, renderClaimDocument(product, productClaims));
      generatedFiles.push(outputFile);
    }
    const repoRoot = path.resolve(root, '../../..');
    const prettier = path.join(repoRoot, 'node_modules', '.bin', 'prettier');
    if (fs.existsSync(prettier)) {
      execFileSync(
        prettier,
        ['--write', '--ignore-path', '/dev/null', ...generatedFiles],
        {
          cwd: repoRoot,
          stdio: 'ignore',
        },
      );
    }
  }
  return { registry, facts, knownEvidence, claims };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const { claims } = buildPhase1C();
  const counts = Object.fromEntries(
    Object.entries(claims).map(([product, rows]) => [product, rows.length]),
  );
  process.stdout.write(`${JSON.stringify(counts)}\n`);
}
