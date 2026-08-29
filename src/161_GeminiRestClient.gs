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
    AI_UPLOAD_FINALIZE_CLIENT_UNSUPPORTED: 'Gemini File Search upload形式を利用できませんでした。',
    AI_UPLOAD_FINALIZE_FAILED: 'Gemini File Search uploadを完了できませんでした。',
    AI_OPERATION_POLL_FAILED: 'Gemini File Search upload operationを確認できませんでした。',
    AI_OPERATION_TIMEOUT: 'Gemini File Search upload operationが完了しませんでした。',
    AI_UPLOAD_OPERATION_FAILED: 'Gemini File Search upload operationに失敗しました。',
    AI_DOCUMENT_READBACK_FAILED: 'Gemini File Search Documentを確認できませんでした。',
    AI_DOCUMENT_DELETE_FAILED: 'Gemini File Search Documentを削除できませんでした。',
    AI_SOURCE_READ_FAILED: 'Gemini検索対象のソースを読み取れませんでした。',
    AI_QUERY_HTTP_FAILED: 'Gemini検索サービスを利用できません。',
    AI_QUERY_RESPONSE_INVALID: 'Gemini検索結果を確認できませんでした。'
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
      headers: { 'x-goog-api-key': kspGeminiApiKeyLive_() },
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
      return responseText ? kspSafeParseJson_(responseText, 'Gemini response') : {};
    } catch (ignoredParseError) {
      throw kspGeminiStageError_(settings.parseErrorCode || errorCode, stage, code, headers, false);
    }
  }, { retry: Boolean(settings.retry), stage: stage, errorCode: errorCode });
}

function kspGeminiHasHeader_(headers, name) {
  var target = String(name || '').toLowerCase();
  return Object.keys(headers || {}).some(function (key) {
    return String(key).toLowerCase() === target;
  });
}

function kspGeminiValidateUploadRequest_(uploadUrl, requestOptions, expectedMimeType) {
  try {
    kspAssert_(typeof UrlFetchApp !== 'undefined' && UrlFetchApp &&
      typeof UrlFetchApp.getRequest === 'function',
      'AI_UPLOAD_FINALIZE_REQUEST_INVALID', 'Upload request projection is unavailable.');
    var request = UrlFetchApp.getRequest(uploadUrl, requestOptions);
    kspAssert_(request && typeof request === 'object',
      'AI_UPLOAD_FINALIZE_REQUEST_INVALID', 'Upload request projection is invalid.');
    kspAssert_(String(request.method || '').toLowerCase() === 'post',
      'AI_UPLOAD_FINALIZE_REQUEST_INVALID', 'Upload request method is invalid.');
    var requestHeaders = request.headers || {};
    var contentType = String(request.contentType ||
      kspGeminiHeaderValue_(requestHeaders, 'Content-Type') || '').trim();
    kspAssert_(contentType === String(expectedMimeType || '').trim(),
      'AI_UPLOAD_FINALIZE_REQUEST_INVALID', 'Upload request MIME type is invalid.');
    kspAssert_(kspGeminiHeaderValue_(requestHeaders, 'X-Goog-Upload-Offset') === '0',
      'AI_UPLOAD_FINALIZE_REQUEST_INVALID', 'Upload request offset is invalid.');
    kspAssert_(kspGeminiHeaderValue_(requestHeaders, 'X-Goog-Upload-Command') === 'upload, finalize',
      'AI_UPLOAD_FINALIZE_REQUEST_INVALID', 'Upload request command is invalid.');
    kspAssert_(!kspGeminiHasHeader_(requestOptions.headers, 'Content-Length'),
      'AI_UPLOAD_FINALIZE_REQUEST_INVALID', 'Upload request must not provide Content-Length.');
    kspAssert_(request.payload !== undefined && request.payload !== null,
      'AI_UPLOAD_FINALIZE_REQUEST_INVALID', 'Upload request payload is missing.');
    return true;
  } catch (ignoredRequestError) {
    return false;
  }
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
    muteHttpExceptions: true
  };
}

function kspGeminiBuildUploadBlob_(payloadBytes, metadata) {
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
}

function kspGeminiSelectFinalizeRequest_(uploadUrl, metadata, payloadBytes) {
  var candidates = [
    function () { return payloadBytes.slice(); },
    function () { return kspGeminiBuildUploadBlob_(payloadBytes, metadata); }
  ];
  for (var index = 0; index < candidates.length; index += 1) {
    var payload;
    try {
      payload = candidates[index]();
      var requestOptions = kspGeminiBuildFinalizeRequestOptions_(metadata, payload);
      if (kspGeminiValidateUploadRequest_(uploadUrl, requestOptions, metadata.mimeType)) {
        return requestOptions;
      }
    } catch (ignoredCandidateError) {
      // Try the next representation without exposing request or provider details.
    }
  }
  throw kspGeminiStageError_('AI_UPLOAD_FINALIZE_CLIENT_UNSUPPORTED', 'UPLOAD_FINALIZE_CLIENT', 0, {}, false);
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

  var finalizeOptions = kspGeminiSelectFinalizeRequest_(String(uploadUrl), metadata, payloadBytes);

  var uploadResponse;
  try {
    uploadResponse = UrlFetchApp.fetch(String(uploadUrl), finalizeOptions);
  } catch (ignoredFinalizeError) {
    throw kspGeminiStageError_('AI_UPLOAD_FINALIZE_REQUEST_INVALID', 'UPLOAD_FINALIZE_CLIENT', 0, {}, false);
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
    throw kspGeminiStageError_('AI_DOCUMENT_READBACK_FAILED', 'DOCUMENT_READBACK', 0, {}, false);
  }
  return kspReadAndVerifyFileSearchDocumentLive_(documentValue.name, source);
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
