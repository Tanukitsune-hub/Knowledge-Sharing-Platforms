const { test, assert, ksp, plain, baseContext, createSyncEnvironment } = require('./ai-test-helpers.cjs');

const sourceIds = {
  Meeting: 'MTG-000001', Pitchbook: 'DOC-000001',
  News: 'NEWS-000001', 'Internal Assessment': 'ASMT-000001'
};

function fixture() {
  const context = baseContext({
    counterpartyRows: [
      { Counterparty_ID: 'GP-1', Counterparty_Name: 'GP One', Counterparty_Type: 'GP', Status: 'Active' },
      { Counterparty_ID: 'CP-000031', Counterparty_Name: 'Firm A', Counterparty_Type: 'MANAGER', Status: 'Active' },
      { Counterparty_ID: 'CP-000032', Counterparty_Name: 'Firm B', Counterparty_Type: 'MANAGER', Status: 'Active' }
    ],
    newsRows: [{
      News_ID: sourceIds.News, Published_Date: '2026-08-03', Publisher: 'Publisher A', Title: 'News A',
      Counterparty_IDs: 'CP-000031,CP-000032', Asset_Class_ID: 'AC-1', Fund_Strategy: 'Strategy A',
      Input_Mode: 'DIRECT_TEXT', Source_File_ID: 'news-doc-1', Source_URL: 'https://docs.google.com/document/d/news-doc-1/edit',
      Source_Mime_Type: 'application/vnd.google-apps.document', Saved_Filename: 'news-doc', Status: 'Active'
    }],
    assessmentRows: [{
      Assessment_ID: sourceIds['Internal Assessment'], Assessment_Date: '2026-08-04',
      Assessment_Type: 'IC_DECISION', Title: 'Assessment A', Decision_Or_Action: 'Review',
      Counterparty_IDs: 'CP-000031,CP-000032', Asset_Class_ID: 'AC-1', Fund_Strategy: 'Strategy A',
      Input_Mode: 'DIRECT_TEXT', Source_File_ID: 'assessment-doc-1',
      Source_URL: 'https://docs.google.com/document/d/assessment-doc-1/edit',
      Source_Mime_Type: 'application/vnd.google-apps.document', Saved_Filename: 'assessment-doc',
      Related_Meeting_IDs: 'MTG-000001', Related_Document_IDs: 'DOC-000001',
      Related_News_IDs: 'NEWS-000001', Status: 'Active'
    }]
  });
  context.state.resources.newsFolderId = 'news-folder';
  context.state.resources.internalAssessmentsFolderId = 'assessment-folder';
  context.settings = { ...context.settings, OPENAI_ENABLED: 'true',
    OPENAI_VECTOR_STORE_ID: 'vs-synthetic', OPENAI_DEFAULT_MODEL: 'gpt-5.6-terra', GEMINI_ENABLED: 'false' };
  for (const [sourceType, id] of Object.entries(sourceIds)) {
    const row = sourceType === 'Meeting' ? context.meetingRows[0] : sourceType === 'Pitchbook'
      ? context.pitchbookRows[0] : sourceType === 'News' ? context.newsRows[0] : context.assessmentRows[0];
    row.AI_Provider_State_JSON = ksp.kspSerializeAiProviderState_(
      ksp.kspBuildAiProviderStatePatch_(row, 'OPENAI', {
        status: 'Indexed', providerDocumentId: `file-${id}`, documentName: `file-${id}`,
        contentHash: `hash-${id}`, indexedAt: '2026-08-05T00:00:00.000Z'
      })
    );
  }
  return context;
}

function canonical(raw = {}) {
  return ksp.kspValidateCanonicalKnowledgeRequest_(ksp.kspBuildCanonicalKnowledgeRequest_({
    mode: '自由質問', questionOrInstruction: 'Synthetic question', ...raw
  }));
}

