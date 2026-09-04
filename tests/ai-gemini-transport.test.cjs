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

test('generic completed Operation reconciles one exact active Document through list and get', () => {
  const source = meetingSource();
  const calls = [];
  const document = withLiveFakes((url, options) => {
    calls.push({ url, options });
    if (calls.length === 1) return response(200, '', { 'X-Goog-Upload-URL': 'https://upload.invalid/synthetic' });
    if (calls.length === 2) return response(200, {
      name: 'fileSearchStores/store-synthetic/upload/operations/op-synthetic',
      done: true,
      response: {}
    });
    if (calls.length === 3) return response(200, { documents: [activeDocument(source)] });
    return response(200, activeDocument(source));
  }, (sleeps) => {
    const document = plain(ksp.kspGeminiUploadSourceLive_('fileSearchStores/store-synthetic', source, [65, 0, 255]));
    assert.equal(document.state, 'STATE_ACTIVE');
    assert.equal(document.customMetadata.source_type, source.sourceType);
    assert.equal(document.customMetadata.source_id, source.sourceId);
    assert.equal(document.customMetadata.content_hash, source.contentHash);
    assert.equal(sleeps.length, 0);
    return document;
  });
  assert.equal(calls.length, 4);
  assert.equal(document.state, 'STATE_ACTIVE');
  assert.match(calls[2].url, /\/fileSearchStores\/store-synthetic\/documents\?pageSize=20/);
  assert.match(calls[3].url, /\/fileSearchStores\/store-synthetic\/documents\/doc-synthetic-1/);
});

test('Gemini document reconciliation fails closed for zero, wrong, or multiple exact matches', () => {
  const source = meetingSource();
  const cases = [
    { name: 'zero', documents: [], listCalls: 3, sleeps: 2 },
    {
      name: 'wrong metadata',
      documents: [{ ...activeDocument(source), customMetadata: [
        { key: 'source_type', stringValue: 'Pitchbook' },
        { key: 'source_id', stringValue: source.sourceId },
        { key: 'content_hash', stringValue: source.contentHash }
      ] }],
      listCalls: 3,
      sleeps: 2
    },
    {
      name: 'multiple',
      documents: [
        activeDocument(source),
        { ...activeDocument(source), name: 'fileSearchStores/store-synthetic/documents/doc-synthetic-2' }
      ],
      listCalls: 1,
      sleeps: 0
    }
  ];
  cases.forEach((fixture) => {
    const calls = [];
    const error = withLiveFakes((url, options) => {
      calls.push({ url, options });
      if (calls.length === 1) return response(200, '', { 'X-Goog-Upload-URL': 'https://upload.invalid/synthetic' });
      if (calls.length === 2) return response(200, {
        name: 'fileSearchStores/store-synthetic/upload/operations/op-synthetic',
        done: true,
        response: {}
      });
      return response(200, { documents: fixture.documents });
    }, (sleeps) => {
      let caught;
      try {
        ksp.kspGeminiUploadSourceLive_('fileSearchStores/store-synthetic', source, [65, 0, 255]);
      } catch (value) {
        caught = value;
      }
      assert.equal(caught.code, 'AI_DOCUMENT_READBACK_FAILED', fixture.name);
      assert.equal(caught.retryable, false, fixture.name);
      assert.equal(sleeps.length, fixture.sleeps, fixture.name);
      return caught;
    });
    assert.equal(error.code, 'AI_DOCUMENT_READBACK_FAILED', fixture.name);
    assert.equal(calls.length, 2 + fixture.listCalls, fixture.name);
    assert.equal(calls.slice(2).some((call) => /\/documents\/[^?]+$/.test(call.url)), false, fixture.name);
  });
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
  assert.equal(fetchCalls, 5);
  assert.equal(error.code, 'AI_UPLOAD_FINALIZE_CLIENT_FAILED');
  assert.equal(error.stage, 'UPLOAD_FINALIZE_CLIENT');
  assert.equal(error.httpStatus, 0);
  assert.equal(error.retryable, false);
  assert.equal(error.permanent, true);
  assert.equal(error.reconciliationCode, 'AI_UPLOAD_SESSION_QUERY_FAILED');
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
  assert.equal(calls, 5);
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

test('transient Gemini query failures retry at most three times and honor Retry-After', () => {
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
      assert.equal(calls, 3);
      assert.equal(sleeps.length, 2);
      assert.equal(caught.code, 'AI_STORE_READ_FAILED');
      assert.equal(caught.httpStatus, status);
      assert.equal(caught.retryable, true);
      return caught;
    });
    assert.equal(error.httpStatus, status);
  }
});

