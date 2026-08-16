function kspGetPitchbookMaintenanceRecord(environment, documentId) {
  try {
    var context = kspLoadMaintenanceContext(environment);
    var row = kspRequireSingleRow(context.pitchbookRows, 'Document_ID', documentId, 'PITCHBOOK_NOT_FOUND');
    return { ok: true, workId: KSP_MAINTENANCE_WORK_ID,
      record: kspMapPitchbookSearchResult(row, kspBuildCatalogMaps(context.catalog)) };
  } catch (error) {
    return kspMaintenanceFailure(error);
  }
}

function kspUpdatePitchbookMaintenance(environment, rawInput) {
  var warnings = [];
  var actor = kspGetMaintenanceActorSafely(environment, warnings);
  var context = null;
  var claim = null;
  var fileSnapshot = null;
  var currentRow = null;
  try {
    context = kspLoadMaintenanceContext(environment);
    var input = kspNormalizePitchbookEditInput(rawInput);
    var selected = kspValidatePitchbookEditInput(input, context.catalog);
    claim = environment.claimRecordEdit(
      'Pitchbook', input.documentId, KSP_SHEET_NAMES.PITCHBOOK_INDEX,
      'Document_ID', 'Updated_At', input.expectedUpdatedAt, environment.nowIso(), KSP_MAINTENANCE_LIMITS.EDIT_CLAIM_TTL_MS
    );
    currentRow = claim.row;
    kspAssert(String(currentRow.File_ID || ''), 'PITCHBOOK_AUTHORITATIVE_FILE_MISSING',
      'Drive原本がない資料はメタデータ編集できません。');
    var sequenceNo = Number(currentRow.Sequence_No || 0);
    if (kspPitchbookContextChanged(currentRow, input)) {
      sequenceNo = environment.reservePitchbookEditSequence(claim, input);
    }
    var filename = kspBuildPitchbookSavedFilename(input, selected, sequenceNo, currentRow.Original_Filename);
    fileSnapshot = environment.getDriveFileSnapshot(String(currentRow.File_ID));
    environment.renameDriveFile(String(currentRow.File_ID), filename);
    var nowIso = environment.nowIso();
    var updatedRow = kspBuildPitchbookEditedRow(currentRow, input, actor, nowIso, sequenceNo, filename);
    var committed = environment.commitClaimedRowEdit(
      claim, KSP_SHEET_NAMES.PITCHBOOK_INDEX, 'Document_ID', input.documentId,
      'Updated_At', input.expectedUpdatedAt, updatedRow
    );
    kspTryMaintenanceAudit(environment, context.auditSpreadsheetId, {
      timestamp: environment.nowIso(), actor: actor, action: KSP_MAINTENANCE_ACTIONS.PITCHBOOK_UPDATE,
      targetType: 'Pitchbook', targetId: input.documentId, batchId: currentRow.Batch_ID,
      result: KSP_AUDIT_RESULTS.SUCCESS, before: kspPitchbookAuditSnapshot(currentRow),
      after: kspPitchbookAuditSnapshot(committed),
      changedFields: kspChangedMetadataFields(kspPitchbookAuditSnapshot(currentRow), kspPitchbookAuditSnapshot(committed))
    }, warnings);
    return { ok: true, workId: KSP_MAINTENANCE_WORK_ID,
      record: kspMapPitchbookSearchResult(committed, kspBuildCatalogMaps(context.catalog)), warnings: warnings };
  } catch (error) {
    if (fileSnapshot && currentRow) {
      try {
        if (!claim || environment.isRecordEditClaimOwned(claim)) {
          environment.restoreDriveFileSnapshot(String(currentRow.File_ID || ''), fileSnapshot);
        } else {
          warnings.push({ code: 'PITCHBOOK_FILENAME_RESTORE_SKIPPED', message: '編集権が別処理へ移ったため、古いfilename snapshotの復元を行いませんでした。' });
        }
      } catch (restoreError) { warnings.push({ code: 'PITCHBOOK_FILENAME_RESTORE_FAILED', message: restoreError.message || String(restoreError) }); }
    }
    if (claim) {
      try { environment.releaseRecordEditClaim(claim); }
      catch (releaseError) { warnings.push({ code: 'PITCHBOOK_EDIT_CLAIM_RELEASE_FAILED', message: releaseError.message || String(releaseError) }); }
    }
    if (context) kspTryMaintenanceAudit(environment, context.auditSpreadsheetId, {
      timestamp: environment.nowIso(), actor: actor, action: KSP_MAINTENANCE_ACTIONS.PITCHBOOK_UPDATE,
      targetType: 'Pitchbook', targetId: rawInput && rawInput.documentId,
      result: KSP_AUDIT_RESULTS.FAILURE, errorCode: kspGetErrorCode(error), errorMessage: error.message || String(error)
    }, warnings);
    return kspMaintenanceFailure(error, warnings);
  }
}

