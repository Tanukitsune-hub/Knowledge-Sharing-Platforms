const { test, assert, ksp, plain, baseContext, createSyncEnvironment } = require('./ai-test-helpers.cjs');

function providerQueueRow(sourceType, sourceId, updatedAt, overrides = {}) {
  return {
    ...(sourceType === 'Meeting' ? { Meeting_ID: sourceId } : { Document_ID: sourceId }),
    Status: 'Active',
    AI_Provider_State_JSON: '',
    AI_Index_Status: 'Pending',
    AI_Document_Name: '',
    AI_Indexed_At: '',
    AI_Content_Hash: '',
    AI_Last_Error: '',
    Updated_At: updatedAt,
    ...overrides
  };
}

function createResumableQueryEnvironment(options = {}) {
  const env = createSyncEnvironment();
  const cache = new Map();
  const claims = new Set();
  const pollResponses = [...(options.pollResponses || [])];
  let actor = options.actor || 'person@example.com';
  const calls = { starts: 0, polls: 0, startRequests: [], pollIds: [], writes: 0 };
  env.getActor = () => actor;
  env.claimPublicOperation = (key) => {
    if (claims.has(key)) return false;
    claims.add(key);
    return true;
  };
  env.getPublicIdempotency = (key) => {
    const value = cache.get(key);
    return value ? plain(value) : null;
  };
  env.setPublicIdempotency = (key, value) => {
    calls.writes += 1;
    cache.set(key, plain(value));
  };
  env.getProviderConfig = (provider) => ({
    provider, enabled: true, modelId: 'gemini-3.7-flash',
    storeName: 'fileSearchStores/store-synthetic', credentialConfigured: true
  });
  env.startQueryProvider = (provider, config, request) => {
    calls.starts += 1;
    calls.startRequests.push(plain(request));
    return { status: 'in_progress', interactionId: 'interaction-private' };
  };
  env.pollQueryProvider = (provider, config, interactionId) => {
    calls.polls += 1;
    calls.pollIds.push(interactionId);
    const next = pollResponses.shift();
    if (next instanceof Error) throw next;
    return next || { status: 'in_progress' };
  };
  env._resumable = {
    cache, calls,
    setActor(value) { actor = value; }
  };
  return env;
}

function withSyntheticUuid(callback) {
  const originalUtilities = ksp.Utilities;
  let sequence = 0;
  ksp.Utilities = {
    ...originalUtilities,
    getUuid: () => `00000000-0000-4000-8000-${String(++sequence).padStart(12, '0')}`
  };
  try {
    return callback();
  } finally {
    ksp.Utilities = originalUtilities;
  }
}

function completedPitchbookInteraction() {
  return {
    id: 'interaction-private',
    status: 'completed',
    usage: { input_tokens: 12, output_tokens: 8, thought_tokens: 2, tool_use_tokens: 3, cached_tokens: 1 },
    steps: [{ type: 'model_output', content: [{ type: 'text', text: 'Grounded Pitchbook answer', annotations: [{
      type: 'file_citation', source: 'provider-document-private', custom_metadata: [
        { key: 'source_type', string_value: 'Pitchbook' },
        { key: 'source_id', string_value: 'DOC-000001' }
      ]
    }] }] }]
  };
}

test('provider state migrates legacy Gemini fields without populating OpenAI', () => {
  const legacy = plain(ksp.kspParseAiProviderState_('', {
    AI_Document_Name: 'fileSearchStores/store-1/documents/gemini-1',
    AI_Index_Status: 'Indexed',
    AI_Indexed_At: '2026-08-16T00:00:00.000Z',
    AI_Content_Hash: 'legacy-hash',
    AI_Last_Error: ''
  }));
  assert.equal(legacy.GEMINI.documentName, 'fileSearchStores/store-1/documents/gemini-1');
  assert.equal(legacy.GEMINI.status, 'Indexed');
  assert.equal(legacy.GEMINI.contentHash, 'legacy-hash');
  assert.equal(legacy.OPENAI.documentName, '');
  assert.equal(legacy.OPENAI.providerDocumentId, '');

  const row = { AI_Provider_State_JSON: '', AI_Document_Name: 'gemini-doc', AI_Index_Status: 'Indexed' };
  const patched = plain(ksp.kspBuildAiProviderStatePatch_(row, 'OPENAI', {
    status: 'Indexed', providerDocumentId: 'openai-file', documentName: 'openai-doc', contentHash: 'openai-hash'
  }));
  assert.equal(patched.OPENAI.providerDocumentId, 'openai-file');
  assert.equal(patched.GEMINI.documentName, 'gemini-doc');
  assert.equal(patched.GEMINI.status, 'Indexed');
});

test('OpenAI attributes stay within 16 slots and remain stable-ID-first', () => {
  const attributes = plain(ksp.kspBuildOpenAiAttributes_({
    sourceType: 'Meeting', sourceId: 'MTG-000001', dateKey: '2026-08-16',
    entityKey: 'LP_ASSET_OWNER:LP-000001', counterpartyType: 'LP_ASSET_OWNER',
    gpId: 'GP-000001', assetClassId: 'AC-001', capitalTypeId: 'CT-001',
    teamId: 'TEAM-001', fundStrategy: 'Synthetic Strategy', followUpRequired: true,
    counterpartyName: 'Do not send', driveUrl: 'https://private.invalid/source',
    savedFilename: 'private.pdf', contentHash: 'secret-hash'
  }));
  assert.ok(Object.keys(attributes).length <= 16);
  assert.deepEqual(Object.keys(attributes), [
    'source_type', 'source_id', 'date_key', 'entity_key', 'counterparty_type',
    'gp_id', 'asset_class_id', 'capital_type_id', 'team_id', 'fund_strategy',
    'follow_up_required', 'content_hash'
  ]);
  assert.equal(Object.hasOwn(attributes, 'drive_url'), false);
  assert.equal(Object.hasOwn(attributes, 'saved_filename'), false);
  assert.equal(attributes.content_hash, 'secret-hash');
});

test('OpenAI query explicitly requests File Search results without exposing provider identity', () => {
  const originalRequest = ksp.kspOpenAiJsonRequestLive_;
  let captured = null;
  ksp.kspOpenAiJsonRequestLive_ = (method, path, payload) => {
    captured = { method, path, payload: plain(payload) };
    return { id: 'response-synthetic' };
  };
  try {
    plain(ksp.kspOpenAiQueryFileSearchLive_(
      { model: 'gpt-synthetic', vectorStoreId: 'vs-synthetic', input: 'Q', filters: { type: 'eq' } }
    ));
  } finally {
    ksp.kspOpenAiJsonRequestLive_ = originalRequest;
  }
  assert.equal(captured.method, 'POST');
  assert.equal(captured.path, '/responses');
  assert.deepEqual(captured.payload.include, ['file_search_call.results']);
  assert.deepEqual(captured.payload.tools[0].filters, { type: 'eq' });
  assert.doesNotMatch(JSON.stringify(captured), /OPENAI_API_KEY|secret/i);
});

