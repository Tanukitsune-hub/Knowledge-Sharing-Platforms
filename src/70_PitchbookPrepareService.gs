function kspGetPitchbookBootstrapData(environment) {
  try {
    var context = kspLoadPitchbookRuntimeContext(environment);
    return kspBuildPitchbookBootstrapResponse(context.catalog);
  } catch (error) {
    return { ok: false, workId: KSP_PITCHBOOK_WORK_ID,
      error: { code: kspGetErrorCode(error), message: error.message || String(error) } };
  }
}

function kspPreparePitchbookBatch(environment, rawInput) {
  var warnings = [];
  var actor = kspGetPitchbookActorSafely(environment, warnings);
  try {
    var context = kspLoadPitchbookRuntimeContext(environment);
    var input = kspNormalizePitchbookBatchInput(rawInput);
    var validation = kspValidatePitchbookBatchInput(input, context.catalog);
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
        var descriptor = kspFindPitchbookReservationFile(reserved.reservation, row.Document_ID);
        return kspPitchbookSlotFromRow(row, descriptor, reserved.reservation.totalBytes);
      }),
      warnings: warnings
    };
  } catch (error) {
    return {
      ok: false,
      workId: KSP_PITCHBOOK_WORK_ID,
      error: { code: kspGetErrorCode(error), message: error.message || String(error) },
      warnings: warnings
    };
  }
}
