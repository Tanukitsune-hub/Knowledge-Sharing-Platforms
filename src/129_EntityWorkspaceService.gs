var KSP_ENTITY_WORKSPACE_WORK_ID = '0019';

var KSP_ENTITY_WORKSPACE_LIMITS = Object.freeze({
  ENTITIES: 250,
  DIRECT_MEETINGS: 20,
  RELATED_MEETINGS: 20,
  PITCHBOOKS: 20,
  FUND_STRATEGIES: 20,
  FOLLOW_UPS: 20,
  RELATIONSHIPS: 20,
  TIMELINE: 40,
  RELATED_PITCHBOOKS: 25,
  REFERENCING_MEETINGS: 20
});

function kspCreateEntityWorkspaceEnvironment_() {
  var source = kspCreateMeetingEnvironment_();
  return {
    getInstallationState: source.getInstallationState,
    readRows: source.readRows
  };
}

function kspEntityWorkspaceTrim_(value) {
  return value === null || value === undefined ? '' : String(value).trim();
}

function kspEntityWorkspaceNormalizeInput_(rawInput) {
  var source = typeof rawInput === 'string' ? { entityKey: rawInput } :
    (rawInput && typeof rawInput === 'object' ? rawInput : {});
  var entityKey = kspEntityWorkspaceTrim_(source.entityKey || source.counterpartyEntityKey);
  var counterpartyType = kspEntityWorkspaceTrim_(source.counterpartyType || source.type);
  var counterpartyId = kspEntityWorkspaceTrim_(source.counterpartyId || source.id);
  if (entityKey) {
    var separator = entityKey.indexOf(':');
    kspAssert_(separator > 0 && separator < entityKey.length - 1,
      'ENTITY_WORKSPACE_ENTITY_INVALID', 'Entityの指定が不正です。');
    counterpartyType = kspEntityWorkspaceTrim_(entityKey.slice(0, separator));
    counterpartyId = kspEntityWorkspaceTrim_(entityKey.slice(separator + 1));
  }
  if (counterpartyType || counterpartyId) {
    kspAssert_(counterpartyType && counterpartyId,
      'ENTITY_WORKSPACE_ENTITY_INVALID', 'Entityの指定が不正です。');
    kspAssert_(Boolean(kspCounterpartyTypeDefinition_(counterpartyType)),
      'ENTITY_WORKSPACE_COUNTERPARTY_TYPE_INVALID', 'Counterparty Typeを確認してください。');
    entityKey = counterpartyType + ':' + counterpartyId;
  }
  return {
    entityKey: entityKey,
    counterpartyType: counterpartyType,
    counterpartyId: counterpartyId,
    fundStrategy: kspEntityWorkspaceTrim_(source.fundStrategy || source.strategy)
  };
}

function kspEntityWorkspaceReadModel_() {
  return {
    source: ['Meeting_Index', 'Pitchbook_Index', 'GP_Master', 'Option_Master'],
    relationshipField: 'Meeting_Index.Related_Pitchbook_IDs',
    documentBodyRead: false,
    pitchbookBytesRead: false,
    auditRead: false,
    readOnly: true
  };
}

function kspEntityWorkspaceSideEffects_() {
  return { writes: 0, auditWrites: 0, aiCalls: 0 };
}

function kspEntityWorkspaceTypeLabel_(type) {
  var definition = kspCounterpartyTypeDefinition_(type);
  return definition ? definition.label : String(type || '');
}

function kspEntityWorkspaceTypeOrder_(type) {
  var definitions = KSP_COUNTERPARTY_TYPE_DEFINITIONS || [];
  var index = definitions.map(function (item) { return item.code; }).indexOf(type);
  return index === -1 ? definitions.length : index;
}

