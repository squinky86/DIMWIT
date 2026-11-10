import { spawnSync } from 'node:child_process';

// Debian/Ubuntu may suffix the Bundler executable with the Ruby version.
let bundle = 'bundle';
const probe = spawnSync(bundle, ['--version'], { stdio: 'ignore' });
if (probe.error?.code === 'ENOENT') bundle = 'bundle3.3';
const result = spawnSync(bundle, ['exec', 'jekyll', ...process.argv.slice(2)], {
  stdio: 'inherit', env: { ...process.env, BUNDLE_PATH: process.env.BUNDLE_PATH || 'vendor/bundle' },
});
if (result.error) console.error('Bundler is unavailable. Follow docs/development.md to install Ruby and dependencies.');
process.exit(result.status ?? 1);
