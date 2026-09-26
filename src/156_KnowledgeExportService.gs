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
    pitchbookCount: Number(preview.pitchbookCount || 0),
    newsCount: Number(preview.newsCount || 0),
    assessmentCount: Number(preview.assessmentCount || 0),
    sourceCount: Number(preview.sourceCount || 0),
    totalCharacterCount: Number(preview.totalCharacterCount || 0)
  };
}

function kspKnowledgeExportIndexCounts_(sources) {
  return (sources || []).reduce(function (counts, source) {
    if (source.sourceType === KSP_KNOWLEDGE_EXPORT_SOURCE_TYPES.MEETING) counts.meetingCount += 1;
    if (source.sourceType === KSP_KNOWLEDGE_EXPORT_SOURCE_TYPES.PITCHBOOK) counts.pitchbookCount += 1;
    if (source.sourceType === KSP_KNOWLEDGE_EXPORT_SOURCE_TYPES.NEWS) counts.newsCount += 1;
    if (source.sourceType === KSP_KNOWLEDGE_EXPORT_SOURCE_TYPES.ASSESSMENT) counts.assessmentCount += 1;
    counts.sourceCount += 1;
    return counts;
  }, { meetingCount: 0, pitchbookCount: 0, newsCount: 0, assessmentCount: 0, sourceCount: 0 });
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
    sourceTypes: input.sourceTypes,
    mode: input.mode,
    scopeSummary: kspKnowledgeScopeSummary_(input),
    meetingCount: counts.meetingCount,
    meetingCharacterCount: null,
    totalCharacterCount: null,
    characterCountDeferred: true,
    pitchbookCount: counts.pitchbookCount,
    newsCount: counts.newsCount,
    assessmentCount: counts.assessmentCount,
    sourceCount: counts.sourceCount,
    warning: limits.warning,
    warningReasons: limits.warningReasons,
    hardStop: limits.hardStop,
    hardStopReasons: limits.hardStopReasons,
    noResults: counts.sourceCount === 0,
    sourceIds: sourceIds,
    sourceIdCount: (sources || []).length,
    previewFingerprint: kspBuildKnowledgeExportFingerprint_(sources, input, catalog)
  };
}

