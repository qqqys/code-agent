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
  'site/app.js',
]);

assert.equal(indexDom.window.document.querySelectorAll('#matrixBody tr').length, 94);
assert.equal(
  indexDom.window.document.querySelectorAll('#matrixBody .capability-link').length,
  50,
);
assert.equal(
  indexDom.window.document.querySelectorAll('#categoryTabs [role="tab"]').length,
  9,
);
assert.equal(
  indexDom.window.document.querySelectorAll('#productToggles input').length,
  5,
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

console.log('Validated matrix render, detail schemas, links, and CSS.');
