const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const crypto = require('node:crypto');

function loadAppsScript(rootDir) {
  const Utilities = {
    DigestAlgorithm: { SHA_256: 'SHA_256' },
    Charset: { UTF_8: 'UTF_8' },
    computeDigest(_algorithm, value) {
      return Array.from(crypto.createHash('sha256').update(String(value), 'utf8').digest());
    }
  };
  const context = vm.createContext({
    console, JSON, Object, Array, String, Number, Boolean, Date, Math, RegExp,
    Error, TypeError, Set, Map, Intl, Utilities
  });
  fs.readdirSync(path.join(rootDir, 'src'))
    .filter((file) => file.endsWith('.gs'))
    .sort()
    .forEach((file) => {
      new vm.Script(fs.readFileSync(path.join(rootDir, 'src', file), 'utf8'), { filename: file })
        .runInContext(context);
    });
  return context;
}

const ksp = loadAppsScript(path.resolve(__dirname, '..'));

function catalogRows() {
  return {
    gps: [
      { GP_ID: 'GP-000001', GP_Name: 'Apollo', Status: 'Active' },
      { GP_ID: 'GP-000002', GP_Name: 'KKR', Status: 'Active' },
      { GP_ID: 'GP-000003', GP_Name: 'Inactive GP', Status: 'Inactive' }
    ],
    options: [
      { Option_ID: 'OPT-AC-001', Type: 'ASSET_CLASS', Name: 'PE', Sort_Order: 1, Status: 'Active' },
      { Option_ID: 'OPT-AC-002', Type: 'ASSET_CLASS', Name: 'Infrastructure', Sort_Order: 2, Status: 'Active' },
      { Option_ID: 'OPT-CT-001', Type: 'CAPITAL_TYPE', Name: 'Equity', Sort_Order: 1, Status: 'Active' },
      { Option_ID: 'OPT-TEAM-001', Type: 'TEAM', Name: 'PD', Sort_Order: 1, Status: 'Active' }
    ]
  };
}

function meetingRow(id, date, overrides = {}) {
  const docId = overrides.Doc_File_ID || `doc-${id}`;
  return {
    Meeting_ID: id,
    Date: date,
    Time: '10:00',
    Location_ID: '',
    GP_ID: 'GP-000002',
    Asset_Class_ID: 'OPT-AC-002',
    Capital_Type_ID: '',
    Counterparty: 'Counterparty',
    Internal_Participants: 'Team',
    Doc_File_ID: docId,
    Doc_URL: `https://docs.google.com/document/d/${docId}/edit`,
    Saved_Filename: `${id}.gdoc`,
    Status: 'Active',
    Version: 1,
    Updated_At: `${date}T00:00:00.000Z`,
    Updated_By: 'synthetic-user',
    ...overrides
  };
}

function pitchbookRow(id, date, overrides = {}) {
  const fileId = overrides.File_ID || `file-${id}`;
  return {
    Document_ID: id,
    Batch_ID: `BAT-${id}`,
    Date: date,
    GP_ID: 'GP-000002',
    Asset_Class_ID: 'OPT-AC-002',
    Capital_Type_ID: '',
    Sequence_No: 1,
    File_ID: fileId,
    File_URL: `https://drive.google.com/file/d/${fileId}/view`,
    Original_Filename: `${id}.pdf`,
    Saved_Filename: `${id}.pdf`,
    Status: 'Active',
    Updated_At: `${date}T00:00:00.000Z`,
    Updated_By: 'synthetic-user',
    ...overrides
  };
}

