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
    '128_RelationshipExplorerService.gs'
  ]) {
    new vm.Script(fs.readFileSync(path.join(__dirname, '..', 'src', file), 'utf8'), { filename: file })
      .runInContext(context);
  }
  return context;
}

const ksp = loadSource();

const gps = [
  { GP_ID: 'GP-1', GP_Name: 'Synthetic GP One', Status: 'Active' },
  { GP_ID: 'GP-2', GP_Name: 'Synthetic GP Two', Status: 'Inactive' }
];
const options = [
  { Option_ID: 'AC-1', Type: 'ASSET_CLASS', Name: 'Infrastructure', Sort_Order: 1, Status: 'Active' },
  { Option_ID: 'AC-2', Type: 'ASSET_CLASS', Name: 'Private Equity', Sort_Order: 2, Status: 'Active' },
  { Option_ID: 'TEAM-1', Type: 'TEAM', Name: 'PD', Sort_Order: 1, Status: 'Active' },
  { Option_ID: 'LP-1', Type: 'COUNTERPARTY_LP', Name: 'Synthetic LP', Sort_Order: 1, Status: 'Active' }
];

function meeting(id, overrides = {}) {
  return {
    Meeting_ID: id,
    Date: '2026-08-20',
    Time: '09:30',
    GP_ID: 'GP-1',
    Asset_Class_ID: 'AC-1',
    Team_ID: 'TEAM-1',
    Fund_Strategy: 'Meeting Fund',
    Counterparty_Type: 'GP',
    Counterparty_ID: 'GP-1',
    Related_GP_IDs: 'GP-1',
    Related_Pitchbook_IDs: 'DOC-1',
    Meeting_Type_Codes: 'ANNUAL_REVIEW',
    Status: 'Active',
    Doc_File_ID: `doc-${id}`,
    Doc_URL: `https://docs.google.com/document/d/doc-${id}/edit`,
    Saved_Filename: `${id}.doc`,
    Notes: 'must never escape',
    Follow_Up_Note: 'must never escape',
    ...overrides
  };
}

function pitchbook(id, overrides = {}) {
  return {
    Document_ID: id,
    Date: '2026-08-19',
    GP_ID: 'GP-2',
    Asset_Class_ID: 'AC-1',
    Fund_Strategy: 'Pitchbook Fund',
    File_ID: `file-${id}`,
    File_URL: `https://drive.google.com/file/d/file-${id}/view`,
    Original_Filename: `${id}.txt`,
    Saved_Filename: `${id}.pdf`,
    Status: 'Inactive',
    Binary_Content: 'must never escape',
    ...overrides
  };
}

function createEnvironment(rows, pitchbooks) {
  const calls = [];
  const environment = {
    getInstallationState() {
      calls.push('getInstallationState');
      return { resources: { backendSpreadsheetId: 'backend' } };
    },
    readRows(id, sheet) {
      calls.push(`read:${id}:${sheet}`);
      assert.equal(id, 'backend');
      const data = {
        Meeting_Index: rows,
        Pitchbook_Index: pitchbooks,
        GP_Master: gps,
        Option_Master: options
      }[sheet];
      assert.ok(data, `unexpected read ${sheet}`);
      return data.map(row => ({ ...row }));
    },
    appendRow() { throw new Error('Relationship Explorer must not write Audit.'); },
    updateRow() { throw new Error('Relationship Explorer must not mutate rows.'); }
  };
  environment._debug = { calls };
  return environment;
}

