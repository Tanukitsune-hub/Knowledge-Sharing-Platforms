var KSP_WORK_ID = '0004';
var KSP_APP_VERSION = '0.1.0';
var KSP_SCHEMA_VERSION = 1;

var KSP_PROPERTY_KEYS = Object.freeze({
  BOOTSTRAP_CONFIG_JSON: 'BOOTSTRAP_CONFIG_JSON',
  INSTALLATION_STATE_JSON: 'KSP_INSTALLATION_STATE_JSON',
  LAST_SETUP_REPORT_JSON: 'KSP_LAST_SETUP_REPORT_JSON'
});

var KSP_RESOURCE_NAMES = Object.freeze({
  KNOWLEDGE_ROOT: 'Private Assets Knowledge',
  MEETING_RECORDS: 'Meeting Records',
  PITCHBOOKS: 'Pitchbooks',
  BACKEND_SPREADSHEET: 'Knowledge Platform Backend',
  AUDIT_SPREADSHEET: 'Knowledge Platform Audit'
});

var KSP_RESOURCE_KEYS = Object.freeze({
  KNOWLEDGE_ROOT: 'knowledgeRootFolderId',
  MEETING_RECORDS: 'meetingRecordsFolderId',
  PITCHBOOKS: 'pitchbooksFolderId',
  BACKEND_SPREADSHEET: 'backendSpreadsheetId',
  AUDIT_SPREADSHEET: 'auditSpreadsheetId'
});

var KSP_MIME_TYPES = Object.freeze({
  FOLDER: 'application/vnd.google-apps.folder',
  SPREADSHEET: 'application/vnd.google-apps.spreadsheet'
});

var KSP_SHEET_NAMES = Object.freeze({
  GP_MASTER: 'GP_Master',
  OPTION_MASTER: 'Option_Master',
  MEETING_INDEX: 'Meeting_Index',
  PITCHBOOK_INDEX: 'Pitchbook_Index',
  SETTINGS: 'Settings',
  AUDIT_LOG: 'Audit_Log'
});

var KSP_STATUS = Object.freeze({
  ACTIVE: 'Active',
  INACTIVE: 'Inactive'
});

var KSP_AI_INDEX_STATUS = Object.freeze({
  NOT_INDEXED: 'NotIndexed',
  PENDING: 'Pending',
  INDEXED: 'Indexed',
  FAILED: 'Failed'
});

var KSP_DEFAULTS = Object.freeze({
  TIMEZONE: 'Asia/Tokyo',
  AI_SYNC_ENABLED: false,
  AI_SYNC_INTERVAL_MINUTES: 15,
  LOCK_TIMEOUT_MS: 30000
});

var KSP_TRIGGER_EVENT_TYPES = Object.freeze({
  CLOCK: 'CLOCK'
});
function kspDeepClone(value) {
  return value === undefined ? undefined : JSON.parse(JSON.stringify(value));
}

function kspIsPlainObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function kspNormalizeGeneratedNameSegment(value) {
  if (value === null || value === undefined) {
    return '';
  }

  return String(value)
    .replace(/[\u0000-\u001f\u007f]/g, '')
    .replace(/[\\/&]/g, '')
    .trim()
    .replace(/\s+/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '');
}

