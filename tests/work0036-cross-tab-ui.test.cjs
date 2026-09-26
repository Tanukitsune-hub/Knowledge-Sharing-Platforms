const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const read = name => fs.readFileSync(path.join(root, 'src', name), 'utf8');
const index = read('Index.html');
const pages = read('MaintenancePages.html');
const knowledge = read('KnowledgeSearchPage.html');
const analyticsPage = read('ActivityAnalyticsPage.html');
const analyticsClient = read('ClientActivityAnalytics.html');
const maintenance = read('ClientMaintenance.html');
const enhancements = read('ClientMaintenanceEnhancements.html');
const clientCore = read('ClientCore.html');
const styles = read('Styles.html');

test('Equity and Debt remains hidden and preserved, not selectable in normal UI', () => {
  assert.match(index, /meeting-field-backend-only" hidden aria-hidden="true"><label for="meeting-capitalTypeId">Equity \/ Debt/);
  assert.match(index, /<div class="field" hidden aria-hidden="true"><label for="pitchbook-capitalTypeId">Equity \/ Debt/);
  assert.match(knowledge, /<div hidden>[\s\S]*id="knowledge-capitalTypeId"/);
  for (const id of ['meeting-past-capitalTypeId', 'meeting-edit-capitalTypeId', 'pitchbook-past-capitalTypeId', 'pitchbook-edit-capitalTypeId']) {
    assert.match(pages, new RegExp(`hidden aria-hidden="true"><label for="${id}">Equity \/ Debt`), id);
  }
  assert.doesNotMatch(pages, /<option value="CAPITAL_TYPE">/);
  assert.match(maintenance, /capitalTypeId:el\('meeting-edit-capitalTypeId'\)\.value/);
  assert.match(maintenance, /capitalTypeId:el\('pitchbook-edit-capitalTypeId'\)\.value/);
});

test('Counterparty Type is selectable only in the shared registration modal', () => {
  assert.doesNotMatch(analyticsPage, /activity-filter-counterpartyType|value="counterpartyType"/);
  assert.doesNotMatch(analyticsClient, /activity-filter-counterpartyType|\['counterpartyTypes'/);
  assert.doesNotMatch(pages, /counterparty-add-type|counterparty-add-form/);
  assert.equal((index.match(/id="counterparty-modal-type"/g) || []).length, 1);
  const select = index.match(/<select id="counterparty-modal-type"[\s\S]*?<\/select>/)[0];
  const values = Array.from(select.matchAll(/<option value="([^"]*)"/g), match => match[1]);
  assert.deepEqual(values, ['', 'GP', 'LP_ASSET_OWNER', 'NISSAY_INTERNAL', 'GROUP_COMPANY', 'CONSULTANT_GATEKEEPER', 'OTHER']);
  const registration = enhancements.slice(enhancements.indexOf('const KSP_COUNTERPARTY_MODAL_TYPES'), enhancements.indexOf('let meetingDetailRecord'));
  assert.doesNotMatch(registration, /\bprompt\s*\(/);
  assert.equal((index.match(/role="dialog"/g) || []).length, 3);
  assert.match(index, /id="counterparty-modal"[^>]*role="dialog" aria-modal="true"/);
  assert.match(index, /id="master-rename-modal"[^>]*role="dialog" aria-modal="true"/);
  assert.match(index, /id="meeting-material-modal"[^>]*role="dialog" aria-modal="true"/);
});

test('cross-tab grids use the accepted 12-column and 14px production language', () => {
  assert.match(knowledge, /knowledge-period-row[^}]*grid-template-columns:repeat\(12,minmax\(0,1fr\)\)[^}]*column-gap:14px[^}]*row-gap:14px/);
  assert.match(knowledge, /knowledge-counterparty-field\{grid-column:1\/span 6\}/);
  assert.match(knowledge, /knowledge-source-field\{grid-column:1\/-1/);
  assert.match(knowledge, /knowledge-date-from-field\{grid-column:1\/span 2\}/);
  assert.match(knowledge, /knowledge-date-to-field\{grid-column:3\/span 2\}/);
  assert.match(knowledge, /knowledge-all-period-field\{grid-column:5\/span 2\}/);
  assert.match(styles, /meeting-edit-grid[^}]*grid-template-columns:repeat\(12,minmax\(0,1fr\)\)[^}]*column-gap:14px[^}]*row-gap:14px/);
  assert.match(styles, /meeting-edit-date-field\{grid-column:1\/span 2;grid-row:1\}/);
  assert.match(styles, /meeting-edit-counterparty-field\{grid-column:1\/span 6;grid-row:2\}/);
  assert.match(styles, /meeting-edit-fund-field\{grid-column:7\/span 4;grid-row:2\}/);
  assert.match(styles, /analytics-controls \.activity-counterparty-field\{grid-column:1\/span 4;grid-row:2\}/);
  assert.match(styles, /entity-workspace-selector-grid>\.field\{grid-column:1\/span 6/);
  assert.match(styles, /\.master-layout\{display:block\}/);
  assert.match(styles, /@media\(max-width:720px\)[^{]*\{[^}]*meeting-edit-grid[^}]*grid-template-columns:1fr/);
});

