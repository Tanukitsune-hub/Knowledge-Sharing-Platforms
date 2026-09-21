const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const maintenanceSource = fs.readFileSync(path.join(root, 'src', 'ClientMaintenance.html'), 'utf8')
  .replace(/^<script>\s*/, '')
  .replace(/\s*<\/script>\s*$/, '');

const EMPTY_MASTERS = { counterparties: [], options: [] };

function deferred() {
  let resolve;
  let reject;
  const promise = new Promise((nextResolve, nextReject) => {
    resolve = nextResolve;
    reject = nextReject;
  });
  return { promise, resolve, reject };
}

function createHarness(serverCall) {
  const nodes = new Map();
  const listeners = new Map();
  const statuses = [];
  const tabButtons = ['COUNTERPARTY', 'ASSET_CLASS', 'LOCATION', 'TEAM'].map(type => ({
    dataset: { masterTab: type },
    attributes: {},
    classList: { toggle() {} },
    setAttribute(name, value) { this.attributes[name] = value; },
    addEventListener(name, handler) { listeners.set(`tab:${type}:${name}`, handler); }
  }));

  function node(id) {
    if (nodes.has(id)) return nodes.get(id);
    const value = {
      id,
      value: '',
      checked: false,
      hidden: false,
      disabled: false,
      innerHTML: '',
      textContent: '',
      placeholder: '',
      dataset: {},
      options: [],
      attributes: {},
      classList: { add() {}, remove() {}, toggle() {} },
      addEventListener(name, handler) { listeners.set(`${id}:${name}`, handler); },
      appendChild(child) { this.options.push(child); },
      setAttribute(name, next) { this.attributes[name] = next; },
      scrollIntoView() {},
      querySelector() { return null; }
    };
    nodes.set(id, value);
    return value;
  }

  const document = {
    querySelectorAll(selector) {
      if (selector === '[data-master-tab]') return tabButtons;
      return [];
    },
    createElement() { return node(`created-${nodes.size}`); }
  };
  const context = vm.createContext({
    console,
    Promise,
    String,
    Number,
    Boolean,
    Array,
    Set,
    Object,
    document,
    el: node,
    addOptions() {},
    populateSharedOptions() {},
    maintenanceOptionSets() { return {}; },
    clearStatus() {},
    showStatus(id, kind, message) { statuses.push({ id, kind, message }); },
    confirm() { return true; },
    prompt() { return null; },
    serverCall,
    kspSetDefaultDateRange() {},
    selectedOptionValues() { return []; },
    meetingTypeValues() { return []; },
    setMeetingTypeValues() {}
  });
  vm.runInContext(maintenanceSource, context, { filename: 'src/ClientMaintenance.html' });
  context.renderMasters(EMPTY_MASTERS);

  function input(value) {
    const field = node('option-add-name');
    field.value = value;
    const handler = listeners.get('option-add-name:input');
    if (handler) handler({ target: field });
  }

  function submit() {
    const handler = listeners.get('option-add-form:submit');
    assert.ok(handler, 'production option add submit handler is registered');
    return handler({ preventDefault() {}, currentTarget: node('option-add-form') });
  }

  return { context, node, listeners, statuses, tabButtons, input, submit };
}

test('option master drafts are isolated and restored for every tab', () => {
  const harness = createHarness(async () => ({ ok: true, masters: EMPTY_MASTERS }));
  harness.context.selectMasterTab('ASSET_CLASS');
  harness.input('Asset draft');
  harness.context.selectMasterTab('TEAM');
  assert.equal(harness.node('option-add-name').value, '');
  harness.input('Team draft');
  harness.context.selectMasterTab('LOCATION');
  harness.input('Location draft');
  harness.context.selectMasterTab('COUNTERPARTY');
  assert.equal(harness.node('option-add-name').value, '');
  harness.context.selectMasterTab('ASSET_CLASS');
  assert.equal(harness.node('option-add-name').value, 'Asset draft');
  harness.context.selectMasterTab('TEAM');
  assert.equal(harness.node('option-add-name').value, 'Team draft');
  harness.context.selectMasterTab('LOCATION');
  assert.equal(harness.node('option-add-name').value, 'Location draft');
});

test('late success is owned by its submit snapshot and preserves other or newer drafts', async () => {
  const pending = deferred();
  const calls = [];
  const harness = createHarness((name, payload) => {
    calls.push({ name, payload });
    return pending.promise;
  });
  harness.context.selectMasterTab('ASSET_CLASS');
  harness.input('Asset submitted');
  const completion = harness.submit();
  harness.input('Asset newer draft');
  harness.context.selectMasterTab('TEAM');
  harness.input('Team draft while waiting');
  pending.resolve({ ok: true, masters: EMPTY_MASTERS });
  await completion;

  assert.deepEqual(JSON.parse(JSON.stringify(calls)), [{
    name: 'mutateMaster',
    payload: { entity: 'OPTION', action: 'ADD', type: 'ASSET_CLASS', name: 'Asset submitted' }
  }]);
  assert.equal(harness.node('option-add-name').value, 'Team draft while waiting');
  harness.context.selectMasterTab('ASSET_CLASS');
  assert.equal(harness.node('option-add-name').value, 'Asset newer draft');
});

