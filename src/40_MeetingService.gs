function kspGetMeetingBootstrapData_(environment) {
  try {
    var context = kspLoadMeetingRuntimeContext_(environment);
    context.catalog.relatedPitchbooks = (context.pitchbookRows || []).filter(function (row) {
      return String(row.Status || '') === KSP_STATUS.ACTIVE;
    }).map(function (row) {
      return {
        id: String(row.Document_ID || ''), date: kspMeetingCellDate_(row.Date),
        gpId: String(row.GP_ID || ''), assetClassId: String(row.Asset_Class_ID || ''),
        title: String(row.Saved_Filename || row.Original_Filename || row.Document_ID || ''),
        status: String(row.Status || ''), preserved: false
      };
    }).sort(function (left, right) {
      return right.date.localeCompare(left.date) || left.id.localeCompare(right.id);
    });
    return kspBuildMeetingBootstrapResponse_(context.catalog);
  } catch (error) {
    return { ok: false, workId: KSP_MEETING_WORK_ID, error: { code: kspGetErrorCode_(error), message: kspSafePublicErrorMessage_(kspGetErrorCode_(error), 'MEETING') } };
  }
}

function kspRegisterMeeting_(environment, rawInput) {
  var startedAt = environment.nowIso();
  var warnings = [];
  var actor = kspGetMeetingActorSafely_(environment, warnings);
  var context = null;
  var normalizedInput = null;
  var selected = null;
  var meetingId = '';
  var filename = '';
  var fingerprint = '';
  var documentInfo = null;

  try {
    normalizedInput = kspNormalizeMeetingInput_(rawInput);
    context = kspLoadMeetingRuntimeContext_(environment);
    context.catalog.relatedPitchbooks = kspBuildRelatedPitchbookChoices_(
      context.pitchbookRows, normalizedInput.gpId, normalizedInput.assetClassId, []
    );
    selected = kspValidateMeetingInput_(normalizedInput, context.catalog);
    fingerprint = kspBuildMeetingRequestFingerprint_(normalizedInput);

    if (normalizedInput.retryMeetingId) {
      var retryFingerprintMatches = normalizedInput.retryFingerprint === fingerprint ||
        (kspMeetingUsesOnlyLegacyFields_(normalizedInput) &&
          normalizedInput.retryFingerprint === kspBuildLegacyMeetingRequestFingerprint_(normalizedInput));
      kspAssert_(retryFingerprintMatches, 'MEETING_RETRY_REQUEST_CHANGED',
        '入力内容が変更されたため、以前のMeeting IDでは再試行できません。');
      meetingId = normalizedInput.retryMeetingId;
      var allocatedSequence = kspParseMeetingId_(meetingId);
      var nextSequence = environment.getCounterValue(context.backendSpreadsheetId, 'NEXT_MEETING_ID');
      kspAssert_(allocatedSequence < nextSequence, 'MEETING_RETRY_ID_NOT_ALLOCATED',
        '指定されたMeeting IDはこの環境で採番されていません。');
    } else {
      var sequence = environment.allocateCounter(context.backendSpreadsheetId, 'NEXT_MEETING_ID', startedAt);
      meetingId = kspFormatMeetingId_(sequence);
    }

    filename = kspBuildMeetingFilename_(normalizedInput, selected, meetingId);
    var existingRow = environment.findRowByKey(context.backendSpreadsheetId, KSP_SHEET_NAMES.MEETING_INDEX, 'Meeting_ID', meetingId);
    if (existingRow) {
      kspAssert_(kspMeetingIndexRowMatchesRequest_(existingRow, normalizedInput, filename), 'MEETING_RETRY_CONFLICT',
        '同じMeeting IDに異なる登録内容が存在します。');
      return { ok: true, workId: KSP_MEETING_WORK_ID, meeting: kspMeetingInfoFromIndexRow_(existingRow), idempotentReplay: true, warnings: warnings };
    }

    var documentText = kspBuildMeetingDocumentText_(normalizedInput, selected);
    documentInfo = environment.createOrReuseDocument(context.meetingRecordsFolderId, meetingId, filename, documentText);

    var indexRow = kspBuildMeetingIndexRow_(normalizedInput, selected, meetingId, documentInfo, filename, actor, startedAt);
    var indexResult = environment.appendUniqueRow(context.backendSpreadsheetId, KSP_SHEET_NAMES.MEETING_INDEX, 'Meeting_ID', indexRow);
    if (!indexResult.inserted) {
      kspAssert_(kspMeetingIndexRowMatchesRequest_(indexResult.row, normalizedInput, filename), 'MEETING_RETRY_CONFLICT',
        '同じMeeting IDに異なる登録内容が存在します。');
      return { ok: true, workId: KSP_MEETING_WORK_ID, meeting: kspMeetingInfoFromIndexRow_(indexResult.row), idempotentReplay: true, warnings: warnings };
    }

    var metadata = kspBuildMeetingMetadata_(normalizedInput, selected, meetingId, documentInfo, filename);
    var auditWarning = kspTryAppendMeetingAudit_(environment, context.auditSpreadsheetId, {
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
      var failureWarning = kspTryAppendMeetingAudit_(environment, context.auditSpreadsheetId, {
        timestamp: environment.nowIso(), actor: actor, meetingId: meetingId, result: KSP_AUDIT_RESULTS.FAILURE,
        errorCode: kspGetErrorCode_(error), errorMessage: kspSafePublicErrorMessage_(kspGetErrorCode_(error), 'MEETING')
      });
      if (failureWarning) warnings.push(failureWarning);
    }

    return {
      ok: false,
      workId: KSP_MEETING_WORK_ID,
      error: { code: kspGetErrorCode_(error), message: kspSafePublicErrorMessage_(kspGetErrorCode_(error), 'MEETING') },
      retry: meetingId && fingerprint ? { meetingId: meetingId, fingerprint: fingerprint } : null,
      warnings: warnings
    };
  }
}

function kspLoadMeetingRuntimeContext_(environment) {
  var state = environment.getInstallationState();
  kspAssert_(state && state.config && state.resources, 'INSTALLATION_STATE_MISSING',
    'Installation state is missing. Run setupKnowledgePlatform_() first.');

  var backendSpreadsheetId = state.resources[KSP_RESOURCE_KEYS.BACKEND_SPREADSHEET];
  var auditSpreadsheetId = state.resources[KSP_RESOURCE_KEYS.AUDIT_SPREADSHEET];
  var meetingRecordsFolderId = state.resources[KSP_RESOURCE_KEYS.MEETING_RECORDS];
  kspAssert_(backendSpreadsheetId, 'BACKEND_SPREADSHEET_MISSING', 'Backend Spreadsheet is not configured.');
  kspAssert_(auditSpreadsheetId, 'AUDIT_SPREADSHEET_MISSING', 'Audit Spreadsheet is not configured.');
  kspAssert_(meetingRecordsFolderId, 'MEETING_FOLDER_MISSING', 'Meeting Records folder is not configured.');

  var gpRows = environment.readRows(backendSpreadsheetId, KSP_SHEET_NAMES.GP_MASTER);
  var optionRows = environment.readRows(backendSpreadsheetId, KSP_SHEET_NAMES.OPTION_MASTER);
  var pitchbookRows = environment.readRows(backendSpreadsheetId, KSP_SHEET_NAMES.PITCHBOOK_INDEX);
  return {
    state: state,
    backendSpreadsheetId: backendSpreadsheetId,
    auditSpreadsheetId: auditSpreadsheetId,
    meetingRecordsFolderId: meetingRecordsFolderId,
    pitchbookRows: pitchbookRows,
    catalog: kspBuildMeetingCatalog_(gpRows, optionRows)
  };
}

function kspGetMeetingActorSafely_(environment, warnings) {
  try {
    return environment.getActor() || 'UNIDENTIFIED';
  } catch (error) {
    warnings.push({ code: 'ACTOR_RESOLUTION_FAILED', message: kspSafeOperationalWarning_('ACTOR_RESOLUTION_FAILED') });
    return 'UNIDENTIFIED';
  }
}

function kspTryAppendMeetingAudit_(environment, auditSpreadsheetId, params) {
  try {
    environment.appendRow(auditSpreadsheetId, KSP_SHEET_NAMES.AUDIT_LOG, kspBuildMeetingAuditRow_(params));
    return null;
  } catch (error) {
    return { code: 'AUDIT_WRITE_FAILED', message: kspSafeOperationalWarning_('AUDIT_WRITE_FAILED') };
  }
}