function createFakeEnvironment(options = {}) {
  const cat = catalogRows();
  const meetingRows = (options.meetingRows || [
    meetingRow('MTG-000001', '2026-08-01', { Doc_File_ID: 'doc-1' }),
    meetingRow('MTG-000002', '2026-08-03', { Doc_File_ID: 'doc-2', Status: 'Inactive' })
  ]).map((row) => ({ ...row }));
  const pitchbookRows = (options.pitchbookRows || [
    pitchbookRow('DOC-000001', '2026-08-01', { File_ID: 'file-1' }),
    pitchbookRow('DOC-000002', '2026-08-02', { File_ID: 'file-2', GP_ID: 'GP-000001', Asset_Class_ID: 'OPT-AC-001' }),
    pitchbookRow('DOC-000003', '2026-08-04', { File_ID: 'file-3', Status: 'Inactive' })
  ]).map((row) => ({ ...row }));
  const documents = new Map(Object.entries(options.documents || {
    'doc-1': { text: 'Meeting body: synthetic full authoritative text.' },
    'doc-2': { text: 'Inactive body must not be read.' }
  }));
  const audits = [];
  const artifacts = [];
  const reads = [];
  const publicOperations = new Map();
  const idempotency = new Map();
  let tick = 0;
  const gpRows = cat.gps.map((row) => ({ ...row }));
  const optionRows = cat.options.map((row) => ({ ...row }));

  const environment = {
    nowIso() {
      tick += 1;
      return `2026-08-17T12:34:${String(tick).padStart(2, '0')}.000Z`;
    },
    getActor() {
      if (options.actorError) throw new Error('synthetic actor unavailable');
      return 'synthetic-user@example.com';
    },
    loadKnowledgeExportContext() {
      return {
        meetingRows: meetingRows.map((row) => ({ ...row })),
        pitchbookRows: pitchbookRows.map((row) => ({ ...row })),
        gpRows: gpRows.map((row) => ({ ...row })),
        optionRows: optionRows.map((row) => ({ ...row })),
        auditSpreadsheetId: 'audit-synthetic',
        knowledgeExportsFolderId: 'exports-synthetic',
        state: { resources: { knowledgeExportsFolderId: 'exports-synthetic' } }
      };
    },
    getDocumentText(id) {
      reads.push(id);
      if (options.documentReadError) throw new Error(String(options.documentReadError));
      return documents.get(id) ? documents.get(id).text : '';
    },
    getDriveFileMetadata(id) {
      if (options.driveMetadataError) throw new Error(String(options.driveMetadataError));
      return {
        id,
        mimeType: 'application/pdf',
        parents: ['pitchbooks-synthetic'],
        trashed: false,
        webViewLink: options.driveWebViewLink || `https://drive.google.com/file/d/${id}/view`
      };
    },
    claimPublicOperation(key, expirationSeconds) {
      const now = Date.now();
      const existing = publicOperations.get(key);
      if (existing && existing > now) return false;
      publicOperations.set(key, now + Number(expirationSeconds || 1) * 1000);
      return true;
    },
    getPublicIdempotency(key) {
      const entry = idempotency.get(key);
      if (!entry || entry.expiresAt <= Date.now()) {
        idempotency.delete(key);
        return null;
      }
      return JSON.parse(JSON.stringify(entry.value));
    },
    setPublicIdempotency(key, value, expirationSeconds) {
      idempotency.set(key, {
        value: JSON.parse(JSON.stringify(value)),
        expiresAt: Date.now() + Number(expirationSeconds || 1) * 1000
      });
    },
    createKnowledgeExportArtifact(input) {
      if (options.createError) throw new Error('synthetic artifact failure');
      artifacts.push(JSON.parse(JSON.stringify(input)));
      return {
        id: `export-${artifacts.length}`,
        url: options.artifactUrl || `https://drive.google.com/open?id=export-${artifacts.length}`,
        name: input.filename,
        warnings: options.artifactWarnings || []
      };
    },
    appendRow(_spreadsheetId, _sheetName, row) {
      if (options.auditError) throw new Error('synthetic audit failure');
      audits.push({ ...row });
    },
    _debug: { meetingRows, pitchbookRows, documents, audits, artifacts, reads, publicOperations, idempotency }
  };
  return environment;
}

function baseInput(overrides = {}) {
  return {
    mode: '自由質問',
    questionOrInstruction: '',
    dateFrom: '2026-08-01',
    dateTo: '2026-08-03',
    ...overrides
  };
}

