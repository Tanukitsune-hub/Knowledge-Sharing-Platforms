function runAiSyncWorker_() {
  return kspRunProviderNeutralAiSync_(kspCreateProviderNeutralAiEnvironment_());
}

function getKnowledgeSearchBootstrapData() {
  return kspGetProviderNeutralKnowledgeBootstrap_(kspCreateProviderNeutralAiEnvironment_());
}

function searchKnowledge(input) {
  var payload = input || {};
  var route = String(payload.route || payload.provider || KSP_AI_ROUTES.GEMINI).toUpperCase();
  if (route === KSP_AI_ROUTES.FULL_EXPORT) {
    return { ok: false, workId: '0020', error: { code: 'AI_ROUTE_FULL_EXPORT_USE_PREVIEW', message: '全文出力は書き出し欄から実行してください。' } };
  }
  return kspRunProviderKnowledgeSearch_(kspCreateProviderNeutralAiEnvironment_(), route, payload);
}

function askKnowledgeQuestion_(input) {
  var payload = kspDeepClone_(input || {});
  payload.mode = KSP_FEATURE_FREEZE_SEARCH_MODES.FREE_QUESTION;
  return kspRunProviderKnowledgeSearch_(kspCreateProviderNeutralAiEnvironment_(), KSP_AI_ROUTES.GEMINI, payload);
}

function getFeatureFreezeDiagnostics_() {
  return kspGetFeatureFreezeDiagnostics_(kspCreateFeatureFreezeAiEnvironment_());
}
