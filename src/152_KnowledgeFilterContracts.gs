var KSP_KNOWLEDGE_SEARCH_MODES = Object.freeze({
  FREE_QUESTION: '自由質問',
  SUMMARY: '要約',
  TIMELINE: '時系列',
  COMPARISON: '比較',
  MEETING_PREP: '面談準備'
});

var KSP_KNOWLEDGE_MODE_ORDER = Object.freeze([
  KSP_KNOWLEDGE_SEARCH_MODES.FREE_QUESTION,
  KSP_KNOWLEDGE_SEARCH_MODES.SUMMARY,
  KSP_KNOWLEDGE_SEARCH_MODES.TIMELINE,
  KSP_KNOWLEDGE_SEARCH_MODES.COMPARISON,
  KSP_KNOWLEDGE_SEARCH_MODES.MEETING_PREP
]);

var KSP_KNOWLEDGE_FOLLOW_UP_FILTERS = Object.freeze({
  REQUIRED: 'REQUIRED',
  NOT_REQUIRED: 'NOT_REQUIRED'
});

function kspGetKnowledgeModeDefinition_(mode) {
  var definitions = {};
  definitions[KSP_KNOWLEDGE_SEARCH_MODES.FREE_QUESTION] = {
    mode: KSP_KNOWLEDGE_SEARCH_MODES.FREE_QUESTION,
    inputLabel: '質問',
    placeholder: '例: 最近の資料では、APACインフラの投資機会についてどのような見解が示されていますか？',
    inputRequired: true,
    targetRequired: false,
    instruction: '質問への直接回答を先に示し、資料で確認できる根拠、反証または不確実性、証拠不足を整理してください。',
    apiInstructions: [
      '最初に質問への直接回答を示し、その後に根拠となる要点を簡潔に整理してください。',
      '確認できる反証、不確実性、証拠不足も区別してください。'
    ]
  };
  definitions[KSP_KNOWLEDGE_SEARCH_MODES.SUMMARY] = {
    mode: KSP_KNOWLEDGE_SEARCH_MODES.SUMMARY,
    inputLabel: '追加指示',
    placeholder: '任意: リスクと投資機会を中心に整理してください。',
    inputRequired: false,
    targetRequired: false,
    instruction: '複数資料を横断して統合し、主要テーマ、重要事実・見解、変化、矛盾、証拠不足を整理してください。',
    apiInstructions: [
      '複数資料を横断して統合し、資料ごとの要約を単純に並べないでください。',
      '主要テーマ、重要事実・見解、裏付けられた変化や矛盾、証拠不足の順で整理してください。'
    ]
  };
  definitions[KSP_KNOWLEDGE_SEARCH_MODES.TIMELINE] = {
    mode: KSP_KNOWLEDGE_SEARCH_MODES.TIMELINE,
    inputLabel: '追加指示',
    placeholder: '任意: 過去12か月の変化を中心に整理してください。',
    inputRequired: false,
    targetRequired: false,
    instruction: '日付順に整理し、変化、継続事項、比較不能な期間、証拠が途切れる期間を区別してください。',
    apiInstructions: [
      '日付または期間順に整理し、前期からの変化と継続している事項を区別してください。',
      '異なる資料が異なる話題を扱うだけの場合は変化と断定せず、証拠が途切れる期間を明示してください。'
    ]
  };
  definitions[KSP_KNOWLEDGE_SEARCH_MODES.COMPARISON] = {
    mode: KSP_KNOWLEDGE_SEARCH_MODES.COMPARISON,
    inputLabel: '追加指示',
    placeholder: '任意: 投資機会、リスク、見通しの共通軸で比較してください。',
    inputRequired: false,
    targetRequired: false,
    instruction: '現在の単一Entity/GP/条件内で、期間、資料、戦略またはテーマを共通軸で比較してください。2–5 Entity比較は対象外です。',
    apiInstructions: [
      '現在の単一Entity、単一GPまたは選択条件の内側で、期間、資料、戦略またはテーマを共通軸にそろえて比較してください。',
      '裏付けがある場合は簡潔な比較表を使い、共通点、相違点、合意、見解の不一致、証拠の非対称性を示してください。',
      '複数Entityを選択した比較として扱わず、資料にない評価軸、順位付け、優劣を作らないでください。'
    ]
  };
  definitions[KSP_KNOWLEDGE_SEARCH_MODES.MEETING_PREP] = {
    mode: KSP_KNOWLEDGE_SEARCH_MODES.MEETING_PREP,
    inputLabel: '追加指示',
    placeholder: '任意: 次回面談で確認したいテーマを入力してください。',
    inputRequired: false,
    targetRequired: true,
    instruction: '選択された単一EntityまたはGPとの面談に向け、主要更新、変化、未解決点、再確認事項、質問候補、証拠不足を整理してください。投資判断を自動生成しないでください。',
    apiInstructions: [
      '選択された単一EntityまたはGPとの次回面談に向けた実務的なBriefを作成してください。',
      '最近の更新、過去からの変化、未解決論点、再確認事項、質問候補、証拠不足を整理してください。',
      '質問候補は取得資料で確認できる未解決点や変化に結び付け、投資判断や推奨を自動生成しないでください。'
    ]
  };
  var normalized = kspAiTrim_(mode) || KSP_KNOWLEDGE_SEARCH_MODES.FREE_QUESTION;
  kspAssert_(definitions[normalized], 'AI_SEARCH_MODE_INVALID', '検索モードが不正です。');
  return kspDeepClone_(definitions[normalized]);
}

