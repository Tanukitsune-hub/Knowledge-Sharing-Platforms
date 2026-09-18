(function (root, factory) {
  const presets = typeof module === 'object' && module.exports ? require('./presets.js') : root.LayoutLabPresets;
  const api = factory(presets);
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.LayoutLabModel = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function (presets) {
  'use strict';

  const VALID_ALIGNS = ['left', 'center'];
  const VALID_GRID_COLUMNS = [12, 24];
  const REQUIRED_IDS = presets.FIELD_DEFINITIONS.map(function (field) { return field.id; });
  const REQUIRED_ID_SET = new Set(REQUIRED_IDS);
  const MAX_TOP_GAP = 160;
  const HEIGHT_LIMITS = Object.freeze({
    metadata: Object.freeze({ min: 34, max: 180 }),
    identity: Object.freeze({ min: 34, max: 220 }),
    participant: Object.freeze({ min: 34, max: 260 }),
    group: Object.freeze({ min: 44, max: 300 }),
    notes: Object.freeze({ min: 180, max: 720 }),
    attachment: Object.freeze({ min: 130, max: 720 })
  });

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function clamp(value, minimum, maximum) {
    return Math.min(maximum, Math.max(minimum, value));
  }

  function finiteInteger(value, fallback) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? Math.round(parsed) : fallback;
  }

  function heightLimitsForRole(role) {
    return HEIGHT_LIMITS[role] || HEIGHT_LIMITS.metadata;
  }

  function defaultHeightForRole(role) {
    return presets.DEFAULT_HEIGHTS[role] || presets.DEFAULT_HEIGHTS.metadata;
  }

  function normalizeViewport(input) {
    let viewportId = 'wide';
    if (typeof input === 'string' && presets.VIEWPORTS[input]) viewportId = input;
    else if (input && presets.VIEWPORTS[input.id]) viewportId = input.id;
    return { id: viewportId, widthPx: presets.VIEWPORTS[viewportId].widthPx };
  }

  function normalizeFieldV2(item, index, gridColumns) {
    const definition = presets.fieldDefinitionById[item.id];
    const role = definition ? definition.role : item.role;
    const limits = heightLimitsForRole(role);
    const colSpan = clamp(finiteInteger(item.colSpan, 1), 1, gridColumns);
    const colStart = clamp(finiteInteger(item.colStart, 1), 1, gridColumns - colSpan + 1);
    return {
      id: item.id,
      order: index + 1,
      visible: item.visible !== false,
      colStart: colStart,
      colSpan: colSpan,
      breakBefore: item.breakBefore === true,
      topGapPx: clamp(finiteInteger(item.topGapPx, 0), 0, MAX_TOP_GAP),
      heightPx: clamp(finiteInteger(item.heightPx, defaultHeightForRole(role)), limits.min, limits.max),
      role: role
    };
  }

  function structuralNormalizeV2(input) {
    const source = input || {};
    const containerSource = source.container || {};
    const gridColumns = VALID_GRID_COLUMNS.includes(Number(containerSource.gridColumns)) ? Number(containerSource.gridColumns) : 12;
    const maxWidthValue = containerSource.maxWidthPx;
    return {
      specVersion: presets.SPEC_VERSION,
      screen: presets.SCREEN,
      baseline: presets.BASELINE,
      presetOrigin: typeof source.presetOrigin === 'string' && source.presetOrigin.trim() ? source.presetOrigin.trim() : 'custom',
      viewport: normalizeViewport(source.viewport),
      container: {
        gridColumns: gridColumns,
        widthPercent: clamp(finiteInteger(containerSource.widthPercent, 68), 40, 100),
        maxWidthPx: maxWidthValue === null || maxWidthValue === '' || maxWidthValue === undefined ? null : clamp(finiteInteger(maxWidthValue, 1680), 640, 3000),
        align: VALID_ALIGNS.includes(containerSource.align) ? containerSource.align : 'left',
        columnGapPx: clamp(finiteInteger(containerSource.columnGapPx, 16), 0, 40),
        rowGapPx: clamp(finiteInteger(containerSource.rowGapPx, 16), 0, 40),
        showGrid: containerSource.showGrid !== false
      },
      fields: Array.isArray(source.fields) ? source.fields.map(function (field, index) {
        return normalizeFieldV2(field, index, gridColumns);
      }) : []
    };
  }

  function intervalsOverlap(first, second) {
    const firstEnd = first.colStart + first.colSpan - 1;
    const secondEnd = second.colStart + second.colSpan - 1;
    return first.colStart <= secondEnd && second.colStart <= firstEnd;
  }

  function detectCollisions(input) {
    const layout = input.specVersion === 2 ? structuralNormalizeV2(input) : migrateV1(input, false);
    const collisions = [];
    let row = 1;
    let occupied = [];
    layout.fields.forEach(function (field) {
      if (!field.visible) return;
      if (field.breakBefore && occupied.length) {
        row += 1;
        occupied = [];
      }
      occupied.forEach(function (other) {
        if (intervalsOverlap(field, other)) collisions.push({ row: row, firstId: other.id, secondId: field.id });
      });
      occupied.push(field);
    });
    return collisions;
  }

  function resolveCollisions(input) {
    const layout = clone(input);
    let occupied = [];
    layout.fields.forEach(function (field) {
      if (!field.visible) return;
      if (field.breakBefore && occupied.length) occupied = [];
      if (occupied.some(function (other) { return intervalsOverlap(field, other); })) {
        field.breakBefore = true;
        occupied = [];
      }
      occupied.push(field);
    });
    return layout;
  }

  function getFieldRows(input) {
    const layout = normalizeLayout(input);
    const placements = [];
    let row = 1;
    let occupied = [];
    layout.fields.forEach(function (field) {
      if (!field.visible) return;
      if (field.breakBefore && occupied.length) {
        row += 1;
        occupied = [];
      }
      if (occupied.some(function (other) { return intervalsOverlap(field, other); })) {
        row += 1;
        occupied = [];
      }
      placements.push({ id: field.id, row: row, colStart: field.colStart, colSpan: field.colSpan });
      occupied.push(field);
    });
    return placements;
  }

  function migrateV1(input, resolve) {
    const source = clone(input || {});
    const gridColumns = 12;
    let cursor = 1;
    let nextBreak = false;
    const fields = (source.fields || []).map(function (item, index) {
      const definition = presets.fieldDefinitionById[item.id];
      const role = definition ? definition.role : item.role;
      let colSpan = clamp(finiteInteger(item.colSpan, 1), 1, gridColumns);
      let breakBefore = nextBreak;
      if (!breakBefore && cursor + colSpan - 1 > gridColumns) {
        cursor = 1;
        breakBefore = true;
      }
      const migrated = {
        id: item.id,
        order: index + 1,
        visible: item.visible !== false,
        colStart: cursor,
        colSpan: colSpan,
        breakBefore: breakBefore,
        topGapPx: 0,
        heightPx: item.heightPx === undefined ? defaultHeightForRole(role) : item.heightPx,
        role: role
      };
      cursor += colSpan;
      nextBreak = cursor > gridColumns;
      if (nextBreak) cursor = 1;
      return migrated;
    });
    const migrated = structuralNormalizeV2({
      specVersion: 2,
      screen: source.screen,
      baseline: source.baseline,
      presetOrigin: source.presetOrigin || 'migrated-v1',
      viewport: source.viewport,
      container: Object.assign({}, source.container, { gridColumns: gridColumns }),
      fields: fields
    });
    return resolve === false ? migrated : resolveCollisions(migrated);
  }

  function normalizeLayout(input) {
    if (input && input.specVersion === 1) return migrateV1(input, true);
    return resolveCollisions(structuralNormalizeV2(input));
  }

  function validateFieldSet(fields, errors) {
    const ids = fields.map(function (field) { return field && field.id; });
    const uniqueIds = new Set(ids);
    if (ids.length !== REQUIRED_IDS.length || uniqueIds.size !== REQUIRED_IDS.length || REQUIRED_IDS.some(function (id) { return !uniqueIds.has(id); })) {
      errors.push('fields must contain each canonical field ID exactly once.');
    }
  }

  function validateV1(candidate) {
    const errors = [];
    if (!candidate || typeof candidate !== 'object' || Array.isArray(candidate)) return { valid: false, errors: ['JSON root must be an object.'] };
    if (candidate.specVersion !== 1) errors.push('specVersion must be 1.');
    if (candidate.screen !== presets.SCREEN) errors.push('screen must be meeting-create.');
    if (candidate.baseline !== presets.BASELINE) errors.push('baseline must be work0032-version8.');
    if (!candidate.container || typeof candidate.container !== 'object') errors.push('container is required.');
    if (!Array.isArray(candidate.fields)) errors.push('fields must be an array.');
    else {
      validateFieldSet(candidate.fields, errors);
      candidate.fields.forEach(function (field, index) {
        if (!field || typeof field !== 'object') return errors.push('fields[' + index + '] must be an object.');
        if (!Number.isInteger(field.colSpan) || field.colSpan < 1 || field.colSpan > 12) errors.push(field.id + '.colSpan must be an integer from 1 to 12.');
        if (field.visible !== undefined && typeof field.visible !== 'boolean') errors.push(field.id + '.visible must be boolean.');
      });
    }
    return { valid: errors.length === 0, errors: errors };
  }

  function validateLayout(candidate) {
    const errors = [];
    if (!candidate || typeof candidate !== 'object' || Array.isArray(candidate)) return { valid: false, errors: ['JSON root must be an object.'] };
    if (candidate.specVersion !== presets.SPEC_VERSION) errors.push('specVersion must be 2.');
    if (candidate.screen !== presets.SCREEN) errors.push('screen must be meeting-create.');
    if (candidate.baseline !== presets.BASELINE) errors.push('baseline must be work0032-version8.');
    if (!candidate.viewport || !presets.VIEWPORTS[candidate.viewport.id]) errors.push('viewport.id is not supported.');
    if (!candidate.container || typeof candidate.container !== 'object') errors.push('container is required.');
    else {
      const container = candidate.container;
      if (!VALID_GRID_COLUMNS.includes(container.gridColumns)) errors.push('container.gridColumns must be 12 or 24.');
      if (!Number.isInteger(container.widthPercent) || container.widthPercent < 40 || container.widthPercent > 100) errors.push('container.widthPercent must be an integer from 40 to 100.');
      if (container.maxWidthPx !== null && (!Number.isInteger(container.maxWidthPx) || container.maxWidthPx < 640 || container.maxWidthPx > 3000)) errors.push('container.maxWidthPx must be null or an integer from 640 to 3000.');
      if (!VALID_ALIGNS.includes(container.align)) errors.push('container.align must be left or center.');
      ['columnGapPx', 'rowGapPx'].forEach(function (key) {
        if (!Number.isInteger(container[key]) || container[key] < 0 || container[key] > 40) errors.push('container.' + key + ' must be an integer from 0 to 40.');
      });
      if (typeof container.showGrid !== 'boolean') errors.push('container.showGrid must be boolean.');
    }
    if (!Array.isArray(candidate.fields)) errors.push('fields must be an array.');
    else {
      validateFieldSet(candidate.fields, errors);
      const gridColumns = candidate.container && VALID_GRID_COLUMNS.includes(candidate.container.gridColumns) ? candidate.container.gridColumns : 12;
      candidate.fields.forEach(function (field, index) {
        if (!field || typeof field !== 'object') return errors.push('fields[' + index + '] must be an object.');
        if (!REQUIRED_ID_SET.has(field.id)) errors.push('Unknown field ID: ' + String(field.id));
        if (field.order !== index + 1) errors.push('Field order must be sequential and match array order.');
        if (typeof field.visible !== 'boolean') errors.push(field.id + '.visible must be boolean.');
        if (!Number.isInteger(field.colStart) || field.colStart < 1 || field.colStart > gridColumns) errors.push(field.id + '.colStart is outside the grid.');
        if (!Number.isInteger(field.colSpan) || field.colSpan < 1 || field.colSpan > gridColumns) errors.push(field.id + '.colSpan is outside the grid.');
        if (Number.isInteger(field.colStart) && Number.isInteger(field.colSpan) && field.colStart + field.colSpan - 1 > gridColumns) errors.push(field.id + ' overflows the grid.');
        if (typeof field.breakBefore !== 'boolean') errors.push(field.id + '.breakBefore must be boolean.');
        if (!Number.isInteger(field.topGapPx) || field.topGapPx < 0 || field.topGapPx > MAX_TOP_GAP) errors.push(field.id + '.topGapPx must be an integer from 0 to ' + MAX_TOP_GAP + '.');
        const definition = presets.fieldDefinitionById[field.id];
        if (definition && field.role !== definition.role) errors.push(field.id + '.role does not match the canonical role.');
        if (definition) {
          const limits = heightLimitsForRole(definition.role);
          if (!Number.isInteger(field.heightPx) || field.heightPx < limits.min || field.heightPx > limits.max) errors.push(field.id + '.heightPx is outside the safe role range.');
        }
      });
      detectCollisions(candidate).forEach(function (collision) {
        errors.push('Collision on row ' + collision.row + ': ' + collision.firstId + ' / ' + collision.secondId + '.');
      });
    }
    return { valid: errors.length === 0, errors: errors };
  }

  function stableStringify(layout) {
    return JSON.stringify(normalizeLayout(layout), null, 2) + '\n';
  }

  function parseLayoutJson(text) {
    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch (error) {
      throw new Error('JSONを解析できません: ' + error.message);
    }
    if (parsed.specVersion === 1) {
      const legacyResult = validateV1(parsed);
      if (!legacyResult.valid) throw new Error('Layout JSON v1が不正です: ' + legacyResult.errors.join(' '));
      return migrateV1(parsed, true);
    }
    const result = validateLayout(parsed);
    if (!result.valid) throw new Error('Layout JSON v2が不正です: ' + result.errors.join(' '));
    return normalizeLayout(parsed);
  }

  function reorderField(layout, movedId, targetId) {
    const normalized = normalizeLayout(layout);
    const target = normalized.fields.find(function (field) { return field.id === targetId; });
    const moved = normalized.fields.find(function (field) { return field.id === movedId; });
    if (!target || !moved || target.id === moved.id) return normalized;
    return placeField(normalized, movedId, {
      order: target.order,
      colStart: moved.colStart,
      breakBefore: moved.breakBefore
    });
  }

  function buildRawPlacement(layout, id, placement) {
    const next = normalizeLayout(layout);
    const from = next.fields.findIndex(function (field) { return field.id === id; });
    if (from < 0) throw new Error('Unknown field: ' + id);
    const moved = next.fields.splice(from, 1)[0];
    const requestedOrder = clamp(finiteInteger(placement.order, from + 1), 1, next.fields.length + 1);
    if (placement.colStart !== undefined) moved.colStart = placement.colStart;
    if (placement.colSpan !== undefined) moved.colSpan = placement.colSpan;
    if (placement.breakBefore !== undefined) moved.breakBefore = placement.breakBefore === true;
    if (placement.topGapPx !== undefined) moved.topGapPx = placement.topGapPx;
    next.fields.splice(requestedOrder - 1, 0, moved);
    return structuralNormalizeV2(next);
  }

  function previewPlacement(layout, id, placement) {
    const requested = buildRawPlacement(layout, id, placement);
    const collisions = detectCollisions(requested);
    const resolved = resolveCollisions(requested);
    return { requested: requested, resolved: resolved, collisions: collisions, collisionResolved: collisions.length > 0 };
  }

  function placeField(layout, id, placement) {
    return previewPlacement(layout, id, placement).resolved;
  }

  function updateField(layout, id, patch) {
    const next = normalizeLayout(layout);
    const field = next.fields.find(function (item) { return item.id === id; });
    if (!field) throw new Error('Unknown field: ' + id);
    Object.assign(field, patch);
    return resolveCollisions(structuralNormalizeV2(next));
  }

  function convertGrid(layout, targetColumns) {
    if (!VALID_GRID_COLUMNS.includes(targetColumns)) throw new Error('gridColumns must be 12 or 24.');
    const next = normalizeLayout(layout);
    const sourceColumns = next.container.gridColumns;
    if (sourceColumns === targetColumns) return next;
    next.container.gridColumns = targetColumns;
    next.fields.forEach(function (field) {
      if (sourceColumns === 12 && targetColumns === 24) {
        field.colStart = (field.colStart - 1) * 2 + 1;
        field.colSpan *= 2;
      } else {
        field.colStart = Math.round((field.colStart - 1) / 2) + 1;
        field.colSpan = Math.max(1, Math.round(field.colSpan / 2));
        field.colStart = clamp(field.colStart, 1, targetColumns - field.colSpan + 1);
      }
    });
    return resolveCollisions(structuralNormalizeV2(next));
  }

  function gridConversionLosesFidelity(layout, targetColumns) {
    const normalized = normalizeLayout(layout);
    if (normalized.container.gridColumns !== 24 || targetColumns !== 12) return false;
    return normalized.fields.some(function (field) {
      return (field.colStart - 1) % 2 !== 0 || field.colSpan % 2 !== 0;
    });
  }

  function updateContainer(layout, patch) {
    if (patch.gridColumns !== undefined && patch.gridColumns !== normalizeLayout(layout).container.gridColumns) return convertGrid(layout, Number(patch.gridColumns));
    const next = normalizeLayout(layout);
    Object.assign(next.container, patch);
    return resolveCollisions(structuralNormalizeV2(next));
  }

  function calculateResizePatch(field, direction, deltaColumns, deltaYPx, gridColumns) {
    const dir = String(direction || '').toLowerCase();
    const patch = {
      colStart: field.colStart,
      colSpan: field.colSpan,
      topGapPx: field.topGapPx,
      heightPx: field.heightPx
    };
    const horizontalDelta = finiteInteger(deltaColumns, 0);
    if (dir.includes('e')) patch.colSpan = clamp(field.colSpan + horizontalDelta, 1, gridColumns - field.colStart + 1);
    if (dir.includes('w')) {
      const rightEdge = field.colStart + field.colSpan - 1;
      patch.colStart = clamp(field.colStart + horizontalDelta, 1, rightEdge);
      patch.colSpan = rightEdge - patch.colStart + 1;
    }
    const limits = heightLimitsForRole(field.role);
    const verticalDelta = Math.round(finiteInteger(deltaYPx, 0) / 4) * 4;
    if (dir.includes('s')) patch.heightPx = clamp(field.heightPx + verticalDelta, limits.min, limits.max);
    if (dir.includes('n')) {
      const desiredGap = clamp(field.topGapPx + verticalDelta, 0, MAX_TOP_GAP);
      const desiredHeight = clamp(field.heightPx - (desiredGap - field.topGapPx), limits.min, limits.max);
      const actualDelta = field.heightPx - desiredHeight;
      patch.heightPx = desiredHeight;
      patch.topGapPx = clamp(field.topGapPx + actualDelta, 0, MAX_TOP_GAP);
    }
    return patch;
  }

  function resizeField(layout, id, direction, deltaColumns, deltaYPx) {
    return previewResize(layout, id, direction, deltaColumns, deltaYPx).resolved;
  }

  function previewResize(layout, id, direction, deltaColumns, deltaYPx) {
    const next = normalizeLayout(layout);
    const field = next.fields.find(function (item) { return item.id === id; });
    if (!field) throw new Error('Unknown field: ' + id);
    Object.assign(field, calculateResizePatch(field, direction, deltaColumns, deltaYPx, next.container.gridColumns));
    const requested = structuralNormalizeV2(next);
    const collisions = detectCollisions(requested);
    return { requested: requested, resolved: resolveCollisions(requested), collisions: collisions, collisionResolved: collisions.length > 0 };
  }

  function nudgeField(layout, id, direction, largeStep) {
    const next = normalizeLayout(layout);
    const field = next.fields.find(function (item) { return item.id === id; });
    if (!field) throw new Error('Unknown field: ' + id);
    const horizontalStep = largeStep ? (next.container.gridColumns === 24 ? 4 : 2) : 1;
    const orderStep = largeStep ? 3 : 1;
    if (direction === 'left' || direction === 'right') {
      const delta = direction === 'left' ? -horizontalStep : horizontalStep;
      return updateField(next, id, { colStart: clamp(field.colStart + delta, 1, next.container.gridColumns - field.colSpan + 1) });
    }
    if (direction === 'up' || direction === 'down') {
      const delta = direction === 'up' ? -orderStep : orderStep;
      return placeField(next, id, { order: clamp(field.order + delta, 1, next.fields.length), colStart: field.colStart, breakBefore: field.breakBefore });
    }
    return next;
  }

  function tidyLayout(layout) {
    const next = normalizeLayout(layout);
    const factor = next.container.gridColumns / 12;
    const recommended12 = {
      'meeting-date': 2, 'meeting-time': 2, 'meeting-locationId': 2, 'meeting-counterpartyId': 6,
      'meeting-assetClassId': 3, 'meeting-capitalTypeId': 3, 'meeting-teamId': 2, 'meeting-fundStrategy': 4,
      'meeting-types': 12, 'meeting-counterparty': 6, 'meeting-internalParticipants': 6,
      'meeting-notes': 12, 'attachment-section': 12
    };
    next.container.widthPercent = clamp(finiteInteger(next.container.widthPercent, 68), 55, 76);
    if (next.container.maxWidthPx !== null) next.container.maxWidthPx = clamp(finiteInteger(next.container.maxWidthPx, 1680), 1200, 1800);
    next.container.columnGapPx = 16;
    next.container.rowGapPx = 16;
    let cursor = 1;
    let nextBreak = false;
    next.fields.forEach(function (field) {
      field.colSpan = recommended12[field.id] * factor;
      if (nextBreak || cursor + field.colSpan - 1 > next.container.gridColumns) {
        cursor = 1;
        field.breakBefore = true;
      } else field.breakBefore = false;
      field.colStart = cursor;
      field.topGapPx = 0;
      cursor += field.colSpan;
      nextBreak = cursor > next.container.gridColumns;
      if (nextBreak) cursor = 1;
      if (field.id === 'meeting-notes') field.heightPx = Math.max(320, field.heightPx);
      else if (field.id === 'attachment-section') field.heightPx = Math.max(150, field.heightPx);
      else if (field.role !== 'group' && field.heightPx > 120) field.heightPx = 72;
    });
    return resolveCollisions(structuralNormalizeV2(next));
  }

  function lintLayout(layout) {
    const source = layout || {};
    const sourceColumns = source.container && VALID_GRID_COLUMNS.includes(source.container.gridColumns) ? source.container.gridColumns : 12;
    const raw = layout && layout.specVersion === 1 ? migrateV1(layout, false) : structuralNormalizeV2(layout);
    const spec = normalizeLayout(layout);
    const warnings = [];
    if (Array.isArray(source.fields) && source.fields.some(function (field) {
      return !Number.isInteger(field.colStart) || !Number.isInteger(field.colSpan) || field.colStart < 1 || field.colSpan < 1 || field.colStart + field.colSpan - 1 > sourceColumns;
    })) warnings.push({ code: 'OUT_OF_GRID', message: 'grid外へ出るplacementがあります。safe boundaryへ戻してください。' });
    const collisions = detectCollisions(raw);
    if (collisions.length) warnings.push({ code: 'COLLISION', message: 'field配置が衝突しています。次rowへのdeterministic pushを確認してください。' });
    const viewport = presets.VIEWPORTS[spec.viewport.id];
    const effectivePercent = spec.container.maxWidthPx === null ? spec.container.widthPercent : Math.min(spec.container.widthPercent, spec.container.maxWidthPx / viewport.widthPx * 100);
    if (viewport.widthPx >= 1920 && effectivePercent > 80) warnings.push({ code: 'WIDE_CONTAINER', message: 'Wide desktopでcanvasが80%を超えています。視線移動が長くなる可能性があります。' });
    if (spec.fields.some(function (field) { return field.visible && field.role === 'participant' && field.colSpan < spec.container.gridColumns * 5 / 12; })) warnings.push({ code: 'NARROW_PARTICIPANTS', message: '面談相手・当社側の幅が狭く、入力しにくい可能性があります。' });
    const notes = spec.fields.find(function (field) { return field.id === 'meeting-notes'; });
    if (notes.visible && notes.heightPx < 320) warnings.push({ code: 'SHORT_NOTES', message: '面談内容の高さが320px未満です。メモ入力には少し窮屈です。' });
    if (spec.fields.some(function (field) { return field.visible && !['notes', 'attachment'].includes(field.role) && field.heightPx > 120; })) warnings.push({ code: 'TALL_STANDARD', message: '通常fieldが高く、desktopで縦方向の空白が目立つ可能性があります。' });
    if (spec.fields.some(function (field) { return field.visible && field.topGapPx > 48; })) warnings.push({ code: 'LARGE_TOP_GAP', message: '意図的な縦gapが48pxを超えるfieldがあります。' });
    const rows = getFieldRows(spec);
    const rowStarts = {};
    rows.forEach(function (placement) { rowStarts[placement.row] = Math.min(rowStarts[placement.row] || spec.container.gridColumns, placement.colStart); });
    if (Object.keys(rowStarts).some(function (row) { return rowStarts[row] > spec.container.gridColumns / 4; })) warnings.push({ code: 'LARGE_HORIZONTAL_GAP', message: 'row先頭の水平gapが大きい箇所があります。意図した余白か確認してください。' });
    if (Math.abs(spec.container.columnGapPx - spec.container.rowGapPx) > 10) warnings.push({ code: 'INCONSISTENT_GAPS', message: '横・縦のgap差が大きく、リズムが不揃いに見える可能性があります。' });
    if (gridConversionLosesFidelity(spec, 12)) warnings.push({ code: 'PRECISION_LOSS', message: 'Fine配置に奇数unitがあり、Standardへ戻すと丸めが発生します。' });
    if (!warnings.length) warnings.push({ code: 'CALM', message: '大きな違和感は見つかりません。desktopとmobileの両方で最終確認してください。', tone: 'ok' });
    return warnings;
  }

  function createHistory(initial, limit) {
    const maximum = clamp(finiteInteger(limit, 50), 2, 200);
    let current = normalizeLayout(initial);
    let past = [];
    let future = [];
    return {
      current: function () { return clone(current); },
      record: function (next) {
        const normalized = normalizeLayout(next);
        if (stableStringify(normalized) === stableStringify(current)) return clone(current);
        past.push(clone(current));
        if (past.length > maximum) past = past.slice(past.length - maximum);
        current = normalized;
        future = [];
        return clone(current);
      },
      undo: function () {
        if (!past.length) return clone(current);
        future.unshift(clone(current));
        current = past.pop();
        return clone(current);
      },
      redo: function () {
        if (!future.length) return clone(current);
        past.push(clone(current));
        current = future.shift();
        return clone(current);
      },
      reset: function (next) {
        current = normalizeLayout(next);
        past = [];
        future = [];
        return clone(current);
      },
      canUndo: function () { return past.length > 0; },
      canRedo: function () { return future.length > 0; },
      counts: function () { return { undo: past.length, redo: future.length }; }
    };
  }

  function createHandoff(layout) {
    const spec = normalizeLayout(layout);
    const visible = spec.fields.filter(function (field) { return field.visible; });
    const hidden = spec.fields.filter(function (field) { return !field.visible; });
    const lines = [
      '# Knowledge Sharing Platforms UI layout handoff', '',
      '- Baseline: `' + spec.baseline + '`',
      '- Screen: `' + spec.screen + '`',
      '- Spec: `version ' + spec.specVersion + ' / ' + spec.container.gridColumns + ' columns`',
      '- Preset origin: `' + spec.presetOrigin + '`',
      '- Container: width ' + spec.container.widthPercent + '%, max ' + (spec.container.maxWidthPx === null ? 'none' : spec.container.maxWidthPx + 'px') + ', ' + spec.container.align + ', gap ' + spec.container.columnGapPx + 'px / ' + spec.container.rowGapPx + 'px',
      '- Responsive intent: Desktop (Wide/Laptop/Compact)では12-column canonical placementを維持する。containerはavailable application content areaの100%を使用し、max-width 1680px。desktop viewport変更ではfield placementをreflow/reorderしない。720px以下のみ1-column visual projectionとし、desktop specは保持する。',
      '', '## Field placement', ''
    ];
    visible.forEach(function (field) {
      lines.push(field.order + '. `' + field.id + '` — start ' + field.colStart + ', span ' + field.colSpan + '/' + spec.container.gridColumns + ', height ' + field.heightPx + 'px, top gap ' + field.topGapPx + 'px, break ' + (field.breakBefore ? 'yes' : 'no'));
    });
    if (hidden.length) {
      lines.push('', '## Hidden fields', '');
      hidden.forEach(function (field) { lines.push('- `' + field.id + '`'); });
    }
    lines.push('', '## Implementation boundary', '', 'このspecの反映はvisual/layout変更のみに限定し、別途明示的に許可されない限りbusiness logic、schema、migration、security、provider behaviorを変更しないこと。', '', '## Canonical layout JSON', '', '```json', stableStringify(spec).trimEnd(), '```', '');
    return lines.join('\n');
  }

  function migrateVariantMap(variants) {
    const result = {};
    Object.keys(variants || {}).forEach(function (name) {
      const value = variants[name];
      try {
        const text = typeof value === 'string' ? value : JSON.stringify(value);
        result[name] = stableStringify(parseLayoutJson(text));
      } catch (error) {
        result[name] = value;
      }
    });
    return result;
  }

  return {
    HEIGHT_LIMITS: HEIGHT_LIMITS,
    MAX_TOP_GAP: MAX_TOP_GAP,
    normalizeLayout: normalizeLayout,
    migrateV1: migrateV1,
    validateV1: validateV1,
    validateLayout: validateLayout,
    stableStringify: stableStringify,
    parseLayoutJson: parseLayoutJson,
    detectCollisions: detectCollisions,
    getFieldRows: getFieldRows,
    reorderField: reorderField,
    previewPlacement: previewPlacement,
    placeField: placeField,
    updateField: updateField,
    updateContainer: updateContainer,
    convertGrid: convertGrid,
    gridConversionLosesFidelity: gridConversionLosesFidelity,
    calculateResizePatch: calculateResizePatch,
    previewResize: previewResize,
    resizeField: resizeField,
    nudgeField: nudgeField,
    tidyLayout: tidyLayout,
    lintLayout: lintLayout,
    createHistory: createHistory,
    createHandoff: createHandoff,
    migrateVariantMap: migrateVariantMap
  };
});
