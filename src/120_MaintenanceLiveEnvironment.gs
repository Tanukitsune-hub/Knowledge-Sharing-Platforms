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
      var nowMs = Date.parse(nowIso);
      if (existingClaim && Number(existingClaim.expiresAtMs || 0) > nowMs) {
        var busyError = new Error('このレコードは別の編集処理中です。少し待って再試行してください。');
        busyError.code = 'RECORD_EDIT_IN_PROGRESS';
        throw busyError;
      }
      var state = environment.getInstallationState();
      var spreadsheetId = state.resources[KSP_RESOURCE_KEYS.BACKEND_SPREADSHEET];
      var found = kspMaintenanceFindSheetRow_(spreadsheetId, sheetName, keyColumn, recordId);
      kspAssert_(found, 'RECORD_NOT_FOUND', '編集対象が見つかりません。');
      kspAssert_(String(found.row[tokenColumn]) === String(expectedToken),
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
      kspAssert_(String(found.row[tokenColumn]) === String(expectedToken),
        'STALE_RECORD_VERSION', '他の利用者が先に更新しています。最新情報を読み直してください。');
      kspMaintenanceWriteSheetRow_(found.sheet, found.headers, found.rowNumber, updatedRow);
      scriptProperties.deleteProperty(claim.claimKey);
      return updatedRow;
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
      kspAssert_(String(found.row[tokenColumn]) === String(expectedToken),
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
      kspAssert_(String(found.row.Updated_At || '') === String(expectedUpdatedAt || ''),
        'STALE_RECORD_VERSION', '他の利用者が先に更新しています。');
      if (targetStatus === KSP_STATUS.ACTIVE) {
        kspAssert_(String(found.row.File_ID || ''), 'PITCHBOOK_AUTHORITATIVE_FILE_MISSING',
          'Drive原本がない資料はActiveに戻せません。');
      }
      var before = kspDeepClone_(found.row);
      var after = kspDeepClone_(found.row);
      after.Status = targetStatus;
      after.Updated_At = nowIso;
      after.Updated_By = actor;
      after.AI_Index_Status = KSP_AI_INDEX_STATUS.PENDING;
      after.AI_Last_Error = '';
      kspMaintenanceWriteSheetRow_(found.sheet, found.headers, found.rowNumber, after);
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
      var sheetName = input.entity === KSP_MASTER_ENTITY.GP
        ? KSP_SHEET_NAMES.GP_MASTER : KSP_SHEET_NAMES.OPTION_MASTER;
      var spreadsheet = SpreadsheetApp.openById(spreadsheetId);
      var sheet = spreadsheet.getSheetByName(sheetName);
      kspAssert_(sheet, 'SHEET_NOT_FOUND', 'Master sheetがありません。');
      var headers = kspReadHeadersFromSheet_(sheet);
      var rows = kspReadObjectsFromSheet_(sheet, headers);
      var keyColumn = input.entity === KSP_MASTER_ENTITY.GP ? 'GP_ID' : 'Option_ID';
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
        if (input.entity === KSP_MASTER_ENTITY.GP) {
          after = {
            GP_ID: kspNextGpId_(rows), GP_Name: input.name, Status: KSP_STATUS.ACTIVE,
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

      var matches = rows.filter(function (row) { return String(row[keyColumn]) === input.id; });
      kspAssert_(matches.length === 1, 'MASTER_NOT_FOUND', '対象Masterが見つかりません。');
      before = kspDeepClone_(matches[0]);
      after = kspDeepClone_(matches[0]);

      if (input.action === KSP_MASTER_MUTATION.RENAME) {
        var renameType = input.entity === KSP_MASTER_ENTITY.GP ? '' : String(after.Type || '');
        kspAssert_(!kspFindNormalizedMasterDuplicate_(rows, input.entity, renameType, input.name, input.id),
          'MASTER_DUPLICATE_NAME', '同じ名称のMasterが既に存在します。');
        if (input.entity === KSP_MASTER_ENTITY.GP) after.GP_Name = input.name;
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
      var iso = value instanceof Date ? value.toISOString() : String(value || '');
      if (iso && iso < cutoffIso) rowNumbers.push(index + 2);
    });
    rowNumbers.sort(function (a, b) { return b - a; }).forEach(function (rowNumber) {
      sheet.deleteRow(rowNumber);
    });
    return { deletedRows: rowNumbers.length };
  };

  return environment;
}
