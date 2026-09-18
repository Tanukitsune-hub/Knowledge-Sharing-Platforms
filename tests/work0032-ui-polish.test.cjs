const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const index = fs.readFileSync(path.join(root, 'src', 'Index.html'), 'utf8');
const maintenance = fs.readFileSync(path.join(root, 'src', 'MaintenancePages.html'), 'utf8');
const styles = fs.readFileSync(path.join(root, 'src', 'Styles.html'), 'utf8');

test('Meeting create hides optional backend controls without removing their contracts', () => {
  for (const id of ['meeting-relatedPitchbookIds', 'meeting-followUpRequired', 'meeting-followUpNote']) {
    assert.equal((index.match(new RegExp('id="' + id + '"', 'g')) || []).length, 1, id);
  }
  assert.match(index, /meeting-field-backend-only" hidden aria-hidden="true"[^>]*>[\s\S]*?meeting-relatedPitchbookIds/);
  assert.match(index, /meeting-field-backend-only" hidden aria-hidden="true"[^>]*>[\s\S]*?meeting-followUpRequired/);
  assert.match(index, /meeting-field-backend-only" hidden aria-hidden="true"[^>]*>[\s\S]*?meeting-followUpNote/);
  assert.match(index, /relatedPitchbookIds:selectedOptionValues\('meeting-relatedPitchbookIds'\)/);
  assert.match(index, /followUpRequired:el\('meeting-followUpRequired'\)\.checked/);
  assert.match(index, /followUpNote:el\('meeting-followUpNote'\)\.value/);
  assert.match(styles, /\.meeting-field-backend-only\{display:none!important\}/);
});

test('Meeting create uses a compact left-aligned bounded grid with expanded primary inputs', () => {
  assert.match(styles, /#page-meeting\{width:100%;max-width:2000px;margin-left:0;margin-right:auto\}/);
  assert.match(styles, /#meeting-form>\.grid\{grid-template-columns:repeat\(12,minmax\(0,1fr\)\)/);
  assert.match(styles, /#meeting-form>\.grid>\.meeting-field-fund\{grid-column:7\/span 4;grid-row:3\}/);
  assert.match(styles, /#meeting-form>\.grid>\.meeting-field-counterparty-person\{grid-column:1\/span 6;grid-row:4\}/);
  assert.match(styles, /#meeting-form>\.grid>\.meeting-field-internal-participants\{grid-column:1\/span 6;grid-row:5\}/);
  assert.match(styles, /#meeting-notes\{height:480px;min-height:480px\}/);
  assert.match(index, /class="field meeting-field-fund"[\s\S]*?id="meeting-fundStrategy"/);
  assert.equal((index.match(/class="field meeting-field-participant [^"]+"/g) || []).length, 2);
  assert.match(index, /class="field full meeting-field-notes"[\s\S]*?id="meeting-notes"/);
});

test('draft clear control leads its hint and remains a large left-aligned action', () => {
  const actions = index.match(/<div id="meeting-entry-actions"[\s\S]*?<\/div>/)?.[0] || '';
  assert.ok(actions.indexOf('id="meeting-clear"') < actions.indexOf('id="meeting-entry-hint"'));
  assert.match(styles, /\.record-entry-actions\{[^}]*justify-content:flex-start/);
  assert.match(styles, /\.record-entry-actions \.action\{[^}]*min-height:42px/);
});

test('Past Meetings gives Fund Strategy a two-column desktop field and a one-column mobile fallback', () => {
  assert.match(maintenance, /class="field meeting-past-fund-field"[\s\S]*?id="meeting-past-fundStrategy"/);
  assert.match(styles, /#page-meeting-past \.filter-grid>\.meeting-past-fund-field\{grid-column:span 2;width:min\(100%,60ch\)/);
  assert.match(styles, /#page-meeting-past \.filter-grid>\.meeting-past-fund-field\{grid-column:auto;width:100%\}/);
});
