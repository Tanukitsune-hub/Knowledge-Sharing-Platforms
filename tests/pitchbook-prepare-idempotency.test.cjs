const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

function fixture(failure = '') {
  const writes = [], properties = new Map(), sheets = new Map();
  let fired = false, actor = 'synthetic-actor';
  function fail(at) { if (!fired && failure === at) {fired = true; throw new Error('synthetic ' + at)} }
  class Sheet {
    constructor(name, headers, rows) {this.name = name;this.values = [headers, ...rows.map(row => headers.map(key => row[key] ?? ''))]}
    getLastColumn() {return this.values[0].length}
    getLastRow() {return this.values.length}
    getRange(r, c, nr = 1, nc = 1) {
      const self = this;
      return {getValue: () => self.values[r - 1]?.[c - 1] ?? '',
        getValues: () => Array.from({length: nr}, (_, i) => Array.from({length: nc}, (_, j) => self.values[r - 1 + i]?.[c - 1 + j] ?? '')),
        setValue(value) {fail('counter-before');self.values[r - 1][c - 1] = value;writes.push('counter');fail('counter-after')},
        setValues(values) {
          fail('rows-before');
          for (let i = 0; i < values.length; i++) {self.values[r - 1 + i] = values[i].slice();writes.push('row');fail('row-partial')}
          fail('rows-after');
        }};
    }
  }
  const props = {getProperty: key => properties.get(key) ?? null,
    getProperties: () => Object.fromEntries(properties),
    setProperty(key, value) {
      if (key.includes('REQUEST_')) {
        fail('intent-before');
        if (JSON.parse(value).state === 'COMPLETE') fail('complete-before');
      } else fail('reservation-before');
      properties.set(key, String(value));writes.push('property');
      if (key.includes('REQUEST_') && JSON.parse(value).state === 'INTENT') fail('intent-after');
    }};
  const ksp = vm.createContext({console, JSON, Object, Array, String, Number, Boolean, Date, Math, RegExp, Error, TypeError,
    Set, Map, Intl, encodeURIComponent,
    LockService: {getScriptLock: () => ({tryLock() {if (failure === 'parent-race') parent.Status = 'Inactive';return true}, releaseLock() {}})},
    SpreadsheetApp: {openById: () => ({getSheetByName: name => sheets.get(name)}), flush() {}},
    Utilities: {formatDate(value, timezone, pattern) {
      const options = pattern === 'HH:mm' ? {hour:'2-digit', minute:'2-digit', hourCycle:'h23'} : {year:'numeric',month:'2-digit',day:'2-digit'};
      const p = Object.fromEntries(new Intl.DateTimeFormat('en-CA', {timeZone:timezone,...options}).formatToParts(value).map(x => [x.type,x.value]));
      return pattern === 'HH:mm' ? p.hour + ':' + p.minute : p.year + '-' + p.month + '-' + p.day;
    }}});
  const root = path.join(__dirname, '../src');
  for (const file of fs.readdirSync(root).filter(f => f.endsWith('.gs')).sort()) {
    new vm.Script(fs.readFileSync(path.join(root, file), 'utf8'), {filename:file}).runInContext(ksp);
  }
  const parent = {Meeting_ID:'MTG-000001', Version:1, Status:'Active', Doc_File_ID:'synthetic-doc',
    Date:'2026-09-08', GP_ID:'GP-1', Counterparty_Type:'GP', Counterparty_ID:'GP-1', Asset_Class_ID:'AC-1'};
  const schemas = ksp.kspGetBackendSchemas_();
  sheets.set('Pitchbook_Index', new Sheet('Pitchbook_Index', Array.from(schemas.Pitchbook_Index), []));
  sheets.set('Settings', new Sheet('Settings', ['Key','Value','Updated_At'], [
    {Key:'NEXT_BATCH_ID',Value:'1'}, {Key:'NEXT_DOCUMENT_ID',Value:'1'}]));
  const env = {getActor: () => actor, nowIso: () => '2026-09-08T01:00:00.000Z',
    getInstallationState: () => ({config:{},resources:{backendSpreadsheetId:'synthetic-backend',auditSpreadsheetId:'synthetic-audit',pitchbooksFolderId:'synthetic-folder'}}),
    readRows(_id, name) {return name === 'GP_Master' ? [{GP_ID:'GP-1',GP_Name:'Synthetic GP',Status:'Active'}] :
      [{Option_ID:'AC-1',Type:'ASSET_CLASS',Name:'Synthetic Asset',Status:'Active'}]},
    findRowByKey(_id, _sheet, _key, id) {return id === parent.Meeting_ID ? {...parent} : null}};
  ksp.kspAttachPitchbookReservationAdapters_(env, props);
  const input = {requestId:'synthetic-request-001',parentMeetingId:parent.Meeting_ID,expectedParentVersion:1,
    files:[{originalFilename:'one.pdf',sizeBytes:10,mimeType:'application/pdf'},
      {originalFilename:'two.pdf',sizeBytes:20,mimeType:'application/pdf'}]};
  const run = value => ksp.kspPreparePitchbookBatch_(env, value || input);
  const rows = () => ksp.kspReadObjectsFromSheet_(sheets.get('Pitchbook_Index'), schemas.Pitchbook_Index);
  return {ksp, input, run, writes, properties, sheets, parent, rows, setActor: value => {actor = value}};
}

