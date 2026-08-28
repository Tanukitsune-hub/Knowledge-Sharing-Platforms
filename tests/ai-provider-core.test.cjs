const { test, assert, ksp, plain, baseContext, createSyncEnvironment } = require('./ai-test-helpers.cjs');

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
