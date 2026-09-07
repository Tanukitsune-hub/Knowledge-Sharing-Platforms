const { test, assert, ksp, plain, baseContext, createSyncEnvironment } = require('./ai-test-helpers.cjs');
const { loadAi } = require('./ai-test-loader.cjs');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');

function fixture() {
  const c = baseContext();
  Object.assign(c.pitchbookRows[0], { Parent_Meeting_ID: 'MTG-000001', Counterparty_Type: 'LP_ASSET_OWNER', Counterparty_ID: 'LP-1', GP_ID: '' });
  c.meetingRows[0].Related_Pitchbook_IDs = 'DOC-000001';
  c.meetingRows[0].AI_Index_Status = 'Indexed'; c.meetingRows[0].AI_Document_Name = 'existing';
  return c;
}

test('provider allowlist excludes orphan and inactive sources, retains explicit shared link, bounds size', () => {
  const c = fixture(); const input = () => ksp.kspBuildCanonicalKnowledgeRequest_({ question: 'synthetic' });
  c.meetingRows[0].Related_Pitchbook_IDs = '';
  let scoped = ksp.kspRestrictKnowledgeEligibleSources_(input(), c);
  assert.deepEqual(plain(scoped.resolvedSourceIds), ['MTG-000001']);
  const openai = JSON.stringify(ksp.kspBuildOpenAiFilter_(scoped));
  assert.ok(openai.includes('MTG-000001')); assert.ok(!openai.includes('DOC-000001'));
  const gemini = ksp.kspBuildProviderSearchRequest_('GEMINI', { modelId: 'synthetic', storeName: 'fileSearchStores/synthetic' }, scoped);
  assert.match(gemini.metadataFilter, /source_id = "MTG-000001"/);
  c.meetingRows.push({ Meeting_ID: 'MTG-000002', Status: 'Active', Related_Pitchbook_IDs: 'DOC-000001' });
  assert.ok(ksp.kspRestrictKnowledgeEligibleSources_(input(), c).resolvedSourceIds.includes('DOC-000001'));
  c.pitchbookRows[0].Status = 'Inactive';
  assert.ok(!ksp.kspRestrictKnowledgeEligibleSources_(input(), c).resolvedSourceIds.includes('DOC-000001'));
  for (let i = 0; i <= ksp.KSP_KNOWLEDGE_ADVANCED_SOURCE_ID_MAX; i++) c.meetingRows.push({ Meeting_ID: 'MTG-X' + i, Status: 'Active' });
  assert.throws(() => ksp.kspRestrictKnowledgeEligibleSources_(input(), c), e => e.code === 'AI_ADVANCED_FILTER_TOO_BROAD');
});

test('large repository is bounded after authoritative common filters and compare/advanced intersection', () => {
  const c = fixture();
  for (let i = 0; i <= ksp.KSP_KNOWLEDGE_ADVANCED_SOURCE_ID_MAX; i++) {
    c.meetingRows.push({ ...c.meetingRows[0], Meeting_ID: 'MTG-X' + i, Date: '2025-01-01', GP_ID: 'GP-OTHER', Related_Pitchbook_IDs: '' });
  }
  function resolve(filters, extra = {}) {
    return plain(ksp.kspRestrictKnowledgeEligibleSources_(ksp.kspBuildCanonicalKnowledgeRequest_({
      question: 'synthetic', filters, ...extra
    }), c).resolvedSourceIds);
  }
  assert.deepEqual(resolve({ sourceType: 'Pitchbook', entityKey: 'LP_ASSET_OWNER:LP-1' }), ['DOC-000001']);
  assert.deepEqual(resolve({ sourceType: 'Meeting', dateFrom: '2026-01-01', dateTo: '2026-12-31', entityKey: 'GP:GP-1' }), ['MTG-000001']);
  assert.deepEqual(resolve({ sourceType: 'Meeting', sourceId: 'MTG-000001' }), ['MTG-000001']);
  assert.deepEqual(resolve({}, { mode: '比較', selectedEntityKeys: ['GP:GP-1', 'LP_ASSET_OWNER:LP-1'],
    advancedFilterResolved: true, resolvedSourceIds: ['DOC-000001'] }), ['DOC-000001']);
  assert.deepEqual(resolve({ assetClassId: 'NONMATCH' }), []);
  assert.deepEqual(resolve({ capitalTypeId: 'NONMATCH' }), []);
  assert.deepEqual(resolve({ fundStrategy: 'NONMATCH' }), []);
  assert.deepEqual(resolve({ counterpartyType: 'OTHER' }), []);
});

function syncEnv(c) {
  const env = createSyncEnvironment({ context: c });
  env.getProviderConfig = provider => ({ provider, enabled: provider === 'OPENAI', vectorStoreId: 'vs-synthetic', modelId: 'synthetic', credentialConfigured: true });
  env.ensureProviderStore = () => ({ name: 'vs-synthetic' });
  env.findProviderDocumentsBySource = () => [];
  env.readPitchbookSource = () => ({ mimeType: 'text/plain', bytes: [65] });
  env.hashBytes = bytes => 'hash-' + bytes.join(',');
  env.uploadProviderSource = () => ({ name: 'uploaded', providerDocumentId: 'file-uploaded' });
  env.deleteProviderDocument = () => {};
  return env;
}