test('OpenAI request filters use exact stable fields and both citation forms map Meeting and Pitchbook', () => {
  const filter = plain(ksp.kspBuildOpenAiFilter_({
    dateFrom: '2026-08-01', dateTo: '2026-08-31', gpId: 'GP-000001',
    assetClassId: 'AC-001', capitalTypeId: 'CT-001', sourceType: 'Meeting'
  }));
  assert.equal(filter.type, 'and');
  assert.deepEqual(filter.filters.map((item) => [item.type, item.key, item.value]), [
    ['gte', 'date_key', '2026-08-01'],
    ['lte', 'date_key', '2026-08-31'],
    ['eq', 'gp_id', 'GP-000001'],
    ['eq', 'asset_class_id', 'AC-001'],
    ['eq', 'capital_type_id', 'CT-001'],
    ['eq', 'source_type', 'Meeting']
  ]);
  const request = plain(ksp.kspBuildProviderSearchRequest_('OPENAI', {
    provider: 'OPENAI', modelId: 'gpt-synthetic', vectorStoreId: 'vs-synthetic'
  }, { mode: '自由質問', questionOrInstruction: 'Q', sourceType: 'Meeting' }));
  assert.equal(request.provider, 'OPENAI');
  assert.equal(request.model, 'gpt-synthetic');
  assert.equal(request.vectorStoreId, 'vs-synthetic');
  assert.equal(request.filters.key, 'source_type');

  const state = ksp.kspBuildEmptyAiProviderState_();
  state.OPENAI.providerDocumentId = 'openai-meeting-file';
  state.OPENAI.contentHash = 'meeting-hash';
  const meeting = { ...baseContext().meetingRows[0], AI_Provider_State_JSON: ksp.kspSerializeAiProviderState_(state) };
  const pitchbookState = ksp.kspBuildEmptyAiProviderState_();
  pitchbookState.OPENAI.providerDocumentId = 'openai-pitchbook-file';
  pitchbookState.OPENAI.contentHash = 'pitchbook-hash';
  const pitchbook = { ...baseContext().pitchbookRows[0], AI_Provider_State_JSON: ksp.kspSerializeAiProviderState_(pitchbookState) };
  const response = ksp.kspNormalizeOpenAiResponse_({
    id: 'response-synthetic',
    output: [
      { type: 'file_search_call', status: 'completed', results: [
        { file_id: 'openai-meeting-file', filename: 'meeting.txt', attributes: {
          source_type: 'Meeting', source_id: 'MTG-000001', content_hash: 'meeting-hash'
        } },
        { file_id: 'openai-pitchbook-file', filename: 'pitchbook.txt', attributes: {
          source_type: 'Pitchbook', source_id: 'DOC-000001', content_hash: 'pitchbook-hash'
        } }
      ] },
      { type: 'message', content: [{
        type: 'output_text', text: 'Grounded synthetic answer', annotations: [
          { type: 'file_citation', file_id: 'openai-meeting-file', filename: 'meeting.txt' },
          { type: 'file_citation', file_id: 'openai-pitchbook-file', filename: 'pitchbook.txt' }
        ]
      }] }
    ]
  });
  assert.equal(response.citations.filter((item) => item.provenance === 'INLINE_CITATION').length, 2);
  assert.equal(response.citations.filter((item) => item.provenance === 'RETRIEVED_SOURCE').length, 2);
  const mapped = plain(ksp.kspMapKnowledgeCitations_(response.citations,
    ksp.kspBuildAuthoritativeSourceMaps_([meeting], [pitchbook])));
  assert.equal(mapped.citations.length, 2);
  assert.deepEqual(mapped.citations.map((item) => item.sourceType).sort(), ['Meeting', 'Pitchbook']);
  assert.equal(mapped.warnings.length, 0);
  assert.doesNotMatch(JSON.stringify(mapped), /openai-(meeting|pitchbook)-file|vs-synthetic/);
});

test('OpenAI retrieved-source fallback normalizes one exact source and deduplicates repeated chunks', () => {
  const state = ksp.kspBuildEmptyAiProviderState_();
  state.OPENAI.providerDocumentId = 'openai-retrieved-file';
  state.OPENAI.contentHash = 'retrieved-hash';
  const pitchbook = { ...baseContext().pitchbookRows[0], AI_Provider_State_JSON: ksp.kspSerializeAiProviderState_(state) };
  const response = ksp.kspNormalizeOpenAiResponse_({
    id: 'response-retrieved',
    output: [
      { type: 'file_search_call', status: 'completed', results: [
        { file_id: 'openai-retrieved-file', filename: 'pitchbook.txt', text: 'chunk 1', attributes: {
          source_type: 'Pitchbook', source_id: 'DOC-000001', content_hash: 'retrieved-hash'
        } },
        { file_id: 'openai-retrieved-file', filename: 'pitchbook.txt', text: 'chunk 2', attributes: {
          source_type: 'Pitchbook', source_id: 'DOC-000001', content_hash: 'retrieved-hash'
        } }
      ] },
      { type: 'message', content: [{ type: 'output_text', text: 'Grounded retrieved answer', annotations: [] }] }
    ]
  });
  assert.equal(response.answer, 'Grounded retrieved answer');
  assert.equal(response.citations.length, 1);
  assert.equal(response.citations[0].provenance, 'RETRIEVED_SOURCE');
  const mapped = plain(ksp.kspMapKnowledgeCitations_(response.citations,
    ksp.kspBuildAuthoritativeSourceMaps_([], [pitchbook])));
  assert.equal(mapped.citations.length, 1);
  assert.equal(mapped.citations[0].sourceId, 'DOC-000001');
  assert.equal(mapped.citations[0].provenance, 'RETRIEVED_SOURCE');
  assert.equal(mapped.warnings.length, 0);
});

