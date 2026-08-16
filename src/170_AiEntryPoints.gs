function runAiSyncWorker() {
  return kspRunFeatureFreezeAiSync(kspCreateFeatureFreezeAiEnvironment_());
}

function getKnowledgeSearchBootstrapData() {
  return kspGetFeatureFreezeKnowledgeBootstrap(kspCreateFeatureFreezeAiEnvironment_());
}

function searchKnowledge(input) {
  return kspRunFeatureFreezeKnowledgeSearch(kspCreateFeatureFreezeAiEnvironment_(), input);
}

function askKnowledgeQuestion(input) {
  var payload = kspDeepClone(input || {});
  payload.mode = KSP_FEATURE_FREEZE_SEARCH_MODES.FREE_QUESTION;
  return kspRunFeatureFreezeKnowledgeSearch(kspCreateFeatureFreezeAiEnvironment_(), payload);
}

function getFeatureFreezeDiagnostics() {
  return kspGetFeatureFreezeDiagnostics(kspCreateFeatureFreezeAiEnvironment_());
}
