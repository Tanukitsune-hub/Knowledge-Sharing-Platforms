const test = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
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
  const properties = options.propertyMap || new Map(Object.entries(options.properties || {}));
  const statuses = [];
  const mutations = [];
  let lockHeld = false;
  const environment = {
    nowIso: () => options.nowIso || '2026-09-03T00:00:00.000Z',
    acquireScriptLock: () => {
      if (lockHeld || options.lockUnavailable) {
        const error = new Error('lock unavailable');
        error.code = 'SETUP_LOCK_TIMEOUT';
        throw error;
      }
      lockHeld = true;
      return { held: true };
    },
    releaseScriptLock: () => { lockHeld = false; },
    getProperty: (key) => properties.get(key) || null,
    setProperty: (key, value) => {
      properties.set(key, String(value));
      mutations.push({ type: 'property-set', key });
    },
    deleteProperty: (key) => {
      properties.delete(key);
      mutations.push({ type: 'property-delete', key });
    },
    getBoundSpreadsheetContext: () => options.bound === false ? null : ({
      id: 'host-sheet', name: 'Work 0023 Qualification', parentIds: options.parentIds || ['isolated-parent']
    }),
    getSessionIdentities: () => ({
      active: options.active === undefined ? 'admin@example.com' : options.active,
      effective: options.effective === undefined ? 'admin@example.com' : options.effective
    }),
    getWebAppDeploymentIdentity: () => options.deploymentUrl || '',
    hashDeploymentIdentity: (value) => crypto.createHash('sha256').update(String(value)).digest('hex'),
    writeInstallationStatus: (status) => {
      statuses.push(JSON.parse(JSON.stringify(status)));
      mutations.push({ type: 'status-write' });
    },
    _debug: { properties, statuses, mutations }
  };
  return environment;
}

function installSetupStub(context, counters, options = {}) {
  context.kspRunSetup_ = (environment) => {
    counters.setup += 1;
    if (options.beforeSetup) options.beforeSetup(environment, counters);
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

function installedState(context, adminEmails = ['admin@example.com']) {
  return context.kspBuildStoredInstallationState_({
    environment: 'PROD', knowledgeParentFolderId: 'isolated-parent', controlFolderId: 'isolated-parent',
    adminEmails, timezone: 'Asia/Tokyo', aiSyncEnabled: false, aiSyncIntervalMinutes: 15
  }, { backendSpreadsheetId: 'backend' }, '2026-09-03T00:00:00.000Z');
}

function ownerLatch(ownerEmail = 'admin@example.com') {
  return JSON.stringify({ version: 1, ownerEmail });
}

const DEPLOYMENT_A = 'https://script.google.com/macros/s/qualification-a/exec';
const DEPLOYMENT_B = 'https://script.google.com/macros/s/qualification-b/exec';
const DEVELOPMENT_A = 'https://script.google.com/macros/s/qualification-a/dev';

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
    assert.deepEqual(environment._debug.mutations, []);
  }
});

test('first verified installer is latched before setup mutation and remains authoritative after failure', () => {
  const context = loadInstaller();
  const environment = createEnvironment();
  const counters = { setup: 0, resourceCreates: 0 };
  installSetupStub(context, counters, {
    failSetup: 1,
    errorCode: 'TEMPORARY_SETUP_FAILURE',
    beforeSetup: (env) => {
      assert.equal(JSON.parse(env._debug.properties.get('KSP_INSTALLER_OWNER_JSON')).ownerEmail, 'admin@example.com');
      assert.equal(JSON.parse(env._debug.properties.get('BOOTSTRAP_CONFIG_JSON')).adminEmails[0], 'admin@example.com');
    }
  });
  assert.equal(context.kspRunInstaller_(environment).state, 'FAILED');
  assert.equal(JSON.parse(environment._debug.properties.get('KSP_INSTALLER_OWNER_JSON')).ownerEmail, 'admin@example.com');
});

