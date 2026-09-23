const { test, assert, ksp, baseContext, createSyncEnvironment, plain } = require('./ai-test-helpers.cjs');

function citation(sourceType = 'Meeting') {
  return { sourceType, sourceId: sourceType === 'Meeting' ? 'MTG-000001' : 'DOC-000001' };
}

function unavailable(error) {
  assert.equal(error.code, 'AI_CITED_SOURCE_UNAVAILABLE');
  assert.equal(error.queryTerminal, true);
  const result = plain(ksp.kspKnowledgeQueryFailureResult_('GEMINI', '自由質問', error, [], false, ''));
  assert.equal(result.ok, false);
  assert.match(result.error.message, /参照元のファイル/);
  assert.match(result.error.message, /対象ID: (?:MTG|DOC)-000001/);
  assert.doesNotMatch(JSON.stringify(result), /doc-1|file-1|drive\.test/);
  return true;
}

test('healthy cited Meeting and Pitchbook validate by registered file ID with no mutation', () => {
  const calls = [];
  const env = createSyncEnvironment({ getDriveFileMetadata(id) {
    calls.push(id);
    return { id, mimeType: id === 'doc-1' ? 'application/vnd.google-apps.document' : 'text/plain',
      parents: [id === 'doc-1' ? 'meeting-folder' : 'pitchbook-folder'], trashed: false };
  }});
  const context = env.loadAiContext();
  ksp.kspValidateCitedDriveSources_(env, context, [citation(), citation(), citation('Pitchbook')]);
  assert.deepEqual(calls, ['doc-1', 'file-1']);
  assert.deepEqual(env._debug.patches, []);
  assert.deepEqual(env._debug.deleted, []);
  assert.deepEqual(env._debug.audits, []);
});

for (const sourceType of ['Meeting', 'Pitchbook']) {
  test(`${sourceType} cited original missing or inaccessible returns bounded safe failure`, () => {
    const env = createSyncEnvironment({ getDriveFileMetadata() { throw new Error('Private file ID unavailable'); } });
    assert.throws(() => ksp.kspValidateCitedDriveSources_(env, env.loadAiContext(), [citation(sourceType)]), unavailable);
    assert.deepEqual(env._debug.patches, []);
    assert.deepEqual(env._debug.deleted, []);
  });
  test(`${sourceType} cited original trashed or wrong ID fails`, () => {
    for (const metadata of [{ id: 'different', trashed: false }, { id: sourceType === 'Meeting' ? 'doc-1' : 'file-1', trashed: true }]) {
      const env = createSyncEnvironment({ getDriveFileMetadata() { return metadata; } });
      assert.throws(() => ksp.kspValidateCitedDriveSources_(env, env.loadAiContext(), [citation(sourceType)]), unavailable);
    }
  });
  test(`${sourceType} registered ID missing fails without metadata call`, () => {
    let calls = 0;
    const context = baseContext();
    if (sourceType === 'Meeting') context.meetingRows[0].Doc_File_ID = '';
    else context.pitchbookRows[0].File_ID = '';
    const env = { getDriveFileMetadata() { calls++; } };
    assert.throws(() => ksp.kspValidateCitedDriveSources_(env, context, [citation(sourceType)]), unavailable);
    assert.equal(calls, 0);
  });
}

test('wrong Meeting MIME or wrong registered folder fails', () => {
  for (const metadata of [
    { id: 'doc-1', mimeType: 'text/plain', parents: ['meeting-folder'], trashed: false },
    { id: 'doc-1', mimeType: 'application/vnd.google-apps.document', parents: ['other-folder'], trashed: false }
  ]) {
    const env = createSyncEnvironment({ getDriveFileMetadata() { return metadata; } });
    assert.throws(() => ksp.kspValidateCitedDriveSources_(env, env.loadAiContext(), [citation()]), unavailable);
  }
});

test('uncited corpus is never preflighted', () => {
  const context = baseContext();
  context.meetingRows.push({ ...context.meetingRows[0], Meeting_ID: 'MTG-UNRELATED', Doc_File_ID: 'unrelated' });
  let calls = 0;
  const env = createSyncEnvironment({ context, getDriveFileMetadata(id) {
    calls++;
    assert.equal(id, 'doc-1');
    return { id, mimeType: 'application/vnd.google-apps.document', parents: ['meeting-folder'], trashed: false };
  }});
  ksp.kspValidateCitedDriveSources_(env, env.loadAiContext(), [citation()]);
  assert.equal(calls, 1);
  ksp.kspValidateCitedDriveSources_(env, env.loadAiContext(), []);
  assert.equal(calls, 1);
});

test('terminal replay rejects a source deleted after original answer', () => {
  let available = true;
  const env = createSyncEnvironment({ getDriveFileMetadata(id) {
    if (!available) throw new Error('Deleted');
    return { id, mimeType: 'application/vnd.google-apps.document', parents: ['meeting-folder'], trashed: false };
  }});
  const result = { ok: true, answer: 'Synthetic answer', citations: [citation()] };
  const state = { result, sourceIdentity: ksp.kspKnowledgeResultSourceIdentity_(env.loadAiContext(), result) };
  assert.equal(ksp.kspRevalidateKnowledgeReplay_(env, state).idempotentReplay, true);
  available = false;
  assert.throws(() => ksp.kspRevalidateKnowledgeReplay_(env, state), unavailable);
});

test('provider completion rejects a missing cited Pitchbook before success audit or result', () => {
  const env = createSyncEnvironment({ getDriveFileMetadata() { throw new Error('Deleted'); } });
  const raw = { candidates: [{ finishReason: 'STOP', content: { parts: [{ text: 'SHOULD_NOT_REACH_CLIENT' }] },
    groundingMetadata: { groundingChunks: [{ retrievedContext: {
      title: 'synthetic-pitchbook.txt', pageNumber: 1,
      customMetadata: [{ key: 'source_type', stringValue: 'Pitchbook' },
        { key: 'source_id', stringValue: 'DOC-000001' }]
    }}] }}] };
  assert.throws(() => ksp.kspBuildProviderKnowledgeSearchSuccess_(env, 'GEMINI',
    { mode: '自由質問', questionOrInstruction: 'synthetic' },
    { modelId: 'synthetic', queryTransport: 'GENERATE_CONTENT' }, env.loadAiContext(),
    'synthetic-actor', raw, [], 'synthetic-token', {}), unavailable);
  assert.deepEqual(env._debug.audits, []);
  assert.deepEqual(env._debug.patches, []);
  assert.deepEqual(env._debug.deleted, []);
});
