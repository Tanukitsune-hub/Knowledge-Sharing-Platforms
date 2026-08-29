function kspGeminiApiKeyLive_() {
  var apiKey = PropertiesService.getScriptProperties().getProperty(KSP_AI_PROPERTY_KEYS.API_KEY);
  kspAssert_(apiKey, 'AI_CREDENTIAL_NOT_CONFIGURED', 'Gemini API credentialが設定されていません。');
  return apiKey;
}

function kspGeminiStageMessage_(code) {
  var messages = {
    AI_STORE_CREATE_FAILED: 'Gemini File Search Storeを作成できませんでした。',
    AI_STORE_READ_FAILED: 'Gemini File Search Storeを確認できませんでした。',
    AI_UPLOAD_SESSION_FAILED: 'Gemini File Search upload sessionを開始できませんでした。',
    AI_UPLOAD_FINALIZE_REQUEST_INVALID: 'Gemini File Search upload requestを構成できませんでした。',
    AI_UPLOAD_FINALIZE_CLIENT_FAILED: 'Gemini File Search upload通信を開始できませんでした。',
    AI_UPLOAD_FINALIZE_CLIENT_UNSUPPORTED: 'Gemini File Search upload形式を利用できませんでした。',
    AI_UPLOAD_FINALIZE_FAILED: 'Gemini File Search uploadを完了できませんでした。',
    AI_OPERATION_POLL_FAILED: 'Gemini File Search upload operationを確認できませんでした。',
    AI_OPERATION_TIMEOUT: 'Gemini File Search upload operationが完了しませんでした。',
    AI_UPLOAD_OPERATION_FAILED: 'Gemini File Search upload operationに失敗しました。',
    AI_DOCUMENT_READBACK_FAILED: 'Gemini File Search Documentを確認できませんでした。',
    AI_DOCUMENT_DELETE_FAILED: 'Gemini File Search Documentを削除できませんでした。',
    AI_SOURCE_READ_FAILED: 'Gemini検索対象のソースを読み取れませんでした。',
    AI_QUERY_HTTP_FAILED: 'Gemini検索サービスを利用できません。',
    AI_QUERY_RESPONSE_INVALID: 'Gemini検索結果を確認できませんでした。',
    AI_QUERY_PROVIDER_TERMINAL: 'Gemini検索が完了できない状態になりました。',
    AI_QUERY_ASYNC_REQUIRED: 'Gemini検索は後続の確認が必要です。'
  };
  return messages[String(code || '')] || 'Gemini処理を完了できませんでした。';
}

function kspGeminiHeaderValue_(headers, name) {
  var target = String(name || '').toLowerCase();
  var source = headers || {};
  var keys = Object.keys(source);
  for (var index = 0; index < keys.length; index += 1) {
    if (String(keys[index]).toLowerCase() !== target) continue;
    var value = source[keys[index]];
    if (Array.isArray(value)) value = value.length ? value[0] : '';
    return value === null || value === undefined ? '' : String(value).trim();
  }
  return '';
}

function kspGeminiResponseHeaders_(response) {
  try {
    return response && typeof response.getAllHeaders === 'function' ? response.getAllHeaders() || {} : {};
  } catch (ignored) {
    return {};
  }
}

function kspGeminiRetryAfterMillis_(headers) {
  var value = kspGeminiHeaderValue_(headers, 'Retry-After');
  if (!value) return null;
  if (/^\d+(?:\.\d+)?$/.test(value)) {
    return Math.min(KSP_AI_DEFAULTS.TRANSPORT_RETRY_MAX_MILLIS, Number(value) * 1000);
  }
  var timestamp = Date.parse(value);
  if (!Number.isFinite(timestamp)) return null;
  return Math.min(
    KSP_AI_DEFAULTS.TRANSPORT_RETRY_MAX_MILLIS,
    Math.max(0, timestamp - new Date().getTime())
  );
}

