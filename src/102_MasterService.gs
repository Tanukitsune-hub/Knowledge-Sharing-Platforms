function kspGetMasterData(environment) {
  try {
    var context = kspLoadMaintenanceContext(environment);
    return {
      ok: true,
      workId: KSP_MAINTENANCE_WORK_ID,
      masters: kspMasterResponse(context.gpRows, context.optionRows)
    };
  } catch (error) {
    return kspMaintenanceFailure(error);
  }
}

function kspAddMasterItem(environment, rawInput) {
  var warnings = [];
  var actor = kspGetMaintenanceActorSafely(environment, warnings);
  try {
    var source = rawInput && typeof rawInput === 'object' ? rawInput : {};
    var kind = kspMaintenanceTrim(source.kind).toUpperCase();
    var name = kspNormalizeMasterName(source.name);
    kspAssert(kind === 'GP' || kind === 'OPTION', 'MASTER_KIND_INVALID', 'Master kind is invalid.');
    kspAssert(name, 'MASTER_NAME_REQUIRED', '名称を入力してください。');
    var context = kspLoadMaintenanceContext(environment);
    var nowIso = environment.nowIso();
    var row;
    var action;
    var targetType;

    if (kind === 'GP') {
      kspAssertUniqueMasterName(context.gpRows, name, 'GP_ID', 'GP_Name');
      row = environment.addGpMaster({
        spreadsheetId: context.backendSpreadsheetId,
        name: name,
        actor: actor,
        nowIso: nowIso
      });
      action = KSP_MAINTENANCE_ACTIONS.GP_ADD;
      targetType = 'GP_Master';
    } else {
      var type = kspMaintenanceTrim(source.type).toUpperCase();
      kspAssert(type === KSP_OPTION_TYPES.ASSET_CLASS || type === KSP_OPTION_TYPES.CAPITAL_TYPE ||
        type === KSP_OPTION_TYPES.LOCATION, 'OPTION_TYPE_INVALID', 'Option type is invalid.');
      kspAssertUniqueMasterName(context.optionRows, name, 'Option_ID', 'Name', '', type);
      row = environment.addOptionMaster({
        spreadsheetId: context.backendSpreadsheetId,
        type: type,
        name: name,
        actor: actor,
        nowIso: nowIso
      });
      action = KSP_MAINTENANCE_ACTIONS.OPTION_ADD;
      targetType = 'Option_Master';
    }

    var after = kspMasterAuditSnapshot(row, kind);
    var auditWarning = kspTryAppendMaintenanceAudit(environment, context.auditSpreadsheetId, {
      timestamp: environment.nowIso(), actor: actor, action: action,
      targetType: targetType, targetId: after.id,
      result: KSP_AUDIT_RESULTS.SUCCESS,
      changedFields: Object.keys(after), before: null, after: after
    });
    if (auditWarning) warnings.push(auditWarning);
    return { ok: true, workId: KSP_MAINTENANCE_WORK_ID,
      item: kspMasterItemResponse(row, kind), warnings: warnings };
  } catch (error) {
    return kspMaintenanceFailure(error, warnings);
  }
}

function kspRenameMasterItem(environment, rawInput) {
  var warnings = [];
  var actor = kspGetMaintenanceActorSafely(environment, warnings);
  try {
    var input = kspNormalizeMasterMutation(rawInput, true);
    var context = kspLoadMaintenanceContext(environment);
    var rows = input.kind === 'GP' ? context.gpRows : context.optionRows;
    var idKey = input.kind === 'GP' ? 'GP_ID' : 'Option_ID';
    var nameKey = input.kind === 'GP' ? 'GP_Name' : 'Name';
    var current = kspFindMasterRow(rows, idKey, input.id);
    kspAssert(String(current.Updated_At || '') === input.expectedUpdatedAt,
      'MASTER_STALE_UPDATED_AT', '別の利用者が先に更新しました。最新内容を再読込してください。');
    kspAssertUniqueMasterName(rows, input.name, idKey, nameKey, input.id,
      input.kind === 'OPTION' ? String(current.Type || '') : '');
    var before = kspMasterAuditSnapshot(current, input.kind);
    var updated = environment.updateMasterItem({
      spreadsheetId: context.backendSpreadsheetId,
      kind: input.kind,
      id: input.id,
      expectedUpdatedAt: input.expectedUpdatedAt,
      changes: input.kind === 'GP' ? { GP_Name: input.name } : { Name: input.name },
      actor: actor,
      nowIso: environment.nowIso()
    });
    var after = kspMasterAuditSnapshot(updated, input.kind);
    var auditWarning = kspTryAppendMaintenanceAudit(environment, context.auditSpreadsheetId, {
      timestamp: environment.nowIso(), actor: actor,
      action: input.kind === 'GP' ? KSP_MAINTENANCE_ACTIONS.GP_RENAME : KSP_MAINTENANCE_ACTIONS.OPTION_RENAME,
      targetType: input.kind === 'GP' ? 'GP_Master' : 'Option_Master',
      targetId: input.id, result: KSP_AUDIT_RESULTS.SUCCESS,
      changedFields: kspChangedFields(before, after), before: before, after: after
    });
    if (auditWarning) warnings.push(auditWarning);
    return { ok: true, workId: KSP_MAINTENANCE_WORK_ID,
      item: kspMasterItemResponse(updated, input.kind), warnings: warnings };
  } catch (error) {
    return kspMaintenanceFailure(error, warnings);
  }
}

