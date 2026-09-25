const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const crypto = require('node:crypto');

const root = path.resolve(__dirname, '..');
function formatDate(value, timezone, pattern) {
  const parts = new Intl.DateTimeFormat('en-CA', pattern === 'HH:mm'
    ? { timeZone: timezone, hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }
    : { timeZone: timezone, year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(value);
  const byType = Object.fromEntries(parts.map(part => [part.type, part.value]));
  return pattern === 'HH:mm' ? `${byType.hour}:${byType.minute}` : `${byType.year}-${byType.month}-${byType.day}`;
}
function load() {
  const context = vm.createContext({ console, JSON, Object, Array, String, Number, Boolean, Date,
    Math, RegExp, Error, TypeError, Set, Map, Intl, Utilities: { formatDate,
      DigestAlgorithm: { SHA_256: 'SHA_256' }, Charset: { UTF_8: 'UTF_8' },
      computeDigest: (_algorithm, value) => Array.from(crypto.createHash('sha256').update(value, 'utf8').digest()) } });
  for (const file of ['00_Core.gs', '05_TemporalContracts.gs', '06_CounterpartyMigration.gs',
    '30_MeetingCore.gs', '60_PitchbookConstants.gs', '61_PitchbookValidation.gs',
    '62_PitchbookIdentity.gs', '100_MaintenanceCore.gs', '112_MaintenanceServiceHelpers.gs',
    '121_MaintenanceLiveHelpers.gs',
    '85_SourceRecordCore.gs', '87_SourceRecordLiveEnvironment.gs']) {
    new vm.Script(fs.readFileSync(path.join(root, 'src', file), 'utf8'), { filename: file })
      .runInContext(context);
  }
  return context;
}

function harness() {
  const ksp = load();
  const nativeDate = new Date('2026-09-24T15:00:00.000Z');
  const sheets = {
    Counterparty_Master: { rows: [{ Counterparty_ID: 'CP-000001', Counterparty_Name: 'Alpha', Counterparty_Type: 'GP', Status: 'Active' }] },
    Option_Master: { rows: [{ Option_ID: 'AC-1', Type: 'ASSET_CLASS', Name: 'Private Equity', Status: 'Active' }] },
    Meeting_Index: { rows: [] }, Pitchbook_Index: { rows: [] }, News_Index: { rows: [{
      News_ID: 'NEWS-000001', Published_Date: nativeDate, Publisher: 'Before', Title: 'Title',
      Counterparty_IDs: 'CP-000001', Asset_Class_ID: 'AC-1', Fund_Strategy: '',
      Input_Mode: 'DIRECT_TEXT', Source_File_ID: 'source-file', Status: 'Active', Version: 1,
      Updated_At: '2026-09-25T00:00:00.000Z'
    }] }, Internal_Assessment_Index: { rows: [] }
  };
  let writes = 0;
  const props = new Map();
  const spreadsheet = { getId: () => 'backend', getSheetByName: name => sheets[name] || null };
  ksp.SpreadsheetApp = { openById: () => spreadsheet };
  ksp.PropertiesService = { getScriptProperties: () => ({
    getProperty: key => props.has(key) ? props.get(key) : null,
    setProperty: (key, value) => props.set(key, value),
    deleteProperty: key => props.delete(key)
  }) };
  ksp.kspCreateMaintenanceEnvironment_ = () => ({
    getInstallationState: () => ({ resources: { backendSpreadsheetId: 'backend' } })
  });
  ksp.kspMaintenanceAcquireLock_ = () => ({ releaseLock() {} });
  ksp.kspReadHeadersFromSheet_ = sheet => Object.keys(sheet.rows[0] || {});
  ksp.kspReadObjectsFromSheet_ = sheet => sheet.rows.map(row => ({ ...row }));
  ksp.kspMaintenanceFindSheetRow_ = (_id, sheetName, key, value) => {
    const sheet = sheets[sheetName];
    const index = sheet.rows.findIndex(row => String(row[key]) === String(value));
    return index < 0 ? null : { sheet, headers: Object.keys(sheet.rows[index]),
      rowNumber: index + 2, row: { ...sheet.rows[index] } };
  };
  ksp.kspMaintenanceWriteSheetFieldsWithRollback_ = (sheet, _headers, rowNumber, fields) => {
    writes += 1; Object.assign(sheet.rows[rowNumber - 2], fields);
  };
  const env = ksp.kspCreateSourceRecordEnvironment_();
  const definition = ksp.KSP_SOURCE_RECORD_TYPES.NEWS;
  const claimKey = 'KSP_EDIT_CLAIM_NEWS_NEWS-000001';
  const claim = { claimKey, claimToken: 'claim-one', expectedToken: '1' };
  props.set(claimKey, JSON.stringify({ claimToken: 'claim-one', expiresAtMs: Date.now() + 60000 }));
  const input = { counterpartyIds: ['CP-000001'], assetClassId: 'AC-1',
    relatedMeetingIds: [], relatedDocumentIds: [], relatedNewsIds: [] };
  const updated = { ...sheets.News_Index.rows[0], Published_Date: '2026-09-25', Publisher: 'After', Version: 2 };
  return { ksp, env, definition, sheets, props, claim, input, updated, nativeDate,
    get writes() { return writes; } };
}

test('source edit commit preserves native Date cell when metadata only changes', () => {
  const h = harness();
  const result = h.env.commitClaimedSourceEdit(h.claim, h.definition, h.input, h.updated);
  assert.equal(result.Publisher, 'After');
  assert.equal(h.sheets.News_Index.rows[0].Published_Date, h.nativeDate);
  assert.equal(h.sheets.News_Index.rows[0].Version, 2);
  assert.equal(h.props.has(h.claim.claimKey), false);
  assert.equal(h.writes, 1);
});

test('uploaded source receives a usable Drive URL when upload response omits webViewLink', () => {
  const h = harness();
  h.ksp.Drive = { Files: {
    list: () => ({ files: [] }),
    create: () => ({ id: 'uploaded-source', mimeType: 'application/pdf' })
  } };
  h.ksp.Utilities.base64Decode = () => [1, 2];
  h.ksp.Utilities.newBlob = () => ({});
  const source = h.env.createOrReuseSourceFile(h.definition, 'source-folder', 'NEWS-000002', {
    inputMode: 'UPLOAD_FILE', file: { base64Data: 'AQI=', sizeBytes: 2,
      mimeType: 'application/pdf', originalFilename: 'source.pdf' }
  }, 'NEWS-000002.pdf');
  assert.equal(source.url, 'https://drive.google.com/file/d/uploaded-source/view');
});

test('source retry reuses only an original matching filename, MIME, folder and source type', () => {
  const input = { inputMode: 'UPLOAD_FILE', file: { mimeType: 'application/pdf' } };
  const hash = load().kspSourceRecordPayloadSha256_(input);
  const base = { id: 'uploaded-source', name: 'NEWS-000002.pdf', mimeType: 'application/pdf',
    parents: ['source-folder'], appProperties: { kspSourceRecordId: 'NEWS-000002',
      kspSourceType: 'NEWS', kspSourcePayloadSha256: hash } };
  for (const change of [null, { name: 'other.pdf' }, { mimeType: 'application/vnd.google-apps.document' },
    { parents: ['other-folder'] }, { appProperties: { kspSourceRecordId: 'NEWS-000002',
      kspSourceType: 'ASSESSMENT', kspSourcePayloadSha256: hash } }]) {
    const h = harness();
    let creates = 0;
    h.ksp.Drive = { Files: {
      list: () => ({ files: [{ ...base, ...change }] }),
      create: () => { creates += 1; throw new Error('unexpected create'); }
    } };
    if (change === null) {
      const reused = h.env.createOrReuseSourceFile(h.definition, 'source-folder', 'NEWS-000002', input,
        'NEWS-000002.pdf');
      assert.equal(reused.reused, true);
    } else {
      assert.throws(() => h.env.createOrReuseSourceFile(h.definition, 'source-folder', 'NEWS-000002',
        input, 'NEWS-000002.pdf'), error => error.code === 'SOURCE_FILE_CONFLICT');
    }
    assert.equal(creates, 0);
    assert.equal(h.writes, 0);
  }
});

test('partial-create retry rejects changed upload bytes and changed direct text before Index commit', () => {
  for (const mode of ['UPLOAD_FILE', 'DIRECT_TEXT']) {
    const h = harness();
    const id = 'NEWS-000002';
    const filename = mode === 'UPLOAD_FILE' ? 'NEWS-000002.pdf' : 'NEWS-000002';
    const files = [];
    let creates = 0;
    let documentText = '';
    const initial = mode === 'UPLOAD_FILE'
      ? { inputMode: mode, requestId: 'first-request', title: 'Same title',
        file: { base64Data: 'AQI=', sizeBytes: 2, mimeType: 'application/pdf', originalFilename: 'source.pdf' } }
      : { inputMode: mode, requestId: 'first-request', title: 'Same title', directText: 'Original body' };
    h.ksp.Drive = { Files: {
      list: () => ({ files: files.map(file => ({ ...file })) }),
      create: (metadata) => {
        creates += 1;
        const file = { ...metadata, id: 'authoritative-file',
          mimeType: metadata.mimeType || 'application/pdf' };
        files.push(file);
        return file;
      }
    } };
    h.ksp.Utilities.base64Decode = value => Array.from(Buffer.from(value, 'base64'));
    h.ksp.Utilities.newBlob = () => ({});
    h.ksp.DocumentApp = { openById: () => ({
      getBody: () => ({ clear() { documentText = ''; return this; },
        setText(text) { documentText = text; return this; } }),
      saveAndClose() {}
    }) };
    const first = h.env.createOrReuseSourceFile(h.definition, 'source-folder', id, initial, filename);
    assert.equal(first.reused, false);
    const same = h.env.createOrReuseSourceFile(h.definition, 'source-folder', id,
      { ...initial, requestId: 'second-request', retryRecordId: id }, filename);
    assert.equal(same.reused, true);
    const changed = mode === 'UPLOAD_FILE'
      ? { ...initial, requestId: 'third-request', retryRecordId: id,
        file: { ...initial.file, base64Data: 'AQM=' } }
      : { ...initial, requestId: 'third-request', retryRecordId: id, directText: 'Changed body' };
    assert.throws(() => h.env.createOrReuseSourceFile(h.definition, 'source-folder', id, changed,
      filename), error => error.code === 'SOURCE_FILE_CONFLICT');
    assert.equal(creates, 1);
    assert.equal(files[0].appProperties.kspSourcePayloadSha256,
      h.ksp.kspSourceRecordPayloadSha256_(initial));
    if (mode === 'DIRECT_TEXT') assert.equal(documentText, 'Original body');
    assert.equal(h.writes, 0);
  }
});

test('source edit commit rejects stale Version or deactivated master before write', () => {
  for (const change of ['stale', 'inactive-master']) {
    const h = harness();
    if (change === 'stale') h.sheets.News_Index.rows[0].Version = 2;
    else h.sheets.Counterparty_Master.rows[0].Status = 'Inactive';
    assert.throws(() => h.env.commitClaimedSourceEdit(h.claim, h.definition, h.input, h.updated),
      error => error.code === (change === 'stale' ? 'STALE_RECORD_VERSION' : 'SOURCE_COUNTERPARTY_UNAVAILABLE'));
    assert.equal(h.writes, 0);
    assert.equal(h.props.has(h.claim.claimKey), true);
  }
});

test('source reactivation validates current master and preserves native Date cell', () => {
  const h = harness();
  h.props.delete(h.claim.claimKey);
  h.sheets.News_Index.rows[0].Status = 'Inactive';
  h.sheets.Counterparty_Master.rows[0].Status = 'Inactive';
  assert.throws(() => h.env.updateSourceStatusAtomic(h.definition, 'NEWS-000001', 1,
    'Active', 'tester@example.com', '2026-09-25T00:00:01.000Z'),
  error => error.code === 'SOURCE_COUNTERPARTY_UNAVAILABLE');
  assert.equal(h.writes, 0);
  h.sheets.Counterparty_Master.rows[0].Status = 'Active';
  const restored = h.env.updateSourceStatusAtomic(h.definition, 'NEWS-000001', 1,
    'Active', 'tester@example.com', '2026-09-25T00:00:01.000Z');
  assert.equal(restored.after.Status, 'Active');
  assert.equal(h.sheets.News_Index.rows[0].Published_Date, h.nativeDate);
  assert.equal(h.writes, 1);
});
