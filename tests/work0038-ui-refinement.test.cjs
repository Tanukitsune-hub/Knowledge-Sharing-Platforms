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

test('Knowledge Search row three uses the frozen AI controls order and placement', () => {
  assert.match(knowledge, /<label for="knowledge-mode">AI検索モード<\/label>/);
  const row = knowledge.slice(knowledge.indexOf('<div class="knowledge-mode-row">'), knowledge.indexOf('</div>\n      <div hidden>'));
  const mode = row.indexOf('id="knowledge-mode"');
  const model = row.indexOf('id="knowledge-model-controls"');
  const fullOutput = row.indexOf('id="knowledge-full-output"');
  assert.ok(mode >= 0 && mode < model && model < fullOutput, 'mode -> model -> non-AI output source order');
  assert.match(knowledge, /\.knowledge-mode-field\{grid-column:1\/span 3\}/);
  assert.match(knowledge, /\.knowledge-model-field\{grid-column:4\/span 3\}/);
  assert.match(knowledge, /\.knowledge-full-output-field\{grid-column:8\/span 2\}/);
  assert.match(knowledge, /@media\(max-width:720px\)[\s\S]*\.knowledge-mode-row>\.field\{grid-column:1\}/);
});

test('non-AI Full Output remains provider independent', () => {
  assert.match(knowledge, /<span class="field-label">非AI出力<\/span>/);
  assert.match(knowledge, /id="knowledge-full-output"[^>]*>全文出力<\/button>/);
  assert.match(knowledgeClient, /previewKnowledgeExport/);
  assert.doesNotMatch(knowledgeClient, /knowledge-full-output[^\n]*(?:startKnowledgeSearch|runAiKnowledgeSearch)/);
});

test('Meeting Create uses frozen left registration and right attachment geometry', () => {
  assert.match(styles, /meeting-field-counterparty-person\{grid-column:1\/span 6;grid-row:3\}/);
  assert.match(styles, /meeting-field-internal-participants\{grid-column:1\/span 6;grid-row:4\}/);
  assert.match(styles, /meeting-field-submit\{grid-column:1\/span 3;grid-row:5/);
  assert.match(styles, /#attachment-section\{grid-column:7\/span 6;grid-row:3\/span 3/);
  assert.match(styles, /meeting-field-notes\{grid-column:1\/span 12;grid-row:6\}/);
  assert.match(styles, /attachment-workspace\{display:grid;grid-template-columns:minmax\(0,7fr\) minmax\(150px,3fr\)/);
});

test('Meeting attachment actions keep clear and retry behavior with the frozen label', () => {
  assert.match(index, /id="pitchbook-clear"[^>]*>資料選択をクリア<\/button>/);
  assert.match(index, /attachment-workspace[\s\S]*attachment-drop-column[\s\S]*attachment-action-column[\s\S]*pitchbook-clear[\s\S]*pitchbook-retry/);
  const pitchbookClient = read('ClientPitchbookFiles.html') + read('ClientPitchbookFlow.html');
  assert.match(pitchbookClient, /pitchbook-clear/);
  assert.match(pitchbookClient, /pitchbook-retry/);
});

test('Meeting mobile source and CSS order safely stack participants, registration, attachment, and notes', () => {
  const tokens = ['id="meeting-counterparty"', 'id="meeting-internalParticipants"', 'id="meeting-submit"', 'id="attachment-section"', 'id="meeting-notes"'];
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
  assert.match(mobile, /attachment-workspace\{grid-template-columns:1fr\}/);
});
