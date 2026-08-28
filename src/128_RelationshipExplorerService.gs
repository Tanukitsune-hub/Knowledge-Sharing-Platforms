var KSP_RELATIONSHIP_EXPLORER_WORK_ID = '0018';
var KSP_RELATIONSHIP_EXPLORER_UNSET = '__UNSET__';

var KSP_RELATIONSHIP_EXPLORER_LIMITS = Object.freeze({
  FORWARD_MEETINGS: 50,
  REVERSE_PITCHBOOKS: 50,
  RELATED_PITCHBOOKS: 25,
  REFERENCING_MEETINGS: 25,
  FILTER_OPTIONS: 100
});

function kspCreateRelationshipExplorerEnvironment_() {
  var source = kspCreateMeetingEnvironment_();
  return {
    getInstallationState: source.getInstallationState,
    readRows: source.readRows
  };
}

function kspRelationshipTrim_(value) {
  return value === null || value === undefined ? '' : String(value).trim();
}

function kspRelationshipFilterValue_(value) {
  var text = kspRelationshipTrim_(value);
  return text === '未設定' ? KSP_RELATIONSHIP_EXPLORER_UNSET : text;
}

function kspRelationshipPositiveLimit_(value, fallback, maximum) {
  if (value === null || value === undefined || value === '') return fallback;
  var numberValue = Number(value);
  kspAssert_(Number.isFinite(numberValue) && numberValue > 0 &&
    Math.floor(numberValue) === numberValue && numberValue <= maximum,
    'RELATIONSHIP_EXPLORER_LIMIT_INVALID', 'Relationship Explorerの表示上限が不正です。');
  return numberValue;
}

function kspRelationshipNormalizeInput_(rawInput) {
  var source = rawInput && typeof rawInput === 'object' ? rawInput : {};
  var supplied = source.filters && typeof source.filters === 'object' ? source.filters : source;
  var rawDateFrom = source.dateFrom !== undefined ? source.dateFrom : supplied.dateFrom;
  var rawDateTo = source.dateTo !== undefined ? source.dateTo : supplied.dateTo;
  var dateFrom = rawDateFrom === null || rawDateFrom === undefined ? '' : rawDateFrom;
  var dateTo = rawDateTo === null || rawDateTo === undefined ? '' : rawDateTo;
  if (dateFrom) {
    dateFrom = kspCanonicalBusinessDate_(dateFrom);
    kspAssert_(dateFrom, 'RELATIONSHIP_EXPLORER_DATE_INVALID', 'Relationship Explorerの日付が不正です。');
  }
  if (dateTo) {
    dateTo = kspCanonicalBusinessDate_(dateTo);
    kspAssert_(dateTo, 'RELATIONSHIP_EXPLORER_DATE_INVALID', 'Relationship Explorerの日付が不正です。');
  }
  if (dateFrom && dateTo) {
    kspAssert_(dateFrom <= dateTo, 'RELATIONSHIP_EXPLORER_DATE_RANGE_INVALID',
      'Relationship Explorerの日付範囲が不正です。');
  }
  return {
    dateFrom: dateFrom,
    dateTo: dateTo,
    filters: {
      counterpartyType: kspRelationshipFilterValue_(supplied.counterpartyType),
      counterpartyEntity: kspRelationshipFilterValue_(
        supplied.counterpartyEntity || supplied.counterpartyEntityKey
      ),
      relatedGp: kspRelationshipFilterValue_(supplied.relatedGp || supplied.relatedGpId),
      pitchbookGp: kspRelationshipFilterValue_(supplied.pitchbookGp || supplied.pitchbookGpId),
      assetClass: kspRelationshipFilterValue_(supplied.assetClass || supplied.assetClassId),
      fundStrategy: kspRelationshipFilterValue_(supplied.fundStrategy),
      meetingStatus: kspRelationshipFilterValue_(supplied.meetingStatus),
      pitchbookStatus: kspRelationshipFilterValue_(supplied.pitchbookStatus)
    },
    forwardLimit: kspRelationshipPositiveLimit_(source.forwardLimit,
      KSP_RELATIONSHIP_EXPLORER_LIMITS.FORWARD_MEETINGS,
      KSP_RELATIONSHIP_EXPLORER_LIMITS.FORWARD_MEETINGS),
    reverseLimit: kspRelationshipPositiveLimit_(source.reverseLimit,
      KSP_RELATIONSHIP_EXPLORER_LIMITS.REVERSE_PITCHBOOKS,
      KSP_RELATIONSHIP_EXPLORER_LIMITS.REVERSE_PITCHBOOKS),
    relatedLimit: kspRelationshipPositiveLimit_(source.relatedLimit,
      KSP_RELATIONSHIP_EXPLORER_LIMITS.RELATED_PITCHBOOKS,
      KSP_RELATIONSHIP_EXPLORER_LIMITS.RELATED_PITCHBOOKS),
    referencingLimit: kspRelationshipPositiveLimit_(source.referencingLimit,
      KSP_RELATIONSHIP_EXPLORER_LIMITS.REFERENCING_MEETINGS,
      KSP_RELATIONSHIP_EXPLORER_LIMITS.REFERENCING_MEETINGS)
  };
}

