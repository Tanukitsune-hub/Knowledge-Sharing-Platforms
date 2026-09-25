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
  const renames = [];

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
    renameResource(id, name) {
      const resource = resources.get(id);
      if (!resource) throw new Error(`Resource not found: ${id}`);
      const previousKey = childKey(resource.parents[0], resource.name, resource.mimeType);
      children.set(previousKey, (children.get(previousKey) || []).filter((candidate) => candidate !== id));
      resource.name = name;
      const nextKey = childKey(resource.parents[0], resource.name, resource.mimeType);
      children.set(nextKey, [...(children.get(nextKey) || []), id]);
      renames.push({ id, name });
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
    renameSheetIfPresent(spreadsheetId, fromName, toName) {
      const spreadsheet = spreadsheets.get(spreadsheetId);
      const fromSheet = spreadsheet.sheets.get(fromName);
      const toSheet = spreadsheet.sheets.get(toName);
      if (fromSheet && toSheet) {
        const error = new Error('Legacy and canonical Counterparty master sheets both exist.');
        error.code = 'COUNTERPARTY_MASTER_RENAME_CONFLICT';
        throw error;
      }
      if (!fromSheet) return { action: toSheet ? 'reused' : 'not-found' };
      spreadsheet.sheets.delete(fromName);
      spreadsheet.sheets.set(toName, fromSheet);
      return { action: 'renamed' };
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
    readCounterpartyMigrationSnapshot(spreadsheetId) {
      const sheets = spreadsheets.get(spreadsheetId).sheets;
      const rows = (name) => (sheets.get(name)?.rows || []).map((row) => ({ ...row }));
      return {
        counterpartyRows: rows('Counterparty_Master'),
        optionRows: rows('Option_Master'),
        meetingRows: rows('Meeting_Index'),
        pitchbookRows: rows('Pitchbook_Index')
      };
    },
    applyCounterpartyMigrationPlan(spreadsheetId, plan) {
      const sheets = spreadsheets.get(spreadsheetId).sheets;
      const apply = (name, patches) => {
        const rows = sheets.get(name).rows;
        for (const patch of patches || []) Object.assign(rows[patch.rowIndex], patch.values);
      };
      apply('Counterparty_Master', plan.counterpartyPatches);
      sheets.get('Counterparty_Master').rows.push(...(plan.counterpartyAppends || []).map((row) => ({ ...row })));
      apply('Meeting_Index', plan.meetingPatches);
      apply('Pitchbook_Index', plan.pitchbookPatches);
      return {
        counterpartyUpdated: (plan.counterpartyPatches || []).length,
        counterpartyInserted: (plan.counterpartyAppends || []).length,
        meetingUpdated: (plan.meetingPatches || []).length,
        pitchbookUpdated: (plan.pitchbookPatches || []).length,
        legacyMappingCount: Number(plan.legacyMappingCount || 0)
      };
    },
    backfillMeetingCounterpartyFields(spreadsheetId) {
      const sheet = spreadsheets.get(spreadsheetId).sheets.get('Meeting_Index');
      let updated = 0;
      for (const row of sheet.rows) {
        const patch = ksp.kspBuildLegacyMeetingCounterpartyBackfill_(row);
        if (!patch) continue;
        Object.assign(row, patch);
        updated += 1;
      }
      return { scanned: sheet.rows.length, updated };
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
    createDailyTrigger(handler, timezone) {
      const trigger = { id: `trigger-${idCounter++}`, handler, eventType: 'CLOCK', schedule: 'DAILY', timezone };
      triggers.push(trigger);
      return { ...trigger };
    },
    deleteTrigger(triggerId) {
      const index = triggers.findIndex((trigger) => String(trigger.id) === String(triggerId));
      if (index === -1) throw new Error('Trigger is not accessible for migration.');
      triggers.splice(index, 1);
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
      renames,
      addResource
    }
  };

  return environment;
}

const root = path.resolve(__dirname, '..');
const ksp = loadAppsScript(root);

test('normalizes a valid bootstrap config', () => {
  const config = ksp.kspNormalizeAndValidateConfig_({
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

test('accepts the host parent as the shared default source/control boundary', () => {
  const config = ksp.kspNormalizeAndValidateConfig_({
    environment: 'DEV',
    knowledgeParentFolderId: 'same',
    controlFolderId: 'same'
  });
  assert.equal(config.knowledgeParentFolderId, 'same');
  assert.equal(config.controlFolderId, 'same');
});

test('returns a safe bootstrap template without credentials', () => {
  const template = ksp.kspGetBootstrapConfigTemplate_();
  assert.equal(template.aiSyncEnabled, false);
  assert.equal(Object.hasOwn(template, 'credential'), false);
  assert.equal(Object.hasOwn(template, 'apiKey'), false);
});

test('defines exactly seven schema9 backend sheets and source-specific columns', () => {
  const schemas = ksp.kspGetBackendSchemas_();
  assert.deepEqual(Object.keys(schemas).sort(), [
    'Counterparty_Master', 'Internal_Assessment_Index', 'Meeting_Index',
    'News_Index', 'Option_Master', 'Pitchbook_Index', 'Settings'
  ]);
  assert.deepEqual(Array.from(schemas.Counterparty_Master), [
    'Counterparty_ID', 'Counterparty_Name', 'Counterparty_Type', 'Status',
    'Created_At', 'Updated_At', 'Created_By', 'Updated_By',
    'Legacy_Source_Type', 'Legacy_Source_ID'
  ]);
  assert.ok(schemas.Meeting_Index.includes('AI_Index_Status'));
  assert.ok(schemas.Pitchbook_Index.includes('Original_Filename'));
  assert.deepEqual(Array.from(schemas.Meeting_Index.slice(-13)), ['Team_ID','Fund_Strategy','Meeting_Type_Codes','Related_Pitchbook_IDs','Follow_Up_Required','Follow_Up_Note','Counterparty_Type','Counterparty_ID','Related_GP_IDs','Admin_Check_Completed','Admin_Check_Updated_At','Admin_Check_Updated_By','AI_Provider_State_JSON']);
  assert.deepEqual(Array.from(schemas.Pitchbook_Index.slice(-5)), ['AI_Provider_State_JSON','Parent_Meeting_ID','Counterparty_Type','Counterparty_ID','Related_GP_IDs']);
  assert.deepEqual(Array.from(schemas.News_Index), [
    'News_ID', 'Published_Date', 'Publisher', 'Title', 'URL', 'Counterparty_IDs',
    'Asset_Class_ID', 'Fund_Strategy', 'Input_Mode', 'Source_File_ID', 'Source_URL',
    'Source_Mime_Type', 'Original_Filename', 'Saved_Filename', 'Status', 'Version',
    'Created_At', 'Updated_At', 'Created_By', 'Updated_By', 'AI_Document_Name',
    'AI_Index_Status', 'AI_Indexed_At', 'AI_Content_Hash', 'AI_Last_Error',
    'AI_Provider_State_JSON'
  ]);
  assert.deepEqual(Array.from(schemas.Internal_Assessment_Index), [
    'Assessment_ID', 'Assessment_Date', 'Assessment_Type', 'Title', 'Counterparty_IDs',
    'Asset_Class_ID', 'Fund_Strategy', 'Decision_Or_Action', 'Input_Mode',
    'Source_File_ID', 'Source_URL', 'Source_Mime_Type', 'Original_Filename',
    'Saved_Filename', 'Related_Meeting_IDs', 'Related_Document_IDs',
    'Related_News_IDs', 'Status', 'Version', 'Created_At', 'Updated_At',
    'Created_By', 'Updated_By', 'AI_Document_Name', 'AI_Index_Status',
    'AI_Indexed_At', 'AI_Content_Hash', 'AI_Last_Error', 'AI_Provider_State_JSON'
  ]);
});

test('defines a separate audit log schema', () => {
  const audit = ksp.kspGetAuditSchema_();
  assert.deepEqual(Object.keys(audit), ['Audit_Log']);
  assert.ok(audit.Audit_Log.includes('Actor'));
  assert.ok(audit.Audit_Log.includes('Search_Mode'));
  assert.ok(audit.Audit_Log.includes('Cited_Source_IDs'));
});

test('master seed IDs are stable, generic, and unique', () => {
  const counterpartyIds = ksp.kspGetCounterpartySeedDefinitions_().map((seed) => seed[0]);
  const optionIds = ksp.kspGetOptionSeedDefinitions_().map((seed) => seed[0]);
  assert.equal(new Set(counterpartyIds).size, counterpartyIds.length);
  assert.equal(new Set(optionIds).size, optionIds.length);
  assert.ok(counterpartyIds.includes('CP-000019'));
  assert.equal(counterpartyIds.every((id) => /^CP-\d{6}$/.test(id)), true);
  assert.ok(optionIds.includes('OPT-AC-003'));
  assert.ok(optionIds.includes('OPT-TEAM-001'));
  assert.ok(optionIds.includes('OPT-TEAM-002'));
});

test('normalizes future generated filename segments predictably', () => {
  assert.equal(ksp.kspNormalizeGeneratedNameSegment_('  KKR / Infra & Debt  '), 'KKR_Infra_Debt');
  assert.equal(ksp.kspNormalizeGeneratedNameSegment_('A\\B'), 'AB');
  assert.equal(ksp.kspNormalizeGeneratedNameSegment_(null), '');
});

test('escapes Drive query literals', () => {
  assert.equal(ksp.kspEscapeDriveQueryLiteral_("O'Reilly\\Fund"), "O\\'Reilly\\\\Fund");
});

test('forward migration appends missing columns and preserves existing columns', () => {
  const env = createFakeEnvironment();
  const backend = env.createSpreadsheet('control', 'Knowledge Platform Backend');
  env.ensureSheet(backend.id, 'Settings', ['Key', 'Value']);

  const result = env.ensureSheet(backend.id, 'Settings', ksp.kspGetBackendSchemas_().Settings);
  assert.equal(result.action, 'migrated');
  assert.deepEqual(Array.from(result.addedHeaders), ['Description', 'Updated_At']);
  assert.deepEqual(env.getSheetHeaders(backend.id, 'Settings'), ['Key', 'Value', 'Description', 'Updated_At']);
});

const COUNTERPARTY_HEADERS = ['Counterparty_ID', 'Counterparty_Name', 'Counterparty_Type', 'Status'];

test('CODEX12 append-only Pitchbook schema migration preserves legacy orphans and is idempotent',()=>{
 const env=createFakeEnvironment();const backend=env.createSpreadsheet('control','Backend');const headers=Array.from(ksp.kspGetBackendSchemas_().Pitchbook_Index);
 env.ensureSheet(backend.id,'Pitchbook_Index',headers.slice(0,-4));const sheet=env._debug.spreadsheets.get(backend.id).sheets.get('Pitchbook_Index');
 const row={Document_ID:'DOC-000321',GP_ID:'GP-000001',Date:new Date('2026-08-15T15:00:00Z'),Status:'Active',File_ID:'legacy-file'};sheet.rows.push(row);
 const before={...row};const first=env.ensureSheet(backend.id,'Pitchbook_Index',headers);const second=env.ensureSheet(backend.id,'Pitchbook_Index',headers);
 assert.deepEqual(first.addedHeaders,['Parent_Meeting_ID','Counterparty_Type','Counterparty_ID','Related_GP_IDs']);assert.equal(second.action,'reused');assert.equal(sheet.rows[0],row);assert.deepEqual(row,before);assert.equal(row.Parent_Meeting_ID,undefined);
});

test('seed insertion does not overwrite mutable existing master values', () => {
  const env = createFakeEnvironment();
  const backend = env.createSpreadsheet('control', 'Backend');
  env.ensureSheet(backend.id, 'Counterparty_Master', COUNTERPARTY_HEADERS);
  env.insertMissingRows(backend.id, 'Counterparty_Master', 'Counterparty_ID', [
    { Counterparty_ID: 'CP-000001', Counterparty_Name: 'User Renamed Counterparty', Counterparty_Type: 'GP', Status: 'Inactive' }
  ]);

  const result = env.insertMissingRows(backend.id, 'Counterparty_Master', 'Counterparty_ID', [
    { Counterparty_ID: 'CP-000001', Counterparty_Name: 'Advent International', Counterparty_Type: 'GP', Status: 'Active' },
    { Counterparty_ID: 'CP-000002', Counterparty_Name: 'Apollo', Counterparty_Type: 'GP', Status: 'Active' }
  ]);

  assert.deepEqual(result, { inserted: 1, skipped: 1 });
  const rows = env._debug.spreadsheets.get(backend.id).sheets.get('Counterparty_Master').rows;
  assert.equal(rows.find((row) => row.Counterparty_ID === 'CP-000001').Counterparty_Name, 'User Renamed Counterparty');
  assert.equal(rows.find((row) => row.Counterparty_ID === 'CP-000001').Status, 'Inactive');
});

test('Work 0017 Meeting migration appends admin-check fields without rewriting legacy rows', () => {
  const env = createFakeEnvironment();
  const backend = env.createSpreadsheet('control', 'Knowledge Platform Backend');
  const currentHeaders = Array.from(ksp.kspGetBackendSchemas_().Meeting_Index);
  const legacyHeaders = currentHeaders.slice(0, -3);
  env.ensureSheet(backend.id, 'Meeting_Index', legacyHeaders);
  const sheet = env._debug.spreadsheets.get(backend.id).sheets.get('Meeting_Index');
  const legacyRow = { Meeting_ID:'MTG-000321', Status:'Active', AI_Index_Status:'Indexed', Version:7 };
  sheet.rows.push(legacyRow);

  const first = env.ensureSheet(backend.id, 'Meeting_Index', currentHeaders);
  const second = env.ensureSheet(backend.id, 'Meeting_Index', currentHeaders);
  assert.equal(first.action, 'migrated');
  assert.deepEqual(first.addedHeaders, currentHeaders.slice(-3));
  assert.equal(second.action, 'reused');
  assert.equal(sheet.rows[0], legacyRow);
  assert.deepEqual(sheet.rows[0], { Meeting_ID:'MTG-000321', Status:'Active', AI_Index_Status:'Indexed', Version:7 });
});

test('TEAM seed repair inserts only missing IDs and preserves user mutations', () => {
  const env=createFakeEnvironment(); const backend=env.createSpreadsheet('control','Backend');
  const headers=['Option_ID','Type','Name','Sort_Order','Status','Created_At','Updated_At','Created_By','Updated_By'];
  env.ensureSheet(backend.id,'Option_Master',headers);
  env.insertMissingRows(backend.id,'Option_Master','Option_ID',[{Option_ID:'OPT-TEAM-001',Type:'TEAM',Name:'User PD',Sort_Order:9,Status:'Inactive'}]);
  const result=env.insertMissingRows(backend.id,'Option_Master','Option_ID',ksp.kspBuildOptionSeedRows_('now').filter(row=>row.Type==='TEAM'));
  assert.deepEqual(result,{inserted:1,skipped:1});
  const rows=env._debug.spreadsheets.get(backend.id).sheets.get('Option_Master').rows;
  const existing=rows.find(row=>row.Option_ID==='OPT-TEAM-001');
  assert.equal(existing.Name,'User PD'); assert.equal(existing.Sort_Order,9); assert.equal(existing.Status,'Inactive');
  assert.equal(rows.filter(row=>row.Type==='TEAM').length,2);
});

test('Work 0016 legacy Meeting backfill is blank-only and idempotent', () => {
  const legacy={GP_ID:'GP-000001',Counterparty_Type:'',Counterparty_ID:'',Related_GP_IDs:'',Version:7,Updated_At:'stable',AI_Index_Status:'Indexed'};
  const first=ksp.kspBuildLegacyMeetingCounterpartyBackfill_(legacy);
  assert.deepEqual(JSON.parse(JSON.stringify(first)),{Counterparty_Type:'GP',Counterparty_ID:'GP-000001',Related_GP_IDs:'GP-000001'});
  const migrated={...legacy,...first};
  assert.equal(ksp.kspBuildLegacyMeetingCounterpartyBackfill_(migrated),null);
  assert.equal(migrated.Version,7);assert.equal(migrated.Updated_At,'stable');assert.equal(migrated.AI_Index_Status,'Indexed');
  assert.equal(ksp.kspBuildLegacyMeetingCounterpartyBackfill_({GP_ID:'GP-000001',Counterparty_Type:'OTHER',Counterparty_ID:'OPT-CPOT-001',Related_GP_IDs:'GP-000002'}),null);
  assert.equal(ksp.kspBuildLegacyMeetingCounterpartyBackfill_({GP_ID:'GP-000001',Counterparty_Type:'OTHER',Counterparty_ID:'',Related_GP_IDs:''}),null);
  assert.equal(ksp.kspBuildLegacyMeetingCounterpartyBackfill_({GP_ID:''}),null);
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

function schema8Installation(folderNames = {}) {
  const folderMime = 'application/vnd.google-apps.folder';
  const spreadsheetMime = 'application/vnd.google-apps.spreadsheet';
  const resources = {
    knowledgeRootFolderId: 'legacy-root',
    meetingRecordsFolderId: 'legacy-meetings',
    pitchbooksFolderId: 'legacy-pitchbooks',
    knowledgeExportsFolderId: 'legacy-exports',
    backupFolderId: 'legacy-backup',
    backendSpreadsheetId: 'backend',
    auditSpreadsheetId: 'audit'
  };
  const config = JSON.parse(bootstrap());
  const state = { schemaVersion: 8, releaseVersion: '0.1.2', config, resources,
    updatedAt: '2026-08-15T00:00:00.000Z' };
  const env = createFakeEnvironment({
    properties: { KSP_INSTALLATION_STATE_JSON: JSON.stringify(state) },
    resources: [
      { id: resources.knowledgeRootFolderId, name: folderNames.root || 'Private Assets Knowledge',
        mimeType: folderMime, parents: ['knowledge-parent'] },
      { id: resources.meetingRecordsFolderId, name: folderNames.meetings || 'Meeting Records',
        mimeType: folderMime, parents: [resources.knowledgeRootFolderId] },
      { id: resources.pitchbooksFolderId, name: folderNames.pitchbooks || 'Pitchbooks',
        mimeType: folderMime, parents: [resources.knowledgeRootFolderId] },
      { id: resources.knowledgeExportsFolderId, name: 'Knowledge Exports',
        mimeType: folderMime, parents: ['knowledge-parent'] },
      { id: resources.backupFolderId, name: 'Knowledge Platform Backups',
        mimeType: folderMime, parents: ['control-folder'] },
      { id: resources.backendSpreadsheetId, name: 'Knowledge Platform Backend',
        mimeType: spreadsheetMime, parents: ['control-folder'] },
      { id: resources.auditSpreadsheetId, name: 'Knowledge Platform Audit',
        mimeType: spreadsheetMime, parents: ['control-folder'] }
    ]
  });
  const backend = env._debug.spreadsheets.get(resources.backendSpreadsheetId);
  const schemas = ksp.kspGetBackendSchemas_();
  for (const name of ['Counterparty_Master', 'Option_Master', 'Meeting_Index', 'Pitchbook_Index', 'Settings'])
    env.ensureSheet(resources.backendSpreadsheetId, name, Array.from(schemas[name]));
  env.ensureSheet(resources.auditSpreadsheetId, 'Audit_Log', Array.from(ksp.kspGetAuditSchema_().Audit_Log));
  const counterparty = ksp.kspBuildCounterpartySeedRows_('2026-08-01T00:00:00.000Z')[0];
  backend.sheets.get('Counterparty_Master').rows.push(counterparty);
  const meeting = { Meeting_ID: 'MTG-000321', Date: new Date('2026-08-15T15:00:00.000Z'),
    Counterparty_Type: 'GP', Counterparty_ID: counterparty.Counterparty_ID,
    Doc_File_ID: 'existing-meeting-doc', Related_Pitchbook_IDs: 'DOC-000654',
    Version: 7, Status: 'Active', AI_Index_Status: 'Indexed' };
  const pitchbook = { Document_ID: 'DOC-000654', Date: '2026-08-16',
    Counterparty_Type: 'GP', Counterparty_ID: counterparty.Counterparty_ID,
    Parent_Meeting_ID: meeting.Meeting_ID, File_ID: 'existing-pitchbook-file',
    Status: 'Active', AI_Index_Status: 'Indexed' };
  backend.sheets.get('Meeting_Index').rows.push(meeting);
  backend.sheets.get('Pitchbook_Index').rows.push(pitchbook);
  backend.sheets.get('Settings').rows.push(
    { Key: 'SCHEMA_VERSION', Value: '8' },
    { Key: 'NEXT_MEETING_ID', Value: '400' },
    { Key: 'NEXT_DOCUMENT_ID', Value: '700' },
    { Key: 'NEXT_BATCH_ID', Value: '80' },
    { Key: 'OPENAI_ENABLED', Value: 'true' },
    { Key: 'OPENAI_VECTOR_STORE_ID', Value: 'synthetic-store' }
  );
  return { env, resources, backend, meeting, pitchbook };
}

test('schema8 installation migrates in place to seven sheets and preserves IDs, rows and stored resources', () => {
  const { env, resources, backend, meeting, pitchbook } = schema8Installation();
  const meetingBefore = { ...meeting }, pitchbookBefore = { ...pitchbook };
  assert.equal(backend.sheets.size, 5);
  const first = ksp.kspRunSetup_(env);
  assert.equal(first.ok, true, JSON.stringify(first.errors));
  assert.equal(backend.sheets.size, 7);
  assert.deepEqual([...backend.sheets.keys()].sort(), Object.keys(ksp.kspGetBackendSchemas_()).sort());
  assert.deepEqual(backend.sheets.get('News_Index').headers, Array.from(ksp.kspGetBackendSchemas_().News_Index));
  assert.deepEqual(backend.sheets.get('Internal_Assessment_Index').headers,
    Array.from(ksp.kspGetBackendSchemas_().Internal_Assessment_Index));
  assert.equal(backend.sheets.get('Meeting_Index').rows[0], meeting);
  assert.equal(backend.sheets.get('Pitchbook_Index').rows[0], pitchbook);
  assert.deepEqual(meeting, meetingBefore);
  assert.deepEqual(pitchbook, pitchbookBefore);
  const migratedState = JSON.parse(env._debug.properties.get('KSP_INSTALLATION_STATE_JSON'));
  assert.equal(migratedState.schemaVersion, 9);
  for (const [key, id] of Object.entries(resources)) assert.equal(migratedState.resources[key], id);
  const settings = backend.sheets.get('Settings').rows;
  for (const [key, expected] of Object.entries({ SCHEMA_VERSION: '9', NEXT_MEETING_ID: '400',
    NEXT_DOCUMENT_ID: '700', NEXT_BATCH_ID: '80', NEXT_NEWS_ID: '1', NEXT_ASSESSMENT_ID: '1',
    OPENAI_ENABLED: 'true', OPENAI_VECTOR_STORE_ID: 'synthetic-store' }))
    assert.equal(settings.find(row => row.Key === key).Value, expected, key);
  assert.deepEqual(env._debug.renames, [
    { id: resources.knowledgeRootFolderId, name: '記録・資料' },
    { id: resources.meetingRecordsFolderId, name: '面談記録' },
    { id: resources.pitchbooksFolderId, name: '保存資料' }
  ]);
  assert.equal(first.actions.filter(action => action.category === 'migration' && action.action === 'renamed').length, 3);
  for (const [key, name] of [['newsFolderId', 'ニュース'],
    ['internalAssessmentsFolderId', '評価（ICメモ、社内整理等）']]) {
    const folder = env._debug.resources.get(migratedState.resources[key]);
    assert.equal(folder.name, name);
    assert.deepEqual(folder.parents, [resources.knowledgeRootFolderId]);
  }
  assert.deepEqual(env._debug.resources.get(resources.knowledgeExportsFolderId).parents, ['knowledge-parent']);
  assert.equal(ksp.kspRunValidation_(env).ok, true);

  const second = ksp.kspRunSetup_(env);
  assert.equal(second.ok, true, JSON.stringify(second.errors));
  assert.equal(second.actions.filter(action => action.category === 'migration' && action.action === 'renamed').length, 0);
  assert.equal(second.actions.filter(action => action.category === 'resource' && action.action === 'created').length, 0);
  assert.equal(second.actions.filter(action => action.category === 'schema' && action.action === 'created').length, 0);
  assert.equal(env._debug.resources.size, 9);
  assert.equal(backend.sheets.size, 7);
  assert.equal(backend.sheets.get('Meeting_Index').rows[0], meeting);
  assert.equal(backend.sheets.get('Pitchbook_Index').rows[0], pitchbook);
  assert.deepEqual(meeting, meetingBefore);
  assert.deepEqual(pitchbook, pitchbookBefore);
  assert.equal(settings.find(row => row.Key === 'NEXT_MEETING_ID').Value, '400');
  assert.equal(settings.find(row => row.Key === 'NEXT_DOCUMENT_ID').Value, '700');
});

test('schema8 migration preserves manually customized folder names and stored IDs', () => {
  const custom = { root: 'Team Knowledge', meetings: 'Team Interviews', pitchbooks: 'Team Materials' };
  const { env, resources } = schema8Installation(custom);
  const result = ksp.kspRunSetup_(env);
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  assert.deepEqual(env._debug.renames, []);
  for (const [key, name] of [['knowledgeRootFolderId', custom.root],
    ['meetingRecordsFolderId', custom.meetings], ['pitchbooksFolderId', custom.pitchbooks]])
    assert.equal(env._debug.resources.get(resources[key]).name, name);
  assert.equal(result.warnings.filter(warning => warning.code === 'STORED_RESOURCE_RENAMED').length, 3);
  assert.equal(env._debug.resources.get(result.resources.newsFolderId).parents[0], resources.knowledgeRootFolderId);
  assert.equal(env._debug.resources.get(result.resources.internalAssessmentsFolderId).parents[0], resources.knowledgeRootFolderId);
});

test('legacy name without stored ID and in-place rename conflict fail before duplicate creation', () => {
  const folderMime = 'application/vnd.google-apps.folder';
  const orphan = createFakeEnvironment({ properties: { BOOTSTRAP_CONFIG_JSON: bootstrap() },
    resources: [{ id: 'orphan', name: 'Private Assets Knowledge', mimeType: folderMime,
      parents: ['knowledge-parent'] }] });
  const orphanResult = ksp.kspRunSetup_(orphan);
  assert.equal(orphanResult.ok, false);
  assert.equal(orphanResult.errors[0].code, 'LEGACY_RESOURCE_ID_REQUIRED');
  assert.equal(orphan._debug.resources.size, 1);
  assert.deepEqual(orphan._debug.renames, []);

  const { env } = schema8Installation();
  env._debug.addResource({ id: 'conflicting-root', name: '記録・資料', mimeType: folderMime,
    parents: ['knowledge-parent'] });
  const conflict = ksp.kspRunSetup_(env);
  assert.equal(conflict.ok, false);
  assert.equal(conflict.errors[0].code, 'RESOURCE_RENAME_CONFLICT');
  assert.deepEqual(env._debug.renames, []);
});

test('live rename adapter updates only the stored Drive resource name in place', () => {
  const originalProperties = ksp.PropertiesService;
  const originalDrive = ksp.Drive;
  const calls = [];
  ksp.PropertiesService = { getScriptProperties: () => ({}) };
  ksp.Drive = { Files: { update(body, id, media, options) {
    calls.push({ body, id, media, options });
    return { id, name: body.name, mimeType: 'application/vnd.google-apps.folder',
      parents: ['knowledge-parent'] };
  } } };
  try {
    const result = ksp.kspCreateAppsScriptEnvironment_().renameResource('stored-root', '記録・資料');
    assert.equal(result.id, 'stored-root');
    assert.equal(result.name, '記録・資料');
    assert.deepEqual(Array.from(result.parents), ['knowledge-parent']);
    assert.deepEqual(JSON.parse(JSON.stringify(calls)), [{ body: { name: '記録・資料' }, id: 'stored-root', media: null,
      options: { supportsAllDrives: true, fields: 'id,name,mimeType,parents' } }]);
  } finally {
    ksp.PropertiesService = originalProperties;
    ksp.Drive = originalDrive;
  }
});

test('first setup creates resources, schemas, seeds, settings, and state', () => {
  const env = createFakeEnvironment({
    properties: { BOOTSTRAP_CONFIG_JSON: bootstrap() }
  });

  const report = ksp.kspRunSetup_(env);
  assert.equal(report.ok, true, JSON.stringify(report.errors));
  assert.equal(report.mode, 'SETUP');
  assert.equal(Object.keys(report.resources).length, 9);
  assert.ok(report.actions.some((action) => action.resource === 'knowledgeRootFolderId' && action.action === 'created'));
  assert.ok(report.actions.some((action) => action.resource === 'knowledgeExportsFolderId' && action.action === 'created'));
  assert.equal(env._debug.properties.has('BOOTSTRAP_CONFIG_JSON'), false);
  assert.equal(env._debug.properties.has('KSP_INSTALLATION_STATE_JSON'), true);

  const state = JSON.parse(env._debug.properties.get('KSP_INSTALLATION_STATE_JSON'));
  const backend = env._debug.spreadsheets.get(state.resources.backendSpreadsheetId);
  const audit = env._debug.spreadsheets.get(state.resources.auditSpreadsheetId);
  const exportsFolder = env._debug.resources.get(state.resources.knowledgeExportsFolderId);
  const backupFolder = env._debug.resources.get(state.resources.backupFolderId);
  assert.equal(exportsFolder.name, 'Knowledge Exports');
  assert.deepEqual(exportsFolder.parents, ['knowledge-parent']);
  assert.equal(backupFolder.name, 'Knowledge Platform Backups');
  assert.deepEqual(backupFolder.parents, ['control-folder']);
  assert.deepEqual(env._debug.triggers.map(trigger=>trigger.handler), ['runBackendDailyBackup_']);
  assert.equal(state.schemaVersion, 9);
  assert.equal(backend.sheets.size, 7);
  assert.deepEqual([...backend.sheets.keys()].sort(), Object.keys(ksp.kspGetBackendSchemas_()).sort());
  assert.equal(audit.sheets.size, 1);
  assert.equal(backend.sheets.get('Counterparty_Master').rows.length, 30);
  assert.equal(backend.sheets.get('Option_Master').rows.length, 16);
  assert.equal(backend.sheets.get('Settings').rows.find((row) => row.Key === 'AUDIT_LOG_SPREADSHEET_ID').Value, state.resources.auditSpreadsheetId);
  assert.equal(backend.sheets.get('Settings').rows.find((row) => row.Key === 'KNOWLEDGE_EXPORTS_FOLDER_ID').Value, state.resources.knowledgeExportsFolderId);
  assert.equal(backend.sheets.get('Settings').rows.find((row) => row.Key === 'BACKUP_FOLDER_ID').Value, state.resources.backupFolderId);
  assert.equal(backend.sheets.get('Settings').rows.find((row) => row.Key === 'NEXT_NEWS_ID').Value, '1');
  assert.equal(backend.sheets.get('Settings').rows.find((row) => row.Key === 'NEXT_ASSESSMENT_ID').Value, '1');
  for (const [key, name] of [['newsFolderId', 'ニュース'],
    ['internalAssessmentsFolderId', '評価（ICメモ、社内整理等）']]) {
    const folder = env._debug.resources.get(state.resources[key]);
    assert.equal(folder.name, name);
    assert.deepEqual(folder.parents, [state.resources.knowledgeRootFolderId]);
  }
});

test('second setup reuses all resources and does not duplicate seeds', () => {
  const env = createFakeEnvironment({
    properties: { BOOTSTRAP_CONFIG_JSON: bootstrap() }
  });

  const first = ksp.kspRunSetup_(env);
  assert.equal(first.ok, true);
  const second = ksp.kspRunSetup_(env);
  assert.equal(second.ok, true, JSON.stringify(second.errors));
  assert.equal(second.actions.filter((action) => action.category === 'resource' && action.action === 'reused').length, 9);
  assert.equal(env._debug.triggers.filter(trigger=>trigger.handler==='runBackendDailyBackup_').length,1);

  const state = JSON.parse(env._debug.properties.get('KSP_INSTALLATION_STATE_JSON'));
  const backend = env._debug.spreadsheets.get(state.resources.backendSpreadsheetId);
  assert.equal(backend.sheets.get('Counterparty_Master').rows.length, 30);
  assert.equal(backend.sheets.get('Option_Master').rows.length, 16);
});

test('existing installation gains the backup folder binding and daily trigger on setup rerun', () => {
  const env=createFakeEnvironment({properties:{BOOTSTRAP_CONFIG_JSON:bootstrap()}});
  assert.equal(ksp.kspRunSetup_(env).ok,true);
  const state=JSON.parse(env._debug.properties.get('KSP_INSTALLATION_STATE_JSON'));
  const folderId=state.resources.backupFolderId;delete state.resources.backupFolderId;
  env._debug.properties.set('KSP_INSTALLATION_STATE_JSON',JSON.stringify(state));
  env._debug.triggers.splice(0);
  const rerun=ksp.kspRunSetup_(env);assert.equal(rerun.ok,true,JSON.stringify(rerun.errors));
  assert.equal(rerun.resources.backupFolderId,folderId);
  assert.equal(env._debug.triggers.filter(trigger=>trigger.handler==='runBackendDailyBackup_').length,1);
});

test('multiple exact-name candidates fail explicitly', () => {
  const folderMime = 'application/vnd.google-apps.folder';
  const env = createFakeEnvironment({
    properties: { BOOTSTRAP_CONFIG_JSON: bootstrap() },
    resources: [
      { id: 'dup-1', name: '記録・資料', mimeType: folderMime, parents: ['knowledge-parent'] },
      { id: 'dup-2', name: '記録・資料', mimeType: folderMime, parents: ['knowledge-parent'] }
    ]
  });

  const report = ksp.kspRunSetup_(env);
  assert.equal(report.ok, false);
  assert.equal(report.errors[0].code, 'DUPLICATE_RESOURCE_CANDIDATES');
});

test('second setup preserves operational counters and future AI configuration', () => {
  const env = createFakeEnvironment({ properties: { BOOTSTRAP_CONFIG_JSON: bootstrap() } });
  const first = ksp.kspRunSetup_(env);
  assert.equal(first.ok, true);
  const state = JSON.parse(env._debug.properties.get('KSP_INSTALLATION_STATE_JSON'));
  const settings = env._debug.spreadsheets.get(state.resources.backendSpreadsheetId).sheets.get('Settings').rows;
  settings.find((row) => row.Key === 'NEXT_MEETING_ID').Value = '42';
  settings.find((row) => row.Key === 'NEXT_DOCUMENT_ID').Value = '43';
  settings.find((row) => row.Key === 'NEXT_BATCH_ID').Value = '44';
  settings.find((row) => row.Key === 'NEXT_NEWS_ID').Value = '45';
  settings.find((row) => row.Key === 'NEXT_ASSESSMENT_ID').Value = '46';
  settings.find((row) => row.Key === 'GEMINI_FILE_SEARCH_STORE_NAME').Value = 'stores/synthetic';
  settings.find((row) => row.Key === 'AI_DEFAULT_MODEL').Value = 'gemini-flash-selected-later';

  const second = ksp.kspRunSetup_(env);
  assert.equal(second.ok, true, JSON.stringify(second.errors));
  assert.equal(settings.find((row) => row.Key === 'NEXT_MEETING_ID').Value, '42');
  assert.equal(settings.find((row) => row.Key === 'NEXT_DOCUMENT_ID').Value, '43');
  assert.equal(settings.find((row) => row.Key === 'NEXT_BATCH_ID').Value, '44');
  assert.equal(settings.find((row) => row.Key === 'NEXT_NEWS_ID').Value, '45');
  assert.equal(settings.find((row) => row.Key === 'NEXT_ASSESSMENT_ID').Value, '46');
  assert.equal(settings.find((row) => row.Key === 'GEMINI_FILE_SEARCH_STORE_NAME').Value, 'stores/synthetic');
  assert.equal(settings.find((row) => row.Key === 'AI_DEFAULT_MODEL').Value, 'gemini-flash-selected-later');
});

test('stored resource outside the configured parent boundary fails', () => {
  const env = createFakeEnvironment({ properties: { BOOTSTRAP_CONFIG_JSON: bootstrap() } });
  const first = ksp.kspRunSetup_(env);
  assert.equal(first.ok, true);
  const state = JSON.parse(env._debug.properties.get('KSP_INSTALLATION_STATE_JSON'));
  const backend = env._debug.resources.get(state.resources.backendSpreadsheetId);
  backend.parents = ['wrong-control-folder'];

  const second = ksp.kspRunSetup_(env);
  assert.equal(second.ok, false);
  assert.equal(second.errors[0].code, 'STORED_RESOURCE_PARENT_MISMATCH');
});

test('validation passes after a fake setup', () => {
  const env = createFakeEnvironment({ properties: { BOOTSTRAP_CONFIG_JSON: bootstrap() } });
  const setupReport = ksp.kspRunSetup_(env);
  assert.equal(setupReport.ok, true);
  const validationReport = ksp.kspRunValidation_(env);
  assert.equal(validationReport.ok, true, JSON.stringify(validationReport.errors));
  assert.ok(validationReport.actions.some((action) => action.resource === 'master-seeds'));
});

test('readiness requires both new source folder bindings after schema9 setup', () => {
  const env = createFakeEnvironment({ properties: { BOOTSTRAP_CONFIG_JSON: bootstrap() } });
  assert.equal(ksp.kspRunSetup_(env).ok, true);
  const state = JSON.parse(env._debug.properties.get('KSP_INSTALLATION_STATE_JSON'));
  delete state.resources.newsFolderId;
  delete state.resources.internalAssessmentsFolderId;
  env._debug.properties.set('KSP_INSTALLATION_STATE_JSON', JSON.stringify(state));
  const status = ksp.kspGetStatus_(env);
  assert.equal(status.installed, false);
  assert.deepEqual(Array.from(status.missingResourceKeys), ['newsFolderId', 'internalAssessmentsFolderId']);
  const validation = ksp.kspRunValidation_(env);
  assert.equal(validation.ok, false);
  assert.equal(validation.errors[0].code, 'RESOURCE_ID_MISSING');
});

function report() {
  return ksp.kspCreateReport_('TEST', '2026-08-16T00:00:00.000Z');
}

test('creates one missing clock trigger', () => {
  const env = createFakeEnvironment();
  const output = report();
  ksp.kspEnsureTriggers_(env, [{
    key: 'AI_SYNC', handler: 'runAiSyncWorker_', eventType: 'CLOCK', intervalMinutes: 15, enabled: true
  }], output);
  assert.equal(env._debug.triggers.length, 1);
  assert.equal(output.actions[0].action, 'created');
});

test('does not create another trigger when handler/type already exists', () => {
  const env = createFakeEnvironment({
    triggers: [{ id: 'existing', handler: 'runAiSyncWorker_', eventType: 'CLOCK' }]
  });
  const output = report();
  ksp.kspEnsureTriggers_(env, [{
    key: 'AI_SYNC', handler: 'runAiSyncWorker_', eventType: 'CLOCK', intervalMinutes: 15, enabled: true
  }], output);
  assert.equal(env._debug.triggers.length, 1);
  assert.equal(output.actions[0].action, 'reused');
});

test('migrates the legacy public trigger handler before reusing the private handler', () => {
  const env = createFakeEnvironment({
    triggers: [{ id: 'legacy', handler: 'runAiSyncWorker', eventType: 'CLOCK' }]
  });
  const output = report();
  ksp.kspEnsureTriggers_(env, [{
    key: 'AI_SYNC', handler: 'runAiSyncWorker_', legacyHandlers: ['runAiSyncWorker'],
    eventType: 'CLOCK', intervalMinutes: 15, enabled: true
  }], output);
  assert.deepEqual(env._debug.triggers.map((trigger) => trigger.handler), ['runAiSyncWorker_']);
  assert.equal(output.actions[0].action, 'migrated');
  assert.equal(output.actions[1].action, 'created');
});

test('refuses to create a trigger for an unavailable handler contract', () => {
  const env = createFakeEnvironment();
  const output = report();
  assert.throws(() => ksp.kspEnsureTriggers_(env, [{
    key: 'AI_SYNC', handler: 'runAiSyncWorker_', eventType: 'CLOCK', intervalMinutes: 15, enabled: true, available: false
  }], output), /not implemented/);
  assert.equal(env._debug.triggers.length, 0);
});

test('daily backup trigger is created once and exact duplicate handlers are reduced to one', () => {
  const rule={key:'BACKEND_DAILY_BACKUP_TRIGGER',handler:'runBackendDailyBackup_',eventType:'CLOCK',schedule:'DAILY',timezone:'Asia/Tokyo',enabled:true,available:true,deduplicate:true};
  const env=createFakeEnvironment();
  ksp.kspEnsureTriggers_(env,[rule],report());
  assert.equal(env._debug.triggers.length,1);assert.equal(env._debug.triggers[0].schedule,'DAILY');
  env._debug.triggers.push({id:'duplicate',handler:'runBackendDailyBackup_',eventType:'CLOCK',schedule:'DAILY'});
  const output=report();ksp.kspEnsureTriggers_(env,[rule],output);
  assert.equal(env._debug.triggers.length,1);
  assert.equal(output.actions.filter(action=>action.action==='duplicate-removed').length,1);
  ksp.kspEnsureTriggers_(env,[rule],report());assert.equal(env._debug.triggers.length,1);
});
