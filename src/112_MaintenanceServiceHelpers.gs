function kspWorkspaceSafeDriveLink_(value, fileId) {
  var candidate = String(value || '').trim();
  var expectedId = String(fileId || '').trim();
  if (!expectedId || !/^https:\/\/(?:drive|docs)\.google\.com\//i.test(candidate)) return '';
  var escapedId = expectedId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp('/d/' + escapedId + '(?:/|$)').test(candidate) ||
    new RegExp('[?&]id=' + escapedId + '(?:&|$)').test(candidate) ? candidate : '';
}

function kspBuildMaintenanceCatalog_(counterpartyRows, optionRows) {
  var counterparties = (counterpartyRows || []).map(function (row) {
    var legacyGp = String(row.GP_ID || '');
    return {
      id: String(row.Counterparty_ID || legacyGp),
      name: String(row.Counterparty_Name || row.GP_Name || ''),
      type: String(row.Counterparty_Type || (legacyGp ? 'GP' : '')),
      status: String(row.Status || '')
    };
  }).filter(function (row) { return row.id && row.name && row.type; })
    .sort(function (left, right) {
      return left.name.localeCompare(right.name, 'ja') || left.id.localeCompare(right.id);
    });
  var options = (optionRows || []).map(function (row) {
    return {
      id: String(row.Option_ID || ''),
      type: String(row.Type || ''),
      name: String(row.Name || ''),
      sortOrder: Number(row.Sort_Order || 0),
      status: String(row.Status || '')
    };
  }).filter(function (row) { return row.id && row.type && row.name; });
  function byType(type) {
    return options.filter(function (row) { return row.type === type; })
      .sort(function (left, right) {
        if (left.sortOrder !== right.sortOrder) return left.sortOrder - right.sortOrder;
        return left.name.localeCompare(right.name, 'ja');
      });
  }
  var counterpartyEntities = counterparties.map(function (counterparty) {
    return { id: counterparty.id, type: counterparty.type, name: counterparty.name,
      status: counterparty.status, entityKey: 'COUNTERPARTY:' + counterparty.id };
  });
  return {
    counterparties: counterparties,
    gps: counterparties.filter(function (item) { return item.type === 'GP'; }),
    assetClasses: byType(KSP_OPTION_TYPES.ASSET_CLASS),
    capitalTypes: byType(KSP_OPTION_TYPES.CAPITAL_TYPE),
    locations: byType(KSP_OPTION_TYPES.LOCATION),
    teams: byType(KSP_OPTION_TYPES.TEAM),
    counterpartyTypes: KSP_COUNTERPARTY_TYPE_DEFINITIONS.map(function (definition) {
      return { code: definition.code, label: definition.label, optionType: definition.optionType };
    }),
    counterpartyEntities: counterpartyEntities
  };
}

function kspLoadMaintenanceContext_(environment) {
  var state = environment.getInstallationState();
  kspAssert_(state && state.resources, 'INSTALLATION_STATE_MISSING', 'Installation stateがありません。');
  var backendSpreadsheetId = state.resources[KSP_RESOURCE_KEYS.BACKEND_SPREADSHEET];
  var auditSpreadsheetId = state.resources[KSP_RESOURCE_KEYS.AUDIT_SPREADSHEET];
  kspAssert_(backendSpreadsheetId, 'BACKEND_SPREADSHEET_MISSING', 'Backend Spreadsheetがありません。');
  kspAssert_(auditSpreadsheetId, 'AUDIT_SPREADSHEET_MISSING', 'Audit Spreadsheetがありません。');
  var counterpartyRows = environment.readRows(backendSpreadsheetId, KSP_SHEET_NAMES.COUNTERPARTY_MASTER);
  var optionRows = environment.readRows(backendSpreadsheetId, KSP_SHEET_NAMES.OPTION_MASTER);
  return {
    state: state,
    backendSpreadsheetId: backendSpreadsheetId,
    auditSpreadsheetId: auditSpreadsheetId,
    meetingRows: environment.readRows(backendSpreadsheetId, KSP_SHEET_NAMES.MEETING_INDEX),
    pitchbookRows: environment.readRows(backendSpreadsheetId, KSP_SHEET_NAMES.PITCHBOOK_INDEX),
    counterpartyRows: counterpartyRows,
    optionRows: optionRows,
    catalog: kspBuildMaintenanceCatalog_(counterpartyRows, optionRows)
  };
}

function kspRequireSingleRow_(rows, keyColumn, keyValue, notFoundCode) {
  var matches = (rows || []).filter(function (row) { return String(row[keyColumn]) === String(keyValue); });
  kspAssert_(matches.length <= 1, 'DUPLICATE_KEY_ROWS', '同じIDの行が複数あります: ' + keyValue);
  kspAssert_(matches.length === 1, notFoundCode, '対象レコードが見つかりません: ' + keyValue);
  return matches[0];
}

function kspBuildMasterResponse_(counterpartyRows, optionRows) {
  var counterparties = (counterpartyRows || []).map(function (row) {
    var legacyGp = String(row.GP_ID || '');
    return { id: String(row.Counterparty_ID || legacyGp), name: String(row.Counterparty_Name || row.GP_Name || ''),
      type: String(row.Counterparty_Type || (legacyGp ? 'GP' : '')), status: String(row.Status || ''),
      updatedAt: kspCanonicalInstantIso_(row.Updated_At) };
  }).sort(function (left, right) { return left.name.localeCompare(right.name, 'ja') || left.id.localeCompare(right.id); });
  var options = (optionRows || []).map(function (row) {
    return { id: String(row.Option_ID || ''), type: String(row.Type || ''), name: String(row.Name || ''),
      sortOrder: Number(row.Sort_Order || 0), status: String(row.Status || ''), updatedAt: kspCanonicalInstantIso_(row.Updated_At) };
  }).sort(function (left, right) {
    if (left.type !== right.type) return left.type.localeCompare(right.type);
    if (left.sortOrder !== right.sortOrder) return left.sortOrder - right.sortOrder;
    return left.name.localeCompare(right.name, 'ja');
  });
  return { counterparties: counterparties, options: options };
}

function kspGetMaintenanceActorSafely_(environment, warnings) {
  try { return environment.getActor() || 'UNIDENTIFIED'; }
  catch (error) { warnings.push({ code: 'ACTOR_RESOLUTION_FAILED', message: kspSafeOperationalWarning_('ACTOR_RESOLUTION_FAILED') }); return 'UNIDENTIFIED'; }
}

function kspTryMaintenanceAudit_(environment, auditSpreadsheetId, params, warnings) {
  try { environment.appendRow(auditSpreadsheetId, KSP_SHEET_NAMES.AUDIT_LOG, kspBuildMaintenanceAuditRow_(params)); }
  catch (error) { warnings.push({ code: 'AUDIT_WRITE_FAILED', message: kspSafeOperationalWarning_('AUDIT_WRITE_FAILED') }); }
}

function kspMaintenanceFailure_(error, warnings) {
  return { ok: false, workId: KSP_MAINTENANCE_WORK_ID,
    error: { code: kspGetErrorCode_(error), message: kspSafePublicErrorMessage_(kspGetErrorCode_(error), 'MAINTENANCE') }, warnings: warnings || [] };
}

function kspMasterActionName_(input) {
  var entity = input && input.entity === KSP_MASTER_ENTITY.OPTION ? 'OPTION' : 'COUNTERPARTY';
  var action = input && input.action ? input.action : 'UNKNOWN';
  return KSP_MAINTENANCE_ACTIONS[entity + '_' + action] || (entity + '_' + action);
}
