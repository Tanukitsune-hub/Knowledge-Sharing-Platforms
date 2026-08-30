function kspAiProviderAdminSafeMessage_(code) {
  var messages = {
    AI_PROVIDER_ADMIN_UNAUTHORIZED: 'この操作は管理者だけが実行できます。',
    AI_PROVIDER_ADMIN_ACTION_INVALID: 'AIプロバイダ操作が不正です。',
    OPENAI_API_KEY_NOT_CONFIGURED: 'OpenAI APIキーがScript Propertiesに設定されていません。',
    OPENAI_API_KEY_INVALID: 'OpenAI APIキーを確認できませんでした。',
    OPENAI_ACTIVATION_FAILED: 'OpenAIを有効化できませんでした。APIキーと権限を確認してください。',
    OPENAI_CONNECTION_TEST_FAILED: 'OpenAI接続確認に失敗しました。APIキーと権限を確認してください。',
    OPENAI_NOT_READY_FOR_SYNC: 'OpenAI接続確認が完了していないため、資料同期を開始できません。',
    OPENAI_DISABLE_FAILED: 'OpenAIを無効化できませんでした。',
    AI_SYNC_SOURCE_TYPE_INVALID: '同期対象のSource Typeが不正です。',
    OPENAI_SYNC_FAILED: 'AI同期を完了できませんでした。設定と権限を確認してください。'
  };
  return messages[String(code || '')] || 'AIプロバイダ操作を完了できませんでした。';
}

function kspAiProviderAdminFailure_(code) {
  return {
    ok: false,
    workId: '0020',
    error: { code: String(code || 'OPENAI_ACTIVATION_FAILED'), message: kspAiProviderAdminSafeMessage_(code) }
  };
}

function kspAiProviderAdminNormalizeSourceType_(input) {
  var sourceType = kspAiTrim_(input && input.sourceType);
  if (!sourceType) return '';
  kspAssert_(sourceType === KSP_AI_SOURCE_TYPES.MEETING || sourceType === KSP_AI_SOURCE_TYPES.PITCHBOOK,
    'AI_SYNC_SOURCE_TYPE_INVALID', 'AI sync source type is invalid.');
  return sourceType;
}

function kspAiProviderAdminSessionEmails_() {
  var active = '';
  var effective = '';
  try { active = String(Session.getActiveUser().getEmail() || '').trim().toLowerCase(); } catch (ignoredActive) {}
  try { effective = String(Session.getEffectiveUser().getEmail() || '').trim().toLowerCase(); } catch (ignoredEffective) {}
  return { active: active, effective: effective };
}

function kspAiProviderAdminAllowedEmails_(context) {
  var configured = context && context.state && context.state.config
    ? context.state.config.adminEmails : [];
  if (!Array.isArray(configured)) return [];
  var seen = {};
  return configured.map(function (value) { return String(value || '').trim().toLowerCase(); })
    .filter(function (value) {
      if (!value || seen[value]) return false;
      seen[value] = true;
      return true;
    });
}

function kspIsAiProviderAdministrator_(environment, context) {
  if (environment && typeof environment.isAdministrator === 'function') {
    return Boolean(environment.isAdministrator(context));
  }
  var allowed = kspAiProviderAdminAllowedEmails_(context);
  if (!allowed.length) return false;
  var session = kspAiProviderAdminSessionEmails_();
  if (session.active && allowed.indexOf(session.active) !== -1) return true;
  return !session.active && session.effective && allowed.indexOf(session.effective) !== -1;
}

function kspAiProviderAdminCredentialConfigured_(environment) {
  if (environment && typeof environment.isOpenAiCredentialConfigured === 'function') {
    return Boolean(environment.isOpenAiCredentialConfigured());
  }
  try {
    kspOpenAiApiKeyLive_();
    return true;
  } catch (ignored) {
    return false;
  }
}

