function kspAttachPitchbookIndexAdapters_(meetingEnvironment, scriptProperties) {
  meetingEnvironment.completePitchbookRow = function (spreadsheetId, documentId, fileInfo, actor, nowIso) {
    return kspUpdatePitchbookRowLive_(spreadsheetId, documentId, function (row) {
      if (String(row.Status) === KSP_PITCHBOOK_STATUS.ACTIVE && row.File_ID) return row;
      row.File_ID = fileInfo.id;
      row.File_URL = fileInfo.url || '';
      row.Status = KSP_PITCHBOOK_STATUS.ACTIVE;
      row.Updated_At = nowIso;
      row.Updated_By = actor;
      row.AI_Index_Status = KSP_AI_INDEX_STATUS.PENDING;
      return row;
    });
  };

  meetingEnvironment.failPitchbookRow = function (spreadsheetId, documentId, fileInfo, actor, nowIso) {
    return kspUpdatePitchbookRowLive_(spreadsheetId, documentId, function (row) {
      if (String(row.Status) === KSP_PITCHBOOK_STATUS.ACTIVE) return row;
      if (fileInfo) {
        row.File_ID = fileInfo.id || row.File_ID;
        row.File_URL = fileInfo.url || row.File_URL;
      }
      row.Status = KSP_PITCHBOOK_STATUS.FAILED;
      row.Updated_At = nowIso;
      row.Updated_By = actor;
      return row;
    });
  };

  meetingEnvironment.clearPitchbookReservationIfComplete = function (spreadsheetId, batchId) {
    var spreadsheet = SpreadsheetApp.openById(spreadsheetId);
    var sheet = spreadsheet.getSheetByName(KSP_SHEET_NAMES.PITCHBOOK_INDEX);
    kspAssert_(sheet, 'SHEET_NOT_FOUND', 'Sheet not found: ' + KSP_SHEET_NAMES.PITCHBOOK_INDEX);
    var headers = kspReadHeadersFromSheet_(sheet);
    var rows = kspReadObjectsFromSheet_(sheet, headers).filter(function (row) {
      return String(row.Batch_ID) === String(batchId);
    });
    if (rows.length > 0 && rows.every(function (row) { return String(row.Status) === KSP_PITCHBOOK_STATUS.ACTIVE; })) {
      scriptProperties.deleteProperty(kspPitchbookReservationKey_(batchId));
      return true;
    }
    return false;
  };

}

function kspUpdatePitchbookRowLive_(spreadsheetId, documentId, updater) {
  var lock = LockService.getScriptLock();
  if (!lock.tryLock(KSP_DEFAULTS.LOCK_TIMEOUT_MS)) {
    var lockError = new Error('Could not acquire the Pitchbook Index update lock.');
    lockError.code = 'PITCHBOOK_INDEX_LOCK_TIMEOUT';
    throw lockError;
  }
  try {
    var spreadsheet = SpreadsheetApp.openById(spreadsheetId);
    var sheet = spreadsheet.getSheetByName(KSP_SHEET_NAMES.PITCHBOOK_INDEX);
    kspAssert_(sheet, 'SHEET_NOT_FOUND', 'Sheet not found: ' + KSP_SHEET_NAMES.PITCHBOOK_INDEX);
    var headers = kspReadHeadersFromSheet_(sheet);
    var rows = kspReadObjectsFromSheet_(sheet, headers);
    var indexes = [];
    rows.forEach(function (row, index) {
      if (String(row.Document_ID) === String(documentId)) indexes.push(index);
    });
    kspAssert_(indexes.length === 1, indexes.length === 0 ? 'PITCHBOOK_SLOT_NOT_FOUND' : 'DUPLICATE_KEY_ROWS',
      'Expected exactly one Pitchbook row for ' + documentId + '.');
    var updated = updater(kspDeepClone_(rows[indexes[0]]));
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
