// ===== BEGIN src/141_AiSyncHelpers.gs =====
function kspBuildAiSyncReport_(nowIso, settings) {
  return {
    workId: KSP_AI_WORK_ID,
    startedAt: nowIso,
    finishedAt: null,
    ok: true,
    syncEnabled: settings.syncEnabled,
    selected: 0,
    indexed: 0,
    reused: 0,
    unchanged: 0,
    removed: 0,
    deferred: 0,
    failed: 0,
    skippedClaims: 0,
    items: [],
    errors: []
  };
}

function kspAiDocumentMatchesSource_(documentValue, sourceId, contentHash) {
  var metadata = documentValue && documentValue.customMetadata ? documentValue.customMetadata : {};
  return String(metadata.source_id || '') === String(sourceId) &&
    String(metadata.content_hash || '') === String(contentHash);
}

function kspDeleteAiDocuments_(environment, storeName, sourceId, storedDocumentName, documents) {
  var names = {};
  if (storedDocumentName) names[String(storedDocumentName)] = true;
  (documents || []).forEach(function (documentValue) {
    if (documentValue && documentValue.name) names[String(documentValue.name)] = true;
  });
  Object.keys(names).forEach(function (name) {
    environment.deleteFileSearchDocument(storeName, name);
  });
}

function kspApplyAiIndexedPatch_(environment, item, documentValue, contentHash, nowIso) {
  environment.updateAiRow(item.sourceType, item.sourceId, {
    AI_Document_Name: String(documentValue.name || ''),
    AI_Index_Status: KSP_AI_INDEX_STATUS.INDEXED,
    AI_Indexed_At: nowIso,
    AI_Content_Hash: contentHash,
    AI_Last_Error: ''
  });
}

function kspProcessInactiveAiItem_(environment, storeName, item, report) {
  var row = item.row || {};
  var documents = environment.findFileSearchDocumentsBySource(storeName, item.sourceId);
  kspDeleteAiDocuments_(environment, storeName, item.sourceId, row.AI_Document_Name, documents);
  environment.updateAiRow(item.sourceType, item.sourceId, {
    AI_Document_Name: '',
    AI_Index_Status: KSP_AI_INDEX_STATUS.NOT_INDEXED,
    AI_Indexed_At: '',
    AI_Content_Hash: '',
    AI_Last_Error: ''
  });
  report.removed += 1;
  report.items.push({ sourceType: item.sourceType, sourceId: item.sourceId, action: 'removed' });
}

function kspProcessActiveAiItem_(environment, storeName, item, maps, report, nowIso) {
  var row = item.row || {};
  if (item.sourceType === KSP_AI_SOURCE_TYPES.PITCHBOOK && kspGetPitchbookExtensionForAi_(row) !== 'txt') {
    var deferredDocuments = environment.findFileSearchDocumentsBySource(storeName, item.sourceId);
    kspDeleteAiDocuments_(environment, storeName, item.sourceId, row.AI_Document_Name, deferredDocuments);
    environment.updateAiRow(item.sourceType, item.sourceId, {
      AI_Document_Name: '',
      AI_Index_Status: KSP_AI_INDEX_STATUS.NOT_INDEXED,
      AI_Indexed_At: '',
      AI_Content_Hash: '',
      AI_Last_Error: kspBuildAiLastError_({
        attempt: 1,
        retryable: false,
        permanent: true,
        code: 'AI_FORMAT_DEFERRED_TO_WORK_0009',
        message: 'Work 0008 indexes Meeting text and TXT sources only.'
      })
    });
    report.deferred += 1;
    report.items.push({ sourceType: item.sourceType, sourceId: item.sourceId, action: 'deferred', code: 'AI_FORMAT_DEFERRED_TO_WORK_0009' });
    return;
  }
  var source = kspBuildAiSource_(environment, item, maps);
  if (String(row.AI_Content_Hash || '') === source.contentHash && row.AI_Document_Name) {
    report.unchanged += 1;
    report.items.push({ sourceType: item.sourceType, sourceId: item.sourceId, action: 'unchanged' });
    return;
  }

  var documents = environment.findFileSearchDocumentsBySource(storeName, item.sourceId);
  var matching = documents.filter(function (documentValue) {
    return kspAiDocumentMatchesSource_(documentValue, item.sourceId, source.contentHash);
  });
  if (matching.length > 0) {
    var selected = matching[0];
    var extras = documents.filter(function (documentValue) { return documentValue.name !== selected.name; });
    kspDeleteAiDocuments_(environment, storeName, item.sourceId, '', extras);
    kspApplyAiIndexedPatch_(environment, item, selected, source.contentHash, nowIso);
    report.reused += 1;
    report.items.push({ sourceType: item.sourceType, sourceId: item.sourceId, action: 'reconciled', documentName: selected.name });
    return;
  }

  kspDeleteAiDocuments_(environment, storeName, item.sourceId, row.AI_Document_Name, documents);
  var uploaded = environment.uploadSourceToFileSearchStore(storeName, source);
  kspAssert_(uploaded && uploaded.name, 'AI_UPLOAD_DOCUMENT_MISSING', 'File Search upload did not return a Document.');
  kspApplyAiIndexedPatch_(environment, item, uploaded, source.contentHash, nowIso);
  report.indexed += 1;
  report.items.push({ sourceType: item.sourceType, sourceId: item.sourceId, action: 'indexed', documentName: uploaded.name });
}

function kspRecordAiFailure_(environment, item, error, settings, nowIso, report) {
  var previous = kspParseAiLastError_(item.row && item.row.AI_Last_Error);
  var attempt = previous.attempt + 1;
  var retryable = kspIsAiErrorRetryable_(error) && !error.permanent && attempt < settings.maxRetryAttempts;
  var permanent = Boolean(error.permanent) || !retryable;
  var nextAttemptAt = retryable ? kspCalculateAiRetryAt_(nowIso, attempt, settings) : '';
  var code = kspGetErrorCode_(error, 'AI_SYNC_FAILED');
  var patch = {
    AI_Document_Name: '',
    AI_Index_Status: KSP_AI_INDEX_STATUS.FAILED,
    AI_Indexed_At: '',
    AI_Content_Hash: '',
    AI_Last_Error: kspBuildAiLastError_({
      attempt: attempt,
      retryable: retryable,
      permanent: permanent,
      nextAttemptAt: nextAttemptAt,
      code: code,
      message: error && error.message ? error.message : String(error)
    })
  };
  report.failed += 1;
  environment.updateAiRow(item.sourceType, item.sourceId, patch);
  report.items.push({
    sourceType: item.sourceType,
    sourceId: item.sourceId,
    action: 'failed',
    code: code,
    retryable: retryable,
    nextAttemptAt: nextAttemptAt
  });
}
// ===== END src/141_AiSyncHelpers.gs =====

// ===== BEGIN src/142_AiSyncWorker.gs =====
function kspRunAiSync_(environment) {
  var startedAt = environment.nowIso();
  var context = environment.loadAiContext();
  environment.ensureAiSettings(kspGetAiSettingSeedRows_(startedAt));
  context = environment.loadAiContext();
  var settings = kspNormalizeAiSettings_(context.settings);
  var report = kspBuildAiSyncReport_(startedAt, settings);
  if (!settings.syncEnabled) {
    report.finishedAt = environment.nowIso();
    return report;
  }

  var store = environment.ensureFileSearchStore(settings, KSP_AI_DEFAULTS.STORE_DISPLAY_NAME);
  var storeName = store.name;
  var items = kspSelectAiWorkItems_(context.meetingRows, context.pitchbookRows, startedAt, settings,
    context.newsRows, context.assessmentRows);
  report.selected = items.length;
  var maps = kspBuildAiMasterMaps_(kspContextCounterpartyRows_(context), context.optionRows);

  items.forEach(function (item) {
    var claim = environment.claimAiSource(item.sourceType, item.sourceId, startedAt, KSP_AI_DEFAULTS.CLAIM_TTL_MILLIS);
    if (!claim) {
      report.skippedClaims += 1;
      report.items.push({ sourceType: item.sourceType, sourceId: item.sourceId, action: 'claimed-elsewhere' });
      return;
    }
    try {
      if (String(item.row.Status) === KSP_STATUS.INACTIVE || item.retrievalEligible === false) {
        kspProcessInactiveAiItem_(environment, storeName, item, report);
      } else {
        kspProcessActiveAiItem_(environment, storeName, item, maps, report, environment.nowIso());
      }
    } catch (error) {
      try {
        kspRecordAiFailure_(environment, item, error, settings, environment.nowIso(), report);
      } catch (recordError) {
        report.ok = false;
        report.errors.push({
          sourceType: item.sourceType,
          sourceId: item.sourceId,
          code: kspGetErrorCode_(recordError),
          message: recordError.message || String(recordError)
        });
      }
    } finally {
      environment.releaseAiSourceClaim(item.sourceType, item.sourceId, claim.token);
    }
  });

  report.finishedAt = environment.nowIso();
  report.ok = report.errors.length === 0;
  return report;
}
// ===== END src/142_AiSyncWorker.gs =====

// ===== BEGIN src/150_KnowledgeSearchModels.gs =====
function kspBuildKnowledgeSearchCatalog_(counterpartyRows, optionRows, meetingRows, pitchbookRows, newsRows, assessmentRows) {
  var counterparties = (counterpartyRows || []).map(function (row) {
    return { id: String(row.Counterparty_ID || row.GP_ID || ''), name: String(row.Counterparty_Name || row.GP_Name || ''),
      type: String(row.Counterparty_Type || (row.GP_ID ? 'GP' : '')), status: String(row.Status || '') };
  }).filter(function (item) { return item.id && item.name && item.type; }).sort(function (left, right) {
    return left.name.localeCompare(right.name, 'ja');
  });
  var options = (optionRows || []).map(function (row) {
    return {
      id: String(row.Option_ID || ''), type: String(row.Type || ''), name: String(row.Name || ''),
      status: String(row.Status || ''), sortOrder: Number(row.Sort_Order) || 0
    };
  }).filter(function (item) { return item.id && item.type && item.name; });
  function byType(type) {
    return options.filter(function (item) { return item.type === type; }).sort(function (left, right) {
      return left.sortOrder - right.sortOrder || left.name.localeCompare(right.name, 'ja');
    }).map(function (item) {
      return { id: item.id, name: item.name, status: item.status, sortOrder: item.sortOrder };
    });
  }
  var counterpartyEntities = counterparties.map(function (counterparty) {
    return { id: 'COUNTERPARTY:' + counterparty.id, entityKey: 'COUNTERPARTY:' + counterparty.id,
      counterpartyId: counterparty.id, type: counterparty.type, name: counterparty.name,
      status: counterparty.status };
  });
  var fundStrategies = {};
  (meetingRows || []).concat(pitchbookRows || [], newsRows || [], assessmentRows || []).forEach(function (row) {
    var value = kspAiTrim_(row && row.Fund_Strategy);
    if (value) fundStrategies[value] = true;
  });
  return {
    counterparties: counterparties,
    gps: counterparties.filter(function (item) { return item.type === 'GP'; }),
    assetClasses: byType(KSP_OPTION_TYPES.ASSET_CLASS),
    capitalTypes: byType(KSP_OPTION_TYPES.CAPITAL_TYPE),
    teams: byType(KSP_OPTION_TYPES.TEAM),
    counterpartyTypes: KSP_COUNTERPARTY_TYPE_DEFINITIONS.map(function (definition) {
      return { id: definition.code, code: definition.code, name: definition.label, label: definition.label };
    }),
    counterpartyEntities: counterpartyEntities,
    meetingTypes: KSP_MEETING_TYPE_DEFINITIONS.map(function (definition) {
      return { id: definition.code, code: definition.code, name: definition.label, label: definition.label };
    }),
    fundStrategies: Object.keys(fundStrategies).sort().map(function (value) { return { id: value, name: value }; }),
    followUpOptions: [
      { id: KSP_KNOWLEDGE_FOLLOW_UP_FILTERS.REQUIRED, name: '必要' },
      { id: KSP_KNOWLEDGE_FOLLOW_UP_FILTERS.NOT_REQUIRED, name: '不要' }
    ],
    sourceTypes: KSP_AI_SOURCE_DEFINITIONS.map(function (definition) {
      return { id: definition.id, name: definition.name };
    })
  };
}

function kspValidateKnowledgeFilterIds_(input, catalog) {
  var filters = kspKnowledgeRequestFilters_(input);
  var safeCatalog = catalog || { gps: [], assetClasses: [], capitalTypes: [], teams: [], counterpartyTypes: [], counterpartyEntities: [], fundStrategies: [] };
  if (filters.gpId) {
    kspRequireCatalogItem_(safeCatalog.gps, filters.gpId, 'AI_GP_FILTER_UNAVAILABLE', '選択されたGPは利用できません。');
  }
  if (filters.assetClassId) {
    kspRequireCatalogItem_(
      safeCatalog.assetClasses,
      filters.assetClassId,
      'AI_ASSET_CLASS_FILTER_UNAVAILABLE',
      '選択されたアセットクラスは利用できません。'
    );
  }
  if (filters.capitalTypeId) {
    kspRequireCatalogItem_(
      safeCatalog.capitalTypes,
      filters.capitalTypeId,
      'AI_CAPITAL_TYPE_FILTER_UNAVAILABLE',
      '選択されたEquity / Debtは利用できません。'
    );
  }
  if (filters.teamId) {
    kspRequireCatalogItem_(safeCatalog.teams, filters.teamId,
      'AI_TEAM_FILTER_UNAVAILABLE', '選択されたチームは利用できません。');
  }
  if (filters.counterpartyType) {
    kspRequireCatalogItem_(safeCatalog.counterpartyTypes, filters.counterpartyType,
      'AI_COUNTERPARTY_TYPE_FILTER_UNAVAILABLE', '選択されたCounterparty Typeは利用できません。');
  }
  if (filters.entityKey) {
    var selectedEntity = kspRequireCatalogItem_(safeCatalog.counterpartyEntities, filters.entityKey,
      'AI_ENTITY_FILTER_UNAVAILABLE', '選択されたCounterparty Entityは利用できません。');
    if (filters.counterpartyType) {
      kspAssert_(selectedEntity.type === filters.counterpartyType,
        'AI_ENTITY_TYPE_CONFLICT', 'Counterparty TypeとEntityが一致しません。');
    }
    if (filters.gpId) {
      kspAssert_(selectedEntity.type === 'GP' && selectedEntity.counterpartyId === filters.gpId,
        'AI_ENTITY_GP_CONFLICT', 'Counterparty EntityとGPが一致しません。');
    }
  }
  if (filters.fundStrategy) {
    kspRequireCatalogItem_(safeCatalog.fundStrategies, filters.fundStrategy,
      'AI_FUND_STRATEGY_FILTER_UNAVAILABLE', '選択されたFund / Strategyは利用できません。');
  }
  if (filters.relatedGpId) {
    kspRequireCatalogItem_(safeCatalog.relatedGps || safeCatalog.gps, filters.relatedGpId,
      'AI_RELATED_GP_FILTER_UNAVAILABLE', '旧形式の検索条件は利用できません。');
  }
  if (filters.meetingTypeCode) {
    kspRequireCatalogItem_(safeCatalog.meetingTypes || [], filters.meetingTypeCode,
      'AI_MEETING_TYPE_FILTER_UNAVAILABLE', '選択されたMTG種別は利用できません。');
  }
  (input && input.selectedEntityKeys || []).forEach(function (entityKey) {
    kspRequireCatalogItem_(safeCatalog.counterpartyEntities, entityKey,
      'AI_ENTITY_FILTER_UNAVAILABLE', '選択されたCounterparty Entityは利用できません。');
  });
  return input;
}

function kspBuildAuthoritativeSourceMaps_(meetingRows, pitchbookRows, newsRows, assessmentRows) {
  var maps = { bySourceId: {}, bySourceKey: {}, byAiDocumentName: {}, byProviderDocumentId: {} };

  function addMapping(map, key, source) {
    var normalizedKey = kspAiTrim_(key);
    if (!normalizedKey) return;
    if (!Object.prototype.hasOwnProperty.call(map, normalizedKey)) {
      map[normalizedKey] = source;
      return;
    }
    if (map[normalizedKey] === null) return;
    if (!kspKnowledgeSourceIdentityEquivalent_(map[normalizedKey], source)) map[normalizedKey] = null;
  }

  function add(source) {
    if (!source.sourceId) return;
    var sourceKey = kspAiSourceKey_(source.sourceType, source.sourceId);
    addMapping(maps.bySourceKey, sourceKey, source);
    addMapping(maps.bySourceId, source.sourceId, source);
    addMapping(maps.byAiDocumentName, source.aiDocumentName, source);
    (source.providerDocumentIds || []).forEach(function (providerDocumentId) {
      addMapping(maps.byProviderDocumentId, providerDocumentId, source);
    });
  }

  (meetingRows || []).forEach(function (row) {
    var counterpartyType = kspMeetingCounterpartyType_(row);
    var counterpartyId = kspMeetingCounterpartyId_(row);
    add({
      sourceType: KSP_AI_SOURCE_TYPES.MEETING,
      sourceLabel: kspAiSourceLabel_(KSP_AI_SOURCE_TYPES.MEETING),
      sourceId: String(row.Meeting_ID || ''),
      fileId: String(row.Doc_File_ID || ''),
      date: kspCanonicalBusinessDate_(row.Date),
      driveUrl: String(row.Doc_URL || ''),
      savedFilename: String(row.Saved_Filename || row.Meeting_ID || ''),
      provenanceSummary: [kspCanonicalBusinessDate_(row.Date), String(row.Counterparty || row.GP_ID || counterpartyId || '')].filter(Boolean).join(' / '),
      counterpartyIds: counterpartyId ? [counterpartyId] : [],
      entityKeys: counterpartyId ? [kspCounterpartyEntityKey_(counterpartyId)] : [],
      entityKey: kspCounterpartyEntityKey_(counterpartyId),
      counterpartyType: counterpartyType,
      status: String(row.Status || ''),
      aiDocumentName: String(row.AI_Document_Name || ''),
      aiProviderStateJson: String(row.AI_Provider_State_JSON || ''),
      providerContentHashes: kspKnowledgeSourceProviderContentHashes_(row),
      contentHash: kspKnowledgeSourceContentHash_(row),
      providerDocumentIds: kspKnowledgeSourceProviderDocumentIds_(row),
      geminiProviderIdentity: kspKnowledgeSourceGeminiProviderIdentity_(row)
    });
  });

  (pitchbookRows || []).forEach(function (row) {
    var context = kspPitchbookAiContext_(row);
    add({
      sourceType: KSP_AI_SOURCE_TYPES.PITCHBOOK,
      sourceLabel: kspAiSourceLabel_(KSP_AI_SOURCE_TYPES.PITCHBOOK),
      sourceId: String(row.Document_ID || ''),
      fileId: String(row.File_ID || ''),
      date: kspCanonicalBusinessDate_(row.Date),
      driveUrl: String(row.File_URL || ''),
      savedFilename: String(row.Saved_Filename || row.Original_Filename || row.Document_ID || ''),
      provenanceSummary: [String(row.Original_Filename || row.Saved_Filename || ''), kspCanonicalBusinessDate_(row.Date)].filter(Boolean).join(' / '),
      counterpartyIds: context.counterpartyId ? [context.counterpartyId] : [],
      entityKeys: context.entityKey ? [context.entityKey] : [],
      entityKey: context.entityKey,
      counterpartyType: context.counterpartyType,
      counterpartyId: context.counterpartyId,
      relatedGpIds: context.relatedGpIds,
      parentMeetingId: context.parentMeetingId,
      retrievalEligible: kspIsParentBoundPitchbookEligible_(row, meetingRows) && (!context.parentMeetingId || context.valid),
      status: String(row.Status || ''),
      aiDocumentName: String(row.AI_Document_Name || ''),
      aiProviderStateJson: String(row.AI_Provider_State_JSON || ''),
      providerContentHashes: kspKnowledgeSourceProviderContentHashes_(row),
      contentHash: kspKnowledgeSourceContentHash_(row),
      providerDocumentIds: kspKnowledgeSourceProviderDocumentIds_(row),
      geminiProviderIdentity: kspKnowledgeSourceGeminiProviderIdentity_(row)
    });
  });

  function addSourceRecord(row, sourceType, idField, dateField) {
    var sourceId = String(row[idField] || '');
    var counterpartyIds = kspUniqueStrings_(kspMaintenanceSplitCodes_(row.Counterparty_IDs).map(kspAiTrim_).filter(Boolean));
    var assessmentType = sourceType === KSP_AI_SOURCE_TYPES.INTERNAL_ASSESSMENT
      ? String(row.Assessment_Type || '') : '';
    var assessmentDefinition = (typeof KSP_ASSESSMENT_TYPES !== 'undefined' ? KSP_ASSESSMENT_TYPES : [])
      .filter(function (item) { return item.code === assessmentType; })[0];
    var assessmentTypeLabel = assessmentDefinition ? assessmentDefinition.label : assessmentType;
    var date = kspCanonicalBusinessDate_(row[dateField]);
    var sourceLabel = kspAiSourceLabel_(sourceType);
    var provenance = sourceType === KSP_AI_SOURCE_TYPES.NEWS
      ? [String(row.Publisher || ''), date].filter(Boolean).join(' / ')
      : ['当時の社内評価', assessmentTypeLabel, date].filter(Boolean).join(' / ');
    add({
      sourceType: sourceType, sourceLabel: sourceLabel, sourceId: sourceId,
      fileId: String(row.Source_File_ID || ''), date: date,
      driveUrl: String(row.Source_URL || ''),
      title: String(row.Title || ''), publisher: String(row.Publisher || ''),
      assessmentType: assessmentType, assessmentTypeLabel: assessmentTypeLabel,
      decisionOrAction: String(row.Decision_Or_Action || ''),
      relatedMeetingIds: kspMaintenanceSplitCodes_(row.Related_Meeting_IDs),
      relatedDocumentIds: kspMaintenanceSplitCodes_(row.Related_Document_IDs),
      relatedNewsIds: kspMaintenanceSplitCodes_(row.Related_News_IDs),
      provenanceSummary: provenance,
      counterpartyIds: counterpartyIds,
      entityKeys: counterpartyIds.map(kspCounterpartyEntityKey_),
      entityKey: counterpartyIds.length === 1 ? kspCounterpartyEntityKey_(counterpartyIds[0]) : '',
      assetClassId: String(row.Asset_Class_ID || ''),
      fundStrategy: String(row.Fund_Strategy || ''),
      inputMode: String(row.Input_Mode || ''),
      sourceMimeType: String(row.Source_Mime_Type || ''),
      originalFilename: String(row.Original_Filename || ''),
      savedFilename: String(row.Saved_Filename || row.Title || sourceId),
      status: String(row.Status || ''),
      aiDocumentName: String(row.AI_Document_Name || ''),
      aiProviderStateJson: String(row.AI_Provider_State_JSON || ''),
      providerContentHashes: kspKnowledgeSourceProviderContentHashes_(row),
      contentHash: kspKnowledgeSourceContentHash_(row),
      providerDocumentIds: kspKnowledgeSourceProviderDocumentIds_(row),
      geminiProviderIdentity: kspKnowledgeSourceGeminiProviderIdentity_(row)
    });
  }
  (newsRows || []).forEach(function (row) {
    addSourceRecord(row, KSP_AI_SOURCE_TYPES.NEWS, 'News_ID', 'Published_Date');
  });
  (assessmentRows || []).forEach(function (row) {
    addSourceRecord(row, KSP_AI_SOURCE_TYPES.INTERNAL_ASSESSMENT, 'Assessment_ID', 'Assessment_Date');
  });

  return maps;
}

