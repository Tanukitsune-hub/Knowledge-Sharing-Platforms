var KSP_MAINTENANCE_WORK_ID = '0007';
var KSP_MAINTENANCE_APP_VERSION = '0.4.0';
var KSP_MAINTENANCE_RESULT_LIMIT = 200;
var KSP_MAINTENANCE_CLAIM_TTL_MS = 5 * 60 * 1000;

var KSP_RECORD_TYPES = Object.freeze({
  MEETING: 'Meeting',
  PITCHBOOK: 'Pitchbook'
});

var KSP_MAINTENANCE_ACTIONS = Object.freeze({
  MEETING_UPDATE: 'MEETING_UPDATE',
  MEETING_INACTIVATE: 'MEETING_INACTIVATE',
  MEETING_REACTIVATE: 'MEETING_REACTIVATE',
  PITCHBOOK_UPDATE: 'PITCHBOOK_UPDATE',
  PITCHBOOK_INACTIVATE: 'PITCHBOOK_INACTIVATE',
  PITCHBOOK_REACTIVATE: 'PITCHBOOK_REACTIVATE',
  GP_ADD: 'GP_ADD',
  GP_RENAME: 'GP_RENAME',
  GP_INACTIVATE: 'GP_INACTIVATE',
  GP_REACTIVATE: 'GP_REACTIVATE',
  OPTION_ADD: 'OPTION_ADD',
  OPTION_RENAME: 'OPTION_RENAME',
  OPTION_REORDER: 'OPTION_REORDER',
  OPTION_INACTIVATE: 'OPTION_INACTIVATE',
  OPTION_REACTIVATE: 'OPTION_REACTIVATE'
});

function kspNormalizeRecordFilters(input) {
  var source = input && typeof input === 'object' ? input : {};
  var status = kspMaintenanceTrim(source.status);
  if (status) {
    kspAssert(status === KSP_STATUS.ACTIVE || status === KSP_STATUS.INACTIVE ||
      status === KSP_PITCHBOOK_STATUS.PENDING || status === KSP_PITCHBOOK_STATUS.FAILED,
      'FILTER_STATUS_INVALID', 'Status filter is invalid.');
  }
  var dateFrom = kspMaintenanceTrim(source.dateFrom);
  var dateTo = kspMaintenanceTrim(source.dateTo);
  kspAssert(!dateFrom || kspIsValidDateKey(dateFrom), 'FILTER_DATE_FROM_INVALID', 'Date From is invalid.');
  kspAssert(!dateTo || kspIsValidDateKey(dateTo), 'FILTER_DATE_TO_INVALID', 'Date To is invalid.');
  kspAssert(!dateFrom || !dateTo || dateFrom <= dateTo,
    'FILTER_DATE_RANGE_INVALID', 'Date From must not be later than Date To.');
  return {
    dateFrom: dateFrom,
    dateTo: dateTo,
    gpId: kspMaintenanceTrim(source.gpId),
    assetClassId: kspMaintenanceTrim(source.assetClassId),
    capitalTypeId: kspMaintenanceTrim(source.capitalTypeId),
    status: status,
    limit: Math.min(
      KSP_MAINTENANCE_RESULT_LIMIT,
      kspToPositiveInteger(source.limit, KSP_MAINTENANCE_RESULT_LIMIT)
    )
  };
}

function kspMaintenanceTrim(value) {
  return value === null || value === undefined ? '' : String(value).trim();
}

function kspRecordMatchesFilters(row, filters) {
  var safe = filters || {};
  var dateValue = String(row.Date || '');
  return (!safe.dateFrom || dateValue >= safe.dateFrom) &&
    (!safe.dateTo || dateValue <= safe.dateTo) &&
    (!safe.gpId || String(row.GP_ID || '') === safe.gpId) &&
    (!safe.assetClassId || String(row.Asset_Class_ID || '') === safe.assetClassId) &&
    (!safe.capitalTypeId || String(row.Capital_Type_ID || '') === safe.capitalTypeId) &&
    (!safe.status || String(row.Status || '') === safe.status);
}

function kspSortRecordsDescending(rows, idKey) {
  return (rows || []).slice().sort(function (left, right) {
    var leftDate = String(left.Date || '');
    var rightDate = String(right.Date || '');
    if (leftDate !== rightDate) return rightDate.localeCompare(leftDate);
    var leftUpdated = String(left.Updated_At || '');
    var rightUpdated = String(right.Updated_At || '');
    if (leftUpdated !== rightUpdated) return rightUpdated.localeCompare(leftUpdated);
    return String(right[idKey] || '').localeCompare(String(left[idKey] || ''));
  });
}