test('different user cannot take over an interrupted install or mutate property/resource/status state', () => {
  const context = loadInstaller();
  const sharedProperties = new Map();
  const firstEnvironment = createEnvironment({ propertyMap: sharedProperties });
  const firstCounters = { setup: 0, resourceCreates: 0 };
  installSetupStub(context, firstCounters, { failSetup: 1, errorCode: 'TEMPORARY_SETUP_FAILURE' });
  assert.equal(context.kspRunInstaller_(firstEnvironment).state, 'FAILED');

  const hostileEnvironment = createEnvironment({
    propertyMap: sharedProperties, active: 'other@example.com', effective: 'other@example.com'
  });
  const hostileCounters = { setup: 0, resourceCreates: 0 };
  installSetupStub(context, hostileCounters);
  const result = context.kspRunInstaller_(hostileEnvironment);
  assert.equal(result.state, 'ACTION_REQUIRED');
  assert.equal(result.error.code, 'INSTALLER_OWNER_MISMATCH');
  assert.equal(hostileCounters.setup, 0);
  assert.deepEqual(hostileEnvironment._debug.mutations, []);
  assert.equal(JSON.parse(sharedProperties.get('KSP_INSTALLER_OWNER_JSON')).ownerEmail, 'admin@example.com');
});

test('original installer resumes after partial failure without duplicate setup paths', () => {
  const context = loadInstaller();
  const environment = createEnvironment();
  const counters = { setup: 0, resourceCreates: 0 };
  installSetupStub(context, counters, { failSetup: 1, errorCode: 'TEMPORARY_SETUP_FAILURE' });
  assert.equal(context.kspRunInstaller_(environment).state, 'FAILED');
  assert.equal(context.kspRunInstaller_(environment).state, 'READY_FOR_DEPLOYMENT');
  assert.equal(counters.setup, 2);
  assert.equal(counters.resourceCreates, 6);
});

test('a sequential second claim cannot overwrite the first owner', () => {
  const context = loadInstaller();
  const properties = new Map();
  const first = createEnvironment({ propertyMap: properties });
  const counters = { setup: 0, resourceCreates: 0 };
  installSetupStub(context, counters, { failSetup: 1 });
  context.kspRunInstaller_(first);

  const second = createEnvironment({ propertyMap: properties, active: 'second@example.com', effective: 'second@example.com' });
  installSetupStub(context, { setup: 0, resourceCreates: 0 });
  assert.equal(context.kspRunInstaller_(second).error.code, 'INSTALLER_OWNER_MISMATCH');
  assert.equal(JSON.parse(properties.get('KSP_INSTALLER_OWNER_JSON')).ownerEmail, 'admin@example.com');
});

test('lock contention prevents a concurrent first claim from mutating state', () => {
  const context = loadInstaller();
  const environment = createEnvironment({ lockUnavailable: true });
  const counters = { setup: 0, resourceCreates: 0 };
  installSetupStub(context, counters);
  const result = context.kspRunInstaller_(environment);
  assert.equal(result.state, 'ACTION_REQUIRED');
  assert.equal(result.error.code, 'SETUP_LOCK_TIMEOUT');
  assert.equal(counters.setup, 0);
  assert.deepEqual(environment._debug.mutations, []);
});

test('malformed and conflicting owner bootstrap or completed config fail closed', () => {
  const cases = [
    {
      properties: { KSP_INSTALLER_OWNER_JSON: '{' },
      code: 'INSTALLER_OWNER_LATCH_INVALID'
    },
    {
      properties: {
        KSP_INSTALLER_OWNER_JSON: ownerLatch(),
        BOOTSTRAP_CONFIG_JSON: JSON.stringify({
          environment: 'PROD', knowledgeParentFolderId: 'isolated-parent', controlFolderId: 'isolated-parent',
          adminEmails: ['other@example.com'], timezone: 'Asia/Tokyo', aiSyncEnabled: false, aiSyncIntervalMinutes: 15
        })
      },
      code: 'INSTALLER_BOOTSTRAP_CONFLICT'
    }
  ];
  for (const item of cases) {
    const context = loadInstaller();
    const environment = createEnvironment({ properties: item.properties });
    const counters = { setup: 0, resourceCreates: 0 };
    installSetupStub(context, counters);
    const before = new Map(environment._debug.properties);
    const result = context.kspRunInstaller_(environment);
    assert.equal(result.error.code, item.code);
    assert.equal(counters.setup, 0);
    assert.deepEqual(environment._debug.properties, before);
    assert.deepEqual(environment._debug.mutations, []);
  }

  const context = loadInstaller();
  const environment = createEnvironment({ properties: {
    KSP_INSTALLER_OWNER_JSON: ownerLatch('former@example.com'),
    KSP_INSTALLATION_STATE_JSON: JSON.stringify(installedState(context))
  } });
  const counters = { setup: 0, resourceCreates: 0 };
  installSetupStub(context, counters);
  const result = context.kspRunInstaller_(environment);
  assert.equal(result.error.code, 'INSTALLER_OWNER_CONFIG_CONFLICT');
  assert.deepEqual(environment._debug.mutations, []);
});