function kspKnowledgeSourceIdentityEquivalent_(left, right) {
  return left && right && left.sourceType === right.sourceType &&
    left.sourceId === right.sourceId && left.contentHash === right.contentHash &&
    left.entityKey === right.entityKey && left.status === right.status &&
    JSON.stringify(left.counterpartyIds || []) === JSON.stringify(right.counterpartyIds || []) &&
    left.fileId === right.fileId && left.driveUrl === right.driveUrl &&
    left.date === right.date && left.savedFilename === right.savedFilename &&
    left.aiProviderStateJson === right.aiProviderStateJson &&
    left.title === right.title && left.publisher === right.publisher &&
    left.assessmentType === right.assessmentType &&
    left.assetClassId === right.assetClassId && left.fundStrategy === right.fundStrategy &&
    left.provenanceSummary === right.provenanceSummary &&
    left.retrievalEligible === right.retrievalEligible;
}

function kspKnowledgeCitationInScope_(source, scope) {
  if (!scope) return true;
  var types = kspNormalizeKnowledgeSourceTypes_(scope);
  if (types.indexOf(source.sourceType) === -1) return false;
  return !Array.isArray(scope.resolvedSourceIds) ||
    scope.resolvedSourceIds.indexOf(source.sourceId) !== -1;
}

function kspBuildKnowledgeCitation_(source, pageNumber, provenance) {
  var citation = {
    sourceType: source.sourceType, sourceId: source.sourceId,
    sourceLabel: source.sourceLabel || kspAiSourceLabel_(source.sourceType),
    date: source.date, title: source.title || source.savedFilename,
    entityKey: source.entityKey || '', entityKeys: (source.entityKeys || []).slice(),
    counterpartyType: source.counterpartyType || '',
    counterpartyIds: (source.counterpartyIds || []).slice(),
    driveUrl: source.driveUrl, pageNumber: pageNumber,
    provenanceSummary: source.provenanceSummary || ''
  };
  if (source.sourceType === KSP_AI_SOURCE_TYPES.NEWS) citation.publisher = source.publisher || '';
  if (source.sourceType === KSP_AI_SOURCE_TYPES.INTERNAL_ASSESSMENT) {
    citation.assessmentType = source.assessmentType || '';
    citation.assessmentTypeLabel = source.assessmentTypeLabel || '';
    citation.internalAssessment = true;
  }
  if (provenance) citation.provenance = provenance;
  return citation;
}

function kspParentBoundCitationContextMatches_(source, metadata) {
  if (!source.parentMeetingId) return true;
  return kspAiTrim_(metadata.entity_key) === source.entityKey &&
    kspAiTrim_(metadata.counterparty_type) === source.counterpartyType &&
    kspAiTrim_(metadata.counterparty_id) === source.counterpartyId;
}

function kspKnowledgeSourceProviderContentHashes_(row) {
  var hashes = { OPENAI: '', GEMINI: '' };
  if (row && row.AI_Provider_State_JSON && typeof kspParseAiProviderState_ === 'function') {
    try {
      var state = kspParseAiProviderState_(row.AI_Provider_State_JSON, row);
      hashes.OPENAI = kspAiTrim_(state.OPENAI && state.OPENAI.contentHash);
      hashes.GEMINI = kspAiTrim_(state.GEMINI && state.GEMINI.contentHash);
    } catch (ignored) { /* Keep malformed derived state fail-closed for strict OpenAI citations. */ }
  }
  if (!hashes.GEMINI && row && row.AI_Content_Hash) hashes.GEMINI = String(row.AI_Content_Hash);
  return hashes;
}

function kspKnowledgeSourceContentHash_(row) {
  var hashes = kspKnowledgeSourceProviderContentHashes_(row);
  return hashes.OPENAI || hashes.GEMINI || '';
}

function kspKnowledgeSourceGeminiProviderIdentity_(row) {
  var output = {
    valid: true,
    status: '',
    storeName: '',
    contentHash: '',
    documentNames: []
  };
  try {
    var state = kspParseAiProviderState_(row && row.AI_Provider_State_JSON, row);
    var entry = state && state.GEMINI ? state.GEMINI : {};
    output.status = kspAiTrim_(entry.status);
    output.storeName = kspAiTrim_(entry.storeName);
    output.contentHash = kspAiTrim_(entry.contentHash);
    output.documentNames = kspUniqueStrings_([
      kspAiTrim_(entry.documentName),
      kspAiTrim_(entry.providerDocumentId),
      kspAiTrim_(row && row.AI_Document_Name)
    ].filter(function (value) { return Boolean(value); }));
  } catch (ignored) {
    output.valid = false;
  }
  return output;
}

function kspKnowledgeSourceProviderDocumentIds_(row) {
  var ids = [];
  if (row && row.AI_Document_Name) ids.push(String(row.AI_Document_Name));
  if (row && row.AI_Provider_State_JSON && typeof kspParseAiProviderState_ === 'function') {
    try {
      var state = kspParseAiProviderState_(row.AI_Provider_State_JSON, row);
      [KSP_AI_PROVIDERS.OPENAI, KSP_AI_PROVIDERS.GEMINI].forEach(function (provider) {
        if (state[provider] && state[provider].providerDocumentId) ids.push(String(state[provider].providerDocumentId));
        if (state[provider] && state[provider].documentName) ids.push(String(state[provider].documentName));
      });
    } catch (ignored) { /* Keep source identity authoritative if derived state is malformed. */ }
  }
  return kspUniqueStrings_(ids);
}

function kspGeminiCitationSourceCategory_(value) {
  var source = kspAiTrim_(value);
  if (!source) return 'EMPTY';
  return /^fileSearchStores\/[^/]+\/documents\/[^/]+$/.test(source)
    ? 'DOCUMENT_RESOURCE' : 'CONTENT_TEXT';
}

function kspGeminiCitationDocumentMatches_(documentValue, storeName, sourceType, sourceId, contentHash) {
  var documentName = kspAiTrim_(documentValue && documentValue.name);
  var rawMetadata = documentValue && documentValue.rawCustomMetadata !== undefined
    ? documentValue.rawCustomMetadata
    : documentValue && (documentValue.customMetadata || documentValue.custom_metadata || {});
  var metadataIdentity = kspNormalizeCitationMetadataIdentity_(rawMetadata);
  var metadata = metadataIdentity.metadata;
  var state = kspAiTrim_(documentValue && documentValue.state).toUpperCase();
  return Boolean(metadataIdentity.valid && metadataIdentity.complete && documentName &&
    documentName.indexOf(storeName + '/documents/') === 0 &&
    (state === 'ACTIVE' || state === 'STATE_ACTIVE') &&
    kspAiTrim_(metadata.source_type) === sourceType &&
    kspAiTrim_(metadata.source_id) === sourceId &&
    kspAiTrim_(metadata.content_hash) === contentHash);
}

function kspResolveGeminiKnowledgeCitations_(rawCitations, sourceMaps, options) {
  var maps = sourceMaps || { bySourceKey: {} };
  var settings = options || {};
  var environment = settings.environment || {};
  var config = settings.config || {};
  var storeName = kspAiTrim_(settings.storeName || config.storeName);
  var warnings = [];
  var candidates = [];
  var blockedSourceKeys = {};
  var resolutionCache = {};
  var evidence = {
    rawCitationCount: 0,
    resolvedCitationCount: 0,
    returnedSourceCategory: 'EMPTY',
    documentUriStoreMatched: false,
    metadataSourceTypeMatched: false,
    metadataSourceIdMatched: false,
    metadataContentHashMatched: false,
    authoritativeSourceActiveMatched: false,
    currentGeminiHashMatched: false,
    providerDocumentUniqueMatched: false,
    providerDocumentReadbackMatched: false,
    storedDocumentReferenceMatched: false
  };

  function reject(sourceKey, code, message) {
    warnings.push({ code: code, message: message });
    if (sourceKey) blockedSourceKeys[sourceKey] = true;
  }

  (rawCitations || []).forEach(function (citation) {
    evidence.rawCitationCount += 1;
    var sourceCategory = kspGeminiCitationSourceCategory_(citation && citation.source);
    if (evidence.returnedSourceCategory === 'EMPTY' || evidence.returnedSourceCategory === sourceCategory) {
      evidence.returnedSourceCategory = sourceCategory;
    } else {
      evidence.returnedSourceCategory = 'MIXED';
    }
    if (!citation || citation.type !== 'file_citation') {
      reject('', 'GEMINI_CITATION_IDENTITY_INVALID', 'Gemini citation identity was invalid and was excluded.');
      return;
    }
    var metadataIdentity = kspNormalizeCitationMetadataIdentity_(
      citation.rawMetadata !== undefined ? citation.rawMetadata : citation.metadata
    );
    var metadata = metadataIdentity.metadata;
    var sourceType = kspAiTrim_(metadata.source_type);
    var sourceId = kspAiTrim_(metadata.source_id);
    var contentHash = kspAiTrim_(metadata.content_hash);
    var sourceKey = sourceType && sourceId ? kspAiSourceKey_(sourceType, sourceId) : '';
    if (!metadataIdentity.valid || !metadataIdentity.complete ||
        citation.metadataIdentityValid === false || citation.metadataIdentityComplete === false ||
        citation.metadataIdentityConflicting === true) {
      reject(sourceKey, metadataIdentity.conflicting || citation.metadataIdentityConflicting === true
        ? 'GEMINI_CITATION_METADATA_CONFLICT' : 'GEMINI_CITATION_IDENTITY_INVALID',
      'Gemini citation metadata was incomplete or conflicting and was excluded.');
      return;
    }
    var documentUri = kspAiTrim_(citation.documentUri || citation.document_uri);
    if (!storeName || documentUri !== storeName || !/^fileSearchStores\/[^/]+$/.test(storeName)) {
      reject(sourceKey, 'GEMINI_CITATION_STORE_MISMATCH', 'Gemini citation Store identity did not match the trusted Store.');
      return;
    }
    evidence.documentUriStoreMatched = true;
    var authoritative = maps.bySourceKey ? maps.bySourceKey[sourceKey] : null;
    if (!authoritative) {
      reject(sourceKey, 'GEMINI_CITATION_SOURCE_NOT_FOUND', 'Gemini citation could not be matched to one authoritative source.');
      return;
    }
    if (!kspParentBoundCitationContextMatches_(authoritative, metadata)) {
      reject(sourceKey, 'AI_CITATION_CONTEXT_CONFLICT', '資料の面談先contextが一致しない引用を除外しました。');
      return;
    }
    if (authoritative.status !== KSP_STATUS.ACTIVE || authoritative.retrievalEligible === false) {
      reject(sourceKey, 'GEMINI_CITATION_SOURCE_INACTIVE', 'An inactive Gemini citation source was excluded.');
      return;
    }
    if (!kspKnowledgeCitationInScope_(authoritative, settings.scope)) {
      reject(sourceKey, 'AI_CITATION_OUTSIDE_SCOPE', '選択範囲外の資料からの引用を除外しました。');
      return;
    }
    evidence.metadataSourceTypeMatched = authoritative.sourceType === sourceType;
    evidence.metadataSourceIdMatched = authoritative.sourceId === sourceId;
    evidence.authoritativeSourceActiveMatched = true;
    var geminiIdentity = authoritative.geminiProviderIdentity || {};
    if (geminiIdentity.valid !== true || geminiIdentity.status !== KSP_AI_INDEX_STATUS.INDEXED ||
        !geminiIdentity.contentHash || geminiIdentity.contentHash !== contentHash) {
      reject(sourceKey, 'GEMINI_CITATION_IDENTITY_STALE', 'Gemini citation content identity was stale or unavailable.');
      return;
    }
    evidence.metadataContentHashMatched = true;
    evidence.currentGeminiHashMatched = true;
    if (geminiIdentity.storeName && geminiIdentity.storeName !== storeName) {
      reject(sourceKey, 'GEMINI_CITATION_STORE_MISMATCH', 'Authoritative Gemini state belongs to another Store.');
      return;
    }

    var cacheKey = sourceKey + '|' + contentHash;
    if (!Object.prototype.hasOwnProperty.call(resolutionCache, cacheKey)) {
      var resolution = { ok: false, code: 'GEMINI_CITATION_DOCUMENT_READBACK_FAILED' };
      try {
        kspAssert_(typeof environment.findProviderDocumentsBySource === 'function' &&
          typeof environment.readProviderDocument === 'function',
        'AI_DOCUMENT_READBACK_FAILED', 'Gemini citation document readback is unavailable.');
        var documents = environment.findProviderDocumentsBySource(
          KSP_AI_PROVIDERS.GEMINI, config, sourceType, sourceId
        );
        if (!Array.isArray(documents) || documents.length !== 1) {
          resolution.code = documents && documents.length > 1
            ? 'GEMINI_CITATION_DOCUMENT_AMBIGUOUS' : 'GEMINI_CITATION_DOCUMENT_NOT_FOUND';
        } else if (!kspGeminiCitationDocumentMatches_(documents[0], storeName, sourceType, sourceId, contentHash)) {
          resolution.code = 'GEMINI_CITATION_DOCUMENT_CONFLICT';
        } else {
          var expectedSource = { sourceType: sourceType, sourceId: sourceId, contentHash: contentHash };
          var readback = environment.readProviderDocument(
            KSP_AI_PROVIDERS.GEMINI, config, documents[0], expectedSource
          );
          if (kspAiTrim_(readback && readback.name) !== kspAiTrim_(documents[0].name) ||
              !kspGeminiCitationDocumentMatches_(readback, storeName, sourceType, sourceId, contentHash)) {
            resolution.code = 'GEMINI_CITATION_DOCUMENT_CONFLICT';
          } else {
            var references = kspUniqueStrings_((geminiIdentity.documentNames || []).map(kspAiTrim_)
              .filter(function (value) { return Boolean(value); }));
            if (references.length && (references.length !== 1 || references[0] !== kspAiTrim_(readback.name))) {
              resolution.code = 'GEMINI_CITATION_DOCUMENT_CONFLICT';
            } else {
              resolution = { ok: true, document: readback };
            }
          }
        }
      } catch (ignoredReadbackError) {
        resolution.code = 'GEMINI_CITATION_DOCUMENT_READBACK_FAILED';
      }
      resolutionCache[cacheKey] = resolution;
    }
    var currentResolution = resolutionCache[cacheKey];
    if (!currentResolution.ok) {
      reject(sourceKey, currentResolution.code, 'Gemini citation document identity could not be verified.');
      return;
    }
    evidence.providerDocumentUniqueMatched = true;
    evidence.providerDocumentReadbackMatched = true;
    evidence.storedDocumentReferenceMatched = true;
    candidates.push({ citation: citation, authoritative: authoritative, sourceKey: sourceKey });
  });

  var seen = {};
  var citations = [];
  candidates.forEach(function (candidate) {
    if (blockedSourceKeys[candidate.sourceKey]) return;
    var authoritative = candidate.authoritative;
    if (!authoritative.driveUrl || !/^https:\/\//i.test(authoritative.driveUrl)) {
      reject(candidate.sourceKey, 'AI_CITATION_DRIVE_URL_INVALID', 'Citation source has no valid authoritative HTTPS Drive URL.');
      return;
    }
    var pageNumber = candidate.citation.pageNumber ? Number(candidate.citation.pageNumber) : null;
    var key = authoritative.sourceType + ':' + authoritative.sourceId + '|' + String(pageNumber || '');
    if (seen[key]) return;
    seen[key] = true;
    citations.push(kspBuildKnowledgeCitation_(authoritative, pageNumber, 'INLINE_CITATION'));
  });
  evidence.resolvedCitationCount = citations.length;
  return { citations: citations, warnings: warnings, evidence: evidence };
}

