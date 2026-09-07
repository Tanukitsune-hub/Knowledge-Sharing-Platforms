// Local synthetic demo only. Existing Playwright + Chrome; no install or production services.
const {chromium}=require(process.env.KSP_PLAYWRIGHT_MODULE||'playwright');
const fs=require('node:fs/promises');
const path=require('node:path');
const assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const base='http://127.0.0.1:8772/docs/design/0028/selected-light-family/';
(async()=>{
 const browser=await chromium.launch({channel:'chrome',headless:true});
 const context=await browser.newContext({viewport:{width:1366,height:768},deviceScaleFactor:1});
 const page=await context.newPage(),logs=[],cases=[],layouts=[];
 page.on('console',m=>{if(['warning','error'].includes(m.type()))logs.push(m.text());});
 page.on('pageerror',e=>logs.push(e.message));
 await context.route('**/*',r=>new URL(r.request().url()).hostname==='127.0.0.1'?r.continue():r.abort());
 const shot=async(name,fullPage=false)=>{if(fullPage)await page.evaluate(()=>scrollTo(0,0));return page.screenshot({path:path.join(__dirname,'screenshots',name+'.png'),fullPage});};
 const read=async id=>page.locator('#'+id).innerText();
 const record=async(name,fn)=>{await fn();cases.push({case:name,result:'PASS'});};
 for(const p of JSON.parse(await fs.readFile(path.join(root,'page-manifest.json'),'utf8')).pages){
  await page.goto(base+p.file); await page.locator('main h1').waitFor();
  const m=await page.evaluate(()=>({width:innerWidth,height:innerHeight,pageOverflow:document.documentElement.scrollWidth>innerWidth,tableOverflow:[...document.querySelectorAll('.table-wrap')].filter(e=>e.getBoundingClientRect().width&&e.scrollWidth>e.clientWidth+1).length,nav:document.querySelectorAll('nav a').length,active:document.querySelectorAll('nav a.active').length}));
  assert.equal(m.pageOverflow,false);assert.equal(m.tableOverflow,0);assert.equal(m.nav,7);assert.equal(m.active,1);
  layouts.push({page:p.file,...m});await shot('current-'+p.file.replace('.html',''));
 }
 for(const pr of [46,48])for(const p of ['03-record-add-meeting','05-past-records-meeting']){
  await page.goto('http://127.0.0.1:8773/'+pr+'/docs/design/0028/selected-light-family/'+p+'.html');
  await page.locator('main h1').waitFor();await shot('baseline-pr'+pr+'-'+p);
 }
 await page.goto(base+'03-record-add-meeting.html');await shot('01-add-gp',true);
 for(const type of ['GP','LP','NLI','GROUP','CONSULTANT','OTHER']){await page.locator('#record-type').selectOption(type);assert.equal(await page.locator('#record-entity').inputValue(),type+':A');}
 cases.push({case:'six-counterparty-types',result:'PASS'});
 await page.locator('#record-type').selectOption('LP');await shot('02-add-lp',true);
 await page.getByText('検証用デモ設定（架空データ）',{exact:true}).click();
 for(const [scenario,count,retryPart] of [['parent-fail',0,''],['file-fail',1,'ファイル保存から'],['link-fail',2,'関連付けのみ']]){
  await page.getByRole('button',{name:'デモを初期化',exact:true}).click();
  await page.getByRole('button',{name:'架空の2ファイルを選択'}).click();await page.locator('#record-scenario').selectOption(scenario);
  await page.getByRole('button',{name:'登録',exact:true}).click();
  await record(scenario,async()=>{assert.match(await read('record-status'),new RegExp('ファイル登録 '+count+'件'));if(retryPart)assert.match(await read('record-results'),new RegExp(retryPart));else assert.match(await read('record-status'),/新規親作成 0件/);});
  await shot(scenario==='parent-fail'?'04-parent-failure':scenario==='file-fail'?'05-file-failure':'09-link-failure',true);
  if(retryPart){await page.getByRole('button',{name:'失敗分を再試行'}).click();await record(scenario+'-retry',async()=>{assert.match(await read('record-status'),/新規親作成 1件 \/ ファイル登録 2件/);assert.match(await read('record-results'),/DOC-DEMO-002/);});await shot(scenario==='link-fail'?'03-link-retry':'10-file-retry',true);}
 }
 await page.goto(base+'05-past-records-meeting.html?entity=LP#meeting-detail');
 const shared=()=>page.getByRole('row').filter({hasText:'共有資料.pdf'});
 const inactive=()=>page.getByRole('row').filter({hasText:'既存Inactive資料.pdf'});
 await shared().getByRole('button',{name:'削除',exact:true}).click();
 await page.getByRole('button',{name:'記録を削除',exact:true}).click();await page.getByRole('button',{name:'記録を復元',exact:true}).click();
 await record('parent-restore-shared-unlink',async()=>{assert.match(await shared().innerText(),/解除済み/);assert.match(await shared().innerText(),/1件を保持/);});
 await inactive().getByRole('button',{name:'削除',exact:true}).click();await inactive().getByRole('button',{name:'元に戻す',exact:true}).click();assert.match(await inactive().innerText(),/Inactive（既存状態）/);
 cases.push({case:'inactive-unlink-undo-not-reactivate',result:'PASS'});
 await page.getByRole('button',{name:'面談原本を開く',exact:true}).click();assert.equal(await page.locator('#original-preview').getAttribute('open'),'');
 await shared().getByRole('button',{name:'分類編集'}).click();await page.locator('#file-class-capital').selectOption('Debt');
 const before=await read('meeting-body');await page.getByRole('button',{name:'分類変更を確認'}).click();assert.equal(await read('meeting-body'),before);assert.match(await read('classification-state'),/DOC-000201.*Debt/);
 cases.push({case:'original-classification-body-preserved',result:'PASS'});
 await page.getByRole('button',{name:'資料を追加',exact:true}).click();await page.getByText('既存資料を関連付ける',{exact:true}).click();await page.getByRole('button',{name:'関連付け候補に追加'}).click();await page.getByRole('button',{name:'この記録に追加'}).click();
 assert.match(await read('record-status'),/MTG-000102 \/ 新規親作成 0件 \/ ファイル登録 0件 \/ 既存資料再利用 1件/);cases.push({case:'existing-document-reuse',result:'PASS'});await shot('08-existing-lp-document',true);
 await page.getByRole('link',{name:'編集',exact:true}).click();assert.equal(await page.locator('#record-entity').inputValue(),'LP:A');assert.match(await page.locator('main').innerText(),/MTG-000102/);await page.getByRole('link',{name:'過去の記録へ戻る',exact:true}).click();assert.equal(await read('detail-id'),'MTG-000102');cases.push({case:'lp-edit-back',result:'PASS'});
 await page.getByRole('button',{name:'資料を追加',exact:true}).click();await page.getByRole('button',{name:'架空の2ファイルを選択'}).click();await page.getByRole('button',{name:'この記録に追加'}).click();assert.match(await read('record-status'),/新規親作成 0件 \/ ファイル登録 2件/);cases.push({case:'existing-parent-followup',result:'PASS'});await shot('06-past-followup',true);
 await page.goto(base+'01-search.html');await page.locator('#search-counterparty').selectOption('LP:A');await page.locator('#search-source').selectOption('Pitchbook');await page.locator('#search-question').fill('資料の要点を確認');await page.getByRole('button',{name:'検索',exact:true}).click();assert.match(await read('search-answer'),/LP:A \/ 資料のみ/);cases.push({case:'non-gp-pitchbook',result:'PASS'});
 await page.locator('#search-question').fill('');await page.locator('#knowledge-visible-model').selectOption('');await page.getByRole('button',{name:'全文出力',exact:true}).click();assert.match(await read('export-answer'),/対象：1件/);assert.equal(await page.locator('#search-question').inputValue(),'');assert.equal(await page.locator('#knowledge-visible-model').inputValue(),'');assert.equal(await page.locator('#search-source').inputValue(),'Pitchbook');cases.push({case:'empty-question-no-ai-export-values-preserved',result:'PASS'});await shot('07-export-lp-no-ai',true);
 for(const mode of ['compare','prep']){await page.locator('#search-mode').selectOption(mode);await page.locator('#search-counterparty').selectOption('');await page.getByRole('button',{name:'全文出力',exact:true}).click();assert.match(await read('export-answer'),/対象：6件/);cases.push({case:'incomplete-'+mode+'-export',result:'PASS'});}
 await page.getByText('検証用の出力状態（架空データ）',{exact:true}).click();
 for(const [s,expected] of [['empty','対象は0件'],['limit','安全上限を超えています'],['read-fail','原本を読み出せませんでした']]){await page.locator('#export-scenario').selectOption(s);await page.getByRole('button',{name:'全文出力',exact:true}).click();assert.match(await read('export-answer'),new RegExp(expected));cases.push({case:'export-'+s,result:'PASS'});}
 await page.locator('#search-from').fill('2026-09-09');await page.locator('#search-to').fill('2026-09-08');await page.getByRole('button',{name:'全文出力',exact:true}).click();assert.match(await read('search-status'),/開始日は終了日以前/);assert.equal(await page.locator('#export-answer').isVisible(),false);cases.push({case:'date-reversal-rejected',result:'PASS'});
 await page.getByRole('button',{name:'条件をクリア'}).click();const dates=await page.locator('#search-from').inputValue();await page.locator('#all-period').check();await page.locator('#all-period').uncheck();assert.equal(await page.locator('#search-from').inputValue(),dates);
 await page.locator('#search-question').fill('保持する自由質問');await page.locator('#search-mode').selectOption('summary');assert.equal(await page.locator('#search-question').getAttribute('readonly'),'');await page.locator('#search-mode').selectOption('free');assert.equal(await page.locator('#search-question').inputValue(),'保持する自由質問');cases.push({case:'dates-fixed-prompt-draft-restored',result:'PASS'});
 await page.locator('#search-mode').selectOption('compare');await page.locator('#search-counterparty').selectOption('LP:A');await page.locator('#compare-entities').selectOption(['GP:A','GP:B']);await page.getByRole('button',{name:'検索',exact:true}).click();assert.match(await read('search-answer'),/selectedEntityKeys/);assert.doesNotMatch(await read('search-answer'),/"entityKey"/);cases.push({case:'exclusive-compare-scope',result:'PASS'});
 assert.equal(logs.length,0);
 await fs.writeFile(path.join(__dirname,'browser-results.json'),JSON.stringify({environment:'Headless Chrome / Playwright; IAB interaction evidence retained, screenshot crop fallback',viewport:'1366x768',layouts,cases,consoleWarningsErrors:logs,targetRuntime:'NOT RUN'},null,2)+'\n');
 console.log(JSON.stringify({pages:layouts.length,cases:cases.length,consoleWarningsErrors:logs.length,result:'PASS'}));await browser.close();
})().catch(e=>{console.error(e);process.exitCode=1;});
