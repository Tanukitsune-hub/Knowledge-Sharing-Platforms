const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { ksp, createFakeEnvironment } = require('./maintenance-test-fixture.cjs');

const root = path.resolve(__dirname, '..');
const read = name => fs.readFileSync(path.join(root, 'src', name), 'utf8');
const index = read('Index.html');
const page = read('MaintenancePages.html');
const client = read('ClientMaintenance.html');
const enhancements = read('ClientMaintenanceEnhancements.html');
const styles = read('Styles.html');

function functionBody(source, name) {
  const start = source.indexOf(`function ${name}(`);
  assert.ok(start >= 0, `${name} must exist`);
  const open = source.indexOf('{', start);
  let depth = 0;
  for (let index = open; index < source.length; index += 1) {
    if (source[index] === '{') depth += 1;
    if (source[index] === '}') depth -= 1;
    if (depth === 0) return source.slice(open + 1, index);
  }
  throw new Error(`${name} body is not balanced`);
}

function functionSource(source, name) {
  const functionStart = source.indexOf(`function ${name}(`);
  assert.ok(functionStart >= 0, `${name} must exist`);
  const start = source.slice(Math.max(0, functionStart - 6), functionStart) === 'async '
    ? functionStart - 6 : functionStart;
  const open = source.indexOf('{', start);
  let depth = 0;
  for (let index = open; index < source.length; index += 1) {
    if (source[index] === '{') depth += 1;
    if (source[index] === '}') depth -= 1;
    if (depth === 0) return source.slice(start, index + 1);
  }
  throw new Error(`${name} source is not balanced`);
}

test('Meeting edit compatibility state is hidden while production submit preserves it', () => {
  assert.match(page, /class="field full" hidden aria-hidden="true"><label for="meeting-edit-relatedPitchbookIds"/);
  assert.match(page, /class="field meeting-edit-follow-up-field" hidden aria-hidden="true">/);
  assert.match(page, /class="field full meeting-edit-follow-up-note-field" hidden aria-hidden="true">/);
  assert.match(styles, /\.meeting-edit-grid>\[hidden\]\{display:none!important\}/);
  assert.match(client, /\['date','time','locationId','assetClassId','capitalTypeId','teamId','fundStrategy','followUpNote','counterparty','internalParticipants','notes'\]/);
  assert.match(client, /followUpRequired:el\('meeting-edit-followUpRequired'\)\.checked,followUpNote:el\('meeting-edit-followUpNote'\)\.value/);
  assert.match(client, /relatedPitchbookIds:selectedOptionValues\('meeting-edit-relatedPitchbookIds'\)/);
});

