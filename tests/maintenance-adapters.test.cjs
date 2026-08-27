const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

function formatDateInTimeZone(value, timezone, pattern) {
  const parts = new Intl.DateTimeFormat('en-CA', pattern === 'HH:mm' ? {
    timeZone: timezone, hour: '2-digit', minute: '2-digit', hourCycle: 'h23'
  } : {
    timeZone: timezone, year: 'numeric', month: '2-digit', day: '2-digit'
  }).formatToParts(value);
  const byType = Object.fromEntries(parts.map(part => [part.type, part.value]));
  return pattern === 'HH:mm' ? `${byType.hour}:${byType.minute}` : `${byType.year}-${byType.month}-${byType.day}`;
}

class FakeRange {
  constructor(sheet,row,col,numRows=1,numCols=1){this.sheet=sheet;this.row=row;this.col=col;this.numRows=numRows;this.numCols=numCols;}
  getValue(){return this.sheet.values[this.row-1]?.[this.col-1] ?? '';}
  setValue(value){this.sheet.setValueCalls+=1;if(this.sheet.failSetValueCalls.has(this.sheet.setValueCalls))throw new Error('synthetic setValue failure');this.sheet.ensure(this.row,this.col);this.sheet.values[this.row-1][this.col-1]=value;this.sheet.writes.push({row:this.row,col:this.col,numRows:1,numCols:1});return this;}
  getValues(){const out=[];for(let r=0;r<this.numRows;r++){const row=[];for(let c=0;c<this.numCols;c++)row.push(this.sheet.values[this.row-1+r]?.[this.col-1+c] ?? '');out.push(row);}return out;}
  setValues(values){for(let r=0;r<this.numRows;r++)for(let c=0;c<this.numCols;c++){this.sheet.ensure(this.row+r,this.col+c);this.sheet.values[this.row-1+r][this.col-1+c]=values[r][c];}this.sheet.writes.push({row:this.row,col:this.col,numRows:this.numRows,numCols:this.numCols});return this;}
}
class FakeSheet {
  constructor(name,headers,rows=[]){this.name=name;this.values=[headers.slice(),...rows.map(row=>headers.map(h=>row[h]??''))];this.writes=[];this.setValueCalls=0;this.failSetValueCalls=new Set();}
  ensure(row,col){while(this.values.length<row)this.values.push([]);while(this.values[row-1].length<col)this.values[row-1].push('');}
  getRange(r,c,nr=1,nc=1){return new FakeRange(this,r,c,nr,nc);}
  getLastRow(){return this.values.length;}
  getLastColumn(){return this.values.reduce((m,r)=>Math.max(m,r.length),0);}
  getName(){return this.name;}
  deleteRow(row){this.values.splice(row-1,1);}
}
class FakeSpreadsheet { constructor(sheets){this.sheets=new Map(sheets.map(s=>[s.name,s]));}getSheetByName(name){return this.sheets.get(name)||null;} }

