function kspCreateAppsScriptEnvironment_() {
  var scriptProperties = PropertiesService.getScriptProperties();

  return {
    nowIso: function () {
      return new Date().toISOString();
    },

    acquireScriptLock: function (timeoutMs) {
      var lock = LockService.getScriptLock();
      if (!lock.tryLock(timeoutMs)) {
        var error = new Error('Could not acquire the setup script lock.');
        error.code = 'SETUP_LOCK_TIMEOUT';
        throw error;
      }
      return lock;
    },

    releaseScriptLock: function (lock) {
      lock.releaseLock();
    },

    getProperty: function (key) {
      return scriptProperties.getProperty(key);
    },

    setProperty: function (key, value) {
      scriptProperties.setProperty(key, String(value));
    },

    deleteProperty: function (key) {
      scriptProperties.deleteProperty(key);
    },

    getResource: function (id) {
      try {
        var file = Drive.Files.get(id, {
          supportsAllDrives: true,
          fields: 'id,name,mimeType,parents,trashed'
        });
        if (!file || file.trashed) {
          return null;
        }
        return {
          id: file.id,
          name: file.name,
          mimeType: file.mimeType,
          parents: file.parents || []
        };
      } catch (error) {
        return null;
      }
    },

    findChildren: function (parentId, name, mimeType) {
      var query = "'" + kspEscapeDriveQueryLiteral_(parentId) + "' in parents" +
        " and trashed = false" +
        " and name = '" + kspEscapeDriveQueryLiteral_(name) + "'" +
        " and mimeType = '" + kspEscapeDriveQueryLiteral_(mimeType) + "'";
      var response = Drive.Files.list({
        q: query,
        spaces: 'drive',
        includeItemsFromAllDrives: true,
        supportsAllDrives: true,
        pageSize: 100,
        fields: 'files(id,name,mimeType,parents)'
      });
      return (response.files || []).map(function (file) {
        return {
          id: file.id,
          name: file.name,
          mimeType: file.mimeType,
          parents: file.parents || []
        };
      });
    },

    createFolder: function (parentId, name) {
      var file = Drive.Files.create({
        name: name,
        mimeType: KSP_MIME_TYPES.FOLDER,
        parents: [parentId]
      }, null, {
        supportsAllDrives: true,
        fields: 'id,name,mimeType,parents'
      });
      return {
        id: file.id,
        name: file.name,
        mimeType: file.mimeType,
        parents: file.parents || []
      };
    },

    createSpreadsheet: function (parentId, name) {
      var file = Drive.Files.create({
        name: name,
        mimeType: KSP_MIME_TYPES.SPREADSHEET,
        parents: [parentId]
      }, null, {
        supportsAllDrives: true,
        fields: 'id,name,mimeType,parents'
      });
      return {
        id: file.id,
        name: file.name,
        mimeType: file.mimeType,
        parents: file.parents || []
      };
    },

    ensureSheet: function (spreadsheetId, sheetName, expectedHeaders) {
      var spreadsheet = SpreadsheetApp.openById(spreadsheetId);
      var sheet = spreadsheet.getSheetByName(sheetName);
      var created = false;
      if (!sheet) {
        var disposableDefault = kspFindDisposableDefaultSheet_(spreadsheet);
        if (disposableDefault) {
          disposableDefault.setName(sheetName);
          sheet = disposableDefault;
        } else {
          sheet = spreadsheet.insertSheet(sheetName);
        }
        created = true;
      }

      var actualHeaders = kspReadHeadersFromSheet_(sheet);
      kspAssert_(kspUniqueStrings_(actualHeaders).length === actualHeaders.length,
        'DUPLICATE_SHEET_HEADERS', 'Duplicate headers found in ' + sheetName + '.');

      if (actualHeaders.length === 0) {
        sheet.getRange(1, 1, 1, expectedHeaders.length).setValues([expectedHeaders]);
        sheet.setFrozenRows(1);
        return { action: created ? 'created' : 'migrated', addedHeaders: expectedHeaders.slice(), columnCount: expectedHeaders.length };
      }

      var missingHeaders = expectedHeaders.filter(function (header) {
        return actualHeaders.indexOf(header) === -1;
      });
      if (missingHeaders.length > 0) {
        sheet.getRange(1, actualHeaders.length + 1, 1, missingHeaders.length).setValues([missingHeaders]);
        sheet.setFrozenRows(1);
        return {
          action: 'migrated',
          addedHeaders: missingHeaders,
          columnCount: actualHeaders.length + missingHeaders.length
        };
      }

      sheet.setFrozenRows(1);
      return { action: created ? 'created' : 'reused', addedHeaders: [], columnCount: actualHeaders.length };
    },
    backfillMeetingCounterpartyFields: function (spreadsheetId) {
      var spreadsheet = SpreadsheetApp.openById(spreadsheetId);
      var sheet = spreadsheet.getSheetByName(KSP_SHEET_NAMES.MEETING_INDEX);
      kspAssert_(sheet, 'SHEET_NOT_FOUND', 'Sheet not found: ' + KSP_SHEET_NAMES.MEETING_INDEX);
      var headers = kspReadHeadersFromSheet_(sheet);
      var rows = kspReadObjectsFromSheet_(sheet, headers);
      var updated = 0;
      rows.forEach(function (row, index) {
        var patch = kspBuildLegacyMeetingCounterpartyBackfill_(row);
        if (!patch) return;
        Object.keys(patch).forEach(function (header) {
          var columnIndex = headers.indexOf(header);
          kspAssert_(columnIndex !== -1, 'SCHEMA_COLUMNS_MISSING', 'Missing Meeting migration column: ' + header);
          sheet.getRange(index + 2, columnIndex + 1).setValue(patch[header]);
        });
        updated += 1;
      });
      return { scanned: rows.length, updated: updated };
    },

    insertMissingRows: function (spreadsheetId, sheetName, keyColumn, rows) {
      var spreadsheet = SpreadsheetApp.openById(spreadsheetId);
      var sheet = spreadsheet.getSheetByName(sheetName);
      kspAssert_(sheet, 'SHEET_NOT_FOUND', 'Sheet not found: ' + sheetName);
      var headers = kspReadHeadersFromSheet_(sheet);
      var existingRows = kspReadObjectsFromSheet_(sheet, headers);
      var existingKeys = {};
      existingRows.forEach(function (row) {
        existingKeys[String(row[keyColumn])] = true;
      });
      var missingRows = rows.filter(function (row) {
        return !existingKeys[String(row[keyColumn])];
      });
      kspAppendObjectsToSheet_(sheet, headers, missingRows);
      return { inserted: missingRows.length, skipped: rows.length - missingRows.length };
    },

    upsertRows: function (spreadsheetId, sheetName, keyColumn, rows, options) {
      var spreadsheet = SpreadsheetApp.openById(spreadsheetId);
      var sheet = spreadsheet.getSheetByName(sheetName);
      kspAssert_(sheet, 'SHEET_NOT_FOUND', 'Sheet not found: ' + sheetName);
      var headers = kspReadHeadersFromSheet_(sheet);
      var existingRows = kspReadObjectsFromSheet_(sheet, headers);
      var rowIndexByKey = {};
      existingRows.forEach(function (row, index) {
        rowIndexByKey[String(row[keyColumn])] = index + 2;
      });

      var inserted = 0;
      var updated = 0;
      var preserved = 0;
      var preserveExistingKeys = options && Array.isArray(options.preserveExistingKeys)
        ? options.preserveExistingKeys.map(String)
        : [];
      rows.forEach(function (row) {
        var key = String(row[keyColumn]);
        var values = headers.map(function (header) {
          return row[header] === undefined || row[header] === null ? '' : row[header];
        });
        if (rowIndexByKey[key] && preserveExistingKeys.indexOf(key) !== -1) {
          preserved += 1;
        } else if (rowIndexByKey[key]) {
          sheet.getRange(rowIndexByKey[key], 1, 1, headers.length).setValues([values]);
          updated += 1;
        } else {
          sheet.appendRow(values);
          inserted += 1;
        }
      });
      return { inserted: inserted, updated: updated, preserved: preserved };
    },

    listTriggers: function () {
      return ScriptApp.getProjectTriggers().map(function (trigger) {
        return {
          id: trigger.getUniqueId(),
          handler: trigger.getHandlerFunction(),
          eventType: String(trigger.getEventType())
        };
      });
    },

    createClockTrigger: function (handler, intervalMinutes) {
      var trigger = ScriptApp.newTrigger(handler).timeBased().everyMinutes(intervalMinutes).create();
      return {
        id: trigger.getUniqueId(),
        handler: trigger.getHandlerFunction(),
        eventType: String(trigger.getEventType())
      };
    },

    deleteTrigger: function (triggerId) {
      var trigger = ScriptApp.getProjectTriggers().filter(function (candidate) {
        return candidate.getUniqueId() === String(triggerId);
      })[0];
      kspAssert_(trigger, 'TRIGGER_NOT_FOUND', 'Trigger is not accessible for migration.');
      ScriptApp.deleteTrigger(trigger);
    },

    getSheetHeaders: function (spreadsheetId, sheetName) {
      var spreadsheet = SpreadsheetApp.openById(spreadsheetId);
      var sheet = spreadsheet.getSheetByName(sheetName);
      kspAssert_(sheet, 'SHEET_NOT_FOUND', 'Sheet not found: ' + sheetName);
      return kspReadHeadersFromSheet_(sheet);
    },

    getColumnValues: function (spreadsheetId, sheetName, columnName) {
      var spreadsheet = SpreadsheetApp.openById(spreadsheetId);
      var sheet = spreadsheet.getSheetByName(sheetName);
      kspAssert_(sheet, 'SHEET_NOT_FOUND', 'Sheet not found: ' + sheetName);
      var headers = kspReadHeadersFromSheet_(sheet);
      var columnIndex = headers.indexOf(columnName);
      kspAssert_(columnIndex !== -1, 'COLUMN_NOT_FOUND', 'Column not found: ' + columnName);
      var lastRow = sheet.getLastRow();
      if (lastRow < 2) {
        return [];
      }
      return sheet.getRange(2, columnIndex + 1, lastRow - 1, 1).getValues()
        .map(function (row) { return String(row[0]); })
        .filter(function (value) { return value !== ''; });
    }
  };
}

