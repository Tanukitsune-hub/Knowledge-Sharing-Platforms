const { test, assert, fs, path, ksp, plain, baseContext } = require('./ai-test-helpers.cjs');

function makeAdminEnvironment(options = {}) {
  const context = baseContext();
  context.state = { config: { adminEmails: ['admin@example.com'] }, resources: {} };
  context.settings = {
    ...context.settings,
    OPENAI_ENABLED: options.enabled ? 'true' : 'false',
    OPENAI_VECTOR_STORE_ID: options.storeId || '',
    OPENAI_DEFAULT_MODEL: options.model === undefined ? '' : options.model
  };
  const writes = [];
  const created = [];
  const read = [];
  const deleted = [];
  const syncCalls = [];
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
    isOpenAiCredentialConfigured() { return options.key !== false; },
    createOpenAiVectorStore(name) {
      if (options.createError) throw options.createError;
      created.push(name);
      return { id: options.createdStoreId || 'vs-synthetic-created', name };
    },
    getOpenAiVectorStore(id) {
      if (options.readError) throw options.readError;
      read.push(id);
      return { id };
    },
    writeAiSetting(key, value) {
      writes.push({ key, value });
      context.settings[key] = String(value);
    },
    deleteOpenAiVectorStore() { deleted.push(true); },
    _debug: { context, writes, created, read, deleted, syncCalls }
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

test('first OpenAI activation creates one store, sets only the blank model, validates, and reuses provider-neutral sync', () => {
  const env = makeAdminEnvironment();
  withSyncStub(() => {
    const result = plain(ksp.kspMutateAiProviderSettings_(env, { action: 'ENABLE_OPENAI' }));
    assert.equal(result.ok, true, JSON.stringify(result));
    assert.equal(result.enabled, true);
    assert.deepEqual(env._debug.created, ['Private Assets Knowledge - OpenAI']);
    assert.deepEqual(env._debug.read, ['vs-synthetic-created']);
    assert.equal(env._debug.syncCalls.length, 1);
    assert.equal(env._debug.syncCalls[0].force, true);
    assert.equal(env._debug.context.settings.OPENAI_DEFAULT_MODEL, 'gpt-5.6-terra');
    assert.equal(env._debug.context.settings.OPENAI_VECTOR_STORE_ID, 'vs-synthetic-created');
    assert.equal(env._debug.context.settings.OPENAI_ENABLED, 'true');
    assert.equal(env._debug.context.settings.AI_SYNC_ENABLED, 'true');
    assert.equal(JSON.stringify(result).includes('vs-synthetic-created'), false);
  });
});

test('repeated activation reuses the configured store and preserves an existing model', () => {
  const env = makeAdminEnvironment({ storeId: 'vs-existing', model: 'gpt-existing' });
  withSyncStub(() => {
    const first = plain(ksp.kspMutateAiProviderSettings_(env, { action: 'ENABLE_OPENAI' }));
    const second = plain(ksp.kspMutateAiProviderSettings_(env, { action: 'ENABLE_OPENAI' }));
    assert.equal(first.ok, true);
    assert.equal(second.ok, true);
    assert.deepEqual(env._debug.created, []);
    assert.deepEqual(env._debug.read, ['vs-existing', 'vs-existing']);
    assert.equal(env._debug.context.settings.OPENAI_DEFAULT_MODEL, 'gpt-existing');
    assert.equal(env._debug.writes.filter((item) => item.key === 'OPENAI_DEFAULT_MODEL').length, 0);
  });
});

test('store capability failure keeps OpenAI disabled and does not invoke Gemini fallback', () => {
  const env = makeAdminEnvironment({ readError: Object.assign(new Error('private response'), { code: 'OPENAI_HTTP_403' }) });
  const original = ksp.kspRunProviderNeutralAiSync_;
  let syncCalls = 0;
  ksp.kspRunProviderNeutralAiSync_ = () => { syncCalls += 1; throw new Error('must not run'); };
  try {
    const result = plain(ksp.kspMutateAiProviderSettings_(env, { action: 'ENABLE_OPENAI' }));
    assert.equal(result.ok, false);
    assert.equal(result.error.code, 'OPENAI_ACTIVATION_FAILED');
    assert.equal(env._debug.context.settings.OPENAI_ENABLED, 'false');
    assert.equal(syncCalls, 0);
    assert.doesNotMatch(JSON.stringify(result), /private response|vs-synthetic-created|GEMINI/);
  } finally {
    ksp.kspRunProviderNeutralAiSync_ = original;
  }
});

test('disable preserves the configured store, re-enable does not delete or recreate it, and sync is provider-neutral', () => {
  const env = makeAdminEnvironment({ storeId: 'vs-existing', enabled: true, model: 'gpt-existing' });
  withSyncStub(() => {
    const disabled = plain(ksp.kspMutateAiProviderSettings_(env, { action: 'DISABLE_OPENAI' }));
    assert.equal(disabled.ok, true);
    assert.equal(env._debug.context.settings.OPENAI_ENABLED, 'false');
    assert.equal(env._debug.context.settings.OPENAI_VECTOR_STORE_ID, 'vs-existing');
    assert.deepEqual(env._debug.deleted, []);
    const sync = plain(ksp.kspMutateAiProviderSettings_(env, { action: 'SYNC' }));
    assert.equal(sync.ok, true);
    assert.equal(env._debug.syncCalls.length, 1);
    assert.equal(env._debug.syncCalls[0].force, true);
    const enabled = plain(ksp.kspMutateAiProviderSettings_(env, { action: 'ENABLE_OPENAI' }));
    assert.equal(enabled.ok, true);
    assert.deepEqual(env._debug.created, []);
    assert.equal(env._debug.context.settings.OPENAI_ENABLED, 'true');
  });
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
});

test('admin provider surface is present while browser code never receives key, store ID, or model ID', () => {
  const root = path.resolve(__dirname, '..');
  const page = fs.readFileSync(path.join(root, 'src', 'AiProviderSettingsPage.html'), 'utf8');
  const client = fs.readFileSync(path.join(root, 'src', 'ClientAiProviderSettings.html'), 'utf8');
  assert.match(page, /ChatGPT \/ OpenAI/);
  assert.match(page, /OpenAIを有効化/);
  assert.match(page, /OpenAIを無効化/);
  assert.match(page, /今すぐ同期/);
  assert.match(client, /getAiProviderAdminData/);
  assert.match(client, /mutateAiProviderSettings/);
  assert.doesNotMatch(page + client, /KSP_OPENAI_API_KEY|OPENAI_VECTOR_STORE_ID|OPENAI_DEFAULT_MODEL|gpt-5\.6-terra/);
});
