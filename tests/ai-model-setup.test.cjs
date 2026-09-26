const { test, assert, ksp, plain } = require('./ai-test-helpers.cjs');

function setupEnvironment(options = {}) {
  const settings = {
    OPENAI_DEFAULT_MODEL: '', OPENAI_ENABLED: 'false', OPENAI_VECTOR_STORE_ID: '',
    GEMINI_DEFAULT_MODEL: '', GEMINI_ENABLED: 'false', GEMINI_FILE_SEARCH_STORE_NAME: ''
  };
  Object.assign(settings, options.settings || {});
  const context = { settings, backendSpreadsheetId: 'synthetic-backend',
    meetingRows: [], pitchbookRows: [], newsRows: [], assessmentRows: [] };
  const calls = { qualify: [], commit: [], models: [], cache: [], store: [], result: null };
  let generation = options.generation || 'legacy';
  const cache = new Map();
  const env = {
    nowIso: () => '2026-09-26T00:00:00.000Z',
    loadAiContext: () => context,
    getAiCredentialGeneration: () => generation,
    isOpenAiCredentialConfigured: () => options.openaiCredentialConfigured !== false,
    isGeminiCredentialConfigured: () => options.geminiCredentialConfigured !== false,
    getSessionIdentities: () => ({ active: options.active === undefined ? 'owner@example.com' : options.active,
      effective: 'owner@example.com' }),
    getInstallationState: () => ({ config: { adminEmails: ['owner@example.com'] } }),
    getProperty: () => JSON.stringify({ version: ksp.KSP_INSTALLER_OWNER_LATCH_VERSION,
      ownerEmail: 'owner@example.com' }),
    getAiSetupOperation: operationId => calls.result && calls.result.operationId === operationId
      ? calls.result.result : null,
    listAiProviderModels(provider, key) {
      calls.models.push({ provider, key });
      if (options.modelsError) throw Error('synthetic private model list failure');
      return { models: options.models || [{ modelId: 'gpt-synthetic-list', displayName: 'Synthetic list' }],
        partial: Boolean(options.partial) };
    },
    getAiModelCandidateCache: (provider, activeGeneration) => cache.get(provider + activeGeneration) || null,
    putAiModelCandidateCache(provider, activeGeneration, result, ttl) {
      calls.cache.push({ provider, activeGeneration, ttl, result });
      cache.set(provider + activeGeneration, result);
    },
    verifyAiProviderStoreCredential(provider, store, key) {
      calls.store.push({ provider, store, key });
      return options.storeAccess !== false;
    },
    qualifyFourSourceAiModel(request) {
      calls.qualify.push(plain(request));
      if (options.qualifyError) throw Error('synthetic qualification failure');
      return { passed: options.qualifyPassed !== false, cleaned: true, citationsVerified: true,
        sourceTypes: plain(ksp.KSP_AI_SETUP_SOURCE_TYPES), fingerprint: request.fingerprint };
    },
    commitAiModelSetup(request) {
      calls.commit.push(plain({ ...request, candidateKey: request.candidateKey ? 'REDACTED' : '' }));
      if (options.stale || (settings.AI_MODEL_POLICY_JSON || '') !== request.expectedPolicyJson ||
          generation !== request.expectedCredentialGeneration) throw ksp.kspAiSetupError_('AI_SETUP_STALE');
      if (options.writeError) throw ksp.kspAiSetupError_('AI_SETUP_WRITE_FAILED');
      settings.AI_MODEL_POLICY_JSON = JSON.stringify(request.policy);
      if (request.makeDefault !== false)
        settings[request.provider === 'OPENAI' ? 'OPENAI_DEFAULT_MODEL' : 'GEMINI_DEFAULT_MODEL'] = request.modelId;
      if (request.candidateKey) generation = request.nextCredentialGeneration;
      calls.result = { operationId: request.operationId,
        result: { ok: true, workId: '0073', provider: request.provider,
          modelId: request.modelId, status: 'SAVED' } };
    },
    _debug: { settings, calls, context }
  };
  return env;
}

const operationId = 'synthetic-operation-000073';

