const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const source = name => fs.readFileSync(path.join(root, 'src', name), 'utf8');

test('the current brand appears in the main and standalone titles without a subtitle', () => {
  const main = source('Index.html');
  const standalone = source('KnowledgeSearch.html');
  const webApp = source('90_WebApp.gs');
  assert.match(main, /<title>Alternative Assets Intelligence<\/title>/);
  assert.match(main, /<div class="brand"><h1>Alternative Assets Intelligence<\/h1><\/div>/);
  assert.match(standalone, /<title>ナレッジ検索 \| Alternative Assets Intelligence<\/title>/);
  assert.match(webApp, /Alternative Assets Intelligence/);
  assert.doesNotMatch(main + standalone, /Knowledge Share|Knowledge Sharing Platforms|PRIVATE ASSETS KNOWLEDGE/);
});

test('public copy uses the agreed terms and hides internal error vocabulary', () => {
  const pages = ['Index.html', 'KnowledgeSearchPage.html', 'EntityWorkspacePage.html',
    'ActivityAnalyticsPage.html', 'RelationshipExplorerPage.html', 'MaintenancePages.html',
    'AiProviderSettingsPage.html'].map(source).join('\n');
  const publicErrors = source('00_Core.gs').split('function kspSafePublicErrorMessage_')[0];
  const glossary = fs.readFileSync(path.join(root, 'docs/design/work0053-ui-copy-glossary.md'), 'utf8');
  for (const term of ['面談記録', '保存資料', '面談先', 'アセットクラス', 'チーム',
    '面談場所', '最後の面談日', '削除済み', '復元', '既定の配色', '接続確認', '同期']) {
    assert.ok(glossary.includes(term), term);
  }
  for (const term of ['Meeting ID', 'Document ID', 'Fund / Strategy', 'Status']) {
    assert.ok(pages.includes(term), term);
  }
  assert.doesNotMatch(pages + publicErrors, /権威ある|authoritative|materialize|fail closed|stale source|provider response/i);
});

test('source-root naming changes preserve internal Backend and Audit resource names', () => {
  const core = source('00_Core.gs');
  assert.match(core, /KNOWLEDGE_ROOT: '記録・資料'/);
  assert.match(core, /Knowledge Platform Backend/);
  assert.match(core, /Knowledge Platform Audit/);
});

test('the top-level 管理者ページ label and its three tabs remain', () => {
  const main = source('Index.html');
  const admin = source('AiProviderSettingsPage.html');
  const nav = main.match(/<button id="nav-ai-provider-settings"[\s\S]*?<\/button>/);
  assert.ok(nav);
  assert.equal(nav[0].replace(/<[^>]+>/g, '').trim(), '管理者ページ');
  assert.match(admin, /<h2>管理者ページ<\/h2>/);
  assert.deepEqual((admin.match(/id="admin-tab-(?:provider|deleted|theme)"/g) || []).sort(),
    ['id="admin-tab-deleted"', 'id="admin-tab-provider"', 'id="admin-tab-theme"']);
  assert.doesNotMatch(source('ClientAiProviderSettings.html'), /管理者として設定を変更できます/);
});

test('naturalized prompts preserve the investment and source-use boundaries', () => {
  assert.match(source('152_KnowledgeFilterContracts.gs'), /投資判断を自動生成しないでください。/);
  assert.match(source('155_KnowledgeExportContracts.gs'), /別途添付した原本を、許可された資料検索で参照してください。/);
});
