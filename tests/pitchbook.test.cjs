const test=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs');const path=require('node:path');const vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const context=vm.createContext({console,JSON,Object,Array,String,Number,Boolean,Date,Math,RegExp,Error,TypeError,Set,Map});
vm.runInContext(`
var KSP_STATUS={ACTIVE:'Active',INACTIVE:'Inactive'};
var KSP_AI_INDEX_STATUS={NOT_INDEXED:'NotIndexed',PENDING:'Pending'};
var KSP_AUDIT_RESULTS={SUCCESS:'Success',FAILURE:'Failure'};
var KSP_SHEET_NAMES={GP_MASTER:'GP_Master',OPTION_MASTER:'Option_Master',PITCHBOOK_INDEX:'Pitchbook_Index',AUDIT_LOG:'Audit_Log'};
var KSP_RESOURCE_KEYS={BACKEND_SPREADSHEET:'backendSpreadsheetId',AUDIT_SPREADSHEET:'auditSpreadsheetId',PITCHBOOKS:'pitchbooksFolderId'};
function kspDeepClone(v){return v===undefined?undefined:JSON.parse(JSON.stringify(v));}
function kspAssert(c,code,message){if(!c){var e=new Error(message);e.code=code;throw e;}}
function kspGetErrorCode(e){return e&&e.code?String(e.code):'UNEXPECTED_ERROR';}
function kspNormalizeGeneratedNameSegment(v){return v==null?'':String(v).replace(/[\\u0000-\\u001f\\u007f]/g,'').replace(/[\\\\/&]/g,'').trim().replace(/\\s+/g,'_').replace(/_+/g,'_').replace(/^_+|_+$/g,'');}
function kspIsValidDateKey(value){var m=/^(\\d{4})-(\\d{2})-(\\d{2})$/.exec(String(value||''));if(!m)return false;var y=Number(m[1]),mo=Number(m[2]),d=Number(m[3]),date=new Date(Date.UTC(y,mo-1,d));return date.getUTCFullYear()===y&&date.getUTCMonth()===mo-1&&date.getUTCDate()===d;}
function kspRequireCatalogItem(items,id,code,message){var found=(items||[]).filter(function(x){return String(x.id)===String(id);})[0];kspAssert(found,code,message);return found;}
function kspBuildMeetingCatalog(gpRows,optionRows){
 var gps=(gpRows||[]).filter(r=>String(r.Status)==='Active').map(r=>({id:String(r.GP_ID),name:String(r.GP_Name)}));
 var opts=(optionRows||[]).filter(r=>String(r.Status)==='Active').map(r=>({id:String(r.Option_ID),type:String(r.Type),name:String(r.Name),sortOrder:Number(r.Sort_Order)||0}));
 function byType(t){return opts.filter(r=>r.type===t).sort((a,b)=>a.sortOrder-b.sortOrder).map(r=>({id:r.id,name:r.name,sortOrder:r.sortOrder}));}
 return {gps,assetClasses:byType('ASSET_CLASS'),capitalTypes:byType('CAPITAL_TYPE'),locations:byType('LOCATION')};
}
`,context);
for(const file of fs.readdirSync(path.join(root,'src')).filter((file)=>/^(?:6|7)\d_.*\.gs$/.test(file)).sort())new vm.Script(fs.readFileSync(path.join(root,'src',file),'utf8'),{filename:file}).runInContext(context);
const ksp=context;
const gpRows=[{GP_ID:'GP-1',GP_Name:'KKR',Status:'Active'}];
const optionRows=[{Option_ID:'AC-1',Type:'ASSET_CLASS',Name:'Infrastructure',Sort_Order:1,Status:'Active'},{Option_ID:'CT-1',Type:'CAPITAL_TYPE',Name:'Equity',Sort_Order:1,Status:'Active'}];
function batchInput(files=[{originalFilename:'deck.pdf',sizeBytes:10,mimeType:'application/pdf'}]){return{date:'2026-08-16',gpId:'GP-1',assetClassId:'AC-1',capitalTypeId:'CT-1',files};}
function makeEnv(options={}){
 let batchCounter=1,docCounter=1;const rows=(options.rows||[]).map(r=>({...r}));const files=new Map();const audits=[];const reservations=new Map();let now=0;let failCreate=options.failCreate||0;let failComplete=options.failComplete||0;let failAudit=options.failAudit||0;
 const env={
  nowIso(){now++;return`2026-08-16T00:00:${String(now).padStart(2,'0')}.000Z`;},
  getInstallationState(){return{config:{environment:'DEV'},resources:{backendSpreadsheetId:'backend',auditSpreadsheetId:'audit',pitchbooksFolderId:'folder'}};},
  getActor(){if(options.actorError)throw new Error('actor unavailable');return options.actor||'user@example.com';},
  readRows(id,sheet){return sheet==='GP_Master'?gpRows:sheet==='Option_Master'?optionRows:rows.map(r=>({...r}));},
  reservePitchbookBatch(id,input,selected,totalBytes,actor,nowIso){
   const max=rows.filter(r=>r.Date===input.date&&r.GP_ID===input.gpId&&r.Asset_Class_ID===input.assetClassId&&String(r.Capital_Type_ID||'')===input.capitalTypeId).reduce((m,r)=>Math.max(m,Number(r.Sequence_No)||0),0);
   const batchId=ksp.kspFormatBatchId(batchCounter++);
   const created=input.files.map((file,index)=>{const sequenceNo=max+index+1;const documentId=ksp.kspFormatDocumentId(docCounter++);const savedFilename=ksp.kspBuildPitchbookFilename(input,selected,sequenceNo,ksp.kspGetPitchbookExtension(file.originalFilename));const row=ksp.kspBuildPitchbookPendingRow({batchId,documentId,sequenceNo,input,selected,file,savedFilename,actor,nowIso});rows.push(row);return{...row};});
   const reservation=ksp.kspBuildPitchbookReservation(batchId,input,created,totalBytes);reservation.createdAt=nowIso;reservations.set(batchId,reservation);return{rows:created,reservation:JSON.parse(JSON.stringify(reservation))};
  },
  getPitchbookReservation(batchId){const r=reservations.get(batchId);return r?JSON.parse(JSON.stringify(r)):null;},
  claimPitchbookUpload(batchId,documentId,nowIso){const r=reservations.get(batchId);const f=ksp.kspFindPitchbookReservationFile(r,documentId);if(f.fileId)return{claimToken:'',fileInfo:{id:f.fileId,url:f.fileUrl,reused:true}};if(f.uploadState==='UPLOADING'){const e=new Error('in progress');e.code='PITCHBOOK_UPLOAD_IN_PROGRESS';throw e;}f.uploadState='UPLOADING';f.claimToken='claim-'+documentId;f.claimedAt=nowIso;return{claimToken:f.claimToken,fileInfo:null};},
  completePitchbookUploadClaim(batchId,documentId,token,fileInfo,nowIso){const f=ksp.kspFindPitchbookReservationFile(reservations.get(batchId),documentId);assert.equal(f.claimToken,token);Object.assign(f,{uploadState:'UPLOADED',claimToken:'',claimedAt:nowIso,fileId:fileInfo.id,fileUrl:fileInfo.url});},
  releasePitchbookUploadClaim(batchId,documentId,token,message,nowIso){const f=ksp.kspFindPitchbookReservationFile(reservations.get(batchId),documentId);assert.equal(f.claimToken,token);Object.assign(f,{uploadState:'FAILED',claimToken:'',claimedAt:nowIso,lastError:message});},
  findRowByKey(id,sheet,key,value){const found=rows.filter(r=>String(r[key])===String(value));if(found.length>1)throw new Error('duplicate');return found[0]?{...found[0]}:null;},
  decodeBase64(text){return [...Buffer.from(text,'base64')];},
  createOrReusePitchbookFile(folder,row,bytes,mime){if(files.has(row.Document_ID))return{...files.get(row.Document_ID),reused:true};const info={id:'FILE-'+row.Document_ID,name:row.Saved_Filename,url:'https://drive/'+row.Document_ID,reused:false,bytes:[...bytes],mime};files.set(row.Document_ID,info);if(failCreate-->0){const e=new Error('create interrupted');e.code='CREATE_INTERRUPTED';throw e;}return{...info};},
  completePitchbookRow(id,documentId,fileInfo,actor,nowIso){if(failComplete-->0){const e=new Error('index interrupted');e.code='INDEX_INTERRUPTED';throw e;}const row=rows.find(r=>r.Document_ID===documentId);if(row.Status==='Active'&&row.File_ID)return{...row};Object.assign(row,{File_ID:fileInfo.id,File_URL:fileInfo.url,Status:'Active',Updated_At:nowIso,Updated_By:actor,AI_Index_Status:'Pending'});return{...row};},
  failPitchbookRow(id,documentId,fileInfo,actor,nowIso){const row=rows.find(r=>r.Document_ID===documentId);if(row.Status!=='Active'){if(fileInfo)Object.assign(row,{File_ID:fileInfo.id,File_URL:fileInfo.url});Object.assign(row,{Status:'Failed',Updated_At:nowIso,Updated_By:actor});}return{...row};},
  clearPitchbookReservationIfComplete(id,batchId){const batchRows=rows.filter(r=>r.Batch_ID===batchId);if(batchRows.length&&batchRows.every(r=>r.Status==='Active')){reservations.delete(batchId);return true;}return false;},
  appendRow(id,sheet,row){if(failAudit-->0)throw new Error('audit down');audits.push({...row});return{rowNumber:audits.length};},
  _debug:{rows,files,audits,reservations}
 };return env;
}
async function prepare(env,input=batchInput()){return ksp.kspPreparePitchbookBatch(env,input)}
async function upload(env,slot,file={name:slot.originalFilename,bytes:Buffer.from('0123456789'),mime:slot.mimeType||'application/octet-stream'}){return ksp.kspUploadPitchbookFile(env,{batchId:slot.batchId,documentId:slot.documentId,slotFingerprint:slot.slotFingerprint,originalFilename:file.name,sizeBytes:file.bytes.length,mimeType:file.mime,base64Data:file.bytes.toString('base64')})}

