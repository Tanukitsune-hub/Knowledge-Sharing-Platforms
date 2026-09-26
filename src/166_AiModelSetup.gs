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

function kspAiSetupPolicy_(settings, nowIso, runtime) {
  if (settings.modelPolicyJson) return kspNormalizeAiModelPolicy_(settings.modelPolicyJson);
  if (settings.openaiModelId) return kspBuildMigratedOpenAiModelPolicy_(settings, {
    modelId: settings.openaiModelId,
    accessible: runtime ? runtime.accessible === true : Boolean(settings.openaiEnabled),
    qualified: runtime ? runtime.qualified === true : Boolean(settings.openaiEnabled &&
      ['ACTIVE', 'ACTIVE_WITH_SYNC_ERRORS', 'READY_FOR_SYNC'].indexOf(settings.openaiReadiness) !== -1),
    nowIso: nowIso
  });
  return kspNormalizeAiModelPolicy_({
    schemaVersion: KSP_AI_DEFAULTS.MODEL_POLICY_SCHEMA_VERSION, updatedAt: nowIso, profiles: []
  });
}

function kspAiSetupModelId_(value, provider) {
  var modelId = kspAiTrim_(value);
  if (provider === KSP_AI_PROVIDERS.GEMINI && modelId.indexOf('models/') === 0) {
    modelId = modelId.slice('models/'.length);
  }
  if (!modelId || modelId.length > 128 || !/^[A-Za-z0-9][A-Za-z0-9._:/-]*$/.test(modelId)) {
    throw kspAiSetupError_('AI_SETUP_MODEL_INVALID');
  }
  if (provider === KSP_AI_PROVIDERS.GEMINI && modelId.indexOf('models/') === 0) {
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
    return item.provider === provider && kspAiSetupModelId_(item.modelId, provider) === modelId;
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

function kspAiSetupSafeCandidates_(raw, provider) {
  var response = raw || {};
  var seen = {};
  var candidates = [];
  (Array.isArray(response.models) ? response.models : []).forEach(function (item) {
    var modelId;
    try { modelId = kspAiSetupModelId_(item && item.modelId, provider); } catch (ignored) { return; }
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
    if (cached) {
      var safeCached = kspAiSetupSafeCandidates_(cached, provider);
      return { ok: true, workId: '0073', provider: provider,
        models: safeCached.models, partial: safeCached.partial,
        fetchedAt: cached.fetchedAt, cached: true };
    }
    var result = kspAiSetupSafeCandidates_(environment.listAiProviderModels(provider, candidateKey), provider);
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
    if (!credentialMode) {
      var credentialConfigured = provider === KSP_AI_PROVIDERS.OPENAI
        ? environment.isOpenAiCredentialConfigured() : environment.isGeminiCredentialConfigured();
      if (!credentialConfigured) throw kspAiSetupError_('AI_SETUP_CREDENTIAL_REQUIRED');
    }
    var modelId = kspAiSetupModelId_(payload.modelId, provider);
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
