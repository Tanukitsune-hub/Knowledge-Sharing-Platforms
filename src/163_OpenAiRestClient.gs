var KSP_OPENAI_API = Object.freeze({
  BASE_URL: 'https://api.openai.com/v1',
  RESPONSES_PATH: '/responses',
  FILES_PATH: '/files',
  VECTOR_STORES_PATH: '/vector_stores'
});

var KSP_OPENAI_FILE_STATUS = Object.freeze({
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  FAILED: 'failed',
  CANCELLED: 'cancelled'
});

function kspOpenAiApiKeyLive_() {
  kspAssert_(typeof PropertiesService !== 'undefined' && PropertiesService.getScriptProperties,
    'OPENAI_CREDENTIALS_UNAVAILABLE', 'ChatGPTの設定を確認できません。');
  var key = PropertiesService.getScriptProperties().getProperty(KSP_AI_PROPERTY_KEYS.OPENAI_API_KEY);
  kspAssert_(key, 'OPENAI_CREDENTIALS_UNAVAILABLE', 'ChatGPTの設定を確認できません。');
  return String(key);
}

function kspOpenAiError_(code, message, httpStatus, retryable) {
  var error = new Error(message || 'OpenAI request failed.');
  error.code = code;
  error.provider = KSP_AI_PROVIDERS.OPENAI;
  if (httpStatus !== undefined) error.httpStatus = Number(httpStatus);
  if (retryable !== undefined) error.retryable = Boolean(retryable);
  return error;
}

function kspOpenAiResponseText_(response) {
  try {
    return response && response.getContentText ? String(response.getContentText('UTF-8') || '') : '';
  } catch (ignored) {
    return '';
  }
}

function kspOpenAiJsonRequestLive_(method, path, payload) {
  var normalizedPath = String(path || '');
  kspAssert_(normalizedPath.charAt(0) === '/', 'OPENAI_PATH_INVALID', 'OpenAI request path is invalid.');
  var options = {
    method: String(method || 'get').toLowerCase(),
    headers: {
      Authorization: 'Bearer ' + kspOpenAiApiKeyLive_(),
      Accept: 'application/json',
      'OpenAI-Beta': 'assistants=v2'
    },
    muteHttpExceptions: true
  };
  if (payload !== undefined && payload !== null) {
    options.contentType = 'application/json';
    options.payload = JSON.stringify(payload);
  }
  var response = UrlFetchApp.fetch(KSP_OPENAI_API.BASE_URL + normalizedPath, options);
  var status = Number(response.getResponseCode());
  var text = kspOpenAiResponseText_(response);
  var parsed = {};
  if (text) {
    try { parsed = JSON.parse(text); } catch (ignored) { parsed = {}; }
  }
  if (status < 200 || status >= 300) {
    var retryable = Boolean(KSP_AI_RETRYABLE_HTTP_CODES[status]);
    throw kspOpenAiError_('OPENAI_HTTP_' + status,
      retryable ? 'ChatGPT検索サービスが一時的に利用できません。' : 'ChatGPT検索サービスを利用できません。',
      status, retryable);
  }
  return parsed;
}

function kspBuildOpenAiUploadPayload_(source) {
  var value = source || {};
  var bytes = kspAiSourcePayloadBytes_(value);
  kspAssert_(bytes.length > 0, 'OPENAI_SOURCE_EMPTY', 'OpenAI source payload is empty.');
  kspAssert_(bytes.length <= KSP_FEATURE_FREEZE_DEFAULTS.MAX_SOURCE_BYTES,
    'AI_SOURCE_TOO_LARGE', 'AI source exceeds the 25MB product limit.');
  kspAssert_(typeof Utilities !== 'undefined' && Utilities.newBlob,
    'OPENAI_BLOB_UNAVAILABLE', 'OpenAI source upload is unavailable.');
  return {
    purpose: 'assistants',
    file: Utilities.newBlob(
      kspNormalizeAiByteArray_(bytes),
      value.mimeType || 'application/octet-stream',
      value.displayName || value.savedFilename || value.sourceId + '.bin'
    )
  };
}

