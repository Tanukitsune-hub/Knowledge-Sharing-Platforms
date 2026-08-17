function setupKnowledgePlatform_() {
  var originalTriggerRegistry = kspGetTriggerRegistry_;
  kspGetTriggerRegistry_ = function (config) {
    return originalTriggerRegistry(config).map(function (rule) {
      if (rule.handler === 'runAiSyncWorker_') {
        var copy = kspDeepClone_(rule);
        copy.available = true;
        return copy;
      }
      return rule;
    });
  };
  try {
    return kspRunSetup_(kspCreateAppsScriptEnvironment_());
  } finally {
    kspGetTriggerRegistry_ = originalTriggerRegistry;
  }
}

function validateInstallation_() {
  return kspRunValidation_(kspCreateAppsScriptEnvironment_());
}

function getInstallationStatus_() {
  return kspGetStatus_(kspCreateAppsScriptEnvironment_());
}

function getBootstrapConfigTemplate_() {
  return kspGetBootstrapConfigTemplate_();
}

function previewKnowledgeExport(input) {
  return kspRunKnowledgeExportPreview_(kspCreateKnowledgeExportEnvironment_(), input);
}

function createKnowledgeExport(input) {
  return kspRunKnowledgeExportCreation_(kspCreateKnowledgeExportEnvironment_(), input);
}

function getKnowledgeExportPrompt(input) {
  return kspGetKnowledgeExportPrompt_(kspCreateKnowledgeExportEnvironment_(), input);
}

function recordKnowledgeExportPromptCopy(input) {
  return kspRecordKnowledgeExportPromptCopy_(kspCreateKnowledgeExportEnvironment_(), input);
}
