function doGet(event) {
  var page = event && event.parameter ? String(event.parameter.page || '') : '';

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
  return kspSearchMeetingRecords_(kspCreateMaintenanceEnvironment_(), input);
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
