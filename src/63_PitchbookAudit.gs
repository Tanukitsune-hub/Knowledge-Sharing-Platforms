function kspBuildPitchbookAuditRow_(params) {
  var options = params || {};
  var row = options.row || {};
  var success = options.result === KSP_AUDIT_RESULTS.SUCCESS;
  var metadata = {
    Batch_ID: row.Batch_ID || '',
    Document_ID: row.Document_ID || '',
    Date: row.Date || '',
    GP_ID: row.GP_ID || '',
    Asset_Class_ID: row.Asset_Class_ID || '',
    Capital_Type_ID: row.Capital_Type_ID || '',
    Sequence_No: row.Sequence_No || '',
    File_ID: row.File_ID || '',
    File_URL: row.File_URL || '',
    Original_Filename: row.Original_Filename || '',
    Saved_Filename: row.Saved_Filename || '',
    Status: row.Status || ''
  };
  return {
    Event_Timestamp: options.timestamp || '',
    Actor: options.actor || 'UNIDENTIFIED',
    Action: options.action || KSP_PITCHBOOK_ACTIONS.REGISTER,
    Target_Type: 'Pitchbook',
    Target_ID: row.Document_ID || options.documentId || '',
    Result: options.result || KSP_AUDIT_RESULTS.FAILURE,
    Changed_Fields: success ? Object.keys(metadata).filter(function (key) { return metadata[key] !== ''; }).join(',') : '',
    Before_Metadata_JSON: '',
    After_Metadata_JSON: success ? JSON.stringify(metadata) : '',
    Batch_ID: row.Batch_ID || options.batchId || '',
    Error_Code: options.errorCode || '',
    Error_Message: options.errorCode ? kspSafePublicErrorMessage_(options.errorCode, 'PITCHBOOK') : '',
    Search_Mode: '', Question_Or_Instruction: '', Date_From: '', Date_To: '', GP_Filter: '',
    Asset_Class_Filter: '', Capital_Type_Filter: '', Source_Type_Filter: '', Model_ID: '', Cited_Source_IDs: ''
  };
}

function kspBuildPitchbookBootstrapResponse_(catalog) {
  return {
    ok: true,
    workId: KSP_PITCHBOOK_WORK_ID,
    appVersion: KSP_PITCHBOOK_APP_VERSION,
    draftTtlMs: KSP_PITCHBOOK_DRAFT_TTL_MS,
    limits: {
      fileBytes: KSP_PITCHBOOK_LIMITS.FILE_BYTES,
      fileCount: KSP_PITCHBOOK_LIMITS.FILE_COUNT,
      totalBytes: KSP_PITCHBOOK_LIMITS.TOTAL_BYTES
    },
    allowedExtensions: KSP_PITCHBOOK_ALLOWED_EXTENSIONS.slice(),
    options: {
      gps: kspDeepClone_(catalog.gps),
      assetClasses: kspDeepClone_(catalog.assetClasses),
      capitalTypes: kspDeepClone_(catalog.capitalTypes)
    }
  };
}
