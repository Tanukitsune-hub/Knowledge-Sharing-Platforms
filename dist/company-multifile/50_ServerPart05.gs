// ===== BEGIN src/161_GeminiRestClient.gs =====
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
  try {
    Object.defineProperty(value, '__kspRetryDisposition', {
      value: String(metadata && metadata.retryDisposition || 'NOT_APPLICABLE'),
      enumerable: false, configurable: false, writable: false
    });
  } catch (ignoredDispositionError) { /* Safe telemetry is best-effort. */ }
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
        retryDisposition: attempt > 1 ? 'RETRIED' : 'NOT_APPLICABLE',
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
      if (!kspGeminiRetryEligible_(policy, error)) {
        error.retryDisposition = policy === KSP_GEMINI_RETRY_POLICIES.MUTATING_CREATE &&
          error.providerResourceIdentityPresent === true
          ? 'PROVIDER_RESOURCE_IDENTITY_PRESENT'
          : policy === KSP_GEMINI_RETRY_POLICIES.MUTATING_CREATE && error.ambiguousTransport === true
            ? 'AMBIGUOUS_MUTATING_OUTCOME'
            : error.retryable === false ? 'NOT_RETRYABLE' : 'NOT_APPLICABLE';
        throw error;
      }
      if (attempt >= maxAttempts) {
        error.retryDisposition = 'ATTEMPT_BUDGET_EXHAUSTED';
        throw error;
      }
      var delay = kspGeminiRetryDelayMillis_(attempt, error.retryAfterMillis);
      var remainingSleep = KSP_AI_DEFAULTS.TRANSPORT_CUMULATIVE_SLEEP_MILLIS - cumulativeSleepMillis;
      if (delay > remainingSleep) {
        error.retryDisposition = 'RETRY_AFTER_EXCEEDS_SLEEP_BUDGET';
        throw error;
      }
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
    __kspRetryDisposition: wrapped.metadata.retryDisposition,
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
    retryDisposition: response.__kspRetryDisposition || 'NOT_APPLICABLE',
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
  if (pageToken) {
    throw kspGeminiStageError_('AI_DOCUMENT_READBACK_FAILED', 'DOCUMENT_READBACK', 0, {}, false);
  }
  return documents;
}
// ===== END src/161_GeminiRestClient.gs =====

// ===== BEGIN src/162_AiLiveDataAdapters.gs =====
function kspReadSettingsMapLive_(spreadsheetId) {
  var spreadsheet = SpreadsheetApp.openById(spreadsheetId);
  var sheet = spreadsheet.getSheetByName(KSP_SHEET_NAMES.SETTINGS);
  kspAssert_(sheet, 'SETTINGS_SHEET_NOT_FOUND', 'Settings sheetがありません。');
  var headers = kspReadHeadersFromSheet_(sheet);
  var rows = kspReadObjectsFromSheet_(sheet, headers);
  var map = {};
  rows.forEach(function (row) { if (row.Key) map[String(row.Key)] = row.Value; });
  return map;
}

function kspUpsertMissingSettingsLive_(spreadsheetId, rows) {
  var spreadsheet = SpreadsheetApp.openById(spreadsheetId);
  var sheet = spreadsheet.getSheetByName(KSP_SHEET_NAMES.SETTINGS);
  var headers = kspReadHeadersFromSheet_(sheet);
  var existing = kspReadObjectsFromSheet_(sheet, headers);
  var keys = {};
  existing.forEach(function (row) { keys[String(row.Key)] = true; });
  var missing = (rows || []).filter(function (row) { return !keys[String(row.Key)]; });
  kspAppendObjectsToSheet_(sheet, headers, missing);
  return { inserted: missing.length, skipped: rows.length - missing.length };
}

function kspWriteSettingLive_(spreadsheetId, key, value, nowIso) {
  var setting = kspFindSettingRow_(spreadsheetId, key);
  setting.sheet.getRange(setting.rowIndex, setting.valueIndex + 1).setValue(String(value));
  if (setting.updatedAtIndex !== -1) setting.sheet.getRange(setting.rowIndex, setting.updatedAtIndex + 1).setValue(nowIso);
}

function kspUpdateRowPatchLive_(spreadsheetId, sheetName, keyColumn, keyValue, patch, expected) {
  var lock = LockService.getScriptLock();
  if (!lock.tryLock(KSP_DEFAULTS.LOCK_TIMEOUT_MS)) {
    var error = new Error('Could not acquire AI row update lock.');
    error.code = 'AI_ROW_LOCK_TIMEOUT';
    throw error;
  }
  try {
    var spreadsheet = SpreadsheetApp.openById(spreadsheetId);
    var sheet = spreadsheet.getSheetByName(sheetName);
    kspAssert_(sheet, 'SHEET_NOT_FOUND', 'Sheet not found: ' + sheetName);
    var headers = kspReadHeadersFromSheet_(sheet);
    var rows = kspReadObjectsFromSheet_(sheet, headers);
    var index = -1;
    rows.forEach(function (row, rowIndex) {
      if (String(row[keyColumn]) === String(keyValue)) {
        kspAssert_(index === -1, 'DUPLICATE_KEY_ROWS', 'Duplicate source rows: ' + keyValue);
        index = rowIndex;
      }
    });
    kspAssert_(index !== -1, 'AI_SOURCE_ROW_NOT_FOUND', 'AI source rowが見つかりません。');
    if (expected) {
      var meetingSheet = spreadsheet.getSheetByName(KSP_SHEET_NAMES.MEETING_INDEX);
      var meetingRows = kspReadObjectsFromSheet_(meetingSheet, kspReadHeadersFromSheet_(meetingSheet));
      kspAssertAiSyncExpected_(rows[index], meetingRows, expected);
      var claimKey = KSP_AI_PROPERTY_KEYS.SOURCE_CLAIM_PREFIX + kspAiSourceKey_(expected.sourceType, expected.sourceId);
      var claim = kspSafeParseJson_(PropertiesService.getScriptProperties().getProperty(claimKey), claimKey);
      kspAssert_(claim && expected.claimToken && claim.token === expected.claimToken,
        'AI_SYNC_CLAIM_CONFLICT', '同期claimが失効しました。');
      var claimedAt = new Date(kspCanonicalInstantIso_(claim.claimedAt)).getTime();
      kspAssert_(Number.isFinite(claimedAt) && Date.now() - claimedAt >= 0 &&
        Date.now() - claimedAt < KSP_AI_DEFAULTS.CLAIM_TTL_MILLIS,
        'AI_SYNC_CLAIM_CONFLICT', '同期claimが失効しました。');
    }
    if (typeof patch === 'function') patch = patch(rows[index]);
    var updated = kspDeepClone_(rows[index]);
    Object.keys(patch || {}).forEach(function (key) { updated[key] = patch[key]; });
    var values = headers.map(function (header) {
      var value = updated[header];
      return value === undefined || value === null ? '' : value;
    });
    Object.keys(patch || {}).forEach(function (key) {
      var column = headers.indexOf(key);
      kspAssert_(column !== -1, 'AI_PATCH_COLUMN_MISSING', '同期列がありません。');
    });
    Object.keys(patch || {}).forEach(function (key) {
      sheet.getRange(index + 2, headers.indexOf(key) + 1).setValue(values[headers.indexOf(key)]);
    });
    return updated;
  } finally {
    lock.releaseLock();
  }
}

function kspClaimAiSourceLive_(scriptProperties, sourceType, sourceId, nowIso, ttlMillis) {
  var lock = LockService.getScriptLock();
  if (!lock.tryLock(KSP_DEFAULTS.LOCK_TIMEOUT_MS)) return null;
  try {
    var key = KSP_AI_PROPERTY_KEYS.SOURCE_CLAIM_PREFIX + kspAiSourceKey_(sourceType, sourceId);
    var existing = kspSafeParseJson_(scriptProperties.getProperty(key), key);
    var canonicalNowIso = kspCanonicalInstantIso_(nowIso);
    var nowMillis = canonicalNowIso ? new Date(canonicalNowIso).getTime() : NaN;
    var claimedAtIso = existing ? kspCanonicalInstantIso_(existing.claimedAt) : '';
    var claimedAtMillis = claimedAtIso ? new Date(claimedAtIso).getTime() : NaN;
    if (existing && Number.isFinite(nowMillis) && Number.isFinite(claimedAtMillis) && nowMillis - claimedAtMillis < ttlMillis) return null;
    var token = Utilities.getUuid();
    scriptProperties.setProperty(key, JSON.stringify({ token: token, claimedAt: canonicalNowIso }));
    return { token: token, claimedAt: canonicalNowIso };
  } finally {
    lock.releaseLock();
  }
}

function kspReleaseAiSourceClaimLive_(scriptProperties, sourceType, sourceId, token) {
  var lock = LockService.getScriptLock();
  if (!lock.tryLock(KSP_DEFAULTS.LOCK_TIMEOUT_MS)) return false;
  try {
    var key = KSP_AI_PROPERTY_KEYS.SOURCE_CLAIM_PREFIX + kspAiSourceKey_(sourceType, sourceId);
    var existing = kspSafeParseJson_(scriptProperties.getProperty(key), key);
    if (!existing || existing.token !== token) return false;
    scriptProperties.deleteProperty(key);
    return true;
  } finally {
    lock.releaseLock();
  }
}
// ===== END src/162_AiLiveDataAdapters.gs =====

// ===== BEGIN src/163_OpenAiRestClient.gs =====
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
// ===== END src/163_OpenAiRestClient.gs =====

// ===== BEGIN src/164_AiProviderCore.gs =====
var KSP_AI_PROVIDER_STATE_VERSION = 1;

function kspAiProviderStateEntry_() {
  return {
    status: KSP_AI_INDEX_STATUS.NOT_INDEXED,
    documentName: '',
    providerDocumentId: '',
    storeName: '',
    indexedAt: '',
    contentHash: '',
    lastError: ''
  };
}

function kspBuildEmptyAiProviderState_() {
  return {
    stateVersion: KSP_AI_PROVIDER_STATE_VERSION,
    OPENAI: kspAiProviderStateEntry_(),
    GEMINI: kspAiProviderStateEntry_()
  };
}

function kspNormalizeAiProviderEntry_(value) {
  var source = value || {};
  var output = kspAiProviderStateEntry_();
  var status = kspAiTrim_(source.status || source.indexStatus);
  if (status) output.status = status;
  output.documentName = kspAiTrim_(source.documentName || source.document_name || source.name);
  output.providerDocumentId = kspAiTrim_(source.providerDocumentId || source.provider_document_id || source.fileId);
  output.storeName = kspAiTrim_(source.storeName || source.store_name || source.vectorStoreId);
  output.indexedAt = kspAiTrim_(source.indexedAt || source.indexed_at);
  output.contentHash = kspAiTrim_(source.contentHash || source.content_hash);
  output.lastError = kspAiTrim_(source.lastError || source.last_error);
  return output;
}

function kspParseAiProviderState_(rawValue, legacyRow) {
  var parsed = rawValue;
  if (typeof parsed === 'string') {
    var raw = parsed.trim();
    if (!raw) parsed = null;
    else {
      try { parsed = JSON.parse(raw); }
      catch (error) {
        var invalid = new Error('AI provider state is invalid.');
        invalid.code = 'AI_PROVIDER_STATE_INVALID';
        throw invalid;
      }
    }
  }
  var state = kspBuildEmptyAiProviderState_();
  if (parsed && typeof parsed === 'object') {
    var providers = parsed.providers && typeof parsed.providers === 'object' ? parsed.providers : parsed;
    state.OPENAI = kspNormalizeAiProviderEntry_(providers.OPENAI || providers.openai);
    state.GEMINI = kspNormalizeAiProviderEntry_(providers.GEMINI || providers.gemini);
    state.stateVersion = Number(parsed.stateVersion || parsed.state_version || KSP_AI_PROVIDER_STATE_VERSION) || KSP_AI_PROVIDER_STATE_VERSION;
    return state;
  }
  var row = legacyRow || {};
  state.GEMINI = kspNormalizeAiProviderEntry_({
    status: row.AI_Index_Status,
    documentName: row.AI_Document_Name,
    indexedAt: row.AI_Indexed_At,
    contentHash: row.AI_Content_Hash,
    lastError: row.AI_Last_Error
  });
  return state;
}

function kspSerializeAiProviderState_(state) {
  var normalized = state || kspBuildEmptyAiProviderState_();
  var output = {
    stateVersion: KSP_AI_PROVIDER_STATE_VERSION,
    OPENAI: kspNormalizeAiProviderEntry_(normalized.OPENAI),
    GEMINI: kspNormalizeAiProviderEntry_(normalized.GEMINI)
  };
  return JSON.stringify(output);
}

function kspAiProviderLastError_(value) {
  var parsed = value;
  if (typeof parsed === 'string') {
    var raw = parsed.trim();
    if (!raw) return { attempt: 0, retryable: false, permanent: false, nextAttemptAt: '', code: '' };
    try { parsed = JSON.parse(raw); } catch (ignored) {
      return { attempt: 0, retryable: false, permanent: false, nextAttemptAt: '', code: '' };
    }
  }
  var source = parsed && typeof parsed === 'object' ? parsed : {};
  return {
    attempt: Number(source.attempt || 0) || 0,
    retryable: Boolean(source.retryable),
    permanent: Boolean(source.permanent),
    nextAttemptAt: kspAiTrim_(source.nextAttemptAt || source.next_attempt_at),
    code: kspAiTrim_(source.code)
  };
}

function kspBuildAiProviderLastError_(error, previous, settings, nowIso) {
  var prior = previous || { attempt: 0 };
  var attempt = Number(prior.attempt || 0) + 1;
  var retryable = Boolean(kspIsAiErrorRetryable_(error) && !error.permanent &&
    attempt < Number(settings.maxRetryAttempts || KSP_AI_DEFAULTS.MAX_RETRY_ATTEMPTS));
  var permanent = Boolean(error.permanent) || !retryable;
  var nextAttemptAt = retryable
    ? kspCalculateAiRetryAt_(nowIso, attempt, settings)
    : '';
  return JSON.stringify({
    attempt: attempt,
    retryable: retryable,
    permanent: permanent,
    nextAttemptAt: nextAttemptAt,
    code: kspGetErrorCode_(error, 'AI_SYNC_FAILED')
  });
}

function kspGetAiProviderStateEntry_(row, provider) {
  var state = kspParseAiProviderState_(row && row.AI_Provider_State_JSON, row);
  return state[kspNormalizeAiProvider_(provider)] || kspAiProviderStateEntry_();
}

function kspIsGeminiReadbackRecoveryEntry_(entry, provider) {
  var lastError = kspAiProviderLastError_(entry && entry.lastError);
  return provider === KSP_AI_PROVIDERS.GEMINI &&
    entry && entry.status === KSP_AI_INDEX_STATUS.FAILED &&
    lastError.code === 'AI_DOCUMENT_READBACK_FAILED' &&
    lastError.permanent === true && !entry.documentName && !entry.contentHash;
}

function kspIsAiProviderRetryDue_(entry, nowIso, settings) {
  var lastError = kspAiProviderLastError_(entry && entry.lastError);
  if (lastError.permanent || !lastError.retryable ||
      lastError.attempt >= Number(settings.maxRetryAttempts || KSP_AI_DEFAULTS.MAX_RETRY_ATTEMPTS)) return false;
  return !lastError.nextAttemptAt ||
    kspTemporalInstantComparisonKey_(lastError.nextAttemptAt) <= kspTemporalInstantComparisonKey_(nowIso);
}

