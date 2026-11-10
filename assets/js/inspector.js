import { MAX_INPUT, MAX_PAYLOAD, MAX_FINDINGS, isHidden, isTag, characterName, code, context, boundedSlice } from './text.js';
import { analyzeTagRun } from './tags.js';
import { directAnalyzer } from './direct.js';
import { unicodeAnalyzers, isSelector, variationContext } from './unicode.js';

function describe(cp) {
  if (cp === 0x200D || cp === 0x200C) return 'Join controls are used in connected scripts and emoji. Their presence alone does not establish injection.';
  if ([0x061C, 0x200E, 0x200F].includes(cp) || (cp >= 0x202A && cp <= 0x202E) || (cp >= 0x2066 && cp <= 0x2069)) return 'A directional control can change visual reading order. It may be legitimate in right-to-left text. Pairing evidence is reported separately.';
  if (cp === 0xFEFF) return 'This can be a byte-order mark or legacy non-breaking format character. Review its position and surrounding text.';
  if (cp >= 0xD800 && cp <= 0xDFFF) return 'An unpaired UTF-16 surrogate is malformed text; copying or encoding may replace it.';
  return 'A non-printing, default-ignorable, or format character is present. It can have a legitimate text-formatting use.';
}

export function scanHidden(text) {
  const findings = [];
  const reasons = [];
  let start = 0;
  let point = 0;
  while (start < text.length) {
    const cp = text.codePointAt(start);
    const width = cp > 0xFFFF ? 2 : 1;
    if (!isHidden(cp)) { start += width; point++; continue; }
    if (findings.length >= MAX_FINDINGS) { reasons.push('The 200-finding limit was reached. Remaining text was not inspected.'); break; }
    let finding;
    let end;
    let count;
    if (isTag(cp)) {
      const result = analyzeTagRun(text, start);
      finding = result.finding;
      end = result.end;
      count = finding.count;
      if (finding.incomplete) reasons.push(finding.reason);
    } else {
      end = start + width;
      count = 1;
      while (end < text.length && (isSelector(cp) ? isSelector(text.codePointAt(end)) : text.codePointAt(end) === cp)) { end += text.codePointAt(end) > 0xFFFF ? 2 : 1; count++; }
      finding = {
        kind: cp >= 0xD800 && cp <= 0xDFFF ? 'partial' : 'formatting',
        title: isSelector(cp) && count > 1 ? 'Variation-selector run' : characterName(cp), explanation: isSelector(cp) ? variationContext(text, start, end) : describe(cp), codepoints: code(cp) + (isSelector(cp) && count > 1 ? ' … ' + code(text.codePointAt(end - (text.charCodeAt(end - 1) >= 0xDC00 && text.charCodeAt(end - 1) <= 0xDFFF ? 2 : 1))) : ''),
        count, start, end, decoded: '',
      };
    }
    findings.push({ ...finding, pointStart: point, pointEnd: point + count, context: context(text, start, end) });
    start = end;
    point += count;
  }
  return { findings, reasons, scannedUnits: start };
}

export const analyzers = [{
  id: 'hidden-unicode', label: 'Hidden Unicode and tag text', family: 'unicode',
  capabilities: ['character-evidence', 'tag-decoding'],
  evidenceTypes: ['formatting', 'hidden', 'partial'],
  limits: { inputUnits: MAX_INPUT, findings: MAX_FINDINGS, decodedCharacters: MAX_PAYLOAD, recursionDepth: 0 },
  analyze: scanHidden,
}, directAnalyzer, ...unicodeAnalyzers];

export function inspect(input, enabledAnalyzers = analyzers) {
  if (!input.length) return { status: 'empty', findings: [], reasons: [], checks: [], scannedUnits: 0 };
  const text = boundedSlice(input, 0, MAX_INPUT);
  const reasons = input.length > MAX_INPUT ? ['Only the first 50,000 UTF-16 units fit the input budget.'] : [];
  const findings = [];
  const checks = [];
  let scannedUnits = text.length;
  if (!enabledAnalyzers.length) reasons.push('No analyzers were available.');
  for (const analyzer of enabledAnalyzers) {
    try {
      const result = analyzer.analyze(text);
      const available = MAX_FINDINGS - findings.length;
      findings.push(...result.findings.slice(0, available).map((f, index) => ({ ...f, id: `${analyzer.id}-${index}` })));
      if (result.findings.length > available) reasons.push('The combined 200-finding limit was reached. Some evidence is not displayed.');
      reasons.push(...result.reasons);
      scannedUnits = Math.min(scannedUnits, result.scannedUnits ?? text.length);
      checks.push({ label: analyzer.label, complete: !result.reasons.length });
    } catch {
      reasons.push(`${analyzer.label} could not complete. Your original text is preserved.`);
      checks.push({ label: analyzer.label, complete: false });
      scannedUnits = 0;
    }
  }
  return {
    status: reasons.length ? 'incomplete' : findings.length ? 'findings' : 'none',
    findings, reasons: [...new Set(reasons)], checks, scannedUnits,
  };
}