test('canonical sourceTypes are ordered, unique, top-level, and scalar is input-only', () => {
  const value = plain(canonical({ filters: { sourceTypes: ['News', 'Meeting', 'News'] } }));
  assert.deepEqual(value.sourceTypes, ['Meeting', 'News']);
  assert.deepEqual(value.filters.sourceTypes, ['Meeting', 'News']);
  assert.equal(Object.hasOwn(value, 'sourceType'), false);
  assert.equal(Object.hasOwn(value.filters, 'sourceType'), false);
  assert.deepEqual(plain(canonical({ sourceType: 'Pitchbook' }).sourceTypes), ['Pitchbook']);
  assert.throws(() => canonical({ sourceTypes: [] }), error => error.code === 'AI_SOURCE_TYPES_REQUIRED');
  assert.throws(() => canonical({ sourceTypes: ['Other'] }), error => error.code === 'AI_SOURCE_TYPE_INVALID');
  assert.throws(() => canonical({ sourceTypes: ['News'], filters: { sourceTypes: ['Meeting'] } }),
    error => error.code === 'AI_SOURCE_TYPES_CONFLICT');
  assert.throws(() => canonical({ sourceTypes: ['Meeting', 'News'], filters: { teamId: 'TEAM-1' } }),
    error => error.code === 'AI_FILTER_SOURCE_TYPE_INCOMPATIBLE');
  const config = { modelId: 'model', modelProfileId: 'p', thinkingProfileId: 't' };
  assert.equal(ksp.kspKnowledgeQueryFingerprint_('OPENAI', config, canonical({ sourceTypes: ['News', 'Meeting'] })),
    ksp.kspKnowledgeQueryFingerprint_('OPENAI', config, canonical({ sourceTypes: ['Meeting', 'News'] })));
});

test('four-source authoritative scope keeps one multi-Counterparty source and excludes Inactive', () => {
  const context = fixture();
  const request = canonical({ sourceTypes: ['News', 'Internal Assessment'],
    filters: { entityKey: 'COUNTERPARTY:CP-000032', assetClassId: 'AC-1' } });
  const scoped = plain(ksp.kspRestrictKnowledgeEligibleSources_(request, context));
  assert.deepEqual(scoped.resolvedSourceIds, ['ASMT-000001', 'NEWS-000001']);
  assert.equal(scoped.sourceTypes.length, 2);
  const maps = ksp.kspBuildAuthoritativeSourceMaps_(context.meetingRows, context.pitchbookRows,
    context.newsRows, context.assessmentRows);
  assert.equal(Object.keys(maps.bySourceKey).filter(key => key === 'News:NEWS-000001').length, 1);
  assert.deepEqual(plain(maps.bySourceKey['News:NEWS-000001'].counterpartyIds), ['CP-000031', 'CP-000032']);
  assert.equal(maps.bySourceKey['News:NEWS-000001'].aiProviderStateJson, context.newsRows[0].AI_Provider_State_JSON);
  context.newsRows[0].Status = 'Inactive';
  assert.deepEqual(plain(ksp.kspRestrictKnowledgeEligibleSources_(request, context).resolvedSourceIds), ['ASMT-000001']);
});

test('citation mapping preserves News and internal-assessment provenance and rejects outside scope', () => {
  const context = fixture();
  const maps = ksp.kspBuildAuthoritativeSourceMaps_(context.meetingRows, context.pitchbookRows,
    context.newsRows, context.assessmentRows);
  const raw = ['News', 'Internal Assessment'].map(type => ({
    metadata: { source_type: type, source_id: sourceIds[type] }
  }));
  const scope = plain(ksp.kspRestrictKnowledgeEligibleSources_(canonical({ sourceTypes: ['News', 'Internal Assessment'] }), context));
  const mapped = plain(ksp.kspMapKnowledgeCitations_(raw, maps, scope));
  assert.deepEqual(mapped.citations.map(item => item.sourceId), ['NEWS-000001', 'ASMT-000001']);
  assert.match(mapped.citations[0].provenanceSummary, /Publisher A.*2026-08-03/);
  assert.match(mapped.citations[1].provenanceSummary, /当時の社内評価.*IC \/ 投資判断/);
  assert.equal(mapped.citations[1].internalAssessment, true);
  assert.equal(mapped.citations[1].driveUrl, context.assessmentRows[0].Source_URL);
  assert.doesNotMatch(JSON.stringify(mapped.citations), /aiProviderStateJson|file-ASMT-000001/);
  const denied = plain(ksp.kspMapKnowledgeCitations_(raw, maps,
    ksp.kspRestrictKnowledgeEligibleSources_(canonical({ sourceTypes: ['News'] }), context)));
  assert.equal(denied.citations.length, 1);
  assert.ok(denied.warnings.some(item => item.code === 'AI_CITATION_OUTSIDE_SCOPE'));
  const ambiguous = ksp.kspBuildAuthoritativeSourceMaps_(context.meetingRows, context.pitchbookRows,
    [context.newsRows[0], { ...context.newsRows[0], Source_File_ID: 'different-file' }], context.assessmentRows);
  assert.equal(ambiguous.bySourceKey['News:NEWS-000001'], null);
});