test('repeated transient Gemini query failure stops at the three-attempt cap', () => {
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
    assert.equal(calls, 3);
    assert.equal(sleeps.length, 2);
    assert.equal(caught.code, 'AI_QUERY_HTTP_FAILED');
    assert.equal(caught.attempt, 3);
    assert.doesNotMatch(caught.message, /PRIVATE_PROVIDER_RESPONSE/);
    return caught;
  });
  assert.equal(error.attempt, 3);
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
        (error) => error.code === (status === 400 ? 'AI_STORE_READ_FAILED' : 'AI_GEMINI_CREDENTIAL_REJECTED') &&
          error.attempt === 1 && error.retryable === false
      );
      assert.equal(calls, 1);
      assert.deepEqual(sleeps, []);
    });
  }
});

function interactionRequest() {
  return {
    model: 'gemini-3.8-flash',
    input: 'synthetic question',
    tools: [{ type: 'file_search', file_search_store_names: ['fileSearchStores/store-synthetic'] }],
    background: true,
    generation_config: { thinking_level: 'low', max_output_tokens: 2048 }
  };
}

function completedInteraction() {
  return {
    id: 'interaction-synthetic',
    status: 'completed',
    steps: [{ type: 'model_output', content: [{
      type: 'text', text: 'synthetic answer', annotations: []
    }] }]
  };
}

test('Gemini START uses the pinned low-latency profile and returns a completed response without polling', () => {
  const calls = [];
  withLiveFakes((url, options) => {
    calls.push({ url, options });
    return response(200, completedInteraction());
  }, (sleeps) => {
    const value = plain(ksp.kspGeminiStartInteractionLive_(interactionRequest()));
    const body = JSON.parse(calls[0].options.payload);
    assert.equal(value.status, 'completed');
    assert.equal(value.response.status, 'completed');
    assert.equal(calls.length, 1);
    assert.equal(calls[0].options.method, 'post');
    assert.equal(body.background, true);
    assert.equal(body.model, 'gemini-3.8-flash');
    assert.deepEqual(body.generation_config, { thinking_level: 'low', max_output_tokens: 2048 });
    assert.equal(calls[0].options.headers['Api-Revision'], undefined);
    assert.deepEqual(sleeps, []);
  });
});

test('Gemini START accepts queued/in_progress and never sleeps or performs a GET', () => {
  for (const status of ['queued', 'in_progress']) {
    const calls = [];
    withLiveFakes((url, options) => {
      calls.push({ url, options });
      return response(200, { id: 'interaction-synthetic', status });
    }, (sleeps) => {
      const value = plain(ksp.kspGeminiStartInteractionLive_(interactionRequest()));
      assert.equal(value.status, 'in_progress');
      assert.equal(value.interactionId, 'interaction-synthetic');
      assert.equal(calls.length, 1);
      assert.equal(calls[0].options.method, 'post');
      assert.deepEqual(sleeps, []);
    });
  }
});

test('direct synchronous Interactions control omits background and preserves the exact tuple', () => {
  const calls = [];
  withLiveFakes((url, options) => {
    calls.push({ url, options });
    return response(200, completedInteraction());
  }, () => {
    const value = plain(ksp.kspGeminiQueryInteractionLive_(interactionRequest()));
    const body = JSON.parse(calls[0].options.payload);
    assert.equal(value.status, 'completed');
    assert.equal(Object.hasOwn(body, 'background'), false);
    assert.equal(body.model, 'gemini-3.8-flash');
    assert.deepEqual(body.generation_config, { thinking_level: 'low', max_output_tokens: 2048 });
    assert.equal(calls[0].options.headers['Api-Revision'], undefined);
  });
});

test('explicit model unsupported and access errors are safely classified without provider payload leakage', () => {
  const cases = [
    [404, { error: { message: 'Requested model is not found' } }, 'AI_GEMINI_MODEL_UNSUPPORTED'],
    [403, { error: { message: 'Permission denied for model access' } }, 'AI_GEMINI_MODEL_ACCESS_DENIED']
  ];
  for (const [status, body, expected] of cases) {
    withLiveFakes(() => response(status, body), () => {
      assert.throws(() => ksp.kspGeminiQueryInteractionLive_(interactionRequest()),
        (error) => error.code === expected && !String(error.message).includes('Requested model') &&
          !String(error.message).includes('Permission denied'));
    });
  }
});

