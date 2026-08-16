function doGet(event) {
  var page = event && event.parameter ? String(event.parameter.page || '') : '';
  if (page === 'knowledge') {
    return HtmlService.createTemplateFromFile('KnowledgeSearch').evaluate()
      .setTitle('ナレッジ検索 | Knowledge Sharing Platforms')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.DEFAULT);
  }

  var evaluated = HtmlService.createTemplateFromFile('Index').evaluate();
  var html = evaluated.getContent().replace(
    '</nav>',
    '<button id="nav-knowledge" type="button" onclick="window.location.search=\'?page=knowledge\'">ナレッジ検索</button></nav>'
  );
  return HtmlService.createHtmlOutput(html)
    .setTitle('Knowledge Sharing Platforms')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.DEFAULT);
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

function getMeetingBootstrapData() {
  return kspGetMeetingBootstrapData(kspCreateMeetingEnvironment());
}

function registerMeeting(input) {
  return kspRegisterMeeting(kspCreateMeetingEnvironment(), input);
}

function getPitchbookBootstrapData() {
  return kspGetPitchbookBootstrapData(kspCreatePitchbookEnvironment());
}

function preparePitchbookBatch(input) {
  return kspPreparePitchbookBatch(kspCreatePitchbookEnvironment(), input);
}

function uploadPitchbookFile(input) {
  return kspUploadPitchbookFile(kspCreatePitchbookEnvironment(), input);
}

function getPhase1MaintenanceBootstrapData() {
  return kspGetPhase1MaintenanceBootstrap(kspCreateMaintenanceEnvironment());
}

function searchMeetingRecords(input) {
  return kspSearchMeetingRecords(kspCreateMaintenanceEnvironment(), input);
}

function getMeetingMaintenanceRecord(meetingId) {
  return kspGetMeetingMaintenanceRecord(kspCreateMaintenanceEnvironment(), meetingId);
}

function updateMeetingMaintenance(input) {
  return kspUpdateMeetingMaintenance(kspCreateMaintenanceEnvironment(), input);
}

function changeMeetingStatus(input) {
  return kspChangeMeetingStatus(kspCreateMaintenanceEnvironment(), input);
}

function searchPitchbookRecords(input) {
  return kspSearchPitchbookRecords(kspCreateMaintenanceEnvironment(), input);
}

function getPitchbookMaintenanceRecord(documentId) {
  return kspGetPitchbookMaintenanceRecord(kspCreateMaintenanceEnvironment(), documentId);
}

function updatePitchbookMaintenance(input) {
  return kspUpdatePitchbookMaintenance(kspCreateMaintenanceEnvironment(), input);
}

function changePitchbookStatus(input) {
  return kspChangePitchbookStatus(kspCreateMaintenanceEnvironment(), input);
}

function mutateMaster(input) {
  return kspMutateMaster(kspCreateMaintenanceEnvironment(), input);
}

function quickAddGp(name) {
  return kspQuickAddGp(kspCreateMaintenanceEnvironment(), name);
}

function runAuditRetentionCleanup() {
  return kspRunAuditRetentionCleanup(kspCreateMaintenanceEnvironment());
}

function getPhase1Diagnostics() {
  return kspGetPhase1Diagnostics(kspCreateMaintenanceEnvironment());
}