function kspBuildMasterLookup(gpRows, optionRows) {
  var gpById = {};
  var optionById = {};
  (gpRows || []).forEach(function (row) {
    gpById[String(row.GP_ID || '')] = {
      id: String(row.GP_ID || ''),
      name: String(row.GP_Name || ''),
      status: String(row.Status || ''),
      updatedAt: String(row.Updated_At || '')
    };
  });
  (optionRows || []).forEach(function (row) {
    optionById[String(row.Option_ID || '')] = {
      id: String(row.Option_ID || ''),
      type: String(row.Type || ''),
      name: String(row.Name || ''),
      sortOrder: Number(row.Sort_Order || 0),
      status: String(row.Status || ''),
      updatedAt: String(row.Updated_At || '')
    };
  });
  return { gpById: gpById, optionById: optionById };
}

function kspMeetingSearchItem(row, lookup) {
  var gp = lookup.gpById[String(row.GP_ID || '')] || {};
  var asset = lookup.optionById[String(row.Asset_Class_ID || '')] || {};
  var capital = lookup.optionById[String(row.Capital_Type_ID || '')] || {};
  var location = lookup.optionById[String(row.Location_ID || '')] || {};
  return {
    id: String(row.Meeting_ID || ''),
    date: String(row.Date || ''),
    time: String(row.Time || ''),
    gpId: String(row.GP_ID || ''),
    gpName: gp.name || '',
    assetClassId: String(row.Asset_Class_ID || ''),
    assetClassName: asset.name || '',
    capitalTypeId: String(row.Capital_Type_ID || ''),
    capitalTypeName: capital.name || '',
    locationId: String(row.Location_ID || ''),
    locationName: location.name || '',
    counterparty: String(row.Counterparty || ''),
    internalParticipants: String(row.Internal_Participants || ''),
    documentId: String(row.Doc_File_ID || ''),
    documentUrl: String(row.Doc_URL || ''),
    filename: String(row.Saved_Filename || ''),
    status: String(row.Status || KSP_STATUS.ACTIVE),
    version: Number(row.Version || 1),
    updatedAt: String(row.Updated_At || '')
  };
}

function kspPitchbookSearchItem(row, lookup) {
  var gp = lookup.gpById[String(row.GP_ID || '')] || {};
  var asset = lookup.optionById[String(row.Asset_Class_ID || '')] || {};
  var capital = lookup.optionById[String(row.Capital_Type_ID || '')] || {};
  return {
    id: String(row.Document_ID || ''),
    documentId: String(row.Document_ID || ''),
    batchId: String(row.Batch_ID || ''),
    date: String(row.Date || ''),
    gpId: String(row.GP_ID || ''),
    gpName: gp.name || '',
    assetClassId: String(row.Asset_Class_ID || ''),
    assetClassName: asset.name || '',
    capitalTypeId: String(row.Capital_Type_ID || ''),
    capitalTypeName: capital.name || '',
    sequenceNo: Number(row.Sequence_No || 0),
    fileId: String(row.File_ID || ''),
    fileUrl: String(row.File_URL || ''),
    originalFilename: String(row.Original_Filename || ''),
    filename: String(row.Saved_Filename || ''),
    status: String(row.Status || KSP_PITCHBOOK_STATUS.PENDING),
    updatedAt: String(row.Updated_At || '')
  };
}

function kspExtractMeetingNotes(documentText) {
  var text = String(documentText || '').replace(/\r\n?/g, '\n');
  var marker = '\n面談内容:\n';
  var index = text.indexOf(marker);
  if (index === -1) {
    if (text.indexOf('面談内容:\n') === 0) return text.slice('面談内容:\n'.length);
    return '';
  }
  return text.slice(index + marker.length);
}

function kspNormalizeMeetingMaintenanceInput(input) {
  var normalized = kspNormalizeMeetingInput(input);
  normalized.meetingId = kspMaintenanceTrim(input && input.meetingId);
  normalized.expectedVersion = Number(input && input.expectedVersion);
  kspParseMeetingId(normalized.meetingId);
  kspAssert(Number.isFinite(normalized.expectedVersion) && normalized.expectedVersion > 0 &&
    Math.floor(normalized.expectedVersion) === normalized.expectedVersion,
    'MEETING_EXPECTED_VERSION_INVALID', 'Expected Meeting Version is invalid.');
  return normalized;
}

