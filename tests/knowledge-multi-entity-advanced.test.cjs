const { test, assert, ksp, plain, baseContext, createSyncEnvironment } = require('./ai-test-helpers.cjs');

function fixtures() {
  const gps = [1, 2, 3].map(index => ({ GP_ID: `GP-${index}`, GP_Name: `GP ${index}`, Status: 'Active' }));
  const options = [1, 2, 3, 4].map(index => ({
    Option_ID: `LP-${index}`, Type: 'COUNTERPARTY_LP', Name: `LP ${index}`,
    Sort_Order: index, Status: 'Active'
  }));
  const meetings = [
    { Meeting_ID: 'MTG-1', Date: '2026-08-01', Counterparty_Type: 'LP_ASSET_OWNER', Counterparty_ID: 'LP-1',
      Related_GP_IDs: 'GP-1,GP-2', Meeting_Type_Codes: 'ANNUAL_REVIEW,OFFICE_VISIT', Status: 'Active' },
    { Meeting_ID: 'MTG-2', Date: '2026-08-02', Counterparty_Type: 'LP_ASSET_OWNER', Counterparty_ID: 'LP-1',
      Related_GP_IDs: 'GP-10', Meeting_Type_Codes: 'ANNUAL', Status: 'Active' },
    { Meeting_ID: 'MTG-3', Date: '2026-08-03', Counterparty_Type: 'GP', Counterparty_ID: 'GP-1', GP_ID: 'GP-1',
      Related_GP_IDs: 'GP-1', Meeting_Type_Codes: 'OFFICE_VISIT', Status: 'Active' },
    { Meeting_ID: 'MTG-4', Date: '2026-08-04', Counterparty_Type: 'LP_ASSET_OWNER', Counterparty_ID: 'LP-2',
      Related_GP_IDs: 'GP-1', Meeting_Type_Codes: 'ANNUAL_REVIEW', Status: 'Inactive' }
  ];
  return { gps, options, meetings, pitchbooks: [] };
}

function request(overrides = {}) {
  return ksp.kspNormalizeCanonicalKnowledgeRequest_({
    route: 'OPENAI', mode: '比較', questionOrInstruction: '', filters: {},
    selectedEntityKeys: ['GP:GP-1', 'LP_ASSET_OWNER:LP-1'],
    modelProfileId: 'openai-current-default', thinkingProfileId: 'provider-default',
    ...overrides
  });
}

function catalog() {
  const data = fixtures();
  return ksp.kspBuildKnowledgeSearchCatalog_(data.gps, data.options, data.meetings, data.pitchbooks);
}

test('explicit comparison accepts exactly 2 or 5 unique stable Entity keys', () => {
  assert.doesNotThrow(() => ksp.kspValidateCanonicalKnowledgeRequest_(request()));
  assert.doesNotThrow(() => ksp.kspValidateCanonicalKnowledgeRequest_(request({
    selectedEntityKeys: ['GP:GP-1', 'GP:GP-2', 'LP_ASSET_OWNER:LP-1', 'LP_ASSET_OWNER:LP-2', 'LP_ASSET_OWNER:LP-3']
  })));
});

test('explicit comparison rejects 1, 6, duplicates, stale IDs, and ambiguous single scope', () => {
  assert.throws(() => ksp.kspValidateCanonicalKnowledgeRequest_(request({ selectedEntityKeys: ['GP:GP-1'] })),
    error => error.code === 'AI_MULTI_ENTITY_COUNT_INVALID');
  assert.throws(() => ksp.kspValidateCanonicalKnowledgeRequest_(request({
    selectedEntityKeys: ['GP:GP-1', 'GP:GP-2', 'GP:GP-3', 'LP_ASSET_OWNER:LP-1', 'LP_ASSET_OWNER:LP-2', 'LP_ASSET_OWNER:LP-3']
  })), error => error.code === 'AI_MULTI_ENTITY_COUNT_INVALID');
  assert.throws(() => ksp.kspValidateCanonicalKnowledgeRequest_(request({
    selectedEntityKeys: ['GP:GP-1', 'GP:GP-1']
  })), error => error.code === 'AI_MULTI_ENTITY_DUPLICATE');
  const stale = request({ selectedEntityKeys: ['GP:GP-1', 'LP_ASSET_OWNER:MISSING'] });
  assert.throws(() => ksp.kspValidateKnowledgeFilterIds_(stale, catalog()),
    error => error.code === 'AI_ENTITY_FILTER_UNAVAILABLE');
  assert.throws(() => ksp.kspValidateCanonicalKnowledgeRequest_(request({
    filters: { entityKey: 'GP:GP-2' }
  })), error => error.code === 'AI_MULTI_ENTITY_AMBIGUOUS_SCOPE');
});

