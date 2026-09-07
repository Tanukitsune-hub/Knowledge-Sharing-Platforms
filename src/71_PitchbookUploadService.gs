function kspUploadPitchbookFile_(environment, rawInput) {
  var warnings = [];
  var actor = kspGetPitchbookActorSafely_(environment, warnings);
  var context = null;
  var input = kspNormalizePitchbookUploadInput_(rawInput);
  var row = null;
  var reservation = null;
  var reservedFile = null;
  var fileInfo = null;
  var claim = null;
  var reservationValidated = false;
  var parentClaim = null;
  try {
    context = kspLoadPitchbookRuntimeContext_(environment);
    row = environment.findRowByKey(context.backendSpreadsheetId, KSP_SHEET_NAMES.PITCHBOOK_INDEX,
      'Document_ID', input.documentId);
    kspAssert_(row && row.Parent_Meeting_ID && String(row.Parent_Meeting_ID) === input.parentMeetingId,
      'PITCHBOOK_PARENT_CONFLICT', '資料の登録元記録が一致しません。');
    var parent = environment.findRowByKey(context.backendSpreadsheetId, KSP_SHEET_NAMES.MEETING_INDEX,
      'Meeting_ID', input.parentMeetingId);
    kspAssert_(parent && parent.Status === KSP_STATUS.ACTIVE, 'PITCHBOOK_PARENT_UNAVAILABLE', '親記録を利用できません。');
    if (row && String(row.Status) === KSP_PITCHBOOK_STATUS.ACTIVE && row.File_ID) {
      kspAssert_(String(row.Batch_ID) === input.batchId, 'PITCHBOOK_BATCH_CONFLICT', 'Batch IDが一致しません。');
      kspAssert_(String(row.Original_Filename) === input.originalFilename, 'PITCHBOOK_FILENAME_CONFLICT',
        '選択されたファイル名が登録済み資料と一致しません。');
      return kspFinishPitchbookLink_(environment, input, { ok: true, workId: KSP_PITCHBOOK_WORK_ID,
        slot: { batchId: String(row.Batch_ID), documentId: String(row.Document_ID),
          sequenceNo: Number(row.Sequence_No || 0), originalFilename: String(row.Original_Filename || ''),
          savedFilename: String(row.Saved_Filename || ''), status: String(row.Status),
          fileId: String(row.File_ID), fileUrl: String(row.File_URL || ''),
          sizeBytes: input.sizeBytes, mimeType: input.mimeType, slotFingerprint: input.slotFingerprint },
        idempotentReplay: true, warnings: warnings });
    }

    reservation = environment.getPitchbookReservation(input.batchId);
    reservedFile = kspFindPitchbookReservationFile_(reservation, input.documentId);
    kspValidatePitchbookUploadInput_(input, row, reservation);
    kspRequirePitchbookParent_(environment, context.backendSpreadsheetId, input.parentMeetingId, input.expectedParentVersion);
    parentClaim = environment.claimRecordEdit('Meeting', input.parentMeetingId, KSP_SHEET_NAMES.MEETING_INDEX,
      'Meeting_ID', 'Version', input.expectedParentVersion, environment.nowIso(), KSP_MAINTENANCE_LIMITS.EDIT_CLAIM_TTL_MS);
    kspAssert_(parentClaim.row.Status === KSP_STATUS.ACTIVE, 'PITCHBOOK_PARENT_UNAVAILABLE', '親記録を利用できません。');
    reservationValidated = true;

    var decoded = environment.decodeBase64(input.base64Data);
    kspAssert_(decoded && decoded.length === input.sizeBytes, 'PITCHBOOK_FILE_SIZE_MISMATCH',
      '送信されたファイルサイズが選択時のサイズと一致しません。');
    kspAssert_(decoded.length <= KSP_PITCHBOOK_LIMITS.FILE_BYTES, 'PITCHBOOK_FILE_SIZE_EXCEEDED',
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
      environment.nowIso(),
      { parentMeetingId: input.parentMeetingId, expectedParentVersion: input.expectedParentVersion, parentClaim: parentClaim }
    );
    environment.clearPitchbookReservationIfComplete(
      context.backendSpreadsheetId,
      input.batchId
    );

    var auditWarning = kspTryAppendPitchbookAudit_(environment, context.auditSpreadsheetId, {
      timestamp: environment.nowIso(), actor: actor, result: KSP_AUDIT_RESULTS.SUCCESS,
      action: fileInfo.reused ? KSP_PITCHBOOK_ACTIONS.RETRY : KSP_PITCHBOOK_ACTIONS.REGISTER,
      row: row
    });
    if (auditWarning) warnings.push(auditWarning);

    environment.releaseRecordEditClaim(parentClaim);
    parentClaim = null;
    return kspFinishPitchbookLink_(environment, input, { ok: true, workId: KSP_PITCHBOOK_WORK_ID,
      slot: kspPitchbookSlotFromRow_(row, reservedFile, reservation.totalBytes),
      reusedFile: Boolean(fileInfo.reused), warnings: warnings });
  } catch (error) {
    // Saved file metadata remains in the reservation after a completion/CAS conflict.
    // Never downgrade newer state; retry must reuse the file and fresh parent state.
    if (context && row && reservationValidated && !fileInfo &&
        !/^(PITCHBOOK_COMPLETION_CONFLICT|PITCHBOOK_INDEX_LOCK_TIMEOUT|PITCHBOOK_UPLOAD_CLAIM_CONFLICT|RECORD_EDIT_CLAIM_LOST|STALE_RECORD_VERSION)$/.test(kspGetErrorCode_(error))) {
      try {
        row = environment.failPitchbookRow(
          context.backendSpreadsheetId,
          input.documentId,
          fileInfo,
          actor,
          environment.nowIso()
        );
      } catch (markError) {
        warnings.push({ code: 'PITCHBOOK_FAIL_STATUS_WRITE_FAILED', message: kspSafeOperationalWarning_('PITCHBOOK_FAIL_STATUS_WRITE_FAILED') });
      }
      var auditWarning = kspTryAppendPitchbookAudit_(environment, context.auditSpreadsheetId, {
        timestamp: environment.nowIso(), actor: actor, result: KSP_AUDIT_RESULTS.FAILURE,
        action: KSP_PITCHBOOK_ACTIONS.RETRY, row: row || {}, batchId: input.batchId,
        documentId: input.documentId, errorCode: kspGetErrorCode_(error), errorMessage: kspSafePublicErrorMessage_(kspGetErrorCode_(error), 'PITCHBOOK')
      });
      if (auditWarning) warnings.push(auditWarning);
    }
    return {
      ok: false,
      workId: KSP_PITCHBOOK_WORK_ID,
      error: { code: kspGetErrorCode_(error), message: kspSafePublicErrorMessage_(kspGetErrorCode_(error), 'PITCHBOOK') },
      retry: row ? kspPitchbookSlotFromRow_(row, reservedFile, reservation ? reservation.totalBytes : 0) : null,
      warnings: warnings
    };
  } finally {
    if (parentClaim) {
      try { environment.releaseRecordEditClaim(parentClaim); }
      catch (releaseError) { warnings.push({code:'PARENT_CLAIM_RELEASE_FAILED',message:'処理権の解除を確認できません。時間をおいて再確認してください。'}); }
    }
  }
}

function kspFinishPitchbookLink_(environment, input, response) {
  var linked = kspUpdateMeetingRelations_(environment, {meetingId:input.parentMeetingId,
    expectedVersion:input.expectedParentVersion,documentId:input.documentId,operation:'add'});
  response.fileSaved = true;
  response.linkConfirmed = linked.ok;
  response.slot.parentMeetingId = input.parentMeetingId;
  response.slot.parentVersion = linked.ok ? linked.version : input.expectedParentVersion;
  response.parentVersion = response.slot.parentVersion;
  if (!linked.ok) {
    response.ok = false;
    response.error = linked.error;
    response.retry = response.slot;
    response.retryStage = 'LINK_ONLY';
  }
  return response;
}
