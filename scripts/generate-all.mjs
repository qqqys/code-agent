import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const generators = [
  'generate-command-docs.mjs',
  'generate-subagent-docs.mjs',
  'generate-security-docs.mjs',
  'generate-session-docs.mjs',
  'generate-extension-docs.mjs',
  'generate-execution-docs.mjs',
  'generate-surface-docs.mjs',
  'generate-model-docs.mjs',
];

for (const generator of generators) {
  execFileSync(process.execPath, [path.join(root, 'scripts', generator)], {
    cwd: root,
    stdio: 'inherit',
  });
}
