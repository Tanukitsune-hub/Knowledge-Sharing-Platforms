var KSP_PITCHBOOK_WORK_ID = '0006';
var KSP_PITCHBOOK_APP_VERSION = '0.3.0';
var KSP_PITCHBOOK_DRAFT_TTL_MS = 24 * 60 * 60 * 1000;
var KSP_PITCHBOOK_FUND_STRATEGY_MAX_LENGTH = 500;

var KSP_PITCHBOOK_LIMITS = Object.freeze({
  FILE_BYTES: 25 * 1024 * 1024,
  FILE_COUNT: 10,
  TOTAL_BYTES: 100 * 1024 * 1024
});

var KSP_SOURCE_UPLOAD_FORMAT_REGISTRY = Object.freeze({
  pdf: Object.freeze({ mimeType: 'application/pdf', acceptedMimeTypes: Object.freeze(['application/pdf', 'application/octet-stream']) }),
  pptx: Object.freeze({ mimeType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation', acceptedMimeTypes: Object.freeze(['application/vnd.openxmlformats-officedocument.presentationml.presentation', 'application/octet-stream']) }),
  xlsx: Object.freeze({ mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', acceptedMimeTypes: Object.freeze(['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/octet-stream']) }),
  docx: Object.freeze({ mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', acceptedMimeTypes: Object.freeze(['application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/octet-stream']) }),
  txt: Object.freeze({ mimeType: 'text/plain', acceptedMimeTypes: Object.freeze(['text/plain', 'application/octet-stream']) }),
  eml: Object.freeze({ mimeType: 'message/rfc822', acceptedMimeTypes: Object.freeze(['message/rfc822', 'application/octet-stream', 'text/plain']) })
});

var KSP_PITCHBOOK_ALLOWED_EXTENSIONS = Object.freeze(Object.keys(KSP_SOURCE_UPLOAD_FORMAT_REGISTRY));

function kspGetSourceUploadFormats_() {
  return KSP_PITCHBOOK_ALLOWED_EXTENSIONS.map(function (extension) {
    return { extension: extension, mimeType: KSP_SOURCE_UPLOAD_FORMAT_REGISTRY[extension].mimeType,
      acceptedMimeTypes: KSP_SOURCE_UPLOAD_FORMAT_REGISTRY[extension].acceptedMimeTypes.slice() };
  });
}

function kspValidateSourceUploadMime_(extension, mimeType) {
  var format = KSP_SOURCE_UPLOAD_FORMAT_REGISTRY[String(extension || '').toLowerCase()];
  kspAssert_(format, 'SOURCE_UPLOAD_EXTENSION_UNSUPPORTED', '対応していないファイル形式です。');
  var normalized = String(mimeType || 'application/octet-stream').split(';')[0].trim().toLowerCase();
  kspAssert_(format.acceptedMimeTypes.indexOf(normalized) !== -1,
    'SOURCE_UPLOAD_MIME_MISMATCH', '拡張子とMIME形式が一致しません。');
  return normalized;
}

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
