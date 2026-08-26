function kspGetPitchbookMaintenanceRecord_(environment, documentId) {
  try {
    var context = kspLoadMaintenanceContext_(environment);
    var row = kspRequireSingleRow_(context.pitchbookRows, 'Document_ID', documentId, 'PITCHBOOK_NOT_FOUND');
    return { ok: true, workId: KSP_MAINTENANCE_WORK_ID,
      record: kspMapPitchbookSearchResult_(row, kspBuildCatalogMaps_(context.catalog)) };
  } catch (error) {
    return kspMaintenanceFailure_(error);
  }
}

function kspUpdatePitchbookMaintenance_(environment, rawInput) {
  var warnings = [];
  var actor = kspGetMaintenanceActorSafely_(environment, warnings);
  var context = null;
  var claim = null;
  var fileSnapshot = null;
  var currentRow = null;
  try {
    context = kspLoadMaintenanceContext_(environment);
    var input = kspNormalizePitchbookEditInput_(rawInput);
    var selected = kspValidatePitchbookEditInput_(input, context.catalog);
    claim = environment.claimRecordEdit(
      'Pitchbook', input.documentId, KSP_SHEET_NAMES.PITCHBOOK_INDEX,
      'Document_ID', 'Updated_At', input.expectedUpdatedAt, environment.nowIso(), KSP_MAINTENANCE_LIMITS.EDIT_CLAIM_TTL_MS
    );
    currentRow = claim.row;
    kspAssert_(String(currentRow.File_ID || ''), 'PITCHBOOK_AUTHORITATIVE_FILE_MISSING',
      'Drive原本がない資料はメタデータ編集できません。');
    var sequenceNo = Number(currentRow.Sequence_No || 0);
    if (kspPitchbookContextChanged_(currentRow, input)) {
      sequenceNo = environment.reservePitchbookEditSequence(claim, input);
    }
    var filename = kspBuildPitchbookSavedFilename_(input, selected, sequenceNo, currentRow.Original_Filename);
    fileSnapshot = environment.getDriveFileSnapshot(String(currentRow.File_ID));
    environment.renameDriveFile(String(currentRow.File_ID), filename);
    var nowIso = environment.nowIso();
    var updatedRow = kspBuildPitchbookEditedRow_(currentRow, input, actor, nowIso, sequenceNo, filename);
    var committed = environment.commitClaimedPitchbookEdit(
      claim, input.documentId, input.expectedUpdatedAt, updatedRow
    );
    kspTryMaintenanceAudit_(environment, context.auditSpreadsheetId, {
      timestamp: environment.nowIso(), actor: actor, action: KSP_MAINTENANCE_ACTIONS.PITCHBOOK_UPDATE,
      targetType: 'Pitchbook', targetId: input.documentId, batchId: currentRow.Batch_ID,
      result: KSP_AUDIT_RESULTS.SUCCESS, before: kspPitchbookAuditSnapshot_(currentRow),
      after: kspPitchbookAuditSnapshot_(committed),
      changedFields: kspChangedMetadataFields_(kspPitchbookAuditSnapshot_(currentRow), kspPitchbookAuditSnapshot_(committed))
    }, warnings);
    return { ok: true, workId: KSP_MAINTENANCE_WORK_ID,
      record: kspMapPitchbookSearchResult_(committed, kspBuildCatalogMaps_(context.catalog)), warnings: warnings };
  } catch (error) {
    if (fileSnapshot && currentRow) {
      try {
        if (!claim || environment.isRecordEditClaimOwned(claim)) {
          environment.restoreDriveFileSnapshot(String(currentRow.File_ID || ''), fileSnapshot);
        } else {
          warnings.push({ code: 'PITCHBOOK_FILENAME_RESTORE_SKIPPED', message: '編集権が別処理へ移ったため、古いfilename snapshotの復元を行いませんでした。' });
        }
      } catch (restoreError) { warnings.push({ code: 'PITCHBOOK_FILENAME_RESTORE_FAILED', message: kspSafeOperationalWarning_('PITCHBOOK_FILENAME_RESTORE_FAILED') }); }
    }
    if (claim) {
      try { environment.releaseRecordEditClaim(claim); }
      catch (releaseError) { warnings.push({ code: 'PITCHBOOK_EDIT_CLAIM_RELEASE_FAILED', message: kspSafeOperationalWarning_('PITCHBOOK_EDIT_CLAIM_RELEASE_FAILED') }); }
    }
    if (context) kspTryMaintenanceAudit_(environment, context.auditSpreadsheetId, {
      timestamp: environment.nowIso(), actor: actor, action: KSP_MAINTENANCE_ACTIONS.PITCHBOOK_UPDATE,
      targetType: 'Pitchbook', targetId: rawInput && rawInput.documentId,
      result: KSP_AUDIT_RESULTS.FAILURE, errorCode: kspGetErrorCode_(error), errorMessage: kspSafePublicErrorMessage_(kspGetErrorCode_(error), 'MAINTENANCE')
    }, warnings);
    return kspMaintenanceFailure_(error, warnings);
  }
}

