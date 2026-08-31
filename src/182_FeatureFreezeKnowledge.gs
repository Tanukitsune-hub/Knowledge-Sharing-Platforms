var KSP_FEATURE_FREEZE_SEARCH_MODES = KSP_KNOWLEDGE_SEARCH_MODES;
var KSP_FEATURE_FREEZE_MODE_ORDER = KSP_KNOWLEDGE_MODE_ORDER;

function kspGetFeatureFreezeModeDefinition_(mode) {
  var definition = kspGetKnowledgeModeDefinition_(mode);
  definition.gpRequired = definition.targetRequired;
  return definition;
}

function kspGetFeatureFreezeModeDefinitions_() {
  return kspGetKnowledgeModeDefinitions_().map(function (definition) {
    definition.gpRequired = definition.targetRequired;
    return definition;
  });
}

function kspNormalizeFeatureFreezeSearchInput_(input) {
  var normalized = kspNormalizeCanonicalKnowledgeRequest_(input);
  normalized.question = normalized.questionOrInstruction;
  return normalized;
}

function kspValidateFeatureFreezeSearchInput_(input) {
  return kspValidateCanonicalKnowledgeRequest_(input);
}

function kspBuildFeatureFreezePrompt_(input) {
  return kspBuildCanonicalKnowledgePrompt_(input);
}

function kspBuildFeatureFreezeInteractionRequest_(params) {
  var options = params || {};
  var modelId = kspAiTrim_(options.modelId);
  var storeName = kspAiStoreResourcePath_(options.storeName);
  var input = kspValidateFeatureFreezeSearchInput_(kspNormalizeFeatureFreezeSearchInput_({
    mode: options.mode,
    questionOrInstruction: options.questionOrInstruction,
    gpId: options.gpId
  }));
  kspAssert_(modelId, 'AI_MODEL_NOT_CONFIGURED', 'Gemini Flash model IDが設定されていません。');
  var tool = { type: 'file_search', file_search_store_names: [storeName] };
  var filter = kspAiTrim_(options.metadataFilter);
  if (filter) tool.metadata_filter = filter;
  return {
    model: modelId,
    input: kspBuildFeatureFreezePrompt_(input),
    tools: [tool],
    background: true,
    generation_config: {
      thinking_level: KSP_AI_DEFAULTS.QUERY_THINKING_LEVEL,
      max_output_tokens: KSP_AI_DEFAULTS.QUERY_MAX_OUTPUT_TOKENS
    }
  };
}

function kspBuildFeatureFreezeAuditRow_(params) {
  var options = params || {};
  var input = options.input || {};
  var sourceIds = (options.citations || []).map(function (citation) { return citation.sourceId; });
  return {
    Event_Timestamp: kspCanonicalInstantIso_(options.timestamp), Actor: options.actor || 'UNIDENTIFIED',
    Action: 'AI_QUERY', Target_Type: 'KnowledgeSearch', Target_ID: options.interactionId || '',
    Result: options.result || KSP_AUDIT_RESULTS.FAILURE,
    Changed_Fields: '', Before_Metadata_JSON: '', After_Metadata_JSON: '', Batch_ID: '',
    Error_Code: options.errorCode || '', Error_Message: options.errorCode ? kspSafePublicErrorMessage_(options.errorCode, 'SEARCH') : '',
    Search_Mode: input.mode || KSP_FEATURE_FREEZE_SEARCH_MODES.FREE_QUESTION,
    Question_Or_Instruction: '',
    Date_From: input.dateFrom || '', Date_To: input.dateTo || '', GP_Filter: input.gpId || '',
    Asset_Class_Filter: input.assetClassId || '', Capital_Type_Filter: input.capitalTypeId || '',
    Source_Type_Filter: input.sourceType || '', Model_ID: options.modelId || '',
    Cited_Source_IDs: kspUniqueStrings_(sourceIds).join(',')
  };
}

