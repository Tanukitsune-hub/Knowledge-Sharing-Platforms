// ===== BEGIN src/120_MaintenanceLiveEnvironment.gs =====
function kspCreateMaintenanceEnvironment_() {
  var environment = kspCreateMeetingEnvironment_();
  var scriptProperties = PropertiesService.getScriptProperties();

  environment.getSheetHeaders = function (spreadsheetId, sheetName) {
    var spreadsheet = SpreadsheetApp.openById(spreadsheetId);
    var sheet = spreadsheet.getSheetByName(sheetName);
    kspAssert_(sheet, 'SHEET_NOT_FOUND', 'Sheet not found: ' + sheetName);
    return kspReadHeadersFromSheet_(sheet);
  };

  environment.getDocumentText = function (fileId) {
    kspAssert_(fileId, 'MEETING_DOCUMENT_ID_MISSING', 'Meeting Doc File IDがありません。');
    return DocumentApp.openById(fileId).getBody().getText();
  };

  environment.getDriveFileMetadata = function (fileId) {
    kspAssert_(fileId, 'DRIVE_FILE_ID_MISSING', 'Drive File IDがありません。');
    var file = Drive.Files.get(fileId, {
      supportsAllDrives: true,
      fields: 'id,name,mimeType,parents,trashed,webViewLink,size'
    });
    kspAssert_(file && file.id && !file.trashed, 'DRIVE_FILE_NOT_ACCESSIBLE',
      'Drive file is not accessible.');
    return {
      id: String(file.id), name: String(file.name || ''), mimeType: String(file.mimeType || ''),
      parents: file.parents || [], trashed: Boolean(file.trashed),
      webViewLink: String(file.webViewLink || ''), size: Number(file.size || 0)
    };
  };

  environment.claimPublicOperation = function (cacheKey, expirationSeconds) {
    var cache = CacheService.getScriptCache();
    var lock = LockService.getScriptLock();
    if (!lock.tryLock(5000)) return false;
    try {
      if (cache.get(String(cacheKey))) return false;
      cache.put(String(cacheKey), '1', Math.max(1, Math.min(21600, Number(expirationSeconds) || 2)));
      return true;
    } finally {
      lock.releaseLock();
    }
  };

  environment.getPublicIdempotency = function (cacheKey) {
    var value = CacheService.getScriptCache().get(String(cacheKey));
    if (!value || String(value).charAt(0) !== '{') return null;
    try {
      return kspSafeParseJson_(value, 'public idempotency cache');
    } catch (error) {
      return null;
    }
  };

  environment.setPublicIdempotency = function (cacheKey, value, expirationSeconds) {
    CacheService.getScriptCache().put(
      String(cacheKey), JSON.stringify(value), Math.max(1, Math.min(21600, Number(expirationSeconds) || 300))
    );
  };

  environment.getDocumentSnapshot = function (fileId) {
    var file = Drive.Files.get(fileId, { supportsAllDrives: true, fields: 'id,name' });
    return { name: file.name || '', text: DocumentApp.openById(fileId).getBody().getText() };
  };

  environment.updateMeetingDocument = function (fileId, filename, text) {
    Drive.Files.update({ name: filename }, fileId, null, { supportsAllDrives: true, fields: 'id,name' });
    var document = DocumentApp.openById(fileId);
    document.getBody().clear().setText(text);
    document.saveAndClose();
  };

  environment.restoreDocumentSnapshot = function (fileId, snapshot) {
    Drive.Files.update({ name: snapshot.name }, fileId, null, { supportsAllDrives: true, fields: 'id,name' });
    var document = DocumentApp.openById(fileId);
    document.getBody().clear().setText(snapshot.text || '');
    document.saveAndClose();
  };

  environment.getDriveFileSnapshot = function (fileId) {
    var file = Drive.Files.get(fileId, { supportsAllDrives: true, fields: 'id,name' });
    return { name: file.name || '' };
  };

  environment.renameDriveFile = function (fileId, filename) {
    Drive.Files.update({ name: filename }, fileId, null, { supportsAllDrives: true, fields: 'id,name' });
  };

  environment.restoreDriveFileSnapshot = function (fileId, snapshot) {
    Drive.Files.update({ name: snapshot.name }, fileId, null, { supportsAllDrives: true, fields: 'id,name' });
  };

  environment.claimRecordEdit = function (
    entity, recordId, sheetName, keyColumn, tokenColumn, expectedToken, nowIso, ttlMs
  ) {
    var lock = kspMaintenanceAcquireLock_('record edit claim');
    try {
      var claimKey = kspMaintenanceClaimKey_(entity, recordId);
      var existingClaim = kspSafeParseJson_(scriptProperties.getProperty(claimKey), claimKey);
      var canonicalNowIso = kspCanonicalInstantIso_(nowIso);
      kspAssert_(canonicalNowIso, 'RECORD_EDIT_NOW_INVALID', '編集処理の基準日時が不正です。');
      var nowMs = new Date(canonicalNowIso).getTime();
      if (existingClaim && Number(existingClaim.expiresAtMs || 0) > nowMs) {
        var busyError = new Error('このレコードは別の編集処理中です。少し待って再試行してください。');
        busyError.code = 'RECORD_EDIT_IN_PROGRESS';
        throw busyError;
      }
      var state = environment.getInstallationState();
      var spreadsheetId = state.resources[KSP_RESOURCE_KEYS.BACKEND_SPREADSHEET];
      var found = kspMaintenanceFindSheetRow_(spreadsheetId, sheetName, keyColumn, recordId);
      kspAssert_(found, 'RECORD_NOT_FOUND', '編集対象が見つかりません。');
      kspAssert_((tokenColumn === 'Updated_At'
        ? kspTemporalInstantComparisonKey_(found.row[tokenColumn])
        : String(found.row[tokenColumn])) === (tokenColumn === 'Updated_At'
          ? kspTemporalInstantComparisonKey_(expectedToken) : String(expectedToken)),
        'STALE_RECORD_VERSION', '他の利用者が先に更新しています。最新情報を読み直してください。');
      var claimToken = Utilities.getUuid();
      var claim = {
        claimKey: claimKey,
        claimToken: claimToken,
        entity: entity,
        recordId: recordId,
        sheetName: sheetName,
        keyColumn: keyColumn,
        tokenColumn: tokenColumn,
        expectedToken: String(expectedToken),
        expiresAtMs: nowMs + Number(ttlMs || KSP_MAINTENANCE_LIMITS.EDIT_CLAIM_TTL_MS),
        row: found.row
      };
      scriptProperties.setProperty(claimKey, JSON.stringify(claim));
      return claim;
    } finally {
      lock.releaseLock();
    }
  };

  environment.isRecordEditClaimOwned = function (claim) {
    if (!claim || !claim.claimKey || !claim.claimToken) return false;
    var lock = kspMaintenanceAcquireLock_('record edit claim ownership check');
    try {
      var stored = kspSafeParseJson_(scriptProperties.getProperty(claim.claimKey), claim.claimKey);
      return Boolean(stored && stored.claimToken === claim.claimToken);
    } finally {
      lock.releaseLock();
    }
  };

  environment.releaseRecordEditClaim = function (claim) {
    var lock = kspMaintenanceAcquireLock_('record edit claim release');
    try {
      var stored = kspSafeParseJson_(scriptProperties.getProperty(claim.claimKey), claim.claimKey);
      if (stored && stored.claimToken === claim.claimToken) scriptProperties.deleteProperty(claim.claimKey);
    } finally {
      lock.releaseLock();
    }
  };

  environment.reservePitchbookEditSequence = function (claim, input) {
    var lock = kspMaintenanceAcquireLock_('Pitchbook edit sequence reservation');
    try {
      var stored = kspSafeParseJson_(scriptProperties.getProperty(claim.claimKey), claim.claimKey);
      kspAssert_(stored && stored.claimToken === claim.claimToken,
        'RECORD_EDIT_CLAIM_LOST', '編集権の有効期限が切れました。');
      var state = environment.getInstallationState();
      var spreadsheetId = state.resources[KSP_RESOURCE_KEYS.BACKEND_SPREADSHEET];
      var rows = environment.readRows(spreadsheetId, KSP_SHEET_NAMES.PITCHBOOK_INDEX);
      var maximum = rows.reduce(function (maxValue, row) {
        if (String(row.Document_ID || '') === String(input.documentId)) return maxValue;
        return kspPitchbookContextMatchesRow_(row, input)
          ? Math.max(maxValue, Number(row.Sequence_No || 0)) : maxValue;
      }, 0);
      var properties = scriptProperties.getProperties();
      Object.keys(properties).forEach(function (key) {
        if (key.indexOf('KSP_EDIT_CLAIM_Pitchbook_') !== 0 || key === claim.claimKey) return;
        var other = kspSafeParseJson_(properties[key], key);
        if (!other || Number(other.expiresAtMs || 0) <= Date.now()) return;
        if (other.reservedContextKey === kspMaintenancePitchbookContextKey_(input)) {
          maximum = Math.max(maximum, Number(other.reservedSequence || 0));
        }
      });
      stored.reservedContextKey = kspMaintenancePitchbookContextKey_(input);
      stored.reservedSequence = maximum + 1;
      scriptProperties.setProperty(claim.claimKey, JSON.stringify(stored));
      return stored.reservedSequence;
    } finally {
      lock.releaseLock();
    }
  };

  environment.commitClaimedRowEdit = function (
    claim, sheetName, keyColumn, keyValue, tokenColumn, expectedToken, updatedRow
  ) {
    var lock = kspMaintenanceAcquireLock_('record edit commit');
    try {
      var stored = kspSafeParseJson_(scriptProperties.getProperty(claim.claimKey), claim.claimKey);
      kspAssert_(stored && stored.claimToken === claim.claimToken,
        'RECORD_EDIT_CLAIM_LOST', '編集権の有効期限が切れました。');
      var state = environment.getInstallationState();
      var spreadsheetId = state.resources[KSP_RESOURCE_KEYS.BACKEND_SPREADSHEET];
      var found = kspMaintenanceFindSheetRow_(spreadsheetId, sheetName, keyColumn, keyValue);
      kspAssert_(found, 'RECORD_NOT_FOUND', '更新対象が見つかりません。');
      kspAssert_((tokenColumn === 'Updated_At'
        ? kspTemporalInstantComparisonKey_(found.row[tokenColumn])
        : String(found.row[tokenColumn])) === (tokenColumn === 'Updated_At'
          ? kspTemporalInstantComparisonKey_(expectedToken) : String(expectedToken)),
        'STALE_RECORD_VERSION', '他の利用者が先に更新しています。最新情報を読み直してください。');
      kspMaintenanceWriteSheetRow_(found.sheet, found.headers, found.rowNumber, updatedRow);
      scriptProperties.deleteProperty(claim.claimKey);
      return updatedRow;
    } finally {
      lock.releaseLock();
    }
  };

  environment.commitClaimedPitchbookEdit = function (
    claim, documentId, expectedUpdatedAt, updatedRow
  ) {
    var lock = kspMaintenanceAcquireLock_('Pitchbook edit commit');
    try {
      var stored = kspSafeParseJson_(scriptProperties.getProperty(claim.claimKey), claim.claimKey);
      kspAssert_(stored && stored.claimToken === claim.claimToken,
        'RECORD_EDIT_CLAIM_LOST', '編集権の有効期限が切れました。');
      var state = environment.getInstallationState();
      var spreadsheetId = state.resources[KSP_RESOURCE_KEYS.BACKEND_SPREADSHEET];
      var found = kspMaintenanceFindSheetRow_(
        spreadsheetId, KSP_SHEET_NAMES.PITCHBOOK_INDEX, 'Document_ID', documentId
      );
      kspAssert_(found, 'RECORD_NOT_FOUND', '更新対象が見つかりません。');
      kspAssert_(kspTemporalInstantComparisonKey_(found.row.Updated_At) === kspTemporalInstantComparisonKey_(expectedUpdatedAt),
        'STALE_RECORD_VERSION', '他の利用者が先に更新しています。最新情報を読み直してください。');

      var fields = {};
      if (kspCanonicalBusinessDate_(found.row.Date) !== kspCanonicalBusinessDate_(updatedRow.Date)) {
        fields.Date = updatedRow.Date;
      }
      [
        'GP_ID', 'Counterparty_Type', 'Counterparty_ID', 'Related_GP_IDs',
        'Asset_Class_ID', 'Capital_Type_ID', 'Fund_Strategy',
        'Sequence_No', 'Saved_Filename'
      ].forEach(function (header) {
        if (String(found.row[header] || '') !== String(updatedRow[header] || '')) {
          fields[header] = updatedRow[header];
        }
      });
      fields.Updated_At = updatedRow.Updated_At;
      fields.Updated_By = updatedRow.Updated_By;
      fields.AI_Index_Status = updatedRow.AI_Index_Status;
      fields.AI_Last_Error = updatedRow.AI_Last_Error;

      kspMaintenanceWriteSheetFieldsWithRollback_(
        found.sheet, found.headers, found.rowNumber, fields, found.row
      );
      scriptProperties.deleteProperty(claim.claimKey);
      return Object.assign({}, found.row, fields);
    } finally {
      lock.releaseLock();
    }
  };

  environment.getNextPitchbookSequenceForContext = function (input, excludedDocumentId, rows) {
    return (rows || []).reduce(function (maxValue, row) {
      if (String(row.Document_ID || '') === String(excludedDocumentId || '')) return maxValue;
      return kspPitchbookContextMatchesRow_(row, input)
        ? Math.max(maxValue, Number(row.Sequence_No || 0)) : maxValue;
    }, 0) + 1;
  };

  environment.updateStatusAtomic = function (
    sheetName, keyColumn, keyValue, tokenColumn, expectedToken, targetStatus, actor, nowIso
  ) {
    var lock = kspMaintenanceAcquireLock_('Meeting status update');
    try {
      var state = environment.getInstallationState();
      var spreadsheetId = state.resources[KSP_RESOURCE_KEYS.BACKEND_SPREADSHEET];
      var found = kspMaintenanceFindSheetRow_(spreadsheetId, sheetName, keyColumn, keyValue);
      kspAssert_(found, 'RECORD_NOT_FOUND', '対象レコードが見つかりません。');
      if (sheetName === KSP_SHEET_NAMES.MEETING_INDEX) kspAssertNoParentEditClaim_(scriptProperties, keyValue, nowIso);
      kspAssert_((tokenColumn === 'Updated_At'
        ? kspTemporalInstantComparisonKey_(found.row[tokenColumn])
        : String(found.row[tokenColumn])) === (tokenColumn === 'Updated_At'
          ? kspTemporalInstantComparisonKey_(expectedToken) : String(expectedToken)),
        'STALE_RECORD_VERSION', '他の利用者が先に更新しています。');
      if (sheetName === KSP_SHEET_NAMES.MEETING_INDEX && targetStatus === KSP_STATUS.ACTIVE) {
        kspAssert_(String(found.row.Doc_File_ID || ''), 'MEETING_AUTHORITATIVE_DOCUMENT_MISSING',
          'Google Doc原本がない面談はActiveに戻せません。');
      }
      // Status changes must not rewrite untouched authoritative metadata cells.
      var before = Object.assign({}, found.row);
      var after = Object.assign({}, found.row);
      after.Status = targetStatus;
      after.Version = Number(found.row.Version || 0) + 1;
      after.Updated_At = nowIso;
      after.Updated_By = actor;
      after.AI_Index_Status = KSP_AI_INDEX_STATUS.PENDING;
      after.AI_Last_Error = '';
      kspMaintenanceWriteSheetFields_(found.sheet, found.headers, found.rowNumber, {
        Status: after.Status,
        Version: after.Version,
        Updated_At: after.Updated_At,
        Updated_By: after.Updated_By,
        AI_Index_Status: after.AI_Index_Status,
        AI_Last_Error: after.AI_Last_Error
      });
      return { before: before, after: after };
    } finally {
      lock.releaseLock();
    }
  };

  environment.updatePitchbookStatusAtomic = function (
    documentId, expectedUpdatedAt, targetStatus, actor, nowIso
  ) {
    var lock = kspMaintenanceAcquireLock_('Pitchbook status update');
    try {
      var state = environment.getInstallationState();
      var spreadsheetId = state.resources[KSP_RESOURCE_KEYS.BACKEND_SPREADSHEET];
      var found = kspMaintenanceFindSheetRow_(
        spreadsheetId, KSP_SHEET_NAMES.PITCHBOOK_INDEX, 'Document_ID', documentId
      );
      kspAssert_(found, 'PITCHBOOK_NOT_FOUND', 'Pitchbookが見つかりません。');
      kspAssert_(kspTemporalInstantComparisonKey_(found.row.Updated_At) === kspTemporalInstantComparisonKey_(expectedUpdatedAt),
        'STALE_RECORD_VERSION', '他の利用者が先に更新しています。');
      if (targetStatus === KSP_STATUS.ACTIVE) {
        kspAssert_(String(found.row.File_ID || ''), 'PITCHBOOK_AUTHORITATIVE_FILE_MISSING',
          'Drive原本がない資料はActiveに戻せません。');
      }
      var before = Object.assign({}, found.row);
      var after = Object.assign({}, found.row);
      after.Status = targetStatus;
      after.Updated_At = nowIso;
      after.Updated_By = actor;
      after.AI_Index_Status = KSP_AI_INDEX_STATUS.PENDING;
      after.AI_Last_Error = '';
      kspMaintenanceWriteSheetFieldsWithRollback_(found.sheet, found.headers, found.rowNumber, {
        Status: after.Status,
        Updated_At: after.Updated_At,
        Updated_By: after.Updated_By,
        AI_Index_Status: after.AI_Index_Status,
        AI_Last_Error: after.AI_Last_Error
      }, found.row);
      return { before: before, after: after };
    } finally {
      lock.releaseLock();
    }
  };

  environment.mutateMasterAtomic = function (input, actor, nowIso) {
    var lock = kspMaintenanceAcquireLock_('Master mutation');
    try {
      var state = environment.getInstallationState();
      var spreadsheetId = state.resources[KSP_RESOURCE_KEYS.BACKEND_SPREADSHEET];
      var sheetName = input.entity === KSP_MASTER_ENTITY.COUNTERPARTY
        ? KSP_SHEET_NAMES.COUNTERPARTY_MASTER : KSP_SHEET_NAMES.OPTION_MASTER;
      var spreadsheet = SpreadsheetApp.openById(spreadsheetId);
      var sheet = spreadsheet.getSheetByName(sheetName);
      kspAssert_(sheet, 'SHEET_NOT_FOUND', 'Master sheetがありません。');
      var headers = kspReadHeadersFromSheet_(sheet);
      var rows = kspReadObjectsFromSheet_(sheet, headers);
      var keyColumn = input.entity === KSP_MASTER_ENTITY.COUNTERPARTY ? 'Counterparty_ID' : 'Option_ID';
      var before = null;
      var after = null;

      if (input.action === KSP_MASTER_MUTATION.ADD) {
        var duplicate = kspFindNormalizedMasterDuplicate_(rows, input.entity, input.type, input.name, '');
        if (duplicate) {
          if (input.returnExistingOnDuplicate) return { before: duplicate, after: duplicate, existing: true };
          var duplicateError = new Error('同じ名称のMasterが既に存在します。');
          duplicateError.code = 'MASTER_DUPLICATE_NAME';
          throw duplicateError;
        }
        if (input.entity === KSP_MASTER_ENTITY.COUNTERPARTY) {
          after = {
            Counterparty_ID: kspNextCounterpartyId_(rows), Counterparty_Name: input.name,
            Counterparty_Type: input.type, Status: KSP_STATUS.ACTIVE,
            Created_At: nowIso, Updated_At: nowIso, Created_By: actor, Updated_By: actor
          };
        } else {
          var typeRows = rows.filter(function (row) { return String(row.Type) === input.type; });
          var maximumOrder = typeRows.reduce(function (maximum, row) {
            return Math.max(maximum, Number(row.Sort_Order || 0));
          }, 0);
          after = {
            Option_ID: kspNextOptionId_(rows, input.type), Type: input.type,
            Name: input.name, Sort_Order: maximumOrder + 1, Status: KSP_STATUS.ACTIVE,
            Created_At: nowIso, Updated_At: nowIso, Created_By: actor, Updated_By: actor
          };
        }
        kspAppendObjectsToSheet_(sheet, headers, [after]);
        return { before: null, after: after, existing: false };
      }

      if (input.action === KSP_MASTER_MUTATION.REORDER_BATCH) {
        var plan = kspBuildOptionBatchReorderPlan_(rows, input, actor, nowIso);
        var values = plan.rows.map(function (row) {
          return headers.map(function (header) {
            return row[header] === null || row[header] === undefined ? '' : row[header];
          });
        });
        sheet.getRange(2, 1, values.length, headers.length).setValues(values);
        return plan;
      }

      var matches = rows.filter(function (row) { return String(row[keyColumn]) === input.id; });
      kspAssert_(matches.length === 1, 'MASTER_NOT_FOUND', '対象Masterが見つかりません。');
      before = kspDeepClone_(matches[0]);
      after = kspDeepClone_(matches[0]);

      if (input.action === KSP_MASTER_MUTATION.RENAME) {
        var renameType = input.entity === KSP_MASTER_ENTITY.COUNTERPARTY
          ? String(after.Counterparty_Type || '') : String(after.Type || '');
        kspAssert_(!kspFindNormalizedMasterDuplicate_(rows, input.entity, renameType, input.name, input.id),
          'MASTER_DUPLICATE_NAME', '同じ名称のMasterが既に存在します。');
        if (input.entity === KSP_MASTER_ENTITY.COUNTERPARTY) after.Counterparty_Name = input.name;
        else after.Name = input.name;
      } else if (input.action === KSP_MASTER_MUTATION.DEACTIVATE) {
        after.Status = KSP_STATUS.INACTIVE;
      } else if (input.action === KSP_MASTER_MUTATION.REACTIVATE) {
        after.Status = KSP_STATUS.ACTIVE;
      } else if (input.action === KSP_MASTER_MUTATION.REORDER) {
        var sameType = rows.filter(function (row) { return String(row.Type || '') === String(after.Type || ''); })
          .sort(function (left, right) { return Number(left.Sort_Order || 0) - Number(right.Sort_Order || 0); });
        var affectedBefore = sameType.map(kspDeepClone_);
        var withoutTarget = sameType.filter(function (row) { return String(row.Option_ID) !== input.id; });
        var targetIndex = Math.max(0, Math.min(input.sortOrder - 1, withoutTarget.length));
        withoutTarget.splice(targetIndex, 0, after);
        withoutTarget.forEach(function (row, index) {
          row.Sort_Order = index + 1;
          row.Updated_At = nowIso;
          row.Updated_By = actor;
          var found = kspMaintenanceFindRowInSheetObjects_(sheet, headers, 'Option_ID', row.Option_ID);
          kspMaintenanceWriteSheetRow_(sheet, headers, found.rowNumber, row);
        });
        after = withoutTarget[targetIndex];
        return { before: before, after: after, affectedBefore: affectedBefore, affectedRows: withoutTarget.map(kspDeepClone_) };
      }

      after.Updated_At = nowIso;
      after.Updated_By = actor;
      var foundRow = kspMaintenanceFindRowInSheetObjects_(sheet, headers, keyColumn, input.id);
      kspMaintenanceWriteSheetRow_(sheet, headers, foundRow.rowNumber, after);
      return { before: before, after: after };
    } finally {
      lock.releaseLock();
    }
  };

  environment.deleteAuditRowsBefore = function (auditSpreadsheetId, cutoffIso) {
    var spreadsheet = SpreadsheetApp.openById(auditSpreadsheetId);
    var sheet = spreadsheet.getSheetByName(KSP_SHEET_NAMES.AUDIT_LOG);
    kspAssert_(sheet, 'AUDIT_SHEET_NOT_FOUND', 'Audit_Log sheetがありません。');
    var headers = kspReadHeadersFromSheet_(sheet);
    var timestampIndex = headers.indexOf('Event_Timestamp');
    kspAssert_(timestampIndex !== -1, 'AUDIT_SCHEMA_INVALID', 'Event_Timestamp列がありません。');
    var lastRow = sheet.getLastRow();
    if (lastRow < 2) return { deletedRows: 0 };
    var values = sheet.getRange(2, 1, lastRow - 1, headers.length).getValues();
    var rowNumbers = [];
    values.forEach(function (row, index) {
      var value = row[timestampIndex];
      var iso = kspCanonicalInstantIso_(value);
      if (iso && iso < cutoffIso) rowNumbers.push(index + 2);
    });
    rowNumbers.sort(function (a, b) { return b - a; }).forEach(function (rowNumber) {
      sheet.deleteRow(rowNumber);
    });
    return { deletedRows: rowNumbers.length };
  };

  kspAttachParentRelationAdapters_(environment, scriptProperties);
  return environment;
}
// ===== END src/120_MaintenanceLiveEnvironment.gs =====