function kspOpenAiUploadSourceLive_(vectorStoreId, source) {
  var storeId = kspAiTrim_(vectorStoreId);
  kspAssert_(storeId, 'OPENAI_VECTOR_STORE_NOT_CONFIGURED', 'ChatGPT Vector Storeが設定されていません。');
  var uploadResponse = UrlFetchApp.fetch(KSP_OPENAI_API.BASE_URL + KSP_OPENAI_API.FILES_PATH, {
    method: 'post',
    headers: {
      Authorization: 'Bearer ' + kspOpenAiApiKeyLive_(),
      Accept: 'application/json',
      'OpenAI-Beta': 'assistants=v2'
    },
    payload: kspBuildOpenAiUploadPayload_(source),
    muteHttpExceptions: true
  });
  var uploadStatus = Number(uploadResponse.getResponseCode());
  var uploadText = kspOpenAiResponseText_(uploadResponse);
  var uploaded = {};
  if (uploadText) {
    try { uploaded = JSON.parse(uploadText); } catch (ignored) { uploaded = {}; }
  }
  if (uploadStatus < 200 || uploadStatus >= 300 || !uploaded.id) {
    throw kspOpenAiError_('OPENAI_UPLOAD_FAILED', 'ChatGPT source upload failed.', uploadStatus,
      Boolean(KSP_AI_RETRYABLE_HTTP_CODES[uploadStatus]));
  }

  var attributes = kspBuildOpenAiAttributes_(source);
  try {
    var attached = kspOpenAiJsonRequestLive_('POST',
      KSP_OPENAI_API.VECTOR_STORES_PATH + '/' + encodeURIComponent(storeId) + '/files',
      { file_id: String(uploaded.id), attributes: attributes });
    var vectorStoreFile = kspOpenAiWaitVectorStoreFileLive_(storeId, String(uploaded.id), attached);
    return {
      name: 'openai:' + storeId + '/files/' + String(uploaded.id),
      providerDocumentId: String(uploaded.id),
      fileId: String(uploaded.id),
      vectorStoreId: storeId,
      status: kspAiTrim_(vectorStoreFile.status || attached.status || KSP_OPENAI_FILE_STATUS.COMPLETED),
      attributes: attributes,
      customMetadata: attributes
    };
  } catch (primaryError) {
    var cleanup = kspOpenAiCleanupDocumentResourcesLive_(storeId, String(uploaded.id));
    kspOpenAiAddCleanupDiagnostics_(primaryError, cleanup.diagnostics);
    throw primaryError;
  }
}

function kspOpenAiCreateVectorStoreLive_(displayName) {
  var name = kspAiTrim_(displayName);
  kspAssert_(name, 'OPENAI_VECTOR_STORE_NAME_INVALID', 'ChatGPT Vector Store名が不正です。');
  var store = kspOpenAiJsonRequestLive_('POST', KSP_OPENAI_API.VECTOR_STORES_PATH, { name: name });
  kspAssert_(store && kspAiTrim_(store.id), 'OPENAI_VECTOR_STORE_INVALID', 'ChatGPT Vector Storeを作成できませんでした。');
  return store;
}

function kspOpenAiGetVectorStoreLive_(vectorStoreId) {
  var storeId = kspAiTrim_(vectorStoreId);
  kspAssert_(storeId, 'OPENAI_VECTOR_STORE_NOT_CONFIGURED', 'ChatGPT Vector Storeが設定されていません。');
  var store = kspOpenAiJsonRequestLive_('GET',
    KSP_OPENAI_API.VECTOR_STORES_PATH + '/' + encodeURIComponent(storeId));
  kspAssert_(store && String(store.id || store.name || '') === storeId,
    'OPENAI_VECTOR_STORE_INVALID', 'ChatGPT Vector Storeを確認できません。');
  return store;
}

function kspOpenAiDeleteUploadedFileLive_(fileId) {
  var normalized = kspAiTrim_(fileId);
  kspAssert_(normalized, 'OPENAI_DOCUMENT_INVALID', 'ChatGPT document identity is invalid.');
  kspOpenAiJsonRequestLive_('DELETE', KSP_OPENAI_API.FILES_PATH + '/' + encodeURIComponent(normalized));
  return true;
}

