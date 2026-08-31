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
    AI_SYNC_SOURCE_TYPE_REQUIRED: '個別同期ではSource Typeを選択してください。',
    AI_SYNC_SOURCE_TYPE_MISMATCH: 'Source TypeとSource IDが一致しません。',
    AI_SYNC_SOURCE_ID_INVALID: '同期対象のSource IDが不正です。',
    AI_SYNC_SOURCE_NOT_FOUND: '同期対象の資料が見つかりません。',
    AI_SYNC_SOURCE_AMBIGUOUS: '同期対象の資料を一意に確認できません。',
    OPENAI_SYNC_FAILED: 'AI同期を完了できませんでした。設定と権限を確認してください。',
    AI_MODEL_POLICY_INVALID: 'モデルポリシーを確認できませんでした。',
    AI_MODEL_POLICY_JSON_INVALID: 'モデルポリシーを確認できませんでした。',
    AI_MODEL_POLICY_WRITE_UNAVAILABLE: 'モデルポリシーを保存できませんでした。',
    AI_MODEL_PROFILE_ID_INVALID: 'モデルプロファイルIDを確認してください。',
    AI_MODEL_PROFILE_DUPLICATE: 'モデルプロファイルIDが重複しています。',
    AI_MODEL_DEFAULT_REQUIRED: 'プロバイダの既定モデルを1つ選択してください。',
    AI_MODEL_DEFAULT_DUPLICATE: 'プロバイダの既定モデルは1つだけ選択できます。',
    AI_MODEL_SELECTION_STALE: '対象のモデルプロファイルを確認してください。',
    AI_MODEL_PROFILE_PROVIDER_MISMATCH: 'モデルとプロバイダの組み合わせを確認してください。',
    AI_MODEL_QUALIFICATION_PROVIDER_UNSUPPORTED: 'このプロバイダの接続確認は現在利用できません。',
    AI_MODEL_QUALIFICATION_FAILED: 'モデルのFile Search接続確認に失敗しました。'
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
  return kspNormalizeProviderAiSelection_(input).sourceType;
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
      usable: value.usable !== false,
      status: String(value.status || ''),
      selected: Number(value.selected || 0) || 0,
      indexed: Number(value.indexed || 0) || 0,
      failed: Number(value.failed || 0) || 0,
      errorCodes: providerErrorCodes
    };
  });
  (source.items || []).forEach(function (item) { addErrorCode(errorCodes, item && item.code); });
  (source.errors || []).forEach(function (item) { addErrorCode(errorCodes, item && item.code); });
  return {
    ok: Boolean(source.ok),
    usable: source.providerOk !== false && (source.errors || []).length === 0,
    partial: Boolean(source.partial) || (source.providerOk !== false && (source.errors || []).length === 0 && Number(source.failed || 0) > 0),
    selected: Number(source.selected || 0) || 0,
    indexed: Number(source.indexed || 0) || 0,
    reused: Number(source.reused || 0) || 0,
    unchanged: Number(source.unchanged || 0) || 0,
    removed: Number(source.removed || 0) || 0,
    failed: Number(source.failed || 0) || 0,
    skippedClaims: Number(source.skippedClaims || 0) || 0,
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
    var status = enabled && keyConfigured && storeReady && settings.openaiModelId
      ? (settings.openaiReadiness === 'ACTIVE_WITH_SYNC_ERRORS' ? 'ACTIVE_WITH_SYNC_ERRORS' : 'ACTIVE') : enabled ? 'ERROR'
      : settings.openaiReadiness || (keyConfigured || storeReady ? 'DISABLED' : 'UNCONFIGURED');
    var openAiConfig = kspBuildAiProviderConfig_(settings, KSP_AI_PROVIDERS.OPENAI);
    openAiConfig.credentialConfigured = keyConfigured;
    var policy = settings.modelPolicyJson
      ? kspNormalizeAiModelPolicy_(settings.modelPolicyJson)
      : kspBuildMigratedOpenAiModelPolicy_(settings, {
        modelId: settings.openaiModelId,
        accessible: keyConfigured,
        qualified: enabled && (status === 'ACTIVE' || status === 'ACTIVE_WITH_SYNC_ERRORS'),
        nowIso: environment.nowIso()
      });
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
      },
      modelPolicyPersisted: Boolean(settings.modelPolicyJson),
      modelPolicy: kspAiModelPolicyForAdmin_(policy)
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
    var connectionSettings = kspNormalizeAiSettings_(context.settings);
    connectionSettings.openaiModelId = settings.openaiModelId;
    connectionSettings.openaiEnabled = true;
    connectionSettings.openaiReadiness = 'ACTIVE';
    if (!connectionSettings.modelPolicyJson) {
      kspPersistAiModelPolicy_(environment, context, kspBuildMigratedOpenAiModelPolicy_(connectionSettings, {
        modelId: settings.openaiModelId, accessible: true, qualified: true, nowIso: environment.nowIso()
      }));
    }
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
  if (action === 'MIGRATE_POLICY') action = 'MIGRATE_MODEL_POLICY';
  if (action === 'SAVE_MODEL') action = 'SAVE_MODEL_PROFILE';
  if (action === 'QUALIFY_MODEL') action = 'QUALIFY_MODEL_PROFILE';
  if (['CONNECT_OPENAI', 'DISABLE_OPENAI', 'SYNC', 'MIGRATE_MODEL_POLICY',
      'SAVE_MODEL_PROFILE', 'QUALIFY_MODEL_PROFILE'].indexOf(action) === -1) {
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
    if (action === 'MIGRATE_MODEL_POLICY' || action === 'SAVE_MODEL_PROFILE' || action === 'QUALIFY_MODEL_PROFILE') {
      var policySettings = kspNormalizeAiSettings_(context.settings);
      var policy = policySettings.modelPolicyJson
        ? kspNormalizeAiModelPolicy_(policySettings.modelPolicyJson)
        : kspBuildMigratedOpenAiModelPolicy_(policySettings, {
          modelId: policySettings.openaiModelId,
          accessible: kspAiProviderAdminCredentialConfigured_(environment),
          qualified: policySettings.openaiEnabled &&
            ['ACTIVE', 'ACTIVE_WITH_SYNC_ERRORS', 'READY_FOR_SYNC'].indexOf(policySettings.openaiReadiness) !== -1,
          nowIso: environment.nowIso()
        });
      if (action === 'MIGRATE_MODEL_POLICY') {
        policy = kspPersistAiModelPolicy_(environment, context, policy);
        return { ok: true, workId: '0025', action: action, modelPolicy: kspAiModelPolicyForAdmin_(policy) };
      }
      if (action === 'SAVE_MODEL_PROFILE') {
        policy = kspUpsertAiModelProfile_(policy, input.profile || input, environment.nowIso());
        policy = kspPersistAiModelPolicy_(environment, context, policy);
        var savedProfile = policy.profiles.filter(function (item) {
          return item.profileId === kspAiTrim_((input.profile || input).profileId).toLowerCase();
        })[0];
        if (savedProfile && savedProfile.provider === KSP_AI_PROVIDERS.OPENAI && savedProfile.isProviderDefault) {
          kspAiProviderAdminWriteSetting_(environment, context, KSP_AI_SETTINGS.OPENAI_MODEL_ID, savedProfile.modelId);
        }
        return { ok: true, workId: '0025', action: action, modelPolicy: kspAiModelPolicyForAdmin_(policy) };
      }
      var profileId = kspAiTrim_(input.profileId).toLowerCase();
      var qualifyingProfile = policy.profiles.filter(function (item) { return item.profileId === profileId; })[0];
      kspAssert_(qualifyingProfile, 'AI_MODEL_SELECTION_STALE', 'Model profile is missing.');
      kspAssert_(qualifyingProfile.provider === KSP_AI_PROVIDERS.OPENAI,
        'AI_MODEL_QUALIFICATION_PROVIDER_UNSUPPORTED', 'Only OpenAI qualification is enabled in this Work.');
      kspAssert_(kspAiProviderAdminCredentialConfigured_(environment) && policySettings.openaiVectorStoreId,
        'OPENAI_API_KEY_NOT_CONFIGURED', 'OpenAI is not configured.');
      try {
        var qualification = kspRunOpenAiSyntheticConnectionTest_(environment,
          policySettings.openaiVectorStoreId, qualifyingProfile.modelId);
        policy = kspMarkAiModelProfileQualification_(policy, profileId,
          { passed: true, accessible: true }, environment.nowIso());
        policy = kspPersistAiModelPolicy_(environment, context, policy);
        return { ok: true, workId: '0025', action: action, qualification: qualification,
          modelPolicy: kspAiModelPolicyForAdmin_(policy) };
      } catch (qualificationError) {
        var qualificationCode = kspGetErrorCode_(qualificationError);
        var inaccessible = qualificationCode === 'OPENAI_HTTP_401' || qualificationCode === 'OPENAI_HTTP_403' ||
          qualificationCode === 'OPENAI_HTTP_404';
        try {
          policy = kspMarkAiModelProfileQualification_(policy, profileId,
            { passed: false, accessible: inaccessible ? false : null }, environment.nowIso());
          kspPersistAiModelPolicy_(environment, context, policy);
        } catch (ignoredQualificationState) {}
        throw kspAiModelPolicyError_('AI_MODEL_QUALIFICATION_FAILED');
      }
    }
    if (action === 'DISABLE_OPENAI') {
      kspAiProviderAdminWriteSetting_(environment, context, KSP_AI_SETTINGS.OPENAI_ENABLED, 'false');
      kspAiProviderAdminWriteSetting_(environment, context, KSP_AI_SETTINGS.OPENAI_READINESS, 'DISABLED');
      return { ok: true, workId: '0020', action: action, enabled: false, readiness: 'DISABLED', storePreserved: true };
    }
    var normalizedSelection = kspNormalizeProviderAiSelection_(input);
    var sourceType = normalizedSelection.sourceType;
    var sourceId = normalizedSelection.sourceId;
    var currentSettings = kspNormalizeAiSettings_(context.settings);
    kspAssert_(currentSettings.openaiReadiness === 'READY_FOR_SYNC' ||
      currentSettings.openaiReadiness === 'ACTIVE' || currentSettings.openaiEnabled || !currentSettings.openaiReadiness,
      'OPENAI_NOT_READY_FOR_SYNC', 'OpenAI connection test is required before source sync.');
    if (sourceId) {
      kspSelectProviderAiWorkItems_(context.meetingRows, context.pitchbookRows, environment.nowIso(),
        currentSettings, KSP_AI_PROVIDERS.OPENAI, normalizedSelection);
    }
    kspAiProviderAdminWriteSetting_(environment, context, KSP_AI_SETTINGS.OPENAI_ENABLED, 'true');
    var syncOptions = {
      force: true,
      sourceType: sourceType,
      providers: [KSP_AI_PROVIDERS.OPENAI]
    };
    if (sourceId) syncOptions.sourceId = sourceId;
    var sync = kspRunProviderNeutralAiSync_(environment, syncOptions);
    var providerFailure = !sync || sync.providerOk === false || (sync.errors || []).length > 0 ||
      (sync.ok === false && !sync.partial && !Number(sync.failed || 0));
    if (providerFailure) {
      try {
        kspAiProviderAdminWriteSetting_(environment, context, KSP_AI_SETTINGS.OPENAI_ENABLED, 'false');
        kspAiProviderAdminWriteSetting_(environment, context, KSP_AI_SETTINGS.OPENAI_READINESS, 'ERROR');
      } catch (ignoredSyncState) {}
      kspAssert_(false, 'OPENAI_SYNC_FAILED', 'Provider-neutral sync failed.');
    }
    var summary = kspAiProviderAdminSafeSyncSummary_(sync);
    summary.sourceType = sourceType;
    summary.exact = Boolean(sourceId);
    kspAiProviderAdminWriteSetting_(environment, context, KSP_AI_SETTINGS.OPENAI_READINESS,
      summary.partial ? 'ACTIVE_WITH_SYNC_ERRORS' : 'ACTIVE');
    return { ok: true, workId: '0020', action: action, sync: summary };
  } catch (error) {
    var code = kspGetErrorCode_(error, 'OPENAI_ACTIVATION_FAILED');
    if (action === 'CONNECT_OPENAI' && context && authorized && code !== 'OPENAI_API_KEY_NOT_CONFIGURED') {
      try {
        kspAiProviderAdminWriteSetting_(environment, context, KSP_AI_SETTINGS.OPENAI_ENABLED, 'false');
        kspAiProviderAdminWriteSetting_(environment, context, KSP_AI_SETTINGS.OPENAI_READINESS, 'ERROR');
      } catch (ignoredDisable) {}
    }
    var modelPolicyError = code.indexOf('AI_MODEL_') === 0 || code.indexOf('AI_THINKING_') === 0;
    if (!modelPolicyError && code !== 'AI_PROVIDER_ADMIN_UNAUTHORIZED' && code !== 'OPENAI_API_KEY_NOT_CONFIGURED' &&
        code !== 'OPENAI_API_KEY_INVALID' && code !== 'AI_SYNC_SOURCE_TYPE_INVALID' &&
        code !== 'AI_SYNC_SOURCE_TYPE_REQUIRED' && code !== 'AI_SYNC_SOURCE_TYPE_MISMATCH' &&
        code !== 'AI_SYNC_SOURCE_ID_INVALID' && code !== 'AI_SYNC_SOURCE_NOT_FOUND' &&
        code !== 'AI_SYNC_SOURCE_AMBIGUOUS' && code !== 'OPENAI_SYNC_FAILED' &&
        code !== 'OPENAI_NOT_READY_FOR_SYNC') {
      code = action === 'DISABLE_OPENAI' ? 'OPENAI_DISABLE_FAILED'
        : action === 'CONNECT_OPENAI' ? 'OPENAI_CONNECTION_TEST_FAILED' : 'OPENAI_ACTIVATION_FAILED';
    }
    return kspAiProviderAdminFailure_(code);
  }
}
