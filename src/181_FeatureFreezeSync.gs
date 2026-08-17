function kspBuildFeatureFreezePitchbookSource_(row, maps, payload, contentHash, formatDefinition) {
  kspAssert_(row && row.Document_ID, 'AI_PITCHBOOK_ROW_INVALID', 'Pitchbook row is invalid.');
  kspAssert_(row.File_ID, 'AI_PITCHBOOK_FILE_MISSING', 'Pitchbook source file is missing.');
  var definition = formatDefinition || kspGetAiFormatDefinition_(kspGetPitchbookExtensionForAi_(row));
  var source = {
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
    mimeType: definition.uploadMimeType,
    contentHash: String(contentHash || ''),
    extension: definition.extension,
    readStrategy: definition.readStrategy
  };
  source.displayName = source.savedFilename;
  if (definition.readStrategy === KSP_AI_READ_STRATEGIES.EML_NORMALIZED_TEXT) {
    source.payloadKind = 'text';
    source.text = String(payload.text || '');
    source.bytes = null;
    source.byteLength = kspAiSourcePayloadBytes_(source).length;
    source.displayName = source.savedFilename.replace(/\.eml$/i, '') + '.txt';
  } else {
    source.payloadKind = 'binary';
    source.text = '';
    source.bytes = kspNormalizeAiByteArray_(payload.bytes || []);
    source.byteLength = source.bytes.length;
  }
  return source;
}

function kspFfIsAiWorkEligible_(item, nowIso, settings) {
  var row = item.row || {};
  var sourceStatus = String(row.Status || '');
  var aiStatus = String(row.AI_Index_Status || KSP_AI_INDEX_STATUS.NOT_INDEXED);
  if (sourceStatus === KSP_STATUS.INACTIVE) {
    return Boolean(row.AI_Document_Name) || aiStatus === KSP_AI_INDEX_STATUS.INDEXED || aiStatus === KSP_AI_INDEX_STATUS.FAILED;
  }
  if (sourceStatus !== KSP_STATUS.ACTIVE) return false;
  if (aiStatus === KSP_AI_INDEX_STATUS.PENDING || aiStatus === KSP_AI_INDEX_STATUS.NOT_INDEXED) return true;
  if (aiStatus === KSP_AI_INDEX_STATUS.INDEXED && !row.AI_Document_Name) return true;
  if (aiStatus !== KSP_AI_INDEX_STATUS.FAILED) return false;
  var lastError = kspParseAiLastError_(row.AI_Last_Error);
  if (lastError.permanent || !lastError.retryable || lastError.attempt >= settings.maxRetryAttempts) return false;
  return !lastError.nextAttemptAt || lastError.nextAttemptAt <= nowIso;
}

function kspFfSelectAiWorkItems_(meetingRows, pitchbookRows, nowIso, settings) {
  var items = [];
  (meetingRows || []).forEach(function (row) {
    var item = kspAiWorkItemFromRow_(KSP_AI_SOURCE_TYPES.MEETING, row);
    if (kspFfIsAiWorkEligible_(item, nowIso, settings)) items.push(item);
  });
  (pitchbookRows || []).forEach(function (row) {
    var item = kspAiWorkItemFromRow_(KSP_AI_SOURCE_TYPES.PITCHBOOK, row);
    if (kspFfIsAiWorkEligible_(item, nowIso, settings)) items.push(item);
  });
  items.sort(function (left, right) {
    var leftInactive = String(left.row.Status) === KSP_STATUS.INACTIVE ? 0 : 1;
    var rightInactive = String(right.row.Status) === KSP_STATUS.INACTIVE ? 0 : 1;
    if (leftInactive !== rightInactive) return leftInactive - rightInactive;
    var leftTime = String(left.row.Updated_At || left.row.Created_At || '');
    var rightTime = String(right.row.Updated_At || right.row.Created_At || '');
    if (leftTime !== rightTime) return leftTime.localeCompare(rightTime);
    return kspAiSourceKey_(left.sourceType, left.sourceId).localeCompare(kspAiSourceKey_(right.sourceType, right.sourceId));
  });
  return items.slice(0, settings.syncBatchSize);
}

