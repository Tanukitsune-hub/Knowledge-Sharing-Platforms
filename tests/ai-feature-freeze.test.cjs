const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const {ksp,plain,baseContext,createSyncEnvironment}=require('./ai-test-helpers.cjs');
const fixture=name=>fs.readFileSync(path.join(__dirname,'fixtures','eml',name),'utf8');

const formatCases={
  pdf:{mime:'application/pdf',bytes:[37,80,68,70]},
  pptx:{mime:'application/vnd.openxmlformats-officedocument.presentationml.presentation',bytes:[80,75,3,4,1]},
  xlsx:{mime:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',bytes:[80,75,3,4,2]},
  docx:{mime:'application/vnd.openxmlformats-officedocument.wordprocessingml.document',bytes:[80,75,3,4,3]},
  txt:{mime:'text/plain',bytes:Array.from(Buffer.from('hello','utf8'))}
};

test('format registry contains exactly the six accepted formats and stable MIME mappings',()=>{
  assert.deepEqual(Array.from(ksp.kspGetAiFormatExtensions_()),['pdf','pptx','xlsx','docx','txt','eml']);
  assert.equal(ksp.kspGetAiFormatDefinition_('pdf').uploadMimeType,'application/pdf');
  assert.equal(ksp.kspGetAiFormatDefinition_('pptx').readStrategy,'DIRECT_BINARY');
  assert.equal(ksp.kspGetAiFormatDefinition_('eml').uploadMimeType,'text/plain');
});

test('source descriptor enforces MIME and 25MB product limit',()=>{
  assert.equal(ksp.kspValidateAiSourceDescriptor_('pdf','application/pdf',12).extension,'pdf');
  assert.throws(()=>ksp.kspValidateAiSourceDescriptor_('pdf','text/plain',12),/MIME/);
  assert.throws(()=>ksp.kspValidateAiSourceDescriptor_('pdf','application/pdf',25*1024*1024+1),/25MB/);
});

for(const [extension,source] of Object.entries(formatCases)){
  test(`${extension} source dispatch preserves authoritative bytes and explicit upload MIME`,()=>{
    const c=baseContext({meetingRows:[]});
    c.pitchbookRows[0].Original_Filename=`source.${extension}`;
    c.pitchbookRows[0].Saved_Filename=`saved.${extension}`;
    const env=createSyncEnvironment({context:c,pitchbookSource:{mimeType:source.mime,bytes:source.bytes}});
    const maps=ksp.kspBuildAiMasterMaps_(c.gpRows,c.optionRows);
    const built=plain(ksp.kspBuildFeatureFreezeAiSource_(env,{sourceType:'Pitchbook',sourceId:'DOC-000001',row:c.pitchbookRows[0]},maps));
    assert.equal(built.payloadKind,'binary');
    assert.deepEqual(built.bytes,source.bytes);
    assert.equal(built.mimeType,ksp.kspGetAiFormatDefinition_(extension).uploadMimeType);
    assert.equal(built.byteLength,source.bytes.length);
  });
}

test('EML normalizes encoded headers and quoted-printable plain body',()=>{
  const text=ksp.kspNormalizeEmlText_(fixture('plain-quoted-printable.eml'));
  assert.match(text,/Subject: APACインフラ/);
  assert.match(text,/From: 山田 太郎/);
  assert.match(text,/投資機会とリスクを確認しました。/);
});

test('EML uses HTML fallback and excludes attachment, style, and script content',()=>{
  const text=ksp.kspNormalizeEmlText_(fixture('html-with-attachment.eml'));
  assert.match(text,/Visible & grounded/);
  assert.doesNotMatch(text,/SECRET_ATTACHMENT/);
  assert.doesNotMatch(text,/SECRET_SCRIPT/);
  assert.doesNotMatch(text,/color:red/);
});

test('EML decodes base64 UTF-8 body',()=>{
  assert.match(ksp.kspNormalizeEmlText_(fixture('base64-utf8.eml')),/こんにちは、APACの更新です。/);
});

test('malformed and attachment-only EML fail deterministically',()=>{
  assert.throws(()=>ksp.kspNormalizeEmlText_('Subject: no separator'),/separator/);
  const attachmentOnly='Subject: x\nMIME-Version: 1.0\nContent-Type: multipart/mixed; boundary="b"\n\n--b\nContent-Type: text/plain; name="x.txt"\nContent-Disposition: attachment; filename="x.txt"\n\nsecret\n--b--';
  assert.throws(()=>ksp.kspNormalizeEmlText_(attachmentOnly),/no indexable/);
});

test('EML source dispatch uploads normalized text and not attachment bytes',()=>{
  const c=baseContext({meetingRows:[]});
  c.pitchbookRows[0].Original_Filename='mail.eml';c.pitchbookRows[0].Saved_Filename='mail.eml';
  const raw=fixture('html-with-attachment.eml');
  const env=createSyncEnvironment({context:c,pitchbookSource:{mimeType:'message/rfc822',bytes:Array.from(Buffer.from(raw,'utf8'))}});
  const built=plain(ksp.kspBuildFeatureFreezeAiSource_(env,{sourceType:'Pitchbook',sourceId:'DOC-000001',row:c.pitchbookRows[0]},ksp.kspBuildAiMasterMaps_(c.gpRows,c.optionRows)));
  assert.equal(built.payloadKind,'text');assert.equal(built.mimeType,'text/plain');assert.match(built.text,/Visible & grounded/);assert.doesNotMatch(built.text,/SECRET_ATTACHMENT/);
});

test('all six format sources hash the exact provider payload and preserve canonical identity metadata',()=>{
  const rawEml=[
    'Subject: CODEX-04 synthetic mail',
    'From: sender@example.invalid',
    'To: recipient@example.invalid',
    'Cc: observer@example.invalid',
    'Date: Mon, 31 Aug 2026 09:00:00 +0900',
    'MIME-Version: 1.0',
    'Content-Type: multipart/mixed; boundary="matrix"',
    '',
    '--matrix',
    'Content-Type: text/plain; charset=UTF-8',
    '',
    'KSP-CODEX04-EML-BODY',
    '--matrix',
    'Content-Type: text/plain; name="attachment.txt"',
    'Content-Disposition: attachment; filename="attachment.txt"',
    '',
    'KSP-CODEX04-EML-ATTACHMENT-NOT-INDEXED',
    '--matrix--'
  ].join('\r\n');
  const cases={
    ...formatCases,
    eml:{mime:'message/rfc822',bytes:Array.from(Buffer.from(rawEml,'utf8'))}
  };
  for(const [extension,driveSource] of Object.entries(cases)){
    const c=baseContext({meetingRows:[]});
    Object.assign(c.pitchbookRows[0],{
      Original_Filename:`source.${extension}`,Saved_Filename:`saved.${extension}`,
      Fund_Strategy:'CODEX-04 Six Format Matrix',File_URL:'https://drive.test/authoritative-source'
    });
    const env=createSyncEnvironment({context:c,pitchbookSource:driveSource});
    const built=plain(ksp.kspBuildFeatureFreezeAiSource_(env,{sourceType:'Pitchbook',sourceId:'DOC-000001',row:c.pitchbookRows[0]},ksp.kspBuildAiMasterMaps_(c.gpRows,c.optionRows)));
    const expectedHash=built.payloadKind==='text'
      ? ksp.kspAiHashTextFallback_(built.text)
      : ksp.kspAiHashBytesFallback_(built.bytes);
    assert.equal(built.contentHash,expectedHash,extension);
    assert.equal(built.sourceType,'Pitchbook',extension);
    assert.equal(built.sourceId,'DOC-000001',extension);
    assert.equal(built.dateKey,'2026-08-01',extension);
    assert.equal(built.gpId,'GP-1',extension);
    assert.equal(built.entityKey,'GP:GP-1',extension);
    assert.equal(built.assetClassId,'AC-1',extension);
    assert.equal(built.capitalTypeId,'CT-1',extension);
    assert.equal(built.fundStrategy,'CODEX-04 Six Format Matrix',extension);
    assert.equal(built.driveUrl,'https://drive.test/authoritative-source',extension);
    const attributes=plain(ksp.kspBuildOpenAiAttributes_(built));
    assert.deepEqual({
      source_type:attributes.source_type,source_id:attributes.source_id,date_key:attributes.date_key,
      entity_key:attributes.entity_key,gp_id:attributes.gp_id,asset_class_id:attributes.asset_class_id,
      capital_type_id:attributes.capital_type_id,fund_strategy:attributes.fund_strategy,
      content_hash:attributes.content_hash
    },{
      source_type:'Pitchbook',source_id:'DOC-000001',date_key:'2026-08-01',entity_key:'GP:GP-1',
      gp_id:'GP-1',asset_class_id:'AC-1',capital_type_id:'CT-1',
      fund_strategy:'CODEX-04 Six Format Matrix',content_hash:expectedHash
    },extension);
    if(extension==='eml'){
      assert.match(built.text,/Subject: CODEX-04 synthetic mail/);
      assert.match(built.text,/KSP-CODEX04-EML-BODY/);
      assert.doesNotMatch(built.text,/KSP-CODEX04-EML-ATTACHMENT-NOT-INDEXED/);
    }
  }
});

test('six-format retrieved sources normalize only through authoritative provider and source identity',()=>{
  const extensions=['pdf','pptx','xlsx','docx','txt','eml'];
  const c=baseContext({meetingRows:[]});
  c.pitchbookRows=extensions.map((extension,index)=>{
    const sourceId=`DOC-${String(index+1).padStart(6,'0')}`;
    const contentHash=`hash-${extension}`;
    const providerId=`provider-${extension}`;
    const state=ksp.kspBuildEmptyAiProviderState_();
    Object.assign(state.OPENAI,{status:'Indexed',providerDocumentId:providerId,documentName:`openai:private/${providerId}`,contentHash,indexedAt:'2026-08-31T00:00:00.000Z'});
    return {...c.pitchbookRows[0],Document_ID:sourceId,File_ID:`file-${extension}`,
      File_URL:`https://drive.test/${sourceId}`,Original_Filename:`source.${extension}`,
      Saved_Filename:`saved.${extension}`,AI_Content_Hash:contentHash,
      AI_Provider_State_JSON:ksp.kspSerializeAiProviderState_(state)};
  });
  const response=ksp.kspNormalizeOpenAiResponse_({output:[{
    type:'file_search_call',status:'completed',results:extensions.map((extension,index)=>({
      file_id:`provider-${extension}`,filename:'same-provider-filename.bin',text:`chunk-${extension}`,
      attributes:{source_type:'Pitchbook',source_id:`DOC-${String(index+1).padStart(6,'0')}`,content_hash:`hash-${extension}`}
    }))
  }]});
  const mapped=plain(ksp.kspMapKnowledgeCitations_(response.citations,ksp.kspBuildAuthoritativeSourceMaps_([],c.pitchbookRows)));
  assert.equal(mapped.citations.length,6);
  assert.deepEqual(mapped.citations.map(item=>item.sourceId),extensions.map((_,index)=>`DOC-${String(index+1).padStart(6,'0')}`));
  assert.ok(mapped.citations.every(item=>item.sourceType==='Pitchbook'&&/^https:\/\/drive\.test\/DOC-/.test(item.driveUrl)));
  assert.doesNotMatch(JSON.stringify(mapped),/provider-(pdf|pptx|xlsx|docx|txt|eml)|same-provider-filename/);
});

test('NotIndexed active source is eligible after Work 0008 deferral',()=>{
  const c=baseContext({meetingRows:[]});c.pitchbookRows[0].AI_Index_Status='NotIndexed';c.pitchbookRows[0].AI_Last_Error=JSON.stringify({permanent:true,code:'AI_FORMAT_DEFERRED_TO_WORK_0009'});
  const selected=plain(ksp.kspFfSelectAiWorkItems_(c.meetingRows,c.pitchbookRows,'2026-08-16T00:00:00.000Z',ksp.kspNormalizeAiSettings_(c.settings)));
  assert.equal(selected.length,1);
});

test('unchanged row is repaired when derived Document is missing',()=>{
  const c=baseContext({pitchbookRows:[]});const hash=ksp.kspAiHashTextFallback_('Meeting body');Object.assign(c.meetingRows[0],{AI_Index_Status:'Pending',AI_Content_Hash:hash,AI_Document_Name:'fileSearchStores/store-1/documents/missing'});
  const env=createSyncEnvironment({context:c,documents:[]});const result=plain(ksp.kspRunFeatureFreezeAiSync_(env));
  assert.equal(result.indexed,1);assert.equal(result.unchanged,0);assert.equal(env._debug.uploaded.length,1);
});

test('PDF feature-freeze sync indexes binary source instead of deferring it',()=>{
  const c=baseContext({meetingRows:[]});c.pitchbookRows[0].Original_Filename='deck.pdf';c.pitchbookRows[0].Saved_Filename='deck.pdf';
  const bytes=[37,80,68,70,45,49];const env=createSyncEnvironment({context:c,pitchbookSource:{mimeType:'application/pdf',bytes}});
  const result=plain(ksp.kspRunFeatureFreezeAiSync_(env));
  assert.equal(result.indexed,1);assert.equal(env._debug.uploaded[0].payloadKind,'binary');assert.deepEqual(env._debug.uploaded[0].bytes,bytes);
});

test('five search modes use one File Search tool contract',()=>{
  const definitions=plain(ksp.kspGetFeatureFreezeModeDefinitions_());
  assert.deepEqual(definitions.map(x=>x.mode),['自由質問','要約','時系列','比較','面談準備']);
  for(const mode of definitions.map(x=>x.mode)){
    const request=plain(ksp.kspBuildFeatureFreezeInteractionRequest_({modelId:'flash',storeName:'fileSearchStores/store-1',mode,questionOrInstruction:mode==='自由質問'?'Q':'',gpId:mode==='面談準備'?'GP-1':'',metadataFilter:'gp_id = "GP-1"'}));
    assert.equal(request.tools.length,1);assert.equal(request.tools[0].type,'file_search');assert.match(request.input,new RegExp(`モード: ${mode}`));
  }
});

test('mode validation requires question only for free question and GP for meeting prep',()=>{
  assert.throws(()=>ksp.kspValidateFeatureFreezeSearchInput_(ksp.kspNormalizeFeatureFreezeSearchInput_({mode:'自由質問'})),/質問/);
  assert.doesNotThrow(()=>ksp.kspValidateFeatureFreezeSearchInput_(ksp.kspNormalizeFeatureFreezeSearchInput_({mode:'要約'})));
  assert.throws(()=>ksp.kspValidateFeatureFreezeSearchInput_(ksp.kspNormalizeFeatureFreezeSearchInput_({mode:'面談準備'})),/GP/);
  assert.doesNotThrow(()=>ksp.kspValidateFeatureFreezeSearchInput_(ksp.kspNormalizeFeatureFreezeSearchInput_({mode:'面談準備',gpId:'GP-1'})));
});

test('mode prompts encode synthesis, chronology, comparison, and meeting prep guardrails',()=>{
  assert.match(ksp.kspBuildFeatureFreezePrompt_({mode:'要約'}),/単純に並べない/);
  assert.match(ksp.kspBuildFeatureFreezePrompt_({mode:'時系列'}),/変化と継続/);
  assert.match(ksp.kspBuildFeatureFreezePrompt_({mode:'比較'}),/順位付け/);
  assert.match(ksp.kspBuildFeatureFreezePrompt_({mode:'面談準備',gpId:'GP-1'}),/未解決論点/);
});

test('generic five-mode service audits mode without answer or chunks',()=>{
  const env=createSyncEnvironment({queryResponse:{id:'i',steps:[{type:'model_output',content:[{type:'text',text:'SECRET_ANSWER',annotations:[{type:'file_citation',source:'d',custom_metadata:[{key:'source_id',string_value:'MTG-000001'}]}]}]}]}});
  const result=plain(ksp.kspRunFeatureFreezeKnowledgeSearch_(env,{mode:'要約',questionOrInstruction:'risk focus'}));
  assert.equal(result.ok,true);assert.equal(result.mode,'要約');assert.equal(env._debug.audits[0].Search_Mode,'要約');assert.equal(env._debug.audits[0].Question_Or_Instruction,'');assert.equal(JSON.stringify(env._debug.audits[0]).includes('risk focus'),false);assert.equal(JSON.stringify(env._debug.audits[0]).includes('SECRET_ANSWER'),false);
});

test('Pitchbook source derives exact filter attributes from the authoritative row',()=>{
  const c=baseContext({meetingRows:[]});
  Object.assign(c.pitchbookRows[0],{Fund_Strategy:'Exact Strategy',GP_ID:'GP-1',Asset_Class_ID:'AC-1',Capital_Type_ID:'CT-1'});
  const env=createSyncEnvironment({context:c});
  const built=plain(ksp.kspBuildFeatureFreezeAiSource_(env,{sourceType:'Pitchbook',sourceId:'DOC-000001',row:c.pitchbookRows[0]},ksp.kspBuildAiMasterMaps_(c.gpRows,c.optionRows)));
  const attributes=plain(ksp.kspBuildOpenAiAttributes_(built));
  assert.equal(built.fundStrategy,'Exact Strategy');
  assert.deepEqual({
    source_type:attributes.source_type,source_id:attributes.source_id,date_key:attributes.date_key,
    gp_id:attributes.gp_id,asset_class_id:attributes.asset_class_id,capital_type_id:attributes.capital_type_id,
    fund_strategy:attributes.fund_strategy,counterparty_id:attributes.counterparty_id,content_hash:attributes.content_hash
  },{
    source_type:'Pitchbook',source_id:'DOC-000001',date_key:'2026-08-01',gp_id:'GP-1',
    asset_class_id:'AC-1',capital_type_id:'CT-1',fund_strategy:'Exact Strategy',counterparty_id:'GP-1',
    content_hash:built.contentHash
  });
});

test('feature-freeze diagnostics report six formats, five modes, and pending live qualification',()=>{
  const result=plain(ksp.kspGetFeatureFreezeDiagnostics_(createSyncEnvironment()));
  assert.equal(result.featureFreezeCandidate,true);assert.equal(result.formats.length,6);assert.equal(result.modes.length,5);assert.equal(result.sharedRetrievalPath,'kspRunFeatureFreezeKnowledgeSearch_');assert.equal(result.liveQualified,false);assert.equal(result.syncHandlerAvailable,true);assert.equal(Object.hasOwn(result,'apiKey'),false);
});

test('binary upload implementation preserves MIME and exact byte count contract',()=>{
  const source=fs.readFileSync(path.resolve(__dirname,'..','src','161_GeminiRestClient.gs'),'utf8')+'\n'+fs.readFileSync(path.resolve(__dirname,'..','src','181_FeatureFreezeSync.gs'),'utf8');
  for(const token of ['kspAiSourcePayloadBytes_(source)','X-Goog-Upload-Header-Content-Length','X-Goog-Upload-Header-Content-Type','Content-Length','kspFfSignedBytes_(bytes)'])assert.ok(source.includes(token),token);
});

test('Knowledge Search UI exposes all modes and generic endpoint',()=>{
  const root=path.resolve(__dirname,'..','src');const page=fs.readFileSync(path.join(root,'KnowledgeSearchPage.html'),'utf8');const client=fs.readFileSync(path.join(root,'ClientKnowledgeSearch.html'),'utf8');
  new vm.Script(client.match(/<script>([\s\S]*?)<\/script>/)[1]);
  for(const token of ['id="knowledge-mode"','自由質問','要約','時系列','比較','面談準備','id="knowledge-instruction"','searchKnowledge'])assert.ok((page+'\n'+client).includes(token),token);
});
