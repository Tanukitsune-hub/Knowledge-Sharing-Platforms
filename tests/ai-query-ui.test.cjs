const { test, assert, fs, path, vm, ksp, plain, baseContext, createSyncEnvironment } = require('./ai-test-helpers.cjs');
test('free question maps citations and audits only safe query metadata',()=>{
  const env=createSyncEnvironment({queryResponse:{id:'interaction-1',steps:[{type:'model_output',content:[{type:'text',text:'Grounded answer',annotations:[{type:'file_citation',source:'fileSearchStores/store-1/documents/d1',custom_metadata:[{key:'source_id',string_value:'MTG-000001'}]}]}]}]}});
  const r=plain(ksp.kspRunFreeQuestion_(env,{question:'What did KKR say?',gpId:'GP-1'}));
  assert.equal(r.ok,true);assert.equal(r.answer,'Grounded answer');assert.equal(r.citations[0].driveUrl,'https://drive.test/meeting-1');assert.equal(env._debug.audits.length,1);assert.equal(JSON.stringify(env._debug.audits[0]).includes('Grounded answer'),false);
});

test('free question surfaces insufficient evidence when authoritative citations are absent',()=>{
  const env=createSyncEnvironment({queryResponse:{steps:[{type:'model_output',content:[{type:'text',text:'A possible answer',annotations:[]}]}]}});const r=plain(ksp.kspRunFreeQuestion_(env,{question:'Q'}));assert.equal(r.ok,true);assert.equal(r.insufficientEvidence,true);assert.equal(r.citations.length,0);
});

test('audit and Actor failures are non-blocking for a successful query',()=>{
  const env=createSyncEnvironment({actorError:true,auditError:true,queryResponse:{steps:[{type:'model_output',content:[{type:'text',text:'Answer',annotations:[{type:'file_citation',source:'d',custom_metadata:[{key:'source_id',string_value:'MTG-000001'}]}]}]}]}});const r=plain(ksp.kspRunFreeQuestion_(env,{question:'Q'}));assert.equal(r.ok,true);assert.ok(r.warnings.some(w=>w.code==='ACTOR_RESOLUTION_FAILED'));assert.ok(r.warnings.some(w=>w.code==='AUDIT_WRITE_FAILED'));
});

test('query error is returned and failure audit excludes answer content',()=>{
  const error=new Error('SECRET_API_RESPONSE');error.code='AI_HTTP_503';const env=createSyncEnvironment({queryError:error});const r=plain(ksp.kspRunFreeQuestion_(env,{question:'Q'}));assert.equal(r.ok,false);assert.equal(r.error.code,'AI_HTTP_503');assert.equal(env._debug.audits[0].Result,'Failure');assert.doesNotMatch(JSON.stringify(r),/SECRET_API_RESPONSE/);assert.doesNotMatch(JSON.stringify(env._debug.audits),/SECRET_API_RESPONSE/);
});

test('question/date/source validation rejects invalid requests',()=>{
  assert.throws(()=>ksp.kspValidateKnowledgeSearchInput_(ksp.kspNormalizeKnowledgeSearchInput_({question:''})),/質問/);
  assert.throws(()=>ksp.kspValidateKnowledgeSearchInput_(ksp.kspNormalizeKnowledgeSearchInput_({question:'Q',dateFrom:'2026-12-31',dateTo:'2026-01-01'})),/Date From/);
  assert.throws(()=>ksp.kspValidateKnowledgeSearchInput_(ksp.kspNormalizeKnowledgeSearchInput_({question:'Q',sourceType:'Other'})),/Source Type/);
});

test('bootstrap reports configured state and active search options',()=>{
  const env=createSyncEnvironment();const r=plain(ksp.kspGetKnowledgeSearchBootstrap_(env));assert.equal(r.ok,true);assert.equal(r.configured,true);assert.deepEqual(r.implementedModes,['自由質問']);assert.equal(r.options.gps.length,1);
});

test('settings normalization and retry backoff are bounded',()=>{
  const s=plain(ksp.kspNormalizeAiSettings_({AI_SYNC_BATCH_SIZE:'500',AI_RETRY_BASE_MINUTES:'15',AI_RETRY_MAX_MINUTES:'60'}));assert.equal(s.syncBatchSize,10);assert.equal(ksp.kspCalculateAiRetryAt_('2026-08-16T00:00:00.000Z',5,s),'2026-08-16T01:00:00.000Z');
});

