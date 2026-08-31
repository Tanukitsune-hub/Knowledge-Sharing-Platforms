const { test, assert, fs, path, ksp, plain, baseContext } = require('./ai-test-helpers.cjs');

function makeAdminEnvironment(options = {}) {
  const context = baseContext();
  context.state = { config: { adminEmails: ['admin@example.com'] }, resources: {} };
  context.settings = {
    ...context.settings,
    OPENAI_ENABLED: options.enabled ? 'true' : 'false',
    OPENAI_VECTOR_STORE_ID: options.storeId || '',
    OPENAI_DEFAULT_MODEL: options.model === undefined ? '' : options.model,
    OPENAI_READINESS: options.readiness === undefined ? '' : options.readiness
  };
  const writes = [];
  const created = [];
  const read = [];
  const deleted = [];
  const syncCalls = [];
  const savedKeys = [];
  const connectionUploads = [];
  const connectionQueries = [];
  const connectionDeletes = [];
  let credentialConfigured = options.key !== false;
  let readErrorRemaining = options.readError ? (options.readErrorOnce ? 1 : Number.MAX_SAFE_INTEGER) : 0;
  let clock = 0;
  return {
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
    _debug: { context, writes, created, read, deleted, syncCalls, savedKeys, connectionUploads, connectionQueries, connectionDeletes }
  };
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

test('OpenAI key absence fails safely and leaves the provider disabled', () => {
  const env = makeAdminEnvironment({ key: false });
  const result = plain(ksp.kspMutateAiProviderSettings_(env, { action: 'ENABLE_OPENAI' }));
  assert.equal(result.ok, false);
  assert.equal(result.error.code, 'OPENAI_API_KEY_NOT_CONFIGURED');
  assert.equal(env._debug.context.settings.OPENAI_ENABLED, 'false');
  assert.equal(env._debug.created.length, 0);
  assert.equal(env._debug.writes.length, 0);
  assert.doesNotMatch(JSON.stringify(result), /vs-synthetic|KSP_OPENAI_API_KEY|secret/i);
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
  const result = plain(ksp.kspMutateAiProviderSettings_(env, {
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
  const first = plain(ksp.kspMutateAiProviderSettings_(env, { action: 'CONNECT_OPENAI' }));
  const second = plain(ksp.kspMutateAiProviderSettings_(env, { action: 'CONNECT_OPENAI' }));
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
    const result = plain(ksp.kspMutateAiProviderSettings_(env, { action: 'ENABLE_OPENAI' }));
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
  const result = plain(ksp.kspMutateAiProviderSettings_(env, { action: 'CONNECT_OPENAI' }));
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
  const result = plain(ksp.kspMutateAiProviderSettings_(env, {
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
  const result = plain(ksp.kspMutateAiProviderSettings_(env, {
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
    const connected = plain(ksp.kspMutateAiProviderSettings_(env, { action: 'CONNECT_OPENAI' }));
    assert.equal(connected.ok, true);
    const disabled = plain(ksp.kspMutateAiProviderSettings_(env, { action: 'DISABLE_OPENAI' }));
    assert.equal(disabled.ok, true);
    assert.equal(env._debug.context.settings.OPENAI_ENABLED, 'false');
    assert.equal(env._debug.context.settings.OPENAI_VECTOR_STORE_ID, 'vs-existing');
    assert.deepEqual(env._debug.deleted, []);
    const blocked = plain(ksp.kspMutateAiProviderSettings_(env, { action: 'SYNC' }));
    assert.equal(blocked.ok, false);
    assert.equal(blocked.error.code, 'OPENAI_NOT_READY_FOR_SYNC');
    const enabled = plain(ksp.kspMutateAiProviderSettings_(env, { action: 'CONNECT_OPENAI' }));
    assert.equal(enabled.ok, true);
    assert.deepEqual(env._debug.created, []);
    assert.equal(env._debug.context.settings.OPENAI_ENABLED, 'false');
    assert.equal(env._debug.context.settings.OPENAI_READINESS, 'READY_FOR_SYNC');
    const sync = plain(ksp.kspMutateAiProviderSettings_(env, { action: 'SYNC' }));
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
    const meeting = plain(ksp.kspMutateAiProviderSettings_(env, {
      action: 'SYNC', sourceType: '  Meeting  '
    }));
    const combined = plain(ksp.kspMutateAiProviderSettings_(env, {
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
    const result = plain(ksp.kspMutateAiProviderSettings_(env, {
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
    removed: 0,
    failed: 1,
    skippedClaims: 0,
    providers: { OPENAI: { enabled: true, usable: true, status: 'PARTIAL', selected: 2, indexed: 1, failed: 1 } },
    items: [{ provider: 'OPENAI', sourceType: 'Pitchbook', sourceId: 'DOC-PRIVATE', action: 'failed', code: 'OPENAI_INDEX_TIMEOUT' }],
    errors: []
  });
  try {
    const result = plain(ksp.kspMutateAiProviderSettings_(env, {
      action: 'SYNC', sourceType: 'Pitchbook'
    }));
    assert.equal(result.ok, true);
    assert.equal(result.sync.ok, false);
    assert.equal(result.sync.partial, true);
    assert.equal(result.sync.usable, true);
    assert.equal(result.sync.selected, 2);
    assert.equal(result.sync.indexed, 1);
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
    const result = plain(ksp.kspMutateAiProviderSettings_(env, { action: 'SYNC', sourceType: 'Meeting' }));
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
    const result = plain(ksp.kspMutateAiProviderSettings_(env, {
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
    const result = plain(ksp.kspMutateAiProviderSettings_(env, {
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

test('non-administrator cannot mutate provider settings and the status response contains no private identifiers', () => {
  const env = makeAdminEnvironment({ admin: false, storeId: 'vs-private', key: true });
  const status = plain(ksp.kspGetAiProviderAdminData_(env));
  assert.equal(status.ok, true);
  assert.equal(status.canMutate, false);
  assert.equal(status.openai.vectorStoreReady, true);
  assert.equal(status.openai.status, 'DISABLED');
  const result = plain(ksp.kspMutateAiProviderSettings_(env, { action: 'ENABLE_OPENAI' }));
  assert.equal(result.ok, false);
  assert.equal(result.error.code, 'AI_PROVIDER_ADMIN_UNAUTHORIZED');
  assert.equal(env._debug.writes.length, 0);
  assert.equal(env._debug.created.length, 0);
  assert.doesNotMatch(JSON.stringify(status) + JSON.stringify(result), /vs-private|KSP_OPENAI_API_KEY/);
  const sync = plain(ksp.kspMutateAiProviderSettings_(env, { action: 'SYNC', sourceType: 'Meeting' }));
  assert.equal(sync.ok, false);
  assert.equal(sync.error.code, 'AI_PROVIDER_ADMIN_UNAUTHORIZED');
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
  assert.match(client, /getAiProviderAdminData/);
  assert.match(client, /mutateAiProviderSettings/);
  assert.match(client, /sourceType:action==='SYNC'\?\(sourceType\|\|''\):''/);
  assert.match(client, /sourceId:action==='SYNC'\?\(sourceId\|\|''\):''/);
  assert.match(client, /OPENAI_INDEX_TIMEOUT/);
  assert.match(client, /sync\.selected/);
  assert.match(client, /sync\.failed/);
  assert.doesNotMatch(page + client, /KSP_OPENAI_API_KEY|OPENAI_VECTOR_STORE_ID|OPENAI_DEFAULT_MODEL|gpt-5\.6-terra/);
});

test('administrator migrates the accepted OpenAI default into a persisted qualified model policy', () => {
  const env = makeAdminEnvironment({
    enabled: true, storeId: 'vs-synthetic-existing', model: 'gpt-5.6-terra', readiness: 'ACTIVE'
  });
  const result = plain(ksp.kspMutateAiProviderSettings_(env, { action: 'MIGRATE_MODEL_POLICY' }));
  assert.equal(result.ok, true);
  assert.equal(result.workId, '0025');
  assert.equal(result.modelPolicy.schemaVersion, 1);
  assert.equal(result.modelPolicy.profiles.length, 1);
  assert.equal(result.modelPolicy.profiles[0].modelId, 'gpt-5.6-terra');
  assert.equal(result.modelPolicy.profiles[0].qualification, 'QUALIFIED');
  assert.equal(result.modelPolicy.profiles[0].defaultThinkingProfileId, 'provider-default');
  const write = env._debug.writes.find((item) => item.key === 'AI_MODEL_POLICY_JSON');
  assert.ok(write);
  assert.doesNotMatch(write.value, /vs-synthetic-existing|API_KEY|secret/i);
});

test('administrator can retain a historical model without auto-qualifying it or changing the current default', () => {
  const env = makeAdminEnvironment({
    enabled: true, storeId: 'vs-synthetic-existing', model: 'gpt-5.6-terra', readiness: 'ACTIVE'
  });
  assert.equal(ksp.kspMutateAiProviderSettings_(env, { action: 'MIGRATE_MODEL_POLICY' }).ok, true);
  const result = plain(ksp.kspMutateAiProviderSettings_(env, {
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
  assert.equal(historical.fileSearch, false);
  assert.equal(result.modelPolicy.profiles.find((item) => item.isProviderDefault).modelId, 'gpt-5.6-terra');
  assert.equal(env._debug.connectionQueries.length, 0);
});

test('bounded model qualification uses the existing OpenAI store and persists safe capability status', () => {
  const env = makeAdminEnvironment({
    enabled: true, storeId: 'vs-synthetic-existing', model: 'gpt-5.6-terra', readiness: 'ACTIVE'
  });
  const migrated = ksp.kspMutateAiProviderSettings_(env, { action: 'MIGRATE_MODEL_POLICY' });
  const profileId = migrated.modelPolicy.profiles[0].profileId;
  const result = plain(ksp.kspMutateAiProviderSettings_(env, {
    action: 'QUALIFY_MODEL_PROFILE', profileId
  }));
  assert.equal(result.ok, true);
  assert.equal(result.qualification.status, 'PASS');
  assert.equal(env._debug.connectionUploads.length, 1);
  assert.equal(env._debug.connectionQueries.length, 1);
  assert.equal(env._debug.connectionDeletes.length, 1);
  const qualified = result.modelPolicy.profiles.find((item) => item.profileId === profileId);
  assert.equal(qualified.apiAccess, 'AVAILABLE');
  assert.equal(qualified.qualification, 'QUALIFIED');
  assert.equal(qualified.fileSearch, true);
  assert.doesNotMatch(JSON.stringify(result), /vs-synthetic-existing|openai-connection-file/);
});