function kspSetMasterItemStatus(environment, rawInput) {
  var warnings = [];
  var actor = kspGetMaintenanceActorSafely(environment, warnings);
  try {
    var input = kspNormalizeMasterMutation(rawInput, false);
    var status = kspMaintenanceTrim(rawInput && rawInput.status);
    kspAssert(status === KSP_STATUS.ACTIVE || status === KSP_STATUS.INACTIVE,
      'MASTER_STATUS_INVALID', 'Master status is invalid.');
    var context = kspLoadMaintenanceContext(environment);
    var rows = input.kind === 'GP' ? context.gpRows : context.optionRows;
    var idKey = input.kind === 'GP' ? 'GP_ID' : 'Option_ID';
    var current = kspFindMasterRow(rows, idKey, input.id);
    kspAssert(String(current.Updated_At || '') === input.expectedUpdatedAt,
      'MASTER_STALE_UPDATED_AT', '別の利用者が先に更新しました。最新内容を再読込してください。');
    var before = kspMasterAuditSnapshot(current, input.kind);
    var updated = environment.updateMasterItem({
      spreadsheetId: context.backendSpreadsheetId,
      kind: input.kind,
      id: input.id,
      expectedUpdatedAt: input.expectedUpdatedAt,
      changes: { Status: status },
      actor: actor,
      nowIso: environment.nowIso()
    });
    var after = kspMasterAuditSnapshot(updated, input.kind);
    var action;
    if (input.kind === 'GP') {
      action = status === KSP_STATUS.ACTIVE
        ? KSP_MAINTENANCE_ACTIONS.GP_REACTIVATE
        : KSP_MAINTENANCE_ACTIONS.GP_INACTIVATE;
    } else {
      action = status === KSP_STATUS.ACTIVE
        ? KSP_MAINTENANCE_ACTIONS.OPTION_REACTIVATE
        : KSP_MAINTENANCE_ACTIONS.OPTION_INACTIVATE;
    }
    var auditWarning = kspTryAppendMaintenanceAudit(environment, context.auditSpreadsheetId, {
      timestamp: environment.nowIso(), actor: actor, action: action,
      targetType: input.kind === 'GP' ? 'GP_Master' : 'Option_Master',
      targetId: input.id, result: KSP_AUDIT_RESULTS.SUCCESS,
      changedFields: kspChangedFields(before, after), before: before, after: after
    });
    if (auditWarning) warnings.push(auditWarning);
    return { ok: true, workId: KSP_MAINTENANCE_WORK_ID,
      item: kspMasterItemResponse(updated, input.kind), warnings: warnings };
  } catch (error) {
    return kspMaintenanceFailure(error, warnings);
  }
}