function kspBuildFeatureFreezeAiSource_(environment, item, maps) {
  var row = item.row;
  if (item.sourceType === KSP_AI_SOURCE_TYPES.MEETING) {
    var meetingText = environment.readMeetingText(String(row.Doc_File_ID || ''));
    var meeting = kspBuildMeetingAiSource_(row, maps, meetingText, environment.hashText(meetingText));
    meeting.payloadKind = 'text';
    meeting.byteLength = kspAiSourcePayloadBytes_(meeting).length;
    return meeting;
  }
  var extension = kspGetPitchbookExtensionForAi_(row);
  var definition = kspGetAiFormatDefinition_(extension);
  var driveSource = environment.readPitchbookSource(String(row.File_ID || ''));
  kspValidateAiSourceDescriptor_(extension, driveSource.mimeType, driveSource.bytes.length);
  if (definition.readStrategy === KSP_AI_READ_STRATEGIES.EML_NORMALIZED_TEXT) {
    var rawEml = environment.decodeSourceText(driveSource.bytes, 'UTF-8');
    var normalizedEml = kspNormalizeEmlText_(rawEml);
    return kspBuildFeatureFreezePitchbookSource_(
      row, maps, { text: normalizedEml }, environment.hashText(normalizedEml), definition
    );
  }
  var bytes = kspNormalizeAiByteArray_(driveSource.bytes);
  return kspBuildFeatureFreezePitchbookSource_(
    row, maps, { bytes: bytes }, environment.hashBytes(bytes), definition
  );
}

function kspFfBuildSyncReport_(nowIso, settings) {
  return {
    workId: KSP_FEATURE_FREEZE_WORK_ID,
    startedAt: nowIso,
    finishedAt: null,
    ok: true,
    syncEnabled: settings.syncEnabled,
    selected: 0,
    indexed: 0,
    reused: 0,
    unchanged: 0,
    removed: 0,
    failed: 0,
    skippedClaims: 0,
    items: [],
    errors: []
  };
}

function kspFfApplyIndexedPatch_(environment, item, documentValue, contentHash, nowIso) {
  environment.updateAiRow(item.sourceType, item.sourceId, {
    AI_Document_Name: String(documentValue.name || ''),
    AI_Index_Status: KSP_AI_INDEX_STATUS.INDEXED,
    AI_Indexed_At: nowIso,
    AI_Content_Hash: contentHash,
    AI_Last_Error: ''
  });
}

function kspFfProcessInactive_(environment, storeName, item, report) {
  var row = item.row || {};
  var documents = environment.findFileSearchDocumentsBySource(storeName, item.sourceId);
  kspDeleteAiDocuments_(environment, storeName, item.sourceId, row.AI_Document_Name, documents);
  environment.updateAiRow(item.sourceType, item.sourceId, {
    AI_Document_Name: '', AI_Index_Status: KSP_AI_INDEX_STATUS.NOT_INDEXED,
    AI_Indexed_At: '', AI_Content_Hash: '', AI_Last_Error: ''
  });
  report.removed += 1;
  report.items.push({ sourceType: item.sourceType, sourceId: item.sourceId, action: 'removed' });
}

