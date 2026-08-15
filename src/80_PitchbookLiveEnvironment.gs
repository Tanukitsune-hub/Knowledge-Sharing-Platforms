var KSP_PITCHBOOK_RESERVATION_PREFIX = 'KSP_PITCHBOOK_BATCH_';
var KSP_PITCHBOOK_UPLOAD_CLAIM_TTL_MS = 10 * 60 * 1000;

function kspCreatePitchbookEnvironment() {
  var environment = kspCreateMeetingEnvironment();
  var scriptProperties = PropertiesService.getScriptProperties();
  kspAttachPitchbookReservationAdapters(environment, scriptProperties);
  kspAttachPitchbookClaimAdapters(environment, scriptProperties);
  kspAttachPitchbookDriveAdapters(environment);
  kspAttachPitchbookIndexAdapters(environment, scriptProperties);
  return environment;
}