function kspRelationshipCounterpartyTypeLabel_(code) {
  var definition = kspCounterpartyTypeDefinition_(code);
  return definition ? definition.label : String(code || '');
}

function kspRelationshipBuildMaps_(gpRows, optionRows) {
  var maps = kspBuildAllMasterMaps_(gpRows || [], optionRows || []);
  var catalog = kspBuildMaintenanceCatalog_(gpRows || [], optionRows || []);
  var typeLabels = {};
  (catalog.counterpartyTypes || []).forEach(function (item) {
    typeLabels[String(item.code)] = String(item.label || item.code || '');
  });
  return { maps: maps, catalog: catalog, typeLabels: typeLabels };
}

function kspRelationshipValueOrUnset_(value) {
  return kspRelationshipTrim_(value) || KSP_RELATIONSHIP_EXPLORER_UNSET;
}

function kspRelationshipBuildFilterOption_(value, label) {
  return { value: value, label: label || (value === KSP_RELATIONSHIP_EXPLORER_UNSET ? '未設定' : value) };
}

function kspRelationshipSortOptions_(left, right) {
  if (left.value === KSP_RELATIONSHIP_EXPLORER_UNSET) return 1;
  if (right.value === KSP_RELATIONSHIP_EXPLORER_UNSET) return -1;
  return String(left.label || '').localeCompare(String(right.label || ''), 'ja') ||
    String(left.value || '').localeCompare(String(right.value || ''));
}

