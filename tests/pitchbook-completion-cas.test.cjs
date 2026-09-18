const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { loadAi } = require('./ai-test-loader.cjs');

function fixture() {
  const api = loadAi();
  for (const file of ['60_PitchbookConstants.gs', '61_PitchbookValidation.gs', '62_PitchbookIdentity.gs',
    '63_PitchbookAudit.gs', '71_PitchbookUploadService.gs', '72_PitchbookContext.gs',
    '73_ParentRelations.gs', '84_PitchbookIndexAdapters.gs', '121_MaintenanceLiveHelpers.gs']) {
    const target = path.join(__dirname, '../src', file);
    new vm.Script(fs.readFileSync(target, 'utf8'), { filename: file }).runInContext(api);
  }
  const row = { Document_ID: 'DOC-000001', Parent_Meeting_ID: 'MTG-000001', Status: 'Pending', File_ID: '',
    File_URL: '', Updated_At: '', Updated_By: '', AI_Index_Status: 'Pending' };
  const parent = { Meeting_ID: 'MTG-000001', Status: 'Active', Version: 3, Doc_File_ID: 'synthetic-doc' };
  let held = false; let acquire = true; const writes = []; const properties = new Map();
  const claimKey = api.kspMaintenanceClaimKey_('Meeting', parent.Meeting_ID);
  const claim = { claimKey, claimToken: 'synthetic-claim', entity: 'Meeting', recordId: parent.Meeting_ID,
    expectedToken: '3', expiresAtMs: Date.now() + 60000 };
  properties.set(claimKey, JSON.stringify(claim));
  properties.set('synthetic-reservation', JSON.stringify({ fileId: 'saved-file', fileUrl: 'https://drive.test/saved' }));
  const props = { getProperty: key => { assert.equal(held, true); return properties.get(key) || null; } };
  const sheet = { getRange: () => ({ setValues: values => { assert.equal(held, true); writes.push(values); } }) };
  const parentSheet = {};
  api.LockService = { getScriptLock: () => ({ tryLock: () => { held = acquire; return acquire; }, releaseLock: () => { held = false; } }) };
  api.SpreadsheetApp = { openById: () => ({ getSheetByName: name => name === 'Meeting_Index' ? parentSheet : sheet }) };
  api.kspReadHeadersFromSheet_ = target => Object.keys(target === parentSheet ? parent : row);
  api.kspReadObjectsFromSheet_ = target => { assert.equal(held, true); return target === parentSheet ? [parent] : [row]; };
  const env = {}; api.kspAttachPitchbookIndexAdapters_(env, props);
  const expected = { parentMeetingId: parent.Meeting_ID, expectedParentVersion: 3, parentClaim: claim };
  const complete = () => env.completePitchbookRow('synthetic', row.Document_ID,
    { id: 'saved-file', url: 'https://drive.test/saved' }, 'synthetic-actor', new Date().toISOString(), expected);
  return { api, row, parent, claim, claimKey, properties, expected, complete, writes, env,
    locked: () => held, deny: () => { acquire = false; } };
}

test('completion requires exact parent identity, Active/version and live claim token/TTL inside write lock', () => {
  const cases = [
    f => { f.row.Parent_Meeting_ID = 'MTG-000002'; },
    f => { f.parent.Status = 'Inactive'; },
    f => { f.parent.Version++; },
    f => { f.parent.Meeting_ID = 'MTG-000002'; },
    f => { f.parent.Doc_File_ID = ''; },
    f => { f.properties.delete(f.claimKey); },
    f => { f.properties.set(f.claimKey, JSON.stringify({ ...f.claim, claimToken: 'replacement' })); },
    f => { f.properties.set(f.claimKey, JSON.stringify({ ...f.claim, expiresAtMs: Date.now() - 1 })); },
    f => { f.properties.set(f.claimKey, JSON.stringify({ ...f.claim, recordId: 'MTG-000002' })); },
    f => { f.expected.expectedParentVersion = 2; },
    f => { f.row.Status = 'Inactive'; }
  ];
  for (const mutate of cases) {
    const f = fixture(); mutate(f); const reservation = f.properties.get('synthetic-reservation');
    assert.throws(f.complete, e => e.code === 'PITCHBOOK_COMPLETION_CONFLICT');
    assert.equal(f.writes.length, 0); assert.equal(f.locked(), false);
    assert.equal(f.properties.get('synthetic-reservation'), reservation);
  }
});

