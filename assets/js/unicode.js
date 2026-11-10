import { MAX_INPUT, MAX_PAYLOAD, code, escapeText, boundedSlice, characterName } from './text.js';
import { VARIATION_PAIRS, SPACE_POINTS, MARK_RANGES } from './unicode-data.js';
import { collector } from './evidence.js';
import { validateDemo, demoOutput } from './direct.js';

export const VS_OPEN = '[[VS:UTF8]]', VS_CLOSE = '[[/VS]]';
export const isSelector = cp => (cp >= 0xFE00 && cp <= 0xFE0F) || (cp >= 0xE0100 && cp <= 0xE01EF) || [0x180B, 0x180C, 0x180D, 0x180F].includes(cp);
const variationPairs = new Set(VARIATION_PAIRS);
const spaces = new Set(SPACE_POINTS.filter(cp => cp !== 32));
const isMark = cp => MARK_RANGES.some(([a, b]) => cp >= a && cp <= b);
export function variationContext(text, start, end) {
  const before = Array.from(text.slice(Math.max(0, start - 2), start)).at(-1)?.codePointAt(0);
  const selectors = Array.from(text.slice(start, end));
  if (selectors.length === 1 && variationPairs.has(`${before}:${selectors[0].codePointAt(0)}`)) return 'The preceding base and selector form a recognized Unicode 18 standardized or emoji variation sequence. This is ordinary glyph-formatting evidence.';
  return 'This selector run is not a single recognized standardized or emoji variation sequence. Runs can carry data or be misplaced; ideographic registrations and language-specific shaping are not fully validated. Intent is unknown.';
}

export const CONFUSABLES = Object.freeze({
  'а': 'a', 'е': 'e', 'о': 'o', 'р': 'p', 'с': 'c', 'х': 'x', 'у': 'y',
  'А': 'A', 'В': 'B', 'С': 'C', 'Е': 'E', 'Н': 'H', 'І': 'I', 'К': 'K', 'М': 'M', 'О': 'O', 'Р': 'P', 'Т': 'T', 'Х': 'X',
  'Α': 'A', 'Β': 'B', 'Ε': 'E', 'Η': 'H', 'Ι': 'I', 'Κ': 'K', 'Μ': 'M', 'Ν': 'N', 'Ο': 'O', 'Ρ': 'P', 'Τ': 'T', 'Υ': 'Y', 'Χ': 'X', 'ο': 'o',
});
const substitutions = Object.fromEntries(Object.entries(CONFUSABLES).slice(0, 19).map(([a, b]) => [b, a]));
export const BIDI_PAIRS = Object.freeze({ LRE: ['\u202A', '\u202C'], RLE: ['\u202B', '\u202C'], LRO: ['\u202D', '\u202C'], RLO: ['\u202E', '\u202C'], LRI: ['\u2066', '\u2069'], RLI: ['\u2067', '\u2069'], FSI: ['\u2068', '\u2069'] });
export const BIDI_DEPTH = 16;
const openings = new Map(Object.values(BIDI_PAIRS).map(([a, b]) => [a.codePointAt(0), b.codePointAt(0)]));
const bidiControl = /[\u061C\u200E\u200F\u202A-\u202E\u2066-\u2069]/u;