function kspMapKnowledgeCitations_(rawCitations, sourceMaps, scope) {
  var maps = sourceMaps || { bySourceId: {}, bySourceKey: {}, byAiDocumentName: {}, byProviderDocumentId: {} };
  var warnings = [];
  var seen = {};
  var citations = [];

  (rawCitations || []).forEach(function (citation) {
    var metadata = citation && citation.metadata ? kspMetadataArrayToMap_(citation.metadata) : {};
    var sourceId = kspAiTrim_(metadata.source_id);
    var sourceType = kspAiTrim_(metadata.source_type);
    var provenance = kspAiTrim_(citation && citation.provenance);
    var strictOpenAiCitation = provenance === 'INLINE_CITATION' || provenance === 'RETRIEVED_SOURCE';
    var authoritative = null;

    if (sourceType && !kspAiSourceLabel_(sourceType)) {
      warnings.push({ code: 'AI_CITATION_SOURCE_TYPE_INVALID', message: 'Unknown citation source type was excluded.' });
      return;
    }

    if (strictOpenAiCitation) {
      var providerDocumentId = kspAiTrim_(citation && (citation.fileId || citation.file_id || citation.source));
      var contentHash = kspAiTrim_(metadata.content_hash);
      if (!providerDocumentId || !sourceType || !sourceId || !contentHash) {
        warnings.push({
          code: 'OPENAI_CITATION_IDENTITY_INVALID',
          message: 'OpenAI citation identity was incomplete and was excluded.'
        });
        return;
      }
      authoritative = maps.bySourceKey ? maps.bySourceKey[kspAiSourceKey_(sourceType, sourceId)] : null;
      var providerAuthoritative = maps.byProviderDocumentId
        ? maps.byProviderDocumentId[providerDocumentId] : null;
      if (!authoritative || !providerAuthoritative) {
        warnings.push({
          code: 'OPENAI_CITATION_SOURCE_NOT_FOUND',
          message: 'OpenAI citation could not be matched to one authoritative source.'
        });
        return;
      }
      if (!kspKnowledgeSourceIdentityEquivalent_(authoritative, providerAuthoritative)) {
        warnings.push({
          code: 'OPENAI_CITATION_IDENTITY_CONFLICT',
          message: 'OpenAI citation identity conflicted with the authoritative source.'
        });
        return;
      }
      var openAiHash = authoritative.providerContentHashes
        ? kspAiTrim_(authoritative.providerContentHashes.OPENAI) : '';
      if (!openAiHash || openAiHash !== contentHash) {
        warnings.push({
          code: 'OPENAI_CITATION_IDENTITY_STALE',
          message: 'OpenAI citation content identity was stale or unavailable.'
        });
        return;
      }
    } else {
      authoritative = sourceId && sourceType && maps.bySourceKey
        ? maps.bySourceKey[kspAiSourceKey_(sourceType, sourceId)] : null;
      if (!authoritative && sourceId) authoritative = maps.bySourceId[sourceId] || null;
      if (!authoritative && citation && (citation.fileId || citation.file_id || citation.source)) {
        var legacyProviderDocumentId = String(citation.fileId || citation.file_id || citation.source);
        authoritative = maps.byProviderDocumentId ? maps.byProviderDocumentId[legacyProviderDocumentId] : null;
        if (!authoritative && maps.byAiDocumentName) authoritative = maps.byAiDocumentName[legacyProviderDocumentId] || null;
      }
      if (!authoritative && citation && citation.source) {
        authoritative = maps.byAiDocumentName[String(citation.source)] || null;
        if (authoritative) sourceId = authoritative.sourceId;
      }
    }

    if (!authoritative) {
      warnings.push({
        code: 'AI_CITATION_SOURCE_NOT_FOUND',
        message: 'Citation could not be matched to an authoritative source record.'
      });
      return;
    }
    if (!kspParentBoundCitationContextMatches_(authoritative, metadata)) {
      warnings.push({ code: 'AI_CITATION_CONTEXT_CONFLICT', message: '資料の面談先contextが一致しない引用を除外しました。' });
      return;
    }
    if (authoritative.status !== KSP_STATUS.ACTIVE || authoritative.retrievalEligible === false) {
      warnings.push({
        code: 'AI_CITATION_SOURCE_INACTIVE',
        message: 'An inactive source citation was excluded.',
        sourceId: authoritative.sourceId
      });
      return;
    }
    if ((sourceType && authoritative.sourceType !== sourceType) ||
        (sourceId && authoritative.sourceId !== sourceId)) {
      warnings.push({ code: 'AI_CITATION_IDENTITY_CONFLICT', message: 'Citation identity conflicted with the authoritative source.' });
      return;
    }
    if (!kspKnowledgeCitationInScope_(authoritative, scope)) {
      warnings.push({ code: 'AI_CITATION_OUTSIDE_SCOPE', message: '選択範囲外の資料からの引用を除外しました。' });
      return;
    }
    if (!authoritative.driveUrl || !/^https:\/\//i.test(authoritative.driveUrl)) {
      warnings.push({
        code: 'AI_CITATION_DRIVE_URL_INVALID',
        message: 'Citation source has no valid authoritative HTTPS Drive URL.',
        sourceId: authoritative.sourceId
      });
      return;
    }

    var pageNumber = citation && citation.pageNumber ? Number(citation.pageNumber) : null;
    var key = authoritative.sourceType + ':' + authoritative.sourceId + '|' + String(pageNumber || '');
    if (seen[key]) return;
    seen[key] = true;
    var normalizedCitation = kspBuildKnowledgeCitation_(authoritative, pageNumber, provenance);
    if (!normalizedCitation.title) normalizedCitation.title = citation ? citation.fileName : '';
    citations.push(normalizedCitation);
  });

  return { citations: citations, warnings: warnings };
}

function kspBuildKnowledgeSearchAuditRow_(params) {
  var options = params || {};
  var input = options.input || {};
  var sourceIds = (options.citations || []).map(function (citation) { return citation.sourceId; });
  var telemetry = typeof kspBuildSafeKnowledgeQueryTelemetry_ === 'function'
    ? kspBuildSafeKnowledgeQueryTelemetry_(
      options.telemetry && options.telemetry.state,
      options.telemetry && options.telemetry.providerStatus,
      options.telemetry && options.telemetry.response,
      options.telemetry || {}
    ) : {};
  telemetry.route = kspAiTrim_(options.provider || input.route);
  telemetry.mode = input.mode || KSP_KNOWLEDGE_SEARCH_MODES.FREE_QUESTION;
  telemetry.structured_filters = kspKnowledgeFilterAuditMetadata_(input);
  if ((input.selectedEntityKeys || []).length) telemetry.selected_entity_keys = input.selectedEntityKeys.slice();
  if ((options.entityEvidence || []).length) {
    telemetry.entity_evidence = options.entityEvidence.map(function (item) {
      return { entity_key: item.entityKey, status: item.evidenceStatus, cited_source_count: Number(item.citationCount || 0) };
    });
  }
  return {
    Event_Timestamp: kspCanonicalInstantIso_(options.timestamp),
    Actor: options.actor || 'UNIDENTIFIED',
    Action: 'AI_QUERY',
    Target_Type: 'KnowledgeSearch',
    Target_ID: options.interactionId || '',
    Result: options.result || KSP_AUDIT_RESULTS.FAILURE,
    Changed_Fields: '',
    Before_Metadata_JSON: '',
    After_Metadata_JSON: JSON.stringify(telemetry),
    Batch_ID: '',
    Error_Code: options.errorCode || '',
    Error_Message: options.errorCode ? kspSafePublicErrorMessage_(options.errorCode, 'SEARCH') : '',
    Search_Mode: input.mode || KSP_KNOWLEDGE_SEARCH_MODES.FREE_QUESTION,
    Question_Or_Instruction: '',
    Date_From: kspKnowledgeRequestFilters_(input).dateFrom,
    Date_To: kspKnowledgeRequestFilters_(input).dateTo,
    GP_Filter: kspKnowledgeRequestFilters_(input).gpId,
    Asset_Class_Filter: kspKnowledgeRequestFilters_(input).assetClassId,
    Capital_Type_Filter: kspKnowledgeRequestFilters_(input).capitalTypeId,
    Source_Type_Filter: kspNormalizeKnowledgeSourceTypes_(input).join(','),
    Model_ID: options.modelId || '',
    Cited_Source_IDs: kspUniqueStrings_(sourceIds).join(',')
  };
}
// ===== END src/150_KnowledgeSearchModels.gs =====

// ===== BEGIN src/151_KnowledgeSearchService.gs =====
function kspGetKnowledgeSearchBootstrap_(environment) {
  try {
    var context = environment.loadAiContext();
    var settings = kspNormalizeAiSettings_(context.settings);
    return {
      ok: true,
      workId: KSP_AI_WORK_ID,
      appVersion: KSP_AI_APP_VERSION,
      configured: Boolean(settings.storeName && settings.modelId),
      implementedModes: [KSP_AI_SEARCH_MODES.FREE_QUESTION],
      targetModes: ['自由質問', '要約', '時系列', '比較', '面談準備'],
      options: kspBuildKnowledgeSearchCatalog_(kspContextCounterpartyRows_(context), context.optionRows,
        context.meetingRows, context.pitchbookRows, context.newsRows, context.assessmentRows),
      syncIntervalMinutes: settings.syncIntervalMinutes
    };
  } catch (error) {
    return {
      ok: false,
      workId: KSP_AI_WORK_ID,
      error: { code: kspGetErrorCode_(error), message: kspSafePublicErrorMessage_(kspGetErrorCode_(error), 'SEARCH') }
    };
  }
}

function kspGetAiActorSafely_(environment, warnings) {
  try {
    return environment.getActor() || 'UNIDENTIFIED';
  } catch (error) {
    warnings.push({ code: 'ACTOR_RESOLUTION_FAILED', message: kspSafeOperationalWarning_('ACTOR_RESOLUTION_FAILED') });
    return 'UNIDENTIFIED';
  }
}

function kspTryAppendKnowledgeAudit_(environment, auditSpreadsheetId, row, warnings) {
  try {
    environment.appendAuditRow(auditSpreadsheetId, row);
  } catch (error) {
    warnings.push({ code: 'AUDIT_WRITE_FAILED', message: kspSafeOperationalWarning_('AUDIT_WRITE_FAILED') });
  }
}

function kspRunFreeQuestion_(environment, rawInput) {
  var warnings = [];
  var actor = kspGetAiActorSafely_(environment, warnings);
  var input = kspNormalizeKnowledgeSearchInput_(rawInput);
  var context = null;
  var settings = null;
  var auditSpreadsheetId = '';

  try {
    kspAssert_(kspClaimPublicOperation_(environment, 'KNOWLEDGE_SEARCH', actor, 'FREE_QUESTION', 2),
      'AI_RATE_LIMITED', '検索が集中しています。少し待って再試行してください。');
    input = kspValidateKnowledgeSearchInput_(input);
    context = environment.loadAiContext();
    settings = kspNormalizeAiSettings_(context.settings);
    auditSpreadsheetId = context.auditSpreadsheetId;
    kspAssert_(settings.storeName, 'AI_STORE_NOT_CONFIGURED', 'Gemini File Search Storeが設定されていません。');
    kspAssert_(settings.modelId, 'AI_MODEL_NOT_CONFIGURED', 'Gemini Flash model IDが設定されていません。');

    var catalog = kspBuildKnowledgeSearchCatalog_(kspContextCounterpartyRows_(context), context.optionRows,
      context.meetingRows, context.pitchbookRows, context.newsRows, context.assessmentRows);
    kspValidateKnowledgeFilterIds_(input, catalog);
    var metadataFilter = kspBuildMetadataFilter_(input);
    var request = kspBuildInteractionRequest_({
      storeName: settings.storeName,
      modelId: settings.modelId,
      question: input.question,
      metadataFilter: metadataFilter
    });
    var rawResponse = environment.queryFileSearch(request);
    var parsed = kspParseInteractionResponse_(rawResponse);
    var citationContext = environment.loadAiContext();
    var mapped = kspMapKnowledgeCitations_(
      parsed.citations,
      kspBuildAuthoritativeSourceMaps_(citationContext.meetingRows, citationContext.pitchbookRows,
        citationContext.newsRows, citationContext.assessmentRows), input
    );
    warnings = warnings.concat(mapped.warnings);

    var answer = parsed.answer;
    var insufficientEvidence = !answer || mapped.citations.length === 0;
    if (!answer) answer = '確認できる根拠が不足しています。';
    if (insufficientEvidence) {
      warnings.push({
        code: 'AI_INSUFFICIENT_EVIDENCE',
        message: '回答または根拠となる資料が不足しています。'
      });
    }

    var successAudit = kspBuildKnowledgeSearchAuditRow_({
      timestamp: environment.nowIso(),
      actor: actor,
      input: input,
      modelId: settings.modelId,
      interactionId: parsed.interactionId,
      result: KSP_AUDIT_RESULTS.SUCCESS,
      citations: mapped.citations
    });
    kspTryAppendKnowledgeAudit_(environment, auditSpreadsheetId, successAudit, warnings);

    return {
      ok: true,
      workId: KSP_AI_WORK_ID,
      mode: KSP_AI_SEARCH_MODES.FREE_QUESTION,
      answer: answer,
      citations: mapped.citations,
      insufficientEvidence: insufficientEvidence,
      metadataFilter: metadataFilter,
      interactionId: parsed.interactionId,
      warnings: warnings
    };
  } catch (error) {
    if (context && auditSpreadsheetId) {
      var failureAudit = kspBuildKnowledgeSearchAuditRow_({
        timestamp: environment.nowIso(),
        actor: actor,
        input: input,
        modelId: settings ? settings.modelId : '',
        result: KSP_AUDIT_RESULTS.FAILURE,
        errorCode: kspGetErrorCode_(error),
        errorMessage: kspSafePublicErrorMessage_(kspGetErrorCode_(error), 'SEARCH'),
        citations: []
      });
      kspTryAppendKnowledgeAudit_(environment, auditSpreadsheetId, failureAudit, warnings);
    }
    return {
      ok: false,
      workId: KSP_AI_WORK_ID,
      error: { code: kspGetErrorCode_(error), message: kspSafePublicErrorMessage_(kspGetErrorCode_(error), 'SEARCH') },
      warnings: warnings
    };
  }
}
// ===== END src/151_KnowledgeSearchService.gs =====

// ===== BEGIN src/152_KnowledgeFilterContracts.gs =====
var KSP_KNOWLEDGE_SEARCH_MODES = Object.freeze({
  FREE_QUESTION: '自由質問',
  SUMMARY: '要約',
  TIMELINE: '時系列',
  COMPARISON: '比較',
  MEETING_PREP: '面談準備'
});

var KSP_KNOWLEDGE_MODE_ORDER = Object.freeze([
  KSP_KNOWLEDGE_SEARCH_MODES.FREE_QUESTION,
  KSP_KNOWLEDGE_SEARCH_MODES.SUMMARY,
  KSP_KNOWLEDGE_SEARCH_MODES.TIMELINE,
  KSP_KNOWLEDGE_SEARCH_MODES.COMPARISON,
  KSP_KNOWLEDGE_SEARCH_MODES.MEETING_PREP
]);

var KSP_KNOWLEDGE_FOLLOW_UP_FILTERS = Object.freeze({
  REQUIRED: 'REQUIRED',
  NOT_REQUIRED: 'NOT_REQUIRED'
});

var KSP_KNOWLEDGE_MULTI_ENTITY_MIN = 2;
var KSP_KNOWLEDGE_MULTI_ENTITY_MAX = 5;
var KSP_KNOWLEDGE_ADVANCED_SOURCE_ID_MAX = 40;

function kspGetKnowledgeModeDefinition_(mode) {
  var definitions = {};
  definitions[KSP_KNOWLEDGE_SEARCH_MODES.FREE_QUESTION] = {
    mode: KSP_KNOWLEDGE_SEARCH_MODES.FREE_QUESTION,
    inputLabel: '質問',
    placeholder: '例: 最近の資料では、APACインフラの投資機会についてどのような見解が示されていますか？',
    inputRequired: true,
    targetRequired: false,
    instruction: '質問への直接回答を先に示し、資料で確認できる根拠、反証または不確実性、証拠不足を整理してください。',
    apiInstructions: [
      '最初に質問への直接回答を示し、その後に根拠となる要点を簡潔に整理してください。',
      '確認できる反証、不確実性、証拠不足も区別してください。'
    ]
  };
  definitions[KSP_KNOWLEDGE_SEARCH_MODES.SUMMARY] = {
    mode: KSP_KNOWLEDGE_SEARCH_MODES.SUMMARY,
    inputLabel: '追加指示',
    placeholder: '任意: リスクと投資機会を中心に整理してください。',
    inputRequired: false,
    targetRequired: false,
    instruction: '複数資料を横断して統合し、主要テーマ、重要事実・見解、変化、矛盾、証拠不足を整理してください。',
    apiInstructions: [
      '複数資料を横断して統合し、資料ごとの要約を単純に並べないでください。',
      '主要テーマ、重要事実・見解、裏付けられた変化や矛盾、証拠不足の順で整理してください。'
    ]
  };
  definitions[KSP_KNOWLEDGE_SEARCH_MODES.TIMELINE] = {
    mode: KSP_KNOWLEDGE_SEARCH_MODES.TIMELINE,
    inputLabel: '追加指示',
    placeholder: '任意: 過去12か月の変化を中心に整理してください。',
    inputRequired: false,
    targetRequired: false,
    instruction: '日付順に整理し、変化、継続事項、比較不能な期間、証拠が途切れる期間を区別してください。',
    apiInstructions: [
      '日付または期間順に整理し、前期からの変化と継続している事項を区別してください。',
      '異なる資料が異なる話題を扱うだけの場合は変化と断定せず、証拠が途切れる期間を明示してください。'
    ]
  };
  definitions[KSP_KNOWLEDGE_SEARCH_MODES.COMPARISON] = {
    mode: KSP_KNOWLEDGE_SEARCH_MODES.COMPARISON,
    inputLabel: '追加指示',
    placeholder: '任意: 投資機会、リスク、見通しの共通軸で比較してください。',
    inputRequired: false,
    targetRequired: false,
    instruction: '選択した2–5件の面談先を共通の項目で比較し、それぞれの根拠と情報が足りない点を示してください。',
    apiInstructions: [
      '選択Entityごとに資料で確認できる事実を帰属させ、共通軸の簡潔な比較表を作成してください。',
      '裏付けられた共通点、相違点、時系列の変化、証拠の非対称性を区別してください。',
      '根拠のないEntityは証拠不足と明示し、資料にない評価軸、順位付け、優劣、投資推奨を作らないでください。'
    ]
  };
  definitions[KSP_KNOWLEDGE_SEARCH_MODES.MEETING_PREP] = {
    mode: KSP_KNOWLEDGE_SEARCH_MODES.MEETING_PREP,
    inputLabel: '追加指示',
    placeholder: '任意: 次回面談で確認したいテーマを入力してください。',
    inputRequired: false,
    targetRequired: true,
    instruction: '選択した面談先との面談に向け、主な更新、変化、未解決点、確認事項、質問候補、資料で確認できない点を整理してください。資料にない情報は補わず、投資判断を自動生成しないでください。',
    apiInstructions: [
      '選択された単一EntityまたはGPとの次回面談に向けた実務的なBriefを作成してください。',
      '最近の更新、過去からの変化、未解決論点、再確認事項、質問候補、証拠不足を整理してください。',
      '質問候補は取得資料で確認できる未解決点や変化に結び付け、投資判断や推奨を自動生成しないでください。'
    ]
  };
  var normalized = kspAiTrim_(mode) || KSP_KNOWLEDGE_SEARCH_MODES.FREE_QUESTION;
  kspAssert_(definitions[normalized], 'AI_SEARCH_MODE_INVALID', '検索モードが不正です。');
  return kspDeepClone_(definitions[normalized]);
}

function kspGetKnowledgeModeDefinitions_() {
  return KSP_KNOWLEDGE_MODE_ORDER.map(function (mode) {
    var definition = kspGetKnowledgeModeDefinition_(mode);
    delete definition.apiInstructions;
    return definition;
  });
}

function kspNormalizeKnowledgeFollowUpFilter_(value) {
  if (value === true || String(value).toUpperCase() === KSP_KNOWLEDGE_FOLLOW_UP_FILTERS.REQUIRED ||
      String(value).toLowerCase() === 'true') return KSP_KNOWLEDGE_FOLLOW_UP_FILTERS.REQUIRED;
  if (value === false || String(value).toUpperCase() === KSP_KNOWLEDGE_FOLLOW_UP_FILTERS.NOT_REQUIRED ||
      String(value).toLowerCase() === 'false') return KSP_KNOWLEDGE_FOLLOW_UP_FILTERS.NOT_REQUIRED;
  return '';
}

function kspNormalizeKnowledgeFilters_(value) {
  var source = value && typeof value === 'object' ? value : {};
  return {
    dateFrom: kspAiTrim_(source.dateFrom),
    dateTo: kspAiTrim_(source.dateTo),
    counterpartyType: kspAiTrim_(source.counterpartyType).toUpperCase(),
    entityKey: kspAiTrim_(source.entityKey || source.counterpartyEntityKey),
    gpId: kspAiTrim_(source.gpId),
    assetClassId: kspAiTrim_(source.assetClassId),
    capitalTypeId: kspAiTrim_(source.capitalTypeId),
    teamId: kspAiTrim_(source.teamId),
    fundStrategy: kspAiTrim_(source.fundStrategy),
    followUp: kspNormalizeKnowledgeFollowUpFilter_(source.followUp !== undefined ? source.followUp : source.followUpRequired),
    sourceTypes: kspNormalizeKnowledgeSourceTypes_(source),
    sourceId: kspAiTrim_(source.sourceId),
    relatedGpId: kspAiTrim_(source.relatedGpId || source.relatedGp),
    meetingTypeCode: kspAiTrim_(source.meetingTypeCode || source.meetingType).toUpperCase()
  };
}