function kspNormalizeMeetingStatusInput(input) {
  var source = input && typeof input === 'object' ? input : {};
  var meetingId = kspMaintenanceTrim(source.meetingId);
  var expectedVersion = Number(source.expectedVersion);
  var status = kspMaintenanceTrim(source.status);
  kspParseMeetingId(meetingId);
  kspAssert(Number.isFinite(expectedVersion) && expectedVersion > 0 && Math.floor(expectedVersion) === expectedVersion,
    'MEETING_EXPECTED_VERSION_INVALID', 'Expected Meeting Version is invalid.');
  kspAssert(status === KSP_STATUS.ACTIVE || status === KSP_STATUS.INACTIVE,
    'MEETING_STATUS_INVALID', 'Meeting status is invalid.');
  return { meetingId: meetingId, expectedVersion: expectedVersion, status: status };
}

function kspNormalizePitchbookMaintenanceInput(input) {
  var source = input && typeof input === 'object' ? input : {};
  var normalized = {
    documentId: kspMaintenanceTrim(source.documentId),
    expectedUpdatedAt: kspMaintenanceTrim(source.expectedUpdatedAt),
    date: kspMaintenanceTrim(source.date),
    gpId: kspMaintenanceTrim(source.gpId),
    assetClassId: kspMaintenanceTrim(source.assetClassId),
    capitalTypeId: kspMaintenanceTrim(source.capitalTypeId)
  };
  kspParseDocumentId(normalized.documentId);
  kspAssert(normalized.expectedUpdatedAt, 'PITCHBOOK_EXPECTED_UPDATED_AT_REQUIRED',
    'Expected Updated At is required.');
  kspAssert(kspIsValidDateKey(normalized.date), 'PITCHBOOK_DATE_INVALID', '日付はYYYY-MM-DD形式で入力してください。');
  kspAssert(normalized.gpId, 'PITCHBOOK_GP_REQUIRED', 'GPは必須です。');
  kspAssert(normalized.assetClassId, 'PITCHBOOK_ASSET_CLASS_REQUIRED', 'Asset Classは必須です。');
  return normalized;
}

function kspNormalizePitchbookStatusInput(input) {
  var source = input && typeof input === 'object' ? input : {};
  var documentId = kspMaintenanceTrim(source.documentId);
  var expectedUpdatedAt = kspMaintenanceTrim(source.expectedUpdatedAt);
  var status = kspMaintenanceTrim(source.status);
  kspParseDocumentId(documentId);
  kspAssert(expectedUpdatedAt, 'PITCHBOOK_EXPECTED_UPDATED_AT_REQUIRED', 'Expected Updated At is required.');
  kspAssert(status === KSP_STATUS.ACTIVE || status === KSP_STATUS.INACTIVE,
    'PITCHBOOK_STATUS_INVALID', 'Pitchbook status is invalid.');
  return { documentId: documentId, expectedUpdatedAt: expectedUpdatedAt, status: status };
}

function kspPitchbookNamingContextChanged(row, input) {
  return String(row.Date || '') !== input.date ||
    String(row.GP_ID || '') !== input.gpId ||
    String(row.Asset_Class_ID || '') !== input.assetClassId ||
    String(row.Capital_Type_ID || '') !== input.capitalTypeId;
}

function kspBuildMaintenanceAuditRow(params) {
  var options = params || {};
  return {
    Event_Timestamp: options.timestamp || '',
    Actor: options.actor || 'UNIDENTIFIED',
    Action: options.action || '',
    Target_Type: options.targetType || '',
    Target_ID: options.targetId || '',
    Result: options.result || KSP_AUDIT_RESULTS.SUCCESS,
    Changed_Fields: (options.changedFields || []).join(','),
    Before_Metadata_JSON: options.before ? JSON.stringify(options.before) : '',
    After_Metadata_JSON: options.after ? JSON.stringify(options.after) : '',
    Batch_ID: options.batchId || '',
    Error_Code: options.errorCode || '',
    Error_Message: options.errorMessage || '',
    Search_Mode: '',
    Question_Or_Instruction: '',
    Date_From: '',
    Date_To: '',
    GP_Filter: '',
    Asset_Class_Filter: '',
    Capital_Type_Filter: '',
    Source_Type_Filter: '',
    Model_ID: '',
    Cited_Source_IDs: ''
  };
}