test('publishes exact initial upload limits and allowed extensions',()=>{assert.equal(ksp.KSP_PITCHBOOK_LIMITS.FILE_BYTES,25*1024*1024);assert.equal(ksp.KSP_PITCHBOOK_LIMITS.FILE_COUNT,10);assert.equal(ksp.KSP_PITCHBOOK_LIMITS.TOTAL_BYTES,100*1024*1024);assert.deepEqual(Array.from(ksp.KSP_PITCHBOOK_ALLOWED_EXTENSIONS),['pdf','pptx','xlsx','docx','txt','eml']);});
test('validates file count, size, total size, and extension',()=>{const catalog=ksp.kspBuildPitchbookCatalog(gpRows,optionRows);assert.throws(()=>ksp.kspValidatePitchbookBatchInput(ksp.kspNormalizePitchbookBatchInput(batchInput([])),catalog),/1つ以上/);assert.throws(()=>ksp.kspValidatePitchbookBatchInput(ksp.kspNormalizePitchbookBatchInput(batchInput([{originalFilename:'x.pdf',sizeBytes:25*1024*1024+1}])),catalog),/25MB/);assert.throws(()=>ksp.kspValidatePitchbookBatchInput(ksp.kspNormalizePitchbookBatchInput(batchInput([{originalFilename:'x.exe',sizeBytes:1}])),catalog),/対応していない/);});
test('formats stable IDs and deterministic filenames',()=>{assert.equal(ksp.kspFormatBatchId(1),'BAT-000001');assert.equal(ksp.kspFormatDocumentId(12),'DOC-000012');assert.equal(ksp.kspBuildPitchbookFilename({date:'2026-08-16'},{gp:{name:'KKR'},assetClass:{name:'Infrastructure'},capitalType:{name:'Equity'}},1,'PDF'),'2026-08-16_KKR_Infrastructure_Equity_01.PDF');});
test('reserves one batch with stable document IDs and sequences after current max',async()=>{const env=makeEnv({rows:[{Document_ID:'DOC-000099',Batch_ID:'BAT-000099',Date:'2026-08-16',GP_ID:'GP-1',Asset_Class_ID:'AC-1',Capital_Type_ID:'CT-1',Sequence_No:4,Original_Filename:'old.pdf',Saved_Filename:'old.pdf',Status:'Active'}]});const result=await prepare(env,batchInput([{originalFilename:'a.pdf',sizeBytes:10},{originalFilename:'b.pptx',sizeBytes:10}]));assert.equal(result.ok,true);assert.equal(result.batchId,'BAT-000001');assert.deepEqual(result.slots.map(s=>s.documentId),['DOC-000001','DOC-000002']);assert.deepEqual(result.slots.map(s=>s.sequenceNo),[5,6]);assert.match(result.slots[0].savedFilename,/_05\.pdf$/);assert.equal(env._debug.rows.find(row=>row.Document_ID==='DOC-000001').AI_Index_Status,'NotIndexed');});
test('happy path activates one slot, stores one file, and audits metadata only',async()=>{const env=makeEnv();const prepared=await prepare(env);const result=await upload(env,prepared.slots[0]);assert.equal(result.ok,true);assert.equal(env._debug.rows[0].Status,'Active');assert.equal(env._debug.files.size,1);assert.equal(env._debug.audits.length,1);const audit=JSON.stringify(env._debug.audits[0]);assert.equal(audit.includes('MDEyMzQ1Njc4OQ=='),false);assert.equal(audit.includes('base64Data'),false);});
test('mixed result preserves successful file and marks only failing file Failed',async()=>{const env=makeEnv({failCreate:1});const prepared=await prepare(env,batchInput([{originalFilename:'a.pdf',sizeBytes:10},{originalFilename:'b.pdf',sizeBytes:10}]));const first=await upload(env,prepared.slots[0]);const second=await upload(env,prepared.slots[1]);assert.equal(first.ok,false);assert.equal(second.ok,true);assert.equal(env._debug.rows[0].Status,'Failed');assert.equal(env._debug.rows[1].Status,'Active');assert.equal(env._debug.files.size,2);});
test('retry after Drive creation and Index interruption reuses the file and same row',async()=>{const env=makeEnv({failComplete:1});const prepared=await prepare(env);const first=await upload(env,prepared.slots[0]);assert.equal(first.ok,false);assert.equal(env._debug.rows.length,1);assert.equal(env._debug.files.size,1);assert.equal(env._debug.rows[0].Status,'Failed');const retry=await upload(env,first.retry);assert.equal(retry.ok,true);assert.equal(retry.reusedFile,true);assert.equal(env._debug.rows.length,1);assert.equal(env._debug.files.size,1);assert.equal(env._debug.rows[0].Status,'Active');});
test('replaying an Active slot is idempotent',async()=>{const env=makeEnv();const prepared=await prepare(env);const first=await upload(env,prepared.slots[0]);const second=await upload(env,first.slot);assert.equal(second.ok,true);assert.equal(second.idempotentReplay,true);assert.equal(env._debug.files.size,1);assert.equal(env._debug.rows.length,1);});
test('audit failure does not roll back an authoritative success',async()=>{const env=makeEnv({failAudit:1});const prepared=await prepare(env);const result=await upload(env,prepared.slots[0]);assert.equal(result.ok,true);assert.equal(env._debug.rows[0].Status,'Active');assert.ok(result.warnings.some(w=>w.code==='AUDIT_WRITE_FAILED'));});
test('actor lookup failure falls back without blocking preparation or upload',async()=>{const env=makeEnv({actorError:true});const prepared=await prepare(env);assert.equal(prepared.ok,true);const result=await upload(env,prepared.slots[0]);assert.equal(result.ok,true);assert.equal(env._debug.rows[0].Created_By,'UNIDENTIFIED');});
test('slot fingerprint detects persisted reservation changes without mutating the reserved row',async()=>{const env=makeEnv();const prepared=await prepare(env);env._debug.rows[0].Saved_Filename='changed.pdf';const result=await upload(env,prepared.slots[0]);assert.equal(result.ok,false);assert.equal(result.error.code,'PITCHBOOK_SLOT_FINGERPRINT_CONFLICT');assert.equal(env._debug.rows[0].Status,'Pending');});

test('server batch validation enforces 100MB total independently of per-file limit',()=>{
  const files=Array.from({length:5},(_,index)=>({originalFilename:`f${index}.pdf`,sizeBytes:21*1024*1024,mimeType:'application/pdf'}));
  const catalog=ksp.kspBuildPitchbookCatalog(gpRows,optionRows);
  assert.throws(()=>ksp.kspValidatePitchbookBatchInput(ksp.kspNormalizePitchbookBatchInput(batchInput(files)),catalog),/100MB/);
});

test('upload rejects a file whose actual size differs from its reserved descriptor',async()=>{
  const env=makeEnv();const prepared=await prepare(env);
  const wrong={name:prepared.slots[0].originalFilename,bytes:Buffer.from('too-short'),mime:prepared.slots[0].mimeType};
  const result=await upload(env,prepared.slots[0],wrong);
  assert.equal(result.ok,false);assert.equal(result.error.code,'PITCHBOOK_FILE_SIZE_MISMATCH');
  assert.equal(env._debug.files.size,0);assert.equal(env._debug.rows[0].Status,'Pending');
});
