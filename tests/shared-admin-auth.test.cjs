const { test, assert, fs, path, vm, ksp, plain, baseContext,
  syntheticAdminPassword, attachSharedAdminAuth } = require('./ai-test-helpers.cjs');

function makeEnvironment(options = {}) {
  const context = baseContext();
  context.state = { config: { adminEmails: ['legacy-admin@example.test'] }, resources: {} };
  context.settings = {
    ...context.settings,
    OPENAI_ENABLED: 'false', OPENAI_VECTOR_STORE_ID: '', OPENAI_DEFAULT_MODEL: '', OPENAI_READINESS: '',
    GEMINI_ENABLED: 'false', GEMINI_FILE_SEARCH_STORE_NAME: '', GEMINI_DEFAULT_MODEL: '', GEMINI_READINESS: ''
  };
  const writes = [];
  const env = {
    nowIso() { return env._debug.nowIso; },
    loadAiContext() { return context; },
    ensureAiSettings() {},
    isAdministrator() { return env._debug.legacyAdministrator; },
    isOpenAiCredentialConfigured() { return false; },
    isGeminiCredentialConfigured() { return false; },
    writeAiSetting(key, value) { writes.push({ key, value: String(value) }); context.settings[key] = String(value); },
    _debug: {
      context, writes,
      legacyAdministrator: options.legacyAdministrator !== false,
      activeEmail: options.activeEmail || 'legacy-admin@example.test',
      effectiveEmail: options.effectiveEmail || 'legacy-admin@example.test',
      nowIso: '2026-09-05T00:00:00.000Z'
    }
  };
  return attachSharedAdminAuth(env, { configured: false });
}

function bootstrap(environment, password) {
  return plain(ksp.kspManageSharedAdminSession_(environment, {
    action: 'BOOTSTRAP', password, passwordConfirmation: password
  }));
}

function unlock(environment, password) {
  return plain(ksp.kspManageSharedAdminSession_(environment, { action: 'UNLOCK', password }));
}

function disableOpenAi(environment, token) {
  return plain(ksp.kspMutateAiProviderSettings_(environment, {
    action: 'DISABLE_OPENAI', adminSessionToken: token
  }));
}

test('only a legacy administrator can bootstrap and persisted state never contains plaintext', () => {
  const password = syntheticAdminPassword(11);
  const denied = makeEnvironment({ legacyAdministrator: false });
  const deniedResult = bootstrap(denied, password);
  assert.equal(deniedResult.ok, false);
  assert.equal(deniedResult.error.code, 'SHARED_ADMIN_BOOTSTRAP_UNAUTHORIZED');
  assert.deepEqual(denied._debug.readSharedAdminCredential(), {});

  const env = makeEnvironment();
  const result = bootstrap(env, password);
  assert.equal(result.ok, true);
  assert.equal(result.workId, '0028');
  assert.equal(result.adminAuth.unlocked, true);
  const persisted = env._debug.readSharedAdminCredential();
  assert.deepEqual(Object.keys(persisted).sort(), ['generation', 'salt', 'signingSecret', 'verifier']);
  assert.equal(persisted.generation, '1');
  assert.equal(JSON.stringify(persisted).includes(password), false);
  assert.equal(JSON.stringify(result).includes(password), false);
  for (const forbidden of ['salt', 'verifier', 'signingSecret', 'generation']) {
    assert.equal(Object.hasOwn(result, forbidden), false);
  }
  const repeated = bootstrap(env, password);
  assert.equal(repeated.ok, false);
  assert.equal(repeated.error.code, 'SHARED_ADMIN_ALREADY_CONFIGURED');
});

test('wrong password fails safely while correct password returns a timeless identity-free signed token', () => {
  const env = makeEnvironment();
  const password = syntheticAdminPassword(12);
  bootstrap(env, password);
  const wrong = unlock(env, syntheticAdminPassword(13));
  assert.equal(wrong.ok, false);
  assert.equal(wrong.error.code, 'SHARED_ADMIN_UNLOCK_FAILED');
  assert.doesNotMatch(JSON.stringify(wrong), /legacy-admin|verifier|signingSecret|SESSION_NONCE/i);

  const correct = unlock(env, password);
  assert.equal(correct.ok, true);
  assert.equal(correct.adminSessionToken.split('.').length, 4);
  assert.doesNotMatch(correct.adminSessionToken, /@|legacy|admin|exp|2026|T00/i);
  assert.equal(ksp.kspSharedAdminValidateToken_(env, correct.adminSessionToken), true);
  env._debug.nowIso = '2099-12-31T23:59:59.999Z';
  assert.equal(ksp.kspSharedAdminValidateToken_(env, correct.adminSessionToken), true);
});

