var KSP_FEATURE_FREEZE_SEARCH_MODES = Object.freeze({
  FREE_QUESTION: '自由質問',
  SUMMARY: '要約',
  TIMELINE: '時系列',
  COMPARISON: '比較',
  MEETING_PREP: '面談準備'
});

var KSP_FEATURE_FREEZE_MODE_ORDER = Object.freeze([
  KSP_FEATURE_FREEZE_SEARCH_MODES.FREE_QUESTION,
  KSP_FEATURE_FREEZE_SEARCH_MODES.SUMMARY,
  KSP_FEATURE_FREEZE_SEARCH_MODES.TIMELINE,
  KSP_FEATURE_FREEZE_SEARCH_MODES.COMPARISON,
  KSP_FEATURE_FREEZE_SEARCH_MODES.MEETING_PREP
]);

function kspGetFeatureFreezeModeDefinition(mode) {
  var definitions = {};
  definitions[KSP_FEATURE_FREEZE_SEARCH_MODES.FREE_QUESTION] = {
    mode: KSP_FEATURE_FREEZE_SEARCH_MODES.FREE_QUESTION,
    inputLabel: '質問',
    placeholder: '例: 最近の資料では、APACインフラの投資機会についてどのような見解が示されていますか？',
    inputRequired: true, gpRequired: false
  };
  definitions[KSP_FEATURE_FREEZE_SEARCH_MODES.SUMMARY] = {
    mode: KSP_FEATURE_FREEZE_SEARCH_MODES.SUMMARY,
    inputLabel: '追加指示', placeholder: '任意: リスクと投資機会を中心に整理してください。',
    inputRequired: false, gpRequired: false
  };
  definitions[KSP_FEATURE_FREEZE_SEARCH_MODES.TIMELINE] = {
    mode: KSP_FEATURE_FREEZE_SEARCH_MODES.TIMELINE,
    inputLabel: '追加指示', placeholder: '任意: 過去12か月の変化を中心に整理してください。',
    inputRequired: false, gpRequired: false
  };
  definitions[KSP_FEATURE_FREEZE_SEARCH_MODES.COMPARISON] = {
    mode: KSP_FEATURE_FREEZE_SEARCH_MODES.COMPARISON,
    inputLabel: '追加指示', placeholder: '任意: 投資機会、リスク、見通しの共通軸で比較してください。',
    inputRequired: false, gpRequired: false
  };
  definitions[KSP_FEATURE_FREEZE_SEARCH_MODES.MEETING_PREP] = {
    mode: KSP_FEATURE_FREEZE_SEARCH_MODES.MEETING_PREP,
    inputLabel: '追加指示', placeholder: '任意: 次回面談で確認したいテーマを入力してください。',
    inputRequired: false, gpRequired: true
  };
  var normalized = kspAiTrim(mode) || KSP_FEATURE_FREEZE_SEARCH_MODES.FREE_QUESTION;
  kspAssert(definitions[normalized], 'AI_SEARCH_MODE_INVALID', '検索モードが不正です。');
  return definitions[normalized];
}

function kspGetFeatureFreezeModeDefinitions() {
  return KSP_FEATURE_FREEZE_MODE_ORDER.map(function (mode) {
    return kspDeepClone(kspGetFeatureFreezeModeDefinition(mode));
  });
}

function kspNormalizeFeatureFreezeSearchInput(input) {
  var source = input && typeof input === 'object' ? input : {};
  var instruction = kspAiTrim(
    source.questionOrInstruction !== undefined ? source.questionOrInstruction :
      (source.question !== undefined ? source.question : source.instruction)
  );
  return {
    mode: kspAiTrim(source.mode) || KSP_FEATURE_FREEZE_SEARCH_MODES.FREE_QUESTION,
    question: instruction,
    questionOrInstruction: instruction,
    dateFrom: kspAiTrim(source.dateFrom),
    dateTo: kspAiTrim(source.dateTo),
    gpId: kspAiTrim(source.gpId),
    assetClassId: kspAiTrim(source.assetClassId),
    capitalTypeId: kspAiTrim(source.capitalTypeId),
    sourceType: kspAiTrim(source.sourceType)
  };
}

function kspValidateFeatureFreezeSearchInput(input) {
  var definition = kspGetFeatureFreezeModeDefinition(input.mode);
  if (definition.inputRequired) kspAssert(input.questionOrInstruction, 'AI_QUESTION_REQUIRED', '質問を入力してください。');
  kspAssert(input.questionOrInstruction.length <= KSP_AI_DEFAULTS.MAX_QUESTION_LENGTH,
    'AI_QUESTION_TOO_LONG', '質問または追加指示は5,000文字以内で入力してください。');
  if (definition.gpRequired) kspAssert(input.gpId, 'AI_MEETING_PREP_GP_REQUIRED', '面談準備ではGPを選択してください。');
  if (input.dateFrom) kspAssert(kspIsValidDateKey(input.dateFrom), 'AI_DATE_FROM_INVALID', 'Date Fromが不正です。');
  if (input.dateTo) kspAssert(kspIsValidDateKey(input.dateTo), 'AI_DATE_TO_INVALID', 'Date Toが不正です。');
  if (input.dateFrom && input.dateTo) kspAssert(input.dateFrom <= input.dateTo, 'AI_DATE_RANGE_INVALID', 'Date FromはDate To以前にしてください。');
  if (input.sourceType) {
    kspAssert(input.sourceType === KSP_AI_SOURCE_TYPES.MEETING || input.sourceType === KSP_AI_SOURCE_TYPES.PITCHBOOK,
      'AI_SOURCE_TYPE_INVALID', 'Source Typeが不正です。');
  }
  return input;
}

