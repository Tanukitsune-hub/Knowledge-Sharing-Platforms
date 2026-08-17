function runAiSyncWorker_() {
  return kspRunFeatureFreezeAiSync_(kspCreateFeatureFreezeAiEnvironment_());
}

function getKnowledgeSearchBootstrapData() {
  return kspGetFeatureFreezeKnowledgeBootstrap_(kspCreateFeatureFreezeAiEnvironment_());
}

function searchKnowledge(input) {
  return kspRunFeatureFreezeKnowledgeSearch_(kspCreateFeatureFreezeAiEnvironment_(), input);
}

function askKnowledgeQuestion_(input) {
  var payload = kspDeepClone_(input || {});
  payload.mode = KSP_FEATURE_FREEZE_SEARCH_MODES.FREE_QUESTION;
  return kspRunFeatureFreezeKnowledgeSearch_(kspCreateFeatureFreezeAiEnvironment_(), payload);
}

function getFeatureFreezeDiagnostics_() {
  return kspGetFeatureFreezeDiagnostics_(kspCreateFeatureFreezeAiEnvironment_());
}
