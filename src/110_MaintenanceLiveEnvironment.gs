var KSP_MAINTENANCE_CLAIM_PREFIX = 'KSP_MAINTENANCE_CLAIM_';

function kspCreateMaintenanceEnvironment() {
  var environment = kspCreatePitchbookEnvironment();
  var scriptProperties = PropertiesService.getScriptProperties();

  environment.readDocumentText = function (documentId) {
    kspAssert(documentId, 'MEETING_DOCUMENT_ID_MISSING', 'Meeting document ID is missing.');
    var document = DocumentApp.openById(documentId);
    return document.getBody().getText();
  };

  environment.mutateMeetingRecord = function (options) {
    var claim = kspClaimMaintenanceMutation(
      scriptProperties,
      'MEETING_' + String(options.currentRow.Meeting_ID),
      options.claimTtlMs
    );
    var originalText = '';
    var originalName = '';
    var documentChanged = false;
    try {
      var snapshot = kspGetLiveRowSnapshot(
        options.spreadsheetId,
        KSP_SHEET_NAMES.MEETING_INDEX,
        'Meeting_ID',
        options.currentRow.Meeting_ID
      );
      kspAssert(Number(snapshot.row.Version || 0) === Number(options.expectedVersion),
        'MEETING_STALE_VERSION', '別の利用者が先に更新しました。最新内容を再読込してください。');

      var file = Drive.Files.get(options.documentId, {
        supportsAllDrives: true,
        fields: 'id,name,trashed'
      });
      kspAssert(file && !file.trashed, 'MEETING_DOCUMENT_NOT_FOUND', 'Meeting document is not accessible.');
      originalName = String(file.name || '');
      var document = DocumentApp.openById(options.documentId);
      originalText = document.getBody().getText();
      document.getBody().clear();
      document.getBody().setText(options.documentText);
      document.saveAndClose();
      if (originalName !== options.filename) {
        Drive.Files.update({ name: options.filename }, options.documentId, null, {
          supportsAllDrives: true,
          fields: 'id,name'
        });
      }
      documentChanged = true;

      return kspReplaceLiveRowWithExpectedToken({
        spreadsheetId: options.spreadsheetId,
        sheetName: KSP_SHEET_NAMES.MEETING_INDEX,
        keyColumn: 'Meeting_ID',
        keyValue: options.currentRow.Meeting_ID,
        tokenColumn: 'Version',
        expectedToken: Number(options.expectedVersion),
        nextRow: options.nextRow,
        staleCode: 'MEETING_STALE_VERSION'
      });
    } catch (error) {
      if (documentChanged) {
        try {
          var rollbackDocument = DocumentApp.openById(options.documentId);
          rollbackDocument.getBody().clear();
          rollbackDocument.getBody().setText(originalText);
          rollbackDocument.saveAndClose();
          if (originalName) {
            Drive.Files.update({ name: originalName }, options.documentId, null, {
              supportsAllDrives: true,
              fields: 'id,name'
            });
          }
        } catch (rollbackError) {
          error.rollbackWarning = rollbackError.message || String(rollbackError);
        }
      }
      throw error;
    } finally {
      kspReleaseMaintenanceMutation(scriptProperties, claim);
    }
  };

  environment.mutateMeetingStatus = function (options) {
    var claim = kspClaimMaintenanceMutation(
      scriptProperties,
      'MEETING_' + String(options.currentRow.Meeting_ID),
      options.claimTtlMs
    );
    try {
      return kspReplaceLiveRowWithExpectedToken({
        spreadsheetId: options.spreadsheetId,
        sheetName: KSP_SHEET_NAMES.MEETING_INDEX,
        keyColumn: 'Meeting_ID',
        keyValue: options.currentRow.Meeting_ID,
        tokenColumn: 'Version',
        expectedToken: Number(options.expectedVersion),
        nextRow: options.nextRow,
        staleCode: 'MEETING_STALE_VERSION'
      });
    } finally {
      kspReleaseMaintenanceMutation(scriptProperties, claim);
    }
  };

  environment.mutatePitchbookRecord = function (options) {
    var documentId = String(options.currentRow.Document_ID || '');
    var claim = kspClaimMaintenanceMutation(
      scriptProperties,
      'PITCHBOOK_' + documentId,
      options.claimTtlMs
    );
    var before = kspDeepClone(options.currentRow);
    var updated = null;
    try {
      updated = kspReservePitchbookMetadataMove(options);
      try {
        Drive.Files.update({ name: updated.Saved_Filename }, String(updated.File_ID), null, {
          supportsAllDrives: true,
          fields: 'id,name'
        });
      } catch (renameError) {
        try {
          kspRollbackPitchbookMetadataMove(options.spreadsheetId, updated, before);
        } catch (rollbackError) {
          renameError.rollbackWarning = rollbackError.message || String(rollbackError);
        }
        renameError.code = renameError.code || 'PITCHBOOK_FILE_RENAME_FAILED';
        throw renameError;
      }
      return updated;
    } finally {
      kspReleaseMaintenanceMutation(scriptProperties, claim);
    }
  };

  environment.mutatePitchbookStatus = function (options) {
    var documentId = String(options.currentRow.Document_ID || '');
    var claim = kspClaimMaintenanceMutation(
      scriptProperties,
      'PITCHBOOK_' + documentId,
      options.claimTtlMs
    );
    try {
      var nextRow = kspDeepClone(options.currentRow);
      nextRow.Status = options.status;
      nextRow.Updated_At = options.nowIso;
      nextRow.Updated_By = options.actor;
      nextRow.AI_Index_Status = KSP_AI_INDEX_STATUS.PENDING;
      nextRow.AI_Last_Error = '';
      return kspReplaceLiveRowWithExpectedToken({
        spreadsheetId: options.spreadsheetId,
        sheetName: KSP_SHEET_NAMES.PITCHBOOK_INDEX,
        keyColumn: 'Document_ID',
        keyValue: documentId,
        tokenColumn: 'Updated_At',
        expectedToken: options.expectedUpdatedAt,
        nextRow: nextRow,
        staleCode: 'PITCHBOOK_STALE_UPDATED_AT'
      });
    } finally {
      kspReleaseMaintenanceMutation(scriptProperties, claim);
    }
  };

  environment.addGpMaster = function (options) {
    return kspAddMasterLive(options, 'GP');
  };

  environment.addOptionMaster = function (options) {
    return kspAddMasterLive(options, 'OPTION');
  };

  environment.updateMasterItem = function (options) {
    return kspUpdateMasterLive(options);
  };

  environment.reorderOptionItems = function (options) {
    return kspReorderOptionsLive(options);
  };

  return environment;
}

