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

const finalDocs = [
  'README.md',
  '28-stage-3-scenario-validation-synthesis.md',
  '29-stage-4-qwen-gap-convergence.md',
  '30-stage-5-qwen-backlog-roadmap.md',
  '31-stage-6-final-index-and-maintenance.md',
];
const frozenHashes = {
  '21-final-capability-comparison.md':
    'f5e495a49af13331a80251f1d27e0ecb8c2738310cae828d9359fa34ebc13806',
  '22-qwen-opportunities-and-decisions.md':
    'c838363e1aec9cd86fb1c5c1a61d6573b471649e1c5eb2098bd34b22620c3377',
  '23-final-closure.md':
    '7d59da32bbceeffc7404ab2360fd5727086dfa9b3fe83c027ef1df9fd4d35840',
  '24-stage-3-reopen-and-phase-2d-method.md':
    '5f933bb91f8352e9542cb843c6764abed25f741aaab484a64ae10437a9a34627',
  '25-phase-2d-config-identity-layering-results.md':
    '99e1ac0cd6424cee81c5dee4a299a8d66e653647c0acaf28bbdce292df26b6b2',
  '26-phase-2e-diagnostic-fault-method.md':
    '2421da995de059b0037aeeb38385be47e288f00adf3dcfa90161e0871b02f822',
  '27-phase-2e-diagnostic-fault-results.md':
    '1565bc77a6746292d3697e022244f8851129e77eed6a6cd2363014eb803a32b6',
  '28-stage-3-scenario-validation-synthesis.md':
    'd6b857ab595e8371a8ce42c90abf85f19f099819ea6b066029799c3e01c9c4bb',
  '29-stage-4-qwen-gap-convergence.md':
    '99f84630c10a5afed41ea1a43dbc191dd98f4b87879b807f5036d5749001c3a8',
  '30-stage-5-qwen-backlog-roadmap.md':
    '85e3e8310a162c12c730fb2d945b18b7ea12ea327bf05fbd651e18c83dcb1a1f',
  '31-stage-6-final-index-and-maintenance.md':
    'a3c69fabf7fa66f5789aa60ae8503388db404e84ac0c1b4ccab3c400dbc0af75',
  'artifacts/phase-2d/config-identity-layering.json':
    'dc74e8fd2a4caa06cac8481743bb6e1fdb76c403b21229673fce1ef29f3b3187',
  'artifacts/phase-2e/diagnostic-fault-matrix.json':
    '12d72a25792809ddfacff558bf74e9bd24277745d5af3933c3d4c7790d056915',
  'scripts/run-phase-2d-config-layer-probes.mjs':
    '4ebe1e0582a73fc47e1292b89b5337512a586a1f91b601f0766df36a48474cd7',
  'scripts/run-phase-2e-diagnostic-probes.mjs':
    'cdbd9e7cea755095e98903d721f9740026fc90058cc3e6f7d98d544eb7adbf97',
  'scripts/phase-2c-cli.sb':
    'ff5f599cad03d5c257827314c5a483e3cffaa2fef2d7b70a433e376ad1c700e6',
  'scripts/phase-2d-qwen.sb':
    '995857032aad38d2cea9876a4cbe70c7e29cde577539b9052af30c21d6ff8219',
  'scripts/validate-phase-2d.mjs':
    '182a737d3b0b1c71b933a7c17d49480e307a304f788fe930c3f99862f852987d',
  'scripts/validate-phase-2e.mjs':
    '7a3de8346578ef2da8fa241421baa7703d1af652acc054bffc1f971520f0e0be',
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

function fileHash(relativePath) {
  return createHash('sha256')
    .update(fs.readFileSync(fullPath(relativePath)))
    .digest('hex');
}

function runValidator(relativePath, expectedMarkers) {
  const output = execFileSync(process.execPath, [fullPath(relativePath)], {
    cwd: repoRoot,
    encoding: 'utf8',
  });
  for (const marker of expectedMarkers) {
    assert(output.includes(marker), `${relativePath} missing ${marker}`);
  }
  process.stdout.write(output);
}

function markdownFiles(directory) {
  return fs
    .readdirSync(directory, { withFileTypes: true })
    .flatMap((entry) => {
      const absolutePath = path.join(directory, entry.name);
      if (entry.isDirectory() && entry.name === 'node_modules') return [];
      if (entry.isDirectory()) return markdownFiles(absolutePath);
      return entry.isFile() && entry.name.endsWith('.md')
        ? [absolutePath]
        : [];
    });
}

function validateStageInventory() {
  const names = fs.readdirSync(root);
  for (let stageDocument = 0; stageDocument <= 31; stageDocument += 1) {
    const prefix = `${String(stageDocument).padStart(2, '0')}-`;
    const matches = names.filter(
      (name) => name.startsWith(prefix) && name.endsWith('.md'),
    );
    assert(
      matches.length === 1,
      `expected one top-level ${prefix} document, found ${matches.length}`,
    );
  }
}

function validateFrozenFiles() {
  for (const [relativePath, expectedHash] of Object.entries(frozenHashes)) {
    assert(fs.existsSync(fullPath(relativePath)), `missing ${relativePath}`);
    assert(
      fileHash(relativePath) === expectedHash,
      `${relativePath} SHA-256 drift`,
    );
  }
}

function validateLinksAndIgnore() {
  let localLinkCount = 0;
  for (const absolutePath of markdownFiles(root)) {
    const content = fs.readFileSync(absolutePath, 'utf8');
    for (const match of content.matchAll(/\]\(([^)]+)\)/g)) {
      const target = match[1];
      if (
        target.startsWith('http://') ||
        target.startsWith('https://') ||
        target.startsWith('#') ||
        target.startsWith('/')
      ) {
        continue;
      }
      const withoutAnchor = target.split('#', 1)[0];
      if (!withoutAnchor) continue;
      const resolved = path.resolve(path.dirname(absolutePath), withoutAnchor);
      assert(
        resolved.startsWith(`${root}${path.sep}`) && fs.existsSync(resolved),
        `${path.relative(root, absolutePath)} broken link ${target}`,
      );
      localLinkCount += 1;
    }
  }
  assert(localLinkCount >= 160, 'unexpectedly small local-link inventory');

  for (const relativePath of [
    ...finalDocs,
    'artifacts/phase-2d/config-identity-layering.json',
    'artifacts/phase-2e/diagnostic-fault-matrix.json',
  ]) {
    execFileSync('git', ['check-ignore', '-q', fullPath(relativePath)], {
      cwd: repoRoot,
    });
  }
}

