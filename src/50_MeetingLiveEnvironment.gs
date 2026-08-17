function kspCreateMeetingEnvironment_() {
  var scriptProperties = PropertiesService.getScriptProperties();
  return {
    nowIso: function () { return new Date().toISOString(); },
    getInstallationState: function () {
      var raw = scriptProperties.getProperty(KSP_PROPERTY_KEYS.INSTALLATION_STATE_JSON);
      return kspSafeParseJson_(raw, KSP_PROPERTY_KEYS.INSTALLATION_STATE_JSON) || null;
    },
    getActor: function () {
      var email = '';
      var temporaryUserKey = '';
      try { email = Session.getActiveUser().getEmail(); } catch (ignoredEmail) { email = ''; }
      try { temporaryUserKey = Session.getTemporaryActiveUserKey(); } catch (ignoredKey) { temporaryUserKey = ''; }
      return kspResolveActorValue_(email, temporaryUserKey);
    },
    readRows: function (spreadsheetId, sheetName) {
      var spreadsheet = SpreadsheetApp.openById(spreadsheetId);
      var sheet = spreadsheet.getSheetByName(sheetName);
      kspAssert_(sheet, 'SHEET_NOT_FOUND', 'Sheet not found: ' + sheetName);
      var headers = kspReadHeadersFromSheet_(sheet);
      return kspReadObjectsFromSheet_(sheet, headers);
    },
    getCounterValue: function (spreadsheetId, counterKey) {
      var setting = kspFindSettingRow_(spreadsheetId, counterKey);
      var value = Number(setting.sheet.getRange(setting.rowIndex, setting.valueIndex + 1).getValue());
      kspAssert_(Number.isFinite(value) && value > 0 && Math.floor(value) === value,
        'COUNTER_VALUE_INVALID', 'Counter must be a positive integer: ' + counterKey);
      return value;
    },
    allocateCounter: function (spreadsheetId, counterKey, nowIso) {
      var lock = LockService.getScriptLock();
      if (!lock.tryLock(KSP_DEFAULTS.LOCK_TIMEOUT_MS)) {
        var lockError = new Error('Could not acquire the Meeting ID allocation lock.');
        lockError.code = 'MEETING_ID_LOCK_TIMEOUT';
        throw lockError;
      }
      try {
        var setting = kspFindSettingRow_(spreadsheetId, counterKey);
        var currentValue = Number(setting.sheet.getRange(setting.rowIndex, setting.valueIndex + 1).getValue());
        kspAssert_(Number.isFinite(currentValue) && currentValue > 0 && Math.floor(currentValue) === currentValue,
          'COUNTER_VALUE_INVALID', 'Counter must be a positive integer: ' + counterKey);
        setting.sheet.getRange(setting.rowIndex, setting.valueIndex + 1).setValue(String(currentValue + 1));
        if (setting.updatedAtIndex !== -1) setting.sheet.getRange(setting.rowIndex, setting.updatedAtIndex + 1).setValue(nowIso);
        return currentValue;
      } finally { lock.releaseLock(); }
    },
    findRowByKey: function (spreadsheetId, sheetName, keyColumn, keyValue) {
      var spreadsheet = SpreadsheetApp.openById(spreadsheetId);
      var sheet = spreadsheet.getSheetByName(sheetName);
      kspAssert_(sheet, 'SHEET_NOT_FOUND', 'Sheet not found: ' + sheetName);
      var headers = kspReadHeadersFromSheet_(sheet);
      var found = kspReadObjectsFromSheet_(sheet, headers).filter(function (row) {
        return String(row[keyColumn]) === String(keyValue);
      });
      kspAssert_(found.length <= 1, 'DUPLICATE_KEY_ROWS', 'Multiple rows found for ' + keyColumn + ': ' + keyValue);
      return found.length === 1 ? found[0] : null;
    },
    createOrReuseDocument: function (parentFolderId, meetingId, filename, documentText) {
      var lock = LockService.getScriptLock();
      if (!lock.tryLock(KSP_DEFAULTS.LOCK_TIMEOUT_MS)) {
        var lockError = new Error('Could not acquire the Meeting document lock.');
        lockError.code = 'MEETING_DOCUMENT_LOCK_TIMEOUT';
        throw lockError;
      }
      var file;
      var reused = false;
      try {
        var query = "'" + kspEscapeDriveQueryLiteral_(parentFolderId) + "' in parents" +
          " and trashed = false and name = '" + kspEscapeDriveQueryLiteral_(filename) +
          "' and mimeType = 'application/vnd.google-apps.document'";
        var response = Drive.Files.list({ q: query, spaces: 'drive', includeItemsFromAllDrives: true,
          supportsAllDrives: true, pageSize: 10, fields: 'files(id,name,webViewLink,parents)' });
        var matches = response.files || [];
        kspAssert_(matches.length <= 1, 'DUPLICATE_MEETING_DOCUMENTS', 'Multiple Meeting documents found for ' + meetingId + '.');
        if (matches.length === 1) {
          file = matches[0];
          reused = true;
        } else {
          file = Drive.Files.create({ name: filename, mimeType: 'application/vnd.google-apps.document', parents: [parentFolderId] },
            null, { supportsAllDrives: true, fields: 'id,name,webViewLink,parents' });
        }
      } finally { lock.releaseLock(); }

      try {
        var document = DocumentApp.openById(file.id);
        var body = document.getBody();
        body.clear();
        body.setText(documentText);
        document.saveAndClose();
      } catch (error) {
        error.code = error.code || 'MEETING_DOCUMENT_WRITE_FAILED';
        throw error;
      }
      return { id: file.id, name: file.name || filename,
        url: file.webViewLink || ('https://docs.google.com/document/d/' + file.id + '/edit'), reused: reused };
    },
    appendUniqueRow: function (spreadsheetId, sheetName, keyColumn, row) {
      var lock = LockService.getScriptLock();
      if (!lock.tryLock(KSP_DEFAULTS.LOCK_TIMEOUT_MS)) {
        var lockError = new Error('Could not acquire the Meeting Index write lock.');
        lockError.code = 'MEETING_INDEX_LOCK_TIMEOUT';
        throw lockError;
      }
      try {
        var spreadsheet = SpreadsheetApp.openById(spreadsheetId);
        var sheet = spreadsheet.getSheetByName(sheetName);
        kspAssert_(sheet, 'SHEET_NOT_FOUND', 'Sheet not found: ' + sheetName);
        var headers = kspReadHeadersFromSheet_(sheet);
        var found = kspReadObjectsFromSheet_(sheet, headers).filter(function (existing) {
          return String(existing[keyColumn]) === String(row[keyColumn]);
        });
        kspAssert_(found.length <= 1, 'DUPLICATE_KEY_ROWS', 'Multiple rows found for ' + keyColumn + ': ' + row[keyColumn]);
        if (found.length === 1) return { inserted: false, row: found[0] };
        var values = headers.map(function (header) {
          var value = row[header];
          return value === undefined || value === null ? '' : value;
        });
        sheet.getRange(sheet.getLastRow() + 1, 1, 1, headers.length).setValues([values]);
        return { inserted: true, row: row, rowNumber: sheet.getLastRow() };
      } finally { lock.releaseLock(); }
    },
    appendRow: function (spreadsheetId, sheetName, row) {
      var spreadsheet = SpreadsheetApp.openById(spreadsheetId);
      var sheet = spreadsheet.getSheetByName(sheetName);
      kspAssert_(sheet, 'SHEET_NOT_FOUND', 'Sheet not found: ' + sheetName);
      var headers = kspReadHeadersFromSheet_(sheet);
      var values = headers.map(function (header) {
        var value = row[header];
        return value === undefined || value === null ? '' : value;
      });
      sheet.getRange(sheet.getLastRow() + 1, 1, 1, headers.length).setValues([values]);
      return { rowNumber: sheet.getLastRow() };
    }
  };
}