function kspEntityWorkspaceBuildCatalog_(gpRows, optionRows, meetingRows, maps) {
  var catalog = kspBuildMaintenanceCatalog_(gpRows || [], optionRows || []);
  var byKey = {};
  function add(item) {
    var type = kspEntityWorkspaceTrim_(item.type);
    var id = kspEntityWorkspaceTrim_(item.id);
    if (!type || !id || !kspCounterpartyTypeDefinition_(type)) return;
    var key = type + ':' + id;
    if (!byKey[key]) {
      byKey[key] = {
        key: key, entityKey: key, type: type, counterpartyType: type,
        id: id, counterpartyId: id,
        name: kspEntityWorkspaceTrim_(item.name) || id,
        status: kspEntityWorkspaceTrim_(item.status),
        typeLabel: kspEntityWorkspaceTypeLabel_(type)
      };
    } else {
      if (!byKey[key].name || byKey[key].name === id) byKey[key].name = kspEntityWorkspaceTrim_(item.name) || id;
      if (!byKey[key].status) byKey[key].status = kspEntityWorkspaceTrim_(item.status);
    }
  }
  (catalog.counterpartyEntities || []).forEach(add);
  (meetingRows || []).forEach(function (row) {
    var type = kspMeetingCounterpartyType_(row);
    var id = kspMeetingCounterpartyId_(row);
    var key = type && id ? type + ':' + id : '';
    add({
      type: type, id: id,
      name: (maps.maps.counterparty || {})[key] || kspEntityWorkspaceTrim_(row.Counterparty) || id,
      status: ''
    });
  });
  var entities = Object.keys(byKey).map(function (key) { return byKey[key]; })
    .sort(function (left, right) {
      return kspEntityWorkspaceTypeOrder_(left.type) - kspEntityWorkspaceTypeOrder_(right.type) ||
        left.name.toLocaleLowerCase('ja').localeCompare(right.name.toLocaleLowerCase('ja'), 'ja') ||
        left.id.localeCompare(right.id);
    });
  var typeCounts = {};
  entities.forEach(function (item) { typeCounts[item.type] = (typeCounts[item.type] || 0) + 1; });
  var types = KSP_COUNTERPARTY_TYPE_DEFINITIONS.map(function (definition) {
    return {
      code: definition.code,
      label: definition.label,
      entityCount: typeCounts[definition.code] || 0
    };
  });
  return {
    entities: entities.slice(0, KSP_ENTITY_WORKSPACE_LIMITS.ENTITIES),
    omittedEntities: Math.max(0, entities.length - KSP_ENTITY_WORKSPACE_LIMITS.ENTITIES),
    types: types
  };
}

function kspEntityWorkspaceMapMeeting_(row, maps) {
  var relationship = kspRelationshipMapMeeting_(row, maps);
  var mapped = kspMapMeetingSearchResult_(row, maps.maps);
  return Object.assign({}, relationship, {
    gpId: mapped.gpId,
    gpName: mapped.gpName,
    locationId: mapped.locationId,
    locationName: mapped.locationName,
    capitalTypeId: mapped.capitalTypeId,
    capitalTypeName: mapped.capitalTypeName,
    meetingTypeLabels: mapped.meetingTypeLabels,
    followUpRequired: mapped.followUpRequired,
    documentId: mapped.documentId,
    documentUrl: kspGpWorkspaceSafeLink_(mapped.documentUrl, row.Doc_File_ID),
    filename: mapped.filename,
    version: mapped.version,
    updatedAt: mapped.updatedAt
  });
}

function kspEntityWorkspaceMapPitchbook_(row, maps) {
  var relationship = kspRelationshipMapPitchbook_(row, maps);
  var mapped = kspMapPitchbookSearchResult_(row, maps.maps);
  return Object.assign({}, relationship, {
    batchId: mapped.batchId,
    capitalTypeId: mapped.capitalTypeId,
    capitalTypeName: mapped.capitalTypeName,
    sequenceNo: mapped.sequenceNo,
    fileUrl: kspGpWorkspaceSafeLink_(mapped.fileUrl, row.File_ID),
    updatedAt: mapped.updatedAt
  });
}

function kspEntityWorkspaceSortMeeting_(left, right) {
  return String(right.date || '').localeCompare(String(left.date || '')) ||
    String(left.meetingId || '').localeCompare(String(right.meetingId || ''));
}

function kspEntityWorkspaceSortPitchbook_(left, right) {
  return String(right.date || '').localeCompare(String(left.date || '')) ||
    String(left.documentId || '').localeCompare(String(right.documentId || ''));
}

function kspEntityWorkspaceScopeMeeting_(meeting, scope) {
  return Object.assign({}, meeting, {
    activityScope: scope,
    activityScopeLabel: scope === 'related' ? 'Related' : 'Direct'
  });
}

function kspEntityWorkspaceCap_(records, limit, comparator) {
  var sorted = (records || []).slice().sort(comparator);
  return {
    totalCount: sorted.length,
    records: sorted.slice(0, limit),
    omittedCount: Math.max(0, sorted.length - limit)
  };
}

