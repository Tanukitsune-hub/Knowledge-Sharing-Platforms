const { test, assert, fs, path, ksp, plain, baseContext, createSyncEnvironment } = require('./ai-test-helpers.cjs');

function thinking(id, label, rawValue = null, qualification = 'QUALIFIED') {
  return { thinkingProfileId: id, label, rawValue, providerDefault: rawValue === null, enabled: true,
    qualification, qualifiedAt: qualification === 'QUALIFIED' ? '2026-08-31T00:00:00.000Z' : '' };
}

function profile(overrides = {}) {
  return {
    profileId: 'openai-terra', provider: 'OPENAI', modelId: 'gpt-5.6-terra',
    displayName: 'Terra', family: 'GPT-5.6', enabled: true, userVisible: true,
    isProviderDefault: false, apiAccess: 'AVAILABLE', qualification: 'QUALIFIED', fileSearch: true,
    thinkingProfiles: [thinking('provider-default', 'Provider default')],
    defaultThinkingProfileId: 'provider-default', maxOutputTokens: null,
    createdAt: '2026-08-31T00:00:00.000Z', updatedAt: '2026-08-31T00:00:00.000Z',
    qualifiedAt: '2026-08-31T00:00:00.000Z', safeNote: '', ...overrides
  };
}

function policy(profiles) {
  return plain(ksp.kspNormalizeAiModelPolicy_({
    schemaVersion: 1, updatedAt: '2026-08-31T00:00:00.000Z', profiles
  }));
}

function policySettings(registry) {
  return ksp.kspNormalizeAiSettings_({
    OPENAI_ENABLED: 'true', OPENAI_VECTOR_STORE_ID: 'vs-private',
    OPENAI_DEFAULT_MODEL: 'gpt-5.6-terra', OPENAI_READINESS: 'ACTIVE',
    AI_MODEL_POLICY_JSON: JSON.stringify(registry)
  });
}

function openAiConfig() {
  return { provider: 'OPENAI', enabled: true, credentialConfigured: true,
    vectorStoreId: 'vs-private', modelId: 'gpt-5.6-terra' };
}

test('current OpenAI migration preserves the exact model and provider-default reasoning omission', () => {
  const settings = ksp.kspNormalizeAiSettings_({
    OPENAI_ENABLED: 'true', OPENAI_VECTOR_STORE_ID: 'vs-private',
    OPENAI_DEFAULT_MODEL: 'gpt-5.6-terra', OPENAI_READINESS: 'ACTIVE'
  });
  const migrated = plain(ksp.kspBuildMigratedOpenAiModelPolicy_(settings, {
    accessible: true, qualified: true, nowIso: '2026-08-31T00:00:00.000Z'
  }));
  assert.equal(migrated.schemaVersion, 1);
  assert.equal(migrated.profiles.length, 1);
  assert.equal(migrated.profiles[0].thinkingProfiles[0].qualification, 'QUALIFIED');
  const selection = plain(ksp.kspResolveAiModelSelection_(
    { ...settings, modelPolicyJson: JSON.stringify(migrated) }, 'OPENAI', {}, openAiConfig(), ''
  ));
  assert.equal(selection.modelId, 'gpt-5.6-terra');
  assert.equal(selection.thinkingProfileId, 'provider-default');
  assert.equal(selection.thinkingProviderDefault, true);
  assert.equal(selection.thinkingRawValue, null);
  assert.equal(selection.maxOutputTokens, null);
  const request = plain(ksp.kspBuildProviderSearchRequest_('OPENAI',
    ksp.kspApplyAiModelSelectionToConfig_(openAiConfig(), selection),
    { mode: '自由質問', questionOrInstruction: 'synthetic question' }));
  assert.equal(request.model, 'gpt-5.6-terra');
  assert.equal(request.thinkingProviderDefault, true);
  assert.equal(Object.hasOwn(request, 'maxOutputTokens'), false);
});

