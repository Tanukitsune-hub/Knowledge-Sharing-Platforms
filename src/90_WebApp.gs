function doGet(event) {
  var page = event && event.parameter ? String(event.parameter.page || '') : '';

  // Unlinked operator surface. The RPC's server authorization, not this route,
  // is the security boundary. Rendering never performs confirmation.
  if (page === 'deployment-security') {
    return kspCreateHtmlTemplate_('DeploymentSecurityOperator').evaluate()
      .setTitle('デプロイ設定の確認 | Alternative Assets Intelligence')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.DEFAULT);
  }

  if (page === 'knowledge') {
    var knowledgeTemplate = kspCreateHtmlTemplate_('KnowledgeSearch');
    knowledgeTemplate.themeHeadMarkup = kspGetThemeHeadMarkup_();
    return knowledgeTemplate.evaluate()
      .setTitle('ナレッジ検索 | Alternative Assets Intelligence')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.DEFAULT);
  }

  var indexTemplate = kspCreateHtmlTemplate_('Index');
  indexTemplate.themeHeadMarkup = kspGetThemeHeadMarkup_();
  return indexTemplate.evaluate()
    .setTitle('Alternative Assets Intelligence')
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

function getSourceRecordBootstrapData() {
  return kspGetSourceRecordBootstrapData_(kspCreateSourceRecordEnvironment_());
}

function registerNews(input) {
  return kspRegisterSourceRecord_(kspCreateSourceRecordEnvironment_(), 'NEWS', input);
}

function registerAssessment(input) {
  return kspRegisterSourceRecord_(kspCreateSourceRecordEnvironment_(), 'ASSESSMENT', input);
}

function searchNewsRecords(input) {
  return kspSearchSourceRecords_(kspCreateSourceRecordEnvironment_(), 'NEWS', input);
}

function searchAssessmentRecords(input) {
  return kspSearchSourceRecords_(kspCreateSourceRecordEnvironment_(), 'ASSESSMENT', input);
}

function getNewsMaintenanceRecord(newsId) {
  return kspGetSourceMaintenanceRecord_(kspCreateSourceRecordEnvironment_(), 'NEWS', newsId);
}

function getAssessmentMaintenanceRecord(assessmentId) {
  return kspGetSourceMaintenanceRecord_(kspCreateSourceRecordEnvironment_(), 'ASSESSMENT', assessmentId);
}

function updateNewsMaintenance(input) {
  return kspUpdateSourceMaintenance_(kspCreateSourceRecordEnvironment_(), 'NEWS', input);
}

function updateAssessmentMaintenance(input) {
  return kspUpdateSourceMaintenance_(kspCreateSourceRecordEnvironment_(), 'ASSESSMENT', input);
}

function changeNewsStatus(input) {
  return kspChangeSourceStatus_(kspCreateSourceRecordEnvironment_(), 'NEWS', input);
}

function changeAssessmentStatus(input) {
  return kspChangeSourceStatus_(kspCreateSourceRecordEnvironment_(), 'ASSESSMENT', input);
}

function mutateMaster(input) {
  return kspMutateMaster_(kspCreateMaintenanceEnvironment_(), input);
}

function quickAddCounterparty(input) {
  var source = input && typeof input === 'object' ? input : {};
  return kspQuickAddCounterparty_(kspCreateMaintenanceEnvironment_(), source.name, source.type);
}

function updateMeetingRelations(input) {
  return kspUpdateMeetingRelations_(kspCreateMaintenanceEnvironment_(), input);
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