test('all new Apps Script and client files parse and contain required live contract tokens',()=>{
  const root=path.resolve(__dirname,'..');
  const gsFiles=fs.readdirSync(path.join(root,'src')).filter(f=>f.endsWith('.gs')).sort();
  for(const file of gsFiles)new vm.Script(fs.readFileSync(path.join(root,'src',file),'utf8'),{filename:file});
  const client=fs.readFileSync(path.join(root,'src','ClientKnowledgeSearch.html'),'utf8');const match=client.match(/<script>([\s\S]*?)<\/script>/);assert.ok(match);new vm.Script(match[1],{filename:'ClientKnowledgeSearch.js'});
  const page=fs.readFileSync(path.join(root,'src','KnowledgeSearchPage.html'),'utf8');
  const standalone=fs.readFileSync(path.join(root,'src','KnowledgeSearch.html'),'utf8');
  for(const token of ['id="knowledge-form"','getKnowledgeSearchBootstrapData','Citation','queryPhase:\'POLL\'','queryToken','sessionStorage','setTimeout','KSP_QUERY_AUTO_POLL_LIMIT','pendingQueryAutoStopped','knowledge-recheck'])assert.ok((page+'\n'+client).includes(token),token);
  assert.match(page, /<option value="OPENAI">ChatGPT<\/option>/);
  assert.match(client, /pendingQueryRoute/);
  assert.match(client, /kEl\('knowledge-route'\)\.value='OPENAI'/);
  assert.match(standalone,/include_\('KnowledgeSearchPage'\)/);
  assert.match(standalone,/include_\('ClientKnowledgeSearch'\)/);
  assert.doesNotMatch(client,/askKnowledgeQuestion/);
  assert.match(client,/knowledgeState\.startingQuery\|\|knowledgeState\.pendingQueryToken/);
  assert.match(client,/current&&current\.pending/);
  assert.match(client,/Math\.min\(30000/);
  assert.doesNotMatch(client,/sessionStorage\.setItem\([^\n]*question/);
  assert.doesNotMatch(client,/sessionStorage\.setItem\([^\n]*interactionId/);
  const aiSource=fs.readdirSync(path.join(root,'src')).filter(f=>/^(13|14|15|16|17)\d_.*\.gs$/.test(f)).sort().map(f=>fs.readFileSync(path.join(root,'src',f),'utf8')).join('\n');
  for(const token of ['/interactions','uploadToFileSearchStore','X-Goog-Upload-Protocol','x-goog-api-key','customMetadata','ScriptApp.getOAuthToken'])assert.ok(aiSource.includes(token),token);
  const entry=fs.readFileSync(path.join(root,'src','99_EntryPoints.gs'),'utf8');assert.ok(entry.includes("copy.available = true"));
});

test('official-style JSON fixtures normalize to stable internal contracts',()=>{
  const root=path.resolve(__dirname,'fixtures','file-search');
  const store=plain(ksp.kspNormalizeFileSearchStore_(JSON.parse(fs.readFileSync(path.join(root,'store.json'),'utf8'))));
  const operation=plain(ksp.kspNormalizeFileSearchOperation_(JSON.parse(fs.readFileSync(path.join(root,'upload-operation.json'),'utf8'))));
  const interaction=plain(ksp.kspParseInteractionResponse_(JSON.parse(fs.readFileSync(path.join(root,'interaction.json'),'utf8'))));
  assert.equal(store.name,'fileSearchStores/store-123');
  assert.equal(operation.response.fileSearchDocument.name,'fileSearchStores/store-123/documents/doc-1');
  assert.equal(interaction.citations[0].metadata.source_id,'MTG-000001');
});

test('manifest explicitly grants external request scope for Gemini and Drive media fetches',()=>{
  const manifest=JSON.parse(fs.readFileSync(path.resolve(__dirname,'..','src','appsscript.json'),'utf8'));
  assert.ok(manifest.oauthScopes.includes('https://www.googleapis.com/auth/script.external_request'));
});
