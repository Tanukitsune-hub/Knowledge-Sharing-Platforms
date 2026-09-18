(function (root, factory) {
  const screens = typeof module === 'object' && module.exports ? require('./screen-definitions.js') : root.UiStudioScreens;
  const legacyModel = typeof module === 'object' && module.exports ? require('./layout-model.js') : root.LayoutLabModel;
  const legacyPresets = typeof module === 'object' && module.exports ? require('./presets.js') : root.LayoutLabPresets;
  const api = factory(screens, legacyModel, legacyPresets);
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.UiStudioModel = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function (screens, legacyModel, legacyPresets) {
  'use strict';

  const PROJECT_SPEC_VERSION = 1;
  const SCREEN_SPEC_VERSION = 3;
  const GRID_COLUMNS = Object.freeze([12, 24, 48]);
  const MICRO_SNAPS = Object.freeze([8, 4, 2, 1]);
  const OFFSET_LIMIT = 64;
  const WIDTH_ADJUST_LIMIT = 96;
  const HISTORY_LIMIT = 80;
  const PROJECT_STORAGE_KEY = 'knowledge-share-ui-studio-project-variants-v1';
  const LEGACY_STORAGE_KEY = 'knowledge-share-ui-layout-lab-variants-v1';

  const SHARED_DEFAULTS = Object.freeze({
    pageWidthPercent: 100,
    pageMaxWidthPx: 2000,
    pageAlign: 'left',
    sidebarWidthPx: 252,
    sidebarGoldIntensity: 82,
    sidebarIconDepth: 76,
    ornamentOpacity: 78,
    ornamentScale: 100,
    cardRadiusPx: 16,
    blockGapPx: 14,
    controlHeightPx: 40
  });

  const CONTAINER_DEFAULTS = Object.freeze({
    widthPercent: 100,
    maxWidthPx: 2000,
    align: 'left',
    columnGapPx: 14,
    rowGapPx: 14,
    showGrid: true
  });

  const PRESETS = Object.freeze({
    'current-production-v10': Object.freeze({ id: 'current-production-v10', name: 'Current Production v10', description: '受理済みproduction visual baseline。' }),
    'compact-institutional': Object.freeze({ id: 'compact-institutional', name: 'Compact Institutional', description: '情報密度を上げ、業務画面らしく整える。' }),
    'balanced-professional': Object.freeze({ id: 'balanced-professional', name: 'Balanced Professional', description: '余白と可読性の均衡を取る。' }),
    'memo-data-focus': Object.freeze({ id: 'memo-data-focus', name: 'Memo / Data Focus', description: '本文・表・チャートを優先する。' })
  });

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function clamp(value, minimum, maximum) {
    return Math.min(maximum, Math.max(minimum, value));
  }

  function integer(value, fallback) {
    const number = Number(value);
    return Number.isFinite(number) ? Math.round(number) : fallback;
  }

  function snap(value, step) {
    const result = Math.round(Number(value || 0) / step) * step;
    return Object.is(result, -0) ? 0 : result;
  }

  function sorted(value) {
    if (Array.isArray(value)) return value.map(sorted);
    if (!value || typeof value !== 'object') return value;
    const result = {};
    Object.keys(value).sort().forEach(function (key) { result[key] = sorted(value[key]); });
    return result;
  }

  function stableStringify(value) {
    return JSON.stringify(sorted(value), null, 2) + '\n';
  }

  function baselineElementMap(screenId) {
    const result = {};
    function visit(items) {
      items.forEach(function (item) {
        result[item.id] = item;
        visit(item.children || []);
      });
    }
    visit(screens.getBaselineBlocks(screenId));
    return result;
  }

  function normalizeElement(input, fallback, columns, microSnap) {
    const source = input || {};
    const base = fallback || source;
    const span = clamp(integer(source.colSpan, base.colSpan || columns), 1, columns);
    const start = clamp(integer(source.colStart, base.colStart || 1), 1, columns - span + 1);
    const childrenById = {};
    (source.children || []).forEach(function (childItem) { childrenById[childItem.id] = childItem; });
    return {
      id: base.id,
      label: base.label,
      kind: base.kind || 'card',
      role: base.role || 'section',
      order: integer(source.order, base.order || 1),
      visible: Object.prototype.hasOwnProperty.call(source, 'visible') ? source.visible !== false : base.visible !== false,
      colStart: start,
      colSpan: span,
      breakBefore: Object.prototype.hasOwnProperty.call(source, 'breakBefore') ? source.breakBefore === true : base.breakBefore === true,
      topGapPx: clamp(integer(source.topGapPx, base.topGapPx || 0), 0, 240),
      heightPx: clamp(integer(source.heightPx, base.heightPx || 80), 32, 760),
      xOffsetPx: clamp(snap(source.xOffsetPx, microSnap), -OFFSET_LIMIT, OFFSET_LIMIT),
      yOffsetPx: clamp(snap(source.yOffsetPx, microSnap), -OFFSET_LIMIT, OFFSET_LIMIT),
      widthAdjustPx: clamp(snap(source.widthAdjustPx, microSnap), -WIDTH_ADJUST_LIMIT, WIDTH_ADJUST_LIMIT),
      children: (base.children || []).map(function (childBase) {
        return normalizeElement(childrenById[childBase.id], childBase, columns, microSnap);
      })
    };
  }

  function normalizeScreen(input, screenId) {
    const source = input || {};
    const columns = GRID_COLUMNS.includes(Number(source.gridColumns)) ? Number(source.gridColumns) : 24;
    const microSnap = MICRO_SNAPS.includes(Number(source.microSnapPx)) ? Number(source.microSnapPx) : 4;
    const definition = screens.getScreenDefinition(screenId);
    const baseline = screens.getBaselineBlocks(screenId);
    const sourceById = {};
    (source.blocks || []).forEach(function (item) { sourceById[item.id] = item; });
    const containerSource = source.container || {};
    return {
      screenSpecVersion: SCREEN_SPEC_VERSION,
      id: screenId,
      title: definition.label,
      baseline: 'work0034-version10',
      presetOrigin: typeof source.presetOrigin === 'string' && source.presetOrigin ? source.presetOrigin : 'current-production-v10',
      gridColumns: columns,
      microSnapPx: microSnap,
      container: {
        widthPercent: clamp(integer(containerSource.widthPercent, CONTAINER_DEFAULTS.widthPercent), 40, 100),
        maxWidthPx: clamp(integer(containerSource.maxWidthPx, CONTAINER_DEFAULTS.maxWidthPx), 640, 3000),
        align: containerSource.align === 'center' ? 'center' : 'left',
        columnGapPx: clamp(integer(containerSource.columnGapPx, CONTAINER_DEFAULTS.columnGapPx), 0, 40),
        rowGapPx: clamp(integer(containerSource.rowGapPx, CONTAINER_DEFAULTS.rowGapPx), 0, 40),
        showGrid: containerSource.showGrid !== false
      },
      blocks: baseline.map(function (base) { return normalizeElement(sourceById[base.id], base, columns, microSnap); })
    };
  }

  function normalizeShared(input) {
    const source = input || {};
    return {
      pageWidthPercent: clamp(integer(source.pageWidthPercent, SHARED_DEFAULTS.pageWidthPercent), 50, 100),
      pageMaxWidthPx: clamp(integer(source.pageMaxWidthPx, SHARED_DEFAULTS.pageMaxWidthPx), 960, 3000),
      pageAlign: source.pageAlign === 'center' ? 'center' : 'left',
      sidebarWidthPx: clamp(integer(source.sidebarWidthPx, SHARED_DEFAULTS.sidebarWidthPx), 190, 360),
      sidebarGoldIntensity: clamp(integer(source.sidebarGoldIntensity, SHARED_DEFAULTS.sidebarGoldIntensity), 0, 100),
      sidebarIconDepth: clamp(integer(source.sidebarIconDepth, SHARED_DEFAULTS.sidebarIconDepth), 0, 100),
      ornamentOpacity: clamp(integer(source.ornamentOpacity, SHARED_DEFAULTS.ornamentOpacity), 0, 100),
      ornamentScale: clamp(integer(source.ornamentScale, SHARED_DEFAULTS.ornamentScale), 60, 160),
      cardRadiusPx: clamp(integer(source.cardRadiusPx, SHARED_DEFAULTS.cardRadiusPx), 0, 32),
      blockGapPx: clamp(integer(source.blockGapPx, SHARED_DEFAULTS.blockGapPx), 0, 32),
      controlHeightPx: clamp(integer(source.controlHeightPx, SHARED_DEFAULTS.controlHeightPx), 32, 56)
    };
  }

  function createDefaultProject() {
    const projectScreens = {};
    screens.SCREEN_IDS.forEach(function (screenId) { projectScreens[screenId] = normalizeScreen({}, screenId); });
    return {
      projectSpecVersion: PROJECT_SPEC_VERSION,
      name: 'Work 0034 / version 10 visual baseline',
      baseline: 'work0034-version10',
      shared: normalizeShared({}),
      screens: projectScreens
    };
  }

  function normalizeProject(input) {
    const source = input || {};
    const projectScreens = {};
    screens.SCREEN_IDS.forEach(function (screenId) {
      projectScreens[screenId] = normalizeScreen(source.screens && source.screens[screenId], screenId);
    });
    return {
      projectSpecVersion: PROJECT_SPEC_VERSION,
      name: typeof source.name === 'string' && source.name.trim() ? source.name.trim().slice(0, 100) : 'Work 0034 / version 10 visual baseline',
      baseline: 'work0034-version10',
      shared: normalizeShared(source.shared),
      screens: projectScreens
    };
  }

  function flattenElements(screen) {
    const result = [];
    function visit(items, parentId) {
      items.forEach(function (item) {
        result.push({ element: item, parentId: parentId || null });
        visit(item.children || [], item.id);
      });
    }
    visit(screen.blocks || []);
    return result;
  }

  function validateScreen(screen, expectedId) {
    const errors = [];
    if (!screen || typeof screen !== 'object') return { valid: false, errors: ['screen object is required'] };
    if (screen.screenSpecVersion !== SCREEN_SPEC_VERSION) errors.push('screenSpecVersion must be 3');
    if (screen.id !== expectedId) errors.push('screen id mismatch: ' + expectedId);
    if (!GRID_COLUMNS.includes(screen.gridColumns)) errors.push('gridColumns must be 12, 24, or 48');
    if (!MICRO_SNAPS.includes(screen.microSnapPx)) errors.push('microSnapPx must be 8, 4, 2, or 1');
    if (!screen.container || typeof screen.container !== 'object') errors.push('container is required');
    else {
      if (!Number.isInteger(screen.container.widthPercent) || screen.container.widthPercent < 40 || screen.container.widthPercent > 100) errors.push('invalid container widthPercent');
      if (!Number.isInteger(screen.container.maxWidthPx) || screen.container.maxWidthPx < 640 || screen.container.maxWidthPx > 3000) errors.push('invalid container maxWidthPx');
      if (!['left', 'center'].includes(screen.container.align)) errors.push('invalid container align');
      if (!Number.isInteger(screen.container.columnGapPx) || screen.container.columnGapPx < 0 || screen.container.columnGapPx > 40) errors.push('invalid container columnGapPx');
      if (!Number.isInteger(screen.container.rowGapPx) || screen.container.rowGapPx < 0 || screen.container.rowGapPx > 40) errors.push('invalid container rowGapPx');
      if (typeof screen.container.showGrid !== 'boolean') errors.push('invalid container showGrid');
    }
    const baseline = baselineElementMap(expectedId);
    const flattened = flattenElements(screen);
    const ids = flattened.map(function (entry) { return entry.element.id; });
    const expectedIds = Object.keys(baseline);
    if (new Set(ids).size !== ids.length) errors.push('duplicate element id');
    if (ids.length !== expectedIds.length || expectedIds.some(function (id) { return !ids.includes(id); })) errors.push('element ids do not match baseline');
    flattened.forEach(function (entry) {
      const item = entry.element;
      if (!Number.isInteger(item.order) || item.order < 1) errors.push(item.id + ': invalid order');
      if (!Number.isInteger(item.colStart) || item.colStart < 1 || item.colStart > screen.gridColumns) errors.push(item.id + ': invalid colStart');
      if (!Number.isInteger(item.colSpan) || item.colSpan < 1 || item.colSpan > screen.gridColumns) errors.push(item.id + ': invalid colSpan');
      if (item.colStart + item.colSpan - 1 > screen.gridColumns) errors.push(item.id + ': grid overflow');
      if (typeof item.breakBefore !== 'boolean') errors.push(item.id + ': invalid breakBefore');
      if (!Number.isInteger(item.heightPx) || item.heightPx < 32 || item.heightPx > 760) errors.push(item.id + ': invalid heightPx');
      ['xOffsetPx', 'yOffsetPx', 'widthAdjustPx'].forEach(function (key) {
        const limit = key === 'widthAdjustPx' ? WIDTH_ADJUST_LIMIT : OFFSET_LIMIT;
        if (!Number.isInteger(item[key]) || Math.abs(item[key]) > limit || item[key] % screen.microSnapPx !== 0) errors.push(item.id + ': invalid ' + key);
      });
    });
    return { valid: errors.length === 0, errors: errors };
  }

  function validateProject(project) {
    const errors = [];
    if (!project || typeof project !== 'object') return { valid: false, errors: ['project object is required'] };
    if (project.projectSpecVersion !== PROJECT_SPEC_VERSION) errors.push('projectSpecVersion must be 1');
    if (!project.screens || typeof project.screens !== 'object') errors.push('screens are required');
    const keys = project.screens ? Object.keys(project.screens) : [];
    if (keys.length !== screens.SCREEN_IDS.length || screens.SCREEN_IDS.some(function (id) { return !keys.includes(id); })) errors.push('seven exact screen ids are required');
    if (!project.shared || typeof project.shared !== 'object') errors.push('shared settings are required');
    else {
      const shared = project.shared;
      if (!Number.isInteger(shared.pageWidthPercent) || shared.pageWidthPercent < 50 || shared.pageWidthPercent > 100) errors.push('invalid shared pageWidthPercent');
      if (!Number.isInteger(shared.pageMaxWidthPx) || shared.pageMaxWidthPx < 960 || shared.pageMaxWidthPx > 3000) errors.push('invalid shared pageMaxWidthPx');
      if (!['left', 'center'].includes(shared.pageAlign)) errors.push('invalid shared pageAlign');
      if (!Number.isInteger(shared.sidebarWidthPx) || shared.sidebarWidthPx < 190 || shared.sidebarWidthPx > 360) errors.push('invalid shared sidebarWidthPx');
      if (!Number.isInteger(shared.cardRadiusPx) || shared.cardRadiusPx < 0 || shared.cardRadiusPx > 32) errors.push('invalid shared cardRadiusPx');
      if (!Number.isInteger(shared.blockGapPx) || shared.blockGapPx < 0 || shared.blockGapPx > 32) errors.push('invalid shared blockGapPx');
      if (!Number.isInteger(shared.controlHeightPx) || shared.controlHeightPx < 32 || shared.controlHeightPx > 56) errors.push('invalid shared controlHeightPx');
    }
    screens.SCREEN_IDS.forEach(function (screenId) {
      if (!project.screens || !project.screens[screenId]) return;
      const validation = validateScreen(project.screens[screenId], screenId);
      validation.errors.forEach(function (error) { errors.push(screenId + ': ' + error); });
    });
    return { valid: errors.length === 0, errors: errors };
  }

  function parseProjectJson(text) {
    let parsed;
    try { parsed = JSON.parse(text); } catch (error) { throw new Error('Project JSONを解析できません。'); }
    const validation = validateProject(parsed);
    if (!validation.valid) throw new Error('Project JSONが無効です: ' + validation.errors.join(' / '));
    const normalized = normalizeProject(parsed);
    const normalizedValidation = validateProject(normalized);
    if (!normalizedValidation.valid) throw new Error('Project JSONを正規化できません。');
    return normalized;
  }

  function parseScreenJson(text) {
    let parsed;
    try { parsed = JSON.parse(text); } catch (error) { throw new Error('Screen JSONを解析できません。'); }
    if (!parsed || !definitionsSafeScreenId(parsed.id)) throw new Error('Screen JSONのscreen idが無効です。');
    const validation = validateScreen(parsed, parsed.id);
    if (!validation.valid) throw new Error('Screen JSONが無効です: ' + validation.errors.join(' / '));
    return normalizeScreen(parsed, parsed.id);
  }

  function definitionsSafeScreenId(screenId) {
    return screens.SCREEN_IDS.includes(screenId);
  }

  function promoteLegacyMeeting(layout) {
    const parsed = legacyModel.normalizeLayout(layout);
    const targetColumns = 24;
    const factor = targetColumns / parsed.container.gridColumns;
    const project = createDefaultProject();
    const meeting = project.screens['meeting-create'];
    meeting.presetOrigin = 'legacy-' + parsed.presetOrigin;
    meeting.container = clone(parsed.container);
    meeting.container.gridColumns = undefined;
    meeting.container.maxWidthPx = parsed.container.maxWidthPx || 2000;
    meeting.gridColumns = targetColumns;
    meeting.microSnapPx = 4;
    const incomingById = {};
    parsed.fields.forEach(function (field) { incomingById[field.id] = field; });
    meeting.blocks.forEach(function (blockItem) {
      const field = incomingById[blockItem.id];
      if (!field) return;
      blockItem.order = field.order;
      blockItem.visible = field.visible;
      blockItem.colStart = (field.colStart - 1) * factor + 1;
      blockItem.colSpan = field.colSpan * factor;
      blockItem.breakBefore = field.breakBefore;
      blockItem.topGapPx = field.topGapPx;
      blockItem.heightPx = field.heightPx;
      blockItem.xOffsetPx = 0;
      blockItem.yOffsetPx = 0;
      blockItem.widthAdjustPx = 0;
    });
    return normalizeProject(project);
  }

  function parseImportJson(text) {
    let parsed;
    try { parsed = JSON.parse(text); } catch (error) { throw new Error('JSONを解析できません。'); }
    if (parsed && parsed.projectSpecVersion === PROJECT_SPEC_VERSION) return { kind: 'project', project: parseProjectJson(text) };
    if (parsed && parsed.screenSpecVersion === SCREEN_SPEC_VERSION && definitionsSafeScreenId(parsed.id)) return { kind: 'screen', screen: parseScreenJson(text) };
    if (parsed && (parsed.specVersion === 1 || parsed.specVersion === 2) && parsed.screen === 'meeting-create') {
      return { kind: 'legacy-meeting', project: promoteLegacyMeeting(legacyModel.parseLayoutJson(text)) };
    }
    throw new Error('対応していないJSONです。projectSpecVersion 1、またはMeeting specVersion 1/2を選択してください。');
  }

  function findElement(screen, elementId) {
    let found = null;
    function visit(items, parent) {
      items.some(function (item) {
        if (item.id === elementId) { found = { element: item, parent: parent || null, collection: items }; return true; }
        return visit(item.children || [], item);
      });
      return Boolean(found);
    }
    visit(screen.blocks, null);
    return found;
  }

  function updateElement(project, screenId, elementId, patch) {
    const next = clone(project);
    const screen = next.screens[screenId];
    const found = screen && findElement(screen, elementId);
    if (!found) throw new Error('Unknown element: ' + elementId);
    Object.keys(patch || {}).forEach(function (key) {
      if (!['id', 'label', 'kind', 'role', 'children'].includes(key)) found.element[key] = patch[key];
    });
    if (Object.prototype.hasOwnProperty.call(patch || {}, 'order')) {
      found.collection.sort(function (first, second) {
        if (first.id === elementId && second.order === found.element.order) return -1;
        if (second.id === elementId && first.order === found.element.order) return 1;
        return first.order - second.order;
      });
      found.collection.forEach(function (item, index) { item.order = index + 1; });
    }
    return normalizeProject(next);
  }

  function updateScreen(project, screenId, patch) {
    const next = clone(project);
    if (!next.screens[screenId]) throw new Error('Unknown screen: ' + screenId);
    Object.keys(patch || {}).forEach(function (key) {
      if (key === 'container') next.screens[screenId].container = Object.assign({}, next.screens[screenId].container, patch.container);
      else next.screens[screenId][key] = patch[key];
    });
    return normalizeProject(next);
  }

  function updateShared(project, patch) {
    const next = clone(project);
    next.shared = Object.assign({}, next.shared, patch || {});
    return normalizeProject(next);
  }

  function convertElementGrid(item, fromColumns, toColumns) {
    const ratio = toColumns / fromColumns;
    item.colStart = clamp(Math.round((item.colStart - 1) * ratio) + 1, 1, toColumns);
    item.colSpan = clamp(Math.round(item.colSpan * ratio), 1, toColumns - item.colStart + 1);
    (item.children || []).forEach(function (childItem) { convertElementGrid(childItem, fromColumns, toColumns); });
  }

  function convertScreenGrid(project, screenId, toColumns) {
    if (!GRID_COLUMNS.includes(Number(toColumns))) throw new Error('Unsupported grid precision');
    const next = clone(project);
    const screen = next.screens[screenId];
    const fromColumns = screen.gridColumns;
    if (fromColumns === toColumns) return next;
    screen.blocks.forEach(function (item) { convertElementGrid(item, fromColumns, Number(toColumns)); });
    screen.gridColumns = Number(toColumns);
    return normalizeProject(next);
  }

  function setMicroSnap(project, screenId, microSnapPx) {
    if (!MICRO_SNAPS.includes(Number(microSnapPx))) throw new Error('Unsupported micro snap');
    const next = clone(project);
    next.screens[screenId].microSnapPx = Number(microSnapPx);
    return normalizeProject(next);
  }

  function rowPlacements(items) {
    const visible = (items || []).filter(function (item) { return item.visible; }).sort(function (a, b) { return a.order - b.order; });
    let row = 1;
    return visible.map(function (item, index) {
      if (index > 0 && item.breakBefore) row += 1;
      return { id: item.id, row: row, colStart: item.colStart, colSpan: item.colSpan, element: item };
    });
  }

  function detectCollisionsForItems(items) {
    const placements = rowPlacements(items);
    const collisions = [];
    for (let first = 0; first < placements.length; first += 1) {
      for (let second = first + 1; second < placements.length; second += 1) {
        const a = placements[first];
        const b = placements[second];
        if (a.row !== b.row) continue;
        const overlap = a.colStart <= b.colStart + b.colSpan - 1 && b.colStart <= a.colStart + a.colSpan - 1;
        if (overlap) collisions.push({ firstId: a.id, secondId: b.id, row: a.row });
      }
    }
    return collisions;
  }

  function detectScreenCollisions(screen) {
    const collisions = detectCollisionsForItems(screen.blocks).map(function (item) { return Object.assign({ parentId: null }, item); });
    screen.blocks.forEach(function (blockItem) {
      detectCollisionsForItems(blockItem.children || []).forEach(function (item) { collisions.push(Object.assign({ parentId: blockItem.id }, item)); });
    });
    return collisions;
  }

  function resolveElementCollision(project, screenId, elementId) {
    let next = clone(project);
    const screen = next.screens[screenId];
    const found = findElement(screen, elementId);
    if (!found) return next;
    const collisions = detectCollisionsForItems(found.collection).filter(function (item) { return item.firstId === elementId || item.secondId === elementId; });
    if (collisions.length) found.element.breakBefore = true;
    return normalizeProject(next);
  }

  function calculateDirectPlacement(element, pointerX, gridLeft, gridWidth, columns, microSnap) {
    const columnWidth = gridWidth / columns;
    const raw = clamp(pointerX - gridLeft, 0, Math.max(0, gridWidth - 1));
    const zeroColumn = clamp(Math.floor(raw / columnWidth), 0, columns - element.colSpan);
    const macroX = zeroColumn * columnWidth;
    return {
      colStart: zeroColumn + 1,
      xOffsetPx: clamp(snap(raw - macroX, microSnap), -OFFSET_LIMIT, OFFSET_LIMIT)
    };
  }

  function calculateResizePatch(element, direction, deltaX, deltaY, columnWidth, microSnap, columns) {
    const patch = {};
    const east = direction.includes('e');
    const west = direction.includes('w');
    const north = direction.includes('n');
    const south = direction.includes('s');
    if (east || west) {
      const signedDelta = east ? deltaX : -deltaX;
      const totalWidth = element.colSpan * columnWidth + element.widthAdjustPx + signedDelta;
      let span = clamp(Math.round(totalWidth / columnWidth), 1, columns);
      let start = element.colStart;
      if (west) start = element.colStart + element.colSpan - span;
      start = clamp(start, 1, columns - span + 1);
      span = clamp(span, 1, columns - start + 1);
      patch.colStart = start;
      patch.colSpan = span;
      patch.widthAdjustPx = clamp(snap(totalWidth - span * columnWidth, microSnap), -WIDTH_ADJUST_LIMIT, WIDTH_ADJUST_LIMIT);
      if (west) patch.xOffsetPx = clamp(snap(element.xOffsetPx + deltaX, microSnap), -OFFSET_LIMIT, OFFSET_LIMIT);
    }
    if (south) patch.heightPx = clamp(snap(element.heightPx + deltaY, microSnap), 32, 760);
    if (north) {
      const height = clamp(snap(element.heightPx - deltaY, microSnap), 32, 760);
      patch.heightPx = height;
      patch.yOffsetPx = clamp(snap(element.yOffsetPx + deltaY, microSnap), -OFFSET_LIMIT, OFFSET_LIMIT);
    }
    return patch;
  }

  function nudgeElement(project, screenId, elementId, direction, large) {
    const screen = project.screens[screenId];
    const found = findElement(screen, elementId);
    if (!found) return clone(project);
    const amount = screen.microSnapPx * (large ? 4 : 1);
    const patch = {};
    if (direction === 'left') patch.xOffsetPx = found.element.xOffsetPx - amount;
    if (direction === 'right') patch.xOffsetPx = found.element.xOffsetPx + amount;
    if (direction === 'up') patch.yOffsetPx = found.element.yOffsetPx - amount;
    if (direction === 'down') patch.yOffsetPx = found.element.yOffsetPx + amount;
    return updateElement(project, screenId, elementId, patch);
  }

  function applyPreset(project, presetId) {
    if (!PRESETS[presetId]) throw new Error('Unknown preset: ' + presetId);
    let next = clone(project);
    screens.SCREEN_IDS.forEach(function (screenId) {
      const screen = next.screens[screenId];
      screen.presetOrigin = presetId;
      if (presetId === 'current-production-v10') {
        next.screens[screenId] = createDefaultProject().screens[screenId];
      } else if (presetId === 'compact-institutional') {
        screen.container.rowGapPx = 10;
        screen.container.columnGapPx = 10;
        screen.blocks.forEach(function (item) { item.topGapPx = 0; item.yOffsetPx = 0; });
      } else if (presetId === 'balanced-professional') {
        screen.container.rowGapPx = 18;
        screen.container.columnGapPx = 18;
      } else if (presetId === 'memo-data-focus') {
        screen.blocks.forEach(function (item) {
          if (['textarea', 'table', 'chart', 'result', 'summary'].includes(item.kind)) item.heightPx = clamp(item.heightPx + 96, 32, 760);
        });
      }
    });
    return normalizeProject(next);
  }

  function lintScreen(screen) {
    const warnings = [];
    detectScreenCollisions(screen).forEach(function (collision) {
      warnings.push({ code: 'COLLISION', message: collision.firstId + ' と ' + collision.secondId + ' が重なっています。' });
    });
    flattenElements(screen).forEach(function (entry) {
      const item = entry.element;
      if (Math.abs(item.xOffsetPx) >= 48 || Math.abs(item.yOffsetPx) >= 48 || Math.abs(item.widthAdjustPx) >= 72) warnings.push({ code: 'LARGE_MICRO_OFFSET', message: item.id + ' のmicro調整が大きいためmacro gridへの吸収を検討してください。' });
      if (item.colSpan <= Math.max(1, Math.floor(screen.gridColumns / 12))) warnings.push({ code: 'NARROW_BLOCK', message: item.id + ' は狭い可能性があります。' });
      if (item.topGapPx > 80) warnings.push({ code: 'EXCESSIVE_GAP', message: item.id + ' のtop gapが大きいです。' });
    });
    if (screen.gridColumns === 48 && screen.microSnapPx === 1) warnings.push({ code: 'MOBILE_RISK', message: '高精度調整はMobile projectionでも確認してください。' });
    return warnings;
  }

  function lintProject(project) {
    const warnings = [];
    if (project.shared.pageMaxWidthPx > 2400) warnings.push({ code: 'PROJECT_MAX_WIDTH', message: '共通max-widthが広すぎる可能性があります。' });
    if (project.shared.controlHeightPx < 36) warnings.push({ code: 'CONTROL_HEIGHT_DRIFT', message: '共通control heightが小さすぎます。' });
    screens.SCREEN_IDS.forEach(function (id) {
      lintScreen(project.screens[id]).forEach(function (item) { warnings.push(Object.assign({ screenId: id }, item)); });
    });
    return warnings;
  }

  function createHistory(initial, maximum) {
    let current = normalizeProject(initial);
    let past = [];
    let future = [];
    let clean = clone(current);
    const limit = maximum || HISTORY_LIMIT;
    return {
      current: function () { return clone(current); },
      record: function (next) {
        const normalized = normalizeProject(next);
        if (stableStringify(normalized) === stableStringify(current)) return clone(current);
        past.push(clone(current));
        if (past.length > limit) past = past.slice(past.length - limit);
        current = normalized;
        future = [];
        return clone(current);
      },
      undo: function () { if (!past.length) return clone(current); future.unshift(clone(current)); current = past.pop(); return clone(current); },
      redo: function () { if (!future.length) return clone(current); past.push(clone(current)); current = future.shift(); return clone(current); },
      reset: function (next) { current = normalizeProject(next || createDefaultProject()); past = []; future = []; return clone(current); },
      markClean: function () { clean = clone(current); return clone(clean); },
      canUndo: function () { return past.length > 0; },
      canRedo: function () { return future.length > 0; },
      counts: function () { return { undo: past.length, redo: future.length }; },
      dirtyScreens: function () {
        return screens.SCREEN_IDS.filter(function (id) { return stableStringify(current.screens[id]) !== stableStringify(clean.screens[id]); });
      },
      sharedDirty: function () { return stableStringify(current.shared) !== stableStringify(clean.shared); }
    };
  }

  function screenExport(project, screenId) {
    if (!project.screens[screenId]) throw new Error('Unknown screen: ' + screenId);
    return stableStringify(project.screens[screenId]);
  }

  function createScreenHandoff(project, screenId) {
    const screen = project.screens[screenId];
    const definition = screens.getScreenDefinition(screenId);
    const lines = [
      '# Knowledge Sharing Platforms UI Studio handoff', '',
      '- Baseline: `' + project.baseline + '`',
      '- Screen: `' + screenId + '` / ' + definition.label,
      '- Macro grid: `' + screen.gridColumns + ' columns`',
      '- Micro snap: `' + screen.microSnapPx + 'px`',
      '- Shared shell: width ' + project.shared.pageWidthPercent + '%, max ' + project.shared.pageMaxWidthPx + 'px, sidebar ' + project.shared.sidebarWidthPx + 'px',
      '- Viewport intent: Desktopではcanonical placementを維持し、720px以下のみ1-column visual projection。preview切替ではspecをmutationしない。',
      '', '## Blocks', ''
    ];
    flattenElements(screen).forEach(function (entry) {
      const item = entry.element;
      lines.push('- `' + item.id + '`' + (entry.parentId ? ' (child of `' + entry.parentId + '`)' : '') + ': order ' + item.order + ', start ' + item.colStart + ', span ' + item.colSpan + '/' + screen.gridColumns + ', height ' + item.heightPx + 'px, x ' + item.xOffsetPx + 'px, y ' + item.yOffsetPx + 'px, width adjust ' + item.widthAdjustPx + 'px, break ' + (item.breakBefore ? 'yes' : 'no') + ', visible ' + (item.visible ? 'yes' : 'no'));
    });
    lines.push('', '## Boundary', '', 'visual/layout変更のみ。各screenは個別にreviewし、同時deploymentを意味しない。business logic、schema、migration、security、provider behaviorを変更しない。', '', '## Canonical screen JSON', '', '```json', screenExport(project, screenId).trimEnd(), '```', '');
    return lines.join('\n');
  }

  function createProjectHandoff(project) {
    const lines = ['# Knowledge Sharing Platforms Multi-screen UI Studio summary', '', '- Baseline: `' + project.baseline + '`', '- Screens: `7`', '- Shared shell: width ' + project.shared.pageWidthPercent + '%, max ' + project.shared.pageMaxWidthPx + 'px, sidebar ' + project.shared.sidebarWidthPx + 'px', '', '## Screen summary', ''];
    screens.SCREEN_DEFINITIONS.forEach(function (definition) {
      const screen = project.screens[definition.id];
      lines.push('- `' + definition.id + '` ' + definition.label + ': ' + screen.gridColumns + ' columns / ' + screen.microSnapPx + 'px snap / ' + flattenElements(screen).filter(function (entry) { return entry.element.visible; }).length + ' visible elements');
    });
    lines.push('', '## Delivery boundary', '', 'これは7画面のvisual project summaryであり、7画面の同時deploymentを指示しない。screenごとに差分とruntimeを確認し、business logic、schema、migration、security、provider behaviorを変更しない。', '');
    return lines.join('\n');
  }

  function migrateVariantMap(projectVariants, legacyVariants) {
    const result = {};
    Object.keys(projectVariants || {}).sort().forEach(function (name) {
      try {
        const value = typeof projectVariants[name] === 'string' ? projectVariants[name] : JSON.stringify(projectVariants[name]);
        result[name] = stableStringify(parseProjectJson(value));
      } catch (error) { /* invalid entries remain isolated and are not loaded */ }
    });
    Object.keys(legacyVariants || {}).sort().forEach(function (name) {
      let candidate = name;
      while (Object.prototype.hasOwnProperty.call(result, candidate)) candidate = 'Legacy Meeting - ' + candidate;
      try {
        const value = typeof legacyVariants[name] === 'string' ? legacyVariants[name] : JSON.stringify(legacyVariants[name]);
        result[candidate] = stableStringify(parseImportJson(value).project);
      } catch (error) { /* old invalid variants are preserved in their original key */ }
    });
    return result;
  }

  return {
    PROJECT_SPEC_VERSION: PROJECT_SPEC_VERSION,
    SCREEN_SPEC_VERSION: SCREEN_SPEC_VERSION,
    GRID_COLUMNS: GRID_COLUMNS,
    MICRO_SNAPS: MICRO_SNAPS,
    OFFSET_LIMIT: OFFSET_LIMIT,
    WIDTH_ADJUST_LIMIT: WIDTH_ADJUST_LIMIT,
    PROJECT_STORAGE_KEY: PROJECT_STORAGE_KEY,
    LEGACY_STORAGE_KEY: LEGACY_STORAGE_KEY,
    SHARED_DEFAULTS: SHARED_DEFAULTS,
    PRESETS: PRESETS,
    clone: clone,
    snap: snap,
    stableStringify: stableStringify,
    createDefaultProject: createDefaultProject,
    normalizeProject: normalizeProject,
    normalizeScreen: normalizeScreen,
    validateScreen: validateScreen,
    validateProject: validateProject,
    parseProjectJson: parseProjectJson,
    parseScreenJson: parseScreenJson,
    parseImportJson: parseImportJson,
    promoteLegacyMeeting: promoteLegacyMeeting,
    flattenElements: flattenElements,
    findElement: findElement,
    updateElement: updateElement,
    updateScreen: updateScreen,
    updateShared: updateShared,
    convertScreenGrid: convertScreenGrid,
    setMicroSnap: setMicroSnap,
    rowPlacements: rowPlacements,
    detectScreenCollisions: detectScreenCollisions,
    resolveElementCollision: resolveElementCollision,
    calculateDirectPlacement: calculateDirectPlacement,
    calculateResizePatch: calculateResizePatch,
    nudgeElement: nudgeElement,
    applyPreset: applyPreset,
    lintScreen: lintScreen,
    lintProject: lintProject,
    createHistory: createHistory,
    screenExport: screenExport,
    createScreenHandoff: createScreenHandoff,
    createProjectHandoff: createProjectHandoff,
    migrateVariantMap: migrateVariantMap
  };
});