function kspEntityWorkspaceBuildRelationshipRecords_(edges, allEdges) {
  var input = {
    forwardLimit: KSP_ENTITY_WORKSPACE_LIMITS.RELATIONSHIPS,
    relatedLimit: KSP_ENTITY_WORKSPACE_LIMITS.RELATED_PITCHBOOKS,
    referencingLimit: KSP_ENTITY_WORKSPACE_LIMITS.REFERENCING_MEETINGS,
    reverseLimit: KSP_ENTITY_WORKSPACE_LIMITS.RELATIONSHIPS
  };
  return kspRelationshipBuildForward_(edges || [], allEdges || edges || [], input);
}

function kspEntityWorkspaceBuildMix_(meetings) {
  var sets = { teams: {}, assetClasses: {}, meetingTypes: {} };
  function add(set, key, label) {
    var normalized = kspEntityWorkspaceTrim_(key) || '__UNSET__';
    if (!sets[set][normalized]) sets[set][normalized] = { key: normalized, label: label || (normalized === '__UNSET__' ? '未設定' : normalized), count: 0 };
    sets[set][normalized].count += 1;
  }
  (meetings || []).forEach(function (meeting) {
    add('teams', meeting.teamId, meeting.teamName || meeting.teamId);
    add('assetClasses', meeting.assetClassId, meeting.assetClassName || meeting.assetClassId);
    if ((meeting.meetingTypeCodes || []).length) {
      meeting.meetingTypeCodes.forEach(function (code, index) {
        var labels = meeting.meetingTypeLabels || [];
        add('meetingTypes', code, labels[index] || code);
      });
    } else {
      add('meetingTypes', '', '未設定');
    }
  });
  function finish(set) {
    return Object.keys(set).map(function (key) { return set[key]; }).sort(function (left, right) {
      return right.count - left.count || left.label.localeCompare(right.label, 'ja') || left.key.localeCompare(right.key);
    });
  }
  return { teams: finish(sets.teams), assetClasses: finish(sets.assetClasses), meetingTypes: finish(sets.meetingTypes) };
}

function kspEntityWorkspaceBuildFundStrategies_(meetings, pitchbooks, edges) {
  var aggregates = {};
  function ensure(text) {
    if (!aggregates[text]) aggregates[text] = {
      text: text, meetingIds: {}, pitchbookIds: {}, directMeetingCount: 0,
      relatedMeetingCount: 0, openFollowUpCount: 0, latestDate: ''
    };
    return aggregates[text];
  }
  (meetings || []).forEach(function (meeting) {
    var text = kspEntityWorkspaceTrim_(meeting.fundStrategy);
    if (!text) return;
    var aggregate = ensure(text);
    aggregate.meetingIds[meeting.meetingId] = meeting;
    if (meeting.activityScope === 'related') aggregate.relatedMeetingCount += 1;
    else aggregate.directMeetingCount += 1;
    if (meeting.status === KSP_STATUS.ACTIVE && meeting.followUpRequired) aggregate.openFollowUpCount += 1;
    if (meeting.date > aggregate.latestDate) aggregate.latestDate = meeting.date;
  });
  (pitchbooks || []).forEach(function (pitchbook) {
    var text = kspEntityWorkspaceTrim_(pitchbook.fundStrategy);
    if (!text) return;
    var aggregate = ensure(text);
    aggregate.pitchbookIds[pitchbook.documentId] = pitchbook;
    if (pitchbook.date > aggregate.latestDate) aggregate.latestDate = pitchbook.date;
  });
  return Object.keys(aggregates).map(function (text) {
    var aggregate = aggregates[text];
    var relatedEdges = (edges || []).filter(function (edge) {
      return edge.meeting.fundStrategy === text || (edge.pitchbook && edge.pitchbook.fundStrategy === text);
    });
    var meetingItems = Object.keys(aggregate.meetingIds).map(function (id) { return aggregate.meetingIds[id]; });
    var pitchbookItems = Object.keys(aggregate.pitchbookIds).map(function (id) { return aggregate.pitchbookIds[id]; });
    return {
      text: text,
      meetingCount: meetingItems.length,
      pitchbookCount: pitchbookItems.length,
      directMeetingCount: aggregate.directMeetingCount,
      relatedMeetingCount: aggregate.relatedMeetingCount,
      latestDate: aggregate.latestDate,
      openFollowUpCount: aggregate.openFollowUpCount,
      relationshipCount: relatedEdges.length,
      meetings: kspEntityWorkspaceCap_(meetingItems, KSP_ENTITY_WORKSPACE_LIMITS.DIRECT_MEETINGS, kspEntityWorkspaceSortMeeting_),
      pitchbooks: kspEntityWorkspaceCap_(pitchbookItems, KSP_ENTITY_WORKSPACE_LIMITS.PITCHBOOKS, kspEntityWorkspaceSortPitchbook_),
      omittedCounts: {
        meetings: Math.max(0, meetingItems.length - KSP_ENTITY_WORKSPACE_LIMITS.DIRECT_MEETINGS),
        pitchbooks: Math.max(0, pitchbookItems.length - KSP_ENTITY_WORKSPACE_LIMITS.PITCHBOOKS),
        relationships: Math.max(0, relatedEdges.length - KSP_ENTITY_WORKSPACE_LIMITS.RELATIONSHIPS)
      }
    };
  }).sort(function (left, right) {
    return right.latestDate.localeCompare(left.latestDate) ||
      left.text.toLocaleLowerCase('ja').localeCompare(right.text.toLocaleLowerCase('ja'), 'ja') ||
      left.text.localeCompare(right.text);
  });
}