function kspAiProviderAdminWriteSetting_(environment, context, key, value) {
  var nowIso = environment.nowIso();
  if (environment && typeof environment.writeAiSetting === 'function') {
    return environment.writeAiSetting(key, String(value), nowIso);
  }
  var current = context || environment.loadAiContext();
  return kspWriteSettingLive_(current.backendSpreadsheetId, key, String(value), nowIso);
}

function kspAiProviderAdminSaveOpenAiApiKey_(environment, value) {
  var key = kspAiTrim_(value);
  kspAssert_(key && key.length <= 512, 'OPENAI_API_KEY_INVALID', 'OpenAI API key is invalid.');
  if (environment && typeof environment.saveOpenAiApiKey === 'function') {
    environment.saveOpenAiApiKey(key);
    return true;
  }
  kspAssert_(typeof PropertiesService !== 'undefined' && PropertiesService.getScriptProperties,
    'OPENAI_API_KEY_INVALID', 'OpenAI API key storage is unavailable.');
  PropertiesService.getScriptProperties().setProperty(KSP_AI_PROPERTY_KEYS.OPENAI_API_KEY, key);
  return true;
}

function kspAiProviderAdminCreateStore_(environment) {
  if (environment && typeof environment.createOpenAiVectorStore === 'function') {
    return environment.createOpenAiVectorStore(KSP_AI_DEFAULTS.OPENAI_STORE_DISPLAY_NAME);
  }
  return kspOpenAiCreateVectorStoreLive_(KSP_AI_DEFAULTS.OPENAI_STORE_DISPLAY_NAME);
}

function kspAiProviderAdminReadStore_(environment, vectorStoreId) {
  if (environment && typeof environment.getOpenAiVectorStore === 'function') {
    return environment.getOpenAiVectorStore(vectorStoreId);
  }
  return kspOpenAiGetVectorStoreLive_(vectorStoreId);
}

function kspAiProviderAdminStoreIsInaccessible_(error) {
  var code = kspGetErrorCode_(error);
  return code === 'OPENAI_HTTP_401' || code === 'OPENAI_HTTP_403' || code === 'OPENAI_HTTP_404';
}

function kspAiProviderAdminResetOpenAiState_(environment, context) {
  if (!environment || typeof environment.updateAiProviderState !== 'function') return;
  var sources = [
    { type: KSP_AI_SOURCE_TYPES.MEETING, rows: context && context.meetingRows || [], key: 'Meeting_ID' },
    { type: KSP_AI_SOURCE_TYPES.PITCHBOOK, rows: context && context.pitchbookRows || [], key: 'Document_ID' }
  ];
  sources.forEach(function (group) {
    (group.rows || []).forEach(function (row) {
      var sourceId = kspAiTrim_(row && row[group.key]);
      if (!sourceId) return;
      environment.updateAiProviderState(group.type, sourceId, KSP_AI_PROVIDERS.OPENAI, {
        status: KSP_AI_INDEX_STATUS.NOT_INDEXED,
        documentName: '', providerDocumentId: '', storeName: '', indexedAt: '', contentHash: '', lastError: ''
      });
    });
  });
}

