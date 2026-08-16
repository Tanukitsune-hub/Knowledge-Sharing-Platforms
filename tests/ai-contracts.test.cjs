const { test, assert, ksp, plain, baseContext, createSyncEnvironment } = require('./ai-test-helpers.cjs');
test('builds official Store create contract',()=>{
  assert.deepEqual(plain(ksp.kspBuildFileSearchStoreCreateRequest('Private Knowledge','models/gemini-embedding-2')),{displayName:'Private Knowledge',embeddingModel:'models/gemini-embedding-2'});
});

test('builds upload metadata with traceability and no blank option metadata',()=>{
  const m=plain(ksp.kspBuildFileSearchUploadMetadata({sourceType:'Meeting',sourceId:'MTG-1',dateKey:'2026-01-01',gpId:'GP-1',gpName:'KKR',assetClassId:'AC-1',assetClassName:'Infrastructure',capitalTypeId:'',capitalTypeName:'',driveUrl:'https://drive',savedFilename:'x',contentHash:'abc',displayName:'x.txt',mimeType:'text/plain'}));
  assert.equal(m.displayName,'x.txt');
  assert.equal(m.customMetadata.some(x=>x.key==='source_id'&&x.stringValue==='MTG-1'),true);
  assert.equal(m.customMetadata.some(x=>x.key==='capital_type_id'),false);
});

test('metadata filter is deterministic, escaped, and omits blanks',()=>{
  assert.equal(ksp.kspBuildMetadataFilter({dateFrom:'2026-01-01',dateTo:'2026-12-31',gpId:'GP"1',assetClassId:'',capitalTypeId:'CT-1',sourceType:'Meeting'}),'date_key >= "2026-01-01" AND date_key <= "2026-12-31" AND gp_id = "GP\\"1" AND capital_type_id = "CT-1" AND source_type = "Meeting"');
});

test('Interactions request uses current string input and one File Search tool',()=>{
  const r=plain(ksp.kspBuildInteractionRequest({modelId:'gemini-flash',storeName:'fileSearchStores/store-1',question:'What changed?',metadataFilter:'gp_id = "GP-1"'}));
  assert.equal(typeof r.input,'string');
  assert.match(r.input,/What changed\?/);
  assert.deepEqual(r.tools,[{type:'file_search',file_search_store_names:['fileSearchStores/store-1'],metadata_filter:'gp_id = "GP-1"'}]);
});

test('normalizes snake_case and camelCase operation/document contracts',()=>{
  const op=plain(ksp.kspNormalizeFileSearchOperation({name:'fileSearchStores/store-1/upload/operations/op-1',done:true,response:{}}));
  assert.equal(op.done,true);
  const doc=plain(ksp.kspNormalizeFileSearchDocument({name:'fileSearchStores/store-1/documents/doc-1',display_name:'d',custom_metadata:[{key:'source_id',string_value:'MTG-1'}]}));
  assert.equal(doc.customMetadata.source_id,'MTG-1');
});

test('live File Search Document listing stays within the official page-size limit',()=>{
  const paths=[];
  ksp.kspGeminiJsonRequestLive_=(method,path)=>{paths.push({method,path});return{documents:[]};};
  assert.deepEqual(plain(ksp.kspListAllFileSearchDocumentsLive_('fileSearchStores/store-1')),[]);
  assert.deepEqual(paths,[{method:'GET',path:'/fileSearchStores/store-1/documents?pageSize=20'}]);
});

test('parses and deduplicates file citations',()=>{
  const parsed=plain(ksp.kspParseInteractionResponse({id:'i-1',steps:[{type:'model_output',content:[{type:'text',text:'Answer',annotations:[{type:'file_citation',file_name:'one',source:'fileSearchStores/store-1/documents/a',custom_metadata:[{key:'source_id',string_value:'MTG-1'}]},{type:'file_citation',fileName:'one',source:'other',customMetadata:[{key:'source_id',stringValue:'MTG-1'}]}]}]}]}));
  assert.equal(parsed.answer,'Answer');assert.equal(parsed.citations.length,1);assert.equal(parsed.citations[0].metadata.source_id,'MTG-1');
});

test('citation mapping trusts backend Drive URL and excludes unknown/inactive sources',()=>{
  const maps=ksp.kspBuildAuthoritativeSourceMaps([
    {Meeting_ID:'MTG-1',Status:'Active',Doc_URL:'https://authoritative',Saved_Filename:'Meeting',AI_Document_Name:'doc-a'},
    {Meeting_ID:'MTG-2',Status:'Inactive',Doc_URL:'https://inactive',Saved_Filename:'Old'}
  ],[]);
  const mapped=plain(ksp.kspMapKnowledgeCitations([
    {source:'https://malicious',metadata:{source_id:'MTG-1'},pageNumber:3},
    {source:'x',metadata:{source_id:'MTG-2'}},
    {source:'unknown',metadata:{source_id:'MTG-X'}}
  ],maps));
  assert.equal(mapped.citations.length,1);assert.equal(mapped.citations[0].driveUrl,'https://authoritative');assert.equal(mapped.warnings.length,2);
});

test('query audit stores question/filter/model/cited IDs but no answer or chunks',()=>{
  const row=plain(ksp.kspBuildKnowledgeSearchAuditRow({timestamp:'t',actor:'a',input:{question:'Q',gpId:'GP-1'},modelId:'m',result:'Success',citations:[{sourceId:'MTG-1'}],answer:'secret',chunks:['secret']}));
  assert.equal(row.Question_Or_Instruction,'Q');assert.equal(row.Cited_Source_IDs,'MTG-1');assert.equal(JSON.stringify(row).includes('secret'),false);
});

test('Meeting source model includes stable metadata and authoritative text only in transient source',()=>{
  const source=plain(ksp.kspBuildMeetingAiSource(baseContext().meetingRows[0],{gps:{'GP-1':'KKR'},assetClasses:{'AC-1':'Infrastructure'},capitalTypes:{'CT-1':'Equity'}},'body','hash'));
  assert.equal(source.sourceId,'MTG-000001');assert.equal(source.driveUrl,'https://drive.test/meeting-1');assert.equal(source.text,'body');assert.equal(source.contentHash,'hash');
});

test('selects inactive cleanup before active work and respects batch size',()=>{
  const c=baseContext();
  c.meetingRows.push({...c.meetingRows[0],Meeting_ID:'MTG-2',Status:'Inactive',AI_Document_Name:'old',AI_Index_Status:'Indexed'});
  const settings=ksp.kspNormalizeAiSettings({...c.settings,AI_SYNC_BATCH_SIZE:'1'});
  const selected=plain(ksp.kspSelectAiWorkItems(c.meetingRows,c.pitchbookRows,'2026-08-16T00:00:00.000Z',settings));
  assert.equal(selected.length,1);assert.equal(selected[0].sourceId,'MTG-2');
});
