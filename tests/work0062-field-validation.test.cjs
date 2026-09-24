const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const source = name => fs.readFileSync(path.join(root, 'src', name), 'utf8');
const core = source('ClientCore.html');
const helper = core.slice(core.indexOf('function kspMeetingRequiredControls('), core.indexOf('const kspActionBusyStates'));

function harness(prefix) {
  const fields = ['date', 'counterpartyId', 'assetClassId'];
  const nodes = new Map();
  const focused = [];
  const statuses = [];
  const controls = fields.map(field => {
    const id = prefix + '-' + field;
    const attributes = new Map();
    const listeners = new Map();
    const node = {
      id, value: '',
      setAttribute(name, value) { attributes.set(name, value); },
      getAttribute(name) { return attributes.has(name) ? attributes.get(name) : null; },
      removeAttribute(name) { attributes.delete(name); },
      addEventListener(name, listener) { listeners.set(name, listener); },
      focus() { focused.push(id); },
      dispatch(name) { listeners.get(name)(); }
    };
    nodes.set(id, node);
    nodes.set(id + '-error', { id: id + '-error', hidden: true });
    return node;
  });
  nodes.set(prefix + '-form', { querySelectorAll() { return controls; } });
  nodes.set((prefix === 'meeting' ? 'meeting-edit' : 'meeting') + '-form', { querySelectorAll() { return []; } });
  nodes.set(prefix === 'meeting' ? 'meeting-status' : 'meeting-edit-status', { textContent: '' });
  const statusId = prefix === 'meeting' ? 'meeting-status' : 'meeting-edit-status';
  const context = vm.createContext({ el: id => nodes.get(id), showStatus: (...args) => { statuses.push(args); nodes.get(statusId).textContent = args[2]; }, clearStatus: () => { nodes.get(statusId).textContent = ''; } });
  vm.runInContext(helper, context);
  return { nodes, controls, focused, statuses, run: code => vm.runInContext(code, context) };
}

test('registration and edit expose the same three specific field errors beside required controls', () => {
  for (const [prefix, page] of [['meeting', source('Index.html')], ['meeting-edit', source('MaintenancePages.html')]]) {
    for (const [field, message] of [['date', '日付を入力してください。'], ['counterpartyId', '面談先を選択してください。'], ['assetClassId', 'アセットクラスを選択してください。']]) {
      const id = prefix + '-' + field;
      assert.match(page, new RegExp('id="' + id + '"[^>]*required'));
      assert.match(page, new RegExp('id="' + id + '-error"[^>]*hidden>' + message));
    }
  }
  assert.match(source('Index.html'), /kspValidateMeetingRequired\('meeting','meeting-status'\)/);
  assert.match(source('ClientMaintenance.html'), /kspValidateMeetingRequired\('meeting-edit','meeting-edit-status'\)/);
});

for (const prefix of ['meeting', 'meeting-edit']) {
  test(prefix + ' reports every missing field, focuses first, and retains input values', () => {
    const h = harness(prefix);
    h.nodes.get(prefix + '-counterpartyId').value = 'CP-1';
    assert.equal(h.run(`kspValidateMeetingRequired('${prefix}','status')`), false);
    assert.equal(h.nodes.get(prefix + '-date').getAttribute('aria-invalid'), 'true');
    assert.equal(h.nodes.get(prefix + '-date').getAttribute('aria-describedby'), prefix + '-date-error');
    assert.equal(h.nodes.get(prefix + '-assetClassId').getAttribute('aria-invalid'), 'true');
    assert.equal(h.nodes.get(prefix + '-counterpartyId').getAttribute('aria-invalid'), null);
    assert.equal(h.nodes.get(prefix + '-date-error').hidden, false);
    assert.equal(h.nodes.get(prefix + '-assetClassId-error').hidden, false);
    assert.equal(h.nodes.get(prefix + '-counterpartyId').value, 'CP-1');
    assert.equal(h.focused[0], prefix + '-date');
    assert.equal(h.statuses.at(-1)[2], '必須項目を入力してください。');
    h.nodes.get(prefix + '-date').value = '2026-09-24';
    h.nodes.get(prefix + '-date').dispatch('input');
    assert.equal(h.nodes.get(prefix + '-date').getAttribute('aria-invalid'), null);
    assert.equal(h.nodes.get(prefix + '-date').getAttribute('aria-describedby'), null);
    assert.equal(h.nodes.get(prefix + '-date-error').hidden, true);
    assert.equal(h.nodes.get(prefix + '-assetClassId').getAttribute('aria-invalid'), 'true');
    h.nodes.get(prefix + '-assetClassId').value = 'AC-1';
    h.nodes.get(prefix + '-assetClassId').dispatch('change');
    assert.equal(h.run(`kspValidateMeetingRequired('${prefix}','status')`), true);
    assert.equal(h.nodes.get(prefix + '-assetClassId-error').hidden, true);
    assert.equal(h.nodes.get(prefix === 'meeting' ? 'meeting-status' : 'meeting-edit-status').textContent, '');
  });
}
