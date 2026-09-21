const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const read = relative => fs.readFileSync(path.join(root, relative), 'utf8');

const index = read('src/Index.html');
const styles = read('src/Styles.html');
const maintenancePage = read('src/MaintenancePages.html');
const maintenanceClient = read('src/ClientMaintenance.html');
const adminPage = read('src/AiProviderSettingsPage.html');
const adminClient = read('src/ClientAiProviderSettings.html');
const report = read('docs/handoffs/0042-CODEX-01-right-pane-design-unification-report.md');

test('right-pane component system preserves Work0042 structure under the superseding Work0043 palette', () => {
  const work42 = styles.slice(styles.indexOf('/* Work 0042 right-pane system.'));
  for (const token of ['--rp-page:#eaf0f5', '--rp-surface:#f9fbfc', '--rp-header:#dce7f0', '--rp-border:#c3d0da', '--rp-blue:#315f7e', '--rp-blue-dark:#23485f']) {
    assert.ok(work42.includes(token), token);
  }
  for (const primitive of ['.page .card', '.data-table th', '.status.success', '.status.warning', '.status.error', '.record-body', '.knowledge-export-preview-body', '.modal-backdrop']) {
    assert.ok(work42.includes(primitive), primitive);
  }
  assert.doesNotMatch(work42, /\.nav(?:\s|\{|\.|:)/);
  assert.doesNotMatch(work42, /\.page-header(?:\s|\{|\.|:)/);
  assert.doesNotMatch(work42, /\.sidebar-motif(?:\s|\{|\.|:)/);
  assert.match(index, /id="nav-masters"[\s\S]*?>[\s\S]*?マスター管理<\/button>/);
  assert.doesNotMatch(index, /プルダウンの管理/);
});

test('normal user-facing terminology is converged while internal identifiers remain intact', () => {
  const visibleSources = [
    index,
    read('src/KnowledgeSearchPage.html'),
    maintenancePage,
    read('src/ActivityAnalyticsPage.html'),
    read('src/EntityWorkspacePage.html'),
    adminPage,
    read('src/ClientKnowledgeSearch.html'),
    read('src/ClientMaintenanceEnhancements.html'),
    read('src/ClientEntityWorkspace.html'),
    read('src/ClientRelationshipExplorer.html')
  ].join('\n');
  assert.doesNotMatch(visibleSources, />\s*Team\s*</);
  assert.doesNotMatch(visibleSources, />\s*Asset Class\s*</);
  assert.doesNotMatch(visibleSources, />\s*Meeting Type\s*</);
  assert.doesNotMatch(visibleSources, /Teamは「面談記録のみ」/);
  assert.match(visibleSources, /チーム/);
  assert.match(visibleSources, /アセットクラス/);
  assert.match(visibleSources, /MTG種別/);
  assert.match(maintenanceClient, /ASSET_CLASS/);
  assert.match(maintenanceClient, /TEAM/);
});

test('master option ordering uses a drag handle and existing one-item reorder facade without numeric UI', () => {
  assert.match(maintenancePage, /class="master-drag-column"/);
  assert.match(maintenanceClient, /class="master-drag-handle"[^>]*draggable="true"/);
  assert.match(maintenanceClient, /action:'REORDER',id:state\.id,sortOrder:targetIndex\+1/);
  assert.match(maintenanceClient, /並び順を保存中…/);
  assert.match(maintenanceClient, /applyMaintenanceMasterData\(snapshot\)/);
  assert.match(maintenanceClient, /変更前の並び順へ戻しました。/);
  assert.doesNotMatch(maintenanceClient, /data-master-reorder/);
  assert.doesNotMatch(maintenanceClient, /新しいSort Order/);
  assert.doesNotMatch(maintenancePage, /<th>順序<\/th>/);

  const start = maintenanceClient.indexOf('function masterOptionRows');
  const end = maintenanceClient.indexOf('function clearMasterDropIndicators');
  const context = {};
  vm.createContext(context);
  vm.runInContext(maintenanceClient.slice(start, end), context);
  assert.equal(context.masterDropIndex(0, 2, true, 3), 2);
  assert.equal(context.masterDropIndex(2, 0, false, 3), 0);
  const masters = {
    counterparties: [{ id: 'CP-1' }],
    options: [
      { id: 'A', type: 'ASSET_CLASS', sortOrder: 1, status: 'Active' },
      { id: 'L', type: 'LOCATION', sortOrder: 1, status: 'Active' },
      { id: 'B', type: 'ASSET_CLASS', sortOrder: 2, status: 'Inactive' },
      { id: 'C', type: 'ASSET_CLASS', sortOrder: 3, status: 'Active' }
    ]
  };
  const moved = context.masterOptimisticMasters(masters, 'ASSET_CLASS', 'C', 0);
  assert.deepEqual(Array.from(context.masterOptionRows(moved, 'ASSET_CLASS'), row => row.id), ['C', 'A', 'B']);
  assert.deepEqual(Array.from(context.masterOptionRows(moved, 'ASSET_CLASS'), row => row.sortOrder), [1, 2, 3]);
  assert.equal(moved.options.find(row => row.id === 'B').status, 'Inactive');
  assert.equal(masters.options.find(row => row.id === 'C').sortOrder, 3);
});

test('failed master reorder restores the pre-drag authoritative snapshot and releases the busy state', async () => {
  const optionRows = maintenanceClient.slice(maintenanceClient.indexOf('function masterOptionRows'), maintenanceClient.indexOf('function renderMasterOptionRows'));
  const ordering = maintenanceClient.slice(maintenanceClient.indexOf('function masterDropIndex'), maintenanceClient.indexOf('function clearMasterDropIndicators'));
  const reorder = maintenanceClient.slice(maintenanceClient.indexOf('async function performMasterReorder'), maintenanceClient.indexOf('function optionsFromMasters'));
  const snapshot = { counterparties: [], options: [
    { id: 'A', type: 'TEAM', sortOrder: 1, status: 'Active' },
    { id: 'B', type: 'TEAM', sortOrder: 2, status: 'Active' }
  ] };
  const statuses = [];
  const context = {
    masterReorderBusy: false,
    maintenanceBootstrap: { masters: snapshot },
    renderMasters() {},
    showStatus(id, kind, message) { statuses.push({ id, kind, message }); },
    serverCall: async () => { throw new Error('synthetic failure'); },
    applyMaintenanceMasterData(masters) { context.maintenanceBootstrap.masters = masters; }
  };
  vm.createContext(context);
  vm.runInContext(optionRows + ordering + reorder, context);
  await context.performMasterReorder({ masters: snapshot, type: 'TEAM', id: 'A', sourceIndex: 0, targetIndex: 1 });
  assert.equal(context.maintenanceBootstrap.masters, snapshot);
  assert.equal(context.masterReorderBusy, false);
  assert.equal(statuses.at(-1).kind, 'error');
  assert.match(statuses.at(-1).message, /変更前の並び順へ戻しました。/);
});

test('admin page defaults to the provider tab and supplies accessible state-preserving client-side switching', () => {
  assert.match(adminPage, /role="tablist"/);
  assert.match(adminPage, /id="admin-tab-provider"[\s\S]*?aria-selected="true"[\s\S]*?>AIプロバイダ設定<\/button>/);
  assert.match(adminPage, /id="admin-tab-deleted"[\s\S]*?aria-selected="false"[\s\S]*?>削除記録の管理<\/button>/);
  assert.match(adminPage, /id="admin-panel-deleted"[^>]*role="tabpanel"[^>]*hidden/);
  assert.match(adminPage, /id="admin-panel-provider"[^>]*role="tabpanel"/);
  assert.match(adminClient, /let activeAdminTab='provider'/);
  assert.match(adminClient, /\['ArrowLeft','ArrowRight','Home','End'\]/);
  assert.match(adminClient, /\.hidden=tab!=='provider'/);
  assert.match(adminClient, /\.hidden=tab!=='deleted'/);
  assert.doesNotMatch(adminClient, /activeAdminTab='provider'[\s\S]*nav-ai-provider-settings[\s\S]*selectAdminTab\('provider'/);
});

test('reachable-state inventory covers every required dynamic family and classifies hidden compatibility surfaces', () => {
  for (const surface of [
    'pending / recheck / retry status',
    'answer / evidence / citations',
    'full-output preview / hard-stop / prompt preview / artifact result',
    'Meeting detail / body / related materials',
    'Meeting editor / save busy / success / error',
    'material picker modal / loading / empty / linking / error',
    'material classification editor',
    'Fund drill-down / detail',
    'headline / chart / breakdown / Meeting drill / monthly checkbox busy',
    'option drag / insertion / saving / authoritative refresh / rollback',
    'deleted records filter / empty / loading / restore / error',
    'info / success / warning / error / disabled / busy'
  ]) assert.ok(report.includes(surface), surface);
  assert.match(report, /Compatibility[^\n]*hidden \/ no normal nav[^\n]*intentionally excludes them/);
  assert.match(report, /Operator[\s\S]*security\/operator surface remains isolated/);
});
