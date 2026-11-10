import { createHash } from 'node:crypto';

export const START = '<!-- dimwit-dependency-report:start -->';
export const END = '<!-- dimwit-dependency-report:end -->';
const escapeCell = value => String(value).replace(/[|<>`\r\n]/g, char => `&#${char.charCodeAt(0)};`);

export function actionPins(source) {
  const pins = [];
  for (const line of source.split('\n')) {
    if (!/^\s*-?\s*uses:/.test(line) || /uses:\s*\.\//.test(line)) continue;
    const match = line.match(/uses:\s*([\w.-]+\/[\w.-]+)(?:\/[^@\s]+)?@([a-f\d]{40})\s*#\s*(v[\w.-]+)/i);
    if (!match) throw new Error('Every remote action needs a commit SHA and a tracking tag comment.');
    pins.push({ name: match[1], current: match[2], ref: match[3] });
  }
  return pins;
}

export function makeReport(updates) {
  const rows = [...updates].sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b)));
  const fingerprint = createHash('sha256').update(JSON.stringify(rows)).digest('hex');
  const marker = `<!-- dimwit-dependency-fingerprint:${fingerprint} -->`;
  const table = rows.map(row => `| ${escapeCell(row.ecosystem)} | ${escapeCell(row.name)} | ${escapeCell(row.current)} | ${escapeCell(row.available)} | [Upstream](${row.url}) |`).join('\n');
  return {
    marker,
    body: `${START}\n${marker}\n## Available dependency updates\n\nReview and resolve these updates manually on \`main\`. This check does not change code, lockfiles, or branches, and does not open pull requests. New versions may require changes; no backward compatibility is required.\n\n| Ecosystem | Dependency | Locked | Available | Details |\n| --- | --- | --- | --- | --- |\n${table}\n\nThe report checks locked npm packages and Ruby gems, tracked Action refs, and latest Action releases. It reports availability, not a tested upgrade or a vulnerability assessment. Some major versions may require an update to a parent dependency before they can be installed. Dependabot security alerts remain separate.\n${END}`,
  };
}

export function planIssueUpdate(issues, updates) {
  if (!updates.length) return null;
  const report = makeReport(updates);
  const related = issues.filter(issue => !issue.pull_request && issue.body?.includes(START));
  const open = related.find(issue => issue.state === 'open');
  if (open) {
    if (open.body.includes(report.marker)) return null;
    const start = open.body.indexOf(START);
    const end = open.body.indexOf(END, start);
    if (end < 0) throw new Error('The dependency issue report markers were edited; preserve the issue and repair them manually.');
    return { number: open.number, body: open.body.slice(0, start) + report.body + open.body.slice(end + END.length) };
  }
  // Closing a report is an intentional maintainer decision. Do not reopen or duplicate it.
  if (related.some(issue => issue.body.includes(report.marker))) return null;
  return { title: 'Dependency updates available for manual review', body: report.body };
}
