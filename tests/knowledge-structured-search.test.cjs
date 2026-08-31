const { test, assert, ksp, plain } = require('./ai-test-helpers.cjs');

function rows() {
  return {
    gps: [
      { GP_ID: 'GP-1', GP_Name: 'Active GP', Status: 'Active' },
      { GP_ID: 'GP-OLD', GP_Name: 'Historical GP', Status: 'Inactive' }
    ],
    options: [
      { Option_ID: 'AC-1', Type: 'ASSET_CLASS', Name: 'Infrastructure', Sort_Order: 1, Status: 'Active' },
      { Option_ID: 'CT-1', Type: 'CAPITAL_TYPE', Name: 'Equity', Sort_Order: 1, Status: 'Active' },
      { Option_ID: 'TEAM-1', Type: 'TEAM', Name: 'Private Equity', Sort_Order: 1, Status: 'Active' },
      { Option_ID: 'LP-OLD', Type: 'COUNTERPARTY_LP', Name: 'Historical LP', Sort_Order: 1, Status: 'Inactive' }
    ],
    meetings: [{
      Meeting_ID: 'MTG-1', Date: '2026-08-01', Counterparty_Type: 'LP_ASSET_OWNER',
      Counterparty_ID: 'LP-OLD', GP_ID: '', Asset_Class_ID: 'AC-1', Capital_Type_ID: 'CT-1',
      Team_ID: 'TEAM-1', Fund_Strategy: 'Exact Strategy', Follow_Up_Required: true, Status: 'Active'
    }],
    pitchbooks: [{
      Document_ID: 'DOC-1', Date: '2026-08-02', GP_ID: 'GP-1', Asset_Class_ID: 'AC-1',
      Capital_Type_ID: 'CT-1', Fund_Strategy: 'Other Strategy', Status: 'Active'
    }]
  };
}

function catalog() {
  const value = rows();
  return ksp.kspBuildKnowledgeSearchCatalog_(value.gps, value.options, value.meetings, value.pitchbooks);
}

function canonical(overrides = {}) {
  return ksp.kspNormalizeCanonicalKnowledgeRequest_({
    route: 'OPENAI', mode: '要約', questionOrInstruction: '',
    filters: { sourceType: 'Meeting' },
    modelProfileId: 'openai-current-default', thinkingProfileId: 'provider-default',
    ...overrides
  });
}

test('one canonical request supplies identical structured filters to OpenAI and FULL_OUTPUT', () => {
  const request = canonical({ filters: {
    dateFrom: '2026-08-01', dateTo: '2026-08-31', counterpartyType: 'LP_ASSET_OWNER',
    entityKey: 'LP_ASSET_OWNER:LP-OLD', gpId: '', assetClassId: 'AC-1', capitalTypeId: 'CT-1',
    teamId: 'TEAM-1', fundStrategy: 'Exact Strategy', followUp: 'REQUIRED', sourceType: 'Meeting'
  } });
  const openAi = plain(ksp.kspBuildOpenAiFilter_(request));
  const fullOutput = plain(ksp.kspKnowledgeExportPublicFilters_(
    ksp.kspNormalizeKnowledgeExportInput_(request)
  ));
  assert.deepEqual(fullOutput, plain(request.filters));
  assert.equal(openAi.type, 'and');
  assert.deepEqual(openAi.filters.map((item) => [item.type, item.key, item.value]), [
    ['gte', 'date_key', '2026-08-01'], ['lte', 'date_key', '2026-08-31'],
    ['eq', 'counterparty_type', 'LP_ASSET_OWNER'], ['eq', 'entity_key', 'LP_ASSET_OWNER:LP-OLD'],
    ['eq', 'asset_class_id', 'AC-1'], ['eq', 'capital_type_id', 'CT-1'],
    ['eq', 'team_id', 'TEAM-1'], ['eq', 'fund_strategy', 'Exact Strategy'],
    ['eq', 'follow_up_required', 'true'], ['eq', 'source_type', 'Meeting']
  ]);
});

