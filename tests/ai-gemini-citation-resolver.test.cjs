const { test, assert, fs, path, ksp, plain } = require('./ai-test-helpers.cjs');

const STORE = 'fileSearchStores/fixture-store';
const HASH = '8c84152b23eb1e0c6005bb75ddd6bca69cbccd38210d2508e376f6ae75cd14c9';
const FIXTURE = JSON.parse(fs.readFileSync(path.join(__dirname,
  '../docs/handoffs/0027-CODEX-04-sanitized-citation-shape.json'), 'utf8'));

function providerState(documentName, contentHash = HASH, storeName = STORE, status = 'Indexed') {
  return JSON.stringify({ stateVersion: 1, OPENAI: {}, GEMINI: {
    status, documentName, providerDocumentId: '', storeName, contentHash
  } });
}

function sourceRow(sourceType, sourceId, documentName, options = {}) {
  const common = {
    Date: '2026-09-05', Status: options.status || 'Active',
    AI_Provider_State_JSON: options.providerState === undefined
      ? providerState(documentName, options.providerHash || HASH, options.providerStore || STORE)
      : options.providerState
  };
  return sourceType === 'Meeting'
    ? { ...common, Meeting_ID: sourceId, Doc_URL: 'https://drive.test/fixture-meeting',
      Saved_Filename: options.filename || 'fixture-meeting' }
    : { ...common, Document_ID: sourceId, File_URL: 'https://drive.test/fixture-pitchbook',
      Saved_Filename: options.filename || 'fixture-source.txt' };
}

function providerDocument(sourceType, sourceId, contentHash = HASH, name) {
  return {
    name: name || `${STORE}/documents/${sourceType.toLowerCase()}-current`,
    state: 'STATE_ACTIVE',
    customMetadata: { source_type: sourceType, source_id: sourceId, content_hash: contentHash }
  };
}

function resolverEnvironment(documents, readback) {
  const listed = (documents || []).map(plain);
  return {
    findProviderDocumentsBySource() { return listed.map(plain); },
    readProviderDocument(provider, config, documentValue) {
      assert.equal(provider, 'GEMINI');
      assert.equal(config.storeName, STORE);
      return plain(readback || documentValue);
    }
  };
}

function mapsFor(sourceType, sourceId, document, options = {}) {
  const rows = [sourceRow(sourceType, sourceId, document.name, options)];
  return sourceType === 'Meeting'
    ? ksp.kspBuildAuthoritativeSourceMaps_(rows, [])
    : ksp.kspBuildAuthoritativeSourceMaps_([], rows);
}

function annotation(sourceType, sourceId, contentHash = HASH, overrides = {}) {
  const metadata = overrides.metadata || {
    source_type: sourceType, source_id: sourceId, content_hash: contentHash
  };
  return {
    type: overrides.type || 'file_citation',
    document_uri: overrides.documentUri === undefined ? STORE : overrides.documentUri,
    file_name: overrides.fileName || 'fixture-source.txt',
    source: overrides.source || 'Fictitious content excerpt that is not provider identity.',
    custom_metadata: metadata
  };
}

function resolveAnnotations(rawAnnotations, sourceType, sourceId, options = {}) {
  const document = options.document || providerDocument(sourceType, sourceId);
  const maps = options.maps || mapsFor(sourceType, sourceId, document, options.row || {});
  const citations = rawAnnotations.map((value) => ksp.kspNormalizeCitationAnnotation_(value)).filter(Boolean);
  return plain(ksp.kspResolveGeminiKnowledgeCitations_(citations, maps, {
    storeName: STORE,
    config: { provider: 'GEMINI', storeName: STORE },
    environment: options.environment || resolverEnvironment([document], document)
  }));
}