// ===== BEGIN src/121_MaintenanceLiveHelpers.gs =====
function kspMaintenanceAcquireLock_(operation) {
  var lock = LockService.getScriptLock();
  if (!lock.tryLock(KSP_DEFAULTS.LOCK_TIMEOUT_MS)) {
    var error = new Error(operation + 'のLockを取得できませんでした。');
    error.code = 'MAINTENANCE_LOCK_TIMEOUT';
    throw error;
  }
  return lock;
}

function kspMaintenanceClaimKey_(entity, recordId) {
  return 'KSP_EDIT_CLAIM_' + String(entity).replace(/[^A-Za-z0-9_-]/g, '_') + '_' +
    String(recordId).replace(/[^A-Za-z0-9_-]/g, '_');
}

function kspMaintenancePitchbookContextKey_(input) {
  return [input.date, input.counterpartyId, input.assetClassId, input.capitalTypeId].join('|');
}

function kspMaintenanceFindSheetRow_(spreadsheetId, sheetName, keyColumn, keyValue) {
  var spreadsheet = SpreadsheetApp.openById(spreadsheetId);
  var sheet = spreadsheet.getSheetByName(sheetName);
  kspAssert_(sheet, 'SHEET_NOT_FOUND', 'Sheet not found: ' + sheetName);
  var headers = kspReadHeadersFromSheet_(sheet);
  return kspMaintenanceFindRowInSheetObjects_(sheet, headers, keyColumn, keyValue);
}

function kspMaintenanceFindRowInSheetObjects_(sheet, headers, keyColumn, keyValue) {
  var rows = kspReadObjectsFromSheet_(sheet, headers);
  var matches = [];
  rows.forEach(function (row, index) {
    if (String(row[keyColumn]) === String(keyValue)) matches.push({ row: row, rowNumber: index + 2 });
  });
  kspAssert_(matches.length <= 1, 'DUPLICATE_KEY_ROWS', '同じIDの行が複数あります: ' + keyValue);
  if (!matches.length) return null;
  return { sheet: sheet, headers: headers, row: matches[0].row, rowNumber: matches[0].rowNumber };
}

function kspMaintenanceWriteSheetRow_(sheet, headers, rowNumber, row) {
  var values = headers.map(function (header) {
    var value = row[header];
    return value === undefined || value === null ? '' : value;
  });
  sheet.getRange(rowNumber, 1, 1, headers.length).setValues([values]);
}

function kspMaintenanceWriteSheetFields_(sheet, headers, rowNumber, fields) {
  Object.keys(fields).forEach(function (header) {
    var columnIndex = headers.indexOf(header);
    kspAssert_(columnIndex !== -1, 'SHEET_HEADER_MISSING', 'Sheet header not found: ' + header);
    var value = fields[header];
    sheet.getRange(rowNumber, columnIndex + 1).setValue(
      value === undefined || value === null ? '' : value
    );
  });
}

function kspMaintenanceWriteSheetFieldsWithRollback_(sheet, headers, rowNumber, fields, beforeRow) {
  var changes = Object.keys(fields).map(function (header) {
    var columnIndex = headers.indexOf(header);
    kspAssert_(columnIndex !== -1, 'SHEET_HEADER_MISSING', 'Sheet header not found: ' + header);
    return {
      columnIndex: columnIndex,
      before: beforeRow[header] === undefined || beforeRow[header] === null ? '' : beforeRow[header],
      after: fields[header] === undefined || fields[header] === null ? '' : fields[header]
    };
  });
  var attempted = [];
  try {
    changes.forEach(function (change) {
      attempted.push(change);
      sheet.getRange(rowNumber, change.columnIndex + 1).setValue(change.after);
    });
  } catch (error) {
    var rollbackError = null;
    for (var index = attempted.length - 1; index >= 0; index -= 1) {
      try {
        var change = attempted[index];
        sheet.getRange(rowNumber, change.columnIndex + 1).setValue(change.before);
      } catch (restoreError) {
        rollbackError = rollbackError || restoreError;
      }
    }
    if (rollbackError) {
      var failure = new Error('Pitchbook partial write rollback failed.');
      failure.code = 'PITCHBOOK_PARTIAL_WRITE_ROLLBACK_FAILED';
      throw failure;
    }
    throw error;
  }
}
// ===== END src/121_MaintenanceLiveHelpers.gs =====

// ===== BEGIN src/126_ActivityAnalyticsService.gs =====
var KSP_ACTIVITY_ANALYTICS_WORK_ID = '0017';
var KSP_ACTIVITY_ANALYTICS_UNSET = '__UNSET__';

var KSP_ACTIVITY_ANALYTICS_PERIODS = Object.freeze({
  MONTHLY: 'monthly',
  QUARTER: 'quarter',
  CALENDAR_YEAR: 'calendarYear',
  FISCAL_YEAR: 'fiscalYear',
  CUSTOM: 'custom',
  CUMULATIVE: 'cumulative'
});

var KSP_ACTIVITY_ANALYTICS_DIMENSIONS = Object.freeze([
  'counterpartyType', 'counterpartyEntity', 'assetClass',
  'team', 'meetingType', 'status'
]);

var KSP_ACTIVITY_ANALYTICS_LIMITS = Object.freeze({
  DRILL: 100,
  BREAKDOWN: 50,
  FILTER_OPTIONS: 100
});

var KSP_ACTIVITY_ANALYTICS_ADMIN_ACTION = 'MEETING_ADMIN_CHECK';

function kspActivityNormalizePeriod_(value) {
  var normalized = String(value || '').trim().toLowerCase()
    .replace(/[\s_-]+/g, '');
  var aliases = {
    month: KSP_ACTIVITY_ANALYTICS_PERIODS.MONTHLY,
    monthly: KSP_ACTIVITY_ANALYTICS_PERIODS.MONTHLY,
    quarter: KSP_ACTIVITY_ANALYTICS_PERIODS.QUARTER,
    quarterly: KSP_ACTIVITY_ANALYTICS_PERIODS.QUARTER,
    calendarquarter: KSP_ACTIVITY_ANALYTICS_PERIODS.QUARTER,
    year: KSP_ACTIVITY_ANALYTICS_PERIODS.CALENDAR_YEAR,
    yearly: KSP_ACTIVITY_ANALYTICS_PERIODS.CALENDAR_YEAR,
    calendaryear: KSP_ACTIVITY_ANALYTICS_PERIODS.CALENDAR_YEAR,
    fiscal: KSP_ACTIVITY_ANALYTICS_PERIODS.FISCAL_YEAR,
    fiscalyear: KSP_ACTIVITY_ANALYTICS_PERIODS.FISCAL_YEAR,
    custom: KSP_ACTIVITY_ANALYTICS_PERIODS.CUSTOM,
    range: KSP_ACTIVITY_ANALYTICS_PERIODS.CUSTOM,
    cumulative: KSP_ACTIVITY_ANALYTICS_PERIODS.CUMULATIVE
  };
  return aliases[normalized] || '';
}

function kspActivityNormalizeDimension_(value) {
  var normalized = String(value || '').trim().toLowerCase()
    .replace(/[\s_-]+/g, '');
  var aliases = {
    counterpartytype: 'counterpartyType',
    counterpartyentity: 'counterpartyEntity',
    entity: 'counterpartyEntity',
    relatedgp: 'relatedGp',
    relatedgps: 'relatedGp',
    assetclass: 'assetClass',
    team: 'team',
    meetingtype: 'meetingType',
    status: 'status'
  };
  return aliases[normalized] || '';
}

function kspActivityCanonicalDateInput_(value) {
  if (value === null || value === undefined || value === '') return '';
  var canonical = kspCanonicalBusinessDate_(value);
  kspAssert_(canonical, 'ACTIVITY_ANALYTICS_DATE_INVALID', '分析対象の日付が不正です。');
  return canonical;
}

function kspActivityNormalizeFilterValue_(value) {
  var text = value === null || value === undefined ? '' : String(value).trim();
  return text === '未設定' ? KSP_ACTIVITY_ANALYTICS_UNSET : text;
}

function kspActivityNormalizeInput_(rawInput) {
  var source = rawInput && typeof rawInput === 'object' ? rawInput : {};
  var suppliedFilters = source.filters && typeof source.filters === 'object' ? source.filters : source;
  var period = kspActivityNormalizePeriod_(source.period || source.periodMode || source.mode || 'monthly');
  var dimension = kspActivityNormalizeDimension_(
    source.dimension || source.breakdownDimension || 'counterpartyType'
  );
  kspAssert_(period, 'ACTIVITY_ANALYTICS_PERIOD_INVALID', '分析期間が不正です。');
  kspAssert_(dimension, 'ACTIVITY_ANALYTICS_DIMENSION_INVALID', '分析項目が不正です。');

  var dateFrom = kspActivityCanonicalDateInput_(
    source.dateFrom !== undefined ? source.dateFrom : source.startDate
  );
  var dateTo = kspActivityCanonicalDateInput_(source.dateTo);
  if (dateFrom && dateTo) {
    kspAssert_(dateFrom <= dateTo, 'ACTIVITY_ANALYTICS_DATE_RANGE_INVALID',
      '分析対象の日付範囲が不正です。');
  }
  if (period === KSP_ACTIVITY_ANALYTICS_PERIODS.CUSTOM) {
    kspAssert_(dateFrom && dateTo, 'ACTIVITY_ANALYTICS_DATE_RANGE_INVALID',
      'カスタム期間には開始日と終了日が必要です。');
  }

  var drillLimit = source.drillLimit === undefined ? source.meetingLimit : source.drillLimit;
  var breakdownLimit = source.breakdownLimit;
  drillLimit = drillLimit === undefined || drillLimit === '' ? KSP_ACTIVITY_ANALYTICS_LIMITS.DRILL : Number(drillLimit);
  breakdownLimit = breakdownLimit === undefined || breakdownLimit === ''
    ? KSP_ACTIVITY_ANALYTICS_LIMITS.BREAKDOWN : Number(breakdownLimit);
  kspAssert_(Number.isFinite(drillLimit) && drillLimit > 0 && Math.floor(drillLimit) === drillLimit &&
    drillLimit <= KSP_ACTIVITY_ANALYTICS_LIMITS.DRILL, 'ACTIVITY_ANALYTICS_LIMIT_INVALID',
    '分析対象Meeting件数上限が不正です。');
  kspAssert_(Number.isFinite(breakdownLimit) && breakdownLimit > 0 && Math.floor(breakdownLimit) === breakdownLimit &&
    breakdownLimit <= KSP_ACTIVITY_ANALYTICS_LIMITS.BREAKDOWN, 'ACTIVITY_ANALYTICS_LIMIT_INVALID',
    '分析内訳件数上限が不正です。');

  return {
    period: period,
    dimension: dimension,
    dateFrom: dateFrom,
    dateTo: dateTo,
    filters: {
      counterpartyType: kspActivityNormalizeFilterValue_(suppliedFilters.counterpartyType),
      counterpartyEntity: kspActivityNormalizeFilterValue_(
        suppliedFilters.counterpartyEntityKey || suppliedFilters.counterpartyEntity || suppliedFilters.counterpartyEntityId
      ),
      counterpartyId: kspActivityNormalizeFilterValue_(suppliedFilters.counterpartyId),
      relatedGp: kspActivityNormalizeFilterValue_(suppliedFilters.relatedGp || suppliedFilters.relatedGpId),
      assetClass: kspActivityNormalizeFilterValue_(suppliedFilters.assetClass || suppliedFilters.assetClassId),
      team: kspActivityNormalizeFilterValue_(suppliedFilters.team || suppliedFilters.teamId),
      meetingType: kspActivityNormalizeFilterValue_(suppliedFilters.meetingType || suppliedFilters.meetingTypeCode),
      status: kspActivityNormalizeFilterValue_(suppliedFilters.status || suppliedFilters.filterStatus)
    },
    drillLimit: drillLimit,
    breakdownLimit: breakdownLimit
  };
}

function kspActivityRowCounterpartyType_(row) {
  return String(row && row.__Counterparty_Type || kspMeetingCounterpartyType_(row) || '').trim();
}

function kspActivityRowCounterpartyId_(row) {
  return String(kspMeetingCounterpartyId_(row) || '').trim();
}

function kspActivityRowCounterpartyKey_(row) {
  var id = kspActivityRowCounterpartyId_(row);
  return id ? 'COUNTERPARTY:' + id : '';
}

function kspActivityRowRelatedGpIds_(row) {
  return kspMaintenanceSplitCodes_(kspMeetingRelatedGpIds_(row));
}

function kspActivityValueMatches_(actual, requested) {
  if (!requested) return true;
  if (requested === KSP_ACTIVITY_ANALYTICS_UNSET) return !actual;
  return String(actual || '') === String(requested);
}

function kspActivityRowMatchesFilters_(row, input, includeDateRange) {
  var filters = input.filters || {};
  var date = kspCanonicalBusinessDate_(row.Date);
  if (!date) return false;
  if (includeDateRange && input.dateFrom && date < input.dateFrom) return false;
  if (includeDateRange && input.dateTo && date > input.dateTo) return false;
  if (!kspActivityValueMatches_(kspActivityRowCounterpartyType_(row), filters.counterpartyType)) return false;
  if (filters.counterpartyEntity && filters.counterpartyEntity !== KSP_ACTIVITY_ANALYTICS_UNSET &&
      filters.counterpartyEntity.indexOf(':') !== -1) {
    if (!kspActivityValueMatches_(kspActivityRowCounterpartyKey_(row), filters.counterpartyEntity)) return false;
  } else if (!kspActivityValueMatches_(kspActivityRowCounterpartyId_(row), filters.counterpartyEntity)) {
    return false;
  }
  if (filters.counterpartyId && !kspActivityValueMatches_(kspActivityRowCounterpartyId_(row), filters.counterpartyId)) return false;
  if (filters.relatedGp) {
    var relatedGpIds = kspActivityRowRelatedGpIds_(row);
    if (filters.relatedGp === KSP_ACTIVITY_ANALYTICS_UNSET) {
      if (relatedGpIds.length) return false;
    } else if (relatedGpIds.indexOf(filters.relatedGp) === -1) {
      return false;
    }
  }
  if (!kspActivityValueMatches_(String(row.Asset_Class_ID || '').trim(), filters.assetClass)) return false;
  if (!kspActivityValueMatches_(String(row.Team_ID || '').trim(), filters.team)) return false;
  if (filters.meetingType) {
    var meetingTypes = kspMaintenanceSplitCodes_(row.Meeting_Type_Codes);
    if (filters.meetingType === KSP_ACTIVITY_ANALYTICS_UNSET) {
      if (meetingTypes.length) return false;
    } else if (meetingTypes.indexOf(filters.meetingType) === -1) {
      return false;
    }
  }
  if (!kspActivityValueMatches_(String(row.Status || '').trim(), filters.status)) return false;
  return true;
}

function kspActivityDateParts_(dateKey) {
  var parts = String(dateKey || '').split('-');
  return { year: Number(parts[0]), month: Number(parts[1]), day: Number(parts[2]) };
}

function kspActivityDaysInMonth_(year, month) {
  if (month === 2) return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0) ? 29 : 28;
  return [4, 6, 9, 11].indexOf(month) !== -1 ? 30 : 31;
}

function kspActivityDateKey_(year, month, day) {
  return String(year).padStart(4, '0') + '-' + String(month).padStart(2, '0') + '-' + String(day).padStart(2, '0');
}

function kspActivityMonthStart_(dateKey) {
  var parts = kspActivityDateParts_(dateKey);
  return kspActivityDateKey_(parts.year, parts.month, 1);
}

function kspActivityMonthEnd_(dateKey) {
  var parts = kspActivityDateParts_(dateKey);
  return kspActivityDateKey_(parts.year, parts.month, kspActivityDaysInMonth_(parts.year, parts.month));
}

function kspActivityShiftMonth_(dateKey, offset) {
  var parts = kspActivityDateParts_(dateKey);
  var zeroBasedMonth = parts.year * 12 + parts.month - 1 + offset;
  var year = Math.floor(zeroBasedMonth / 12);
  var month = zeroBasedMonth % 12 + 1;
  return kspActivityDateKey_(year, month, 1);
}

function kspActivityNextDate_(dateKey) {
  var parts = kspActivityDateParts_(dateKey);
  if (parts.day < kspActivityDaysInMonth_(parts.year, parts.month)) {
    return kspActivityDateKey_(parts.year, parts.month, parts.day + 1);
  }
  return kspActivityShiftMonth_(dateKey, 1);
}

function kspActivityFiscalStartYear_(dateKey) {
  var parts = kspActivityDateParts_(dateKey);
  return parts.month >= 4 ? parts.year : parts.year - 1;
}

function kspActivityBucketForDate_(dateKey, period) {
  var parts = kspActivityDateParts_(dateKey);
  if (period === KSP_ACTIVITY_ANALYTICS_PERIODS.CUSTOM) {
    return { key: dateKey, startDate: dateKey, endDate: dateKey };
  }
  if (period === KSP_ACTIVITY_ANALYTICS_PERIODS.MONTHLY ||
      period === KSP_ACTIVITY_ANALYTICS_PERIODS.CUMULATIVE) {
    var monthStart = kspActivityDateKey_(parts.year, parts.month, 1);
    return { key: monthStart.slice(0, 7), startDate: monthStart, endDate: kspActivityMonthEnd_(monthStart) };
  }
  if (period === KSP_ACTIVITY_ANALYTICS_PERIODS.QUARTER) {
    var quarterStartMonth = Math.floor((parts.month - 1) / 3) * 3 + 1;
    var quarterStart = kspActivityDateKey_(parts.year, quarterStartMonth, 1);
    return {
      key: String(parts.year).padStart(4, '0') + '-Q' + String(Math.floor((parts.month - 1) / 3) + 1),
      startDate: quarterStart,
      endDate: kspActivityMonthEnd_(kspActivityShiftMonth_(quarterStart, 2))
    };
  }
  if (period === KSP_ACTIVITY_ANALYTICS_PERIODS.CALENDAR_YEAR) {
    return {
      key: String(parts.year).padStart(4, '0'),
      startDate: kspActivityDateKey_(parts.year, 1, 1),
      endDate: kspActivityDateKey_(parts.year, 12, 31)
    };
  }
  var fiscalStartYear = kspActivityFiscalStartYear_(dateKey);
  return {
    key: 'FY' + String(fiscalStartYear).padStart(4, '0'),
    startDate: kspActivityDateKey_(fiscalStartYear, 4, 1),
    endDate: kspActivityDateKey_(fiscalStartYear + 1, 3, 31)
  };
}

function kspActivityNextBucket_(bucket, period) {
  if (period === KSP_ACTIVITY_ANALYTICS_PERIODS.CUSTOM) {
    var nextDate = kspActivityNextDate_(bucket.startDate);
    return { key: nextDate, startDate: nextDate, endDate: nextDate };
  }
  var monthOffset = period === KSP_ACTIVITY_ANALYTICS_PERIODS.QUARTER ? 3
    : period === KSP_ACTIVITY_ANALYTICS_PERIODS.CALENDAR_YEAR ||
      period === KSP_ACTIVITY_ANALYTICS_PERIODS.FISCAL_YEAR ? 12 : 1;
  return kspActivityBucketForDate_(kspActivityShiftMonth_(bucket.startDate, monthOffset), period);
}

function kspActivityBuildBucketSequence_(startDate, endDate, period) {
  if (!startDate || !endDate) return [];
  var first = kspActivityBucketForDate_(startDate, period);
  var last = kspActivityBucketForDate_(endDate, period);
  var buckets = [];
  var current = first;
  for (var guard = 0; guard < 10000 && current.startDate <= last.startDate; guard += 1) {
    buckets.push(current);
    current = kspActivityNextBucket_(current, period);
  }
  kspAssert_(buckets.length < 10000, 'ACTIVITY_ANALYTICS_DATE_RANGE_INVALID',
    '分析対象の期間が長すぎます。');
  return buckets;
}

function kspActivityBuildMetrics_(rows) {
  var entities = {};
  var activeMeetingCount = 0;
  var openFollowUpCount = 0;
  (rows || []).forEach(function (row) {
    var entityKey = kspActivityRowCounterpartyKey_(row);
    if (entityKey) entities[entityKey] = true;
    if (String(row.Status || '') === KSP_STATUS.ACTIVE) activeMeetingCount += 1;
    if (String(row.Status || '') === KSP_STATUS.ACTIVE && kspToBoolean_(row.Follow_Up_Required, false)) {
      openFollowUpCount += 1;
    }
  });
  return {
    meetingCount: (rows || []).length,
    activeMeetingCount: activeMeetingCount,
    distinctCounterpartyCount: Object.keys(entities).length,
    openFollowUpCount: openFollowUpCount
  };
}

