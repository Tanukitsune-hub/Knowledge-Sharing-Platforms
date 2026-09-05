const { test, assert, fs, path, ksp, plain, baseContext, attachSharedAdminAuth } = require('./ai-test-helpers.cjs');

function mutateAdmin(environment, input) {
  return ksp.kspMutateAiProviderSettings_(environment, {
    ...(input || {}), adminSessionToken: environment._debug.adminSessionToken
  });
}

function makeAdminEnvironment(options = {}) {
  const context = baseContext();
  context.state = { config: { adminEmails: ['admin@example.com'] }, resources: {} };
  context.settings = {
    ...context.settings,
    OPENAI_ENABLED: options.enabled ? 'true' : 'false',
    OPENAI_VECTOR_STORE_ID: options.storeId || '',
    OPENAI_DEFAULT_MODEL: options.model === undefined ? '' : options.model,
    OPENAI_READINESS: options.readiness === undefined ? '' : options.readiness,
    GEMINI_ENABLED: options.geminiEnabled ? 'true' : 'false',
    GEMINI_FILE_SEARCH_STORE: options.geminiStore || '',
    GEMINI_DEFAULT_MODEL: options.geminiModel || '',
    GEMINI_READINESS: options.geminiReadiness || ''
  };
  const writes = [];
  const created = [];
  const read = [];
  const deleted = [];
  const syncCalls = [];
  const savedKeys = [];
  const savedGeminiKeys = [];
  const connectionUploads = [];
  const connectionQueries = [];
  const connectionDeletes = [];
  let credentialConfigured = options.key !== false;
  let geminiCredentialConfigured = options.geminiKey !== false;
  let readErrorRemaining = options.readError ? (options.readErrorOnce ? 1 : Number.MAX_SAFE_INTEGER) : 0;
  let clock = 0;
  const environment = {
    nowIso() { clock += 1; return `2026-08-28T00:00:${String(clock).padStart(2, '0')}.000Z`; },
    loadAiContext() { return context; },
    ensureAiSettings(rows) {
      (rows || []).forEach((row) => {
        if (!(row.Key in context.settings)) context.settings[row.Key] = row.Value;
      });
    },
    isAdministrator() { return options.admin !== false; },
    isOpenAiCredentialConfigured() { return credentialConfigured; },
    saveOpenAiApiKey() { savedKeys.push(true); credentialConfigured = true; },
    isGeminiCredentialConfigured() { return geminiCredentialConfigured; },
    saveGeminiApiKey() { savedGeminiKeys.push(true); geminiCredentialConfigured = true; },
    getGeminiFileSearchStore(name) {
      if (options.geminiStoreError) throw options.geminiStoreError;
      return { name };
    },
    createOpenAiVectorStore(name) {
      if (options.createError) throw options.createError;
      created.push(name);
      return { id: options.createdStoreId || 'vs-synthetic-created', name };
    },
    getOpenAiVectorStore(id) {
      read.push(id);
      if (readErrorRemaining > 0) {
        readErrorRemaining -= 1;
        throw options.readError;
      }
      return { id };
    },
    hashText(text) { return ksp.kspAiHashTextFallback_(text); },
    uploadProviderSource(provider, config, source) {
      connectionUploads.push({ provider, config: plain(config), source: plain(source) });
      if (options.connectionError) throw options.connectionError;
      return {
        name: 'openai:vs-synthetic/files/openai-connection-file',
        providerDocumentId: 'openai-connection-file',
        fileId: 'openai-connection-file',
        attributes: plain(ksp.kspBuildOpenAiAttributes_(source))
      };
    },
    queryProvider(provider, config, request) {
      connectionQueries.push({ provider, config: plain(config), request: plain(request) });
      if (options.connectionQueryError) throw options.connectionQueryError;
      if (options.connectionQueryErrorRawValue && request.thinkingRawValue === options.connectionQueryErrorRawValue) {
        const error = new Error('synthetic tuple failure');
        error.code = 'OPENAI_HTTP_400';
        throw error;
      }
      const text = 'Knowledge Sharing Platforms synthetic connection test. The unique answer token is OPENAI_CONNECTION_READY.';
      return {
        id: 'response-synthetic',
        output: [
          { type: 'file_search_call', status: 'completed', results: [{
            file_id: 'openai-connection-file', filename: 'ksp-openai-connection-test.txt',
            attributes: {
              source_type: 'Pitchbook', source_id: 'KSP-OPENAI-CONNECTION-TEST',
              content_hash: ksp.kspAiHashTextFallback_(text)
            }
          }] },
          { type: 'message', content: [{ type: 'output_text', text: 'OPENAI_CONNECTION_READY', annotations: [] }] }
        ]
      };
    },
    deleteProviderDocument(provider, config, documentValue) {
      connectionDeletes.push({ provider, config: plain(config), document: plain(documentValue) });
    },
    writeAiSetting(key, value) {
      writes.push({ key, value });
      context.settings[key] = String(value);
    },
    deleteOpenAiVectorStore() { deleted.push(true); },
    _debug: { context, writes, created, read, deleted, syncCalls, savedKeys, savedGeminiKeys,
      connectionUploads, connectionQueries, connectionDeletes }
  };
  return attachSharedAdminAuth(environment);
}

function withSyncStub(callback) {
  const original = ksp.kspRunProviderNeutralAiSync_;
  try {
    ksp.kspRunProviderNeutralAiSync_ = (environment, options) => {
      environment._debug.syncCalls.push(options || {});
      return {
        ok: true,
        providers: {
          OPENAI: { enabled: true, status: 'PASS', indexed: 0, failed: 0 },
          GEMINI: { enabled: false, status: 'DISABLED_BY_CONFIG', indexed: 0, failed: 0 }
        },
        indexed: 0, reused: 0, unchanged: 0, removed: 0, failed: 0
      };
    };
    return callback();
  } finally {
    ksp.kspRunProviderNeutralAiSync_ = original;
  }
}

function geminiQualificationResponse(contentHash, options = {}) {
  const citationMetadata = options.citationMetadata || {
    source_type: 'Pitchbook', source_id: 'DOC-000017', content_hash: contentHash
  };
  const annotations = options.withCitation === false ? [] : [{
    type: 'file_citation',
    source: options.citationSource || 'Synthetic excerpt, not a provider identity.',
    document_uri: options.documentUri || 'fileSearchStores/synthetic',
    custom_metadata: Object.entries(citationMetadata).map(([key, string_value]) => ({ key, string_value }))
  }];
  return {
    status: 'completed',
    steps: [{ type: 'model_output', content: [{
      type: 'text', text: options.answer === undefined ? 'CODEX18_SYNTH_PITCHBOOK_20260830' : options.answer,
      annotations
    }] }]
  };
}

function geminiGenerateContentQualificationResponse(contentHash, options = {}) {
  const metadata = options.citationMetadata || {
    source_type: 'Pitchbook', source_id: 'DOC-000017', content_hash: contentHash
  };
  const groundingChunks = options.withCitation === false ? [] : [{
    retrievedContext: {
      title: 'synthetic.txt',
      uri: options.citationSource || 'fileSearchStores/synthetic/documents/current',
      customMetadata: Object.entries(metadata).map(([key, stringValue]) => ({ key, stringValue }))
    }
  }];
  return {
    candidates: [{
      finishReason: 'STOP',
      content: { parts: [{ text: options.answer === undefined
        ? 'CODEX18_SYNTH_PITCHBOOK_20260830' : options.answer }] },
      groundingMetadata: { groundingChunks }
    }]
  };
}