test('Active source resolution applies filters and deterministic date/ID ordering', () => {
  const env = createFakeEnvironment();
  const input = ksp.kspValidateKnowledgeExportFilters_(
    ksp.kspNormalizeKnowledgeExportInput_(baseInput()),
    ksp.kspBuildKnowledgeSearchCatalog_(catalogRows().gps, catalogRows().options)
  );
  const sources = ksp.kspResolveKnowledgeExportSources_(
    env._debug.meetingRows, env._debug.pitchbookRows, input
  );
  assert.deepEqual(Array.from(sources, (source) => source.sourceId), [
    'DOC-000001', 'MTG-000001', 'DOC-000002'
  ]);
  assert.equal(sources.some((source) => source.sourceId === 'MTG-000002'), false);
  assert.deepEqual(
    Array.from(ksp.kspResolveKnowledgeExportSources_(
      env._debug.meetingRows, env._debug.pitchbookRows,
      { ...input, sourceType: 'Meeting' }
    ), (source) => source.sourceId),
    ['MTG-000001']
  );
});

test('preview counts exact Meeting text and records metadata-only audit', () => {
  const env = createFakeEnvironment();
  const result = ksp.kspRunKnowledgeExportPreview_(env, baseInput({ sourceType: 'Meeting' }));
  assert.equal(result.ok, true, JSON.stringify(result));
  assert.equal(result.preview.meetingCount, 1);
  assert.equal(result.preview.meetingCharacterCount, env._debug.documents.get('doc-1').text.length);
  assert.equal(result.preview.pitchbookCount, 0);
  assert.equal(result.preview.noResults, false);
  assert.deepEqual(env._debug.reads, ['doc-1']);
  assert.equal(env._debug.audits.length, 1);
  assert.equal(env._debug.audits[0].Question_Or_Instruction, '');
  assert.match(env._debug.audits[0].After_Metadata_JSON, /"meetingCount":1/);
  assert.doesNotMatch(JSON.stringify(env._debug.audits), /Meeting body: synthetic/);
});

test('creation rejects a stale preview after authoritative source text changes', () => {
  const env = createFakeEnvironment();
  const input = baseInput({ sourceType: 'Meeting' });
  const preview = ksp.kspRunKnowledgeExportPreview_(env, input);
  assert.equal(preview.ok, true);
  env._debug.documents.get('doc-1').text += ' changed after preview';
  const result = ksp.kspRunKnowledgeExportCreation_(env, {
    ...input,
    previewFingerprint: preview.preview.previewFingerprint,
    outputType: 'GOOGLE_DOCS'
  });
  assert.equal(result.ok, false);
  assert.equal(result.error.code, 'KNOWLEDGE_EXPORT_PREVIEW_STALE');
  assert.equal(env._debug.artifacts.length, 0);
});

test('creation rejects a changed filter or Index revision even when the source set is unchanged', () => {
  const env = createFakeEnvironment();
  const input = baseInput({ sourceType: 'Meeting' });
  const preview = ksp.kspRunKnowledgeExportPreview_(env, input);
  assert.equal(preview.ok, true);
  const filterChanged = ksp.kspRunKnowledgeExportCreation_(env, {
    ...input,
    dateTo: '2026-08-04',
    previewFingerprint: preview.preview.previewFingerprint,
    outputType: 'GOOGLE_DOCS'
  });
  assert.equal(filterChanged.ok, false);
  assert.equal(filterChanged.error.code, 'KNOWLEDGE_EXPORT_PREVIEW_STALE');

  const revisionEnv = createFakeEnvironment();
  const revisionPreview = ksp.kspRunKnowledgeExportPreview_(revisionEnv, input);
  revisionEnv._debug.meetingRows[0].Version = 2;
  const revisionChanged = ksp.kspRunKnowledgeExportCreation_(revisionEnv, {
    ...input,
    previewFingerprint: revisionPreview.preview.previewFingerprint,
    outputType: 'PDF'
  });
  assert.equal(revisionChanged.ok, false);
  assert.equal(revisionChanged.error.code, 'KNOWLEDGE_EXPORT_PREVIEW_STALE');
});

