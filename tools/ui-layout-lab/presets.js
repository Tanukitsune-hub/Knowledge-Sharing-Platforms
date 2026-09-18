(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.LayoutLabPresets = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const SPEC_VERSION = 1;
  const SCREEN = 'meeting-create';
  const BASELINE = 'work0032-version8';

  const VIEWPORTS = Object.freeze({
    wide: Object.freeze({ id: 'wide', label: 'Wide desktop', widthPx: 2560 }),
    laptop: Object.freeze({ id: 'laptop', label: 'Laptop', widthPx: 1440 }),
    compact: Object.freeze({ id: 'compact', label: 'Compact', widthPx: 1280 }),
    mobile: Object.freeze({ id: 'mobile', label: 'Mobile', widthPx: 390 })
  });

  const FIELD_DEFINITIONS = Object.freeze([
    Object.freeze({ id: 'meeting-date', label: '日付', kind: 'date', required: true, role: 'metadata' }),
    Object.freeze({ id: 'meeting-time', label: '時間', kind: 'time', role: 'metadata' }),
    Object.freeze({ id: 'meeting-locationId', label: '面談場所', kind: 'select', role: 'metadata' }),
    Object.freeze({ id: 'meeting-counterpartyId', label: '面談先', kind: 'select', required: true, role: 'identity' }),
    Object.freeze({ id: 'meeting-assetClassId', label: 'Asset Class', kind: 'select', required: true, role: 'metadata' }),
    Object.freeze({ id: 'meeting-capitalTypeId', label: 'Equity / Debt', kind: 'select', role: 'metadata' }),
    Object.freeze({ id: 'meeting-teamId', label: 'Team', kind: 'select', role: 'metadata' }),
    Object.freeze({ id: 'meeting-fundStrategy', label: 'Fund / Strategy', kind: 'text', role: 'metadata' }),
    Object.freeze({ id: 'meeting-types', label: 'Meeting Type', kind: 'checks', role: 'group' }),
    Object.freeze({ id: 'meeting-counterparty', label: '面談相手（氏名・役職）', kind: 'text', role: 'participant' }),
    Object.freeze({ id: 'meeting-internalParticipants', label: '当社側', kind: 'text', role: 'participant' }),
    Object.freeze({ id: 'meeting-notes', label: '面談内容', kind: 'textarea', role: 'notes', resizableY: true }),
    Object.freeze({ id: 'attachment-section', label: '資料を添付', kind: 'attachment', role: 'attachment', resizableY: true })
  ]);

  const fieldDefinitionById = Object.freeze(FIELD_DEFINITIONS.reduce(function (result, field) {
    result[field.id] = field;
    return result;
  }, {}));

  function field(id, colSpan, heightPx) {
    const definition = fieldDefinitionById[id];
    const item = { id: id, visible: true, colSpan: colSpan, role: definition.role };
    if (heightPx !== undefined) item.heightPx = heightPx;
    return item;
  }

  function layout(presetOrigin, viewportId, container, fields) {
    return {
      specVersion: SPEC_VERSION,
      screen: SCREEN,
      baseline: BASELINE,
      presetOrigin: presetOrigin,
      viewport: {
        id: viewportId,
        widthPx: VIEWPORTS[viewportId].widthPx
      },
      container: container,
      fields: fields.map(function (item, index) {
        return Object.assign({ order: index + 1 }, item);
      })
    };
  }

  const PRESETS = Object.freeze({
    'current-v8': Object.freeze({
      id: 'current-v8',
      name: 'Current v8',
      description: 'Work 0032 / version 8 の比較用ベースライン。',
      layout: layout('current-v8', 'wide', {
        widthPercent: 100,
        maxWidthPx: 1680,
        align: 'left',
        columnGapPx: 18,
        rowGapPx: 15,
        showGrid: true
      }, [
        field('meeting-date', 3),
        field('meeting-time', 2),
        field('meeting-locationId', 3),
        field('meeting-counterpartyId', 4),
        field('meeting-assetClassId', 3),
        field('meeting-capitalTypeId', 3),
        field('meeting-teamId', 2),
        field('meeting-fundStrategy', 4),
        field('meeting-types', 12),
        field('meeting-counterparty', 6),
        field('meeting-internalParticipants', 6),
        field('meeting-notes', 12, 384),
        field('attachment-section', 12, 178)
      ])
    }),
    'compact-institutional': Object.freeze({
      id: 'compact-institutional',
      name: 'Compact Institutional',
      description: '情報密度を高め、視線移動を短くした機関投資家向け配置。',
      layout: layout('compact-institutional', 'wide', {
        widthPercent: 65,
        maxWidthPx: 1680,
        align: 'left',
        columnGapPx: 14,
        rowGapPx: 14,
        showGrid: true
      }, [
        field('meeting-date', 2),
        field('meeting-time', 2),
        field('meeting-locationId', 2),
        field('meeting-counterpartyId', 6),
        field('meeting-assetClassId', 3),
        field('meeting-capitalTypeId', 3),
        field('meeting-teamId', 2),
        field('meeting-fundStrategy', 4),
        field('meeting-counterparty', 6),
        field('meeting-internalParticipants', 6),
        field('meeting-types', 12),
        field('meeting-notes', 12, 400),
        field('attachment-section', 12, 170)
      ])
    }),
    'balanced-professional': Object.freeze({
      id: 'balanced-professional',
      name: 'Balanced Professional',
      description: '業務密度と余白を両立した、落ち着いた標準案。',
      layout: layout('balanced-professional', 'wide', {
        widthPercent: 72,
        maxWidthPx: 1780,
        align: 'left',
        columnGapPx: 18,
        rowGapPx: 18,
        showGrid: true
      }, [
        field('meeting-date', 2),
        field('meeting-time', 2),
        field('meeting-locationId', 3),
        field('meeting-counterpartyId', 5),
        field('meeting-assetClassId', 3),
        field('meeting-capitalTypeId', 3),
        field('meeting-teamId', 2),
        field('meeting-fundStrategy', 4),
        field('meeting-types', 12),
        field('meeting-counterparty', 6),
        field('meeting-internalParticipants', 6),
        field('meeting-notes', 12, 420),
        field('attachment-section', 12, 180)
      ])
    }),
    'memo-first': Object.freeze({
      id: 'memo-first',
      name: 'Memo First',
      description: '基本情報の直後に面談メモを置き、記録入力を最優先。',
      layout: layout('memo-first', 'wide', {
        widthPercent: 68,
        maxWidthPx: 1700,
        align: 'left',
        columnGapPx: 16,
        rowGapPx: 16,
        showGrid: true
      }, [
        field('meeting-date', 2),
        field('meeting-time', 2),
        field('meeting-counterpartyId', 5),
        field('meeting-locationId', 3),
        field('meeting-notes', 12, 500),
        field('meeting-assetClassId', 3),
        field('meeting-capitalTypeId', 3),
        field('meeting-teamId', 2),
        field('meeting-fundStrategy', 4),
        field('meeting-counterparty', 6),
        field('meeting-internalParticipants', 6),
        field('meeting-types', 12),
        field('attachment-section', 12, 180)
      ])
    })
  });

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function getPreset(id) {
    if (!Object.prototype.hasOwnProperty.call(PRESETS, id)) throw new Error('Unknown preset: ' + id);
    return clone(PRESETS[id].layout);
  }

  return {
    SPEC_VERSION: SPEC_VERSION,
    SCREEN: SCREEN,
    BASELINE: BASELINE,
    VIEWPORTS: VIEWPORTS,
    FIELD_DEFINITIONS: FIELD_DEFINITIONS,
    fieldDefinitionById: fieldDefinitionById,
    PRESETS: PRESETS,
    getPreset: getPreset,
    clone: clone
  };
});
