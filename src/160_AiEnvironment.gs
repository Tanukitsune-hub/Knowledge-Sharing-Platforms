function kspCreateAiEnvironment_() {
  var base = kspCreateMaintenanceEnvironment_();
  var scriptProperties = PropertiesService.getScriptProperties();

  base.loadAiContext = function () {
    var state = base.getInstallationState();
    kspAssert_(state && state.resources, 'INSTALLATION_STATE_MISSING', 'Installation stateがありません。');
    var backendSpreadsheetId = state.resources[KSP_RESOURCE_KEYS.BACKEND_SPREADSHEET];
    var auditSpreadsheetId = state.resources[KSP_RESOURCE_KEYS.AUDIT_SPREADSHEET];
    kspAssert_(backendSpreadsheetId, 'BACKEND_SPREADSHEET_MISSING', 'Backend Spreadsheetがありません。');
    kspAssert_(auditSpreadsheetId, 'AUDIT_SPREADSHEET_MISSING', 'Audit Spreadsheetがありません。');
    return {
      state: state,
      backendSpreadsheetId: backendSpreadsheetId,
      auditSpreadsheetId: auditSpreadsheetId,
      settings: kspReadSettingsMapLive_(backendSpreadsheetId),
      meetingRows: base.readRows(backendSpreadsheetId, KSP_SHEET_NAMES.MEETING_INDEX),
      pitchbookRows: base.readRows(backendSpreadsheetId, KSP_SHEET_NAMES.PITCHBOOK_INDEX),
      gpRows: base.readRows(backendSpreadsheetId, KSP_SHEET_NAMES.GP_MASTER),
      optionRows: base.readRows(backendSpreadsheetId, KSP_SHEET_NAMES.OPTION_MASTER)
    };
  };

  base.ensureAiSettings = function (rows) {
    var state = base.getInstallationState();
    var spreadsheetId = state.resources[KSP_RESOURCE_KEYS.BACKEND_SPREADSHEET];
    return kspUpsertMissingSettingsLive_(spreadsheetId, rows || []);
  };

  base.ensureFileSearchStore = function (settings, displayName) {
    if (settings.storeName) return base.getFileSearchStore(settings.storeName);
    var created = base.createFileSearchStore(
      kspBuildFileSearchStoreCreateRequest_(displayName, settings.embeddingModel)
    );
    kspWriteSettingLive_(
      base.getInstallationState().resources[KSP_RESOURCE_KEYS.BACKEND_SPREADSHEET],
      KSP_AI_SETTINGS.STORE_NAME,
      created.name,
      base.nowIso()
    );
    return created;
  };

  base.getFileSearchStore = function (storeName) {
    return kspNormalizeFileSearchStore_(kspGeminiJsonRequestLive_('GET', '/' + kspAiStoreResourcePath_(storeName), null));
  };

  base.createFileSearchStore = function (request) {
    return kspNormalizeFileSearchStore_(kspGeminiJsonRequestLive_('POST', KSP_AI_API.STORES_PATH, request));
  };

  base.findFileSearchDocumentsBySource = function (storeName, sourceId) {
    return kspListAllFileSearchDocumentsLive_(storeName).filter(function (documentValue) {
      return String(documentValue.customMetadata.source_id || '') === String(sourceId);
    });
  };

  base.deleteFileSearchDocument = function (storeName, documentName) {
    var normalizedStore = kspAiStoreResourcePath_(storeName);
    var name = kspAiTrim_(documentName);
    kspAssert_(name.indexOf(normalizedStore + '/documents/') === 0, 'AI_DOCUMENT_STORE_MISMATCH',
      'File Search Document does not belong to the configured Store.');
    kspGeminiJsonRequestLive_('DELETE', '/' + name + '?force=true', null);
    return true;
  };

  base.uploadSourceToFileSearchStore = function (storeName, source) {
    return kspUploadSourceLive_(storeName, source);
  };

  base.queryFileSearch = function (request) {
    return kspGeminiJsonRequestLive_('POST', KSP_AI_API.INTERACTIONS_PATH, request);
  };

  base.readMeetingText = function (fileId) {
    kspAssert_(fileId, 'AI_MEETING_DOC_MISSING', 'Meeting Google Docがありません。');
    return DocumentApp.openById(fileId).getBody().getText();
  };

  base.readTextFile = function (fileId) {
    kspAssert_(fileId, 'AI_PITCHBOOK_FILE_MISSING', 'Pitchbook source fileがありません。');
    var response = UrlFetchApp.fetch('https://www.googleapis.com/drive/v3/files/' + encodeURIComponent(fileId) + '?alt=media', {
      method: 'get',
      headers: { Authorization: 'Bearer ' + ScriptApp.getOAuthToken() },
      muteHttpExceptions: true
    });
    kspAssert_(response.getResponseCode() >= 200 && response.getResponseCode() < 300,
      'AI_SOURCE_READ_FAILED', 'TXT sourceを読み込めませんでした。');
    return response.getContentText('UTF-8');
  };

  base.hashText = function (text) {
    var digest = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, String(text || ''), Utilities.Charset.UTF_8);
    return digest.map(function (value) { return ('0' + ((value + 256) % 256).toString(16)).slice(-2); }).join('');
  };

  base.updateAiRow = function (sourceType, sourceId, patch) {
    var context = base.loadAiContext();
    var sheetName = sourceType === KSP_AI_SOURCE_TYPES.MEETING
      ? KSP_SHEET_NAMES.MEETING_INDEX
      : KSP_SHEET_NAMES.PITCHBOOK_INDEX;
    var keyColumn = sourceType === KSP_AI_SOURCE_TYPES.MEETING ? 'Meeting_ID' : 'Document_ID';
    return kspUpdateRowPatchLive_(context.backendSpreadsheetId, sheetName, keyColumn, sourceId, patch);
  };

  base.claimAiSource = function (sourceType, sourceId, nowIso, ttlMillis) {
    return kspClaimAiSourceLive_(scriptProperties, sourceType, sourceId, nowIso, ttlMillis);
  };

  base.releaseAiSourceClaim = function (sourceType, sourceId, token) {
    return kspReleaseAiSourceClaimLive_(scriptProperties, sourceType, sourceId, token);
  };

  base.appendAuditRow = function (spreadsheetId, row) {
    return base.appendRow(spreadsheetId, KSP_SHEET_NAMES.AUDIT_LOG, row);
  };

  return base;
}
