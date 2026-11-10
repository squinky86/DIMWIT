import test from 'node:test';
import assert from 'node:assert/strict';
import { createToolkit, UPDATE_DELAY } from '../assets/js/toolkit.js';
import { inspect } from '../assets/js/inspector.js';
import { encodeTags } from '../assets/js/tags.js';

function setup() {
  let time = 0, next = 0, selected = 0;
  const timers = new Map();
  const app = createToolkit({
    schedule(fn, delay) { const id = ++next; timers.set(id, { fn, due: time + delay }); return id; },
    cancel(id) { timers.delete(id); },
  });
  app.$nextTick = fn => fn();
  app.$refs = { inspectInput: { focus() {}, setSelectionRange() {} }, rawOutput: { focus() {}, select() { selected++; } } };
  app.init();
  return { app, timers, selected: () => selected, tick(ms) {
    time += ms;
    for (const [id, task] of [...timers]) if (task.due <= time) { timers.delete(id); task.fn(); }
  } };
}
function clipboard(t, writeText) {
  const original = Object.getOwnPropertyDescriptor(globalThis, 'navigator');
  Object.defineProperty(globalThis, 'navigator', { configurable: true, value: { clipboard: { writeText } } });
  t.after(() => { if (original) Object.defineProperty(globalThis, 'navigator', original); else delete globalThis.navigator; });
}

test('Demonstrate opens with a complete inspectable example', () => {
  const { app } = setup();
  assert.equal(app.mode, 'demonstrate');
  assert.equal(inspect(app.output).findings[0].decoded, app.payload);
  assert.equal(app.result.status, 'empty');
});
test('typing restarts the delay and only the final demo input generates output', () => {
  const { app, tick, timers } = setup();
  app.payload = 'first'; app.queueDemo(); tick(UPDATE_DELAY - 1);
  assert.equal(app.generated, null);
  app.payload = 'final'; app.queueDemo(); tick(UPDATE_DELAY - 1);
  assert.equal(app.generated, null);
  assert.equal(timers.size, 1);
  tick(1);
  assert.equal(inspect(app.output).findings[0].decoded, 'final');
  assert.equal(app.demoPending, false);
});
test('inspection clears stale evidence immediately and refreshes automatically', () => {
  const { app, tick } = setup();
  app.mode = 'inspect'; app.loadExample('hidden');
  app.input = 'ordinary'; app.queueInspection();
  assert.equal(app.result, null);
  assert.equal(app.findingCount, 0);
  tick(UPDATE_DELAY);
  assert.equal(app.result.status, 'none');
  app.input = '🙂' + encodeTags('NEW'); app.queueInspection(); tick(UPDATE_DELAY);
  assert.equal(app.result.findings[0].decoded, 'NEW');
  assert.equal(app.result.findings[0].start, 2);
});
test('invalid demo input never leaves an older copyable output', async t => {
  const { app, tick } = setup();
  let writes = 0;
  clipboard(t, async () => writes++);
  const cover = app.cover;
  app.payload = '🙂'; app.queueDemo();
  await app.copyOutput();
  tick(UPDATE_DELAY);
  assert.match(app.demoError, /printable ASCII/);
  assert.equal(app.cover, cover);
  assert.equal(app.output, '');
  await app.copyOutput();
  assert.equal(writes, 0);
});
test('composition pauses both workflows until text is committed', () => {
  const { app, tick, timers } = setup();
  app.startComposition('demo'); app.cover = '日'; app.queueDemo({ isComposing: true });
  app.startComposition('inspect'); app.input = '日'; app.queueInspection({ isComposing: true });
  tick(UPDATE_DELAY * 10);
  assert.equal(timers.size, 0);
  assert.equal(app.generated, null);
  assert.equal(app.result, null);
  app.cover = '日本語'; app.input = '日本語';
  app.endComposition('demo'); app.endComposition('inspect'); tick(UPDATE_DELAY);
  assert.ok(app.output.startsWith('日本語'));
  assert.equal(app.result.status, 'none');
});
test('reset and clear cancel queued work and update immediately', () => {
  const { app, tick, timers } = setup();
  const initial = app.output;
  app.payload = 'pending'; app.queueDemo(); app.resetDemo();
  app.input = encodeTags('pending'); app.queueInspection(); app.resetInspection();
  assert.equal(timers.size, 0);
  tick(UPDATE_DELAY);
  assert.equal(app.output, initial);
  assert.equal(app.input, '');
  assert.equal(app.result.status, 'empty');
});
test('examples supersede pending inspection without a second delayed result', () => {
  const { app, tick, timers } = setup();
  app.input = encodeTags('old'); app.queueInspection(); app.loadExample('ordinary');
  assert.equal(timers.size, 0);
  tick(UPDATE_DELAY);
  assert.equal(app.result.status, 'none');
});
test('background preview updates do not announce over the active inspector', () => {
  const { app, tick } = setup();
  app.payload = 'next'; app.queueDemo();
  app.mode = 'inspect'; app.input = 'plain'; app.queueInspection(); tick(UPDATE_DELAY);
  assert.match(app.announcement, /^No supported indicators/);
  assert.equal(inspect(app.output).findings[0].decoded, 'next');
});
test('clipboard fallback opens Raw and selects the complete output', async t => {
  const { app, selected } = setup();
  clipboard(t, async () => { throw new Error('denied'); });
  app.outputView = 'escaped';
  await app.copyOutput();
  assert.equal(app.outputView, 'raw');
  assert.equal(selected(), 1);
  assert.match(app.copyMessage, /Raw text is selected/);
});
test('a late clipboard failure cannot select a different newly edited result', async t => {
  const { app, selected } = setup();
  let reject;
  clipboard(t, () => new Promise((_, fail) => { reject = fail; }));
  const copying = app.copyOutput();
  app.payload = 'new'; app.queueDemo();
  reject(new Error('denied')); await copying;
  assert.equal(selected(), 0);
  assert.equal(app.copyMessage, '');
});
test('Inspect output transfers exact content and replaces pending inspection', () => {
  const { app, timers } = setup();
  const output = app.output;
  app.input = 'old'; app.queueInspection(); app.inspectOutput();
  assert.equal(app.mode, 'inspect');
  assert.equal(app.input, output);
  assert.equal(app.result.findings[0].decoded, app.payload);
  assert.equal(timers.size, 0);
});
test('destroy cancels outstanding timers', () => {
  const { app, timers, tick } = setup();
  app.queueDemo(); app.queueInspection(); app.destroy(); tick(UPDATE_DELAY);
  assert.equal(timers.size, 0);
  assert.equal(app.generated, null);
  assert.equal(app.result, null);
});
