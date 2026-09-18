const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const lab = path.join(root, 'tools', 'ui-layout-lab');
const presets = require(path.join(lab, 'presets.js'));
const model = require(path.join(lab, 'layout-model.js'));

test('all four presets use one valid canonical schema', () => {
  assert.deepEqual(Object.keys(presets.PRESETS), [
    'current-v8',
    'compact-institutional',
    'balanced-professional',
    'memo-first'
  ]);
  for (const id of Object.keys(presets.PRESETS)) {
    const layout = presets.getPreset(id);
    const validation = model.validateLayout(layout);
    assert.equal(validation.valid, true, `${id}: ${validation.errors.join(' ')}`);
    assert.equal(layout.specVersion, 1);
    assert.equal(layout.screen, 'meeting-create');
    assert.equal(layout.baseline, 'work0032-version8');
    assert.equal(layout.presetOrigin, id);
  }
});

test('field IDs are unique and match the production DOM contract', () => {
  const expected = [
    'meeting-date',
    'meeting-time',
    'meeting-locationId',
    'meeting-counterpartyId',
    'meeting-assetClassId',
    'meeting-capitalTypeId',
    'meeting-teamId',
    'meeting-fundStrategy',
    'meeting-types',
    'meeting-counterparty',
    'meeting-internalParticipants',
    'meeting-notes',
    'attachment-section'
  ];
  const actual = presets.FIELD_DEFINITIONS.map((field) => field.id);
  assert.deepEqual(actual, expected);
  assert.equal(new Set(actual).size, actual.length);
});

test('every preset keeps colSpan and resizable heights within bounds', () => {
  for (const id of Object.keys(presets.PRESETS)) {
    for (const field of presets.getPreset(id).fields) {
      assert.ok(field.colSpan >= 1 && field.colSpan <= 12, `${id}/${field.id}`);
      if (field.heightPx !== undefined) assert.ok(field.heightPx >= 100 && field.heightPx <= 720, `${id}/${field.id}/height`);
    }
  }
});

test('Current v8 preserves the Work 0032 baseline layout contract', () => {
  const layout = presets.getPreset('current-v8');
  assert.deepEqual(layout.container, {
    widthPercent: 100,
    maxWidthPx: 1680,
    align: 'left',
    columnGapPx: 18,
    rowGapPx: 15,
    showGrid: true
  });
  const spans = Object.fromEntries(layout.fields.map((field) => [field.id, field.colSpan]));
  assert.equal(spans['meeting-date'], 3);
  assert.equal(spans['meeting-time'], 2);
  assert.equal(spans['meeting-locationId'], 3);
  assert.equal(spans['meeting-counterpartyId'], 4);
  assert.equal(spans['meeting-fundStrategy'], 4);
  assert.equal(spans['meeting-counterparty'], 6);
  assert.equal(spans['meeting-internalParticipants'], 6);
  assert.equal(spans['meeting-notes'], 12);
  assert.equal(layout.fields.find((field) => field.id === 'meeting-notes').heightPx, 384);
});

test('auto tidy is valid, deterministic, and idempotent', () => {
  let layout = presets.getPreset('memo-first');
  layout.container.widthPercent = 100;
  layout.container.maxWidthPx = 2800;
  layout.container.columnGapPx = 3;
  layout.container.rowGapPx = 35;
  layout.fields[0].colSpan = 12;
  layout.fields.find((field) => field.id === 'meeting-notes').heightPx = 120;
  const first = model.tidyLayout(layout);
  const second = model.tidyLayout(first);
  assert.equal(model.validateLayout(first).valid, true);
  assert.equal(model.stableStringify(first), model.stableStringify(second));
  assert.equal(first.container.widthPercent, 76);
  assert.equal(first.container.maxWidthPx, 1800);
  assert.equal(first.container.columnGapPx, 16);
  assert.equal(first.container.rowGapPx, 16);
  assert.equal(first.fields.find((field) => field.id === 'meeting-notes').heightPx, 320);
});

test('canonical JSON export and import have an exact roundtrip', () => {
  const layout = model.updateField(presets.getPreset('balanced-professional'), 'meeting-teamId', { visible: false, colSpan: 5 });
  const exported = model.stableStringify(layout);
  const imported = model.parseLayoutJson(exported);
  assert.equal(model.stableStringify(imported), exported);
});