function createModalHarness() {
  const nodes = new Map();
  const events = new Map();
  const classes = () => ({ add() {}, remove() {} });
  const document = { activeElement: null };
  function node(id) {
    if (nodes.has(id)) return nodes.get(id);
    const value = {
      id, value: '', hidden: id === 'counterparty-modal-backdrop', disabled: false,
      textContent: '', className: '', classList: classes(), attributes: {},
      focus() { document.activeElement = this; },
      setAttribute(name, next) { this.attributes[name] = next; },
      removeAttribute(name) { delete this.attributes[name]; },
      addEventListener(name, handler) { events.set(`${id}:${name}`, handler); },
      querySelectorAll() { return [node('counterparty-modal-type'), node('counterparty-modal-name'), node('counterparty-modal-cancel'), node('counterparty-modal-submit'), node('counterparty-modal-close')]; }
    };
    nodes.set(id, value);
    return value;
  }
  const main = node('main');
  document.getElementById = node;
  document.querySelector = selector => selector === 'main' ? main : null;
  document.body = { classList: classes() };
  document.activeElement = node('initial-focus');
  const calls = [];
  const state = { selected: '', mastersApplied: 0, saved: 0, statuses: [] };
  const context = vm.createContext({
    document, Promise, String, Array, Set, console,
    setTimeout: callback => callback(),
    el: node,
    serverCall: async (name, payload) => { calls.push({ name, payload }); return { ok: true, counterparty: { id: 'CP-NEW' }, masters: { counterparties: [], options: [] } }; },
    applyMaintenanceMasterData() { state.mastersApplied += 1; },
    clearRetryContext() {}, refreshMeetingCounterpartyEntities(id) { state.selected = id; },
    refreshMeetingRelatedPitchbooks() {}, saveMeetingDraft() { state.saved += 1; },
    showStatus(id, kind, message) { state.statuses.push({ id, kind, message }); },
    kspSetActionBusy(button, busy, label) { if (button) { button.disabled = busy; button.busyLabel = busy ? label : ''; } },
    kspSetRegionBusy(region, busy) { if (region) region.setAttribute('aria-busy', String(busy)); }
  });
  vm.runInContext(clientCore.match(/function kspSetMeetingRequiredError\(control,invalid\)\{[^\n]+/)[0], context);
  const start = enhancements.indexOf('const KSP_COUNTERPARTY_MODAL_TYPES');
  const end = enhancements.indexOf('let meetingDetailRecord');
  vm.runInContext(enhancements.slice(start, end), context, { filename: 'ClientMaintenanceEnhancements.modal.js' });
  return { context, nodes, events, calls, state, document };
}

test('shared modal validates locally, registers once, refreshes each origin, and restores focus', async () => {
  const harness = createModalHarness();
  const { context, nodes, calls, state, document } = harness;
  const meetingTrigger = nodes.get('meeting-quick-add-counterparty') || context.el('meeting-quick-add-counterparty');
  context.openCounterpartyModal('meeting', meetingTrigger);
  assert.equal(nodes.get('counterparty-modal-backdrop').hidden, false);
  assert.equal(document.activeElement.id, 'counterparty-modal-type');
  await context.submitCounterpartyModal({ preventDefault() {} });
  assert.equal(calls.length, 0, 'empty type is rejected before RPC');
  nodes.get('counterparty-modal-type').value = 'LP_ASSET_OWNER';
  await context.submitCounterpartyModal({ preventDefault() {} });
  assert.equal(calls.length, 0, 'empty name is rejected before RPC');
  nodes.get('counterparty-modal-name').value = ' Synthetic Counterparty ';
  await context.submitCounterpartyModal({ preventDefault() {} });
  assert.deepEqual(JSON.parse(JSON.stringify(calls[0])), { name: 'quickAddCounterparty', payload: { name: 'Synthetic Counterparty', type: 'LP_ASSET_OWNER' } });
  assert.equal(state.selected, 'CP-NEW');
  assert.equal(state.saved, 1);
  assert.equal(nodes.get('counterparty-modal-backdrop').hidden, true);
  assert.equal(document.activeElement, meetingTrigger);

  const mastersTrigger = context.el('masters-add-counterparty');
  context.openCounterpartyModal('masters', mastersTrigger);
  nodes.get('counterparty-modal-type').value = 'GP';
  nodes.get('counterparty-modal-name').value = 'Synthetic GP';
  await context.submitCounterpartyModal({ preventDefault() {} });
  assert.equal(calls.length, 2);
  assert.equal(state.mastersApplied, 2);
  assert.ok(state.statuses.some(item => item.id === 'masters-status' && item.kind === 'success'));
});

test('Escape and Cancel close without mutation while service errors keep modal input', async () => {
  const harness = createModalHarness();
  const { context, nodes, events, calls } = harness;
  context.openCounterpartyModal('meeting', context.el('meeting-quick-add-counterparty'));
  events.get('counterparty-modal:keydown')({ key: 'Escape', preventDefault() {} });
  assert.equal(calls.length, 0);
  assert.equal(nodes.get('counterparty-modal-backdrop').hidden, true);

  context.openCounterpartyModal('masters', context.el('masters-add-counterparty'));
  nodes.get('counterparty-modal-cancel').onclick();
  assert.equal(calls.length, 0);
  assert.equal(nodes.get('counterparty-modal-backdrop').hidden, true);

  context.openCounterpartyModal('meeting', context.el('meeting-quick-add-counterparty'));
  nodes.get('counterparty-modal-type').value = 'GROUP_COMPANY';
  nodes.get('counterparty-modal-name').value = 'Duplicate Synthetic';
  context.serverCall = async (name, payload) => { calls.push({ name, payload }); return { ok: false, error: { message: '同名の面談先が存在します。' } }; };
  await context.submitCounterpartyModal({ preventDefault() {} });
  assert.equal(nodes.get('counterparty-modal-backdrop').hidden, false);
  assert.equal(nodes.get('counterparty-modal-type').value, 'GROUP_COMPANY');
  assert.equal(nodes.get('counterparty-modal-name').value, 'Duplicate Synthetic');
  assert.equal(nodes.get('counterparty-modal-status').textContent, '同名の面談先が存在します。');
});
