const { test, assert, ksp, plain } = require('./ai-test-helpers.cjs');

function response(code, body, headers = {}) {
  return {
    getResponseCode: () => code,
    getContentText: () => typeof body === 'string' ? body : JSON.stringify(body),
    getAllHeaders: () => headers
  };
}

function blob(bytes, mimeType, name) {
  const normalized = Array.from(bytes);
  return {
    getBytes: () => Array.from(normalized),
    getContentType: () => mimeType,
    getName: () => name
  };
}

function withGeminiFakes(fetch, callback) {
  const originalProperties = ksp.PropertiesService;
  const originalFetch = ksp.UrlFetchApp;
  const originalUtilities = ksp.Utilities;
  const sleeps = [];
  ksp.PropertiesService = {
    getScriptProperties: () => ({ getProperty: () => 'synthetic-key' })
  };
  ksp.UrlFetchApp = { fetch };
  ksp.Utilities = {
    ...originalUtilities,
    newBlob: (bytes, mimeType, name) => blob(bytes, mimeType, name),
    sleep: (millis) => sleeps.push(millis)
  };
  try {
    return callback(sleeps);
  } finally {
    if (originalProperties === undefined) delete ksp.PropertiesService;
    else ksp.PropertiesService = originalProperties;
    if (originalFetch === undefined) delete ksp.UrlFetchApp;
    else ksp.UrlFetchApp = originalFetch;
    ksp.Utilities = originalUtilities;
  }
}

function syntheticSource() {
  return {
    sourceType: 'Pitchbook',
    sourceId: 'KSP-WORK0027-SYNTHETIC',
    contentHash: 'synthetic-content-hash',
    dateKey: '2026-09-04',
    gpId: 'GP-SYNTHETIC',
    gpName: 'Synthetic GP',
    entityKey: 'GP:GP-SYNTHETIC',
    counterpartyType: 'GP',
    counterpartyId: 'GP-SYNTHETIC',
    counterpartyName: 'Synthetic GP',
    relatedGpIds: 'GP-SYNTHETIC',
    assetClassId: 'AC-SYNTHETIC',
    assetClassName: 'Synthetic Asset Class',
    capitalTypeId: 'CT-SYNTHETIC',
    capitalTypeName: 'Synthetic Capital',
    teamId: '',
    teamName: '',
    fundStrategy: '',
    meetingTypeCodes: '',
    relatedPitchbookIds: '',
    followUpRequired: false,
    driveUrl: '',
    savedFilename: 'work0027-synthetic.txt',
    displayName: 'work0027-synthetic.txt',
    mimeType: 'text/plain'
  };
}

function activeDocument(source) {
  return {
    name: 'fileSearchStores/store-synthetic/documents/doc-synthetic',
    displayName: source.displayName,
    state: 'STATE_ACTIVE',
    customMetadata: [
      { key: 'source_type', stringValue: source.sourceType },
      { key: 'source_id', stringValue: source.sourceId },
      { key: 'content_hash', stringValue: source.contentHash }
    ]
  };
}

function noOrdinaryContentLength(options) {
  return !Object.keys(options && options.headers || {})
    .some((name) => name.toLowerCase() === 'content-length');
}

test('Work 0027 splits authentication/permission from provider/transient failures', () => {
  const auth = plain(ksp.kspGeminiQualificationDiagnosticFromError_(
    Object.assign(new Error('must-not-escape'), {
      code: 'AI_GEMINI_CREDENTIAL_REJECTED', httpStatus: 401,
      providerErrorCodes: ['unauthenticated']
    }), 'INTERACTIONS', 'gemini-3.8-flash', 7
  ));
  const permission = plain(ksp.kspGeminiQualificationDiagnosticFromError_(
    Object.assign(new Error('must-not-escape'), {
      code: 'AI_QUERY_HTTP_FAILED', httpStatus: 403,
      providerErrorCodes: ['permission_denied']
    }), 'INTERACTIONS', 'gemini-3.8-flash', 8
  ));
  const transient = plain(ksp.kspGeminiQualificationDiagnosticFromError_(
    Object.assign(new Error('must-not-escape'), {
      code: 'AI_QUERY_HTTP_FAILED', httpStatus: 503,
      providerErrorCodes: ['unavailable']
    }), 'INTERACTIONS', 'gemini-3.8-flash', 9
  ));
  assert.equal(auth.classification, 'AUTHENTICATION_OR_PERMISSION_FAILURE');
  assert.equal(permission.classification, 'AUTHENTICATION_OR_PERMISSION_FAILURE');
  assert.equal(transient.classification, 'PROVIDER_OR_TRANSIENT_FAILURE');
  assert.doesNotMatch(JSON.stringify({ auth, permission, transient }), /must-not-escape/);
});

