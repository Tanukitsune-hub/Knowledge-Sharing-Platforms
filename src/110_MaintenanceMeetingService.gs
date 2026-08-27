function kspGetPhase1Diagnostics_(environment) {
  try {
    var state = environment.getInstallationState();
    kspAssert_(state && state.resources, 'INSTALLATION_STATE_MISSING', 'Installation stateがありません。');
    var backendId = state.resources[KSP_RESOURCE_KEYS.BACKEND_SPREADSHEET] || '';
    var auditId = state.resources[KSP_RESOURCE_KEYS.AUDIT_SPREADSHEET] || '';
    var backendHeaders = {};
    var auditHeaders = {};
    Object.keys(kspGetBackendSchemas_()).forEach(function (sheetName) {
      backendHeaders[sheetName] = environment.getSheetHeaders(backendId, sheetName);
    });
    Object.keys(kspGetAuditSchema_()).forEach(function (sheetName) {
      auditHeaders[sheetName] = environment.getSheetHeaders(auditId, sheetName);
    });
    var backendChecks = kspBuildSchemaDiagnostic_(kspGetBackendSchemas_(), backendHeaders);
    var auditChecks = kspBuildSchemaDiagnostic_(kspGetAuditSchema_(), auditHeaders);
    var actorWarnings = [];
    var actor = kspGetMaintenanceActorSafely_(environment, actorWarnings);
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
      actor: { kind: kspActorKind_(actor), warningCount: actorWarnings.length },
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
    return kspMaintenanceFailure_(error);
  }
}

function kspGetPhase1MaintenanceBootstrap_(environment) {
  try {
    var context = kspLoadMaintenanceContext_(environment);
    return {
      ok: true,
      workId: KSP_MAINTENANCE_WORK_ID,
      appVersion: KSP_MAINTENANCE_APP_VERSION,
      options: kspBuildMeetingBootstrapResponse_(context.catalog).options,
      statuses: [KSP_STATUS.ACTIVE, KSP_STATUS.INACTIVE, KSP_PITCHBOOK_STATUS.PENDING, KSP_PITCHBOOK_STATUS.FAILED],
      optionTypes: [KSP_OPTION_TYPES.ASSET_CLASS, KSP_OPTION_TYPES.CAPITAL_TYPE, KSP_OPTION_TYPES.LOCATION,
        KSP_OPTION_TYPES.TEAM, KSP_OPTION_TYPES.COUNTERPARTY_LP, KSP_OPTION_TYPES.COUNTERPARTY_NISSAY_DEPARTMENT,
        KSP_OPTION_TYPES.COUNTERPARTY_GROUP_COMPANY, KSP_OPTION_TYPES.COUNTERPARTY_CONSULTANT_GATEKEEPER,
        KSP_OPTION_TYPES.COUNTERPARTY_OTHER],
      masters: kspBuildMasterResponse_(context.gpRows, context.optionRows)
    };
  } catch (error) {
    return kspMaintenanceFailure_(error);
  }
}

function kspSearchMeetingRecords_(environment, rawSearch) {
  try {
    var context = kspLoadMaintenanceContext_(environment);
    var search = kspValidateRecordSearch_(kspNormalizeRecordSearch_(rawSearch));
    var maps = kspBuildAllMasterMaps_(context.gpRows, context.optionRows);
    return {
      ok: true,
      workId: KSP_MAINTENANCE_WORK_ID,
      records: kspSearchRows_(context.meetingRows, search, function (row) {
        return kspMapMeetingSearchResult_(row, maps);
      })
    };
  } catch (error) {
    return kspMaintenanceFailure_(error);
  }
}

function kspSearchPitchbookRecords_(environment, rawSearch) {
  try {
    var context = kspLoadMaintenanceContext_(environment);
    var search = kspNormalizeRecordSearch_(rawSearch);
    search.teamId = '';
    search.meetingTypeCode = '';
    search.followUpOnly = false;
    search = kspValidateRecordSearch_(search);
    var maps = kspBuildAllMasterMaps_(context.gpRows, context.optionRows);
    return {
      ok: true,
      workId: KSP_MAINTENANCE_WORK_ID,
      records: kspSearchRows_(context.pitchbookRows, search, function (row) {
        return kspMapPitchbookSearchResult_(row, maps);
      })
    };
  } catch (error) {
    return kspMaintenanceFailure_(error);
  }
}

