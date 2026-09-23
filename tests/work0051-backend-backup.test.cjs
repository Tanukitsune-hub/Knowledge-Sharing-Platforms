const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');

const root=path.resolve(__dirname,'..');
const context=vm.createContext({Date,JSON,Object,Array,String,Number,Boolean,Math,RegExp,Error});
for(const name of ['00_Core.gs','05_TemporalContracts.gs','21_BackendBackup.gs','22_BackendBackupLive.gs']){
  vm.runInContext(fs.readFileSync(path.join(root,'src',name),'utf8'),context,{filename:name});
}
const plain=value=>JSON.parse(JSON.stringify(value));
const mime='application/vnd.google-apps.spreadsheet';
const folderMime='application/vnd.google-apps.folder';
const sourceSheets=['Counterparty_Master','Option_Master','Meeting_Index','Pitchbook_Index','Settings','Future_Backend_Sheet'];

function snapshot(id,date,overrides={}){
  return {id,name:'Knowledge Platform Backend Backup '+date,mimeType:mime,parents:['backup-folder'],trashed:false,
    appProperties:{kspBackupKind:'backend-daily-v1',kspBackendSourceId:'backend',kspBackupDate:date},sheets:[...sourceSheets],...overrides};
}
function fixture(options={}){
  const files=new Map([
    ['backend',{id:'backend',name:'Knowledge Platform Backend',mimeType:mime,parents:['control'],trashed:false,sheets:[...sourceSheets]}],
    ['backup-folder',{id:'backup-folder',name:'Knowledge Platform Backups',mimeType:folderMime,parents:[options.wrongFolder?'elsewhere':'control'],trashed:false}],
    ['audit',{id:'audit',name:'Knowledge Platform Audit',mimeType:mime,parents:['control'],trashed:false}]
  ]);
  for(const item of options.files||[])files.set(item.id,plain(item));
  const calls={copies:[],trashes:[],locks:0,releases:0};
  const installation={config:{environment:'PROD',knowledgeParentFolderId:'knowledge',controlFolderId:'control',adminEmails:['admin@example.com'],timezone:'Asia/Tokyo',aiSyncEnabled:false,aiSyncIntervalMinutes:15},resources:{backendSpreadsheetId:'backend',backupFolderId:'backup-folder',auditSpreadsheetId:'audit'}};
  const env={
    acquireScriptLock(){calls.locks++;return{}},releaseScriptLock(){calls.releases++},
    getProperty(key){return key==='KSP_INSTALLATION_STATE_JSON'?JSON.stringify(installation):null},
    getResource(id){const file=files.get(id);return file&&!file.trashed?plain(file):null},
    todayKey(){return options.today||'2026-09-23'},
    listBackupFiles(folderId){if(options.listFailure)throw Object.assign(new Error('listing failed'),{code:'LIST_FAILED'});return [...files.values()].filter(file=>!file.trashed&&file.parents.includes(folderId)).map(plain)},
    getBackupFile(id){return files.has(id)?plain(files.get(id)):null},
    copyBackendSpreadsheet(sourceId,folderId,name,marker){
      calls.copies.push({sourceId,folderId,name,marker:plain(marker)});
      if(options.copyFailure)throw Object.assign(new Error('copy failed'),{code:'COPY_FAILED'});
      const source=files.get(sourceId),copy={id:'copy-'+calls.copies.length,name,mimeType:source.mimeType,parents:[folderId],trashed:false,appProperties:plain(marker),sheets:[...source.sheets]};
      files.set(copy.id,copy);return plain(copy);
    },
    trashBackupFile(id){calls.trashes.push(id);const file=files.get(id);file.trashed=true;return{id,trashed:true}}
  };
  return{env,files,calls};
}

test('daily run copies only the full Backend file into the restricted folder and is same-day idempotent',()=>{
  const run=fixture();const first=plain(context.kspRunBackendDailyBackup_(run.env));
  assert.deepEqual(first,{ok:true,dateKey:'2026-09-23',snapshot:'CREATED',retentionTrashed:0,errorCode:''});
  assert.equal(run.calls.copies.length,1);assert.deepEqual(run.calls.copies[0].marker,{kspBackupKind:'backend-daily-v1',kspBackendSourceId:'backend',kspBackupDate:'2026-09-23'});
  assert.deepEqual(run.files.get('copy-1').sheets,sourceSheets);
  assert.equal(run.files.get('backend').trashed,false);assert.equal(run.files.get('audit').trashed,false);
  const second=plain(context.kspRunBackendDailyBackup_(run.env));assert.equal(second.snapshot,'REUSED');assert.equal(run.calls.copies.length,1);
  assert.equal(run.calls.locks,2);assert.equal(run.calls.releases,2);
});

