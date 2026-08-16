function kspGetKnowledgeExportActorSafely(environment, warnings) {
  try {
    return environment.getActor() || 'UNIDENTIFIED';
  } catch (error) {
    warnings.push({ code: 'ACTOR_RESOLUTION_FAILED', message: kspKnowledgeExportSafeWarning('ACTOR_RESOLUTION_FAILED') });
    return 'UNIDENTIFIED';
  }
}

function kspTryAppendKnowledgeExportAudit(environment, auditSpreadsheetId, row, warnings) {
  if (!auditSpreadsheetId) return;
  try {
    environment.appendRow(auditSpreadsheetId, KSP_SHEET_NAMES.AUDIT_LOG, row);
  } catch (error) {
    warnings.push({ code: 'AUDIT_WRITE_FAILED', message: kspKnowledgeExportSafeWarning('AUDIT_WRITE_FAILED') });
  }
}

function kspKnowledgeExportCounts(preview) {
  return {
    meetingCount: Number(preview.meetingCount || 0),
    meetingCharacterCount: Number(preview.meetingCharacterCount || 0),
    pitchbookCount: Number(preview.pitchbookCount || 0)
  };
}

function kspMaterializeKnowledgeExportSources(environment, sources) {
  var meetings = [];
  var pitchbooks = [];

  (sources || []).forEach(function (source) {
    var row = source.row || {};
    if (source.sourceType === KSP_KNOWLEDGE_EXPORT_SOURCE_TYPES.MEETING) {
      if (!String(row.Doc_File_ID || '')) {
        throw kspKnowledgeExportSourceError('KNOWLEDGE_EXPORT_MEETING_DOCUMENT_MISSING', source.sourceId,
          'Meetingの権威あるGoogle Docがありません。');
      }
      if (!kspIsKnowledgeExportDriveUrl(row.Doc_URL)) {
        throw kspKnowledgeExportSourceError('KNOWLEDGE_EXPORT_MEETING_URL_MISSING', source.sourceId,
          'Meetingの権威あるDriveリンクがありません。');
      }
      var body;
      try {
        body = environment.getDocumentText(String(row.Doc_File_ID));
      } catch (error) {
        throw kspKnowledgeExportSourceError('KNOWLEDGE_EXPORT_MEETING_DOCUMENT_READ_FAILED', source.sourceId,
          'Meetingの権威あるGoogle Docを読み取れません。');
      }
      if (body === null || body === undefined) {
        throw kspKnowledgeExportSourceError('KNOWLEDGE_EXPORT_MEETING_DOCUMENT_READ_FAILED', source.sourceId,
          'Meetingの権威あるGoogle Docを読み取れません。');
      }
      body = String(body);
      source.contentToken = body.length + ':' + kspKnowledgeExportHash(body);
      meetings.push({ source: source, body: body });
    } else {
      if (!kspIsKnowledgeExportDriveUrl(row.File_URL)) {
        throw kspKnowledgeExportSourceError('KNOWLEDGE_EXPORT_PITCHBOOK_URL_MISSING', source.sourceId,
          'Pitchbookの権威あるDriveリンクがありません。');
      }
      pitchbooks.push({ source: source });
    }
  });

  return { meetings: meetings, pitchbooks: pitchbooks };
}

function kspBuildKnowledgeExportPreviewFromMaterials(input, sources, materials) {
  var meetingCharacterCount = (materials.meetings || []).reduce(function (total, item) {
    return total + item.body.length;
  }, 0);
  var counts = {
    meetingCount: (materials.meetings || []).length,
    meetingCharacterCount: meetingCharacterCount,
    pitchbookCount: (materials.pitchbooks || []).length
  };
  var limits = kspBuildKnowledgeExportLimitState(
    counts.meetingCount, counts.meetingCharacterCount, counts.pitchbookCount
  );
  var sourceIds = (sources || []).map(function (source) { return source.sourceId; });
  return {
    workId: KSP_KNOWLEDGE_EXPORT_WORK_ID,
    filters: kspKnowledgeExportPublicFilters(input),
    mode: input.mode,
    meetingCount: counts.meetingCount,
    meetingCharacterCount: counts.meetingCharacterCount,
    pitchbookCount: counts.pitchbookCount,
    warning: limits.warning,
    warningReasons: limits.warningReasons,
    hardStop: limits.hardStop,
    hardStopReasons: limits.hardStopReasons,
    noResults: sourceIds.length === 0,
    sourceIds: sourceIds,
    previewFingerprint: kspBuildKnowledgeExportFingerprint(sources, input)
  };
}

function kspKnowledgeExportErrorResponse(error, warnings, preview) {
  var response = {
    ok: false,
    workId: KSP_KNOWLEDGE_EXPORT_WORK_ID,
    error: (function () {
      var code = kspGetErrorCode(error);
      return { code: code, message: kspKnowledgeExportSafeMessage(code, error) };
    }()),
    warnings: warnings || []
  };
  if (preview) response.preview = preview;
  if (preview) response.counts = kspKnowledgeExportCounts(preview);
  return response;
}