function kspNormalizeKnowledgeSourceTypes_(value) {
  var source = value && typeof value === 'object' ? value : {};
  var filters = source.filters && typeof source.filters === 'object' ? source.filters : {};
  if (Object.prototype.hasOwnProperty.call(source, 'sourceTypes') &&
      Object.prototype.hasOwnProperty.call(filters, 'sourceTypes')) {
    var topTypes = kspNormalizeKnowledgeSourceTypes_({ sourceTypes: source.sourceTypes });
    var nestedTypes = kspNormalizeKnowledgeSourceTypes_({ sourceTypes: filters.sourceTypes });
    kspAssert_(JSON.stringify(topTypes) === JSON.stringify(nestedTypes),
      'AI_SOURCE_TYPES_CONFLICT', '対象資料の選択が一致しません。');
  }
  var hasExplicit = Object.prototype.hasOwnProperty.call(source, 'sourceTypes') ||
    Object.prototype.hasOwnProperty.call(filters, 'sourceTypes');
  var explicit = Object.prototype.hasOwnProperty.call(source, 'sourceTypes')
    ? source.sourceTypes : filters.sourceTypes;
  var legacy = kspAiTrim_(source.sourceType || filters.sourceType);
  var raw = hasExplicit ? explicit :
    (legacy ? [legacy] : [KSP_AI_SOURCE_TYPES.MEETING, KSP_AI_SOURCE_TYPES.PITCHBOOK]);
  kspAssert_(Array.isArray(raw), 'AI_SOURCE_TYPES_INVALID', '対象資料の選択が不正です。');
  var selected = {};
  raw.forEach(function (value) {
    var type = kspAiTrim_(value);
    kspAssert_(Boolean(kspAiSourceLabel_(type)), 'AI_SOURCE_TYPE_INVALID', 'Source Typeが不正です。');
    selected[type] = true;
  });
  var normalized = KSP_AI_SOURCE_DEFINITIONS.map(function (definition) { return definition.id; })
    .filter(function (type) { return selected[type]; });
  kspAssert_(normalized.length > 0, 'AI_SOURCE_TYPES_REQUIRED', '対象資料を1件以上選択してください。');
  return normalized;
}

function kspKnowledgeRequestFilters_(request) {
  var source = request && typeof request === 'object' ? request : {};
  var filterSource = source.filters && typeof source.filters === 'object' ? source.filters : source;
  return kspNormalizeKnowledgeFilters_(Object.assign({}, filterSource, {
    sourceTypes: kspNormalizeKnowledgeSourceTypes_(source)
  }));
}

function kspKnowledgeRequestWithLegacyFilterAliases_(request) {
  var output = request || {};
  var filters = kspKnowledgeRequestFilters_(output);
  output.filters = filters;
  Object.keys(filters).forEach(function (key) { output[key] = filters[key]; });
  output.sourceTypes = filters.sourceTypes.slice();
  delete output.sourceType;
  return output;
}

function kspNormalizeCanonicalKnowledgeRequest_(input) {
  var source = input && typeof input === 'object' ? input : {};
  var instruction = source.questionOrInstruction !== undefined ? source.questionOrInstruction :
    (source.question !== undefined ? source.question : source.instruction);
  var rawEntities = Array.isArray(source.selectedEntityKeys) ? source.selectedEntityKeys :
    (Array.isArray(source.selectedEntities) ? source.selectedEntities : []);
  var sourceTypes = kspNormalizeKnowledgeSourceTypes_(source);
  var filterSource = source.filters && typeof source.filters === 'object' ? source.filters : source;
  var filters = kspNormalizeKnowledgeFilters_(Object.assign({}, filterSource, { sourceTypes: sourceTypes }));
  filters.sourceTypes = sourceTypes;
  var selectedEntityKeys = rawEntities.map(kspAiTrim_).filter(Boolean);
  return {
    route: kspAiTrim_(source.route || source.provider).toUpperCase(),
    mode: kspAiTrim_(source.mode) || KSP_KNOWLEDGE_SEARCH_MODES.FREE_QUESTION,
    questionOrInstruction: kspAiTrim_(instruction),
    filters: filters,
    sourceTypes: sourceTypes,
    selectedEntityKeys: selectedEntityKeys,
    resolvedSourceIds: Array.isArray(source.resolvedSourceIds)
      ? source.resolvedSourceIds.map(kspAiTrim_).filter(Boolean) : [],
    advancedFilterResolved: source.advancedFilterResolved === true,
    modelProfileId: kspAiTrim_(source.modelProfileId).toLowerCase(),
    thinkingProfileId: kspAiTrim_(source.thinkingProfileId).toLowerCase()
  };
}

function kspValidateCanonicalKnowledgeRequest_(request) {
  var input = kspNormalizeCanonicalKnowledgeRequest_(request || {});
  var filters = kspKnowledgeRequestFilters_(input);
  var definition = kspGetKnowledgeModeDefinition_(input.mode);
  if (definition.inputRequired) {
    kspAssert_(input.questionOrInstruction, 'AI_QUESTION_REQUIRED', '質問を入力してください。');
  }
  kspAssert_(input.questionOrInstruction.length <= KSP_AI_DEFAULTS.MAX_QUESTION_LENGTH,
    'AI_QUESTION_TOO_LONG', '質問または追加指示は5,000文字以内で入力してください。');
  if (filters.dateFrom) kspAssert_(kspIsValidDateKey_(filters.dateFrom), 'AI_DATE_FROM_INVALID', 'Date Fromが不正です。');
  if (filters.dateTo) kspAssert_(kspIsValidDateKey_(filters.dateTo), 'AI_DATE_TO_INVALID', 'Date Toが不正です。');
  if (filters.dateFrom && filters.dateTo) {
    kspAssert_(filters.dateFrom <= filters.dateTo, 'AI_DATE_RANGE_INVALID', 'Date FromはDate To以前にしてください。');
  }
  kspAssert_(input.sourceTypes.length >= 1 && input.sourceTypes.length <= KSP_AI_SOURCE_DEFINITIONS.length,
    'AI_SOURCE_TYPES_REQUIRED', '対象資料を1件以上選択してください。');
  if (filters.entityKey) {
    kspAssert_(Boolean(kspCounterpartyIdFromEntityKey_(filters.entityKey)),
      'AI_ENTITY_FILTER_INVALID', 'Counterparty Entityが不正です。');
    if (filters.gpId) {
      kspAssert_(kspCounterpartyIdFromEntityKey_(filters.entityKey) === filters.gpId,
        'AI_ENTITY_GP_CONFLICT', 'Counterparty EntityとGPが一致しません。');
    }
  }
  var selectedEntityKeys = input.selectedEntityKeys || [];
  var selectedSeen = {};
  selectedEntityKeys.forEach(function (entityKey) {
    kspAssert_(Boolean(kspCounterpartyIdFromEntityKey_(entityKey)),
      'AI_ENTITY_FILTER_INVALID', '選択されたCounterparty Entityが不正です。');
    kspAssert_(!selectedSeen[entityKey], 'AI_MULTI_ENTITY_DUPLICATE', '同じEntityを複数回選択できません。');
    selectedSeen[entityKey] = true;
  });
  if (selectedEntityKeys.length >= KSP_KNOWLEDGE_MULTI_ENTITY_MIN) {
    kspAssert_(input.mode === KSP_KNOWLEDGE_SEARCH_MODES.COMPARISON,
      'AI_MULTI_ENTITY_MODE_REQUIRED', '2–5 Entity選択は比較モードでのみ利用できます。');
    kspAssert_(selectedEntityKeys.length <= KSP_KNOWLEDGE_MULTI_ENTITY_MAX,
      'AI_MULTI_ENTITY_COUNT_INVALID', '比較するEntityは2–5件で選択してください。');
    kspAssert_(!filters.entityKey, 'AI_MULTI_ENTITY_AMBIGUOUS_SCOPE',
      '複数Entity比較では単一Entityフィルターを同時に指定できません。');
  }
  if (input.mode === KSP_KNOWLEDGE_SEARCH_MODES.COMPARISON && selectedEntityKeys.length === 1) {
    kspAssert_(filters.entityKey === selectedEntityKeys[0],
      filters.entityKey ? 'AI_MULTI_ENTITY_AMBIGUOUS_SCOPE' : 'AI_MULTI_ENTITY_COUNT_INVALID',
      filters.entityKey ? '比較Entityと単一Entityフィルターが一致しません。' :
        '明示的なEntity比較では2–5件を選択してください。');
  }
  if (definition.targetRequired) {
    kspAssert_(filters.entityKey || filters.gpId, 'AI_MEETING_PREP_TARGET_REQUIRED',
      '面談準備ではCounterparty EntityまたはGPを選択してください。');
  }
  if ((filters.teamId || filters.followUp || filters.relatedGpId || filters.meetingTypeCode) &&
      !(input.sourceTypes.length === 1 && input.sourceTypes[0] === KSP_AI_SOURCE_TYPES.MEETING)) {
    kspAssert_(false, 'AI_FILTER_SOURCE_TYPE_INCOMPATIBLE',
      'チーム、MTG種別、follow-upは面談メモのみで利用できます。');
  }
  return input;
}

function kspKnowledgeFilterAuditMetadata_(request) {
  var filters = kspKnowledgeRequestFilters_(request);
  var output = {};
  Object.keys(filters).forEach(function (key) {
    if (filters[key] !== '' && filters[key] !== null && filters[key] !== undefined) output[key] = filters[key];
  });
  var selected = request && Array.isArray(request.selectedEntityKeys) ? request.selectedEntityKeys : [];
  if (selected.length) output.selectedEntityKeys = selected.slice();
  return output;
}

function kspKnowledgeScopeSummary_(request) {
  var input = request || {};
  var filters = kspKnowledgeRequestFilters_(input);
  var parts = [];
  if (filters.dateFrom || filters.dateTo) parts.push('期間 ' + (filters.dateFrom || '…') + '–' + (filters.dateTo || '…'));
  if (filters.counterpartyType) parts.push('面談先種別 指定あり');
  if (filters.entityKey) parts.push('面談先 指定あり');
  if ((input.selectedEntityKeys || []).length) parts.push('比較対象 ' + input.selectedEntityKeys.length + '件');
  if (filters.assetClassId) parts.push('アセットクラス 指定あり');
  if (filters.capitalTypeId) parts.push('Equity / Debt 指定あり');
  if (filters.teamId) parts.push('チーム 指定あり');
  if (filters.fundStrategy) parts.push('Fund / Strategy ' + filters.fundStrategy);
  if (filters.meetingTypeCode) parts.push('MTG種別 指定あり');
  parts.push('対象資料 ' + filters.sourceTypes.map(kspAiSourceLabel_).join('・'));
  return parts.join(' / ');
}

function kspBuildCanonicalKnowledgePrompt_(request) {
  var input = kspValidateCanonicalKnowledgeRequest_(request);
  var definition = kspGetKnowledgeModeDefinition_(input.mode);
  var lines = [
    '社内ナレッジベースから取得された資料だけを根拠として、日本語で回答してください。',
    '根拠が不足する箇所は推測で埋めず、確認できない点と証拠不足を明示してください。',
    '外部知識や一般論を、資料に記載された事実として扱わないでください。',
    '重要な事実・比較・変化には、取得資料に対応する出典情報を付けてください。',
    '',
    'モード: ' + definition.mode,
    '選択範囲: ' + kspKnowledgeScopeSummary_(input)
  ].concat(definition.apiInstructions || []);
  if (input.sourceTypes.length > 1) {
    lines.push('複数の資料種別に根拠がある場合は、該当する資料種別ごとに出典を分けて示してください。');
    input.sourceTypes.forEach(function (sourceType) {
      lines.push('- ' + kspAiSourceLabel_(sourceType));
    });
    lines.push('最後に「横断整理」で、一致、相違・食い違い、追加確認事項、次回面談論点を根拠のある範囲で整理してください。');
  }
  if (input.sourceTypes.indexOf(KSP_AI_SOURCE_TYPES.INTERNAL_ASSESSMENT) !== -1) {
    lines.push('評価は「当時の社内評価」と明示し、外部事実と混同しないでください。');
  }
  if ((input.selectedEntityKeys || []).length >= KSP_KNOWLEDGE_MULTI_ENTITY_MIN) {
    lines.push('比較対象Entity（この安定キー以外を根拠に含めない）:');
    input.selectedEntityKeys.forEach(function (entityKey) { lines.push('- ' + entityKey); });
    lines.push('各Entityの事実と出典を対応付け、証拠がないEntityは明示的に証拠不足と記載してください。');
  }
  if (input.mode === KSP_KNOWLEDGE_SEARCH_MODES.FREE_QUESTION) lines.push('質問:', input.questionOrInstruction);
  else if (input.questionOrInstruction) lines.push('追加指示:', input.questionOrInstruction);
  return lines.join('\n');
}

function kspKnowledgeExactTokens_(value) {
  return kspMaintenanceSplitCodes_(value).map(kspAiTrim_).filter(Boolean);
}

function kspResolveKnowledgeAdvancedSourceIds_(request, meetingRows) {
  var input = kspKnowledgeRequestWithLegacyFilterAliases_(kspNormalizeCanonicalKnowledgeRequest_(request));
  var filters = kspKnowledgeRequestFilters_(input);
  if (!filters.relatedGpId && !filters.meetingTypeCode) return input;
  kspAssert_(input.sourceTypes.length === 1 && input.sourceTypes[0] === KSP_AI_SOURCE_TYPES.MEETING,
    'AI_FILTER_SOURCE_TYPE_INCOMPATIBLE', '旧形式の検索条件は面談メモのみで利用できます。');
  var sourceIds = (meetingRows || []).filter(function (row) {
    if (String(row.Status || '') !== KSP_STATUS.ACTIVE) return false;
    if (filters.relatedGpId && kspKnowledgeExactTokens_(kspMeetingRelatedGpIds_(row)).indexOf(filters.relatedGpId) === -1) return false;
    if (filters.meetingTypeCode && kspKnowledgeExactTokens_(row.Meeting_Type_Codes).indexOf(filters.meetingTypeCode) === -1) return false;
    return typeof kspKnowledgeExportRowMatches_ !== 'function' || kspKnowledgeExportRowMatches_(row, input);
  }).map(function (row) { return kspAiTrim_(row.Meeting_ID); }).filter(Boolean);
  sourceIds = kspUniqueStrings_(sourceIds);
  kspAssert_(sourceIds.length <= KSP_KNOWLEDGE_ADVANCED_SOURCE_ID_MAX,
    'AI_ADVANCED_FILTER_TOO_BROAD', '該当するMeetingが多すぎます。条件を絞ってください。');
  input.resolvedSourceIds = sourceIds;
  input.advancedFilterResolved = true;
  return kspKnowledgeRequestWithLegacyFilterAliases_(input);
}

function kspBuildKnowledgeEntityEvidence_(request, catalog, citations) {
  var selected = request && Array.isArray(request.selectedEntityKeys) ? request.selectedEntityKeys : [];
  var entities = catalog && catalog.counterpartyEntities || [];
  return selected.map(function (entityKey) {
    var catalogItem = entities.filter(function (item) { return item.entityKey === entityKey; })[0] || {};
    var entityCitations = (citations || []).filter(function (citation) {
      return citation.entityKey === entityKey ||
        (citation.entityKeys || []).indexOf(entityKey) !== -1;
    });
    return {
      entityKey: entityKey,
      counterpartyType: catalogItem.type || '',
      displayName: catalogItem.name || entityKey,
      evidenceStatus: entityCitations.length ? 'CITED' : 'NO_EVIDENCE',
      citationCount: entityCitations.length,
      citations: entityCitations
    };
  });
}

function kspGuardKnowledgeComparisonCitations_(request, catalog, citations) {
  var selected = request && Array.isArray(request.selectedEntityKeys) ? request.selectedEntityKeys : [];
  if (selected.length < KSP_KNOWLEDGE_MULTI_ENTITY_MIN) {
    return { citations: citations || [], warnings: [], entityEvidence: [] };
  }
  var allowed = {};
  selected.forEach(function (entityKey) { allowed[entityKey] = true; });
  var rejected = false;
  var kept = (citations || []).filter(function (citation) {
    if (allowed[citation.entityKey] || (citation.entityKeys || []).some(function (key) { return allowed[key]; })) return true;
    rejected = true;
    return false;
  });
  var evidence = kspBuildKnowledgeEntityEvidence_(request, catalog, kept);
  var warnings = [];
  if (rejected) warnings.push({
    code: 'AI_UNSELECTED_ENTITY_CITATION',
    message: '選択外EntityのCitationを検出したため比較結果から除外しました。'
  });
  evidence.filter(function (item) { return item.evidenceStatus === 'NO_EVIDENCE'; }).forEach(function (item) {
    warnings.push({ code: 'AI_ENTITY_EVIDENCE_GAP', message: item.displayName + 'の根拠資料が確認できません。' });
  });
  return { citations: kept, warnings: warnings, entityEvidence: evidence, rejectedUnselected: rejected };
}
// ===== END src/152_KnowledgeFilterContracts.gs =====

// ===== BEGIN src/155_KnowledgeExportContracts.gs =====
var KSP_KNOWLEDGE_EXPORT_WORK_ID = '0011';
var KSP_KNOWLEDGE_EXPORT_APP_VERSION = '0.1.0';

var KSP_KNOWLEDGE_EXPORT_SOURCE_TYPES = Object.freeze({
  MEETING: 'Meeting',
  PITCHBOOK: 'Pitchbook',
  NEWS: 'News',
  ASSESSMENT: 'Internal Assessment'
});

var KSP_KNOWLEDGE_EXPORT_OUTPUT_TYPES = Object.freeze({
  GOOGLE_DOCS: 'GOOGLE_DOCS',
  PDF: 'PDF'
});

var KSP_KNOWLEDGE_EXPORT_ACTIONS = Object.freeze({
  PREVIEW: 'KNOWLEDGE_EXPORT_PREVIEW',
  GOOGLE_DOCS: 'KNOWLEDGE_EXPORT_GOOGLE_DOCS',
  PDF: 'KNOWLEDGE_EXPORT_PDF',
  PROMPT_COPY: 'KNOWLEDGE_EXPORT_PROMPT_COPY'
});

var KSP_KNOWLEDGE_EXPORT_LIMITS = Object.freeze({
  WARNING_MEETINGS: 30,
  WARNING_MEETING_CHARACTERS: 150000,
  HARD_STOP_MEETINGS: 50,
  HARD_STOP_MEETING_CHARACTERS: 250000,
  HARD_STOP_PITCHBOOKS: 200,
  MAX_PROMPT_LENGTH: 5000,
  MAX_PREVIEW_MILLIS: 20000,
  MAX_SOURCE_ID_REPORT: 40,
  THROTTLE_SECONDS: 2,
  IDEMPOTENCY_SECONDS: 300
});

var KSP_KNOWLEDGE_EXPORT_MODE_ORDER = KSP_KNOWLEDGE_MODE_ORDER;

function kspGetKnowledgeExportModeDefinition_(mode) {
  try {
    var definition = kspGetKnowledgeModeDefinition_(mode);
    definition.gpRequired = definition.targetRequired;
    return definition;
  } catch (error) {
    error.code = 'KNOWLEDGE_EXPORT_MODE_INVALID';
    throw error;
  }
}

function kspGetKnowledgeExportModeDefinitions_() {
  return kspGetKnowledgeModeDefinitions_().map(function (definition) {
    definition.gpRequired = definition.targetRequired;
    return definition;
  });
}

function kspNormalizeKnowledgeExportInput_(input) {
  var source = input && typeof input === 'object' ? input : {};
  var output = kspKnowledgeRequestWithLegacyFilterAliases_(kspNormalizeCanonicalKnowledgeRequest_(source));
  output.previewFingerprint = String(source.previewFingerprint || '').trim();
  output.outputType = String(source.outputType || '').trim();
  output.copyConfirmed = source.copyConfirmed === true;
  return output;
}