function kspActivityBuildSeries_(rows, startDate, endDate, period) {
  var buckets = kspActivityBuildBucketSequence_(startDate, endDate, period);
  return buckets.map(function (bucket) {
    var bucketRows = (rows || []).filter(function (row) {
      var date = kspCanonicalBusinessDate_(row.Date);
      return date >= bucket.startDate && date <= bucket.endDate;
    });
    var metrics = kspActivityBuildMetrics_(bucketRows);
    var result = Object.assign({
      key: bucket.key,
      label: bucket.key,
      startDate: bucket.startDate,
      endDate: bucket.endDate,
      bucketMeetingCount: metrics.meetingCount
    }, metrics);
    return result;
  });
}

function kspActivityApplyCumulativeSeries_(series, rows) {
  var output = [];
  (series || []).forEach(function (item) {
    var cumulativeRows = (rows || []).filter(function (row) {
      var date = kspCanonicalBusinessDate_(row.Date);
      return date <= item.endDate;
    });
    var metrics = kspActivityBuildMetrics_(cumulativeRows);
    var result = Object.assign({}, item, {
      meetingCount: metrics.meetingCount,
      activeMeetingCount: metrics.activeMeetingCount,
      distinctCounterpartyCount: metrics.distinctCounterpartyCount,
      openFollowUpCount: metrics.openFollowUpCount,
      cumulativeMeetingCount: metrics.meetingCount,
      cumulativeActiveMeetingCount: metrics.activeMeetingCount,
      cumulativeDistinctCounterpartyCount: metrics.distinctCounterpartyCount,
      cumulativeOpenFollowUpCount: metrics.openFollowUpCount
    });
    output.push(result);
  });
  return output;
}

function kspActivityDimensionValues_(row, dimension) {
  if (dimension === 'counterpartyType') return [kspActivityRowCounterpartyType_(row) || KSP_ACTIVITY_ANALYTICS_UNSET];
  if (dimension === 'counterpartyEntity') return [kspActivityRowCounterpartyKey_(row) || KSP_ACTIVITY_ANALYTICS_UNSET];
  if (dimension === 'assetClass') return [String(row.Asset_Class_ID || '').trim() || KSP_ACTIVITY_ANALYTICS_UNSET];
  if (dimension === 'team') return [String(row.Team_ID || '').trim() || KSP_ACTIVITY_ANALYTICS_UNSET];
  if (dimension === 'meetingType') {
    var meetingTypes = kspMaintenanceSplitCodes_(row.Meeting_Type_Codes);
    return meetingTypes.length ? meetingTypes : [KSP_ACTIVITY_ANALYTICS_UNSET];
  }
  return [String(row.Status || '').trim() || KSP_ACTIVITY_ANALYTICS_UNSET];
}

function kspActivityDisplayValue_(value) {
  return value === KSP_ACTIVITY_ANALYTICS_UNSET ? '未設定' : String(value || '');
}

function kspActivityDisplayLabel_(row, dimension, value) {
  if (value === KSP_ACTIVITY_ANALYTICS_UNSET) return '未設定';
  if (dimension === 'counterpartyEntity') return String(row && row.__Counterparty_Name || '登録情報なし');
  if (dimension === 'assetClass') return String(row && row.__Asset_Class_Name || '登録情報なし');
  if (dimension === 'team') return String(row && row.__Team_Name || '登録情報なし');
  if (dimension === 'meetingType') {
    var labels = kspMeetingTypeLabels_(String(value || ''));
    return labels.length ? labels[0] : '登録情報なし';
  }
  if (dimension === 'counterpartyType') {
    var definition = kspCounterpartyTypeDefinition_(value);
    return definition ? definition.label : '登録情報なし';
  }
  return kspActivityDisplayValue_(value);
}

function kspActivityBuildBreakdown_(rows, dimension, limit) {
  var grouped = {};
  (rows || []).forEach(function (row) {
    kspActivityDimensionValues_(row, dimension).forEach(function (value) {
      if (!grouped[value]) grouped[value] = [];
      grouped[value].push(row);
    });
  });
  var items = Object.keys(grouped).map(function (value) {
    return Object.assign({
      key: value,
      value: value,
      label: kspActivityDisplayLabel_(grouped[value][0], dimension, value)
    }, kspActivityBuildMetrics_(grouped[value]));
  }).sort(function (left, right) {
    return right.meetingCount - left.meetingCount ||
      left.label.localeCompare(right.label, 'ja') || left.key.localeCompare(right.key);
  });
  return {
    dimension: dimension,
    totalCount: items.length,
    items: items.slice(0, limit),
    omittedCount: Math.max(0, items.length - limit)
  };
}

function kspActivityBuildFilterOption_(value, label) {
  return { value: value, label: label || kspActivityDisplayValue_(value) };
}

function kspActivityBuildFilterOptions_(rows) {
  var sets = {
    counterpartyTypes: {}, counterpartyEntities: {},
    assetClasses: {}, teams: {}, meetingTypes: {}, statuses: {}
  };
  (rows || []).forEach(function (row) {
    var type = kspActivityRowCounterpartyType_(row) || KSP_ACTIVITY_ANALYTICS_UNSET;
    var entity = kspActivityRowCounterpartyKey_(row) || KSP_ACTIVITY_ANALYTICS_UNSET;
    sets.counterpartyTypes[type] = kspActivityDisplayLabel_(row, 'counterpartyType', type);
    sets.counterpartyEntities[entity] = kspActivityDisplayLabel_(row, 'counterpartyEntity', entity);
    var assetClass = String(row.Asset_Class_ID || '').trim() || KSP_ACTIVITY_ANALYTICS_UNSET;
    var team = String(row.Team_ID || '').trim() || KSP_ACTIVITY_ANALYTICS_UNSET;
    sets.assetClasses[assetClass] = kspActivityDisplayLabel_(row, 'assetClass', assetClass);
    sets.teams[team] = kspActivityDisplayLabel_(row, 'team', team);
    var meetingTypes = kspMaintenanceSplitCodes_(row.Meeting_Type_Codes);
    (meetingTypes.length ? meetingTypes : [KSP_ACTIVITY_ANALYTICS_UNSET]).forEach(function (value) {
      sets.meetingTypes[value] = kspActivityDisplayLabel_(row, 'meetingType', value);
    });
    var status = String(row.Status || '').trim() || KSP_ACTIVITY_ANALYTICS_UNSET;
    sets.statuses[status] = kspActivityDisplayLabel_(row, 'status', status);
  });
  function mapSet(set) {
    return Object.keys(set).map(function (value) { return kspActivityBuildFilterOption_(value, set[value]); }).sort(function (left, right) {
      if (left.value === KSP_ACTIVITY_ANALYTICS_UNSET) return 1;
      if (right.value === KSP_ACTIVITY_ANALYTICS_UNSET) return -1;
      return left.label.localeCompare(right.label, 'ja') || left.value.localeCompare(right.value);
    }).slice(0, KSP_ACTIVITY_ANALYTICS_LIMITS.FILTER_OPTIONS);
  }
  return {
    counterpartyTypes: mapSet(sets.counterpartyTypes),
    counterpartyEntities: mapSet(sets.counterpartyEntities),
    assetClasses: mapSet(sets.assetClasses),
    teams: mapSet(sets.teams),
    meetingTypes: mapSet(sets.meetingTypes),
    statuses: mapSet(sets.statuses)
  };
}

function kspActivityMapMeeting_(row) {
  var meetingTypeCodes = kspMaintenanceSplitCodes_(row.Meeting_Type_Codes);
  var documentUrl = '';
  if (typeof kspWorkspaceSafeDriveLink_ === 'function') {
    documentUrl = kspWorkspaceSafeDriveLink_(row.Doc_URL, row.Doc_File_ID);
  }
  return {
    meetingId: String(row.Meeting_ID || ''),
    date: kspCanonicalBusinessDate_(row.Date),
    time: kspCanonicalBusinessTime_(row.Time),
    counterpartyType: kspActivityRowCounterpartyType_(row),
    counterpartyId: kspActivityRowCounterpartyId_(row),
    counterpartyEntityKey: kspActivityRowCounterpartyKey_(row),
    counterpartyName: String(row.__Counterparty_Name || '登録情報なし'),
    assetClassId: String(row.Asset_Class_ID || ''),
    assetClassName: String(row.__Asset_Class_Name || '登録情報なし'),
    teamId: String(row.Team_ID || ''),
    teamName: String(row.__Team_Name || '登録情報なし'),
    meetingTypeCodes: meetingTypeCodes,
    meetingTypeLabels: kspMeetingTypeLabels_(meetingTypeCodes.join(',')),
    followUpRequired: kspToBoolean_(row.Follow_Up_Required, false),
    status: String(row.Status || ''),
    version: Number(row.Version || 0),
    updatedAt: kspCanonicalInstantIso_(row.Updated_At),
    documentUrl: documentUrl,
    adminCheckCompleted: kspToBoolean_(row.Admin_Check_Completed, false),
    adminCheckUpdatedAt: kspCanonicalInstantIso_(row.Admin_Check_Updated_At),
    adminCheckUpdatedBy: String(row.Admin_Check_Updated_By || '')
  };
}

function kspActivityLoadContext_(environment, requireAudit) {
  var state = environment.getInstallationState();
  kspAssert_(state && state.resources, 'INSTALLATION_STATE_MISSING', 'Installation stateがありません。');
  var backendSpreadsheetId = state.resources[KSP_RESOURCE_KEYS.BACKEND_SPREADSHEET];
  var auditSpreadsheetId = state.resources[KSP_RESOURCE_KEYS.AUDIT_SPREADSHEET];
  kspAssert_(backendSpreadsheetId, 'BACKEND_SPREADSHEET_MISSING', 'Backend Spreadsheetがありません。');
  if (requireAudit) kspAssert_(auditSpreadsheetId, 'AUDIT_SPREADSHEET_MISSING', 'Audit Spreadsheetがありません。');
  return {
    state: state,
    backendSpreadsheetId: backendSpreadsheetId,
    auditSpreadsheetId: auditSpreadsheetId
  };
}

function kspActivityResolveBounds_(rows, input) {
  var datedRows = (rows || []).map(function (row) { return kspCanonicalBusinessDate_(row.Date); })
    .filter(Boolean).sort();
  var startDate = input.dateFrom || (datedRows.length ? datedRows[0] : '');
  var endDate = input.dateTo || (datedRows.length ? datedRows[datedRows.length - 1] : '');
  if (startDate && endDate) {
    kspAssert_(startDate <= endDate, 'ACTIVITY_ANALYTICS_DATE_RANGE_INVALID',
      '分析対象の日付範囲が不正です。');
  }
  return { startDate: startDate, endDate: endDate };
}

function kspGetMeetingActivityAnalytics_(environment, rawInput) {
  try {
    var context = kspActivityLoadContext_(environment, false);
    var input = kspActivityNormalizeInput_(rawInput);
    var typeById = {};
    var counterpartyNameById = {};
    (environment.readRows(context.backendSpreadsheetId, KSP_SHEET_NAMES.COUNTERPARTY_MASTER) || [])
      .forEach(function (row) {
        var id = String(row.Counterparty_ID || '');
        typeById[id] = String(row.Counterparty_Type || '');
        counterpartyNameById[id] = String(row.Counterparty_Name || '');
      });
    var assetClassNameById = {};
    var teamNameById = {};
    (environment.readRows(context.backendSpreadsheetId, KSP_SHEET_NAMES.OPTION_MASTER) || [])
      .forEach(function (row) {
        var id = String(row.Option_ID || '');
        if (String(row.Type || '') === 'ASSET_CLASS') assetClassNameById[id] = String(row.Name || '');
        if (String(row.Type || '') === 'TEAM') teamNameById[id] = String(row.Name || '');
      });
    var rows = (environment.readRows(context.backendSpreadsheetId, KSP_SHEET_NAMES.MEETING_INDEX) || [])
      .map(function (row) {
        var copy = Object.assign({}, row);
        var counterpartyId = kspMeetingCounterpartyId_(row);
        copy.__Counterparty_Type = typeById[counterpartyId] || kspMeetingCounterpartyType_(row);
        copy.__Counterparty_Name = counterpartyNameById[counterpartyId] || '';
        copy.__Asset_Class_Name = assetClassNameById[String(row.Asset_Class_ID || '')] || '';
        copy.__Team_Name = teamNameById[String(row.Team_ID || '')] || '';
        return copy;
      });
    var filterRows = rows.filter(function (row) { return kspActivityRowMatchesFilters_(row, input, false); });
    var bounds = kspActivityResolveBounds_(filterRows, input);
    var matchingRows = filterRows.filter(function (row) {
      var date = kspCanonicalBusinessDate_(row.Date);
      return (!input.dateFrom || date >= input.dateFrom) && (!input.dateTo || date <= input.dateTo);
    });
    var series = kspActivityBuildSeries_(matchingRows, bounds.startDate, bounds.endDate, input.period);
    if (input.period === KSP_ACTIVITY_ANALYTICS_PERIODS.CUMULATIVE) {
      series = kspActivityApplyCumulativeSeries_(series, matchingRows);
    }
    var drillAll = matchingRows.slice().sort(function (left, right) {
      return kspCanonicalBusinessDate_(right.Date).localeCompare(kspCanonicalBusinessDate_(left.Date)) ||
        kspTemporalInstantComparisonKey_(right.Updated_At).localeCompare(kspTemporalInstantComparisonKey_(left.Updated_At)) ||
        String(left.Meeting_ID || '').localeCompare(String(right.Meeting_ID || ''));
    }).map(kspActivityMapMeeting_);
    var drill = {
      totalCount: drillAll.length,
      records: drillAll.slice(0, input.drillLimit),
      omittedCount: Math.max(0, drillAll.length - input.drillLimit)
    };
    var singleMonth = input.period === KSP_ACTIVITY_ANALYTICS_PERIODS.MONTHLY && series.length === 1;
    var breakdown = kspActivityBuildBreakdown_(matchingRows, input.dimension, input.breakdownLimit);
    return {
      ok: true,
      workId: KSP_ACTIVITY_ANALYTICS_WORK_ID,
      period: {
        mode: input.period,
        dateFrom: input.dateFrom,
        dateTo: input.dateTo,
        startDate: bounds.startDate,
        endDate: bounds.endDate,
        bucketCount: series.length
      },
      dimension: input.dimension,
      filters: kspDeepClone_(input.filters),
      headline: kspActivityBuildMetrics_(matchingRows),
      series: series,
      breakdown: breakdown,
      drill: drill,
      omittedCounts: { drill: drill.omittedCount, breakdown: breakdown.omittedCount },
      filterOptions: kspActivityBuildFilterOptions_(rows),
      adminChecks: singleMonth ? drill.records : [],
      adminCheckAvailable: singleMonth,
      readModel: { source: 'Meeting_Index', documentBodyRead: false }
    };
  } catch (error) {
    var code = kspGetErrorCode_(error);
    return {
      ok: false,
      workId: KSP_ACTIVITY_ANALYTICS_WORK_ID,
      error: { code: code, message: kspSafePublicErrorMessage_(code, 'ANALYTICS') }
    };
  }
}

function kspNormalizeBooleanInput_(value) {
  if (value === true || value === false) return value;
  if (value === 'true' || value === '1' || value === 1) return true;
  if (value === 'false' || value === '0' || value === 0) return false;
  return null;
}

function kspNormalizeMeetingAdminCheckInput_(rawInput) {
  var source = rawInput && typeof rawInput === 'object' ? rawInput : {};
  var meetingId = kspMaintenanceTrim_(source.meetingId || source.id);
  var desired = kspNormalizeBooleanInput_(
    source.desiredCompleted !== undefined ? source.desiredCompleted : source.completed
  );
  var expected = source.expectedAdminCheckCompleted !== undefined
    ? source.expectedAdminCheckCompleted : source.expectedCompleted;
  var expectedCompleted = kspNormalizeBooleanInput_(expected);
  var expectedUpdatedAt = source.expectedAdminCheckUpdatedAt !== undefined
    ? source.expectedAdminCheckUpdatedAt : source.expectedUpdatedAt;
  expectedUpdatedAt = expectedUpdatedAt === null || expectedUpdatedAt === undefined ? '' : String(expectedUpdatedAt).trim();
  if (expectedUpdatedAt) {
    expectedUpdatedAt = kspCanonicalInstantIso_(expectedUpdatedAt);
    kspAssert_(expectedUpdatedAt, 'ADMIN_CHECK_STATE_INVALID', '月次管理状態の更新トークンが不正です。');
  }
  kspAssert_(meetingId, 'ADMIN_CHECK_MEETING_ID_REQUIRED', 'Meeting IDがありません。');
  if (typeof kspParseMeetingId_ === 'function') kspParseMeetingId_(meetingId);
  kspAssert_(desired !== null && expectedCompleted !== null, 'ADMIN_CHECK_STATE_REQUIRED',
    '月次管理状態がありません。');
  return {
    meetingId: meetingId,
    desiredCompleted: desired,
    expectedCompleted: expectedCompleted,
    expectedUpdatedAt: expectedUpdatedAt
  };
}

function kspMeetingAdminCheckSnapshot_(row) {
  return {
    Admin_Check_Completed: kspToBoolean_(row && row.Admin_Check_Completed, false),
    Admin_Check_Updated_At: kspCanonicalInstantIso_(row && row.Admin_Check_Updated_At),
    Admin_Check_Updated_By: String(row && row.Admin_Check_Updated_By || '')
  };
}

function kspUpdateMeetingAdminCheck_(environment, rawInput) {
  var warnings = [];
  var actor = 'UNIDENTIFIED';
  var context = null;
  var input = null;
  try {
    input = kspNormalizeMeetingAdminCheckInput_(rawInput);
    actor = kspGetMaintenanceActorSafely_(environment, warnings);
    context = kspActivityLoadContext_(environment, true);
    var result = environment.updateMeetingAdminCheckAtomic(
      input.meetingId, input.expectedCompleted, input.expectedUpdatedAt,
      input.desiredCompleted, actor, environment.nowIso()
    );
    var before = kspMeetingAdminCheckSnapshot_(result.before);
    var after = kspMeetingAdminCheckSnapshot_(result.after);
    if (result.changed) {
      kspTryMaintenanceAudit_(environment, context.auditSpreadsheetId, {
        timestamp: environment.nowIso(), actor: actor, action: KSP_ACTIVITY_ANALYTICS_ADMIN_ACTION,
        targetType: 'Meeting', targetId: input.meetingId, result: KSP_AUDIT_RESULTS.SUCCESS,
        before: before, after: after,
        changedFields: ['Admin_Check_Completed', 'Admin_Check_Updated_At', 'Admin_Check_Updated_By']
      }, warnings);
    }
    return {
      ok: true,
      workId: KSP_ACTIVITY_ANALYTICS_WORK_ID,
      meetingId: input.meetingId,
      changed: Boolean(result.changed),
      idempotent: !result.changed,
      adminCheck: {
        completed: after.Admin_Check_Completed,
        updatedAt: after.Admin_Check_Updated_At,
        updatedBy: after.Admin_Check_Updated_By
      },
      warnings: warnings
    };
  } catch (error) {
    return {
      ok: false,
      workId: KSP_ACTIVITY_ANALYTICS_WORK_ID,
      error: { code: kspGetErrorCode_(error), message: kspSafePublicErrorMessage_(kspGetErrorCode_(error), 'ANALYTICS') },
      warnings: warnings
    };
  }
}
// ===== END src/126_ActivityAnalyticsService.gs =====

// ===== BEGIN src/127_ActivityAnalyticsLiveEnvironment.gs =====
function kspCreateActivityAnalyticsEnvironment_() {
  var environment = kspCreateMaintenanceEnvironment_();

  environment.updateMeetingAdminCheckAtomic = function (
    meetingId, expectedCompleted, expectedUpdatedAt, desiredCompleted, actor, nowIso
  ) {
    var lock = kspMaintenanceAcquireLock_('Meeting monthly admin check');
    try {
      var state = environment.getInstallationState();
      kspAssert_(state && state.resources, 'INSTALLATION_STATE_MISSING', 'Installation stateがありません。');
      var backendSpreadsheetId = state.resources[KSP_RESOURCE_KEYS.BACKEND_SPREADSHEET];
      kspAssert_(backendSpreadsheetId, 'BACKEND_SPREADSHEET_MISSING', 'Backend Spreadsheetがありません。');
      var found = kspMaintenanceFindSheetRow_(
        backendSpreadsheetId, KSP_SHEET_NAMES.MEETING_INDEX, 'Meeting_ID', meetingId
      );
      kspAssert_(found, 'ADMIN_CHECK_NOT_FOUND', '対象Meetingが見つかりません。');

      var currentCompleted = kspToBoolean_(found.row.Admin_Check_Completed, false);
      var currentUpdatedAt = kspCanonicalInstantIso_(found.row.Admin_Check_Updated_At);
      kspAssert_(currentCompleted === expectedCompleted && currentUpdatedAt === expectedUpdatedAt,
        'ADMIN_CHECK_STALE', '月次管理状態が先に更新されています。');

      var before = Object.assign({}, found.row);
      if (currentCompleted === desiredCompleted) {
        return { changed: false, before: before, after: Object.assign({}, before) };
      }

      var canonicalNowIso = kspCanonicalInstantIso_(nowIso);
      kspAssert_(canonicalNowIso, 'ADMIN_CHECK_STATE_INVALID', '更新日時が不正です。');
      var fields = {
        Admin_Check_Completed: desiredCompleted,
        Admin_Check_Updated_At: canonicalNowIso,
        Admin_Check_Updated_By: actor || 'UNIDENTIFIED'
      };
      kspMaintenanceWriteSheetFieldsWithRollback_(
        found.sheet, found.headers, found.rowNumber, fields, found.row
      );
      return { changed: true, before: before, after: Object.assign({}, before, fields) };
    } finally {
      lock.releaseLock();
    }
  };

  return environment;
}
// ===== END src/127_ActivityAnalyticsLiveEnvironment.gs =====

// ===== BEGIN src/128_RelationshipExplorerService.gs =====
var KSP_RELATIONSHIP_EXPLORER_WORK_ID = '0018';
var KSP_RELATIONSHIP_EXPLORER_UNSET = '__UNSET__';

