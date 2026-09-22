const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const client = fs.readFileSync(path.join(root, 'src', 'ClientAiProviderSettings.html'), 'utf8');
const page = fs.readFileSync(path.join(root, 'src', 'AiProviderSettingsPage.html'), 'utf8');

function createHarness() {
  const calls = [];
  const providerLoads = [];
  const statuses = [];
  const nodes = new Map();
  const tabs = ['provider', 'deleted', 'theme'].map(tab => makeNode('tab-' + tab, { adminTab: tab }));

  function makeNode(id, dataset = {}) {
    const events = new Map();
    const attrs = new Map();
    const node = {
      id,
      dataset,
      value: '',
      hidden: false,
      disabled: false,
      isConnected: true,
      innerHTML: '',
      textContent: '',
      tabIndex: 0,
      classList: { toggle() {} },
      addEventListener(name, handler) { events.set(name, handler); },
      setAttribute(name, value) { attrs.set(name, String(value)); },
      focus() { node.focused = true; },
      events,
      attrs
    };
    nodes.set(id, node);
    return node;
  }

  ['admin-panel-provider', 'admin-panel-deleted', 'admin-panel-theme', 'admin-deleted-date-from',
    'admin-deleted-date-to', 'admin-deleted-counterparty-id', 'admin-deleted-asset-class-id',
    'admin-deleted-status-filter', 'admin-deleted-search', 'admin-deleted-meetings',
    'admin-deleted-status', 'admin-deleted-results', 'nav-ai-provider-settings'].forEach(id => makeNode(id));
  nodes.get('admin-deleted-status-filter').value = 'Inactive';
  nodes.get('admin-deleted-results').innerHTML = '<tr><td colspan="8" class="empty-cell">検索すると記録が表示されます。</td></tr>';

  const document = {
    getElementById: id => nodes.get(id),
    querySelectorAll: selector => selector === '[data-admin-tab]' ? tabs : []
  };
  const context = vm.createContext({
    document,
    Array,
    Number,
    String,
    Promise,
    escapeHtml: value => String(value),
    showStatus: (...args) => statuses.push(args),
    kspSetActionBusy(button, busy, label) { if (button) { button.disabled = busy; button.busyLabel = busy ? label : ''; } },
    kspSetRegionBusy(region, busy) { if (region) region.setAttribute('aria-busy', String(busy)); },
    serverCall: async (name, payload) => {
      calls.push({ name, payload });
      if (name === 'changeMeetingStatus') return { ok: true };
      return { ok: true, records: [{ meetingId: 'MEETING-1', version: 2, status: 'Inactive', date: '2026-09-22' }] };
    },
    loadAiProviderAdminData: async preserveNotice => { providerLoads.push(preserveNotice); }
  });

  const tabStart = client.indexOf('function selectAdminTab(');
  const tabEnd = client.indexOf('function aiProviderAdminStatusLabel', tabStart);
  const deletedStart = client.indexOf('let adminDeletedMeetingRecords=');
  const deletedEnd = client.lastIndexOf('</script>');
  assert.ok(tabStart >= 0 && tabEnd > tabStart && deletedStart >= 0 && deletedEnd > deletedStart);
  vm.runInContext(
    'function aiProviderAdminElement(id){return document.getElementById(id)}\nlet activeAdminTab="provider";\n' +
      client.slice(tabStart, tabEnd) + '\n' + client.slice(deletedStart, deletedEnd),
    context,
    { filename: 'ClientAiProviderSettings.manual-search.js' }
  );
  return { context, nodes, tabs, calls, providerLoads, statuses };
}

test('initial deleted-record table preserves the manual-search message', () => {
  assert.match(page, /id="admin-deleted-results"[\s\S]*検索すると記録が表示されます。/);
});

test('admin entry loads provider data but does not search deleted records', async () => {
  const harness = createHarness();
  await harness.nodes.get('nav-ai-provider-settings').events.get('click')();
  assert.deepEqual(harness.providerLoads, [false]);
  assert.equal(harness.calls.length, 0);
  assert.match(harness.nodes.get('admin-deleted-results').innerHTML, /検索すると記録が表示されます。/);
  assert.equal(harness.statuses.length, 0);
});

test('deleted tab click, keyboard switch, and filter edits issue zero search RPCs', () => {
  const harness = createHarness();
  harness.tabs.find(tab => tab.dataset.adminTab === 'deleted').events.get('click')();
  harness.context.adminTabKeydown({ key: 'ArrowRight', preventDefault() {} });
  harness.nodes.get('admin-deleted-date-from').value = '2026-09-01';
  harness.nodes.get('admin-deleted-status-filter').value = 'Active';
  assert.equal(harness.calls.length, 0);
});

test('explicit Search issues exactly one RPC and tab return preserves results without refetch', async () => {
  const harness = createHarness();
  harness.nodes.get('admin-deleted-date-from').value = '2026-09-01';
  await harness.nodes.get('admin-deleted-search').events.get('click')();
  assert.equal(harness.calls.filter(call => call.name === 'searchMeetingRecords').length, 1);
  assert.equal(harness.calls[0].payload.dateFrom, '2026-09-01');
  const rendered = harness.nodes.get('admin-deleted-results').innerHTML;
  harness.tabs.find(tab => tab.dataset.adminTab === 'provider').events.get('click')();
  harness.tabs.find(tab => tab.dataset.adminTab === 'deleted').events.get('click')();
  assert.equal(harness.calls.filter(call => call.name === 'searchMeetingRecords').length, 1);
  assert.equal(harness.nodes.get('admin-deleted-results').innerHTML, rendered);
});

test('successful restore keeps exactly one refresh search with the current filters', async () => {
  const harness = createHarness();
  harness.nodes.get('admin-deleted-counterparty-id').value = 'CP-1';
  harness.context.renderAdminDeletedMeetings([{ meetingId: 'MEETING-1', version: 2, status: 'Inactive' }]);
  const trigger = { disabled: false, isConnected: true };
  await harness.context.restoreAdminDeletedMeeting(0, trigger);
  assert.equal(harness.calls.filter(call => call.name === 'changeMeetingStatus').length, 1);
  assert.equal(harness.calls.filter(call => call.name === 'searchMeetingRecords').length, 1);
  assert.equal(harness.calls.find(call => call.name === 'searchMeetingRecords').payload.counterpartyId, 'CP-1');
  assert.equal(trigger.disabled, false);
});
