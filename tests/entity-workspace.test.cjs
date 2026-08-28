const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

function formatDateInTimeZone(value, timezone, pattern) {
  const parts = new Intl.DateTimeFormat('en-CA', pattern === 'HH:mm' ? {
    timeZone: timezone, hour: '2-digit', minute: '2-digit', hourCycle: 'h23'
  } : {
    timeZone: timezone, year: 'numeric', month: '2-digit', day: '2-digit'
  }).formatToParts(value);
  const byType = Object.fromEntries(parts.map(part => [part.type, part.value]));
  return pattern === 'HH:mm' ? `${byType.hour}:${byType.minute}` :
    `${byType.year}-${byType.month}-${byType.day}`;
}

function loadSource() {
  const context = vm.createContext({
    console, JSON, Object, Array, String, Number, Boolean, Date, Math, RegExp,
    Error, TypeError, Set, Map, Intl,
    Utilities: { formatDate: formatDateInTimeZone }
  });
  for (const file of [
    '00_Core.gs', '05_TemporalContracts.gs', '61_PitchbookValidation.gs',
    '62_PitchbookIdentity.gs', '30_MeetingCore.gs', '100_MaintenanceCore.gs',
    '112_MaintenanceServiceHelpers.gs', '125_GpWorkspaceService.gs',
    '128_RelationshipExplorerService.gs', '129_EntityWorkspaceService.gs'
  ]) {
    new vm.Script(fs.readFileSync(path.join(__dirname, '..', 'src', file), 'utf8'), { filename: file })
      .runInContext(context);
  }
  return context;
}

const ksp = loadSource();

const gps = [
  { GP_ID: 'GP-1', GP_Name: 'Synthetic GP One', Status: 'Active' },
  { GP_ID: 'GP-2', GP_Name: 'Historical GP Two', Status: 'Inactive' }
];
const options = [
  { Option_ID: 'AC-1', Type: 'ASSET_CLASS', Name: 'Infrastructure', Sort_Order: 1, Status: 'Active' },
  { Option_ID: 'TEAM-PD', Type: 'TEAM', Name: 'PD', Sort_Order: 1, Status: 'Active' },
  { Option_ID: 'TEAM-AE', Type: 'TEAM', Name: 'AE', Sort_Order: 2, Status: 'Active' },
  { Option_ID: 'LP-1', Type: 'COUNTERPARTY_LP', Name: 'Synthetic LP', Sort_Order: 1, Status: 'Active' },
  { Option_ID: 'NISSAY-1', Type: 'COUNTERPARTY_NISSAY_DEPARTMENT', Name: 'Synthetic Department', Sort_Order: 1, Status: 'Active' },
  { Option_ID: 'GROUP-1', Type: 'COUNTERPARTY_GROUP_COMPANY', Name: 'Synthetic Group', Sort_Order: 1, Status: 'Active' },
  { Option_ID: 'CONSULT-1', Type: 'COUNTERPARTY_CONSULTANT_GATEKEEPER', Name: 'Synthetic Consultant', Sort_Order: 1, Status: 'Active' },
  { Option_ID: 'OTHER-1', Type: 'COUNTERPARTY_OTHER', Name: 'Synthetic Other', Sort_Order: 1, Status: 'Inactive' }
];

function meeting(id, overrides = {}) {
  return {
    Meeting_ID: id, Date: '2026-08-20', Time: '09:30', GP_ID: 'GP-1',
    Asset_Class_ID: 'AC-1', Capital_Type_ID: '', Location_ID: '', Team_ID: 'TEAM-PD',
    Fund_Strategy: 'GP Strategy', Counterparty_Type: 'GP', Counterparty_ID: 'GP-1',
    Related_GP_IDs: 'GP-1', Related_Pitchbook_IDs: '', Meeting_Type_Codes: 'ANNUAL_REVIEW',
    Follow_Up_Required: false, Follow_Up_Note: '', Status: 'Active', Version: 1,
    Doc_File_ID: `doc-${id}`, Doc_URL: `https://docs.google.com/document/d/doc-${id}/edit`,
    Saved_Filename: `${id}.doc`, Notes: 'must never escape', ...overrides
  };
}