test('creation preserves Meeting bodies and exports Pitchbook metadata and links only', () => {
  const env = createFakeEnvironment();
  const sourceRowsBefore = JSON.stringify({ meetings: env._debug.meetingRows, pitchbooks: env._debug.pitchbookRows });
  const input = baseInput({ mode: '要約', sourceType: '' });
  const preview = ksp.kspRunKnowledgeExportPreview_(env, input);
  assert.equal(preview.ok, true, JSON.stringify(preview));
  const result = ksp.kspRunKnowledgeExportCreation_(env, {
    ...input,
    previewFingerprint: preview.preview.previewFingerprint,
    outputType: 'GOOGLE_DOCS'
  });
  assert.equal(result.ok, true, JSON.stringify(result));
  assert.equal(result.artifact.outputType, 'GOOGLE_DOCS');
  assert.equal(env._debug.artifacts.length, 1);
  const model = env._debug.artifacts[0].model;
  assert.equal(model.meetingSections[0].body, env._debug.documents.get('doc-1').text);
  assert.match(model.pitchbookLines.join('\n'), /DOC-000001/);
  assert.match(model.pitchbookLines.join('\n'), /https:\/\/drive\.google\.com\/open\?id=file-1/);
  assert.doesNotMatch(model.pitchbookLines.join('\n'), /Pitchbook body/);
  assert.deepEqual(env._debug.reads, ['doc-1', 'doc-1']);
  assert.equal(env._debug.audits.at(-1).Question_Or_Instruction, '');
  assert.doesNotMatch(JSON.stringify(env._debug.audits), /Meeting body: synthetic/);
  assert.equal(JSON.stringify({ meetings: env._debug.meetingRows, pitchbooks: env._debug.pitchbookRows }), sourceRowsBefore);
});

test('Knowledge Export includes structured Meeting and Pitchbook metadata but not follow-up note Audit content', () => {
  const env=createFakeEnvironment({
    meetingRows:[meetingRow('MTG-000001','2026-08-01',{Doc_File_ID:'doc-1',Team_ID:'OPT-TEAM-001',Fund_Strategy:'Fund Alpha',Meeting_Type_Codes:'ANNUAL_REVIEW,OFFICE_VISIT',Related_Pitchbook_IDs:'DOC-000001',Follow_Up_Required:true,Follow_Up_Note:'private follow-up'})],
    pitchbookRows:[pitchbookRow('DOC-000001','2026-08-01',{File_ID:'file-1',Fund_Strategy:'Fund Beta'})]
  });
  const input=baseInput();const preview=ksp.kspRunKnowledgeExportPreview_(env,input);const result=ksp.kspRunKnowledgeExportCreation_(env,{...input,previewFingerprint:preview.preview.previewFingerprint,outputType:'GOOGLE_DOCS'});
  assert.equal(result.ok,true,JSON.stringify(result));const text=ksp.kspBuildKnowledgeExportPlainText_(env._debug.artifacts[0].model);
  assert.match(text,/Team: PD/);assert.match(text,/Fund \/ Strategy: Fund Alpha/);assert.match(text,/Meeting Type: 定例年1回, 先方オフィス訪問/);assert.match(text,/要フォロー: はい/);assert.match(text,/Related Pitchbook IDs: DOC-000001/);assert.match(text,/Fund \/ Strategy: Fund Beta/);
  assert.equal(JSON.stringify(env._debug.audits).includes('private follow-up'),false);
});

test('creation is idempotent for the same preview fingerprint and output type', () => {
  const env = createFakeEnvironment();
  const input = baseInput({ sourceType: 'Meeting' });
  const preview = ksp.kspRunKnowledgeExportPreview_(env, input);
  const request = {
    ...input,
    previewFingerprint: preview.preview.previewFingerprint,
    outputType: 'GOOGLE_DOCS'
  };
  const first = ksp.kspRunKnowledgeExportCreation_(env, request);
  const second = ksp.kspRunKnowledgeExportCreation_(env, request);
  assert.equal(first.ok, true);
  assert.equal(second.ok, true);
  assert.equal(second.idempotentReplay, true);
  assert.equal(second.artifact.id, first.artifact.id);
  assert.equal(env._debug.artifacts.length, 1);
});

