function kspAiProviderAdminSafeMessage_(code) {
  var messages = {
    AI_PROVIDER_ADMIN_UNAUTHORIZED: 'この操作は管理者だけが実行できます。',
    AI_PROVIDER_ADMIN_ACTION_INVALID: 'AIプロバイダ操作が不正です。',
    OPENAI_API_KEY_NOT_CONFIGURED: 'OpenAI APIキーがScript Propertiesに設定されていません。',
    OPENAI_ACTIVATION_FAILED: 'OpenAIを有効化できませんでした。APIキーと権限を確認してください。',
    OPENAI_DISABLE_FAILED: 'OpenAIを無効化できませんでした。',
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
    var status = enabled && keyConfigured && storeReady && settings.openaiModelId ? 'ENABLED' : enabled ? 'ERROR' : 'DISABLED';
    return {
      ok: true,
      workId: '0020',
      canMutate: kspIsAiProviderAdministrator_(environment, context),
      openai: {
        keyConfigured: keyConfigured,
        vectorStoreReady: storeReady,
        enabled: enabled,
        status: status
      }
    };
  } catch (error) {
    return kspAiProviderAdminFailure_('OPENAI_ACTIVATION_FAILED');
  }
}

function kspEnableOpenAiProvider_(environment, context) {
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
  var verified = kspAiProviderAdminReadStore_(environment, vectorStoreId);
  kspAssert_(verified && kspAiTrim_(verified.id) === vectorStoreId,
    'OPENAI_ACTIVATION_FAILED', 'OpenAI Vector Store readback failed.');
  kspAiProviderAdminWriteSetting_(environment, context, KSP_AI_SETTINGS.OPENAI_ENABLED, 'true');
  var sync;
  try {
    sync = kspRunProviderNeutralAiSync_(environment, { force: true });
    if (!sync || !sync.ok) kspAssert_(false, 'OPENAI_SYNC_FAILED', 'Provider-neutral sync failed.');
  } catch (error) {
    try { kspAiProviderAdminWriteSetting_(environment, context, KSP_AI_SETTINGS.OPENAI_ENABLED, 'false'); } catch (ignoredDisable) {}
    throw error;
  }
  return {
    ok: true,
    workId: '0020',
    action: 'ENABLE_OPENAI',
    enabled: true,
    sync: kspAiProviderAdminSafeSyncSummary_(sync)
  };
}

function kspMutateAiProviderSettings_(environment, input) {
  var action = kspAiTrim_(input && input.action).toUpperCase();
  if (action === 'ENABLE') action = 'ENABLE_OPENAI';
  if (action === 'DISABLE') action = 'DISABLE_OPENAI';
  if (action === 'SYNC_PROVIDERS') action = 'SYNC';
  if (['ENABLE_OPENAI', 'DISABLE_OPENAI', 'SYNC'].indexOf(action) === -1) {
    return kspAiProviderAdminFailure_('AI_PROVIDER_ADMIN_ACTION_INVALID');
  }
  var context = null;
  var openAiWasEnabled = false;
  try {
    context = environment.loadAiContext();
    kspAssert_(kspIsAiProviderAdministrator_(environment, context),
      'AI_PROVIDER_ADMIN_UNAUTHORIZED', 'AI provider mutation requires an administrator.');
    openAiWasEnabled = kspToBoolean_(context.settings && context.settings[KSP_AI_SETTINGS.OPENAI_ENABLED], false);
    if (action === 'ENABLE_OPENAI') return kspEnableOpenAiProvider_(environment, context);
    if (action === 'DISABLE_OPENAI') {
      kspAiProviderAdminWriteSetting_(environment, context, KSP_AI_SETTINGS.OPENAI_ENABLED, 'false');
      return { ok: true, workId: '0020', action: action, enabled: false, storePreserved: true };
    }
    var sync = kspRunProviderNeutralAiSync_(environment, { force: true });
    if (!sync || !sync.ok) kspAssert_(false, 'OPENAI_SYNC_FAILED', 'Provider-neutral sync failed.');
    return { ok: true, workId: '0020', action: action, sync: kspAiProviderAdminSafeSyncSummary_(sync) };
  } catch (error) {
    if (action === 'ENABLE_OPENAI' && context && openAiWasEnabled) {
      try { kspAiProviderAdminWriteSetting_(environment, context, KSP_AI_SETTINGS.OPENAI_ENABLED, 'false'); } catch (ignoredDisable) {}
    }
    var code = kspGetErrorCode_(error, 'OPENAI_ACTIVATION_FAILED');
    if (code !== 'AI_PROVIDER_ADMIN_UNAUTHORIZED' && code !== 'OPENAI_API_KEY_NOT_CONFIGURED' &&
        code !== 'OPENAI_SYNC_FAILED') {
      code = action === 'DISABLE_OPENAI' ? 'OPENAI_DISABLE_FAILED' : 'OPENAI_ACTIVATION_FAILED';
    }
    return kspAiProviderAdminFailure_(code);
  }
}
