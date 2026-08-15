function kspGetMaintenanceBootstrapData(environment) {
  try {
    var context = kspLoadMaintenanceContext(environment);
    return {
      ok: true,
      workId: KSP_MAINTENANCE_WORK_ID,
      appVersion: KSP_MAINTENANCE_APP_VERSION,
      masters: kspMasterResponse(context.gpRows, context.optionRows),
      diagnostics: kspBuildPhase1Diagnostics(
        context.state,
        kspGetBackendSchemas(),
        kspGetMaintenanceActorSafely(environment, [])
      )
    };
  } catch (error) {
    return kspMaintenanceFailure(error);
  }
}

function kspSearchMeetingRecords(environment, rawFilters) {
  try {
    var context = kspLoadMaintenanceContext(environment);
    var filters = kspNormalizeRecordFilters(rawFilters);
    var rows = environment.readRows(context.backendSpreadsheetId, KSP_SHEET_NAMES.MEETING_INDEX);
    var records = kspSortRecordsDescending(
      rows.filter(function (row) { return kspRecordMatchesFilters(row, filters); }),
      'Meeting_ID'
    ).slice(0, filters.limit).map(function (row) {
      return kspMeetingSearchItem(row, context.lookup);
    });
    return { ok: true, workId: KSP_MAINTENANCE_WORK_ID, records: records, count: records.length };
  } catch (error) {
    return kspMaintenanceFailure(error);
  }
}

function kspGetMeetingRecord(environment, meetingId) {
  try {
    var context = kspLoadMaintenanceContext(environment);
    var normalizedId = kspMaintenanceTrim(meetingId);
    kspParseMeetingId(normalizedId);
    var row = environment.findRowByKey(
      context.backendSpreadsheetId,
      KSP_SHEET_NAMES.MEETING_INDEX,
      'Meeting_ID',
      normalizedId
    );
    kspAssert(row, 'MEETING_NOT_FOUND', 'Meeting record was not found.');
    var record = kspMeetingSearchItem(row, context.lookup);
    record.notes = kspExtractMeetingNotes(environment.readDocumentText(row.Doc_File_ID));
    return { ok: true, workId: KSP_MAINTENANCE_WORK_ID, record: record };
  } catch (error) {
    return kspMaintenanceFailure(error);
  }
}

function kspUpdateMeetingRecord(environment, rawInput) {
  var warnings = [];
  var actor = kspGetMaintenanceActorSafely(environment, warnings);
  try {
    var context = kspLoadMaintenanceContext(environment);
    var input = kspNormalizeMeetingMaintenanceInput(rawInput);
    var selected = kspValidateMeetingInput(input, context.catalog);
    var current = environment.findRowByKey(
      context.backendSpreadsheetId,
      KSP_SHEET_NAMES.MEETING_INDEX,
      'Meeting_ID',
      input.meetingId
    );
    kspAssert(current, 'MEETING_NOT_FOUND', 'Meeting record was not found.');
    kspAssert(Number(current.Version || 0) === input.expectedVersion,
      'MEETING_STALE_VERSION', '別の利用者が先に更新しました。最新内容を再読込してください。');

    var before = kspMeetingAuditSnapshot(current);
    var filename = kspBuildMeetingFilename(input, selected, input.meetingId);
    var documentText = kspBuildMeetingDocumentText(input, selected);
    var nowIso = environment.nowIso();
    var nextRow = kspDeepClone(current);
    nextRow.Date = input.date;
    nextRow.Time = input.time;
    nextRow.Location_ID = input.locationId;
    nextRow.GP_ID = input.gpId;
    nextRow.Asset_Class_ID = input.assetClassId;
    nextRow.Capital_Type_ID = input.capitalTypeId;
    nextRow.Counterparty = input.counterparty;
    nextRow.Internal_Participants = input.internalParticipants;
    nextRow.Saved_Filename = filename;
    nextRow.Version = input.expectedVersion + 1;
    nextRow.Updated_At = nowIso;
    nextRow.Updated_By = actor;
    nextRow.AI_Index_Status = KSP_AI_INDEX_STATUS.PENDING;
    nextRow.AI_Last_Error = '';

    var updated = environment.mutateMeetingRecord({
      spreadsheetId: context.backendSpreadsheetId,
      currentRow: current,
      expectedVersion: input.expectedVersion,
      nextRow: nextRow,
      documentId: String(current.Doc_File_ID || ''),
      filename: filename,
      documentText: documentText,
      claimTtlMs: KSP_MAINTENANCE_CLAIM_TTL_MS
    });
    var after = kspMeetingAuditSnapshot(updated);
    var auditWarning = kspTryAppendMaintenanceAudit(environment, context.auditSpreadsheetId, {
      timestamp: environment.nowIso(),
      actor: actor,
      action: KSP_MAINTENANCE_ACTIONS.MEETING_UPDATE,
      targetType: KSP_RECORD_TYPES.MEETING,
      targetId: input.meetingId,
      result: KSP_AUDIT_RESULTS.SUCCESS,
      changedFields: kspChangedFields(before, after),
      before: before,
      after: after
    });
    if (auditWarning) warnings.push(auditWarning);
    var record = kspMeetingSearchItem(updated, context.lookup);
    record.notes = input.notes;
    return { ok: true, workId: KSP_MAINTENANCE_WORK_ID, record: record, warnings: warnings };
  } catch (error) {
    return kspMaintenanceFailure(error, warnings);
  }
}