var KSP_RELATIONSHIP_EXPLORER_LIMITS = Object.freeze({
  FORWARD_MEETINGS: 50,
  REVERSE_PITCHBOOKS: 50,
  RELATED_PITCHBOOKS: 25,
  REFERENCING_MEETINGS: 25,
  FILTER_OPTIONS: 100
});

function kspCreateRelationshipExplorerEnvironment_() {
  var source = kspCreateMeetingEnvironment_();
  return {
    getInstallationState: source.getInstallationState,
    readRows: source.readRows
  };
}

function kspRelationshipTrim_(value) {
  return value === null || value === undefined ? '' : String(value).trim();
}

function kspRelationshipFilterValue_(value) {
  var text = kspRelationshipTrim_(value);
  return text === '未設定' ? KSP_RELATIONSHIP_EXPLORER_UNSET : text;
}

function kspRelationshipPositiveLimit_(value, fallback, maximum) {
  if (value === null || value === undefined || value === '') return fallback;
  var numberValue = Number(value);
  kspAssert_(Number.isFinite(numberValue) && numberValue > 0 &&
    Math.floor(numberValue) === numberValue && numberValue <= maximum,
    'RELATIONSHIP_EXPLORER_LIMIT_INVALID', 'Relationship Explorerの表示上限が不正です。');
  return numberValue;
}

function kspRelationshipNormalizeInput_(rawInput) {
  var source = rawInput && typeof rawInput === 'object' ? rawInput : {};
  var supplied = source.filters && typeof source.filters === 'object' ? source.filters : source;
  var rawDateFrom = source.dateFrom !== undefined ? source.dateFrom : supplied.dateFrom;
  var rawDateTo = source.dateTo !== undefined ? source.dateTo : supplied.dateTo;
  var dateFrom = rawDateFrom === null || rawDateFrom === undefined ? '' : rawDateFrom;
  var dateTo = rawDateTo === null || rawDateTo === undefined ? '' : rawDateTo;
  if (dateFrom) {
    dateFrom = kspCanonicalBusinessDate_(dateFrom);
    kspAssert_(dateFrom, 'RELATIONSHIP_EXPLORER_DATE_INVALID', 'Relationship Explorerの日付が不正です。');
  }
  if (dateTo) {
    dateTo = kspCanonicalBusinessDate_(dateTo);
    kspAssert_(dateTo, 'RELATIONSHIP_EXPLORER_DATE_INVALID', 'Relationship Explorerの日付が不正です。');
  }
  if (dateFrom && dateTo) {
    kspAssert_(dateFrom <= dateTo, 'RELATIONSHIP_EXPLORER_DATE_RANGE_INVALID',
      'Relationship Explorerの日付範囲が不正です。');
  }
  return {
    dateFrom: dateFrom,
    dateTo: dateTo,
    filters: {
      counterpartyType: kspRelationshipFilterValue_(supplied.counterpartyType),
      counterpartyEntity: kspRelationshipFilterValue_(
        supplied.counterpartyEntity || supplied.counterpartyEntityKey
      ),
      relatedGp: kspRelationshipFilterValue_(supplied.relatedGp || supplied.relatedGpId),
      pitchbookGp: kspRelationshipFilterValue_(supplied.pitchbookGp || supplied.pitchbookGpId),
      assetClass: kspRelationshipFilterValue_(supplied.assetClass || supplied.assetClassId),
      fundStrategy: kspRelationshipFilterValue_(supplied.fundStrategy),
      meetingStatus: kspRelationshipFilterValue_(supplied.meetingStatus),
      pitchbookStatus: kspRelationshipFilterValue_(supplied.pitchbookStatus)
    },
    forwardLimit: kspRelationshipPositiveLimit_(source.forwardLimit,
      KSP_RELATIONSHIP_EXPLORER_LIMITS.FORWARD_MEETINGS,
      KSP_RELATIONSHIP_EXPLORER_LIMITS.FORWARD_MEETINGS),
    reverseLimit: kspRelationshipPositiveLimit_(source.reverseLimit,
      KSP_RELATIONSHIP_EXPLORER_LIMITS.REVERSE_PITCHBOOKS,
      KSP_RELATIONSHIP_EXPLORER_LIMITS.REVERSE_PITCHBOOKS),
    relatedLimit: kspRelationshipPositiveLimit_(source.relatedLimit,
      KSP_RELATIONSHIP_EXPLORER_LIMITS.RELATED_PITCHBOOKS,
      KSP_RELATIONSHIP_EXPLORER_LIMITS.RELATED_PITCHBOOKS),
    referencingLimit: kspRelationshipPositiveLimit_(source.referencingLimit,
      KSP_RELATIONSHIP_EXPLORER_LIMITS.REFERENCING_MEETINGS,
      KSP_RELATIONSHIP_EXPLORER_LIMITS.REFERENCING_MEETINGS)
  };
}

function kspRelationshipCounterpartyTypeLabel_(code) {
  var definition = kspCounterpartyTypeDefinition_(code);
  return definition ? definition.label : String(code || '');
}

function kspRelationshipBuildMaps_(counterpartyRows, optionRows) {
  var maps = kspBuildAllMasterMaps_(counterpartyRows || [], optionRows || []);
  var catalog = kspBuildMaintenanceCatalog_(counterpartyRows || [], optionRows || []);
  var typeLabels = {};
  (catalog.counterpartyTypes || []).forEach(function (item) {
    typeLabels[String(item.code)] = String(item.label || item.code || '');
  });
  return { maps: maps, catalog: catalog, typeLabels: typeLabels };
}

function kspRelationshipValueOrUnset_(value) {
  return kspRelationshipTrim_(value) || KSP_RELATIONSHIP_EXPLORER_UNSET;
}

function kspRelationshipBuildFilterOption_(value, label) {
  return { value: value, label: label || (value === KSP_RELATIONSHIP_EXPLORER_UNSET ? '未設定' : value) };
}

function kspRelationshipSortOptions_(left, right) {
  if (left.value === KSP_RELATIONSHIP_EXPLORER_UNSET) return 1;
  if (right.value === KSP_RELATIONSHIP_EXPLORER_UNSET) return -1;
  return String(left.label || '').localeCompare(String(right.label || ''), 'ja') ||
    String(left.value || '').localeCompare(String(right.value || ''));
}

function kspRelationshipFilterOptions_(meetings, pitchbooks, maps) {
  var sets = {
    counterpartyTypes: {}, counterpartyEntities: {},
    assetClasses: {}, fundStrategies: {}, meetingStatuses: {}, pitchbookStatuses: {}
  };
  function add(set, value) { sets[set][kspRelationshipValueOrUnset_(value)] = true; }
  (meetings || []).forEach(function (meeting) {
    add('counterpartyTypes', meeting.counterpartyType);
    add('counterpartyEntities', meeting.counterpartyEntityKey);
    add('assetClasses', meeting.assetClassId);
    add('fundStrategies', meeting.fundStrategy);
    add('meetingStatuses', meeting.status);
  });
  (pitchbooks || []).forEach(function (pitchbook) {
    add('counterpartyEntities', pitchbook.counterpartyEntityKey);
    add('assetClasses', pitchbook.assetClassId);
    add('fundStrategies', pitchbook.fundStrategy);
    add('pitchbookStatuses', pitchbook.status);
  });
  function options(setName, labeler) {
    return Object.keys(sets[setName]).map(function (value) {
      return kspRelationshipBuildFilterOption_(value, labeler ? labeler(value) : undefined);
    }).sort(kspRelationshipSortOptions_).slice(0, KSP_RELATIONSHIP_EXPLORER_LIMITS.FILTER_OPTIONS);
  }
  var gpLabel = function (value) {
    return value === KSP_RELATIONSHIP_EXPLORER_UNSET ? '未設定' :
      (maps.maps.gp[value] ? maps.maps.gp[value] + ' / ' + value : value);
  };
  var assetLabel = function (value) {
    return value === KSP_RELATIONSHIP_EXPLORER_UNSET ? '未設定' :
      (maps.maps.assetClass[value] ? maps.maps.assetClass[value] + ' / ' + value : value);
  };
  var typeLabel = function (value) {
    return value === KSP_RELATIONSHIP_EXPLORER_UNSET ? '未設定' :
      (maps.typeLabels[value] || kspRelationshipCounterpartyTypeLabel_(value) || value);
  };
  var entityLabel = function (value) {
    return value === KSP_RELATIONSHIP_EXPLORER_UNSET ? '未設定' :
      ((maps.maps.counterparty[value] || '') ? maps.maps.counterparty[value] + ' / ' + value : value);
  };
  return {
    counterpartyTypes: options('counterpartyTypes', typeLabel),
    counterpartyEntities: options('counterpartyEntities', entityLabel),
    assetClasses: options('assetClasses', assetLabel),
    fundStrategies: options('fundStrategies'),
    meetingStatuses: options('meetingStatuses'),
    pitchbookStatuses: options('pitchbookStatuses')
  };
}

function kspRelationshipMapMeeting_(row, maps) {
  var counterpartyId = kspMeetingCounterpartyId_(row);
  var type = String((maps.maps.counterpartyType || {})[counterpartyId] || kspMeetingCounterpartyType_(row));
  var entityKey = counterpartyId ? 'COUNTERPARTY:' + counterpartyId : '';
  return {
    meetingId: String(row.Meeting_ID || ''),
    date: kspCanonicalBusinessDate_(row.Date),
    time: kspCanonicalBusinessTime_(row.Time),
    counterpartyType: type,
    counterpartyTypeLabel: maps.typeLabels[type] || kspRelationshipCounterpartyTypeLabel_(type),
    counterpartyId: counterpartyId,
    counterpartyEntityKey: entityKey,
    counterpartyEntityName: (maps.maps.counterparty || {})[counterpartyId] || '',
    relatedGpIds: [],
    relatedGpNames: [],
    assetClassId: String(row.Asset_Class_ID || '').trim(),
    assetClassName: maps.maps.assetClass[String(row.Asset_Class_ID || '')] || '',
    teamId: String(row.Team_ID || '').trim(),
    teamName: maps.maps.team[String(row.Team_ID || '')] || '',
    fundStrategy: String(row.Fund_Strategy || '').trim(),
    meetingTypeCodes: kspMaintenanceSplitCodes_(row.Meeting_Type_Codes),
    status: String(row.Status || '').trim(),
    documentUrl: kspWorkspaceSafeDriveLink_(row.Doc_URL, row.Doc_File_ID),
    filename: String(row.Saved_Filename || ''),
    relatedPitchbookIds: kspMaintenanceSplitCodes_(row.Related_Pitchbook_IDs)
  };
}

function kspRelationshipMapPitchbook_(row, maps) {
  var documentId = String(row.Document_ID || '').trim();
  var counterpartyId = kspMeetingCounterpartyId_(row);
  var counterpartyType = String((maps.maps.counterpartyType || {})[counterpartyId] || kspMeetingCounterpartyType_(row));
  return {
    documentId: documentId,
    date: kspCanonicalBusinessDate_(row.Date),
    gpId: '',
    gpName: '',
    counterpartyId: counterpartyId,
    counterpartyType: counterpartyType,
    counterpartyEntityKey: counterpartyId ? 'COUNTERPARTY:' + counterpartyId : '',
    counterpartyName: (maps.maps.counterparty || {})[counterpartyId] || '',
    assetClassId: String(row.Asset_Class_ID || '').trim(),
    assetClassName: maps.maps.assetClass[String(row.Asset_Class_ID || '')] || '',
    fundStrategy: String(row.Fund_Strategy || '').trim(),
    status: String(row.Status || '').trim(),
    savedFilename: String(row.Saved_Filename || '').trim(),
    originalFilename: String(row.Original_Filename || '').trim(),
    fileUrl: kspWorkspaceSafeDriveLink_(row.File_URL, row.File_ID)
  };
}

function kspRelationshipBuildEdges_(meetings, pitchbooks) {
  var pitchbooksById = {};
  (pitchbooks || []).forEach(function (pitchbook) {
    if (!pitchbooksById[pitchbook.documentId]) pitchbooksById[pitchbook.documentId] = [];
    pitchbooksById[pitchbook.documentId].push(pitchbook);
  });
  var edges = [];
  (meetings || []).forEach(function (meeting) {
    var seen = {};
    meeting.relatedPitchbookIds.forEach(function (documentId) {
      var candidates = pitchbooksById[documentId] || [];
      var unresolvedReason = '';
      var target = null;
      if (seen[documentId]) unresolvedReason = 'DUPLICATE_RELATIONSHIP_ID';
      else if (candidates.length === 0) unresolvedReason = 'PITCHBOOK_NOT_FOUND';
      else if (candidates.length !== 1) unresolvedReason = 'DUPLICATE_DOCUMENT_ID';
      else target = candidates[0];
      seen[documentId] = true;
      edges.push({
        meeting: meeting,
        pitchbook: target,
        documentId: documentId,
        resolutionState: target ? 'resolved' : 'unresolved',
        unresolved: !target,
        unresolvedReason: unresolvedReason
      });
    });
  });
  return edges;
}

function kspRelationshipValueMatches_(actual, requested) {
  if (!requested) return true;
  if (requested === KSP_RELATIONSHIP_EXPLORER_UNSET) return !kspRelationshipTrim_(actual);
  return kspRelationshipTrim_(actual) === requested;
}

function kspRelationshipEitherValueMatches_(meetingValue, pitchbookValue, requested) {
  return !requested || kspRelationshipValueMatches_(meetingValue, requested) ||
    kspRelationshipValueMatches_(pitchbookValue, requested);
}

function kspRelationshipEdgeMatches_(edge, input) {
  var meeting = edge.meeting;
  var pitchbook = edge.pitchbook;
  var filters = input.filters || {};
  if (input.dateFrom && (!meeting.date || meeting.date < input.dateFrom)) return false;
  if (input.dateTo && (!meeting.date || meeting.date > input.dateTo)) return false;
  if (!kspRelationshipValueMatches_(meeting.counterpartyType, filters.counterpartyType)) return false;
  if (!kspRelationshipValueMatches_(meeting.counterpartyEntityKey, filters.counterpartyEntity)) return false;
  if (filters.relatedGp) {
    if (filters.relatedGp === KSP_RELATIONSHIP_EXPLORER_UNSET) {
      if ((meeting.relatedGpIds || []).length) return false;
    } else if ((meeting.relatedGpIds || []).indexOf(filters.relatedGp) === -1) return false;
  }
  if (!kspRelationshipValueMatches_(meeting.status, filters.meetingStatus)) return false;
  if (filters.pitchbookGp && (!pitchbook || !kspRelationshipValueMatches_(pitchbook.gpId, filters.pitchbookGp))) return false;
  if (filters.pitchbookStatus && (!pitchbook || !kspRelationshipValueMatches_(pitchbook.status, filters.pitchbookStatus))) return false;
  if (!kspRelationshipEitherValueMatches_(meeting.assetClassId, pitchbook && pitchbook.assetClassId, filters.assetClass)) return false;
  if (!kspRelationshipEitherValueMatches_(meeting.fundStrategy, pitchbook && pitchbook.fundStrategy, filters.fundStrategy)) return false;
  return true;
}

function kspRelationshipCompareMeeting_(left, right) {
  return String(right.date || '').localeCompare(String(left.date || '')) ||
    String(left.meetingId || '').localeCompare(String(right.meetingId || ''));
}

function kspRelationshipComparePitchbook_(left, right) {
  return String(right.date || '').localeCompare(String(left.date || '')) ||
    String(left.documentId || '').localeCompare(String(right.documentId || ''));
}

function kspRelationshipResolvedItem_(edge) {
  if (!edge.pitchbook) {
    return {
      documentId: edge.documentId,
      resolutionState: 'unresolved',
      unresolved: true,
      unresolvedReason: edge.unresolvedReason
    };
  }
  return Object.assign({}, edge.pitchbook, {
    resolutionState: 'resolved',
    unresolved: false
  });
}

function kspRelationshipBuildForward_(matchingEdges, allEdges, input) {
  var byMeeting = {};
  var allByMeeting = {};
  (matchingEdges || []).forEach(function (edge) {
    var id = edge.meeting.meetingId;
    if (!byMeeting[id]) byMeeting[id] = { meeting: edge.meeting, edges: [] };
    byMeeting[id].edges.push(edge);
  });
  (allEdges || []).forEach(function (edge) {
    var id = edge.meeting.meetingId;
    if (!allByMeeting[id]) allByMeeting[id] = [];
    allByMeeting[id].push(edge);
  });
  var all = Object.keys(byMeeting).map(function (meetingId) {
    var entry = byMeeting[meetingId];
    var relationships = entry.edges.slice().sort(function (left, right) {
      return String(left.documentId).localeCompare(String(right.documentId));
    }).map(kspRelationshipResolvedItem_);
    var fullCount = (allByMeeting[meetingId] || []).length;
    return Object.assign({}, entry.meeting, {
      relatedPitchbooks: relationships.slice(0, input.relatedLimit),
      relatedPitchbookCount: relationships.length,
      fullRelatedPitchbookCount: fullCount,
      omittedCount: Math.max(0, relationships.length - input.relatedLimit),
      omittedRelatedPitchbookCount: Math.max(0, fullCount - input.relatedLimit)
    });
  }).sort(kspRelationshipCompareMeeting_);
  return {
    totalCount: all.length,
    records: all.slice(0, input.forwardLimit),
    omittedCount: Math.max(0, all.length - input.forwardLimit)
  };
}

function kspRelationshipBuildReverse_(matchingEdges, allEdges, input) {
  var byPitchbook = {};
  var allByPitchbook = {};
  (matchingEdges || []).forEach(function (edge) {
    if (!edge.pitchbook) return;
    var id = edge.pitchbook.documentId;
    if (!byPitchbook[id]) byPitchbook[id] = { pitchbook: edge.pitchbook, edges: [] };
    byPitchbook[id].edges.push(edge);
  });
  (allEdges || []).forEach(function (edge) {
    if (!edge.pitchbook) return;
    var id = edge.pitchbook.documentId;
    if (!allByPitchbook[id]) allByPitchbook[id] = [];
    allByPitchbook[id].push(edge);
  });
  var all = Object.keys(byPitchbook).map(function (documentId) {
    var entry = byPitchbook[documentId];
    var meetings = entry.edges.map(function (edge) { return edge.meeting; })
      .sort(kspRelationshipCompareMeeting_);
    var fullCount = (allByPitchbook[documentId] || []).length;
    return Object.assign({}, entry.pitchbook, {
      referencingMeetings: meetings.slice(0, input.referencingLimit),
      referencingMeetingCount: meetings.length,
      fullReferencingMeetingCount: fullCount,
      omittedCount: Math.max(0, meetings.length - input.referencingLimit),
      omittedReferencingMeetingCount: Math.max(0, fullCount - input.referencingLimit)
    });
  }).sort(kspRelationshipComparePitchbook_);
  return {
    totalCount: all.length,
    records: all.slice(0, input.reverseLimit),
    omittedCount: Math.max(0, all.length - input.reverseLimit)
  };
}

function kspBuildRelationshipExplorerData_(meetingRows, pitchbookRows, counterpartyRows, optionRows, input) {
  var maps = kspRelationshipBuildMaps_(counterpartyRows, optionRows);
  var meetings = (meetingRows || []).map(function (row) { return kspRelationshipMapMeeting_(row, maps); })
    .filter(function (meeting) { return meeting.meetingId; });
  var pitchbooks = (pitchbookRows || []).map(function (row) { return kspRelationshipMapPitchbook_(row, maps); })
    .filter(function (pitchbook) { return pitchbook.documentId; });
  var allEdges = kspRelationshipBuildEdges_(meetings, pitchbooks);
  var matchingEdges = allEdges.filter(function (edge) { return kspRelationshipEdgeMatches_(edge, input); });
  var forward = kspRelationshipBuildForward_(matchingEdges, allEdges, input);
  var reverse = kspRelationshipBuildReverse_(matchingEdges, allEdges, input);
  var meetingIds = {};
  var pitchbookIds = {};
  matchingEdges.forEach(function (edge) {
    meetingIds[edge.meeting.meetingId] = edge.meeting;
    if (edge.pitchbook) pitchbookIds[edge.pitchbook.documentId] = edge.pitchbook;
  });
  var matchingMeetings = Object.keys(meetingIds).map(function (id) { return meetingIds[id]; });
  var matchingPitchbooks = Object.keys(pitchbookIds).map(function (id) { return pitchbookIds[id]; });
  var unresolvedCount = matchingEdges.filter(function (edge) { return edge.unresolved; }).length;
  var inactiveMeetingCount = matchingMeetings.filter(function (meeting) {
    return meeting.status === KSP_STATUS.INACTIVE;
  }).length;
  var inactivePitchbookCount = matchingPitchbooks.filter(function (pitchbook) {
    return pitchbook.status === KSP_STATUS.INACTIVE;
  }).length;
  var counts = {
    relationships: matchingEdges.length,
    meetings: matchingMeetings.length,
    pitchbooks: matchingPitchbooks.length,
    unresolved: unresolvedCount,
    inactiveMeetings: inactiveMeetingCount,
    inactivePitchbooks: inactivePitchbookCount
  };
  return {
    ok: true,
    workId: KSP_RELATIONSHIP_EXPLORER_WORK_ID,
    filters: kspDeepClone_(input.filters),
    dateFrom: input.dateFrom,
    dateTo: input.dateTo,
    summary: counts,
    counts: counts,
    forward: forward,
    reverse: reverse,
    filterOptions: kspRelationshipFilterOptions_(meetings, pitchbooks, maps),
    readModel: {
      source: ['Meeting_Index', 'Pitchbook_Index', 'Counterparty_Master', 'Option_Master'],
      relationshipField: 'Meeting_Index.Related_Pitchbook_IDs',
      documentBodyRead: false,
      pitchbookBytesRead: false,
      auditRead: false,
      readOnly: true
    },
    sideEffects: { writes: 0, auditWrites: 0, aiCalls: 0 }
  };
}

