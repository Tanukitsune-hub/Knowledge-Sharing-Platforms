const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const lab = path.join(root, 'tools', 'ui-layout-lab');
const presets = require(path.join(lab, 'presets.js'));
const model = require(path.join(lab, 'layout-model.js'));

const fieldIds = presets.FIELD_DEFINITIONS.map((field) => field.id);

function asV1(layout) {
  return {
    specVersion: 1,
    screen: layout.screen,
    baseline: layout.baseline,
    presetOrigin: layout.presetOrigin,
    viewport: layout.viewport,
    container: {
      widthPercent: layout.container.widthPercent,
      maxWidthPx: layout.container.maxWidthPx,
      align: layout.container.align,
      columnGapPx: layout.container.columnGapPx,
      rowGapPx: layout.container.rowGapPx,
      showGrid: layout.container.showGrid
    },
    fields: layout.fields.map((field) => ({
      id: field.id,
      order: field.order,
      visible: field.visible,
      colSpan: field.colSpan,
      heightPx: field.role === 'notes' || field.role === 'attachment' ? field.heightPx : undefined,
      role: field.role
    }))
  };
}

function byId(layout, id) {
  return layout.fields.find((field) => field.id === id);
}

test('all four accepted presets use one valid collision-free specVersion2 schema', () => {
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
    assert.equal(layout.specVersion, 2);
    assert.equal(layout.screen, 'meeting-create');
    assert.equal(layout.baseline, 'work0032-version8');
    assert.equal(layout.presetOrigin, id);
    assert.equal(layout.container.gridColumns, 12);
    assert.deepEqual(model.detectCollisions(layout), []);
  }
});

test('field IDs are unique and match the production DOM contract', () => {
  assert.deepEqual(fieldIds, [
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
  ]);
  assert.equal(new Set(fieldIds).size, fieldIds.length);
});

test('Current v8 preset preserves the accepted Work 0032 visual baseline in v2 form', () => {
  const layout = presets.getPreset('current-v8');
  assert.deepEqual(layout.container, {
    gridColumns: 12,
    widthPercent: 100,
    maxWidthPx: 1680,
    align: 'left',
    columnGapPx: 18,
    rowGapPx: 15,
    showGrid: true
  });
  assert.equal(byId(layout, 'meeting-date').colSpan, 3);
  assert.equal(byId(layout, 'meeting-time').colSpan, 2);
  assert.equal(byId(layout, 'meeting-locationId').colSpan, 3);
  assert.equal(byId(layout, 'meeting-counterpartyId').colSpan, 4);
  assert.equal(byId(layout, 'meeting-fundStrategy').colSpan, 4);
  assert.equal(byId(layout, 'meeting-counterparty').colSpan, 6);
  assert.equal(byId(layout, 'meeting-internalParticipants').colSpan, 6);
  assert.equal(byId(layout, 'meeting-notes').colSpan, 12);
  assert.equal(byId(layout, 'meeting-notes').heightPx, 384);
});

test('v1 import migrates deterministically to v2 without losing fields or legacy variants', () => {
  const v1 = asV1(presets.getPreset('balanced-professional'));
  assert.equal(model.validateV1(v1).valid, true);
  const first = model.parseLayoutJson(JSON.stringify(v1));
  const second = model.parseLayoutJson(JSON.stringify(v1));
  assert.equal(model.stableStringify(first), model.stableStringify(second));
  assert.equal(first.specVersion, 2);
  assert.equal(first.container.gridColumns, 12);
  assert.deepEqual(first.fields.map((field) => field.id), fieldIds);
  for (const field of first.fields) {
    assert.equal(Number.isInteger(field.colStart), true);
    assert.equal(Number.isInteger(field.heightPx), true);
    assert.equal(typeof field.breakBefore, 'boolean');
    assert.equal(field.topGapPx, 0);
  }

  const variants = model.migrateVariantMap({ Legacy: JSON.stringify(v1) });
  assert.deepEqual(Object.keys(variants), ['Legacy']);
  assert.equal(JSON.parse(variants.Legacy).specVersion, 2);
});