test('normal citation link must identify the authoritative Drive file exactly', () => {
  const context = fixture();
  const environment = createSyncEnvironment({ context });
  environment.getDriveFileMetadata = fileId => ({ id: fileId, parents: ['news-folder'], trashed: false,
    mimeType: 'application/vnd.google-apps.document' });
  const citation = [{ sourceType: 'News', sourceId: 'NEWS-000001' }];
  assert.doesNotThrow(() => ksp.kspValidateCitedDriveSources_(environment, context, citation));
  context.newsRows[0].Source_URL = 'https://docs.google.com/document/d/news-doc-1-extra/edit';
  assert.throws(() => ksp.kspValidateCitedDriveSources_(environment, context, citation),
    error => error.code === 'AI_CITED_SOURCE_UNAVAILABLE');
});

test('fake provider query matrix uses authoritative IDs and source-scoped citations', () => {
  const context = fixture();
  const env = createSyncEnvironment({ context });
  const fileRows = [
    [context.meetingRows[0], 'Doc_File_ID', 'meeting-folder'],
    [context.pitchbookRows[0], 'File_ID', 'pitchbook-folder'],
    [context.newsRows[0], 'Source_File_ID', 'news-folder'],
    [context.assessmentRows[0], 'Source_File_ID', 'assessment-folder']
  ];
  env.getDriveFileMetadata = fileId => {
    const matched = fileRows.find(([row, field]) => row[field] === fileId);
    if (!matched) throw new Error('Synthetic file missing');
    return { id: fileId, parents: [matched[2]], trashed: false,
      mimeType: matched[0].Input_Mode === 'DIRECT_TEXT' || matched[1] === 'Doc_File_ID'
        ? 'application/vnd.google-apps.document' : 'text/plain' };
  };
  env.getProviderConfig = provider => ({ provider, enabled: true, vectorStoreId: 'vs-synthetic',
    modelId: 'gpt-5.6-terra', credentialConfigured: true });
  let selectedType = '';
  let selectedTypes = [];
  env.startQueryProvider = (provider, config, request) => {
    const id = sourceIds[selectedType];
    const filter = JSON.stringify(request.filters);
    if (selectedTypes.includes('Pitchbook')) assert.match(filter, new RegExp(id));
    else {
      assert.doesNotMatch(filter, /source_id/);
      assert.match(filter, /source_type/);
    }
    const row = selectedType === 'Meeting' ? context.meetingRows[0] : selectedType === 'Pitchbook'
      ? context.pitchbookRows[0] : selectedType === 'News' ? context.newsRows[0] : context.assessmentRows[0];
    const state = ksp.kspParseAiProviderState_(row.AI_Provider_State_JSON, row).OPENAI;
    return { status: 'completed', response: { output: [
      { type: 'file_search_call', status: 'completed', results: [{
        file_id: state.providerDocumentId, filename: row.Saved_Filename,
        attributes: { source_type: selectedType, source_id: id, content_hash: state.contentHash }
      }] },
      { type: 'message', content: [{ type: 'output_text', text: 'Synthetic grounded answer', annotations: [] }] }
    ] } };
  };
  const selections = [
    [['Meeting'], 'Meeting'], [['Pitchbook'], 'Pitchbook'], [['News'], 'News'],
    [['Internal Assessment'], 'Internal Assessment'], [['Meeting', 'News'], 'News'],
    [['Meeting', 'Pitchbook', 'News', 'Internal Assessment'], 'Internal Assessment']
  ];
  for (const [types, cited] of selections) {
    selectedType = cited;
    selectedTypes = types;
    const result = plain(ksp.kspRunProviderKnowledgeSearch_(env, 'OPENAI', {
      mode: '自由質問', questionOrInstruction: `Synthetic ${types.join('+')} question`, sourceTypes: types
    }));
    assert.equal(result.ok, true, JSON.stringify(result));
    assert.equal(result.insufficientEvidence, false, JSON.stringify(result));
    assert.deepEqual(result.citations.map(item => item.sourceId), [sourceIds[cited]]);
  }
  selectedType = 'News';
  env.startQueryProvider = (provider, config, request) => {
    assert.doesNotMatch(JSON.stringify(request.filters), /NEWS-000001/);
    const row = context.newsRows[0];
    const state = ksp.kspParseAiProviderState_(row.AI_Provider_State_JSON, row).OPENAI;
    return { status: 'completed', response: { output: [
      { type: 'file_search_call', status: 'completed', results: [{
        file_id: state.providerDocumentId,
        attributes: { source_type: 'News', source_id: sourceIds.News, content_hash: state.contentHash }
      }] },
      { type: 'message', content: [{ type: 'output_text', text: 'Unselected evidence', annotations: [] }] }
    ] } };
  };
  const unselected = plain(ksp.kspRunProviderKnowledgeSearch_(env, 'OPENAI', {
    mode: '自由質問', questionOrInstruction: 'Unselected-source synthetic question', sourceTypes: ['Meeting']
  }));
  assert.equal(unselected.ok, true);
  assert.equal(unselected.insufficientEvidence, true);
  assert.deepEqual(unselected.citations, []);
  assert.ok(unselected.warnings.some(item => item.code === 'AI_CITATION_OUTSIDE_SCOPE'));
  assert.doesNotMatch(unselected.answer, /Unselected evidence/);
});