test('Work 0027 idempotent retries use the exact allowlist, three attempts, and 20s sleep budget', () => {
  for (const status of [408, 429, 500, 502, 503, 504]) {
    let calls = 0;
    withGeminiFakes(() => {
      calls += 1;
      return response(status, { error: { status: 'UNAVAILABLE', message: 'must-not-escape' } });
    }, (sleeps) => {
      assert.throws(() => ksp.kspGeminiJsonRequestLive_(
        'GET', '/fileSearchStores/store-synthetic', null,
        { retryPolicy: 'IDEMPOTENT', stage: 'STORE_READ', errorCode: 'AI_STORE_READ_FAILED' }
      ), (error) => {
        assert.equal(error.httpStatus, status);
        assert.equal(error.attempt, 3);
        assert.ok(error.cumulativeSleepMillis <= 20000);
        assert.doesNotMatch(error.message, /must-not-escape/);
        return true;
      });
      assert.equal(calls, 3);
      assert.equal(sleeps.length, 2);
      assert.ok(sleeps.reduce((total, value) => total + value, 0) <= 20000);
    });
  }

  for (const status of [400, 401, 403, 404]) {
    let calls = 0;
    withGeminiFakes(() => {
      calls += 1;
      return response(status, '{}');
    }, (sleeps) => {
      assert.throws(() => ksp.kspGeminiJsonRequestLive_(
        'GET', '/fileSearchStores/store-synthetic', null,
        { retryPolicy: 'IDEMPOTENT', stage: 'STORE_READ', errorCode: 'AI_STORE_READ_FAILED' }
      ));
      assert.equal(calls, 1);
      assert.deepEqual(sleeps, []);
    });
  }
});

test('Work 0027 valid Retry-After takes precedence and never crosses the cumulative sleep budget', () => {
  let calls = 0;
  withGeminiFakes(() => {
    calls += 1;
    if (calls === 1) return response(429, '{}', { 'Retry-After': '15' });
    return response(503, '{}', { 'Retry-After': '10' });
  }, (sleeps) => {
    assert.throws(() => ksp.kspGeminiJsonRequestLive_(
      'GET', '/fileSearchStores/store-synthetic', null,
      { retryPolicy: 'IDEMPOTENT', stage: 'STORE_READ', errorCode: 'AI_STORE_READ_FAILED' }
    ), (error) => {
      assert.equal(error.attempt, 2);
      assert.equal(error.cumulativeSleepMillis, 15000);
      return true;
    });
    assert.equal(calls, 2);
    assert.deepEqual(sleeps, [15000]);
  });
});

test('Work 0027 mutating create retries one explicit transient response but never an ambiguous network error', () => {
  let explicitCalls = 0;
  withGeminiFakes(() => {
    explicitCalls += 1;
    return explicitCalls === 1
      ? response(503, { error: { status: 'UNAVAILABLE' } })
      : response(200, { name: 'fileSearchStores/store-created' });
  }, (sleeps) => {
    const created = plain(ksp.kspGeminiJsonRequestLive_(
      'POST', '/fileSearchStores', { displayName: 'synthetic' },
      { retryPolicy: 'MUTATING_CREATE', stage: 'STORE_CREATE', errorCode: 'AI_STORE_CREATE_FAILED' }
    ));
    assert.equal(created.name, 'fileSearchStores/store-created');
    assert.equal(explicitCalls, 2);
    assert.equal(sleeps.length, 1);
  });

  let ambiguousCalls = 0;
  withGeminiFakes(() => {
    ambiguousCalls += 1;
    throw new Error('ambiguous transport outcome');
  }, (sleeps) => {
    assert.throws(() => ksp.kspGeminiJsonRequestLive_(
      'POST', '/interactions', { input: 'synthetic' },
      { retryPolicy: 'MUTATING_CREATE', stage: 'QUERY_HTTP', errorCode: 'AI_QUERY_HTTP_FAILED' }
    ), (error) => error.attempt === 1 && error.ambiguousTransport === true);
    assert.equal(ambiguousCalls, 1);
    assert.deepEqual(sleeps, []);
  });

  let identifiedCalls = 0;
  withGeminiFakes(() => {
    identifiedCalls += 1;
    return response(503, { name: 'fileSearchStores/provider-returned-identity' });
  }, (sleeps) => {
    assert.throws(() => ksp.kspGeminiJsonRequestLive_(
      'POST', '/fileSearchStores', { displayName: 'synthetic' },
      { retryPolicy: 'MUTATING_CREATE', stage: 'STORE_CREATE', errorCode: 'AI_STORE_CREATE_FAILED' }
    ), (error) => error.providerResourceIdentityPresent === true && error.attempt === 1);
    assert.equal(identifiedCalls, 1);
    assert.deepEqual(sleeps, []);
  });
});

