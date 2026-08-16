function kspReadSettingsMapLive(spreadsheetId) {
  var spreadsheet = SpreadsheetApp.openById(spreadsheetId);
  var sheet = spreadsheet.getSheetByName(KSP_SHEET_NAMES.SETTINGS);
  kspAssert(sheet, 'SETTINGS_SHEET_NOT_FOUND', 'Settings sheetがありません。');
  var headers = kspReadHeadersFromSheet(sheet);
  var rows = kspReadObjectsFromSheet(sheet, headers);
  var map = {};
  rows.forEach(function (row) { if (row.Key) map[String(row.Key)] = row.Value; });
  return map;
}

function kspUpsertMissingSettingsLive(spreadsheetId, rows) {
  var spreadsheet = SpreadsheetApp.openById(spreadsheetId);
  var sheet = spreadsheet.getSheetByName(KSP_SHEET_NAMES.SETTINGS);
  var headers = kspReadHeadersFromSheet(sheet);
  var existing = kspReadObjectsFromSheet(sheet, headers);
  var keys = {};
  existing.forEach(function (row) { keys[String(row.Key)] = true; });
  var missing = (rows || []).filter(function (row) { return !keys[String(row.Key)]; });
  kspAppendObjectsToSheet(sheet, headers, missing);
  return { inserted: missing.length, skipped: rows.length - missing.length };
}

function kspWriteSettingLive(spreadsheetId, key, value, nowIso) {
  var setting = kspFindSettingRow(spreadsheetId, key);
  setting.sheet.getRange(setting.rowIndex, setting.valueIndex + 1).setValue(String(value));
  if (setting.updatedAtIndex !== -1) setting.sheet.getRange(setting.rowIndex, setting.updatedAtIndex + 1).setValue(nowIso);
}

function kspUpdateRowPatchLive(spreadsheetId, sheetName, keyColumn, keyValue, patch) {
  var lock = LockService.getScriptLock();
  if (!lock.tryLock(KSP_DEFAULTS.LOCK_TIMEOUT_MS)) {
    var error = new Error('Could not acquire AI row update lock.');
    error.code = 'AI_ROW_LOCK_TIMEOUT';
    throw error;
  }
  try {
    var spreadsheet = SpreadsheetApp.openById(spreadsheetId);
    var sheet = spreadsheet.getSheetByName(sheetName);
    kspAssert(sheet, 'SHEET_NOT_FOUND', 'Sheet not found: ' + sheetName);
    var headers = kspReadHeadersFromSheet(sheet);
    var rows = kspReadObjectsFromSheet(sheet, headers);
    var index = -1;
    rows.forEach(function (row, rowIndex) {
      if (String(row[keyColumn]) === String(keyValue)) {
        kspAssert(index === -1, 'DUPLICATE_KEY_ROWS', 'Duplicate source rows: ' + keyValue);
        index = rowIndex;
      }
    });
    kspAssert(index !== -1, 'AI_SOURCE_ROW_NOT_FOUND', 'AI source rowが見つかりません。');
    var updated = kspDeepClone(rows[index]);
    Object.keys(patch || {}).forEach(function (key) { updated[key] = patch[key]; });
    var values = headers.map(function (header) {
      var value = updated[header];
      return value === undefined || value === null ? '' : value;
    });
    sheet.getRange(index + 2, 1, 1, headers.length).setValues([values]);
    return updated;
  } finally {
    lock.releaseLock();
  }
}

function kspClaimAiSourceLive(scriptProperties, sourceType, sourceId, nowIso, ttlMillis) {
  var lock = LockService.getScriptLock();
  if (!lock.tryLock(KSP_DEFAULTS.LOCK_TIMEOUT_MS)) return null;
  try {
    var key = KSP_AI_PROPERTY_KEYS.SOURCE_CLAIM_PREFIX + kspAiSourceKey(sourceType, sourceId);
    var existing = kspSafeParseJson(scriptProperties.getProperty(key), key);
    var nowMillis = new Date(nowIso).getTime();
    if (existing && nowMillis - new Date(existing.claimedAt).getTime() < ttlMillis) return null;
    var token = Utilities.getUuid();
    scriptProperties.setProperty(key, JSON.stringify({ token: token, claimedAt: nowIso }));
    return { token: token, claimedAt: nowIso };
  } finally {
    lock.releaseLock();
  }
}

function kspReleaseAiSourceClaimLive(scriptProperties, sourceType, sourceId, token) {
  var lock = LockService.getScriptLock();
  if (!lock.tryLock(KSP_DEFAULTS.LOCK_TIMEOUT_MS)) return false;
  try {
    var key = KSP_AI_PROPERTY_KEYS.SOURCE_CLAIM_PREFIX + kspAiSourceKey(sourceType, sourceId);
    var existing = kspSafeParseJson(scriptProperties.getProperty(key), key);
    if (!existing || existing.token !== token) return false;
    scriptProperties.deleteProperty(key);
    return true;
  } finally {
    lock.releaseLock();
  }
}
