const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const context = vm.createContext({
  console, JSON, Object, Array, String, Number, Boolean, Date, Math, RegExp, Error,
  Map, Set
});

const prelude = `
var KSP_STATUS={ACTIVE:'Active',INACTIVE:'Inactive'};
var KSP_PITCHBOOK_STATUS={PENDING:'Pending',ACTIVE:'Active',FAILED:'Failed',INACTIVE:'Inactive'};
var KSP_AI_INDEX_STATUS={NOT_INDEXED:'NotIndexed',PENDING:'Pending',INDEXED:'Indexed',FAILED:'Failed'};
var KSP_AUDIT_RESULTS={SUCCESS:'Success',FAILURE:'Failure'};
var KSP_OPTION_TYPES={LOCATION:'LOCATION',ASSET_CLASS:'ASSET_CLASS',CAPITAL_TYPE:'CAPITAL_TYPE'};
var KSP_SHEET_NAMES={GP_MASTER:'GP_Master',OPTION_MASTER:'Option_Master',MEETING_INDEX:'Meeting_Index',PITCHBOOK_INDEX:'Pitchbook_Index',AUDIT_LOG:'Audit_Log'};
var KSP_RESOURCE_KEYS={BACKEND_SPREADSHEET:'backendSpreadsheetId',AUDIT_SPREADSHEET:'auditSpreadsheetId'};
function kspAssert(c,code,msg){if(!c){var e=new Error(msg);e.code=code;throw e;}}
function kspGetErrorCode(e){return e&&e.code?e.code:'UNEXPECTED_ERROR'}
function kspDeepClone(v){return v===undefined?undefined:JSON.parse(JSON.stringify(v))}
function kspUniqueStrings(v){return [...new Set(v)]}
function kspToPositiveInteger(v,d){var n=Number(v);return Number.isFinite(n)&&n>0&&Math.floor(n)===n?n:d}
function kspIsValidDateKey(v){var m=/^(\\d{4})-(\\d{2})-(\\d{2})$/.exec(String(v||''));if(!m)return false;var d=new Date(Date.UTC(+m[1],+m[2]-1,+m[3]));return d.getUTCFullYear()===+m[1]&&d.getUTCMonth()===+m[2]-1&&d.getUTCDate()===+m[3]}
function kspNormalizeMeetingInput(i){i=i||{};return{date:String(i.date||'').trim(),time:String(i.time||'').trim(),locationId:String(i.locationId||'').trim(),gpId:String(i.gpId||'').trim(),assetClassId:String(i.assetClassId||'').trim(),capitalTypeId:String(i.capitalTypeId||'').trim(),counterparty:String(i.counterparty||'').trim(),internalParticipants:String(i.internalParticipants||'').trim(),notes:String(i.notes||'').replace(/\\r\\n?/g,'\\n')}}
function kspParseMeetingId(v){var m=/^MTG-(\\d{6})$/.exec(String(v||''));kspAssert(m,'MEETING_ID_INVALID','invalid Meeting ID');return +m[1]}
function kspParseDocumentId(v){var m=/^DOC-(\\d{6})$/.exec(String(v||''));kspAssert(m,'PITCHBOOK_DOCUMENT_ID_INVALID','invalid Document ID');return +m[1]}
function kspRequireCatalogItem(items,id,code,msg){var x=(items||[]).find(i=>String(i.id)===String(id));kspAssert(x,code,msg);return x}
function kspValidateMeetingInput(input,catalog){kspAssert(input.date,'MEETING_DATE_REQUIRED','date');kspAssert(input.gpId,'MEETING_GP_REQUIRED','gp');kspAssert(input.assetClassId,'MEETING_ASSET_CLASS_REQUIRED','asset');return{gp:kspRequireCatalogItem(catalog.gps,input.gpId,'GP','gp'),assetClass:kspRequireCatalogItem(catalog.assetClasses,input.assetClassId,'AC','ac'),capitalType:input.capitalTypeId?kspRequireCatalogItem(catalog.capitalTypes,input.capitalTypeId,'CT','ct'):null,location:input.locationId?kspRequireCatalogItem(catalog.locations,input.locationId,'LOC','loc'):null}}
function kspBuildMeetingFilename(input,s,id){return [input.date,s.gp.name,s.assetClass.name,s.capitalType&&s.capitalType.name,id].filter(Boolean).join('_').replace(/\\s+/g,'_')}
function kspBuildMeetingDocumentText(input,s){var lines=['日付: '+input.date,'GP: '+s.gp.name,'Asset Class: '+s.assetClass.name];if(input.notes){lines.push('','面談内容:',input.notes)}return lines.join('\\n')}
function kspGetPitchbookExtension(orig){return String(orig).split('.').pop()}
function kspBuildPitchbookFilename(input,s,seq,ext){return[input.date,s.gp.name,s.assetClass.name,s.capitalType&&s.capitalType.name,String(seq).padStart(2,'0')].filter(Boolean).join('_').replace(/\\s+/g,'_')+'.'+ext}
function kspGetBackendSchemas(){return{GP_Master:[],Option_Master:[],Meeting_Index:[],Pitchbook_Index:[],Settings:[]}}
`;
new vm.Script(prelude).runInContext(context);
for (const file of ['100_MaintenanceCore.gs','101_MaintenanceService.gs','102_MasterService.gs','110_MaintenanceLiveEnvironment.gs']) {
  const code = fs.readFileSync(path.join(root, 'src', file), 'utf8');
  new vm.Script(code, { filename: file }).runInContext(context);
}

