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
    AI_GEMINI_QUALIFICATION_PROVIDER_TERMINAL: 'Geminiモデル資格確認がプロバイダ終端状態になりました。',
    AI_GEMINI_QUALIFICATION_NO_GROUNDED_ANSWER: 'Geminiモデル資格確認で根拠付き回答を確認できませんでした。',
    AI_GEMINI_QUALIFICATION_NO_FILE_CITATION: 'Geminiモデル資格確認でFile Search引用を確認できませんでした。',
    AI_GEMINI_QUALIFICATION_CITATION_MISMATCH: 'Geminiモデル資格確認の引用を正規化できませんでした。',
    AI_GEMINI_QUALIFICATION_APPLICATION_FAILURE: 'Geminiモデル資格確認の応答形式を確認できませんでした。',
    AI_GEMINI_EXTERNAL_LIMITATION: 'Geminiは確認された外部制約により現在利用できません。',
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
    workId: '0020',
    error: { code: String(code || 'OPENAI_ACTIVATION_FAILED'), message: kspAiProviderAdminSafeMessage_(code) }
  };
  if (qualificationEvidence) {
    output.workId = '0026';
    output.qualificationEvidence = kspGeminiQualificationSafeCampaignEvidence_(qualificationEvidence);
  }
  return output;
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
    retry: false, stage: 'STORE_READ', errorCode: 'AI_STORE_READ_FAILED'
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

