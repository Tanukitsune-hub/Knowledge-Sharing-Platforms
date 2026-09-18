const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const lab = path.join(root, 'tools', 'ui-layout-lab');
const definitions = require(path.join(lab, 'screen-definitions.js'));
const model = require(path.join(lab, 'project-model.js'));
const legacyPresets = require(path.join(lab, 'presets.js'));
const legacyModel = require(path.join(lab, 'layout-model.js'));

function element(project, screenId, elementId) {
  const found = model.findElement(project.screens[screenId], elementId);
  assert.ok(found, `${screenId}/${elementId}`);
  return found.element;
}

test('Studio exposes the seven exact production screen IDs in navigation order', () => {
  assert.deepEqual(definitions.SCREEN_IDS, [
    'knowledge',
    'meeting-create',
    'meeting-past',
    'counterparty-summary',
    'activity-analytics',
    'masters',
    'admin'
  ]);
  assert.equal(new Set(definitions.SCREEN_IDS).size, 7);
});

test('all seven Work 0034 baselines are valid, collision-free, and use unique element IDs', () => {
  const project = model.createDefaultProject();
  assert.equal(model.validateProject(project).valid, true);
  for (const screenId of definitions.SCREEN_IDS) {
    const screen = project.screens[screenId];
    const validation = model.validateScreen(screen, screenId);
    assert.equal(validation.valid, true, `${screenId}: ${validation.errors.join(' / ')}`);
    assert.deepEqual(model.detectScreenCollisions(screen), [], screenId);
    const ids = model.flattenElements(screen).map((entry) => entry.element.id);
    assert.equal(new Set(ids).size, ids.length, screenId);
    assert.equal(screen.gridColumns, 24);
    assert.equal(screen.microSnapPx, 4);
  }
});

test('Meeting baseline preserves the accepted Work 0033 candidate and hidden capital type', () => {
  const project = model.createDefaultProject();
  const expected = {
    'meeting-date': [1, 4, false, 37, true],
    'meeting-time': [5, 2, false, 37, true],
    'meeting-locationId': [7, 4, false, 37, true],
    'meeting-teamId': [11, 4, false, 37, true],
    'meeting-assetClassId': [15, 4, false, 37, true],
    'meeting-capitalTypeId': [9, 4, false, 37, false],
    'meeting-types': [1, 24, true, 48, true],
    'meeting-counterpartyId': [1, 12, true, 37, true],
    'meeting-fundStrategy': [13, 8, false, 37, true],
    'meeting-counterparty': [1, 12, true, 37, true],
    'meeting-internalParticipants': [1, 12, true, 37, true],
    'attachment-section': [1, 24, true, 130, true],
    'meeting-notes': [1, 24, true, 480, true]
  };
  for (const [id, values] of Object.entries(expected)) {
    const item = element(project, 'meeting-create', id);
    assert.deepEqual([item.colStart, item.colSpan, item.breakBefore, item.heightPx, item.visible], values, id);
    assert.deepEqual([item.xOffsetPx, item.yOffsetPx, item.widthAdjustPx], [0, 0, 0], id);
  }
  assert.deepEqual(project.screens['meeting-create'].container, {
    widthPercent: 100,
    maxWidthPx: 2000,
    align: 'left',
    columnGapPx: 14,
    rowGapPx: 14,
    showGrid: true
  });
});

test('whole-project canonical JSON has an exact stable roundtrip', () => {
  let project = model.createDefaultProject();
  project = model.updateElement(project, 'knowledge', 'knowledge-query', { xOffsetPx: 8, widthAdjustPx: -4 });
  project = model.updateShared(project, { sidebarWidthPx: 280, cardRadiusPx: 18 });
  const exported = model.stableStringify(project);
  const imported = model.parseProjectJson(exported);
  assert.equal(model.stableStringify(imported), exported);
  assert.equal(JSON.parse(exported).projectSpecVersion, 1);
});

test('current-screen JSON export and import have an exact stable roundtrip', () => {
  const project = model.createDefaultProject();
  const exported = model.screenExport(project, 'activity-analytics');
  const result = model.parseImportJson(exported);
  assert.equal(result.kind, 'screen');
  assert.equal(result.screen.id, 'activity-analytics');
  assert.equal(model.stableStringify(result.screen), exported);
});

test('project import fails closed for missing, extra, malformed, and invalid screens', () => {
  const missing = model.createDefaultProject();
  delete missing.screens.admin;
  assert.throws(() => model.parseProjectJson(JSON.stringify(missing)), /seven exact screen ids/);
  const extra = model.createDefaultProject();
  extra.screens.debug = extra.screens.admin;
  assert.throws(() => model.parseProjectJson(JSON.stringify(extra)), /seven exact screen ids/);
  const invalid = model.createDefaultProject();
  invalid.screens.knowledge.blocks[0].xOffsetPx = 3;
  assert.throws(() => model.parseProjectJson(JSON.stringify(invalid)), /invalid xOffsetPx/);
  const invalidShared = model.createDefaultProject();
  invalidShared.shared.sidebarWidthPx = 999;
  assert.throws(() => model.parseProjectJson(JSON.stringify(invalidShared)), /invalid shared sidebarWidthPx/);
  assert.throws(() => model.parseImportJson('{bad'), /JSONを解析できません/);
  assert.throws(() => model.parseImportJson(JSON.stringify({ specVersion: 99 })), /対応していないJSON/);
});

