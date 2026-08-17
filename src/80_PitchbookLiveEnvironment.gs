var KSP_PITCHBOOK_RESERVATION_PREFIX = 'KSP_PITCHBOOK_BATCH_';
var KSP_PITCHBOOK_UPLOAD_CLAIM_TTL_MS = 10 * 60 * 1000;

function kspCreatePitchbookEnvironment_() {
  var environment = kspCreateMeetingEnvironment_();
  var scriptProperties = PropertiesService.getScriptProperties();
  kspAttachPitchbookReservationAdapters_(environment, scriptProperties);
  kspAttachPitchbookClaimAdapters_(environment, scriptProperties);
  kspAttachPitchbookDriveAdapters_(environment);
  kspAttachPitchbookIndexAdapters_(environment, scriptProperties);
  return environment;
}
