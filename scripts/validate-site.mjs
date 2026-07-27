import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { JSDOM } from 'jsdom';
import postcss from 'postcss';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), 'utf8');
}

function runScripts(dom, files) {
  for (const file of files) dom.window.eval(read(file));
}

postcss.parse(read('site/styles.css'), { from: 'site/styles.css' });

const indexDom = new JSDOM(read('site/index.html'), {
  runScripts: 'outside-only',
  url: 'https://qqqys.github.io/code-agent/',
});
runScripts(indexDom, [
  'site/data.js',
  'site/details.js',
  'site/subagent-details.js',
  'site/security-details.js',
  'site/session-details.js',
  'site/extension-details.js',
  'site/execution-details.js',
  'site/surface-details.js',
  'site/model-details.js',
  'site/app.js',
]);

const rowCount = indexDom.window.matrixData.rows.length;

assert.equal(
  indexDom.window.document.querySelectorAll('#matrixBody tr').length,
  rowCount,
);
assert.equal(
  indexDom.window.document.querySelectorAll('#matrixBody .capability-link').length,
  rowCount,
);
assert.equal(
  indexDom.window.document.querySelectorAll('#categoryTabs [role="tab"]').length,
  9,
);
assert.equal(
  indexDom.window.document.querySelectorAll('#productToggles input').length,
  5,
);
assert.match(
  indexDom.window.document.querySelector(
    '[data-row-id="model-compatible-endpoint"] td:last-child',
  ).className,
  /cell--conditional/,
);
assert.match(
  indexDom.window.document.querySelector(
    '[data-row-id="auth-cloud-provider"] td:last-child',
  ).className,
  /cell--unknown/,
);

function renderDetail(id) {
  const dom = new JSDOM(read('site/capability.html'), {
    runScripts: 'outside-only',
    url: `https://qqqys.github.io/code-agent/capability.html?id=${id}`,
  });
  runScripts(dom, [
    'site/data.js',
    'site/details.js',
    'site/subagent-details.js',
    'site/security-details.js',
    'site/session-details.js',
    'site/extension-details.js',
    'site/execution-details.js',
    'site/surface-details.js',
    'site/model-details.js',
    'site/capability.js',
  ]);
  assert.equal(dom.window.document.querySelector('#capabilityMain').hidden, false);
  assert.equal(
    dom.window.document.querySelectorAll('#productRecords .product-record').length,
    5,
  );
  assert.equal(dom.window.document.querySelectorAll('#quickGrid .quick-card').length, 5);
  return dom;
}

const commandDom = renderDetail('cmd-model');
const commandLabels = commandDom.window.document.querySelector('#productRecords').textContent;
assert.match(commandLabels, /主命令/);
assert.doesNotMatch(commandLabels, /矩阵结论/);
assert.match(
  commandDom.window.document.querySelector('#markdownLink').href,
  /docs\/capabilities\/commands\/cmd-model\.md$/,
);

const subagentDom = renderDetail('agent-worktree');
const subagentLabels =
  subagentDom.window.document.querySelector('#productRecords').textContent;
assert.match(subagentLabels, /矩阵结论/);
assert.match(subagentLabels, /入口与配置/);
assert.match(subagentLabels, /工作区隔离/);
assert.doesNotMatch(subagentLabels, /主命令/);
assert.equal(
  subagentDom.window.document.querySelector('#categoryLink').getAttribute('href'),
  './#subagents',
);
assert.match(
  subagentDom.window.document.querySelector('#markdownLink').href,
  /docs\/capabilities\/subagents\/agent-worktree\.md$/,
);

const securityDom = renderDetail('security-filesystem');
const securityLabels =
  securityDom.window.document.querySelector('#productRecords').textContent;
assert.match(securityLabels, /默认状态/);
assert.match(securityLabels, /隔离边界/);
assert.match(securityLabels, /非交互行为/);
assert.doesNotMatch(securityLabels, /主命令/);
assert.equal(
  securityDom.window.document.querySelector('#categoryLink').getAttribute('href'),
  './#security',
);
assert.match(
  securityDom.window.document.querySelector('#markdownLink').href,
  /docs\/capabilities\/security\/security-filesystem\.md$/,
);

const sessionDom = renderDetail('session-checkpoint');
const sessionLabels =
  sessionDom.window.document.querySelector('#productRecords').textContent;
assert.match(sessionLabels, /保存位置/);
assert.match(sessionLabels, /自动行为/);
assert.match(sessionLabels, /适用界面/);
assert.doesNotMatch(sessionLabels, /主命令/);
assert.equal(
  sessionDom.window.document.querySelector('#categoryLink').getAttribute('href'),
  './#sessions',
);
assert.match(
  sessionDom.window.document.querySelector('#markdownLink').href,
  /docs\/capabilities\/sessions\/session-checkpoint\.md$/,
);

const extensionDom = renderDetail('extension-plugins');
const extensionLabels =
  extensionDom.window.document.querySelector('#productRecords').textContent;
assert.match(extensionLabels, /入口与配置/);
assert.match(extensionLabels, /扩展构成/);
assert.match(extensionLabels, /权限与信任/);
assert.doesNotMatch(extensionLabels, /主命令/);
assert.equal(
  extensionDom.window.document.querySelector('#categoryLink').getAttribute('href'),
  './#extensions',
);
assert.match(
  extensionDom.window.document.querySelector('#markdownLink').href,
  /docs\/capabilities\/extensions\/extension-plugins\.md$/,
);

const executionDom = renderDetail('execution-worktree');
const executionLabels =
  executionDom.window.document.querySelector('#productRecords').textContent;
assert.match(executionLabels, /核心机制/);
assert.match(executionLabels, /后台与并发/);
assert.match(executionLabels, /Git 与平台联动/);
assert.doesNotMatch(executionLabels, /主命令/);
assert.equal(
  executionDom.window.document.querySelector('#categoryLink').getAttribute('href'),
  './#execution',
);
assert.match(
  executionDom.window.document.querySelector('#markdownLink').href,
  /docs\/capabilities\/execution\/execution-worktree\.md$/,
);

const surfaceDom = renderDetail('surface-service');
const surfaceLabels =
  surfaceDom.window.document.querySelector('#productRecords').textContent;
assert.match(surfaceLabels, /协议与输出/);
assert.match(surfaceLabels, /会话与状态/);
assert.match(surfaceLabels, /运行位置/);
assert.doesNotMatch(surfaceLabels, /主命令/);
assert.equal(
  surfaceDom.window.document.querySelector('#categoryLink').getAttribute('href'),
  './#surfaces',
);
assert.match(
  surfaceDom.window.document.querySelector('#markdownLink').href,
  /docs\/capabilities\/surfaces\/surface-service\.md$/,
);

const modelDom = renderDetail('auth-storage');
const modelLabels =
  modelDom.window.document.querySelector('#productRecords').textContent;
assert.match(modelLabels, /支持范围/);
assert.match(modelLabels, /持久化位置/);
assert.match(modelLabels, /安全与管理/);
assert.doesNotMatch(modelLabels, /主命令/);
assert.equal(
  modelDom.window.document.querySelector('#categoryLink').getAttribute('href'),
  './#models',
);
assert.match(
  modelDom.window.document.querySelector('#markdownLink').href,
  /docs\/capabilities\/models\/auth-storage\.md$/,
);
assert.match(
  modelDom.window.document.querySelector('#quickGrid article:last-child').className,
  /quick-card--unknown/,
);

console.log('Validated matrix render, detail schemas, links, and CSS.');
