function kspGetPhase1Diagnostics(environment) {
  try {
    var state = environment.getInstallationState();
    kspAssert(state && state.resources, 'INSTALLATION_STATE_MISSING', 'Installation stateがありません。');
    var backendId = state.resources[KSP_RESOURCE_KEYS.BACKEND_SPREADSHEET] || '';
    var auditId = state.resources[KSP_RESOURCE_KEYS.AUDIT_SPREADSHEET] || '';
    var backendHeaders = {};
    var auditHeaders = {};
    Object.keys(kspGetBackendSchemas()).forEach(function (sheetName) {
      backendHeaders[sheetName] = environment.getSheetHeaders(backendId, sheetName);
    });
    Object.keys(kspGetAuditSchema()).forEach(function (sheetName) {
      auditHeaders[sheetName] = environment.getSheetHeaders(auditId, sheetName);
    });
    var backendChecks = kspBuildSchemaDiagnostic(kspGetBackendSchemas(), backendHeaders);
    var auditChecks = kspBuildSchemaDiagnostic(kspGetAuditSchema(), auditHeaders);
    var actorWarnings = [];
    var actor = kspGetMaintenanceActorSafely(environment, actorWarnings);
    var resourceSeparation = Boolean(backendId && auditId && backendId !== auditId);
    var schemasHealthy = backendChecks.concat(auditChecks).every(function (check) { return check.ok; });
    return {
      ok: true,
      workId: KSP_MAINTENANCE_WORK_ID,
      healthy: resourceSeparation && schemasHealthy,
      resources: {
        backendConfigured: Boolean(backendId),
        auditConfigured: Boolean(auditId),
        backendAuditSeparated: resourceSeparation
      },
      schemas: { backend: backendChecks, audit: auditChecks },
      actor: { kind: kspActorKind(actor), warningCount: actorWarnings.length },
      capabilities: {
        setup: true,
        meetingRegistration: true,
        pitchbookRegistration: true,
        meetingMaintenance: true,
        pitchbookMaintenance: true,
        masterManagement: true,
        auditRetentionCleanup: true,
        geminiFileSearch: false,
        liveQualified: false
      }
    };
  } catch (error) {
    return kspMaintenanceFailure(error);
  }
}

function kspGetPhase1MaintenanceBootstrap(environment) {
  try {
    var context = kspLoadMaintenanceContext(environment);
    return {
      ok: true,
      workId: KSP_MAINTENANCE_WORK_ID,
      appVersion: KSP_MAINTENANCE_APP_VERSION,
      options: kspBuildMeetingBootstrapResponse(context.catalog).options,
      statuses: [KSP_STATUS.ACTIVE, KSP_STATUS.INACTIVE, KSP_PITCHBOOK_STATUS.PENDING, KSP_PITCHBOOK_STATUS.FAILED],
      optionTypes: [KSP_OPTION_TYPES.ASSET_CLASS, KSP_OPTION_TYPES.CAPITAL_TYPE, KSP_OPTION_TYPES.LOCATION],
      masters: kspBuildMasterResponse(context.gpRows, context.optionRows)
    };
  } catch (error) {
    return kspMaintenanceFailure(error);
  }
}

function kspSearchMeetingRecords(environment, rawSearch) {
  try {
    var context = kspLoadMaintenanceContext(environment);
    var search = kspValidateRecordSearch(kspNormalizeRecordSearch(rawSearch));
    var maps = kspBuildAllMasterMaps(context.gpRows, context.optionRows);
    return {
      ok: true,
      workId: KSP_MAINTENANCE_WORK_ID,
      records: kspSearchRows(context.meetingRows, search, function (row) {
        return kspMapMeetingSearchResult(row, maps);
      })
    };
  } catch (error) {
    return kspMaintenanceFailure(error);
  }
}

