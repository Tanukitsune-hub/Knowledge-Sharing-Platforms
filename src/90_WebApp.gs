function doGet() {
  return HtmlService.createHtmlOutputFromFile('Index')
    .setTitle('Knowledge Sharing Platforms')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.DEFAULT);
}

function getMeetingBootstrapData() {
  return kspGetMeetingBootstrapData(kspCreateMeetingEnvironment());
}

function registerMeeting(input) {
  return kspRegisterMeeting(kspCreateMeetingEnvironment(), input);
}