function makeGeminiQualificationEnvironment(sequence = []) {
  const context = baseContext();
  context.state = { config: { adminEmails: ['admin@example.com'] }, resources: {} };
  context.pitchbookRows[0] = { ...context.pitchbookRows[0], Document_ID: 'DOC-000017',
    File_URL: 'https://drive.test/doc-17', Status: 'Active' };
  const bytes = Array.from(Buffer.from('CODEX18_SYNTH_PITCHBOOK_20260830', 'utf8'));
  const contentHash = ksp.kspAiHashBytesFallback_(bytes);
  const document = { name: 'fileSearchStores/synthetic/documents/current', state: 'ACTIVE', customMetadata: {
    source_type: 'Pitchbook', source_id: 'DOC-000017', content_hash: contentHash
  } };
  context.pitchbookRows[0].AI_Provider_State_JSON = JSON.stringify({ stateVersion: 1, GEMINI: {
    status: 'Indexed', documentName: document.name, storeName: 'fileSearchStores/synthetic',
    contentHash
  } });
  const profile = {
    profileId: 'gemini-38-low', provider: 'GEMINI', modelId: 'gemini-3.8-flash',
    displayName: 'Gemini 3.8 Flash', family: 'Gemini 3.8', enabled: true, userVisible: true,
    isProviderDefault: true, maxOutputTokens: 2048,
    thinkingProfiles: [{ thinkingProfileId: 'low', label: 'Low', rawValue: 'low',
      providerDefault: false, enabled: true }],
    defaultThinkingProfileId: 'low'
  };
  const policy = plain(ksp.kspNormalizeAiModelPolicy_({ schemaVersion: 1,
    updatedAt: '2026-09-04T00:00:00.000Z', profiles: [profile] }));
  context.settings = {
    ...context.settings,
    GEMINI_ENABLED: 'false',
    GEMINI_FILE_SEARCH_STORE_NAME: 'fileSearchStores/synthetic',
    GEMINI_DEFAULT_MODEL: 'gemini-3.8-flash',
    GEMINI_READINESS: 'READY_FOR_QUALIFICATION',
    AI_MODEL_POLICY_JSON: JSON.stringify(policy)
  };
  const calls = [];
  const writes = [];
  let clock = 0;
  let queryIndex = 0;
  const env = {
    nowIso() { clock += 1; return `2026-09-04T00:00:${String(clock).padStart(2, '0')}.000Z`; },
    loadAiContext() { return context; },
    ensureAiSettings(rows) {
      (rows || []).forEach((row) => {
        if (!(row.Key in context.settings)) context.settings[row.Key] = row.Value;
      });
    },
    isAdministrator() { return true; },
    isGeminiCredentialConfigured() { return true; },
    readPitchbookSource() { return { mimeType: 'text/plain', bytes }; },
    hashBytes(value) { return ksp.kspAiHashBytesFallback_(value); },
    findProviderDocumentsBySource(provider, config, sourceType, sourceId) {
      assert.equal(provider, 'GEMINI');
      assert.equal(sourceType, 'Pitchbook');
      assert.equal(sourceId, 'DOC-000017');
      return [plain(document)];
    },
    readProviderDocument(provider, config, value, source) {
      assert.equal(provider, 'GEMINI');
      assert.equal(config.storeName, 'fileSearchStores/synthetic');
      assert.equal(value.name, document.name);
      assert.equal(source.contentHash, contentHash);
      return plain(document);
    },
    queryProvider(provider, config, request) {
      calls.push({ provider, config: plain(config), request: plain(request) });
      const behavior = sequence[queryIndex++];
      if (typeof behavior === 'function') return behavior({ provider, config, request, contentHash });
      if (behavior instanceof Error) throw behavior;
      return behavior === undefined ? geminiQualificationResponse(contentHash) : behavior;
    },
    writeAiSetting(key, value) {
      writes.push({ key, value: String(value) });
      context.settings[key] = String(value);
    },
    _debug: { context, calls, writes, contentHash, profile }
  };
  return attachSharedAdminAuth(env);
}

function runGeminiQualification(env, transport = 'INTERACTIONS') {
  return ksp.kspRunGeminiExactTupleQualification_(env, env._debug.context,
    ksp.kspNormalizeAiSettings_(env._debug.context.settings), env._debug.profile, 'low', transport);
}

test('OpenAI key absence fails safely and leaves the provider disabled', () => {
  const env = makeAdminEnvironment({ key: false });
  const result = plain(mutateAdmin(env, { action: 'ENABLE_OPENAI' }));
  assert.equal(result.ok, false);
  assert.equal(result.error.code, 'OPENAI_API_KEY_NOT_CONFIGURED');
  assert.equal(env._debug.context.settings.OPENAI_ENABLED, 'false');
  assert.equal(env._debug.created.length, 0);
  assert.equal(env._debug.writes.length, 0);
  assert.doesNotMatch(JSON.stringify(result), /vs-synthetic|KSP_OPENAI_API_KEY|secret/i);
});

test('Gemini credential and Store administration is boolean-only and administrator-guarded', () => {
  const denied = makeAdminEnvironment({ admin: false, geminiKey: false,
    geminiStore: 'fileSearchStores/private-store' });
  const deniedResult = plain(ksp.kspMutateAiProviderSettings_(denied, {
    action: 'CONNECT_GEMINI', apiKey: 'gemini-secret-synthetic'
  }));
  assert.equal(deniedResult.ok, false);
  assert.equal(deniedResult.error.code, 'SHARED_ADMIN_SESSION_INVALID');
  assert.equal(denied._debug.savedGeminiKeys.length, 0);

  const env = makeAdminEnvironment({ geminiKey: false, geminiStore: 'fileSearchStores/private-store' });
  const connected = plain(mutateAdmin(env, {
    action: 'CONNECT_GEMINI', apiKey: 'gemini-secret-synthetic'
  }));
  assert.equal(connected.ok, true, JSON.stringify(connected));
  assert.equal(connected.readyForQualification, true);
  assert.equal(env._debug.savedGeminiKeys.length, 1);
  assert.equal(env._debug.context.settings.GEMINI_ENABLED, 'false');
  assert.equal(env._debug.context.settings.GEMINI_READINESS, 'READY_FOR_QUALIFICATION');
  const adminData = plain(ksp.kspGetAiProviderAdminData_(env));
  assert.equal(adminData.gemini.keyConfigured, true);
  assert.equal(adminData.gemini.storeReady, true);
  assert.doesNotMatch(JSON.stringify(adminData), /gemini-secret-synthetic|private-store|KSP_GEMINI_API_KEY/);
});