function kspGetKnowledgeModeDefinitions_() {
  return KSP_KNOWLEDGE_MODE_ORDER.map(function (mode) {
    var definition = kspGetKnowledgeModeDefinition_(mode);
    delete definition.apiInstructions;
    return definition;
  });
}

function kspNormalizeKnowledgeFollowUpFilter_(value) {
  if (value === true || String(value).toUpperCase() === KSP_KNOWLEDGE_FOLLOW_UP_FILTERS.REQUIRED ||
      String(value).toLowerCase() === 'true') return KSP_KNOWLEDGE_FOLLOW_UP_FILTERS.REQUIRED;
  if (value === false || String(value).toUpperCase() === KSP_KNOWLEDGE_FOLLOW_UP_FILTERS.NOT_REQUIRED ||
      String(value).toLowerCase() === 'false') return KSP_KNOWLEDGE_FOLLOW_UP_FILTERS.NOT_REQUIRED;
  return '';
}

function kspNormalizeKnowledgeFilters_(value) {
  var source = value && typeof value === 'object' ? value : {};
  return {
    dateFrom: kspAiTrim_(source.dateFrom),
    dateTo: kspAiTrim_(source.dateTo),
    counterpartyType: kspAiTrim_(source.counterpartyType).toUpperCase(),
    entityKey: kspAiTrim_(source.entityKey || source.counterpartyEntityKey),
    gpId: kspAiTrim_(source.gpId),
    assetClassId: kspAiTrim_(source.assetClassId),
    capitalTypeId: kspAiTrim_(source.capitalTypeId),
    teamId: kspAiTrim_(source.teamId),
    fundStrategy: kspAiTrim_(source.fundStrategy),
    followUp: kspNormalizeKnowledgeFollowUpFilter_(source.followUp !== undefined ? source.followUp : source.followUpRequired),
    sourceType: kspAiTrim_(source.sourceType),
    sourceId: kspAiTrim_(source.sourceId)
  };
}

function kspKnowledgeRequestFilters_(request) {
  var source = request && typeof request === 'object' ? request : {};
  return kspNormalizeKnowledgeFilters_(source.filters && typeof source.filters === 'object' ? source.filters : source);
}

function kspKnowledgeRequestWithLegacyFilterAliases_(request) {
  var output = request || {};
  var filters = kspKnowledgeRequestFilters_(output);
  output.filters = filters;
  Object.keys(filters).forEach(function (key) { output[key] = filters[key]; });
  return output;
}

function kspNormalizeCanonicalKnowledgeRequest_(input) {
  var source = input && typeof input === 'object' ? input : {};
  var instruction = source.questionOrInstruction !== undefined ? source.questionOrInstruction :
    (source.question !== undefined ? source.question : source.instruction);
  var rawEntities = Array.isArray(source.selectedEntityKeys) ? source.selectedEntityKeys :
    (Array.isArray(source.selectedEntities) ? source.selectedEntities : []);
  var filters = kspKnowledgeRequestFilters_(source);
  var selectedEntityKeys = rawEntities.map(kspAiTrim_).filter(Boolean);
  if (filters.entityKey && selectedEntityKeys.indexOf(filters.entityKey) === -1) selectedEntityKeys.unshift(filters.entityKey);
  return {
    route: kspAiTrim_(source.route || source.provider).toUpperCase(),
    mode: kspAiTrim_(source.mode) || KSP_KNOWLEDGE_SEARCH_MODES.FREE_QUESTION,
    questionOrInstruction: kspAiTrim_(instruction),
    filters: filters,
    selectedEntityKeys: kspUniqueStrings_(selectedEntityKeys),
    modelProfileId: kspAiTrim_(source.modelProfileId).toLowerCase(),
    thinkingProfileId: kspAiTrim_(source.thinkingProfileId).toLowerCase()
  };
}

