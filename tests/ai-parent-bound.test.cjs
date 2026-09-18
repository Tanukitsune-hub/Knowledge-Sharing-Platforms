const { test, assert, ksp, plain, baseContext, createSyncEnvironment } = require('./ai-test-helpers.cjs');

function fixture(type = 'LP_ASSET_OWNER') {
  const context = baseContext();
  Object.assign(context.pitchbookRows[0], {
    Parent_Meeting_ID: 'MTG-000001', Counterparty_Type: type,
    Counterparty_ID: type === 'GP' ? 'GP-1' : 'ENTITY-1', Related_GP_IDs: 'GP-1',
    GP_ID: type === 'GP' ? 'GP-1' : '', Saved_Filename: 'unrelated-name.txt'
  });
  context.meetingRows[0].Related_Pitchbook_IDs = 'DOC-000001';
  return context;
}

test('parent-bound eligibility requires exact active explicit link; legacy remains compatible', () => {
  const c = fixture(); const row = c.pitchbookRows[0]; const meeting = c.meetingRows[0];
  const eligible = () => ksp.kspIsParentBoundPitchbookEligible_(row, c.meetingRows);
  assert.equal(eligible(), true);
  meeting.Related_Pitchbook_IDs = 'DOC-0000010'; assert.equal(eligible(), false);
  meeting.Related_Pitchbook_IDs = 'DOC-000001'; meeting.Status = 'Inactive'; assert.equal(eligible(), false);
  c.meetingRows.push({ Meeting_ID: 'MTG-SHARED', Status: 'Active', Related_Pitchbook_IDs: 'DOC-OTHER, DOC-000001' });
  assert.equal(eligible(), true);
  row.Status = 'Inactive'; assert.equal(eligible(), false);
  row.Status = 'Active'; row.Parent_Meeting_ID = ''; assert.equal(ksp.kspIsParentBoundPitchbookEligible_(row, []), true);
  row.Parent_Meeting_ID = 'MTG-MISSING'; assert.equal(ksp.kspIsParentBoundPitchbookEligible_(row), false);
});

test('all six contexts reach provider metadata and strict canonical citation without filename inference', () => {
  for (const definition of ksp.KSP_COUNTERPARTY_TYPE_DEFINITIONS) {
    const c = fixture(definition.code); const row = c.pitchbookRows[0];
    const env = createSyncEnvironment({ context: c });
    const source = ksp.kspBuildAiSource_(env, { sourceType: 'Pitchbook', row }, ksp.kspBuildAiMasterMaps_(c.gpRows, c.optionRows));
    const attrs = plain(ksp.kspBuildOpenAiAttributes_(source));
    const gemini = plain(ksp.kspMetadataArrayToMap_(ksp.kspBuildAiCustomMetadata_(source)));
    assert.equal(attrs.entity_key, definition.code + ':' + row.Counterparty_ID);
    assert.equal(gemini.entity_key, attrs.entity_key);
    assert.equal(attrs.counterparty_id, row.Counterparty_ID);
    assert.equal(attrs.gp_id || '', definition.code === 'GP' ? 'GP-1' : '');
    row.AI_Provider_State_JSON = JSON.stringify({ OPENAI: {
      status: 'Indexed', providerDocumentId: 'file-synthetic', contentHash: source.contentHash
    } });
    const citation = { provenance: 'INLINE_CITATION', fileId: 'file-synthetic', metadata: attrs };
    const mapped = () => ksp.kspMapKnowledgeCitations_([citation], ksp.kspBuildAuthoritativeSourceMaps_(c.meetingRows, c.pitchbookRows));
    assert.equal(mapped().citations.length, 1);
    assert.equal(mapped().citations[0].entityKey, attrs.entity_key);
    citation.metadata = { ...attrs, entity_key: 'GP:WRONG' }; assert.equal(mapped().citations.length, 0);
    citation.metadata = attrs;
    c.meetingRows[0].Related_Pitchbook_IDs = ''; assert.equal(mapped().citations.length, 0);
    c.meetingRows.push({ Meeting_ID: 'MTG-SHARED', Status: 'Active', Related_Pitchbook_IDs: row.Document_ID });
    assert.equal(mapped().citations.length, 1);
    row.Status = 'Inactive'; assert.equal(mapped().citations.length, 0);
  }
});

test('source hash covers context while legacy content hash and shared origin context remain unchanged', () => {
  const c = fixture(); const row = c.pitchbookRows[0]; const env = createSyncEnvironment({ context: c });
  const maps = ksp.kspBuildAiMasterMaps_(c.gpRows, c.optionRows);
  const build = () => ksp.kspBuildAiSource_(env, { sourceType: 'Pitchbook', row }, maps);
  const before = build(); row.Counterparty_ID = 'ENTITY-2'; assert.notEqual(build().contentHash, before.contentHash);
  row.Counterparty_ID = 'ENTITY-1'; row.Saved_Filename = 'looks-like-GP.txt'; assert.equal(build().contentHash, before.contentHash);
  const ff = ksp.kspBuildFeatureFreezePitchbookSource_(row, maps, { bytes: [65] }, 'hash', ksp.kspGetAiFormatDefinition_('txt'));
  assert.equal(ff.entityKey, 'LP_ASSET_OWNER:ENTITY-1');
  row.Counterparty_ID = ''; assert.throws(build, error => error.code === 'AI_PARENT_SOURCE_CONTEXT_INVALID');
  row.Parent_Meeting_ID = ''; row.GP_ID = 'GP-1'; assert.equal(build().entityKey, 'GP:GP-1');
});

test('legacy and feature-freeze selectors clean orphan derived indexes without source/file mutation', () => {
  for (const run of [ksp.kspRunAiSync_, ksp.kspRunFeatureFreezeAiSync_]) {
    const c = fixture(); const row = c.pitchbookRows[0];
    c.meetingRows[0].Related_Pitchbook_IDs = ''; c.meetingRows[0].AI_Index_Status = 'Indexed'; c.meetingRows[0].AI_Document_Name = 'meeting-existing';
    const env = createSyncEnvironment({ context: c });
    assert.equal(run(env).selected, 0);
    row.AI_Document_Name = 'fileSearchStores/store-1/documents/orphan'; row.AI_Content_Hash = 'old';
    const report = run(env);
    assert.equal(report.removed, 1); assert.equal(env._debug.uploaded.length, 0);
    assert.equal(row.AI_Index_Status, 'NotIndexed'); assert.equal(row.File_ID, 'file-1'); assert.equal(row.Status, 'Active');
  }
});