function kspGeminiStageError_(code, stage, httpStatus, headers, retryableOverride) {
  var status = Number(httpStatus || 0) || 0;
  var retryable = retryableOverride === undefined
    ? (status ? Boolean(KSP_AI_RETRYABLE_HTTP_CODES[status]) : true)
    : Boolean(retryableOverride);
  var error = new Error(kspGeminiStageMessage_(code));
  error.code = String(code || 'AI_GEMINI_TRANSPORT_FAILED');
  error.stage = String(stage || 'GEMINI_TRANSPORT');
  error.httpStatus = status;
  error.retryable = retryable;
  error.permanent = !retryable;
  var retryAfter = kspGeminiRetryAfterMillis_(headers);
  if (retryAfter !== null) error.retryAfterMillis = retryAfter;
  return error;
}

function kspGeminiAppendApiKey_(url, apiKey) {
  var separator = String(url).indexOf('?') >= 0 ? '&' : '?';
  return String(url) + separator + 'key=' + encodeURIComponent(String(apiKey || ''));
}

function kspGeminiRetryDelayMillis_(attempt, retryAfterMillis) {
  if (retryAfterMillis !== undefined && retryAfterMillis !== null) {
    return Math.min(KSP_AI_DEFAULTS.TRANSPORT_RETRY_MAX_MILLIS, Math.max(0, Number(retryAfterMillis) || 0));
  }
  var exponent = Math.max(0, Number(attempt || 1) - 1);
  var base = Math.min(
    KSP_AI_DEFAULTS.TRANSPORT_RETRY_MAX_MILLIS,
    KSP_AI_DEFAULTS.TRANSPORT_RETRY_BASE_MILLIS * Math.pow(2, exponent)
  );
  var jitter = Math.floor(base * 0.25 * Math.random());
  return Math.min(KSP_AI_DEFAULTS.TRANSPORT_RETRY_MAX_MILLIS, base + jitter);
}

function kspGeminiRunWithRetry_(operation, options) {
  var settings = options || {};
  var maxAttempts = settings.retry
    ? KSP_AI_DEFAULTS.MAX_TRANSPORT_ATTEMPTS
    : 1;
  var attempt = 0;
  while (attempt < maxAttempts) {
    attempt += 1;
    try {
      return operation(attempt);
    } catch (rawError) {
      var error = rawError && rawError.code
        ? rawError
        : kspGeminiStageError_(settings.errorCode, settings.stage, 0, {}, true);
      error.attempt = attempt;
      if (!settings.retry || !error.retryable || attempt >= maxAttempts) throw error;
      var delay = kspGeminiRetryDelayMillis_(attempt, error.retryAfterMillis);
      if (delay > 0 && typeof Utilities !== 'undefined' && typeof Utilities.sleep === 'function') {
        Utilities.sleep(delay);
      }
    }
  }
  throw kspGeminiStageError_(settings.errorCode, settings.stage, 0, {}, false);
}

function kspGeminiJsonRequestLive_(method, path, payload, options) {
  var settings = options || {};
  var url = /^https?:\/\//.test(String(path || '')) ? String(path) : KSP_AI_API.BASE_URL + String(path || '');
  var stage = settings.stage || 'GEMINI_HTTP';
  var errorCode = settings.errorCode || 'AI_HTTP_REQUEST_FAILED';
  return kspGeminiRunWithRetry_(function () {
    var requestOptions = {
      method: String(method || 'GET').toLowerCase(),
      headers: (function () {
        var headers = { 'x-goog-api-key': kspGeminiApiKeyLive_() };
        Object.keys(settings.headers || {}).forEach(function (key) {
          headers[key] = settings.headers[key];
        });
        return headers;
      }()),
      muteHttpExceptions: true
    };
    if (payload !== null && payload !== undefined) {
      requestOptions.contentType = 'application/json';
      requestOptions.payload = JSON.stringify(payload);
    }
    var response;
    try {
      response = UrlFetchApp.fetch(url, requestOptions);
    } catch (ignoredFetchError) {
      throw kspGeminiStageError_(errorCode, stage, 0, {}, true);
    }
    var code = response.getResponseCode();
    var headers = kspGeminiResponseHeaders_(response);
    if (code < 200 || code >= 300) {
      throw kspGeminiStageError_(errorCode, stage, code, headers);
    }
    try {
      var responseText = response.getContentText('UTF-8');
      var parsedResponse = responseText ? kspSafeParseJson_(responseText, 'Gemini response') : {};
      if (settings.includeResponseMetadata && parsedResponse && typeof parsedResponse === 'object') {
        try {
          Object.defineProperty(parsedResponse, '__kspHttpStatus', {
            value: code, enumerable: false, configurable: false, writable: false
          });
        } catch (ignoredMetadataError) { /* Safe telemetry is best-effort. */ }
      }
      return parsedResponse;
    } catch (ignoredParseError) {
      throw kspGeminiStageError_(settings.parseErrorCode || errorCode, stage, code, headers, false);
    }
  }, { retry: Boolean(settings.retry), stage: stage, errorCode: errorCode });
}