function kspClaimMaintenanceMutation(scriptProperties, claimName, ttlMs) {
  var lock = LockService.getScriptLock();
  if (!lock.tryLock(KSP_DEFAULTS.LOCK_TIMEOUT_MS)) {
    var lockError = new Error('Could not acquire the maintenance claim lock.');
    lockError.code = 'MAINTENANCE_CLAIM_LOCK_TIMEOUT';
    throw lockError;
  }
  try {
    var key = KSP_MAINTENANCE_CLAIM_PREFIX + claimName;
    var existing = kspSafeParseJson(scriptProperties.getProperty(key), key);
    var now = Date.now();
    if (existing && Number(existing.expiresAt || 0) > now) {
      var busyError = new Error('このレコードは別の更新処理中です。少し待って再試行してください。');
      busyError.code = 'RECORD_MUTATION_BUSY';
      throw busyError;
    }
    var token = Utilities.getUuid();
    var claim = { key: key, token: token, expiresAt: now + Number(ttlMs || KSP_MAINTENANCE_CLAIM_TTL_MS) };
    scriptProperties.setProperty(key, JSON.stringify(claim));
    return claim;
  } finally {
    lock.releaseLock();
  }
}

function kspReleaseMaintenanceMutation(scriptProperties, claim) {
  if (!claim || !claim.key) return;
  var lock = LockService.getScriptLock();
  if (!lock.tryLock(KSP_DEFAULTS.LOCK_TIMEOUT_MS)) return;
  try {
    var existing = kspSafeParseJson(scriptProperties.getProperty(claim.key), claim.key);
    if (existing && String(existing.token || '') === String(claim.token || '')) {
      scriptProperties.deleteProperty(claim.key);
    }
  } finally {
    lock.releaseLock();
  }
}