function kspOpenAiAddCleanupDiagnostics_(error, diagnostics) {
  if (!error || typeof error !== 'object') return error;
  var safeCodes = [];
  (Array.isArray(error.cleanupDiagnostics) ? error.cleanupDiagnostics : []).concat(diagnostics || [])
    .forEach(function (code) {
      var normalized = kspAiTrim_(code);
      if (normalized && safeCodes.indexOf(normalized) < 0) safeCodes.push(normalized);
    });
  error.cleanupDiagnostics = safeCodes;
  return error;
}

function kspOpenAiCleanupDocumentResourcesLive_(vectorStoreId, fileId) {
  var storeId = kspAiTrim_(vectorStoreId);
  var normalizedFileId = kspAiTrim_(fileId);
  var firstError = null;
  var diagnostics = [];
  try {
    kspOpenAiJsonRequestLive_('DELETE',
      KSP_OPENAI_API.VECTOR_STORES_PATH + '/' + encodeURIComponent(storeId) + '/files/' + encodeURIComponent(normalizedFileId));
  } catch (attachmentError) {
    firstError = attachmentError;
    diagnostics.push('OPENAI_ATTACHMENT_CLEANUP_FAILED');
  }
  try {
    // File cleanup is independent from attachment cleanup and must always be
    // attempted after a successful /files upload.
    kspOpenAiDeleteUploadedFileLive_(normalizedFileId);
  } catch (fileError) {
    if (!firstError) firstError = fileError;
    diagnostics.push('OPENAI_FILE_CLEANUP_FAILED');
  }
  return { error: firstError, diagnostics: diagnostics };
}

function kspOpenAiGetVectorStoreFileLive_(vectorStoreId, fileId) {
  return kspOpenAiJsonRequestLive_('GET',
    KSP_OPENAI_API.VECTOR_STORES_PATH + '/' + encodeURIComponent(vectorStoreId) + '/files/' + encodeURIComponent(fileId));
}

function kspOpenAiProviderDocumentFromVectorStoreFile_(vectorStoreId, entry) {
  var value = entry || {};
  var attributes = value.attributes || value.metadata || {};
  return {
    name: 'openai:' + String(vectorStoreId) + '/files/' + String(value.id || ''),
    providerDocumentId: String(value.id || ''),
    fileId: String(value.id || ''),
    vectorStoreId: String(vectorStoreId),
    status: String(value.status || ''),
    attributes: kspDeepClone_(attributes),
    customMetadata: kspDeepClone_(attributes)
  };
}

function kspOpenAiUpdateVectorStoreFileAttributesLive_(vectorStoreId, documentValue, attributes) {
  var storeId = kspAiTrim_(vectorStoreId);
  var fileId = kspAiTrim_(documentValue && (documentValue.providerDocumentId || documentValue.fileId));
  kspAssert_(storeId && fileId, 'OPENAI_DOCUMENT_INVALID', 'ChatGPT document identity is invalid.');
  kspOpenAiJsonRequestLive_('POST',
    KSP_OPENAI_API.VECTOR_STORES_PATH + '/' + encodeURIComponent(storeId) + '/files/' + encodeURIComponent(fileId),
    { attributes: kspDeepClone_(attributes || {}) });
  var current = kspOpenAiGetVectorStoreFileLive_(storeId, fileId);
  kspAssert_(String(current && current.id || '') === fileId,
    'OPENAI_ATTRIBUTE_REFRESH_IDENTITY_MISMATCH', 'ChatGPT source attribute refresh returned a different document.');
  return kspOpenAiProviderDocumentFromVectorStoreFile_(storeId, current);
}

