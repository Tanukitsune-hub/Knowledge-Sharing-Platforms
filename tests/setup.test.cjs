const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

function loadAppsScript(rootDir) {
  const sourceDir = path.join(rootDir, 'src');
  const context = vm.createContext({
    console,
    JSON,
    Object,
    Array,
    String,
    Number,
    Boolean,
    Date,
    Math,
    RegExp,
    Error,
    TypeError,
    Set,
    Map
  });

  const files = fs.readdirSync(sourceDir)
    .filter((file) => file.endsWith('.gs'))
    .sort();

  for (const file of files) {
    const code = fs.readFileSync(path.join(sourceDir, file), 'utf8');
    const script = new vm.Script(code, { filename: file });
    script.runInContext(context);
  }

  return context;
}

function createFakeEnvironment(options = {}) {
  let idCounter = 1;
  let nowCounter = 0;
  const properties = new Map(Object.entries(options.properties || {}));
  const resources = new Map();
  const children = new Map();
  const spreadsheets = new Map();
  const triggers = (options.triggers || []).map((trigger) => ({ ...trigger }));

  function childKey(parentId, name, mimeType) {
    return `${parentId}::${name}::${mimeType}`;
  }

  function addResource(resource) {
    resources.set(resource.id, { ...resource });
    const key = childKey(resource.parents[0], resource.name, resource.mimeType);
    const list = children.get(key) || [];
    list.push(resource.id);
    children.set(key, list);
    if (resource.mimeType === 'application/vnd.google-apps.spreadsheet') {
      spreadsheets.set(resource.id, { sheets: new Map() });
    }
  }

  for (const resource of options.resources || []) {
    addResource(resource);
  }

  const environment = {
    nowIso() {
      nowCounter += 1;
      return `2026-08-16T00:00:${String(nowCounter).padStart(2, '0')}.000Z`;
    },
    acquireScriptLock() {
      return { acquired: true };
    },
    releaseScriptLock() {},
    getProperty(key) {
      return properties.has(key) ? properties.get(key) : null;
    },
    setProperty(key, value) {
      properties.set(key, String(value));
    },
    deleteProperty(key) {
      properties.delete(key);
    },
    getResource(id) {
      return resources.has(id) ? { ...resources.get(id) } : null;
    },
    findChildren(parentId, name, mimeType) {
      const ids = children.get(childKey(parentId, name, mimeType)) || [];
      return ids.map((id) => ({ ...resources.get(id) }));
    },
    createFolder(parentId, name) {
      const resource = {
        id: `folder-${idCounter++}`,
        name,
        mimeType: 'application/vnd.google-apps.folder',
        parents: [parentId]
      };
      addResource(resource);
      return { ...resource };
    },
    createSpreadsheet(parentId, name) {
      const resource = {
        id: `sheet-${idCounter++}`,
        name,
        mimeType: 'application/vnd.google-apps.spreadsheet',
        parents: [parentId]
      };
      addResource(resource);
      return { ...resource };
    },
    ensureSheet(spreadsheetId, sheetName, expectedHeaders) {
      const spreadsheet = spreadsheets.get(spreadsheetId);
      if (!spreadsheet) throw new Error(`Spreadsheet not found: ${spreadsheetId}`);
      const existing = spreadsheet.sheets.get(sheetName);
      if (!existing) {
        spreadsheet.sheets.set(sheetName, { headers: [...expectedHeaders], rows: [] });
        return { action: 'created', addedHeaders: [...expectedHeaders], columnCount: expectedHeaders.length };
      }
      const missing = expectedHeaders.filter((header) => !existing.headers.includes(header));
      if (missing.length) {
        existing.headers.push(...missing);
        return { action: 'migrated', addedHeaders: missing, columnCount: existing.headers.length };
      }
      return { action: 'reused', addedHeaders: [], columnCount: existing.headers.length };
    },
    insertMissingRows(spreadsheetId, sheetName, keyColumn, rows) {
      const sheet = spreadsheets.get(spreadsheetId).sheets.get(sheetName);
      const keys = new Set(sheet.rows.map((row) => String(row[keyColumn])));
      const missing = rows.filter((row) => !keys.has(String(row[keyColumn])));
      sheet.rows.push(...missing.map((row) => ({ ...row })));
      return { inserted: missing.length, skipped: rows.length - missing.length };
    },
    upsertRows(spreadsheetId, sheetName, keyColumn, rows, options = {}) {
      const sheet = spreadsheets.get(spreadsheetId).sheets.get(sheetName);
      let inserted = 0;
      let updated = 0;
      let preserved = 0;
      const preserveExistingKeys = new Set((options.preserveExistingKeys || []).map(String));
      for (const row of rows) {
        const index = sheet.rows.findIndex((existing) => String(existing[keyColumn]) === String(row[keyColumn]));
        if (index >= 0 && preserveExistingKeys.has(String(row[keyColumn]))) {
          preserved += 1;
        } else if (index >= 0) {
          sheet.rows[index] = { ...row };
          updated += 1;
        } else {
          sheet.rows.push({ ...row });
          inserted += 1;
        }
      }
      return { inserted, updated, preserved };
    },
    listTriggers() {
      return triggers.map((trigger) => ({ ...trigger }));
    },
    createClockTrigger(handler, intervalMinutes) {
      const trigger = {
        id: `trigger-${idCounter++}`,
        handler,
        eventType: 'CLOCK',
        intervalMinutes
      };
      triggers.push(trigger);
      return { ...trigger };
    },
    getSheetHeaders(spreadsheetId, sheetName) {
      return [...spreadsheets.get(spreadsheetId).sheets.get(sheetName).headers];
    },
    getColumnValues(spreadsheetId, sheetName, columnName) {
      return spreadsheets.get(spreadsheetId).sheets.get(sheetName).rows
        .map((row) => String(row[columnName] ?? ''))
        .filter(Boolean);
    },
    _debug: {
      properties,
      resources,
      spreadsheets,
      triggers,
      addResource
    }
  };

  return environment;
}