function pitchbook(id, overrides = {}) {
  return {
    Document_ID: id, Date: '2026-08-19', GP_ID: 'GP-1', Asset_Class_ID: 'AC-1',
    Capital_Type_ID: '', Fund_Strategy: 'GP Strategy', Sequence_No: 1,
    File_ID: `file-${id}`, File_URL: `https://drive.google.com/file/d/file-${id}/view`,
    Original_Filename: `${id}.txt`, Saved_Filename: `${id}.pdf`, Status: 'Active',
    Binary_Content: 'must never escape', ...overrides
  };
}

function rows() {
  return {
    Meeting_Index: [
      meeting('MTG-GP-DIRECT', { Date: new Date('2026-08-20T15:00:00.000Z'), Related_Pitchbook_IDs: 'DOC-1', Follow_Up_Required: true, Follow_Up_Note: 'Synthetic note' }),
      meeting('MTG-LP-DIRECT', { Date: '2026-08-21', GP_ID: 'GP-2', Counterparty_Type: 'LP_ASSET_OWNER', Counterparty_ID: 'LP-1', Related_GP_IDs: 'GP-1', Fund_Strategy: 'LP Strategy', Meeting_Type_Codes: 'OFFICE_VISIT', Related_Pitchbook_IDs: 'DOC-1', Team_ID: 'TEAM-AE' }),
      meeting('MTG-OTHER-RELATED', { Date: '2026-08-22', GP_ID: 'GP-2', Counterparty_Type: 'OTHER', Counterparty_ID: 'OTHER-1', Related_GP_IDs: 'GP-1', Fund_Strategy: 'Related Strategy', Meeting_Type_Codes: '', Related_Pitchbook_IDs: '' }),
      meeting('MTG-GP-SECOND', { Date: '2026-08-23', Counterparty_Type: 'GP', Counterparty_ID: 'GP-1', Related_GP_IDs: 'GP-1', Fund_Strategy: 'GP Strategy', Related_Pitchbook_IDs: 'DOC-2', Status: 'Inactive' })
    ],
    Pitchbook_Index: [
      pitchbook('DOC-1', { GP_ID: 'GP-2', Fund_Strategy: 'LP Strategy', Status: 'Inactive' }),
      pitchbook('DOC-2', { GP_ID: 'GP-1', FundStrategy: 'GP Strategy' }),
      pitchbook('DOC-3', { GP_ID: 'GP-1', Fund_Strategy: 'Another GP Strategy', Status: 'Active' })
    ]
  };
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function createEnvironment(sourceRows = rows()) {
  const calls = [];
  const environment = {
    getInstallationState() {
      calls.push('getInstallationState');
      return { config: { environment: 'DEV' }, resources: { backendSpreadsheetId: 'backend' } };
    },
    readRows(id, sheet) {
      calls.push(`read:${id}:${sheet}`);
      assert.equal(id, 'backend');
      if (sheet === 'GP_Master') return clone(gps);
      if (sheet === 'Option_Master') return clone(options);
      if (sheet === 'Meeting_Index') return clone(sourceRows.Meeting_Index);
      if (sheet === 'Pitchbook_Index') return clone(sourceRows.Pitchbook_Index);
      throw new Error(`unexpected read ${sheet}`);
    },
    appendRow() { throw new Error('Entity Workspace must not write Audit.'); },
    updateRow() { throw new Error('Entity Workspace must not mutate rows.'); }
  };
  environment._debug = { calls };
  return environment;
}

test('catalog exposes every accepted Counterparty Type and preserves Inactive entities', () => {
  const data = ksp.kspBuildEntityWorkspaceData_({}, gps, options, rows().Meeting_Index, rows().Pitchbook_Index);
  assert.equal(data.ok, true, JSON.stringify(data));
  assert.deepEqual(JSON.parse(JSON.stringify(data.entityTypes.map(item => item.code))), [
    'GP', 'LP_ASSET_OWNER', 'NISSAY_INTERNAL', 'GROUP_COMPANY', 'CONSULTANT_GATEKEEPER', 'OTHER'
  ]);
  assert.ok(data.entityOptions.some(item => item.entityKey === 'GP:GP-2' && item.status === 'Inactive'));
  assert.ok(data.entityOptions.some(item => item.entityKey === 'LP_ASSET_OWNER:LP-1'));
  assert.ok(data.entityOptions.some(item => item.entityKey === 'NISSAY_INTERNAL:NISSAY-1'));
  assert.ok(data.entityOptions.some(item => item.entityKey === 'OTHER:OTHER-1' && item.status === 'Inactive'));
  const inactive = ksp.kspBuildEntityWorkspaceData_({ entityKey: 'GP:GP-2' }, gps, options, rows().Meeting_Index, rows().Pitchbook_Index);
  assert.equal(inactive.entity.status, 'Inactive');
  assert.equal(inactive.sideEffects.writes, 0);
  assert.equal(inactive.readModel.readOnly, true);
});

test('GP mode separates direct and related activity, owns exact Pitchbooks, and reuses explicit edges', () => {
  const result = ksp.kspBuildEntityWorkspaceData_({ entityKey: 'GP:GP-1' }, gps, options, rows().Meeting_Index, rows().Pitchbook_Index);
  assert.equal(result.ok, true, JSON.stringify(result));
  assert.equal(result.entity.mode, 'GP');
  assert.deepEqual(JSON.parse(JSON.stringify(result.meetings.direct.records.map(item => item.meetingId))), ['MTG-GP-SECOND', 'MTG-GP-DIRECT']);
  assert.deepEqual(JSON.parse(JSON.stringify(result.meetings.related.records.map(item => item.meetingId))), ['MTG-OTHER-RELATED', 'MTG-LP-DIRECT']);
  assert.equal(result.summary.meetingCount, 4);
  assert.equal(result.summary.directMeetingCount + result.summary.relatedMeetingCount, result.summary.meetingCount);
  assert.deepEqual(JSON.parse(JSON.stringify(result.ownedPitchbooks.records.map(item => item.documentId))), ['DOC-2', 'DOC-3']);
  assert.ok(result.relationships.some(item => item.meetingId === 'MTG-GP-DIRECT'));
  const edge = result.relationships.find(item => item.meetingId === 'MTG-GP-DIRECT');
  assert.equal(edge.relatedPitchbooks[0].documentId, 'DOC-1');
  assert.equal(edge.relatedPitchbooks[0].status, 'Inactive');
  assert.equal(result.summary.relationshipCount, 3);
  assert.equal(result.readModel.relationshipField, 'Meeting_Index.Related_Pitchbook_IDs');
  assert.equal(JSON.stringify(result).includes('must never escape'), false);
});

test('non-GP mode exposes direct Meetings, Related GP context, and only explicitly linked Pitchbooks', () => {
  const result = ksp.kspBuildEntityWorkspaceData_({ entityKey: 'LP_ASSET_OWNER:LP-1' }, gps, options, rows().Meeting_Index, rows().Pitchbook_Index);
  assert.equal(result.ok, true, JSON.stringify(result));
  assert.equal(result.entity.mode, 'NON_GP');
  assert.deepEqual(JSON.parse(JSON.stringify(result.meetings.direct.records.map(item => item.meetingId))), ['MTG-LP-DIRECT']);
  assert.equal(result.meetings.related.totalCount, 0);
  assert.deepEqual(JSON.parse(JSON.stringify(result.relatedGps.map(item => item.id))), ['GP-1']);
  assert.deepEqual(JSON.parse(JSON.stringify(result.linkedPitchbooks.records.map(item => item.documentId))), ['DOC-1']);
  assert.equal(result.linkedPitchbooks.records.some(item => item.documentId === 'DOC-2'), false,
    'Related GP membership must not infer GP-owned Pitchbooks');
  assert.equal(result.summary.relationshipCount, 1);
});

test('Fund / Strategy is exact, drills through the same model, and reports counts before caps', () => {
  const sourceRows = rows();
  sourceRows.Meeting_Index = Array.from({ length: 25 }, (_, index) => meeting(`MTG-FUND-${String(index + 1).padStart(2, '0')}`, {
    Date: `2026-08-${String((index % 9) + 1).padStart(2, '0')}`,
    Fund_Strategy: 'Exact Fund', Related_Pitchbook_IDs: '', Counterparty_Type: 'GP', Counterparty_ID: 'GP-1'
  }));
  sourceRows.Pitchbook_Index = Array.from({ length: 23 }, (_, index) => pitchbook(`DOC-FUND-${String(index + 1).padStart(2, '0')}`, {
    Date: `2026-08-${String((index % 9) + 1).padStart(2, '0')}`,
    Fund_Strategy: 'Exact Fund', GP_ID: 'GP-1'
  }));
  const result = ksp.kspBuildEntityWorkspaceData_({ entityKey: 'GP:GP-1', fundStrategy: 'Exact Fund' }, gps, options, sourceRows.Meeting_Index, sourceRows.Pitchbook_Index);
  const group = result.fundStrategies.records.find(item => item.text === 'Exact Fund');
  assert.equal(group.meetingCount, 25);
  assert.equal(group.pitchbookCount, 23);
  assert.equal(group.meetings.records.length, 20);
  assert.equal(group.meetings.omittedCount, 5);
  assert.equal(group.pitchbooks.records.length, 20);
  assert.equal(group.pitchbooks.omittedCount, 3);
  assert.equal(result.drillDown.selected, 'Exact Fund');
  assert.deepEqual(JSON.parse(JSON.stringify(result.drillDown.counts)), { meetings: 25, pitchbooks: 23, relationships: 0 });
  const variant = ksp.kspBuildEntityWorkspaceData_({ entityKey: 'GP:GP-1', fundStrategy: 'exact fund' }, gps, options, sourceRows.Meeting_Index, sourceRows.Pitchbook_Index);
  assert.equal(variant.drillDown, null);
});

test('Entity Workspace endpoint performs four reads and no application side effects', () => {
  const environment = createEnvironment();
  const result = ksp.kspGetEntityWorkspaceData_(environment, { entityKey: 'LP_ASSET_OWNER:LP-1' });
  assert.equal(result.ok, true, JSON.stringify(result));
  assert.deepEqual(environment._debug.calls, [
    'getInstallationState', 'read:backend:GP_Master', 'read:backend:Option_Master',
    'read:backend:Meeting_Index', 'read:backend:Pitchbook_Index'
  ]);
  assert.deepEqual(JSON.parse(JSON.stringify(result.sideEffects)), { writes: 0, auditWrites: 0, aiCalls: 0 });
  assert.equal(result.readModel.documentBodyRead, false);
  assert.equal(result.readModel.pitchbookBytesRead, false);
  assert.equal(result.readModel.auditRead, false);
});

test('GP Workspace compatibility delegates to the shared Entity Workspace model', () => {
  const result = ksp.kspBuildGpWorkspaceData_('GP-1', gps, options, rows().Meeting_Index, rows().Pitchbook_Index);
  assert.equal(result.ok, true, JSON.stringify(result));
  assert.equal(result.gp.id, 'GP-1');
  assert.equal(result.summary.meetingTotal, 4);
  assert.ok(result.recentMeetings.some(item => item.activityScope === 'related'));
  assert.equal(result.relationships.find(item => item.meetingId === 'MTG-GP-DIRECT').pitchbooks[0].documentId, 'DOC-1');
  const source = fs.readFileSync(path.join(__dirname, '..', 'src', '125_GpWorkspaceService.gs'), 'utf8');
  assert.match(source, /kspBuildEntityWorkspaceData_\(/);
});