function kspMeetingAuditSnapshot(row) {
  return {
    Meeting_ID: String(row.Meeting_ID || ''),
    Date: String(row.Date || ''),
    Time: String(row.Time || ''),
    Location_ID: String(row.Location_ID || ''),
    GP_ID: String(row.GP_ID || ''),
    Asset_Class_ID: String(row.Asset_Class_ID || ''),
    Capital_Type_ID: String(row.Capital_Type_ID || ''),
    Counterparty: String(row.Counterparty || ''),
    Internal_Participants: String(row.Internal_Participants || ''),
    Doc_File_ID: String(row.Doc_File_ID || ''),
    Doc_URL: String(row.Doc_URL || ''),
    Saved_Filename: String(row.Saved_Filename || ''),
    Status: String(row.Status || ''),
    Version: Number(row.Version || 0),
    Updated_At: String(row.Updated_At || '')
  };
}

function kspPitchbookAuditSnapshot(row) {
  return {
    Document_ID: String(row.Document_ID || ''),
    Batch_ID: String(row.Batch_ID || ''),
    Date: String(row.Date || ''),
    GP_ID: String(row.GP_ID || ''),
    Asset_Class_ID: String(row.Asset_Class_ID || ''),
    Capital_Type_ID: String(row.Capital_Type_ID || ''),
    Sequence_No: Number(row.Sequence_No || 0),
    File_ID: String(row.File_ID || ''),
    File_URL: String(row.File_URL || ''),
    Original_Filename: String(row.Original_Filename || ''),
    Saved_Filename: String(row.Saved_Filename || ''),
    Status: String(row.Status || ''),
    Updated_At: String(row.Updated_At || '')
  };
}

function kspChangedFields(before, after) {
  var keys = {};
  Object.keys(before || {}).forEach(function (key) { keys[key] = true; });
  Object.keys(after || {}).forEach(function (key) { keys[key] = true; });
  return Object.keys(keys).filter(function (key) {
    return JSON.stringify(before ? before[key] : null) !== JSON.stringify(after ? after[key] : null);
  });
}

function kspNormalizeMasterName(value) {
  return kspMaintenanceTrim(value).replace(/\s+/g, ' ');
}

function kspMasterNameKey(value) {
  return kspNormalizeMasterName(value).toLocaleLowerCase('en-US');
}

function kspAssertUniqueMasterName(rows, name, idKey, nameKey, excludedId, type) {
  var key = kspMasterNameKey(name);
  kspAssert(key, 'MASTER_NAME_REQUIRED', 'Name is required.');
  var duplicate = (rows || []).some(function (row) {
    if (excludedId && String(row[idKey] || '') === String(excludedId)) return false;
    if (type && String(row.Type || '') !== String(type)) return false;
    return kspMasterNameKey(row[nameKey]) === key;
  });
  kspAssert(!duplicate, 'MASTER_NAME_DUPLICATE', '同じ名称のマスターが既に存在します。');
}

function kspFormatGpId(sequence) {
  return 'GP-' + kspFormatMaintenanceSequence(sequence, 'GP_SEQUENCE_INVALID');
}

function kspFormatOptionId(type, sequence) {
  var prefixes = { ASSET_CLASS: 'OPT-AC-', CAPITAL_TYPE: 'OPT-CT-', LOCATION: 'OPT-LOC-' };
  kspAssert(prefixes[type], 'OPTION_TYPE_INVALID', 'Option type is invalid.');
  var numeric = Number(sequence);
  kspAssert(Number.isFinite(numeric) && numeric > 0 && numeric <= 999 && Math.floor(numeric) === numeric,
    'OPTION_SEQUENCE_INVALID', 'Option sequence is invalid.');
  return prefixes[type] + String(numeric).padStart(3, '0');
}

function kspFormatMaintenanceSequence(sequence, code) {
  var numeric = Number(sequence);
  kspAssert(Number.isFinite(numeric) && numeric > 0 && numeric <= 999999 && Math.floor(numeric) === numeric,
    code, 'Sequence is invalid.');
  return String(numeric).padStart(6, '0');
}

function kspNextGpSequence(rows) {
  return (rows || []).reduce(function (max, row) {
    var match = /^GP-(\d{6})$/.exec(String(row.GP_ID || ''));
    return match ? Math.max(max, Number(match[1])) : max;
  }, 0) + 1;
}

