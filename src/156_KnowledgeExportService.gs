function kspGetKnowledgeExportActorSafely_(environment, warnings) {
  try {
    return environment.getActor() || 'UNIDENTIFIED';
  } catch (error) {
    warnings.push({ code: 'ACTOR_RESOLUTION_FAILED', message: kspKnowledgeExportSafeWarning_('ACTOR_RESOLUTION_FAILED') });
    return 'UNIDENTIFIED';
  }
}

function kspTryAppendKnowledgeExportAudit_(environment, auditSpreadsheetId, row, warnings) {
  if (!auditSpreadsheetId) return;
  try {
    environment.appendRow(auditSpreadsheetId, KSP_SHEET_NAMES.AUDIT_LOG, row);
  } catch (error) {
    warnings.push({ code: 'AUDIT_WRITE_FAILED', message: kspKnowledgeExportSafeWarning_('AUDIT_WRITE_FAILED') });
  }
}

function kspKnowledgeExportCounts_(preview) {
  return {
    meetingCount: Number(preview.meetingCount || 0),
    meetingCharacterCount: Number(preview.meetingCharacterCount || 0),
    pitchbookCount: Number(preview.pitchbookCount || 0)
  };
}

function kspKnowledgeExportIndexCounts_(sources) {
  return (sources || []).reduce(function (counts, source) {
    if (source.sourceType === KSP_KNOWLEDGE_EXPORT_SOURCE_TYPES.MEETING) counts.meetingCount += 1;
    if (source.sourceType === KSP_KNOWLEDGE_EXPORT_SOURCE_TYPES.PITCHBOOK) counts.pitchbookCount += 1;
    return counts;
  }, { meetingCount: 0, pitchbookCount: 0 });
}

function kspKnowledgeExportAssertBudget_(budget) {
  if (Date.now() - budget.startedAt > KSP_KNOWLEDGE_EXPORT_LIMITS.MAX_PREVIEW_MILLIS) {
    var error = new Error('Knowledge Export preview budget exceeded.');
    error.code = 'KNOWLEDGE_EXPORT_PREVIEW_BUDGET_EXCEEDED';
    throw error;
  }
}

function kspBuildKnowledgeExportIndexPreview_(input, sources, catalog) {
  var counts = kspKnowledgeExportIndexCounts_(sources);
  var limits = kspBuildKnowledgeExportLimitState_(counts.meetingCount, 0, counts.pitchbookCount);
  var sourceIds = (sources || []).slice(0, KSP_KNOWLEDGE_EXPORT_LIMITS.MAX_SOURCE_ID_REPORT)
    .map(function (source) { return source.sourceId; });
  return {
    workId: KSP_KNOWLEDGE_EXPORT_WORK_ID,
    filters: kspKnowledgeExportPublicFilters_(input),
    mode: input.mode,
    meetingCount: counts.meetingCount,
    meetingCharacterCount: null,
    characterCountDeferred: true,
    pitchbookCount: counts.pitchbookCount,
    warning: limits.warning,
    warningReasons: limits.warningReasons,
    hardStop: limits.hardStop,
    hardStopReasons: limits.hardStopReasons,
    noResults: sourceIds.length === 0 && counts.meetingCount + counts.pitchbookCount === 0,
    sourceIds: sourceIds,
    sourceIdCount: (sources || []).length,
    previewFingerprint: kspBuildKnowledgeExportFingerprint_(sources, input, catalog)
  };
}

