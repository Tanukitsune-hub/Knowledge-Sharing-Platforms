// Local rendering only. All RPC replies below are transport fixtures, not backend implementations.
const fs=require('node:fs');
const path=require('node:path');
const http=require('node:http');
const assert=require('node:assert/strict');
const crypto=require('node:crypto');
const root=path.resolve(__dirname,'..');
const out=path.join(root,'docs/handoffs/0028-CODEX-12-ui-evidence');
const playwrightPath=process.env.KSP_PLAYWRIGHT_PATH||path.join(process.env.USERPROFILE,'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const {chromium}=require(playwrightPath);
const included=new Map();
function render(name,parents=[]){
  assert.match(name,/^[A-Za-z0-9_-]+$/);assert.ok(!parents.includes(name),'include cycle');
  const text=fs.readFileSync(path.join(root,'src',name+'.html'),'utf8');
  included.set(name+'.html',crypto.createHash('sha256').update(text).digest('hex'));
  return text.replace(/<\?!=\s*include_\('([^']+)'\);?\s*\?>/g,(_,child)=>render(child,[...parents,name]));
}
const types=[{code:'GP',label:'GP / 運用会社'},{code:'LP_ASSET_OWNER',label:'LP / Asset Owner',optionType:'COUNTERPARTY_LP'}];
const gps=[{id:'GP-SYNTH',name:'Synthetic GP',status:'Active'}];
const masterOptions=[['ASSET_CLASS','AC-SYNTH','Private Equity'],['CAPITAL_TYPE','CAP-SYNTH','Equity'],['TEAM','TEAM-SYNTH','Synthetic team'],['LOCATION','LOC-SYNTH','Online'],['COUNTERPARTY_LP','LP-SYNTH','Synthetic LP']].map(([type,id,name])=>({type,id,name,status:'Active',sortOrder:1}));
const options={gps,assetClasses:[masterOptions[0]],capitalTypes:[masterOptions[1]],teams:[masterOptions[2]],locations:[masterOptions[3]],counterpartyTypes:types,counterpartyEntities:[{id:'GP-SYNTH',type:'GP',name:'Synthetic GP',status:'Active'},{id:'LP-SYNTH',type:'LP_ASSET_OWNER',name:'Synthetic LP',status:'Active'}],relatedPitchbooks:[]};
const documentRecord={documentId:'DOC-SYNTH',parentMeetingId:'MTG-SYNTH',counterpartyType:'LP_ASSET_OWNER',counterpartyId:'LP-SYNTH',counterpartyEntityName:'Synthetic LP',date:'2026-09-08',gpId:'',assetClassId:'AC-SYNTH',capitalTypeId:'CAP-SYNTH',fundStrategy:'Synthetic strategy',fileId:'FILE-SYNTH',fileUrl:'',status:'Active',updatedAt:'2026-09-08T00:00:00.000Z',savedFilename:'Synthetic LP — overview.txt'};
const meetingRecord={meetingId:'MTG-SYNTH',version:1,status:'Active',date:'2026-09-08',time:'10:00',locationId:'LOC-SYNTH',locationName:'Online',counterpartyType:'LP_ASSET_OWNER',counterpartyId:'LP-SYNTH',counterpartyEntityName:'Synthetic LP',relatedGpIds:[],relatedGpNames:[],assetClassId:'AC-SYNTH',assetClassName:'Private Equity',capitalTypeId:'CAP-SYNTH',capitalTypeName:'Equity',teamId:'TEAM-SYNTH',teamName:'Synthetic team',fundStrategy:'Synthetic strategy',meetingTypeCodes:['ANNUAL_REVIEW'],meetingTypeLabels:['定例年1回'],followUpRequired:true,followUpNote:'Synthetic follow-up',counterparty:'Synthetic participant',internalParticipants:'Synthetic team',notes:'Synthetic meeting notes.\nThis is a transport fixture for local rendering only.',documentUrl:'',relatedPitchbookIds:['DOC-SYNTH'],relatedPitchbooks:[{id:'DOC-SYNTH',title:documentRecord.savedFilename,status:'Active',date:'2026-09-08'}]};
const fixtures={
  getMeetingBootstrapData:{ok:true,options},getPitchbookBootstrapData:{ok:true,options},
  getPhase1MaintenanceBootstrapData:{ok:true,options,masters:{gps,options:masterOptions}},
  getKnowledgeSearchBootstrapData:{ok:true,providers:{OPENAI:{configured:false},GEMINI:{configured:false}},modelPolicies:{OPENAI:{profiles:[]},GEMINI:{profiles:[]}},modeDefinitions:[{mode:'自由質問',inputRequired:true},{mode:'比較',inputRequired:false},{mode:'面談準備',targetRequired:true}],options:{...options,counterpartyTypes:types.map(x=>({id:x.code,name:x.label})),counterpartyEntities:[{id:'LP_ASSET_OWNER:LP-SYNTH',type:'LP_ASSET_OWNER',name:'Synthetic LP'}]}},
  registerMeeting:{ok:true,meeting:{id:'MTG-NEW-SYNTH',version:1,status:'Active',documentUrl:''}},
  preparePitchbookBatch:{ok:true,slots:[{documentId:'DOC-NEW-SYNTH',batchId:'BATCH-SYNTH',slotFingerprint:'fixture-fingerprint',originalFilename:'Synthetic.txt',parentMeetingId:'MTG-NEW-SYNTH',parentVersion:1,status:'Pending'}]},
  uploadPitchbookFile:{ok:true,fileSaved:true,linkConfirmed:true,parentVersion:2,slot:{documentId:'DOC-NEW-SYNTH',parentMeetingId:'MTG-NEW-SYNTH',parentVersion:2,status:'Active'}},
  searchMeetingRecords:{ok:true,records:[meetingRecord]},
  getPitchbookMaintenanceRecord:{ok:true,record:documentRecord},
  updatePitchbookMaintenance:{ok:true,record:{...documentRecord,fundStrategy:'Synthetic revised classification'}},
  previewKnowledgeExport:{ok:true,preview:{mode:'全文出力',scopeSummary:'Synthetic LP / Meeting-only',meetingCount:1,meetingCharacterCount:95,sourceIdCount:1,sourceIds:['MTG-SYNTH'],packageText:'Synthetic Meeting-only export\nCounterparty: Synthetic LP\nDate: 2026-09-08\nSynthetic meeting notes.',hardStop:false,noResults:false}},
  getAiProviderAdminData:{ok:false,error:{message:'Synthetic locked administrator surface'}},
  getEntityWorkspaceData:{ok:true,entityTypes:[],entities:[]},
  getMeetingActivityAnalytics:{ok:false,error:{message:'Synthetic analytics fixture not populated'}}
};
const calls=[],pageErrors=[],consoleErrors=[],blockedRequests=[];
const shim=`<script>window.google={script:{run:{withSuccessHandler(success){return{withFailureHandler(failure){return new Proxy({},{get(_,name){return async payload=>{try{const response=await fetch('/rpc',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({name,payload})});const result=await response.json();if(!response.ok)throw new Error(result.error);success(result)}catch(error){failure(error)}}}})}}}}}};</script>`;
const html=render('Index').replace('<head>','<head>'+shim);
assert.doesNotMatch(html,/<\?[!=]/,'all production includes resolved');
const server=http.createServer(async(req,res)=>{
  if(req.url==='/rpc'){
    let body='';for await(const chunk of req)body+=chunk;
    const request=JSON.parse(body);calls.push(request);
    let response=request.name==='getMeetingMaintenanceRecord'?{ok:true,record:request.payload==='MTG-NEW-SYNTH'?{...meetingRecord,meetingId:'MTG-NEW-SYNTH',relatedPitchbookIds:[],relatedPitchbooks:[]}:meetingRecord}:fixtures[request.name];
    if(!response){res.writeHead(500,{'content-type':'application/json'});res.end(JSON.stringify({error:'Unexpected fixture RPC: '+request.name}));return}
    res.writeHead(200,{'content-type':'application/json'});res.end(JSON.stringify(response));return;
  }
  if(req.url==='/'){res.writeHead(200,{'content-type':'text/html;charset=utf-8'});res.end(html);return}
  res.writeHead(204);res.end();
});
async function main(){
  fs.mkdirSync(out,{recursive:true});
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const url='http://127.0.0.1:'+server.address().port+'/';
  const browser=await chromium.launch({channel:'chromium',headless:true});
  const page=await browser.newPage({viewport:{width:1366,height:900}});
  page.setDefaultTimeout(7000);
  page.on('pageerror',error=>pageErrors.push(error.message));page.on('console',message=>{if(['error','warning'].includes(message.type()))consoleErrors.push(message.text())});
  await page.route('**/*',route=>{if(route.request().url().startsWith(url))return route.continue();blockedRequests.push(route.request().url());return route.abort()});
  const checks=[];
  try{
    await page.goto(url);await page.waitForFunction(()=>document.getElementById('meeting-submit').disabled===false);
    assert.match(await page.title(),/Knowledge Sharing Platforms/);assert.equal(page.url(),url);
    assert.equal(await page.locator('.nav button').count(),7);assert.equal(await page.locator('.nav button.active').count(),1);
    assert.equal(await page.locator('#page-knowledge').isVisible(),true);checks.push('identity / nav7 / default Knowledge Search');
    await page.locator('#nav-meeting').click();
    await page.locator('#meeting-date').fill('2026-09-08');await page.locator('#meeting-counterpartyType').selectOption('LP_ASSET_OWNER');await page.locator('#meeting-counterpartyId').selectOption('LP-SYNTH');await page.locator('#meeting-assetClassId').selectOption('AC-SYNTH');await page.locator('#meeting-notes').fill('Synthetic local-render registration.');
    await page.locator('#pitchbook-files').setInputFiles({name:'Synthetic.txt',mimeType:'text/plain',buffer:Buffer.from('Synthetic fixture only')});
    await page.locator('#meeting-submit').click();await page.waitForFunction(()=>document.getElementById('pitchbook-status').textContent.includes('完了しました'));
    assert.equal(calls.filter(x=>x.name==='registerMeeting').length,1);assert.equal(calls.filter(x=>x.name==='uploadPitchbookFile').length,1);assert.ok(calls.findIndex(x=>x.name==='registerMeeting')<calls.findIndex(x=>x.name==='preparePitchbookBatch'));
    assert.equal(calls.find(x=>x.name==='uploadPitchbookFile').payload.parentMeetingId,'MTG-NEW-SYNTH');
    await page.evaluate(()=>window.scrollTo(0,0));await page.screenshot({path:path.join(out,'01-registration.png'),fullPage:true});checks.push('single non-GP form / parent-first file RPC wiring');
    await page.locator('#nav-meeting-past').click();await page.locator('#meeting-past-search').click();await page.locator('[data-meeting-detail="MTG-SYNTH"]').click();
    await page.locator('[data-detail-classify="DOC-SYNTH"]').click();await page.waitForFunction(()=>document.getElementById('pitchbook-edit-documentId').value==='DOC-SYNTH');
    assert.equal(await page.locator('#pitchbook-edit-gpId').inputValue(),'');assert.equal(await page.locator('#pitchbook-edit-gpId').isDisabled(),true);
    await page.locator('#pitchbook-edit-fundStrategy').fill('Synthetic revised classification');await page.locator('#pitchbook-edit-form button[type=submit]').click();await page.waitForFunction(()=>document.getElementById('pitchbook-edit-status').textContent.includes('更新しました'));
    assert.equal(calls.find(x=>x.name==='updatePitchbookMaintenance').payload.gpId,'');assert.equal(await page.locator('#meeting-detail-body').textContent(),meetingRecord.notes);
    await page.evaluate(()=>window.scrollTo(0,0));await page.screenshot({path:path.join(out,'02-past-detail-classification.png'),fullPage:true});checks.push('single past list / detail body / non-GP classification wiring');
    await page.locator('#nav-knowledge').click();await page.locator('#knowledge-instruction').fill('');assert.equal(await page.locator('#knowledge-model-profile').inputValue(),'');
    await page.locator('#knowledge-entityKey').selectOption('LP_ASSET_OWNER:LP-SYNTH');await page.locator('#knowledge-full-output').click();await page.waitForFunction(()=>document.getElementById('knowledge-export-body-preview').textContent.includes('Synthetic Meeting-only export'));
    assert.equal(await page.locator('#knowledge-instruction').inputValue(),'');assert.equal(await page.locator('#knowledge-model-profile').inputValue(),'');assert.equal(calls.some(x=>/startKnowledge|searchKnowledge/.test(x.name)),false);
    await page.evaluate(()=>window.scrollTo(0,0));await page.screenshot({path:path.join(out,'03-independent-full-output.png'),fullPage:true});checks.push('empty question / no AI model / independent Full Output');
    for(const name of ['knowledge','meeting','meeting-past','entity-workspace','activity-analytics','masters','ai-provider-settings']){
      await page.locator('#nav-'+name).click();assert.equal(await page.locator('#page-'+name).isVisible(),true);assert.equal(await page.locator('.page.active').count(),1);assert.equal(await page.locator('.nav button.active').count(),1);
    }
    checks.push('all seven sidebar buttons switch exactly one production page');
    await page.locator('#nav-knowledge').click();
    const desktopOverflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth);assert.equal(desktopOverflow,false);
    await page.setViewportSize({width:390,height:844});await page.locator('#nav-knowledge').scrollIntoViewIfNeeded();
    for(const name of ['meeting','meeting-past','knowledge']){await page.locator('#nav-'+name).click();const narrowOverflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth);assert.equal(narrowOverflow,false,name+' must fit 390px')}
    assert.equal(await page.locator('.nav button').count(),7);await page.evaluate(()=>window.scrollTo(0,0));
    await page.screenshot({path:path.join(out,'04-narrow-390.png'),fullPage:true});checks.push('390px / register, past, knowledge / no page horizontal overflow');
    assert.deepEqual(pageErrors,[]);assert.deepEqual(consoleErrors,[]);assert.deepEqual(blockedRequests,[]);
    const evidence={classification:'SYNTHETIC_RENDER_ONLY',targetRuntimeQualification:'NOT RUN',result:'PASS',browser:await browser.version(),viewports:[[1366,900],[390,844]],checks,pageErrors,consoleErrors,blockedRequests,sourceHashes:Object.fromEntries(included),rpcNames:calls.map(x=>x.name)};
    fs.writeFileSync(path.join(out,'validation.json'),JSON.stringify(evidence,null,2)+'\n');console.log(JSON.stringify(evidence,null,2));
  }catch(error){await page.screenshot({path:path.join(out,'failed-render.png'),fullPage:true});const evidence={classification:'SYNTHETIC_RENDER_ONLY',targetRuntimeQualification:'NOT RUN',result:'FAIL',error:error.message,checks,pageErrors,consoleErrors,rpcNames:calls.map(x=>x.name)};fs.writeFileSync(path.join(out,'validation.json'),JSON.stringify(evidence,null,2)+'\n');console.error(JSON.stringify(evidence,null,2));process.exitCode=1}
  finally{await browser.close();await new Promise(resolve=>server.close(resolve))}
}
main().catch(error=>{console.error(error);server.close();process.exitCode=1});