function kspRelationshipFilterOptions_(meetings, pitchbooks, maps) {
  var sets = {
    counterpartyTypes: {}, counterpartyEntities: {}, relatedGps: {}, pitchbookGps: {},
    assetClasses: {}, fundStrategies: {}, meetingStatuses: {}, pitchbookStatuses: {}
  };
  function add(set, value) { sets[set][kspRelationshipValueOrUnset_(value)] = true; }
  (meetings || []).forEach(function (meeting) {
    add('counterpartyTypes', meeting.counterpartyType);
    add('counterpartyEntities', meeting.counterpartyEntityKey);
    (meeting.relatedGpIds || []).forEach(function (id) { add('relatedGps', id); });
    add('assetClasses', meeting.assetClassId);
    add('fundStrategies', meeting.fundStrategy);
    add('meetingStatuses', meeting.status);
  });
  (pitchbooks || []).forEach(function (pitchbook) {
    add('pitchbookGps', pitchbook.gpId);
    add('assetClasses', pitchbook.assetClassId);
    add('fundStrategies', pitchbook.fundStrategy);
    add('pitchbookStatuses', pitchbook.status);
  });
  function options(setName, labeler) {
    return Object.keys(sets[setName]).map(function (value) {
      return kspRelationshipBuildFilterOption_(value, labeler ? labeler(value) : undefined);
    }).sort(kspRelationshipSortOptions_).slice(0, KSP_RELATIONSHIP_EXPLORER_LIMITS.FILTER_OPTIONS);
  }
  var gpLabel = function (value) {
    return value === KSP_RELATIONSHIP_EXPLORER_UNSET ? '未設定' :
      (maps.maps.gp[value] ? maps.maps.gp[value] + ' / ' + value : value);
  };
  var assetLabel = function (value) {
    return value === KSP_RELATIONSHIP_EXPLORER_UNSET ? '未設定' :
      (maps.maps.assetClass[value] ? maps.maps.assetClass[value] + ' / ' + value : value);
  };
  var typeLabel = function (value) {
    return value === KSP_RELATIONSHIP_EXPLORER_UNSET ? '未設定' :
      (maps.typeLabels[value] || kspRelationshipCounterpartyTypeLabel_(value) || value);
  };
  var entityLabel = function (value) {
    return value === KSP_RELATIONSHIP_EXPLORER_UNSET ? '未設定' :
      ((maps.maps.counterparty[value] || '') ? maps.maps.counterparty[value] + ' / ' + value : value);
  };
  return {
    counterpartyTypes: options('counterpartyTypes', typeLabel),
    counterpartyEntities: options('counterpartyEntities', entityLabel),
    relatedGps: options('relatedGps', gpLabel),
    pitchbookGps: options('pitchbookGps', gpLabel),
    assetClasses: options('assetClasses', assetLabel),
    fundStrategies: options('fundStrategies'),
    meetingStatuses: options('meetingStatuses'),
    pitchbookStatuses: options('pitchbookStatuses')
  };
}

function kspRelationshipMapMeeting_(row, maps) {
  var type = kspMeetingCounterpartyType_(row);
  var counterpartyId = kspMeetingCounterpartyId_(row);
  var relatedGpIds = kspMaintenanceSplitCodes_(kspMeetingRelatedGpIds_(row));
  var entityKey = type && counterpartyId ? type + ':' + counterpartyId : '';
  return {
    meetingId: String(row.Meeting_ID || ''),
    date: kspCanonicalBusinessDate_(row.Date),
    time: kspCanonicalBusinessTime_(row.Time),
    counterpartyType: type,
    counterpartyTypeLabel: maps.typeLabels[type] || kspRelationshipCounterpartyTypeLabel_(type),
    counterpartyId: counterpartyId,
    counterpartyEntityKey: entityKey,
    counterpartyEntityName: (maps.maps.counterparty || {})[entityKey] || '',
    relatedGpIds: relatedGpIds,
    relatedGpNames: relatedGpIds.map(function (id) { return maps.maps.gp[id] || id; }),
    assetClassId: String(row.Asset_Class_ID || '').trim(),
    assetClassName: maps.maps.assetClass[String(row.Asset_Class_ID || '')] || '',
    teamId: String(row.Team_ID || '').trim(),
    teamName: maps.maps.team[String(row.Team_ID || '')] || '',
    fundStrategy: String(row.Fund_Strategy || '').trim(),
    meetingTypeCodes: kspMaintenanceSplitCodes_(row.Meeting_Type_Codes),
    status: String(row.Status || '').trim(),
    documentUrl: kspGpWorkspaceSafeLink_(row.Doc_URL, row.Doc_File_ID),
    filename: String(row.Saved_Filename || ''),
    relatedPitchbookIds: kspMaintenanceSplitCodes_(row.Related_Pitchbook_IDs)
  };
}

function kspRelationshipMapPitchbook_(row, maps) {
  var documentId = String(row.Document_ID || '').trim();
  return {
    documentId: documentId,
    date: kspCanonicalBusinessDate_(row.Date),
    gpId: String(row.GP_ID || '').trim(),
    gpName: maps.maps.gp[String(row.GP_ID || '')] || '',
    assetClassId: String(row.Asset_Class_ID || '').trim(),
    assetClassName: maps.maps.assetClass[String(row.Asset_Class_ID || '')] || '',
    fundStrategy: String(row.Fund_Strategy || '').trim(),
    status: String(row.Status || '').trim(),
    savedFilename: String(row.Saved_Filename || '').trim(),
    originalFilename: String(row.Original_Filename || '').trim(),
    fileUrl: kspGpWorkspaceSafeLink_(row.File_URL, row.File_ID)
  };
}