function kspMaterializeKnowledgeExportSources_(environment, sources, budget) {
  var meetings = [];
  var pitchbooks = [];
  var materializationBudget = budget || { startedAt: Date.now(), meetingReads: 0 };

  (sources || []).forEach(function (source) {
    kspKnowledgeExportAssertBudget_(materializationBudget);
    var row = source.row || {};
    if (source.sourceType === KSP_KNOWLEDGE_EXPORT_SOURCE_TYPES.MEETING) {
      var documentId = String(row.Doc_File_ID || '');
      if (!documentId) {
        throw kspKnowledgeExportSourceError_('KNOWLEDGE_EXPORT_MEETING_DOCUMENT_MISSING', source.sourceId,
          'Meetingの権威あるGoogle Docがありません。');
      }
      if (!kspIsKnowledgeExportDriveUrl_(row.Doc_URL)) {
        throw kspKnowledgeExportSourceError_('KNOWLEDGE_EXPORT_MEETING_URL_MISSING', source.sourceId,
          'Meetingの権威あるDriveリンクがありません。');
      }
      if (!kspKnowledgeExportUrlMatchesId_(row.Doc_URL, documentId)) {
        throw kspKnowledgeExportSourceError_('KNOWLEDGE_EXPORT_MEETING_LINK_MISMATCH', source.sourceId,
          'MeetingのGoogle Docリンクと安定IDが一致しません。');
      }
      var body;
      try {
        body = environment.getDocumentText(documentId);
      } catch (error) {
        throw kspKnowledgeExportSourceError_('KNOWLEDGE_EXPORT_MEETING_DOCUMENT_READ_FAILED', source.sourceId,
          'Meetingの権威あるGoogle Docを読み取れません。');
      }
      materializationBudget.meetingReads += 1;
      kspKnowledgeExportAssertBudget_(materializationBudget);
      if (body === null || body === undefined) {
        throw kspKnowledgeExportSourceError_('KNOWLEDGE_EXPORT_MEETING_DOCUMENT_READ_FAILED', source.sourceId,
          'Meetingの権威あるGoogle Docを読み取れません。');
      }
      body = String(body);
      source.contentToken = body.length + ':' + kspKnowledgeExportHash_(body);
      source.canonicalUrl = kspBuildKnowledgeExportCanonicalUrl_(KSP_KNOWLEDGE_EXPORT_SOURCE_TYPES.MEETING, documentId);
      meetings.push({ source: source, body: body });
    } else {
      var fileId = String(row.File_ID || '');
      if (!fileId) {
        throw kspKnowledgeExportSourceError_('KNOWLEDGE_EXPORT_PITCHBOOK_FILE_MISSING', source.sourceId,
          'Pitchbookの権威あるDriveファイルがありません。');
      }
      if (!kspIsKnowledgeExportDriveUrl_(row.File_URL)) {
        throw kspKnowledgeExportSourceError_('KNOWLEDGE_EXPORT_PITCHBOOK_URL_MISSING', source.sourceId,
          'Pitchbookの権威あるDriveリンクがありません。');
      }
      if (!kspKnowledgeExportUrlMatchesId_(row.File_URL, fileId)) {
        throw kspKnowledgeExportSourceError_('KNOWLEDGE_EXPORT_PITCHBOOK_LINK_MISMATCH', source.sourceId,
          'PitchbookのDriveリンクと安定IDが一致しません。');
      }
      // FULL_EXPORT is deliberately reference-only for Pitchbooks. The authoritative
      // Index row already supplies the stable file ID and URL, so this path must not
      // call Drive metadata/media adapters or inspect source bytes.
      source.canonicalUrl = kspBuildKnowledgeExportCanonicalUrl_(KSP_KNOWLEDGE_EXPORT_SOURCE_TYPES.PITCHBOOK, fileId);
      source.referenceOnly = true;
      pitchbooks.push({ source: source });
    }
  });

  return { meetings: meetings, pitchbooks: pitchbooks };
}

