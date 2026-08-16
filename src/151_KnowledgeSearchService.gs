function kspGetKnowledgeSearchBootstrap(environment) {
  try {
    var context = environment.loadAiContext();
    var settings = kspNormalizeAiSettings(context.settings);
    return {
      ok: true,
      workId: KSP_AI_WORK_ID,
      appVersion: KSP_AI_APP_VERSION,
      configured: Boolean(settings.storeName && settings.modelId),
      implementedModes: [KSP_AI_SEARCH_MODES.FREE_QUESTION],
      targetModes: ['自由質問', '要約', '時系列', '比較', '面談準備'],
      options: kspBuildKnowledgeSearchCatalog(context.gpRows, context.optionRows),
      syncIntervalMinutes: settings.syncIntervalMinutes
    };
  } catch (error) {
    return {
      ok: false,
      workId: KSP_AI_WORK_ID,
      error: { code: kspGetErrorCode(error), message: error.message || String(error) }
    };
  }
}

function kspGetAiActorSafely(environment, warnings) {
  try {
    return environment.getActor() || 'UNIDENTIFIED';
  } catch (error) {
    warnings.push({ code: 'ACTOR_RESOLUTION_FAILED', message: error.message || String(error) });
    return 'UNIDENTIFIED';
  }
}

function kspTryAppendKnowledgeAudit(environment, auditSpreadsheetId, row, warnings) {
  try {
    environment.appendAuditRow(auditSpreadsheetId, row);
  } catch (error) {
    warnings.push({ code: 'AUDIT_WRITE_FAILED', message: error.message || String(error) });
  }
}

function kspRunFreeQuestion(environment, rawInput) {
  var warnings = [];
  var actor = kspGetAiActorSafely(environment, warnings);
  var input = kspNormalizeKnowledgeSearchInput(rawInput);
  var context = null;
  var settings = null;
  var auditSpreadsheetId = '';

  try {
    input = kspValidateKnowledgeSearchInput(input);
    context = environment.loadAiContext();
    settings = kspNormalizeAiSettings(context.settings);
    auditSpreadsheetId = context.auditSpreadsheetId;
    kspAssert(settings.storeName, 'AI_STORE_NOT_CONFIGURED', 'Gemini File Search Storeが設定されていません。');
    kspAssert(settings.modelId, 'AI_MODEL_NOT_CONFIGURED', 'Gemini Flash model IDが設定されていません。');

    var catalog = kspBuildKnowledgeSearchCatalog(context.gpRows, context.optionRows);
    kspValidateKnowledgeFilterIds(input, catalog);
    var metadataFilter = kspBuildMetadataFilter(input);
    var request = kspBuildInteractionRequest({
      storeName: settings.storeName,
      modelId: settings.modelId,
      question: input.question,
      metadataFilter: metadataFilter
    });
    var rawResponse = environment.queryFileSearch(request);
    var parsed = kspParseInteractionResponse(rawResponse);
    var mapped = kspMapKnowledgeCitations(
      parsed.citations,
      kspBuildAuthoritativeSourceMaps(context.meetingRows, context.pitchbookRows)
    );
    warnings = warnings.concat(mapped.warnings);

    var answer = parsed.answer;
    var insufficientEvidence = !answer || mapped.citations.length === 0;
    if (!answer) answer = '確認できる根拠が不足しています。';
    if (insufficientEvidence) {
      warnings.push({
        code: 'AI_INSUFFICIENT_EVIDENCE',
        message: '回答または authoritative citation が不足しています。'
      });
    }

    var successAudit = kspBuildKnowledgeSearchAuditRow({
      timestamp: environment.nowIso(),
      actor: actor,
      input: input,
      modelId: settings.modelId,
      interactionId: parsed.interactionId,
      result: KSP_AUDIT_RESULTS.SUCCESS,
      citations: mapped.citations
    });
    kspTryAppendKnowledgeAudit(environment, auditSpreadsheetId, successAudit, warnings);

    return {
      ok: true,
      workId: KSP_AI_WORK_ID,
      mode: KSP_AI_SEARCH_MODES.FREE_QUESTION,
      answer: answer,
      citations: mapped.citations,
      insufficientEvidence: insufficientEvidence,
      metadataFilter: metadataFilter,
      interactionId: parsed.interactionId,
      warnings: warnings
    };
  } catch (error) {
    if (context && auditSpreadsheetId) {
      var failureAudit = kspBuildKnowledgeSearchAuditRow({
        timestamp: environment.nowIso(),
        actor: actor,
        input: input,
        modelId: settings ? settings.modelId : '',
        result: KSP_AUDIT_RESULTS.FAILURE,
        errorCode: kspGetErrorCode(error),
        errorMessage: error.message || String(error),
        citations: []
      });
      kspTryAppendKnowledgeAudit(environment, auditSpreadsheetId, failureAudit, warnings);
    }
    return {
      ok: false,
      workId: KSP_AI_WORK_ID,
      error: { code: kspGetErrorCode(error), message: error.message || String(error) },
      warnings: warnings
    };
  }
}