test('Meeting detail removes follow-up presentation and raw Document ID controls', () => {
  assert.doesNotMatch(enhancements, /\['要フォロー',record\.followUpRequired|\['フォローメモ',record\.followUpNote/);
  assert.doesNotMatch(page, /meeting-detail-documentId|既存Document_ID/);
  assert.match(page, /class="actions meeting-detail-primary-actions"[\s\S]*?meeting-detail-original[\s\S]*?meeting-detail-edit[\s\S]*?meeting-detail-lifecycle/);
  assert.match(page, /class="actions meeting-detail-related-actions"[\s\S]*?meeting-detail-link[\s\S]*?meeting-detail-add-files/);
  assert.match(styles, /\.meeting-detail-primary-actions,\.meeting-detail-related-actions\{[^}]*justify-content:flex-start/);
});

test('existing-material picker is accessible, human-readable, bounded, and relation-backed', () => {
  assert.match(index, /id="meeting-material-modal"[^>]*role="dialog"[^>]*aria-modal="true"/);
  assert.match(index, /id="meeting-material-modal-results"/);
  assert.match(enhancements, /serverCall\('searchPitchbookRecords',\{counterpartyId:record\.counterpartyId,assetClassId:record\.assetClassId,status:'Active',limit:100\}\)/);
  assert.match(enhancements, /function meetingMaterialCandidates\(records,linkedIds\)/);
  assert.match(enhancements, /function meetingMaterialCandidateLabel\(record\)/);
  assert.match(enhancements, /changeDetailRelation\(candidate\.documentId,'add'\)/);
  assert.match(enhancements, /meetingMaterialPickerState\.candidates\.filter/);
  assert.doesNotMatch(functionBody(enhancements, 'meetingMaterialCandidateLabel'), /documentId/);
});

test('existing-material picker excludes linked or inactive records and renders human labels without IDs', () => {
  const context = vm.createContext({ Set, String, Array });
  vm.runInContext(`${functionSource(enhancements, 'meetingMaterialCandidates')}\n${functionSource(enhancements, 'meetingMaterialCandidateLabel')}`, context);
  const records = [
    { documentId: 'DOC-LINKED', status: 'Active', date: '2026-09-01', savedFilename: 'linked.pdf' },
    { documentId: 'DOC-INACTIVE', status: 'Inactive', date: '2026-09-02', savedFilename: 'inactive.pdf' },
    { documentId: 'DOC-CANDIDATE', status: 'Active', date: '2026-09-03', savedFilename: 'candidate.pdf', fundStrategy: 'Fund Alpha', assetClassName: 'Infrastructure' }
  ];
  const candidates = context.meetingMaterialCandidates(records, ['DOC-LINKED']);
  assert.deepEqual(JSON.parse(JSON.stringify(candidates)), [records[2]]);
  const label = context.meetingMaterialCandidateLabel(candidates[0]);
  assert.equal(label, '2026-09-03 / candidate.pdf / Fund / Strategy: Fund Alpha / アセットクラス: Infrastructure');
  assert.doesNotMatch(label, /DOC-CANDIDATE/);
});

test('picker selection passes the selected internal ID through the existing relation path exactly once', async () => {
  const calls = [];
  const state = { open: true, busy: false, candidates: [{ documentId: 'DOC-INTERNAL-040' }] };
  const context = vm.createContext({
    Number,
    document: { querySelectorAll() { return []; } },
    el() { return { setAttribute() {} }; },
    meetingMaterialPickerState: state,
    meetingMaterialPickerStatus() {},
    renderMeetingMaterialCandidates() {},
    async changeDetailRelation(documentId, operation) { calls.push({ documentId, operation }); return true; },
    kspSetActionBusy(button, busy, label) { if (button) { button.disabled = busy; button.busyLabel = busy ? label : ''; } },
    kspSetRegionBusy(region, busy) { if (region && typeof region.setAttribute === 'function') region.setAttribute('aria-busy', String(busy)); },
    closeMeetingMaterialPicker() { state.open = false; }
  });
  vm.runInContext(functionSource(enhancements, 'selectMeetingMaterialCandidate'), context);
  await context.selectMeetingMaterialCandidate(0);
  assert.deepEqual(calls, [{ documentId: 'DOC-INTERNAL-040', operation: 'add' }]);
  assert.equal(state.open, false);
  assert.equal(state.busy, false);
});

test('existing detail add-files and unlink/relink handlers remain wired and mobile rows wrap safely', () => {
  assert.match(enhancements, /el\('meeting-detail-add-files'\)\.onclick=/);
  assert.match(enhancements, /data-detail-relation/);
  assert.match(enhancements, /changeDetailRelation\(relation\.dataset\.detailRelation,relation\.dataset\.operation\)/);
  assert.match(styles, /\.actions\{[^}]*flex-wrap:wrap/);
  assert.match(styles, /@media\(max-width:720px\)[\s\S]*\.meeting-material-candidate\{grid-template-columns:1fr\}/);
});

test('unrelated Meeting edit preserves historical follow-up and related material values', () => {
  const meeting = {
    Meeting_ID: 'MTG-000040', Date: '2026-09-20', Time: '10:00', Location_ID: 'OPT-LOC-001',
    GP_ID: '', Counterparty_ID: 'CP-000002', Counterparty_Type: 'GP', Related_GP_IDs: '',
    Asset_Class_ID: 'OPT-AC-002', Capital_Type_ID: 'OPT-CT-001', Team_ID: 'OPT-TEAM-001',
    Fund_Strategy: 'Synthetic Fund', Meeting_Type_Codes: 'ANNUAL_REVIEW',
    Related_Pitchbook_IDs: 'DOC-000001', Follow_Up_Required: true, Follow_Up_Note: 'legacy private follow-up',
    Counterparty: 'Synthetic Person', Internal_Participants: 'Before', Doc_File_ID: 'doc-40',
    Doc_URL: 'https://example/doc-40', Saved_Filename: 'synthetic', Status: 'Active', Version: 1,
    Updated_At: '2026-09-20T00:00:00.000Z', Updated_By: 'old', AI_Index_Status: 'Indexed', AI_Last_Error: ''
  };
  const env = createFakeEnvironment({
    meetingRows: [meeting],
    documents: { 'doc-40': { name: 'synthetic', text: '日付: 2026-09-20\n\n面談内容:\nsynthetic body' } }
  });
  const opened = ksp.kspGetMeetingMaintenanceRecord_(env, meeting.Meeting_ID);
  assert.equal(opened.ok, true, JSON.stringify(opened));
  const record = opened.record;
  const updated = ksp.kspUpdateMeetingMaintenance_(env, {
    meetingId: record.meetingId,
    expectedVersion: record.version,
    date: record.date,
    time: record.time,
    locationId: record.locationId,
    counterpartyId: record.counterpartyId,
    assetClassId: record.assetClassId,
    capitalTypeId: record.capitalTypeId,
    teamId: record.teamId,
    fundStrategy: record.fundStrategy,
    meetingTypeCodes: record.meetingTypeCodes,
    relatedPitchbookIds: record.relatedPitchbookIds,
    followUpRequired: record.followUpRequired,
    followUpNote: record.followUpNote,
    counterparty: record.counterparty,
    internalParticipants: 'After',
    notes: record.notes
  });
  assert.equal(updated.ok, true, JSON.stringify(updated));
  const stored = env._debug.meetingRows[0];
  assert.equal(stored.Follow_Up_Required, true);
  assert.equal(stored.Follow_Up_Note, 'legacy private follow-up');
  assert.equal(stored.Related_Pitchbook_IDs, 'DOC-000001');
  assert.equal(stored.Internal_Participants, 'After');
});