function kspBuildKnowledgeExportPreviewFromMaterials_(input, sources, materials, catalog, masterMaps) {
  var meetingCharacterCount = (materials.meetings || []).reduce(function (total, item) {
    return total + item.body.length;
  }, 0);
  var counts = {
    meetingCount: (materials.meetings || []).length,
    meetingCharacterCount: meetingCharacterCount,
    pitchbookCount: (materials.pitchbooks || []).length
  };
  var limits = kspBuildKnowledgeExportLimitState_(
    counts.meetingCount, counts.meetingCharacterCount, counts.pitchbookCount
  );
  var sourceIds = (sources || []).slice(0, KSP_KNOWLEDGE_EXPORT_LIMITS.MAX_SOURCE_ID_REPORT)
    .map(function (source) { return source.sourceId; });
  var renderModel = kspBuildKnowledgeExportRenderModel_(
    input,
    materials.meetings,
    materials.pitchbooks,
    masterMaps || { gp: {}, assetClass: {}, capitalType: {}, location: {}, team: {}, counterparty: {} },
    kspBuildKnowledgeExportPackageTitle_(input)
  );
  var packageText = kspBuildKnowledgeExportPlainText_(renderModel);
  var previewFingerprint = kspBuildKnowledgeExportFingerprint_(sources, input, catalog);
  return {
    workId: KSP_KNOWLEDGE_EXPORT_WORK_ID,
    filters: kspKnowledgeExportPublicFilters_(input),
    mode: input.mode,
    meetingCount: counts.meetingCount,
    meetingCharacterCount: counts.meetingCharacterCount,
    pitchbookCount: counts.pitchbookCount,
    warning: limits.warning,
    warningReasons: limits.warningReasons,
    hardStop: limits.hardStop,
    hardStopReasons: limits.hardStopReasons,
    noResults: (sources || []).length === 0,
    sourceIds: sourceIds,
    sourceIdCount: (sources || []).length,
    previewFingerprint: previewFingerprint,
    packageFingerprint: previewFingerprint,
    packageText: packageText,
    meetingPreviewText: (materials.meetings || []).map(function (item) { return item.body; }).join('\n\n'),
    pitchbookReferenceLines: (renderModel.pitchbookLines || []).slice(),
    pitchbookReferencesOnly: true
  };
}

function kspKnowledgeExportErrorResponse_(error, warnings, preview) {
  var response = {
    ok: false,
    workId: KSP_KNOWLEDGE_EXPORT_WORK_ID,
    error: (function () {
      var code = kspGetErrorCode_(error);
      return { code: code, message: kspKnowledgeExportSafeMessage_(code, error) };
    }()),
    warnings: warnings || []
  };
  if (preview) response.preview = preview;
  if (preview) response.counts = kspKnowledgeExportCounts_(preview);
  return response;
}