function seed() {
  return {
    gps: [
      {GP_ID:'GP-000001',GP_Name:'Apollo',Status:'Active',Updated_At:'t1'},
      {GP_ID:'GP-000002',GP_Name:'KKR',Status:'Active',Updated_At:'t1'}
    ],
    options: [
      {Option_ID:'OPT-AC-001',Type:'ASSET_CLASS',Name:'PE',Sort_Order:1,Status:'Active',Updated_At:'t1'},
      {Option_ID:'OPT-AC-002',Type:'ASSET_CLASS',Name:'Infrastructure',Sort_Order:2,Status:'Active',Updated_At:'t1'},
      {Option_ID:'OPT-CT-001',Type:'CAPITAL_TYPE',Name:'Equity',Sort_Order:1,Status:'Active',Updated_At:'t1'},
      {Option_ID:'OPT-LOC-001',Type:'LOCATION',Name:'オンライン',Sort_Order:1,Status:'Active',Updated_At:'t1'}
    ],
    meetings: [
      {Meeting_ID:'MTG-000001',Date:'2026-08-01',Time:'10:00',Location_ID:'OPT-LOC-001',GP_ID:'GP-000002',Asset_Class_ID:'OPT-AC-002',Capital_Type_ID:'OPT-CT-001',Counterparty:'A',Internal_Participants:'B',Doc_File_ID:'doc-1',Doc_URL:'https://doc/1',Saved_Filename:'2026-08-01_KKR_Infrastructure_Equity_MTG-000001',Status:'Active',Version:1,Updated_At:'t1',AI_Index_Status:'Pending'},
      {Meeting_ID:'MTG-000002',Date:'2026-07-01',Time:'',Location_ID:'',GP_ID:'GP-000001',Asset_Class_ID:'OPT-AC-001',Capital_Type_ID:'',Counterparty:'',Internal_Participants:'',Doc_File_ID:'doc-2',Doc_URL:'https://doc/2',Saved_Filename:'2026-07-01_Apollo_PE_MTG-000002',Status:'Inactive',Version:2,Updated_At:'t2',AI_Index_Status:'Pending'}
    ],
    pitchbooks: [
      {Document_ID:'DOC-000001',Batch_ID:'BAT-000001',Date:'2026-08-01',GP_ID:'GP-000002',Asset_Class_ID:'OPT-AC-002',Capital_Type_ID:'OPT-CT-001',Sequence_No:1,File_ID:'file-1',File_URL:'https://file/1',Original_Filename:'deck.pdf',Saved_Filename:'2026-08-01_KKR_Infrastructure_Equity_01.pdf',Status:'Active',Updated_At:'p1',AI_Index_Status:'Pending'},
      {Document_ID:'DOC-000002',Batch_ID:'BAT-000002',Date:'2026-09-01',GP_ID:'GP-000001',Asset_Class_ID:'OPT-AC-001',Capital_Type_ID:'',Sequence_No:3,File_ID:'file-2',File_URL:'https://file/2',Original_Filename:'memo.pdf',Saved_Filename:'2026-09-01_Apollo_PE_03.pdf',Status:'Active',Updated_At:'p2',AI_Index_Status:'Pending'}
    ]
  };
}

