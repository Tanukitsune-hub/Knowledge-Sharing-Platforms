var KSP_AI_WORK_ID = '0008';
var KSP_AI_APP_VERSION = '0.4.0';

var KSP_AI_SOURCE_TYPES = Object.freeze({
  MEETING: 'Meeting',
  PITCHBOOK: 'Pitchbook'
});

var KSP_AI_SEARCH_MODES = Object.freeze({
  FREE_QUESTION: '自由質問'
});

var KSP_AI_SETTINGS = Object.freeze({
  STORE_NAME: 'GEMINI_FILE_SEARCH_STORE_NAME',
  MODEL_ID: 'AI_DEFAULT_MODEL',
  SYNC_ENABLED: 'AI_SYNC_ENABLED',
  SYNC_INTERVAL_MINUTES: 'AI_SYNC_INTERVAL_MINUTES',
  SYNC_BATCH_SIZE: 'AI_SYNC_BATCH_SIZE',
  MAX_RETRY_ATTEMPTS: 'AI_MAX_RETRY_ATTEMPTS',
  RETRY_BASE_MINUTES: 'AI_RETRY_BASE_MINUTES',
  RETRY_MAX_MINUTES: 'AI_RETRY_MAX_MINUTES',
  EMBEDDING_MODEL: 'AI_EMBEDDING_MODEL'
});

var KSP_AI_DEFAULTS = Object.freeze({
  SYNC_BATCH_SIZE: 10,
  MAX_RETRY_ATTEMPTS: 5,
  RETRY_BASE_MINUTES: 15,
  RETRY_MAX_MINUTES: 240,
  EMBEDDING_MODEL: 'models/gemini-embedding-2',
  STORE_DISPLAY_NAME: 'Private Assets Knowledge',
  MAX_QUESTION_LENGTH: 5000,
  MAX_OPERATION_POLLS: 8,
  OPERATION_POLL_MILLIS: 1500,
  CLAIM_TTL_MILLIS: 10 * 60 * 1000
});

var KSP_AI_PROPERTY_KEYS = Object.freeze({
  API_KEY: 'KSP_GEMINI_API_KEY',
  SOURCE_CLAIM_PREFIX: 'KSP_AI_SOURCE_CLAIM_'
});

var KSP_AI_API = Object.freeze({
  BASE_URL: 'https://generativelanguage.googleapis.com/v1beta',
  UPLOAD_BASE_URL: 'https://generativelanguage.googleapis.com/upload/v1beta',
  INTERACTIONS_PATH: '/interactions',
  STORES_PATH: '/fileSearchStores'
});

var KSP_AI_RETRYABLE_HTTP_CODES = Object.freeze({
  408: true,
  409: true,
  425: true,
  429: true,
  500: true,
  502: true,
  503: true,
  504: true
});

function kspAiTrim_(value) {
  return value === null || value === undefined ? '' : String(value).trim();
}

function kspAiToInteger_(value, fallback, minimum, maximum) {
  var numberValue = Number(value);
  if (!Number.isFinite(numberValue) || Math.floor(numberValue) !== numberValue) return fallback;
  if (minimum !== undefined && numberValue < minimum) return fallback;
  if (maximum !== undefined && numberValue > maximum) return fallback;
  return numberValue;
}

function kspNormalizeAiSettings_(settings) {
  var source = settings || {};
  return {
    storeName: kspAiTrim_(source[KSP_AI_SETTINGS.STORE_NAME] || source.storeName),
    modelId: kspAiTrim_(source[KSP_AI_SETTINGS.MODEL_ID] || source.modelId),
    syncEnabled: kspToBoolean_(
      source[KSP_AI_SETTINGS.SYNC_ENABLED] !== undefined ? source[KSP_AI_SETTINGS.SYNC_ENABLED] : source.syncEnabled,
      false
    ),
    syncIntervalMinutes: kspAiToInteger_(
      source[KSP_AI_SETTINGS.SYNC_INTERVAL_MINUTES] || source.syncIntervalMinutes,
      15,
      15,
      15
    ),
    syncBatchSize: kspAiToInteger_(
      source[KSP_AI_SETTINGS.SYNC_BATCH_SIZE] || source.syncBatchSize,
      KSP_AI_DEFAULTS.SYNC_BATCH_SIZE,
      1,
      50
    ),
    maxRetryAttempts: kspAiToInteger_(
      source[KSP_AI_SETTINGS.MAX_RETRY_ATTEMPTS] || source.maxRetryAttempts,
      KSP_AI_DEFAULTS.MAX_RETRY_ATTEMPTS,
      1,
      20
    ),
    retryBaseMinutes: kspAiToInteger_(
      source[KSP_AI_SETTINGS.RETRY_BASE_MINUTES] || source.retryBaseMinutes,
      KSP_AI_DEFAULTS.RETRY_BASE_MINUTES,
      1,
      1440
    ),
    retryMaxMinutes: kspAiToInteger_(
      source[KSP_AI_SETTINGS.RETRY_MAX_MINUTES] || source.retryMaxMinutes,
      KSP_AI_DEFAULTS.RETRY_MAX_MINUTES,
      1,
      10080
    ),
    embeddingModel: kspAiTrim_(
      source[KSP_AI_SETTINGS.EMBEDDING_MODEL] || source.embeddingModel || KSP_AI_DEFAULTS.EMBEDDING_MODEL
    )
  };
}

function kspGetAiSettingSeedRows_(nowIso) {
  return [
    { Key: KSP_AI_SETTINGS.SYNC_BATCH_SIZE, Value: String(KSP_AI_DEFAULTS.SYNC_BATCH_SIZE), Description: 'Maximum AI sources processed per worker execution.', Updated_At: nowIso },
    { Key: KSP_AI_SETTINGS.MAX_RETRY_ATTEMPTS, Value: String(KSP_AI_DEFAULTS.MAX_RETRY_ATTEMPTS), Description: 'Maximum retryable indexing failures before permanent stop.', Updated_At: nowIso },
    { Key: KSP_AI_SETTINGS.RETRY_BASE_MINUTES, Value: String(KSP_AI_DEFAULTS.RETRY_BASE_MINUTES), Description: 'Initial AI indexing retry delay.', Updated_At: nowIso },
    { Key: KSP_AI_SETTINGS.RETRY_MAX_MINUTES, Value: String(KSP_AI_DEFAULTS.RETRY_MAX_MINUTES), Description: 'Maximum AI indexing retry delay.', Updated_At: nowIso },
    { Key: KSP_AI_SETTINGS.EMBEDDING_MODEL, Value: KSP_AI_DEFAULTS.EMBEDDING_MODEL, Description: 'Embedding model used when creating the File Search Store.', Updated_At: nowIso }
  ];
}
