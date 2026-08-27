const test = require('node:test');
const assert = require('node:assert/strict');
const { ksp } = require('./maintenance-test-loader.cjs');

const gps = [
  { GP_ID: 'GP-1', GP_Name: 'Synthetic GP', Status: 'Active' },
  { GP_ID: 'GP-2', GP_Name: 'Historical GP', Status: 'Inactive' }
];
const options = [
  { Option_ID: 'AC-1', Type: 'ASSET_CLASS', Name: 'Infrastructure', Sort_Order: 1, Status: 'Active' },
  { Option_ID: 'CT-1', Type: 'CAPITAL_TYPE', Name: 'Equity', Sort_Order: 1, Status: 'Active' },
  { Option_ID: 'TEAM-1', Type: 'TEAM', Name: 'PD', Sort_Order: 1, Status: 'Active' }
];

function meeting(index, overrides = {}) {
  return {
    Meeting_ID: `MTG-${String(index).padStart(6, '0')}`,
    Date: `2026-08-${String(Math.min(index, 28)).padStart(2, '0')}`,
    GP_ID: 'GP-1', Asset_Class_ID: 'AC-1', Capital_Type_ID: 'CT-1', Team_ID: 'TEAM-1',
    Fund_Strategy: index % 2 ? 'Fund Alpha' : '', Meeting_Type_Codes: 'ANNUAL_REVIEW,OFFICE_VISIT',
    Related_Pitchbook_IDs: '', Follow_Up_Required: false, Follow_Up_Note: '',
    Doc_File_ID: `doc-${index}`, Doc_URL: `https://docs.google.com/document/d/doc-${index}/edit`, Saved_Filename: `meeting-${index}`,
    Status: 'Active', Version: 1, Notes: 'must never escape', ...overrides
  };
}
function pitchbook(index, overrides = {}) {
  return {
    Document_ID: `DOC-${String(index).padStart(6, '0')}`,
    Date: `2026-08-${String(Math.min(index, 28)).padStart(2, '0')}`,
    GP_ID: 'GP-1', Asset_Class_ID: 'AC-1', Capital_Type_ID: 'CT-1',
    Fund_Strategy: index % 2 ? 'Fund Alpha' : '', File_ID: `file-${index}`, Saved_Filename: `pitchbook-${index}.pdf`,
    File_URL: `https://drive.google.com/file/d/file-${index}/view`, Status: 'Active',
    Binary_Content: 'must never escape', ...overrides
  };
}

test('GP Workspace requires one known stable GP and allows Inactive GP history', () => {
  assert.equal(ksp.kspBuildGpWorkspaceData_('GP-2', gps, options, [], []).gp.status, 'Inactive');
  assert.throws(() => ksp.kspBuildGpWorkspaceData_('', gps, options, [], []), error => error.code === 'GP_WORKSPACE_GP_REQUIRED');
  assert.throws(() => ksp.kspBuildGpWorkspaceData_('missing', gps, options, [], []), error => error.code === 'GP_WORKSPACE_GP_NOT_FOUND');
  assert.throws(() => ksp.kspBuildGpWorkspaceData_('GP-1', [...gps, gps[0]], options, [], []), error => error.code === 'DUPLICATE_KEY_ROWS');
});

test('GP Workspace computes full counts, caps lists, normalizes dates, and resolves relationships', () => {
  const meetings = Array.from({ length: 25 }, (_, index) => meeting(index + 1));
  meetings[24].Date = new Date('2026-08-28T15:00:00.000Z');
  meetings[24].Follow_Up_Required = true;
  meetings[24].Follow_Up_Note = 'Synthetic follow-up';
  meetings[24].Related_Pitchbook_IDs = 'DOC-000025,DOC-UNKNOWN';
  meetings[23].Follow_Up_Required = true;
  meetings[23].Status = 'Inactive';
  meetings.push(meeting(30, { GP_ID: 'GP-2', Date: '2026-09-01' }));
  const pitchbooks = Array.from({ length: 25 }, (_, index) => pitchbook(index + 1));
  pitchbooks[24].Status = 'Inactive';

  const result = ksp.kspBuildGpWorkspaceData_('GP-1', gps, options, meetings, pitchbooks);
  assert.equal(result.summary.meetingTotal, 25);
  assert.equal(result.summary.meetingActive, 24);
  assert.equal(result.summary.pitchbookTotal, 25);
  assert.equal(result.summary.pitchbookActive, 24);
  assert.equal(result.summary.activeFollowUpCount, 1);
  assert.equal(result.summary.lastMeetingDate, '2026-08-29');
  assert.equal(result.recentMeetings.length, 20);
  assert.equal(result.recentPitchbooks.length, 20);
  assert.equal(result.omittedCounts.recentMeetings, 5);
  assert.equal(result.omittedCounts.recentPitchbooks, 5);
  assert.equal(result.followUps.length, 1);
  assert.equal(result.followUps[0].followUpNote, 'Synthetic follow-up');
  assert.equal(result.fundStrategies.length, 1);
  assert.deepEqual(JSON.parse(JSON.stringify(result.fundStrategies[0])), {
    text: 'Fund Alpha', meetingCount: 13, pitchbookCount: 13, latestDate: '2026-08-29'
  });
  assert.equal(result.relationships.length, 1);
  assert.equal(result.relationships[0].pitchbooks[0].status, 'Inactive');
  assert.equal(result.relationships[0].pitchbooks[1].unresolved, true);
  assert.equal(JSON.stringify(result).includes('must never escape'), false);
  assert.equal(Object.hasOwn(result.recentMeetings[0], 'notes'), false);
  assert.equal(Object.hasOwn(result.recentMeetings[0], 'followUpNote'), false);
  assert.equal(Object.hasOwn(result.recentPitchbooks[0], 'binaryContent'), false);
});

