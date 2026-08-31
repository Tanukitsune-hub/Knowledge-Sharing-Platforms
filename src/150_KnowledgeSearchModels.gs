function kspBuildKnowledgeSearchCatalog_(gpRows, optionRows, meetingRows, pitchbookRows) {
  var gps = (gpRows || []).map(function (row) {
    return { id: String(row.GP_ID || ''), name: String(row.GP_Name || ''), status: String(row.Status || '') };
  }).filter(function (item) { return item.id && item.name; }).sort(function (left, right) {
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
  var counterpartyEntities = gps.map(function (gp) {
    return { id: 'GP:' + gp.id, entityKey: 'GP:' + gp.id, type: 'GP', name: gp.name, status: gp.status };
  });
  KSP_COUNTERPARTY_TYPE_DEFINITIONS.filter(function (definition) { return definition.optionType; })
    .forEach(function (definition) {
      byType(definition.optionType).forEach(function (option) {
        counterpartyEntities.push({
          id: definition.code + ':' + option.id,
          entityKey: definition.code + ':' + option.id,
          type: definition.code,
          name: option.name,
          status: option.status
        });
      });
    });
  var fundStrategies = {};
  (meetingRows || []).concat(pitchbookRows || []).forEach(function (row) {
    var value = kspAiTrim_(row && row.Fund_Strategy);
    if (value) fundStrategies[value] = true;
  });
  return {
    gps: gps,
    assetClasses: byType(KSP_OPTION_TYPES.ASSET_CLASS),
    capitalTypes: byType(KSP_OPTION_TYPES.CAPITAL_TYPE),
    teams: byType(KSP_OPTION_TYPES.TEAM),
    counterpartyTypes: KSP_COUNTERPARTY_TYPE_DEFINITIONS.map(function (definition) {
      return { id: definition.code, code: definition.code, name: definition.label, label: definition.label };
    }),
    counterpartyEntities: counterpartyEntities,
    relatedGps: gps.slice(),
    meetingTypes: KSP_MEETING_TYPE_DEFINITIONS.map(function (definition) {
      return { id: definition.code, code: definition.code, name: definition.label, label: definition.label };
    }),
    fundStrategies: Object.keys(fundStrategies).sort().map(function (value) { return { id: value, name: value }; }),
    followUpOptions: [
      { id: KSP_KNOWLEDGE_FOLLOW_UP_FILTERS.REQUIRED, name: '必要' },
      { id: KSP_KNOWLEDGE_FOLLOW_UP_FILTERS.NOT_REQUIRED, name: '不要' }
    ],
    sourceTypes: [
      { id: KSP_AI_SOURCE_TYPES.MEETING, name: 'Meeting' },
      { id: KSP_AI_SOURCE_TYPES.PITCHBOOK, name: 'Pitchbook' }
    ]
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
      '選択されたAsset Classは利用できません。'
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
      'AI_TEAM_FILTER_UNAVAILABLE', '選択されたTeamは利用できません。');
  }
  if (filters.counterpartyType) {
    kspRequireCatalogItem_(safeCatalog.counterpartyTypes, filters.counterpartyType,
      'AI_COUNTERPARTY_TYPE_FILTER_UNAVAILABLE', '選択されたCounterparty Typeは利用できません。');
  }
  if (filters.entityKey) {
    kspRequireCatalogItem_(safeCatalog.counterpartyEntities, filters.entityKey,
      'AI_ENTITY_FILTER_UNAVAILABLE', '選択されたCounterparty Entityは利用できません。');
  }
  if (filters.fundStrategy) {
    kspRequireCatalogItem_(safeCatalog.fundStrategies, filters.fundStrategy,
      'AI_FUND_STRATEGY_FILTER_UNAVAILABLE', '選択されたFund / Strategyは利用できません。');
  }
  if (filters.relatedGpId) {
    kspRequireCatalogItem_(safeCatalog.relatedGps || safeCatalog.gps, filters.relatedGpId,
      'AI_RELATED_GP_FILTER_UNAVAILABLE', '選択されたRelated GPは利用できません。');
  }
  if (filters.meetingTypeCode) {
    kspRequireCatalogItem_(safeCatalog.meetingTypes || [], filters.meetingTypeCode,
      'AI_MEETING_TYPE_FILTER_UNAVAILABLE', '選択されたMeeting Typeは利用できません。');
  }
  (input && input.selectedEntityKeys || []).forEach(function (entityKey) {
    kspRequireCatalogItem_(safeCatalog.counterpartyEntities, entityKey,
      'AI_ENTITY_FILTER_UNAVAILABLE', '選択されたCounterparty Entityは利用できません。');
  });
  return input;
}

function kspBuildAuthoritativeSourceMaps_(meetingRows, pitchbookRows) {
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
      sourceId: String(row.Meeting_ID || ''),
      date: kspCanonicalBusinessDate_(row.Date),
      driveUrl: String(row.Doc_URL || ''),
      savedFilename: String(row.Saved_Filename || row.Meeting_ID || ''),
      entityKey: counterpartyType && counterpartyId ? counterpartyType + ':' + counterpartyId : '',
      counterpartyType: counterpartyType,
      status: String(row.Status || ''),
      aiDocumentName: String(row.AI_Document_Name || ''),
      providerContentHashes: kspKnowledgeSourceProviderContentHashes_(row),
      contentHash: kspKnowledgeSourceContentHash_(row),
      providerDocumentIds: kspKnowledgeSourceProviderDocumentIds_(row)
    });
  });

  (pitchbookRows || []).forEach(function (row) {
    var gpId = String(row.GP_ID || '');
    add({
      sourceType: KSP_AI_SOURCE_TYPES.PITCHBOOK,
      sourceId: String(row.Document_ID || ''),
      date: kspCanonicalBusinessDate_(row.Date),
      driveUrl: String(row.File_URL || ''),
      savedFilename: String(row.Saved_Filename || row.Original_Filename || row.Document_ID || ''),
      entityKey: gpId ? 'GP:' + gpId : '',
      counterpartyType: gpId ? 'GP' : '',
      status: String(row.Status || ''),
      aiDocumentName: String(row.AI_Document_Name || ''),
      providerContentHashes: kspKnowledgeSourceProviderContentHashes_(row),
      contentHash: kspKnowledgeSourceContentHash_(row),
      providerDocumentIds: kspKnowledgeSourceProviderDocumentIds_(row)
    });
  });

  return maps;
}

function kspKnowledgeSourceIdentityEquivalent_(left, right) {
  return left && right && left.sourceType === right.sourceType &&
    left.sourceId === right.sourceId && left.contentHash === right.contentHash;
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

function kspMapKnowledgeCitations_(rawCitations, sourceMaps) {
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
    if (authoritative.status !== KSP_STATUS.ACTIVE) {
      warnings.push({
        code: 'AI_CITATION_SOURCE_INACTIVE',
        message: 'An inactive source citation was excluded.',
        sourceId: authoritative.sourceId
      });
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
    var normalizedCitation = {
      sourceType: authoritative.sourceType,
      sourceId: authoritative.sourceId,
      date: authoritative.date,
      title: authoritative.savedFilename || (citation ? citation.fileName : ''),
      entityKey: authoritative.entityKey || '',
      counterpartyType: authoritative.counterpartyType || '',
      driveUrl: authoritative.driveUrl,
      pageNumber: pageNumber
    };
    if (provenance) normalizedCitation.provenance = provenance;
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
    Source_Type_Filter: kspKnowledgeRequestFilters_(input).sourceType,
    Model_ID: options.modelId || '',
    Cited_Source_IDs: kspUniqueStrings_(sourceIds).join(',')
  };
}
