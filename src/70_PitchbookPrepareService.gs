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
    var validation = kspValidatePitchbookBatchInput_(input, context.catalog);
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
      slots: reserved.rows.map(function (row) {
        var descriptor = kspFindPitchbookReservationFile_(reserved.reservation, row.Document_ID);
        return kspPitchbookSlotFromRow_(row, descriptor, reserved.reservation.totalBytes);
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