test('first run with no default uses a single credential/model save and leaves provider stopped', () => {
  const env = setupEnvironment();
  const list = plain(ksp.kspListAiModelSetupCandidates_(env,
    { provider: 'OPENAI', apiKey: 'synthetic-secret' }, true));
  assert.equal(list.ok, true);
  assert.equal(env._debug.calls.cache.length, 0);
  const result = plain(ksp.kspSaveAiModelSetup_(env, { provider: 'OPENAI',
    modelId: list.models[0].modelId, apiKey: 'synthetic-secret', operationId }, true));
  assert.equal(result.ok, true, JSON.stringify(result));
  assert.equal(result.enabled, false);
  assert.equal(env._debug.calls.qualify.length, 1);
  assert.equal(env._debug.calls.qualify[0].operationalStore, '');
  assert.equal(env._debug.calls.commit.length, 1);
  assert.equal(env._debug.settings.OPENAI_DEFAULT_MODEL, 'gpt-synthetic-list');
  assert.equal(env._debug.settings.OPENAI_ENABLED, 'false');
  const policy = JSON.parse(env._debug.settings.AI_MODEL_POLICY_JSON);
  assert.equal(policy.profiles[0].thinkingProfiles[0].providerDefault, true);
  assert.match(policy.profiles[0].qualifiedCredentialGeneration, /^[a-f0-9]{32}$/);
  assert.match(policy.profiles[0].qualifiedTupleFingerprint, /^[a-f0-9]{64}$/);
  assert.doesNotMatch(JSON.stringify(result) + env._debug.settings.AI_MODEL_POLICY_JSON, /synthetic-secret/);
});

test('manual candidate, list failure, and model-only change preserve the current key/store/disabled state', () => {
  const env = setupEnvironment({ modelsError: true,
    settings: { OPENAI_VECTOR_STORE_ID: 'vs-synthetic', OPENAI_DEFAULT_MODEL: 'gpt-old' } });
  const list = plain(ksp.kspListAiModelSetupCandidates_(env, { provider: 'OPENAI' }, false));
  assert.equal(list.ok, false);
  const result = plain(ksp.kspSaveAiModelSetup_(env, { provider: 'OPENAI',
    modelId: 'gpt-manual-unlisted', operationId }, false));
  assert.equal(result.ok, true, JSON.stringify(result));
  assert.equal(env._debug.calls.qualify.length, 1);
  assert.equal(env._debug.calls.qualify[0].apiKey, '');
  assert.equal(env._debug.calls.store.length, 0);
  assert.equal(env._debug.settings.OPENAI_VECTOR_STORE_ID, 'vs-synthetic');
  assert.equal(env._debug.settings.OPENAI_ENABLED, 'false');
});

test('advanced explicit thinking uses the same save path and only a material tuple change requifies', () => {
  const env=setupEnvironment({settings:{GEMINI_FILE_SEARCH_STORE_NAME:'fileSearchStores/synthetic'}});
  const first=plain(ksp.kspSaveAiModelSetup_(env,{provider:'GEMINI',modelId:'gemini-3.8-flash',
    thinkingRawValue:'low',maxOutputTokens:2048,operationId:'synthetic-operation-000074'},false));
  assert.equal(first.ok,true,JSON.stringify(first));
  assert.equal(env._debug.calls.qualify.length,1);
  let profile=JSON.parse(env._debug.settings.AI_MODEL_POLICY_JSON).profiles[0];
  assert.equal(profile.thinkingProfiles.find(item=>item.thinkingProfileId===profile.defaultThinkingProfileId).rawValue,'low');
  const repeat=plain(ksp.kspSaveAiModelSetup_(env,{provider:'GEMINI',modelId:'gemini-3.8-flash',
    thinkingRawValue:'low',displayName:'Synthetic renamed',maxOutputTokens:2048,
    operationId:'synthetic-operation-000075'},false));
  assert.equal(repeat.ok,true,JSON.stringify(repeat));
  assert.equal(env._debug.calls.qualify.length,1);
  const changed=plain(ksp.kspSaveAiModelSetup_(env,{provider:'GEMINI',modelId:'gemini-3.8-flash',
    thinkingRawValue:'low',maxOutputTokens:3072,operationId:'synthetic-operation-000076'},false));
  assert.equal(changed.ok,true,JSON.stringify(changed));
  assert.equal(env._debug.calls.qualify.length,2);
  profile=JSON.parse(env._debug.settings.AI_MODEL_POLICY_JSON).profiles[0];
  assert.equal(profile.maxOutputTokens,3072);
});