function kspSearchPitchbookRecords(environment, rawSearch) {
  try {
    var context = kspLoadMaintenanceContext(environment);
    var search = kspValidateRecordSearch(kspNormalizeRecordSearch(rawSearch));
    var maps = kspBuildAllMasterMaps(context.gpRows, context.optionRows);
    return {
      ok: true,
      workId: KSP_MAINTENANCE_WORK_ID,
      records: kspSearchRows(context.pitchbookRows, search, function (row) {
        return kspMapPitchbookSearchResult(row, maps);
      })
    };
  } catch (error) {
    return kspMaintenanceFailure(error);
  }
}

function kspGetMeetingMaintenanceRecord(environment, meetingId) {
  try {
    var context = kspLoadMaintenanceContext(environment);
    var row = kspRequireSingleRow(context.meetingRows, 'Meeting_ID', meetingId, 'MEETING_NOT_FOUND');
    var text = environment.getDocumentText(String(row.Doc_File_ID || ''));
    var parsed = kspParseMeetingDocumentText(text);
    var maps = kspBuildAllMasterMaps(context.gpRows, context.optionRows);
    var record = kspMapMeetingSearchResult(row, maps);
    record.notes = parsed.notes;
    return { ok: true, workId: KSP_MAINTENANCE_WORK_ID, record: record };
  } catch (error) {
    return kspMaintenanceFailure(error);
  }
}

function kspUpdateMeetingMaintenance(environment, rawInput) {
  var warnings = [];
  var actor = kspGetMaintenanceActorSafely(environment, warnings);
  var context = null;
  var claim = null;
  var snapshot = null;
  var currentRow = null;
  try {
    context = kspLoadMaintenanceContext(environment);
    var input = kspNormalizeMeetingEditInput(rawInput);
    var selected = kspValidateMeetingEditInput(input, context.catalog);
    claim = environment.claimRecordEdit(
      'Meeting', input.meetingId, KSP_SHEET_NAMES.MEETING_INDEX,
      'Meeting_ID', 'Version', input.expectedVersion, environment.nowIso(), KSP_MAINTENANCE_LIMITS.EDIT_CLAIM_TTL_MS
    );
    currentRow = claim.row;
    kspAssert(String(currentRow.Status || '') === KSP_STATUS.ACTIVE,
      'MEETING_NOT_ACTIVE', 'Activeな面談だけ編集できます。');
    var filename = kspBuildMeetingFilename(input, selected, input.meetingId);
    var documentText = kspBuildMeetingDocumentText(input, selected);
    snapshot = environment.getDocumentSnapshot(String(currentRow.Doc_File_ID || ''));
    environment.updateMeetingDocument(String(currentRow.Doc_File_ID || ''), filename, documentText);
    var nowIso = environment.nowIso();
    var updatedRow = kspBuildMeetingEditedRow(currentRow, input, actor, nowIso, filename);
    var committed = environment.commitClaimedRowEdit(
      claim, KSP_SHEET_NAMES.MEETING_INDEX, 'Meeting_ID', input.meetingId,
      'Version', input.expectedVersion, updatedRow
    );
    kspTryMaintenanceAudit(environment, context.auditSpreadsheetId, {
      timestamp: environment.nowIso(), actor: actor, action: KSP_MAINTENANCE_ACTIONS.MEETING_UPDATE,
      targetType: 'Meeting', targetId: input.meetingId, result: KSP_AUDIT_RESULTS.SUCCESS,
      before: kspMeetingAuditSnapshot(currentRow), after: kspMeetingAuditSnapshot(committed),
      changedFields: kspChangedMetadataFields(kspMeetingAuditSnapshot(currentRow), kspMeetingAuditSnapshot(committed))
    }, warnings);
    return { ok: true, workId: KSP_MAINTENANCE_WORK_ID,
      record: kspMapMeetingSearchResult(committed, kspBuildCatalogMaps(context.catalog)), warnings: warnings };
  } catch (error) {
    if (snapshot && currentRow) {
      try {
        if (!claim || environment.isRecordEditClaimOwned(claim)) {
          environment.restoreDocumentSnapshot(String(currentRow.Doc_File_ID || ''), snapshot);
        } else {
          warnings.push({ code: 'MEETING_DOCUMENT_RESTORE_SKIPPED', message: '編集権が別処理へ移ったため、古いDoc snapshotの復元を行いませんでした。' });
        }
      } catch (restoreError) { warnings.push({ code: 'MEETING_DOCUMENT_RESTORE_FAILED', message: restoreError.message || String(restoreError) }); }
    }
    if (claim) {
      try { environment.releaseRecordEditClaim(claim); }
      catch (releaseError) { warnings.push({ code: 'MEETING_EDIT_CLAIM_RELEASE_FAILED', message: releaseError.message || String(releaseError) }); }
    }
    if (context) {
      kspTryMaintenanceAudit(environment, context.auditSpreadsheetId, {
        timestamp: environment.nowIso(), actor: actor, action: KSP_MAINTENANCE_ACTIONS.MEETING_UPDATE,
        targetType: 'Meeting', targetId: rawInput && rawInput.meetingId,
        result: KSP_AUDIT_RESULTS.FAILURE, errorCode: kspGetErrorCode(error), errorMessage: error.message || String(error)
      }, warnings);
    }
    return kspMaintenanceFailure(error, warnings);
  }
}