function kspEscapeDriveQueryLiteral(value) {
  return String(value).replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

function kspNormalizeEmailList(value) {
  if (!Array.isArray(value)) {
    return [];
  }

  var seen = {};
  return value
    .map(function (item) { return String(item || '').trim().toLowerCase(); })
    .filter(function (item) {
      if (!item || seen[item]) {
        return false;
      }
      seen[item] = true;
      return true;
    });
}

function kspToBoolean(value, defaultValue) {
  if (value === true || value === false) {
    return value;
  }
  if (value === 'true' || value === 1 || value === '1') {
    return true;
  }
  if (value === 'false' || value === 0 || value === '0') {
    return false;
  }
  return defaultValue;
}

function kspToPositiveInteger(value, defaultValue) {
  var numberValue = Number(value);
  if (!Number.isFinite(numberValue) || numberValue <= 0 || Math.floor(numberValue) !== numberValue) {
    return defaultValue;
  }
  return numberValue;
}

function kspSafeParseJson(text, label) {
  if (text === null || text === undefined || text === '') {
    return null;
  }
  try {
    return JSON.parse(text);
  } catch (error) {
    throw new Error((label || 'JSON') + ' is not valid JSON: ' + error.message);
  }
}

function kspStringifyError(error) {
  if (!error) {
    return 'Unknown error';
  }
  if (error.stack) {
    return String(error.stack);
  }
  if (error.message) {
    return String(error.message);
  }
  return String(error);
}

function kspCreateReport(mode, nowIso) {
  return {
    workId: KSP_WORK_ID,
    appVersion: KSP_APP_VERSION,
    schemaVersion: KSP_SCHEMA_VERSION,
    mode: mode,
    ok: true,
    startedAt: nowIso,
    finishedAt: null,
    environment: null,
    actions: [],
    warnings: [],
    errors: [],
    resources: {}
  };
}

function kspAddAction(report, category, resource, action, details) {
  report.actions.push({
    category: category,
    resource: resource,
    action: action,
    details: details || {}
  });
}

function kspAddWarning(report, code, message, details) {
  report.warnings.push({
    code: code,
    message: message,
    details: details || {}
  });
}

function kspAddError(report, code, message, details) {
  report.ok = false;
  report.errors.push({
    code: code,
    message: message,
    details: details || {}
  });
}

function kspFinalizeReport(report, nowIso) {
  report.finishedAt = nowIso;
  report.ok = report.errors.length === 0;
  return report;
}

function kspAssert(condition, code, message) {
  if (!condition) {
    var error = new Error(message);
    error.code = code;
    throw error;
  }
}

function kspGetErrorCode(error, fallback) {
  return error && error.code ? String(error.code) : (fallback || 'UNEXPECTED_ERROR');
}

function kspUniqueStrings(values) {
  var seen = {};
  return values.filter(function (value) {
    var key = String(value);
    if (seen[key]) {
      return false;
    }
    seen[key] = true;
    return true;
  });
}
function kspGetBackendSchemas() {
  var schemas = {};

  schemas[KSP_SHEET_NAMES.GP_MASTER] = [
    'GP_ID', 'GP_Name', 'Status', 'Created_At', 'Updated_At', 'Created_By', 'Updated_By'
  ];

  schemas[KSP_SHEET_NAMES.OPTION_MASTER] = [
    'Option_ID', 'Type', 'Name', 'Sort_Order', 'Status',
    'Created_At', 'Updated_At', 'Created_By', 'Updated_By'
  ];

  schemas[KSP_SHEET_NAMES.MEETING_INDEX] = [
    'Meeting_ID', 'Date', 'Time', 'Location_ID', 'GP_ID', 'Asset_Class_ID',
    'Capital_Type_ID', 'Counterparty', 'Internal_Participants', 'Doc_File_ID',
    'Doc_URL', 'Saved_Filename', 'Status', 'Version', 'Created_At', 'Updated_At',
    'Created_By', 'Updated_By', 'AI_Document_Name', 'AI_Index_Status',
    'AI_Indexed_At', 'AI_Content_Hash', 'AI_Last_Error'
  ];

  schemas[KSP_SHEET_NAMES.PITCHBOOK_INDEX] = [
    'Document_ID', 'Batch_ID', 'Date', 'GP_ID', 'Asset_Class_ID',
    'Capital_Type_ID', 'Sequence_No', 'File_ID', 'File_URL', 'Original_Filename',
    'Saved_Filename', 'Status', 'Created_At', 'Updated_At', 'Created_By',
    'Updated_By', 'AI_Document_Name', 'AI_Index_Status', 'AI_Indexed_At',
    'AI_Content_Hash', 'AI_Last_Error'
  ];

  schemas[KSP_SHEET_NAMES.SETTINGS] = [
    'Key', 'Value', 'Description', 'Updated_At'
  ];

  return schemas;
}

function kspGetAuditSchema() {
  var schema = {};
  schema[KSP_SHEET_NAMES.AUDIT_LOG] = [
    'Event_Timestamp', 'Actor', 'Action', 'Target_Type', 'Target_ID', 'Result',
    'Changed_Fields', 'Before_Metadata_JSON', 'After_Metadata_JSON', 'Batch_ID',
    'Error_Code', 'Error_Message', 'Search_Mode', 'Question_Or_Instruction',
    'Date_From', 'Date_To', 'GP_Filter', 'Asset_Class_Filter',
    'Capital_Type_Filter', 'Source_Type_Filter', 'Model_ID', 'Cited_Source_IDs'
  ];
  return schema;
}

function kspGetGpSeedDefinitions() {
  return [
    ['GP-000001', 'Advent International'],
    ['GP-000002', 'Apollo'],
    ['GP-000003', 'Ardian'],
    ['GP-000004', 'Audax'],
    ['GP-000005', 'Bain Capital'],
    ['GP-000006', 'Blackstone'],
    ['GP-000007', 'Brookfield'],
    ['GP-000008', 'Carlyle'],
    ['GP-000009', 'CD&R'],
    ['GP-000010', 'CVC'],
    ['GP-000011', 'EQT'],
    ['GP-000012', 'General Atlantic'],
    ['GP-000013', 'GIP'],
    ['GP-000014', 'H.I.G.'],
    ['GP-000015', 'HarbourVest'],
    ['GP-000016', 'Harrison Street'],
    ['GP-000017', 'Hines'],
    ['GP-000018', 'Insight Partners'],
    ['GP-000019', 'KKR'],
    ['GP-000020', 'Macquarie'],
    ['GP-000021', 'Neuberger Berman'],
    ['GP-000022', 'New Mountain Capital'],
    ['GP-000023', 'PAI Partners'],
    ['GP-000024', 'Partners Group'],
    ['GP-000025', 'Permira'],
    ['GP-000026', 'Silver Lake'],
    ['GP-000027', 'Stonepeak'],
    ['GP-000028', 'TPG'],
    ['GP-000029', 'Vista Equity Partners'],
    ['GP-000030', 'Warburg Pincus']
  ];
}

function kspGetOptionSeedDefinitions() {
  return [
    ['OPT-AC-001', 'ASSET_CLASS', 'PE', 1],
    ['OPT-AC-002', 'ASSET_CLASS', 'VC', 2],
    ['OPT-AC-003', 'ASSET_CLASS', 'Infrastructure', 3],
    ['OPT-AC-004', 'ASSET_CLASS', 'Real Estate', 4],
    ['OPT-AC-005', 'ASSET_CLASS', 'PD', 5],
    ['OPT-AC-006', 'ASSET_CLASS', 'その他', 6],
    ['OPT-CT-001', 'CAPITAL_TYPE', 'Equity', 1],
    ['OPT-CT-002', 'CAPITAL_TYPE', 'Debt', 2],
    ['OPT-LOC-001', 'LOCATION', '当社オフィス', 1],
    ['OPT-LOC-002', 'LOCATION', '先方オフィス', 2],
    ['OPT-LOC-003', 'LOCATION', 'セミナー / カンファレンス', 3],
    ['OPT-LOC-004', 'LOCATION', 'オンライン', 4],
    ['OPT-LOC-005', 'LOCATION', '会食', 5],
    ['OPT-LOC-006', 'LOCATION', 'その他', 6]
  ];
}

function kspBuildGpSeedRows(nowIso) {
  return kspGetGpSeedDefinitions().map(function (seed) {
    return {
      GP_ID: seed[0],
      GP_Name: seed[1],
      Status: KSP_STATUS.ACTIVE,
      Created_At: nowIso,
      Updated_At: nowIso,
      Created_By: 'SYSTEM',
      Updated_By: 'SYSTEM'
    };
  });
}

function kspBuildOptionSeedRows(nowIso) {
  return kspGetOptionSeedDefinitions().map(function (seed) {
    return {
      Option_ID: seed[0],
      Type: seed[1],
      Name: seed[2],
      Sort_Order: seed[3],
      Status: KSP_STATUS.ACTIVE,
      Created_At: nowIso,
      Updated_At: nowIso,
      Created_By: 'SYSTEM',
      Updated_By: 'SYSTEM'
    };
  });
}

function kspBuildSettingsRows(config, resources, nowIso) {
  var adminEmails = kspNormalizeEmailList(config.adminEmails).join(',');
  return [
    { Key: 'SCHEMA_VERSION', Value: String(KSP_SCHEMA_VERSION), Description: 'Current backend schema version.', Updated_At: nowIso },
    { Key: 'APP_VERSION', Value: KSP_APP_VERSION, Description: 'Current application scaffold version.', Updated_At: nowIso },
    { Key: 'ENVIRONMENT', Value: config.environment, Description: 'DEV or PROD resource set.', Updated_At: nowIso },
    { Key: 'TIMEZONE', Value: config.timezone, Description: 'Application timezone.', Updated_At: nowIso },
    { Key: 'KNOWLEDGE_ROOT_FOLDER_ID', Value: resources[KSP_RESOURCE_KEYS.KNOWLEDGE_ROOT], Description: 'Authoritative knowledge root folder.', Updated_At: nowIso },
    { Key: 'MEETING_RECORDS_FOLDER_ID', Value: resources[KSP_RESOURCE_KEYS.MEETING_RECORDS], Description: 'Meeting records folder.', Updated_At: nowIso },
    { Key: 'PITCHBOOKS_FOLDER_ID', Value: resources[KSP_RESOURCE_KEYS.PITCHBOOKS], Description: 'Pitchbooks/source-material folder.', Updated_At: nowIso },
    { Key: 'BACKEND_SPREADSHEET_ID', Value: resources[KSP_RESOURCE_KEYS.BACKEND_SPREADSHEET], Description: 'Five-sheet backend spreadsheet.', Updated_At: nowIso },
    { Key: 'AUDIT_LOG_SPREADSHEET_ID', Value: resources[KSP_RESOURCE_KEYS.AUDIT_SPREADSHEET], Description: 'Separate restricted audit spreadsheet.', Updated_At: nowIso },
    { Key: 'ADMIN_EMAILS', Value: adminEmails, Description: 'Administrative contacts; not an application authentication mechanism.', Updated_At: nowIso },
    { Key: 'AI_SYNC_ENABLED', Value: String(config.aiSyncEnabled), Description: 'Whether the scheduled AI sync trigger should be active.', Updated_At: nowIso },
    { Key: 'AI_SYNC_INTERVAL_MINUTES', Value: String(config.aiSyncIntervalMinutes), Description: 'Scheduled AI sync interval.', Updated_At: nowIso },
    { Key: 'NEXT_MEETING_ID', Value: '1', Description: 'Next Meeting numeric sequence.', Updated_At: nowIso },
    { Key: 'NEXT_DOCUMENT_ID', Value: '1', Description: 'Next source Document numeric sequence.', Updated_At: nowIso },
    { Key: 'NEXT_BATCH_ID', Value: '1', Description: 'Next Pitchbook batch numeric sequence.', Updated_At: nowIso },
    { Key: 'GEMINI_FILE_SEARCH_STORE_NAME', Value: '', Description: 'Configured during the Gemini implementation Work.', Updated_At: nowIso },
    { Key: 'AI_DEFAULT_MODEL', Value: '', Description: 'Configured Gemini Flash model ID.', Updated_At: nowIso },
    { Key: 'LAST_SETUP_AT', Value: nowIso, Description: 'Last successful setup/repair execution.', Updated_At: nowIso }
  ];
}

function kspGetSettingsPreserveExistingKeys() {
  return [
    'NEXT_MEETING_ID',
    'NEXT_DOCUMENT_ID',
    'NEXT_BATCH_ID',
    'GEMINI_FILE_SEARCH_STORE_NAME',
    'AI_DEFAULT_MODEL'
  ];
}

function kspGetTriggerRegistry(config) {
  return [
    {
      key: 'AI_SYNC_INTERVAL_TRIGGER',
      handler: 'runAiSyncWorker',
      eventType: KSP_TRIGGER_EVENT_TYPES.CLOCK,
      intervalMinutes: config.aiSyncIntervalMinutes,
      enabled: config.aiSyncEnabled,
      available: false
    }
  ];
}
function kspGetBootstrapConfigTemplate() {
  return {
    environment: 'DEV',
    knowledgeParentFolderId: 'REPLACE_WITH_SHARED_DRIVE_PARENT_FOLDER_ID',
    controlFolderId: 'REPLACE_WITH_RESTRICTED_CONTROL_FOLDER_ID',
    adminEmails: ['admin@example.com'],
    timezone: KSP_DEFAULTS.TIMEZONE,
    aiSyncEnabled: false
  };
}

function kspLoadInstallationState(environment) {
  var rawState = environment.getProperty(KSP_PROPERTY_KEYS.INSTALLATION_STATE_JSON);
  var state = kspSafeParseJson(rawState, KSP_PROPERTY_KEYS.INSTALLATION_STATE_JSON);
  if (!state) {
    return {
      schemaVersion: KSP_SCHEMA_VERSION,
      config: null,
      resources: {},
      updatedAt: null
    };
  }

  state.resources = state.resources || {};
  return state;
}

function kspLoadEffectiveConfig(environment, existingState) {
  var rawBootstrap = environment.getProperty(KSP_PROPERTY_KEYS.BOOTSTRAP_CONFIG_JSON);
  var bootstrapConfig = kspSafeParseJson(rawBootstrap, KSP_PROPERTY_KEYS.BOOTSTRAP_CONFIG_JSON);
  var storedConfig = existingState && existingState.config ? existingState.config : null;
  var source = bootstrapConfig || storedConfig;

  kspAssert(source, 'MISSING_BOOTSTRAP_CONFIG',
    'Set Script Property ' + KSP_PROPERTY_KEYS.BOOTSTRAP_CONFIG_JSON + ' before first setup.');

  return kspNormalizeAndValidateConfig(source);
}

function kspNormalizeAndValidateConfig(input) {
  kspAssert(kspIsPlainObject(input), 'INVALID_BOOTSTRAP_CONFIG', 'Bootstrap config must be a JSON object.');

  var environment = String(input.environment || '').trim().toUpperCase();
  var knowledgeParentFolderId = String(input.knowledgeParentFolderId || '').trim();
  var controlFolderId = String(input.controlFolderId || '').trim();
  var timezone = String(input.timezone || KSP_DEFAULTS.TIMEZONE).trim();
  var adminEmails = kspNormalizeEmailList(input.adminEmails || []);
  var aiSyncEnabled = kspToBoolean(input.aiSyncEnabled, KSP_DEFAULTS.AI_SYNC_ENABLED);
  var aiSyncIntervalMinutes = kspToPositiveInteger(
    input.aiSyncIntervalMinutes,
    KSP_DEFAULTS.AI_SYNC_INTERVAL_MINUTES
  );

  kspAssert(environment === 'DEV' || environment === 'PROD',
    'INVALID_ENVIRONMENT', 'environment must be DEV or PROD.');
  kspAssert(knowledgeParentFolderId, 'MISSING_KNOWLEDGE_PARENT',
    'knowledgeParentFolderId is required.');
  kspAssert(controlFolderId, 'MISSING_CONTROL_FOLDER', 'controlFolderId is required.');
  kspAssert(knowledgeParentFolderId !== controlFolderId, 'INVALID_FOLDER_BOUNDARY',
    'knowledgeParentFolderId and controlFolderId must be different.');
  kspAssert(timezone, 'MISSING_TIMEZONE', 'timezone is required.');
  kspAssert(aiSyncIntervalMinutes === 15, 'INVALID_AI_SYNC_INTERVAL',
    'Initial AI sync interval is fixed at 15 minutes.');

  return {
    environment: environment,
    knowledgeParentFolderId: knowledgeParentFolderId,
    controlFolderId: controlFolderId,
    adminEmails: adminEmails,
    timezone: timezone,
    aiSyncEnabled: aiSyncEnabled,
    aiSyncIntervalMinutes: aiSyncIntervalMinutes
  };
}

function kspBuildStoredInstallationState(config, resources, nowIso) {
  return {
    schemaVersion: KSP_SCHEMA_VERSION,
    appVersion: KSP_APP_VERSION,
    config: kspDeepClone(config),
    resources: kspDeepClone(resources),
    updatedAt: nowIso
  };
}
