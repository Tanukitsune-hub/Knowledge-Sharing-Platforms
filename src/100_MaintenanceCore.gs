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

function kspNormalizeRecordSearch_(input) {
  var source = input && typeof input === 'object' ? input : {};
  return {
    dateFrom: kspMaintenanceTrim_(source.dateFrom),
    dateTo: kspMaintenanceTrim_(source.dateTo),
    gpId: kspMaintenanceTrim_(source.gpId),
    assetClassId: kspMaintenanceTrim_(source.assetClassId),
    capitalTypeId: kspMaintenanceTrim_(source.capitalTypeId),
    teamId: kspMaintenanceTrim_(source.teamId),
    fundStrategy: kspMaintenanceTrim_(source.fundStrategy),
    meetingTypeCode: kspMaintenanceTrim_(source.meetingTypeCode),
    followUpOnly: kspToBoolean_(source.followUpOnly, false),
    status: kspMaintenanceTrim_(source.status),
    limit: source.limit === null || source.limit === undefined || source.limit === ''
      ? KSP_MAINTENANCE_LIMITS.DEFAULT_RESULTS : Number(source.limit)
  };
}

function kspValidateRecordSearch_(search) {
  if (search.dateFrom) {
    kspAssert_(kspIsValidDateKey_(search.dateFrom), 'SEARCH_DATE_FROM_INVALID', 'From日付が不正です。');
  }
  if (search.dateTo) {
    kspAssert_(kspIsValidDateKey_(search.dateTo), 'SEARCH_DATE_TO_INVALID', 'To日付が不正です。');
  }
  if (search.dateFrom && search.dateTo) {
    kspAssert_(search.dateFrom <= search.dateTo, 'SEARCH_DATE_RANGE_INVALID', 'From日付はTo日付以前にしてください。');
  }
  kspAssert_(search.limit > 0 && search.limit <= KSP_MAINTENANCE_LIMITS.MAX_RESULTS,
    'SEARCH_LIMIT_INVALID', '検索件数上限が不正です。');
  if (search.meetingTypeCode) {
    kspAssert_(['ANNUAL_REVIEW', 'OFFICE_VISIT', 'ANNUAL_GENERAL_MEETING'].indexOf(search.meetingTypeCode) !== -1,
      'SEARCH_MEETING_TYPE_INVALID', 'Meeting type filterが不正です。');
  }
  return search;
}

function kspMaintenanceTrim_(value) {
  return value === null || value === undefined ? '' : String(value).trim();
}

function kspMaintenanceCellText_(value, kind) {
  if (value === null || value === undefined) return '';
  if (!(value instanceof Date)) {
    var text = String(value || '');
    if (kind === 'date') {
      var isoDate = /^(\d{4}-\d{2}-\d{2})(?:T|$)/.exec(text.trim());
      if (isoDate && kspIsValidDateKey_(isoDate[1])) return isoDate[1];
    }
    return text;
  }
  if (isNaN(value.getTime())) return '';
  if (kind === 'date') {
    return kspCanonicalPitchbookDateKey_(value);
  }
  if (kind === 'time') {
    return [String(value.getUTCHours()).padStart(2, '0'), String(value.getUTCMinutes()).padStart(2, '0')].join(':');
  }
  return value.toISOString();
}

function kspMaintenancePositiveInteger_(value, fallback) {
  var numberValue = Number(value);
  return Number.isFinite(numberValue) && numberValue > 0 && Math.floor(numberValue) === numberValue
    ? numberValue : fallback;
}

function kspMaintenanceSplitCodes_(value) {
  return String(value || '').split(',').map(function (item) { return item.trim(); }).filter(Boolean);
}

function kspMaintenanceMeetingTypeLabels_(value) {
  var labels = {
    ANNUAL_REVIEW: '定例年1回',
    OFFICE_VISIT: '先方オフィス訪問',
    ANNUAL_GENERAL_MEETING: '年次総会'
  };
  return kspMaintenanceSplitCodes_(value).map(function (code) { return labels[code] || code; });
}

