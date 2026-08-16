function kspGeminiApiKeyLive() {
  var apiKey = PropertiesService.getScriptProperties().getProperty(KSP_AI_PROPERTY_KEYS.API_KEY);
  kspAssert(apiKey, 'AI_CREDENTIAL_NOT_CONFIGURED', 'Gemini API credentialが設定されていません。');
  return apiKey;
}

function kspGeminiJsonRequestLive(method, path, payload) {
  var url = /^https?:\/\//.test(String(path || '')) ? String(path) : KSP_AI_API.BASE_URL + String(path || '');
  var options = {
    method: String(method || 'GET').toLowerCase(),
    headers: { 'x-goog-api-key': kspGeminiApiKeyLive() },
    muteHttpExceptions: true
  };
  if (payload !== null && payload !== undefined) {
    options.contentType = 'application/json';
    options.payload = JSON.stringify(payload);
  }
  var response = UrlFetchApp.fetch(url, options);
  var code = response.getResponseCode();
  var text = response.getContentText('UTF-8');
  var parsed = text ? kspSafeParseJson(text, 'Gemini response') : {};
  if (code < 200 || code >= 300) {
    var message = parsed && parsed.error && parsed.error.message ? parsed.error.message : ('Gemini API HTTP ' + code);
    var error = new Error(message);
    error.code = 'AI_HTTP_' + code;
    error.httpStatus = code;
    error.retryable = Boolean(KSP_AI_RETRYABLE_HTTP_CODES[code]);
    throw error;
  }
  return parsed;
}

function kspUploadSourceLive(storeName, source) {
  var normalizedStore = kspAiStoreResourcePath(storeName);
  var bytes = Utilities.newBlob(String(source.text || ''), source.mimeType || 'text/plain', source.displayName).getBytes();
  var metadata = kspBuildFileSearchUploadMetadata(source);
  var startUrl = KSP_AI_API.UPLOAD_BASE_URL + '/' + normalizedStore + ':uploadToFileSearchStore';
  var startResponse = UrlFetchApp.fetch(startUrl, {
    method: 'post',
    contentType: 'application/json',
    headers: {
      'x-goog-api-key': kspGeminiApiKeyLive(),
      'X-Goog-Upload-Protocol': 'resumable',
      'X-Goog-Upload-Command': 'start',
      'X-Goog-Upload-Header-Content-Length': String(bytes.length),
      'X-Goog-Upload-Header-Content-Type': metadata.mimeType
    },
    payload: JSON.stringify(metadata),
    muteHttpExceptions: true
  });
  kspAssert(startResponse.getResponseCode() >= 200 && startResponse.getResponseCode() < 300,
    'AI_UPLOAD_SESSION_FAILED', 'File Search upload sessionを開始できませんでした。');
  var headers = startResponse.getAllHeaders();
  var uploadUrl = headers.Location || headers.location || headers['X-Goog-Upload-URL'] || headers['x-goog-upload-url'];
  kspAssert(uploadUrl, 'AI_UPLOAD_URL_MISSING', 'File Search upload URLが返されませんでした。');

  var uploadResponse = UrlFetchApp.fetch(String(uploadUrl), {
    method: 'post',
    contentType: metadata.mimeType,
    headers: {
      'x-goog-api-key': kspGeminiApiKeyLive(),
      'X-Goog-Upload-Offset': '0',
      'X-Goog-Upload-Command': 'upload, finalize'
    },
    payload: bytes,
    muteHttpExceptions: true
  });
  var code = uploadResponse.getResponseCode();
  var parsed = kspSafeParseJson(uploadResponse.getContentText('UTF-8'), 'File Search upload response');
  if (code < 200 || code >= 300) {
    var error = new Error(parsed && parsed.error && parsed.error.message ? parsed.error.message : 'File Search upload failed.');
    error.code = 'AI_HTTP_' + code;
    error.httpStatus = code;
    error.retryable = Boolean(KSP_AI_RETRYABLE_HTTP_CODES[code]);
    throw error;
  }
  var operation = kspNormalizeFileSearchOperation(parsed);
  operation = kspPollFileSearchOperationLive(operation);
  kspAssert(!operation.error, 'AI_UPLOAD_OPERATION_FAILED', operation.error ? operation.error.message : 'Upload operation failed.');
  return kspExtractDocumentFromOperation(operation);
}

function kspPollFileSearchOperationLive(operation) {
  var current = operation;
  for (var attempt = 0; attempt < KSP_AI_DEFAULTS.MAX_OPERATION_POLLS && !current.done; attempt += 1) {
    Utilities.sleep(KSP_AI_DEFAULTS.OPERATION_POLL_MILLIS);
    current = kspNormalizeFileSearchOperation(kspGeminiJsonRequestLive('GET', '/' + current.name, null));
  }
  kspAssert(current.done, 'AI_OPERATION_TIMEOUT', 'File Search operationが完了しませんでした。');
  return current;
}

function kspExtractDocumentFromOperation(operation) {
  var response = operation && operation.response ? operation.response : {};
  var documentValue = response.fileSearchDocument || response.file_search_document || response.document || response;
  return kspNormalizeFileSearchDocument(documentValue);
}

function kspListAllFileSearchDocumentsLive(storeName) {
  var store = kspAiStoreResourcePath(storeName);
  var documents = [];
  var pageToken = '';
  for (var page = 0; page < 20; page += 1) {
    var path = '/' + store + '/documents?pageSize=100';
    if (pageToken) path += '&pageToken=' + encodeURIComponent(pageToken);
    var normalized = kspNormalizeFileSearchDocumentList(kspGeminiJsonRequestLive('GET', path, null));
    documents = documents.concat(normalized.documents);
    pageToken = normalized.nextPageToken;
    if (!pageToken) break;
  }
  return documents;
}