test('Gemini 3.8 and 3.7 accept explicit low medium high and reject minimal', () => {
  for (const modelId of ['gemini-3.8-flash', 'gemini-3.7-flash']) {
    for (const level of ['low', 'medium', 'high']) {
      const normalized = plain(ksp.kspAiModelPolicyProfile_(profile({
        profileId: `gemini-${modelId.slice(7, 10).replace('.', '')}-${level}`,
        provider: 'GEMINI', modelId, displayName: modelId, family: 'Gemini',
        thinkingProfiles: [thinking(level, level, level, 'UNQUALIFIED')],
        defaultThinkingProfileId: level, qualification: 'UNQUALIFIED', fileSearch: false
      })));
      assert.equal(normalized.thinkingProfiles[0].rawValue, level);
    }
    assert.throws(() => ksp.kspAiModelPolicyProfile_(profile({
      profileId: `gemini-${modelId.slice(7, 10).replace('.', '')}-minimal`,
      provider: 'GEMINI', modelId, displayName: modelId, family: 'Gemini',
      thinkingProfiles: [thinking('minimal', 'Minimal', 'minimal', 'UNQUALIFIED')],
      defaultThinkingProfileId: 'minimal', qualification: 'UNQUALIFIED', fileSearch: false
    })), (error) => error.code === 'AI_THINKING_VALUE_INVALID');
  }
});

test('Gemini qualification is bound to exact Store request profile and policy-driven request tuple', () => {
  const geminiProfile = profile({
    profileId: 'gemini-38-low', provider: 'GEMINI', modelId: 'gemini-3.8-flash',
    displayName: 'Gemini 3.8 Flash', family: 'Gemini 3.8', isProviderDefault: true,
    thinkingProfiles: [thinking('low', 'Low', 'low')], defaultThinkingProfileId: 'low',
    maxOutputTokens: 2048, qualifiedStoreName: 'fileSearchStores/store-current',
    qualifiedRequestProfileVersion: 'gemini-interactions-file-search-v2'
  });
  const registry = policy([geminiProfile]);
  const settings = ksp.kspNormalizeAiSettings_({
    GEMINI_ENABLED: 'true', GEMINI_FILE_SEARCH_STORE: 'fileSearchStores/store-current',
    GEMINI_DEFAULT_MODEL: 'gemini-3.8-flash', AI_MODEL_POLICY_JSON: JSON.stringify(registry)
  });
  const config = { provider: 'GEMINI', enabled: true, credentialConfigured: true,
    storeName: 'fileSearchStores/store-current', modelId: 'gemini-3.8-flash' };
  const selection = plain(ksp.kspResolveAiModelSelection_(settings, 'GEMINI', {}, config, ''));
  const request = plain(ksp.kspBuildProviderSearchRequest_('GEMINI',
    ksp.kspApplyAiModelSelectionToConfig_(config, selection), {
      mode: '自由質問', questionOrInstruction: 'synthetic', sourceType: 'Pitchbook', sourceId: 'DOC-000017'
    }));
  assert.equal(request.modelId, 'gemini-3.8-flash');
  assert.deepEqual(request.generation_config, { max_output_tokens: 2048, thinking_level: 'low' });
  assert.match(request.metadataFilter, /source_type = "Pitchbook"/);
  assert.match(request.metadataFilter, /source_id = "DOC-000017"/);
  assert.deepEqual(plain(ksp.kspGetEffectiveAiModelChoices_(settings, 'GEMINI', config, '')).profiles
    .map((item) => item.profileId), ['gemini-38-low']);
  assert.deepEqual(plain(ksp.kspGetEffectiveAiModelChoices_(settings, 'GEMINI',
    { ...config, storeName: 'fileSearchStores/store-changed' }, '')).profiles, []);
  const staleProfile = policy([{ ...geminiProfile,
    qualifiedRequestProfileVersion: 'gemini-fixed-profile-v1' }]);
  const staleSettings = { ...settings, modelPolicyJson: JSON.stringify(staleProfile) };
  assert.throws(() => ksp.kspResolveAiModelSelection_(staleSettings, 'GEMINI', {}, config, ''),
    (error) => error.code === 'AI_MODEL_PROFILE_UNQUALIFIED');
});