function kspMaterializeKnowledgeExportSources_(environment, sources, budget) {
  var items = [];
  var materializationBudget = budget || { startedAt: Date.now(), meetingReads: 0 };
  (sources || []).forEach(function (source) {
    kspKnowledgeExportAssertBudget_(materializationBudget);
    var row = source.row || {};
    var fileId = String(source.fileId || '');
    var sourceUrl = String(source.sourceUrl || '');
    var isGoogleDoc = source.sourceType === KSP_KNOWLEDGE_EXPORT_SOURCE_TYPES.MEETING ||
      ((source.sourceType === KSP_KNOWLEDGE_EXPORT_SOURCE_TYPES.NEWS ||
        source.sourceType === KSP_KNOWLEDGE_EXPORT_SOURCE_TYPES.ASSESSMENT) &&
        String(row.Input_Mode || '') === 'DIRECT_TEXT');
    if (!fileId) {
      throw kspKnowledgeExportSourceError_(source.sourceType === KSP_KNOWLEDGE_EXPORT_SOURCE_TYPES.MEETING
        ? 'KNOWLEDGE_EXPORT_MEETING_DOCUMENT_MISSING' : 'KNOWLEDGE_EXPORT_SOURCE_INTEGRITY_FAILED',
      source.sourceId, '原本ファイルIDがありません。');
    }
    if (!kspIsKnowledgeExportDriveUrl_(sourceUrl)) {
      throw kspKnowledgeExportSourceError_(source.sourceType === KSP_KNOWLEDGE_EXPORT_SOURCE_TYPES.MEETING
        ? 'KNOWLEDGE_EXPORT_MEETING_URL_MISSING' : 'KNOWLEDGE_EXPORT_SOURCE_INTEGRITY_FAILED',
      source.sourceId, '原本リンクがありません。');
    }
    if (!kspKnowledgeExportUrlMatchesId_(sourceUrl, fileId)) {
      throw kspKnowledgeExportSourceError_(source.sourceType === KSP_KNOWLEDGE_EXPORT_SOURCE_TYPES.MEETING
        ? 'KNOWLEDGE_EXPORT_MEETING_LINK_MISMATCH' : 'KNOWLEDGE_EXPORT_SOURCE_INTEGRITY_FAILED',
      source.sourceId, '原本リンクとファイルIDが一致しません。');
    }
    var body;
    if (isGoogleDoc) {
      if (source.sourceType !== KSP_KNOWLEDGE_EXPORT_SOURCE_TYPES.MEETING &&
          String(row.Source_Mime_Type || '') !== 'application/vnd.google-apps.document') {
        throw kspKnowledgeExportSourceError_('KNOWLEDGE_EXPORT_SOURCE_INTEGRITY_FAILED',
          source.sourceId, '直接入力の原本形式が一致しません。');
      }
      try { body = environment.getDocumentText(fileId); }
      catch (error) {
        throw kspKnowledgeExportSourceError_(source.sourceType === KSP_KNOWLEDGE_EXPORT_SOURCE_TYPES.MEETING
          ? 'KNOWLEDGE_EXPORT_MEETING_DOCUMENT_READ_FAILED' : 'KNOWLEDGE_EXPORT_SOURCE_READ_FAILED',
        source.sourceId, 'Google Doc原本を読み取れません。');
      }
      if (body === null || body === undefined) {
        throw kspKnowledgeExportSourceError_('KNOWLEDGE_EXPORT_SOURCE_READ_FAILED', source.sourceId,
          'Google Doc原本が空です。');
      }
      if (source.sourceType === KSP_KNOWLEDGE_EXPORT_SOURCE_TYPES.MEETING) materializationBudget.meetingReads += 1;
    } else {
      if ((source.sourceType === KSP_KNOWLEDGE_EXPORT_SOURCE_TYPES.NEWS ||
          source.sourceType === KSP_KNOWLEDGE_EXPORT_SOURCE_TYPES.ASSESSMENT) &&
          String(row.Input_Mode || '') !== 'UPLOAD_FILE') {
        throw kspKnowledgeExportSourceError_('KNOWLEDGE_EXPORT_SOURCE_INTEGRITY_FAILED',
          source.sourceId, '原本の入力経路が不正です。');
      }
      var metadata;
      try { metadata = environment.getDriveFileMetadata(fileId); }
      catch (error) {
        throw kspKnowledgeExportSourceError_('KNOWLEDGE_EXPORT_SOURCE_INTEGRITY_FAILED',
          source.sourceId, 'Drive原本を確認できません。');
      }
      var metadataMimeType = String(metadata && metadata.mimeType || '');
      if (!metadata || String(metadata.id || '') !== fileId || !metadataMimeType || metadata.trashed === true ||
          metadataMimeType === 'application/vnd.google-apps.folder' ||
          (metadata.webViewLink && !kspKnowledgeExportUrlMatchesId_(metadata.webViewLink, fileId))) {
        throw kspKnowledgeExportSourceError_('KNOWLEDGE_EXPORT_SOURCE_INTEGRITY_FAILED',
          source.sourceId, 'Drive原本のIDまたは形式が一致しません。');
      }
      var extension = kspGetPitchbookExtensionForAi_(row);
      var definition = KSP_AI_FORMAT_REGISTRY[extension];
      if (!definition || definition.readStrategy === KSP_AI_READ_STRATEGIES.DIRECT_BINARY) {
        var unsupported = kspKnowledgeExportSourceError_('KNOWLEDGE_EXPORT_UNSUPPORTED_MATERIALIZATION',
          source.sourceId, '原本形式の本文抽出に対応していません。');
        unsupported.extension = extension;
        throw unsupported;
      }
      if (row.Source_Mime_Type && kspNormalizeAiMimeType_(row.Source_Mime_Type) !== 'application/octet-stream' &&
          kspNormalizeAiMimeType_(row.Source_Mime_Type) !== kspNormalizeAiMimeType_(metadataMimeType)) {
        throw kspKnowledgeExportSourceError_('KNOWLEDGE_EXPORT_SOURCE_INTEGRITY_FAILED',
          source.sourceId, '原本のMIME typeが一致しません。');
      }
      var file;
      try { file = environment.getSourceFileBytes(fileId); }
      catch (error) {
        throw kspKnowledgeExportSourceError_('KNOWLEDGE_EXPORT_SOURCE_READ_FAILED',
          source.sourceId, 'Drive原本本文を読み込めません。');
      }
      if (!file || (file.fileId && String(file.fileId) !== fileId) ||
          kspNormalizeAiMimeType_(file.mimeType) !== kspNormalizeAiMimeType_(metadataMimeType)) {
        throw kspKnowledgeExportSourceError_('KNOWLEDGE_EXPORT_SOURCE_INTEGRITY_FAILED',
          source.sourceId, '読み込んだ原本のIDまたは形式が一致しません。');
      }
      try {
        kspValidateAiSourceDescriptor_(extension, file.mimeType, (file.bytes || []).length);
        if (definition.readStrategy === KSP_AI_READ_STRATEGIES.XLSX_NORMALIZED_TEXT) {
          body = environment.normalizeXlsxText(file.bytes);
        } else {
          var decoded = environment.decodeSourceText(file.bytes, 'UTF-8');
          body = definition.readStrategy === KSP_AI_READ_STRATEGIES.EML_NORMALIZED_TEXT
            ? kspNormalizeEmlText_(decoded) : decoded;
        }
      } catch (error) {
        throw kspKnowledgeExportSourceError_('KNOWLEDGE_EXPORT_SOURCE_READ_FAILED',
          source.sourceId, '原本本文を正規化できません。');
      }
    }
    kspKnowledgeExportAssertBudget_(materializationBudget);
    body = String(body);
    source.contentToken = body.length + ':' + kspKnowledgeExportHash_(body);
    source.canonicalUrl = kspBuildKnowledgeExportCanonicalUrl_(source.sourceType, fileId, isGoogleDoc);
    items.push({ source: source, body: body });
  });
  return {
    sources: items,
    meetings: items.filter(function (item) { return item.source.sourceType === KSP_KNOWLEDGE_EXPORT_SOURCE_TYPES.MEETING; }),
    pitchbooks: items.filter(function (item) { return item.source.sourceType === KSP_KNOWLEDGE_EXPORT_SOURCE_TYPES.PITCHBOOK; }),
    news: items.filter(function (item) { return item.source.sourceType === KSP_KNOWLEDGE_EXPORT_SOURCE_TYPES.NEWS; }),
    assessments: items.filter(function (item) { return item.source.sourceType === KSP_KNOWLEDGE_EXPORT_SOURCE_TYPES.ASSESSMENT; })
  };
}