function kspRelationshipBuildEdges_(meetings, pitchbooks) {
  var pitchbooksById = {};
  (pitchbooks || []).forEach(function (pitchbook) {
    if (!pitchbooksById[pitchbook.documentId]) pitchbooksById[pitchbook.documentId] = [];
    pitchbooksById[pitchbook.documentId].push(pitchbook);
  });
  var edges = [];
  (meetings || []).forEach(function (meeting) {
    var seen = {};
    meeting.relatedPitchbookIds.forEach(function (documentId) {
      var candidates = pitchbooksById[documentId] || [];
      var unresolvedReason = '';
      var target = null;
      if (seen[documentId]) unresolvedReason = 'DUPLICATE_RELATIONSHIP_ID';
      else if (candidates.length === 0) unresolvedReason = 'PITCHBOOK_NOT_FOUND';
      else if (candidates.length !== 1) unresolvedReason = 'DUPLICATE_DOCUMENT_ID';
      else target = candidates[0];
      seen[documentId] = true;
      edges.push({
        meeting: meeting,
        pitchbook: target,
        documentId: documentId,
        resolutionState: target ? 'resolved' : 'unresolved',
        unresolved: !target,
        unresolvedReason: unresolvedReason
      });
    });
  });
  return edges;
}

function kspRelationshipValueMatches_(actual, requested) {
  if (!requested) return true;
  if (requested === KSP_RELATIONSHIP_EXPLORER_UNSET) return !kspRelationshipTrim_(actual);
  return kspRelationshipTrim_(actual) === requested;
}

function kspRelationshipEitherValueMatches_(meetingValue, pitchbookValue, requested) {
  return !requested || kspRelationshipValueMatches_(meetingValue, requested) ||
    kspRelationshipValueMatches_(pitchbookValue, requested);
}

function kspRelationshipEdgeMatches_(edge, input) {
  var meeting = edge.meeting;
  var pitchbook = edge.pitchbook;
  var filters = input.filters || {};
  if (input.dateFrom && (!meeting.date || meeting.date < input.dateFrom)) return false;
  if (input.dateTo && (!meeting.date || meeting.date > input.dateTo)) return false;
  if (!kspRelationshipValueMatches_(meeting.counterpartyType, filters.counterpartyType)) return false;
  if (!kspRelationshipValueMatches_(meeting.counterpartyEntityKey, filters.counterpartyEntity)) return false;
  if (filters.relatedGp) {
    if (filters.relatedGp === KSP_RELATIONSHIP_EXPLORER_UNSET) {
      if ((meeting.relatedGpIds || []).length) return false;
    } else if ((meeting.relatedGpIds || []).indexOf(filters.relatedGp) === -1) return false;
  }
  if (!kspRelationshipValueMatches_(meeting.status, filters.meetingStatus)) return false;
  if (filters.pitchbookGp && (!pitchbook || !kspRelationshipValueMatches_(pitchbook.gpId, filters.pitchbookGp))) return false;
  if (filters.pitchbookStatus && (!pitchbook || !kspRelationshipValueMatches_(pitchbook.status, filters.pitchbookStatus))) return false;
  if (!kspRelationshipEitherValueMatches_(meeting.assetClassId, pitchbook && pitchbook.assetClassId, filters.assetClass)) return false;
  if (!kspRelationshipEitherValueMatches_(meeting.fundStrategy, pitchbook && pitchbook.fundStrategy, filters.fundStrategy)) return false;
  return true;
}

function kspRelationshipCompareMeeting_(left, right) {
  return String(right.date || '').localeCompare(String(left.date || '')) ||
    String(left.meetingId || '').localeCompare(String(right.meetingId || ''));
}

function kspRelationshipComparePitchbook_(left, right) {
  return String(right.date || '').localeCompare(String(left.date || '')) ||
    String(left.documentId || '').localeCompare(String(right.documentId || ''));
}

