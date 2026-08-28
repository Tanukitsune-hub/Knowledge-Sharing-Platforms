var KSP_AI_PROVIDER_STATE_VERSION = 1;

function kspAiProviderStateEntry_() {
  return {
    status: KSP_AI_INDEX_STATUS.NOT_INDEXED,
    documentName: '',
    providerDocumentId: '',
    storeName: '',
    indexedAt: '',
    contentHash: '',
    lastError: ''
  };
}

function kspBuildEmptyAiProviderState_() {
  return {
    stateVersion: KSP_AI_PROVIDER_STATE_VERSION,
    OPENAI: kspAiProviderStateEntry_(),
    GEMINI: kspAiProviderStateEntry_()
  };
}

function kspNormalizeAiProviderEntry_(value) {
  var source = value || {};
  var output = kspAiProviderStateEntry_();
  var status = kspAiTrim_(source.status || source.indexStatus);
  if (status) output.status = status;
  output.documentName = kspAiTrim_(source.documentName || source.document_name || source.name);
  output.providerDocumentId = kspAiTrim_(source.providerDocumentId || source.provider_document_id || source.fileId);
  output.storeName = kspAiTrim_(source.storeName || source.store_name || source.vectorStoreId);
  output.indexedAt = kspAiTrim_(source.indexedAt || source.indexed_at);
  output.contentHash = kspAiTrim_(source.contentHash || source.content_hash);
  output.lastError = kspAiTrim_(source.lastError || source.last_error);
  return output;
}

function kspParseAiProviderState_(rawValue, legacyRow) {
  var parsed = rawValue;
  if (typeof parsed === 'string') {
    var raw = parsed.trim();
    if (!raw) parsed = null;
    else {
      try { parsed = JSON.parse(raw); }
      catch (error) {
        var invalid = new Error('AI provider state is invalid.');
        invalid.code = 'AI_PROVIDER_STATE_INVALID';
        throw invalid;
      }
    }
  }
  var state = kspBuildEmptyAiProviderState_();
  if (parsed && typeof parsed === 'object') {
    var providers = parsed.providers && typeof parsed.providers === 'object' ? parsed.providers : parsed;
    state.OPENAI = kspNormalizeAiProviderEntry_(providers.OPENAI || providers.openai);
    state.GEMINI = kspNormalizeAiProviderEntry_(providers.GEMINI || providers.gemini);
    state.stateVersion = Number(parsed.stateVersion || parsed.state_version || KSP_AI_PROVIDER_STATE_VERSION) || KSP_AI_PROVIDER_STATE_VERSION;
    return state;
  }
  var row = legacyRow || {};
  state.GEMINI = kspNormalizeAiProviderEntry_({
    status: row.AI_Index_Status,
    documentName: row.AI_Document_Name,
    indexedAt: row.AI_Indexed_At,
    contentHash: row.AI_Content_Hash,
    lastError: row.AI_Last_Error
  });
  return state;
}

function kspSerializeAiProviderState_(state) {
  var normalized = state || kspBuildEmptyAiProviderState_();
  var output = {
    stateVersion: KSP_AI_PROVIDER_STATE_VERSION,
    OPENAI: kspNormalizeAiProviderEntry_(normalized.OPENAI),
    GEMINI: kspNormalizeAiProviderEntry_(normalized.GEMINI)
  };
  return JSON.stringify(output);
}

function kspAiProviderLastError_(value) {
  var parsed = value;
  if (typeof parsed === 'string') {
    var raw = parsed.trim();
    if (!raw) return { attempt: 0, retryable: false, permanent: false, nextAttemptAt: '' };
    try { parsed = JSON.parse(raw); } catch (ignored) {
      return { attempt: 0, retryable: false, permanent: false, nextAttemptAt: '' };
    }
  }
  var source = parsed && typeof parsed === 'object' ? parsed : {};
  return {
    attempt: Number(source.attempt || 0) || 0,
    retryable: Boolean(source.retryable),
    permanent: Boolean(source.permanent),
    nextAttemptAt: kspAiTrim_(source.nextAttemptAt || source.next_attempt_at)
  };
}