test('source record work items materialize one direct Doc and one upload through shared format registry', () => {
  const context = fixture();
  const maps = ksp.kspBuildAiMasterMaps_(context.counterpartyRows, context.optionRows);
  const env = createSyncEnvironment({ context, meetingText: 'Authoritative direct text', txtText: 'Uploaded TXT body' });
  const news = ksp.kspAiWorkItemFromRow_('News', context.newsRows[0]);
  const direct = plain(ksp.kspBuildFeatureFreezeAiSource_(env, news, maps));
  assert.equal(direct.sourceId, 'NEWS-000001');
  assert.equal(direct.text, 'Authoritative direct text');
  assert.deepEqual(direct.counterpartyIds, ['CP-000031', 'CP-000032']);
  assert.equal(direct.payloadKind, 'text');
  const assessmentDirect = plain(ksp.kspBuildFeatureFreezeAiSource_(env,
    ksp.kspAiWorkItemFromRow_('Internal Assessment', context.assessmentRows[0]), maps));
  assert.match(assessmentDirect.text, /位置付け: 当時の社内評価/);
  assert.match(assessmentDirect.text, /Authoritative direct text/);
  const uploadRow = { ...context.assessmentRows[0], Input_Mode: 'UPLOAD_FILE',
    Original_Filename: 'review.txt', Saved_Filename: 'review.txt', Source_Mime_Type: 'text/plain' };
  const upload = plain(ksp.kspBuildFeatureFreezeAiSource_(env,
    ksp.kspAiWorkItemFromRow_('Internal Assessment', uploadRow), maps));
  assert.equal(upload.sourceId, 'ASMT-000001');
  assert.equal(upload.payloadKind, 'binary');
  assert.equal(upload.mimeType, 'text/plain');
  assert.equal(upload.extension, 'txt');
  assert.equal(upload.bytes.length > 0, true);
});