function kspRunKnowledgeExportPreview_(environment, rawInput) {
  var warnings = [];
  var actor = kspGetKnowledgeExportActorSafely_(environment, warnings);
  var input = kspNormalizeKnowledgeExportInput_(rawInput);
  var context = null;
  var auditSpreadsheetId = '';
  var preview = null;
  var sources = [];

  try {
    kspAssert_(kspClaimPublicOperation_(environment, 'KNOWLEDGE_EXPORT_PREVIEW', actor, '',
      KSP_KNOWLEDGE_EXPORT_LIMITS.THROTTLE_SECONDS), 'KNOWLEDGE_EXPORT_RATE_LIMITED',
      '少し待ってから再試行してください。');
    context = environment.loadKnowledgeExportContext();
    auditSpreadsheetId = context.auditSpreadsheetId || '';
    var catalog = kspBuildKnowledgeSearchCatalog_(context.gpRows, context.optionRows);
    input = kspValidateKnowledgeExportFilters_(input, catalog);
    sources = kspResolveKnowledgeExportSources_(context.meetingRows, context.pitchbookRows, input);
    var indexCounts = kspKnowledgeExportIndexCounts_(sources);
    var indexLimits = kspBuildKnowledgeExportLimitState_(indexCounts.meetingCount, 0, indexCounts.pitchbookCount);
    if (indexLimits.hardStop) {
      preview = kspBuildKnowledgeExportIndexPreview_(input, sources, catalog);
    } else {
      var materials = kspMaterializeKnowledgeExportSources_(environment, sources, { startedAt: Date.now(), meetingReads: 0 });
      preview = kspBuildKnowledgeExportPreviewFromMaterials_(input, sources, materials, catalog,
        kspBuildAllMasterMaps_(context.gpRows, context.optionRows));
    }
    kspTryAppendKnowledgeExportAudit_(environment, auditSpreadsheetId, kspBuildKnowledgeExportAuditRow_({
      timestamp: environment.nowIso(),
      actor: actor,
      action: KSP_KNOWLEDGE_EXPORT_ACTIONS.PREVIEW,
      targetId: preview.previewFingerprint,
      result: KSP_AUDIT_RESULTS.SUCCESS,
      input: input,
      counts: kspKnowledgeExportCounts_(preview),
      sourceIds: kspBuildKnowledgeExportSourceIdRepresentation_(preview.sourceIds),
      metadata: { warning: preview.warning, hardStop: preview.hardStop, noResults: preview.noResults }
    }), warnings);
    return { ok: true, workId: KSP_KNOWLEDGE_EXPORT_WORK_ID, preview: preview, warnings: warnings };
  } catch (error) {
    if (context && auditSpreadsheetId) {
      kspTryAppendKnowledgeExportAudit_(environment, auditSpreadsheetId, kspBuildKnowledgeExportAuditRow_({
        timestamp: environment.nowIso(),
        actor: actor,
        action: KSP_KNOWLEDGE_EXPORT_ACTIONS.PREVIEW,
        targetId: preview ? preview.previewFingerprint : '',
        result: KSP_AUDIT_RESULTS.FAILURE,
        input: input,
        counts: preview ? kspKnowledgeExportCounts_(preview) : {},
        sourceIds: kspBuildKnowledgeExportSourceIdRepresentation_(sources.map(function (source) { return source.sourceId; })),
        errorCode: kspGetErrorCode_(error),
        error: error,
        errorMessage: kspKnowledgeExportSafeMessage_(kspGetErrorCode_(error), error),
        metadata: {}
      }), warnings);
    }
    return kspKnowledgeExportErrorResponse_(error, warnings, preview);
  }
}

