// Local rendering only. All RPC replies below are transport fixtures, not backend implementations.
const fs=require('node:fs');
const path=require('node:path');
const http=require('node:http');
const assert=require('node:assert/strict');
const crypto=require('node:crypto');
const root=path.resolve(__dirname,'..');
const out=process.env.KSP_UI_EVIDENCE_DIR?path.resolve(process.env.KSP_UI_EVIDENCE_DIR):path.join(root,'docs/handoffs/0028-CODEX-12-ui-evidence');
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
const counterparties=[{id:'GP-SYNTH',type:'GP',name:'Synthetic GP',status:'Active'},{id:'LP-SYNTH',type:'LP_ASSET_OWNER',name:'Synthetic LP',status:'Active'}];
const gps=counterparties.filter(item=>item.type==='GP');
const masterOptions=[['ASSET_CLASS','AC-SYNTH','Private Equity'],['CAPITAL_TYPE','CAP-SYNTH','Equity'],['TEAM','TEAM-SYNTH','Synthetic team'],['LOCATION','LOC-SYNTH','Online'],['COUNTERPARTY_LP','LP-SYNTH','Synthetic LP']].map(([type,id,name])=>({type,id,name,status:'Active',sortOrder:1}));
const options={gps,assetClasses:[masterOptions[0]],capitalTypes:[masterOptions[1]],teams:[masterOptions[2]],locations:[masterOptions[3]],counterpartyTypes:types,counterpartyEntities:counterparties,relatedPitchbooks:[]};
const documentRecord={documentId:'DOC-SYNTH',parentMeetingId:'MTG-SYNTH',counterpartyType:'LP_ASSET_OWNER',counterpartyId:'LP-SYNTH',counterpartyEntityName:'Synthetic LP',date:'2026-09-08',gpId:'',assetClassId:'AC-SYNTH',capitalTypeId:'CAP-SYNTH',fundStrategy:'Synthetic strategy',fileId:'FILE-SYNTH',fileUrl:'',status:'Active',updatedAt:'2026-09-08T00:00:00.000Z',savedFilename:'Synthetic LP — overview.txt'};
const meetingRecord={meetingId:'MTG-SYNTH',version:1,status:'Active',date:'2026-09-08',time:'10:00',locationId:'LOC-SYNTH',locationName:'Online',counterpartyType:'LP_ASSET_OWNER',counterpartyId:'LP-SYNTH',counterpartyEntityName:'Synthetic LP',relatedGpIds:[],relatedGpNames:[],assetClassId:'AC-SYNTH',assetClassName:'Private Equity',capitalTypeId:'CAP-SYNTH',capitalTypeName:'Equity',teamId:'TEAM-SYNTH',teamName:'Synthetic team',fundStrategy:'Synthetic strategy',meetingTypeCodes:['ANNUAL_REVIEW'],meetingTypeLabels:['定例年1回'],followUpRequired:true,followUpNote:'Synthetic follow-up',counterparty:'Synthetic participant',internalParticipants:'Synthetic team',notes:'Synthetic meeting notes.\nThis is a transport fixture for local rendering only.',documentUrl:'',relatedPitchbookIds:['DOC-SYNTH'],relatedPitchbooks:[{id:'DOC-SYNTH',title:documentRecord.savedFilename,status:'Active',date:'2026-09-08'}]};
const entityWorkspaceData={ok:true,entity:{entityKey:'LP_ASSET_OWNER:LP-SYNTH',counterpartyType:'LP_ASSET_OWNER',counterpartyTypeLabel:'LP / Asset Owner',counterpartyId:'LP-SYNTH',name:'Synthetic LP',status:'Active'},summary:{meetingCount:2,activeMeetingCount:1,pitchbookCount:2,pitchbookActiveCount:1,openFollowUpCount:1,relationshipCount:1,latestActivityDate:'2026-09-08'},meetings:{all:{records:[meetingRecord],omittedCount:0},direct:{records:[meetingRecord],omittedCount:0},related:{records:[],omittedCount:0}},pitchbooks:{records:[documentRecord],omittedCount:0},fundStrategies:{records:[{text:'Synthetic strategy',meetingCount:1,pitchbookCount:1,directMeetingCount:1,relatedMeetingCount:0,latestDate:'2026-09-08',openFollowUpCount:1,relationshipCount:1}],omittedCount:0},followUps:{records:[meetingRecord],omittedCount:0},mixes:{teams:[],assetClasses:[],meetingTypes:[]},relationships:[],timeline:{records:[],omittedCount:0},drillDown:null,omittedCounts:{directMeetings:0,relatedMeetings:0,pitchbooks:0,fundStrategies:0,followUps:0,relationships:0,timeline:0}};
const fixtures={
  getMeetingBootstrapData:{ok:true,options},getPitchbookBootstrapData:{ok:true,options,prepareRequestGeneration:1},
  getPhase1MaintenanceBootstrapData:{ok:true,options,masters:{counterparties,options:masterOptions}},
  getKnowledgeSearchBootstrapData:{ok:true,providers:{OPENAI:{configured:false},GEMINI:{configured:false}},modelPolicies:{OPENAI:{profiles:[]},GEMINI:{profiles:[]}},modeDefinitions:[{mode:'自由質問',inputRequired:true},{mode:'比較',inputRequired:false},{mode:'面談準備',targetRequired:true}],options:{...options,counterpartyTypes:types.map(x=>({id:x.code,name:x.label})),counterpartyEntities:[{id:'LP_ASSET_OWNER:LP-SYNTH',type:'LP_ASSET_OWNER',name:'Synthetic LP'}]}},
  registerMeeting:{ok:true,meeting:{id:'MTG-NEW-SYNTH',version:1,status:'Active',documentUrl:''}},
  preparePitchbookBatch:{ok:true,slots:[{documentId:'DOC-NEW-SYNTH',batchId:'BATCH-SYNTH',slotFingerprint:'fixture-fingerprint',originalFilename:'Synthetic.txt',parentMeetingId:'MTG-NEW-SYNTH',parentVersion:1,status:'Pending'}]},
  uploadPitchbookFile:{ok:true,fileSaved:true,linkConfirmed:true,parentVersion:2,slot:{documentId:'DOC-NEW-SYNTH',parentMeetingId:'MTG-NEW-SYNTH',parentVersion:2,status:'Active'}},
  searchMeetingRecords:{ok:true,records:[meetingRecord]},
  getPitchbookMaintenanceRecord:{ok:true,record:documentRecord},
  updatePitchbookMaintenance:{ok:true,record:{...documentRecord,fundStrategy:'Synthetic revised classification'}},
  previewKnowledgeExport:{ok:true,preview:{mode:'全文出力',scopeSummary:'Synthetic LP / Meeting-only',meetingCount:1,meetingCharacterCount:95,sourceIdCount:1,sourceIds:['MTG-SYNTH'],packageText:'Synthetic Meeting-only export\nCounterparty: Synthetic LP\nDate: 2026-09-08\nSynthetic meeting notes.',hardStop:false,noResults:false}},
  getAiProviderAdminData:{ok:false,error:{message:'Synthetic locked administrator surface'}},
  getEntityWorkspaceData:{ok:true,entityTypes:types.map(item=>({code:item.code,label:item.label,entityCount:1})),entityOptions:counterparties.map(item=>({entityKey:item.type+':'+item.id,type:item.type,id:item.id,name:item.name,status:item.status}))},
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
    let response=request.name==='getMeetingMaintenanceRecord'?{ok:true,record:request.payload==='MTG-NEW-SYNTH'?{...meetingRecord,meetingId:'MTG-NEW-SYNTH',relatedPitchbookIds:[],relatedPitchbooks:[]}:meetingRecord}:request.name==='getEntityWorkspaceData'&&request.payload&&request.payload.entityKey?entityWorkspaceData:fixtures[request.name];
    if(!response){res.writeHead(500,{'content-type':'application/json'});res.end(JSON.stringify({error:'Unexpected fixture RPC: '+request.name}));return}
    res.writeHead(200,{'content-type':'application/json'});res.end(JSON.stringify(response));return;
  }
  if(req.url==='/'){res.writeHead(200,{'content-type':'text/html;charset=utf-8'});res.end(html);return}
  res.writeHead(204);res.end();
});
async function captureMeetingLayout(page,width,height,label,out){
  await page.setViewportSize({width,height});
  await page.locator('#nav-meeting').click();
  const evidence=await page.evaluate(()=>{
    const wrapper=id=>id==='meeting-types'||id==='attachment-section'?document.getElementById(id):document.getElementById(id).closest('.field');
    const ids=['meeting-date','meeting-time','meeting-locationId','meeting-teamId','meeting-assetClassId','meeting-types','meeting-counterpartyId','meeting-fundStrategy','meeting-counterparty','meeting-internalParticipants','attachment-section','meeting-notes'];
    const placements=Object.fromEntries(ids.map(id=>{const node=wrapper(id),style=getComputedStyle(node),rect=node.getBoundingClientRect();return[id,{columnStart:style.gridColumnStart,columnEnd:style.gridColumnEnd,rowStart:style.gridRowStart,x:rect.x,y:rect.y,width:rect.width,height:rect.height}]}));
    const grid=document.querySelector('#meeting-form>.grid'),gridStyle=getComputedStyle(grid),pageRect=document.getElementById('page-meeting').getBoundingClientRect();
    const capital=document.getElementById('meeting-capitalTypeId'),capitalRect=capital.getBoundingClientRect();
    const sidebarNode=document.querySelector('.page-header'),sidebar=getComputedStyle(sidebarNode),active=getComputedStyle(document.querySelector('.nav button.active')),icon=getComputedStyle(document.querySelector('.nav button.active .nav-icon')),motif=getComputedStyle(document.querySelector('.sidebar-motif'));
    return{placements,gridColumns:gridStyle.gridTemplateColumns.split(' ').length,columnGap:gridStyle.columnGap,rowGap:gridStyle.rowGap,pageWidth:pageRect.width,notesHeight:document.getElementById('meeting-notes').getBoundingClientRect().height,capital:{display:getComputedStyle(capital.closest('.field')).display,width:capitalRect.width,height:capitalRect.height},overflow:document.documentElement.scrollWidth>innerWidth,sidebar:{backgroundImage:sidebar.backgroundImage,borderRightColor:sidebar.borderRightColor,activeBackground:active.backgroundImage,activeShadow:active.boxShadow,iconFilter:icon.filter,motifDisplay:motif.display,motifOpacity:motif.opacity,clientWidth:sidebarNode.clientWidth,scrollWidth:sidebarNode.scrollWidth}};
  });
  assert.equal(evidence.overflow,false,label+' overflow');
  if(width>720){
    assert.equal(evidence.gridColumns,12,label+' columns');assert.equal(evidence.columnGap,'14px');assert.equal(evidence.rowGap,'14px');assert.ok(evidence.pageWidth<=2000.5,label+' max width');
    const expected={'meeting-date':['1','span 2','1'],'meeting-time':['3','span 1','1'],'meeting-locationId':['4','span 2','1'],'meeting-teamId':['6','span 2','1'],'meeting-assetClassId':['8','span 2','1'],'meeting-types':['1','span 12','2'],'meeting-counterpartyId':['1','span 6','3'],'meeting-fundStrategy':['7','span 4','3'],'meeting-counterparty':['1','span 6','4'],'meeting-internalParticipants':['1','span 6','5'],'attachment-section':['1','span 12','6'],'meeting-notes':['1','span 12','7']};
    for(const[id,placement]of Object.entries(expected))assert.deepEqual([evidence.placements[id].columnStart,evidence.placements[id].columnEnd,evidence.placements[id].rowStart],placement,label+' '+id);
    assert.equal(evidence.sidebar.motifDisplay,'block');assert.equal(evidence.sidebar.motifOpacity,'0.72');assert.notEqual(evidence.sidebar.activeShadow,'none');assert.notEqual(evidence.sidebar.iconFilter,'none');assert.ok(evidence.sidebar.scrollWidth<=evidence.sidebar.clientWidth+1,label+' sidebar horizontal overflow');
  }else{
    assert.equal(evidence.gridColumns,1,label+' columns');for(const placement of Object.values(evidence.placements))assert.equal(placement.columnStart,'1');assert.equal(evidence.sidebar.motifDisplay,'none');
  }
  assert.deepEqual(evidence.capital,{display:'none',width:0,height:0});assert.ok(evidence.notesHeight>=480,label+' notes height');
  await page.evaluate(()=>window.scrollTo(0,0));await page.screenshot({path:path.join(out,'layout-'+label+'.png'),fullPage:false});
  return evidence;
}
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
    const layoutEvidence=[];for(const viewport of [[2560,1100,'wide-2560'],[1440,1000,'laptop-1440'],[1280,900,'compact-1280'],[390,844,'mobile-390']])layoutEvidence.push(await captureMeetingLayout(page,viewport[0],viewport[1],viewport[2],out));checks.push('Work 0033 candidate topology / 2560, 1440, 1280, 390');
    await page.setViewportSize({width:1366,height:900});await page.locator('#nav-meeting').click();
    const counterpartyOptions=await page.locator('#meeting-counterpartyId option').evaluateAll(options=>options.map(option=>({value:option.value,text:option.textContent})));const counterpartyCatalog=await page.evaluate(()=>meetingCounterpartyEntities);const syntheticCounterparty=counterpartyOptions.find(option=>option.value)?.value;assert.ok(syntheticCounterparty,'synthetic counterparty option: '+JSON.stringify({counterpartyOptions,counterpartyCatalog}));
    await page.locator('#meeting-date').fill('2026-09-08');await page.locator('#meeting-counterpartyId').selectOption(syntheticCounterparty);await page.locator('#meeting-assetClassId').selectOption('AC-SYNTH');await page.locator('#meeting-notes').fill('Synthetic local-render registration.');
    await page.locator('#pitchbook-files').setInputFiles({name:'Synthetic.txt',mimeType:'text/plain',buffer:Buffer.from('Synthetic fixture only')});
    await page.locator('#meeting-submit').click();await page.waitForFunction(()=>document.getElementById('pitchbook-status').textContent.includes('完了しました'));
    assert.equal(calls.filter(x=>x.name==='registerMeeting').length,1);assert.equal(calls.filter(x=>x.name==='uploadPitchbookFile').length,1);assert.ok(calls.findIndex(x=>x.name==='registerMeeting')<calls.findIndex(x=>x.name==='preparePitchbookBatch'));
    assert.equal(calls.find(x=>x.name==='uploadPitchbookFile').payload.parentMeetingId,'MTG-NEW-SYNTH');
    await page.evaluate(()=>window.scrollTo(0,0));await page.screenshot({path:path.join(out,'01-registration.png'),fullPage:true});checks.push('single non-GP form / parent-first file RPC wiring');
    await page.locator('#nav-meeting-past').click();await page.locator('#meeting-past-search').click();await page.locator('[data-meeting-detail="MTG-SYNTH"]').click();
    await page.locator('[data-detail-classify="DOC-SYNTH"]').click();await page.waitForFunction(()=>document.getElementById('pitchbook-edit-documentId').value==='DOC-SYNTH');
    assert.equal(await page.locator('#pitchbook-edit-counterpartyId').inputValue(),'LP-SYNTH');
    await page.locator('#pitchbook-edit-fundStrategy').fill('Synthetic revised classification');await page.locator('#pitchbook-edit-form button[type=submit]').click();await page.waitForFunction(()=>document.getElementById('pitchbook-edit-status').textContent.includes('更新しました'));
    assert.equal(calls.find(x=>x.name==='updatePitchbookMaintenance').payload.counterpartyId,'LP-SYNTH');assert.equal(await page.locator('#meeting-detail-body').textContent(),meetingRecord.notes);
    await page.evaluate(()=>window.scrollTo(0,0));await page.screenshot({path:path.join(out,'02-past-detail-classification.png'),fullPage:true});checks.push('single past list / detail body / non-GP classification wiring');
    await page.locator('#nav-meeting-past').click();
    assert.equal(await page.locator('#meeting-past-capitalTypeId').isVisible(),false);assert.equal(await page.locator('#meeting-past-followUpOnly').isVisible(),false);assert.equal(await page.locator('[data-meeting-type-filter="meeting-past"]').count(),3);
    const pastLayout=await page.evaluate(()=>{const read=id=>{const node=document.querySelector(id),style=getComputedStyle(node);return{columnStart:style.gridColumnStart,columnEnd:style.gridColumnEnd,rowStart:style.gridRowStart}};return{columns:getComputedStyle(document.querySelector('.meeting-past-filter-grid')).gridTemplateColumns.split(' ').length,dateFrom:read('.meeting-past-date-from-field'),dateTo:read('.meeting-past-date-to-field'),counterparty:read('.meeting-past-counterparty-field'),asset:read('.meeting-past-asset-field'),team:read('.meeting-past-team-field'),fund:read('.meeting-past-fund-field'),types:read('.meeting-past-types-field'),status:read('.meeting-past-status-field')}});
    assert.equal(pastLayout.columns,12);assert.deepEqual(pastLayout.dateFrom,{columnStart:'1',columnEnd:'span 2',rowStart:'1'});assert.deepEqual(pastLayout.dateTo,{columnStart:'3',columnEnd:'span 2',rowStart:'1'});assert.deepEqual(pastLayout.counterparty,{columnStart:'5',columnEnd:'span 4',rowStart:'1'});assert.deepEqual(pastLayout.asset,{columnStart:'9',columnEnd:'span 2',rowStart:'1'});assert.deepEqual(pastLayout.team,{columnStart:'11',columnEnd:'span 2',rowStart:'1'});assert.deepEqual(pastLayout.fund,{columnStart:'1',columnEnd:'span 6',rowStart:'2'});assert.deepEqual(pastLayout.types,{columnStart:'7',columnEnd:'span 6',rowStart:'2'});assert.deepEqual(pastLayout.status,{columnStart:'1',columnEnd:'span 2',rowStart:'3'});
    const beforeFilterCalls=calls.filter(call=>call.name==='searchMeetingRecords').length;await page.locator('#meeting-past-search').click();await page.locator('[data-meeting-type-filter="meeting-past"]').nth(0).check();await page.locator('#meeting-past-search').click();await page.locator('[data-meeting-type-filter="meeting-past"]').nth(1).check();await page.locator('#meeting-past-search').click();const filterCalls=calls.filter(call=>call.name==='searchMeetingRecords').slice(beforeFilterCalls);assert.deepEqual(filterCalls.map(call=>call.payload.meetingTypeCodes),[[],['ANNUAL_REVIEW'],['ANNUAL_REVIEW','OFFICE_VISIT']]);assert.deepEqual(filterCalls.map(call=>call.payload.meetingTypeCode),['','ANNUAL_REVIEW','']);assert.deepEqual(filterCalls.map(call=>[call.payload.capitalTypeId,call.payload.followUpOnly]),[['',false],['',false],['',false]]);checks.push('Past Meetings 12-column layout / hidden legacy filters / none-single-multi OR payload');
    await page.locator('#nav-entity-workspace').click();await page.waitForFunction(()=>document.querySelectorAll('#entity-workspace-entity option').length>1);assert.equal(await page.locator('#entity-workspace-type').count(),0);await page.locator('#entity-workspace-entity').selectOption('LP_ASSET_OWNER:LP-SYNTH');await page.waitForFunction(()=>document.getElementById('entity-workspace-name').textContent==='Synthetic LP');assert.equal(await page.locator('#entity-workspace-identity').textContent(),'LP-SYNTH');const summaryText=await page.locator('#entity-workspace-summary').innerText();assert.match(summaryText,/Meetings\s+1件/);assert.match(summaryText,/Pitchbooks\s+1件/);assert.doesNotMatch(summaryText,/Active|LP \/ Asset Owner/);checks.push('Counterparty Summary one selector / active count-only cards / no type identity');
    await page.locator('#nav-knowledge').click();await page.locator('#knowledge-instruction').fill('');assert.equal(await page.locator('#knowledge-model-profile').inputValue(),'');
    await page.locator('#knowledge-entityKey').selectOption('LP_ASSET_OWNER:LP-SYNTH');await page.locator('#knowledge-full-output').click();await page.waitForFunction(()=>document.getElementById('knowledge-export-body-preview').textContent.includes('Synthetic Meeting-only export'));
    assert.equal(await page.locator('#knowledge-instruction').inputValue(),'');assert.equal(await page.locator('#knowledge-model-profile').inputValue(),'');assert.equal(calls.some(x=>/startKnowledge|searchKnowledge/.test(x.name)),false);
    await page.evaluate(()=>window.scrollTo(0,0));await page.screenshot({path:path.join(out,'03-independent-full-output.png'),fullPage:true});checks.push('empty question / no AI model / independent Full Output');
    for(const name of ['knowledge','meeting','meeting-past','entity-workspace','activity-analytics','masters','ai-provider-settings']){
      await page.locator('#nav-'+name).click();assert.equal(await page.locator('#page-'+name).isVisible(),true);assert.equal(await page.locator('.page.active').count(),1);assert.equal(await page.locator('.nav button.active').count(),1);const bounds=await page.locator('#page-'+name).evaluate(node=>{const rect=node.getBoundingClientRect();return{width:rect.width,left:rect.left}});assert.ok(bounds.width<=2000.5,name+' max width');assert.ok(bounds.left>=0,name+' left aligned');
    }
    checks.push('all seven sidebar buttons switch exactly one production page');
    await page.locator('#nav-knowledge').click();
    const desktopOverflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth);assert.equal(desktopOverflow,false);
    await page.setViewportSize({width:390,height:844});await page.locator('#nav-knowledge').scrollIntoViewIfNeeded();
    for(const name of ['meeting','meeting-past','knowledge']){await page.locator('#nav-'+name).click();const narrowOverflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth);assert.equal(narrowOverflow,false,name+' must fit 390px')}
    assert.equal(await page.locator('.nav button').count(),7);await page.evaluate(()=>window.scrollTo(0,0));
    await page.screenshot({path:path.join(out,'04-narrow-390.png'),fullPage:true});checks.push('390px / register, past, knowledge / no page horizontal overflow');
    assert.deepEqual(pageErrors,[]);assert.deepEqual(consoleErrors,[]);assert.deepEqual(blockedRequests,[]);
    const evidence={classification:'SYNTHETIC_RENDER_ONLY',targetRuntimeQualification:'NOT RUN',result:'PASS',browser:await browser.version(),viewports:[[2560,1100],[1440,1000],[1280,900],[1366,900],[390,844]],checks,layoutEvidence,pageErrors,consoleErrors,blockedRequests,sourceHashes:Object.fromEntries(included),rpcNames:calls.map(x=>x.name)};
    fs.writeFileSync(path.join(out,'validation.json'),JSON.stringify(evidence,null,2)+'\n');console.log(JSON.stringify(evidence,null,2));
  }catch(error){await page.screenshot({path:path.join(out,'failed-render.png'),fullPage:true});const evidence={classification:'SYNTHETIC_RENDER_ONLY',targetRuntimeQualification:'NOT RUN',result:'FAIL',error:error.message,checks,pageErrors,consoleErrors,rpcNames:calls.map(x=>x.name)};fs.writeFileSync(path.join(out,'validation.json'),JSON.stringify(evidence,null,2)+'\n');console.error(JSON.stringify(evidence,null,2));process.exitCode=1}
  finally{await browser.close();await new Promise(resolve=>server.close(resolve))}
}
main().catch(error=>{console.error(error);server.close();process.exitCode=1});