test('a new explicit thinking tuple starts unqualified and remains absent from effective choices', () => {
  const registry = policy([profile({ isProviderDefault: true, thinkingProfiles: [
    thinking('provider-default', 'Provider default'),
    thinking('high', 'High', 'high', 'UNQUALIFIED')
  ] })]);
  const choices = plain(ksp.kspGetEffectiveAiModelChoices_(policySettings(registry), 'OPENAI', openAiConfig(), ''));
  assert.deepEqual(choices.profiles[0].thinkingProfiles.map((item) => item.thinkingProfileId), ['provider-default']);
  assert.throws(() => ksp.kspResolveAiModelSelection_(policySettings(registry), 'OPENAI', {
    modelProfileId: 'openai-terra', thinkingProfileId: 'high'
  }, openAiConfig(), ''), (error) => error.code === 'AI_THINKING_PROFILE_UNQUALIFIED');
});

test('an unqualified configured default prevents the model from becoming effective', () => {
  const registry = policy([profile({ isProviderDefault: true, qualification: 'QUALIFIED', fileSearch: true,
    thinkingProfiles: [thinking('provider-default', 'Provider default', null, 'UNQUALIFIED')]
  })]);
  const choices = plain(ksp.kspGetEffectiveAiModelChoices_(policySettings(registry), 'OPENAI', openAiConfig(), ''));
  assert.deepEqual(choices.profiles, []);
  assert.throws(() => ksp.kspResolveAiModelSelection_(policySettings(registry), 'OPENAI', {}, openAiConfig(), ''),
    (error) => error.code === 'AI_THINKING_PROFILE_UNQUALIFIED');
});

test('effective choices include qualified historical models and hide Sol, inaccessible latest, and unqualified profiles', () => {
  const registry = policy([
    profile({ isProviderDefault: true }),
    profile({ profileId: 'openai-historical', modelId: 'gpt-5.4', displayName: 'Historical', family: 'GPT-5.4',
      thinkingProfiles: [thinking('medium', 'Medium', 'medium')], defaultThinkingProfileId: 'medium' }),
    profile({ profileId: 'openai-sol', modelId: 'gpt-5.6-sol', displayName: 'Sol', userVisible: false }),
    profile({ profileId: 'openai-latest', modelId: 'gpt-5.7', displayName: 'Latest', apiAccess: 'UNAVAILABLE' }),
    profile({ profileId: 'openai-unqualified', modelId: 'gpt-5.3', displayName: 'Unqualified', qualification: 'UNQUALIFIED', fileSearch: false })
  ]);
  const choices = plain(ksp.kspGetEffectiveAiModelChoices_(policySettings(registry), 'OPENAI', openAiConfig(), ''));
  assert.deepEqual(choices.profiles.map((item) => item.profileId), ['openai-terra', 'openai-historical']);
  assert.equal(choices.profiles[1].modelId, 'gpt-5.4');
  assert.deepEqual(choices.profiles[1].thinkingProfiles, [
    { thinkingProfileId: 'medium', label: 'Medium', isDefault: true }
  ]);
});

test('server resolver enforces model-specific thinking and rejects raw, stale, disabled, inaccessible, unqualified, and cross-provider selections', () => {
  const registry = policy([
    profile({ isProviderDefault: true, thinkingProfiles: [
      thinking('provider-default', 'Provider default'), thinking('low', 'Low', 'low')
    ], defaultThinkingProfileId: 'provider-default' }),
    profile({ profileId: 'openai-historical', modelId: 'gpt-5.4',
      thinkingProfiles: [thinking('medium', 'Medium', 'medium')], defaultThinkingProfileId: 'medium' }),
    profile({ profileId: 'openai-disabled', modelId: 'gpt-5.6-sol', enabled: false }),
    profile({ profileId: 'openai-inaccessible', modelId: 'gpt-5.7', apiAccess: 'UNAVAILABLE' }),
    profile({ profileId: 'openai-unqualified', modelId: 'gpt-5.3', qualification: 'UNQUALIFIED', fileSearch: false }),
    profile({ profileId: 'gemini-disabled', provider: 'GEMINI', modelId: 'gemini-3.7-flash', enabled: false,
      userVisible: false, apiAccess: 'UNKNOWN', qualification: 'UNQUALIFIED', fileSearch: false })
  ]);
  const settings = policySettings(registry);
  const selected = plain(ksp.kspResolveAiModelSelection_(settings, 'OPENAI', {
    modelProfileId: 'openai-historical', thinkingProfileId: 'medium'
  }, openAiConfig(), ''));
  assert.equal(selected.modelId, 'gpt-5.4');
  assert.equal(selected.thinkingRawValue, 'medium');
  const cases = [
    [{ modelId: 'gpt-5.6-sol' }, 'AI_MODEL_POLICY_RAW_VALUE_REJECTED'],
    [{ modelProfileId: 'missing-profile' }, 'AI_MODEL_SELECTION_STALE'],
    [{ modelProfileId: 'openai-disabled' }, 'AI_MODEL_PROFILE_DISABLED'],
    [{ modelProfileId: 'openai-inaccessible' }, 'AI_MODEL_PROFILE_INACCESSIBLE'],
    [{ modelProfileId: 'openai-unqualified' }, 'AI_MODEL_PROFILE_UNQUALIFIED'],
    [{ modelProfileId: 'openai-historical', thinkingProfileId: 'low' }, 'AI_THINKING_SELECTION_STALE'],
    [{ modelProfileId: 'gemini-disabled' }, 'AI_MODEL_PROFILE_PROVIDER_MISMATCH']
  ];
  for (const [input, code] of cases) {
    assert.throws(() => ksp.kspResolveAiModelSelection_(settings, 'OPENAI', input, openAiConfig(), ''),
      (error) => error.code === code);
  }
});