test('artifact URL must identify the returned artifact ID', () => {
  const env = createFakeEnvironment({ artifactUrl: 'https://drive.google.com/open?id=other-artifact' });
  const input = baseInput({ sourceType: 'Meeting' });
  const preview = ksp.kspRunKnowledgeExportPreview_(env, input);
  const result = ksp.kspRunKnowledgeExportCreation_(env, {
    ...input,
    previewFingerprint: preview.preview.previewFingerprint,
    outputType: 'GOOGLE_DOCS'
  });
  assert.equal(result.ok, false);
  assert.equal(result.error.code, 'KNOWLEDGE_EXPORT_ARTIFACT_URL_MISMATCH');
});

test('thresholds warn and hard-stop at strictly greater values', () => {
  assert.equal(ksp.kspBuildKnowledgeExportLimitState_(30, 150000, 200).warning, false);
  assert.equal(ksp.kspBuildKnowledgeExportLimitState_(31, 150000, 200).warning, true);
  assert.equal(ksp.kspBuildKnowledgeExportLimitState_(50, 250000, 200).hardStop, false);
  assert.equal(ksp.kspBuildKnowledgeExportLimitState_(51, 250000, 200).hardStop, true);
  assert.equal(ksp.kspBuildKnowledgeExportLimitState_(50, 250001, 200).hardStop, true);
  assert.equal(ksp.kspBuildKnowledgeExportLimitState_(50, 250000, 201).hardStop, true);

  const rows = Array.from({ length: 51 }, (_, index) => (
    meetingRow(`MTG-${String(index + 1).padStart(6, '0')}`, '2026-08-01', {
      Doc_File_ID: `bulk-doc-${index + 1}`
    })
  ));
  const documents = Object.fromEntries(rows.map((row) => [row.Doc_File_ID, { text: 'x' }]));
  const env = createFakeEnvironment({ meetingRows: rows, pitchbookRows: [], documents });
  const preview = ksp.kspRunKnowledgeExportPreview_(env, baseInput({ sourceType: 'Meeting' }));
  assert.equal(preview.ok, true);
  assert.equal(preview.preview.hardStop, true);
  const result = ksp.kspRunKnowledgeExportCreation_(env, {
    ...baseInput({ sourceType: 'Meeting' }),
    previewFingerprint: preview.preview.previewFingerprint,
    outputType: 'PDF'
  });
  assert.equal(result.ok, false);
  assert.equal(result.error.code, 'KNOWLEDGE_EXPORT_LIMIT_EXCEEDED');
  assert.equal(env._debug.artifacts.length, 0);
  assert.deepEqual(env._debug.reads, [], 'Index hard-stop must not read Meeting Docs');
});

test('source link identity mismatches fail closed before reading or creating artifacts', () => {
  const meetingEnv = createFakeEnvironment({
    meetingRows: [meetingRow('MTG-000001', '2026-08-01', {
      Doc_File_ID: 'doc-authoritative',
      Doc_URL: 'https://docs.google.com/document/d/doc-other/edit'
    })],
    pitchbookRows: []
  });
  const meetingResult = ksp.kspRunKnowledgeExportPreview_(meetingEnv, baseInput({ sourceType: 'Meeting' }));
  assert.equal(meetingResult.ok, false);
  assert.equal(meetingResult.error.code, 'KNOWLEDGE_EXPORT_MEETING_LINK_MISMATCH');
  assert.deepEqual(meetingEnv._debug.reads, []);

  const pitchbookEnv = createFakeEnvironment({
    meetingRows: [],
    pitchbookRows: [pitchbookRow('DOC-000001', '2026-08-01', {
      File_ID: 'file-authoritative',
      File_URL: 'https://drive.google.com/file/d/file-other/view'
    })]
  });
  const pitchbookResult = ksp.kspRunKnowledgeExportPreview_(pitchbookEnv, baseInput({ sourceType: 'Pitchbook' }));
  assert.equal(pitchbookResult.ok, false);
  assert.equal(pitchbookResult.error.code, 'KNOWLEDGE_EXPORT_PITCHBOOK_LINK_MISMATCH');
  assert.deepEqual(pitchbookEnv._debug.artifacts, []);
});