function kspGeminiInteractionId_(response) {
  var value = response || {};
  return kspAiTrim_(value.id || value.name);
}

function kspGeminiInteractionStatus_(response) {
  return kspAiTrim_(response && response.status).toLowerCase();
}

function kspGeminiInteractionPath_(interactionId) {
  var value = kspAiTrim_(interactionId);
  return value.indexOf('interactions/') === 0
    ? '/' + value
    : KSP_AI_API.INTERACTIONS_PATH + '/' + encodeURIComponent(value);
}

function kspGeminiInteractionIsTerminal_(status) {
  return ['failed', 'cancelled', 'requires_action', 'incomplete', 'budget_exceeded']
    .indexOf(String(status || '').toLowerCase()) !== -1;
}

function kspGeminiInteractionTerminalError_(status) {
  var error = kspGeminiStageError_('AI_QUERY_PROVIDER_TERMINAL', 'QUERY_PROVIDER', 0, {}, false);
  error.providerStatus = kspAiTrim_(status);
  return error;
}

function kspGeminiStartInteractionLive_(request) {
  var payload = {};
  Object.keys(request || {}).forEach(function (key) {
    payload[key] = request[key];
  });
  payload.background = true;
  var interactionHeaders = { 'Api-Revision': KSP_AI_DEFAULTS.INTERACTIONS_API_REVISION };
  var current = kspGeminiJsonRequestLive_('POST', KSP_AI_API.INTERACTIONS_PATH, payload, {
    retry: false,
    stage: 'QUERY_HTTP',
    errorCode: 'AI_QUERY_HTTP_FAILED',
    parseErrorCode: 'AI_QUERY_RESPONSE_INVALID',
    headers: interactionHeaders
  });
  var interactionId = kspGeminiInteractionId_(current);
  var status = kspGeminiInteractionStatus_(current);
  if (status === 'completed' || (!status && Array.isArray(current && current.steps))) {
    return { status: 'completed', interactionId: interactionId, response: current };
  }
  kspAssert_(interactionId, 'AI_QUERY_RESPONSE_INVALID', 'Gemini検索結果を確認できませんでした。');
  if (kspGeminiInteractionIsTerminal_(status)) throw kspGeminiInteractionTerminalError_(status);
  if (status !== 'queued' && status !== 'in_progress') {
    var invalidStartStatus = kspGeminiStageError_('AI_QUERY_RESPONSE_INVALID', 'QUERY_PROVIDER', 0, {}, false);
    invalidStartStatus.queryTerminal = true;
    throw invalidStartStatus;
  }
  return { status: 'in_progress', interactionId: interactionId };
}

function kspGeminiPollInteractionLive_(interactionId) {
  var value = kspAiTrim_(interactionId);
  kspAssert_(value, 'AI_QUERY_RESPONSE_INVALID', 'Gemini検索結果を確認できませんでした。');
  var current = kspGeminiJsonRequestLive_('GET', kspGeminiInteractionPath_(value), null, {
    retry: false,
    stage: 'QUERY_POLL',
    errorCode: 'AI_QUERY_HTTP_FAILED',
    parseErrorCode: 'AI_QUERY_RESPONSE_INVALID',
    headers: { 'Api-Revision': KSP_AI_DEFAULTS.INTERACTIONS_API_REVISION }
  });
  var status = kspGeminiInteractionStatus_(current);
  if (status === 'completed') return { status: 'completed', interactionId: value, response: current };
  if (kspGeminiInteractionIsTerminal_(status)) throw kspGeminiInteractionTerminalError_(status);
  if (status !== 'queued' && status !== 'in_progress') {
    var invalidPollStatus = kspGeminiStageError_('AI_QUERY_RESPONSE_INVALID', 'QUERY_PROVIDER', 0, {}, false);
    invalidPollStatus.queryTerminal = true;
    throw invalidPollStatus;
  }
  return { status: 'in_progress', interactionId: value };
}