test('Gemini qualification sends one exact 3.8 low 2048 Interactions File Search tuple', () => {
  const context = baseContext();
  context.pitchbookRows[0] = { ...context.pitchbookRows[0], Document_ID: 'DOC-000017',
    File_URL: 'https://drive.test/doc-17', Status: 'Active' };
  const bytes = Array.from(Buffer.from('CODEX18_SYNTH_PITCHBOOK_20260830', 'utf8'));
  const contentHash = ksp.kspAiHashBytesFallback_(bytes);
  const document = { name: 'fileSearchStores/private/documents/current', state: 'ACTIVE', customMetadata: {
    source_type: 'Pitchbook', source_id: 'DOC-000017', content_hash: contentHash
  } };
  context.pitchbookRows[0].AI_Provider_State_JSON = JSON.stringify({ stateVersion: 1, GEMINI: {
    status: 'Indexed', documentName: document.name, storeName: 'fileSearchStores/private', contentHash
  } });
  const calls = [];
  const env = {
    readPitchbookSource() { return { mimeType: 'text/plain', bytes }; },
    hashBytes(value) { return ksp.kspAiHashBytesFallback_(value); },
    findProviderDocumentsBySource(provider, config, sourceType, sourceId) {
      assert.equal(provider, 'GEMINI');
      assert.equal(sourceType, 'Pitchbook');
      assert.equal(sourceId, 'DOC-000017');
      return [plain(document)];
    },
    readProviderDocument() {
      return plain(document);
    },
    queryProvider(provider, config, request) {
      calls.push({ provider, config: plain(config), request: plain(request) });
      return { status: 'completed', steps: [{ type: 'model_output', content: [{
        type: 'text', text: 'CODEX18_SYNTH_PITCHBOOK_20260830', annotations: [{
          type: 'file_citation', source: 'Synthetic excerpt, not a provider identity.',
          document_uri: 'fileSearchStores/private', custom_metadata: [
            { key: 'source_type', string_value: 'Pitchbook' },
            { key: 'source_id', string_value: 'DOC-000017' },
            { key: 'content_hash', string_value: contentHash }
          ]
        }]
      }] }] };
    }
  };
  const qualification = plain(ksp.kspRunGeminiExactTupleQualification_(env, context,
    ksp.kspNormalizeAiSettings_({ GEMINI_FILE_SEARCH_STORE_NAME: 'fileSearchStores/private' }), {
      profileId: 'gemini-38-low', provider: 'GEMINI', modelId: 'gemini-3.8-flash',
      maxOutputTokens: 2048, thinkingProfiles: [{ thinkingProfileId: 'low', rawValue: 'low',
        providerDefault: false, enabled: true }]
    }, 'low'));
  assert.equal(qualification.status, 'PASS');
  assert.equal(calls.length, 1);
  assert.equal(calls[0].config.modelId, 'gemini-3.8-flash');
  assert.equal(calls[0].config.thinkingRawValue, 'low');
  assert.equal(calls[0].config.maxOutputTokens, 2048);
  assert.deepEqual(calls[0].request.generation_config, { max_output_tokens: 2048, thinking_level: 'low' });
  assert.match(calls[0].request.metadataFilter, /source_id = "DOC-000017"/);
});

test('Gemini qualification keeps no-answer, no-citation, and citation-identity failures distinct', () => {
  const noAnswerEnv = makeGeminiQualificationEnvironment([
    ({ contentHash }) => geminiQualificationResponse(contentHash, { answer: 'unrelated answer' })
  ]);
  assert.throws(() => runGeminiQualification(noAnswerEnv), (error) => {
    assert.equal(error.code, 'AI_GEMINI_QUALIFICATION_NO_GROUNDED_ANSWER');
    assert.equal(error.qualificationDiagnostic.classification, 'COMPLETED_NO_GROUNDED_ANSWER');
    assert.equal(error.qualificationDiagnostic.answerPresent, true);
    assert.equal(error.qualificationDiagnostic.expectedTokenPresent, false);
    return true;
  });

  const noCitationEnv = makeGeminiQualificationEnvironment([
    ({ contentHash }) => geminiQualificationResponse(contentHash, { withCitation: false })
  ]);
  assert.throws(() => runGeminiQualification(noCitationEnv), (error) => {
    assert.equal(error.code, 'AI_GEMINI_QUALIFICATION_NO_FILE_CITATION');
    assert.equal(error.qualificationDiagnostic.classification, 'COMPLETED_NO_FILE_CITATION');
    assert.equal(error.qualificationDiagnostic.fileCitationCount, 0);
    return true;
  });

  const mismatchEnv = makeGeminiQualificationEnvironment([
    ({ contentHash }) => geminiQualificationResponse(contentHash, {
      citationMetadata: { source_type: 'Pitchbook', source_id: 'DOC-000017', content_hash: 'stale-hash' }
    })
  ]);
  assert.throws(() => runGeminiQualification(mismatchEnv), (error) => {
    assert.equal(error.code, 'AI_GEMINI_QUALIFICATION_CITATION_MISMATCH');
    assert.equal(error.qualificationDiagnostic.classification, 'CITATION_IDENTITY_OR_METADATA_MISMATCH');
    assert.equal(error.qualificationDiagnostic.fileCitationCount, 1);
    assert.equal(error.qualificationDiagnostic.authoritativeCitationMatched, false);
    return true;
  });
});

test('accepted Work 0026 exact-tuple response-shape failure remains a product defect', () => {
  const env = makeGeminiQualificationEnvironment([{ status: 'completed' }]);
  assert.throws(() => ksp.kspRunGeminiBoundedQualificationCampaign_(env, env._debug.context,
    ksp.kspNormalizeAiSettings_(env._debug.context.settings), env._debug.profile, 'low'), (error) => {
    assert.equal(error.code, 'AI_GEMINI_QUALIFICATION_APPLICATION_FAILURE');
    assert.equal(error.qualificationEvidence.queryCalls, 1);
    assert.equal(error.qualificationEvidence.primary.classification,
      'RESPONSE_SHAPE_OR_APPLICATION_FAILURE');
    assert.equal(error.qualificationEvidence.exactExternalLimitation, 'NONE');
    return true;
  });
});

test('model unsupported evidence opens only the one 3.7 Interactions fallback', () => {
  const modelError = new Error('PRIVATE_PROVIDER_MESSAGE');
  modelError.code = 'AI_GEMINI_MODEL_UNSUPPORTED';
  modelError.httpStatus = 404;
  modelError.providerErrorCodes = ['model_not_found'];
  const env = makeGeminiQualificationEnvironment([
    modelError,
    ({ contentHash }) => geminiQualificationResponse(contentHash)
  ]);
  const campaign = plain(ksp.kspRunGeminiBoundedQualificationCampaign_(env, env._debug.context,
    ksp.kspNormalizeAiSettings_(env._debug.context.settings), env._debug.profile, 'low'));
  assert.equal(campaign.status, 'PASS');
  assert.equal(campaign.selectedProfile.modelId, 'gemini-3.7-flash');
  assert.equal(campaign.evidence.queryCalls, 2);
  assert.equal(campaign.evidence.primary.classification, 'MODEL_ACCESS_OR_UNSUPPORTED');
  assert.equal(campaign.evidence.secondControl, '3_7_INTERACTIONS');
  assert.equal(campaign.evidence.second.classification, 'PASS');
  assert.deepEqual(env._debug.calls.map((call) => call.config.modelId),
    ['gemini-3.8-flash', 'gemini-3.7-flash']);
  assert.ok(env._debug.calls.every((call) => call.config.queryTransport === 'INTERACTIONS'));
  assert.doesNotMatch(JSON.stringify(campaign), /PRIVATE_PROVIDER_MESSAGE/);
});

test('accepted Work 0026 bounded campaign still parses a successful 3.8 exact tuple', () => {
  const env = makeGeminiQualificationEnvironment([
    ({ contentHash }) => geminiQualificationResponse(contentHash)
  ]);
  const result = plain(ksp.kspRunGeminiBoundedQualificationCampaign_(env, env._debug.context,
    ksp.kspNormalizeAiSettings_(env._debug.context.settings), env._debug.profile, 'low'));
  assert.equal(result.status, 'PASS');
  assert.equal(result.qualification.status, 'PASS');
  assert.equal(result.evidence.queryCalls, 1);
  assert.equal(result.evidence.primary.classification, 'PASS');
  assert.equal(result.evidence.secondControl, 'NOT_USED');
  assert.equal(result.evidence.exactExternalLimitation, 'NONE');
  assert.equal(env._debug.calls.length, 1);
  assert.equal(env._debug.calls[0].config.modelId, 'gemini-3.8-flash');
  assert.equal(env._debug.calls[0].config.thinkingRawValue, 'low');
  assert.equal(env._debug.calls[0].config.maxOutputTokens, 2048);
  assert.equal(result.qualification.storeName, 'fileSearchStores/synthetic');
});