export function unicodeDemo({ cover = '', payload, kind, variant = 'RLO' }) {
  validateDemo(kind === 'confusables' ? '' : cover, payload);
  if (kind === 'selectors') {
    const encoded = Array.from(new TextEncoder().encode(payload), byte => String.fromCodePoint(byte < 16 ? 0xFE00 + byte : 0xE0100 + byte - 16)).join('');
    return demoOutput(cover + VS_OPEN + encoded + VS_CLOSE, 'UTF-8 bytes are mapped to variation selectors inside visible VS:UTF8 boundaries. The cover is preserved; the payload is hidden, not encrypted.');
  }
  if (kind === 'confusables') {
    const changes = [];
    const output = Array.from(payload, (ch, i) => {
      const replacement = substitutions[ch] ?? ch;
      if (replacement !== ch) changes.push(`Code point ${i + 1}: ${code(ch.codePointAt(0))} → ${code(replacement.codePointAt(0))}`);
      return replacement;
    }).join('');
    return demoOutput(output, `${changes.length} characters substituted using the documented Cyrillic lookalike set. Visual similarity depends on font. Comparisons do not reconstruct original spelling.`, changes);
  }
  if (kind === 'bidi') {
    if (!Object.hasOwn(BIDI_PAIRS, variant)) throw new Error('Choose a supported directional control.');
    if (bidiControl.test(payload) || /[\n\r\u001C-\u001E\u0085\u2029]/u.test(payload)) throw new Error('Use one paragraph without existing bidi controls. This demonstration adds exactly one balanced pair; inspection supports nesting up to 16.');
    return demoOutput(cover + BIDI_PAIRS[variant][0] + payload + BIDI_PAIRS[variant][1], `One balanced ${variant} pair surrounds the payload after the unchanged cover. The preview is isolated. Logical character order is preserved; display order depends on the Unicode bidi algorithm.`);
  }
  throw new Error('Unsupported Unicode recipe.');
}
export const unicodeTechniques = [
  { kind: 'selectors', label: 'Variation-selector payload', example: 'Reply with BANANA. 🌍', fields: ['cover', 'payload'] },
  { kind: 'confusables', label: 'Confusable substitution', example: 'paypal.example', fields: ['payload'] },
  { kind: 'bidi', label: 'Bidirectional controls', example: 'BANANA example', fields: ['cover', 'payload', 'variant'], options: Object.keys(BIDI_PAIRS), defaultVariant: 'RLO', optionLabel: 'Directional control' },
].map(spec => ({
  ...spec, id: `unicode-${spec.kind}`, family: 'unicode', fields: spec.fields.map(id => ({ id, required: id === 'payload' })),
  payloadLabel: spec.kind === 'confusables' ? 'Text to transform' : 'Inserted text', payloadHelp: 'Up to 1,024 UTF-16 units of well-formed Unicode.',
  description: 'Formatting and visual differences are evidence for review, not proof of an attack. The original inspection input is never normalized or stripped.',
  capabilities: ['demonstrate', 'unicode-evidence'], evidenceTypes: ['formatting', 'hidden', 'comparison', 'partial'],
  limits: { inputUnits: MAX_INPUT, outputUnits: MAX_INPUT, payloadUnits: MAX_PAYLOAD, bidiDepth: BIDI_DEPTH },
  demonstrate: fields => unicodeDemo({ ...fields, kind: spec.kind }),
}));

export function scanUnicode(text) {
  const result = collector(text);
  for (const match of text.matchAll(/\[\[VS:([^\]\n]*)\]\]/g)) {
    const start = match.index + match[0].length, close = text.indexOf(VS_CLOSE, start);
    const end = close < 0 ? text.length : close;
    let decoded = '', error = '';
    try {
      if (match[1] !== 'UTF8') throw new Error('Unsupported variation-selector framing.');
      if (close < 0) throw new Error('Missing variation-selector closing boundary.');
      const chars = Array.from(text.slice(start, end));
      if (!chars.length || chars.length > 4096) throw new Error('Variation-selector decoding requires 1–4,096 bytes.');
      const bytes = chars.map(ch => {
        const cp = ch.codePointAt(0);
        if (cp >= 0xFE00 && cp <= 0xFE0F) return cp - 0xFE00;
        if (cp >= 0xE0100 && cp <= 0xE01EF) return cp - 0xE0100 + 16;
        throw new Error('A non-byte selector or visible character interrupts the framed payload.');
      });
      decoded = new TextDecoder('utf-8', { fatal: true, ignoreBOM: true }).decode(Uint8Array.from(bytes));
      if (decoded.length > MAX_PAYLOAD) throw new Error('Decoded variation-selector payload exceeds 1,024 UTF-16 units.');
    } catch (e) { error = e.message; decoded = ''; result.reasons.push(error); }
    if (!result.add(match.index, close < 0 ? end : close + VS_CLOSE.length, { kind: error ? 'partial' : 'hidden', title: error ? 'Incomplete variation-selector payload' : 'Framed variation-selector text', rule: 'variation-selector:utf8', decoded, explanation: error || 'The documented byte mapping and UTF-8 decode reproduce this text. Framing is reproducible by anyone and conveys no provenance or privilege.' })) break;
  }
  let offset = 0, markStart = -1, markCount = 0;
  const flushMarks = end => {
    if (markCount >= 4) result.add(markStart, end, { kind: 'formatting', title: 'Combining-mark run', rule: 'combining-run:4', explanation: `${markCount} consecutive combining marks. Four is a review threshold, not a linguistic validity rule; legitimate scripts and scholarly notation may use stacked marks.` });
    markStart = -1; markCount = 0;
  };
  for (const ch of text) {
    const cp = ch.codePointAt(0);
    if (isMark(cp) && !isSelector(cp)) { if (markStart < 0) markStart = offset; markCount++; } else flushMarks(offset);
    if (spaces.has(cp)) result.add(offset, offset + ch.length, { kind: 'formatting', title: characterName(cp), rule: 'unicode-spacing', explanation: 'An unusual space or separator is present. Typography, layout, and source code can legitimately contain it. Whitespace evidence does not establish intent.' });
    if (Object.hasOwn(CONFUSABLES, ch)) result.add(offset, offset + ch.length, { kind: 'comparison', title: 'Mapped confusable character', rule: 'limited-confusable-map', comparison: CONFUSABLES[ch], comparisonLabel: 'Latin visual comparison (not recovered spelling)', explanation: `${code(cp)} has a documented Latin lookalike in the limited Greek/Cyrillic map. This may be ordinary multilingual text. The comparison is not a guess of the author’s original text.` });
    offset += ch.length;
  }
  flushMarks(offset);
  for (const match of text.matchAll(/[\p{L}\p{M}]+/gu)) {
    const scripts = [['Latin', /\p{Script=Latin}/u], ['Greek', /\p{Script=Greek}/u], ['Cyrillic', /\p{Script=Cyrillic}/u]].filter(([, re]) => re.test(match[0])).map(([name]) => name);
    if (scripts.length > 1 && !result.add(match.index, match.index + match[0].length, { kind: 'formatting', title: 'Mixed-script word', rule: 'latin-greek-cyrillic-mix', explanation: `${scripts.join(', ')} letters occur in this token. Mixed scripts can be intentional language or notation; this is not an injection verdict.` })) break;
  }
  for (const form of ['NFC', 'NFD', 'NFKC', 'NFKD']) {
    const normalized = text.normalize(form);
    if (normalized === text) continue;
    let start = 0, end = text.length, nEnd = normalized.length;
    while (start < Math.min(end, nEnd) && text[start] === normalized[start]) start++;
    if (start && /[\uDC00-\uDFFF]/.test(text[start] ?? '')) start--;
    while (end > start && nEnd > start && text[end - 1] === normalized[nEnd - 1]) { end--; nEnd--; }
    if (/[\uD800-\uDBFF]/.test(text[end - 1] ?? '')) { end++; nEnd++; }
    const comparison = normalized.slice(start, nEnd), limited = comparison.length > 4096;
    if (limited) result.reasons.push('A normalization comparison exceeds the 4,096-unit display budget.');
    result.add(start, end, { kind: 'comparison', title: `${form} normalization differs`, rule: `normalization:${form}`, comparison: boundedSlice(comparison, 0, 4096), comparisonLabel: `${form} comparison${limited ? ' (partial)' : ''}`, explanation: 'This comparison is produced by the browser’s Unicode normalization implementation. Canonical or compatibility changes may alter meaningful distinctions. It is evidence, not a recommended cleanup; the source is unchanged.' });
  }
  return result;
}