test('OpenAI filter uses exact Entity OR and bounded exact source IDs only', () => {
  const built = plain(ksp.kspBuildOpenAiFilter_({
    ...request(), filters: { sourceType: 'Meeting' }, resolvedSourceIds: ['MTG-1', 'MTG-3'], advancedFilterResolved: true
  }));
  assert.equal(built.type, 'and');
  const entityOr = built.filters.find(item => item.type === 'or' && item.filters[0].key === 'entity_key');
  const sourceOr = built.filters.find(item => item.type === 'or' && item.filters[0].key === 'source_id');
  assert.deepEqual(entityOr.filters.map(item => item.value), ['GP:GP-1', 'LP_ASSET_OWNER:LP-1']);
  assert.deepEqual(sourceOr.filters.map(item => item.value), ['MTG-1', 'MTG-3']);
});

test('citation attribution groups selected Entities, reports gaps, and rejects unselected Entity citations', () => {
  const citations = [
    { sourceId: 'MTG-3', entityKey: 'GP:GP-1' },
    { sourceId: 'MTG-1', entityKey: 'LP_ASSET_OWNER:LP-1' },
    { sourceId: 'MTG-X', entityKey: 'LP_ASSET_OWNER:LP-2' }
  ];
  const guarded = plain(ksp.kspGuardKnowledgeComparisonCitations_(request(), catalog(), citations));
  assert.deepEqual(guarded.citations.map(item => item.sourceId), ['MTG-3', 'MTG-1']);
  assert.equal(guarded.rejectedUnselected, true);
  assert.ok(guarded.warnings.some(item => item.code === 'AI_UNSELECTED_ENTITY_CITATION'));
  assert.deepEqual(guarded.entityEvidence.map(item => [item.entityKey, item.evidenceStatus, item.citationCount]), [
    ['GP:GP-1', 'CITED', 1], ['LP_ASSET_OWNER:LP-1', 'CITED', 1]
  ]);
  const gap = plain(ksp.kspGuardKnowledgeComparisonCitations_(request(), catalog(), [citations[0]]));
  assert.equal(gap.entityEvidence[1].evidenceStatus, 'NO_EVIDENCE');
  assert.ok(gap.warnings.some(item => item.code === 'AI_ENTITY_EVIDENCE_GAP'));
});

test('Related GP and Meeting Type resolve by exact token AND without substring or inactive matches', () => {
  const data = fixtures();
  const normalized = request({
    mode: '要約', selectedEntityKeys: [], filters: {
      entityKey: 'LP_ASSET_OWNER:LP-1', relatedGpId: 'GP-1', meetingTypeCode: 'ANNUAL_REVIEW'
    }
  });
  assert.equal(normalized.filters.sourceType, 'Meeting');
  ksp.kspValidateKnowledgeFilterIds_(normalized, catalog());
  const resolved = plain(ksp.kspResolveKnowledgeAdvancedSourceIds_(normalized, data.meetings));
  assert.deepEqual(resolved.resolvedSourceIds, ['MTG-1']);
  const partialGp = plain(ksp.kspResolveKnowledgeAdvancedSourceIds_(request({
    mode: '要約', selectedEntityKeys: [], filters: { relatedGpId: 'GP-1' }
  }), [data.meetings[1]]));
  assert.deepEqual(partialGp.resolvedSourceIds, []);
  const partialType = plain(ksp.kspResolveKnowledgeAdvancedSourceIds_(request({
    mode: '要約', selectedEntityKeys: [], filters: { meetingTypeCode: 'ANNUAL_REVIEW' }
  }), [data.meetings[1]]));
  assert.deepEqual(partialType.resolvedSourceIds, []);
});

