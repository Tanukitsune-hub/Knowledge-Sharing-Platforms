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

test('right-pane component system preserves Work0042 structure under the superseding Work0044 palette', () => {
const work42 = styles.slice(
  styles.indexOf('/* Work 0042 right-pane system.'),
  styles.indexOf('/* Work 0045 shared runtime theme.')
);
  for (const token of ['--rp-page:#e7edf2', '--rp-surface:#f8fafb', '--rp-header:#cdd9e2', '--rp-border:#bbc9d3', '--rp-blue:#405f72', '--rp-blue-dark:#2f4b5d']) {
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

test('master option ordering uses a drag handle and staged complete-order batch save without numeric UI', () => {
  assert.match(maintenancePage, /class="master-drag-column"/);
  assert.match(maintenanceClient, /class="master-drag-handle"[^>]*draggable="true"/);
  assert.match(maintenanceClient, /action:'REORDER_BATCH'/);
  assert.match(maintenanceClient, /expectedOrderIds:draft\.baseIds\.slice\(\)/);
  assert.match(maintenanceClient, /orderedIds:draft\.orderedIds\.slice\(\)/);
  assert.match(maintenanceClient, /並び順を保存中…/);
  assert.match(maintenanceClient, /未保存の並び順を元に戻しました。/);
  assert.doesNotMatch(maintenanceClient, /data-master-reorder/);
  assert.doesNotMatch(maintenanceClient, /新しいSort Order/);
  assert.doesNotMatch(maintenancePage, /<th>順序<\/th>/);

  const start = maintenanceClient.indexOf('function masterDropIndex');
  const end = maintenanceClient.indexOf('function masterDraftMove');
  const context = { Math };
  vm.createContext(context);
  vm.runInContext(maintenanceClient.slice(start, end), context);
  assert.equal(context.masterDropIndex(0, 2, true, 3), 2);
  assert.equal(context.masterDropIndex(2, 0, false, 3), 0);
});

test('failed master batch save keeps the local draft dirty and releases the busy state', () => {
  assert.match(maintenanceClient, /catch\(error\)\{showStatus\('masters-status','error',error\.message\|\|String\(error\)\)\}/);
  assert.match(maintenanceClient, /finally\{masterReorderBusy=false;[\s\S]*?renderMasters/);
  assert.doesNotMatch(maintenanceClient, /applyMaintenanceMasterData\(snapshot\)/);
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
