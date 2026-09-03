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

var KSP_KNOWLEDGE_MULTI_ENTITY_MIN = 2;
var KSP_KNOWLEDGE_MULTI_ENTITY_MAX = 5;
var KSP_KNOWLEDGE_ADVANCED_SOURCE_ID_MAX = 40;

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
    instruction: '選択された2–5 Entityを共通軸で比較し、Entityごとの根拠と証拠不足を区別してください。',
    apiInstructions: [
      '選択Entityごとに資料で確認できる事実を帰属させ、共通軸の簡潔な比較表を作成してください。',
      '裏付けられた共通点、相違点、時系列の変化、証拠の非対称性を区別してください。',
      '根拠のないEntityは証拠不足と明示し、資料にない評価軸、順位付け、優劣、投資推奨を作らないでください。'
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
    sourceId: kspAiTrim_(source.sourceId),
    relatedGpId: kspAiTrim_(source.relatedGpId || source.relatedGp),
    meetingTypeCode: kspAiTrim_(source.meetingTypeCode || source.meetingType).toUpperCase()
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
  if ((filters.relatedGpId || filters.meetingTypeCode) && !filters.sourceType) {
    filters.sourceType = KSP_AI_SOURCE_TYPES.MEETING;
  }
  return {
    route: kspAiTrim_(source.route || source.provider).toUpperCase(),
    mode: kspAiTrim_(source.mode) || KSP_KNOWLEDGE_SEARCH_MODES.FREE_QUESTION,
    questionOrInstruction: kspAiTrim_(instruction),
    filters: filters,
    selectedEntityKeys: selectedEntityKeys,
    resolvedSourceIds: Array.isArray(source.resolvedSourceIds)
      ? source.resolvedSourceIds.map(kspAiTrim_).filter(Boolean) : [],
    advancedFilterResolved: source.advancedFilterResolved === true,
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
  var selectedEntityKeys = input.selectedEntityKeys || [];
  var selectedSeen = {};
  selectedEntityKeys.forEach(function (entityKey) {
    kspAssert_(/^[A-Z][A-Z0-9_]*:[A-Za-z0-9_-]+$/.test(entityKey),
      'AI_ENTITY_FILTER_INVALID', '選択されたCounterparty Entityが不正です。');
    kspAssert_(!selectedSeen[entityKey], 'AI_MULTI_ENTITY_DUPLICATE', '同じEntityを複数回選択できません。');
    selectedSeen[entityKey] = true;
  });
  if (selectedEntityKeys.length >= KSP_KNOWLEDGE_MULTI_ENTITY_MIN) {
    kspAssert_(input.mode === KSP_KNOWLEDGE_SEARCH_MODES.COMPARISON,
      'AI_MULTI_ENTITY_MODE_REQUIRED', '2–5 Entity選択は比較モードでのみ利用できます。');
    kspAssert_(selectedEntityKeys.length <= KSP_KNOWLEDGE_MULTI_ENTITY_MAX,
      'AI_MULTI_ENTITY_COUNT_INVALID', '比較するEntityは2–5件で選択してください。');
    kspAssert_(!filters.entityKey, 'AI_MULTI_ENTITY_AMBIGUOUS_SCOPE',
      '複数Entity比較では単一Entityフィルターを同時に指定できません。');
  }
  if (input.mode === KSP_KNOWLEDGE_SEARCH_MODES.COMPARISON && selectedEntityKeys.length === 1) {
    kspAssert_(filters.entityKey === selectedEntityKeys[0],
      filters.entityKey ? 'AI_MULTI_ENTITY_AMBIGUOUS_SCOPE' : 'AI_MULTI_ENTITY_COUNT_INVALID',
      filters.entityKey ? '比較Entityと単一Entityフィルターが一致しません。' :
        '明示的なEntity比較では2–5件を選択してください。');
  }
  if (definition.targetRequired) {
    kspAssert_(filters.entityKey || filters.gpId, 'AI_MEETING_PREP_TARGET_REQUIRED',
      '面談準備ではCounterparty EntityまたはGPを選択してください。');
  }
  if ((filters.teamId || filters.followUp || filters.relatedGpId || filters.meetingTypeCode) &&
      filters.sourceType !== KSP_AI_SOURCE_TYPES.MEETING) {
    kspAssert_(false, 'AI_FILTER_SOURCE_TYPE_INCOMPATIBLE',
      'Team、要フォロー、Related GP、Meeting TypeはMeetingにのみ適用できます。Source TypeをMeetingにしてください。');
  }
  return input;
}

function kspKnowledgeFilterAuditMetadata_(request) {
  var filters = kspKnowledgeRequestFilters_(request);
  var output = {};
  Object.keys(filters).forEach(function (key) {
    if (filters[key] !== '' && filters[key] !== null && filters[key] !== undefined) output[key] = filters[key];
  });
  var selected = request && Array.isArray(request.selectedEntityKeys) ? request.selectedEntityKeys : [];
  if (selected.length) output.selectedEntityKeys = selected.slice();
  return output;
}

function kspKnowledgeScopeSummary_(request) {
  var input = request || {};
  var filters = kspKnowledgeRequestFilters_(input);
  var parts = [];
  if (filters.dateFrom || filters.dateTo) parts.push('Date ' + (filters.dateFrom || '…') + '–' + (filters.dateTo || '…'));
  if (filters.counterpartyType) parts.push('Type ' + filters.counterpartyType);
  if (filters.entityKey) parts.push('Entity ' + filters.entityKey);
  if ((input.selectedEntityKeys || []).length) parts.push('Entities ' + input.selectedEntityKeys.join(', '));
  if (filters.gpId) parts.push('GP ' + filters.gpId);
  if (filters.assetClassId) parts.push('Asset ' + filters.assetClassId);
  if (filters.capitalTypeId) parts.push('Capital ' + filters.capitalTypeId);
  if (filters.teamId) parts.push('Team ' + filters.teamId);
  if (filters.fundStrategy) parts.push('Fund/Strategy ' + filters.fundStrategy);
  if (filters.followUp) parts.push('Follow-up ' + filters.followUp);
  if (filters.relatedGpId) parts.push('Related GP ' + filters.relatedGpId);
  if (filters.meetingTypeCode) parts.push('Meeting Type ' + filters.meetingTypeCode);
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
  if ((input.selectedEntityKeys || []).length >= KSP_KNOWLEDGE_MULTI_ENTITY_MIN) {
    lines.push('比較対象Entity（この安定キー以外を根拠に含めない）:');
    input.selectedEntityKeys.forEach(function (entityKey) { lines.push('- ' + entityKey); });
    lines.push('各Entityの事実と出典を対応付け、証拠がないEntityは明示的に証拠不足と記載してください。');
  }
  if (input.mode === KSP_KNOWLEDGE_SEARCH_MODES.FREE_QUESTION) lines.push('質問:', input.questionOrInstruction);
  else if (input.questionOrInstruction) lines.push('追加指示:', input.questionOrInstruction);
  return lines.join('\n');
}

function kspKnowledgeExactTokens_(value) {
  return kspMaintenanceSplitCodes_(value).map(kspAiTrim_).filter(Boolean);
}

function kspResolveKnowledgeAdvancedSourceIds_(request, meetingRows) {
  var input = kspKnowledgeRequestWithLegacyFilterAliases_(kspNormalizeCanonicalKnowledgeRequest_(request));
  var filters = kspKnowledgeRequestFilters_(input);
  if (!filters.relatedGpId && !filters.meetingTypeCode) return input;
  input.filters.sourceType = KSP_AI_SOURCE_TYPES.MEETING;
  input.sourceType = KSP_AI_SOURCE_TYPES.MEETING;
  var sourceIds = (meetingRows || []).filter(function (row) {
    if (String(row.Status || '') !== KSP_STATUS.ACTIVE) return false;
    if (filters.relatedGpId && kspKnowledgeExactTokens_(kspMeetingRelatedGpIds_(row)).indexOf(filters.relatedGpId) === -1) return false;
    if (filters.meetingTypeCode && kspKnowledgeExactTokens_(row.Meeting_Type_Codes).indexOf(filters.meetingTypeCode) === -1) return false;
    return typeof kspKnowledgeExportRowMatches_ !== 'function' || kspKnowledgeExportRowMatches_(row, input);
  }).map(function (row) { return kspAiTrim_(row.Meeting_ID); }).filter(Boolean);
  sourceIds = kspUniqueStrings_(sourceIds);
  kspAssert_(sourceIds.length <= KSP_KNOWLEDGE_ADVANCED_SOURCE_ID_MAX,
    'AI_ADVANCED_FILTER_TOO_BROAD', '該当するMeetingが多すぎます。条件を絞ってください。');
  input.resolvedSourceIds = sourceIds;
  input.advancedFilterResolved = true;
  return kspKnowledgeRequestWithLegacyFilterAliases_(input);
}

function kspBuildKnowledgeEntityEvidence_(request, catalog, citations) {
  var selected = request && Array.isArray(request.selectedEntityKeys) ? request.selectedEntityKeys : [];
  var entities = catalog && catalog.counterpartyEntities || [];
  return selected.map(function (entityKey) {
    var catalogItem = entities.filter(function (item) { return item.entityKey === entityKey; })[0] || {};
    var entityCitations = (citations || []).filter(function (citation) { return citation.entityKey === entityKey; });
    return {
      entityKey: entityKey,
      counterpartyType: catalogItem.type || entityKey.split(':')[0],
      displayName: catalogItem.name || entityKey,
      evidenceStatus: entityCitations.length ? 'CITED' : 'NO_EVIDENCE',
      citationCount: entityCitations.length,
      citations: entityCitations
    };
  });
}

function kspGuardKnowledgeComparisonCitations_(request, catalog, citations) {
  var selected = request && Array.isArray(request.selectedEntityKeys) ? request.selectedEntityKeys : [];
  if (selected.length < KSP_KNOWLEDGE_MULTI_ENTITY_MIN) {
    return { citations: citations || [], warnings: [], entityEvidence: [] };
  }
  var allowed = {};
  selected.forEach(function (entityKey) { allowed[entityKey] = true; });
  var rejected = false;
  var kept = (citations || []).filter(function (citation) {
    if (allowed[citation.entityKey]) return true;
    rejected = true;
    return false;
  });
  var evidence = kspBuildKnowledgeEntityEvidence_(request, catalog, kept);
  var warnings = [];
  if (rejected) warnings.push({
    code: 'AI_UNSELECTED_ENTITY_CITATION',
    message: '選択外EntityのCitationを検出したため比較結果から除外しました。'
  });
  evidence.filter(function (item) { return item.evidenceStatus === 'NO_EVIDENCE'; }).forEach(function (item) {
    warnings.push({ code: 'AI_ENTITY_EVIDENCE_GAP', message: item.displayName + 'の根拠資料が確認できません。' });
  });
  return { citations: kept, warnings: warnings, entityEvidence: evidence, rejectedUnselected: rejected };
}
