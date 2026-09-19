const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = (...parts) => fs.readFileSync(path.join(root, ...parts), 'utf8');
const index = read('src', 'Index.html');
const styles = read('src', 'Styles.html');
const candidate = JSON.parse(read('docs', 'handoffs', '0033-user-layout-candidate-current.json'));

function field(id) {
  return candidate.fields.find(item => item.id === id);
}

test('production Meeting container uses the accepted Work 0033 contract', () => {
  assert.deepEqual(candidate.container, {
    gridColumns: 12,
    widthPercent: 100,
    maxWidthPx: 2000,
    align: 'left',
    columnGapPx: 14,
    rowGapPx: 14,
    showGrid: true
  });
  assert.match(styles, /#page-meeting\{width:100%;max-width:2000px;margin-left:0;margin-right:auto\}/);
  assert.match(styles, /#meeting-form>\.grid\{grid-template-columns:repeat\(12,minmax\(0,1fr\)\);column-gap:14px;row-gap:14px;align-items:start;grid-auto-flow:row\}/);
});

test('production Meeting fields retain explicit desktop placement after the Work 0037 refinement', () => {
  const expected = {
    'meeting-date': ['meeting-field-date', 1, 2, 1],
    'meeting-time': ['meeting-field-time', 3, 1, 1],
    'meeting-locationId': ['meeting-field-location', 4, 2, 1],
    'meeting-teamId': ['meeting-field-team', 6, 2, 1],
    'meeting-assetClassId': ['meeting-field-asset', 8, 2, 1],
    'meeting-types': ['meeting-field-types', 10, 3, 1],
    'meeting-counterpartyId': ['meeting-field-counterparty', 1, 6, 2],
    'meeting-fundStrategy': ['meeting-field-fund', 7, 4, 2],
    'meeting-counterparty': ['meeting-field-counterparty-person', 1, 6, 3],
    'meeting-internalParticipants': ['meeting-field-internal-participants', 1, 6, 4],
    'attachment-section': ['#attachment-section', 1, 12, 5],
    'meeting-notes': ['meeting-field-notes', 1, 12, 6]
  };
  for (const [id, [selector, start, span, row]] of Object.entries(expected)) {
    const item = field(id);
    assert.equal(item.visible, true, id);
    assert.ok(item, id);
    const target = selector.startsWith('#') ? `#meeting-form>.grid>${selector}` : `#meeting-form>.grid>.${selector}`;
    assert.ok(styles.includes(`${target}{grid-column:${start}/span ${span};grid-row:${row}`), id);
  }
  assert.match(styles, /#meeting-form>\.grid>\.meeting-field-types\{grid-column:10\/span 3;grid-row:1;min-height:0\}/);
  assert.match(styles, /#meeting-form>\.grid>#attachment-section\{[^}]*min-height:130px/);
  assert.match(styles, /#meeting-notes\{height:480px;min-height:480px\}/);
});

test('source order supports the canonical visual and mobile order', () => {
  const tokens = [
    'id="meeting-date"', 'id="meeting-time"', 'id="meeting-locationId"', 'id="meeting-teamId"',
    'id="meeting-assetClassId"', 'id="meeting-capitalTypeId"', 'id="meeting-types"',
    'id="meeting-counterpartyId"', 'id="meeting-fundStrategy"', 'id="meeting-counterparty"',
    'id="meeting-internalParticipants"', 'id="meeting-submit"', 'id="attachment-section"', 'id="meeting-notes"'
  ];
  let previous = -1;
  for (const token of tokens) {
    const next = index.indexOf(token);
    assert.ok(next > previous, token);
    previous = next;
  }
  assert.equal((index.match(/id="attachment-section"/g) || []).length, 1);
  assert.ok(index.indexOf('id="meeting-file-home"') < index.indexOf('id="meeting-notes"'));
});

test('capital type remains in the backend contract without consuming visible space', () => {
  assert.equal(field('meeting-capitalTypeId').visible, false);
  assert.match(index, /class="field meeting-field-backend-only" hidden aria-hidden="true"><label for="meeting-capitalTypeId"/);
  assert.equal((index.match(/id="meeting-capitalTypeId"/g) || []).length, 1);
  assert.match(styles, /\.meeting-field-backend-only\{display:none!important\}/);
  assert.match(index, /capitalTypeId:el\('meeting-capitalTypeId'\)\.value/);
});

test('only the <=720px projection collapses Meeting fields to one column', () => {
  const mobile = styles.slice(styles.indexOf('@media(max-width:720px)'));
  assert.match(mobile, /#meeting-form>\.grid\{grid-template-columns:1fr\}/);
  for (const selector of [
    'meeting-field-date', 'meeting-field-time', 'meeting-field-location', 'meeting-field-team',
    'meeting-field-asset', 'meeting-field-types', 'meeting-field-counterparty', 'meeting-field-fund',
    'meeting-field-counterparty-person', 'meeting-field-internal-participants', 'meeting-field-submit', 'meeting-field-notes'
  ]) assert.ok(mobile.includes(`#meeting-form>.grid>.${selector}`), selector);
  assert.ok(mobile.includes('#meeting-form>.grid>#attachment-section'));
  assert.match(mobile, /\{grid-column:1;grid-row:auto;width:100%\}/);
  assert.doesNotMatch(styles.slice(styles.indexOf('@media(max-width:1000px)'), styles.indexOf('@media(max-width:720px)')), /meeting-field-date|meeting-field-time|meeting-field-types/);
});

test('shared sidebar uses premium metallic gold dimensional states and a visible ornament', () => {
  assert.match(styles, /--gold-highlight:#FFE89A;--gold-mid:#C58C25;--gold-deep:#70480D/);
  assert.match(styles, /\.page-header\{[^}]*radial-gradient[^}]*linear-gradient[^}]*border-right:1px solid #C79A38[^}]*box-shadow:/);
  assert.match(styles, /\.nav button\{[^}]*linear-gradient[^}]*box-shadow:[^}]*transition:/);
  assert.match(styles, /\.nav button:hover\{[^}]*linear-gradient[^}]*translateY\(-1px\)/);
  assert.match(styles, /\.nav button\.active\{[^}]*linear-gradient[^}]*translateX\(1px\)[^}]*translateY\(-1px\)/);
  assert.match(styles, /\.nav-icon\{[^}]*stroke:#F0CF69[^}]*drop-shadow/);
  assert.match(styles, /\.nav button\.active \.nav-icon\{[^}]*stroke:#4E3309[^}]*drop-shadow/);
  assert.match(styles, /\.sidebar-motif\{[^}]*opacity:\.72[^}]*drop-shadow/);
  assert.match(index, /<linearGradient id="sidebar-ornament-gold"[\s\S]*?stroke="url\(#sidebar-ornament-gold\)"/);
});