function kspRelationshipResolvedItem_(edge) {
  if (!edge.pitchbook) {
    return {
      documentId: edge.documentId,
      resolutionState: 'unresolved',
      unresolved: true,
      unresolvedReason: edge.unresolvedReason
    };
  }
  return Object.assign({}, edge.pitchbook, {
    resolutionState: 'resolved',
    unresolved: false
  });
}

function kspRelationshipBuildForward_(matchingEdges, allEdges, input) {
  var byMeeting = {};
  var allByMeeting = {};
  (matchingEdges || []).forEach(function (edge) {
    var id = edge.meeting.meetingId;
    if (!byMeeting[id]) byMeeting[id] = { meeting: edge.meeting, edges: [] };
    byMeeting[id].edges.push(edge);
  });
  (allEdges || []).forEach(function (edge) {
    var id = edge.meeting.meetingId;
    if (!allByMeeting[id]) allByMeeting[id] = [];
    allByMeeting[id].push(edge);
  });
  var all = Object.keys(byMeeting).map(function (meetingId) {
    var entry = byMeeting[meetingId];
    var relationships = entry.edges.slice().sort(function (left, right) {
      return String(left.documentId).localeCompare(String(right.documentId));
    }).map(kspRelationshipResolvedItem_);
    var fullCount = (allByMeeting[meetingId] || []).length;
    return Object.assign({}, entry.meeting, {
      relatedPitchbooks: relationships.slice(0, input.relatedLimit),
      relatedPitchbookCount: relationships.length,
      fullRelatedPitchbookCount: fullCount,
      omittedCount: Math.max(0, relationships.length - input.relatedLimit),
      omittedRelatedPitchbookCount: Math.max(0, fullCount - input.relatedLimit)
    });
  }).sort(kspRelationshipCompareMeeting_);
  return {
    totalCount: all.length,
    records: all.slice(0, input.forwardLimit),
    omittedCount: Math.max(0, all.length - input.forwardLimit)
  };
}

function kspRelationshipBuildReverse_(matchingEdges, allEdges, input) {
  var byPitchbook = {};
  var allByPitchbook = {};
  (matchingEdges || []).forEach(function (edge) {
    if (!edge.pitchbook) return;
    var id = edge.pitchbook.documentId;
    if (!byPitchbook[id]) byPitchbook[id] = { pitchbook: edge.pitchbook, edges: [] };
    byPitchbook[id].edges.push(edge);
  });
  (allEdges || []).forEach(function (edge) {
    if (!edge.pitchbook) return;
    var id = edge.pitchbook.documentId;
    if (!allByPitchbook[id]) allByPitchbook[id] = [];
    allByPitchbook[id].push(edge);
  });
  var all = Object.keys(byPitchbook).map(function (documentId) {
    var entry = byPitchbook[documentId];
    var meetings = entry.edges.map(function (edge) { return edge.meeting; })
      .sort(kspRelationshipCompareMeeting_);
    var fullCount = (allByPitchbook[documentId] || []).length;
    return Object.assign({}, entry.pitchbook, {
      referencingMeetings: meetings.slice(0, input.referencingLimit),
      referencingMeetingCount: meetings.length,
      fullReferencingMeetingCount: fullCount,
      omittedCount: Math.max(0, meetings.length - input.referencingLimit),
      omittedReferencingMeetingCount: Math.max(0, fullCount - input.referencingLimit)
    });
  }).sort(kspRelationshipComparePitchbook_);
  return {
    totalCount: all.length,
    records: all.slice(0, input.reverseLimit),
    omittedCount: Math.max(0, all.length - input.reverseLimit)
  };
}

