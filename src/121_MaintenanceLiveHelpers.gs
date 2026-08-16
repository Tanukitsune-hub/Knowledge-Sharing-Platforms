function kspMaintenanceAcquireLock(operation) {
  var lock = LockService.getScriptLock();
  if (!lock.tryLock(KSP_DEFAULTS.LOCK_TIMEOUT_MS)) {
    var error = new Error(operation + 'のLockを取得できませんでした。');
    error.code = 'MAINTENANCE_LOCK_TIMEOUT';
    throw error;
  }
  return lock;
}

function kspMaintenanceClaimKey(entity, recordId) {
  return 'KSP_EDIT_CLAIM_' + String(entity).replace(/[^A-Za-z0-9_-]/g, '_') + '_' +
    String(recordId).replace(/[^A-Za-z0-9_-]/g, '_');
}

function kspMaintenancePitchbookContextKey(input) {
  return [input.date, input.gpId, input.assetClassId, input.capitalTypeId].join('|');
}

function kspMaintenanceFindSheetRow(spreadsheetId, sheetName, keyColumn, keyValue) {
  var spreadsheet = SpreadsheetApp.openById(spreadsheetId);
  var sheet = spreadsheet.getSheetByName(sheetName);
  kspAssert(sheet, 'SHEET_NOT_FOUND', 'Sheet not found: ' + sheetName);
  var headers = kspReadHeadersFromSheet(sheet);
  return kspMaintenanceFindRowInSheetObjects(sheet, headers, keyColumn, keyValue);
}

function kspMaintenanceFindRowInSheetObjects(sheet, headers, keyColumn, keyValue) {
  var rows = kspReadObjectsFromSheet(sheet, headers);
  var matches = [];
  rows.forEach(function (row, index) {
    if (String(row[keyColumn]) === String(keyValue)) matches.push({ row: row, rowNumber: index + 2 });
  });
  kspAssert(matches.length <= 1, 'DUPLICATE_KEY_ROWS', '同じIDの行が複数あります: ' + keyValue);
  if (!matches.length) return null;
  return { sheet: sheet, headers: headers, row: matches[0].row, rowNumber: matches[0].rowNumber };
}

function kspMaintenanceWriteSheetRow(sheet, headers, rowNumber, row) {
  var values = headers.map(function (header) {
    var value = row[header];
    return value === undefined || value === null ? '' : value;
  });
  sheet.getRange(rowNumber, 1, 1, headers.length).setValues([values]);
}

function kspMaintenanceWriteSheetFields(sheet, headers, rowNumber, fields) {
  Object.keys(fields).forEach(function (header) {
    var columnIndex = headers.indexOf(header);
    kspAssert(columnIndex !== -1, 'SHEET_HEADER_MISSING', 'Sheet header not found: ' + header);
    var value = fields[header];
    sheet.getRange(rowNumber, columnIndex + 1).setValue(
      value === undefined || value === null ? '' : value
    );
  });
}