function kspOpenAiWaitVectorStoreFileLive_(vectorStoreId, fileId, initial) {
  var current = initial || {};
  var status = kspAiTrim_(current.status);
  for (var attempt = 0; attempt < KSP_AI_DEFAULTS.MAX_OPERATION_POLLS; attempt += 1) {
    if (status === KSP_OPENAI_FILE_STATUS.COMPLETED) return current;
    if (status === KSP_OPENAI_FILE_STATUS.FAILED || status === KSP_OPENAI_FILE_STATUS.CANCELLED) {
      throw kspOpenAiError_('OPENAI_INDEX_FAILED', 'ChatGPT source indexing failed.', 422, false);
    }
    if (attempt > 0 && typeof Utilities !== 'undefined' && Utilities.sleep) {
      Utilities.sleep(KSP_AI_DEFAULTS.OPERATION_POLL_MILLIS);
    }
    current = kspOpenAiGetVectorStoreFileLive_(vectorStoreId, fileId);
    status = kspAiTrim_(current.status);
  }
  throw kspOpenAiError_('OPENAI_INDEX_TIMEOUT', 'ChatGPT source indexing timed out.', 408, true);
}

function kspOpenAiListVectorStoreFilesLive_(vectorStoreId) {
  var storeId = kspAiTrim_(vectorStoreId);
  kspAssert_(storeId, 'OPENAI_VECTOR_STORE_NOT_CONFIGURED', 'ChatGPT Vector Storeが設定されていません。');
  var all = [];
  var cursor = '';
  for (var page = 0; page < 20; page += 1) {
    var path = KSP_OPENAI_API.VECTOR_STORES_PATH + '/' + encodeURIComponent(storeId) + '/files?limit=100';
    if (cursor) path += '&after=' + encodeURIComponent(cursor);
    var response = kspOpenAiJsonRequestLive_('GET', path);
    var data = Array.isArray(response.data) ? response.data : [];
    all = all.concat(data);
    if (!response.has_more || !data.length) break;
    cursor = String(data[data.length - 1].id || '');
    if (!cursor) break;
  }
  return all;
}

function kspOpenAiFindDocumentsBySourceLive_(vectorStoreId, sourceType, sourceId) {
  var expectedType = String(sourceType || '');
  var expectedId = String(sourceId || '');
  return kspOpenAiListVectorStoreFilesLive_(vectorStoreId).filter(function (entry) {
    var attributes = entry.attributes || entry.metadata || {};
    return String(attributes.source_type || '') === expectedType &&
      String(attributes.source_id || '') === expectedId;
  }).map(function (entry) { return kspOpenAiProviderDocumentFromVectorStoreFile_(vectorStoreId, entry); });
}

function kspOpenAiDeleteDocumentLive_(vectorStoreId, documentValue) {
  var storeId = kspAiTrim_(vectorStoreId);
  var fileId = kspAiTrim_(documentValue && (documentValue.providerDocumentId || documentValue.fileId));
  kspAssert_(storeId && fileId, 'OPENAI_DOCUMENT_INVALID', 'ChatGPT document identity is invalid.');
  var cleanup = kspOpenAiCleanupDocumentResourcesLive_(storeId, fileId);
  if (cleanup.error) {
    kspOpenAiAddCleanupDiagnostics_(cleanup.error, cleanup.diagnostics);
    throw cleanup.error;
  }
  return true;
}

function kspOpenAiQueryFileSearchLive_(request) {
  var value = request || {};
  kspAssert_(value.model, 'OPENAI_MODEL_NOT_CONFIGURED', 'ChatGPT modelが設定されていません。');
  kspAssert_(value.vectorStoreId, 'OPENAI_VECTOR_STORE_NOT_CONFIGURED', 'ChatGPT Vector Storeが設定されていません。');
  kspAssert_(value.input, 'AI_QUESTION_REQUIRED', '質問を入力してください。');
  var payload = {
    model: String(value.model),
    input: String(value.input),
    store: false,
    include: ['file_search_call.results'],
    tools: [{
      type: 'file_search',
      vector_store_ids: [String(value.vectorStoreId)],
      filters: value.filters || undefined
    }]
  };
  if (value.thinkingProviderDefault !== true && value.thinkingRawValue) {
    payload.reasoning = { effort: String(value.thinkingRawValue) };
  }
  if (value.maxOutputTokens !== null && value.maxOutputTokens !== undefined) {
    payload.max_output_tokens = Number(value.maxOutputTokens);
  }
  return kspOpenAiJsonRequestLive_('POST', KSP_OPENAI_API.RESPONSES_PATH, payload);
}
