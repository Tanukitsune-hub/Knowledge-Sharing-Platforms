function doGet(event) {
  var page = event && event.parameter ? String(event.parameter.page || '') : '';
  var webAppUrl = String(ScriptApp.getService().getUrl() || '');
  kspAssert_(webAppUrl, 'WEB_APP_URL_UNAVAILABLE', 'Web App URLを確認できません。');

  if (page === 'knowledge') {
    var evaluatedKnowledge = HtmlService.createTemplateFromFile('KnowledgeSearch').evaluate();
    var knowledgeHtml = evaluatedKnowledge.getContent()
      .replace(
        '<button id="knowledge-back" type="button">登録・管理へ戻る</button>',
        '<a id="knowledge-back" href="' + webAppUrl + '" target="_top">登録・管理へ戻る</a>'
      )
      .replace(
        "kEl('knowledge-back').onclick=()=>{window.location.search=''};",
        ''
      );
    return HtmlService.createHtmlOutput(knowledgeHtml)
      .setTitle('ナレッジ検索 | Knowledge Sharing Platforms')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.DEFAULT);
  }

  var evaluated = HtmlService.createTemplateFromFile('Index').evaluate();
  var html = evaluated.getContent().replace(
    '</nav>',
    '<a id="nav-knowledge" href="' + webAppUrl + '?page=knowledge" target="_top">ナレッジ検索</a></nav>'
  );
  return HtmlService.createHtmlOutput(html)
    .setTitle('Knowledge Sharing Platforms')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.DEFAULT);
}

function include_(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
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

function runAuditRetentionCleanup_() {
  return kspRunAuditRetentionCleanup_(kspCreateMaintenanceEnvironment_());
}

function getPhase1Diagnostics_() {
  return kspGetPhase1Diagnostics_(kspCreateMaintenanceEnvironment_());
}