test('expert variant uses the same qualification/save path without replacing the default', () => {
  const env=setupEnvironment();
  const first=plain(ksp.kspSaveAiModelSetup_(env,{provider:'OPENAI',modelId:'gpt-main',
    operationId:'synthetic-operation-000071'},false));
  assert.equal(first.ok,true,JSON.stringify(first));
  const variant=plain(ksp.kspSaveAiModelSetup_(env,{provider:'OPENAI',modelId:'gpt-expert',
    displayName:'Expert model',makeDefault:false,saveAsVariant:true,enabled:true,userVisible:false,
    operationId:'synthetic-operation-000072'},false));
  assert.equal(variant.ok,true,JSON.stringify(variant));
  assert.equal(env._debug.settings.OPENAI_DEFAULT_MODEL,'gpt-main');
  let policy=JSON.parse(env._debug.settings.AI_MODEL_POLICY_JSON);
  const expert=policy.profiles.find(item=>item.modelId==='gpt-expert');
  assert.ok(expert);
  assert.equal(expert.isProviderDefault,false);
  assert.equal(expert.userVisible,false);
  assert.equal(policy.profiles.find(item=>item.isProviderDefault).modelId,'gpt-main');
  assert.equal(env._debug.calls.qualify.length,2);
  const renamed=plain(ksp.kspSaveAiModelSetup_(env,{provider:'OPENAI',profileId:expert.profileId,
    modelId:'gpt-expert',displayName:'Expert renamed',makeDefault:false,enabled:true,userVisible:true,
    operationId:'synthetic-operation-000073'},false));
  assert.equal(renamed.ok,true,JSON.stringify(renamed));
  assert.equal(env._debug.calls.qualify.length,2);
  policy=JSON.parse(env._debug.settings.AI_MODEL_POLICY_JSON);
  assert.equal(policy.profiles.find(item=>item.profileId===expert.profileId).displayName,'Expert renamed');
  assert.equal(policy.profiles.find(item=>item.profileId===expert.profileId).userVisible,true);
  assert.equal(env._debug.settings.OPENAI_DEFAULT_MODEL,'gpt-main');
});

test('candidate listing is operator-only and active cache is generation-bound', () => {
  const denied = setupEnvironment({ active: '' });
  assert.equal(plain(ksp.kspListAiModelSetupCandidates_(denied,
    { provider: 'OPENAI', apiKey: 'synthetic-secret' }, true)).error.code, 'AI_SETUP_OPERATOR_REQUIRED');
  assert.equal(denied._debug.calls.models.length, 0);
  const env = setupEnvironment();
  assert.equal(ksp.kspListAiModelSetupCandidates_(env, { provider: 'OPENAI' }, false).cached, false);
  assert.equal(ksp.kspListAiModelSetupCandidates_(env, { provider: 'OPENAI' }, false).cached, true);
  assert.equal(env._debug.calls.cache[0].ttl, 600);
  assert.equal(env._debug.calls.models.length, 1);
  assert.equal(plain(ksp.kspListAiModelSetupCandidates_(env,
    { provider: 'OPENAI', apiKey: 'synthetic-secret' }, false)).error.code, 'AI_SETUP_FACADE_REQUIRED');
});

test('qualification failure, operational Store mismatch and stale generation retain every setting', () => {
  for (const options of [{ qualifyError: true }, { storeAccess: false }, { stale: true }]) {
    const env = setupEnvironment({ ...options,
      settings: { OPENAI_DEFAULT_MODEL: 'gpt-old', OPENAI_VECTOR_STORE_ID: 'vs-old', OPENAI_ENABLED: 'true' } });
    const before = JSON.stringify(env._debug.settings);
    const result = plain(ksp.kspSaveAiModelSetup_(env, { provider: 'OPENAI',
      modelId: 'gpt-new', apiKey: 'synthetic-secret', operationId }, true));
    assert.equal(result.ok, false);
    assert.equal(JSON.stringify(env._debug.settings), before);
    assert.doesNotMatch(JSON.stringify(result), /synthetic-secret|vs-old/);
  }
});

