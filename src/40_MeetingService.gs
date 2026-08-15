function kspGetMeetingBootstrapData(environment) {
  try {
    var context = kspLoadMeetingRuntimeContext(environment);
    return kspBuildMeetingBootstrapResponse(context.catalog);
  } catch (error) {
    return { ok: false, workId: KSP_MEETING_WORK_ID, error: { code: kspGetErrorCode(error), message: error.message || String(error) } };
  }
}

function kspRegisterMeeting(environment, rawInput) {
  var startedAt = environment.nowIso();
  var warnings = [];
  var actor = kspGetMeetingActorSafely(environment, warnings);
  var context = null;
  var normalizedInput = kspNormalizeMeetingInput(rawInput);
  var selected = null;
  var meetingId = '';
  var filename = '';
  var fingerprint = '';
  var documentInfo = null;

  try {
    context = kspLoadMeetingRuntimeContext(environment);
    selected = kspValidateMeetingInput(normalizedInput, context.catalog);
    fingerprint = kspBuildMeetingRequestFingerprint(normalizedInput);

    if (normalizedInput.retryMeetingId) {
      kspAssert(normalizedInput.retryFingerprint === fingerprint, 'MEETING_RETRY_REQUEST_CHANGED',
        '入力内容が変更されたため、以前のMeeting IDでは再試行できません。');
      meetingId = normalizedInput.retryMeetingId;
      var allocatedSequence = kspParseMeetingId(meetingId);
      var nextSequence = environment.getCounterValue(context.backendSpreadsheetId, 'NEXT_MEETING_ID');
      kspAssert(allocatedSequence < nextSequence, 'MEETING_RETRY_ID_NOT_ALLOCATED',
        '指定されたMeeting IDはこの環境で採番されていません。');
    } else {
      var sequence = environment.allocateCounter(context.backendSpreadsheetId, 'NEXT_MEETING_ID', startedAt);
      meetingId = kspFormatMeetingId(sequence);
    }

    filename = kspBuildMeetingFilename(normalizedInput, selected, meetingId);
    var existingRow = environment.findRowByKey(context.backendSpreadsheetId, KSP_SHEET_NAMES.MEETING_INDEX, 'Meeting_ID', meetingId);
    if (existingRow) {
      kspAssert(kspMeetingIndexRowMatchesRequest(existingRow, normalizedInput, filename), 'MEETING_RETRY_CONFLICT',
        '同じMeeting IDに異なる登録内容が存在します。');
      return { ok: true, workId: KSP_MEETING_WORK_ID, meeting: kspMeetingInfoFromIndexRow(existingRow), idempotentReplay: true, warnings: warnings };
    }

    var documentText = kspBuildMeetingDocumentText(normalizedInput, selected);
    documentInfo = environment.createOrReuseDocument(context.meetingRecordsFolderId, meetingId, filename, documentText);

    var indexRow = kspBuildMeetingIndexRow(normalizedInput, selected, meetingId, documentInfo, filename, actor, startedAt);
    var indexResult = environment.appendUniqueRow(context.backendSpreadsheetId, KSP_SHEET_NAMES.MEETING_INDEX, 'Meeting_ID', indexRow);
    if (!indexResult.inserted) {
      kspAssert(kspMeetingIndexRowMatchesRequest(indexResult.row, normalizedInput, filename), 'MEETING_RETRY_CONFLICT',
        '同じMeeting IDに異なる登録内容が存在します。');
      return { ok: true, workId: KSP_MEETING_WORK_ID, meeting: kspMeetingInfoFromIndexRow(indexResult.row), idempotentReplay: true, warnings: warnings };
    }

    var metadata = kspBuildMeetingMetadata(normalizedInput, selected, meetingId, documentInfo, filename);
    var auditWarning = kspTryAppendMeetingAudit(environment, context.auditSpreadsheetId, {
      timestamp: environment.nowIso(), actor: actor, meetingId: meetingId, result: KSP_AUDIT_RESULTS.SUCCESS, metadata: metadata
    });
    if (auditWarning) warnings.push(auditWarning);

    return {
      ok: true,
      workId: KSP_MEETING_WORK_ID,
      meeting: {
        id: meetingId,
        filename: filename,
        documentId: documentInfo.id,
        documentUrl: documentInfo.url,
        version: 1,
        status: KSP_STATUS.ACTIVE,
        aiIndexStatus: KSP_AI_INDEX_STATUS.PENDING,
        reusedDocument: Boolean(documentInfo.reused)
      },
      warnings: warnings
    };
  } catch (error) {
    if (context && context.auditSpreadsheetId) {
      var failureWarning = kspTryAppendMeetingAudit(environment, context.auditSpreadsheetId, {
        timestamp: environment.nowIso(), actor: actor, meetingId: meetingId, result: KSP_AUDIT_RESULTS.FAILURE,
        errorCode: kspGetErrorCode(error), errorMessage: error.message || String(error)
      });
      if (failureWarning) warnings.push(failureWarning);
    }

    return {
      ok: false,
      workId: KSP_MEETING_WORK_ID,
      error: { code: kspGetErrorCode(error), message: error.message || String(error) },
      retry: meetingId && fingerprint ? { meetingId: meetingId, fingerprint: fingerprint } : null,
      warnings: warnings
    };
  }
}

function kspLoadMeetingRuntimeContext(environment) {
  var state = environment.getInstallationState();
  kspAssert(state && state.config && state.resources, 'INSTALLATION_STATE_MISSING',
    'Installation state is missing. Run setupKnowledgePlatform() first.');

  var backendSpreadsheetId = state.resources[KSP_RESOURCE_KEYS.BACKEND_SPREADSHEET];
  var auditSpreadsheetId = state.resources[KSP_RESOURCE_KEYS.AUDIT_SPREADSHEET];
  var meetingRecordsFolderId = state.resources[KSP_RESOURCE_KEYS.MEETING_RECORDS];
  kspAssert(backendSpreadsheetId, 'BACKEND_SPREADSHEET_MISSING', 'Backend Spreadsheet is not configured.');
  kspAssert(auditSpreadsheetId, 'AUDIT_SPREADSHEET_MISSING', 'Audit Spreadsheet is not configured.');
  kspAssert(meetingRecordsFolderId, 'MEETING_FOLDER_MISSING', 'Meeting Records folder is not configured.');

  var gpRows = environment.readRows(backendSpreadsheetId, KSP_SHEET_NAMES.GP_MASTER);
  var optionRows = environment.readRows(backendSpreadsheetId, KSP_SHEET_NAMES.OPTION_MASTER);
  return {
    state: state,
    backendSpreadsheetId: backendSpreadsheetId,
    auditSpreadsheetId: auditSpreadsheetId,
    meetingRecordsFolderId: meetingRecordsFolderId,
    catalog: kspBuildMeetingCatalog(gpRows, optionRows)
  };
}

function kspGetMeetingActorSafely(environment, warnings) {
  try {
    return environment.getActor() || 'UNIDENTIFIED';
  } catch (error) {
    warnings.push({ code: 'ACTOR_RESOLUTION_FAILED', message: error.message || String(error) });
    return 'UNIDENTIFIED';
  }
}

function kspTryAppendMeetingAudit(environment, auditSpreadsheetId, params) {
  try {
    environment.appendRow(auditSpreadsheetId, KSP_SHEET_NAMES.AUDIT_LOG, kspBuildMeetingAuditRow(params));
    return null;
  } catch (error) {
    return { code: 'AUDIT_WRITE_FAILED', message: error.message || String(error) };
  }
}
