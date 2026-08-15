function doGet() {
  return HtmlService.createTemplateFromFile('Index').evaluate()
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

function getMaintenanceBootstrapData() {
  return kspGetMaintenanceBootstrapData(kspCreateMaintenanceEnvironment());
}

function searchMeetingRecords(filters) {
  return kspSearchMeetingRecords(kspCreateMaintenanceEnvironment(), filters);
}

function getMeetingRecord(meetingId) {
  return kspGetMeetingRecord(kspCreateMaintenanceEnvironment(), meetingId);
}

function updateMeetingRecord(input) {
  return kspUpdateMeetingRecord(kspCreateMaintenanceEnvironment(), input);
}

function setMeetingRecordStatus(input) {
  return kspSetMeetingRecordStatus(kspCreateMaintenanceEnvironment(), input);
}

function searchPitchbookRecords(filters) {
  return kspSearchPitchbookRecords(kspCreateMaintenanceEnvironment(), filters);
}

function getPitchbookRecord(documentId) {
  return kspGetPitchbookRecord(kspCreateMaintenanceEnvironment(), documentId);
}

function updatePitchbookRecord(input) {
  return kspUpdatePitchbookRecord(kspCreateMaintenanceEnvironment(), input);
}

function setPitchbookRecordStatus(input) {
  return kspSetPitchbookRecordStatus(kspCreateMaintenanceEnvironment(), input);
}

function getMasterData() {
  return kspGetMasterData(kspCreateMaintenanceEnvironment());
}

function addMasterItem(input) {
  return kspAddMasterItem(kspCreateMaintenanceEnvironment(), input);
}

function renameMasterItem(input) {
  return kspRenameMasterItem(kspCreateMaintenanceEnvironment(), input);
}

function setMasterItemStatus(input) {
  return kspSetMasterItemStatus(kspCreateMaintenanceEnvironment(), input);
}

function reorderOptionItems(input) {
  return kspReorderOptionItems(kspCreateMaintenanceEnvironment(), input);
}

function getPhase1Diagnostics() {
  return kspGetPhase1Diagnostics(kspCreateMaintenanceEnvironment());
}