function kspSetMeetingRecordStatus(environment, rawInput) {
  var warnings = [];
  var actor = kspGetMaintenanceActorSafely(environment, warnings);
  try {
    var context = kspLoadMaintenanceContext(environment);
    var input = kspNormalizeMeetingStatusInput(rawInput);
    var current = environment.findRowByKey(
      context.backendSpreadsheetId,
      KSP_SHEET_NAMES.MEETING_INDEX,
      'Meeting_ID',
      input.meetingId
    );
    kspAssert(current, 'MEETING_NOT_FOUND', 'Meeting record was not found.');
    kspAssert(Number(current.Version || 0) === input.expectedVersion,
      'MEETING_STALE_VERSION', '別の利用者が先に更新しました。最新内容を再読込してください。');
    var before = kspMeetingAuditSnapshot(current);
    var nextRow = kspDeepClone(current);
    nextRow.Status = input.status;
    nextRow.Version = input.expectedVersion + 1;
    nextRow.Updated_At = environment.nowIso();
    nextRow.Updated_By = actor;
    nextRow.AI_Index_Status = KSP_AI_INDEX_STATUS.PENDING;
    nextRow.AI_Last_Error = '';
    var updated = environment.mutateMeetingStatus({
      spreadsheetId: context.backendSpreadsheetId,
      currentRow: current,
      expectedVersion: input.expectedVersion,
      nextRow: nextRow,
      claimTtlMs: KSP_MAINTENANCE_CLAIM_TTL_MS
    });
    var after = kspMeetingAuditSnapshot(updated);
    var action = input.status === KSP_STATUS.ACTIVE
      ? KSP_MAINTENANCE_ACTIONS.MEETING_REACTIVATE
      : KSP_MAINTENANCE_ACTIONS.MEETING_INACTIVATE;
    var auditWarning = kspTryAppendMaintenanceAudit(environment, context.auditSpreadsheetId, {
      timestamp: environment.nowIso(), actor: actor, action: action,
      targetType: KSP_RECORD_TYPES.MEETING, targetId: input.meetingId,
      result: KSP_AUDIT_RESULTS.SUCCESS, changedFields: kspChangedFields(before, after),
      before: before, after: after
    });
    if (auditWarning) warnings.push(auditWarning);
    return { ok: true, workId: KSP_MAINTENANCE_WORK_ID,
      record: kspMeetingSearchItem(updated, context.lookup), warnings: warnings };
  } catch (error) {
    return kspMaintenanceFailure(error, warnings);
  }
}

function kspSearchPitchbookRecords(environment, rawFilters) {
  try {
    var context = kspLoadMaintenanceContext(environment);
    var filters = kspNormalizeRecordFilters(rawFilters);
    var rows = environment.readRows(context.backendSpreadsheetId, KSP_SHEET_NAMES.PITCHBOOK_INDEX);
    var records = kspSortRecordsDescending(
      rows.filter(function (row) { return kspRecordMatchesFilters(row, filters); }),
      'Document_ID'
    ).slice(0, filters.limit).map(function (row) {
      return kspPitchbookSearchItem(row, context.lookup);
    });
    return { ok: true, workId: KSP_MAINTENANCE_WORK_ID, records: records, count: records.length };
  } catch (error) {
    return kspMaintenanceFailure(error);
  }
}