function kspBuildFeatureFreezePrompt(input) {
  var mode = kspGetFeatureFreezeModeDefinition(input.mode).mode;
  var instruction = kspAiTrim(input.questionOrInstruction || input.question);
  var common = [
    '社内ナレッジベースからFile Searchで取得された資料だけを根拠として、日本語で回答してください。',
    '根拠が不足する箇所は推測で埋めず、確認できない点と証拠不足を明示してください。',
    '外部知識や一般論を、資料に記載された事実として扱わないでください。',
    '重要な事実・比較・変化には、取得資料に対応するCitationを付けてください。',
    '', 'モード: ' + mode
  ];
  var lines = [];
  if (mode === KSP_FEATURE_FREEZE_SEARCH_MODES.FREE_QUESTION) {
    lines = ['最初に質問への直接回答を示し、その後に根拠となる要点を簡潔に整理してください。', '質問:', instruction];
  } else if (mode === KSP_FEATURE_FREEZE_SEARCH_MODES.SUMMARY) {
    lines = ['複数資料を横断して統合し、資料ごとの要約を単純に並べないでください。', '主要テーマ、重要事実・見解、裏付けられた変化や矛盾、簡潔な示唆の順で整理してください。'];
  } else if (mode === KSP_FEATURE_FREEZE_SEARCH_MODES.TIMELINE) {
    lines = ['日付または期間順に整理し、前期からの変化と継続している事項を区別してください。', '異なる資料が異なる話題を扱っているだけの場合、それを変化と断定しないでください。', '証拠が途切れる期間や比較不能な点を明示してください。'];
  } else if (mode === KSP_FEATURE_FREEZE_SEARCH_MODES.COMPARISON) {
    lines = ['対象を、資料で共通して確認できる軸にそろえて比較してください。', '裏付けがある場合は簡潔な比較表を使い、共通点、相違点、合意、見解の不一致を示してください。', '資料にない評価軸、順位付け、優劣を作らないでください。'];
  } else if (mode === KSP_FEATURE_FREEZE_SEARCH_MODES.MEETING_PREP) {
    lines = ['選択されたGPとの次回面談に向けた実務的なBriefを作成してください。', '最近の面談・資料、主要アップデート、過去からの変化、未解決論点、再確認事項、質問候補を整理してください。', '質問候補は、取得資料で確認できる未解決点や変化に結びつけてください。'];
  }
  if (mode !== KSP_FEATURE_FREEZE_SEARCH_MODES.FREE_QUESTION && instruction) lines.push('追加指示:', instruction);
  return common.concat(lines).join('\n');
}

function kspBuildFeatureFreezeInteractionRequest(params) {
  var options = params || {};
  var modelId = kspAiTrim(options.modelId);
  var storeName = kspAiStoreResourcePath(options.storeName);
  var input = kspValidateFeatureFreezeSearchInput(kspNormalizeFeatureFreezeSearchInput({
    mode: options.mode,
    questionOrInstruction: options.questionOrInstruction,
    gpId: options.gpId
  }));
  kspAssert(modelId, 'AI_MODEL_NOT_CONFIGURED', 'Gemini Flash model IDが設定されていません。');
  var tool = { type: 'file_search', file_search_store_names: [storeName] };
  var filter = kspAiTrim(options.metadataFilter);
  if (filter) tool.metadata_filter = filter;
  return { model: modelId, input: kspBuildFeatureFreezePrompt(input), tools: [tool] };
}

function kspBuildFeatureFreezeAuditRow(params) {
  var options = params || {};
  var input = options.input || {};
  var sourceIds = (options.citations || []).map(function (citation) { return citation.sourceId; });
  return {
    Event_Timestamp: options.timestamp || '', Actor: options.actor || 'UNIDENTIFIED',
    Action: 'AI_QUERY', Target_Type: 'KnowledgeSearch', Target_ID: options.interactionId || '',
    Result: options.result || KSP_AUDIT_RESULTS.FAILURE,
    Changed_Fields: '', Before_Metadata_JSON: '', After_Metadata_JSON: '', Batch_ID: '',
    Error_Code: options.errorCode || '', Error_Message: options.errorMessage || '',
    Search_Mode: input.mode || KSP_FEATURE_FREEZE_SEARCH_MODES.FREE_QUESTION,
    Question_Or_Instruction: input.questionOrInstruction || input.question || '',
    Date_From: input.dateFrom || '', Date_To: input.dateTo || '', GP_Filter: input.gpId || '',
    Asset_Class_Filter: input.assetClassId || '', Capital_Type_Filter: input.capitalTypeId || '',
    Source_Type_Filter: input.sourceType || '', Model_ID: options.modelId || '',
    Cited_Source_IDs: kspUniqueStrings(sourceIds).join(',')
  };
}