test('OpenAI retrieved-source normalization fails closed for zero, missing, ambiguous, and stale identity', () => {
  const empty = plain(ksp.kspNormalizeOpenAiResponse_({
    output: [{ type: 'file_search_call', status: 'completed', results: [] }]
  }));
  assert.equal(empty.citations.length, 0);

  const missing = plain(ksp.kspNormalizeOpenAiResponse_({
    output: [{ type: 'file_search_call', status: 'completed', results: [{
      file_id: 'openai-missing-metadata', filename: 'same-name.txt', attributes: { source_id: 'DOC-000001' }
    }] }]
  }));
  assert.equal(missing.citations.length, 0);
  assert.doesNotMatch(JSON.stringify(missing), /openai-missing-metadata|same-name\.txt/);

  const ambiguous = plain(ksp.kspNormalizeOpenAiResponse_({
    output: [{ type: 'file_search_call', status: 'completed', results: [
      { file_id: 'openai-ambiguous-a', attributes: { source_type: 'Pitchbook', source_id: 'DOC-000001', content_hash: 'same-hash' } },
      { file_id: 'openai-ambiguous-b', attributes: { source_type: 'Pitchbook', source_id: 'DOC-000001', content_hash: 'same-hash' } }
    ] }]
  }));
  assert.equal(ambiguous.citations.length, 0);

  const state = ksp.kspBuildEmptyAiProviderState_();
  state.OPENAI.providerDocumentId = 'openai-stale-file';
  state.OPENAI.contentHash = 'current-hash';
  const row = { ...baseContext().pitchbookRows[0], AI_Provider_State_JSON: ksp.kspSerializeAiProviderState_(state) };
  const stale = plain(ksp.kspMapKnowledgeCitations_([{
    type: 'retrieved_source', provenance: 'RETRIEVED_SOURCE', source: 'openai-stale-file', metadata: {
      source_type: 'Pitchbook', source_id: 'DOC-000001', content_hash: 'old-hash'
    }
  }], ksp.kspBuildAuthoritativeSourceMaps_([], [row])));
  assert.equal(stale.citations.length, 0);
  assert.equal(stale.warnings[0].code, 'OPENAI_CITATION_IDENTITY_STALE');
});

test('disabled provider returns its own safe error and never fails over', () => {
  for (const provider of ['OPENAI', 'GEMINI']) {
    const env = createSyncEnvironment();
    const calls = [];
    env.getProviderConfig = (requested) => ({
      provider: requested, enabled: false, modelId: '', vectorStoreId: '', storeName: '', credentialConfigured: false
    });
    env.queryProvider = (requested) => { calls.push(requested); return {}; };
    const result = plain(ksp.kspRunProviderKnowledgeSearch_(env, provider, {
      mode: '自由質問', questionOrInstruction: 'synthetic question'
    }));
    assert.equal(result.ok, false);
    assert.equal(result.error.code, `${provider}_DISABLED_BY_CONFIG`);
    assert.deepEqual(calls, []);
  }
});

test('Gemini START returns one opaque pending token without polling or Audit', () => {
  withSyntheticUuid(() => {
    const env = createResumableQueryEnvironment();
    const result = plain(ksp.kspRunProviderKnowledgeSearch_(env, 'GEMINI', {
      mode: '自由質問', questionOrInstruction: 'synthetic Pitchbook question', sourceType: 'Pitchbook'
    }));
    assert.equal(result.ok, true);
    assert.equal(result.status, 'pending');
    assert.equal(result.pending, true);
    assert.match(result.queryToken, /^[0-9a-f-]{36}$/);
    assert.doesNotMatch(JSON.stringify(result), /interaction-private/);
    assert.equal(env._resumable.calls.starts, 1);
    assert.equal(env._resumable.calls.polls, 0);
    assert.equal(env._debug.audits.length, 0);
    assert.equal(env._resumable.calls.startRequests[0].modelId, 'gemini-3.7-flash');
    assert.equal(env._resumable.calls.startRequests[0].background, true);
    assert.deepEqual(env._resumable.calls.startRequests[0].generation_config, {
      thinking_level: 'low', max_output_tokens: 2048
    });
    const pendingState = [...env._resumable.cache.values()].find((value) => value.kind === 'PENDING');
    assert.equal(pendingState.interactionId, 'interaction-private');
    assert.equal(Object.hasOwn(pendingState, 'question'), false);
    assert.equal(Object.hasOwn(pendingState, 'questionOrInstruction'), false);
  });
});

test('identical pending START reuses the same token and creates one Interaction', () => {
  withSyntheticUuid(() => {
    const env = createResumableQueryEnvironment();
    const input = { mode: '自由質問', questionOrInstruction: 'same synthetic question', sourceType: 'Pitchbook' };
    const first = plain(ksp.kspRunProviderKnowledgeSearch_(env, 'GEMINI', input));
    const second = plain(ksp.kspRunProviderKnowledgeSearch_(env, 'GEMINI', input));
    assert.equal(first.queryToken, second.queryToken);
    assert.equal(env._resumable.calls.starts, 1);
    assert.equal(env._resumable.calls.polls, 0);
  });
});

test('POLL uses one provider cycle, keeps pending state, maps completion, and replays terminal state', () => {
  withSyntheticUuid(() => {
    const env = createResumableQueryEnvironment({ pollResponses: [
      { status: 'queued' },
      { status: 'in_progress' },
      completedPitchbookInteraction()
    ] });
    const start = plain(ksp.kspRunProviderKnowledgeSearch_(env, 'GEMINI', {
      mode: '自由質問', questionOrInstruction: 'synthetic Pitchbook question', sourceType: 'Pitchbook'
    }));
    const pollInput = { queryPhase: 'POLL', queryToken: start.queryToken, route: 'GEMINI' };
    const pending1 = plain(ksp.kspRunProviderKnowledgeSearch_(env, 'GEMINI', pollInput));
    assert.equal(pending1.ok, true);
    assert.equal(pending1.status, 'pending');
    assert.equal(env._resumable.calls.polls, 1);
    const pending2 = plain(ksp.kspRunProviderKnowledgeSearch_(env, 'GEMINI', pollInput));
    assert.equal(pending2.status, 'pending');
    assert.equal(env._resumable.calls.polls, 2);
    assert.equal(env._debug.audits.length, 0);

    const completed = plain(ksp.kspRunProviderKnowledgeSearch_(env, 'GEMINI', pollInput));
    assert.equal(completed.ok, true);
    assert.equal(completed.status, 'completed');
    assert.equal(completed.citations.length, 1);
    assert.equal(completed.citations[0].sourceId, 'DOC-000001');
    assert.equal(env._resumable.calls.polls, 3);
    assert.equal(env._debug.audits.length, 1);
    assert.equal(env._debug.audits[0].Result, 'Success');
    assert.doesNotMatch(JSON.stringify(completed), /interaction-private|provider-document-private/);
    const telemetry = JSON.parse(env._debug.audits[0].After_Metadata_JSON);
    assert.equal(telemetry.request_profile_version, 'gemini-latency-v1');
    assert.equal(telemetry.thinking_level, 'low');
    assert.equal(telemetry.max_output_tokens, 2048);
    assert.equal(telemetry.input_tokens, 12);
    assert.equal(telemetry.output_tokens, 8);
    assert.ok(Object.values(telemetry).every((value) => typeof value !== 'number' || (Number.isFinite(value) && value >= 0)));

    const replay = plain(ksp.kspRunProviderKnowledgeSearch_(env, 'GEMINI', pollInput));
    assert.equal(replay.idempotentReplay, true);
    assert.equal(env._resumable.calls.polls, 3);
    assert.equal(env._debug.audits.length, 1);
  });
});