test('Gemini POLL performs exactly one GET without retry or sleep', () => {
  const calls = [];
  withLiveFakes((url, options) => {
    calls.push({ url, options });
    return response(200, { id: 'interaction-synthetic', status: 'in_progress' });
  }, (sleeps) => {
    const value = plain(ksp.kspGeminiPollInteractionLive_('interaction-synthetic'));
    assert.equal(value.status, 'in_progress');
    assert.equal(value.interactionId, 'interaction-synthetic');
    assert.equal(calls.length, 1);
    assert.match(calls[0].url, /\/interactions\/interaction-synthetic$/);
    assert.equal(calls[0].options.method, 'get');
    assert.equal(calls[0].options.headers['Api-Revision'], undefined);
    assert.deepEqual(sleeps, []);
  });
});

test('Gemini POLL returns a completed response for the existing parser path', () => {
  const calls = [];
  withLiveFakes((url, options) => {
    calls.push({ url, options });
    return response(200, completedInteraction());
  }, () => {
    const value = plain(ksp.kspGeminiPollInteractionLive_('interaction-synthetic'));
    assert.equal(value.status, 'completed');
    assert.equal(value.response.status, 'completed');
    assert.equal(calls.length, 1);
  });
});

test('documented Gemini terminal statuses are safe and bounded', () => {
  for (const status of ['failed', 'cancelled', 'requires_action', 'incomplete', 'budget_exceeded']) {
    let calls = 0;
    withLiveFakes(() => {
      calls += 1;
      return response(200, { id: 'interaction-synthetic', status, error: { message: 'PRIVATE_PROVIDER_RESPONSE' } });
    }, (sleeps) => {
      assert.throws(
        () => ksp.kspGeminiPollInteractionLive_('interaction-synthetic'),
        (error) => error.code === 'AI_QUERY_PROVIDER_TERMINAL' &&
          error.stage === 'QUERY_PROVIDER' && error.providerStatus === status &&
          !error.message.includes('PRIVATE_PROVIDER_RESPONSE')
      );
      assert.equal(calls, 1);
      assert.deepEqual(sleeps, []);
    });
  }
});

test('Gemini terminal and HTTP failures retain only allowlisted provider error codes', () => {
  withLiveFakes(() => response(200, {
    id: 'interaction-synthetic',
    status: 'failed',
    errors: [
      { code: 'service_unavailable', message: 'PRIVATE_PROVIDER_RESPONSE' },
      { code: 'https://provider.invalid/errors/quota_exceeded', message: 'PRIVATE_QUOTA_DETAIL' },
      { code: 'private_provider_identifier', message: 'PRIVATE_IDENTIFIER_DETAIL' }
    ]
  }), () => {
    assert.throws(
      () => ksp.kspGeminiQueryInteractionLive_(interactionRequest()),
      (error) => {
        assert.equal(error.code, 'AI_QUERY_PROVIDER_TERMINAL');
        assert.equal(error.providerStatus, 'failed');
        assert.deepEqual(plain(error.providerErrorCodes), ['service_unavailable', 'quota_exceeded']);
        assert.doesNotMatch(JSON.stringify(error),
          /PRIVATE_PROVIDER_RESPONSE|PRIVATE_QUOTA_DETAIL|PRIVATE_IDENTIFIER_DETAIL|private_provider_identifier/);
        return true;
      }
    );
  });

  withLiveFakes(() => response(503, {
    error: { code: 503, status: 'UNAVAILABLE', message: 'PRIVATE_HTTP_RESPONSE' }
  }), () => {
    assert.throws(
      () => ksp.kspGeminiQueryInteractionLive_(interactionRequest()),
      (error) => {
        assert.equal(error.code, 'AI_QUERY_HTTP_FAILED');
        assert.equal(error.httpStatus, 503);
        assert.deepEqual(plain(error.providerErrorCodes), ['unavailable']);
        assert.doesNotMatch(JSON.stringify(error), /PRIVATE_HTTP_RESPONSE/);
        return true;
      }
    );
  });
});

test('unknown Gemini Interaction status fails closed without exposing provider payload', () => {
  withLiveFakes(() => response(200, { id: 'interaction-synthetic', status: 'private_future_state', error: { message: 'SECRET' } }), () => {
    assert.throws(
      () => ksp.kspGeminiPollInteractionLive_('interaction-synthetic'),
      (error) => error.code === 'AI_QUERY_RESPONSE_INVALID' && !error.message.includes('SECRET')
    );
  });
});