function kspRunKnowledgeExportCreation_(environment, rawInput) {
  var warnings = [];
  var actor = kspGetKnowledgeExportActorSafely_(environment, warnings);
  var input = kspNormalizeKnowledgeExportInput_(rawInput);
  var context = null;
  var auditSpreadsheetId = '';
  var preview = null;
  var sources = [];
  var idempotencyKey = '';

  try {
    context = environment.loadKnowledgeExportContext();
    auditSpreadsheetId = context.auditSpreadsheetId || '';
    var catalog = kspBuildKnowledgeSearchCatalog_(context.gpRows, context.optionRows);
    input = kspValidateKnowledgeExportFilters_(input, catalog);
    input.outputType = kspValidateKnowledgeExportOutputType_(input.outputType);
    kspAssert_(input.previewFingerprint, 'KNOWLEDGE_EXPORT_PREVIEW_REQUIRED', '先に対象資料を確認してください。');
    idempotencyKey = kspBuildPublicOperationCacheKey_('KNOWLEDGE_EXPORT_CREATE', actor,
      input.previewFingerprint + '|' + input.outputType);
    if (typeof environment.getPublicIdempotency === 'function') {
      var cachedResult = environment.getPublicIdempotency(idempotencyKey);
      if (cachedResult) {
        cachedResult.idempotentReplay = true;
        return cachedResult;
      }
    }
    kspAssert_(kspClaimPublicOperation_(environment, 'KNOWLEDGE_EXPORT_CREATE', actor,
      input.previewFingerprint + '|' + input.outputType, KSP_KNOWLEDGE_EXPORT_LIMITS.THROTTLE_SECONDS),
      'KNOWLEDGE_EXPORT_RATE_LIMITED', '少し待ってから再試行してください。');
    sources = kspResolveKnowledgeExportSources_(context.meetingRows, context.pitchbookRows, input);
    var indexCounts = kspKnowledgeExportIndexCounts_(sources);
    var indexLimits = kspBuildKnowledgeExportLimitState_(indexCounts.meetingCount, 0, indexCounts.pitchbookCount);
    var materials;
    if (indexLimits.hardStop) {
      preview = kspBuildKnowledgeExportIndexPreview_(input, sources, catalog);
      kspAssert_(!preview.hardStop, 'KNOWLEDGE_EXPORT_LIMIT_EXCEEDED',
        preview.hardStopReasons.join(' ') + ' フィルターを絞ってください。');
    } else {
      materials = kspMaterializeKnowledgeExportSources_(environment, sources, { startedAt: Date.now(), meetingReads: 0 });
      preview = kspBuildKnowledgeExportPreviewFromMaterials_(input, sources, materials, catalog,
        kspBuildAllMasterMaps_(context.gpRows, context.optionRows));
    }
    if (preview.previewFingerprint !== input.previewFingerprint) {
      var staleError = new Error('プレビューが古くなっています。再度プレビューを実行してください。');
      staleError.code = 'KNOWLEDGE_EXPORT_PREVIEW_STALE';
      throw staleError;
    }
    kspAssert_(!preview.noResults, 'KNOWLEDGE_EXPORT_NO_RESULTS', '一致するActiveな資料がありません。');
    kspAssert_(!preview.hardStop,
      'KNOWLEDGE_EXPORT_LIMIT_EXCEEDED',
      preview.hardStopReasons.join(' ') + ' フィルターを絞ってください。');

    var maps = kspBuildAllMasterMaps_(context.gpRows, context.optionRows);
    var title = kspBuildKnowledgeExportFilename_(input, environment.nowIso(), input.outputType);
    var renderModel = kspBuildKnowledgeExportRenderModel_(
      input, materials.meetings, materials.pitchbooks, maps,
      kspBuildKnowledgeExportPackageTitle_(input)
    );
    var packageText = kspBuildKnowledgeExportPlainText_(renderModel);
    kspAssert_(packageText === preview.packageText,
      'KNOWLEDGE_EXPORT_PACKAGE_CHANGED', '全文出力パッケージがプレビュー後に変更されています。');
    var artifact = environment.createKnowledgeExportArtifact({
      folderId: context.knowledgeExportsFolderId,
      filename: title,
      outputType: input.outputType,
      model: renderModel
    });
    kspAssert_(artifact && artifact.id, 'KNOWLEDGE_EXPORT_ARTIFACT_MISSING', '生成された書き出しのIDを確認できません。');
    kspAssert_(artifact.url && kspIsKnowledgeExportDriveUrl_(artifact.url),
      'KNOWLEDGE_EXPORT_ARTIFACT_URL_MISSING', '生成された書き出しのDriveリンクを確認できません。');
    kspAssert_(kspKnowledgeExportUrlMatchesId_(artifact.url, artifact.id),
      'KNOWLEDGE_EXPORT_ARTIFACT_URL_MISMATCH', '生成された書き出しのリンク整合性を確認できません。');
    if (artifact.warnings && artifact.warnings.length) {
      warnings = warnings.concat(artifact.warnings.map(function (warning) {
        var code = String(warning && warning.code || 'KNOWLEDGE_EXPORT_ARTIFACT_WARNING');
        return { code: code, message: kspKnowledgeExportSafeWarning_(code) };
      }));
    }

    kspTryAppendKnowledgeExportAudit_(environment, auditSpreadsheetId, kspBuildKnowledgeExportAuditRow_({
      timestamp: environment.nowIso(),
      actor: actor,
      action: kspKnowledgeExportActionForOutput_(input.outputType),
      targetId: artifact.id,
      result: KSP_AUDIT_RESULTS.SUCCESS,
      input: input,
      counts: kspKnowledgeExportCounts_(preview),
      sourceIds: kspBuildKnowledgeExportSourceIdRepresentation_(preview.sourceIds),
      metadata: {
        outputType: input.outputType,
        artifactId: artifact.id,
        driveUrl: artifact.url,
        filename: artifact.name || title,
        warningCount: warnings.length,
        warningCodes: warnings.map(function (warning) { return warning.code; })
      }
    }), warnings);
    var creationResult = {
      ok: true,
      workId: KSP_KNOWLEDGE_EXPORT_WORK_ID,
      artifact: { id: artifact.id, url: artifact.url, name: artifact.name || title, outputType: input.outputType },
      preview: preview,
      packageFingerprint: preview.packageFingerprint || preview.previewFingerprint,
      packageText: packageText,
      warnings: warnings
    };
    if (idempotencyKey && typeof environment.setPublicIdempotency === 'function') {
      environment.setPublicIdempotency(idempotencyKey, creationResult, KSP_KNOWLEDGE_EXPORT_LIMITS.IDEMPOTENCY_SECONDS);
    }
    return creationResult;
  } catch (error) {
    if (context && auditSpreadsheetId) {
      kspTryAppendKnowledgeExportAudit_(environment, auditSpreadsheetId, kspBuildKnowledgeExportAuditRow_({
        timestamp: environment.nowIso(),
        actor: actor,
        action: kspKnowledgeExportActionForOutput_(input.outputType),
        targetId: '',
        result: KSP_AUDIT_RESULTS.FAILURE,
        input: input,
        counts: preview ? kspKnowledgeExportCounts_(preview) : {},
        sourceIds: kspBuildKnowledgeExportSourceIdRepresentation_(sources.map(function (source) { return source.sourceId; })),
        errorCode: kspGetErrorCode_(error),
        error: error,
        errorMessage: kspKnowledgeExportSafeMessage_(kspGetErrorCode_(error), error),
        metadata: {}
      }), warnings);
    }
    return kspKnowledgeExportErrorResponse_(error, warnings, preview);
  }
}