function validateReadme() {
  const content = read('README.md');
  for (const marker of [
    'Final · Original Stage 0–6 complete',
    '31-stage-6-final-index-and-maintenance.md',
    '30-stage-5-qwen-backlog-roadmap.md',
    '29-stage-4-qwen-gap-convergence.md',
    '28-stage-3-scenario-validation-synthesis.md',
    'R2 success/provider 场景仍为独立 Deferred',
    'scripts/validate-stage-6.mjs',
  ]) {
    assert(content.includes(marker), `README missing ${marker}`);
  }
  assert(
    !content.includes('Reopened · Stage 3 in progress'),
    'README still projects Stage 3 in progress',
  );
  assert(!content.includes('| Pending |'), 'README still contains Pending stage');

  const rows = [
    ...content.matchAll(/^\| ([0-6]) \|[^|]+\| ([^|]+) \|$/gm),
  ].map((match) => `${match[1]}:${match[2].trim()}`);
  assert(
    JSON.stringify(rows) ===
      JSON.stringify([
        '0:Complete',
        '1:Complete',
        '2:Complete',
        '3:Complete within authorized R1 boundary',
        '4:Complete',
        '5:Complete',
        '6:Complete',
      ]),
    'README stage status table drift',
  );
}

function validateStage3() {
  const content = read('28-stage-3-scenario-validation-synthesis.md');
  for (const marker of [
    'Complete within authorized R1 boundary',
    '| Total | `53` |',
    '`2` baselines、`4` observed faults、`1` Not assessed fault',
    '`R2-1` argv/stdin success',
    '`R2-2` event/final JSON success',
    '`R2-3` legal output schema',
    '`R2-4` machine provider error taxonomy',
    'R2 不得读取现有 credential',
    'Codex：CLI 与 app-server',
    'Qwen Code：CLI 与 sdk-daemon',
  ]) {
    assert(content.includes(marker), `Stage 3 missing ${marker}`);
  }
  const waves = [
    ...content.matchAll(
      /^\| \[Phase 2([B-E])\]\([^)]+\) \| `(\d+)` \|/gm,
    ),
  ].map((match) => [match[1], Number(match[2])]);
  assert(
    JSON.stringify(waves) ===
      JSON.stringify([
        ['B', 23],
        ['C', 15],
        ['D', 8],
        ['E', 7],
      ]) &&
      waves.reduce((sum, [, count]) => sum + count, 0) === 53,
    'Stage 3 runtime wave arithmetic drift',
  );
  const r2Ids = [
    ...content.matchAll(/^\| `(R2-[1-4])` [^|]+ \|/gm),
  ].map((match) => match[1]);
  assert(
    JSON.stringify(r2Ids) ===
      JSON.stringify(['R2-1', 'R2-2', 'R2-3', 'R2-4']),
    'Stage 3 R2 inventory drift',
  );
}