function kspGetLiveRowSnapshot(spreadsheetId, sheetName, keyColumn, keyValue) {
  var spreadsheet = SpreadsheetApp.openById(spreadsheetId);
  var sheet = spreadsheet.getSheetByName(sheetName);
  kspAssert(sheet, 'SHEET_NOT_FOUND', 'Sheet not found: ' + sheetName);
  var headers = kspReadHeadersFromSheet(sheet);
  var rows = kspReadObjectsFromSheet(sheet, headers);
  var matches = [];
  rows.forEach(function (row, index) {
    if (String(row[keyColumn] || '') === String(keyValue)) {
      matches.push({ row: row, rowIndex: index + 2 });
    }
  });
  kspAssert(matches.length === 1, matches.length === 0 ? 'RECORD_NOT_FOUND' : 'DUPLICATE_KEY_ROWS',
    'Expected exactly one row for ' + keyColumn + ': ' + keyValue);
  return { sheet: sheet, headers: headers, row: matches[0].row, rowIndex: matches[0].rowIndex };
}

function kspReplaceLiveRowWithExpectedToken(options) {
  var lock = LockService.getScriptLock();
  if (!lock.tryLock(KSP_DEFAULTS.LOCK_TIMEOUT_MS)) {
    var lockError = new Error('Could not acquire the record update lock.');
    lockError.code = 'RECORD_UPDATE_LOCK_TIMEOUT';
    throw lockError;
  }
  try {
    var snapshot = kspGetLiveRowSnapshot(
      options.spreadsheetId,
      options.sheetName,
      options.keyColumn,
      options.keyValue
    );
    kspAssert(String(snapshot.row[options.tokenColumn]) === String(options.expectedToken),
      options.staleCode || 'STALE_RECORD', '別の利用者が先に更新しました。最新内容を再読込してください。');
    var values = snapshot.headers.map(function (header) {
      var value = options.nextRow[header];
      return value === undefined || value === null ? '' : value;
    });
    snapshot.sheet.getRange(snapshot.rowIndex, 1, 1, snapshot.headers.length).setValues([values]);
    return kspDeepClone(options.nextRow);
  } finally {
    lock.releaseLock();
  }
}

function kspReservePitchbookMetadataMove(options) {
  var lock = LockService.getScriptLock();
  if (!lock.tryLock(KSP_DEFAULTS.LOCK_TIMEOUT_MS)) {
    var lockError = new Error('Could not acquire the Pitchbook metadata lock.');
    lockError.code = 'PITCHBOOK_METADATA_LOCK_TIMEOUT';
    throw lockError;
  }
  try {
    var spreadsheet = SpreadsheetApp.openById(options.spreadsheetId);
    var sheet = spreadsheet.getSheetByName(KSP_SHEET_NAMES.PITCHBOOK_INDEX);
    kspAssert(sheet, 'SHEET_NOT_FOUND', 'Sheet not found: ' + KSP_SHEET_NAMES.PITCHBOOK_INDEX);
    var headers = kspReadHeadersFromSheet(sheet);
    var rows = kspReadObjectsFromSheet(sheet, headers);
    var rowIndex = -1;
    var current = null;
    rows.forEach(function (row, index) {
      if (String(row.Document_ID || '') === String(options.currentRow.Document_ID || '')) {
        kspAssert(rowIndex === -1, 'DUPLICATE_KEY_ROWS', 'Duplicate Pitchbook Document ID.');
        rowIndex = index + 2;
        current = row;
      }
    });
    kspAssert(current, 'PITCHBOOK_NOT_FOUND', 'Pitchbook record was not found.');
    kspAssert(String(current.Updated_At || '') === String(options.expectedUpdatedAt),
      'PITCHBOOK_STALE_UPDATED_AT', '別の利用者が先に更新しました。最新内容を再読込してください。');

    var next = kspDeepClone(current);
    var contextChanged = kspPitchbookNamingContextChanged(current, options.input);
    if (contextChanged) {
      var maxSequence = rows.reduce(function (maximum, row) {
        if (String(row.Document_ID || '') === String(current.Document_ID || '')) return maximum;
        var sameContext = String(row.Date || '') === options.input.date &&
          String(row.GP_ID || '') === options.input.gpId &&
          String(row.Asset_Class_ID || '') === options.input.assetClassId &&
          String(row.Capital_Type_ID || '') === options.input.capitalTypeId;
        return sameContext ? Math.max(maximum, Number(row.Sequence_No || 0)) : maximum;
      }, 0);
      next.Sequence_No = maxSequence + 1;
    }
    next.Date = options.input.date;
    next.GP_ID = options.input.gpId;
    next.Asset_Class_ID = options.input.assetClassId;
    next.Capital_Type_ID = options.input.capitalTypeId;
    next.Saved_Filename = kspBuildPitchbookFilename(
      options.input,
      options.selected,
      next.Sequence_No,
      kspGetPitchbookExtension(current.Original_Filename)
    );
    next.Updated_At = options.nowIso;
    next.Updated_By = options.actor;
    next.AI_Index_Status = KSP_AI_INDEX_STATUS.PENDING;
    next.AI_Last_Error = '';
    var values = headers.map(function (header) {
      var value = next[header];
      return value === undefined || value === null ? '' : value;
    });
    sheet.getRange(rowIndex, 1, 1, headers.length).setValues([values]);
    return next;
  } finally {
    lock.releaseLock();
  }
}