function kspEntityWorkspaceBuildTimeline_(meetings, pitchbooks, edges) {
  var timeline = [];
  (meetings || []).forEach(function (meeting) {
    timeline.push({
      kind: 'Meeting', id: meeting.meetingId, date: meeting.date, time: meeting.time,
      status: meeting.status, activityScope: meeting.activityScope,
      fundStrategy: meeting.fundStrategy, sourceUrl: meeting.documentUrl
    });
  });
  (pitchbooks || []).forEach(function (pitchbook) {
    timeline.push({
      kind: 'Pitchbook', id: pitchbook.documentId, date: pitchbook.date,
      status: pitchbook.status, fundStrategy: pitchbook.fundStrategy, sourceUrl: pitchbook.fileUrl
    });
  });
  (edges || []).forEach(function (edge) {
    timeline.push({
      kind: 'Relationship', id: edge.meeting.meetingId + '>' + edge.documentId,
      date: edge.meeting.date, status: edge.pitchbook ? edge.pitchbook.status : 'unresolved',
      meetingId: edge.meeting.meetingId, documentId: edge.documentId,
      sourceUrl: edge.pitchbook ? edge.pitchbook.fileUrl : ''
    });
  });
  timeline.sort(function (left, right) {
    return String(right.date || '').localeCompare(String(left.date || '')) ||
      left.kind.localeCompare(right.kind) || left.id.localeCompare(right.id);
  });
  return {
    totalCount: timeline.length,
    records: timeline.slice(0, KSP_ENTITY_WORKSPACE_LIMITS.TIMELINE),
    omittedCount: Math.max(0, timeline.length - KSP_ENTITY_WORKSPACE_LIMITS.TIMELINE)
  };
}

function kspEntityWorkspaceBuildDrill_(fundStrategy, meetings, pitchbooks, edges) {
  if (!fundStrategy) return null;
  var matchingMeetings = (meetings || []).filter(function (meeting) { return meeting.fundStrategy === fundStrategy; });
  var matchingPitchbooks = (pitchbooks || []).filter(function (pitchbook) { return pitchbook.fundStrategy === fundStrategy; });
  var matchingEdges = (edges || []).filter(function (edge) {
    return edge.meeting.fundStrategy === fundStrategy || (edge.pitchbook && edge.pitchbook.fundStrategy === fundStrategy);
  });
  var forward = kspEntityWorkspaceBuildRelationshipRecords_(matchingEdges, edges);
  return {
    selected: fundStrategy,
    meetings: kspEntityWorkspaceCap_(matchingMeetings, KSP_ENTITY_WORKSPACE_LIMITS.DIRECT_MEETINGS, kspEntityWorkspaceSortMeeting_),
    pitchbooks: kspEntityWorkspaceCap_(matchingPitchbooks, KSP_ENTITY_WORKSPACE_LIMITS.PITCHBOOKS, kspEntityWorkspaceSortPitchbook_),
    relationships: forward,
    counts: {
      meetings: matchingMeetings.length,
      pitchbooks: matchingPitchbooks.length,
      relationships: matchingEdges.length
    },
    omittedCounts: {
      meetings: Math.max(0, matchingMeetings.length - KSP_ENTITY_WORKSPACE_LIMITS.DIRECT_MEETINGS),
      pitchbooks: Math.max(0, matchingPitchbooks.length - KSP_ENTITY_WORKSPACE_LIMITS.PITCHBOOKS),
      relationships: forward.omittedCount
    }
  };
}