function kspGeminiQualificationSafeClass_(value) {
  var classification = kspAiTrim_(value).toUpperCase();
  var fixed = {
    PASS: true,
    HTTP_OR_CREDENTIAL_FAILURE: true,
    MODEL_ACCESS_OR_UNSUPPORTED: true,
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
  var modelId = kspAiTrim_(source.modelId);
  if (modelId !== 'gemini-3.8-flash' && modelId !== 'gemini-3.7-flash') modelId = '';
  return {
    classification: kspGeminiQualificationSafeClass_(source.classification),
    transport: kspGeminiQualificationSafeTransport_(source.transport),
    modelId: modelId,
    httpStatus: Math.max(0, Math.min(599, Number(source.httpStatus || 0) || 0)),
    providerStatus: providerStatus,
    providerErrorCodes: providerCodes,
    answerPresent: Boolean(source.answerPresent),
    expectedTokenPresent: Boolean(source.expectedTokenPresent),
    modelOutputBlockCount: Math.max(0, Number(source.modelOutputBlockCount || 0) || 0),
    fileCitationCount: Math.max(0, Number(source.fileCitationCount || 0) || 0),
    authoritativeCitationMatched: Boolean(source.authoritativeCitationMatched),
    latencyMs: Math.max(0, Number(source.latencyMs || 0) || 0)
  };
}

function kspGeminiQualificationSafeExternalClass_(value) {
  var external = kspAiTrim_(value).toUpperCase();
  return ['NONE', 'MODEL_ACCESS_OR_UNSUPPORTED', 'HTTP_OR_CREDENTIAL_FAILURE',
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
    MODEL_ACCESS_OR_UNSUPPORTED: 'AI_GEMINI_MODEL_UNSUPPORTED',
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
  if (code === 'AI_GEMINI_MODEL_UNSUPPORTED' || code === 'AI_GEMINI_MODEL_ACCESS_DENIED') {
    classification = 'MODEL_ACCESS_OR_UNSUPPORTED';
  } else if (code === 'AI_GEMINI_CREDENTIAL_REJECTED') {
    classification = 'HTTP_OR_CREDENTIAL_FAILURE';
  } else if (code === 'AI_QUERY_PROVIDER_TERMINAL' && providerStatus) {
    classification = 'PROVIDER_TERMINAL_' + providerStatus.toUpperCase();
  } else if (code === 'AI_QUERY_HTTP_FAILED') {
    var explicitExternalHttp = [401, 403, 429, 500, 501, 503, 504].indexOf(httpStatus) !== -1;
    var externalCodes = {
      failed_precondition: true,
      authentication: true,
      unauthenticated: true,
      permission_denied: true,
      rate_limit_exceeded: true,
      quota_exceeded: true,
      resource_exhausted: true,
      too_many_requests: true,
      api_error: true,
      internal: true,
      unimplemented: true,
      service_unavailable: true,
      unavailable: true,
      deadline_exceeded: true
    };
    var explicitExternalCode = providerCodes.some(function (value) {
      return Boolean(externalCodes[kspGeminiSafeProviderErrorCode_(value)]);
    });
    if (explicitExternalHttp || explicitExternalCode) classification = 'HTTP_OR_CREDENTIAL_FAILURE';
  }
  return kspGeminiQualificationSafeDiagnostic_({
    classification: classification,
    transport: transport,
    modelId: modelId,
    httpStatus: httpStatus,
    providerStatus: providerStatus,
    providerErrorCodes: providerCodes,
    latencyMs: latencyMs
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

function kspGeminiQualificationCitationMatches_(citation, documentValue, source) {
  var metadata = kspMetadataArrayToMap_(citation && citation.metadata || {});
  return Boolean(citation && kspAiTrim_(citation.source) && documentValue &&
    kspAiTrim_(citation.source) === kspAiTrim_(documentValue.name) &&
    kspAiTrim_(metadata.source_type) === source.sourceType &&
    kspAiTrim_(metadata.source_id) === source.sourceId &&
    kspAiTrim_(metadata.content_hash) === source.contentHash);
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
    safe.classification.indexOf('PROVIDER_TERMINAL_') === 0 ||
    (Boolean(allowGroundingFailure) && (safe.classification === 'COMPLETED_NO_GROUNDED_ANSWER' ||
      safe.classification === 'COMPLETED_NO_FILE_CITATION'));
}

function kspGeminiQualificationAccessibleFromEvidence_(evidence) {
  var primary = evidence && evidence.primary ? kspGeminiQualificationSafeDiagnostic_(evidence.primary) : null;
  if (!primary) return null;
  if (primary.classification === 'MODEL_ACCESS_OR_UNSUPPORTED') return false;
  if (primary.classification === 'HTTP_OR_CREDENTIAL_FAILURE') {
    if (primary.httpStatus === 401 || primary.httpStatus === 403 ||
        primary.providerErrorCodes.indexOf('authentication') !== -1 ||
        primary.providerErrorCodes.indexOf('unauthenticated') !== -1 ||
        primary.providerErrorCodes.indexOf('permission_denied') !== -1) return false;
    return null;
  }
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
  ).filter(function (documentValue) { return kspGeminiDocumentMatchesSource_(documentValue, source); });
  kspAssert_(documents.length === 1, 'AI_DOCUMENT_READBACK_FAILED',
    'Gemini qualification requires exactly one current provider document.');
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
  var mapped = kspMapKnowledgeCitations_(parsed.citations,
    kspBuildAuthoritativeSourceMaps_(context.meetingRows, context.pitchbookRows));
  var answerPresent = Boolean(parsed.answer);
  var expectedTokenPresent = answerPresent &&
    parsed.answer.indexOf('CODEX18_SYNTH_PITCHBOOK_20260830') !== -1;
  var modelOutputBlockCount = kspGeminiQualificationModelOutputBlockCount_(raw, transport);
  var fileCitationCount = Array.isArray(parsed.citations) ? parsed.citations.length : 0;
  var exactCitationCount = (parsed.citations || []).filter(function (citation) {
    return kspGeminiQualificationCitationMatches_(citation, documents[0], source);
  }).length;
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
      workId: '0020',
      canMutate: kspIsAiProviderAdministrator_(environment, context),
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
    return kspAiProviderAdminFailure_('OPENAI_ACTIVATION_FAILED');
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
    kspAssert_(kspIsAiProviderAdministrator_(environment, context),
      'AI_PROVIDER_ADMIN_UNAUTHORIZED', 'AI provider mutation requires an administrator.');
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
        kspAssert_(policySettings.geminiStoreName, 'GEMINI_STORE_NOT_CONFIGURED', 'Gemini Store is not configured.');
      } else {
        kspAssert_(qualifyingProfile.provider === KSP_AI_PROVIDERS.OPENAI,
          'AI_MODEL_QUALIFICATION_PROVIDER_UNSUPPORTED', 'Model qualification provider is unsupported.');
        kspAssert_(kspAiProviderAdminCredentialConfigured_(environment) && policySettings.openaiVectorStoreId,
          'OPENAI_API_KEY_NOT_CONFIGURED', 'OpenAI is not configured.');
      }
      try {
        var geminiCampaign = isGeminiQualification
          ? kspRunGeminiBoundedQualificationCampaign_(environment, context, policySettings,
            qualifyingProfile, input.thinkingProfileId) : null;
        var qualification = isGeminiQualification
          ? geminiCampaign.qualification
          : kspRunOpenAiSyntheticConnectionTest_(environment, policySettings.openaiVectorStoreId, qualifyingProfile);
        if (isGeminiQualification && geminiCampaign.selectedProfile.modelId !== qualifyingProfile.modelId) {
          policy = kspMarkAiModelProfileQualification_(policy, profileId,
            { passed: false, accessible: false,
              thinkingResults: [{ thinkingProfileId: kspAiTrim_(input.thinkingProfileId).toLowerCase(), passed: false }] },
          environment.nowIso());
          policy = kspUpsertAiModelProfile_(policy, geminiCampaign.selectedProfile, environment.nowIso());
          profileId = geminiCampaign.selectedProfile.profileId;
          qualifyingProfile = geminiCampaign.selectedProfile;
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
          if (qualifyingProfile.isProviderDefault) {
            kspAiProviderAdminWriteSetting_(environment, context, KSP_AI_SETTINGS.GEMINI_MODEL_ID,
              qualifyingProfile.modelId);
          }
          kspAiProviderAdminWriteSetting_(environment, context, KSP_AI_SETTINGS.GEMINI_READINESS, 'QUALIFIED_DISABLED');
        }
        return { ok: true, workId: isGeminiQualification ? '0026' : '0025', action: action,
          qualification: { status: qualification.status, qualified: qualification.qualified,
            failed: qualification.failed, accessible: qualification.accessible,
            latencyMs: qualification.latencyMs || 0, thinkingResults: qualification.thinkingResults,
            evidence: isGeminiQualification ? geminiCampaign.evidence : undefined },
          modelPolicy: kspAiModelPolicyForAdmin_(policy) };
      } catch (qualificationError) {
        var qualificationCode = kspGetErrorCode_(qualificationError);
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
    var geminiAdminError = code.indexOf('GEMINI_') === 0 || code.indexOf('AI_GEMINI_') === 0;
    if (!modelPolicyError && code !== 'AI_PROVIDER_ADMIN_UNAUTHORIZED' && code !== 'OPENAI_API_KEY_NOT_CONFIGURED' &&
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
