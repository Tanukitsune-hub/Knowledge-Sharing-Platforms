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

function kspGpWorkspaceCompatibility_(data) {
  var direct = data.meetings.direct;
  var allMeetings = data.meetings.all;
  var selectedPitchbooks = data.pitchbooks;
  var fundStrategies = data.fundStrategies.records || [];
  return {
    ok: true,
    gp: {
      id: data.entity.counterpartyId,
      name: data.entity.name,
      status: data.entity.status
    },
    summary: {
      meetingTotal: direct.totalCount,
      meetingActive: data.summary.activeMeetingCount,
      pitchbookTotal: selectedPitchbooks.totalCount,
      pitchbookActive: data.summary.pitchbookActiveCount,
      activeFollowUpCount: data.summary.openFollowUpCount,
      lastMeetingDate: data.summary.latestDirectMeetingDate
    },
    fundStrategies: fundStrategies.map(function (item) {
      return {
        text: item.text,
        meetingCount: item.meetingCount,
        pitchbookCount: item.pitchbookCount,
        latestDate: item.latestDate
      };
    }),
    recentMeetings: allMeetings.records.map(function (item) {
      return Object.assign({}, item, {
        meetingTypeLabels: item.meetingTypeLabels || [],
        relatedPitchbookIds: item.relatedPitchbookIds || []
      });
    }),
    recentPitchbooks: selectedPitchbooks.records.map(function (item) {
      return Object.assign({}, item, { savedFilename: item.savedFilename || item.originalFilename });
    }),
    followUps: data.followUps.records,
    relationships: (data.relationships || []).map(function (item) {
      return Object.assign({}, item, { pitchbooks: item.relatedPitchbooks || [] });
    }),
    omittedCounts: {
      fundStrategies: data.fundStrategies.omittedCount,
      recentMeetings: allMeetings.omittedCount,
      recentPitchbooks: selectedPitchbooks.omittedCount,
      followUps: data.followUps.omittedCount,
      relationships: data.omittedCounts.relationships
    }
  };
}

function kspBuildGpWorkspaceData_(gpId, gpRows, optionRows, meetingRows, pitchbookRows) {
  var normalizedGpId = String(gpId || '').trim();
  kspAssert_(normalizedGpId, 'GP_WORKSPACE_GP_REQUIRED', 'GPを選択してください。');
  var matches = (gpRows || []).filter(function (row) {
    return String(row.GP_ID || '') === normalizedGpId;
  });
  kspAssert_(matches.length <= 1, 'DUPLICATE_KEY_ROWS', '同じGP IDの行が複数あります。');
  kspAssert_(matches.length === 1, 'GP_WORKSPACE_GP_NOT_FOUND', '指定されたGPがありません。');
  return kspGpWorkspaceCompatibility_(kspBuildEntityWorkspaceData_({
    entityKey: 'GP:' + normalizedGpId
  }, gpRows, optionRows, meetingRows, pitchbookRows, { meetingScope: 'direct' }));
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
