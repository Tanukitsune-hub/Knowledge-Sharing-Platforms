const { test, assert, ksp, plain, createSyncEnvironment } = require('./ai-test-helpers.cjs');

function response(code, body, headers = {}) {
  return {
    getResponseCode: () => code,
    getContentText: () => typeof body === 'string' ? body : JSON.stringify(body),
    getAllHeaders: () => headers
  };
}

function syntheticBlob(bytes, mimeType, name) {
  const values = Array.from(bytes);
  return {
    getBytes: () => Array.from(values),
    getContentType: () => mimeType,
    getName: () => name
  };
}

function defaultRequestProjection(url, options) {
  return {
    url,
    method: options.method,
    contentType: options.contentType,
    headers: { ...(options.headers || {}) },
    payload: Array.isArray(options.payload) ? options.payload.slice() : options.payload
  };
}

function withLiveFakes(
  fetch,
  callback,
  getRequest = defaultRequestProjection,
  newBlob = (bytes, mimeType, name) => syntheticBlob(bytes, mimeType, name)
) {
  const originalProperties = ksp.PropertiesService;
  const originalFetch = ksp.UrlFetchApp;
  const originalUtilities = ksp.Utilities;
  const sleeps = [];
  ksp.PropertiesService = { getScriptProperties: () => ({ getProperty: () => 'synthetic-gemini-key' }) };
  ksp.UrlFetchApp = { fetch, getRequest };
  ksp.Utilities = {
    ...originalUtilities,
    newBlob,
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

function meetingSource() {
  return {
    sourceType: 'Meeting',
    sourceId: 'MTG-SYNTHETIC-1',
    dateKey: '2026-08-29',
    gpId: 'GP-SYNTHETIC-1',
    gpName: 'Synthetic GP',
    entityKey: 'GP:GP-SYNTHETIC-1',
    counterpartyType: 'GP',
    counterpartyId: 'GP-SYNTHETIC-1',
    counterpartyName: 'Synthetic GP',
    relatedGpIds: 'GP-SYNTHETIC-1',
    assetClassId: 'AC-SYNTHETIC-1',
    assetClassName: 'Synthetic Asset Class',
    capitalTypeId: 'CT-SYNTHETIC-1',
    capitalTypeName: 'Synthetic Capital',
    teamId: 'TEAM-SYNTHETIC-1',
    teamName: 'Synthetic Team',
    fundStrategy: 'Synthetic Strategy',
    meetingTypeCodes: 'ANNUAL_REVIEW,OFFICE_VISIT',
    relatedPitchbookIds: 'DOC-SYNTHETIC-1',
    followUpRequired: true,
    driveUrl: 'https://drive.invalid/synthetic-meeting',
    savedFilename: 'synthetic-meeting',
    contentHash: 'synthetic-content-hash',
    displayName: 'synthetic-meeting.txt',
    mimeType: 'text/plain'
  };
}

function activeDocument(source) {
  return {
    name: 'fileSearchStores/store-synthetic/documents/doc-synthetic-1',
    displayName: source.displayName,
    state: 'STATE_ACTIVE',
    customMetadata: [
      { key: 'source_type', stringValue: source.sourceType },
      { key: 'source_id', stringValue: source.sourceId },
      { key: 'content_hash', stringValue: source.contentHash }
    ]
  };
}

test('Gemini upload uses the official resumable contract and verifies the active Document readback', () => {
  const source = meetingSource();
  const calls = [];
  const projections = [];
  const result = withLiveFakes((url, options) => {
    calls.push({ url, options });
    if (calls.length === 1) return response(200, '', { 'x-goog-upload-url': 'https://upload.invalid/synthetic' });
    if (calls.length === 2) return response(200, {
      name: 'fileSearchStores/store-synthetic/upload/operations/op-synthetic',
      done: false
    });
    if (calls.length === 3) return response(200, {
      name: 'fileSearchStores/store-synthetic/upload/operations/op-synthetic',
      done: true,
      response: { fileSearchDocument: activeDocument(source) }
    });
    return response(200, activeDocument(source));
  }, (sleeps) => {
    const document = plain(ksp.kspGeminiUploadSourceLive_('fileSearchStores/store-synthetic', source, [65, 0, 255]));
    assert.equal(document.state, 'STATE_ACTIVE');
    assert.equal(document.customMetadata.source_id, source.sourceId);
    assert.equal(document.customMetadata.source_type, source.sourceType);
    assert.equal(calls.length, 4);
    assert.deepEqual(sleeps, [1500]);
    return document;
  }, (url, options) => {
    const projection = defaultRequestProjection(url, options);
    projection.headers['Content-Length'] = '3';
    projection.payload = 'runtime-derived-payload';
    projections.push({ url, options, projection });
    return projection;
  });
  const start = calls[0];
  assert.match(start.url, /\/upload\/v1beta\/fileSearchStores\/store-synthetic:uploadToFileSearchStore\?key=synthetic-gemini-key$/);
  assert.equal(start.options.headers['X-Goog-Upload-Protocol'], 'resumable');
  assert.equal(start.options.headers['X-Goog-Upload-Command'], 'start');
  assert.equal(start.options.headers['X-Goog-Upload-Header-Content-Length'], '3');
  assert.equal(start.options.headers['X-Goog-Upload-Header-Content-Type'], 'text/plain');
  const startBody = JSON.parse(start.options.payload);
  assert.equal(startBody.displayName, source.displayName);
  assert.ok(startBody.customMetadata.length <= 20);
  assert.equal(startBody.customMetadata.find((item) => item.key === 'source_type').stringValue, source.sourceType);
  assert.equal(startBody.customMetadata.find((item) => item.key === 'source_id').stringValue, source.sourceId);

  const finalize = calls[1];
  assert.equal(finalize.url, 'https://upload.invalid/synthetic');
  assert.equal(finalize.options.contentType, 'text/plain');
  assert.equal(Object.keys(finalize.options.headers).some((key) => key.toLowerCase() === 'content-length'), false);
  assert.equal(finalize.options.headers['X-Goog-Upload-Offset'], '0');
  assert.equal(finalize.options.headers['X-Goog-Upload-Command'], 'upload, finalize');
  assert.deepEqual(finalize.options.payload, [65, 0, -1]);
  assert.equal(projections.length, 1);
  assert.equal(projections[0].url, 'https://upload.invalid/synthetic');
  assert.equal(projections[0].options.method, 'post');
  assert.equal(projections[0].options.contentType, 'text/plain');
  assert.deepEqual(projections[0].options.payload, [65, 0, -1]);
  assert.equal(projections[0].projection.payload, 'runtime-derived-payload');
  assert.equal(result.customMetadata.content_hash, source.contentHash);
});

test('Blob candidate is selected when Byte[] projection is rejected', () => {
  const source = meetingSource();
  const calls = [];
  const projections = [];
  const result = withLiveFakes((url, options) => {
    calls.push({ url, options });
    if (calls.length === 1) return response(200, '', { 'X-Goog-Upload-URL': 'https://upload.invalid/synthetic' });
    if (calls.length === 2) return response(200, {
      name: 'fileSearchStores/store-synthetic/upload/operations/op-synthetic',
      done: true,
      response: { fileSearchDocument: activeDocument(source) }
    });
    return response(200, activeDocument(source));
  }, () => {
    const document = plain(ksp.kspGeminiUploadSourceLive_('fileSearchStores/store-synthetic', source, [65, 0, 255]));
    assert.equal(document.state, 'STATE_ACTIVE');
    assert.equal(projections.length, 2);
    assert.equal(Array.isArray(projections[0].options.payload), true);
    assert.equal(typeof projections[1].options.payload.getBytes, 'function');
    assert.deepEqual(projections[1].options.payload.getBytes(), [65, 0, -1]);
    assert.equal(projections[1].options.payload.getContentType(), source.mimeType);
    assert.equal(calls.length, 3);
    return document;
  }, (url, options) => {
    projections.push({ url, options });
    if (Array.isArray(options.payload)) throw new Error('SYNTHETIC_BYTE_ARRAY_PROJECTION_REJECTED');
    return defaultRequestProjection(url, options);
  });
  assert.equal(result.customMetadata.source_id, source.sourceId);
  assert.equal(Array.isArray(calls[1].options.payload), false);
  assert.deepEqual(calls[1].options.payload.getBytes(), [65, 0, -1]);
  assert.equal(Object.keys(calls[1].options.headers).some((key) => key.toLowerCase() === 'content-length'), false);
  assert.equal(calls[1].options.contentType, source.mimeType);
});

test('Blob candidate is selected when Byte[] construction fails and the Blob preserves bytes and MIME', () => {
  let selected;
  const originalSlice = Array.prototype.slice;
  try {
    Array.prototype.slice = () => { throw new Error('SYNTHETIC_BYTE_ARRAY_CONSTRUCTION_REJECTED'); };
    selected = withLiveFakes(() => response(200, '{}'), () => ksp.kspGeminiSelectFinalizeRequest_(
      'https://upload.invalid/synthetic',
      { mimeType: 'text/plain', displayName: 'synthetic.txt' },
      [65, 0, -1]
    ));
  } finally {
    Array.prototype.slice = originalSlice;
  }
  assert.equal(typeof selected.payload.getBytes, 'function');
  assert.deepEqual(selected.payload.getBytes(), [65, 0, -1]);
  assert.equal(selected.payload.getContentType(), 'text/plain');
  assert.equal(selected.headers['X-Goog-Upload-Offset'], '0');
  assert.equal(selected.headers['X-Goog-Upload-Command'], 'upload, finalize');
});

test('invalid Blob bytes or MIME are rejected before Blob request projection', () => {
  for (const badBlob of [
    (bytes, mimeType, name) => syntheticBlob([65, 1, -1], mimeType, name),
    (bytes, mimeType, name) => syntheticBlob(bytes, 'application/octet-stream', name)
  ]) {
    let projectionCalls = 0;
    const error = withLiveFakes(() => response(200, '{}'), () => {
      try {
        ksp.kspGeminiSelectFinalizeRequest_(
          'https://upload.invalid/synthetic',
          { mimeType: 'text/plain', displayName: 'synthetic.txt' },
          [65, 0, -1]
        );
      } catch (value) {
        return value;
      }
      return null;
    }, (url, options) => {
      projectionCalls += 1;
      if (Array.isArray(options.payload)) throw new Error('SYNTHETIC_BYTE_ARRAY_PROJECTION_REJECTED');
      return defaultRequestProjection(url, options);
    }, badBlob);
    assert.equal(projectionCalls, 1);
    assert.equal(error.code, 'AI_UPLOAD_FINALIZE_CLIENT_UNSUPPORTED');
    assert.equal(error.stage, 'UPLOAD_FINALIZE_CLIENT');
  }
});

test('missing projected payload rejects both candidates without a live finalize request', () => {
  let projectionCalls = 0;
  const error = withLiveFakes(() => response(200, '{}'), () => {
    try {
      ksp.kspGeminiSelectFinalizeRequest_(
        'https://upload.invalid/synthetic',
        { mimeType: 'text/plain', displayName: 'synthetic.txt' },
        [65]
      );
    } catch (value) {
      return value;
    }
    return null;
  }, () => {
    projectionCalls += 1;
    return {
      method: 'post',
      contentType: 'text/plain',
      headers: {
        'X-Goog-Upload-Offset': '0',
        'X-Goog-Upload-Command': 'upload, finalize'
      }
    };
  });
  assert.equal(projectionCalls, 2);
  assert.equal(error.code, 'AI_UPLOAD_FINALIZE_CLIENT_UNSUPPORTED');
  assert.equal(error.retryable, false);
});

test('both finalize request candidates failing is a safe non-retryable client error', () => {
  let fetchCalls = 0;
  let projectionCalls = 0;
  const error = withLiveFakes((url, options) => {
    fetchCalls += 1;
    return response(200, '', { 'X-Goog-Upload-URL': 'https://upload.invalid/synthetic' });
  }, () => {
    try {
      ksp.kspGeminiUploadSourceLive_('fileSearchStores/store-synthetic', meetingSource(), [1]);
    } catch (value) {
      return value;
    }
    return null;
  }, () => {
    projectionCalls += 1;
    throw new Error('SYNTHETIC_APPS_SCRIPT_REQUEST_ERROR');
  });
  assert.equal(fetchCalls, 1);
  assert.equal(projectionCalls, 2);
  assert.equal(error.code, 'AI_UPLOAD_FINALIZE_CLIENT_UNSUPPORTED');
  assert.equal(error.stage, 'UPLOAD_FINALIZE_CLIENT');
  assert.equal(error.httpStatus, 0);
  assert.equal(error.retryable, false);
  assert.equal(error.permanent, true);
  assert.doesNotMatch(error.message, /SYNTHETIC_APPS_SCRIPT_REQUEST_ERROR/);
});

test('invalid original source bytes are rejected before request projection or fetch', () => {
  let fetchCalls = 0;
  let projectionCalls = 0;
  const error = withLiveFakes(() => {
    fetchCalls += 1;
    return response(200, '');
  }, () => {
    try {
      ksp.kspGeminiUploadSourceLive_('fileSearchStores/store-synthetic', meetingSource(), [65, 256]);
    } catch (value) {
      return value;
    }
    return null;
  }, () => {
    projectionCalls += 1;
    return defaultRequestProjection('https://upload.invalid/synthetic', {
      method: 'post', contentType: 'text/plain', headers: {}, payload: []
    });
  });
  assert.equal(fetchCalls, 0);
  assert.equal(projectionCalls, 0);
  assert.equal(error.code, 'AI_SOURCE_BYTES_INVALID');
});

test('finalize fetch without a provider response remains a non-retryable client error', () => {
  let fetchCalls = 0;
  const error = withLiveFakes((url, options) => {
    fetchCalls += 1;
    if (fetchCalls === 1) return response(200, '', { 'X-Goog-Upload-URL': 'https://upload.invalid/synthetic' });
    throw new Error('PRIVATE_APPS_SCRIPT_TRANSPORT_ERROR');
  }, () => {
    try {
      ksp.kspGeminiUploadSourceLive_('fileSearchStores/store-synthetic', meetingSource(), [1]);
    } catch (value) {
      return value;
    }
    return null;
  });
  assert.equal(fetchCalls, 2);
  assert.equal(error.code, 'AI_UPLOAD_FINALIZE_REQUEST_INVALID');
  assert.equal(error.stage, 'UPLOAD_FINALIZE_CLIENT');
  assert.equal(error.httpStatus, 0);
  assert.equal(error.retryable, false);
  assert.equal(error.permanent, true);
  assert.doesNotMatch(error.message, /PRIVATE_APPS_SCRIPT_TRANSPORT_ERROR/);
});

test('Gemini upload URL and Retry-After headers are case-insensitive and array-safe', () => {
  assert.equal(ksp.kspGeminiHeaderValue_({ 'X-Goog-Upload-URL': ['https://upload.invalid/one'] }, 'x-goog-upload-url'), 'https://upload.invalid/one');
  assert.equal(ksp.kspGeminiHeaderValue_({ Location: 'https://upload.invalid/two' }, 'location'), 'https://upload.invalid/two');
  assert.equal(ksp.kspGeminiRetryAfterMillis_({ 'retry-after': '1' }), 1000);
});

test('known Gemini upload stages preserve safe codes without raw provider text', () => {
  withLiveFakes(() => response(500, JSON.stringify({ error: { message: 'PRIVATE_PROVIDER_RESPONSE' } })), () => {
    assert.throws(
      () => ksp.kspGeminiUploadSourceLive_('fileSearchStores/store-synthetic', meetingSource(), [1]),
      (error) => error.code === 'AI_UPLOAD_SESSION_FAILED' && !error.message.includes('PRIVATE_PROVIDER_RESPONSE')
    );
  });

  let calls = 0;
  withLiveFakes(() => {
    calls += 1;
    return calls === 1
      ? response(200, '', { 'X-Goog-Upload-URL': 'https://upload.invalid/synthetic' })
      : response(503, JSON.stringify({ error: { message: 'PRIVATE_PROVIDER_RESPONSE' } }));
  }, () => {
    assert.throws(
      () => ksp.kspGeminiUploadSourceLive_('fileSearchStores/store-synthetic', meetingSource(), [1]),
      (error) => error.code === 'AI_UPLOAD_FINALIZE_FAILED' &&
        error.stage === 'UPLOAD_FINALIZE_HTTP' && error.httpStatus === 503 &&
        !error.message.includes('PRIVATE_PROVIDER_RESPONSE')
    );
  });
  assert.equal(calls, 2);
});

test('provider lastError keeps stage code, attempt, retryability, and next attempt only', () => {
  const encoded = JSON.parse(ksp.kspBuildAiProviderLastError_(
    { code: 'AI_UPLOAD_FINALIZE_FAILED', httpStatus: 503, retryable: true },
    { attempt: 0 },
    { maxRetryAttempts: 5, retryBaseMinutes: 15, retryMaxMinutes: 240 },
    '2026-08-29T00:00:00.000Z'
  ));
  assert.equal(encoded.code, 'AI_UPLOAD_FINALIZE_FAILED');
  assert.equal(encoded.attempt, 1);
  assert.equal(encoded.retryable, true);
  assert.equal(Object.hasOwn(encoded, 'message'), false);
});

test('transient Gemini query failures retry at most four times and honor Retry-After', () => {
  const calls = [];
  const result = withLiveFakes((url, options) => {
    calls.push({ url, options });
    if (calls.length === 1) return response(429, '{}', { 'Retry-After': '1' });
    if (calls.length === 2) return response(500, '{}');
    return response(200, { id: 'interaction-synthetic', steps: [] });
  }, (sleeps) => {
    const value = plain(ksp.kspGeminiJsonRequestLive_('POST', '/interactions', { input: 'synthetic' }, {
      retry: true, stage: 'QUERY_HTTP', errorCode: 'AI_QUERY_HTTP_FAILED'
    }));
    assert.equal(value.id, 'interaction-synthetic');
    assert.equal(calls.length, 3);
    assert.equal(sleeps[0], 1000);
    assert.equal(sleeps.length, 2);
    return value;
  });
  assert.equal(result.id, 'interaction-synthetic');
});

test('all accepted transient Gemini HTTP statuses remain bounded-retryable', () => {
  for (const status of [408, 429, 500, 502, 503, 504]) {
    let calls = 0;
    const error = withLiveFakes(() => {
      calls += 1;
      return response(status, '{}');
    }, (sleeps) => {
      let caught;
      try {
        ksp.kspGeminiJsonRequestLive_('GET', '/fileSearchStores/store-synthetic', null, {
          retry: true, stage: 'STORE_READ', errorCode: 'AI_STORE_READ_FAILED'
        });
      } catch (value) {
        caught = value;
      }
      assert.equal(calls, 4);
      assert.equal(sleeps.length, 3);
      assert.equal(caught.code, 'AI_STORE_READ_FAILED');
      assert.equal(caught.httpStatus, status);
      assert.equal(caught.retryable, true);
      return caught;
    });
    assert.equal(error.httpStatus, status);
  }
});

test('repeated transient Gemini query failure stops at the four-attempt cap', () => {
  let calls = 0;
  const error = withLiveFakes(() => {
    calls += 1;
    return response(503, JSON.stringify({ error: { message: 'PRIVATE_PROVIDER_RESPONSE' } }));
  }, (sleeps) => {
    let caught;
    try {
      ksp.kspGeminiJsonRequestLive_('POST', '/interactions', { input: 'synthetic' }, {
        retry: true, stage: 'QUERY_HTTP', errorCode: 'AI_QUERY_HTTP_FAILED'
      });
    } catch (value) {
      caught = value;
    }
    assert.equal(calls, 4);
    assert.equal(sleeps.length, 3);
    assert.equal(caught.code, 'AI_QUERY_HTTP_FAILED');
    assert.equal(caught.attempt, 4);
    assert.doesNotMatch(caught.message, /PRIVATE_PROVIDER_RESPONSE/);
    return caught;
  });
  assert.equal(error.attempt, 4);
});

test('authentication and invalid-request 4xx responses are not retried', () => {
  for (const status of [400, 401, 403]) {
    let calls = 0;
    withLiveFakes(() => {
      calls += 1;
      return response(status, '{}');
    }, (sleeps) => {
      assert.throws(
        () => ksp.kspGeminiJsonRequestLive_('GET', '/fileSearchStores/store-synthetic', null, {
          retry: true, stage: 'STORE_READ', errorCode: 'AI_STORE_READ_FAILED'
        }),
        (error) => error.code === 'AI_STORE_READ_FAILED' && error.attempt === 1 && error.retryable === false
      );
      assert.equal(calls, 1);
      assert.deepEqual(sleeps, []);
    });
  }
});

test('one application query creates one final Audit outcome despite internal retries', () => {
  const calls = [];
  const env = createSyncEnvironment();
  env.getProviderConfig = (provider) => ({
    provider, enabled: true, modelId: 'gemini-3.7-flash', storeName: 'fileSearchStores/store-synthetic',
    credentialConfigured: true
  });
  env.queryProvider = () => ksp.kspGeminiJsonRequestLive_('POST', '/interactions', { input: 'synthetic' }, {
    retry: true, stage: 'QUERY_HTTP', errorCode: 'AI_QUERY_HTTP_FAILED'
  });
  const result = withLiveFakes((url, options) => {
    calls.push({ url, options });
    if (calls.length < 3) return response(calls.length === 1 ? 500 : 503, '{}');
    return response(200, {
      id: 'interaction-synthetic',
      steps: [{ type: 'model_output', content: [{
        type: 'text', text: 'synthetic answer', annotations: [{
          type: 'file_citation', source: 'fileSearchStores/store-synthetic/documents/doc-synthetic-1',
          custom_metadata: [{ key: 'source_type', string_value: 'Meeting' }, { key: 'source_id', string_value: 'MTG-000001' }]
        }]
      }] }]
    });
  }, (sleeps) => {
    const value = plain(ksp.kspRunProviderKnowledgeSearch_(env, 'GEMINI', {
      mode: '自由質問', questionOrInstruction: 'synthetic question'
    }));
    assert.equal(value.ok, true);
    assert.equal(calls.length, 3);
    assert.equal(env._debug.audits.length, 1);
    assert.equal(env._debug.audits[0].Action, 'AI_QUERY');
    assert.equal(env._debug.audits[0].Result, 'Success');
    assert.equal(sleeps.length, 2);
    return value;
  });
  assert.equal(result.citations.length, 1);
});

test('disabled OpenAI path does not invoke the Gemini/OpenAI transport', () => {
  let calls = 0;
  const env = createSyncEnvironment();
  env.getProviderConfig = (provider) => ({
    provider, enabled: false, modelId: '', storeName: '', vectorStoreId: '', credentialConfigured: false
  });
  env.queryProvider = () => { calls += 1; return {}; };
  withLiveFakes(() => {
    calls += 100;
    return response(200, '{}');
  }, () => {
    const result = plain(ksp.kspRunProviderKnowledgeSearch_(env, 'OPENAI', {
      mode: '自由質問', questionOrInstruction: 'synthetic question'
    }));
    assert.equal(result.ok, false);
    assert.equal(result.error.code, 'OPENAI_DISABLED_BY_CONFIG');
    assert.equal(calls, 0);
  });
});