test('forward resolution uses explicit Document_ID and reverse lookup preserves one-to-many', () => {
  const rows = [
    meeting('MTG-2', { Date: '2026-08-21', Counterparty_Type: 'LP_ASSET_OWNER', Counterparty_ID: 'LP-1', GP_ID: '', Related_GP_IDs: 'GP-2' }),
    meeting('MTG-1'),
    meeting('MTG-3', { Related_Pitchbook_IDs: '', Date: '2026-08-21', Fund_Strategy: 'Pitchbook Fund' }),
    meeting('MTG-4', { Related_Pitchbook_IDs: 'DOC-MISSING', Status: 'Inactive' })
  ];
  const environment = createEnvironment(rows, [pitchbook('DOC-1')]);
  const result = ksp.kspGetRelationshipExplorerData_(environment, {});

  assert.equal(result.ok, true, JSON.stringify(result));
  assert.deepEqual(JSON.parse(JSON.stringify(result.summary)), {
    relationships: 3, meetings: 3, pitchbooks: 1, unresolved: 1,
    inactiveMeetings: 1, inactivePitchbooks: 1
  });
  assert.deepEqual(JSON.parse(JSON.stringify(result.forward.records.map(item => item.meetingId))), ['MTG-2', 'MTG-1', 'MTG-4']);
  const nonGp = result.forward.records.find(item => item.meetingId === 'MTG-2');
  assert.equal(nonGp.counterpartyType, 'LP_ASSET_OWNER');
  assert.equal(nonGp.counterpartyEntityKey, 'LP_ASSET_OWNER:LP-1');
  assert.equal(nonGp.relatedPitchbooks[0].resolutionState, 'resolved');
  assert.equal(nonGp.relatedPitchbooks[0].documentId, 'DOC-1');
  assert.equal(nonGp.relatedPitchbooks[0].gpId, 'GP-2');
  assert.equal(nonGp.relatedPitchbooks[0].status, 'Inactive');
  assert.match(nonGp.relatedPitchbooks[0].fileUrl, /drive\.google\.com/);
  assert.equal(result.reverse.records.length, 1);
  assert.equal(result.reverse.records[0].documentId, 'DOC-1');
  assert.deepEqual(JSON.parse(JSON.stringify(result.reverse.records[0].referencingMeetings.map(item => item.meetingId))), ['MTG-2', 'MTG-1']);
  assert.equal(result.forward.records.some(item => item.meetingId === 'MTG-3'), false,
    'matching names/dates/fund text must not infer a relationship');
  const unresolved = result.forward.records.find(item => item.meetingId === 'MTG-4').relatedPitchbooks[0];
  assert.deepEqual(JSON.parse(JSON.stringify(unresolved)), {
    documentId: 'DOC-MISSING', resolutionState: 'unresolved', unresolved: true,
    unresolvedReason: 'PITCHBOOK_NOT_FOUND'
  });
  assert.equal(result.readModel.documentBodyRead, false);
  assert.equal(result.readModel.pitchbookBytesRead, false);
  assert.equal(result.readModel.auditRead, false);
  assert.deepEqual(environment._debug.calls, [
    'getInstallationState',
    'read:backend:Meeting_Index',
    'read:backend:Pitchbook_Index',
    'read:backend:GP_Master',
    'read:backend:Option_Master'
  ]);
  assert.equal(result.sideEffects.writes, 0);
  assert.equal(result.sideEffects.auditWrites, 0);
  assert.equal(JSON.stringify(result).includes('must never escape'), false);
});