test('advanced Meeting-only filters fail closed, avoid broad retrieval when empty, and enforce the source-ID bound', () => {
  assert.throws(() => ksp.kspValidateCanonicalKnowledgeRequest_(request({
    mode: '要約', selectedEntityKeys: [], filters: { sourceType: 'Pitchbook', relatedGpId: 'GP-1' }
  })), error => error.code === 'AI_FILTER_SOURCE_TYPE_INCOMPATIBLE');
  const empty = plain(ksp.kspResolveKnowledgeAdvancedSourceIds_(request({
    mode: '要約', selectedEntityKeys: [], filters: { relatedGpId: 'GP-3' }
  }), fixtures().meetings));
  assert.equal(empty.advancedFilterResolved, true);
  assert.deepEqual(empty.resolvedSourceIds, []);
  const rows = Array.from({ length: 41 }, (_, index) => ({
    Meeting_ID: `MTG-${String(index + 1).padStart(6, '0')}`, Status: 'Active',
    Related_GP_IDs: 'GP-1', Meeting_Type_Codes: 'ANNUAL_REVIEW'
  }));
  assert.throws(() => ksp.kspResolveKnowledgeAdvancedSourceIds_(request({
    mode: '要約', selectedEntityKeys: [], filters: { relatedGpId: 'GP-1' }
  }), rows), error => error.code === 'AI_ADVANCED_FILTER_TOO_BROAD');
});

test('empty advanced pre-resolution returns no-evidence without invoking the provider transport', () => {
  const context = baseContext();
  context.meetingRows[0].Related_GP_IDs = 'GP-OTHER';
  context.settings = {
    ...context.settings,
    OPENAI_ENABLED: 'true', OPENAI_VECTOR_STORE_ID: 'vs-synthetic',
    OPENAI_DEFAULT_MODEL: 'gpt-5.6-terra', GEMINI_ENABLED: 'false'
  };
  const env = createSyncEnvironment({ context });
  env.getProviderConfig = provider => provider === 'OPENAI'
    ? { provider, enabled: true, vectorStoreId: 'vs-synthetic', modelId: 'gpt-5.6-terra', credentialConfigured: true }
    : { provider, enabled: false, storeName: '', modelId: '', credentialConfigured: false };
  const result = plain(ksp.kspRunProviderKnowledgeSearch_(env, 'OPENAI', {
    mode: '要約', questionOrInstruction: '', filters: { sourceType: 'Meeting', relatedGpId: 'GP-1' }
  }));
  assert.equal(result.ok, true);
  assert.equal(result.insufficientEvidence, true);
  assert.deepEqual(result.citations, []);
  assert.equal(env._debug.queryDebug.starts.length, 0);
  assert.ok(result.warnings.some(item => item.code === 'AI_ADVANCED_FILTER_NO_EVIDENCE'));
});

test('FULL_OUTPUT applies identical multi-Entity and exact-token semantics with evidence gaps', () => {
  const data = fixtures();
  const normalized = ksp.kspNormalizeKnowledgeExportInput_(request({ filters: {
    sourceType: 'Meeting', relatedGpId: 'GP-1', meetingTypeCode: 'ANNUAL_REVIEW'
  } }));
  const sources = plain(ksp.kspResolveKnowledgeExportSources_(data.meetings, [], normalized));
  assert.deepEqual(sources.map(item => [item.entityKey, item.sourceId]), [['LP_ASSET_OWNER:LP-1', 'MTG-1']]);
  const model = plain(ksp.kspBuildKnowledgeExportRenderModel_(normalized, [], [], {
    gp: {}, assetClass: {}, capitalType: {}, location: {}, team: {},
    counterparty: { 'GP:GP-1': 'GP 1', 'LP_ASSET_OWNER:LP-1': 'LP 1' }
  }, 'Synthetic'));
  const text = ksp.kspBuildKnowledgeExportPlainText_(model);
  assert.match(text, /Selected Entity: GP 1 \(GP:GP-1\)/);
  assert.match(text, /Selected Entity: LP 1 \(LP_ASSET_OWNER:LP-1\)/);
  assert.match(text, /Evidence gap: GP 1/);
  assert.match(text, /Evidence gap: LP 1/);
});