function kspGetKnowledgeExportPrompt_(environment, rawInput) {
  try {
    var context = environment.loadKnowledgeExportContext();
    var catalog = kspBuildKnowledgeSearchCatalog_(context.gpRows, context.optionRows);
    var input = kspValidateKnowledgeExportPromptInput_(
      kspNormalizeKnowledgeExportInput_(rawInput),
      catalog
    );
    return {
      ok: true,
      workId: KSP_KNOWLEDGE_EXPORT_WORK_ID,
      mode: input.mode,
      filters: kspKnowledgeExportPublicFilters_(input),
      prompt: kspBuildKnowledgeExportPrompt_(input, catalog)
    };
  } catch (error) {
    return kspKnowledgeExportErrorResponse_(error, []);
  }
}

function kspRecordKnowledgeExportPromptCopy_(environment, rawInput) {
  var warnings = [];
  var actor = kspGetKnowledgeExportActorSafely_(environment, warnings);
  var input = kspNormalizeKnowledgeExportInput_(rawInput);
  var context = null;
  var auditSpreadsheetId = '';
  try {
    context = environment.loadKnowledgeExportContext();
    auditSpreadsheetId = context.auditSpreadsheetId || '';
    input = kspValidateKnowledgeExportCopyInput_(input,
      kspBuildKnowledgeSearchCatalog_(context.gpRows, context.optionRows));
    kspTryAppendKnowledgeExportAudit_(environment, auditSpreadsheetId, kspBuildKnowledgeExportAuditRow_({
      timestamp: environment.nowIso(),
      actor: actor,
      action: KSP_KNOWLEDGE_EXPORT_ACTIONS.PROMPT_COPY,
      result: KSP_AUDIT_RESULTS.SUCCESS,
      input: input,
      metadata: { copied: true }
    }), warnings);
    return { ok: true, workId: KSP_KNOWLEDGE_EXPORT_WORK_ID, warnings: warnings };
  } catch (error) {
    return kspKnowledgeExportErrorResponse_(error, warnings);
  }
}
