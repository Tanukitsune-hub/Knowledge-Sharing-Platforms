const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { ksp, plain, baseContext } = require('./ai-test-helpers.cjs');

const root = path.resolve(__dirname, '..');
const read = (...parts) => fs.readFileSync(path.join(root, ...parts), 'utf8');

function ownerOnlyEnvironment() {
  const context = baseContext();
  context.settings = {
    ...context.settings,
    OPENAI_ENABLED: 'false', OPENAI_VECTOR_STORE_ID: '', OPENAI_DEFAULT_MODEL: '', OPENAI_READINESS: '',
    GEMINI_ENABLED: 'false', GEMINI_FILE_SEARCH_STORE_NAME: '', GEMINI_DEFAULT_MODEL: '', GEMINI_READINESS: ''
  };
  const writes = [];
  return {
    nowIso() { return '2026-09-19T00:00:00.000Z'; },
    loadAiContext() { return context; },
    ensureAiSettings() {},
    isOpenAiCredentialConfigured() { return false; },
    isGeminiCredentialConfigured() { return false; },
    writeAiSetting(key, value) { writes.push({ key, value: String(value) }); context.settings[key] = String(value); },
    readSharedAdminCredential() { throw new Error('legacy credential must be inert'); },
    isAdministrator() { throw new Error('application administrator role must be inert'); },
    _debug: { context, writes }
  };
}

test('owner-only admin page has no shared password, lock, or browser session path', () => {
  const page = read('src', 'AiProviderSettingsPage.html');
  const client = read('src', 'ClientAiProviderSettings.html');
  const entrypoints = read('src', '170_AiEntryPoints.gs');
  for (const forbidden of [
    'shared-admin', '共有管理者パスワード', '管理者モードを開始', '管理者モードを終了',
    'adminSessionToken', 'KSP_SHARED_ADMIN_SESSION_STORAGE_KEY', 'sessionStorage'
  ]) assert.equal((page + client).includes(forbidden), false, forbidden);
  assert.doesNotMatch(entrypoints, /function manageAiProviderAdminSession\s*\(/);
  assert.match(client, /getAiProviderAdminData',\{\}/);
  assert.match(client, /const payload=\{action,sourceType:/);
});

test('owner-only admin read and mutation do not consult legacy password properties', () => {
  const env = ownerOnlyEnvironment();
  const status = plain(ksp.kspGetAiProviderAdminData_(env, {}));
  assert.equal(status.ok, true);
  assert.equal(status.canMutate, true);
  assert.equal(Object.hasOwn(status, 'adminAuth'), false);

  const result = plain(ksp.kspMutateAiProviderSettings_(env, { action: 'DISABLE_OPENAI' }));
  assert.equal(result.ok, true);
  assert.equal(result.action, 'DISABLE_OPENAI');
  assert.deepEqual(env._debug.writes.map(item => item.key), ['OPENAI_ENABLED', 'OPENAI_READINESS']);
});

test('obsolete shared-admin and email role code is absent from the AI settings path', () => {
  const server = read('src', '165_AiProviderAdmin.gs');
  const environment = read('src', '160_AiEnvironment.gs');
  const surface = read('scripts', 'public-surface.cjs');
  assert.doesNotMatch(server, /SHARED_ADMIN_|kspManageSharedAdminSession_|kspIsAiProviderAdministrator_|adminEmails|Session\.get(?:Active|Effective)User|AI_PROVIDER_ADMIN_UNAUTHORIZED/);
  assert.doesNotMatch(environment, /readSharedAdminCredential|writeSharedAdminCredential|withSharedAdminLock|sharedAdminHmac|sharedAdminRandom/);
  assert.doesNotMatch(surface, /'manageAiProviderAdminSession'/);
});