test('zero-result preview is explicit and cannot create an artifact', () => {
  const env = createFakeEnvironment();
  const input = baseInput({ sourceType: 'Meeting', dateFrom: '2027-01-01', dateTo: '2027-01-31' });
  const preview = ksp.kspRunKnowledgeExportPreview_(env, input);
  assert.equal(preview.ok, true);
  assert.equal(preview.preview.noResults, true);
  assert.equal(preview.preview.meetingCount, 0);
  assert.equal(preview.preview.pitchbookCount, 0);
  const result = ksp.kspRunKnowledgeExportCreation_(env, {
    ...input,
    previewFingerprint: preview.preview.previewFingerprint,
    outputType: 'PDF'
  });
  assert.equal(result.ok, false);
  assert.equal(result.error.code, 'KNOWLEDGE_EXPORT_NO_RESULTS');
  assert.equal(env._debug.artifacts.length, 0);
});

test('all five prompts are provider-neutral and independent of Gemini state', () => {
  const env = createFakeEnvironment();
  const modes = Array.from(ksp.kspGetKnowledgeExportModeDefinitions_(), (definition) => definition.mode);
  assert.deepEqual(modes, ['自由質問', '要約', '時系列', '比較', '面談準備']);
  modes.forEach((mode) => {
    const result = ksp.kspGetKnowledgeExportPrompt_(env, baseInput({
      mode,
      gpId: mode === '面談準備' ? 'GP-000002' : '',
      questionOrInstruction: mode === '自由質問' ? '合意事項を整理してください。' : ''
    }));
    assert.equal(result.ok, true, `${mode}: ${JSON.stringify(result)}`);
    assert.doesNotMatch(result.prompt, /Gemini|File Search|Citation|citation/i);
    assert.match(result.prompt, /Pitchbook本文は含みません/);
    assert.match(result.prompt, /別途アップロード/);
  });
  assert.equal(env._debug.audits.length, 0);
});

test('prompt filters use readable master names alongside stable IDs', () => {
  const env = createFakeEnvironment();
  const result = ksp.kspGetKnowledgeExportPrompt_(env, baseInput({
    mode: '比較',
    gpId: 'GP-000001',
    assetClassId: 'OPT-AC-002',
    capitalTypeId: 'OPT-CT-001'
  }));
  assert.equal(result.ok, true, JSON.stringify(result));
  assert.match(result.prompt, /GP: Apollo \(GP-000001\)/);
  assert.match(result.prompt, /Asset Class: Infrastructure \(OPT-AC-002\)/);
  assert.match(result.prompt, /Equity \/ Debt: Equity \(OPT-CT-001\)/);
});

test('prompt-copy audit is metadata-only and occurs only on the explicit copy record call', () => {
  const env = createFakeEnvironment();
  const input = baseInput({ mode: '要約', questionOrInstruction: 'リスクを整理してください。' });
  const prompt = ksp.kspGetKnowledgeExportPrompt_(env, input);
  assert.equal(prompt.ok, true);
  assert.equal(env._debug.audits.length, 0);
  const copied = ksp.kspRecordKnowledgeExportPromptCopy_(env, { ...input, copyConfirmed: true });
  assert.equal(copied.ok, true);
  assert.equal(env._debug.audits.length, 1);
  assert.equal(env._debug.audits[0].Action, 'KNOWLEDGE_EXPORT_PROMPT_COPY');
  assert.equal(env._debug.audits[0].Question_Or_Instruction, '');
  assert.doesNotMatch(JSON.stringify(env._debug.audits), /リスクを整理/);
  const unconfirmed = ksp.kspRecordKnowledgeExportPromptCopy_(env, input);
  assert.equal(unconfirmed.ok, false);
  assert.equal(unconfirmed.error.code, 'KNOWLEDGE_EXPORT_COPY_NOT_CONFIRMED');
  assert.equal(env._debug.audits.length, 1);
});

