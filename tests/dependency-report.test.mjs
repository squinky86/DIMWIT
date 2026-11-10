import test from 'node:test';
import assert from 'node:assert/strict';
import { actionPins, makeReport, planIssueUpdate, START } from '../scripts/dependency-report.mjs';

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
test('Action parsing requires a pinned commit and tracking ref and ignores local actions', () => {
  const sha = 'a'.repeat(40);
  assert.deepEqual(actionPins(`  - uses: actions/checkout@${sha} # v6\n  - uses: ./.github/actions/local`), [{ name: 'actions/checkout', current: sha, ref: 'v6' }]);
  assert.throws(() => actionPins('  - uses: actions/checkout@v6'), /commit SHA/);
  assert.throws(() => actionPins(`  - uses: actions/checkout@${sha}`), /tracking tag/);
});
