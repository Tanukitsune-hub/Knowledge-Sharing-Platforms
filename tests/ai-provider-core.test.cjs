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
    'follow_up_required'
  ]);
  assert.equal(Object.hasOwn(attributes, 'drive_url'), false);
  assert.equal(Object.hasOwn(attributes, 'saved_filename'), false);
  assert.equal(Object.hasOwn(attributes, 'content_hash'), false);
});

test('OpenAI request filters use exact stable fields and response citations map Meeting and Pitchbook', () => {
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
  const meeting = { ...baseContext().meetingRows[0], AI_Provider_State_JSON: ksp.kspSerializeAiProviderState_(state) };
  const pitchbookState = ksp.kspBuildEmptyAiProviderState_();
  pitchbookState.OPENAI.providerDocumentId = 'openai-pitchbook-file';
  const pitchbook = { ...baseContext().pitchbookRows[0], AI_Provider_State_JSON: ksp.kspSerializeAiProviderState_(pitchbookState) };
  const response = ksp.kspNormalizeOpenAiResponse_({
    id: 'response-synthetic',
    output: [
      { type: 'file_search_call', results: [
        { file_id: 'openai-meeting-file', attributes: { source_type: 'Meeting', source_id: 'MTG-000001' } },
        { file_id: 'openai-pitchbook-file', attributes: { source_type: 'Pitchbook', source_id: 'DOC-000001' } }
      ] },
      { type: 'message', content: [{
        type: 'output_text', text: 'Grounded synthetic answer', annotations: [
          { type: 'file_citation', file_id: 'openai-meeting-file', filename: 'meeting.txt' },
          { type: 'file_citation', file_id: 'openai-pitchbook-file', filename: 'pitchbook.txt' }
        ]
      }] }
    ]
  });
  const mapped = plain(ksp.kspMapKnowledgeCitations_(response.citations,
    ksp.kspBuildAuthoritativeSourceMaps_([meeting], [pitchbook])));
  assert.equal(mapped.citations.length, 2);
  assert.deepEqual(mapped.citations.map((item) => item.sourceType).sort(), ['Meeting', 'Pitchbook']);
  assert.equal(mapped.warnings.length, 0);
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