function kspBuildKnowledgeExportPreviewFromMaterials_(input, sources, materials, catalog, masterMaps) {
  var meetingCharacterCount = (materials.meetings || []).reduce(function (total, item) {
    return total + item.body.length;
  }, 0);
  var totalCharacterCount = (materials.sources || []).reduce(function (total, item) {
    return total + item.body.length;
  }, 0);
  var counts = kspKnowledgeExportIndexCounts_(sources);
  var limits = kspBuildKnowledgeExportLimitState_(
    counts.meetingCount, meetingCharacterCount, counts.pitchbookCount, totalCharacterCount
  );
  var sourceIds = (sources || []).slice(0, KSP_KNOWLEDGE_EXPORT_LIMITS.MAX_SOURCE_ID_REPORT)
    .map(function (source) { return source.sourceId; });
  var renderModel = kspBuildKnowledgeExportRenderModel_(
    input, materials,
    masterMaps || { gp: {}, assetClass: {}, capitalType: {}, location: {}, team: {}, counterparty: {} },
    kspBuildKnowledgeExportPackageTitle_(input)
  );
  var packageText = kspBuildKnowledgeExportPlainText_(renderModel);
  var previewFingerprint = kspBuildKnowledgeExportFingerprint_(sources, input, catalog);
  return {
    workId: KSP_KNOWLEDGE_EXPORT_WORK_ID,
    filters: kspKnowledgeExportPublicFilters_(input),
    sourceTypes: input.sourceTypes,
    mode: input.mode,
    scopeSummary: kspKnowledgeScopeSummary_(input),
    meetingCount: counts.meetingCount,
    meetingCharacterCount: meetingCharacterCount,
    pitchbookCount: counts.pitchbookCount,
    newsCount: counts.newsCount,
    assessmentCount: counts.assessmentCount,
    sourceCount: counts.sourceCount,
    totalCharacterCount: totalCharacterCount,
    warning: limits.warning,
    warningReasons: limits.warningReasons,
    hardStop: limits.hardStop,
    hardStopReasons: limits.hardStopReasons,
    noResults: counts.sourceCount === 0,
    sourceIds: sourceIds,
    sourceIdCount: (sources || []).length,
    previewFingerprint: previewFingerprint,
    packageFingerprint: previewFingerprint,
    packageText: packageText,
    pitchbookReferencesOnly: false
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
  var input = kspNormalizeKnowledgeFullOutputInput_(rawInput);
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
    var catalog = kspBuildKnowledgeSearchCatalog_(kspContextCounterpartyRows_(context), context.optionRows,
      context.meetingRows, context.pitchbookRows, context.newsRows, context.assessmentRows);
    input = kspValidateKnowledgeExportFilters_(input, catalog);
    input = kspRestrictKnowledgeEligibleSources_(input, context);
    sources = kspResolveKnowledgeExportSources_(context, input);
    var indexCounts = kspKnowledgeExportIndexCounts_(sources);
    var indexLimits = kspBuildKnowledgeExportLimitState_(indexCounts.meetingCount, 0, indexCounts.pitchbookCount);
    if (indexLimits.hardStop) {
      preview = kspBuildKnowledgeExportIndexPreview_(input, sources, catalog);
    } else {
      var materials = kspMaterializeKnowledgeExportSources_(environment, sources, { startedAt: Date.now(), meetingReads: 0 });
      preview = kspBuildKnowledgeExportPreviewFromMaterials_(input, sources, materials, catalog,
        kspBuildAllMasterMaps_(kspContextCounterpartyRows_(context), context.optionRows));
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
  var input = kspNormalizeKnowledgeFullOutputInput_(rawInput);
  var context = null;
  var auditSpreadsheetId = '';
  var preview = null;
  var sources = [];
  var idempotencyKey = '';

  try {
    context = environment.loadKnowledgeExportContext();
    auditSpreadsheetId = context.auditSpreadsheetId || '';
    var catalog = kspBuildKnowledgeSearchCatalog_(kspContextCounterpartyRows_(context), context.optionRows,
      context.meetingRows, context.pitchbookRows, context.newsRows, context.assessmentRows);
    input = kspValidateKnowledgeExportFilters_(input, catalog);
    input.outputType = kspValidateKnowledgeExportOutputType_(input.outputType);
    kspAssert_(input.previewFingerprint, 'KNOWLEDGE_EXPORT_PREVIEW_REQUIRED', '先に対象資料を確認してください。');
    var previewFingerprint = input.previewFingerprint;
    var outputType = input.outputType;
    input = kspRestrictKnowledgeEligibleSources_(input, context);
    input.previewFingerprint = previewFingerprint;
    input.outputType = outputType;
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
    sources = kspResolveKnowledgeExportSources_(context, input);
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
        kspBuildAllMasterMaps_(kspContextCounterpartyRows_(context), context.optionRows));
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

    var maps = kspBuildAllMasterMaps_(kspContextCounterpartyRows_(context), context.optionRows);
    var title = kspBuildKnowledgeExportFilename_(input, environment.nowIso(), input.outputType);
    var renderModel = kspBuildKnowledgeExportRenderModel_(
      input, materials, maps,
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
    var catalog = kspBuildKnowledgeSearchCatalog_(kspContextCounterpartyRows_(context), context.optionRows,
      context.meetingRows, context.pitchbookRows, context.newsRows, context.assessmentRows);
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
      kspBuildKnowledgeSearchCatalog_(kspContextCounterpartyRows_(context), context.optionRows,
        context.meetingRows, context.pitchbookRows, context.newsRows, context.assessmentRows));
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