// Full Output ignores AI mode, prompt, and profiles while retaining selected source
// and Entity scope. Build a new request; never mutate caller-owned UI/search state.
function kspNormalizeKnowledgeFullOutputInput_(input) {
  var source = input && typeof input === 'object' ? input : {};
  var filters = kspKnowledgeRequestFilters_(source);
  var nested = source.filters && typeof source.filters === 'object' ? source.filters : {};
  var hasSelection = Object.prototype.hasOwnProperty.call(source, 'sourceTypes') ||
    Boolean(kspAiTrim_(source.sourceType)) ||
    Object.prototype.hasOwnProperty.call(nested, 'sourceTypes') ||
    Boolean(kspAiTrim_(nested.sourceType));
  if (!hasSelection) filters.sourceTypes = [KSP_KNOWLEDGE_EXPORT_SOURCE_TYPES.MEETING];
  var selectedEntityKeys = Array.isArray(source.selectedEntityKeys) ? source.selectedEntityKeys : [];
  return kspNormalizeKnowledgeExportInput_({
    route: KSP_AI_ROUTES.FULL_EXPORT,
    mode: selectedEntityKeys.length >= KSP_KNOWLEDGE_MULTI_ENTITY_MIN
      ? KSP_KNOWLEDGE_SEARCH_MODES.COMPARISON : KSP_KNOWLEDGE_SEARCH_MODES.SUMMARY,
    questionOrInstruction: '',
    selectedEntityKeys: selectedEntityKeys,
    sourceTypes: filters.sourceTypes,
    filters: filters,
    previewFingerprint: source.previewFingerprint,
    outputType: source.outputType
  });
}

function kspKnowledgeExportPublicFilters_(input) {
  return kspKnowledgeRequestFilters_(input);
}

function kspValidateKnowledgeExportFilters_(input, catalog) {
  var value = input || kspNormalizeKnowledgeExportInput_({});
  if (value.dateFrom) kspAssert_(kspIsValidDateKey_(value.dateFrom), 'KNOWLEDGE_EXPORT_DATE_FROM_INVALID', 'Date Fromが不正です。');
  if (value.dateTo) kspAssert_(kspIsValidDateKey_(value.dateTo), 'KNOWLEDGE_EXPORT_DATE_TO_INVALID', 'Date Toが不正です。');
  if (value.dateFrom && value.dateTo) {
    kspAssert_(value.dateFrom <= value.dateTo, 'KNOWLEDGE_EXPORT_DATE_RANGE_INVALID', 'Date FromはDate To以前にしてください。');
  }
  var canonical = kspValidateCanonicalKnowledgeRequest_(value);
  value.sourceTypes = canonical.sourceTypes;
  value.filters = canonical.filters;
  var filters = kspKnowledgeRequestFilters_(value);
  if (filters.entityKey) {
    kspAssert_(Boolean(kspCounterpartyIdFromEntityKey_(filters.entityKey)),
      'AI_ENTITY_FILTER_INVALID', 'Counterparty Entityが不正です。');
    if (filters.gpId) kspAssert_(kspCounterpartyIdFromEntityKey_(filters.entityKey) === filters.gpId,
      'AI_ENTITY_GP_CONFLICT', 'Counterparty EntityとGPが一致しません。');
  }
  kspValidateKnowledgeFilterIds_(value, catalog || kspBuildKnowledgeSearchCatalog_([], []));
  return value;
}

function kspValidateKnowledgeExportPromptInput_(input, catalog) {
  var value = kspValidateKnowledgeExportFilters_(input, catalog);
  var definition = kspGetKnowledgeExportModeDefinition_(value.mode);
  kspValidateCanonicalKnowledgeRequest_(value);
  kspValidateKnowledgeFilterIds_(value, catalog || kspBuildKnowledgeSearchCatalog_([], []));
  kspAssert_(value.questionOrInstruction.length <= KSP_KNOWLEDGE_EXPORT_LIMITS.MAX_PROMPT_LENGTH,
    'KNOWLEDGE_EXPORT_PROMPT_TOO_LONG', '質問または追加指示は5,000文字以内で入力してください。');
  if (definition.inputRequired) {
    kspAssert_(value.questionOrInstruction, 'KNOWLEDGE_EXPORT_PROMPT_REQUIRED', '質問を入力してください。');
  }
  return value;
}

function kspValidateKnowledgeExportCopyInput_(input, catalog) {
  var value = kspValidateKnowledgeExportPromptInput_(input, catalog);
  kspAssert_(value.copyConfirmed, 'KNOWLEDGE_EXPORT_COPY_NOT_CONFIRMED',
    'コピー成功の確認がありません。');
  return value;
}

function kspValidateKnowledgeExportOutputType_(outputType) {
  var value = String(outputType || '').trim();
  kspAssert_(value === KSP_KNOWLEDGE_EXPORT_OUTPUT_TYPES.GOOGLE_DOCS ||
    value === KSP_KNOWLEDGE_EXPORT_OUTPUT_TYPES.PDF,
    'KNOWLEDGE_EXPORT_OUTPUT_TYPE_INVALID', '出力形式が不正です。');
  return value;
}

function kspKnowledgeExportDate_(value) {
  return kspCanonicalBusinessDate_(value);
}

function kspKnowledgeExportUpdatedAt_(value) {
  return kspCanonicalInstantIso_(value);
}

function kspIsKnowledgeExportDriveUrl_(value) {
  return Boolean(kspKnowledgeExportUrlFileId_(value));
}