function kspGeminiGenerateContentModelPath_(modelId) {
  var value = kspAiTrim_(modelId);
  if (value.indexOf('models/') === 0) value = value.slice('models/'.length);
  kspAssert_(/^[A-Za-z0-9][A-Za-z0-9._-]*$/.test(value),
    'AI_MODEL_NOT_CONFIGURED', 'Gemini Flash model IDが設定されていません。');
  return value;
}

function kspBuildGeminiGenerateContentRequest_(request) {
  var options = request || {};
  var modelId = kspGeminiGenerateContentModelPath_(options.modelId || options.model);
  var storeName = kspAiStoreResourcePath_(options.storeName);
  var input = kspValidateFeatureFreezeSearchInput_(kspNormalizeFeatureFreezeSearchInput_({
    mode: options.mode,
    questionOrInstruction: options.questionOrInstruction
  }));
  var fileSearch = {
    file_search_store_names: [storeName]
  };
  var metadataFilter = kspAiTrim_(options.metadataFilter);
  if (metadataFilter) fileSearch.metadata_filter = metadataFilter;
  return {
    contents: [{ parts: [{ text: kspBuildFeatureFreezePrompt_(input) }] }],
    tools: [{ file_search: fileSearch }],
    generationConfig: {
      thinkingConfig: { thinkingLevel: KSP_AI_DEFAULTS.QUERY_THINKING_LEVEL },
      maxOutputTokens: KSP_AI_DEFAULTS.QUERY_MAX_OUTPUT_TOKENS
    }
  };
}

function kspGeminiGenerateContentLive_(request) {
  var options = request || {};
  var model = kspGeminiGenerateContentModelPath_(options.modelId || options.model);
  var payload = kspBuildGeminiGenerateContentRequest_(options);
  return kspGeminiJsonRequestLive_('POST', '/models/' + model + ':generateContent', payload, {
    retry: false,
    stage: 'QUERY_GENERATE_CONTENT',
    errorCode: 'AI_QUERY_HTTP_FAILED',
    parseErrorCode: 'AI_QUERY_RESPONSE_INVALID',
    includeResponseMetadata: true
  });
}

function kspGeminiBuildFinalizeRequestOptions_(metadata, payload) {
  return {
    method: 'post',
    contentType: metadata.mimeType,
    headers: {
      'X-Goog-Upload-Offset': '0',
      'X-Goog-Upload-Command': 'upload, finalize'
    },
    payload: payload,
    escaping: false,
    muteHttpExceptions: true
  };
}

function kspGeminiBuildUploadBlob_(payloadBytes, metadata) {
  try {
    kspAssert_(typeof Utilities !== 'undefined' && Utilities &&
      typeof Utilities.newBlob === 'function',
      'AI_UPLOAD_FINALIZE_CLIENT_UNSUPPORTED', 'Upload Blob construction is unavailable.');
    var blob = Utilities.newBlob(Array.from(payloadBytes), metadata.mimeType, metadata.displayName);
    kspAssert_(blob && typeof blob.getBytes === 'function',
      'AI_UPLOAD_FINALIZE_CLIENT_UNSUPPORTED', 'Upload Blob construction is invalid.');
    var blobBytes = kspNormalizeAiByteArray_(blob.getBytes());
    var expectedBytes = kspNormalizeAiByteArray_(payloadBytes);
    kspAssert_(blobBytes.length === expectedBytes.length && blobBytes.every(function (value, index) {
      return value === expectedBytes[index];
    }), 'AI_UPLOAD_FINALIZE_CLIENT_UNSUPPORTED', 'Upload Blob bytes are invalid.');
    kspAssert_(typeof blob.getContentType === 'function' &&
      String(blob.getContentType() || '').trim() === String(metadata.mimeType || '').trim(),
      'AI_UPLOAD_FINALIZE_CLIENT_UNSUPPORTED', 'Upload Blob MIME type is invalid.');
    return blob;
  } catch (error) {
    throw kspGeminiStageError_('AI_UPLOAD_FINALIZE_CLIENT_UNSUPPORTED', 'UPLOAD_FINALIZE_CLIENT', 0, {}, false);
  }
}