function kspGetFeatureFreezeKnowledgeBootstrap_(environment) {
  try {
    var context = environment.loadAiContext();
    var settings = kspNormalizeAiSettings_(context.settings);
    return {
      ok: true, workId: KSP_FEATURE_FREEZE_WORK_ID, appVersion: KSP_FEATURE_FREEZE_APP_VERSION,
      configured: Boolean(settings.storeName && settings.modelId),
      implementedModes: KSP_FEATURE_FREEZE_MODE_ORDER.slice(), targetModes: KSP_FEATURE_FREEZE_MODE_ORDER.slice(),
      modeDefinitions: kspGetFeatureFreezeModeDefinitions_(),
      options: kspBuildKnowledgeSearchCatalog_(context.gpRows, context.optionRows,
        context.meetingRows, context.pitchbookRows),
      syncIntervalMinutes: settings.syncIntervalMinutes
    };
  } catch (error) {
    return { ok: false, workId: KSP_FEATURE_FREEZE_WORK_ID, error: { code: kspGetErrorCode_(error), message: kspSafePublicErrorMessage_(kspGetErrorCode_(error), 'SEARCH') } };
  }
}

function kspRunFeatureFreezeKnowledgeSearch_(environment, rawInput) {
  var warnings = [];
  var actor = kspGetAiActorSafely_(environment, warnings);
  var input = kspNormalizeFeatureFreezeSearchInput_(rawInput);
  var context = null;
  var settings = null;
  var auditSpreadsheetId = '';
  try {
    kspAssert_(kspClaimPublicOperation_(environment, 'KNOWLEDGE_SEARCH', actor, 'FIVE_MODES', 2),
      'AI_RATE_LIMITED', '検索が集中しています。少し待って再試行してください。');
    context = environment.loadAiContext();
    settings = kspNormalizeAiSettings_(context.settings);
    auditSpreadsheetId = context.auditSpreadsheetId;
    input = kspValidateFeatureFreezeSearchInput_(input);
    kspAssert_(settings.storeName, 'AI_STORE_NOT_CONFIGURED', 'Gemini File Search Storeが設定されていません。');
    kspAssert_(settings.modelId, 'AI_MODEL_NOT_CONFIGURED', 'Gemini Flash model IDが設定されていません。');
    var catalog = kspBuildKnowledgeSearchCatalog_(context.gpRows, context.optionRows,
      context.meetingRows, context.pitchbookRows);
    kspValidateKnowledgeFilterIds_(input, catalog);
    var metadataFilter = kspBuildMetadataFilter_(input);
    var request = kspBuildFeatureFreezeInteractionRequest_({
      storeName: settings.storeName, modelId: settings.modelId, mode: input.mode,
      questionOrInstruction: input.questionOrInstruction, gpId: input.gpId, metadataFilter: metadataFilter
    });
    var parsed = kspParseInteractionResponse_(environment.queryFileSearch(request));
    var mapped = kspMapKnowledgeCitations_(parsed.citations, kspBuildAuthoritativeSourceMaps_(context.meetingRows, context.pitchbookRows));
    warnings = warnings.concat(mapped.warnings);
    var answer = parsed.answer;
    var insufficientEvidence = !answer || mapped.citations.length === 0;
    if (!answer) answer = '確認できる根拠が不足しています。';
    if (insufficientEvidence) warnings.push({ code: 'AI_INSUFFICIENT_EVIDENCE', message: '回答または authoritative citation が不足しています。' });
    kspTryAppendKnowledgeAudit_(environment, auditSpreadsheetId, kspBuildFeatureFreezeAuditRow_({
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
      kspTryAppendKnowledgeAudit_(environment, auditSpreadsheetId, kspBuildFeatureFreezeAuditRow_({
        timestamp: environment.nowIso(), actor: actor, input: input,
        modelId: settings ? settings.modelId : '', result: KSP_AUDIT_RESULTS.FAILURE,
        errorCode: kspGetErrorCode_(error), errorMessage: kspSafePublicErrorMessage_(kspGetErrorCode_(error), 'SEARCH'), citations: []
      }), warnings);
    }
    return { ok: false, workId: KSP_FEATURE_FREEZE_WORK_ID, mode: input.mode, error: { code: kspGetErrorCode_(error), message: kspSafePublicErrorMessage_(kspGetErrorCode_(error), 'SEARCH') }, warnings: warnings };
  }
}
