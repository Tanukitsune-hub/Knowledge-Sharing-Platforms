var KSP_GP_WORKSPACE_LIMITS = Object.freeze({
  FUND_STRATEGIES: 20,
  RECENT_MEETINGS: 20,
  RECENT_PITCHBOOKS: 20,
  FOLLOW_UPS: 20,
  RELATIONSHIPS: 20
});

function kspCreateGpWorkspaceEnvironment_() {
  var source = kspCreateMeetingEnvironment_();
  return {
    getInstallationState: source.getInstallationState,
    readRows: source.readRows
  };
}

function kspGpWorkspaceSafeLink_(value, fileId) {
  var candidate = String(value || '').trim();
  var expectedId = String(fileId || '').trim();
  if (!expectedId || !/^https:\/\/(?:drive|docs)\.google\.com\//i.test(candidate)) return '';
  var escapedId = expectedId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp('/d/' + escapedId + '(?:/|$)').test(candidate) ||
    new RegExp('[?&]id=' + escapedId + '(?:&|$)').test(candidate) ? candidate : '';
}

function kspGpWorkspaceSortRows_(rows, idColumn) {
  return (rows || []).slice().sort(function (left, right) {
    var dateCompare = kspMaintenanceCellText_(right.Date, 'date')
      .localeCompare(kspMaintenanceCellText_(left.Date, 'date'));
    if (dateCompare !== 0) return dateCompare;
    return String(left[idColumn] || '').localeCompare(String(right[idColumn] || ''));
  });
}

function kspGpWorkspaceMeeting_(row, maps) {
  var mapped = kspMapMeetingSearchResult_(row, maps);
  return {
    meetingId: mapped.meetingId,
    date: mapped.date,
    assetClassName: mapped.assetClassName,
    capitalTypeName: mapped.capitalTypeName,
    teamName: mapped.teamName,
    fundStrategy: mapped.fundStrategy,
    meetingTypeLabels: mapped.meetingTypeLabels,
    followUpRequired: mapped.followUpRequired,
    relatedPitchbookIds: mapped.relatedPitchbookIds,
    status: mapped.status,
    documentUrl: kspGpWorkspaceSafeLink_(mapped.documentUrl, row.Doc_File_ID)
  };
}

function kspGpWorkspacePitchbook_(row, maps) {
  var mapped = kspMapPitchbookSearchResult_(row, maps);
  return {
    documentId: mapped.documentId,
    date: mapped.date,
    assetClassName: mapped.assetClassName,
    capitalTypeName: mapped.capitalTypeName,
    fundStrategy: mapped.fundStrategy,
    savedFilename: mapped.savedFilename || mapped.originalFilename,
    status: mapped.status,
    fileUrl: kspGpWorkspaceSafeLink_(mapped.fileUrl, row.File_ID)
  };
}

function kspGpWorkspaceFundStrategies_(meetingRows, pitchbookRows) {
  var aggregates = {};
  function add(row, sourceType) {
    var text = String(row.Fund_Strategy || '').trim();
    if (!text) return;
    var key = text;
    if (!aggregates[key]) {
      aggregates[key] = { text: text, meetingCount: 0, pitchbookCount: 0, latestDate: '' };
    }
    aggregates[key][sourceType === 'Meeting' ? 'meetingCount' : 'pitchbookCount'] += 1;
    var date = kspMaintenanceCellText_(row.Date, 'date');
    if (date > aggregates[key].latestDate) aggregates[key].latestDate = date;
  }
  (meetingRows || []).forEach(function (row) { add(row, 'Meeting'); });
  (pitchbookRows || []).forEach(function (row) { add(row, 'Pitchbook'); });
  return Object.keys(aggregates).map(function (key) { return aggregates[key]; })
    .sort(function (left, right) {
      return right.latestDate.localeCompare(left.latestDate) ||
        left.text.toLocaleLowerCase('ja').localeCompare(right.text.toLocaleLowerCase('ja'), 'ja');
    });
}

function kspGpWorkspaceRelationships_(meetingRows, pitchbookRows, maps) {
  var byId = {};
  (pitchbookRows || []).forEach(function (row) {
    var id = String(row.Document_ID || '');
    if (!id) return;
    if (!byId[id]) byId[id] = [];
    byId[id].push(row);
  });
  return kspGpWorkspaceSortRows_((meetingRows || []).filter(function (row) {
    return kspMaintenanceSplitCodes_(row.Related_Pitchbook_IDs).length > 0;
  }), 'Meeting_ID').map(function (row) {
    var meeting = kspGpWorkspaceMeeting_(row, maps);
    return {
      meetingId: meeting.meetingId,
      date: meeting.date,
      fundStrategy: meeting.fundStrategy,
      status: meeting.status,
      documentUrl: meeting.documentUrl,
      pitchbooks: kspMaintenanceSplitCodes_(row.Related_Pitchbook_IDs).map(function (documentId) {
        var candidates = byId[documentId] || [];
        if (candidates.length !== 1) return { documentId: documentId, unresolved: true };
        var target = candidates[0];
        var pitchbook = kspGpWorkspacePitchbook_(target, maps);
        return {
          documentId: documentId,
          unresolved: false,
          savedFilename: pitchbook.savedFilename,
          status: pitchbook.status,
          fileUrl: pitchbook.fileUrl
        };
      })
    };
  });
}

function kspBuildGpWorkspaceData_(gpId, gpRows, optionRows, meetingRows, pitchbookRows) {
  var normalizedGpId = String(gpId || '').trim();
  kspAssert_(normalizedGpId, 'GP_WORKSPACE_GP_REQUIRED', 'GPを選択してください。');
  var matches = (gpRows || []).filter(function (row) {
    return String(row.GP_ID || '') === normalizedGpId;
  });
  kspAssert_(matches.length <= 1, 'DUPLICATE_KEY_ROWS', '同じGP IDの行が複数あります。');
  kspAssert_(matches.length === 1, 'GP_WORKSPACE_GP_NOT_FOUND', '指定されたGPがありません。');

  var gpRow = matches[0];
  var maps = kspBuildAllMasterMaps_(gpRows || [], optionRows || []);
  var selectedMeetings = (meetingRows || []).filter(function (row) {
    return kspMeetingCounterpartyType_(row) === 'GP' &&
      kspMeetingCounterpartyId_(row) === normalizedGpId &&
      String(row.GP_ID || '') === normalizedGpId;
  });
  var selectedPitchbooks = (pitchbookRows || []).filter(function (row) {
    return String(row.GP_ID || '') === normalizedGpId;
  });
  var sortedMeetings = kspGpWorkspaceSortRows_(selectedMeetings, 'Meeting_ID');
  var sortedPitchbooks = kspGpWorkspaceSortRows_(selectedPitchbooks, 'Document_ID');
  var activeFollowUps = sortedMeetings.filter(function (row) {
    return String(row.Status || '') === KSP_STATUS.ACTIVE &&
      kspToBoolean_(row.Follow_Up_Required, false);
  });
  var fundStrategies = kspGpWorkspaceFundStrategies_(selectedMeetings, selectedPitchbooks);
  var relationships = kspGpWorkspaceRelationships_(selectedMeetings, pitchbookRows || [], maps);

  return {
    ok: true,
    gp: {
      id: normalizedGpId,
      name: String(gpRow.GP_Name || ''),
      status: String(gpRow.Status || '')
    },
    summary: {
      meetingTotal: selectedMeetings.length,
      meetingActive: selectedMeetings.filter(function (row) { return String(row.Status || '') === KSP_STATUS.ACTIVE; }).length,
      pitchbookTotal: selectedPitchbooks.length,
      pitchbookActive: selectedPitchbooks.filter(function (row) { return String(row.Status || '') === KSP_STATUS.ACTIVE; }).length,
      activeFollowUpCount: activeFollowUps.length,
      lastMeetingDate: sortedMeetings.length ? kspMaintenanceCellText_(sortedMeetings[0].Date, 'date') : ''
    },
    fundStrategies: fundStrategies.slice(0, KSP_GP_WORKSPACE_LIMITS.FUND_STRATEGIES),
    recentMeetings: sortedMeetings.slice(0, KSP_GP_WORKSPACE_LIMITS.RECENT_MEETINGS)
      .map(function (row) { return kspGpWorkspaceMeeting_(row, maps); }),
    recentPitchbooks: sortedPitchbooks.slice(0, KSP_GP_WORKSPACE_LIMITS.RECENT_PITCHBOOKS)
      .map(function (row) { return kspGpWorkspacePitchbook_(row, maps); }),
    followUps: activeFollowUps.slice(0, KSP_GP_WORKSPACE_LIMITS.FOLLOW_UPS)
      .map(function (row) {
        var meeting = kspGpWorkspaceMeeting_(row, maps);
        meeting.followUpNote = String(row.Follow_Up_Note || '');
        return meeting;
      }),
    relationships: relationships.slice(0, KSP_GP_WORKSPACE_LIMITS.RELATIONSHIPS),
    omittedCounts: {
      fundStrategies: Math.max(0, fundStrategies.length - KSP_GP_WORKSPACE_LIMITS.FUND_STRATEGIES),
      recentMeetings: Math.max(0, sortedMeetings.length - KSP_GP_WORKSPACE_LIMITS.RECENT_MEETINGS),
      recentPitchbooks: Math.max(0, sortedPitchbooks.length - KSP_GP_WORKSPACE_LIMITS.RECENT_PITCHBOOKS),
      followUps: Math.max(0, activeFollowUps.length - KSP_GP_WORKSPACE_LIMITS.FOLLOW_UPS),
      relationships: Math.max(0, relationships.length - KSP_GP_WORKSPACE_LIMITS.RELATIONSHIPS)
    }
  };
}

function kspGetGpWorkspaceData_(environment, gpId) {
  try {
    var state = environment.getInstallationState();
    kspAssert_(state && state.resources, 'INSTALLATION_STATE_MISSING', 'Installation stateがありません。');
    var backendSpreadsheetId = state.resources[KSP_RESOURCE_KEYS.BACKEND_SPREADSHEET];
    kspAssert_(backendSpreadsheetId, 'BACKEND_SPREADSHEET_MISSING', 'Backend Spreadsheetがありません。');
    return kspBuildGpWorkspaceData_(
      gpId,
      environment.readRows(backendSpreadsheetId, KSP_SHEET_NAMES.GP_MASTER),
      environment.readRows(backendSpreadsheetId, KSP_SHEET_NAMES.OPTION_MASTER),
      environment.readRows(backendSpreadsheetId, KSP_SHEET_NAMES.MEETING_INDEX),
      environment.readRows(backendSpreadsheetId, KSP_SHEET_NAMES.PITCHBOOK_INDEX)
    );
  } catch (error) {
    var code = kspGetErrorCode_(error);
    return {
      ok: false,
      error: { code: code, message: kspSafePublicErrorMessage_(code, 'WORKSPACE') }
    };
  }
}
