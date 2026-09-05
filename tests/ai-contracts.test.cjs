const { test, assert, ksp, plain, baseContext, createSyncEnvironment } = require('./ai-test-helpers.cjs');
test('builds official Store create contract',()=>{
  assert.deepEqual(plain(ksp.kspBuildFileSearchStoreCreateRequest_('Private Knowledge','models/gemini-embedding-2')),{displayName:'Private Knowledge',embeddingModel:'models/gemini-embedding-2'});
});

test('builds upload metadata with traceability and no blank option metadata',()=>{
  const m=plain(ksp.kspBuildFileSearchUploadMetadata_({sourceType:'Meeting',sourceId:'MTG-1',dateKey:'2026-01-01',gpId:'',gpName:'',entityKey:'LP_ASSET_OWNER:OPT-CPLP-001',counterpartyType:'LP_ASSET_OWNER',counterpartyId:'OPT-CPLP-001',counterpartyName:'Synthetic Asset Owner',relatedGpIds:'GP-1',assetClassId:'AC-1',assetClassName:'Infrastructure',capitalTypeId:'',capitalTypeName:'',driveUrl:'https://drive',savedFilename:'x',contentHash:'abc',displayName:'x.txt',mimeType:'text/plain'}));
  assert.equal(m.displayName,'x.txt');
  assert.equal(m.customMetadata.some(x=>x.key==='source_id'&&x.stringValue==='MTG-1'),true);
  assert.equal(m.customMetadata.some(x=>x.key==='capital_type_id'),false);
  assert.equal(m.customMetadata.some(x=>x.key==='entity_key'&&x.stringValue==='LP_ASSET_OWNER:OPT-CPLP-001'),true);
  assert.equal(m.customMetadata.some(x=>x.key==='related_gp_ids'&&x.stringValue==='GP-1'),true);
});

test('metadata filter is deterministic, escaped, and omits blanks',()=>{
  assert.equal(ksp.kspBuildMetadataFilter_({dateFrom:'2026-01-01',dateTo:'2026-12-31',gpId:'GP"1',assetClassId:'',capitalTypeId:'CT-1',sourceType:'Meeting'}),'date_key >= "2026-01-01" AND date_key <= "2026-12-31" AND gp_id = "GP\\"1" AND capital_type_id = "CT-1" AND source_type = "Meeting"');
});

test('Interactions request uses current string input and one File Search tool',()=>{
  const r=plain(ksp.kspBuildInteractionRequest_({modelId:'gemini-flash',storeName:'fileSearchStores/store-1',question:'What changed?',metadataFilter:'gp_id = "GP-1"'}));
  assert.equal(typeof r.input,'string');
  assert.match(r.input,/What changed\?/);
  assert.deepEqual(r.tools,[{type:'file_search',file_search_store_names:['fileSearchStores/store-1'],metadata_filter:'gp_id = "GP-1"'}]);
});

test('normalizes snake_case and camelCase operation/document contracts',()=>{
  const op=plain(ksp.kspNormalizeFileSearchOperation_({name:'fileSearchStores/store-1/upload/operations/op-1',done:true,response:{}}));
  assert.equal(op.done,true);
  const doc=plain(ksp.kspNormalizeFileSearchDocument_({name:'fileSearchStores/store-1/documents/doc-1',display_name:'d',custom_metadata:[{key:'source_id',string_value:'MTG-1'}]}));
  assert.equal(doc.customMetadata.source_id,'MTG-1');
});

test('live File Search Document listing stays within the official page-size limit',()=>{
  const paths=[];
  const original=ksp.kspGeminiJsonRequestLive_;
  try {
    ksp.kspGeminiJsonRequestLive_=(method,path)=>{paths.push({method,path});return{documents:[]};};
    assert.deepEqual(plain(ksp.kspListAllFileSearchDocumentsLive_('fileSearchStores/store-1')),[]);
    assert.deepEqual(paths,[{method:'GET',path:'/fileSearchStores/store-1/documents?pageSize=20'}]);
  } finally { ksp.kspGeminiJsonRequestLive_=original; }
});

test('capped File Search Document listing cannot be treated as a unique complete lookup',()=>{
  const original=ksp.kspGeminiJsonRequestLive_;
  let calls=0;
  try {
    ksp.kspGeminiJsonRequestLive_=()=>{calls+=1;return{documents:[],nextPageToken:`page-${calls}`};};
    assert.throws(()=>ksp.kspListAllFileSearchDocumentsLive_('fileSearchStores/store-1'),
      (error)=>error.code==='AI_DOCUMENT_READBACK_FAILED');
    assert.equal(calls,20);
  } finally { ksp.kspGeminiJsonRequestLive_=original; }
});

