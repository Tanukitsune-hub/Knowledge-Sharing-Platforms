function kspIsParentBoundPitchbookEligible_(row, meetingRows) {
  if (!row || String(row.Status || '') !== KSP_STATUS.ACTIVE) return false;
  if (!kspAiTrim_(row.Parent_Meeting_ID)) return true;
  var documentId = kspAiTrim_(row.Document_ID);
  return Boolean(documentId && (meetingRows || []).some(function (meeting) {
    return meeting && kspAiTrim_(meeting.Meeting_ID) && String(meeting.Status || '') === KSP_STATUS.ACTIVE &&
      kspMaintenanceSplitCodes_(meeting.Related_Pitchbook_IDs).indexOf(documentId) !== -1;
  }));
}

function kspPitchbookAiContext_(row, maps) {
  var bound = Boolean(kspAiTrim_(row.Parent_Meeting_ID));
  var id = kspMeetingCounterpartyId_(row);
  var type = String((maps && maps.counterpartyTypes || {})[id] || kspAiTrim_(row.Counterparty_Type));
  var valid = /^(?:CP-\d{6}|GP-.+)$/.test(id) && (!type || KSP_COUNTERPARTY_TYPE_DEFINITIONS.some(function (item) {
    return item.code === type;
  }));
  return {
    valid: valid, parentMeetingId: kspAiTrim_(row.Parent_Meeting_ID),
    counterpartyType: type, counterpartyId: id, entityKey: valid ? 'COUNTERPARTY:' + id : '',
    relatedGpIds: ''
  };
}

function kspApplyPitchbookAiContext_(source, row, maps) {
  var context = kspPitchbookAiContext_(row, maps);
  kspAssert_(!context.parentMeetingId || context.valid, 'AI_PARENT_SOURCE_CONTEXT_INVALID', '資料の面談先contextが不正です。');
  source.parentMeetingId = context.parentMeetingId;
  source.entityKey = context.entityKey;
  source.counterpartyType = context.counterpartyType;
  source.counterpartyId = context.counterpartyId;
  source.counterpartyName = (maps.counterparties || {})[context.counterpartyId] || context.counterpartyId;
  source.relatedGpIds = context.relatedGpIds;
  if (context.parentMeetingId) {
    source.gpId = context.counterpartyType === 'GP' ? context.counterpartyId : '';
    source.gpName = source.gpId ? (maps.gps[source.gpId] || source.gpId) : '';
  }
  return source;
}

function kspParentBoundSourceHash_(environment, source) {
  if (!source.parentMeetingId) return source;
  // The immutable reservation context participates in derived identity, not the filename.
  source.contentHash = environment.hashText(JSON.stringify([
    source.contentHash, source.parentMeetingId, source.entityKey, source.relatedGpIds,
    source.dateKey, source.assetClassId, source.capitalTypeId, source.fundStrategy
  ]));
  return source;
}

function kspBuildAiMasterMaps_(counterpartyRows, optionRows) {
  var maps = { gps: {}, assetClasses: {}, capitalTypes: {}, teams: {}, counterparties: {}, counterpartyTypes: {} };
  (counterpartyRows || []).forEach(function (row) {
    var id = row && String(row.Counterparty_ID || row.GP_ID || '');
    if (id) {
      var name = String(row.Counterparty_Name || row.GP_Name || id);
      var type = String(row.Counterparty_Type || (row.GP_ID ? 'GP' : ''));
      maps.counterparties[id] = name;
      maps.counterparties['COUNTERPARTY:' + id] = name;
      maps.counterpartyTypes[id] = type;
      if (type === 'GP') maps.gps[id] = name;
    }
  });
  (optionRows || []).forEach(function (row) {
    if (!row || !row.Option_ID) return;
    var target = null;
    if (String(row.Type) === 'ASSET_CLASS') target = maps.assetClasses;
    if (String(row.Type) === 'CAPITAL_TYPE') target = maps.capitalTypes;
    if (String(row.Type) === 'TEAM') target = maps.teams;
    if (target) target[String(row.Option_ID)] = String(row.Name || row.Option_ID);
  });
  return maps;
}

function kspAiSourceKey_(sourceType, sourceId) {
  return String(sourceType) + ':' + String(sourceId);
}