function loadAdapterFixture() {
  const properties=new Map();
  const spreadsheets=new Map();
  const files=new Map([['file-1',{id:'file-1',name:'old.pdf'}],['doc-1',{id:'doc-1',name:'old-doc'}]]);
  const docs=new Map([['doc-1','old text']]);
  let uuid=0;
  const scriptProperties={
    getProperty:k=>properties.has(k)?properties.get(k):null,
    setProperty:(k,v)=>properties.set(k,String(v)),
    deleteProperty:k=>properties.delete(k),
    getProperties:()=>Object.fromEntries(properties)
  };
  const context=vm.createContext({console,JSON,Object,Array,String,Number,Boolean,Date,Math,RegExp,Error,TypeError,Set,Map,Intl,
    PropertiesService:{getScriptProperties:()=>scriptProperties},
    SpreadsheetApp:{openById:id=>{if(!spreadsheets.has(id))throw new Error('spreadsheet missing');return spreadsheets.get(id);}},
    LockService:{getScriptLock:()=>({tryLock:()=>true,releaseLock(){}})},
    Utilities:{getUuid:()=>`uuid-${++uuid}`,formatDate:formatDateInTimeZone},
    Drive:{Files:{
      get:(id)=>{if(!files.has(id))throw new Error('file missing');return {...files.get(id)};},
      update:(resource,id)=>{if(!files.has(id))throw new Error('file missing');files.set(id,{...files.get(id),...resource});return {...files.get(id)};}
    }},
    DocumentApp:{openById:id=>({getBody:()=>({getText:()=>docs.get(id)||'',clear(){docs.set(id,'');return this;},setText(text){docs.set(id,text);return this;}}),saveAndClose(){}})}
  });
  const bootstrap=`
var KSP_STATUS=Object.freeze({ACTIVE:'Active',INACTIVE:'Inactive'});
var KSP_AI_INDEX_STATUS=Object.freeze({PENDING:'Pending'});
var KSP_SHEET_NAMES=Object.freeze({GP_MASTER:'GP_Master',OPTION_MASTER:'Option_Master',MEETING_INDEX:'Meeting_Index',PITCHBOOK_INDEX:'Pitchbook_Index',AUDIT_LOG:'Audit_Log'});
var KSP_RESOURCE_KEYS=Object.freeze({BACKEND_SPREADSHEET:'backendSpreadsheetId',AUDIT_SPREADSHEET:'auditSpreadsheetId'});
var KSP_DEFAULTS=Object.freeze({LOCK_TIMEOUT_MS:30000,TIMEZONE:'Asia/Tokyo'});
function kspAssert_(condition,code,message){if(!condition){var e=new Error(message);e.code=code;throw e;}}
function kspDeepClone_(value){return value===undefined?undefined:JSON.parse(JSON.stringify(value));}
function kspSafeParseJson_(text,label){if(text==null||text==='')return null;return JSON.parse(text);}
function kspReadHeadersFromSheet_(sheet){return sheet.values[0].map(String);}
function kspReadObjectsFromSheet_(sheet,headers){return sheet.values.slice(1).map(values=>{var row={};headers.forEach((h,i)=>row[h]=values[i]??'');return row;});}
function kspAppendObjectsToSheet_(sheet,headers,rows){rows.forEach(row=>sheet.values.push(headers.map(h=>row[h]??'')));}
function kspCreateMeetingEnvironment_(){return{
  getInstallationState:function(){return{resources:{backendSpreadsheetId:'backend',auditSpreadsheetId:'audit'}};},
  getActor:function(){return'user@example.com';},
  readRows:function(id,name){var sheet=SpreadsheetApp.openById(id).getSheetByName(name);var headers=kspReadHeadersFromSheet_(sheet);return kspReadObjectsFromSheet_(sheet,headers);},
  appendRow:function(id,name,row){var sheet=SpreadsheetApp.openById(id).getSheetByName(name);var headers=kspReadHeadersFromSheet_(sheet);kspAppendObjectsToSheet_(sheet,headers,[row]);}
};}
`;
  new vm.Script(bootstrap).runInContext(context);
  for(const file of ['00_Core.gs','05_TemporalContracts.gs','30_MeetingCore.gs','62_PitchbookIdentity.gs','100_MaintenanceCore.gs','120_MaintenanceLiveEnvironment.gs','121_MaintenanceLiveHelpers.gs'])new vm.Script(fs.readFileSync(path.join(__dirname,'..','src',file),'utf8'),{filename:file}).runInContext(context);

  function addSpreadsheet(id,sheets){spreadsheets.set(id,new FakeSpreadsheet(sheets));}
  return {context,properties,spreadsheets,files,docs,addSpreadsheet,FakeSheet};
}

