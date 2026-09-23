const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const page = fs.readFileSync(path.join(root, 'src', 'ActivityAnalyticsPage.html'), 'utf8');
const client = fs.readFileSync(path.join(root, 'src', 'ClientActivityAnalytics.html'), 'utf8');
const clientScript = client.match(/<script>([\s\S]*?)<\/script>/)[1];

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function analyticsData(completed, bucketCount, adminCheckAvailable) {
  return {
    ok: true,
    period: { mode: 'monthly', startDate: '2025-09-20', endDate: '2026-09-20', bucketCount },
    headline: { meetingCount: 1, activeMeetingCount: 1, distinctCounterpartyCount: 1, openFollowUpCount: 0 },
    series: [{ label: '2026-09', meetingCount: 1, activeMeetingCount: 1, distinctCounterpartyCount: 1, openFollowUpCount: 0 }],
    breakdown: { totalCount: 1, omittedCount: 0, items: [{ label: 'PD', meetingCount: 1, activeMeetingCount: 1, distinctCounterpartyCount: 1, openFollowUpCount: 0 }] },
    drill: { records: [{
      meetingId: 'MTG-000039', date: '2026-09-20', time: '10:00',
      counterpartyEntityKey: 'COUNTERPARTY:CP-000039', counterpartyName: 'Synthetic Counterparty', teamId: 'TEAM-PD', teamName: 'PD',
      meetingTypeCodes: ['ANNUAL_REVIEW', 'OFFICE_VISIT', 'ANNUAL_GENERAL_MEETING'],
      meetingTypeLabels: ['定例年1回', '先方オフィス訪問', '年次総会'],
      status: 'Active', followUpRequired: false,
      documentUrl: 'https://docs.google.com/document/d/synthetic/edit',
      adminCheckCompleted: completed,
      adminCheckUpdatedAt: completed ? '2026-09-20T01:00:00.000Z' : '',
      adminCheckUpdatedBy: completed ? 'synthetic' : ''
    }], omittedCount: 0 },
    filterOptions: { counterpartyEntities: [], assetClasses: [], teams: [], meetingTypes: [], statuses: [] },
    adminCheckAvailable,
    adminChecks: []
  };
}

function createHarness(responder) {
  const nodes = new Map();
  const statuses = [];
  const calls = [];
  function node(id) {
    if (nodes.has(id)) return nodes.get(id);
    const listeners = {};
    const value = {
      id, value: '', disabled: false, checked: false, innerHTML: '', textContent: '', options: [],
      classList: { add() {}, remove() {}, toggle() {} },
      addEventListener(name, handler) { listeners[name] = handler; },
      appendChild(child) { this.options.push(child); },
      setAttribute(name, next) { this[name] = next; },
      focus() { this.focused = true; },
      _listeners: listeners
    };
    nodes.set(id, value);
    return value;
  }
  const graphTab = node('activity-tab-graph'); graphTab.dataset = { activityView: 'graph' };
  const listTab = node('activity-tab-list'); listTab.dataset = { activityView: 'list' };
  const context = vm.createContext({
    console, Promise, String, Number, Boolean, Array, Object, Math, Error,
    document: { createElement() { return { value: '', textContent: '' }; }, querySelectorAll(selector) { return selector === '[data-activity-view]' ? [graphTab, listTab] : []; } },
    el: node,
    kspEscapeHtml(value) { return String(value == null ? '' : value); },
    kspSafeDriveUrl(value) { return String(value || ''); },
    clearStatus(id) { statuses.push({ id, kind: 'clear', message: '' }); },
    showStatus(id, kind, message) { statuses.push({ id, kind, message }); },
    showPage() {},
    kspSetActionBusy(button, busy, label) { if (button) { button.disabled = busy; button.busyLabel = busy ? label : ''; } },
    kspSetRegionBusy(region, busy) { if (region) region.setAttribute('aria-busy', String(busy)); },
    serverCall: async (method, payload) => {
      calls.push({ method, payload: clone(payload) });
      return responder(method, payload);
    }
  });
  vm.runInContext(clientScript, context, { filename: 'src/ClientActivityAnalytics.html' });
  return { context, node, statuses, calls };
}

test('Analytics tab switching and keyboard navigation are presentation-only', () => {
  const harness = createHarness(async () => ({ ok: true }));
  harness.context.selectActivityView('list');
  assert.equal(harness.node('activity-graph-panel').hidden, true);
  assert.equal(harness.node('activity-list-panel').hidden, false);
  assert.equal(harness.calls.length, 0);
  const keydown = harness.node('activity-tab-list')._listeners.keydown;
  keydown({ key: 'ArrowLeft', preventDefault() {} });
  assert.equal(harness.node('activity-graph-panel').hidden, false);
  assert.equal(harness.node('activity-list-panel').hidden, true);
  assert.equal(harness.calls.length, 0);
});

