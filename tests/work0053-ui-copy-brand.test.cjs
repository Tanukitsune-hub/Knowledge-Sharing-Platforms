const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const source = name => fs.readFileSync(path.join(root, 'src', name), 'utf8');

test('the accepted brand appears in the main and standalone titles without a subtitle', () => {
  const main = source('Index.html');
  const standalone = source('KnowledgeSearch.html');
  const webApp = source('90_WebApp.gs');
  assert.match(main, /<title>Private Assets Intelligence<\/title>/);
  assert.match(main, /<div class="brand"><h1>Private Assets Intelligence<\/h1><\/div>/);
  assert.match(standalone, /<title>ナレッジ検索 \| Private Assets Intelligence<\/title>/);
  assert.match(webApp, /Private Assets Intelligence/);
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

test('brand migration preserves internal Drive resource names', () => {
  const core = source('00_Core.gs');
  assert.match(core, /KNOWLEDGE_ROOT: 'Private Assets Knowledge'/);
  assert.match(core, /Knowledge Platform Backend/);
  assert.match(core, /Knowledge Platform Audit/);
});
