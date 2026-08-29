const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { loadAi } = require('./ai-test-loader.cjs');
const ksp = loadAi();

function plain(value){return JSON.parse(JSON.stringify(value));}

function baseContext(overrides={}) {
  return {
    backendSpreadsheetId:'backend', auditSpreadsheetId:'audit',
    settings:{
      GEMINI_FILE_SEARCH_STORE_NAME:'fileSearchStores/store-1',
      AI_DEFAULT_MODEL:'gemini-flash-configured',
      AI_SYNC_ENABLED:'true', AI_SYNC_INTERVAL_MINUTES:'15', AI_SYNC_BATCH_SIZE:'10',
      AI_MAX_RETRY_ATTEMPTS:'5', AI_RETRY_BASE_MINUTES:'15', AI_RETRY_MAX_MINUTES:'240'
    },
    gpRows:[{GP_ID:'GP-1',GP_Name:'KKR',Status:'Active'}],
    optionRows:[
      {Option_ID:'AC-1',Type:'ASSET_CLASS',Name:'Infrastructure',Sort_Order:1,Status:'Active'},
      {Option_ID:'CT-1',Type:'CAPITAL_TYPE',Name:'Equity',Sort_Order:1,Status:'Active'}
    ],
    meetingRows:[{
      Meeting_ID:'MTG-000001',Date:'2026-08-01',GP_ID:'GP-1',Asset_Class_ID:'AC-1',Capital_Type_ID:'CT-1',
      Doc_File_ID:'doc-1',Doc_URL:'https://drive.test/meeting-1',Saved_Filename:'2026_KKR_MTG',Status:'Active',
      Updated_At:'2026-08-02T00:00:00.000Z',AI_Document_Name:'',AI_Index_Status:'Pending',AI_Indexed_At:'',AI_Content_Hash:'',AI_Last_Error:''
    }],
    pitchbookRows:[{
      Document_ID:'DOC-000001',Date:'2026-08-01',GP_ID:'GP-1',Asset_Class_ID:'AC-1',Capital_Type_ID:'CT-1',
      File_ID:'file-1',File_URL:'https://drive.test/file-1',Original_Filename:'note.txt',Saved_Filename:'2026_KKR_01.txt',Status:'Active',
      Updated_At:'2026-08-03T00:00:00.000Z',AI_Document_Name:'',AI_Index_Status:'Pending',AI_Indexed_At:'',AI_Content_Hash:'',AI_Last_Error:''
    }],
    ...overrides
  };
}

function createSyncEnvironment(options={}) {
  let clock=0;
  const context=baseContext(options.context||{});
  const documents=(options.documents||[]).map(plain);
  const deleted=[];
  const uploaded=[];
  const patches=[];
  const claims=new Set();
  const publicClaims=new Set();
  const publicCache=new Map();
  const audits=[];
  const queryDebug={starts:[],polls:[],sleeps:0};
  return {
    nowIso(){clock++;return `2026-08-16T00:${String(clock).padStart(2,'0')}:00.000Z`;},
    loadAiContext(){return context;},
    ensureAiSettings(rows){for(const row of rows)if(!(row.Key in context.settings))context.settings[row.Key]=row.Value;return{};},
    ensureFileSearchStore(){return{name:'fileSearchStores/store-1'};},
    readMeetingText(){if(options.readError)throw options.readError;return options.meetingText||'Meeting body';},
    readTextFile(){if(options.readError)throw options.readError;return options.txtText||'Pitchbook text';},
    readPitchbookSource(){if(options.readError)throw options.readError;return options.pitchbookSource||{mimeType:'text/plain',bytes:Array.from(Buffer.from(options.txtText||'Pitchbook text','utf8'))};},
    decodeSourceText(bytes){return Buffer.from(bytes).toString('utf8');},
    hashText(text){return ksp.kspAiHashTextFallback_(text);},
    hashBytes(bytes){return ksp.kspAiHashBytesFallback_(bytes);},
    findFileSearchDocumentsBySource(store,sourceId){return documents.filter(d=>d.customMetadata.source_id===sourceId).map(plain);},
    deleteFileSearchDocument(store,name){deleted.push(name);const i=documents.findIndex(d=>d.name===name);if(i>=0)documents.splice(i,1);},
    uploadSourceToFileSearchStore(store,source){if(options.uploadError)throw options.uploadError;const doc={name:`fileSearchStores/store-1/documents/new-${source.sourceId}`,displayName:source.displayName,customMetadata:{source_id:source.sourceId,content_hash:source.contentHash}};documents.push(doc);uploaded.push(plain(source));return doc;},
    updateAiRow(type,id,patch){patches.push({type,id,patch:plain(patch)});const rows=type==='Meeting'?context.meetingRows:context.pitchbookRows;Object.assign(rows.find(r=>(r.Meeting_ID||r.Document_ID)===id),plain(patch));},
    claimAiSource(type,id){const key=type+':'+id;if(options.claimDenied===key||claims.has(key))return null;claims.add(key);return{token:key};},
    releaseAiSourceClaim(type,id){claims.delete(type+':'+id);},
    getActor(){if(options.actorError)throw new Error('actor');return 'person@example.com';},
    appendAuditRow(id,row){if(options.auditError)throw new Error('audit');audits.push(plain(row));},
    queryFileSearch(request){if(options.queryError)throw options.queryError;return options.queryResponse||{};},
    claimPublicOperation(key){if(publicClaims.has(key))return false;publicClaims.add(key);return true;},
    getPublicIdempotency(key){return publicCache.has(key)?plain(publicCache.get(key)):null;},
    setPublicIdempotency(key,value){publicCache.set(key,plain(value));},
    startQueryProvider(provider,config,request){
      queryDebug.starts.push(plain(request));
      if(typeof options.startQueryProvider==='function')return options.startQueryProvider(provider,config,request);
      if(Array.isArray(options.startLifecycles))return options.startLifecycles[queryDebug.starts.length-1]||options.startLifecycles.at(-1);
      return {status:'completed',response:options.queryResponse||{}};
    },
    pollQueryProvider(provider,config,interactionId){
      queryDebug.polls.push(String(interactionId));
      if(typeof options.pollQueryProvider==='function')return options.pollQueryProvider(provider,config,interactionId);
      if(Array.isArray(options.pollLifecycles))return options.pollLifecycles[queryDebug.polls.length-1]||options.pollLifecycles.at(-1);
      return {status:'completed',response:options.queryResponse||{}};
    },
    _debug:{context,documents,deleted,uploaded,patches,audits,publicCache,queryDebug}
  };
}

module.exports = { test, assert, fs, path, vm, ksp, plain, baseContext, createSyncEnvironment };
