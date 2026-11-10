// Optional maintainer tool; normal builds use the checked-in Unicode 17 data.
// node scripts/build-unicode-data.mjs /path/DerivedCoreProperties.txt /path/UnicodeData.txt
import { readFile, writeFile } from 'node:fs/promises';
const [derivedPath, namesPath] = process.argv.slice(2);
if (!derivedPath || !namesPath) throw new Error('Supply Unicode 17 DerivedCoreProperties.txt and UnicodeData.txt.');
const derived = await readFile(derivedPath, 'utf8');
if (!derived.includes('DerivedCoreProperties-17.0.0.txt')) throw new Error('Expected Unicode 17.0.0 data.');
const ranges = [...derived.matchAll(/^([\dA-F]+)(?:\.\.([\dA-F]+))?\s*; Default_Ignorable_Code_Point/gm)]
  .map(([, a, b]) => [parseInt(a, 16), parseInt(b || a, 16)]);
const names = {};
const formats = [];
for (const line of (await readFile(namesPath, 'utf8')).split('\n')) {
  const [hex, name, category, , , , , , , , oldName] = line.split(';');
  const cp = parseInt(hex, 16);
  if (category === 'Cf') formats.push(cp);
  if (category === 'Cf' || category === 'Cc' || ranges.some(([a, b]) => cp >= a && cp <= b)) {
    names[hex] = name === '<control>' ? oldName || `CONTROL ${hex}` : name;
  }
}
await writeFile('assets/js/unicode-data.js', `// Generated from Unicode 17.0.0 UCD. See assets/UNICODE-LICENSE.txt.\nexport const UNICODE_VERSION = '17.0.0';\nexport const IGNORABLE_RANGES = ${JSON.stringify(ranges)};\nexport const FORMAT_POINTS = ${JSON.stringify(formats)};\nexport const CHARACTER_NAMES = ${JSON.stringify(names, null, 2)};\n`);