test('a valid shared token authorizes independently of Google identity and account alone never authorizes', () => {
  const env = makeEnvironment();
  const result = bootstrap(env, syntheticAdminPassword(14));
  env._debug.legacyAdministrator = false;
  env._debug.activeEmail = 'different-user@example.test';
  env._debug.effectiveEmail = 'different-owner@example.test';
  const authorized = disableOpenAi(env, result.adminSessionToken);
  assert.equal(authorized.ok, true);
  assert.equal(authorized.action, 'DISABLE_OPENAI');
  assert.equal(env._debug.writes.length, 2);

  const allowlistedWithoutToken = makeEnvironment({ legacyAdministrator: true });
  bootstrap(allowlistedWithoutToken, syntheticAdminPassword(15));
  const denied = disableOpenAi(allowlistedWithoutToken, '');
  assert.equal(denied.ok, false);
  assert.equal(denied.error.code, 'SHARED_ADMIN_SESSION_INVALID');
  assert.equal(allowlistedWithoutToken._debug.writes.length, 0);
});

test('missing, malformed, tampered and old-generation tokens fail closed', () => {
  const env = makeEnvironment();
  const password = syntheticAdminPassword(16);
  const first = bootstrap(env, password);
  const last = first.adminSessionToken.slice(-1);
  const tampered = first.adminSessionToken.slice(0, -1) + (last === 'A' ? 'B' : 'A');
  for (const token of ['', 'not-a-token', tampered]) {
    const result = disableOpenAi(env, token);
    assert.equal(result.ok, false);
    assert.equal(result.error.code, 'SHARED_ADMIN_SESSION_INVALID');
  }

  const nextPassword = syntheticAdminPassword(17);
  const changed = plain(ksp.kspManageSharedAdminSession_(env, {
    action: 'CHANGE_PASSWORD', adminSessionToken: first.adminSessionToken,
    newPassword: nextPassword, newPasswordConfirmation: nextPassword
  }));
  assert.equal(changed.ok, true);
  assert.equal(disableOpenAi(env, first.adminSessionToken).error.code, 'SHARED_ADMIN_SESSION_INVALID');
  assert.equal(unlock(env, password).error.code, 'SHARED_ADMIN_UNLOCK_FAILED');
  assert.equal(unlock(env, nextPassword).ok, true);
  assert.equal(disableOpenAi(env, changed.adminSessionToken).ok, true);
  assert.equal(JSON.stringify(env._debug.readSharedAdminCredential()).includes(nextPassword), false);
});

test('partial or malformed persisted credential state fails closed without provider mutation', () => {
  for (const credential of [
    { salt: 'A'.repeat(43) },
    { salt: 'A'.repeat(43), verifier: 'B'.repeat(43), signingSecret: 'C'.repeat(43), generation: '0' },
    { salt: 'A'.repeat(43), verifier: 'B'.repeat(43), signingSecret: 'C'.repeat(43), generation: 'not-a-number' }
  ]) {
    const env = attachSharedAdminAuth(makeEnvironment(), { configured: false, credential });
    const read = plain(ksp.kspGetAiProviderAdminData_(env, {}));
    assert.equal(read.ok, false);
    assert.equal(read.error.code, 'SHARED_ADMIN_CREDENTIAL_INVALID');
    const mutation = disableOpenAi(env, 'not-a-token');
    assert.equal(mutation.ok, false);
    assert.equal(mutation.error.code, 'SHARED_ADMIN_CREDENTIAL_INVALID');
    assert.equal(env._debug.writes.length, 0);
  }
});

test('read-only provider state remains available while locked and reveals no shared credential material', () => {
  const env = makeEnvironment();
  const password = syntheticAdminPassword(18);
  const token = bootstrap(env, password).adminSessionToken;
  const locked = plain(ksp.kspGetAiProviderAdminData_(env, {}));
  assert.equal(locked.ok, true);
  assert.equal(locked.canMutate, false);
  assert.deepEqual(locked.adminAuth, {
    credentialConfigured: true, canBootstrap: false, unlocked: false
  });
  assert.equal(locked.openai.keyConfigured, false);
  const unlocked = plain(ksp.kspGetAiProviderAdminData_(env, { adminSessionToken: token }));
  assert.equal(unlocked.canMutate, true);
  assert.equal(unlocked.adminAuth.unlocked, true);
  const combined = JSON.stringify({ locked, unlocked });
  assert.doesNotMatch(combined, /PASSWORD_SALT|PASSWORD_VERIFIER|TOKEN_SIGNING_SECRET|legacy-admin@example|example\.test/i);
  assert.equal(combined.includes(password), false);
  assert.equal(combined.includes(token), false);
});