test('operation result can be read back without a second qualification', () => {
  const env = setupEnvironment();
  const first = plain(ksp.kspSaveAiModelSetup_(env, { provider: 'GEMINI',
    modelId: 'models/gemini-synthetic', apiKey: 'synthetic-secret', operationId }, true));
  assert.equal(first.ok, true, JSON.stringify(first));
  const found = plain(ksp.kspGetAiModelSetupOperation_(env,
    { provider: 'GEMINI', operationId, credentialMode: true }));
  assert.equal(found.status, 'SAVED');
  const repeated = plain(ksp.kspSaveAiModelSetup_(env, { provider: 'GEMINI',
    modelId: 'models/gemini-synthetic', apiKey: 'synthetic-secret', operationId }, true));
  assert.equal(repeated.status, 'SAVED');
  assert.equal(env._debug.calls.qualify.length, 1);
});

test('Gemini official list and direct resource name share one bare request Model ID', () => {
  const originalMaintenance = ksp.kspCreateMaintenanceEnvironment_;
  const originalProperties = ksp.PropertiesService;
  const originalGemini = ksp.kspGeminiJsonRequestLive_;
  try {
    ksp.kspCreateMaintenanceEnvironment_ = () => ({});
    ksp.PropertiesService = { getScriptProperties: () => ({}) };
    ksp.kspGeminiJsonRequestLive_ = (_method, _path) => ({models:[
      {name:'models/gemini-synthetic',baseModelId:'gemini-synthetic',displayName:'Gemini Synthetic'},
      {name:'models/gemini-fallback',displayName:'Gemini Fallback'},
      {name:'models/gemini-resource-alias',baseModelId:'gemini-base',displayName:'Gemini Base'}
    ]});
    const adapter = ksp.kspCreateAiEnvironment_();
    const env = setupEnvironment({models: adapter.listAiProviderModels('GEMINI','synthetic-secret').models});
    const list = plain(ksp.kspListAiModelSetupCandidates_(env,
      {provider:'GEMINI',apiKey:'synthetic-secret'},true));
    assert.deepEqual(list.models.map(item=>item.modelId),
      ['gemini-synthetic','gemini-fallback','gemini-base']);
    assert.equal(list.models[0].displayName,'Gemini Synthetic');
    env.putAiModelCandidateCache('GEMINI','legacy',{models:[
      {modelId:'models/gemini-synthetic',displayName:'Gemini Synthetic'}],
      partial:false,fetchedAt:'2026-09-26T00:00:00Z'},600);
    const cached=plain(ksp.kspListAiModelSetupCandidates_(env,{provider:'GEMINI'},false));
    assert.equal(cached.cached,true);
    assert.equal(cached.models[0].modelId,'gemini-synthetic');
    const selected = plain(ksp.kspSaveAiModelSetup_(env,{provider:'GEMINI',
      modelId:list.models[0].modelId,apiKey:'synthetic-secret',operationId:'synthetic-operation-000077'},true));
    assert.equal(selected.ok,true,JSON.stringify(selected));
    assert.equal(selected.modelId,'gemini-synthetic');
    assert.equal(env._debug.calls.qualify[0].profile.modelId,'gemini-synthetic');
    assert.equal(env._debug.calls.commit[0].modelId,'gemini-synthetic');
    const direct = plain(ksp.kspSaveAiModelSetup_(env,{provider:'GEMINI',
      modelId:'models/gemini-synthetic',operationId:'synthetic-operation-000078'},false));
    assert.equal(direct.ok,true,JSON.stringify(direct));
    assert.equal(direct.modelId,'gemini-synthetic');
    assert.equal(env._debug.calls.qualify.length,1);
    assert.equal(JSON.parse(env._debug.settings.AI_MODEL_POLICY_JSON).profiles.length,1);
    assert.equal(JSON.parse(env._debug.settings.AI_MODEL_POLICY_JSON).profiles[0].modelId,'gemini-synthetic');
    assert.equal(ksp.kspBuildProviderSearchRequest_('GEMINI',{modelId:direct.modelId,
      storeName:'fileSearchStores/synthetic'},{questionOrInstruction:'synthetic query'}).modelId,'gemini-synthetic');
    const legacy=JSON.parse(env._debug.settings.AI_MODEL_POLICY_JSON);
    legacy.profiles[0].modelId='models/gemini-synthetic';
    env._debug.settings.AI_MODEL_POLICY_JSON=JSON.stringify(legacy);
    env._debug.settings.GEMINI_DEFAULT_MODEL='models/gemini-synthetic';
    const repaired=plain(ksp.kspSaveAiModelSetup_(env,{provider:'GEMINI',
      modelId:'gemini-synthetic',operationId:'synthetic-operation-000081'},false));
    assert.equal(repaired.ok,true,JSON.stringify(repaired));
    assert.equal(JSON.parse(env._debug.settings.AI_MODEL_POLICY_JSON).profiles.length,1);
    assert.equal(env._debug.settings.GEMINI_DEFAULT_MODEL,'gemini-synthetic');
    assert.equal(plain(ksp.kspSaveAiModelSetup_(env,{provider:'OPENAI',
      modelId:'models/gpt-synthetic',operationId:'synthetic-operation-000079'},false)).modelId,
      'models/gpt-synthetic');
  } finally {
    ksp.kspCreateMaintenanceEnvironment_ = originalMaintenance;
    ksp.PropertiesService = originalProperties;
    ksp.kspGeminiJsonRequestLive_ = originalGemini;
  }
});