function kspBuildMaintenanceRelatedPitchbookChoices_(rows, gpId, assetClassId, existingIds) {
  var preserved = {};
  (existingIds || []).forEach(function (id) { preserved[String(id)] = true; });
  return (rows || []).filter(function (row) {
    var id = String(row.Document_ID || '');
    return id && (preserved[id] || (String(row.Status || '') === KSP_STATUS.ACTIVE &&
      String(row.GP_ID || '') === String(gpId || '') &&
      String(row.Asset_Class_ID || '') === String(assetClassId || '')));
  }).map(function (row) {
    return {
      id: String(row.Document_ID || ''), date: kspMaintenanceCellText_(row.Date, 'date'),
      gpId: String(row.GP_ID || ''), assetClassId: String(row.Asset_Class_ID || ''),
      title: String(row.Saved_Filename || row.Original_Filename || row.Document_ID || ''),
      status: String(row.Status || ''), preserved: Boolean(preserved[String(row.Document_ID || '')])
    };
  }).sort(function (left, right) {
    return right.date.localeCompare(left.date) || left.id.localeCompare(right.id);
  });
}

function kspRecordMatchesSearch_(row, search) {
  var date = kspMaintenanceCellText_(row.Date, 'date');
  if (search.dateFrom && date < search.dateFrom) return false;
  if (search.dateTo && date > search.dateTo) return false;
  if (search.gpId && String(row.GP_ID || '') !== search.gpId) return false;
  if (search.assetClassId && String(row.Asset_Class_ID || '') !== search.assetClassId) return false;
  if (search.capitalTypeId && String(row.Capital_Type_ID || '') !== search.capitalTypeId) return false;
  if (search.teamId && String(row.Team_ID || '') !== search.teamId) return false;
  if (search.fundStrategy && String(row.Fund_Strategy || '').toLocaleLowerCase('ja').indexOf(search.fundStrategy.toLocaleLowerCase('ja')) === -1) return false;
  if (search.meetingTypeCode && kspMaintenanceSplitCodes_(row.Meeting_Type_Codes).indexOf(search.meetingTypeCode) === -1) return false;
  if (search.followUpOnly && !kspToBoolean_(row.Follow_Up_Required, false)) return false;
  if (search.status && String(row.Status || '') !== search.status) return false;
  return true;
}

