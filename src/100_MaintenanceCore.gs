var KSP_MAINTENANCE_WORK_ID = '0007';
var KSP_MAINTENANCE_APP_VERSION = '0.4.0';
var KSP_AUDIT_RETENTION_YEARS = 5;

var KSP_MAINTENANCE_ACTIONS = Object.freeze({
  MEETING_UPDATE: 'MEETING_UPDATE',
  MEETING_DEACTIVATE: 'MEETING_DEACTIVATE',
  MEETING_REACTIVATE: 'MEETING_REACTIVATE',
  PITCHBOOK_UPDATE: 'PITCHBOOK_UPDATE',
  PITCHBOOK_DEACTIVATE: 'PITCHBOOK_DEACTIVATE',
  PITCHBOOK_REACTIVATE: 'PITCHBOOK_REACTIVATE',
  GP_ADD: 'GP_ADD',
  GP_RENAME: 'GP_RENAME',
  GP_DEACTIVATE: 'GP_DEACTIVATE',
  GP_REACTIVATE: 'GP_REACTIVATE',
  OPTION_ADD: 'OPTION_ADD',
  OPTION_RENAME: 'OPTION_RENAME',
  OPTION_REORDER: 'OPTION_REORDER',
  OPTION_DEACTIVATE: 'OPTION_DEACTIVATE',
  OPTION_REACTIVATE: 'OPTION_REACTIVATE',
  AUDIT_RETENTION_CLEANUP: 'AUDIT_RETENTION_CLEANUP'
});

var KSP_MASTER_ENTITY = Object.freeze({ GP: 'GP', OPTION: 'OPTION' });
var KSP_MASTER_MUTATION = Object.freeze({
  ADD: 'ADD', RENAME: 'RENAME', REORDER: 'REORDER',
  DEACTIVATE: 'DEACTIVATE', REACTIVATE: 'REACTIVATE'
});

var KSP_MAINTENANCE_LIMITS = Object.freeze({
  DEFAULT_RESULTS: 100,
  MAX_RESULTS: 500,
  EDIT_CLAIM_TTL_MS: 5 * 60 * 1000,
  MASTER_NAME: 200
});

function kspNormalizeRecordSearch(input) {
  var source = input && typeof input === 'object' ? input : {};
  return {
    dateFrom: kspMaintenanceTrim(source.dateFrom),
    dateTo: kspMaintenanceTrim(source.dateTo),
    gpId: kspMaintenanceTrim(source.gpId),
    assetClassId: kspMaintenanceTrim(source.assetClassId),
    capitalTypeId: kspMaintenanceTrim(source.capitalTypeId),
    status: kspMaintenanceTrim(source.status),
    limit: source.limit === null || source.limit === undefined || source.limit === ''
      ? KSP_MAINTENANCE_LIMITS.DEFAULT_RESULTS : Number(source.limit)
  };
}

function kspValidateRecordSearch(search) {
  if (search.dateFrom) {
    kspAssert(kspIsValidDateKey(search.dateFrom), 'SEARCH_DATE_FROM_INVALID', 'From日付が不正です。');
  }
  if (search.dateTo) {
    kspAssert(kspIsValidDateKey(search.dateTo), 'SEARCH_DATE_TO_INVALID', 'To日付が不正です。');
  }
  if (search.dateFrom && search.dateTo) {
    kspAssert(search.dateFrom <= search.dateTo, 'SEARCH_DATE_RANGE_INVALID', 'From日付はTo日付以前にしてください。');
  }
  kspAssert(search.limit > 0 && search.limit <= KSP_MAINTENANCE_LIMITS.MAX_RESULTS,
    'SEARCH_LIMIT_INVALID', '検索件数上限が不正です。');
  return search;
}

function kspMaintenanceTrim(value) {
  return value === null || value === undefined ? '' : String(value).trim();
}