test('valid completion preserves saved file identity and lock failure writes nothing', () => {
  const f = fixture(); const result = f.complete();
  assert.equal(result.Status, 'Active'); assert.equal(result.File_ID, 'saved-file');
  assert.equal(f.writes.length, 1); assert.equal(f.locked(), false);
  const blocked = fixture(); blocked.deny();
  assert.throws(blocked.complete, e => e.code === 'PITCHBOOK_INDEX_LOCK_TIMEOUT');
  assert.equal(blocked.writes.length, 0);
});

test('upload passes expected parent claim and skips stale failure writes after saved-file completion conflict', () => {
  const f = fixture(); const api = f.api;
  // Load all production Pitchbook helpers, not replacement business logic.
  for (const file of fs.readdirSync(path.join(__dirname, '../src')).filter(file => /^(6|7)\d_.*\.gs$/.test(file)).sort()) {
    new vm.Script(fs.readFileSync(path.join(__dirname, '../src', file), 'utf8'), { filename: file }).runInContext(api);
  }
  const file = { originalFilename: 'synthetic.txt', sizeBytes: 1, mimeType: 'text/plain' };
  Object.assign(f.row, { Batch_ID: 'BAT-000001', Original_Filename: file.originalFilename, Saved_Filename: file.originalFilename, Date: '2026-09-01' });
  const reservation = api.kspBuildPitchbookReservation_('BAT-000001', {
    parentMeetingId: f.parent.Meeting_ID, expectedParentVersion: 3, files: [file]
  }, [f.row], 1);
  let failedWrites = 0; let released = 0; let creates = 0;
  const env = {
    nowIso: () => new Date().toISOString(), getActor: () => 'synthetic-actor',
    readRows: () => [],
    getInstallationState: () => ({ config: { environment: 'DEV' }, resources: { backendSpreadsheetId: 'synthetic', auditSpreadsheetId: 'audit', pitchbooksFolderId: 'folder' } }),
    findRowByKey: (id, sheet) => sheet === 'Meeting_Index' ? f.parent : f.row,
    getPitchbookReservation: () => reservation,
    claimRecordEdit: () => ({ ...f.claim, row: { ...f.parent } }),
    releaseRecordEditClaim: () => { released++; },
    decodeBase64: () => [65], claimPitchbookUpload: () => ({ claimToken: 'upload' }),
    createOrReusePitchbookFile: () => { creates++; return { id: 'saved-file', url: 'https://drive.test/saved' }; },
    completePitchbookUploadClaim: (batch, document, token, info) => { reservation.files[0].fileId = info.id; },
    completePitchbookRow: (id, document, info, actor, now, expected) => {
      assert.equal(expected.parentMeetingId, f.parent.Meeting_ID); assert.equal(expected.expectedParentVersion, 3);
      assert.equal(expected.parentClaim.claimToken, f.claim.claimToken);
      throw Object.assign(new Error('synthetic conflict'), { code: 'PITCHBOOK_COMPLETION_CONFLICT' });
    },
    failPitchbookRow: () => { failedWrites++; }, appendRow: () => {}
  };
  const result = api.kspUploadPitchbookFile_(env, { ...file, parentMeetingId: f.parent.Meeting_ID,
    expectedParentVersion: 3, batchId: 'BAT-000001', documentId: f.row.Document_ID,
    slotFingerprint: api.kspBuildPitchbookSlotFingerprint_(f.row, reservation.files[0], 1), base64Data: 'QQ==' });
  assert.equal(result.ok, false); assert.equal(result.error.code, 'PITCHBOOK_COMPLETION_CONFLICT');
  assert.equal(failedWrites, 0); assert.equal(creates, 1); assert.equal(released, 1);
  assert.equal(reservation.files[0].fileId, 'saved-file'); assert.equal(f.row.Status, 'Pending');
});
