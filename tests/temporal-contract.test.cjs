const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { execFileSync } = require('node:child_process');

function formatDateInTimeZone(value, timezone, pattern) {
  const options = pattern === 'HH:mm'
    ? { timeZone: timezone, hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }
    : { timeZone: timezone, year: 'numeric', month: '2-digit', day: '2-digit' };
  const parts = new Intl.DateTimeFormat('en-CA', options).formatToParts(value);
  const byType = Object.fromEntries(parts.map(part => [part.type, part.value]));
  return pattern === 'HH:mm'
    ? byType.hour + ':' + byType.minute
    : byType.year + '-' + byType.month + '-' + byType.day;
}

function loadTemporalRuntime() {
  const context = vm.createContext({
    console, JSON, Object, Array, String, Number, Boolean, Date, Math, RegExp,
    Error, TypeError, Set, Map, Intl,
    Utilities: { formatDate: formatDateInTimeZone }
  });
  const sourceDir = path.join(__dirname, '..', 'src');
  fs.readdirSync(sourceDir)
    .filter(file => file.endsWith('.gs'))
    .sort()
    .forEach(file => new vm.Script(
      fs.readFileSync(path.join(sourceDir, file), 'utf8'),
      { filename: file }
    ).runInContext(context));
  return context;
}

const ksp = loadTemporalRuntime();
const repositoryRoot = path.join(__dirname, '..');

function meetingInput(overrides = {}) {
  return {
    date: '2026-08-13', time: '14:30', locationId: '', gpId: 'GP-1',
    counterpartyType: 'GP', counterpartyId: 'GP-1', relatedGpIds: 'GP-1',
    assetClassId: 'AC-1', capitalTypeId: '', teamId: '', fundStrategy: '',
    meetingTypeCodes: '', relatedPitchbookIds: '', followUpRequired: false,
    followUpNote: '', counterparty: '', internalParticipants: '',
    notes: '', ...overrides
  };
}

test('Business Date canonicalization uses Asia/Tokyo for mixed representations and boundaries', () => {
  const utcMidnight = new Date('2026-08-13T00:00:00.000Z');
  const tokyoMidnight = new Date('2026-08-12T15:00:00.000Z');
  assert.equal(ksp.kspCanonicalBusinessDate_('2026-08-13'), '2026-08-13');
  assert.equal(ksp.kspCanonicalBusinessDate_(utcMidnight), '2026-08-13');
  assert.equal(ksp.kspCanonicalBusinessDate_(tokyoMidnight), '2026-08-13');
  assert.equal(ksp.kspCanonicalBusinessDate_('2026-08-12T15:00:00.000Z'), '2026-08-13');
  assert.equal(ksp.kspCanonicalBusinessDate_('2026-01-31T15:00:00.000Z'), '2026-02-01');
  assert.equal(ksp.kspCanonicalBusinessDate_('2026-02-30'), '');
  assert.equal(ksp.kspCanonicalBusinessDate_('02/13/2026'), '');
  assert.equal(ksp.kspCanonicalBusinessDate_(new Date('invalid')), '');
});

test('Business Time canonicalization uses Asia/Tokyo for Sheets-like Date and strict ISO values', () => {
  const sheetsTime = new Date('2026-08-13T05:30:00.000Z');
  assert.equal(ksp.kspCanonicalBusinessTime_('14:30'), '14:30');
  assert.equal(ksp.kspCanonicalBusinessTime_(sheetsTime), '14:30');
  assert.equal(ksp.kspCanonicalBusinessTime_('2026-08-13T14:30:00+09:00'), '14:30');
  assert.equal(ksp.kspCanonicalBusinessTime_('2:30 PM'), '');
  assert.equal(ksp.kspCanonicalBusinessTime_(new Date('invalid')), '');
});

test('Instant canonicalization is UTC, preserves milliseconds, and rejects date-only values', () => {
  const dateValue = new Date('2026-08-13T05:30:00.123Z');
  assert.equal(ksp.kspCanonicalInstantIso_(dateValue), '2026-08-13T05:30:00.123Z');
  assert.equal(ksp.kspCanonicalInstantIso_('2026-08-13T14:30:00.123+09:00'), '2026-08-13T05:30:00.123Z');
  assert.equal(ksp.kspCanonicalInstantIso_('2026-08-13'), '');
  assert.equal(ksp.kspCanonicalInstantIso_('2026-08-13T14:30:00'), '');
  assert.equal(ksp.kspCanonicalInstantIso_(new Date('invalid')), '');
});

