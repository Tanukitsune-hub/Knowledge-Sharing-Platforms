const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const activityPage = read('src/ActivityAnalyticsPage.html');
const activityClient = read('src/ClientActivityAnalytics.html');
const entityPage = read('src/EntityWorkspacePage.html');
const entityClient = read('src/ClientEntityWorkspace.html');
const maintenancePage = read('src/MaintenancePages.html');
const maintenanceClient = read('src/ClientMaintenance.html');
const maintenanceCore = read('src/100_MaintenanceCore.gs');
const maintenanceService = read('src/111_MaintenancePitchbookMasterService.gs');
const maintenanceLive = read('src/120_MaintenanceLiveEnvironment.gs');
const knowledgePage = read('src/KnowledgeSearchPage.html');
const knowledgeClient = read('src/ClientKnowledgeSearch.html');
const knowledgeExport = read('src/155_KnowledgeExportContracts.gs');
const { ksp, createFakeEnvironment } = require('./maintenance-test-fixture.cjs');

test('visible UI and print markup remove Counterparty IDs and follow-up surfaces while preserving record IDs', () => {
  const visibleSources = [activityPage, activityClient, entityPage, entityClient, knowledgePage, knowledgeClient, knowledgeExport];
  for (const source of visibleSources) {
    assert.doesNotMatch(source, /要フォロー|Follow-up|Follow-ups/);
  }
  assert.doesNotMatch(entityClient, /item\.name\+' \/ '\+item\.id|entity\.counterpartyId/);
  assert.doesNotMatch(activityClient, /counterpartyEntityKey\|\|record\.counterpartyId|teamId\|\|'未設定'/);
  assert.match(activityPage + entityPage + entityClient, /Meeting ID/);
  assert.match(entityPage + entityClient, /Document ID/);
});