function kspGetMeetingMaintenanceRecord_(environment, meetingId) {
  try {
    var context = kspLoadMaintenanceContext_(environment);
    var row = kspRequireSingleRow_(context.meetingRows, 'Meeting_ID', meetingId, 'MEETING_NOT_FOUND');
    var text = environment.getDocumentText(String(row.Doc_File_ID || ''));
    var parsed = kspParseMeetingDocumentText_(text);
    var maps = kspBuildAllMasterMaps_(context.gpRows, context.optionRows);
    var record = kspMapMeetingSearchResult_(row, maps);
    record.notes = parsed.notes;
    record.relatedPitchbooks = kspBuildMaintenanceRelatedPitchbookChoices_(
      context.pitchbookRows, record.relatedGpIds, row.Asset_Class_ID, record.relatedPitchbookIds
    );
    return { ok: true, workId: KSP_MAINTENANCE_WORK_ID, record: record };
  } catch (error) {
    return kspMaintenanceFailure_(error);
  }
}

function kspUpdateMeetingMaintenance_(environment, rawInput) {
  var warnings = [];
  var actor = kspGetMaintenanceActorSafely_(environment, warnings);
  var context = null;
  var claim = null;
  var snapshot = null;
  var currentRow = null;
  try {
    context = kspLoadMaintenanceContext_(environment);
    var input = kspNormalizeMeetingEditInput_(rawInput);
    claim = environment.claimRecordEdit(
      'Meeting', input.meetingId, KSP_SHEET_NAMES.MEETING_INDEX,
      'Meeting_ID', 'Version', input.expectedVersion, environment.nowIso(), KSP_MAINTENANCE_LIMITS.EDIT_CLAIM_TTL_MS
    );
    currentRow = claim.row;
    var currentTeamId = String(currentRow.Team_ID || '');
    context.catalog.teams = (context.catalog.teams || []).filter(function (team) {
      return String(team.status || '') === KSP_STATUS.ACTIVE || String(team.id || '') === currentTeamId;
    });
    var currentCounterpartyKey = kspMeetingCounterpartyType_(currentRow) + ':' + kspMeetingCounterpartyId_(currentRow);
    context.catalog.counterpartyEntities = (context.catalog.counterpartyEntities || []).filter(function (entity) {
      return String(entity.status || '') === KSP_STATUS.ACTIVE || entity.entityKey === currentCounterpartyKey;
    });
    var currentRelatedGps = kspMaintenanceSplitCodes_(kspMeetingRelatedGpIds_(currentRow));
    context.catalog.gps = (context.catalog.gps || []).filter(function (gp) {
      return String(gp.status || '') === KSP_STATUS.ACTIVE || currentRelatedGps.indexOf(String(gp.id || '')) !== -1;
    });
    context.catalog.relatedPitchbooks = kspBuildMaintenanceRelatedPitchbookChoices_(
      context.pitchbookRows, input.relatedGpIds, input.assetClassId,
      kspMaintenanceSplitCodes_(currentRow.Related_Pitchbook_IDs)
    );
    var selected = kspValidateMeetingEditInput_(input, context.catalog);
    kspAssert_(String(currentRow.Status || '') === KSP_STATUS.ACTIVE,
      'MEETING_NOT_ACTIVE', 'Activeな面談だけ編集できます。');
    var filename = kspBuildMeetingFilename_(input, selected, input.meetingId);
    var documentText = kspBuildMeetingDocumentText_(input, selected);
    snapshot = environment.getDocumentSnapshot(String(currentRow.Doc_File_ID || ''));
    environment.updateMeetingDocument(String(currentRow.Doc_File_ID || ''), filename, documentText);
    var nowIso = environment.nowIso();
    var updatedRow = kspBuildMeetingEditedRow_(currentRow, input, actor, nowIso, filename);
    var committed = environment.commitClaimedRowEdit(
      claim, KSP_SHEET_NAMES.MEETING_INDEX, 'Meeting_ID', input.meetingId,
      'Version', input.expectedVersion, updatedRow
    );
    kspTryMaintenanceAudit_(environment, context.auditSpreadsheetId, {
      timestamp: environment.nowIso(), actor: actor, action: KSP_MAINTENANCE_ACTIONS.MEETING_UPDATE,
      targetType: 'Meeting', targetId: input.meetingId, result: KSP_AUDIT_RESULTS.SUCCESS,
      before: kspMeetingAuditSnapshot_(currentRow), after: kspMeetingAuditSnapshot_(committed),
      changedFields: kspChangedMetadataFields_(kspMeetingAuditSnapshot_(currentRow), kspMeetingAuditSnapshot_(committed))
    }, warnings);
    return { ok: true, workId: KSP_MAINTENANCE_WORK_ID,
      record: kspMapMeetingSearchResult_(committed, kspBuildCatalogMaps_(context.catalog)), warnings: warnings };
  } catch (error) {
    if (snapshot && currentRow) {
      try {
        if (!claim || environment.isRecordEditClaimOwned(claim)) {
          environment.restoreDocumentSnapshot(String(currentRow.Doc_File_ID || ''), snapshot);
        } else {
          warnings.push({ code: 'MEETING_DOCUMENT_RESTORE_SKIPPED', message: '編集権が別処理へ移ったため、古いDoc snapshotの復元を行いませんでした。' });
        }
      } catch (restoreError) { warnings.push({ code: 'MEETING_DOCUMENT_RESTORE_FAILED', message: kspSafeOperationalWarning_('MEETING_DOCUMENT_RESTORE_FAILED') }); }
    }
    if (claim) {
      try { environment.releaseRecordEditClaim(claim); }
      catch (releaseError) { warnings.push({ code: 'MEETING_EDIT_CLAIM_RELEASE_FAILED', message: kspSafeOperationalWarning_('MEETING_EDIT_CLAIM_RELEASE_FAILED') }); }
    }
    if (context) {
      kspTryMaintenanceAudit_(environment, context.auditSpreadsheetId, {
        timestamp: environment.nowIso(), actor: actor, action: KSP_MAINTENANCE_ACTIONS.MEETING_UPDATE,
        targetType: 'Meeting', targetId: rawInput && rawInput.meetingId,
        result: KSP_AUDIT_RESULTS.FAILURE, errorCode: kspGetErrorCode_(error), errorMessage: kspSafePublicErrorMessage_(kspGetErrorCode_(error), 'MAINTENANCE')
      }, warnings);
    }
    return kspMaintenanceFailure_(error, warnings);
  }
}