function kspSearchRows_(rows, search, mapper) {
  return (rows || [])
    .filter(function (row) { return kspRecordMatchesSearch_(row, search); })
    .sort(function (left, right) {
      var dateCompare = kspMaintenanceCellText_(right.Date, 'date').localeCompare(kspMaintenanceCellText_(left.Date, 'date'));
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

function kspBuildCatalogMaps_(catalog) {
  var maps = { gp: {}, assetClass: {}, capitalType: {}, location: {}, team: {} };
  (catalog.gps || []).forEach(function (item) { maps.gp[item.id] = item.name; });
  (catalog.assetClasses || []).forEach(function (item) { maps.assetClass[item.id] = item.name; });
  (catalog.capitalTypes || []).forEach(function (item) { maps.capitalType[item.id] = item.name; });
  (catalog.locations || []).forEach(function (item) { maps.location[item.id] = item.name; });
  (catalog.teams || []).forEach(function (item) { maps.team[item.id] = item.name; });
  return maps;
}

function kspBuildAllMasterMaps_(gpRows, optionRows) {
  var maps = { gp: {}, assetClass: {}, capitalType: {}, location: {}, team: {} };
  (gpRows || []).forEach(function (row) {
    if (row.GP_ID) maps.gp[String(row.GP_ID)] = String(row.GP_Name || '');
  });
  (optionRows || []).forEach(function (row) {
    var target = String(row.Type || '') === KSP_OPTION_TYPES.ASSET_CLASS ? maps.assetClass
      : String(row.Type || '') === KSP_OPTION_TYPES.CAPITAL_TYPE ? maps.capitalType
      : String(row.Type || '') === KSP_OPTION_TYPES.LOCATION ? maps.location
      : String(row.Type || '') === KSP_OPTION_TYPES.TEAM ? maps.team : null;
    if (target && row.Option_ID) target[String(row.Option_ID)] = String(row.Name || '');
  });
  return maps;
}

function kspMapMeetingSearchResult_(row, maps) {
  return {
    meetingId: String(row.Meeting_ID || ''),
    date: kspMaintenanceCellText_(row.Date, 'date'),
    time: kspMaintenanceCellText_(row.Time, 'time'),
    gpId: String(row.GP_ID || ''),
    gpName: maps.gp[String(row.GP_ID || '')] || '',
    assetClassId: String(row.Asset_Class_ID || ''),
    assetClassName: maps.assetClass[String(row.Asset_Class_ID || '')] || '',
    capitalTypeId: String(row.Capital_Type_ID || ''),
    capitalTypeName: maps.capitalType[String(row.Capital_Type_ID || '')] || '',
    locationId: String(row.Location_ID || ''),
    locationName: maps.location[String(row.Location_ID || '')] || '',
    teamId: String(row.Team_ID || ''),
    teamName: (maps.team || {})[String(row.Team_ID || '')] || '',
    fundStrategy: String(row.Fund_Strategy || ''),
    meetingTypeCodes: kspMaintenanceSplitCodes_(row.Meeting_Type_Codes),
    meetingTypeLabels: kspMaintenanceMeetingTypeLabels_(row.Meeting_Type_Codes),
    relatedPitchbookIds: kspMaintenanceSplitCodes_(row.Related_Pitchbook_IDs),
    followUpRequired: kspToBoolean_(row.Follow_Up_Required, false),
    followUpNote: String(row.Follow_Up_Note || ''),
    counterparty: String(row.Counterparty || ''),
    internalParticipants: String(row.Internal_Participants || ''),
    documentId: String(row.Doc_File_ID || ''),
    documentUrl: String(row.Doc_URL || ''),
    filename: String(row.Saved_Filename || ''),
    status: String(row.Status || ''),
    version: Number(row.Version || 0),
    updatedAt: kspMaintenanceCellText_(row.Updated_At, 'iso')
  };
}

function kspMapPitchbookSearchResult_(row, maps) {
  return {
    documentId: String(row.Document_ID || ''),
    batchId: String(row.Batch_ID || ''),
    date: kspMaintenanceCellText_(row.Date, 'date'),
    gpId: String(row.GP_ID || ''),
    gpName: maps.gp[String(row.GP_ID || '')] || '',
    assetClassId: String(row.Asset_Class_ID || ''),
    assetClassName: maps.assetClass[String(row.Asset_Class_ID || '')] || '',
    capitalTypeId: String(row.Capital_Type_ID || ''),
    capitalTypeName: maps.capitalType[String(row.Capital_Type_ID || '')] || '',
    fundStrategy: String(row.Fund_Strategy || ''),
    sequenceNo: Number(row.Sequence_No || 0),
    fileId: String(row.File_ID || ''),
    fileUrl: String(row.File_URL || ''),
    originalFilename: String(row.Original_Filename || ''),
    savedFilename: String(row.Saved_Filename || ''),
    status: String(row.Status || ''),
    updatedAt: kspMaintenanceCellText_(row.Updated_At, 'iso')
  };
}

function kspParseMeetingDocumentText_(text) {
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
    followUpNote: values['フォローアップメモ'] || '',
    notes: notes
  };
}

function kspNormalizeMeetingEditInput_(input) {
  var normalized = kspNormalizeMeetingInput_(input);
  var source = input && typeof input === 'object' ? input : {};
  normalized.meetingId = kspMaintenanceTrim_(input && input.meetingId);
  normalized.expectedVersion = Number(input && input.expectedVersion);
  normalized.teamId = kspMaintenanceTrim_(source.teamId);
  normalized.fundStrategy = kspMaintenanceTrim_(source.fundStrategy);
  normalized.meetingTypeCodes = typeof kspNormalizeMeetingTypeCodes_ === 'function'
    ? kspNormalizeMeetingTypeCodes_(source.meetingTypeCodes)
    : kspMaintenanceSplitCodes_(source.meetingTypeCodes).join(',');
  normalized.relatedPitchbookIds = typeof kspNormalizeRelatedPitchbookIds_ === 'function'
    ? kspNormalizeRelatedPitchbookIds_(source.relatedPitchbookIds)
    : kspMaintenanceSplitCodes_(source.relatedPitchbookIds).sort().join(',');
  normalized.followUpRequired = kspToBoolean_(source.followUpRequired, false);
  normalized.followUpNote = source.followUpNote === null || source.followUpNote === undefined
    ? '' : String(source.followUpNote).replace(/\r\n?/g, '\n').replace(/\u0000/g, '');
  delete normalized.retryMeetingId;
  delete normalized.retryFingerprint;
  return normalized;
}

function kspValidateMeetingEditInput_(input, catalog) {
  kspParseMeetingId_(input.meetingId);
  kspAssert_(Number.isFinite(input.expectedVersion) && input.expectedVersion > 0 && Math.floor(input.expectedVersion) === input.expectedVersion,
    'MEETING_EXPECTED_VERSION_INVALID', 'Meeting Versionが不正です。');
  kspAssert_(input.fundStrategy.length <= 500, 'MEETING_FUND_STRATEGY_TOO_LONG',
    'Fund / Strategyは500文字以内で入力してください。');
  kspAssert_(input.followUpNote.length <= 2000, 'MEETING_FOLLOW_UP_NOTE_TOO_LONG',
    'フォローアップメモは2,000文字以内で入力してください。');
  return kspValidateMeetingInput_(input, catalog);
}

function kspBuildMeetingEditedRow_(currentRow, input, actor, nowIso, filename) {
  var updated = kspDeepClone_(currentRow);
  updated.Date = input.date;
  updated.Time = input.time;
  updated.Location_ID = input.locationId;
  updated.GP_ID = input.gpId;
  updated.Asset_Class_ID = input.assetClassId;
  updated.Capital_Type_ID = input.capitalTypeId;
  updated.Team_ID = input.teamId;
  updated.Fund_Strategy = input.fundStrategy;
  updated.Meeting_Type_Codes = input.meetingTypeCodes;
  updated.Related_Pitchbook_IDs = input.relatedPitchbookIds;
  updated.Follow_Up_Required = input.followUpRequired;
  updated.Follow_Up_Note = input.followUpNote;
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

function kspNormalizePitchbookEditInput_(input) {
  var source = input && typeof input === 'object' ? input : {};
  return {
    documentId: kspMaintenanceTrim_(source.documentId),
    expectedUpdatedAt: kspMaintenanceTrim_(source.expectedUpdatedAt),
    date: kspMaintenanceTrim_(source.date),
    gpId: kspMaintenanceTrim_(source.gpId),
    assetClassId: kspMaintenanceTrim_(source.assetClassId),
    capitalTypeId: kspMaintenanceTrim_(source.capitalTypeId),
    fundStrategy: kspMaintenanceTrim_(source.fundStrategy)
  };
}

function kspValidatePitchbookEditInput_(input, catalog) {
  kspParseDocumentId_(input.documentId);
  kspAssert_(input.expectedUpdatedAt, 'PITCHBOOK_EXPECTED_UPDATED_AT_REQUIRED', '更新トークンがありません。');
  kspAssert_(kspIsValidDateKey_(input.date), 'PITCHBOOK_DATE_INVALID', '日付が不正です。');
  kspAssert_(String(input.fundStrategy || '').length <= 500,
    'PITCHBOOK_FUND_STRATEGY_TOO_LONG', 'Fund / Strategyは500文字以内で入力してください。');
  var selected = {
    gp: kspRequireCatalogItem_(catalog.gps, input.gpId,
      'PITCHBOOK_GP_UNAVAILABLE', '選択されたGPは利用できません。'),
    assetClass: kspRequireCatalogItem_(catalog.assetClasses, input.assetClassId,
      'PITCHBOOK_ASSET_CLASS_UNAVAILABLE', '選択されたAsset Classは利用できません。'),
    capitalType: null
  };
  if (input.capitalTypeId) {
    selected.capitalType = kspRequireCatalogItem_(catalog.capitalTypes, input.capitalTypeId,
      'PITCHBOOK_CAPITAL_TYPE_UNAVAILABLE', '選択されたEquity / Debtは利用できません。');
  }
  return selected;
}

function kspPitchbookContextChanged_(currentRow, input) {
  return !kspPitchbookContextMatchesRow_(currentRow, input);
}

function kspPitchbookContextMatchesRow_(row, input) {
  return kspCanonicalPitchbookDateKey_(row.Date) === kspCanonicalPitchbookDateKey_(input.date) &&
    String(row.GP_ID || '') === input.gpId &&
    String(row.Asset_Class_ID || '') === input.assetClassId &&
    String(row.Capital_Type_ID || '') === input.capitalTypeId;
}

function kspBuildPitchbookSavedFilename_(input, selected, sequenceNo, originalFilename) {
  return kspBuildPitchbookFilename_(
    input, selected, sequenceNo, kspGetPitchbookExtension_(originalFilename)
  );
}

function kspBuildPitchbookEditedRow_(currentRow, input, actor, nowIso, sequenceNo, filename) {
  var updated = kspDeepClone_(currentRow);
  updated.Date = input.date;
  updated.GP_ID = input.gpId;
  updated.Asset_Class_ID = input.assetClassId;
  updated.Capital_Type_ID = input.capitalTypeId;
  updated.Fund_Strategy = input.fundStrategy;
  updated.Sequence_No = sequenceNo;
  updated.Saved_Filename = filename;
  updated.Updated_At = nowIso;
  updated.Updated_By = actor;
  updated.AI_Index_Status = KSP_AI_INDEX_STATUS.PENDING;
  updated.AI_Last_Error = '';
  return updated;
}

function kspNormalizeMasterName_(value) {
  var normalized = value === null || value === undefined ? '' : String(value);
  if (normalized.normalize) normalized = normalized.normalize('NFKC');
  return normalized.trim().replace(/\s+/g, ' ').toLocaleLowerCase('en');
}

function kspDisplayMasterName_(value) {
  var display = value === null || value === undefined ? '' : String(value);
  if (display.normalize) display = display.normalize('NFKC');
  return display.trim().replace(/\s+/g, ' ');
}

function kspNextGpId_(rows) {
  var maximum = (rows || []).reduce(function (maxValue, row) {
    var match = /^GP-(\d{6})$/.exec(String(row.GP_ID || ''));
    return match ? Math.max(maxValue, Number(match[1])) : maxValue;
  }, 0);
  return 'GP-' + String(maximum + 1).padStart(6, '0');
}

function kspOptionPrefix_(type) {
  var prefixes = { ASSET_CLASS: 'AC', CAPITAL_TYPE: 'CT', LOCATION: 'LOC', TEAM: 'TEAM' };
  kspAssert_(prefixes[type], 'OPTION_TYPE_INVALID', 'Option Typeが不正です。');
  return prefixes[type];
}

function kspNextOptionId_(rows, type) {
  var prefix = kspOptionPrefix_(type);
  var pattern = new RegExp('^OPT-' + prefix + '-(\\d{3})$');
  var maximum = (rows || []).reduce(function (maxValue, row) {
    if (String(row.Type || '') !== type) return maxValue;
    var match = pattern.exec(String(row.Option_ID || ''));
    return match ? Math.max(maxValue, Number(match[1])) : maxValue;
  }, 0);
  return 'OPT-' + prefix + '-' + String(maximum + 1).padStart(3, '0');
}

function kspFindNormalizedMasterDuplicate_(rows, entity, type, name, excludedId) {
  var normalized = kspNormalizeMasterName_(name);
  return (rows || []).filter(function (row) {
    if (entity === KSP_MASTER_ENTITY.GP) {
      return String(row.GP_ID || '') !== String(excludedId || '') &&
        kspNormalizeMasterName_(row.GP_Name) === normalized;
    }
    return String(row.Option_ID || '') !== String(excludedId || '') &&
      String(row.Type || '') === type && kspNormalizeMasterName_(row.Name) === normalized;
  })[0] || null;
}

function kspNormalizeMasterMutation_(input) {
  var source = input && typeof input === 'object' ? input : {};
  return {
    entity: kspMaintenanceTrim_(source.entity).toUpperCase(),
    action: kspMaintenanceTrim_(source.action).toUpperCase(),
    id: kspMaintenanceTrim_(source.id),
    type: kspMaintenanceTrim_(source.type).toUpperCase(),
    name: kspDisplayMasterName_(source.name),
    sortOrder: Number(source.sortOrder),
    returnExistingOnDuplicate: Boolean(source.returnExistingOnDuplicate)
  };
}

function kspValidateMasterMutation_(input) {
  kspAssert_(input.entity === KSP_MASTER_ENTITY.GP || input.entity === KSP_MASTER_ENTITY.OPTION,
    'MASTER_ENTITY_INVALID', 'Master種別が不正です。');
  kspAssert_(Object.keys(KSP_MASTER_MUTATION).some(function (key) {
    return KSP_MASTER_MUTATION[key] === input.action;
  }), 'MASTER_ACTION_INVALID', 'Master操作が不正です。');
  if (input.action === KSP_MASTER_MUTATION.ADD || input.action === KSP_MASTER_MUTATION.RENAME) {
    kspAssert_(input.name, 'MASTER_NAME_REQUIRED', '名称は必須です。');
    kspAssert_(input.name.length <= KSP_MAINTENANCE_LIMITS.MASTER_NAME,
      'MASTER_NAME_TOO_LONG', '名称が長すぎます。');
  }
  if (input.entity === KSP_MASTER_ENTITY.OPTION) {
    if (input.action === KSP_MASTER_MUTATION.ADD) kspOptionPrefix_(input.type);
    if (input.action === KSP_MASTER_MUTATION.REORDER) {
      kspAssert_(Number.isFinite(input.sortOrder) && input.sortOrder > 0 && Math.floor(input.sortOrder) === input.sortOrder,
        'OPTION_SORT_ORDER_INVALID', 'Sort Orderは正の整数にしてください。');
    }
  } else {
    kspAssert_(input.action !== KSP_MASTER_MUTATION.REORDER,
      'GP_REORDER_NOT_ALLOWED', 'GPは名称のアルファベット順で表示するため手動並び替えできません。');
  }
  if (input.action !== KSP_MASTER_MUTATION.ADD) {
    kspAssert_(input.id, 'MASTER_ID_REQUIRED', 'Master IDが必要です。');
  }
  return input;
}

function kspBuildMaintenanceAuditRow_(params) {
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
    Error_Message: options.errorCode ? kspSafePublicErrorMessage_(options.errorCode, 'MAINTENANCE') : '',
    Search_Mode: '', Question_Or_Instruction: '', Date_From: '', Date_To: '',
    GP_Filter: '', Asset_Class_Filter: '', Capital_Type_Filter: '', Source_Type_Filter: '',
    Model_ID: '', Cited_Source_IDs: ''
  };
}

function kspMeetingAuditSnapshot_(row) {
  return {
    Meeting_ID: row.Meeting_ID || '', Date: row.Date || '', Time: row.Time || '',
    Location_ID: row.Location_ID || '', GP_ID: row.GP_ID || '',
    Asset_Class_ID: row.Asset_Class_ID || '', Capital_Type_ID: row.Capital_Type_ID || '',
    Team_ID: row.Team_ID || '', Fund_Strategy: row.Fund_Strategy || '',
    Meeting_Type_Codes: row.Meeting_Type_Codes || '', Related_Pitchbook_IDs: row.Related_Pitchbook_IDs || '',
    Follow_Up_Required: kspToBoolean_(row.Follow_Up_Required, false),
    Counterparty: row.Counterparty || '', Internal_Participants: row.Internal_Participants || '',
    Doc_File_ID: row.Doc_File_ID || '', Doc_URL: row.Doc_URL || '',
    Saved_Filename: row.Saved_Filename || '', Status: row.Status || '',
    Version: Number(row.Version || 0), Updated_At: row.Updated_At || ''
  };
}

function kspPitchbookAuditSnapshot_(row) {
  return {
    Document_ID: row.Document_ID || '', Batch_ID: row.Batch_ID || '', Date: kspCanonicalPitchbookDateKey_(row.Date),
    GP_ID: row.GP_ID || '', Asset_Class_ID: row.Asset_Class_ID || '',
    Capital_Type_ID: row.Capital_Type_ID || '', Fund_Strategy: row.Fund_Strategy || '', Sequence_No: Number(row.Sequence_No || 0),
    File_ID: row.File_ID || '', File_URL: row.File_URL || '',
    Original_Filename: row.Original_Filename || '', Saved_Filename: row.Saved_Filename || '',
    Status: row.Status || '', Updated_At: row.Updated_At || ''
  };
}

function kspMasterAuditSnapshot_(entity, row) {
  if (entity === KSP_MASTER_ENTITY.GP) {
    return { GP_ID: row.GP_ID || '', GP_Name: row.GP_Name || '', Status: row.Status || '', Updated_At: row.Updated_At || '' };
  }
  return {
    Option_ID: row.Option_ID || '', Type: row.Type || '', Name: row.Name || '',
    Sort_Order: Number(row.Sort_Order || 0), Status: row.Status || '', Updated_At: row.Updated_At || ''
  };
}

function kspOptionOrderAuditSnapshot_(rows) {
  return (rows || []).map(function (row) {
    return { Option_ID: row.Option_ID || '', Type: row.Type || '', Name: row.Name || '', Sort_Order: Number(row.Sort_Order || 0) };
  }).sort(function (left, right) {
    if (left.Type !== right.Type) return left.Type.localeCompare(right.Type);
    if (left.Sort_Order !== right.Sort_Order) return left.Sort_Order - right.Sort_Order;
    return left.Option_ID.localeCompare(right.Option_ID);
  });
}

function kspChangedMetadataFields_(before, after) {
  var keys = kspUniqueStrings_(Object.keys(before || {}).concat(Object.keys(after || {})));
  return keys.filter(function (key) {
    return JSON.stringify((before || {})[key]) !== JSON.stringify((after || {})[key]);
  });
}

function kspActorKind_(actor) {
  var value = String(actor || 'UNIDENTIFIED');
  if (value.indexOf('TEMP_USER:') === 0) return 'TEMP_USER';
  if (value === 'UNIDENTIFIED') return 'UNIDENTIFIED';
  return 'EMAIL';
}

function kspBuildSchemaDiagnostic_(expectedSchemas, actualBySheet) {
  return Object.keys(expectedSchemas || {}).map(function (sheetName) {
    var actual = (actualBySheet && actualBySheet[sheetName]) || [];
    var missing = expectedSchemas[sheetName].filter(function (header) { return actual.indexOf(header) === -1; });
    return { sheet: sheetName, present: actual.length > 0, missingColumns: missing, ok: missing.length === 0 };
  });
}

function kspAuditRetentionCutoff_(nowIso, years) {
  var now = new Date(nowIso);
  kspAssert_(!Number.isNaN(now.getTime()), 'AUDIT_RETENTION_NOW_INVALID', '基準日時が不正です。');
  var cutoff = new Date(now.getTime());
  cutoff.setUTCFullYear(cutoff.getUTCFullYear() - Number(years || KSP_AUDIT_RETENTION_YEARS));
  return cutoff.toISOString();
}
