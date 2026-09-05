function kspCreateAiEnvironment_() {
  var base = kspCreateMaintenanceEnvironment_();
  var scriptProperties = PropertiesService.getScriptProperties();

  base.loadAiContext = function () {
    var state = base.getInstallationState();
    kspAssert_(state && state.resources, 'INSTALLATION_STATE_MISSING', 'Installation stateがありません。');
    var backendSpreadsheetId = state.resources[KSP_RESOURCE_KEYS.BACKEND_SPREADSHEET];
    var auditSpreadsheetId = state.resources[KSP_RESOURCE_KEYS.AUDIT_SPREADSHEET];
    kspAssert_(backendSpreadsheetId, 'BACKEND_SPREADSHEET_MISSING', 'Backend Spreadsheetがありません。');
    kspAssert_(auditSpreadsheetId, 'AUDIT_SPREADSHEET_MISSING', 'Audit Spreadsheetがありません。');
    return {
      state: state,
      backendSpreadsheetId: backendSpreadsheetId,
      auditSpreadsheetId: auditSpreadsheetId,
      settings: kspReadSettingsMapLive_(backendSpreadsheetId),
      meetingRows: base.readRows(backendSpreadsheetId, KSP_SHEET_NAMES.MEETING_INDEX),
      pitchbookRows: base.readRows(backendSpreadsheetId, KSP_SHEET_NAMES.PITCHBOOK_INDEX),
      gpRows: base.readRows(backendSpreadsheetId, KSP_SHEET_NAMES.GP_MASTER),
      optionRows: base.readRows(backendSpreadsheetId, KSP_SHEET_NAMES.OPTION_MASTER)
    };
  };

  base.ensureAiSettings = function (rows) {
    var state = base.getInstallationState();
    var spreadsheetId = state.resources[KSP_RESOURCE_KEYS.BACKEND_SPREADSHEET];
    return kspUpsertMissingSettingsLive_(spreadsheetId, rows || []);
  };

  base.saveOpenAiApiKey = function (value) {
    var key = kspAiTrim_(value);
    kspAssert_(key && key.length <= 512, 'OPENAI_API_KEY_INVALID', 'OpenAI API key is invalid.');
    scriptProperties.setProperty(KSP_AI_PROPERTY_KEYS.OPENAI_API_KEY, key);
    return true;
  };

  base.saveGeminiApiKey = function (value) {
    var key = kspAiTrim_(value);
    kspAssert_(key && key.length <= 512, 'GEMINI_API_KEY_INVALID', 'Gemini API key is invalid.');
    scriptProperties.setProperty(KSP_AI_PROPERTY_KEYS.API_KEY, key);
    return true;
  };

  base.ensureFileSearchStore = function (settings, displayName) {
    if (settings.storeName) return base.getFileSearchStore(settings.storeName);
    var created = base.createFileSearchStore(
      kspBuildFileSearchStoreCreateRequest_(displayName, settings.embeddingModel)
    );
    kspWriteSettingLive_(
      base.getInstallationState().resources[KSP_RESOURCE_KEYS.BACKEND_SPREADSHEET],
      KSP_AI_SETTINGS.STORE_NAME,
      created.name,
      base.nowIso()
    );
    return created;
  };

  base.getFileSearchStore = function (storeName) {
    try {
      return kspNormalizeFileSearchStore_(kspGeminiJsonRequestLive_('GET', '/' + kspAiStoreResourcePath_(storeName), null, {
        retryPolicy: KSP_GEMINI_RETRY_POLICIES.IDEMPOTENT,
        stage: 'STORE_READ', errorCode: 'AI_STORE_READ_FAILED'
      }));
    } catch (error) {
      if (error && (error.code === 'AI_STORE_READ_FAILED' || error.code === 'AI_CREDENTIAL_NOT_CONFIGURED')) throw error;
      throw kspGeminiStageError_('AI_STORE_READ_FAILED', 'STORE_READ', 0, {}, false);
    }
  };

  base.createFileSearchStore = function (request) {
    try {
      return kspNormalizeFileSearchStore_(kspGeminiJsonRequestLive_('POST', KSP_AI_API.STORES_PATH, request, {
        retryPolicy: KSP_GEMINI_RETRY_POLICIES.MUTATING_CREATE,
        stage: 'STORE_CREATE', errorCode: 'AI_STORE_CREATE_FAILED'
      }));
    } catch (error) {
      if (error && (error.code === 'AI_STORE_CREATE_FAILED' || error.code === 'AI_CREDENTIAL_NOT_CONFIGURED')) throw error;
      throw kspGeminiStageError_('AI_STORE_CREATE_FAILED', 'STORE_CREATE', 0, {}, false);
    }
  };

  base.findFileSearchDocumentsBySource = function (storeName, sourceId) {
    return kspListAllFileSearchDocumentsLive_(storeName).filter(function (documentValue) {
      return String(documentValue.customMetadata.source_id || '') === String(sourceId);
    });
  };

  base.deleteFileSearchDocument = function (storeName, documentName) {
    var normalizedStore = kspAiStoreResourcePath_(storeName);
    var name = kspAiTrim_(documentName);
    kspAssert_(name.indexOf(normalizedStore + '/documents/') === 0, 'AI_DOCUMENT_STORE_MISMATCH',
      'File Search Document does not belong to the configured Store.');
    kspGeminiJsonRequestLive_('DELETE', '/' + name + '?force=true', null, {
      retryPolicy: KSP_GEMINI_RETRY_POLICIES.IDEMPOTENT,
      stage: 'DOCUMENT_DELETE', errorCode: 'AI_DOCUMENT_DELETE_FAILED'
    });
    return true;
  };

  base.listGeminiModels = function () {
    return kspGeminiJsonRequestLive_('GET', '/models?pageSize=1000', null, {
      retryPolicy: KSP_GEMINI_RETRY_POLICIES.IDEMPOTENT,
      stage: 'MODELS_LIST', errorCode: 'AI_GEMINI_MODELS_LIST_FAILED'
    });
  };

  base.deleteFileSearchStore = function (storeName) {
    var normalizedStore = kspAiStoreResourcePath_(storeName);
    kspGeminiJsonRequestLive_('DELETE', '/' + normalizedStore + '?force=true', null, {
      retryPolicy: KSP_GEMINI_RETRY_POLICIES.IDEMPOTENT,
      stage: 'STORE_DELETE', errorCode: 'AI_STORE_DELETE_FAILED'
    });
    return true;
  };

  base.confirmFileSearchStoreDeleted = function (storeName) {
    var normalizedStore = kspAiStoreResourcePath_(storeName);
    try {
      kspGeminiJsonRequestLive_('GET', '/' + normalizedStore, null, {
        retryPolicy: KSP_GEMINI_RETRY_POLICIES.IDEMPOTENT,
        stage: 'STORE_DELETE_CONFIRM', errorCode: 'AI_STORE_DELETE_CONFIRM_FAILED'
      });
      return false;
    } catch (error) {
      return Number(error && error.httpStatus || 0) === 404;
    }
  };

  base.uploadSourceToFileSearchStore = function (storeName, source) {
    return kspUploadSourceLive_(storeName, source);
  };

  base.startQueryFileSearch = function (request) {
    return kspGeminiStartInteractionLive_(request);
  };

  base.pollQueryFileSearch = function (interactionId) {
    return kspGeminiPollInteractionLive_(interactionId);
  };

  base.queryFileSearch = function (request) {
    return kspGeminiQueryInteractionLive_(request);
  };

  base.queryGeminiInteraction = function (request) {
    return kspGeminiQueryInteractionLive_(request);
  };

  base.readMeetingText = function (fileId) {
    kspAssert_(fileId, 'AI_MEETING_DOC_MISSING', 'Meeting Google Docがありません。');
    return DocumentApp.openById(fileId).getBody().getText();
  };

  base.readTextFile = function (fileId) {
    kspAssert_(fileId, 'AI_PITCHBOOK_FILE_MISSING', 'Pitchbook source fileがありません。');
    var response = UrlFetchApp.fetch('https://www.googleapis.com/drive/v3/files/' + encodeURIComponent(fileId) + '?alt=media', {
      method: 'get',
      headers: { Authorization: 'Bearer ' + ScriptApp.getOAuthToken() },
      muteHttpExceptions: true
    });
    kspAssert_(response.getResponseCode() >= 200 && response.getResponseCode() < 300,
      'AI_SOURCE_READ_FAILED', 'TXT sourceを読み込めませんでした。');
    return response.getContentText('UTF-8');
  };

  base.hashText = function (text) {
    var digest = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, String(text || ''), Utilities.Charset.UTF_8);
    return digest.map(function (value) { return ('0' + ((value + 256) % 256).toString(16)).slice(-2); }).join('');
  };

  base.readSharedAdminCredential = function () {
    return {
      salt: scriptProperties.getProperty(KSP_SHARED_ADMIN_PROPERTY_KEYS.SALT) || '',
      verifier: scriptProperties.getProperty(KSP_SHARED_ADMIN_PROPERTY_KEYS.VERIFIER) || '',
      signingSecret: scriptProperties.getProperty(KSP_SHARED_ADMIN_PROPERTY_KEYS.SIGNING_SECRET) || '',
      generation: scriptProperties.getProperty(KSP_SHARED_ADMIN_PROPERTY_KEYS.GENERATION) || ''
    };
  };

  base.writeSharedAdminCredential = function (state) {
    var values = {};
    values[KSP_SHARED_ADMIN_PROPERTY_KEYS.SALT] = String(state.salt || '');
    values[KSP_SHARED_ADMIN_PROPERTY_KEYS.VERIFIER] = String(state.verifier || '');
    values[KSP_SHARED_ADMIN_PROPERTY_KEYS.SIGNING_SECRET] = String(state.signingSecret || '');
    values[KSP_SHARED_ADMIN_PROPERTY_KEYS.GENERATION] = String(state.generation || '');
    scriptProperties.setProperties(values, false);
    return true;
  };

  base.withSharedAdminLock = function (callback) {
    var lock = LockService.getScriptLock();
    lock.waitLock(KSP_DEFAULTS.LOCK_TIMEOUT_MS);
    try { return callback(); }
    finally { lock.releaseLock(); }
  };

  base.sharedAdminHmac = function (value, key) {
    var signature = Utilities.computeHmacSha256Signature(
      String(value), String(key), Utilities.Charset.UTF_8);
    return Utilities.base64EncodeWebSafe(signature).replace(/=+$/g, '');
  };

  base.sharedAdminRandom = function (purpose) {
    var seed = String(purpose || '') + '|' + Utilities.getUuid() + '|' + Utilities.getUuid();
    var digest = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, seed, Utilities.Charset.UTF_8);
    return Utilities.base64EncodeWebSafe(digest).replace(/=+$/g, '');
  };

  base.updateAiRow = function (sourceType, sourceId, patch) {
    var context = base.loadAiContext();
    var sheetName = sourceType === KSP_AI_SOURCE_TYPES.MEETING
      ? KSP_SHEET_NAMES.MEETING_INDEX
      : KSP_SHEET_NAMES.PITCHBOOK_INDEX;
    var keyColumn = sourceType === KSP_AI_SOURCE_TYPES.MEETING ? 'Meeting_ID' : 'Document_ID';
    return kspUpdateRowPatchLive_(context.backendSpreadsheetId, sheetName, keyColumn, sourceId, patch);
  };

  base.claimAiSource = function (sourceType, sourceId, nowIso, ttlMillis) {
    return kspClaimAiSourceLive_(scriptProperties, sourceType, sourceId, nowIso, ttlMillis);
  };

  base.releaseAiSourceClaim = function (sourceType, sourceId, token) {
    return kspReleaseAiSourceClaimLive_(scriptProperties, sourceType, sourceId, token);
  };

  base.appendAuditRow = function (spreadsheetId, row) {
    return base.appendRow(spreadsheetId, KSP_SHEET_NAMES.AUDIT_LOG, row);
  };

  return base;
}
