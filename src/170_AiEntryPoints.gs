function runAiSyncWorker() {
  return kspRunFeatureFreezeAiSync(kspCreateFeatureFreezeAiEnvironment());
}

function getKnowledgeSearchBootstrapData() {
  return kspGetFeatureFreezeKnowledgeBootstrap(kspCreateFeatureFreezeAiEnvironment());
}

function searchKnowledge(input) {
  return kspRunFeatureFreezeKnowledgeSearch(kspCreateFeatureFreezeAiEnvironment(), input);
}

function askKnowledgeQuestion(input) {
  var payload = kspDeepClone(input || {});
  payload.mode = KSP_FEATURE_FREEZE_SEARCH_MODES.FREE_QUESTION;
  return kspRunFeatureFreezeKnowledgeSearch(kspCreateFeatureFreezeAiEnvironment(), payload);
}

function getFeatureFreezeDiagnostics() {
  return kspGetFeatureFreezeDiagnostics(kspCreateFeatureFreezeAiEnvironment());
}