const root = path.resolve(__dirname, '..');
const ksp = loadAppsScript(root);

test('normalizes a valid bootstrap config', () => {
  const config = ksp.kspNormalizeAndValidateConfig({
    environment: 'dev',
    knowledgeParentFolderId: ' knowledge-parent ',
    controlFolderId: ' control ',
    adminEmails: ['ADMIN@example.com', 'admin@example.com', ''],
    timezone: 'Asia/Tokyo',
    aiSyncEnabled: 'false'
  });

  assert.equal(config.environment, 'DEV');
  assert.equal(config.knowledgeParentFolderId, 'knowledge-parent');
  assert.equal(config.controlFolderId, 'control');
  assert.deepEqual(Array.from(config.adminEmails), ['admin@example.com']);
  assert.equal(config.aiSyncEnabled, false);
  assert.equal(config.aiSyncIntervalMinutes, 15);
});

test('rejects a shared source/control folder boundary', () => {
  assert.throws(() => ksp.kspNormalizeAndValidateConfig({
    environment: 'DEV',
    knowledgeParentFolderId: 'same',
    controlFolderId: 'same'
  }), /must be different/);
});

test('returns a safe bootstrap template without credentials', () => {
  const template = ksp.kspGetBootstrapConfigTemplate();
  assert.equal(template.aiSyncEnabled, false);
  assert.equal(Object.hasOwn(template, 'credential'), false);
  assert.equal(Object.hasOwn(template, 'apiKey'), false);
});

test('defines exactly five baseline backend sheets', () => {
  const schemas = ksp.kspGetBackendSchemas();
  assert.deepEqual(Object.keys(schemas).sort(), [
    'GP_Master', 'Meeting_Index', 'Option_Master', 'Pitchbook_Index', 'Settings'
  ]);
  assert.ok(schemas.Meeting_Index.includes('AI_Index_Status'));
  assert.ok(schemas.Pitchbook_Index.includes('Original_Filename'));
});

test('defines a separate audit log schema', () => {
  const audit = ksp.kspGetAuditSchema();
  assert.deepEqual(Object.keys(audit), ['Audit_Log']);
  assert.ok(audit.Audit_Log.includes('Actor'));
  assert.ok(audit.Audit_Log.includes('Search_Mode'));
  assert.ok(audit.Audit_Log.includes('Cited_Source_IDs'));
});

test('master seed IDs are stable and unique', () => {
  const gpIds = ksp.kspGetGpSeedDefinitions().map((seed) => seed[0]);
  const optionIds = ksp.kspGetOptionSeedDefinitions().map((seed) => seed[0]);
  assert.equal(new Set(gpIds).size, gpIds.length);
  assert.equal(new Set(optionIds).size, optionIds.length);
  assert.ok(gpIds.includes('GP-000019'));
  assert.ok(optionIds.includes('OPT-AC-003'));
});

test('normalizes future generated filename segments predictably', () => {
  assert.equal(ksp.kspNormalizeGeneratedNameSegment('  KKR / Infra & Debt  '), 'KKR_Infra_Debt');
  assert.equal(ksp.kspNormalizeGeneratedNameSegment('A\\B'), 'AB');
  assert.equal(ksp.kspNormalizeGeneratedNameSegment(null), '');
});