function fakeEnvironment(options={}) {
  const data=seed();
  let tick=10;
  const docs=new Map([['doc-1','日付: 2026-08-01\nGP: KKR\nAsset Class: Infrastructure\n\n面談内容:\nold note'],['doc-2','日付: 2026-07-01\nGP: Apollo\nAsset Class: PE']]);
  const audit=[];
  function rows(sheet){if(sheet==='GP_Master')return data.gps;if(sheet==='Option_Master')return data.options;if(sheet==='Meeting_Index')return data.meetings;if(sheet==='Pitchbook_Index')return data.pitchbooks;if(sheet==='Audit_Log')return audit;throw new Error(sheet)}
  const env={
    nowIso(){tick+=1;return `2026-08-16T00:00:${String(tick).padStart(2,'0')}Z`},
    getInstallationState(){return{config:{environment:'DEV'},resources:{backendSpreadsheetId:'backend',auditSpreadsheetId:'audit',meetingRecordsFolderId:'meetings',pitchbooksFolderId:'pitchbooks'}}},
    getActor(){if(options.actorError)throw new Error('actor');return options.actor||'user@example.com'},
    readRows(id,sheet){return structuredClone(rows(sheet))},
    findRowByKey(id,sheet,key,value){const found=rows(sheet).filter(r=>String(r[key])===String(value));if(found.length>1)throw new Error('duplicate');return found[0]?structuredClone(found[0]):null},
    readDocumentText(id){return docs.get(id)||''},
    appendRow(id,sheet,row){if(options.auditError)throw new Error('audit');audit.push(structuredClone(row));return{}},
    mutateMeetingRecord(o){const index=data.meetings.findIndex(r=>r.Meeting_ID===o.currentRow.Meeting_ID);if(data.meetings[index].Version!==o.expectedVersion){const e=new Error('stale');e.code='MEETING_STALE_VERSION';throw e}data.meetings[index]=structuredClone(o.nextRow);docs.set(o.documentId,o.documentText);return structuredClone(data.meetings[index])},
    mutateMeetingStatus(o){const index=data.meetings.findIndex(r=>r.Meeting_ID===o.currentRow.Meeting_ID);if(data.meetings[index].Version!==o.expectedVersion){const e=new Error('stale');e.code='MEETING_STALE_VERSION';throw e}data.meetings[index]=structuredClone(o.nextRow);return structuredClone(data.meetings[index])},
    mutatePitchbookRecord(o){const index=data.pitchbooks.findIndex(r=>r.Document_ID===o.currentRow.Document_ID);const current=data.pitchbooks[index];if(current.Updated_At!==o.expectedUpdatedAt){const e=new Error('stale');e.code='PITCHBOOK_STALE_UPDATED_AT';throw e}const next=structuredClone(current);if(context.kspPitchbookNamingContextChanged(current,o.input)){const max=data.pitchbooks.filter(r=>r.Document_ID!==current.Document_ID&&r.Date===o.input.date&&r.GP_ID===o.input.gpId&&r.Asset_Class_ID===o.input.assetClassId&&r.Capital_Type_ID===o.input.capitalTypeId).reduce((m,r)=>Math.max(m,Number(r.Sequence_No)||0),0);next.Sequence_No=max+1}next.Date=o.input.date;next.GP_ID=o.input.gpId;next.Asset_Class_ID=o.input.assetClassId;next.Capital_Type_ID=o.input.capitalTypeId;next.Saved_Filename=context.kspBuildPitchbookFilename(o.input,o.selected,next.Sequence_No,context.kspGetPitchbookExtension(current.Original_Filename));next.Updated_At=o.nowIso;next.Updated_By=o.actor;next.AI_Index_Status='Pending';data.pitchbooks[index]=next;return structuredClone(next)},
    mutatePitchbookStatus(o){const index=data.pitchbooks.findIndex(r=>r.Document_ID===o.currentRow.Document_ID);const current=data.pitchbooks[index];if(current.Updated_At!==o.expectedUpdatedAt){const e=new Error('stale');e.code='PITCHBOOK_STALE_UPDATED_AT';throw e}current.Status=o.status;current.Updated_At=o.nowIso;current.Updated_By=o.actor;current.AI_Index_Status='Pending';return structuredClone(current)},
    addGpMaster(o){context.kspAssertUniqueMasterName(data.gps,o.name,'GP_ID','GP_Name');const row={GP_ID:context.kspFormatGpId(context.kspNextGpSequence(data.gps)),GP_Name:o.name,Status:'Active',Created_At:o.nowIso,Updated_At:o.nowIso,Created_By:o.actor,Updated_By:o.actor};data.gps.push(row);return structuredClone(row)},
    addOptionMaster(o){context.kspAssertUniqueMasterName(data.options,o.name,'Option_ID','Name','',o.type);const same=data.options.filter(r=>r.Type===o.type);const row={Option_ID:context.kspFormatOptionId(o.type,context.kspNextOptionSequence(data.options,o.type)),Type:o.type,Name:o.name,Sort_Order:same.reduce((m,r)=>Math.max(m,r.Sort_Order),0)+1,Status:'Active',Created_At:o.nowIso,Updated_At:o.nowIso,Created_By:o.actor,Updated_By:o.actor};data.options.push(row);return structuredClone(row)},
    updateMasterItem(o){const arr=o.kind==='GP'?data.gps:data.options,key=o.kind==='GP'?'GP_ID':'Option_ID';const index=arr.findIndex(r=>r[key]===o.id);if(arr[index].Updated_At!==o.expectedUpdatedAt){const e=new Error('stale');e.code='MASTER_STALE_UPDATED_AT';throw e}Object.assign(arr[index],o.changes,{Updated_At:o.nowIso,Updated_By:o.actor});return structuredClone(arr[index])},
    reorderOptionItems(o){o.orderedIds.forEach((id,i)=>{const r=data.options.find(x=>x.Option_ID===id);r.Sort_Order=i+1;r.Updated_At=o.nowIso;r.Updated_By=o.actor});return structuredClone(data.options.filter(r=>r.Type===o.type).sort((a,b)=>a.Sort_Order-b.Sort_Order))},
    _data:data,_docs:docs,_audit:audit
  };
  return env;
}

