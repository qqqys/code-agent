#!/usr/bin/env node

import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(scriptDir, '..');
const repoRoot = path.resolve(root, '../../..');
const prettier = path.join(repoRoot, 'node_modules', '.bin', 'prettier');

const finalFiles = [
  'README.md',
  '21-final-capability-comparison.md',
  '22-qwen-opportunities-and-decisions.md',
  '23-final-closure.md',
];
const formattedFiles = [
  ...finalFiles.map((file) => path.join(root, file)),
  fileURLToPath(import.meta.url),
];
const frozenHashes = {
  'artifacts/phase-2b/safe-wave.json':
    'bdbc65635d4e2ec454bd4bed03d5e29c82f97a6154f57dc28ebba00d167a5393',
  'artifacts/phase-2c/config-schema-matrix.json':
    '37e6d06dd6ac34cf5dab1de179568f1d5495f669d77ebab365e76148f3dd36b8',
  'scripts/run-phase-2c-config-probes.mjs':
    'fd19b1a4ce4ceb9944591e8c88d4ceb1c5435f59c32a6984dd969b637662062a',
  'scripts/phase-2c-cli.sb':
    'ff5f599cad03d5c257827314c5a483e3cffaa2fef2d7b70a433e376ad1c700e6',
};
const expectedDirtyBaseline = [
  ' M package-lock.json',
  ' M packages/core/package.json',
  ' M packages/core/src/config/config.test.ts',
  ' M packages/core/src/config/config.ts',
  ' M packages/core/src/core/coreToolScheduler.test.ts',
  ' M packages/core/src/core/coreToolScheduler.ts',
  ' M packages/core/src/permissions/autoMode.test.ts',
  ' M packages/core/src/permissions/autoMode.ts',
  ' M packages/core/src/permissions/permission-manager.test.ts',
  ' M packages/core/src/permissions/permission-manager.ts',
  ' M packages/core/src/permissions/rule-parser.ts',
  ' M packages/core/src/services/loopDetectionService.test.ts',
  ' M packages/core/src/services/loopDetectionService.ts',
  ' M packages/core/src/tools/read-file.ts',
  ' M packages/core/src/tools/tool-names.ts',
  '?? packages/core/src/tools/file-read-permission.ts',
  '?? packages/core/src/tools/zoom-image.test.ts',
  '?? packages/core/src/tools/zoom-image.ts',
];

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function fullPath(relativePath) {
  return path.join(root, relativePath);
}

function read(relativePath) {
  return fs.readFileSync(fullPath(relativePath), 'utf8');
}

function fileSha256(relativePath) {
  return createHash('sha256')
    .update(fs.readFileSync(fullPath(relativePath)))
    .digest('hex');
}

function validateUpstream() {
  const output = execFileSync(
    process.execPath,
    [fullPath('scripts/validate-phase-2c.mjs')],
    {
      cwd: repoRoot,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    },
  );
  assert(
    output.includes('"phase":"2C"') && output.includes('"status":"PASS"'),
    'Phase 2C and upstream validation did not pass',
  );
}

function validateFrozenArtifacts() {
  for (const [relativePath, expectedHash] of Object.entries(frozenHashes)) {
    assert(fs.existsSync(fullPath(relativePath)), `missing ${relativePath}`);
    assert(
      fileSha256(relativePath) === expectedHash,
      `${relativePath}: frozen SHA-256 drift`,
    );
  }
}