function kspChangePitchbookStatus_(environment, rawInput) {
  var warnings = [];
  var actor = kspGetMaintenanceActorSafely_(environment, warnings);
  var context = null;
  try {
    context = kspLoadMaintenanceContext_(environment);
    var input = rawInput || {};
    var documentId = kspMaintenanceTrim_(input.documentId);
    var expectedUpdatedAt = kspMaintenanceTrim_(input.expectedUpdatedAt);
    kspAssert_(expectedUpdatedAt, 'PITCHBOOK_EXPECTED_UPDATED_AT_REQUIRED', '更新トークンがありません。');
    var targetStatus = kspMaintenanceTrim_(input.targetStatus);
    kspParseDocumentId_(documentId);
    kspAssert_(targetStatus === KSP_STATUS.ACTIVE || targetStatus === KSP_STATUS.INACTIVE,
      'PITCHBOOK_TARGET_STATUS_INVALID', 'Pitchbook Statusが不正です。');
    var result = environment.updatePitchbookStatusAtomic(
      documentId, expectedUpdatedAt, targetStatus, actor, environment.nowIso()
    );
    var action = targetStatus === KSP_STATUS.ACTIVE
      ? KSP_MAINTENANCE_ACTIONS.PITCHBOOK_REACTIVATE : KSP_MAINTENANCE_ACTIONS.PITCHBOOK_DEACTIVATE;
    kspTryMaintenanceAudit_(environment, context.auditSpreadsheetId, {
      timestamp: environment.nowIso(), actor: actor, action: action,
      targetType: 'Pitchbook', targetId: documentId, batchId: result.after.Batch_ID,
      result: KSP_AUDIT_RESULTS.SUCCESS, before: kspPitchbookAuditSnapshot_(result.before),
      after: kspPitchbookAuditSnapshot_(result.after),
      changedFields: ['Status', 'Updated_At', 'Updated_By', 'AI_Index_Status']
    }, warnings);
    return { ok: true, workId: KSP_MAINTENANCE_WORK_ID,
      record: kspMapPitchbookSearchResult_(result.after, kspBuildCatalogMaps_(context.catalog)), warnings: warnings };
  } catch (error) {
    if (context) kspTryMaintenanceAudit_(environment, context.auditSpreadsheetId, {
      timestamp: environment.nowIso(), actor: actor,
      action: rawInput && rawInput.targetStatus === KSP_STATUS.ACTIVE
        ? KSP_MAINTENANCE_ACTIONS.PITCHBOOK_REACTIVATE : KSP_MAINTENANCE_ACTIONS.PITCHBOOK_DEACTIVATE,
      targetType: 'Pitchbook', targetId: rawInput && rawInput.documentId,
      result: KSP_AUDIT_RESULTS.FAILURE, errorCode: kspGetErrorCode_(error), errorMessage: kspSafePublicErrorMessage_(kspGetErrorCode_(error), 'MAINTENANCE')
    }, warnings);
    return kspMaintenanceFailure_(error, warnings);
  }
}

