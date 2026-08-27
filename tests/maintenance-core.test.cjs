const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { ksp, catalogRows, createFakeEnvironment } = require('./maintenance-test-fixture.cjs');

test('maintenance harness uses production Meeting and private Pitchbook business helpers', () => {
  const loaderSource = fs.readFileSync(path.join(__dirname, 'maintenance-test-loader.cjs'), 'utf8');
  assert.doesNotMatch(loaderSource, /function\s+kspPitchbookContextMatchesRow\s*\(/);
  assert.doesNotMatch(loaderSource, /function\s+kspBuildPitchbookSavedFilename\s*\(/);
  assert.doesNotMatch(loaderSource, /function\s+kspNormalizeMeetingInput_\s*\(/);
  assert.doesNotMatch(loaderSource, /function\s+kspBuildMeetingCatalog_\s*\(/);
  assert.doesNotMatch(loaderSource, /function\s+kspValidateMeetingInput_\s*\(/);
  assert.match(loaderSource, /'30_MeetingCore\.gs'/);
  assert.equal(typeof ksp.kspPitchbookContextMatchesRow_, 'function');
  assert.equal(typeof ksp.kspBuildPitchbookSavedFilename_, 'function');
  assert.equal(typeof ksp.kspPitchbookContextMatchesRow, 'undefined');
  assert.equal(typeof ksp.kspBuildPitchbookSavedFilename, 'undefined');
});
test('optional search filters and date bounds work', () => {
  const search = ksp.kspValidateRecordSearch_(ksp.kspNormalizeRecordSearch_({ dateFrom: '2026-08-01', dateTo: '2026-08-31', gpId: 'GP-1' }));
  assert.equal(ksp.kspRecordMatchesSearch_({ Date: '2026-08-10', GP_ID: 'GP-1' }, search), true);
  assert.equal(ksp.kspRecordMatchesSearch_({ Date: '2026-09-01', GP_ID: 'GP-1' }, search), false);
  assert.throws(() => ksp.kspValidateRecordSearch_(ksp.kspNormalizeRecordSearch_({ dateFrom: '2026-09-01', dateTo: '2026-08-01' })), /From日付/);
});

test('Counterparty search uses exact typed entity and Related GP membership with legacy GP fallback', () => {
  const typed={Date:'2026-08-10',GP_ID:'',Counterparty_Type:'LP_ASSET_OWNER',Counterparty_ID:'OPT-CPLP-001',Related_GP_IDs:'GP-1,GP-12'};
  const exact=ksp.kspValidateRecordSearch_(ksp.kspNormalizeRecordSearch_({counterpartyType:'LP_ASSET_OWNER',counterpartyId:'OPT-CPLP-001',relatedGpId:'GP-1'}));
  assert.equal(ksp.kspRecordMatchesSearch_(typed,exact),true);
  assert.equal(ksp.kspRecordMatchesSearch_(typed,{...exact,relatedGpId:'GP'}),false);
  assert.throws(()=>ksp.kspValidateRecordSearch_(ksp.kspNormalizeRecordSearch_({counterpartyId:'OPT-CPLP-001'})),error=>error.code==='SEARCH_COUNTERPARTY_TYPE_REQUIRED');
  const legacy={Date:'2026-08-10',GP_ID:'GP-1'};
  assert.equal(ksp.kspMeetingCounterpartyType_(legacy),'GP');
  assert.equal(ksp.kspMeetingCounterpartyId_(legacy),'GP-1');
  assert.equal(ksp.kspMeetingRelatedGpIds_(legacy),'GP-1');
});

test('non-GP Option types allocate stable type-specific IDs', () => {
  assert.equal(ksp.kspNextOptionId_([], 'COUNTERPARTY_LP'),'OPT-CPLP-001');
  assert.equal(ksp.kspNextOptionId_([{Option_ID:'OPT-CPLP-004',Type:'COUNTERPARTY_LP'}], 'COUNTERPARTY_LP'),'OPT-CPLP-005');
  assert.equal(ksp.kspNextOptionId_([], 'COUNTERPARTY_OTHER'),'OPT-CPOT-001');
});

test('maintenance search normalizes spreadsheet Date and Time cells', () => {
  const search = ksp.kspValidateRecordSearch_(ksp.kspNormalizeRecordSearch_({ dateFrom: '2026-08-14', dateTo: '2026-08-15' }));
  const dateCell = new Date(Date.UTC(2026, 7, 14));
  const timeCell = new Date(Date.UTC(1899, 11, 30, 14, 30));
  assert.equal(ksp.kspRecordMatchesSearch_({ Date: dateCell }, search), true);
  const mapped = ksp.kspMapMeetingSearchResult_({ Meeting_ID: 'MTG-000001', Date: dateCell, Time: timeCell }, { gp: {}, assetClass: {}, capitalType: {}, location: {} });
  assert.equal(mapped.date, '2026-08-14');
  assert.equal(mapped.time, '14:30');
});

test('Pitchbook business dates use the configured Asia Tokyo timezone', () => {
  const utcMidnight = new Date('2026-08-13T00:00:00.000Z');
  const tokyoMidnight = new Date('2026-08-12T15:00:00.000Z');
  assert.equal(ksp.kspCanonicalPitchbookDateKey_(utcMidnight), '2026-08-13');
  assert.equal(ksp.kspCanonicalPitchbookDateKey_(tokyoMidnight), '2026-08-13');
  assert.equal(ksp.kspMaintenanceCellText_(utcMidnight, 'date'), '2026-08-13');
  assert.equal(ksp.kspMaintenanceCellText_(tokyoMidnight, 'date'), '2026-08-13');
});

test('maintenance date mapping normalizes persisted ISO date strings', () => {
  const mapped = ksp.kspMapPitchbookSearchResult_({
    Document_ID: 'DOC-000001',
    Date: '2026-08-13T00:00:00.000Z',
    GP_ID: 'GP-1',
    Asset_Class_ID: 'AC-1',
    Capital_Type_ID: ''
  }, { gp: {}, assetClass: {}, capitalType: {} });
  assert.equal(mapped.date, '2026-08-13');
});

test('Pitchbook edit validator uses production parser and preserves invalid ID rejection', () => {
  const env=createFakeEnvironment();
  const catalog=ksp.kspLoadMaintenanceContext_(env).catalog;
  const input={documentId:'DOC-000001',expectedUpdatedAt:'2026-08-01T00:00:00.000Z',date:'2026-08-01',gpId:'GP-000002',assetClassId:'OPT-AC-002',capitalTypeId:''};
  const selected=ksp.kspValidatePitchbookEditInput_(input,catalog);
  assert.equal(selected.gp.id,'GP-000002');
  assert.equal(selected.assetClass.id,'OPT-AC-002');
  assert.throws(
    () => ksp.kspValidatePitchbookEditInput_({...input,documentId:'not-a-document-id'},catalog),
    error => error && error.code === 'PITCHBOOK_DOCUMENT_ID_INVALID'
  );
});

test('search rows sort newest first and respect limit', () => {
  const rows = [{ Meeting_ID:'MTG-000001',Date:'2026-01-01',Updated_At:'a' },{ Meeting_ID:'MTG-000002',Date:'2026-02-01',Updated_At:'b' }];
  const result = ksp.kspSearchRows_(rows, { dateFrom:'',dateTo:'',gpId:'',assetClassId:'',capitalTypeId:'',status:'',limit:1 }, row=>row.Meeting_ID);
  assert.deepEqual(Array.from(result), ['MTG-000002']);
});

test('meeting document parser preserves multiline notes', () => {
  const parsed = ksp.kspParseMeetingDocumentText_('日付: 2026-08-01\nGP: KKR\nAsset Class: Infrastructure\n\n面談内容:\nline1\nline2');
  assert.equal(parsed.gpName, 'KKR');
  assert.equal(parsed.notes, 'line1\nline2');
});

test('meeting edited row increments version and contains no notes field', () => {
  const current = { Meeting_ID:'MTG-000001',Version:2,Status:'Active',AI_Index_Status:'Indexed' };
  const input = { date:'2026-08-02',time:'',locationId:'',gpId:'GP-1',assetClassId:'AC-1',capitalTypeId:'',counterparty:'',internalParticipants:'',notes:'secret' };
  const updated = ksp.kspBuildMeetingEditedRow_(current,input,'actor','now','file');
  assert.equal(updated.Version,3); assert.equal(updated.AI_Index_Status,'Pending'); assert.equal(Object.hasOwn(updated,'notes'),false);
});

test('pitchbook context change is detected and edited row preserves stable identities', () => {
  const current={Document_ID:'DOC-000001',File_ID:'file',Date:'2026-01-01',GP_ID:'GP-1',Asset_Class_ID:'AC-1',Capital_Type_ID:'',Sequence_No:1};
  const input={documentId:'DOC-000001',date:'2026-01-02',gpId:'GP-1',assetClassId:'AC-1',capitalTypeId:''};
  assert.equal(ksp.kspPitchbookContextChanged_(current,input),true);
  const updated=ksp.kspBuildPitchbookEditedRow_(current,input,'actor','now',4,'new.pdf');
  assert.equal(updated.Document_ID,'DOC-000001'); assert.equal(updated.File_ID,'file'); assert.equal(updated.Sequence_No,4);
});

test('live-like Pitchbook Date object matches unchanged normalized context', () => {
  const current={Date:new Date(Date.UTC(2026,7,1)),GP_ID:'GP-1',Asset_Class_ID:'AC-1',Capital_Type_ID:''};
  const input={date:'2026-08-01',gpId:'GP-1',assetClassId:'AC-1',capitalTypeId:''};
  assert.equal(ksp.kspPitchbookContextMatchesRow_(current,input),true);
  assert.equal(ksp.kspPitchbookContextChanged_(current,input),false);
});

test('master normalization detects NFKC and case-insensitive duplicates', () => {
  const rows=[{GP_ID:'GP-000001',GP_Name:'ＡＰＯＬＬＯ'}];
  assert.equal(ksp.kspFindNormalizedMasterDuplicate_(rows,'GP','', 'apollo','').GP_ID,'GP-000001');
  assert.equal(ksp.kspDisplayMasterName_('  KKR   Japan  '),'KKR Japan');
});

test('next stable Master IDs preserve existing maximum', () => {
  assert.equal(ksp.kspNextGpId_([{GP_ID:'GP-000009'}]),'GP-000010');
  assert.equal(ksp.kspNextOptionId_([{Option_ID:'OPT-AC-009',Type:'ASSET_CLASS'}],'ASSET_CLASS'),'OPT-AC-010');
});

test('maintenance audit snapshots exclude Meeting notes and file content', () => {
  const meeting=ksp.kspMeetingAuditSnapshot_({Meeting_ID:'MTG-000001',Notes:'secret',Doc_File_ID:'doc'});
  const pitch=ksp.kspPitchbookAuditSnapshot_({Document_ID:'DOC-000001',base64Data:'secret',File_ID:'file'});
  assert.equal(JSON.stringify(meeting).includes('secret'),false);
  assert.equal(JSON.stringify(pitch).includes('secret'),false);
});

test('Pitchbook Audit snapshots compare Date objects by logical business date', () => {
  const before = ksp.kspPitchbookAuditSnapshot_({ Date: new Date('2026-08-12T15:00:00.000Z'), Fund_Strategy: '' });
  const after = ksp.kspPitchbookAuditSnapshot_({ Date: '2026-08-13', Fund_Strategy: 'Fund Delta' });
  assert.deepEqual(Array.from(ksp.kspChangedMetadataFields_(before, after)), ['Fund_Strategy']);
});

test('five-year retention cutoff is deterministic', () => {
  assert.equal(ksp.kspAuditRetentionCutoff_('2026-08-16T00:00:00.000Z',5),'2021-08-16T00:00:00.000Z');
});
