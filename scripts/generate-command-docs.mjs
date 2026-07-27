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
]) {
  vm.runInContext(fs.readFileSync(path.join(root, file), 'utf8'), context);
}

const data = context.window.matrixData;
const details = context.window.capabilityDetails;
const outputDir = path.join(root, 'docs/capabilities/commands');
fs.mkdirSync(outputDir, { recursive: true });

function cell(value) {
  return String(value).replaceAll('|', '\\|').replaceAll('\n', '<br>');
}

function commandList(values) {
  return values.length ? values.map((value) => `\`${value}\``).join('、') : '无对应命令';
}

function aliasList(values) {
  return values.length ? values.map((value) => `\`${value}\``).join('、') : '无公开别名';
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
  };
  const directory = directories[related.category];
  if (!directory) return null;
  return directory === 'commands'
    ? `./${related.id}.md`
    : `../${directory}/${related.id}.md`;
}

const commandRows = data.rows.filter((row) => row.category === 'commands');

for (const row of commandRows) {
  const detail = details[row.id];
  if (!detail) {
    throw new Error(`Missing detail for ${row.id}`);
  }

  const lines = [
    `# ${row.capability}`,
    '',
    `[返回 Slash 命令详情目录](./README.md) · [打开网页详情](${detailLink(row.id)})`,
    '',
    `> 核对日期：${data.updatedAt}`,
    '',
    '## 定义',
    '',
    detail.definition,
    '',
    '## 命令对照',
    '',
    '| 产品 | 命令摘要 | 证据状态 |',
    '| --- | --- | --- |',
    ...data.products.map((product) => {
      const record = detail.products[product.id];
      return `| ${product.name} | ${cell(commandList(record.commands))} | ${record.status} |`;
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
      `| 主命令 | ${cell(commandList(record.commands))} |`,
      `| 别名 | ${cell(aliasList(record.aliases))} |`,
      `| 参数 | ${cell(record.parameters)} |`,
      `| 执行行为 | ${cell(record.behavior)} |`,
      `| 可用模式 | ${cell(record.mode)} |`,
      `| 保存范围 | ${cell(record.persistence)} |`,
      `| 条件与边界 | ${cell(record.conditions)} |`,
      `| 证据状态 | ${record.status} |`,
      `| 来源 | ${sourceLinks(record.sources)} |`,
      '',
    );
  }

  const sourceIds = [
    ...new Set(Object.values(detail.products).flatMap((product) => product.sources)),
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
  '# Slash 命令详情',
  '',
  '[返回 Slash 命令矩阵](../../01-Slash命令矩阵.md) · [打开网页矩阵](https://qqqys.github.io/code-agent/#commands)',
  '',
  `> 核对日期：${data.updatedAt}`,
  '',
  '每一页固定记录能力定义、比较边界、五家命令、参数、行为、可用模式、保存范围、条件和官方来源。',
  '',
  '| 能力 | 网页 | Markdown |',
  '| --- | --- | --- |',
  ...commandRows.map(
    (row) =>
      `| ${row.capability} | [打开](${detailLink(row.id)}) | [查看](./${row.id}.md) |`,
  ),
  '',
];
fs.writeFileSync(
  path.join(outputDir, 'README.md'),
  `${indexLines.join('\n').trimEnd()}\n`,
);

const capabilitiesIndex = [
  '# 能力详情',
  '',
  '[返回文档目录](../README.md)',
  '',
  '| 能力域 | 状态 | 详情 |',
  '| --- | --- | --- |',
  '| Slash 命令 | 已完成 | [28 个能力详情](./commands/) |',
  '| Subagent | 已完成 | [22 个能力详情](./subagents/) |',
  '| 权限与沙箱 | 已完成 | [8 个能力详情](./security/) |',
  '| 会话与上下文 | 已完成 | [8 个能力详情](./sessions/) |',
  '| 扩展系统 | 已完成 | [7 个能力详情](./extensions/) |',
  '| 任务执行与 Git | 已完成 | [9 个能力详情](./execution/) |',
  '| Headless、SDK、多端 | 已完成 | [10 个能力详情](./surfaces/) |',
  '| 模型与认证 | 已完成 | [12 个能力详情](./models/) |',
  '',
];
fs.writeFileSync(
  path.join(root, 'docs/capabilities/README.md'),
  `${capabilitiesIndex.join('\n').trimEnd()}\n`,
);

console.log(`Generated ${commandRows.length} command detail documents.`);
