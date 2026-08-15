function kspAttachPitchbookClaimAdapters(meetingEnvironment, scriptProperties) {
  meetingEnvironment.claimPitchbookUpload = function (batchId, documentId, nowIso) {
    var lock = LockService.getScriptLock();
    if (!lock.tryLock(KSP_DEFAULTS.LOCK_TIMEOUT_MS)) {
      var lockError = new Error('Could not acquire the Pitchbook upload claim lock.');
      lockError.code = 'PITCHBOOK_UPLOAD_CLAIM_LOCK_TIMEOUT';
      throw lockError;
    }
    try {
      var key = kspPitchbookReservationKey(batchId);
      var reservation = kspSafeParseJson(scriptProperties.getProperty(key), key);
      kspAssert(reservation, 'PITCHBOOK_RESERVATION_NOT_FOUND', 'Batch reservationが見つかりません。');
      var file = kspFindPitchbookReservationFile(reservation, documentId);
      kspAssert(file, 'PITCHBOOK_RESERVATION_FILE_NOT_FOUND', 'Document reservationが見つかりません。');
      if (file.fileId) {
        return { claimToken: '', fileInfo: { id: file.fileId, url: file.fileUrl || '', reused: true } };
      }
      if (file.uploadState === 'UPLOADING' && file.claimedAt) {
        var claimedAtMs = new Date(file.claimedAt).getTime();
        var nowMs = new Date(nowIso).getTime();
        if (Number.isFinite(claimedAtMs) && Number.isFinite(nowMs) && nowMs - claimedAtMs < KSP_PITCHBOOK_UPLOAD_CLAIM_TTL_MS) {
          var inProgress = new Error('同じファイルのアップロードが進行中です。少し待って再試行してください。');
          inProgress.code = 'PITCHBOOK_UPLOAD_IN_PROGRESS';
          throw inProgress;
        }
      }
      file.uploadState = 'UPLOADING';
      file.claimToken = Utilities.getUuid();
      file.claimedAt = nowIso;
      scriptProperties.setProperty(key, JSON.stringify(reservation));
      return { claimToken: file.claimToken, fileInfo: null };
    } finally {
      lock.releaseLock();
    }
  };

  meetingEnvironment.completePitchbookUploadClaim = function (batchId, documentId, claimToken, fileInfo, nowIso) {
    kspUpdatePitchbookReservationClaim(scriptProperties, batchId, documentId, claimToken, function (file) {
      file.uploadState = 'UPLOADED';
      file.claimToken = '';
      file.claimedAt = nowIso;
      file.fileId = fileInfo.id;
      file.fileUrl = fileInfo.url || '';
    });
  };

  meetingEnvironment.releasePitchbookUploadClaim = function (batchId, documentId, claimToken, errorMessage, nowIso) {
    kspUpdatePitchbookReservationClaim(scriptProperties, batchId, documentId, claimToken, function (file) {
      file.uploadState = 'FAILED';
      file.claimToken = '';
      file.claimedAt = nowIso;
      file.lastError = String(errorMessage || '');
    });
  };

}

function kspUpdatePitchbookReservationClaim(scriptProperties, batchId, documentId, claimToken, updater) {
  var lock = LockService.getScriptLock();
  if (!lock.tryLock(KSP_DEFAULTS.LOCK_TIMEOUT_MS)) {
    var lockError = new Error('Could not acquire the Pitchbook reservation update lock.');
    lockError.code = 'PITCHBOOK_RESERVATION_UPDATE_LOCK_TIMEOUT';
    throw lockError;
  }
  try {
    var key = kspPitchbookReservationKey(batchId);
    var reservation = kspSafeParseJson(scriptProperties.getProperty(key), key);
    kspAssert(reservation, 'PITCHBOOK_RESERVATION_NOT_FOUND', 'Batch reservationが見つかりません。');
    var file = kspFindPitchbookReservationFile(reservation, documentId);
    kspAssert(file, 'PITCHBOOK_RESERVATION_FILE_NOT_FOUND', 'Document reservationが見つかりません。');
    if (claimToken) {
      kspAssert(String(file.claimToken || '') === String(claimToken), 'PITCHBOOK_UPLOAD_CLAIM_CONFLICT',
        'Upload claimが一致しません。');
    }
    updater(file);
    scriptProperties.setProperty(key, JSON.stringify(reservation));
  } finally {
    lock.releaseLock();
  }
}

