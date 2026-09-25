// Production HTML with synthetic local RPC responses. No Google Workspace or provider calls.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const http=require('node:http');
const path=require('node:path');
const vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const playwrightPath=process.env.KSP_PLAYWRIGHT_PATH||path.join(process.env.USERPROFILE,'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const {chromium}=require(playwrightPath);
function render(name,parents=[]){assert.match(name,/^[A-Za-z0-9_-]+$/);assert.ok(!parents.includes(name));return fs.readFileSync(path.join(root,'src',name+'.html'),'utf8').replace(/<\?!=\s*include_\('([^']+)'\);?\s*\?>/g,(_,child)=>render(child,[...parents,name]))}
const html=render('Index').replace(/<\?!=\s*themeHeadMarkup\s*\?>/,'');assert.doesNotMatch(html,/<\?[!=]/);
const server=http.createServer((request,response)=>{response.writeHead(request.url==='/'?200:204,{'content-type':'text/html;charset=utf-8'});response.end(request.url==='/'?html:'')});
const options={counterpartyEntities:[{id:'CP-000001',name:'Synthetic Entity',type:'GP',typeLabel:'GP / 運用会社',status:'Active'}],assetClasses:[{id:'AC-1',name:'Private Equity',status:'Active'}],capitalTypes:[],teams:[],locations:[],relatedPitchbooks:[]};
const news={id:'NEWS-000001',newsId:'NEWS-000001',date:'2026-09-25',publisher:'Synthetic Publisher',title:'Synthetic News',url:'',counterpartyIds:['CP-000001'],counterpartyNames:['Synthetic Entity'],assetClassId:'AC-1',assetClassName:'Private Equity',fundStrategy:'Fund Alpha',inputMode:'DIRECT_TEXT',directText:'Synthetic source body',sourceUrl:'https://docs.google.com/document/d/synthetic',status:'Active',version:1};
const uploadFormats=JSON.parse(JSON.stringify(vm.runInNewContext(
  fs.readFileSync(path.join(root,'src','60_PitchbookConstants.gs'),'utf8')+'\nkspGetSourceUploadFormats_()')));
assert.deepEqual(uploadFormats.map(item=>item.extension),['pdf','pptx','xlsx','docx','txt','eml']);
const fixtures={getMeetingBootstrapData:{ok:true,options},getPitchbookBootstrapData:{ok:true,options,prepareRequestGeneration:1},getPhase1MaintenanceBootstrapData:{ok:true,options,masters:{counterparties:[{id:'CP-000001',name:'Synthetic Entity',type:'GP',status:'Active'}],options:[{id:'AC-1',name:'Private Equity',type:'ASSET_CLASS',status:'Active',sortOrder:1}]}},getSourceRecordBootstrapData:{ok:true,options,uploadFormats,assessmentTypes:[{code:'IC_DECISION',label:'IC / 投資判断'}]},getKnowledgeSearchBootstrapData:{ok:true,options,providers:{OPENAI:{configured:false},GEMINI:{configured:false}},modelPolicies:{OPENAI:{profiles:[]},GEMINI:{profiles:[]}},modeDefinitions:[{mode:'要約',inputRequired:false,instruction:'要約してください。'}]},registerNews:{ok:true,record:news},registerAssessment:{ok:true,record:{id:'ASMT-000001',assessmentId:'ASMT-000001',status:'Active',version:1}},searchNewsRecords:{ok:true,records:[news]},getNewsMaintenanceRecord:{ok:true,record:news},preparePitchbookBatch:{ok:true,slots:[{batchId:'B-1',documentId:'DOC-000001',slotFingerprint:'S-1',originalFilename:'brief.txt',parentMeetingId:'',parentVersion:0}]},uploadPitchbookFile:{ok:true,fileSaved:true,linkConfirmed:true,parentVersion:0,slot:{documentId:'DOC-000001',fileSaved:true,linkConfirmed:true}}};
async function runViewport(browser,url,width,height){
  const context=await browser.newContext({viewport:{width,height}}),page=await context.newPage(),errors=[],warnings=[],blocked=[];
  page.on('pageerror',error=>errors.push(error.message));page.on('console',message=>{if(message.type()==='error'||message.type()==='warning')warnings.push(message.text())});
  page.on('dialog',dialog=>dialog.accept());
  await page.route('**/*',route=>{if(route.request().url().startsWith(url))return route.continue();blocked.push(route.request().url());return route.abort()});
  await page.addInitScript(data=>{
    window.__sourceRpcCalls=[];
    window.__deferDeletedNews=false;
    const runner={};
    runner.withSuccessHandler=success=>({withFailureHandler:failure=>new Proxy({}, {get:(_,name)=>payload=>{
      window.__sourceRpcCalls.push({name,payload});
      if(name==='registerNews'&&window.__newsFailure==='transport'){queueMicrotask(()=>failure(new Error('synthetic transport failure')));return}
      const deleted=payload&&payload.status==='Inactive';
      if(name==='searchNewsRecords'&&deleted&&window.__deferDeletedNews){window.__resolveDeletedNews=()=>success({ok:true,records:[{...data.getNewsMaintenanceRecord.record,status:'Inactive'}]});return}
      let result=data[name]||{ok:true};
      if(name==='registerNews'&&window.__newsFailure==='expired')result={ok:false,error:{code:'SOURCE_REQUEST_EXPIRED',message:'Request expired'}};
      if(name==='registerNews'&&window.__newsFailure==='retry')result={ok:false,error:{code:'SOURCE_FILE_CONFLICT',message:'原本を確認してください。'},retry:{retryRecordId:'NEWS-000099',retryFingerprint:'stable-fingerprint'}};
      if(name==='preparePitchbookBatch'&&!payload.assetClassId)result={ok:false,error:{code:'PITCHBOOK_ASSET_CLASS_REQUIRED',message:'アセットクラスを選択してください。'}};
      if(name==='searchNewsRecords'&&deleted)result={ok:true,records:[{...data.getNewsMaintenanceRecord.record,status:'Inactive'}]};
      if(name==='searchAssessmentRecords'&&deleted)result={ok:true,records:[{id:'ASMT-000001',assessmentId:'ASMT-000001',date:'2026-09-25',title:'Synthetic Assessment',counterpartyNames:['Synthetic Entity'],assetClassName:'Private Equity',status:'Inactive',version:1}]};
      queueMicrotask(()=>success(result));
    }})});
    window.google={script:{run:runner}};
  },fixtures);
  const calls=()=>page.evaluate(()=>window.__sourceRpcCalls);
  const overflow=()=>page.evaluate(()=>Math.max(0,document.documentElement.scrollWidth-innerWidth));
  try{
    await page.goto(url);await page.waitForFunction(()=>document.querySelectorAll('#news-counterpartyIds option').length===1);
    const expectedAccept='.pdf,.pptx,.xlsx,.docx,.txt,.eml';
    await page.waitForFunction(expected=>document.getElementById('news-file').accept===expected,expectedAccept);
    for(const id of ['news-file','assessment-file','pitchbook-files'])assert.equal(await page.locator('#'+id).getAttribute('accept'),expectedAccept,id+' accept');
    for(const id of ['news-file-help','assessment-file-help','pitchbook-file-formats'])assert.match(await page.locator('#'+id).textContent(),/PDF \/ PPTX \/ XLSX \/ DOCX \/ TXT \/ EML/,id+' help');
    for(const id of ['news-publisher','news-title','assessment-title','news-past-edit-publisher','news-past-edit-title','assessment-past-edit-title'])assert.equal(await page.locator('#'+id).evaluate(node=>node.maxLength),255,id+' maxLength');
    for(const id of ['news-fundStrategy','assessment-fundStrategy','news-past-edit-fundStrategy','assessment-past-edit-fundStrategy'])assert.equal(await page.locator('#'+id).evaluate(node=>node.maxLength),500,id+' fund limit');
    assert.equal(await page.title(),'Alternative Assets Intelligence');
    await page.locator('#nav-meeting').click();assert.equal(await page.locator('#source-add-tab-meeting').getAttribute('aria-selected'),'true');
    assert.equal(await page.locator('#source-add-meeting #pitchbook-files').getAttribute('accept'),expectedAccept,'Meeting attachment accept');
    for(const type of ['meeting','pitchbook','news','assessment']){await page.locator('#source-add-tab-'+type).click();assert.equal(await page.locator('#source-add-'+type).isVisible(),true);assert.equal(await overflow(),0,'Add '+type+' overflow '+width)}
    await page.locator('#source-add-tab-news').click();await page.locator('#news-title').pressSequentially('T'.repeat(256));assert.equal((await page.locator('#news-title').inputValue()).length,255,'browser prevents 256th title character');await page.locator('#news-date').fill('2026-09-25');assert.ok((await page.locator('#news-assetClassId option').evaluateAll(items=>items.map(item=>item.value))).includes('AC-1'),'News asset options missing '+JSON.stringify({calls:await calls(),options:await page.locator('#news-assetClassId option').evaluateAll(items=>items.map(item=>item.value))}));await page.locator('#news-assetClassId').selectOption('AC-1');await page.locator('#news-fundStrategy').fill('Fund Alpha');await page.locator('#news-publisher').fill('Synthetic Publisher');await page.locator('#news-title').fill('Synthetic News');await page.locator('#news-counterpartyIds').selectOption(['CP-000001']);await page.locator('#news-directText').fill('Synthetic source body');
    await page.locator('#source-add-tab-assessment').click();assert.equal(await page.locator('#assessment-date').inputValue(),'2026-09-25');assert.equal(await page.locator('#assessment-assetClassId').inputValue(),'AC-1');assert.equal(await page.locator('#assessment-fundStrategy').inputValue(),'Fund Alpha');await page.locator('#assessment-title').fill('Unsaved Assessment');
    await page.locator('#source-add-tab-news').click();assert.equal(await page.locator('#news-title').inputValue(),'Synthetic News');await page.locator('#news-add-submit').click();await page.waitForFunction(()=>document.getElementById('news-add-status').textContent.includes('保存しました'));
    assert.equal((await calls()).filter(item=>item.name==='registerNews').length,1);assert.equal(await page.locator('#news-title').inputValue(),'');assert.equal(await page.locator('#news-date').inputValue(),'2026-09-25');await page.locator('#source-add-tab-assessment').click();assert.equal(await page.locator('#assessment-title').inputValue(),'Unsaved Assessment');
    await page.locator('#assessment-assessmentType').selectOption('IC_DECISION');await page.locator('#assessment-counterpartyIds').selectOption(['CP-000001']);await page.locator('#assessment-inputMode').selectOption('UPLOAD_FILE');await page.locator('#assessment-file').setInputFiles({name:'assessment.txt',mimeType:'text/plain',buffer:Buffer.from('Synthetic assessment')});await page.locator('#assessment-add-submit').click();await page.waitForFunction(()=>document.getElementById('assessment-add-status').textContent.includes('保存しました'));assert.equal((await calls()).filter(item=>item.name==='registerAssessment').length,1);assert.equal(await page.locator('#assessment-title').inputValue(),'');
    await page.locator('#source-add-tab-pitchbook').click();await page.locator('#pitchbook-counterpartyId').selectOption('CP-000001');await page.locator('#pitchbook-files').setInputFiles({name:'brief.txt',mimeType:'text/plain',buffer:Buffer.from('Synthetic brief')});assert.equal(await page.locator('#source-add-pitchbook #pitchbook-files').getAttribute('accept'),expectedAccept,'standalone accept');assert.equal(await page.locator('#pitchbook-assetClassId').getAttribute('required'),'');await page.locator('#pitchbook-assetClassId').selectOption('');await page.locator('#standalone-pitchbook-submit').click();assert.match(await page.locator('#standalone-pitchbook-status').textContent(),/アセットクラスを選択/);assert.equal((await calls()).filter(item=>item.name==='preparePitchbookBatch').length,0,'missing asset must block before prepare');assert.equal(await page.evaluate(()=>document.activeElement.id),'pitchbook-assetClassId');await page.locator('#pitchbook-assetClassId').selectOption('AC-1');await page.locator('#standalone-pitchbook-submit').click();await page.waitForTimeout(200);assert.match(await page.locator('#standalone-pitchbook-status').textContent(),/保存しました/,JSON.stringify({calls:await calls(),pitchbookStatus:await page.locator('#pitchbook-status').textContent(),state:await page.evaluate(()=>({pitchbookMode,pitchbookSlots,selectedPitchbookFiles:selectedPitchbookFiles.map(x=>x.name)}))}));const standaloneCalls=await calls();assert.equal(standaloneCalls.filter(item=>item.name==='preparePitchbookBatch').length,1);assert.equal(standaloneCalls.filter(item=>item.name==='uploadPitchbookFile').length,1);assert.equal(standaloneCalls.some(item=>item.name==='getMeetingMaintenanceRecord'||item.name==='updateMeetingRelations'),false);assert.equal(standaloneCalls.find(item=>item.name==='preparePitchbookBatch').payload.parentMeetingId,'');assert.equal(standaloneCalls.find(item=>item.name==='preparePitchbookBatch').payload.assetClassId,'AC-1');
    await page.locator('#nav-meeting-past').click();assert.equal(await page.locator('#page-meeting-past').isVisible(),true);for(const type of ['meeting','pitchbook','news','assessment']){await page.locator('.page.active [data-source-past-tab="'+type+'"]').click();assert.equal(await page.locator('#page-'+type+'-past').isVisible(),true);assert.equal(await overflow(),0,'Past '+type+' overflow '+width)}
    await page.locator('.page.active [data-source-past-tab="news"]').click();await page.locator('#news-past-search').click();await page.waitForFunction(()=>document.querySelectorAll('#news-past-results [data-source-detail]').length===1);await page.locator('#news-past-results [data-source-detail]').click();await page.waitForFunction(()=>document.getElementById('news-past-detail').hidden===false);assert.match(await page.locator('#news-past-detail-content').innerText(),/Synthetic source body/);
    if(width===1440){
      await page.locator('#nav-ai-provider-settings').click();await page.locator('#admin-tab-deleted').click();await page.locator('#admin-deleted-source-type').selectOption('news');
      await page.evaluate(()=>{window.__deferDeletedNews=true});await page.locator('#admin-deleted-search').click();await page.waitForFunction(()=>Boolean(window.__resolveDeletedNews));await page.locator('#admin-deleted-source-type').selectOption('assessment');await page.evaluate(()=>window.__resolveDeletedNews());await page.waitForFunction(()=>adminDeletedSearchBusy===false);assert.equal(await page.locator('#admin-deleted-results [data-admin-restore-index]').count(),0,'old News response must not render for Assessment');
      await page.locator('#admin-deleted-search').click();await page.waitForFunction(()=>document.querySelectorAll('#admin-deleted-results [data-admin-restore-index]').length===1);assert.match(await page.locator('#admin-deleted-results').innerText(),/ASMT-000001/);await page.locator('#admin-deleted-results [data-admin-restore-index]').click();await page.waitForFunction(()=>window.__sourceRpcCalls.some(item=>item.name==='changeAssessmentStatus'));const restoredAssessment=(await calls()).find(item=>item.name==='changeAssessmentStatus');assert.equal(restoredAssessment.payload.assessmentId,'ASMT-000001');
      await page.locator('#admin-deleted-source-type').selectOption('news');await page.evaluate(()=>{window.__deferDeletedNews=false});await page.locator('#admin-deleted-search').click();await page.waitForFunction(()=>document.querySelectorAll('#admin-deleted-results [data-admin-restore-index]').length===1);await page.locator('#admin-deleted-results [data-admin-restore-index]').click();await page.waitForFunction(()=>window.__sourceRpcCalls.some(item=>item.name==='changeNewsStatus'));const restoredNews=(await calls()).find(item=>item.name==='changeNewsStatus');assert.equal(restoredNews.payload.newsId,'NEWS-000001');
    }
    await page.locator('#nav-meeting').click();await page.locator('#source-add-tab-news').click();await page.locator('#news-title').fill('Tab-local unsaved');const second=await context.newPage();await second.addInitScript(data=>{window.google={script:{run:{withSuccessHandler(success){return{withFailureHandler(){return new Proxy({},{get(_,name){return()=>queueMicrotask(()=>success(data[name]||{ok:true}))}})}}}}}}},fixtures);await second.goto(url);await second.waitForFunction(()=>document.querySelectorAll('#news-counterpartyIds option').length===1);await second.locator('#nav-meeting').click();await second.locator('#source-add-tab-news').click();assert.equal(await second.locator('#news-title').inputValue(),'');assert.equal(await second.locator('#news-date').inputValue(),'');await second.close();
    await page.locator('#meeting-clear').click();assert.equal(await page.locator('#news-title').inputValue(),'');assert.equal(await page.locator('#news-date').inputValue(),'');
    const fillNewsDraft=async title=>{await page.locator('#news-date').fill('2026-09-25');await page.locator('#news-publisher').fill('Synthetic Publisher');await page.locator('#news-title').fill(title);await page.locator('#news-counterpartyIds').selectOption(['CP-000001']);await page.locator('#news-directText').fill('Same bytes')};
    await fillNewsDraft('Expiry test');
    await page.evaluate(()=>{window.__newsFailure='expired'});
    await page.locator('#news-add-submit').click();
    await page.waitForFunction(()=>document.getElementById('news-add-status').textContent.includes('Request expired'));
    const expiredRequestId=(await calls()).filter(item=>item.name==='registerNews').at(-1).payload.requestId;
    assert.match(expiredRequestId,/^t\d{13}_[A-Za-z0-9_-]{8,96}$/);
    assert.equal(await page.evaluate(()=>sourceRecordOperations.news),null,'known pre-allocation expiry retires operation');
    assert.equal(await page.evaluate(()=>sessionStorage.getItem(sourceOperationKey('news'))),null);
    await page.evaluate(()=>{window.__newsFailure=''});
    await page.locator('#news-add-submit').click();
    await page.waitForFunction(()=>document.getElementById('news-add-status').textContent.includes('保存しました'));
    const freshRequest=(await calls()).filter(item=>item.name==='registerNews').at(-1).payload;
    assert.notEqual(freshRequest.requestId,expiredRequestId,'expiry retry uses new request ID');
    assert.equal(freshRequest.retryRecordId,undefined,'unallocated expiry does not invent stable ID');
    await fillNewsDraft('Unknown outcome test');
    await page.evaluate(()=>{window.__newsFailure='transport'});
    await page.locator('#news-add-submit').click();
    await page.waitForFunction(()=>document.getElementById('news-add-status').textContent.includes('synthetic transport failure'));
    const unknownRequestId=(await calls()).filter(item=>item.name==='registerNews').at(-1).payload.requestId;
    assert.equal(await page.evaluate(()=>sourceRecordOperations.news.unknown),true);
    await page.locator('#meeting-clear').click();
    assert.equal(await page.locator('#news-title').inputValue(),'Unknown outcome test','true unknown outcome blocks global clear');
    await page.evaluate(()=>{window.__newsFailure=''});
    await page.locator('#news-add-submit').click();
    await page.waitForFunction(()=>document.getElementById('news-add-status').textContent.includes('保存しました'));
    assert.equal((await calls()).filter(item=>item.name==='registerNews').at(-1).payload.requestId,unknownRequestId,'unknown retry retains request ID');
    await fillNewsDraft('Stable retry test');
    await page.evaluate(()=>{window.__newsFailure='retry'});
    await page.locator('#news-add-submit').click();
    await page.waitForFunction(()=>document.getElementById('news-add-status').textContent.includes('原本を確認してください'));
    const retryOperation=await page.evaluate(()=>sourceRecordOperations.news);
    assert.equal(retryOperation.retryRecordId,'NEWS-000099');
    assert.equal(retryOperation.retryFingerprint,'stable-fingerprint');
    await page.evaluate(()=>{window.__newsFailure='expired'});
    await page.locator('#news-add-submit').click();
    await page.waitForFunction(()=>document.getElementById('news-add-status').textContent.includes('Request expired'));
    const rotatedRetry=await page.evaluate(()=>sourceRecordOperations.news);
    assert.notEqual(rotatedRetry.requestId,retryOperation.requestId,'expired request rotates while preserving allocated retry');
    assert.equal(rotatedRetry.retryRecordId,'NEWS-000099');
    assert.equal(rotatedRetry.retryFingerprint,'stable-fingerprint');
    await page.evaluate(()=>{window.__newsFailure=''});
    await page.locator('#news-add-submit').click();
    await page.waitForFunction(()=>document.getElementById('news-add-status').textContent.includes('保存しました'));
    const retryPayload=(await calls()).filter(item=>item.name==='registerNews').at(-1).payload;
    assert.equal(retryPayload.requestId,rotatedRetry.requestId);
    assert.equal(retryPayload.retryRecordId,'NEWS-000099');
    assert.equal(retryPayload.retryFingerprint,'stable-fingerprint');
    await page.locator('#news-title').fill('Can clear now');
    await page.locator('#meeting-clear').click();
    assert.equal(await page.locator('#news-title').inputValue(),'');
    assert.equal(await page.locator('#news-date').inputValue(),'');
    assert.deepEqual(errors,[]);assert.deepEqual(warnings,[]);assert.deepEqual(blocked,[]);
    return{viewport:width,addTabs:4,pastTabs:4,newsDirectRpc:1,assessmentUploadRpc:1,standalonePitchbookRpc:2,crossTabInputBleed:0,materialOverflowPx:0,pageErrors:errors,consoleWarnings:warnings,externalRequests:blocked};
  }finally{await context.close()}
}
async function main(){await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));const url='http://127.0.0.1:'+server.address().port+'/';const browser=await chromium.launch({channel:'chromium',headless:true});try{const evidence=[];for(const[width,height]of[[1440,1000],[390,844]])evidence.push(await runViewport(browser,url,width,height));process.stdout.write(JSON.stringify({result:'PASS',classification:'SYNTHETIC_BROWSER',evidence},null,2)+'\n')}finally{await browser.close();await new Promise(resolve=>server.close(resolve))}}
main().catch(error=>{process.stderr.write(error.stack+'\n');process.exitCode=1});
