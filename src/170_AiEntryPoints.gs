function runAiSyncWorker() {
  return kspRunAiSync(kspCreateAiEnvironment());
}

function getKnowledgeSearchBootstrapData() {
  return kspGetKnowledgeSearchBootstrap(kspCreateAiEnvironment());
}

function askKnowledgeQuestion(input) {
  return kspRunFreeQuestion(kspCreateAiEnvironment(), input);
}