function validateStage4() {
  const content = read('29-stage-4-qwen-gap-convergence.md');
  const decisionTable = content
    .split('## 2. 收敛结果')[1]
    ?.split('## 3. `S4-01`')[0];
  assert(decisionTable, 'Stage 4 decision table missing');
  const rows = [...decisionTable.matchAll(/^\| `(S4-\d{2})` \|/gm)].map(
    (match) => match[1],
  );
  assert(
    JSON.stringify(rows) ===
      JSON.stringify([
        'S4-01',
        'S4-02',
        'S4-03',
        'S4-04',
        'S4-05',
        'S4-06',
        'S4-07',
        'S4-08',
      ]),
    'Stage 4 decision inventory drift',
  );
  for (const id of ['S4-06', 'S4-07', 'S4-08']) {
    assert(
      decisionTable.includes(`| \`${id}\` | No-build | **No-build** |`),
      `Stage 4 ${id} class must be No-build`,
    );
  }
  const handoff = content.split('## 7. Stage 5 handoff')[1];
  assert(handoff, 'Stage 4 handoff section missing');
  for (const id of ['S4-01', 'S4-02', 'S4-03']) {
    assert(handoff.includes(id), `Stage 4 handoff missing ${id}`);
  }
  for (const id of ['S4-04', 'S4-05', 'S4-06', 'S4-07', 'S4-08']) {
    assert(
      !handoff.match(new RegExp(`进入 roadmap[^\\n]*${id}`)),
      `Stage 4 incorrectly hands ${id} to roadmap`,
    );
  }
}

function validateStage5() {
  const content = read('30-stage-5-qwen-backlog-roadmap.md');
  const rows = [
    ...content.matchAll(/^\| `(BL-\d{2})` \| `(S4-\d{2})` \|/gm),
  ].map((match) => `${match[1]}:${match[2]}`);
  assert(
    JSON.stringify(rows) ===
      JSON.stringify([
        'BL-01:S4-01',
        'BL-02:S4-02',
        'BL-03:S4-03',
      ]),
    'Stage 5 must contain exactly three mapped roadmap items',
  );
  for (const marker of [
    '不构成实现、Issue、PR 或发布时间承诺',
    'Investigation only',
    '以下不进入当前产品 backlog',
    '不编造日期或 story points',
  ]) {
    assert(content.includes(marker), `Stage 5 missing ${marker}`);
  }
}

function validateStage6() {
  const content = read('31-stage-6-final-index-and-maintenance.md');
  for (const marker of [
    'Complete / Original Stage 0–6 closed',
    '`144 topics / 550 Atomics`',
    '| CLI Claims | `425` |',
    '| Current secondary-surface Claims | `38` |',
    '| Phase 2A Comparison Records | `95` |',
    '| Phase 2B–2E runtime executions | `53` |',
    '| Credential reads / provider-model calls / model cost | `0 / 0 / 0` |',
    '`BL-01 / P0`',
    '`BL-02 / P1`',
    '`BL-03 / P1`',
    '`R2-1`：argv/stdin success',
    '`R2-2`：complete event/final lifecycle',
    '`R2-3`：legal output-schema success',
    '`R2-4`：provider transient/permanent error taxonomy',
    '不新增为\n`R2-5`',
    'Codex app-server 与 Qwen sdk-daemon',
    'Codex–Claude 为 `Partial overlap`；涉及 Qwen 的两组为 `Unknown`',
    '三组 pairwise 均为\n  `Partial overlap`',
    '三组 pairwise 均为 `Not assessed`',
    '新增文件和 revision，不覆盖旧切片',
    '没有 stage、commit 或 push',
  ]) {
    assert(content.includes(marker), `Stage 6 missing ${marker}`);
  }
  const r2Ids = [...content.matchAll(/^- `(R2-\d+)`：/gm)].map(
    (match) => match[1],
  );
  assert(
    JSON.stringify(r2Ids) ===
      JSON.stringify(['R2-1', 'R2-2', 'R2-3', 'R2-4']),
    'Stage 6 formal R2 inventory must contain exactly R2-1 through R2-4',
  );
}

function validateBoundaries() {
  const combined = finalDocs.map(read).join('\n');
  for (const forbidden of [
    'Qwen Code 不支持 schema',
    '三产品等价',
    '功能总分',
    '产品排行榜',
    'Reopened · Stage 3 in progress',
    'Superpowers',
  ]) {
    assert(!combined.includes(forbidden), `forbidden boundary claim: ${forbidden}`);
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
  execFileSync(
    prettier,
    [
      '--check',
      ...finalDocs.map(fullPath),
      fullPath('scripts/validate-phase-2d.mjs'),
      fullPath('scripts/validate-phase-2e.mjs'),
      fileURLToPath(import.meta.url),
    ],
    {
      cwd: repoRoot,
      stdio: 'inherit',
    },
  );
}

runValidator('scripts/validate-phase-2e.mjs', [
  '"phase":"Phase 2E"',
  '"status":"PASS"',
  '"executions":7',
]);
runValidator('scripts/validate-final-closure.mjs', [
  '"phase":"Final Closure"',
  '"status":"PASS"',
]);
validateStageInventory();
validateFrozenFiles();
validateLinksAndIgnore();
validateReadme();
validateStage3();
validateStage4();
validateStage5();
validateStage6();
validateBoundaries();
validateDirtyBaseline();
validateFormatting();

process.stdout.write(
  `${JSON.stringify({
    stage: '0-6',
    status: 'PASS',
    runtimeExecutions: 53,
    roadmapItems: 3,
    r2: 'Deferred',
    providerOrModelCalls: 0,
  })}\n`,
);
