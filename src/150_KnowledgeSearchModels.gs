function kspBuildKnowledgeSearchCatalog_(gpRows, optionRows) {
  var catalog = kspBuildMeetingCatalog_(gpRows || [], optionRows || []);
  return {
    gps: kspDeepClone_(catalog.gps || []),
    assetClasses: kspDeepClone_(catalog.assetClasses || []),
    capitalTypes: kspDeepClone_(catalog.capitalTypes || []),
    teams: kspDeepClone_(catalog.teams || []),
    counterpartyTypes: kspDeepClone_(catalog.counterpartyTypes || []),
    counterpartyEntities: kspDeepClone_(catalog.counterpartyEntities || []),
    sourceTypes: [
      { id: KSP_AI_SOURCE_TYPES.MEETING, name: 'Meeting' },
      { id: KSP_AI_SOURCE_TYPES.PITCHBOOK, name: 'Pitchbook' }
    ]
  };
}

function kspValidateKnowledgeFilterIds_(input, catalog) {
  var safeCatalog = catalog || { gps: [], assetClasses: [], capitalTypes: [] };
  if (input.gpId) {
    kspRequireCatalogItem_(safeCatalog.gps, input.gpId, 'AI_GP_FILTER_UNAVAILABLE', '選択されたGPは利用できません。');
  }
  if (input.assetClassId) {
    kspRequireCatalogItem_(
      safeCatalog.assetClasses,
      input.assetClassId,
      'AI_ASSET_CLASS_FILTER_UNAVAILABLE',
      '選択されたAsset Classは利用できません。'
    );
  }
  if (input.capitalTypeId) {
    kspRequireCatalogItem_(
      safeCatalog.capitalTypes,
      input.capitalTypeId,
      'AI_CAPITAL_TYPE_FILTER_UNAVAILABLE',
      '選択されたEquity / Debtは利用できません。'
    );
  }
}

function kspBuildAuthoritativeSourceMaps_(meetingRows, pitchbookRows) {
  var maps = { bySourceId: {}, byAiDocumentName: {} };

  function add(source) {
    if (!source.sourceId) return;
    maps.bySourceId[source.sourceId] = source;
    if (source.aiDocumentName) maps.byAiDocumentName[source.aiDocumentName] = source;
  }

  (meetingRows || []).forEach(function (row) {
    add({
      sourceType: KSP_AI_SOURCE_TYPES.MEETING,
      sourceId: String(row.Meeting_ID || ''),
      date: kspCanonicalBusinessDate_(row.Date),
      driveUrl: String(row.Doc_URL || ''),
      savedFilename: String(row.Saved_Filename || row.Meeting_ID || ''),
      status: String(row.Status || ''),
      aiDocumentName: String(row.AI_Document_Name || '')
    });
  });

  (pitchbookRows || []).forEach(function (row) {
    add({
      sourceType: KSP_AI_SOURCE_TYPES.PITCHBOOK,
      sourceId: String(row.Document_ID || ''),
      date: kspCanonicalBusinessDate_(row.Date),
      driveUrl: String(row.File_URL || ''),
      savedFilename: String(row.Saved_Filename || row.Original_Filename || row.Document_ID || ''),
      status: String(row.Status || ''),
      aiDocumentName: String(row.AI_Document_Name || '')
    });
  });

  return maps;
}

function kspMapKnowledgeCitations_(rawCitations, sourceMaps) {
  var maps = sourceMaps || { bySourceId: {}, byAiDocumentName: {} };
  var warnings = [];
  var seen = {};
  var citations = [];

  (rawCitations || []).forEach(function (citation) {
    var metadata = citation && citation.metadata ? citation.metadata : {};
    var sourceId = kspAiTrim_(metadata.source_id);
    var authoritative = sourceId ? maps.bySourceId[sourceId] : null;
    if (!authoritative && citation && citation.source) {
      authoritative = maps.byAiDocumentName[String(citation.source)] || null;
      if (authoritative) sourceId = authoritative.sourceId;
    }

    if (!authoritative) {
      warnings.push({
        code: 'AI_CITATION_SOURCE_NOT_FOUND',
        message: 'Gemini citation could not be matched to an authoritative source record.'
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
    var key = authoritative.sourceId + '|' + String(pageNumber || '');
    if (seen[key]) return;
    seen[key] = true;
    citations.push({
      sourceType: authoritative.sourceType,
      sourceId: authoritative.sourceId,
      date: authoritative.date,
      title: authoritative.savedFilename || (citation ? citation.fileName : ''),
      driveUrl: authoritative.driveUrl,
      pageNumber: pageNumber
    });
  });

  return { citations: citations, warnings: warnings };
}

function kspBuildKnowledgeSearchAuditRow_(params) {
  var options = params || {};
  var input = options.input || {};
  var sourceIds = (options.citations || []).map(function (citation) { return citation.sourceId; });
  return {
    Event_Timestamp: kspCanonicalInstantIso_(options.timestamp),
    Actor: options.actor || 'UNIDENTIFIED',
    Action: 'AI_QUERY',
    Target_Type: 'KnowledgeSearch',
    Target_ID: options.interactionId || '',
    Result: options.result || KSP_AUDIT_RESULTS.FAILURE,
    Changed_Fields: '',
    Before_Metadata_JSON: '',
    After_Metadata_JSON: '',
    Batch_ID: '',
    Error_Code: options.errorCode || '',
    Error_Message: options.errorCode ? kspSafePublicErrorMessage_(options.errorCode, 'SEARCH') : '',
    Search_Mode: KSP_AI_SEARCH_MODES.FREE_QUESTION,
    Question_Or_Instruction: '',
    Date_From: input.dateFrom || '',
    Date_To: input.dateTo || '',
    GP_Filter: input.gpId || '',
    Asset_Class_Filter: input.assetClassId || '',
    Capital_Type_Filter: input.capitalTypeId || '',
    Source_Type_Filter: input.sourceType || '',
    Model_ID: options.modelId || '',
    Cited_Source_IDs: kspUniqueStrings_(sourceIds).join(',')
  };
}
