function kspAiProviderAdminSafeMessage_(code) {
  var messages = {
    AI_PROVIDER_ADMIN_UNAUTHORIZED: 'この操作は管理者だけが実行できます。',
    AI_PROVIDER_ADMIN_ACTION_INVALID: 'AIプロバイダ操作が不正です。',
    SHARED_ADMIN_ACTION_INVALID: '管理者モード操作が不正です。',
    SHARED_ADMIN_STORAGE_UNAVAILABLE: '管理者認証状態を確認できませんでした。',
    SHARED_ADMIN_CREDENTIAL_INVALID: '管理者認証状態を確認できませんでした。',
    SHARED_ADMIN_CREDENTIAL_NOT_CONFIGURED: '管理者パスワードが未設定です。',
    SHARED_ADMIN_ALREADY_CONFIGURED: '管理者パスワードは設定済みです。',
    SHARED_ADMIN_BOOTSTRAP_UNAUTHORIZED: '初回管理者設定を実行できません。',
    SHARED_ADMIN_PASSWORD_INVALID: '管理者パスワードは8文字以上256文字以下で入力してください。',
    SHARED_ADMIN_PASSWORD_MISMATCH: '管理者パスワードの確認入力が一致しません。',
    SHARED_ADMIN_UNLOCK_FAILED: '管理者パスワードを確認できませんでした。',
    SHARED_ADMIN_SESSION_INVALID: '管理者モードのロック解除が必要です。',
    OPENAI_API_KEY_NOT_CONFIGURED: 'OpenAI APIキーがScript Propertiesに設定されていません。',
    OPENAI_API_KEY_INVALID: 'OpenAI APIキーを確認できませんでした。',
    OPENAI_ACTIVATION_FAILED: 'OpenAIを有効化できませんでした。APIキーと権限を確認してください。',
    OPENAI_CONNECTION_TEST_FAILED: 'OpenAI接続確認に失敗しました。APIキーと権限を確認してください。',
    OPENAI_NOT_READY_FOR_SYNC: 'OpenAI接続確認が完了していないため、資料同期を開始できません。',
    OPENAI_DISABLE_FAILED: 'OpenAIを無効化できませんでした。',
    GEMINI_API_KEY_NOT_CONFIGURED: 'Gemini APIキーがScript Propertiesに設定されていません。',
    GEMINI_API_KEY_INVALID: 'Gemini APIキーを確認できませんでした。',
    GEMINI_STORE_NOT_CONFIGURED: 'Gemini File Search Storeが設定されていません。',
    GEMINI_CONNECTION_TEST_FAILED: 'Gemini接続確認に失敗しました。APIキー、Store、権限を確認してください。',
    GEMINI_NOT_READY: 'Geminiの接続確認とモデル資格確認が完了していません。',
    GEMINI_SYNC_FAILED: 'Gemini個別同期を完了できませんでした。',
    GEMINI_DISABLE_FAILED: 'Geminiを無効化できませんでした。',
    AI_GEMINI_MODEL_UNSUPPORTED: '選択したGeminiモデルはこのAPIまたはプロジェクトで利用できません。',
    AI_GEMINI_MODEL_ACCESS_DENIED: '選択したGeminiモデルへのアクセスが許可されていません。',
    AI_GEMINI_CREDENTIAL_REJECTED: 'Gemini APIキーまたはプロジェクト権限を確認してください。',
    AI_GEMINI_QUALIFICATION_HTTP_FAILURE: 'Geminiモデル資格確認のHTTPまたは認証状態を確認できませんでした。',
    AI_GEMINI_QUALIFICATION_AUTH_FAILURE: 'Gemini APIキーまたは権限を確認してください。',
    AI_GEMINI_QUALIFICATION_TRANSIENT_FAILURE: 'Geminiサービスの一時的な制約により資格確認を完了できませんでした。',
    AI_GEMINI_QUALIFICATION_EMPTY_RESPONSE: 'Geminiモデル資格確認で空の応答が返されました。',
    AI_GEMINI_QUALIFICATION_TEXT_EXTRACTION_FAILED: 'Geminiモデル資格確認の本文を抽出できませんでした。',
    AI_GEMINI_QUALIFICATION_TOKEN_MISMATCH: 'Geminiモデル資格確認の回答内容が一致しませんでした。',
    AI_GEMINI_QUALIFICATION_FINISH_LIMIT: 'Geminiモデル資格確認が安全性または出力上限で終了しました。',
    AI_GEMINI_QUALIFICATION_PROVIDER_TERMINAL: 'Geminiモデル資格確認がプロバイダ終端状態になりました。',
    AI_GEMINI_QUALIFICATION_NO_GROUNDED_ANSWER: 'Geminiモデル資格確認で根拠付き回答を確認できませんでした。',
    AI_GEMINI_QUALIFICATION_NO_FILE_CITATION: 'Geminiモデル資格確認でFile Search引用を確認できませんでした。',
    AI_GEMINI_QUALIFICATION_CITATION_MISMATCH: 'Geminiモデル資格確認の引用を正規化できませんでした。',
    AI_GEMINI_QUALIFICATION_APPLICATION_FAILURE: 'Geminiモデル資格確認の応答形式を確認できませんでした。',
    AI_GEMINI_EXTERNAL_LIMITATION: 'Geminiは確認された外部制約により現在利用できません。',
    AI_GEMINI_TRANSIENT_PROVIDER_LIMITATION: 'Geminiサービスの一時的な制約により現在利用できません。',
    AI_GEMINI_MODEL_ACCESS_LIMITATION: '指定したGeminiモデルを現在利用できません。',
    AI_GEMINI_RESOURCE_CLEANUP_BLOCKED: '一時的なGeminiリソースの削除確認が必要です。',
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
    AI_MODEL_QUALIFICATION_FAILED: 'モデルのFile Search接続確認に失敗しました。',
    AI_THINKING_PROFILE_UNQUALIFIED: 'Thinkingの接続確認が完了していません。'
  };
  return messages[String(code || '')] || 'AIプロバイダ操作を完了できませんでした。';
}

function kspAiProviderAdminFailure_(code, qualificationEvidence) {
  var output = {
    ok: false,
    workId: String(code || '').indexOf('SHARED_ADMIN_') === 0 ? '0028' : '0020',
    error: { code: String(code || 'OPENAI_ACTIVATION_FAILED'), message: kspAiProviderAdminSafeMessage_(code) }
  };
  if (qualificationEvidence) {
    if (qualificationEvidence.terminalOutcome) {
      output.workId = '0027';
      output.terminalOutcome = kspGeminiE2eSafeOutcome_(qualificationEvidence.terminalOutcome);
      output.qualificationEvidence = kspGeminiE2eSafeEvidence_(qualificationEvidence);
    } else {
      output.workId = '0026';
      output.qualificationEvidence = kspGeminiQualificationSafeCampaignEvidence_(qualificationEvidence);
    }
  }
  return output;
}

var KSP_SHARED_ADMIN_PROPERTY_KEYS = Object.freeze({
  SALT: 'KSP_SHARED_ADMIN_PASSWORD_SALT',
  VERIFIER: 'KSP_SHARED_ADMIN_PASSWORD_VERIFIER',
  SIGNING_SECRET: 'KSP_SHARED_ADMIN_TOKEN_SIGNING_SECRET',
  GENERATION: 'KSP_SHARED_ADMIN_CREDENTIAL_GENERATION'
});

var KSP_SHARED_ADMIN_TOKEN_VERSION = 'KSP1';

function kspSharedAdminReadCredential_(environment) {
  kspAssert_(environment && typeof environment.readSharedAdminCredential === 'function',
    'SHARED_ADMIN_STORAGE_UNAVAILABLE', 'Shared administrator credential storage is unavailable.');
  var raw = environment.readSharedAdminCredential() || {};
  var state = {
    salt: String(raw.salt || ''),
    verifier: String(raw.verifier || ''),
    signingSecret: String(raw.signingSecret || ''),
    generation: String(raw.generation || '')
  };
  var values = [state.salt, state.verifier, state.signingSecret, state.generation];
  var populated = values.filter(function (value) { return Boolean(value); }).length;
  if (!populated) return { configured: false };
  kspAssert_(populated === values.length && /^[A-Za-z0-9_-]{32,128}$/.test(state.salt) &&
    /^[A-Za-z0-9_-]{32,128}$/.test(state.verifier) &&
    /^[A-Za-z0-9_-]{32,128}$/.test(state.signingSecret) &&
    /^[1-9][0-9]{0,9}$/.test(state.generation),
    'SHARED_ADMIN_CREDENTIAL_INVALID', 'Shared administrator credential state is invalid.');
  state.configured = true;
  state.generation = Number(state.generation);
  return state;
}

function kspSharedAdminPassword_(value) {
  var password = value === undefined || value === null ? '' : String(value);
  kspAssert_(password.length >= 8 && password.length <= 256 && /\S/.test(password),
    'SHARED_ADMIN_PASSWORD_INVALID', 'Shared administrator password is invalid.');
  return password;
}

function kspSharedAdminConstantTimeEquals_(left, right) {
  var a = String(left || '');
  var b = String(right || '');
  var difference = a.length ^ b.length;
  var length = Math.max(a.length, b.length);
  for (var index = 0; index < length; index += 1) {
    difference |= (a.charCodeAt(index) || 0) ^ (b.charCodeAt(index) || 0);
  }
  return difference === 0;
}

function kspSharedAdminHmac_(environment, value, key) {
  kspAssert_(environment && typeof environment.sharedAdminHmac === 'function',
    'SHARED_ADMIN_STORAGE_UNAVAILABLE', 'Shared administrator HMAC is unavailable.');
  var result = String(environment.sharedAdminHmac(String(value), String(key)) || '');
  kspAssert_(/^[A-Za-z0-9_-]{32,128}$/.test(result),
    'SHARED_ADMIN_CREDENTIAL_INVALID', 'Shared administrator HMAC output is invalid.');
  return result;
}

function kspSharedAdminRandom_(environment, purpose) {
  kspAssert_(environment && typeof environment.sharedAdminRandom === 'function',
    'SHARED_ADMIN_STORAGE_UNAVAILABLE', 'Shared administrator random source is unavailable.');
  var value = String(environment.sharedAdminRandom(String(purpose || '')) || '');
  kspAssert_(/^[A-Za-z0-9_-]{32,128}$/.test(value),
    'SHARED_ADMIN_CREDENTIAL_INVALID', 'Shared administrator random value is invalid.');
  return value;
}

function kspSharedAdminPasswordVerifier_(environment, password, salt) {
  return kspSharedAdminHmac_(environment, 'KSP_SHARED_ADMIN_PASSWORD_V1|' + String(salt), password);
}

function kspSharedAdminBuildCredential_(environment, password, generation) {
  var salt = kspSharedAdminRandom_(environment, 'PASSWORD_SALT');
  return {
    configured: true,
    salt: salt,
    verifier: kspSharedAdminPasswordVerifier_(environment, password, salt),
    signingSecret: kspSharedAdminRandom_(environment, 'TOKEN_SIGNING_SECRET'),
    generation: Number(generation)
  };
}

function kspSharedAdminTokenSignature_(environment, state, nonce) {
  return kspSharedAdminHmac_(environment,
    'KSP_SHARED_ADMIN_TOKEN_V1|' + String(state.generation) + '|' + String(nonce),
    state.signingSecret);
}

function kspSharedAdminIssueToken_(environment, state) {
  var nonce = kspSharedAdminRandom_(environment, 'SESSION_NONCE');
  return [KSP_SHARED_ADMIN_TOKEN_VERSION, String(state.generation), nonce,
    kspSharedAdminTokenSignature_(environment, state, nonce)].join('.');
}

function kspSharedAdminValidateToken_(environment, token, suppliedState) {
  var state = suppliedState || kspSharedAdminReadCredential_(environment);
  kspAssert_(state.configured, 'SHARED_ADMIN_CREDENTIAL_NOT_CONFIGURED',
    'Shared administrator credential is not configured.');
  var normalized = token === undefined || token === null ? '' : String(token);
  var parts = normalized.split('.');
  kspAssert_(parts.length === 4 && parts[0] === KSP_SHARED_ADMIN_TOKEN_VERSION &&
    /^[1-9][0-9]{0,9}$/.test(parts[1]) && /^[A-Za-z0-9_-]{32,128}$/.test(parts[2]) &&
    /^[A-Za-z0-9_-]{32,128}$/.test(parts[3]) && Number(parts[1]) === state.generation,
    'SHARED_ADMIN_SESSION_INVALID', 'Shared administrator session is invalid.');
  var expected = kspSharedAdminTokenSignature_(environment, state, parts[2]);
  kspAssert_(kspSharedAdminConstantTimeEquals_(expected, parts[3]),
    'SHARED_ADMIN_SESSION_INVALID', 'Shared administrator session is invalid.');
  return true;
}

function kspSharedAdminTryValidateToken_(environment, token, state) {
  if (!token || !state || !state.configured) return false;
  try { return kspSharedAdminValidateToken_(environment, token, state); }
  catch (ignored) { return false; }
}

function kspSharedAdminWriteCredential_(environment, state) {
  kspAssert_(environment && typeof environment.writeSharedAdminCredential === 'function',
    'SHARED_ADMIN_STORAGE_UNAVAILABLE', 'Shared administrator credential storage is unavailable.');
  environment.writeSharedAdminCredential({
    salt: state.salt,
    verifier: state.verifier,
    signingSecret: state.signingSecret,
    generation: String(state.generation)
  });
}

function kspSharedAdminWithLock_(environment, callback) {
  kspAssert_(environment && typeof environment.withSharedAdminLock === 'function',
    'SHARED_ADMIN_STORAGE_UNAVAILABLE', 'Shared administrator lock is unavailable.');
  return environment.withSharedAdminLock(callback);
}

