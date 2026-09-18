function kspAttachPitchbookReservationAdapters_(meetingEnvironment, scriptProperties) {
  meetingEnvironment.reservePitchbookBatch = function (spreadsheetId, input, selected, totalBytes, actor, nowIso) {
    kspAssert_(input.requestId, 'PITCHBOOK_PREPARE_REQUEST_ID_REQUIRED', 'Prepare request IDが必要です。');
    var lock = LockService.getScriptLock();
    if (!lock.tryLock(KSP_DEFAULTS.LOCK_TIMEOUT_MS)) {
      var lockError = new Error('Could not acquire the Pitchbook reservation lock.');
      lockError.code = 'PITCHBOOK_RESERVATION_LOCK_TIMEOUT';
      throw lockError;
    }
    try {
      var requestKey = input.requestId ? kspPitchbookPrepareRequestKey_(input.requestId) : '';
      var semanticScope = kspNormalizePitchbookBatchInput_(input);
      delete semanticScope.expectedParentVersion;
      var scope = requestKey ? JSON.stringify([String(spreadsheetId), String(actor),
        input.prepareRequestScope || JSON.stringify(semanticScope)]) : '';
      var parent = kspRequirePitchbookParent_(meetingEnvironment, spreadsheetId,
        input.parentMeetingId, input.expectedParentVersion);
      kspAssertNoParentEditClaim_(scriptProperties, input.parentMeetingId, nowIso);
      var spreadsheet = SpreadsheetApp.openById(spreadsheetId);
      var indexSheet = spreadsheet.getSheetByName(KSP_SHEET_NAMES.PITCHBOOK_INDEX);
      kspAssert_(indexSheet, 'SHEET_NOT_FOUND', 'Sheet not found: ' + KSP_SHEET_NAMES.PITCHBOOK_INDEX);
      var headers = kspReadHeadersFromSheet_(indexSheet);
      var existingRows = kspReadObjectsFromSheet_(indexSheet, headers);
      var batchSetting = kspFindSettingRow_(spreadsheetId, 'NEXT_BATCH_ID');
      var documentSetting = kspFindSettingRow_(spreadsheetId, 'NEXT_DOCUMENT_ID');
      var batchSequence = kspReadPositiveSettingValue_(batchSetting, 'NEXT_BATCH_ID');
      var documentSequence = kspReadPositiveSettingValue_(documentSetting, 'NEXT_DOCUMENT_ID');
      var prior = requestKey ? kspSafeParseJson_(scriptProperties.getProperty(requestKey), requestKey) : null;
      if (prior) {
        kspAssert_(prior.scope === scope, 'PITCHBOOK_PREPARE_REQUEST_CONFLICT',
          'Prepare request IDの利用者・内容・親記録が一致しません。');
        return kspReadbackPitchbookPrepare_(prior, existingRows, scriptProperties, batchSequence, documentSequence);
      }
      var generation = kspPitchbookPrepareGeneration_(batchSequence);
      if (requestKey) kspAssert_(kspPitchbookRequestGeneration_(input.requestId) === generation,
        'PITCHBOOK_PREPARE_REQUEST_RETIRED', '古い予約tokenは再採番できません。保存結果を確認してください。');
      // Only a new allocation derives defaults from the current parent. Replay keeps
      // its original immutable row context, even after unrelated parent links advance CAS.
      kspApplyPitchbookParentContext_(input, parent);
      if (requestKey) {
        var catalog = kspBuildPitchbookCatalog_(
          meetingEnvironment.readRows(spreadsheetId, KSP_SHEET_NAMES.GP_MASTER),
          meetingEnvironment.readRows(spreadsheetId, KSP_SHEET_NAMES.OPTION_MASTER));
        var validation = kspValidatePitchbookBatchInput_(input, catalog);
        selected = validation.selected;
        totalBytes = validation.totalBytes;
      }
      // A crashed allocation must not let a different request reuse its counters.
      var properties = scriptProperties.getProperties();
      var pendingKeys = Object.keys(properties).filter(function (key) {
        return key.indexOf(KSP_PITCHBOOK_RESERVATION_PREFIX + 'REQUEST_') === 0;
      });
      var unresolved = 0;
      pendingKeys.forEach(function (key) {
        var intent = kspSafeParseJson_(properties[key], key);
        if (intent && intent.state !== 'COMPLETE') {
          unresolved += 1;
          kspAssert_(unresolved <= 32, 'PITCHBOOK_PREPARE_UNCERTAIN', '未確定の予約を確認してください。');
          kspAssert_(intent.spreadsheetId === String(spreadsheetId), 'PITCHBOOK_PREPARE_UNCERTAIN',
            '未確定の予約先を確認してください。');
          kspReadbackPitchbookPrepare_(intent, existingRows, scriptProperties, batchSequence, documentSequence);
        }
      });
      var retireKeys = kspPitchbookPrepareRetirementKeys_(properties, pendingKeys, generation);
      if (requestKey) kspAssert_(pendingKeys.length - retireKeys.length < 32,
        'PITCHBOOK_PREPARE_UNCERTAIN', '未確定の予約履歴を確認してください。');
      var batchKeys = Object.keys(properties).filter(function (key) {
        return /^BAT-\d{6}$/.test(key.slice(KSP_PITCHBOOK_RESERVATION_PREFIX.length)) &&
          key.indexOf(KSP_PITCHBOOK_RESERVATION_PREFIX) === 0;
      });
      var completedBatchKeys = batchKeys.filter(function (key) {
        var batchId = key.slice(KSP_PITCHBOOK_RESERVATION_PREFIX.length);
        var rows = existingRows.filter(function (row) { return String(row.Batch_ID) === batchId; });
        return rows.length > 0 && rows.every(function (row) {
          return row.Status === KSP_PITCHBOOK_STATUS.ACTIVE && row.File_ID && row.File_URL;
        });
      });
      kspAssert_(batchKeys.length - completedBatchKeys.length < 32,
        'PITCHBOOK_PREPARE_UPLOAD_BACKLOG', '未完了の資料登録を完了してから追加してください。');
      var maxSequence = existingRows.reduce(function (maximum, row) {
        var sameContext = kspCanonicalBusinessDate_(row.Date) === kspCanonicalBusinessDate_(input.date) &&
          String(row.GP_ID || '') === input.gpId &&
          kspMeetingCounterpartyType_(row) === input.counterpartyType &&
          kspMeetingCounterpartyId_(row) === input.counterpartyId &&
          String(row.Asset_Class_ID || '') === input.assetClassId &&
          String(row.Capital_Type_ID || '') === input.capitalTypeId;
        return sameContext ? Math.max(maximum, Number(row.Sequence_No) || 0) : maximum;
      }, 0);
      var batchId = kspFormatBatchId_(batchSequence);
      var rows = input.files.map(function (file, index) {
        var sequenceNo = maxSequence + index + 1;
        var documentId = kspFormatDocumentId_(documentSequence + index);
        var savedFilename = kspBuildPitchbookFilename_(
          input,
          selected,
          sequenceNo,
          kspGetPitchbookExtension_(file.originalFilename)
        );
        return kspBuildPitchbookPendingRow_({
          batchId: batchId,
          documentId: documentId,
          sequenceNo: sequenceNo,
          input: input,
          selected: selected,
          file: file,
          savedFilename: savedFilename,
          actor: actor,
          nowIso: nowIso
        });
      });
      var existingDocumentIds = {};
      existingRows.forEach(function (row) { existingDocumentIds[String(row.Document_ID)] = true; });
      rows.forEach(function (row) {
        kspAssert_(!existingDocumentIds[String(row.Document_ID)], 'PITCHBOOK_DOCUMENT_ID_COLLISION',
          'Document ID already exists: ' + row.Document_ID);
      });
      kspAssert_(!existingRows.some(function (row) { return String(row.Batch_ID) === batchId; }),
        'PITCHBOOK_BATCH_ID_COLLISION', 'Batch IDが既に存在します。');
      var values = rows.map(function (row) {
        return headers.map(function (header) {
          var value = row[header];
          return value === undefined || value === null ? '' : value;
        });
      });
      var reservation = kspBuildPitchbookReservation_(batchId, input, rows, totalBytes);
      reservation.createdAt = nowIso;
      var intent = requestKey ? {
        state: 'INTENT', scope: scope, spreadsheetId: String(spreadsheetId),
        nextBatch: batchSequence + 1, nextDocument: documentSequence + rows.length,
        reservation: reservation, manifests: rows.map(kspPitchbookPrepareRowManifest_)
      } : null;
      if (!intent) retireKeys.concat(completedBatchKeys).forEach(function (key) { scriptProperties.deleteProperty(key); });
      if (intent) {
        var intentText = JSON.stringify(intent);
        kspAssert_(encodeURIComponent(intentText).replace(/%[0-9A-F]{2}/g, 'x').length <= 8000,
          'PITCHBOOK_PREPARE_INTENT_TOO_LARGE', '予約情報が大きすぎます。ファイル数を減らしてください。');
        // NEXT_BATCH_ID is the existing monotonic retired-token guard. No clock,
        // per-token tombstones, new sheet or unbounded historical properties.
        retireKeys.concat(completedBatchKeys).forEach(function (key) { scriptProperties.deleteProperty(key); });
        scriptProperties.setProperty(requestKey, intentText);
        kspAssert_(scriptProperties.getProperty(requestKey) === intentText,
          'PITCHBOOK_PREPARE_UNCERTAIN', '予約intentを確認できません。');
      }
      // Durable reservation precedes counter/row mutation; never retry a partial write blindly.
      scriptProperties.setProperty(kspPitchbookReservationKey_(batchId), JSON.stringify(reservation));
      batchSetting.sheet.getRange(batchSetting.rowIndex, batchSetting.valueIndex + 1).setValue(String(batchSequence + 1));
      documentSetting.sheet.getRange(documentSetting.rowIndex, documentSetting.valueIndex + 1)
        .setValue(String(documentSequence + rows.length));
      if (batchSetting.updatedAtIndex !== -1) batchSetting.sheet.getRange(batchSetting.rowIndex, batchSetting.updatedAtIndex + 1).setValue(nowIso);
      if (documentSetting.updatedAtIndex !== -1) documentSetting.sheet.getRange(documentSetting.rowIndex, documentSetting.updatedAtIndex + 1).setValue(nowIso);
      indexSheet.getRange(indexSheet.getLastRow() + 1, 1, values.length, headers.length).setValues(values);
      if (intent) {
        SpreadsheetApp.flush();
        kspReadbackPitchbookPrepare_(intent, kspReadObjectsFromSheet_(indexSheet, headers), scriptProperties,
          kspReadPositiveSettingValue_(batchSetting, 'NEXT_BATCH_ID'),
          kspReadPositiveSettingValue_(documentSetting, 'NEXT_DOCUMENT_ID'));
        intent.state = 'COMPLETE';
        scriptProperties.setProperty(requestKey, JSON.stringify(intent));
      }
      return { rows: rows, reservation: reservation };
    } finally {
      lock.releaseLock();
    }
  };

  meetingEnvironment.getPitchbookReservation = function (batchId) {
    return kspSafeParseJson_(
      scriptProperties.getProperty(kspPitchbookReservationKey_(batchId)),
      kspPitchbookReservationKey_(batchId)
    );
  };

}