const MEETING_HEADERS=['Meeting_ID','Date','Time','Doc_File_ID','Status','Version','Updated_At','Updated_By','AI_Index_Status','AI_Last_Error'];
const PITCH_HEADERS=['Document_ID','Batch_ID','Date','GP_ID','Asset_Class_ID','Capital_Type_ID','Sequence_No','File_ID','File_URL','Original_Filename','Saved_Filename','Status','Created_At','Updated_At','Created_By','Updated_By','AI_Document_Name','AI_Index_Status','AI_Indexed_At','AI_Content_Hash','AI_Last_Error','Fund_Strategy'];
const GP_HEADERS=['GP_ID','GP_Name','Status','Created_At','Updated_At','Created_By','Updated_By'];
const OPTION_HEADERS=['Option_ID','Type','Name','Sort_Order','Status','Created_At','Updated_At','Created_By','Updated_By'];
const AUDIT_HEADERS=['Event_Timestamp','Action'];

function basicFixture(){
  const f=loadAdapterFixture();
  f.addSpreadsheet('backend',[
    new f.FakeSheet('Meeting_Index',MEETING_HEADERS,[{Meeting_ID:'MTG-000001',Doc_File_ID:'doc-1',Status:'Active',Version:1,Updated_At:'old'}]),
    new f.FakeSheet('Pitchbook_Index',PITCH_HEADERS,[
      {Document_ID:'DOC-000001',Batch_ID:'BAT-000001',Date:'2026-01-01',GP_ID:'GP-1',Asset_Class_ID:'AC-1',Capital_Type_ID:'',Sequence_No:1,File_ID:'file-1',Original_Filename:'source.pdf',Saved_Filename:'old.pdf',Status:'Active',Updated_At:'old',AI_Index_Status:'Indexed'},
      {Document_ID:'DOC-000002',Date:'2026-02-01',GP_ID:'GP-2',Asset_Class_ID:'AC-2',Capital_Type_ID:'',Sequence_No:2,File_ID:'file-2',Status:'Active',Updated_At:'old2'}
    ]),
    new f.FakeSheet('GP_Master',GP_HEADERS,[{GP_ID:'GP-000001',GP_Name:'Apollo',Status:'Active'}]),
    new f.FakeSheet('Option_Master',OPTION_HEADERS,[
      {Option_ID:'OPT-AC-001',Type:'ASSET_CLASS',Name:'PE',Sort_Order:1,Status:'Active'},
      {Option_ID:'OPT-AC-002',Type:'ASSET_CLASS',Name:'VC',Sort_Order:2,Status:'Active'}
    ])
  ]);
  f.addSpreadsheet('audit',[new f.FakeSheet('Audit_Log',AUDIT_HEADERS,[{Event_Timestamp:'2020-01-01T00:00:00.000Z',Action:'old'},{Event_Timestamp:'2025-01-01T00:00:00.000Z',Action:'keep'}])]);
  return f;
}

test('record edit claim blocks overlap and releases by token',()=>{
  const f=basicFixture(),env=f.context.kspCreateMaintenanceEnvironment_();
  const claim=env.claimRecordEdit('Meeting','MTG-000001','Meeting_Index','Meeting_ID','Version',1,'2026-08-16T00:00:00.000Z',300000);
  assert.equal(env.isRecordEditClaimOwned(claim),true);
  assert.throws(()=>env.claimRecordEdit('Meeting','MTG-000001','Meeting_Index','Meeting_ID','Version',1,'2026-08-16T00:00:01.000Z',300000),error=>error.code==='RECORD_EDIT_IN_PROGRESS');
  env.releaseRecordEditClaim(claim);assert.equal(env.isRecordEditClaimOwned(claim),false);
});

test('commit claimed edit checks source token and clears claim',()=>{
  const f=basicFixture(),env=f.context.kspCreateMaintenanceEnvironment_();
  const claim=env.claimRecordEdit('Meeting','MTG-000001','Meeting_Index','Meeting_ID','Version',1,'2026-08-16T00:00:00.000Z',300000);
  const updated={...claim.row,Version:2,Status:'Inactive'};
  const result=env.commitClaimedRowEdit(claim,'Meeting_Index','Meeting_ID','MTG-000001','Version',1,updated);
  assert.equal(result.Version,2);assert.equal(env.isRecordEditClaimOwned(claim),false);
});

