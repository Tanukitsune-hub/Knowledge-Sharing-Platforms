const test = require('node:test');
const assert = require('node:assert/strict');
const { ksp, catalogRows, createFakeEnvironment } = require('./maintenance-test-fixture.cjs');
test('maintenance bootstrap returns options and both Master tables', () => {
  const result=ksp.kspGetPhase1MaintenanceBootstrap_(createFakeEnvironment());
  assert.equal(result.ok,true); assert.equal(result.options.gps.length,3); assert.ok(result.options.gps.some(item=>item.status==='Inactive')); assert.equal(result.masters.gps.length,3); assert.equal(result.masters.options.length,4);
});

test('Meeting search returns mapped display names', () => {
  const result=ksp.kspSearchMeetingRecords_(createFakeEnvironment(),{gpId:'GP-000002'});
  assert.equal(result.ok,true); assert.equal(result.records.length,1); assert.equal(result.records[0].gpName,'KKR');
});

test('Meeting update preserves ID/Doc, increments Version, updates Doc, and audits metadata only', () => {
  const env=createFakeEnvironment();
  const result=ksp.kspUpdateMeetingMaintenance_(env,{meetingId:'MTG-000001',expectedVersion:1,date:'2026-08-03',time:'10:00',locationId:'OPT-LOC-001',gpId:'GP-000002',assetClassId:'OPT-AC-002',capitalTypeId:'OPT-CT-001',counterparty:'Person',internalParticipants:'Team',notes:'secret\nnotes'});
  assert.equal(result.ok,true); assert.equal(result.record.meetingId,'MTG-000001'); assert.equal(result.record.documentId,'doc-1'); assert.equal(result.record.version,2);
  assert.match(env._debug.documents.get('doc-1').text,/secret\nnotes/);
  assert.equal(JSON.stringify(env._debug.audits).includes('secret'),false);
});

test('stale Meeting update is rejected without mutating the document', () => {
  const env=createFakeEnvironment(); const before={...env._debug.documents.get('doc-1')};
  const result=ksp.kspUpdateMeetingMaintenance_(env,{meetingId:'MTG-000001',expectedVersion:99,date:'2026-08-03',gpId:'GP-000002',assetClassId:'OPT-AC-002',notes:'new'});
  assert.equal(result.ok,false); assert.equal(result.error.code,'STALE_RECORD_VERSION'); assert.deepEqual(env._debug.documents.get('doc-1'),before);
});

test('failed Meeting commit restores Doc while claim is still owned', () => {
  const env=createFakeEnvironment({commitError:true}); const before={...env._debug.documents.get('doc-1')};
  const result=ksp.kspUpdateMeetingMaintenance_(env,{meetingId:'MTG-000001',expectedVersion:1,date:'2026-08-03',gpId:'GP-000002',assetClassId:'OPT-AC-002',notes:'new'});
  assert.equal(result.ok,false); assert.deepEqual(env._debug.documents.get('doc-1'),before);
});

test('Meeting status update rejects stale version and otherwise increments Version', () => {
  const env=createFakeEnvironment();
  const ok=ksp.kspChangeMeetingStatus_(env,{meetingId:'MTG-000001',expectedVersion:1,targetStatus:'Inactive'});
  assert.equal(ok.ok,true); assert.equal(ok.record.status,'Inactive'); assert.equal(ok.record.version,2);
  const stale=ksp.kspChangeMeetingStatus_(env,{meetingId:'MTG-000001',expectedVersion:1,targetStatus:'Active'});
  assert.equal(stale.ok,false); assert.equal(stale.error.code,'STALE_RECORD_VERSION');
});

test('Pitchbook context move allocates destination next sequence and preserves File ID', () => {
  const env=createFakeEnvironment();
  const result=ksp.kspUpdatePitchbookMaintenance_(env,{documentId:'DOC-000001',expectedUpdatedAt:'2026-08-01T00:00:00.000Z',date:'2026-08-02',gpId:'GP-000001',assetClassId:'OPT-AC-001',capitalTypeId:''});
  assert.equal(result.ok,true); assert.equal(result.record.fileId,'file-1'); assert.equal(result.record.sequenceNo,2); assert.match(result.record.savedFilename,/_02\.pdf$/);
});

test('stale Pitchbook metadata update is rejected without renaming file', () => {
  const env=createFakeEnvironment(); const before={...env._debug.files.get('file-1')};
  const result=ksp.kspUpdatePitchbookMaintenance_(env,{documentId:'DOC-000001',expectedUpdatedAt:'stale',date:'2026-08-02',gpId:'GP-000001',assetClassId:'OPT-AC-001',capitalTypeId:''});
  assert.equal(result.ok,false); assert.equal(result.error.code,'STALE_RECORD_VERSION'); assert.deepEqual(env._debug.files.get('file-1'),before);
});

test('Pitchbook status cannot reactivate a row without authoritative file', () => {
  const env=createFakeEnvironment({pitchbookRows:[{Document_ID:'DOC-000003',Batch_ID:'BAT-3',Date:'2026-08-01',GP_ID:'GP-000001',Asset_Class_ID:'OPT-AC-001',Capital_Type_ID:'',Sequence_No:1,File_ID:'',File_URL:'',Original_Filename:'x.pdf',Saved_Filename:'x.pdf',Status:'Inactive',Updated_At:'t'}]});
  const result=ksp.kspChangePitchbookStatus_(env,{documentId:'DOC-000003',expectedUpdatedAt:'t',targetStatus:'Active'});
  assert.equal(result.ok,false); assert.equal(result.error.code,'PITCHBOOK_AUTHORITATIVE_FILE_MISSING');
});