test('Gemini scoped request uses bounded source IDs after authoritative Entity membership resolution', () => {
  const context = fixture();
  const scoped = ksp.kspRestrictKnowledgeEligibleSources_(canonical({
    sourceTypes: ['News', 'Internal Assessment'],
    filters: { entityKey: 'COUNTERPARTY:CP-000032' }
  }), context);
  const request = plain(ksp.kspBuildProviderSearchRequest_('GEMINI', {
    modelId: 'gemini-synthetic', storeName: 'fileSearchStores/synthetic', queryTransport: 'INTERACTIONS'
  }, scoped));
  assert.match(request.metadataFilter, /NEWS-000001/);
  assert.match(request.metadataFilter, /ASMT-000001/);
  assert.doesNotMatch(request.metadataFilter, /entity_key/);
  assert.throws(() => ksp.kspBuildProviderSearchRequest_('GEMINI', {
    modelId: 'gemini-synthetic', storeName: 'fileSearchStores/synthetic'
  }, { ...scoped, resolvedSourceIds: [] }),
  error => error.code === 'AI_ADVANCED_FILTER_NO_EVIDENCE');
});

test('broad Meeting and source-record queries use provider metadata beyond 40 authoritative IDs', () => {
  const context = fixture();
  context.meetingRows = Array.from({ length: 41 }, (_, index) => {
    const id = `MTG-${String(index + 1).padStart(6, '0')}`;
    return { ...context.meetingRows[0], Meeting_ID: id, Doc_File_ID: `doc-${id}`,
      Doc_URL: `https://docs.google.com/document/d/doc-${id}/edit`, Related_Pitchbook_IDs: '' };
  });
  const meetingScope = ksp.kspRestrictKnowledgeEligibleSources_(canonical({ sourceTypes: ['Meeting'] }), context);
  assert.equal(meetingScope.resolvedSourceIds.length, 41);
  const openAi = plain(ksp.kspBuildProviderSearchRequest_('OPENAI',
    { modelId: 'synthetic', vectorStoreId: 'vs-synthetic' }, meetingScope));
  assert.match(JSON.stringify(openAi.filters), /source_type/);
  assert.doesNotMatch(JSON.stringify(openAi.filters), /source_id/);
  const gemini = plain(ksp.kspBuildProviderSearchRequest_('GEMINI',
    { modelId: 'synthetic', storeName: 'fileSearchStores/synthetic' }, meetingScope));
  assert.match(gemini.metadataFilter, /source_type = "Meeting"/);
  assert.doesNotMatch(gemini.metadataFilter, /source_id/);
  const env = createSyncEnvironment({ context });
  env.getProviderConfig = provider => ({ provider, enabled: true, vectorStoreId: 'vs-synthetic',
    modelId: 'gpt-5.6-terra', credentialConfigured: true });
  let starts = 0;
  env.startQueryProvider = (_provider, _config, request) => {
    starts += 1;
    assert.doesNotMatch(JSON.stringify(request.filters), /source_id/);
    return { status: 'completed', response: { output: [
      { type: 'message', content: [{ type: 'output_text', text: 'Synthetic answer', annotations: [] }] }
    ] } };
  };
  const result = plain(ksp.kspRunProviderKnowledgeSearch_(env, 'OPENAI', {
    mode: '自由質問', questionOrInstruction: 'Broad Meeting request', sourceTypes: ['Meeting']
  }));
  assert.equal(result.ok, true, JSON.stringify(result));
  assert.equal(starts, 1);

  const noFollow = ksp.kspRestrictKnowledgeEligibleSources_(canonical({ sourceTypes: ['Meeting'],
    filters: { followUp: 'NOT_REQUIRED' } }), context);
  assert.equal(noFollow.resolvedSourceIds.length, 41);
  const openAiNoFollow = plain(ksp.kspBuildProviderSearchRequest_('OPENAI',
    { modelId: 'synthetic', vectorStoreId: 'vs-synthetic' }, noFollow));
  assert.match(JSON.stringify(openAiNoFollow.filters), /follow_up_required/);
  assert.doesNotMatch(JSON.stringify(openAiNoFollow.filters), /source_id/);
  assert.throws(() => ksp.kspBuildProviderSearchRequest_('GEMINI',
    { modelId: 'synthetic', storeName: 'fileSearchStores/synthetic' }, noFollow),
  error => error.code === 'AI_ADVANCED_FILTER_TOO_BROAD');
  const narrowNoFollow = ksp.kspRestrictKnowledgeEligibleSources_(canonical({ sourceTypes: ['Meeting'],
    filters: { followUp: 'NOT_REQUIRED' } }), { ...context, meetingRows: context.meetingRows.slice(0, 1) });
  const geminiNoFollow = plain(ksp.kspBuildProviderSearchRequest_('GEMINI',
    { modelId: 'synthetic', storeName: 'fileSearchStores/synthetic' }, narrowNoFollow));
  assert.match(geminiNoFollow.metadataFilter, /source_id = "MTG-000001"/);
  assert.doesNotMatch(geminiNoFollow.metadataFilter, /follow_up_required/);

  context.newsRows = Array.from({ length: 41 }, (_, index) => {
    const id = `NEWS-${String(index + 1).padStart(6, '0')}`;
    return { ...context.newsRows[0], News_ID: id, Source_File_ID: `doc-${id}`,
      Source_URL: `https://docs.google.com/document/d/doc-${id}/edit`, AI_Provider_State_JSON: '' };
  });
  const recordScope = ksp.kspRestrictKnowledgeEligibleSources_(canonical({
    sourceTypes: ['News', 'Internal Assessment'],
    filters: { dateFrom: '2026-08-01', assetClassId: 'AC-1' }
  }), context);
  assert.equal(recordScope.resolvedSourceIds.length, 42);
  const recordOpenAi = plain(ksp.kspBuildProviderSearchRequest_('OPENAI',
    { modelId: 'synthetic', vectorStoreId: 'vs-synthetic' }, recordScope));
  assert.match(JSON.stringify(recordOpenAi.filters), /date_key/);
  assert.match(JSON.stringify(recordOpenAi.filters), /asset_class_id/);
  assert.doesNotMatch(JSON.stringify(recordOpenAi.filters), /source_id/);
  const recordGemini = plain(ksp.kspBuildProviderSearchRequest_('GEMINI',
    { modelId: 'synthetic', storeName: 'fileSearchStores/synthetic' }, recordScope));
  assert.match(recordGemini.metadataFilter, /date_key/);
  assert.match(recordGemini.metadataFilter, /asset_class_id/);
  assert.doesNotMatch(recordGemini.metadataFilter, /source_id/);
});