function kspMaintenancePositiveInteger(value, fallback) {
  var numberValue = Number(value);
  return Number.isFinite(numberValue) && numberValue > 0 && Math.floor(numberValue) === numberValue
    ? numberValue : fallback;
}

function kspRecordMatchesSearch(row, search) {
  var date = String(row.Date || '');
  if (search.dateFrom && date < search.dateFrom) return false;
  if (search.dateTo && date > search.dateTo) return false;
  if (search.gpId && String(row.GP_ID || '') !== search.gpId) return false;
  if (search.assetClassId && String(row.Asset_Class_ID || '') !== search.assetClassId) return false;
  if (search.capitalTypeId && String(row.Capital_Type_ID || '') !== search.capitalTypeId) return false;
  if (search.status && String(row.Status || '') !== search.status) return false;
  return true;
}

function kspSearchRows(rows, search, mapper) {
  return (rows || [])
    .filter(function (row) { return kspRecordMatchesSearch(row, search); })
    .sort(function (left, right) {
      var dateCompare = String(right.Date || '').localeCompare(String(left.Date || ''));
      if (dateCompare !== 0) return dateCompare;
      var updateCompare = String(right.Updated_At || '').localeCompare(String(left.Updated_At || ''));
      if (updateCompare !== 0) return updateCompare;
      return String(left.Meeting_ID || left.Document_ID || '').localeCompare(
        String(right.Meeting_ID || right.Document_ID || '')
      );
    })
    .slice(0, search.limit)
    .map(mapper);
}

function kspBuildCatalogMaps(catalog) {
  var maps = { gp: {}, assetClass: {}, capitalType: {}, location: {} };
  (catalog.gps || []).forEach(function (item) { maps.gp[item.id] = item.name; });
  (catalog.assetClasses || []).forEach(function (item) { maps.assetClass[item.id] = item.name; });
  (catalog.capitalTypes || []).forEach(function (item) { maps.capitalType[item.id] = item.name; });
  (catalog.locations || []).forEach(function (item) { maps.location[item.id] = item.name; });
  return maps;
}

function kspBuildAllMasterMaps(gpRows, optionRows) {
  var maps = { gp: {}, assetClass: {}, capitalType: {}, location: {} };
  (gpRows || []).forEach(function (row) {
    if (row.GP_ID) maps.gp[String(row.GP_ID)] = String(row.GP_Name || '');
  });
  (optionRows || []).forEach(function (row) {
    var target = String(row.Type || '') === KSP_OPTION_TYPES.ASSET_CLASS ? maps.assetClass
      : String(row.Type || '') === KSP_OPTION_TYPES.CAPITAL_TYPE ? maps.capitalType
      : String(row.Type || '') === KSP_OPTION_TYPES.LOCATION ? maps.location : null;
    if (target && row.Option_ID) target[String(row.Option_ID)] = String(row.Name || '');
  });
  return maps;
}

function kspMapMeetingSearchResult(row, maps) {
  return {
    meetingId: String(row.Meeting_ID || ''),
    date: String(row.Date || ''),
    time: String(row.Time || ''),
    gpId: String(row.GP_ID || ''),
    gpName: maps.gp[String(row.GP_ID || '')] || '',
    assetClassId: String(row.Asset_Class_ID || ''),
    assetClassName: maps.assetClass[String(row.Asset_Class_ID || '')] || '',
    capitalTypeId: String(row.Capital_Type_ID || ''),
    capitalTypeName: maps.capitalType[String(row.Capital_Type_ID || '')] || '',
    locationId: String(row.Location_ID || ''),
    locationName: maps.location[String(row.Location_ID || '')] || '',
    counterparty: String(row.Counterparty || ''),
    internalParticipants: String(row.Internal_Participants || ''),
    documentId: String(row.Doc_File_ID || ''),
    documentUrl: String(row.Doc_URL || ''),
    filename: String(row.Saved_Filename || ''),
    status: String(row.Status || ''),
    version: Number(row.Version || 0),
    updatedAt: String(row.Updated_At || '')
  };
}