function kspGetPitchbookRecord(environment, documentId) {
  try {
    var context = kspLoadMaintenanceContext(environment);
    var normalizedId = kspMaintenanceTrim(documentId);
    kspParseDocumentId(normalizedId);
    var row = environment.findRowByKey(
      context.backendSpreadsheetId,
      KSP_SHEET_NAMES.PITCHBOOK_INDEX,
      'Document_ID',
      normalizedId
    );
    kspAssert(row, 'PITCHBOOK_NOT_FOUND', 'Pitchbook record was not found.');
    return { ok: true, workId: KSP_MAINTENANCE_WORK_ID,
      record: kspPitchbookSearchItem(row, context.lookup) };
  } catch (error) {
    return kspMaintenanceFailure(error);
  }
}

function kspUpdatePitchbookRecord(environment, rawInput) {
  var warnings = [];
  var actor = kspGetMaintenanceActorSafely(environment, warnings);
  try {
    var context = kspLoadMaintenanceContext(environment);
    var input = kspNormalizePitchbookMaintenanceInput(rawInput);
    var selected = kspValidatePitchbookMaintenanceSelection(input, context.catalog);
    var current = environment.findRowByKey(
      context.backendSpreadsheetId,
      KSP_SHEET_NAMES.PITCHBOOK_INDEX,
      'Document_ID',
      input.documentId
    );
    kspAssert(current, 'PITCHBOOK_NOT_FOUND', 'Pitchbook record was not found.');
    kspAssert(String(current.Updated_At || '') === input.expectedUpdatedAt,
      'PITCHBOOK_STALE_UPDATED_AT', '別の利用者が先に更新しました。最新内容を再読込してください。');
    kspAssert(current.File_ID, 'PITCHBOOK_FILE_MISSING', 'Authoritative Pitchbook file is missing.');
    var before = kspPitchbookAuditSnapshot(current);
    var updated = environment.mutatePitchbookRecord({
      spreadsheetId: context.backendSpreadsheetId,
      currentRow: current,
      expectedUpdatedAt: input.expectedUpdatedAt,
      input: input,
      selected: selected,
      actor: actor,
      nowIso: environment.nowIso(),
      claimTtlMs: KSP_MAINTENANCE_CLAIM_TTL_MS
    });
    var after = kspPitchbookAuditSnapshot(updated);
    var auditWarning = kspTryAppendMaintenanceAudit(environment, context.auditSpreadsheetId, {
      timestamp: environment.nowIso(), actor: actor,
      action: KSP_MAINTENANCE_ACTIONS.PITCHBOOK_UPDATE,
      targetType: KSP_RECORD_TYPES.PITCHBOOK, targetId: input.documentId,
      batchId: String(updated.Batch_ID || ''), result: KSP_AUDIT_RESULTS.SUCCESS,
      changedFields: kspChangedFields(before, after), before: before, after: after
    });
    if (auditWarning) warnings.push(auditWarning);
    return { ok: true, workId: KSP_MAINTENANCE_WORK_ID,
      record: kspPitchbookSearchItem(updated, context.lookup), warnings: warnings };
  } catch (error) {
    return kspMaintenanceFailure(error, warnings);
  }
}

function kspSetPitchbookRecordStatus(environment, rawInput) {
  var warnings = [];
  var actor = kspGetMaintenanceActorSafely(environment, warnings);
  try {
    var context = kspLoadMaintenanceContext(environment);
    var input = kspNormalizePitchbookStatusInput(rawInput);
    var current = environment.findRowByKey(
      context.backendSpreadsheetId,
      KSP_SHEET_NAMES.PITCHBOOK_INDEX,
      'Document_ID',
      input.documentId
    );
    kspAssert(current, 'PITCHBOOK_NOT_FOUND', 'Pitchbook record was not found.');
    kspAssert(String(current.Updated_At || '') === input.expectedUpdatedAt,
      'PITCHBOOK_STALE_UPDATED_AT', '別の利用者が先に更新しました。最新内容を再読込してください。');
    if (input.status === KSP_STATUS.ACTIVE) {
      kspAssert(current.File_ID, 'PITCHBOOK_FILE_MISSING',
        'Authoritative Pitchbook file is missing and this record cannot be reactivated.');
    }
    var before = kspPitchbookAuditSnapshot(current);
    var updated = environment.mutatePitchbookStatus({
      spreadsheetId: context.backendSpreadsheetId,
      currentRow: current,
      expectedUpdatedAt: input.expectedUpdatedAt,
      status: input.status,
      actor: actor,
      nowIso: environment.nowIso(),
      claimTtlMs: KSP_MAINTENANCE_CLAIM_TTL_MS
    });
    var after = kspPitchbookAuditSnapshot(updated);
    var action = input.status === KSP_STATUS.ACTIVE
      ? KSP_MAINTENANCE_ACTIONS.PITCHBOOK_REACTIVATE
      : KSP_MAINTENANCE_ACTIONS.PITCHBOOK_INACTIVATE;
    var auditWarning = kspTryAppendMaintenanceAudit(environment, context.auditSpreadsheetId, {
      timestamp: environment.nowIso(), actor: actor, action: action,
      targetType: KSP_RECORD_TYPES.PITCHBOOK, targetId: input.documentId,
      batchId: String(updated.Batch_ID || ''), result: KSP_AUDIT_RESULTS.SUCCESS,
      changedFields: kspChangedFields(before, after), before: before, after: after
    });
    if (auditWarning) warnings.push(auditWarning);
    return { ok: true, workId: KSP_MAINTENANCE_WORK_ID,
      record: kspPitchbookSearchItem(updated, context.lookup), warnings: warnings };
  } catch (error) {
    return kspMaintenanceFailure(error, warnings);
  }
}