function validateFilesAndLinks() {
  for (const relativePath of finalFiles) {
    const absolutePath = fullPath(relativePath);
    assert(fs.existsSync(absolutePath), `missing ${relativePath}`);
    execFileSync('git', ['check-ignore', '-q', absolutePath], {
      cwd: repoRoot,
    });

    const content = read(relativePath);
    for (const match of content.matchAll(/\]\((\.\/[^)#]+)(?:#[^)]+)?\)/g)) {
      const linkedPath = path.resolve(path.dirname(absolutePath), match[1]);
      assert(
        linkedPath.startsWith(`${root}${path.sep}`) &&
          fs.existsSync(linkedPath),
        `${relativePath}: broken or escaped link ${match[1]}`,
      );
    }
  }
}

function validateComparison() {
  const content = read('21-final-capability-comparison.md');
  const themeIds = [
    ...content.matchAll(/^\| (T\d{2}) \|/gm),
  ].map((match) => match[1]);
  assert(
    JSON.stringify(themeIds) ===
      JSON.stringify([
        'T01',
        'T02',
        'T03',
        'T04',
        'T05',
        'T06',
        'T07',
        'T08',
        'T09',
        'T10',
        'T11',
        'T12',
      ]),
    'final comparison must contain exactly T01-T12',
  );
  for (const marker of [
    '144 topics / 550 Atomics',
    '425 Claims',
    '38 current Claims',
    '95 Comparison Records',
    '以上数字都不是得分',
    'Codex–Claude: Partial overlap; Codex–Qwen: Unknown; Claude–Qwen: Unknown',
    '正式关系 `Not assessed`',
    'model-success=`0`',
  ]) {
    assert(content.includes(marker), `comparison marker missing: ${marker}`);
  }
  assert(
    [...content.matchAll(/Codex–Claude: Partial overlap/g)].length === 1,
    'config Partial overlap summary must appear exactly once',
  );
}

function validateDecisions() {
  const content = read('22-qwen-opportunities-and-decisions.md');
  const normalized = content.replace(/\s+/g, ' ');
  const rows = [
    ...content.matchAll(/^\| (D\d{2}) \| \*\*(Now|Next|Observe|No-build)\*\*/gm),
  ].map((match) => `${match[1]}:${match[2]}`);
  assert(
    JSON.stringify(rows) ===
      JSON.stringify([
        'D01:Now',
        'D02:Next',
        'D03:Observe',
        'D04:Observe',
        'D05:Observe',
        'D06:Observe',
        'D07:No-build',
        'D08:No-build',
      ]),
    'decision inventory drift',
  );
  for (const marker of [
    '不是已承诺的产品 roadmap',
    '不构成实现授权',
    '机器错误契约',
    '配置 consumer 一致性',
    '这是改进提案，不是已确认用户 Gap',
    '当前契约为 `Unknown`',
  ]) {
    assert(normalized.includes(marker), `decision marker missing: ${marker}`);
  }
}

function validateStopLine() {
  const content = read('23-final-closure.md');
  const rows = [
    ...content.matchAll(
      /^\| (R(?:1-(?:1b|2|3)|2-[1-4]))\s+\|[^|]+\| \*\*Deferred at closure\*\* \|/gm,
    ),
  ].map((match) => match[1]);
  assert(
    JSON.stringify(rows) ===
      JSON.stringify(['R1-1b', 'R1-2', 'R1-3', 'R2-1', 'R2-2', 'R2-3', 'R2-4']),
    'stop-line inventory must contain exactly seven deferred probes',
  );
  for (const marker of [
    'Stop-line count：`7/7 Deferred at closure`',
    'New runtime probes: 0',
    '| Credential reads',
    '| Provider/model calls',
    '| Model cost',
    '未修改产品源码',
  ]) {
    assert(content.includes(marker), `closure marker missing: ${marker}`);
  }
}

function validateLanguageBoundaries() {
  const combined = finalFiles.map(read).join('\n');
  for (const forbidden of [
    'Qwen Code 不支持 schema',
    'Claude Code 没有 secondary',
    '三产品等价',
    '功能总分',
    '产品排行榜',
  ]) {
    assert(!combined.includes(forbidden), `forbidden overclaim: ${forbidden}`);
  }
}

function validateDirtyBaseline() {
  const status = execFileSync(
    'git',
    ['status', '--short', '--untracked-files=all'],
    {
      cwd: repoRoot,
      encoding: 'utf8',
    },
  )
    .trimEnd()
    .split('\n')
    .filter(Boolean);
  assert(
    JSON.stringify(status) === JSON.stringify(expectedDirtyBaseline),
    'product worktree dirty baseline changed',
  );
}

function validateFormatting() {
  execFileSync(prettier, ['--check', ...formattedFiles], {
    cwd: repoRoot,
    stdio: 'inherit',
  });
}

validateUpstream();
validateFrozenArtifacts();
validateFilesAndLinks();
validateComparison();
validateDecisions();
validateStopLine();
validateLanguageBoundaries();
validateDirtyBaseline();
validateFormatting();

console.log(
  JSON.stringify({
    phase: 'Final Closure',
    status: 'PASS',
    themes: 12,
    decisions: 8,
    deferredAtClosure: 7,
    newRuntimeProbes: 0,
  }),
);