function kspReadHeadersFromSheet_(sheet) {
  var lastColumn = sheet.getLastColumn();
  if (lastColumn < 1 || sheet.getLastRow() < 1) {
    return [];
  }
  return sheet.getRange(1, 1, 1, lastColumn).getValues()[0]
    .map(function (value) { return String(value || '').trim(); })
    .filter(function (value) { return value !== ''; });
}

function kspReadObjectsFromSheet_(sheet, headers) {
  var lastRow = sheet.getLastRow();
  if (lastRow < 2 || headers.length === 0) {
    return [];
  }
  return sheet.getRange(2, 1, lastRow - 1, headers.length).getValues().map(function (values) {
    var objectValue = {};
    headers.forEach(function (header, index) {
      objectValue[header] = values[index];
    });
    return objectValue;
  });
}

function kspAppendObjectsToSheet_(sheet, headers, rows) {
  if (!rows || rows.length === 0) {
    return;
  }
  var values = rows.map(function (row) {
    return headers.map(function (header) {
      return row[header] === undefined || row[header] === null ? '' : row[header];
    });
  });
  sheet.getRange(sheet.getLastRow() + 1, 1, values.length, headers.length).setValues(values);
}

function kspFindDisposableDefaultSheet_(spreadsheet) {
  var sheets = spreadsheet.getSheets();
  if (sheets.length !== 1) {
    return null;
  }
  var sheet = sheets[0];
  var name = sheet.getName();
  var defaultNames = ['Sheet1', 'シート1'];
  if (defaultNames.indexOf(name) === -1) {
    return null;
  }
  if (sheet.getLastRow() !== 0 || sheet.getLastColumn() !== 0) {
    return null;
  }
  return sheet;
}
