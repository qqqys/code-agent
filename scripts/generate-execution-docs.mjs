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
]) {
  vm.runInContext(fs.readFileSync(path.join(root, file), 'utf8'), context);
}

const data = context.window.matrixData;
const details = context.window.capabilityDetails;
const outputDir = path.join(root, 'docs/capabilities/execution');
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
  };
  const directory = directories[related.category];
  if (!directory) return null;
  return directory === 'execution'
    ? `./${related.id}.md`
    : `../${directory}/${related.id}.md`;
}

const rows = data.rows.filter((row) => row.category === 'execution');

for (const row of rows) {
  const detail = details[row.id];
  if (!detail) throw new Error(`Missing detail for ${row.id}`);

  const lines = [
    `# ${row.capability}`,
    '',
    `[返回任务执行与 Git 详情目录](./README.md) · [打开网页详情](${detailLink(row.id)})`,
    '',
    `> 核对日期：${data.updatedAt}`,
    '',
    '## 定义',
    '',
    detail.definition,
    '',
    '## 执行结论',
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
      `| 入口与工具 | ${cell(record.entry)} |`,
      `| 核心机制 | ${cell(record.primitives)} |`,
      `| 执行行为 | ${cell(record.behavior)} |`,
      `| 运行范围 | ${cell(record.scope)} |`,
      `| 后台与并发 | ${cell(record.background)} |`,
      `| Git 与平台联动 | ${cell(record.integration)} |`,
      `| 状态与产物 | ${cell(record.artifacts)} |`,
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
  '# 任务执行与 Git 能力详情',
  '',
  '[返回任务执行与 Git 矩阵](../../06-任务执行与Git矩阵.md) · [打开网页矩阵](https://qqqys.github.io/code-agent/#execution)',
  '',
  `> 核对日期：${data.updatedAt}`,
  '',
  '每一页固定记录能力定义、比较边界、五家结论、入口与工具、核心机制、执行行为、运行范围、后台与并发、Git 与平台联动、状态与产物、条件和官方来源。',
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
  '# 任务执行与 Git 矩阵',
  '',
  '[返回文档目录](./README.md) · [网页矩阵](https://qqqys.github.io/code-agent/#execution) · [详情目录](./capabilities/execution/)',
  '',
  `> 核对日期：${data.updatedAt}`,
  '',
  '| 能力 | Claude Code | Codex | Qwen Code | Kimi Code | Qoder CLI |',
  '| --- | --- | --- | --- | --- | --- |',
  ...rows.map(
    (row) =>
      `| [${row.capability}](./capabilities/execution/${row.id}.md) | ${cell(row.values.claude)} | ${cell(row.values.codex)} | ${cell(row.values.qwen)} | ${cell(row.values.kimi)} | ${cell(row.values.qoder)} |`,
  ),
  '',
  '## 阅读边界',
  '',
  '本矩阵把文件、Shell、搜索、后台任务、代码 Review、Git、Pull Request、CI 和 Worktree 拆开记录。能通过 Shell 完成某件事，不等于产品提供了专用命令、托管服务或稳定 API；详情页会分别写明入口、运行位置、外部写入和 Surface 条件。',
  '',
  '## 详情字段',
  '',
  '每个能力页分别记录五家的入口与工具、核心机制、执行行为、运行范围、后台与并发、Git 与平台联动、状态与产物、条件和官方来源。',
  '',
];
fs.writeFileSync(
  path.join(root, 'docs/06-任务执行与Git矩阵.md'),
  `${matrixLines.join('\n').trimEnd()}\n`,
);

console.log(`Generated ${rows.length} execution and Git detail documents.`);
