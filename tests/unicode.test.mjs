import test from 'node:test';
import assert from 'node:assert/strict';
import { inspect } from '../assets/js/inspector.js';
import { unicodeDemo, scanUnicode, scanBidi, BIDI_PAIRS, VS_OPEN, VS_CLOSE, CONFUSABLES } from '../assets/js/unicode.js';
import { encodeTags } from '../assets/js/tags.js';
import { VARIATION_PAIRS, UNICODE_VERSION } from '../assets/js/unicode-data.js';

test('framed variation-selector bytes preserve multilingual Unicode and BOM', () => {
  for (const payload of ['BANANA', '🙂 العربية e\u0301 日本語', '\uFEFFA', '\0']) {
    const output = unicodeDemo({ cover: 'cover🙂', payload, kind: 'selectors' }).output;
    const result = inspect(output);
    assert.equal(result.status, 'findings');
    const finding = result.findings.find(f => f.rule === 'variation-selector:utf8');
    assert.equal(finding.decoded, payload);
    assert.equal(output.slice(finding.start, finding.end), output.slice('cover🙂'.length));
    assert.ok(result.findings.length < 30);
  }
});
test('variation framing, byte mapping, and budgets reject incomplete recovery', () => {
  for (const text of [VS_OPEN + 'x' + VS_CLOSE, VS_OPEN + '\u{E01EF}' + VS_CLOSE, VS_OPEN + '\uFE00', VS_OPEN + VS_CLOSE, '[[VS:OTHER]]x' + VS_CLOSE, VS_OPEN + '\u{E0141}'.repeat(4097) + VS_CLOSE]) {
    const result = inspect(text);
    assert.equal(result.status, 'incomplete');
    assert.equal(result.findings.find(f => f.rule === 'variation-selector:utf8').decoded, '');
  }
  const payload = 'A'.repeat(1024);
  assert.equal(scanUnicode(unicodeDemo({ payload, kind: 'selectors' }).output).findings[0].decoded, payload);
  assert.throws(() => unicodeDemo({ payload: '\uD800', kind: 'selectors' }));
});
test('pinned valid emoji and standardized variants are contextual formatting', () => {
  assert.equal(UNICODE_VERSION, '18.0.0');
  assert.ok(VARIATION_PAIRS.length > 2000);
  for (const text of ['❤️', '0\uFE00', '☀\uFE0E']) {
    const finding = inspect(text).findings[0];
    assert.equal(finding.kind, 'formatting');
    assert.match(finding.explanation, /recognized Unicode 18/);
  }
  assert.match(inspect('A\uFE0F\uFE0E').findings[0].explanation, /not a single recognized/);
  for (const text of ['👩‍👩‍👧‍👦', 'می\u200Cروم', '\u{1F3F4}' + encodeTags('gbeng')]) assert.ok(inspect(text).findings.every(f => f.kind === 'formatting'));
});
test('confusable mapping is explicit, ambiguous, and never recovered original text', () => {
  const { output, changes } = unicodeDemo({ payload: 'paypal.example', kind: 'confusables' });
  assert.equal(output, 'раураl.ехаmрlе');
  assert.ok(changes.length);
  for (const [ch, latin] of Object.entries(CONFUSABLES)) {
    const f = scanUnicode('🙂' + ch).findings.find(f => f.rule === 'limited-confusable-map');
    assert.equal(f.comparison, latin); assert.equal(f.decoded, '');
    assert.deepEqual([f.start, f.end], [2, 3]);
  }
  assert.ok(scanUnicode('pаypal').findings.some(f => f.title === 'Mixed-script word'));
  assert.ok(!scanUnicode('русский').findings.some(f => f.title === 'Mixed-script word'));
  assert.ok(scanUnicode('ΡР').findings.filter(f => f.comparison === 'P').length === 2);
});
test('all normalization comparisons reconstruct the normalized text without changing source', () => {
  for (const input of ['🙂e\u0301!', 'ℌｅllo', 'café', '가', 'ﬃ', '𝑨😀']) {
    const original = input;
    for (const f of scanUnicode(input).findings.filter(f => f.rule?.startsWith('normalization:'))) {
      assert.equal(input.slice(0, f.start) + f.comparison + input.slice(f.end), input.normalize(f.rule.split(':')[1]));
      assert.equal(f.decoded, '');
    }
    assert.equal(input, original);
  }
  assert.equal(inspect('é'.repeat(5000)).status, 'incomplete');
});
test('spacing, marks, controls, and independent findings retain exact spans', () => {
  const input = '🙂a\u00A0b\u2028c\u2029e\u0301\u0302\u0303\u0304\u00AD\uFEFF\0\u0085';
  const result = inspect(input);
  for (const cp of ['\u00A0', '\u2028', '\u2029', '\u00AD', '\uFEFF', '\0', '\u0085']) assert.ok(result.findings.some(f => input.slice(f.start, f.end) === cp));
  assert.ok(result.findings.some(f => f.rule === 'combining-run:4'));
  assert.equal(input[3], '\u00A0');
});
test('bidi generation uses one pair and inspection respects isolate boundaries', () => {
  for (const variant of Object.keys(BIDI_PAIRS)) {
    const output = unicodeDemo({ cover: '🙂', payload: 'עברית BANANA', kind: 'bidi', variant }).output;
    const result = scanBidi(output);
    assert.equal(result.findings.length, 1);
    assert.equal(result.findings[0].title, 'Paired directional control');
    assert.equal(result.findings[0].start, 2);
  }
  assert.equal(scanBidi('العربية עברית').findings.length, 0);
  assert.equal(scanBidi('\u2067\u202Eabc\u2069').findings.length, 2);
  assert.ok(scanBidi('\u2067\u202Cabc\u2069').findings.some(f => f.kind === 'partial'));
  for (const text of ['\u202Eabc', '\u2069', '\u202Eabc\nrest']) assert.ok(scanBidi(text).findings.some(f => f.kind === 'partial'));
  assert.ok(scanBidi('\u202E'.repeat(17) + 'x').reasons.length);
  for (const payload of ['a\u202Eb', 'a\nb']) assert.throws(() => unicodeDemo({ payload, kind: 'bidi' }));
});
