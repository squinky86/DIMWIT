import test from 'node:test';
import assert from 'node:assert/strict';
import { actionReferences, actionUpdate, makeReport, planIssueUpdate, START } from '../scripts/dependency-report.mjs';

const updates = [{ ecosystem: 'npm', name: 'example', current: '1.0.0', available: '2.0.0', url: 'https://example.invalid/releases' }];
test('no updates cause no issue writes', () => assert.equal(planIssueUpdate([], []), null));
test('new updates produce an issue for manual resolution', () => {
  const plan = planIssueUpdate([], updates);
  assert.equal(plan.title, 'Dependency updates available for manual review');
  assert.match(plan.body, /does not change code/);
  assert.match(plan.body, /2\.0\.0/);
});
test('identical open or manually closed reports are not duplicated or reopened', () => {
  for (const state of ['open', 'closed']) {
    assert.equal(planIssueUpdate([{ number: 1, state, body: makeReport(updates).body }], updates), null);
  }
});
test('refreshing a report preserves the owner’s notes outside the managed section', () => {
  const body = 'Owner notes above.\n' + makeReport(updates).body + '\nOwner notes below.';
  const plan = planIssueUpdate([{ number: 1, state: 'open', body }], [{ ...updates[0], available: '3.0.0' }]);
  assert.equal(plan.number, 1);
  assert.ok(plan.body.startsWith('Owner notes above.\n'));
  assert.ok(plan.body.endsWith('\nOwner notes below.'));
  assert.match(plan.body, /3\.0\.0/);
});
test('a new version can create a new issue after an older report was closed', () => {
  const plan = planIssueUpdate([{ number: 1, state: 'closed', body: makeReport(updates).body }], [{ ...updates[0], available: '3.0.0' }]);
  assert.ok(plan.title);
  assert.equal(plan.number, undefined);
});
test('edited report markers stop automation without overwriting owner content', () => {
  assert.throws(() => planIssueUpdate([{ number: 1, state: 'open', body: START + 'Owner changed this.' }], updates), /markers/);
});
test('report fingerprint is stable across registry response order and table content is escaped', () => {
  const other = { ...updates[0], name: 'a|b<test>', available: '4.0.0' };
  assert.equal(makeReport([...updates, other]).marker, makeReport([other, ...updates]).marker);
  assert.ok(makeReport([other]).body.includes('a&#124;b&#60;test&#62;'));
});
test('Action parsing accepts stable generic and exact refs, subpaths, quotes, and local actions', () => {
  assert.deepEqual(actionReferences(`
    - uses: actions/checkout@v7
    - uses: 'ruby/setup-ruby@v1' # Maintained release series
      uses: "example/action/subdirectory@v2.3.4"
    - uses: example/minor@v2.3
    - uses: ./.github/actions/local
    - uses: './another/local'
  `), [
    { name: 'actions/checkout', current: 'v7' },
    { name: 'ruby/setup-ruby', current: 'v1' },
    { name: 'example/action', current: 'v2.3.4' },
    { name: 'example/minor', current: 'v2.3' },
  ]);
});
test('unsupported Action references fail instead of silently skipping update checks', () => {
  for (const ref of ['main', 'v7.0.0-beta1', 'a'.repeat(40), 'v7 trailing-text']) {
    assert.throws(() => actionReferences(`- uses: actions/checkout@${ref}`), /stable release/);
  }
});
test('generic Action refs already cover patches and minors within their series', () => {
  for (const [current, latest] of [['v7', 'v7.1.0'], ['v7.1', 'v7.1.2'], ['v7.1.0', 'v7.1.0'], ['v1', 'v1.338.0']]) {
    assert.equal(actionUpdate({ name: 'example/action', current }, { tag_name: latest }), null);
  }
});
test('Action upgrades prefer an available stable major ref and link to release notes', () => {
  const release = { tag_name: 'v8.2.1' };
  const action = { name: 'example/action', current: 'v7' };
  assert.deepEqual(actionUpdate(action, release), {
    ecosystem: 'GitHub Actions', ...action, available: 'v8',
    url: 'https://github.com/example/action/releases/tag/v8.2.1',
  });
  assert.equal(actionUpdate(action, release, false).available, 'v8.2.1');
  assert.equal(actionUpdate({ ...action, current: 'v8.1' }, release).available, 'v8');
  assert.equal(actionUpdate({ ...action, current: 'v8.2.0' }, release).available, 'v8');
});
test('Action reports do not suggest downgrades, drafts, or prereleases', () => {
  for (const [current, latest] of [['v8', 'v7.9.9'], ['v8.2', 'v8.1.9'], ['v8.2.3', 'v8.2.2']]) {
    assert.equal(actionUpdate({ name: 'example/action', current }, { tag_name: latest }), null);
  }
  const action = { name: 'example/action', current: 'v7' };
  assert.equal(actionUpdate(action, { tag_name: 'v8.0.0', draft: true }), null);
  assert.equal(actionUpdate(action, { tag_name: 'v8.0.0-beta1', prerelease: true }), null);
  assert.throws(() => actionUpdate(action, { tag_name: 'unexpected' }), /Unsupported release tag/);
});
