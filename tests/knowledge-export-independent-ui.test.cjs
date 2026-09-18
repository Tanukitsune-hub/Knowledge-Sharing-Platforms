const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const page = fs.readFileSync(path.join(__dirname, '../src/KnowledgeSearchPage.html'), 'utf8');
const client = fs.readFileSync(path.join(__dirname, '../src/ClientKnowledgeSearch.html'), 'utf8');
const plain = value => JSON.parse(JSON.stringify(value));

// DOM and google.script.run are external boundaries. All request construction,
// validation, event handlers and preview rendering execute the production script.
function harness() {
  const nodes = new Map();
  function node() {
    const classes = new Set();
    return {value: '', textContent: '', disabled: false, hidden: false, checked: false,
      readOnly: false, options: [], selectedOptions: [], listeners: {}, style: {},
      classList: {add: x => classes.add(x), remove: x => classes.delete(x),
        toggle(x, force) {if (force) classes.add(x); else classes.delete(x)}, contains: x => classes.has(x)},
      addEventListener(type, fn) {this.listeners[type] = fn}, append() {}, appendChild(child) {this.options.push(child)},
      setAttribute() {}, remove() {}};
  }
  for (const [, id] of page.matchAll(/\bid="([^"]+)"/g)) nodes.set(id, node());
  nodes.get('knowledge-route').value = 'OPENAI';
  nodes.get('knowledge-mode').value = '自由質問';
  const calls = [];
  const preview = {mode: '要約', scopeSummary: 'Entity LP_ASSET_OWNER:OPT-CPLP-001 / Source Meeting',
    meetingCount: 1, meetingCharacterCount: 20, pitchbookCount: 0, sourceIds: ['MTG-1'], sourceIdCount: 1,
    packageText: 'Authoritative synthetic Meeting text', previewFingerprint: 'synthetic-fingerprint', noResults: false, hardStop: false};
  let response = {ok: true, preview};
  const runner = {withSuccessHandler(success) {return {withFailureHandler() {return new Proxy({}, {
    get(_target, method) {return payload => {if (method === 'getKnowledgeSearchBootstrapData') return;
      calls.push({method, payload: plain(payload)});success(response)}}
  })}}}};
  const context = vm.createContext({document: {getElementById: id => nodes.get(id) || null, createElement: node},
    google: {script: {run: runner}}, console, Intl, Date, Set, Object, Promise,
    setTimeout: () => 1, clearTimeout() {}});
  new vm.Script(client.match(/<script>([\s\S]*?)<\/script>/)[1]).runInContext(context);
  return {context, nodes, calls, setResponse: value => {response = value}};
}

test('production layout has accepted row order and a dedicated non-submit Full Output action', () => {
  const order = ['knowledge-entityKey', 'knowledge-sourceType', 'knowledge-dateFrom', 'knowledge-dateTo',
    'knowledge-all-period', 'knowledge-mode', 'knowledge-model-profile', 'knowledge-instruction'];
  let previous = -1;
  for (const id of order) {const position = page.indexOf('id="' + id + '"');assert.ok(position > previous, id);previous = position}
  assert.match(page, /id="knowledge-full-output"[^>]*type="button">全文出力/);
  assert.doesNotMatch(page, /<option value="FULL_EXPORT"/);
  assert.match(page, /面談記録・資料/);
  assert.match(page, /面談記録のみ/);
  assert.match(page, /資料のみ/);
  const ids = Array.from(page.matchAll(/\bid="([^"]+)"/g), match => match[1]);
  assert.equal(ids.length, new Set(ids).size);
});

test('Full Output click calls existing preview API with common Meeting filters and preserves all AI state', async () => {
  for (const mode of ['自由質問', '比較', '面談準備']) {
    const h = harness();
    const values = {'knowledge-mode': mode, 'knowledge-entityKey': 'LP_ASSET_OWNER:OPT-CPLP-001',
      'knowledge-sourceType': 'Pitchbook', 'knowledge-instruction': '', 'knowledge-model-profile': '',
      'knowledge-dateFrom': '2026-08-01', 'knowledge-dateTo': '2026-08-31', 'knowledge-teamId': 'OPT-TEAM-001'};
    for (const [id, value] of Object.entries(values)) h.nodes.get(id).value = value;
    h.nodes.get('knowledge-entityKeys').selectedOptions = [];
    await h.nodes.get('knowledge-full-output').onclick();
    assert.equal(h.calls.length, 1);
    const call = h.calls[0];
    assert.equal(call.method, 'previewKnowledgeExport');
    assert.equal(call.payload.filters.sourceType, 'Meeting');
    assert.equal(call.payload.filters.entityKey, values['knowledge-entityKey']);
    assert.equal(call.payload.filters.teamId, 'OPT-TEAM-001');
    for (const field of ['mode', 'questionOrInstruction', 'selectedEntityKeys', 'modelProfileId', 'thinkingProfileId']) {
      assert.equal(call.payload[field], undefined, field);
    }
    for (const [id, value] of Object.entries(values)) assert.equal(h.nodes.get(id).value, value, id);
    assert.equal(h.nodes.get('knowledge-export-body-preview').textContent, 'Authoritative synthetic Meeting text');
    assert.equal(h.nodes.get('knowledge-export-docs').disabled, false);
    h.setResponse({ok: false, error: {code: 'KNOWLEDGE_EXPORT_DATE_RANGE_INVALID', message: 'reverse dates'}});
    await h.nodes.get('knowledge-full-output').onclick();
    assert.equal(h.nodes.get('knowledge-export-body-preview').textContent, '');
    assert.equal(h.nodes.get('knowledge-export-docs').disabled, true);
  }
});