function kspGeminiBuildBlobFinalizeRequest_(metadata, payloadBytes) {
  try {
    var displayName = String(metadata && metadata.displayName || '').trim();
    kspAssert_(displayName && displayName.length <= 255,
      'AI_UPLOAD_FINALIZE_CLIENT_UNSUPPORTED', 'Upload display name is invalid.');
    var blob = kspGeminiBuildUploadBlob_(payloadBytes, metadata);
    return kspGeminiBuildFinalizeRequestOptions_(metadata, blob);
  } catch (error) {
    throw kspGeminiStageError_('AI_UPLOAD_FINALIZE_CLIENT_UNSUPPORTED', 'UPLOAD_FINALIZE_CLIENT', 0, {}, false);
  }
}

function kspGeminiPrepareUploadBytes_(bytes, metadata) {
  var normalized = kspNormalizeAiByteArray_(bytes || []);
  kspAssert_(normalized.length > 0, 'AI_SOURCE_SIZE_INVALID', 'AI source payload is empty.');
  kspAssert_(normalized.length <= KSP_FEATURE_FREEZE_DEFAULTS.MAX_SOURCE_BYTES,
    'AI_SOURCE_TOO_LARGE', 'AI source exceeds the 25MB product limit.');
  kspAssert_(String(metadata && metadata.mimeType || '').trim(),
    'AI_SOURCE_MIME_INVALID', 'AI source MIME type is invalid.');
  return normalized.map(function (value) {
    return value > 127 ? value - 256 : value;
  });
}

