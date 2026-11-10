import { readFile, readdir } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { actionPins, planIssueUpdate } from './dependency-report.mjs';

const publish = process.argv.includes('--publish');
const repository = process.env.GITHUB_REPOSITORY || 'squinky86/DIMWIT';
if (!/^[\w.-]+\/[\w.-]+$/.test(repository)) throw new Error('Invalid repository name.');
function api(path, method = 'GET', payload) {
  const args = ['api', path, '--method', method];
  if (payload) args.push('--input', '-');
  return JSON.parse(execFileSync('gh', args, { encoding: 'utf8', input: payload ? JSON.stringify(payload) : undefined, stdio: ['pipe', 'pipe', 'pipe'], timeout: 30000 }));
}
async function registry(url) {
  const response = await fetch(url, { signal: AbortSignal.timeout(20000) });
  if (!response.ok) throw new Error(`Dependency lookup failed (${response.status}): ${url}`);
  return response.json();
}

// Read lockfiles without installing or updating any packages.
const lock = JSON.parse(await readFile('package-lock.json', 'utf8'));
const packages = new Map();
for (const [path, entry] of Object.entries(lock.packages)) {
  if (!path || entry.link) continue;
  const name = entry.name || path.split('node_modules/').at(-1);
  packages.set(`${name}@${entry.version}`, { name, current: entry.version });
}
const candidates = [];
for (const pkg of packages.values()) {
  const latest = await registry(`https://registry.npmjs.org/${encodeURIComponent(pkg.name)}/latest`);
  candidates.push({ ecosystem: 'npm', ...pkg, available: latest.version, url: `https://www.npmjs.com/package/${encodeURIComponent(pkg.name)}` });
}
const gems = JSON.parse(execFileSync('ruby', ['-rbundler', '-rjson', '-e',
  "puts JSON.generate(Bundler::LockfileParser.new(File.read('Gemfile.lock')).specs.map { |s| {name: s.name, current: s.version.to_s} }.uniq)"], { encoding: 'utf8' }));
for (const gem of gems) {
  const latest = await registry(`https://rubygems.org/api/v1/versions/${encodeURIComponent(gem.name)}/latest.json`);
  candidates.push({ ecosystem: 'RubyGems', ...gem, available: latest.version, url: `https://rubygems.org/gems/${encodeURIComponent(gem.name)}` });
}
const updates = JSON.parse(execFileSync('ruby', ['-rjson', '-e',
  'puts JSON.generate(JSON.parse(STDIN.read).select { |r| latest = Gem::Version.new(r.fetch("available").split("+").first); !latest.prerelease? && latest > Gem::Version.new(r.fetch("current").split("+").first) })'],
{ encoding: 'utf8', input: JSON.stringify(candidates) }));

const actions = new Map();
for (const file of await readdir('.github/workflows')) {
  if (!/\.ya?ml$/.test(file)) continue;
  for (const pin of actionPins(await readFile(`.github/workflows/${file}`, 'utf8'))) actions.set(`${pin.name}@${pin.current}`, pin);
}
for (const action of actions.values()) {
  const refs = new Set([action.ref]);
  try { refs.add(api(`repos/${action.name}/releases/latest`).tag_name); }
  catch (error) { if (!String(error.stderr).includes('HTTP 404')) throw error; }
  const seen = new Set();
  for (const ref of refs) {
    const latest = api(`repos/${action.name}/commits/${encodeURIComponent(ref)}`).sha;
    if (latest === action.current || seen.has(latest)) continue;
    seen.add(latest);
    const comparison = api(`repos/${action.name}/compare/${action.current}...${latest}`);
    if (!['ahead', 'diverged'].includes(comparison.status)) continue;
    updates.push({ ecosystem: 'GitHub Actions', name: `${action.name} (${ref})`, current: action.current,
      available: latest, url: `https://github.com/${action.name}/compare/${action.current}...${latest}` });
  }
}

console.log(JSON.stringify({ checked: { npm: packages.size, gems: gems.length, actions: actions.size }, updates }, null, 2));
if (publish && updates.length) {
  const issues = [];
  for (let page = 1; ; page++) {
    const batch = api(`repos/${repository}/issues?state=all&per_page=100&page=${page}`);
    issues.push(...batch);
    if (batch.length < 100) break;
  }
  const plan = planIssueUpdate(issues, updates);
  if (plan) {
    const issue = plan.number
      ? api(`repos/${repository}/issues/${plan.number}`, 'PATCH', { body: plan.body })
      : api(`repos/${repository}/issues`, 'POST', { ...plan, assignees: [process.env.DEPENDENCY_ASSIGNEE || 'squinky86'] });
    console.log(`Dependency report: ${issue.html_url}`);
  } else console.log('An existing report already covers these updates. No issue changes needed.');
}