function kspIsProviderAiWorkEligible_(item, nowIso, settings, provider) {
  var row = item.row || {};
  var entry = kspGetAiProviderStateEntry_(row, provider);
  var sourceStatus = String(row.Status || '');
  if (sourceStatus === KSP_STATUS.INACTIVE || item.retrievalEligible === false) {
    return Boolean(entry.documentName) || entry.status === KSP_AI_INDEX_STATUS.INDEXED ||
      entry.status === KSP_AI_INDEX_STATUS.PENDING || entry.status === KSP_AI_INDEX_STATUS.FAILED;
  }
  if (sourceStatus !== KSP_STATUS.ACTIVE) return false;
  // An Indexed entry can carry a retryable cleanup failure while continuing
  // to serve its last-known-good document. Scheduled sync must revisit that
  // entry after its retry deadline instead of treating Indexed as terminal.
  if (entry.status === KSP_AI_INDEX_STATUS.INDEXED &&
      kspIsAiProviderRetryDue_(entry, nowIso, settings)) return true;
  // The legacy status can remain Pending after an OpenAI-specific successful
  // sync. Treat it as a revision signal only when the authoritative row is
  // newer than that provider's complete Indexed entry.
  if (String(row.AI_Index_Status || '') === KSP_AI_INDEX_STATUS.PENDING) {
    var completeOpenAiEntry = provider === KSP_AI_PROVIDERS.OPENAI &&
      entry.status === KSP_AI_INDEX_STATUS.INDEXED && entry.documentName &&
      entry.providerDocumentId && entry.contentHash && entry.indexedAt;
    if (completeOpenAiEntry && row.Updated_At &&
        kspTemporalInstantComparisonKey_(entry.indexedAt) >= kspTemporalInstantComparisonKey_(row.Updated_At)) {
      return false;
    }
    return true;
  }
  if (entry.status === KSP_AI_INDEX_STATUS.PENDING || entry.status === KSP_AI_INDEX_STATUS.NOT_INDEXED) return true;
  if (entry.status === KSP_AI_INDEX_STATUS.INDEXED && !entry.documentName) return true;
  if (entry.status !== KSP_AI_INDEX_STATUS.FAILED) return false;
  if (kspIsGeminiReadbackRecoveryEntry_(entry, provider)) return true;
  return kspIsAiProviderRetryDue_(entry, nowIso, settings);
}

function kspNormalizeProviderAiSelection_(selection) {
  var sourceType = kspAiTrim_(selection && selection.sourceType);
  var sourceId = kspAiTrim_(selection && selection.sourceId);
  kspAssert_(!sourceType || Boolean(kspAiSourceLabel_(sourceType)),
    'AI_SYNC_SOURCE_TYPE_INVALID', 'AI sync source type is invalid.');
  if (sourceId) {
    kspAssert_(sourceType, 'AI_SYNC_SOURCE_TYPE_REQUIRED', 'Exact AI sync requires a source type.');
    var prefixes = {};
    prefixes[KSP_AI_SOURCE_TYPES.MEETING] = 'MTG-';
    prefixes[KSP_AI_SOURCE_TYPES.PITCHBOOK] = 'DOC-';
    prefixes[KSP_AI_SOURCE_TYPES.NEWS] = 'NEWS-';
    prefixes[KSP_AI_SOURCE_TYPES.INTERNAL_ASSESSMENT] = 'ASMT-';
    if (Object.keys(prefixes).some(function (type) {
      return type !== sourceType && sourceId.indexOf(prefixes[type]) === 0;
    })) {
      kspAssert_(false, 'AI_SYNC_SOURCE_TYPE_MISMATCH',
        'Exact AI sync source type does not match the source ID.');
    }
    var valid = sourceId.indexOf(prefixes[sourceType]) === 0 &&
      /^\d{6}$/.test(sourceId.slice(prefixes[sourceType].length));
    kspAssert_(valid,
      'AI_SYNC_SOURCE_ID_INVALID', 'Exact AI sync source ID is invalid.');
  }
  return { sourceType: sourceType, sourceId: sourceId };
}

