function kspAttachPitchbookReservationAdapters_(meetingEnvironment, scriptProperties) {
  meetingEnvironment.reservePitchbookBatch = function (spreadsheetId, input, selected, totalBytes, actor, nowIso) {
    var lock = LockService.getScriptLock();
    if (!lock.tryLock(KSP_DEFAULTS.LOCK_TIMEOUT_MS)) {
      var lockError = new Error('Could not acquire the Pitchbook reservation lock.');
      lockError.code = 'PITCHBOOK_RESERVATION_LOCK_TIMEOUT';
      throw lockError;
    }
    try {
      var spreadsheet = SpreadsheetApp.openById(spreadsheetId);
      var indexSheet = spreadsheet.getSheetByName(KSP_SHEET_NAMES.PITCHBOOK_INDEX);
      kspAssert_(indexSheet, 'SHEET_NOT_FOUND', 'Sheet not found: ' + KSP_SHEET_NAMES.PITCHBOOK_INDEX);
      var headers = kspReadHeadersFromSheet_(indexSheet);
      var existingRows = kspReadObjectsFromSheet_(indexSheet, headers);
      var batchSetting = kspFindSettingRow_(spreadsheetId, 'NEXT_BATCH_ID');
      var documentSetting = kspFindSettingRow_(spreadsheetId, 'NEXT_DOCUMENT_ID');
      var batchSequence = kspReadPositiveSettingValue_(batchSetting, 'NEXT_BATCH_ID');
      var documentSequence = kspReadPositiveSettingValue_(documentSetting, 'NEXT_DOCUMENT_ID');
      var maxSequence = existingRows.reduce(function (maximum, row) {
        var sameContext = kspCanonicalPitchbookDateKey_(row.Date) === kspCanonicalPitchbookDateKey_(input.date) &&
          String(row.GP_ID || '') === input.gpId &&
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
      var values = rows.map(function (row) {
        return headers.map(function (header) {
          var value = row[header];
          return value === undefined || value === null ? '' : value;
        });
      });
      indexSheet.getRange(indexSheet.getLastRow() + 1, 1, values.length, headers.length).setValues(values);
      batchSetting.sheet.getRange(batchSetting.rowIndex, batchSetting.valueIndex + 1).setValue(String(batchSequence + 1));
      documentSetting.sheet.getRange(documentSetting.rowIndex, documentSetting.valueIndex + 1)
        .setValue(String(documentSequence + rows.length));
      if (batchSetting.updatedAtIndex !== -1) batchSetting.sheet.getRange(batchSetting.rowIndex, batchSetting.updatedAtIndex + 1).setValue(nowIso);
      if (documentSetting.updatedAtIndex !== -1) documentSetting.sheet.getRange(documentSetting.rowIndex, documentSetting.updatedAtIndex + 1).setValue(nowIso);

      var reservation = kspBuildPitchbookReservation_(batchId, input, rows, totalBytes);
      reservation.createdAt = nowIso;
      scriptProperties.setProperty(kspPitchbookReservationKey_(batchId), JSON.stringify(reservation));
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

function kspPitchbookReservationKey_(batchId) {
  return KSP_PITCHBOOK_RESERVATION_PREFIX + String(batchId || '');
}

function kspReadPositiveSettingValue_(setting, key) {
  var value = Number(setting.sheet.getRange(setting.rowIndex, setting.valueIndex + 1).getValue());
  kspAssert_(Number.isFinite(value) && value > 0 && Math.floor(value) === value,
    'COUNTER_VALUE_INVALID', 'Counter must be a positive integer: ' + key);
  return value;
}