function kspNextOptionSequence(rows, type) {
  var patterns = {
    ASSET_CLASS: /^OPT-AC-(\d{3})$/,
    CAPITAL_TYPE: /^OPT-CT-(\d{3})$/,
    LOCATION: /^OPT-LOC-(\d{3})$/
  };
  kspAssert(patterns[type], 'OPTION_TYPE_INVALID', 'Option type is invalid.');
  return (rows || []).reduce(function (max, row) {
    if (String(row.Type || '') !== type) return max;
    var match = patterns[type].exec(String(row.Option_ID || ''));
    return match ? Math.max(max, Number(match[1])) : max;
  }, 0) + 1;
}

function kspMasterResponse(gpRows, optionRows) {
  var gps = (gpRows || []).map(function (row) {
    return {
      id: String(row.GP_ID || ''),
      name: String(row.GP_Name || ''),
      status: String(row.Status || ''),
      updatedAt: String(row.Updated_At || '')
    };
  }).sort(function (left, right) {
    return left.name.toLocaleLowerCase('en-US').localeCompare(right.name.toLocaleLowerCase('en-US'), 'en');
  });
  var options = (optionRows || []).map(function (row) {
    return {
      id: String(row.Option_ID || ''),
      type: String(row.Type || ''),
      name: String(row.Name || ''),
      sortOrder: Number(row.Sort_Order || 0),
      status: String(row.Status || ''),
      updatedAt: String(row.Updated_At || '')
    };
  }).sort(function (left, right) {
    if (left.type !== right.type) return left.type.localeCompare(right.type);
    if (left.sortOrder !== right.sortOrder) return left.sortOrder - right.sortOrder;
    return left.name.localeCompare(right.name, 'ja');
  });
  return { gps: gps, options: options };
}

function kspBuildPhase1Diagnostics(state, schemas, actor) {
  var resources = state && state.resources ? state.resources : {};
  return {
    ok: true,
    workId: KSP_MAINTENANCE_WORK_ID,
    appVersion: KSP_MAINTENANCE_APP_VERSION,
    environment: state && state.config ? String(state.config.environment || '') : '',
    backendAndAuditSeparated: Boolean(resources.backendSpreadsheetId && resources.auditSpreadsheetId &&
      resources.backendSpreadsheetId !== resources.auditSpreadsheetId),
    requiredResourcesConfigured: Boolean(resources.meetingRecordsFolderId && resources.pitchbooksFolderId &&
      resources.backendSpreadsheetId && resources.auditSpreadsheetId),
    backendSheets: Object.keys(schemas || {}).sort(),
    actor: actor || 'UNIDENTIFIED',
    capabilities: {
      meetingRegistration: true,
      pitchbookRegistration: true,
      pastRecordSearch: true,
      recordMaintenance: true,
      masterManagement: true,
      geminiRetrieval: false
    },
    liveQualificationDeferred: true
  };
}

function kspBuildMaintenanceCatalog(gpRows, optionRows) {
  var gps = (gpRows || []).map(function (row) {
    return {
      id: String(row.GP_ID || ''),
      name: String(row.GP_Name || ''),
      status: String(row.Status || '')
    };
  }).filter(function (row) { return row.id && row.name; });
  var options = (optionRows || []).map(function (row) {
    return {
      id: String(row.Option_ID || ''),
      type: String(row.Type || ''),
      name: String(row.Name || ''),
      sortOrder: Number(row.Sort_Order || 0),
      status: String(row.Status || '')
    };
  }).filter(function (row) { return row.id && row.type && row.name; });
  function byType(type) {
    return options.filter(function (row) { return row.type === type; }).sort(function (left, right) {
      if (left.sortOrder !== right.sortOrder) return left.sortOrder - right.sortOrder;
      return left.name.localeCompare(right.name, 'ja');
    });
  }
  gps.sort(function (left, right) {
    return left.name.toLocaleLowerCase('en-US').localeCompare(right.name.toLocaleLowerCase('en-US'), 'en');
  });
  return {
    gps: gps,
    assetClasses: byType(KSP_OPTION_TYPES.ASSET_CLASS),
    capitalTypes: byType(KSP_OPTION_TYPES.CAPITAL_TYPE),
    locations: byType(KSP_OPTION_TYPES.LOCATION)
  };
}
