import { code, context, MAX_FINDINGS } from './text.js';

// All spans are end-exclusive UTF-16 offsets in the text supplied to an analyzer.
export function evidence(text, start, end, details) {
  const chars = Array.from(text.slice(start, end));
  const pointStart = Array.from(text.slice(0, start)).length;
  return {
    start, end, pointStart, pointEnd: pointStart + chars.length, count: chars.length,
    codepoints: chars.slice(0, 8).map(c => code(c.codePointAt(0))).join(' ') + (chars.length > 8 ? ' …' : ''),
    context: context(text, start, end), decoded: '', ...details,
  };
}

export function collector(text) {
  const findings = [], reasons = [];
  return {
    findings, reasons, scannedUnits: text.length,
    add(start, end, details) {
      if (findings.length >= MAX_FINDINGS) {
        if (!reasons.includes('The 200-finding limit was reached.')) reasons.push('The 200-finding limit was reached.');
        return false;
      }
      findings.push(evidence(text, start, end, details));
      return true;
    },
  };
}