test('Work 0027 rejects an ordinary Content-Length option before any Apps Script fetch', () => {
  let calls = 0;
  withGeminiFakes(() => {
    calls += 1;
    return response(200, {});
  }, () => {
    assert.throws(() => ksp.kspGeminiJsonRequestLive_(
      'GET', '/models', null,
      { retryPolicy: 'IDEMPOTENT', stage: 'MODELS_LIST',
        errorCode: 'AI_GEMINI_MODELS_LIST_FAILED', headers: { 'Content-Length': '0' } }
    ), (error) => error.code === 'AI_GEMINI_MODELS_LIST_FAILED' && error.retryable === false);
    assert.equal(calls, 0);
  });
});

test('Work 0027 upload queries an interrupted session and performs at most one safe finalize resume', () => {
  const source = syntheticSource();
  const bytes = [65, 66, 67];
  const calls = [];
  withGeminiFakes((url, options) => {
    calls.push({ url, options });
    if (calls.length === 1) {
      return response(200, '', { 'X-Goog-Upload-URL': 'https://upload.invalid/session' });
    }
    if (calls.length === 2) return response(503, { error: { status: 'UNAVAILABLE' } });
    if (calls.length === 3) {
      return response(200, '', {
        'X-Goog-Upload-Status': 'active',
        'X-Goog-Upload-Size-Received': '1'
      });
    }
    if (calls.length === 4) {
      return response(200, {
        name: 'fileSearchStores/store-synthetic/upload/operations/op-synthetic',
        done: true,
        response: { fileSearchDocument: activeDocument(source) }
      });
    }
    return response(200, activeDocument(source));
  }, (sleeps) => {
    const document = plain(ksp.kspGeminiUploadSourceLive_(
      'fileSearchStores/store-synthetic', source, bytes
    ));
    assert.equal(document.state, 'STATE_ACTIVE');
    assert.equal(calls.length, 5);
    assert.equal(calls[0].options.headers['X-Goog-Upload-Header-Content-Length'], '3');
    assert.ok(calls.every((call) => noOrdinaryContentLength(call.options)));
    assert.equal(calls[2].options.headers['X-Goog-Upload-Command'], 'query');
    assert.equal(calls[3].options.headers['X-Goog-Upload-Offset'], '1');
    assert.equal(calls[3].options.headers['X-Goog-Upload-Command'], 'upload, finalize');
    assert.deepEqual(calls[3].options.payload.getBytes(), [66, 67]);
    assert.equal(calls.filter((call) =>
      call.options.headers && call.options.headers['X-Goog-Upload-Command'] === 'upload, finalize'
    ).length, 2);
    assert.deepEqual(sleeps, []);
  });
});

function interaction(text, annotations = [], status = 'completed') {
  return {
    status,
    steps: [{ type: 'model_output', content: [{ type: 'text', text, annotations }] }]
  };
}

function generateContent(text, finishReason = 'STOP', withCandidate = true) {
  return withCandidate ? {
    candidates: [{ finishReason, content: { parts: [{ text }] }, groundingMetadata: { groundingChunks: [] } }]
  } : {};
}

function evaluate(raw, transport, expectedToken = 'WORK0027_EXPECTED_TOKEN') {
  const source = syntheticSource();
  const document = plain(ksp.kspNormalizeFileSearchDocument_(activeDocument(source)));
  return plain(ksp.kspGeminiEvaluateSyntheticQualificationResponse_(raw, {
    transport,
    modelId: 'gemini-3.8-flash',
    expectedToken,
    source,
    document
  }));
}