test('filters apply to the correct side and use exact values', () => {
  const rows = [
    meeting('MTG-LP', { Date: new Date('2026-08-20T15:00:00.000Z'), Counterparty_Type: 'LP_ASSET_OWNER', Counterparty_ID: 'LP-1', GP_ID: '', Related_GP_IDs: 'GP-2' }),
    meeting('MTG-GP', { Date: '2026-08-20', Counterparty_Type: 'GP', Counterparty_ID: 'GP-1', Related_GP_IDs: 'GP-1', Related_Pitchbook_IDs: 'DOC-2' })
  ];
  const pitchbooks = [
    pitchbook('DOC-1', { Date: new Date('2026-08-19T15:00:00.000Z') }),
    pitchbook('DOC-2', { GP_ID: 'GP-1', Asset_Class_ID: 'AC-2', Fund_Strategy: 'Other Pitchbook Fund', Status: 'Active' })
  ];
  const environment = createEnvironment(rows, pitchbooks);
  const filtered = ksp.kspGetRelationshipExplorerData_(environment, {
    dateFrom: '2026-08-21', dateTo: '2026-08-21',
    filters: {
      counterpartyType: 'LP_ASSET_OWNER',
      counterpartyEntity: 'LP_ASSET_OWNER:LP-1',
      relatedGp: 'GP-2', pitchbookGp: 'GP-2', assetClass: 'AC-1',
      fundStrategy: 'Pitchbook Fund', meetingStatus: 'Active', pitchbookStatus: 'Inactive'
    }
  });
  assert.equal(filtered.ok, true, JSON.stringify(filtered));
  assert.equal(filtered.summary.relationships, 1);
  assert.deepEqual(filtered.forward.records.map(item => item.meetingId), ['MTG-LP']);
  assert.deepEqual(filtered.reverse.records.map(item => item.documentId), ['DOC-1']);
  assert.equal(filtered.forward.records[0].date, '2026-08-21', 'Date objects use the Tokyo Business Date');

  const exactText = ksp.kspGetRelationshipExplorerData_(environment, {
    filters: { fundStrategy: 'Pitchbook Fund' }
  });
  assert.equal(exactText.summary.relationships, 1, 'Fund / Strategy matching is exact, not fuzzy');
  assert.equal(exactText.forward.records[0].meetingId, 'MTG-LP');
  const caseChangedText = ksp.kspGetRelationshipExplorerData_(environment, {
    filters: { fundStrategy: 'pitchbook fund' }
  });
  assert.equal(caseChangedText.summary.relationships, 0, 'Fund / Strategy matching is not case-folded');

  const pitchbookOnly = ksp.kspGetRelationshipExplorerData_(environment, {
    filters: { pitchbookGp: 'GP-1' }
  });
  assert.deepEqual(pitchbookOnly.forward.records.map(item => item.meetingId), ['MTG-GP']);
  assert.equal(pitchbookOnly.summary.unresolved, 0);

  const meetingOnlyUnresolved = ksp.kspGetRelationshipExplorerData_(environment, {
    filters: { counterpartyType: 'GP', meetingStatus: 'Inactive' }
  });
  assert.equal(meetingOnlyUnresolved.summary.relationships, 0);
});

test('duplicate target IDs fail closed and inactive targets remain visible', () => {
  const environment = createEnvironment([meeting('MTG-1')], [pitchbook('DOC-1'), pitchbook('DOC-1', { Saved_Filename: 'duplicate.pdf' })]);
  const result = ksp.kspGetRelationshipExplorerData_(environment, {});
  assert.equal(result.summary.relationships, 1);
  assert.equal(result.summary.pitchbooks, 0);
  assert.equal(result.summary.unresolved, 1);
  assert.equal(result.forward.records[0].relatedPitchbooks[0].unresolvedReason, 'DUPLICATE_DOCUMENT_ID');
  assert.equal(result.reverse.totalCount, 0);
});

test('exact counts precede independent payload caps with deterministic ordering', () => {
  const pitchbooks = [
    pitchbook('DOC-3', { Date: '2026-08-03', Status: 'Active' }),
    pitchbook('DOC-2', { Date: '2026-08-02', Status: 'Active' }),
    pitchbook('DOC-1', { Date: '2026-08-01', Status: 'Active' })
  ];
  const environment = createEnvironment([
    meeting('MTG-1', { Date: '2026-08-10', Related_Pitchbook_IDs: 'DOC-3,DOC-2,DOC-1' })
  ], pitchbooks);
  const result = ksp.kspGetRelationshipExplorerData_(environment, {
    relatedLimit: 1, referencingLimit: 1, reverseLimit: 1
  });
  assert.equal(result.summary.relationships, 3);
  assert.equal(result.forward.records[0].fullRelatedPitchbookCount, 3);
  assert.equal(result.forward.records[0].relatedPitchbookCount, 3);
  assert.equal(result.forward.records[0].relatedPitchbooks.length, 1);
  assert.equal(result.forward.records[0].omittedCount, 2);
  assert.deepEqual(JSON.parse(JSON.stringify(result.forward.records[0].relatedPitchbooks.map(item => item.documentId))), ['DOC-1']);
  assert.equal(result.reverse.records[0].fullReferencingMeetingCount, 1);
  assert.equal(result.reverse.records[0].referencingMeetings.length, 1);
  assert.equal(result.forward.omittedCount, 0);
  assert.equal(result.reverse.omittedCount, 2);
});