function kspGetRelationshipExplorerData_(environment, rawInput) {
  try {
    var input = kspRelationshipNormalizeInput_(rawInput);
    var state = environment.getInstallationState();
    kspAssert_(state && state.resources, 'INSTALLATION_STATE_MISSING', 'Installation stateがありません。');
    var backendSpreadsheetId = state.resources[KSP_RESOURCE_KEYS.BACKEND_SPREADSHEET];
    kspAssert_(backendSpreadsheetId, 'BACKEND_SPREADSHEET_MISSING', 'Backend Spreadsheetがありません。');
    return kspBuildRelationshipExplorerData_(
      environment.readRows(backendSpreadsheetId, KSP_SHEET_NAMES.MEETING_INDEX),
      environment.readRows(backendSpreadsheetId, KSP_SHEET_NAMES.PITCHBOOK_INDEX),
      environment.readRows(backendSpreadsheetId, KSP_SHEET_NAMES.COUNTERPARTY_MASTER),
      environment.readRows(backendSpreadsheetId, KSP_SHEET_NAMES.OPTION_MASTER),
      input
    );
  } catch (error) {
    var code = kspGetErrorCode_(error);
    return {
      ok: false,
      workId: KSP_RELATIONSHIP_EXPLORER_WORK_ID,
      error: { code: code, message: kspSafePublicErrorMessage_(code, 'RELATIONSHIP_EXPLORER') }
    };
  }
}
// ===== END src/128_RelationshipExplorerService.gs =====

// ===== BEGIN src/129_EntityWorkspaceService.gs =====
var KSP_ENTITY_WORKSPACE_WORK_ID = '0019';

var KSP_ENTITY_WORKSPACE_LIMITS = Object.freeze({
  ENTITIES: 250,
  DIRECT_MEETINGS: 20,
  RELATED_MEETINGS: 20,
  PITCHBOOKS: 20,
  FUND_STRATEGIES: 20,
  FOLLOW_UPS: 20,
  RELATIONSHIPS: 20,
  TIMELINE: 40,
  RELATED_PITCHBOOKS: 25,
  REFERENCING_MEETINGS: 20
});

function kspCreateEntityWorkspaceEnvironment_() {
  var source = kspCreateMeetingEnvironment_();
  return {
    getInstallationState: source.getInstallationState,
    readRows: source.readRows
  };
}

function kspEntityWorkspaceTrim_(value) {
  return value === null || value === undefined ? '' : String(value).trim();
}

function kspEntityWorkspaceNormalizeInput_(rawInput) {
  var source = typeof rawInput === 'string' ? { entityKey: rawInput } :
    (rawInput && typeof rawInput === 'object' ? rawInput : {});
  var entityKey = kspEntityWorkspaceTrim_(source.entityKey || source.counterpartyEntityKey);
  var counterpartyType = kspEntityWorkspaceTrim_(source.counterpartyType || source.type);
  var counterpartyId = kspEntityWorkspaceTrim_(source.counterpartyId || source.id);
  if (entityKey) {
    var separator = entityKey.indexOf(':');
    kspAssert_(separator > 0 && separator < entityKey.length - 1,
      'ENTITY_WORKSPACE_ENTITY_INVALID', 'Entityの指定が不正です。');
    var keyType = kspEntityWorkspaceTrim_(entityKey.slice(0, separator));
    counterpartyId = kspEntityWorkspaceTrim_(entityKey.slice(separator + 1));
    if (keyType !== 'COUNTERPARTY') counterpartyType = keyType;
  }
  if (counterpartyId) {
    kspAssert_(kspIsCounterpartyId_(counterpartyId),
      'ENTITY_WORKSPACE_ENTITY_INVALID', 'Entityの指定が不正です。');
    entityKey = 'COUNTERPARTY:' + counterpartyId;
  }
  return {
    entityKey: entityKey,
    counterpartyType: counterpartyType,
    counterpartyId: counterpartyId,
    fundStrategy: kspEntityWorkspaceTrim_(source.fundStrategy || source.strategy)
  };
}

function kspEntityWorkspaceReadModel_() {
  return {
    source: ['Meeting_Index', 'Pitchbook_Index', 'Counterparty_Master', 'Option_Master'],
    relationshipField: 'Meeting_Index.Related_Pitchbook_IDs',
    documentBodyRead: false,
    pitchbookBytesRead: false,
    auditRead: false,
    readOnly: true
  };
}

function kspEntityWorkspaceSideEffects_() {
  return { writes: 0, auditWrites: 0, aiCalls: 0 };
}

function kspEntityWorkspaceTypeLabel_(type) {
  var definition = kspCounterpartyTypeDefinition_(type);
  return definition ? definition.label : String(type || '');
}

function kspEntityWorkspaceTypeOrder_(type) {
  var definitions = KSP_COUNTERPARTY_TYPE_DEFINITIONS || [];
  var index = definitions.map(function (item) { return item.code; }).indexOf(type);
  return index === -1 ? definitions.length : index;
}

function kspEntityWorkspaceBuildCatalog_(counterpartyRows, optionRows, meetingRows, maps) {
  var catalog = kspBuildMaintenanceCatalog_(counterpartyRows || [], optionRows || []);
  var byKey = {};
  function add(item) {
    var type = kspEntityWorkspaceTrim_(item.type);
    var id = kspEntityWorkspaceTrim_(item.id);
    if (!type || !id || !kspCounterpartyTypeDefinition_(type)) return;
    var key = 'COUNTERPARTY:' + id;
    if (!byKey[key]) {
      byKey[key] = {
        key: key, entityKey: key, type: type, counterpartyType: type,
        id: id, counterpartyId: id,
        name: kspEntityWorkspaceTrim_(item.name) || id,
        status: kspEntityWorkspaceTrim_(item.status),
        typeLabel: kspEntityWorkspaceTypeLabel_(type)
      };
    } else {
      if (!byKey[key].name || byKey[key].name === id) byKey[key].name = kspEntityWorkspaceTrim_(item.name) || id;
      if (!byKey[key].status) byKey[key].status = kspEntityWorkspaceTrim_(item.status);
    }
  }
  (catalog.counterpartyEntities || []).forEach(add);
  (meetingRows || []).forEach(function (row) {
    var id = kspMeetingCounterpartyId_(row);
    var type = String((maps.maps.counterpartyType || {})[id] || kspMeetingCounterpartyType_(row));
    var key = id ? 'COUNTERPARTY:' + id : '';
    add({
      type: type, id: id,
      name: (maps.maps.counterparty || {})[id] || kspEntityWorkspaceTrim_(row.Counterparty) || id,
      status: ''
    });
  });
  var entities = Object.keys(byKey).map(function (key) { return byKey[key]; })
    .sort(function (left, right) {
      return kspEntityWorkspaceTypeOrder_(left.type) - kspEntityWorkspaceTypeOrder_(right.type) ||
        left.name.toLocaleLowerCase('ja').localeCompare(right.name.toLocaleLowerCase('ja'), 'ja') ||
        left.id.localeCompare(right.id);
    });
  var typeCounts = {};
  entities.forEach(function (item) { typeCounts[item.type] = (typeCounts[item.type] || 0) + 1; });
  var types = KSP_COUNTERPARTY_TYPE_DEFINITIONS.map(function (definition) {
    return {
      code: definition.code,
      label: definition.label,
      entityCount: typeCounts[definition.code] || 0
    };
  });
  return {
    entities: entities.slice(0, KSP_ENTITY_WORKSPACE_LIMITS.ENTITIES),
    omittedEntities: Math.max(0, entities.length - KSP_ENTITY_WORKSPACE_LIMITS.ENTITIES),
    types: types
  };
}

function kspEntityWorkspaceMapMeeting_(row, maps) {
  var relationship = kspRelationshipMapMeeting_(row, maps);
  var mapped = kspMapMeetingSearchResult_(row, maps.maps);
  return Object.assign({}, relationship, {
    gpId: mapped.gpId,
    gpName: mapped.gpName,
    locationId: mapped.locationId,
    locationName: mapped.locationName,
    capitalTypeId: mapped.capitalTypeId,
    capitalTypeName: mapped.capitalTypeName,
    meetingTypeLabels: mapped.meetingTypeLabels,
    followUpRequired: mapped.followUpRequired,
    documentId: mapped.documentId,
    documentUrl: kspWorkspaceSafeDriveLink_(mapped.documentUrl, row.Doc_File_ID),
    filename: mapped.filename,
    version: mapped.version,
    updatedAt: mapped.updatedAt
  });
}

function kspEntityWorkspaceMapPitchbook_(row, maps) {
  var relationship = kspRelationshipMapPitchbook_(row, maps);
  var mapped = kspMapPitchbookSearchResult_(row, maps.maps);
  return Object.assign({}, relationship, {
    batchId: mapped.batchId,
    capitalTypeId: mapped.capitalTypeId,
    capitalTypeName: mapped.capitalTypeName,
    sequenceNo: mapped.sequenceNo,
    fileUrl: kspWorkspaceSafeDriveLink_(mapped.fileUrl, row.File_ID),
    updatedAt: mapped.updatedAt
  });
}

function kspEntityWorkspaceSortMeeting_(left, right) {
  return String(right.date || '').localeCompare(String(left.date || '')) ||
    String(left.meetingId || '').localeCompare(String(right.meetingId || ''));
}

function kspEntityWorkspaceSortPitchbook_(left, right) {
  return String(right.date || '').localeCompare(String(left.date || '')) ||
    String(left.documentId || '').localeCompare(String(right.documentId || ''));
}

function kspEntityWorkspaceScopeMeeting_(meeting, scope) {
  return Object.assign({}, meeting, {
    activityScope: scope,
    activityScopeLabel: scope === 'related' ? 'Related' : 'Direct'
  });
}

function kspEntityWorkspaceCap_(records, limit, comparator) {
  var sorted = (records || []).slice().sort(comparator);
  return {
    totalCount: sorted.length,
    records: sorted.slice(0, limit),
    omittedCount: Math.max(0, sorted.length - limit)
  };
}

function kspEntityWorkspaceBuildRelationshipRecords_(edges, allEdges) {
  var input = {
    forwardLimit: KSP_ENTITY_WORKSPACE_LIMITS.RELATIONSHIPS,
    relatedLimit: KSP_ENTITY_WORKSPACE_LIMITS.RELATED_PITCHBOOKS,
    referencingLimit: KSP_ENTITY_WORKSPACE_LIMITS.REFERENCING_MEETINGS,
    reverseLimit: KSP_ENTITY_WORKSPACE_LIMITS.RELATIONSHIPS
  };
  return kspRelationshipBuildForward_(edges || [], allEdges || edges || [], input);
}

function kspEntityWorkspaceBuildMix_(meetings) {
  var sets = { teams: {}, assetClasses: {}, meetingTypes: {} };
  function add(set, key, label) {
    var normalized = kspEntityWorkspaceTrim_(key) || '__UNSET__';
    if (!sets[set][normalized]) sets[set][normalized] = { key: normalized, label: label || (normalized === '__UNSET__' ? '未設定' : normalized), count: 0 };
    sets[set][normalized].count += 1;
  }
  (meetings || []).forEach(function (meeting) {
    add('teams', meeting.teamId, meeting.teamName || meeting.teamId);
    add('assetClasses', meeting.assetClassId, meeting.assetClassName || meeting.assetClassId);
    if ((meeting.meetingTypeCodes || []).length) {
      meeting.meetingTypeCodes.forEach(function (code, index) {
        var labels = meeting.meetingTypeLabels || [];
        add('meetingTypes', code, labels[index] || code);
      });
    } else {
      add('meetingTypes', '', '未設定');
    }
  });
  function finish(set) {
    return Object.keys(set).map(function (key) { return set[key]; }).sort(function (left, right) {
      return right.count - left.count || left.label.localeCompare(right.label, 'ja') || left.key.localeCompare(right.key);
    });
  }
  return { teams: finish(sets.teams), assetClasses: finish(sets.assetClasses), meetingTypes: finish(sets.meetingTypes) };
}

function kspEntityWorkspaceBuildFundStrategies_(meetings, pitchbooks, edges) {
  var aggregates = {};
  function ensure(text) {
    if (!aggregates[text]) aggregates[text] = {
      text: text, meetingIds: {}, pitchbookIds: {}, directMeetingCount: 0,
      relatedMeetingCount: 0, openFollowUpCount: 0, latestDate: ''
    };
    return aggregates[text];
  }
  (meetings || []).forEach(function (meeting) {
    var text = kspEntityWorkspaceTrim_(meeting.fundStrategy);
    if (!text) return;
    var aggregate = ensure(text);
    aggregate.meetingIds[meeting.meetingId] = meeting;
    if (meeting.activityScope === 'related') aggregate.relatedMeetingCount += 1;
    else aggregate.directMeetingCount += 1;
    if (meeting.status === KSP_STATUS.ACTIVE && meeting.followUpRequired) aggregate.openFollowUpCount += 1;
    if (meeting.date > aggregate.latestDate) aggregate.latestDate = meeting.date;
  });
  (pitchbooks || []).forEach(function (pitchbook) {
    var text = kspEntityWorkspaceTrim_(pitchbook.fundStrategy);
    if (!text) return;
    var aggregate = ensure(text);
    aggregate.pitchbookIds[pitchbook.documentId] = pitchbook;
    if (pitchbook.date > aggregate.latestDate) aggregate.latestDate = pitchbook.date;
  });
  return Object.keys(aggregates).map(function (text) {
    var aggregate = aggregates[text];
    var relatedEdges = (edges || []).filter(function (edge) {
      return edge.meeting.fundStrategy === text || (edge.pitchbook && edge.pitchbook.fundStrategy === text);
    });
    var meetingItems = Object.keys(aggregate.meetingIds).map(function (id) { return aggregate.meetingIds[id]; });
    var pitchbookItems = Object.keys(aggregate.pitchbookIds).map(function (id) { return aggregate.pitchbookIds[id]; });
    return {
      text: text,
      meetingCount: meetingItems.length,
      pitchbookCount: pitchbookItems.length,
      directMeetingCount: aggregate.directMeetingCount,
      relatedMeetingCount: aggregate.relatedMeetingCount,
      latestDate: aggregate.latestDate,
      openFollowUpCount: aggregate.openFollowUpCount,
      relationshipCount: relatedEdges.length,
      meetings: kspEntityWorkspaceCap_(meetingItems, KSP_ENTITY_WORKSPACE_LIMITS.DIRECT_MEETINGS, kspEntityWorkspaceSortMeeting_),
      pitchbooks: kspEntityWorkspaceCap_(pitchbookItems, KSP_ENTITY_WORKSPACE_LIMITS.PITCHBOOKS, kspEntityWorkspaceSortPitchbook_),
      omittedCounts: {
        meetings: Math.max(0, meetingItems.length - KSP_ENTITY_WORKSPACE_LIMITS.DIRECT_MEETINGS),
        pitchbooks: Math.max(0, pitchbookItems.length - KSP_ENTITY_WORKSPACE_LIMITS.PITCHBOOKS),
        relationships: Math.max(0, relatedEdges.length - KSP_ENTITY_WORKSPACE_LIMITS.RELATIONSHIPS)
      }
    };
  }).sort(function (left, right) {
    return right.latestDate.localeCompare(left.latestDate) ||
      left.text.toLocaleLowerCase('ja').localeCompare(right.text.toLocaleLowerCase('ja'), 'ja') ||
      left.text.localeCompare(right.text);
  });
}

function kspEntityWorkspaceBuildTimeline_(meetings, pitchbooks, edges) {
  var timeline = [];
  (meetings || []).forEach(function (meeting) {
    timeline.push({
      kind: 'Meeting', id: meeting.meetingId, date: meeting.date, time: meeting.time,
      status: meeting.status, activityScope: meeting.activityScope,
      fundStrategy: meeting.fundStrategy, sourceUrl: meeting.documentUrl
    });
  });
  (pitchbooks || []).forEach(function (pitchbook) {
    timeline.push({
      kind: 'Pitchbook', id: pitchbook.documentId, date: pitchbook.date,
      status: pitchbook.status, fundStrategy: pitchbook.fundStrategy, sourceUrl: pitchbook.fileUrl
    });
  });
  (edges || []).forEach(function (edge) {
    timeline.push({
      kind: 'Relationship', id: edge.meeting.meetingId + '>' + edge.documentId,
      date: edge.meeting.date, status: edge.pitchbook ? edge.pitchbook.status : 'unresolved',
      meetingId: edge.meeting.meetingId, documentId: edge.documentId,
      sourceUrl: edge.pitchbook ? edge.pitchbook.fileUrl : ''
    });
  });
  timeline.sort(function (left, right) {
    return String(right.date || '').localeCompare(String(left.date || '')) ||
      left.kind.localeCompare(right.kind) || left.id.localeCompare(right.id);
  });
  return {
    totalCount: timeline.length,
    records: timeline.slice(0, KSP_ENTITY_WORKSPACE_LIMITS.TIMELINE),
    omittedCount: Math.max(0, timeline.length - KSP_ENTITY_WORKSPACE_LIMITS.TIMELINE)
  };
}

function kspEntityWorkspaceBuildDrill_(fundStrategy, meetings, pitchbooks, edges) {
  if (!fundStrategy) return null;
  var matchingMeetings = (meetings || []).filter(function (meeting) { return meeting.fundStrategy === fundStrategy; });
  var matchingPitchbooks = (pitchbooks || []).filter(function (pitchbook) { return pitchbook.fundStrategy === fundStrategy; });
  var matchingEdges = (edges || []).filter(function (edge) {
    return edge.meeting.fundStrategy === fundStrategy || (edge.pitchbook && edge.pitchbook.fundStrategy === fundStrategy);
  });
  var forward = kspEntityWorkspaceBuildRelationshipRecords_(matchingEdges, edges);
  return {
    selected: fundStrategy,
    meetings: kspEntityWorkspaceCap_(matchingMeetings, KSP_ENTITY_WORKSPACE_LIMITS.DIRECT_MEETINGS, kspEntityWorkspaceSortMeeting_),
    pitchbooks: kspEntityWorkspaceCap_(matchingPitchbooks, KSP_ENTITY_WORKSPACE_LIMITS.PITCHBOOKS, kspEntityWorkspaceSortPitchbook_),
    relationships: forward,
    counts: {
      meetings: matchingMeetings.length,
      pitchbooks: matchingPitchbooks.length,
      relationships: matchingEdges.length
    },
    omittedCounts: {
      meetings: Math.max(0, matchingMeetings.length - KSP_ENTITY_WORKSPACE_LIMITS.DIRECT_MEETINGS),
      pitchbooks: Math.max(0, matchingPitchbooks.length - KSP_ENTITY_WORKSPACE_LIMITS.PITCHBOOKS),
      relationships: forward.omittedCount
    }
  };
}

function kspEntityWorkspaceRelatedGps_(meetings, gpRows) {
  var byId = {};
  (gpRows || []).forEach(function (row) {
    var id = kspEntityWorkspaceTrim_(row.GP_ID);
    if (id) byId[id] = { id: id, name: String(row.GP_Name || id), status: String(row.Status || '') };
  });
  var seen = {};
  (meetings || []).forEach(function (meeting) {
    (meeting.relatedGpIds || []).forEach(function (id) {
      if (!seen[id]) seen[id] = byId[id] || { id: id, name: id, status: '' };
    });
  });
  return Object.keys(seen).sort().map(function (id) { return seen[id]; });
}

