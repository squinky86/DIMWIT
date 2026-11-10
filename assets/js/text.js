import { IGNORABLE_RANGES, FORMAT_POINTS, CHARACTER_NAMES } from './unicode-data.js';

export const MAX_INPUT = 50000; // UTF-16 code units, matching textarea selection APIs.
export const MAX_PAYLOAD = 1024;
export const MAX_FINDINGS = 200;
const formatPoints = new Set(FORMAT_POINTS);
export const code = cp => `U+${cp.toString(16).toUpperCase().padStart(4, '0')}`;
export const isTag = cp => cp >= 0xE0000 && cp <= 0xE007F;
export function isHidden(cp) {
  return (cp < 0x20 && ![9, 10, 13].includes(cp)) || (cp >= 0x7F && cp <= 0x9F)
    || (cp >= 0xD800 && cp <= 0xDFFF) || formatPoints.has(cp)
    || IGNORABLE_RANGES.some(([a, b]) => cp >= a && cp <= b);
}
export function characterName(cp) {
  return CHARACTER_NAMES[cp.toString(16).toUpperCase().padStart(4, '0')]
    || (cp >= 0xD800 && cp <= 0xDFFF ? 'UNPAIRED UTF-16 SURROGATE' : 'RESERVED DEFAULT-IGNORABLE');
}
export function escapeText(text) {
  return Array.from(text, ch => {
    const cp = ch.codePointAt(0);
    if (ch === '\\') return '\\\\';
    if (ch === '\n') return '\\n\n';
    if (ch === '\r') return '\\r';
    if (ch === '\t') return '\\t';
    return cp < 0x20 || cp > 0x7E ? `\\u{${cp.toString(16).toUpperCase()}}` : ch;
  }).join('');
}
export function stats(text) {
  return { units: text.length, points: Array.from(text).length, bytes: new TextEncoder().encode(text).length };
}
export function boundedSlice(text, start, end) {
  // Never introduce unpaired surrogates when cutting display or scan boundaries.
  const splitsPair = offset => offset > 0 && offset < text.length
    && /[\uD800-\uDBFF]/.test(text[offset - 1]) && /[\uDC00-\uDFFF]/.test(text[offset]);
  if (splitsPair(start)) start--;
  if (splitsPair(end)) end--;
  return text.slice(start, end);
}
export function context(text, start, end) {
  // Bound context so a long run cannot create an unbounded display.
  return escapeText(boundedSlice(text, Math.max(0, start - 16), Math.min(end, start + 32)))
    + (end - start > 32 ? ' … ' : '')
    + escapeText(boundedSlice(text, end, end + 16));
}