test('legacy Meeting v1/v2 imports migrate deterministically without losing the accepted candidate', () => {
  const v2 = legacyPresets.getPreset('compact-institutional');
  const first = model.parseImportJson(JSON.stringify(v2));
  const second = model.parseImportJson(JSON.stringify(v2));
  assert.equal(first.kind, 'legacy-meeting');
  assert.equal(model.stableStringify(first.project), model.stableStringify(second.project));
  assert.equal(element(first.project, 'meeting-create', 'meeting-date').colStart, 1);
  assert.equal(element(first.project, 'meeting-create', 'meeting-time').colStart, 5);
  assert.equal(element(first.project, 'meeting-create', 'meeting-assetClassId').colStart, 15);
  assert.equal(element(first.project, 'meeting-create', 'meeting-capitalTypeId').visible, false);

  const v1 = {
    specVersion: 1,
    screen: v2.screen,
    baseline: v2.baseline,
    presetOrigin: v2.presetOrigin,
    viewport: v2.viewport,
    container: { ...v2.container },
    fields: v2.fields.map((field) => ({ id: field.id, order: field.order, visible: field.visible, colSpan: field.colSpan, heightPx: field.heightPx, role: field.role }))
  };
  delete v1.container.gridColumns;
  const migrated = model.parseImportJson(JSON.stringify(v1));
  assert.equal(migrated.kind, 'legacy-meeting');
  assert.equal(model.validateProject(migrated.project).valid, true);
});

test('12, 24, and 48-column conversion preserves appearance for even placements', () => {
  const source = model.createDefaultProject();
  const standard = model.convertScreenGrid(source, 'meeting-create', 12);
  const fine = model.convertScreenGrid(standard, 'meeting-create', 48);
  const roundtrip = model.convertScreenGrid(fine, 'meeting-create', 24);
  assert.equal(standard.screens['meeting-create'].gridColumns, 12);
  assert.equal(fine.screens['meeting-create'].gridColumns, 48);
  assert.equal(roundtrip.screens['meeting-create'].gridColumns, 24);
  for (const item of source.screens['meeting-create'].blocks) {
    const restored = element(roundtrip, 'meeting-create', item.id);
    assert.equal(restored.colStart, item.colStart, item.id);
    assert.equal(restored.colSpan, item.colSpan, item.id);
  }
  assert.equal(model.validateProject(roundtrip).valid, true);
});

test('8, 4, 2, and 1px micro snaps normalize x/y/width adjustments and enforce bounds', () => {
  for (const step of model.MICRO_SNAPS) {
    let project = model.setMicroSnap(model.createDefaultProject(), 'knowledge', step);
    project = model.updateElement(project, 'knowledge', 'knowledge-query', { xOffsetPx: 63, yOffsetPx: -63, widthAdjustPx: 95 });
    const item = element(project, 'knowledge', 'knowledge-query');
    assert.equal(item.xOffsetPx % step, 0, `x ${step}`);
    assert.equal(Math.abs(item.yOffsetPx) % step, 0, `y ${step}`);
    assert.equal(item.widthAdjustPx % step, 0, `width ${step}`);
    assert.ok(Math.abs(item.xOffsetPx) <= model.OFFSET_LIMIT);
    assert.ok(Math.abs(item.yOffsetPx) <= model.OFFSET_LIMIT);
    assert.ok(Math.abs(item.widthAdjustPx) <= model.WIDTH_ADJUST_LIMIT);
  }
});

test('direct placement and all eight resize directions return bounded macro and micro values', () => {
  const project = model.createDefaultProject();
  const source = element(project, 'meeting-create', 'meeting-fundStrategy');
  const placement = model.calculateDirectPlacement(source, 695, 100, 960, 24, 4);
  assert.ok(placement.colStart >= 1 && placement.colStart <= 24);
  assert.equal(placement.xOffsetPx % 4, 0);
  for (const direction of ['n', 's', 'e', 'w', 'ne', 'nw', 'se', 'sw']) {
    const patch = model.calculateResizePatch(source, direction, 97, 43, 40, 4, 24);
    if (direction.includes('e') || direction.includes('w')) {
      assert.ok(patch.colStart >= 1);
      assert.ok(patch.colStart + patch.colSpan - 1 <= 24);
      assert.equal(Math.abs(patch.widthAdjustPx) % 4, 0);
    }
    if (direction.includes('n') || direction.includes('s')) assert.ok(patch.heightPx >= 32 && patch.heightPx <= 760);
  }
});

