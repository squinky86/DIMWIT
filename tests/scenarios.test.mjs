import test from 'node:test';
import assert from 'node:assert/strict';
import { scenarios, scenarioFields, scenarioOutput } from '../assets/js/scenarios.js';
import { methods } from '../assets/js/techniques.js';
import { inspect } from '../assets/js/inspector.js';

test('each family has an inert scenario and every scenario has trust and evidence boundaries', () => {
  const families = new Set(scenarios.flatMap(s => s.families));
  for (const method of methods) assert.ok(families.has(method.family), method.family);
  for (const scenario of scenarios) {
    for (const key of ['trusted', 'untrusted', 'injected', 'objective', 'observable', 'external']) assert.ok(scenario[key]?.length, `${scenario.id}:${key}`);
    const output = scenarioOutput(scenario);
    assert.equal(output, scenarioOutput(scenario));
    const result = inspect(output);
    assert.equal(result.status, 'findings', `${scenario.id}: ${result.reasons}`);
    for (const rule of scenario.expected) assert.ok(result.findings.some(f => f.rule === rule), `${scenario.id}: ${rule}`);
    const method = methods.find(m => m.id === scenario.technique);
    assert.equal(method.demonstrate(scenarioFields(scenario)).output, output);
    for (const url of output.matchAll(/https?:\/\/([^/\s"<>]+)/g)) assert.equal(url[1], 'example.invalid');
  }
});
test('benign comparisons are distinct inspectable data, not guaranteed no-findings controls', () => {
  for (const scenario of scenarios) {
    const benign = scenarioOutput(scenario, 'benign');
    assert.notEqual(benign, scenarioOutput(scenario));
    assert.equal(inspect(benign).status, 'findings', scenario.id);
    assert.ok(!inspect(benign).findings.some(f => ['instruction-override', 'prompt-extraction'].includes(f.rule)), scenario.id);
  }
});
test('layered scenario retains all independent technique evidence and coordinates', () => {
  const scenario = scenarios.find(s => s.id === 'layered');
  const output = scenarioOutput(scenario);
  const result = inspect(output);
  const instruction = result.findings.find(f => f.rule === 'instruction-override');
  assert.equal(instruction.path, 'Input → base64 → Unicode tags');
  assert.equal(instruction.layerDepth, 2);
  assert.equal(output.slice(instruction.start, instruction.end), output);
  assert.ok(result.findings.some(f => f.rule === 'markup:container' && f.layerDepth === 1));
});
