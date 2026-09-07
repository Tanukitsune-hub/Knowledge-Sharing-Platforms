function kspGetPitchbookBootstrapData_(environment) {
  try {
    var context = kspLoadPitchbookRuntimeContext_(environment);
    return kspBuildPitchbookBootstrapResponse_(context.catalog);
  } catch (error) {
    return { ok: false, workId: KSP_PITCHBOOK_WORK_ID,
      error: { code: kspGetErrorCode_(error), message: kspSafePublicErrorMessage_(kspGetErrorCode_(error), 'PITCHBOOK') } };
  }
}

function kspPreparePitchbookBatch_(environment, rawInput) {
  var warnings = [];
  var actor = kspGetPitchbookActorSafely_(environment, warnings);
  try {
    var context = kspLoadPitchbookRuntimeContext_(environment);
    var input = kspNormalizePitchbookBatchInput_(rawInput);
    if (input.requestId) {
      kspAssert_(/^[A-Za-z0-9_-]{8,128}$/.test(input.requestId), 'PITCHBOOK_PREPARE_REQUEST_ID_INVALID',
        'Prepare request IDが不正です。');
      // Capture the normalized caller payload before authoritative parent defaults.
      var semanticScope = kspNormalizePitchbookBatchInput_(input);
      delete semanticScope.expectedParentVersion; // CAS refresh is not a different allocation request.
      input.prepareRequestScope = JSON.stringify(semanticScope);
    }
    var parent = kspRequirePitchbookParent_(environment, context.backendSpreadsheetId,
      input.parentMeetingId, input.expectedParentVersion);
    var validation = { selected: null, totalBytes: 0 };
    if (!input.requestId) {
      kspApplyPitchbookParentContext_(input, parent);
      validation = kspValidatePitchbookBatchInput_(input, context.catalog);
    }
    var reserved = environment.reservePitchbookBatch(
      context.backendSpreadsheetId,
      input,
      validation.selected,
      validation.totalBytes,
      actor,
      environment.nowIso()
    );
    return {
      ok: true,
      workId: KSP_PITCHBOOK_WORK_ID,
      batchId: reserved.reservation.batchId,
      requestId: input.requestId || '',
      idempotentReplay: reserved.idempotentReplay === true,
      slots: reserved.rows.map(function (row) {
        var descriptor = kspFindPitchbookReservationFile_(reserved.reservation, row.Document_ID);
        var slot = kspPitchbookSlotFromRow_(row, descriptor, reserved.reservation.totalBytes);
        slot.parentVersion = Number(parent.Version);
        return slot;
      }),
      warnings: warnings
    };
  } catch (error) {
    return {
      ok: false,
      workId: KSP_PITCHBOOK_WORK_ID,
      error: { code: kspGetErrorCode_(error), message: kspSafePublicErrorMessage_(kspGetErrorCode_(error), 'PITCHBOOK') },
      warnings: warnings
    };
  }
}