test('Work 0027 completed response classifications remain exact and mutually distinct', () => {
  const source = syntheticSource();
  const citation = {
    type: 'file_citation', source: activeDocument(source).name,
    custom_metadata: [
      { key: 'source_type', string_value: source.sourceType },
      { key: 'source_id', string_value: source.sourceId },
      { key: 'content_hash', string_value: source.contentHash }
    ]
  };
  assert.equal(evaluate({}, 'INTERACTIONS').classification, 'RESPONSE_SHAPE_OR_APPLICATION_FAILURE');
  assert.equal(evaluate({ status: 'completed', steps: [] }, 'INTERACTIONS').classification,
    'COMPLETED_EMPTY_RESPONSE');
  assert.equal(evaluate(interaction(''), 'INTERACTIONS').classification,
    'COMPLETED_NO_GROUNDED_ANSWER');
  assert.equal(evaluate(interaction('different text'), 'INTERACTIONS').classification,
    'COMPLETED_EXPECTED_TOKEN_MISMATCH');
  assert.equal(evaluate(interaction('WORK0027_EXPECTED_TOKEN'), 'INTERACTIONS').classification,
    'COMPLETED_NO_FILE_CITATION');
  assert.equal(evaluate(interaction('WORK0027_EXPECTED_TOKEN', [{
    ...citation,
    custom_metadata: citation.custom_metadata.map((item) => item.key === 'content_hash'
      ? { ...item, string_value: 'stale-hash' } : item)
  }]), 'INTERACTIONS').classification, 'CITATION_IDENTITY_OR_METADATA_MISMATCH');
  assert.equal(evaluate(interaction('WORK0027_EXPECTED_TOKEN', [citation]), 'INTERACTIONS').classification, 'PASS');
  assert.equal(evaluate(generateContent('', 'SAFETY'), 'GENERATE_CONTENT').classification,
    'COMPLETED_FINISH_OR_SAFETY_LIMIT');
  assert.equal(evaluate(generateContent('different text'), 'GENERATE_CONTENT').classification,
    'COMPLETED_EXPECTED_TOKEN_MISMATCH');
  assert.equal(evaluate({ candidates: [{ finishReason: 'STOP', content: { parts: [] } }] },
    'GENERATE_CONTENT').classification,
    'COMPLETED_EMPTY_RESPONSE');
  assert.equal(evaluate(generateContent('', 'STOP', false), 'GENERATE_CONTENT').classification,
    'RESPONSE_SHAPE_OR_APPLICATION_FAILURE');
});