test('CODEX-05 recovered object-metadata shape reproduces legacy identity failure and resolves after strict readback', () => {
  const parsed = plain(ksp.kspParseInteractionResponse_(FIXTURE.response));
  const document = providerDocument('Pitchbook', 'SYNTHETIC-SOURCE-001', HASH,
    `${STORE}/documents/fictitious-independent-current`);
  assert.equal(parsed.citations.length, 3);
  assert.equal(parsed.citations[0].source, 'Synthetic evidence chunk.');
  assert.notEqual(parsed.citations[0].source, document.name);
  assert.equal(parsed.citations[0].documentUri, STORE);

  const resolved = plain(ksp.kspResolveGeminiKnowledgeCitations_(parsed.citations,
    mapsFor('Pitchbook', 'SYNTHETIC-SOURCE-001', document), {
      storeName: STORE, config: { provider: 'GEMINI', storeName: STORE },
      environment: resolverEnvironment([document], document)
    }));
  assert.equal(resolved.citations.length, 1);
  assert.equal(resolved.warnings.length, 0);
  assert.deepEqual(resolved.evidence, {
    rawCitationCount: 3,
    resolvedCitationCount: 1,
    returnedSourceCategory: 'CONTENT_TEXT',
    documentUriStoreMatched: true,
    metadataSourceTypeMatched: true,
    metadataSourceIdMatched: true,
    metadataContentHashMatched: true,
    authoritativeSourceActiveMatched: true,
    currentGeminiHashMatched: true,
    providerDocumentUniqueMatched: true,
    providerDocumentReadbackMatched: true,
    storedDocumentReferenceMatched: true
  });
  assert.doesNotMatch(JSON.stringify(resolved), /Synthetic evidence chunk|fileSearchStores\/|documents\//);
});

test('CODEX-05 supported array metadata applies the same identity contract to Meeting and Pitchbook', () => {
  for (const [sourceType, sourceId] of [['Meeting', 'MTG-FIXTURE-001'], ['Pitchbook', 'DOC-FIXTURE-001']]) {
    const arrayMetadata = [
      { key: 'source_type', string_value: sourceType },
      { key: 'source_id', string_value: sourceId },
      { key: 'content_hash', string_value: HASH }
    ];
    const resolved = resolveAnnotations([annotation(sourceType, sourceId, HASH, { metadata: arrayMetadata })],
      sourceType, sourceId);
    assert.equal(resolved.citations.length, 1);
    assert.equal(resolved.citations[0].sourceType, sourceType);
    assert.equal(resolved.citations[0].sourceId, sourceId);
    assert.equal(resolved.warnings.length, 0);
  }
});

test('CODEX-05 rejects wrong Store, missing or wrong identity, stale and inactive authoritative sources', () => {
  const sourceType = 'Pitchbook';
  const sourceId = 'DOC-FIXTURE-NEGATIVE';
  const document = providerDocument(sourceType, sourceId);
  const cases = [
    {
      name: 'wrong Store', annotations: [annotation(sourceType, sourceId, HASH, { documentUri: 'fileSearchStores/foreign' })],
      code: 'GEMINI_CITATION_STORE_MISMATCH'
    },
    {
      name: 'missing identity', annotations: [annotation(sourceType, sourceId, HASH, {
        metadata: { source_type: sourceType, source_id: sourceId }
      })], code: 'GEMINI_CITATION_IDENTITY_INVALID'
    },
    {
      name: 'wrong source', annotations: [annotation(sourceType, 'DOC-FOREIGN')],
      code: 'GEMINI_CITATION_SOURCE_NOT_FOUND'
    },
    {
      name: 'wrong type', annotations: [annotation('Meeting', sourceId)],
      code: 'GEMINI_CITATION_SOURCE_NOT_FOUND'
    },
    {
      name: 'wrong hash', annotations: [annotation(sourceType, sourceId, 'stale-hash')],
      code: 'GEMINI_CITATION_IDENTITY_STALE'
    },
    {
      name: 'stale Gemini state', annotations: [annotation(sourceType, sourceId)],
      row: { providerHash: 'older-authoritative-hash' }, code: 'GEMINI_CITATION_IDENTITY_STALE'
    },
    {
      name: 'inactive source', annotations: [annotation(sourceType, sourceId)],
      row: { status: 'Inactive' }, code: 'GEMINI_CITATION_SOURCE_INACTIVE'
    }
  ];
  for (const scenario of cases) {
    const result = resolveAnnotations(scenario.annotations, sourceType, sourceId, {
      document, maps: mapsFor(sourceType, sourceId, document, scenario.row || {})
    });
    assert.equal(result.citations.length, 0, scenario.name);
    assert.ok(result.warnings.some((item) => item.code === scenario.code), scenario.name);
  }
});

test('CODEX-05 independently rejects missing, ambiguous, conflicting, foreign and stale provider Documents', () => {
  const sourceType = 'Pitchbook';
  const sourceId = 'DOC-FIXTURE-DOCUMENT';
  const document = providerDocument(sourceType, sourceId);
  const conflicting = providerDocument(sourceType, sourceId, 'wrong-provider-hash', document.name);
  const foreign = providerDocument(sourceType, sourceId, HASH,
    'fileSearchStores/foreign/documents/foreign-current');
  const stale = { ...document, state: 'STATE_FAILED' };
  const duplicateMetadata = { ...document, rawCustomMetadata: [
    { key: 'source_type', string_value: sourceType },
    { key: 'source_id', string_value: sourceId },
    { key: 'content_hash', string_value: HASH },
    { key: 'content_hash', string_value: 'conflicting-provider-hash' }
  ] };
  const cases = [
    ['missing', resolverEnvironment([]), 'GEMINI_CITATION_DOCUMENT_NOT_FOUND'],
    ['ambiguous', resolverEnvironment([document, { ...document, name: `${STORE}/documents/duplicate` }]),
      'GEMINI_CITATION_DOCUMENT_AMBIGUOUS'],
    ['metadata conflict', resolverEnvironment([conflicting]), 'GEMINI_CITATION_DOCUMENT_CONFLICT'],
    ['foreign Store', resolverEnvironment([foreign]), 'GEMINI_CITATION_DOCUMENT_CONFLICT'],
    ['inactive Document', resolverEnvironment([stale]), 'GEMINI_CITATION_DOCUMENT_CONFLICT'],
    ['conflicting Document metadata', resolverEnvironment([duplicateMetadata]),
      'GEMINI_CITATION_DOCUMENT_CONFLICT'],
    ['readback mismatch', resolverEnvironment([document], conflicting), 'GEMINI_CITATION_DOCUMENT_CONFLICT']
  ];
  for (const [name, environment, code] of cases) {
    const result = resolveAnnotations([annotation(sourceType, sourceId)], sourceType, sourceId,
      { document, environment });
    assert.equal(result.citations.length, 0, name);
    assert.ok(result.warnings.some((item) => item.code === code), name);
  }

  const storedReferenceMismatch = resolveAnnotations([annotation(sourceType, sourceId)], sourceType, sourceId, {
    document,
    maps: mapsFor(sourceType, sourceId, document, {
      providerState: providerState(`${STORE}/documents/different-current`)
    })
  });
  assert.equal(storedReferenceMismatch.citations.length, 0);
  assert.ok(storedReferenceMismatch.warnings.some((item) =>
    item.code === 'GEMINI_CITATION_DOCUMENT_CONFLICT'));
});

test('CODEX-05 validates conflicts before deduplicating equivalent annotations', () => {
  const sourceType = 'Pitchbook';
  const sourceId = 'DOC-FIXTURE-CONFLICT';
  const valid = annotation(sourceType, sourceId);
  const duplicate = { ...valid, source: 'A second equivalent excerpt.' };
  const conflict = annotation(sourceType, sourceId, HASH, { metadata: [
    { key: 'source_type', string_value: sourceType },
    { key: 'source_id', string_value: sourceId },
    { key: 'content_hash', string_value: HASH },
    { key: 'content_hash', string_value: 'conflicting-hash' }
  ] });
  const validResult = resolveAnnotations([valid, duplicate], sourceType, sourceId);
  assert.equal(validResult.citations.length, 1);
  assert.equal(validResult.evidence.rawCitationCount, 2);
  const conflictResult = resolveAnnotations([valid, duplicate, conflict], sourceType, sourceId);
  assert.equal(conflictResult.citations.length, 0);
  assert.ok(conflictResult.warnings.some((item) => item.code === 'GEMINI_CITATION_METADATA_CONFLICT'));
});

test('CODEX-05 filename, answer token, excerpt hash and OpenAI-only state cannot establish Gemini identity', () => {
  const sourceType = 'Pitchbook';
  const sourceId = 'DOC-FIXTURE-NO-SHORTCUT';
  const document = providerDocument(sourceType, sourceId);
  const missingHash = annotation(sourceType, sourceId, HASH, {
    fileName: 'fixture-source.txt', source: document.name,
    metadata: { source_type: sourceType, source_id: sourceId }
  });
  const missingResult = resolveAnnotations([missingHash], sourceType, sourceId, { document });
  assert.equal(missingResult.citations.length, 0);

  const legacyDocumentIdentity = annotation(sourceType, sourceId, HASH, {
    source: document.name, documentUri: '', fileName: 'fixture-source.txt'
  });
  const noLegacyFallback = resolveAnnotations([legacyDocumentIdentity], sourceType, sourceId, { document });
  assert.equal(noLegacyFallback.citations.length, 0);
  assert.ok(noLegacyFallback.warnings.some((item) => item.code === 'GEMINI_CITATION_STORE_MISMATCH'));

  const openAiOnly = JSON.stringify({ stateVersion: 1,
    OPENAI: { status: 'Indexed', contentHash: HASH, documentName: 'openai-file-fictitious' },
    GEMINI: { status: 'Not Indexed', contentHash: '' }
  });
  const openAiOnlyResult = resolveAnnotations([annotation(sourceType, sourceId)], sourceType, sourceId, {
    document, maps: mapsFor(sourceType, sourceId, document, { providerState: openAiOnly })
  });
  assert.equal(openAiOnlyResult.citations.length, 0);
  assert.ok(openAiOnlyResult.warnings.some((item) => item.code === 'GEMINI_CITATION_IDENTITY_STALE'));

  const diagnostic = plain(ksp.kspGeminiEvaluateSyntheticQualificationResponse_({
    status: 'completed', steps: [{ type: 'model_output', content: [{
      type: 'text', text: 'EXPECTED_TOKEN', annotations: [missingHash]
    }] }]
  }, {
    transport: 'INTERACTIONS', modelId: 'gemini-3.7-flash', expectedToken: 'EXPECTED_TOKEN',
    source: { sourceType, sourceId, contentHash: HASH, savedFilename: 'fixture-source.txt' },
    document, storeName: STORE, config: { storeName: STORE },
    environment: resolverEnvironment([document], document),
    sourceMaps: mapsFor(sourceType, sourceId, document)
  }));
  assert.equal(diagnostic.expectedTokenPresent, true);
  assert.equal(diagnostic.classification, 'CITATION_IDENTITY_OR_METADATA_MISMATCH');
});

test('CODEX-05 qualification and normal completion share strict mapping without leaking excerpts or provider identities', () => {
  const sourceType = 'Pitchbook';
  const sourceId = 'DOC-FIXTURE-PARITY';
  const document = providerDocument(sourceType, sourceId);
  const row = sourceRow(sourceType, sourceId, document.name);
  const raw = {
    status: 'completed', steps: [{ type: 'model_output', content: [{
      type: 'text', text: 'EXPECTED_TOKEN grounded answer',
      annotations: [annotation(sourceType, sourceId, HASH, {
        source: 'PRIVATE_EXCERPT_MUST_NOT_ESCAPE', fileName: 'same-name.txt'
      })]
    }] }]
  };
  const environment = {
    ...resolverEnvironment([document], document),
    nowIso: () => '2026-09-05T00:00:00.000Z',
    appendAuditRow(id, auditRow) { this.audit = plain(auditRow); }
  };
  const sourceMaps = ksp.kspBuildAuthoritativeSourceMaps_([], [row]);
  const qualification = plain(ksp.kspGeminiEvaluateSyntheticQualificationResponse_(raw, {
    transport: 'INTERACTIONS', modelId: 'gemini-3.7-flash', expectedToken: 'EXPECTED_TOKEN',
    source: { sourceType, sourceId, contentHash: HASH, savedFilename: 'same-name.txt' },
    document, storeName: STORE, config: { storeName: STORE }, environment, sourceMaps
  }));
  assert.equal(qualification.classification, 'PASS');
  assert.equal(qualification.normalMappingParity, true);

  const normal = plain(ksp.kspBuildProviderKnowledgeSearchSuccess_(environment, 'GEMINI', {
    mode: '自由質問', questionOrInstruction: 'Synthetic question', filters: {}
  }, {
    provider: 'GEMINI', storeName: STORE, modelId: 'gemini-3.7-flash',
    modelProfileId: 'gemini-37-low', thinkingProfileId: 'low', queryTransport: 'INTERACTIONS'
  }, { meetingRows: [], pitchbookRows: [row], gpRows: [], optionRows: [], auditSpreadsheetId: 'audit-fixture' },
  'fixture-actor', raw, [], 'fixture-audit-token', {}));
  assert.equal(normal.result.citations.length, 1);
  assert.equal(normal.result.citations[0].sourceId, sourceId);
  assert.equal(normal.result.insufficientEvidence, false);
  const exported = JSON.stringify({ result: normal.result, audit: environment.audit,
    diagnostic: ksp.kspGeminiQualificationSafeDiagnostic_(qualification) });
  assert.doesNotMatch(exported, /PRIVATE_EXCERPT_MUST_NOT_ESCAPE|fileSearchStores\/|documents\/|credential/i);
});

test('CODEX-05 rejects unknown annotation types and malformed metadata containers without throwing', () => {
  assert.equal(ksp.kspNormalizeCitationAnnotation_({ source: 'text', custom_metadata: {} }), null);
  const malformed = ksp.kspNormalizeCitationAnnotation_({
    type: 'file_citation', document_uri: STORE, source: 'text', custom_metadata: 7
  });
  assert.equal(malformed.metadataIdentityValid, false);
  assert.equal(malformed.metadataIdentityComplete, false);
  const result = plain(ksp.kspResolveGeminiKnowledgeCitations_([malformed], { bySourceKey: {} }, {
    storeName: STORE, config: { storeName: STORE }, environment: {}
  }));
  assert.equal(result.citations.length, 0);
  assert.equal(result.warnings[0].code, 'GEMINI_CITATION_IDENTITY_INVALID');
});