function kspGetPhase1Diagnostics(environment) {
  try {
    var context = kspLoadMaintenanceContext(environment);
    var warnings = [];
    var actor = kspGetMaintenanceActorSafely(environment, warnings);
    var diagnostics = kspBuildPhase1Diagnostics(context.state, kspGetBackendSchemas(), actor);
    diagnostics.warnings = warnings;
    return diagnostics;
  } catch (error) {
    return kspMaintenanceFailure(error);
  }
}

function kspLoadMaintenanceContext(environment) {
  var state = environment.getInstallationState();
  kspAssert(state && state.config && state.resources, 'INSTALLATION_STATE_MISSING',
    'Installation state is missing. Run setupKnowledgePlatform() first.');
  var backendSpreadsheetId = state.resources[KSP_RESOURCE_KEYS.BACKEND_SPREADSHEET];
  var auditSpreadsheetId = state.resources[KSP_RESOURCE_KEYS.AUDIT_SPREADSHEET];
  kspAssert(backendSpreadsheetId, 'BACKEND_SPREADSHEET_MISSING', 'Backend Spreadsheet is not configured.');
  kspAssert(auditSpreadsheetId, 'AUDIT_SPREADSHEET_MISSING', 'Audit Spreadsheet is not configured.');
  var gpRows = environment.readRows(backendSpreadsheetId, KSP_SHEET_NAMES.GP_MASTER);
  var optionRows = environment.readRows(backendSpreadsheetId, KSP_SHEET_NAMES.OPTION_MASTER);
  return {
    state: state,
    backendSpreadsheetId: backendSpreadsheetId,
    auditSpreadsheetId: auditSpreadsheetId,
    gpRows: gpRows,
    optionRows: optionRows,
    lookup: kspBuildMasterLookup(gpRows, optionRows),
    catalog: kspBuildMaintenanceCatalog(gpRows, optionRows)
  };
}

function kspValidatePitchbookMaintenanceSelection(input, catalog) {
  var selected = {
    gp: kspRequireCatalogItem(catalog.gps, input.gpId,
      'PITCHBOOK_GP_UNAVAILABLE', '選択されたGPは利用できません。'),
    assetClass: kspRequireCatalogItem(catalog.assetClasses, input.assetClassId,
      'PITCHBOOK_ASSET_CLASS_UNAVAILABLE', '選択されたAsset Classは利用できません。'),
    capitalType: null
  };
  if (input.capitalTypeId) {
    selected.capitalType = kspRequireCatalogItem(catalog.capitalTypes, input.capitalTypeId,
      'PITCHBOOK_CAPITAL_TYPE_UNAVAILABLE', '選択されたEquity / Debtは利用できません。');
  }
  return selected;
}

function kspGetMaintenanceActorSafely(environment, warnings) {
  try {
    return environment.getActor() || 'UNIDENTIFIED';
  } catch (error) {
    warnings.push({ code: 'ACTOR_RESOLUTION_FAILED', message: error.message || String(error) });
    return 'UNIDENTIFIED';
  }
}

function kspTryAppendMaintenanceAudit(environment, auditSpreadsheetId, params) {
  try {
    environment.appendRow(
      auditSpreadsheetId,
      KSP_SHEET_NAMES.AUDIT_LOG,
      kspBuildMaintenanceAuditRow(params)
    );
    return null;
  } catch (error) {
    return { code: 'AUDIT_WRITE_FAILED', message: error.message || String(error) };
  }
}

function kspMaintenanceFailure(error, warnings) {
  return {
    ok: false,
    workId: KSP_MAINTENANCE_WORK_ID,
    error: { code: kspGetErrorCode(error), message: error.message || String(error) },
    warnings: warnings || []
  };
}
