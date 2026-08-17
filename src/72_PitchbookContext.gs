function kspLoadPitchbookRuntimeContext_(environment) {
  var state = environment.getInstallationState();
  kspAssert_(state && state.config && state.resources, 'INSTALLATION_STATE_MISSING',
    'Installation state is missing. Run setupKnowledgePlatform_() first.');
  var backendSpreadsheetId = state.resources[KSP_RESOURCE_KEYS.BACKEND_SPREADSHEET];
  var auditSpreadsheetId = state.resources[KSP_RESOURCE_KEYS.AUDIT_SPREADSHEET];
  var pitchbooksFolderId = state.resources[KSP_RESOURCE_KEYS.PITCHBOOKS];
  kspAssert_(backendSpreadsheetId, 'BACKEND_SPREADSHEET_MISSING', 'Backend Spreadsheet is not configured.');
  kspAssert_(auditSpreadsheetId, 'AUDIT_SPREADSHEET_MISSING', 'Audit Spreadsheet is not configured.');
  kspAssert_(pitchbooksFolderId, 'PITCHBOOK_FOLDER_MISSING', 'Pitchbooks folder is not configured.');
  var gpRows = environment.readRows(backendSpreadsheetId, KSP_SHEET_NAMES.GP_MASTER);
  var optionRows = environment.readRows(backendSpreadsheetId, KSP_SHEET_NAMES.OPTION_MASTER);
  return {
    state: state,
    backendSpreadsheetId: backendSpreadsheetId,
    auditSpreadsheetId: auditSpreadsheetId,
    pitchbooksFolderId: pitchbooksFolderId,
    catalog: kspBuildPitchbookCatalog_(gpRows, optionRows)
  };
}

function kspGetPitchbookActorSafely_(environment, warnings) {
  try {
    return environment.getActor() || 'UNIDENTIFIED';
  } catch (error) {
    warnings.push({ code: 'ACTOR_RESOLUTION_FAILED', message: kspSafeOperationalWarning_('ACTOR_RESOLUTION_FAILED') });
    return 'UNIDENTIFIED';
  }
}

function kspTryAppendPitchbookAudit_(environment, auditSpreadsheetId, params) {
  try {
    environment.appendRow(auditSpreadsheetId, KSP_SHEET_NAMES.AUDIT_LOG, kspBuildPitchbookAuditRow_(params));
    return null;
  } catch (error) {
    return { code: 'AUDIT_WRITE_FAILED', message: kspSafeOperationalWarning_('AUDIT_WRITE_FAILED') };
  }
}