test('completed pre-latch install migrates only for an authoritative administrator', () => {
  const context = loadInstaller();
  const state = installedState(context);
  const denied = createEnvironment({
    active: 'normal@example.com', effective: 'admin@example.com',
    properties: { KSP_INSTALLATION_STATE_JSON: JSON.stringify(state) }
  });
  const deniedCounters = { setup: 0, resourceCreates: 0 };
  installSetupStub(context, deniedCounters);
  assert.equal(context.kspRunInstaller_(denied).error.code, 'INSTALLER_ADMIN_REQUIRED');
  assert.deepEqual(denied._debug.mutations, []);

  const allowed = createEnvironment({ properties: { KSP_INSTALLATION_STATE_JSON: JSON.stringify(state) } });
  const allowedCounters = { setup: 0, resourceCreates: 0 };
  installSetupStub(context, allowedCounters);
  assert.equal(context.kspRunInstaller_(allowed).state, 'READY_FOR_DEPLOYMENT');
  assert.equal(JSON.parse(allowed._debug.properties.get('KSP_INSTALLER_OWNER_JSON')).ownerEmail, 'admin@example.com');

  const ambiguous = createEnvironment({ properties: {
    KSP_INSTALLATION_STATE_JSON: JSON.stringify(installedState(context, ['admin@example.com', 'other@example.com']))
  } });
  installSetupStub(context, { setup: 0, resourceCreates: 0 });
  assert.equal(context.kspRunInstaller_(ambiguous).error.code, 'INSTALLER_OWNER_MIGRATION_AMBIGUOUS');
  assert.deepEqual(ambiguous._debug.mutations, []);
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
  assert.deepEqual(Array.from(state.config.adminEmails), ['admin@example.com']);
  assert.equal(state.config.aiSyncEnabled, false);
});

test('deployment URL requires matching guarded administrator attestation before READY', () => {
  const context = loadInstaller();
  const environment = createEnvironment({ deploymentUrl: DEPLOYMENT_A });
  const counters = { setup: 0, resourceCreates: 0 };
  installSetupStub(context, counters);

  const beforeAttestation = context.kspRunInstaller_(environment);
  assert.equal(beforeAttestation.state, 'ACTION_REQUIRED');
  assert.equal(beforeAttestation.error.code, 'DEPLOYMENT_SECURITY_ATTESTATION_REQUIRED');
  assert.doesNotMatch(beforeAttestation.nextAction, /共有できます/);

  const confirmed = context.kspConfirmInstallerDeploymentSecurity_(environment);
  assert.equal(confirmed.state, 'READY');
  assert.match(confirmed.nextAction, /管理者.*確認済み/);
  const attestation = JSON.parse(environment._debug.properties.get('KSP_DEPLOYMENT_SECURITY_ATTESTATION_JSON'));
  assert.equal(attestation.deploymentIdentitySha256,
    crypto.createHash('sha256').update(DEPLOYMENT_A).digest('hex'));
  assert.equal(context.kspCheckInstallerReadiness_(environment).state, 'READY');
});

test('development-mode service URL is canonicalized to the matching versioned deployment identity', () => {
  const context = loadInstaller();
  const environment = createEnvironment({ deploymentUrl: DEVELOPMENT_A });
  installSetupStub(context, { setup: 0, resourceCreates: 0 });

  const beforeAttestation = context.kspRunInstaller_(environment);
  assert.equal(beforeAttestation.state, 'ACTION_REQUIRED');
  assert.equal(beforeAttestation.error.code, 'DEPLOYMENT_SECURITY_ATTESTATION_REQUIRED');

  assert.equal(context.kspConfirmInstallerDeploymentSecurity_(environment).state, 'READY');
  const attestation = JSON.parse(environment._debug.properties.get('KSP_DEPLOYMENT_SECURITY_ATTESTATION_JSON'));
  assert.equal(attestation.deploymentIdentitySha256,
    crypto.createHash('sha256').update(DEPLOYMENT_A).digest('hex'));
  assert.equal(context.kspCheckInstallerReadiness_(environment).state, 'READY');
});

