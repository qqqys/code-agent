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
const rowIds = new Set(data.rows.map((row) => row.id));
const completedCategories = new Set([
  'commands',
  'subagents',
  'security',
  'sessions',
  'extensions',
]);
const completedRows = data.rows.filter((row) =>
  completedCategories.has(row.category),
);
const completedIds = new Set(completedRows.map((row) => row.id));
const detailIds = new Set(Object.keys(details));
const requiredFields = {
  commands: [
    'commands',
    'aliases',
    'parameters',
    'behavior',
    'mode',
    'persistence',
    'conditions',
    'status',
    'sources',
  ],
  subagents: [
    'value',
    'entry',
    'format',
    'behavior',
    'scope',
    'inheritance',
    'isolation',
    'limits',
    'conditions',
    'status',
    'sources',
  ],
  security: [
    'value',
    'entry',
    'defaults',
    'behavior',
    'rules',
    'boundary',
    'persistence',
    'noninteractive',
    'conditions',
    'status',
    'sources',
  ],
  sessions: [
    'value',
    'entry',
    'storage',
    'behavior',
    'scope',
    'automation',
    'persistence',
    'surfaces',
    'conditions',
    'status',
    'sources',
  ],
  extensions: [
    'value',
    'entry',
    'location',
    'behavior',
    'scope',
    'components',
    'loading',
    'surfaces',
    'permissions',
    'conditions',
    'status',
    'sources',
  ],
};
const errors = [];

if (rowIds.size !== data.rows.length) {
  errors.push('能力 ID 存在重复。');
}

for (const id of completedIds) {
  if (!detailIds.has(id)) errors.push(`已完成能力缺少详情：${id}`);
}

for (const id of detailIds) {
  if (!completedIds.has(id)) errors.push(`详情不属于已完成能力域：${id}`);
}

for (const row of completedRows) {
  const detail = details[row.id];
  if (!detail) continue;

  for (const field of ['definition', 'includes', 'excludes', 'facts', 'related']) {
    if (!detail[field] || detail[field].length === 0) {
      errors.push(`${row.id} 缺少 ${field}`);
    }
  }

  for (const product of data.products) {
    const record = detail.products?.[product.id];
    if (!record) {
      errors.push(`${row.id} 缺少 ${product.id} 记录`);
      continue;
    }
    for (const field of requiredFields[row.category]) {
      if (record[field] === undefined || record[field] === null) {
        errors.push(`${row.id}/${product.id} 缺少 ${field}`);
      }
    }
    if (
      ['subagents', 'security', 'sessions', 'extensions'].includes(
        row.category,
      ) &&
      record.value !== row.values[product.id]
    ) {
      errors.push(`${row.id}/${product.id} 的矩阵结论与主表不一致`);
    }
    if (!record.sources?.length) {
      errors.push(`${row.id}/${product.id} 缺少来源`);
    }
    for (const sourceId of record.sources ?? []) {
      if (!data.sources[sourceId]) {
        errors.push(`${row.id}/${product.id} 引用了未知来源 ${sourceId}`);
      }
    }
  }

  for (const relatedId of detail.related) {
    if (!rowIds.has(relatedId)) {
      errors.push(`${row.id} 引用了未知关联能力 ${relatedId}`);
    }
  }

  const directory = {
    commands: 'commands',
    subagents: 'subagents',
    security: 'security',
    sessions: 'sessions',
    extensions: 'extensions',
  }[row.category];
  const markdownPath = path.join(
    root,
    'docs/capabilities',
    directory,
    `${row.id}.md`,
  );
  if (!fs.existsSync(markdownPath)) {
    errors.push(`${row.id} 缺少 Markdown 详情`);
  }
}

if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}

console.log(
  `Validated ${completedRows.length} details × ${data.products.length} products.`,
);