test('terminal provider statuses including budget_exceeded write one safe idempotent outcome', () => {
  for (const status of ['failed', 'cancelled', 'requires_action', 'incomplete', 'budget_exceeded']) {
    const terminalError = new Error('PRIVATE_PROVIDER_RESPONSE');
    terminalError.code = 'AI_QUERY_PROVIDER_TERMINAL';
    terminalError.providerStatus = status;
    withSyntheticUuid(() => {
      const env = createResumableQueryEnvironment({ pollResponses: [terminalError] });
      const start = plain(ksp.kspRunProviderKnowledgeSearch_(env, 'GEMINI', {
        mode: '自由質問', questionOrInstruction: 'synthetic question'
      }));
      const pollInput = { queryPhase: 'POLL', queryToken: start.queryToken, route: 'GEMINI' };
      const failure = plain(ksp.kspRunProviderKnowledgeSearch_(env, 'GEMINI', pollInput));
      assert.equal(failure.ok, false);
      assert.equal(failure.terminalStatus, status);
      assert.equal(failure.error.code, 'AI_QUERY_PROVIDER_TERMINAL');
      assert.doesNotMatch(JSON.stringify(failure), /PRIVATE_PROVIDER_RESPONSE|interaction-private/);
      assert.equal(env._resumable.calls.polls, 1);
      assert.equal(env._debug.audits.length, 1);
      const replay = plain(ksp.kspRunProviderKnowledgeSearch_(env, 'GEMINI', pollInput));
      assert.equal(replay.idempotentReplay, true);
      assert.equal(env._resumable.calls.polls, 1);
      assert.equal(env._debug.audits.length, 1);
    });
  }
});

test('unknown status fails closed and actor-bound or raw provider tokens cannot poll', () => {
  withSyntheticUuid(() => {
    const env = createResumableQueryEnvironment({ pollResponses: [
      { status: 'future_private_status', error: { message: 'PRIVATE_PROVIDER_RESPONSE' } }
    ] });
    const start = plain(ksp.kspRunProviderKnowledgeSearch_(env, 'GEMINI', {
      mode: '自由質問', questionOrInstruction: 'synthetic question'
    }));
    const pollInput = { queryPhase: 'POLL', queryToken: start.queryToken, route: 'GEMINI' };
    env._resumable.setActor('different@example.com');
    const mismatch = plain(ksp.kspRunProviderKnowledgeSearch_(env, 'GEMINI', pollInput));
    assert.ok(['AI_QUERY_TOKEN_INVALID', 'AI_QUERY_TOKEN_EXPIRED'].includes(mismatch.error.code));
    assert.equal(env._resumable.calls.polls, 0);
    env._resumable.setActor('person@example.com');
    const raw = plain(ksp.kspRunProviderKnowledgeSearch_(env, 'GEMINI', {
      queryPhase: 'POLL', queryToken: 'interaction-private', route: 'GEMINI'
    }));
    assert.equal(raw.error.code, 'AI_QUERY_TOKEN_EXPIRED');
    assert.equal(env._resumable.calls.polls, 0);
    const failure = plain(ksp.kspRunProviderKnowledgeSearch_(env, 'GEMINI', pollInput));
    assert.equal(failure.ok, false);
    assert.equal(failure.error.code, 'AI_QUERY_RESPONSE_INVALID');
    assert.doesNotMatch(JSON.stringify(failure), /PRIVATE_PROVIDER_RESPONSE/);
    assert.equal(env._debug.audits.length, 1);
  });
});

test('Gemini first configuration permits a blank Store and keeps generation and embedding models separate', () => {
  const originalFactory = ksp.kspCreateFeatureFreezeAiEnvironment_;
  const storeCalls = [];
  ksp.kspCreateFeatureFreezeAiEnvironment_ = () => {
    return {
      ensureFileSearchStore(settings) {
        storeCalls.push({ storeName: settings.storeName, embeddingModel: settings.embeddingModel });
        return { name: settings.storeName || 'fileSearchStores/synthetic-store' };
      }
    };
  };
  try {
    const settings = ksp.kspNormalizeAiSettings_({
      GEMINI_ENABLED: 'true',
      GEMINI_DEFAULT_MODEL: 'gemini-3.7-flash',
      AI_EMBEDDING_MODEL: 'models/gemini-embedding-2'
    });
    const config = plain(ksp.kspBuildAiProviderConfig_(settings, 'GEMINI'));
    assert.equal(config.enabled, true);
    assert.equal(config.storeName, '');
    assert.equal(config.modelId, 'gemini-3.7-flash');
    assert.equal(config.embeddingModel, 'models/gemini-embedding-2');
    assert.doesNotThrow(() => ksp.kspProviderConfigurationError_('GEMINI', {
      ...config, credentialConfigured: true
    }));

    const environment = ksp.kspCreateProviderNeutralAiEnvironment_();
    const first = plain(environment.ensureProviderStore('GEMINI', { ...config, credentialConfigured: true }));
    const second = plain(environment.ensureProviderStore('GEMINI', {
      ...config, storeName: first.name, credentialConfigured: true
    }));
    assert.equal(first.name, 'fileSearchStores/synthetic-store');
    assert.equal(second.name, first.name);
    assert.deepEqual(storeCalls, [
      { storeName: '', embeddingModel: 'models/gemini-embedding-2' },
      { storeName: 'fileSearchStores/synthetic-store', embeddingModel: 'models/gemini-embedding-2' }
    ]);
  } finally {
    if (originalFactory) ksp.kspCreateFeatureFreezeAiEnvironment_ = originalFactory;
    else delete ksp.kspCreateFeatureFreezeAiEnvironment_;
  }
});

