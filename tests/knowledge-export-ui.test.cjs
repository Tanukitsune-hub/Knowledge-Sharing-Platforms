const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..', 'src');
const page = fs.readFileSync(path.join(root, 'KnowledgeSearch.html'), 'utf8');
const client = fs.readFileSync(path.join(root, 'ClientKnowledgeSearch.html'), 'utf8');

test('Knowledge Export UI is deterministic, keyboard-native, and Gemini-independent', () => {
  const script = client.match(/<script>([\s\S]*?)<\/script>/);
  assert.ok(script);
  new vm.Script(script[1], { filename: 'ClientKnowledgeSearch.js' });

  for (const token of [
    'knowledge-export-section',
    'knowledge-export-preview-button',
    'knowledge-export-docs',
    'knowledge-export-pdf',
    'knowledge-export-prompt',
    'knowledge-export-prompt-text',
    'knowledge-export-policy',
    'previewKnowledgeExport',
    'createKnowledgeExport',
    'getKnowledgeExportPrompt',
    'recordKnowledgeExportPromptCopy',
    'navigator.clipboard.writeText',
    'document.execCommand',
    'copyConfirmed:true',
    'KNOWLEDGE_EXPORT_PREVIEW_STALE',
    'exportRequestId',
    'kSafeKnowledgeDriveUrl',
    'characterCountDeferred',
    'sourceIdCount'
  ]) {
    assert.ok((page + '\n' + client).includes(token), token);
  }
  assert.match(page, /Gemini検索を実行せず/);
  assert.match(page, /所属組織の利用ルールと許可されたサービスに従ってください/);
  assert.match(client, /knowledgeState\.configured/);
  const exportBusyFunction = client.match(/function kSetExportBusy\([^}]+\}/)[0];
  assert.doesNotMatch(exportBusyFunction, /configured/);

  const ids = Array.from(page.matchAll(/\bid="([^"]+)"/g), (match) => match[1]);
  const exportIds = ids.filter((id) => id.startsWith('knowledge-export-'));
  assert.equal(new Set(exportIds).size, exportIds.length);
  for (const id of ['knowledge-export-preview-button', 'knowledge-export-docs', 'knowledge-export-pdf', 'knowledge-export-prompt']) {
    assert.match(page, new RegExp(`id="${id}"[^>]*type="button"`));
  }
  assert.match(page, /id="knowledge-export-docs"[^>]*disabled/);
  assert.match(page, /id="knowledge-export-pdf"[^>]*disabled/);
});

test('Knowledge Export UI does not assign unvalidated URLs to citation or artifact links', () => {
  assert.doesNotMatch(client, /link\.href=citation\.driveUrl/);
  assert.doesNotMatch(client, /link\.href=result\.artifact\.url/);
  assert.match(client, /const safeUrl=kSafeKnowledgeDriveUrl\(citation\.driveUrl\)/);
  assert.match(client, /const safeUrl=kSafeKnowledgeDriveUrl\(result\.artifact\.url\)/);
});