function kspSelectProviderAiWorkItems_(meetingRows, pitchbookRows, nowIso, settings, provider, selection, newsRows, assessmentRows) {
  var normalizedSelection = kspNormalizeProviderAiSelection_(selection);
  var rowContext = { meetingRows: meetingRows || [], pitchbookRows: pitchbookRows || [],
    newsRows: newsRows || [], assessmentRows: assessmentRows || [] };
  if (normalizedSelection.sourceId) {
    var exactRows = kspAiSourceRows_(rowContext, normalizedSelection.sourceType);
    var exactItems = exactRows.map(function (row) {
      var item = kspAiWorkItemFromRow_(normalizedSelection.sourceType, row);
      item.retrievalEligible = normalizedSelection.sourceType !== KSP_AI_SOURCE_TYPES.PITCHBOOK ||
        kspIsParentBoundPitchbookEligible_(row, meetingRows);
      return item;
    }).filter(function (item) { return item.sourceId === normalizedSelection.sourceId; });
    kspAssert_(exactItems.length > 0, 'AI_SYNC_SOURCE_NOT_FOUND', 'Exact AI sync source was not found.');
    kspAssert_(exactItems.length === 1, 'AI_SYNC_SOURCE_AMBIGUOUS', 'Exact AI sync source is ambiguous.');
    return exactItems;
  }
  var items = [];
  KSP_AI_SOURCE_DEFINITIONS.forEach(function (definition) {
    if (normalizedSelection.sourceType && normalizedSelection.sourceType !== definition.id) return;
    kspAiSourceRows_(rowContext, definition.id).forEach(function (row) {
      var item = kspAiWorkItemFromRow_(definition.id, row);
      if (definition.id === KSP_AI_SOURCE_TYPES.PITCHBOOK) {
        item.retrievalEligible = kspIsParentBoundPitchbookEligible_(row, meetingRows);
      }
      if (kspIsProviderAiWorkEligible_(item, nowIso, settings, provider)) items.push(item);
    });
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

function kspBuildAiProviderStatePatch_(row, provider, patch) {
  var current = kspParseAiProviderState_(row && row.AI_Provider_State_JSON, row);
  var normalizedProvider = kspNormalizeAiProvider_(provider);
  kspAssert_(normalizedProvider, 'AI_PROVIDER_INVALID', 'AI provider is invalid.');
  var entry = kspNormalizeAiProviderEntry_(current[normalizedProvider]);
  Object.keys(patch || {}).forEach(function (key) {
    if (patch[key] !== undefined) entry[key] = patch[key];
  });
  current[normalizedProvider] = kspNormalizeAiProviderEntry_(entry);
  return current;
}

function kspNormalizeAiProvider_(value) {
  var normalized = kspAiTrim_(value).toUpperCase();
  return normalized === KSP_AI_PROVIDERS.OPENAI || normalized === KSP_AI_PROVIDERS.GEMINI ? normalized : '';
}

function kspNormalizeProviderAiSyncProviders_(value) {
  if (value === undefined) return [KSP_AI_PROVIDERS.OPENAI, KSP_AI_PROVIDERS.GEMINI];
  kspAssert_(Array.isArray(value) && value.length > 0, 'AI_PROVIDER_INVALID', 'AI provider is invalid.');
  var normalized = [];
  value.forEach(function (provider) {
    var normalizedProvider = kspNormalizeAiProvider_(provider);
    kspAssert_(normalizedProvider, 'AI_PROVIDER_INVALID', 'AI provider is invalid.');
    if (normalized.indexOf(normalizedProvider) === -1) normalized.push(normalizedProvider);
  });
  return normalized;
}

function kspBuildAiProviderConfig_(settings, provider) {
  var normalizedProvider = kspNormalizeAiProvider_(provider);
  kspAssert_(normalizedProvider, 'AI_PROVIDER_INVALID', 'AI provider is invalid.');
  var source = settings || {};
  if (normalizedProvider === KSP_AI_PROVIDERS.OPENAI) {
    return {
      provider: normalizedProvider,
      enabled: Boolean(source.openaiEnabled),
      vectorStoreId: kspAiTrim_(source.openaiVectorStoreId),
      modelId: kspAiTrim_(source.openaiModelId),
      credentialConfigured: false
    };
  }
  return {
    provider: normalizedProvider,
    enabled: Boolean(source.geminiEnabled),
    storeName: kspAiTrim_(source.geminiStoreName || source.storeName),
    modelId: kspAiTrim_(source.geminiModelId || source.modelId),
    readiness: kspAiTrim_(source.geminiReadiness || 'UNCONFIGURED').toUpperCase(),
    embeddingModel: kspAiTrim_(source.embeddingModel || KSP_AI_DEFAULTS.EMBEDDING_MODEL),
    queryTransport: KSP_AI_DEFAULTS.QUERY_TRANSPORT,
    credentialConfigured: false
  };
}

function kspBuildOpenAiAttributes_(source) {
  var value = source || {};
  var attributes = {};
  function add(key, item) {
    var normalized = kspAiTrim_(item);
    if (normalized) attributes[key] = normalized;
  }
  add('source_type', value.sourceType);
  add('source_id', value.sourceId);
  add('date_key', value.dateKey);
  add('entity_key', value.entityKey);
  add('counterparty_type', value.counterpartyType);
  add('counterparty_id', value.counterpartyId);
  add('gp_id', value.gpId);
  add('asset_class_id', value.assetClassId);
  add('capital_type_id', value.capitalTypeId);
  add('team_id', value.teamId);
  add('fund_strategy', value.fundStrategy);
  if (value.sourceType === KSP_AI_SOURCE_TYPES.MEETING) {
    attributes.follow_up_required = value.followUpRequired === true ? 'true' : 'false';
  }
  add('content_hash', value.contentHash);
  // Parent and related-GP context are carried by the existing entity fields and content hash.
  // Keep the provider's 16-attribute ceiling; do not add unbounded relationship attributes.
  return attributes;
}

function kspOpenAiAttributesEqual_(leftValue, rightValue) {
  var left = leftValue || {};
  var right = rightValue || {};
  var leftKeys = Object.keys(left).sort();
  var rightKeys = Object.keys(right).sort();
  if (leftKeys.length !== rightKeys.length) return false;
  for (var index = 0; index < leftKeys.length; index += 1) {
    var key = leftKeys[index];
    if (key !== rightKeys[index] || typeof left[key] !== typeof right[key] || left[key] !== right[key]) {
      return false;
    }
  }
  return true;
}

function kspKnowledgeProviderNeedsSourceIdAllowlist_(provider, request) {
  var filters = kspKnowledgeRequestFilters_(request);
  var sourceTypes = kspNormalizeKnowledgeSourceTypes_(request);
  var selectedEntities = request && Array.isArray(request.selectedEntityKeys)
    ? request.selectedEntityKeys : [];
  var hasSourceRecords = sourceTypes.indexOf(KSP_AI_SOURCE_TYPES.NEWS) !== -1 ||
    sourceTypes.indexOf(KSP_AI_SOURCE_TYPES.INTERNAL_ASSESSMENT) !== -1;
  // Provider metadata cannot prove a parent-bound Pitchbook is still linked.
  if (sourceTypes.indexOf(KSP_AI_SOURCE_TYPES.PITCHBOOK) !== -1) return true;
  if (filters.relatedGpId || filters.meetingTypeCode) return true;
  if (hasSourceRecords && (filters.entityKey || filters.gpId || filters.counterpartyType ||
      selectedEntities.length >= KSP_KNOWLEDGE_MULTI_ENTITY_MIN)) return true;
  // Gemini has neither a selected-Entity OR expression nor a stored false follow-up value.
  return provider === KSP_AI_PROVIDERS.GEMINI &&
    (selectedEntities.length >= KSP_KNOWLEDGE_MULTI_ENTITY_MIN ||
      filters.followUp === KSP_KNOWLEDGE_FOLLOW_UP_FILTERS.NOT_REQUIRED);
}

function kspBuildOpenAiFilter_(filters) {
  var request = filters || {};
  var input = kspKnowledgeRequestFilters_(request);
  var clauses = [];
  var sourceTypes = kspNormalizeKnowledgeSourceTypes_(request);
  var nestedFilters = request.filters && typeof request.filters === 'object' ? request.filters : {};
  var explicitSourceSelection = Object.prototype.hasOwnProperty.call(request, 'sourceTypes') ||
    Object.prototype.hasOwnProperty.call(nestedFilters, 'sourceTypes') ||
    Boolean(kspAiTrim_(request.sourceType || nestedFilters.sourceType));
  var sourceIdAllowlistRequired = request.advancedFilterResolved === true &&
    kspKnowledgeProviderNeedsSourceIdAllowlist_(KSP_AI_PROVIDERS.OPENAI, request);
  var authoritativeOnly = sourceIdAllowlistRequired &&
    sourceTypes.some(function (type) {
      return type === KSP_AI_SOURCE_TYPES.NEWS || type === KSP_AI_SOURCE_TYPES.INTERNAL_ASSESSMENT;
    });
  function add(operator, key, value) {
    var normalized = kspAiTrim_(value);
    if (normalized) clauses.push({ type: operator, key: key, value: normalized });
  }
  if (!authoritativeOnly) {
    add('gte', 'date_key', input.dateFrom);
    add('lte', 'date_key', input.dateTo);
    add('eq', 'counterparty_type', input.counterpartyType);
    add('eq', 'entity_key', input.entityKey);
    add('eq', 'gp_id', input.gpId);
    add('eq', 'asset_class_id', input.assetClassId);
    add('eq', 'capital_type_id', input.capitalTypeId);
    add('eq', 'team_id', input.teamId);
    add('eq', 'fund_strategy', input.fundStrategy);
    add('eq', 'follow_up_required', input.followUp === KSP_KNOWLEDGE_FOLLOW_UP_FILTERS.REQUIRED ? 'true' :
      (input.followUp === KSP_KNOWLEDGE_FOLLOW_UP_FILTERS.NOT_REQUIRED ? 'false' : ''));
  }
  if (explicitSourceSelection) {
    if (sourceTypes.length === 1) add('eq', 'source_type', sourceTypes[0]);
    else clauses.push({ type: 'or', filters: sourceTypes.map(function (type) {
      return { type: 'eq', key: 'source_type', value: type };
    }) });
  }
  add('eq', 'source_id', input.sourceId);
  var selectedEntityKeys = Array.isArray(request.selectedEntityKeys) ? request.selectedEntityKeys : [];
  if (!authoritativeOnly && selectedEntityKeys.length >= KSP_KNOWLEDGE_MULTI_ENTITY_MIN) {
    clauses.push({ type: 'or', filters: selectedEntityKeys.map(function (entityKey) {
      return { type: 'eq', key: 'entity_key', value: entityKey };
    }) });
  }
  var resolvedSourceIds = Array.isArray(request.resolvedSourceIds) ? request.resolvedSourceIds : [];
  if (sourceIdAllowlistRequired && resolvedSourceIds.length) {
    clauses.push(resolvedSourceIds.length === 1
      ? { type: 'eq', key: 'source_id', value: resolvedSourceIds[0] }
      : { type: 'or', filters: resolvedSourceIds.map(function (sourceId) {
        return { type: 'eq', key: 'source_id', value: sourceId };
      }) });
  }
  return clauses.length === 0 ? undefined : clauses.length === 1 ? clauses[0] : { type: 'and', filters: clauses };
}

function kspBuildCanonicalKnowledgeRequest_(rawInput) {
  var output = kspNormalizeCanonicalKnowledgeRequest_(rawInput);
  output.route = output.route || KSP_AI_ROUTES.OPENAI;
  output.provider = output.route === KSP_AI_ROUTES.FULL_EXPORT ? '' : kspNormalizeAiProvider_(output.route);
  return output;
}

function kspBuildProviderSearchRequest_(provider, config, input) {
  var normalizedProvider = kspNormalizeAiProvider_(provider);
  var value = input || {};
  kspAssert_(value.advancedFilterResolved !== true ||
    (Array.isArray(value.resolvedSourceIds) && value.resolvedSourceIds.length > 0),
    'AI_ADVANCED_FILTER_NO_EVIDENCE', '指定した条件に一致するActive資料はありません。');
  var sourceIdAllowlistRequired = value.advancedFilterResolved === true &&
    kspKnowledgeProviderNeedsSourceIdAllowlist_(normalizedProvider, value);
  if (sourceIdAllowlistRequired) {
    kspAssert_(value.resolvedSourceIds.length <= KSP_KNOWLEDGE_ADVANCED_SOURCE_ID_MAX,
      'AI_ADVANCED_FILTER_TOO_BROAD', '検索範囲を絞ってください。');
  }
  var promptInput = kspValidateCanonicalKnowledgeRequest_(kspNormalizeCanonicalKnowledgeRequest_(value));
  var prompt = kspBuildCanonicalKnowledgePrompt_(promptInput);
  if (normalizedProvider === KSP_AI_PROVIDERS.OPENAI) {
    var openAiRequest = {
      provider: normalizedProvider,
      model: config.modelId,
      vectorStoreId: config.vectorStoreId,
      input: prompt,
      filters: kspBuildOpenAiFilter_(value),
      thinkingProviderDefault: config.thinkingProviderDefault !== false,
      thinkingRawValue: config.thinkingRawValue
    };
    if (config.maxOutputTokens !== null && config.maxOutputTokens !== undefined) {
      openAiRequest.maxOutputTokens = config.maxOutputTokens;
    }
    return openAiRequest;
  }
  var geminiFilters = kspKnowledgeRequestFilters_(value);
  kspAssert_(value.advancedFilterResolved === true ||
    (!geminiFilters.counterpartyType && !geminiFilters.entityKey && !geminiFilters.teamId &&
      !geminiFilters.fundStrategy && !geminiFilters.followUp && !geminiFilters.relatedGpId &&
      !geminiFilters.meetingTypeCode && !(value.selectedEntityKeys || []).length),
    'AI_FILTER_UNSUPPORTED_PROVIDER', 'Geminiでは選択された構造化フィルターを利用できません。');
  return {
    provider: normalizedProvider,
    modelId: config.modelId,
    storeName: config.storeName,
    mode: promptInput.mode,
    questionOrInstruction: promptInput.questionOrInstruction,
    metadataFilter: [kspBuildMetadataFilter_(sourceIdAllowlistRequired ? value :
      Object.assign({}, value, { advancedFilterResolved: false })), sourceIdAllowlistRequired
      ? '(' + (value.resolvedSourceIds || []).map(function (id) {
        return 'source_id = "' + kspEscapeMetadataFilterString_(id) + '"';
      }).join(' OR ') + ')' : ''].filter(Boolean).join(' AND '),
    queryTransport: config.queryTransport || KSP_AI_QUERY_TRANSPORTS.INTERACTIONS,
    background: true,
    generation_config: (function () {
      var generation = {};
      if (config.thinkingRawValue) generation.thinking_level = config.thinkingRawValue;
      if (config.maxOutputTokens !== null && config.maxOutputTokens !== undefined) {
        generation.max_output_tokens = config.maxOutputTokens;
      }
      return generation;
    })()
  };
}

function kspProviderCitationMetadata_(citation) {
  var source = citation || {};
  var metadata = source.metadata || source.attributes || source.customMetadata || {};
  return kspMetadataArrayToMap_(metadata);
}

function kspOpenAiMetadataAgreement_(left, right) {
  var leftMetadata = kspMetadataArrayToMap_(left || {});
  var rightMetadata = kspMetadataArrayToMap_(right || {});
  return Object.keys(leftMetadata).every(function (key) {
    if (!Object.prototype.hasOwnProperty.call(rightMetadata, key)) return true;
    var leftValue = kspAiTrim_(leftMetadata[key]);
    var rightValue = kspAiTrim_(rightMetadata[key]);
    return !leftValue || !rightValue || leftValue === rightValue;
  });
}

function kspOpenAiCitationIdentity_(metadata) {
  var normalized = kspMetadataArrayToMap_(metadata || {});
  var sourceType = kspAiTrim_(normalized.source_type);
  var sourceId = kspAiTrim_(normalized.source_id);
  var contentHash = kspAiTrim_(normalized.content_hash);
  return {
    metadata: normalized,
    sourceType: sourceType,
    sourceId: sourceId,
    contentHash: contentHash,
    key: sourceType + '|' + sourceId + '|' + contentHash,
    complete: Boolean(sourceType && sourceId && contentHash)
  };
}

function kspNormalizeOpenAiResponse_(response) {
  var value = response || {};
  var answerParts = [];
  var citations = [];
  var normalizationWarnings = [];
  var warningSeen = {};
  var resultByFileId = {};
  var sourceFileIds = {};
  var ambiguousSourceKeys = {};
  var annotations = [];

  function warn(code) {
    if (warningSeen[code]) return;
    warningSeen[code] = true;
    normalizationWarnings.push({ code: code, message: 'OpenAI citation identity was excluded.' });
  }

  function registerSourceFile(identity, fileId) {
    if (!identity.complete) return;
    var ids = sourceFileIds[identity.key] || [];
    if (ids.indexOf(fileId) === -1) ids.push(fileId);
    sourceFileIds[identity.key] = ids;
    if (ids.length > 1) {
      ambiguousSourceKeys[identity.key] = true;
      warn('OPENAI_CITATION_IDENTITY_AMBIGUOUS');
    }
  }

  (value.output || []).forEach(function (item) {
    if (!item) return;
    if (String(item.type) === 'file_search_call') {
      if (kspAiTrim_(item.status).toLowerCase() !== 'completed') return;
      (item.results || item.search_results || []).forEach(function (result) {
        var fileId = kspAiTrim_(result && (result.file_id || result.fileId));
        if (!fileId) {
          warn('OPENAI_CITATION_IDENTITY_INVALID');
          return;
        }
        var metadata = kspProviderCitationMetadata_(result);
        var identity = kspOpenAiCitationIdentity_(metadata);
        var record = resultByFileId[fileId];
        if (!record) {
          resultByFileId[fileId] = {
            fileId: fileId,
            fileName: kspAiTrim_(result.filename || result.file_name || result.fileName),
            metadata: metadata,
            identity: identity,
            ambiguous: !identity.complete
          };
        } else if (!identity.complete || !record.identity.complete ||
            !kspOpenAiMetadataAgreement_(record.metadata, metadata) ||
            record.identity.key !== identity.key) {
          record.ambiguous = true;
          warn('OPENAI_CITATION_IDENTITY_CONFLICT');
        }
        registerSourceFile(identity, fileId);
      });
    }
    if (String(item.type) !== 'message') return;
    (item.content || []).forEach(function (block) {
      if (!block) return;
      if (block.text !== undefined && block.text !== null) answerParts.push(String(block.text));
      (block.annotations || []).forEach(function (annotation) {
        if (!annotation || (annotation.type && String(annotation.type) !== 'file_citation')) return;
        annotations.push(annotation);
      });
    });
  });
  var outputText = value.output_text;
  if (!answerParts.length && outputText) answerParts.push(String(outputText));

  var seen = {};
  var blockedFileIds = {};

  function addCitation(citation, identity, provenance) {
    if (!identity.complete || ambiguousSourceKeys[identity.key]) return;
    var key = provenance + '|' + citation.source + '|' + identity.key + '|' + String(citation.pageNumber || '');
    if (seen[key]) return;
    seen[key] = true;
    citation.metadata = identity.metadata;
    citations.push(citation);
  }

  annotations.forEach(function (annotation) {
    var fileId = kspAiTrim_(annotation.file_id || annotation.fileId);
    if (!fileId) {
      warn('OPENAI_CITATION_IDENTITY_INVALID');
      return;
    }
    var record = resultByFileId[fileId];
    var annotationMetadata = kspProviderCitationMetadata_(annotation);
    if (record && record.ambiguous) {
      blockedFileIds[fileId] = true;
      warn('OPENAI_CITATION_IDENTITY_AMBIGUOUS');
      return;
    }
    if (record && !kspOpenAiMetadataAgreement_(annotationMetadata, record.metadata)) {
      blockedFileIds[fileId] = true;
      warn('OPENAI_CITATION_IDENTITY_CONFLICT');
      return;
    }
    var mergedMetadata = {};
    Object.keys(record ? record.metadata : {}).forEach(function (key) { mergedMetadata[key] = record.metadata[key]; });
    Object.keys(annotationMetadata).forEach(function (key) { mergedMetadata[key] = annotationMetadata[key]; });
    var identity = kspOpenAiCitationIdentity_(mergedMetadata);
    if (!identity.complete) {
      blockedFileIds[fileId] = true;
      warn('OPENAI_CITATION_IDENTITY_INVALID');
      return;
    }
    if (record && record.identity.key !== identity.key) {
      blockedFileIds[fileId] = true;
      warn('OPENAI_CITATION_IDENTITY_CONFLICT');
      return;
    }
    addCitation({
      type: 'file_citation',
      provenance: 'INLINE_CITATION',
      fileName: kspAiTrim_(annotation.filename || annotation.file_name || annotation.fileName || (record && record.fileName)),
      source: fileId,
      pageNumber: Number(annotation.page_number || annotation.pageNumber || 0) || null,
      metadata: identity.metadata
    }, identity, 'INLINE_CITATION');
  });

  Object.keys(resultByFileId).forEach(function (fileId) {
    var record = resultByFileId[fileId];
    if (!record || record.ambiguous || blockedFileIds[fileId] || !record.identity.complete) return;
    addCitation({
      type: 'retrieved_source',
      provenance: 'RETRIEVED_SOURCE',
      fileName: record.fileName,
      source: fileId,
      pageNumber: null,
      metadata: record.identity.metadata
    }, record.identity, 'RETRIEVED_SOURCE');
  });

  return {
    answer: answerParts.join('\n').trim(),
    citations: citations,
    interactionId: kspAiTrim_(value.id),
    rawStatus: kspAiTrim_(value.status),
    warnings: normalizationWarnings
  };
}

function kspCreateProviderNeutralAiEnvironment_() {
  var base = kspCreateFeatureFreezeAiEnvironment_();
  base.getProviderConfig = function (provider) {
    var context = base.loadAiContext();
    var config = kspBuildAiProviderConfig_(kspNormalizeAiSettings_(context.settings), provider);
    if (config.provider === KSP_AI_PROVIDERS.OPENAI && config.enabled) {
      try {
        kspOpenAiApiKeyLive_();
        config.credentialConfigured = true;
      } catch (ignored) {
        config.credentialConfigured = false;
      }
    }
    if (config.provider === KSP_AI_PROVIDERS.GEMINI) {
      try {
        kspGeminiApiKeyLive_();
        config.credentialConfigured = true;
      } catch (ignoredGemini) {
        config.credentialConfigured = false;
      }
    }
    return config;
  };
  base.ensureProviderStore = function (provider, config) {
    if (provider === KSP_AI_PROVIDERS.OPENAI) {
      kspAssert_(config.vectorStoreId, 'OPENAI_VECTOR_STORE_NOT_CONFIGURED', 'ChatGPT Vector Storeが設定されていません。');
      var openAiStore = kspOpenAiGetVectorStoreLive_(config.vectorStoreId);
      return { name: String(openAiStore.id || config.vectorStoreId), displayName: String(openAiStore.name || '') };
    }
    return base.ensureFileSearchStore({
      storeName: config.storeName,
      embeddingModel: kspAiTrim_(config.embeddingModel || KSP_AI_DEFAULTS.EMBEDDING_MODEL)
    }, KSP_AI_DEFAULTS.STORE_DISPLAY_NAME);
  };
  base.isOpenAiCredentialConfigured = function () {
    try {
      kspOpenAiApiKeyLive_();
      return true;
    } catch (ignored) {
      return false;
    }
  };
  base.createOpenAiVectorStore = function (displayName) {
    return kspOpenAiCreateVectorStoreLive_(displayName);
  };
  base.getOpenAiVectorStore = function (vectorStoreId) {
    return kspOpenAiGetVectorStoreLive_(vectorStoreId);
  };
  base.writeAiSetting = function (key, value, nowIso) {
    var context = base.loadAiContext();
    return kspWriteSettingLive_(context.backendSpreadsheetId, key, String(value), nowIso || base.nowIso());
  };
  base.uploadProviderSource = function (provider, config, source) {
    return provider === KSP_AI_PROVIDERS.OPENAI
      ? kspOpenAiUploadSourceLive_(config.vectorStoreId, source)
      : base.uploadSourceToFileSearchStore(config.storeName, source);
  };
  base.readProviderDocument = function (provider, config, documentValue, source) {
    if (provider === KSP_AI_PROVIDERS.GEMINI) {
      return kspReadAndVerifyFileSearchDocumentLive_(documentValue.name, source);
    }
    return documentValue;
  };
  base.findProviderDocumentsBySource = function (provider, config, sourceType, sourceId) {
    return provider === KSP_AI_PROVIDERS.OPENAI
      ? kspOpenAiFindDocumentsBySourceLive_(config.vectorStoreId, sourceType, sourceId)
      : base.findFileSearchDocumentsBySource(config.storeName, sourceId);
  };
  base.deleteProviderDocument = function (provider, config, documentValue) {
    return provider === KSP_AI_PROVIDERS.OPENAI
      ? kspOpenAiDeleteDocumentLive_(config.vectorStoreId, documentValue)
      : base.deleteFileSearchDocument(config.storeName, documentValue.name);
  };
  base.isGeminiCredentialConfigured = function () {
    try {
      kspGeminiApiKeyLive_();
      return true;
    } catch (ignored) {
      return false;
    }
  };
  base.getGeminiFileSearchStore = function (storeName) {
    return base.getFileSearchStore(storeName);
  };
  base.updateProviderDocumentAttributes = function (provider, config, documentValue, attributes) {
    kspAssert_(provider === KSP_AI_PROVIDERS.OPENAI, 'AI_PROVIDER_UNSUPPORTED',
      'Provider document attributes cannot be updated for this provider.');
    return kspOpenAiUpdateVectorStoreFileAttributesLive_(config.vectorStoreId, documentValue, attributes);
  };
  base.queryProvider = function (provider, config, request) {
    if (provider === KSP_AI_PROVIDERS.OPENAI) return kspOpenAiQueryFileSearchLive_(request);
    if (config && config.queryTransport === KSP_AI_QUERY_TRANSPORTS.GENERATE_CONTENT) {
      return kspGeminiGenerateContentLive_(request);
    }
    return base.queryFileSearch(kspBuildFeatureFreezeInteractionRequest_(request));
  };
  base.startQueryProvider = function (provider, config, request) {
    return provider === KSP_AI_PROVIDERS.OPENAI
      ? { status: 'completed', response: kspOpenAiQueryFileSearchLive_(request) }
      : config && config.queryTransport === KSP_AI_QUERY_TRANSPORTS.GENERATE_CONTENT
        ? { status: 'completed', response: kspGeminiGenerateContentLive_(request) }
      : base.startQueryFileSearch(kspBuildFeatureFreezeInteractionRequest_(request));
  };
  base.pollQueryProvider = function (provider, config, interactionId) {
    kspAssert_(provider === KSP_AI_PROVIDERS.GEMINI, 'AI_QUERY_RESPONSE_INVALID', '検索状態を確認できませんでした。');
    return base.pollQueryFileSearch(interactionId);
  };
  base.updateAiProviderState = function (sourceType, sourceId, provider, patch, expected) {
    var context = base.loadAiContext();
    var sheetNames = {};
    sheetNames[KSP_AI_SOURCE_TYPES.MEETING] = KSP_SHEET_NAMES.MEETING_INDEX;
    sheetNames[KSP_AI_SOURCE_TYPES.PITCHBOOK] = KSP_SHEET_NAMES.PITCHBOOK_INDEX;
    sheetNames[KSP_AI_SOURCE_TYPES.NEWS] = KSP_SHEET_NAMES.NEWS_INDEX;
    sheetNames[KSP_AI_SOURCE_TYPES.INTERNAL_ASSESSMENT] = KSP_SHEET_NAMES.INTERNAL_ASSESSMENT_INDEX;
    var sheetName = sheetNames[sourceType];
    var key = kspAiSourceRowKey_(sourceType);
    kspAssert_(sheetName, 'AI_SYNC_SOURCE_TYPE_INVALID', 'AI sync source type is invalid.');
    if (expected) {
      return kspUpdateRowPatchLive_(context.backendSpreadsheetId,
        sheetName, key, sourceId,
        function (current) {
          var next = kspBuildAiProviderStatePatch_(current, provider, patch);
          var delta = { AI_Provider_State_JSON: kspSerializeAiProviderState_(next) };
          if (provider === KSP_AI_PROVIDERS.GEMINI) {
            delta.AI_Document_Name = next.GEMINI.documentName; delta.AI_Index_Status = next.GEMINI.status;
            delta.AI_Indexed_At = next.GEMINI.indexedAt; delta.AI_Content_Hash = next.GEMINI.contentHash;
            delta.AI_Last_Error = next.GEMINI.lastError;
          }
          return delta;
        }, expected);
    }
    var rows = kspAiSourceRows_(context, sourceType);
    var row = (rows || []).filter(function (item) { return String(item[key] || '') === String(sourceId); })[0];
    kspAssert_(row, 'AI_SOURCE_ROW_NOT_FOUND', 'AI source rowが見つかりません。');
    var state = kspBuildAiProviderStatePatch_(row, provider, patch);
    var rowPatch = { AI_Provider_State_JSON: kspSerializeAiProviderState_(state) };
    if (provider === KSP_AI_PROVIDERS.GEMINI) {
      rowPatch.AI_Document_Name = String(state.GEMINI.documentName || '');
      rowPatch.AI_Index_Status = String(state.GEMINI.status || KSP_AI_INDEX_STATUS.NOT_INDEXED);
      rowPatch.AI_Indexed_At = String(state.GEMINI.indexedAt || '');
      rowPatch.AI_Content_Hash = String(state.GEMINI.contentHash || '');
      rowPatch.AI_Last_Error = String(state.GEMINI.lastError || '');
    }
    return base.updateAiRow(sourceType, sourceId, rowPatch);
  };
  return base;
}

function kspProviderConfigurationError_(provider, config) {
  var prefix = provider === KSP_AI_PROVIDERS.OPENAI ? 'OPENAI' : 'GEMINI';
  if (!config || !config.enabled) {
    var disabled = new Error(prefix + ' provider is disabled by configuration.');
    disabled.code = prefix + '_DISABLED_BY_CONFIG';
    disabled.provider = provider;
    throw disabled;
  }
  if (provider === KSP_AI_PROVIDERS.OPENAI && (!config.vectorStoreId || !config.modelId || config.credentialConfigured === false)) {
    var openai = new Error('OPENAI provider is not configured.');
    openai.code = 'OPENAI_NOT_CONFIGURED';
    openai.provider = provider;
    throw openai;
  }
  if (provider === KSP_AI_PROVIDERS.GEMINI && (!config.modelId || config.credentialConfigured === false)) {
    var gemini = new Error('GEMINI provider is not configured.');
    gemini.code = 'GEMINI_NOT_CONFIGURED';
    gemini.provider = provider;
    throw gemini;
  }
}

function kspProviderSafeMessage_(code) {
  var messages = {
    OPENAI_DISABLED_BY_CONFIG: 'ChatGPT検索は管理者設定で無効です。',
    OPENAI_NOT_CONFIGURED: 'ChatGPT検索の設定が未完了です。',
    OPENAI_CREDENTIALS_UNAVAILABLE: 'ChatGPT検索の設定を確認できません。',
    OPENAI_VECTOR_STORE_NOT_CONFIGURED: 'ChatGPT検索の設定が未完了です。',
    GEMINI_DISABLED_BY_CONFIG: 'Gemini検索は管理者設定で無効です。',
    GEMINI_NOT_CONFIGURED: 'Gemini検索の設定が未完了です。',
    GEMINI_CREDENTIALS_UNAVAILABLE: 'Gemini検索の設定を確認できません。',
    AI_QUERY_HTTP_FAILED: 'Gemini検索サービスを利用できません。',
    AI_QUERY_RESPONSE_INVALID: 'Geminiの検索結果を読み込めませんでした。',
    AI_QUERY_PROVIDER_TERMINAL: 'Gemini検索が完了できない状態になりました。',
    AI_QUERY_ASYNC_REQUIRED: 'Gemini検索は後続の確認が必要です。',
    AI_QUERY_TOKEN_INVALID: '検索の進行状況を読み込めませんでした。',
    AI_QUERY_TOKEN_EXPIRED: '検索状態の有効期限が切れています。',
    AI_QUERY_STATE_UNAVAILABLE: '検索状態を保存できませんでした。',
    AI_CITED_SOURCE_UNAVAILABLE: '参照元のファイルが見つからないか、開くことができないため、検索結果を表示できません。Google Drive上の原本を確認してください。',
    AI_DOCUMENT_READBACK_FAILED: 'Geminiの検索資料を読み込めませんでした。',
    AI_PROVIDER_INVALID: '検索サービスの設定を確認してください。',
    AI_MODEL_POLICY_RAW_VALUE_REJECTED: '選択したモデル設定を確認してください。',
    AI_MODEL_SELECTION_STALE: '選択したモデルは現在利用できません。設定を読み直してください。',
    AI_MODEL_PROFILE_PROVIDER_MISMATCH: '選択したモデルと検索サービスが一致しません。',
    AI_MODEL_PROFILE_DISABLED: '選択したモデルは管理者設定で利用できません。',
    AI_MODEL_PROFILE_INACCESSIBLE: '選択したモデルは現在のプロジェクトでは利用できません。',
    AI_MODEL_PROFILE_UNQUALIFIED: '選択したモデルはナレッジ検索で利用確認されていません。',
    AI_THINKING_SELECTION_STALE: '選択した思考レベルは現在利用できません。設定を読み直してください。',
    AI_THINKING_PROFILE_DISABLED: '選択した思考レベルは管理者設定で利用できません。',
    AI_THINKING_PROFILE_UNQUALIFIED: '選択した思考レベルはナレッジ検索で利用確認されていません。',
    AI_COUNTERPARTY_TYPE_FILTER_UNAVAILABLE: '選択した面談先種別は利用できません。',
    AI_ENTITY_FILTER_INVALID: '面談先の指定を確認してください。',
    AI_ENTITY_FILTER_UNAVAILABLE: '選択した面談先は利用できません。',
    AI_ENTITY_TYPE_CONFLICT: '面談先の種別が一致しません。',
    AI_ENTITY_GP_CONFLICT: '面談先とGPの指定が一致しません。',
    AI_TEAM_FILTER_UNAVAILABLE: '選択されたチームは利用できません。',
    AI_FUND_STRATEGY_FILTER_UNAVAILABLE: '選択されたFund / Strategyは利用できません。',
    AI_FILTER_SOURCE_TYPE_INCOMPATIBLE: 'チームとMTG種別は「面談記録のみ」で利用できます。',
    AI_FILTER_UNSUPPORTED_PROVIDER: '選択した条件はこの検索サービスでは利用できません。',
    AI_MULTI_ENTITY_COUNT_INVALID: '比較する面談先を2–5件選択してください。',
    AI_MULTI_ENTITY_DUPLICATE: '同じ面談先を複数回選択できません。',
    AI_MULTI_ENTITY_MODE_REQUIRED: '面談先の複数選択は比較モードで利用できます。',
    AI_MULTI_ENTITY_AMBIGUOUS_SCOPE: '複数の面談先と単一の面談先を同時に指定できません。',
    AI_RELATED_GP_FILTER_UNAVAILABLE: '旧形式の検索条件は利用できません。',
    AI_MEETING_TYPE_FILTER_UNAVAILABLE: '選択されたMTG種別は利用できません。',
    AI_ADVANCED_FILTER_TOO_BROAD: '該当する面談記録が多すぎます。条件を絞ってください。',
    AI_MEETING_PREP_TARGET_REQUIRED: '面談準備では面談先を選択してください。',
    AI_MODEL_POLICY_INVALID: 'モデル設定を読み込めませんでした。',
    AI_MODEL_POLICY_JSON_INVALID: 'モデル設定を読み込めませんでした。',
    AI_MODEL_POLICY_SCHEMA_UNSUPPORTED: 'モデル設定を読み込めませんでした。'
  };
  return messages[String(code || '')] || '';
}

function kspKnowledgeQueryPhase_(rawInput) {
  var input = rawInput && typeof rawInput === 'object' ? rawInput : {};
  kspAssert_(!kspAiTrim_(input.interactionId),
    'AI_QUERY_RESPONSE_INVALID', '検索状態を確認できませんでした。');
  var explicit = kspAiTrim_(input.queryPhase || input.queryAction || input.lifecycle).toUpperCase();
  var phase = explicit || (kspAiTrim_(input.queryToken) ? 'POLL' : 'START');
  kspAssert_(phase === 'START' || phase === 'POLL', 'AI_QUERY_RESPONSE_INVALID', '検索状態を確認できませんでした。');
  return phase;
}

function kspKnowledgeQueryCacheKey_(actor, token) {
  return kspBuildPublicOperationCacheKey_('KNOWLEDGE_QUERY_PENDING', actor, token);
}

function kspKnowledgeQueryDedupeKey_(actor, fingerprint) {
  return kspBuildPublicOperationCacheKey_('KNOWLEDGE_QUERY_DEDUPE', actor, fingerprint);
}

function kspCreateKnowledgeQueryToken_() {
  kspAssert_(typeof Utilities !== 'undefined' && Utilities && typeof Utilities.getUuid === 'function',
    'AI_QUERY_STATE_UNAVAILABLE', '検索状態を保存できませんでした。');
  var token = kspAiTrim_(Utilities.getUuid());
  kspAssert_(token && token.length <= 128, 'AI_QUERY_STATE_UNAVAILABLE', '検索状態を保存できませんでした。');
  return token;
}

function kspKnowledgeQueryKnownTerminalStatus_(status) {
  return ['failed', 'cancelled', 'requires_action', 'incomplete', 'budget_exceeded']
    .indexOf(String(status || '').toLowerCase()) !== -1;
}

function kspKnowledgeQueryPendingStatus_(status) {
  return status === 'queued' || status === 'in_progress';
}

function kspKnowledgeQueryPollDelayMillis_(pollCount) {
  var count = Math.max(0, Number(pollCount || 0));
  return Math.min(30000, Math.max(1000, 1000 * Math.pow(2, Math.min(4, count))));
}

function kspKnowledgeQueryNowMillis_(environment) {
  var value = typeof environment.nowIso === 'function' ? environment.nowIso() : new Date().toISOString();
  var millis = Date.parse(String(value || ''));
  return Number.isFinite(millis) ? millis : Date.now();
}

function kspKnowledgeQueryElapsedMillis_(environment, state) {
  var startedMillis = Date.parse(String(state && (state.startedAt || state.createdAt) || ''));
  return Number.isFinite(startedMillis)
    ? Math.max(0, kspKnowledgeQueryNowMillis_(environment) - startedMillis)
    : 0;
}

function kspKnowledgeQueryExpires_(environment, state) {
  var expiresAt = Date.parse(String(state && state.expiresAt || ''));
  if (!Number.isFinite(expiresAt)) return false;
  var nowValue = typeof environment.nowIso === 'function' ? environment.nowIso() : new Date().toISOString();
  var now = Date.parse(String(nowValue || ''));
  return Number.isFinite(now) && now >= expiresAt;
}

function kspKnowledgeQueryInputForState_(input) {
  var value = kspNormalizeCanonicalKnowledgeRequest_(input);
  return {
    mode: kspAiTrim_(value.mode),
    sourceTypes: value.sourceTypes.slice(),
    filters: kspKnowledgeRequestFilters_(value),
    selectedEntityKeys: (value.selectedEntityKeys || []).slice(),
    resolvedSourceIds: (value.resolvedSourceIds || []).slice(),
    advancedFilterResolved: value.advancedFilterResolved === true,
    modelProfileId: kspAiTrim_(value.modelProfileId).toLowerCase(),
    thinkingProfileId: kspAiTrim_(value.thinkingProfileId).toLowerCase()
  };
}

function kspKnowledgeQueryQuestionHash_(question) {
  var value = String(question || '');
  return typeof kspAiHashTextFallback_ === 'function'
    ? kspAiHashTextFallback_(value)
    : kspPublicOperationHash_(value) + '-' + value.length;
}

function kspKnowledgeQueryFingerprint_(provider, config, input) {
  var value = input || {};
  var filters = kspKnowledgeRequestFilters_(value);
  var payload = {
    provider: provider,
    model: kspAiTrim_(config && config.modelId),
    modelProfileId: kspAiTrim_(config && config.modelProfileId),
    thinkingProfileId: kspAiTrim_(config && config.thinkingProfileId),
    thinkingValue: config && config.thinkingProviderDefault ? 'PROVIDER_DEFAULT' : kspAiTrim_(config && config.thinkingRawValue),
    maxOutputTokens: config && config.maxOutputTokens !== undefined ? config.maxOutputTokens : null,
    profile: KSP_AI_DEFAULTS.QUERY_REQUEST_PROFILE_VERSION,
    mode: kspAiTrim_(value.mode),
    sourceTypes: kspNormalizeKnowledgeSourceTypes_(value),
    filters: filters,
    selectedEntityKeys: (value.selectedEntityKeys || []).slice(),
    resolvedSourceIds: (value.resolvedSourceIds || []).slice(),
    advancedFilterResolved: value.advancedFilterResolved === true,
    questionHash: kspKnowledgeQueryQuestionHash_(value.questionOrInstruction)
  };
  var serialized = JSON.stringify(payload);
  return typeof kspAiHashTextFallback_ === 'function'
    ? kspAiHashTextFallback_(serialized)
    : kspPublicOperationHash_(serialized);
}

function kspKnowledgeQueryReadCache_(environment, cacheKey) {
  if (!environment || typeof environment.getPublicIdempotency !== 'function') return null;
  try {
    return environment.getPublicIdempotency(cacheKey);
  } catch (ignored) {
    return null;
  }
}

function kspKnowledgeQueryWriteCache_(environment, cacheKey, value, expirationSeconds) {
  kspAssert_(environment && typeof environment.setPublicIdempotency === 'function',
    'AI_QUERY_STATE_UNAVAILABLE', '検索状態を保存できませんでした。');
  environment.setPublicIdempotency(cacheKey, value, expirationSeconds);
}

function kspKnowledgeQueryPendingState_(environment, actor, provider, token, fingerprint, lifecycle, input, config, startedAt, startLatencyMs) {
  var createdMillis = Date.parse(String(startedAt || ''));
  var expiresAt = Number.isFinite(createdMillis)
    ? new Date(createdMillis + KSP_AI_DEFAULTS.QUERY_PENDING_TTL_SECONDS * 1000).toISOString()
    : '';
  var status = kspAiTrim_(lifecycle && lifecycle.status).toLowerCase();
  var state = {
    schemaVersion: 2,
    kind: 'PENDING',
    actor: actor,
    provider: provider,
    tokenFingerprint: typeof kspAiHashTextFallback_ === 'function'
      ? kspAiHashTextFallback_(token)
      : kspPublicOperationHash_(token),
    requestFingerprint: fingerprint,
    interactionId: String(lifecycle.interactionId),
    input: kspKnowledgeQueryInputForState_(input),
    questionHash: kspKnowledgeQueryQuestionHash_(input.questionOrInstruction),
    modelId: kspAiTrim_(config && config.modelId),
    modelProfileId: kspAiTrim_(config && config.modelProfileId),
    thinkingProfileId: kspAiTrim_(config && config.thinkingProfileId),
    requestProfileVersion: KSP_AI_DEFAULTS.QUERY_REQUEST_PROFILE_VERSION,
    providerStatus: kspKnowledgeQueryPendingStatus_(status) ? status : 'in_progress',
    createdAt: startedAt,
    startedAt: startedAt,
    expiresAt: expiresAt,
    startLatencyMs: Math.max(0, Number(startLatencyMs) || 0),
    pollCount: 0,
    maxPollLatencyMs: 0
  };
  kspKnowledgeQueryWriteCache_(environment, kspKnowledgeQueryCacheKey_(actor, token), state,
    KSP_AI_DEFAULTS.QUERY_PENDING_TTL_SECONDS);
  kspKnowledgeQueryWriteCache_(environment, kspKnowledgeQueryDedupeKey_(actor, fingerprint), {
    schemaVersion: 1,
    kind: 'PENDING_POINTER',
    actor: actor,
    provider: provider,
    requestFingerprint: fingerprint,
    token: token
  }, KSP_AI_DEFAULTS.QUERY_PENDING_TTL_SECONDS);
  return state;
}

function kspKnowledgeQueryPendingResult_(provider, mode, token, warnings, state, environment) {
  var pollCount = Number(state && state.pollCount || 0);
  var elapsedMillis = state && environment ? kspKnowledgeQueryElapsedMillis_(environment, state) :
    Math.max(0, Number(state && state.elapsedMillis || 0));
  return {
    ok: true, workId: '0021', provider: provider, mode: mode,
    status: 'pending', pending: true, queryToken: token,
    pollAfterMillis: kspKnowledgeQueryPollDelayMillis_(pollCount),
    pollCount: pollCount,
    elapsedMillis: elapsedMillis,
    longRunning: elapsedMillis >= 60000,
    warnings: warnings || []
  };
}

function kspKnowledgeQueryFailureResult_(provider, mode, error, warnings, pending, token) {
  var code = kspGetErrorCode_(error);
  if (pending) {
    return {
      ok: true, workId: '0021', provider: provider, mode: mode,
      status: 'pending', pending: true, queryToken: token,
      pollAfterMillis: KSP_AI_DEFAULTS.INTERACTION_POLL_MILLIS,
      warnings: (warnings || []).concat([{ code: 'AI_QUERY_POLL_PENDING', message: '検索状態を確認できないため、再確認できます。' }])
    };
  }
  var result = {
    ok: false, workId: '0021', provider: provider, mode: mode,
    status: 'failed',
    error: { code: code, message: kspProviderSafeMessage_(code) || kspSafePublicErrorMessage_(code, 'SEARCH') },
    warnings: warnings || []
  };
  if (code === 'AI_CITED_SOURCE_UNAVAILABLE' && error && /^(?:MTG|DOC)-[A-Za-z0-9_-]{1,80}$/.test(String(error.sourceId || ''))) {
    result.error.message = '参照元のファイルが見つからないか、開くことができないため、検索結果を表示できません。対象ID: ' + error.sourceId + '。Google Drive上の原本を確認してください。';
  }
  var terminalStatus = kspAiTrim_(error && error.providerStatus).toLowerCase();
  if (kspKnowledgeQueryKnownTerminalStatus_(terminalStatus)) {
    result.terminalStatus = terminalStatus;
  }
  return result;
}

function kspAppendKnowledgeQueryAuditOnce_(environment, actor, token, auditSpreadsheetId, row, warnings) {
  if (token && typeof environment.claimPublicOperation === 'function' &&
      !kspClaimPublicOperation_(environment, 'KNOWLEDGE_QUERY_AUDIT', actor, token,
        KSP_AI_DEFAULTS.QUERY_TERMINAL_TTL_SECONDS)) return;
  kspTryAppendKnowledgeAudit_(environment, auditSpreadsheetId, row, warnings);
}

function kspKnowledgeQueryAuditTargetId_(token) {
  var value = kspAiTrim_(token);
  return value ? 'AIQ-' + kspPublicOperationHash_(value) : '';
}

function kspBuildSafeKnowledgeQueryTelemetry_(state, providerStatus, response, extra) {
  var options = extra || {};
  var selection = options.modelSelection || {};
  var output = { request_profile_version: KSP_AI_DEFAULTS.QUERY_REQUEST_PROFILE_VERSION };
  if (selection.modelProfileId || selection.profileId) {
    output.model_profile_id = selection.modelProfileId || selection.profileId;
  }
  if (selection.modelId) output.effective_model_id = selection.modelId;
  if (selection.thinkingProfileId) output.thinking_profile_id = selection.thinkingProfileId;
  if (selection.thinkingProviderDefault === true) output.thinking_mode = 'PROVIDER_DEFAULT';
  else if (selection.thinkingRawValue) output.thinking_level = selection.thinkingRawValue;
  if (selection.maxOutputTokens !== null && selection.maxOutputTokens !== undefined) {
    output.max_output_tokens = selection.maxOutputTokens;
  }
  var queryTransport = kspAiTrim_(options.queryTransport || (state && state.queryTransport));
  if (queryTransport === KSP_AI_QUERY_TRANSPORTS.GENERATE_CONTENT ||
      queryTransport === KSP_AI_QUERY_TRANSPORTS.INTERACTIONS) {
    output.query_transport = queryTransport;
    output.query_transport_version = KSP_AI_DEFAULTS.QUERY_TRANSPORT_VERSION;
  }
  var safeStatuses = ['queued', 'in_progress', 'completed', 'failed', 'cancelled',
    'requires_action', 'incomplete', 'budget_exceeded'];
  var status = kspAiTrim_(providerStatus).toLowerCase();
  if (safeStatuses.indexOf(status) !== -1) output.provider_status = status;
  function safeNumber(value) {
    var numberValue = Number(value);
    return Number.isFinite(numberValue) && numberValue >= 0 ? Math.floor(numberValue) : null;
  }
  function firstNumber(source, names) {
    var value = source || {};
    for (var index = 0; index < names.length; index += 1) {
      var numberValue = safeNumber(value[names[index]]);
      if (numberValue !== null) return numberValue;
    }
    return null;
  }
  var current = state || {};
  var usage = response && (response.usage || response.usageMetadata) || {};
  var startLatency = safeNumber(options.startLatencyMs !== undefined ? options.startLatencyMs : current.startLatencyMs);
  var pollCount = safeNumber(options.pollCount !== undefined ? options.pollCount : current.pollCount);
  var maxPollLatency = safeNumber(options.maxPollLatencyMs !== undefined ? options.maxPollLatencyMs : current.maxPollLatencyMs);
  var startedMillis = Date.parse(String(current.startedAt || current.createdAt || ''));
  var providerElapsed = safeNumber(options.providerElapsedMs);
  if (providerElapsed === null && Number.isFinite(startedMillis)) providerElapsed = Math.max(0, Date.now() - startedMillis);
  if (startLatency !== null) output.start_latency_ms = startLatency;
  if (pollCount !== null) output.poll_count = pollCount;
  if (maxPollLatency !== null) output.max_poll_latency_ms = maxPollLatency;
  if (providerElapsed !== null) output.provider_elapsed_ms = providerElapsed;
  var usageFields = {
    input_tokens: ['input_tokens', 'inputTokens', 'prompt_token_count', 'promptTokenCount'],
    output_tokens: ['output_tokens', 'outputTokens', 'candidates_token_count', 'candidatesTokenCount'],
    thought_tokens: ['thought_tokens', 'thoughtTokens', 'thoughts_token_count', 'thoughtsTokenCount'],
    tool_use_tokens: ['tool_use_tokens', 'toolUseTokens', 'tool_use_token_count', 'toolUseTokenCount',
      'tool_use_prompt_token_count', 'toolUsePromptTokenCount'],
    cached_tokens: ['cached_tokens', 'cachedTokens', 'cached_content_token_count', 'cachedContentTokenCount']
  };
  Object.keys(usageFields).forEach(function (key) {
    var numberValue = firstNumber(usage, usageFields[key]);
    if (numberValue !== null) output[key] = numberValue;
  });
  var providerHttpStatus = safeNumber(response && response.__kspHttpStatus);
  if (providerHttpStatus !== null && providerHttpStatus >= 100 && providerHttpStatus <= 599) {
    output.provider_http_status = providerHttpStatus;
  }
  var finishReason = response && response.candidates && response.candidates[0]
    ? kspAiTrim_(response.candidates[0].finishReason || response.candidates[0].finish_reason)
    : '';
  if (/^[A-Z][A-Z0-9_]{0,63}$/.test(finishReason)) output.finish_reason = finishReason;
  if (queryTransport === KSP_AI_QUERY_TRANSPORTS.GENERATE_CONTENT && startLatency !== null) {
    output.server_latency_ms = startLatency;
  }
  return output;
}

function kspBuildSafeKnowledgeQueryTelemetryJson_(telemetry) {
  if (!telemetry || typeof telemetry !== 'object') return '';
  return JSON.stringify(kspBuildSafeKnowledgeQueryTelemetry_(
    telemetry.state, telemetry.providerStatus, telemetry.response, telemetry
  ));
}

function kspBuildProviderKnowledgeSearchSuccess_(environment, provider, input, config, context, actor, rawResponse, warnings, auditToken, telemetry) {
  context = environment.loadAiContext();
  var parsed = provider === KSP_AI_PROVIDERS.OPENAI
    ? kspNormalizeOpenAiResponse_(rawResponse)
    : config && config.queryTransport === KSP_AI_QUERY_TRANSPORTS.GENERATE_CONTENT
      ? kspNormalizeGeminiGenerateContentResponse_(rawResponse)
      : kspParseInteractionResponse_(rawResponse);
  var sourceMaps = kspBuildAuthoritativeSourceMaps_(context.meetingRows, context.pitchbookRows,
    context.newsRows, context.assessmentRows);
  var strictGemini = provider === KSP_AI_PROVIDERS.GEMINI &&
    (!config || config.queryTransport !== KSP_AI_QUERY_TRANSPORTS.GENERATE_CONTENT);
  var mapped = strictGemini
    ? kspResolveGeminiKnowledgeCitations_(parsed.citations, sourceMaps, {
      environment: environment,
      config: config,
      storeName: config && config.storeName,
      scope: input
    })
    : kspMapKnowledgeCitations_(parsed.citations, sourceMaps, input);
  var catalog = kspBuildKnowledgeSearchCatalog_(kspContextCounterpartyRows_(context), context.optionRows,
    context.meetingRows, context.pitchbookRows, context.newsRows, context.assessmentRows);
  var guarded = kspGuardKnowledgeComparisonCitations_(input, catalog, mapped.citations);
  kspValidateCitedDriveSources_(environment, context, guarded.citations);
  var allWarnings = (warnings || []).concat(parsed.warnings || [], mapped.warnings, guarded.warnings);
  var answer = parsed.answer || '確認できる根拠が不足しています。';
  if (mapped.warnings.length) answer = '出典の最新状態を確認できないため、回答を表示できません。';
  if (guarded.rejectedUnselected) {
    answer = '選択していない面談先の資料が含まれるため、比較結果を表示できません。';
  }
  var insufficientEvidence = !parsed.answer || guarded.citations.length === 0 || guarded.rejectedUnselected === true || mapped.warnings.length > 0;
  if (insufficientEvidence) allWarnings.push({ code: 'AI_INSUFFICIENT_EVIDENCE', message: '回答または根拠となる資料が不足しています。' });
  kspAppendKnowledgeQueryAuditOnce_(environment, actor, auditToken, context.auditSpreadsheetId, kspBuildKnowledgeSearchAuditRow_({
    timestamp: environment.nowIso(), actor: actor, input: input, modelId: config.modelId,
    interactionId: kspKnowledgeQueryAuditTargetId_(auditToken), result: KSP_AUDIT_RESULTS.SUCCESS, citations: guarded.citations,
    entityEvidence: guarded.entityEvidence,
    provider: provider, telemetry: Object.assign({}, telemetry || {}, { modelSelection: config })
  }), allWarnings);
  return {
    result: {
      ok: true, workId: '0021', provider: provider, mode: input.mode, status: 'completed',
      answer: answer, citations: guarded.citations, entityEvidence: guarded.entityEvidence,
      insufficientEvidence: insufficientEvidence,
      selectedEntities: guarded.entityEvidence.map(function (item) {
        return { entityKey: item.entityKey, counterpartyType: item.counterpartyType, displayName: item.displayName };
      }),
      scopeSummary: kspKnowledgeScopeSummary_(input),
      effectiveSelection: {
        modelProfileId: config.modelProfileId || '',
        thinkingProfileId: config.thinkingProfileId || '',
        modelId: config.modelId || ''
      },
      warnings: allWarnings
    },
    interactionId: parsed.interactionId,
    sourceIdentity: kspKnowledgeResultSourceIdentity_(context, { citations: guarded.citations })
  };
}

function kspStoreKnowledgeQueryTerminal_(environment, actor, token, provider, result, sourceIdentity) {
  kspAssert_(typeof environment.setPublicIdempotency === 'function',
    'AI_QUERY_STATE_UNAVAILABLE', '検索状態を保存できませんでした。');
  environment.setPublicIdempotency(kspKnowledgeQueryCacheKey_(actor, token), {
    schemaVersion: 2, kind: 'TERMINAL', actor: actor, provider: provider,
    result: kspDeepClone_(result),
    sourceIdentity: sourceIdentity || kspKnowledgeResultSourceIdentity_(environment.loadAiContext(), result)
  }, KSP_AI_DEFAULTS.QUERY_TERMINAL_TTL_SECONDS);
}

function kspKnowledgeResultSourceIdentity_(context, result) {
  var maps = kspBuildAuthoritativeSourceMaps_(context.meetingRows, context.pitchbookRows,
    context.newsRows, context.assessmentRows);
  return JSON.stringify((result.citations || []).map(function (citation) {
    var source = maps.bySourceKey[kspAiSourceKey_(citation.sourceType, citation.sourceId)];
    return source && source.status === KSP_STATUS.ACTIVE && source.retrievalEligible !== false ? source : null;
  }));
}

function kspValidateCitedDriveSources_(environment, context, citations) {
  if (!(citations || []).length) return;
  var maps = kspBuildAuthoritativeSourceMaps_(context.meetingRows, context.pitchbookRows,
    context.newsRows, context.assessmentRows);
  var resources = context.state && context.state.resources ? context.state.resources : {};
  var checked = {};
  (citations || []).forEach(function (citation) {
    var key = kspAiSourceKey_(citation.sourceType, citation.sourceId);
    if (checked[key]) return;
    checked[key] = true;
    var source = maps.bySourceKey[key];
    var folderKeys = {};
    folderKeys[KSP_AI_SOURCE_TYPES.MEETING] = KSP_RESOURCE_KEYS.MEETING_RECORDS;
    folderKeys[KSP_AI_SOURCE_TYPES.PITCHBOOK] = KSP_RESOURCE_KEYS.PITCHBOOKS;
    folderKeys[KSP_AI_SOURCE_TYPES.NEWS] = KSP_RESOURCE_KEYS.NEWS;
    folderKeys[KSP_AI_SOURCE_TYPES.INTERNAL_ASSESSMENT] = KSP_RESOURCE_KEYS.INTERNAL_ASSESSMENTS;
    var expectedFolderId = resources[folderKeys[citation.sourceType]];
    var valid = Boolean(source && source.fileId && source.driveUrl &&
      kspKnowledgeExportUrlMatchesId_(source.driveUrl, source.fileId) &&
      typeof environment.getDriveFileMetadata === 'function');
    if (valid) {
      try {
        var file = environment.getDriveFileMetadata(source.fileId);
        valid = Boolean(file && file.id === source.fileId && !file.trashed &&
          ((citation.sourceType !== KSP_AI_SOURCE_TYPES.MEETING &&
            source.inputMode !== 'DIRECT_TEXT') ||
            file.mimeType === 'application/vnd.google-apps.document') &&
          (!expectedFolderId || (file.parents || []).indexOf(expectedFolderId) !== -1));
      } catch (error) {
        valid = false;
      }
    }
    if (!valid) {
      var unavailable = new Error('Cited Drive source is unavailable.');
      unavailable.code = 'AI_CITED_SOURCE_UNAVAILABLE';
      unavailable.sourceId = String(citation.sourceId || '');
      unavailable.queryTerminal = true;
      throw unavailable;
    }
  });
}

function kspRevalidateKnowledgeReplay_(environment, state) {
  var replay = kspDeepClone_(state.result);
  if ((replay.citations || []).length) {
    var context = environment.loadAiContext();
    var identity = kspKnowledgeResultSourceIdentity_(context, replay);
    kspAssert_(state.sourceIdentity && state.sourceIdentity === identity &&
      JSON.parse(identity).every(function (source) { return source !== null; }),
      'AI_QUERY_SOURCE_CHANGED', '出典が変更されたため検索をやり直してください。');
    kspValidateCitedDriveSources_(environment, context, replay.citations);
  }
  replay.idempotentReplay = true;
  return replay;
}

function kspRunProviderKnowledgeSearchStart_(environment, normalizedProvider, rawInput) {
  var warnings = [];
  var actor = kspGetAiActorSafely_(environment, warnings);
  var context = null;
  var config = null;
  var input = kspNormalizeCanonicalKnowledgeRequest_(rawInput);
  var startedAt = typeof environment.nowIso === 'function' ? environment.nowIso() : new Date().toISOString();
  var startClock = Date.now();
  try {
    kspAssert_(normalizedProvider, 'AI_PROVIDER_INVALID', 'AI provider is invalid.');
    input = kspValidateCanonicalKnowledgeRequest_(input);
    context = environment.loadAiContext();
    config = typeof environment.getProviderConfig === 'function'
      ? environment.getProviderConfig(normalizedProvider)
      : kspBuildAiProviderConfig_(kspNormalizeAiSettings_(context.settings), normalizedProvider);
    if (typeof environment.getProviderConfig !== 'function') config.credentialConfigured = true;
    kspProviderConfigurationError_(normalizedProvider, config);
    var modelSelection = kspResolveAiModelSelection_(
      kspNormalizeAiSettings_(context.settings), normalizedProvider, rawInput, config, startedAt
    );
    config = kspApplyAiModelSelectionToConfig_(config, modelSelection);
    var catalog = kspBuildKnowledgeSearchCatalog_(kspContextCounterpartyRows_(context), context.optionRows,
      context.meetingRows, context.pitchbookRows, context.newsRows, context.assessmentRows);
    kspValidateKnowledgeFilterIds_(input, catalog);
    input = kspRestrictKnowledgeEligibleSources_(input, context);
    if (input.advancedFilterResolved === true && input.resolvedSourceIds.length === 0) {
      var emptyEvidence = kspBuildKnowledgeEntityEvidence_(input, catalog, []);
      var emptyWarnings = warnings.concat([{ code: 'AI_ADVANCED_FILTER_NO_EVIDENCE', message: '指定した条件に一致するActive資料はありません。' }]);
      emptyEvidence.forEach(function (item) {
        emptyWarnings.push({ code: 'AI_ENTITY_EVIDENCE_GAP', message: item.displayName + 'の根拠資料が確認できません。' });
      });
      kspTryAppendKnowledgeAudit_(environment, context.auditSpreadsheetId, kspBuildKnowledgeSearchAuditRow_({
        timestamp: environment.nowIso(), actor: actor, input: input, modelId: config.modelId,
        result: KSP_AUDIT_RESULTS.SUCCESS, citations: [], entityEvidence: emptyEvidence,
        provider: normalizedProvider, telemetry: { modelSelection: config }
      }), emptyWarnings);
      return {
        ok: true, workId: '0021', provider: normalizedProvider, mode: input.mode, status: 'completed',
        answer: '指定した条件に一致する根拠資料は確認できません。', citations: [],
        entityEvidence: emptyEvidence, selectedEntities: emptyEvidence.map(function (item) {
          return { entityKey: item.entityKey, counterpartyType: item.counterpartyType, displayName: item.displayName };
        }),
        insufficientEvidence: true, scopeSummary: kspKnowledgeScopeSummary_(input), warnings: emptyWarnings,
        effectiveSelection: { modelProfileId: config.modelProfileId || '', thinkingProfileId: config.thinkingProfileId || '', modelId: config.modelId || '' }
      };
    }
    var fingerprint = kspKnowledgeQueryFingerprint_(normalizedProvider, config, input);
    var pointer = kspKnowledgeQueryReadCache_(environment, kspKnowledgeQueryDedupeKey_(actor, fingerprint));
    if (pointer && pointer.kind === 'PENDING_POINTER' && pointer.actor === actor &&
        pointer.provider === normalizedProvider && pointer.requestFingerprint === fingerprint && pointer.token) {
      var existingState = kspKnowledgeQueryReadCache_(environment, kspKnowledgeQueryCacheKey_(actor, pointer.token));
      if (existingState && existingState.kind === 'PENDING' &&
          existingState.actor === actor && existingState.provider === normalizedProvider &&
          existingState.requestFingerprint === fingerprint && !kspKnowledgeQueryExpires_(environment, existingState)) {
        return kspKnowledgeQueryPendingResult_(normalizedProvider, existingState.input.mode, pointer.token, warnings, existingState, environment);
      }
    }
    kspAssert_(kspClaimPublicOperation_(environment, 'KNOWLEDGE_SEARCH_' + normalizedProvider, actor, fingerprint, 2),
      'AI_RATE_LIMITED', '検索が集中しています。少し待って再試行してください。');
    var request = kspBuildProviderSearchRequest_(normalizedProvider, config, input);
    var lifecycle = typeof environment.startQueryProvider === 'function'
      ? environment.startQueryProvider(normalizedProvider, config, request)
      : {
        status: 'completed',
        response: typeof environment.queryProvider === 'function'
          ? environment.queryProvider(normalizedProvider, config, request)
          : environment.queryFileSearch(request)
      };
    if (!lifecycle || lifecycle.status === undefined ||
      (lifecycle.status === 'completed' && lifecycle.response === undefined && lifecycle.interactionId === undefined)) {
      lifecycle = { status: 'completed', response: lifecycle };
    }
    var lifecycleStatus = kspAiTrim_(lifecycle.status).toLowerCase();
    if (lifecycleStatus === 'completed') {
      return kspBuildProviderKnowledgeSearchSuccess_(environment, normalizedProvider, input, config, context, actor,
        lifecycle.response || lifecycle, warnings, '',
        { state: { startedAt: startedAt, startLatencyMs: Math.max(0, Date.now() - startClock), pollCount: 0, maxPollLatencyMs: 0 },
          providerStatus: 'completed', response: lifecycle.response || lifecycle,
          startLatencyMs: Math.max(0, Date.now() - startClock), pollCount: 0, maxPollLatencyMs: 0,
          queryTransport: config.queryTransport || KSP_AI_QUERY_TRANSPORTS.INTERACTIONS }).result;
    }
    if (kspKnowledgeQueryKnownTerminalStatus_(lifecycleStatus)) {
      var startTerminal = new Error('Gemini検索が完了できない状態になりました。');
      startTerminal.code = 'AI_QUERY_PROVIDER_TERMINAL';
      startTerminal.providerStatus = lifecycleStatus;
      startTerminal.queryTerminal = true;
      throw startTerminal;
    }
    kspAssert_(normalizedProvider === KSP_AI_PROVIDERS.GEMINI && kspKnowledgeQueryPendingStatus_(lifecycleStatus),
      'AI_QUERY_RESPONSE_INVALID', 'Gemini検索結果を確認できませんでした。');
    kspAssert_(lifecycle.interactionId, 'AI_QUERY_RESPONSE_INVALID', 'Gemini検索結果を確認できませんでした。');
    kspAssert_(typeof environment.getPublicIdempotency === 'function' && typeof environment.setPublicIdempotency === 'function',
      'AI_QUERY_STATE_UNAVAILABLE', '検索状態を保存できませんでした。');
    var token = kspCreateKnowledgeQueryToken_();
    var pendingState = kspKnowledgeQueryPendingState_(environment, actor, normalizedProvider, token, fingerprint,
      lifecycle, input, config, startedAt, Math.max(0, Date.now() - startClock));
    return kspKnowledgeQueryPendingResult_(normalizedProvider, input.mode, token, warnings, pendingState, environment);
  } catch (error) {
    var code = kspGetErrorCode_(error);
    if (context && context.auditSpreadsheetId) {
      kspTryAppendKnowledgeAudit_(environment, context.auditSpreadsheetId, kspBuildKnowledgeSearchAuditRow_({
        timestamp: environment.nowIso(), actor: actor, input: input, modelId: config ? config.modelId : '',
        result: KSP_AUDIT_RESULTS.FAILURE, errorCode: code, citations: [], provider: normalizedProvider,
        telemetry: config ? { modelSelection: config } : null
      }), warnings);
    }
    return kspKnowledgeQueryFailureResult_(normalizedProvider, input.mode, error, warnings, false, '');
  }
}

function kspRunProviderKnowledgeSearchPoll_(environment, requestedProvider, rawInput) {
  var warnings = [];
  var actor = kspGetAiActorSafely_(environment, warnings);
  var token = kspAiTrim_(rawInput && rawInput.queryToken);
  var input = kspNormalizeCanonicalKnowledgeRequest_(rawInput);
  if (!token || token.length > 128) {
    return kspKnowledgeQueryFailureResult_(requestedProvider, input.mode,
      { code: 'AI_QUERY_TOKEN_INVALID' }, warnings, false, '');
  }
  var state = null;
  try {
    kspAssert_(typeof environment.getPublicIdempotency === 'function',
      'AI_QUERY_STATE_UNAVAILABLE', '検索状態を確認できませんでした。');
    state = environment.getPublicIdempotency(kspKnowledgeQueryCacheKey_(actor, token));
  } catch (error) {
    return kspKnowledgeQueryFailureResult_(requestedProvider, input.mode,
      { code: 'AI_QUERY_TOKEN_INVALID' }, warnings, false, '');
  }
  if (!state || typeof state !== 'object') {
    return kspKnowledgeQueryFailureResult_(requestedProvider, input.mode,
      { code: 'AI_QUERY_TOKEN_EXPIRED' }, warnings, false, '');
  }
  if (state.kind === 'PENDING' && kspKnowledgeQueryExpires_(environment, state)) {
    kspKnowledgeQueryWriteCache_(environment, kspKnowledgeQueryCacheKey_(actor, token), {
      schemaVersion: 1, kind: 'EXPIRED', actor: actor, provider: requestedProvider
    }, 1);
    return kspKnowledgeQueryFailureResult_(requestedProvider, input.mode,
      { code: 'AI_QUERY_TOKEN_EXPIRED' }, warnings, false, '');
  }
  if (state.actor !== actor || state.provider !== requestedProvider) {
    return kspKnowledgeQueryFailureResult_(requestedProvider, input.mode,
      { code: 'AI_QUERY_TOKEN_INVALID' }, warnings, false, '');
  }
  if (state.kind === 'TERMINAL' && state.result) {
    try { return kspRevalidateKnowledgeReplay_(environment, state); }
    catch (replayError) {
      return kspKnowledgeQueryFailureResult_(requestedProvider, input.mode,
        replayError && replayError.code === 'AI_CITED_SOURCE_UNAVAILABLE'
          ? replayError : { code: 'AI_QUERY_SOURCE_CHANGED' }, warnings, false, '');
    }
  }
  if (state.kind !== 'PENDING' || !state.interactionId || !state.input || !state.requestFingerprint) {
    return kspKnowledgeQueryFailureResult_(requestedProvider, input.mode,
      { code: 'AI_QUERY_TOKEN_INVALID' }, warnings, false, '');
  }

  var context = null;
  var config = null;
  try {
    context = environment.loadAiContext();
    config = typeof environment.getProviderConfig === 'function'
      ? environment.getProviderConfig(requestedProvider)
      : kspBuildAiProviderConfig_(kspNormalizeAiSettings_(context.settings), requestedProvider);
    if (typeof environment.getProviderConfig !== 'function') config.credentialConfigured = true;
    kspProviderConfigurationError_(requestedProvider, config);
    var pollSelection = kspResolveAiModelSelection_(
      kspNormalizeAiSettings_(context.settings), requestedProvider, state.input, config, environment.nowIso()
    );
    config = kspApplyAiModelSelectionToConfig_(config, pollSelection);
    kspAssert_(typeof environment.pollQueryProvider === 'function',
      'AI_QUERY_STATE_UNAVAILABLE', '検索状態を確認できませんでした。');
    var pollStarted = Date.now();
    var lifecycle = environment.pollQueryProvider(requestedProvider, config, String(state.interactionId));
    var pollLatency = Math.max(0, Date.now() - pollStarted);
    if (!lifecycle || lifecycle.status === undefined) lifecycle = { status: 'completed', response: lifecycle };
    var lifecycleStatus = kspAiTrim_(lifecycle.status).toLowerCase();
    if (kspKnowledgeQueryPendingStatus_(lifecycleStatus)) {
      state.providerStatus = lifecycleStatus;
      state.pollCount = Number(state.pollCount || 0) + 1;
      state.maxPollLatencyMs = Math.max(Number(state.maxPollLatencyMs || 0), pollLatency);
      kspKnowledgeQueryWriteCache_(environment, kspKnowledgeQueryCacheKey_(actor, token), state,
        KSP_AI_DEFAULTS.QUERY_PENDING_TTL_SECONDS);
      return kspKnowledgeQueryPendingResult_(requestedProvider, state.input.mode, token, warnings, state, environment);
    }
    if (lifecycleStatus === 'completed') {
      var completed = kspBuildProviderKnowledgeSearchSuccess_(environment, requestedProvider, state.input, config,
        context, actor, lifecycle.response || lifecycle, warnings, token,
        { state: state, providerStatus: 'completed', response: lifecycle.response || lifecycle,
          pollCount: Number(state.pollCount || 0) + 1,
          maxPollLatencyMs: Math.max(Number(state.maxPollLatencyMs || 0), pollLatency) });
      kspStoreKnowledgeQueryTerminal_(environment, actor, token, requestedProvider, completed.result, completed.sourceIdentity);
      return completed.result;
    }
    if (kspKnowledgeQueryKnownTerminalStatus_(lifecycleStatus)) {
      var providerTerminal = new Error('Gemini検索が完了できない状態になりました。');
      providerTerminal.code = 'AI_QUERY_PROVIDER_TERMINAL';
      providerTerminal.providerStatus = lifecycleStatus;
      providerTerminal.queryTerminal = true;
      providerTerminal.pollCount = Number(state.pollCount || 0) + 1;
      providerTerminal.pollLatencyMs = pollLatency;
      throw providerTerminal;
    }
    var invalidStatus = new Error('Gemini検索結果を確認できませんでした。');
    invalidStatus.code = 'AI_QUERY_RESPONSE_INVALID';
    invalidStatus.queryTerminal = true;
    invalidStatus.pollCount = Number(state.pollCount || 0) + 1;
    invalidStatus.pollLatencyMs = pollLatency;
    throw invalidStatus;
  } catch (error) {
    var terminalStatus = kspAiTrim_(error && error.providerStatus).toLowerCase();
    if (error && (error.queryTerminal === true || kspKnowledgeQueryKnownTerminalStatus_(terminalStatus))) {
      var terminalFailure = kspKnowledgeQueryFailureResult_(requestedProvider, state.input.mode, error, warnings, false, '');
      if (context && context.auditSpreadsheetId) {
        kspAppendKnowledgeQueryAuditOnce_(environment, actor, token, context.auditSpreadsheetId, kspBuildKnowledgeSearchAuditRow_({
          timestamp: environment.nowIso(), actor: actor, input: state.input, modelId: state.modelId || (config && config.modelId),
          interactionId: kspKnowledgeQueryAuditTargetId_(token), result: KSP_AUDIT_RESULTS.FAILURE, errorCode: kspGetErrorCode_(error), citations: [],
          provider: requestedProvider, telemetry: {
            state: state, providerStatus: terminalStatus, pollCount: Number(state.pollCount || 0) + 1,
            maxPollLatencyMs: Math.max(Number(state.maxPollLatencyMs || 0), Number(error.pollLatencyMs || 0)),
            modelSelection: config
          }
        }), terminalFailure.warnings);
      }
      kspStoreKnowledgeQueryTerminal_(environment, actor, token, requestedProvider, terminalFailure);
      return terminalFailure;
    }
    if (error && error.code === 'AI_QUERY_HTTP_FAILED' && error.retryable === false) {
      var transportFailure = kspKnowledgeQueryFailureResult_(requestedProvider, state.input.mode, error, warnings, false, '');
      if (context && context.auditSpreadsheetId) {
        kspAppendKnowledgeQueryAuditOnce_(environment, actor, token, context.auditSpreadsheetId, kspBuildKnowledgeSearchAuditRow_({
          timestamp: environment.nowIso(), actor: actor, input: state.input, modelId: state.modelId || (config && config.modelId),
          interactionId: kspKnowledgeQueryAuditTargetId_(token), result: KSP_AUDIT_RESULTS.FAILURE, errorCode: kspGetErrorCode_(error), citations: [],
          provider: requestedProvider, telemetry: { state: state, providerStatus: 'failed', pollCount: state.pollCount || 0,
            modelSelection: config }
        }), transportFailure.warnings);
      }
      kspStoreKnowledgeQueryTerminal_(environment, actor, token, requestedProvider, transportFailure);
      return transportFailure;
    }
    return kspKnowledgeQueryFailureResult_(requestedProvider, state.input.mode, error, warnings, true, token);
  }
}

function kspRunProviderKnowledgeSearch_(environment, provider, rawInput) {
  var normalizedProvider = kspNormalizeAiProvider_(provider);
  try {
    if (kspKnowledgeQueryPhase_(rawInput) === 'POLL') {
      return kspRunProviderKnowledgeSearchPoll_(environment, normalizedProvider, rawInput);
    }
    return kspRunProviderKnowledgeSearchStart_(environment, normalizedProvider, rawInput);
  } catch (error) {
    return kspKnowledgeQueryFailureResult_(normalizedProvider, '', error, [], false, '');
  }
}

function kspGetProviderNeutralKnowledgeBootstrap_(environment) {
  try {
    var context = environment.loadAiContext();
    var settings = kspNormalizeAiSettings_(context.settings);
    var providers = {};
    var modelPolicies = {};
    [KSP_AI_PROVIDERS.OPENAI, KSP_AI_PROVIDERS.GEMINI].forEach(function (provider) {
      var config = typeof environment.getProviderConfig === 'function'
        ? environment.getProviderConfig(provider)
        : kspBuildAiProviderConfig_(settings, provider);
      providers[provider] = {
        enabled: Boolean(config.enabled),
        configured: Boolean(config.enabled && config.modelId && (config.vectorStoreId || config.storeName) &&
          (typeof environment.getProviderConfig !== 'function' || config.credentialConfigured))
      };
      modelPolicies[provider] = kspGetEffectiveAiModelChoices_(settings, provider, config,
        typeof environment.nowIso === 'function' ? environment.nowIso() : '');
    });
    var routes = [
      { id: KSP_AI_ROUTES.CHATGPT, label: 'ChatGPT' },
      { id: KSP_AI_ROUTES.FULL_EXPORT, label: '全文出力' }
    ];
    if (providers[KSP_AI_PROVIDERS.GEMINI].configured &&
        modelPolicies[KSP_AI_PROVIDERS.GEMINI].profiles.length > 0) {
      routes.splice(1, 0, { id: KSP_AI_ROUTES.GEMINI, label: 'Gemini' });
    }
    return {
      ok: true,
      workId: '0021',
      appVersion: '0.7.0',
      configured: true,
      providers: providers,
      modelPolicies: modelPolicies,
      routes: routes,
      implementedModes: KSP_FEATURE_FREEZE_MODE_ORDER.slice(),
      targetModes: KSP_FEATURE_FREEZE_MODE_ORDER.slice(),
      modeDefinitions: kspGetKnowledgeModeDefinitions_(),
      options: kspBuildKnowledgeSearchCatalog_(kspContextCounterpartyRows_(context), context.optionRows,
        context.meetingRows, context.pitchbookRows, context.newsRows, context.assessmentRows),
      syncIntervalMinutes: settings.syncIntervalMinutes
    };
  } catch (error) {
    return { ok: false, workId: '0020', error: { code: kspGetErrorCode_(error), message: kspSafePublicErrorMessage_(kspGetErrorCode_(error), 'SEARCH') } };
  }
}

function kspAiSyncSnapshot_(row, meetingRows) {
  var links = kspAiTrim_(row.Parent_Meeting_ID) ? (meetingRows || []).map(function (meeting) {
    return [String(meeting.Meeting_ID || ''), String(meeting.Status || ''), String(meeting.Related_Pitchbook_IDs || '')];
  }).sort(function (a, b) { return a[0].localeCompare(b[0]); }) : [];
  return JSON.stringify([row, links]);
}

function kspAssertAiSyncExpected_(row, meetingRows, expected) {
  kspAssert_(row && kspAiSyncSnapshot_(row, meetingRows) === expected.snapshot,
    'AI_SYNC_CONTEXT_CONFLICT', '同期中にsourceまたはrelationshipが変更されました。');
}

function kspRestrictKnowledgeEligibleSources_(input, context) {
  var request = kspValidateCanonicalKnowledgeRequest_(input);
  var prior = input && input.advancedFilterResolved === true && Array.isArray(input.resolvedSourceIds)
    ? input.resolvedSourceIds : null;
  var data = context || {};
  var maps = kspBuildAuthoritativeSourceMaps_(data.meetingRows, data.pitchbookRows,
    data.newsRows, data.assessmentRows);
  var filters = kspKnowledgeRequestFilters_(request);
  var masterMaps = kspBuildAiMasterMaps_(kspContextCounterpartyRows_(data), data.optionRows || []);
  var matches = [];
  request.sourceTypes.forEach(function (sourceType) {
    kspAiSourceRows_(data, sourceType).forEach(function (row) {
      var sourceId = kspAiTrim_(row[kspAiSourceRowKey_(sourceType)]);
      if (!sourceId) return;
      var source = maps.bySourceKey[kspAiSourceKey_(sourceType, sourceId)];
      kspAssert_(source !== null, 'AI_SOURCE_ID_AMBIGUOUS', '資料の識別が一意ではありません。');
      if (!source || source.status !== KSP_STATUS.ACTIVE || source.retrievalEligible === false) return;
      if (filters.sourceId && filters.sourceId !== sourceId) return;
      if (sourceType === KSP_AI_SOURCE_TYPES.MEETING || sourceType === KSP_AI_SOURCE_TYPES.PITCHBOOK) {
        var candidate = row;
        if (sourceType === KSP_AI_SOURCE_TYPES.PITCHBOOK) {
          var pitchbookContext = kspPitchbookAiContext_(row, masterMaps);
          candidate = Object.assign({}, row, {
            Counterparty_Type: pitchbookContext.counterpartyType,
            Counterparty_ID: pitchbookContext.counterpartyId,
            GP_ID: pitchbookContext.counterpartyType === 'GP' ? pitchbookContext.counterpartyId : ''
          });
        }
        if (!kspKnowledgeExportRowMatches_(candidate,
          Object.assign({}, filters, { selectedEntityKeys: request.selectedEntityKeys || [] }))) return;
      } else {
        if (filters.dateFrom && source.date < filters.dateFrom) return;
        if (filters.dateTo && source.date > filters.dateTo) return;
        if (filters.assetClassId && source.assetClassId !== filters.assetClassId) return;
        if (filters.fundStrategy && source.fundStrategy !== filters.fundStrategy) return;
        if (filters.capitalTypeId) return;
        if (filters.entityKey && source.entityKeys.indexOf(filters.entityKey) === -1) return;
        if ((request.selectedEntityKeys || []).length >= KSP_KNOWLEDGE_MULTI_ENTITY_MIN &&
            !request.selectedEntityKeys.some(function (key) { return source.entityKeys.indexOf(key) !== -1; })) return;
        if (filters.gpId && source.counterpartyIds.indexOf(filters.gpId) === -1) return;
        if (filters.counterpartyType && !source.counterpartyIds.some(function (id) {
          return String((masterMaps.counterpartyTypes || {})[id] || '') === filters.counterpartyType;
        })) return;
      }
      if (!prior || prior.indexOf(sourceId) !== -1) matches.push(sourceId);
    });
  });
  var ids = kspUniqueStrings_(matches).sort();
  request.resolvedSourceIds = ids;
  request.advancedFilterResolved = true;
  return request;
}

function kspProviderStatePatch_(environment, item, provider, patch) {
  if (item.expected) {
    var latest = environment.loadAiContext();
    var rows = kspAiSourceRows_(latest, item.sourceType);
    var key = kspAiSourceRowKey_(item.sourceType);
    var matches = (rows || []).filter(function (row) { return String(row[key]) === item.sourceId; });
    kspAssert_(matches.length === 1, 'AI_SYNC_CONTEXT_CONFLICT', '同期sourceが変更されました。');
    kspAssertAiSyncExpected_(matches[0], latest.meetingRows, item.expected);
  }
  if (typeof environment.updateAiProviderState === 'function') {
    var expectedParts = item.expected ? JSON.parse(item.expected.snapshot) : null;
    var predicted = expectedParts ? kspBuildAiProviderStatePatch_(expectedParts[0], provider, patch) : null;
    var updated = environment.updateAiProviderState(item.sourceType, item.sourceId, provider, patch, item.expected);
    if (item.expected) {
      expectedParts[0].AI_Provider_State_JSON = kspSerializeAiProviderState_(predicted);
      if (provider === KSP_AI_PROVIDERS.GEMINI) {
        expectedParts[0].AI_Document_Name = predicted.GEMINI.documentName;
        expectedParts[0].AI_Index_Status = predicted.GEMINI.status;
        expectedParts[0].AI_Indexed_At = predicted.GEMINI.indexedAt;
        expectedParts[0].AI_Content_Hash = predicted.GEMINI.contentHash;
        expectedParts[0].AI_Last_Error = predicted.GEMINI.lastError;
      }
      item.expected.snapshot = JSON.stringify(expectedParts);
    }
    return updated;
  }
  var row = item.row || {};
  var state = kspBuildAiProviderStatePatch_(row, provider, patch);
  var rowPatch = { AI_Provider_State_JSON: kspSerializeAiProviderState_(state) };
  if (provider === KSP_AI_PROVIDERS.GEMINI) {
    rowPatch.AI_Document_Name = state.GEMINI.documentName;
    rowPatch.AI_Index_Status = state.GEMINI.status;
    rowPatch.AI_Indexed_At = state.GEMINI.indexedAt;
    rowPatch.AI_Content_Hash = state.GEMINI.contentHash;
    rowPatch.AI_Last_Error = state.GEMINI.lastError;
  }
  if (typeof environment.updateAiRow === 'function') {
    var result = environment.updateAiRow(item.sourceType, item.sourceId, rowPatch, item.expected);
    if (item.expected) {
      var parts = JSON.parse(item.expected.snapshot);
      Object.keys(rowPatch).forEach(function (field) { parts[0][field] = rowPatch[field]; });
      item.expected.snapshot = JSON.stringify(parts);
    }
    return result;
  }
  return rowPatch;
}

function kspProviderIndexedStatePatch_(provider, config, documentValue, contentHash, indexedAt) {
  return {
    status: KSP_AI_INDEX_STATUS.INDEXED,
    documentName: String(documentValue && documentValue.name || ''),
    providerDocumentId: String(documentValue && (documentValue.providerDocumentId || documentValue.fileId) || ''),
    storeName: provider === KSP_AI_PROVIDERS.OPENAI ? config.vectorStoreId : config.storeName,
    indexedAt: indexedAt,
    contentHash: contentHash,
    lastError: ''
  };
}

function kspProviderDocumentIdentity_(documentValue) {
  var value = documentValue || {};
  return String(value.providerDocumentId || value.fileId || value.name || '');
}

function kspAddSafeCleanupDiagnostic_(target, code) {
  var normalized = kspAiTrim_(code);
  if (normalized && target.indexOf(normalized) < 0) target.push(normalized);
}

function kspDeleteProviderDocumentsBestEffort_(environment, provider, config, documents, fallbackCode) {
  var diagnostics = [];
  (documents || []).forEach(function (documentValue) {
    try {
      if (environment.deleteProviderDocument) environment.deleteProviderDocument(provider, config, documentValue);
    } catch (cleanupError) {
      kspAddSafeCleanupDiagnostic_(diagnostics, fallbackCode);
      (Array.isArray(cleanupError.cleanupDiagnostics) ? cleanupError.cleanupDiagnostics : []).forEach(function (code) {
        kspAddSafeCleanupDiagnostic_(diagnostics, code);
      });
    }
  });
  return diagnostics;
}

function kspProviderCleanupFailure_(code, diagnostics, preserveProviderStatePatch) {
  var error = new Error('Provider document cleanup did not complete.');
  error.code = code;
  error.retryable = true;
  error.cleanupDiagnostics = (diagnostics || []).slice();
  if (preserveProviderStatePatch) error.preserveProviderStatePatch = kspDeepClone_(preserveProviderStatePatch);
  return error;
}

function kspAttachProviderCleanupDiagnostics_(primaryError, diagnostics) {
  if (!primaryError || typeof primaryError !== 'object') return primaryError;
  var safeCodes = [];
  (Array.isArray(primaryError.cleanupDiagnostics) ? primaryError.cleanupDiagnostics : []).concat(diagnostics || [])
    .forEach(function (code) { kspAddSafeCleanupDiagnostic_(safeCodes, code); });
  primaryError.cleanupDiagnostics = safeCodes;
  return primaryError;
}

function kspBuildProviderSyncReport_(startedAt, settings) {
  return {
    workId: '0020', startedAt: startedAt, finishedAt: null, ok: true, providerOk: true, partial: false,
    syncEnabled: settings.syncEnabled, providers: {}, selected: 0, indexed: 0,
    reused: 0, unchanged: 0, metadataRefreshed: 0, removed: 0, failed: 0, skippedClaims: 0, items: [], errors: []
  };
}

function kspRunProviderNeutralAiSync_(environment, options) {
  var syncOptions = options || {};
  var force = Boolean(syncOptions.force);
  var startedAt = environment.nowIso();
  var context = environment.loadAiContext();
  if (environment.ensureAiSettings) environment.ensureAiSettings(kspGetAiSettingSeedRows_(startedAt));
  context = environment.loadAiContext();
  var settings = kspNormalizeAiSettings_(context.settings);
  var report = kspBuildProviderSyncReport_(startedAt, settings);
  report.forced = force;
  var selection;
  try {
    selection = kspNormalizeProviderAiSelection_({ sourceType: syncOptions.sourceType, sourceId: syncOptions.sourceId });
  } catch (error) {
    report.finishedAt = environment.nowIso();
    report.ok = false;
    report.providerOk = false;
    report.errors.push({ code: kspGetErrorCode_(error, 'AI_SYNC_SOURCE_TYPE_INVALID') });
    return report;
  }
  if (!settings.syncEnabled && !force) { report.finishedAt = environment.nowIso(); return report; }
  var providerList;
  try {
    providerList = kspNormalizeProviderAiSyncProviders_(syncOptions.providers);
  } catch (providerError) {
    report.finishedAt = environment.nowIso();
    report.ok = false;
    report.errors.push({ code: kspGetErrorCode_(providerError, 'AI_PROVIDER_INVALID') });
    return report;
  }
  providerList.forEach(function (provider) {
    var config;
    try {
      config = typeof environment.getProviderConfig === 'function'
        ? environment.getProviderConfig(provider)
        : kspBuildAiProviderConfig_(settings, provider);
    } catch (configError) {
      report.providers[provider] = {
        enabled: false, usable: false, indexed: 0, failed: 0, status: 'FAILED',
        errorCode: kspGetErrorCode_(configError)
      };
      report.errors.push({ provider: provider, code: kspGetErrorCode_(configError) });
      return;
    }
    var exactDisabledProvider = !config.enabled && force && Boolean(selection.sourceId) &&
      syncOptions.allowDisabledExactProvider === true;
    if (exactDisabledProvider) config.enabled = true;
    report.providers[provider] = {
      enabled: Boolean(config.enabled), usable: Boolean(config.enabled), indexed: 0, metadataRefreshed: 0, failed: 0,
      status: config.enabled ? 'READY' : 'DISABLED_BY_CONFIG'
    };
    if (!config.enabled) return;
    try {
      kspProviderConfigurationError_(provider, config);
      var store = typeof environment.ensureProviderStore === 'function'
        ? environment.ensureProviderStore(provider, config) : null;
      var effectiveConfig = kspDeepClone_(config);
      if (provider === KSP_AI_PROVIDERS.GEMINI && store && store.name) effectiveConfig.storeName = store.name;
      var items = kspSelectProviderAiWorkItems_(
        context.meetingRows, context.pitchbookRows, startedAt, settings, provider, selection,
        context.newsRows, context.assessmentRows
      );
      report.selected += items.length;
      report.providers[provider].selected = items.length;
      var maps = kspBuildAiMasterMaps_(kspContextCounterpartyRows_(context), context.optionRows);
      items.forEach(function (item) {
        var selectedSnapshot = kspAiSyncSnapshot_(item.row, context.meetingRows);
        var claim = environment.claimAiSource ? environment.claimAiSource(item.sourceType, item.sourceId, startedAt, KSP_AI_DEFAULTS.CLAIM_TTL_MILLIS) : { token: '' };
        if (!claim) { report.skippedClaims += 1; return; }
        item.expected = { sourceType: item.sourceType, sourceId: item.sourceId, claimToken: claim.token,
          snapshot: selectedSnapshot };
        try {
          var currentContext = environment.loadAiContext();
          var currentRows = kspAiSourceRows_(currentContext, item.sourceType);
          var currentKey = kspAiSourceRowKey_(item.sourceType);
          var currentMatches = (currentRows || []).filter(function (row) { return String(row[currentKey]) === item.sourceId; });
          kspAssert_(currentMatches.length === 1, 'AI_SYNC_CONTEXT_CONFLICT', '同期sourceが変更されました。');
          kspAssertAiSyncExpected_(currentMatches[0], currentContext.meetingRows, item.expected);
          var docs = typeof environment.findProviderDocumentsBySource === 'function'
            ? environment.findProviderDocumentsBySource(provider, effectiveConfig, item.sourceType, item.sourceId) : [];
          var providerState = kspGetAiProviderStateEntry_(item.row, provider);
          if (selection.sourceId) {
            var priorIdentityMatches = (docs || []).filter(function (doc) {
              var priorMetadata = doc.attributes || doc.customMetadata || {};
              var priorDocumentId = String(doc.providerDocumentId || doc.fileId || '');
              return String(priorMetadata.source_type || '') === item.sourceType &&
                String(priorMetadata.source_id || '') === item.sourceId &&
                String(priorMetadata.content_hash || '') === providerState.contentHash &&
                (!providerState.providerDocumentId || providerState.providerDocumentId === priorDocumentId) &&
                (provider === KSP_AI_PROVIDERS.OPENAI || !providerState.documentName ||
                  providerState.documentName === String(doc.name || ''));
            });
            var hasPriorIdentity = providerState.status === KSP_AI_INDEX_STATUS.INDEXED &&
              providerState.documentName && providerState.contentHash;
            if (hasPriorIdentity) {
              kspAssert_((docs || []).length === 1 && priorIdentityMatches.length === 1,
                'AI_EXACT_SOURCE_RECONCILIATION_NOT_UNIQUE',
                'Exact provider source reconciliation did not return one prior document.');
            } else {
              kspAssert_((docs || []).length === 0, 'AI_EXACT_SOURCE_RECONCILIATION_NOT_UNIQUE',
                'Exact provider source reconciliation found an unowned document.');
            }
          }
          if (String(item.row.Status) === KSP_STATUS.INACTIVE || item.retrievalEligible === false) {
            (docs || []).forEach(function (doc) { if (environment.deleteProviderDocument) environment.deleteProviderDocument(provider, effectiveConfig, doc); });
            kspProviderStatePatch_(environment, item, provider, { status: KSP_AI_INDEX_STATUS.NOT_INDEXED, documentName: '', providerDocumentId: '', indexedAt: '', contentHash: '', lastError: '' });
            report.removed += 1;
            return;
          }
          var source = kspBuildFeatureFreezeAiSource_(environment, item, maps);
          if (kspIsGeminiReadbackRecoveryEntry_(providerState, provider)) {
            var exactMatches = (docs || []).filter(function (doc) {
              return kspGeminiDocumentMatchesSource_(doc, source);
            });
            kspAssert_(exactMatches.length === 1, 'AI_DOCUMENT_READBACK_FAILED',
              'File Search Documentの照合結果が一意ではありません。');
            var reconciled = typeof environment.readProviderDocument === 'function'
              ? environment.readProviderDocument(provider, effectiveConfig, exactMatches[0], source)
              : exactMatches[0];
            kspAssert_(kspGeminiDocumentMatchesSource_(reconciled, source),
              'AI_DOCUMENT_READBACK_FAILED', 'File Search Documentの照合に失敗しました。');
            kspProviderStatePatch_(environment, item, provider, {
              status: KSP_AI_INDEX_STATUS.INDEXED,
              documentName: String(reconciled.name || ''),
              providerDocumentId: String(reconciled.providerDocumentId || reconciled.fileId || ''),
              storeName: effectiveConfig.storeName,
              indexedAt: environment.nowIso(),
              contentHash: source.contentHash,
              lastError: ''
            });
            report.unchanged += 1;
            report.items.push({ sourceType: item.sourceType, sourceId: item.sourceId, action: 'reconciled' });
            return;
          }
          var matching = (docs || []).filter(function (doc) {
            var metadata = doc.attributes || doc.customMetadata || {};
            var documentId = String(doc.providerDocumentId || doc.fileId || '');
            var exactIdentity = String(metadata.source_type || '') === item.sourceType &&
              String(metadata.source_id || '') === item.sourceId &&
              String(metadata.content_hash || '') === source.contentHash;
            return exactIdentity &&
              providerState.contentHash === source.contentHash &&
              (!providerState.providerDocumentId || providerState.providerDocumentId === documentId) &&
              (provider === KSP_AI_PROVIDERS.OPENAI || !providerState.documentName ||
                providerState.documentName === String(doc.name || ''));
          });
          var exactCurrentProvider = Boolean(selection.sourceId) &&
            providerState.status === KSP_AI_INDEX_STATUS.INDEXED &&
            providerState.contentHash === source.contentHash;
          if (exactCurrentProvider) {
            kspAssert_(matching.length === 1, 'AI_EXACT_SOURCE_RECONCILIATION_NOT_UNIQUE',
              'Exact provider source reconciliation did not return one current document.');
          }
          if (matching.length) {
            if (provider === KSP_AI_PROVIDERS.OPENAI || selection.sourceId) {
              kspAssert_(matching.length === 1, 'AI_CURRENT_SOURCE_RECONCILIATION_NOT_UNIQUE',
                'OpenAI source reconciliation did not return one current document.');
            }
            var selected = matching[0];
            if (provider === KSP_AI_PROVIDERS.OPENAI && selection.sourceId) {
              var desiredAttributes = kspBuildOpenAiAttributes_(source);
              var currentAttributes = selected.attributes || selected.customMetadata || {};
              if (!kspOpenAiAttributesEqual_(currentAttributes, desiredAttributes)) {
                kspAssert_(typeof environment.updateProviderDocumentAttributes === 'function',
                  'OPENAI_ATTRIBUTE_REFRESH_UNAVAILABLE', 'ChatGPT source attribute refresh is unavailable.');
                var refreshed = environment.updateProviderDocumentAttributes(provider, effectiveConfig,
                  selected, desiredAttributes);
                kspAssert_(kspProviderDocumentIdentity_(refreshed) === kspProviderDocumentIdentity_(selected),
                  'OPENAI_ATTRIBUTE_REFRESH_IDENTITY_MISMATCH',
                  'ChatGPT source attribute refresh returned a different document.');
                kspAssert_(kspOpenAiAttributesEqual_(refreshed.attributes || refreshed.customMetadata || {}, desiredAttributes),
                  'OPENAI_ATTRIBUTE_REFRESH_READBACK_MISMATCH',
                  'ChatGPT source attribute refresh readback did not match the authoritative source.');
                selected = refreshed;
                report.metadataRefreshed += 1;
                report.providers[provider].metadataRefreshed += 1;
                report.items.push({ provider: provider, sourceType: item.sourceType,
                  sourceId: item.sourceId, action: 'metadata-refreshed' });
              }
            }
            var selectedIdentity = kspProviderDocumentIdentity_(selected);
            var staleDocuments = (docs || []).filter(function (doc) {
              return kspProviderDocumentIdentity_(doc) !== selectedIdentity;
            });
            if (provider !== KSP_AI_PROVIDERS.OPENAI && !selection.sourceId) staleDocuments = matching.slice(1);
            var currentPatch = kspProviderIndexedStatePatch_(provider, effectiveConfig, selected,
              source.contentHash, providerState.indexedAt || environment.nowIso());
            var staleDiagnostics = kspDeleteProviderDocumentsBestEffort_(environment, provider,
              effectiveConfig, staleDocuments, 'AI_STALE_DOCUMENT_DELETE_FAILED');
            if (staleDiagnostics.length) {
              throw kspProviderCleanupFailure_('AI_STALE_DOCUMENT_CLEANUP_FAILED',
                staleDiagnostics, currentPatch);
            }
            kspProviderStatePatch_(environment, item, provider, currentPatch);
            report.unchanged += 1;
            return;
          }
          var uploaded = environment.uploadProviderSource(provider, effectiveConfig, source);
          kspAssert_(uploaded && uploaded.name, 'AI_UPLOAD_DOCUMENT_MISSING', 'Provider upload did not return a document.');
          var replacementPatch = kspProviderIndexedStatePatch_(provider, effectiveConfig, uploaded,
            source.contentHash, environment.nowIso());
          try {
            // The new document becomes authoritative before stale documents
            // are removed. This makes interruption recoverable without losing
            // the last known-good state or uploading the same replacement twice.
            kspProviderStatePatch_(environment, item, provider, replacementPatch);
          } catch (persistenceError) {
            var replacementDiagnostics = kspDeleteProviderDocumentsBestEffort_(environment, provider,
              effectiveConfig, [uploaded], 'AI_REPLACEMENT_DOCUMENT_CLEANUP_FAILED');
            kspAttachProviderCleanupDiagnostics_(persistenceError, replacementDiagnostics);
            throw persistenceError;
          }
          var priorCleanupDiagnostics = kspDeleteProviderDocumentsBestEffort_(environment, provider,
            effectiveConfig, docs, 'AI_STALE_DOCUMENT_DELETE_FAILED');
          if (priorCleanupDiagnostics.length) {
            throw kspProviderCleanupFailure_('AI_STALE_DOCUMENT_CLEANUP_FAILED',
              priorCleanupDiagnostics, replacementPatch);
          }
          report.indexed += 1;
          report.providers[provider].indexed += 1;
        } catch (error) {
          report.failed += 1;
          report.providers[provider].failed += 1;
          report.items.push({ provider: provider, sourceType: item.sourceType, sourceId: item.sourceId, action: 'failed', code: kspGetErrorCode_(error) });
          if (/^AI_(SYNC_CONTEXT_CONFLICT|SYNC_CLAIM_CONFLICT|ROW_LOCK_TIMEOUT)$/.test(kspGetErrorCode_(error))) return;
          try {
            var previousState = kspGetAiProviderStateEntry_(item.row, provider);
            var preservedState = error.preserveProviderStatePatch
              ? kspDeepClone_(error.preserveProviderStatePatch) : null;
            var retryBaseState = preservedState || previousState;
            var lastError = kspBuildAiProviderLastError_(error,
              kspAiProviderLastError_(retryBaseState.lastError), settings, environment.nowIso());
            var previousUsable = retryBaseState.status === KSP_AI_INDEX_STATUS.INDEXED &&
              retryBaseState.documentName && retryBaseState.contentHash;
            kspProviderStatePatch_(environment, item, provider, previousUsable ? {
              status: KSP_AI_INDEX_STATUS.INDEXED,
              documentName: retryBaseState.documentName,
              providerDocumentId: retryBaseState.providerDocumentId,
              storeName: retryBaseState.storeName,
              indexedAt: retryBaseState.indexedAt,
              contentHash: retryBaseState.contentHash,
              lastError: lastError
            } : {
              status: KSP_AI_INDEX_STATUS.FAILED, documentName: '', providerDocumentId: '', indexedAt: '', contentHash: '',
              lastError: lastError
            });
          } catch (stateError) {
            report.errors.push({ provider: provider, code: kspGetErrorCode_(stateError) });
          }
        } finally {
          if (environment.releaseAiSourceClaim) environment.releaseAiSourceClaim(item.sourceType, item.sourceId, claim.token);
        }
      });
      report.providers[provider].status = report.providers[provider].failed ? 'PARTIAL' : 'PASS';
    } catch (providerError) {
      report.providers[provider].status = 'FAILED';
      report.providers[provider].usable = false;
      report.providers[provider].errorCode = kspGetErrorCode_(providerError);
      report.errors.push({ provider: provider, code: kspGetErrorCode_(providerError) });
    }
  });
  report.finishedAt = environment.nowIso();
  report.providerOk = report.errors.length === 0;
  report.partial = report.providerOk && report.failed > 0;
  report.ok = report.providerOk && report.failed === 0;
  return report;
}
// ===== END src/164_AiProviderCore.gs =====

