import { spawnSync } from 'node:child_process';

const result = spawnSync('bundle', ['exec', 'jekyll', ...process.argv.slice(2)], {
  stdio: 'inherit', env: { ...process.env, BUNDLE_PATH: process.env.BUNDLE_PATH || 'vendor/bundle' },
});
if (result.error) console.error('Bundler is unavailable. Follow docs/development.md to install Ruby and dependencies.');
process.exit(result.status ?? 1);