test('Gemini START terminal status does not perform a second request', () => {
  let calls = 0;
  withLiveFakes(() => {
    calls += 1;
    return response(200, { id: 'interaction-synthetic', status: 'incomplete' });
  }, (sleeps) => {
    assert.throws(
      () => ksp.kspGeminiStartInteractionLive_(interactionRequest()),
      (error) => error.code === 'AI_QUERY_PROVIDER_TERMINAL' && error.providerStatus === 'incomplete'
    );
    assert.equal(calls, 1);
    assert.deepEqual(sleeps, []);
  });
});

function generateContentResponse(sourceId = 'DOC-000001', sourceType = 'Pitchbook') {
  return {
    candidates: [{
      finishReason: 'STOP',
      content: { parts: [{ text: 'Grounded Generate Content answer' }] },
      groundingMetadata: {
        groundingChunks: [{
          retrievedContext: {
            title: 'synthetic-pitchbook.txt',
            uri: 'https://provider.invalid/private-document',
            pageNumber: 2,
            customMetadata: [
              { key: 'source_type', stringValue: sourceType },
              { key: 'source_id', stringValue: sourceId },
              { key: 'content_hash', stringValue: 'synthetic-content-hash' }
            ]
          }
        }]
      }
    }],
    usageMetadata: {
      promptTokenCount: 11,
      candidatesTokenCount: 9,
      thoughtsTokenCount: 2,
      toolUsePromptTokenCount: 3,
      cachedContentTokenCount: 1
    }
  };
}

function generateContentRequest() {
  return {
    modelId: 'gemini-3.7-flash',
    storeName: 'fileSearchStores/store-synthetic',
    mode: '自由質問',
    questionOrInstruction: 'synthetic pitchbook question',
    metadataFilter: 'source_type = "Pitchbook"'
  };
}

test('Gemini Generate Content adapter builds the official File Search request profile', () => {
  const request = plain(ksp.kspBuildGeminiGenerateContentRequest_(generateContentRequest()));
  assert.deepEqual(request.contents, [{ parts: [{ text: request.contents[0].parts[0].text }] }]);
  assert.equal(request.tools.length, 1);
  assert.deepEqual(request.tools[0], {
    file_search: {
      file_search_store_names: ['fileSearchStores/store-synthetic'],
      metadata_filter: 'source_type = "Pitchbook"'
    }
  });
  assert.deepEqual(request.generationConfig, {
    thinkingConfig: { thinkingLevel: 'low' },
    maxOutputTokens: 2048
  });
  assert.equal(Object.hasOwn(request, 'model'), false);
  assert.match(request.contents[0].parts[0].text, /synthetic pitchbook question/);
});

test('Gemini Generate Content uses one authenticated POST and returns the provider response', () => {
  const calls = [];
  withLiveFakes((url, options) => {
    calls.push({ url, options });
    return response(200, generateContentResponse());
  }, () => {
    const raw = ksp.kspGeminiGenerateContentLive_(generateContentRequest());
    assert.equal(raw.__kspHttpStatus, 200);
    const value = plain(raw);
    assert.equal(value.candidates[0].finishReason, 'STOP');
    assert.equal(calls.length, 1);
    assert.match(calls[0].url, /\/models\/gemini-3\.7-flash:generateContent$/);
    assert.equal(calls[0].options.method, 'post');
    assert.equal(calls[0].options.headers['x-goog-api-key'], 'synthetic-gemini-key');
    assert.equal(calls[0].options.muteHttpExceptions, true);
    assert.deepEqual(JSON.parse(calls[0].options.payload).generationConfig, {
      thinkingConfig: { thinkingLevel: 'low' },
      maxOutputTokens: 2048
    });
  });
});

test('Gemini Generate Content grounding metadata normalizes only authoritative source metadata', () => {
  const parsed = plain(ksp.kspNormalizeGeminiGenerateContentResponse_(generateContentResponse()));
  assert.equal(parsed.answer, 'Grounded Generate Content answer');
  assert.equal(parsed.finishReason, 'STOP');
  assert.equal(parsed.citations.length, 1);
  assert.equal(parsed.citations[0].metadata.source_type, 'Pitchbook');
  assert.equal(parsed.citations[0].metadata.source_id, 'DOC-000001');
  assert.equal(parsed.citations[0].pageNumber, 2);
  assert.equal(parsed.usage.promptTokenCount, 11);

  const withoutMetadata = plain(ksp.kspNormalizeGeminiGenerateContentResponse_(generateContentResponse('DOC-000001', '')));
  assert.equal(withoutMetadata.citations.length, 0);
});

