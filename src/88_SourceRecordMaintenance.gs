function kspSearchSourceRecords_(environment, kind, rawSearch) {
  try {
    var definition = kspSourceDefinition_(kind);
    var context = kspLoadSourceRecordContext_(environment, definition);
    var search = kspValidateRecordSearch_(kspNormalizeRecordSearch_(rawSearch));
    var source = rawSearch && typeof rawSearch === 'object' ? rawSearch : {};
    var title = String(source.title || '').trim().toLocaleLowerCase('ja');
    var publisher = String(source.publisher || '').trim().toLocaleLowerCase('ja');
    var assessmentType = String(source.assessmentType || '').trim();
    var maps = kspBuildAllMasterMaps_(context.counterpartyRows, context.optionRows);
    var records = environment.readRows(context.backendId, definition.sheetName)
      .filter(function (row) {
        var date = kspCanonicalBusinessDate_(row[definition.dateField]);
        if (search.dateFrom && date < search.dateFrom) return false;
        if (search.dateTo && date > search.dateTo) return false;
        if (search.status && String(row.Status || '') !== search.status) return false;
        if (search.counterpartyId && kspSourceCanonicalIds_(row.Counterparty_IDs, 'CP', false)
          .indexOf(search.counterpartyId) === -1) return false;
        if (search.assetClassId && String(row.Asset_Class_ID || '') !== search.assetClassId) return false;
        if (search.fundStrategy && String(row.Fund_Strategy || '').toLocaleLowerCase('ja')
          .indexOf(search.fundStrategy.toLocaleLowerCase('ja')) === -1) return false;
        if (title && String(row.Title || '').toLocaleLowerCase('ja').indexOf(title) === -1) return false;
        if (publisher && String(row.Publisher || '').toLocaleLowerCase('ja').indexOf(publisher) === -1) return false;
        if (assessmentType && String(row.Assessment_Type || '') !== assessmentType) return false;
        return true;
      })
      .sort(function (left, right) {
        return kspCanonicalBusinessDate_(right[definition.dateField]).localeCompare(
          kspCanonicalBusinessDate_(left[definition.dateField])) ||
          kspCanonicalInstantIso_(right.Updated_At).localeCompare(kspCanonicalInstantIso_(left.Updated_At)) ||
          String(left[definition.idField] || '').localeCompare(String(right[definition.idField] || ''));
      }).slice(0, search.limit)
      .map(function (row) { return kspMapSourceRecord_(definition, row, maps); });
    return { ok: true, records: records };
  } catch (error) { return kspMaintenanceFailure_(error); }
}

function kspGetSourceMaintenanceRecord_(environment, kind, id) {
  try {
    var definition = kspSourceDefinition_(kind);
    kspParseSourceRecordId_(definition, id);
    var context = kspLoadSourceRecordContext_(environment, definition);
    var row = kspRequireSingleRow_(environment.readRows(context.backendId, definition.sheetName),
      definition.idField, id, 'SOURCE_NOT_FOUND');
    var record = kspMapSourceRecord_(definition, row,
      kspBuildAllMasterMaps_(context.counterpartyRows, context.optionRows));
    if (record.inputMode === 'DIRECT_TEXT') record.directText = environment.getDocumentText(record.sourceFileId);
    return { ok: true, record: record };
  } catch (error) { return kspMaintenanceFailure_(error); }
}

function kspNormalizeSourceEditInput_(definition, rawInput, currentRow) {
  var source = rawInput && typeof rawInput === 'object' ? rawInput : {};
  var current = currentRow || {};
  var value = function (key, fallback) {
    return Object.prototype.hasOwnProperty.call(source, key) ? source[key] : fallback;
  };
  return {
    id: String(value(definition.key === 'NEWS' ? 'newsId' : 'assessmentId', '') || '').trim(),
    expectedVersion: Number(value('expectedVersion', 0)),
    date: String(value('date', kspCanonicalBusinessDate_(current[definition.dateField])) || '').trim(),
    title: String(value('title', current.Title) || '').trim(),
    publisher: String(value('publisher', current.Publisher) || '').trim(),
    url: String(value('url', current.URL) || '').trim(),
    assessmentType: String(value('assessmentType', current.Assessment_Type) || '').trim(),
    counterpartyIds: kspSourceCanonicalIds_(value('counterpartyIds', current.Counterparty_IDs), 'CP', true),
    assetClassId: String(value('assetClassId', current.Asset_Class_ID) || '').trim(),
    fundStrategy: String(value('fundStrategy', current.Fund_Strategy) || '').trim(),
    decisionOrAction: String(value('decisionOrAction', current.Decision_Or_Action) || '').trim(),
    relatedMeetingIds: kspSourceCanonicalIds_(value('relatedMeetingIds', current.Related_Meeting_IDs), 'MTG', false),
    relatedDocumentIds: kspSourceCanonicalIds_(value('relatedDocumentIds', current.Related_Document_IDs), 'DOC', false),
    relatedNewsIds: kspSourceCanonicalIds_(value('relatedNewsIds', current.Related_News_IDs), 'NEWS', false),
    directText: Object.prototype.hasOwnProperty.call(source, 'directText')
      ? String(source.directText || '').replace(/\r\n?/g, '\n').replace(/\u0000/g, '') : null
  };
}