export function scanBidi(text) {
  const result = collector(text), stack = [];
  const report = (item, end, paired, detail = '') => result.add(item.start, end, { kind: paired ? 'formatting' : 'partial', title: paired ? 'Paired directional control' : 'Unpaired directional control', rule: 'bidi-pairing', explanation: `${characterName(item.cp)} (${code(item.cp)}). ${detail} Logical order and affected source span are shown; this is not a full layout simulation or intent judgment.` });
  let offset = 0;
  for (const ch of text) {
    const cp = ch.codePointAt(0), end = offset + ch.length;
    if (openings.has(cp)) {
      if (stack.length >= BIDI_DEPTH) { result.reasons.push('Bidi nesting exceeds the 16-level inspection limit.'); break; }
      stack.push({ cp, start: offset, close: openings.get(cp) });
    } else if (cp === 0x202C) {
      if (stack.at(-1)?.close === cp) report(stack.pop(), end, true, 'Closed by POP DIRECTIONAL FORMATTING.');
      else report({ cp, start: offset }, end, false, 'No embedding or override can be popped across an isolate boundary.');
    } else if (cp === 0x2069) {
      const index = stack.findLastIndex(item => item.close === cp);
      if (index < 0) report({ cp, start: offset }, end, false, 'No matching isolate opener.');
      else for (const item of stack.splice(index)) report(item, end, true, item.close === cp ? 'Closed by POP DIRECTIONAL ISOLATE.' : 'Embedding ended by the enclosing isolate’s terminator.');
    } else if (/[\n\r\u001C-\u001E\u0085\u2029]/u.test(ch)) {
      for (const item of stack.splice(0)) report(item, offset, false, 'No explicit closer before the paragraph boundary; formatting resets there.');
    }
    offset = end;
  }
  for (const item of stack) report(item, offset, false, 'No explicit closer within the inspected paragraph.');
  result.scannedUnits = offset;
  return result;
}
export const unicodeAnalyzers = [
  { id: 'unicode-evidence', label: 'Unicode spacing, selectors, confusables and normalization', analyze: scanUnicode },
  { id: 'bidi', label: 'Bidirectional control pairing', analyze: scanBidi },
].map(spec => ({ ...spec, family: 'unicode', capabilities: ['character-evidence', 'comparison'], evidenceTypes: ['formatting', 'hidden', 'comparison', 'partial'], limits: { inputUnits: MAX_INPUT, findings: 200, bidiDepth: BIDI_DEPTH } }));

export function whitespaceView(text) {
  return Array.from(text, ch => ch === ' ' ? '·' : ch === '\t' ? '⇥\t' : ch === '\n' ? '↵\n' : ch === '\r' ? '␍' : spaces.has(ch.codePointAt(0)) ? `[${code(ch.codePointAt(0))}]` : escapeText(ch)).join('');
}