test('same prepare request returns the same batch and slots with zero duplicate writes', () => {
  const f = fixture(), before = JSON.stringify(f.input);
  const first = f.run();assert.equal(first.ok, true, JSON.stringify(first));
  assert.equal(JSON.stringify(f.input), before);
  const count = f.writes.length;
  const second = f.run();assert.equal(second.ok, true, JSON.stringify(second));
  assert.equal(second.idempotentReplay, true);
  assert.equal(second.batchId, first.batchId);
  assert.deepEqual(JSON.parse(JSON.stringify(second.slots)), JSON.parse(JSON.stringify(first.slots)));
  assert.equal(f.writes.length, count);assert.equal(f.rows().length, 2);
});

test('same request ID rejects different actor, descriptor, classification or parent scope', () => {
  for (const change of ['actor','file','classification','parent']) {
    const f = fixture();assert.equal(f.run().ok, true);
    const count = f.writes.length, input = JSON.parse(JSON.stringify(f.input));
    if (change === 'actor') f.setActor('other-actor');
    if (change === 'file') input.files[0].sizeBytes++;
    if (change === 'classification') input.fundStrategy = 'different';
    if (change === 'parent') {f.parent.Meeting_ID = 'MTG-000002';input.parentMeetingId = f.parent.Meeting_ID}
    const result = f.run(input);assert.equal(result.ok, false, change);
    assert.equal(result.error.code, 'PITCHBOOK_PREPARE_REQUEST_CONFLICT');
    assert.equal(f.writes.length, count);
  }
});

test('fresh parent CAS after another link replays the same batch without reapplying parent defaults', () => {
  const f = fixture(), first = f.run();assert.equal(first.ok, true);
  const beforeRows = JSON.stringify(f.rows()), count = f.writes.length;
  f.parent.Version = 2;f.parent.Related_Pitchbook_IDs = 'DOC-OTHER';
  f.parent.Date = '2026-09-09';f.parent.Fund_Strategy = 'new parent default';
  assert.equal(f.run().error.code, 'STALE_RECORD_VERSION');
  const replay = f.run({...f.input,expectedParentVersion:2});
  assert.equal(replay.ok, true, JSON.stringify(replay));assert.equal(replay.idempotentReplay, true);
  assert.equal(replay.batchId, first.batchId);
  assert.deepEqual(Array.from(replay.slots, slot => slot.documentId), Array.from(first.slots, slot => slot.documentId));
  assert.ok(replay.slots.every(slot => slot.parentVersion === 2));
  assert.deepEqual(Array.from(replay.slots, slot => slot.slotFingerprint), Array.from(first.slots, slot => slot.slotFingerprint));
  assert.equal(JSON.stringify(f.rows()), beforeRows);assert.equal(f.writes.length, count);
});

test('missing, inactive, stale and racing parent fail before new mutations', () => {
  for (const change of ['missing','inactive','stale','parent-race']) {
    const f = fixture(change);
    if (change === 'missing') f.parent.Meeting_ID = 'MTG-000002';
    if (change === 'inactive') f.parent.Status = 'Inactive';
    if (change === 'stale') f.parent.Version = 2;
    assert.equal(f.run().ok, false, change);assert.equal(f.writes.length, 0);
  }
});

test('UNIDENTIFIED fallback can prepare and replay its exact random UUID request without writes', () => {
  const f = fixture();f.setActor('UNIDENTIFIED');
  const input = {...f.input, requestId:'f2d6d891-6f49-4b2b-a0bd-d614761748ea'};
  const first = f.run(input);assert.equal(first.ok, true, JSON.stringify(first));
  const count = f.writes.length, replay = f.run(input);
  assert.equal(replay.ok, true);assert.equal(replay.idempotentReplay, true);
  assert.equal(replay.batchId, first.batchId);assert.equal(f.writes.length, count);
  const changed = f.run({...input,files:[{...input.files[0],sizeBytes:11}]});
  assert.equal(changed.error.code, 'PITCHBOOK_PREPARE_REQUEST_CONFLICT');
  assert.equal(f.writes.length, count);
});