function kspFfProcessActive_(environment, storeName, item, maps, report, nowIso) {
  var row = item.row || {};
  var source = kspBuildFeatureFreezeAiSource_(environment, item, maps);
  var documents = environment.findFileSearchDocumentsBySource(storeName, item.sourceId);
  var matching = documents.filter(function (documentValue) {
    return kspAiDocumentMatchesSource_(documentValue, item.sourceId, source.contentHash);
  });
  if (String(row.AI_Content_Hash || '') === source.contentHash && row.AI_Document_Name) {
    var storedMatch = matching.filter(function (documentValue) {
      return String(documentValue.name || '') === String(row.AI_Document_Name);
    })[0];
    if (storedMatch) {
      kspDeleteAiDocuments_(environment, storeName, item.sourceId, '', documents.filter(function (documentValue) {
        return String(documentValue.name || '') !== String(storedMatch.name || '');
      }));
      kspFfApplyIndexedPatch_(environment, item, storedMatch, source.contentHash, nowIso);
      report.unchanged += 1;
      report.items.push({ sourceType: item.sourceType, sourceId: item.sourceId, action: 'unchanged', documentName: storedMatch.name });
      return;
    }
  }
  if (matching.length > 0) {
    var selected = matching[0];
    kspDeleteAiDocuments_(environment, storeName, item.sourceId, '', documents.filter(function (documentValue) {
      return documentValue.name !== selected.name;
    }));
    kspFfApplyIndexedPatch_(environment, item, selected, source.contentHash, nowIso);
    report.reused += 1;
    report.items.push({ sourceType: item.sourceType, sourceId: item.sourceId, action: 'reconciled', documentName: selected.name });
    return;
  }
  kspDeleteAiDocuments_(environment, storeName, item.sourceId, row.AI_Document_Name, documents);
  var uploaded = environment.uploadSourceToFileSearchStore(storeName, source);
  kspAssert_(uploaded && uploaded.name, 'AI_UPLOAD_DOCUMENT_MISSING', 'File Search upload did not return a Document.');
  kspFfApplyIndexedPatch_(environment, item, uploaded, source.contentHash, nowIso);
  report.indexed += 1;
  report.items.push({
    sourceType: item.sourceType, sourceId: item.sourceId, action: 'indexed',
    format: source.extension || 'meeting-text', documentName: uploaded.name
  });
}

function kspFfRecordFailure_(environment, item, error, settings, nowIso, report) {
  var previous = kspParseAiLastError_(item.row && item.row.AI_Last_Error);
  var attempt = previous.attempt + 1;
  var retryable = kspIsAiErrorRetryable_(error) && !error.permanent && attempt < settings.maxRetryAttempts;
  var permanent = Boolean(error.permanent) || !retryable;
  var nextAttemptAt = retryable ? kspCalculateAiRetryAt_(nowIso, attempt, settings) : '';
  var code = kspGetErrorCode_(error, 'AI_SYNC_FAILED');
  environment.updateAiRow(item.sourceType, item.sourceId, {
    AI_Document_Name: '', AI_Index_Status: KSP_AI_INDEX_STATUS.FAILED,
    AI_Indexed_At: '', AI_Content_Hash: '',
    AI_Last_Error: kspBuildAiLastError_({
      attempt: attempt, retryable: retryable, permanent: permanent,
      nextAttemptAt: nextAttemptAt, code: code,
      message: error && error.message ? error.message : String(error)
    })
  });
  report.failed += 1;
  report.items.push({ sourceType: item.sourceType, sourceId: item.sourceId, action: 'failed', code: code, retryable: retryable, nextAttemptAt: nextAttemptAt });
}