function kspRunOpenAiSyntheticConnectionTest_(environment, vectorStoreId, modelId) {
  kspAssert_(vectorStoreId && modelId, 'OPENAI_CONNECTION_TEST_FAILED', 'OpenAI connection test configuration is incomplete.');
  var sourceId = 'KSP-OPENAI-CONNECTION-TEST';
  var text = 'Knowledge Sharing Platforms synthetic connection test. The unique answer token is OPENAI_CONNECTION_READY.';
  var contentHash = typeof environment.hashText === 'function'
    ? String(environment.hashText(text)) : kspAiHashTextFallback_(text);
  var source = {
    sourceType: KSP_AI_SOURCE_TYPES.PITCHBOOK,
    sourceId: sourceId,
    dateKey: '2026-08-30',
    gpId: 'KSP-SYNTHETIC-GP',
    assetClassId: 'KSP-SYNTHETIC-ASSET',
    capitalTypeId: 'KSP-SYNTHETIC-CAPITAL',
    teamId: 'KSP-SYNTHETIC-TEAM',
    fundStrategy: 'Synthetic Connection Test',
    displayName: 'ksp-openai-connection-test.txt',
    savedFilename: 'ksp-openai-connection-test.txt',
    mimeType: 'text/plain',
    text: text,
    contentHash: contentHash
  };
  var config = {
    provider: KSP_AI_PROVIDERS.OPENAI,
    vectorStoreId: vectorStoreId,
    modelId: modelId
  };
  var uploaded = null;
  var primaryError = null;
  var cleanupError = null;
  var result = null;
  try {
    kspAssert_(typeof environment.uploadProviderSource === 'function',
      'OPENAI_CONNECTION_TEST_FAILED', 'OpenAI connection test upload is unavailable.');
    kspAssert_(typeof environment.deleteProviderDocument === 'function',
      'OPENAI_CONNECTION_TEST_FAILED', 'OpenAI connection test cleanup is unavailable.');
    uploaded = environment.uploadProviderSource(KSP_AI_PROVIDERS.OPENAI, config, source);
    var providerDocumentId = kspAiTrim_(uploaded && (uploaded.providerDocumentId || uploaded.fileId));
    kspAssert_(uploaded && uploaded.name && providerDocumentId,
      'OPENAI_CONNECTION_TEST_FAILED', 'OpenAI connection test upload identity is invalid.');
    kspAssert_(typeof environment.queryProvider === 'function',
      'OPENAI_CONNECTION_TEST_FAILED', 'OpenAI connection test query is unavailable.');
    var rawResponse = environment.queryProvider(KSP_AI_PROVIDERS.OPENAI, config, {
      provider: KSP_AI_PROVIDERS.OPENAI,
      model: modelId,
      vectorStoreId: vectorStoreId,
      input: 'According to the synthetic connection test source, what is the unique answer token?',
      filters: { type: 'eq', key: 'source_id', value: sourceId },
      include: ['file_search_call.results']
    });
    var parsed = kspNormalizeOpenAiResponse_(rawResponse);
    var state = kspBuildEmptyAiProviderState_();
    state.OPENAI.providerDocumentId = providerDocumentId;
    state.OPENAI.contentHash = contentHash;
    var syntheticRow = {
      Document_ID: sourceId,
      Date: source.dateKey,
      File_URL: 'https://drive.example.invalid/ksp-openai-connection-test',
      Saved_Filename: source.savedFilename,
      Status: KSP_STATUS.ACTIVE,
      AI_Provider_State_JSON: kspSerializeAiProviderState_(state)
    };
    var mapped = kspMapKnowledgeCitations_(parsed.citations,
      kspBuildAuthoritativeSourceMaps_([], [syntheticRow]));
    kspAssert_(parsed.answer && parsed.answer.indexOf('OPENAI_CONNECTION_READY') !== -1,
      'OPENAI_CONNECTION_TEST_FAILED', 'OpenAI connection test answer was not grounded.');
    kspAssert_(!parsed.warnings || parsed.warnings.length === 0,
      'OPENAI_CONNECTION_TEST_FAILED', 'OpenAI connection test citation normalization failed.');
    kspAssert_(mapped.citations.length === 1 && mapped.warnings.length === 0,
      'OPENAI_CONNECTION_TEST_FAILED', 'OpenAI connection test citation was not authoritative.');
    kspAssert_(mapped.citations[0].sourceType === source.sourceType &&
      mapped.citations[0].sourceId === source.sourceId,
      'OPENAI_CONNECTION_TEST_FAILED', 'OpenAI connection test source identity was not exact.');
    result = {
      status: 'PASS',
      sourceCount: 1,
      provenance: kspAiTrim_(parsed.citations[0] && parsed.citations[0].provenance) || 'RETRIEVED_SOURCE'
    };
  } catch (error) {
    primaryError = error;
  } finally {
    if (uploaded && typeof environment.deleteProviderDocument === 'function') {
      try {
        environment.deleteProviderDocument(KSP_AI_PROVIDERS.OPENAI, config, uploaded);
      } catch (error) {
        cleanupError = error;
      }
    }
  }
  if (primaryError) throw primaryError;
  if (cleanupError) {
    cleanupError.code = 'OPENAI_CONNECTION_TEST_CLEANUP_FAILED';
    throw cleanupError;
  }
  return result;
}