function kspBuildEntityWorkspaceData_(rawInput, counterpartyRows, optionRows, meetingRows, pitchbookRows, workspaceOptions) {
  var input = kspEntityWorkspaceNormalizeInput_(rawInput);
  var meetingScope = workspaceOptions && workspaceOptions.meetingScope === 'direct' ? 'direct' : 'all';
  var maps = kspRelationshipBuildMaps_(counterpartyRows || [], optionRows || []);
  var catalog = kspEntityWorkspaceBuildCatalog_(counterpartyRows || [], optionRows || [], meetingRows || [], maps);
  var baseResponse = {
    ok: true,
    workId: KSP_ENTITY_WORKSPACE_WORK_ID,
    entityTypes: catalog.types,
    entityOptions: catalog.entities,
    omittedEntityCount: catalog.omittedEntities,
    readModel: kspEntityWorkspaceReadModel_(),
    sideEffects: kspEntityWorkspaceSideEffects_()
  };
  if (!input.entityKey) return baseResponse;
  var entity = catalog.entities.filter(function (item) { return item.entityKey === input.entityKey; })[0];
  kspAssert_(entity, 'ENTITY_WORKSPACE_ENTITY_NOT_FOUND', '指定されたEntityを確認できません。');

  var allMeetings = (meetingRows || []).map(function (row) { return kspEntityWorkspaceMapMeeting_(row, maps); })
    .filter(function (meeting) { return meeting.meetingId; });
  var allPitchbooks = (pitchbookRows || []).map(function (row) { return kspEntityWorkspaceMapPitchbook_(row, maps); })
    .filter(function (pitchbook) { return pitchbook.documentId; });
  var directMeetings = allMeetings.filter(function (meeting) { return meeting.counterpartyEntityKey === input.entityKey; })
    .map(function (meeting) { return kspEntityWorkspaceScopeMeeting_(meeting, 'direct'); });
  var relatedMeetings = [];
  var visibleMeetings = (meetingScope === 'direct' ? directMeetings.slice() : directMeetings.concat(relatedMeetings))
    .sort(kspEntityWorkspaceSortMeeting_);
  var directMeetingIds = {};
  directMeetings.forEach(function (meeting) { directMeetingIds[meeting.meetingId] = true; });

  var pitchbookById = {};
  allPitchbooks.forEach(function (pitchbook) {
    if (!pitchbookById[pitchbook.documentId]) pitchbookById[pitchbook.documentId] = [];
    pitchbookById[pitchbook.documentId].push(pitchbook);
  });
  var selectedPitchbooks = allPitchbooks.filter(function (pitchbook) {
    return pitchbook.counterpartyEntityKey === input.entityKey;
  });
  var selectedPitchbookIds = {};
  selectedPitchbooks = selectedPitchbooks.filter(function (pitchbook) {
    if (selectedPitchbookIds[pitchbook.documentId]) return false;
    selectedPitchbookIds[pitchbook.documentId] = true;
    return true;
  }).sort(kspEntityWorkspaceSortPitchbook_);

  var allEdges = kspRelationshipBuildEdges_(visibleMeetings, allPitchbooks);
  var relationshipForward = kspEntityWorkspaceBuildRelationshipRecords_(allEdges, allEdges);
  var relationshipReverse = kspRelationshipBuildReverse_(allEdges, allEdges, {
    reverseLimit: KSP_ENTITY_WORKSPACE_LIMITS.RELATIONSHIPS,
    referencingLimit: KSP_ENTITY_WORKSPACE_LIMITS.REFERENCING_MEETINGS
  });
  var activeFollowUps = visibleMeetings.filter(function (meeting) {
    return meeting.status === KSP_STATUS.ACTIVE && meeting.followUpRequired;
  });
  var unresolvedRelationshipCount = allEdges.filter(function (edge) { return edge.unresolved; }).length;
  var fundStrategies = kspEntityWorkspaceBuildFundStrategies_(visibleMeetings, selectedPitchbooks, allEdges);
  var drill = fundStrategies.some(function (item) { return item.text === input.fundStrategy; })
    ? kspEntityWorkspaceBuildDrill_(input.fundStrategy, visibleMeetings, selectedPitchbooks, allEdges)
    : null;
  var timeline = kspEntityWorkspaceBuildTimeline_(visibleMeetings, selectedPitchbooks, allEdges);
  var followUpRowsById = {};
  (meetingRows || []).forEach(function (row) { followUpRowsById[String(row.Meeting_ID || '')] = row; });
  var directList = kspEntityWorkspaceCap_(directMeetings, KSP_ENTITY_WORKSPACE_LIMITS.DIRECT_MEETINGS, kspEntityWorkspaceSortMeeting_);
  var relatedList = kspEntityWorkspaceCap_(relatedMeetings, KSP_ENTITY_WORKSPACE_LIMITS.RELATED_MEETINGS, kspEntityWorkspaceSortMeeting_);
  var pitchbookList = kspEntityWorkspaceCap_(selectedPitchbooks, KSP_ENTITY_WORKSPACE_LIMITS.PITCHBOOKS, kspEntityWorkspaceSortPitchbook_);
  var latestDirect = directMeetings.slice().sort(kspEntityWorkspaceSortMeeting_)[0];
  var latestActivity = visibleMeetings.slice().sort(kspEntityWorkspaceSortMeeting_)[0];
  var response = Object.assign({}, baseResponse, {
    entity: {
      entityKey: entity.entityKey,
      counterpartyType: entity.type,
      counterpartyTypeLabel: entity.typeLabel,
      counterpartyId: entity.id,
      name: entity.name,
      status: entity.status,
      mode: 'COUNTERPARTY'
    },
    mode: 'COUNTERPARTY',
    summary: {
      directMeetingCount: directMeetings.length,
      directActiveMeetingCount: directMeetings.filter(function (meeting) { return meeting.status === KSP_STATUS.ACTIVE; }).length,
      relatedMeetingCount: relatedMeetings.length,
      relatedActiveMeetingCount: relatedMeetings.filter(function (meeting) { return meeting.status === KSP_STATUS.ACTIVE; }).length,
      meetingCount: visibleMeetings.length,
      activeMeetingCount: visibleMeetings.filter(function (meeting) { return meeting.status === KSP_STATUS.ACTIVE; }).length,
      pitchbookCount: selectedPitchbooks.length,
      pitchbookActiveCount: selectedPitchbooks.filter(function (pitchbook) { return pitchbook.status === KSP_STATUS.ACTIVE; }).length,
      openFollowUpCount: activeFollowUps.length,
      relationshipCount: allEdges.length,
      unresolvedRelationshipCount: unresolvedRelationshipCount,
      latestDirectMeetingDate: latestDirect ? latestDirect.date : '',
      latestActivityDate: latestActivity ? latestActivity.date : ''
    },
    meetings: { direct: directList, related: relatedList, all: kspEntityWorkspaceCap_(visibleMeetings, KSP_ENTITY_WORKSPACE_LIMITS.DIRECT_MEETINGS, kspEntityWorkspaceSortMeeting_) },
    pitchbooks: pitchbookList,
    ownedPitchbooks: pitchbookList,
    linkedPitchbooks: pitchbookList,
    relatedGps: [],
    fundStrategies: {
      totalCount: fundStrategies.length,
      records: fundStrategies.slice(0, KSP_ENTITY_WORKSPACE_LIMITS.FUND_STRATEGIES),
      omittedCount: Math.max(0, fundStrategies.length - KSP_ENTITY_WORKSPACE_LIMITS.FUND_STRATEGIES)
    },
    followUps: {
      totalCount: activeFollowUps.length,
      records: activeFollowUps.slice().sort(kspEntityWorkspaceSortMeeting_).slice(0, KSP_ENTITY_WORKSPACE_LIMITS.FOLLOW_UPS).map(function (meeting) {
        return Object.assign({}, meeting, { followUpNote: String((followUpRowsById[meeting.meetingId] || {}).Follow_Up_Note || '') });
      }),
      omittedCount: Math.max(0, activeFollowUps.length - KSP_ENTITY_WORKSPACE_LIMITS.FOLLOW_UPS)
    },
    mixes: kspEntityWorkspaceBuildMix_(visibleMeetings),
    relationships: relationshipForward.records,
    relationshipContext: {
      forward: relationshipForward,
      reverse: relationshipReverse,
      relationshipCount: allEdges.length,
      unresolvedCount: unresolvedRelationshipCount
    },
    timeline: timeline,
    drillDown: drill,
    fundStrategySelection: input.fundStrategy,
    omittedCounts: {
      directMeetings: directList.omittedCount,
      relatedMeetings: relatedList.omittedCount,
      pitchbooks: pitchbookList.omittedCount,
      fundStrategies: Math.max(0, fundStrategies.length - KSP_ENTITY_WORKSPACE_LIMITS.FUND_STRATEGIES),
      followUps: Math.max(0, activeFollowUps.length - KSP_ENTITY_WORKSPACE_LIMITS.FOLLOW_UPS),
      relationships: Math.max(0, relationshipForward.totalCount - KSP_ENTITY_WORKSPACE_LIMITS.RELATIONSHIPS),
      timeline: Math.max(0, timeline.totalCount - KSP_ENTITY_WORKSPACE_LIMITS.TIMELINE)
    }
  });
  return response;
}

function kspGetEntityWorkspaceData_(environment, rawInput) {
  try {
    var state = environment.getInstallationState();
    kspAssert_(state && state.resources, 'INSTALLATION_STATE_MISSING', 'Installation stateがありません。');
    var backendSpreadsheetId = state.resources[KSP_RESOURCE_KEYS.BACKEND_SPREADSHEET];
    kspAssert_(backendSpreadsheetId, 'BACKEND_SPREADSHEET_MISSING', 'Backend Spreadsheetがありません。');
    return kspBuildEntityWorkspaceData_(
      rawInput,
      environment.readRows(backendSpreadsheetId, KSP_SHEET_NAMES.COUNTERPARTY_MASTER),
      environment.readRows(backendSpreadsheetId, KSP_SHEET_NAMES.OPTION_MASTER),
      environment.readRows(backendSpreadsheetId, KSP_SHEET_NAMES.MEETING_INDEX),
      environment.readRows(backendSpreadsheetId, KSP_SHEET_NAMES.PITCHBOOK_INDEX)
    );
  } catch (error) {
    var code = kspGetErrorCode_(error);
    return {
      ok: false,
      workId: KSP_ENTITY_WORKSPACE_WORK_ID,
      error: { code: code, message: kspSafePublicErrorMessage_(code, 'WORKSPACE') }
    };
  }
}
// ===== END src/129_EntityWorkspaceService.gs =====

// ===== BEGIN src/130_AiConstants.gs =====
var KSP_AI_WORK_ID = '0008';
var KSP_AI_APP_VERSION = '0.4.0';

var KSP_AI_PROVIDERS = Object.freeze({
  OPENAI: 'OPENAI',
  GEMINI: 'GEMINI'
});

var KSP_AI_QUERY_TRANSPORTS = Object.freeze({
  INTERACTIONS: 'INTERACTIONS',
  GENERATE_CONTENT: 'GENERATE_CONTENT'
});

var KSP_AI_ROUTES = Object.freeze({
  CHATGPT: 'OPENAI',
  GEMINI: 'GEMINI',
  FULL_EXPORT: 'FULL_EXPORT'
});

var KSP_AI_SOURCE_TYPES = Object.freeze({
  MEETING: 'Meeting',
  PITCHBOOK: 'Pitchbook'
});

var KSP_AI_SEARCH_MODES = Object.freeze({
  FREE_QUESTION: '自由質問'
});

var KSP_AI_SETTINGS = Object.freeze({
  STORE_NAME: 'GEMINI_FILE_SEARCH_STORE_NAME',
  MODEL_ID: 'AI_DEFAULT_MODEL',
  SYNC_ENABLED: 'AI_SYNC_ENABLED',
  SYNC_INTERVAL_MINUTES: 'AI_SYNC_INTERVAL_MINUTES',
  SYNC_BATCH_SIZE: 'AI_SYNC_BATCH_SIZE',
  MAX_RETRY_ATTEMPTS: 'AI_MAX_RETRY_ATTEMPTS',
  RETRY_BASE_MINUTES: 'AI_RETRY_BASE_MINUTES',
  RETRY_MAX_MINUTES: 'AI_RETRY_MAX_MINUTES',
  EMBEDDING_MODEL: 'AI_EMBEDDING_MODEL',
  OPENAI_ENABLED: 'OPENAI_ENABLED',
  OPENAI_VECTOR_STORE_ID: 'OPENAI_VECTOR_STORE_ID',
  OPENAI_MODEL_ID: 'OPENAI_DEFAULT_MODEL',
  OPENAI_READINESS: 'OPENAI_READINESS',
  MODEL_POLICY_JSON: 'AI_MODEL_POLICY_JSON',
  GEMINI_ENABLED: 'GEMINI_ENABLED',
  GEMINI_MODEL_ID: 'GEMINI_DEFAULT_MODEL',
  GEMINI_READINESS: 'GEMINI_READINESS'
});

var KSP_AI_DEFAULTS = Object.freeze({
  SYNC_BATCH_SIZE: 10,
  MAX_RETRY_ATTEMPTS: 5,
  RETRY_BASE_MINUTES: 15,
  RETRY_MAX_MINUTES: 240,
  EMBEDDING_MODEL: 'models/gemini-embedding-2',
  STORE_DISPLAY_NAME: 'Private Assets Knowledge',
  OPENAI_DEFAULT_MODEL: 'gpt-5.6-terra',
  OPENAI_STORE_DISPLAY_NAME: 'Private Assets Knowledge - OpenAI',
  MODEL_POLICY_SCHEMA_VERSION: 1,
  OPENAI_DEFAULT_PROFILE_ID: 'openai-current-default',
  PROVIDER_DEFAULT_THINKING_PROFILE_ID: 'provider-default',
  MAX_QUESTION_LENGTH: 5000,
  MAX_OPERATION_POLLS: 8,
  OPERATION_POLL_MILLIS: 1500,
  MAX_TRANSPORT_ATTEMPTS: 3,
  IDEMPOTENT_TRANSPORT_ATTEMPTS: 3,
  MUTATING_TRANSPORT_ATTEMPTS: 2,
  TRANSPORT_CUMULATIVE_SLEEP_MILLIS: 20000,
  TRANSPORT_RETRY_BASE_MILLIS: 500,
  TRANSPORT_RETRY_MAX_MILLIS: 20000,
  CLAIM_TTL_MILLIS: 10 * 60 * 1000,
  INTERACTION_POLL_MILLIS: 5000,
  MAX_INTERACTION_POLLS: 24,
  QUERY_PENDING_TTL_SECONDS: 60 * 60,
  QUERY_TERMINAL_TTL_SECONDS: 15 * 60,
  QUERY_REQUEST_PROFILE_VERSION: 'gemini-interactions-file-search-v2',
  QUERY_TRANSPORT: 'INTERACTIONS',
  QUERY_TRANSPORT_VERSION: 'gemini-current-file-search-v2',
  QUERY_THINKING_LEVEL: 'low',
  QUERY_MAX_OUTPUT_TOKENS: 2048,
  QUERY_AUTO_POLL_LIMIT: 12
});

var KSP_AI_PROPERTY_KEYS = Object.freeze({
  API_KEY: 'KSP_GEMINI_API_KEY',
  OPENAI_API_KEY: 'KSP_OPENAI_API_KEY',
  SOURCE_CLAIM_PREFIX: 'KSP_AI_SOURCE_CLAIM_'
});

var KSP_AI_API = Object.freeze({
  BASE_URL: 'https://generativelanguage.googleapis.com/v1beta',
  UPLOAD_BASE_URL: 'https://generativelanguage.googleapis.com/upload/v1beta',
  INTERACTIONS_PATH: '/interactions',
  STORES_PATH: '/fileSearchStores'
});

var KSP_AI_RETRYABLE_HTTP_CODES = Object.freeze({
  408: true,
  429: true,
  500: true,
  502: true,
  503: true,
  504: true
});

var KSP_GEMINI_RETRY_POLICIES = Object.freeze({
  NONE: 'NONE',
  IDEMPOTENT: 'IDEMPOTENT',
  MUTATING_CREATE: 'MUTATING_CREATE'
});

function kspAiTrim_(value) {
  return value === null || value === undefined ? '' : String(value).trim();
}

function kspAiToInteger_(value, fallback, minimum, maximum) {
  var numberValue = Number(value);
  if (!Number.isFinite(numberValue) || Math.floor(numberValue) !== numberValue) return fallback;
  if (minimum !== undefined && numberValue < minimum) return fallback;
  if (maximum !== undefined && numberValue > maximum) return fallback;
  return numberValue;
}

function kspNormalizeAiSettings_(settings) {
  var source = settings || {};
  var legacyStoreName = kspAiTrim_(source[KSP_AI_SETTINGS.STORE_NAME] || source.storeName);
  var legacyModelId = kspAiTrim_(source[KSP_AI_SETTINGS.MODEL_ID] || source.modelId);
  var explicitGeminiEnabled = source[KSP_AI_SETTINGS.GEMINI_ENABLED] !== undefined || source.geminiEnabled !== undefined;
  var geminiStoreName = kspAiTrim_(source[KSP_AI_SETTINGS.STORE_NAME] || source.geminiStoreName || legacyStoreName);
  var geminiModelId = kspAiTrim_(source[KSP_AI_SETTINGS.GEMINI_MODEL_ID] || source.geminiModelId || legacyModelId);
  return {
    storeName: legacyStoreName,
    modelId: legacyModelId,
    geminiStoreName: geminiStoreName,
    geminiModelId: geminiModelId,
    geminiReadiness: kspAiTrim_(source[KSP_AI_SETTINGS.GEMINI_READINESS] || source.geminiReadiness),
    geminiEnabled: explicitGeminiEnabled
      ? kspToBoolean_(source[KSP_AI_SETTINGS.GEMINI_ENABLED] !== undefined
        ? source[KSP_AI_SETTINGS.GEMINI_ENABLED] : source.geminiEnabled, false)
      : Boolean(geminiStoreName && geminiModelId),
    openaiEnabled: kspToBoolean_(
      source[KSP_AI_SETTINGS.OPENAI_ENABLED] !== undefined
        ? source[KSP_AI_SETTINGS.OPENAI_ENABLED] : source.openaiEnabled,
      false
    ),
    openaiVectorStoreId: kspAiTrim_(
      source[KSP_AI_SETTINGS.OPENAI_VECTOR_STORE_ID] || source.openaiVectorStoreId
    ),
    openaiModelId: kspAiTrim_(
      source[KSP_AI_SETTINGS.OPENAI_MODEL_ID] || source.openaiModelId
    ),
    openaiReadiness: kspAiTrim_(
      source[KSP_AI_SETTINGS.OPENAI_READINESS] || source.openaiReadiness
    ),
    modelPolicyJson: kspAiTrim_(
      source[KSP_AI_SETTINGS.MODEL_POLICY_JSON] || source.modelPolicyJson
    ),
    syncEnabled: kspToBoolean_(
      source[KSP_AI_SETTINGS.SYNC_ENABLED] !== undefined ? source[KSP_AI_SETTINGS.SYNC_ENABLED] : source.syncEnabled,
      false
    ),
    syncIntervalMinutes: kspAiToInteger_(
      source[KSP_AI_SETTINGS.SYNC_INTERVAL_MINUTES] || source.syncIntervalMinutes,
      15,
      15,
      15
    ),
    syncBatchSize: kspAiToInteger_(
      source[KSP_AI_SETTINGS.SYNC_BATCH_SIZE] || source.syncBatchSize,
      KSP_AI_DEFAULTS.SYNC_BATCH_SIZE,
      1,
      50
    ),
    maxRetryAttempts: kspAiToInteger_(
      source[KSP_AI_SETTINGS.MAX_RETRY_ATTEMPTS] || source.maxRetryAttempts,
      KSP_AI_DEFAULTS.MAX_RETRY_ATTEMPTS,
      1,
      20
    ),
    retryBaseMinutes: kspAiToInteger_(
      source[KSP_AI_SETTINGS.RETRY_BASE_MINUTES] || source.retryBaseMinutes,
      KSP_AI_DEFAULTS.RETRY_BASE_MINUTES,
      1,
      1440
    ),
    retryMaxMinutes: kspAiToInteger_(
      source[KSP_AI_SETTINGS.RETRY_MAX_MINUTES] || source.retryMaxMinutes,
      KSP_AI_DEFAULTS.RETRY_MAX_MINUTES,
      1,
      10080
    ),
    embeddingModel: kspAiTrim_(
      source[KSP_AI_SETTINGS.EMBEDDING_MODEL] || source.embeddingModel || KSP_AI_DEFAULTS.EMBEDDING_MODEL
    )
  };
}

function kspGetAiSettingSeedRows_(nowIso) {
  return [
    { Key: KSP_AI_SETTINGS.SYNC_BATCH_SIZE, Value: String(KSP_AI_DEFAULTS.SYNC_BATCH_SIZE), Description: 'Maximum AI sources processed per worker execution.', Updated_At: nowIso },
    { Key: KSP_AI_SETTINGS.MAX_RETRY_ATTEMPTS, Value: String(KSP_AI_DEFAULTS.MAX_RETRY_ATTEMPTS), Description: 'Maximum retryable indexing failures before permanent stop.', Updated_At: nowIso },
    { Key: KSP_AI_SETTINGS.RETRY_BASE_MINUTES, Value: String(KSP_AI_DEFAULTS.RETRY_BASE_MINUTES), Description: 'Initial AI indexing retry delay.', Updated_At: nowIso },
    { Key: KSP_AI_SETTINGS.RETRY_MAX_MINUTES, Value: String(KSP_AI_DEFAULTS.RETRY_MAX_MINUTES), Description: 'Maximum AI indexing retry delay.', Updated_At: nowIso },
    { Key: KSP_AI_SETTINGS.EMBEDDING_MODEL, Value: KSP_AI_DEFAULTS.EMBEDDING_MODEL, Description: 'Embedding model used when creating the File Search Store.', Updated_At: nowIso },
    { Key: KSP_AI_SETTINGS.OPENAI_ENABLED, Value: 'false', Description: 'Whether the administrator has enabled the OpenAI provider.', Updated_At: nowIso },
    { Key: KSP_AI_SETTINGS.OPENAI_VECTOR_STORE_ID, Value: '', Description: 'Configured OpenAI Vector Store identifier.', Updated_At: nowIso },
    { Key: KSP_AI_SETTINGS.OPENAI_MODEL_ID, Value: '', Description: 'Configured OpenAI model identifier.', Updated_At: nowIso },
    { Key: KSP_AI_SETTINGS.OPENAI_READINESS, Value: 'UNCONFIGURED', Description: 'OpenAI connection readiness; real-source sync is separate from synthetic connection validation.', Updated_At: nowIso },
    { Key: KSP_AI_SETTINGS.MODEL_POLICY_JSON, Value: '', Description: 'Administrator-governed AI model and thinking policy registry.', Updated_At: nowIso },
    { Key: KSP_AI_SETTINGS.GEMINI_ENABLED, Value: 'false', Description: 'Whether the administrator has enabled the Gemini provider.', Updated_At: nowIso },
    { Key: KSP_AI_SETTINGS.GEMINI_MODEL_ID, Value: '', Description: 'Configured Gemini model identifier.', Updated_At: nowIso },
    { Key: KSP_AI_SETTINGS.GEMINI_READINESS, Value: 'UNCONFIGURED', Description: 'Gemini connection and exact tuple readiness.', Updated_At: nowIso }
  ];
}
// ===== END src/130_AiConstants.gs =====

// ===== BEGIN src/131_AiFileSearchContracts.gs =====
function kspBuildFileSearchStoreCreateRequest_(displayName, embeddingModel) {
  return {
    displayName: kspAiTrim_(displayName) || KSP_AI_DEFAULTS.STORE_DISPLAY_NAME,
    embeddingModel: kspAiTrim_(embeddingModel) || KSP_AI_DEFAULTS.EMBEDDING_MODEL
  };
}

function kspNormalizeFileSearchStore_(response) {
  var value = response || {};
  var name = kspAiTrim_(value.name);
  kspAssert_(/^fileSearchStores\/[^/]+$/.test(name), 'AI_STORE_RESPONSE_INVALID',
    'File Search Store response does not contain a valid resource name.');
  return {
    name: name,
    displayName: kspAiTrim_(value.displayName || value.display_name),
    embeddingModel: kspAiTrim_(value.embeddingModel || value.embedding_model),
    activeDocumentsCount: Number(value.activeDocumentsCount || value.active_documents_count || 0),
    pendingDocumentsCount: Number(value.pendingDocumentsCount || value.pending_documents_count || 0),
    failedDocumentsCount: Number(value.failedDocumentsCount || value.failed_documents_count || 0)
  };
}

function kspAiStoreResourcePath_(storeName) {
  var name = kspAiTrim_(storeName);
  kspAssert_(/^fileSearchStores\/[^/]+$/.test(name), 'AI_STORE_NAME_INVALID',
    'File Search Store name is invalid.');
  return name;
}

function kspBuildAiCustomMetadata_(source) {
  var metadata = [];
  function addString(key, value) {
    var normalized = kspAiTrim_(value);
    if (normalized) metadata.push({ key: key, stringValue: normalized });
  }
  addString('source_type', source.sourceType);
  addString('source_id', source.sourceId);
  addString('date_key', source.dateKey);
  addString('gp_id', source.gpId);
  addString('entity_key', source.entityKey);
  addString('counterparty_type', source.counterpartyType);
  addString('counterparty_id', source.counterpartyId);
  addString('related_gp_ids', source.relatedGpIds);
  addString('asset_class_id', source.assetClassId);
  addString('capital_type_id', source.capitalTypeId);
  addString('team_id', source.teamId);
  addString('fund_strategy', source.fundStrategy);
  addString('meeting_type_codes', source.meetingTypeCodes);
  addString('related_pitchbook_ids', source.relatedPitchbookIds);
  addString('follow_up_required', source.followUpRequired === true ? 'true' : '');
  addString('content_hash', source.contentHash);
  return metadata;
}

function kspBuildFileSearchUploadMetadata_(source) {
  return {
    displayName: source.displayName || source.savedFilename || source.sourceId + '.txt',
    customMetadata: kspBuildAiCustomMetadata_(source),
    mimeType: source.mimeType || 'text/plain'
  };
}

