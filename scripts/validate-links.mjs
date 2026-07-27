import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const roots = ['README.md', 'docs', 'updates'];
const markdownFiles = [];

function collect(target) {
  const absolute = path.join(root, target);
  const stat = fs.statSync(absolute);
  if (stat.isFile()) {
    if (target.endsWith('.md')) markdownFiles.push(target);
    return;
  }
  for (const entry of fs.readdirSync(absolute)) {
    collect(path.join(target, entry));
  }
}

for (const target of roots) collect(target);

const errors = [];
for (const file of markdownFiles) {
  const content = fs.readFileSync(path.join(root, file), 'utf8');
  for (const match of content.matchAll(/\[[^\]]+\]\(([^)]+)\)/g)) {
    const href = match[1].split('#')[0];
    if (!href || /^(?:https?:|mailto:)/.test(href)) continue;

    let target = path.resolve(root, path.dirname(file), decodeURIComponent(href));
    if (fs.existsSync(target) && fs.statSync(target).isDirectory()) {
      target = path.join(target, 'README.md');
    }
    if (!fs.existsSync(target)) {
      errors.push(`${file}: ${href}`);
    }
  }
}

if (errors.length) {
  console.error(`无效本地链接：\n${errors.join('\n')}`);
  process.exit(1);
}

console.log(`Validated links in ${markdownFiles.length} Markdown files.`);