function kspAiProviderAdminSafeSyncSummary_(report) {
  var source = report || {};
  var providers = {};
  var errorCodes = [];
  function addErrorCode(collection, code) {
    var normalized = kspAiTrim_(code);
    if (!normalized || collection.indexOf(normalized) !== -1) return;
    collection.push(normalized);
  }
  Object.keys(source.providers || {}).forEach(function (provider) {
    var value = source.providers[provider] || {};
    var providerErrorCodes = [];
    (source.items || []).filter(function (item) { return item && item.provider === provider; })
      .forEach(function (item) { addErrorCode(providerErrorCodes, item.code); });
    (source.errors || []).filter(function (item) { return item && item.provider === provider; })
      .forEach(function (item) { addErrorCode(providerErrorCodes, item.code); });
    providerErrorCodes.forEach(function (code) { addErrorCode(errorCodes, code); });
    providers[provider] = {
      enabled: Boolean(value.enabled),
      status: String(value.status || ''),
      indexed: Number(value.indexed || 0) || 0,
      failed: Number(value.failed || 0) || 0,
      errorCodes: providerErrorCodes
    };
  });
  (source.items || []).forEach(function (item) { addErrorCode(errorCodes, item && item.code); });
  (source.errors || []).forEach(function (item) { addErrorCode(errorCodes, item && item.code); });
  return {
    ok: Boolean(source.ok),
    indexed: Number(source.indexed || 0) || 0,
    reused: Number(source.reused || 0) || 0,
    unchanged: Number(source.unchanged || 0) || 0,
    removed: Number(source.removed || 0) || 0,
    failed: Number(source.failed || 0) || 0,
    errorCodes: errorCodes,
    providers: providers
  };
}

function kspGetAiProviderAdminData_(environment) {
  try {
    var context = environment.loadAiContext();
    var settings = kspNormalizeAiSettings_(context.settings);
    var keyConfigured = kspAiProviderAdminCredentialConfigured_(environment);
    var storeReady = Boolean(settings.openaiVectorStoreId);
    var enabled = Boolean(settings.openaiEnabled);
    var status = enabled && keyConfigured && storeReady && settings.openaiModelId ? 'ACTIVE' : enabled ? 'ERROR'
      : settings.openaiReadiness || (keyConfigured || storeReady ? 'DISABLED' : 'UNCONFIGURED');
    return {
      ok: true,
      workId: '0020',
      canMutate: kspIsAiProviderAdministrator_(environment, context),
      openai: {
        keyConfigured: keyConfigured,
        vectorStoreReady: storeReady,
        enabled: enabled,
        status: status,
        readiness: settings.openaiReadiness || ''
      }
    };
  } catch (error) {
    return kspAiProviderAdminFailure_('OPENAI_ACTIVATION_FAILED');
  }
}

