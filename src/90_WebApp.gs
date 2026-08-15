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