test('Generate Content result maps authoritative citations and records safe transport telemetry', () => {
  const env = createSyncEnvironment();
  const context = env.loadAiContext();
  const value = plain(ksp.kspBuildProviderKnowledgeSearchSuccess_(
    env,
    'GEMINI',
    { mode: '自由質問', questionOrInstruction: 'synthetic pitchbook question', sourceType: 'Pitchbook' },
    { provider: 'GEMINI', modelId: 'gemini-3.7-flash', queryTransport: 'GENERATE_CONTENT' },
    context,
    'person@example.com',
    generateContentResponse(),
    [],
    '',
    {
      state: {}, providerStatus: 'completed', response: generateContentResponse(),
      queryTransport: 'GENERATE_CONTENT', startLatencyMs: 37
    }
  ));
  assert.equal(value.result.ok, true);
  assert.equal(value.result.insufficientEvidence, false);
  assert.equal(value.result.citations[0].sourceType, 'Pitchbook');
  assert.equal(value.result.citations[0].sourceId, 'DOC-000001');
  assert.equal(env._debug.audits.length, 1);
  const auditMetadata = JSON.parse(env._debug.audits[0].After_Metadata_JSON);
  assert.equal(auditMetadata.query_transport, 'GENERATE_CONTENT');
  assert.equal(auditMetadata.query_transport_version, 'gemini-current-file-search-v2');
  assert.equal(auditMetadata.input_tokens, 11);
  assert.equal(auditMetadata.output_tokens, 9);
  assert.equal(auditMetadata.thought_tokens, 2);
  assert.equal(auditMetadata.tool_use_tokens, 3);
  assert.equal(JSON.stringify(env._debug.audits[0]).includes('provider.invalid'), false);
});

test('Generate Content HTTP retries stay bounded and malformed responses remain safe', () => {
  let calls = 0;
  withLiveFakes(() => {
    calls += 1;
    return response(500, JSON.stringify({ error: { message: 'PRIVATE_PROVIDER_RESPONSE' } }));
  }, () => {
    assert.throws(
      () => ksp.kspGeminiGenerateContentLive_(generateContentRequest()),
      (error) => error.code === 'AI_QUERY_HTTP_FAILED' &&
        error.stage === 'QUERY_GENERATE_CONTENT' && error.httpStatus === 500 &&
        error.retryable === true && !error.message.includes('PRIVATE_PROVIDER_RESPONSE')
    );
  });
  assert.equal(calls, 2);

  withLiveFakes(() => response(200, '{PRIVATE_PROVIDER_RESPONSE'), () => {
    assert.throws(
      () => ksp.kspGeminiGenerateContentLive_(generateContentRequest()),
      (error) => error.code === 'AI_QUERY_RESPONSE_INVALID' &&
        error.stage === 'QUERY_GENERATE_CONTENT' &&
        !error.message.includes('PRIVATE_PROVIDER_RESPONSE')
    );
  });
});

test('provider-neutral Gemini query selects Generate Content without an Interaction fallback', () => {
  const originalFactory = ksp.kspCreateFeatureFreezeAiEnvironment_;
  let interactionCalls = 0;
  ksp.kspCreateFeatureFreezeAiEnvironment_ = () => ({
    startQueryFileSearch() {
      interactionCalls += 1;
      throw new Error('INTERACTIONS_FALLBACK_MUST_NOT_RUN');
    }
  });
  try {
    const calls = [];
    withLiveFakes((url, options) => {
      calls.push({ url, options });
      return response(200, generateContentResponse());
    }, () => {
      const environment = ksp.kspCreateProviderNeutralAiEnvironment_();
      const lifecycle = plain(environment.startQueryProvider('GEMINI', {
        provider: 'GEMINI', modelId: 'gemini-3.7-flash',
        storeName: 'fileSearchStores/store-synthetic',
        queryTransport: 'GENERATE_CONTENT'
      }, generateContentRequest()));
      assert.equal(lifecycle.status, 'completed');
      assert.equal(calls.length, 1);
      assert.match(calls[0].url, /:generateContent$/);
    });
    assert.equal(interactionCalls, 0);
  } finally {
    ksp.kspCreateFeatureFreezeAiEnvironment_ = originalFactory;
  }
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
