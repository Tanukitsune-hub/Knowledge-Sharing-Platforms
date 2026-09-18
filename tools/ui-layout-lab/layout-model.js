(function (root, factory) {
  const presets = typeof module === 'object' && module.exports ? require('./presets.js') : root.LayoutLabPresets;
  const api = factory(presets);
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.LayoutLabModel = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function (presets) {
  'use strict';

  const VALID_ALIGNS = ['left', 'center'];
  const REQUIRED_IDS = presets.FIELD_DEFINITIONS.map(function (field) { return field.id; });
  const REQUIRED_ID_SET = new Set(REQUIRED_IDS);

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

  function normalizeField(item, index) {
    const definition = presets.fieldDefinitionById[item.id];
    const field = {
      id: item.id,
      order: index + 1,
      visible: item.visible !== false,
      colSpan: clamp(finiteInteger(item.colSpan, 1), 1, 12),
      role: definition.role
    };
    if (definition.resizableY || item.heightPx !== undefined) {
      const fallback = definition.role === 'notes' ? 384 : 178;
      field.heightPx = clamp(finiteInteger(item.heightPx, fallback), 100, 720);
    }
    return field;
  }

  function normalizeLayout(input) {
    const viewportId = input && input.viewport && presets.VIEWPORTS[input.viewport.id] ? input.viewport.id : 'wide';
    const maxWidthValue = input && input.container ? input.container.maxWidthPx : null;
    const normalized = {
      specVersion: presets.SPEC_VERSION,
      screen: presets.SCREEN,
      baseline: presets.BASELINE,
      presetOrigin: typeof input.presetOrigin === 'string' && input.presetOrigin.trim() ? input.presetOrigin.trim() : 'custom',
      viewport: {
        id: viewportId,
        widthPx: presets.VIEWPORTS[viewportId].widthPx
      },
      container: {
        widthPercent: clamp(finiteInteger(input.container.widthPercent, 68), 40, 100),
        maxWidthPx: maxWidthValue === null || maxWidthValue === '' || maxWidthValue === undefined ? null : clamp(finiteInteger(maxWidthValue, 1680), 640, 3000),
        align: VALID_ALIGNS.includes(input.container.align) ? input.container.align : 'left',
        columnGapPx: clamp(finiteInteger(input.container.columnGapPx, 16), 0, 40),
        rowGapPx: clamp(finiteInteger(input.container.rowGapPx, 16), 0, 40),
        showGrid: input.container.showGrid !== false
      },
      fields: input.fields.map(normalizeField)
    };
    return normalized;
  }

  function validateLayout(candidate) {
    const errors = [];
    if (!candidate || typeof candidate !== 'object' || Array.isArray(candidate)) return { valid: false, errors: ['JSON root must be an object.'] };
    if (candidate.specVersion !== presets.SPEC_VERSION) errors.push('specVersion must be 1.');
    if (candidate.screen !== presets.SCREEN) errors.push('screen must be meeting-create.');
    if (candidate.baseline !== presets.BASELINE) errors.push('baseline must be work0032-version8.');
    if (!candidate.viewport || !presets.VIEWPORTS[candidate.viewport.id]) errors.push('viewport.id is not supported.');
    if (!candidate.container || typeof candidate.container !== 'object') errors.push('container is required.');
    else {
      if (!Number.isInteger(candidate.container.widthPercent) || candidate.container.widthPercent < 40 || candidate.container.widthPercent > 100) errors.push('container.widthPercent must be an integer from 40 to 100.');
      if (candidate.container.maxWidthPx !== null && (!Number.isInteger(candidate.container.maxWidthPx) || candidate.container.maxWidthPx < 640 || candidate.container.maxWidthPx > 3000)) errors.push('container.maxWidthPx must be null or an integer from 640 to 3000.');
      if (!VALID_ALIGNS.includes(candidate.container.align)) errors.push('container.align must be left or center.');
      ['columnGapPx', 'rowGapPx'].forEach(function (key) {
        if (!Number.isInteger(candidate.container[key]) || candidate.container[key] < 0 || candidate.container[key] > 40) errors.push('container.' + key + ' must be an integer from 0 to 40.');
      });
      if (typeof candidate.container.showGrid !== 'boolean') errors.push('container.showGrid must be boolean.');
    }
    if (!Array.isArray(candidate.fields)) errors.push('fields must be an array.');
    else {
      const ids = candidate.fields.map(function (field) { return field && field.id; });
      const uniqueIds = new Set(ids);
      if (ids.length !== REQUIRED_IDS.length || uniqueIds.size !== REQUIRED_IDS.length || REQUIRED_IDS.some(function (id) { return !uniqueIds.has(id); })) errors.push('fields must contain each canonical field ID exactly once.');
      candidate.fields.forEach(function (field, index) {
        if (!field || typeof field !== 'object') {
          errors.push('fields[' + index + '] must be an object.');
          return;
        }
        if (!REQUIRED_ID_SET.has(field.id)) errors.push('Unknown field ID: ' + String(field.id));
        if (field.order !== index + 1) errors.push('Field order must be sequential and match array order.');
        if (typeof field.visible !== 'boolean') errors.push(field.id + '.visible must be boolean.');
        if (!Number.isInteger(field.colSpan) || field.colSpan < 1 || field.colSpan > 12) errors.push(field.id + '.colSpan must be an integer from 1 to 12.');
        const definition = presets.fieldDefinitionById[field.id];
        if (definition && field.role !== definition.role) errors.push(field.id + '.role does not match the canonical role.');
        if (field.heightPx !== undefined && (!Number.isInteger(field.heightPx) || field.heightPx < 100 || field.heightPx > 720)) errors.push(field.id + '.heightPx must be an integer from 100 to 720.');
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
    const result = validateLayout(parsed);
    if (!result.valid) throw new Error('Layout JSONが不正です: ' + result.errors.join(' '));
    return normalizeLayout(parsed);
  }

  function reorderField(layout, movedId, targetId) {
    const next = clone(layout);
    const from = next.fields.findIndex(function (field) { return field.id === movedId; });
    const to = next.fields.findIndex(function (field) { return field.id === targetId; });
    if (from < 0 || to < 0 || from === to) return normalizeLayout(next);
    const moved = next.fields.splice(from, 1)[0];
    next.fields.splice(to, 0, moved);
    return normalizeLayout(next);
  }

  function updateField(layout, id, patch) {
    const next = clone(layout);
    const field = next.fields.find(function (item) { return item.id === id; });
    if (!field) throw new Error('Unknown field: ' + id);
    Object.assign(field, patch);
    return normalizeLayout(next);
  }

  function updateContainer(layout, patch) {
    const next = clone(layout);
    Object.assign(next.container, patch);
    return normalizeLayout(next);
  }

  function setViewport(layout, viewportId) {
    if (!presets.VIEWPORTS[viewportId]) throw new Error('Unknown viewport: ' + viewportId);
    const next = clone(layout);
    next.viewport = { id: viewportId, widthPx: presets.VIEWPORTS[viewportId].widthPx };
    return normalizeLayout(next);
  }

  function tidyLayout(layout) {
    const next = clone(layout);
    const recommended = {
      'meeting-date': 2,
      'meeting-time': 2,
      'meeting-locationId': 2,
      'meeting-counterpartyId': 6,
      'meeting-assetClassId': 3,
      'meeting-capitalTypeId': 3,
      'meeting-teamId': 2,
      'meeting-fundStrategy': 4,
      'meeting-types': 12,
      'meeting-counterparty': 6,
      'meeting-internalParticipants': 6,
      'meeting-notes': 12,
      'attachment-section': 12
    };
    next.container.widthPercent = clamp(finiteInteger(next.container.widthPercent, 68), 55, 76);
    if (next.container.maxWidthPx !== null) next.container.maxWidthPx = clamp(finiteInteger(next.container.maxWidthPx, 1680), 1200, 1800);
    next.container.columnGapPx = 16;
    next.container.rowGapPx = 16;
    next.fields.forEach(function (field) {
      field.colSpan = recommended[field.id];
      if (field.id === 'meeting-notes') field.heightPx = Math.max(320, finiteInteger(field.heightPx, 384));
      if (field.id === 'attachment-section') field.heightPx = Math.max(150, finiteInteger(field.heightPx, 178));
    });
    return normalizeLayout(next);
  }

  function lintLayout(layout) {
    const spec = normalizeLayout(layout);
    const warnings = [];
    const viewport = presets.VIEWPORTS[spec.viewport.id];
    const effectivePercent = spec.container.maxWidthPx === null
      ? spec.container.widthPercent
      : Math.min(spec.container.widthPercent, spec.container.maxWidthPx / viewport.widthPx * 100);
    if (viewport.widthPx >= 1920 && effectivePercent > 80) warnings.push({ code: 'WIDE_CONTAINER', message: 'Wide desktopでcanvasが80%を超えています。視線移動が長くなる可能性があります。' });
    const participants = spec.fields.filter(function (field) { return field.role === 'participant' && field.visible; });
    if (participants.some(function (field) { return field.colSpan < 5; })) warnings.push({ code: 'NARROW_PARTICIPANTS', message: '面談相手・当社側は5 columns以上にすると入力しやすくなります。' });
    const notes = spec.fields.find(function (field) { return field.id === 'meeting-notes'; });
    if (notes.visible && (notes.heightPx || 0) < 320) warnings.push({ code: 'SHORT_NOTES', message: '面談内容の高さが320px未満です。メモ入力には少し窮屈です。' });
    if (Math.abs(spec.container.columnGapPx - spec.container.rowGapPx) > 10) warnings.push({ code: 'INCONSISTENT_GAPS', message: '横・縦のgap差が大きく、リズムが不揃いに見える可能性があります。' });
    let rowFill = 0;
    let rowItems = 0;
    let crowded = false;
    spec.fields.filter(function (field) { return field.visible; }).forEach(function (field) {
      if (rowFill + field.colSpan > 12) {
        if (rowItems > 4) crowded = true;
        rowFill = 0;
        rowItems = 0;
      }
      rowFill += field.colSpan;
      rowItems += 1;
      if (rowFill === 12) {
        if (rowItems > 4) crowded = true;
        rowFill = 0;
        rowItems = 0;
      }
    });
    if (crowded) warnings.push({ code: 'CROWDED_ROW', message: '1行に5項目以上あります。情報密度が高すぎないか確認してください。' });
    if (spec.container.widthPercent > 90 && spec.container.maxWidthPx === null) warnings.push({ code: 'UNBOUNDED_WIDTH', message: 'max widthなしで90%超です。大型画面で広がりすぎる可能性があります。' });
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
      '# Knowledge Sharing Platforms UI layout handoff',
      '',
      '- Baseline: `' + spec.baseline + '`',
      '- Screen: `' + spec.screen + '`',
      '- Preset origin: `' + spec.presetOrigin + '`',
      '- Container: width ' + spec.container.widthPercent + '%, max ' + (spec.container.maxWidthPx === null ? 'none' : spec.container.maxWidthPx + 'px') + ', ' + spec.container.align + ', gap ' + spec.container.columnGapPx + 'px / ' + spec.container.rowGapPx + 'px',
      '- Responsive intent: desktopは12-column grid、720px以下は全fieldを1-column表示。desktop spec自体は保持する。',
      '',
      '## Field order',
      ''
    ];
    visible.forEach(function (field) {
      lines.push(field.order + '. `' + field.id + '` — ' + field.colSpan + '/12' + (field.heightPx ? ', height ' + field.heightPx + 'px' : ''));
    });
    if (hidden.length) {
      lines.push('', '## Hidden fields', '');
      hidden.forEach(function (field) { lines.push('- `' + field.id + '`'); });
    }
    lines.push(
      '',
      '## Implementation boundary',
      '',
      'このspecの反映はvisual/layout変更のみに限定し、別途明示的に許可されない限りbusiness logic、schema、migration、security、provider behaviorを変更しないこと。',
      '',
      '## Canonical layout JSON',
      '',
      '```json',
      stableStringify(spec).trimEnd(),
      '```',
      ''
    );
    return lines.join('\n');
  }

  return {
    normalizeLayout: normalizeLayout,
    validateLayout: validateLayout,
    stableStringify: stableStringify,
    parseLayoutJson: parseLayoutJson,
    reorderField: reorderField,
    updateField: updateField,
    updateContainer: updateContainer,
    setViewport: setViewport,
    tidyLayout: tidyLayout,
    lintLayout: lintLayout,
    createHistory: createHistory,
    createHandoff: createHandoff
  };
});