test('registry requires exactly one default for every enabled provider', () => {
  assert.throws(() => policy([profile({ isProviderDefault: false })]),
    (error) => error.code === 'AI_MODEL_DEFAULT_REQUIRED');
  assert.throws(() => policy([
    profile({ isProviderDefault: true }),
    profile({ profileId: 'openai-second-default', modelId: 'gpt-5.4', isProviderDefault: true })
  ]), (error) => error.code === 'AI_MODEL_DEFAULT_DUPLICATE');
});

test('changing a qualified model, thinking raw value, or output ceiling invalidates tuple qualification', () => {
  const registry = policy([profile({ isProviderDefault: true })]);
  const changed = plain(ksp.kspUpsertAiModelProfile_(registry, {
    ...registry.profiles[0], modelId: 'gpt-5.4', displayName: 'Changed'
  }, '2026-08-31T01:00:00.000Z'));
  assert.equal(changed.profiles[0].apiAccess, 'UNKNOWN');
  assert.equal(changed.profiles[0].qualification, 'UNQUALIFIED');
  assert.equal(changed.profiles[0].fileSearch, false);
  assert.throws(() => ksp.kspResolveAiModelSelection_(policySettings(changed), 'OPENAI', {}, openAiConfig(), ''),
    (error) => error.code === 'AI_MODEL_PROFILE_INACCESSIBLE');
  const withExplicit = policy([profile({ isProviderDefault: true, maxOutputTokens: 1024,
    thinkingProfiles: [thinking('medium', 'Medium', 'medium')], defaultThinkingProfileId: 'medium' })]);
  const rawChanged = plain(ksp.kspUpsertAiModelProfile_(withExplicit, {
    ...withExplicit.profiles[0], thinkingProfiles: [thinking('medium', 'Medium', 'high')]
  }, '2026-08-31T02:00:00.000Z'));
  assert.equal(rawChanged.profiles[0].thinkingProfiles[0].qualification, 'UNQUALIFIED');
  const outputChanged = plain(ksp.kspUpsertAiModelProfile_(withExplicit, {
    ...withExplicit.profiles[0], maxOutputTokens: 2048
  }, '2026-08-31T03:00:00.000Z'));
  assert.equal(outputChanged.profiles[0].thinkingProfiles[0].qualification, 'UNQUALIFIED');
});