function kspBuildRelationshipExplorerData_(meetingRows, pitchbookRows, gpRows, optionRows, input) {
  var maps = kspRelationshipBuildMaps_(gpRows, optionRows);
  var meetings = (meetingRows || []).map(function (row) { return kspRelationshipMapMeeting_(row, maps); })
    .filter(function (meeting) { return meeting.meetingId; });
  var pitchbooks = (pitchbookRows || []).map(function (row) { return kspRelationshipMapPitchbook_(row, maps); })
    .filter(function (pitchbook) { return pitchbook.documentId; });
  var allEdges = kspRelationshipBuildEdges_(meetings, pitchbooks);
  var matchingEdges = allEdges.filter(function (edge) { return kspRelationshipEdgeMatches_(edge, input); });
  var forward = kspRelationshipBuildForward_(matchingEdges, allEdges, input);
  var reverse = kspRelationshipBuildReverse_(matchingEdges, allEdges, input);
  var meetingIds = {};
  var pitchbookIds = {};
  matchingEdges.forEach(function (edge) {
    meetingIds[edge.meeting.meetingId] = edge.meeting;
    if (edge.pitchbook) pitchbookIds[edge.pitchbook.documentId] = edge.pitchbook;
  });
  var matchingMeetings = Object.keys(meetingIds).map(function (id) { return meetingIds[id]; });
  var matchingPitchbooks = Object.keys(pitchbookIds).map(function (id) { return pitchbookIds[id]; });
  var unresolvedCount = matchingEdges.filter(function (edge) { return edge.unresolved; }).length;
  var inactiveMeetingCount = matchingMeetings.filter(function (meeting) {
    return meeting.status === KSP_STATUS.INACTIVE;
  }).length;
  var inactivePitchbookCount = matchingPitchbooks.filter(function (pitchbook) {
    return pitchbook.status === KSP_STATUS.INACTIVE;
  }).length;
  var counts = {
    relationships: matchingEdges.length,
    meetings: matchingMeetings.length,
    pitchbooks: matchingPitchbooks.length,
    unresolved: unresolvedCount,
    inactiveMeetings: inactiveMeetingCount,
    inactivePitchbooks: inactivePitchbookCount
  };
  return {
    ok: true,
    workId: KSP_RELATIONSHIP_EXPLORER_WORK_ID,
    filters: kspDeepClone_(input.filters),
    dateFrom: input.dateFrom,
    dateTo: input.dateTo,
    summary: counts,
    counts: counts,
    forward: forward,
    reverse: reverse,
    filterOptions: kspRelationshipFilterOptions_(meetings, pitchbooks, maps),
    readModel: {
      source: ['Meeting_Index', 'Pitchbook_Index', 'GP_Master', 'Option_Master'],
      relationshipField: 'Meeting_Index.Related_Pitchbook_IDs',
      documentBodyRead: false,
      pitchbookBytesRead: false,
      auditRead: false,
      readOnly: true
    },
    sideEffects: { writes: 0, auditWrites: 0, aiCalls: 0 }
  };
}

function kspGetRelationshipExplorerData_(environment, rawInput) {
  try {
    var input = kspRelationshipNormalizeInput_(rawInput);
    var state = environment.getInstallationState();
    kspAssert_(state && state.resources, 'INSTALLATION_STATE_MISSING', 'Installation stateがありません。');
    var backendSpreadsheetId = state.resources[KSP_RESOURCE_KEYS.BACKEND_SPREADSHEET];
    kspAssert_(backendSpreadsheetId, 'BACKEND_SPREADSHEET_MISSING', 'Backend Spreadsheetがありません。');
    return kspBuildRelationshipExplorerData_(
      environment.readRows(backendSpreadsheetId, KSP_SHEET_NAMES.MEETING_INDEX),
      environment.readRows(backendSpreadsheetId, KSP_SHEET_NAMES.PITCHBOOK_INDEX),
      environment.readRows(backendSpreadsheetId, KSP_SHEET_NAMES.GP_MASTER),
      environment.readRows(backendSpreadsheetId, KSP_SHEET_NAMES.OPTION_MASTER),
      input
    );
  } catch (error) {
    var code = kspGetErrorCode_(error);
    return {
      ok: false,
      workId: KSP_RELATIONSHIP_EXPLORER_WORK_ID,
      error: { code: code, message: kspSafePublicErrorMessage_(code, 'RELATIONSHIP_EXPLORER') }
    };
  }
}