function kspNormalizeFileSearchOperation_(response) {
  var value = response || {};
  var errorValue = value.error || null;
  return {
    name: kspAiTrim_(value.name),
    done: Boolean(value.done),
    error: errorValue ? {
      code: Number(errorValue.code || 0),
      message: kspAiTrim_(errorValue.message),
      status: kspAiTrim_(errorValue.status)
    } : null,
    response: value.response || null,
    metadata: value.metadata || null
  };
}

function kspMetadataArrayToMap_(metadata) {
  if (metadata && !Array.isArray(metadata) && typeof metadata === 'object') {
    return kspDeepClone_(metadata);
  }
  var output = {};
  (metadata || []).forEach(function (entry) {
    if (!entry || !entry.key) return;
    var value = entry.stringValue;
    if (value === undefined) value = entry.string_value;
    if (value === undefined) value = entry.numericValue;
    if (value === undefined) value = entry.numeric_value;
    if (value === undefined) value = entry.stringListValue || entry.string_list_value;
    output[String(entry.key)] = value;
  });
  return output;
}

function kspNormalizeFileSearchDocument_(response) {
  var value = response || {};
  var metadata = value.customMetadata || value.custom_metadata || [];
  var name = kspAiTrim_(value.name);
  kspAssert_(/^fileSearchStores\/[^/]+\/documents\/[^/]+$/.test(name),
    'AI_DOCUMENT_RESPONSE_INVALID', 'File Search Document response is invalid.');
  return {
    name: name,
    displayName: kspAiTrim_(value.displayName || value.display_name),
    state: kspAiTrim_(value.state),
    customMetadata: kspMetadataArrayToMap_(metadata),
    rawCustomMetadata: kspDeepClone_(metadata)
  };
}

function kspNormalizeFileSearchDocumentList_(response) {
  var value = response || {};
  var documents = value.documents || value.fileSearchDocuments || value.file_search_documents || [];
  return {
    documents: documents.map(kspNormalizeFileSearchDocument_),
    nextPageToken: kspAiTrim_(value.nextPageToken || value.next_page_token)
  };
}
// ===== END src/131_AiFileSearchContracts.gs =====