test('accepted Work 0026 bounded helper retains its historical one-candidate fallback evidence', () => {
  const unsupported = Object.assign(new Error('PRIVATE_PROVIDER_MESSAGE'), {
    code: 'AI_GEMINI_MODEL_UNSUPPORTED', httpStatus: 404,
    providerErrorCodes: ['model_not_found']
  });
  const env = makeGeminiQualificationEnvironment([
    unsupported,
    ({ contentHash }) => geminiQualificationResponse(contentHash)
  ]);
  const result = plain(ksp.kspRunGeminiBoundedQualificationCampaign_(env, env._debug.context,
    ksp.kspNormalizeAiSettings_(env._debug.context.settings), env._debug.profile, 'low'));
  assert.equal(result.status, 'PASS');
  assert.equal(result.evidence.queryCalls, 2);
  assert.equal(result.evidence.primary.classification, 'MODEL_ACCESS_OR_UNSUPPORTED');
  assert.equal(result.evidence.secondControl, '3_7_INTERACTIONS');
  assert.equal(result.evidence.second.classification, 'PASS');
  assert.equal(result.selectedProfile.modelId, 'gemini-3.7-flash');
  assert.deepEqual(env._debug.calls.map((call) => call.config.modelId),
    ['gemini-3.8-flash', 'gemini-3.7-flash']);
  assert.doesNotMatch(JSON.stringify(result), /PRIVATE_PROVIDER_MESSAGE/);
});

test('accepted Work 0026 bounded helper keeps fallback application failure distinct', () => {
  const unsupported = Object.assign(new Error('PRIVATE_PROVIDER_MESSAGE'), {
    code: 'AI_GEMINI_MODEL_UNSUPPORTED', httpStatus: 404,
    providerErrorCodes: ['model_not_found']
  });
  const env = makeGeminiQualificationEnvironment([unsupported, { status: 'completed' }]);
  assert.throws(() => ksp.kspRunGeminiBoundedQualificationCampaign_(env, env._debug.context,
    ksp.kspNormalizeAiSettings_(env._debug.context.settings), env._debug.profile, 'low'), (error) => {
    assert.equal(error.code, 'AI_GEMINI_QUALIFICATION_APPLICATION_FAILURE');
    assert.equal(error.qualificationEvidence.queryCalls, 2);
    assert.equal(error.qualificationEvidence.primary.classification, 'MODEL_ACCESS_OR_UNSUPPORTED');
    assert.equal(error.qualificationEvidence.second.classification, 'RESPONSE_SHAPE_OR_APPLICATION_FAILURE');
    assert.equal(error.qualificationEvidence.exactExternalLimitation, 'NONE');
    assert.doesNotMatch(JSON.stringify(error.qualificationEvidence),
      /PRIVATE_PROVIDER_MESSAGE|fileSearchStores\/synthetic|documents\/current/);
    return true;
  });
  assert.equal(env._debug.calls.length, 2);
});

test('accepted Work 0026 bounded helper retains safe provider-terminal control evidence', () => {
  const terminalError = new Error('PRIVATE_PROVIDER_MESSAGE');
  terminalError.code = 'AI_QUERY_PROVIDER_TERMINAL';
  terminalError.providerStatus = 'failed';
  terminalError.providerErrorCodes = ['service_unavailable', 'private_provider_identifier'];
  const env = makeGeminiQualificationEnvironment([
    terminalError,
    ({ contentHash }) => geminiGenerateContentQualificationResponse(contentHash)
  ]);
  let retained;
  assert.throws(() => ksp.kspRunGeminiBoundedQualificationCampaign_(env, env._debug.context,
    ksp.kspNormalizeAiSettings_(env._debug.context.settings), env._debug.profile, 'low'), (error) => {
    assert.equal(error.code, 'AI_GEMINI_EXTERNAL_LIMITATION');
    retained = plain(error.qualificationEvidence);
    return true;
  });
  assert.equal(retained.queryCalls, 2);
  assert.equal(retained.primary.classification, 'PROVIDER_TERMINAL_FAILED');
  assert.deepEqual(retained.primary.providerErrorCodes, ['service_unavailable']);
  assert.equal(retained.secondControl, '3_8_GENERATE_CONTENT');
  assert.equal(retained.second.classification, 'PASS');
  assert.equal(retained.exactExternalLimitation, 'INTERACTIONS_SPECIFIC_LIMITATION');
  assert.deepEqual(env._debug.calls.map((call) => call.config.queryTransport),
    ['INTERACTIONS', 'GENERATE_CONTENT']);
  assert.ok(env._debug.calls.every((call) => call.provider === 'GEMINI'));
  assert.doesNotMatch(JSON.stringify(retained), /PRIVATE_PROVIDER_MESSAGE|private_provider_identifier/);
});

test('accepted Work 0026 bounded helper keeps invalid and unknown failures product-side', () => {
  for (const failure of [
    Object.assign(new Error('PRIVATE_INVALID_REQUEST'), {
      code: 'AI_QUERY_HTTP_FAILED', httpStatus: 400, providerErrorCodes: ['invalid_request']
    }),
    new Error('PRIVATE_UNKNOWN_APPLICATION_FAILURE')
  ]) {
    const env = makeGeminiQualificationEnvironment([failure]);
    let retained;
    assert.throws(() => ksp.kspRunGeminiBoundedQualificationCampaign_(env, env._debug.context,
      ksp.kspNormalizeAiSettings_(env._debug.context.settings), env._debug.profile, 'low'), (error) => {
      assert.equal(error.code, 'AI_GEMINI_QUALIFICATION_APPLICATION_FAILURE');
      retained = plain(error.qualificationEvidence);
      return true;
    });
    assert.equal(retained.queryCalls, 1);
    assert.equal(retained.primary.classification, 'RESPONSE_SHAPE_OR_APPLICATION_FAILURE');
    assert.equal(retained.secondControl, 'NOT_USED');
    assert.equal(retained.exactExternalLimitation, 'NONE');
    assert.equal(env._debug.calls.length, 1);
    assert.doesNotMatch(JSON.stringify(retained), /PRIVATE_INVALID_REQUEST|PRIVATE_UNKNOWN_APPLICATION_FAILURE/);
  }
});

test('new classification retains explicit transient HTTP evidence without transport fallback', () => {
  const providerError = Object.assign(new Error('PRIVATE_PROVIDER_MESSAGE'), {
    code: 'AI_QUERY_HTTP_FAILED', httpStatus: 503,
    providerErrorCodes: ['service_unavailable', 'private_provider_identifier']
  });
  const env = makeGeminiQualificationEnvironment([providerError]);
  let retained;
  assert.throws(() => ksp.kspRunGeminiBoundedQualificationCampaign_(env, env._debug.context,
    ksp.kspNormalizeAiSettings_(env._debug.context.settings), env._debug.profile, 'low'), (error) => {
    assert.equal(error.code, 'AI_GEMINI_EXTERNAL_LIMITATION');
    retained = plain(error.qualificationEvidence);
    return true;
  });
  assert.equal(retained.queryCalls, 1);
  assert.equal(retained.primary.classification, 'PROVIDER_OR_TRANSIENT_FAILURE');
  assert.equal(retained.primary.httpStatus, 503);
  assert.deepEqual(retained.primary.providerErrorCodes, ['service_unavailable']);
  assert.equal(retained.secondControl, 'NOT_USED');
  assert.equal(retained.exactExternalLimitation, 'PROVIDER_OR_TRANSIENT_FAILURE');
  assert.equal(env._debug.calls.length, 1);
  assert.doesNotMatch(JSON.stringify(retained), /PRIVATE_PROVIDER_MESSAGE|private_provider_identifier/);
});