test('catalog validation accepts historical stable IDs and rejects stale IDs and fuzzy strategies', () => {
  const historical = canonical({ filters: {
    counterpartyType: 'LP_ASSET_OWNER', entityKey: 'LP_ASSET_OWNER:LP-OLD',
    fundStrategy: 'Exact Strategy', sourceType: 'Meeting'
  } });
  assert.equal(ksp.kspValidateKnowledgeFilterIds_(historical, catalog()), historical);
  assert.throws(() => ksp.kspValidateKnowledgeFilterIds_(canonical({ filters: {
    entityKey: 'LP_ASSET_OWNER:MISSING', sourceType: 'Meeting'
  } }), catalog()), (error) => error.code === 'AI_ENTITY_FILTER_UNAVAILABLE');
  assert.throws(() => ksp.kspValidateKnowledgeFilterIds_(canonical({ filters: {
    fundStrategy: 'Strategy', sourceType: 'Meeting'
  } }), catalog()), (error) => error.code === 'AI_FUND_STRATEGY_FILTER_UNAVAILABLE');
});

test('empty filters are omitted while false follow-up remains an exact clause', () => {
  const unset = ksp.kspBuildOpenAiFilter_(canonical({ filters: {} }));
  assert.equal(unset, undefined);
  const notRequired = plain(ksp.kspBuildOpenAiFilter_(canonical({ filters: {
    followUp: 'NOT_REQUIRED', sourceType: 'Meeting'
  } })));
  assert.deepEqual(notRequired, { type: 'and', filters: [
    { type: 'eq', key: 'follow_up_required', value: 'false' },
    { type: 'eq', key: 'source_type', value: 'Meeting' }
  ] });
});

test('source-incompatible filters and explicit multi-Entity comparison fail closed', () => {
  assert.throws(() => ksp.kspValidateCanonicalKnowledgeRequest_(canonical({ filters: {
    teamId: 'TEAM-1', sourceType: 'Pitchbook'
  } })), (error) => error.code === 'AI_FILTER_SOURCE_TYPE_INCOMPATIBLE');
  assert.throws(() => ksp.kspValidateCanonicalKnowledgeRequest_(canonical({
    mode: '比較', selectedEntityKeys: ['GP:GP-1', 'LP_ASSET_OWNER:LP-OLD']
  })), (error) => error.code === 'AI_MULTI_ENTITY_DEFERRED');
});

test('meeting preparation accepts one exact Entity or GP and rejects an unscoped request', () => {
  assert.doesNotThrow(() => ksp.kspValidateCanonicalKnowledgeRequest_(canonical({
    mode: '面談準備', filters: { entityKey: 'LP_ASSET_OWNER:LP-OLD', sourceType: 'Meeting' }
  })));
  assert.doesNotThrow(() => ksp.kspValidateCanonicalKnowledgeRequest_(canonical({
    mode: '面談準備', filters: { gpId: 'GP-1' }
  })));
  assert.throws(() => ksp.kspValidateCanonicalKnowledgeRequest_(canonical({
    mode: '面談準備', filters: {}
  })), (error) => error.code === 'AI_MEETING_PREP_TARGET_REQUIRED');
});

test('all five modes share one registry and emit distinct bounded prompt contracts', () => {
  const modes = ['自由質問', '要約', '時系列', '比較', '面談準備'];
  const prompts = modes.map((mode) => ksp.kspBuildCanonicalKnowledgePrompt_(canonical({
    mode,
    questionOrInstruction: mode === '自由質問' ? 'What changed?' : '',
    filters: mode === '面談準備' ? { gpId: 'GP-1' } : { sourceType: 'Meeting' }
  })));
  modes.forEach((mode, index) => assert.match(prompts[index], new RegExp(`モード: ${mode}`)));
  assert.match(prompts[2], /証拠が途切れる期間/);
  assert.match(prompts[3], /複数Entityを選択した比較として扱わず/);
  assert.match(prompts[4], /投資判断や推奨を自動生成しない/);
});