test('late failure keeps all drafts and identifies the originating category', async () => {
  const pending = deferred();
  const harness = createHarness(() => pending.promise);
  harness.context.selectMasterTab('LOCATION');
  harness.input('Location submitted');
  const completion = harness.submit();
  harness.context.selectMasterTab('TEAM');
  harness.input('Team entered later');
  pending.resolve({ ok: false, error: { message: 'synthetic delayed failure' } });
  await completion;

  assert.equal(harness.node('option-add-name').value, 'Team entered later');
  harness.context.selectMasterTab('LOCATION');
  assert.equal(harness.node('option-add-name').value, 'Location submitted');
  assert.ok(harness.statuses.some(item => item.kind === 'error' && /面談場所/.test(item.message)));
});

test('pending option add rejects duplicate submit and refresh preserves active tab and drafts', async () => {
  const addPending = deferred();
  const calls = [];
  const harness = createHarness((name, payload) => {
    calls.push({ name, payload });
    if (name === 'mutateMaster') return addPending.promise;
    return Promise.resolve({ ok: true, masters: EMPTY_MASTERS, options: {} });
  });
  harness.context.selectMasterTab('TEAM');
  harness.input('Team submitted');
  const first = harness.submit();
  const duplicate = harness.submit();
  assert.equal(calls.filter(call => call.name === 'mutateMaster').length, 1);
  addPending.resolve({ ok: true, masters: EMPTY_MASTERS });
  await Promise.all([first, duplicate]);

  harness.context.selectMasterTab('LOCATION');
  harness.input('Location survives refresh');
  await harness.node('masters-refresh').onclick();
  assert.equal(harness.node('option-add-name').value, 'Location survives refresh');
  assert.equal(harness.tabButtons.find(button => button.dataset.masterTab === 'LOCATION').attributes['aria-selected'], 'true');
});

test('multiple local reorder gestures preserve per-tab drafts and one explicit save sends one batch mutation', async () => {
  const masters = { counterparties: [], options: [
    { id: 'AC-1', type: 'ASSET_CLASS', name: 'A', sortOrder: 1, status: 'Active' },
    { id: 'AC-2', type: 'ASSET_CLASS', name: 'B', sortOrder: 2, status: 'Active' },
    { id: 'AC-3', type: 'ASSET_CLASS', name: 'C', sortOrder: 3, status: 'Active' },
    { id: 'TEAM-1', type: 'TEAM', name: 'One', sortOrder: 1, status: 'Active' },
    { id: 'TEAM-2', type: 'TEAM', name: 'Two', sortOrder: 2, status: 'Active' }
  ] };
  const calls = [];
  const harness = createHarness(async (name, payload) => {
    calls.push({ name, payload: JSON.parse(JSON.stringify(payload)) });
    const byOrder = new Map(payload.orderedIds.map((id, index) => [id, index + 1]));
    const updated = { counterparties: [], options: masters.options.map(row => row.type === payload.type
      ? { ...row, sortOrder: byOrder.get(row.id) } : { ...row }) };
    return { ok: true, masters: updated };
  });
  harness.context.renderMasters(masters, { skipDraftCapture: true });
  harness.context.selectMasterTab('ASSET_CLASS');
  harness.context.masterDraftMove('ASSET_CLASS', 'AC-3', 0);
  harness.context.masterDraftMove('ASSET_CLASS', 'AC-1', 2);
  harness.context.renderMasters(masters, { skipDraftCapture: true });
  assert.equal(calls.length, 0);
  assert.match(harness.node('master-reorder-dirty').textContent, /未保存/);

  harness.context.selectMasterTab('TEAM');
  harness.context.masterDraftMove('TEAM', 'TEAM-2', 0);
  harness.context.renderMasters(masters, { skipDraftCapture: true });
  harness.context.selectMasterTab('ASSET_CLASS');
  const html = harness.node('option-master-results').innerHTML;
  assert.ok(html.indexOf('data-master-option-id="AC-3"') < html.indexOf('data-master-option-id="AC-2"'));
  assert.ok(html.indexOf('data-master-option-id="AC-2"') < html.indexOf('data-master-option-id="AC-1"'));

  await harness.context.saveMasterReorder();
  assert.equal(calls.length, 1);
  assert.deepEqual(calls[0], { name: 'mutateMaster', payload: {
    entity: 'OPTION', action: 'REORDER_BATCH', type: 'ASSET_CLASS',
    expectedOrderIds: ['AC-1', 'AC-2', 'AC-3'], orderedIds: ['AC-3', 'AC-2', 'AC-1']
  } });
  assert.equal(harness.node('master-reorder-save').disabled, true);
  await harness.context.saveMasterReorder();
  assert.equal(calls.length, 1);

  harness.context.selectMasterTab('TEAM');
  assert.match(harness.node('master-reorder-dirty').textContent, /未保存/);
});
