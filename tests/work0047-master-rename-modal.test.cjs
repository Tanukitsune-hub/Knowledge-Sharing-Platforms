const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const index = read('src/Index.html');
const maintenance = read('src/ClientMaintenance.html');
const enhancements = read('src/ClientMaintenanceEnhancements.html');
const styles = read('src/Styles.html');

test('empty Meeting identity hero is hidden while selected and reset identity behavior is preserved', () => {
  assert.match(styles, /#meeting-detail-identity\.meeting-detail-hero:empty\{display:none\}/);
  assert.match(enhancements, /el\('meeting-detail-identity'\)\.textContent=record\.meetingId\+' \/ Version '\+record\.version/);
  assert.match(enhancements, /resetMeetingDetailSelection[\s\S]*?el\('meeting-detail-identity'\)\.textContent=''/);
});

test('Master rename uses one accessible reusable modal and no native prompt', () => {
  assert.match(index, /id="master-rename-modal"[^>]*role="dialog" aria-modal="true"[^>]*aria-labelledby="master-rename-modal-title"/);
  assert.match(index, /for="master-rename-modal-name">新しい名称<\/label>/);
  assert.match(index, /id="master-rename-modal-cancel"[^>]*>キャンセル<\/button>/);
  assert.match(index, /id="master-rename-modal-submit"[^>]*>変更を保存<\/button>/);
  assert.doesNotMatch(maintenance, /\bprompt\s*\(/);
  assert.match(maintenance, /data-master-rename="OPTION" data-master-type="/);
});

function createModalHarness() {
  const events = new Map();
  const calls = [];
  const pageStatuses = [];
  const attrs = new Map();
  const nodes = new Map();
  const document = {
    activeElement: null,
    querySelector(selector) {
      if (selector === 'main') return nodes.get('main');
      return null;
    },
    querySelectorAll(selector) {
      if (selector === '[data-master-rename]') return [...triggers];
      return [];
    },
    body: { classList: { add() {}, remove() {} } }
  };
  function node(id) {
    const item = {
      id, hidden: id === 'master-rename-modal-backdrop', disabled: false, value: '', textContent: '', className: '', isConnected: true,
      dataset: {},
      focus() { document.activeElement = item; item.focused = true; },
      select() { item.selected = true; },
      setAttribute(name, value) { attrs.set(id + ':' + name, String(value)); },
      removeAttribute(name) { attrs.delete(id + ':' + name); },
      addEventListener(name, handler) { events.set(id + ':' + name, handler); },
      querySelectorAll() { return [nodes.get('master-rename-modal-close'), nodes.get('master-rename-modal-name'), nodes.get('master-rename-modal-cancel'), nodes.get('master-rename-modal-submit')]; }
    };
    nodes.set(id, item);
    return item;
  }
  ['main', 'master-rename-modal-backdrop', 'master-rename-modal', 'master-rename-modal-title', 'master-rename-modal-name',
    'master-rename-modal-status', 'master-rename-modal-submit', 'master-rename-modal-cancel', 'master-rename-modal-close',
    'master-rename-modal-form'].forEach(node);
  const triggers = new Set();
  const context = vm.createContext({
    Object, Array, String, Boolean, Promise, document,
    MASTER_TAB_LABELS: { COUNTERPARTY: '面談先', ASSET_CLASS: 'アセットクラス', LOCATION: '面談場所', TEAM: 'チーム' },
    masterReorderBusy: false,
    isMasterOptionTab: type => ['ASSET_CLASS', 'LOCATION', 'TEAM'].includes(type),
    masterOrderDirty: () => false,
    el: id => nodes.get(id),
    showStatus: (...args) => pageStatuses.push(args),
    setTimeout: fn => fn(),
    performMasterMutation: async payload => { calls.push(payload); }
  });
  const start = maintenance.indexOf('const masterRenameModalState=');
  const end = maintenance.indexOf("el('option-add-name').addEventListener", start);
  assert.ok(start >= 0 && end > start, 'production modal implementation is extractable');
  vm.runInContext(maintenance.slice(start, end), context, { filename: 'ClientMaintenance.master-rename.js' });
  function trigger(entity, type, id, name) {
    const item = { dataset: { masterRename: entity, masterType: type || '', id, name }, isConnected: true, focus() { document.activeElement = item; item.focused = true; } };
    triggers.add(item);
    return item;
  }
  return { context, nodes, events, calls, pageStatuses, trigger, document, attrs };
}

test('all four Master categories open with dynamic title and current name prefilled; Cancel mutates zero times', () => {
  const harness = createModalHarness();
  const cases = [
    ['COUNTERPARTY', '', '面談先', 'Synthetic Counterparty'],
    ['OPTION', 'ASSET_CLASS', 'アセットクラス', 'Synthetic Asset'],
    ['OPTION', 'LOCATION', '面談場所', 'Synthetic Location'],
    ['OPTION', 'TEAM', 'チーム', 'Synthetic Team']
  ];
  for (const [entity, type, label, name] of cases) {
    const button = harness.trigger(entity, type, entity + '-' + type, name);
    harness.context.openMasterRenameModal(button);
    assert.equal(harness.nodes.get('master-rename-modal-backdrop').hidden, false);
    assert.equal(harness.nodes.get('master-rename-modal-title').textContent, label + 'の名称変更');
    assert.equal(harness.nodes.get('master-rename-modal-name').value, name);
    assert.equal(harness.document.activeElement.id, 'master-rename-modal-name');
    assert.equal(harness.nodes.get('master-rename-modal-name').selected, true);
    harness.nodes.get('master-rename-modal-cancel').onclick();
    assert.equal(harness.nodes.get('master-rename-modal-backdrop').hidden, true);
    assert.equal(button.focused, true);
  }
  assert.equal(harness.calls.length, 0);
});

test('valid Save and form Enter path issue exactly one existing RENAME mutation and close', async () => {
  const harness = createModalHarness();
  const button = harness.trigger('OPTION', 'ASSET_CLASS', 'AC-1', 'Old Asset');
  harness.context.openMasterRenameModal(button);
  harness.nodes.get('master-rename-modal-name').value = '  New Asset  ';
  await harness.events.get('master-rename-modal-form:submit')({ preventDefault() {} });
  assert.deepEqual(JSON.parse(JSON.stringify(harness.calls)), [{ entity: 'OPTION', action: 'RENAME', id: 'AC-1', name: 'New Asset' }]);
  assert.equal(harness.nodes.get('master-rename-modal-backdrop').hidden, true);
});

test('empty input and service failure keep the modal open with the input preserved', async () => {
  const harness = createModalHarness();
  harness.context.openMasterRenameModal(harness.trigger('OPTION', 'TEAM', 'TEAM-1', 'Old Team'));
  harness.nodes.get('master-rename-modal-name').value = '   ';
  await harness.context.submitMasterRenameModal({ preventDefault() {} });
  assert.equal(harness.calls.length, 0);
  assert.equal(harness.nodes.get('master-rename-modal-backdrop').hidden, false);
  assert.match(harness.nodes.get('master-rename-modal-status').textContent, /新しい名称/);

  harness.context.performMasterMutation = async payload => { harness.calls.push(payload); throw new Error('MASTER_DUPLICATE_NAME'); };
  harness.nodes.get('master-rename-modal-name').value = 'Duplicate Team';
  await harness.context.submitMasterRenameModal({ preventDefault() {} });
  assert.equal(harness.calls.length, 1);
  assert.equal(harness.nodes.get('master-rename-modal-backdrop').hidden, false);
  assert.equal(harness.nodes.get('master-rename-modal-name').value, 'Duplicate Team');
  assert.match(harness.nodes.get('master-rename-modal-status').textContent, /MASTER_DUPLICATE_NAME/);
});

test('Escape closes without mutation and dirty Option reorder cannot open or bypass the guard', () => {
  const harness = createModalHarness();
  const button = harness.trigger('OPTION', 'LOCATION', 'LOC-1', 'Tokyo');
  harness.context.openMasterRenameModal(button);
  let prevented = false;
  harness.events.get('master-rename-modal:keydown')({ key: 'Escape', preventDefault() { prevented = true; } });
  assert.equal(prevented, true);
  assert.equal(harness.nodes.get('master-rename-modal-backdrop').hidden, true);
  assert.equal(harness.calls.length, 0);

  harness.context.masterOrderDirty = () => true;
  harness.context.openMasterRenameModal(button);
  assert.equal(harness.nodes.get('master-rename-modal-backdrop').hidden, true);
  assert.equal(harness.pageStatuses.length, 1);
  assert.match(harness.pageStatuses[0][2], /並び順を保存または元に戻してから/);
  assert.match(maintenance, /const mutationsDisabled=masterReorderBusy\|\|masterOrderDirty\(activeMasterTab\)/);
});