function kspReorderOptionItems(environment, rawInput) {
  var warnings = [];
  var actor = kspGetMaintenanceActorSafely(environment, warnings);
  try {
    var source = rawInput && typeof rawInput === 'object' ? rawInput : {};
    var type = kspMaintenanceTrim(source.type).toUpperCase();
    var orderedIds = Array.isArray(source.orderedIds)
      ? source.orderedIds.map(kspMaintenanceTrim)
      : [];
    kspAssert(type === KSP_OPTION_TYPES.ASSET_CLASS || type === KSP_OPTION_TYPES.CAPITAL_TYPE ||
      type === KSP_OPTION_TYPES.LOCATION, 'OPTION_TYPE_INVALID', 'Option type is invalid.');
    kspAssert(orderedIds.length > 0, 'OPTION_ORDER_REQUIRED', '並び順がありません。');
    kspAssert(kspUniqueStrings(orderedIds).length === orderedIds.length,
      'OPTION_ORDER_DUPLICATE_ID', '並び順に重複IDがあります。');
    var context = kspLoadMaintenanceContext(environment);
    var currentRows = context.optionRows.filter(function (row) {
      return String(row.Type || '') === type;
    });
    var currentIds = currentRows.map(function (row) { return String(row.Option_ID || ''); }).sort();
    kspAssert(JSON.stringify(currentIds) === JSON.stringify(orderedIds.slice().sort()),
      'OPTION_ORDER_MEMBERSHIP_MISMATCH', '並び順の対象が現在のマスターと一致しません。');
    var before = currentRows.map(function (row) { return kspMasterAuditSnapshot(row, 'OPTION'); });
    var updatedRows = environment.reorderOptionItems({
      spreadsheetId: context.backendSpreadsheetId,
      type: type,
      orderedIds: orderedIds,
      actor: actor,
      nowIso: environment.nowIso()
    });
    var after = updatedRows.map(function (row) { return kspMasterAuditSnapshot(row, 'OPTION'); });
    var auditWarning = kspTryAppendMaintenanceAudit(environment, context.auditSpreadsheetId, {
      timestamp: environment.nowIso(), actor: actor,
      action: KSP_MAINTENANCE_ACTIONS.OPTION_REORDER,
      targetType: 'Option_Master', targetId: type,
      result: KSP_AUDIT_RESULTS.SUCCESS,
      changedFields: ['Sort_Order'], before: { items: before }, after: { items: after }
    });
    if (auditWarning) warnings.push(auditWarning);
    return { ok: true, workId: KSP_MAINTENANCE_WORK_ID,
      items: updatedRows.map(function (row) { return kspMasterItemResponse(row, 'OPTION'); }),
      warnings: warnings };
  } catch (error) {
    return kspMaintenanceFailure(error, warnings);
  }
}

function kspNormalizeMasterMutation(input, requireName) {
  var source = input && typeof input === 'object' ? input : {};
  var kind = kspMaintenanceTrim(source.kind).toUpperCase();
  var id = kspMaintenanceTrim(source.id);
  var expectedUpdatedAt = kspMaintenanceTrim(source.expectedUpdatedAt);
  var name = kspNormalizeMasterName(source.name);
  kspAssert(kind === 'GP' || kind === 'OPTION', 'MASTER_KIND_INVALID', 'Master kind is invalid.');
  kspAssert(id, 'MASTER_ID_REQUIRED', 'Master ID is required.');
  kspAssert(expectedUpdatedAt, 'MASTER_EXPECTED_UPDATED_AT_REQUIRED', 'Expected Updated At is required.');
  if (requireName) kspAssert(name, 'MASTER_NAME_REQUIRED', '名称を入力してください。');
  return { kind: kind, id: id, expectedUpdatedAt: expectedUpdatedAt, name: name };
}

function kspFindMasterRow(rows, idKey, id) {
  var matches = (rows || []).filter(function (row) {
    return String(row[idKey] || '') === String(id);
  });
  kspAssert(matches.length === 1, matches.length === 0 ? 'MASTER_NOT_FOUND' : 'MASTER_DUPLICATE_ID',
    'Expected exactly one Master row for ' + id + '.');
  return matches[0];
}

function kspMasterAuditSnapshot(row, kind) {
  if (kind === 'GP') {
    return {
      id: String(row.GP_ID || ''),
      name: String(row.GP_Name || ''),
      status: String(row.Status || ''),
      updatedAt: String(row.Updated_At || '')
    };
  }
  return {
    id: String(row.Option_ID || ''),
    type: String(row.Type || ''),
    name: String(row.Name || ''),
    sortOrder: Number(row.Sort_Order || 0),
    status: String(row.Status || ''),
    updatedAt: String(row.Updated_At || '')
  };
}

function kspMasterItemResponse(row, kind) {
  return kspMasterAuditSnapshot(row, kind);
}
