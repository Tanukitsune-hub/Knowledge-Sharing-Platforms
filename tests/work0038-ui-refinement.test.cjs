const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = name => fs.readFileSync(path.join(root, 'src', name), 'utf8');
const index = read('Index.html');
const knowledge = read('KnowledgeSearchPage.html');
const knowledgeClient = read('ClientKnowledgeSearch.html');
const styles = read('Styles.html');
const bootstrap = read('ClientBootstrap.html');
const pitchbookFlow = read('ClientPitchbookFlow.html');

test('Meeting Create header keeps heading, draft clear, and one compact status in semantic order', () => {
  const headerStart = index.indexOf('<div id="meeting-entry-actions" class="meeting-entry-header">');
  const headerEnd = index.indexOf('</div>', headerStart) + '</div>'.length;
  const header = index.slice(headerStart, headerEnd);
  const heading = header.indexOf('<h2>記録を追加</h2>');
  const clear = header.indexOf('id="meeting-clear"');
  const status = header.indexOf('id="meeting-status"');
  assert.ok(headerStart >= 0 && heading >= 0 && heading < clear && clear < status, 'heading -> clear -> status');
  assert.ok(headerEnd < index.indexOf('id="meeting-form"'), 'header must precede form');
  assert.equal((index.match(/id="meeting-status"/g) || []).length, 1);
  assert.doesNotMatch(index, /meeting-entry-hint|下書きや入力内容を消去して、新しい記録を開始できます。/);
  assert.doesNotMatch(index, /成功後も日付・Asset Class・Fund \/ Strategyは保持されます。/);
  assert.match(styles, /\.meeting-entry-header\{[^}]*display:flex[^}]*flex-wrap:wrap/);
  assert.match(styles, /\.meeting-entry-header \.status\{[^}]*width:auto[^}]*margin:0/);
  assert.match(styles, /@media\(max-width:720px\)[\s\S]*\.meeting-entry-header\{[^}]*align-items:flex-start/);
  assert.match(bootstrap, /showStatus\('meeting-status','info','面談入力の準備ができました。'\)/);
  assert.equal((bootstrap.match(/面談入力の準備ができました。/g) || []).length, 1);
  assert.match(bootstrap, /showStatus\('meeting-status','error',result&&result\.error\?result\.error\.message:'初期データを読み込めませんでした。'\)/);
  assert.match(bootstrap, /withFailureHandler\(error=>\{meetingLoading=false;setMeetingBusy\(false\);showStatus\('meeting-status','error'/);
  assert.match(index, /showStatus\('meeting-status','error','日付、面談先、Asset Classは必須です。'\)/);
  assert.match(index, /showStatus\('meeting-status','success','記録を保存しました:/);
  assert.doesNotMatch(pitchbookFlow, /meeting-entry-hint/);
  assert.match(pitchbookFlow, /showStatus\('meeting-status','info','前回保存済みの記録を表示しています。/);
});

test('Knowledge Search row three uses the frozen AI controls order and placement', () => {
  assert.match(knowledge, /<label for="knowledge-mode">AI検索モード<\/label>/);
  const row = knowledge.slice(knowledge.indexOf('<div class="knowledge-mode-row">'), knowledge.indexOf('</div>\n      <div hidden>'));
  const mode = row.indexOf('id="knowledge-mode"');
  const model = row.indexOf('id="knowledge-model-controls"');
  const fullOutput = row.indexOf('id="knowledge-full-output"');
  assert.ok(mode >= 0 && mode < model && model < fullOutput, 'mode -> model -> non-AI output source order');
  assert.match(knowledge, /\.knowledge-mode-field\{grid-column:1\/span 3\}/);
  assert.match(knowledge, /\.knowledge-model-field\{grid-column:4\/span 3\}/);
  assert.match(knowledge, /\.knowledge-full-output-field\{grid-column:7\/span 2\}/);
  assert.match(knowledge, /\.knowledge-asset-field\{grid-column:7\/span 2\}/);
  assert.match(knowledge, /@media\(max-width:720px\)[\s\S]*\.knowledge-mode-row>\.field\{grid-column:1\}/);
});

test('Knowledge Search renders dynamic mode help and Team source help in one inline container', () => {
  const line = knowledge.match(/<div id="knowledge-help-line" class="hint knowledge-help-line">[\s\S]*?<\/div>/)?.[0] || '';
  const modeHelp = line.indexOf('id="knowledge-mode-help"');
  const sourceHelp = line.indexOf('id="knowledge-source-help"');
  assert.ok(modeHelp >= 0 && modeHelp < sourceHelp, 'mode help -> source help');
  assert.match(line, /<span id="knowledge-mode-help">/);
  assert.match(line, /<span id="knowledge-source-help">Teamは「面談記録のみ」で利用できます。<\/span>/);
  assert.doesNotMatch(line, /<br\b|<p\b/);
  assert.equal((knowledge.match(/Teamは「面談記録のみ」で利用できます。/g) || []).length, 1);
  assert.match(knowledgeClient, /'表示された質問は読み取り専用です。選択した条件の資料を横断して整理します。'/);
});

test('non-AI Full Output remains provider independent', () => {
  assert.match(knowledge, /<span class="field-label">非AI出力<\/span>/);
  assert.match(knowledge, /id="knowledge-full-output"[^>]*>全文出力<\/button>/);
  assert.match(knowledgeClient, /previewKnowledgeExport/);
  assert.doesNotMatch(knowledgeClient, /knowledge-full-output[^\n]*(?:startKnowledgeSearch|runAiKnowledgeSearch)/);
});

test('Meeting Create uses frozen left registration and right attachment geometry', () => {
  assert.match(styles, /meeting-field-counterparty-person\{grid-column:1\/span 7;grid-row:3\}/);
  assert.match(styles, /meeting-field-internal-participants\{grid-column:1\/span 7;grid-row:4\}/);
  assert.match(styles, /meeting-field-submit\{grid-column:1\/span 3;grid-row:5/);
  assert.match(styles, /#attachment-section\{grid-column:8\/span 5;grid-row:3\/span 2/);
  assert.match(styles, /meeting-field-attachment-actions\{grid-column:8\/span 5;grid-row:5/);
  assert.match(styles, /meeting-field-notes\{grid-column:1\/span 12;grid-row:6\}/);
  assert.match(styles, /attachment-workspace\{display:block/);
  assert.match(styles, /attachment-drop-column \.drop-zone\{[^}]*min-height:10[0-9]px/);
  assert.doesNotMatch(styles, /attachment-drop-column \.drop-zone\{[^}]*min-height:(?:11[8-9]|1[2-9][0-9]|[2-9][0-9]{2,})px/);
});

test('Meeting attachment actions keep clear and retry behavior with the frozen label', () => {
  assert.match(index, /id="pitchbook-clear"[^>]*>資料選択をクリア<\/button>/);
  assert.match(index, /id="meeting-file-actions-home" class="meeting-field-attachment-actions"/);
  assert.match(index, /id="meeting-file-panel"[\s\S]*attachment-workspace[\s\S]*attachment-drop-column[\s\S]*<\/section>[\s\S]*id="meeting-file-actions"[\s\S]*pitchbook-clear[\s\S]*pitchbook-retry/);
  const panelStart = index.indexOf('<section id="meeting-file-panel"');
  const panel = index.slice(panelStart, index.indexOf('</section>', panelStart) + '</section>'.length);
  assert.doesNotMatch(panel, /attachment-action-column/);
  assert.doesNotMatch(index, /記録保存 → ファイル保存 → 関連付けの順に処理します。/);
  const pitchbookClient = read('ClientPitchbookFiles.html') + read('ClientPitchbookFlow.html');
  const bootstrap = read('ClientBootstrap.html');
  const maintenance = read('ClientMaintenanceEnhancements.html');
  assert.match(pitchbookClient, /pitchbook-clear/);
  assert.match(pitchbookClient, /pitchbook-retry/);
  assert.match(bootstrap, /meeting-file-actions-home'\)\.appendChild\(el\('meeting-file-actions'\)\)/);
  assert.match(maintenance, /meeting-detail-file-home'\)\.appendChild\(el\('meeting-file-actions'\)\)/);
  assert.match(pitchbookClient, /!el\('meeting-file-panel'\)\.contains\(node\)&&!el\('meeting-file-actions'\)\.contains\(node\)/);
});

test('Meeting mobile source and CSS order safely stack participants, registration, attachment, and notes', () => {
  const tokens = ['id="meeting-counterparty"', 'id="meeting-internalParticipants"', 'id="meeting-submit"', 'id="attachment-section"', 'id="meeting-file-actions-home"', 'id="meeting-notes"'];
  let previous = -1;
  for (const token of tokens) {
    const next = index.indexOf(token);
    assert.ok(next > previous, token);
    previous = next;
  }
  const mobile = styles.slice(styles.lastIndexOf('@media(max-width:720px)'));
  for (const selector of ['meeting-field-counterparty-person', 'meeting-field-internal-participants', 'meeting-field-submit', 'meeting-field-notes']) {
    assert.ok(mobile.includes(`#meeting-form>.grid>.${selector}`), selector);
  }
  assert.ok(mobile.includes('#meeting-form>.grid>#attachment-section'));
  assert.ok(mobile.includes('#meeting-form>.grid>.meeting-field-attachment-actions'));
  assert.match(mobile, /attachment-action-column\{[^}]*grid-template-columns:1fr 1fr/);
});
