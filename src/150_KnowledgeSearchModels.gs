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
