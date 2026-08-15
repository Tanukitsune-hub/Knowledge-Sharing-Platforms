function kspUploadPitchbookFile(environment, rawInput) {
  var warnings = [];
  var actor = kspGetPitchbookActorSafely(environment, warnings);
  var context = null;
  var input = kspNormalizePitchbookUploadInput(rawInput);
  var row = null;
  var reservation = null;
  var reservedFile = null;
  var fileInfo = null;
  var claim = null;
  var reservationValidated = false;
  try {
    context = kspLoadPitchbookRuntimeContext(environment);
    row = environment.findRowByKey(context.backendSpreadsheetId, KSP_SHEET_NAMES.PITCHBOOK_INDEX,
      'Document_ID', input.documentId);
    if (row && String(row.Status) === KSP_PITCHBOOK_STATUS.ACTIVE && row.File_ID) {
      kspAssert(String(row.Batch_ID) === input.batchId, 'PITCHBOOK_BATCH_CONFLICT', 'Batch IDが一致しません。');
      kspAssert(String(row.Original_Filename) === input.originalFilename, 'PITCHBOOK_FILENAME_CONFLICT',
        '選択されたファイル名が登録済み資料と一致しません。');
      return { ok: true, workId: KSP_PITCHBOOK_WORK_ID,
        slot: { batchId: String(row.Batch_ID), documentId: String(row.Document_ID),
          sequenceNo: Number(row.Sequence_No || 0), originalFilename: String(row.Original_Filename || ''),
          savedFilename: String(row.Saved_Filename || ''), status: String(row.Status),
          fileId: String(row.File_ID), fileUrl: String(row.File_URL || ''),
          sizeBytes: input.sizeBytes, mimeType: input.mimeType, slotFingerprint: input.slotFingerprint },
        idempotentReplay: true, warnings: warnings };
    }

    reservation = environment.getPitchbookReservation(input.batchId);
    reservedFile = kspFindPitchbookReservationFile(reservation, input.documentId);
    kspValidatePitchbookUploadInput(input, row, reservation);
    reservationValidated = true;

    var decoded = environment.decodeBase64(input.base64Data);
    kspAssert(decoded && decoded.length === input.sizeBytes, 'PITCHBOOK_FILE_SIZE_MISMATCH',
      '送信されたファイルサイズが選択時のサイズと一致しません。');
    kspAssert(decoded.length <= KSP_PITCHBOOK_LIMITS.FILE_BYTES, 'PITCHBOOK_FILE_SIZE_EXCEEDED',
      '1ファイルの上限は25MBです。');

    claim = environment.claimPitchbookUpload(input.batchId, input.documentId, environment.nowIso());
    if (claim.fileInfo) {
      fileInfo = claim.fileInfo;
    } else {
      try {
        fileInfo = environment.createOrReusePitchbookFile(
          context.pitchbooksFolderId,
          row,
          decoded,
          input.mimeType
        );
        environment.completePitchbookUploadClaim(
          input.batchId,
          input.documentId,
          claim.claimToken,
          fileInfo,
          environment.nowIso()
        );
      } catch (uploadError) {
        environment.releasePitchbookUploadClaim(
          input.batchId,
          input.documentId,
          claim.claimToken,
          uploadError.message || String(uploadError),
          environment.nowIso()
        );
        throw uploadError;
      }
    }

    row = environment.completePitchbookRow(
      context.backendSpreadsheetId,
      input.documentId,
      fileInfo,
      actor,
      environment.nowIso()
    );
    environment.clearPitchbookReservationIfComplete(
      context.backendSpreadsheetId,
      input.batchId
    );

    var auditWarning = kspTryAppendPitchbookAudit(environment, context.auditSpreadsheetId, {
      timestamp: environment.nowIso(), actor: actor, result: KSP_AUDIT_RESULTS.SUCCESS,
      action: fileInfo.reused ? KSP_PITCHBOOK_ACTIONS.RETRY : KSP_PITCHBOOK_ACTIONS.REGISTER,
      row: row
    });
    if (auditWarning) warnings.push(auditWarning);

    return { ok: true, workId: KSP_PITCHBOOK_WORK_ID,
      slot: kspPitchbookSlotFromRow(row, reservedFile, reservation.totalBytes),
      reusedFile: Boolean(fileInfo.reused), warnings: warnings };
  } catch (error) {
    if (context && row && reservationValidated) {
      try {
        row = environment.failPitchbookRow(
          context.backendSpreadsheetId,
          input.documentId,
          fileInfo,
          actor,
          environment.nowIso()
        );
      } catch (markError) {
        warnings.push({ code: 'PITCHBOOK_FAIL_STATUS_WRITE_FAILED', message: markError.message || String(markError) });
      }
      var auditWarning = kspTryAppendPitchbookAudit(environment, context.auditSpreadsheetId, {
        timestamp: environment.nowIso(), actor: actor, result: KSP_AUDIT_RESULTS.FAILURE,
        action: KSP_PITCHBOOK_ACTIONS.RETRY, row: row || {}, batchId: input.batchId,
        documentId: input.documentId, errorCode: kspGetErrorCode(error), errorMessage: error.message || String(error)
      });
      if (auditWarning) warnings.push(auditWarning);
    }
    return {
      ok: false,
      workId: KSP_PITCHBOOK_WORK_ID,
      error: { code: kspGetErrorCode(error), message: error.message || String(error) },
      retry: row ? kspPitchbookSlotFromRow(row, reservedFile, reservation ? reservation.totalBytes : 0) : null,
      warnings: warnings
    };
  }
}
