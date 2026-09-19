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

test('draft clear control follows the heading and precedes the compact status', () => {
  const actions = index.match(/<div id="meeting-entry-actions" class="meeting-entry-header">[\s\S]*?<\/div>/)?.[0] || '';
  assert.ok(actions.indexOf('<h2>記録を追加<\/h2>') < actions.indexOf('id="meeting-clear"'));
  assert.ok(actions.indexOf('id="meeting-clear"') < actions.indexOf('id="meeting-status"'));
  assert.match(styles, /\.meeting-entry-header\{[^}]*justify-content:flex-start/);
  assert.match(styles, /\.meeting-entry-header \.action\{[^}]*min-height:38px/);
});

test('Past Meetings preserves the Fund Strategy contract while Work 0037 hides the filter', () => {
  assert.match(maintenance, /<input id="meeting-past-fundStrategy" type="hidden" value="">/);
  assert.doesNotMatch(maintenance, /class="field meeting-past-fund-field"/);
  assert.match(styles, /\.meeting-past-filter-grid>\.field\{grid-column:1;grid-row:auto;width:100%\}/);
});