function kspValidateSourceEditInput_(definition, input, currentRow, context) {
  kspParseSourceRecordId_(definition, input.id);
  kspAssert_(Number.isInteger(input.expectedVersion) && input.expectedVersion > 0,
    'SOURCE_EXPECTED_VERSION_INVALID', '更新番号が不正です。');
  kspAssert_(kspIsValidDateKey_(input.date), 'SOURCE_DATE_INVALID', '日付を正しく入力してください。');
  kspAssert_(input.title && input.title.length <= 255, 'SOURCE_TITLE_INVALID',
    'タイトルを255文字以内で入力してください。');
  kspAssert_(input.fundStrategy.length <= 500, 'SOURCE_FUND_STRATEGY_TOO_LONG',
    'Fund / Strategyは500文字以内で入力してください。');
  if (definition.key === 'NEWS') {
    kspAssert_(input.publisher && input.publisher.length <= 255, 'NEWS_PUBLISHER_REQUIRED',
      '発行元を255文字以内で入力してください。');
    kspAssert_(!input.url || /^https?:\/\//i.test(input.url), 'NEWS_URL_INVALID',
      'URLはhttpsまたはhttpで入力してください。');
  } else kspAssert_(KSP_ASSESSMENT_TYPES.some(function (type) { return type.code === input.assessmentType; }),
    'ASSESSMENT_TYPE_INVALID', '評価区分を選択してください。');
  if (currentRow.Input_Mode === 'DIRECT_TEXT') {
    kspAssert_(input.directText === null || Boolean(input.directText.trim()),
      'SOURCE_DIRECT_TEXT_REQUIRED', '本文を入力してください。');
  } else kspAssert_(input.directText === null,
    'SOURCE_UPLOAD_IMMUTABLE', 'アップロード原本の本文は変更できません。');
  kspValidateSourceMasterReferences_(definition, input,
    context.counterpartyRows, context.optionRows, context.relatedRows);
}

function kspBuildSourceEditedRow_(definition, current, input, actor, nowIso) {
  var row = kspDeepClone_(current);
  row[definition.dateField] = input.date;
  row.Title = input.title;
  row.Counterparty_IDs = input.counterpartyIds.join(',');
  row.Asset_Class_ID = input.assetClassId;
  row.Fund_Strategy = input.fundStrategy;
  if (definition.key === 'NEWS') { row.Publisher = input.publisher; row.URL = input.url; }
  else {
    row.Assessment_Type = input.assessmentType;
    row.Decision_Or_Action = input.decisionOrAction;
    row.Related_Meeting_IDs = input.relatedMeetingIds.join(',');
    row.Related_Document_IDs = input.relatedDocumentIds.join(',');
    row.Related_News_IDs = input.relatedNewsIds.join(',');
  }
  row.Version = Number(current.Version) + 1;
  row.Updated_At = nowIso;
  row.Updated_By = actor;
  row.AI_Index_Status = KSP_AI_INDEX_STATUS.NOT_INDEXED;
  row.AI_Last_Error = '';
  return row;
}

