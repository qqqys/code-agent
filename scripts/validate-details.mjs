import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const context = vm.createContext({ window: {} });

for (const file of ['site/data.js', 'site/details.js']) {
  vm.runInContext(fs.readFileSync(path.join(root, file), 'utf8'), context);
}

const data = context.window.matrixData;
const details = context.window.capabilityDetails;
const rowIds = new Set(data.rows.map((row) => row.id));
const commandRows = data.rows.filter((row) => row.category === 'commands');
const commandIds = new Set(commandRows.map((row) => row.id));
const detailIds = new Set(Object.keys(details));
const requiredFields = [
  'commands',
  'aliases',
  'parameters',
  'behavior',
  'mode',
  'persistence',
  'conditions',
  'status',
  'sources',
];
const errors = [];

if (rowIds.size !== data.rows.length) {
  errors.push('能力 ID 存在重复。');
}

for (const id of commandIds) {
  if (!detailIds.has(id)) errors.push(`Slash 命令缺少详情：${id}`);
}

for (const id of detailIds) {
  if (!commandIds.has(id)) errors.push(`详情不属于当前 Slash 命令矩阵：${id}`);
}

for (const row of commandRows) {
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
    for (const field of requiredFields) {
      if (record[field] === undefined || record[field] === null) {
        errors.push(`${row.id}/${product.id} 缺少 ${field}`);
      }
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

  const markdownPath = path.join(
    root,
    'docs/capabilities/commands',
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
  `Validated ${commandRows.length} details × ${data.products.length} products.`,
);