test('Work 0027 safe diagnostic is a strict allowlist and never leaks raw provider material', () => {
  const diagnostic = plain(ksp.kspGeminiQualificationSafeDiagnostic_({
    classification: 'PROVIDER_OR_TRANSIENT_FAILURE',
    transport: 'INTERACTIONS',
    modelId: 'gemini-3.8-flash',
    httpStatus: 503,
    providerErrorCodes: ['unavailable', 'not-allowlisted'],
    attempt: 2,
    retryCount: 1,
    cumulativeSleepMillis: 1234,
    latencyMs: 77,
    correlationHash: 'a'.repeat(64),
    rawResponse: 'secret response',
    apiKey: 'secret key',
    prompt: 'secret prompt',
    sourceBody: 'secret source',
    storeName: 'fileSearchStores/secret',
    documentName: 'fileSearchStores/secret/documents/secret',
    privateUrl: 'https://example.invalid/private'
  }));
  assert.equal(diagnostic.classification, 'PROVIDER_OR_TRANSIENT_FAILURE');
  assert.equal(diagnostic.attempt, 2);
  assert.equal(diagnostic.retryCount, 1);
  assert.equal(diagnostic.cumulativeSleepMillis, 1234);
  assert.equal(diagnostic.correlationHash, 'a'.repeat(64));
  assert.deepEqual(diagnostic.providerErrorCodes, ['unavailable']);
  const serialized = JSON.stringify(diagnostic);
  for (const forbidden of ['secret response', 'secret key', 'secret prompt', 'secret source',
    'fileSearchStores/secret', 'documents/secret', 'example.invalid']) {
    assert.doesNotMatch(serialized, new RegExp(forbidden.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  }
});

function e2eProfile() {
  return {
    profileId: 'gemini-38-low',
    provider: 'GEMINI',
    modelId: 'gemini-3.8-flash',
    displayName: 'Gemini 3.8 Flash',
    family: 'Gemini 3.8',
    enabled: true,
    userVisible: true,
    isProviderDefault: true,
    maxOutputTokens: 2048,
    defaultThinkingProfileId: 'low',
    thinkingProfiles: [{
      thinkingProfileId: 'low', label: 'Low', rawValue: 'low',
      providerDefault: false, enabled: true
    }]
  };
}

function makeE2eEnvironment(options = {}) {
  const profile = e2eProfile();
  const policy = plain(ksp.kspNormalizeAiModelPolicy_({
    schemaVersion: 1,
    updatedAt: '2026-09-04T00:00:00.000Z',
    profiles: [profile]
  }));
  const context = {
    state: { config: { adminEmails: ['admin@example.com'] }, resources: {} },
    backendSpreadsheetId: 'backend-synthetic',
    auditSpreadsheetId: 'audit-synthetic',
    settings: {
      GEMINI_ENABLED: 'false',
      GEMINI_DEFAULT_MODEL: 'gemini-3.8-flash',
      GEMINI_READINESS: 'READY_FOR_QUALIFICATION',
      AI_MODEL_POLICY_JSON: JSON.stringify(policy)
    },
    meetingRows: [], pitchbookRows: [], gpRows: [], optionRows: []
  };
  const calls = [];
  const writes = [];
  const audits = [];
  let source;
  let document;
  const env = {
    nowIso() { return '2026-09-04T01:02:03.000Z'; },
    hashText(value) {
      return ksp.kspAiHashTextFallback_(value).split('-')[0].repeat(8);
    },
    loadAiContext() { return context; },
    ensureAiSettings() {},
    isAdministrator() { return true; },
    isGeminiCredentialConfigured() { return true; },
    getActor() { return 'admin@example.com'; },
    writeAiSetting(key, value) {
      writes.push({ key, value: String(value) });
      context.settings[key] = String(value);
    },
    appendAuditRow(id, row) { audits.push({ id, row: plain(row) }); },
    listGeminiModels() {
      calls.push('MODELS_VISIBILITY');
      return { models: [{ name: 'models/gemini-3.8-flash' }] };
    },
    queryGeminiInteraction(request) {
      calls.push('SHORT_INTERACTIONS');
      const token = request.input.match(/KSP27_SHORT_[A-F0-9]+/)[0];
      return interaction(token);
    },
    createFileSearchStore() {
      calls.push('TEMP_STORE_CREATE');
      if (options.createError) throw options.createError;
      return { name: 'fileSearchStores/work0027-temporary' };
    },
    uploadSourceToFileSearchStore(storeName, value) {
      calls.push('SYNTHETIC_UPLOAD_INDEX_READBACK');
      source = plain(value);
      document = {
        name: `${storeName}/documents/synthetic`,
        state: 'ACTIVE',
        customMetadata: {
          source_type: source.sourceType,
          source_id: source.sourceId,
          content_hash: source.contentHash
        }
      };
      return plain(document);
    },
    findFileSearchDocumentsBySource() { return document ? [plain(document)] : []; },
    queryProvider(provider, config, request) {
      calls.push('FILE_SEARCH_QUERY');
      assert.equal(provider, 'GEMINI');
      assert.equal(config.modelId, 'gemini-3.8-flash');
      assert.equal(config.thinkingRawValue, 'low');
      assert.equal(config.maxOutputTokens, 2048);
      assert.match(request.metadataFilter, new RegExp(`source_id = "${source.sourceId}"`));
      if (options.queryError) throw options.queryError;
      const token = source.text.match(/KSP27_[A-F0-9]+/)[0];
      return interaction(token, [{
        type: 'file_citation', source: document.name,
        custom_metadata: [
          { key: 'source_type', string_value: source.sourceType },
          { key: 'source_id', string_value: source.sourceId },
          { key: 'content_hash', string_value: source.contentHash }
        ]
      }]);
    },
    deleteFileSearchStore() {
      calls.push('TEMP_STORE_DELETE');
      if (options.deleteError) throw options.deleteError;
      return true;
    },
    confirmFileSearchStoreDeleted() {
      calls.push('CLEANUP_CONFIRMATION');
      return options.cleanupConfirmed !== false;
    },
    _debug: { context, calls, writes, audits, profile }
  };
  return env;
}

test('Work 0027 administrator qualification runs one isolated E2E and returns only safe evidence', () => {
  const env = makeE2eEnvironment();
  const result = plain(ksp.kspMutateAiProviderSettings_(env, {
    action: 'QUALIFY_MODEL_PROFILE', profileId: 'gemini-38-low', thinkingProfileId: 'low'
  }));
  assert.equal(result.ok, true, JSON.stringify({ result, calls: env._debug.calls, writes: env._debug.writes }));
  assert.equal(result.workId, '0027');
  assert.equal(result.terminalOutcome, 'QUALIFIED_DISABLED');
  assert.deepEqual(env._debug.calls, [
    'MODELS_VISIBILITY', 'SHORT_INTERACTIONS', 'TEMP_STORE_CREATE',
    'SYNTHETIC_UPLOAD_INDEX_READBACK', 'FILE_SEARCH_QUERY',
    'TEMP_STORE_DELETE', 'CLEANUP_CONFIRMATION'
  ]);
  assert.equal(result.qualification.evidence.cleanupConfirmed, true);
  assert.equal(result.qualification.evidence.temporaryDocumentVerified, true);
  assert.equal(result.qualification.evidence.duplicateCurrentDocumentCount, 1);
  assert.equal(env._debug.audits.length, 1);
  assert.equal(env._debug.context.settings.GEMINI_ENABLED, 'false');
  assert.equal(env._debug.context.settings.GEMINI_READINESS, 'QUALIFIED_DISABLED');
  const serialized = JSON.stringify(result);
  assert.doesNotMatch(serialized, /fileSearchStores\//);
  assert.doesNotMatch(serialized, /documents\//);
  assert.doesNotMatch(serialized, /Synthetic Gemini File Search qualification token/);
  assert.doesNotMatch(serialized, /KSP27_[A-F0-9]+/);
});

test('Work 0027 exhausted transient evidence remains distinct and cleanup-confirmed', () => {
  const transient = Object.assign(new Error('must-not-escape'), {
    code: 'AI_QUERY_HTTP_FAILED', stage: 'QUERY_HTTP', httpStatus: 503,
    retryable: true, attempt: 2, retryCount: 1, cumulativeSleepMillis: 500,
    providerErrorCodes: ['unavailable']
  });
  const env = makeE2eEnvironment({ queryError: transient });
  const result = plain(ksp.kspMutateAiProviderSettings_(env, {
    action: 'QUALIFY_MODEL_PROFILE', profileId: 'gemini-38-low', thinkingProfileId: 'low'
  }));
  assert.equal(result.ok, false);
  assert.equal(result.workId, '0027');
  assert.equal(result.terminalOutcome, 'DISABLED_TRANSIENT_PROVIDER_LIMITATION');
  assert.equal(result.qualificationEvidence.cleanupConfirmed, true);
  assert.equal(result.qualificationEvidence.stages.FILE_SEARCH_QUERY.diagnostic.classification,
    'PROVIDER_OR_TRANSIENT_FAILURE');
  assert.equal(result.qualificationEvidence.stages.FILE_SEARCH_QUERY.diagnostic.attempt, 2);
  assert.equal(env._debug.context.settings.GEMINI_READINESS,
    'DISABLED_TRANSIENT_PROVIDER_LIMITATION');
  assert.doesNotMatch(JSON.stringify(result), /must-not-escape|fileSearchStores\//);
});

test('Work 0027 cleanup uncertainty overrides an otherwise successful E2E', () => {
  const env = makeE2eEnvironment({ cleanupConfirmed: false });
  const result = plain(ksp.kspMutateAiProviderSettings_(env, {
    action: 'QUALIFY_MODEL_PROFILE', profileId: 'gemini-38-low', thinkingProfileId: 'low'
  }));
  assert.equal(result.ok, false);
  assert.equal(result.terminalOutcome, 'BLOCKED_RESOURCE_CLEANUP');
  assert.equal(result.qualificationEvidence.cleanupAttempted, true);
  assert.equal(result.qualificationEvidence.cleanupConfirmed, false);
  assert.equal(env._debug.context.settings.GEMINI_READINESS, 'BLOCKED_RESOURCE_CLEANUP');
});
