function kspGetFeatureFreezeDiagnostics(environment) {
  var settings = {};
  var warning = '';
  if (environment && typeof environment.loadAiContext === 'function') {
    try { settings = kspNormalizeAiSettings(environment.loadAiContext().settings || {}); }
    catch (error) { warning = error.message || String(error); }
  }
  var formats = kspGetAiFormatExtensions().map(function (extension) {
    var definition = kspGetAiFormatDefinition(extension);
    return { extension: extension, uploadMimeType: definition.uploadMimeType, readStrategy: definition.readStrategy, implemented: true };
  });
  var modes = kspGetFeatureFreezeModeDefinitions().map(function (definition) {
    return { mode: definition.mode, implemented: true, inputRequired: definition.inputRequired, gpRequired: definition.gpRequired };
  });
  return {
    ok: true,
    workId: KSP_FEATURE_FREEZE_WORK_ID,
    appVersion: KSP_FEATURE_FREEZE_APP_VERSION,
    featureFreezeCandidate: formats.length === 6 && modes.length === 5,
    formats: formats,
    modes: modes,
    sharedRetrievalPath: 'kspRunFeatureFreezeKnowledgeSearch',
    sharedCitationPath: 'kspMapKnowledgeCitations',
    sharedAuditPath: 'kspBuildFeatureFreezeAuditRow',
    syncHandler: 'runAiSyncWorker',
    syncHandlerAvailable: typeof runAiSyncWorker === 'function',
    modelConfigured: Boolean(settings.modelId),
    storeConfigured: Boolean(settings.storeName),
    credentialProvider: 'SERVER_SIDE_NOT_INSPECTED',
    liveQualified: false,
    warning: warning
  };
}