function kspChangeMeetingStatus(environment, rawInput) {
  var warnings = [];
  var actor = kspGetMaintenanceActorSafely(environment, warnings);
  var context = null;
  try {
    context = kspLoadMaintenanceContext(environment);
    var input = rawInput || {};
    var meetingId = kspMaintenanceTrim(input.meetingId);
    var expectedVersion = Number(input.expectedVersion);
    kspAssert(Number.isFinite(expectedVersion) && expectedVersion > 0 && Math.floor(expectedVersion) === expectedVersion,
      'MEETING_EXPECTED_VERSION_INVALID', 'Meeting Versionが不正です。');
    var targetStatus = kspMaintenanceTrim(input.targetStatus);
    kspParseMeetingId(meetingId);
    kspAssert(targetStatus === KSP_STATUS.ACTIVE || targetStatus === KSP_STATUS.INACTIVE,
      'MEETING_TARGET_STATUS_INVALID', '面談Statusが不正です。');
    var result = environment.updateStatusAtomic(
      KSP_SHEET_NAMES.MEETING_INDEX, 'Meeting_ID', meetingId,
      'Version', expectedVersion, targetStatus, actor, environment.nowIso()
    );
    var action = targetStatus === KSP_STATUS.ACTIVE
      ? KSP_MAINTENANCE_ACTIONS.MEETING_REACTIVATE : KSP_MAINTENANCE_ACTIONS.MEETING_DEACTIVATE;
    kspTryMaintenanceAudit(environment, context.auditSpreadsheetId, {
      timestamp: environment.nowIso(), actor: actor, action: action,
      targetType: 'Meeting', targetId: meetingId, result: KSP_AUDIT_RESULTS.SUCCESS,
      before: kspMeetingAuditSnapshot(result.before), after: kspMeetingAuditSnapshot(result.after),
      changedFields: ['Status', 'Version', 'Updated_At', 'Updated_By', 'AI_Index_Status']
    }, warnings);
    return { ok: true, workId: KSP_MAINTENANCE_WORK_ID,
      record: kspMapMeetingSearchResult(result.after, kspBuildCatalogMaps(context.catalog)), warnings: warnings };
  } catch (error) {
    if (context) kspTryMaintenanceAudit(environment, context.auditSpreadsheetId, {
      timestamp: environment.nowIso(), actor: actor,
      action: rawInput && rawInput.targetStatus === KSP_STATUS.ACTIVE
        ? KSP_MAINTENANCE_ACTIONS.MEETING_REACTIVATE : KSP_MAINTENANCE_ACTIONS.MEETING_DEACTIVATE,
      targetType: 'Meeting', targetId: rawInput && rawInput.meetingId,
      result: KSP_AUDIT_RESULTS.FAILURE, errorCode: kspGetErrorCode(error), errorMessage: error.message || String(error)
    }, warnings);
    return kspMaintenanceFailure(error, warnings);
  }
}