function kspRollbackPitchbookMetadataMove(spreadsheetId, updated, before) {
  return kspReplaceLiveRowWithExpectedToken({
    spreadsheetId: spreadsheetId,
    sheetName: KSP_SHEET_NAMES.PITCHBOOK_INDEX,
    keyColumn: 'Document_ID',
    keyValue: updated.Document_ID,
    tokenColumn: 'Updated_At',
    expectedToken: updated.Updated_At,
    nextRow: before,
    staleCode: 'PITCHBOOK_ROLLBACK_CONFLICT'
  });
}

function kspAddMasterLive(options, kind) {
  var lock = LockService.getScriptLock();
  if (!lock.tryLock(KSP_DEFAULTS.LOCK_TIMEOUT_MS)) {
    var lockError = new Error('Could not acquire the Master add lock.');
    lockError.code = 'MASTER_ADD_LOCK_TIMEOUT';
    throw lockError;
  }
  try {
    var spreadsheet = SpreadsheetApp.openById(options.spreadsheetId);
    var sheetName = kind === 'GP' ? KSP_SHEET_NAMES.GP_MASTER : KSP_SHEET_NAMES.OPTION_MASTER;
    var sheet = spreadsheet.getSheetByName(sheetName);
    kspAssert(sheet, 'SHEET_NOT_FOUND', 'Sheet not found: ' + sheetName);
    var headers = kspReadHeadersFromSheet(sheet);
    var rows = kspReadObjectsFromSheet(sheet, headers);
    var row;
    if (kind === 'GP') {
      kspAssertUniqueMasterName(rows, options.name, 'GP_ID', 'GP_Name');
      row = {
        GP_ID: kspFormatGpId(kspNextGpSequence(rows)),
        GP_Name: options.name,
        Status: KSP_STATUS.ACTIVE,
        Created_At: options.nowIso,
        Updated_At: options.nowIso,
        Created_By: options.actor,
        Updated_By: options.actor
      };
    } else {
      kspAssertUniqueMasterName(rows, options.name, 'Option_ID', 'Name', '', options.type);
      var typeRows = rows.filter(function (existing) { return String(existing.Type || '') === options.type; });
      var maxSort = typeRows.reduce(function (maximum, existing) {
        return Math.max(maximum, Number(existing.Sort_Order || 0));
      }, 0);
      row = {
        Option_ID: kspFormatOptionId(options.type, kspNextOptionSequence(rows, options.type)),
        Type: options.type,
        Name: options.name,
        Sort_Order: maxSort + 1,
        Status: KSP_STATUS.ACTIVE,
        Created_At: options.nowIso,
        Updated_At: options.nowIso,
        Created_By: options.actor,
        Updated_By: options.actor
      };
    }
    var values = headers.map(function (header) {
      var value = row[header];
      return value === undefined || value === null ? '' : value;
    });
    sheet.getRange(sheet.getLastRow() + 1, 1, 1, headers.length).setValues([values]);
    return row;
  } finally {
    lock.releaseLock();
  }
}

