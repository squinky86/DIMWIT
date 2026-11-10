import { createHash } from 'node:crypto';

export const START = '<!-- dimwit-dependency-report:start -->';
export const END = '<!-- dimwit-dependency-report:end -->';
const escapeCell = value => String(value).replace(/[|<>`\r\n]/g, char => `&#${char.charCodeAt(0)};`);

export function actionReferences(source) {
  const actions = [];
  for (const line of source.split('\n')) {
    if (!/^\s*-?\s*uses:/.test(line) || /uses:\s*['"]?\.\//.test(line)) continue;
    const match = line.match(/^\s*-?\s*uses:\s*(['"]?)([\w.-]+\/[\w.-]+)(?:\/[^@\s'"]+)?@(v\d+(?:\.\d+){0,2})\1(?:\s+#.*)?\s*$/);
    if (!match) throw new Error('Remote actions must use stable release references such as v7 or v7.1.0.');
    actions.push({ name: match[2], current: match[3] });
  }
  return actions;
}

export function actionUpdate(action, release, majorRefExists = true) {
  if (release.draft || release.prerelease) return null;
  if (!/^v\d+(?:\.\d+){0,2}$/.test(release.tag_name)) throw new Error(`Unsupported release tag for ${action.name}: ${release.tag_name}`);
  const current = action.current.slice(1).split('.').map(Number);
  const latest = release.tag_name.slice(1).split('.').map(Number);
  // A generic reference already follows releases within its major/minor series.
  let newer = false;
  for (let i = 0; i < current.length; i++) {
    if ((latest[i] ?? 0) === current[i]) continue;
    newer = (latest[i] ?? 0) > current[i];
    break;
  }
  if (!newer) return null;
  return { ecosystem: 'GitHub Actions', ...action,
    available: majorRefExists ? `v${latest[0]}` : release.tag_name,
    url: `https://github.com/${action.name}/releases/tag/${release.tag_name}` };
}

export function makeReport(updates) {
  const rows = [...updates].sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b)));
  const fingerprint = createHash('sha256').update(JSON.stringify(rows)).digest('hex');
  const marker = `<!-- dimwit-dependency-fingerprint:${fingerprint} -->`;
  const table = rows.map(row => `| ${escapeCell(row.ecosystem)} | ${escapeCell(row.name)} | ${escapeCell(row.current)} | ${escapeCell(row.available)} | [Upstream](${row.url}) |`).join('\n');
  return {
    marker,
    body: `${START}\n${marker}\n## Available dependency updates\n\nReview and resolve these updates manually on \`main\`. This check does not change code, lockfiles, or branches, and does not open pull requests. New versions may require changes; no backward compatibility is required.\n\n| Ecosystem | Dependency | Current | Available | Details |\n| --- | --- | --- | --- | --- |\n${table}\n\nThe report checks locked npm packages, Ruby gems, Bundler, and stable Action releases. Generic Action references already follow updates within their release series; only releases outside that series require a change. It reports availability, not a tested upgrade or a vulnerability assessment. Some gem majors may require an update to a parent dependency before they can be installed. Document deferred upgrades before closing the report. Dependabot security alerts remain separate.\n${END}`,
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