function kspEntityWorkspaceRelatedGps_(meetings, gpRows) {
  var byId = {};
  (gpRows || []).forEach(function (row) {
    var id = kspEntityWorkspaceTrim_(row.GP_ID);
    if (id) byId[id] = { id: id, name: String(row.GP_Name || id), status: String(row.Status || '') };
  });
  var seen = {};
  (meetings || []).forEach(function (meeting) {
    (meeting.relatedGpIds || []).forEach(function (id) {
      if (!seen[id]) seen[id] = byId[id] || { id: id, name: id, status: '' };
    });
  });
  return Object.keys(seen).sort().map(function (id) { return seen[id]; });
}

function kspBuildEntityWorkspaceData_(rawInput, gpRows, optionRows, meetingRows, pitchbookRows, workspaceOptions) {
  var input = kspEntityWorkspaceNormalizeInput_(rawInput);
  var meetingScope = workspaceOptions && workspaceOptions.meetingScope === 'direct' ? 'direct' : 'all';
  var maps = kspRelationshipBuildMaps_(gpRows || [], optionRows || []);
  var catalog = kspEntityWorkspaceBuildCatalog_(gpRows || [], optionRows || [], meetingRows || [], maps);
  var baseResponse = {
    ok: true,
    workId: KSP_ENTITY_WORKSPACE_WORK_ID,
    entityTypes: catalog.types,
    entityOptions: catalog.entities,
    omittedEntityCount: catalog.omittedEntities,
    readModel: kspEntityWorkspaceReadModel_(),
    sideEffects: kspEntityWorkspaceSideEffects_()
  };
  if (!input.entityKey) return baseResponse;
  var entity = catalog.entities.filter(function (item) { return item.entityKey === input.entityKey; })[0];
  kspAssert_(entity, 'ENTITY_WORKSPACE_ENTITY_NOT_FOUND', '指定されたEntityを確認できません。');

  var allMeetings = (meetingRows || []).map(function (row) { return kspEntityWorkspaceMapMeeting_(row, maps); })
    .filter(function (meeting) { return meeting.meetingId; });
  var allPitchbooks = (pitchbookRows || []).map(function (row) { return kspEntityWorkspaceMapPitchbook_(row, maps); })
    .filter(function (pitchbook) { return pitchbook.documentId; });
  var directMeetings = allMeetings.filter(function (meeting) { return meeting.counterpartyEntityKey === input.entityKey; })
    .map(function (meeting) { return kspEntityWorkspaceScopeMeeting_(meeting, 'direct'); });
  var relatedMeetings = entity.type === 'GP' ? allMeetings.filter(function (meeting) {
    return meeting.counterpartyEntityKey !== input.entityKey && meeting.relatedGpIds.indexOf(entity.id) !== -1;
  }).map(function (meeting) { return kspEntityWorkspaceScopeMeeting_(meeting, 'related'); }) : [];
  var visibleMeetings = (meetingScope === 'direct' ? directMeetings.slice() : directMeetings.concat(relatedMeetings))
    .sort(kspEntityWorkspaceSortMeeting_);
  var directMeetingIds = {};
  directMeetings.forEach(function (meeting) { directMeetingIds[meeting.meetingId] = true; });

  var pitchbookById = {};
  allPitchbooks.forEach(function (pitchbook) {
    if (!pitchbookById[pitchbook.documentId]) pitchbookById[pitchbook.documentId] = [];
    pitchbookById[pitchbook.documentId].push(pitchbook);
  });
  var selectedPitchbooks = entity.type === 'GP' ? allPitchbooks.filter(function (pitchbook) {
    return pitchbook.gpId === entity.id;
  }) : Object.keys(directMeetingIds).reduce(function (selected, meetingId) {
    var meeting = directMeetings.filter(function (candidate) { return candidate.meetingId === meetingId; })[0];
    (meeting ? meeting.relatedPitchbookIds : []).forEach(function (documentId) {
      var candidates = pitchbookById[documentId] || [];
      if (candidates.length === 1) selected.push(candidates[0]);
    });
    return selected;
  }, []);
  var selectedPitchbookIds = {};
  selectedPitchbooks = selectedPitchbooks.filter(function (pitchbook) {
    if (selectedPitchbookIds[pitchbook.documentId]) return false;
    selectedPitchbookIds[pitchbook.documentId] = true;
    return true;
  }).sort(kspEntityWorkspaceSortPitchbook_);

  var allEdges = kspRelationshipBuildEdges_(visibleMeetings, allPitchbooks);
  var relationshipForward = kspEntityWorkspaceBuildRelationshipRecords_(allEdges, allEdges);
  var relationshipReverse = kspRelationshipBuildReverse_(allEdges, allEdges, {
    reverseLimit: KSP_ENTITY_WORKSPACE_LIMITS.RELATIONSHIPS,
    referencingLimit: KSP_ENTITY_WORKSPACE_LIMITS.REFERENCING_MEETINGS
  });
  var activeFollowUps = visibleMeetings.filter(function (meeting) {
    return meeting.status === KSP_STATUS.ACTIVE && meeting.followUpRequired;
  });
  var unresolvedRelationshipCount = allEdges.filter(function (edge) { return edge.unresolved; }).length;
  var fundStrategies = kspEntityWorkspaceBuildFundStrategies_(visibleMeetings, selectedPitchbooks, allEdges);
  var drill = fundStrategies.some(function (item) { return item.text === input.fundStrategy; })
    ? kspEntityWorkspaceBuildDrill_(input.fundStrategy, visibleMeetings, selectedPitchbooks, allEdges)
    : null;
  var timeline = kspEntityWorkspaceBuildTimeline_(visibleMeetings, selectedPitchbooks, allEdges);
  var followUpRowsById = {};
  (meetingRows || []).forEach(function (row) { followUpRowsById[String(row.Meeting_ID || '')] = row; });
  var directList = kspEntityWorkspaceCap_(directMeetings, KSP_ENTITY_WORKSPACE_LIMITS.DIRECT_MEETINGS, kspEntityWorkspaceSortMeeting_);
  var relatedList = kspEntityWorkspaceCap_(relatedMeetings, KSP_ENTITY_WORKSPACE_LIMITS.RELATED_MEETINGS, kspEntityWorkspaceSortMeeting_);
  var pitchbookList = kspEntityWorkspaceCap_(selectedPitchbooks, KSP_ENTITY_WORKSPACE_LIMITS.PITCHBOOKS, kspEntityWorkspaceSortPitchbook_);
  var latestDirect = directMeetings.slice().sort(kspEntityWorkspaceSortMeeting_)[0];
  var latestActivity = visibleMeetings.slice().sort(kspEntityWorkspaceSortMeeting_)[0];
  var response = Object.assign({}, baseResponse, {
    entity: {
      entityKey: entity.entityKey,
      counterpartyType: entity.type,
      counterpartyTypeLabel: entity.typeLabel,
      counterpartyId: entity.id,
      name: entity.name,
      status: entity.status,
      mode: entity.type === 'GP' ? 'GP' : 'NON_GP'
    },
    mode: entity.type === 'GP' ? 'GP' : 'NON_GP',
    summary: {
      directMeetingCount: directMeetings.length,
      directActiveMeetingCount: directMeetings.filter(function (meeting) { return meeting.status === KSP_STATUS.ACTIVE; }).length,
      relatedMeetingCount: relatedMeetings.length,
      relatedActiveMeetingCount: relatedMeetings.filter(function (meeting) { return meeting.status === KSP_STATUS.ACTIVE; }).length,
      meetingCount: visibleMeetings.length,
      activeMeetingCount: visibleMeetings.filter(function (meeting) { return meeting.status === KSP_STATUS.ACTIVE; }).length,
      pitchbookCount: selectedPitchbooks.length,
      pitchbookActiveCount: selectedPitchbooks.filter(function (pitchbook) { return pitchbook.status === KSP_STATUS.ACTIVE; }).length,
      openFollowUpCount: activeFollowUps.length,
      relationshipCount: allEdges.length,
      unresolvedRelationshipCount: unresolvedRelationshipCount,
      latestDirectMeetingDate: latestDirect ? latestDirect.date : '',
      latestActivityDate: latestActivity ? latestActivity.date : ''
    },
    meetings: { direct: directList, related: relatedList, all: kspEntityWorkspaceCap_(visibleMeetings, KSP_ENTITY_WORKSPACE_LIMITS.DIRECT_MEETINGS, kspEntityWorkspaceSortMeeting_) },
    pitchbooks: pitchbookList,
    ownedPitchbooks: entity.type === 'GP' ? pitchbookList : { totalCount: 0, records: [], omittedCount: 0 },
    linkedPitchbooks: entity.type !== 'GP' ? pitchbookList : { totalCount: 0, records: [], omittedCount: 0 },
    relatedGps: entity.type === 'GP' ? [] : kspEntityWorkspaceRelatedGps_(directMeetings, gpRows),
    fundStrategies: {
      totalCount: fundStrategies.length,
      records: fundStrategies.slice(0, KSP_ENTITY_WORKSPACE_LIMITS.FUND_STRATEGIES),
      omittedCount: Math.max(0, fundStrategies.length - KSP_ENTITY_WORKSPACE_LIMITS.FUND_STRATEGIES)
    },
    followUps: {
      totalCount: activeFollowUps.length,
      records: activeFollowUps.slice().sort(kspEntityWorkspaceSortMeeting_).slice(0, KSP_ENTITY_WORKSPACE_LIMITS.FOLLOW_UPS).map(function (meeting) {
        return Object.assign({}, meeting, { followUpNote: String((followUpRowsById[meeting.meetingId] || {}).Follow_Up_Note || '') });
      }),
      omittedCount: Math.max(0, activeFollowUps.length - KSP_ENTITY_WORKSPACE_LIMITS.FOLLOW_UPS)
    },
    mixes: kspEntityWorkspaceBuildMix_(visibleMeetings),
    relationships: relationshipForward.records,
    relationshipContext: {
      forward: relationshipForward,
      reverse: relationshipReverse,
      relationshipCount: allEdges.length,
      unresolvedCount: unresolvedRelationshipCount
    },
    timeline: timeline,
    drillDown: drill,
    fundStrategySelection: input.fundStrategy,
    omittedCounts: {
      directMeetings: directList.omittedCount,
      relatedMeetings: relatedList.omittedCount,
      pitchbooks: pitchbookList.omittedCount,
      fundStrategies: Math.max(0, fundStrategies.length - KSP_ENTITY_WORKSPACE_LIMITS.FUND_STRATEGIES),
      followUps: Math.max(0, activeFollowUps.length - KSP_ENTITY_WORKSPACE_LIMITS.FOLLOW_UPS),
      relationships: Math.max(0, relationshipForward.totalCount - KSP_ENTITY_WORKSPACE_LIMITS.RELATIONSHIPS),
      timeline: Math.max(0, timeline.totalCount - KSP_ENTITY_WORKSPACE_LIMITS.TIMELINE)
    }
  });
  return response;
}