test('provider sync selects each provider independently and indexes both source types', () => {
  const context = baseContext();
  context.settings = {
    ...context.settings,
    OPENAI_ENABLED: 'true', OPENAI_VECTOR_STORE_ID: 'vs-synthetic', OPENAI_DEFAULT_MODEL: 'gpt-synthetic',
    GEMINI_ENABLED: 'false'
  };
  const env = createSyncEnvironment({ context });
  const providerUploads = [];
  env.getProviderConfig = (provider) => provider === 'OPENAI'
    ? { provider, enabled: true, vectorStoreId: 'vs-synthetic', modelId: 'gpt-synthetic', credentialConfigured: true }
    : { provider, enabled: false, storeName: '', modelId: '', credentialConfigured: false };
  env.ensureProviderStore = () => ({ name: 'vs-synthetic' });
  env.findProviderDocumentsBySource = () => [];
  env.uploadProviderSource = (provider, config, source) => {
    providerUploads.push({ provider, sourceType: source.sourceType, sourceId: source.sourceId });
    return {
      name: `openai:vs-synthetic/files/file-${source.sourceId}`,
      providerDocumentId: `file-${source.sourceId}`
    };
  };
  env.updateAiProviderState = (sourceType, sourceId, provider, patch) => {
    const rows = sourceType === 'Meeting' ? context.meetingRows : context.pitchbookRows;
    const row = rows.find((item) => String(item.Meeting_ID || item.Document_ID) === String(sourceId));
    const state = ksp.kspBuildAiProviderStatePatch_(row, provider, patch);
    row.AI_Provider_State_JSON = ksp.kspSerializeAiProviderState_(state);
  };
  const result = plain(ksp.kspRunProviderNeutralAiSync_(env));
  assert.equal(result.ok, true);
  assert.equal(result.providers.OPENAI.status, 'PASS');
  assert.equal(result.providers.OPENAI.indexed, 2);
  assert.equal(result.providers.GEMINI.status, 'DISABLED_BY_CONFIG');
  assert.deepEqual(providerUploads.map((item) => item.sourceType).sort(), ['Meeting', 'Pitchbook']);
  const meetingState = plain(ksp.kspParseAiProviderState_(context.meetingRows[0].AI_Provider_State_JSON, context.meetingRows[0]));
  assert.equal(meetingState.OPENAI.providerDocumentId, 'file-MTG-000001');
  assert.equal(meetingState.GEMINI.providerDocumentId, '');
});

function configureOpenAiSyncQualificationEnvironment(env, context) {
  let uploadSequence = 0;
  env.getProviderConfig = (provider) => provider === 'OPENAI'
    ? { provider, enabled: true, vectorStoreId: 'vs-synthetic', modelId: 'gpt-5.6-terra', credentialConfigured: true }
    : { provider, enabled: false, vectorStoreId: '', storeName: '', modelId: '', credentialConfigured: false };
  env.ensureProviderStore = () => ({ name: 'vs-synthetic' });
  env.findProviderDocumentsBySource = (provider, config, sourceType, sourceId) => env._debug.documents
    .filter((documentValue) => {
      const metadata = documentValue.attributes || documentValue.customMetadata || {};
      return metadata.source_type === sourceType && metadata.source_id === sourceId;
    }).map(plain);
  env.deleteProviderDocument = (provider, config, documentValue) => {
    env._debug.deleted.push(documentValue.name);
    const index = env._debug.documents.findIndex((item) => item.name === documentValue.name);
    if (index >= 0) env._debug.documents.splice(index, 1);
  };
  env.uploadProviderSource = (provider, config, source) => {
    const providerDocumentId = `openai-qualification-${++uploadSequence}`;
    const attributes = plain(ksp.kspBuildOpenAiAttributes_(source));
    const documentValue = {
      name: `openai:${config.vectorStoreId}/files/${providerDocumentId}`,
      providerDocumentId,
      fileId: providerDocumentId,
      attributes,
      customMetadata: attributes,
      status: 'completed'
    };
    env._debug.documents.push(documentValue);
    env._debug.uploaded.push(plain(source));
    return plain(documentValue);
  };
  env.updateAiProviderState = (sourceType, sourceId, provider, patch) => {
    const rows = sourceType === 'Meeting' ? context.meetingRows : context.pitchbookRows;
    const row = rows.find((item) => String(item.Meeting_ID || item.Document_ID) === String(sourceId));
    const state = ksp.kspBuildAiProviderStatePatch_(row, provider, patch);
    row.AI_Provider_State_JSON = ksp.kspSerializeAiProviderState_(state);
  };
  return { nextProviderDocumentId: () => `openai-qualification-${uploadSequence + 1}` };
}

function openAiFilterValue(filter, key) {
  if (!filter) return '';
  if (filter.key === key) return filter.value;
  for (const child of filter.filters || []) {
    const found = openAiFilterValue(child, key);
    if (found) return found;
  }
  return '';
}

test('synthetic OpenAI Meeting and Pitchbook sync/query uses exact metadata and authoritative retrieved sources', () => {
  const context = baseContext();
  context.settings = {
    ...context.settings,
    OPENAI_ENABLED: 'true', OPENAI_VECTOR_STORE_ID: 'vs-synthetic', OPENAI_DEFAULT_MODEL: 'gpt-5.6-terra',
    GEMINI_ENABLED: 'false'
  };
  const env = createSyncEnvironment({ context });
  configureOpenAiSyncQualificationEnvironment(env, context);
  const sync = plain(ksp.kspRunProviderNeutralAiSync_(env, { force: true }));
  assert.equal(sync.ok, true);
  assert.equal(sync.providers.OPENAI.status, 'PASS');
  assert.equal(sync.providers.OPENAI.indexed, 2);
  assert.equal(env._debug.documents.length, 2);

  const rowsByType = { Meeting: context.meetingRows[0], Pitchbook: context.pitchbookRows[0] };
  const requests = {};
  env.startQueryProvider = (provider, config, request) => {
    const sourceType = openAiFilterValue(request.filters, 'source_type');
    const row = rowsByType[sourceType];
    const state = ksp.kspParseAiProviderState_(row.AI_Provider_State_JSON, row).OPENAI;
    requests[sourceType] = plain(request);
    const answer = `${sourceType} synthetic grounded answer`;
    return {
      status: 'completed',
      response: {
        id: `response-${sourceType.toLowerCase()}`,
        output: [
          { type: 'file_search_call', status: 'completed', results: [{
            file_id: state.providerDocumentId,
            filename: row.Saved_Filename,
            attributes: { source_type: sourceType, source_id: sourceType === 'Meeting' ? row.Meeting_ID : row.Document_ID, content_hash: state.contentHash }
          }] },
          { type: 'message', content: [{ type: 'output_text', text: answer, annotations: [] }] }
        ]
      }
    };
  };

  for (const sourceType of ['Meeting', 'Pitchbook']) {
    const row = rowsByType[sourceType];
    const sourceId = sourceType === 'Meeting' ? row.Meeting_ID : row.Document_ID;
    const result = plain(ksp.kspRunProviderKnowledgeSearch_(env, 'OPENAI', {
      mode: '自由質問', questionOrInstruction: `${sourceType} synthetic question`,
      dateFrom: '2026-08-01', dateTo: '2026-08-31', gpId: 'GP-1',
      assetClassId: 'AC-1', capitalTypeId: 'CT-1', sourceType
    }));
    assert.equal(result.ok, true, JSON.stringify(result));
    assert.equal(result.insufficientEvidence, false);
    assert.equal(result.citations.length, 1);
    assert.equal(result.citations[0].sourceType, sourceType);
    assert.equal(result.citations[0].sourceId, sourceId);
    assert.equal(result.citations[0].provenance, 'RETRIEVED_SOURCE');
    assert.doesNotMatch(JSON.stringify(result), /openai-qualification|vs-synthetic/);
    assert.equal(openAiFilterValue(requests[sourceType].filters, 'date_key'), '2026-08-01');
    assert.equal(openAiFilterValue(requests[sourceType].filters, 'gp_id'), 'GP-1');
    assert.equal(openAiFilterValue(requests[sourceType].filters, 'asset_class_id'), 'AC-1');
    assert.equal(openAiFilterValue(requests[sourceType].filters, 'capital_type_id'), 'CT-1');
    assert.equal(openAiFilterValue(requests[sourceType].filters, 'source_type'), sourceType);
    assert.equal(requests[sourceType].filters.type, 'and');
    assert.deepEqual(requests[sourceType].filters.filters.slice(0, 2), [
      { type: 'gte', key: 'date_key', value: '2026-08-01' },
      { type: 'lte', key: 'date_key', value: '2026-08-31' }
    ]);
  }
  assert.deepEqual(env._debug.audits.map((row) => row.Cited_Source_IDs).sort(), ['DOC-000001', 'MTG-000001']);
  assert.doesNotMatch(JSON.stringify(env._debug.audits), /openai-qualification|vs-synthetic/);
});

