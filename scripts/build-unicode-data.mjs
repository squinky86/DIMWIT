// Maintainer tool; normal builds use committed Unicode 18 data and never fetch it.
// node scripts/build-unicode-data.mjs /path/to/ucd-directory
import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
const root = process.argv[2];
if (!root) throw new Error('Supply the directory containing Unicode 18 UCD and variation files.');
const derived = await readFile(join(root, 'DerivedCoreProperties.txt'), 'utf8');
if (!derived.includes('DerivedCoreProperties-18.0.0.txt')) throw new Error('Expected Unicode 18.0.0 data.');
const ranges = [...derived.matchAll(/^([\dA-F]+)(?:\.\.([\dA-F]+))?\s*; Default_Ignorable_Code_Point/gm)]
  .map(([, a, b]) => [parseInt(a, 16), parseInt(b || a, 16)]);
const names = {}, formats = [], spaces = [], marks = [];
for (const line of (await readFile(join(root, 'UnicodeData.txt'), 'utf8')).split('\n')) {
  const [hex, name, category, , , , , , , , oldName] = line.split(';');
  const cp = parseInt(hex, 16);
  if (category === 'Cf') formats.push(cp);
  if (category?.startsWith('Z')) spaces.push(cp);
  if (category?.startsWith('M')) marks.push(cp);
  if (category === 'Cf' || category === 'Cc' || category?.startsWith('Z') || ranges.some(([a, b]) => cp >= a && cp <= b)) {
    names[hex] = name === '<control>' ? oldName || `CONTROL ${hex}` : name;
  }
}
const markRanges = [];
for (const cp of marks) {
  const last = markRanges.at(-1);
  if (last && last[1] + 1 === cp) last[1] = cp; else markRanges.push([cp, cp]);
}
const variants = [];
for (const file of ['StandardizedVariants.txt', 'emoji-variation-sequences.txt']) {
  const data = await readFile(join(root, file), 'utf8');
  if (!data.includes('18.0.0')) throw new Error(`Expected Unicode 18 data in ${file}.`);
  for (const [, a, b] of data.matchAll(/^([\dA-F]+) ([\dA-F]+)\s*;/gm)) variants.push(`${parseInt(a, 16)}:${parseInt(b, 16)}`);
}
await writeFile('assets/js/unicode-data.js', `// Generated from Unicode 18.0.0 UCD. See assets/UNICODE-LICENSE.txt.\nexport const UNICODE_VERSION = '18.0.0';\nexport const IGNORABLE_RANGES = ${JSON.stringify(ranges)};\nexport const FORMAT_POINTS = ${JSON.stringify(formats)};\nexport const SPACE_POINTS = ${JSON.stringify(spaces)};\nexport const MARK_RANGES = ${JSON.stringify(markRanges)};\nexport const VARIATION_PAIRS = ${JSON.stringify([...new Set(variants)])};\nexport const CHARACTER_NAMES = ${JSON.stringify(names, null, 2)};\n`);
console.log(`Generated Unicode 18: ${variants.length} variation sequences, ${markRanges.length} mark ranges.`);