function kspChangePitchbookStatus(environment, rawInput) {
  var warnings = [];
  var actor = kspGetMaintenanceActorSafely(environment, warnings);
  var context = null;
  try {
    context = kspLoadMaintenanceContext(environment);
    var input = rawInput || {};
    var documentId = kspMaintenanceTrim(input.documentId);
    var expectedUpdatedAt = kspMaintenanceTrim(input.expectedUpdatedAt);
    kspAssert(expectedUpdatedAt, 'PITCHBOOK_EXPECTED_UPDATED_AT_REQUIRED', '更新トークンがありません。');
    var targetStatus = kspMaintenanceTrim(input.targetStatus);
    kspParsePitchbookDocumentId(documentId);
    kspAssert(targetStatus === KSP_STATUS.ACTIVE || targetStatus === KSP_STATUS.INACTIVE,
      'PITCHBOOK_TARGET_STATUS_INVALID', 'Pitchbook Statusが不正です。');
    var result = environment.updatePitchbookStatusAtomic(
      documentId, expectedUpdatedAt, targetStatus, actor, environment.nowIso()
    );
    var action = targetStatus === KSP_STATUS.ACTIVE
      ? KSP_MAINTENANCE_ACTIONS.PITCHBOOK_REACTIVATE : KSP_MAINTENANCE_ACTIONS.PITCHBOOK_DEACTIVATE;
    kspTryMaintenanceAudit(environment, context.auditSpreadsheetId, {
      timestamp: environment.nowIso(), actor: actor, action: action,
      targetType: 'Pitchbook', targetId: documentId, batchId: result.after.Batch_ID,
      result: KSP_AUDIT_RESULTS.SUCCESS, before: kspPitchbookAuditSnapshot(result.before),
      after: kspPitchbookAuditSnapshot(result.after),
      changedFields: ['Status', 'Updated_At', 'Updated_By', 'AI_Index_Status']
    }, warnings);
    return { ok: true, workId: KSP_MAINTENANCE_WORK_ID,
      record: kspMapPitchbookSearchResult(result.after, kspBuildCatalogMaps(context.catalog)), warnings: warnings };
  } catch (error) {
    if (context) kspTryMaintenanceAudit(environment, context.auditSpreadsheetId, {
      timestamp: environment.nowIso(), actor: actor,
      action: rawInput && rawInput.targetStatus === KSP_STATUS.ACTIVE
        ? KSP_MAINTENANCE_ACTIONS.PITCHBOOK_REACTIVATE : KSP_MAINTENANCE_ACTIONS.PITCHBOOK_DEACTIVATE,
      targetType: 'Pitchbook', targetId: rawInput && rawInput.documentId,
      result: KSP_AUDIT_RESULTS.FAILURE, errorCode: kspGetErrorCode(error), errorMessage: error.message || String(error)
    }, warnings);
    return kspMaintenanceFailure(error, warnings);
  }
}