function makeClientRuntime(storage) {
  const nodes = new Map();
  function makeNode(id = '') {
    return {
      id, value: '', disabled: false, hidden: false, checked: false, textContent: '', innerHTML: '',
      children: [], listeners: {},
      appendChild(child) { this.children.push(child); },
      addEventListener(name, callback) { this.listeners[name] = callback; }
    };
  }
  const calls = [];
  const context = vm.createContext({
    console, JSON, Object, Array, String, Number, Boolean, Date, Math, RegExp, Error, TypeError,
    Map, Set, Promise,
    sessionStorage: {
      getItem(key) { return storage.has(key) ? storage.get(key) : null; },
      setItem(key, value) { storage.set(key, String(value)); },
      removeItem(key) { storage.delete(key); }
    },
    document: {
      getElementById(id) { if (!nodes.has(id)) nodes.set(id, makeNode(id)); return nodes.get(id); },
      createElement() { return makeNode(); }
    },
    clearStatus() {}, showStatus() {},
    async serverCall(name, payload) {
      calls.push({ name, payload: plain(payload || {}) });
      const unlocked = Boolean(payload && payload.adminSessionToken);
      return {
        ok: true, canMutate: unlocked,
        adminAuth: { credentialConfigured: true, canBootstrap: false, unlocked },
        openai: {}, gemini: {}, modelPolicy: { profiles: [] }
      };
    }
  });
  const source = fs.readFileSync(path.resolve(__dirname, '..', 'src', 'ClientAiProviderSettings.html'), 'utf8');
  const match = source.match(/<script>([\s\S]*?)<\/script>/);
  assert.ok(match);
  new vm.Script(match[1] + '\nthis.__sharedAdminClient={load:loadAiProviderAdminData,logout:logoutSharedAdminSession,store:aiProviderAdminStoreSessionToken,token:aiProviderAdminSessionToken};',
    { filename: 'ClientAiProviderSettings.js' }).runInContext(context);
  return { context, nodes, calls };
}

test('client restores only the opaque sessionStorage token, revalidates it, and logout clears it', async () => {
  const storage = new Map();
  const firstRuntime = makeClientRuntime(storage);
  vm.runInContext("__sharedAdminClient.store('opaque-synthetic-token')", firstRuntime.context);
  assert.equal(storage.size, 1);

  const reloaded = makeClientRuntime(storage);
  await vm.runInContext('__sharedAdminClient.load(false)', reloaded.context);
  assert.equal(reloaded.calls[0].name, 'getAiProviderAdminData');
  assert.equal(reloaded.calls[0].payload.adminSessionToken, 'opaque-synthetic-token');
  assert.equal(reloaded.nodes.get('ai-provider-openai-enable').disabled, false);

  await vm.runInContext('__sharedAdminClient.logout()', reloaded.context);
  assert.equal(storage.size, 0);
  assert.equal(reloaded.calls.at(-1).payload.adminSessionToken, '');
  assert.equal(reloaded.nodes.get('ai-provider-openai-enable').disabled, true);
});

test('client source uses sessionStorage only, clears password inputs and sends tokens on every mutation path', () => {
  const root = path.resolve(__dirname, '..');
  const page = fs.readFileSync(path.join(root, 'src', 'AiProviderSettingsPage.html'), 'utf8');
  const client = fs.readFileSync(path.join(root, 'src', 'ClientAiProviderSettings.html'), 'utf8');
  assert.match(page, /shared-admin-bootstrap-password/);
  assert.match(page, /shared-admin-change-password/);
  assert.match(page, /管理者モードを終了/);
  assert.match(client, /sessionStorage\.getItem/);
  assert.match(client, /sessionStorage\.setItem/);
  assert.match(client, /sessionStorage\.removeItem/);
  assert.match(client, /getAiProviderAdminData',\{adminSessionToken:aiProviderAdminSessionToken\(\)\}/);
  assert.match(client, /adminSessionToken:aiProviderAdminSessionToken\(\)/);
  assert.match(client, /aiProviderAdminClearPasswordInputs\(\)/);
  assert.doesNotMatch(client, /localStorage|expiresAt|expiry|setInterval/);
  assert.doesNotMatch(page + client, /KSP_SHARED_ADMIN_PASSWORD_SALT|KSP_SHARED_ADMIN_PASSWORD_VERIFIER|KSP_SHARED_ADMIN_TOKEN_SIGNING_SECRET/);
});