test('v2 validation fails closed for invalid placement and height properties', () => {
  const cases = [
    ['colStart', (layout) => { layout.fields[0].colStart = 0; }],
    ['colSpan', (layout) => { layout.fields[0].colSpan = 13; }],
    ['overflows', (layout) => { layout.fields[0].colStart = 12; layout.fields[0].colSpan = 2; }],
    ['breakBefore', (layout) => { layout.fields[0].breakBefore = 'yes'; }],
    ['topGapPx', (layout) => { layout.fields[0].topGapPx = 999; }],
    ['heightPx', (layout) => { layout.fields[0].heightPx = 1; }]
  ];
  for (const [message, mutate] of cases) {
    const layout = presets.getPreset('current-v8');
    mutate(layout);
    const validation = model.validateLayout(layout);
    assert.equal(validation.valid, false, message);
    assert.match(validation.errors.join(' '), new RegExp(message));
    assert.throws(() => model.parseLayoutJson(JSON.stringify(layout)), /Layout JSON v2/);
  }
  assert.throws(() => model.parseLayoutJson('{bad json'), /JSONを解析できません/);
});

test('12 to 24 conversion is exact and the even-grid roundtrip preserves appearance', () => {
  const source = presets.getPreset('memo-first');
  const fine = model.convertGrid(source, 24);
  assert.equal(fine.container.gridColumns, 24);
  for (const original of source.fields) {
    const converted = byId(fine, original.id);
    assert.equal(converted.colStart, (original.colStart - 1) * 2 + 1, original.id);
    assert.equal(converted.colSpan, original.colSpan * 2, original.id);
  }
  assert.equal(model.gridConversionLosesFidelity(fine, 12), false);
  const roundtrip = model.convertGrid(fine, 12);
  assert.equal(model.stableStringify(roundtrip), model.stableStringify(source));
});

test('24 to 12 conversion safely normalizes odd units and remains valid', () => {
  let fine = model.convertGrid(presets.getPreset('current-v8'), 24);
  fine = model.updateField(fine, 'meeting-date', { colStart: 2, colSpan: 5 });
  assert.equal(model.gridConversionLosesFidelity(fine, 12), true);
  const standard = model.convertGrid(fine, 12);
  assert.equal(standard.container.gridColumns, 12);
  assert.equal(model.validateLayout(standard).valid, true);
  assert.deepEqual(model.detectCollisions(standard), []);
  for (const field of standard.fields) {
    assert.ok(field.colStart >= 1);
    assert.ok(field.colStart + field.colSpan - 1 <= 12);
  }
});

test('direct placement preserves explicit gaps and resolves a requested collision by pushing rows', () => {
  const source = presets.getPreset('current-v8');
  const placed = model.placeField(source, 'meeting-locationId', {
    order: 2,
    colStart: 9,
    breakBefore: true
  });
  const moved = byId(placed, 'meeting-locationId');
  assert.equal(moved.order, 2);
  assert.equal(moved.colStart, 9);
  assert.equal(moved.breakBefore, true);
  assert.equal(model.validateLayout(placed).valid, true);

  const preview = model.previewPlacement(source, 'meeting-time', {
    order: 2,
    colStart: 1,
    breakBefore: false
  });
  assert.equal(preview.collisionResolved, true);
  assert.ok(preview.collisions.some((item) => item.secondId === 'meeting-time'));
  assert.equal(byId(preview.resolved, 'meeting-time').breakBefore, true);
  assert.deepEqual(model.detectCollisions(preview.resolved), []);
});

