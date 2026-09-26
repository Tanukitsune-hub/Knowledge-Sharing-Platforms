// ===== BEGIN src/165_AiProviderAdmin.gs =====
function kspAiProviderAdminSafeMessage_(code) {
  var messages = {
    AI_PROVIDER_ADMIN_ACTION_INVALID: 'AIプロバイダ操作が不正です。',
    AI_CREDENTIAL_FACADE_REQUIRED: 'APIキーの設定は専用の管理者操作を使用してください。',
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
    workId: '0020',
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

function kspAiProviderAdminNormalizeSourceType_(input) {
  return kspNormalizeProviderAiSelection_(input).sourceType;
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
    { type: KSP_AI_SOURCE_TYPES.PITCHBOOK, rows: context && context.pitchbookRows || [], key: 'Document_ID' },
    { type: KSP_AI_SOURCE_TYPES.NEWS, rows: context && context.newsRows || [], key: 'News_ID' },
    { type: KSP_AI_SOURCE_TYPES.INTERNAL_ASSESSMENT,
      rows: context && context.assessmentRows || [], key: 'Assessment_ID' }
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
    entityKey: 'COUNTERPARTY:KSP-SYNTHETIC-GP',
    counterpartyType: 'GP',
    counterpartyId: 'KSP-SYNTHETIC-GP',
    relatedGpIds: '',
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
    entityKey: 'COUNTERPARTY:KSP-SYNTHETIC-GP',
    counterpartyType: 'GP',
    counterpartyId: 'KSP-SYNTHETIC-GP',
    relatedGpIds: '',
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
    kspBuildAiMasterMaps_(kspContextCounterpartyRows_(context), context.optionRows));
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
    var credentialOperator = false;
    try { kspAssertAiCredentialOperator_(environment); credentialOperator = true; }
    catch (ignoredOperator) {}
    return {
      ok: true,
      workId: '0029',
      canMutate: true,
      credentialOperator: credentialOperator,
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
    return kspAiProviderAdminFailure_('OPENAI_ACTIVATION_FAILED');
  }
}

function kspConnectGeminiProvider_(environment, context, input) {
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
  if (input && (Object.prototype.hasOwnProperty.call(input, 'apiKey') ||
      Object.prototype.hasOwnProperty.call(input, 'openaiApiKey') ||
      Object.prototype.hasOwnProperty.call(input, 'geminiApiKey'))) {
    return kspAiProviderAdminFailure_('AI_CREDENTIAL_FACADE_REQUIRED');
  }
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
      var geminiSettings = kspNormalizeAiSettings_(context.settings);
      kspAssert_(geminiSelection.sourceId || geminiSettings.geminiEnabled,
        'GEMINI_NOT_READY', 'Gemini must be enabled before batch sync.');
      kspAssert_(kspAiProviderAdminGeminiCredentialConfigured_(environment) && geminiSettings.geminiStoreName,
        'GEMINI_NOT_READY', 'Gemini credential and Store are required.');
      if (geminiSelection.sourceId) kspSelectProviderAiWorkItems_(
        context.meetingRows, context.pitchbookRows, environment.nowIso(),
        geminiSettings, KSP_AI_PROVIDERS.GEMINI, geminiSelection,
        context.newsRows, context.assessmentRows);
      var geminiSync = kspRunProviderNeutralAiSync_(environment, {
        force: true,
        sourceType: geminiSelection.sourceType,
        sourceId: geminiSelection.sourceId,
        providers: [KSP_AI_PROVIDERS.GEMINI],
        allowDisabledExactProvider: Boolean(geminiSelection.sourceId)
      });
      var geminiSyncSummary = kspAiProviderAdminSafeSyncSummary_(geminiSync);
      kspAssert_(geminiSyncSummary.usable,
        'GEMINI_SYNC_FAILED', 'Gemini exact sync failed.');
      geminiSyncSummary.sourceType = geminiSelection.sourceType;
      geminiSyncSummary.exact = Boolean(geminiSelection.sourceId);
      geminiSyncSummary.remaining = kspAiProviderRemainingCount_(environment.loadAiContext(),
        KSP_AI_PROVIDERS.GEMINI, geminiSettings.geminiStoreName);
      geminiSyncSummary.batchComplete = geminiSyncSummary.remaining === 0 && !geminiSyncSummary.partial;
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
        currentSettings, KSP_AI_PROVIDERS.OPENAI, normalizedSelection,
        context.newsRows, context.assessmentRows);
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
    summary.remaining = kspAiProviderRemainingCount_(environment.loadAiContext(),
      KSP_AI_PROVIDERS.OPENAI, currentSettings.openaiVectorStoreId);
    summary.batchComplete = summary.remaining === 0 && !summary.partial;
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
    if (!modelPolicyError && code !== 'OPENAI_API_KEY_NOT_CONFIGURED' &&
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
// ===== END src/165_AiProviderAdmin.gs =====

// ===== BEGIN src/166_AiModelSetup.gs =====
var KSP_AI_SETUP_SOURCE_TYPES = Object.freeze([
  KSP_AI_SOURCE_TYPES.MEETING, KSP_AI_SOURCE_TYPES.PITCHBOOK,
  KSP_AI_SOURCE_TYPES.NEWS, KSP_AI_SOURCE_TYPES.INTERNAL_ASSESSMENT
]);

function kspAiSetupDigest_(value) {
  var bytes = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256,
    String(value || ''), Utilities.Charset.UTF_8);
  return bytes.map(function (byte) { return ('0' + (byte & 255).toString(16)).slice(-2); }).join('');
}

function kspAiActiveCredentialSnapshotLive_(provider) {
  var key = provider === KSP_AI_PROVIDERS.OPENAI
    ? KSP_AI_PROPERTY_KEYS.OPENAI_ACTIVE_SNAPSHOT : KSP_AI_PROPERTY_KEYS.GEMINI_ACTIVE_SNAPSHOT;
  var raw = PropertiesService.getScriptProperties().getProperty(key);
  if (!raw) return null;
  var snapshot;
  try { snapshot = JSON.parse(raw); } catch (ignored) { throw kspAiSetupError_('AI_SETUP_CREDENTIAL_INVALID'); }
  if (!snapshot || snapshot.version !== 1 || !snapshot.key ||
      !/^[a-f0-9]{32}$/.test(String(snapshot.generation || ''))) {
    throw kspAiSetupError_('AI_SETUP_CREDENTIAL_INVALID');
  }
  return snapshot;
}

function kspAiSetupError_(code) {
  var error = new Error('AI setup could not be completed.');
  error.code = code;
  return error;
}

function kspAiSetupSafeFailure_(error) {
  var code = kspGetErrorCode_(error, 'AI_SETUP_FAILED');
  var allowed = {
    AI_SETUP_OPERATOR_REQUIRED: true, AI_SETUP_CREDENTIAL_REQUIRED: true,
    AI_SETUP_MODEL_INVALID: true, AI_SETUP_PROVIDER_INVALID: true,
    AI_SETUP_QUALIFICATION_FAILED: true, AI_SETUP_CLEANUP_REQUIRED: true,
    AI_SETUP_STORE_ACCESS_FAILED: true, AI_SETUP_STALE: true,
    AI_SETUP_OPERATION_INVALID: true, AI_SETUP_WRITE_FAILED: true,
    AI_SETUP_FACADE_REQUIRED: true, AI_SETUP_STOP_REQUIRED: true
  };
  if (!allowed[code]) code = 'AI_SETUP_FAILED';
  var messages = {
    AI_SETUP_OPERATOR_REQUIRED: 'APIキーの操作には登録済み管理者の本人確認が必要です。',
    AI_SETUP_CREDENTIAL_REQUIRED: 'APIキーを入力してください。',
    AI_SETUP_MODEL_INVALID: 'Model IDを確認してください。',
    AI_SETUP_PROVIDER_INVALID: '接続先を確認してください。',
    AI_SETUP_QUALIFICATION_FAILED: '選択したモデルの資料検索を確認できませんでした。現在の設定は維持されます。',
    AI_SETUP_CLEANUP_REQUIRED: '確認用の一時資料の後片付けが必要です。現在の設定は維持されます。',
    AI_SETUP_STORE_ACCESS_FAILED: '現在の検索データに候補キーでアクセスできません。現在の設定は維持されます。',
    AI_SETUP_STALE: '設定が更新されています。再読込してから確認してください。',
    AI_SETUP_OPERATION_INVALID: '操作の識別情報を確認してください。',
    AI_SETUP_WRITE_FAILED: '設定を保存できませんでした。操作結果を確認してください。',
    AI_SETUP_FACADE_REQUIRED: 'APIキーの設定は専用の管理者操作を使用してください。',
    AI_SETUP_STOP_REQUIRED: '接続を停止してからAPIキーを削除してください。',
    AI_SETUP_FAILED: '設定を完了できませんでした。現在の設定を確認してください。'
  };
  return { ok: false, workId: '0073', error: { code: code, message: messages[code] } };
}

function kspAssertAiCredentialOperator_(environment) {
  var identities = environment.getSessionIdentities && environment.getSessionIdentities();
  var active = kspNormalizeInstallerIdentity_(identities && identities.active);
  var state = environment.getInstallationState && environment.getInstallationState();
  var admins = state && state.config ? kspNormalizeEmailList_(state.config.adminEmails || []) : [];
  var owner = environment.getProperty ? kspReadInstallerOwner_(environment) : '';
  if (!active || !owner || admins.indexOf(owner) === -1 || admins.indexOf(active) === -1) {
    throw kspAiSetupError_('AI_SETUP_OPERATOR_REQUIRED');
  }
  return active;
}

function kspAiSetupPolicy_(settings, nowIso) {
  if (settings.modelPolicyJson) return kspNormalizeAiModelPolicy_(settings.modelPolicyJson);
  if (settings.openaiModelId) return kspBuildMigratedOpenAiModelPolicy_(settings, {
    modelId: settings.openaiModelId, accessible: Boolean(settings.openaiEnabled),
    qualified: Boolean(settings.openaiEnabled &&
      ['ACTIVE', 'ACTIVE_WITH_SYNC_ERRORS', 'READY_FOR_SYNC'].indexOf(settings.openaiReadiness) !== -1),
    nowIso: nowIso
  });
  return kspNormalizeAiModelPolicy_({
    schemaVersion: KSP_AI_DEFAULTS.MODEL_POLICY_SCHEMA_VERSION, updatedAt: nowIso, profiles: []
  });
}

function kspAiSetupModelId_(value) {
  var modelId = kspAiTrim_(value);
  if (!modelId || modelId.length > 128 || !/^[A-Za-z0-9][A-Za-z0-9._:/-]*$/.test(modelId)) {
    throw kspAiSetupError_('AI_SETUP_MODEL_INVALID');
  }
  return modelId;
}

function kspAiSetupCandidateKey_(value) {
  var key = kspAiTrim_(value);
  if (!key || key.length > 512 || /[\x00-\x1f\x7f]/.test(key)) {
    throw kspAiSetupError_('AI_SETUP_CREDENTIAL_REQUIRED');
  }
  return key;
}

function kspAiSetupProfile_(policy, provider, modelId, displayName, nowIso, options) {
  var requestedProfileId = kspAiTrim_(options && options.profileId).toLowerCase();
  var saveAsVariant = options && options.saveAsVariant === true;
  if (requestedProfileId && saveAsVariant) throw kspAiSetupError_('AI_SETUP_MODEL_INVALID');
  var requestedRaw = kspAiTrim_(options && options.thinkingRawValue);
  if (requestedRaw && !/^[A-Za-z0-9_-]{1,32}$/.test(requestedRaw)) {
    throw kspAiSetupError_('AI_SETUP_MODEL_INVALID');
  }
  var rawThinkingId = requestedRaw ? 'setting-' + kspAiSetupDigest_(requestedRaw).slice(0, 12) : '';
  var matching = policy.profiles.filter(function (item) {
    return item.provider === provider && item.modelId === modelId;
  });
  var existing = requestedProfileId ? policy.profiles.filter(function (item) {
    return item.provider === provider && item.profileId === requestedProfileId;
  })[0] : matching.filter(function (item) { return item.isProviderDefault; })[0] ||
    matching.filter(function (item) {
      return item.defaultThinkingProfileId === KSP_AI_DEFAULTS.PROVIDER_DEFAULT_THINKING_PROFILE_ID;
    })[0] || matching[0];
  if (requestedProfileId && !existing) throw kspAiSetupError_('AI_SETUP_MODEL_INVALID');
  if (existing) {
    var retained = kspDeepClone_(existing);
    retained.modelId = modelId;
    retained.family = modelId.slice(0, 80);
    if (saveAsVariant) {
      retained.profileId = provider.toLowerCase() + '-variant-' +
        kspAiSetupDigest_(modelId + '|' + options.operationId).slice(0, 16);
      retained.createdAt = nowIso;
      retained.qualification = KSP_AI_MODEL_QUALIFICATION_STATES.UNQUALIFIED;
      retained.fileSearch = false;
      retained.qualifiedTupleFingerprint = '';
    }
    retained.isProviderDefault = options.makeDefault === true;
    if (options.displayName) retained.displayName = kspAiTrim_(options.displayName).slice(0, 120);
    if (!retained.isProviderDefault && options && Object.prototype.hasOwnProperty.call(options, 'enabled')) {
      retained.enabled = options.enabled === true;
    }
    if (options && Object.prototype.hasOwnProperty.call(options, 'userVisible')) {
      retained.userVisible = options.userVisible === true;
    }
    if (requestedRaw) {
      var rawExisting = retained.thinkingProfiles.filter(function (item) {
        return !item.providerDefault && item.rawValue === requestedRaw;
      })[0];
      if (!rawExisting) {
        retained.thinkingProfiles.push({ thinkingProfileId: rawThinkingId, label: requestedRaw,
          rawValue: requestedRaw, providerDefault: false, enabled: true });
      }
      retained.defaultThinkingProfileId = rawExisting ? rawExisting.thinkingProfileId : rawThinkingId;
    }
    var requestedThinking = kspAiTrim_(options && options.thinkingProfileId).toLowerCase();
    if (requestedThinking && !requestedRaw) {
      if (!retained.thinkingProfiles.some(function (item) {
        return item.thinkingProfileId === requestedThinking && item.enabled;
      })) throw kspAiSetupError_('AI_SETUP_MODEL_INVALID');
      retained.defaultThinkingProfileId = requestedThinking;
    }
    if (options && Object.prototype.hasOwnProperty.call(options, 'maxOutputTokens')) {
      retained.maxOutputTokens = options.maxOutputTokens === null || options.maxOutputTokens === ''
        ? null : Number(options.maxOutputTokens);
    }
    return kspAiModelPolicyProfile_(retained);
  }
  if (!requestedRaw && options && options.thinkingProfileId && options.thinkingProfileId !==
      KSP_AI_DEFAULTS.PROVIDER_DEFAULT_THINKING_PROFILE_ID) {
    throw kspAiSetupError_('AI_SETUP_MODEL_INVALID');
  }
  var profileId = provider.toLowerCase() + '-model-' + kspAiSetupDigest_(provider + '|' + modelId).slice(0, 16);
  if (saveAsVariant) profileId = provider.toLowerCase() + '-variant-' +
    kspAiSetupDigest_(modelId + '|' + options.operationId).slice(0, 16);
  return kspAiModelPolicyProfile_({
    profileId: profileId, provider: provider, modelId: modelId,
    displayName: kspAiTrim_(options.displayName || displayName).slice(0, 120) || modelId.slice(0, 120),
    family: modelId.slice(0, 80), enabled: options.enabled !== false,
    userVisible: options.userVisible !== false, isProviderDefault: options.makeDefault === true,
    thinkingProfiles: [kspBuildProviderDefaultThinkingProfile_()].concat(requestedRaw ? [{
      thinkingProfileId: rawThinkingId, label: requestedRaw, rawValue: requestedRaw,
      providerDefault: false, enabled: true
    }] : []),
    defaultThinkingProfileId: requestedRaw ? rawThinkingId : KSP_AI_DEFAULTS.PROVIDER_DEFAULT_THINKING_PROFILE_ID,
    maxOutputTokens: options && Object.prototype.hasOwnProperty.call(options, 'maxOutputTokens')
      ? options.maxOutputTokens :
      (provider === KSP_AI_PROVIDERS.GEMINI ? KSP_AI_DEFAULTS.QUERY_MAX_OUTPUT_TOKENS : null),
    createdAt: nowIso, updatedAt: nowIso
  });
}

function kspAiSetupTupleFingerprint_(profile, generation, storeName) {
  return kspAiSetupDigest_(JSON.stringify({
    contract: kspAiModelQualificationSignature_(profile),
    requestProfileVersion: KSP_AI_DEFAULTS.QUERY_REQUEST_PROFILE_VERSION,
    credentialGeneration: kspAiTrim_(generation),
    operationalStore: kspAiTrim_(storeName)
  }));
}

function kspAiSetupSyntheticSources_(environment) {
  var types = KSP_AI_SETUP_SOURCE_TYPES;
  var ids = ['MTG-900073', 'DOC-900073', 'NEWS-900073', 'ASMT-900073'];
  var tokens = ['KSP0073-MEETING-SENTINEL', 'KSP0073-PITCHBOOK-SENTINEL',
    'KSP0073-NEWS-SENTINEL', 'KSP0073-ASSESSMENT-SENTINEL'];
  return types.map(function (type, index) {
    var text = index === 3
      ? 'Fictional internal assessment at the time, not an external fact. ' + tokens[index]
      : 'Fictional synthetic qualification source. ' + tokens[index];
    return { sourceType: type, sourceId: ids[index], dateKey: '2026-09-26',
      counterpartyType: 'GP', counterpartyId: 'KSP-SYNTHETIC-A',
      entityKey: 'COUNTERPARTY:KSP-SYNTHETIC-A', gpId: 'KSP-SYNTHETIC-A',
      relatedGpIds: index === 2 ? 'KSP-SYNTHETIC-A,KSP-SYNTHETIC-B' : '',
      assetClassId: 'KSP-SYNTHETIC-ASSET', capitalTypeId: 'KSP-SYNTHETIC-CAPITAL',
      teamId: 'KSP-SYNTHETIC-TEAM', displayName: 'ksp-0073-' + type + '.txt',
      savedFilename: 'ksp-0073-' + type + '.txt', mimeType: 'text/plain',
      text: text, token: tokens[index],
      contentHash: environment.hashText ? environment.hashText(text) : kspAiHashTextFallback_(text) };
  });
}

function kspAiSetupOpenAiSourceMaps_(source, documentValue) {
  var fileId = kspAiTrim_(documentValue && (documentValue.fileId || documentValue.providerDocumentId));
  var authoritative = {
    sourceType: source.sourceType, sourceId: source.sourceId, status: KSP_STATUS.ACTIVE,
    date: source.dateKey, driveUrl: 'https://example.invalid/synthetic-source',
    savedFilename: source.savedFilename, providerContentHashes: { OPENAI: source.contentHash, GEMINI: '' },
    contentHash: source.contentHash, providerDocumentIds: [fileId]
  };
  var maps = { bySourceId: {}, bySourceKey: {}, byAiDocumentName: {}, byProviderDocumentId: {} };
  maps.bySourceId[source.sourceId] = authoritative;
  maps.bySourceKey[kspAiSourceKey_(source.sourceType, source.sourceId)] = authoritative;
  maps.byProviderDocumentId[fileId] = authoritative;
  return maps;
}

function kspRunFourSourceAiSetupQualification_(environment, input) {
  var request = input || {};
  var provider = request.provider;
  var profile = request.profile;
  var key = request.apiKey || '';
  var store = null;
  var uploaded = [];
  var primaryError = null;
  var cleanupFailed = false;
  var passed = false;
  var sources = kspAiSetupSyntheticSources_(environment);
  try {
    store = environment.createAiQualificationStore(provider, key);
    if (!store || !store.name) throw kspAiSetupError_('AI_SETUP_QUALIFICATION_FAILED');
    var config = {
      provider: provider, modelId: profile.modelId,
      vectorStoreId: provider === KSP_AI_PROVIDERS.OPENAI ? store.name : '',
      storeName: provider === KSP_AI_PROVIDERS.GEMINI ? store.name : '',
      queryTransport: KSP_AI_QUERY_TRANSPORTS.INTERACTIONS,
      thinkingProviderDefault: true, thinkingRawValue: null,
      maxOutputTokens: profile.maxOutputTokens
    };
    var selectedThinking = profile.thinkingProfiles.filter(function (item) {
      return item.thinkingProfileId === profile.defaultThinkingProfileId;
    })[0];
    if (!selectedThinking || !selectedThinking.enabled) throw kspAiSetupError_('AI_SETUP_QUALIFICATION_FAILED');
    config.thinkingProviderDefault = Boolean(selectedThinking.providerDefault);
    config.thinkingRawValue = selectedThinking.providerDefault ? null : selectedThinking.rawValue;
    sources.forEach(function (source) {
      var documentValue = environment.uploadAiQualificationSource(provider, store.name, source, key);
      if (!documentValue || !documentValue.name) throw kspAiSetupError_('AI_SETUP_QUALIFICATION_FAILED');
      uploaded.push(documentValue);
      var current = environment.readAiQualificationSource(provider, store.name, documentValue, source, key);
      var metadata = current && (current.attributes || current.customMetadata) || {};
      if (metadata.source_type !== source.sourceType || metadata.source_id !== source.sourceId ||
          metadata.content_hash !== source.contentHash) {
        throw kspAiSetupError_('AI_SETUP_QUALIFICATION_FAILED');
      }
      var query = kspBuildProviderSearchRequest_(provider, config, {
        route: provider, mode: KSP_KNOWLEDGE_SEARCH_MODES.FREE_QUESTION,
        sourceTypes: [source.sourceType],
        questionOrInstruction: 'Return the exact unique token from this synthetic source.',
        advancedFilterResolved: true, resolvedSourceIds: [source.sourceId],
        filters: { sourceType: source.sourceType, sourceId: source.sourceId }
      });
      var raw = environment.queryAiQualificationSource(provider, config, query, key);
      if (provider === KSP_AI_PROVIDERS.OPENAI) {
        var parsed = kspNormalizeOpenAiResponse_(raw);
        var mapped = kspMapKnowledgeCitations_(parsed.citations,
          kspAiSetupOpenAiSourceMaps_(source, current));
        if (parsed.answer.indexOf(source.token) === -1 || parsed.warnings.length || mapped.warnings.length ||
            !mapped.citations.length || mapped.citations.some(function (citation) {
              return citation.sourceId !== source.sourceId || citation.sourceType !== source.sourceType;
            })) {
          throw kspAiSetupError_('AI_SETUP_QUALIFICATION_FAILED');
        }
      } else {
        var diagnostic = kspGeminiEvaluateSyntheticQualificationResponse_(raw, {
          transport: KSP_AI_QUERY_TRANSPORTS.INTERACTIONS, modelId: profile.modelId,
          expectedToken: source.token, source: source, document: current,
          storeName: store.name, config: config,
          environment: {
            findProviderDocumentsBySource: function () { return [current]; },
            readProviderDocument: function () { return current; }
          },
          sourceMaps: kspBuildGeminiSyntheticAuthoritativeSourceMaps_(source, current, store.name),
          correlationHash: source.contentHash
        });
        if (!diagnostic || diagnostic.classification !== 'PASS') {
          throw kspAiSetupError_('AI_SETUP_QUALIFICATION_FAILED');
        }
      }
    });
    passed = true;
  } catch (error) { primaryError = error; }
  finally {
    if (store && store.name) {
      if (provider === KSP_AI_PROVIDERS.OPENAI) {
        uploaded.forEach(function (item) {
          try { environment.deleteAiQualificationDocument(provider, store.name, item, key); }
          catch (ignoredDocumentDelete) { cleanupFailed = true; }
        });
      }
      try { environment.deleteAiQualificationStore(provider, store.name, key); }
      catch (ignoredStoreDelete) { cleanupFailed = true; }
      try {
        if (!environment.confirmAiQualificationStoreDeleted(provider, store.name, key)) cleanupFailed = true;
      } catch (ignoredReadback) { cleanupFailed = true; }
    }
  }
  if (cleanupFailed) throw kspAiSetupError_('AI_SETUP_CLEANUP_REQUIRED');
  if (primaryError) throw primaryError;
  return { passed: passed, cleaned: true, citationsVerified: true,
    sourceTypes: KSP_AI_SETUP_SOURCE_TYPES.slice(), fingerprint: request.fingerprint };
}

function kspAiSetupSafeCandidates_(raw) {
  var response = raw || {};
  var seen = {};
  var candidates = [];
  (Array.isArray(response.models) ? response.models : []).forEach(function (item) {
    var modelId;
    try { modelId = kspAiSetupModelId_(item && item.modelId); } catch (ignored) { return; }
    if (seen[modelId] || candidates.length >= 100) return;
    seen[modelId] = true;
    candidates.push({ modelId: modelId,
      displayName: kspAiTrim_(item && item.displayName).slice(0, 120) || modelId });
  });
  return { models: candidates, partial: response.partial === true ||
    (Array.isArray(response.models) && response.models.length > 100) };
}

function kspListAiModelSetupCandidates_(environment, input, credentialMode) {
  try {
    var payload = input || {};
    var provider = kspNormalizeAiProvider_(payload.provider);
    if (!provider) throw kspAiSetupError_('AI_SETUP_PROVIDER_INVALID');
    if (credentialMode) kspAssertAiCredentialOperator_(environment);
    else if (Object.prototype.hasOwnProperty.call(payload, 'apiKey')) {
      throw kspAiSetupError_('AI_SETUP_FACADE_REQUIRED');
    }
    var candidateKey = credentialMode ? kspAiSetupCandidateKey_(payload.apiKey) : '';
    var generation = environment.getAiCredentialGeneration(provider);
    var cached = !credentialMode && environment.getAiModelCandidateCache
      ? environment.getAiModelCandidateCache(provider, generation) : null;
    if (cached) return { ok: true, workId: '0073', provider: provider,
      models: cached.models, partial: cached.partial, fetchedAt: cached.fetchedAt, cached: true };
    var result = kspAiSetupSafeCandidates_(environment.listAiProviderModels(provider, candidateKey));
    result.fetchedAt = environment.nowIso();
    if (!credentialMode && environment.putAiModelCandidateCache) {
      environment.putAiModelCandidateCache(provider, generation, result, 600);
    }
    return { ok: true, workId: '0073', provider: provider,
      models: result.models, partial: result.partial, fetchedAt: result.fetchedAt, cached: false };
  } catch (error) { return kspAiSetupSafeFailure_(error); }
}

function kspSaveAiModelSetup_(environment, input, credentialMode) {
  try {
    var payload = input || {};
    var provider = kspNormalizeAiProvider_(payload.provider);
    if (!provider) throw kspAiSetupError_('AI_SETUP_PROVIDER_INVALID');
    if (credentialMode) kspAssertAiCredentialOperator_(environment);
    else if (Object.prototype.hasOwnProperty.call(payload, 'apiKey') ||
        Object.prototype.hasOwnProperty.call(payload, 'openaiApiKey') ||
        Object.prototype.hasOwnProperty.call(payload, 'geminiApiKey')) {
      throw kspAiSetupError_('AI_SETUP_FACADE_REQUIRED');
    }
    var candidateKey = credentialMode ? kspAiSetupCandidateKey_(payload.apiKey) : '';
    var modelId = kspAiSetupModelId_(payload.modelId);
    var operationId = kspAiTrim_(payload.operationId);
    if (!/^[a-zA-Z0-9-]{20,80}$/.test(operationId)) throw kspAiSetupError_('AI_SETUP_OPERATION_INVALID');
    var makeDefault = payload.makeDefault !== false;
    if (credentialMode && !makeDefault) throw kspAiSetupError_('AI_SETUP_MODEL_INVALID');
    var priorOperation = environment.getAiSetupOperation &&
      environment.getAiSetupOperation(operationId, credentialMode, provider);
    if (priorOperation) return priorOperation;
    var context = environment.loadAiContext();
    var settings = kspNormalizeAiSettings_(context.settings);
    var nowIso = environment.nowIso();
    var policy = kspAiSetupPolicy_(settings, nowIso);
    if (!makeDefault && !policy.profiles.some(function (item) {
      return item.provider === provider && item.isProviderDefault;
    })) throw kspAiSetupError_('AI_SETUP_MODEL_INVALID');
    var currentGeneration = environment.getAiCredentialGeneration(provider);
    var newGeneration = credentialMode
      ? kspAiSetupDigest_(operationId + '|' + nowIso).slice(0, 32) : currentGeneration;
    var storeName = provider === KSP_AI_PROVIDERS.OPENAI
      ? settings.openaiVectorStoreId : settings.geminiStoreName;
    var profileOptions = Object.assign({}, payload, { makeDefault: makeDefault, operationId: operationId });
    var profile = kspAiSetupProfile_(policy, provider, modelId, payload.displayName, nowIso, profileOptions);
    var fingerprint = kspAiSetupTupleFingerprint_(profile, newGeneration, storeName);
    var reusable = !credentialMode && profile.qualification === KSP_AI_MODEL_QUALIFICATION_STATES.QUALIFIED &&
      profile.fileSearch && profile.qualifiedTupleFingerprint === fingerprint;
    if (!reusable) {
      if (candidateKey && storeName &&
          !environment.verifyAiProviderStoreCredential(provider, storeName, candidateKey)) {
        throw kspAiSetupError_('AI_SETUP_STORE_ACCESS_FAILED');
      }
      var evidence = environment.qualifyFourSourceAiModel({
        provider: provider, profile: profile, apiKey: candidateKey,
        operationalStore: storeName, fingerprint: fingerprint
      });
      if (!evidence || evidence.cleaned !== true) throw kspAiSetupError_('AI_SETUP_CLEANUP_REQUIRED');
      if (evidence.passed !== true || evidence.fingerprint !== fingerprint ||
          evidence.citationsVerified !== true || !Array.isArray(evidence.sourceTypes) ||
          KSP_AI_SETUP_SOURCE_TYPES.some(function (type) { return evidence.sourceTypes.indexOf(type) === -1; })) {
        throw kspAiSetupError_('AI_SETUP_QUALIFICATION_FAILED');
      }
      profile.apiAccess = KSP_AI_MODEL_ACCESS_STATES.AVAILABLE;
      profile.qualification = KSP_AI_MODEL_QUALIFICATION_STATES.QUALIFIED;
      profile.fileSearch = true;
      profile.qualifiedAt = nowIso;
      profile.thinkingProfiles.forEach(function (thinking) {
        if (thinking.thinkingProfileId === profile.defaultThinkingProfileId) {
          thinking.qualification = KSP_AI_MODEL_QUALIFICATION_STATES.QUALIFIED;
          thinking.qualifiedAt = nowIso;
        } else {
          thinking.qualification = KSP_AI_MODEL_QUALIFICATION_STATES.UNQUALIFIED;
          thinking.qualifiedAt = '';
        }
      });
      profile.qualifiedRequestProfileVersion = KSP_AI_DEFAULTS.QUERY_REQUEST_PROFILE_VERSION;
      profile.qualifiedStoreName = storeName;
      profile.qualifiedCredentialGeneration = newGeneration;
      profile.qualifiedTupleFingerprint = fingerprint;
    }
    var nextProfiles = policy.profiles.filter(function (item) {
      return item.profileId !== profile.profileId;
    }).map(function (item) {
      var retained = kspDeepClone_(item);
      if (retained.provider === provider) {
        if (makeDefault) retained.isProviderDefault = false;
        if (credentialMode) {
          retained.qualification = KSP_AI_MODEL_QUALIFICATION_STATES.UNQUALIFIED;
          retained.fileSearch = false;
          retained.qualifiedAt = '';
          retained.qualifiedStoreName = '';
          retained.qualifiedRequestProfileVersion = '';
          retained.qualifiedCredentialGeneration = '';
          retained.qualifiedTupleFingerprint = '';
          retained.thinkingProfiles.forEach(function (thinking) {
            thinking.qualification = KSP_AI_MODEL_QUALIFICATION_STATES.UNQUALIFIED;
            thinking.qualifiedAt = '';
          });
        }
      }
      return retained;
    });
    profile.isProviderDefault = makeDefault;
    nextProfiles.push(profile);
    var nextPolicy = kspNormalizeAiModelPolicy_({
      schemaVersion: policy.schemaVersion, updatedAt: nowIso,
      lastOperationId: operationId, lastOperationProfileId: profile.profileId, profiles: nextProfiles
    });
    environment.commitAiModelSetup({ provider: provider, operationId: operationId,
      expectedPolicyJson: context.settings[KSP_AI_SETTINGS.MODEL_POLICY_JSON] || '',
      expectedCredentialGeneration: currentGeneration, nextCredentialGeneration: newGeneration,
      candidateKey: candidateKey, modelId: modelId, makeDefault: makeDefault, policy: nextPolicy });
    var result = { ok: true, workId: '0073', provider: provider,
      modelId: modelId, status: 'SAVED', enabled: provider === KSP_AI_PROVIDERS.OPENAI
        ? settings.openaiEnabled : settings.geminiEnabled };
    if (environment.putAiSetupOperation) environment.putAiSetupOperation(operationId, result);
    return result;
  } catch (error) { return kspAiSetupSafeFailure_(error); }
}

function kspGetAiModelSetupOperation_(environment, input) {
  try {
    var payload = input || {};
    var provider = kspNormalizeAiProvider_(payload.provider);
    var operationId = kspAiTrim_(payload.operationId);
    if (!provider || !/^[a-zA-Z0-9-]{20,80}$/.test(operationId)) {
      throw kspAiSetupError_('AI_SETUP_OPERATION_INVALID');
    }
    if (payload.credentialMode === true) kspAssertAiCredentialOperator_(environment);
    var result = environment.getAiSetupOperation(operationId, payload.credentialMode === true, provider);
    return result || { ok: true, workId: '0073', provider: provider, status: 'UNKNOWN' };
  } catch (error) { return kspAiSetupSafeFailure_(error); }
}

function kspRemoveAiCredential_(environment, input) {
  try {
    kspAssertAiCredentialOperator_(environment);
    var provider = kspNormalizeAiProvider_(input && input.provider);
    if (!provider) throw kspAiSetupError_('AI_SETUP_PROVIDER_INVALID');
    environment.removeAiCredential(provider);
    return { ok: true, workId: '0073', provider: provider, status: 'REMOVED' };
  } catch (error) { return kspAiSetupSafeFailure_(error); }
}

function kspStartAiProvider_(environment, input) {
  try {
    var provider = kspNormalizeAiProvider_(input && input.provider);
    if (!provider) throw kspAiSetupError_('AI_SETUP_PROVIDER_INVALID');
    return environment.startAiProvider(provider);
  } catch (error) { return kspAiSetupSafeFailure_(error); }
}

function kspGetAiSyncCandidates_(environment, input) {
  try {
    var context = environment.loadAiContext();
    var provider = kspNormalizeAiProvider_(input && input.provider);
    if (!provider) throw kspAiSetupError_('AI_SETUP_PROVIDER_INVALID');
    var records = [];
    var settings = kspNormalizeAiSettings_(context.settings);
    var storeName = provider === KSP_AI_PROVIDERS.OPENAI
      ? settings.openaiVectorStoreId : settings.geminiStoreName;
    KSP_AI_SOURCE_DEFINITIONS.forEach(function (definition) {
      var rows = kspAiSourceRows_(context, definition.id);
      rows.forEach(function (row) {
        var item = kspAiWorkItemFromRow_(definition.id, row);
        if (!item.sourceId) return;
        var label = kspAiTrim_(row.Title || row.Saved_Filename || row.File_Name ||
          row.Counterparty_Name || row.Counterparty_IDs || row.Counterparty_ID || row.GP_ID);
        var date = kspAiTrim_(row.Date || row.Published_Date || row.Assessment_Date || '');
        var state = kspGetAiProviderStateEntry_(row, provider);
        records.push({ sourceType: definition.id, sourceId: item.sourceId,
          label: definition.name + ' / ' + (date || '日付なし') + ' / ' +
            (label ? label.slice(0, 100) + ' / ' : '') + item.sourceId,
          status: String(row.Status || ''), syncStatus: String(state.status || ''),
          staleForStore: Boolean(state.storeName && storeName && state.storeName !== storeName) });
      });
    });
    return { ok: true, workId: '0073', provider: provider,
      records: records.slice(0, 300), partial: records.length > 300 };
  } catch (error) { return kspAiSetupSafeFailure_(error); }
}

function kspAiProviderRemainingCount_(context, provider, storeName) {
  var remaining = 0;
  KSP_AI_SOURCE_DEFINITIONS.forEach(function (definition) {
    kspAiSourceRows_(context, definition.id).forEach(function (row) {
      var state = kspGetAiProviderStateEntry_(row, provider);
      if (row.Status === KSP_STATUS.ACTIVE &&
          (state.status !== KSP_AI_INDEX_STATUS.INDEXED || !state.documentName ||
            Boolean(state.storeName && storeName && state.storeName !== storeName))) remaining += 1;
      if (row.Status === KSP_STATUS.INACTIVE && state.documentName) remaining += 1;
    });
  });
  return remaining;
}

function kspResetAiProviderDerivedState_(environment, input) {
  try {
    var provider = kspNormalizeAiProvider_(input && input.provider);
    if (!provider) throw kspAiSetupError_('AI_SETUP_PROVIDER_INVALID');
    var context = environment.loadAiContext();
    var settings = kspNormalizeAiSettings_(context.settings);
    if (provider === KSP_AI_PROVIDERS.OPENAI ? settings.openaiEnabled : settings.geminiEnabled) {
      throw kspAiSetupError_('AI_SETUP_STOP_REQUIRED');
    }
    var storeName = provider === KSP_AI_PROVIDERS.OPENAI
      ? settings.openaiVectorStoreId : settings.geminiStoreName;
    if (!storeName) throw kspAiSetupError_('AI_SETUP_STORE_ACCESS_FAILED');
    var reset = 0;
    KSP_AI_SOURCE_DEFINITIONS.forEach(function (definition) {
      kspAiSourceRows_(context, definition.id).forEach(function (row) {
        var item = kspAiWorkItemFromRow_(definition.id, row);
        var state = kspGetAiProviderStateEntry_(row, provider);
        if (!item.sourceId || !state.storeName || state.storeName === storeName) return;
        environment.updateAiProviderState(definition.id, item.sourceId, provider, {
          status: KSP_AI_INDEX_STATUS.NOT_INDEXED, documentName: '', providerDocumentId: '',
          storeName: '', indexedAt: '', contentHash: '', lastError: ''
        });
        reset += 1;
      });
    });
    return { ok: true, workId: '0073', provider: provider, reset: reset,
      remaining: kspAiProviderRemainingCount_(environment.loadAiContext(), provider, storeName) };
  } catch (error) { return kspAiSetupSafeFailure_(error); }
}
// ===== END src/166_AiModelSetup.gs =====

// ===== BEGIN src/166_ThemeSettings.gs =====
var KSP_THEME_SETTINGS_PROPERTY_KEY = 'KSP_THEME_SETTINGS_V1';
var KSP_THEME_SETTINGS_SCHEMA_VERSION = 1;

var KSP_THEME_TOKEN_DEFINITIONS = Object.freeze([
  { key: 'sidebar.background', group: 'Sidebar', label: 'Sidebar 背景', colorName: 'Charcoal Navy Slate', cssVariable: '--theme-sidebar-background', defaultHex: '#2D3E49' },
  { key: 'sidebar.text', group: 'Sidebar', label: 'Sidebar 文字', colorName: 'Warm Ivory Gold', cssVariable: '--theme-sidebar-text', defaultHex: '#EADDBF' },
  { key: 'sidebar.gold', group: 'Sidebar', label: 'Sidebar Goldアクセント', colorName: 'Antique Gold', cssVariable: '--theme-sidebar-gold', defaultHex: '#D7AE42' },
  { key: 'sidebar.activeBackground', group: 'Sidebar', label: 'Sidebar 選択中背景', colorName: 'Deep Corporate Red', cssVariable: '--theme-sidebar-active-background', defaultHex: '#B5121B' },
  { key: 'sidebar.activeAccent', group: 'Sidebar', label: 'Sidebar 選択中アクセント', colorName: 'Signal Red', cssVariable: '--theme-sidebar-active-accent', defaultHex: '#E02A36' },
  { key: 'main.pageBackground', group: 'Main', label: 'Main ページ背景', colorName: 'Executive Mist Slate', cssVariable: '--theme-main-page-background', defaultHex: '#E7EDF2' },
  { key: 'main.cardBackground', group: 'Main', label: 'Main Card背景', colorName: 'Slate White', cssVariable: '--theme-main-card-background', defaultHex: '#F8FAFB' },
  { key: 'main.sectionHeader', group: 'Main', label: 'Main Section見出し背景', colorName: 'Executive Slate Header', cssVariable: '--theme-main-section-header', defaultHex: '#CDD9E2' },
  { key: 'main.border', group: 'Main', label: 'Main Border', colorName: 'Cool Steel Border', cssVariable: '--theme-main-border', defaultHex: '#BBC9D3' },
  { key: 'text.primary', group: 'Text', label: 'Text メイン文字', colorName: 'Executive Ink', cssVariable: '--theme-text-primary', defaultHex: '#263B49' },
  { key: 'text.secondary', group: 'Text', label: 'Text 補助文字', colorName: 'Muted Slate', cssVariable: '--theme-text-secondary', defaultHex: '#5A6D79' },
  { key: 'action.primary', group: 'Action', label: 'Action Primary button', colorName: 'Executive Steel Blue', cssVariable: '--theme-action-primary', defaultHex: '#405F72' },
  { key: 'action.secondary', group: 'Action', label: 'Action Secondary button', colorName: 'Pale Slate Blue', cssVariable: '--theme-action-secondary', defaultHex: '#DCE5EB' },
  { key: 'state.success', group: 'State', label: 'State Success', colorName: 'Institutional Green', cssVariable: '--theme-state-success', defaultHex: '#1F7A52' },
  { key: 'state.warning', group: 'State', label: 'State Warning', colorName: 'Muted Amber', cssVariable: '--theme-state-warning', defaultHex: '#8B6515' },
  { key: 'state.error', group: 'State', label: 'State Error', colorName: 'Controlled Red', cssVariable: '--theme-state-error', defaultHex: '#B42630' }
]);

var KSP_THEME_DERIVED_RULES = Object.freeze([
  { key: 'main.surfaceSoft', sourceKey: 'main.cardBackground', cssVariable: '--theme-main-surface-soft', defaultHex: '#EEF3F6' },
  { key: 'main.sectionHeaderTop', sourceKey: 'main.sectionHeader', cssVariable: '--theme-main-section-header-top', defaultHex: '#D7E1E8' },
  { key: 'main.sectionHeaderStrong', sourceKey: 'main.sectionHeader', cssVariable: '--theme-main-section-header-strong', defaultHex: '#BECDD8' },
  { key: 'main.borderStrong', sourceKey: 'main.border', cssVariable: '--theme-main-border-strong', defaultHex: '#A3B5C1' },
  { key: 'text.inkSoft', sourceKey: 'text.primary', cssVariable: '--theme-text-ink-soft', defaultHex: '#4A6170' },
  { key: 'action.primaryDark', sourceKey: 'action.primary', cssVariable: '--theme-action-primary-dark', defaultHex: '#2F4B5D' },
  { key: 'action.primaryTop', sourceKey: 'action.primary', cssVariable: '--theme-action-primary-top', defaultHex: '#526F81' },
  { key: 'action.primaryHover', sourceKey: 'action.primary', cssVariable: '--theme-action-primary-hover', defaultHex: '#607D8D' },
  { key: 'focus.ring', sourceKey: 'action.primary', cssVariable: '--theme-focus-ring', defaultHex: '#6C8798' },
  { key: 'action.primarySoft', sourceKey: 'action.secondary', cssVariable: '--theme-action-primary-soft', defaultHex: '#DCE6EC' },
  { key: 'state.successSoft', sourceKey: 'state.success', cssVariable: '--theme-state-success-soft', defaultHex: '#E4F3EB' },
  { key: 'state.warningSoft', sourceKey: 'state.warning', cssVariable: '--theme-state-warning-soft', defaultHex: '#F8F0D8' },
  { key: 'state.errorSoft', sourceKey: 'state.error', cssVariable: '--theme-state-error-soft', defaultHex: '#F9E8EA' },
  { key: 'sidebar.goldHighlight', sourceKey: 'sidebar.gold', cssVariable: '--theme-sidebar-gold-highlight', defaultHex: '#FFE89A' },
  { key: 'sidebar.goldMid', sourceKey: 'sidebar.gold', cssVariable: '--theme-sidebar-gold-mid', defaultHex: '#C58C25' },
  { key: 'sidebar.goldDeep', sourceKey: 'sidebar.gold', cssVariable: '--theme-sidebar-gold-deep', defaultHex: '#70480D' },
  { key: 'sidebar.goldBrandTop', sourceKey: 'sidebar.gold', cssVariable: '--theme-sidebar-gold-brand-top', defaultHex: '#FFF4BF' },
  { key: 'sidebar.goldBrandMiddle', sourceKey: 'sidebar.gold', cssVariable: '--theme-sidebar-gold-brand-middle', defaultHex: '#EBCB67' },
  { key: 'sidebar.goldBrandBottom', sourceKey: 'sidebar.gold', cssVariable: '--theme-sidebar-gold-brand-bottom', defaultHex: '#A66E18' },
  { key: 'sidebar.goldNavIcon', sourceKey: 'sidebar.gold', cssVariable: '--theme-sidebar-gold-nav-icon', defaultHex: '#F0CF69' },
  { key: 'sidebar.goldNavHover', sourceKey: 'sidebar.gold', cssVariable: '--theme-sidebar-gold-nav-hover', defaultHex: '#FFE999' },
  { key: 'sidebar.goldTextMuted', sourceKey: 'sidebar.gold', cssVariable: '--theme-sidebar-gold-text-muted', defaultHex: '#D8BD7B' },
  { key: 'sidebar.goldTextHover', sourceKey: 'sidebar.gold', cssVariable: '--theme-sidebar-gold-text-hover', defaultHex: '#FFF2C3' },
  { key: 'sidebar.activeDeep', sourceKey: 'sidebar.activeBackground', cssVariable: '--theme-sidebar-active-deep', defaultHex: '#751017' }
]);

function kspThemeDefaultPalette_() {
  var output = {};
  KSP_THEME_TOKEN_DEFINITIONS.forEach(function (definition) {
    output[definition.key] = definition.defaultHex;
  });
  return output;
}

function kspThemeNormalizeHex_(value) {
  var normalized = String(value === undefined || value === null ? '' : value).trim().toUpperCase();
  kspAssert_(/^#[0-9A-F]{6}$/.test(normalized), 'THEME_HEX_INVALID', '色は#RRGGBB形式で入力してください。');
  return normalized;
}

function kspThemeNormalizePalette_(palette) {
  kspAssert_(palette && typeof palette === 'object' && !Array.isArray(palette),
    'THEME_PALETTE_INVALID', 'テーマ設定を確認できませんでした。');
  var expectedKeys = KSP_THEME_TOKEN_DEFINITIONS.map(function (definition) { return definition.key; });
  var actualKeys = Object.keys(palette);
  kspAssert_(actualKeys.length === expectedKeys.length && actualKeys.every(function (key) {
    return expectedKeys.indexOf(key) !== -1;
  }), 'THEME_PALETTE_INVALID', 'テーマ設定は基本16色をすべて指定してください。');
  var normalized = {};
  expectedKeys.forEach(function (key) { normalized[key] = kspThemeNormalizeHex_(palette[key]); });
  return normalized;
}

function kspThemeHexChannels_(hex) {
  var normalized = kspThemeNormalizeHex_(hex);
  return [parseInt(normalized.slice(1, 3), 16), parseInt(normalized.slice(3, 5), 16), parseInt(normalized.slice(5, 7), 16)];
}

function kspThemeChannelsHex_(channels) {
  return '#' + channels.map(function (channel) {
    var bounded = Math.max(0, Math.min(255, Math.round(Number(channel) || 0)));
    return ('0' + bounded.toString(16).toUpperCase()).slice(-2);
  }).join('');
}

function kspThemeDerivedHex_(sourceHex, sourceDefaultHex, targetDefaultHex) {
  var source = kspThemeHexChannels_(sourceHex);
  var sourceDefault = kspThemeHexChannels_(sourceDefaultHex);
  var targetDefault = kspThemeHexChannels_(targetDefaultHex);
  return kspThemeChannelsHex_(source.map(function (channel, index) {
    return channel + targetDefault[index] - sourceDefault[index];
  }));
}

function kspThemeCssVariables_(palette) {
  var normalized = kspThemeNormalizePalette_(palette);
  var defaults = kspThemeDefaultPalette_();
  var output = {};
  KSP_THEME_TOKEN_DEFINITIONS.forEach(function (definition) {
    output[definition.cssVariable] = normalized[definition.key];
  });
  KSP_THEME_DERIVED_RULES.forEach(function (rule) {
    output[rule.cssVariable] = kspThemeDerivedHex_(
      normalized[rule.sourceKey], defaults[rule.sourceKey], rule.defaultHex);
  });
  return output;
}

function kspThemeStoredUpdatedAt_(value) {
  var text = String(value || '');
  kspAssert_(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(text) && !isNaN(Date.parse(text)),
    'THEME_SETTINGS_INVALID', '保存済みテーマ設定を確認できませんでした。');
  return text;
}

function kspThemeParseStoredSettings_(raw) {
  var defaults = kspThemeDefaultPalette_();
  if (!raw) return { palette: defaults, persisted: false, updatedAt: '', corruptOverrideIgnored: false };
  try {
    var parsed = JSON.parse(String(raw));
    kspAssert_(parsed && typeof parsed === 'object' && !Array.isArray(parsed),
      'THEME_SETTINGS_INVALID', '保存済みテーマ設定を確認できませんでした。');
    var keys = Object.keys(parsed);
    kspAssert_(keys.length === 3 && ['schemaVersion', 'palette', 'updatedAt'].every(function (key) {
      return keys.indexOf(key) !== -1;
    }), 'THEME_SETTINGS_INVALID', '保存済みテーマ設定を確認できませんでした。');
    kspAssert_(Number(parsed.schemaVersion) === KSP_THEME_SETTINGS_SCHEMA_VERSION,
      'THEME_SETTINGS_INVALID', '保存済みテーマ設定を確認できませんでした。');
    return {
      palette: kspThemeNormalizePalette_(parsed.palette),
      persisted: true,
      updatedAt: kspThemeStoredUpdatedAt_(parsed.updatedAt),
      corruptOverrideIgnored: false
    };
  } catch (ignored) {
    return { palette: defaults, persisted: false, updatedAt: '', corruptOverrideIgnored: true };
  }
}

function kspThemeReadState_(environment) {
  kspAssert_(environment && typeof environment.readThemeSettings === 'function',
    'THEME_STORAGE_UNAVAILABLE', 'テーマ設定を読み込めませんでした。');
  return kspThemeParseStoredSettings_(environment.readThemeSettings());
}

function kspThemeSafeDefinitions_() {
  return KSP_THEME_TOKEN_DEFINITIONS.map(function (definition) {
    return {
      key: definition.key,
      group: definition.group,
      label: definition.label,
      colorName: definition.colorName,
      cssVariable: definition.cssVariable,
      defaultHex: definition.defaultHex
    };
  });
}

function kspThemeSafeDerivedRules_() {
  var defaults = kspThemeDefaultPalette_();
  return KSP_THEME_DERIVED_RULES.map(function (rule) {
    return {
      sourceKey: rule.sourceKey,
      sourceDefaultHex: defaults[rule.sourceKey],
      cssVariable: rule.cssVariable,
      defaultHex: rule.defaultHex
    };
  });
}

function kspThemeStateResponse_(state) {
  return {
    ok: true,
    workId: '0045',
    schemaVersion: KSP_THEME_SETTINGS_SCHEMA_VERSION,
    palette: kspDeepClone_(state.palette),
    defaults: kspThemeDefaultPalette_(),
    persisted: Boolean(state.persisted),
    updatedAt: String(state.updatedAt || ''),
    corruptOverrideIgnored: Boolean(state.corruptOverrideIgnored),
    definitions: kspThemeSafeDefinitions_(),
    derivedRules: kspThemeSafeDerivedRules_()
  };
}

function kspGetThemeSettingsData_(environment) {
  try {
    return kspThemeStateResponse_(kspThemeReadState_(environment));
  } catch (ignored) {
    return {
      ok: false,
      workId: '0045',
      error: { code: 'THEME_STORAGE_UNAVAILABLE', message: 'テーマ設定を読み込めませんでした。' }
    };
  }
}

function kspThemeMutationFailure_(error) {
  var code = kspGetErrorCode_(error, 'THEME_SETTINGS_UPDATE_FAILED');
  var message = code === 'THEME_HEX_INVALID' ? '色は#RRGGBB形式で入力してください。'
    : code === 'THEME_PALETTE_INVALID' ? 'テーマ設定は基本16色をすべて指定してください。'
      : code === 'THEME_ACTION_INVALID' ? 'テーマ設定の操作が不正です。'
        : 'テーマ設定を更新できませんでした。';
  return { ok: false, workId: '0045', error: { code: code, message: message } };
}

function kspMutateThemeSettings_(environment, input) {
  var action = String(input && input.action || '').trim().toUpperCase();
  try {
    kspAssert_(action === 'SAVE' || action === 'RESET', 'THEME_ACTION_INVALID', 'Theme action is invalid.');
    kspAssert_(environment && typeof environment.withThemeSettingsLock === 'function',
      'THEME_STORAGE_UNAVAILABLE', 'Theme settings lock is unavailable.');
    return environment.withThemeSettingsLock(function () {
      if (action === 'RESET') {
        environment.deleteThemeSettings();
        return kspThemeStateResponse_(kspThemeReadState_(environment));
      }
      var palette = kspThemeNormalizePalette_(input && input.palette);
      var stored = {
        schemaVersion: KSP_THEME_SETTINGS_SCHEMA_VERSION,
        palette: palette,
        updatedAt: String(environment.nowIso())
      };
      kspThemeStoredUpdatedAt_(stored.updatedAt);
      environment.writeThemeSettings(JSON.stringify(stored));
      return kspThemeStateResponse_(kspThemeReadState_(environment));
    });
  } catch (error) {
    return kspThemeMutationFailure_(error);
  }
}

function kspCreateThemeSettingsEnvironment_() {
  var properties = PropertiesService.getScriptProperties();
  return {
    readThemeSettings: function () {
      return properties.getProperty(KSP_THEME_SETTINGS_PROPERTY_KEY) || '';
    },
    writeThemeSettings: function (value) {
      properties.setProperty(KSP_THEME_SETTINGS_PROPERTY_KEY, String(value));
    },
    deleteThemeSettings: function () {
      properties.deleteProperty(KSP_THEME_SETTINGS_PROPERTY_KEY);
    },
    withThemeSettingsLock: function (callback) {
      var lock = LockService.getScriptLock();
      lock.waitLock(KSP_DEFAULTS.LOCK_TIMEOUT_MS);
      try { return callback(); }
      finally { lock.releaseLock(); }
    },
    nowIso: function () { return new Date().toISOString(); }
  };
}

function kspThemeCssDeclarations_(palette) {
  var variables = kspThemeCssVariables_(palette);
  return Object.keys(variables).map(function (name) { return name + ':' + variables[name]; }).join(';');
}

function kspThemeBootstrapJson_(state) {
  return JSON.stringify(kspThemeStateResponse_(state))
    .replace(/</g, '\\u003C').replace(/>/g, '\\u003E').replace(/&/g, '\\u0026')
    .replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');
}

function kspGetThemeHeadMarkup_() {
  var state;
  try { state = kspThemeReadState_(kspCreateThemeSettingsEnvironment_()); }
  catch (ignored) { state = kspThemeParseStoredSettings_(''); }
  return '<style id="ksp-initial-theme">:root{' + kspThemeCssDeclarations_(state.palette) + '}</style>' +
    '<script id="ksp-theme-bootstrap" type="application/json">' + kspThemeBootstrapJson_(state) + '</script>';
}
// ===== END src/166_ThemeSettings.gs =====

// ===== BEGIN src/170_AiEntryPoints.gs =====
function runAiSyncWorker_() {
  return kspRunProviderNeutralAiSync_(kspCreateProviderNeutralAiEnvironment_());
}

function getKnowledgeSearchBootstrapData() {
  return kspGetProviderNeutralKnowledgeBootstrap_(kspCreateProviderNeutralAiEnvironment_());
}

function searchKnowledge(input) {
  var payload = input || {};
  var route = String(payload.route || payload.provider || KSP_AI_ROUTES.OPENAI).toUpperCase();
  if (route === KSP_AI_ROUTES.FULL_EXPORT) {
    return { ok: false, workId: '0020', error: { code: 'AI_ROUTE_FULL_EXPORT_USE_PREVIEW', message: '全文出力は書き出し欄から実行してください。' } };
  }
  return kspRunProviderKnowledgeSearch_(kspCreateProviderNeutralAiEnvironment_(), route, payload);
}

function getAiProviderAdminData(input) {
  return kspGetAiProviderAdminData_(kspCreateProviderNeutralAiEnvironment_(), input || {});
}

function mutateAiProviderSettings(input) {
  return kspMutateAiProviderSettings_(kspCreateProviderNeutralAiEnvironment_(), input || {});
}

function getAiModelSetupCandidates(input) {
  return kspListAiModelSetupCandidates_(kspCreateProviderNeutralAiEnvironment_(), input || {}, false);
}

function getAiCredentialModelCandidates(input) {
  return kspListAiModelSetupCandidates_(kspCreateProviderNeutralAiEnvironment_(), input || {}, true);
}

function saveAiModelSetup(input) {
  return kspSaveAiModelSetup_(kspCreateProviderNeutralAiEnvironment_(), input || {}, false);
}

function saveAiCredentialSetup(input) {
  return kspSaveAiModelSetup_(kspCreateProviderNeutralAiEnvironment_(), input || {}, true);
}

function getAiModelSetupOperation(input) {
  return kspGetAiModelSetupOperation_(kspCreateProviderNeutralAiEnvironment_(), input || {});
}

function removeAiCredential(input) {
  return kspRemoveAiCredential_(kspCreateProviderNeutralAiEnvironment_(), input || {});
}

function startAiProvider(input) {
  return kspStartAiProvider_(kspCreateProviderNeutralAiEnvironment_(), input || {});
}

function getAiSyncCandidates(input) {
  return kspGetAiSyncCandidates_(kspCreateProviderNeutralAiEnvironment_(), input || {});
}

function resetAiProviderDerivedState(input) {
  return kspResetAiProviderDerivedState_(kspCreateProviderNeutralAiEnvironment_(), input || {});
}

function getThemeSettingsData() {
  return kspGetThemeSettingsData_(kspCreateThemeSettingsEnvironment_());
}

function mutateThemeSettings(input) {
  return kspMutateThemeSettings_(kspCreateThemeSettingsEnvironment_(), input || {});
}

function askKnowledgeQuestion_(input) {
  var payload = kspDeepClone_(input || {});
  payload.mode = KSP_FEATURE_FREEZE_SEARCH_MODES.FREE_QUESTION;
  return kspRunProviderKnowledgeSearch_(kspCreateProviderNeutralAiEnvironment_(), KSP_AI_ROUTES.OPENAI, payload);
}

function getFeatureFreezeDiagnostics_() {
  return kspGetFeatureFreezeDiagnostics_(kspCreateFeatureFreezeAiEnvironment_());
}
// ===== END src/170_AiEntryPoints.gs =====

// ===== BEGIN src/180_FeatureFreezeFormats.gs =====
var KSP_FEATURE_FREEZE_WORK_ID = '0009';
var KSP_FEATURE_FREEZE_APP_VERSION = '0.5.0';

var KSP_FEATURE_FREEZE_DEFAULTS = Object.freeze({
  MAX_SOURCE_BYTES: 25 * 1024 * 1024,
  MAX_EML_DEPTH: 8,
  MAX_EML_PARTS: 100,
  MAX_EML_OUTPUT_CHARS: 2 * 1024 * 1024,
  MAX_XLSX_PARTS: 1000,
  MAX_XLSX_OUTPUT_CHARS: 2 * 1024 * 1024
});

var KSP_AI_READ_STRATEGIES = Object.freeze({
  MEETING_TEXT: 'MEETING_TEXT',
  DIRECT_BINARY: 'DIRECT_BINARY',
  TEXT: 'TEXT',
  XLSX_NORMALIZED_TEXT: 'XLSX_NORMALIZED_TEXT',
  EML_NORMALIZED_TEXT: 'EML_NORMALIZED_TEXT'
});

var KSP_AI_FORMAT_REGISTRY = Object.freeze({
  pdf: Object.freeze({
    extension: 'pdf',
    acceptedMimeTypes: Object.freeze(['application/pdf', 'application/octet-stream']),
    uploadMimeType: 'application/pdf',
    readStrategy: KSP_AI_READ_STRATEGIES.DIRECT_BINARY
  }),
  pptx: Object.freeze({
    extension: 'pptx',
    acceptedMimeTypes: Object.freeze([
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'application/octet-stream'
    ]),
    uploadMimeType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    readStrategy: KSP_AI_READ_STRATEGIES.DIRECT_BINARY
  }),
  xlsx: Object.freeze({
    extension: 'xlsx',
    acceptedMimeTypes: Object.freeze([
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/octet-stream'
    ]),
    uploadMimeType: 'text/plain',
    readStrategy: KSP_AI_READ_STRATEGIES.XLSX_NORMALIZED_TEXT
  }),
  docx: Object.freeze({
    extension: 'docx',
    acceptedMimeTypes: Object.freeze([
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/octet-stream'
    ]),
    uploadMimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    readStrategy: KSP_AI_READ_STRATEGIES.DIRECT_BINARY
  }),
  txt: Object.freeze({
    extension: 'txt',
    acceptedMimeTypes: Object.freeze(['text/plain', 'application/octet-stream']),
    uploadMimeType: 'text/plain',
    readStrategy: KSP_AI_READ_STRATEGIES.TEXT
  }),
  eml: Object.freeze({
    extension: 'eml',
    acceptedMimeTypes: Object.freeze(['message/rfc822', 'application/octet-stream', 'text/plain']),
    uploadMimeType: 'text/plain',
    readStrategy: KSP_AI_READ_STRATEGIES.EML_NORMALIZED_TEXT
  })
});

function kspGetAiFormatExtensions_() {
  return Object.keys(KSP_AI_FORMAT_REGISTRY);
}

function kspGetAiFormatDefinition_(extension) {
  var normalized = kspAiTrim_(extension).toLowerCase();
  var definition = KSP_AI_FORMAT_REGISTRY[normalized] || null;
  if (!definition) {
    var error = new Error('AI indexing does not support this source extension: ' + normalized);
    error.code = 'AI_FORMAT_UNSUPPORTED';
    error.retryable = false;
    error.permanent = true;
    throw error;
  }
  return definition;
}

function kspNormalizeAiMimeType_(value) {
  return kspAiTrim_(value).toLowerCase().split(';')[0].trim();
}

function kspValidateAiSourceDescriptor_(extension, mimeType, byteLength) {
  var definition = kspGetAiFormatDefinition_(extension);
  var normalizedMime = kspNormalizeAiMimeType_(mimeType) || 'application/octet-stream';
  kspAssert_(definition.acceptedMimeTypes.indexOf(normalizedMime) !== -1,
    'AI_SOURCE_MIME_MISMATCH',
    'Source MIME type does not match .' + definition.extension + ': ' + normalizedMime);
  var length = Number(byteLength);
  kspAssert_(Number.isFinite(length) && length > 0 && Math.floor(length) === length,
    'AI_SOURCE_SIZE_INVALID', 'AI source size must be a positive integer.');
  kspAssert_(length <= KSP_FEATURE_FREEZE_DEFAULTS.MAX_SOURCE_BYTES,
    'AI_SOURCE_TOO_LARGE', 'AI source exceeds the 25MB product limit.');
  return definition;
}

function kspNormalizeAiByteArray_(bytes) {
  var values = bytes || [];
  kspAssert_(Array.isArray(values) || typeof values.length === 'number',
    'AI_SOURCE_BYTES_INVALID', 'AI source bytes are invalid.');
  return Array.prototype.map.call(values, function (value) {
    var numberValue = Number(value);
    if (numberValue < 0) numberValue += 256;
    kspAssert_(Number.isFinite(numberValue) && numberValue >= 0 && numberValue <= 255,
      'AI_SOURCE_BYTES_INVALID', 'AI source contains an invalid byte.');
    return Math.floor(numberValue);
  });
}

function kspAiHashBytesFallback_(bytes) {
  var normalized = kspNormalizeAiByteArray_(bytes);
  var hash = 2166136261;
  normalized.forEach(function (value) {
    hash ^= value;
    hash = Math.imul(hash, 16777619);
  });
  return ('00000000' + (hash >>> 0).toString(16)).slice(-8);
}

function kspAiSourcePayloadBytes_(source) {
  if (source && source.payloadKind === 'binary') return kspNormalizeAiByteArray_(source.bytes || []);
  var text = String(source && source.text !== undefined ? source.text : '');
  if (typeof Utilities !== 'undefined' && Utilities.newBlob) {
    return kspNormalizeAiByteArray_(Utilities.newBlob(text, source.mimeType || 'text/plain').getBytes());
  }
  var bytes = [];
  for (var index = 0; index < text.length; index += 1) {
    var codePoint = text.charCodeAt(index);
    if (codePoint < 128) bytes.push(codePoint);
    else if (codePoint < 2048) {
      bytes.push(192 | (codePoint >> 6), 128 | (codePoint & 63));
    } else {
      bytes.push(224 | (codePoint >> 12), 128 | ((codePoint >> 6) & 63), 128 | (codePoint & 63));
    }
  }
  return bytes;
}

function kspXlsxDecodeXmlEntities_(value) {
  var named = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'" };
  return String(value || '').replace(/&(#x[0-9a-f]+|#\d+|amp|lt|gt|quot|apos);/gi, function (_, entity) {
    var lower = entity.toLowerCase();
    if (named[lower] !== undefined) return named[lower];
    if (lower.indexOf('#x') === 0) return String.fromCharCode(parseInt(lower.slice(2), 16));
    return String.fromCharCode(parseInt(lower.slice(1), 10));
  });
}

function kspXlsxXmlAttribute_(attributes, name) {
  var escaped = String(name || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  var match = new RegExp('(?:^|\\s)' + escaped + '=(?:"([^"]*)"|\'([^\']*)\')', 'i').exec(String(attributes || ''));
  return match ? kspXlsxDecodeXmlEntities_(match[1] !== undefined ? match[1] : match[2]) : '';
}

function kspXlsxTextNodes_(xml) {
  var values = [];
  String(xml || '').replace(/<t\b[^>]*>([\s\S]*?)<\/t>/gi, function (_, text) {
    values.push(kspXlsxDecodeXmlEntities_(text));
    return _;
  });
  return values.join('');
}

function kspXlsxNormalizePartPath_(target) {
  var value = String(target || '').replace(/\\/g, '/').replace(/^\/+/, '');
  kspAssert_(value && value.split('/').indexOf('..') === -1,
    'AI_XLSX_RELATIONSHIP_INVALID', 'XLSX contains an invalid worksheet relationship.');
  return value.indexOf('xl/') === 0 ? value : 'xl/' + value;
}

function kspNormalizeXlsxEntries_(entries) {
  var parts = {};
  var list = entries || [];
  kspAssert_(list.length > 0 && list.length <= KSP_FEATURE_FREEZE_DEFAULTS.MAX_XLSX_PARTS,
    'AI_XLSX_PARTS_INVALID', 'XLSX contains an invalid number of package parts.');
  list.forEach(function (entry) {
    var name = String(entry && entry.name || '').replace(/\\/g, '/').replace(/^\/+/, '');
    if (!name || /\/$/.test(name)) return;
    kspAssert_(name.split('/').indexOf('..') === -1, 'AI_XLSX_PART_INVALID', 'XLSX contains an invalid package path.');
    kspAssert_(parts[name] === undefined, 'AI_XLSX_PART_CONFLICT', 'XLSX contains duplicate package parts.');
    parts[name] = String(entry.text === undefined ? '' : entry.text);
  });

  var workbookXml = parts['xl/workbook.xml'];
  var relationshipsXml = parts['xl/_rels/workbook.xml.rels'];
  kspAssert_(workbookXml && relationshipsXml, 'AI_XLSX_WORKBOOK_MISSING', 'XLSX workbook metadata is missing.');

  var worksheetPaths = {};
  String(relationshipsXml).replace(/<Relationship\b([^>]*)\/?\s*>/gi, function (_, attributes) {
    var type = kspXlsxXmlAttribute_(attributes, 'Type');
    if (!/\/worksheet$/i.test(type)) return _;
    var relationshipId = kspXlsxXmlAttribute_(attributes, 'Id');
    var target = kspXlsxXmlAttribute_(attributes, 'Target');
    if (relationshipId && target) worksheetPaths[relationshipId] = kspXlsxNormalizePartPath_(target);
    return _;
  });

  var sharedStrings = [];
  String(parts['xl/sharedStrings.xml'] || '').replace(/<si\b[^>]*>([\s\S]*?)<\/si>/gi, function (_, itemXml) {
    sharedStrings.push(kspXlsxTextNodes_(itemXml));
    return _;
  });

  var output = [];
  String(workbookXml).replace(/<sheet\b([^>]*)\/?\s*>/gi, function (_, attributes) {
    var sheetName = kspXlsxXmlAttribute_(attributes, 'name');
    var relationshipId = kspXlsxXmlAttribute_(attributes, 'r:id');
    var worksheetPath = worksheetPaths[relationshipId];
    kspAssert_(worksheetPath && parts[worksheetPath] !== undefined,
      'AI_XLSX_WORKSHEET_MISSING', 'XLSX worksheet data is missing.');
    var rows = [];
    String(parts[worksheetPath]).replace(/<c\b([^>]*)>([\s\S]*?)<\/c>/gi, function (cellXml, cellAttributes, body) {
      var reference = kspXlsxXmlAttribute_(cellAttributes, 'r');
      var type = kspXlsxXmlAttribute_(cellAttributes, 't').toLowerCase();
      var value = '';
      if (type === 'inlinestr') value = kspXlsxTextNodes_(body);
      else {
        var valueMatch = /<v\b[^>]*>([\s\S]*?)<\/v>/i.exec(body);
        var rawValue = valueMatch ? kspXlsxDecodeXmlEntities_(valueMatch[1]) : '';
        if (type === 's') {
          var sharedIndex = Number(rawValue);
          kspAssert_(Number.isInteger(sharedIndex) && sharedIndex >= 0 && sharedIndex < sharedStrings.length,
            'AI_XLSX_SHARED_STRING_INVALID', 'XLSX contains an invalid shared string reference.');
          value = sharedStrings[sharedIndex];
        } else if (type === 'b') value = rawValue === '1' ? 'TRUE' : 'FALSE';
        else value = rawValue;
      }
      value = String(value || '').replace(/[\t\r\n]+/g, ' ').trim();
      if (value) rows.push((reference || 'CELL') + '\t' + value);
      return cellXml;
    });
    if (rows.length) output.push(['Sheet: ' + (sheetName || relationshipId), rows.join('\n')].join('\n'));
    return _;
  });

  var normalized = output.join('\n\n').trim();
  kspAssert_(normalized, 'AI_XLSX_CONTENT_EMPTY', 'XLSX contains no indexable cell values.');
  kspAssert_(normalized.length <= KSP_FEATURE_FREEZE_DEFAULTS.MAX_XLSX_OUTPUT_CHARS,
    'AI_XLSX_OUTPUT_TOO_LARGE', 'Normalized XLSX text is too large.');
  return normalized;
}

function kspNormalizeXlsxText_(bytes) {
  kspAssert_(typeof Utilities !== 'undefined' && Utilities.newBlob && Utilities.unzip,
    'AI_XLSX_NORMALIZER_UNAVAILABLE', 'XLSX normalization is unavailable.');
  var entries;
  try {
    var signedBytes = kspNormalizeAiByteArray_(bytes).map(function (value) { return value > 127 ? value - 256 : value; });
    var blobs = Utilities.unzip(Utilities.newBlob(signedBytes, 'application/zip', 'source.zip')) || [];
    kspAssert_(blobs.length > 0 && blobs.length <= KSP_FEATURE_FREEZE_DEFAULTS.MAX_XLSX_PARTS,
      'AI_XLSX_PARTS_INVALID', 'XLSX contains an invalid number of package parts.');
    entries = blobs.filter(function (blob) {
      var name = String(blob.getName() || '').replace(/\\/g, '/').replace(/^\/+/, '');
      return name === 'xl/workbook.xml' || name === 'xl/_rels/workbook.xml.rels' ||
        name === 'xl/sharedStrings.xml' || /^xl\/worksheets\/[^/]+\.xml$/i.test(name);
    }).map(function (blob) {
      return { name: blob.getName(), text: blob.getDataAsString('UTF-8') };
    });
  } catch (error) {
    if (error && /^AI_XLSX_/.test(String(error.code || ''))) throw error;
    var malformed = new Error('XLSX package could not be read.');
    malformed.code = 'AI_XLSX_MALFORMED';
    malformed.retryable = false;
    malformed.permanent = true;
    throw malformed;
  }
  return kspNormalizeXlsxEntries_(entries);
}

function kspEmlNormalizeLineEndings_(value) {
  return String(value === null || value === undefined ? '' : value).replace(/\r\n?/g, '\n');
}

function kspEmlSplitHeaderBody_(raw) {
  var normalized = kspEmlNormalizeLineEndings_(raw);
  var separator = normalized.indexOf('\n\n');
  kspAssert_(separator >= 0, 'AI_EML_MALFORMED', 'EML has no header/body separator.');
  return { headerText: normalized.slice(0, separator), bodyText: normalized.slice(separator + 2) };
}

function kspEmlParseHeaders_(headerText) {
  var unfolded = kspEmlNormalizeLineEndings_(headerText).replace(/\n[ \t]+/g, ' ');
  var headers = {};
  unfolded.split('\n').forEach(function (line) {
    if (!line) return;
    var colon = line.indexOf(':');
    if (colon <= 0) return;
    var key = line.slice(0, colon).trim().toLowerCase();
    var value = line.slice(colon + 1).trim();
    if (!headers[key]) headers[key] = [];
    headers[key].push(value);
  });
  return headers;
}

function kspEmlHeader_(headers, name) {
  var values = headers && headers[String(name).toLowerCase()] ? headers[String(name).toLowerCase()] : [];
  return values.length ? values.join(', ') : '';
}

function kspEmlParseHeaderParameters_(value) {
  var source = String(value || '');
  var pieces = source.split(';');
  var output = { value: pieces.shift().trim().toLowerCase(), parameters: {} };
  pieces.forEach(function (piece) {
    var match = /^\s*([^=]+)=\s*(?:"([^"]*)"|([^;]*))\s*$/.exec(piece);
    if (!match) return;
    output.parameters[String(match[1]).trim().toLowerCase()] = String(match[2] !== undefined ? match[2] : match[3]).trim();
  });
  return output;
}

function kspEmlDecodeBase64Bytes_(value) {
  var alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  var source = String(value || '').replace(/\s+/g, '').replace(/=+$/g, '');
  var bits = 0;
  var bitCount = 0;
  var output = [];
  for (var index = 0; index < source.length; index += 1) {
    var digit = alphabet.indexOf(source.charAt(index));
    kspAssert_(digit >= 0, 'AI_EML_BASE64_INVALID', 'EML contains invalid base64 data.');
    bits = (bits << 6) | digit;
    bitCount += 6;
    if (bitCount >= 8) {
      bitCount -= 8;
      output.push((bits >> bitCount) & 255);
      bits &= (1 << bitCount) - 1;
    }
  }
  return output;
}

function kspEmlDecodeQuotedPrintableBytes_(value, headerMode) {
  var source = String(value || '');
  if (headerMode) source = source.replace(/_/g, ' ');
  source = source.replace(/=\r?\n/g, '');
  var output = [];
  for (var index = 0; index < source.length; index += 1) {
    if (source.charAt(index) === '=' && /^[0-9A-Fa-f]{2}$/.test(source.slice(index + 1, index + 3))) {
      output.push(parseInt(source.slice(index + 1, index + 3), 16));
      index += 2;
      continue;
    }
    var code = source.charCodeAt(index);
    if (code <= 255) output.push(code);
    else {
      var utf8 = kspAiSourcePayloadBytes_({ payloadKind: 'text', text: source.charAt(index), mimeType: 'text/plain' });
      output = output.concat(utf8);
    }
  }
  return output;
}

function kspEmlWindows1252Character_(value) {
  var map = {
    128: '€', 130: '‚', 131: 'ƒ', 132: '„', 133: '…', 134: '†', 135: '‡', 136: 'ˆ',
    137: '‰', 138: 'Š', 139: '‹', 140: 'Œ', 142: 'Ž', 145: '‘', 146: '’', 147: '“',
    148: '”', 149: '•', 150: '–', 151: '—', 152: '˜', 153: '™', 154: 'š', 155: '›',
    156: 'œ', 158: 'ž', 159: 'Ÿ'
  };
  return map[value] || String.fromCharCode(value);
}

function kspEmlDecodeUtf8_(bytes) {
  var values = kspNormalizeAiByteArray_(bytes);
  var output = '';
  for (var index = 0; index < values.length;) {
    var first = values[index++];
    if (first < 128) { output += String.fromCharCode(first); continue; }
    var needed = first >= 240 ? 3 : first >= 224 ? 2 : 1;
    var codePoint = first & (needed === 3 ? 7 : needed === 2 ? 15 : 31);
    var valid = true;
    for (var offset = 0; offset < needed; offset += 1) {
      var next = values[index++];
      if (next === undefined || (next & 192) !== 128) { valid = false; break; }
      codePoint = (codePoint << 6) | (next & 63);
    }
    if (!valid) { output += '\uFFFD'; continue; }
    if (codePoint <= 65535) output += String.fromCharCode(codePoint);
    else {
      codePoint -= 65536;
      output += String.fromCharCode(55296 + (codePoint >> 10), 56320 + (codePoint & 1023));
    }
  }
  return output;
}

function kspEmlDecodeBytes_(bytes, charset) {
  var normalizedCharset = kspAiTrim_(charset || 'utf-8').toLowerCase().replace(/["']/g, '');
  if (typeof Utilities !== 'undefined' && Utilities.newBlob) {
    try { return Utilities.newBlob(kspNormalizeAiByteArray_(bytes)).getDataAsString(normalizedCharset || 'UTF-8'); }
    catch (ignored) { }
  }
  if (!normalizedCharset || normalizedCharset === 'utf-8' || normalizedCharset === 'utf8' || normalizedCharset === 'us-ascii' || normalizedCharset === 'ascii') {
    return kspEmlDecodeUtf8_(bytes);
  }
  if (normalizedCharset === 'iso-8859-1' || normalizedCharset === 'latin1' || normalizedCharset === 'windows-1252' || normalizedCharset === 'cp1252') {
    return kspNormalizeAiByteArray_(bytes).map(kspEmlWindows1252Character_).join('');
  }
  return kspEmlDecodeUtf8_(bytes);
}

function kspEmlDecodeRawHeaderUtf8_(value) {
  var source = String(value || '');
  if (!/[\u0080-\u00ff]/.test(source)) return source;
  var bytes = [];
  for (var index = 0; index < source.length; index += 1) {
    var code = source.charCodeAt(index);
    if (code > 255) return source;
    bytes.push(code);
  }
  var decoded = kspEmlDecodeUtf8_(bytes);
  return decoded.indexOf('\uFFFD') === -1 ? decoded : source;
}

function kspEmlDecodeEncodedWords_(value) {
  var decoded = String(value || '').replace(/=\?([^?]+)\?([bBqQ])\?([^?]*)\?=/g, function (_, charset, encoding, data) {
    var bytes = String(encoding).toUpperCase() === 'B'
      ? kspEmlDecodeBase64Bytes_(data)
      : kspEmlDecodeQuotedPrintableBytes_(data, true);
    return kspEmlDecodeBytes_(bytes, charset);
  });
  return kspEmlDecodeRawHeaderUtf8_(decoded).replace(/\s{2,}/g, ' ').trim();
}

function kspEmlDecodePartBody_(bodyText, transferEncoding, charset) {
  var encoding = kspAiTrim_(transferEncoding).toLowerCase();
  var bytes;
  if (encoding === 'base64') bytes = kspEmlDecodeBase64Bytes_(bodyText);
  else if (encoding === 'quoted-printable') bytes = kspEmlDecodeQuotedPrintableBytes_(bodyText, false);
  else bytes = kspAiSourcePayloadBytes_({ payloadKind: 'text', text: kspEmlNormalizeLineEndings_(bodyText), mimeType: 'text/plain' });
  return kspEmlDecodeBytes_(bytes, charset || 'utf-8');
}

function kspEmlSplitMultipart_(bodyText, boundary) {
  var marker = '--' + boundary;
  var closing = marker + '--';
  var parts = [];
  var current = [];
  var active = false;
  kspEmlNormalizeLineEndings_(bodyText).split('\n').forEach(function (line) {
    if (line === marker || line === closing) {
      if (active && current.length) parts.push(current.join('\n'));
      current = [];
      active = line !== closing;
      return;
    }
    if (active) current.push(line);
  });
  if (active && current.length) parts.push(current.join('\n'));
  return parts;
}

function kspEmlIsAttachment_(headers, contentType) {
  var disposition = kspEmlParseHeaderParameters_(kspEmlHeader_(headers, 'content-disposition'));
  if (disposition.value === 'attachment') return true;
  if (disposition.parameters.filename) return true;
  if (contentType.parameters.name) return true;
  return false;
}

function kspEmlCollectBodyCandidates_(rawPart, depth, state) {
  var traversal = state || { parts: 0 };
  traversal.parts += 1;
  kspAssert_(traversal.parts <= KSP_FEATURE_FREEZE_DEFAULTS.MAX_EML_PARTS, 'AI_EML_TOO_MANY_PARTS', 'EML contains too many MIME parts.');
  kspAssert_(depth <= KSP_FEATURE_FREEZE_DEFAULTS.MAX_EML_DEPTH, 'AI_EML_TOO_DEEP', 'EML multipart nesting is too deep.');
  var split = kspEmlSplitHeaderBody_(rawPart);
  var headers = kspEmlParseHeaders_(split.headerText);
  var contentType = kspEmlParseHeaderParameters_(kspEmlHeader_(headers, 'content-type') || 'text/plain; charset=utf-8');
  if (kspEmlIsAttachment_(headers, contentType)) return { plain: [], html: [] };
  if (contentType.value.indexOf('multipart/') === 0) {
    var boundary = contentType.parameters.boundary;
    kspAssert_(boundary, 'AI_EML_BOUNDARY_MISSING', 'Multipart EML has no boundary.');
    return kspEmlSplitMultipart_(split.bodyText, boundary).reduce(function (result, part) {
      var nested = kspEmlCollectBodyCandidates_(part, depth + 1, traversal);
      result.plain = result.plain.concat(nested.plain);
      result.html = result.html.concat(nested.html);
      return result;
    }, { plain: [], html: [] });
  }
  if (contentType.value !== 'text/plain' && contentType.value !== 'text/html') return { plain: [], html: [] };
  var decoded = kspEmlDecodePartBody_(split.bodyText, kspEmlHeader_(headers, 'content-transfer-encoding'), contentType.parameters.charset || 'utf-8').trim();
  if (!decoded) return { plain: [], html: [] };
  return contentType.value === 'text/plain' ? { plain: [decoded], html: [] } : { plain: [], html: [decoded] };
}

function kspEmlDecodeHtmlEntities_(value) {
  var named = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' };
  return String(value || '').replace(/&(#x[0-9a-f]+|#\d+|amp|lt|gt|quot|apos|nbsp);/gi, function (_, entity) {
    var lower = entity.toLowerCase();
    if (named[lower] !== undefined) return named[lower];
    if (lower.indexOf('#x') === 0) return String.fromCharCode(parseInt(lower.slice(2), 16));
    return String.fromCharCode(parseInt(lower.slice(1), 10));
  });
}

function kspEmlHtmlToText_(value) {
  return kspEmlDecodeHtmlEntities_(String(value || '')
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, ' ')
    .replace(/<(br|\/p|\/div|\/li|\/tr|h[1-6])\b[^>]*>/gi, '\n')
    .replace(/<[^>]+>/g, ' '))
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n[ \t]+/g, '\n')
    .replace(/[ \t]{2,}/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function kspNormalizeEmlText_(rawEml) {
  var normalized = kspEmlNormalizeLineEndings_(rawEml);
  var split = kspEmlSplitHeaderBody_(normalized);
  var headers = kspEmlParseHeaders_(split.headerText);
  var candidates = kspEmlCollectBodyCandidates_(normalized, 0, { parts: 0 });
  var body = candidates.plain.length ? candidates.plain.join('\n\n') : kspEmlHtmlToText_(candidates.html.join('\n\n'));
  var fields = [
    ['Subject', kspEmlDecodeEncodedWords_(kspEmlHeader_(headers, 'subject'))],
    ['From', kspEmlDecodeEncodedWords_(kspEmlHeader_(headers, 'from'))],
    ['To', kspEmlDecodeEncodedWords_(kspEmlHeader_(headers, 'to'))],
    ['Cc', kspEmlDecodeEncodedWords_(kspEmlHeader_(headers, 'cc'))],
    ['Date', kspEmlDecodeEncodedWords_(kspEmlHeader_(headers, 'date'))]
  ];
  var lines = [];
  fields.forEach(function (field) { if (field[1]) lines.push(field[0] + ': ' + field[1]); });
  kspAssert_(body, 'AI_EML_BODY_EMPTY', 'EML contains no indexable non-attachment body.');
  lines.push('', 'Body:', body);
  var output = lines.join('\n').replace(/\n{3,}/g, '\n\n').trim();
  kspAssert_(output.length <= KSP_FEATURE_FREEZE_DEFAULTS.MAX_EML_OUTPUT_CHARS,
    'AI_EML_OUTPUT_TOO_LARGE', 'Normalized EML text is too large.');
  return output;
}

function kspNormalizeEml_(rawEml) {
  return kspNormalizeEmlText_(rawEml);
}
// ===== END src/180_FeatureFreezeFormats.gs =====

// ===== BEGIN src/181_FeatureFreezeSync.gs =====
function kspBuildFeatureFreezePitchbookSource_(row, maps, payload, contentHash, formatDefinition) {
  kspAssert_(row && row.Document_ID, 'AI_PITCHBOOK_ROW_INVALID', 'Pitchbook row is invalid.');
  kspAssert_(row.File_ID, 'AI_PITCHBOOK_FILE_MISSING', 'Pitchbook source file is missing.');
  var definition = formatDefinition || kspGetAiFormatDefinition_(kspGetPitchbookExtensionForAi_(row));
  var counterpartyId = kspMeetingCounterpartyId_(row) || String(row.GP_ID || '');
  var counterpartyType = String((maps.counterpartyTypes || {})[counterpartyId] ||
    kspMeetingCounterpartyType_(row));
  var gpId = counterpartyType === 'GP' ? counterpartyId : '';
  var source = {
    sourceType: KSP_AI_SOURCE_TYPES.PITCHBOOK,
    sourceId: String(row.Document_ID),
    dateKey: kspCanonicalBusinessDate_(row.Date),
    gpId: gpId,
    gpName: gpId ? (maps.gps[gpId] || gpId) : '',
    entityKey: kspCounterpartyEntityKey_(counterpartyId),
    counterpartyType: counterpartyType,
    counterpartyId: counterpartyId,
    counterpartyName: maps.counterparties[counterpartyId] || counterpartyId,
    relatedGpIds: '',
    assetClassId: String(row.Asset_Class_ID || ''),
    assetClassName: maps.assetClasses[String(row.Asset_Class_ID || '')] || String(row.Asset_Class_ID || ''),
    capitalTypeId: String(row.Capital_Type_ID || ''),
    capitalTypeName: maps.capitalTypes[String(row.Capital_Type_ID || '')] || String(row.Capital_Type_ID || ''),
    fundStrategy: String(row.Fund_Strategy || ''),
    driveUrl: String(row.File_URL || ''),
    savedFilename: String(row.Saved_Filename || row.Original_Filename || row.Document_ID),
    mimeType: definition.uploadMimeType,
    contentHash: String(contentHash || ''),
    extension: definition.extension,
    readStrategy: definition.readStrategy
  };
  source.displayName = source.savedFilename;
  if (definition.readStrategy === KSP_AI_READ_STRATEGIES.EML_NORMALIZED_TEXT ||
      definition.readStrategy === KSP_AI_READ_STRATEGIES.XLSX_NORMALIZED_TEXT) {
    source.payloadKind = 'text';
    source.text = String(payload.text || '');
    source.bytes = null;
    source.byteLength = kspAiSourcePayloadBytes_(source).length;
    source.displayName = source.savedFilename.replace(/\.(eml|xlsx)$/i, '') + '.txt';
  } else {
    source.payloadKind = 'binary';
    source.text = '';
    source.bytes = kspNormalizeAiByteArray_(payload.bytes || []);
    source.byteLength = source.bytes.length;
  }
  return kspApplyPitchbookAiContext_(source, row, maps);
}

function kspFfIsAiWorkEligible_(item, nowIso, settings) {
  var row = item.row || {};
  var sourceStatus = String(row.Status || '');
  var aiStatus = String(row.AI_Index_Status || KSP_AI_INDEX_STATUS.NOT_INDEXED);
  if (sourceStatus === KSP_STATUS.INACTIVE) {
    return Boolean(row.AI_Document_Name) || aiStatus === KSP_AI_INDEX_STATUS.INDEXED || aiStatus === KSP_AI_INDEX_STATUS.FAILED;
  }
  if (sourceStatus !== KSP_STATUS.ACTIVE) return false;
  if (aiStatus === KSP_AI_INDEX_STATUS.PENDING || aiStatus === KSP_AI_INDEX_STATUS.NOT_INDEXED) return true;
  if (aiStatus === KSP_AI_INDEX_STATUS.INDEXED && !row.AI_Document_Name) return true;
  if (aiStatus !== KSP_AI_INDEX_STATUS.FAILED) return false;
  var lastError = kspParseAiLastError_(row.AI_Last_Error);
  if (lastError.permanent || !lastError.retryable || lastError.attempt >= settings.maxRetryAttempts) return false;
  return !lastError.nextAttemptAt ||
    kspTemporalInstantComparisonKey_(lastError.nextAttemptAt) <= kspTemporalInstantComparisonKey_(nowIso);
}

function kspFfSelectAiWorkItems_(meetingRows, pitchbookRows, nowIso, settings, newsRows, assessmentRows) {
  var items = [];
  (meetingRows || []).forEach(function (row) {
    var item = kspAiWorkItemFromRow_(KSP_AI_SOURCE_TYPES.MEETING, row);
    if (kspFfIsAiWorkEligible_(item, nowIso, settings)) items.push(item);
  });
  (pitchbookRows || []).forEach(function (row) {
    var item = kspAiWorkItemFromRow_(KSP_AI_SOURCE_TYPES.PITCHBOOK, row);
    item.retrievalEligible = kspIsParentBoundPitchbookEligible_(row, meetingRows);
    if (!item.retrievalEligible && String(row.Status) === KSP_STATUS.ACTIVE) {
      if (row.AI_Document_Name || row.AI_Content_Hash) items.push(item);
      return;
    }
    if (kspFfIsAiWorkEligible_(item, nowIso, settings)) items.push(item);
  });
  [
    { type: KSP_AI_SOURCE_TYPES.NEWS, rows: newsRows || [] },
    { type: KSP_AI_SOURCE_TYPES.INTERNAL_ASSESSMENT, rows: assessmentRows || [] }
  ].forEach(function (group) {
    group.rows.forEach(function (row) {
      var item = kspAiWorkItemFromRow_(group.type, row);
      if (kspFfIsAiWorkEligible_(item, nowIso, settings)) items.push(item);
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

function kspBuildFeatureFreezeAiSource_(environment, item, maps) {
  var row = item.row;
  if (item.sourceType === KSP_AI_SOURCE_TYPES.MEETING) {
    var meetingText;
    try {
      meetingText = environment.readMeetingText(String(row.Doc_File_ID || ''));
    } catch (error) {
      if (error && /^AI_/.test(String(error.code || ''))) throw error;
      throw kspGeminiStageError_('AI_SOURCE_READ_FAILED', 'SOURCE_READ', 0, {}, false);
    }
    var meeting = kspBuildMeetingAiSource_(row, maps, meetingText, environment.hashText(meetingText));
    meeting.payloadKind = 'text';
    meeting.byteLength = kspAiSourcePayloadBytes_(meeting).length;
    return meeting;
  }
  if (item.sourceType === KSP_AI_SOURCE_TYPES.NEWS ||
      item.sourceType === KSP_AI_SOURCE_TYPES.INTERNAL_ASSESSMENT) {
    var sourceFileId = String(row.Source_File_ID || '');
    if (String(row.Input_Mode || '') === 'DIRECT_TEXT') {
      var sourceText = environment.readMeetingText(sourceFileId);
      var directSource = kspSourceRecordAiContextHash_(environment,
        kspBuildSourceRecordAiSource_(row, item.sourceType, maps, sourceText,
          environment.hashText(sourceText)));
      directSource.payloadKind = 'text';
      directSource.displayName += '.txt';
      directSource.byteLength = kspAiSourcePayloadBytes_(directSource).length;
      return directSource;
    }
    kspAssert_(String(row.Input_Mode || '') === 'UPLOAD_FILE', 'AI_SOURCE_ROW_INVALID',
      'AI source input mode is invalid.');
    var sourceExtension = kspGetPitchbookExtensionForAi_(row);
    var sourceDefinition = kspGetAiFormatDefinition_(sourceExtension);
    var sourcePayload = environment.readPitchbookSource(sourceFileId);
    kspValidateAiSourceDescriptor_(sourceExtension, sourcePayload.mimeType, sourcePayload.bytes.length);
    var sourceBytes = kspNormalizeAiByteArray_(sourcePayload.bytes);
    var normalizedText = '';
    if (sourceDefinition.readStrategy === KSP_AI_READ_STRATEGIES.EML_NORMALIZED_TEXT) {
      normalizedText = kspNormalizeEmlText_(environment.decodeSourceText(sourceBytes, 'UTF-8'));
    } else if (sourceDefinition.readStrategy === KSP_AI_READ_STRATEGIES.XLSX_NORMALIZED_TEXT) {
      normalizedText = environment.normalizeXlsxText(sourceBytes);
    }
    var recordSource = kspBuildSourceRecordAiSource_(row, item.sourceType, maps, normalizedText,
      normalizedText ? environment.hashText(normalizedText) : environment.hashBytes(sourceBytes));
    recordSource.extension = sourceDefinition.extension;
    recordSource.readStrategy = sourceDefinition.readStrategy;
    recordSource.mimeType = sourceDefinition.uploadMimeType;
    recordSource.payloadKind = normalizedText ? 'text' : 'binary';
    recordSource.bytes = normalizedText ? null : sourceBytes;
    if (normalizedText) recordSource.displayName = recordSource.savedFilename.replace(/\.(eml|xlsx)$/i, '') + '.txt';
    recordSource.byteLength = kspAiSourcePayloadBytes_(recordSource).length;
    return kspSourceRecordAiContextHash_(environment, recordSource);
  }
  var extension = kspGetPitchbookExtensionForAi_(row);
  var definition = kspGetAiFormatDefinition_(extension);
  var driveSource;
  try {
    driveSource = environment.readPitchbookSource(String(row.File_ID || ''));
  } catch (error) {
    if (error && /^AI_/.test(String(error.code || ''))) throw error;
    throw kspGeminiStageError_('AI_SOURCE_READ_FAILED', 'SOURCE_READ', 0, {}, false);
  }
  kspValidateAiSourceDescriptor_(extension, driveSource.mimeType, driveSource.bytes.length);
  if (definition.readStrategy === KSP_AI_READ_STRATEGIES.EML_NORMALIZED_TEXT) {
    var rawEml = environment.decodeSourceText(driveSource.bytes, 'UTF-8');
    var normalizedEml = kspNormalizeEmlText_(rawEml);
    return kspParentBoundSourceHash_(environment, kspBuildFeatureFreezePitchbookSource_(
      row, maps, { text: normalizedEml }, environment.hashText(normalizedEml), definition
    ));
  }
  if (definition.readStrategy === KSP_AI_READ_STRATEGIES.XLSX_NORMALIZED_TEXT) {
    var normalizedXlsx = environment.normalizeXlsxText(driveSource.bytes);
    return kspParentBoundSourceHash_(environment, kspBuildFeatureFreezePitchbookSource_(
      row, maps, { text: normalizedXlsx }, environment.hashText(normalizedXlsx), definition
    ));
  }
  var bytes = kspNormalizeAiByteArray_(driveSource.bytes);
  return kspParentBoundSourceHash_(environment, kspBuildFeatureFreezePitchbookSource_(
    row, maps, { bytes: bytes }, environment.hashBytes(bytes), definition
  ));
}

function kspFfBuildSyncReport_(nowIso, settings) {
  return {
    workId: KSP_FEATURE_FREEZE_WORK_ID,
    startedAt: nowIso,
    finishedAt: null,
    ok: true,
    syncEnabled: settings.syncEnabled,
    selected: 0,
    indexed: 0,
    reused: 0,
    unchanged: 0,
    removed: 0,
    failed: 0,
    skippedClaims: 0,
    items: [],
    errors: []
  };
}

function kspFfApplyIndexedPatch_(environment, item, documentValue, contentHash, nowIso) {
  environment.updateAiRow(item.sourceType, item.sourceId, {
    AI_Document_Name: String(documentValue.name || ''),
    AI_Index_Status: KSP_AI_INDEX_STATUS.INDEXED,
    AI_Indexed_At: nowIso,
    AI_Content_Hash: contentHash,
    AI_Last_Error: ''
  });
}

function kspFfProcessInactive_(environment, storeName, item, report) {
  var row = item.row || {};
  var documents = environment.findFileSearchDocumentsBySource(storeName, item.sourceId);
  kspDeleteAiDocuments_(environment, storeName, item.sourceId, row.AI_Document_Name, documents);
  environment.updateAiRow(item.sourceType, item.sourceId, {
    AI_Document_Name: '', AI_Index_Status: KSP_AI_INDEX_STATUS.NOT_INDEXED,
    AI_Indexed_At: '', AI_Content_Hash: '', AI_Last_Error: ''
  });
  report.removed += 1;
  report.items.push({ sourceType: item.sourceType, sourceId: item.sourceId, action: 'removed' });
}

function kspFfProcessActive_(environment, storeName, item, maps, report, nowIso) {
  var row = item.row || {};
  var source = kspBuildFeatureFreezeAiSource_(environment, item, maps);
  var documents = environment.findFileSearchDocumentsBySource(storeName, item.sourceId);
  var matching = documents.filter(function (documentValue) {
    return kspAiDocumentMatchesSource_(documentValue, item.sourceId, source.contentHash);
  });
  if (String(row.AI_Content_Hash || '') === source.contentHash && row.AI_Document_Name) {
    var storedMatch = matching.filter(function (documentValue) {
      return String(documentValue.name || '') === String(row.AI_Document_Name);
    })[0];
    if (storedMatch) {
      kspDeleteAiDocuments_(environment, storeName, item.sourceId, '', documents.filter(function (documentValue) {
        return String(documentValue.name || '') !== String(storedMatch.name || '');
      }));
      kspFfApplyIndexedPatch_(environment, item, storedMatch, source.contentHash, nowIso);
      report.unchanged += 1;
      report.items.push({ sourceType: item.sourceType, sourceId: item.sourceId, action: 'unchanged', documentName: storedMatch.name });
      return;
    }
  }
  if (matching.length > 0) {
    var selected = matching[0];
    kspDeleteAiDocuments_(environment, storeName, item.sourceId, '', documents.filter(function (documentValue) {
      return documentValue.name !== selected.name;
    }));
    kspFfApplyIndexedPatch_(environment, item, selected, source.contentHash, nowIso);
    report.reused += 1;
    report.items.push({ sourceType: item.sourceType, sourceId: item.sourceId, action: 'reconciled', documentName: selected.name });
    return;
  }
  kspDeleteAiDocuments_(environment, storeName, item.sourceId, row.AI_Document_Name, documents);
  var uploaded = environment.uploadSourceToFileSearchStore(storeName, source);
  kspAssert_(uploaded && uploaded.name, 'AI_UPLOAD_DOCUMENT_MISSING', 'File Search upload did not return a Document.');
  kspFfApplyIndexedPatch_(environment, item, uploaded, source.contentHash, nowIso);
  report.indexed += 1;
  report.items.push({
    sourceType: item.sourceType, sourceId: item.sourceId, action: 'indexed',
    format: source.extension || 'meeting-text', documentName: uploaded.name
  });
}

function kspFfRecordFailure_(environment, item, error, settings, nowIso, report) {
  var previous = kspParseAiLastError_(item.row && item.row.AI_Last_Error);
  var attempt = previous.attempt + 1;
  var retryable = kspIsAiErrorRetryable_(error) && !error.permanent && attempt < settings.maxRetryAttempts;
  var permanent = Boolean(error.permanent) || !retryable;
  var nextAttemptAt = retryable ? kspCalculateAiRetryAt_(nowIso, attempt, settings) : '';
  var code = kspGetErrorCode_(error, 'AI_SYNC_FAILED');
  environment.updateAiRow(item.sourceType, item.sourceId, {
    AI_Document_Name: '', AI_Index_Status: KSP_AI_INDEX_STATUS.FAILED,
    AI_Indexed_At: '', AI_Content_Hash: '',
    AI_Last_Error: kspBuildAiLastError_({
      attempt: attempt, retryable: retryable, permanent: permanent,
      nextAttemptAt: nextAttemptAt, code: code,
      message: error && error.message ? error.message : String(error)
    })
  });
  report.failed += 1;
  report.items.push({ sourceType: item.sourceType, sourceId: item.sourceId, action: 'failed', code: code, retryable: retryable, nextAttemptAt: nextAttemptAt });
}

function kspRunFeatureFreezeAiSync_(environment) {
  var startedAt = environment.nowIso();
  var context = environment.loadAiContext();
  environment.ensureAiSettings(kspGetAiSettingSeedRows_(startedAt));
  context = environment.loadAiContext();
  var settings = kspNormalizeAiSettings_(context.settings);
  var report = kspFfBuildSyncReport_(startedAt, settings);
  if (!settings.syncEnabled) { report.finishedAt = environment.nowIso(); return report; }
  var store = environment.ensureFileSearchStore(settings, KSP_AI_DEFAULTS.STORE_DISPLAY_NAME);
  var items = kspFfSelectAiWorkItems_(context.meetingRows, context.pitchbookRows, startedAt, settings,
    context.newsRows, context.assessmentRows);
  report.selected = items.length;
  var maps = kspBuildAiMasterMaps_(kspContextCounterpartyRows_(context), context.optionRows);
  items.forEach(function (item) {
    var claim = environment.claimAiSource(item.sourceType, item.sourceId, startedAt, KSP_AI_DEFAULTS.CLAIM_TTL_MILLIS);
    if (!claim) {
      report.skippedClaims += 1;
      report.items.push({ sourceType: item.sourceType, sourceId: item.sourceId, action: 'claimed-elsewhere' });
      return;
    }
    try {
      if (String(item.row.Status) === KSP_STATUS.INACTIVE || item.retrievalEligible === false) kspFfProcessInactive_(environment, store.name, item, report);
      else kspFfProcessActive_(environment, store.name, item, maps, report, environment.nowIso());
    } catch (error) {
      try { kspFfRecordFailure_(environment, item, error, settings, environment.nowIso(), report); }
      catch (recordError) {
        report.ok = false;
        report.errors.push({ sourceType: item.sourceType, sourceId: item.sourceId, code: kspGetErrorCode_(recordError), message: recordError.message || String(recordError) });
      }
    } finally {
      environment.releaseAiSourceClaim(item.sourceType, item.sourceId, claim.token);
    }
  });
  report.finishedAt = environment.nowIso();
  report.ok = report.errors.length === 0;
  return report;
}

function kspCreateFeatureFreezeAiEnvironment_() {
  var base = kspCreateAiEnvironment_();
  base.readPitchbookSource = function (fileId) {
    kspAssert_(fileId, 'AI_PITCHBOOK_FILE_MISSING', 'Pitchbook source fileがありません。');
    var file = Drive.Files.get(fileId, { supportsAllDrives: true, fields: 'id,name,mimeType,size,trashed' });
    kspAssert_(file && !file.trashed, 'AI_PITCHBOOK_FILE_MISSING', 'Pitchbook source fileが見つかりません。');
    if (Number(file.size || 0)) {
      kspAssert_(Number(file.size) <= KSP_FEATURE_FREEZE_DEFAULTS.MAX_SOURCE_BYTES,
        'AI_SOURCE_TOO_LARGE', 'AI source exceeds the 25MB product limit.');
    }
    var response = UrlFetchApp.fetch('https://www.googleapis.com/drive/v3/files/' + encodeURIComponent(fileId) + '?alt=media&supportsAllDrives=true', {
      method: 'get', headers: { Authorization: 'Bearer ' + ScriptApp.getOAuthToken() }, muteHttpExceptions: true
    });
    var code = response.getResponseCode();
    kspAssert_(code >= 200 && code < 300, 'AI_SOURCE_READ_FAILED', 'Pitchbook sourceを読み込めませんでした。');
    var bytes = kspNormalizeAiByteArray_(response.getBlob().getBytes());
    kspAssert_(bytes.length > 0, 'AI_SOURCE_SIZE_INVALID', 'Pitchbook source is empty.');
    kspAssert_(bytes.length <= KSP_FEATURE_FREEZE_DEFAULTS.MAX_SOURCE_BYTES,
      'AI_SOURCE_TOO_LARGE', 'AI source exceeds the 25MB product limit.');
    return { fileId: String(file.id || fileId), name: String(file.name || ''), mimeType: String(file.mimeType || 'application/octet-stream'), bytes: bytes };
  };
  base.decodeSourceText = function (bytes, charset) {
    return Utilities.newBlob(kspNormalizeAiByteArray_(bytes)).getDataAsString(charset || 'UTF-8');
  };
  base.normalizeXlsxText = function (bytes) {
    return kspNormalizeXlsxText_(bytes);
  };
  base.hashBytes = function (bytes) {
    var signedBytes = kspNormalizeAiByteArray_(bytes).map(function (value) { return value > 127 ? value - 256 : value; });
    var digest = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, signedBytes);
    return digest.map(function (value) { return ('0' + ((Number(value) + 256) % 256).toString(16)).slice(-2); }).join('');
  };
  base.uploadSourceToFileSearchStore = function (storeName, source) {
    return kspUploadFeatureFreezeSourceLive_(storeName, source);
  };
  return base;
}

function kspFfSignedBytes_(bytes) {
  return kspNormalizeAiByteArray_(bytes).map(function (value) { return value > 127 ? value - 256 : value; });
}

function kspFfThrowHttpError_(code, parsed, fallbackMessage) {
  throw kspGeminiStageError_('AI_HTTP_' + code, 'GEMINI_HTTP', code, {}, undefined);
}

function kspUploadFeatureFreezeSourceLive_(storeName, source) {
  var normalizedStore = kspAiStoreResourcePath_(storeName);
  var bytes = kspAiSourcePayloadBytes_(source);
  kspAssert_(bytes.length > 0, 'AI_SOURCE_SIZE_INVALID', 'AI source payload is empty.');
  kspAssert_(bytes.length <= KSP_FEATURE_FREEZE_DEFAULTS.MAX_SOURCE_BYTES, 'AI_SOURCE_TOO_LARGE', 'AI source exceeds the 25MB product limit.');
  return kspGeminiUploadSourceLive_(normalizedStore, source, kspFfSignedBytes_(bytes));
}
// ===== END src/181_FeatureFreezeSync.gs =====

// ===== BEGIN src/182_FeatureFreezeKnowledge.gs =====
var KSP_FEATURE_FREEZE_SEARCH_MODES = KSP_KNOWLEDGE_SEARCH_MODES;
var KSP_FEATURE_FREEZE_MODE_ORDER = KSP_KNOWLEDGE_MODE_ORDER;

function kspGetFeatureFreezeModeDefinition_(mode) {
  var definition = kspGetKnowledgeModeDefinition_(mode);
  definition.gpRequired = definition.targetRequired;
  return definition;
}

function kspGetFeatureFreezeModeDefinitions_() {
  return kspGetKnowledgeModeDefinitions_().map(function (definition) {
    definition.gpRequired = definition.targetRequired;
    return definition;
  });
}

function kspNormalizeFeatureFreezeSearchInput_(input) {
  var normalized = kspNormalizeCanonicalKnowledgeRequest_(input);
  normalized.question = normalized.questionOrInstruction;
  return normalized;
}

function kspValidateFeatureFreezeSearchInput_(input) {
  return kspValidateCanonicalKnowledgeRequest_(input);
}

function kspBuildFeatureFreezePrompt_(input) {
  return kspBuildCanonicalKnowledgePrompt_(input);
}

function kspBuildFeatureFreezeInteractionRequest_(params) {
  var options = params || {};
  var modelId = kspAiTrim_(options.modelId);
  var storeName = kspAiStoreResourcePath_(options.storeName);
  var input = kspValidateFeatureFreezeSearchInput_(kspNormalizeFeatureFreezeSearchInput_({
    mode: options.mode,
    questionOrInstruction: options.questionOrInstruction,
    gpId: options.gpId
  }));
  kspAssert_(modelId, 'AI_MODEL_NOT_CONFIGURED', 'Gemini Flash model IDが設定されていません。');
  var tool = { type: 'file_search', file_search_store_names: [storeName] };
  var filter = kspAiTrim_(options.metadataFilter);
  if (filter) tool.metadata_filter = filter;
  return {
    model: modelId,
    input: kspBuildFeatureFreezePrompt_(input),
    tools: [tool],
    background: true,
    generation_config: kspGeminiGenerationConfig_(options)
  };
}

function kspBuildFeatureFreezeAuditRow_(params) {
  var options = params || {};
  var input = options.input || {};
  var sourceIds = (options.citations || []).map(function (citation) { return citation.sourceId; });
  return {
    Event_Timestamp: kspCanonicalInstantIso_(options.timestamp), Actor: options.actor || 'UNIDENTIFIED',
    Action: 'AI_QUERY', Target_Type: 'KnowledgeSearch', Target_ID: options.interactionId || '',
    Result: options.result || KSP_AUDIT_RESULTS.FAILURE,
    Changed_Fields: '', Before_Metadata_JSON: '', After_Metadata_JSON: '', Batch_ID: '',
    Error_Code: options.errorCode || '', Error_Message: options.errorCode ? kspSafePublicErrorMessage_(options.errorCode, 'SEARCH') : '',
    Search_Mode: input.mode || KSP_FEATURE_FREEZE_SEARCH_MODES.FREE_QUESTION,
    Question_Or_Instruction: '',
    Date_From: input.dateFrom || '', Date_To: input.dateTo || '', GP_Filter: input.gpId || '',
    Asset_Class_Filter: input.assetClassId || '', Capital_Type_Filter: input.capitalTypeId || '',
    Source_Type_Filter: input.sourceType || '', Model_ID: options.modelId || '',
    Cited_Source_IDs: kspUniqueStrings_(sourceIds).join(',')
  };
}

function kspGetFeatureFreezeKnowledgeBootstrap_(environment) {
  try {
    var context = environment.loadAiContext();
    var settings = kspNormalizeAiSettings_(context.settings);
    return {
      ok: true, workId: KSP_FEATURE_FREEZE_WORK_ID, appVersion: KSP_FEATURE_FREEZE_APP_VERSION,
      configured: Boolean(settings.storeName && settings.modelId),
      implementedModes: KSP_FEATURE_FREEZE_MODE_ORDER.slice(), targetModes: KSP_FEATURE_FREEZE_MODE_ORDER.slice(),
      modeDefinitions: kspGetFeatureFreezeModeDefinitions_(),
      options: kspBuildKnowledgeSearchCatalog_(kspContextCounterpartyRows_(context), context.optionRows,
        context.meetingRows, context.pitchbookRows, context.newsRows, context.assessmentRows),
      syncIntervalMinutes: settings.syncIntervalMinutes
    };
  } catch (error) {
    return { ok: false, workId: KSP_FEATURE_FREEZE_WORK_ID, error: { code: kspGetErrorCode_(error), message: kspSafePublicErrorMessage_(kspGetErrorCode_(error), 'SEARCH') } };
  }
}

function kspRunFeatureFreezeKnowledgeSearch_(environment, rawInput) {
  var warnings = [];
  var actor = kspGetAiActorSafely_(environment, warnings);
  var input = kspNormalizeFeatureFreezeSearchInput_(rawInput);
  var context = null;
  var settings = null;
  var auditSpreadsheetId = '';
  try {
    kspAssert_(kspClaimPublicOperation_(environment, 'KNOWLEDGE_SEARCH', actor, 'FIVE_MODES', 2),
      'AI_RATE_LIMITED', '検索が集中しています。少し待って再試行してください。');
    context = environment.loadAiContext();
    settings = kspNormalizeAiSettings_(context.settings);
    auditSpreadsheetId = context.auditSpreadsheetId;
    input = kspValidateFeatureFreezeSearchInput_(input);
    kspAssert_(settings.storeName, 'AI_STORE_NOT_CONFIGURED', 'Gemini File Search Storeが設定されていません。');
    kspAssert_(settings.modelId, 'AI_MODEL_NOT_CONFIGURED', 'Gemini Flash model IDが設定されていません。');
    var catalog = kspBuildKnowledgeSearchCatalog_(kspContextCounterpartyRows_(context), context.optionRows,
      context.meetingRows, context.pitchbookRows, context.newsRows, context.assessmentRows);
    kspValidateKnowledgeFilterIds_(input, catalog);
    var metadataFilter = kspBuildMetadataFilter_(input);
    var request = kspBuildFeatureFreezeInteractionRequest_({
      storeName: settings.storeName, modelId: settings.modelId, mode: input.mode,
      questionOrInstruction: input.questionOrInstruction, gpId: input.gpId, metadataFilter: metadataFilter
    });
    var parsed = kspParseInteractionResponse_(environment.queryFileSearch(request));
    var citationContext = environment.loadAiContext();
    var mapped = kspMapKnowledgeCitations_(parsed.citations, kspBuildAuthoritativeSourceMaps_(citationContext.meetingRows, citationContext.pitchbookRows));
    warnings = warnings.concat(mapped.warnings);
    var answer = parsed.answer;
    var insufficientEvidence = !answer || mapped.citations.length === 0;
    if (!answer) answer = '確認できる根拠が不足しています。';
    if (insufficientEvidence) warnings.push({ code: 'AI_INSUFFICIENT_EVIDENCE', message: '回答または根拠となる資料が不足しています。' });
    kspTryAppendKnowledgeAudit_(environment, auditSpreadsheetId, kspBuildFeatureFreezeAuditRow_({
      timestamp: environment.nowIso(), actor: actor, input: input, modelId: settings.modelId,
      interactionId: parsed.interactionId, result: KSP_AUDIT_RESULTS.SUCCESS, citations: mapped.citations
    }), warnings);
    return {
      ok: true, workId: KSP_FEATURE_FREEZE_WORK_ID, mode: input.mode, answer: answer,
      citations: mapped.citations, insufficientEvidence: insufficientEvidence,
      metadataFilter: metadataFilter, interactionId: parsed.interactionId, warnings: warnings
    };
  } catch (error) {
    if (context && auditSpreadsheetId) {
      kspTryAppendKnowledgeAudit_(environment, auditSpreadsheetId, kspBuildFeatureFreezeAuditRow_({
        timestamp: environment.nowIso(), actor: actor, input: input,
        modelId: settings ? settings.modelId : '', result: KSP_AUDIT_RESULTS.FAILURE,
        errorCode: kspGetErrorCode_(error), errorMessage: kspSafePublicErrorMessage_(kspGetErrorCode_(error), 'SEARCH'), citations: []
      }), warnings);
    }
    return { ok: false, workId: KSP_FEATURE_FREEZE_WORK_ID, mode: input.mode, error: { code: kspGetErrorCode_(error), message: kspSafePublicErrorMessage_(kspGetErrorCode_(error), 'SEARCH') }, warnings: warnings };
  }
}
// ===== END src/182_FeatureFreezeKnowledge.gs =====

// ===== BEGIN src/190_FeatureFreezeDiagnostics.gs =====
function kspGetFeatureFreezeDiagnostics_(environment) {
  var settings = {};
  var warning = '';
  if (environment && typeof environment.loadAiContext === 'function') {
    try { settings = kspNormalizeAiSettings_(environment.loadAiContext().settings || {}); }
    catch (error) { warning = error.message || String(error); }
  }
  var formats = kspGetAiFormatExtensions_().map(function (extension) {
    var definition = kspGetAiFormatDefinition_(extension);
    return { extension: extension, uploadMimeType: definition.uploadMimeType, readStrategy: definition.readStrategy, implemented: true };
  });
  var modes = kspGetFeatureFreezeModeDefinitions_().map(function (definition) {
    return { mode: definition.mode, implemented: true, inputRequired: definition.inputRequired, gpRequired: definition.gpRequired };
  });
  return {
    ok: true,
    workId: KSP_FEATURE_FREEZE_WORK_ID,
    appVersion: KSP_FEATURE_FREEZE_APP_VERSION,
    featureFreezeCandidate: formats.length === 6 && modes.length === 5,
    formats: formats,
    modes: modes,
    sharedRetrievalPath: 'kspRunFeatureFreezeKnowledgeSearch_',
    sharedCitationPath: 'kspMapKnowledgeCitations_',
    sharedAuditPath: 'kspBuildFeatureFreezeAuditRow_',
    syncHandler: 'runAiSyncWorker_',
    syncHandlerAvailable: typeof runAiSyncWorker_ === 'function',
    modelConfigured: Boolean(settings.modelId),
    storeConfigured: Boolean(settings.storeName),
    credentialProvider: 'SERVER_SIDE_NOT_INSPECTED',
    liveQualified: false,
    warning: warning
  };
}
// ===== END src/190_FeatureFreezeDiagnostics.gs =====

