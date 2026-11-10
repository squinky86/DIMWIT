import { MAX_INPUT, MAX_PAYLOAD, MAX_FINDINGS, isHidden, isTag, characterName, code, context, boundedSlice } from './text.js';
import { analyzeTagRun } from './tags.js';
import { directAnalyzer } from './direct.js';
import { encodingAnalyzer } from './encoding.js';
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
}, directAnalyzer, ...unicodeAnalyzers, encodingAnalyzer];

export const MAX_DEPTH = 3, MAX_DECODED_TOTAL = 20000, MAX_LAYERS = 32;

export function inspect(input, enabledAnalyzers = analyzers) {
  if (!input.length) return { status: 'empty', findings: [], reasons: [], checks: [], scannedUnits: 0 };
  const text = boundedSlice(input, 0, MAX_INPUT);
  const reasons = input.length > MAX_INPUT ? ['Only the first 50,000 UTF-16 units fit the input budget.'] : [];
  const findings = [], checks = [];
  let scannedUnits = text.length, decodedUnits = 0;
  const layers = [{ text, path: [], origin: null, depth: 0 }];
  if (!enabledAnalyzers.length) reasons.push('No analyzers were available.');
  for (let layerIndex = 0; layerIndex < layers.length; layerIndex++) {
    const layer = layers[layerIndex];
    for (const analyzer of enabledAnalyzers) {
      try {
        const result = analyzer.analyze(layer.text);
        const layerLabel = layer.path.length ? layer.path.join(' → ') : 'Input';
        for (const reason of result.reasons) reasons.push(`${layerLabel}: ${reason}`);
        if (!layer.depth) {
          scannedUnits = Math.min(scannedUnits, result.scannedUnits ?? text.length);
          checks.push({ label: analyzer.label, complete: !result.reasons.length });
        } else if (result.reasons.length) {
          const check = checks.find(c => c.label === analyzer.label);
          if (check) check.complete = false;
        }
        for (const [index, f] of result.findings.entries()) {
          if (findings.length >= MAX_FINDINGS) {
            reasons.push('The combined 200-finding limit was reached. Some evidence is not displayed.');
            break;
          }
          const transform = f.transform ?? (f.kind === 'hidden' ? f.rule === 'variation-selector:utf8' ? 'variation-selector UTF-8' : 'Unicode tags' : '');
          const path = [...layer.path, ...(transform ? [transform] : [])];
          const origin = layer.origin ?? { start: f.start, end: f.end, pointStart: f.pointStart, pointEnd: f.pointEnd };
          const finding = { ...f, id: `${layerIndex}-${analyzer.id}-${index}`, path: path.length ? `Input → ${path.join(' → ')}` : '', layerDepth: layer.depth };
          if (layer.depth) {
            Object.assign(finding, origin, { decodedStart: f.start, decodedEnd: f.end, decodedPointStart: f.pointStart, decodedPointEnd: f.pointEnd });
          }
          findings.push(finding);
          if (!f.decoded || !['hidden', 'encoded'].includes(f.kind)) continue;
          if (layer.depth >= MAX_DEPTH || layers.length >= MAX_LAYERS || decodedUnits + f.decoded.length > MAX_DECODED_TOTAL) {
            reasons.push('Nested inspection reached its limit: 3 decoding steps, 32 layers, or 20,000 total decoded UTF-16 units.');
            finding.decoded = '';
            finding.explanation += ' The next decoded layer was withheld because the shared decoding budget was reached.';
            continue;
          }
          decodedUnits += f.decoded.length;
          layers.push({ text: f.decoded, origin, path, depth: layer.depth + 1 });
        }
      } catch {
        reasons.push(`${analyzer.label} could not complete. Your original text is preserved.`);
        if (!layer.depth) { checks.push({ label: analyzer.label, complete: false }); scannedUnits = 0; }
        else { const check = checks.find(c => c.label === analyzer.label); if (check) check.complete = false; }
      }
    }
  }
  return { status: reasons.length ? 'incomplete' : findings.length ? 'findings' : 'none',
    findings, reasons: [...new Set(reasons)], checks, scannedUnits, decodedUnits, layers: layers.length };
}