test('validated selection is the only model/reasoning data passed to OpenAI and audit metadata stays safe', () => {
  const registry = policy([
    profile({ isProviderDefault: true }),
    profile({ profileId: 'openai-historical', modelId: 'gpt-5.4', maxOutputTokens: 1024,
      thinkingProfiles: [thinking('medium', 'Medium', 'medium')], defaultThinkingProfileId: 'medium' })
  ]);
  const state = ksp.kspBuildEmptyAiProviderState_();
  state.OPENAI.providerDocumentId = 'provider-file-private';
  state.OPENAI.contentHash = 'current-hash';
  const context = baseContext();
  context.settings = {
    ...context.settings, OPENAI_ENABLED: 'true', OPENAI_VECTOR_STORE_ID: 'vs-private',
    OPENAI_DEFAULT_MODEL: 'gpt-5.6-terra', OPENAI_READINESS: 'ACTIVE',
    AI_MODEL_POLICY_JSON: JSON.stringify(registry)
  };
  context.pitchbookRows[0].AI_Provider_State_JSON = ksp.kspSerializeAiProviderState_(state);
  const env = createSyncEnvironment({ context, queryResponse: {
    id: 'response-private', output: [
      { type: 'file_search_call', status: 'completed', results: [{
        file_id: 'provider-file-private', attributes: {
          source_type: 'Pitchbook', source_id: 'DOC-000001', content_hash: 'current-hash'
        }
      }] },
      { type: 'message', content: [{ type: 'output_text', text: 'grounded', annotations: [] }] }
    ]
  } });
  env.getProviderConfig = () => openAiConfig();
  const result = plain(ksp.kspRunProviderKnowledgeSearch_(env, 'OPENAI', {
    mode: '自由質問', questionOrInstruction: 'synthetic question',
    modelProfileId: 'openai-historical', thinkingProfileId: 'medium'
  }));
  assert.equal(result.ok, true);
  const request = env._debug.queryDebug.starts[0];
  assert.equal(request.model, 'gpt-5.4');
  assert.equal(request.thinkingRawValue, 'medium');
  assert.equal(request.maxOutputTokens, 1024);
  const audit = env._debug.audits[0];
  assert.equal(audit.Model_ID, 'gpt-5.4');
  const metadata = JSON.parse(audit.After_Metadata_JSON);
  assert.equal(metadata.model_profile_id, 'openai-historical');
  assert.equal(metadata.effective_model_id, 'gpt-5.4');
  assert.equal(metadata.thinking_profile_id, 'medium');
  assert.equal(metadata.thinking_level, 'medium');
  assert.equal(metadata.max_output_tokens, 1024);
  assert.doesNotMatch(JSON.stringify(audit), /provider-file-private|vs-private|response-private|synthetic question/);
});

test('OpenAI Responses payload uses reasoning effort only for an approved override', () => {
  const original = ksp.kspOpenAiJsonRequestLive_;
  const captured = [];
  try {
    ksp.kspOpenAiJsonRequestLive_ = (method, pathValue, payloadValue) => {
      captured.push({ method, path: pathValue, payload: plain(payloadValue) });
      return {};
    };
    ksp.kspOpenAiQueryFileSearchLive_({
      model: 'gpt-5.4', vectorStoreId: 'vs-private', input: 'Q',
      thinkingProviderDefault: false, thinkingRawValue: 'medium', maxOutputTokens: 1024
    });
    ksp.kspOpenAiQueryFileSearchLive_({
      model: 'gpt-5.6-terra', vectorStoreId: 'vs-private', input: 'Q',
      thinkingProviderDefault: true
    });
  } finally {
    ksp.kspOpenAiJsonRequestLive_ = original;
  }
  assert.deepEqual(captured[0].payload.reasoning, { effort: 'medium' });
  assert.equal(captured[0].payload.max_output_tokens, 1024);
  assert.equal(Object.hasOwn(captured[1].payload, 'reasoning'), false);
  assert.equal(Object.hasOwn(captured[1].payload, 'max_output_tokens'), false);
});

test('Knowledge Search UI exposes policy selectors and hides them from FULL_EXPORT payloads', () => {
  const page = fs.readFileSync(path.join(__dirname, '..', 'src', 'KnowledgeSearchPage.html'), 'utf8');
  const client = fs.readFileSync(path.join(__dirname, '..', 'src', 'ClientKnowledgeSearch.html'), 'utf8');
  for (const token of ['knowledge-model-profile', 'knowledge-thinking-profile', 'modelPolicies',
    'modelProfileId', 'thinkingProfileId', "route!=='FULL_EXPORT'", "controls.hidden=route==='FULL_EXPORT'"]) {
    assert.ok((page + '\n' + client).includes(token), token);
  }
});