function kspBuildAiProviderLastError_(error, previous, settings, nowIso) {
  var prior = previous || { attempt: 0 };
  var attempt = Number(prior.attempt || 0) + 1;
  var retryable = Boolean(kspIsAiErrorRetryable_(error) && !error.permanent &&
    attempt < Number(settings.maxRetryAttempts || KSP_AI_DEFAULTS.MAX_RETRY_ATTEMPTS));
  var permanent = Boolean(error.permanent) || !retryable;
  var nextAttemptAt = retryable
    ? kspCalculateAiRetryAt_(nowIso, attempt, settings)
    : '';
  return JSON.stringify({
    attempt: attempt,
    retryable: retryable,
    permanent: permanent,
    nextAttemptAt: nextAttemptAt,
    code: kspGetErrorCode_(error, 'AI_SYNC_FAILED')
  });
}

function kspGetAiProviderStateEntry_(row, provider) {
  var state = kspParseAiProviderState_(row && row.AI_Provider_State_JSON, row);
  return state[kspNormalizeAiProvider_(provider)] || kspAiProviderStateEntry_();
}

function kspIsProviderAiWorkEligible_(item, nowIso, settings, provider) {
  var row = item.row || {};
  var entry = kspGetAiProviderStateEntry_(row, provider);
  var sourceStatus = String(row.Status || '');
  if (sourceStatus === KSP_STATUS.INACTIVE) {
    return Boolean(entry.documentName) || entry.status === KSP_AI_INDEX_STATUS.INDEXED ||
      entry.status === KSP_AI_INDEX_STATUS.PENDING || entry.status === KSP_AI_INDEX_STATUS.FAILED;
  }
  if (sourceStatus !== KSP_STATUS.ACTIVE) return false;
  // Existing source mutations signal a new revision through the preserved
  // legacy status column. The provider state remains independently owned, so
  // this signal must make every enabled provider reconsider its own entry.
  if (String(row.AI_Index_Status || '') === KSP_AI_INDEX_STATUS.PENDING) return true;
  if (entry.status === KSP_AI_INDEX_STATUS.PENDING || entry.status === KSP_AI_INDEX_STATUS.NOT_INDEXED) return true;
  if (entry.status === KSP_AI_INDEX_STATUS.INDEXED && !entry.documentName) return true;
  if (entry.status !== KSP_AI_INDEX_STATUS.FAILED) return false;
  var lastError = kspAiProviderLastError_(entry.lastError);
  if (lastError.permanent || !lastError.retryable ||
      lastError.attempt >= Number(settings.maxRetryAttempts || KSP_AI_DEFAULTS.MAX_RETRY_ATTEMPTS)) return false;
  return !lastError.nextAttemptAt ||
    kspTemporalInstantComparisonKey_(lastError.nextAttemptAt) <= kspTemporalInstantComparisonKey_(nowIso);
}

