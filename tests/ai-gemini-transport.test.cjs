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

function withLiveFakes(
  fetch,
  callback,
  newBlob = (bytes, mimeType, name) => syntheticBlob(bytes, mimeType, name)
) {
  const originalProperties = ksp.PropertiesService;
  const originalFetch = ksp.UrlFetchApp;
  const originalUtilities = ksp.Utilities;
  const sleeps = [];
  let getRequestCalls = 0;
  ksp.PropertiesService = { getScriptProperties: () => ({ getProperty: () => 'synthetic-gemini-key' }) };
  ksp.UrlFetchApp = {
    fetch,
    getRequest: () => {
      getRequestCalls += 1;
      throw new Error('SYNTHETIC_GET_REQUEST_MUST_NOT_BE_CALLED');
    }
  };
  ksp.Utilities = {
    ...originalUtilities,
    newBlob,
    sleep: (millis) => sleeps.push(millis)
  };
  try {
    return callback(sleeps, () => getRequestCalls);
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

test('Gemini upload uses one exact Blob finalize request and verifies the active Document readback', () => {
  const source = meetingSource();
  const calls = [];
  let blobCalls = 0;
  const result = withLiveFakes((url, options) => {
    calls.push({ url, options });
    if (calls.length === 1) return response(200, '', { 'x-goog-upload-url': 'https://upload.invalid/synthetic%2Fopaque' });
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
  }, (sleeps, getRequestCalls) => {
    const document = plain(ksp.kspGeminiUploadSourceLive_('fileSearchStores/store-synthetic', source, [65, 0, 255]));
    assert.equal(document.state, 'STATE_ACTIVE');
    assert.equal(document.customMetadata.source_id, source.sourceId);
    assert.equal(document.customMetadata.source_type, source.sourceType);
    assert.equal(calls.length, 4);
    assert.equal(getRequestCalls(), 0);
    assert.deepEqual(sleeps, [1500]);
    return document;
  }, (bytes, mimeType, name) => {
    blobCalls += 1;
    return syntheticBlob(bytes, mimeType, name);
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
  assert.equal(blobCalls, 1);

  const finalize = calls[1];
  assert.equal(finalize.url, 'https://upload.invalid/synthetic%2Fopaque');
  assert.equal(finalize.options.contentType, 'text/plain');
  assert.equal(Object.keys(finalize.options.headers).some((key) => key.toLowerCase() === 'content-length'), false);
  assert.equal(finalize.options.headers['X-Goog-Upload-Offset'], '0');
  assert.equal(finalize.options.headers['X-Goog-Upload-Command'], 'upload, finalize');
  assert.equal(finalize.options.escaping, false);
  assert.deepEqual(finalize.options.payload.getBytes(), [65, 0, -1]);
  assert.equal(finalize.options.payload.getContentType(), 'text/plain');
  assert.equal(result.customMetadata.content_hash, source.contentHash);
});

test('Blob construction rejects byte or MIME drift before finalize fetch', () => {
  for (const badBlob of [
    (bytes, mimeType, name) => syntheticBlob([65, 1, -1], mimeType, name),
    (bytes, mimeType, name) => syntheticBlob(bytes, 'application/octet-stream', name)
  ]) {
    let fetchCalls = 0;
    const error = withLiveFakes(() => {
      fetchCalls += 1;
      return response(200, '{}', { 'X-Goog-Upload-URL': 'https://upload.invalid/synthetic' });
    }, () => {
      try {
        ksp.kspGeminiUploadSourceLive_('fileSearchStores/store-synthetic', meetingSource(), [65, 0, 255]);
      } catch (value) {
        return value;
      }
      return null;
    }, badBlob);
    assert.equal(fetchCalls, 1);
    assert.equal(error.code, 'AI_UPLOAD_FINALIZE_CLIENT_UNSUPPORTED');
    assert.equal(error.stage, 'UPLOAD_FINALIZE_CLIENT');
    assert.equal(error.retryable, false);
  }
});

test('invalid original source bytes are rejected before Blob construction or fetch', () => {
  let fetchCalls = 0;
  let blobCalls = 0;
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
    blobCalls += 1;
    return syntheticBlob([], 'text/plain', 'synthetic.txt');
  });
  assert.equal(fetchCalls, 0);
  assert.equal(blobCalls, 0);
  assert.equal(error.code, 'AI_SOURCE_BYTES_INVALID');
});

test('Blob construction failure is safe and non-retryable before finalize fetch', () => {
  let fetchCalls = 0;
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
    throw new Error('SYNTHETIC_BLOB_CONSTRUCTION_ERROR');
  });
  assert.equal(fetchCalls, 1);
  assert.equal(error.code, 'AI_UPLOAD_FINALIZE_CLIENT_UNSUPPORTED');
  assert.equal(error.stage, 'UPLOAD_FINALIZE_CLIENT');
  assert.equal(error.retryable, false);
  assert.doesNotMatch(error.message, /SYNTHETIC_BLOB_CONSTRUCTION_ERROR/);
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
  assert.equal(error.code, 'AI_UPLOAD_FINALIZE_CLIENT_FAILED');
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