test('Entity Workspace summary has exactly the three accepted Japanese labels', () => {
  assert.match(entityClient, /\['面談件数',[^\]]+\],\['保存資料数',[^\]]+\],\['最後の面談日',[^\]]+\]/);
  assert.doesNotMatch(entityClient, /\['Meetings'|\['Pitchbooks'|\['Relationships'/);
  assert.match(entityPage, /entity-summary-grid/);
});

test('Analytics exposes accessible graph and meeting-list tabs without tab-switch RPC', () => {
  assert.match(activityPage, /<h2>面談実績の集計<\/h2>/);
  assert.match(activityPage, /role="tablist"/);
  assert.match(activityPage, />グラフ<\/button>[\s\S]*>面談一覧<\/button>/);
  assert.match(activityPage, /id="activity-graph-panel"[^>]*role="tabpanel"/);
  assert.match(activityPage, /id="activity-list-panel"[^>]*role="tabpanel"[^>]*hidden/);
  assert.match(activityClient, /function selectActivityView\(/);
  const selectStart = activityClient.indexOf('function selectActivityView(');
  const selectEnd = activityClient.indexOf('function activityRender(', selectStart);
  assert.ok(selectStart >= 0 && selectEnd > selectStart, 'production tab selection function is present');
  assert.doesNotMatch(activityClient.slice(selectStart, selectEnd), /serverCall|loadActivityAnalytics/);
  assert.match(activityClient, /keydown/);
});

test('Master reorder is staged locally and saved as one complete batch mutation', () => {
  assert.match(maintenancePage, /id="master-reorder-save"[^>]*disabled[^>]*>並び順を保存<\/button>/);
  assert.match(maintenancePage, /id="master-reorder-dirty"/);
  assert.match(maintenanceClient, /action:'REORDER_BATCH'/);
  assert.match(maintenanceClient, /expectedOrderIds/);
  assert.match(maintenanceClient, /orderedIds/);
  const dropBody = maintenanceClient.match(/addEventListener\('drop',[\s\S]*?\);/);
  assert.ok(dropBody, 'production drop handler is present');
  assert.doesNotMatch(dropBody[0], /serverCall|mutateMaster|performMasterReorder/);
  assert.doesNotMatch(maintenanceClient, /action:'REORDER'/);
  assert.match(maintenanceClient, /masterOrderDrafts/);
});

test('batch reorder contract validates exact expected order and performs one bounded sheet write', () => {
  assert.match(maintenanceCore, /REORDER_BATCH/);
  assert.match(maintenanceCore, /expectedOrderIds/);
  assert.match(maintenanceCore, /orderedIds/);
  assert.match(maintenanceCore, /OPTION_REORDER_CONFLICT/);
  assert.match(maintenanceService, /Option_Order/);
  const batchStart = maintenanceLive.indexOf('if (input.action === KSP_MASTER_MUTATION.REORDER_BATCH)');
  const batchEnd = maintenanceLive.indexOf('var matches =', batchStart);
  assert.ok(batchStart >= 0 && batchEnd > batchStart, 'live adapter has a REORDER_BATCH branch');
  const batchBranch = maintenanceLive.slice(batchStart, batchEnd);
  assert.equal((batchBranch.match(/\.setValues\(/g) || []).length, 1);
  assert.doesNotMatch(batchBranch, /kspMaintenanceWriteSheetRow_/);
});

test('production reorder planner is fail-closed for stale expected order and preserves unrelated types', () => {
  const context = vm.createContext({
    Object, Array, String, Number, Boolean, Math, RegExp, Set, JSON,
    kspAssert_(condition, code, message) {
      if (!condition) throw Object.assign(new Error(message), { code });
    },
    kspDeepClone_(value) { return JSON.parse(JSON.stringify(value)); },
    kspToBoolean_(value) { return value === true || String(value).toLowerCase() === 'true'; },
    kspCounterpartyTypeDefinition_() { return {}; }
  });
  vm.runInContext(maintenanceCore, context, { filename: '100_MaintenanceCore.gs' });
  const rows = [
    { Option_ID: 'AC-1', Type: 'ASSET_CLASS', Name: 'A', Sort_Order: 1 },
    { Option_ID: 'AC-2', Type: 'ASSET_CLASS', Name: 'B', Sort_Order: 2 },
    { Option_ID: 'TEAM-1', Type: 'TEAM', Name: 'T', Sort_Order: 1 }
  ];
  assert.throws(() => context.kspBuildOptionBatchReorderPlan_(rows, {
    type: 'ASSET_CLASS', expectedOrderIds: ['AC-2', 'AC-1'], orderedIds: ['AC-1', 'AC-2']
  }, 'actor', '2026-09-21T00:00:00.000Z'), error => error.code === 'OPTION_REORDER_CONFLICT');
  const plan = context.kspBuildOptionBatchReorderPlan_(rows, {
    type: 'ASSET_CLASS', expectedOrderIds: ['AC-1', 'AC-2'], orderedIds: ['AC-2', 'AC-1']
  }, 'actor', '2026-09-21T00:00:00.000Z');
  assert.deepEqual(Array.from(plan.affectedRows, row => row.Option_ID), ['AC-2', 'AC-1']);
  assert.equal(plan.rows.find(row => row.Option_ID === 'TEAM-1').Sort_Order, 1);
});

test('batch reorder service writes once, returns canonical order, and emits one order audit', () => {
  const environment = createFakeEnvironment();
  const result = ksp.kspMutateMaster_(environment, {
    entity: 'OPTION', action: 'REORDER_BATCH', type: 'ASSET_CLASS',
    expectedOrderIds: ['OPT-AC-001', 'OPT-AC-002'],
    orderedIds: ['OPT-AC-002', 'OPT-AC-001']
  });
  assert.equal(result.ok, true, JSON.stringify(result));
  assert.deepEqual(environment._debug.masterBatchWrites, ['ASSET_CLASS']);
  assert.deepEqual(environment._debug.optionRows.filter(row => row.Type === 'ASSET_CLASS')
    .sort((left, right) => left.Sort_Order - right.Sort_Order).map(row => row.Option_ID), ['OPT-AC-002', 'OPT-AC-001']);
  assert.equal(environment._debug.audits.length, 1);
  assert.equal(environment._debug.audits[0].Action, 'OPTION_REORDER');
  assert.equal(environment._debug.audits[0].Changed_Fields, 'Option_Order');
});

test('stale batch reorder fails before any option write', () => {
  const environment = createFakeEnvironment();
  const before = JSON.stringify(environment._debug.optionRows);
  const result = ksp.kspMutateMaster_(environment, {
    entity: 'OPTION', action: 'REORDER_BATCH', type: 'ASSET_CLASS',
    expectedOrderIds: ['OPT-AC-002', 'OPT-AC-001'],
    orderedIds: ['OPT-AC-001', 'OPT-AC-002']
  });
  assert.equal(result.ok, false);
  assert.equal(result.error.code, 'OPTION_REORDER_CONFLICT');
  assert.equal(JSON.stringify(environment._debug.optionRows), before);
  assert.deepEqual(environment._debug.masterBatchWrites, []);
});