test('screen edits are isolated while shared settings propagate as one project value', () => {
  const source = model.createDefaultProject();
  const beforePast = model.stableStringify(source.screens['meeting-past']);
  let project = model.updateElement(source, 'knowledge', 'knowledge-query', { xOffsetPx: 12 });
  assert.equal(model.stableStringify(project.screens['meeting-past']), beforePast);
  project = model.updateShared(project, { sidebarWidthPx: 300, blockGapPx: 20 });
  assert.equal(project.shared.sidebarWidthPx, 300);
  assert.equal(project.shared.blockGapPx, 20);
  for (const screenId of definitions.SCREEN_IDS) assert.ok(project.screens[screenId]);
});

test('one gesture-style record creates one undo entry and dirty state is per screen', () => {
  const baseline = model.createDefaultProject();
  const history = model.createHistory(baseline, 10);
  const previewOne = model.updateElement(history.current(), 'masters', 'masters-form-panel', { xOffsetPx: 4 });
  const previewTwo = model.updateElement(previewOne, 'masters', 'masters-form-panel', { xOffsetPx: 12, widthAdjustPx: 8 });
  assert.deepEqual(history.counts(), { undo: 0, redo: 0 });
  history.record(previewTwo);
  assert.deepEqual(history.counts(), { undo: 1, redo: 0 });
  assert.deepEqual(history.dirtyScreens(), ['masters']);
  assert.equal(element(history.undo(), 'masters', 'masters-form-panel').xOffsetPx, 0);
  assert.equal(element(history.redo(), 'masters', 'masters-form-panel').xOffsetPx, 12);
});

test('project variants migrate both current projects and old Meeting variants deterministically', () => {
  assert.equal(model.LEGACY_STORAGE_KEY, 'knowledge-share-ui-layout-lab-variants-v1');
  const project = model.createDefaultProject();
  const legacy = legacyPresets.getPreset('balanced-professional');
  const variants = model.migrateVariantMap({ Current: model.stableStringify(project) }, { OldMeeting: legacyModel.stableStringify(legacy) });
  assert.deepEqual(Object.keys(variants), ['Current', 'OldMeeting']);
  assert.equal(model.validateProject(model.parseProjectJson(variants.Current)).valid, true);
  assert.equal(model.validateProject(model.parseProjectJson(variants.OldMeeting)).valid, true);
});

test('screen handoff and all-screen summary include fine positioning and safe delivery boundaries', () => {
  const project = model.createDefaultProject();
  const screen = model.createScreenHandoff(project, 'meeting-create');
  const summary = model.createProjectHandoff(project);
  assert.match(screen, /Macro grid: `24 columns`/);
  assert.match(screen, /Micro snap: `4px`/);
  assert.match(screen, /meeting-notes.*x 0px, y 0px, width adjust 0px/);
  assert.match(screen, /720px以下のみ1-column visual projection/);
  assert.match(screen, /business logic、schema、migration、security、provider behaviorを変更しない/);
  for (const id of definitions.SCREEN_IDS) assert.match(summary, new RegExp('`' + id + '`'));
  assert.match(summary, /同時deploymentを指示しない/);
});

test('viewport controls are preview-only and UI exposes Overview, fine controls, guides, and eight handles', () => {
  const html = fs.readFileSync(path.join(lab, 'index.html'), 'utf8');
  const ui = fs.readFileSync(path.join(lab, 'studio.js'), 'utf8');
  for (const id of ['overview-button', 'screen-select', 'precision-buttons', 'micro-snap-buttons', 'field-x-offset', 'field-y-offset', 'field-width-adjust', 'shared-page-align', 'alignment-guides', 'drop-ghost', 'row-insertion-marker', 'dialog-project-json', 'dialog-project-handoff']) {
    assert.match(html, new RegExp(`id="${id}"`), id);
  }
  assert.match(ui, /\['n', 's', 'e', 'w', 'ne', 'nw', 'se', 'sw'\]/);
  assert.match(ui, /pointerdown/);
  assert.match(ui, /pointermove/);
  assert.match(ui, /pointercancel/);
  assert.match(ui, /ArrowLeft/);
  assert.match(ui, /input,select,textarea,button/);
  assert.match(ui, /screen-preview'\]\.style\.width = screen\.container\.widthPercent/);
  const viewportBlock = ui.match(/function renderViewportButtons\(\) \{[\s\S]*?\n  \}/)[0];
  assert.doesNotMatch(viewportBlock, /commit\(|history\./);
});

test('the entire file runtime is local-only and contains no network request primitive', () => {
  const runtimeFiles = ['index.html', 'layout-lab.css', 'presets.js', 'layout-model.js', 'screen-definitions.js', 'project-model.js', 'studio.js'];
  const combined = runtimeFiles.map((file) => fs.readFileSync(path.join(lab, file), 'utf8')).join('\n');
  assert.doesNotMatch(combined, /https?:\/\//i);
  assert.doesNotMatch(combined, /\b(fetch|XMLHttpRequest|WebSocket|EventSource|sendBeacon)\s*\(/);
  assert.doesNotMatch(combined, /(?:require|import).*src[\\/]/i);
  const html = fs.readFileSync(path.join(lab, 'index.html'), 'utf8');
  for (const match of html.matchAll(/<(?:script|link)[^>]+(?:src|href)="([^"]+)"/g)) assert.doesNotMatch(match[1], /^(?:[a-z]+:)?\/\//i);
});
