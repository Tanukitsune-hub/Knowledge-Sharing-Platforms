const test = require('node:test');
const assert = require('node:assert/strict');
const { ksp, catalogRows, createFakeEnvironment } = require('./maintenance-test-fixture.cjs');
test('optional search filters and date bounds work', () => {
  const search = ksp.kspValidateRecordSearch(ksp.kspNormalizeRecordSearch({ dateFrom: '2026-08-01', dateTo: '2026-08-31', gpId: 'GP-1' }));
  assert.equal(ksp.kspRecordMatchesSearch({ Date: '2026-08-10', GP_ID: 'GP-1' }, search), true);
  assert.equal(ksp.kspRecordMatchesSearch({ Date: '2026-09-01', GP_ID: 'GP-1' }, search), false);
  assert.throws(() => ksp.kspValidateRecordSearch(ksp.kspNormalizeRecordSearch({ dateFrom: '2026-09-01', dateTo: '2026-08-01' })), /From日付/);
});

test('maintenance search normalizes spreadsheet Date and Time cells', () => {
  const search = ksp.kspValidateRecordSearch(ksp.kspNormalizeRecordSearch({ dateFrom: '2026-08-14', dateTo: '2026-08-15' }));
  const dateCell = new Date(Date.UTC(2026, 7, 14));
  const timeCell = new Date(Date.UTC(1899, 11, 30, 14, 30));
  assert.equal(ksp.kspRecordMatchesSearch({ Date: dateCell }, search), true);
  const mapped = ksp.kspMapMeetingSearchResult({ Meeting_ID: 'MTG-000001', Date: dateCell, Time: timeCell }, { gp: {}, assetClass: {}, capitalType: {}, location: {} });
  assert.equal(mapped.date, '2026-08-14');
  assert.equal(mapped.time, '14:30');
});

test('search rows sort newest first and respect limit', () => {
  const rows = [{ Meeting_ID:'MTG-000001',Date:'2026-01-01',Updated_At:'a' },{ Meeting_ID:'MTG-000002',Date:'2026-02-01',Updated_At:'b' }];
  const result = ksp.kspSearchRows(rows, { dateFrom:'',dateTo:'',gpId:'',assetClassId:'',capitalTypeId:'',status:'',limit:1 }, row=>row.Meeting_ID);
  assert.deepEqual(Array.from(result), ['MTG-000002']);
});

test('meeting document parser preserves multiline notes', () => {
  const parsed = ksp.kspParseMeetingDocumentText('日付: 2026-08-01\nGP: KKR\nAsset Class: Infrastructure\n\n面談内容:\nline1\nline2');
  assert.equal(parsed.gpName, 'KKR');
  assert.equal(parsed.notes, 'line1\nline2');
});

test('meeting edited row increments version and contains no notes field', () => {
  const current = { Meeting_ID:'MTG-000001',Version:2,Status:'Active',AI_Index_Status:'Indexed' };
  const input = { date:'2026-08-02',time:'',locationId:'',gpId:'GP-1',assetClassId:'AC-1',capitalTypeId:'',counterparty:'',internalParticipants:'',notes:'secret' };
  const updated = ksp.kspBuildMeetingEditedRow(current,input,'actor','now','file');
  assert.equal(updated.Version,3); assert.equal(updated.AI_Index_Status,'Pending'); assert.equal(Object.hasOwn(updated,'notes'),false);
});

test('pitchbook context change is detected and edited row preserves stable identities', () => {
  const current={Document_ID:'DOC-000001',File_ID:'file',Date:'2026-01-01',GP_ID:'GP-1',Asset_Class_ID:'AC-1',Capital_Type_ID:'',Sequence_No:1};
  const input={documentId:'DOC-000001',date:'2026-01-02',gpId:'GP-1',assetClassId:'AC-1',capitalTypeId:''};
  assert.equal(ksp.kspPitchbookContextChanged(current,input),true);
  const updated=ksp.kspBuildPitchbookEditedRow(current,input,'actor','now',4,'new.pdf');
  assert.equal(updated.Document_ID,'DOC-000001'); assert.equal(updated.File_ID,'file'); assert.equal(updated.Sequence_No,4);
});

test('master normalization detects NFKC and case-insensitive duplicates', () => {
  const rows=[{GP_ID:'GP-000001',GP_Name:'ＡＰＯＬＬＯ'}];
  assert.equal(ksp.kspFindNormalizedMasterDuplicate(rows,'GP','', 'apollo','').GP_ID,'GP-000001');
  assert.equal(ksp.kspDisplayMasterName('  KKR   Japan  '),'KKR Japan');
});

test('next stable Master IDs preserve existing maximum', () => {
  assert.equal(ksp.kspNextGpId([{GP_ID:'GP-000009'}]),'GP-000010');
  assert.equal(ksp.kspNextOptionId([{Option_ID:'OPT-AC-009',Type:'ASSET_CLASS'}],'ASSET_CLASS'),'OPT-AC-010');
});

test('maintenance audit snapshots exclude Meeting notes and file content', () => {
  const meeting=ksp.kspMeetingAuditSnapshot({Meeting_ID:'MTG-000001',Notes:'secret',Doc_File_ID:'doc'});
  const pitch=ksp.kspPitchbookAuditSnapshot({Document_ID:'DOC-000001',base64Data:'secret',File_ID:'file'});
  assert.equal(JSON.stringify(meeting).includes('secret'),false);
  assert.equal(JSON.stringify(pitch).includes('secret'),false);
});

test('five-year retention cutoff is deterministic', () => {
  assert.equal(ksp.kspAuditRetentionCutoff('2026-08-16T00:00:00.000Z',5),'2021-08-16T00:00:00.000Z');
});