test('quick-add GP returns an existing normalized duplicate instead of adding a row', () => {
  const env=createFakeEnvironment(); const before=env._debug.gpRows.length;
  const result=ksp.kspQuickAddGp_(env,'  ＡＰＯＬＬＯ ');
  assert.equal(result.ok,true); assert.equal(result.gp.id,'GP-000001'); assert.equal(env._debug.gpRows.length,before);
});

test('Master add, rename, reorder, deactivate and reactivate are supported', () => {
  const env=createFakeEnvironment();
  const add=ksp.kspMutateMaster_(env,{entity:'OPTION',action:'ADD',type:'ASSET_CLASS',name:'VC'}); assert.equal(add.ok,true);
  const id=add.record.Option_ID;
  const rename=ksp.kspMutateMaster_(env,{entity:'OPTION',action:'RENAME',id,name:'Venture Capital'}); assert.equal(rename.record.Name,'Venture Capital');
  const reorder=ksp.kspMutateMaster_(env,{entity:'OPTION',action:'REORDER',id,sortOrder:1}); assert.equal(reorder.record.Sort_Order,1);
  const off=ksp.kspMutateMaster_(env,{entity:'OPTION',action:'DEACTIVATE',id}); assert.equal(off.record.Status,'Inactive');
  const on=ksp.kspMutateMaster_(env,{entity:'OPTION',action:'REACTIVATE',id}); assert.equal(on.record.Status,'Active');
});

test('Actor and audit failures are non-blocking to a successful Meeting update', () => {
  const env=createFakeEnvironment({actorError:true,auditError:true});
  const result=ksp.kspUpdateMeetingMaintenance_(env,{meetingId:'MTG-000001',expectedVersion:1,date:'2026-08-03',gpId:'GP-000002',assetClassId:'OPT-AC-002',notes:''});
  assert.equal(result.ok,true); assert.ok(result.warnings.some(x=>x.code==='ACTOR_RESOLUTION_FAILED')); assert.ok(result.warnings.some(x=>x.code==='AUDIT_WRITE_FAILED'));
});

test('audit retention cleanup removes old rows and writes a cleanup event', () => {
  const env=createFakeEnvironment();
  env._debug.audits.push({Event_Timestamp:'2020-01-01T00:00:00.000Z'},{Event_Timestamp:'2025-01-01T00:00:00.000Z'});
  const result=ksp.kspRunAuditRetentionCleanup_(env);
  assert.equal(result.ok,true); assert.equal(result.deletedRows,1); assert.ok(env._debug.audits.some(row=>row.Action==='AUDIT_RETENTION_CLEANUP'));
});

test('historical records keep display names after a Master becomes Inactive', () => {
  const maps = ksp.kspBuildAllMasterMaps_(
    [{ GP_ID:'GP-9', GP_Name:'Former GP', Status:'Inactive' }],
    [{ Option_ID:'OPT-AC-9', Type:'ASSET_CLASS', Name:'Former Class', Status:'Inactive' }]
  );
  const record = ksp.kspMapMeetingSearchResult_({ Meeting_ID:'MTG-000009', GP_ID:'GP-9', Asset_Class_ID:'OPT-AC-9' }, maps);
  assert.equal(record.gpName,'Former GP');
  assert.equal(record.assetClassName,'Former Class');
});

test('Option reorder audit snapshot captures every affected option order', () => {
  const rows=[
    {Option_ID:'OPT-AC-001',Type:'ASSET_CLASS',Name:'PE',Sort_Order:2},
    {Option_ID:'OPT-AC-002',Type:'ASSET_CLASS',Name:'VC',Sort_Order:1}
  ];
  const snapshot=ksp.kspOptionOrderAuditSnapshot_(rows);
  assert.deepEqual(Array.from(snapshot, row=>row.Option_ID),['OPT-AC-002','OPT-AC-001']);
  assert.deepEqual(Array.from(snapshot, row=>row.Sort_Order),[1,2]);
});

test('explicit invalid search limits are rejected rather than silently reset', () => {
  assert.throws(() => ksp.kspValidateRecordSearch_(ksp.kspNormalizeRecordSearch_({ limit: -1 })), /検索件数上限/);
  assert.throws(() => ksp.kspValidateRecordSearch_(ksp.kspNormalizeRecordSearch_({ limit: 9999 })), /検索件数上限/);
});

test('Phase 1 diagnostics are non-destructive and report resource/schema/capability health', () => {
  const env=createFakeEnvironment();
  const result=ksp.kspGetPhase1Diagnostics_(env);
  assert.equal(result.ok,true);assert.equal(result.healthy,true);
  assert.equal(result.resources.backendAuditSeparated,true);
  assert.equal(result.actor.kind,'EMAIL');
  assert.equal(result.capabilities.geminiFileSearch,false);
  assert.equal(result.capabilities.liveQualified,false);
  assert.ok(result.schemas.backend.every(check=>check.ok));
  assert.ok(result.schemas.audit.every(check=>check.ok));
});

test('Phase 1 diagnostics expose Actor fallback kind without exposing the Actor value', () => {
  const env=createFakeEnvironment({actorError:true});
  const result=ksp.kspGetPhase1Diagnostics_(env);
  assert.equal(result.ok,true);assert.equal(result.actor.kind,'UNIDENTIFIED');assert.equal(result.actor.warningCount,1);
  assert.equal(Object.hasOwn(result.actor,'value'),false);
});
