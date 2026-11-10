import { readdir, readFile, stat } from 'node:fs/promises';
import { resolve, extname } from 'node:path';
import assert from 'node:assert/strict';

const root = resolve('_site');
const pkg = JSON.parse(await readFile('package.json', 'utf8'));
const config = await readFile('_config.yml', 'utf8');
const base = config.match(/^baseurl:\s*(.*)$/m)[1].trim();
async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const output = [];
  for (const entry of entries) {
    const path = resolve(dir, entry.name);
    if (entry.isDirectory()) output.push(...await walk(path)); else output.push(path);
  }
  return output;
}
const files = await walk(root);
const htmlFiles = files.filter(file => extname(file) === '.html');
for (const file of htmlFiles) {
  const html = await readFile(file, 'utf8');
  assert.ok(html.includes(`v${pkg.version}`), `Version missing in ${file}`);
  assert.ok(!html.includes('{{'), `Unrendered Liquid in ${file}`);
  for (const [, url] of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
    if (/^(?:https?:|mailto:|#)/.test(url)) continue;
    assert.ok(url.startsWith(base + '/'), `Link lacks project base path: ${url} in ${file}`);
    const target = resolve(root, '.' + url.slice(base.length).split(/[?#]/)[0]);
    const info = await stat(target).catch(() => null);
    assert.ok(info, `Missing linked asset/page: ${url}`);
    if (info.isDirectory()) await stat(resolve(target, 'index.html'));
  }
}
for (const excluded of ['package.json', 'Gemfile', 'node_modules', 'tests', 'scripts', 'vendor', '.git', 'AGENTS.md']) {
  assert.equal(await stat(resolve(root, excluded)).catch(() => null), null, `Build leaked ${excluded}`);
}
assert.ok(files.includes(resolve(root, 'assets/vendor/alpine.js')));
assert.ok(files.includes(resolve(root, 'docs/index.html')));
console.log(`Verified ${htmlFiles.length} generated pages, project-path links, assets, version, and build exclusions.`);