test('OpenAI Store creation uses a synthetic official REST POST and returns only the server-side resource', () => {
  const originalProperties = ksp.PropertiesService;
  const originalFetch = ksp.UrlFetchApp;
  const requests = [];
  ksp.PropertiesService = { getScriptProperties: () => ({ getProperty: () => 'sk-synthetic-only' }) };
  ksp.UrlFetchApp = {
    fetch(url, options) {
      requests.push({ url, options });
      return {
        getResponseCode: () => 200,
        getContentText: () => JSON.stringify({ id: 'vs-synthetic-rest', name: 'Private Assets Knowledge - OpenAI' })
      };
    }
  };
  try {
    const store = plain(ksp.kspOpenAiCreateVectorStoreLive_('Private Assets Knowledge - OpenAI'));
    assert.equal(store.id, 'vs-synthetic-rest');
    assert.equal(requests.length, 1);
    assert.match(requests[0].url, /\/v1\/vector_stores$/);
    assert.equal(requests[0].options.method, 'post');
    assert.deepEqual(JSON.parse(requests[0].options.payload), { name: 'Private Assets Knowledge - OpenAI' });
  } finally {
    if (originalProperties === undefined) delete ksp.PropertiesService;
    else ksp.PropertiesService = originalProperties;
    if (originalFetch === undefined) delete ksp.UrlFetchApp;
    else ksp.UrlFetchApp = originalFetch;
  }
});

test('OpenAI connection saves the key, runs an isolated synthetic self-test, and stops at READY_FOR_SYNC', () => {
  const env = makeAdminEnvironment({ key: false });
  const result = plain(mutateAdmin(env, {
    action: 'CONNECT_OPENAI', apiKey: 'sk-synthetic-only'
  }));
  assert.equal(result.ok, true, JSON.stringify(result));
  assert.equal(result.readyForSync, true);
  assert.equal(result.enabled, false);
  assert.deepEqual(env._debug.created, ['Private Assets Knowledge - OpenAI']);
  assert.deepEqual(env._debug.read, ['vs-synthetic-created']);
  assert.equal(env._debug.savedKeys.length, 1);
  assert.equal(env._debug.connectionUploads.length, 1);
  assert.equal(env._debug.connectionQueries.length, 1);
  assert.deepEqual(env._debug.connectionQueries[0].request.filters, {
    type: 'eq', key: 'source_id', value: 'KSP-OPENAI-CONNECTION-TEST'
  });
  assert.deepEqual(env._debug.connectionQueries[0].request.include, ['file_search_call.results']);
  assert.equal(env._debug.connectionDeletes.length, 1);
  assert.equal(env._debug.syncCalls.length, 0);
  assert.equal(env._debug.context.settings.OPENAI_DEFAULT_MODEL, 'gpt-5.6-terra');
  assert.equal(env._debug.context.settings.OPENAI_VECTOR_STORE_ID, 'vs-synthetic-created');
  assert.equal(env._debug.context.settings.OPENAI_ENABLED, 'false');
  assert.equal(env._debug.context.settings.OPENAI_READINESS, 'READY_FOR_SYNC');
  assert.equal(JSON.stringify(result).includes('sk-synthetic-only'), false);
  assert.equal(JSON.stringify(result).includes('vs-synthetic-created'), false);
});

test('repeated OpenAI connection reuses the configured store and preserves an existing model', () => {
  const env = makeAdminEnvironment({ storeId: 'vs-existing', model: 'gpt-existing' });
  const first = plain(mutateAdmin(env, { action: 'CONNECT_OPENAI' }));
  const second = plain(mutateAdmin(env, { action: 'CONNECT_OPENAI' }));
  assert.equal(first.ok, true);
  assert.equal(second.ok, true);
  assert.deepEqual(env._debug.created, []);
  assert.deepEqual(env._debug.read, ['vs-existing', 'vs-existing']);
  assert.equal(env._debug.connectionUploads.length, 2);
  assert.equal(env._debug.connectionDeletes.length, 2);
  assert.equal(env._debug.context.settings.OPENAI_DEFAULT_MODEL, 'gpt-existing');
  assert.equal(env._debug.writes.filter((item) => item.key === 'OPENAI_DEFAULT_MODEL').length, 0);
});

test('store capability failure keeps OpenAI disabled and does not invoke Gemini fallback', () => {
  const env = makeAdminEnvironment({ readError: Object.assign(new Error('private response'), { code: 'OPENAI_HTTP_500' }) });
  const original = ksp.kspRunProviderNeutralAiSync_;
  let syncCalls = 0;
  ksp.kspRunProviderNeutralAiSync_ = () => { syncCalls += 1; throw new Error('must not run'); };
  try {
    const result = plain(mutateAdmin(env, { action: 'ENABLE_OPENAI' }));
    assert.equal(result.ok, false);
    assert.equal(result.error.code, 'OPENAI_CONNECTION_TEST_FAILED');
    assert.equal(env._debug.context.settings.OPENAI_ENABLED, 'false');
    assert.equal(syncCalls, 0);
    assert.doesNotMatch(JSON.stringify(result), /private response|vs-synthetic-created|GEMINI/);
  } finally {
    ksp.kspRunProviderNeutralAiSync_ = original;
  }
});

test('inaccessible configured Store is replaced once and old provider state is not deleted', () => {
  const env = makeAdminEnvironment({
    storeId: 'vs-inaccessible',
    readError: Object.assign(new Error('private response'), { code: 'OPENAI_HTTP_403' }),
    readErrorOnce: true,
    createdStoreId: 'vs-replacement'
  });
  const result = plain(mutateAdmin(env, { action: 'CONNECT_OPENAI' }));
  assert.equal(result.ok, true, JSON.stringify(result));
  assert.deepEqual(env._debug.read, ['vs-inaccessible', 'vs-replacement']);
  assert.deepEqual(env._debug.created, ['Private Assets Knowledge - OpenAI']);
  assert.equal(env._debug.context.settings.OPENAI_VECTOR_STORE_ID, 'vs-replacement');
  assert.equal(env._debug.deleted.length, 0);
  assert.equal(env._debug.syncCalls.length, 0);
  assert.equal(env._debug.context.settings.OPENAI_READINESS, 'READY_FOR_SYNC');
  assert.doesNotMatch(JSON.stringify(result), /vs-inaccessible|vs-replacement/);
});

test('invalid OpenAI key fails before Store or source mutation', () => {
  const env = makeAdminEnvironment({
    key: false,
    createError: Object.assign(new Error('private response'), { code: 'OPENAI_HTTP_401' })
  });
  const result = plain(mutateAdmin(env, {
    action: 'CONNECT_OPENAI', apiKey: 'sk-invalid-synthetic'
  }));
  assert.equal(result.ok, false);
  assert.equal(result.error.code, 'OPENAI_CONNECTION_TEST_FAILED');
  assert.equal(env._debug.created.length, 0);
  assert.equal(env._debug.connectionUploads.length, 0);
  assert.equal(env._debug.connectionQueries.length, 0);
  assert.equal(env._debug.connectionDeletes.length, 0);
  assert.equal(env._debug.syncCalls.length, 0);
  assert.doesNotMatch(JSON.stringify(result), /sk-invalid-synthetic|private response|vs-/);
});