function kspConnectOpenAiProvider_(environment, context, input) {
  var suppliedKey = kspAiTrim_(input && (input.apiKey || input.openaiApiKey));
  if (suppliedKey) kspAiProviderAdminSaveOpenAiApiKey_(environment, suppliedKey);
  kspAssert_(kspAiProviderAdminCredentialConfigured_(environment),
    'OPENAI_API_KEY_NOT_CONFIGURED', 'OpenAI API key is not configured.');
  if (environment && typeof environment.ensureAiSettings === 'function') {
    environment.ensureAiSettings(kspGetAiSettingSeedRows_(environment.nowIso()));
    context = environment.loadAiContext();
  }
  var settings = kspNormalizeAiSettings_(context.settings);
  if (!settings.openaiModelId) {
    kspAiProviderAdminWriteSetting_(environment, context, KSP_AI_SETTINGS.OPENAI_MODEL_ID, KSP_AI_DEFAULTS.OPENAI_DEFAULT_MODEL);
    settings.openaiModelId = KSP_AI_DEFAULTS.OPENAI_DEFAULT_MODEL;
  }
  var vectorStoreId = settings.openaiVectorStoreId;
  if (!vectorStoreId) {
    var created = kspAiProviderAdminCreateStore_(environment);
    vectorStoreId = kspAiTrim_(created && created.id);
    kspAssert_(vectorStoreId, 'OPENAI_ACTIVATION_FAILED', 'OpenAI Vector Store creation did not return an ID.');
    kspAiProviderAdminWriteSetting_(environment, context, KSP_AI_SETTINGS.OPENAI_VECTOR_STORE_ID, vectorStoreId);
  }
  var replacedInaccessibleStore = false;
  var verified;
  try {
    verified = kspAiProviderAdminReadStore_(environment, vectorStoreId);
  } catch (error) {
    if (!kspAiProviderAdminStoreIsInaccessible_(error)) throw error;
    var replacement = kspAiProviderAdminCreateStore_(environment);
    vectorStoreId = kspAiTrim_(replacement && replacement.id);
    kspAssert_(vectorStoreId, 'OPENAI_ACTIVATION_FAILED', 'OpenAI replacement Vector Store creation did not return an ID.');
    kspAiProviderAdminWriteSetting_(environment, context, KSP_AI_SETTINGS.OPENAI_VECTOR_STORE_ID, vectorStoreId);
    replacedInaccessibleStore = true;
    verified = kspAiProviderAdminReadStore_(environment, vectorStoreId);
  }
  kspAssert_(verified && kspAiTrim_(verified.id) === vectorStoreId,
    'OPENAI_ACTIVATION_FAILED', 'OpenAI Vector Store readback failed.');
  kspAiProviderAdminWriteSetting_(environment, context, KSP_AI_SETTINGS.OPENAI_ENABLED, 'false');
  kspAiProviderAdminWriteSetting_(environment, context, KSP_AI_SETTINGS.OPENAI_READINESS, 'TESTING');
  try {
    var connection = kspRunOpenAiSyntheticConnectionTest_(environment, vectorStoreId, settings.openaiModelId);
    if (replacedInaccessibleStore) kspAiProviderAdminResetOpenAiState_(environment, context);
    kspAiProviderAdminWriteSetting_(environment, context, KSP_AI_SETTINGS.OPENAI_READINESS, 'READY_FOR_SYNC');
    return {
      ok: true,
      workId: '0020',
      action: 'CONNECT_OPENAI',
      enabled: false,
      readyForSync: true,
      connection: connection
    };
  } catch (error) {
    try {
      kspAiProviderAdminWriteSetting_(environment, context, KSP_AI_SETTINGS.OPENAI_ENABLED, 'false');
      kspAiProviderAdminWriteSetting_(environment, context, KSP_AI_SETTINGS.OPENAI_READINESS, 'ERROR');
    } catch (ignoredState) {}
    throw error;
  }
}

function kspEnableOpenAiProvider_(environment, context, input) {
  return kspConnectOpenAiProvider_(environment, context, input || {});
}

