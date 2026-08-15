var KSP_PITCHBOOK_WORK_ID = '0006';
var KSP_PITCHBOOK_APP_VERSION = '0.3.0';
var KSP_PITCHBOOK_DRAFT_TTL_MS = 24 * 60 * 60 * 1000;

var KSP_PITCHBOOK_LIMITS = Object.freeze({
  FILE_BYTES: 25 * 1024 * 1024,
  FILE_COUNT: 10,
  TOTAL_BYTES: 100 * 1024 * 1024
});

var KSP_PITCHBOOK_ALLOWED_EXTENSIONS = Object.freeze([
  'pdf', 'pptx', 'xlsx', 'docx', 'txt', 'eml'
]);

var KSP_PITCHBOOK_STATUS = Object.freeze({
  PENDING: 'Pending',
  ACTIVE: 'Active',
  FAILED: 'Failed',
  INACTIVE: 'Inactive'
});

var KSP_PITCHBOOK_ACTIONS = Object.freeze({
  REGISTER: 'PITCHBOOK_REGISTER',
  RETRY: 'PITCHBOOK_RETRY'
});