function kspGeminiUploadSourceLive_(storeName, source, bytes) {
  var normalizedStore = kspAiStoreResourcePath_(storeName);
  var metadata = kspBuildFileSearchUploadMetadata_(source);
  var payloadBytes = kspGeminiPrepareUploadBytes_(bytes, metadata);
  var apiKey = kspGeminiApiKeyLive_();
  var startUrl = kspGeminiAppendApiKey_(
    KSP_AI_API.UPLOAD_BASE_URL + '/' + normalizedStore + ':uploadToFileSearchStore', apiKey
  );
  var startResponse;
  try {
    startResponse = UrlFetchApp.fetch(startUrl, {
      method: 'post',
      contentType: 'application/json',
      headers: {
        'X-Goog-Upload-Protocol': 'resumable',
        'X-Goog-Upload-Command': 'start',
        'X-Goog-Upload-Header-Content-Length': String(payloadBytes.length),
        'X-Goog-Upload-Header-Content-Type': metadata.mimeType
      },
      payload: JSON.stringify(metadata),
      muteHttpExceptions: true
    });
  } catch (ignoredStartError) {
    throw kspGeminiStageError_('AI_UPLOAD_SESSION_FAILED', 'UPLOAD_SESSION_START', 0, {}, true);
  }
  var startCode = startResponse.getResponseCode();
  var startHeaders = kspGeminiResponseHeaders_(startResponse);
  if (startCode < 200 || startCode >= 300) {
    throw kspGeminiStageError_('AI_UPLOAD_SESSION_FAILED', 'UPLOAD_SESSION_START', startCode, startHeaders);
  }
  var uploadUrl = kspGeminiHeaderValue_(startHeaders, 'X-Goog-Upload-URL') ||
    kspGeminiHeaderValue_(startHeaders, 'Location');
  if (!uploadUrl) {
    throw kspGeminiStageError_('AI_UPLOAD_SESSION_FAILED', 'UPLOAD_SESSION_START', startCode, startHeaders, false);
  }

  var finalizeOptions = kspGeminiBuildBlobFinalizeRequest_(metadata, payloadBytes);

  var uploadResponse;
  try {
    uploadResponse = UrlFetchApp.fetch(String(uploadUrl), finalizeOptions);
  } catch (ignoredFinalizeError) {
    throw kspGeminiStageError_('AI_UPLOAD_FINALIZE_CLIENT_FAILED', 'UPLOAD_FINALIZE_CLIENT', 0, {}, false);
  }
  var code = uploadResponse.getResponseCode();
  var headers = kspGeminiResponseHeaders_(uploadResponse);
  var parsed = {};
  try {
    var responseText = uploadResponse.getContentText('UTF-8');
    parsed = responseText ? kspSafeParseJson_(responseText, 'File Search upload response') : {};
  } catch (ignoredResponseError) {
    throw kspGeminiStageError_('AI_UPLOAD_FINALIZE_FAILED', 'UPLOAD_FINALIZE_HTTP', code, headers, false);
  }
  if (code < 200 || code >= 300) {
    throw kspGeminiStageError_('AI_UPLOAD_FINALIZE_FAILED', 'UPLOAD_FINALIZE_HTTP', code, headers);
  }

  var operation;
  try {
    operation = kspNormalizeFileSearchOperation_(parsed);
  } catch (ignoredOperationResponseError) {
    throw kspGeminiStageError_('AI_OPERATION_POLL_FAILED', 'OPERATION_POLL', code, headers, false);
  }
  kspAssert_(operation && operation.name, 'AI_OPERATION_POLL_FAILED', 'File Search operationが返されませんでした。');
  operation = kspPollFileSearchOperationLive_(operation);
  if (operation.error) {
    throw kspGeminiStageError_('AI_UPLOAD_OPERATION_FAILED', 'OPERATION_RESULT', 0, {}, false);
  }

  var documentValue;
  try {
    documentValue = kspExtractDocumentFromOperation_(operation);
  } catch (ignoredDocumentError) {
    documentValue = null;
  }
  if (documentValue && documentValue.name) {
    return kspReadAndVerifyFileSearchDocumentLive_(documentValue.name, source);
  }
  return kspReconcileGeminiDocumentLive_(normalizedStore, source);
}

function kspUploadSourceLive_(storeName, source) {
  var bytes = Utilities.newBlob(String(source.text || ''), source.mimeType || 'text/plain', source.displayName).getBytes();
  return kspGeminiUploadSourceLive_(storeName, source, bytes);
}

function kspPollFileSearchOperationLive_(operation) {
  var current = operation || {};
  if (!current.done && !current.name) {
    throw kspGeminiStageError_('AI_OPERATION_POLL_FAILED', 'OPERATION_POLL', 0, {}, false);
  }
  for (var attempt = 0; attempt < KSP_AI_DEFAULTS.MAX_OPERATION_POLLS && !current.done; attempt += 1) {
    Utilities.sleep(KSP_AI_DEFAULTS.OPERATION_POLL_MILLIS);
    current = kspNormalizeFileSearchOperation_(kspGeminiJsonRequestLive_(
      'GET', '/' + current.name, null,
      { retry: true, stage: 'OPERATION_POLL', errorCode: 'AI_OPERATION_POLL_FAILED' }
    ));
  }
  if (!current.done) {
    throw kspGeminiStageError_('AI_OPERATION_TIMEOUT', 'OPERATION_POLL', 0, {}, true);
  }
  return current;
}

function kspExtractDocumentFromOperation_(operation) {
  var response = operation && operation.response ? operation.response : {};
  var documentValue = response.fileSearchDocument || response.file_search_document || response.document || response;
  return kspNormalizeFileSearchDocument_(documentValue);
}

function kspGeminiDocumentMatchesSource_(documentValue, source) {
  var metadata = documentValue && documentValue.customMetadata ? documentValue.customMetadata : {};
  var state = String(documentValue && documentValue.state || '').toUpperCase();
  return (state === 'STATE_ACTIVE' || state === 'ACTIVE') &&
    String(metadata.source_type || '') === String(source && source.sourceType || '') &&
    String(metadata.source_id || '') === String(source && source.sourceId || '') &&
    String(metadata.content_hash || '') === String(source && source.contentHash || '') &&
    Boolean(String(source && source.contentHash || ''));
}

