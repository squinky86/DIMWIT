import { MAX_INPUT, MAX_PAYLOAD, isTag, code } from './text.js';

export const CANCEL_TAG = String.fromCodePoint(0xE007F);
export function encodeTags(payload) {
  if (!payload.length) throw new Error('Enter the text to hide.');
  if (payload.length > MAX_PAYLOAD) throw new Error(`Hidden text is limited to ${MAX_PAYLOAD} printable ASCII characters.`);
  if (!/^[\x20-\x7E]+$/.test(payload)) throw new Error('Hidden text must use printable ASCII (English letters, numbers, spaces, and punctuation). Newlines and emoji are not supported in the hidden text.');
  return Array.from(payload, ch => String.fromCodePoint(0xE0000 + ch.charCodeAt(0))).join('') + CANCEL_TAG;
}
export function demonstrate({ cover, payload, placement = 'append' }) {
  if (cover.length > MAX_INPUT) throw new Error(`Cover text is limited to ${MAX_INPUT.toLocaleString()} UTF-16 units.`);
  if (!['append', 'prepend'].includes(placement)) throw new Error('Choose append or prepend.');
  const hidden = encodeTags(payload);
  const output = placement === 'append' ? cover + hidden : hidden + cover;
  if (output.length > MAX_INPUT) throw new Error('The combined output exceeds the 50,000-unit inspection limit. Shorten the cover text.');
  return { output, added: hidden.length, payloadLength: payload.length };
}

export const tagTechnique = {
  id: 'unicode-tags', label: 'Unicode tags', family: 'unicode',
  fields: [
    { id: 'cover', required: false }, { id: 'payload', required: true },
    { id: 'placement', required: true, options: ['append', 'prepend'] },
  ],
  capabilities: ['demonstrate', 'tag-decoding'], evidenceTypes: ['hidden', 'partial', 'formatting'],
  limits: { inputUnits: MAX_INPUT, outputUnits: MAX_INPUT, payloadCharacters: MAX_PAYLOAD, recursionDepth: 0 },
  demonstrate,
};

// Known RGI subdivision flags. Other tag text is surfaced without calling it malicious.
const flagTags = new Set(['gbeng', 'gbsct', 'gbwls']);
export function analyzeTagRun(text, start) {
  let end = start;
  let decoded = '';
  let invalid = false;
  let count = 0;
  let terminated = false;
  while (end < text.length && isTag(text.codePointAt(end))) {
    const cp = text.codePointAt(end);
    end += 2;
    count++;
    if (cp === 0xE007F) { terminated = true; break; }
    if (cp >= 0xE0020 && cp <= 0xE007E) {
      if (decoded.length < MAX_PAYLOAD) decoded += String.fromCharCode(cp - 0xE0000);
    } else invalid = true;
  }
  const limited = count - Number(terminated) > MAX_PAYLOAD;
  const flag = text.slice(Math.max(0, start - 2), start) === '\u{1F3F4}' && flagTags.has(decoded) && terminated && !invalid;
  const malformed = invalid || !terminated || !decoded.length;
  return {
    end, limited,
    finding: {
      kind: flag ? 'formatting' : malformed ? 'partial' : 'hidden',
      title: flag ? 'Emoji flag tag sequence' : malformed ? 'Partial or unsupported tag text' : 'Hidden tag text',
      explanation: flag ? 'This sequence is used for an emoji subdivision flag. Its hidden letters are formatting data.'
        : invalid ? 'This run contains reserved or language-tag code points. It cannot be decoded completely by this alpha.'
        : !terminated ? 'Printable tag characters map to the text below, but no CANCEL TAG terminator was found. Completeness cannot be established.'
        : !decoded.length ? 'A CANCEL TAG appears without printable tag text.'
        : 'These non-printing characters map directly to printable ASCII. This reveals content, not its intent.',
      decoded: invalid ? '' : decoded,
      codepoints: `${code(text.codePointAt(start))}${count > 1 ? ' … ' + code(text.codePointAt(end - 2)) : ''}`,
      count, start, end,
      incomplete: limited || invalid || !terminated,
      reason: limited ? 'A tag run exceeds the 1,024-character decoding limit.'
        : invalid ? 'A tag run uses unsupported code points.'
        : !terminated ? 'An unterminated tag run may be truncated.' : '',
    },
  };
}
