const test = require('node:test');
const assert = require('node:assert/strict');
const { ksp, catalogRows, createFakeEnvironment } = require('./maintenance-test-fixture.cjs');
test('maintenance bootstrap returns options and both Master tables', () => {
  const result=ksp.kspGetPhase1MaintenanceBootstrap_(createFakeEnvironment());
  assert.equal(result.ok,true); assert.equal(result.options.gps.length,3); assert.ok(result.options.gps.some(item=>item.status==='Inactive')); assert.equal(result.masters.gps.length,3); assert.equal(result.masters.options.length,6); assert.equal(result.options.teams[0].name,'PD'); assert.equal(result.options.counterpartyTypes.length,6);
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

test('Meeting update Audit serializes equivalent Sheets Date and Time values canonically', () => {
  const env=createFakeEnvironment({meetingRows:[{
    Meeting_ID:'MTG-000001', Date:new Date('2026-08-26T15:00:00.000Z'), Time:new Date(Date.UTC(1899,11,30,5,30)),
    Location_ID:'', GP_ID:'GP-000002', Asset_Class_ID:'OPT-AC-002', Capital_Type_ID:'', Counterparty:'',
    Internal_Participants:'Before', Doc_File_ID:'doc-1', Doc_URL:'https://example/doc-1',
    Saved_Filename:'2026-08-27_KKR_Infrastructure_MTG-000001', Status:'Active', Version:2,
    Created_At:'2026-08-01T00:00:00.000Z', Updated_At:'2026-08-27T00:00:00.000Z', Updated_By:'old',
    AI_Document_Name:'', AI_Index_Status:'Indexed', AI_Indexed_At:'', AI_Content_Hash:'', AI_Last_Error:'',
    Follow_Up_Required:true, Follow_Up_Note:'private follow-up'
  }]});
  const result=ksp.kspUpdateMeetingMaintenance_(env,{
    meetingId:'MTG-000001', expectedVersion:2, date:'2026-08-27', time:'14:30', locationId:'',
    gpId:'GP-000002', assetClassId:'OPT-AC-002', capitalTypeId:'', counterparty:'',
    internalParticipants:'After', followUpRequired:true, followUpNote:'private follow-up', notes:'private body'
  });
  assert.equal(result.ok,true,JSON.stringify(result));
  assert.equal(env._debug.audits.length,1);
  const audit=env._debug.audits[0];
  assert.equal(audit.Action,'MEETING_UPDATE');
  assert.deepEqual(audit.Changed_Fields.split(','),['Internal_Participants','Version','Updated_At']);
  const before=JSON.parse(audit.Before_Metadata_JSON); const after=JSON.parse(audit.After_Metadata_JSON);
  assert.equal(before.Date,'2026-08-27'); assert.equal(after.Date,'2026-08-27');
  assert.equal(before.Time,'14:30'); assert.equal(after.Time,'14:30');
  assert.equal(Object.hasOwn(before,'Follow_Up_Note'),false); assert.equal(Object.hasOwn(after,'Follow_Up_Note'),false);
  assert.equal(JSON.stringify({before,after}).includes('private'),false);
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
  assert.equal(result.ok,true); assert.equal(result.record.documentId,'DOC-000001'); assert.equal(result.record.fileId,'file-1'); assert.equal(result.record.sequenceNo,2); assert.equal(result.record.savedFilename,'2026-08-02_Apollo_PE_02.pdf');
});

test('Pitchbook Fund Strategy-only edit preserves stable identity, sequence, and filename for a live Date row', () => {
  const env=createFakeEnvironment({pitchbookRows:[{
    Document_ID:'DOC-000001',Batch_ID:'BAT-000001',Date:new Date(Date.UTC(2026,7,1)),GP_ID:'GP-000002',
    Asset_Class_ID:'OPT-AC-002',Capital_Type_ID:'',Sequence_No:1,File_ID:'file-1',File_URL:'https://example/file-1',
    Original_Filename:'source.pdf',Saved_Filename:'2026-08-01_KKR_Infrastructure_01.pdf',Status:'Active',
    Updated_At:'2026-08-01T00:00:00.000Z',Updated_By:'old',AI_Index_Status:'Indexed',AI_Last_Error:'',Fund_Strategy:''
  }]});
  const result=ksp.kspUpdatePitchbookMaintenance_(env,{documentId:'DOC-000001',expectedUpdatedAt:'2026-08-01T00:00:00.000Z',date:'2026-08-01',gpId:'GP-000002',assetClassId:'OPT-AC-002',capitalTypeId:'',fundStrategy:'Infra Fund IV'});
  assert.equal(result.ok,true,JSON.stringify(result));
  assert.equal(result.record.documentId,'DOC-000001');
  assert.equal(result.record.fileId,'file-1');
  assert.equal(result.record.sequenceNo,1);
  assert.equal(result.record.savedFilename,'2026-08-01_KKR_Infrastructure_01.pdf');
  assert.equal(env._debug.files.get('file-1').name,'2026-08-01_KKR_Infrastructure_01.pdf');
});

test('stale Pitchbook metadata update is rejected without renaming file', () => {
  const env=createFakeEnvironment(); const before={...env._debug.files.get('file-1')};
  const result=ksp.kspUpdatePitchbookMaintenance_(env,{documentId:'DOC-000001',expectedUpdatedAt:'stale',date:'2026-08-02',gpId:'GP-000001',assetClassId:'OPT-AC-001',capitalTypeId:''});
  assert.equal(result.ok,false); assert.equal(result.error.code,'STALE_RECORD_VERSION'); assert.deepEqual(env._debug.files.get('file-1'),before);
});

test('failed Pitchbook metadata commit restores filename and releases the edit claim', () => {
  const env=createFakeEnvironment({commitError:true}); const before={...env._debug.files.get('file-1')};
  const result=ksp.kspUpdatePitchbookMaintenance_(env,{documentId:'DOC-000001',expectedUpdatedAt:'2026-08-01T00:00:00.000Z',date:'2026-08-02',gpId:'GP-000001',assetClassId:'OPT-AC-001',capitalTypeId:''});
  assert.equal(result.ok,false);
  assert.deepEqual(env._debug.files.get('file-1'),before);
  assert.equal(env._debug.claims.size,0);
});

test('Pitchbook status cannot reactivate a row without authoritative file', () => {
  const env=createFakeEnvironment({pitchbookRows:[{Document_ID:'DOC-000003',Batch_ID:'BAT-3',Date:'2026-08-01',GP_ID:'GP-000001',Asset_Class_ID:'OPT-AC-001',Capital_Type_ID:'',Sequence_No:1,File_ID:'',File_URL:'',Original_Filename:'x.pdf',Saved_Filename:'x.pdf',Status:'Inactive',Updated_At:'t'}]});
  const result=ksp.kspChangePitchbookStatus_(env,{documentId:'DOC-000003',expectedUpdatedAt:'t',targetStatus:'Active'});
  assert.equal(result.ok,false); assert.equal(result.error.code,'PITCHBOOK_AUTHORITATIVE_FILE_MISSING');
});

test('Pitchbook status uses production parser and preserves file identity', () => {
  const env=createFakeEnvironment();
  const result=ksp.kspChangePitchbookStatus_(env,{documentId:'DOC-000001',expectedUpdatedAt:'2026-08-01T00:00:00.000Z',targetStatus:'Inactive'});
  assert.equal(result.ok,true);
  assert.equal(result.record.status,'Inactive');
  assert.equal(result.record.fileId,'file-1');
  assert.equal(result.record.fileUrl,'https://example/file-1');
  assert.equal(env._debug.pitchbookRows[0].Status,'Inactive');
  assert.equal(env._debug.pitchbookRows[0].AI_Index_Status,'Pending');
  assert.equal(env._debug.audits.length,1);
  assert.equal(env._debug.audits[0].Action,'PITCHBOOK_DEACTIVATE');
  assert.equal(env._debug.audits[0].Result,'Success');
  assert.equal(env._debug.audits[0].Error_Code,'');
  assert.equal(env._debug.files.get('file-1').name,'2026-08-01_KKR_Infrastructure_01.pdf');
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

test('non-GP Counterparty Entity uses existing Option Master mutation path',()=>{
  const env=createFakeEnvironment();
  const result=ksp.kspMutateMaster_(env,{entity:'OPTION',action:'ADD',type:'COUNTERPARTY_OTHER',name:'Synthetic Other Entity'});
  assert.equal(result.ok,true,JSON.stringify(result));assert.equal(result.record.Type,'COUNTERPARTY_OTHER');assert.match(result.record.Option_ID,/^OPT-CPOT-/);
  assert.equal(result.masters.options.some(item=>item.type==='COUNTERPARTY_OTHER'&&item.name==='Synthetic Other Entity'),true);
});

test('rich Meeting search and edit round-trip structured context without follow-up Audit content', () => {
  const meeting={Meeting_ID:'MTG-000010',Date:'2026-08-10',Time:'',Location_ID:'',GP_ID:'GP-000002',Asset_Class_ID:'OPT-AC-002',Capital_Type_ID:'',Team_ID:'OPT-TEAM-001',Fund_Strategy:'Fund Alpha',Meeting_Type_Codes:'ANNUAL_REVIEW,OFFICE_VISIT',Related_Pitchbook_IDs:'DOC-000001',Follow_Up_Required:true,Follow_Up_Note:'private follow-up',Doc_File_ID:'doc-rich',Doc_URL:'https://example/doc-rich',Saved_Filename:'rich',Status:'Active',Version:1,Updated_At:'2026-08-10T00:00:00.000Z',AI_Index_Status:'Indexed'};
  const env=createFakeEnvironment({meetingRows:[meeting],documents:{'doc-rich':{name:'rich',text:'日付: 2026-08-10\nGP: KKR\nAsset Class: Infrastructure\n\n面談内容:\nlegacy body'}}});
  const search=ksp.kspSearchMeetingRecords_(env,{teamId:'OPT-TEAM-001',fundStrategy:'alpha',meetingTypeCode:'OFFICE_VISIT',followUpOnly:true});
  assert.equal(search.ok,true);assert.equal(search.records.length,1);assert.equal(search.records[0].teamName,'PD');assert.deepEqual(Array.from(search.records[0].relatedPitchbookIds),['DOC-000001']);
  const opened=ksp.kspGetMeetingMaintenanceRecord_(env,'MTG-000010');assert.equal(opened.ok,true);assert.equal(opened.record.followUpNote,'private follow-up');assert.ok(opened.record.relatedPitchbooks.some(item=>item.id==='DOC-000001'));
  const updated=ksp.kspUpdateMeetingMaintenance_(env,{meetingId:'MTG-000010',expectedVersion:1,date:'2026-08-11',gpId:'GP-000002',assetClassId:'OPT-AC-002',teamId:'OPT-TEAM-001',fundStrategy:'Fund Alpha II',meetingTypeCodes:['ANNUAL_GENERAL_MEETING'],relatedPitchbookIds:['DOC-000001'],followUpRequired:true,followUpNote:'new private note',notes:'edited body'});
  assert.equal(updated.ok,true,JSON.stringify(updated));assert.equal(updated.record.fundStrategy,'Fund Alpha II');assert.deepEqual(Array.from(updated.record.meetingTypeCodes),['ANNUAL_GENERAL_MEETING']);assert.equal(JSON.stringify(env._debug.audits).includes('new private note'),false);
});

test('existing linked Pitchbook remains available after inactivation', () => {
  const choices=ksp.kspBuildMaintenanceRelatedPitchbookChoices_([
    {Document_ID:'DOC-000001',Date:'2026-08-01',GP_ID:'GP-000002',Asset_Class_ID:'OPT-AC-002',Status:'Inactive',Saved_Filename:'linked.pdf'},
    {Document_ID:'DOC-000002',Date:'2026-08-02',GP_ID:'GP-000002',Asset_Class_ID:'OPT-AC-002',Status:'Active',Saved_Filename:'active.pdf'},
    {Document_ID:'DOC-000003',Date:'2026-08-03',GP_ID:'GP-000001',Asset_Class_ID:'OPT-AC-002',Status:'Active',Saved_Filename:'mismatch.pdf'}
  ],'GP-000002','OPT-AC-002',['DOC-000001']);
  assert.deepEqual(Array.from(choices,item=>item.id),['DOC-000002','DOC-000001']);
  assert.equal(choices.find(item=>item.id==='DOC-000001').preserved,true);
  const unresolved=ksp.kspBuildMaintenanceRelatedPitchbookChoices_([],['GP-000002'],'OPT-AC-002',['DOC-009999']);
  assert.equal(unresolved.length,1);assert.equal(unresolved[0].id,'DOC-009999');assert.equal(unresolved[0].preserved,true);assert.equal(unresolved[0].unresolved,true);
});

test('non-GP Meeting reopens, edits and searches by typed entity plus Related GP',()=>{
  const meeting={Meeting_ID:'MTG-000020',Date:'2026-08-10',Time:'',Location_ID:'',GP_ID:'',Counterparty_Type:'LP_ASSET_OWNER',Counterparty_ID:'OPT-CPLP-001',Related_GP_IDs:'GP-000001',Asset_Class_ID:'OPT-AC-002',Capital_Type_ID:'',Related_Pitchbook_IDs:'DOC-000020',Doc_File_ID:'doc-non-gp',Doc_URL:'https://example/doc-non-gp',Saved_Filename:'synthetic',Status:'Active',Version:1,Updated_At:'2026-08-10T00:00:00.000Z',AI_Index_Status:'Indexed'};
  const pitchbook={Document_ID:'DOC-000020',Batch_ID:'BAT-000020',Date:'2026-08-09',GP_ID:'GP-000001',Asset_Class_ID:'OPT-AC-002',Capital_Type_ID:'',Sequence_No:1,File_ID:'file-20',File_URL:'https://example/file-20',Original_Filename:'source.pdf',Saved_Filename:'matching.pdf',Status:'Active',Updated_At:'2026-08-09T00:00:00.000Z'};
  const env=createFakeEnvironment({meetingRows:[meeting],pitchbookRows:[pitchbook],documents:{'doc-non-gp':{name:'synthetic',text:'日付: 2026-08-10\n面談先区分: LP / Asset Owner\n面談先: Synthetic Asset Owner\n関連GP: Apollo\nAsset Class: Infrastructure\n\n面談内容:\nbody'}}});
  const opened=ksp.kspGetMeetingMaintenanceRecord_(env,'MTG-000020');assert.equal(opened.ok,true);assert.equal(opened.record.counterpartyEntityName,'Synthetic Asset Owner');assert.deepEqual(Array.from(opened.record.relatedGpIds),['GP-000001']);assert.ok(opened.record.relatedPitchbooks.some(item=>item.id==='DOC-000020'));
  const updated=ksp.kspUpdateMeetingMaintenance_(env,{meetingId:'MTG-000020',expectedVersion:1,date:'2026-08-10',counterpartyType:'LP_ASSET_OWNER',counterpartyId:'OPT-CPLP-001',relatedGpIds:['GP-000001'],assetClassId:'OPT-AC-002',fundStrategy:'Synthetic strategy',relatedPitchbookIds:['DOC-000020'],notes:'edited'});
  assert.equal(updated.ok,true,JSON.stringify(updated));assert.equal(updated.record.gpId,'');assert.equal(updated.record.counterpartyType,'LP_ASSET_OWNER');
  const found=ksp.kspSearchMeetingRecords_(env,{counterpartyType:'LP_ASSET_OWNER',counterpartyId:'OPT-CPLP-001',relatedGpId:'GP-000001'});assert.equal(found.ok,true);assert.equal(found.records.length,1);assert.equal(found.records[0].fundStrategy,'Synthetic strategy');
});

test('Pitchbook Fund Strategy survives edit/search and legacy blank remains valid', () => {
  const env=createFakeEnvironment();
  const updated=ksp.kspUpdatePitchbookMaintenance_(env,{documentId:'DOC-000001',expectedUpdatedAt:'2026-08-01T00:00:00.000Z',date:'2026-08-01',gpId:'GP-000002',assetClassId:'OPT-AC-002',capitalTypeId:'',fundStrategy:'Infra Fund IV'});
  assert.equal(updated.ok,true);assert.equal(updated.record.fundStrategy,'Infra Fund IV');
  const found=ksp.kspSearchPitchbookRecords_(env,{fundStrategy:'fund iv'});assert.equal(found.ok,true);assert.equal(found.records.length,1);
  const legacy=ksp.kspSearchPitchbookRecords_(createFakeEnvironment(),{fundStrategy:''});assert.equal(legacy.ok,true);assert.equal(legacy.records.length,2);
});

test('Pitchbook Fund Strategy-only edit preserves Sheets Date and remains exactly searchable after round-trip', () => {
  const rawDate=new Date('2026-07-31T15:00:00.000Z');
  const row={Document_ID:'DOC-000001',Batch_ID:'BAT-000001',Date:rawDate,GP_ID:'GP-000002',Asset_Class_ID:'OPT-AC-002',Capital_Type_ID:'OPT-CT-001',Sequence_No:1,File_ID:'file-1',File_URL:'https://example/file-1',Original_Filename:'source.pdf',Saved_Filename:'2026-08-01_KKR_Infrastructure_Equity_01.pdf',Status:'Active',Created_At:'2026-08-01T00:00:00.000Z',Updated_At:'2026-08-01T00:00:00.000Z',Created_By:'creator',Updated_By:'old',AI_Index_Status:'Indexed',AI_Last_Error:'',Fund_Strategy:''};
  const env=createFakeEnvironment({pitchbookRows:[row]});
  const updated=ksp.kspUpdatePitchbookMaintenance_(env,{documentId:'DOC-000001',expectedUpdatedAt:'2026-08-01T00:00:00.000Z',date:'2026-08-01',gpId:'GP-000002',assetClassId:'OPT-AC-002',capitalTypeId:'OPT-CT-001',fundStrategy:'Infra Fund IV'});
  assert.equal(updated.ok,true,JSON.stringify(updated));
  assert.equal(env._debug.pitchbookRows[0].Date,rawDate);
  assert.equal(env._debug.pitchbookWrites.length,1);
  assert.equal(env._debug.pitchbookWrites[0].includes('Date'),false);
  const found=ksp.kspSearchPitchbookRecords_(env,{dateFrom:'2026-08-01',dateTo:'2026-08-01',gpId:'GP-000002',assetClassId:'OPT-AC-002',capitalTypeId:'OPT-CT-001',status:'Active'});
  assert.equal(found.ok,true);assert.equal(found.records.length,1);assert.equal(found.records[0].fundStrategy,'Infra Fund IV');
  assert.equal(env._debug.audits.length,1);
  assert.equal(env._debug.audits[0].Changed_Fields.split(',').includes('Date'),false);
});

test('true Pitchbook date and context change writes Date, allocates sequence and remains searchable', () => {
  const target={Document_ID:'DOC-000001',Batch_ID:'BAT-000001',Date:new Date('2026-07-31T15:00:00.000Z'),GP_ID:'GP-000002',Asset_Class_ID:'OPT-AC-002',Capital_Type_ID:'OPT-CT-001',Sequence_No:1,File_ID:'file-1',File_URL:'https://example/file-1',Original_Filename:'source.pdf',Saved_Filename:'old.pdf',Status:'Active',Updated_At:'2026-08-01T00:00:00.000Z',AI_Index_Status:'Indexed',Fund_Strategy:''};
  const existing={Document_ID:'DOC-000002',Batch_ID:'BAT-000002',Date:new Date('2026-08-01T15:00:00.000Z'),GP_ID:'GP-000001',Asset_Class_ID:'OPT-AC-001',Capital_Type_ID:'OPT-CT-001',Sequence_No:4,File_ID:'file-2',Original_Filename:'other.pdf',Saved_Filename:'other.pdf',Status:'Inactive',Updated_At:'other'};
  const env=createFakeEnvironment({pitchbookRows:[target,existing]});
  const updated=ksp.kspUpdatePitchbookMaintenance_(env,{documentId:'DOC-000001',expectedUpdatedAt:'2026-08-01T00:00:00.000Z',date:'2026-08-02',gpId:'GP-000001',assetClassId:'OPT-AC-001',capitalTypeId:'OPT-CT-001',fundStrategy:'Fund Delta'});
  assert.equal(updated.ok,true,JSON.stringify(updated));
  assert.equal(updated.record.date,'2026-08-02');assert.equal(updated.record.sequenceNo,5);assert.equal(updated.record.savedFilename,'2026-08-02_Apollo_PE_Equity_05.pdf');
  assert.equal(env._debug.pitchbookWrites[0].includes('Date'),true);
  const found=ksp.kspSearchPitchbookRecords_(env,{dateFrom:'2026-08-02',dateTo:'2026-08-02',gpId:'GP-000001',assetClassId:'OPT-AC-001',capitalTypeId:'OPT-CT-001',status:'Active'});
  assert.equal(found.records.length,1);assert.equal(found.records[0].documentId,'DOC-000001');
});
