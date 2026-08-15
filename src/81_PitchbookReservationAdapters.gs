function kspAttachPitchbookReservationAdapters(meetingEnvironment, scriptProperties) {
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
      kspAssert(indexSheet, 'SHEET_NOT_FOUND', 'Sheet not found: ' + KSP_SHEET_NAMES.PITCHBOOK_INDEX);
      var headers = kspReadHeadersFromSheet(indexSheet);
      var existingRows = kspReadObjectsFromSheet(indexSheet, headers);
      var batchSetting = kspFindSettingRow(spreadsheetId, 'NEXT_BATCH_ID');
      var documentSetting = kspFindSettingRow(spreadsheetId, 'NEXT_DOCUMENT_ID');
      var batchSequence = kspReadPositiveSettingValue(batchSetting, 'NEXT_BATCH_ID');
      var documentSequence = kspReadPositiveSettingValue(documentSetting, 'NEXT_DOCUMENT_ID');
      var maxSequence = existingRows.reduce(function (maximum, row) {
        var sameContext = String(row.Date || '') === input.date &&
          String(row.GP_ID || '') === input.gpId &&
          String(row.Asset_Class_ID || '') === input.assetClassId &&
          String(row.Capital_Type_ID || '') === input.capitalTypeId;
        return sameContext ? Math.max(maximum, Number(row.Sequence_No) || 0) : maximum;
      }, 0);
      var batchId = kspFormatBatchId(batchSequence);
      var rows = input.files.map(function (file, index) {
        var sequenceNo = maxSequence + index + 1;
        var documentId = kspFormatDocumentId(documentSequence + index);
        var savedFilename = kspBuildPitchbookFilename(
          input,
          selected,
          sequenceNo,
          kspGetPitchbookExtension(file.originalFilename)
        );
        return kspBuildPitchbookPendingRow({
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
        kspAssert(!existingDocumentIds[String(row.Document_ID)], 'PITCHBOOK_DOCUMENT_ID_COLLISION',
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

      var reservation = kspBuildPitchbookReservation(batchId, input, rows, totalBytes);
      reservation.createdAt = nowIso;
      scriptProperties.setProperty(kspPitchbookReservationKey(batchId), JSON.stringify(reservation));
      return { rows: rows, reservation: reservation };
    } finally {
      lock.releaseLock();
    }
  };

  meetingEnvironment.getPitchbookReservation = function (batchId) {
    return kspSafeParseJson(
      scriptProperties.getProperty(kspPitchbookReservationKey(batchId)),
      kspPitchbookReservationKey(batchId)
    );
  };

}

function kspPitchbookReservationKey(batchId) {
  return KSP_PITCHBOOK_RESERVATION_PREFIX + String(batchId || '');
}

function kspReadPositiveSettingValue(setting, key) {
  var value = Number(setting.sheet.getRange(setting.rowIndex, setting.valueIndex + 1).getValue());
  kspAssert(Number.isFinite(value) && value > 0 && Math.floor(value) === value,
    'COUNTER_VALUE_INVALID', 'Counter must be a positive integer: ' + key);
  return value;
}

