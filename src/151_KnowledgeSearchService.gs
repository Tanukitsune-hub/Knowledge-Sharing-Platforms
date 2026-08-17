function kspGetKnowledgeSearchBootstrap_(environment) {
  try {
    var context = environment.loadAiContext();
    var settings = kspNormalizeAiSettings_(context.settings);
    return {
      ok: true,
      workId: KSP_AI_WORK_ID,
      appVersion: KSP_AI_APP_VERSION,
      configured: Boolean(settings.storeName && settings.modelId),
      implementedModes: [KSP_AI_SEARCH_MODES.FREE_QUESTION],
      targetModes: ['自由質問', '要約', '時系列', '比較', '面談準備'],
      options: kspBuildKnowledgeSearchCatalog_(context.gpRows, context.optionRows),
      syncIntervalMinutes: settings.syncIntervalMinutes
    };
  } catch (error) {
    return {
      ok: false,
      workId: KSP_AI_WORK_ID,
      error: { code: kspGetErrorCode_(error), message: kspSafePublicErrorMessage_(kspGetErrorCode_(error), 'SEARCH') }
    };
  }
}

function kspGetAiActorSafely_(environment, warnings) {
  try {
    return environment.getActor() || 'UNIDENTIFIED';
  } catch (error) {
    warnings.push({ code: 'ACTOR_RESOLUTION_FAILED', message: kspSafeOperationalWarning_('ACTOR_RESOLUTION_FAILED') });
    return 'UNIDENTIFIED';
  }
}

function kspTryAppendKnowledgeAudit_(environment, auditSpreadsheetId, row, warnings) {
  try {
    environment.appendAuditRow(auditSpreadsheetId, row);
  } catch (error) {
    warnings.push({ code: 'AUDIT_WRITE_FAILED', message: kspSafeOperationalWarning_('AUDIT_WRITE_FAILED') });
  }
}

function kspRunFreeQuestion_(environment, rawInput) {
  var warnings = [];
  var actor = kspGetAiActorSafely_(environment, warnings);
  var input = kspNormalizeKnowledgeSearchInput_(rawInput);
  var context = null;
  var settings = null;
  var auditSpreadsheetId = '';

  try {
    kspAssert_(kspClaimPublicOperation_(environment, 'KNOWLEDGE_SEARCH', actor, 'FREE_QUESTION', 2),
      'AI_RATE_LIMITED', '検索が集中しています。少し待って再試行してください。');
    input = kspValidateKnowledgeSearchInput_(input);
    context = environment.loadAiContext();
    settings = kspNormalizeAiSettings_(context.settings);
    auditSpreadsheetId = context.auditSpreadsheetId;
    kspAssert_(settings.storeName, 'AI_STORE_NOT_CONFIGURED', 'Gemini File Search Storeが設定されていません。');
    kspAssert_(settings.modelId, 'AI_MODEL_NOT_CONFIGURED', 'Gemini Flash model IDが設定されていません。');

    var catalog = kspBuildKnowledgeSearchCatalog_(context.gpRows, context.optionRows);
    kspValidateKnowledgeFilterIds_(input, catalog);
    var metadataFilter = kspBuildMetadataFilter_(input);
    var request = kspBuildInteractionRequest_({
      storeName: settings.storeName,
      modelId: settings.modelId,
      question: input.question,
      metadataFilter: metadataFilter
    });
    var rawResponse = environment.queryFileSearch(request);
    var parsed = kspParseInteractionResponse_(rawResponse);
    var mapped = kspMapKnowledgeCitations_(
      parsed.citations,
      kspBuildAuthoritativeSourceMaps_(context.meetingRows, context.pitchbookRows)
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

    var successAudit = kspBuildKnowledgeSearchAuditRow_({
      timestamp: environment.nowIso(),
      actor: actor,
      input: input,
      modelId: settings.modelId,
      interactionId: parsed.interactionId,
      result: KSP_AUDIT_RESULTS.SUCCESS,
      citations: mapped.citations
    });
    kspTryAppendKnowledgeAudit_(environment, auditSpreadsheetId, successAudit, warnings);

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
      var failureAudit = kspBuildKnowledgeSearchAuditRow_({
        timestamp: environment.nowIso(),
        actor: actor,
        input: input,
        modelId: settings ? settings.modelId : '',
        result: KSP_AUDIT_RESULTS.FAILURE,
        errorCode: kspGetErrorCode_(error),
        errorMessage: kspSafePublicErrorMessage_(kspGetErrorCode_(error), 'SEARCH'),
        citations: []
      });
      kspTryAppendKnowledgeAudit_(environment, auditSpreadsheetId, failureAudit, warnings);
    }
    return {
      ok: false,
      workId: KSP_AI_WORK_ID,
      error: { code: kspGetErrorCode_(error), message: kspSafePublicErrorMessage_(kspGetErrorCode_(error), 'SEARCH') },
      warnings: warnings
    };
  }
}