function kspMutateAiProviderSettings_(environment, input) {
  var action = kspAiTrim_(input && input.action).toUpperCase();
  if (action === 'ENABLE' || action === 'ENABLE_OPENAI' || action === 'CONNECT_OPENAI' || action === 'SAVE_OPENAI_KEY_AND_TEST') action = 'CONNECT_OPENAI';
  if (action === 'DISABLE') action = 'DISABLE_OPENAI';
  if (action === 'SYNC_PROVIDERS') action = 'SYNC';
  if (['CONNECT_OPENAI', 'DISABLE_OPENAI', 'SYNC'].indexOf(action) === -1) {
    return kspAiProviderAdminFailure_('AI_PROVIDER_ADMIN_ACTION_INVALID');
  }
  var context = null;
  var authorized = false;
  try {
    context = environment.loadAiContext();
    kspAssert_(kspIsAiProviderAdministrator_(environment, context),
      'AI_PROVIDER_ADMIN_UNAUTHORIZED', 'AI provider mutation requires an administrator.');
    authorized = true;
    if (action === 'CONNECT_OPENAI') return kspEnableOpenAiProvider_(environment, context, input);
    if (action === 'DISABLE_OPENAI') {
      kspAiProviderAdminWriteSetting_(environment, context, KSP_AI_SETTINGS.OPENAI_ENABLED, 'false');
      kspAiProviderAdminWriteSetting_(environment, context, KSP_AI_SETTINGS.OPENAI_READINESS, 'DISABLED');
      return { ok: true, workId: '0020', action: action, enabled: false, readiness: 'DISABLED', storePreserved: true };
    }
    var sourceType = kspAiProviderAdminNormalizeSourceType_(input);
    var currentSettings = kspNormalizeAiSettings_(context.settings);
    kspAssert_(currentSettings.openaiReadiness === 'READY_FOR_SYNC' ||
      currentSettings.openaiReadiness === 'ACTIVE' || currentSettings.openaiEnabled || !currentSettings.openaiReadiness,
      'OPENAI_NOT_READY_FOR_SYNC', 'OpenAI connection test is required before source sync.');
    kspAiProviderAdminWriteSetting_(environment, context, KSP_AI_SETTINGS.OPENAI_ENABLED, 'true');
    var sync = kspRunProviderNeutralAiSync_(environment, { force: true, sourceType: sourceType });
    if (!sync || !sync.ok) {
      try {
        kspAiProviderAdminWriteSetting_(environment, context, KSP_AI_SETTINGS.OPENAI_ENABLED, 'false');
        kspAiProviderAdminWriteSetting_(environment, context, KSP_AI_SETTINGS.OPENAI_READINESS, 'ERROR');
      } catch (ignoredSyncState) {}
      kspAssert_(false, 'OPENAI_SYNC_FAILED', 'Provider-neutral sync failed.');
    }
    kspAiProviderAdminWriteSetting_(environment, context, KSP_AI_SETTINGS.OPENAI_READINESS, 'ACTIVE');
    var summary = kspAiProviderAdminSafeSyncSummary_(sync);
    summary.sourceType = sourceType;
    return { ok: true, workId: '0020', action: action, sync: summary };
  } catch (error) {
    var code = kspGetErrorCode_(error, 'OPENAI_ACTIVATION_FAILED');
    if (action === 'CONNECT_OPENAI' && context && authorized && code !== 'OPENAI_API_KEY_NOT_CONFIGURED') {
      try {
        kspAiProviderAdminWriteSetting_(environment, context, KSP_AI_SETTINGS.OPENAI_ENABLED, 'false');
        kspAiProviderAdminWriteSetting_(environment, context, KSP_AI_SETTINGS.OPENAI_READINESS, 'ERROR');
      } catch (ignoredDisable) {}
    }
    if (code !== 'AI_PROVIDER_ADMIN_UNAUTHORIZED' && code !== 'OPENAI_API_KEY_NOT_CONFIGURED' &&
        code !== 'OPENAI_API_KEY_INVALID' && code !== 'AI_SYNC_SOURCE_TYPE_INVALID' &&
        code !== 'OPENAI_SYNC_FAILED' && code !== 'OPENAI_NOT_READY_FOR_SYNC') {
      code = action === 'DISABLE_OPENAI' ? 'OPENAI_DISABLE_FAILED'
        : action === 'CONNECT_OPENAI' ? 'OPENAI_CONNECTION_TEST_FAILED' : 'OPENAI_ACTIVATION_FAILED';
    }
    return kspAiProviderAdminFailure_(code);
  }
}