test('filters Meeting records by date, GP, and status',()=>{
  const env=fakeEnvironment();
  const result=context.kspSearchMeetingRecords(env,{dateFrom:'2026-08-01',gpId:'GP-000002',status:'Active'});
  assert.equal(result.ok,true);assert.equal(result.records.length,1);assert.equal(result.records[0].id,'MTG-000001');
});

test('loads Meeting notes from authoritative document only',()=>{
  const env=fakeEnvironment();const result=context.kspGetMeetingRecord(env,'MTG-000001');
  assert.equal(result.record.notes,'old note');assert.equal(Object.hasOwn(env._data.meetings[0],'notes'),false);
});

test('updates Meeting with Version increment and metadata-only audit',()=>{
  const env=fakeEnvironment();const result=context.kspUpdateMeetingRecord(env,{meetingId:'MTG-000001',expectedVersion:1,date:'2026-08-02',time:'11:00',locationId:'OPT-LOC-001',gpId:'GP-000002',assetClassId:'OPT-AC-002',capitalTypeId:'OPT-CT-001',counterparty:'A2',internalParticipants:'B2',notes:'new\nnote'});
  assert.equal(result.ok,true);assert.equal(result.record.version,2);assert.equal(env._docs.get('doc-1').includes('new\nnote'),true);assert.equal(env._audit.length,1);assert.equal(JSON.stringify(env._audit[0]).includes('new\\nnote'),false);
});

test('rejects stale Meeting save',()=>{
  const env=fakeEnvironment();const result=context.kspUpdateMeetingRecord(env,{meetingId:'MTG-000001',expectedVersion:9,date:'2026-08-02',gpId:'GP-000002',assetClassId:'OPT-AC-002',notes:''});
  assert.equal(result.ok,false);assert.equal(result.error.code,'MEETING_STALE_VERSION');
});

test('inactivates and reactivates Meeting with optimistic token',()=>{
  const env=fakeEnvironment();let result=context.kspSetMeetingRecordStatus(env,{meetingId:'MTG-000001',expectedVersion:1,status:'Inactive'});assert.equal(result.record.status,'Inactive');assert.equal(result.record.version,2);result=context.kspSetMeetingRecordStatus(env,{meetingId:'MTG-000001',expectedVersion:2,status:'Active'});assert.equal(result.record.status,'Active');assert.equal(result.record.version,3);
});

test('moves Pitchbook to destination context using next destination sequence',()=>{
  const env=fakeEnvironment();const result=context.kspUpdatePitchbookRecord(env,{documentId:'DOC-000001',expectedUpdatedAt:'p1',date:'2026-09-01',gpId:'GP-000001',assetClassId:'OPT-AC-001',capitalTypeId:''});
  assert.equal(result.ok,true);assert.equal(result.record.sequenceNo,4);assert.equal(result.record.fileId,'file-1');assert.match(result.record.filename,/_04\.pdf$/);
});

