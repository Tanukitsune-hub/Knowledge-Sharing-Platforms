function doGet(event) {
  var page = event && event.parameter ? String(event.parameter.page || '') : '';

  // Unlinked operator surface. The RPC's server authorization, not this route,
  // is the security boundary. Rendering never performs confirmation.
  if (page === 'deployment-security') {
    return kspCreateHtmlTemplate_('DeploymentSecurityOperator').evaluate()
      .setTitle('デプロイ設定の確認 | Knowledge Sharing Platforms')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.DEFAULT);
  }

  if (page === 'knowledge') {
    return kspCreateHtmlTemplate_('KnowledgeSearch').evaluate()
      .setTitle('ナレッジ検索 | Knowledge Sharing Platforms')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.DEFAULT);
  }

  return kspCreateHtmlTemplate_('Index').evaluate()
    .setTitle('Knowledge Sharing Platforms')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.DEFAULT);
}

function include_(filename) {
  return kspReadHtmlResource_(filename);
}

function getMeetingBootstrapData() {
  return kspGetMeetingBootstrapData_(kspCreateMeetingEnvironment_());
}

function registerMeeting(input) {
  return kspRegisterMeeting_(kspCreateMeetingEnvironment_(), input);
}

function getPitchbookBootstrapData() {
  return kspGetPitchbookBootstrapData_(kspCreatePitchbookEnvironment_());
}

function preparePitchbookBatch(input) {
  return kspPreparePitchbookBatch_(kspCreatePitchbookEnvironment_(), input);
}

function uploadPitchbookFile(input) {
  return kspUploadPitchbookFile_(kspCreatePitchbookEnvironment_(), input);
}

function getPhase1MaintenanceBootstrapData() {
  return kspGetPhase1MaintenanceBootstrap_(kspCreateMaintenanceEnvironment_());
}

function searchMeetingRecords(input) {
  if (input === undefined) kspObserveSyntheticTemporalReadback_();
  return kspSearchMeetingRecords_(kspCreateMaintenanceEnvironment_(), input);
}

// Temporary CODEX-23 editor-only observation; removed before the final candidate.
function kspObserveSyntheticTemporalReadback_() {
  var environment = kspCreateMaintenanceEnvironment_();
  var state = environment.getInstallationState();
  var active = Session.getActiveUser().getEmail();
  if (!active || active !== Session.getEffectiveUser().getEmail() ||
      !state || !state.config || state.config.adminEmails.indexOf(active) === -1) return;
  var sheet = SpreadsheetApp.openById(state.resources[KSP_RESOURCE_KEYS.BACKEND_SPREADSHEET]).getSheetByName('Meeting_Index');
  if (sheet.getLastRow() !== 3) return;
  var headers = kspReadHeadersFromSheet_(sheet);
  var rows = sheet.getRange(2, 1, 2, headers.length).getValues();
  if (rows[0][headers.indexOf('Fund_Strategy')] !== 'SYNTHETIC CODEX22 GP' ||
      rows[1][headers.indexOf('Fund_Strategy')] !== 'SYNTHETIC CODEX22 non-GP') return;
  var zone = sheet.getParent().getSpreadsheetTimeZone();
  var display = sheet.getRange(2, 2, 2, 2).getDisplayValues();
  var mapped = kspReadObjectsFromSheet_(sheet, headers);
  rows.forEach(function (row, index) {
    ['Date', 'Time'].forEach(function (field, column) {
      var value = row[headers.indexOf(field)];
      var pattern = field === 'Date' ? 'yyyy-MM-dd' : 'HH:mm';
      console.log(JSON.stringify({probe:'CODEX23_TEMPORAL',row:index + 1,field:field,
        type:Object.prototype.toString.call(value),instant:value instanceof Date ? value.toISOString() : '',
        workbookZone:zone,scriptZone:Session.getScriptTimeZone(),display:display[index][column],
        workbookFormat:Utilities.formatDate(value, zone, pattern),gmtFormat:Utilities.formatDate(value, 'GMT', pattern),
        appFormat:Utilities.formatDate(value, KSP_DEFAULTS.TIMEZONE, pattern),adapter:mapped[index][field]}));
    });
  });
}

function getMeetingMaintenanceRecord(meetingId) {
  return kspGetMeetingMaintenanceRecord_(kspCreateMaintenanceEnvironment_(), meetingId);
}

function updateMeetingMaintenance(input) {
  return kspUpdateMeetingMaintenance_(kspCreateMaintenanceEnvironment_(), input);
}

function changeMeetingStatus(input) {
  return kspChangeMeetingStatus_(kspCreateMaintenanceEnvironment_(), input);
}

function searchPitchbookRecords(input) {
  return kspSearchPitchbookRecords_(kspCreateMaintenanceEnvironment_(), input);
}

function getPitchbookMaintenanceRecord(documentId) {
  return kspGetPitchbookMaintenanceRecord_(kspCreateMaintenanceEnvironment_(), documentId);
}

function updatePitchbookMaintenance(input) {
  return kspUpdatePitchbookMaintenance_(kspCreateMaintenanceEnvironment_(), input);
}

function changePitchbookStatus(input) {
  return kspChangePitchbookStatus_(kspCreateMaintenanceEnvironment_(), input);
}

function mutateMaster(input) {
  return kspMutateMaster_(kspCreateMaintenanceEnvironment_(), input);
}

function quickAddGp(name) {
  return kspQuickAddGp_(kspCreateMaintenanceEnvironment_(), name);
}

function updateMeetingRelations(input) {
  return kspUpdateMeetingRelations_(kspCreateMaintenanceEnvironment_(), input);
}

function getGpWorkspaceData(gpId) {
  return kspGetGpWorkspaceData_(kspCreateGpWorkspaceEnvironment_(), gpId);
}

function getEntityWorkspaceData(input) {
  return kspGetEntityWorkspaceData_(kspCreateEntityWorkspaceEnvironment_(), input);
}

function getMeetingActivityAnalytics(input) {
  return kspGetMeetingActivityAnalytics_(kspCreateActivityAnalyticsEnvironment_(), input);
}

function getRelationshipExplorerData(input) {
  return kspGetRelationshipExplorerData_(kspCreateRelationshipExplorerEnvironment_(), input);
}

function updateMeetingAdminCheck(input) {
  return kspUpdateMeetingAdminCheck_(kspCreateActivityAnalyticsEnvironment_(), input);
}

function runAuditRetentionCleanup_() {
  return kspRunAuditRetentionCleanup_(kspCreateMaintenanceEnvironment_());
}

function getPhase1Diagnostics_() {
  return kspGetPhase1Diagnostics_(kspCreateMaintenanceEnvironment_());
}