function kspRunFeatureFreezeAiSync_(environment) {
  var startedAt = environment.nowIso();
  var context = environment.loadAiContext();
  environment.ensureAiSettings(kspGetAiSettingSeedRows_(startedAt));
  context = environment.loadAiContext();
  var settings = kspNormalizeAiSettings_(context.settings);
  var report = kspFfBuildSyncReport_(startedAt, settings);
  if (!settings.syncEnabled) { report.finishedAt = environment.nowIso(); return report; }
  var store = environment.ensureFileSearchStore(settings, KSP_AI_DEFAULTS.STORE_DISPLAY_NAME);
  var items = kspFfSelectAiWorkItems_(context.meetingRows, context.pitchbookRows, startedAt, settings);
  report.selected = items.length;
  var maps = kspBuildAiMasterMaps_(context.gpRows, context.optionRows);
  items.forEach(function (item) {
    var claim = environment.claimAiSource(item.sourceType, item.sourceId, startedAt, KSP_AI_DEFAULTS.CLAIM_TTL_MILLIS);
    if (!claim) {
      report.skippedClaims += 1;
      report.items.push({ sourceType: item.sourceType, sourceId: item.sourceId, action: 'claimed-elsewhere' });
      return;
    }
    try {
      if (String(item.row.Status) === KSP_STATUS.INACTIVE) kspFfProcessInactive_(environment, store.name, item, report);
      else kspFfProcessActive_(environment, store.name, item, maps, report, environment.nowIso());
    } catch (error) {
      try { kspFfRecordFailure_(environment, item, error, settings, environment.nowIso(), report); }
      catch (recordError) {
        report.ok = false;
        report.errors.push({ sourceType: item.sourceType, sourceId: item.sourceId, code: kspGetErrorCode_(recordError), message: recordError.message || String(recordError) });
      }
    } finally {
      environment.releaseAiSourceClaim(item.sourceType, item.sourceId, claim.token);
    }
  });
  report.finishedAt = environment.nowIso();
  report.ok = report.errors.length === 0;
  return report;
}

function kspCreateFeatureFreezeAiEnvironment_() {
  var base = kspCreateAiEnvironment_();
  base.readPitchbookSource = function (fileId) {
    kspAssert_(fileId, 'AI_PITCHBOOK_FILE_MISSING', 'Pitchbook source fileがありません。');
    var file = Drive.Files.get(fileId, { supportsAllDrives: true, fields: 'id,name,mimeType,size,trashed' });
    kspAssert_(file && !file.trashed, 'AI_PITCHBOOK_FILE_MISSING', 'Pitchbook source fileが見つかりません。');
    if (Number(file.size || 0)) {
      kspAssert_(Number(file.size) <= KSP_FEATURE_FREEZE_DEFAULTS.MAX_SOURCE_BYTES,
        'AI_SOURCE_TOO_LARGE', 'AI source exceeds the 25MB product limit.');
    }
    var response = UrlFetchApp.fetch('https://www.googleapis.com/drive/v3/files/' + encodeURIComponent(fileId) + '?alt=media&supportsAllDrives=true', {
      method: 'get', headers: { Authorization: 'Bearer ' + ScriptApp.getOAuthToken() }, muteHttpExceptions: true
    });
    var code = response.getResponseCode();
    kspAssert_(code >= 200 && code < 300, 'AI_SOURCE_READ_FAILED', 'Pitchbook sourceを読み込めませんでした。');
    var bytes = kspNormalizeAiByteArray_(response.getBlob().getBytes());
    kspAssert_(bytes.length > 0, 'AI_SOURCE_SIZE_INVALID', 'Pitchbook source is empty.');
    kspAssert_(bytes.length <= KSP_FEATURE_FREEZE_DEFAULTS.MAX_SOURCE_BYTES,
      'AI_SOURCE_TOO_LARGE', 'AI source exceeds the 25MB product limit.');
    return { fileId: String(file.id || fileId), name: String(file.name || ''), mimeType: String(file.mimeType || 'application/octet-stream'), bytes: bytes };
  };
  base.decodeSourceText = function (bytes, charset) {
    return Utilities.newBlob(kspNormalizeAiByteArray_(bytes)).getDataAsString(charset || 'UTF-8');
  };
  base.hashBytes = function (bytes) {
    var signedBytes = kspNormalizeAiByteArray_(bytes).map(function (value) { return value > 127 ? value - 256 : value; });
    var digest = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, signedBytes);
    return digest.map(function (value) { return ('0' + ((Number(value) + 256) % 256).toString(16)).slice(-2); }).join('');
  };
  base.uploadSourceToFileSearchStore = function (storeName, source) {
    return kspUploadFeatureFreezeSourceLive_(storeName, source);
  };
  return base;
}