test('source integrity failures and audit failures do not create a false artifact', () => {
  const readFailureEnv = createFakeEnvironment({ documentReadError: 'private source URL SECRET_SENTINEL' });
  const readFailure = ksp.kspRunKnowledgeExportPreview_(readFailureEnv, baseInput({ sourceType: 'Meeting' }));
  assert.equal(readFailure.ok, false);
  assert.equal(readFailure.error.code, 'KNOWLEDGE_EXPORT_MEETING_DOCUMENT_READ_FAILED');
  assert.match(readFailure.error.message, /MTG-000001/);
  assert.doesNotMatch(JSON.stringify(readFailure), /SECRET_SENTINEL|private source URL/);

  const auditFailureEnv = createFakeEnvironment({ auditError: true });
  const preview = ksp.kspRunKnowledgeExportPreview_(auditFailureEnv, baseInput({ sourceType: 'Meeting' }));
  assert.equal(preview.ok, true);
  assert.ok(preview.warnings.some((warning) => warning.code === 'AUDIT_WRITE_FAILED'));
  const result = ksp.kspRunKnowledgeExportCreation_(auditFailureEnv, {
    ...baseInput({ sourceType: 'Meeting' }),
    previewFingerprint: preview.preview.previewFingerprint,
    outputType: 'PDF'
  });
  assert.equal(result.ok, true);
  assert.equal(auditFailureEnv._debug.artifacts.length, 1);
});

test('artifact cleanup warnings are non-secret and retained as Audit metadata', () => {
  const env = createFakeEnvironment({
    artifactWarnings: [{ code: 'KNOWLEDGE_EXPORT_TEMP_DOCUMENT_CLEANUP_FAILED', message: 'PRIVATE_API_RESPONSE' }]
  });
  const input = baseInput({ sourceType: 'Meeting' });
  const preview = ksp.kspRunKnowledgeExportPreview_(env, input);
  const result = ksp.kspRunKnowledgeExportCreation_(env, {
    ...input,
    previewFingerprint: preview.preview.previewFingerprint,
    outputType: 'PDF'
  });
  assert.equal(result.ok, true);
  assert.ok(result.warnings.some((warning) => warning.code === 'KNOWLEDGE_EXPORT_TEMP_DOCUMENT_CLEANUP_FAILED'));
  assert.doesNotMatch(JSON.stringify(result), /PRIVATE_API_RESPONSE/);
  const audit = env._debug.audits.at(-1);
  assert.match(audit.After_Metadata_JSON, /KNOWLEDGE_EXPORT_TEMP_DOCUMENT_CLEANUP_FAILED/);
  assert.doesNotMatch(audit.After_Metadata_JSON, /PRIVATE_API_RESPONSE/);
});