test('escapes Drive query literals', () => {
  assert.equal(ksp.kspEscapeDriveQueryLiteral("O'Reilly\\Fund"), "O\\'Reilly\\\\Fund");
});

test('forward migration appends missing columns and preserves existing columns', () => {
  const env = createFakeEnvironment();
  const backend = env.createSpreadsheet('control', 'Knowledge Platform Backend');
  env.ensureSheet(backend.id, 'Settings', ['Key', 'Value']);

  const result = env.ensureSheet(backend.id, 'Settings', ksp.kspGetBackendSchemas().Settings);
  assert.equal(result.action, 'migrated');
  assert.deepEqual(Array.from(result.addedHeaders), ['Description', 'Updated_At']);
  assert.deepEqual(env.getSheetHeaders(backend.id, 'Settings'), ['Key', 'Value', 'Description', 'Updated_At']);
});

const GP_HEADERS = ['GP_ID', 'GP_Name', 'Status'];

test('seed insertion does not overwrite mutable existing master values', () => {
  const env = createFakeEnvironment();
  const backend = env.createSpreadsheet('control', 'Backend');
  env.ensureSheet(backend.id, 'GP_Master', GP_HEADERS);
  env.insertMissingRows(backend.id, 'GP_Master', 'GP_ID', [
    { GP_ID: 'GP-000001', GP_Name: 'User Renamed GP', Status: 'Inactive' }
  ]);

  const result = env.insertMissingRows(backend.id, 'GP_Master', 'GP_ID', [
    { GP_ID: 'GP-000001', GP_Name: 'Advent International', Status: 'Active' },
    { GP_ID: 'GP-000002', GP_Name: 'Apollo', Status: 'Active' }
  ]);

  assert.deepEqual(result, { inserted: 1, skipped: 1 });
  const rows = env._debug.spreadsheets.get(backend.id).sheets.get('GP_Master').rows;
  assert.equal(rows.find((row) => row.GP_ID === 'GP-000001').GP_Name, 'User Renamed GP');
  assert.equal(rows.find((row) => row.GP_ID === 'GP-000001').Status, 'Inactive');
});

function bootstrap() {
  return JSON.stringify({
    environment: 'DEV',
    knowledgeParentFolderId: 'knowledge-parent',
    controlFolderId: 'control-folder',
    adminEmails: ['admin@example.com'],
    timezone: 'Asia/Tokyo',
    aiSyncEnabled: false
  });
}

test('first setup creates resources, schemas, seeds, settings, and state', () => {
  const env = createFakeEnvironment({
    properties: { BOOTSTRAP_CONFIG_JSON: bootstrap() }
  });

  const report = ksp.kspRunSetup(env);
  assert.equal(report.ok, true, JSON.stringify(report.errors));
  assert.equal(report.mode, 'SETUP');
  assert.equal(Object.keys(report.resources).length, 5);
  assert.ok(report.actions.some((action) => action.resource === 'knowledgeRootFolderId' && action.action === 'created'));
  assert.equal(env._debug.properties.has('BOOTSTRAP_CONFIG_JSON'), false);
  assert.equal(env._debug.properties.has('KSP_INSTALLATION_STATE_JSON'), true);

  const state = JSON.parse(env._debug.properties.get('KSP_INSTALLATION_STATE_JSON'));
  const backend = env._debug.spreadsheets.get(state.resources.backendSpreadsheetId);
  const audit = env._debug.spreadsheets.get(state.resources.auditSpreadsheetId);
  assert.equal(backend.sheets.size, 5);
  assert.equal(audit.sheets.size, 1);
  assert.equal(backend.sheets.get('GP_Master').rows.length, 30);
  assert.equal(backend.sheets.get('Option_Master').rows.length, 14);
  assert.equal(backend.sheets.get('Settings').rows.find((row) => row.Key === 'AUDIT_LOG_SPREADSHEET_ID').Value, state.resources.auditSpreadsheetId);
});

test('second setup reuses all resources and does not duplicate seeds', () => {
  const env = createFakeEnvironment({
    properties: { BOOTSTRAP_CONFIG_JSON: bootstrap() }
  });

  const first = ksp.kspRunSetup(env);
  assert.equal(first.ok, true);
  const second = ksp.kspRunSetup(env);
  assert.equal(second.ok, true, JSON.stringify(second.errors));
  assert.equal(second.actions.filter((action) => action.category === 'resource' && action.action === 'reused').length, 5);

  const state = JSON.parse(env._debug.properties.get('KSP_INSTALLATION_STATE_JSON'));
  const backend = env._debug.spreadsheets.get(state.resources.backendSpreadsheetId);
  assert.equal(backend.sheets.get('GP_Master').rows.length, 30);
  assert.equal(backend.sheets.get('Option_Master').rows.length, 14);
});