function kspSelectProviderAiWorkItems_(meetingRows, pitchbookRows, nowIso, settings, provider) {
  var items = [];
  (meetingRows || []).forEach(function (row) {
    var item = kspAiWorkItemFromRow_(KSP_AI_SOURCE_TYPES.MEETING, row);
    if (kspIsProviderAiWorkEligible_(item, nowIso, settings, provider)) items.push(item);
  });
  (pitchbookRows || []).forEach(function (row) {
    var item = kspAiWorkItemFromRow_(KSP_AI_SOURCE_TYPES.PITCHBOOK, row);
    if (kspIsProviderAiWorkEligible_(item, nowIso, settings, provider)) items.push(item);
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

function kspBuildAiProviderStatePatch_(row, provider, patch) {
  var current = kspParseAiProviderState_(row && row.AI_Provider_State_JSON, row);
  var normalizedProvider = kspNormalizeAiProvider_(provider);
  kspAssert_(normalizedProvider, 'AI_PROVIDER_INVALID', 'AI provider is invalid.');
  var entry = kspNormalizeAiProviderEntry_(current[normalizedProvider]);
  Object.keys(patch || {}).forEach(function (key) {
    if (patch[key] !== undefined) entry[key] = patch[key];
  });
  current[normalizedProvider] = kspNormalizeAiProviderEntry_(entry);
  return current;
}

function kspNormalizeAiProvider_(value) {
  var normalized = kspAiTrim_(value).toUpperCase();
  return normalized === KSP_AI_PROVIDERS.OPENAI || normalized === KSP_AI_PROVIDERS.GEMINI ? normalized : '';
}

function kspBuildAiProviderConfig_(settings, provider) {
  var normalizedProvider = kspNormalizeAiProvider_(provider);
  kspAssert_(normalizedProvider, 'AI_PROVIDER_INVALID', 'AI provider is invalid.');
  var source = settings || {};
  if (normalizedProvider === KSP_AI_PROVIDERS.OPENAI) {
    return {
      provider: normalizedProvider,
      enabled: Boolean(source.openaiEnabled),
      vectorStoreId: kspAiTrim_(source.openaiVectorStoreId),
      modelId: kspAiTrim_(source.openaiModelId),
      credentialConfigured: false
    };
  }
  return {
    provider: normalizedProvider,
    enabled: Boolean(source.geminiEnabled),
    storeName: kspAiTrim_(source.geminiStoreName || source.storeName),
    modelId: kspAiTrim_(source.geminiModelId || source.modelId),
    embeddingModel: kspAiTrim_(source.embeddingModel || KSP_AI_DEFAULTS.EMBEDDING_MODEL),
    credentialConfigured: false
  };
}

function kspBuildOpenAiAttributes_(source) {
  var value = source || {};
  var attributes = {};
  function add(key, item) {
    var normalized = kspAiTrim_(item);
    if (normalized) attributes[key] = normalized;
  }
  add('source_type', value.sourceType);
  add('source_id', value.sourceId);
  add('date_key', value.dateKey);
  add('entity_key', value.entityKey);
  add('counterparty_type', value.counterpartyType);
  add('gp_id', value.gpId);
  add('asset_class_id', value.assetClassId);
  add('capital_type_id', value.capitalTypeId);
  add('team_id', value.teamId);
  add('fund_strategy', value.fundStrategy);
  if (value.followUpRequired === true) attributes.follow_up_required = 'true';
  return attributes;
}

function kspBuildOpenAiFilter_(filters) {
  var input = filters || {};
  var clauses = [];
  function add(operator, key, value) {
    var normalized = kspAiTrim_(value);
    if (normalized) clauses.push({ type: operator, key: key, value: normalized });
  }
  add('gte', 'date_key', input.dateFrom);
  add('lte', 'date_key', input.dateTo);
  add('eq', 'gp_id', input.gpId);
  add('eq', 'asset_class_id', input.assetClassId);
  add('eq', 'capital_type_id', input.capitalTypeId);
  add('eq', 'source_type', input.sourceType);
  return clauses.length === 0 ? undefined : clauses.length === 1 ? clauses[0] : { type: 'and', filters: clauses };
}

function kspBuildCanonicalKnowledgeRequest_(rawInput) {
  var source = rawInput || {};
  var route = kspAiTrim_(source.route || source.provider).toUpperCase() || KSP_AI_ROUTES.GEMINI;
  return {
    route: route,
    provider: route === KSP_AI_ROUTES.FULL_EXPORT ? '' : kspNormalizeAiProvider_(route),
    mode: kspAiTrim_(source.mode) || KSP_FEATURE_FREEZE_SEARCH_MODES.FREE_QUESTION,
    questionOrInstruction: kspAiTrim_(source.questionOrInstruction || source.question || source.instruction),
    dateFrom: kspAiTrim_(source.dateFrom),
    dateTo: kspAiTrim_(source.dateTo),
    gpId: kspAiTrim_(source.gpId),
    assetClassId: kspAiTrim_(source.assetClassId),
    capitalTypeId: kspAiTrim_(source.capitalTypeId),
    sourceType: kspAiTrim_(source.sourceType)
  };
}

function kspBuildProviderSearchRequest_(provider, config, input) {
  var normalizedProvider = kspNormalizeAiProvider_(provider);
  var value = input || {};
  var promptInput = kspValidateFeatureFreezeSearchInput_(kspNormalizeFeatureFreezeSearchInput_(value));
  var prompt = kspBuildFeatureFreezePrompt_(promptInput);
  if (normalizedProvider === KSP_AI_PROVIDERS.OPENAI) {
    return {
      provider: normalizedProvider,
      model: config.modelId,
      vectorStoreId: config.vectorStoreId,
      input: prompt,
      filters: kspBuildOpenAiFilter_(value)
    };
  }
  return {
    provider: normalizedProvider,
    modelId: config.modelId,
    storeName: config.storeName,
    mode: promptInput.mode,
    questionOrInstruction: promptInput.questionOrInstruction,
    metadataFilter: kspBuildMetadataFilter_(value)
  };
}

function kspProviderCitationMetadata_(citation) {
  var source = citation || {};
  var metadata = source.metadata || source.attributes || source.customMetadata || {};
  return kspMetadataArrayToMap_(metadata);
}

function kspNormalizeOpenAiResponse_(response) {
  var value = response || {};
  var answerParts = [];
  var citations = [];
  var resultAttributes = {};
  (value.output || []).forEach(function (item) {
    if (!item) return;
    if (String(item.type) === 'file_search_call') {
      (item.results || item.search_results || []).forEach(function (result) {
        if (result && result.file_id) resultAttributes[String(result.file_id)] = result.attributes || result.metadata || {};
      });
    }
    if (String(item.type) !== 'message') return;
    (item.content || []).forEach(function (block) {
      if (!block) return;
      if (block.text !== undefined && block.text !== null) answerParts.push(String(block.text));
      (block.annotations || []).forEach(function (annotation) {
        if (!annotation || (annotation.type && String(annotation.type) !== 'file_citation')) return;
        var fileId = kspAiTrim_(annotation.file_id || annotation.fileId);
        citations.push({
          type: 'file_citation',
          fileName: kspAiTrim_(annotation.filename || annotation.file_name || annotation.fileName),
          source: fileId,
          pageNumber: Number(annotation.page_number || annotation.pageNumber || 0) || null,
          metadata: kspProviderCitationMetadata_(annotation).source_id
            ? kspProviderCitationMetadata_(annotation)
            : kspMetadataArrayToMap_(resultAttributes[fileId] || {})
        });
      });
    });
  });
  var outputText = value.output_text;
  if (!answerParts.length && outputText) answerParts.push(String(outputText));
  var seen = {};
  citations = citations.filter(function (citation) {
    var metadata = kspProviderCitationMetadata_(citation);
    var key = (metadata.source_type || '') + '|' + (metadata.source_id || '') + '|' + (citation.source || '') + '|' + (citation.pageNumber || '');
    if (seen[key]) return false;
    seen[key] = true;
    citation.metadata = metadata;
    return true;
  });
  return {
    answer: answerParts.join('\n').trim(),
    citations: citations,
    interactionId: kspAiTrim_(value.id),
    rawStatus: kspAiTrim_(value.status)
  };
}

function kspCreateProviderNeutralAiEnvironment_() {
  var base = kspCreateFeatureFreezeAiEnvironment_();
  base.getProviderConfig = function (provider) {
    var context = base.loadAiContext();
    var config = kspBuildAiProviderConfig_(kspNormalizeAiSettings_(context.settings), provider);
    if (config.provider === KSP_AI_PROVIDERS.OPENAI && config.enabled) {
      try {
        kspOpenAiApiKeyLive_();
        config.credentialConfigured = true;
      } catch (ignored) {
        config.credentialConfigured = false;
      }
    }
    if (config.provider === KSP_AI_PROVIDERS.GEMINI && config.enabled) {
      try {
        kspGeminiApiKeyLive_();
        config.credentialConfigured = true;
      } catch (ignoredGemini) {
        config.credentialConfigured = false;
      }
    }
    return config;
  };
  base.ensureProviderStore = function (provider, config) {
    if (provider === KSP_AI_PROVIDERS.OPENAI) {
      kspAssert_(config.vectorStoreId, 'OPENAI_VECTOR_STORE_NOT_CONFIGURED', 'ChatGPT Vector Storeが設定されていません。');
      var openAiStore = kspOpenAiGetVectorStoreLive_(config.vectorStoreId);
      return { name: String(openAiStore.id || config.vectorStoreId), displayName: String(openAiStore.name || '') };
    }
    return base.ensureFileSearchStore({
      storeName: config.storeName,
      embeddingModel: kspAiTrim_(config.embeddingModel || KSP_AI_DEFAULTS.EMBEDDING_MODEL)
    }, KSP_AI_DEFAULTS.STORE_DISPLAY_NAME);
  };
  base.isOpenAiCredentialConfigured = function () {
    try {
      kspOpenAiApiKeyLive_();
      return true;
    } catch (ignored) {
      return false;
    }
  };
  base.createOpenAiVectorStore = function (displayName) {
    return kspOpenAiCreateVectorStoreLive_(displayName);
  };
  base.getOpenAiVectorStore = function (vectorStoreId) {
    return kspOpenAiGetVectorStoreLive_(vectorStoreId);
  };
  base.writeAiSetting = function (key, value, nowIso) {
    var context = base.loadAiContext();
    return kspWriteSettingLive_(context.backendSpreadsheetId, key, String(value), nowIso || base.nowIso());
  };
  base.uploadProviderSource = function (provider, config, source) {
    return provider === KSP_AI_PROVIDERS.OPENAI
      ? kspOpenAiUploadSourceLive_(config.vectorStoreId, source)
      : base.uploadSourceToFileSearchStore(config.storeName, source);
  };
  base.findProviderDocumentsBySource = function (provider, config, sourceType, sourceId) {
    return provider === KSP_AI_PROVIDERS.OPENAI
      ? kspOpenAiFindDocumentsBySourceLive_(config.vectorStoreId, sourceType, sourceId)
      : base.findFileSearchDocumentsBySource(config.storeName, sourceId);
  };
  base.deleteProviderDocument = function (provider, config, documentValue) {
    return provider === KSP_AI_PROVIDERS.OPENAI
      ? kspOpenAiDeleteDocumentLive_(config.vectorStoreId, documentValue)
      : base.deleteFileSearchDocument(config.storeName, documentValue.name);
  };
  base.queryProvider = function (provider, config, request) {
    return provider === KSP_AI_PROVIDERS.OPENAI
      ? kspOpenAiQueryFileSearchLive_(request)
      : base.queryFileSearch(kspBuildFeatureFreezeInteractionRequest_(request));
  };
  base.updateAiProviderState = function (sourceType, sourceId, provider, patch) {
    var context = base.loadAiContext();
    var rows = sourceType === KSP_AI_SOURCE_TYPES.MEETING ? context.meetingRows : context.pitchbookRows;
    var key = sourceType === KSP_AI_SOURCE_TYPES.MEETING ? 'Meeting_ID' : 'Document_ID';
    var row = (rows || []).filter(function (item) { return String(item[key] || '') === String(sourceId); })[0];
    kspAssert_(row, 'AI_SOURCE_ROW_NOT_FOUND', 'AI source rowが見つかりません。');
    var state = kspBuildAiProviderStatePatch_(row, provider, patch);
    var rowPatch = { AI_Provider_State_JSON: kspSerializeAiProviderState_(state) };
    if (provider === KSP_AI_PROVIDERS.GEMINI) {
      rowPatch.AI_Document_Name = String(state.GEMINI.documentName || '');
      rowPatch.AI_Index_Status = String(state.GEMINI.status || KSP_AI_INDEX_STATUS.NOT_INDEXED);
      rowPatch.AI_Indexed_At = String(state.GEMINI.indexedAt || '');
      rowPatch.AI_Content_Hash = String(state.GEMINI.contentHash || '');
      rowPatch.AI_Last_Error = String(state.GEMINI.lastError || '');
    }
    return base.updateAiRow(sourceType, sourceId, rowPatch);
  };
  return base;
}

function kspProviderConfigurationError_(provider, config) {
  var prefix = provider === KSP_AI_PROVIDERS.OPENAI ? 'OPENAI' : 'GEMINI';
  if (!config || !config.enabled) {
    var disabled = new Error(prefix + ' provider is disabled by configuration.');
    disabled.code = prefix + '_DISABLED_BY_CONFIG';
    disabled.provider = provider;
    throw disabled;
  }
  if (provider === KSP_AI_PROVIDERS.OPENAI && (!config.vectorStoreId || !config.modelId || config.credentialConfigured === false)) {
    var openai = new Error('OPENAI provider is not configured.');
    openai.code = 'OPENAI_NOT_CONFIGURED';
    openai.provider = provider;
    throw openai;
  }
  if (provider === KSP_AI_PROVIDERS.GEMINI && (!config.modelId || config.credentialConfigured === false)) {
    var gemini = new Error('GEMINI provider is not configured.');
    gemini.code = 'GEMINI_NOT_CONFIGURED';
    gemini.provider = provider;
    throw gemini;
  }
}

function kspProviderSafeMessage_(code) {
  var messages = {
    OPENAI_DISABLED_BY_CONFIG: 'ChatGPT検索は管理者設定で無効です。',
    OPENAI_NOT_CONFIGURED: 'ChatGPT検索の設定が未完了です。',
    OPENAI_CREDENTIALS_UNAVAILABLE: 'ChatGPT検索の設定を確認できません。',
    OPENAI_VECTOR_STORE_NOT_CONFIGURED: 'ChatGPT検索の設定が未完了です。',
    GEMINI_DISABLED_BY_CONFIG: 'Gemini検索は管理者設定で無効です。',
    GEMINI_NOT_CONFIGURED: 'Gemini検索の設定が未完了です。',
    GEMINI_CREDENTIALS_UNAVAILABLE: 'Gemini検索の設定を確認できません。',
    AI_PROVIDER_INVALID: '検索プロバイダが不正です。'
  };
  return messages[String(code || '')] || '';
}

function kspRunProviderKnowledgeSearch_(environment, provider, rawInput) {
  var normalizedProvider = kspNormalizeAiProvider_(provider);
  var warnings = [];
  var actor = kspGetAiActorSafely_(environment, warnings);
  var context = null;
  var config = null;
  var input = kspNormalizeFeatureFreezeSearchInput_(rawInput);
  try {
    kspAssert_(normalizedProvider, 'AI_PROVIDER_INVALID', 'AI provider is invalid.');
    kspAssert_(kspClaimPublicOperation_(environment, 'KNOWLEDGE_SEARCH_' + normalizedProvider, actor, input.mode || '', 2),
      'AI_RATE_LIMITED', '検索が集中しています。少し待って再試行してください。');
    input = kspValidateFeatureFreezeSearchInput_(input);
    context = environment.loadAiContext();
    config = typeof environment.getProviderConfig === 'function'
      ? environment.getProviderConfig(normalizedProvider)
      : kspBuildAiProviderConfig_(kspNormalizeAiSettings_(context.settings), normalizedProvider);
    if (typeof environment.getProviderConfig !== 'function') {
      config.credentialConfigured = true;
    }
    kspProviderConfigurationError_(normalizedProvider, config);
    var catalog = kspBuildKnowledgeSearchCatalog_(context.gpRows, context.optionRows);
    kspValidateKnowledgeFilterIds_(input, catalog);
    var request = kspBuildProviderSearchRequest_(normalizedProvider, config, input);
    var rawResponse = typeof environment.queryProvider === 'function'
      ? environment.queryProvider(normalizedProvider, config, request)
      : environment.queryFileSearch(request);
    var parsed = normalizedProvider === KSP_AI_PROVIDERS.OPENAI
      ? kspNormalizeOpenAiResponse_(rawResponse)
      : kspParseInteractionResponse_(rawResponse);
    var mapped = kspMapKnowledgeCitations_(parsed.citations,
      kspBuildAuthoritativeSourceMaps_(context.meetingRows, context.pitchbookRows));
    warnings = warnings.concat(mapped.warnings);
    var answer = parsed.answer || '確認できる根拠が不足しています。';
    var insufficientEvidence = !parsed.answer || mapped.citations.length === 0;
    if (insufficientEvidence) warnings.push({ code: 'AI_INSUFFICIENT_EVIDENCE', message: '回答または authoritative citation が不足しています。' });
    kspTryAppendKnowledgeAudit_(environment, context.auditSpreadsheetId, kspBuildKnowledgeSearchAuditRow_({
      timestamp: environment.nowIso(), actor: actor, input: input, modelId: config.modelId,
      interactionId: parsed.interactionId, result: KSP_AUDIT_RESULTS.SUCCESS, citations: mapped.citations,
      provider: normalizedProvider
    }), warnings);
    return {
      ok: true,
      workId: '0020',
      provider: normalizedProvider,
      mode: input.mode,
      answer: answer,
      citations: mapped.citations,
      insufficientEvidence: insufficientEvidence,
      interactionId: parsed.interactionId,
      warnings: warnings
    };
  } catch (error) {
    var code = kspGetErrorCode_(error);
    if (context && context.auditSpreadsheetId) {
      kspTryAppendKnowledgeAudit_(environment, context.auditSpreadsheetId, kspBuildKnowledgeSearchAuditRow_({
        timestamp: environment.nowIso(), actor: actor, input: input, modelId: config ? config.modelId : '',
        result: KSP_AUDIT_RESULTS.FAILURE, errorCode: code, citations: [], provider: normalizedProvider
      }), warnings);
    }
    return {
      ok: false,
      workId: '0020',
      provider: normalizedProvider,
      mode: input.mode,
      error: { code: code, message: kspProviderSafeMessage_(code) || kspSafePublicErrorMessage_(code, 'SEARCH') },
      warnings: warnings
    };
  }
}

function kspGetProviderNeutralKnowledgeBootstrap_(environment) {
  try {
    var context = environment.loadAiContext();
    var settings = kspNormalizeAiSettings_(context.settings);
    var providers = {};
    [KSP_AI_PROVIDERS.OPENAI, KSP_AI_PROVIDERS.GEMINI].forEach(function (provider) {
      var config = typeof environment.getProviderConfig === 'function'
        ? environment.getProviderConfig(provider)
        : kspBuildAiProviderConfig_(settings, provider);
      providers[provider] = {
        enabled: Boolean(config.enabled),
        configured: Boolean(config.enabled && config.modelId && (config.vectorStoreId || config.storeName) &&
          (typeof environment.getProviderConfig !== 'function' || config.credentialConfigured))
      };
    });
    return {
      ok: true,
      workId: '0020',
      appVersion: '0.6.0',
      configured: true,
      providers: providers,
      routes: [
        { id: KSP_AI_ROUTES.CHATGPT, label: 'ChatGPT' },
        { id: KSP_AI_ROUTES.GEMINI, label: 'Gemini' },
        { id: KSP_AI_ROUTES.FULL_EXPORT, label: '全文出力' }
      ],
      implementedModes: KSP_FEATURE_FREEZE_MODE_ORDER.slice(),
      targetModes: KSP_FEATURE_FREEZE_MODE_ORDER.slice(),
      modeDefinitions: kspGetFeatureFreezeModeDefinitions_(),
      options: kspBuildKnowledgeSearchCatalog_(context.gpRows, context.optionRows),
      syncIntervalMinutes: settings.syncIntervalMinutes
    };
  } catch (error) {
    return { ok: false, workId: '0020', error: { code: kspGetErrorCode_(error), message: kspSafePublicErrorMessage_(kspGetErrorCode_(error), 'SEARCH') } };
  }
}

function kspProviderStatePatch_(environment, item, provider, patch) {
  if (typeof environment.updateAiProviderState === 'function') {
    return environment.updateAiProviderState(item.sourceType, item.sourceId, provider, patch);
  }
  var row = item.row || {};
  var state = kspBuildAiProviderStatePatch_(row, provider, patch);
  var rowPatch = { AI_Provider_State_JSON: kspSerializeAiProviderState_(state) };
  if (provider === KSP_AI_PROVIDERS.GEMINI) {
    rowPatch.AI_Document_Name = state.GEMINI.documentName;
    rowPatch.AI_Index_Status = state.GEMINI.status;
    rowPatch.AI_Indexed_At = state.GEMINI.indexedAt;
    rowPatch.AI_Content_Hash = state.GEMINI.contentHash;
    rowPatch.AI_Last_Error = state.GEMINI.lastError;
  }
  if (typeof environment.updateAiRow === 'function') return environment.updateAiRow(item.sourceType, item.sourceId, rowPatch);
  return rowPatch;
}

function kspBuildProviderSyncReport_(startedAt, settings) {
  return {
    workId: '0020', startedAt: startedAt, finishedAt: null, ok: true,
    syncEnabled: settings.syncEnabled, providers: {}, selected: 0, indexed: 0,
    reused: 0, unchanged: 0, removed: 0, failed: 0, skippedClaims: 0, items: [], errors: []
  };
}

function kspRunProviderNeutralAiSync_(environment, options) {
  var syncOptions = options || {};
  var force = Boolean(syncOptions.force);
  var startedAt = environment.nowIso();
  var context = environment.loadAiContext();
  if (environment.ensureAiSettings) environment.ensureAiSettings(kspGetAiSettingSeedRows_(startedAt));
  context = environment.loadAiContext();
  var settings = kspNormalizeAiSettings_(context.settings);
  var report = kspBuildProviderSyncReport_(startedAt, settings);
  report.forced = force;
  if (!settings.syncEnabled && !force) { report.finishedAt = environment.nowIso(); return report; }
  var providerList = [KSP_AI_PROVIDERS.OPENAI, KSP_AI_PROVIDERS.GEMINI];
  providerList.forEach(function (provider) {
    var config = typeof environment.getProviderConfig === 'function'
      ? environment.getProviderConfig(provider)
      : kspBuildAiProviderConfig_(settings, provider);
    report.providers[provider] = { enabled: Boolean(config.enabled), indexed: 0, failed: 0, status: config.enabled ? 'READY' : 'DISABLED_BY_CONFIG' };
    if (!config.enabled) return;
    try {
      kspProviderConfigurationError_(provider, config);
      var store = typeof environment.ensureProviderStore === 'function'
        ? environment.ensureProviderStore(provider, config) : null;
      var effectiveConfig = kspDeepClone_(config);
      if (provider === KSP_AI_PROVIDERS.GEMINI && store && store.name) effectiveConfig.storeName = store.name;
      var items = kspSelectProviderAiWorkItems_(
        context.meetingRows, context.pitchbookRows, startedAt, settings, provider
      );
      report.selected += items.length;
      report.providers[provider].selected = items.length;
      var maps = kspBuildAiMasterMaps_(context.gpRows, context.optionRows);
      items.forEach(function (item) {
        var claim = environment.claimAiSource ? environment.claimAiSource(item.sourceType, item.sourceId, startedAt, KSP_AI_DEFAULTS.CLAIM_TTL_MILLIS) : { token: '' };
        if (!claim) { report.skippedClaims += 1; return; }
        try {
          var docs = typeof environment.findProviderDocumentsBySource === 'function'
            ? environment.findProviderDocumentsBySource(provider, effectiveConfig, item.sourceType, item.sourceId) : [];
          if (String(item.row.Status) === KSP_STATUS.INACTIVE) {
            (docs || []).forEach(function (doc) { if (environment.deleteProviderDocument) environment.deleteProviderDocument(provider, effectiveConfig, doc); });
            kspProviderStatePatch_(environment, item, provider, { status: KSP_AI_INDEX_STATUS.NOT_INDEXED, documentName: '', providerDocumentId: '', indexedAt: '', contentHash: '', lastError: '' });
            report.removed += 1;
            return;
          }
          var source = kspBuildFeatureFreezeAiSource_(environment, item, maps);
          var providerState = kspGetAiProviderStateEntry_(item.row, provider);
          var matching = (docs || []).filter(function (doc) {
            var metadata = doc.attributes || doc.customMetadata || {};
            var documentId = String(doc.providerDocumentId || doc.fileId || '');
            return String(metadata.source_id || '') === item.sourceId &&
              providerState.contentHash === source.contentHash &&
              (!providerState.providerDocumentId || providerState.providerDocumentId === documentId);
          });
          if (matching.length) {
            matching.slice(1).forEach(function (doc) { if (environment.deleteProviderDocument) environment.deleteProviderDocument(provider, effectiveConfig, doc); });
            var selected = matching[0];
            kspProviderStatePatch_(environment, item, provider, {
              status: KSP_AI_INDEX_STATUS.INDEXED,
              documentName: String(selected.name || ''),
              providerDocumentId: String(selected.providerDocumentId || selected.fileId || ''),
              storeName: provider === KSP_AI_PROVIDERS.OPENAI ? effectiveConfig.vectorStoreId : effectiveConfig.storeName,
              indexedAt: environment.nowIso(), contentHash: source.contentHash, lastError: ''
            });
            report.unchanged += 1;
            return;
          }
          (docs || []).forEach(function (doc) { if (environment.deleteProviderDocument) environment.deleteProviderDocument(provider, effectiveConfig, doc); });
          var uploaded = environment.uploadProviderSource(provider, effectiveConfig, source);
          kspAssert_(uploaded && uploaded.name, 'AI_UPLOAD_DOCUMENT_MISSING', 'Provider upload did not return a document.');
          kspProviderStatePatch_(environment, item, provider, {
            status: KSP_AI_INDEX_STATUS.INDEXED,
            documentName: String(uploaded.name || ''),
            providerDocumentId: String(uploaded.providerDocumentId || uploaded.fileId || ''),
            storeName: provider === KSP_AI_PROVIDERS.OPENAI ? effectiveConfig.vectorStoreId : effectiveConfig.storeName,
            indexedAt: environment.nowIso(), contentHash: source.contentHash, lastError: ''
          });
          report.indexed += 1;
          report.providers[provider].indexed += 1;
        } catch (error) {
          report.failed += 1;
          report.providers[provider].failed += 1;
          report.items.push({ provider: provider, sourceType: item.sourceType, sourceId: item.sourceId, action: 'failed', code: kspGetErrorCode_(error) });
          try {
            kspProviderStatePatch_(environment, item, provider, {
              status: KSP_AI_INDEX_STATUS.FAILED, documentName: '', providerDocumentId: '', indexedAt: '', contentHash: '',
              lastError: kspBuildAiProviderLastError_(error,
                kspAiProviderLastError_(kspGetAiProviderStateEntry_(item.row, provider).lastError),
                settings, environment.nowIso())
            });
          } catch (stateError) {
            report.errors.push({ provider: provider, code: kspGetErrorCode_(stateError) });
          }
        } finally {
          if (environment.releaseAiSourceClaim) environment.releaseAiSourceClaim(item.sourceType, item.sourceId, claim.token);
        }
      });
      report.providers[provider].status = report.providers[provider].failed ? 'FAILED' : 'PASS';
    } catch (providerError) {
      report.providers[provider].status = 'FAILED';
      report.providers[provider].errorCode = kspGetErrorCode_(providerError);
      report.errors.push({ provider: provider, code: kspGetErrorCode_(providerError) });
    }
  });
  report.finishedAt = environment.nowIso();
  report.ok = report.errors.length === 0 && report.failed === 0;
  return report;
}