function kspPitchbookPrepareGeneration_(nextBatch) {
  kspAssert_(Number.isSafeInteger(Number(nextBatch)) && Number(nextBatch) > 0,
    'COUNTER_VALUE_INVALID', 'Batch counterを確認してください。');
  return Math.floor((Number(nextBatch) - 1) / 16) + 1;
}

function kspPitchbookRequestGeneration_(requestId) {
  var match = /^g([1-9]\d*)_[A-Za-z0-9_-]{8,96}$/.exec(String(requestId || ''));
  return match && Number.isSafeInteger(Number(match[1])) ? Number(match[1]) : 0;
}

function kspPitchbookPrepareRetirementKeys_(properties, keys, generation) {
  var prefix = KSP_PITCHBOOK_RESERVATION_PREFIX + 'REQUEST_';
  var eligible = keys.filter(function (key) {
    var intent = kspSafeParseJson_(properties[key], key);
    return intent && intent.state === 'COMPLETE' &&
      kspPitchbookRequestGeneration_(key.slice(prefix.length)) < generation;
  }).sort(function (left, right) {
    var a = kspSafeParseJson_(properties[left], left), b = kspSafeParseJson_(properties[right], right);
    return Number(a.nextBatch) - Number(b.nextBatch) || left.localeCompare(right);
  });
  // Retain the latest 32 requests (at least the current 16-admission generation).
  return eligible.slice(0, Math.max(0, keys.length - 31));
}

