(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.UiStudioScreens = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const SCREEN_DEFINITIONS = Object.freeze([
    Object.freeze({ id: 'knowledge', label: 'ナレッジ検索', eyebrow: 'KNOWLEDGE SEARCH', description: '横断検索、絞り込み、根拠確認' }),
    Object.freeze({ id: 'meeting-create', label: '記録を追加', eyebrow: 'MEETING RECORD', description: '面談記録と資料の登録' }),
    Object.freeze({ id: 'meeting-past', label: '過去の記録', eyebrow: 'MEETING ARCHIVE', description: '履歴の検索とreadback' }),
    Object.freeze({ id: 'counterparty-summary', label: '面談先サマリー', eyebrow: 'COUNTERPARTY', description: '面談先単位のナレッジ集約' }),
    Object.freeze({ id: 'activity-analytics', label: '面談実績の集計', eyebrow: 'ACTIVITY ANALYTICS', description: '活動量と内訳の把握' }),
    Object.freeze({ id: 'masters', label: 'プルダウンの管理', eyebrow: 'MASTER DATA', description: '選択肢の安全な管理' }),
    Object.freeze({ id: 'admin', label: '管理者ページ', eyebrow: 'ADMINISTRATION', description: '接続状態と運用設定' })
  ]);

  const VIEWPORTS = Object.freeze({
    wide: Object.freeze({ id: 'wide', label: 'Wide 2560', widthPx: 2560 }),
    laptop: Object.freeze({ id: 'laptop', label: 'Laptop 1440', widthPx: 1440 }),
    compact: Object.freeze({ id: 'compact', label: 'Compact 1280', widthPx: 1280 }),
    mobile: Object.freeze({ id: 'mobile', label: 'Mobile 390', widthPx: 390 })
  });

  function block(id, label, colStart, colSpan, breakBefore, heightPx, options) {
    const extra = options || {};
    return {
      id: id,
      label: label,
      kind: extra.kind || 'card',
      role: extra.role || 'section',
      order: extra.order || 1,
      visible: extra.visible !== false,
      colStart: colStart,
      colSpan: colSpan,
      breakBefore: breakBefore === true,
      topGapPx: extra.topGapPx || 0,
      heightPx: heightPx,
      xOffsetPx: extra.xOffsetPx || 0,
      yOffsetPx: extra.yOffsetPx || 0,
      widthAdjustPx: extra.widthAdjustPx || 0,
      children: extra.children || []
    };
  }

  function child(id, label, colStart, colSpan, breakBefore, heightPx, kind) {
    return block(id, label, colStart, colSpan, breakBefore, heightPx, { kind: kind || 'control', role: 'control' });
  }

  function ordered(items) {
    return items.map(function (item, index) {
      const next = JSON.parse(JSON.stringify(item));
      next.order = index + 1;
      next.children = (next.children || []).map(function (nested, childIndex) {
        nested.order = childIndex + 1;
        return nested;
      });
      return next;
    });
  }

  const MEETING_BLOCKS = ordered([
    block('meeting-date', '日付', 1, 4, false, 37, { kind: 'date', role: 'metadata' }),
    block('meeting-assetClassId', 'Asset Class', 15, 4, false, 37, { kind: 'select', role: 'metadata' }),
    block('meeting-teamId', 'Team', 11, 4, false, 37, { kind: 'select', role: 'metadata' }),
    block('meeting-locationId', '面談場所', 7, 4, false, 37, { kind: 'select', role: 'metadata' }),
    block('meeting-time', '時間', 5, 2, false, 37, { kind: 'time', role: 'metadata' }),
    block('meeting-capitalTypeId', 'Equity / Debt', 9, 4, false, 37, { kind: 'select', role: 'metadata', visible: false }),
    block('meeting-types', 'Meeting Type', 1, 24, true, 48, { kind: 'checks', role: 'group' }),
    block('meeting-counterpartyId', '面談先', 1, 12, true, 37, { kind: 'select', role: 'identity' }),
    block('meeting-fundStrategy', 'Fund / Strategy', 13, 8, false, 37, { kind: 'text', role: 'metadata' }),
    block('meeting-counterparty', '面談相手（氏名・役職）', 1, 12, true, 37, { kind: 'text', role: 'participant' }),
    block('meeting-internalParticipants', '当社側', 1, 12, true, 37, { kind: 'text', role: 'participant' }),
    block('attachment-section', '資料を添付', 1, 24, true, 130, { kind: 'attachment', role: 'attachment' }),
    block('meeting-notes', '面談内容', 1, 24, true, 480, { kind: 'textarea', role: 'notes' })
  ]);

  const BASELINES = Object.freeze({
    knowledge: ordered([
      block('knowledge-query-panel', '検索条件', 1, 24, false, 168, { children: ordered([
        child('knowledge-query', 'キーワード', 1, 14, false, 44, 'search'),
        child('knowledge-counterparty', '面談先', 15, 6, false, 44, 'select'),
        child('knowledge-search-button', '検索', 21, 4, false, 44, 'button'),
        child('knowledge-source-type', '情報種別', 1, 8, true, 40, 'checks'),
        child('knowledge-period', '期間', 9, 8, false, 40, 'select')
      ]) }),
      block('knowledge-answer', '検索結果サマリー', 1, 15, true, 280, { kind: 'result', role: 'content' }),
      block('knowledge-sources', '参照ソース', 16, 9, false, 280, { kind: 'list', role: 'content' }),
      block('knowledge-history', '最近の検索', 1, 24, true, 150, { kind: 'list', role: 'content' })
    ]),
    'meeting-create': MEETING_BLOCKS,
    'meeting-past': ordered([
      block('past-filter-panel', '検索条件', 1, 24, false, 150, { children: ordered([
        child('past-keyword', 'キーワード', 1, 9, false, 40, 'search'),
        child('past-counterparty', '面談先', 10, 7, false, 40, 'select'),
        child('past-fundStrategy', 'Fund / Strategy', 17, 8, false, 40, 'text'),
        child('past-date-from', '開始日', 1, 5, true, 40, 'date'),
        child('past-date-to', '終了日', 6, 5, false, 40, 'date'),
        child('past-search-button', '絞り込む', 21, 4, false, 40, 'button')
      ]) }),
      block('past-result-summary', '検索結果', 1, 24, true, 54, { kind: 'summary', role: 'content' }),
      block('past-record-list', '記録一覧', 1, 24, true, 390, { kind: 'table', role: 'content' }),
      block('past-pagination', 'ページ操作', 17, 8, true, 48, { kind: 'pagination', role: 'control' })
    ]),
    'counterparty-summary': ordered([
      block('counterparty-selector-panel', '面談先を選択', 1, 24, false, 104, { children: ordered([
        child('summary-counterparty-type', '面談先種別', 1, 6, false, 40, 'select'),
        child('summary-counterparty', '面談先', 7, 13, false, 40, 'select'),
        child('summary-refresh', '表示', 21, 4, false, 40, 'button')
      ]) }),
      block('counterparty-profile', '面談先プロフィール', 1, 8, true, 236, { kind: 'profile', role: 'content' }),
      block('counterparty-summary-card', '面談先サマリー', 9, 16, false, 236, { kind: 'summary', role: 'content', children: ordered([
        child('summary-overview', '概要', 1, 24, false, 72, 'text'),
        child('summary-themes', '主要テーマ', 1, 12, true, 70, 'tags'),
        child('summary-followups', 'フォロー事項', 13, 12, false, 70, 'list')
      ]) }),
      block('counterparty-meetings', '最近の面談', 1, 15, true, 260, { kind: 'table', role: 'content' }),
      block('counterparty-materials', '関連資料', 16, 9, false, 260, { kind: 'list', role: 'content' })
    ]),
    'activity-analytics': ordered([
      block('analytics-filter-panel', '集計条件', 1, 24, false, 104, { children: ordered([
        child('analytics-period', '期間', 1, 7, false, 40, 'select'),
        child('analytics-team', 'Team', 8, 6, false, 40, 'select'),
        child('analytics-asset-class', 'Asset Class', 14, 6, false, 40, 'select'),
        child('analytics-apply', '反映', 21, 4, false, 40, 'button')
      ]) }),
      block('analytics-kpi-meetings', '面談件数', 1, 6, true, 104, { kind: 'metric', role: 'metric' }),
      block('analytics-kpi-counterparties', '面談先数', 7, 6, false, 104, { kind: 'metric', role: 'metric' }),
      block('analytics-kpi-materials', '資料数', 13, 6, false, 104, { kind: 'metric', role: 'metric' }),
      block('analytics-kpi-followup', 'フォロー率', 19, 6, false, 104, { kind: 'metric', role: 'metric' }),
      block('analytics-trend', '面談推移', 1, 15, true, 300, { kind: 'chart', role: 'content' }),
      block('analytics-breakdown', '種別内訳', 16, 9, false, 300, { kind: 'chart', role: 'content' }),
      block('analytics-detail', '集計明細', 1, 24, true, 240, { kind: 'table', role: 'content' })
    ]),
    masters: ordered([
      block('masters-form-panel', '選択肢を追加', 1, 8, false, 250, { children: ordered([
        child('masters-category', 'カテゴリ', 1, 24, false, 40, 'select'),
        child('masters-label', '表示名', 1, 24, true, 40, 'text'),
        child('masters-code', 'コード', 1, 16, true, 40, 'text'),
        child('masters-add', '追加', 18, 7, false, 40, 'button')
      ]) }),
      block('masters-list-section', '登録済み選択肢', 9, 16, false, 360, { kind: 'table', role: 'content' }),
      block('masters-guidance', '運用ガイド', 1, 8, true, 126, { kind: 'notice', role: 'content' }),
      block('masters-status', '反映状態', 9, 16, false, 126, { kind: 'status', role: 'content' })
    ]),
    admin: ordered([
      block('admin-readiness-card', 'システム準備状況', 1, 8, false, 190, { kind: 'status', role: 'admin' }),
      block('admin-security-card', 'セキュリティ', 9, 8, false, 190, { kind: 'security', role: 'admin' }),
      block('admin-ai-card', 'AI連携', 17, 8, false, 190, { kind: 'status', role: 'admin' }),
      block('admin-installation-card', 'インストール状態', 1, 12, true, 230, { kind: 'status', role: 'admin', children: ordered([
        child('admin-schema', 'Schema', 1, 8, false, 42, 'status'),
        child('admin-backend', 'Backend', 9, 8, false, 42, 'status'),
        child('admin-deployment', 'Deployment', 17, 8, false, 42, 'status')
      ]) }),
      block('admin-operations-card', '運用操作', 13, 12, false, 230, { kind: 'actions', role: 'admin' }),
      block('admin-notice', '管理者向け注意事項', 1, 24, true, 120, { kind: 'notice', role: 'admin' })
    ])
  });

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function getScreenDefinition(id) {
    return SCREEN_DEFINITIONS.find(function (screen) { return screen.id === id; }) || null;
  }

  function getBaselineBlocks(id) {
    if (!Object.prototype.hasOwnProperty.call(BASELINES, id)) throw new Error('Unknown screen: ' + id);
    return clone(BASELINES[id]);
  }

  return {
    SCREEN_DEFINITIONS: SCREEN_DEFINITIONS,
    SCREEN_IDS: Object.freeze(SCREEN_DEFINITIONS.map(function (screen) { return screen.id; })),
    VIEWPORTS: VIEWPORTS,
    BASELINES: BASELINES,
    getScreenDefinition: getScreenDefinition,
    getBaselineBlocks: getBaselineBlocks,
    clone: clone
  };
});