function kspMapPitchbookSearchResult(row, maps) {
  return {
    documentId: String(row.Document_ID || ''),
    batchId: String(row.Batch_ID || ''),
    date: String(row.Date || ''),
    gpId: String(row.GP_ID || ''),
    gpName: maps.gp[String(row.GP_ID || '')] || '',
    assetClassId: String(row.Asset_Class_ID || ''),
    assetClassName: maps.assetClass[String(row.Asset_Class_ID || '')] || '',
    capitalTypeId: String(row.Capital_Type_ID || ''),
    capitalTypeName: maps.capitalType[String(row.Capital_Type_ID || '')] || '',
    sequenceNo: Number(row.Sequence_No || 0),
    fileId: String(row.File_ID || ''),
    fileUrl: String(row.File_URL || ''),
    originalFilename: String(row.Original_Filename || ''),
    savedFilename: String(row.Saved_Filename || ''),
    status: String(row.Status || ''),
    updatedAt: String(row.Updated_At || '')
  };
}

function kspParseMeetingDocumentText(text) {
  var source = String(text || '').replace(/\r\n?/g, '\n');
  var notesMarker = '\n\n面談内容:\n';
  var markerIndex = source.indexOf(notesMarker);
  var metadataText = markerIndex === -1 ? source : source.slice(0, markerIndex);
  var notes = markerIndex === -1 ? '' : source.slice(markerIndex + notesMarker.length);
  var values = {};
  metadataText.split('\n').forEach(function (line) {
    var separator = line.indexOf(':');
    if (separator === -1) return;
    var label = line.slice(0, separator).trim();
    var value = line.slice(separator + 1).trim();
    values[label] = value;
  });
  return {
    date: values['日付'] || '',
    time: values['時間'] || '',
    locationName: values['面談場所'] || '',
    gpName: values.GP || '',
    assetClassName: values['Asset Class'] || '',
    capitalTypeName: values['Equity / Debt'] || '',
    counterparty: values['面談相手'] || '',
    internalParticipants: values['当社側'] || '',
    notes: notes
  };
}

function kspNormalizeMeetingEditInput(input) {
  var normalized = kspNormalizeMeetingInput(input);
  normalized.meetingId = kspMaintenanceTrim(input && input.meetingId);
  normalized.expectedVersion = Number(input && input.expectedVersion);
  delete normalized.retryMeetingId;
  delete normalized.retryFingerprint;
  return normalized;
}

function kspValidateMeetingEditInput(input, catalog) {
  kspParseMeetingId(input.meetingId);
  kspAssert(Number.isFinite(input.expectedVersion) && input.expectedVersion > 0 && Math.floor(input.expectedVersion) === input.expectedVersion,
    'MEETING_EXPECTED_VERSION_INVALID', 'Meeting Versionが不正です。');
  return kspValidateMeetingInput(input, catalog);
}

function kspBuildMeetingEditedRow(currentRow, input, actor, nowIso, filename) {
  var updated = kspDeepClone(currentRow);
  updated.Date = input.date;
  updated.Time = input.time;
  updated.Location_ID = input.locationId;
  updated.GP_ID = input.gpId;
  updated.Asset_Class_ID = input.assetClassId;
  updated.Capital_Type_ID = input.capitalTypeId;
  updated.Counterparty = input.counterparty;
  updated.Internal_Participants = input.internalParticipants;
  updated.Saved_Filename = filename;
  updated.Version = Number(currentRow.Version || 0) + 1;
  updated.Updated_At = nowIso;
  updated.Updated_By = actor;
  updated.AI_Index_Status = KSP_AI_INDEX_STATUS.PENDING;
  updated.AI_Last_Error = '';
  return updated;
}