function kspFindSettingRow_(spreadsheetId, counterKey) {
  var spreadsheet = SpreadsheetApp.openById(spreadsheetId);
  var sheet = spreadsheet.getSheetByName(KSP_SHEET_NAMES.SETTINGS);
  kspAssert_(sheet, 'SETTINGS_SHEET_NOT_FOUND', 'Settings sheet not found.');
  var headers = kspReadHeadersFromSheet_(sheet);
  var keyIndex = headers.indexOf('Key');
  var valueIndex = headers.indexOf('Value');
  var updatedAtIndex = headers.indexOf('Updated_At');
  kspAssert_(keyIndex !== -1 && valueIndex !== -1, 'SETTINGS_SCHEMA_INVALID', 'Settings sheet must include Key and Value columns.');
  var rows = kspReadObjectsFromSheet_(sheet, headers);
  var rowIndex = -1;
  for (var index = 0; index < rows.length; index += 1) {
    if (String(rows[index].Key) === String(counterKey)) { rowIndex = index + 2; break; }
  }
  kspAssert_(rowIndex !== -1, 'COUNTER_NOT_FOUND', 'Counter setting not found: ' + counterKey);
  return { sheet: sheet, rowIndex: rowIndex, valueIndex: valueIndex, updatedAtIndex: updatedAtIndex };
}
