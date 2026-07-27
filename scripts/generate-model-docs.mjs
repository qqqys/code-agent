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
  'site/model-details.js',
]) {
  vm.runInContext(fs.readFileSync(path.join(root, file), 'utf8'), context);
}

const data = context.window.matrixData;
const details = context.window.capabilityDetails;
const outputDir = path.join(root, 'docs/capabilities/models');
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
    models: 'models',
  };
  const directory = directories[related.category];
  if (!directory) return null;
  return directory === 'models'
    ? `./${related.id}.md`
    : `../${directory}/${related.id}.md`;
}

const rows = data.rows.filter((row) => row.category === 'models');

for (const row of rows) {
  const detail = details[row.id];
  if (!detail) throw new Error(`Missing detail for ${row.id}`);

  const lines = [
    `# ${row.capability}`,
    '',
    `[返回模型与认证详情目录](./README.md) · [打开网页详情](${detailLink(row.id)})`,
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
      `| 入口与配置 | ${cell(record.entry)} |`,
      `| 支持范围 | ${cell(record.mechanism)} |`,
      `| 具体行为 | ${cell(record.behavior)} |`,
      `| 会话与作用域 | ${cell(record.scope)} |`,
      `| 持久化位置 | ${cell(record.persistence)} |`,
      `| 自动化用法 | ${cell(record.automation)} |`,
      `| 安全与管理 | ${cell(record.security)} |`,
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
  '# 模型与认证能力详情',
  '',
  '[返回模型与认证矩阵](../../08-模型与认证矩阵.md) · [打开网页矩阵](https://qqqys.github.io/code-agent/#models)',
  '',
  `> 核对日期：${data.updatedAt}`,
  '',
  '每一页固定记录能力定义、比较边界、五家结论、入口与配置、支持范围、具体行为、会话与作用域、持久化位置、自动化用法、安全与管理、条件和官方来源。',
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
  '# 模型与认证矩阵',
  '',
  '[返回文档目录](./README.md) · [网页矩阵](https://qqqys.github.io/code-agent/#models) · [详情目录](./capabilities/models/)',
  '',
  `> 核对日期：${data.updatedAt}`,
  '',
  '| 能力 | Claude Code | Codex | Qwen Code | Kimi Code | Qoder CLI |',
  '| --- | --- | --- | --- | --- | --- |',
  ...rows.map(
    (row) =>
      `| [${row.capability}](./capabilities/models/${row.id}.md) | ${cell(row.values.claude)} | ${cell(row.values.codex)} | ${cell(row.values.qwen)} | ${cell(row.values.kimi)} | ${cell(row.values.qoder)} |`,
  ),
  '',
  '## 阅读边界',
  '',
  '本矩阵把模型选择、推理强度、Provider、API 端点、产品账号登录、API Key、云厂商凭据、环境变量、本地凭据存储、退出、状态检查和组织策略拆成不同字段。能够输入某家模型厂商的 Key，不代表支持任意兼容端点；能够读取环境变量，也不代表所有常见 Provider Key 名都会被自动发现；系统级配置也不自动等同于产品自带 SSO。',
  '',
  '## 详情字段',
  '',
  '每个能力页分别记录五家的入口与配置、支持范围、具体行为、会话与作用域、持久化位置、自动化用法、安全与管理、条件和官方来源。',
  '',
];
fs.writeFileSync(
  path.join(root, 'docs/08-模型与认证矩阵.md'),
  `${matrixLines.join('\n').trimEnd()}\n`,
);

console.log(`Generated ${rows.length} model and authentication documents.`);