function kspPitchbookPrepareRequestKey_(requestId) {
  kspAssert_(/^[A-Za-z0-9_-]{8,128}$/.test(String(requestId || '')),
    'PITCHBOOK_PREPARE_REQUEST_ID_INVALID', 'Prepare request IDが不正です。');
  return KSP_PITCHBOOK_RESERVATION_PREFIX + 'REQUEST_' + requestId;
}

function kspPitchbookPrepareRowManifest_(row) {
  return JSON.stringify(['Document_ID', 'Batch_ID', 'Parent_Meeting_ID', 'Counterparty_Type', 'Counterparty_ID',
    'Related_GP_IDs', 'GP_ID', 'Asset_Class_ID', 'Capital_Type_ID', 'Fund_Strategy', 'Sequence_No',
    'Original_Filename', 'Saved_Filename', 'Created_By'].map(function (field) {
      return String(row[field] === undefined || row[field] === null ? '' : row[field]);
    }).concat([kspCanonicalBusinessDate_(row.Date), kspCanonicalInstantIso_(row.Created_At)]));
}

function kspReadbackPitchbookPrepare_(intent, existingRows, properties, nextBatch, nextDocument) {
  var expected = intent && intent.reservation;
  var uncertain = 'PITCHBOOK_PREPARE_UNCERTAIN';
  kspAssert_(expected && expected.files && expected.files.length >= 1 && expected.files.length <= KSP_PITCHBOOK_LIMITS.FILE_COUNT &&
    intent.manifests && intent.manifests.length === expected.files.length &&
    nextBatch >= intent.nextBatch && nextDocument >= intent.nextDocument, uncertain, '予約の確定状態を確認できません。');
  var rows = existingRows.filter(function (row) { return String(row.Batch_ID) === expected.batchId; });
  kspAssert_(rows.length === expected.files.length, uncertain, '予約row集合が一致しません。');
  var ordered = expected.files.map(function (descriptor, index) {
    var matches = existingRows.filter(function (row) { return String(row.Document_ID) === descriptor.documentId; });
    kspAssert_(matches.length === 1 && kspPitchbookPrepareRowManifest_(matches[0]) === intent.manifests[index],
      uncertain, '予約rowの内容が一致しません。');
    var row = matches[0];
    kspAssert_([KSP_PITCHBOOK_STATUS.PENDING, KSP_PITCHBOOK_STATUS.FAILED, KSP_PITCHBOOK_STATUS.ACTIVE].indexOf(String(row.Status)) !== -1 &&
      (String(row.Status) !== KSP_PITCHBOOK_STATUS.ACTIVE || (row.File_ID && row.File_URL)),
      uncertain, '予約rowの状態が不正です。');
    return row;
  });
  var key = kspPitchbookReservationKey_(expected.batchId);
  var current = kspSafeParseJson_(properties.getProperty(key), key);
  if (!current) {
    kspAssert_(ordered.every(function (row) { return row.Status === KSP_PITCHBOOK_STATUS.ACTIVE && row.File_ID && row.File_URL; }),
      uncertain, '未完了のreservationがありません。');
    current = expected; // Completed-upload cleanup is read-only; do not recreate the property.
  }
  var identity = function (reservation) {
    return JSON.stringify([reservation.batchId, reservation.parentMeetingId, Number(reservation.parentVersion),
      Number(reservation.totalBytes), (reservation.files || []).map(function (file) {
        return [file.documentId, Number(file.ordinal), Number(file.sizeBytes), file.mimeType];
      })]);
  };
  kspAssert_(identity(current) === identity(expected), uncertain, 'Reservationの内容が一致しません。');
  return { rows: ordered, reservation: current, idempotentReplay: true };
}

function kspPitchbookReservationKey_(batchId) {
  return KSP_PITCHBOOK_RESERVATION_PREFIX + String(batchId || '');
}

function kspReadPositiveSettingValue_(setting, key) {
  var value = Number(setting.sheet.getRange(setting.rowIndex, setting.valueIndex + 1).getValue());
  kspAssert_(Number.isFinite(value) && value > 0 && Math.floor(value) === value,
    'COUNTER_VALUE_INVALID', 'Counter must be a positive integer: ' + key);
  return value;
}