test('GP Workspace preserves legacy blanks and strips unsafe source links', () => {
  const result = ksp.kspBuildGpWorkspaceData_('GP-1', gps, options, [meeting(1, {
    Team_ID: '', Fund_Strategy: '', Meeting_Type_Codes: '', Related_Pitchbook_IDs: '',
    Follow_Up_Required: '', Follow_Up_Note: '', Doc_URL: 'javascript:alert(1)'
  })], [pitchbook(1, { Fund_Strategy: '', File_URL: 'https://example.invalid/private' })]);
  assert.equal(result.recentMeetings[0].teamName, '');
  assert.deepEqual(Array.from(result.recentMeetings[0].meetingTypeLabels), []);
  assert.equal(result.recentMeetings[0].documentUrl, '');
  assert.equal(result.recentPitchbooks[0].fileUrl, '');
  assert.equal(result.fundStrategies.length, 0);
});

test('GP Workspace accepts only Google links that identify the stored source file', () => {
  const result = ksp.kspBuildGpWorkspaceData_('GP-1', gps, options, [meeting(1, {
    Doc_URL: 'https://docs.google.com/document/d/doc-other/edit'
  })], [pitchbook(1, { File_URL: 'https://drive.google.com/open?id=file-1-extra' })]);
  assert.equal(result.recentMeetings[0].documentUrl, '');
  assert.equal(result.recentPitchbooks[0].fileUrl, '');
});

test('GP Workspace does not merge distinct Fund / Strategy text or guess duplicate relationship targets', () => {
  const result = ksp.kspBuildGpWorkspaceData_('GP-1', gps, options, [meeting(1, {
    Fund_Strategy: 'Fund Alpha', Related_Pitchbook_IDs: 'DOC-000001'
  })], [pitchbook(1, { Fund_Strategy: 'fund alpha' }), pitchbook(1, { Saved_Filename: 'duplicate.pdf' })]);
  assert.equal(result.fundStrategies.length, 2);
  assert.equal(result.relationships[0].pitchbooks[0].unresolved, true);
});

test('GP Workspace resolves an existing relationship against all Pitchbooks, not only the selected GP set', () => {
  const result = ksp.kspBuildGpWorkspaceData_('GP-1', gps, options, [meeting(1, {
    Related_Pitchbook_IDs: 'DOC-000001'
  })], [pitchbook(1, { GP_ID: 'GP-2', Status: 'Inactive' })]);
  assert.equal(result.relationships[0].pitchbooks[0].unresolved, false);
  assert.equal(result.relationships[0].pitchbooks[0].status, 'Inactive');
  assert.equal(result.recentPitchbooks.length, 0);
});

test('GP Workspace endpoint performs exactly four authoritative reads and no writes or Audit/AI calls', () => {
  const calls = [];
  const rows = { GP_Master: gps, Option_Master: options, Meeting_Index: [meeting(1)], Pitchbook_Index: [pitchbook(1)] };
  const environment = {
    getInstallationState() { calls.push('getInstallationState'); return { resources: { backendSpreadsheetId: 'backend' } }; },
    readRows(id, sheet) { calls.push(`read:${id}:${sheet}`); return rows[sheet].map(row => ({ ...row })); }
  };
  const result = ksp.kspGetGpWorkspaceData_(environment, 'GP-1');
  assert.equal(result.ok, true);
  assert.deepEqual(calls, ['getInstallationState', 'read:backend:GP_Master', 'read:backend:Option_Master', 'read:backend:Meeting_Index', 'read:backend:Pitchbook_Index']);
  const safeFailure = ksp.kspGetGpWorkspaceData_(environment, 'unknown');
  assert.deepEqual(JSON.parse(JSON.stringify(safeFailure)), { ok: false, error: { code: 'GP_WORKSPACE_GP_NOT_FOUND', message: '指定されたGPを確認できません。' } });
});
