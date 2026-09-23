const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const page = fs.readFileSync(path.join(root, 'src', 'MaintenancePages.html'), 'utf8');
const maintenance = fs.readFileSync(path.join(root, 'src', 'ClientMaintenance.html'), 'utf8');
const enhancements = fs.readFileSync(path.join(root, 'src', 'ClientMaintenanceEnhancements.html'), 'utf8');
const adminPage = fs.readFileSync(path.join(root, 'src', 'AiProviderSettingsPage.html'), 'utf8');
const adminClient = fs.readFileSync(path.join(root, 'src', 'ClientAiProviderSettings.html'), 'utf8');
const styles = fs.readFileSync(path.join(root, 'src', 'Styles.html'), 'utf8');

test('Past Meeting keeps detail, related materials, and disabled edit empty states visible', () => {
  assert.match(page, /id="meeting-detail-card" class="card"/);
  assert.match(page, /id="meeting-detail-empty"[\s\S]*上の一覧から「詳細」を選択すると、ここに記録内容が表示されます。/);
  assert.match(page, /id="meeting-detail-related-empty"[\s\S]*記録を選択すると、関連資料を確認・追加できます。/);
  assert.match(page, /id="meeting-edit-card" class="card maintenance-editor"/);
  assert.match(page, /id="meeting-edit-empty"[\s\S]*記録の詳細から「記録を編集」を選択すると編集できます。/);
  assert.match(page, /<fieldset id="meeting-edit-fieldset" disabled>/);
  assert.match(enhancements, /function resetMeetingDetailSelection\(/);
  assert.match(maintenance, /function setMeetingEditEnabled\(/);
});

test('Past Meeting async operations expose busy state and reject duplicate actions', () => {
  assert.match(maintenance, /meetingSearchBusy/);
  assert.match(maintenance, /showStatus\('meeting-past-status','info busy','検索中…'\)/);
  assert.match(maintenance, /showStatus\('meeting-edit-status','info busy','編集内容を読み込んでいます…'\)/);
  assert.match(maintenance, /showStatus\('meeting-edit-status','info busy','保存中…'\)/);
  assert.match(enhancements, /showStatus\('meeting-detail-status','info busy','記録を読み込んでいます…'\)/);
  assert.match(enhancements, /資料候補を読み込んでいます…/);
  assert.match(styles, /\.status\.busy::before/);
  assert.doesNotMatch(`${maintenance}\n${enhancements}\n${adminClient}`, /\b\d{1,3}%\b/);
});

test('normal Past Meeting uses table-cell action wrappers and delete-only wording', () => {
  const renderer = maintenance.match(/function renderMeetingResults\(records\)\{[\s\S]*?\nasync function openMeetingEdit/)[0];
  assert.match(renderer, /<td><div class="row-actions">[\s\S]*data-meeting-status/);
  assert.doesNotMatch(renderer, /<td class="row-actions">/);
  assert.match(renderer, />削除<\/button>/);
  assert.doesNotMatch(renderer, /data-meeting-status[\s\S]{0,300}>無効化<\/button>/);
  assert.match(maintenance, /この記録を削除します。記録本体は完全には削除されず、管理者ページから復元できます。/);
  assert.match(styles, /\.row-actions\{display:flex/);
});

test('admin deleted-record management defaults to Inactive and reuses optimistic status mutation', () => {
  assert.match(adminPage, /<h2>削除記録の管理<\/h2>/);
  assert.match(adminPage, /id="admin-deleted-status-filter"[\s\S]*value="Inactive" selected>削除済み/);
  assert.match(adminPage, /<th>日付<\/th><th>Meeting ID<\/th><th>面談先<\/th><th>アセットクラス<\/th><th>チーム<\/th><th>Status<\/th><th>更新番号<\/th><th>操作<\/th>/);
  assert.match(adminClient, /serverCall\('searchMeetingRecords',adminDeletedMeetingPayload\(\)\)/);
  assert.match(adminClient, /serverCall\('changeMeetingStatus',\{meetingId:record\.meetingId,expectedVersion:record\.version,targetStatus:'Active'\}\)/);
  assert.match(adminClient, />復元<\/button>/);
  assert.match(adminClient, /復元中…/);
  assert.doesNotMatch(page, /meeting-past-filterStatus[\s\S]{0,200}Inactive/);
});

test('Work 0040 hidden compatibility values and human-readable material picker remain intact', () => {
  assert.match(page, /id="meeting-edit-relatedPitchbookIds" multiple size="5" disabled/);
  assert.match(page, /id="meeting-edit-followUpRequired" type="checkbox"/);
  assert.match(page, /id="meeting-edit-followUpNote" maxlength="2000"/);
  assert.match(maintenance, /relatedPitchbookIds:selectedOptionValues\('meeting-edit-relatedPitchbookIds'\)/);
  assert.match(maintenance, /followUpRequired:el\('meeting-edit-followUpRequired'\)\.checked/);
  assert.match(enhancements, /searchPitchbookRecords/);
  assert.doesNotMatch(page, /meeting-detail-documentId|既存Document_ID/);
});