test('explicit OpenAI sync scope excludes an enabled Gemini provider', () => {
  const context = baseContext();
  context.settings = {
    ...context.settings,
    OPENAI_ENABLED: 'true', OPENAI_VECTOR_STORE_ID: 'vs-synthetic', OPENAI_DEFAULT_MODEL: 'gpt-5.6-terra',
    GEMINI_ENABLED: 'true', GEMINI_FILE_SEARCH_STORE: 'fileSearchStores/gemini-synthetic'
  };
  const env = createSyncEnvironment({ context });
  configureOpenAiSyncQualificationEnvironment(env, context);
  const originalGetProviderConfig = env.getProviderConfig;
  env.getProviderConfig = (provider) => {
    if (provider === 'GEMINI') {
      return { provider, enabled: true, storeName: 'fileSearchStores/gemini-synthetic', modelId: 'gemini-3.7-flash', credentialConfigured: true };
    }
    return originalGetProviderConfig(provider);
  };
  const result = plain(ksp.kspRunProviderNeutralAiSync_(env, { force: true, providers: ['OPENAI', 'OPENAI'] }));
  assert.equal(result.ok, true);
  assert.equal(result.providers.OPENAI.status, 'PASS');
  assert.equal(result.providers.GEMINI, undefined);
});

test('synthetic OpenAI lifecycle reindexes exactly once, excludes Inactive, and restores on Reactivate', () => {
  const context = baseContext();
  context.settings = {
    ...context.settings,
    OPENAI_ENABLED: 'true', OPENAI_VECTOR_STORE_ID: 'vs-synthetic', OPENAI_DEFAULT_MODEL: 'gpt-5.6-terra',
    GEMINI_ENABLED: 'false'
  };
  const env = createSyncEnvironment({ context });
  configureOpenAiSyncQualificationEnvironment(env, context);
  const first = plain(ksp.kspRunProviderNeutralAiSync_(env, { force: true }));
  assert.equal(first.indexed, 2);
  const uploadedAfterFirst = env._debug.uploaded.length;
  const second = plain(ksp.kspRunProviderNeutralAiSync_(env, { force: true }));
  assert.equal(second.unchanged, 2);
  assert.equal(env._debug.uploaded.length, uploadedAfterFirst);
  assert.equal(env._debug.documents.length, 2);

  const meeting = context.meetingRows[0];
  const meetingStateBeforeRevision = ksp.kspParseAiProviderState_(meeting.AI_Provider_State_JSON, meeting).OPENAI;
  meeting.Updated_At = '2026-08-30T00:00:00.000Z';
  env.readMeetingText = () => 'Meeting body revision';
  const revised = plain(ksp.kspRunProviderNeutralAiSync_(env, { force: true, sourceType: 'Meeting' }));
  assert.equal(revised.indexed, 1);
  assert.equal(env._debug.documents.filter((item) => item.attributes.source_id === meeting.Meeting_ID).length, 1);
  assert.ok(env._debug.deleted.includes(meetingStateBeforeRevision.documentName));
  const meetingStateAfterRevision = ksp.kspParseAiProviderState_(meeting.AI_Provider_State_JSON, meeting).OPENAI;
  assert.notEqual(meetingStateAfterRevision.contentHash, meetingStateBeforeRevision.contentHash);

  const revisionDocument = env._debug.documents.find((item) => item.attributes.source_id === meeting.Meeting_ID);
  env._debug.documents.push({ ...plain(revisionDocument), name: `${revisionDocument.name}-duplicate` });
  const duplicateCleanup = plain(ksp.kspRunProviderNeutralAiSync_(env, { force: true, sourceType: 'Meeting' }));
  assert.equal(duplicateCleanup.unchanged, 1);
  assert.equal(env._debug.documents.filter((item) => item.attributes.source_id === meeting.Meeting_ID).length, 1);
  assert.ok(env._debug.deleted.includes(`${revisionDocument.name}-duplicate`));

  meeting.Status = 'Inactive';
  const inactive = plain(ksp.kspRunProviderNeutralAiSync_(env, { force: true, sourceType: 'Meeting' }));
  assert.equal(inactive.removed, 1);
  assert.equal(env._debug.documents.some((item) => item.attributes.source_id === meeting.Meeting_ID), false);
  const inactiveState = ksp.kspParseAiProviderState_(meeting.AI_Provider_State_JSON, meeting).OPENAI;
  assert.equal(inactiveState.status, 'NotIndexed');
  assert.equal(inactiveState.providerDocumentId, '');
  assert.equal(inactiveState.contentHash, '');

  meeting.Status = 'Active';
  meeting.Updated_At = '2026-08-31T00:00:00.000Z';
  const reactivated = plain(ksp.kspRunProviderNeutralAiSync_(env, { force: true, sourceType: 'Meeting' }));
  assert.equal(reactivated.indexed, 1);
  assert.equal(env._debug.documents.filter((item) => item.attributes.source_id === meeting.Meeting_ID).length, 1);
  const reactivatedState = ksp.kspParseAiProviderState_(meeting.AI_Provider_State_JSON, meeting).OPENAI;
  assert.equal(reactivatedState.status, 'Indexed');
  assert.ok(reactivatedState.providerDocumentId);
  assert.ok(reactivatedState.contentHash);
});