test('retained request capacity fails closed without eviction and still permits exact replay', () => {
  const f = fixture();assert.equal(f.run().ok, true);
  const key = f.ksp.kspPitchbookPrepareRequestKey_(f.input.requestId);
  const record = f.properties.get(key);
  for (let i = 0; i < 31; i++) f.properties.set(f.ksp.kspPitchbookPrepareRequestKey_('retained-request-' + i), record);
  const before = JSON.stringify([...f.properties]), count = f.writes.length;
  const result = f.run({...f.input,requestId:'new-request-over-cap'});
  assert.equal(result.error.code, 'PITCHBOOK_PREPARE_CAPACITY_EXCEEDED');
  assert.equal(f.run().idempotentReplay, true);
  assert.equal(f.writes.length, count);assert.equal(JSON.stringify([...f.properties]), before);
});

test('intent/counter/partial-row uncertainty blocks duplicate and fresh allocations without repair writes', () => {
  for (const failure of ['intent-after','reservation-before','counter-before','counter-after','rows-before','row-partial']) {
    const f = fixture(failure);assert.equal(f.run().ok, false, failure);
    assert.ok([...f.properties.keys()].some(key => key.includes('REQUEST_')), failure);
    const count = f.writes.length;
    assert.equal(f.run().error.code, 'PITCHBOOK_PREPARE_UNCERTAIN', failure);
    assert.equal(f.run({...f.input,requestId:'synthetic-request-002'}).error.code, 'PITCHBOOK_PREPARE_UNCERTAIN', failure);
    assert.equal(f.writes.length, count, failure);
  }
});

test('lost row-write response or final marker recovers a fully read-back batch without writes', () => {
  for (const failure of ['rows-after','complete-before']) {
    const f = fixture(failure);assert.equal(f.run().ok, false);
    const count = f.writes.length;
    const result = f.run();assert.equal(result.ok, true, JSON.stringify(result));
    assert.equal(result.batchId, 'BAT-000001');assert.equal(result.idempotentReplay, true);
    assert.equal(f.writes.length, count);assert.equal(f.rows().length, 2);
  }
});

test('readback rejects missing, extra, duplicated or altered rows and altered reservation', () => {
  for (const change of ['missing','extra','duplicate','changed','reservation']) {
    const f = fixture();assert.equal(f.run().ok, true);
    const sheet = f.sheets.get('Pitchbook_Index');
    if (change === 'missing') sheet.values.pop();
    if (change === 'extra' || change === 'duplicate') {
      const row = sheet.values[1].slice();
      row[sheet.values[0].indexOf(change === 'extra' ? 'Document_ID' : 'Batch_ID')] = change === 'extra' ? 'DOC-999999' : 'BAT-999999';
      sheet.values.push(row);
    }
    if (change === 'changed') sheet.values[1][sheet.values[0].indexOf('Saved_Filename')] = 'changed.pdf';
    if (change === 'reservation') {
      const key = f.ksp.kspPitchbookReservationKey_('BAT-000001'), value = JSON.parse(f.properties.get(key));
      value.files[0].sizeBytes++;f.properties.set(key, JSON.stringify(value));
    }
    const count = f.writes.length;
    assert.equal(f.run().error.code, 'PITCHBOOK_PREPARE_UNCERTAIN', change);
    assert.equal(f.writes.length, count);
  }
});

test('completed upload cleanup can read back original slots, while missing pending reservation cannot', () => {
  for (const active of [true, false]) {
    const f = fixture();assert.equal(f.run().ok, true);
    const sheet = f.sheets.get('Pitchbook_Index');
    if (active) for (const row of sheet.values.slice(1)) {
      row[sheet.values[0].indexOf('Status')] = 'Active';
      row[sheet.values[0].indexOf('File_ID')] = 'synthetic-' + row[0];
      row[sheet.values[0].indexOf('File_URL')] = 'https://drive.google.com/open?id=synthetic-' + row[0];
    }
    f.properties.delete(f.ksp.kspPitchbookReservationKey_('BAT-000001'));
    const count = f.writes.length, result = f.run();assert.equal(result.ok, active);
    assert.equal(f.writes.length, count);
  }
});

test('invalid request ID, failed intent persistence and oversized intent allocate no rows or counters', () => {
  const invalid = fixture();assert.equal(invalid.run({...invalid.input,requestId:'bad'}).ok, false);assert.equal(invalid.writes.length, 0);
  const failed = fixture('intent-before');assert.equal(failed.run().ok, false);assert.equal(failed.writes.length, 0);
  const large = fixture();
  const input = {...large.input,files:Array.from({length:10},(_,i)=>({originalFilename:'資'.repeat(240)+i+'.pdf',sizeBytes:1,mimeType:'application/pdf'}))};
  const result = large.run(input);assert.equal(result.error.code, 'PITCHBOOK_PREPARE_INTENT_TOO_LARGE');assert.equal(large.writes.length, 0);
});
