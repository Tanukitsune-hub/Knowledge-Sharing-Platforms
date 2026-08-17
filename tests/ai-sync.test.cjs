const { test, assert, ksp, plain, baseContext, createSyncEnvironment } = require('./ai-test-helpers.cjs');
test('first sync indexes Meeting and TXT source and writes Indexed state',()=>{
  const env=createSyncEnvironment();const r=plain(ksp.kspRunAiSync_(env));
  assert.equal(r.ok,true);assert.equal(r.indexed,2);assert.equal(env._debug.uploaded.length,2);
  assert.equal(env._debug.context.meetingRows[0].AI_Index_Status,'Indexed');
});

test('unchanged indexed revision makes no upload',()=>{
  const c=baseContext();const hash=ksp.kspAiHashTextFallback_('Meeting body');
  c.meetingRows[0].AI_Index_Status='Pending';c.meetingRows[0].AI_Content_Hash=hash;c.meetingRows[0].AI_Document_Name='fileSearchStores/store-1/documents/meeting';
  c.pitchbookRows=[];
  const env=createSyncEnvironment({context:c});const r=plain(ksp.kspRunAiSync_(env));
  assert.equal(r.unchanged,1);assert.equal(env._debug.uploaded.length,0);
});

test('reconciles matching modeled document and deletes extras',()=>{
  const c=baseContext({pitchbookRows:[]});const hash=ksp.kspAiHashTextFallback_('Meeting body');
  const env=createSyncEnvironment({context:c,documents:[
    {name:'fileSearchStores/store-1/documents/good',customMetadata:{source_id:'MTG-000001',content_hash:hash}},
    {name:'fileSearchStores/store-1/documents/old',customMetadata:{source_id:'MTG-000001',content_hash:'old'}}
  ]});
  const r=plain(ksp.kspRunAiSync_(env));assert.equal(r.reused,1);assert.deepEqual(env._debug.deleted,['fileSearchStores/store-1/documents/old']);assert.equal(env._debug.uploaded.length,0);
});

test('replacement deletes old document and indexes latest revision once',()=>{
  const c=baseContext({pitchbookRows:[]});c.meetingRows[0].AI_Document_Name='fileSearchStores/store-1/documents/old';c.meetingRows[0].AI_Index_Status='Pending';
  const env=createSyncEnvironment({context:c,documents:[{name:'fileSearchStores/store-1/documents/old',customMetadata:{source_id:'MTG-000001',content_hash:'old'}}],meetingText:'new body'});
  const r=plain(ksp.kspRunAiSync_(env));assert.equal(r.indexed,1);assert.equal(env._debug.deleted.includes('fileSearchStores/store-1/documents/old'),true);assert.equal(env._debug.documents.filter(d=>d.customMetadata.source_id==='MTG-000001').length,1);
});

test('retryable sync failure records bounded backoff and clears stale AI reference',()=>{
  const err=new Error('quota');err.httpStatus=429;err.code='AI_HTTP_429';
  const c=baseContext({pitchbookRows:[]});c.meetingRows[0].AI_Document_Name='old';
  const env=createSyncEnvironment({context:c,uploadError:err});const r=plain(ksp.kspRunAiSync_(env));
  assert.equal(r.failed,1);const row=env._debug.context.meetingRows[0];assert.equal(row.AI_Index_Status,'Failed');assert.equal(row.AI_Document_Name,'');const state=JSON.parse(row.AI_Last_Error);assert.equal(state.retryable,true);assert.match(state.nextAttemptAt,/Z$/);
});

test('non-TXT source is made NotIndexed and old derived document is removed without retry loop',()=>{
  const c=baseContext({meetingRows:[]});c.pitchbookRows[0].Saved_Filename='deck.pdf';c.pitchbookRows[0].Original_Filename='deck.pdf';c.pitchbookRows[0].AI_Document_Name='fileSearchStores/store-1/documents/old';
  const env=createSyncEnvironment({context:c,documents:[{name:'fileSearchStores/store-1/documents/old',customMetadata:{source_id:'DOC-000001',content_hash:'old'}}]});const r=plain(ksp.kspRunAiSync_(env));
  assert.equal(r.deferred,1);const row=env._debug.context.pitchbookRows[0];assert.equal(row.AI_Index_Status,'NotIndexed');assert.equal(row.AI_Document_Name,'');assert.equal(JSON.parse(row.AI_Last_Error).permanent,true);assert.equal(env._debug.deleted.length,1);
});

test('Inactive cleanup removes derived documents and clears AI fields',()=>{
  const c=baseContext({pitchbookRows:[]});Object.assign(c.meetingRows[0],{Status:'Inactive',AI_Document_Name:'fileSearchStores/store-1/documents/old',AI_Index_Status:'Indexed',AI_Content_Hash:'h'});
  const env=createSyncEnvironment({context:c,documents:[{name:'fileSearchStores/store-1/documents/old',customMetadata:{source_id:'MTG-000001',content_hash:'h'}}]});const r=plain(ksp.kspRunAiSync_(env));
  assert.equal(r.removed,1);assert.equal(c.meetingRows[0].AI_Index_Status,'NotIndexed');assert.equal(env._debug.documents.length,0);
});

test('claimed source is skipped without mutation',()=>{
  const c=baseContext({pitchbookRows:[]});const env=createSyncEnvironment({context:c,claimDenied:'Meeting:MTG-000001'});const r=plain(ksp.kspRunAiSync_(env));assert.equal(r.skippedClaims,1);assert.equal(env._debug.patches.length,0);
});

test('disabled sync returns without Store or source mutation',()=>{
  const c=baseContext();c.settings.AI_SYNC_ENABLED='false';const env=createSyncEnvironment({context:c});const r=plain(ksp.kspRunAiSync_(env));assert.equal(r.syncEnabled,false);assert.equal(r.selected,0);assert.equal(env._debug.uploaded.length,0);
});