function kspValidateCanonicalKnowledgeRequest_(request) {
  var input = kspNormalizeCanonicalKnowledgeRequest_(request || {});
  var filters = kspKnowledgeRequestFilters_(input);
  var definition = kspGetKnowledgeModeDefinition_(input.mode);
  if (definition.inputRequired) {
    kspAssert_(input.questionOrInstruction, 'AI_QUESTION_REQUIRED', '質問を入力してください。');
  }
  kspAssert_(input.questionOrInstruction.length <= KSP_AI_DEFAULTS.MAX_QUESTION_LENGTH,
    'AI_QUESTION_TOO_LONG', '質問または追加指示は5,000文字以内で入力してください。');
  if (filters.dateFrom) kspAssert_(kspIsValidDateKey_(filters.dateFrom), 'AI_DATE_FROM_INVALID', 'Date Fromが不正です。');
  if (filters.dateTo) kspAssert_(kspIsValidDateKey_(filters.dateTo), 'AI_DATE_TO_INVALID', 'Date Toが不正です。');
  if (filters.dateFrom && filters.dateTo) {
    kspAssert_(filters.dateFrom <= filters.dateTo, 'AI_DATE_RANGE_INVALID', 'Date FromはDate To以前にしてください。');
  }
  if (filters.sourceType) {
    kspAssert_(filters.sourceType === KSP_AI_SOURCE_TYPES.MEETING || filters.sourceType === KSP_AI_SOURCE_TYPES.PITCHBOOK,
      'AI_SOURCE_TYPE_INVALID', 'Source Typeが不正です。');
  }
  if (filters.entityKey) {
    kspAssert_(/^[A-Z][A-Z0-9_]*:[A-Za-z0-9_-]+$/.test(filters.entityKey),
      'AI_ENTITY_FILTER_INVALID', 'Counterparty Entityが不正です。');
    if (filters.counterpartyType) {
      kspAssert_(filters.entityKey.indexOf(filters.counterpartyType + ':') === 0,
        'AI_ENTITY_TYPE_CONFLICT', 'Counterparty TypeとEntityが一致しません。');
    }
    if (filters.gpId && filters.entityKey.indexOf('GP:') === 0) {
      kspAssert_(filters.entityKey === 'GP:' + filters.gpId,
        'AI_ENTITY_GP_CONFLICT', 'Counterparty EntityとGPが一致しません。');
    }
  }
  kspAssert_((input.selectedEntityKeys || []).length <= 1, 'AI_MULTI_ENTITY_DEFERRED',
    '2–5 Entity比較は次のWork 0021 dispatchで対応します。');
  if (definition.targetRequired) {
    kspAssert_(filters.entityKey || filters.gpId, 'AI_MEETING_PREP_TARGET_REQUIRED',
      '面談準備ではCounterparty EntityまたはGPを選択してください。');
  }
  if ((filters.teamId || filters.followUp) && filters.sourceType !== KSP_AI_SOURCE_TYPES.MEETING) {
    kspAssert_(false, 'AI_FILTER_SOURCE_TYPE_INCOMPATIBLE',
      'Teamと要フォローはMeetingにのみ適用できます。Source TypeをMeetingにしてください。');
  }
  return input;
}

function kspKnowledgeFilterAuditMetadata_(request) {
  var filters = kspKnowledgeRequestFilters_(request);
  var output = {};
  Object.keys(filters).forEach(function (key) {
    if (filters[key] !== '' && filters[key] !== null && filters[key] !== undefined) output[key] = filters[key];
  });
  return output;
}

function kspKnowledgeScopeSummary_(request) {
  var input = request || {};
  var filters = kspKnowledgeRequestFilters_(input);
  var parts = [];
  if (filters.dateFrom || filters.dateTo) parts.push('Date ' + (filters.dateFrom || '…') + '–' + (filters.dateTo || '…'));
  if (filters.counterpartyType) parts.push('Type ' + filters.counterpartyType);
  if (filters.entityKey) parts.push('Entity ' + filters.entityKey);
  if (filters.gpId) parts.push('GP ' + filters.gpId);
  if (filters.assetClassId) parts.push('Asset ' + filters.assetClassId);
  if (filters.capitalTypeId) parts.push('Capital ' + filters.capitalTypeId);
  if (filters.teamId) parts.push('Team ' + filters.teamId);
  if (filters.fundStrategy) parts.push('Fund/Strategy ' + filters.fundStrategy);
  if (filters.followUp) parts.push('Follow-up ' + filters.followUp);
  parts.push('Source ' + (filters.sourceType || 'Meeting+Pitchbook'));
  return parts.join(' / ');
}

function kspBuildCanonicalKnowledgePrompt_(request) {
  var input = kspValidateCanonicalKnowledgeRequest_(request);
  var definition = kspGetKnowledgeModeDefinition_(input.mode);
  var lines = [
    '社内ナレッジベースから取得された資料だけを根拠として、日本語で回答してください。',
    '根拠が不足する箇所は推測で埋めず、確認できない点と証拠不足を明示してください。',
    '外部知識や一般論を、資料に記載された事実として扱わないでください。',
    '重要な事実・比較・変化には、取得資料に対応する出典情報を付けてください。',
    '',
    'モード: ' + definition.mode,
    '選択範囲: ' + kspKnowledgeScopeSummary_(input)
  ].concat(definition.apiInstructions || []);
  if (input.mode === KSP_KNOWLEDGE_SEARCH_MODES.FREE_QUESTION) lines.push('質問:', input.questionOrInstruction);
  else if (input.questionOrInstruction) lines.push('追加指示:', input.questionOrInstruction);
  return lines.join('\n');
}