function kspMutateMaster_(environment, rawInput) {
  var warnings = [];
  var actor = kspGetMaintenanceActorSafely_(environment, warnings);
  var context = null;
  try {
    context = kspLoadMaintenanceContext_(environment);
    var input = kspValidateMasterMutation_(kspNormalizeMasterMutation_(rawInput));
    var result = environment.mutateMasterAtomic(input, actor, environment.nowIso());
    var action = kspMasterActionName_(input);
    var beforeAudit = result.before ? kspMasterAuditSnapshot_(input.entity, result.before) : null;
    var afterAudit = kspMasterAuditSnapshot_(input.entity, result.after);
    var changedFields = result.before
      ? kspChangedMetadataFields_(beforeAudit, afterAudit)
      : Object.keys(afterAudit);
    if (input.entity === KSP_MASTER_ENTITY.OPTION && input.action === KSP_MASTER_MUTATION.REORDER) {
      beforeAudit = { moved: beforeAudit, affectedOptions: kspOptionOrderAuditSnapshot_(result.affectedBefore) };
      afterAudit = { moved: afterAudit, affectedOptions: kspOptionOrderAuditSnapshot_(result.affectedRows) };
      changedFields = ['Option_Order'];
    }
    kspTryMaintenanceAudit_(environment, context.auditSpreadsheetId, {
      timestamp: environment.nowIso(), actor: actor, action: action,
      targetType: input.entity === KSP_MASTER_ENTITY.GP ? 'GP_Master' : 'Option_Master',
      targetId: input.entity === KSP_MASTER_ENTITY.GP ? result.after.GP_ID : result.after.Option_ID,
      result: KSP_AUDIT_RESULTS.SUCCESS,
      before: beforeAudit,
      after: afterAudit,
      changedFields: changedFields
    }, warnings);
    var refreshed = kspLoadMaintenanceContext_(environment);
    return { ok: true, workId: KSP_MAINTENANCE_WORK_ID,
      record: result.after, masters: kspBuildMasterResponse_(refreshed.gpRows, refreshed.optionRows), warnings: warnings };
  } catch (error) {
    if (context) kspTryMaintenanceAudit_(environment, context.auditSpreadsheetId, {
      timestamp: environment.nowIso(), actor: actor,
      action: kspMasterActionName_(kspNormalizeMasterMutation_(rawInput || {})),
      targetType: rawInput && rawInput.entity, targetId: rawInput && rawInput.id,
      result: KSP_AUDIT_RESULTS.FAILURE, errorCode: kspGetErrorCode_(error), errorMessage: kspSafePublicErrorMessage_(kspGetErrorCode_(error), 'MAINTENANCE')
    }, warnings);
    return kspMaintenanceFailure_(error, warnings);
  }
}

function kspQuickAddGp_(environment, name) {
  var result = kspMutateMaster_(environment, { entity: KSP_MASTER_ENTITY.GP, action: KSP_MASTER_MUTATION.ADD, name: name, returnExistingOnDuplicate: true });
  if (result.ok) result.gp = { id: result.record.GP_ID, name: result.record.GP_Name, status: result.record.Status };
  return result;
}

function kspRunAuditRetentionCleanup_(environment) {
  var warnings = [];
  var actor = kspGetMaintenanceActorSafely_(environment, warnings);
  var context = null;
  try {
    context = kspLoadMaintenanceContext_(environment);
    var nowIso = environment.nowIso();
    var cutoff = kspAuditRetentionCutoff_(nowIso, KSP_AUDIT_RETENTION_YEARS);
    var result = environment.deleteAuditRowsBefore(context.auditSpreadsheetId, cutoff);
    kspTryMaintenanceAudit_(environment, context.auditSpreadsheetId, {
      timestamp: environment.nowIso(), actor: actor, action: KSP_MAINTENANCE_ACTIONS.AUDIT_RETENTION_CLEANUP,
      targetType: 'Audit_Log', targetId: '', result: KSP_AUDIT_RESULTS.SUCCESS,
      after: { cutoff: cutoff, deletedRows: result.deletedRows }, changedFields: ['deletedRows']
    }, warnings);
    return { ok: true, workId: KSP_MAINTENANCE_WORK_ID,
      cutoff: cutoff, deletedRows: result.deletedRows, warnings: warnings };
  } catch (error) {
    return kspMaintenanceFailure_(error, warnings);
  }
}