function kspNormalizePitchbookEditInput(input) {
  var source = input && typeof input === 'object' ? input : {};
  return {
    documentId: kspMaintenanceTrim(source.documentId),
    expectedUpdatedAt: kspMaintenanceTrim(source.expectedUpdatedAt),
    date: kspMaintenanceTrim(source.date),
    gpId: kspMaintenanceTrim(source.gpId),
    assetClassId: kspMaintenanceTrim(source.assetClassId),
    capitalTypeId: kspMaintenanceTrim(source.capitalTypeId)
  };
}

function kspValidatePitchbookEditInput(input, catalog) {
  kspParsePitchbookDocumentId(input.documentId);
  kspAssert(input.expectedUpdatedAt, 'PITCHBOOK_EXPECTED_UPDATED_AT_REQUIRED', '更新トークンがありません。');
  kspAssert(kspIsValidDateKey(input.date), 'PITCHBOOK_DATE_INVALID', '日付が不正です。');
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

function kspPitchbookContextChanged(currentRow, input) {
  return String(currentRow.Date || '') !== input.date ||
    String(currentRow.GP_ID || '') !== input.gpId ||
    String(currentRow.Asset_Class_ID || '') !== input.assetClassId ||
    String(currentRow.Capital_Type_ID || '') !== input.capitalTypeId;
}

function kspBuildPitchbookEditedRow(currentRow, input, actor, nowIso, sequenceNo, filename) {
  var updated = kspDeepClone(currentRow);
  updated.Date = input.date;
  updated.GP_ID = input.gpId;
  updated.Asset_Class_ID = input.assetClassId;
  updated.Capital_Type_ID = input.capitalTypeId;
  updated.Sequence_No = sequenceNo;
  updated.Saved_Filename = filename;
  updated.Updated_At = nowIso;
  updated.Updated_By = actor;
  updated.AI_Index_Status = KSP_AI_INDEX_STATUS.PENDING;
  updated.AI_Last_Error = '';
  return updated;
}

function kspNormalizeMasterName(value) {
  var normalized = value === null || value === undefined ? '' : String(value);
  if (normalized.normalize) normalized = normalized.normalize('NFKC');
  return normalized.trim().replace(/\s+/g, ' ').toLocaleLowerCase('en');
}

function kspDisplayMasterName(value) {
  var display = value === null || value === undefined ? '' : String(value);
  if (display.normalize) display = display.normalize('NFKC');
  return display.trim().replace(/\s+/g, ' ');
}

function kspNextGpId(rows) {
  var maximum = (rows || []).reduce(function (maxValue, row) {
    var match = /^GP-(\d{6})$/.exec(String(row.GP_ID || ''));
    return match ? Math.max(maxValue, Number(match[1])) : maxValue;
  }, 0);
  return 'GP-' + String(maximum + 1).padStart(6, '0');
}

function kspOptionPrefix(type) {
  var prefixes = { ASSET_CLASS: 'AC', CAPITAL_TYPE: 'CT', LOCATION: 'LOC' };
  kspAssert(prefixes[type], 'OPTION_TYPE_INVALID', 'Option Typeが不正です。');
  return prefixes[type];
}

function kspNextOptionId(rows, type) {
  var prefix = kspOptionPrefix(type);
  var pattern = new RegExp('^OPT-' + prefix + '-(\\d{3})$');
  var maximum = (rows || []).reduce(function (maxValue, row) {
    if (String(row.Type || '') !== type) return maxValue;
    var match = pattern.exec(String(row.Option_ID || ''));
    return match ? Math.max(maxValue, Number(match[1])) : maxValue;
  }, 0);
  return 'OPT-' + prefix + '-' + String(maximum + 1).padStart(3, '0');
}

function kspFindNormalizedMasterDuplicate(rows, entity, type, name, excludedId) {
  var normalized = kspNormalizeMasterName(name);
  return (rows || []).filter(function (row) {
    if (entity === KSP_MASTER_ENTITY.GP) {
      return String(row.GP_ID || '') !== String(excludedId || '') &&
        kspNormalizeMasterName(row.GP_Name) === normalized;
    }
    return String(row.Option_ID || '') !== String(excludedId || '') &&
      String(row.Type || '') === type && kspNormalizeMasterName(row.Name) === normalized;
  })[0] || null;
}

function kspNormalizeMasterMutation(input) {
  var source = input && typeof input === 'object' ? input : {};
  return {
    entity: kspMaintenanceTrim(source.entity).toUpperCase(),
    action: kspMaintenanceTrim(source.action).toUpperCase(),
    id: kspMaintenanceTrim(source.id),
    type: kspMaintenanceTrim(source.type).toUpperCase(),
    name: kspDisplayMasterName(source.name),
    sortOrder: Number(source.sortOrder),
    returnExistingOnDuplicate: Boolean(source.returnExistingOnDuplicate)
  };
}

function kspValidateMasterMutation(input) {
  kspAssert(input.entity === KSP_MASTER_ENTITY.GP || input.entity === KSP_MASTER_ENTITY.OPTION,
    'MASTER_ENTITY_INVALID', 'Master種別が不正です。');
  kspAssert(Object.keys(KSP_MASTER_MUTATION).some(function (key) {
    return KSP_MASTER_MUTATION[key] === input.action;
  }), 'MASTER_ACTION_INVALID', 'Master操作が不正です。');
  if (input.action === KSP_MASTER_MUTATION.ADD || input.action === KSP_MASTER_MUTATION.RENAME) {
    kspAssert(input.name, 'MASTER_NAME_REQUIRED', '名称は必須です。');
    kspAssert(input.name.length <= KSP_MAINTENANCE_LIMITS.MASTER_NAME,
      'MASTER_NAME_TOO_LONG', '名称が長すぎます。');
  }
  if (input.entity === KSP_MASTER_ENTITY.OPTION) {
    if (input.action === KSP_MASTER_MUTATION.ADD) kspOptionPrefix(input.type);
    if (input.action === KSP_MASTER_MUTATION.REORDER) {
      kspAssert(Number.isFinite(input.sortOrder) && input.sortOrder > 0 && Math.floor(input.sortOrder) === input.sortOrder,
        'OPTION_SORT_ORDER_INVALID', 'Sort Orderは正の整数にしてください。');
    }
  } else {
    kspAssert(input.action !== KSP_MASTER_MUTATION.REORDER,
      'GP_REORDER_NOT_ALLOWED', 'GPは名称のアルファベット順で表示するため手動並び替えできません。');
  }
  if (input.action !== KSP_MASTER_MUTATION.ADD) {
    kspAssert(input.id, 'MASTER_ID_REQUIRED', 'Master IDが必要です。');
  }
  return input;
}

function kspBuildMaintenanceAuditRow(params) {
  var options = params || {};
  return {
    Event_Timestamp: options.timestamp || '',
    Actor: options.actor || 'UNIDENTIFIED',
    Action: options.action || '',
    Target_Type: options.targetType || '',
    Target_ID: options.targetId || '',
    Result: options.result || KSP_AUDIT_RESULTS.FAILURE,
    Changed_Fields: (options.changedFields || []).join(','),
    Before_Metadata_JSON: options.before ? JSON.stringify(options.before) : '',
    After_Metadata_JSON: options.after ? JSON.stringify(options.after) : '',
    Batch_ID: options.batchId || '',
    Error_Code: options.errorCode || '',
    Error_Message: options.errorMessage || '',
    Search_Mode: '', Question_Or_Instruction: '', Date_From: '', Date_To: '',
    GP_Filter: '', Asset_Class_Filter: '', Capital_Type_Filter: '', Source_Type_Filter: '',
    Model_ID: '', Cited_Source_IDs: ''
  };
}

function kspMeetingAuditSnapshot(row) {
  return {
    Meeting_ID: row.Meeting_ID || '', Date: row.Date || '', Time: row.Time || '',
    Location_ID: row.Location_ID || '', GP_ID: row.GP_ID || '',
    Asset_Class_ID: row.Asset_Class_ID || '', Capital_Type_ID: row.Capital_Type_ID || '',
    Counterparty: row.Counterparty || '', Internal_Participants: row.Internal_Participants || '',
    Doc_File_ID: row.Doc_File_ID || '', Doc_URL: row.Doc_URL || '',
    Saved_Filename: row.Saved_Filename || '', Status: row.Status || '',
    Version: Number(row.Version || 0), Updated_At: row.Updated_At || ''
  };
}

function kspPitchbookAuditSnapshot(row) {
  return {
    Document_ID: row.Document_ID || '', Batch_ID: row.Batch_ID || '', Date: row.Date || '',
    GP_ID: row.GP_ID || '', Asset_Class_ID: row.Asset_Class_ID || '',
    Capital_Type_ID: row.Capital_Type_ID || '', Sequence_No: Number(row.Sequence_No || 0),
    File_ID: row.File_ID || '', File_URL: row.File_URL || '',
    Original_Filename: row.Original_Filename || '', Saved_Filename: row.Saved_Filename || '',
    Status: row.Status || '', Updated_At: row.Updated_At || ''
  };
}

function kspMasterAuditSnapshot(entity, row) {
  if (entity === KSP_MASTER_ENTITY.GP) {
    return { GP_ID: row.GP_ID || '', GP_Name: row.GP_Name || '', Status: row.Status || '', Updated_At: row.Updated_At || '' };
  }
  return {
    Option_ID: row.Option_ID || '', Type: row.Type || '', Name: row.Name || '',
    Sort_Order: Number(row.Sort_Order || 0), Status: row.Status || '', Updated_At: row.Updated_At || ''
  };
}

function kspOptionOrderAuditSnapshot(rows) {
  return (rows || []).map(function (row) {
    return { Option_ID: row.Option_ID || '', Type: row.Type || '', Name: row.Name || '', Sort_Order: Number(row.Sort_Order || 0) };
  }).sort(function (left, right) {
    if (left.Type !== right.Type) return left.Type.localeCompare(right.Type);
    if (left.Sort_Order !== right.Sort_Order) return left.Sort_Order - right.Sort_Order;
    return left.Option_ID.localeCompare(right.Option_ID);
  });
}

function kspChangedMetadataFields(before, after) {
  var keys = kspUniqueStrings(Object.keys(before || {}).concat(Object.keys(after || {})));
  return keys.filter(function (key) {
    return JSON.stringify((before || {})[key]) !== JSON.stringify((after || {})[key]);
  });
}

function kspActorKind(actor) {
  var value = String(actor || 'UNIDENTIFIED');
  if (value.indexOf('TEMP_USER:') === 0) return 'TEMP_USER';
  if (value === 'UNIDENTIFIED') return 'UNIDENTIFIED';
  return 'EMAIL';
}

function kspBuildSchemaDiagnostic(expectedSchemas, actualBySheet) {
  return Object.keys(expectedSchemas || {}).map(function (sheetName) {
    var actual = (actualBySheet && actualBySheet[sheetName]) || [];
    var missing = expectedSchemas[sheetName].filter(function (header) { return actual.indexOf(header) === -1; });
    return { sheet: sheetName, present: actual.length > 0, missingColumns: missing, ok: missing.length === 0 };
  });
}

function kspAuditRetentionCutoff(nowIso, years) {
  var now = new Date(nowIso);
  kspAssert(!Number.isNaN(now.getTime()), 'AUDIT_RETENTION_NOW_INVALID', '基準日時が不正です。');
  var cutoff = new Date(now.getTime());
  cutoff.setUTCFullYear(cutoff.getUTCFullYear() - Number(years || KSP_AUDIT_RETENTION_YEARS));
  return cutoff.toISOString();
}