function kspReconcileGeminiDocumentLive_(storeName, source) {
  var maxAttempts = 3;
  for (var attempt = 0; attempt < maxAttempts; attempt += 1) {
    var documents = kspListAllFileSearchDocumentsLive_(storeName);
    var matching = documents.filter(function (documentValue) {
      return kspGeminiDocumentMatchesSource_(documentValue, source);
    });
    if (matching.length === 1) {
      return kspReadAndVerifyFileSearchDocumentLive_(matching[0].name, source);
    }
    if (matching.length > 1 || attempt === maxAttempts - 1) {
      throw kspGeminiStageError_('AI_DOCUMENT_READBACK_FAILED', 'DOCUMENT_READBACK', 0, {}, false);
    }
    if (typeof Utilities !== 'undefined' && Utilities && typeof Utilities.sleep === 'function') {
      Utilities.sleep(KSP_AI_DEFAULTS.OPERATION_POLL_MILLIS);
    }
  }
  throw kspGeminiStageError_('AI_DOCUMENT_READBACK_FAILED', 'DOCUMENT_READBACK', 0, {}, false);
}

function kspReadAndVerifyFileSearchDocumentLive_(documentName, source) {
  var name = kspAiTrim_(documentName);
  kspAssert_(/^fileSearchStores\/[^/]+\/documents\/[^/]+$/.test(name),
    'AI_DOCUMENT_READBACK_FAILED', 'File Search Document response is invalid.');
  var response;
  try {
    response = kspGeminiJsonRequestLive_('GET', '/' + name, null, {
      retry: true, stage: 'DOCUMENT_READBACK', errorCode: 'AI_DOCUMENT_READBACK_FAILED'
    });
    response = kspNormalizeFileSearchDocument_(response);
  } catch (error) {
    if (error && error.code === 'AI_DOCUMENT_READBACK_FAILED') throw error;
    throw kspGeminiStageError_('AI_DOCUMENT_READBACK_FAILED', 'DOCUMENT_READBACK', 0, {}, false);
  }
  var metadata = response.customMetadata || {};
  kspAssert_(String(metadata.source_type || '') === String(source.sourceType || '') &&
    String(metadata.source_id || '') === String(source.sourceId || ''),
    'AI_DOCUMENT_READBACK_FAILED', 'File Search Document metadata is invalid.');
  if (source.contentHash) {
    kspAssert_(String(metadata.content_hash || '') === String(source.contentHash),
      'AI_DOCUMENT_READBACK_FAILED', 'File Search Document content identity is invalid.');
  }
  var state = String(response.state || '').toUpperCase();
  kspAssert_(state === 'STATE_ACTIVE' || state === 'ACTIVE',
    'AI_DOCUMENT_READBACK_FAILED', 'File Search Document is not active.');
  return response;
}

function kspListAllFileSearchDocumentsLive_(storeName) {
  var store = kspAiStoreResourcePath_(storeName);
  var documents = [];
  var pageToken = '';
  for (var page = 0; page < 20; page += 1) {
    var path = '/' + store + '/documents?pageSize=20';
    if (pageToken) path += '&pageToken=' + encodeURIComponent(pageToken);
    var normalized;
    try {
      normalized = kspNormalizeFileSearchDocumentList_(kspGeminiJsonRequestLive_('GET', path, null, {
        retry: true, stage: 'DOCUMENT_READBACK', errorCode: 'AI_DOCUMENT_READBACK_FAILED'
      }));
    } catch (error) {
      if (error && error.code === 'AI_DOCUMENT_READBACK_FAILED') throw error;
      throw kspGeminiStageError_('AI_DOCUMENT_READBACK_FAILED', 'DOCUMENT_READBACK', 0, {}, false);
    }
    documents = documents.concat(normalized.documents);
    pageToken = normalized.nextPageToken;
    if (!pageToken) break;
  }
  return documents;
}
