const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

function loadInstaller() {
  const context = vm.createContext({ console });
  for (const file of ['00_Core.gs', '01_DistributionResources.gs', '15_Installer.gs']) {
    new vm.Script(fs.readFileSync(path.join(__dirname, '..', 'src', file), 'utf8'), { filename: file }).runInContext(context);
  }
  return context;
}

function createEnvironment(options = {}) {
  const properties = new Map(Object.entries(options.properties || {}));
  const statuses = [];
  return {
    getProperty: (key) => properties.get(key) || null,
    setProperty: (key, value) => properties.set(key, String(value)),
    deleteProperty: (key) => properties.delete(key),
    getBoundSpreadsheetContext: () => options.bound === false ? null : ({
      id: 'host-sheet', name: 'Work 0023 Qualification', parentIds: options.parentIds || ['isolated-parent']
    }),
    getSessionIdentities: () => ({
      active: options.active === undefined ? 'admin@example.com' : options.active,
      effective: options.effective === undefined ? 'admin@example.com' : options.effective
    }),
    hasWebAppDeployment: () => Boolean(options.deployed),
    writeInstallationStatus: (status) => statuses.push(JSON.parse(JSON.stringify(status))),
    _debug: { properties, statuses }
  };
}

function installSetupStub(context, counters, options = {}) {
  context.kspRunSetup_ = (environment) => {
    counters.setup += 1;
    if (options.failSetup && counters.setup <= options.failSetup) {
      return { ok: false, errors: [{ code: options.errorCode || 'DUPLICATE_RESOURCE_CANDIDATES' }] };
    }
    const prior = context.kspLoadInstallationState_(environment);
    const config = context.kspLoadEffectiveConfig_(environment, prior);
    if (!prior.config) counters.resourceCreates += 6;
    const resources = prior.config ? prior.resources : {
      knowledgeRootFolderId: 'r1', meetingRecordsFolderId: 'r2', pitchbooksFolderId: 'r3',
      knowledgeExportsFolderId: 'r4', backendSpreadsheetId: 'r5', auditSpreadsheetId: 'r6'
    };
    environment.setProperty(context.KSP_PROPERTY_KEYS.INSTALLATION_STATE_JSON,
      JSON.stringify(context.kspBuildStoredInstallationState_(config, resources, '2026-09-03T00:00:00.000Z')));
    environment.deleteProperty(context.KSP_PROPERTY_KEYS.BOOTSTRAP_CONFIG_JSON);
    return { ok: true, actions: [] };
  };
  context.kspRunValidation_ = () => ({ ok: true, errors: [] });
}

test('blank and ambiguous first-run identities fail before mutation', () => {
  for (const options of [
    { active: '', effective: 'admin@example.com', code: 'INSTALLER_ACTIVE_USER_REQUIRED' },
    { active: 'admin@example.com', effective: 'owner@example.com', code: 'INSTALLER_IDENTITY_AMBIGUOUS' }
  ]) {
    const context = loadInstaller();
    const environment = createEnvironment(options);
    const counters = { setup: 0, resourceCreates: 0 };
    installSetupStub(context, counters);
    const result = context.kspRunInstaller_(environment);
    assert.equal(result.state, 'ACTION_REQUIRED');
    assert.equal(result.error.code, options.code);
    assert.equal(counters.setup, 0);
    assert.equal(environment._debug.statuses.length, 0);
  }
});

test('normal caller cannot forge a later installer call or mutate status', () => {
  const context = loadInstaller();
  const installed = context.kspBuildStoredInstallationState_({
    environment: 'PROD', knowledgeParentFolderId: 'isolated-parent', controlFolderId: 'isolated-parent',
    adminEmails: ['admin@example.com'], timezone: 'Asia/Tokyo', aiSyncEnabled: false, aiSyncIntervalMinutes: 15
  }, { backendSpreadsheetId: 'backend' }, '2026-09-03T00:00:00.000Z');
  const environment = createEnvironment({
    active: 'normal@example.com', effective: 'admin@example.com',
    properties: { KSP_INSTALLATION_STATE_JSON: JSON.stringify(installed) }
  });
  const counters = { setup: 0, resourceCreates: 0 };
  installSetupStub(context, counters);
  const result = context.kspRunInstaller_(environment);
  assert.equal(result.error.code, 'INSTALLER_ADMIN_REQUIRED');
  assert.equal(counters.setup, 0);
  assert.equal(environment._debug.statuses.length, 0);
});

test('authorized first install uses safe defaults and reruns without duplicate resources', () => {
  const context = loadInstaller();
  const environment = createEnvironment();
  const counters = { setup: 0, resourceCreates: 0 };
  installSetupStub(context, counters);
  const first = context.kspRunInstaller_(environment);
  const second = context.kspRunInstaller_(environment);
  assert.equal(first.state, 'READY_FOR_DEPLOYMENT');
  assert.equal(second.state, 'READY_FOR_DEPLOYMENT');
  assert.equal(counters.setup, 2);
  assert.equal(counters.resourceCreates, 6);
  const state = JSON.parse(environment._debug.properties.get('KSP_INSTALLATION_STATE_JSON'));
  assert.equal(state.config.environment, 'PROD');
  assert.equal(state.config.knowledgeParentFolderId, 'isolated-parent');
  assert.equal(state.config.controlFolderId, 'isolated-parent');
  assert.deepEqual(Array.from(state.config.adminEmails), ['admin@example.com']);
  assert.equal(state.config.aiSyncEnabled, false);
});

test('interrupted first install resumes through the same bootstrap without duplicate setup paths', () => {
  const context = loadInstaller();
  const environment = createEnvironment();
  const counters = { setup: 0, resourceCreates: 0 };
  installSetupStub(context, counters, { failSetup: 1, errorCode: 'TEMPORARY_SETUP_FAILURE' });
  const first = context.kspRunInstaller_(environment);
  const second = context.kspRunInstaller_(environment);
  assert.equal(first.state, 'FAILED');
  assert.equal(second.state, 'READY_FOR_DEPLOYMENT');
  assert.equal(counters.setup, 2);
  assert.equal(counters.resourceCreates, 6);
});

test('deployment observation advances readiness without provider configuration', () => {
  const context = loadInstaller();
  const environment = createEnvironment({ deployed: true });
  const counters = { setup: 0, resourceCreates: 0 };
  installSetupStub(context, counters);
  assert.equal(context.kspRunInstaller_(environment).state, 'READY');
  assert.equal(context.kspCheckInstallerReadiness_(environment).state, 'READY');
});

test('normal HTML never references guarded installer entrypoints', () => {
  const sourceDir = path.join(__dirname, '..', 'src');
  const html = fs.readdirSync(sourceDir).filter((name) => name.endsWith('.html'))
    .map((name) => fs.readFileSync(path.join(sourceDir, name), 'utf8')).join('\n');
  assert.doesNotMatch(html, /installKnowledgeShare|checkKnowledgeShareReadiness/);
});