function kspRunKnowledgeExportPreview(environment, rawInput) {
  var warnings = [];
  var actor = kspGetKnowledgeExportActorSafely(environment, warnings);
  var input = kspNormalizeKnowledgeExportInput(rawInput);
  var context = null;
  var auditSpreadsheetId = '';
  var preview = null;
  var sources = [];

  try {
    context = environment.loadKnowledgeExportContext();
    auditSpreadsheetId = context.auditSpreadsheetId || '';
    var catalog = kspBuildKnowledgeSearchCatalog(context.gpRows, context.optionRows);
    input = kspValidateKnowledgeExportFilters(input, catalog);
    sources = kspResolveKnowledgeExportSources(context.meetingRows, context.pitchbookRows, input);
    var materials = kspMaterializeKnowledgeExportSources(environment, sources);
    preview = kspBuildKnowledgeExportPreviewFromMaterials(input, sources, materials);
    kspTryAppendKnowledgeExportAudit(environment, auditSpreadsheetId, kspBuildKnowledgeExportAuditRow({
      timestamp: environment.nowIso(),
      actor: actor,
      action: KSP_KNOWLEDGE_EXPORT_ACTIONS.PREVIEW,
      targetId: preview.previewFingerprint,
      result: KSP_AUDIT_RESULTS.SUCCESS,
      input: input,
      counts: kspKnowledgeExportCounts(preview),
      sourceIds: kspBuildKnowledgeExportSourceIdRepresentation(preview.sourceIds),
      metadata: { warning: preview.warning, hardStop: preview.hardStop, noResults: preview.noResults }
    }), warnings);
    return { ok: true, workId: KSP_KNOWLEDGE_EXPORT_WORK_ID, preview: preview, warnings: warnings };
  } catch (error) {
    if (context && auditSpreadsheetId) {
      kspTryAppendKnowledgeExportAudit(environment, auditSpreadsheetId, kspBuildKnowledgeExportAuditRow({
        timestamp: environment.nowIso(),
        actor: actor,
        action: KSP_KNOWLEDGE_EXPORT_ACTIONS.PREVIEW,
        targetId: preview ? preview.previewFingerprint : '',
        result: KSP_AUDIT_RESULTS.FAILURE,
        input: input,
        counts: preview ? kspKnowledgeExportCounts(preview) : {},
        sourceIds: kspBuildKnowledgeExportSourceIdRepresentation(sources.map(function (source) { return source.sourceId; })),
        errorCode: kspGetErrorCode(error),
        error: error,
        errorMessage: kspKnowledgeExportSafeMessage(kspGetErrorCode(error), error),
        metadata: {}
      }), warnings);
    }
    return kspKnowledgeExportErrorResponse(error, warnings, preview);
  }
}