test('retention trashes only marked snapshots older than 30 calendar days',()=>{
  const old=snapshot('old','2026-08-23'),boundary=snapshot('boundary','2026-08-24');
  const unrelated=snapshot('unrelated','2026-08-01',{appProperties:{}});
  const wrongSource=snapshot('wrong-source','2026-08-01',{appProperties:{kspBackupKind:'backend-daily-v1',kspBackendSourceId:'audit',kspBackupDate:'2026-08-01'}});
  const wrongName=snapshot('wrong-name','2026-08-01',{name:'Unrelated file'});
  const run=fixture({files:[old,boundary,unrelated,wrongSource,wrongName]});
  const result=plain(context.kspRunBackendDailyBackup_(run.env));
  assert.equal(result.ok,true);assert.equal(result.retentionTrashed,1);assert.deepEqual(run.calls.trashes,['old']);
  for(const id of ['boundary','unrelated','wrong-source','wrong-name','backend','audit'])assert.equal(run.files.get(id).trashed,false,id);
  assert.equal(context.kspBackendBackupAgeDays_('2026-09-23','2026-08-24'),30);
});

test('folder ambiguity, listing failure, copy failure and duplicate snapshots fail without Trash or source mutation',()=>{
  for(const options of [{wrongFolder:true},{listFailure:true},{copyFailure:true},{files:[snapshot('one','2026-09-23'),snapshot('two','2026-09-23')]}]){
    const run=fixture({...options,files:[snapshot('old','2026-08-01'),...(options.files||[])]});
    const result=plain(context.kspRunBackendDailyBackup_(run.env));assert.equal(result.ok,false);
    assert.deepEqual(run.calls.trashes,[]);assert.equal(run.files.get('backend').trashed,false);assert.equal(run.files.get('old').trashed,false);
  }
});

test('live Drive adapter uses full pagination, exact copy parent/marker and reversible Trash',()=>{
  const calls=[];
  context.kspCreateAppsScriptEnvironment_=()=>({});
  context.kspCanonicalBusinessDate_=()=> '2026-09-23';
  context.Drive={Files:{
    list(args){calls.push(['list',plain(args)]);return calls.filter(call=>call[0]==='list').length===1?{files:[snapshot('one','2026-09-23')],nextPageToken:'next'}:{files:[snapshot('two','2026-09-22')]}}
    ,get(id,args){calls.push(['get',id,plain(args)]);return snapshot(id,'2026-09-23')},
    copy(body,id,args){calls.push(['copy',plain(body),id,plain(args)]);return snapshot('copied','2026-09-23')},
    update(body,id,media,args){calls.push(['update',plain(body),id,media,plain(args)]);return{id,trashed:true}}
  }};
  const env=context.kspCreateBackendBackupEnvironment_();assert.equal(env.todayKey('Asia/Tokyo'),'2026-09-23');
  assert.equal(env.listBackupFiles('backup-folder').length,2);
  assert.equal(calls.filter(call=>call[0]==='list').length,2);
  env.getBackupFile('one');env.copyBackendSpreadsheet('backend','backup-folder','Knowledge Platform Backend Backup 2026-09-23',{kspBackupKind:'backend-daily-v1'});env.trashBackupFile('one');
  const copy=calls.find(call=>call[0]==='copy');assert.deepEqual(copy[1].parents,['backup-folder']);assert.equal(copy[2],'backend');assert.equal(copy[3].supportsAllDrives,true);
  const update=calls.find(call=>call[0]==='update');assert.deepEqual(update[1],{trashed:true});assert.equal(update[2],'one');
});

test('live trigger adapter requests one off-hours daily CLOCK trigger in installation timezone',()=>{
  const steps=[];
  const trigger={getUniqueId:()=> 'daily-1',getHandlerFunction:()=> 'runBackendDailyBackup_',getEventType:()=> 'CLOCK'};
  const builder={timeBased(){steps.push('timeBased');return this},atHour(hour){steps.push(['atHour',hour]);return this},everyDays(days){steps.push(['everyDays',days]);return this},inTimezone(zone){steps.push(['inTimezone',zone]);return this},create(){steps.push('create');return trigger}};
  const live=vm.createContext({PropertiesService:{getScriptProperties:()=>({})},ScriptApp:{newTrigger(handler){steps.push(['newTrigger',handler]);return builder}},KSP_DEFAULTS:{TIMEZONE:'Asia/Tokyo'}});
  vm.runInContext(fs.readFileSync(path.join(root,'src','20_LiveEnvironment.gs'),'utf8'),live);
  assert.equal(live.kspCreateAppsScriptEnvironment_().createDailyTrigger('runBackendDailyBackup_','Asia/Tokyo').eventType,'CLOCK');
  assert.deepEqual(steps,[['newTrigger','runBackendDailyBackup_'],'timeBased',['atHour',2],['everyDays',1],['inTimezone','Asia/Tokyo'],'create']);
});
