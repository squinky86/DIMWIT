import { readFile, mkdir, copyFile, writeFile } from 'node:fs/promises';

const pkg = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8'));
await mkdir('assets/vendor', { recursive: true });
await mkdir('_data', { recursive: true });
await copyFile('node_modules/alpinejs/dist/module.esm.js', 'assets/vendor/alpine.js');
await copyFile('assets/ALPINE-LICENSE.txt', 'assets/vendor/ALPINE-LICENSE.txt');
await writeFile('_data/build.json', JSON.stringify({ version: pkg.version, stage: pkg.version.startsWith('0.0.') ? 'alpha' : pkg.version.startsWith('0.') ? 'beta' : 'stable' }) + '\n');
console.log(`Prepared DIMWIT ${pkg.version}: local Alpine asset, license, and version data.`);