function kspBuildMeetingAiSource_(row, maps, text, contentHash) {
  kspAssert_(row && row.Meeting_ID, 'AI_MEETING_ROW_INVALID', 'Meeting row is invalid.');
  kspAssert_(row.Doc_File_ID, 'AI_MEETING_DOC_MISSING', 'Meeting Google Doc is missing.');
  var counterpartyType = String((maps.counterpartyTypes || {})[kspMeetingCounterpartyId_(row)] || kspMeetingCounterpartyType_(row));
  var counterpartyId = kspMeetingCounterpartyId_(row);
  return {
    sourceType: KSP_AI_SOURCE_TYPES.MEETING,
    sourceId: String(row.Meeting_ID),
    dateKey: kspCanonicalBusinessDate_(row.Date),
    gpId: String(row.GP_ID || ''),
    gpName: maps.gps[String(row.GP_ID || '')] || String(row.GP_ID || ''),
    entityKey: 'COUNTERPARTY:' + counterpartyId,
    counterpartyType: counterpartyType,
    counterpartyId: counterpartyId,
    counterpartyName: (maps.counterparties || {})[counterpartyId] || counterpartyId,
    relatedGpIds: '',
    assetClassId: String(row.Asset_Class_ID || ''),
    assetClassName: maps.assetClasses[String(row.Asset_Class_ID || '')] || String(row.Asset_Class_ID || ''),
    capitalTypeId: String(row.Capital_Type_ID || ''),
    capitalTypeName: maps.capitalTypes[String(row.Capital_Type_ID || '')] || String(row.Capital_Type_ID || ''),
    teamId: String(row.Team_ID || ''),
    teamName: (maps.teams || {})[String(row.Team_ID || '')] || String(row.Team_ID || ''),
    fundStrategy: String(row.Fund_Strategy || ''),
    meetingTypeCodes: String(row.Meeting_Type_Codes || ''),
    relatedPitchbookIds: String(row.Related_Pitchbook_IDs || ''),
    followUpRequired: kspToBoolean_(row.Follow_Up_Required, false),
    driveUrl: String(row.Doc_URL || ''),
    savedFilename: String(row.Saved_Filename || row.Meeting_ID),
    displayName: String(row.Saved_Filename || row.Meeting_ID) + '.txt',
    mimeType: 'text/plain',
    text: String(text || ''),
    contentHash: String(contentHash || '')
  };
}

function kspGetPitchbookExtensionForAi_(row) {
  var name = String((row && (row.Saved_Filename || row.Original_Filename)) || '');
  var match = /\.([^.]+)$/.exec(name);
  return match ? match[1].toLowerCase() : '';
}

function kspBuildPitchbookAiSource_(row, maps, text, contentHash) {
  kspAssert_(row && row.Document_ID, 'AI_PITCHBOOK_ROW_INVALID', 'Pitchbook row is invalid.');
  kspAssert_(row.File_ID, 'AI_PITCHBOOK_FILE_MISSING', 'Pitchbook source file is missing.');
  var extension = kspGetPitchbookExtensionForAi_(row);
  kspAssert_(extension === 'txt', 'AI_FORMAT_DEFERRED_TO_WORK_0009',
    'Work 0008 indexes Meeting text and TXT sources only.');
  return kspApplyPitchbookAiContext_({
    sourceType: KSP_AI_SOURCE_TYPES.PITCHBOOK,
    sourceId: String(row.Document_ID),
    dateKey: kspCanonicalBusinessDate_(row.Date),
    gpId: String(row.GP_ID || ''),
    gpName: maps.gps[String(row.GP_ID || '')] || String(row.GP_ID || ''),
    entityKey: 'COUNTERPARTY:' + kspMeetingCounterpartyId_(row),
    counterpartyType: String((maps.counterpartyTypes || {})[kspMeetingCounterpartyId_(row)] || ''),
    counterpartyId: kspMeetingCounterpartyId_(row),
    counterpartyName: (maps.counterparties || {})[kspMeetingCounterpartyId_(row)] || kspMeetingCounterpartyId_(row),
    relatedGpIds: '',
    assetClassId: String(row.Asset_Class_ID || ''),
    assetClassName: maps.assetClasses[String(row.Asset_Class_ID || '')] || String(row.Asset_Class_ID || ''),
    capitalTypeId: String(row.Capital_Type_ID || ''),
    capitalTypeName: maps.capitalTypes[String(row.Capital_Type_ID || '')] || String(row.Capital_Type_ID || ''),
    fundStrategy: String(row.Fund_Strategy || ''),
    driveUrl: String(row.File_URL || ''),
    savedFilename: String(row.Saved_Filename || row.Original_Filename || row.Document_ID),
    displayName: String(row.Saved_Filename || row.Original_Filename || row.Document_ID),
    mimeType: 'text/plain',
    text: String(text || ''),
    contentHash: String(contentHash || '')
  }, row, maps);
}