function kspGetFeatureFreezeKnowledgeBootstrap(environment) {
  try {
    var context = environment.loadAiContext();
    var settings = kspNormalizeAiSettings(context.settings);
    return {
      ok: true, workId: KSP_FEATURE_FREEZE_WORK_ID, appVersion: KSP_FEATURE_FREEZE_APP_VERSION,
      configured: Boolean(settings.storeName && settings.modelId),
      implementedModes: KSP_FEATURE_FREEZE_MODE_ORDER.slice(), targetModes: KSP_FEATURE_FREEZE_MODE_ORDER.slice(),
      modeDefinitions: kspGetFeatureFreezeModeDefinitions(),
      options: kspBuildKnowledgeSearchCatalog(context.gpRows, context.optionRows),
      syncIntervalMinutes: settings.syncIntervalMinutes
    };
  } catch (error) {
    return { ok: false, workId: KSP_FEATURE_FREEZE_WORK_ID, error: { code: kspGetErrorCode(error), message: error.message || String(error) } };
  }
}

function kspRunFeatureFreezeKnowledgeSearch(environment, rawInput) {
  var warnings = [];
  var actor = kspGetAiActorSafely(environment, warnings);
  var input = kspNormalizeFeatureFreezeSearchInput(rawInput);
  var context = null;
  var settings = null;
  var auditSpreadsheetId = '';
  try {
    context = environment.loadAiContext();
    settings = kspNormalizeAiSettings(context.settings);
    auditSpreadsheetId = context.auditSpreadsheetId;
    input = kspValidateFeatureFreezeSearchInput(input);
    kspAssert(settings.storeName, 'AI_STORE_NOT_CONFIGURED', 'Gemini File Search Storeが設定されていません。');
    kspAssert(settings.modelId, 'AI_MODEL_NOT_CONFIGURED', 'Gemini Flash model IDが設定されていません。');
    var catalog = kspBuildKnowledgeSearchCatalog(context.gpRows, context.optionRows);
    kspValidateKnowledgeFilterIds(input, catalog);
    var metadataFilter = kspBuildMetadataFilter(input);
    var request = kspBuildFeatureFreezeInteractionRequest({
      storeName: settings.storeName, modelId: settings.modelId, mode: input.mode,
      questionOrInstruction: input.questionOrInstruction, gpId: input.gpId, metadataFilter: metadataFilter
    });
    var parsed = kspParseInteractionResponse(environment.queryFileSearch(request));
    var mapped = kspMapKnowledgeCitations(parsed.citations, kspBuildAuthoritativeSourceMaps(context.meetingRows, context.pitchbookRows));
    warnings = warnings.concat(mapped.warnings);
    var answer = parsed.answer;
    var insufficientEvidence = !answer || mapped.citations.length === 0;
    if (!answer) answer = '確認できる根拠が不足しています。';
    if (insufficientEvidence) warnings.push({ code: 'AI_INSUFFICIENT_EVIDENCE', message: '回答または authoritative citation が不足しています。' });
    kspTryAppendKnowledgeAudit(environment, auditSpreadsheetId, kspBuildFeatureFreezeAuditRow({
      timestamp: environment.nowIso(), actor: actor, input: input, modelId: settings.modelId,
      interactionId: parsed.interactionId, result: KSP_AUDIT_RESULTS.SUCCESS, citations: mapped.citations
    }), warnings);
    return {
      ok: true, workId: KSP_FEATURE_FREEZE_WORK_ID, mode: input.mode, answer: answer,
      citations: mapped.citations, insufficientEvidence: insufficientEvidence,
      metadataFilter: metadataFilter, interactionId: parsed.interactionId, warnings: warnings
    };
  } catch (error) {
    if (context && auditSpreadsheetId) {
      kspTryAppendKnowledgeAudit(environment, auditSpreadsheetId, kspBuildFeatureFreezeAuditRow({
        timestamp: environment.nowIso(), actor: actor, input: input,
        modelId: settings ? settings.modelId : '', result: KSP_AUDIT_RESULTS.FAILURE,
        errorCode: kspGetErrorCode(error), errorMessage: error.message || String(error), citations: []
      }), warnings);
    }
    return { ok: false, workId: KSP_FEATURE_FREEZE_WORK_ID, mode: input.mode, error: { code: kspGetErrorCode(error), message: error.message || String(error) }, warnings: warnings };
  }
}
