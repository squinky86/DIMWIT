// Optional integration checks: install playwright and @axe-core/playwright in a
// separate directory, then set DIMWIT_BROWSER_TOOLS to its package.json path.
import { createRequire } from 'node:module';
import assert from 'node:assert/strict';
const require = createRequire(process.env.DIMWIT_BROWSER_TOOLS || new URL('../package.json', import.meta.url));
const { chromium, firefox } = require('playwright');
const AxeBuilder = require('@axe-core/playwright').default;
const base = process.env.DIMWIT_PREVIEW_URL || 'http://127.0.0.1:4000/DIMWIT/';
for (const engine of ['chromium', 'firefox']) {
  const browser = await (engine === 'chromium' ? chromium : firefox).launch(engine === 'chromium'
    ? { executablePath: process.env.DIMWIT_CHROMIUM || '/opt/google/chrome/chrome', args: ['--no-sandbox'] } : {});
  const context = await browser.newContext({ viewport: { width: 1366, height: 768 }, ignoreHTTPSErrors: true });
  const page = await context.newPage();
  const errors = [], external = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('request', request => { if (!request.url().startsWith(new URL(base).origin + '/')) external.push(request.url()); });
  const ready = () => page.locator('.output-panel .chip').filter({ hasText: /^Ready$/ }).waitFor();
  const audit = async state => {
    const { violations } = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
    assert.deepEqual(violations.map(v => ({ id: v.id, targets: v.nodes.map(n => n.target) })), [], `${engine}: ${state}`);
  };
  await page.goto(base);
  await ready();
  const methods = await page.locator('#technique option').evaluateAll(options => options.map(o => o.value));
  for (const method of methods) {
    await page.locator('.mode-switch').getByRole('button', { name: 'Demonstrate', exact: false }).click();
    await page.locator('#technique').selectOption(method);
    await page.getByRole('button', { name: 'Reset example', exact: true }).click();
    await ready();
    const original = await page.locator('#raw-output').inputValue();
    assert.ok(original.length, method);
    for (const view of ['Raw', 'Escaped', 'Rendered']) await page.getByRole('button', { name: view, exact: true }).click();
    assert.equal(await page.locator('.rendered').textContent(), original);
    await audit(method);
    await page.getByRole('button', { name: 'Inspect output', exact: false }).click();
    assert.equal(await page.locator('#inspect-input').inputValue(), original);
    await page.locator('.finding').first().waitFor();
    await page.getByRole('button', { name: /^Select \d/ }).first().click();
    const selection = await page.locator('#inspect-input').evaluate(el => [el.selectionStart, el.selectionEnd]);
    assert.ok(selection[1] > selection[0]);
    await audit(`${method} findings`);
  }
  await page.locator('#inspect-input').fill('<script>window.dimwitProbe = 1</script><img src="https://example.invalid/probe" onerror="window.dimwitProbe = 2">');
  await page.locator('.finding').first().waitFor();
  assert.equal(await page.evaluate(() => window.dimwitProbe), undefined);
  assert.equal(await page.locator('.inspection-panel img, .inspection-panel script, .inspection-panel iframe').count(), 0);
  await page.locator('#inspect-input').fill('Ordinary text without special markers.');
  await page.locator('#results-title').filter({ hasText: 'No supported indicators found' }).waitFor();
  await page.locator('#inspect-input').fill('a'.repeat(50001));
  await page.locator('#results-title').filter({ hasText: 'Inspection incomplete' }).waitFor();
  assert.equal((await page.locator('#inspect-input').inputValue()).length, 50001);
  await audit('incomplete');
  await page.getByRole('button', { name: 'Scenarios', exact: true }).click();
  const scenarios = await page.locator('#scenario option').evaluateAll(options => options.map(o => o.value));
  for (const scenario of scenarios) for (const comparison of ['Injected example', 'Benign comparison']) {
    await page.getByRole('button', { name: 'Scenarios', exact: true }).click();
    await page.locator('#scenario').selectOption(scenario);
    await page.getByRole('button', { name: comparison, exact: true }).click();
    await page.getByRole('group', { name: 'Scenario source view' }).getByRole('button', { name: 'Raw', exact: true }).click();
    const original = await page.locator('#scenario-source').inputValue();
    await page.getByRole('button', { name: 'Load in Demonstrate', exact: true }).click();
    await ready();
    assert.equal(await page.locator('#raw-output').inputValue(), original);
    await page.getByRole('button', { name: 'Scenarios', exact: true }).click();
    await page.getByRole('button', { name: 'Inspect scenario', exact: true }).click();
    await page.locator('.finding').first().waitFor();
    assert.equal(await page.locator('#inspect-input').inputValue(), original);
    assert.equal(await page.locator('#results-title').innerText(), 'Evidence found');
  }
  await page.getByRole('button', { name: 'Scenarios', exact: true }).click();
  await page.getByRole('button', { name: 'Reset scenario', exact: true }).click();
  assert.equal(await page.getByRole('button', { name: 'Injected example', exact: true }).getAttribute('aria-pressed'), 'true');
  await audit('scenario walkthrough');
  for (const width of [320, 390, 768]) {
    await page.setViewportSize({ width, height: 844 });
    for (const name of ['Demonstrate', 'Inspect text', 'Scenarios']) {
      await page.locator('.mode-switch').getByRole('button', { name, exact: false }).click();
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${name} overflow at ${width}`);
    }
  }
  await page.goto(base);
  await ready();
  await page.keyboard.press('Tab');
  assert.equal(await page.locator(':focus').innerText(), 'Skip to content');
  await page.keyboard.press('Enter');
  for (let i = 0; i < 25 && await page.evaluate(() => document.activeElement.id) !== 'payload-input'; i++) await page.keyboard.press('Tab');
  assert.equal(await page.evaluate(() => document.activeElement.id), 'payload-input');
  await page.keyboard.press('ControlOrMeta+A');
  await page.keyboard.insertText('Keyboard BANANA');
  await ready();
  assert.equal(await page.evaluate(() => document.activeElement.id), 'payload-input');
  const output = await page.locator('#raw-output').inputValue();
  if (engine === 'chromium') {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await page.getByRole('button', { name: 'Copy text', exact: true }).click();
    await page.locator('.copy-status').filter({ hasText: 'Copied' }).waitFor();
    assert.equal(await page.evaluate(() => navigator.clipboard.readText()), output);
  }
  await page.evaluate(() => Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: async () => { throw new Error('denied'); } } }));
  await page.getByRole('button', { name: 'Copy text', exact: true }).click();
  await page.locator('.copy-status').filter({ hasText: 'Raw text is selected' }).waitFor();
  assert.equal(await page.locator('#raw-output').evaluate(el => el.selectionEnd - el.selectionStart), output.length);
  for (const path of ['docs/', 'docs/format/', 'docs/development/', 'docs/review/', 'docs/scenarios/', 'docs/releases/']) {
    assert.equal((await page.goto(base + path)).status(), 200);
    await audit(path);
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), path);
  }
  assert.deepEqual(errors, []);
  assert.deepEqual(external, []);
  console.log(`${engine} ${browser.version()}: ${methods.length} techniques and ${scenarios.length} scenarios with both comparisons, inert previews, findings, keyboard, clipboard, mobile and axe checks passed.`);
  await browser.close();
}
