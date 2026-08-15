function kspLoadMaintenanceContext(environment) {
  var state = environment.getInstallationState();
  kspAssert(state && state.resources, 'INSTALLATION_STATE_MISSING', 'Installation stateがありません。');
  var backendSpreadsheetId = state.resources[KSP_RESOURCE_KEYS.BACKEND_SPREADSHEET];
  var auditSpreadsheetId = state.resources[KSP_RESOURCE_KEYS.AUDIT_SPREADSHEET];
  kspAssert(backendSpreadsheetId, 'BACKEND_SPREADSHEET_MISSING', 'Backend Spreadsheetがありません。');
  kspAssert(auditSpreadsheetId, 'AUDIT_SPREADSHEET_MISSING', 'Audit Spreadsheetがありません。');
  var gpRows = environment.readRows(backendSpreadsheetId, KSP_SHEET_NAMES.GP_MASTER);
  var optionRows = environment.readRows(backendSpreadsheetId, KSP_SHEET_NAMES.OPTION_MASTER);
  return {
    state: state,
    backendSpreadsheetId: backendSpreadsheetId,
    auditSpreadsheetId: auditSpreadsheetId,
    meetingRows: environment.readRows(backendSpreadsheetId, KSP_SHEET_NAMES.MEETING_INDEX),
    pitchbookRows: environment.readRows(backendSpreadsheetId, KSP_SHEET_NAMES.PITCHBOOK_INDEX),
    gpRows: gpRows,
    optionRows: optionRows,
    catalog: kspBuildMeetingCatalog(gpRows, optionRows)
  };
}

function kspRequireSingleRow(rows, keyColumn, keyValue, notFoundCode) {
  var matches = (rows || []).filter(function (row) { return String(row[keyColumn]) === String(keyValue); });
  kspAssert(matches.length <= 1, 'DUPLICATE_KEY_ROWS', '同じIDの行が複数あります: ' + keyValue);
  kspAssert(matches.length === 1, notFoundCode, '対象レコードが見つかりません: ' + keyValue);
  return matches[0];
}

function kspBuildMasterResponse(gpRows, optionRows) {
  var gps = (gpRows || []).map(function (row) {
    return { id: String(row.GP_ID || ''), name: String(row.GP_Name || ''),
      status: String(row.Status || ''), updatedAt: String(row.Updated_At || '') };
  }).sort(function (left, right) { return left.name.toLocaleLowerCase('en').localeCompare(right.name.toLocaleLowerCase('en'), 'en'); });
  var options = (optionRows || []).map(function (row) {
    return { id: String(row.Option_ID || ''), type: String(row.Type || ''), name: String(row.Name || ''),
      sortOrder: Number(row.Sort_Order || 0), status: String(row.Status || ''), updatedAt: String(row.Updated_At || '') };
  }).sort(function (left, right) {
    if (left.type !== right.type) return left.type.localeCompare(right.type);
    if (left.sortOrder !== right.sortOrder) return left.sortOrder - right.sortOrder;
    return left.name.localeCompare(right.name, 'ja');
  });
  return { gps: gps, options: options };
}

function kspGetMaintenanceActorSafely(environment, warnings) {
  try { return environment.getActor() || 'UNIDENTIFIED'; }
  catch (error) { warnings.push({ code: 'ACTOR_RESOLUTION_FAILED', message: error.message || String(error) }); return 'UNIDENTIFIED'; }
}

function kspTryMaintenanceAudit(environment, auditSpreadsheetId, params, warnings) {
  try { environment.appendRow(auditSpreadsheetId, KSP_SHEET_NAMES.AUDIT_LOG, kspBuildMaintenanceAuditRow(params)); }
  catch (error) { warnings.push({ code: 'AUDIT_WRITE_FAILED', message: error.message || String(error) }); }
}

function kspMaintenanceFailure(error, warnings) {
  return { ok: false, workId: KSP_MAINTENANCE_WORK_ID,
    error: { code: kspGetErrorCode(error), message: error.message || String(error) }, warnings: warnings || [] };
}

function kspMasterActionName(input) {
  var entity = input && input.entity === KSP_MASTER_ENTITY.OPTION ? 'OPTION' : 'GP';
  var action = input && input.action ? input.action : 'UNKNOWN';
  return KSP_MAINTENANCE_ACTIONS[entity + '_' + action] || (entity + '_' + action);
}
