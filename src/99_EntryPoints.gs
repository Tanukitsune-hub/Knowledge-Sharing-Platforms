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

function runBackendDailyBackup_() {
  var result = kspRunBackendDailyBackup_(kspCreateBackendBackupEnvironment_());
  Logger.log(JSON.stringify({ operation: 'BACKEND_DAILY_BACKUP', ok: result.ok,
    snapshot: result.snapshot, retentionTrashed: result.retentionTrashed, errorCode: result.errorCode }));
  return result;
}

function runBackendDailyBackupNow() {
  var result = kspRunBackendDailyBackup_(kspCreateBackendBackupEnvironment_());
  Logger.log(JSON.stringify({ operation: 'BACKEND_DAILY_BACKUP', ok: result.ok,
    snapshot: result.snapshot, retentionTrashed: result.retentionTrashed, errorCode: result.errorCode }));
  return result;
}

function getBootstrapConfigTemplate_() {
  return kspGetBootstrapConfigTemplate_();
}

function installKnowledgeShare() {
  var status = kspRunInstaller_(kspCreateInstallerEnvironment_());
  kspLogInstallerOutcome_(status);
  return status;
}

function checkKnowledgeShareReadiness() {
  return kspCheckInstallerReadiness_(kspCreateInstallerEnvironment_());
}

function confirmKnowledgeShareDeploymentSecurity() {
  return kspConfirmInstallerDeploymentSecurity_(kspCreateInstallerEnvironment_());
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