test('pending-query fingerprint changes for route, model, thinking, mode and every core filter', () => {
  const config = { modelId: 'gpt-test', modelProfileId: 'profile-1', thinkingProfileId: 'provider-default', thinkingProviderDefault: true };
  const base = canonical({ filters: { sourceType: 'Meeting' } });
  const fingerprint = ksp.kspKnowledgeQueryFingerprint_('OPENAI', config, base);
  const variants = [
    ['GEMINI', config, base],
    ['OPENAI', { ...config, modelProfileId: 'profile-2' }, base],
    ['OPENAI', { ...config, thinkingProfileId: 'low', thinkingProviderDefault: false, thinkingRawValue: 'low' }, base],
    ['OPENAI', config, canonical({ mode: '時系列', filters: { sourceType: 'Meeting' } })],
    ['OPENAI', config, canonical({ filters: { sourceType: 'Meeting', teamId: 'TEAM-1' } })],
    ['OPENAI', config, canonical({ filters: { sourceType: 'Meeting', followUp: 'NOT_REQUIRED' } })]
  ];
  variants.forEach((variant) => assert.notEqual(ksp.kspKnowledgeQueryFingerprint_(...variant), fingerprint));
});

test('FULL_OUTPUT row matching uses exact Entity, Team, strategy and follow-up semantics', () => {
  const row = rows().meetings[0];
  const request = ksp.kspNormalizeKnowledgeExportInput_(canonical({ filters: {
    entityKey: 'LP_ASSET_OWNER:LP-OLD', teamId: 'TEAM-1', fundStrategy: 'Exact Strategy',
    followUp: 'REQUIRED', sourceType: 'Meeting'
  } }));
  assert.equal(ksp.kspKnowledgeExportRowMatches_(row, request), true);
  assert.equal(ksp.kspKnowledgeExportRowMatches_(row, {
    ...request, fundStrategy: 'Strategy', filters: { ...request.filters, fundStrategy: 'Strategy' }
  }), false);
  assert.equal(ksp.kspKnowledgeExportRowMatches_(row, {
    ...request, followUp: 'NOT_REQUIRED', filters: { ...request.filters, followUp: 'NOT_REQUIRED' }
  }), false);
});

test('safe Audit metadata contains stable filters but redacts question and answer content', () => {
  const request = canonical({ questionOrInstruction: 'SECRET QUESTION', filters: {
    entityKey: 'LP_ASSET_OWNER:LP-OLD', teamId: 'TEAM-1', sourceType: 'Meeting'
  } });
  const row = plain(ksp.kspBuildKnowledgeSearchAuditRow_({
    timestamp: '2026-08-31T00:00:00.000Z', input: request, provider: 'OPENAI',
    modelId: 'gpt-test', result: 'Success', citations: [{ sourceId: 'MTG-1' }]
  }));
  assert.equal(row.Search_Mode, '要約');
  assert.equal(row.Question_Or_Instruction, '');
  assert.match(row.After_Metadata_JSON, /LP_ASSET_OWNER:LP-OLD/);
  assert.match(row.After_Metadata_JSON, /TEAM-1/);
  assert.doesNotMatch(JSON.stringify(row), /SECRET QUESTION/);
  assert.doesNotMatch(JSON.stringify(row), /answer/i);
});

test('FULL_OUTPUT package embeds the shared mode and scope while keeping Pitchbooks reference-only', () => {
  const request = ksp.kspNormalizeKnowledgeExportInput_(canonical({
    mode: '比較', questionOrInstruction: 'Compare periods', filters: { sourceType: 'Meeting' }
  }));
  const model = plain(ksp.kspBuildKnowledgeExportRenderModel_(request, [{
    source: { sourceId: 'MTG-1', date: '2026-08-01', canonicalUrl: 'https://docs.google.com/document/d/doc-1/edit', row: rows().meetings[0] },
    body: 'AUTHORITATIVE MEETING BODY'
  }], [{
    source: { sourceId: 'DOC-1', date: '2026-08-02', canonicalUrl: 'https://drive.google.com/open?id=file-1', row: rows().pitchbooks[0] }
  }], { gp: {}, assetClass: {}, capitalType: {}, location: {}, team: {}, counterparty: {} }, 'Synthetic package'));
  const text = ksp.kspBuildKnowledgeExportPlainText_(model);
  assert.match(text, /Mode: 比較/);
  assert.match(text, /Compare periods/);
  assert.match(text, /AUTHORITATIVE MEETING BODY/);
  assert.match(text, /Pitchbooks \/ reference metadata and authoritative links only/);
  assert.doesNotMatch(text, /PITCHBOOK BODY/);
});
