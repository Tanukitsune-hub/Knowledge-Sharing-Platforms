const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

function loadMeetingSource(rootDir) {
  function formatDateInTimeZone(value, timezone, pattern) {
    const parts = new Intl.DateTimeFormat('en-CA', pattern === 'HH:mm'
      ? { timeZone: timezone, hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }
      : { timeZone: timezone, year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(value);
    const byType = Object.fromEntries(parts.map(part => [part.type, part.value]));
    return pattern === 'HH:mm' ? `${byType.hour}:${byType.minute}` : `${byType.year}-${byType.month}-${byType.day}`;
  }
  const context = vm.createContext({ console, JSON, Object, Array, String, Number, Boolean, Date, Math, RegExp, Error, TypeError, Set, Map, Intl, Utilities: { formatDate: formatDateInTimeZone } });
  const prelude = `
    var KSP_STATUS = Object.freeze({ ACTIVE: 'Active', INACTIVE: 'Inactive' });
    var KSP_AI_INDEX_STATUS = Object.freeze({ NOT_INDEXED: 'NotIndexed', PENDING: 'Pending', INDEXED: 'Indexed', FAILED: 'Failed' });
    var KSP_SHEET_NAMES = Object.freeze({ GP_MASTER: 'GP_Master', OPTION_MASTER: 'Option_Master', MEETING_INDEX: 'Meeting_Index', SETTINGS: 'Settings', AUDIT_LOG: 'Audit_Log' });
    var KSP_RESOURCE_KEYS = Object.freeze({ MEETING_RECORDS: 'meetingRecordsFolderId', BACKEND_SPREADSHEET: 'backendSpreadsheetId', AUDIT_SPREADSHEET: 'auditSpreadsheetId' });
    var KSP_DEFAULTS = Object.freeze({ LOCK_TIMEOUT_MS: 30000, TIMEZONE: 'Asia/Tokyo' });
    var KSP_PROPERTY_KEYS = Object.freeze({ INSTALLATION_STATE_JSON: 'KSP_INSTALLATION_STATE_JSON' });
    function kspAssert_(condition, code, message) { if (!condition) { var error = new Error(message); error.code = code; throw error; } }
    function kspGetErrorCode_(error, fallback) { return error && error.code ? String(error.code) : (fallback || 'UNEXPECTED_ERROR'); }
    function kspDeepClone_(value) { return value === undefined ? undefined : JSON.parse(JSON.stringify(value)); }
    function kspSafeParseJson_(text, label) { if (!text) return null; try { return JSON.parse(text); } catch (error) { throw new Error((label || 'JSON') + ' is not valid JSON: ' + error.message); } }
    function kspEscapeDriveQueryLiteral_(value) { return String(value).replace(/\\\\/g, '\\\\\\\\').replace(/'/g, "\\\\'"); }
    function kspNormalizeGeneratedNameSegment_(value) { if (value === null || value === undefined) return ''; return String(value).replace(/[\\u0000-\\u001f\\u007f]/g, '').replace(/[\\\\/&]/g, '').trim().replace(/\\s+/g, '_').replace(/_+/g, '_').replace(/^_+|_+$/g, ''); }
  `;
  new vm.Script(prelude, { filename: 'test-prelude.gs' }).runInContext(context);
  for (const file of ['00_Core.gs','05_TemporalContracts.gs','62_PitchbookIdentity.gs','30_MeetingCore.gs','40_MeetingService.gs','50_MeetingLiveEnvironment.gs','90_WebApp.gs']) {
    new vm.Script(fs.readFileSync(path.join(rootDir, 'src', file), 'utf8'), { filename: file }).runInContext(context);
  }
  return context;
}

function createMasterRows() {
  return {
    gps: [
      { GP_ID: 'GP-2', GP_Name: 'Apollo', Status: 'Active' },
      { GP_ID: 'GP-1', GP_Name: 'KKR', Status: 'Active' },
      { GP_ID: 'GP-X', GP_Name: 'Inactive GP', Status: 'Inactive' }
    ],
    options: [
      { Option_ID: 'AC-INFRA', Type: 'ASSET_CLASS', Name: 'Infrastructure', Sort_Order: 2, Status: 'Active' },
      { Option_ID: 'AC-PE', Type: 'ASSET_CLASS', Name: 'PE', Sort_Order: 1, Status: 'Active' },
      { Option_ID: 'CT-EQ', Type: 'CAPITAL_TYPE', Name: 'Equity', Sort_Order: 1, Status: 'Active' },
      { Option_ID: 'CT-DEBT', Type: 'CAPITAL_TYPE', Name: 'Debt', Sort_Order: 2, Status: 'Active' },
      { Option_ID: 'LOC-ONLINE', Type: 'LOCATION', Name: 'オンライン', Sort_Order: 1, Status: 'Active' },
      { Option_ID: 'LOC-INACTIVE', Type: 'LOCATION', Name: 'Inactive', Sort_Order: 2, Status: 'Inactive' },
      { Option_ID: 'TEAM-PD', Type: 'TEAM', Name: 'PD', Sort_Order: 1, Status: 'Active' },
      { Option_ID: 'TEAM-OFF', Type: 'TEAM', Name: 'Former Team', Sort_Order: 2, Status: 'Inactive' },
      { Option_ID: 'OPT-CPLP-001', Type: 'COUNTERPARTY_LP', Name: 'Synthetic Asset Owner', Sort_Order: 1, Status: 'Active' }
    ]
  };
}

function createFakeEnvironment(options = {}) {
  const master = createMasterRows();
  let counter = options.counter || 1;
  let nowCounter = 0;
  let docCounter = 1;
  let failIndexRemaining = options.failIndexOnce ? 1 : 0;
  const documents = [];
  const rows = { Meeting_Index: [], Pitchbook_Index: (options.pitchbookRows || []).map((row)=>structuredClone(row)), Audit_Log: [] };
  const state = { config: { environment: 'DEV' }, resources: { backendSpreadsheetId: 'backend-1', auditSpreadsheetId: 'audit-1', meetingRecordsFolderId: 'meeting-folder-1' } };
  return {
    nowIso() { nowCounter += 1; return `2026-08-16T00:00:${String(nowCounter).padStart(2, '0')}.000Z`; },
    getActor() { if (options.actorThrows) throw new Error('actor unavailable'); return options.actor === undefined ? 'TEMP_USER:test-key' : options.actor; },
    getInstallationState() { return options.missingInstallation ? null : structuredClone(state); },
    readRows(spreadsheetId, sheetName) { if (sheetName === 'GP_Master') return structuredClone(master.gps); if (sheetName === 'Option_Master') return structuredClone(master.options); if (sheetName === 'Meeting_Index') return structuredClone(rows.Meeting_Index); if (sheetName === 'Pitchbook_Index') return structuredClone(rows.Pitchbook_Index); return []; },
    getCounterValue() { return counter; },
    allocateCounter() { if (options.failCounter) throw Object.assign(new Error('counter failure'), { code: 'COUNTER_FAIL' }); return counter++; },
    findRowByKey(spreadsheetId, sheetName, keyColumn, keyValue) { return rows[sheetName].find((row) => String(row[keyColumn]) === String(keyValue)) || null; },
    createOrReuseDocument(parentFolderId, meetingId, filename, text) {
      if (options.failDocument) throw Object.assign(new Error('document failure'), { code: 'DOC_FAIL' });
      const existing = documents.find((document) => document.name === filename);
      if (existing) { existing.text = text; return { id: existing.id, name: existing.name, url: existing.url, reused: true }; }
      const document = { id: `doc-${docCounter++}`, name: filename, url: `https://example.test/docs/${docCounter - 1}`, text, parentFolderId, meetingId };
      documents.push(document); return { id: document.id, name: document.name, url: document.url, reused: false };
    },
    appendUniqueRow(spreadsheetId, sheetName, keyColumn, row) {
      if (sheetName === 'Meeting_Index' && failIndexRemaining > 0) { failIndexRemaining -= 1; throw Object.assign(new Error('index failure'), { code: 'INDEX_FAIL' }); }
      const existing = rows[sheetName].find((candidate) => String(candidate[keyColumn]) === String(row[keyColumn]));
      if (existing) return { inserted: false, row: structuredClone(existing) };
      rows[sheetName].push(structuredClone(row)); return { inserted: true, row: structuredClone(row), rowNumber: rows[sheetName].length + 1 };
    },
    appendRow(spreadsheetId, sheetName, row) {
      if (sheetName === 'Audit_Log' && options.failAudit) throw Object.assign(new Error('audit failure'), { code: 'AUDIT_FAIL' });
      rows[sheetName].push(structuredClone(row)); return { rowNumber: rows[sheetName].length + 1 };
    },
    _debug: { documents, rows, state, master, get counter() { return counter; } }
  };
}

const root = path.resolve(__dirname, '..');
const ksp = loadMeetingSource(root);
function minimalInput(overrides = {}) { return { date: '2026-08-16', gpId: 'GP-1', assetClassId: 'AC-INFRA', time: '', locationId: '', capitalTypeId: '', counterparty: '', internalParticipants: '', notes: '', ...overrides }; }

test('catalog filters inactive rows and sorts GP and options', () => {
  const catalog = ksp.kspBuildMeetingCatalog_(createMasterRows().gps, createMasterRows().options);
  assert.deepEqual(Array.from(catalog.gps, (item) => item.name), ['Apollo','KKR']);
  assert.deepEqual(Array.from(catalog.assetClasses, (item) => item.name), ['PE','Infrastructure']);
  assert.deepEqual(Array.from(catalog.locations, (item) => item.name), ['オンライン']);
});

test('minimal Meeting registration creates document, Index row, and audit event', () => {
  const env = createFakeEnvironment(); const result = ksp.kspRegisterMeeting_(env, minimalInput());
  assert.equal(result.ok, true, JSON.stringify(result));
  assert.equal(result.meeting.id, 'MTG-000001');
  assert.equal(result.meeting.filename, '2026-08-16_KKR_Infrastructure_MTG-000001');
  assert.equal(env._debug.documents[0].text, '日付: 2026-08-16\n面談先区分: GP / 運用会社\n面談先: KKR\n関連GP: KKR\nAsset Class: Infrastructure');
  assert.equal(env._debug.rows.Meeting_Index.length, 1);
  assert.equal(env._debug.rows.Meeting_Index[0].AI_Index_Status, 'Pending');
  assert.equal(Object.hasOwn(env._debug.rows.Meeting_Index[0], 'Notes'), false);
  assert.equal(env._debug.rows.Audit_Log[0].Result, 'Success');
  assert.equal(env._debug.rows.Audit_Log[0].Actor, 'TEMP_USER:test-key');
});

test('optional fields render compact Docs text and preserve note line breaks', () => {
  const env = createFakeEnvironment({ counter: 12, actor: 'owner@example.com' });
  const result = ksp.kspRegisterMeeting_(env, minimalInput({ time: '10:30', locationId: 'LOC-ONLINE', capitalTypeId: 'CT-EQ', counterparty: 'Jane Smith', internalParticipants: 'Kondo', notes: 'First line\r\nSecond line' }));
  assert.equal(result.ok, true);
  assert.equal(result.meeting.filename, '2026-08-16_KKR_Infrastructure_Equity_MTG-000012');
  assert.equal(env._debug.documents[0].text, ['日付: 2026-08-16','時間: 10:30','面談場所: オンライン','面談先区分: GP / 運用会社','面談先: KKR','関連GP: KKR','Asset Class: Infrastructure','Equity / Debt: Equity','面談相手（氏名・役職）: Jane Smith','当社側: Kondo','','面談内容:','First line','Second line'].join('\n'));
  assert.equal(env._debug.rows.Audit_Log[0].After_Metadata_JSON.includes('First line'), false);
});

test('required-field validation stops before ID or document writes', () => {
  const env = createFakeEnvironment(); const result = ksp.kspRegisterMeeting_(env, minimalInput({ date: '' }));
  assert.equal(result.ok, false); assert.equal(result.error.code, 'MEETING_DATE_REQUIRED'); assert.equal(result.retry, null);
  assert.equal(env._debug.documents.length, 0); assert.equal(env._debug.rows.Meeting_Index.length, 0); assert.equal(env._debug.rows.Audit_Log[0].Result, 'Failure');
});

test('invalid dates, times, inactive masters, and incomplete retry context are rejected', () => {
  const catalog = ksp.kspBuildMeetingCatalog_(createMasterRows().gps, createMasterRows().options);
  assert.throws(() => ksp.kspValidateMeetingInput_(ksp.kspNormalizeMeetingInput_(minimalInput({ date: '2026-02-30' })), catalog), /YYYY-MM-DD/);
  assert.throws(() => ksp.kspValidateMeetingInput_(ksp.kspNormalizeMeetingInput_(minimalInput({ time: '25:00' })), catalog), /HH:MM/);
  assert.throws(() => ksp.kspValidateMeetingInput_(ksp.kspNormalizeMeetingInput_(minimalInput({ gpId: 'GP-X' })), catalog), /利用できません/);
  assert.throws(() => ksp.kspValidateMeetingInput_(ksp.kspNormalizeMeetingInput_(minimalInput({ retryMeetingId: 'MTG-000001' })), catalog), /supplied together/);
});

test('partial failure returns retry context and retry reuses same ID and document without duplicate Index rows', () => {
  const env = createFakeEnvironment({ failIndexOnce: true });
  const first = ksp.kspRegisterMeeting_(env, minimalInput({ notes: 'Keep this draft' }));
  assert.equal(first.ok, false); assert.equal(first.error.code, 'INDEX_FAIL'); assert.equal(first.retry.meetingId, 'MTG-000001'); assert.match(first.retry.fingerprint, /^[0-9a-f]{8}$/);
  assert.equal(env._debug.documents.length, 1); assert.equal(env._debug.rows.Meeting_Index.length, 0);
  const retryInput = minimalInput({ notes: 'Keep this draft', retryMeetingId: first.retry.meetingId, retryFingerprint: first.retry.fingerprint });
  const second = ksp.kspRegisterMeeting_(env, retryInput);
  assert.equal(second.ok, true, JSON.stringify(second)); assert.equal(second.meeting.id, 'MTG-000001'); assert.equal(second.meeting.reusedDocument, true);
  assert.equal(env._debug.documents.length, 1); assert.equal(env._debug.rows.Meeting_Index.length, 1); assert.equal(env._debug.counter, 2);
  const third = ksp.kspRegisterMeeting_(env, retryInput);
  assert.equal(third.ok, true); assert.equal(third.idempotentReplay, true); assert.equal(env._debug.documents.length, 1); assert.equal(env._debug.rows.Meeting_Index.length, 1);
});

test('retry context rejects changed form content', () => {
  const env = createFakeEnvironment({ failIndexOnce: true });
  const first = ksp.kspRegisterMeeting_(env, minimalInput({ notes: 'Original' }));
  const changed = ksp.kspRegisterMeeting_(env, minimalInput({ notes: 'Changed', retryMeetingId: first.retry.meetingId, retryFingerprint: first.retry.fingerprint }));
  assert.equal(changed.ok, false); assert.equal(changed.error.code, 'MEETING_RETRY_REQUEST_CHANGED'); assert.equal(env._debug.documents.length, 1); assert.equal(env._debug.rows.Meeting_Index.length, 0);
});

test('audit failure does not roll back a committed Meeting', () => {
  const env = createFakeEnvironment({ failAudit: true }); const result = ksp.kspRegisterMeeting_(env, minimalInput());
  assert.equal(result.ok, true); assert.equal(env._debug.rows.Meeting_Index.length, 1); assert.equal(env._debug.documents.length, 1); assert.equal(result.warnings.at(-1).code, 'AUDIT_WRITE_FAILED');
});

test('Actor lookup failure falls back to UNIDENTIFIED and never blocks registration', () => {
  const env = createFakeEnvironment({ actorThrows: true }); const result = ksp.kspRegisterMeeting_(env, minimalInput());
  assert.equal(result.ok, true); assert.equal(env._debug.rows.Meeting_Index[0].Created_By, 'UNIDENTIFIED'); assert.equal(env._debug.rows.Audit_Log[0].Actor, 'UNIDENTIFIED'); assert.equal(result.warnings[0].code, 'ACTOR_RESOLUTION_FAILED');
});

test('actor resolution follows email, temporary key, then UNIDENTIFIED', () => {
  assert.equal(ksp.kspResolveActorValue_(' OWNER@Example.com ', 'temp'), 'owner@example.com');
  assert.equal(ksp.kspResolveActorValue_('', 'abc'), 'TEMP_USER:abc');
  assert.equal(ksp.kspResolveActorValue_('', ''), 'UNIDENTIFIED');
});

test('Meeting notes never appear in Index or Audit payload', () => {
  const env = createFakeEnvironment(); const secretNotes = 'Highly confidential line\nSecond line';
  const result = ksp.kspRegisterMeeting_(env, minimalInput({ notes: secretNotes }));
  assert.equal(result.ok, true); assert.equal(JSON.stringify(env._debug.rows.Meeting_Index).includes('Highly confidential'), false); assert.equal(JSON.stringify(env._debug.rows.Audit_Log).includes('Highly confidential'), false); assert.equal(env._debug.documents[0].text.includes('Highly confidential'), true);
});

test('bootstrap response exposes active options and 24-hour draft contract', () => {
  const result = ksp.kspGetMeetingBootstrapData_(createFakeEnvironment());
  assert.equal(result.ok, true); assert.equal(result.draftTtlMs, 86_400_000); assert.deepEqual(Array.from(result.sharedContextFields), ['date','assetClassId','capitalTypeId','fundStrategy']); assert.equal(result.options.gps.length, 2); assert.deepEqual(Array.from(result.options.teams,item=>item.name),['PD']); assert.equal(result.options.counterpartyTypes.length,6); assert.equal(result.options.counterpartyTypes.find(item=>item.code==='NISSAY_INTERNAL').label,'日本生命');
});

test('Meeting Date cells use the configured Asia Tokyo business date', () => {
  const sheetsDate = new Date('2026-08-28T15:00:00.000Z');
  assert.equal(ksp.kspMeetingCellDate_(sheetsDate), '2026-08-29');
  assert.equal(ksp.kspMeetingCellDate_('2026-08-29'), '2026-08-29');
});

test('UI preserves shared context, stores retry context, and clears it on changes', () => {
  const html = [
    fs.readFileSync(path.join(root, 'src', 'Index.html'), 'utf8'),
    fs.readFileSync(path.join(root, 'src', 'ClientCore.html'), 'utf8'),
    fs.readFileSync(path.join(root, 'src', 'ClientMaintenance.html'), 'utf8'),
    fs.readFileSync(path.join(root, 'src', 'ClientMaintenanceEnhancements.html'), 'utf8'),
    fs.readFileSync(path.join(root, 'src', 'MaintenancePages.html'), 'utf8')
  ].join('\n');
  assert.match(html, /KSP_SHARED_DRAFT_KEY/); assert.match(html, /KSP_MEETING_DRAFT_KEY/); assert.match(html, /KSP_MEETING_RETRY_KEY/); assert.match(html, /24\s*\*\s*60\s*\*\s*60\s*\*\s*1000/);
  assert.match(html, /payload\.retryMeetingId\s*=\s*retryContext\.meetingId/); assert.match(html, /clearRetryContext\(\);\s*saveDraft\(\);?/);
  const clearMeetingLine = html.split(/\r?\n/).find(line => line.includes('function clearMeetingSpecificDraft'));
  assert.ok(clearMeetingLine);
  assert.match(clearMeetingLine, /safeStorageRemove\(KSP_MEETING_DRAFT_KEY\)/);
  assert.doesNotMatch(clearMeetingLine, /safeStorageRemove\(KSP_SHARED_DRAFT_KEY\)/);
  assert.match(clearMeetingLine, /writeEnvelope\(KSP_SHARED_DRAFT_KEY/);
  assert.match(html, /入力内容は保持されています/);
  ['meeting-teamId','meeting-fundStrategy','meeting-relatedPitchbookIds','meeting-followUpRequired','meeting-followUpNote','pitchbook-fundStrategy'].forEach(id=>assert.match(html,new RegExp(id)));
  ['ANNUAL_REVIEW','OFFICE_VISIT','ANNUAL_GENERAL_MEETING'].forEach(code=>assert.match(html,new RegExp(code)));
  assert.match(html,/SHARED_FIELDS=\['date','assetClassId','capitalTypeId','fundStrategy'\]/);
  assert.match(html, /meeting-relatedGpIds/);
  assert.match(html, /ensurePrimaryGpRelated/);
  assert.match(html, /GP',label:'GP \/ 運用会社'/);
  assert.match(html, /関連GPのいずれか \+ Asset Classに一致するActive資料/);
  assert.match(html, /clearRetryContext\(\);refreshMeetingCounterpartyEntities\([^\n]+saveMeetingDraft\(\)/);
  assert.match(html, /meeting-relatedGpIds'\)\.addEventListener\('change',[^\n]+clearRetryContext\(\);saveMeetingDraft\(\)/);
  assert.match(html, /const gpNode=el\(page\+'-gpId'\);/);
  assert.doesNotMatch(html, /shared\.gpId=result\.gp\.id/);
  assert.match(html, /ensureMeetingEditPrimaryGpRelated/);
  assert.match(html, /meeting-edit-counterpartyId'\)\.addEventListener\('change',[^\n]+ensureMeetingEditPrimaryGpRelated\(\)/);
  assert.match(html, /NISSAY_INTERNAL',label:'日本生命'/);
  assert.doesNotMatch(html, /NISSAY_INTERNAL',label:'日本生命内'/);
  assert.match(html, /function kspSafeDriveUrl/);
  assert.match(html, /function kspSanitizeStatusHtml/);
  assert.ok(html.includes('return /^https:\\/\\/(?:drive|docs)\\.google\\.com\\//.test(candidate)'));
  assert.match(html, /innerHTML=kspSanitizeStatusHtml\(message\)/);
});

function extractClientFunction(source, name) {
  const start = source.indexOf(`function ${name}(`);
  assert.notEqual(start, -1, `${name} must exist in production client source`);
  const next = source.indexOf('\nfunction ', start + 1);
  return source.slice(start, next === -1 ? source.length : next);
}

test('client edit identity populates live hidden values and preserves a safe fallback', () => {
  const source = fs.readFileSync(path.join(root, 'src', 'ClientMaintenance.html'), 'utf8');
  const nodes = {};
  for (const id of ['meeting-edit-meetingId', 'meeting-edit-expectedVersion']) {
    nodes[id] = {
      value: '',
      defaultValue: '',
      attributes: {},
      setAttribute(name, value) { this.attributes[name] = String(value); },
      getAttribute(name) { return this.attributes[name] ?? null; }
    };
  }
  const context = vm.createContext({ String, Number, el(id) { return nodes[id]; } });
  new vm.Script([
    'let meetingEditIdentity={meetingId:"",expectedVersion:0};',
    extractClientFunction(source, 'setMeetingEditIdentity'),
    extractClientFunction(source, 'readMeetingEditIdentity')
  ].join('\n'), { filename: 'client-edit-state.test.js' }).runInContext(context);

  vm.runInContext("setMeetingEditIdentity({meetingId:'MTG-TEST-001',version:1})", context);
  assert.equal(nodes['meeting-edit-meetingId'].value, 'MTG-TEST-001');
  assert.equal(nodes['meeting-edit-meetingId'].getAttribute('value'), 'MTG-TEST-001');
  assert.equal(nodes['meeting-edit-expectedVersion'].value, '1');
  assert.equal(nodes['meeting-edit-expectedVersion'].getAttribute('value'), '1');
  assert.equal(JSON.stringify(vm.runInContext('readMeetingEditIdentity()', context)), JSON.stringify({ meetingId: 'MTG-TEST-001', expectedVersion: 1 }));

  nodes['meeting-edit-meetingId'].value = '';
  nodes['meeting-edit-expectedVersion'].value = '';
  assert.equal(JSON.stringify(vm.runInContext('readMeetingEditIdentity()', context)), JSON.stringify({ meetingId: 'MTG-TEST-001', expectedVersion: 1 }));
});

test('rich Meeting fields normalize, persist, render, and keep follow-up note out of Audit', () => {
  const pitchbookRows = [
    { Document_ID:'DOC-000002', Date:'2026-08-15', GP_ID:'GP-1', Asset_Class_ID:'AC-INFRA', Status:'Active', Saved_Filename:'newer.pdf' },
    { Document_ID:'DOC-000001', Date:'2026-08-14', GP_ID:'GP-1', Asset_Class_ID:'AC-INFRA', Status:'Active', Saved_Filename:'older.pdf' },
    { Document_ID:'DOC-000003', Date:'2026-08-16', GP_ID:'GP-2', Asset_Class_ID:'AC-INFRA', Status:'Active', Saved_Filename:'wrong-gp.pdf' }
  ];
  const env = createFakeEnvironment({ pitchbookRows });
  const result = ksp.kspRegisterMeeting_(env, minimalInput({
    teamId:'TEAM-PD', fundStrategy:'Fund Alpha',
    meetingTypeCodes:['OFFICE_VISIT','ANNUAL_REVIEW','OFFICE_VISIT'],
    relatedPitchbookIds:['DOC-000002','DOC-000001','DOC-000002'],
    followUpRequired:true, followUpNote:'private follow-up', notes:'body'
  }));
  assert.equal(result.ok,true,JSON.stringify(result));
  const row=env._debug.rows.Meeting_Index[0];
  assert.equal(row.Team_ID,'TEAM-PD'); assert.equal(row.Fund_Strategy,'Fund Alpha');
  assert.equal(row.Meeting_Type_Codes,'ANNUAL_REVIEW,OFFICE_VISIT');
  assert.equal(row.Related_Pitchbook_IDs,'DOC-000001,DOC-000002');
  assert.equal(row.Follow_Up_Required,true); assert.equal(row.Follow_Up_Note,'private follow-up');
  assert.match(env._debug.documents[0].text,/Team: PD/); assert.match(env._debug.documents[0].text,/Fund \/ Strategy: Fund Alpha/);
  assert.match(env._debug.documents[0].text,/要フォロー: はい/);
  assert.equal(JSON.stringify(env._debug.rows.Audit_Log).includes('private follow-up'),false);
});

test('Meeting types and related Pitchbook writes fail closed', () => {
  const env=createFakeEnvironment({pitchbookRows:[{Document_ID:'DOC-000001',Date:'2026-08-14',GP_ID:'GP-2',Asset_Class_ID:'AC-INFRA',Status:'Active'}]});
  const unknown=ksp.kspRegisterMeeting_(env,minimalInput({meetingTypeCodes:['UNKNOWN']}));
  assert.equal(unknown.ok,false); assert.equal(unknown.error.code,'MEETING_TYPE_CODE_INVALID');
  const mismatch=ksp.kspRegisterMeeting_(env,minimalInput({relatedPitchbookIds:['DOC-000001']}));
  assert.equal(mismatch.ok,false); assert.equal(mismatch.error.code,'MEETING_RELATED_PITCHBOOK_UNAVAILABLE');
  assert.equal(env._debug.rows.Meeting_Index.length,0);
});

test('related Pitchbook choices normalize Date cells and sort by Date then Document ID', () => {
  const choices = ksp.kspBuildRelatedPitchbookChoices_([
    { Document_ID:'DOC-000002', Date:new Date('2026-08-15T00:00:00.000Z'), GP_ID:'GP-1', Asset_Class_ID:'AC-INFRA', Status:'Active' },
    { Document_ID:'DOC-000001', Date:new Date('2026-08-15T12:00:00.000Z'), GP_ID:'GP-1', Asset_Class_ID:'AC-INFRA', Status:'Active' },
    { Document_ID:'DOC-000003', Date:new Date('2026-08-14T00:00:00.000Z'), GP_ID:'GP-1', Asset_Class_ID:'AC-INFRA', Status:'Active' }
  ], 'GP-1', 'AC-INFRA', []);
  assert.deepEqual(Array.from(choices, choice => choice.id), ['DOC-000001','DOC-000002','DOC-000003']);
  assert.deepEqual(Array.from(choices, choice => choice.date), ['2026-08-15','2026-08-15','2026-08-14']);
});

test('legacy Meeting retry fingerprint remains valid only when new fields are blank', () => {
  const env=createFakeEnvironment({failIndexOnce:true});
  const input=minimalInput({notes:'legacy'});
  const first=ksp.kspRegisterMeeting_(env,input);
  const normalized=ksp.kspNormalizeMeetingInput_(input);
  const legacy=ksp.kspBuildLegacyMeetingRequestFingerprint_(normalized);
  const retry=ksp.kspRegisterMeeting_(env,{...input,retryMeetingId:first.retry.meetingId,retryFingerprint:legacy});
  assert.equal(retry.ok,true,JSON.stringify(retry));
  const changed=createFakeEnvironment({failIndexOnce:true});
  const failed=ksp.kspRegisterMeeting_(changed,input);
  const rejected=ksp.kspRegisterMeeting_(changed,{...input,fundStrategy:'new',retryMeetingId:failed.retry.meetingId,retryFingerprint:legacy});
  assert.equal(rejected.ok,false); assert.equal(rejected.error.code,'MEETING_RETRY_REQUEST_CHANGED');
});

test('non-GP Meeting persists typed entity, Related GP and matching Pitchbook without GP mirror', () => {
  const env = createFakeEnvironment({ pitchbookRows: [
    { Document_ID:'DOC-000001', Date:'2026-08-15', GP_ID:'GP-1', Asset_Class_ID:'AC-INFRA', Status:'Active', Saved_Filename:'matching.pdf' },
    { Document_ID:'DOC-000002', Date:'2026-08-16', GP_ID:'GP-2', Asset_Class_ID:'AC-INFRA', Status:'Active', Saved_Filename:'other.pdf' }
  ] });
  const result = ksp.kspRegisterMeeting_(env, minimalInput({
    gpId:'', counterpartyType:'LP_ASSET_OWNER', counterpartyId:'OPT-CPLP-001',
    relatedGpIds:['GP-1'], relatedPitchbookIds:['DOC-000001'], followUpNote:'never audit this'
  }));
  assert.equal(result.ok,true,JSON.stringify(result));
  const row=env._debug.rows.Meeting_Index[0];
  assert.equal(row.GP_ID,'');
  assert.equal(row.Counterparty_Type,'LP_ASSET_OWNER');
  assert.equal(row.Counterparty_ID,'OPT-CPLP-001');
  assert.equal(row.Related_GP_IDs,'GP-1');
  assert.match(result.meeting.filename,/Synthetic_Asset_Owner/);
  assert.match(env._debug.documents[0].text,/面談先: Synthetic Asset Owner/);
  assert.doesNotMatch(JSON.stringify(env._debug.rows.Audit_Log),/never audit this/);
});

test('Counterparty and Related GP writes fail closed while primary GP is auto included', () => {
  const catalog=ksp.kspBuildMeetingCatalog_(createMasterRows().gps,createMasterRows().options);
  const gp=ksp.kspNormalizeMeetingInput_(minimalInput({counterpartyType:'GP',counterpartyId:'GP-1',relatedGpIds:[]}));
  assert.equal(gp.gpId,'GP-1');assert.equal(gp.relatedGpIds,'GP-1');
  assert.throws(()=>ksp.kspNormalizeMeetingInput_(minimalInput({relatedGpIds:['GP-1','GP-1']})),error=>error.code==='MEETING_RELATED_GP_DUPLICATE');
  assert.throws(()=>ksp.kspValidateMeetingInput_(ksp.kspNormalizeMeetingInput_(minimalInput({gpId:'',counterpartyType:'LP_ASSET_OWNER',counterpartyId:'GP-1'})),catalog),error=>error.code==='MEETING_COUNTERPARTY_ENTITY_UNAVAILABLE');
  assert.throws(()=>ksp.kspValidateMeetingInput_(ksp.kspNormalizeMeetingInput_(minimalInput({gpId:'',counterpartyType:'LP_ASSET_OWNER',counterpartyId:'OPT-CPLP-001',relatedGpIds:['GP-UNKNOWN']})),catalog),error=>error.code==='MEETING_RELATED_GP_INVALID');
});