test('rejects stale Pitchbook metadata save',()=>{
  const env=fakeEnvironment();const result=context.kspUpdatePitchbookRecord(env,{documentId:'DOC-000001',expectedUpdatedAt:'wrong',date:'2026-09-01',gpId:'GP-000001',assetClassId:'OPT-AC-001',capitalTypeId:''});assert.equal(result.ok,false);assert.equal(result.error.code,'PITCHBOOK_STALE_UPDATED_AT');
});

test('adds stable GP and rejects normalized duplicate',()=>{
  const env=fakeEnvironment();const added=context.kspAddMasterItem(env,{kind:'GP',name:'New GP'});assert.equal(added.ok,true);assert.equal(added.item.id,'GP-000003');const duplicate=context.kspAddMasterItem(env,{kind:'GP',name:'  new   gp '});assert.equal(duplicate.ok,false);assert.equal(duplicate.error.code,'MASTER_NAME_DUPLICATE');
});

test('adds, reorders, and inactivates Option Master',()=>{
  const env=fakeEnvironment();const added=context.kspAddMasterItem(env,{kind:'OPTION',type:'LOCATION',name:'会食'});assert.equal(added.ok,true);const rows=env._data.options.filter(r=>r.Type==='LOCATION');const reordered=context.kspReorderOptionItems(env,{type:'LOCATION',orderedIds:[added.item.id,'OPT-LOC-001']});assert.equal(reordered.ok,true);assert.equal(reordered.items[0].id,added.item.id);const inactive=context.kspSetMasterItemStatus(env,{kind:'OPTION',id:added.item.id,status:'Inactive',expectedUpdatedAt:reordered.items[0].updatedAt});assert.equal(inactive.item.status,'Inactive');
});

test('Actor failure and audit failure do not block normal mutation',()=>{
  const env=fakeEnvironment({actorError:true,auditError:true});const result=context.kspSetMeetingRecordStatus(env,{meetingId:'MTG-000001',expectedVersion:1,status:'Inactive'});assert.equal(result.ok,true);assert.ok(result.warnings.some(w=>w.code==='ACTOR_RESOLUTION_FAILED'));assert.ok(result.warnings.some(w=>w.code==='AUDIT_WRITE_FAILED'));
});

test('Phase 1 diagnostics report separated backend and audit resources',()=>{
  const env=fakeEnvironment();const result=context.kspGetPhase1Diagnostics(env);assert.equal(result.ok,true);assert.equal(result.backendAndAuditSeparated,true);assert.equal(result.capabilities.masterManagement,true);assert.equal(result.capabilities.geminiRetrieval,false);
});

test('maintenance UI contains past-record and Master management surfaces',()=>{
  const index=fs.readFileSync(path.join(root,'src','Index.html'),'utf8');
  for(const token of ['meeting-view-past','pitchbook-view-past','page-masters','meeting-edit-save','pitchbook-edit-save','master-results-body',"include('ClientMaintenance')","include('ClientMasters')"]){assert.ok(index.includes(token),token)}
});

test('new client scripts and Apps Script files parse',()=>{
  for(const file of ['100_MaintenanceCore.gs','101_MaintenanceService.gs','102_MasterService.gs','110_MaintenanceLiveEnvironment.gs','90_WebApp.gs']){
    new vm.Script(fs.readFileSync(path.join(root,'src',file),'utf8'),{filename:file});
  }
  for(const file of ['ClientCore.html','ClientMaintenance.html','ClientMasters.html','ClientBootstrap.html']){
    const html=fs.readFileSync(path.join(root,'src',file),'utf8');
    const match=html.match(/<script>([\s\S]*?)<\/script>/);
    assert.ok(match,file);new vm.Script(match[1],{filename:file});
  }
  const index=fs.readFileSync(path.join(root,'src','Index.html'),'utf8');
  for(const [i,match] of [...index.matchAll(/<script>([\s\S]*?)<\/script>/g)].entries())new vm.Script(match[1],{filename:`Index-${i}.js`});
});

test('Pitchbook without authoritative file cannot be reactivated',()=>{
  const env=fakeEnvironment();env._data.pitchbooks[0].File_ID='';env._data.pitchbooks[0].Status='Inactive';const result=context.kspSetPitchbookRecordStatus(env,{documentId:'DOC-000001',expectedUpdatedAt:'p1',status:'Active'});assert.equal(result.ok,false);assert.equal(result.error.code,'PITCHBOOK_FILE_MISSING');
});