function kspUpdateSourceMaintenance_(environment, kind, rawInput) {
  var definition = kspSourceDefinition_(kind), warnings = [];
  var actor = kspGetMaintenanceActorSafely_(environment, warnings);
  var context = null, claim = null, snapshot = null, current = null;
  try {
    context = kspLoadSourceRecordContext_(environment, definition);
    var id = String(rawInput && rawInput[definition.key === 'NEWS' ? 'newsId' : 'assessmentId'] || '').trim();
    kspParseSourceRecordId_(definition, id);
    current = kspRequireSingleRow_(environment.readRows(context.backendId, definition.sheetName),
      definition.idField, id, 'SOURCE_NOT_FOUND');
    var input = kspNormalizeSourceEditInput_(definition, rawInput, current);
    kspValidateSourceEditInput_(definition, input, current, context);
    claim = environment.claimRecordEdit(definition.key, id, definition.sheetName,
      definition.idField, 'Version', input.expectedVersion, environment.nowIso(),
      KSP_MAINTENANCE_LIMITS.EDIT_CLAIM_TTL_MS);
    current = claim.row;
    kspAssert_(String(current.Status || '') === KSP_STATUS.ACTIVE,
      'SOURCE_NOT_ACTIVE', '有効な記録だけ編集できます。');
    kspAssert_(String(current.Source_File_ID || ''),
      'SOURCE_AUTHORITATIVE_FILE_MISSING', '原本がない記録は編集できません。');
    var directSourceChange = current.Input_Mode === 'DIRECT_TEXT' &&
      (input.directText !== null || input.title !== String(current.Title || '') ||
        input.date !== kspCanonicalBusinessDate_(current[definition.dateField]));
    if (directSourceChange) {
      snapshot = environment.getDocumentSnapshot(String(current.Source_File_ID));
      environment.updateMeetingDocument(String(current.Source_File_ID),
        kspSourceSavedFilename_(definition, { date: input.date, title: input.title, inputMode: 'DIRECT_TEXT' }, id),
        input.directText === null ? snapshot.text : input.directText);
    }
    var updated = kspBuildSourceEditedRow_(definition, current, input, actor, environment.nowIso());
    if (directSourceChange) {
      updated.Saved_Filename = kspSourceSavedFilename_(definition,
        { date: input.date, title: input.title, inputMode: 'DIRECT_TEXT' }, id);
    }
    var committed = environment.commitClaimedSourceEdit(claim, definition, input, updated);
    claim = null;
    kspTryMaintenanceAudit_(environment, context.auditId, {
      timestamp: environment.nowIso(), actor: actor, action: definition.key + '_UPDATE',
      targetType: definition.key === 'NEWS' ? 'News' : 'Internal Assessment', targetId: id,
      result: KSP_AUDIT_RESULTS.SUCCESS,
      before: { id: id, version: current.Version, counterpartyIds: current.Counterparty_IDs },
      after: { id: id, version: committed.Version, counterpartyIds: committed.Counterparty_IDs },
      changedFields: ['Version', 'Updated_At']
    }, warnings);
    return { ok: true, record: kspMapSourceRecord_(definition, committed,
      kspBuildAllMasterMaps_(context.counterpartyRows, context.optionRows)), warnings: warnings };
  } catch (error) {
    if (snapshot && current && (!claim || environment.isRecordEditClaimOwned(claim))) {
      try { environment.restoreDocumentSnapshot(String(current.Source_File_ID), snapshot); }
      catch (restoreError) { warnings.push({ code: 'SOURCE_DOCUMENT_RESTORE_FAILED',
        message: kspSafeOperationalWarning_('SOURCE_DOCUMENT_RESTORE_FAILED') }); }
    }
    if (claim) {
      try { environment.releaseRecordEditClaim(claim); }
      catch (ignoredRelease) { /* Expiring claim keeps a failed edit bounded. */ }
    }
    return kspMaintenanceFailure_(error, warnings);
  }
}

function kspChangeSourceStatus_(environment, kind, rawInput) {
  var definition = kspSourceDefinition_(kind), warnings = [];
  var actor = kspGetMaintenanceActorSafely_(environment, warnings);
  try {
    var source = rawInput && typeof rawInput === 'object' ? rawInput : {};
    var id = String(source[definition.key === 'NEWS' ? 'newsId' : 'assessmentId'] || '').trim();
    var expectedVersion = Number(source.expectedVersion);
    var targetStatus = String(source.targetStatus || '').trim();
    kspParseSourceRecordId_(definition, id);
    kspAssert_(Number.isInteger(expectedVersion) && expectedVersion > 0,
      'SOURCE_EXPECTED_VERSION_INVALID', '更新番号が不正です。');
    kspAssert_(targetStatus === KSP_STATUS.ACTIVE || targetStatus === KSP_STATUS.INACTIVE,
      'SOURCE_TARGET_STATUS_INVALID', '変更先の状態が不正です。');
    var context = kspLoadSourceRecordContext_(environment, definition);
    var result = environment.updateSourceStatusAtomic(definition, id, expectedVersion,
      targetStatus, actor, environment.nowIso());
    kspTryMaintenanceAudit_(environment, context.auditId, {
      timestamp: environment.nowIso(), actor: actor,
      action: definition.key + (targetStatus === KSP_STATUS.ACTIVE ? '_REACTIVATE' : '_DEACTIVATE'),
      targetType: definition.key === 'NEWS' ? 'News' : 'Internal Assessment', targetId: id,
      result: KSP_AUDIT_RESULTS.SUCCESS,
      before: { id: id, status: result.before.Status, version: result.before.Version },
      after: { id: id, status: result.after.Status, version: result.after.Version },
      changedFields: ['Status', 'Version', 'Updated_At']
    }, warnings);
    return { ok: true, record: kspMapSourceRecord_(definition, result.after,
      kspBuildAllMasterMaps_(context.counterpartyRows, context.optionRows)), warnings: warnings };
  } catch (error) { return kspMaintenanceFailure_(error, warnings); }
}