test('AI compare uses only 2-5 selected entities while prep uses primary target', async () => {
  const h = harness();
  h.nodes.get('knowledge-entityKey').value = 'LP_ASSET_OWNER:OPT-CPLP-001';
  h.nodes.get('knowledge-mode').value = '比較';
  h.nodes.get('knowledge-entityKeys').selectedOptions = [{value: 'GP:GP-1'}, {value: 'GP:GP-2'}];
  const payload = plain(h.context.kPayload());
  assert.equal(payload.filters.entityKey, '');
  assert.deepEqual(payload.selectedEntityKeys, ['GP:GP-1', 'GP:GP-2']);
  h.nodes.get('knowledge-entityKeys').selectedOptions = [{value: 'GP:GP-1'}];
  await h.nodes.get('knowledge-form').listeners.submit({preventDefault() {}});
  assert.match(h.nodes.get('knowledge-status').textContent, /2–5/);
  assert.equal(h.calls.length, 0);
  h.nodes.get('knowledge-entityKeys').selectedOptions = Array.from({length: 6}, (_, i) => ({value: 'GP:GP-' + i}));
  await h.nodes.get('knowledge-form').listeners.submit({preventDefault() {}});
  assert.equal(h.calls.length, 0);
  h.nodes.get('knowledge-mode').value = '面談準備';
  assert.equal(h.context.kPayload().filters.entityKey, 'LP_ASSET_OWNER:OPT-CPLP-001');
});

test('Meeting-only AI filters reject incompatible source without silently changing source', async () => {
  const h = harness();
  h.nodes.get('knowledge-model-profile').value = 'configured-profile';
  h.nodes.get('knowledge-teamId').value = 'OPT-TEAM-001';
  h.nodes.get('knowledge-sourceType').value = 'Pitchbook';
  h.nodes.get('knowledge-teamId').listeners.change();
  assert.equal(h.nodes.get('knowledge-sourceType').value, 'Pitchbook');
  await h.nodes.get('knowledge-form').listeners.submit({preventDefault() {}});
  assert.match(h.nodes.get('knowledge-status').textContent, /面談記録のみ/);
  assert.equal(h.calls.length, 0);
});

test('read-only mode instruction and free draft are preserved; all-period restores prior dates', () => {
  const h = harness();
  vm.runInContext("knowledgeState.modeDefinitions['要約']={instruction:'Approved bootstrap instruction',inputRequired:false}", h.context);
  h.nodes.get('knowledge-instruction').value = 'User free draft';
  h.nodes.get('knowledge-mode').value = '要約';
  h.context.kApplyMode();
  assert.equal(h.nodes.get('knowledge-instruction').readOnly, true);
  assert.equal(h.nodes.get('knowledge-instruction').value, 'Approved bootstrap instruction');
  h.nodes.get('knowledge-mode').value = '自由質問';
  h.context.kApplyMode();
  assert.equal(h.nodes.get('knowledge-instruction').readOnly, false);
  assert.equal(h.nodes.get('knowledge-instruction').value, 'User free draft');
  h.nodes.get('knowledge-dateFrom').value = '2026-01-02';
  h.nodes.get('knowledge-dateTo').value = '2026-02-03';
  h.nodes.get('knowledge-all-period').checked = true;
  h.context.kApplyAllPeriod();
  assert.equal(h.context.kExportPayload().filters.dateFrom, '');
  assert.equal(h.nodes.get('knowledge-dateFrom').disabled, true);
  h.nodes.get('knowledge-all-period').checked = false;
  h.context.kApplyAllPeriod();
  assert.equal(h.nodes.get('knowledge-dateFrom').value, '2026-01-02');
  assert.equal(h.nodes.get('knowledge-dateTo').value, '2026-02-03');
  assert.equal(h.nodes.get('knowledge-dateFrom').disabled, false);
});
