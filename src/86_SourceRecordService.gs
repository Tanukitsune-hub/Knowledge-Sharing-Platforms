function kspLoadSourceRecordContext_(environment, definition) {
  var state = environment.getInstallationState();
  kspAssert_(state && state.resources, 'INSTALLATION_STATE_MISSING', 'Installation stateがありません。');
  var backendId = state.resources[KSP_RESOURCE_KEYS.BACKEND_SPREADSHEET];
  var auditId = state.resources[KSP_RESOURCE_KEYS.AUDIT_SPREADSHEET];
  var folderId = state.resources[definition.folderKey];
  kspAssert_(backendId && auditId && folderId, 'SOURCE_RESOURCE_MISSING', '記録保存先を確認できません。');
  var counterparties = environment.readRows(backendId, KSP_SHEET_NAMES.COUNTERPARTY_MASTER);
  var options = environment.readRows(backendId, KSP_SHEET_NAMES.OPTION_MASTER);
  var related = null;
  if (definition.key === 'ASSESSMENT') {
    related = {
      meetings: environment.readRows(backendId, KSP_SHEET_NAMES.MEETING_INDEX),
      documents: environment.readRows(backendId, KSP_SHEET_NAMES.PITCHBOOK_INDEX),
      news: environment.readRows(backendId, KSP_SHEET_NAMES.NEWS_INDEX)
    };
  }
  return { state: state, backendId: backendId, auditId: auditId, folderId: folderId,
    counterpartyRows: counterparties, optionRows: options, relatedRows: related,
    catalog: kspBuildMeetingCatalog_(counterparties, options) };
}

function kspGetSourceRecordBootstrapData_(environment) {
  try {
    var state = environment.getInstallationState();
    kspAssert_(state && state.resources, 'INSTALLATION_STATE_MISSING', 'Installation stateがありません。');
    var backendId = state.resources[KSP_RESOURCE_KEYS.BACKEND_SPREADSHEET];
    var catalog = kspBuildMeetingCatalog_(
      environment.readRows(backendId, KSP_SHEET_NAMES.COUNTERPARTY_MASTER),
      environment.readRows(backendId, KSP_SHEET_NAMES.OPTION_MASTER));
    return { ok: true,
      options: { counterparties: kspDeepClone_(catalog.counterparties),
        counterpartyEntities: kspDeepClone_(catalog.counterpartyEntities),
        assetClasses: kspDeepClone_(catalog.assetClasses) },
      uploadFormats: kspGetSourceUploadFormats_(),
      assessmentTypes: kspDeepClone_(KSP_ASSESSMENT_TYPES) };
  } catch (error) {
    return kspMaintenanceFailure_(error);
  }
}

function kspRegisterSourceRecord_(environment, kind, rawInput) {
  var definition = kspSourceDefinition_(kind);
  var warnings = [];
  var actor = kspGetMaintenanceActorSafely_(environment, warnings);
  var context = null, input = null, id = '', fingerprint = '', claim = null;
  try {
    context = kspLoadSourceRecordContext_(environment, definition);
    input = kspNormalizeSourceRecordInput_(definition, rawInput);
    kspValidateSourceRecordInput_(definition, input, {
      counterpartyRows: context.counterpartyRows, optionRows: context.optionRows,
      relatedRows: context.relatedRows
    });
    fingerprint = kspSourceRecordFingerprint_(input);
    id = environment.reserveSourceId(definition, context.backendId, input, actor, fingerprint, environment.nowIso());
    claim = environment.claimSourceCreate(definition, id, environment.nowIso());
    var existing = environment.findRowByKey(context.backendId, definition.sheetName, definition.idField, id);
    if (existing) {
      environment.assertSourceFilePayload(definition, context.folderId, id, input,
        kspSourceSavedFilename_(definition, input, id), String(existing.Source_File_ID || ''));
      var replayFile = { id: String(existing.Source_File_ID || ''), url: String(existing.Source_URL || '') };
      var replayRow = kspBuildSourceRecordRow_(definition, input, id, replayFile, actor,
        kspCanonicalInstantIso_(existing.Created_At), kspSourceSavedFilename_(definition, input, id));
      kspAssert_(kspSourceRowMatchesCreate_(definition, existing, replayRow),
        'SOURCE_RETRY_CONFLICT', '同じ記録IDに異なる登録内容があります。');
      if (input.inputMode === 'DIRECT_TEXT') kspAssert_(
        environment.getDocumentText(String(existing.Source_File_ID || '')) === input.directText,
        'SOURCE_RETRY_CONFLICT', '保存済み本文と再試行内容が一致しません。');
      return { ok: true, record: kspMapSourceRecord_(definition, existing,
        kspBuildAllMasterMaps_(context.counterpartyRows, context.optionRows)),
        idempotentReplay: true, warnings: warnings };
    }
    var filename = kspSourceSavedFilename_(definition, input, id);
    var fileInfo = environment.createOrReuseSourceFile(definition, context.folderId, id, input, filename);
    var row = kspBuildSourceRecordRow_(definition, input, id, fileInfo, actor, environment.nowIso(), filename);
    var committed = environment.commitSourceRow(definition, input, row);
    kspTryMaintenanceAudit_(environment, context.auditId, {
      timestamp: environment.nowIso(), actor: actor, action: definition.key + '_REGISTER',
      targetType: definition.key === 'NEWS' ? 'News' : 'Internal Assessment', targetId: id,
      result: KSP_AUDIT_RESULTS.SUCCESS,
      after: { id: id, inputMode: input.inputMode, counterpartyIds: input.counterpartyIds.join(',') },
      changedFields: [definition.idField, 'Input_Mode', 'Counterparty_IDs']
    }, warnings);
    return { ok: true, record: kspMapSourceRecord_(definition, committed.row,
      kspBuildAllMasterMaps_(context.counterpartyRows, context.optionRows)),
      idempotentReplay: !committed.inserted, warnings: warnings };
  } catch (error) {
    return { ok: false,
      error: { code: kspGetErrorCode_(error), message: kspSafePublicErrorMessage_(kspGetErrorCode_(error), 'MAINTENANCE') },
      retry: id && fingerprint ? { retryRecordId: id, retryFingerprint: fingerprint,
        requestId: input ? input.requestId : '' } : null,
      warnings: warnings };
  } finally {
    if (claim) {
      try { environment.releaseSourceCreate(claim); }
      catch (ignoredRelease) { /* TTL prevents a stale create claim from becoming permanent. */ }
    }
  }
}