function kspChangeMeetingStatus_(environment, rawInput) {
  var warnings = [];
  var actor = kspGetMaintenanceActorSafely_(environment, warnings);
  var context = null;
  try {
    context = kspLoadMaintenanceContext_(environment);
    var input = rawInput || {};
    var meetingId = kspMaintenanceTrim_(input.meetingId);
    var expectedVersion = Number(input.expectedVersion);
    kspAssert_(Number.isFinite(expectedVersion) && expectedVersion > 0 && Math.floor(expectedVersion) === expectedVersion,
      'MEETING_EXPECTED_VERSION_INVALID', 'Meeting Versionが不正です。');
    var targetStatus = kspMaintenanceTrim_(input.targetStatus);
    kspParseMeetingId_(meetingId);
    kspAssert_(targetStatus === KSP_STATUS.ACTIVE || targetStatus === KSP_STATUS.INACTIVE,
      'MEETING_TARGET_STATUS_INVALID', '面談Statusが不正です。');
    var result = environment.updateStatusAtomic(
      KSP_SHEET_NAMES.MEETING_INDEX, 'Meeting_ID', meetingId,
      'Version', expectedVersion, targetStatus, actor, environment.nowIso()
    );
    var action = targetStatus === KSP_STATUS.ACTIVE
      ? KSP_MAINTENANCE_ACTIONS.MEETING_REACTIVATE : KSP_MAINTENANCE_ACTIONS.MEETING_DEACTIVATE;
    kspTryMaintenanceAudit_(environment, context.auditSpreadsheetId, {
      timestamp: environment.nowIso(), actor: actor, action: action,
      targetType: 'Meeting', targetId: meetingId, result: KSP_AUDIT_RESULTS.SUCCESS,
      before: kspMeetingAuditSnapshot_(result.before), after: kspMeetingAuditSnapshot_(result.after),
      changedFields: ['Status', 'Version', 'Updated_At', 'Updated_By', 'AI_Index_Status']
    }, warnings);
    return { ok: true, workId: KSP_MAINTENANCE_WORK_ID,
      record: kspMapMeetingSearchResult_(result.after, kspBuildCatalogMaps_(context.catalog)), warnings: warnings };
  } catch (error) {
    if (context) kspTryMaintenanceAudit_(environment, context.auditSpreadsheetId, {
      timestamp: environment.nowIso(), actor: actor,
      action: rawInput && rawInput.targetStatus === KSP_STATUS.ACTIVE
        ? KSP_MAINTENANCE_ACTIONS.MEETING_REACTIVATE : KSP_MAINTENANCE_ACTIONS.MEETING_DEACTIVATE,
      targetType: 'Meeting', targetId: rawInput && rawInput.meetingId,
      result: KSP_AUDIT_RESULTS.FAILURE, errorCode: kspGetErrorCode_(error), errorMessage: kspSafePublicErrorMessage_(kspGetErrorCode_(error), 'MAINTENANCE')
    }, warnings);
    return kspMaintenanceFailure_(error, warnings);
  }
}