function kspMutateMaster(environment, rawInput) {
  var warnings = [];
  var actor = kspGetMaintenanceActorSafely(environment, warnings);
  var context = null;
  try {
    context = kspLoadMaintenanceContext(environment);
    var input = kspValidateMasterMutation(kspNormalizeMasterMutation(rawInput));
    var result = environment.mutateMasterAtomic(input, actor, environment.nowIso());
    var action = kspMasterActionName(input);
    var beforeAudit = result.before ? kspMasterAuditSnapshot(input.entity, result.before) : null;
    var afterAudit = kspMasterAuditSnapshot(input.entity, result.after);
    var changedFields = result.before
      ? kspChangedMetadataFields(beforeAudit, afterAudit)
      : Object.keys(afterAudit);
    if (input.entity === KSP_MASTER_ENTITY.OPTION && input.action === KSP_MASTER_MUTATION.REORDER) {
      beforeAudit = { moved: beforeAudit, affectedOptions: kspOptionOrderAuditSnapshot(result.affectedBefore) };
      afterAudit = { moved: afterAudit, affectedOptions: kspOptionOrderAuditSnapshot(result.affectedRows) };
      changedFields = ['Option_Order'];
    }
    kspTryMaintenanceAudit(environment, context.auditSpreadsheetId, {
      timestamp: environment.nowIso(), actor: actor, action: action,
      targetType: input.entity === KSP_MASTER_ENTITY.GP ? 'GP_Master' : 'Option_Master',
      targetId: input.entity === KSP_MASTER_ENTITY.GP ? result.after.GP_ID : result.after.Option_ID,
      result: KSP_AUDIT_RESULTS.SUCCESS,
      before: beforeAudit,
      after: afterAudit,
      changedFields: changedFields
    }, warnings);
    var refreshed = kspLoadMaintenanceContext(environment);
    return { ok: true, workId: KSP_MAINTENANCE_WORK_ID,
      record: result.after, masters: kspBuildMasterResponse(refreshed.gpRows, refreshed.optionRows), warnings: warnings };
  } catch (error) {
    if (context) kspTryMaintenanceAudit(environment, context.auditSpreadsheetId, {
      timestamp: environment.nowIso(), actor: actor,
      action: kspMasterActionName(kspNormalizeMasterMutation(rawInput || {})),
      targetType: rawInput && rawInput.entity, targetId: rawInput && rawInput.id,
      result: KSP_AUDIT_RESULTS.FAILURE, errorCode: kspGetErrorCode(error), errorMessage: error.message || String(error)
    }, warnings);
    return kspMaintenanceFailure(error, warnings);
  }
}

function kspQuickAddGp(environment, name) {
  var result = kspMutateMaster(environment, { entity: KSP_MASTER_ENTITY.GP, action: KSP_MASTER_MUTATION.ADD, name: name, returnExistingOnDuplicate: true });
  if (result.ok) result.gp = { id: result.record.GP_ID, name: result.record.GP_Name, status: result.record.Status };
  return result;
}

function kspRunAuditRetentionCleanup(environment) {
  var warnings = [];
  var actor = kspGetMaintenanceActorSafely(environment, warnings);
  var context = null;
  try {
    context = kspLoadMaintenanceContext(environment);
    var nowIso = environment.nowIso();
    var cutoff = kspAuditRetentionCutoff(nowIso, KSP_AUDIT_RETENTION_YEARS);
    var result = environment.deleteAuditRowsBefore(context.auditSpreadsheetId, cutoff);
    kspTryMaintenanceAudit(environment, context.auditSpreadsheetId, {
      timestamp: environment.nowIso(), actor: actor, action: KSP_MAINTENANCE_ACTIONS.AUDIT_RETENTION_CLEANUP,
      targetType: 'Audit_Log', targetId: '', result: KSP_AUDIT_RESULTS.SUCCESS,
      after: { cutoff: cutoff, deletedRows: result.deletedRows }, changedFields: ['deletedRows']
    }, warnings);
    return { ok: true, workId: KSP_MAINTENANCE_WORK_ID,
      cutoff: cutoff, deletedRows: result.deletedRows, warnings: warnings };
  } catch (error) {
    return kspMaintenanceFailure(error, warnings);
  }
}