test('a source revision signaled by the legacy Pending field is reconsidered per provider', () => {
  const context = baseContext({ pitchbookRows: [] });
  const state = ksp.kspBuildEmptyAiProviderState_();
  state.OPENAI.status = 'Indexed';
  state.OPENAI.documentName = 'openai:vs-synthetic/files/file-old';
  state.OPENAI.providerDocumentId = 'file-old';
  state.OPENAI.contentHash = 'old-hash';
  context.meetingRows[0].AI_Provider_State_JSON = ksp.kspSerializeAiProviderState_(state);
  context.meetingRows[0].AI_Index_Status = 'Pending';
  const selected = plain(ksp.kspSelectProviderAiWorkItems_(
    context.meetingRows, context.pitchbookRows, '2026-08-16T00:00:00.000Z',
    ksp.kspNormalizeAiSettings_({ AI_SYNC_BATCH_SIZE: '10' }), 'OPENAI'
  ));
  assert.deepEqual(selected.map((item) => item.sourceId), ['MTG-000001']);
});

test('provider selector excludes permanent failures and selects exactly one eligible Pending Meeting', () => {
  const rows = [
    {
      Meeting_ID: 'MTG-PERMANENT-1', Status: 'Active', AI_Index_Status: 'Failed',
      AI_Last_Error: JSON.stringify({ attempt: 3, retryable: false, permanent: true, code: 'AI_UPLOAD_FINALIZE_REQUEST_INVALID' }),
      Updated_At: '2026-08-16T13:37:35.089Z'
    },
    {
      Meeting_ID: 'MTG-PERMANENT-2', Status: 'Active', AI_Index_Status: 'Failed',
      AI_Last_Error: JSON.stringify({ attempt: 2, retryable: false, permanent: true, code: 'AI_UPLOAD_FINALIZE_REQUEST_INVALID' }),
      Updated_At: '2026-08-16T15:14:47.316Z'
    },
    {
      Meeting_ID: 'MTG-PENDING-1', Status: 'Active', AI_Index_Status: 'Pending', AI_Last_Error: '',
      Updated_At: '2026-08-25T16:14:30.698Z'
    },
    {
      Meeting_ID: 'MTG-PENDING-2', Status: 'Active', AI_Index_Status: 'Pending', AI_Last_Error: '',
      Updated_At: '2026-08-27T20:42:34.008Z'
    }
  ];
  const selected = plain(ksp.kspSelectProviderAiWorkItems_(
    rows, [], '2026-08-29T02:10:00.000Z',
    ksp.kspNormalizeAiSettings_({ AI_SYNC_BATCH_SIZE: '1' }), 'GEMINI'
  ));
  assert.equal(selected.length, 1);
  assert.equal(selected[0].sourceType, 'Meeting');
  assert.equal(selected[0].sourceId, 'MTG-PENDING-1');
});

test('permanent readback failure reconciles one exact active Document without upload or delete', () => {
  const context = baseContext({ pitchbookRows: [] });
  const contentHash = ksp.kspAiHashTextFallback_('Meeting body');
  const state = ksp.kspBuildEmptyAiProviderState_();
  state.GEMINI.status = 'Failed';
  state.GEMINI.lastError = JSON.stringify({
    attempt: 1, retryable: false, permanent: true, code: 'AI_DOCUMENT_READBACK_FAILED'
  });
  context.meetingRows[0].AI_Provider_State_JSON = ksp.kspSerializeAiProviderState_(state);
  context.meetingRows[0].AI_Index_Status = 'Failed';
  context.meetingRows[0].AI_Last_Error = state.GEMINI.lastError;
  const existing = {
    name: 'fileSearchStores/store-1/documents/existing',
    state: 'STATE_ACTIVE',
    customMetadata: {
      source_type: 'Meeting', source_id: 'MTG-000001', content_hash: contentHash
    }
  };
  const env = createSyncEnvironment({ context, documents: [existing] });
  env.getProviderConfig = (provider) => provider === 'GEMINI'
    ? { provider, enabled: true, storeName: 'fileSearchStores/store-1', modelId: 'gemini-3.7-flash', credentialConfigured: true }
    : { provider, enabled: false, storeName: '', modelId: '', credentialConfigured: false };
  let findCalls = 0;
  env.findProviderDocumentsBySource = () => {
    findCalls += 1;
    return [existing];
  };
  let readCalls = 0;
  env.readProviderDocument = (provider, config, documentValue) => {
    readCalls += 1;
    return documentValue;
  };
  env.uploadProviderSource = () => { throw new Error('PRE_FIX_MUST_NOT_UPLOAD'); };

  const result = plain(ksp.kspRunProviderNeutralAiSync_(env, { force: true, sourceType: 'Meeting' }));
  assert.equal(result.ok, true);
  assert.equal(result.selected, 1);
  assert.equal(result.providers.GEMINI.selected, 1);
  assert.equal(result.unchanged, 1);
  assert.equal(findCalls, 1);
  assert.equal(readCalls, 1);
  assert.equal(env._debug.uploaded.length, 0);
  assert.equal(env._debug.deleted.length, 0);
  assert.equal(env._debug.documents.length, 1);
  assert.equal(env._debug.documents[0].state, 'STATE_ACTIVE');
  assert.equal(env._debug.documents[0].customMetadata.source_type, 'Meeting');
  assert.equal(env._debug.documents[0].customMetadata.source_id, 'MTG-000001');
  assert.equal(env._debug.documents[0].customMetadata.content_hash, contentHash);
  const after = plain(ksp.kspGetAiProviderStateEntry_(context.meetingRows[0], 'GEMINI'));
  assert.equal(after.status, 'Indexed');
  assert.equal(after.documentName, existing.name);
  assert.equal(after.lastError, '');
  assert.equal(after.contentHash, contentHash);
});

