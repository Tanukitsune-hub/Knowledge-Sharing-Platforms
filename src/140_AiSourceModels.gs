function kspBuildAiMasterMaps(gpRows, optionRows) {
  var maps = { gps: {}, assetClasses: {}, capitalTypes: {} };
  (gpRows || []).forEach(function (row) {
    if (row && row.GP_ID) maps.gps[String(row.GP_ID)] = String(row.GP_Name || row.GP_ID);
  });
  (optionRows || []).forEach(function (row) {
    if (!row || !row.Option_ID) return;
    var target = null;
    if (String(row.Type) === 'ASSET_CLASS') target = maps.assetClasses;
    if (String(row.Type) === 'CAPITAL_TYPE') target = maps.capitalTypes;
    if (target) target[String(row.Option_ID)] = String(row.Name || row.Option_ID);
  });
  return maps;
}

function kspAiSourceKey(sourceType, sourceId) {
  return String(sourceType) + ':' + String(sourceId);
}

function kspBuildMeetingAiSource(row, maps, text, contentHash) {
  kspAssert(row && row.Meeting_ID, 'AI_MEETING_ROW_INVALID', 'Meeting row is invalid.');
  kspAssert(row.Doc_File_ID, 'AI_MEETING_DOC_MISSING', 'Meeting Google Doc is missing.');
  return {
    sourceType: KSP_AI_SOURCE_TYPES.MEETING,
    sourceId: String(row.Meeting_ID),
    dateKey: String(row.Date || ''),
    gpId: String(row.GP_ID || ''),
    gpName: maps.gps[String(row.GP_ID || '')] || String(row.GP_ID || ''),
    assetClassId: String(row.Asset_Class_ID || ''),
    assetClassName: maps.assetClasses[String(row.Asset_Class_ID || '')] || String(row.Asset_Class_ID || ''),
    capitalTypeId: String(row.Capital_Type_ID || ''),
    capitalTypeName: maps.capitalTypes[String(row.Capital_Type_ID || '')] || String(row.Capital_Type_ID || ''),
    driveUrl: String(row.Doc_URL || ''),
    savedFilename: String(row.Saved_Filename || row.Meeting_ID),
    displayName: String(row.Saved_Filename || row.Meeting_ID) + '.txt',
    mimeType: 'text/plain',
    text: String(text || ''),
    contentHash: String(contentHash || '')
  };
}

function kspGetPitchbookExtensionForAi(row) {
  var name = String((row && (row.Saved_Filename || row.Original_Filename)) || '');
  var match = /\.([^.]+)$/.exec(name);
  return match ? match[1].toLowerCase() : '';
}

function kspBuildPitchbookAiSource(row, maps, text, contentHash) {
  kspAssert(row && row.Document_ID, 'AI_PITCHBOOK_ROW_INVALID', 'Pitchbook row is invalid.');
  kspAssert(row.File_ID, 'AI_PITCHBOOK_FILE_MISSING', 'Pitchbook source file is missing.');
  var extension = kspGetPitchbookExtensionForAi(row);
  kspAssert(extension === 'txt', 'AI_FORMAT_DEFERRED_TO_WORK_0009',
    'Work 0008 indexes Meeting text and TXT sources only.');
  return {
    sourceType: KSP_AI_SOURCE_TYPES.PITCHBOOK,
    sourceId: String(row.Document_ID),
    dateKey: String(row.Date || ''),
    gpId: String(row.GP_ID || ''),
    gpName: maps.gps[String(row.GP_ID || '')] || String(row.GP_ID || ''),
    assetClassId: String(row.Asset_Class_ID || ''),
    assetClassName: maps.assetClasses[String(row.Asset_Class_ID || '')] || String(row.Asset_Class_ID || ''),
    capitalTypeId: String(row.Capital_Type_ID || ''),
    capitalTypeName: maps.capitalTypes[String(row.Capital_Type_ID || '')] || String(row.Capital_Type_ID || ''),
    driveUrl: String(row.File_URL || ''),
    savedFilename: String(row.Saved_Filename || row.Original_Filename || row.Document_ID),
    displayName: String(row.Saved_Filename || row.Original_Filename || row.Document_ID),
    mimeType: 'text/plain',
    text: String(text || ''),
    contentHash: String(contentHash || '')
  };
}

function kspAiWorkItemFromRow(sourceType, row) {
  return {
    sourceType: sourceType,
    sourceId: sourceType === KSP_AI_SOURCE_TYPES.MEETING ? String(row.Meeting_ID || '') : String(row.Document_ID || ''),
    row: row
  };
}

function kspIsAiWorkEligible(item, nowIso, settings) {
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
  var lastError = kspParseAiLastError(row.AI_Last_Error);
  if (lastError.permanent || !lastError.retryable || lastError.attempt >= settings.maxRetryAttempts) return false;
  return !lastError.nextAttemptAt || lastError.nextAttemptAt <= nowIso;
}

function kspSelectAiWorkItems(meetingRows, pitchbookRows, nowIso, settings) {
  var items = [];
  (meetingRows || []).forEach(function (row) {
    var item = kspAiWorkItemFromRow(KSP_AI_SOURCE_TYPES.MEETING, row);
    if (kspIsAiWorkEligible(item, nowIso, settings)) items.push(item);
  });
  (pitchbookRows || []).forEach(function (row) {
    var item = kspAiWorkItemFromRow(KSP_AI_SOURCE_TYPES.PITCHBOOK, row);
    if (kspIsAiWorkEligible(item, nowIso, settings)) items.push(item);
  });
  items.sort(function (left, right) {
    var leftInactive = String(left.row.Status) === KSP_STATUS.INACTIVE ? 0 : 1;
    var rightInactive = String(right.row.Status) === KSP_STATUS.INACTIVE ? 0 : 1;
    if (leftInactive !== rightInactive) return leftInactive - rightInactive;
    var leftTime = String(left.row.Updated_At || left.row.Created_At || '');
    var rightTime = String(right.row.Updated_At || right.row.Created_At || '');
    if (leftTime !== rightTime) return leftTime.localeCompare(rightTime);
    return kspAiSourceKey(left.sourceType, left.sourceId).localeCompare(kspAiSourceKey(right.sourceType, right.sourceId));
  });
  return items.slice(0, settings.syncBatchSize);
}

function kspBuildAiSource(environment, item, maps) {
  var row = item.row;
  var text;
  if (item.sourceType === KSP_AI_SOURCE_TYPES.MEETING) {
    text = environment.readMeetingText(String(row.Doc_File_ID || ''));
    return kspBuildMeetingAiSource(row, maps, text, environment.hashText(text));
  }
  var extension = kspGetPitchbookExtensionForAi(row);
  if (extension !== 'txt') {
    var unsupported = new Error('Work 0008 indexes Meeting text and TXT sources only.');
    unsupported.code = 'AI_FORMAT_DEFERRED_TO_WORK_0009';
    unsupported.retryable = false;
    unsupported.permanent = true;
    throw unsupported;
  }
  text = environment.readTextFile(String(row.File_ID || ''));
  return kspBuildPitchbookAiSource(row, maps, text, environment.hashText(text));
}