test('invalid OpenAI connection fails before source sync and cleans the synthetic document', () => {
  const env = makeAdminEnvironment({
    connectionQueryError: Object.assign(new Error('synthetic provider response'), { code: 'OPENAI_HTTP_401' })
  });
  const result = plain(mutateAdmin(env, {
    action: 'CONNECT_OPENAI', apiKey: 'sk-invalid-synthetic'
  }));
  assert.equal(result.ok, false);
  assert.equal(result.error.code, 'OPENAI_CONNECTION_TEST_FAILED');
  assert.equal(env._debug.context.settings.OPENAI_ENABLED, 'false');
  assert.equal(env._debug.context.settings.OPENAI_READINESS, 'ERROR');
  assert.equal(env._debug.syncCalls.length, 0);
  assert.equal(env._debug.connectionUploads.length, 1);
  assert.equal(env._debug.connectionDeletes.length, 1);
  assert.doesNotMatch(JSON.stringify(result), /sk-invalid-synthetic|openai-connection-file|vs-synthetic-created/);
});

test('disable preserves the configured store, re-enable returns to READY_FOR_SYNC, and source sync is explicit', () => {
  const env = makeAdminEnvironment({ storeId: 'vs-existing', enabled: true, model: 'gpt-existing' });
  withSyncStub(() => {
    const connected = plain(mutateAdmin(env, { action: 'CONNECT_OPENAI' }));
    assert.equal(connected.ok, true);
    const disabled = plain(mutateAdmin(env, { action: 'DISABLE_OPENAI' }));
    assert.equal(disabled.ok, true);
    assert.equal(env._debug.context.settings.OPENAI_ENABLED, 'false');
    assert.equal(env._debug.context.settings.OPENAI_VECTOR_STORE_ID, 'vs-existing');
    assert.deepEqual(env._debug.deleted, []);
    const blocked = plain(mutateAdmin(env, { action: 'SYNC' }));
    assert.equal(blocked.ok, false);
    assert.equal(blocked.error.code, 'OPENAI_NOT_READY_FOR_SYNC');
    const enabled = plain(mutateAdmin(env, { action: 'CONNECT_OPENAI' }));
    assert.equal(enabled.ok, true);
    assert.deepEqual(env._debug.created, []);
    assert.equal(env._debug.context.settings.OPENAI_ENABLED, 'false');
    assert.equal(env._debug.context.settings.OPENAI_READINESS, 'READY_FOR_SYNC');
    const sync = plain(mutateAdmin(env, { action: 'SYNC' }));
    assert.equal(sync.ok, true);
    assert.equal(env._debug.syncCalls.length, 1);
    assert.equal(env._debug.syncCalls[0].force, true);
    assert.equal(env._debug.context.settings.OPENAI_ENABLED, 'true');
    assert.equal(env._debug.context.settings.OPENAI_READINESS, 'ACTIVE');
  });
});

test('administrator SYNC forwards a trimmed sourceType and blank sourceType preserves combined behavior', () => {
  const env = makeAdminEnvironment();
  withSyncStub(() => {
    const meeting = plain(mutateAdmin(env, {
      action: 'SYNC', sourceType: '  Meeting  '
    }));
    const combined = plain(mutateAdmin(env, {
      action: 'SYNC', sourceType: '  '
    }));
    assert.equal(meeting.ok, true);
    assert.equal(meeting.sync.sourceType, 'Meeting');
    assert.equal(combined.ok, true);
    assert.equal(combined.sync.sourceType, '');
    assert.deepEqual(plain(env._debug.syncCalls), [
      { force: true, sourceType: 'Meeting', providers: ['OPENAI'] },
      { force: true, sourceType: '', providers: ['OPENAI'] }
    ]);
  });
});

test('administrator exact SYNC forwards the trimmed sourceId with its sourceType', () => {
  const env = makeAdminEnvironment();
  env._debug.context.pitchbookRows[0].Document_ID = 'DOC-000017';
  withSyncStub(() => {
    const result = plain(mutateAdmin(env, {
      action: 'SYNC', sourceType: '  Pitchbook  ', sourceId: '  DOC-000017  '
    }));
    assert.equal(result.ok, true);
    assert.equal(result.sync.sourceType, 'Pitchbook');
    assert.equal(result.sync.exact, true);
    assert.deepEqual(plain(env._debug.syncCalls), [
      { force: true, sourceType: 'Pitchbook', sourceId: 'DOC-000017', providers: ['OPENAI'] }
    ]);
    assert.doesNotMatch(JSON.stringify(result), /DOC-000017/);
  });
});

test('item-level OpenAI sync failure preserves the valid connection and returns safe diagnostics', () => {
  const env = makeAdminEnvironment({ enabled: true, storeId: 'vs-private', model: 'gpt-5.6-terra', readiness: 'ACTIVE' });
  const original = ksp.kspRunProviderNeutralAiSync_;
  ksp.kspRunProviderNeutralAiSync_ = () => ({
    ok: false,
    providerOk: true,
    partial: true,
    selected: 2,
    indexed: 1,
    reused: 0,
    unchanged: 0,
    metadataRefreshed: 1,
    removed: 0,
    failed: 1,
    skippedClaims: 0,
    providers: { OPENAI: { enabled: true, usable: true, status: 'PARTIAL', selected: 2, indexed: 1, failed: 1 } },
    items: [{ provider: 'OPENAI', sourceType: 'Pitchbook', sourceId: 'DOC-PRIVATE', action: 'failed', code: 'OPENAI_INDEX_TIMEOUT' }],
    errors: []
  });
  try {
    const result = plain(mutateAdmin(env, {
      action: 'SYNC', sourceType: 'Pitchbook'
    }));
    assert.equal(result.ok, true);
    assert.equal(result.sync.ok, false);
    assert.equal(result.sync.partial, true);
    assert.equal(result.sync.usable, true);
    assert.equal(result.sync.selected, 2);
    assert.equal(result.sync.indexed, 1);
    assert.equal(result.sync.metadataRefreshed, 1);
    assert.equal(result.sync.failed, 1);
    assert.deepEqual(result.sync.errorCodes, ['OPENAI_INDEX_TIMEOUT']);
    assert.equal(env._debug.context.settings.OPENAI_ENABLED, 'true');
    assert.equal(env._debug.context.settings.OPENAI_READINESS, 'ACTIVE_WITH_SYNC_ERRORS');
    assert.doesNotMatch(JSON.stringify(result), /DOC-PRIVATE|vs-private/);
  } finally {
    ksp.kspRunProviderNeutralAiSync_ = original;
  }
});