test('changed deployment identity invalidates prior attestation', () => {
  const context = loadInstaller();
  const properties = new Map();
  const first = createEnvironment({ propertyMap: properties, deploymentUrl: DEPLOYMENT_A });
  const counters = { setup: 0, resourceCreates: 0 };
  installSetupStub(context, counters);
  context.kspRunInstaller_(first);
  assert.equal(context.kspConfirmInstallerDeploymentSecurity_(first).state, 'READY');

  const changed = createEnvironment({ propertyMap: properties, deploymentUrl: DEPLOYMENT_B });
  installSetupStub(context, { setup: 0, resourceCreates: 0 });
  const result = context.kspCheckInstallerReadiness_(changed);
  assert.equal(result.state, 'ACTION_REQUIRED');
  assert.equal(result.error.code, 'DEPLOYMENT_SECURITY_ATTESTATION_STALE');
  assert.doesNotMatch(result.nextAction, /共有できます/);
});

test('normal or unidentified user cannot attest or mutate attestation/status', () => {
  const context = loadInstaller();
  const baseProperties = {
    KSP_INSTALLER_OWNER_JSON: ownerLatch(),
    KSP_INSTALLATION_STATE_JSON: JSON.stringify(installedState(context))
  };
  for (const options of [
    { active: 'normal@example.com', effective: 'admin@example.com', code: 'INSTALLER_ADMIN_REQUIRED' },
    { active: '', effective: 'admin@example.com', code: 'INSTALLER_ACTIVE_USER_REQUIRED' }
  ]) {
    const environment = createEnvironment({ ...options, deploymentUrl: DEPLOYMENT_A, properties: baseProperties });
    const result = context.kspConfirmInstallerDeploymentSecurity_(environment);
    assert.equal(result.state, 'ACTION_REQUIRED');
    assert.equal(result.error.code, options.code);
    assert.equal(environment._debug.properties.has('KSP_DEPLOYMENT_SECURITY_ATTESTATION_JSON'), false);
    assert.deepEqual(environment._debug.mutations, []);
  }
});

test('missing deployment remains READY_FOR_DEPLOYMENT and malformed URL cannot be attested', () => {
  const context = loadInstaller();
  const environment = createEnvironment();
  const counters = { setup: 0, resourceCreates: 0 };
  installSetupStub(context, counters);
  assert.equal(context.kspRunInstaller_(environment).state, 'READY_FOR_DEPLOYMENT');

  const malformed = createEnvironment({
    deploymentUrl: 'https://example.com/macros/s/not-google/exec',
    properties: Object.fromEntries(environment._debug.properties)
  });
  assert.equal(context.kspConfirmInstallerDeploymentSecurity_(malformed).error.code,
    'WEB_APP_DEPLOYMENT_IDENTITY_INVALID');
  assert.equal(malformed._debug.properties.has('KSP_DEPLOYMENT_SECURITY_ATTESTATION_JSON'), false);

  for (const deploymentUrl of [
    'http://script.google.com/macros/s/qualification-a/dev',
    'https://script.google.com.evil.example/macros/s/qualification-a/dev',
    'https://script.google.com/macros/s/qualification-a/dev/extra',
    'https://script.google.com/macros/s/qualification-a/dev?unexpected=1'
  ]) {
    const invalid = createEnvironment({
      deploymentUrl,
      properties: Object.fromEntries(environment._debug.properties)
    });
    assert.equal(context.kspConfirmInstallerDeploymentSecurity_(invalid).error.code,
      'WEB_APP_DEPLOYMENT_IDENTITY_INVALID');
    assert.equal(invalid._debug.properties.has('KSP_DEPLOYMENT_SECURITY_ATTESTATION_JSON'), false);
  }
});

test('normal HTML never references guarded installer entrypoints', () => {
  const sourceDir = path.join(__dirname, '..', 'src');
  const html = fs.readdirSync(sourceDir).filter((name) => name.endsWith('.html'))
    .map((name) => fs.readFileSync(path.join(sourceDir, name), 'utf8')).join('\n');
  assert.doesNotMatch(html,
    /installKnowledgeShare|checkKnowledgeShareReadiness|confirmKnowledgeShareDeploymentSecurity/);
});