test('model-only save without a configured credential stops before qualification or commit', () => {
  const env=setupEnvironment({openaiCredentialConfigured:false});
  const result=plain(ksp.kspSaveAiModelSetup_(env,{provider:'OPENAI',
    modelId:'gpt-synthetic',operationId:'synthetic-operation-000080'},false));
  assert.equal(result.ok,false);
  assert.equal(env._debug.calls.qualify.length,0);
  assert.equal(env._debug.calls.commit.length,0);
});

test('four-source OpenAI fake campaign uses scoped requests, validates citations and cleans the exact Store', () => {
  const seen=[];const removed=[];
  const env={
    hashText: text => ksp.kspAiSetupDigest_(text),
    createAiQualificationStore: () => ({ name:'vs-ksp-0073-temp' }),
    uploadAiQualificationSource(_provider,store,source) {
      seen.push({ phase:'upload', store, type:source.sourceType, id:source.sourceId });
      return { name:'openai:'+store+'/files/file-'+source.sourceId,
        fileId:'file-'+source.sourceId, attributes:{ source_type:source.sourceType,
          source_id:source.sourceId, content_hash:source.contentHash } };
    },
    readAiQualificationSource(_provider,_store,documentValue) { return documentValue; },
    queryAiQualificationSource(_provider,_config,request) {
      const result=seen.at(-1);
      assert.equal(request.vectorStoreId,'vs-ksp-0073-temp');
      assert.match(JSON.stringify(request.filters),new RegExp(result.id));
      const source=ksp.kspAiSetupSyntheticSources_(env).find(item=>item.sourceId===result.id);
      return { output:[
        {type:'file_search_call',status:'completed',results:[{file_id:'file-'+result.id,
          attributes:{source_type:result.type,source_id:result.id,content_hash:source.contentHash}}]},
        {type:'message',content:[{text:source.token}]}
      ]};
    },
    deleteAiQualificationDocument(_provider,store,item) { removed.push(item.fileId); assert.equal(store,'vs-ksp-0073-temp'); },
    deleteAiQualificationStore(_provider,store) { removed.push(store); },
    confirmAiQualificationStoreDeleted: () => true
  };
  const result=plain(ksp.kspRunFourSourceAiSetupQualification_(env,{provider:'OPENAI',
    profile:{modelId:'gpt-synthetic',maxOutputTokens:null,defaultThinkingProfileId:'provider-default',
      thinkingProfiles:[{thinkingProfileId:'provider-default',providerDefault:true,enabled:true}]},fingerprint:'fingerprint'}));
  assert.equal(result.passed,true);
  assert.deepEqual(seen.map(item=>item.type),['Meeting','Pitchbook','News','Internal Assessment']);
  assert.equal(removed.length,5);
  assert.equal(removed.at(-1),'vs-ksp-0073-temp');
});