test('reconciliation-only failure stops on zero or ambiguous exact Documents without upload or delete', () => {
  const cases = [
    [],
    [{
      name: 'fileSearchStores/store-1/documents/wrong',
      state: 'STATE_ACTIVE',
      customMetadata: { source_type: 'Pitchbook', source_id: 'MTG-000001', content_hash: 'wrong-hash' }
    }],
    [
      {
        name: 'fileSearchStores/store-1/documents/existing-1',
        state: 'STATE_ACTIVE',
        customMetadata: { source_type: 'Meeting', source_id: 'MTG-000001', content_hash: 'will-fill' }
      },
      {
        name: 'fileSearchStores/store-1/documents/existing-2',
        state: 'STATE_ACTIVE',
        customMetadata: { source_type: 'Meeting', source_id: 'MTG-000001', content_hash: 'will-fill' }
      }
    ]
  ];
  cases.forEach((documents) => {
    const context = baseContext({ pitchbookRows: [] });
    const contentHash = ksp.kspAiHashTextFallback_('Meeting body');
    documents.forEach((documentValue) => {
      if (documentValue.customMetadata.content_hash === 'will-fill') {
        documentValue.customMetadata.content_hash = contentHash;
      }
    });
    const state = ksp.kspBuildEmptyAiProviderState_();
    state.GEMINI.status = 'Failed';
    state.GEMINI.lastError = JSON.stringify({
      attempt: 1, retryable: false, permanent: true, code: 'AI_DOCUMENT_READBACK_FAILED'
    });
    context.meetingRows[0].AI_Provider_State_JSON = ksp.kspSerializeAiProviderState_(state);
    context.meetingRows[0].AI_Index_Status = 'Failed';
    context.meetingRows[0].AI_Last_Error = state.GEMINI.lastError;
    const env = createSyncEnvironment({ context, documents });
    env.getProviderConfig = (provider) => provider === 'GEMINI'
      ? { provider, enabled: true, storeName: 'fileSearchStores/store-1', modelId: 'gemini-3.7-flash', credentialConfigured: true }
      : { provider, enabled: false, storeName: '', modelId: '', credentialConfigured: false };
    let findCalls = 0;
    env.findProviderDocumentsBySource = () => {
      findCalls += 1;
      return env._debug.documents.map(plain);
    };
    env.uploadProviderSource = () => { throw new Error('RECONCILIATION_MUST_NOT_UPLOAD'); };

    const result = plain(ksp.kspRunProviderNeutralAiSync_(env, { force: true, sourceType: 'Meeting' }));
    assert.equal(result.ok, false);
    assert.equal(result.selected, 1);
    assert.equal(result.failed, 1);
    assert.equal(findCalls, 1);
    assert.equal(env._debug.uploaded.length, 0);
    assert.equal(env._debug.deleted.length, 0);
    const after = plain(ksp.kspGetAiProviderStateEntry_(context.meetingRows[0], 'GEMINI'));
    assert.equal(after.status, 'Failed');
    assert.equal(after.documentName, '');
    assert.equal(after.contentHash, '');
  });
});

test('blank or absent sourceType preserves the combined queue ordering', () => {
  const meetingRows = [
    providerQueueRow('Meeting', 'MTG-COMBINED-LATE', '2026-08-04T00:00:00.000Z'),
    providerQueueRow('Meeting', 'MTG-COMBINED-EARLY', '2026-08-03T00:00:00.000Z')
  ];
  const pitchbookRows = [
    providerQueueRow('Pitchbook', 'DOC-COMBINED-LATE', '2026-08-05T00:00:00.000Z'),
    providerQueueRow('Pitchbook', 'DOC-COMBINED-EARLY', '2026-08-02T00:00:00.000Z')
  ];
  const settings = ksp.kspNormalizeAiSettings_({ AI_SYNC_BATCH_SIZE: '10' });
  const absent = plain(ksp.kspSelectProviderAiWorkItems_(
    meetingRows, pitchbookRows, '2026-08-29T00:00:00.000Z', settings, 'GEMINI'
  ));
  const blank = plain(ksp.kspSelectProviderAiWorkItems_(
    meetingRows, pitchbookRows, '2026-08-29T00:00:00.000Z', settings, 'GEMINI', { sourceType: '  ' }
  ));
  const expected = [
    ['Pitchbook', 'DOC-COMBINED-EARLY'],
    ['Meeting', 'MTG-COMBINED-EARLY'],
    ['Meeting', 'MTG-COMBINED-LATE'],
    ['Pitchbook', 'DOC-COMBINED-LATE']
  ];
  assert.deepEqual(absent.map((item) => [item.sourceType, item.sourceId]), expected);
  assert.deepEqual(blank.map((item) => [item.sourceType, item.sourceId]), expected);
});

test('sourceType filters before sort and slice, excluding permanent failures while keeping Pending Meetings eligible', () => {
  const meetingRows = [
    providerQueueRow('Meeting', 'MTG-PERMANENT-OLDER', '2026-08-01T00:00:00.000Z', {
      AI_Index_Status: 'Failed',
      AI_Last_Error: JSON.stringify({ attempt: 3, retryable: false, permanent: true, code: 'AI_SYNTHETIC_PERMANENT' })
    }),
    providerQueueRow('Meeting', 'MTG-PENDING-NEWER', '2026-08-03T00:00:00.000Z'),
    providerQueueRow('Meeting', 'MTG-PENDING-LATER', '2026-08-04T00:00:00.000Z')
  ];
  const pitchbookRows = [
    providerQueueRow('Pitchbook', 'DOC-PENDING-OLDEST', '2026-07-31T00:00:00.000Z'),
    providerQueueRow('Pitchbook', 'DOC-PENDING-LATER', '2026-08-05T00:00:00.000Z')
  ];
  const settings = ksp.kspNormalizeAiSettings_({ AI_SYNC_BATCH_SIZE: '1' });
  const meetingSelection = plain(ksp.kspSelectProviderAiWorkItems_(
    meetingRows, pitchbookRows, '2026-08-29T00:00:00.000Z', settings, 'GEMINI', { sourceType: 'Meeting' }
  ));
  const pitchbookSelection = plain(ksp.kspSelectProviderAiWorkItems_(
    meetingRows, pitchbookRows, '2026-08-29T00:00:00.000Z', settings, 'GEMINI', { sourceType: 'Pitchbook' }
  ));
  assert.deepEqual(meetingSelection.map((item) => [item.sourceType, item.sourceId]), [
    ['Meeting', 'MTG-PENDING-NEWER']
  ]);
  assert.deepEqual(pitchbookSelection.map((item) => [item.sourceType, item.sourceId]), [
    ['Pitchbook', 'DOC-PENDING-OLDEST']
  ]);
});

test('invalid sourceType fails closed before provider work is selected or processed', () => {
  const env = createSyncEnvironment();
  const result = plain(ksp.kspRunProviderNeutralAiSync_(env, { force: true, sourceType: 'Other' }));
  assert.equal(result.ok, false);
  assert.deepEqual(result.errors, [{ code: 'AI_SYNC_SOURCE_TYPE_INVALID' }]);
  assert.equal(env._debug.uploaded.length, 0);
  assert.doesNotMatch(JSON.stringify(result), /MTG-|DOC-|store|document/i);
});
