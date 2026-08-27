function kspAiHashTextFallback_(text) {
  var value = String(text || '');
  var hash = 2166136261;
  for (var index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return ('00000000' + (hash >>> 0).toString(16)).slice(-8) + '-' + value.length;
}

function kspParseAiLastError_(value) {
  var raw = kspAiTrim_(value);
  if (!raw) return { attempt: 0, retryable: true, nextAttemptAt: '', permanent: false, code: '', message: '' };
  try {
    var parsed = JSON.parse(raw);
    return {
      attempt: Number(parsed.attempt || 0),
      retryable: parsed.retryable !== false,
      nextAttemptAt: kspAiTrim_(parsed.nextAttemptAt),
      permanent: Boolean(parsed.permanent),
      code: kspAiTrim_(parsed.code),
      message: kspAiTrim_(parsed.message)
    };
  } catch (ignored) {
    return { attempt: 1, retryable: true, nextAttemptAt: '', permanent: false, code: 'LEGACY_ERROR', message: raw };
  }
}

function kspBuildAiLastError_(params) {
  var options = params || {};
  return JSON.stringify({
    attempt: Number(options.attempt || 0),
    retryable: options.retryable !== false,
    nextAttemptAt: kspAiTrim_(options.nextAttemptAt),
    permanent: Boolean(options.permanent),
    code: kspAiTrim_(options.code),
    message: kspAiTrim_(options.message).slice(0, 1000)
  });
}

function kspCalculateAiRetryAt_(nowIso, attempt, settings) {
  var safeSettings = settings || kspNormalizeAiSettings_({});
  var exponent = Math.max(0, Number(attempt || 1) - 1);
  var delayMinutes = Math.min(
    safeSettings.retryMaxMinutes,
    safeSettings.retryBaseMinutes * Math.pow(2, exponent)
  );
  var baseIso = kspCanonicalInstantIso_(nowIso);
  kspAssert_(baseIso, 'AI_RETRY_NOW_INVALID', 'AI retry基準日時が不正です。');
  return kspCanonicalInstantIso_(new Date(new Date(baseIso).getTime() + delayMinutes * 60 * 1000));
}

function kspIsAiErrorRetryable_(error) {
  if (error && error.retryable === false) return false;
  if (error && error.retryable === true) return true;
  var statusCode = Number(error && (error.httpStatus || error.code));
  if (KSP_AI_RETRYABLE_HTTP_CODES[statusCode]) return true;
  return statusCode === 0 || !Number.isFinite(statusCode);
}