function kspGetEntityWorkspaceData_(environment, rawInput) {
  try {
    var state = environment.getInstallationState();
    kspAssert_(state && state.resources, 'INSTALLATION_STATE_MISSING', 'Installation stateがありません。');
    var backendSpreadsheetId = state.resources[KSP_RESOURCE_KEYS.BACKEND_SPREADSHEET];
    kspAssert_(backendSpreadsheetId, 'BACKEND_SPREADSHEET_MISSING', 'Backend Spreadsheetがありません。');
    return kspBuildEntityWorkspaceData_(
      rawInput,
      environment.readRows(backendSpreadsheetId, KSP_SHEET_NAMES.GP_MASTER),
      environment.readRows(backendSpreadsheetId, KSP_SHEET_NAMES.OPTION_MASTER),
      environment.readRows(backendSpreadsheetId, KSP_SHEET_NAMES.MEETING_INDEX),
      environment.readRows(backendSpreadsheetId, KSP_SHEET_NAMES.PITCHBOOK_INDEX)
    );
  } catch (error) {
    var code = kspGetErrorCode_(error);
    return {
      ok: false,
      workId: KSP_ENTITY_WORKSPACE_WORK_ID,
      error: { code: code, message: kspSafePublicErrorMessage_(code, 'WORKSPACE') }
    };
  }
}
