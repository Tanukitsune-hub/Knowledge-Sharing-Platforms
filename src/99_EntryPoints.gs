function setupKnowledgePlatform() {
  var originalTriggerRegistry = kspGetTriggerRegistry;
  kspGetTriggerRegistry = function (config) {
    return originalTriggerRegistry(config).map(function (rule) {
      if (rule.handler === 'runAiSyncWorker') {
        var copy = kspDeepClone(rule);
        copy.available = true;
        return copy;
      }
      return rule;
    });
  };
  try {
    return kspRunSetup(kspCreateAppsScriptEnvironment());
  } finally {
    kspGetTriggerRegistry = originalTriggerRegistry;
  }
}

function validateInstallation() {
  return kspRunValidation(kspCreateAppsScriptEnvironment());
}

function getInstallationStatus() {
  return kspGetStatus(kspCreateAppsScriptEnvironment());
}

function getBootstrapConfigTemplate() {
  return kspGetBootstrapConfigTemplate();
}

function previewKnowledgeExport(input) {
  return kspRunKnowledgeExportPreview(kspCreateKnowledgeExportEnvironment(), input);
}

function createKnowledgeExport(input) {
  return kspRunKnowledgeExportCreation(kspCreateKnowledgeExportEnvironment(), input);
}

function getKnowledgeExportPrompt(input) {
  return kspGetKnowledgeExportPrompt(kspCreateKnowledgeExportEnvironment(), input);
}

function recordKnowledgeExportPromptCopy(input) {
  return kspRecordKnowledgeExportPromptCopy(kspCreateKnowledgeExportEnvironment(), input);
}