test('Pitchbook edit sequence reservation counts rows and active claims',()=>{
  const f=basicFixture(),env=f.context.kspCreateMaintenanceEnvironment_();
  const first=env.claimRecordEdit('Pitchbook','DOC-000001','Pitchbook_Index','Document_ID','Updated_At','old','2026-08-16T00:00:00.000Z',300000);
  const input={documentId:'DOC-000001',date:'2026-03-01',gpId:'GP-3',assetClassId:'AC-3',capitalTypeId:''};
  assert.equal(env.reservePitchbookEditSequence(first,input),1);
  const sheet=f.spreadsheets.get('backend').getSheetByName('Pitchbook_Index');
  sheet.values.push(PITCH_HEADERS.map(h=>({Document_ID:'DOC-000003',Date:'2026-03-01',GP_ID:'GP-3',Asset_Class_ID:'AC-3',Capital_Type_ID:'',Sequence_No:4,File_ID:'x',Status:'Active',Updated_At:'x'})[h]??''));
  env.releaseRecordEditClaim(first);
  const second=env.claimRecordEdit('Pitchbook','DOC-000001','Pitchbook_Index','Document_ID','Updated_At','old','2026-08-16T00:00:02.000Z',300000);
  assert.equal(env.reservePitchbookEditSequence(second,input),5);
});

test('Meeting reactivation requires authoritative Google Doc ID',()=>{
  const f=basicFixture(),env=f.context.kspCreateMaintenanceEnvironment_();
  const sheet=f.spreadsheets.get('backend').getSheetByName('Meeting_Index');sheet.values[1][MEETING_HEADERS.indexOf('Doc_File_ID')]='';sheet.values[1][MEETING_HEADERS.indexOf('Status')]='Inactive';
  assert.throws(()=>env.updateStatusAtomic('Meeting_Index','Meeting_ID','MTG-000001','Version',1,'Active','actor','now'),error=>error.code==='MEETING_AUTHORITATIVE_DOCUMENT_MISSING');
});

test('Pitchbook Fund Strategy-only commit preserves a Sheets Date cell and writes only mutable fields',()=>{
  const f=basicFixture(),env=f.context.kspCreateMaintenanceEnvironment_();
  const sheet=f.spreadsheets.get('backend').getSheetByName('Pitchbook_Index');
  const rawDate=new Date('2026-07-31T15:00:00.000Z');
  sheet.values[1][PITCH_HEADERS.indexOf('Date')]=rawDate;
  const claim=env.claimRecordEdit('Pitchbook','DOC-000001','Pitchbook_Index','Document_ID','Updated_At','old','2026-08-16T00:00:00.000Z',300000);
  const updated={...claim.row,Date:'2026-08-01',Fund_Strategy:'Infra Fund IV',Updated_At:'now',Updated_By:'actor',AI_Index_Status:'Pending',AI_Last_Error:''};
  const result=env.commitClaimedPitchbookEdit(claim,'DOC-000001','old',updated);

  assert.equal(result.Fund_Strategy,'Infra Fund IV');
  assert.equal(sheet.values[1][PITCH_HEADERS.indexOf('Date')],rawDate);
  const dateColumn=PITCH_HEADERS.indexOf('Date')+1;
  assert.equal(sheet.writes.some(write=>write.col<=dateColumn&&dateColumn<write.col+write.numCols),false);
  assert.equal(env.isRecordEditClaimOwned(claim),false);
});