function kspKnowledgeExportUrlFileId_(value) {
  var url = String(value || '').trim();
  var match = /^https:\/\/docs\.google\.com\/(?:document|presentation|spreadsheets)\/d\/([^/?#&]+)(?:[/?#]|$)/i.exec(url);
  if (match) return match[1];
  match = /^https:\/\/drive\.google\.com\/file\/d\/([^/?#&]+)(?:[/?#]|$)/i.exec(url);
  if (match) return match[1];
  match = /^https:\/\/drive\.google\.com\/(?:open|uc)\?[^#]*\bid=([^&#]+)/i.exec(url);
  return match ? match[1] : '';
}

function kspKnowledgeExportUrlMatchesId_(value, fileId) {
  return Boolean(fileId) && kspKnowledgeExportUrlFileId_(value) === String(fileId);
}

function kspBuildKnowledgeExportCanonicalUrl_(sourceType, fileId, isGoogleDoc) {
  var id = String(fileId || '').trim();
  kspAssert_(id, 'KNOWLEDGE_EXPORT_FILE_ID_MISSING', '原資料のファイルIDがありません。');
  return sourceType === KSP_KNOWLEDGE_EXPORT_SOURCE_TYPES.MEETING || isGoogleDoc
    ? 'https://docs.google.com/document/d/' + id + '/edit'
    : 'https://drive.google.com/open?id=' + id;
}

function kspKnowledgeExportSourceError_(code, sourceId, message) {
  var error = new Error(message || 'Knowledge Export source integrity failed.');
  error.code = code;
  error.sourceId = String(sourceId || '');
  return error;
}

function kspKnowledgeExportSafeMessage_(code, error) {
  var messages = {
    KNOWLEDGE_EXPORT_MODE_INVALID: '書き出しモードが不正です。',
    KNOWLEDGE_EXPORT_GP_REQUIRED: '面談準備ではGPを選択してください。',
    KNOWLEDGE_EXPORT_DATE_FROM_INVALID: 'Date Fromが不正です。',
    KNOWLEDGE_EXPORT_DATE_TO_INVALID: 'Date Toが不正です。',
    KNOWLEDGE_EXPORT_DATE_RANGE_INVALID: 'Date FromはDate To以前にしてください。',
    KNOWLEDGE_EXPORT_SOURCE_TYPE_INVALID: 'Source Typeが不正です。',
    AI_SOURCE_TYPES_REQUIRED: '対象資料を1件以上選択してください。',
    AI_SOURCE_TYPES_INVALID: '対象資料の選択が不正です。',
    AI_SOURCE_TYPES_CONFLICT: '対象資料の選択が一致しません。',
    AI_SOURCE_TYPE_INVALID: '対象資料の種類が不正です。',
    AI_ADVANCED_FILTER_TOO_BROAD: '対象資料が多すぎます。フィルターを絞ってください。',
    AI_GP_FILTER_UNAVAILABLE: '選択されたGPは利用できません。',
    AI_ASSET_CLASS_FILTER_UNAVAILABLE: '選択されたアセットクラスは利用できません。',
    AI_CAPITAL_TYPE_FILTER_UNAVAILABLE: '選択されたEquity / Debtは利用できません。',
    AI_TEAM_FILTER_UNAVAILABLE: '選択されたチームは利用できません。',
    AI_COUNTERPARTY_TYPE_FILTER_UNAVAILABLE: '選択した面談先種別は利用できません。',
    AI_ENTITY_FILTER_UNAVAILABLE: '選択した面談先は利用できません。',
    AI_FUND_STRATEGY_FILTER_UNAVAILABLE: '選択されたFund / Strategyは利用できません。',
    AI_ENTITY_TYPE_CONFLICT: '面談先の種別が一致しません。',
    AI_ENTITY_GP_CONFLICT: '面談先とGPの指定が一致しません。',
    AI_MULTI_ENTITY_COUNT_INVALID: '比較する面談先を2–5件選択してください。',
    AI_MULTI_ENTITY_DUPLICATE: '同じ面談先を複数回選択できません。',
    AI_MULTI_ENTITY_MODE_REQUIRED: '面談先の複数選択は比較モードで利用できます。',
    AI_MULTI_ENTITY_AMBIGUOUS_SCOPE: '複数の面談先と単一の面談先を同時に指定できません。',
    AI_RELATED_GP_FILTER_UNAVAILABLE: '旧形式の検索条件は利用できません。',
    AI_MEETING_TYPE_FILTER_UNAVAILABLE: '選択されたMTG種別は利用できません。',
    AI_FILTER_SOURCE_TYPE_INCOMPATIBLE: 'チーム、MTG種別、フォローアップは「面談メモ」のみ選択した場合に利用できます。',
    KNOWLEDGE_EXPORT_PROMPT_REQUIRED: '自由質問では質問を入力してください。',
    KNOWLEDGE_EXPORT_PROMPT_TOO_LONG: '質問または追加指示は5,000文字以内で入力してください。',
    KNOWLEDGE_EXPORT_COPY_NOT_CONFIRMED: 'コピー成功の確認がないため、監査記録を作成できません。',
    KNOWLEDGE_EXPORT_OUTPUT_TYPE_INVALID: '出力形式が不正です。',
    KNOWLEDGE_EXPORT_PREVIEW_REQUIRED: '先に対象資料を確認してください。',
    KNOWLEDGE_EXPORT_PREVIEW_STALE: 'プレビューが古くなっています。再度プレビューを実行してください。',
    KNOWLEDGE_EXPORT_NO_RESULTS: '条件に合う有効な資料はありません。',
    KNOWLEDGE_EXPORT_LIMIT_EXCEEDED: '対象資料が書き出し上限を超えています。フィルターを絞ってください。',
    KNOWLEDGE_EXPORT_MEETING_DOCUMENT_MISSING: '面談記録のGoogle Docs原本が見つかりません。',
    KNOWLEDGE_EXPORT_MEETING_URL_MISSING: '面談記録の原本リンクがありません。',
    KNOWLEDGE_EXPORT_MEETING_LINK_MISMATCH: '面談記録の原本リンクが一致しません。',
    KNOWLEDGE_EXPORT_MEETING_DOCUMENT_READ_FAILED: '面談記録のGoogle Docs原本を読み込めません。',
    KNOWLEDGE_EXPORT_PITCHBOOK_FILE_MISSING: '保存資料の原本ファイルが見つかりません。',
    KNOWLEDGE_EXPORT_PITCHBOOK_URL_MISSING: '保存資料の原本リンクがありません。',
    KNOWLEDGE_EXPORT_PITCHBOOK_LINK_MISMATCH: '保存資料の原本リンクが一致しません。',
    KNOWLEDGE_EXPORT_PITCHBOOK_METADATA_INVALID: '保存資料の原本ファイルを開くことができません。',
    KNOWLEDGE_EXPORT_PITCHBOOK_FILE_READ_FAILED: '保存資料の原本ファイルを読み込めません。',
    KNOWLEDGE_EXPORT_SOURCE_INTEGRITY_FAILED: '選択した資料の原本を確認できません。',
    KNOWLEDGE_EXPORT_SOURCE_READ_FAILED: '選択した資料の原本本文を読み込めません。',
    KNOWLEDGE_EXPORT_UNSUPPORTED_MATERIALIZATION: '選択した資料の形式は全文出力に対応していません。',
    KNOWLEDGE_EXPORT_SCOPE_MISMATCH: '検索範囲と原本の対応を確認できません。',
    KNOWLEDGE_EXPORT_RATE_LIMITED: '処理が集中しています。少し待って再試行してください。',
    KNOWLEDGE_EXPORTS_FOLDER_MISSING: '書き出し先フォルダが見つかりません。',
    KNOWLEDGE_EXPORTS_FOLDER_INVALID: '書き出し先フォルダを確認できません。',
    KNOWLEDGE_EXPORT_ARTIFACT_MISSING: '書き出したファイルが見つかりません。',
    KNOWLEDGE_EXPORT_ARTIFACT_URL_MISSING: '書き出したファイルのリンクがありません。',
    KNOWLEDGE_EXPORT_ARTIFACT_URL_MISMATCH: '書き出したファイルのリンクが一致しません。',
    KNOWLEDGE_EXPORT_DOCUMENT_CREATE_FAILED: 'Google Docsの書き出しを完了できませんでした。',
    KNOWLEDGE_EXPORT_DOCUMENT_URL_MISSING: '作成したGoogle Docsのリンクがありません。',
    KNOWLEDGE_EXPORT_PDF_EMPTY: 'PDFの内容が空です。',
    KNOWLEDGE_EXPORT_PDF_CREATE_FAILED: 'PDFの書き出しを完了できませんでした。',
    KNOWLEDGE_EXPORT_PDF_URL_MISSING: '作成したPDFのリンクがありません。',
    KNOWLEDGE_EXPORT_ARTIFACT_CREATE_FAILED: '書き出しファイルを作成できませんでした。',
    KNOWLEDGE_EXPORT_FILE_ID_MISSING: '書き出したファイルが見つかりません。'
  };
  var safe = messages[code] || '資料を書き出せませんでした。';
  var sourceId = error && error.sourceId ? String(error.sourceId) : '';
  if (sourceId && /^(?:MTG|DOC|NEWS|ASMT)-[A-Za-z0-9_-]{1,80}$/.test(sourceId) &&
      /KNOWLEDGE_EXPORT_(?:MEETING|PITCHBOOK|SOURCE|UNSUPPORTED)/.test(code)) {
    safe += ' 対象ID: ' + sourceId + '。';
  }
  var extension = error && String(error.extension || '').toLowerCase();
  if (code === 'KNOWLEDGE_EXPORT_UNSUPPORTED_MATERIALIZATION' && /^(?:pdf|pptx|docx|xlsx|txt|eml)$/.test(extension)) {
    safe += ' 形式: .' + extension + '。';
  }
  return safe;
}

function kspKnowledgeExportSafeWarning_(code) {
  var messages = {
    ACTOR_RESOLUTION_FAILED: 'Actor情報を取得できないため、匿名扱いで記録します。',
    AUDIT_WRITE_FAILED: '監査メタデータを記録できませんでした。',
    KNOWLEDGE_EXPORT_TEMP_DOCUMENT_CLEANUP_FAILED: 'PDFは作成されましたが、一時Google Docを自動削除できませんでした。'
  };
  return messages[code] || '書き出し後の処理を完了できませんでした。';
}

function kspKnowledgeExportRowMatches_(row, input) {
  if (String(row.Status || '') !== KSP_STATUS.ACTIVE) return false;
  var date = kspKnowledgeExportDate_(row.Date);
  if (input.dateFrom && date < input.dateFrom) return false;
  if (input.dateTo && date > input.dateTo) return false;
  var counterpartyType = kspMeetingCounterpartyType_(row) || (row.Document_ID && row.GP_ID ? 'GP' : '');
  var counterpartyId = kspMeetingCounterpartyId_(row) || (row.Document_ID ? String(row.GP_ID || '') : '');
  var entityKey = kspCounterpartyEntityKey_(counterpartyId);
  if (input.counterpartyType && counterpartyType !== input.counterpartyType) return false;
  if (input.entityKey && entityKey !== input.entityKey) return false;
  if ((input.selectedEntityKeys || []).length >= KSP_KNOWLEDGE_MULTI_ENTITY_MIN &&
      input.selectedEntityKeys.indexOf(entityKey) === -1) return false;
  if (input.gpId && String(row.GP_ID || '') !== input.gpId) return false;
  if (input.assetClassId && String(row.Asset_Class_ID || '') !== input.assetClassId) return false;
  if (input.capitalTypeId && String(row.Capital_Type_ID || '') !== input.capitalTypeId) return false;
  if (input.teamId && String(row.Team_ID || '') !== input.teamId) return false;
  if (input.fundStrategy && String(row.Fund_Strategy || '').trim() !== input.fundStrategy) return false;
  if (input.followUp === KSP_KNOWLEDGE_FOLLOW_UP_FILTERS.REQUIRED &&
      !kspToBoolean_(row.Follow_Up_Required, false)) return false;
  if (input.followUp === KSP_KNOWLEDGE_FOLLOW_UP_FILTERS.NOT_REQUIRED &&
      kspToBoolean_(row.Follow_Up_Required, false)) return false;
  if (input.relatedGpId &&
      kspKnowledgeExactTokens_(kspMeetingRelatedGpIds_(row)).indexOf(input.relatedGpId) === -1) return false;
  if (input.meetingTypeCode &&
      kspKnowledgeExactTokens_(row.Meeting_Type_Codes).indexOf(input.meetingTypeCode) === -1) return false;
  return true;
}

function kspBuildKnowledgeExportSource_(sourceType, row) {
  var fields = {};
  fields[KSP_KNOWLEDGE_EXPORT_SOURCE_TYPES.MEETING] = ['Meeting_ID', 'Date', 'Doc_File_ID', 'Doc_URL'];
  fields[KSP_KNOWLEDGE_EXPORT_SOURCE_TYPES.PITCHBOOK] = ['Document_ID', 'Date', 'File_ID', 'File_URL'];
  fields[KSP_KNOWLEDGE_EXPORT_SOURCE_TYPES.NEWS] = ['News_ID', 'Published_Date', 'Source_File_ID', 'Source_URL'];
  fields[KSP_KNOWLEDGE_EXPORT_SOURCE_TYPES.ASSESSMENT] = ['Assessment_ID', 'Assessment_Date', 'Source_File_ID', 'Source_URL'];
  var sourceFields = fields[sourceType];
  kspAssert_(sourceFields, 'KNOWLEDGE_EXPORT_SOURCE_TYPE_INVALID', 'Source Typeが不正です。');
  var id = String(row[sourceFields[0]] || '');
  kspAssert_(id, 'KNOWLEDGE_EXPORT_SOURCE_ID_MISSING', 'Active source IDがありません。');
  var date = kspKnowledgeExportDate_(row[sourceFields[1]]);
  var counterpartyIds = sourceType === KSP_KNOWLEDGE_EXPORT_SOURCE_TYPES.NEWS ||
    sourceType === KSP_KNOWLEDGE_EXPORT_SOURCE_TYPES.ASSESSMENT
    ? kspSourceCanonicalIds_(row.Counterparty_IDs, 'CP', false)
    : [kspMeetingCounterpartyId_(row) || String(row.GP_ID || '')].filter(Boolean);
  var revisionFields = [
    'Version', 'Doc_File_ID', 'Doc_URL', 'File_ID', 'File_URL', 'Source_File_ID', 'Source_URL',
    'Input_Mode', 'Source_Mime_Type', 'Original_Filename', 'Saved_Filename', 'Title',
    'Publisher', 'URL', 'Assessment_Type', 'Decision_Or_Action', 'Counterparty_IDs',
    'Related_Meeting_IDs', 'Related_Document_IDs', 'Related_News_IDs', 'GP_ID',
    'Counterparty_Type', 'Counterparty_ID', 'Related_GP_IDs', 'Asset_Class_ID',
    'Capital_Type_ID', 'Team_ID', 'Fund_Strategy', 'Meeting_Type_Codes',
    'Related_Pitchbook_IDs', 'Location_ID', 'Counterparty', 'Internal_Participants',
    'Follow_Up_Note', 'Follow_Up_Required'
  ];
  var revisionToken = JSON.stringify([sourceType, id, date,
    kspKnowledgeExportUpdatedAt_(row.Updated_At), kspCanonicalBusinessTime_(row.Time)]
    .concat(revisionFields.map(function (field) { return String(row[field] || ''); })));
  return {
    sourceType: sourceType,
    sourceId: id,
    date: date,
    fileId: String(row[sourceFields[2]] || ''),
    sourceUrl: String(row[sourceFields[3]] || ''),
    entityKey: counterpartyIds.length === 1 ? kspCounterpartyEntityKey_(counterpartyIds[0]) : '',
    entityKeys: counterpartyIds.map(kspCounterpartyEntityKey_),
    counterpartyIds: counterpartyIds,
    revisionToken: revisionToken,
    row: kspDeepClone_(row)
  };
}

function kspResolveKnowledgeExportSources_(context, input) {
  var scope = context || {};
  var requested = input || {};
  kspAssert_(requested.advancedFilterResolved === true && Array.isArray(requested.resolvedSourceIds),
    'KNOWLEDGE_EXPORT_SCOPE_MISMATCH', '検索範囲が確定していません。');
  var wanted = {};
  requested.resolvedSourceIds.forEach(function (id) {
    kspAssert_(!wanted[id], 'KNOWLEDGE_EXPORT_SCOPE_MISMATCH', '検索対象IDが重複しています。');
    wanted[id] = true;
  });
  var sources = [];
  [
    [KSP_KNOWLEDGE_EXPORT_SOURCE_TYPES.MEETING, scope.meetingRows || [], 'Meeting_ID'],
    [KSP_KNOWLEDGE_EXPORT_SOURCE_TYPES.PITCHBOOK, scope.pitchbookRows || [], 'Document_ID'],
    [KSP_KNOWLEDGE_EXPORT_SOURCE_TYPES.NEWS, scope.newsRows || [], 'News_ID'],
    [KSP_KNOWLEDGE_EXPORT_SOURCE_TYPES.ASSESSMENT, scope.assessmentRows || [], 'Assessment_ID']
  ].forEach(function (definition) {
    definition[1].forEach(function (row) {
      var sourceId = String(row[definition[2]] || '');
      if (!wanted[sourceId]) return;
      kspAssert_(String(row.Status || '') === KSP_STATUS.ACTIVE &&
        requested.sourceTypes.indexOf(definition[0]) !== -1,
        'KNOWLEDGE_EXPORT_SCOPE_MISMATCH', '選択したActive原本と検索範囲が一致しません。');
      sources.push(kspBuildKnowledgeExportSource_(definition[0], row));
    });
  });
  kspAssert_(sources.length === requested.resolvedSourceIds.length,
    'KNOWLEDGE_EXPORT_SCOPE_MISMATCH', '検索対象IDと原本が一致しません。');

  var entityOrder = {};
  (requested.selectedEntityKeys || []).forEach(function (entityKey, index) { entityOrder[entityKey] = index; });
  return sources.sort(function (left, right) {
    if ((requested.selectedEntityKeys || []).length >= KSP_KNOWLEDGE_MULTI_ENTITY_MIN) {
      var leftEntityOrder = Object.prototype.hasOwnProperty.call(entityOrder, left.entityKey) ? entityOrder[left.entityKey] : 999;
      var rightEntityOrder = Object.prototype.hasOwnProperty.call(entityOrder, right.entityKey) ? entityOrder[right.entityKey] : 999;
      if (leftEntityOrder !== rightEntityOrder) return leftEntityOrder - rightEntityOrder;
    }
    var dateCompare = left.date.localeCompare(right.date);
    if (dateCompare !== 0) return dateCompare;
    var idCompare = left.sourceId.localeCompare(right.sourceId);
    if (idCompare !== 0) return idCompare;
    return left.sourceType.localeCompare(right.sourceType);
  });
}

function kspKnowledgeExportHash_(text) {
  if (typeof Utilities !== 'undefined' && Utilities.computeDigest && Utilities.DigestAlgorithm && Utilities.Charset) {
    var bytes = Utilities.computeDigest(
      Utilities.DigestAlgorithm.SHA_256,
      String(text || ''),
      Utilities.Charset.UTF_8
    );
    return bytes.map(function (byte) {
      var value = Number(byte) & 255;
      return ('0' + value.toString(16)).slice(-2);
    }).join('');
  }
  var hash = 2166136261;
  var second = 2654435761;
  var value = String(text || '');
  for (var index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
    second ^= value.charCodeAt(index);
    second = Math.imul(second, 2246822519);
  }
  return ('00000000' + (hash >>> 0).toString(16)).slice(-8) +
    ('00000000' + (second >>> 0).toString(16)).slice(-8);
}

function kspKnowledgeExportCatalogToken_(catalog) {
  var value = catalog || {};
  return kspKnowledgeExportHash_(JSON.stringify({
    gps: (value.gps || []).map(function (item) { return [item.id, item.name, item.status]; }),
    assetClasses: (value.assetClasses || []).map(function (item) { return [item.id, item.name, item.status]; }),
    capitalTypes: (value.capitalTypes || []).map(function (item) { return [item.id, item.name, item.status]; }),
    teams: (value.teams || []).map(function (item) { return [item.id, item.name, item.status]; }),
    counterpartyTypes: (value.counterpartyTypes || []).map(function (item) { return [item.code, item.label, item.optionType]; }),
    counterpartyEntities: (value.counterpartyEntities || []).map(function (item) { return [item.type, item.id, item.name, item.status]; }),
    fundStrategies: (value.fundStrategies || []).map(function (item) { return [item.id, item.name]; })
  }));
}

function kspBuildKnowledgeExportFingerprint_(sources, filters, catalog) {
  var normalizedFilters = filters || {};
  var tokens = (sources || []).map(function (source) {
    return source.revisionToken + '\u001d' + String(source.contentToken || '');
  });
  return 'ksp3-' + kspKnowledgeExportHash_(JSON.stringify({
    route: KSP_AI_ROUTES.FULL_EXPORT,
    mode: normalizedFilters.mode || KSP_KNOWLEDGE_SEARCH_MODES.FREE_QUESTION,
    instructionHash: kspKnowledgeExportHash_(normalizedFilters.questionOrInstruction || ''),
    sourceTypes: normalizedFilters.sourceTypes || [],
    resolvedSourceIds: normalizedFilters.resolvedSourceIds || [],
    filters: kspKnowledgeExportPublicFilters_(normalizedFilters),
    catalog: kspKnowledgeExportCatalogToken_(catalog),
    sources: tokens
  })) + '-' + tokens.length;
}

function kspBuildKnowledgeExportLimitState_(meetingCount, meetingCharacterCount, pitchbookCount, totalCharacterCount) {
  var warningReasons = [];
  var hardStopReasons = [];
  if (meetingCount > KSP_KNOWLEDGE_EXPORT_LIMITS.WARNING_MEETINGS) {
    warningReasons.push('Meetingが' + meetingCount + '件あります（警告基準: 30件超）。');
  }
  if (meetingCharacterCount > KSP_KNOWLEDGE_EXPORT_LIMITS.WARNING_MEETING_CHARACTERS) {
    warningReasons.push('Meeting原文が' + meetingCharacterCount + '文字あります（警告基準: 150,000文字超）。');
  }
  if (Number(totalCharacterCount || 0) > meetingCharacterCount &&
      totalCharacterCount > KSP_KNOWLEDGE_EXPORT_LIMITS.WARNING_MEETING_CHARACTERS) {
    warningReasons.push('選択資料の本文が' + totalCharacterCount + '文字あります（警告基準: 150,000文字超）。');
  }
  if (meetingCount > KSP_KNOWLEDGE_EXPORT_LIMITS.HARD_STOP_MEETINGS) {
    hardStopReasons.push('Meetingが' + meetingCount + '件で上限50件を超えています。');
  }
  if (meetingCharacterCount > KSP_KNOWLEDGE_EXPORT_LIMITS.HARD_STOP_MEETING_CHARACTERS) {
    hardStopReasons.push('Meeting原文が' + meetingCharacterCount + '文字で上限250,000文字を超えています。');
  }
  if (Number(totalCharacterCount || 0) > meetingCharacterCount &&
      totalCharacterCount > KSP_KNOWLEDGE_EXPORT_LIMITS.HARD_STOP_MEETING_CHARACTERS) {
    hardStopReasons.push('選択資料の本文が' + totalCharacterCount + '文字で上限250,000文字を超えています。');
  }
  if (pitchbookCount > KSP_KNOWLEDGE_EXPORT_LIMITS.HARD_STOP_PITCHBOOKS) {
    hardStopReasons.push('Pitchbookが' + pitchbookCount + '件で上限200件を超えています。');
  }
  return {
    warning: warningReasons.length > 0,
    warningReasons: warningReasons,
    hardStop: hardStopReasons.length > 0,
    hardStopReasons: hardStopReasons
  };
}

function kspBuildKnowledgeExportSourceIdRepresentation_(sourceIds) {
  var ids = (sourceIds || []).map(String);
  var maximum = KSP_KNOWLEDGE_EXPORT_LIMITS.MAX_SOURCE_ID_REPORT;
  if (ids.length <= maximum) return ids.join(',');
  return ids.slice(0, maximum).join(',') + ',...(total=' + ids.length + ')';
}

function kspKnowledgeExportExtension_(filename) {
  var match = /\.([A-Za-z0-9]+)$/.exec(String(filename || ''));
  return match ? '.' + match[1].toLowerCase() : '';
}

function kspBuildKnowledgeExportFilename_(input, nowIso, outputType) {
  var parts = ['Knowledge_Export'];
  var filters = kspKnowledgeExportPublicFilters_(input);
  [filters.counterpartyType, filters.entityKey, filters.gpId, filters.assetClassId,
    filters.capitalTypeId, filters.teamId, filters.fundStrategy, filters.followUp,
    (input.sourceTypes || []).join('+'),
    filters.dateFrom, filters.dateTo].forEach(function (value) {
    var segment = kspNormalizeGeneratedNameSegment_(value);
    if (segment) parts.push(segment);
  });
  var timestamp = kspCanonicalInstantIso_(nowIso).replace(/[^0-9]/g, '').slice(0, 14);
  if (timestamp) parts.push(timestamp);
  var name = parts.join('_').slice(0, 140);
  return outputType === KSP_KNOWLEDGE_EXPORT_OUTPUT_TYPES.PDF ? name + '.pdf' : name;
}

function kspBuildKnowledgeExportPackageTitle_(input) {
  var value = input || {};
  var parts = ['ナレッジ全文出力'];
  var filters = kspKnowledgeExportPublicFilters_(value);
  [filters.counterpartyType, filters.entityKey, (input.selectedEntityKeys || []).join('+'), filters.gpId, filters.assetClassId,
    filters.capitalTypeId, filters.teamId, filters.fundStrategy, filters.followUp,
    (input.sourceTypes || []).join('+'),
    filters.dateFrom, filters.dateTo].forEach(function (filterValue) {
    var segment = kspNormalizeGeneratedNameSegment_(filterValue);
    if (segment) parts.push(segment);
  });
  return parts.join(' / ').slice(0, 180);
}

function kspBuildKnowledgeExportRenderModel_(input, materialsOrMeetings, mapsOrPitchbooks, titleOrMaps, legacyTitle) {
  var materials = Array.isArray(materialsOrMeetings)
    ? { sources: (materialsOrMeetings || []).concat(mapsOrPitchbooks || []) }
    : (materialsOrMeetings || { sources: [] });
  var safeMaps = Array.isArray(materialsOrMeetings) ? titleOrMaps : mapsOrPitchbooks;
  var title = Array.isArray(materialsOrMeetings) ? legacyTitle : titleOrMaps;
  safeMaps = safeMaps || { gp: {}, assetClass: {}, capitalType: {}, location: {}, team: {}, counterparty: {} };
  var sourceSections = (materials.sources || []).map(function (item) {
    var source = item.source;
    var row = source.row || {};
    var label = kspAiSourceLabel_(source.sourceType);
    var counterpartyNames = (source.counterpartyIds || []).map(function (id) {
      return (safeMaps.counterparty || {})[id] || id;
    });
    var lines = [
      '出典種別: ' + label,
      '原本ID: ' + source.sourceId,
      '日付: ' + source.date,
      '面談先: ' + (counterpartyNames.join(' / ') || '登録情報なし'),
      'アセットクラス: ' + ((safeMaps.assetClass || {})[String(row.Asset_Class_ID || '')] || String(row.Asset_Class_ID || ''))
    ];
    if (row.Title) lines.push('タイトル: ' + String(row.Title));
    if (row.Fund_Strategy) lines.push('Fund / Strategy: ' + String(row.Fund_Strategy));
    if (source.sourceType === KSP_KNOWLEDGE_EXPORT_SOURCE_TYPES.MEETING) {
      var counterpartyType = String((safeMaps.counterpartyType || {})[source.counterpartyIds[0]] ||
        kspMeetingCounterpartyType_(row));
      var definition = kspCounterpartyTypeDefinition_(counterpartyType);
      if (counterpartyType) lines.push('面談先区分: ' + (definition ? definition.label : counterpartyType));
      if (row.Time) lines.push('時間: ' + kspCanonicalBusinessTime_(row.Time));
      if (row.Capital_Type_ID) lines.push('Equity / Debt: ' + ((safeMaps.capitalType || {})[String(row.Capital_Type_ID)] || String(row.Capital_Type_ID)));
      if (row.Location_ID) lines.push('面談場所: ' + ((safeMaps.location || {})[String(row.Location_ID)] || String(row.Location_ID)));
      if (row.Counterparty) lines.push('面談相手: ' + String(row.Counterparty));
      if (row.Internal_Participants) lines.push('当社側: ' + String(row.Internal_Participants));
      if (row.Team_ID) lines.push('チーム: ' + ((safeMaps.team || {})[String(row.Team_ID)] || String(row.Team_ID)));
      var meetingTypes = kspMeetingTypeLabels_(row.Meeting_Type_Codes);
      if (meetingTypes.length) lines.push('MTG種別: ' + meetingTypes.join(', '));
      if (row.Related_Pitchbook_IDs) lines.push('関連Document ID: ' + String(row.Related_Pitchbook_IDs));
    } else if (source.sourceType === KSP_KNOWLEDGE_EXPORT_SOURCE_TYPES.PITCHBOOK) {
      if (row.Original_Filename) lines.push('原ファイル名: ' + String(row.Original_Filename));
    } else if (source.sourceType === KSP_KNOWLEDGE_EXPORT_SOURCE_TYPES.NEWS) {
      if (row.Publisher) lines.push('発行元: ' + String(row.Publisher));
      if (row.URL) lines.push('公開元URL: ' + String(row.URL));
    } else if (source.sourceType === KSP_KNOWLEDGE_EXPORT_SOURCE_TYPES.ASSESSMENT) {
      var type = (KSP_ASSESSMENT_TYPES || []).filter(function (entry) {
        return entry.code === String(row.Assessment_Type || '');
      })[0];
      lines.push('来歴: 当時の社内評価（外部事実ではありません）');
      if (row.Assessment_Type) lines.push('評価種別: ' + (type ? type.label : String(row.Assessment_Type)));
      if (row.Decision_Or_Action) lines.push('判断・対応: ' + String(row.Decision_Or_Action));
      if (row.Related_Meeting_IDs) lines.push('関連Meeting ID: ' + String(row.Related_Meeting_IDs));
      if (row.Related_Document_IDs) lines.push('関連Document ID: ' + String(row.Related_Document_IDs));
      if (row.Related_News_IDs) lines.push('関連News ID: ' + String(row.Related_News_IDs));
    }
    lines.push('原本URL: ' + String(source.canonicalUrl || source.sourceUrl || ''));
    return {
      sourceType: source.sourceType,
      sourceId: source.sourceId,
      entityKey: source.entityKey,
      entityLabel: counterpartyNames.length === 1 ? counterpartyNames[0] : '',
      heading: label + ' ' + source.sourceId + ' / ' + source.date,
      metadataLines: lines,
      body: String(item.body || '')
    };
  });
  return {
    title: title || kspBuildKnowledgeExportPackageTitle_(input),
    headerLines: ['選択資料の全文出力', '対象範囲: ' + kspKnowledgeScopeSummary_(input)],
    sourceSections: sourceSections,
    meetingSections: sourceSections.filter(function (section) {
      return section.sourceType === KSP_KNOWLEDGE_EXPORT_SOURCE_TYPES.MEETING;
    }),
    pitchbookLines: [],
    pitchbookReferencesOnly: false
  };
}

function kspBuildKnowledgeExportPlainText_(model) {
  var lines = [String(model.title || 'ナレッジ全文出力')].concat(model.headerLines || [], ['']);
  var currentEntityKey = '';
  (model.sourceSections || model.meetingSections || []).forEach(function (section, index) {
    if (section.entityKey && section.entityKey !== currentEntityKey) {
      if (index > 0) lines.push('\f');
      lines.push('面談先: ' + (section.entityLabel || '登録情報なし'), '');
      currentEntityKey = section.entityKey;
    } else if (index > 0) lines.push('\f');
    lines.push(section.heading);
    lines = lines.concat(section.metadataLines || []);
    lines.push('', section.body || '');
  });
  return lines.join('\n');
}

function kspKnowledgeExportPromptLabel_(items, id) {
  var value = String(id || '');
  if (!value) return '未選択';
  var found = (items || []).filter(function (item) { return String(item.id) === value; })[0];
  return found ? String(found.name) : '登録情報なし';
}

function kspBuildKnowledgeExportPrompt_(input, catalog) {
  var definition = kspGetKnowledgeExportModeDefinition_(input.mode);
  var filters = kspKnowledgeExportPublicFilters_(input);
  var safeCatalog = catalog || {};
  var sourceLabels = (input.sourceTypes || []).map(kspAiSourceLabel_).join('、');
  var lines = [
    '添付した選択資料の全文だけを根拠に、日本語で回答してください。',
    '資料にない事実は推測・創作せず、確認できない点と証拠不足を明示してください。',
    '重要な事実や比較には、資料タイトル、出典種別、安定IDを付けてください。',
    '評価（ICメモ、社内整理等）は当時の社内評価として扱い、外部事実と混同しないでください。',
    '',
    'モード: ' + definition.mode,
    '開始日: ' + (filters.dateFrom || '未選択'),
    '終了日: ' + (filters.dateTo || '未選択'),
    '面談先区分: ' + (filters.counterpartyType || '未選択'),
    '面談先: ' + kspKnowledgeExportPromptLabel_(safeCatalog.counterpartyEntities, filters.entityKey),
    '比較対象の面談先: ' + ((input.selectedEntityKeys || []).length
      ? input.selectedEntityKeys.map(function (entityKey) {
        return kspKnowledgeExportPromptLabel_(safeCatalog.counterpartyEntities, entityKey);
      }).join(', ') : '未選択'),
    'アセットクラス: ' + kspKnowledgeExportPromptLabel_(safeCatalog.assetClasses, filters.assetClassId),
    'Equity / Debt: ' + kspKnowledgeExportPromptLabel_(safeCatalog.capitalTypes, filters.capitalTypeId),
    'チーム: ' + kspKnowledgeExportPromptLabel_(safeCatalog.teams, filters.teamId),
    'Fund / Strategy: ' + (filters.fundStrategy || '未選択'),
    'MTG種別: ' + (filters.meetingTypeCode || '未選択'),
    '対象資料: ' + sourceLabels,
    '',
    definition.instruction,
    '各sectionには原本の本文、安定ID、原本URL、来歴を含みます。'
  ];
  if (input.questionOrInstruction) lines.push('', '質問または追加指示:', input.questionOrInstruction);
  return lines.join('\n');
}

function kspKnowledgeExportActionForOutput_(outputType) {
  return outputType === KSP_KNOWLEDGE_EXPORT_OUTPUT_TYPES.PDF
    ? KSP_KNOWLEDGE_EXPORT_ACTIONS.PDF : KSP_KNOWLEDGE_EXPORT_ACTIONS.GOOGLE_DOCS;
}

function kspBuildKnowledgeExportAuditRow_(params) {
  var options = params || {};
  var input = options.input || {};
  var counts = options.counts || {};
  var metadata = kspDeepClone_(options.metadata || {});
  metadata.meetingCount = Number(counts.meetingCount || 0);
  metadata.meetingCharacterCount = Number(counts.meetingCharacterCount || 0);
  metadata.pitchbookCount = Number(counts.pitchbookCount || 0);
  metadata.newsCount = Number(counts.newsCount || 0);
  metadata.assessmentCount = Number(counts.assessmentCount || 0);
  metadata.totalCharacterCount = Number(counts.totalCharacterCount || 0);
  metadata.sourceTypes = Array.isArray(input.sourceTypes) ? input.sourceTypes.slice() : [];
  metadata.route = KSP_AI_ROUTES.FULL_EXPORT;
  metadata.mode = input.mode || KSP_KNOWLEDGE_SEARCH_MODES.FREE_QUESTION;
  metadata.structuredFilters = kspKnowledgeFilterAuditMetadata_(input);
  return {
    Event_Timestamp: kspCanonicalInstantIso_(options.timestamp),
    Actor: options.actor || 'UNIDENTIFIED',
    Action: options.action || KSP_KNOWLEDGE_EXPORT_ACTIONS.PREVIEW,
    Target_Type: 'KnowledgeExport',
    Target_ID: options.targetId || '',
    Result: options.result || KSP_AUDIT_RESULTS.FAILURE,
    Changed_Fields: '',
    Before_Metadata_JSON: '',
    After_Metadata_JSON: JSON.stringify(metadata),
    Batch_ID: '',
    Error_Code: options.errorCode || '',
    Error_Message: options.errorCode ? kspKnowledgeExportSafeMessage_(options.errorCode, options.error) : '',
    Search_Mode: input.mode || '',
    Question_Or_Instruction: '',
    Date_From: input.dateFrom || '',
    Date_To: input.dateTo || '',
    GP_Filter: input.gpId || '',
    Asset_Class_Filter: input.assetClassId || '',
    Capital_Type_Filter: input.capitalTypeId || '',
    Source_Type_Filter: JSON.stringify(input.sourceTypes || []),
    Model_ID: '',
    Cited_Source_IDs: options.sourceIds || ''
  };
}
// ===== END src/155_KnowledgeExportContracts.gs =====

// ===== BEGIN src/156_KnowledgeExportService.gs =====
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
// ===== END src/156_KnowledgeExportService.gs =====

// ===== BEGIN src/157_KnowledgeExportLiveEnvironment.gs =====
function kspCreateKnowledgeExportEnvironment_() {
  var environment = kspCreateMaintenanceEnvironment_();

  environment.loadKnowledgeExportContext = function () {
    var context = kspLoadMaintenanceContext_(environment);
    context.newsRows = environment.readRows(context.backendSpreadsheetId, KSP_SHEET_NAMES.NEWS_INDEX);
    context.assessmentRows = environment.readRows(context.backendSpreadsheetId, KSP_SHEET_NAMES.INTERNAL_ASSESSMENT_INDEX);
    var state = environment.getInstallationState();
    var folderId = state && state.resources ? state.resources[KSP_RESOURCE_KEYS.KNOWLEDGE_EXPORTS] : '';
    kspAssert_(folderId, 'KNOWLEDGE_EXPORTS_FOLDER_MISSING', 'Knowledge Exports folderが設定されていません。');
    kspValidateKnowledgeExportFolder_(folderId, state && state.config ? state.config.knowledgeParentFolderId : '');
    context.knowledgeExportsFolderId = folderId;
    return context;
  };

  environment.getSourceFileBytes = function (fileId) {
    kspAssert_(fileId, 'KNOWLEDGE_EXPORT_SOURCE_INTEGRITY_FAILED', '原本ファイルIDがありません。');
    var file = Drive.Files.get(fileId, {
      supportsAllDrives: true, fields: 'id,mimeType,size,trashed'
    });
    kspAssert_(file && String(file.id || '') === String(fileId) && !file.trashed &&
      Number(file.size || 0) <= KSP_FEATURE_FREEZE_DEFAULTS.MAX_SOURCE_BYTES,
    'KNOWLEDGE_EXPORT_SOURCE_INTEGRITY_FAILED', 'Drive原本を確認できません。');
    var response = UrlFetchApp.fetch('https://www.googleapis.com/drive/v3/files/' +
      encodeURIComponent(fileId) + '?alt=media&supportsAllDrives=true', {
        method: 'get', headers: { Authorization: 'Bearer ' + ScriptApp.getOAuthToken() },
        muteHttpExceptions: true
      });
    kspAssert_(response.getResponseCode() >= 200 && response.getResponseCode() < 300,
      'KNOWLEDGE_EXPORT_SOURCE_READ_FAILED', 'Drive原本を読み込めませんでした。');
    var bytes = kspNormalizeAiByteArray_(response.getBlob().getBytes());
    kspAssert_(bytes.length > 0 && bytes.length <= KSP_FEATURE_FREEZE_DEFAULTS.MAX_SOURCE_BYTES,
      'KNOWLEDGE_EXPORT_SOURCE_READ_FAILED', 'Drive原本のサイズが不正です。');
    return { fileId: String(file.id), mimeType: String(file.mimeType || ''), bytes: bytes };
  };

  environment.decodeSourceText = function (bytes, charset) {
    return Utilities.newBlob(kspNormalizeAiByteArray_(bytes)).getDataAsString(charset || 'UTF-8');
  };

  environment.normalizeXlsxText = function (bytes) {
    return kspNormalizeXlsxText_(bytes);
  };

  environment.createKnowledgeExportArtifact = function (options) {
    var input = options || {};
    kspAssert_(input.folderId, 'KNOWLEDGE_EXPORTS_FOLDER_MISSING', 'Knowledge Exports folderが設定されていません。');
    var state = environment.getInstallationState();
    kspValidateKnowledgeExportFolder_(
      input.folderId,
      state && state.config ? state.config.knowledgeParentFolderId : ''
    );
    var temporaryDocumentId = '';
    var pdfFileId = '';
    try {
      var temporaryName = input.outputType === KSP_KNOWLEDGE_EXPORT_OUTPUT_TYPES.PDF
        ? String(input.filename) + ' (temporary)' : String(input.filename);
      var documentFile = Drive.Files.create({
        name: temporaryName,
        mimeType: 'application/vnd.google-apps.document',
        parents: [input.folderId]
      }, null, {
        supportsAllDrives: true,
        fields: 'id,name,mimeType,webViewLink,parents,trashed'
      });
      temporaryDocumentId = documentFile.id;
      kspAssertKnowledgeExportCreatedFile_(
        documentFile, input.folderId, 'application/vnd.google-apps.document',
        'KNOWLEDGE_EXPORT_DOCUMENT_CREATE_FAILED'
      );
      kspWriteKnowledgeExportDocument_(temporaryDocumentId, input.model);

      if (input.outputType === KSP_KNOWLEDGE_EXPORT_OUTPUT_TYPES.GOOGLE_DOCS) {
        kspAssert_(documentFile.id,
          'KNOWLEDGE_EXPORT_DOCUMENT_URL_MISSING', '生成されたGoogle Docのリンクを確認できません。');
        return {
          id: documentFile.id,
          name: documentFile.name || input.filename,
          url: 'https://docs.google.com/document/d/' + documentFile.id + '/edit',
          warnings: []
        };
      }

      var pdfBlob = kspExportKnowledgeDocumentPdf_(temporaryDocumentId);
      var pdfFile = Drive.Files.create({
        name: String(input.filename),
        mimeType: 'application/pdf',
        parents: [input.folderId]
      }, pdfBlob, {
        supportsAllDrives: true,
        fields: 'id,name,mimeType,webViewLink,parents,trashed,size'
      });
      pdfFileId = pdfFile.id;
      kspAssertKnowledgeExportCreatedFile_(
        pdfFile, input.folderId, 'application/pdf', 'KNOWLEDGE_EXPORT_PDF_CREATE_FAILED'
      );
      kspAssert_(pdfFile.id, 'KNOWLEDGE_EXPORT_PDF_URL_MISSING', '生成されたPDFのリンクを確認できません。');

      var warnings = [];
      try {
        kspTrashKnowledgeExportFile_(temporaryDocumentId);
      } catch (cleanupError) {
        warnings.push({
          code: 'KNOWLEDGE_EXPORT_TEMP_DOCUMENT_CLEANUP_FAILED',
          message: 'PDFは作成されましたが、一時Google Docを自動削除できませんでした。'
        });
      }
      temporaryDocumentId = '';
      return {
        id: pdfFile.id,
        name: pdfFile.name || input.filename,
        url: 'https://drive.google.com/open?id=' + pdfFile.id,
        warnings: warnings
      };
    } catch (error) {
      if (pdfFileId) {
        try { kspTrashKnowledgeExportFile_(pdfFileId); } catch (ignoredPdfCleanup) { /* Preserve original error. */ }
      }
      if (temporaryDocumentId) {
        try { kspTrashKnowledgeExportFile_(temporaryDocumentId); } catch (ignoredDocumentCleanup) { /* Preserve original error. */ }
      }
      error.code = error.code || 'KNOWLEDGE_EXPORT_ARTIFACT_CREATE_FAILED';
      throw error;
    }
  };

  return environment;
}

function kspExportKnowledgeDocumentPdf_(documentId) {
  kspAssert_(documentId, 'KNOWLEDGE_EXPORT_DOCUMENT_ID_MISSING',
    'PDF変換対象のGoogle Docを確認できません。');
  var url = 'https://www.googleapis.com/drive/v3/files/' + encodeURIComponent(documentId) +
    '/export?mimeType=' + encodeURIComponent('application/pdf');
  var response = UrlFetchApp.fetch(url, {
    method: 'get',
    headers: {
      Authorization: 'Bearer ' + ScriptApp.getOAuthToken()
    },
    muteHttpExceptions: true
  });
  var responseCode = response.getResponseCode();
  kspAssert_(responseCode >= 200 && responseCode < 300,
    'KNOWLEDGE_EXPORT_PDF_EXPORT_FAILED', 'Google DocをPDFへ変換できませんでした。');
  var blob = response.getBlob();
  kspAssert_(blob && blob.getBytes && blob.getBytes().length > 0,
    'KNOWLEDGE_EXPORT_PDF_EMPTY', 'PDFの内容が空です。');
  return blob;
}

function kspValidateKnowledgeExportFolder_(folderId, expectedParentId) {
  kspAssert_(folderId && expectedParentId, 'KNOWLEDGE_EXPORTS_FOLDER_INVALID',
    'Knowledge Exportsフォルダの親境界を確認できません。');
  var folder = Drive.Files.get(folderId, {
    supportsAllDrives: true,
    fields: 'id,mimeType,parents,trashed'
  });
  kspAssert_(folder && !folder.trashed && folder.mimeType === KSP_MIME_TYPES.FOLDER &&
    (folder.parents || []).indexOf(expectedParentId) !== -1,
    'KNOWLEDGE_EXPORTS_FOLDER_INVALID',
    'Knowledge Exportsフォルダが設定された親フォルダ直下にありません。');
  return folder;
}

function kspAssertKnowledgeExportCreatedFile_(file, folderId, expectedMimeType, errorCode) {
  kspAssert_(file && file.id && file.mimeType === expectedMimeType && !file.trashed &&
    (file.parents || []).indexOf(folderId) !== -1,
    errorCode || 'KNOWLEDGE_EXPORT_ARTIFACT_CREATE_FAILED',
    '生成された書き出しファイルの境界を確認できません。');
}

function kspWriteKnowledgeExportDocument_(documentId, model) {
  var document = DocumentApp.openById(documentId);
  var body = document.getBody();
  body.clear();
  kspAppendKnowledgeExportParagraph_(body, String(model.title || 'Knowledge Export'))
    .setHeading(DocumentApp.ParagraphHeading.TITLE);
  (model.headerLines || []).forEach(function (line) {
    kspAppendKnowledgeExportParagraph_(body, String(line));
  });

  var sections = model.sourceSections || model.meetingSections || [];
  sections.forEach(function (section, index) {
    if (index > 0) body.appendPageBreak();
    kspAppendKnowledgeExportParagraph_(body, String(section.heading || 'Source'))
      .setHeading(DocumentApp.ParagraphHeading.HEADING1);
    (section.metadataLines || []).forEach(function (line) {
      kspAppendKnowledgeExportParagraph_(body, String(line));
    });
    kspAppendKnowledgeExportParagraph_(body, String(section.body || ''));
  });

  document.saveAndClose();
}

function kspAppendKnowledgeExportParagraph_(body, value) {
  var text = String(value || '');
  var paragraph = body.appendParagraph(text);
  var editable = paragraph.editAsText();
  var linkPattern = /https?:\/\/[^\s)]+/g;
  var match;
  while ((match = linkPattern.exec(text)) !== null) {
    var link = match[0];
    var end = link.length - 1;
    while (end >= 0 && /[.,;:!?]$/.test(link.substring(0, end + 1))) end -= 1;
    if (end >= 0) editable.setLinkUrl(match.index, match.index + end, link.substring(0, end + 1));
  }
  return paragraph;
}

function kspTrashKnowledgeExportFile_(fileId) {
  kspAssert_(fileId, 'KNOWLEDGE_EXPORT_FILE_ID_MISSING', '書き出しファイルIDがありません。');
  Drive.Files.update({ trashed: true }, fileId, null, {
    supportsAllDrives: true,
    fields: 'id,trashed'
  });
}
// ===== END src/157_KnowledgeExportLiveEnvironment.gs =====

// ===== BEGIN src/160_AiEnvironment.gs =====
function kspCreateAiEnvironment_() {
  var base = kspCreateMaintenanceEnvironment_();
  var scriptProperties = PropertiesService.getScriptProperties();

  base.getSessionIdentities = function () {
    var active = '';
    var effective = '';
    try { active = Session.getActiveUser().getEmail() || ''; } catch (ignoredActive) {}
    try { effective = Session.getEffectiveUser().getEmail() || ''; } catch (ignoredEffective) {}
    return { active: String(active), effective: String(effective) };
  };

  base.getAiCredentialGeneration = function (provider) {
    var snapshot = kspAiActiveCredentialSnapshotLive_(provider);
    return snapshot ? snapshot.generation : 'legacy';
  };

  base.listAiProviderModels = function (provider, candidateKey) {
    var models = [];
    if (provider === KSP_AI_PROVIDERS.OPENAI) {
      var openAi = kspOpenAiJsonRequestLive_('GET', '/models', null, candidateKey || '');
      (Array.isArray(openAi && openAi.data) ? openAi.data : []).forEach(function (item) {
        models.push({ modelId: item.id, displayName: item.id });
      });
      return { models: models, partial: models.length > 100 };
    }
    var token = '';
    for (var page = 0; page < 2; page += 1) {
      var path = '/models?pageSize=50' + (token ? '&pageToken=' + encodeURIComponent(token) : '');
      var response = kspGeminiJsonRequestLive_('GET', path, null, {
        apiKeyOverride: candidateKey || '', retryPolicy: KSP_GEMINI_RETRY_POLICIES.IDEMPOTENT,
        stage: 'MODELS_LIST', errorCode: 'AI_GEMINI_MODELS_LIST_FAILED'
      });
      (Array.isArray(response && response.models) ? response.models : []).forEach(function (item) {
        models.push({ modelId: item.name, displayName: item.displayName || item.name });
      });
      token = String(response && response.nextPageToken || '');
      if (!token) break;
    }
    return { models: models, partial: Boolean(token) };
  };

  base.verifyAiProviderStoreCredential = function (provider, storeName, candidateKey) {
    try {
      if (provider === KSP_AI_PROVIDERS.OPENAI) {
        var store = kspOpenAiJsonRequestLive_('GET',
          KSP_OPENAI_API.VECTOR_STORES_PATH + '/' + encodeURIComponent(storeName), null, candidateKey);
        return Boolean(store && store.id === storeName);
      }
      var gemini = kspGeminiJsonRequestLive_('GET', '/' + kspAiStoreResourcePath_(storeName), null, {
        apiKeyOverride: candidateKey, retryPolicy: KSP_GEMINI_RETRY_POLICIES.IDEMPOTENT,
        stage: 'STORE_READ', errorCode: 'AI_STORE_READ_FAILED'
      });
      return Boolean(gemini && gemini.name === kspAiStoreResourcePath_(storeName));
    } catch (ignored) { return false; }
  };

  base.getAiModelCandidateCache = function (provider, generation) {
    var state = base.getInstallationState();
    var backend = state && state.resources && state.resources[KSP_RESOURCE_KEYS.BACKEND_SPREADSHEET];
    var cacheKey = 'KSP_AI_MODELS_' + kspAiSetupDigest_(provider + '|' + generation + '|' + backend).slice(0, 40);
    var raw = CacheService.getScriptCache().get(cacheKey);
    if (!raw) return null;
    try { return JSON.parse(raw); } catch (ignored) { return null; }
  };

  base.putAiModelCandidateCache = function (provider, generation, result, seconds) {
    var state = base.getInstallationState();
    var backend = state && state.resources && state.resources[KSP_RESOURCE_KEYS.BACKEND_SPREADSHEET];
    var cacheKey = 'KSP_AI_MODELS_' + kspAiSetupDigest_(provider + '|' + generation + '|' + backend).slice(0, 40);
    CacheService.getScriptCache().put(cacheKey, JSON.stringify(result), seconds);
  };

  base.getAiSetupOperation = function (operationId, credentialMode, provider) {
    var context = base.loadAiSettingsSnapshot();
    var settings = kspNormalizeAiSettings_(context.settings);
    if (!settings.modelPolicyJson) return null;
    var policy = kspNormalizeAiModelPolicy_(settings.modelPolicyJson);
    if (policy.lastOperationId !== operationId) return null;
    if (credentialMode) {
      var snapshot = kspAiActiveCredentialSnapshotLive_(provider);
      if (!snapshot || snapshot.lastOperationId !== operationId) return null;
    }
    var selected = policy.profiles.filter(function (item) {
      return item.provider === provider && item.profileId === policy.lastOperationProfileId;
    })[0];
    var scalarModel = provider === KSP_AI_PROVIDERS.OPENAI
      ? settings.openaiModelId : settings.geminiModelId;
    if (!selected || (selected.isProviderDefault && selected.modelId !== scalarModel) ||
        selected.qualifiedCredentialGeneration !== base.getAiCredentialGeneration(provider)) return null;
    return selected ? { ok: true, workId: '0073', provider: provider,
      modelId: selected.modelId, status: 'SAVED' } : null;
  };

  base.loadAiSettingsSnapshot = function () {
    var state = base.getInstallationState();
    var backendSpreadsheetId = state && state.resources &&
      state.resources[KSP_RESOURCE_KEYS.BACKEND_SPREADSHEET];
    kspAssert_(backendSpreadsheetId, 'BACKEND_SPREADSHEET_MISSING', 'Backend Spreadsheetがありません。');
    return { backendSpreadsheetId: backendSpreadsheetId,
      settings: kspReadSettingsMapLive_(backendSpreadsheetId) };
  };

  base.commitAiModelSetup = function (request) {
    var lock = base.acquireScriptLock(KSP_DEFAULTS.LOCK_TIMEOUT_MS);
    try {
      var context = base.loadAiSettingsSnapshot();
      var currentPolicy = context.settings[KSP_AI_SETTINGS.MODEL_POLICY_JSON] || '';
      if (currentPolicy !== request.expectedPolicyJson ||
          base.getAiCredentialGeneration(request.provider) !== request.expectedCredentialGeneration) {
        throw kspAiSetupError_('AI_SETUP_STALE');
      }
      var policyKey = KSP_AI_SETTINGS.MODEL_POLICY_JSON;
      var modelKey = request.provider === KSP_AI_PROVIDERS.OPENAI
        ? KSP_AI_SETTINGS.OPENAI_MODEL_ID : KSP_AI_SETTINGS.GEMINI_MODEL_ID;
      var priorModel = context.settings[modelKey] || '';
      var backend = context.backendSpreadsheetId;
      try {
        kspWriteSettingLive_(backend, policyKey, JSON.stringify(request.policy), base.nowIso());
        if (request.makeDefault !== false) kspWriteSettingLive_(backend, modelKey, request.modelId, base.nowIso());
        if (request.candidateKey) {
          var snapshotKey = request.provider === KSP_AI_PROVIDERS.OPENAI
            ? KSP_AI_PROPERTY_KEYS.OPENAI_ACTIVE_SNAPSHOT : KSP_AI_PROPERTY_KEYS.GEMINI_ACTIVE_SNAPSHOT;
          scriptProperties.setProperty(snapshotKey, JSON.stringify({ version: 1,
            key: request.candidateKey, generation: request.nextCredentialGeneration,
            lastOperationId: request.operationId }));
        }
      } catch (writeError) {
        try {
          kspWriteSettingLive_(backend, modelKey, priorModel, base.nowIso());
          kspWriteSettingLive_(backend, policyKey, currentPolicy, base.nowIso());
        } catch (ignoredRollback) { /* New tuple stays fail-closed until its generation is committed. */ }
        throw kspAiSetupError_('AI_SETUP_WRITE_FAILED');
      }
    } finally { base.releaseScriptLock(lock); }
  };

  base.createAiQualificationStore = function (provider, key) {
    if (provider === KSP_AI_PROVIDERS.OPENAI) {
      var openAi = kspOpenAiCreateVectorStoreLive_('KSP-0073-synthetic-qualification', key);
      return { name: String(openAi.id) };
    }
    var gemini = kspGeminiJsonRequestLive_('POST', KSP_AI_API.STORES_PATH,
      kspBuildFileSearchStoreCreateRequest_('KSP-0073-synthetic-qualification', ''), {
        apiKeyOverride: key, retryPolicy: KSP_GEMINI_RETRY_POLICIES.MUTATING_CREATE,
        stage: 'STORE_CREATE', errorCode: 'AI_STORE_CREATE_FAILED'
      });
    return { name: String(gemini && gemini.name || '') };
  };

  base.uploadAiQualificationSource = function (provider, storeName, source, key) {
    return provider === KSP_AI_PROVIDERS.OPENAI
      ? kspOpenAiUploadSourceLive_(storeName, source, key)
      : kspUploadSourceLive_(storeName, source, key);
  };

  base.readAiQualificationSource = function (provider, storeName, documentValue, source, key) {
    if (provider === KSP_AI_PROVIDERS.OPENAI) {
      var fileId = String(documentValue.fileId || documentValue.providerDocumentId || '');
      return kspOpenAiProviderDocumentFromVectorStoreFile_(storeName,
        kspOpenAiGetVectorStoreFileLive_(storeName, fileId, key));
    }
    return kspReadAndVerifyFileSearchDocumentLive_(documentValue.name, source, key);
  };

  base.queryAiQualificationSource = function (provider, config, request, key) {
    return provider === KSP_AI_PROVIDERS.OPENAI
      ? kspOpenAiQueryFileSearchLive_(request, key)
      : kspGeminiQualificationInteractionLive_(kspBuildFeatureFreezeInteractionRequest_(request), key);
  };

  base.deleteAiQualificationDocument = function (provider, storeName, documentValue, key) {
    if (provider !== KSP_AI_PROVIDERS.OPENAI) return true;
    var cleanup = kspOpenAiCleanupDocumentResourcesLive_(storeName,
      String(documentValue.fileId || documentValue.providerDocumentId || ''), key);
    if (cleanup.error) throw cleanup.error;
    return true;
  };

  base.deleteAiQualificationStore = function (provider, storeName, key) {
    if (provider === KSP_AI_PROVIDERS.OPENAI) return kspOpenAiDeleteVectorStoreLive_(storeName, key);
    kspGeminiJsonRequestLive_('DELETE', '/' + kspAiStoreResourcePath_(storeName) + '?force=true', null, {
      apiKeyOverride: key, retryPolicy: KSP_GEMINI_RETRY_POLICIES.IDEMPOTENT,
      stage: 'STORE_DELETE', errorCode: 'AI_STORE_DELETE_FAILED'
    });
    return true;
  };

  base.confirmAiQualificationStoreDeleted = function (provider, storeName, key) {
    try {
      if (provider === KSP_AI_PROVIDERS.OPENAI) kspOpenAiGetVectorStoreLive_(storeName, key);
      else kspGeminiJsonRequestLive_('GET', '/' + kspAiStoreResourcePath_(storeName), null, {
        apiKeyOverride: key, retryPolicy: KSP_GEMINI_RETRY_POLICIES.IDEMPOTENT,
        stage: 'STORE_DELETE_CONFIRM', errorCode: 'AI_STORE_DELETE_CONFIRM_FAILED'
      });
      return false;
    } catch (error) { return Number(error && error.httpStatus || 0) === 404; }
  };

  base.qualifyFourSourceAiModel = function (request) {
    return kspRunFourSourceAiSetupQualification_(base, request);
  };

  base.removeAiCredential = function (provider) {
    var lock = base.acquireScriptLock(KSP_DEFAULTS.LOCK_TIMEOUT_MS);
    try {
      var settings = kspNormalizeAiSettings_(base.loadAiSettingsSnapshot().settings);
      if (provider === KSP_AI_PROVIDERS.OPENAI ? settings.openaiEnabled : settings.geminiEnabled) {
        throw kspAiSetupError_('AI_SETUP_STOP_REQUIRED');
      }
      if (provider === KSP_AI_PROVIDERS.OPENAI) {
        scriptProperties.deleteProperty(KSP_AI_PROPERTY_KEYS.OPENAI_ACTIVE_SNAPSHOT);
        scriptProperties.deleteProperty(KSP_AI_PROPERTY_KEYS.OPENAI_API_KEY);
      } else {
        scriptProperties.deleteProperty(KSP_AI_PROPERTY_KEYS.GEMINI_ACTIVE_SNAPSHOT);
        scriptProperties.deleteProperty(KSP_AI_PROPERTY_KEYS.API_KEY);
      }
      return true;
    } finally { base.releaseScriptLock(lock); }
  };

  base.startAiProvider = function (provider) {
    var context = base.loadAiContext();
    var settings = kspNormalizeAiSettings_(context.settings);
    var policy = kspAiSetupPolicy_(settings, base.nowIso());
    var profile = policy.profiles.filter(function (item) {
      return item.provider === provider && item.isProviderDefault && item.enabled &&
        item.qualification === KSP_AI_MODEL_QUALIFICATION_STATES.QUALIFIED;
    })[0];
    if (!profile) throw kspAiSetupError_('AI_SETUP_QUALIFICATION_FAILED');
    var configured = provider === KSP_AI_PROVIDERS.OPENAI
      ? base.isOpenAiCredentialConfigured() : base.isGeminiCredentialConfigured();
    if (!configured) throw kspAiSetupError_('AI_SETUP_CREDENTIAL_REQUIRED');
    var storeKey = provider === KSP_AI_PROVIDERS.OPENAI
      ? KSP_AI_SETTINGS.OPENAI_VECTOR_STORE_ID : KSP_AI_SETTINGS.STORE_NAME;
    var enabledKey = provider === KSP_AI_PROVIDERS.OPENAI
      ? KSP_AI_SETTINGS.OPENAI_ENABLED : KSP_AI_SETTINGS.GEMINI_ENABLED;
    var readinessKey = provider === KSP_AI_PROVIDERS.OPENAI
      ? KSP_AI_SETTINGS.OPENAI_READINESS : KSP_AI_SETTINGS.GEMINI_READINESS;
    var originalStore = provider === KSP_AI_PROVIDERS.OPENAI
      ? settings.openaiVectorStoreId : settings.geminiStoreName;
    var generation = base.getAiCredentialGeneration(provider);
    if (profile.qualifiedTupleFingerprint !==
        kspAiSetupTupleFingerprint_(profile, generation, originalStore)) {
      throw kspAiSetupError_('AI_SETUP_STALE');
    }
    var storeName = originalStore;
    var createdName = '';
    var adopted = false;
    try {
      if (!storeName) {
        var created = provider === KSP_AI_PROVIDERS.OPENAI
          ? base.createOpenAiVectorStore(KSP_AI_DEFAULTS.STORE_DISPLAY_NAME)
          : base.createFileSearchStore(kspBuildFileSearchStoreCreateRequest_(
            KSP_AI_DEFAULTS.STORE_DISPLAY_NAME, settings.embeddingModel));
        createdName = String(created && (created.id || created.name) || '');
        storeName = createdName;
      }
      if (!storeName) throw kspAiSetupError_('AI_SETUP_STORE_ACCESS_FAILED');
      var readback = provider === KSP_AI_PROVIDERS.OPENAI
        ? base.getOpenAiVectorStore(storeName) : base.getFileSearchStore(storeName);
      if (String(readback && (readback.id || readback.name) || '') !== storeName) {
        throw kspAiSetupError_('AI_SETUP_STORE_ACCESS_FAILED');
      }
      var lock = base.acquireScriptLock(KSP_DEFAULTS.LOCK_TIMEOUT_MS);
      try {
        var current = base.loadAiSettingsSnapshot();
        var currentSettings = kspNormalizeAiSettings_(current.settings);
        var currentStore = provider === KSP_AI_PROVIDERS.OPENAI
          ? currentSettings.openaiVectorStoreId : currentSettings.geminiStoreName;
        if (currentStore !== originalStore ||
            (current.settings[KSP_AI_SETTINGS.MODEL_POLICY_JSON] || '') !==
              (context.settings[KSP_AI_SETTINGS.MODEL_POLICY_JSON] || '') ||
            base.getAiCredentialGeneration(provider) !== generation) {
          throw kspAiSetupError_('AI_SETUP_STALE');
        }
        if (createdName) {
          kspWriteSettingLive_(current.backendSpreadsheetId, storeKey, storeName, base.nowIso());
          adopted = true;
          profile.qualifiedStoreName = storeName;
          profile.qualifiedTupleFingerprint = kspAiSetupTupleFingerprint_(profile, generation, storeName);
          policy.profiles = policy.profiles.map(function (item) {
            return item.profileId === profile.profileId ? profile : item;
          });
          kspWriteSettingLive_(current.backendSpreadsheetId, KSP_AI_SETTINGS.MODEL_POLICY_JSON,
            JSON.stringify(kspNormalizeAiModelPolicy_(policy)), base.nowIso());
        }
        kspWriteSettingLive_(current.backendSpreadsheetId, readinessKey, 'READY_FOR_SYNC', base.nowIso());
        kspWriteSettingLive_(current.backendSpreadsheetId, enabledKey, 'true', base.nowIso());
      } finally { base.releaseScriptLock(lock); }
      return { ok: true, workId: '0073', provider: provider, status: 'READY_FOR_SYNC' };
    } catch (error) {
      if (createdName && !adopted) {
        try {
          if (provider === KSP_AI_PROVIDERS.OPENAI) kspOpenAiDeleteVectorStoreLive_(createdName);
          else base.deleteFileSearchStore(createdName);
        } catch (ignoredCleanup) { throw kspAiSetupError_('AI_SETUP_CLEANUP_REQUIRED'); }
      }
      throw error;
    }
  };

  base.loadAiContext = function () {
    var state = base.getInstallationState();
    kspAssert_(state && state.resources, 'INSTALLATION_STATE_MISSING', 'Installation stateがありません。');
    var backendSpreadsheetId = state.resources[KSP_RESOURCE_KEYS.BACKEND_SPREADSHEET];
    var auditSpreadsheetId = state.resources[KSP_RESOURCE_KEYS.AUDIT_SPREADSHEET];
    kspAssert_(backendSpreadsheetId, 'BACKEND_SPREADSHEET_MISSING', 'Backend Spreadsheetがありません。');
    kspAssert_(auditSpreadsheetId, 'AUDIT_SPREADSHEET_MISSING', 'Audit Spreadsheetがありません。');
    return {
      state: state,
      backendSpreadsheetId: backendSpreadsheetId,
      auditSpreadsheetId: auditSpreadsheetId,
      settings: kspReadSettingsMapLive_(backendSpreadsheetId),
      meetingRows: base.readRows(backendSpreadsheetId, KSP_SHEET_NAMES.MEETING_INDEX),
      pitchbookRows: base.readRows(backendSpreadsheetId, KSP_SHEET_NAMES.PITCHBOOK_INDEX),
      newsRows: base.readRows(backendSpreadsheetId, KSP_SHEET_NAMES.NEWS_INDEX),
      assessmentRows: base.readRows(backendSpreadsheetId, KSP_SHEET_NAMES.INTERNAL_ASSESSMENT_INDEX),
      counterpartyRows: base.readRows(backendSpreadsheetId, KSP_SHEET_NAMES.COUNTERPARTY_MASTER),
      optionRows: base.readRows(backendSpreadsheetId, KSP_SHEET_NAMES.OPTION_MASTER)
    };
  };

  base.ensureAiSettings = function (rows) {
    var state = base.getInstallationState();
    var spreadsheetId = state.resources[KSP_RESOURCE_KEYS.BACKEND_SPREADSHEET];
    return kspUpsertMissingSettingsLive_(spreadsheetId, rows || []);
  };

  base.saveOpenAiApiKey = function (value) {
    var key = kspAiTrim_(value);
    kspAssert_(key && key.length <= 512, 'OPENAI_API_KEY_INVALID', 'OpenAI API key is invalid.');
    scriptProperties.setProperty(KSP_AI_PROPERTY_KEYS.OPENAI_API_KEY, key);
    return true;
  };

  base.saveGeminiApiKey = function (value) {
    var key = kspAiTrim_(value);
    kspAssert_(key && key.length <= 512, 'GEMINI_API_KEY_INVALID', 'Gemini API key is invalid.');
    scriptProperties.setProperty(KSP_AI_PROPERTY_KEYS.API_KEY, key);
    return true;
  };

  base.ensureFileSearchStore = function (settings, displayName) {
    if (settings.storeName) return base.getFileSearchStore(settings.storeName);
    var created = base.createFileSearchStore(
      kspBuildFileSearchStoreCreateRequest_(displayName, settings.embeddingModel)
    );
    kspWriteSettingLive_(
      base.getInstallationState().resources[KSP_RESOURCE_KEYS.BACKEND_SPREADSHEET],
      KSP_AI_SETTINGS.STORE_NAME,
      created.name,
      base.nowIso()
    );
    return created;
  };

  base.getFileSearchStore = function (storeName) {
    try {
      return kspNormalizeFileSearchStore_(kspGeminiJsonRequestLive_('GET', '/' + kspAiStoreResourcePath_(storeName), null, {
        retryPolicy: KSP_GEMINI_RETRY_POLICIES.IDEMPOTENT,
        stage: 'STORE_READ', errorCode: 'AI_STORE_READ_FAILED'
      }));
    } catch (error) {
      if (error && (error.code === 'AI_STORE_READ_FAILED' || error.code === 'AI_CREDENTIAL_NOT_CONFIGURED')) throw error;
      throw kspGeminiStageError_('AI_STORE_READ_FAILED', 'STORE_READ', 0, {}, false);
    }
  };

  base.createFileSearchStore = function (request) {
    try {
      return kspNormalizeFileSearchStore_(kspGeminiJsonRequestLive_('POST', KSP_AI_API.STORES_PATH, request, {
        retryPolicy: KSP_GEMINI_RETRY_POLICIES.MUTATING_CREATE,
        stage: 'STORE_CREATE', errorCode: 'AI_STORE_CREATE_FAILED'
      }));
    } catch (error) {
      if (error && (error.code === 'AI_STORE_CREATE_FAILED' || error.code === 'AI_CREDENTIAL_NOT_CONFIGURED')) throw error;
      throw kspGeminiStageError_('AI_STORE_CREATE_FAILED', 'STORE_CREATE', 0, {}, false);
    }
  };

  base.findFileSearchDocumentsBySource = function (storeName, sourceId) {
    return kspListAllFileSearchDocumentsLive_(storeName).filter(function (documentValue) {
      return String(documentValue.customMetadata.source_id || '') === String(sourceId);
    });
  };

  base.deleteFileSearchDocument = function (storeName, documentName) {
    var normalizedStore = kspAiStoreResourcePath_(storeName);
    var name = kspAiTrim_(documentName);
    kspAssert_(name.indexOf(normalizedStore + '/documents/') === 0, 'AI_DOCUMENT_STORE_MISMATCH',
      'File Search Document does not belong to the configured Store.');
    kspGeminiJsonRequestLive_('DELETE', '/' + name + '?force=true', null, {
      retryPolicy: KSP_GEMINI_RETRY_POLICIES.IDEMPOTENT,
      stage: 'DOCUMENT_DELETE', errorCode: 'AI_DOCUMENT_DELETE_FAILED'
    });
    return true;
  };

  base.listGeminiModels = function () {
    return kspGeminiJsonRequestLive_('GET', '/models?pageSize=1000', null, {
      retryPolicy: KSP_GEMINI_RETRY_POLICIES.IDEMPOTENT,
      stage: 'MODELS_LIST', errorCode: 'AI_GEMINI_MODELS_LIST_FAILED'
    });
  };

  base.deleteFileSearchStore = function (storeName) {
    var normalizedStore = kspAiStoreResourcePath_(storeName);
    kspGeminiJsonRequestLive_('DELETE', '/' + normalizedStore + '?force=true', null, {
      retryPolicy: KSP_GEMINI_RETRY_POLICIES.IDEMPOTENT,
      stage: 'STORE_DELETE', errorCode: 'AI_STORE_DELETE_FAILED'
    });
    return true;
  };

  base.confirmFileSearchStoreDeleted = function (storeName) {
    var normalizedStore = kspAiStoreResourcePath_(storeName);
    try {
      kspGeminiJsonRequestLive_('GET', '/' + normalizedStore, null, {
        retryPolicy: KSP_GEMINI_RETRY_POLICIES.IDEMPOTENT,
        stage: 'STORE_DELETE_CONFIRM', errorCode: 'AI_STORE_DELETE_CONFIRM_FAILED'
      });
      return false;
    } catch (error) {
      return Number(error && error.httpStatus || 0) === 404;
    }
  };

  base.uploadSourceToFileSearchStore = function (storeName, source) {
    return kspUploadSourceLive_(storeName, source);
  };

  base.startQueryFileSearch = function (request) {
    return kspGeminiStartInteractionLive_(request);
  };

  base.pollQueryFileSearch = function (interactionId) {
    return kspGeminiPollInteractionLive_(interactionId);
  };

  base.queryFileSearch = function (request) {
    return kspGeminiQueryInteractionLive_(request);
  };

  base.queryGeminiInteraction = function (request) {
    return kspGeminiQueryInteractionLive_(request);
  };

  base.readMeetingText = function (fileId) {
    kspAssert_(fileId, 'AI_MEETING_DOC_MISSING', 'Meeting Google Docがありません。');
    return DocumentApp.openById(fileId).getBody().getText();
  };

  base.readTextFile = function (fileId) {
    kspAssert_(fileId, 'AI_PITCHBOOK_FILE_MISSING', 'Pitchbook source fileがありません。');
    var response = UrlFetchApp.fetch('https://www.googleapis.com/drive/v3/files/' + encodeURIComponent(fileId) + '?alt=media', {
      method: 'get',
      headers: { Authorization: 'Bearer ' + ScriptApp.getOAuthToken() },
      muteHttpExceptions: true
    });
    kspAssert_(response.getResponseCode() >= 200 && response.getResponseCode() < 300,
      'AI_SOURCE_READ_FAILED', 'TXT sourceを読み込めませんでした。');
    return response.getContentText('UTF-8');
  };

  base.hashText = function (text) {
    var digest = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, String(text || ''), Utilities.Charset.UTF_8);
    return digest.map(function (value) { return ('0' + ((value + 256) % 256).toString(16)).slice(-2); }).join('');
  };

  base.updateAiRow = function (sourceType, sourceId, patch) {
    var context = base.loadAiContext();
    var routes = {};
    routes[KSP_AI_SOURCE_TYPES.MEETING] = [KSP_SHEET_NAMES.MEETING_INDEX, 'Meeting_ID'];
    routes[KSP_AI_SOURCE_TYPES.PITCHBOOK] = [KSP_SHEET_NAMES.PITCHBOOK_INDEX, 'Document_ID'];
    routes[KSP_AI_SOURCE_TYPES.NEWS] = [KSP_SHEET_NAMES.NEWS_INDEX, 'News_ID'];
    routes[KSP_AI_SOURCE_TYPES.INTERNAL_ASSESSMENT] = [KSP_SHEET_NAMES.INTERNAL_ASSESSMENT_INDEX, 'Assessment_ID'];
    var route = routes[sourceType];
    kspAssert_(route, 'AI_SYNC_SOURCE_TYPE_INVALID', 'AI sync source type is invalid.');
    var sheetName = route[0];
    var keyColumn = route[1];
    return kspUpdateRowPatchLive_(context.backendSpreadsheetId, sheetName, keyColumn, sourceId, patch);
  };

  base.claimAiSource = function (sourceType, sourceId, nowIso, ttlMillis) {
    return kspClaimAiSourceLive_(scriptProperties, sourceType, sourceId, nowIso, ttlMillis);
  };

  base.releaseAiSourceClaim = function (sourceType, sourceId, token) {
    return kspReleaseAiSourceClaimLive_(scriptProperties, sourceType, sourceId, token);
  };

  base.appendAuditRow = function (spreadsheetId, row) {
    return base.appendRow(spreadsheetId, KSP_SHEET_NAMES.AUDIT_LOG, row);
  };

  return base;
}
// ===== END src/160_AiEnvironment.gs =====