test('Meeting retry, search mapping, AI metadata, and export revision use the same logical temporal values', () => {
  const row = {
    Meeting_ID: 'MTG-000001', Date: new Date('2026-08-12T15:00:00.000Z'),
    Time: new Date('2026-08-13T05:30:00.000Z'), Location_ID: '', GP_ID: 'GP-1',
    Counterparty_Type: 'GP', Counterparty_ID: 'GP-1', Related_GP_IDs: 'GP-1',
    Asset_Class_ID: 'AC-1', Capital_Type_ID: '', Team_ID: '', Fund_Strategy: '',
    Meeting_Type_Codes: '', Related_Pitchbook_IDs: '', Follow_Up_Required: false,
    Follow_Up_Note: '', Counterparty: '', Internal_Participants: '',
    Saved_Filename: 'meeting', Updated_At: '2026-08-13T00:00:00.000Z',
    Status: 'Active', Doc_File_ID: 'doc-1', Doc_URL: 'https://example.test/doc-1'
  };
  const input = meetingInput();
  assert.equal(ksp.kspMeetingIndexRowMatchesRequest_(row, input, 'meeting'), true);
  assert.equal(ksp.kspMapMeetingSearchResult_(row, { gp: {}, assetClass: {}, capitalType: {}, location: {} }).date, '2026-08-13');
  assert.equal(ksp.kspMapMeetingSearchResult_(row, { gp: {}, assetClass: {}, capitalType: {}, location: {} }).time, '14:30');

  const maps = {
    gps: { 'GP-1': 'Synthetic GP' }, counterparties: { 'GP:GP-1': 'Synthetic GP' },
    assetClasses: { 'AC-1': 'Synthetic Asset Class' }, capitalTypes: {}, teams: {}
  };
  const aiSource = ksp.kspBuildMeetingAiSource_(row, maps, 'body', 'hash');
  assert.equal(aiSource.dateKey, '2026-08-13');
  const exportSource = ksp.kspBuildKnowledgeExportSource_('Meeting', row);
  const stringSource = ksp.kspBuildKnowledgeExportSource_('Meeting', {
    ...row, Date: '2026-08-13', Time: '14:30'
  });
  assert.equal(exportSource.date, '2026-08-13');
  assert.equal(exportSource.revisionToken, stringSource.revisionToken);
  assert.equal(ksp.kspBuildAuthoritativeSourceMaps_([row], []).bySourceId['MTG-000001'].date, '2026-08-13');
});

test('Pitchbook context and fingerprints are representation-independent while true date changes remain visible', () => {
  const current = {
    Date: new Date('2026-08-12T15:00:00.000Z'), GP_ID: 'GP-1',
    Asset_Class_ID: 'AC-1', Capital_Type_ID: '', Batch_ID: 'BAT-000001',
    Document_ID: 'DOC-000001', Sequence_No: 1, Original_Filename: 'source.txt',
    Saved_Filename: 'saved.txt'
  };
  const input = { date: '2026-08-13', gpId: 'GP-1', assetClassId: 'AC-1', capitalTypeId: '' };
  assert.equal(ksp.kspPitchbookContextMatchesRow_(current, input), true);
  assert.equal(ksp.kspPitchbookContextChanged_(current, input), false);
  assert.notEqual(ksp.kspCanonicalBusinessDate_('2026-08-14'), ksp.kspCanonicalBusinessDate_(current.Date));
  const sameFingerprint = ksp.kspBuildLegacyPitchbookSlotFingerprint_(current, { sizeBytes: 10, mimeType: 'text/plain' }, 10);
  const equivalentFingerprint = ksp.kspBuildLegacyPitchbookSlotFingerprint_(
    { ...current, Date: '2026-08-13' }, { sizeBytes: 10, mimeType: 'text/plain' }, 10
  );
  assert.equal(sameFingerprint, equivalentFingerprint);
});

test('Audit snapshots canonicalize Date, Time, and Instant without exposing body or follow-up content', () => {
  const before = ksp.kspMeetingAuditSnapshot_({
    Meeting_ID: 'MTG-000001', Date: new Date('2026-08-12T15:00:00.000Z'),
    Time: new Date('2026-08-13T05:30:00.000Z'), Internal_Participants: 'Before',
    Follow_Up_Note: 'private', Updated_At: new Date('2026-08-13T00:00:00.000Z'),
    Version: 1
  });
  const after = ksp.kspMeetingAuditSnapshot_({
    Meeting_ID: 'MTG-000001', Date: '2026-08-13', Time: '14:30',
    Internal_Participants: 'After', Follow_Up_Note: 'private', Updated_At: '2026-08-13T00:01:00.000Z',
    Version: 2
  });
  assert.equal(before.Date, '2026-08-13');
  assert.equal(after.Date, '2026-08-13');
  assert.equal(before.Time, '14:30');
  assert.equal(after.Time, '14:30');
  assert.deepEqual(ksp.kspChangedMetadataFields_(before, after), [
    'Internal_Participants', 'Version', 'Updated_At'
  ]);
  assert.equal(JSON.stringify({ before, after }).includes('private'), false);
  const audit = ksp.kspBuildMeetingAuditRow_({
    timestamp: '2026-08-13T00:00:00.000Z', meetingId: 'MTG-000001',
    result: 'Success', metadata: { Date: before.Date, Time: before.Time, Internal_Participants: 'After' }
  });
  assert.equal(JSON.parse(audit.After_Metadata_JSON).Date, '2026-08-13');
  assert.equal(JSON.parse(audit.After_Metadata_JSON).Time, '14:30');
});

test('the pre-fix ref fails the mixed Date/Time regression that this contract closes', () => {
  const preFixRef = '0dbe29a58c518b6bbbc2616bb2d9516a260115d7';
  const baselineMaintenance = execFileSync(
    'git', ['show', `${preFixRef}:src/100_MaintenanceCore.gs`],
    { cwd: repositoryRoot, encoding: 'utf8' }
  );
  const baselineMeeting = execFileSync(
    'git', ['show', `${preFixRef}:src/30_MeetingCore.gs`],
    { cwd: repositoryRoot, encoding: 'utf8' }
  );
  assert.match(baselineMaintenance, /getUTCHours\(\)/);
  assert.match(baselineMeeting, /String\(row\.Date \|\| ''\)/);
  assert.equal(ksp.kspMaintenanceCellText_(new Date('2026-08-13T05:30:00.000Z'), 'time'), '14:30');
  assert.equal(ksp.kspMeetingCellDate_(new Date('2026-08-12T15:00:00.000Z')), '2026-08-13');
});