test('provider-level OpenAI sync failure invalidates readiness without exposing provider details', () => {
  const env = makeAdminEnvironment({ enabled: true, storeId: 'vs-private', model: 'gpt-5.6-terra', readiness: 'ACTIVE' });
  const original = ksp.kspRunProviderNeutralAiSync_;
  ksp.kspRunProviderNeutralAiSync_ = () => ({
    ok: false,
    providerOk: false,
    partial: false,
    selected: 0,
    indexed: 0,
    failed: 0,
    providers: { OPENAI: { enabled: true, usable: false, status: 'FAILED', errorCode: 'OPENAI_HTTP_401' } },
    items: [],
    errors: [{ provider: 'OPENAI', code: 'OPENAI_HTTP_401', privateDetail: 'must-not-leak' }]
  });
  try {
    const result = plain(mutateAdmin(env, { action: 'SYNC', sourceType: 'Meeting' }));
    assert.equal(result.ok, false);
    assert.equal(result.error.code, 'OPENAI_SYNC_FAILED');
    assert.equal(env._debug.context.settings.OPENAI_ENABLED, 'false');
    assert.equal(env._debug.context.settings.OPENAI_READINESS, 'ERROR');
    assert.doesNotMatch(JSON.stringify(result), /OPENAI_HTTP_401|must-not-leak|vs-private/);
  } finally {
    ksp.kspRunProviderNeutralAiSync_ = original;
  }
});

test('invalid administrator SYNC sourceType fails closed without invoking provider-neutral sync', () => {
  const env = makeAdminEnvironment();
  withSyncStub(() => {
    const result = plain(mutateAdmin(env, {
      action: 'SYNC', sourceType: 'Other'
    }));
    assert.equal(result.ok, false);
    assert.equal(result.error.code, 'AI_SYNC_SOURCE_TYPE_INVALID');
    assert.deepEqual(env._debug.syncCalls, []);
    assert.doesNotMatch(JSON.stringify(result), /MTG-|DOC-|store|document/i);
  });
});

test('administrator SYNC safe summary excludes source, store, and provider document identifiers', () => {
  const env = makeAdminEnvironment();
  const original = ksp.kspRunProviderNeutralAiSync_;
  ksp.kspRunProviderNeutralAiSync_ = () => ({
    ok: true,
    indexed: 1,
    reused: 0,
    unchanged: 0,
    removed: 0,
    failed: 0,
    providers: { GEMINI: { enabled: true, status: 'PASS', indexed: 1, failed: 0 } },
    items: [{
      provider: 'GEMINI',
      sourceType: 'Meeting',
      sourceId: 'MTG-PRIVATE-SYNTHETIC',
      documentName: 'fileSearchStores/store-private/documents/doc-private',
      providerDocumentId: 'doc-private',
      storeName: 'fileSearchStores/store-private'
    }],
    errors: []
  });
  try {
    const result = plain(mutateAdmin(env, {
      action: 'SYNC', sourceType: 'Meeting'
    }));
    assert.equal(result.ok, true);
    assert.equal(result.sync.sourceType, 'Meeting');
    assert.equal(result.sync.indexed, 1);
    assert.doesNotMatch(JSON.stringify(result), /MTG-PRIVATE-SYNTHETIC|fileSearchStores|doc-private|store-private/);
  } finally {
    ksp.kspRunProviderNeutralAiSync_ = original;
  }
});

test('legacy account identity alone cannot mutate after shared auth and status contains no private identifiers', () => {
  const env = makeAdminEnvironment({ admin: false, storeId: 'vs-private', key: true });
  const status = plain(ksp.kspGetAiProviderAdminData_(env));
  assert.equal(status.ok, true);
  assert.equal(status.canMutate, false);
  assert.equal(status.openai.vectorStoreReady, true);
  assert.equal(status.openai.status, 'DISABLED');
  const result = plain(ksp.kspMutateAiProviderSettings_(env, { action: 'ENABLE_OPENAI' }));
  assert.equal(result.ok, false);
  assert.equal(result.error.code, 'SHARED_ADMIN_SESSION_INVALID');
  assert.equal(env._debug.writes.length, 0);
  assert.equal(env._debug.created.length, 0);
  assert.doesNotMatch(JSON.stringify(status) + JSON.stringify(result), /vs-private|KSP_OPENAI_API_KEY/);
  const sync = plain(ksp.kspMutateAiProviderSettings_(env, { action: 'SYNC', sourceType: 'Meeting' }));
  assert.equal(sync.ok, false);
  assert.equal(sync.error.code, 'SHARED_ADMIN_SESSION_INVALID');
  assert.equal(env._debug.syncCalls.length, 0);
});

test('admin provider surface exposes policy-safe exact model fields without credentials or provider resource IDs', () => {
  const root = path.resolve(__dirname, '..');
  const page = fs.readFileSync(path.join(root, 'src', 'AiProviderSettingsPage.html'), 'utf8');
  const client = fs.readFileSync(path.join(root, 'src', 'ClientAiProviderSettings.html'), 'utf8');
  assert.match(page, /ChatGPT \/ OpenAI/);
  assert.match(page, /APIキーを保存して接続確認/);
  assert.match(page, /OpenAIを無効化/);
  assert.match(page, /資料を同期して利用開始/);
  assert.match(page, /id="ai-provider-openai-key-input" type="password"/);
  assert.match(page, /ai-provider-sync-source/);
  assert.match(page, /id="ai-provider-sync-source-id"/);
  assert.match(page, /value="Meeting"/);
  assert.match(page, /value="Pitchbook"/);
  assert.match(page, /id="ai-model-id"/);
  assert.match(page, /id="ai-model-thinking-profiles"/);
  assert.match(page, /id="ai-model-thinking-qualification-state"/);
  assert.match(client, /getAiProviderAdminData/);
  assert.match(client, /mutateAiProviderSettings/);
  assert.match(client, /const isSync=action==='SYNC'\|\|action==='SYNC_GEMINI'/);
  assert.match(client, /sourceId:isSync\?\(sourceId\|\|''\):''/);
  assert.match(client, /OPENAI_INDEX_TIMEOUT/);
  assert.match(client, /sync\.selected/);
  assert.match(client, /sync\.failed/);
  assert.doesNotMatch(page + client, /KSP_OPENAI_API_KEY|OPENAI_VECTOR_STORE_ID|OPENAI_DEFAULT_MODEL|gpt-5\.6-terra/);
});

test('administrator migrates the accepted OpenAI default into a persisted qualified model policy', () => {
  const env = makeAdminEnvironment({
    enabled: true, storeId: 'vs-synthetic-existing', model: 'gpt-5.6-terra', readiness: 'ACTIVE'
  });
  const result = plain(mutateAdmin(env, { action: 'MIGRATE_MODEL_POLICY' }));
  assert.equal(result.ok, true);
  assert.equal(result.workId, '0025');
  assert.equal(result.modelPolicy.schemaVersion, 1);
  assert.equal(result.modelPolicy.profiles.length, 1);
  assert.equal(result.modelPolicy.profiles[0].modelId, 'gpt-5.6-terra');
  assert.equal(result.modelPolicy.profiles[0].qualification, 'QUALIFIED');
  assert.equal(result.modelPolicy.profiles[0].defaultThinkingProfileId, 'provider-default');
  assert.equal(result.modelPolicy.profiles[0].thinkingProfiles[0].qualification, 'QUALIFIED');
  const write = env._debug.writes.find((item) => item.key === 'AI_MODEL_POLICY_JSON');
  assert.ok(write);
  assert.doesNotMatch(write.value, /vs-synthetic-existing|API_KEY|secret/i);
});