test('all eight resize directions update the intended axes and stay on-grid', () => {
  const source = presets.getPreset('current-v8');
  const base = byId(source, 'meeting-locationId');
  for (const direction of ['n', 's', 'e', 'w', 'ne', 'nw', 'se', 'sw']) {
    const horizontal = direction.includes('w') ? -1 : 1;
    const patch = model.calculateResizePatch(base, direction, horizontal, 24, 12);
    if (direction.includes('e') || direction.includes('w')) {
      assert.notEqual(`${patch.colStart}:${patch.colSpan}`, `${base.colStart}:${base.colSpan}`, direction);
    } else {
      assert.equal(`${patch.colStart}:${patch.colSpan}`, `${base.colStart}:${base.colSpan}`, direction);
    }
    if (direction.includes('n') || direction.includes('s')) {
      assert.notEqual(`${patch.topGapPx}:${patch.heightPx}`, `${base.topGapPx}:${base.heightPx}`, direction);
    } else {
      assert.equal(`${patch.topGapPx}:${patch.heightPx}`, `${base.topGapPx}:${base.heightPx}`, direction);
    }
    assert.ok(patch.colStart >= 1);
    assert.ok(patch.colStart + patch.colSpan - 1 <= 12);
  }
});

test('vertical resize applies safe role-specific ranges to ordinary fields and notes', () => {
  let layout = presets.getPreset('current-v8');
  layout = model.resizeField(layout, 'meeting-date', 's', 0, 9999);
  assert.equal(byId(layout, 'meeting-date').heightPx, model.HEIGHT_LIMITS.metadata.max);
  layout = model.resizeField(layout, 'meeting-date', 's', 0, -9999);
  assert.equal(byId(layout, 'meeting-date').heightPx, model.HEIGHT_LIMITS.metadata.min);
  layout = model.resizeField(layout, 'meeting-notes', 's', 0, 9999);
  assert.equal(byId(layout, 'meeting-notes').heightPx, model.HEIGHT_LIMITS.notes.max);
  layout = model.resizeField(layout, 'meeting-notes', 's', 0, -9999);
  assert.equal(byId(layout, 'meeting-notes').heightPx, model.HEIGHT_LIMITS.notes.min);
  assert.equal(model.validateLayout(layout).valid, true);
});

test('one resize gesture creates exactly one undo entry', () => {
  const baseline = presets.getPreset('current-v8');
  const history = model.createHistory(baseline, 20);
  const previewOne = model.previewResize(history.current(), 'meeting-fundStrategy', 'se', 1, 20);
  const previewTwo = model.previewResize(history.current(), 'meeting-fundStrategy', 'se', 2, 40);
  assert.deepEqual(history.counts(), { undo: 0, redo: 0 });
  history.record(previewTwo.resolved);
  assert.deepEqual(history.counts(), { undo: 1, redo: 0 });
  assert.equal(byId(history.undo(), 'meeting-fundStrategy').colSpan, byId(baseline, 'meeting-fundStrategy').colSpan);
  assert.equal(byId(history.redo(), 'meeting-fundStrategy').colSpan, byId(previewTwo.resolved, 'meeting-fundStrategy').colSpan);
  assert.notEqual(model.stableStringify(previewOne.resolved), model.stableStringify(previewTwo.resolved));
});

test('canonical v2 JSON export and import have an exact roundtrip', () => {
  let layout = model.convertGrid(presets.getPreset('balanced-professional'), 24);
  layout = model.updateField(layout, 'meeting-teamId', { visible: false, colStart: 7, colSpan: 5, topGapPx: 12, heightPx: 64 });
  const exported = model.stableStringify(layout);
  const imported = model.parseLayoutJson(exported);
  assert.equal(model.stableStringify(imported), exported);
  assert.equal(JSON.parse(exported).specVersion, 2);
});

test('hidden state, auto tidy, nudge, undo, redo, and reset remain deterministic', () => {
  let layout = model.updateField(presets.getPreset('compact-institutional'), 'meeting-types', { visible: false });
  layout = model.nudgeField(layout, 'meeting-types', 'up', true);
  assert.equal(byId(layout, 'meeting-types').visible, false);

  layout.container.widthPercent = 100;
  layout.container.maxWidthPx = 2800;
  layout.container.columnGapPx = 3;
  layout.container.rowGapPx = 35;
  const first = model.tidyLayout(layout);
  const second = model.tidyLayout(first);
  assert.equal(model.stableStringify(first), model.stableStringify(second));
  assert.equal(first.container.widthPercent, 76);
  assert.equal(first.container.maxWidthPx, 1800);

  const history = model.createHistory(first, 3);
  history.record(model.nudgeField(history.current(), 'meeting-date', 'right', false));
  history.record(model.nudgeField(history.current(), 'meeting-time', 'down', false));
  assert.equal(history.canUndo(), true);
  history.undo();
  assert.equal(history.canRedo(), true);
  history.redo();
  history.reset(first);
  assert.deepEqual(history.counts(), { undo: 0, redo: 0 });
});

