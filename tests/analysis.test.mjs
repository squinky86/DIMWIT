import test from 'node:test';
import assert from 'node:assert/strict';
import { encodeTags, demonstrate, CANCEL_TAG } from '../assets/js/tags.js';
import { inspect } from '../assets/js/inspector.js';
import { escapeText, context, boundedSlice, MAX_INPUT, MAX_PAYLOAD, MAX_FINDINGS } from '../assets/js/text.js';

test('literal ASCII tag vector has a visible-code-point terminator', () => {
  assert.deepEqual(Array.from(encodeTags('Hi!'), c => c.codePointAt(0)), [0xE0048, 0xE0069, 0xE0021, 0xE007F]);
  assert.equal(inspect('\u{E0048}\u{E0069}\u{E0021}\u{E007F}').findings[0].decoded, 'Hi!');
});
test('every printable ASCII character round trips', () => {
  const text = Array.from({ length: 95 }, (_, n) => String.fromCharCode(n + 32)).join('');
  const result = inspect(encodeTags(text));
  assert.equal(result.status, 'findings');
  assert.equal(result.findings[0].decoded, text);
});
test('cover text is preserved byte-for-byte on either side', () => {
  const cover = '👩‍👩‍👧‍👦 café e\u0301 العربية\r\n\u200C';
  assert.equal(demonstrate({ cover, payload: 'A' }).output, cover + encodeTags('A'));
  assert.equal(demonstrate({ cover, payload: 'A', placement: 'prepend' }).output, encodeTags('A') + cover);
  assert.equal(demonstrate({ cover: '', payload: 'A' }).output, encodeTags('A'));
});
test('generation rejects lossy or ambiguous payload coercion', () => {
  for (const payload of ['', '\n', '\t', 'café', '🙂', '\uD800', 'a'.repeat(MAX_PAYLOAD + 1)]) assert.throws(() => encodeTags(payload));
  assert.throws(() => demonstrate({ cover: '', payload: 'A', placement: 'middle' }));
});
test('payload and combined input budgets match inspector limits', () => {
  assert.equal(inspect(encodeTags('a'.repeat(MAX_PAYLOAD))).findings[0].decoded.length, MAX_PAYLOAD);
  const exactCover = 'x'.repeat(MAX_INPUT - 4);
  assert.equal(demonstrate({ cover: exactCover, payload: 'A' }).output.length, MAX_INPUT);
  assert.throws(() => demonstrate({ cover: exactCover + 'x', payload: 'A' }));
  assert.throws(() => demonstrate({ cover: 'x'.repeat(MAX_INPUT + 1), payload: 'A' }));
});
test('existing and repeated marks stay independently inspectable', () => {
  const first = demonstrate({ cover: 'plain', payload: 'ONE' }).output;
  const second = demonstrate({ cover: first, payload: 'TWO' }).output;
  assert.deepEqual(inspect(second).findings.map(f => f.decoded), ['ONE', 'TWO']);
});
test('UTF-16 and code-point offsets select the exact original evidence', () => {
  const input = '🙂e\u0301\u200B!' + encodeTags('OK');
  const [zero, tags] = inspect(input).findings;
  assert.deepEqual([zero.start, zero.end, zero.pointStart, zero.pointEnd], [4, 5, 3, 4]);
  assert.equal(input.slice(tags.start, tags.end), encodeTags('OK'));
  assert.equal(tags.pointStart, 5);
  assert.equal(tags.pointEnd, 8);
});
test('contiguous repeated controls are counted and selected as one span', () => {
  const [finding] = inspect('x\u200B\u200B\u200By').findings;
  assert.equal(finding.count, 3);
  assert.deepEqual([finding.start, finding.end], [1, 4]);
});
test('empty, ordinary and format-bearing input have distinct outcomes', () => {
  assert.equal(inspect('').status, 'empty');
  assert.equal(inspect('Hello! café Ελληνικά العربية 日本語\n\r\t').status, 'none');
  assert.equal(inspect(' ').status, 'none');
  assert.equal(inspect('A\u200BB').status, 'findings');
});
test('legitimate emoji and join controls are explained as formatting', () => {
  const result = inspect('👩‍👩‍👧‍👦 ❤️ می\u200Cروم');
  assert.equal(result.status, 'findings');
  assert.ok(result.findings.every(f => f.kind === 'formatting'));
  assert.ok(result.findings.some(f => f.title === 'ZERO WIDTH JOINER'));
  assert.ok(result.findings.some(f => f.title === 'VARIATION SELECTOR-16'));
});
test('known subdivision flags are recognized as formatting context', () => {
  for (const flag of ['gbeng', 'gbsct', 'gbwls']) {
    const finding = inspect('\u{1F3F4}' + encodeTags(flag)).findings[0];
    assert.equal(finding.kind, 'formatting');
    assert.equal(finding.title, 'Emoji flag tag sequence');
  }
  assert.equal(inspect(encodeTags('gbeng')).findings[0].kind, 'hidden');
  assert.equal(inspect('\u{1F3F4}' + encodeTags('OTHER')).findings[0].kind, 'hidden');
});
test('unterminated tag text is surfaced as a partial candidate', () => {
  const result = inspect(encodeTags('ABC').slice(0, -2));
  assert.equal(result.status, 'incomplete');
  assert.equal(result.findings[0].decoded, 'ABC');
  assert.equal(result.findings[0].kind, 'partial');
});
test('unsupported tag code points do not silently vanish during recovery', () => {
  const result = inspect('\u{E0001}' + encodeTags('A'));
  assert.equal(result.status, 'incomplete');
  assert.equal(result.findings[0].decoded, '');
  assert.match(result.reasons[0], /unsupported/);
});
test('stray terminators are malformed evidence and do not hide following marks', () => {
  const result = inspect(CANCEL_TAG + encodeTags('A'));
  assert.equal(result.findings[0].kind, 'partial');
  assert.equal(result.findings[1].decoded, 'A');
});
test('decoded content is data, including hostile markup and instruction text', () => {
  const payload = '<img src="https://example.invalid/x" onerror="alert(1)">';
  assert.equal(inspect(encodeTags(payload)).findings[0].decoded, payload);
});
test('finding truncation retains evidence and signals incomplete inspection', () => {
  const result = inspect('a\u200B'.repeat(MAX_FINDINGS + 1));
  assert.equal(result.status, 'incomplete');
  assert.equal(result.findings.length, MAX_FINDINGS);
  assert.match(result.reasons[0], /200-finding/);
});
test('oversized inputs never produce a complete or no-findings verdict', () => {
  const result = inspect('a'.repeat(MAX_INPUT) + '\u200B');
  assert.equal(result.status, 'incomplete');
  assert.equal(result.findings.length, 0);
  assert.equal(result.scannedUnits, MAX_INPUT);
});
test('input boundary does not manufacture malformed surrogates', () => {
  const result = inspect('a'.repeat(MAX_INPUT - 1) + '🙂');
  assert.equal(result.status, 'incomplete');
  assert.equal(result.findings.length, 0);
  assert.equal(result.scannedUnits, MAX_INPUT - 1);
});
test('oversized tag decoding is bounded', () => {
  const result = inspect('\u{E0041}'.repeat(MAX_PAYLOAD + 10) + CANCEL_TAG);
  assert.equal(result.status, 'incomplete');
  assert.equal(result.findings[0].decoded.length, MAX_PAYLOAD);
});
test('unpaired surrogates and C0/C1 controls are surfaced', () => {
  const result = inspect('\uD800\u0000\u0085');
  assert.equal(result.findings.length, 3);
  assert.match(result.findings[0].title, /SURROGATE/);
  assert.equal(result.findings[1].title, 'NULL');
});
test('every covered category is independent of the demonstration method', () => {
  for (const text of ['\u034F', '\u061C', '\uFEFF', '\u202E', '\u{E0100}', '\u{13430}', '\u2065', '\u{E0800}']) {
    assert.ok(inspect(text).findings.length > 0);
  }
});
test('analyzer failures retain successful findings without leaking error details', () => {
  const result = inspect('a', [
    { id: 'ok', label: 'Working', analyze: () => ({ findings: [{ title: 'Evidence' }], reasons: [], scannedUnits: 1 }) },
    { id: 'failed', label: 'Failed', analyze: () => { throw new Error('private input details'); } },
  ]);
  assert.equal(result.status, 'incomplete');
  assert.equal(result.findings.length, 1);
  assert.equal(result.checks[1].complete, false);
  assert.doesNotMatch(result.reasons.join(''), /private input/);
  assert.equal(inspect('a', []).status, 'incomplete');
});
test('escaped views reveal non-ASCII, controls and literal backslashes', () => {
  assert.equal(escapeText('A\u200B🙂\t\\u200B'), 'A\\u{200B}\\u{1F642}\\t\\\\u200B');
  assert.equal(escapeText('\u202E<img>'), '\\u{202E}<img>');
});
test('bounded displays do not turn neighboring emoji into broken surrogates', () => {
  const text = '🙂' + 'a'.repeat(15) + '\u200B' + 'a'.repeat(15) + '🙂';
  assert.equal(context(text, 17, 18), '\\u{1F642}' + 'a'.repeat(15) + '\\u{200B}' + 'a'.repeat(15));
  assert.equal(boundedSlice('a🙂b', 0, 2), 'a');
  // A genuine malformed surrogate is retained rather than silently removed.
  assert.equal(boundedSlice('a\uD800b', 0, 2), 'a\uD800');
});
