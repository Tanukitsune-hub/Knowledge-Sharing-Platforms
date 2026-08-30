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
    if (!raw) return { attempt: 0, retryable: false, permanent: false, nextAttemptAt: '', code: '' };
    try { parsed = JSON.parse(raw); } catch (ignored) {
      return { attempt: 0, retryable: false, permanent: false, nextAttemptAt: '', code: '' };
    }
  }
  var source = parsed && typeof parsed === 'object' ? parsed : {};
  return {
    attempt: Number(source.attempt || 0) || 0,
    retryable: Boolean(source.retryable),
    permanent: Boolean(source.permanent),
    nextAttemptAt: kspAiTrim_(source.nextAttemptAt || source.next_attempt_at),
    code: kspAiTrim_(source.code)
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

function kspIsGeminiReadbackRecoveryEntry_(entry, provider) {
  var lastError = kspAiProviderLastError_(entry && entry.lastError);
  return provider === KSP_AI_PROVIDERS.GEMINI &&
    entry && entry.status === KSP_AI_INDEX_STATUS.FAILED &&
    lastError.code === 'AI_DOCUMENT_READBACK_FAILED' &&
    lastError.permanent === true && !entry.documentName && !entry.contentHash;
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
  if (kspIsGeminiReadbackRecoveryEntry_(entry, provider)) return true;
  if (lastError.permanent || !lastError.retryable ||
      lastError.attempt >= Number(settings.maxRetryAttempts || KSP_AI_DEFAULTS.MAX_RETRY_ATTEMPTS)) return false;
  return !lastError.nextAttemptAt ||
    kspTemporalInstantComparisonKey_(lastError.nextAttemptAt) <= kspTemporalInstantComparisonKey_(nowIso);
}

function kspNormalizeProviderAiSelection_(selection) {
  var sourceType = kspAiTrim_(selection && selection.sourceType);
  kspAssert_(!sourceType || sourceType === KSP_AI_SOURCE_TYPES.MEETING ||
    sourceType === KSP_AI_SOURCE_TYPES.PITCHBOOK,
    'AI_SYNC_SOURCE_TYPE_INVALID', 'AI sync source type is invalid.');
  return { sourceType: sourceType };
}

function kspSelectProviderAiWorkItems_(meetingRows, pitchbookRows, nowIso, settings, provider, selection) {
  var normalizedSelection = kspNormalizeProviderAiSelection_(selection);
  var items = [];
  if (!normalizedSelection.sourceType || normalizedSelection.sourceType === KSP_AI_SOURCE_TYPES.MEETING) {
    (meetingRows || []).forEach(function (row) {
      var item = kspAiWorkItemFromRow_(KSP_AI_SOURCE_TYPES.MEETING, row);
      if (kspIsProviderAiWorkEligible_(item, nowIso, settings, provider)) items.push(item);
    });
  }
  if (!normalizedSelection.sourceType || normalizedSelection.sourceType === KSP_AI_SOURCE_TYPES.PITCHBOOK) {
    (pitchbookRows || []).forEach(function (row) {
      var item = kspAiWorkItemFromRow_(KSP_AI_SOURCE_TYPES.PITCHBOOK, row);
      if (kspIsProviderAiWorkEligible_(item, nowIso, settings, provider)) items.push(item);
    });
  }
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
    queryTransport: KSP_AI_DEFAULTS.QUERY_TRANSPORT,
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
  add('content_hash', value.contentHash);
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
  var route = kspAiTrim_(source.route || source.provider).toUpperCase() || KSP_AI_ROUTES.OPENAI;
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
    metadataFilter: kspBuildMetadataFilter_(value),
    queryTransport: config.queryTransport || KSP_AI_QUERY_TRANSPORTS.INTERACTIONS,
    background: true,
    generation_config: {
      thinking_level: KSP_AI_DEFAULTS.QUERY_THINKING_LEVEL,
      max_output_tokens: KSP_AI_DEFAULTS.QUERY_MAX_OUTPUT_TOKENS
    }
  };
}

function kspProviderCitationMetadata_(citation) {
  var source = citation || {};
  var metadata = source.metadata || source.attributes || source.customMetadata || {};
  return kspMetadataArrayToMap_(metadata);
}

function kspOpenAiMetadataAgreement_(left, right) {
  var leftMetadata = kspMetadataArrayToMap_(left || {});
  var rightMetadata = kspMetadataArrayToMap_(right || {});
  return Object.keys(leftMetadata).every(function (key) {
    if (!Object.prototype.hasOwnProperty.call(rightMetadata, key)) return true;
    var leftValue = kspAiTrim_(leftMetadata[key]);
    var rightValue = kspAiTrim_(rightMetadata[key]);
    return !leftValue || !rightValue || leftValue === rightValue;
  });
}

function kspOpenAiCitationIdentity_(metadata) {
  var normalized = kspMetadataArrayToMap_(metadata || {});
  var sourceType = kspAiTrim_(normalized.source_type);
  var sourceId = kspAiTrim_(normalized.source_id);
  var contentHash = kspAiTrim_(normalized.content_hash);
  return {
    metadata: normalized,
    sourceType: sourceType,
    sourceId: sourceId,
    contentHash: contentHash,
    key: sourceType + '|' + sourceId + '|' + contentHash,
    complete: Boolean(sourceType && sourceId && contentHash)
  };
}

