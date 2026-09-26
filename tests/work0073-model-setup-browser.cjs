// Synthetic browser check of the production AI admin markup and client script. No Apps Script or provider calls.
const fs=require('node:fs');
const path=require('node:path');
const http=require('node:http');
const os=require('node:os');
const assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const playwrightPath=process.env.KSP_PLAYWRIGHT_PATH||path.join(process.env.USERPROFILE,
  '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const {chromium}=require(playwrightPath);
const source=name=>fs.readFileSync(path.join(root,'src',name),'utf8');
const shim=`<script>
window.__serverState={ok:true,canMutate:true,credentialOperator:true,
  openai:{keyConfigured:false,vectorStoreReady:false,enabled:false,status:'UNCONFIGURED'},
  gemini:{keyConfigured:false,storeReady:false,enabled:false,status:'UNCONFIGURED'},modelPolicy:{profiles:[]}};
window.__calls=[];window.__unknown=false;window.__failList=false;window.__failAdminLoad=false;
function showStatus(id,kind,message){const node=document.getElementById(id);node.textContent=message;node.className='status visible '+kind}
function clearStatus(id){const node=document.getElementById(id);node.textContent='';node.className='status'}
function kspSetRegionBusy(node,busy){node.setAttribute('aria-busy',String(busy))}
function kspSetActionBusy(node,busy){node.disabled=busy}
window.confirm=()=>true;
async function serverCall(name,payload){
  window.__calls.push({name,payload:payload&&payload.apiKey?{...payload,apiKey:'REDACTED'}:payload});
  if(name==='getAiProviderAdminData'){
    if(window.__failAdminLoad)throw Error('synthetic admin read failure');
    return window.__serverState;
  }
  if(name==='getAiCredentialModelCandidates'||name==='getAiModelSetupCandidates'){
    if(window.__failList)throw Error('synthetic list failure');
    return {ok:true,models:[{modelId:'gpt-synthetic-list',displayName:'Synthetic model'}],
      fetchedAt:'2026-09-26T00:00:00Z',partial:false,cached:false};
  }
  if(name==='saveAiCredentialSetup'||name==='saveAiModelSetup'){
    if(window.__unknown)throw Error('synthetic response loss');
    const suffix=payload.provider.toLowerCase();
    window.__serverState[suffix].keyConfigured=true;
    if(payload.makeDefault===false){
      const profileId=payload.profileId||'synthetic-expert-variant';
      window.__serverState.modelPolicy.profiles=window.__serverState.modelPolicy.profiles.filter(item=>item.profileId!==profileId);
      window.__serverState.modelPolicy.profiles.push({profileId,provider:payload.provider,modelId:payload.modelId,
        displayName:payload.displayName,isProviderDefault:false,qualification:'QUALIFIED'});
    }else{
      window.__serverState.modelPolicy.profiles=window.__serverState.modelPolicy.profiles.filter(item=>item.provider!==payload.provider);
      window.__serverState.modelPolicy.profiles.push({provider:payload.provider,modelId:payload.modelId,
        isProviderDefault:true,qualification:'QUALIFIED'});
    }
    return {ok:true,status:'SAVED',provider:payload.provider,modelId:payload.modelId};
  }
  if(name==='getAiModelSetupOperation')return {ok:true,status:'UNKNOWN'};
  if(name==='getAiSyncCandidates')return {ok:true,records:[
    {sourceType:'Meeting',sourceId:'MTG-000001',label:'面談メモ / 2026-09-26 / Synthetic A / MTG-000001',syncStatus:'NotIndexed'},
    {sourceType:'Pitchbook',sourceId:'DOC-000001',label:'保存資料 / 2026-09-26 / Synthetic P / DOC-000001',syncStatus:'NotIndexed'},
    {sourceType:'News',sourceId:'NEWS-000001',label:'ニュース / 2026-09-26 / Synthetic N / NEWS-000001',syncStatus:'NotIndexed'},
    {sourceType:'Internal Assessment',sourceId:'ASMT-000001',label:'評価 / 2026-09-26 / Synthetic I / ASMT-000001',syncStatus:'NotIndexed'}]};
  if(name==='mutateAiProviderSettings')return {ok:true,sync:{selected:1,indexed:1,remaining:3,batchComplete:false}};
  return {ok:true};
}
</script>`;
const html='<!doctype html><html lang="ja"><head><meta charset="utf-8"><title>Work0073 synthetic AI settings</title>'+
  source('Styles.html')+'<style>.page{display:block}.app-shell{max-width:1120px}</style></head><body><button id="nav-ai-provider-settings" hidden></button><main class="app-shell">'+
  source('AiProviderSettingsPage.html')+'</main>'+shim+source('ClientAiProviderSettings.html')+source('ClientAiModelSetup.html')+
  '<script>loadAiProviderAdminData()</script></body></html>';
const server=http.createServer((req,res)=>{res.writeHead(200,{'content-type':'text/html;charset=utf-8'});res.end(html)});
async function main(){
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const url='http://127.0.0.1:'+server.address().port+'/';
  const browser=await chromium.launch({channel:'chromium',headless:true});
  const evidenceDir=path.join(os.tmpdir(),'ksp-work0073-model-setup-browser');
  fs.mkdirSync(evidenceDir,{recursive:true});
  const findings=[];
  try{
    for(const [width,height,label] of [[1440,900,'desktop'],[390,844,'mobile']]){
      const page=await browser.newPage({viewport:{width,height}});
      const errors=[];page.on('pageerror',error=>errors.push(error.message));
      page.on('console',message=>{if(message.type()==='error')errors.push(message.text())});
      await page.goto(url);
      assert.equal(await page.title(),'Work0073 synthetic AI settings');
      await page.waitForFunction(()=>document.getElementById('ai-setup-openai-state').textContent==='未設定');
      assert.equal(await page.locator('#ai-setup-openai-state').textContent(),'未設定');
      await page.locator('#ai-setup-openai-key-button').click();
      assert.equal(await page.locator('#ai-setup-key').isVisible(),true);
      await page.locator('#ai-setup-key').fill('synthetic-secret');
      await page.locator('#ai-setup-refresh').click();
      await page.waitForFunction(()=>document.getElementById('ai-setup-candidate').options.length===2);
      await page.locator('#ai-setup-candidate').selectOption('gpt-synthetic-list');
      await page.locator('#ai-setup-save').click();
      await page.waitForFunction(()=>document.getElementById('ai-setup-openai-model').textContent.includes('gpt-synthetic-list'));
      assert.equal(await page.locator('#ai-setup-key').inputValue(),'');
      assert.match(await page.locator('#ai-setup-result').textContent(),/保存しました/);
      await page.locator('#ai-setup-cancel').click();
      assert.equal(await page.locator('#ai-setup-openai-model-button').evaluate(node=>node===document.activeElement),true);
      await page.keyboard.press('Enter');
      await page.evaluate(()=>window.__failList=true);
      await page.locator('#ai-setup-refresh').click();
      await page.waitForFunction(()=>document.getElementById('ai-setup-candidate-status').textContent.includes('取得できません'));
      await page.locator('#ai-setup-model-id').fill('gpt-manual-unlisted');
      await page.locator('#ai-setup-save').click();
      await page.waitForFunction(()=>document.getElementById('ai-setup-openai-model').textContent.includes('gpt-manual-unlisted'));
      await page.locator('#ai-setup-cancel').click();
      await page.locator('#ai-setup-openai-model-button').click();
      await page.locator('#ai-setup-advanced summary').click();
      await page.locator('#ai-setup-profile-target').selectOption('new-variant');
      await page.locator('#ai-setup-model-id').fill('gpt-expert-synthetic');
      await page.locator('#ai-setup-profile-label').fill('合成の設定違い');
      await page.locator('#ai-setup-save').click();
      await page.waitForFunction(()=>window.__calls.some(item=>item.name==='saveAiModelSetup'&&item.payload.makeDefault===false));
      assert.equal(await page.locator('#ai-setup-openai-model').textContent(),'現在のモデル: gpt-manual-unlisted');
      await page.locator('#ai-setup-cancel').click();
      await page.evaluate(async()=>{window.__failAdminLoad=true;await loadAiProviderAdminData(false)});
      assert.match(await page.locator('#ai-setup-openai-state').textContent(),/前回取得時点/);
      assert.equal(await page.locator('#ai-setup-openai-key-button').isDisabled(),true);
      await page.evaluate(async()=>{window.__failAdminLoad=false;await loadAiProviderAdminData(false)});
      await page.locator('#ai-setup-openai-model-button').click();
      await page.locator('#ai-setup-model-id').fill('gpt-unknown-result');
      await page.evaluate(()=>window.__unknown=true);
      await page.locator('#ai-setup-save').click();
      await page.waitForFunction(()=>document.getElementById('ai-setup-result').textContent.includes('結果が不明'));
      assert.equal(await page.locator('#ai-setup-save').isDisabled(),true);
      await page.locator('#ai-setup-cancel').click();
      await page.locator('#ai-setup-sync-load').click();
      await page.waitForFunction(()=>document.getElementById('ai-setup-sync-source').options.length===5);
      await page.locator('#ai-setup-sync-type').selectOption('News');
      assert.equal(await page.locator('#ai-setup-sync-source option').count(),2);
      assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
      assert.deepEqual(errors,[]);
      await page.screenshot({path:path.join(evidenceDir,label+'.png'),fullPage:false});
      findings.push({viewport:[width,height],page:url,overflow:false,consoleErrors:errors,
        savedModels:['gpt-synthetic-list','gpt-manual-unlisted'],unknownResultNoRetry:true,
        fourSourceCandidates:true,expertVariantSameSave:true,staleReadDeniedSecretAction:true,
        screenshot:path.join(evidenceDir,label+'.png')});
      await page.close();
    }
    process.stdout.write(JSON.stringify({classification:'SYNTHETIC_BROWSER_RENDER',result:'PASS',findings},null,2)+'\n');
  }finally{await browser.close();await new Promise(resolve=>server.close(resolve))}
}
main().catch(error=>{console.error(error);process.exitCode=1});