test('Pitchbook metadata partial-write failure restores every attempted cell and keeps the claim owned',()=>{
  const f=basicFixture(),env=f.context.kspCreateMaintenanceEnvironment_();
  const sheet=f.spreadsheets.get('backend').getSheetByName('Pitchbook_Index');
  const before=sheet.values[1].slice();
  const claim=env.claimRecordEdit('Pitchbook','DOC-000001','Pitchbook_Index','Document_ID','Updated_At','old','2026-08-16T00:00:00.000Z',300000);
  const updated={...claim.row,Fund_Strategy:'Infra Fund IV',Updated_At:'now',Updated_By:'actor',AI_Index_Status:'Pending',AI_Last_Error:''};
  sheet.failSetValueCalls.add(2);

  assert.throws(()=>env.commitClaimedPitchbookEdit(claim,'DOC-000001','old',updated),/synthetic setValue failure/);
  assert.deepEqual(sheet.values[1],before);
  assert.equal(env.isRecordEditClaimOwned(claim),true);
});

test('Pitchbook claimed metadata commit rejects a lost claim and a stale Updated At before writing',()=>{
  const f=basicFixture(),env=f.context.kspCreateMaintenanceEnvironment_();
  const sheet=f.spreadsheets.get('backend').getSheetByName('Pitchbook_Index');
  const before=sheet.values[1].slice();
  const lost=env.claimRecordEdit('Pitchbook','DOC-000001','Pitchbook_Index','Document_ID','Updated_At','old','2026-08-16T00:00:00.000Z',300000);
  env.releaseRecordEditClaim(lost);
  assert.throws(()=>env.commitClaimedPitchbookEdit(lost,'DOC-000001','old',{...lost.row,Updated_At:'now'}),error=>error.code==='RECORD_EDIT_CLAIM_LOST');

  const stale=env.claimRecordEdit('Pitchbook','DOC-000001','Pitchbook_Index','Document_ID','Updated_At','old','2026-08-16T00:00:01.000Z',300000);
  sheet.values[1][PITCH_HEADERS.indexOf('Updated_At')]='other-writer';
  assert.throws(()=>env.commitClaimedPitchbookEdit(stale,'DOC-000001','old',{...stale.row,Updated_At:'now'}),error=>error.code==='STALE_RECORD_VERSION');
  sheet.values[1][PITCH_HEADERS.indexOf('Updated_At')]=before[PITCH_HEADERS.indexOf('Updated_At')];
  assert.deepEqual(sheet.values[1],before);
  assert.equal(sheet.writes.length,0);
});

test('Pitchbook status changes write status fields only and never rewrite Date',()=>{
  const f=basicFixture(),env=f.context.kspCreateMaintenanceEnvironment_();
  const sheet=f.spreadsheets.get('backend').getSheetByName('Pitchbook_Index');
  const rawDate=new Date('2026-07-31T15:00:00.000Z');
  sheet.values[1][PITCH_HEADERS.indexOf('Date')]=rawDate;

  env.updatePitchbookStatusAtomic('DOC-000001','old','Inactive','actor','now-1');
  env.updatePitchbookStatusAtomic('DOC-000001','now-1','Active','actor','now-2');

  assert.equal(sheet.values[1][PITCH_HEADERS.indexOf('Date')],rawDate);
  const dateColumn=PITCH_HEADERS.indexOf('Date')+1;
  assert.equal(sheet.writes.some(write=>write.col<=dateColumn&&dateColumn<write.col+write.numCols),false);
  const expectedColumns=['Status','Updated_At','Updated_By','AI_Index_Status','AI_Last_Error']
    .map(header=>PITCH_HEADERS.indexOf(header)+1).sort((a,b)=>a-b);
  assert.deepEqual(sheet.writes.map(write=>write.col).sort((a,b)=>a-b),[...expectedColumns,...expectedColumns].sort((a,b)=>a-b));
});

test('Pitchbook status partial-write failure restores every attempted field',()=>{
  const f=basicFixture(),env=f.context.kspCreateMaintenanceEnvironment_();
  const sheet=f.spreadsheets.get('backend').getSheetByName('Pitchbook_Index');
  const before=sheet.values[1].slice();
  sheet.failSetValueCalls.add(3);

  assert.throws(()=>env.updatePitchbookStatusAtomic('DOC-000001','old','Inactive','actor','now'),/synthetic setValue failure/);
  assert.deepEqual(sheet.values[1],before);
});