test('multiple exact-name candidates fail explicitly', () => {
  const folderMime = 'application/vnd.google-apps.folder';
  const env = createFakeEnvironment({
    properties: { BOOTSTRAP_CONFIG_JSON: bootstrap() },
    resources: [
      { id: 'dup-1', name: 'Private Assets Knowledge', mimeType: folderMime, parents: ['knowledge-parent'] },
      { id: 'dup-2', name: 'Private Assets Knowledge', mimeType: folderMime, parents: ['knowledge-parent'] }
    ]
  });

  const report = ksp.kspRunSetup(env);
  assert.equal(report.ok, false);
  assert.equal(report.errors[0].code, 'DUPLICATE_RESOURCE_CANDIDATES');
});

test('second setup preserves operational counters and future AI configuration', () => {
  const env = createFakeEnvironment({ properties: { BOOTSTRAP_CONFIG_JSON: bootstrap() } });
  const first = ksp.kspRunSetup(env);
  assert.equal(first.ok, true);
  const state = JSON.parse(env._debug.properties.get('KSP_INSTALLATION_STATE_JSON'));
  const settings = env._debug.spreadsheets.get(state.resources.backendSpreadsheetId).sheets.get('Settings').rows;
  settings.find((row) => row.Key === 'NEXT_MEETING_ID').Value = '42';
  settings.find((row) => row.Key === 'AI_DEFAULT_MODEL').Value = 'gemini-flash-selected-later';

  const second = ksp.kspRunSetup(env);
  assert.equal(second.ok, true, JSON.stringify(second.errors));
  assert.equal(settings.find((row) => row.Key === 'NEXT_MEETING_ID').Value, '42');
  assert.equal(settings.find((row) => row.Key === 'AI_DEFAULT_MODEL').Value, 'gemini-flash-selected-later');
});

test('stored resource outside the configured parent boundary fails', () => {
  const env = createFakeEnvironment({ properties: { BOOTSTRAP_CONFIG_JSON: bootstrap() } });
  const first = ksp.kspRunSetup(env);
  assert.equal(first.ok, true);
  const state = JSON.parse(env._debug.properties.get('KSP_INSTALLATION_STATE_JSON'));
  const backend = env._debug.resources.get(state.resources.backendSpreadsheetId);
  backend.parents = ['wrong-control-folder'];

  const second = ksp.kspRunSetup(env);
  assert.equal(second.ok, false);
  assert.equal(second.errors[0].code, 'STORED_RESOURCE_PARENT_MISMATCH');
});

test('validation passes after a fake setup', () => {
  const env = createFakeEnvironment({ properties: { BOOTSTRAP_CONFIG_JSON: bootstrap() } });
  const setupReport = ksp.kspRunSetup(env);
  assert.equal(setupReport.ok, true);
  const validationReport = ksp.kspRunValidation(env);
  assert.equal(validationReport.ok, true, JSON.stringify(validationReport.errors));
  assert.ok(validationReport.actions.some((action) => action.resource === 'master-seeds'));
});

function report() {
  return ksp.kspCreateReport('TEST', '2026-08-16T00:00:00.000Z');
}

test('creates one missing clock trigger', () => {
  const env = createFakeEnvironment();
  const output = report();
  ksp.kspEnsureTriggers(env, [{
    key: 'AI_SYNC', handler: 'runAiSyncWorker', eventType: 'CLOCK', intervalMinutes: 15, enabled: true
  }], output);
  assert.equal(env._debug.triggers.length, 1);
  assert.equal(output.actions[0].action, 'created');
});

test('does not create another trigger when handler/type already exists', () => {
  const env = createFakeEnvironment({
    triggers: [{ id: 'existing', handler: 'runAiSyncWorker', eventType: 'CLOCK' }]
  });
  const output = report();
  ksp.kspEnsureTriggers(env, [{
    key: 'AI_SYNC', handler: 'runAiSyncWorker', eventType: 'CLOCK', intervalMinutes: 15, enabled: true
  }], output);
  assert.equal(env._debug.triggers.length, 1);
  assert.equal(output.actions[0].action, 'reused');
});

test('refuses to create a trigger for an unavailable handler contract', () => {
  const env = createFakeEnvironment();
  const output = report();
  assert.throws(() => ksp.kspEnsureTriggers(env, [{
    key: 'AI_SYNC', handler: 'runAiSyncWorker', eventType: 'CLOCK', intervalMinutes: 15, enabled: true, available: false
  }], output), /not implemented/);
  assert.equal(env._debug.triggers.length, 0);
});
