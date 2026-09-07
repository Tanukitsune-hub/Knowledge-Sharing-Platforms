// Parent binding and relation-only updates. No Docs/Drive content mutation here.
function kspRequirePitchbookParent_(environment, backendId, meetingId, expectedVersion) {
  kspAssert_(/^MTG-\d{6}$/.test(String(meetingId || '')), 'PITCHBOOK_PARENT_REQUIRED', '保存済みの記録を選択してください。');
  var parent = environment.findRowByKey(backendId, KSP_SHEET_NAMES.MEETING_INDEX, 'Meeting_ID', meetingId);
  kspAssert_(parent && String(parent.Status) === KSP_STATUS.ACTIVE && parent.Doc_File_ID,
    'PITCHBOOK_PARENT_UNAVAILABLE', '親記録が存在しないか利用できません。');
  kspAssert_(Number.isInteger(Number(expectedVersion)) && Number(expectedVersion) > 0 &&
    Number(parent.Version) === Number(expectedVersion), 'STALE_RECORD_VERSION', '親記録の最新情報を読み直してください。');
  return parent;
}

function kspApplyPitchbookParentContext_(input, parent) {
  input.counterpartyType = kspMeetingCounterpartyType_(parent);
  input.counterpartyId = kspMeetingCounterpartyId_(parent);
  input.gpId = input.counterpartyType === 'GP' ? input.counterpartyId : '';
  input.relatedGpIds = kspMeetingRelatedGpIds_(parent);
  input.date = input.date || kspCanonicalBusinessDate_(parent.Date);
  input.assetClassId = input.assetClassId || String(parent.Asset_Class_ID || '');
  input.capitalTypeId = input.capitalTypeId || String(parent.Capital_Type_ID || '');
  input.fundStrategy = input.fundStrategy || String(parent.Fund_Strategy || '');
}

function kspRequirePitchbookCounterparty_(input, catalog) {
  var entity = (catalog.counterpartyEntities || []).filter(function (item) {
    return item.type === input.counterpartyType && item.id === input.counterpartyId;
  })[0];
  kspAssert_(entity, 'PITCHBOOK_COUNTERPARTY_UNAVAILABLE', '親記録の面談先を確認してください。');
  return entity;
}

function kspRelationIds_(row) {
  return String(row.Related_Pitchbook_IDs || '').split(',').map(function (id) { return id.trim(); }).filter(Boolean);
}

function kspBuildMeetingRelationPatch_(parent, document, input, actor, nowIso) {
  kspAssert_(parent && parent.Status === KSP_STATUS.ACTIVE, 'PITCHBOOK_PARENT_UNAVAILABLE', '有効な記録を選択してください。');
  kspAssert_(document && document.Document_ID === input.documentId && document.File_ID &&
    (document.Status === KSP_STATUS.ACTIVE || document.Status === KSP_STATUS.INACTIVE),
    'PITCHBOOK_AUTHORITATIVE_FILE_MISSING', '資料の原本を確認できません。');
  kspAssert_(input.operation === 'add' || input.operation === 'remove', 'RELATION_OPERATION_INVALID', '関連操作が不正です。');
  var ids = kspRelationIds_(parent), present = ids.indexOf(input.documentId) !== -1;
  // Readback replay is safe even if the successful earlier response was lost.
  if ((input.operation === 'add') === present) return {};
  kspAssert_(Number.isInteger(Number(input.expectedVersion)) && Number(input.expectedVersion) > 0 &&
    Number(parent.Version) === Number(input.expectedVersion), 'STALE_RECORD_VERSION', '最新の記録を読み直してください。');
  if (input.operation === 'add') ids.push(input.documentId);
  else ids = ids.filter(function (id) { return id !== input.documentId; });
  return { Related_Pitchbook_IDs: ids.join(','), Version: Number(parent.Version) + 1,
    Updated_At: nowIso, Updated_By: actor, AI_Index_Status: KSP_AI_INDEX_STATUS.PENDING, AI_Last_Error: '' };
}

function kspUpdateMeetingRelations_(environment, rawInput) {
  var input = rawInput || {}, warnings = [];
  try {
    kspAssert_(/^MTG-\d{6}$/.test(String(input.meetingId || '')) && /^DOC-\d{6}$/.test(String(input.documentId || '')),
      'RELATION_ID_INVALID', '記録または資料のIDが不正です。');
    var actor = kspGetMaintenanceActorSafely_(environment, warnings);
    var result = environment.updateMeetingRelationsAtomic({meetingId:String(input.meetingId),
      documentId:String(input.documentId),expectedVersion:Number(input.expectedVersion),operation:String(input.operation)}, actor, environment.nowIso());
    var state = environment.getInstallationState();
    kspTryMaintenanceAudit_(environment, state.resources[KSP_RESOURCE_KEYS.AUDIT_SPREADSHEET], {
      timestamp:environment.nowIso(),actor:actor,action:'MEETING_RELATION_' + String(input.operation).toUpperCase(),
      targetType:'Meeting',targetId:String(input.meetingId),result:KSP_AUDIT_RESULTS.SUCCESS,
      changedFields:['Related_Pitchbook_IDs'],after:{Document_ID:String(input.documentId),Version:Number(result.Version)}
    }, warnings);
    return {ok:true, meetingId:String(result.Meeting_ID), version:Number(result.Version),
      relatedPitchbookIds:kspRelationIds_(result), warnings:warnings};
  } catch (error) { return kspMaintenanceFailure_(error, warnings); }
}

function kspAssertNoParentEditClaim_(properties, meetingId, nowIso) {
  var key = kspMaintenanceClaimKey_('Meeting', meetingId);
  var claim = kspSafeParseJson_(properties.getProperty(key), key);
  kspAssert_(!claim || Number(claim.expiresAtMs || 0) <= new Date(kspCanonicalInstantIso_(nowIso)).getTime(),
    'RECORD_EDIT_IN_PROGRESS', '記録の処理中です。完了後に再試行してください。');
}

function kspAttachParentRelationAdapters_(environment, properties) {
  environment.updateMeetingRelationsAtomic = function (input, actor, nowIso) {
    var lock = kspMaintenanceAcquireLock_('relation-only update');
    try {
      var state = environment.getInstallationState();
      var backendId = state.resources[KSP_RESOURCE_KEYS.BACKEND_SPREADSHEET];
      var parent = kspMaintenanceFindSheetRow_(backendId, KSP_SHEET_NAMES.MEETING_INDEX, 'Meeting_ID', input.meetingId);
      var document = kspMaintenanceFindSheetRow_(backendId, KSP_SHEET_NAMES.PITCHBOOK_INDEX, 'Document_ID', input.documentId);
      kspAssertNoParentEditClaim_(properties, input.meetingId, nowIso);
      var fields = kspBuildMeetingRelationPatch_(parent && parent.row, document && document.row, input, actor, nowIso);
      if (!Object.keys(fields).length) return parent.row;
      // Dirty the derived source first. An interruption leaves conservative re-sync,
      // never a fabricated relation; authoritative retrieval always rechecks links.
      kspMaintenanceWriteSheetFieldsWithRollback_(document.sheet, document.headers, document.rowNumber,
        { AI_Index_Status:KSP_AI_INDEX_STATUS.PENDING, AI_Last_Error:'' }, document.row);
      kspMaintenanceWriteSheetFieldsWithRollback_(parent.sheet, parent.headers, parent.rowNumber, fields, parent.row);
      return Object.assign({}, parent.row, fields);
    } finally { lock.releaseLock(); }
  };
}
