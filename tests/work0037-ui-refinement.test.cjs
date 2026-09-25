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
const knowledgeClient = read('ClientKnowledgeSearch.html');
const analytics = read('ActivityAnalyticsPage.html');
const dates = read('ClientDateControls.html');
const bootstrap = read('ClientBootstrap.html');
const maintenance = read('ClientMaintenance.html');
const adminPage = read('AiProviderSettingsPage.html');
const adminClient = read('ClientAiProviderSettings.html');
const styles = read('Styles.html');

test('Past Meetings uses Japanese period labels, compact rows, and fixed hidden Active defaults', () => {
  assert.match(pages, /meeting-past-period-label">対象期間/);
  assert.match(pages, /for="meeting-past-dateFrom">開始日/);
  assert.match(pages, /for="meeting-past-dateTo">終了日/);
  assert.match(pages, /id="meeting-past-fundStrategy" type="hidden" value=""/);
  assert.match(pages, /id="meeting-past-filterStatus" type="hidden" value="Active"/);
  assert.match(maintenance, /meetingPast\?'':\(el\(prefix\+'-fundStrategy'\)/);
  assert.match(maintenance, /status:meetingPast\?'Active'/);
  assert.match(maintenance, /function clearMeetingPastFilters\(\)/);
  assert.match(maintenance, /el\('meeting-past-filterStatus'\)\.value='Active'/);
  assert.match(styles, /meeting-past-date-from-field\{grid-column:1\/span 2;grid-row:2\}/);
  assert.match(styles, /meeting-past-counterparty-field\{grid-column:1\/span 4;grid-row:3\}/);
});

test('Knowledge Search keeps detailed filters visible in the four frozen rows and defaults to summary', () => {
  assert.doesNotMatch(knowledge, /<details|<summary>詳細条件/);
  assert.match(knowledge, /knowledge-period-row/);
  assert.match(knowledge, /knowledge-filter-row/);
  assert.match(knowledge, /<option value="要約" selected>/);
  assert.match(knowledge, /knowledge-full-output-field[\s\S]*id="knowledge-full-output"/);
  assert.match(knowledge, /id="knowledge-instruction-label"[^>]*>質問・追加指示/);
  assert.match(knowledge, /id="knowledge-submit"[^>]*>AI検索を実行/);
  assert.match(knowledge, /id="knowledge-clear"[^>]*>条件クリア/);
  for (const id of ['knowledge-fundStrategy', 'knowledge-followUp', 'knowledge-meetingTypeCode', 'knowledge-capitalTypeId']) {
    assert.match(knowledge, new RegExp(`<select id="${id}">`));
  }
  assert.doesNotMatch(knowledge, /class="field knowledge-(?:fund|follow-up|meeting-type)-field"/);
  assert.match(knowledgeClient, /kEl\('knowledge-mode'\)\.value='要約'/);
  assert.match(knowledgeClient, /label\.textContent='質問・追加指示'/);
  assert.match(knowledgeClient, /fundStrategy:kEl\('knowledge-fundStrategy'\)\.value/);
});

test('Activity Analytics defaults to a leap-safe one calendar year and keeps user edits', () => {
  assert.match(analytics, /for="activity-period">期間粒度/);
  assert.ok(analytics.indexOf('選択した内訳') < analytics.indexOf('集計サマリー'));
  assert.ok(analytics.indexOf('集計サマリー') < analytics.indexOf('該当する面談記録'));
  assert.match(bootstrap, /kspSetOneYearDateRange\('activity-date-from','activity-date-to'\)/);
  const context = vm.createContext({ Intl, Date, Object, Number, String, document: { getElementById() { return null; } } });
  vm.runInContext(dates.match(/<script>([\s\S]*?)<\/script>/)[1], context);
  const leap = JSON.parse(JSON.stringify(context.kspOneYearDateRange(new Date('2024-02-29T03:00:00Z'))));
  assert.deepEqual(leap, { from: '2023-02-28', to: '2024-02-29' });
  const nodes = { from: { value: '2025-01-15' }, to: { value: '2026-01-20' } };
  context.document.getElementById = id => id === 'from' ? nodes.from : nodes.to;
  context.kspSetOneYearDateRange('from', 'to', new Date('2026-09-19T03:00:00Z'));
  assert.deepEqual(nodes, { from: { value: '2025-01-15' }, to: { value: '2026-01-20' } });
});

test('Masters exposes four in-page tabs and snapshots only allowlisted option mutations', () => {
  const tabs = Array.from(pages.matchAll(/data-master-tab="([A-Z_]+)"/g), match => match[1]);
  assert.deepEqual(tabs, ['COUNTERPARTY', 'ASSET_CLASS', 'LOCATION', 'TEAM']);
  assert.doesNotMatch(pages, /id="option-add-type"|value="CAPITAL_TYPE"/);
  assert.match(maintenance, /MASTER_OPTION_TAB_TYPES=Object\.freeze\(\['ASSET_CLASS','LOCATION','TEAM'\]\)/);
  assert.match(maintenance, /masterOptionDrafts=\{ASSET_CLASS:'',LOCATION:'',TEAM:''\}/);
  assert.match(maintenance, /type:request\.type,name:request\.name/);
  assert.match(maintenance, /renderMasterOptionRows\(masterDisplayedOptionRows\(masters,activeMasterTab\)\)/);
  assert.match(maintenance, /let activeMasterTab='COUNTERPARTY'/);
  assert.match(styles, /\.master-layout\{display:block\}/);
});

test('Admin has no shared password gate while provider controls remain', () => {
  assert.doesNotMatch(adminPage + adminClient, /shared-admin|共有管理者パスワード|adminSessionToken|管理者モードを開始|管理者モードを終了/);
  assert.match(adminPage, /id="ai-provider-openai-enable"/);
  assert.match(adminPage, /id="ai-provider-gemini-connect"/);
  assert.match(adminClient, /canMutate/);
  assert.doesNotMatch(read('165_AiProviderAdmin.gs'), /KSP_SHARED_ADMIN_PASSWORD_SALT/);
});

test('Meeting Create keeps its field grid while primary action precedes dynamic attachment content', () => {
  assert.match(styles, /meeting-field-types\{grid-column:10\/span 3;grid-row:1/);
  assert.match(styles, /meeting-field-internal-participants\{grid-column:1\/span 7;grid-row:4/);
  assert.match(styles, /\.ksp-stable-action \.action\.primary\{[^}]*width:180px/);
  assert.ok(index.indexOf('id="meeting-submit"') < index.indexOf('id="meeting-internalParticipants"'));
  assert.match(index, /attachment-workspace[\s\S]*attachment-drop-column/);
  assert.match(index, /id="meeting-file-actions"[\s\S]*pitchbook-clear[\s\S]*pitchbook-retry/);
  assert.match(styles, /attachment-workspace\{display:block/);
  assert.match(styles, /@media\(max-width:720px\)[\s\S]*attachment-action-column\{[^}]*grid-template-columns:1fr 1fr/);
});

test('responsive contract keeps desktop 12-column placement and mobile-only stacking', () => {
  assert.match(styles, /#meeting-form>\.grid\{grid-template-columns:repeat\(12,minmax\(0,1fr\)\)/);
  assert.match(knowledge, /grid-template-columns:repeat\(12,minmax\(0,1fr\)\)/);
  assert.match(styles, /@media\(max-width:720px\)/);
  assert.doesNotMatch(styles, /@media\(max-width:(?:1280|1440|2000)px\)[^{]*\{[^}]*meeting-field-types/);
});