test('Meeting status update does not rewrite Date and Time cells',()=>{
  const f=basicFixture(),env=f.context.kspCreateMaintenanceEnvironment_();
  const sheet=f.spreadsheets.get('backend').getSheetByName('Meeting_Index');
  const dateValue=new Date('2026-08-14T00:00:00.000Z');
  const timeValue=new Date('1899-12-30T14:30:00.000Z');
  sheet.values[1][MEETING_HEADERS.indexOf('Date')]=dateValue;
  sheet.values[1][MEETING_HEADERS.indexOf('Time')]=timeValue;

  env.updateStatusAtomic('Meeting_Index','Meeting_ID','MTG-000001','Version',1,'Inactive','actor','now-1');
  env.updateStatusAtomic('Meeting_Index','Meeting_ID','MTG-000001','Version',2,'Active','actor','now-2');

  assert.equal(sheet.values[1][MEETING_HEADERS.indexOf('Date')],dateValue);
  assert.equal(sheet.values[1][MEETING_HEADERS.indexOf('Time')],timeValue);
  const dateColumn=MEETING_HEADERS.indexOf('Date')+1;
  const timeColumn=MEETING_HEADERS.indexOf('Time')+1;
  assert.equal(sheet.writes.some(write=>write.col<=dateColumn&&dateColumn<write.col+write.numCols),false);
  assert.equal(sheet.writes.some(write=>write.col<=timeColumn&&timeColumn<write.col+write.numCols),false);
  const expectedColumns=['Status','Version','Updated_At','Updated_By','AI_Index_Status','AI_Last_Error']
    .map(header=>MEETING_HEADERS.indexOf(header)+1).sort((a,b)=>a-b);
  const writtenColumns=sheet.writes.map(write=>write.col).sort((a,b)=>a-b);
  assert.deepEqual(writtenColumns,[...expectedColumns,...expectedColumns].sort((a,b)=>a-b));
  assert.equal(sheet.values[1][MEETING_HEADERS.indexOf('Status')],'Active');
  assert.equal(sheet.values[1][MEETING_HEADERS.indexOf('Version')],3);
});

test('Option reorder returns before and after order for audit',()=>{
  const f=basicFixture(),env=f.context.kspCreateMaintenanceEnvironment_();
  const result=env.mutateMasterAtomic({entity:'OPTION',action:'REORDER',id:'OPT-AC-002',sortOrder:1},'actor','now');
  assert.deepEqual(Array.from(result.affectedBefore,r=>r.Option_ID),['OPT-AC-001','OPT-AC-002']);
  assert.deepEqual(Array.from(result.affectedRows,r=>r.Option_ID),['OPT-AC-002','OPT-AC-001']);
});

test('Master add duplicate returns existing only for quick-add mode',()=>{
  const f=basicFixture(),env=f.context.kspCreateMaintenanceEnvironment_();
  const existing=env.mutateMasterAtomic({entity:'GP',action:'ADD',name:'apollo',type:'',returnExistingOnDuplicate:true},'actor','now');
  assert.equal(existing.existing,true);assert.equal(existing.after.GP_ID,'GP-000001');
  assert.throws(()=>env.mutateMasterAtomic({entity:'GP',action:'ADD',name:'Apollo',type:'',returnExistingOnDuplicate:false},'actor','now'),error=>error.code==='MASTER_DUPLICATE_NAME');
});

test('audit retention deletes only rows older than cutoff',()=>{
  const f=basicFixture(),env=f.context.kspCreateMaintenanceEnvironment_();
  const result=env.deleteAuditRowsBefore('audit','2021-08-16T00:00:00.000Z');
  assert.equal(result.deletedRows,1);
  const sheet=f.spreadsheets.get('audit').getSheetByName('Audit_Log');assert.equal(sheet.values.length,2);assert.equal(sheet.values[1][1],'keep');
});