test('parses file citations without hiding pre-resolution identity conflicts',()=>{
  const parsed=plain(ksp.kspParseInteractionResponse_({id:'i-1',steps:[{type:'model_output',content:[{type:'text',text:'Answer',annotations:[{type:'file_citation',file_name:'one',source:'fileSearchStores/store-1/documents/a',custom_metadata:[{key:'source_id',string_value:'MTG-1'}]},{type:'file_citation',fileName:'one',source:'other',customMetadata:[{key:'source_id',stringValue:'MTG-1'}]}]}]}]}));
  assert.equal(parsed.answer,'Answer');assert.equal(parsed.citations.length,2);assert.equal(parsed.citations[0].metadata.source_id,'MTG-1');
});

test('citation mapping trusts backend Drive URL and excludes unknown/inactive sources',()=>{
  const maps=ksp.kspBuildAuthoritativeSourceMaps_([
    {Meeting_ID:'MTG-1',Status:'Active',Doc_URL:'https://authoritative',Saved_Filename:'Meeting',AI_Document_Name:'doc-a'},
    {Meeting_ID:'MTG-2',Status:'Inactive',Doc_URL:'https://inactive',Saved_Filename:'Old'}
  ],[]);
  const mapped=plain(ksp.kspMapKnowledgeCitations_([
    {source:'https://malicious',metadata:{source_id:'MTG-1'},pageNumber:3},
    {source:'x',metadata:{source_id:'MTG-2'}},
    {source:'unknown',metadata:{source_id:'MTG-X'}}
  ],maps));
  assert.equal(mapped.citations.length,1);assert.equal(mapped.citations[0].driveUrl,'https://authoritative');assert.equal(mapped.warnings.length,2);assert.doesNotMatch(JSON.stringify(mapped.warnings),/malicious/);
});

test('query audit stores filters/model/cited IDs but no question, answer, or chunks',()=>{
  const row=plain(ksp.kspBuildKnowledgeSearchAuditRow_({timestamp:'t',actor:'a',input:{question:'Q',gpId:'GP-1'},modelId:'m',result:'Success',citations:[{sourceId:'MTG-1'}],answer:'secret',chunks:['secret']}));
  assert.equal(row.Question_Or_Instruction,'');assert.equal(row.Cited_Source_IDs,'MTG-1');assert.equal(JSON.stringify(row).includes('secret'),false);
});

test('Meeting source model includes stable metadata and authoritative text only in transient source',()=>{
  const source=plain(ksp.kspBuildMeetingAiSource_(baseContext().meetingRows[0],{gps:{'GP-1':'KKR'},counterparties:{'GP:GP-1':'KKR'},assetClasses:{'AC-1':'Infrastructure'},capitalTypes:{'CT-1':'Equity'}},'body','hash'));
  assert.equal(source.sourceId,'MTG-000001');assert.equal(source.driveUrl,'https://drive.test/meeting-1');assert.equal(source.text,'body');assert.equal(source.contentHash,'hash');
  assert.equal(source.entityKey,'GP:GP-1');assert.equal(source.relatedGpIds,'GP-1');
  const nonGp=plain(ksp.kspBuildMeetingAiSource_({...baseContext().meetingRows[0],GP_ID:'',Counterparty_Type:'LP_ASSET_OWNER',Counterparty_ID:'OPT-CPLP-001',Related_GP_IDs:'GP-1'},
    {gps:{'GP-1':'KKR'},counterparties:{'LP_ASSET_OWNER:OPT-CPLP-001':'Synthetic Asset Owner'},assetClasses:{'AC-1':'Infrastructure'},capitalTypes:{'CT-1':'Equity'}},'body','hash'));
  assert.equal(nonGp.entityKey,'LP_ASSET_OWNER:OPT-CPLP-001');assert.equal(nonGp.counterpartyName,'Synthetic Asset Owner');assert.equal(nonGp.gpId,'');
});

test('selects inactive cleanup before active work and respects batch size',()=>{
  const c=baseContext();
  c.meetingRows.push({...c.meetingRows[0],Meeting_ID:'MTG-2',Status:'Inactive',AI_Document_Name:'old',AI_Index_Status:'Indexed'});
  const settings=ksp.kspNormalizeAiSettings_({...c.settings,AI_SYNC_BATCH_SIZE:'1'});
  const selected=plain(ksp.kspSelectAiWorkItems_(c.meetingRows,c.pitchbookRows,'2026-08-16T00:00:00.000Z',settings));
  assert.equal(selected.length,1);assert.equal(selected[0].sourceId,'MTG-2');
});