test('invalid imports fail closed without normalizing unsafe input', () => {
  assert.throws(() => model.parseLayoutJson('{bad json'), /JSONを解析できません/);
  const badSpan = presets.getPreset('current-v8');
  badSpan.fields[0].colSpan = 13;
  assert.throws(() => model.parseLayoutJson(JSON.stringify(badSpan)), /colSpan/);
  const unknown = presets.getPreset('current-v8');
  unknown.fields[0].id = 'unknown-field';
  assert.throws(() => model.parseLayoutJson(JSON.stringify(unknown)), /canonical field ID|Unknown field ID/);
  const missing = presets.getPreset('current-v8');
  missing.fields.pop();
  assert.throws(() => model.parseLayoutJson(JSON.stringify(missing)), /canonical field ID/);
});

test('hidden field state survives normalization, reorder, and JSON roundtrip', () => {
  let layout = model.updateField(presets.getPreset('compact-institutional'), 'meeting-types', { visible: false });
  layout = model.reorderField(layout, 'meeting-types', 'meeting-date');
  const imported = model.parseLayoutJson(model.stableStringify(layout));
  const hidden = imported.fields.find((field) => field.id === 'meeting-types');
  assert.equal(hidden.visible, false);
  assert.equal(hidden.order, 1);
});

test('bounded history supports undo, redo, and reset deterministically', () => {
  const baseline = presets.getPreset('current-v8');
  const history = model.createHistory(baseline, 3);
  history.record(model.updateField(history.current(), 'meeting-date', { colSpan: 4 }));
  history.record(model.updateField(history.current(), 'meeting-time', { colSpan: 4 }));
  assert.equal(history.canUndo(), true);
  assert.equal(history.undo().fields.find((field) => field.id === 'meeting-time').colSpan, 2);
  assert.equal(history.canRedo(), true);
  assert.equal(history.redo().fields.find((field) => field.id === 'meeting-time').colSpan, 4);
  history.reset(baseline);
  assert.deepEqual(history.counts(), { undo: 0, redo: 0 });
});

test('Codex handoff includes responsive intent, field values, JSON, and visual-only boundary', () => {
  const handoff = model.createHandoff(presets.getPreset('memo-first'));
  assert.match(handoff, /work0032-version8/);
  assert.match(handoff, /meeting-notes.*12\/12, height 500px/);
  assert.match(handoff, /720px以下は全fieldを1-column表示/);
  assert.match(handoff, /visual\/layout変更のみに限定/);
  assert.match(handoff, /"specVersion": 1/);
});

test('static runtime has local assets only and no network-capable dependency', () => {
  const runtimeFiles = ['index.html', 'layout-lab.css', 'layout-lab.js', 'layout-model.js', 'presets.js'];
  const combined = runtimeFiles.map((file) => fs.readFileSync(path.join(lab, file), 'utf8')).join('\n');
  assert.doesNotMatch(combined, /https?:\/\//i);
  assert.doesNotMatch(combined, /\b(fetch|XMLHttpRequest|WebSocket|EventSource|sendBeacon)\s*\(/);
  const html = fs.readFileSync(path.join(lab, 'index.html'), 'utf8');
  for (const match of html.matchAll(/<(?:script|link)[^>]+(?:src|href)="([^"]+)"/g)) {
    assert.doesNotMatch(match[1], /^(?:[a-z]+:)?\/\//i);
  }
  assert.match(fs.readFileSync(path.join(lab, 'open-layout-lab.bat'), 'utf8'), /%~dp0index\.html/);
});

test('browser surface exposes every required control without importing production source', () => {
  const html = fs.readFileSync(path.join(lab, 'index.html'), 'utf8');
  const ui = fs.readFileSync(path.join(lab, 'layout-lab.js'), 'utf8');
  for (const id of ['tidy-button', 'undo-button', 'redo-button', 'reset-button', 'variant-save', 'variant-load', 'variant-delete', 'json-import', 'handoff-button', 'reference-file']) {
    assert.match(html, new RegExp(`id="${id}"`));
  }
  assert.match(ui, /dragstart/);
  assert.match(ui, /pointerdown/);
  assert.match(ui, /localStorage/);
  assert.doesNotMatch(combinedLabSource(), /(?:require|import).*src[\\/]/i);
});

function combinedLabSource() {
  return ['layout-lab.js', 'layout-model.js', 'presets.js'].map((file) => fs.readFileSync(path.join(lab, file), 'utf8')).join('\n');
}
