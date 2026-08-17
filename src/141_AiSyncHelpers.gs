function kspBuildAiSyncReport_(nowIso, settings) {
  return {
    workId: KSP_AI_WORK_ID,
    startedAt: nowIso,
    finishedAt: null,
    ok: true,
    syncEnabled: settings.syncEnabled,
    selected: 0,
    indexed: 0,
    reused: 0,
    unchanged: 0,
    removed: 0,
    deferred: 0,
    failed: 0,
    skippedClaims: 0,
    items: [],
    errors: []
  };
}

function kspAiDocumentMatchesSource_(documentValue, sourceId, contentHash) {
  var metadata = documentValue && documentValue.customMetadata ? documentValue.customMetadata : {};
  return String(metadata.source_id || '') === String(sourceId) &&
    String(metadata.content_hash || '') === String(contentHash);
}

function kspDeleteAiDocuments_(environment, storeName, sourceId, storedDocumentName, documents) {
  var names = {};
  if (storedDocumentName) names[String(storedDocumentName)] = true;
  (documents || []).forEach(function (documentValue) {
    if (documentValue && documentValue.name) names[String(documentValue.name)] = true;
  });
  Object.keys(names).forEach(function (name) {
    environment.deleteFileSearchDocument(storeName, name);
  });
}

function kspApplyAiIndexedPatch_(environment, item, documentValue, contentHash, nowIso) {
  environment.updateAiRow(item.sourceType, item.sourceId, {
    AI_Document_Name: String(documentValue.name || ''),
    AI_Index_Status: KSP_AI_INDEX_STATUS.INDEXED,
    AI_Indexed_At: nowIso,
    AI_Content_Hash: contentHash,
    AI_Last_Error: ''
  });
}

function kspProcessInactiveAiItem_(environment, storeName, item, report) {
  var row = item.row || {};
  var documents = environment.findFileSearchDocumentsBySource(storeName, item.sourceId);
  kspDeleteAiDocuments_(environment, storeName, item.sourceId, row.AI_Document_Name, documents);
  environment.updateAiRow(item.sourceType, item.sourceId, {
    AI_Document_Name: '',
    AI_Index_Status: KSP_AI_INDEX_STATUS.NOT_INDEXED,
    AI_Indexed_At: '',
    AI_Content_Hash: '',
    AI_Last_Error: ''
  });
  report.removed += 1;
  report.items.push({ sourceType: item.sourceType, sourceId: item.sourceId, action: 'removed' });
}

function kspProcessActiveAiItem_(environment, storeName, item, maps, report, nowIso) {
  var row = item.row || {};
  if (item.sourceType === KSP_AI_SOURCE_TYPES.PITCHBOOK && kspGetPitchbookExtensionForAi_(row) !== 'txt') {
    var deferredDocuments = environment.findFileSearchDocumentsBySource(storeName, item.sourceId);
    kspDeleteAiDocuments_(environment, storeName, item.sourceId, row.AI_Document_Name, deferredDocuments);
    environment.updateAiRow(item.sourceType, item.sourceId, {
      AI_Document_Name: '',
      AI_Index_Status: KSP_AI_INDEX_STATUS.NOT_INDEXED,
      AI_Indexed_At: '',
      AI_Content_Hash: '',
      AI_Last_Error: kspBuildAiLastError_({
        attempt: 1,
        retryable: false,
        permanent: true,
        code: 'AI_FORMAT_DEFERRED_TO_WORK_0009',
        message: 'Work 0008 indexes Meeting text and TXT sources only.'
      })
    });
    report.deferred += 1;
    report.items.push({ sourceType: item.sourceType, sourceId: item.sourceId, action: 'deferred', code: 'AI_FORMAT_DEFERRED_TO_WORK_0009' });
    return;
  }
  var source = kspBuildAiSource_(environment, item, maps);
  if (String(row.AI_Content_Hash || '') === source.contentHash && row.AI_Document_Name) {
    report.unchanged += 1;
    report.items.push({ sourceType: item.sourceType, sourceId: item.sourceId, action: 'unchanged' });
    return;
  }

  var documents = environment.findFileSearchDocumentsBySource(storeName, item.sourceId);
  var matching = documents.filter(function (documentValue) {
    return kspAiDocumentMatchesSource_(documentValue, item.sourceId, source.contentHash);
  });
  if (matching.length > 0) {
    var selected = matching[0];
    var extras = documents.filter(function (documentValue) { return documentValue.name !== selected.name; });
    kspDeleteAiDocuments_(environment, storeName, item.sourceId, '', extras);
    kspApplyAiIndexedPatch_(environment, item, selected, source.contentHash, nowIso);
    report.reused += 1;
    report.items.push({ sourceType: item.sourceType, sourceId: item.sourceId, action: 'reconciled', documentName: selected.name });
    return;
  }

  kspDeleteAiDocuments_(environment, storeName, item.sourceId, row.AI_Document_Name, documents);
  var uploaded = environment.uploadSourceToFileSearchStore(storeName, source);
  kspAssert_(uploaded && uploaded.name, 'AI_UPLOAD_DOCUMENT_MISSING', 'File Search upload did not return a Document.');
  kspApplyAiIndexedPatch_(environment, item, uploaded, source.contentHash, nowIso);
  report.indexed += 1;
  report.items.push({ sourceType: item.sourceType, sourceId: item.sourceId, action: 'indexed', documentName: uploaded.name });
}

function kspRecordAiFailure_(environment, item, error, settings, nowIso, report) {
  var previous = kspParseAiLastError_(item.row && item.row.AI_Last_Error);
  var attempt = previous.attempt + 1;
  var retryable = kspIsAiErrorRetryable_(error) && !error.permanent && attempt < settings.maxRetryAttempts;
  var permanent = Boolean(error.permanent) || !retryable;
  var nextAttemptAt = retryable ? kspCalculateAiRetryAt_(nowIso, attempt, settings) : '';
  var code = kspGetErrorCode_(error, 'AI_SYNC_FAILED');
  var patch = {
    AI_Document_Name: '',
    AI_Index_Status: KSP_AI_INDEX_STATUS.FAILED,
    AI_Indexed_At: '',
    AI_Content_Hash: '',
    AI_Last_Error: kspBuildAiLastError_({
      attempt: attempt,
      retryable: retryable,
      permanent: permanent,
      nextAttemptAt: nextAttemptAt,
      code: code,
      message: error && error.message ? error.message : String(error)
    })
  };
  report.failed += 1;
  environment.updateAiRow(item.sourceType, item.sourceId, patch);
  report.items.push({
    sourceType: item.sourceType,
    sourceId: item.sourceId,
    action: 'failed',
    code: code,
    retryable: retryable,
    nextAttemptAt: nextAttemptAt
  });
}