test('v2 design lint covers collision, bounds, gaps, tall fields, narrow participants, short notes, and precision loss', () => {
  let layout = model.convertGrid(presets.getPreset('current-v8'), 24);
  byId(layout, 'meeting-date').colStart = 0;
  byId(layout, 'meeting-time').colStart = 1;
  byId(layout, 'meeting-counterparty').colSpan = 4;
  byId(layout, 'meeting-counterparty').topGapPx = 80;
  byId(layout, 'meeting-locationId').heightPx = 140;
  byId(layout, 'meeting-notes').heightPx = 240;
  byId(layout, 'meeting-fundStrategy').colStart = 18;
  byId(layout, 'meeting-fundStrategy').colSpan = 7;
  const codes = new Set(model.lintLayout(layout).map((warning) => warning.code));
  for (const code of ['OUT_OF_GRID', 'COLLISION', 'LARGE_TOP_GAP', 'TALL_STANDARD', 'NARROW_PARTICIPANTS', 'SHORT_NOTES', 'PRECISION_LOSS']) {
    assert.equal(codes.has(code), true, code);
  }
});

test('Codex handoff includes v2 precision and direct placement properties', () => {
  const handoff = model.createHandoff(model.convertGrid(presets.getPreset('memo-first'), 24));
  assert.match(handoff, /work0032-version8/);
  assert.match(handoff, /version 2 \/ 24 columns/);
  assert.match(handoff, /meeting-notes.*start .*span 24\/24, height 500px, top gap 0px, break yes/);
  assert.match(handoff, /720px以下は全fieldを1-column表示/);
  assert.match(handoff, /visual\/layout変更のみに限定/);
  assert.match(handoff, /"specVersion": 2/);
  assert.match(handoff, /"colStart":/);
  assert.match(handoff, /"breakBefore":/);
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

test('browser surface exposes v2 controls, eight handles, and guarded keyboard manipulation', () => {
  const html = fs.readFileSync(path.join(lab, 'index.html'), 'utf8');
  const ui = fs.readFileSync(path.join(lab, 'layout-lab.js'), 'utf8');
  for (const id of [
    'precision-buttons', 'tidy-button', 'undo-button', 'redo-button', 'reset-button',
    'variant-save', 'variant-load', 'variant-delete', 'json-import', 'handoff-button', 'reference-file',
    'field-order', 'field-start', 'field-span', 'field-top-gap', 'field-height', 'field-break-before'
  ]) {
    assert.match(html, new RegExp(`id="${id}"`));
  }
  assert.match(ui, /\['n', 's', 'e', 'w', 'ne', 'nw', 'se', 'sw'\]/);
  assert.match(ui, /dragstart/);
  assert.match(ui, /dragover/);
  assert.match(ui, /pointerdown/);
  assert.match(ui, /pointercancel/);
  assert.match(ui, /GRID BOUNDARY · safe clamp/);
  assert.match(ui, /alignment-guide nearby/);
  assert.match(ui, /ArrowLeft/);
  assert.match(ui, /input,select,textarea,button/);
  assert.match(ui, /localStorage/);
  const cacheBlock = ui.match(/function cacheElements\(\) \{[\s\S]*?\]\.forEach/)[0];
  const cachedIds = [...cacheBlock.matchAll(/'([^']+)'/g)].map((match) => match[1]);
  for (const id of cachedIds) assert.match(html, new RegExp(`id="${id}"`), `missing cached element: ${id}`);
  assert.doesNotMatch(combinedLabSource(), /(?:require|import).*src[\\/]/i);
});

function combinedLabSource() {
  return ['layout-lab.js', 'layout-model.js', 'presets.js'].map((file) => fs.readFileSync(path.join(lab, file), 'utf8')).join('\n');
}