test('drill table has the eight required columns and no legacy admin-check card', () => {
  assert.match(page, /<th>日付<\/th><th>Meeting ID<\/th><th>面談先<\/th><th>チーム<\/th><th>MTG種別<\/th><th>Status<\/th><th>原本<\/th><th>確認済み<\/th>/);
  assert.doesNotMatch(page, /activity-admin-check-card|activity-admin-check-results|月次管理反映済み/);
  assert.match(page, /id="activity-admin-check-status"/);
});

test('one-year and one-month drill rows always render canonical labels, 原本, and checkbox', () => {
  const harness = createHarness(async () => ({ ok: true }));
  for (const data of [analyticsData(false, 13, false), analyticsData(true, 1, true)]) {
    harness.context.activityRender(clone(data));
    const html = harness.node('activity-drill-results').innerHTML;
    assert.match(html, /定例年1回/);
    assert.match(html, /先方オフィス訪問/);
    assert.match(html, /年次総会/);
    assert.doesNotMatch(html, />ANNUAL_REVIEW<|>OFFICE_VISIT<|>ANNUAL_GENERAL_MEETING</);
    assert.match(html, /data-activity-admin-meeting="MTG-000039"/);
    assert.match(html, />原本<\/a>/);
  }
});

test('inline checkbox autosaves false to true, survives reload, then saves true to false', async () => {
  let authoritative = analyticsData(false, 13, false);
  let updateTick = 0;
  const harness = createHarness(async (method, payload) => {
    if (method === 'getMeetingActivityAnalytics') return clone(authoritative);
    assert.equal(method, 'updateMeetingAdminCheck');
    updateTick += 1;
    const record = authoritative.drill.records[0];
    assert.equal(payload.expectedAdminCheckCompleted, record.adminCheckCompleted);
    assert.equal(payload.expectedAdminCheckUpdatedAt, record.adminCheckUpdatedAt);
    record.adminCheckCompleted = payload.desiredCompleted;
    record.adminCheckUpdatedAt = `2026-09-20T01:00:0${updateTick}.000Z`;
    record.adminCheckUpdatedBy = 'synthetic';
    return { ok: true, changed: true, meetingId: record.meetingId, adminCheck: { completed: record.adminCheckCompleted, updatedAt: record.adminCheckUpdatedAt, updatedBy: record.adminCheckUpdatedBy } };
  });
  harness.context.activityRender(clone(authoritative));

  const checked = { dataset: { activityAdminMeeting: 'MTG-000039' }, checked: true, disabled: false, setAttribute(name, value) { this[name] = value; } };
  await harness.context.updateActivityAdminCheck(checked);
  assert.equal(checked.disabled, false);
  assert.equal(checked.checked, true);
  assert.deepEqual(harness.calls[0], {
    method: 'updateMeetingAdminCheck',
    payload: { meetingId: 'MTG-000039', desiredCompleted: true, expectedAdminCheckCompleted: false, expectedAdminCheckUpdatedAt: '' }
  });

  await harness.context.loadActivityAnalytics();
  assert.match(harness.node('activity-drill-results').innerHTML, /data-activity-admin-meeting="MTG-000039"[^>]* checked/);

  const unchecked = { dataset: { activityAdminMeeting: 'MTG-000039' }, checked: false, disabled: false, setAttribute(name, value) { this[name] = value; } };
  await harness.context.updateActivityAdminCheck(unchecked);
  assert.equal(unchecked.disabled, false);
  assert.equal(unchecked.checked, false);
  assert.deepEqual(harness.calls[2], {
    method: 'updateMeetingAdminCheck',
    payload: { meetingId: 'MTG-000039', desiredCompleted: false, expectedAdminCheckCompleted: true, expectedAdminCheckUpdatedAt: '2026-09-20T01:00:01.000Z' }
  });
});

test('stale update reloads authoritative drill state and restores the checkbox safely', async () => {
  const authoritative = analyticsData(false, 13, false);
  const harness = createHarness(async method => {
    if (method === 'updateMeetingAdminCheck') return { ok: false, error: { code: 'ADMIN_CHECK_STALE', message: '月次管理状態が先に更新されています。最新情報を読み直してください。' } };
    return clone(authoritative);
  });
  harness.context.activityRender(clone(authoritative));
  const control = { dataset: { activityAdminMeeting: 'MTG-000039' }, checked: true, disabled: false, setAttribute(name, value) { this[name] = value; } };
  await harness.context.updateActivityAdminCheck(control);
  assert.deepEqual(harness.calls.map(call => call.method), ['updateMeetingAdminCheck', 'getMeetingActivityAnalytics']);
  assert.doesNotMatch(harness.node('activity-drill-results').innerHTML, /data-activity-admin-meeting="MTG-000039"[^>]* checked/);
  assert.equal(harness.statuses.at(-1).kind, 'error');
  assert.match(harness.statuses.at(-1).message, /先に更新/);
});
