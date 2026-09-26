function kspCreateAiEnvironment_() {
  var base = kspCreateMaintenanceEnvironment_();
  var scriptProperties = PropertiesService.getScriptProperties();

  base.getSessionIdentities = function () {
    var active = '';
    var effective = '';
    try { active = Session.getActiveUser().getEmail() || ''; } catch (ignoredActive) {}
    try { effective = Session.getEffectiveUser().getEmail() || ''; } catch (ignoredEffective) {}
    return { active: String(active), effective: String(effective) };
  };

  base.getAiCredentialGeneration = function (provider) {
    var snapshot = kspAiActiveCredentialSnapshotLive_(provider);
    return snapshot ? snapshot.generation : 'legacy';
  };

  base.listAiProviderModels = function (provider, candidateKey) {
    var models = [];
    if (provider === KSP_AI_PROVIDERS.OPENAI) {
      var openAi = kspOpenAiJsonRequestLive_('GET', '/models', null, candidateKey || '');
      (Array.isArray(openAi && openAi.data) ? openAi.data : []).forEach(function (item) {
        models.push({ modelId: item.id, displayName: item.id });
      });
      return { models: models, partial: models.length > 100 };
    }
    var token = '';
    for (var page = 0; page < 2; page += 1) {
      var path = '/models?pageSize=50' + (token ? '&pageToken=' + encodeURIComponent(token) : '');
      var response = kspGeminiJsonRequestLive_('GET', path, null, {
        apiKeyOverride: candidateKey || '', retryPolicy: KSP_GEMINI_RETRY_POLICIES.IDEMPOTENT,
        stage: 'MODELS_LIST', errorCode: 'AI_GEMINI_MODELS_LIST_FAILED'
      });
      (Array.isArray(response && response.models) ? response.models : []).forEach(function (item) {
        models.push({ modelId: item.name, displayName: item.displayName || item.name });
      });
      token = String(response && response.nextPageToken || '');
      if (!token) break;
    }
    return { models: models, partial: Boolean(token) };
  };

  base.verifyAiProviderStoreCredential = function (provider, storeName, candidateKey) {
    try {
      if (provider === KSP_AI_PROVIDERS.OPENAI) {
        var store = kspOpenAiJsonRequestLive_('GET',
          KSP_OPENAI_API.VECTOR_STORES_PATH + '/' + encodeURIComponent(storeName), null, candidateKey);
        return Boolean(store && store.id === storeName);
      }
      var gemini = kspGeminiJsonRequestLive_('GET', '/' + kspAiStoreResourcePath_(storeName), null, {
        apiKeyOverride: candidateKey, retryPolicy: KSP_GEMINI_RETRY_POLICIES.IDEMPOTENT,
        stage: 'STORE_READ', errorCode: 'AI_STORE_READ_FAILED'
      });
      return Boolean(gemini && gemini.name === kspAiStoreResourcePath_(storeName));
    } catch (ignored) { return false; }
  };

  base.getAiModelCandidateCache = function (provider, generation) {
    var state = base.getInstallationState();
    var backend = state && state.resources && state.resources[KSP_RESOURCE_KEYS.BACKEND_SPREADSHEET];
    var cacheKey = 'KSP_AI_MODELS_' + kspAiSetupDigest_(provider + '|' + generation + '|' + backend).slice(0, 40);
    var raw = CacheService.getScriptCache().get(cacheKey);
    if (!raw) return null;
    try { return JSON.parse(raw); } catch (ignored) { return null; }
  };

  base.putAiModelCandidateCache = function (provider, generation, result, seconds) {
    var state = base.getInstallationState();
    var backend = state && state.resources && state.resources[KSP_RESOURCE_KEYS.BACKEND_SPREADSHEET];
    var cacheKey = 'KSP_AI_MODELS_' + kspAiSetupDigest_(provider + '|' + generation + '|' + backend).slice(0, 40);
    CacheService.getScriptCache().put(cacheKey, JSON.stringify(result), seconds);
  };

  base.getAiSetupOperation = function (operationId, credentialMode, provider) {
    var context = base.loadAiSettingsSnapshot();
    var settings = kspNormalizeAiSettings_(context.settings);
    if (!settings.modelPolicyJson) return null;
    var policy = kspNormalizeAiModelPolicy_(settings.modelPolicyJson);
    if (policy.lastOperationId !== operationId) return null;
    if (credentialMode) {
      var snapshot = kspAiActiveCredentialSnapshotLive_(provider);
      if (!snapshot || snapshot.lastOperationId !== operationId) return null;
    }
    var selected = policy.profiles.filter(function (item) {
      return item.provider === provider && item.profileId === policy.lastOperationProfileId;
    })[0];
    var scalarModel = provider === KSP_AI_PROVIDERS.OPENAI
      ? settings.openaiModelId : settings.geminiModelId;
    if (!selected || (selected.isProviderDefault && selected.modelId !== scalarModel) ||
        selected.qualifiedCredentialGeneration !== base.getAiCredentialGeneration(provider)) return null;
    return selected ? { ok: true, workId: '0073', provider: provider,
      modelId: selected.modelId, status: 'SAVED' } : null;
  };

  base.loadAiSettingsSnapshot = function () {
    var state = base.getInstallationState();
    var backendSpreadsheetId = state && state.resources &&
      state.resources[KSP_RESOURCE_KEYS.BACKEND_SPREADSHEET];
    kspAssert_(backendSpreadsheetId, 'BACKEND_SPREADSHEET_MISSING', 'Backend Spreadsheetがありません。');
    return { backendSpreadsheetId: backendSpreadsheetId,
      settings: kspReadSettingsMapLive_(backendSpreadsheetId) };
  };

  base.commitAiModelSetup = function (request) {
    var lock = base.acquireScriptLock(KSP_DEFAULTS.LOCK_TIMEOUT_MS);
    try {
      var context = base.loadAiSettingsSnapshot();
      var currentPolicy = context.settings[KSP_AI_SETTINGS.MODEL_POLICY_JSON] || '';
      if (currentPolicy !== request.expectedPolicyJson ||
          base.getAiCredentialGeneration(request.provider) !== request.expectedCredentialGeneration) {
        throw kspAiSetupError_('AI_SETUP_STALE');
      }
      var policyKey = KSP_AI_SETTINGS.MODEL_POLICY_JSON;
      var modelKey = request.provider === KSP_AI_PROVIDERS.OPENAI
        ? KSP_AI_SETTINGS.OPENAI_MODEL_ID : KSP_AI_SETTINGS.GEMINI_MODEL_ID;
      var priorModel = context.settings[modelKey] || '';
      var backend = context.backendSpreadsheetId;
      try {
        kspWriteSettingLive_(backend, policyKey, JSON.stringify(request.policy), base.nowIso());
        if (request.makeDefault !== false) kspWriteSettingLive_(backend, modelKey, request.modelId, base.nowIso());
        if (request.candidateKey) {
          var snapshotKey = request.provider === KSP_AI_PROVIDERS.OPENAI
            ? KSP_AI_PROPERTY_KEYS.OPENAI_ACTIVE_SNAPSHOT : KSP_AI_PROPERTY_KEYS.GEMINI_ACTIVE_SNAPSHOT;
          scriptProperties.setProperty(snapshotKey, JSON.stringify({ version: 1,
            key: request.candidateKey, generation: request.nextCredentialGeneration,
            lastOperationId: request.operationId }));
        }
      } catch (writeError) {
        try {
          kspWriteSettingLive_(backend, modelKey, priorModel, base.nowIso());
          kspWriteSettingLive_(backend, policyKey, currentPolicy, base.nowIso());
        } catch (ignoredRollback) { /* New tuple stays fail-closed until its generation is committed. */ }
        throw kspAiSetupError_('AI_SETUP_WRITE_FAILED');
      }
    } finally { base.releaseScriptLock(lock); }
  };

  base.createAiQualificationStore = function (provider, key) {
    if (provider === KSP_AI_PROVIDERS.OPENAI) {
      var openAi = kspOpenAiCreateVectorStoreLive_('KSP-0073-synthetic-qualification', key);
      return { name: String(openAi.id) };
    }
    var gemini = kspGeminiJsonRequestLive_('POST', KSP_AI_API.STORES_PATH,
      kspBuildFileSearchStoreCreateRequest_('KSP-0073-synthetic-qualification', ''), {
        apiKeyOverride: key, retryPolicy: KSP_GEMINI_RETRY_POLICIES.MUTATING_CREATE,
        stage: 'STORE_CREATE', errorCode: 'AI_STORE_CREATE_FAILED'
      });
    return { name: String(gemini && gemini.name || '') };
  };

  base.uploadAiQualificationSource = function (provider, storeName, source, key) {
    return provider === KSP_AI_PROVIDERS.OPENAI
      ? kspOpenAiUploadSourceLive_(storeName, source, key)
      : kspUploadSourceLive_(storeName, source, key);
  };

  base.readAiQualificationSource = function (provider, storeName, documentValue, source, key) {
    if (provider === KSP_AI_PROVIDERS.OPENAI) {
      var fileId = String(documentValue.fileId || documentValue.providerDocumentId || '');
      return kspOpenAiProviderDocumentFromVectorStoreFile_(storeName,
        kspOpenAiGetVectorStoreFileLive_(storeName, fileId, key));
    }
    return kspReadAndVerifyFileSearchDocumentLive_(documentValue.name, source, key);
  };

  base.queryAiQualificationSource = function (provider, config, request, key) {
    return provider === KSP_AI_PROVIDERS.OPENAI
      ? kspOpenAiQueryFileSearchLive_(request, key)
      : kspGeminiQualificationInteractionLive_(kspBuildFeatureFreezeInteractionRequest_(request), key);
  };

  base.deleteAiQualificationDocument = function (provider, storeName, documentValue, key) {
    if (provider !== KSP_AI_PROVIDERS.OPENAI) return true;
    var cleanup = kspOpenAiCleanupDocumentResourcesLive_(storeName,
      String(documentValue.fileId || documentValue.providerDocumentId || ''), key);
    if (cleanup.error) throw cleanup.error;
    return true;
  };

  base.deleteAiQualificationStore = function (provider, storeName, key) {
    if (provider === KSP_AI_PROVIDERS.OPENAI) return kspOpenAiDeleteVectorStoreLive_(storeName, key);
    kspGeminiJsonRequestLive_('DELETE', '/' + kspAiStoreResourcePath_(storeName) + '?force=true', null, {
      apiKeyOverride: key, retryPolicy: KSP_GEMINI_RETRY_POLICIES.IDEMPOTENT,
      stage: 'STORE_DELETE', errorCode: 'AI_STORE_DELETE_FAILED'
    });
    return true;
  };

  base.confirmAiQualificationStoreDeleted = function (provider, storeName, key) {
    try {
      if (provider === KSP_AI_PROVIDERS.OPENAI) kspOpenAiGetVectorStoreLive_(storeName, key);
      else kspGeminiJsonRequestLive_('GET', '/' + kspAiStoreResourcePath_(storeName), null, {
        apiKeyOverride: key, retryPolicy: KSP_GEMINI_RETRY_POLICIES.IDEMPOTENT,
        stage: 'STORE_DELETE_CONFIRM', errorCode: 'AI_STORE_DELETE_CONFIRM_FAILED'
      });
      return false;
    } catch (error) { return Number(error && error.httpStatus || 0) === 404; }
  };

  base.qualifyFourSourceAiModel = function (request) {
    return kspRunFourSourceAiSetupQualification_(base, request);
  };

  base.removeAiCredential = function (provider) {
    var lock = base.acquireScriptLock(KSP_DEFAULTS.LOCK_TIMEOUT_MS);
    try {
      var settings = kspNormalizeAiSettings_(base.loadAiSettingsSnapshot().settings);
      if (provider === KSP_AI_PROVIDERS.OPENAI ? settings.openaiEnabled : settings.geminiEnabled) {
        throw kspAiSetupError_('AI_SETUP_STOP_REQUIRED');
      }
      if (provider === KSP_AI_PROVIDERS.OPENAI) {
        scriptProperties.deleteProperty(KSP_AI_PROPERTY_KEYS.OPENAI_ACTIVE_SNAPSHOT);
        scriptProperties.deleteProperty(KSP_AI_PROPERTY_KEYS.OPENAI_API_KEY);
      } else {
        scriptProperties.deleteProperty(KSP_AI_PROPERTY_KEYS.GEMINI_ACTIVE_SNAPSHOT);
        scriptProperties.deleteProperty(KSP_AI_PROPERTY_KEYS.API_KEY);
      }
      return true;
    } finally { base.releaseScriptLock(lock); }
  };

  base.startAiProvider = function (provider) {
    var context = base.loadAiContext();
    var settings = kspNormalizeAiSettings_(context.settings);
    var policy = kspAiSetupPolicy_(settings, base.nowIso());
    var profile = policy.profiles.filter(function (item) {
      return item.provider === provider && item.isProviderDefault && item.enabled &&
        item.qualification === KSP_AI_MODEL_QUALIFICATION_STATES.QUALIFIED;
    })[0];
    if (!profile) throw kspAiSetupError_('AI_SETUP_QUALIFICATION_FAILED');
    var configured = provider === KSP_AI_PROVIDERS.OPENAI
      ? base.isOpenAiCredentialConfigured() : base.isGeminiCredentialConfigured();
    if (!configured) throw kspAiSetupError_('AI_SETUP_CREDENTIAL_REQUIRED');
    var storeKey = provider === KSP_AI_PROVIDERS.OPENAI
      ? KSP_AI_SETTINGS.OPENAI_VECTOR_STORE_ID : KSP_AI_SETTINGS.STORE_NAME;
    var enabledKey = provider === KSP_AI_PROVIDERS.OPENAI
      ? KSP_AI_SETTINGS.OPENAI_ENABLED : KSP_AI_SETTINGS.GEMINI_ENABLED;
    var readinessKey = provider === KSP_AI_PROVIDERS.OPENAI
      ? KSP_AI_SETTINGS.OPENAI_READINESS : KSP_AI_SETTINGS.GEMINI_READINESS;
    var originalStore = provider === KSP_AI_PROVIDERS.OPENAI
      ? settings.openaiVectorStoreId : settings.geminiStoreName;
    var generation = base.getAiCredentialGeneration(provider);
    if (profile.qualifiedTupleFingerprint !==
        kspAiSetupTupleFingerprint_(profile, generation, originalStore)) {
      throw kspAiSetupError_('AI_SETUP_STALE');
    }
    var storeName = originalStore;
    var createdName = '';
    var adopted = false;
    try {
      if (!storeName) {
        var created = provider === KSP_AI_PROVIDERS.OPENAI
          ? base.createOpenAiVectorStore(KSP_AI_DEFAULTS.STORE_DISPLAY_NAME)
          : base.createFileSearchStore(kspBuildFileSearchStoreCreateRequest_(
            KSP_AI_DEFAULTS.STORE_DISPLAY_NAME, settings.embeddingModel));
        createdName = String(created && (created.id || created.name) || '');
        storeName = createdName;
      }
      if (!storeName) throw kspAiSetupError_('AI_SETUP_STORE_ACCESS_FAILED');
      var readback = provider === KSP_AI_PROVIDERS.OPENAI
        ? base.getOpenAiVectorStore(storeName) : base.getFileSearchStore(storeName);
      if (String(readback && (readback.id || readback.name) || '') !== storeName) {
        throw kspAiSetupError_('AI_SETUP_STORE_ACCESS_FAILED');
      }
      var lock = base.acquireScriptLock(KSP_DEFAULTS.LOCK_TIMEOUT_MS);
      try {
        var current = base.loadAiSettingsSnapshot();
        var currentSettings = kspNormalizeAiSettings_(current.settings);
        var currentStore = provider === KSP_AI_PROVIDERS.OPENAI
          ? currentSettings.openaiVectorStoreId : currentSettings.geminiStoreName;
        if (currentStore !== originalStore ||
            (current.settings[KSP_AI_SETTINGS.MODEL_POLICY_JSON] || '') !==
              (context.settings[KSP_AI_SETTINGS.MODEL_POLICY_JSON] || '') ||
            base.getAiCredentialGeneration(provider) !== generation) {
          throw kspAiSetupError_('AI_SETUP_STALE');
        }
        if (createdName) {
          kspWriteSettingLive_(current.backendSpreadsheetId, storeKey, storeName, base.nowIso());
          adopted = true;
          profile.qualifiedStoreName = storeName;
          profile.qualifiedTupleFingerprint = kspAiSetupTupleFingerprint_(profile, generation, storeName);
          policy.profiles = policy.profiles.map(function (item) {
            return item.profileId === profile.profileId ? profile : item;
          });
          kspWriteSettingLive_(current.backendSpreadsheetId, KSP_AI_SETTINGS.MODEL_POLICY_JSON,
            JSON.stringify(kspNormalizeAiModelPolicy_(policy)), base.nowIso());
        }
        kspWriteSettingLive_(current.backendSpreadsheetId, readinessKey, 'READY_FOR_SYNC', base.nowIso());
        kspWriteSettingLive_(current.backendSpreadsheetId, enabledKey, 'true', base.nowIso());
      } finally { base.releaseScriptLock(lock); }
      return { ok: true, workId: '0073', provider: provider, status: 'READY_FOR_SYNC' };
    } catch (error) {
      if (createdName && !adopted) {
        try {
          if (provider === KSP_AI_PROVIDERS.OPENAI) kspOpenAiDeleteVectorStoreLive_(createdName);
          else base.deleteFileSearchStore(createdName);
        } catch (ignoredCleanup) { throw kspAiSetupError_('AI_SETUP_CLEANUP_REQUIRED'); }
      }
      throw error;
    }
  };

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
      newsRows: base.readRows(backendSpreadsheetId, KSP_SHEET_NAMES.NEWS_INDEX),
      assessmentRows: base.readRows(backendSpreadsheetId, KSP_SHEET_NAMES.INTERNAL_ASSESSMENT_INDEX),
      counterpartyRows: base.readRows(backendSpreadsheetId, KSP_SHEET_NAMES.COUNTERPARTY_MASTER),
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

  base.updateAiRow = function (sourceType, sourceId, patch) {
    var context = base.loadAiContext();
    var routes = {};
    routes[KSP_AI_SOURCE_TYPES.MEETING] = [KSP_SHEET_NAMES.MEETING_INDEX, 'Meeting_ID'];
    routes[KSP_AI_SOURCE_TYPES.PITCHBOOK] = [KSP_SHEET_NAMES.PITCHBOOK_INDEX, 'Document_ID'];
    routes[KSP_AI_SOURCE_TYPES.NEWS] = [KSP_SHEET_NAMES.NEWS_INDEX, 'News_ID'];
    routes[KSP_AI_SOURCE_TYPES.INTERNAL_ASSESSMENT] = [KSP_SHEET_NAMES.INTERNAL_ASSESSMENT_INDEX, 'Assessment_ID'];
    var route = routes[sourceType];
    kspAssert_(route, 'AI_SYNC_SOURCE_TYPE_INVALID', 'AI sync source type is invalid.');
    var sheetName = route[0];
    var keyColumn = route[1];
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