function kspRunKnowledgeExportCreation(environment, rawInput) {
  var warnings = [];
  var actor = kspGetKnowledgeExportActorSafely(environment, warnings);
  var input = kspNormalizeKnowledgeExportInput(rawInput);
  var context = null;
  var auditSpreadsheetId = '';
  var preview = null;
  var sources = [];

  try {
    context = environment.loadKnowledgeExportContext();
    auditSpreadsheetId = context.auditSpreadsheetId || '';
    var catalog = kspBuildKnowledgeSearchCatalog(context.gpRows, context.optionRows);
    input = kspValidateKnowledgeExportFilters(input, catalog);
    input.outputType = kspValidateKnowledgeExportOutputType(input.outputType);
    kspAssert(input.previewFingerprint, 'KNOWLEDGE_EXPORT_PREVIEW_REQUIRED', '先に対象資料を確認してください。');
    sources = kspResolveKnowledgeExportSources(context.meetingRows, context.pitchbookRows, input);
    var materials = kspMaterializeKnowledgeExportSources(environment, sources);
    preview = kspBuildKnowledgeExportPreviewFromMaterials(input, sources, materials);
    if (preview.previewFingerprint !== input.previewFingerprint) {
      var staleError = new Error('プレビューが古くなっています。再度プレビューを実行してください。');
      staleError.code = 'KNOWLEDGE_EXPORT_PREVIEW_STALE';
      throw staleError;
    }
    kspAssert(!preview.noResults, 'KNOWLEDGE_EXPORT_NO_RESULTS', '一致するActiveな資料がありません。');
    kspAssert(!preview.hardStop,
      'KNOWLEDGE_EXPORT_LIMIT_EXCEEDED',
      preview.hardStopReasons.join(' ') + ' フィルターを絞ってください。');

    var maps = kspBuildAllMasterMaps(context.gpRows, context.optionRows);
    var title = kspBuildKnowledgeExportFilename(input, environment.nowIso(), input.outputType);
    var renderModel = kspBuildKnowledgeExportRenderModel(input, materials.meetings, materials.pitchbooks, maps, title);
    var artifact = environment.createKnowledgeExportArtifact({
      folderId: context.knowledgeExportsFolderId,
      filename: title,
      outputType: input.outputType,
      model: renderModel
    });
    kspAssert(artifact && artifact.id, 'KNOWLEDGE_EXPORT_ARTIFACT_MISSING', '生成された書き出しのIDを確認できません。');
    kspAssert(artifact.url && kspIsKnowledgeExportDriveUrl(artifact.url),
      'KNOWLEDGE_EXPORT_ARTIFACT_URL_MISSING', '生成された書き出しのDriveリンクを確認できません。');
    if (artifact.warnings && artifact.warnings.length) {
      warnings = warnings.concat(artifact.warnings.map(function (warning) {
        var code = String(warning && warning.code || 'KNOWLEDGE_EXPORT_ARTIFACT_WARNING');
        return { code: code, message: kspKnowledgeExportSafeWarning(code) };
      }));
    }

    kspTryAppendKnowledgeExportAudit(environment, auditSpreadsheetId, kspBuildKnowledgeExportAuditRow({
      timestamp: environment.nowIso(),
      actor: actor,
      action: kspKnowledgeExportActionForOutput(input.outputType),
      targetId: artifact.id,
      result: KSP_AUDIT_RESULTS.SUCCESS,
      input: input,
      counts: kspKnowledgeExportCounts(preview),
      sourceIds: kspBuildKnowledgeExportSourceIdRepresentation(preview.sourceIds),
      metadata: {
        outputType: input.outputType,
        artifactId: artifact.id,
        driveUrl: artifact.url,
        filename: artifact.name || title,
        warningCount: warnings.length,
        warningCodes: warnings.map(function (warning) { return warning.code; })
      }
    }), warnings);
    return {
      ok: true,
      workId: KSP_KNOWLEDGE_EXPORT_WORK_ID,
      artifact: { id: artifact.id, url: artifact.url, name: artifact.name || title, outputType: input.outputType },
      preview: preview,
      warnings: warnings
    };
  } catch (error) {
    if (context && auditSpreadsheetId) {
      kspTryAppendKnowledgeExportAudit(environment, auditSpreadsheetId, kspBuildKnowledgeExportAuditRow({
        timestamp: environment.nowIso(),
        actor: actor,
        action: kspKnowledgeExportActionForOutput(input.outputType),
        targetId: '',
        result: KSP_AUDIT_RESULTS.FAILURE,
        input: input,
        counts: preview ? kspKnowledgeExportCounts(preview) : {},
        sourceIds: kspBuildKnowledgeExportSourceIdRepresentation(sources.map(function (source) { return source.sourceId; })),
        errorCode: kspGetErrorCode(error),
        error: error,
        errorMessage: kspKnowledgeExportSafeMessage(kspGetErrorCode(error), error),
        metadata: {}
      }), warnings);
    }
    return kspKnowledgeExportErrorResponse(error, warnings, preview);
  }
}

function kspGetKnowledgeExportPrompt(environment, rawInput) {
  try {
    var context = environment.loadKnowledgeExportContext();
    var input = kspValidateKnowledgeExportPromptInput(
      kspNormalizeKnowledgeExportInput(rawInput),
      kspBuildKnowledgeSearchCatalog(context.gpRows, context.optionRows)
    );
    return {
      ok: true,
      workId: KSP_KNOWLEDGE_EXPORT_WORK_ID,
      mode: input.mode,
      filters: kspKnowledgeExportPublicFilters(input),
      prompt: kspBuildKnowledgeExportPrompt(input)
    };
  } catch (error) {
    return kspKnowledgeExportErrorResponse(error, []);
  }
}

function kspRecordKnowledgeExportPromptCopy(environment, rawInput) {
  var warnings = [];
  var actor = kspGetKnowledgeExportActorSafely(environment, warnings);
  var input = kspNormalizeKnowledgeExportInput(rawInput);
  var context = null;
  var auditSpreadsheetId = '';
  try {
    context = environment.loadKnowledgeExportContext();
    auditSpreadsheetId = context.auditSpreadsheetId || '';
    input = kspValidateKnowledgeExportCopyInput(input,
      kspBuildKnowledgeSearchCatalog(context.gpRows, context.optionRows));
    kspTryAppendKnowledgeExportAudit(environment, auditSpreadsheetId, kspBuildKnowledgeExportAuditRow({
      timestamp: environment.nowIso(),
      actor: actor,
      action: KSP_KNOWLEDGE_EXPORT_ACTIONS.PROMPT_COPY,
      result: KSP_AUDIT_RESULTS.SUCCESS,
      input: input,
      metadata: { copied: true }
    }), warnings);
    return { ok: true, workId: KSP_KNOWLEDGE_EXPORT_WORK_ID, warnings: warnings };
  } catch (error) {
    return kspKnowledgeExportErrorResponse(error, warnings);
  }
}
