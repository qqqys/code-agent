import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const context = vm.createContext({ window: {} });

for (const file of [
  'site/data.js',
  'site/details.js',
  'site/subagent-details.js',
  'site/security-details.js',
  'site/session-details.js',
  'site/extension-details.js',
  'site/execution-details.js',
  'site/surface-details.js',
]) {
  vm.runInContext(fs.readFileSync(path.join(root, file), 'utf8'), context);
}

const data = context.window.matrixData;
const details = context.window.capabilityDetails;
const outputDir = path.join(root, 'docs/capabilities/surfaces');
fs.mkdirSync(outputDir, { recursive: true });

function cell(value) {
  return String(value).replaceAll('|', '\\|').replaceAll('\n', '<br>');
}

function sourceLinks(sourceIds) {
  return sourceIds
    .map((id) => data.sources[id])
    .map((source) => `[${source.label}](${source.url})`)
    .join('、');
}

function detailLink(id) {
  return `https://qqqys.github.io/code-agent/capability.html?id=${encodeURIComponent(id)}`;
}

function relatedLink(related) {
  if (!details[related.id]) return null;
  const directories = {
    commands: 'commands',
    subagents: 'subagents',
    security: 'security',
    sessions: 'sessions',
    extensions: 'extensions',
    execution: 'execution',
    surfaces: 'surfaces',
  };
  const directory = directories[related.category];
  if (!directory) return null;
  return directory === 'surfaces'
    ? `./${related.id}.md`
    : `../${directory}/${related.id}.md`;
}

const rows = data.rows.filter((row) => row.category === 'surfaces');

for (const row of rows) {
  const detail = details[row.id];
  if (!detail) throw new Error(`Missing detail for ${row.id}`);

  const lines = [
    `# ${row.capability}`,
    '',
    `[返回 Headless、SDK 与多端详情目录](./README.md) · [打开网页详情](${detailLink(row.id)})`,
    '',
    `> 核对日期：${data.updatedAt}`,
    '',
    '## 定义',
    '',
    detail.definition,
    '',
    '## 能力结论',
    '',
    '| 产品 | 结论 | 证据状态 |',
    '| --- | --- | --- |',
    ...data.products.map((product) => {
      const record = detail.products[product.id];
      return `| ${product.name} | ${cell(record.value)} | ${record.status} |`;
    }),
    '',
    '## 比较边界',
    '',
    '### 本页包含',
    '',
    ...detail.includes.map((item) => `- ${item}`),
    '',
    '### 本页不包含',
    '',
    ...detail.excludes.map((item) => `- ${item}`),
    '',
    '## 跨产品事实',
    '',
    ...detail.facts.map((fact, index) => `${index + 1}. ${fact}`),
    '',
    '## 逐产品记录',
    '',
  ];

  for (const product of data.products) {
    const record = detail.products[product.id];
    lines.push(
      `### ${product.name}`,
      '',
      '| 字段 | 记录 |',
      '| --- | --- |',
      `| 矩阵结论 | ${cell(record.value)} |`,
      `| 入口与调用 | ${cell(record.entry)} |`,
      `| 协议与输出 | ${cell(record.protocol)} |`,
      `| 具体行为 | ${cell(record.behavior)} |`,
      `| 会话与状态 | ${cell(record.state)} |`,
      `| 工具与能力 | ${cell(record.tools)} |`,
      `| 认证与权限 | ${cell(record.auth)} |`,
      `| 运行位置 | ${cell(record.deployment)} |`,
      `| 条件与边界 | ${cell(record.conditions)} |`,
      `| 证据状态 | ${record.status} |`,
      `| 来源 | ${sourceLinks(record.sources)} |`,
      '',
    );
  }

  const sourceIds = [
    ...new Set(
      Object.values(detail.products).flatMap((product) => product.sources),
    ),
  ];
  lines.push(
    '## 官方来源',
    '',
    ...sourceIds.map((id) => {
      const source = data.sources[id];
      return `- [${source.label}](${source.url})`;
    }),
    '',
    '## 关联能力',
    '',
    ...detail.related.map((id) => {
      const related = data.rows.find((candidate) => candidate.id === id);
      if (!related) throw new Error(`Unknown related capability ${id}`);
      const href = relatedLink(related);
      return href
        ? `- [${related.capability}](${href})`
        : `- ${related.capability}：见对应能力矩阵`;
    }),
    '',
  );

  fs.writeFileSync(
    path.join(outputDir, `${row.id}.md`),
    `${lines.join('\n').trimEnd()}\n`,
  );
}

const indexLines = [
  '# Headless、SDK 与多端能力详情',
  '',
  '[返回 Headless、SDK 与多端矩阵](../../07-Headless-SDK与多端矩阵.md) · [打开网页矩阵](https://qqqys.github.io/code-agent/#surfaces)',
  '',
  `> 核对日期：${data.updatedAt}`,
  '',
  '每一页固定记录能力定义、比较边界、五家结论、入口与调用、协议与输出、具体行为、会话与状态、工具与能力、认证与权限、运行位置、条件和官方来源。',
  '',
  '| 能力 | 网页 | Markdown |',
  '| --- | --- | --- |',
  ...rows.map(
    (row) =>
      `| ${row.capability} | [打开](${detailLink(row.id)}) | [查看](./${row.id}.md) |`,
  ),
  '',
];
fs.writeFileSync(
  path.join(outputDir, 'README.md'),
  `${indexLines.join('\n').trimEnd()}\n`,
);

const matrixLines = [
  '# Headless、SDK 与多端矩阵',
  '',
  '[返回文档目录](./README.md) · [网页矩阵](https://qqqys.github.io/code-agent/#surfaces) · [详情目录](./capabilities/surfaces/)',
  '',
  `> 核对日期：${data.updatedAt}`,
  '',
  '| 能力 | Claude Code | Codex | Qwen Code | Kimi Code | Qoder CLI |',
  '| --- | --- | --- | --- | --- | --- |',
  ...rows.map(
    (row) =>
      `| [${row.capability}](./capabilities/surfaces/${row.id}.md) | ${cell(row.values.claude)} | ${cell(row.values.codex)} | ${cell(row.values.qwen)} | ${cell(row.values.kimi)} | ${cell(row.values.qoder)} |`,
  ),
  '',
  '## 阅读边界',
  '',
  '本矩阵把一次性 Headless、结构化输出、Agent SDK、常驻服务、CLI、IDE/ACP、Web、Desktop、托管云任务和远程接管拆成不同字段。能把本地服务部署到云主机，不等于厂商提供托管 Cloud Mode；能从浏览器打开本地会话，也不等于任务已转移到云端执行。',
  '',
  '## 详情字段',
  '',
  '每个能力页分别记录五家的入口与调用、协议与输出、具体行为、会话与状态、工具与能力、认证与权限、运行位置、条件和官方来源。',
  '',
];
fs.writeFileSync(
  path.join(root, 'docs/07-Headless-SDK与多端矩阵.md'),
  `${matrixLines.join('\n').trimEnd()}\n`,
);

console.log(`Generated ${rows.length} Headless, SDK, and surface documents.`);
