// Production HTML with synthetic local RPC replies. No Workspace or provider calls.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const http=require('node:http');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const {chromium}=require(process.env.KSP_PLAYWRIGHT_PATH||path.join(process.env.USERPROFILE,'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright'));
function render(name,parents=[]){assert.match(name,/^[A-Za-z0-9_-]+$/);assert.ok(!parents.includes(name));return fs.readFileSync(path.join(root,'src',name+'.html'),'utf8').replace(/<\?!=\s*include_\('([^']+)'\);?\s*\?>/g,(_,child)=>render(child,[...parents,name]))}
const html=render('Index').replace(/<\?!=\s*themeHeadMarkup\s*\?>/,'');
const entity={id:'CP-SYNTH',name:'Synthetic Entity',type:'GP',typeLabel:'GP / 運用会社',status:'Active'};
const options={counterpartyEntities:[entity],counterparties:[entity],gps:[entity],assetClasses:[{id:'AC-SYNTH',name:'Private Equity',status:'Active'}],capitalTypes:[],teams:[],locations:[],relatedPitchbooks:[],counterpartyTypes:[{code:'GP',label:'GP / 運用会社'}]};
const fixtures={
  getMeetingBootstrapData:{ok:true,options},
  getPitchbookBootstrapData:{ok:true,options,prepareRequestGeneration:1},
  getPhase1MaintenanceBootstrapData:{ok:true,options,masters:{counterparties:[entity],options:[{id:'AC-SYNTH',type:'ASSET_CLASS',name:'Private Equity',status:'Active',sortOrder:1}]}},
  getSourceRecordBootstrapData:{ok:true,options,uploadFormats:[{extension:'pdf'},{extension:'pptx'},{extension:'xlsx'},{extension:'docx'},{extension:'txt',mimeType:'text/plain',acceptedMimeTypes:['text/plain']},{extension:'eml'}],assessmentTypes:[{code:'IC_DECISION',label:'IC / 投資判断'}]},
  getKnowledgeSearchBootstrapData:{ok:true,options,providers:{OPENAI:{configured:false},GEMINI:{configured:false}},modelPolicies:{OPENAI:{profiles:[]},GEMINI:{profiles:[]}},modeDefinitions:[]},
  registerMeeting:{ok:true,meeting:{id:'MTG-SYNTH',version:1,status:'Active'}},
  preparePitchbookBatch:{ok:true,slots:[{batchId:'B-SYNTH',documentId:'DOC-SYNTH',slotFingerprint:'FP-SYNTH',originalFilename:'source.txt',parentMeetingId:'',status:'Pending'}]},
  uploadPitchbookFile:{ok:true,fileSaved:true,linkConfirmed:true,slot:{fileSaved:true,linkConfirmed:true,savedFilename:'01_source.txt',status:'Active'}}
};
const server=http.createServer((request,response)=>{response.writeHead(request.url==='/'?200:204,{'content-type':'text/html;charset=utf-8'});response.end(request.url==='/'?html:'')});
const eps=1;
async function measure(page,button,status){return page.evaluate(({button,status})=>{const rect=id=>{const r=document.getElementById(id).getBoundingClientRect();return{x:r.x,y:r.y,width:r.width,height:r.height}};return{button:rect(button),status:rect(status),scroll:scrollY,active:document.activeElement.id,overflow:Math.max(document.documentElement.scrollWidth,document.body.scrollWidth)-innerWidth}}, {button,status})}
function stable(before,after,label,{scroll=true}={}){for(const key of ['x','y','width','height']){const offset=key==='y'&&!scroll?before.scroll-after.scroll:0;assert.ok(Math.abs(before.button[key]-after.button[key]+offset)<=eps,`${label}: ${key} ${before.button[key]} -> ${after.button[key]} (scroll ${before.scroll} -> ${after.scroll})`);assert.ok(Math.abs(before.status[key]-after.status[key]+offset)<=eps,`${label}: status ${key}`)}if(scroll)assert.equal(after.scroll,before.scroll,`${label}: scroll`);assert.ok(after.overflow<=0,`${label}: horizontal overflow ${after.overflow}`)}
async function run(browser,url,width,zoom){
  const context=await browser.newContext({viewport:{width,height:900},reducedMotion:'reduce'}),page=await context.newPage(),errors=[];
  page.on('pageerror',error=>errors.push(error.message));page.on('console',message=>{if(['error','warning'].includes(message.type()))errors.push(message.text())});
  page.on('dialog',dialog=>dialog.accept());
  await page.route('**/*',route=>route.request().url().startsWith(url)?route.continue():route.abort());
  await page.addInitScript(data=>{
    window.__work0071Calls=[];
    window.google={script:{run:{withSuccessHandler(success){
      return {withFailureHandler(){
        return new Proxy({}, {get(_,name){return payload=>{
          window.__work0071Calls.push({name,payload});
          if(name==='registerMeeting'&&window.__holdMeeting){window.__resolveMeeting=()=>success(data.registerMeeting);return}
          if(name==='registerNews'&&window.__holdNews){window.__resolveNews=()=>success({ok:true,record:{id:'NEWS-SYNTH'}});return}
          if(name==='preparePitchbookBatch'&&window.__holdPrepare){window.__resolvePrepare=()=>success(data.preparePitchbookBatch);return}
          if(name==='preparePitchbookBatch'&&window.__failPrepareOnce){window.__failPrepareOnce=false;queueMicrotask(()=>success({ok:false,error:{message:'予約に失敗しました。'}}));return}
          queueMicrotask(()=>success(JSON.parse(JSON.stringify(data[name]||{ok:true}))));
        }}});
      }};
    }}}};
  },fixtures);
  await page.goto(url);await page.waitForFunction(()=>document.querySelectorAll('#news-counterpartyIds option').length>0);
  if(zoom)await page.evaluate(()=>{document.documentElement.style.zoom='2'});
  await page.locator('#nav-meeting').click();
  for(const item of [{tab:'meeting',button:'meeting-submit',status:'meeting-status'},{tab:'pitchbook',button:'standalone-pitchbook-submit',status:'standalone-pitchbook-status'},{tab:'news',button:'news-add-submit',status:'news-add-status'},{tab:'assessment',button:'assessment-add-submit',status:'assessment-add-status'}]){
    await page.locator('#source-add-tab-'+item.tab).click();
    await page.waitForTimeout(100);
    const before=await measure(page,item.button,item.status);
    for(const [kind,message] of [['info busy','保存中…'],['success','保存しました。'],['error','保存できませんでした。入力を確認して再試行してください。'],['warning','保存結果が不明です。再試行前に状態を確認してください。']]){
      await page.evaluate(({id,kind,message})=>showStatus(id,kind,message),{id:item.status,kind,message});
      stable(before,await measure(page,item.button,item.status),`${width}${zoom?'-zoom':''} ${item.tab} ${kind}`);
    }
    await page.evaluate(id=>clearStatus(id),item.status);
    stable(before,await measure(page,item.button,item.status),`${width} ${item.tab} idle`);
    if(item.tab==='meeting'||item.tab==='pitchbook'){
      await page.locator('#pitchbook-files').setInputFiles(['一件目_長い名前'.repeat(5)+'.txt','second_long_filename_'.repeat(6)+'.txt','third.txt'].map(name=>({name,mimeType:'text/plain',buffer:Buffer.from('Synthetic content')})));
      assert.equal(await page.locator('#pitchbook-file-list .file-identity-marker[aria-hidden="true"]').count(),3,'multiple file markers');
      stable(before,await measure(page,item.button,item.status),`${width} ${item.tab} three files`);
      await page.locator('#pitchbook-files').setInputFiles(Array.from({length:10},(_,i)=>({name:i===0?'Long_Latin_Filename_'.repeat(9)+'.txt':`資料${i+1}_`+'長いファイル名'.repeat(8)+'.txt',mimeType:'text/plain',buffer:Buffer.from('Synthetic content')})));
      stable(before,await measure(page,item.button,item.status),`${width} ${item.tab} ten files`);
      assert.equal(await page.locator('#pitchbook-file-list details').count(),10);
      assert.equal(await page.locator('#pitchbook-file-list .file-identity-marker[aria-hidden="true"]').count(),10,'every file has one decorative marker');
      const marker=await page.locator('#pitchbook-file-list .file-identity-marker').first().evaluate(node=>{const style=getComputedStyle(node);return{width:style.width,height:style.height,color:style.backgroundColor}});
      assert.deepEqual(marker,{width:'8px',height:'8px',color:'rgb(217, 74, 42)'},`${width} fixed vermilion marker`);
      await page.locator('#pitchbook-file-list summary').first().focus();await page.keyboard.press('Enter');
      assert.equal(await page.locator('#pitchbook-file-list details').first().getAttribute('open'),'');
      assert.match(await page.locator('#pitchbook-file-list details').first().innerText(),/元ファイル名:/);
      assert.match(await page.locator('#pitchbook-file-list summary').first().innerText(),/Long_Latin_Filename_/,'original filename remains accessible');
      if(item.tab==='pitchbook'&&width===1440&&!zoom){
        for(const state of ['Selected','Saving','Active','Failed']){
          await page.evaluate(status=>{pitchbookSlots=[{ordinal:1,originalFilename:'元ファイル名_長い資料.txt',savedFilename:status==='Active'?'01_saved.txt':'',sizeBytes:12,status,linkConfirmed:status==='Active'}];renderPitchbookFiles()},state);
          const current=await page.locator('#pitchbook-file-list .file-identity-marker').first().evaluate(node=>{const style=getComputedStyle(node);return{width:style.width,height:style.height,color:style.backgroundColor}});
          assert.deepEqual(current,marker,`${state} marker stays identity-only`);
          assert.match(await page.locator('#pitchbook-file-list summary').first().innerText(),/元ファイル名_長い資料.txt/);
          stable(before,await measure(page,item.button,item.status),`pitchbook ${state} marker geometry`);
        }
        await page.evaluate(()=>{pitchbookSlots=[];renderPitchbookFiles()});
      }
      await page.locator('#pitchbook-clear').click();
    }
    if(item.tab==='pitchbook'&&width===1440&&!zoom){
      const prepareCalls=()=>page.evaluate(()=>window.__work0071Calls.filter(call=>call.name==='preparePitchbookBatch').length);
      await page.locator('#standalone-pitchbook-submit').focus();await page.keyboard.press('Enter');
      assert.match(await page.locator('#standalone-pitchbook-status').innerText(),/ファイルを1つ以上選択してください/);
      assert.equal(await page.locator('#pitchbook-drop-zone').getAttribute('aria-invalid'),'true');
      assert.equal(await prepareCalls(),0,'no-file invalid submit must not call server');
      await page.locator('#pitchbook-files').setInputFiles({name:'source.txt',mimeType:'text/plain',buffer:Buffer.from('Synthetic content')});
      assert.equal(await page.locator('#standalone-pitchbook-status').innerText(),'','valid file clears obsolete primary error');
      assert.equal(await page.locator('#pitchbook-drop-zone').getAttribute('aria-invalid'),null);
      assert.equal(await page.locator('#pitchbook-file-list .file-identity-marker').count(),1);
      stable(before,await measure(page,item.button,item.status),'pitchbook valid file selected',{scroll:false});
      await page.evaluate(()=>{window.__holdPrepare=true});
      await page.locator('#standalone-pitchbook-submit').click();
      await page.waitForFunction(()=>Boolean(window.__resolvePrepare));
      assert.match(await page.locator('#standalone-pitchbook-status').innerText(),/資料を保存中/,'primary status is truthful while pending');
      assert.match(await page.locator('#pitchbook-status').innerText(),/資料を保存中/,'file-local status agrees with primary');
      assert.equal(await page.evaluate(()=>document.activeElement.id),'standalone-pitchbook-submit','pending focus');
      stable(before,await measure(page,item.button,item.status),'pitchbook pending',{scroll:false});
      await page.evaluate(()=>window.__resolvePrepare());
      await page.waitForFunction(()=>document.getElementById('standalone-pitchbook-status').textContent.includes('資料を保存しました'));
      assert.equal(await page.evaluate(()=>document.activeElement.id),'standalone-pitchbook-submit','success focus');
      assert.equal(await page.locator('#pitchbook-file-list .file-row').count(),0,'completed file queue clears');
      stable(before,await measure(page,item.button,item.status),'pitchbook success',{scroll:false});
      await page.locator('#pitchbook-counterpartyId').selectOption('CP-SYNTH');
      await page.locator('#pitchbook-files').setInputFiles({name:'source.txt',mimeType:'text/plain',buffer:Buffer.from('Synthetic retry content')});
      assert.equal(await page.locator('#standalone-pitchbook-status').innerText(),'','new valid selection clears prior success');
      await page.evaluate(()=>{window.__holdPrepare=false;window.__failPrepareOnce=true});
      await page.locator('#standalone-pitchbook-submit').click();
      await page.waitForFunction(()=>document.getElementById('standalone-pitchbook-status').textContent.includes('予約に失敗しました'));
      assert.equal(await page.locator('#standalone-pitchbook-status').innerText(),await page.locator('#pitchbook-status').innerText(),'primary and file-local errors agree');
      assert.equal(await page.locator('#pitchbook-file-list .file-identity-marker').count(),1,'failed upload retains file identity');
      await page.locator('#pitchbook-retry').click();
      await page.waitForFunction(()=>document.getElementById('pitchbook-status').textContent.includes('資料を保存しました'));
      assert.equal(await page.locator('#standalone-pitchbook-status').innerText(),await page.locator('#pitchbook-status').innerText(),'retry success statuses agree');
      stable(before,await measure(page,item.button,item.status),'pitchbook retry success',{scroll:false});
    }
    if(item.tab==='meeting'&&width===1440&&!zoom){
      await page.locator('#meeting-date').fill('2026-09-25');
      await page.locator('#meeting-counterpartyId').selectOption('CP-SYNTH');
      assert.ok((await page.locator('#meeting-assetClassId option').evaluateAll(options=>options.map(option=>option.value))).includes('AC-SYNTH'),'Meeting asset bootstrap');
      await page.locator('#meeting-assetClassId').selectOption('AC-SYNTH',{timeoutMs:3000});
      await page.locator('#meeting-notes').fill('Synthetic focus check');
      await page.evaluate(()=>{window.__holdMeeting=true});
      await page.locator('#meeting-submit').click();
      await page.waitForFunction(()=>Boolean(window.__resolveMeeting));
      assert.equal(await page.evaluate(()=>document.activeElement.id),'meeting-submit','Meeting pending focus');
      assert.equal(await page.locator('#meeting-submit').getAttribute('aria-disabled'),'true');
      await page.keyboard.press('Enter');
      assert.equal((await page.evaluate(()=>window.__work0071Calls)).filter(call=>call.name==='registerMeeting').length,1,'Meeting duplicate guard');
      await page.evaluate(()=>window.__resolveMeeting());
      await page.waitForFunction(()=>document.getElementById('meeting-status').textContent.includes('記録を保存しました'));
      assert.equal(await page.evaluate(()=>document.activeElement.id),'meeting-submit','Meeting success focus');
      assert.equal(await page.locator('#meeting-submit').getAttribute('aria-disabled'),null);
    }
    if(item.tab==='news'||item.tab==='assessment'){
      const dateWasBlank=!(await page.locator('#'+item.tab+'-date').inputValue());
      await page.locator('#'+item.button).focus();await page.keyboard.press('Enter');
      const firstInvalid=item.tab==='news'?'publisher':'assessmentType';
      await page.waitForTimeout(50);
      assert.equal(await page.evaluate(()=>document.activeElement.id),item.tab+'-'+(dateWasBlank?'date':firstInvalid),`${item.tab} first invalid focus`);
      if(dateWasBlank){assert.equal(await page.locator('#'+item.tab+'-date').getAttribute('aria-invalid'),'true');await page.locator('#'+item.tab+'-date').fill('2026-09-25');assert.equal(await page.locator('#'+item.tab+'-date').getAttribute('aria-invalid'),null)}
      assert.equal(await page.locator('#'+item.tab+'-'+firstInvalid).getAttribute('aria-invalid'),'true');
      assert.ok(await page.locator('#'+item.tab+'-title-error').isVisible());
      assert.equal((await page.evaluate(()=>window.__work0071Calls)).filter(call=>call.name==='register'+(item.tab==='news'?'News':'Assessment')).length,0);
      if(item.tab==='news')await page.locator('#news-publisher').fill('Synthetic Publisher');
      else await page.locator('#assessment-assessmentType').selectOption('IC_DECISION');
      assert.equal(await page.locator('#'+item.tab+'-'+firstInvalid).getAttribute('aria-invalid'),null);
      await page.locator('#'+item.tab+'-inputMode').selectOption('UPLOAD_FILE');
      await page.locator('#'+item.button).click();
      assert.ok(await page.locator('#'+item.tab+'-file-error').isVisible());
      await page.locator('#'+item.tab+'-file').setInputFiles({name:'source.txt',mimeType:'text/plain',buffer:Buffer.from('Synthetic')});
      assert.equal(await page.locator('#'+item.tab+'-file').getAttribute('aria-invalid'),null);
      await page.waitForTimeout(300);
      stable(before,await measure(page,item.button,item.status),`${width} ${item.tab} validation`,{scroll:false});
      if(item.tab==='news'&&width===1440&&!zoom){
        await page.locator('#news-inputMode').selectOption('DIRECT_TEXT');
        await page.locator('#news-date').fill('2026-09-25');
        await page.locator('#news-publisher').fill('Synthetic Publisher');
        await page.locator('#news-title').fill('Synthetic focus check');
        await page.locator('#news-counterpartyIds').selectOption('CP-SYNTH');
        await page.locator('#news-directText').fill('Synthetic direct text');
        await page.evaluate(()=>{window.__holdNews=true});
        await page.locator('#news-add-submit').click();
        await page.waitForFunction(()=>Boolean(window.__resolveNews));
        assert.equal(await page.evaluate(()=>document.activeElement.id),'news-add-submit','pending focus remains on action');
        assert.equal(await page.locator('#news-add-submit').evaluate(button=>button.disabled),false,'native focus remains available while busy');
        assert.equal(await page.locator('#news-add-submit').getAttribute('aria-disabled'),'true');
        assert.match(await page.locator('#news-add-status').innerText(),/保存中/);
        await page.keyboard.press('Enter');
        assert.equal((await page.evaluate(()=>window.__work0071Calls)).filter(call=>call.name==='registerNews').length,1,'busy guard blocks duplicate submit');
        await page.evaluate(()=>window.__resolveNews());
        await page.waitForFunction(()=>document.getElementById('news-add-status').textContent.includes('保存しました'));
        assert.equal(await page.evaluate(()=>document.activeElement.id),'news-add-submit','success focus remains on action');
        assert.equal(await page.locator('#news-add-submit').getAttribute('aria-disabled'),null);
      }
    }
    assert.ok((await measure(page,item.button,item.status)).overflow<=0,`${width} ${item.tab} overflow`);
  }
  assert.deepEqual(errors,[],`${width}${zoom?'-zoom':''} browser errors`);
  await context.close();
}
async function main(){await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));const url=`http://127.0.0.1:${server.address().port}/`;const browser=await chromium.launch({headless:true});try{for(const width of [1440,390,320])await run(browser,url,width,false);await run(browser,url,1440,true);console.log('Work0071 stable interaction browser PASS: 1440/390/320, 200% zoom, reduced motion, keyboard/detail/validation, RPC 0 on invalid submit')}finally{await browser.close();await new Promise(resolve=>server.close(resolve))}}
main().catch(error=>{console.error(error);process.exitCode=1});
