function kspGeminiApiKeyLive_() {
  var apiKey = PropertiesService.getScriptProperties().getProperty(KSP_AI_PROPERTY_KEYS.API_KEY);
  kspAssert_(apiKey, 'AI_CREDENTIAL_NOT_CONFIGURED', 'Gemini API credentialが設定されていません。');
  return apiKey;
}

function kspGeminiStageMessage_(code) {
  var messages = {
    AI_STORE_CREATE_FAILED: 'Gemini File Search Storeを作成できませんでした。',
    AI_STORE_READ_FAILED: 'Gemini File Search Storeを確認できませんでした。',
    AI_STORE_DELETE_FAILED: 'Gemini File Search Storeを削除できませんでした。',
    AI_STORE_DELETE_CONFIRM_FAILED: 'Gemini File Search Storeの削除を確認できませんでした。',
    AI_GEMINI_MODELS_LIST_FAILED: 'Gemini model一覧を確認できませんでした。',
    AI_UPLOAD_SESSION_FAILED: 'Gemini File Search upload sessionを開始できませんでした。',
    AI_UPLOAD_SESSION_QUERY_FAILED: 'Gemini File Search upload sessionを確認できませんでした。',
    AI_UPLOAD_SESSION_STATE_AMBIGUOUS: 'Gemini File Search upload sessionの状態を確定できませんでした。',
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
    return Math.max(0, Number(value) * 1000);
  }
  var timestamp = Date.parse(value);
  if (!Number.isFinite(timestamp)) return null;
  return Math.max(0, timestamp - new Date().getTime());
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

function kspGeminiGenerationConfig_(input) {
  var source = input || {};
  var supplied = source.generation_config && typeof source.generation_config === 'object'
    ? source.generation_config : null;
  var thinking = supplied && Object.prototype.hasOwnProperty.call(supplied, 'thinking_level')
    ? kspAiTrim_(supplied.thinking_level)
    : (source.thinkingProviderDefault === true ? '' : kspAiTrim_(source.thinkingRawValue));
  var maximum = supplied && Object.prototype.hasOwnProperty.call(supplied, 'max_output_tokens')
    ? Number(supplied.max_output_tokens)
    : (source.maxOutputTokens !== undefined && source.maxOutputTokens !== null
      ? Number(source.maxOutputTokens) : KSP_AI_DEFAULTS.QUERY_MAX_OUTPUT_TOKENS);
  if (!supplied && source.thinkingProviderDefault === undefined && !source.thinkingRawValue) {
    thinking = KSP_AI_DEFAULTS.QUERY_THINKING_LEVEL;
  }
  kspAssert_(!thinking || /^[a-z][a-z0-9_-]{0,31}$/.test(thinking),
    'AI_MODEL_THINKING_INVALID', 'Gemini thinking level is invalid.');
  kspAssert_(Number.isInteger(maximum) && maximum >= 1 && maximum <= 65536,
    'AI_MODEL_OUTPUT_LIMIT_INVALID', 'Gemini output ceiling is invalid.');
  var generation = { max_output_tokens: maximum };
  if (thinking) generation.thinking_level = thinking;
  return generation;
}

function kspGeminiSafeProviderErrorCode_(value) {
  var normalized = kspAiTrim_(value).toLowerCase();
  var match = normalized.match(/([a-z][a-z0-9_]{1,63})$/);
  var candidate = match ? match[1] : '';
  var allowlist = {
    invalid_request: true,
    invalid_argument: true,
    failed_precondition: true,
    out_of_range: true,
    parameter_unknown: true,
    authentication: true,
    unauthenticated: true,
    permission_denied: true,
    not_found: true,
    model_not_found: true,
    already_exists: true,
    aborted: true,
    rate_limit_exceeded: true,
    quota_exceeded: true,
    resource_exhausted: true,
    too_many_requests: true,
    cancelled: true,
    api_error: true,
    internal: true,
    unimplemented: true,
    unavailable: true,
    service_unavailable: true,
    deadline_exceeded: true,
    safety: true,
    recitation: true,
    language: true,
    prohibited_content: true,
    spii: true,
    blocklist: true,
    image_safety: true,
    image_prohibited_content: true,
    image_recitation: true,
    image_other: true,
    content_blocked: true,
    malformed_function_call: true,
    malformed_tool_call: true,
    unexpected_tool_call: true,
    no_image: true,
    too_many_tool_calls: true,
    missing_thought_signature: true
  };
  return allowlist[candidate] ? candidate : '';
}

function kspGeminiSafeProviderErrorCodes_(payload) {
  var value = payload && typeof payload === 'object' ? payload : {};
  var errors = [];
  if (Array.isArray(value.errors)) errors = errors.concat(value.errors);
  if (value.error && typeof value.error === 'object') errors.push(value.error);
  var seen = {};
  var output = [];
  errors.forEach(function (item) {
    [item && item.code, item && item.status].forEach(function (value) {
      var code = kspGeminiSafeProviderErrorCode_(value);
      if (!code || seen[code] || output.length >= 8) return;
      seen[code] = true;
      output.push(code);
    });
  });
  return output;
}

function kspGeminiSafeProviderErrorCodesFromText_(responseText) {
  try {
    return kspGeminiSafeProviderErrorCodes_(JSON.parse(String(responseText || '')));
  } catch (ignored) {
    return [];
  }
}

function kspGeminiSafeHttpClassification_(defaultCode, httpStatus, responseText, providerErrorCodes) {
  var status = Number(httpStatus || 0) || 0;
  var value = String(responseText || '').toLowerCase();
  var safeCodes = Array.isArray(providerErrorCodes) ? providerErrorCodes : [];
  var modelSpecific = value.indexOf('model') !== -1 &&
    (value.indexOf('not found') !== -1 || value.indexOf('not supported') !== -1 ||
      value.indexOf('unsupported') !== -1 || value.indexOf('does not exist') !== -1);
  if (safeCodes.indexOf('model_not_found') !== -1) return 'AI_GEMINI_MODEL_UNSUPPORTED';
  if ((status === 400 || status === 404) && modelSpecific) return 'AI_GEMINI_MODEL_UNSUPPORTED';
  if (status === 403 && (value.indexOf('model') !== -1 || value.indexOf('permission') !== -1 ||
      value.indexOf('access') !== -1)) return 'AI_GEMINI_MODEL_ACCESS_DENIED';
  if (safeCodes.indexOf('authentication') !== -1 || safeCodes.indexOf('unauthenticated') !== -1) {
    return 'AI_GEMINI_CREDENTIAL_REJECTED';
  }
  if (status === 401 || status === 403) return 'AI_GEMINI_CREDENTIAL_REJECTED';
  return defaultCode;
}

function kspGeminiAppendApiKey_(url, apiKey) {
  var separator = String(url).indexOf('?') >= 0 ? '&' : '?';
  return String(url) + separator + 'key=' + encodeURIComponent(String(apiKey || ''));
}

function kspGeminiRetryDelayMillis_(attempt, retryAfterMillis) {
  if (retryAfterMillis !== undefined && retryAfterMillis !== null) {
    return Math.max(0, Number(retryAfterMillis) || 0);
  }
  var exponent = Math.max(0, Number(attempt || 1) - 1);
  var base = Math.min(
    KSP_AI_DEFAULTS.TRANSPORT_RETRY_MAX_MILLIS,
    KSP_AI_DEFAULTS.TRANSPORT_RETRY_BASE_MILLIS * Math.pow(2, exponent)
  );
  var jitter = Math.floor(base * 0.25 * Math.random());
  return Math.min(KSP_AI_DEFAULTS.TRANSPORT_RETRY_MAX_MILLIS, base + jitter);
}

function kspGeminiRetryPolicy_(options) {
  var settings = options || {};
  var policy = kspAiTrim_(settings.retryPolicy).toUpperCase();
  if (policy === KSP_GEMINI_RETRY_POLICIES.IDEMPOTENT ||
      policy === KSP_GEMINI_RETRY_POLICIES.MUTATING_CREATE) return policy;
  return settings.retry === true
    ? KSP_GEMINI_RETRY_POLICIES.IDEMPOTENT : KSP_GEMINI_RETRY_POLICIES.NONE;
}

function kspGeminiAttachTransportMetadata_(value, metadata) {
  if (!value || typeof value !== 'object') return value;
  var fields = {
    __kspAttempt: Math.max(1, Number(metadata && metadata.attempt || 1) || 1),
    __kspRetryCount: Math.max(0, Number(metadata && metadata.retryCount || 0) || 0),
    __kspCumulativeSleepMillis: Math.max(0, Number(metadata && metadata.cumulativeSleepMillis || 0) || 0),
    __kspElapsedMs: Math.max(0, Number(metadata && metadata.elapsedMs || 0) || 0)
  };
  Object.keys(fields).forEach(function (key) {
    try {
      Object.defineProperty(value, key, {
        value: fields[key], enumerable: false, configurable: false, writable: false
      });
    } catch (ignoredMetadataError) { /* Safe telemetry is best-effort. */ }
  });
  return value;
}

function kspGeminiRetryEligible_(policy, error) {
  if (!error || !error.retryable) return false;
  var status = Number(error.httpStatus || 0) || 0;
  if (policy === KSP_GEMINI_RETRY_POLICIES.IDEMPOTENT) {
    return Boolean(KSP_AI_RETRYABLE_HTTP_CODES[status]) ||
      (status === 0 && error.ambiguousTransport === true);
  }
  if (policy === KSP_GEMINI_RETRY_POLICIES.MUTATING_CREATE) {
    return error.explicitHttpResponse === true &&
      Boolean(KSP_AI_RETRYABLE_HTTP_CODES[status]) &&
      error.providerResourceIdentityPresent !== true;
  }
  return false;
}

function kspGeminiRunWithRetry_(operation, options) {
  var settings = options || {};
  var policy = kspGeminiRetryPolicy_(settings);
  var maxAttempts = policy === KSP_GEMINI_RETRY_POLICIES.IDEMPOTENT
    ? KSP_AI_DEFAULTS.IDEMPOTENT_TRANSPORT_ATTEMPTS
    : (policy === KSP_GEMINI_RETRY_POLICIES.MUTATING_CREATE
      ? KSP_AI_DEFAULTS.MUTATING_TRANSPORT_ATTEMPTS : 1);
  var cumulativeSleepMillis = 0;
  var startedAt = new Date().getTime();
  var attempt = 0;
  while (attempt < maxAttempts) {
    attempt += 1;
    try {
      var operationValue = operation(attempt);
      var successMetadata = {
        attempt: attempt,
        retryCount: attempt - 1,
        cumulativeSleepMillis: cumulativeSleepMillis,
        elapsedMs: Math.max(0, new Date().getTime() - startedAt)
      };
      return settings.returnMetadataWrapper === true
        ? { value: operationValue, metadata: successMetadata }
        : kspGeminiAttachTransportMetadata_(operationValue, successMetadata);
    } catch (rawError) {
      var error = rawError && rawError.code
        ? rawError
        : kspGeminiStageError_(settings.errorCode, settings.stage, 0, {}, true);
      if (!(rawError && rawError.code)) error.ambiguousTransport = true;
      error.attempt = attempt;
      error.retryCount = attempt - 1;
      error.cumulativeSleepMillis = cumulativeSleepMillis;
      error.elapsedMs = Math.max(0, new Date().getTime() - startedAt);
      if (!kspGeminiRetryEligible_(policy, error) || attempt >= maxAttempts) throw error;
      var delay = kspGeminiRetryDelayMillis_(attempt, error.retryAfterMillis);
      var remainingSleep = KSP_AI_DEFAULTS.TRANSPORT_CUMULATIVE_SLEEP_MILLIS - cumulativeSleepMillis;
      if (delay > remainingSleep) throw error;
      if (delay > 0 && typeof Utilities !== 'undefined' && typeof Utilities.sleep === 'function') {
        Utilities.sleep(delay);
      }
      cumulativeSleepMillis += delay;
    }
  }
  throw kspGeminiStageError_(settings.errorCode, settings.stage, 0, {}, false);
}

function kspGeminiAssertNoOrdinaryContentLength_(headers, code, stage) {
  var hasOrdinaryContentLength = Object.keys(headers || {}).some(function (name) {
    return String(name).toLowerCase() === 'content-length';
  });
  if (hasOrdinaryContentLength) {
    throw kspGeminiStageError_(code, stage, 0, {}, false);
  }
}

function kspGeminiProviderIdentityPresent_(responseText) {
  try {
    var parsed = JSON.parse(String(responseText || ''));
    if (!parsed || typeof parsed !== 'object') return false;
    return Boolean(kspAiTrim_(parsed.name || parsed.id ||
      (parsed.resource && (parsed.resource.name || parsed.resource.id))));
  } catch (ignored) {
    return false;
  }
}

function kspGeminiFetchResponseLive_(url, requestOptions, options) {
  var settings = options || {};
  var stage = settings.stage || 'GEMINI_HTTP';
  var errorCode = settings.errorCode || 'AI_HTTP_REQUEST_FAILED';
  var safeOptions = requestOptions || {};
  kspGeminiAssertNoOrdinaryContentLength_(safeOptions.headers, errorCode, stage);
  var wrapped = kspGeminiRunWithRetry_(function () {
    var response;
    try {
      response = UrlFetchApp.fetch(String(url || ''), safeOptions);
    } catch (ignoredFetchError) {
      var ambiguousError = kspGeminiStageError_(errorCode, stage, 0, {}, true);
      ambiguousError.ambiguousTransport = true;
      throw ambiguousError;
    }
    var code = response.getResponseCode();
    var headers = kspGeminiResponseHeaders_(response);
    if (code < 200 || code >= 300) {
      var safeErrorText = '';
      try { safeErrorText = response.getContentText('UTF-8'); } catch (ignoredErrorBody) { /* Classification only. */ }
      var safeProviderErrorCodes = kspGeminiSafeProviderErrorCodesFromText_(safeErrorText);
      var safeHttpError = kspGeminiStageError_(
        kspGeminiSafeHttpClassification_(errorCode, code, safeErrorText, safeProviderErrorCodes),
        stage, code, headers
      );
      safeHttpError.providerErrorCodes = safeProviderErrorCodes;
      safeHttpError.explicitHttpResponse = true;
      safeHttpError.providerResourceIdentityPresent = kspGeminiProviderIdentityPresent_(safeErrorText) ||
        Boolean(kspGeminiHeaderValue_(headers, 'Location') ||
          kspGeminiHeaderValue_(headers, 'X-Goog-Upload-URL'));
      throw safeHttpError;
    }
    return response;
  }, {
    retryPolicy: settings.retryPolicy,
    retry: settings.retry,
    stage: stage,
    errorCode: errorCode,
    returnMetadataWrapper: true
  });
  var rawResponse = wrapped.value;
  return {
    getResponseCode: function () { return rawResponse.getResponseCode(); },
    getAllHeaders: function () {
      return typeof rawResponse.getAllHeaders === 'function' ? rawResponse.getAllHeaders() : {};
    },
    getContentText: function (encoding) {
      return encoding === undefined
        ? rawResponse.getContentText() : rawResponse.getContentText(encoding);
    },
    __kspAttempt: wrapped.metadata.attempt,
    __kspRetryCount: wrapped.metadata.retryCount,
    __kspCumulativeSleepMillis: wrapped.metadata.cumulativeSleepMillis,
    __kspElapsedMs: wrapped.metadata.elapsedMs
  };
}

function kspGeminiJsonRequestLive_(method, path, payload, options) {
  var settings = options || {};
  var url = /^https?:\/\//.test(String(path || '')) ? String(path) : KSP_AI_API.BASE_URL + String(path || '');
  var stage = settings.stage || 'GEMINI_HTTP';
  var errorCode = settings.errorCode || 'AI_HTTP_REQUEST_FAILED';
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
  var response = kspGeminiFetchResponseLive_(url, requestOptions, {
    retryPolicy: settings.retryPolicy,
    retry: settings.retry,
    stage: stage,
    errorCode: errorCode
  });
  var code = response.getResponseCode();
  var headers = kspGeminiResponseHeaders_(response);
  var parsedResponse;
  try {
    var responseText = response.getContentText('UTF-8');
    parsedResponse = responseText ? kspSafeParseJson_(responseText, 'Gemini response') : {};
    if (settings.includeResponseMetadata && parsedResponse && typeof parsedResponse === 'object') {
      try {
        Object.defineProperty(parsedResponse, '__kspHttpStatus', {
          value: code, enumerable: false, configurable: false, writable: false
        });
      } catch (ignoredMetadataError) { /* Safe telemetry is best-effort. */ }
    }
  } catch (ignoredParseError) {
    throw kspGeminiStageError_(settings.parseErrorCode || errorCode, stage, code, headers, false);
  }
  return kspGeminiAttachTransportMetadata_(parsedResponse, {
    attempt: Number(response.__kspAttempt || 1),
    retryCount: Number(response.__kspRetryCount || 0),
    cumulativeSleepMillis: Number(response.__kspCumulativeSleepMillis || 0),
    elapsedMs: Number(response.__kspElapsedMs || 0)
  });
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

function kspGeminiInteractionTerminalError_(status, response) {
  var error = kspGeminiStageError_('AI_QUERY_PROVIDER_TERMINAL', 'QUERY_PROVIDER', 0, {}, false);
  error.providerStatus = kspAiTrim_(status);
  error.providerErrorCodes = kspGeminiSafeProviderErrorCodes_(response);
  error.httpStatus = Number(response && response.__kspHttpStatus || 0) || 0;
  return error;
}

function kspGeminiStartInteractionLive_(request) {
  var payload = {};
  Object.keys(request || {}).forEach(function (key) {
    payload[key] = request[key];
  });
  payload.background = true;
  var current = kspGeminiJsonRequestLive_('POST', KSP_AI_API.INTERACTIONS_PATH, payload, {
    retryPolicy: KSP_GEMINI_RETRY_POLICIES.MUTATING_CREATE,
    stage: 'QUERY_HTTP',
    errorCode: 'AI_QUERY_HTTP_FAILED',
    parseErrorCode: 'AI_QUERY_RESPONSE_INVALID'
  });
  var interactionId = kspGeminiInteractionId_(current);
  var status = kspGeminiInteractionStatus_(current);
  if (status === 'completed' || (!status && Array.isArray(current && current.steps))) {
    return { status: 'completed', interactionId: interactionId, response: current };
  }
  kspAssert_(interactionId, 'AI_QUERY_RESPONSE_INVALID', 'Gemini検索結果を確認できませんでした。');
  if (kspGeminiInteractionIsTerminal_(status)) throw kspGeminiInteractionTerminalError_(status, current);
  if (status !== 'queued' && status !== 'in_progress') {
    var invalidStartStatus = kspGeminiStageError_('AI_QUERY_RESPONSE_INVALID', 'QUERY_PROVIDER', 0, {}, false);
    invalidStartStatus.queryTerminal = true;
    throw invalidStartStatus;
  }
  return { status: 'in_progress', interactionId: interactionId };
}

function kspGeminiQueryInteractionLive_(request) {
  var payload = {};
  Object.keys(request || {}).forEach(function (key) { payload[key] = request[key]; });
  delete payload.background;
  var current = kspGeminiJsonRequestLive_('POST', KSP_AI_API.INTERACTIONS_PATH, payload, {
    retryPolicy: KSP_GEMINI_RETRY_POLICIES.MUTATING_CREATE,
    stage: 'QUERY_HTTP',
    errorCode: 'AI_QUERY_HTTP_FAILED',
    parseErrorCode: 'AI_QUERY_RESPONSE_INVALID',
    includeResponseMetadata: true
  });
  var status = kspGeminiInteractionStatus_(current);
  if (status === 'completed' || (!status && Array.isArray(current && current.steps))) return current;
  if (kspGeminiInteractionIsTerminal_(status)) throw kspGeminiInteractionTerminalError_(status, current);
  throw kspGeminiStageError_('AI_QUERY_ASYNC_REQUIRED', 'QUERY_PROVIDER', 0, {}, false);
}

function kspGeminiPollInteractionLive_(interactionId) {
  var value = kspAiTrim_(interactionId);
  kspAssert_(value, 'AI_QUERY_RESPONSE_INVALID', 'Gemini検索結果を確認できませんでした。');
  var current = kspGeminiJsonRequestLive_('GET', kspGeminiInteractionPath_(value), null, {
    retryPolicy: KSP_GEMINI_RETRY_POLICIES.IDEMPOTENT,
    stage: 'QUERY_POLL',
    errorCode: 'AI_QUERY_HTTP_FAILED',
    parseErrorCode: 'AI_QUERY_RESPONSE_INVALID'
  });
  var status = kspGeminiInteractionStatus_(current);
  if (status === 'completed') return { status: 'completed', interactionId: value, response: current };
  if (kspGeminiInteractionIsTerminal_(status)) throw kspGeminiInteractionTerminalError_(status, current);
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
  var exactGeneration = kspGeminiGenerationConfig_(options);
  var generationConfig = { maxOutputTokens: exactGeneration.max_output_tokens };
  if (exactGeneration.thinking_level) {
    generationConfig.thinkingConfig = { thinkingLevel: exactGeneration.thinking_level };
  }
  return {
    contents: [{ parts: [{ text: kspBuildFeatureFreezePrompt_(input) }] }],
    tools: [{ file_search: fileSearch }],
    generationConfig: generationConfig
  };
}

function kspGeminiGenerateContentLive_(request) {
  var options = request || {};
  var model = kspGeminiGenerateContentModelPath_(options.modelId || options.model);
  var payload = kspBuildGeminiGenerateContentRequest_(options);
  return kspGeminiJsonRequestLive_('POST', '/models/' + model + ':generateContent', payload, {
    retryPolicy: KSP_GEMINI_RETRY_POLICIES.MUTATING_CREATE,
    stage: 'QUERY_GENERATE_CONTENT',
    errorCode: 'AI_QUERY_HTTP_FAILED',
    parseErrorCode: 'AI_QUERY_RESPONSE_INVALID',
    includeResponseMetadata: true
  });
}

function kspGeminiBuildFinalizeRequestOptions_(metadata, payload, offset) {
  return {
    method: 'post',
    contentType: metadata.mimeType,
    headers: {
      'X-Goog-Upload-Offset': String(Math.max(0, Number(offset || 0) || 0)),
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

function kspGeminiBuildBlobFinalizeRequest_(metadata, payloadBytes, offset) {
  try {
    var displayName = String(metadata && metadata.displayName || '').trim();
    kspAssert_(displayName && displayName.length <= 255,
      'AI_UPLOAD_FINALIZE_CLIENT_UNSUPPORTED', 'Upload display name is invalid.');
    var blob = kspGeminiBuildUploadBlob_(payloadBytes, metadata);
    return kspGeminiBuildFinalizeRequestOptions_(metadata, blob, offset);
  } catch (error) {
    throw kspGeminiStageError_('AI_UPLOAD_FINALIZE_CLIENT_UNSUPPORTED', 'UPLOAD_FINALIZE_CLIENT', 0, {}, false);
  }
}

function kspGeminiBuildUploadQueryRequest_() {
  return {
    method: 'post',
    headers: { 'X-Goog-Upload-Command': 'query' },
    muteHttpExceptions: true
  };
}

function kspGeminiUploadSessionStatus_(response) {
  var headers = kspGeminiResponseHeaders_(response);
  var status = kspGeminiHeaderValue_(headers, 'X-Goog-Upload-Status').toLowerCase();
  var offsetText = kspGeminiHeaderValue_(headers, 'X-Goog-Upload-Size-Received');
  return {
    status: status,
    offset: /^\d+$/.test(offsetText) ? Number(offsetText) : null
  };
}

function kspGeminiRecoverUploadFinalize_(uploadUrl, metadata, payloadBytes, primaryError, normalizedStore, source) {
  var queryResponse;
  try {
    queryResponse = kspGeminiFetchResponseLive_(String(uploadUrl), kspGeminiBuildUploadQueryRequest_(), {
      retryPolicy: KSP_GEMINI_RETRY_POLICIES.IDEMPOTENT,
      stage: 'UPLOAD_SESSION_QUERY',
      errorCode: 'AI_UPLOAD_SESSION_QUERY_FAILED'
    });
  } catch (queryError) {
    primaryError.reconciliationCode = kspGetErrorCode_(queryError, 'AI_UPLOAD_SESSION_QUERY_FAILED');
    throw primaryError;
  }
  var session = kspGeminiUploadSessionStatus_(queryResponse);
  if (session.status === 'final' || session.status === 'finalized' || session.status === 'complete') {
    return { document: kspReconcileGeminiDocumentLive_(normalizedStore, source), response: null };
  }
  if (session.status !== 'active' || !Number.isInteger(session.offset) ||
      session.offset < 0 || session.offset > payloadBytes.length) {
    primaryError.reconciliationCode = 'AI_UPLOAD_SESSION_STATE_AMBIGUOUS';
    throw primaryError;
  }
  var remaining = payloadBytes.slice(session.offset);
  var resumeOptions = kspGeminiBuildBlobFinalizeRequest_(metadata, remaining, session.offset);
  try {
    return {
      document: null,
      response: kspGeminiFetchResponseLive_(String(uploadUrl), resumeOptions, {
        retryPolicy: KSP_GEMINI_RETRY_POLICIES.NONE,
        stage: 'UPLOAD_FINALIZE_RESUME',
        errorCode: 'AI_UPLOAD_FINALIZE_FAILED'
      })
    };
  } catch (resumeError) {
    primaryError.reconciliationCode = kspGetErrorCode_(resumeError, 'AI_UPLOAD_FINALIZE_FAILED');
    throw primaryError;
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
  var startResponse = kspGeminiFetchResponseLive_(startUrl, {
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
  }, {
    retryPolicy: KSP_GEMINI_RETRY_POLICIES.MUTATING_CREATE,
    stage: 'UPLOAD_SESSION_START',
    errorCode: 'AI_UPLOAD_SESSION_FAILED'
  });
  var startCode = startResponse.getResponseCode();
  var startHeaders = kspGeminiResponseHeaders_(startResponse);
  var uploadUrl = kspGeminiHeaderValue_(startHeaders, 'X-Goog-Upload-URL') ||
    kspGeminiHeaderValue_(startHeaders, 'Location');
  if (!uploadUrl) {
    throw kspGeminiStageError_('AI_UPLOAD_SESSION_FAILED', 'UPLOAD_SESSION_START', startCode, startHeaders, false);
  }

  var finalizeOptions = kspGeminiBuildBlobFinalizeRequest_(metadata, payloadBytes);

  var uploadResponse;
  try {
    uploadResponse = kspGeminiFetchResponseLive_(String(uploadUrl), finalizeOptions, {
      retryPolicy: KSP_GEMINI_RETRY_POLICIES.NONE,
      stage: 'UPLOAD_FINALIZE_HTTP',
      errorCode: 'AI_UPLOAD_FINALIZE_FAILED'
    });
  } catch (initialFinalizeError) {
    var primaryError = initialFinalizeError;
    if (Number(primaryError.httpStatus || 0) === 0) {
      primaryError.code = 'AI_UPLOAD_FINALIZE_CLIENT_FAILED';
      primaryError.stage = 'UPLOAD_FINALIZE_CLIENT';
      primaryError.retryable = false;
      primaryError.permanent = true;
    }
    var recovery = kspGeminiRecoverUploadFinalize_(String(uploadUrl), metadata, payloadBytes,
      primaryError, normalizedStore, source);
    if (recovery.document) return recovery.document;
    uploadResponse = recovery.response;
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
      { retryPolicy: KSP_GEMINI_RETRY_POLICIES.IDEMPOTENT,
        stage: 'OPERATION_POLL', errorCode: 'AI_OPERATION_POLL_FAILED' }
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
      retryPolicy: KSP_GEMINI_RETRY_POLICIES.IDEMPOTENT,
      stage: 'DOCUMENT_READBACK', errorCode: 'AI_DOCUMENT_READBACK_FAILED'
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
        retryPolicy: KSP_GEMINI_RETRY_POLICIES.IDEMPOTENT,
        stage: 'DOCUMENT_READBACK', errorCode: 'AI_DOCUMENT_READBACK_FAILED'
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