test('Docs and PDF live adapter paths write the model, validate the folder, and clean temporary PDF Docs', () => {
  const originalMaintenanceEnvironment = ksp.kspCreateMaintenanceEnvironment_;
  const originalDrive = ksp.Drive;
  const originalDocumentApp = ksp.DocumentApp;
  const originalScriptApp = ksp.ScriptApp;
  const originalUrlFetchApp = ksp.UrlFetchApp;
  const calls = { creates: [], fetches: [], trashed: [], paragraphs: [], links: [], pageBreaks: 0 };
  let createCount = 0;
  ksp.kspCreateMaintenanceEnvironment_ = () => ({
    getInstallationState() {
      return { config: { knowledgeParentFolderId: 'parent-synthetic' } };
    }
  });
  ksp.Drive = {
    Files: {
      get(id) {
        assert.equal(id, 'exports-synthetic');
        return {
          id,
          mimeType: 'application/vnd.google-apps.folder',
          parents: ['parent-synthetic'],
          trashed: false
        };
      },
      create(resource) {
        createCount += 1;
        const file = {
          id: `adapter-${createCount}`,
          name: resource.name,
          mimeType: resource.mimeType,
          parents: ['exports-synthetic'],
          trashed: false,
          webViewLink: resource.mimeType === 'application/pdf'
            ? 'https://drive.google.com/open?id=adapter-pdf'
            : 'https://docs.google.com/document/d/adapter-doc/edit'
        };
        calls.creates.push(file);
        return file;
      },
      update(_resource, fileId) {
        calls.trashed.push(fileId);
        return { id: fileId, trashed: true };
      }
    }
  };
  ksp.ScriptApp = {
    getOAuthToken() {
      return 'synthetic-oauth-token';
    }
  };
  ksp.UrlFetchApp = {
    fetch(url, options) {
      calls.fetches.push({ url, options });
      return {
        getResponseCode() { return 200; },
        getBlob() { return { getBytes: () => [37, 80, 68, 70] }; }
      };
    }
  };
  ksp.DocumentApp = {
    ParagraphHeading: { TITLE: 'TITLE', HEADING1: 'HEADING1' },
    openById() {
      return {
        getBody() {
          return {
            clear() { return this; },
            appendParagraph(text) {
              calls.paragraphs.push(String(text));
              return {
                setHeading() { return this; },
                editAsText() {
                  return {
                    setLinkUrl(start, end, url) {
                      calls.links.push({ text: String(text), start, end, url });
                    }
                  };
                }
              };
            },
            appendPageBreak() { calls.pageBreaks += 1; },
          };
        },
        saveAndClose() {}
      };
    }
  };

  const model = {
    title: 'Knowledge Export synthetic',
    meetingSections: [{ heading: 'Meeting MTG-000001', metadataLines: ['Meeting ID: MTG-000001'], body: 'SECRET_MEETING_BODY' }],
    pitchbookLines: ['Document ID: DOC-000001\nAuthoritative Drive link: https://drive.google.com/file/d/synthetic/view']
  };
  try {
    const environment = ksp.kspCreateKnowledgeExportEnvironment_();
    const docs = environment.createKnowledgeExportArtifact({
      folderId: 'exports-synthetic', filename: 'Knowledge_Export', outputType: 'GOOGLE_DOCS', model
    });
    assert.equal(docs.id, 'adapter-1');
    assert.equal(docs.url, 'https://docs.google.com/document/d/adapter-1/edit');
    const pdf = environment.createKnowledgeExportArtifact({
      folderId: 'exports-synthetic', filename: 'Knowledge_Export.pdf', outputType: 'PDF', model
    });
    assert.equal(pdf.id, 'adapter-3');
    assert.equal(pdf.url, 'https://drive.google.com/open?id=adapter-3');
    assert.equal(calls.fetches.length, 1);
    assert.equal(
      calls.fetches[0].url,
      'https://www.googleapis.com/drive/v3/files/adapter-2/export?mimeType=application%2Fpdf'
    );
    assert.equal(calls.fetches[0].options.method, 'get');
    assert.equal(calls.fetches[0].options.headers.Authorization, 'Bearer synthetic-oauth-token');
    assert.equal(calls.fetches[0].options.muteHttpExceptions, true);
    assert.deepEqual(calls.trashed, ['adapter-2']);
    assert.ok(calls.paragraphs.includes('SECRET_MEETING_BODY'));
    assert.ok(calls.links.some((link) => link.url === 'https://drive.google.com/file/d/synthetic/view'));
    assert.ok(calls.pageBreaks >= 1);
    assert.ok(calls.creates.every((file) => file.parents.includes('exports-synthetic')));
  } finally {
    ksp.kspCreateMaintenanceEnvironment_ = originalMaintenanceEnvironment;
    if (originalDrive === undefined) delete ksp.Drive;
    else ksp.Drive = originalDrive;
    if (originalDocumentApp === undefined) delete ksp.DocumentApp;
    else ksp.DocumentApp = originalDocumentApp;
    if (originalScriptApp === undefined) delete ksp.ScriptApp;
    else ksp.ScriptApp = originalScriptApp;
    if (originalUrlFetchApp === undefined) delete ksp.UrlFetchApp;
    else ksp.UrlFetchApp = originalUrlFetchApp;
  }
});