test('administrator can retain a historical model without auto-qualifying it or changing the current default', () => {
  const env = makeAdminEnvironment({
    enabled: true, storeId: 'vs-synthetic-existing', model: 'gpt-5.6-terra', readiness: 'ACTIVE'
  });
  assert.equal(mutateAdmin(env, { action: 'MIGRATE_MODEL_POLICY' }).ok, true);
  const result = plain(mutateAdmin(env, {
    action: 'SAVE_MODEL_PROFILE',
    profile: {
      profileId: 'openai-historical', provider: 'OPENAI', modelId: 'gpt-5.4',
      displayName: 'Historical', family: 'GPT-5.4', enabled: true, userVisible: true,
      isProviderDefault: false,
      thinkingProfiles: [{ thinkingProfileId: 'medium', label: 'Medium', rawValue: 'medium', enabled: true }],
      defaultThinkingProfileId: 'medium', maxOutputTokens: 1024
    }
  }));
  assert.equal(result.ok, true);
  const historical = result.modelPolicy.profiles.find((item) => item.profileId === 'openai-historical');
  assert.equal(historical.apiAccess, 'UNKNOWN');
  assert.equal(historical.qualification, 'UNQUALIFIED');
  assert.equal(historical.thinkingProfiles[0].qualification, 'UNQUALIFIED');
  assert.equal(historical.fileSearch, false);
  assert.equal(result.modelPolicy.profiles.find((item) => item.isProviderDefault).modelId, 'gpt-5.6-terra');
  assert.equal(env._debug.connectionQueries.length, 0);
});

test('bounded model qualification uses the existing OpenAI store and persists safe capability status', () => {
  const env = makeAdminEnvironment({
    enabled: true, storeId: 'vs-synthetic-existing', model: 'gpt-5.6-terra', readiness: 'ACTIVE'
  });
  const migrated = mutateAdmin(env, { action: 'MIGRATE_MODEL_POLICY' });
  const profileId = migrated.modelPolicy.profiles[0].profileId;
  const result = plain(mutateAdmin(env, {
    action: 'QUALIFY_MODEL_PROFILE', profileId
  }));
  assert.equal(result.ok, true);
  assert.equal(result.qualification.status, 'PASS');
  assert.equal(env._debug.connectionUploads.length, 1);
  assert.equal(env._debug.connectionQueries.length, 1);
  assert.equal(env._debug.connectionQueries[0].request.thinkingProviderDefault, true);
  assert.equal(env._debug.connectionQueries[0].request.thinkingRawValue, null);
  assert.equal(Object.hasOwn(env._debug.connectionQueries[0].request, 'maxOutputTokens'), false);
  assert.deepEqual(env._debug.connectionQueries[0].request.filters, {
    type: 'eq', key: 'source_id', value: 'KSP-OPENAI-CONNECTION-TEST'
  });
  assert.equal(env._debug.connectionDeletes.length, 1);
  const qualified = result.modelPolicy.profiles.find((item) => item.profileId === profileId);
  assert.equal(qualified.apiAccess, 'AVAILABLE');
  assert.equal(qualified.qualification, 'QUALIFIED');
  assert.equal(qualified.thinkingProfiles[0].qualification, 'QUALIFIED');
  assert.equal(qualified.fileSearch, true);
  assert.doesNotMatch(JSON.stringify(result), /vs-synthetic-existing|openai-connection-file/);
});

test('qualification sends each exact thinking tuple and output ceiling through one synthetic source', () => {
  const env = makeAdminEnvironment({
    enabled: true, storeId: 'vs-synthetic-existing', model: 'gpt-5.6-terra', readiness: 'ACTIVE'
  });
  mutateAdmin(env, { action: 'MIGRATE_MODEL_POLICY' });
  const saved = plain(mutateAdmin(env, {
    action: 'SAVE_MODEL_PROFILE', profile: {
      profileId: 'openai-historical', provider: 'OPENAI', modelId: 'gpt-5.4',
      displayName: 'Historical', family: 'GPT-5.4', enabled: true, userVisible: true,
      isProviderDefault: false,
      thinkingProfiles: [{ thinkingProfileId: 'medium', label: 'Medium', rawValue: 'medium', enabled: true }],
      defaultThinkingProfileId: 'medium', maxOutputTokens: 1024
    }
  }));
  assert.equal(saved.ok, true);
  const result = plain(mutateAdmin(env, {
    action: 'QUALIFY_MODEL_PROFILE', profileId: 'openai-historical'
  }));
  assert.equal(result.ok, true);
  assert.equal(result.qualification.status, 'PASS');
  assert.equal(env._debug.connectionUploads.length, 1);
  assert.equal(env._debug.connectionQueries.length, 1);
  assert.equal(env._debug.connectionDeletes.length, 1);
  const request = env._debug.connectionQueries[0].request;
  assert.equal(request.model, 'gpt-5.4');
  assert.equal(request.thinkingProviderDefault, false);
  assert.equal(request.thinkingRawValue, 'medium');
  assert.equal(request.maxOutputTokens, 1024);
  assert.deepEqual(request.include, ['file_search_call.results']);
  const qualified = result.modelPolicy.profiles.find((item) => item.profileId === 'openai-historical');
  assert.equal(qualified.thinkingProfiles[0].qualification, 'QUALIFIED');
});

test('partial thinking qualification keeps passing tuples and rejects the failed tuple server-side', () => {
  const env = makeAdminEnvironment({
    enabled: true, storeId: 'vs-synthetic-existing', model: 'gpt-5.6-terra', readiness: 'ACTIVE',
    connectionQueryErrorRawValue: 'high'
  });
  mutateAdmin(env, { action: 'MIGRATE_MODEL_POLICY' });
  const current = plain(ksp.kspGetAiProviderAdminData_(env)).modelPolicy.profiles[0];
  const saved = plain(mutateAdmin(env, {
    action: 'SAVE_MODEL_PROFILE', profile: {
      ...current,
      thinkingProfiles: [
        { thinkingProfileId: 'provider-default', label: 'Provider default', rawValue: null, providerDefault: true, enabled: true },
        { thinkingProfileId: 'high', label: 'High', rawValue: 'high', providerDefault: false, enabled: true }
      ],
      defaultThinkingProfileId: 'provider-default'
    }
  }));
  assert.equal(saved.ok, true);
  const result = plain(mutateAdmin(env, {
    action: 'QUALIFY_MODEL_PROFILE', profileId: current.profileId
  }));
  assert.equal(result.ok, true);
  assert.equal(result.qualification.status, 'PARTIAL');
  assert.equal(env._debug.connectionUploads.length, 1);
  assert.equal(env._debug.connectionQueries.length, 2);
  assert.equal(env._debug.connectionDeletes.length, 1);
  const qualified = result.modelPolicy.profiles.find((item) => item.profileId === current.profileId);
  assert.equal(qualified.qualification, 'QUALIFIED');
  assert.equal(qualified.thinkingProfiles.find((item) => item.thinkingProfileId === 'provider-default').qualification, 'QUALIFIED');
  assert.equal(qualified.thinkingProfiles.find((item) => item.thinkingProfileId === 'high').qualification, 'FAILED');
  const settings = ksp.kspNormalizeAiSettings_(env._debug.context.settings);
  const config = { provider: 'OPENAI', enabled: true, credentialConfigured: true,
    vectorStoreId: 'vs-synthetic-existing', modelId: 'gpt-5.6-terra' };
  const choices = plain(ksp.kspGetEffectiveAiModelChoices_(settings, 'OPENAI', config, ''));
  assert.deepEqual(choices.profiles[0].thinkingProfiles.map((item) => item.thinkingProfileId), ['provider-default']);
  assert.throws(() => ksp.kspResolveAiModelSelection_(settings, 'OPENAI', {
    modelProfileId: current.profileId, thinkingProfileId: 'high'
  }, config, ''), (error) => error.code === 'AI_THINKING_PROFILE_UNQUALIFIED');
});
