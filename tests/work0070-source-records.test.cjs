const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
function formatDate(value, timezone, pattern) {
  const parts = new Intl.DateTimeFormat('en-CA', pattern === 'HH:mm'
    ? { timeZone: timezone, hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }
    : { timeZone: timezone, year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(value);
  const byType = Object.fromEntries(parts.map(part => [part.type, part.value]));
  return pattern === 'HH:mm' ? `${byType.hour}:${byType.minute}` : `${byType.year}-${byType.month}-${byType.day}`;
}
function loadSource() {
  const context = vm.createContext({ console, JSON, Object, Array, String, Number, Boolean, Date,
    Math, RegExp, Error, TypeError, Set, Map, Intl, Utilities: { formatDate } });
  for (const file of ['00_Core.gs', '05_TemporalContracts.gs', '06_CounterpartyMigration.gs',
    '30_MeetingCore.gs', '60_PitchbookConstants.gs', '61_PitchbookValidation.gs',
    '62_PitchbookIdentity.gs', '100_MaintenanceCore.gs', '112_MaintenanceServiceHelpers.gs',
    '85_SourceRecordCore.gs', '86_SourceRecordService.gs', '87_SourceRecordLiveEnvironment.gs',
    '88_SourceRecordMaintenance.gs']) {
    new vm.Script(fs.readFileSync(path.join(root, 'src', file), 'utf8'), { filename: file })
      .runInContext(context);
  }
  return context;
}
const ksp = loadSource();

function fakeEnvironment(options = {}) {
  const rows = {
    Counterparty_Master: [
      { Counterparty_ID: 'CP-000001', Counterparty_Name: 'Alpha', Counterparty_Type: 'GP', Status: 'Active' },
      { Counterparty_ID: 'CP-000002', Counterparty_Name: 'Beta', Counterparty_Type: 'LP', Status: 'Active' },
      { Counterparty_ID: 'CP-000003', Counterparty_Name: 'Inactive', Counterparty_Type: 'GP', Status: 'Inactive' }
    ],
    Option_Master: [{ Option_ID: 'AC-1', Type: 'ASSET_CLASS', Name: 'Private Equity', Sort_Order: 1, Status: 'Active' }],
    Meeting_Index: [{ Meeting_ID: 'MTG-000001', Status: 'Active' }],
    Pitchbook_Index: [{ Document_ID: 'DOC-000001', Status: 'Active' }],
    News_Index: [], Internal_Assessment_Index: [], Audit_Log: []
  };
  const counter = { NEWS: 1, ASSESSMENT: 1 };
  const requests = new Map();
  const files = new Map();
  const claims = new Map();
  let clock = 0;
  const environment = {
    nowIso() { clock += 1; return `2026-09-25T00:00:${String(clock).padStart(2, '0')}.000Z`; },
    getActor() { return options.actor || 'tester@example.com'; },
    getInstallationState() { return { resources: { backendSpreadsheetId: 'backend', auditSpreadsheetId: 'audit',
      newsFolderId: 'news-folder', internalAssessmentsFolderId: 'assessment-folder' } }; },
    readRows(_id, sheetName) { return rows[sheetName].map(row => ({ ...row })); },
    findRowByKey(_id, sheetName, key, value) { return rows[sheetName].find(row => row[key] === value) || null; },
    reserveSourceId(definition, _backend, input, actor, fingerprint) {
      const key = `${definition.key}:${input.requestId}`;
      if (input.requestId && requests.has(key)) {
        const prior = requests.get(key);
        ksp.kspAssert_(prior.fingerprint === fingerprint && prior.actor === actor,
          'SOURCE_RETRY_CONFLICT', 'Request changed');
        return prior.id;
      }
      if (input.retryRecordId) {
        ksp.kspAssert_(input.retryFingerprint === fingerprint, 'SOURCE_RETRY_CONFLICT', 'Retry changed');
        return input.retryRecordId;
      }
      const id = ksp.kspSourceRecordId_(definition, counter[definition.key]++);
      if (input.requestId) requests.set(key, { id, fingerprint, actor });
      return id;
    },
    claimSourceCreate(_definition, id) {
      ksp.kspAssert_(!claims.has(id), 'SOURCE_CREATE_IN_PROGRESS', 'Busy');
      claims.set(id, true); return { id };
    },
    releaseSourceCreate(claim) { claims.delete(claim.id); },
    createOrReuseSourceFile(_definition, _folder, id, input, filename) {
      if (files.has(id)) return { ...files.get(id), reused: true };
      if (options.onFileCreate) options.onFileCreate({ id, environment });
      if (input.file) ksp.kspAssert_(Buffer.from(input.file.base64Data, 'base64').length === input.file.sizeBytes,
        'SOURCE_FILE_SIZE_MISMATCH', 'Size mismatch');
      const file = { id: `FILE-${id}`, url: `https://drive.google.com/file/d/FILE-${id}/view`,
        filename, body: input.directText || '', bytes: input.file ? input.file.base64Data : '',
        payload: ksp.kspSourceRecordPayloadJson_(input) };
      files.set(id, file); return { ...file, reused: false };
    },
    assertSourceFilePayload(_definition, _folder, id, input, filename, fileId) {
      const file = files.get(id);
      ksp.kspAssert_(file && file.id === fileId && file.filename === filename &&
        file.payload === ksp.kspSourceRecordPayloadJson_(input),
      'SOURCE_FILE_CONFLICT', 'Different saved source');
    },
    commitSourceRow(definition, input, row) {
      if (options.beforeCommit) options.beforeCommit({ rows, definition, input });
      ksp.kspValidateSourceMasterReferences_(definition, input,
        rows.Counterparty_Master, rows.Option_Master,
        { meetings: rows.Meeting_Index, documents: rows.Pitchbook_Index, news: rows.News_Index });
      const existing = rows[definition.sheetName].find(item => item[definition.idField] === row[definition.idField]);
      if (existing) {
        ksp.kspAssert_(ksp.kspSourceRowMatchesCreate_(definition, existing, row),
          'SOURCE_RETRY_CONFLICT', 'Different row');
        return { row: existing, inserted: false };
      }
      rows[definition.sheetName].push({ ...row }); return { row, inserted: true };
    },
    getDocumentText(fileId) { return [...files.values()].find(file => file.id === fileId)?.body || ''; },
    getDocumentSnapshot(fileId) { const file = [...files.values()].find(item => item.id === fileId); return { text: file.body, name: file.filename }; },
    updateMeetingDocument(fileId, name, text) { const file = [...files.values()].find(item => item.id === fileId); file.filename = name; file.body = text; },
    restoreDocumentSnapshot(fileId, snapshot) { const file = [...files.values()].find(item => item.id === fileId); file.filename = snapshot.name; file.body = snapshot.text; },
    appendRow(_id, _sheetName, row) { if (options.auditFailure) throw new Error('Audit unavailable'); rows.Audit_Log.push({ ...row }); },
    claimRecordEdit(kind, id, sheet, key, _token, expectedVersion) {
      const row = rows[sheet].find(item => item[key] === id);
      ksp.kspAssert_(row && Number(row.Version) === Number(expectedVersion),
        'STALE_RECORD_VERSION', 'Stale');
      ksp.kspAssert_(!claims.has(id), 'RECORD_EDIT_IN_PROGRESS', 'Busy');
      claims.set(id, true); return { id, row: { ...row }, expectedVersion };
    },
    isRecordEditClaimOwned(claim) { return claims.has(claim.id); },
    releaseRecordEditClaim(claim) { claims.delete(claim.id); },
    commitClaimedSourceEdit(claim, definition, input, updated) {
      const row = rows[definition.sheetName].find(item => item[definition.idField] === claim.id);
      ksp.kspAssert_(Number(row.Version) === Number(claim.expectedVersion), 'STALE_RECORD_VERSION', 'Stale');
      ksp.kspValidateSourceMasterReferences_(definition, input,
        rows.Counterparty_Master, rows.Option_Master,
        { meetings: rows.Meeting_Index, documents: rows.Pitchbook_Index, news: rows.News_Index });
      Object.assign(row, updated); claims.delete(claim.id); return { ...row };
    },
    updateSourceStatusAtomic(definition, id, expectedVersion, targetStatus, actor, nowIso) {
      const row = rows[definition.sheetName].find(item => item[definition.idField] === id);
      ksp.kspAssert_(row && Number(row.Version) === Number(expectedVersion),
        'STALE_RECORD_VERSION', 'Stale');
      if (targetStatus === 'Active') ksp.kspAssert_(row.Source_File_ID,
        'SOURCE_AUTHORITATIVE_FILE_MISSING', 'Missing file');
      const before = { ...row };
      Object.assign(row, { Status: targetStatus, Version: Number(row.Version) + 1,
        Updated_By: actor, Updated_At: nowIso });
      return { before, after: { ...row } };
    },
    debug: { rows, files, counter, requests, claims }
  };
  return environment;
}

function newsInput(overrides = {}) {
  return { requestId: 't1790294400000_newsrequest001', inputMode: 'DIRECT_TEXT', date: '2026-09-25',
    publisher: 'Industry Journal', title: 'Fund update', counterpartyIds: ['CP-000002', 'CP-000001', 'CP-000002'],
    assetClassId: 'AC-1', directText: 'News source body', ...overrides };
}
function assessmentInput(overrides = {}) {
  return { requestId: 't1790294400000_assessmentrequest001', inputMode: 'DIRECT_TEXT', date: '2026-09-25',
    assessmentType: 'IC_DECISION', title: 'Investment view', counterpartyIds: ['CP-000001'],
    relatedMeetingIds: ['MTG-000001'], directText: 'Assessment source body', ...overrides };
}
function uploadFile(name = 'source.pdf', mimeType = 'application/pdf') {
  const bytes = Buffer.from('synthetic source');
  return { originalFilename: name, sizeBytes: bytes.length, mimeType, base64Data: bytes.toString('base64') };
}

test('bootstrap derives six uploader formats and five stable Assessment codes', () => {
  const result = ksp.kspGetSourceRecordBootstrapData_(fakeEnvironment());
  assert.equal(result.ok, true);
  assert.deepEqual(Array.from(result.uploadFormats, item => item.extension), ['pdf', 'pptx', 'xlsx', 'docx', 'txt', 'eml']);
  assert.deepEqual(Array.from(result.uploadFormats.find(item => item.extension === 'eml').acceptedMimeTypes),
    ['message/rfc822', 'application/octet-stream', 'text/plain']);
  assert.equal(result.assessmentTypes.length, 5);
  assert.deepEqual(Array.from(result.options.counterparties, item => item.id), ['CP-000001', 'CP-000002']);
});

test('News and Assessment enforce 255-character title and publisher limits on create and edit', () => {
  const env = fakeEnvironment();
  const title255 = 'T'.repeat(255), publisher255 = 'P'.repeat(255);
  const created = ksp.kspRegisterSourceRecord_(env, 'NEWS', newsInput({ title: title255, publisher: publisher255 }));
  assert.equal(created.ok, true, JSON.stringify(created));
  const edited = ksp.kspUpdateSourceMaintenance_(env, 'NEWS', {
    newsId: created.record.newsId, expectedVersion: 1, title: title255, publisher: publisher255
  });
  assert.equal(edited.ok, true, JSON.stringify(edited));
  for (const [field, value, code] of [
    ['title', 'T'.repeat(256), 'SOURCE_TITLE_INVALID'],
    ['publisher', 'P'.repeat(256), 'NEWS_PUBLISHER_REQUIRED']
  ]) {
    const failedCreate = ksp.kspRegisterSourceRecord_(fakeEnvironment(), 'NEWS', newsInput({ [field]: value }));
    assert.equal(failedCreate.ok, false);
    assert.equal(failedCreate.error.code, code);
    const failedEdit = ksp.kspUpdateSourceMaintenance_(env, 'NEWS', {
      newsId: created.record.newsId, expectedVersion: 2, [field]: value
    });
    assert.equal(failedEdit.ok, false);
    assert.equal(failedEdit.error.code, code);
  }
  assert.equal(env.debug.rows.News_Index[0].Version, 2);
  assert.equal(env.debug.rows.News_Index[0].Title, title255);
  assert.equal(env.debug.rows.News_Index[0].Publisher, publisher255);
  const assessmentEnv = fakeEnvironment();
  const assessment = ksp.kspRegisterSourceRecord_(assessmentEnv, 'ASSESSMENT', assessmentInput({ title: title255 }));
  assert.equal(assessment.ok, true, JSON.stringify(assessment));
  const assessmentEdit = ksp.kspUpdateSourceMaintenance_(assessmentEnv, 'ASSESSMENT', {
    assessmentId: assessment.record.assessmentId, expectedVersion: 1, title: title255
  });
  assert.equal(assessmentEdit.ok, true, JSON.stringify(assessmentEdit));
  assert.equal(ksp.kspRegisterSourceRecord_(fakeEnvironment(), 'ASSESSMENT',
    assessmentInput({ title: 'T'.repeat(256) })).error.code, 'SOURCE_TITLE_INVALID');
  const rejectedEdit = ksp.kspUpdateSourceMaintenance_(assessmentEnv, 'ASSESSMENT', {
    assessmentId: assessment.record.assessmentId, expectedVersion: 2, title: 'T'.repeat(256)
  });
  assert.equal(rejectedEdit.error.code, 'SOURCE_TITLE_INVALID');
  assert.equal(assessmentEnv.debug.rows.Internal_Assessment_Index[0].Version, 2);
});

test('new source validation and retry failures have safe actionable public messages', () => {
  const expected = {
    SOURCE_TITLE_INVALID: 'タイトルを1〜255文字で入力してください。',
    NEWS_PUBLISHER_REQUIRED: '発行元を1〜255文字で入力してください。',
    SOURCE_REQUEST_EXPIRED: '登録操作の期限が切れました。もう一度お試しください。',
    SOURCE_COUNTERPARTY_UNAVAILABLE: '選択した面談先を確認してください。',
    SOURCE_REFERENCE_UNAVAILABLE: '関連記録が見つからないか、利用できません。',
    SOURCE_UPLOAD_MIME_MISMATCH: 'ファイルの形式を確認してください。',
    SOURCE_FILE_CONFLICT: '保存済み原本と入力内容が一致しません。内容を確認して再試行してください。',
    SOURCE_RETRY_CONFLICT: '前回の登録内容と一致しません。入力内容を確認してください。',
    SOURCE_MASTER_UNAVAILABLE: '選択した面談先または項目を確認してください。',
    ASSESSMENT_TYPE_INVALID: '評価種別を選択してください。'
  };
  for (const [code, message] of Object.entries(expected)) {
    assert.equal(ksp.kspSafePublicErrorMessage_(code, 'MAINTENANCE'), message);
    assert.doesNotMatch(message, /[A-Z]{3,}-\d+|https?:|[\\/]|stack|query/i);
  }
  assert.equal(ksp.kspSafePublicErrorMessage_('SOURCE_UNKNOWN_INTERNAL', 'MAINTENANCE'),
    '管理処理を完了できませんでした。');
});

test('News direct registration persists one canonical multi-Entity row and replays without duplicate', () => {
  const env = fakeEnvironment();
  const first = ksp.kspRegisterSourceRecord_(env, 'NEWS', newsInput());
  assert.equal(first.ok, true, JSON.stringify(first));
  assert.equal(first.record.newsId, 'NEWS-000001');
  assert.deepEqual(Array.from(first.record.counterpartyIds), ['CP-000001', 'CP-000002']);
  assert.equal(env.debug.rows.News_Index[0].Counterparty_IDs, 'CP-000001,CP-000002');
  const replay = ksp.kspRegisterSourceRecord_(env, 'NEWS', newsInput());
  assert.equal(replay.ok, true, JSON.stringify(replay));
  assert.equal(replay.idempotentReplay, true);
  assert.equal(env.debug.rows.News_Index.length, 1);
  assert.equal(env.debug.files.size, 1);
  assert.equal(JSON.stringify(env.debug.rows.Audit_Log).includes('News source body'), false);
});

test('News upload keeps original bytes and rejects extension/MIME mismatch', () => {
  const env = fakeEnvironment();
  const bad = ksp.kspRegisterSourceRecord_(env, 'NEWS', newsInput({ inputMode: 'UPLOAD_FILE',
    directText: '', file: uploadFile('source.pdf', 'text/plain') }));
  assert.equal(bad.ok, false);
  assert.equal(bad.error.code, 'SOURCE_UPLOAD_MIME_MISMATCH');
  assert.equal(env.debug.rows.News_Index.length, 0);
  const good = ksp.kspRegisterSourceRecord_(env, 'NEWS', newsInput({ inputMode: 'UPLOAD_FILE',
    directText: '', file: uploadFile() }));
  assert.equal(good.ok, true, JSON.stringify(good));
  assert.equal(good.record.inputMode, 'UPLOAD_FILE');
  assert.equal(env.debug.rows.News_Index[0].Source_Mime_Type, 'application/pdf');
  assert.equal(env.debug.files.get(good.record.newsId).bytes, uploadFile().base64Data);
  const eml = ksp.kspRegisterSourceRecord_(env, 'NEWS', newsInput({
    requestId: 't1790294400000_newsrequest003', inputMode: 'UPLOAD_FILE', directText: '',
    file: uploadFile('source.eml', 'text/plain')
  }));
  assert.equal(eml.ok, true, JSON.stringify(eml));
});

test('committed upload replay rejects changed bytes with a new request ID and reused record ID', () => {
  const env = fakeEnvironment();
  const initial = newsInput({ inputMode: 'UPLOAD_FILE', directText: '', file: uploadFile() });
  const saved = ksp.kspRegisterSourceRecord_(env, 'NEWS', initial);
  assert.equal(saved.ok, true, JSON.stringify(saved));
  const id = saved.record.newsId;
  const changed = newsInput({ requestId: 't1790294400000_changedupload01', inputMode: 'UPLOAD_FILE',
    directText: '', file: { ...uploadFile(), base64Data: 'AQM=' }, retryRecordId: id });
  changed.retryFingerprint = ksp.kspSourceRecordFingerprint_(
    ksp.kspNormalizeSourceRecordInput_(ksp.KSP_SOURCE_RECORD_TYPES.NEWS, changed));
  const replay = ksp.kspRegisterSourceRecord_(env, 'NEWS', changed);
  assert.equal(replay.ok, false);
  assert.equal(replay.error.code, 'SOURCE_FILE_CONFLICT');
  assert.equal(env.debug.rows.News_Index.length, 1);
  assert.equal(env.debug.files.get(id).bytes, uploadFile().base64Data);
});

test('News detail, direct body edit and lifecycle restoration preserve one authoritative Doc', () => {
  const env = fakeEnvironment();
  const created = ksp.kspRegisterSourceRecord_(env, 'NEWS', newsInput());
  assert.equal(created.ok, true);
  const id = created.record.newsId;
  assert.equal(ksp.kspGetSourceMaintenanceRecord_(env, 'NEWS', id).record.directText, 'News source body');
  const edited = ksp.kspUpdateSourceMaintenance_(env, 'NEWS', {
    newsId: id, expectedVersion: 1, title: 'Revised source', directText: 'Revised body'
  });
  assert.equal(edited.ok, true, JSON.stringify(edited));
  assert.equal(edited.record.version, 2);
  assert.equal(ksp.kspGetSourceMaintenanceRecord_(env, 'NEWS', id).record.directText, 'Revised body');
  const inactive = ksp.kspChangeSourceStatus_(env, 'NEWS', {
    newsId: id, expectedVersion: 2, targetStatus: 'Inactive'
  });
  assert.equal(inactive.ok, true, JSON.stringify(inactive));
  const restored = ksp.kspChangeSourceStatus_(env, 'NEWS', {
    newsId: id, expectedVersion: 3, targetStatus: 'Active'
  });
  assert.equal(restored.ok, true, JSON.stringify(restored));
  assert.equal(env.debug.rows.News_Index.length, 1);
  assert.equal(env.debug.files.size, 1);
});

test('Assessment direct/upload, search/detail/edit, lifecycle and restore use one source row each', () => {
  const env = fakeEnvironment();
  const direct = ksp.kspRegisterSourceRecord_(env, 'ASSESSMENT', assessmentInput());
  assert.equal(direct.ok, true, JSON.stringify(direct));
  assert.equal(direct.record.assessmentId, 'ASMT-000001');
  const detail = ksp.kspGetSourceMaintenanceRecord_(env, 'ASSESSMENT', direct.record.assessmentId);
  assert.equal(detail.record.directText, 'Assessment source body');
  assert.equal(detail.record.assessmentTypeLabel, 'IC / 投資判断');
  const edited = ksp.kspUpdateSourceMaintenance_(env, 'ASSESSMENT', {
    assessmentId: direct.record.assessmentId, expectedVersion: 1,
    title: 'Updated investment view', directText: 'Updated assessment body'
  });
  assert.equal(edited.ok, true, JSON.stringify(edited));
  assert.equal(edited.record.version, 2);
  assert.equal(ksp.kspGetSourceMaintenanceRecord_(env, 'ASSESSMENT', direct.record.assessmentId).record.directText,
    'Updated assessment body');
  const stale = ksp.kspUpdateSourceMaintenance_(env, 'ASSESSMENT', {
    assessmentId: direct.record.assessmentId, expectedVersion: 1, title: 'Stale title'
  });
  assert.equal(stale.ok, false); assert.equal(stale.error.code, 'STALE_RECORD_VERSION');
  const inactive = ksp.kspChangeSourceStatus_(env, 'ASSESSMENT', {
    assessmentId: direct.record.assessmentId, expectedVersion: 2, targetStatus: 'Inactive'
  });
  assert.equal(inactive.ok, true, JSON.stringify(inactive));
  const restored = ksp.kspChangeSourceStatus_(env, 'ASSESSMENT', {
    assessmentId: direct.record.assessmentId, expectedVersion: 3, targetStatus: 'Active'
  });
  assert.equal(restored.ok, true, JSON.stringify(restored));
  const upload = ksp.kspRegisterSourceRecord_(env, 'ASSESSMENT', assessmentInput({
    requestId: 't1790294400000_assessmentrequest002', inputMode: 'UPLOAD_FILE', directText: '', file: uploadFile('decision.eml', 'message/rfc822')
  }));
  assert.equal(upload.ok, true, JSON.stringify(upload));
  assert.equal(upload.record.assessmentId, 'ASMT-000002');
  assert.equal(env.debug.rows.Internal_Assessment_Index.length, 2);
  assert.equal(ksp.kspSearchSourceRecords_(env, 'ASSESSMENT', { counterpartyId: 'CP-000001', limit: 10 }).records.length, 2);
});

test('commit-time master validation rejects deactivated Counterparty without persisting row', () => {
  const env = fakeEnvironment({ beforeCommit({ rows }) { rows.Counterparty_Master[0].Status = 'Inactive'; } });
  const result = ksp.kspRegisterSourceRecord_(env, 'NEWS', newsInput());
  assert.equal(result.ok, false);
  assert.equal(result.error.code, 'SOURCE_COUNTERPARTY_UNAVAILABLE');
  assert.equal(env.debug.rows.News_Index.length, 0);
  assert.equal(result.retry.retryRecordId, 'NEWS-000001');
});

test('distinct creates allocate unique IDs and stale same-record write fails closed', () => {
  const env = fakeEnvironment();
  const first = ksp.kspRegisterSourceRecord_(env, 'NEWS', newsInput());
  const second = ksp.kspRegisterSourceRecord_(env, 'NEWS', newsInput({ requestId: 't1790294400000_newsrequest002', title: 'Second update' }));
  assert.equal(first.ok, true); assert.equal(second.ok, true);
  assert.deepEqual(Array.from(env.debug.rows.News_Index, row => row.News_ID), ['NEWS-000001', 'NEWS-000002']);
  assert.equal(env.debug.counter.NEWS, 3);
  const changed = ksp.kspChangeSourceStatus_(env, 'NEWS', {
    newsId: first.record.newsId, expectedVersion: 1, targetStatus: 'Inactive'
  });
  assert.equal(changed.ok, true);
  const stale = ksp.kspChangeSourceStatus_(env, 'NEWS', {
    newsId: first.record.newsId, expectedVersion: 1, targetStatus: 'Active'
  });
  assert.equal(stale.ok, false);
  assert.equal(stale.error.code, 'STALE_RECORD_VERSION');
});

test('interleaved distinct News and Assessment creates retain unique IDs and both rows', () => {
  for (const kind of ['NEWS', 'ASSESSMENT']) {
    let second;
    const env = fakeEnvironment({ onFileCreate({ id, environment }) {
      if (id === (kind === 'NEWS' ? 'NEWS-000001' : 'ASMT-000001')) {
        second = ksp.kspRegisterSourceRecord_(environment, kind, kind === 'NEWS'
          ? newsInput({ requestId: 't1790294400000_newsrequest002', title: 'Second news' })
          : assessmentInput({ requestId: 't1790294400000_assessmentrequest002', title: 'Second assessment' }));
      }
    } });
    const first = ksp.kspRegisterSourceRecord_(env, kind,
      kind === 'NEWS' ? newsInput() : assessmentInput());
    assert.equal(first.ok, true, JSON.stringify(first));
    assert.equal(second.ok, true, JSON.stringify(second));
    const sheet = kind === 'NEWS' ? env.debug.rows.News_Index : env.debug.rows.Internal_Assessment_Index;
    const key = kind === 'NEWS' ? 'News_ID' : 'Assessment_ID';
    assert.deepEqual(Array.from(sheet, row => row[key]).sort(),
      kind === 'NEWS' ? ['NEWS-000001', 'NEWS-000002'] : ['ASMT-000001', 'ASMT-000002']);
    assert.equal(env.debug.files.size, 2);
    assert.equal(env.debug.counter[kind], 3);
  }
});

test('Audit failure does not roll back authoritative News save', () => {
  const env = fakeEnvironment({ auditFailure: true });
  const result = ksp.kspRegisterSourceRecord_(env, 'NEWS', newsInput());
  assert.equal(result.ok, true, JSON.stringify(result));
  assert.equal(env.debug.rows.News_Index.length, 1);
  assert.equal(result.warnings[0].code, 'AUDIT_WRITE_FAILED');
});

test('live ID adapter bounds request ledger and rejects expired replay before new allocation', () => {
  const values = new Map();
  let next = 1;
  ksp.PropertiesService = { getScriptProperties: () => ({
    getProperty: key => values.has(key) ? values.get(key) : null,
    setProperty: (key, value) => values.set(key, value),
    deleteProperty: key => values.delete(key)
  }) };
  ksp.kspCreateMaintenanceEnvironment_ = () => ({});
  ksp.kspMaintenanceAcquireLock_ = () => ({ releaseLock() {} });
  ksp.kspFindSettingRow_ = () => ({
    sheet: { getRange: () => ({ setValue(value) { next = Number(value); } }) },
    rowIndex: 2, valueIndex: 1, updatedAtIndex: -1
  });
  ksp.kspReadPositiveSettingValue_ = () => next;
  const env = ksp.kspCreateSourceRecordEnvironment_();
  const definition = ksp.KSP_SOURCE_RECORD_TYPES.NEWS;
  const firstRequest = 't1790294400000_newsrequest001';
  const firstInput = { requestId: firstRequest, retryRecordId: '', retryFingerprint: '' };
  const first = env.reserveSourceId(definition, 'backend', firstInput,
    'tester@example.com', 'fingerprint-one', '2026-09-25T00:00:01.000Z');
  assert.equal(first, 'NEWS-000001');
  assert.equal(next, 2);
  assert.equal(env.reserveSourceId(definition, 'backend', firstInput,
    'tester@example.com', 'fingerprint-one', '2026-09-25T00:00:02.000Z'), first);
  assert.equal(next, 2);
  assert.throws(() => env.reserveSourceId(definition, 'backend', firstInput,
    'tester@example.com', 'fingerprint-one', '2026-09-26T00:00:02.000Z'),
  error => error.code === 'SOURCE_REQUEST_EXPIRED');
  assert.equal(next, 2);
  let newRequest = '';
  for (let i = 0; i < 10000; i += 1) {
    const candidate = `t1790380801000_newrequest${String(i).padStart(4, '0')}`;
    if (ksp.kspSourceRequestBucketKey_(definition, candidate) ===
      ksp.kspSourceRequestBucketKey_(definition, firstRequest)) { newRequest = candidate; break; }
  }
  assert.ok(newRequest);
  const second = env.reserveSourceId(definition, 'backend',
    { requestId: newRequest, retryRecordId: '', retryFingerprint: '' },
    'tester@example.com', 'fingerprint-two', '2026-09-26T00:00:02.000Z');
  assert.equal(second, 'NEWS-000002');
  assert.equal(next, 3);
  const ledger = JSON.parse(values.get(ksp.kspSourceRequestBucketKey_(definition, firstRequest)));
  assert.equal(Object.keys(ledger).length, 1);
  assert.equal(ledger[firstRequest], undefined);
  assert.equal(values.size, 1);
});
