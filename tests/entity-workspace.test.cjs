const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

function formatDateInTimeZone(value, timezone, pattern) {
  const parts = new Intl.DateTimeFormat('en-CA', pattern === 'HH:mm'
    ? { timeZone: timezone, hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }
    : { timeZone: timezone, year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(value);
  const byType = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return pattern === 'HH:mm' ? `${byType.hour}:${byType.minute}` : `${byType.year}-${byType.month}-${byType.day}`;
}

function loadSource() {
  const context = vm.createContext({
    console, JSON, Object, Array, String, Number, Boolean, Date, Math, RegExp,
    Error, TypeError, Set, Map, Intl, Utilities: { formatDate: formatDateInTimeZone }
  });
  for (const file of [
    '00_Core.gs', '05_TemporalContracts.gs', '06_CounterpartyMigration.gs',
    '61_PitchbookValidation.gs', '62_PitchbookIdentity.gs', '30_MeetingCore.gs',
    '100_MaintenanceCore.gs', '112_MaintenanceServiceHelpers.gs',
    '128_RelationshipExplorerService.gs', '129_EntityWorkspaceService.gs'
  ]) {
    new vm.Script(fs.readFileSync(path.join(__dirname, '..', 'src', file), 'utf8'), { filename: file }).runInContext(context);
  }
  return context;
}

const ksp = loadSource();
const counterparties = [
  { Counterparty_ID: 'CP-000001', Counterparty_Name: 'Synthetic GP', Counterparty_Type: 'GP', Status: 'Active' },
  { Counterparty_ID: 'CP-000002', Counterparty_Name: 'Synthetic LP', Counterparty_Type: 'LP_ASSET_OWNER', Status: 'Active' },
  { Counterparty_ID: 'CP-000003', Counterparty_Name: 'Synthetic Department', Counterparty_Type: 'NISSAY_INTERNAL', Status: 'Active' },
  { Counterparty_ID: 'CP-000004', Counterparty_Name: 'Synthetic Group', Counterparty_Type: 'GROUP_COMPANY', Status: 'Active' },
  { Counterparty_ID: 'CP-000005', Counterparty_Name: 'Synthetic Consultant', Counterparty_Type: 'CONSULTANT_GATEKEEPER', Status: 'Active' },
  { Counterparty_ID: 'CP-000006', Counterparty_Name: 'Synthetic Other', Counterparty_Type: 'OTHER', Status: 'Inactive' }
];
const options = [
  { Option_ID: 'AC-1', Type: 'ASSET_CLASS', Name: 'Infrastructure', Sort_Order: 1, Status: 'Active' },
  { Option_ID: 'TEAM-1', Type: 'TEAM', Name: 'PD', Sort_Order: 1, Status: 'Active' }
];
const meetings = [
  { Meeting_ID: 'MTG-1', Date: '2026-08-20', Counterparty_ID: 'CP-000001', Asset_Class_ID: 'AC-1', Team_ID: 'TEAM-1', Fund_Strategy: 'Fund A', Related_Pitchbook_IDs: 'DOC-1', Status: 'Active', Version: 1, Doc_File_ID: 'doc-1', Doc_URL: '', Saved_Filename: 'one.doc' },
  { Meeting_ID: 'MTG-2', Date: '2026-08-21', Counterparty_ID: 'CP-000002', Asset_Class_ID: 'AC-1', Team_ID: 'TEAM-1', Fund_Strategy: 'Fund B', Related_Pitchbook_IDs: '', Status: 'Active', Version: 1, Doc_File_ID: 'doc-2', Doc_URL: '', Saved_Filename: 'two.doc' }
];
const pitchbooks = [
  { Document_ID: 'DOC-1', Date: '2026-08-19', Counterparty_ID: 'CP-000001', Asset_Class_ID: 'AC-1', Fund_Strategy: 'Fund A', File_ID: 'file-1', File_URL: '', Saved_Filename: 'one.pdf', Status: 'Active' }
];

test('catalog exposes all Counterparty types and preserves inactive entities', () => {
  const data = ksp.kspBuildEntityWorkspaceData_({}, counterparties, options, meetings, pitchbooks);
  assert.equal(data.ok, true, JSON.stringify(data));
  assert.deepEqual(JSON.parse(JSON.stringify(data.entityTypes.map((item) => item.code))), [
    'GP', 'LP_ASSET_OWNER', 'NISSAY_INTERNAL', 'GROUP_COMPANY', 'CONSULTANT_GATEKEEPER', 'OTHER'
  ]);
  assert.ok(data.entityOptions.some((item) => item.entityKey === 'COUNTERPARTY:CP-000006' && item.status === 'Inactive'));
  assert.equal(data.entityOptions.every((item) => item.entityKey.startsWith('COUNTERPARTY:CP-')), true);
});

test('counterparty summary is direct-only and uses explicit Meeting-Pitchbook edges', () => {
  const gp = ksp.kspBuildEntityWorkspaceData_({ entityKey: 'COUNTERPARTY:CP-000001' }, counterparties, options, meetings, pitchbooks);
  assert.equal(gp.ok, true, JSON.stringify(gp));
  assert.equal(gp.entity.counterpartyType, 'GP');
  assert.deepEqual(JSON.parse(JSON.stringify(gp.meetings.all.records.map((item) => item.meetingId))), ['MTG-1']);
  assert.deepEqual(JSON.parse(JSON.stringify(gp.ownedPitchbooks.records.map((item) => item.documentId))), ['DOC-1']);
  assert.equal(gp.relatedGps.length, 0);
  assert.equal(gp.relationships[0].relatedPitchbooks[0].documentId, 'DOC-1');

  const lp = ksp.kspBuildEntityWorkspaceData_({ entityKey: 'COUNTERPARTY:CP-000002' }, counterparties, options, meetings, pitchbooks);
  assert.equal(lp.ok, true, JSON.stringify(lp));
  assert.deepEqual(JSON.parse(JSON.stringify(lp.meetings.all.records.map((item) => item.meetingId))), ['MTG-2']);
  assert.equal(lp.pitchbooks.totalCount, 0);
});

test('Entity Workspace endpoint performs four reads and no side effects', () => {
  const calls = [];
  const bySheet = { Counterparty_Master: counterparties, Option_Master: options, Meeting_Index: meetings, Pitchbook_Index: pitchbooks };
  const environment = {
    getInstallationState() { calls.push('getInstallationState'); return { resources: { backendSpreadsheetId: 'backend' } }; },
    readRows(id, sheet) { calls.push(`read:${id}:${sheet}`); return JSON.parse(JSON.stringify(bySheet[sheet])); },
    appendRow() { throw new Error('must not write'); }, updateRow() { throw new Error('must not write'); }
  };
  const result = ksp.kspGetEntityWorkspaceData_(environment, { entityKey: 'COUNTERPARTY:CP-000002' });
  assert.equal(result.ok, true, JSON.stringify(result));
  assert.deepEqual(calls, [
    'getInstallationState', 'read:backend:Counterparty_Master', 'read:backend:Option_Master',
    'read:backend:Meeting_Index', 'read:backend:Pitchbook_Index'
  ]);
  assert.deepEqual(JSON.parse(JSON.stringify(result.sideEffects)), { writes: 0, auditWrites: 0, aiCalls: 0 });
});