function kspAiWorkItemFromRow_(sourceType, row) {
  return {
    sourceType: sourceType,
    sourceId: sourceType === KSP_AI_SOURCE_TYPES.MEETING ? String(row.Meeting_ID || '') : String(row.Document_ID || ''),
    row: row
  };
}

function kspIsAiWorkEligible_(item, nowIso, settings) {
  var row = item.row || {};
  var sourceStatus = String(row.Status || '');
  var aiStatus = String(row.AI_Index_Status || KSP_AI_INDEX_STATUS.NOT_INDEXED);
  if (sourceStatus === KSP_STATUS.INACTIVE) {
    return Boolean(row.AI_Document_Name) || aiStatus === KSP_AI_INDEX_STATUS.INDEXED || aiStatus === KSP_AI_INDEX_STATUS.FAILED;
  }
  if (sourceStatus !== KSP_STATUS.ACTIVE) return false;
  if (aiStatus === KSP_AI_INDEX_STATUS.PENDING) return true;
  if (aiStatus === KSP_AI_INDEX_STATUS.INDEXED && !row.AI_Document_Name) return true;
  if (aiStatus !== KSP_AI_INDEX_STATUS.FAILED) return false;
  var lastError = kspParseAiLastError_(row.AI_Last_Error);
  if (lastError.permanent || !lastError.retryable || lastError.attempt >= settings.maxRetryAttempts) return false;
  return !lastError.nextAttemptAt ||
    kspTemporalInstantComparisonKey_(lastError.nextAttemptAt) <= kspTemporalInstantComparisonKey_(nowIso);
}

function kspSelectAiWorkItems_(meetingRows, pitchbookRows, nowIso, settings) {
  var items = [];
  (meetingRows || []).forEach(function (row) {
    var item = kspAiWorkItemFromRow_(KSP_AI_SOURCE_TYPES.MEETING, row);
    if (kspIsAiWorkEligible_(item, nowIso, settings)) items.push(item);
  });
  (pitchbookRows || []).forEach(function (row) {
    var item = kspAiWorkItemFromRow_(KSP_AI_SOURCE_TYPES.PITCHBOOK, row);
    item.retrievalEligible = kspIsParentBoundPitchbookEligible_(row, meetingRows);
    if (!item.retrievalEligible && String(row.Status) === KSP_STATUS.ACTIVE) {
      if (row.AI_Document_Name || row.AI_Content_Hash) items.push(item);
      return;
    }
    if (kspIsAiWorkEligible_(item, nowIso, settings)) items.push(item);
  });
  items.sort(function (left, right) {
    var leftInactive = String(left.row.Status) === KSP_STATUS.INACTIVE ? 0 : 1;
    var rightInactive = String(right.row.Status) === KSP_STATUS.INACTIVE ? 0 : 1;
    if (leftInactive !== rightInactive) return leftInactive - rightInactive;
    var leftTime = kspTemporalInstantComparisonKey_(left.row.Updated_At || left.row.Created_At);
    var rightTime = kspTemporalInstantComparisonKey_(right.row.Updated_At || right.row.Created_At);
    if (leftTime !== rightTime) return leftTime.localeCompare(rightTime);
    return kspAiSourceKey_(left.sourceType, left.sourceId).localeCompare(kspAiSourceKey_(right.sourceType, right.sourceId));
  });
  return items.slice(0, settings.syncBatchSize);
}

function kspBuildAiSource_(environment, item, maps) {
  var row = item.row;
  var text;
  if (item.sourceType === KSP_AI_SOURCE_TYPES.MEETING) {
    text = environment.readMeetingText(String(row.Doc_File_ID || ''));
    return kspBuildMeetingAiSource_(row, maps, text, environment.hashText(text));
  }
  var extension = kspGetPitchbookExtensionForAi_(row);
  if (extension !== 'txt') {
    var unsupported = new Error('Work 0008 indexes Meeting text and TXT sources only.');
    unsupported.code = 'AI_FORMAT_DEFERRED_TO_WORK_0009';
    unsupported.retryable = false;
    unsupported.permanent = true;
    throw unsupported;
  }
  text = environment.readTextFile(String(row.File_ID || ''));
  return kspParentBoundSourceHash_(environment,
    kspBuildPitchbookAiSource_(row, maps, text, environment.hashText(text)));
}