test('provider cleanup excludes orphan new upload; shared link remains indexable', () => {
  const c = fixture(); const row = c.pitchbookRows[0]; c.meetingRows[0].Related_Pitchbook_IDs = '';
  row.AI_Provider_State_JSON = JSON.stringify({ OPENAI: { status: 'Indexed', documentName: 'old', providerDocumentId: 'file-old', contentHash: 'old' } });
  const env = syncEnv(c); let uploads = 0; let deletes = 0;
  env.findProviderDocumentsBySource = () => [{ name: 'old' }];
  env.uploadProviderSource = () => { uploads++; throw new Error('must not upload orphan'); };
  env.deleteProviderDocument = () => { deletes++; };
  const result = ksp.kspRunProviderNeutralAiSync_(env, { sourceType: 'Pitchbook' });
  assert.equal(result.removed, 1); assert.equal(uploads, 0); assert.equal(deletes, 1);
  assert.equal(row.Status, 'Active'); assert.equal(row.File_ID, 'file-1');
  c.meetingRows.push({ Meeting_ID: 'MTG-000002', Status: 'Active', Related_Pitchbook_IDs: row.Document_ID });
  const env2 = syncEnv(c);
  assert.equal(ksp.kspRunProviderNeutralAiSync_(env2, { sourceType: 'Pitchbook' }).indexed, 1);
});

test('unlink during provider upload fails writeback closed, cleans new provider artifact, no stale state restoration', () => {
  const c = fixture(); const env = syncEnv(c); let cleanup = 0;
  env.uploadProviderSource = () => {
    c.meetingRows[0].Related_Pitchbook_IDs = '';
    c.pitchbookRows[0].AI_Index_Status = 'Pending';
    return { name: 'uploaded', providerDocumentId: 'file-uploaded' };
  };
  env.deleteProviderDocument = () => { cleanup++; };
  const result = ksp.kspRunProviderNeutralAiSync_(env, { sourceType: 'Pitchbook' });
  assert.equal(result.failed, 1); assert.equal(result.items[0].code, 'AI_SYNC_CONTEXT_CONFLICT');
  assert.equal(env._debug.patches.length, 0); assert.equal(cleanup, 1);
});

test('claim-stage context race prevents provider lookup; denied claim performs no work', () => {
  for (const denied of [false, true]) {
    const c = fixture(); const env = syncEnv(c); let lookups = 0;
    env.claimAiSource = () => { c.meetingRows[0].Status = 'Inactive'; return denied ? null : { token: 'claim' }; };
    env.findProviderDocumentsBySource = () => { lookups++; return []; };
    const result = ksp.kspRunProviderNeutralAiSync_(env, { sourceType: 'Pitchbook' });
    assert.equal(lookups, 0); assert.equal(env._debug.patches.length, 0);
    assert.equal(denied ? result.skippedClaims : result.failed, 1);
  }
});

test('terminal replay revalidates current source context without provider calls', () => {
  const c = fixture();
  c.pitchbookRows[0].Saved_Filename = 'nullable-null-review.txt';
  const result = { citations: [{ sourceType: 'Pitchbook', sourceId: 'DOC-000001' }], answer: 'synthetic answer' };
  const state = { result, sourceIdentity: ksp.kspKnowledgeResultSourceIdentity_(c, result) };
  const env = { loadAiContext: () => c };
  assert.equal(ksp.kspRevalidateKnowledgeReplay_(env, state).idempotentReplay, true);
  c.meetingRows[0].Related_Pitchbook_IDs = '';
  assert.throws(() => ksp.kspRevalidateKnowledgeReplay_(env, state), e => e.code === 'AI_QUERY_SOURCE_CHANGED');
});

test('live adapter validates snapshot and claim under lock; only AI cells written, physical Dates retained', () => {
  const api = loadAi();
  new vm.Script(fs.readFileSync(path.join(__dirname, '../src/162_AiLiveDataAdapters.gs'), 'utf8')).runInContext(api);
  const row = { Document_ID: 'DOC-000001', Parent_Meeting_ID: 'MTG-000001', Status: 'Active', Date: new Date('2026-09-01T15:00:00Z'), AI_Index_Status: 'Pending' };
  const meetings = [{ Meeting_ID: 'MTG-000001', Status: 'Active', Related_Pitchbook_IDs: 'DOC-000001' }];
  const writes = []; let held = false; let token = 'claim';
  const sheet = { getRange: (...args) => ({ setValue: value => { assert.equal(held, true); writes.push({ args, value }); } }) };
  const meetingSheet = {};
  api.LockService = { getScriptLock: () => ({ tryLock: () => { held = true; return true; }, releaseLock: () => { held = false; } }) };
  api.SpreadsheetApp = { openById: () => ({ getSheetByName: name => name === 'Meeting_Index' ? meetingSheet : sheet }) };
  api.kspReadHeadersFromSheet_ = () => Object.keys(row);
  api.kspReadObjectsFromSheet_ = target => target === meetingSheet ? meetings : [row];
  api.PropertiesService = { getScriptProperties: () => ({ getProperty: () => JSON.stringify({ token, claimedAt: new Date().toISOString() }) }) };
  const expected = { sourceType: 'Pitchbook', sourceId: row.Document_ID, claimToken: 'claim', snapshot: api.kspAiSyncSnapshot_(row, meetings) };
  const run = () => api.kspUpdateRowPatchLive_('synthetic', 'Pitchbook_Index', 'Document_ID', row.Document_ID, { AI_Index_Status: 'Indexed' }, expected);
  token = 'other'; assert.throws(run, e => e.code === 'AI_SYNC_CLAIM_CONFLICT'); assert.equal(writes.length, 0);
  token = 'claim'; meetings[0].Related_Pitchbook_IDs = ''; assert.throws(run, e => e.code === 'AI_SYNC_CONTEXT_CONFLICT'); assert.equal(writes.length, 0);
  meetings[0].Related_Pitchbook_IDs = 'DOC-000001'; run(); assert.equal(writes.length, 1);
  assert.equal(writes[0].args[1], Object.keys(row).indexOf('AI_Index_Status') + 1); assert.ok(row.Date instanceof Date);
  assert.equal(held, false);
});