function kspNormalizeOpenAiResponse_(response) {
  var value = response || {};
  var answerParts = [];
  var citations = [];
  var normalizationWarnings = [];
  var warningSeen = {};
  var resultByFileId = {};
  var sourceFileIds = {};
  var ambiguousSourceKeys = {};
  var annotations = [];

  function warn(code) {
    if (warningSeen[code]) return;
    warningSeen[code] = true;
    normalizationWarnings.push({ code: code, message: 'OpenAI citation identity was excluded.' });
  }

  function registerSourceFile(identity, fileId) {
    if (!identity.complete) return;
    var ids = sourceFileIds[identity.key] || [];
    if (ids.indexOf(fileId) === -1) ids.push(fileId);
    sourceFileIds[identity.key] = ids;
    if (ids.length > 1) {
      ambiguousSourceKeys[identity.key] = true;
      warn('OPENAI_CITATION_IDENTITY_AMBIGUOUS');
    }
  }

  (value.output || []).forEach(function (item) {
    if (!item) return;
    if (String(item.type) === 'file_search_call') {
      if (kspAiTrim_(item.status).toLowerCase() !== 'completed') return;
      (item.results || item.search_results || []).forEach(function (result) {
        var fileId = kspAiTrim_(result && (result.file_id || result.fileId));
        if (!fileId) {
          warn('OPENAI_CITATION_IDENTITY_INVALID');
          return;
        }
        var metadata = kspProviderCitationMetadata_(result);
        var identity = kspOpenAiCitationIdentity_(metadata);
        var record = resultByFileId[fileId];
        if (!record) {
          resultByFileId[fileId] = {
            fileId: fileId,
            fileName: kspAiTrim_(result.filename || result.file_name || result.fileName),
            metadata: metadata,
            identity: identity,
            ambiguous: !identity.complete
          };
        } else if (!identity.complete || !record.identity.complete ||
            !kspOpenAiMetadataAgreement_(record.metadata, metadata) ||
            record.identity.key !== identity.key) {
          record.ambiguous = true;
          warn('OPENAI_CITATION_IDENTITY_CONFLICT');
        }
        registerSourceFile(identity, fileId);
      });
    }
    if (String(item.type) !== 'message') return;
    (item.content || []).forEach(function (block) {
      if (!block) return;
      if (block.text !== undefined && block.text !== null) answerParts.push(String(block.text));
      (block.annotations || []).forEach(function (annotation) {
        if (!annotation || (annotation.type && String(annotation.type) !== 'file_citation')) return;
        annotations.push(annotation);
      });
    });
  });
  var outputText = value.output_text;
  if (!answerParts.length && outputText) answerParts.push(String(outputText));

  var seen = {};
  var blockedFileIds = {};

  function addCitation(citation, identity, provenance) {
    if (!identity.complete || ambiguousSourceKeys[identity.key]) return;
    var key = provenance + '|' + citation.source + '|' + identity.key + '|' + String(citation.pageNumber || '');
    if (seen[key]) return;
    seen[key] = true;
    citation.metadata = identity.metadata;
    citations.push(citation);
  }

  annotations.forEach(function (annotation) {
    var fileId = kspAiTrim_(annotation.file_id || annotation.fileId);
    if (!fileId) {
      warn('OPENAI_CITATION_IDENTITY_INVALID');
      return;
    }
    var record = resultByFileId[fileId];
    var annotationMetadata = kspProviderCitationMetadata_(annotation);
    if (record && record.ambiguous) {
      blockedFileIds[fileId] = true;
      warn('OPENAI_CITATION_IDENTITY_AMBIGUOUS');
      return;
    }
    if (record && !kspOpenAiMetadataAgreement_(annotationMetadata, record.metadata)) {
      blockedFileIds[fileId] = true;
      warn('OPENAI_CITATION_IDENTITY_CONFLICT');
      return;
    }
    var mergedMetadata = {};
    Object.keys(record ? record.metadata : {}).forEach(function (key) { mergedMetadata[key] = record.metadata[key]; });
    Object.keys(annotationMetadata).forEach(function (key) { mergedMetadata[key] = annotationMetadata[key]; });
    var identity = kspOpenAiCitationIdentity_(mergedMetadata);
    if (!identity.complete) {
      blockedFileIds[fileId] = true;
      warn('OPENAI_CITATION_IDENTITY_INVALID');
      return;
    }
    if (record && record.identity.key !== identity.key) {
      blockedFileIds[fileId] = true;
      warn('OPENAI_CITATION_IDENTITY_CONFLICT');
      return;
    }
    addCitation({
      type: 'file_citation',
      provenance: 'INLINE_CITATION',
      fileName: kspAiTrim_(annotation.filename || annotation.file_name || annotation.fileName || (record && record.fileName)),
      source: fileId,
      pageNumber: Number(annotation.page_number || annotation.pageNumber || 0) || null,
      metadata: identity.metadata
    }, identity, 'INLINE_CITATION');
  });

  Object.keys(resultByFileId).forEach(function (fileId) {
    var record = resultByFileId[fileId];
    if (!record || record.ambiguous || blockedFileIds[fileId] || !record.identity.complete) return;
    addCitation({
      type: 'retrieved_source',
      provenance: 'RETRIEVED_SOURCE',
      fileName: record.fileName,
      source: fileId,
      pageNumber: null,
      metadata: record.identity.metadata
    }, record.identity, 'RETRIEVED_SOURCE');
  });

  return {
    answer: answerParts.join('\n').trim(),
    citations: citations,
    interactionId: kspAiTrim_(value.id),
    rawStatus: kspAiTrim_(value.status),
    warnings: normalizationWarnings
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
  base.readProviderDocument = function (provider, config, documentValue, source) {
    if (provider === KSP_AI_PROVIDERS.GEMINI) {
      return kspReadAndVerifyFileSearchDocumentLive_(documentValue.name, source);
    }
    return documentValue;
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
    if (provider === KSP_AI_PROVIDERS.OPENAI) return kspOpenAiQueryFileSearchLive_(request);
    if (config && config.queryTransport === KSP_AI_QUERY_TRANSPORTS.GENERATE_CONTENT) {
      return kspGeminiGenerateContentLive_(request);
    }
    var lifecycle = base.startQueryFileSearch(kspBuildFeatureFreezeInteractionRequest_(request));
    kspAssert_(lifecycle && lifecycle.status === 'completed', 'AI_QUERY_ASYNC_REQUIRED',
      'Gemini検索は後続の確認が必要です。');
    return lifecycle.response;
  };
  base.startQueryProvider = function (provider, config, request) {
    return provider === KSP_AI_PROVIDERS.OPENAI
      ? { status: 'completed', response: kspOpenAiQueryFileSearchLive_(request) }
      : config && config.queryTransport === KSP_AI_QUERY_TRANSPORTS.GENERATE_CONTENT
        ? { status: 'completed', response: kspGeminiGenerateContentLive_(request) }
      : base.startQueryFileSearch(kspBuildFeatureFreezeInteractionRequest_(request));
  };
  base.pollQueryProvider = function (provider, config, interactionId) {
    kspAssert_(provider === KSP_AI_PROVIDERS.GEMINI, 'AI_QUERY_RESPONSE_INVALID', '検索状態を確認できませんでした。');
    return base.pollQueryFileSearch(interactionId);
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
    AI_QUERY_HTTP_FAILED: 'Gemini検索サービスを利用できません。',
    AI_QUERY_RESPONSE_INVALID: 'Gemini検索結果を確認できませんでした。',
    AI_QUERY_PROVIDER_TERMINAL: 'Gemini検索が完了できない状態になりました。',
    AI_QUERY_ASYNC_REQUIRED: 'Gemini検索は後続の確認が必要です。',
    AI_QUERY_TOKEN_INVALID: '検索状態を確認できませんでした。',
    AI_QUERY_TOKEN_EXPIRED: '検索状態の有効期限が切れています。',
    AI_QUERY_STATE_UNAVAILABLE: '検索状態を保存できませんでした。',
    AI_DOCUMENT_READBACK_FAILED: 'Gemini検索用Documentを確認できませんでした。',
    AI_PROVIDER_INVALID: '検索プロバイダが不正です。'
  };
  return messages[String(code || '')] || '';
}

function kspKnowledgeQueryPhase_(rawInput) {
  var input = rawInput && typeof rawInput === 'object' ? rawInput : {};
  kspAssert_(!kspAiTrim_(input.interactionId),
    'AI_QUERY_RESPONSE_INVALID', '検索状態を確認できませんでした。');
  var explicit = kspAiTrim_(input.queryPhase || input.queryAction || input.lifecycle).toUpperCase();
  var phase = explicit || (kspAiTrim_(input.queryToken) ? 'POLL' : 'START');
  kspAssert_(phase === 'START' || phase === 'POLL', 'AI_QUERY_RESPONSE_INVALID', '検索状態を確認できませんでした。');
  return phase;
}

function kspKnowledgeQueryCacheKey_(actor, token) {
  return kspBuildPublicOperationCacheKey_('KNOWLEDGE_QUERY_PENDING', actor, token);
}

function kspKnowledgeQueryDedupeKey_(actor, fingerprint) {
  return kspBuildPublicOperationCacheKey_('KNOWLEDGE_QUERY_DEDUPE', actor, fingerprint);
}

function kspCreateKnowledgeQueryToken_() {
  kspAssert_(typeof Utilities !== 'undefined' && Utilities && typeof Utilities.getUuid === 'function',
    'AI_QUERY_STATE_UNAVAILABLE', '検索状態を保存できませんでした。');
  var token = kspAiTrim_(Utilities.getUuid());
  kspAssert_(token && token.length <= 128, 'AI_QUERY_STATE_UNAVAILABLE', '検索状態を保存できませんでした。');
  return token;
}

function kspKnowledgeQueryKnownTerminalStatus_(status) {
  return ['failed', 'cancelled', 'requires_action', 'incomplete', 'budget_exceeded']
    .indexOf(String(status || '').toLowerCase()) !== -1;
}

function kspKnowledgeQueryPendingStatus_(status) {
  return status === 'queued' || status === 'in_progress';
}

function kspKnowledgeQueryPollDelayMillis_(pollCount) {
  var count = Math.max(0, Number(pollCount || 0));
  return Math.min(30000, Math.max(1000, 1000 * Math.pow(2, Math.min(4, count))));
}

function kspKnowledgeQueryNowMillis_(environment) {
  var value = typeof environment.nowIso === 'function' ? environment.nowIso() : new Date().toISOString();
  var millis = Date.parse(String(value || ''));
  return Number.isFinite(millis) ? millis : Date.now();
}

function kspKnowledgeQueryElapsedMillis_(environment, state) {
  var startedMillis = Date.parse(String(state && (state.startedAt || state.createdAt) || ''));
  return Number.isFinite(startedMillis)
    ? Math.max(0, kspKnowledgeQueryNowMillis_(environment) - startedMillis)
    : 0;
}

function kspKnowledgeQueryExpires_(environment, state) {
  var expiresAt = Date.parse(String(state && state.expiresAt || ''));
  if (!Number.isFinite(expiresAt)) return false;
  var nowValue = typeof environment.nowIso === 'function' ? environment.nowIso() : new Date().toISOString();
  var now = Date.parse(String(nowValue || ''));
  return Number.isFinite(now) && now >= expiresAt;
}

function kspKnowledgeQueryInputForState_(input) {
  var value = input || {};
  return {
    mode: kspAiTrim_(value.mode),
    dateFrom: kspAiTrim_(value.dateFrom),
    dateTo: kspAiTrim_(value.dateTo),
    gpId: kspAiTrim_(value.gpId),
    assetClassId: kspAiTrim_(value.assetClassId),
    capitalTypeId: kspAiTrim_(value.capitalTypeId),
    sourceType: kspAiTrim_(value.sourceType)
  };
}

function kspKnowledgeQueryQuestionHash_(question) {
  var value = String(question || '');
  return typeof kspAiHashTextFallback_ === 'function'
    ? kspAiHashTextFallback_(value)
    : kspPublicOperationHash_(value) + '-' + value.length;
}

function kspKnowledgeQueryFingerprint_(provider, config, input) {
  var value = input || {};
  var payload = {
    provider: provider,
    model: kspAiTrim_(config && config.modelId),
    profile: KSP_AI_DEFAULTS.QUERY_REQUEST_PROFILE_VERSION,
    mode: kspAiTrim_(value.mode),
    dateFrom: kspAiTrim_(value.dateFrom),
    dateTo: kspAiTrim_(value.dateTo),
    gpId: kspAiTrim_(value.gpId),
    assetClassId: kspAiTrim_(value.assetClassId),
    capitalTypeId: kspAiTrim_(value.capitalTypeId),
    sourceType: kspAiTrim_(value.sourceType),
    questionHash: kspKnowledgeQueryQuestionHash_(value.questionOrInstruction)
  };
  var serialized = JSON.stringify(payload);
  return typeof kspAiHashTextFallback_ === 'function'
    ? kspAiHashTextFallback_(serialized)
    : kspPublicOperationHash_(serialized);
}

function kspKnowledgeQueryReadCache_(environment, cacheKey) {
  if (!environment || typeof environment.getPublicIdempotency !== 'function') return null;
  try {
    return environment.getPublicIdempotency(cacheKey);
  } catch (ignored) {
    return null;
  }
}

function kspKnowledgeQueryWriteCache_(environment, cacheKey, value, expirationSeconds) {
  kspAssert_(environment && typeof environment.setPublicIdempotency === 'function',
    'AI_QUERY_STATE_UNAVAILABLE', '検索状態を保存できませんでした。');
  environment.setPublicIdempotency(cacheKey, value, expirationSeconds);
}

function kspKnowledgeQueryPendingState_(environment, actor, provider, token, fingerprint, lifecycle, input, config, startedAt, startLatencyMs) {
  var createdMillis = Date.parse(String(startedAt || ''));
  var expiresAt = Number.isFinite(createdMillis)
    ? new Date(createdMillis + KSP_AI_DEFAULTS.QUERY_PENDING_TTL_SECONDS * 1000).toISOString()
    : '';
  var status = kspAiTrim_(lifecycle && lifecycle.status).toLowerCase();
  var state = {
    schemaVersion: 2,
    kind: 'PENDING',
    actor: actor,
    provider: provider,
    tokenFingerprint: typeof kspAiHashTextFallback_ === 'function'
      ? kspAiHashTextFallback_(token)
      : kspPublicOperationHash_(token),
    requestFingerprint: fingerprint,
    interactionId: String(lifecycle.interactionId),
    input: kspKnowledgeQueryInputForState_(input),
    questionHash: kspKnowledgeQueryQuestionHash_(input.questionOrInstruction),
    modelId: kspAiTrim_(config && config.modelId),
    requestProfileVersion: KSP_AI_DEFAULTS.QUERY_REQUEST_PROFILE_VERSION,
    providerStatus: kspKnowledgeQueryPendingStatus_(status) ? status : 'in_progress',
    createdAt: startedAt,
    startedAt: startedAt,
    expiresAt: expiresAt,
    startLatencyMs: Math.max(0, Number(startLatencyMs) || 0),
    pollCount: 0,
    maxPollLatencyMs: 0
  };
  kspKnowledgeQueryWriteCache_(environment, kspKnowledgeQueryCacheKey_(actor, token), state,
    KSP_AI_DEFAULTS.QUERY_PENDING_TTL_SECONDS);
  kspKnowledgeQueryWriteCache_(environment, kspKnowledgeQueryDedupeKey_(actor, fingerprint), {
    schemaVersion: 1,
    kind: 'PENDING_POINTER',
    actor: actor,
    provider: provider,
    requestFingerprint: fingerprint,
    token: token
  }, KSP_AI_DEFAULTS.QUERY_PENDING_TTL_SECONDS);
  return state;
}

function kspKnowledgeQueryPendingResult_(provider, mode, token, warnings, state, environment) {
  var pollCount = Number(state && state.pollCount || 0);
  var elapsedMillis = state && environment ? kspKnowledgeQueryElapsedMillis_(environment, state) :
    Math.max(0, Number(state && state.elapsedMillis || 0));
  return {
    ok: true, workId: '0020', provider: provider, mode: mode,
    status: 'pending', pending: true, queryToken: token,
    pollAfterMillis: kspKnowledgeQueryPollDelayMillis_(pollCount),
    pollCount: pollCount,
    elapsedMillis: elapsedMillis,
    longRunning: elapsedMillis >= 60000,
    warnings: warnings || []
  };
}

function kspKnowledgeQueryFailureResult_(provider, mode, error, warnings, pending, token) {
  var code = kspGetErrorCode_(error);
  if (pending) {
    return {
      ok: true, workId: '0020', provider: provider, mode: mode,
      status: 'pending', pending: true, queryToken: token,
      pollAfterMillis: KSP_AI_DEFAULTS.INTERACTION_POLL_MILLIS,
      warnings: (warnings || []).concat([{ code: 'AI_QUERY_POLL_PENDING', message: '検索状態を確認できないため、再確認できます。' }])
    };
  }
  var result = {
    ok: false, workId: '0020', provider: provider, mode: mode,
    status: 'failed',
    error: { code: code, message: kspProviderSafeMessage_(code) || kspSafePublicErrorMessage_(code, 'SEARCH') },
    warnings: warnings || []
  };
  var terminalStatus = kspAiTrim_(error && error.providerStatus).toLowerCase();
  if (kspKnowledgeQueryKnownTerminalStatus_(terminalStatus)) {
    result.terminalStatus = terminalStatus;
  }
  return result;
}

function kspAppendKnowledgeQueryAuditOnce_(environment, actor, token, auditSpreadsheetId, row, warnings) {
  if (token && typeof environment.claimPublicOperation === 'function' &&
      !kspClaimPublicOperation_(environment, 'KNOWLEDGE_QUERY_AUDIT', actor, token,
        KSP_AI_DEFAULTS.QUERY_TERMINAL_TTL_SECONDS)) return;
  kspTryAppendKnowledgeAudit_(environment, auditSpreadsheetId, row, warnings);
}

function kspKnowledgeQueryAuditTargetId_(token) {
  var value = kspAiTrim_(token);
  return value ? 'AIQ-' + kspPublicOperationHash_(value) : '';
}

function kspBuildSafeKnowledgeQueryTelemetry_(state, providerStatus, response, extra) {
  var options = extra || {};
  var output = {
    request_profile_version: KSP_AI_DEFAULTS.QUERY_REQUEST_PROFILE_VERSION,
    thinking_level: KSP_AI_DEFAULTS.QUERY_THINKING_LEVEL,
    max_output_tokens: KSP_AI_DEFAULTS.QUERY_MAX_OUTPUT_TOKENS
  };
  var queryTransport = kspAiTrim_(options.queryTransport || (state && state.queryTransport));
  if (queryTransport === KSP_AI_QUERY_TRANSPORTS.GENERATE_CONTENT ||
      queryTransport === KSP_AI_QUERY_TRANSPORTS.INTERACTIONS) {
    output.query_transport = queryTransport;
    output.query_transport_version = queryTransport === KSP_AI_QUERY_TRANSPORTS.GENERATE_CONTENT
      ? KSP_AI_DEFAULTS.QUERY_TRANSPORT_VERSION
      : KSP_AI_DEFAULTS.INTERACTIONS_API_REVISION;
  }
  var safeStatuses = ['queued', 'in_progress', 'completed', 'failed', 'cancelled',
    'requires_action', 'incomplete', 'budget_exceeded'];
  var status = kspAiTrim_(providerStatus).toLowerCase();
  if (safeStatuses.indexOf(status) !== -1) output.provider_status = status;
  function safeNumber(value) {
    var numberValue = Number(value);
    return Number.isFinite(numberValue) && numberValue >= 0 ? Math.floor(numberValue) : null;
  }
  function firstNumber(source, names) {
    var value = source || {};
    for (var index = 0; index < names.length; index += 1) {
      var numberValue = safeNumber(value[names[index]]);
      if (numberValue !== null) return numberValue;
    }
    return null;
  }
  var current = state || {};
  var usage = response && (response.usage || response.usageMetadata) || {};
  var startLatency = safeNumber(options.startLatencyMs !== undefined ? options.startLatencyMs : current.startLatencyMs);
  var pollCount = safeNumber(options.pollCount !== undefined ? options.pollCount : current.pollCount);
  var maxPollLatency = safeNumber(options.maxPollLatencyMs !== undefined ? options.maxPollLatencyMs : current.maxPollLatencyMs);
  var startedMillis = Date.parse(String(current.startedAt || current.createdAt || ''));
  var providerElapsed = safeNumber(options.providerElapsedMs);
  if (providerElapsed === null && Number.isFinite(startedMillis)) providerElapsed = Math.max(0, Date.now() - startedMillis);
  if (startLatency !== null) output.start_latency_ms = startLatency;
  if (pollCount !== null) output.poll_count = pollCount;
  if (maxPollLatency !== null) output.max_poll_latency_ms = maxPollLatency;
  if (providerElapsed !== null) output.provider_elapsed_ms = providerElapsed;
  var usageFields = {
    input_tokens: ['input_tokens', 'inputTokens', 'prompt_token_count', 'promptTokenCount'],
    output_tokens: ['output_tokens', 'outputTokens', 'candidates_token_count', 'candidatesTokenCount'],
    thought_tokens: ['thought_tokens', 'thoughtTokens', 'thoughts_token_count', 'thoughtsTokenCount'],
    tool_use_tokens: ['tool_use_tokens', 'toolUseTokens', 'tool_use_token_count', 'toolUseTokenCount',
      'tool_use_prompt_token_count', 'toolUsePromptTokenCount'],
    cached_tokens: ['cached_tokens', 'cachedTokens', 'cached_content_token_count', 'cachedContentTokenCount']
  };
  Object.keys(usageFields).forEach(function (key) {
    var numberValue = firstNumber(usage, usageFields[key]);
    if (numberValue !== null) output[key] = numberValue;
  });
  var providerHttpStatus = safeNumber(response && response.__kspHttpStatus);
  if (providerHttpStatus !== null && providerHttpStatus >= 100 && providerHttpStatus <= 599) {
    output.provider_http_status = providerHttpStatus;
  }
  var finishReason = response && response.candidates && response.candidates[0]
    ? kspAiTrim_(response.candidates[0].finishReason || response.candidates[0].finish_reason)
    : '';
  if (/^[A-Z][A-Z0-9_]{0,63}$/.test(finishReason)) output.finish_reason = finishReason;
  if (queryTransport === KSP_AI_QUERY_TRANSPORTS.GENERATE_CONTENT && startLatency !== null) {
    output.server_latency_ms = startLatency;
  }
  return output;
}

function kspBuildSafeKnowledgeQueryTelemetryJson_(telemetry) {
  if (!telemetry || typeof telemetry !== 'object') return '';
  return JSON.stringify(kspBuildSafeKnowledgeQueryTelemetry_(
    telemetry.state, telemetry.providerStatus, telemetry.response, telemetry
  ));
}

function kspBuildProviderKnowledgeSearchSuccess_(environment, provider, input, config, context, actor, rawResponse, warnings, auditToken, telemetry) {
  var parsed = provider === KSP_AI_PROVIDERS.OPENAI
    ? kspNormalizeOpenAiResponse_(rawResponse)
    : config && config.queryTransport === KSP_AI_QUERY_TRANSPORTS.GENERATE_CONTENT
      ? kspNormalizeGeminiGenerateContentResponse_(rawResponse)
      : kspParseInteractionResponse_(rawResponse);
  var mapped = kspMapKnowledgeCitations_(parsed.citations,
    kspBuildAuthoritativeSourceMaps_(context.meetingRows, context.pitchbookRows));
  var allWarnings = (warnings || []).concat(parsed.warnings || [], mapped.warnings);
  var answer = parsed.answer || '確認できる根拠が不足しています。';
  var insufficientEvidence = !parsed.answer || mapped.citations.length === 0;
  if (insufficientEvidence) allWarnings.push({ code: 'AI_INSUFFICIENT_EVIDENCE', message: '回答または authoritative citation が不足しています。' });
  kspAppendKnowledgeQueryAuditOnce_(environment, actor, auditToken, context.auditSpreadsheetId, kspBuildKnowledgeSearchAuditRow_({
    timestamp: environment.nowIso(), actor: actor, input: input, modelId: config.modelId,
    interactionId: kspKnowledgeQueryAuditTargetId_(auditToken), result: KSP_AUDIT_RESULTS.SUCCESS, citations: mapped.citations,
    provider: provider, telemetry: telemetry
  }), allWarnings);
  return {
    result: {
      ok: true, workId: '0020', provider: provider, mode: input.mode, status: 'completed',
      answer: answer, citations: mapped.citations, insufficientEvidence: insufficientEvidence,
      warnings: allWarnings
    },
    interactionId: parsed.interactionId
  };
}

function kspStoreKnowledgeQueryTerminal_(environment, actor, token, provider, result) {
  kspAssert_(typeof environment.setPublicIdempotency === 'function',
    'AI_QUERY_STATE_UNAVAILABLE', '検索状態を保存できませんでした。');
  environment.setPublicIdempotency(kspKnowledgeQueryCacheKey_(actor, token), {
    schemaVersion: 2, kind: 'TERMINAL', actor: actor, provider: provider,
    result: kspDeepClone_(result)
  }, KSP_AI_DEFAULTS.QUERY_TERMINAL_TTL_SECONDS);
}

function kspRunProviderKnowledgeSearchStart_(environment, normalizedProvider, rawInput) {
  var warnings = [];
  var actor = kspGetAiActorSafely_(environment, warnings);
  var context = null;
  var config = null;
  var input = kspNormalizeFeatureFreezeSearchInput_(rawInput);
  var startedAt = typeof environment.nowIso === 'function' ? environment.nowIso() : new Date().toISOString();
  var startClock = Date.now();
  try {
    kspAssert_(normalizedProvider, 'AI_PROVIDER_INVALID', 'AI provider is invalid.');
    input = kspValidateFeatureFreezeSearchInput_(input);
    context = environment.loadAiContext();
    config = typeof environment.getProviderConfig === 'function'
      ? environment.getProviderConfig(normalizedProvider)
      : kspBuildAiProviderConfig_(kspNormalizeAiSettings_(context.settings), normalizedProvider);
    if (typeof environment.getProviderConfig !== 'function') config.credentialConfigured = true;
    kspProviderConfigurationError_(normalizedProvider, config);
    var catalog = kspBuildKnowledgeSearchCatalog_(context.gpRows, context.optionRows);
    kspValidateKnowledgeFilterIds_(input, catalog);
    var fingerprint = kspKnowledgeQueryFingerprint_(normalizedProvider, config, input);
    var pointer = kspKnowledgeQueryReadCache_(environment, kspKnowledgeQueryDedupeKey_(actor, fingerprint));
    if (pointer && pointer.kind === 'PENDING_POINTER' && pointer.actor === actor &&
        pointer.provider === normalizedProvider && pointer.requestFingerprint === fingerprint && pointer.token) {
      var existingState = kspKnowledgeQueryReadCache_(environment, kspKnowledgeQueryCacheKey_(actor, pointer.token));
      if (existingState && existingState.kind === 'PENDING' &&
          existingState.actor === actor && existingState.provider === normalizedProvider &&
          existingState.requestFingerprint === fingerprint && !kspKnowledgeQueryExpires_(environment, existingState)) {
        return kspKnowledgeQueryPendingResult_(normalizedProvider, existingState.input.mode, pointer.token, warnings, existingState, environment);
      }
    }
    kspAssert_(kspClaimPublicOperation_(environment, 'KNOWLEDGE_SEARCH_' + normalizedProvider, actor, fingerprint, 2),
      'AI_RATE_LIMITED', '検索が集中しています。少し待って再試行してください。');
    var request = kspBuildProviderSearchRequest_(normalizedProvider, config, input);
    var lifecycle = typeof environment.startQueryProvider === 'function'
      ? environment.startQueryProvider(normalizedProvider, config, request)
      : {
        status: 'completed',
        response: typeof environment.queryProvider === 'function'
          ? environment.queryProvider(normalizedProvider, config, request)
          : environment.queryFileSearch(request)
      };
    if (!lifecycle || lifecycle.status === undefined ||
      (lifecycle.status === 'completed' && lifecycle.response === undefined && lifecycle.interactionId === undefined)) {
      lifecycle = { status: 'completed', response: lifecycle };
    }
    var lifecycleStatus = kspAiTrim_(lifecycle.status).toLowerCase();
    if (lifecycleStatus === 'completed') {
      return kspBuildProviderKnowledgeSearchSuccess_(environment, normalizedProvider, input, config, context, actor,
        lifecycle.response || lifecycle, warnings, '',
        { state: { startedAt: startedAt, startLatencyMs: Math.max(0, Date.now() - startClock), pollCount: 0, maxPollLatencyMs: 0 },
          providerStatus: 'completed', response: lifecycle.response || lifecycle,
          startLatencyMs: Math.max(0, Date.now() - startClock), pollCount: 0, maxPollLatencyMs: 0,
          queryTransport: config.queryTransport || KSP_AI_QUERY_TRANSPORTS.INTERACTIONS }).result;
    }
    if (kspKnowledgeQueryKnownTerminalStatus_(lifecycleStatus)) {
      var startTerminal = new Error('Gemini検索が完了できない状態になりました。');
      startTerminal.code = 'AI_QUERY_PROVIDER_TERMINAL';
      startTerminal.providerStatus = lifecycleStatus;
      startTerminal.queryTerminal = true;
      throw startTerminal;
    }
    kspAssert_(normalizedProvider === KSP_AI_PROVIDERS.GEMINI && kspKnowledgeQueryPendingStatus_(lifecycleStatus),
      'AI_QUERY_RESPONSE_INVALID', 'Gemini検索結果を確認できませんでした。');
    kspAssert_(lifecycle.interactionId, 'AI_QUERY_RESPONSE_INVALID', 'Gemini検索結果を確認できませんでした。');
    kspAssert_(typeof environment.getPublicIdempotency === 'function' && typeof environment.setPublicIdempotency === 'function',
      'AI_QUERY_STATE_UNAVAILABLE', '検索状態を保存できませんでした。');
    var token = kspCreateKnowledgeQueryToken_();
    var pendingState = kspKnowledgeQueryPendingState_(environment, actor, normalizedProvider, token, fingerprint,
      lifecycle, input, config, startedAt, Math.max(0, Date.now() - startClock));
    return kspKnowledgeQueryPendingResult_(normalizedProvider, input.mode, token, warnings, pendingState, environment);
  } catch (error) {
    var code = kspGetErrorCode_(error);
    if (context && context.auditSpreadsheetId) {
      kspTryAppendKnowledgeAudit_(environment, context.auditSpreadsheetId, kspBuildKnowledgeSearchAuditRow_({
        timestamp: environment.nowIso(), actor: actor, input: input, modelId: config ? config.modelId : '',
        result: KSP_AUDIT_RESULTS.FAILURE, errorCode: code, citations: [], provider: normalizedProvider
      }), warnings);
    }
    return kspKnowledgeQueryFailureResult_(normalizedProvider, input.mode, error, warnings, false, '');
  }
}

function kspRunProviderKnowledgeSearchPoll_(environment, requestedProvider, rawInput) {
  var warnings = [];
  var actor = kspGetAiActorSafely_(environment, warnings);
  var token = kspAiTrim_(rawInput && rawInput.queryToken);
  var input = kspNormalizeFeatureFreezeSearchInput_(rawInput);
  if (!token || token.length > 128) {
    return kspKnowledgeQueryFailureResult_(requestedProvider, input.mode,
      { code: 'AI_QUERY_TOKEN_INVALID' }, warnings, false, '');
  }
  var state = null;
  try {
    kspAssert_(typeof environment.getPublicIdempotency === 'function',
      'AI_QUERY_STATE_UNAVAILABLE', '検索状態を確認できませんでした。');
    state = environment.getPublicIdempotency(kspKnowledgeQueryCacheKey_(actor, token));
  } catch (error) {
    return kspKnowledgeQueryFailureResult_(requestedProvider, input.mode,
      { code: 'AI_QUERY_TOKEN_INVALID' }, warnings, false, '');
  }
  if (!state || typeof state !== 'object') {
    return kspKnowledgeQueryFailureResult_(requestedProvider, input.mode,
      { code: 'AI_QUERY_TOKEN_EXPIRED' }, warnings, false, '');
  }
  if (state.kind === 'PENDING' && kspKnowledgeQueryExpires_(environment, state)) {
    kspKnowledgeQueryWriteCache_(environment, kspKnowledgeQueryCacheKey_(actor, token), {
      schemaVersion: 1, kind: 'EXPIRED', actor: actor, provider: requestedProvider
    }, 1);
    return kspKnowledgeQueryFailureResult_(requestedProvider, input.mode,
      { code: 'AI_QUERY_TOKEN_EXPIRED' }, warnings, false, '');
  }
  if (state.actor !== actor || state.provider !== requestedProvider) {
    return kspKnowledgeQueryFailureResult_(requestedProvider, input.mode,
      { code: 'AI_QUERY_TOKEN_INVALID' }, warnings, false, '');
  }
  if (state.kind === 'TERMINAL' && state.result) {
    var replay = kspDeepClone_(state.result);
    replay.idempotentReplay = true;
    return replay;
  }
  if (state.kind !== 'PENDING' || !state.interactionId || !state.input || !state.requestFingerprint) {
    return kspKnowledgeQueryFailureResult_(requestedProvider, input.mode,
      { code: 'AI_QUERY_TOKEN_INVALID' }, warnings, false, '');
  }

  var context = null;
  var config = null;
  try {
    context = environment.loadAiContext();
    config = typeof environment.getProviderConfig === 'function'
      ? environment.getProviderConfig(requestedProvider)
      : kspBuildAiProviderConfig_(kspNormalizeAiSettings_(context.settings), requestedProvider);
    if (typeof environment.getProviderConfig !== 'function') config.credentialConfigured = true;
    kspProviderConfigurationError_(requestedProvider, config);
    kspAssert_(typeof environment.pollQueryProvider === 'function',
      'AI_QUERY_STATE_UNAVAILABLE', '検索状態を確認できませんでした。');
    var pollStarted = Date.now();
    var lifecycle = environment.pollQueryProvider(requestedProvider, config, String(state.interactionId));
    var pollLatency = Math.max(0, Date.now() - pollStarted);
    if (!lifecycle || lifecycle.status === undefined) lifecycle = { status: 'completed', response: lifecycle };
    var lifecycleStatus = kspAiTrim_(lifecycle.status).toLowerCase();
    if (kspKnowledgeQueryPendingStatus_(lifecycleStatus)) {
      state.providerStatus = lifecycleStatus;
      state.pollCount = Number(state.pollCount || 0) + 1;
      state.maxPollLatencyMs = Math.max(Number(state.maxPollLatencyMs || 0), pollLatency);
      kspKnowledgeQueryWriteCache_(environment, kspKnowledgeQueryCacheKey_(actor, token), state,
        KSP_AI_DEFAULTS.QUERY_PENDING_TTL_SECONDS);
      return kspKnowledgeQueryPendingResult_(requestedProvider, state.input.mode, token, warnings, state, environment);
    }
    if (lifecycleStatus === 'completed') {
      var completed = kspBuildProviderKnowledgeSearchSuccess_(environment, requestedProvider, state.input, config,
        context, actor, lifecycle.response || lifecycle, warnings, token,
        { state: state, providerStatus: 'completed', response: lifecycle.response || lifecycle,
          pollCount: Number(state.pollCount || 0) + 1,
          maxPollLatencyMs: Math.max(Number(state.maxPollLatencyMs || 0), pollLatency) });
      kspStoreKnowledgeQueryTerminal_(environment, actor, token, requestedProvider, completed.result);
      return completed.result;
    }
    if (kspKnowledgeQueryKnownTerminalStatus_(lifecycleStatus)) {
      var providerTerminal = new Error('Gemini検索が完了できない状態になりました。');
      providerTerminal.code = 'AI_QUERY_PROVIDER_TERMINAL';
      providerTerminal.providerStatus = lifecycleStatus;
      providerTerminal.queryTerminal = true;
      providerTerminal.pollCount = Number(state.pollCount || 0) + 1;
      providerTerminal.pollLatencyMs = pollLatency;
      throw providerTerminal;
    }
    var invalidStatus = new Error('Gemini検索結果を確認できませんでした。');
    invalidStatus.code = 'AI_QUERY_RESPONSE_INVALID';
    invalidStatus.queryTerminal = true;
    invalidStatus.pollCount = Number(state.pollCount || 0) + 1;
    invalidStatus.pollLatencyMs = pollLatency;
    throw invalidStatus;
  } catch (error) {
    var terminalStatus = kspAiTrim_(error && error.providerStatus).toLowerCase();
    if (error && (error.queryTerminal === true || kspKnowledgeQueryKnownTerminalStatus_(terminalStatus))) {
      var terminalFailure = kspKnowledgeQueryFailureResult_(requestedProvider, state.input.mode, error, warnings, false, '');
      if (context && context.auditSpreadsheetId) {
        kspAppendKnowledgeQueryAuditOnce_(environment, actor, token, context.auditSpreadsheetId, kspBuildKnowledgeSearchAuditRow_({
          timestamp: environment.nowIso(), actor: actor, input: state.input, modelId: state.modelId || (config && config.modelId),
          interactionId: kspKnowledgeQueryAuditTargetId_(token), result: KSP_AUDIT_RESULTS.FAILURE, errorCode: kspGetErrorCode_(error), citations: [],
          provider: requestedProvider, telemetry: {
            state: state, providerStatus: terminalStatus, pollCount: Number(state.pollCount || 0) + 1,
            maxPollLatencyMs: Math.max(Number(state.maxPollLatencyMs || 0), Number(error.pollLatencyMs || 0))
          }
        }), terminalFailure.warnings);
      }
      kspStoreKnowledgeQueryTerminal_(environment, actor, token, requestedProvider, terminalFailure);
      return terminalFailure;
    }
    if (error && error.code === 'AI_QUERY_HTTP_FAILED' && error.retryable === false) {
      var transportFailure = kspKnowledgeQueryFailureResult_(requestedProvider, state.input.mode, error, warnings, false, '');
      if (context && context.auditSpreadsheetId) {
        kspAppendKnowledgeQueryAuditOnce_(environment, actor, token, context.auditSpreadsheetId, kspBuildKnowledgeSearchAuditRow_({
          timestamp: environment.nowIso(), actor: actor, input: state.input, modelId: state.modelId || (config && config.modelId),
          interactionId: kspKnowledgeQueryAuditTargetId_(token), result: KSP_AUDIT_RESULTS.FAILURE, errorCode: kspGetErrorCode_(error), citations: [],
          provider: requestedProvider, telemetry: { state: state, providerStatus: 'failed', pollCount: state.pollCount || 0 }
        }), transportFailure.warnings);
      }
      kspStoreKnowledgeQueryTerminal_(environment, actor, token, requestedProvider, transportFailure);
      return transportFailure;
    }
    return kspKnowledgeQueryFailureResult_(requestedProvider, state.input.mode, error, warnings, true, token);
  }
}

function kspRunProviderKnowledgeSearch_(environment, provider, rawInput) {
  var normalizedProvider = kspNormalizeAiProvider_(provider);
  try {
    if (kspKnowledgeQueryPhase_(rawInput) === 'POLL') {
      return kspRunProviderKnowledgeSearchPoll_(environment, normalizedProvider, rawInput);
    }
    return kspRunProviderKnowledgeSearchStart_(environment, normalizedProvider, rawInput);
  } catch (error) {
    return kspKnowledgeQueryFailureResult_(normalizedProvider, '', error, [], false, '');
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
  var selection;
  try {
    selection = kspNormalizeProviderAiSelection_({ sourceType: syncOptions.sourceType });
  } catch (error) {
    report.finishedAt = environment.nowIso();
    report.ok = false;
    report.errors.push({ code: kspGetErrorCode_(error, 'AI_SYNC_SOURCE_TYPE_INVALID') });
    return report;
  }
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
        context.meetingRows, context.pitchbookRows, startedAt, settings, provider, selection
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
          if (kspIsGeminiReadbackRecoveryEntry_(providerState, provider)) {
            var exactMatches = (docs || []).filter(function (doc) {
              return kspGeminiDocumentMatchesSource_(doc, source);
            });
            kspAssert_(exactMatches.length === 1, 'AI_DOCUMENT_READBACK_FAILED',
              'File Search Documentの照合結果が一意ではありません。');
            var reconciled = typeof environment.readProviderDocument === 'function'
              ? environment.readProviderDocument(provider, effectiveConfig, exactMatches[0], source)
              : exactMatches[0];
            kspAssert_(kspGeminiDocumentMatchesSource_(reconciled, source),
              'AI_DOCUMENT_READBACK_FAILED', 'File Search Documentの照合に失敗しました。');
            kspProviderStatePatch_(environment, item, provider, {
              status: KSP_AI_INDEX_STATUS.INDEXED,
              documentName: String(reconciled.name || ''),
              providerDocumentId: String(reconciled.providerDocumentId || reconciled.fileId || ''),
              storeName: effectiveConfig.storeName,
              indexedAt: environment.nowIso(),
              contentHash: source.contentHash,
              lastError: ''
            });
            report.unchanged += 1;
            report.items.push({ sourceType: item.sourceType, sourceId: item.sourceId, action: 'reconciled' });
            return;
          }
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