test('four-source Gemini fake campaign keeps exact metadata, provenance and cleanup', () => {
  const seen=[];let deleted=false;
  const store='fileSearchStores/ksp-0073-temp';
  const env={
    hashText: text => ksp.kspAiSetupDigest_(text),
    createAiQualificationStore: () => ({ name:store }),
    uploadAiQualificationSource(_provider,current,source) {
      assert.equal(current,store);
      const documentValue={name:store+'/documents/'+source.sourceId,state:'ACTIVE',
        customMetadata:{source_type:source.sourceType,source_id:source.sourceId,
          content_hash:source.contentHash}};
      seen.push({source,documentValue});
      return documentValue;
    },
    readAiQualificationSource(_provider,_store,documentValue) {return documentValue;},
    queryAiQualificationSource(_provider,config,request) {
      const {source}=seen.at(-1);
      assert.equal(config.storeName,store);
      assert.match(request.metadataFilter,new RegExp(source.sourceId));
      const raw={status:'completed',steps:[{type:'model_output',content:[{
        type:'text',text:source.token,annotations:[{
          type:'file_citation',source:'Synthetic excerpt',document_uri:store,
          custom_metadata:[
            {key:'source_type',string_value:source.sourceType},
            {key:'source_id',string_value:source.sourceId},
            {key:'content_hash',string_value:source.contentHash}
          ]
        }]
      }]}]};
      return raw;
    },
    deleteAiQualificationStore(_provider,current){assert.equal(current,store);deleted=true;},
    confirmAiQualificationStoreDeleted:()=>deleted
  };
  const result=plain(ksp.kspRunFourSourceAiSetupQualification_(env,{provider:'GEMINI',
    profile:{modelId:'models/gemini-synthetic',maxOutputTokens:2048,defaultThinkingProfileId:'provider-default',
      thinkingProfiles:[{thinkingProfileId:'provider-default',providerDefault:true,enabled:true}]},fingerprint:'fingerprint'}));
  assert.equal(result.passed,true);
  assert.deepEqual(seen.map(item=>item.source.sourceType),['Meeting','Pitchbook','News','Internal Assessment']);
  assert.equal(deleted,true);
});

test('four-source sync selection keeps multi-Counterparty News as one source and resets only the changed provider', () => {
  const definitions=[['Meeting','Meeting_ID','MTG-000001'],['Pitchbook','Document_ID','DOC-000001'],
    ['News','News_ID','NEWS-000001'],['Internal Assessment','Assessment_ID','ASMT-000001']];
  const context={settings:{OPENAI_VECTOR_STORE_ID:'vs-new',OPENAI_ENABLED:'false',
      GEMINI_FILE_SEARCH_STORE_NAME:'fileSearchStores/current',GEMINI_ENABLED:'true'},
    meetingRows:[],pitchbookRows:[],newsRows:[],assessmentRows:[]};
  const routes={Meeting:'meetingRows',Pitchbook:'pitchbookRows',News:'newsRows',
    'Internal Assessment':'assessmentRows'};
  for(const [type,key,id] of definitions){
    context[routes[type]].push({[key]:id,Status:'Active',Counterparty_IDs:type==='News'?'CP-A,CP-B':'CP-A',
      AI_Provider_State_JSON:JSON.stringify({stateVersion:1,OPENAI:{status:'Indexed',
        documentName:'openai:vs-old/files/'+id,providerDocumentId:'file-'+id,
        storeName:'vs-old',contentHash:'hash',indexedAt:'2026-09-26T00:00:00Z'},
      GEMINI:{status:'Indexed',documentName:'fileSearchStores/current/documents/'+id,
        storeName:'fileSearchStores/current',contentHash:'hash',indexedAt:'2026-09-26T00:00:00Z'}})});
  }
  const changes=[];
  const env={loadAiContext:()=>context,
    updateAiProviderState(type,id,provider,patch){
      changes.push({type,id,provider});
      const row=context[routes[type]].find(item=>item[definitions.find(def=>def[0]===type)[1]]===id);
      const state=JSON.parse(row.AI_Provider_State_JSON);
      Object.assign(state[provider],patch);
      row.AI_Provider_State_JSON=JSON.stringify(state);
    }};
  const candidates=plain(ksp.kspGetAiSyncCandidates_(env,{provider:'OPENAI'}));
  assert.equal(candidates.ok,true);
  assert.equal(candidates.records.length,4);
  assert.equal(candidates.records.filter(item=>item.sourceType==='News').length,1);
  assert.equal(candidates.records.filter(item=>item.staleForStore).length,4);
  const result=plain(ksp.kspResetAiProviderDerivedState_(env,{provider:'OPENAI'}));
  assert.equal(result.ok,true,JSON.stringify(result));
  assert.equal(result.reset,4);
  assert.deepEqual(changes.map(item=>item.type),definitions.map(item=>item[0]));
  for(const [type] of definitions){
    const state=JSON.parse(context[routes[type]][0].AI_Provider_State_JSON);
    assert.equal(state.OPENAI.status,'NotIndexed');
    assert.equal(state.GEMINI.status,'Indexed');
  }
});