function kspManageSharedAdminSession_(environment, input) {
  var action = kspAiTrim_(input && input.action).toUpperCase();
  if (['BOOTSTRAP', 'UNLOCK', 'CHANGE_PASSWORD'].indexOf(action) === -1) {
    return kspAiProviderAdminFailure_('SHARED_ADMIN_ACTION_INVALID');
  }
  try {
    if (action === 'BOOTSTRAP') {
      var bootstrapPassword = kspSharedAdminPassword_(input && input.password);
      kspAssert_(bootstrapPassword === String(input && input.passwordConfirmation || ''),
        'SHARED_ADMIN_PASSWORD_MISMATCH', 'Shared administrator password confirmation does not match.');
      var context = environment.loadAiContext();
      return kspSharedAdminWithLock_(environment, function () {
        var current = kspSharedAdminReadCredential_(environment);
        kspAssert_(!current.configured, 'SHARED_ADMIN_ALREADY_CONFIGURED',
          'Shared administrator credential is already configured.');
        kspAssert_(kspIsAiProviderAdministrator_(environment, context),
          'SHARED_ADMIN_BOOTSTRAP_UNAUTHORIZED', 'Shared administrator bootstrap is unauthorized.');
        var next = kspSharedAdminBuildCredential_(environment, bootstrapPassword, 1);
        var token = kspSharedAdminIssueToken_(environment, next);
        kspSharedAdminWriteCredential_(environment, next);
        return { ok: true, workId: '0028', action: action, adminSessionToken: token,
          adminAuth: { credentialConfigured: true, canBootstrap: false, unlocked: true } };
      });
    }
    if (action === 'UNLOCK') {
      var state = kspSharedAdminReadCredential_(environment);
      kspAssert_(state.configured, 'SHARED_ADMIN_CREDENTIAL_NOT_CONFIGURED',
        'Shared administrator credential is not configured.');
      var password = kspSharedAdminPassword_(input && input.password);
      var actual = kspSharedAdminPasswordVerifier_(environment, password, state.salt);
      kspAssert_(kspSharedAdminConstantTimeEquals_(actual, state.verifier),
        'SHARED_ADMIN_UNLOCK_FAILED', 'Shared administrator unlock failed.');
      return { ok: true, workId: '0028', action: action,
        adminSessionToken: kspSharedAdminIssueToken_(environment, state),
        adminAuth: { credentialConfigured: true, canBootstrap: false, unlocked: true } };
    }
    var nextPassword = kspSharedAdminPassword_(input && input.newPassword);
    kspAssert_(nextPassword === String(input && input.newPasswordConfirmation || ''),
      'SHARED_ADMIN_PASSWORD_MISMATCH', 'Shared administrator password confirmation does not match.');
    return kspSharedAdminWithLock_(environment, function () {
      var currentState = kspSharedAdminReadCredential_(environment);
      kspSharedAdminValidateToken_(environment, input && input.adminSessionToken, currentState);
      var nextState = kspSharedAdminBuildCredential_(environment, nextPassword, currentState.generation + 1);
      var replacementToken = kspSharedAdminIssueToken_(environment, nextState);
      kspSharedAdminWriteCredential_(environment, nextState);
      return { ok: true, workId: '0028', action: action, adminSessionToken: replacementToken,
        adminAuth: { credentialConfigured: true, canBootstrap: false, unlocked: true } };
    });
  } catch (error) {
    var code = kspGetErrorCode_(error, 'SHARED_ADMIN_CREDENTIAL_INVALID');
    if (String(code).indexOf('SHARED_ADMIN_') !== 0) code = 'SHARED_ADMIN_CREDENTIAL_INVALID';
    return kspAiProviderAdminFailure_(code);
  }
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

function kspAiProviderAdminGeminiCredentialConfigured_(environment) {
  if (environment && typeof environment.isGeminiCredentialConfigured === 'function') {
    return Boolean(environment.isGeminiCredentialConfigured());
  }
  try {
    kspGeminiApiKeyLive_();
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

function kspAiProviderAdminSaveGeminiApiKey_(environment, value) {
  var key = kspAiTrim_(value);
  kspAssert_(key && key.length <= 512, 'GEMINI_API_KEY_INVALID', 'Gemini API key is invalid.');
  if (environment && typeof environment.saveGeminiApiKey === 'function') {
    environment.saveGeminiApiKey(key);
    return true;
  }
  kspAssert_(typeof PropertiesService !== 'undefined' && PropertiesService.getScriptProperties,
    'GEMINI_API_KEY_INVALID', 'Gemini API key storage is unavailable.');
  PropertiesService.getScriptProperties().setProperty(KSP_AI_PROPERTY_KEYS.API_KEY, key);
  return true;
}

function kspAiProviderAdminReadGeminiStore_(environment, storeName) {
  if (environment && typeof environment.getGeminiFileSearchStore === 'function') {
    return environment.getGeminiFileSearchStore(storeName);
  }
  return kspNormalizeFileSearchStore_(kspGeminiJsonRequestLive_('GET', '/' + kspAiStoreResourcePath_(storeName), null, {
    retryPolicy: KSP_GEMINI_RETRY_POLICIES.IDEMPOTENT,
    stage: 'STORE_READ', errorCode: 'AI_STORE_READ_FAILED'
  }));
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

function kspRunOpenAiSyntheticConnectionTest_(environment, vectorStoreId, profileOrModelId) {
  var legacyModelOnly = typeof profileOrModelId === 'string';
  var profile = legacyModelOnly ? {
    modelId: profileOrModelId,
    maxOutputTokens: null,
    defaultThinkingProfileId: KSP_AI_DEFAULTS.PROVIDER_DEFAULT_THINKING_PROFILE_ID,
    thinkingProfiles: [kspBuildProviderDefaultThinkingProfile_()]
  } : profileOrModelId || {};
  var modelId = kspAiTrim_(profile.modelId);
  var thinkingProfiles = (profile.thinkingProfiles || []).filter(function (thinking) {
    return thinking && thinking.enabled !== false;
  });
  kspAssert_(vectorStoreId && modelId && thinkingProfiles.length,
    'OPENAI_CONNECTION_TEST_FAILED', 'OpenAI connection test configuration is incomplete.');
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
    var thinkingResults = [];
    var inaccessible = false;
    thinkingProfiles.forEach(function (thinking) {
      if (inaccessible) {
        thinkingResults.push({ thinkingProfileId: thinking.thinkingProfileId, passed: false });
        return;
      }
      try {
        var tupleConfig = {
          provider: KSP_AI_PROVIDERS.OPENAI,
          vectorStoreId: vectorStoreId,
          modelId: modelId,
          thinkingProfileId: thinking.thinkingProfileId,
          thinkingProviderDefault: thinking.providerDefault === true,
          thinkingRawValue: thinking.providerDefault === true ? null : thinking.rawValue,
          maxOutputTokens: profile.maxOutputTokens === undefined ? null : profile.maxOutputTokens
        };
        var request = kspBuildProviderSearchRequest_(KSP_AI_PROVIDERS.OPENAI, tupleConfig, {
          mode: KSP_FEATURE_FREEZE_SEARCH_MODES.FREE_QUESTION,
          questionOrInstruction: 'According to the synthetic connection test source, what is the unique answer token?',
          sourceId: sourceId
        });
        request.include = ['file_search_call.results'];
        var rawResponse = environment.queryProvider(KSP_AI_PROVIDERS.OPENAI, tupleConfig, request);
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
        thinkingResults.push({ thinkingProfileId: thinking.thinkingProfileId, passed: true,
          provenance: kspAiTrim_(parsed.citations[0] && parsed.citations[0].provenance) || 'RETRIEVED_SOURCE' });
      } catch (queryError) {
        var queryCode = kspGetErrorCode_(queryError);
        inaccessible = queryCode === 'OPENAI_HTTP_401' || queryCode === 'OPENAI_HTTP_403' ||
          queryCode === 'OPENAI_HTTP_404';
        thinkingResults.push({ thinkingProfileId: thinking.thinkingProfileId, passed: false });
      }
    });
    var passedCount = thinkingResults.filter(function (item) { return item.passed; }).length;
    result = {
      status: passedCount === thinkingResults.length ? 'PASS' : passedCount ? 'PARTIAL' : 'FAIL',
      sourceCount: 1,
      qualified: passedCount,
      failed: thinkingResults.length - passedCount,
      accessible: !inaccessible,
      thinkingResults: thinkingResults
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
  if (legacyModelOnly) {
    kspAssert_(result && result.status === 'PASS',
      'OPENAI_CONNECTION_TEST_FAILED', 'OpenAI connection test did not qualify the default tuple.');
  }
  return result;
}

function kspGeminiQualificationSafeTransport_(value) {
  var transport = kspAiTrim_(value).toUpperCase();
  return transport === KSP_AI_QUERY_TRANSPORTS.GENERATE_CONTENT
    ? KSP_AI_QUERY_TRANSPORTS.GENERATE_CONTENT : KSP_AI_QUERY_TRANSPORTS.INTERACTIONS;
}

function kspGeminiQualificationSafeProviderStatus_(value) {
  var status = kspAiTrim_(value).toLowerCase();
  return ['failed', 'cancelled', 'requires_action', 'incomplete', 'budget_exceeded']
    .indexOf(status) !== -1 ? status : '';
}

function kspGeminiQualificationSafeStage_(value) {
  var stage = kspAiTrim_(value).toUpperCase();
  var allowed = {
    MODELS_VISIBILITY: true,
    SHORT_INTERACTIONS: true,
    TEMP_STORE_CREATE: true,
    SYNTHETIC_UPLOAD_INDEX_READBACK: true,
    FILE_SEARCH_QUERY: true,
    TEMP_STORE_DELETE: true,
    CLEANUP_CONFIRMATION: true
  };
  return allowed[stage] ? stage : '';
}

function kspGeminiQualificationSafeModelId_(value) {
  var modelId = kspAiTrim_(value);
  return ['gemini-3.8-flash', 'gemini-3.7-flash', 'gemini-3.6-flash'].indexOf(modelId) !== -1
    ? modelId : '';
}

function kspGeminiQualificationSafeRetryDisposition_(value) {
  var disposition = kspAiTrim_(value).toUpperCase();
  return ['RETRIED', 'RETRY_AFTER_EXCEEDS_SLEEP_BUDGET', 'PROVIDER_RESOURCE_IDENTITY_PRESENT',
    'AMBIGUOUS_MUTATING_OUTCOME', 'ATTEMPT_BUDGET_EXHAUSTED', 'NOT_RETRYABLE', 'NOT_APPLICABLE']
    .indexOf(disposition) !== -1 ? disposition : 'NOT_APPLICABLE';
}

function kspGeminiQualificationSafeClass_(value) {
  var classification = kspAiTrim_(value).toUpperCase();
  var fixed = {
    PASS: true,
    HTTP_OR_CREDENTIAL_FAILURE: true,
    AUTHENTICATION_OR_PERMISSION_FAILURE: true,
    PROVIDER_OR_TRANSIENT_FAILURE: true,
    MODEL_ACCESS_OR_UNSUPPORTED: true,
    COMPLETED_EMPTY_RESPONSE: true,
    COMPLETED_TEXT_EXTRACTION_FAILURE: true,
    COMPLETED_EXPECTED_TOKEN_MISMATCH: true,
    COMPLETED_FINISH_OR_SAFETY_LIMIT: true,
    COMPLETED_NO_GROUNDED_ANSWER: true,
    COMPLETED_NO_FILE_CITATION: true,
    CITATION_IDENTITY_OR_METADATA_MISMATCH: true,
    RESPONSE_SHAPE_OR_APPLICATION_FAILURE: true
  };
  if (fixed[classification]) return classification;
  return /^PROVIDER_TERMINAL_(FAILED|CANCELLED|REQUIRES_ACTION|INCOMPLETE|BUDGET_EXCEEDED)$/.test(classification)
    ? classification : 'RESPONSE_SHAPE_OR_APPLICATION_FAILURE';
}

function kspGeminiQualificationSafeDiagnostic_(input) {
  var source = input || {};
  var providerStatus = kspGeminiQualificationSafeProviderStatus_(source.providerStatus);
  var providerCodes = [];
  var seenCodes = {};
  (source.providerErrorCodes || []).forEach(function (value) {
    var code = kspGeminiSafeProviderErrorCode_(value);
    if (!code || seenCodes[code] || providerCodes.length >= 8) return;
    seenCodes[code] = true;
    providerCodes.push(code);
  });
  var modelId = kspGeminiQualificationSafeModelId_(source.modelId);
  var finishReason = kspAiTrim_(source.finishReason).toUpperCase();
  var safeFinishReasons = {
    STOP: true, MAX_TOKENS: true, SAFETY: true, RECITATION: true,
    BLOCKLIST: true, PROHIBITED_CONTENT: true, SPII: true, LANGUAGE: true,
    MALFORMED_FUNCTION_CALL: true, MALFORMED_TOOL_CALL: true,
    UNEXPECTED_TOOL_CALL: true, OTHER: true
  };
  if (!safeFinishReasons[finishReason]) finishReason = '';
  var correlationHash = kspAiTrim_(source.correlationHash).toLowerCase();
  if (!/^[a-f0-9]{64}$/.test(correlationHash)) correlationHash = '';
  var returnedSourceCategory = kspAiTrim_(source.returnedSourceCategory).toUpperCase();
  if (['EMPTY', 'CONTENT_TEXT', 'DOCUMENT_RESOURCE', 'MIXED'].indexOf(returnedSourceCategory) === -1) {
    returnedSourceCategory = 'EMPTY';
  }
  return {
    classification: kspGeminiQualificationSafeClass_(source.classification),
    stage: kspGeminiQualificationSafeStage_(source.stage),
    transport: kspGeminiQualificationSafeTransport_(source.transport),
    modelId: modelId,
    httpStatus: Math.max(0, Math.min(599, Number(source.httpStatus || 0) || 0)),
    providerStatus: providerStatus,
    providerErrorCodes: providerCodes,
    responseShapeValid: Boolean(source.responseShapeValid),
    textExtractionSucceeded: Boolean(source.textExtractionSucceeded),
    emptyResponse: Boolean(source.emptyResponse),
    finishReason: finishReason,
    answerPresent: Boolean(source.answerPresent),
    expectedTokenPresent: Boolean(source.expectedTokenPresent),
    modelOutputBlockCount: Math.max(0, Number(source.modelOutputBlockCount || 0) || 0),
    fileCitationCount: Math.max(0, Number(source.fileCitationCount || 0) || 0),
    resolvedCitationCount: Math.max(0, Number(source.resolvedCitationCount || 0) || 0),
    returnedSourceCategory: returnedSourceCategory,
    documentUriStoreMatched: Boolean(source.documentUriStoreMatched),
    metadataSourceTypeMatched: Boolean(source.metadataSourceTypeMatched),
    metadataSourceIdMatched: Boolean(source.metadataSourceIdMatched),
    metadataContentHashMatched: Boolean(source.metadataContentHashMatched),
    authoritativeSourceActiveMatched: Boolean(source.authoritativeSourceActiveMatched),
    currentGeminiHashMatched: Boolean(source.currentGeminiHashMatched),
    providerDocumentUniqueMatched: Boolean(source.providerDocumentUniqueMatched),
    providerDocumentReadbackMatched: Boolean(source.providerDocumentReadbackMatched),
    storedDocumentReferenceMatched: Boolean(source.storedDocumentReferenceMatched),
    normalMappingParity: Boolean(source.normalMappingParity),
    authoritativeCitationMatched: Boolean(source.authoritativeCitationMatched),
    attempt: Math.max(0, Number(source.attempt || 0) || 0),
    retryCount: Math.max(0, Number(source.retryCount || 0) || 0),
    cumulativeSleepMillis: Math.max(0, Number(source.cumulativeSleepMillis || 0) || 0),
    retryDisposition: kspGeminiQualificationSafeRetryDisposition_(source.retryDisposition),
    latencyMs: Math.max(0, Number(source.latencyMs || source.elapsedMs || 0) || 0),
    correlationHash: correlationHash
  };
}

function kspGeminiQualificationSafeExternalClass_(value) {
  var external = kspAiTrim_(value).toUpperCase();
  return ['NONE', 'MODEL_ACCESS_OR_UNSUPPORTED', 'HTTP_OR_CREDENTIAL_FAILURE',
    'AUTHENTICATION_OR_PERMISSION_FAILURE', 'PROVIDER_OR_TRANSIENT_FAILURE',
    'INTERACTIONS_SPECIFIC_LIMITATION', 'GENERAL_FILE_SEARCH_OR_GROUNDING_LIMITATION']
    .indexOf(external) !== -1 ? external : 'NONE';
}

function kspGeminiQualificationSafeCampaignEvidence_(input) {
  var source = input || {};
  var secondControl = kspAiTrim_(source.secondControl).toUpperCase();
  if (secondControl !== '3_7_INTERACTIONS' && secondControl !== '3_8_GENERATE_CONTENT') {
    secondControl = 'NOT_USED';
  }
  return {
    queryCalls: Math.max(0, Math.min(2, Number(source.queryCalls || 0) || 0)),
    primary: source.primary ? kspGeminiQualificationSafeDiagnostic_(source.primary) : null,
    secondControl: secondControl,
    second: source.second ? kspGeminiQualificationSafeDiagnostic_(source.second) : null,
    exactExternalLimitation: kspGeminiQualificationSafeExternalClass_(source.exactExternalLimitation)
  };
}

function kspGeminiQualificationFailureCode_(classification) {
  var codes = {
    HTTP_OR_CREDENTIAL_FAILURE: 'AI_GEMINI_QUALIFICATION_HTTP_FAILURE',
    AUTHENTICATION_OR_PERMISSION_FAILURE: 'AI_GEMINI_QUALIFICATION_AUTH_FAILURE',
    PROVIDER_OR_TRANSIENT_FAILURE: 'AI_GEMINI_QUALIFICATION_TRANSIENT_FAILURE',
    MODEL_ACCESS_OR_UNSUPPORTED: 'AI_GEMINI_MODEL_UNSUPPORTED',
    COMPLETED_EMPTY_RESPONSE: 'AI_GEMINI_QUALIFICATION_EMPTY_RESPONSE',
    COMPLETED_TEXT_EXTRACTION_FAILURE: 'AI_GEMINI_QUALIFICATION_TEXT_EXTRACTION_FAILED',
    COMPLETED_EXPECTED_TOKEN_MISMATCH: 'AI_GEMINI_QUALIFICATION_TOKEN_MISMATCH',
    COMPLETED_FINISH_OR_SAFETY_LIMIT: 'AI_GEMINI_QUALIFICATION_FINISH_LIMIT',
    COMPLETED_NO_GROUNDED_ANSWER: 'AI_GEMINI_QUALIFICATION_NO_GROUNDED_ANSWER',
    COMPLETED_NO_FILE_CITATION: 'AI_GEMINI_QUALIFICATION_NO_FILE_CITATION',
    CITATION_IDENTITY_OR_METADATA_MISMATCH: 'AI_GEMINI_QUALIFICATION_CITATION_MISMATCH',
    RESPONSE_SHAPE_OR_APPLICATION_FAILURE: 'AI_GEMINI_QUALIFICATION_APPLICATION_FAILURE'
  };
  var safeClass = kspGeminiQualificationSafeClass_(classification);
  return safeClass.indexOf('PROVIDER_TERMINAL_') === 0
    ? 'AI_GEMINI_QUALIFICATION_PROVIDER_TERMINAL'
    : (codes[safeClass] || 'AI_GEMINI_QUALIFICATION_APPLICATION_FAILURE');
}

function kspGeminiQualificationError_(diagnostic) {
  var safe = kspGeminiQualificationSafeDiagnostic_(diagnostic);
  var error = kspAiModelPolicyError_(kspGeminiQualificationFailureCode_(safe.classification));
  error.qualificationDiagnostic = safe;
  return error;
}

function kspGeminiQualificationDiagnosticFromError_(error, transport, modelId, latencyMs) {
  if (error && error.qualificationDiagnostic) {
    var retained = kspGeminiQualificationSafeDiagnostic_(error.qualificationDiagnostic);
    retained.latencyMs = Math.max(retained.latencyMs, Number(latencyMs || 0) || 0);
    return retained;
  }
  var code = kspGetErrorCode_(error, 'UNEXPECTED_ERROR');
  var httpStatus = Math.max(0, Number(error && error.httpStatus || 0) || 0);
  var providerCodes = error && Array.isArray(error.providerErrorCodes) ? error.providerErrorCodes : [];
  var providerStatus = kspGeminiQualificationSafeProviderStatus_(error && error.providerStatus);
  var classification = 'RESPONSE_SHAPE_OR_APPLICATION_FAILURE';
  var authenticationCodes = {
    authentication: true,
    unauthenticated: true,
    permission_denied: true
  };
  var transientCodes = {
    rate_limit_exceeded: true,
    quota_exceeded: true,
    resource_exhausted: true,
    too_many_requests: true,
    api_error: true,
    internal: true,
    service_unavailable: true,
    unavailable: true,
    deadline_exceeded: true
  };
  var authenticationEvidence = httpStatus === 401 || httpStatus === 403 || providerCodes.some(function (value) {
    return Boolean(authenticationCodes[kspGeminiSafeProviderErrorCode_(value)]);
  });
  var transientEvidence = Boolean(KSP_AI_RETRYABLE_HTTP_CODES[httpStatus]) || providerCodes.some(function (value) {
    return Boolean(transientCodes[kspGeminiSafeProviderErrorCode_(value)]);
  });
  if (code === 'AI_GEMINI_MODEL_UNSUPPORTED' || code === 'AI_GEMINI_MODEL_ACCESS_DENIED') {
    classification = 'MODEL_ACCESS_OR_UNSUPPORTED';
  } else if (code === 'AI_GEMINI_CREDENTIAL_REJECTED' || authenticationEvidence) {
    classification = 'AUTHENTICATION_OR_PERMISSION_FAILURE';
  } else if (code === 'AI_QUERY_PROVIDER_TERMINAL' && providerStatus) {
    classification = 'PROVIDER_TERMINAL_' + providerStatus.toUpperCase();
  } else if (transientEvidence) classification = 'PROVIDER_OR_TRANSIENT_FAILURE';
  return kspGeminiQualificationSafeDiagnostic_({
    classification: classification,
    stage: error && error.stage,
    transport: transport,
    modelId: modelId,
    httpStatus: httpStatus,
    providerStatus: providerStatus,
    providerErrorCodes: providerCodes,
    attempt: error && error.attempt,
    retryCount: error && error.retryCount,
    cumulativeSleepMillis: error && error.cumulativeSleepMillis,
    retryDisposition: error && error.retryDisposition,
    latencyMs: latencyMs || error && error.elapsedMs
  });
}

function kspGeminiQualificationModelOutputBlockCount_(raw, transport) {
  var count = 0;
  if (transport === KSP_AI_QUERY_TRANSPORTS.GENERATE_CONTENT) {
    var candidate = raw && Array.isArray(raw.candidates) ? raw.candidates[0] : null;
    var parts = candidate && candidate.content && Array.isArray(candidate.content.parts)
      ? candidate.content.parts : [];
    parts.forEach(function (part) {
      if (part && part.thought !== true && part.text !== undefined && part.text !== null) count += 1;
    });
    return count;
  }
  (raw && Array.isArray(raw.steps) ? raw.steps : []).forEach(function (step) {
    if (!step || String(step.type) !== 'model_output') return;
    (Array.isArray(step.content) ? step.content : []).forEach(function (block) {
      if (block && String(block.type) === 'text') count += 1;
    });
  });
  return count;
}

function kspBuildGeminiSyntheticAuthoritativeSourceMaps_(source, documentValue, storeName) {
  var value = source || {};
  var documentName = kspAiTrim_(documentValue && documentValue.name);
  var authoritative = {
    sourceType: kspAiTrim_(value.sourceType),
    sourceId: kspAiTrim_(value.sourceId),
    date: kspAiTrim_(value.dateKey),
    driveUrl: 'https://example.invalid/synthetic-authoritative-source',
    savedFilename: kspAiTrim_(value.savedFilename || value.displayName || value.sourceId),
    entityKey: kspAiTrim_(value.entityKey),
    counterpartyType: kspAiTrim_(value.counterpartyType),
    status: KSP_STATUS.ACTIVE,
    providerContentHashes: { OPENAI: '', GEMINI: kspAiTrim_(value.contentHash) },
    contentHash: kspAiTrim_(value.contentHash),
    providerDocumentIds: documentName ? [documentName] : [],
    geminiProviderIdentity: {
      valid: true,
      status: KSP_AI_INDEX_STATUS.INDEXED,
      storeName: kspAiTrim_(storeName),
      contentHash: kspAiTrim_(value.contentHash),
      documentNames: documentName ? [documentName] : []
    }
  };
  var maps = { bySourceId: {}, bySourceKey: {}, byAiDocumentName: {}, byProviderDocumentId: {} };
  if (authoritative.sourceType && authoritative.sourceId) {
    maps.bySourceId[authoritative.sourceId] = authoritative;
    maps.bySourceKey[kspAiSourceKey_(authoritative.sourceType, authoritative.sourceId)] = authoritative;
  }
  return maps;
}

function kspGeminiQualificationNormalizedToken_(value) {
  return String(value || '').replace(/\s+/g, ' ').trim().toUpperCase();
}

function kspGeminiEvaluateSyntheticQualificationResponse_(raw, options) {
  var settings = options || {};
  var transport = kspGeminiQualificationSafeTransport_(settings.transport);
  var modelId = kspAiTrim_(settings.modelId);
  var expectedToken = kspGeminiQualificationNormalizedToken_(settings.expectedToken);
  var source = settings.source || {};
  var documentValue = settings.document || null;
  var diagnostic = {
    classification: 'PASS',
    transport: transport,
    modelId: modelId,
    httpStatus: Number(raw && raw.__kspHttpStatus || 0),
    attempt: Number(raw && raw.__kspAttempt || 0),
    retryCount: Number(raw && raw.__kspRetryCount || 0),
    cumulativeSleepMillis: Number(raw && raw.__kspCumulativeSleepMillis || 0),
    retryDisposition: raw && raw.__kspRetryDisposition ||
      (Number(raw && raw.__kspRetryCount || 0) > 0 ? 'RETRIED' : 'NOT_APPLICABLE'),
    latencyMs: Number(raw && raw.__kspElapsedMs || settings.latencyMs || 0),
    correlationHash: settings.correlationHash
  };
  var candidate = transport === KSP_AI_QUERY_TRANSPORTS.GENERATE_CONTENT &&
    raw && Array.isArray(raw.candidates) ? raw.candidates[0] : null;
  var validShape = raw && typeof raw === 'object' &&
    (transport === KSP_AI_QUERY_TRANSPORTS.GENERATE_CONTENT
      ? Boolean(candidate && candidate.content && Array.isArray(candidate.content.parts))
      : Array.isArray(raw.steps));
  diagnostic.responseShapeValid = Boolean(validShape);
  if (!validShape) {
    diagnostic.classification = 'RESPONSE_SHAPE_OR_APPLICATION_FAILURE';
    return kspGeminiQualificationSafeDiagnostic_(diagnostic);
  }
  var finishReason = transport === KSP_AI_QUERY_TRANSPORTS.GENERATE_CONTENT
    ? kspAiTrim_(candidate.finishReason).toUpperCase() : '';
  diagnostic.finishReason = finishReason;
  if (finishReason && finishReason !== 'STOP') {
    diagnostic.classification = 'COMPLETED_FINISH_OR_SAFETY_LIMIT';
    return kspGeminiQualificationSafeDiagnostic_(diagnostic);
  }
  var modelOutputBlockCount = kspGeminiQualificationModelOutputBlockCount_(raw, transport);
  diagnostic.modelOutputBlockCount = modelOutputBlockCount;
  if (!modelOutputBlockCount) {
    diagnostic.classification = 'COMPLETED_EMPTY_RESPONSE';
    diagnostic.emptyResponse = true;
    return kspGeminiQualificationSafeDiagnostic_(diagnostic);
  }
  var parsed;
  try {
    parsed = transport === KSP_AI_QUERY_TRANSPORTS.GENERATE_CONTENT
      ? kspNormalizeGeminiGenerateContentResponse_(raw) : kspParseInteractionResponse_(raw);
    diagnostic.textExtractionSucceeded = true;
  } catch (ignoredParseError) {
    diagnostic.classification = 'COMPLETED_TEXT_EXTRACTION_FAILURE';
    return kspGeminiQualificationSafeDiagnostic_(diagnostic);
  }
  var answer = kspAiTrim_(parsed && parsed.answer);
  diagnostic.answerPresent = Boolean(answer);
  if (!answer) {
    diagnostic.classification = 'COMPLETED_NO_GROUNDED_ANSWER';
    return kspGeminiQualificationSafeDiagnostic_(diagnostic);
  }
  diagnostic.expectedTokenPresent = Boolean(expectedToken) &&
    kspGeminiQualificationNormalizedToken_(answer).indexOf(expectedToken) !== -1;
  if (!diagnostic.expectedTokenPresent) {
    diagnostic.classification = 'COMPLETED_EXPECTED_TOKEN_MISMATCH';
    return kspGeminiQualificationSafeDiagnostic_(diagnostic);
  }
  if (settings.requireCitation === false) {
    return kspGeminiQualificationSafeDiagnostic_(diagnostic);
  }
  var citations = Array.isArray(parsed && parsed.citations) ? parsed.citations : [];
  diagnostic.fileCitationCount = citations.length;
  if (!citations.length) {
    diagnostic.classification = 'COMPLETED_NO_FILE_CITATION';
    return kspGeminiQualificationSafeDiagnostic_(diagnostic);
  }
  var storeName = kspAiTrim_(settings.storeName) || (function () {
    var name = kspAiTrim_(documentValue && documentValue.name);
    var match = /^(fileSearchStores\/[^/]+)\/documents\/[^/]+$/.exec(name);
    return match ? match[1] : '';
  })();
  var resolved = kspResolveGeminiKnowledgeCitations_(citations,
    settings.sourceMaps || kspBuildGeminiSyntheticAuthoritativeSourceMaps_(source, documentValue, storeName), {
      environment: settings.environment,
      config: settings.config || { storeName: storeName },
      storeName: storeName
    });
  var resolutionEvidence = resolved.evidence || {};
  Object.keys(resolutionEvidence).forEach(function (key) { diagnostic[key] = resolutionEvidence[key]; });
  diagnostic.normalMappingParity = resolved.citations.length === 1 && resolved.warnings.length === 0 &&
    resolved.citations[0].sourceType === kspAiTrim_(source.sourceType) &&
    resolved.citations[0].sourceId === kspAiTrim_(source.sourceId);
  diagnostic.authoritativeCitationMatched = diagnostic.normalMappingParity;
  if (!diagnostic.authoritativeCitationMatched) {
    diagnostic.classification = 'CITATION_IDENTITY_OR_METADATA_MISMATCH';
  }
  return kspGeminiQualificationSafeDiagnostic_(diagnostic);
}

function kspGeminiE2eSafeOutcome_(value) {
  var outcome = kspAiTrim_(value).toUpperCase();
  return ['QUALIFIED_DISABLED', 'DISABLED_TRANSIENT_PROVIDER_LIMITATION',
    'DISABLED_MODEL_ACCESS_LIMITATION', 'BLOCKED_PRODUCT_DEFECT',
    'BLOCKED_RESOURCE_CLEANUP'].indexOf(outcome) !== -1
    ? outcome : 'BLOCKED_PRODUCT_DEFECT';
}

function kspGeminiE2eSafeStageResult_(value) {
  var result = kspAiTrim_(value).toUpperCase();
  return ['NOT_RUN', 'PASS', 'FAIL'].indexOf(result) !== -1 ? result : 'NOT_RUN';
}

function kspGeminiE2eSafeProgression_(value) {
  var progression = kspAiTrim_(value).toUpperCase();
  return ['STOP_QUALIFIED', 'PROCEED_TO_NEXT_CANDIDATE', 'STOP_DISALLOWED',
    'STOP_CANDIDATE_BUDGET', 'NOT_APPLICABLE'].indexOf(progression) !== -1
    ? progression : 'NOT_APPLICABLE';
}

function kspGeminiE2eSafeCandidateEvidence_(input) {
  var source = input || {};
  function stage(value) {
    var item = value || {};
    return {
      result: kspGeminiE2eSafeStageResult_(item.result),
      diagnostic: item.diagnostic ? kspGeminiQualificationSafeDiagnostic_(item.diagnostic) : null
    };
  }
  return {
    modelId: kspGeminiQualificationSafeModelId_(source.modelId),
    attempted: Boolean(source.attempted),
    modelVisible: Boolean(source.modelVisible),
    shortInteractions: stage(source.shortInteractions),
    fileSearchQuery: stage(source.fileSearchQuery),
    terminalDiagnostic: source.terminalDiagnostic
      ? kspGeminiQualificationSafeDiagnostic_(source.terminalDiagnostic) : null,
    progression: kspGeminiE2eSafeProgression_(source.progression)
  };
}

function kspGeminiE2eSafeEvidence_(input) {
  var source = input || {};
  var stageNames = ['MODELS_VISIBILITY', 'SHORT_INTERACTIONS', 'TEMP_STORE_CREATE',
    'SYNTHETIC_UPLOAD_INDEX_READBACK', 'FILE_SEARCH_QUERY', 'TEMP_STORE_DELETE',
    'CLEANUP_CONFIRMATION'];
  var stages = {};
  stageNames.forEach(function (stage) {
    var value = source.stages && source.stages[stage] || {};
    stages[stage] = {
      result: kspGeminiE2eSafeStageResult_(value.result),
      diagnostic: value.diagnostic ? kspGeminiQualificationSafeDiagnostic_(value.diagnostic) : null
    };
  });
  var correlationHash = kspAiTrim_(source.correlationHash).toLowerCase();
  if (!/^[a-f0-9]{64}$/.test(correlationHash)) correlationHash = '';
  return {
    terminalOutcome: kspGeminiE2eSafeOutcome_(source.terminalOutcome),
    modelId: kspGeminiQualificationSafeModelId_(source.modelId),
    qualifiedModelId: kspGeminiQualificationSafeModelId_(source.qualifiedModelId),
    thinkingRawValue: source.thinkingRawValue === 'low' ? 'low' : '',
    maxOutputTokens: Number(source.maxOutputTokens) === 2048 ? 2048 : 0,
    queryTransport: kspGeminiQualificationSafeTransport_(source.queryTransport),
    correlationHash: correlationHash,
    temporaryStoreCreated: Boolean(source.temporaryStoreCreated),
    temporaryDocumentVerified: Boolean(source.temporaryDocumentVerified),
    duplicateCurrentDocumentCount: Math.max(0, Number(source.duplicateCurrentDocumentCount || 0) || 0),
    cleanupRequired: Boolean(source.cleanupRequired),
    cleanupAttempted: Boolean(source.cleanupAttempted),
    cleanupConfirmed: Boolean(source.cleanupConfirmed),
    auditRecorded: Boolean(source.auditRecorded),
    candidates: (source.candidates || []).slice(0, 2).map(kspGeminiE2eSafeCandidateEvidence_),
    stages: stages
  };
}

function kspGeminiE2eStagePassDiagnostic_(stage, raw, extra) {
  var options = extra || {};
  return kspGeminiQualificationSafeDiagnostic_({
    classification: 'PASS',
    stage: stage,
    transport: options.transport || KSP_AI_QUERY_TRANSPORTS.INTERACTIONS,
    modelId: kspGeminiQualificationSafeModelId_(options.modelId),
    httpStatus: Number(raw && raw.__kspHttpStatus || options.httpStatus || 200),
    responseShapeValid: options.responseShapeValid !== false,
    textExtractionSucceeded: Boolean(options.textExtractionSucceeded),
    answerPresent: Boolean(options.answerPresent),
    expectedTokenPresent: Boolean(options.expectedTokenPresent),
    modelOutputBlockCount: Number(options.modelOutputBlockCount || 0),
    fileCitationCount: Number(options.fileCitationCount || 0),
    authoritativeCitationMatched: Boolean(options.authoritativeCitationMatched),
    attempt: Number(raw && raw.__kspAttempt || 1),
    retryCount: Number(raw && raw.__kspRetryCount || 0),
    cumulativeSleepMillis: Number(raw && raw.__kspCumulativeSleepMillis || 0),
    retryDisposition: raw && raw.__kspRetryDisposition || options.retryDisposition ||
      (Number(raw && raw.__kspRetryCount || 0) > 0 ? 'RETRIED' : 'NOT_APPLICABLE'),
    latencyMs: Number(raw && raw.__kspElapsedMs || options.latencyMs || 0),
    correlationHash: options.correlationHash
  });
}

function kspGeminiE2eError_(diagnostic) {
  var safe = kspGeminiQualificationSafeDiagnostic_(diagnostic);
  var error = kspAiModelPolicyError_(kspGeminiQualificationFailureCode_(safe.classification));
  error.qualificationDiagnostic = safe;
  return error;
}

function kspGeminiE2eRecordStage_(evidence, stage, result, diagnostic) {
  evidence.stages[stage] = {
    result: kspGeminiE2eSafeStageResult_(result),
    diagnostic: diagnostic ? kspGeminiQualificationSafeDiagnostic_(diagnostic) : null
  };
}

function kspGeminiE2eDiagnosticForError_(error, stage, correlationHash, modelId) {
  var diagnostic = kspGeminiQualificationDiagnosticFromError_(error,
    KSP_AI_QUERY_TRANSPORTS.INTERACTIONS, modelId, 0);
  diagnostic.stage = stage;
  diagnostic.correlationHash = correlationHash;
  return kspGeminiQualificationSafeDiagnostic_(diagnostic);
}

function kspGeminiE2eAppendAudit_(environment, context, evidence) {
  if (!environment || typeof environment.appendAuditRow !== 'function' ||
      !context || !context.auditSpreadsheetId) return false;
  try {
    var actor = typeof environment.getActor === 'function' ? environment.getActor() : 'UNIDENTIFIED';
    var auditEvidence = kspDeepClone_(evidence);
    auditEvidence.auditRecorded = true;
    environment.appendAuditRow(context.auditSpreadsheetId, kspBuildMaintenanceAuditRow_({
      timestamp: environment.nowIso(),
      actor: actor || 'UNIDENTIFIED',
      action: 'AI_GEMINI_SYNTHETIC_QUALIFICATION',
      targetType: 'AiProviderQualification',
      targetId: evidence.correlationHash,
      result: evidence.terminalOutcome === 'QUALIFIED_DISABLED'
        ? KSP_AUDIT_RESULTS.SUCCESS : KSP_AUDIT_RESULTS.FAILURE,
      after: kspGeminiE2eSafeEvidence_(auditEvidence),
      errorCode: evidence.terminalOutcome === 'QUALIFIED_DISABLED' ? '' : evidence.terminalOutcome
    }));
    return true;
  } catch (ignoredAuditError) {
    return false;
  }
}

function kspGeminiWork0027CandidateProfile_(template, modelId) {
  var safeModelId = kspGeminiQualificationSafeModelId_(modelId);
  kspAssert_(safeModelId === 'gemini-3.7-flash' || safeModelId === 'gemini-3.6-flash',
    'AI_MODEL_ID_INVALID', 'Work 0027 stable qualification candidate is invalid.');
  var minor = safeModelId === 'gemini-3.7-flash' ? '7' : '6';
  var profile = kspDeepClone_(template || {});
  profile.profileId = 'gemini-3' + minor + '-low';
  profile.provider = KSP_AI_PROVIDERS.GEMINI;
  profile.modelId = safeModelId;
  profile.displayName = 'Gemini 3.' + minor + ' Flash';
  profile.family = 'Gemini 3.' + minor;
  profile.enabled = true;
  profile.userVisible = false;
  profile.isProviderDefault = false;
  profile.apiAccess = KSP_AI_MODEL_ACCESS_STATES.UNKNOWN;
  profile.qualification = KSP_AI_MODEL_QUALIFICATION_STATES.UNQUALIFIED;
  profile.fileSearch = false;
  profile.maxOutputTokens = 2048;
  profile.defaultThinkingProfileId = 'low';
  profile.thinkingProfiles = [{
    thinkingProfileId: 'low', label: 'Low', rawValue: 'low', providerDefault: false,
    enabled: true, qualification: KSP_AI_MODEL_QUALIFICATION_STATES.UNQUALIFIED, qualifiedAt: ''
  }];
  profile.qualifiedAt = '';
  profile.qualifiedStoreName = '';
  profile.qualifiedRequestProfileVersion = '';
  profile.safeNote = 'Work 0027 stable-model synthetic File Search qualification candidate.';
  return profile;
}

function kspGeminiE2eCandidateAllowsProgression_(diagnostic) {
  var classification = kspGeminiQualificationSafeClass_(diagnostic && diagnostic.classification);
  return ['MODEL_ACCESS_OR_UNSUPPORTED', 'PROVIDER_OR_TRANSIENT_FAILURE',
    'COMPLETED_NO_GROUNDED_ANSWER', 'COMPLETED_NO_FILE_CITATION',
    'COMPLETED_EXPECTED_TOKEN_MISMATCH', 'COMPLETED_FINISH_OR_SAFETY_LIMIT']
    .indexOf(classification) !== -1;
}

function kspGeminiE2eCandidateResult_(profile) {
  return {
    modelId: profile.modelId,
    profile: profile,
    attempted: true,
    modelVisible: false,
    shortInteractions: { result: 'NOT_RUN', diagnostic: null },
    fileSearchQuery: { result: 'NOT_RUN', diagnostic: null },
    terminalDiagnostic: null,
    progression: 'NOT_APPLICABLE'
  };
}

function kspGeminiE2eSetCandidateFailure_(candidate, diagnostic) {
  var safe = kspGeminiQualificationSafeDiagnostic_(diagnostic);
  candidate.terminalDiagnostic = safe;
  return candidate;
}

function kspRunGeminiSyntheticCandidate_(environment, profile, visibleModels, storeName, source,
    documentValue, token, correlationHash) {
  var candidate = kspGeminiE2eCandidateResult_(profile);
  candidate.modelVisible = Boolean(visibleModels[profile.modelId]);
  if (!candidate.modelVisible) {
    return kspGeminiE2eSetCandidateFailure_(candidate, {
      classification: 'MODEL_ACCESS_OR_UNSUPPORTED', stage: 'MODELS_VISIBILITY',
      transport: KSP_AI_QUERY_TRANSPORTS.INTERACTIONS, modelId: profile.modelId,
      responseShapeValid: true, correlationHash: correlationHash
    });
  }

  var shortToken = 'KSP27_SHORT_' + correlationHash.slice(0, 12).toUpperCase();
  var shortResponse;
  try {
    shortResponse = environment.queryGeminiInteraction({
      model: profile.modelId,
      input: 'Reply with exactly this harmless validation token: ' + shortToken,
      generation_config: { thinking_level: 'low', max_output_tokens: 128 }
    });
  } catch (shortError) {
    var shortErrorDiagnostic = kspGeminiE2eDiagnosticForError_(shortError,
      'SHORT_INTERACTIONS', correlationHash, profile.modelId);
    candidate.shortInteractions = { result: 'FAIL', diagnostic: shortErrorDiagnostic };
    return kspGeminiE2eSetCandidateFailure_(candidate, shortErrorDiagnostic);
  }
  var shortDiagnostic = kspGeminiEvaluateSyntheticQualificationResponse_(shortResponse, {
    transport: KSP_AI_QUERY_TRANSPORTS.INTERACTIONS,
    modelId: profile.modelId,
    expectedToken: shortToken,
    requireCitation: false,
    correlationHash: correlationHash
  });
  shortDiagnostic.stage = 'SHORT_INTERACTIONS';
  shortDiagnostic = kspGeminiQualificationSafeDiagnostic_(shortDiagnostic);
  candidate.shortInteractions = {
    result: shortDiagnostic.classification === 'PASS' ? 'PASS' : 'FAIL', diagnostic: shortDiagnostic
  };
  if (shortDiagnostic.classification !== 'PASS') {
    return kspGeminiE2eSetCandidateFailure_(candidate, shortDiagnostic);
  }

  var config = {
    provider: KSP_AI_PROVIDERS.GEMINI,
    enabled: false,
    credentialConfigured: true,
    storeName: storeName,
    modelId: profile.modelId,
    modelProfileId: profile.profileId,
    thinkingProfileId: 'low',
    thinkingProviderDefault: false,
    thinkingRawValue: 'low',
    maxOutputTokens: 2048,
    queryTransport: KSP_AI_QUERY_TRANSPORTS.INTERACTIONS
  };
  var request = kspBuildProviderSearchRequest_(KSP_AI_PROVIDERS.GEMINI, config, {
    route: KSP_AI_PROVIDERS.GEMINI,
    mode: KSP_KNOWLEDGE_SEARCH_MODES.FREE_QUESTION,
    questionOrInstruction: 'Return the unique validation token from the selected synthetic source.',
    filters: { sourceType: source.sourceType, sourceId: source.sourceId }
  });
  var queryResponse;
  try {
    queryResponse = environment.queryProvider(KSP_AI_PROVIDERS.GEMINI, config, request);
  } catch (queryError) {
    var queryErrorDiagnostic = kspGeminiE2eDiagnosticForError_(queryError,
      'FILE_SEARCH_QUERY', correlationHash, profile.modelId);
    candidate.fileSearchQuery = { result: 'FAIL', diagnostic: queryErrorDiagnostic };
    return kspGeminiE2eSetCandidateFailure_(candidate, queryErrorDiagnostic);
  }
  var queryDiagnostic = kspGeminiEvaluateSyntheticQualificationResponse_(queryResponse, {
    transport: KSP_AI_QUERY_TRANSPORTS.INTERACTIONS,
    modelId: profile.modelId,
    expectedToken: token,
    source: source,
    document: documentValue,
    correlationHash: correlationHash
  });
  queryDiagnostic.stage = 'FILE_SEARCH_QUERY';
  queryDiagnostic = kspGeminiQualificationSafeDiagnostic_(queryDiagnostic);
  candidate.fileSearchQuery = {
    result: queryDiagnostic.classification === 'PASS' ? 'PASS' : 'FAIL', diagnostic: queryDiagnostic
  };
  candidate.terminalDiagnostic = queryDiagnostic;
  candidate.progression = queryDiagnostic.classification === 'PASS' ? 'STOP_QUALIFIED' : 'NOT_APPLICABLE';
  return candidate;
}

function kspRunGeminiSyntheticE2eQualification_(environment, context, profile, thinkingProfileId) {
  var selectedThinkingId = kspAiTrim_(thinkingProfileId).toLowerCase();
  var launcherThinking = (profile.thinkingProfiles || []).filter(function (item) {
    return item.thinkingProfileId === selectedThinkingId;
  })[0];
  kspAssert_(profile.provider === KSP_AI_PROVIDERS.GEMINI,
    'AI_MODEL_PROFILE_PROVIDER_MISMATCH', 'Work 0027 requires a Gemini profile.');
  kspAssert_(launcherThinking && launcherThinking.enabled && !launcherThinking.providerDefault &&
    kspAiTrim_(launcherThinking.rawValue) === 'low', 'AI_THINKING_VALUE_INVALID',
    'Work 0027 qualification requires explicit low thinking.');
  kspAssert_(Number(profile.maxOutputTokens) === 2048, 'AI_MODEL_OUTPUT_LIMIT_INVALID',
    'Work 0027 qualification requires output ceiling 2048.');

  var candidateProfiles = [
    kspGeminiWork0027CandidateProfile_(profile, 'gemini-3.7-flash'),
    kspGeminiWork0027CandidateProfile_(profile, 'gemini-3.6-flash')
  ];
  var entropy = environment.nowIso() + '|' + String(Math.random()) + '|WORK-0027-CODEX-02';
  var correlationHash = typeof environment.hashText === 'function'
    ? String(environment.hashText(entropy)) : kspAiHashTextFallback_(entropy);
  correlationHash = correlationHash.toLowerCase();
  kspAssert_(/^[a-f0-9]{64}$/.test(correlationHash), 'AI_GEMINI_QUALIFICATION_APPLICATION_FAILURE',
    'Synthetic correlation identity is invalid.');
  var token = 'KSP27_' + correlationHash.slice(0, 24).toUpperCase();
  var sourceText = 'Synthetic Gemini File Search qualification token: ' + token;
  var source = {
    sourceType: KSP_AI_SOURCE_TYPES.PITCHBOOK,
    sourceId: 'KSP-WORK0027-' + correlationHash.slice(0, 16).toUpperCase(),
    dateKey: '2026-09-04',
    gpId: 'KSP-SYNTHETIC-GP',
    entityKey: 'GP:KSP-SYNTHETIC-GP',
    counterpartyType: 'GP',
    counterpartyId: 'KSP-SYNTHETIC-GP',
    relatedGpIds: 'KSP-SYNTHETIC-GP',
    assetClassId: 'KSP-SYNTHETIC-ASSET',
    capitalTypeId: 'KSP-SYNTHETIC-CAPITAL',
    displayName: 'ksp-work0027-' + correlationHash.slice(0, 12) + '.txt',
    savedFilename: 'ksp-work0027-' + correlationHash.slice(0, 12) + '.txt',
    mimeType: 'text/plain',
    text: sourceText,
    contentHash: typeof environment.hashText === 'function'
      ? String(environment.hashText(sourceText)) : kspAiHashTextFallback_(sourceText)
  };
  var evidence = {
    terminalOutcome: 'BLOCKED_PRODUCT_DEFECT',
    modelId: '',
    qualifiedModelId: '',
    thinkingRawValue: 'low',
    maxOutputTokens: 2048,
    queryTransport: KSP_AI_QUERY_TRANSPORTS.INTERACTIONS,
    correlationHash: correlationHash,
    temporaryStoreCreated: false,
    temporaryDocumentVerified: false,
    duplicateCurrentDocumentCount: 0,
    cleanupRequired: false,
    cleanupAttempted: false,
    cleanupConfirmed: true,
    auditRecorded: false,
    candidates: [],
    stages: {}
  };
  var stageNames = ['MODELS_VISIBILITY', 'SHORT_INTERACTIONS', 'TEMP_STORE_CREATE',
    'SYNTHETIC_UPLOAD_INDEX_READBACK', 'FILE_SEARCH_QUERY', 'TEMP_STORE_DELETE',
    'CLEANUP_CONFIRMATION'];
  stageNames.forEach(function (stage) { kspGeminiE2eRecordStage_(evidence, stage, 'NOT_RUN', null); });
  var store = null;
  var documentValue = null;
  var selectedCandidate = null;
  var terminalDiagnostic = null;
  var currentStage = 'MODELS_VISIBILITY';
  var campaignStartedAt = new Date().getTime();
  try {
    kspAssert_(typeof environment.listGeminiModels === 'function',
      'AI_GEMINI_QUALIFICATION_APPLICATION_FAILURE', 'Gemini Models check is unavailable.');
    var modelsResponse = environment.listGeminiModels();
    kspAssert_(modelsResponse && Array.isArray(modelsResponse.models),
      'AI_GEMINI_QUALIFICATION_APPLICATION_FAILURE', 'Gemini Models response is invalid.');
    var visibleModels = {};
    modelsResponse.models.forEach(function (item) {
      var modelId = kspAiTrim_(item && item.name).replace(/^models\//, '');
      if (modelId === 'gemini-3.7-flash' || modelId === 'gemini-3.6-flash') visibleModels[modelId] = true;
    });
    kspGeminiE2eRecordStage_(evidence, currentStage, 'PASS',
      kspGeminiE2eStagePassDiagnostic_(currentStage, modelsResponse, {
        modelId: 'gemini-3.7-flash', correlationHash: correlationHash
      }));

    currentStage = 'TEMP_STORE_CREATE';
    kspAssert_(typeof environment.createFileSearchStore === 'function',
      'AI_GEMINI_QUALIFICATION_APPLICATION_FAILURE', 'Temporary Store creation is unavailable.');
    store = environment.createFileSearchStore(kspBuildFileSearchStoreCreateRequest_(
      'KSP Work 0027 temporary ' + correlationHash.slice(0, 12), KSP_AI_DEFAULTS.EMBEDDING_MODEL
    ));
    kspAssert_(store && store.name, 'AI_STORE_RESPONSE_INVALID', 'Temporary Store identity is invalid.');
    evidence.temporaryStoreCreated = true;
    evidence.cleanupRequired = true;
    kspGeminiE2eRecordStage_(evidence, currentStage, 'PASS',
      kspGeminiE2eStagePassDiagnostic_(currentStage, store, {
        modelId: 'gemini-3.7-flash', correlationHash: correlationHash
      }));

    currentStage = 'SYNTHETIC_UPLOAD_INDEX_READBACK';
    kspAssert_(typeof environment.uploadSourceToFileSearchStore === 'function' &&
      typeof environment.findFileSearchDocumentsBySource === 'function',
      'AI_GEMINI_QUALIFICATION_APPLICATION_FAILURE', 'Synthetic upload path is unavailable.');
    documentValue = environment.uploadSourceToFileSearchStore(store.name, source);
    var exactDocuments = environment.findFileSearchDocumentsBySource(store.name, source.sourceId)
      .filter(function (item) { return kspGeminiDocumentMatchesSource_(item, source); });
    evidence.duplicateCurrentDocumentCount = exactDocuments.length;
    kspAssert_(exactDocuments.length === 1 && documentValue &&
      kspAiTrim_(exactDocuments[0].name) === kspAiTrim_(documentValue.name),
      'AI_DOCUMENT_READBACK_FAILED', 'Synthetic document identity is not exact.');
    documentValue = exactDocuments[0];
    evidence.temporaryDocumentVerified = true;
    kspGeminiE2eRecordStage_(evidence, currentStage, 'PASS',
      kspGeminiE2eStagePassDiagnostic_(currentStage, documentValue, {
        modelId: 'gemini-3.7-flash', correlationHash: correlationHash
      }));

    for (var candidateIndex = 0; candidateIndex < candidateProfiles.length; candidateIndex += 1) {
      if (new Date().getTime() - campaignStartedAt >= 300000) {
        if (evidence.candidates.length) evidence.candidates[evidence.candidates.length - 1].progression = 'STOP_CANDIDATE_BUDGET';
        if (!evidence.candidates.length) {
          currentStage = 'SHORT_INTERACTIONS';
          throw kspGeminiE2eError_({
            classification: 'PROVIDER_OR_TRANSIENT_FAILURE', stage: currentStage,
            transport: KSP_AI_QUERY_TRANSPORTS.INTERACTIONS, modelId: candidateProfiles[0].modelId,
            retryDisposition: 'ATTEMPT_BUDGET_EXHAUSTED', correlationHash: correlationHash
          });
        }
        break;
      }
      var candidate = kspRunGeminiSyntheticCandidate_(environment, candidateProfiles[candidateIndex],
        visibleModels, store.name, source, documentValue, token, correlationHash);
      evidence.candidates.push(candidate);
      evidence.modelId = candidate.modelId;
      if (candidate.shortInteractions.result !== 'NOT_RUN') {
        kspGeminiE2eRecordStage_(evidence, 'SHORT_INTERACTIONS',
          candidate.shortInteractions.result, candidate.shortInteractions.diagnostic);
      }
      if (candidate.fileSearchQuery.result !== 'NOT_RUN') {
        kspGeminiE2eRecordStage_(evidence, 'FILE_SEARCH_QUERY',
          candidate.fileSearchQuery.result, candidate.fileSearchQuery.diagnostic);
      }
      terminalDiagnostic = candidate.terminalDiagnostic;
      if (terminalDiagnostic && terminalDiagnostic.classification === 'PASS') {
        candidate.progression = 'STOP_QUALIFIED';
        selectedCandidate = candidate;
        evidence.qualifiedModelId = candidate.modelId;
        break;
      }
      if (candidateIndex === 0 && kspGeminiE2eCandidateAllowsProgression_(terminalDiagnostic)) {
        candidate.progression = 'PROCEED_TO_NEXT_CANDIDATE';
        continue;
      }
      candidate.progression = candidateIndex === candidateProfiles.length - 1 &&
        kspGeminiE2eCandidateAllowsProgression_(terminalDiagnostic)
        ? 'STOP_CANDIDATE_BUDGET' : 'STOP_DISALLOWED';
      break;
    }
  } catch (error) {
    terminalDiagnostic = error && error.qualificationDiagnostic
      ? kspGeminiQualificationSafeDiagnostic_(error.qualificationDiagnostic)
      : kspGeminiE2eDiagnosticForError_(error, currentStage, correlationHash, evidence.modelId || 'gemini-3.7-flash');
    terminalDiagnostic.stage = currentStage;
    terminalDiagnostic.correlationHash = correlationHash;
    terminalDiagnostic = kspGeminiQualificationSafeDiagnostic_(terminalDiagnostic);
    kspGeminiE2eRecordStage_(evidence, currentStage, 'FAIL', terminalDiagnostic);
    if (!store && currentStage === 'TEMP_STORE_CREATE' && error && error.ambiguousTransport === true) {
      evidence.cleanupRequired = true;
      evidence.cleanupConfirmed = false;
    }
  } finally {
    if (store && store.name) {
      evidence.cleanupAttempted = true;
      try {
        environment.deleteFileSearchStore(store.name);
        kspGeminiE2eRecordStage_(evidence, 'TEMP_STORE_DELETE', 'PASS',
          kspGeminiE2eStagePassDiagnostic_('TEMP_STORE_DELETE', null, {
            modelId: evidence.modelId || 'gemini-3.7-flash', correlationHash: correlationHash
          }));
      } catch (deleteError) {
        kspGeminiE2eRecordStage_(evidence, 'TEMP_STORE_DELETE', 'FAIL',
          kspGeminiE2eDiagnosticForError_(deleteError, 'TEMP_STORE_DELETE', correlationHash,
            evidence.modelId || 'gemini-3.7-flash'));
      }
      try {
        evidence.cleanupConfirmed = Boolean(environment.confirmFileSearchStoreDeleted(store.name));
      } catch (confirmError) {
        evidence.cleanupConfirmed = false;
      }
      kspGeminiE2eRecordStage_(evidence, 'CLEANUP_CONFIRMATION',
        evidence.cleanupConfirmed ? 'PASS' : 'FAIL',
        evidence.cleanupConfirmed
          ? kspGeminiE2eStagePassDiagnostic_('CLEANUP_CONFIRMATION', null, {
            modelId: evidence.modelId || 'gemini-3.7-flash', correlationHash: correlationHash
          })
          : { classification: 'RESPONSE_SHAPE_OR_APPLICATION_FAILURE', stage: 'CLEANUP_CONFIRMATION',
            transport: 'INTERACTIONS', modelId: evidence.modelId || 'gemini-3.7-flash',
            correlationHash: correlationHash });
    } else if (!evidence.cleanupRequired) {
      kspGeminiE2eRecordStage_(evidence, 'CLEANUP_CONFIRMATION', 'PASS',
        kspGeminiE2eStagePassDiagnostic_('CLEANUP_CONFIRMATION', null, {
          modelId: evidence.modelId || 'gemini-3.7-flash', correlationHash: correlationHash
        }));
    } else {
      kspGeminiE2eRecordStage_(evidence, 'CLEANUP_CONFIRMATION', 'FAIL', {
        classification: 'RESPONSE_SHAPE_OR_APPLICATION_FAILURE', stage: 'CLEANUP_CONFIRMATION',
        transport: 'INTERACTIONS', modelId: evidence.modelId || 'gemini-3.7-flash',
        correlationHash: correlationHash
      });
    }
  }

  if (evidence.cleanupRequired && !evidence.cleanupConfirmed) {
    evidence.terminalOutcome = 'BLOCKED_RESOURCE_CLEANUP';
  } else if (selectedCandidate) {
    evidence.terminalOutcome = 'QUALIFIED_DISABLED';
  } else {
    var candidateDiagnostics = evidence.candidates.map(function (candidate) {
      return kspGeminiQualificationSafeDiagnostic_(candidate.terminalDiagnostic);
    });
    if (!candidateDiagnostics.length && terminalDiagnostic) {
      candidateDiagnostics.push(kspGeminiQualificationSafeDiagnostic_(terminalDiagnostic));
    }
    var onlyExternalCandidateFailures = candidateDiagnostics.length > 0 && candidateDiagnostics.every(function (item) {
      return item.classification === 'MODEL_ACCESS_OR_UNSUPPORTED' ||
        item.classification === 'PROVIDER_OR_TRANSIENT_FAILURE';
    });
    var hasTransientFailure = candidateDiagnostics.some(function (item) {
      return item.classification === 'PROVIDER_OR_TRANSIENT_FAILURE';
    });
    if (onlyExternalCandidateFailures) {
      evidence.terminalOutcome = hasTransientFailure
        ? 'DISABLED_TRANSIENT_PROVIDER_LIMITATION' : 'DISABLED_MODEL_ACCESS_LIMITATION';
    } else {
      evidence.terminalOutcome = 'BLOCKED_PRODUCT_DEFECT';
    }
  }
  evidence.auditRecorded = kspGeminiE2eAppendAudit_(environment, context, evidence);
  var safeEvidence = kspGeminiE2eSafeEvidence_(evidence);
  if (safeEvidence.terminalOutcome !== 'QUALIFIED_DISABLED') {
    var terminalCode = safeEvidence.terminalOutcome === 'BLOCKED_RESOURCE_CLEANUP'
      ? 'AI_GEMINI_RESOURCE_CLEANUP_BLOCKED'
      : safeEvidence.terminalOutcome === 'DISABLED_TRANSIENT_PROVIDER_LIMITATION'
        ? 'AI_GEMINI_TRANSIENT_PROVIDER_LIMITATION'
        : safeEvidence.terminalOutcome === 'DISABLED_MODEL_ACCESS_LIMITATION'
          ? 'AI_GEMINI_MODEL_ACCESS_LIMITATION' : 'AI_GEMINI_QUALIFICATION_APPLICATION_FAILURE';
    var terminalError = kspAiModelPolicyError_(terminalCode);
    terminalError.geminiE2e = true;
    terminalError.terminalOutcome = safeEvidence.terminalOutcome;
    terminalError.qualificationEvidence = safeEvidence;
    throw terminalError;
  }
  selectedCandidate.profile.isProviderDefault = true;
  selectedCandidate.profile.userVisible = false;
  return {
    status: 'PASS',
    qualification: {
      status: 'PASS', qualified: 1, failed: evidence.candidates.length - 1, accessible: true,
      latencyMs: safeEvidence.stages.FILE_SEARCH_QUERY.diagnostic
        ? safeEvidence.stages.FILE_SEARCH_QUERY.diagnostic.latencyMs : 0,
      thinkingResults: [{ thinkingProfileId: 'low', passed: true }],
      storeName: '',
      requestProfileVersion: KSP_AI_DEFAULTS.QUERY_REQUEST_PROFILE_VERSION
    },
    selectedProfile: selectedCandidate.profile,
    attemptedProfiles: evidence.candidates.map(function (candidate) { return candidate.profile; }),
    evidence: safeEvidence,
    terminalOutcome: 'QUALIFIED_DISABLED'
  };
}

function kspRunGeminiStrictCitationE2eQualification_(environment, context, profile, thinkingProfileId) {
  var selectedThinkingId = kspAiTrim_(thinkingProfileId).toLowerCase();
  var launcherThinking = (profile.thinkingProfiles || []).filter(function (item) {
    return item.thinkingProfileId === selectedThinkingId;
  })[0];
  kspAssert_(profile.provider === KSP_AI_PROVIDERS.GEMINI,
    'AI_MODEL_PROFILE_PROVIDER_MISMATCH', 'Work 0027 requires a Gemini profile.');
  kspAssert_(launcherThinking && launcherThinking.enabled && !launcherThinking.providerDefault &&
    kspAiTrim_(launcherThinking.rawValue) === 'low', 'AI_THINKING_VALUE_INVALID',
  'Work 0027 qualification requires explicit low thinking.');
  var candidateProfile = kspGeminiWork0027CandidateProfile_(profile, 'gemini-3.7-flash');
  kspAssert_(Number(candidateProfile.maxOutputTokens) === 2048, 'AI_MODEL_OUTPUT_LIMIT_INVALID',
    'Work 0027 qualification requires output ceiling 2048.');

  var entropy = environment.nowIso() + '|' + String(Math.random()) + '|WORK-0027-CODEX-05';
  var correlationHash = typeof environment.hashText === 'function'
    ? String(environment.hashText(entropy)) : kspAiHashTextFallback_(entropy);
  correlationHash = correlationHash.toLowerCase();
  kspAssert_(/^[a-f0-9]{64}$/.test(correlationHash), 'AI_GEMINI_QUALIFICATION_APPLICATION_FAILURE',
    'Synthetic correlation identity is invalid.');
  var token = 'KSP27_' + correlationHash.slice(0, 24).toUpperCase();
  var sourceText = 'Synthetic Gemini File Search qualification token: ' + token;
  var source = {
    sourceType: KSP_AI_SOURCE_TYPES.PITCHBOOK,
    sourceId: 'KSP-WORK0027-' + correlationHash.slice(0, 16).toUpperCase(),
    dateKey: '2026-09-05',
    gpId: 'KSP-SYNTHETIC-GP',
    entityKey: 'GP:KSP-SYNTHETIC-GP',
    counterpartyType: 'GP',
    counterpartyId: 'KSP-SYNTHETIC-GP',
    relatedGpIds: 'KSP-SYNTHETIC-GP',
    assetClassId: 'KSP-SYNTHETIC-ASSET',
    capitalTypeId: 'KSP-SYNTHETIC-CAPITAL',
    displayName: 'ksp-work0027-' + correlationHash.slice(0, 12) + '.txt',
    savedFilename: 'ksp-work0027-' + correlationHash.slice(0, 12) + '.txt',
    mimeType: 'text/plain',
    text: sourceText,
    contentHash: typeof environment.hashText === 'function'
      ? String(environment.hashText(sourceText)) : kspAiHashTextFallback_(sourceText)
  };
  var config = {
    provider: KSP_AI_PROVIDERS.GEMINI,
    enabled: false,
    credentialConfigured: true,
    storeName: '',
    modelId: candidateProfile.modelId,
    modelProfileId: candidateProfile.profileId,
    thinkingProfileId: 'low',
    thinkingProviderDefault: false,
    thinkingRawValue: 'low',
    maxOutputTokens: 2048,
    queryTransport: KSP_AI_QUERY_TRANSPORTS.INTERACTIONS
  };
  var evidence = {
    terminalOutcome: 'BLOCKED_PRODUCT_DEFECT',
    modelId: candidateProfile.modelId,
    qualifiedModelId: '',
    thinkingRawValue: 'low',
    maxOutputTokens: 2048,
    queryTransport: KSP_AI_QUERY_TRANSPORTS.INTERACTIONS,
    correlationHash: correlationHash,
    temporaryStoreCreated: false,
    temporaryDocumentVerified: false,
    duplicateCurrentDocumentCount: 0,
    cleanupRequired: false,
    cleanupAttempted: false,
    cleanupConfirmed: true,
    auditRecorded: false,
    candidates: [],
    stages: {}
  };
  var stageNames = ['MODELS_VISIBILITY', 'SHORT_INTERACTIONS', 'TEMP_STORE_CREATE',
    'SYNTHETIC_UPLOAD_INDEX_READBACK', 'FILE_SEARCH_QUERY', 'TEMP_STORE_DELETE',
    'CLEANUP_CONFIRMATION'];
  stageNames.forEach(function (stage) { kspGeminiE2eRecordStage_(evidence, stage, 'NOT_RUN', null); });
  var candidate = kspGeminiE2eCandidateResult_(candidateProfile);
  var store = null;
  var documentValue = null;
  var terminalDiagnostic = null;
  var currentStage = 'TEMP_STORE_CREATE';
  var campaignStartedAt = new Date().getTime();
  try {
    kspAssert_(typeof environment.createFileSearchStore === 'function',
      'AI_GEMINI_QUALIFICATION_APPLICATION_FAILURE', 'Temporary Store creation is unavailable.');
    store = environment.createFileSearchStore(kspBuildFileSearchStoreCreateRequest_(
      'KSP Work 0027 temporary ' + correlationHash.slice(0, 12), KSP_AI_DEFAULTS.EMBEDDING_MODEL
    ));
    kspAssert_(store && store.name, 'AI_STORE_RESPONSE_INVALID', 'Temporary Store identity is invalid.');
    config.storeName = store.name;
    evidence.temporaryStoreCreated = true;
    evidence.cleanupRequired = true;
    kspGeminiE2eRecordStage_(evidence, currentStage, 'PASS',
      kspGeminiE2eStagePassDiagnostic_(currentStage, null, {
        modelId: candidateProfile.modelId, correlationHash: correlationHash
      }));

    currentStage = 'SYNTHETIC_UPLOAD_INDEX_READBACK';
    kspAssert_(typeof environment.uploadSourceToFileSearchStore === 'function' &&
      typeof environment.findProviderDocumentsBySource === 'function' &&
      typeof environment.readProviderDocument === 'function',
    'AI_GEMINI_QUALIFICATION_APPLICATION_FAILURE', 'Synthetic document readback path is unavailable.');
    var uploaded = environment.uploadSourceToFileSearchStore(store.name, source);
    var documents = environment.findProviderDocumentsBySource(
      KSP_AI_PROVIDERS.GEMINI, config, source.sourceType, source.sourceId
    );
    evidence.duplicateCurrentDocumentCount = Array.isArray(documents) ? documents.length : 0;
    kspAssert_(Array.isArray(documents) && documents.length === 1 &&
      kspAiTrim_(uploaded && uploaded.name) === kspAiTrim_(documents[0] && documents[0].name) &&
      kspGeminiCitationDocumentMatches_(documents[0], store.name,
        source.sourceType, source.sourceId, source.contentHash),
    'AI_DOCUMENT_READBACK_FAILED', 'Synthetic document identity is not exact.');
    documentValue = environment.readProviderDocument(
      KSP_AI_PROVIDERS.GEMINI, config, documents[0], source
    );
    kspAssert_(kspAiTrim_(documentValue && documentValue.name) === kspAiTrim_(documents[0].name) &&
      kspGeminiCitationDocumentMatches_(documentValue, store.name,
        source.sourceType, source.sourceId, source.contentHash),
    'AI_DOCUMENT_READBACK_FAILED', 'Synthetic document readback is not current.');
    evidence.temporaryDocumentVerified = true;
    kspGeminiE2eRecordStage_(evidence, currentStage, 'PASS',
      kspGeminiQualificationSafeDiagnostic_({
        classification: 'PASS', stage: currentStage, transport: 'INTERACTIONS',
        modelId: candidateProfile.modelId, responseShapeValid: true,
        metadataSourceTypeMatched: true, metadataSourceIdMatched: true,
        metadataContentHashMatched: true, providerDocumentUniqueMatched: true,
        providerDocumentReadbackMatched: true, correlationHash: correlationHash
      }));

    currentStage = 'FILE_SEARCH_QUERY';
    kspAssert_(new Date().getTime() - campaignStartedAt <= 240000,
      'AI_GEMINI_QUALIFICATION_APPLICATION_FAILURE', 'Qualification campaign budget was exhausted before query.');
    var request = kspBuildProviderSearchRequest_(KSP_AI_PROVIDERS.GEMINI, config, {
      route: KSP_AI_PROVIDERS.GEMINI,
      mode: KSP_KNOWLEDGE_SEARCH_MODES.FREE_QUESTION,
      questionOrInstruction: 'Return the unique validation token from the selected synthetic source.',
      filters: { sourceType: source.sourceType, sourceId: source.sourceId }
    });
    var queryResponse = environment.queryProvider(KSP_AI_PROVIDERS.GEMINI, config, request);
    var verifiedEnvironment = {
      findProviderDocumentsBySource: function () { return [documentValue]; },
      readProviderDocument: function () { return documentValue; }
    };
    var queryDiagnostic = kspGeminiEvaluateSyntheticQualificationResponse_(queryResponse, {
      transport: KSP_AI_QUERY_TRANSPORTS.INTERACTIONS,
      modelId: candidateProfile.modelId,
      expectedToken: token,
      source: source,
      document: documentValue,
      storeName: store.name,
      config: config,
      environment: verifiedEnvironment,
      sourceMaps: kspBuildGeminiSyntheticAuthoritativeSourceMaps_(source, documentValue, store.name),
      correlationHash: correlationHash
    });
    queryDiagnostic.stage = currentStage;
    queryDiagnostic = kspGeminiQualificationSafeDiagnostic_(queryDiagnostic);
    candidate.fileSearchQuery = {
      result: queryDiagnostic.classification === 'PASS' ? 'PASS' : 'FAIL', diagnostic: queryDiagnostic
    };
    candidate.terminalDiagnostic = queryDiagnostic;
    terminalDiagnostic = queryDiagnostic;
    kspGeminiE2eRecordStage_(evidence, currentStage, candidate.fileSearchQuery.result, queryDiagnostic);
    if (queryDiagnostic.classification === 'PASS') {
      candidate.progression = 'STOP_QUALIFIED';
      evidence.qualifiedModelId = candidateProfile.modelId;
    } else {
      candidate.progression = 'STOP_DISALLOWED';
    }
    evidence.candidates.push(candidate);
  } catch (error) {
    terminalDiagnostic = error && error.qualificationDiagnostic
      ? kspGeminiQualificationSafeDiagnostic_(error.qualificationDiagnostic)
      : kspGeminiE2eDiagnosticForError_(error, currentStage, correlationHash, candidateProfile.modelId);
    terminalDiagnostic.stage = currentStage;
    terminalDiagnostic.correlationHash = correlationHash;
    terminalDiagnostic = kspGeminiQualificationSafeDiagnostic_(terminalDiagnostic);
    kspGeminiE2eRecordStage_(evidence, currentStage, 'FAIL', terminalDiagnostic);
    if (!candidate.terminalDiagnostic) {
      candidate.terminalDiagnostic = terminalDiagnostic;
      candidate.progression = 'STOP_DISALLOWED';
      evidence.candidates.push(candidate);
    }
    if (!store && currentStage === 'TEMP_STORE_CREATE' && error && error.ambiguousTransport === true) {
      evidence.cleanupRequired = true;
      evidence.cleanupConfirmed = false;
    }
  } finally {
    if (store && store.name) {
      evidence.cleanupAttempted = true;
      try {
        environment.deleteFileSearchStore(store.name);
        kspGeminiE2eRecordStage_(evidence, 'TEMP_STORE_DELETE', 'PASS',
          kspGeminiE2eStagePassDiagnostic_('TEMP_STORE_DELETE', null, {
            modelId: candidateProfile.modelId, correlationHash: correlationHash
          }));
      } catch (deleteError) {
        kspGeminiE2eRecordStage_(evidence, 'TEMP_STORE_DELETE', 'FAIL',
          kspGeminiE2eDiagnosticForError_(deleteError, 'TEMP_STORE_DELETE', correlationHash,
            candidateProfile.modelId));
      }
      try {
        evidence.cleanupConfirmed = Boolean(environment.confirmFileSearchStoreDeleted(store.name));
      } catch (ignoredConfirmError) {
        evidence.cleanupConfirmed = false;
      }
      kspGeminiE2eRecordStage_(evidence, 'CLEANUP_CONFIRMATION',
        evidence.cleanupConfirmed ? 'PASS' : 'FAIL',
        evidence.cleanupConfirmed
          ? kspGeminiE2eStagePassDiagnostic_('CLEANUP_CONFIRMATION', null, {
            modelId: candidateProfile.modelId, correlationHash: correlationHash
          })
          : { classification: 'RESPONSE_SHAPE_OR_APPLICATION_FAILURE', stage: 'CLEANUP_CONFIRMATION',
            transport: 'INTERACTIONS', modelId: candidateProfile.modelId,
            correlationHash: correlationHash });
    } else if (!evidence.cleanupRequired) {
      kspGeminiE2eRecordStage_(evidence, 'CLEANUP_CONFIRMATION', 'PASS',
        kspGeminiE2eStagePassDiagnostic_('CLEANUP_CONFIRMATION', null, {
          modelId: candidateProfile.modelId, correlationHash: correlationHash
        }));
    }
  }

  if (evidence.cleanupRequired && !evidence.cleanupConfirmed) {
    evidence.terminalOutcome = 'BLOCKED_RESOURCE_CLEANUP';
  } else if (terminalDiagnostic && terminalDiagnostic.classification === 'PASS') {
    evidence.terminalOutcome = 'QUALIFIED_DISABLED';
  } else if (terminalDiagnostic && terminalDiagnostic.classification === 'PROVIDER_OR_TRANSIENT_FAILURE') {
    evidence.terminalOutcome = 'DISABLED_TRANSIENT_PROVIDER_LIMITATION';
  } else if (terminalDiagnostic && terminalDiagnostic.classification === 'MODEL_ACCESS_OR_UNSUPPORTED') {
    evidence.terminalOutcome = 'DISABLED_MODEL_ACCESS_LIMITATION';
  } else {
    evidence.terminalOutcome = 'BLOCKED_PRODUCT_DEFECT';
  }
  evidence.auditRecorded = kspGeminiE2eAppendAudit_(environment, context, evidence);
  var safeEvidence = kspGeminiE2eSafeEvidence_(evidence);
  if (safeEvidence.terminalOutcome !== 'QUALIFIED_DISABLED') {
    var terminalCode = safeEvidence.terminalOutcome === 'BLOCKED_RESOURCE_CLEANUP'
      ? 'AI_GEMINI_RESOURCE_CLEANUP_BLOCKED'
      : safeEvidence.terminalOutcome === 'DISABLED_TRANSIENT_PROVIDER_LIMITATION'
        ? 'AI_GEMINI_TRANSIENT_PROVIDER_LIMITATION'
        : safeEvidence.terminalOutcome === 'DISABLED_MODEL_ACCESS_LIMITATION'
          ? 'AI_GEMINI_MODEL_ACCESS_LIMITATION' : 'AI_GEMINI_QUALIFICATION_APPLICATION_FAILURE';
    var terminalError = kspAiModelPolicyError_(terminalCode);
    terminalError.geminiE2e = true;
    terminalError.terminalOutcome = safeEvidence.terminalOutcome;
    terminalError.qualificationEvidence = safeEvidence;
    throw terminalError;
  }
  candidateProfile.isProviderDefault = true;
  candidateProfile.userVisible = false;
  return {
    status: 'PASS',
    qualification: {
      status: 'PASS', qualified: 1, failed: 0, accessible: true,
      latencyMs: safeEvidence.stages.FILE_SEARCH_QUERY.diagnostic
        ? safeEvidence.stages.FILE_SEARCH_QUERY.diagnostic.latencyMs : 0,
      thinkingResults: [{ thinkingProfileId: 'low', passed: true }],
      storeName: '',
      requestProfileVersion: KSP_AI_DEFAULTS.QUERY_REQUEST_PROFILE_VERSION
    },
    selectedProfile: candidateProfile,
    attemptedProfiles: [candidateProfile],
    evidence: safeEvidence,
    terminalOutcome: 'QUALIFIED_DISABLED'
  };
}

function kspGeminiQualificationCampaignError_(external, evidence) {
  var safeEvidence = kspGeminiQualificationSafeCampaignEvidence_(evidence);
  var code = external ? 'AI_GEMINI_EXTERNAL_LIMITATION' : 'AI_GEMINI_QUALIFICATION_APPLICATION_FAILURE';
  var error = kspAiModelPolicyError_(code);
  error.geminiExternal = Boolean(external);
  error.qualificationEvidence = safeEvidence;
  return error;
}

function kspGeminiQualificationNeedsGenerateContentControl_(diagnostic) {
  var classification = kspGeminiQualificationSafeClass_(diagnostic && diagnostic.classification);
  return classification.indexOf('PROVIDER_TERMINAL_') === 0 ||
    classification === 'COMPLETED_NO_GROUNDED_ANSWER' ||
    classification === 'COMPLETED_NO_FILE_CITATION';
}

function kspGeminiQualificationSupportsExternal_(diagnostic, allowGroundingFailure) {
  var safe = kspGeminiQualificationSafeDiagnostic_(diagnostic);
  return safe.classification === 'MODEL_ACCESS_OR_UNSUPPORTED' ||
    safe.classification === 'HTTP_OR_CREDENTIAL_FAILURE' ||
    safe.classification === 'AUTHENTICATION_OR_PERMISSION_FAILURE' ||
    safe.classification === 'PROVIDER_OR_TRANSIENT_FAILURE' ||
    safe.classification.indexOf('PROVIDER_TERMINAL_') === 0 ||
    (Boolean(allowGroundingFailure) && (safe.classification === 'COMPLETED_NO_GROUNDED_ANSWER' ||
      safe.classification === 'COMPLETED_NO_FILE_CITATION'));
}

function kspGeminiQualificationAccessibleFromEvidence_(evidence) {
  var primary = evidence && evidence.primary ? kspGeminiQualificationSafeDiagnostic_(evidence.primary) : null;
  if (!primary) return null;
  if (primary.classification === 'MODEL_ACCESS_OR_UNSUPPORTED') return false;
  if (primary.classification === 'AUTHENTICATION_OR_PERMISSION_FAILURE') return false;
  if (primary.classification === 'HTTP_OR_CREDENTIAL_FAILURE') {
    if (primary.httpStatus === 401 || primary.httpStatus === 403 ||
        primary.providerErrorCodes.indexOf('authentication') !== -1 ||
        primary.providerErrorCodes.indexOf('unauthenticated') !== -1 ||
        primary.providerErrorCodes.indexOf('permission_denied') !== -1) return false;
    return null;
  }
  if (primary.classification === 'PROVIDER_OR_TRANSIENT_FAILURE') return null;
  if (primary.classification.indexOf('PROVIDER_TERMINAL_') === 0 ||
      primary.classification === 'COMPLETED_NO_GROUNDED_ANSWER' ||
      primary.classification === 'COMPLETED_NO_FILE_CITATION' ||
      primary.classification === 'CITATION_IDENTITY_OR_METADATA_MISMATCH') return true;
  return null;
}

function kspGeminiFallbackProfile_(profile) {
  var fallback = kspDeepClone_(profile);
  fallback.profileId = 'gemini-37-low';
  fallback.modelId = 'gemini-3.7-flash';
  fallback.displayName = 'Gemini 3.7 Flash';
  fallback.family = 'Gemini 3.7';
  return fallback;
}

function kspRunGeminiExactTupleQualification_(environment, context, settings, profile, thinkingProfileId,
    queryTransport) {
  var selectedThinkingId = kspAiTrim_(thinkingProfileId).toLowerCase();
  var thinking = (profile.thinkingProfiles || []).filter(function (item) {
    return item.thinkingProfileId === selectedThinkingId;
  })[0];
  kspAssert_(thinking && thinking.enabled, 'AI_THINKING_SELECTION_STALE', 'Gemini thinking profile is missing.');
  kspAssert_(!thinking.providerDefault && kspAiTrim_(thinking.rawValue) === 'low',
    'AI_THINKING_VALUE_INVALID', 'This qualification requires explicit low thinking.');
  kspAssert_(Number(profile.maxOutputTokens) === 2048,
    'AI_MODEL_OUTPUT_LIMIT_INVALID', 'This qualification requires output ceiling 2048.');
  kspAssert_(profile.modelId === 'gemini-3.8-flash' || profile.modelId === 'gemini-3.7-flash',
    'AI_MODEL_ID_INVALID', 'Gemini qualification candidate is not allowed.');
  kspAssert_(settings.geminiStoreName, 'GEMINI_STORE_NOT_CONFIGURED', 'Gemini Store is not configured.');

  var rows = (context.pitchbookRows || []).filter(function (row) {
    return kspAiTrim_(row.Document_ID) === 'DOC-000017';
  });
  kspAssert_(rows.length === 1 && kspAiTrim_(rows[0].Status) === KSP_STATUS.ACTIVE,
    'AI_SYNC_SOURCE_NOT_FOUND', 'Gemini qualification source is unavailable.');
  var item = kspAiWorkItemFromRow_(KSP_AI_SOURCE_TYPES.PITCHBOOK, rows[0]);
  var source = kspBuildFeatureFreezeAiSource_(environment, item,
    kspBuildAiMasterMaps_(context.gpRows, context.optionRows));
  var transport = kspGeminiQualificationSafeTransport_(queryTransport);
  var config = {
    provider: KSP_AI_PROVIDERS.GEMINI,
    enabled: false,
    credentialConfigured: true,
    storeName: settings.geminiStoreName,
    modelId: profile.modelId,
    modelProfileId: profile.profileId,
    thinkingProfileId: thinking.thinkingProfileId,
    thinkingProviderDefault: false,
    thinkingRawValue: thinking.rawValue,
    maxOutputTokens: profile.maxOutputTokens,
    queryTransport: transport
  };
  var documents = environment.findProviderDocumentsBySource(
    KSP_AI_PROVIDERS.GEMINI, config, source.sourceType, source.sourceId
  );
  kspAssert_(documents.length === 1 && kspGeminiDocumentMatchesSource_(documents[0], source),
    'AI_DOCUMENT_READBACK_FAILED',
    'Gemini qualification requires exactly one current provider document.');
  kspAssert_(typeof environment.readProviderDocument === 'function', 'AI_DOCUMENT_READBACK_FAILED',
    'Gemini qualification document readback is unavailable.');
  var documentValue = environment.readProviderDocument(
    KSP_AI_PROVIDERS.GEMINI, config, documents[0], source
  );
  kspAssert_(kspAiTrim_(documentValue && documentValue.name) === kspAiTrim_(documents[0].name) &&
    kspGeminiDocumentMatchesSource_(documentValue, source), 'AI_DOCUMENT_READBACK_FAILED',
  'Gemini qualification document readback did not match the current source.');
  var request = kspBuildProviderSearchRequest_(KSP_AI_PROVIDERS.GEMINI, config, {
    route: KSP_AI_PROVIDERS.GEMINI,
    mode: KSP_KNOWLEDGE_SEARCH_MODES.FREE_QUESTION,
    questionOrInstruction: 'DOC-000017に記載された一意の検証トークンを正確に回答してください。',
    filters: { sourceType: KSP_AI_SOURCE_TYPES.PITCHBOOK, sourceId: 'DOC-000017' }
  });
  var started = new Date().getTime();
  var raw;
  try {
    raw = environment.queryProvider(KSP_AI_PROVIDERS.GEMINI, config, request);
  } catch (queryError) {
    throw kspGeminiQualificationError_(kspGeminiQualificationDiagnosticFromError_(queryError,
      transport, profile.modelId, Math.max(0, new Date().getTime() - started)));
  }
  var latencyMs = Math.max(0, new Date().getTime() - started);
  var validShape = raw && typeof raw === 'object' && (transport === KSP_AI_QUERY_TRANSPORTS.GENERATE_CONTENT
    ? Array.isArray(raw.candidates) && raw.candidates.length > 0
    : Array.isArray(raw.steps));
  if (!validShape) {
    throw kspGeminiQualificationError_({
      classification: 'RESPONSE_SHAPE_OR_APPLICATION_FAILURE', transport: transport,
      modelId: profile.modelId, httpStatus: Number(raw && raw.__kspHttpStatus || 0), latencyMs: latencyMs
    });
  }
  var parsed;
  try {
    parsed = transport === KSP_AI_QUERY_TRANSPORTS.GENERATE_CONTENT
      ? kspNormalizeGeminiGenerateContentResponse_(raw) : kspParseInteractionResponse_(raw);
  } catch (parseError) {
    throw kspGeminiQualificationError_({
      classification: 'RESPONSE_SHAPE_OR_APPLICATION_FAILURE', transport: transport,
      modelId: profile.modelId, httpStatus: Number(raw && raw.__kspHttpStatus || 0), latencyMs: latencyMs
    });
  }
  var sourceMaps = kspBuildAuthoritativeSourceMaps_(context.meetingRows, context.pitchbookRows);
  var mapped = transport === KSP_AI_QUERY_TRANSPORTS.INTERACTIONS
    ? kspResolveGeminiKnowledgeCitations_(parsed.citations, sourceMaps, {
      environment: {
        findProviderDocumentsBySource: function () { return [documentValue]; },
        readProviderDocument: function () { return documentValue; }
      },
      config: config,
      storeName: config.storeName
    })
    : kspMapKnowledgeCitations_(parsed.citations, sourceMaps);
  var answerPresent = Boolean(parsed.answer);
  var expectedTokenPresent = answerPresent &&
    parsed.answer.indexOf('CODEX18_SYNTH_PITCHBOOK_20260830') !== -1;
  var modelOutputBlockCount = kspGeminiQualificationModelOutputBlockCount_(raw, transport);
  var fileCitationCount = Array.isArray(parsed.citations) ? parsed.citations.length : 0;
  var exactCitationCount = mapped.citations.length;
  var authoritativeCitationMatched = exactCitationCount === 1 && mapped.citations.length === 1 &&
    mapped.warnings.length === 0 &&
    mapped.citations[0].sourceType === KSP_AI_SOURCE_TYPES.PITCHBOOK &&
    mapped.citations[0].sourceId === 'DOC-000017';
  var diagnostic = {
    classification: 'PASS', transport: transport, modelId: profile.modelId,
    httpStatus: Number(raw && raw.__kspHttpStatus || 0), providerStatus: parsed.rawStatus,
    answerPresent: answerPresent, expectedTokenPresent: expectedTokenPresent,
    modelOutputBlockCount: modelOutputBlockCount, fileCitationCount: fileCitationCount,
    authoritativeCitationMatched: authoritativeCitationMatched, latencyMs: latencyMs
  };
  if (mapped.evidence) {
    Object.keys(mapped.evidence).forEach(function (key) { diagnostic[key] = mapped.evidence[key]; });
    diagnostic.normalMappingParity = authoritativeCitationMatched;
  }
  if (!answerPresent || !expectedTokenPresent) {
    diagnostic.classification = 'COMPLETED_NO_GROUNDED_ANSWER';
    throw kspGeminiQualificationError_(diagnostic);
  }
  if (!fileCitationCount) {
    diagnostic.classification = 'COMPLETED_NO_FILE_CITATION';
    throw kspGeminiQualificationError_(diagnostic);
  }
  if (!authoritativeCitationMatched) {
    diagnostic.classification = 'CITATION_IDENTITY_OR_METADATA_MISMATCH';
    throw kspGeminiQualificationError_(diagnostic);
  }
  return {
    status: 'PASS', qualified: 1, failed: 0, accessible: true, latencyMs: latencyMs,
    thinkingResults: [{ thinkingProfileId: thinking.thinkingProfileId, passed: true }],
    storeName: settings.geminiStoreName,
    requestProfileVersion: KSP_AI_DEFAULTS.QUERY_REQUEST_PROFILE_VERSION,
    diagnostic: kspGeminiQualificationSafeDiagnostic_(diagnostic)
  };
}

function kspRunGeminiBoundedQualificationCampaign_(environment, context, settings, profile, thinkingProfileId) {
  var primaryResult;
  var primaryDiagnostic;
  try {
    primaryResult = kspRunGeminiExactTupleQualification_(environment, context, settings, profile,
      thinkingProfileId, KSP_AI_QUERY_TRANSPORTS.INTERACTIONS);
    primaryDiagnostic = primaryResult.diagnostic;
    return {
      status: 'PASS', qualification: primaryResult, selectedProfile: profile,
      evidence: kspGeminiQualificationSafeCampaignEvidence_({
        queryCalls: 1, primary: primaryDiagnostic, secondControl: 'NOT_USED', exactExternalLimitation: 'NONE'
      })
    };
  } catch (primaryError) {
    primaryDiagnostic = kspGeminiQualificationDiagnosticFromError_(primaryError,
      KSP_AI_QUERY_TRANSPORTS.INTERACTIONS, profile.modelId, 0);
  }

  if (primaryDiagnostic.classification === 'MODEL_ACCESS_OR_UNSUPPORTED') {
    var fallbackProfile = kspGeminiFallbackProfile_(profile);
    try {
      var fallbackResult = kspRunGeminiExactTupleQualification_(environment, context, settings,
        fallbackProfile, thinkingProfileId, KSP_AI_QUERY_TRANSPORTS.INTERACTIONS);
      return {
        status: 'PASS', qualification: fallbackResult, selectedProfile: fallbackProfile,
        evidence: kspGeminiQualificationSafeCampaignEvidence_({
          queryCalls: 2, primary: primaryDiagnostic, secondControl: '3_7_INTERACTIONS',
          second: fallbackResult.diagnostic, exactExternalLimitation: 'NONE'
        })
      };
    } catch (fallbackError) {
      var fallbackDiagnostic = kspGeminiQualificationDiagnosticFromError_(fallbackError,
        KSP_AI_QUERY_TRANSPORTS.INTERACTIONS, fallbackProfile.modelId, 0);
      var fallbackExternal = kspGeminiQualificationSupportsExternal_(fallbackDiagnostic, true);
      throw kspGeminiQualificationCampaignError_(fallbackExternal, {
          queryCalls: 2, primary: primaryDiagnostic, secondControl: '3_7_INTERACTIONS',
          second: fallbackDiagnostic,
          exactExternalLimitation: fallbackExternal ? 'MODEL_ACCESS_OR_UNSUPPORTED' : 'NONE'
        });
    }
  }

  if (kspGeminiQualificationNeedsGenerateContentControl_(primaryDiagnostic)) {
    var controlResult = null;
    var controlDiagnostic = null;
    try {
      controlResult = kspRunGeminiExactTupleQualification_(environment, context, settings, profile,
        thinkingProfileId, KSP_AI_QUERY_TRANSPORTS.GENERATE_CONTENT);
      controlDiagnostic = controlResult.diagnostic;
    } catch (controlError) {
      controlDiagnostic = kspGeminiQualificationDiagnosticFromError_(controlError,
        KSP_AI_QUERY_TRANSPORTS.GENERATE_CONTENT, profile.modelId, 0);
    }
    if (controlResult) {
      throw kspGeminiQualificationCampaignError_(true, {
        queryCalls: 2, primary: primaryDiagnostic, secondControl: '3_8_GENERATE_CONTENT',
        second: controlDiagnostic, exactExternalLimitation: 'INTERACTIONS_SPECIFIC_LIMITATION'
      });
    }
    var controlExternal = kspGeminiQualificationSupportsExternal_(controlDiagnostic, true);
    throw kspGeminiQualificationCampaignError_(controlExternal, {
      queryCalls: 2, primary: primaryDiagnostic, secondControl: '3_8_GENERATE_CONTENT',
      second: controlDiagnostic,
      exactExternalLimitation: controlExternal ? 'GENERAL_FILE_SEARCH_OR_GROUNDING_LIMITATION' : 'NONE'
    });
  }

  var primaryExternal = kspGeminiQualificationSupportsExternal_(primaryDiagnostic, false);
  throw kspGeminiQualificationCampaignError_(primaryExternal, {
    queryCalls: 1, primary: primaryDiagnostic, secondControl: 'NOT_USED',
    exactExternalLimitation: primaryExternal ? primaryDiagnostic.classification : 'NONE'
  });
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
      metadataRefreshed: Number(value.metadataRefreshed || 0) || 0,
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
    metadataRefreshed: Number(source.metadataRefreshed || 0) || 0,
    removed: Number(source.removed || 0) || 0,
    failed: Number(source.failed || 0) || 0,
    skippedClaims: Number(source.skippedClaims || 0) || 0,
    errorCodes: errorCodes,
    providers: providers
  };
}

function kspGetAiProviderAdminData_(environment, input) {
  try {
    var context = environment.loadAiContext();
    var adminCredential = kspSharedAdminReadCredential_(environment);
    var adminUnlocked = kspSharedAdminTryValidateToken_(environment,
      input && input.adminSessionToken, adminCredential);
    var settings = kspNormalizeAiSettings_(context.settings);
    var keyConfigured = kspAiProviderAdminCredentialConfigured_(environment);
    var storeReady = Boolean(settings.openaiVectorStoreId);
    var enabled = Boolean(settings.openaiEnabled);
    var status = enabled && keyConfigured && storeReady && settings.openaiModelId
      ? (settings.openaiReadiness === 'ACTIVE_WITH_SYNC_ERRORS' ? 'ACTIVE_WITH_SYNC_ERRORS' : 'ACTIVE') : enabled ? 'ERROR'
      : settings.openaiReadiness || (keyConfigured || storeReady ? 'DISABLED' : 'UNCONFIGURED');
    var openAiConfig = kspBuildAiProviderConfig_(settings, KSP_AI_PROVIDERS.OPENAI);
    openAiConfig.credentialConfigured = keyConfigured;
    var geminiKeyConfigured = kspAiProviderAdminGeminiCredentialConfigured_(environment);
    var geminiStoreReady = Boolean(settings.geminiStoreName);
    var geminiEnabled = Boolean(settings.geminiEnabled);
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
      workId: '0028',
      canMutate: adminUnlocked,
      adminAuth: {
        credentialConfigured: Boolean(adminCredential.configured),
        canBootstrap: !adminCredential.configured && kspIsAiProviderAdministrator_(environment, context),
        unlocked: adminUnlocked
      },
      openai: {
        keyConfigured: keyConfigured,
        vectorStoreReady: storeReady,
        enabled: enabled,
        status: status,
        readiness: settings.openaiReadiness || ''
      },
      gemini: {
        keyConfigured: geminiKeyConfigured,
        storeReady: geminiStoreReady,
        enabled: geminiEnabled,
        status: geminiEnabled ? 'ACTIVE' : (settings.geminiReadiness ||
          (geminiKeyConfigured || geminiStoreReady ? 'DISABLED' : 'UNCONFIGURED')),
        readiness: settings.geminiReadiness || ''
      },
      modelPolicyPersisted: Boolean(settings.modelPolicyJson),
      modelPolicy: kspAiModelPolicyForAdmin_(policy)
    };
  } catch (error) {
    var code = kspGetErrorCode_(error, 'OPENAI_ACTIVATION_FAILED');
    return kspAiProviderAdminFailure_(String(code).indexOf('SHARED_ADMIN_') === 0
      ? code : 'OPENAI_ACTIVATION_FAILED');
  }
}

function kspConnectGeminiProvider_(environment, context, input) {
  var suppliedKey = kspAiTrim_(input && (input.apiKey || input.geminiApiKey));
  if (suppliedKey) kspAiProviderAdminSaveGeminiApiKey_(environment, suppliedKey);
  kspAssert_(kspAiProviderAdminGeminiCredentialConfigured_(environment),
    'GEMINI_API_KEY_NOT_CONFIGURED', 'Gemini API key is not configured.');
  if (environment && typeof environment.ensureAiSettings === 'function') {
    environment.ensureAiSettings(kspGetAiSettingSeedRows_(environment.nowIso()));
    context = environment.loadAiContext();
  }
  var settings = kspNormalizeAiSettings_(context.settings);
  kspAssert_(settings.geminiStoreName, 'GEMINI_STORE_NOT_CONFIGURED', 'Gemini Store is not configured.');
  var verified = kspAiProviderAdminReadGeminiStore_(environment, settings.geminiStoreName);
  kspAssert_(verified && kspAiTrim_(verified.name) === kspAiStoreResourcePath_(settings.geminiStoreName),
    'GEMINI_CONNECTION_TEST_FAILED', 'Gemini Store readback failed.');
  kspAiProviderAdminWriteSetting_(environment, context, KSP_AI_SETTINGS.GEMINI_ENABLED, 'false');
  kspAiProviderAdminWriteSetting_(environment, context, KSP_AI_SETTINGS.GEMINI_READINESS, 'READY_FOR_QUALIFICATION');
  return { ok: true, workId: '0026', action: 'CONNECT_GEMINI', enabled: false,
    readyForQualification: true };
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
  if (['CONNECT_OPENAI', 'DISABLE_OPENAI', 'SYNC', 'CONNECT_GEMINI', 'ENABLE_GEMINI',
      'DISABLE_GEMINI', 'SYNC_GEMINI', 'MIGRATE_MODEL_POLICY', 'SAVE_MODEL_PROFILE',
      'QUALIFY_MODEL_PROFILE'].indexOf(action) === -1) {
    return kspAiProviderAdminFailure_('AI_PROVIDER_ADMIN_ACTION_INVALID');
  }
  var context = null;
  var authorized = false;
  try {
    context = environment.loadAiContext();
    kspSharedAdminValidateToken_(environment, input && input.adminSessionToken);
    authorized = true;
    if (action === 'CONNECT_OPENAI') return kspEnableOpenAiProvider_(environment, context, input);
    if (action === 'CONNECT_GEMINI') return kspConnectGeminiProvider_(environment, context, input);
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
        if (savedProfile && savedProfile.provider === KSP_AI_PROVIDERS.GEMINI && savedProfile.isProviderDefault) {
          kspAiProviderAdminWriteSetting_(environment, context, KSP_AI_SETTINGS.GEMINI_MODEL_ID, savedProfile.modelId);
          kspAiProviderAdminWriteSetting_(environment, context, KSP_AI_SETTINGS.GEMINI_ENABLED, 'false');
          kspAiProviderAdminWriteSetting_(environment, context, KSP_AI_SETTINGS.GEMINI_READINESS, 'READY_FOR_QUALIFICATION');
        }
        return { ok: true, workId: '0025', action: action, modelPolicy: kspAiModelPolicyForAdmin_(policy) };
      }
      var profileId = kspAiTrim_(input.profileId).toLowerCase();
      var qualifyingProfile = policy.profiles.filter(function (item) { return item.profileId === profileId; })[0];
      kspAssert_(qualifyingProfile, 'AI_MODEL_SELECTION_STALE', 'Model profile is missing.');
      var isGeminiQualification = qualifyingProfile.provider === KSP_AI_PROVIDERS.GEMINI;
      if (isGeminiQualification) {
        kspAssert_(kspAiProviderAdminGeminiCredentialConfigured_(environment),
          'GEMINI_API_KEY_NOT_CONFIGURED', 'Gemini is not configured.');
      } else {
        kspAssert_(qualifyingProfile.provider === KSP_AI_PROVIDERS.OPENAI,
          'AI_MODEL_QUALIFICATION_PROVIDER_UNSUPPORTED', 'Model qualification provider is unsupported.');
        kspAssert_(kspAiProviderAdminCredentialConfigured_(environment) && policySettings.openaiVectorStoreId,
          'OPENAI_API_KEY_NOT_CONFIGURED', 'OpenAI is not configured.');
      }
      try {
        var geminiCampaign = isGeminiQualification
          ? kspRunGeminiStrictCitationE2eQualification_(environment, context,
            qualifyingProfile, input.thinkingProfileId) : null;
        var qualification = isGeminiQualification
          ? geminiCampaign.qualification
          : kspRunOpenAiSyntheticConnectionTest_(environment, policySettings.openaiVectorStoreId, qualifyingProfile);
        if (isGeminiQualification) {
          (geminiCampaign.attemptedProfiles || []).forEach(function (attemptedProfile) {
            if (attemptedProfile.modelId === geminiCampaign.selectedProfile.modelId) return;
            attemptedProfile.isProviderDefault = false;
            attemptedProfile.userVisible = false;
            policy = kspUpsertAiModelProfile_(policy, attemptedProfile, environment.nowIso());
            policy = kspMarkAiModelProfileQualification_(policy, attemptedProfile.profileId,
              { passed: false, accessible: null,
                thinkingResults: [{ thinkingProfileId: 'low', passed: false }] }, environment.nowIso());
          });
          geminiCampaign.selectedProfile.isProviderDefault = true;
          geminiCampaign.selectedProfile.userVisible = false;
          policy = kspUpsertAiModelProfile_(policy, geminiCampaign.selectedProfile, environment.nowIso());
          profileId = geminiCampaign.selectedProfile.profileId;
          qualifyingProfile = geminiCampaign.selectedProfile;
          policy.profiles.forEach(function (item) {
            if (item.provider !== KSP_AI_PROVIDERS.GEMINI) return;
            item.isProviderDefault = item.profileId === profileId;
            item.userVisible = false;
          });
          policy = kspNormalizeAiModelPolicy_(policy);
        }
        policy = kspMarkAiModelProfileQualification_(policy, profileId,
          { passed: qualification.qualified > 0, accessible: qualification.accessible,
            thinkingResults: qualification.thinkingResults,
            storeName: qualification.storeName,
            requestProfileVersion: qualification.requestProfileVersion }, environment.nowIso());
        policy = kspPersistAiModelPolicy_(environment, context, policy);
        var qualifiedDefault = policy.profiles.filter(function (item) { return item.profileId === profileId; })[0];
        kspAssert_(qualifiedDefault &&
          qualifiedDefault.qualification === KSP_AI_MODEL_QUALIFICATION_STATES.QUALIFIED,
          'AI_MODEL_QUALIFICATION_FAILED', 'Default thinking profile qualification failed.');
        if (isGeminiQualification) {
          kspAiProviderAdminWriteSetting_(environment, context, KSP_AI_SETTINGS.GEMINI_MODEL_ID,
            qualifyingProfile.modelId);
          kspAiProviderAdminWriteSetting_(environment, context, KSP_AI_SETTINGS.GEMINI_ENABLED, 'false');
          kspAiProviderAdminWriteSetting_(environment, context, KSP_AI_SETTINGS.GEMINI_READINESS, 'QUALIFIED_DISABLED');
        }
        return { ok: true, workId: isGeminiQualification ? '0027' : '0025', action: action,
          terminalOutcome: isGeminiQualification ? geminiCampaign.terminalOutcome : undefined,
          qualification: { status: qualification.status, qualified: qualification.qualified,
            failed: qualification.failed, accessible: qualification.accessible,
            latencyMs: qualification.latencyMs || 0, thinkingResults: qualification.thinkingResults,
            evidence: isGeminiQualification ? geminiCampaign.evidence : undefined },
          modelPolicy: kspAiModelPolicyForAdmin_(policy) };
      } catch (qualificationError) {
        var qualificationCode = kspGetErrorCode_(qualificationError);
        if (isGeminiQualification && qualificationError.geminiE2e === true) {
          try {
            kspAiProviderAdminWriteSetting_(environment, context, KSP_AI_SETTINGS.GEMINI_ENABLED, 'false');
            kspAiProviderAdminWriteSetting_(environment, context, KSP_AI_SETTINGS.GEMINI_READINESS,
              kspGeminiE2eSafeOutcome_(qualificationError.terminalOutcome));
          } catch (ignoredE2eState) {}
          throw qualificationError;
        }
        var inaccessible = qualificationCode === 'OPENAI_HTTP_401' || qualificationCode === 'OPENAI_HTTP_403' ||
          qualificationCode === 'OPENAI_HTTP_404' || qualificationCode === 'AI_GEMINI_MODEL_UNSUPPORTED' ||
          qualificationCode === 'AI_GEMINI_MODEL_ACCESS_DENIED' || qualificationCode === 'AI_GEMINI_CREDENTIAL_REJECTED';
        var geminiEvidence = isGeminiQualification && qualificationError.qualificationEvidence
          ? kspGeminiQualificationSafeCampaignEvidence_(qualificationError.qualificationEvidence) : null;
        var geminiAccessible = geminiEvidence
          ? kspGeminiQualificationAccessibleFromEvidence_(geminiEvidence) : null;
        try {
          policy = kspMarkAiModelProfileQualification_(policy, profileId,
            { passed: false, accessible: isGeminiQualification ? geminiAccessible : (inaccessible ? false : null),
              thinkingResults: [{ thinkingProfileId: kspAiTrim_(input.thinkingProfileId).toLowerCase(), passed: false }] },
          environment.nowIso());
          kspPersistAiModelPolicy_(environment, context, policy);
          if (isGeminiQualification) {
            kspAiProviderAdminWriteSetting_(environment, context, KSP_AI_SETTINGS.GEMINI_ENABLED, 'false');
            kspAiProviderAdminWriteSetting_(environment, context, KSP_AI_SETTINGS.GEMINI_READINESS,
              qualificationError.geminiExternal === true ? 'DISABLED_EXTERNAL_LIMITATION' : 'ERROR');
          }
        } catch (ignoredQualificationState) {}
        if (isGeminiQualification && geminiEvidence) throw qualificationError;
        if (isGeminiQualification && (qualificationCode === 'AI_GEMINI_MODEL_UNSUPPORTED' ||
            qualificationCode === 'AI_GEMINI_MODEL_ACCESS_DENIED' ||
            qualificationCode === 'AI_GEMINI_CREDENTIAL_REJECTED')) throw qualificationError;
        throw kspAiModelPolicyError_('AI_MODEL_QUALIFICATION_FAILED');
      }
    }
    if (action === 'ENABLE_GEMINI') {
      var enableSettings = kspNormalizeAiSettings_(environment.loadAiContext().settings);
      kspAssert_(kspAiProviderAdminGeminiCredentialConfigured_(environment) && enableSettings.geminiStoreName,
        'GEMINI_NOT_READY', 'Gemini credential and Store are required.');
      var enableConfig = kspBuildAiProviderConfig_(enableSettings, KSP_AI_PROVIDERS.GEMINI);
      enableConfig.enabled = true;
      enableConfig.credentialConfigured = true;
      var choices = kspGetEffectiveAiModelChoices_(enableSettings, KSP_AI_PROVIDERS.GEMINI,
        enableConfig, environment.nowIso());
      kspAssert_(choices.profiles.length > 0, 'GEMINI_NOT_READY', 'Gemini exact tuple is not qualified.');
      kspAiProviderAdminWriteSetting_(environment, context, KSP_AI_SETTINGS.GEMINI_ENABLED, 'true');
      kspAiProviderAdminWriteSetting_(environment, context, KSP_AI_SETTINGS.GEMINI_READINESS, 'ACTIVE');
      return { ok: true, workId: '0026', action: action, enabled: true, readiness: 'ACTIVE' };
    }
    if (action === 'DISABLE_GEMINI') {
      kspAiProviderAdminWriteSetting_(environment, context, KSP_AI_SETTINGS.GEMINI_ENABLED, 'false');
      kspAiProviderAdminWriteSetting_(environment, context, KSP_AI_SETTINGS.GEMINI_READINESS, 'DISABLED');
      return { ok: true, workId: '0026', action: action, enabled: false,
        readiness: 'DISABLED', storePreserved: true };
    }
    if (action === 'SYNC_GEMINI') {
      var geminiSelection = kspNormalizeProviderAiSelection_(input);
      kspAssert_(geminiSelection.sourceId, 'AI_SYNC_SOURCE_ID_INVALID', 'Gemini admin sync must be exact.');
      var geminiSettings = kspNormalizeAiSettings_(context.settings);
      kspAssert_(kspAiProviderAdminGeminiCredentialConfigured_(environment) && geminiSettings.geminiStoreName,
        'GEMINI_NOT_READY', 'Gemini credential and Store are required.');
      kspSelectProviderAiWorkItems_(context.meetingRows, context.pitchbookRows, environment.nowIso(),
        geminiSettings, KSP_AI_PROVIDERS.GEMINI, geminiSelection);
      var geminiSync = kspRunProviderNeutralAiSync_(environment, {
        force: true,
        sourceType: geminiSelection.sourceType,
        sourceId: geminiSelection.sourceId,
        providers: [KSP_AI_PROVIDERS.GEMINI],
        allowDisabledExactProvider: true
      });
      var geminiSyncSummary = kspAiProviderAdminSafeSyncSummary_(geminiSync);
      kspAssert_(geminiSyncSummary.usable && geminiSyncSummary.failed === 0,
        'GEMINI_SYNC_FAILED', 'Gemini exact sync failed.');
      geminiSyncSummary.sourceType = geminiSelection.sourceType;
      geminiSyncSummary.exact = true;
      return { ok: true, workId: '0026', action: action, sync: geminiSyncSummary };
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
    if (action === 'CONNECT_GEMINI' && context && authorized && code !== 'GEMINI_API_KEY_NOT_CONFIGURED') {
      try {
        kspAiProviderAdminWriteSetting_(environment, context, KSP_AI_SETTINGS.GEMINI_ENABLED, 'false');
        kspAiProviderAdminWriteSetting_(environment, context, KSP_AI_SETTINGS.GEMINI_READINESS, 'ERROR');
      } catch (ignoredGeminiDisable) {}
    }
    var modelPolicyError = code.indexOf('AI_MODEL_') === 0 || code.indexOf('AI_THINKING_') === 0;
    var sharedAdminError = code.indexOf('SHARED_ADMIN_') === 0;
    var geminiAdminError = code.indexOf('GEMINI_') === 0 || code.indexOf('AI_GEMINI_') === 0;
    if (!modelPolicyError && !sharedAdminError && code !== 'AI_PROVIDER_ADMIN_UNAUTHORIZED' && code !== 'OPENAI_API_KEY_NOT_CONFIGURED' &&
        code !== 'OPENAI_API_KEY_INVALID' && code !== 'AI_SYNC_SOURCE_TYPE_INVALID' &&
        code !== 'AI_SYNC_SOURCE_TYPE_REQUIRED' && code !== 'AI_SYNC_SOURCE_TYPE_MISMATCH' &&
        code !== 'AI_SYNC_SOURCE_ID_INVALID' && code !== 'AI_SYNC_SOURCE_NOT_FOUND' &&
        code !== 'AI_SYNC_SOURCE_AMBIGUOUS' && code !== 'OPENAI_SYNC_FAILED' &&
        code !== 'OPENAI_NOT_READY_FOR_SYNC' && !geminiAdminError) {
      code = action === 'DISABLE_OPENAI' ? 'OPENAI_DISABLE_FAILED'
        : action === 'CONNECT_OPENAI' ? 'OPENAI_CONNECTION_TEST_FAILED'
          : action === 'DISABLE_GEMINI' ? 'GEMINI_DISABLE_FAILED'
            : action === 'CONNECT_GEMINI' ? 'GEMINI_CONNECTION_TEST_FAILED'
              : action === 'SYNC_GEMINI' ? 'GEMINI_SYNC_FAILED' : 'OPENAI_ACTIVATION_FAILED';
    }
    return kspAiProviderAdminFailure_(code, error && error.qualificationEvidence);
  }
}