function kspFfSignedBytes_(bytes) {
  return kspNormalizeAiByteArray_(bytes).map(function (value) { return value > 127 ? value - 256 : value; });
}

function kspFfThrowHttpError_(code, parsed, fallbackMessage) {
  var message = parsed && parsed.error && parsed.error.message ? parsed.error.message : (fallbackMessage || ('Gemini API HTTP ' + code));
  var error = new Error(message);
  error.code = 'AI_HTTP_' + code;
  error.httpStatus = code;
  error.retryable = Boolean(KSP_AI_RETRYABLE_HTTP_CODES[code]);
  throw error;
}

function kspUploadFeatureFreezeSourceLive_(storeName, source) {
  var normalizedStore = kspAiStoreResourcePath_(storeName);
  var bytes = kspAiSourcePayloadBytes_(source);
  kspAssert_(bytes.length > 0, 'AI_SOURCE_SIZE_INVALID', 'AI source payload is empty.');
  kspAssert_(bytes.length <= KSP_FEATURE_FREEZE_DEFAULTS.MAX_SOURCE_BYTES, 'AI_SOURCE_TOO_LARGE', 'AI source exceeds the 25MB product limit.');
  var metadata = kspBuildFileSearchUploadMetadata_(source);
  var startResponse = UrlFetchApp.fetch(KSP_AI_API.UPLOAD_BASE_URL + '/' + normalizedStore + ':uploadToFileSearchStore', {
    method: 'post', contentType: 'application/json',
    headers: {
      'x-goog-api-key': kspGeminiApiKeyLive_(),
      'X-Goog-Upload-Protocol': 'resumable',
      'X-Goog-Upload-Command': 'start',
      'X-Goog-Upload-Header-Content-Length': String(bytes.length),
      'X-Goog-Upload-Header-Content-Type': metadata.mimeType
    },
    payload: JSON.stringify(metadata), muteHttpExceptions: true
  });
  var startCode = startResponse.getResponseCode();
  if (startCode < 200 || startCode >= 300) {
    var startText = startResponse.getContentText('UTF-8');
    kspFfThrowHttpError_(startCode, startText ? kspSafeParseJson_(startText, 'File Search upload session response') : {}, 'File Search upload sessionを開始できませんでした。');
  }
  var headers = startResponse.getAllHeaders();
  var uploadUrl = headers.Location || headers.location || headers['X-Goog-Upload-URL'] || headers['x-goog-upload-url'];
  kspAssert_(uploadUrl, 'AI_UPLOAD_URL_MISSING', 'File Search upload URLが返されませんでした。');
  var uploadResponse = UrlFetchApp.fetch(String(uploadUrl), {
    method: 'post', contentType: metadata.mimeType,
    headers: {
      'x-goog-api-key': kspGeminiApiKeyLive_(),
      'Content-Length': String(bytes.length),
      'X-Goog-Upload-Offset': '0',
      'X-Goog-Upload-Command': 'upload, finalize'
    },
    payload: kspFfSignedBytes_(bytes), muteHttpExceptions: true
  });
  var code = uploadResponse.getResponseCode();
  var responseText = uploadResponse.getContentText('UTF-8');
  var parsed = responseText ? kspSafeParseJson_(responseText, 'File Search upload response') : {};
  if (code < 200 || code >= 300) kspFfThrowHttpError_(code, parsed, 'File Search upload failed.');
  var operation = kspPollFileSearchOperationLive_(kspNormalizeFileSearchOperation_(parsed));
  kspAssert_(!operation.error, 'AI_UPLOAD_OPERATION_FAILED', operation.error ? operation.error.message : 'Upload operation failed.');
  return kspExtractDocumentFromOperation_(operation);
}