test('provider-required News membership at 41 IDs fails before query transport', () => {
  const context = fixture();
  context.newsRows = Array.from({ length: 41 }, (_, index) => {
    const id = `NEWS-${String(index + 1).padStart(6, '0')}`;
    return { ...context.newsRows[0], News_ID: id, Source_File_ID: `doc-${id}`,
      Source_URL: `https://docs.google.com/document/d/doc-${id}/edit`, AI_Provider_State_JSON: '' };
  });
  const scoped = ksp.kspRestrictKnowledgeEligibleSources_(canonical({ sourceTypes: ['News'],
    filters: { entityKey: 'COUNTERPARTY:CP-000032' } }), context);
  assert.equal(scoped.resolvedSourceIds.length, 41);
  for (const [provider, config] of [
    ['OPENAI', { modelId: 'synthetic', vectorStoreId: 'vs-synthetic' }],
    ['GEMINI', { modelId: 'synthetic', storeName: 'fileSearchStores/synthetic' }]
  ]) {
    assert.throws(() => ksp.kspBuildProviderSearchRequest_(provider, config, scoped),
      error => error.code === 'AI_ADVANCED_FILTER_TOO_BROAD');
  }
  const env = createSyncEnvironment({ context });
  env.getProviderConfig = provider => ({ provider, enabled: true, vectorStoreId: 'vs-synthetic',
    modelId: 'gpt-5.6-terra', credentialConfigured: true });
  let starts = 0;
  env.startQueryProvider = () => { starts += 1; throw new Error('provider must not start'); };
  const result = plain(ksp.kspRunProviderKnowledgeSearch_(env, 'OPENAI', {
    mode: '自由質問', questionOrInstruction: 'Membership-bound request', sourceTypes: ['News'],
    filters: { entityKey: 'COUNTERPARTY:CP-000032' }
  }));
  assert.equal(result.ok, false);
  assert.equal(result.error.code, 'AI_ADVANCED_FILTER_TOO_BROAD');
  assert.equal(starts, 0);
});
