const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const source=name=>fs.readFileSync(path.join(__dirname,'../src',name),'utf8');
function harness(respond){
  const nodes=new Map(),storage=new Map(),calls=[];
  function element(id=''){
    const classes=new Set();return{id,value:'',checked:false,disabled:false,hidden:false,options:[],children:[],dataset:{},listeners:{},textContent:'',innerHTML:'',className:'',
      classList:{add:x=>classes.add(x),remove:x=>classes.delete(x),toggle:(x,on)=>on?classes.add(x):classes.delete(x),contains:x=>classes.has(x)},
      addEventListener(name,handler){(this.listeners[name]??=[]).push(handler)},append(...children){this.children.push(...children)},appendChild(child){this.children.push(child);return child},prepend(child){this.children.unshift(child)},
      querySelectorAll(){return[]},contains(){return false},scrollIntoView(){},setAttribute(key,value){this[key]=value},removeAttribute(key){delete this[key]}
    };
  }
  for(const name of fs.readdirSync(path.join(__dirname,'../src')).filter(x=>x.endsWith('.html'))){for(const match of source(name).matchAll(/\bid="([^"]+)"/g))nodes.set(match[1],element(match[1]))}
  const document={getElementById:id=>nodes.get(id)||null,querySelectorAll:()=>[],createElement:()=>element()};
  const context=vm.createContext({document,console,Map,Set,Date,crypto:require('node:crypto').webcrypto,confirm:()=>true,prompt:()=>null,window:{},localStorage:{getItem:key=>storage.get(key)||null,setItem:(key,value)=>storage.set(key,value),removeItem:key=>storage.delete(key)},FileReader:class{readAsDataURL(){this.result='data:application/pdf;base64,WA==';this.onload()}}});
  for(const name of ['ClientCore.html','Index.html','ClientPitchbookFiles.html','ClientPitchbookFlow.html','ClientMaintenance.html','ClientMaintenanceEnhancements.html']){
    for(const match of source(name).matchAll(/<script>([\s\S]*?)<\/script>/g))vm.runInContext(match[1],context,{filename:name});
  }
  context.google={script:{run:{withSuccessHandler(resolve){
    return{withFailureHandler(reject){
      return new Proxy({},{get(_,name){return payload=>{
        const wirePayload=JSON.parse(JSON.stringify(payload??null));
        calls.push({name,payload:wirePayload});
        Promise.resolve().then(()=>respond(name,wirePayload)).then(resolve,reject);
      }}});
    }};
  }}}};
  const run=text=>vm.runInContext(text,context);
  run('meetingLoading=false;pitchbookLoading=false');
  for(const [field,value] of Object.entries({date:'2026-09-08',counterpartyType:'LP_ASSET_OWNER',counterpartyId:'LP-1',assetClassId:'AC-1'}))nodes.get('meeting-'+field).value=value;
  return{nodes,calls,run,storage};
}
function parent(version=1,ids=[]){return{meetingId:'MTG-1',version,status:'Active',relatedPitchbookIds:ids,relatedPitchbooks:[],notes:'Synthetic body',counterpartyType:'LP_ASSET_OWNER'}}
function fileSetup(h){h.run("selectedPitchbookFiles=[{name:'Synthetic.pdf',size:1,type:'application/pdf'}]")}

test('production shell retains seven accepted sidebar entries and real includes',()=>{
  const index=source('Index.html'),nav=index.match(/<nav[\s\S]*?<\/nav>/)[0];
  assert.equal((nav.match(/<button /g)||[]).length,7);
  for(const label of ['ナレッジ検索','記録を追加','過去の記録','面談先サマリー','面談実績の集計','プルダウンの管理','管理者ページ'])assert.ok(nav.includes(label));
  assert.doesNotMatch(nav,/nav-pitchbook|nav-relationship-explorer|nav-gp-workspace/);
  assert.doesNotMatch(index,/id="pitchbook-form"|id="page-pitchbook"/);
  for(const name of ['ClientPitchbookFiles','ClientPitchbookFlow','ClientMaintenance'])assert.ok(index.includes("include_('"+name+"')"));
  assert.match(source('ClientBootstrap.html'),/showPage\('knowledge'\)/);
  assert.match(source('Styles.html'),/#182124/);
  assert.doesNotMatch(source('Styles.html'),/prefers-color-scheme|data-theme/);
  assert.match(source('ClientMaintenance.html'),/data-meeting-detail="/);
  assert.match(source('ClientMaintenanceEnhancements.html'),/\[data-meeting-detail\]/);
});
test('parent failure never prepares files and preserves selected bytes',async()=>{
  const h=harness(name=>{assert.equal(name,'registerMeeting');return{ok:false,error:{message:'Parent rejected'}}});fileSetup(h);
  await h.run('submitMeetingWithFiles({preventDefault(){}})');
  assert.deepEqual(h.calls.map(x=>x.name),['registerMeeting']);assert.equal(h.run('selectedPitchbookFiles.length'),1);
  assert.equal(h.run('pitchbookParent'),null);
});
test('parent-first flow passes authoritative binding and updates version before second upload',async()=>{
  let version=1;const ids=[];
  const h=harness((name,payload)=>{
    if(name==='registerMeeting'){assert.deepEqual(payload.relatedPitchbookIds,[]);return{ok:true,meeting:{id:'MTG-1',version,status:'Active'}}}
    if(name==='getMeetingMaintenanceRecord')return{ok:true,record:parent(version,ids)};
    if(name==='preparePitchbookBatch'){assert.equal(payload.parentMeetingId,'MTG-1');assert.equal(payload.expectedParentVersion,1);assert.equal(payload.gpId,undefined);return{ok:true,slots:payload.files.map((file,i)=>({...file,documentId:'DOC-'+i,batchId:'B-1',slotFingerprint:'S-'+i,parentMeetingId:'MTG-1',parentVersion:version}))}}
    if(name==='uploadPitchbookFile'){assert.equal(payload.expectedParentVersion,version);ids.push(payload.documentId);version++;return{ok:true,fileSaved:true,linkConfirmed:true,parentVersion:version,slot:{documentId:payload.documentId,parentVersion:version}}}
    throw Error(name);
  });fileSetup(h);h.run("selectedPitchbookFiles.push({name:'Second.pdf',size:1,type:'application/pdf'})");
  await h.run('submitMeetingWithFiles({preventDefault(){}})');
  assert.equal(h.calls[0].name,'registerMeeting');assert.deepEqual(h.calls.filter(x=>x.name==='uploadPitchbookFile').map(x=>x.payload.expectedParentVersion),[1,2]);
  assert.equal(h.run('pitchbookParent.version'),3);assert.equal(h.run('pitchbookSlots.length'),0);
  await h.run('submitMeetingWithFiles({preventDefault(){}})');assert.equal(h.calls.filter(x=>x.name==='registerMeeting').length,1);
});
test('file-saved/link-failed retries only relation on same Document_ID without file selection',async()=>{
  let linked=false;
  const h=harness((name,payload)=>{
    if(name==='getMeetingMaintenanceRecord')return{ok:true,record:parent(linked?2:1,linked?['DOC-1']:[])};
    if(name==='updateMeetingRelations'){assert.equal(payload.documentId,'DOC-1');assert.equal(payload.operation,'add');linked=true;return{ok:true,meetingId:'MTG-1',version:2,relatedPitchbookIds:['DOC-1']}}
    throw Error('Unexpected '+name);
  });
  h.run("bindPitchbookParent({meetingId:'MTG-1',version:1,status:'Active'},false);pitchbookSlots=[{parentMeetingId:'MTG-1',parentVersion:1,documentId:'DOC-1',fileSaved:true,status:'LinkPending'}]");
  await h.run('completeParentAttachments()');assert.equal(linked,true);assert.equal(h.calls.filter(x=>x.name==='uploadPitchbookFile').length,0);assert.equal(h.run('pitchbookSlots.length'),0);
});
test('lost upload response reconciles existing file and existing relationship before any retry',async()=>{
  const h=harness(name=>{
    if(name==='getPitchbookMaintenanceRecord')return{ok:true,record:{documentId:'DOC-1',fileId:'FILE-1',status:'Active'}};
    if(name==='getMeetingMaintenanceRecord')return{ok:true,record:parent(2,['DOC-1'])};
    throw Error(name);
  });
  h.run("bindPitchbookParent({meetingId:'MTG-1',version:1,status:'Active'},false);pitchbookSlots=[{parentMeetingId:'MTG-1',documentId:'DOC-1',outcomeUnknown:true,status:'Failed'}]");
  await h.run('completeParentAttachments()');assert.deepEqual(h.calls.map(x=>x.name),['getPitchbookMaintenanceRecord','getMeetingMaintenanceRecord']);assert.equal(h.run('pitchbookSlots.length'),0);
});
test('unresolved upload readback fails closed without uploading',async()=>{
  const h=harness(()=>({ok:false,error:{message:'Unavailable'}}));
  h.run("bindPitchbookParent({meetingId:'MTG-1',version:1,status:'Active'},false);pitchbookSlots=[{parentMeetingId:'MTG-1',documentId:'DOC-1',outcomeUnknown:true,status:'Failed'}]");
  await h.run('completeParentAttachments()');assert.deepEqual(h.calls.map(x=>x.name),['getPitchbookMaintenanceRecord']);assert.equal(h.run('pitchbookSlots[0].outcomeUnknown'),true);
});
for(const status of ['Failed','Pending'])test('retained fileId with '+status+' uses same upload slot, never premature link-only',async()=>{
  const h=harness((name,payload)=>{
    if(name==='getPitchbookMaintenanceRecord')return{ok:true,record:{documentId:'DOC-1',fileId:'FILE-1',status}};
    if(name==='getMeetingMaintenanceRecord')return{ok:true,record:parent()};
    assert.equal(name,'uploadPitchbookFile');assert.equal(payload.documentId,'DOC-1');return{ok:true,fileSaved:true,linkConfirmed:true,parentVersion:2};
  });fileSetup(h);h.run("bindPitchbookParent({meetingId:'MTG-1',version:1,status:'Active'},false);pitchbookSlots=[{parentMeetingId:'MTG-1',documentId:'DOC-1',originalFilename:'Synthetic.pdf',sizeBytes:1,outcomeUnknown:true,status:'Failed'}]");
  await h.run('completeParentAttachments()');assert.equal(h.calls.filter(x=>x.name==='uploadPitchbookFile').length,1);assert.equal(h.calls.some(x=>x.name==='updateMeetingRelations'),false);
});
test('Inactive retained file readback never uploads or reactivates',async()=>{
  const h=harness(name=>{assert.equal(name,'getPitchbookMaintenanceRecord');return{ok:true,record:{documentId:'DOC-1',fileId:'FILE-1',status:'Inactive'}}});fileSetup(h);
  h.run("bindPitchbookParent({meetingId:'MTG-1',version:1,status:'Active'},false);pitchbookSlots=[{parentMeetingId:'MTG-1',documentId:'DOC-1',outcomeUnknown:true,status:'Failed'}]");
  await h.run('completeParentAttachments()');assert.equal(h.calls.length,1);assert.equal(h.run('pitchbookSlots[0].outcomeUnknown'),true);
});
test('relation-only remove and relink do not invoke body edit or Reactivate',async()=>{
  let ids=['DOC-1'],version=1;
  const h=harness((name,payload)=>{
    if(name==='getMeetingMaintenanceRecord')return{ok:true,record:{...parent(version,ids),relatedPitchbooks:[{id:'DOC-1',title:'Synthetic',status:'Inactive'}]}};
    assert.equal(name,'updateMeetingRelations');ids=payload.operation==='add'?['DOC-1']:[];return{ok:true,meetingId:'MTG-1',version:++version,relatedPitchbookIds:ids};
  });
  await h.run("openMeetingDetail('MTG-1')");await h.run("changeDetailRelation('DOC-1','remove')");
  assert.match(h.nodes.get('meeting-detail-files').innerHTML,/削除を取り消す/);
  await h.run("changeDetailRelation('DOC-1','add')");
  assert.deepEqual(h.calls.filter(x=>x.name==='updateMeetingRelations').map(x=>x.payload.operation),['remove','add']);
  assert.equal(h.nodes.get('meeting-detail-body').textContent,'Synthetic body');assert.match(h.nodes.get('meeting-detail-files').innerHTML,/Inactive/);
  assert.equal(h.calls.some(x=>/updateMeetingMaintenance|changePitchbookStatus/.test(x.name)),false);
});
test('inactive parent rejects upload before file read or mutation',async()=>{
  const h=harness(name=>{assert.equal(name,'getMeetingMaintenanceRecord');return{ok:true,record:{...parent(),status:'Inactive'}}});fileSetup(h);
  h.run("bindPitchbookParent({meetingId:'MTG-1',version:1,status:'Active'},false)");await h.run('completeParentAttachments()');
  assert.deepEqual(h.calls.map(x=>x.name),['getMeetingMaintenanceRecord']);assert.match(h.nodes.get('pitchbook-status').textContent,/再送は行いません/);
});
test('unknown parent registration response cannot create a second parent',async()=>{
  const h=harness(()=>{throw Error('Transport lost')});await h.run('submitMeetingWithFiles({preventDefault(){}})');await h.run('submitMeetingWithFiles({preventDefault(){}})');assert.equal(h.calls.length,1);
});
test('unknown prepare response reuses identical requestId and descriptors',async()=>{
  const h=harness(name=>{if(name==='getMeetingMaintenanceRecord')return{ok:true,record:parent()};throw Error('Transport lost')});fileSetup(h);h.run("bindPitchbookParent({meetingId:'MTG-1',version:1,status:'Active'},false)");
  await h.run('completeParentAttachments()');await h.run('completeParentAttachments()');const preparations=h.calls.filter(x=>x.name==='preparePitchbookBatch');assert.equal(preparations.length,2);assert.ok(preparations[0].payload.requestId);assert.deepEqual(preparations[0].payload,preparations[1].payload);
});