// ===== BEGIN src/132_AiKnowledgeContracts.gs =====
function kspEscapeMetadataFilterString_(value) {
  return String(value).replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

function kspBuildMetadataFilter_(filters) {
  var input = typeof kspKnowledgeRequestFilters_ === 'function'
    ? kspKnowledgeRequestFilters_(filters) : (filters || {});
  var clauses = [];
  function addComparison(key, operator, value) {
    var normalized = kspAiTrim_(value);
    if (normalized) clauses.push(key + ' ' + operator + ' "' + kspEscapeMetadataFilterString_(normalized) + '"');
  }
  addComparison('date_key', '>=', input.dateFrom);
  addComparison('date_key', '<=', input.dateTo);
  addComparison('counterparty_type', '=', input.counterpartyType);
  addComparison('entity_key', '=', input.entityKey);
  addComparison('gp_id', '=', input.gpId);
  addComparison('asset_class_id', '=', input.assetClassId);
  addComparison('capital_type_id', '=', input.capitalTypeId);
  addComparison('team_id', '=', input.teamId);
  addComparison('fund_strategy', '=', input.fundStrategy);
  addComparison('follow_up_required', '=', input.followUp === 'REQUIRED' ? 'true' :
    (input.followUp === 'NOT_REQUIRED' ? 'false' : ''));
  addComparison('source_type', '=', input.sourceType);
  addComparison('source_id', '=', input.sourceId);
  return clauses.join(' AND ');
}

function kspNormalizeKnowledgeSearchInput_(input) {
  var source = input && typeof input === 'object' ? input : {};
  return {
    mode: KSP_AI_SEARCH_MODES.FREE_QUESTION,
    question: kspAiTrim_(source.question),
    dateFrom: kspAiTrim_(source.dateFrom),
    dateTo: kspAiTrim_(source.dateTo),
    gpId: kspAiTrim_(source.gpId),
    assetClassId: kspAiTrim_(source.assetClassId),
    capitalTypeId: kspAiTrim_(source.capitalTypeId),
    sourceType: kspAiTrim_(source.sourceType)
  };
}

function kspValidateKnowledgeSearchInput_(input) {
  kspAssert_(input.question, 'AI_QUESTION_REQUIRED', '質問を入力してください。');
  kspAssert_(input.question.length <= KSP_AI_DEFAULTS.MAX_QUESTION_LENGTH,
    'AI_QUESTION_TOO_LONG', '質問は5,000文字以内で入力してください。');
  if (input.dateFrom) kspAssert_(kspIsValidDateKey_(input.dateFrom), 'AI_DATE_FROM_INVALID', 'Date Fromが不正です。');
  if (input.dateTo) kspAssert_(kspIsValidDateKey_(input.dateTo), 'AI_DATE_TO_INVALID', 'Date Toが不正です。');
  if (input.dateFrom && input.dateTo) {
    kspAssert_(input.dateFrom <= input.dateTo, 'AI_DATE_RANGE_INVALID', 'Date FromはDate To以前にしてください。');
  }
  if (input.sourceType) {
    kspAssert_(input.sourceType === KSP_AI_SOURCE_TYPES.MEETING || input.sourceType === KSP_AI_SOURCE_TYPES.PITCHBOOK,
      'AI_SOURCE_TYPE_INVALID', 'Source Typeが不正です。');
  }
  return input;
}

function kspBuildFreeQuestionPrompt_(question) {
  return [
    '社内ナレッジベースに登録された資料だけを根拠として、日本語で回答してください。',
    '最初に質問への直接回答を示し、その後に根拠となる要点を簡潔に整理してください。',
    '根拠が不足する場合は、推測で補わず「確認できる根拠が不足しています」と明示してください。',
    '外部知識や一般論を、資料に書かれている事実のように扱わないでください。',
    '',
    '質問:',
    question
  ].join('\n');
}

function kspBuildInteractionRequest_(params) {
  var options = params || {};
  var modelId = kspAiTrim_(options.modelId);
  var storeName = kspAiStoreResourcePath_(options.storeName);
  var question = kspAiTrim_(options.question);
  kspAssert_(modelId, 'AI_MODEL_NOT_CONFIGURED', 'Gemini Flash model IDが設定されていません。');
  kspAssert_(question, 'AI_QUESTION_REQUIRED', '質問を入力してください。');
  var tool = {
    type: 'file_search',
    file_search_store_names: [storeName]
  };
  var metadataFilter = kspAiTrim_(options.metadataFilter);
  if (metadataFilter) tool.metadata_filter = metadataFilter;
  return {
    model: modelId,
    input: kspBuildFreeQuestionPrompt_(question),
    tools: [tool],
    background: true,
    generation_config: kspGeminiGenerationConfig_(options)
  };
}

function kspNormalizeCitationMetadataIdentity_(metadata) {
  var raw = metadata || [];
  var containerValid = Array.isArray(raw) || Boolean(raw && typeof raw === 'object');
  var values = containerValid ? kspMetadataArrayToMap_(raw) : {};
  var identityKeys = { source_type: true, source_id: true, content_hash: true };
  var seen = {};
  var conflicting = false;
  var invalid = !containerValid;

  if (Array.isArray(raw)) {
    raw.forEach(function (entry) {
      var key = kspAiTrim_(entry && entry.key);
      if (!identityKeys[key]) return;
      var value = entry && entry.stringValue;
      if (value === undefined) value = entry && entry.string_value;
      if (typeof value !== 'string' || !kspAiTrim_(value)) {
        invalid = true;
        return;
      }
      value = kspAiTrim_(value);
      if (seen[key] !== undefined && seen[key] !== value) conflicting = true;
      seen[key] = value;
    });
  } else if (raw && typeof raw === 'object') {
    Object.keys(identityKeys).forEach(function (key) {
      if (!Object.prototype.hasOwnProperty.call(raw, key)) return;
      if (typeof raw[key] !== 'string' || !kspAiTrim_(raw[key])) invalid = true;
      else seen[key] = kspAiTrim_(raw[key]);
    });
  } else {
    invalid = true;
  }

  Object.keys(identityKeys).forEach(function (key) {
    if (seen[key] !== undefined) values[key] = seen[key];
  });
  return {
    metadata: values,
    valid: !invalid && !conflicting,
    complete: Object.keys(identityKeys).every(function (key) { return Boolean(seen[key]); }),
    conflicting: conflicting
  };
}

function kspNormalizeCitationAnnotation_(annotation) {
  var value = annotation || {};
  var type = kspAiTrim_(value.type);
  if (type !== 'file_citation') return null;
  var rawMetadata = value.customMetadata || value.custom_metadata || [];
  var metadataIdentity = kspNormalizeCitationMetadataIdentity_(rawMetadata);
  return {
    type: 'file_citation',
    fileName: kspAiTrim_(value.fileName || value.file_name),
    source: kspAiTrim_(value.source),
    documentUri: kspAiTrim_(value.documentUri || value.document_uri),
    pageNumber: Number(value.pageNumber || value.page_number || 0) || null,
    metadata: metadataIdentity.metadata,
    rawMetadata: kspDeepClone_(rawMetadata),
    metadataIdentityValid: metadataIdentity.valid,
    metadataIdentityComplete: metadataIdentity.complete,
    metadataIdentityConflicting: metadataIdentity.conflicting
  };
}

function kspParseInteractionResponse_(response) {
  var value = response || {};
  var answerParts = [];
  var citations = [];
  (value.steps || []).forEach(function (step) {
    if (!step || String(step.type) !== 'model_output') return;
    (step.content || []).forEach(function (block) {
      if (!block || String(block.type) !== 'text') return;
      if (block.text !== undefined && block.text !== null) answerParts.push(String(block.text));
      (block.annotations || []).forEach(function (annotation) {
        var normalized = kspNormalizeCitationAnnotation_(annotation);
        if (normalized) citations.push(normalized);
      });
    });
  });
  return {
    answer: answerParts.join('\n').trim(),
    citations: citations,
    interactionId: kspAiTrim_(value.id || value.name),
    rawStatus: kspAiTrim_(value.status)
  };
}

function kspNormalizeGeminiGenerateContentResponse_(response) {
  var value = response || {};
  var candidate = (value.candidates || [])[0] || {};
  var content = candidate.content || {};
  var answerParts = [];
  (content.parts || []).forEach(function (part) {
    if (!part || part.text === undefined || part.text === null || part.thought === true) return;
    answerParts.push(String(part.text));
  });
  if (!answerParts.length && value.text !== undefined && value.text !== null) answerParts.push(String(value.text));

  var grounding = candidate.groundingMetadata || candidate.grounding_metadata ||
    value.groundingMetadata || value.grounding_metadata || {};
  var chunks = grounding.groundingChunks || grounding.grounding_chunks || [];
  var citations = [];
  chunks.forEach(function (chunk) {
    var retrieved = chunk && (chunk.retrievedContext || chunk.retrieved_context);
    if (!retrieved) return;
    var metadata = kspMetadataArrayToMap_(
      retrieved.customMetadata || retrieved.custom_metadata || retrieved.metadata || []
    );
    var sourceType = kspAiTrim_(metadata.source_type);
    var sourceId = kspAiTrim_(metadata.source_id);
    if (!sourceType || !sourceId) return;
    var pageNumber = Number(
      retrieved.pageNumber || retrieved.page_number || metadata.page_number || metadata.pageNumber || 0
    ) || null;
    citations.push({
      type: 'file_citation',
      fileName: kspAiTrim_(retrieved.title || retrieved.displayName || retrieved.display_name || retrieved.uri),
      source: kspAiTrim_(retrieved.uri || retrieved.fileSearchStore || retrieved.file_search_store),
      pageNumber: pageNumber,
      metadata: metadata
    });
  });
  var seen = {};
  citations = citations.filter(function (citation) {
    var metadata = kspMetadataArrayToMap_(citation.metadata);
    var key = [metadata.source_type, metadata.source_id, citation.pageNumber || ''].join('|');
    if (seen[key]) return false;
    seen[key] = true;
    return true;
  });
  return {
    answer: answerParts.join('\n').trim(),
    citations: citations,
    interactionId: '',
    rawStatus: 'completed',
    finishReason: kspAiTrim_(candidate.finishReason || candidate.finish_reason),
    usage: kspDeepClone_(value.usageMetadata || value.usage_metadata || value.usage || {})
  };
}
// ===== END src/132_AiKnowledgeContracts.gs =====

// ===== BEGIN src/133_AiRetryContracts.gs =====
function kspAiHashTextFallback_(text) {
  var value = String(text || '');
  var hash = 2166136261;
  for (var index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return ('00000000' + (hash >>> 0).toString(16)).slice(-8) + '-' + value.length;
}

function kspParseAiLastError_(value) {
  var raw = kspAiTrim_(value);
  if (!raw) return { attempt: 0, retryable: true, nextAttemptAt: '', permanent: false, code: '', message: '' };
  try {
    var parsed = JSON.parse(raw);
    return {
      attempt: Number(parsed.attempt || 0),
      retryable: parsed.retryable !== false,
      nextAttemptAt: kspAiTrim_(parsed.nextAttemptAt),
      permanent: Boolean(parsed.permanent),
      code: kspAiTrim_(parsed.code),
      message: kspAiTrim_(parsed.message)
    };
  } catch (ignored) {
    return { attempt: 1, retryable: true, nextAttemptAt: '', permanent: false, code: 'LEGACY_ERROR', message: raw };
  }
}

function kspBuildAiLastError_(params) {
  var options = params || {};
  return JSON.stringify({
    attempt: Number(options.attempt || 0),
    retryable: options.retryable !== false,
    nextAttemptAt: kspAiTrim_(options.nextAttemptAt),
    permanent: Boolean(options.permanent),
    code: kspAiTrim_(options.code)
  });
}

function kspCalculateAiRetryAt_(nowIso, attempt, settings) {
  var safeSettings = settings || kspNormalizeAiSettings_({});
  var exponent = Math.max(0, Number(attempt || 1) - 1);
  var delayMinutes = Math.min(
    safeSettings.retryMaxMinutes,
    safeSettings.retryBaseMinutes * Math.pow(2, exponent)
  );
  var baseIso = kspCanonicalInstantIso_(nowIso);
  kspAssert_(baseIso, 'AI_RETRY_NOW_INVALID', 'AI retry基準日時が不正です。');
  return kspCanonicalInstantIso_(new Date(new Date(baseIso).getTime() + delayMinutes * 60 * 1000));
}

function kspIsAiErrorRetryable_(error) {
  if (error && error.retryable === false) return false;
  if (error && error.retryable === true) return true;
  var statusCode = Number(error && (error.httpStatus || error.code));
  if (KSP_AI_RETRYABLE_HTTP_CODES[statusCode]) return true;
  return statusCode === 0 || !Number.isFinite(statusCode);
}
// ===== END src/133_AiRetryContracts.gs =====

// ===== BEGIN src/134_AiModelPolicyContracts.gs =====
var KSP_AI_MODEL_ACCESS_STATES = Object.freeze({
  AVAILABLE: 'AVAILABLE',
  UNAVAILABLE: 'UNAVAILABLE',
  UNKNOWN: 'UNKNOWN'
});

var KSP_AI_MODEL_QUALIFICATION_STATES = Object.freeze({
  QUALIFIED: 'QUALIFIED',
  UNQUALIFIED: 'UNQUALIFIED',
  FAILED: 'FAILED'
});

function kspAiModelPolicyError_(code, message) {
  var error = new Error(message || 'AI model policy is invalid.');
  error.code = code;
  return error;
}

function kspAiModelPolicyAssert_(condition, code, message) {
  if (!condition) throw kspAiModelPolicyError_(code, message);
}

function kspAiModelPolicySafeId_(value, code) {
  var normalized = kspAiTrim_(value).toLowerCase();
  kspAiModelPolicyAssert_(/^[a-z][a-z0-9-]{2,63}$/.test(normalized), code || 'AI_MODEL_PROFILE_ID_INVALID');
  return normalized;
}

function kspAiModelPolicySafeText_(value, maximum, code, required) {
  var normalized = kspAiTrim_(value);
  kspAiModelPolicyAssert_(!required || normalized, code);
  kspAiModelPolicyAssert_(normalized.length <= maximum, code);
  return normalized;
}

function kspAiModelPolicyState_(value, allowed, fallback, code) {
  var normalized = kspAiTrim_(value).toUpperCase() || fallback;
  kspAiModelPolicyAssert_(allowed.indexOf(normalized) !== -1, code);
  return normalized;
}

function kspAiModelPolicyThinkingProfile_(raw) {
  var value = raw || {};
  var id = kspAiModelPolicySafeId_(value.thinkingProfileId || value.profileId || value.id,
    'AI_THINKING_PROFILE_ID_INVALID');
  var rawValue = value.rawValue;
  if (rawValue === undefined && value.value !== undefined) rawValue = value.value;
  var providerDefault = value.providerDefault === true || rawValue === null || rawValue === undefined || rawValue === '';
  if (providerDefault) rawValue = null;
  else {
    rawValue = kspAiTrim_(rawValue);
    kspAiModelPolicyAssert_(/^[A-Za-z0-9_-]{1,32}$/.test(rawValue), 'AI_THINKING_VALUE_INVALID');
  }
  return {
    thinkingProfileId: id,
    label: kspAiModelPolicySafeText_(value.label || id, 80, 'AI_THINKING_LABEL_INVALID', true),
    rawValue: rawValue,
    providerDefault: providerDefault,
    enabled: value.enabled !== false,
    qualification: kspAiModelPolicyState_(value.qualification,
      [KSP_AI_MODEL_QUALIFICATION_STATES.QUALIFIED, KSP_AI_MODEL_QUALIFICATION_STATES.UNQUALIFIED,
        KSP_AI_MODEL_QUALIFICATION_STATES.FAILED],
      KSP_AI_MODEL_QUALIFICATION_STATES.UNQUALIFIED, 'AI_THINKING_QUALIFICATION_STATE_INVALID'),
    qualifiedAt: kspAiModelPolicySafeText_(value.qualifiedAt, 40, 'AI_MODEL_TIMESTAMP_INVALID', false)
  };
}

function kspAiModelPolicyProfile_(raw) {
  var value = raw || {};
  var provider = kspNormalizeAiProvider_(value.provider);
  kspAiModelPolicyAssert_(provider, 'AI_MODEL_PROFILE_PROVIDER_INVALID');
  var modelId = kspAiModelPolicySafeText_(value.modelId, 128, 'AI_MODEL_ID_INVALID', true);
  kspAiModelPolicyAssert_(/^[A-Za-z0-9][A-Za-z0-9._:/-]{0,127}$/.test(modelId), 'AI_MODEL_ID_INVALID');
  var thinkingProfiles = Array.isArray(value.thinkingProfiles) ? value.thinkingProfiles : [];
  kspAiModelPolicyAssert_(thinkingProfiles.length > 0 && thinkingProfiles.length <= 12,
    'AI_THINKING_PROFILES_INVALID');
  var thinkingSeen = {};
  thinkingProfiles = thinkingProfiles.map(function (item) {
    var normalized = kspAiModelPolicyThinkingProfile_(item);
    kspAiModelPolicyAssert_(!thinkingSeen[normalized.thinkingProfileId], 'AI_THINKING_PROFILE_DUPLICATE');
    thinkingSeen[normalized.thinkingProfileId] = true;
    return normalized;
  });
  if (provider === KSP_AI_PROVIDERS.GEMINI &&
      (modelId === 'gemini-3.8-flash' || modelId === 'gemini-3.7-flash' ||
        modelId === 'gemini-3.6-flash')) {
    thinkingProfiles.forEach(function (thinking) {
      if (!thinking.providerDefault) {
        kspAiModelPolicyAssert_(['low', 'medium', 'high'].indexOf(String(thinking.rawValue).toLowerCase()) !== -1,
          'AI_THINKING_VALUE_INVALID');
      }
    });
  }
  var defaultThinkingProfileId = kspAiModelPolicySafeId_(
    value.defaultThinkingProfileId || thinkingProfiles[0].thinkingProfileId,
    'AI_THINKING_DEFAULT_INVALID');
  kspAiModelPolicyAssert_(thinkingSeen[defaultThinkingProfileId], 'AI_THINKING_DEFAULT_INVALID');
  var maximum = value.maxOutputTokens;
  if (maximum === '' || maximum === undefined || maximum === null) maximum = null;
  else {
    maximum = Number(maximum);
    kspAiModelPolicyAssert_(Number.isFinite(maximum) && Math.floor(maximum) === maximum && maximum >= 1 && maximum <= 65536,
      'AI_MODEL_OUTPUT_LIMIT_INVALID');
  }
  var enabled = value.enabled !== false;
  var userVisible = value.userVisible !== false;
  var isProviderDefault = value.isProviderDefault === true;
  var qualification = kspAiModelPolicyState_(value.qualification,
    [KSP_AI_MODEL_QUALIFICATION_STATES.QUALIFIED, KSP_AI_MODEL_QUALIFICATION_STATES.UNQUALIFIED,
      KSP_AI_MODEL_QUALIFICATION_STATES.FAILED],
    KSP_AI_MODEL_QUALIFICATION_STATES.UNQUALIFIED, 'AI_MODEL_QUALIFICATION_STATE_INVALID');
  var fileSearch = value.fileSearch === true;
  var qualifiedAt = kspAiModelPolicySafeText_(value.qualifiedAt, 40, 'AI_MODEL_TIMESTAMP_INVALID', false);
  var migrateAcceptedDefault = provider === KSP_AI_PROVIDERS.OPENAI && isProviderDefault && fileSearch &&
    qualification === KSP_AI_MODEL_QUALIFICATION_STATES.QUALIFIED && thinkingProfiles.length === 1 &&
    thinkingProfiles[0].providerDefault && (!value.thinkingProfiles[0] || value.thinkingProfiles[0].qualification === undefined);
  if (migrateAcceptedDefault) {
    thinkingProfiles[0].qualification = KSP_AI_MODEL_QUALIFICATION_STATES.QUALIFIED;
    thinkingProfiles[0].qualifiedAt = qualifiedAt;
  }
  kspAiModelPolicyAssert_(!isProviderDefault || enabled, 'AI_MODEL_DEFAULT_INVALID');
  return {
    profileId: kspAiModelPolicySafeId_(value.profileId, 'AI_MODEL_PROFILE_ID_INVALID'),
    provider: provider,
    modelId: modelId,
    displayName: kspAiModelPolicySafeText_(value.displayName || modelId, 120, 'AI_MODEL_DISPLAY_NAME_INVALID', true),
    family: kspAiModelPolicySafeText_(value.family || modelId, 80, 'AI_MODEL_FAMILY_INVALID', true),
    enabled: enabled,
    userVisible: userVisible,
    isProviderDefault: isProviderDefault,
    apiAccess: kspAiModelPolicyState_(value.apiAccess,
      [KSP_AI_MODEL_ACCESS_STATES.AVAILABLE, KSP_AI_MODEL_ACCESS_STATES.UNAVAILABLE, KSP_AI_MODEL_ACCESS_STATES.UNKNOWN],
      KSP_AI_MODEL_ACCESS_STATES.UNKNOWN, 'AI_MODEL_ACCESS_STATE_INVALID'),
    qualification: qualification,
    fileSearch: fileSearch,
    thinkingProfiles: thinkingProfiles,
    defaultThinkingProfileId: defaultThinkingProfileId,
    maxOutputTokens: maximum,
    qualifiedStoreName: kspAiModelPolicySafeText_(value.qualifiedStoreName, 256,
      'AI_MODEL_QUALIFICATION_IDENTITY_INVALID', false),
    qualifiedRequestProfileVersion: kspAiModelPolicySafeText_(value.qualifiedRequestProfileVersion, 80,
      'AI_MODEL_QUALIFICATION_IDENTITY_INVALID', false),
    createdAt: kspAiModelPolicySafeText_(value.createdAt, 40, 'AI_MODEL_TIMESTAMP_INVALID', false),
    updatedAt: kspAiModelPolicySafeText_(value.updatedAt, 40, 'AI_MODEL_TIMESTAMP_INVALID', false),
    qualifiedAt: qualifiedAt,
    safeNote: kspAiModelPolicySafeText_(value.safeNote, 240, 'AI_MODEL_SAFE_NOTE_INVALID', false)
  };
}

function kspNormalizeAiModelPolicy_(raw) {
  var value = raw;
  if (typeof value === 'string') {
    try { value = value ? JSON.parse(value) : null; }
    catch (error) { throw kspAiModelPolicyError_('AI_MODEL_POLICY_JSON_INVALID'); }
  }
  kspAiModelPolicyAssert_(value && typeof value === 'object' && !Array.isArray(value), 'AI_MODEL_POLICY_INVALID');
  var schemaVersion = Number(value.schemaVersion);
  kspAiModelPolicyAssert_(schemaVersion === KSP_AI_DEFAULTS.MODEL_POLICY_SCHEMA_VERSION,
    'AI_MODEL_POLICY_SCHEMA_UNSUPPORTED');
  var profiles = Array.isArray(value.profiles) ? value.profiles : [];
  kspAiModelPolicyAssert_(profiles.length > 0 && profiles.length <= 50, 'AI_MODEL_PROFILES_INVALID');
  var profileSeen = {};
  var defaults = {};
  var enabledProviders = {};
  profiles = profiles.map(function (item) {
    var profile = kspAiModelPolicyProfile_(item);
    kspAiModelPolicyAssert_(!profileSeen[profile.profileId], 'AI_MODEL_PROFILE_DUPLICATE');
    profileSeen[profile.profileId] = true;
    if (profile.enabled) enabledProviders[profile.provider] = true;
    if (profile.isProviderDefault) {
      kspAiModelPolicyAssert_(!defaults[profile.provider], 'AI_MODEL_DEFAULT_DUPLICATE');
      defaults[profile.provider] = profile.profileId;
    }
    return profile;
  });
  Object.keys(enabledProviders).forEach(function (provider) {
    kspAiModelPolicyAssert_(defaults[provider], 'AI_MODEL_DEFAULT_REQUIRED');
  });
  return {
    schemaVersion: schemaVersion,
    updatedAt: kspAiModelPolicySafeText_(value.updatedAt, 40, 'AI_MODEL_TIMESTAMP_INVALID', false),
    profiles: profiles
  };
}

function kspBuildProviderDefaultThinkingProfile_(qualification, qualifiedAt) {
  return {
    thinkingProfileId: KSP_AI_DEFAULTS.PROVIDER_DEFAULT_THINKING_PROFILE_ID,
    label: 'プロバイダ標準',
    rawValue: null,
    providerDefault: true,
    enabled: true,
    qualification: qualification || KSP_AI_MODEL_QUALIFICATION_STATES.UNQUALIFIED,
    qualifiedAt: qualifiedAt || ''
  };
}

function kspBuildMigratedOpenAiModelPolicy_(settings, options) {
  var source = settings || {};
  var runtime = options || {};
  var nowIso = kspAiTrim_(runtime.nowIso);
  var modelId = kspAiTrim_(runtime.modelId || source.openaiModelId || KSP_AI_DEFAULTS.OPENAI_DEFAULT_MODEL);
  var ready = runtime.qualified === true || (source.openaiEnabled &&
    ['ACTIVE', 'ACTIVE_WITH_SYNC_ERRORS', 'READY_FOR_SYNC'].indexOf(source.openaiReadiness) !== -1);
  var access = runtime.accessible === true || ready;
  return kspNormalizeAiModelPolicy_({
    schemaVersion: KSP_AI_DEFAULTS.MODEL_POLICY_SCHEMA_VERSION,
    updatedAt: nowIso,
    profiles: [{
      profileId: KSP_AI_DEFAULTS.OPENAI_DEFAULT_PROFILE_ID,
      provider: KSP_AI_PROVIDERS.OPENAI,
      modelId: modelId,
      displayName: modelId,
      family: modelId,
      enabled: true,
      userVisible: true,
      isProviderDefault: true,
      apiAccess: access ? KSP_AI_MODEL_ACCESS_STATES.AVAILABLE : KSP_AI_MODEL_ACCESS_STATES.UNKNOWN,
      qualification: ready ? KSP_AI_MODEL_QUALIFICATION_STATES.QUALIFIED : KSP_AI_MODEL_QUALIFICATION_STATES.UNQUALIFIED,
      fileSearch: ready,
      thinkingProfiles: [kspBuildProviderDefaultThinkingProfile_(ready
        ? KSP_AI_MODEL_QUALIFICATION_STATES.QUALIFIED : KSP_AI_MODEL_QUALIFICATION_STATES.UNQUALIFIED,
      ready ? nowIso : '')],
      defaultThinkingProfileId: KSP_AI_DEFAULTS.PROVIDER_DEFAULT_THINKING_PROFILE_ID,
      maxOutputTokens: null,
      createdAt: nowIso,
      updatedAt: nowIso,
      qualifiedAt: ready ? nowIso : '',
      safeNote: 'Work 0020 qualified OpenAI default migration.'
    }]
  });
}

function kspBuildLegacyProviderModelPolicy_(provider, config, nowIso) {
  var normalizedProvider = kspNormalizeAiProvider_(provider);
  var modelId = kspAiTrim_(config && config.modelId);
  var thinkingProfiles = normalizedProvider === KSP_AI_PROVIDERS.GEMINI ? [{
    thinkingProfileId: 'legacy-low', label: 'Low', rawValue: 'low', providerDefault: false, enabled: true
  }] : [kspBuildProviderDefaultThinkingProfile_(KSP_AI_MODEL_QUALIFICATION_STATES.QUALIFIED, nowIso || '')];
  thinkingProfiles.forEach(function (thinking) {
    thinking.qualification = KSP_AI_MODEL_QUALIFICATION_STATES.QUALIFIED;
    thinking.qualifiedAt = nowIso || '';
  });
  return kspNormalizeAiModelPolicy_({
    schemaVersion: KSP_AI_DEFAULTS.MODEL_POLICY_SCHEMA_VERSION,
    updatedAt: nowIso || '',
    profiles: [{
      profileId: normalizedProvider.toLowerCase() + '-legacy-default',
      provider: normalizedProvider,
      modelId: modelId,
      displayName: modelId,
      family: modelId,
      enabled: true,
      userVisible: true,
      isProviderDefault: true,
      apiAccess: config && config.credentialConfigured === false ? 'UNAVAILABLE' : 'AVAILABLE',
      qualification: 'QUALIFIED',
      fileSearch: true,
      thinkingProfiles: thinkingProfiles,
      defaultThinkingProfileId: thinkingProfiles[0].thinkingProfileId,
      maxOutputTokens: normalizedProvider === KSP_AI_PROVIDERS.GEMINI ? KSP_AI_DEFAULTS.QUERY_MAX_OUTPUT_TOKENS : null,
      createdAt: nowIso || '', updatedAt: nowIso || '', qualifiedAt: nowIso || '', safeNote: 'Legacy compatibility profile.'
    }]
  });
}

function kspAiModelPolicyFromSettings_(settings, provider, config, nowIso) {
  var source = settings || {};
  if (source.modelPolicyJson) return kspNormalizeAiModelPolicy_(source.modelPolicyJson);
  return kspBuildLegacyProviderModelPolicy_(provider, config, nowIso);
}

function kspAiModelPolicyRejectRawInjection_(input) {
  var source = input && typeof input === 'object' ? input : {};
  ['model', 'modelId', 'thinking', 'thinkingLevel', 'reasoning', 'reasoningEffort', 'maxOutputTokens']
    .forEach(function (key) {
      kspAiModelPolicyAssert_(source[key] === undefined || source[key] === null || source[key] === '',
        'AI_MODEL_POLICY_RAW_VALUE_REJECTED');
    });
}

function kspResolveAiModelSelection_(settings, provider, rawInput, config, nowIso) {
  kspAiModelPolicyRejectRawInjection_(rawInput);
  var normalizedProvider = kspNormalizeAiProvider_(provider);
  kspAiModelPolicyAssert_(normalizedProvider, 'AI_MODEL_PROFILE_PROVIDER_INVALID');
  var policy = kspAiModelPolicyFromSettings_(settings, normalizedProvider, config, nowIso);
  var requestedProfileId = kspAiTrim_(rawInput && rawInput.modelProfileId).toLowerCase();
  var requestedProfile = requestedProfileId
    ? policy.profiles.filter(function (item) { return item.profileId === requestedProfileId; })[0] : null;
  kspAiModelPolicyAssert_(!requestedProfile || requestedProfile.provider === normalizedProvider,
    'AI_MODEL_PROFILE_PROVIDER_MISMATCH');
  var candidates = policy.profiles.filter(function (profile) { return profile.provider === normalizedProvider; });
  var profile = requestedProfileId
    ? requestedProfile
    : candidates.filter(function (item) { return item.isProviderDefault; })[0];
  kspAiModelPolicyAssert_(profile, requestedProfileId ? 'AI_MODEL_SELECTION_STALE' : 'AI_MODEL_DEFAULT_REQUIRED');
  kspAiModelPolicyAssert_(profile.enabled && profile.userVisible, 'AI_MODEL_PROFILE_DISABLED');
  kspAiModelPolicyAssert_(profile.apiAccess === KSP_AI_MODEL_ACCESS_STATES.AVAILABLE,
    'AI_MODEL_PROFILE_INACCESSIBLE');
  kspAiModelPolicyAssert_(profile.qualification === KSP_AI_MODEL_QUALIFICATION_STATES.QUALIFIED && profile.fileSearch,
    'AI_MODEL_PROFILE_UNQUALIFIED');
  if (normalizedProvider === KSP_AI_PROVIDERS.GEMINI) {
    kspAiModelPolicyAssert_(profile.qualifiedStoreName &&
      profile.qualifiedStoreName === kspAiTrim_(config && config.storeName) &&
      profile.qualifiedRequestProfileVersion === KSP_AI_DEFAULTS.QUERY_REQUEST_PROFILE_VERSION,
    'AI_MODEL_PROFILE_UNQUALIFIED');
  }
  var requestedThinkingId = kspAiTrim_(rawInput && rawInput.thinkingProfileId).toLowerCase();
  var thinkingId = requestedThinkingId || profile.defaultThinkingProfileId;
  var thinking = profile.thinkingProfiles.filter(function (item) {
    return item.thinkingProfileId === thinkingId;
  })[0];
  kspAiModelPolicyAssert_(thinking, requestedThinkingId ? 'AI_THINKING_SELECTION_STALE' : 'AI_THINKING_DEFAULT_INVALID');
  kspAiModelPolicyAssert_(thinking.enabled, 'AI_THINKING_PROFILE_DISABLED');
  kspAiModelPolicyAssert_(thinking.qualification === KSP_AI_MODEL_QUALIFICATION_STATES.QUALIFIED,
    'AI_THINKING_PROFILE_UNQUALIFIED');
  return {
    profileId: profile.profileId,
    provider: profile.provider,
    modelId: profile.modelId,
    displayName: profile.displayName,
    thinkingProfileId: thinking.thinkingProfileId,
    thinkingRawValue: thinking.providerDefault ? null : thinking.rawValue,
    thinkingProviderDefault: thinking.providerDefault,
    maxOutputTokens: profile.maxOutputTokens
  };
}

function kspApplyAiModelSelectionToConfig_(config, selection) {
  var output = kspDeepClone_(config || {});
  output.modelId = selection.modelId;
  output.modelProfileId = selection.profileId;
  output.thinkingProfileId = selection.thinkingProfileId;
  output.thinkingRawValue = selection.thinkingRawValue;
  output.thinkingProviderDefault = selection.thinkingProviderDefault;
  output.maxOutputTokens = selection.maxOutputTokens;
  return output;
}

function kspGetEffectiveAiModelChoices_(settings, provider, config, nowIso) {
  var normalizedProvider = kspNormalizeAiProvider_(provider);
  if (!normalizedProvider || !config || !config.enabled) return { provider: normalizedProvider || '', profiles: [] };
  var policy = kspAiModelPolicyFromSettings_(settings, normalizedProvider, config, nowIso);
  return {
    provider: normalizedProvider,
    profiles: policy.profiles.filter(function (profile) {
      var defaultThinking = profile.thinkingProfiles.filter(function (thinking) {
        return thinking.thinkingProfileId === profile.defaultThinkingProfileId;
      })[0];
      var currentGeminiIdentity = normalizedProvider !== KSP_AI_PROVIDERS.GEMINI ||
        (profile.qualifiedStoreName && profile.qualifiedStoreName === kspAiTrim_(config.storeName) &&
          profile.qualifiedRequestProfileVersion === KSP_AI_DEFAULTS.QUERY_REQUEST_PROFILE_VERSION);
      return profile.provider === normalizedProvider && profile.enabled && profile.userVisible && defaultThinking &&
        defaultThinking.enabled && defaultThinking.qualification === KSP_AI_MODEL_QUALIFICATION_STATES.QUALIFIED &&
        profile.apiAccess === KSP_AI_MODEL_ACCESS_STATES.AVAILABLE &&
        profile.qualification === KSP_AI_MODEL_QUALIFICATION_STATES.QUALIFIED && profile.fileSearch && currentGeminiIdentity;
    }).map(function (profile) {
      return {
        profileId: profile.profileId,
        modelId: profile.modelId,
        displayName: profile.displayName,
        family: profile.family,
        isDefault: profile.isProviderDefault,
        defaultThinkingProfileId: profile.defaultThinkingProfileId,
        thinkingProfiles: profile.thinkingProfiles.filter(function (thinking) {
          return thinking.enabled && thinking.qualification === KSP_AI_MODEL_QUALIFICATION_STATES.QUALIFIED;
        }).map(function (thinking) {
          return { thinkingProfileId: thinking.thinkingProfileId, label: thinking.label, isDefault: thinking.thinkingProfileId === profile.defaultThinkingProfileId };
        })
      };
    })
  };
}

function kspAiModelPolicyForAdmin_(policy) {
  return {
    schemaVersion: policy.schemaVersion,
    updatedAt: policy.updatedAt,
    profiles: policy.profiles.map(function (profile) {
      var safe = kspDeepClone_(profile);
      delete safe.qualifiedStoreName;
      delete safe.qualifiedRequestProfileVersion;
      return safe;
    })
  };
}

function kspPersistAiModelPolicy_(environment, context, policy) {
  var normalized = kspNormalizeAiModelPolicy_(policy);
  kspAiModelPolicyAssert_(environment && typeof environment.writeAiSetting === 'function',
    'AI_MODEL_POLICY_WRITE_UNAVAILABLE');
  environment.writeAiSetting(KSP_AI_SETTINGS.MODEL_POLICY_JSON, JSON.stringify(normalized), environment.nowIso());
  if (context && context.settings) context.settings[KSP_AI_SETTINGS.MODEL_POLICY_JSON] = JSON.stringify(normalized);
  return normalized;
}

function kspAiModelQualificationSignature_(profile) {
  var value = profile || {};
  return JSON.stringify({
    provider: value.provider,
    modelId: value.modelId,
    thinkingProfiles: (value.thinkingProfiles || []).map(function (thinking) {
      return {
        thinkingProfileId: thinking.thinkingProfileId,
        rawValue: thinking.providerDefault ? null : thinking.rawValue,
        providerDefault: Boolean(thinking.providerDefault),
        enabled: thinking.enabled !== false
      };
    }),
    defaultThinkingProfileId: value.defaultThinkingProfileId,
    maxOutputTokens: value.maxOutputTokens
  });
}

function kspUpsertAiModelProfile_(policy, rawProfile, nowIso) {
  var current = kspNormalizeAiModelPolicy_(policy);
  var input = rawProfile || {};
  var profileId = kspAiModelPolicySafeId_(input.profileId, 'AI_MODEL_PROFILE_ID_INVALID');
  var existing = current.profiles.filter(function (item) { return item.profileId === profileId; })[0] || null;
  var nextRaw = kspDeepClone_(input);
  nextRaw.profileId = profileId;
  nextRaw.apiAccess = existing ? existing.apiAccess : KSP_AI_MODEL_ACCESS_STATES.UNKNOWN;
  nextRaw.qualification = existing ? existing.qualification : KSP_AI_MODEL_QUALIFICATION_STATES.UNQUALIFIED;
  nextRaw.qualifiedAt = existing ? existing.qualifiedAt : '';
  nextRaw.qualifiedStoreName = existing ? existing.qualifiedStoreName : '';
  nextRaw.qualifiedRequestProfileVersion = existing ? existing.qualifiedRequestProfileVersion : '';
  nextRaw.createdAt = existing ? existing.createdAt : nowIso;
  nextRaw.updatedAt = nowIso;
  if (existing && input.fileSearch === undefined) nextRaw.fileSearch = existing.fileSearch;
  if (!existing) nextRaw.fileSearch = false;
  var normalizedProfile = kspAiModelPolicyProfile_(nextRaw);
  var contractChanged = !existing || kspAiModelQualificationSignature_(existing) !==
    kspAiModelQualificationSignature_(normalizedProfile);
  if (existing && !contractChanged) {
    normalizedProfile.thinkingProfiles.forEach(function (thinking) {
      var prior = existing.thinkingProfiles.filter(function (item) {
        return item.thinkingProfileId === thinking.thinkingProfileId;
      })[0];
      if (!prior) return;
      thinking.qualification = prior.qualification;
      thinking.qualifiedAt = prior.qualifiedAt;
    });
  }
  if (contractChanged) {
    normalizedProfile.apiAccess = KSP_AI_MODEL_ACCESS_STATES.UNKNOWN;
    normalizedProfile.qualification = KSP_AI_MODEL_QUALIFICATION_STATES.UNQUALIFIED;
    normalizedProfile.fileSearch = false;
    normalizedProfile.qualifiedAt = '';
    normalizedProfile.qualifiedStoreName = '';
    normalizedProfile.qualifiedRequestProfileVersion = '';
    normalizedProfile.thinkingProfiles.forEach(function (thinking) {
      thinking.qualification = KSP_AI_MODEL_QUALIFICATION_STATES.UNQUALIFIED;
      thinking.qualifiedAt = '';
    });
  }
  var profiles = current.profiles.filter(function (item) { return item.profileId !== profileId; });
  if (normalizedProfile.isProviderDefault) {
    profiles.forEach(function (item) {
      if (item.provider === normalizedProfile.provider) item.isProviderDefault = false;
    });
  }
  profiles.push(normalizedProfile);
  return kspNormalizeAiModelPolicy_({
    schemaVersion: current.schemaVersion,
    updatedAt: nowIso,
    profiles: profiles
  });
}

function kspMarkAiModelProfileQualification_(policy, profileId, result, nowIso) {
  var current = kspNormalizeAiModelPolicy_(policy);
  var normalizedId = kspAiModelPolicySafeId_(profileId, 'AI_MODEL_PROFILE_ID_INVALID');
  var found = false;
  current.profiles.forEach(function (profile) {
    if (profile.profileId !== normalizedId) return;
    found = true;
    var thinkingResults = result && Array.isArray(result.thinkingResults) ? result.thinkingResults : null;
    profile.thinkingProfiles.forEach(function (thinking) {
      var tupleResult = thinkingResults ? thinkingResults.filter(function (item) {
        return item.thinkingProfileId === thinking.thinkingProfileId;
      })[0] : thinking.enabled ? result : null;
      if (!tupleResult) return;
      thinking.qualification = tupleResult.passed
        ? KSP_AI_MODEL_QUALIFICATION_STATES.QUALIFIED : KSP_AI_MODEL_QUALIFICATION_STATES.FAILED;
      thinking.qualifiedAt = tupleResult.passed ? nowIso : '';
    });
    var defaultThinking = profile.thinkingProfiles.filter(function (thinking) {
      return thinking.thinkingProfileId === profile.defaultThinkingProfileId;
    })[0];
    var defaultQualified = Boolean(defaultThinking && defaultThinking.enabled &&
      defaultThinking.qualification === KSP_AI_MODEL_QUALIFICATION_STATES.QUALIFIED);
    profile.apiAccess = result && result.accessible === false
      ? KSP_AI_MODEL_ACCESS_STATES.UNAVAILABLE : result && (result.accessible === true || result.passed)
        ? KSP_AI_MODEL_ACCESS_STATES.AVAILABLE : KSP_AI_MODEL_ACCESS_STATES.UNKNOWN;
    profile.qualification = defaultQualified
      ? KSP_AI_MODEL_QUALIFICATION_STATES.QUALIFIED : KSP_AI_MODEL_QUALIFICATION_STATES.FAILED;
    profile.fileSearch = defaultQualified;
    profile.qualifiedAt = defaultQualified ? nowIso : '';
    profile.qualifiedStoreName = defaultQualified && profile.provider === KSP_AI_PROVIDERS.GEMINI
      ? kspAiTrim_(result && result.storeName) : '';
    profile.qualifiedRequestProfileVersion = defaultQualified && profile.provider === KSP_AI_PROVIDERS.GEMINI
      ? kspAiTrim_(result && result.requestProfileVersion) : '';
    profile.updatedAt = nowIso;
  });
  kspAiModelPolicyAssert_(found, 'AI_MODEL_SELECTION_STALE');
  current.updatedAt = nowIso;
  return kspNormalizeAiModelPolicy_(current);
}
// ===== END src/134_AiModelPolicyContracts.gs =====