function kspUpdateMasterLive(options) {
  var sheetName = options.kind === 'GP' ? KSP_SHEET_NAMES.GP_MASTER : KSP_SHEET_NAMES.OPTION_MASTER;
  var keyColumn = options.kind === 'GP' ? 'GP_ID' : 'Option_ID';
  var lock = LockService.getScriptLock();
  if (!lock.tryLock(KSP_DEFAULTS.LOCK_TIMEOUT_MS)) {
    var lockError = new Error('Could not acquire the Master update lock.');
    lockError.code = 'MASTER_UPDATE_LOCK_TIMEOUT';
    throw lockError;
  }
  try {
    var spreadsheet = SpreadsheetApp.openById(options.spreadsheetId);
    var sheet = spreadsheet.getSheetByName(sheetName);
    kspAssert(sheet, 'SHEET_NOT_FOUND', 'Sheet not found: ' + sheetName);
    var headers = kspReadHeadersFromSheet(sheet);
    var rows = kspReadObjectsFromSheet(sheet, headers);
    var indexes = [];
    rows.forEach(function (row, index) {
      if (String(row[keyColumn] || '') === String(options.id)) indexes.push(index);
    });
    kspAssert(indexes.length === 1, indexes.length === 0 ? 'MASTER_NOT_FOUND' : 'MASTER_DUPLICATE_ID',
      'Expected exactly one Master row for ' + options.id + '.');
    var current = rows[indexes[0]];
    kspAssert(String(current.Updated_At || '') === String(options.expectedUpdatedAt),
      'MASTER_STALE_UPDATED_AT', '別の利用者が先に更新しました。最新内容を再読込してください。');
    if (options.changes.GP_Name !== undefined) {
      kspAssertUniqueMasterName(rows, options.changes.GP_Name, 'GP_ID', 'GP_Name', options.id);
    }
    if (options.changes.Name !== undefined) {
      kspAssertUniqueMasterName(rows, options.changes.Name, 'Option_ID', 'Name', options.id, current.Type);
    }
    var updated = kspDeepClone(current);
    Object.keys(options.changes).forEach(function (key) { updated[key] = options.changes[key]; });
    updated.Updated_At = options.nowIso;
    updated.Updated_By = options.actor;
    var values = headers.map(function (header) {
      var value = updated[header];
      return value === undefined || value === null ? '' : value;
    });
    sheet.getRange(indexes[0] + 2, 1, 1, headers.length).setValues([values]);
    return updated;
  } finally {
    lock.releaseLock();
  }
}

function kspReorderOptionsLive(options) {
  var lock = LockService.getScriptLock();
  if (!lock.tryLock(KSP_DEFAULTS.LOCK_TIMEOUT_MS)) {
    var lockError = new Error('Could not acquire the Option reorder lock.');
    lockError.code = 'OPTION_REORDER_LOCK_TIMEOUT';
    throw lockError;
  }
  try {
    var spreadsheet = SpreadsheetApp.openById(options.spreadsheetId);
    var sheet = spreadsheet.getSheetByName(KSP_SHEET_NAMES.OPTION_MASTER);
    kspAssert(sheet, 'SHEET_NOT_FOUND', 'Sheet not found: ' + KSP_SHEET_NAMES.OPTION_MASTER);
    var headers = kspReadHeadersFromSheet(sheet);
    var rows = kspReadObjectsFromSheet(sheet, headers);
    var targetRows = rows.filter(function (row) { return String(row.Type || '') === options.type; });
    var currentIds = targetRows.map(function (row) { return String(row.Option_ID || ''); }).sort();
    kspAssert(JSON.stringify(currentIds) === JSON.stringify(options.orderedIds.slice().sort()),
      'OPTION_ORDER_MEMBERSHIP_MISMATCH', '並び順の対象が現在のマスターと一致しません。');
    var orderById = {};
    options.orderedIds.forEach(function (id, index) { orderById[id] = index + 1; });
    var updatedRows = [];
    rows.forEach(function (row, index) {
      if (String(row.Type || '') !== options.type) return;
      var updated = kspDeepClone(row);
      updated.Sort_Order = orderById[String(row.Option_ID || '')];
      updated.Updated_At = options.nowIso;
      updated.Updated_By = options.actor;
      var values = headers.map(function (header) {
        var value = updated[header];
        return value === undefined || value === null ? '' : value;
      });
      sheet.getRange(index + 2, 1, 1, headers.length).setValues([values]);
      updatedRows.push(updated);
    });
    return updatedRows.sort(function (left, right) {
      return Number(left.Sort_Order || 0) - Number(right.Sort_Order || 0);
    });
  } finally {
    lock.releaseLock();
  }
}
