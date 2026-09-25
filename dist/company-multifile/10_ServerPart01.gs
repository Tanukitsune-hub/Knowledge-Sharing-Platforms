// ===== BEGIN src/00_Core.gs =====
var KSP_COMPONENT_WORK_ID = '0004';
var KSP_RELEASE_VERSION = '0.2.0';
var KSP_WORK_ID = KSP_COMPONENT_WORK_ID;
var KSP_APP_VERSION = KSP_RELEASE_VERSION;
var KSP_SCHEMA_VERSION = 9;

var KSP_PROPERTY_KEYS = Object.freeze({
  BOOTSTRAP_CONFIG_JSON: 'BOOTSTRAP_CONFIG_JSON',
  INSTALLATION_STATE_JSON: 'KSP_INSTALLATION_STATE_JSON',
  LAST_SETUP_REPORT_JSON: 'KSP_LAST_SETUP_REPORT_JSON',
  INSTALLER_OWNER_JSON: 'KSP_INSTALLER_OWNER_JSON',
  DEPLOYMENT_SECURITY_ATTESTATION_JSON: 'KSP_DEPLOYMENT_SECURITY_ATTESTATION_JSON'
});

var KSP_RESOURCE_NAMES = Object.freeze({
  KNOWLEDGE_ROOT: '記録・資料',
  MEETING_RECORDS: '面談記録',
  PITCHBOOKS: '保存資料',
  NEWS: 'ニュース',
  INTERNAL_ASSESSMENTS: '評価（ICメモ、社内整理等）',
  KNOWLEDGE_EXPORTS: 'Knowledge Exports',
  BACKUP_FOLDER: 'Knowledge Platform Backups',
  BACKEND_SPREADSHEET: 'Knowledge Platform Backend',
  AUDIT_SPREADSHEET: 'Knowledge Platform Audit'
});

var KSP_LEGACY_RESOURCE_NAMES = Object.freeze({
  KNOWLEDGE_ROOT: 'Private Assets Knowledge',
  MEETING_RECORDS: 'Meeting Records',
  PITCHBOOKS: 'Pitchbooks'
});

var KSP_RESOURCE_KEYS = Object.freeze({
  KNOWLEDGE_ROOT: 'knowledgeRootFolderId',
  MEETING_RECORDS: 'meetingRecordsFolderId',
  PITCHBOOKS: 'pitchbooksFolderId',
  NEWS: 'newsFolderId',
  INTERNAL_ASSESSMENTS: 'internalAssessmentsFolderId',
  KNOWLEDGE_EXPORTS: 'knowledgeExportsFolderId',
  BACKUP_FOLDER: 'backupFolderId',
  BACKEND_SPREADSHEET: 'backendSpreadsheetId',
  AUDIT_SPREADSHEET: 'auditSpreadsheetId'
});

var KSP_MIME_TYPES = Object.freeze({
  FOLDER: 'application/vnd.google-apps.folder',
  SPREADSHEET: 'application/vnd.google-apps.spreadsheet'
});

var KSP_SHEET_NAMES = Object.freeze({
  COUNTERPARTY_MASTER: 'Counterparty_Master',
  OPTION_MASTER: 'Option_Master',
  MEETING_INDEX: 'Meeting_Index',
  PITCHBOOK_INDEX: 'Pitchbook_Index',
  NEWS_INDEX: 'News_Index',
  INTERNAL_ASSESSMENT_INDEX: 'Internal_Assessment_Index',
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
function kspDeepClone_(value) {
  return value === undefined ? undefined : JSON.parse(JSON.stringify(value));
}

function kspIsPlainObject_(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function kspNormalizeGeneratedNameSegment_(value) {
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

function kspEscapeDriveQueryLiteral_(value) {
  return String(value).replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

function kspNormalizeEmailList_(value) {
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

function kspToBoolean_(value, defaultValue) {
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

function kspToPositiveInteger_(value, defaultValue) {
  var numberValue = Number(value);
  if (!Number.isFinite(numberValue) || numberValue <= 0 || Math.floor(numberValue) !== numberValue) {
    return defaultValue;
  }
  return numberValue;
}

function kspSafeParseJson_(text, label) {
  if (text === null || text === undefined || text === '') {
    return null;
  }
  try {
    return JSON.parse(text);
  } catch (error) {
    throw new Error((label || 'JSON') + ' is not valid JSON: ' + error.message);
  }
}

function kspStringifyError_(error) {
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

function kspCreateReport_(mode, nowIso) {
  return {
    workId: KSP_WORK_ID,
    componentWorkId: KSP_COMPONENT_WORK_ID,
    releaseVersion: KSP_RELEASE_VERSION,
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

function kspAddAction_(report, category, resource, action, details) {
  report.actions.push({
    category: category,
    resource: resource,
    action: action,
    details: details || {}
  });
}

function kspAddWarning_(report, code, message, details) {
  report.warnings.push({
    code: code,
    message: message,
    details: details || {}
  });
}

function kspAddError_(report, code, message, details) {
  report.ok = false;
  report.errors.push({
    code: code,
    message: message,
    details: details || {}
  });
}

function kspFinalizeReport_(report, nowIso) {
  report.finishedAt = nowIso;
  report.ok = report.errors.length === 0;
  return report;
}

function kspAssert_(condition, code, message) {
  if (!condition) {
    var error = new Error(message);
    error.code = code;
    throw error;
  }
}

function kspGetErrorCode_(error, fallback) {
  return error && error.code ? String(error.code) : (fallback || 'UNEXPECTED_ERROR');
}

function kspContextCounterpartyRows_(context) {
  var source = context || {};
  return source.counterpartyRows || source.gpRows || [];
}

var KSP_SAFE_ERROR_MESSAGES = Object.freeze({
  MEETING_DATE_REQUIRED: '日付を入力してください。',
  MEETING_COUNTERPARTY_TYPE_REQUIRED: '面談先区分を選択してください。',
  MEETING_COUNTERPARTY_TYPE_INVALID: '面談先区分を確認してください。',
  MEETING_COUNTERPARTY_ENTITY_REQUIRED: '面談先を選択してください。',
  MEETING_COUNTERPARTY_ENTITY_UNAVAILABLE: '選択した面談先が見つかりません。',
  MEETING_RELATED_GP_INVALID: '旧形式の関連先情報を確認してください。',
  MEETING_RELATED_GP_DUPLICATE: '旧形式の関連先情報に重複があります。',
  MEETING_GP_REQUIRED: 'GPを選択してください。',
  MEETING_ASSET_CLASS_REQUIRED: 'アセットクラスを選択してください。',
  MEETING_DATE_INVALID: '日付の形式を確認してください。',
  MEETING_TIME_INVALID: '時刻の形式を確認してください。',
  MEETING_TYPE_CODE_INVALID: 'MTG種別を確認してください。',
  MEETING_TEAM_UNAVAILABLE: '選択されたチームを確認してください。',
  MEETING_RELATED_PITCHBOOK_UNAVAILABLE: '選択した関連資料が見つかりません。',
  MEETING_FUND_STRATEGY_TOO_LONG: 'Fund / Strategyは500文字以内で入力してください。',
  MEETING_FOLLOW_UP_NOTE_TOO_LONG: 'フォローアップメモは2,000文字以内で入力してください。',
  MEETING_NOT_FOUND: '指定した面談記録が見つかりません。',
  MEETING_RETRY_REQUEST_CHANGED: '入力内容が変更されたため、再試行できません。',
  MEETING_RETRY_CONFLICT: '同じMeeting IDに別の登録内容があります。',
  MEETING_DOCUMENT_READ_FAILED: '面談記録のGoogle Docs原本を読み込めませんでした。',
  PITCHBOOK_DATE_REQUIRED: '日付を入力してください。',
  PITCHBOOK_COUNTERPARTY_REQUIRED: '面談先を選択してください。',
  PITCHBOOK_ASSET_CLASS_REQUIRED: 'アセットクラスを選択してください。',
  PITCHBOOK_FILE_REQUIRED: 'ファイルを選択してください。',
  PITCHBOOK_FUND_STRATEGY_TOO_LONG: 'Fund / Strategyは500文字以内で入力してください。',
  PITCHBOOK_BATCH_INVALID: '保存資料の登録内容を確認してください。',
  PITCHBOOK_FILE_SIZE_EXCEEDED: 'ファイルサイズの上限を超えています。',
  PITCHBOOK_TOTAL_SIZE_EXCEEDED: '合計ファイルサイズの上限を超えています。',
  PITCHBOOK_FILE_COUNT_EXCEEDED: '選択ファイル数の上限を超えています。',
  PITCHBOOK_NOT_FOUND: '指定した保存資料が見つかりません。',
  GP_WORKSPACE_GP_REQUIRED: 'GPを選択してください。',
  GP_WORKSPACE_GP_NOT_FOUND: '指定されたGPを確認できません。',
  PITCHBOOK_BATCH_CONFLICT: 'Batch IDが一致しません。',
  PITCHBOOK_FILENAME_CONFLICT: '選択されたファイル名が登録内容と一致しません。',
  PITCHBOOK_FILE_SIZE_MISMATCH: '送信されたファイルサイズを確認できません。',
  RECORD_NOT_FOUND: '対象の記録が見つかりません。',
  STALE_RECORD_VERSION: '他の利用者が先に更新しています。最新情報を読み直してください。',
  RECORD_EDIT_IN_PROGRESS: 'このレコードは別の処理中です。少し待って再試行してください。',
  MASTER_DUPLICATE_NAME: '同じ名称の項目が既にあります。',
  MASTER_NOT_FOUND: '対象の項目が見つかりません。',
  AI_QUESTION_REQUIRED: '質問を入力してください。',
  AI_QUESTION_TOO_LONG: '質問または追加指示は5,000文字以内で入力してください。',
  AI_STORE_NOT_CONFIGURED: '検索設定がまだ完了していません。',
  AI_MODEL_NOT_CONFIGURED: '検索設定がまだ完了していません。',
  AI_HTTP_429: '検索が混み合っています。少し待って再試行してください。',
  AI_HTTP_500: '検索サービスを利用できません。',
  AI_HTTP_502: '検索サービスを利用できません。',
  AI_HTTP_503: '検索サービスを利用できません。',
  AI_RATE_LIMITED: '検索が混み合っています。少し待って再試行してください。',
  AI_MULTI_ENTITY_COUNT_INVALID: '比較する面談先を2–5件選択してください。',
  AI_MULTI_ENTITY_DUPLICATE: '同じ面談先を複数回選択できません。',
  AI_MULTI_ENTITY_MODE_REQUIRED: '面談先の複数選択は比較モードで利用できます。',
  AI_MULTI_ENTITY_AMBIGUOUS_SCOPE: '比較対象の指定が競合しています。',
  AI_RELATED_GP_FILTER_UNAVAILABLE: '旧形式の検索条件を確認してください。',
  AI_MEETING_TYPE_FILTER_UNAVAILABLE: '選択されたMTG種別を確認してください。',
  AI_ADVANCED_FILTER_TOO_BROAD: '該当する面談記録が多すぎます。条件を絞ってください。',
  KNOWLEDGE_EXPORT_PREVIEW_REQUIRED: '先に対象資料を確認してください。',
  KNOWLEDGE_EXPORT_PREVIEW_STALE: 'プレビューが古くなっています。再度プレビューを実行してください。',
  KNOWLEDGE_EXPORT_RATE_LIMITED: '処理が集中しています。少し待って再試行してください。',
  KNOWLEDGE_EXPORT_LIMIT_EXCEEDED: '対象資料が書き出し上限を超えています。フィルターを絞ってください。',
  KNOWLEDGE_EXPORT_NO_RESULTS: '条件に合う有効な資料はありません。',
  KNOWLEDGE_EXPORT_MEETING_DOCUMENT_MISSING: '面談記録のGoogle Docs原本が見つかりません。',
  KNOWLEDGE_EXPORT_MEETING_URL_MISSING: '面談記録の原本リンクがありません。',
  KNOWLEDGE_EXPORT_MEETING_LINK_MISMATCH: '面談記録の原本リンクが一致しません。',
  KNOWLEDGE_EXPORT_PITCHBOOK_FILE_MISSING: '保存資料の原本ファイルが見つかりません。',
  KNOWLEDGE_EXPORT_PITCHBOOK_URL_MISSING: '保存資料の原本リンクがありません。',
  KNOWLEDGE_EXPORT_PITCHBOOK_LINK_MISMATCH: '保存資料の原本リンクが一致しません。',
  KNOWLEDGE_EXPORT_MEETING_DOCUMENT_READ_FAILED: '面談記録のGoogle Docs原本を読み込めませんでした。',
  KNOWLEDGE_EXPORT_ARTIFACT_URL_MISSING: '生成された書き出しのリンクを確認できません。',
  KNOWLEDGE_EXPORT_ARTIFACT_CREATE_FAILED: '書き出しファイルを作成できませんでした。',
  ACTIVITY_ANALYTICS_PERIOD_INVALID: '分析期間を確認してください。',
  ACTIVITY_ANALYTICS_DIMENSION_INVALID: '分析項目を確認してください。',
  ACTIVITY_ANALYTICS_DATE_INVALID: '分析対象の日付を確認してください。',
  ACTIVITY_ANALYTICS_DATE_RANGE_INVALID: '分析対象の日付範囲を確認してください。',
  ACTIVITY_ANALYTICS_LIMIT_INVALID: '分析件数上限を確認してください。',
  ACTIVITY_ANALYTICS_MEETING_TYPE_INVALID: '分析MTG種別を確認してください。',
  ADMIN_CHECK_MEETING_ID_REQUIRED: 'Meeting IDを確認してください。',
  ADMIN_CHECK_STATE_REQUIRED: '月次管理状態を確認してください。',
  ADMIN_CHECK_STATE_INVALID: '月次管理状態を確認してください。',
  ADMIN_CHECK_STALE: '月次管理状態が先に更新されています。最新情報を読み直してください。',
  ADMIN_CHECK_NOT_FOUND: '対象の面談記録が見つかりません。',
  ADMIN_CHECK_AUDIT_WRITE_FAILED: '月次管理の操作履歴を保存できませんでした。'
});

function kspSafePublicErrorMessage_(code, category) {
  var normalizedCode = String(code || 'UNEXPECTED_ERROR');
  if (KSP_SAFE_ERROR_MESSAGES[normalizedCode]) return KSP_SAFE_ERROR_MESSAGES[normalizedCode];
  var defaults = {
    MEETING: '面談記録を処理できませんでした。',
    PITCHBOOK: '保存資料を処理できませんでした。',
    MAINTENANCE: '管理処理を完了できませんでした。',
    WORKSPACE: '面談先サマリーを読み込めませんでした。',
    SEARCH: '検索を実行できませんでした。',
    EXPORT: '資料を書き出せませんでした。'
  };
  return defaults[String(category || '').toUpperCase()] || '処理を完了できませんでした。';
}

function kspSafeOperationalWarning_(code) {
  var messages = {
    ACTOR_RESOLUTION_FAILED: '利用者情報を取得できないため、匿名扱いで記録します。',
    AUDIT_WRITE_FAILED: '監査メタデータを記録できませんでした。',
    MEETING_DOCUMENT_RESTORE_FAILED: '面談記録の原本を復元できませんでした。',
    MEETING_EDIT_CLAIM_RELEASE_FAILED: '面談記録の編集状態を解除できませんでした。',
    PITCHBOOK_FILENAME_RESTORE_FAILED: '保存資料のファイル名を元に戻せませんでした。',
    PITCHBOOK_EDIT_CLAIM_RELEASE_FAILED: '保存資料の編集状態を解除できませんでした。',
    PITCHBOOK_FAIL_STATUS_WRITE_FAILED: '保存資料の失敗状態を記録できませんでした。'
  };
  return messages[String(code || '')] || '補足処理を完了できませんでした。';
}

function kspPublicOperationHash_(value) {
  var hash = 2166136261;
  var text = String(value || '');
  for (var index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return ('00000000' + (hash >>> 0).toString(16)).slice(-8);
}

function kspBuildPublicOperationCacheKey_(operation, actor, discriminator) {
  return 'KSP_PUBLIC_' + kspPublicOperationHash_([
    operation, actor || 'UNIDENTIFIED', discriminator || ''
  ].join('\u001f'));
}

function kspClaimPublicOperation_(environment, operation, actor, discriminator, expirationSeconds) {
  if (!environment || typeof environment.claimPublicOperation !== 'function') return true;
  return environment.claimPublicOperation(
    kspBuildPublicOperationCacheKey_(operation, actor, discriminator), expirationSeconds
  );
}

function kspUniqueStrings_(values) {
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
function kspGetBackendSchemas_() {
  var schemas = {};

  schemas[KSP_SHEET_NAMES.COUNTERPARTY_MASTER] = [
    'Counterparty_ID', 'Counterparty_Name', 'Counterparty_Type', 'Status',
    'Created_At', 'Updated_At', 'Created_By', 'Updated_By',
    'Legacy_Source_Type', 'Legacy_Source_ID'
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
    'AI_Indexed_At', 'AI_Content_Hash', 'AI_Last_Error',
    'Team_ID', 'Fund_Strategy', 'Meeting_Type_Codes', 'Related_Pitchbook_IDs',
    'Follow_Up_Required', 'Follow_Up_Note',
    'Counterparty_Type', 'Counterparty_ID', 'Related_GP_IDs',
    'Admin_Check_Completed', 'Admin_Check_Updated_At', 'Admin_Check_Updated_By',
    'AI_Provider_State_JSON'
  ];

  schemas[KSP_SHEET_NAMES.PITCHBOOK_INDEX] = [
    'Document_ID', 'Batch_ID', 'Date', 'GP_ID', 'Asset_Class_ID',
    'Capital_Type_ID', 'Sequence_No', 'File_ID', 'File_URL', 'Original_Filename',
    'Saved_Filename', 'Status', 'Created_At', 'Updated_At', 'Created_By',
    'Updated_By', 'AI_Document_Name', 'AI_Index_Status', 'AI_Indexed_At',
    'AI_Content_Hash', 'AI_Last_Error', 'Fund_Strategy', 'AI_Provider_State_JSON',
    'Parent_Meeting_ID', 'Counterparty_Type', 'Counterparty_ID', 'Related_GP_IDs'
  ];

  schemas[KSP_SHEET_NAMES.NEWS_INDEX] = [
    'News_ID', 'Published_Date', 'Publisher', 'Title', 'URL',
    'Counterparty_IDs', 'Asset_Class_ID', 'Fund_Strategy', 'Input_Mode',
    'Source_File_ID', 'Source_URL', 'Source_Mime_Type', 'Original_Filename',
    'Saved_Filename', 'Status', 'Version', 'Created_At', 'Updated_At',
    'Created_By', 'Updated_By', 'AI_Document_Name', 'AI_Index_Status',
    'AI_Indexed_At', 'AI_Content_Hash', 'AI_Last_Error', 'AI_Provider_State_JSON'
  ];

  schemas[KSP_SHEET_NAMES.INTERNAL_ASSESSMENT_INDEX] = [
    'Assessment_ID', 'Assessment_Date', 'Assessment_Type', 'Title',
    'Counterparty_IDs', 'Asset_Class_ID', 'Fund_Strategy', 'Decision_Or_Action',
    'Input_Mode', 'Source_File_ID', 'Source_URL', 'Source_Mime_Type',
    'Original_Filename', 'Saved_Filename', 'Related_Meeting_IDs',
    'Related_Document_IDs', 'Related_News_IDs', 'Status', 'Version',
    'Created_At', 'Updated_At', 'Created_By', 'Updated_By', 'AI_Document_Name',
    'AI_Index_Status', 'AI_Indexed_At', 'AI_Content_Hash', 'AI_Last_Error',
    'AI_Provider_State_JSON'
  ];

  schemas[KSP_SHEET_NAMES.SETTINGS] = [
    'Key', 'Value', 'Description', 'Updated_At'
  ];

  return schemas;
}

function kspGetAuditSchema_() {
  var schema = {};
  schema[KSP_SHEET_NAMES.AUDIT_LOG] = [
    'Event_Timestamp', 'Actor', 'Action', 'Target_Type', 'Target_ID', 'Result',
    'Changed_Fields', 'Before_Metadata_JSON', 'After_Metadata_JSON', 'Batch_ID',
    'Error_Code', 'Error_Message', 'Search_Mode', 'Question_Or_Instruction',
    'Date_From', 'Date_To', 'GP_Filter', 'Counterparty_Filter', 'Counterparty_Type_Filter', 'Asset_Class_Filter',
    'Capital_Type_Filter', 'Source_Type_Filter', 'Model_ID', 'Cited_Source_IDs'
  ];
  return schema;
}

function kspGetGpSeedDefinitions_() {
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

function kspGetCounterpartySeedDefinitions_() {
  return kspGetGpSeedDefinitions_().map(function (seed, index) {
    return [
      'CP-' + String(index + 1).padStart(6, '0'),
      seed[1],
      'GP',
      'GP_MASTER',
      seed[0]
    ];
  });
}

function kspGetOptionSeedDefinitions_() {
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
    ['OPT-LOC-006', 'LOCATION', 'その他', 6],
    ['OPT-TEAM-001', 'TEAM', 'PD', 1],
    ['OPT-TEAM-002', 'TEAM', 'AE', 2]
  ];
}

function kspBuildGpSeedRows_(nowIso) {
  return kspGetGpSeedDefinitions_().map(function (seed) {
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

function kspBuildCounterpartySeedRows_(nowIso) {
  return kspGetCounterpartySeedDefinitions_().map(function (seed) {
    return {
      Counterparty_ID: seed[0],
      Counterparty_Name: seed[1],
      Counterparty_Type: seed[2],
      Status: KSP_STATUS.ACTIVE,
      Created_At: nowIso,
      Updated_At: nowIso,
      Created_By: 'SYSTEM',
      Updated_By: 'SYSTEM',
      Legacy_Source_Type: seed[3],
      Legacy_Source_ID: seed[4]
    };
  });
}

function kspBuildOptionSeedRows_(nowIso) {
  return kspGetOptionSeedDefinitions_().map(function (seed) {
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

function kspBuildSettingsRows_(config, resources, nowIso) {
  var adminEmails = kspNormalizeEmailList_(config.adminEmails).join(',');
  var distribution = kspGetDistributionMetadata_();
  return [
    { Key: 'SCHEMA_VERSION', Value: String(KSP_SCHEMA_VERSION), Description: 'Current backend schema version.', Updated_At: nowIso },
    { Key: 'APP_VERSION', Value: KSP_APP_VERSION, Description: 'Current application scaffold version.', Updated_At: nowIso },
    { Key: 'ENVIRONMENT', Value: config.environment, Description: 'DEV or PROD resource set.', Updated_At: nowIso },
    { Key: 'TIMEZONE', Value: config.timezone, Description: 'Application timezone.', Updated_At: nowIso },
    { Key: 'KNOWLEDGE_ROOT_FOLDER_ID', Value: resources[KSP_RESOURCE_KEYS.KNOWLEDGE_ROOT], Description: 'Authoritative knowledge root folder.', Updated_At: nowIso },
    { Key: 'MEETING_RECORDS_FOLDER_ID', Value: resources[KSP_RESOURCE_KEYS.MEETING_RECORDS], Description: 'Meeting records folder.', Updated_At: nowIso },
    { Key: 'PITCHBOOKS_FOLDER_ID', Value: resources[KSP_RESOURCE_KEYS.PITCHBOOKS], Description: 'Pitchbooks/source-material folder.', Updated_At: nowIso },
    { Key: 'NEWS_FOLDER_ID', Value: resources[KSP_RESOURCE_KEYS.NEWS], Description: 'News source folder.', Updated_At: nowIso },
    { Key: 'INTERNAL_ASSESSMENTS_FOLDER_ID', Value: resources[KSP_RESOURCE_KEYS.INTERNAL_ASSESSMENTS], Description: 'Internal Assessment source folder.', Updated_At: nowIso },
    { Key: 'KNOWLEDGE_EXPORTS_FOLDER_ID', Value: resources[KSP_RESOURCE_KEYS.KNOWLEDGE_EXPORTS], Description: 'Derived Knowledge Exports folder outside the authoritative root.', Updated_At: nowIso },
    { Key: 'BACKUP_FOLDER_ID', Value: resources[KSP_RESOURCE_KEYS.BACKUP_FOLDER], Description: 'Restricted Backend-only daily backup folder.', Updated_At: nowIso },
    { Key: 'BACKEND_SPREADSHEET_ID', Value: resources[KSP_RESOURCE_KEYS.BACKEND_SPREADSHEET], Description: 'Seven-sheet backend spreadsheet.', Updated_At: nowIso },
    { Key: 'AUDIT_LOG_SPREADSHEET_ID', Value: resources[KSP_RESOURCE_KEYS.AUDIT_SPREADSHEET], Description: 'Separate restricted audit spreadsheet.', Updated_At: nowIso },
    { Key: 'ADMIN_EMAILS', Value: adminEmails, Description: 'Administrative contacts; not an application authentication mechanism.', Updated_At: nowIso },
    { Key: 'AI_SYNC_ENABLED', Value: String(config.aiSyncEnabled), Description: 'Whether the scheduled AI sync trigger should be active.', Updated_At: nowIso },
    { Key: 'AI_SYNC_INTERVAL_MINUTES', Value: String(config.aiSyncIntervalMinutes), Description: 'Scheduled AI sync interval.', Updated_At: nowIso },
    { Key: 'NEXT_MEETING_ID', Value: '1', Description: 'Next Meeting numeric sequence.', Updated_At: nowIso },
    { Key: 'NEXT_DOCUMENT_ID', Value: '1', Description: 'Next source Document numeric sequence.', Updated_At: nowIso },
    { Key: 'NEXT_BATCH_ID', Value: '1', Description: 'Next Pitchbook batch numeric sequence.', Updated_At: nowIso },
    { Key: 'NEXT_NEWS_ID', Value: '1', Description: 'Next News numeric sequence.', Updated_At: nowIso },
    { Key: 'NEXT_ASSESSMENT_ID', Value: '1', Description: 'Next Internal Assessment numeric sequence.', Updated_At: nowIso },
    { Key: 'GEMINI_FILE_SEARCH_STORE_NAME', Value: '', Description: 'Configured during the Gemini implementation Work.', Updated_At: nowIso },
    { Key: 'AI_DEFAULT_MODEL', Value: '', Description: 'Configured Gemini Flash model ID.', Updated_At: nowIso },
    { Key: 'OPENAI_ENABLED', Value: 'false', Description: 'Whether the administrator has enabled the ChatGPT / OpenAI provider.', Updated_At: nowIso },
    { Key: 'OPENAI_VECTOR_STORE_ID', Value: '', Description: 'Server-side OpenAI Vector Store identifier.', Updated_At: nowIso },
    { Key: 'OPENAI_DEFAULT_MODEL', Value: '', Description: 'Administrator-selected OpenAI model ID.', Updated_At: nowIso },
    { Key: 'OPENAI_READINESS', Value: 'UNCONFIGURED', Description: 'OpenAI connection readiness; real-source sync is separate from synthetic connection validation.', Updated_At: nowIso },
    { Key: 'GEMINI_ENABLED', Value: 'false', Description: 'Whether the administrator has enabled the Gemini provider.', Updated_At: nowIso },
    { Key: 'GEMINI_DEFAULT_MODEL', Value: '', Description: 'Administrator-selected Gemini model ID.', Updated_At: nowIso },
    { Key: 'GEMINI_READINESS', Value: 'UNCONFIGURED', Description: 'Gemini connection and exact tuple readiness.', Updated_At: nowIso },
    { Key: 'DISTRIBUTION_RELEASE', Value: distribution.releaseVersion, Description: 'Installed distribution release.', Updated_At: nowIso },
    { Key: 'DISTRIBUTION_SOURCE_COMMIT', Value: distribution.sourceCommit, Description: 'Source commit for the installed distribution.', Updated_At: nowIso },
    { Key: 'DISTRIBUTION_PROFILE', Value: distribution.bundleProfile, Description: 'Installed distribution build profile.', Updated_At: nowIso },
    { Key: 'DISTRIBUTION_PAYLOAD_SHA256', Value: distribution.bundlePayloadSha256, Description: 'Canonical payload hash for the installed distribution.', Updated_At: nowIso },
    { Key: 'LAST_SETUP_AT', Value: nowIso, Description: 'Last successful setup/repair execution.', Updated_At: nowIso }
  ];
}

function kspGetSettingsPreserveExistingKeys_() {
  return [
    'NEXT_MEETING_ID',
    'NEXT_DOCUMENT_ID',
    'NEXT_BATCH_ID',
    'NEXT_NEWS_ID',
    'NEXT_ASSESSMENT_ID',
    'GEMINI_FILE_SEARCH_STORE_NAME',
    'AI_DEFAULT_MODEL',
    'OPENAI_ENABLED',
    'OPENAI_VECTOR_STORE_ID',
    'OPENAI_DEFAULT_MODEL',
    'OPENAI_READINESS',
    'GEMINI_ENABLED',
    'GEMINI_DEFAULT_MODEL',
    'GEMINI_READINESS'
  ];
}

function kspGetTriggerRegistry_(config) {
  return [
    {
      key: 'AI_SYNC_INTERVAL_TRIGGER',
      handler: 'runAiSyncWorker_',
      legacyHandlers: ['runAiSyncWorker'],
      eventType: KSP_TRIGGER_EVENT_TYPES.CLOCK,
      intervalMinutes: config.aiSyncIntervalMinutes,
      enabled: config.aiSyncEnabled,
      available: false
    },
    {
      key: 'BACKEND_DAILY_BACKUP_TRIGGER',
      handler: 'runBackendDailyBackup_',
      eventType: KSP_TRIGGER_EVENT_TYPES.CLOCK,
      schedule: 'DAILY',
      timezone: config.timezone,
      enabled: true,
      available: true,
      deduplicate: true
    }
  ];
}
function kspGetBootstrapConfigTemplate_() {
  return {
    environment: 'DEV',
    knowledgeParentFolderId: 'REPLACE_WITH_SHARED_DRIVE_PARENT_FOLDER_ID',
    controlFolderId: 'REPLACE_WITH_RESTRICTED_CONTROL_FOLDER_ID',
    adminEmails: ['admin@example.com'],
    timezone: KSP_DEFAULTS.TIMEZONE,
    aiSyncEnabled: false
  };
}

function kspLoadInstallationState_(environment) {
  var rawState = environment.getProperty(KSP_PROPERTY_KEYS.INSTALLATION_STATE_JSON);
  var state = kspSafeParseJson_(rawState, KSP_PROPERTY_KEYS.INSTALLATION_STATE_JSON);
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

function kspLoadEffectiveConfig_(environment, existingState) {
  var rawBootstrap = environment.getProperty(KSP_PROPERTY_KEYS.BOOTSTRAP_CONFIG_JSON);
  var bootstrapConfig = kspSafeParseJson_(rawBootstrap, KSP_PROPERTY_KEYS.BOOTSTRAP_CONFIG_JSON);
  var storedConfig = existingState && existingState.config ? existingState.config : null;
  var source = bootstrapConfig || storedConfig;

  kspAssert_(source, 'MISSING_BOOTSTRAP_CONFIG',
    'Set Script Property ' + KSP_PROPERTY_KEYS.BOOTSTRAP_CONFIG_JSON + ' before first setup.');

  return kspNormalizeAndValidateConfig_(source);
}

function kspNormalizeAndValidateConfig_(input) {
  kspAssert_(kspIsPlainObject_(input), 'INVALID_BOOTSTRAP_CONFIG', 'Bootstrap config must be a JSON object.');

  var environment = String(input.environment || '').trim().toUpperCase();
  var knowledgeParentFolderId = String(input.knowledgeParentFolderId || '').trim();
  var controlFolderId = String(input.controlFolderId || '').trim();
  var timezone = String(input.timezone || KSP_DEFAULTS.TIMEZONE).trim();
  var adminEmails = kspNormalizeEmailList_(input.adminEmails || []);
  var aiSyncEnabled = kspToBoolean_(input.aiSyncEnabled, KSP_DEFAULTS.AI_SYNC_ENABLED);
  var aiSyncIntervalMinutes = kspToPositiveInteger_(
    input.aiSyncIntervalMinutes,
    KSP_DEFAULTS.AI_SYNC_INTERVAL_MINUTES
  );

  kspAssert_(environment === 'DEV' || environment === 'PROD',
    'INVALID_ENVIRONMENT', 'environment must be DEV or PROD.');
  kspAssert_(knowledgeParentFolderId, 'MISSING_KNOWLEDGE_PARENT',
    'knowledgeParentFolderId is required.');
  kspAssert_(controlFolderId, 'MISSING_CONTROL_FOLDER', 'controlFolderId is required.');
  kspAssert_(timezone, 'MISSING_TIMEZONE', 'timezone is required.');
  kspAssert_(aiSyncIntervalMinutes === 15, 'INVALID_AI_SYNC_INTERVAL',
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

function kspBuildStoredInstallationState_(config, resources, nowIso) {
  return {
    schemaVersion: KSP_SCHEMA_VERSION,
    componentWorkId: KSP_COMPONENT_WORK_ID,
    releaseVersion: KSP_RELEASE_VERSION,
    appVersion: KSP_APP_VERSION,
    config: kspDeepClone_(config),
    resources: kspDeepClone_(resources),
    distribution: kspGetDistributionMetadata_(),
    updatedAt: nowIso
  };
}
// ===== END src/00_Core.gs =====

// ===== BEGIN src/01_DistributionResources.gs =====
function kspGetDistributionMetadata_() {
  if (typeof KSP_BUNDLE_RELEASE_METADATA !== 'undefined' && KSP_BUNDLE_RELEASE_METADATA) {
    return kspDeepClone_(KSP_BUNDLE_RELEASE_METADATA);
  }
  return {
    product: 'Alternative Assets Intelligence',
    releaseVersion: KSP_RELEASE_VERSION,
    schemaVersion: KSP_SCHEMA_VERSION,
    sourceCommit: '',
    bundleProfile: 'modular-source',
    hashCanonicalizationVersion: 'ksp-bundle-payload-v1',
    bundlePayloadSha256: ''
  };
}

function kspHasBundledHtmlResources_() {
  return typeof KSP_BUNDLED_HTML_RESOURCES !== 'undefined' &&
    KSP_BUNDLED_HTML_RESOURCES && typeof KSP_BUNDLED_HTML_RESOURCES === 'object';
}

function kspReadHtmlResource_(name) {
  var normalized = String(name || '').trim();
  kspAssert_(/^[A-Za-z][A-Za-z0-9_]*$/.test(normalized),
    'HTML_RESOURCE_NAME_INVALID', 'HTML resource name is invalid.');

  if (kspHasBundledHtmlResources_()) {
    kspAssert_(Object.prototype.hasOwnProperty.call(KSP_BUNDLED_HTML_RESOURCES, normalized),
      'HTML_RESOURCE_NOT_FOUND', 'HTML resource is not available: ' + normalized + '.');
    return String(KSP_BUNDLED_HTML_RESOURCES[normalized]);
  }

  return HtmlService.createHtmlOutputFromFile(normalized).getContent();
}

function kspCreateHtmlTemplate_(name) {
  if (kspHasBundledHtmlResources_()) {
    return HtmlService.createTemplate(kspReadHtmlResource_(name));
  }
  return HtmlService.createTemplateFromFile(String(name || '').trim());
}
// ===== END src/01_DistributionResources.gs =====

// ===== BEGIN src/05_TemporalContracts.gs =====
var KSP_TEMPORAL_DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/;
var KSP_TEMPORAL_TIME_RE = /^(?:[01]\d|2[0-3]):[0-5]\d$/;
var KSP_TEMPORAL_ISO_RE = /^(\d{4})-(\d{2})-(\d{2})T(?:[01]\d|2[0-3]):[0-5]\d:[0-5]\d(?:\.\d{1,9})?(?:Z|[+-](?:0\d|1\d|2[0-3]):[0-5]\d)$/;

function kspCanonicalSheetBusinessDisplay_(value, field) {
  var text = String(value || '').trim();
  // Sheets' h:mm number format omits a leading zero. No locale-dependent
  // date parsing, AM/PM inference, or timezone arithmetic is permitted here.
  if (field === 'Time' && /^[0-9]:[0-5]\d$/.test(text)) text = '0' + text;
  var valid = field === 'Date' ? kspTemporalIsValidDateKey_(text) :
    field === 'Time' && kspTemporalIsValidTimeKey_(text);
  kspAssert_(valid, 'BUSINESS_CELL_DISPLAY_UNSUPPORTED',
    'Date/Timeセルの表示形式を確認してください（yyyy-mm-dd / h:mm）。');
  return field === 'Date' ? kspCanonicalBusinessDate_(text) : kspCanonicalBusinessTime_(text);
}

function kspTemporalIsValidDateKey_(value) {
  var match = KSP_TEMPORAL_DATE_RE.exec(String(value || ''));
  if (!match) return false;
  var year = Number(match[1]);
  var month = Number(match[2]);
  var day = Number(match[3]);
  if (year < 1 || year > 9999 || month < 1 || month > 12 || day < 1) return false;
  var daysInMonth = [31, (year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0)) ? 29 : 28,
    31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  return day <= daysInMonth[month - 1];
}

function kspTemporalIsValidTimeKey_(value) {
  return KSP_TEMPORAL_TIME_RE.test(String(value || ''));
}

function kspTemporalParseStrictIso_(value) {
  var text = String(value || '').trim();
  var match = KSP_TEMPORAL_ISO_RE.exec(text);
  if (!match || !kspTemporalIsValidDateKey_(match[1] + '-' + match[2] + '-' + match[3])) return null;
  var instant = new Date(text);
  return Number.isNaN(instant.getTime()) ? null : instant;
}

function kspCanonicalBusinessDate_(value) {
  if (value === null || value === undefined || value === '') return '';
  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) return '';
    return Utilities.formatDate(value, KSP_DEFAULTS.TIMEZONE, 'yyyy-MM-dd');
  }
  var text = String(value).trim();
  if (kspTemporalIsValidDateKey_(text)) return text;
  var instant = kspTemporalParseStrictIso_(text);
  return instant ? Utilities.formatDate(instant, KSP_DEFAULTS.TIMEZONE, 'yyyy-MM-dd') : '';
}

function kspCanonicalBusinessTime_(value) {
  if (value === null || value === undefined || value === '') return '';
  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) return '';
    return Utilities.formatDate(value, KSP_DEFAULTS.TIMEZONE, 'HH:mm');
  }
  var text = String(value).trim();
  if (kspTemporalIsValidTimeKey_(text)) return text;
  var instant = kspTemporalParseStrictIso_(text);
  return instant ? Utilities.formatDate(instant, KSP_DEFAULTS.TIMEZONE, 'HH:mm') : '';
}

function kspCanonicalInstantIso_(value) {
  if (value === null || value === undefined || value === '') return '';
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? '' : value.toISOString();
  var text = String(value).trim();
  if (kspTemporalIsValidDateKey_(text) || kspTemporalIsValidTimeKey_(text)) return '';
  var instant = kspTemporalParseStrictIso_(text);
  return instant ? instant.toISOString() : '';
}

function kspTemporalInstantComparisonKey_(value) {
  var canonical = kspCanonicalInstantIso_(value);
  return canonical || (value === null || value === undefined ? '' : String(value).trim());
}

function kspIsValidDateKey_(value) {
  return kspTemporalIsValidDateKey_(value);
}

function kspIsValidTimeValue_(value) {
  return kspTemporalIsValidTimeKey_(value);
}
// ===== END src/05_TemporalContracts.gs =====

// ===== BEGIN src/06_CounterpartyMigration.gs =====
var KSP_COUNTERPARTY_TYPES = Object.freeze([
  'GP',
  'LP_ASSET_OWNER',
  'NISSAY_INTERNAL',
  'GROUP_COMPANY',
  'CONSULTANT_GATEKEEPER',
  'OTHER'
]);

var KSP_LEGACY_COUNTERPARTY_OPTION_TYPES = Object.freeze({
  COUNTERPARTY_LP: 'LP_ASSET_OWNER',
  COUNTERPARTY_NISSAY_DEPARTMENT: 'NISSAY_INTERNAL',
  COUNTERPARTY_GROUP_COMPANY: 'GROUP_COMPANY',
  COUNTERPARTY_CONSULTANT_GATEKEEPER: 'CONSULTANT_GATEKEEPER',
  COUNTERPARTY_OTHER: 'OTHER'
});

function kspFormatCounterpartyId_(sequenceNumber) {
  var sequence = Number(sequenceNumber);
  kspAssert_(Number.isFinite(sequence) && sequence > 0 && Math.floor(sequence) === sequence,
    'COUNTERPARTY_SEQUENCE_INVALID', 'Counterparty sequence must be a positive integer.');
  return 'CP-' + String(sequence).padStart(6, '0');
}

function kspIsCounterpartyId_(value) {
  return /^CP-\d{6}$/.test(String(value || ''));
}

function kspParseCounterpartyId_(value) {
  var match = /^CP-(\d{6})$/.exec(String(value || ''));
  kspAssert_(match && Number(match[1]) > 0,
    'COUNTERPARTY_ID_INVALID', 'Counterparty IDが不正です。');
  return Number(match[1]);
}

function kspLegacyOptionCounterpartyType_(optionType) {
  return KSP_LEGACY_COUNTERPARTY_OPTION_TYPES[String(optionType || '')] || '';
}

function kspCounterpartyTypeDefinitionFromCode_(code) {
  var normalized = String(code || '').trim();
  return KSP_COUNTERPARTY_TYPE_DEFINITIONS.filter(function (item) {
    return item.code === normalized;
  })[0] || null;
}

function kspCounterpartyLegacyKey_(sourceType, sourceId) {
  return String(sourceType || '') + ':' + String(sourceId || '');
}

function kspBuildCounterpartyMigrationPlan_(snapshot, nowIso) {
  var source = snapshot || {};
  var counterpartyRows = source.counterpartyRows || [];
  var optionRows = source.optionRows || [];
  var meetingRows = source.meetingRows || [];
  var pitchbookRows = source.pitchbookRows || [];
  var usedIds = {};
  var provenanceToId = {};
  var idToType = {};
  var maxSequence = 0;
  var counterpartyPatches = [];
  var counterpartyAppends = [];

  function rememberId(id) {
    var normalized = String(id || '').trim();
    if (!normalized) return;
    var sequence = kspParseCounterpartyId_(normalized);
    kspAssert_(!usedIds[normalized], 'COUNTERPARTY_ID_DUPLICATE',
      'Counterparty IDが重複しています。');
    usedIds[normalized] = true;
    maxSequence = Math.max(maxSequence, sequence);
  }

  function rememberProvenance(sourceType, sourceId, counterpartyId) {
    if (!sourceType || !sourceId) return;
    var key = kspCounterpartyLegacyKey_(sourceType, sourceId);
    kspAssert_(!provenanceToId[key] || provenanceToId[key] === counterpartyId,
      'COUNTERPARTY_PROVENANCE_CONFLICT', 'Legacy source mappingが競合しています。');
    provenanceToId[key] = counterpartyId;
  }

  counterpartyRows.forEach(function (row) {
    if (String(row.Counterparty_ID || '').trim()) rememberId(row.Counterparty_ID);
  });
  // IDs reserved by the canonical GP seed mapping must never be consumed by an
  // unrelated legacy row before insertMissingRows() restores the full seed set.
  maxSequence = Math.max(maxSequence, kspGetCounterpartySeedDefinitions_().length);
  counterpartyRows.forEach(function (row) {
    var id = String(row.Counterparty_ID || '').trim();
    if (id) rememberProvenance(
      String(row.Legacy_Source_Type || '').trim(),
      String(row.Legacy_Source_ID || '').trim(),
      id
    );
  });

  function nextId() {
    do { maxSequence += 1; } while (usedIds[kspFormatCounterpartyId_(maxSequence)]);
    var id = kspFormatCounterpartyId_(maxSequence);
    usedIds[id] = true;
    return id;
  }

  function preferredGpSeedId(legacyGpId) {
    var definitions = kspGetCounterpartySeedDefinitions_();
    for (var index = 0; index < definitions.length; index += 1) {
      if (definitions[index][4] === legacyGpId && !usedIds[definitions[index][0]]) {
        usedIds[definitions[index][0]] = true;
        maxSequence = Math.max(maxSequence, kspParseCounterpartyId_(definitions[index][0]));
        return definitions[index][0];
      }
    }
    return nextId();
  }

  counterpartyRows.forEach(function (row, index) {
    var legacyGpId = String(row.GP_ID || '').trim();
    var sourceType = String(row.Legacy_Source_Type || '').trim() || (legacyGpId ? 'GP_MASTER' : '');
    var sourceId = String(row.Legacy_Source_ID || '').trim() || legacyGpId;
    var id = String(row.Counterparty_ID || '').trim();
    if (!id && sourceType === 'GP_MASTER' && sourceId) {
      id = provenanceToId[kspCounterpartyLegacyKey_(sourceType, sourceId)] || preferredGpSeedId(sourceId);
    }
    if (!id) return;
    var name = String(row.Counterparty_Name || row.GP_Name || '').trim();
    var type = String(row.Counterparty_Type || '').trim() || (sourceType === 'GP_MASTER' ? 'GP' : '');
    kspAssert_(name, 'COUNTERPARTY_NAME_REQUIRED', 'Counterparty nameが必要です。');
    kspAssert_(KSP_COUNTERPARTY_TYPES.indexOf(type) !== -1,
      'COUNTERPARTY_TYPE_INVALID', 'Counterparty Typeが不正です。');
    kspAssert_(!idToType[id] || idToType[id] === type,
      'COUNTERPARTY_TYPE_CONFLICT', 'Counterparty IDのTypeが競合しています。');
    idToType[id] = type;
    rememberProvenance(sourceType, sourceId, id);
    var patch = {
      Counterparty_ID: id,
      Counterparty_Name: name,
      Counterparty_Type: type,
      Status: String(row.Status || KSP_STATUS.ACTIVE),
      Created_At: row.Created_At || nowIso,
      Updated_At: row.Updated_At || nowIso,
      Created_By: row.Created_By || 'SYSTEM',
      Updated_By: row.Updated_By || 'SYSTEM',
      Legacy_Source_Type: sourceType,
      Legacy_Source_ID: sourceId
    };
    var changed = Object.keys(patch).some(function (key) {
      return String(row[key] === undefined || row[key] === null ? '' : row[key]) !== String(patch[key]);
    });
    if (changed) counterpartyPatches.push({ rowIndex: index, values: patch });
  });

  optionRows.slice().sort(function (left, right) {
    return String(left.Option_ID || '').localeCompare(String(right.Option_ID || ''));
  }).forEach(function (row) {
    var type = kspLegacyOptionCounterpartyType_(row.Type);
    if (!type) return;
    var legacyId = String(row.Option_ID || '').trim();
    var key = kspCounterpartyLegacyKey_('OPTION_MASTER', legacyId);
    if (provenanceToId[key]) return;
    var id = nextId();
    provenanceToId[key] = id;
    idToType[id] = type;
    counterpartyAppends.push({
      Counterparty_ID: id,
      Counterparty_Name: String(row.Name || '').trim(),
      Counterparty_Type: type,
      Status: String(row.Status || KSP_STATUS.ACTIVE),
      Created_At: row.Created_At || nowIso,
      Updated_At: row.Updated_At || nowIso,
      Created_By: row.Created_By || 'SYSTEM',
      Updated_By: row.Updated_By || 'SYSTEM',
      Legacy_Source_Type: 'OPTION_MASTER',
      Legacy_Source_ID: legacyId
    });
  });

  function resolveLegacyReference(row) {
    var current = String(row.Counterparty_ID || '').trim();
    if (/^CP-\d{6}$/.test(current)) return current;
    var type = String(row.Counterparty_Type || '').trim();
    if (current) {
      var currentSource = type === 'GP' || /^GP-/.test(current) ? 'GP_MASTER' : 'OPTION_MASTER';
      if (provenanceToId[kspCounterpartyLegacyKey_(currentSource, current)]) {
        return provenanceToId[kspCounterpartyLegacyKey_(currentSource, current)];
      }
    }
    var gpId = String(row.GP_ID || '').trim();
    if (gpId) return provenanceToId[kspCounterpartyLegacyKey_('GP_MASTER', gpId)] || '';
    return '';
  }

  function buildReferencePatches(rows, keyName) {
    return rows.reduce(function (patches, row, index) {
      var legacyPresent = String(row.Counterparty_ID || row.GP_ID || '').trim();
      var resolved = resolveLegacyReference(row);
      kspAssert_(!legacyPresent || resolved, 'COUNTERPARTY_LEGACY_REFERENCE_UNRESOLVED',
        keyName + 'のlegacy Counterparty referenceを解決できません。');
      if (resolved) {
        var resolvedType = idToType[resolved] || '';
        kspAssert_(resolvedType, 'COUNTERPARTY_REFERENCE_TYPE_UNRESOLVED',
          keyName + 'のCounterparty Typeを解決できません。');
        if (String(row.Counterparty_ID || '') !== resolved ||
            String(row.Counterparty_Type || '') !== resolvedType) {
          patches.push({
            rowIndex: index,
            values: { Counterparty_ID: resolved, Counterparty_Type: resolvedType }
          });
        }
      }
      return patches;
    }, []);
  }

  return {
    counterpartyPatches: counterpartyPatches,
    counterpartyAppends: counterpartyAppends,
    meetingPatches: buildReferencePatches(meetingRows, 'Meeting'),
    pitchbookPatches: buildReferencePatches(pitchbookRows, 'Pitchbook'),
    legacyMappingCount: Object.keys(provenanceToId).length
  };
}

function kspCounterpartyMigrationMutationCount_(plan) {
  var source = plan || {};
  return (source.counterpartyPatches || []).length +
    (source.counterpartyAppends || []).length +
    (source.meetingPatches || []).length +
    (source.pitchbookPatches || []).length;
}
// ===== END src/06_CounterpartyMigration.gs =====

// ===== BEGIN src/10_Setup.gs =====
function kspRunSetup_(environment) {
  var report = kspCreateReport_('SETUP', environment.nowIso());
  var lock = null;

  try {
    lock = environment.acquireScriptLock(KSP_DEFAULTS.LOCK_TIMEOUT_MS);
    var existingState = kspLoadInstallationState_(environment);
    var config = kspLoadEffectiveConfig_(environment, existingState);
    report.environment = config.environment;

    var resources = kspResolveAllResources_(environment, existingState.resources || {}, config, report);
    report.resources = kspDeepClone_(resources);

    var backendSpreadsheetId = resources[KSP_RESOURCE_KEYS.BACKEND_SPREADSHEET];
    var renameResult = environment.renameSheetIfPresent(
      backendSpreadsheetId,
      'GP_Master',
      KSP_SHEET_NAMES.COUNTERPARTY_MASTER
    );
    kspAddAction_(report, 'migration', 'GP_Master->' + KSP_SHEET_NAMES.COUNTERPARTY_MASTER,
      renameResult.action, renameResult);

    kspEnsureSpreadsheetSchemas_(
      environment,
      backendSpreadsheetId,
      kspGetBackendSchemas_(),
      'backend',
      report
    );
    kspEnsureSpreadsheetSchemas_(
      environment,
      resources[KSP_RESOURCE_KEYS.AUDIT_SPREADSHEET],
      kspGetAuditSchema_(),
      'audit',
      report
    );

    var nowIso = environment.nowIso();
    var migrationSnapshot = environment.readCounterpartyMigrationSnapshot(backendSpreadsheetId);
    var migrationPlan = kspBuildCounterpartyMigrationPlan_(migrationSnapshot, nowIso);
    var migrationResult = environment.applyCounterpartyMigrationPlan(backendSpreadsheetId, migrationPlan);
    kspAddAction_(report, 'migration', 'schema7->schema8:counterparty-master',
      kspCounterpartyMigrationMutationCount_(migrationPlan) ? 'migrated' : 'reused', migrationResult);

    var counterpartyResult = environment.insertMissingRows(
      backendSpreadsheetId,
      KSP_SHEET_NAMES.COUNTERPARTY_MASTER,
      'Counterparty_ID',
      kspBuildCounterpartySeedRows_(nowIso)
    );
    kspAddAction_(report, 'seed', KSP_SHEET_NAMES.COUNTERPARTY_MASTER, 'upserted', counterpartyResult);

    var optionResult = environment.insertMissingRows(
      backendSpreadsheetId,
      KSP_SHEET_NAMES.OPTION_MASTER,
      'Option_ID',
      kspBuildOptionSeedRows_(nowIso)
    );
    kspAddAction_(report, 'seed', KSP_SHEET_NAMES.OPTION_MASTER, 'upserted', optionResult);

    var settingsResult = environment.upsertRows(
      resources[KSP_RESOURCE_KEYS.BACKEND_SPREADSHEET],
      KSP_SHEET_NAMES.SETTINGS,
      'Key',
      kspBuildSettingsRows_(config, resources, nowIso),
      { preserveExistingKeys: kspGetSettingsPreserveExistingKeys_() }
    );
    kspAddAction_(report, 'settings', KSP_SHEET_NAMES.SETTINGS, 'upserted', settingsResult);

    kspEnsureTriggers_(environment, kspGetTriggerRegistry_(config), report);

    var storedState = kspBuildStoredInstallationState_(config, resources, nowIso);
    environment.setProperty(
      KSP_PROPERTY_KEYS.INSTALLATION_STATE_JSON,
      JSON.stringify(storedState)
    );
    environment.deleteProperty(KSP_PROPERTY_KEYS.BOOTSTRAP_CONFIG_JSON);
    kspAddAction_(report, 'state', KSP_PROPERTY_KEYS.INSTALLATION_STATE_JSON, 'saved', {
      schemaVersion: KSP_SCHEMA_VERSION
    });

    kspFinalizeReport_(report, environment.nowIso());
    environment.setProperty(KSP_PROPERTY_KEYS.LAST_SETUP_REPORT_JSON, JSON.stringify(report));
    return report;
  } catch (error) {
    kspAddError_(report, kspGetErrorCode_(error), error.message || String(error), {
      stack: kspStringifyError_(error)
    });
    kspFinalizeReport_(report, environment.nowIso());
    try {
      environment.setProperty(KSP_PROPERTY_KEYS.LAST_SETUP_REPORT_JSON, JSON.stringify(report));
    } catch (ignored) {
      // Preserve the original setup failure.
    }
    return report;
  } finally {
    if (lock) {
      environment.releaseScriptLock(lock);
    }
  }
}

function kspBuildLegacyMeetingCounterpartyBackfill_(row) {
  var source = row || {};
  var gpId = String(source.GP_ID || '').trim();
  if (!gpId) return null;
  var type = String(source.Counterparty_Type || '').trim();
  var entityId = String(source.Counterparty_ID || '').trim();
  var relatedGpIds = String(source.Related_GP_IDs || '').trim();
  if ((type && type !== 'GP') || (entityId && entityId !== gpId)) return null;
  var patch = {};
  if (!type) patch.Counterparty_Type = 'GP';
  if (!entityId) patch.Counterparty_ID = gpId;
  if (!relatedGpIds) patch.Related_GP_IDs = gpId;
  return Object.keys(patch).length ? patch : null;
}

function kspResolveAllResources_(environment, storedResources, config, report) {
  var resources = kspDeepClone_(storedResources || {});

  var knowledgeRoot = kspResolveResource_(environment, resources, report, {
    key: KSP_RESOURCE_KEYS.KNOWLEDGE_ROOT,
    parentId: config.knowledgeParentFolderId,
    name: KSP_RESOURCE_NAMES.KNOWLEDGE_ROOT,
    legacyName: KSP_LEGACY_RESOURCE_NAMES.KNOWLEDGE_ROOT,
    mimeType: KSP_MIME_TYPES.FOLDER
  });

  kspResolveResource_(environment, resources, report, {
    key: KSP_RESOURCE_KEYS.MEETING_RECORDS,
    parentId: knowledgeRoot.id,
    name: KSP_RESOURCE_NAMES.MEETING_RECORDS,
    legacyName: KSP_LEGACY_RESOURCE_NAMES.MEETING_RECORDS,
    mimeType: KSP_MIME_TYPES.FOLDER
  });

  kspResolveResource_(environment, resources, report, {
    key: KSP_RESOURCE_KEYS.PITCHBOOKS,
    parentId: knowledgeRoot.id,
    name: KSP_RESOURCE_NAMES.PITCHBOOKS,
    legacyName: KSP_LEGACY_RESOURCE_NAMES.PITCHBOOKS,
    mimeType: KSP_MIME_TYPES.FOLDER
  });

  kspResolveResource_(environment, resources, report, {
    key: KSP_RESOURCE_KEYS.NEWS,
    parentId: knowledgeRoot.id,
    name: KSP_RESOURCE_NAMES.NEWS,
    mimeType: KSP_MIME_TYPES.FOLDER
  });

  kspResolveResource_(environment, resources, report, {
    key: KSP_RESOURCE_KEYS.INTERNAL_ASSESSMENTS,
    parentId: knowledgeRoot.id,
    name: KSP_RESOURCE_NAMES.INTERNAL_ASSESSMENTS,
    mimeType: KSP_MIME_TYPES.FOLDER
  });

  kspResolveResource_(environment, resources, report, {
    key: KSP_RESOURCE_KEYS.KNOWLEDGE_EXPORTS,
    parentId: config.knowledgeParentFolderId,
    name: KSP_RESOURCE_NAMES.KNOWLEDGE_EXPORTS,
    mimeType: KSP_MIME_TYPES.FOLDER
  });

  kspResolveResource_(environment, resources, report, {
    key: KSP_RESOURCE_KEYS.BACKUP_FOLDER,
    parentId: config.controlFolderId,
    name: KSP_RESOURCE_NAMES.BACKUP_FOLDER,
    mimeType: KSP_MIME_TYPES.FOLDER
  });

  kspResolveResource_(environment, resources, report, {
    key: KSP_RESOURCE_KEYS.BACKEND_SPREADSHEET,
    parentId: config.controlFolderId,
    name: KSP_RESOURCE_NAMES.BACKEND_SPREADSHEET,
    mimeType: KSP_MIME_TYPES.SPREADSHEET
  });

  kspResolveResource_(environment, resources, report, {
    key: KSP_RESOURCE_KEYS.AUDIT_SPREADSHEET,
    parentId: config.controlFolderId,
    name: KSP_RESOURCE_NAMES.AUDIT_SPREADSHEET,
    mimeType: KSP_MIME_TYPES.SPREADSHEET
  });

  return resources;
}

function kspResolveResource_(environment, resources, report, specification) {
  var storedId = resources[specification.key];
  var resource;

  if (storedId) {
    resource = environment.getResource(storedId);
    kspAssert_(resource, 'STORED_RESOURCE_NOT_FOUND',
      'Stored resource is not accessible: ' + specification.key + ' (' + storedId + ').');
    kspAssert_(resource.mimeType === specification.mimeType, 'STORED_RESOURCE_TYPE_MISMATCH',
      'Stored resource has the wrong MIME type: ' + specification.key + '.');
    kspAssert_((resource.parents || []).indexOf(specification.parentId) !== -1,
      'STORED_RESOURCE_PARENT_MISMATCH',
      'Stored resource is outside the configured parent boundary: ' + specification.key + '.');
    if (specification.legacyName && resource.name === specification.legacyName) {
      var conflicts = environment.findChildren(
        specification.parentId, specification.name, specification.mimeType
      ).filter(function (candidate) { return candidate.id !== storedId; });
      kspAssert_(conflicts.length === 0, 'RESOURCE_RENAME_CONFLICT',
        'A canonical-name resource already exists for ' + specification.key + '.');
      var renamed = environment.renameResource(storedId, specification.name);
      kspAssert_(renamed && renamed.id === storedId && renamed.name === specification.name,
        'RESOURCE_RENAME_FAILED', 'Stored resource could not be renamed: ' + specification.key + '.');
      resource = environment.getResource(storedId);
      kspAssert_(resource && resource.name === specification.name &&
        (resource.parents || []).indexOf(specification.parentId) !== -1,
      'RESOURCE_RENAME_READBACK_FAILED', 'Stored resource rename could not be verified: ' + specification.key + '.');
      kspAddAction_(report, 'migration', specification.key, 'renamed', {
        id: storedId, fromName: specification.legacyName, name: specification.name
      });
    } else if (resource.name !== specification.name) {
      kspAddWarning_(report, 'STORED_RESOURCE_RENAMED',
        'Stored resource name differs from the accepted default; the stored ID remains authoritative.', {
          key: specification.key,
          expectedName: specification.name,
          actualName: resource.name,
          id: resource.id
        });
    }
    kspAddAction_(report, 'resource', specification.key, 'reused', {
      id: resource.id,
      name: resource.name,
      source: 'stored-id'
    });
    return resource;
  }

  if (specification.legacyName) {
    var legacyMatches = environment.findChildren(
      specification.parentId, specification.legacyName, specification.mimeType
    );
    kspAssert_(legacyMatches.length === 0, 'LEGACY_RESOURCE_ID_REQUIRED',
      'A legacy resource exists without an authoritative stored ID: ' + specification.key + '.');
  }

  var matches = environment.findChildren(
    specification.parentId,
    specification.name,
    specification.mimeType
  );

  kspAssert_(matches.length <= 1, 'DUPLICATE_RESOURCE_CANDIDATES',
    'Multiple exact-name resources found for ' + specification.name + '.');

  if (matches.length === 1) {
    resource = matches[0];
    kspAddAction_(report, 'resource', specification.key, 'reused', {
      id: resource.id,
      name: resource.name,
      source: 'exact-name'
    });
  } else if (specification.mimeType === KSP_MIME_TYPES.FOLDER) {
    resource = environment.createFolder(specification.parentId, specification.name);
    kspAddAction_(report, 'resource', specification.key, 'created', {
      id: resource.id,
      name: resource.name
    });
  } else if (specification.mimeType === KSP_MIME_TYPES.SPREADSHEET) {
    resource = environment.createSpreadsheet(specification.parentId, specification.name);
    kspAddAction_(report, 'resource', specification.key, 'created', {
      id: resource.id,
      name: resource.name
    });
  } else {
    throw new Error('Unsupported setup resource MIME type: ' + specification.mimeType);
  }

  resources[specification.key] = resource.id;
  return resource;
}

function kspEnsureSpreadsheetSchemas_(environment, spreadsheetId, schemas, category, report) {
  Object.keys(schemas).forEach(function (sheetName) {
    var result = environment.ensureSheet(spreadsheetId, sheetName, schemas[sheetName]);
    kspAddAction_(report, 'schema', category + ':' + sheetName, result.action, result);
  });
}

function kspEnsureTriggers_(environment, registry, report) {
  var existingTriggers = environment.listTriggers();

  registry.forEach(function (rule) {
    var legacyHandlers = rule.legacyHandlers || [];
    var legacyMatches = existingTriggers.filter(function (trigger) {
      return trigger.eventType === rule.eventType && legacyHandlers.indexOf(trigger.handler) !== -1;
    });
    legacyMatches.forEach(function (trigger) {
      kspAssert_(typeof environment.deleteTrigger === 'function', 'TRIGGER_MIGRATION_UNSUPPORTED',
        'Trigger migration requires a deleteTrigger adapter.');
      kspAssert_(trigger.id, 'TRIGGER_MIGRATION_ID_MISSING',
        'Legacy trigger migration requires a trigger ID.');
      environment.deleteTrigger(trigger.id);
      kspAddAction_(report, 'trigger', rule.key, 'migrated', {
        removedHandler: trigger.handler,
        replacementHandler: rule.handler,
        eventType: rule.eventType,
        id: trigger.id
      });
    });
    if (legacyMatches.length) {
      existingTriggers = existingTriggers.filter(function (trigger) {
        return legacyMatches.indexOf(trigger) === -1;
      });
    }

    if (!rule.enabled) {
      kspAddAction_(report, 'trigger', rule.key, 'skipped', { reason: 'disabled' });
      return;
    }

    kspAssert_(rule.available !== false, 'TRIGGER_HANDLER_NOT_AVAILABLE',
      'Trigger handler is not implemented in the current application version: ' + rule.handler + '.');

    var matches = existingTriggers.filter(function (trigger) {
      return trigger.handler === rule.handler && trigger.eventType === rule.eventType;
    });

    if (matches.length > 0) {
      if (rule.deduplicate && matches.length > 1) {
        kspAssert_(typeof environment.deleteTrigger === 'function' && matches.every(function (trigger) { return trigger.id; }),
          'TRIGGER_DEDUPLICATION_UNSUPPORTED', 'Duplicate trigger cleanup requires exact trigger IDs.');
        matches.slice(1).forEach(function (trigger) {
          environment.deleteTrigger(trigger.id);
          kspAddAction_(report, 'trigger', rule.key, 'duplicate-removed', { id: trigger.id, handler: rule.handler });
        });
        existingTriggers = existingTriggers.filter(function (trigger) { return matches.slice(1).indexOf(trigger) === -1; });
        matches = matches.slice(0, 1);
      }
      kspAddAction_(report, 'trigger', rule.key, 'reused', {
        count: matches.length,
        handler: rule.handler,
        eventType: rule.eventType
      });
      if (matches.length > 1) {
        kspAddWarning_(report, 'DUPLICATE_EXISTING_TRIGGERS',
          'Multiple matching triggers already exist; setup did not create another trigger.', {
            key: rule.key,
            count: matches.length
          });
      }
      return;
    }

    var created = rule.schedule === 'DAILY'
      ? environment.createDailyTrigger(rule.handler, rule.timezone)
      : environment.createClockTrigger(rule.handler, rule.intervalMinutes);
    kspAssert_(created && created.handler === rule.handler && created.eventType === rule.eventType,
      'TRIGGER_CREATE_MISMATCH', 'Created trigger does not match the required handler and event type.');
    existingTriggers.push(created);
    kspAddAction_(report, 'trigger', rule.key, 'created', {
      handler: rule.handler,
      eventType: rule.eventType,
      schedule: rule.schedule || 'MINUTES',
      intervalMinutes: rule.intervalMinutes || null,
      id: created.id || null
    });
  });
}
function kspRunValidation_(environment) {
  var report = kspCreateReport_('VALIDATE', environment.nowIso());

  try {
    var state = kspLoadInstallationState_(environment);
    kspAssert_(state && state.config && state.resources, 'INSTALLATION_STATE_MISSING',
      'Installation state is missing. Run setupKnowledgePlatform_() first.');

    var config = kspNormalizeAndValidateConfig_(state.config);
    report.environment = config.environment;
    report.resources = kspDeepClone_(state.resources);

    var resourceChecks = [
      [KSP_RESOURCE_KEYS.KNOWLEDGE_ROOT, KSP_MIME_TYPES.FOLDER],
      [KSP_RESOURCE_KEYS.MEETING_RECORDS, KSP_MIME_TYPES.FOLDER],
      [KSP_RESOURCE_KEYS.PITCHBOOKS, KSP_MIME_TYPES.FOLDER],
      [KSP_RESOURCE_KEYS.NEWS, KSP_MIME_TYPES.FOLDER],
      [KSP_RESOURCE_KEYS.INTERNAL_ASSESSMENTS, KSP_MIME_TYPES.FOLDER],
      [KSP_RESOURCE_KEYS.KNOWLEDGE_EXPORTS, KSP_MIME_TYPES.FOLDER],
      [KSP_RESOURCE_KEYS.BACKUP_FOLDER, KSP_MIME_TYPES.FOLDER],
      [KSP_RESOURCE_KEYS.BACKEND_SPREADSHEET, KSP_MIME_TYPES.SPREADSHEET],
      [KSP_RESOURCE_KEYS.AUDIT_SPREADSHEET, KSP_MIME_TYPES.SPREADSHEET]
    ];

    resourceChecks.forEach(function (check) {
      var id = state.resources[check[0]];
      kspAssert_(id, 'RESOURCE_ID_MISSING', 'Missing stored resource ID: ' + check[0]);
      var resource = environment.getResource(id);
      kspAssert_(resource, 'RESOURCE_NOT_ACCESSIBLE', 'Resource is not accessible: ' + check[0]);
      kspAssert_(resource.mimeType === check[1], 'RESOURCE_TYPE_MISMATCH',
        'Resource has unexpected MIME type: ' + check[0]);
      kspAddAction_(report, 'validation', check[0], 'passed', { id: id });
    });

    var parentChecks = [
      [KSP_RESOURCE_KEYS.KNOWLEDGE_ROOT, config.knowledgeParentFolderId],
      [KSP_RESOURCE_KEYS.MEETING_RECORDS, state.resources[KSP_RESOURCE_KEYS.KNOWLEDGE_ROOT]],
      [KSP_RESOURCE_KEYS.PITCHBOOKS, state.resources[KSP_RESOURCE_KEYS.KNOWLEDGE_ROOT]],
      [KSP_RESOURCE_KEYS.NEWS, state.resources[KSP_RESOURCE_KEYS.KNOWLEDGE_ROOT]],
      [KSP_RESOURCE_KEYS.INTERNAL_ASSESSMENTS, state.resources[KSP_RESOURCE_KEYS.KNOWLEDGE_ROOT]],
      [KSP_RESOURCE_KEYS.KNOWLEDGE_EXPORTS, config.knowledgeParentFolderId],
      [KSP_RESOURCE_KEYS.BACKUP_FOLDER, config.controlFolderId],
      [KSP_RESOURCE_KEYS.BACKEND_SPREADSHEET, config.controlFolderId],
      [KSP_RESOURCE_KEYS.AUDIT_SPREADSHEET, config.controlFolderId]
    ];
    parentChecks.forEach(function (check) {
      var resource = environment.getResource(state.resources[check[0]]);
      kspAssert_((resource.parents || []).indexOf(check[1]) !== -1,
        'RESOURCE_PARENT_MISMATCH', 'Resource is outside the configured parent boundary: ' + check[0]);
      kspAddAction_(report, 'validation', check[0] + ':parent', 'passed', { parentId: check[1] });
    });

    kspValidateSchemas_(
      environment,
      state.resources[KSP_RESOURCE_KEYS.BACKEND_SPREADSHEET],
      kspGetBackendSchemas_(),
      'backend',
      report
    );
    kspValidateSchemas_(
      environment,
      state.resources[KSP_RESOURCE_KEYS.AUDIT_SPREADSHEET],
      kspGetAuditSchema_(),
      'audit',
      report
    );

    var counterpartyIds = environment.getColumnValues(
      state.resources[KSP_RESOURCE_KEYS.BACKEND_SPREADSHEET],
      KSP_SHEET_NAMES.COUNTERPARTY_MASTER,
      'Counterparty_ID'
    );
    var optionIds = environment.getColumnValues(
      state.resources[KSP_RESOURCE_KEYS.BACKEND_SPREADSHEET],
      KSP_SHEET_NAMES.OPTION_MASTER,
      'Option_ID'
    );

    kspGetCounterpartySeedDefinitions_().forEach(function (seed) {
      kspAssert_(counterpartyIds.indexOf(seed[0]) !== -1,
        'COUNTERPARTY_SEED_MISSING', 'Missing Counterparty seed: ' + seed[0]);
    });
    kspGetOptionSeedDefinitions_().forEach(function (seed) {
      kspAssert_(optionIds.indexOf(seed[0]) !== -1, 'OPTION_SEED_MISSING', 'Missing Option seed: ' + seed[0]);
    });
    kspAddAction_(report, 'validation', 'master-seeds', 'passed', {
      counterpartySeedCount: kspGetCounterpartySeedDefinitions_().length,
      optionSeedCount: kspGetOptionSeedDefinitions_().length
    });

    var triggerRegistry = kspGetTriggerRegistry_(config);
    var existingTriggers = environment.listTriggers();
    triggerRegistry.forEach(function (rule) {
      if (!rule.enabled) {
        return;
      }
      var found = existingTriggers.some(function (trigger) {
        return trigger.handler === rule.handler && trigger.eventType === rule.eventType;
      });
      kspAssert_(found, 'TRIGGER_MISSING', 'Required trigger is missing: ' + rule.key);
    });

    return kspFinalizeReport_(report, environment.nowIso());
  } catch (error) {
    kspAddError_(report, kspGetErrorCode_(error), error.message || String(error), {
      stack: kspStringifyError_(error)
    });
    return kspFinalizeReport_(report, environment.nowIso());
  }
}

function kspValidateSchemas_(environment, spreadsheetId, schemas, category, report) {
  Object.keys(schemas).forEach(function (sheetName) {
    var actualHeaders = environment.getSheetHeaders(spreadsheetId, sheetName);
    var missing = schemas[sheetName].filter(function (header) {
      return actualHeaders.indexOf(header) === -1;
    });
    kspAssert_(missing.length === 0, 'SCHEMA_COLUMNS_MISSING',
      category + ':' + sheetName + ' is missing columns: ' + missing.join(', '));
    kspAddAction_(report, 'validation', category + ':' + sheetName, 'passed', {
      columnCount: actualHeaders.length
    });
  });
}

function kspGetStatus_(environment) {
  var state;
  try {
    state = kspLoadInstallationState_(environment);
  } catch (error) {
    return {
      installed: false,
      ok: false,
      error: error.message || String(error)
    };
  }

  var resources = state && state.resources ? state.resources : {};
  var requiredKeys = Object.keys(KSP_RESOURCE_KEYS).map(function (constantKey) {
    return KSP_RESOURCE_KEYS[constantKey];
  });
  var missingResourceKeys = requiredKeys.filter(function (key) { return !resources[key]; });

  return {
    installed: Boolean(state && state.config && missingResourceKeys.length === 0),
    ok: true,
    componentWorkId: state.componentWorkId || KSP_COMPONENT_WORK_ID,
    releaseVersion: state.releaseVersion || state.appVersion || KSP_RELEASE_VERSION,
    appVersion: state.appVersion || null,
    schemaVersion: state.schemaVersion || null,
    environment: state.config ? state.config.environment : null,
    updatedAt: state.updatedAt || null,
    resources: kspDeepClone_(resources),
    missingResourceKeys: missingResourceKeys
  };
}
// ===== END src/10_Setup.gs =====

// ===== BEGIN src/15_Installer.gs =====
var KSP_INSTALLATION_SHEET_NAME = 'KnowledgeShare_Installation';
var KSP_INSTALLER_OWNER_LATCH_VERSION = 1;
var KSP_DEPLOYMENT_SECURITY_ATTESTATION_VERSION = 1;

var KSP_INSTALLER_STATES = Object.freeze({
  INSTALLING: 'INSTALLING',
  READY_FOR_DEPLOYMENT: 'READY_FOR_DEPLOYMENT',
  READY: 'READY',
  ACTION_REQUIRED: 'ACTION_REQUIRED',
  FAILED: 'FAILED'
});

function kspNormalizeInstallerIdentity_(value) {
  return String(value || '').trim().toLowerCase();
}

function kspInstallerError_(code, message) {
  var error = new Error(message);
  error.code = code;
  return error;
}

function kspWithInstallerLock_(environment, callback) {
  var lock = null;
  try {
    lock = environment.acquireScriptLock(KSP_DEFAULTS.LOCK_TIMEOUT_MS);
    return callback();
  } finally {
    if (lock) environment.releaseScriptLock(lock);
  }
}

function kspReadInstallerOwner_(environment) {
  var raw = environment.getProperty(KSP_PROPERTY_KEYS.INSTALLER_OWNER_JSON);
  if (!raw) return null;
  var value;
  try {
    value = JSON.parse(raw);
  } catch (ignored) {
    throw kspInstallerError_('INSTALLER_OWNER_LATCH_INVALID', 'Installer owner latch is malformed.');
  }
  var ownerEmail = kspNormalizeInstallerIdentity_(value && value.ownerEmail);
  kspAssert_(kspIsPlainObject_(value) && value.version === KSP_INSTALLER_OWNER_LATCH_VERSION &&
    ownerEmail && value.ownerEmail === ownerEmail,
  'INSTALLER_OWNER_LATCH_INVALID', 'Installer owner latch is invalid.');
  return ownerEmail;
}

function kspWriteInstallerOwner_(environment, ownerEmail) {
  environment.setProperty(KSP_PROPERTY_KEYS.INSTALLER_OWNER_JSON, JSON.stringify({
    version: KSP_INSTALLER_OWNER_LATCH_VERSION,
    ownerEmail: ownerEmail
  }));
}

function kspBuildInstallerBootstrapConfig_(authorization) {
  return {
    environment: 'PROD',
    knowledgeParentFolderId: authorization.parentId,
    controlFolderId: authorization.parentId,
    adminEmails: [authorization.activeEmail],
    timezone: KSP_DEFAULTS.TIMEZONE,
    aiSyncEnabled: false,
    aiSyncIntervalMinutes: KSP_DEFAULTS.AI_SYNC_INTERVAL_MINUTES
  };
}

function kspAssertInstallerBootstrapMatches_(environment, expected) {
  var raw = environment.getProperty(KSP_PROPERTY_KEYS.BOOTSTRAP_CONFIG_JSON);
  if (!raw) return false;
  var actual;
  try {
    actual = kspNormalizeAndValidateConfig_(JSON.parse(raw));
  } catch (ignored) {
    throw kspInstallerError_('INSTALLER_BOOTSTRAP_CONFLICT', 'Installer bootstrap config is malformed.');
  }
  var actualAdmins = kspNormalizeEmailList_(actual.adminEmails);
  var expectedAdmins = kspNormalizeEmailList_(expected.adminEmails);
  kspAssert_(actual.environment === expected.environment &&
    actual.knowledgeParentFolderId === expected.knowledgeParentFolderId &&
    actual.controlFolderId === expected.controlFolderId &&
    actual.timezone === expected.timezone &&
    actual.aiSyncEnabled === expected.aiSyncEnabled &&
    actual.aiSyncIntervalMinutes === expected.aiSyncIntervalMinutes &&
    actualAdmins.length === 1 && expectedAdmins.length === 1 && actualAdmins[0] === expectedAdmins[0],
  'INSTALLER_BOOTSTRAP_CONFLICT', 'Installer bootstrap config conflicts with the latched owner or host.');
  return true;
}

function kspAuthorizeAndLatchInstaller_(environment) {
  return kspWithInstallerLock_(environment, function () {
    var bound = environment.getBoundSpreadsheetContext();
    kspAssert_(bound && bound.id, 'INSTALLER_BOUND_SPREADSHEET_REQUIRED',
      'このインストーラーは導入先スプレッドシートに紐づくApps Scriptから実行してください。');
    kspAssert_(Array.isArray(bound.parentIds) && bound.parentIds.length === 1,
      'INSTALLER_PARENT_AMBIGUOUS', '導入先スプレッドシートの親フォルダを1つにしてください。');

    var identities = environment.getSessionIdentities();
    var active = kspNormalizeInstallerIdentity_(identities && identities.active);
    var effective = kspNormalizeInstallerIdentity_(identities && identities.effective);
    kspAssert_(active, 'INSTALLER_ACTIVE_USER_REQUIRED',
      '会社管理者アカウントを識別できません。識別可能なアカウントで再実行してください。');

    var state = kspLoadInstallationState_(environment);
    var owner = kspReadInstallerOwner_(environment);
    var installed = Boolean(state && state.config);
    var administrators = installed ? kspNormalizeEmailList_(state.config.adminEmails || []) : [];

    if (!installed) {
      kspAssert_(effective && active === effective, 'INSTALLER_IDENTITY_AMBIGUOUS',
        '初回導入では実行ユーザーと有効ユーザーが一致する必要があります。');
      if (owner) {
        kspAssert_(active === owner, 'INSTALLER_OWNER_MISMATCH',
          '中断した導入は最初に確認された会社管理者だけが再開できます。');
      }
      var authorization = {
        activeEmail: active,
        ownerEmail: owner || active,
        parentId: String(bound.parentIds[0]),
        spreadsheetId: String(bound.id),
        spreadsheetName: String(bound.name || '')
      };
      var bootstrap = kspBuildInstallerBootstrapConfig_(authorization);
      var hasBootstrap = kspAssertInstallerBootstrapMatches_(environment, bootstrap);
      if (!owner) {
        owner = active;
        kspWriteInstallerOwner_(environment, owner);
      }
      authorization.ownerEmail = owner;
      if (!hasBootstrap) {
        environment.setProperty(KSP_PROPERTY_KEYS.BOOTSTRAP_CONFIG_JSON, JSON.stringify(bootstrap));
      }
      authorization.state = state;
      return authorization;
    }

    kspAssert_(administrators.indexOf(active) !== -1, 'INSTALLER_ADMIN_REQUIRED',
      '登録済みの会社管理者アカウントで再実行してください。');
    if (!owner) {
      kspAssert_(administrators.length === 1 && administrators[0] === active,
        'INSTALLER_OWNER_MIGRATION_AMBIGUOUS',
        'Pre-latch owner migration requires the sole authoritative administrator.');
      owner = active;
      kspWriteInstallerOwner_(environment, owner);
    }
    kspAssert_(administrators.indexOf(owner) !== -1, 'INSTALLER_OWNER_CONFIG_CONFLICT',
      'Installer owner is not present in the authoritative administrator configuration.');

    return {
      activeEmail: active,
      ownerEmail: owner,
      parentId: String(bound.parentIds[0]),
      spreadsheetId: String(bound.id),
      spreadsheetName: String(bound.name || ''),
      state: state
    };
  });
}

function kspInstallerSafeError_(error) {
  var code = kspGetErrorCode_(error, 'INSTALLER_FAILED');
  var messages = {
    INSTALLER_BOUND_SPREADSHEET_REQUIRED: '導入先スプレッドシートからApps Scriptを開いて再実行してください。',
    INSTALLER_PARENT_AMBIGUOUS: '導入先スプレッドシートの保存場所を確認してください。',
    INSTALLER_ACTIVE_USER_REQUIRED: '会社管理者アカウントで再実行してください。',
    INSTALLER_IDENTITY_AMBIGUOUS: '初回導入は実行ユーザーと有効ユーザーが一致する会社管理者アカウントで行ってください。',
    INSTALLER_ADMIN_REQUIRED: '登録済みの会社管理者アカウントで再実行してください。',
    INSTALLER_OWNER_MISMATCH: '最初に導入を開始した会社管理者アカウントで再実行してください。',
    INSTALLER_OWNER_LATCH_INVALID: '導入所有者の記録が不正です。サポート担当者に確認してください。',
    INSTALLER_OWNER_CONFIG_CONFLICT: '導入所有者と管理者設定が一致しません。サポート担当者に確認してください。',
    INSTALLER_OWNER_MIGRATION_AMBIGUOUS: '既存導入の所有者を一意に確認できません。サポート担当者に確認してください。',
    INSTALLER_BOOTSTRAP_CONFLICT: '中断した導入設定が現在の管理者または保存場所と一致しません。',
    SETUP_LOCK_TIMEOUT: '別の導入処理が実行中です。完了後に再実行してください。',
    DUPLICATE_RESOURCE_CANDIDATES: '同名ファイルが複数あります。管理者に確認してください。',
    INSTALLATION_STATE_MISSING: 'installKnowledgeShare を先に実行してください。',
    WEB_APP_DEPLOYMENT_REQUIRED: '会社限定のWeb Appをデプロイしてから再実行してください。',
    WEB_APP_DEPLOYMENT_IDENTITY_INVALID: 'Web AppのデプロイURLを確認してください。',
    DEPLOYMENT_SECURITY_ATTESTATION_REQUIRED: 'デプロイ設定を管理者が確認し、confirmKnowledgeShareDeploymentSecurity を実行してください。',
    DEPLOYMENT_SECURITY_ATTESTATION_INVALID: 'デプロイ確認記録が不正です。管理者が設定を再確認してください。',
    DEPLOYMENT_SECURITY_ATTESTATION_STALE: 'Web Appが変更されています。管理者がデプロイ設定を再確認してください。'
  };
  return { code: code, message: messages[code] || '導入状態を確認して、会社管理者として再実行してください。' };
}

// Closed vocabularies only: never log status payloads, identities, or raw errors.
function kspLogInstallerOutcome_(status) {
  var states = ['INSTALLING', 'READY_FOR_DEPLOYMENT', 'READY', 'ACTION_REQUIRED', 'FAILED'];
  var codes = [
    'INSTALLER_BOUND_SPREADSHEET_REQUIRED', 'INSTALLER_PARENT_AMBIGUOUS',
    'INSTALLER_ACTIVE_USER_REQUIRED', 'INSTALLER_IDENTITY_AMBIGUOUS',
    'INSTALLER_ADMIN_REQUIRED', 'INSTALLER_OWNER_MISMATCH',
    'INSTALLER_OWNER_LATCH_INVALID', 'INSTALLER_OWNER_CONFIG_CONFLICT',
    'INSTALLER_OWNER_MIGRATION_AMBIGUOUS', 'INSTALLER_BOOTSTRAP_CONFLICT',
    'SETUP_LOCK_TIMEOUT', 'DUPLICATE_RESOURCE_CANDIDATES', 'INSTALLATION_STATE_MISSING',
    'WEB_APP_DEPLOYMENT_REQUIRED', 'WEB_APP_DEPLOYMENT_IDENTITY_INVALID',
    'DEPLOYMENT_SECURITY_ATTESTATION_REQUIRED', 'DEPLOYMENT_SECURITY_ATTESTATION_INVALID',
    'DEPLOYMENT_SECURITY_ATTESTATION_STALE'
  ];
  var state = status && states.indexOf(status.state) !== -1 ? status.state : 'FAILED';
  var code = status && status.error ?
    (codes.indexOf(status.error.code) !== -1 ? status.error.code : 'INSTALLER_FAILED') : 'NONE';
  console.log(JSON.stringify({ state: state, code: code }));
}

function kspBuildInstallerStatus_(state, nextAction, details) {
  var metadata = kspGetDistributionMetadata_();
  var data = details || {};
  return {
    ok: state === KSP_INSTALLER_STATES.READY || state === KSP_INSTALLER_STATES.READY_FOR_DEPLOYMENT,
    state: state,
    nextAction: nextAction,
    releaseVersion: metadata.releaseVersion,
    schemaVersion: metadata.schemaVersion,
    sourceCommit: metadata.sourceCommit,
    bundleProfile: metadata.bundleProfile,
    bundlePayloadSha256: metadata.bundlePayloadSha256,
    resourceSummary: data.resourceSummary || '',
    error: data.error || null
  };
}

function kspPersistInstallerStatus_(environment, status) {
  if (environment && typeof environment.writeInstallationStatus === 'function') {
    environment.writeInstallationStatus(status);
  }
  return status;
}

function kspGetWebAppDeploymentIdentity_(environment) {
  var identity = String(environment.getWebAppDeploymentIdentity() || '').trim();
  if (!identity) return '';
  kspAssert_(/^https:\/\/script\.google\.com\/macros\/s\/[A-Za-z0-9_-]+\/(?:exec|dev)$/.test(identity),
    'WEB_APP_DEPLOYMENT_IDENTITY_INVALID', 'A versioned Web App execution URL is required.');
  return identity.replace(/\/dev$/, '/exec');
}

function kspReadDeploymentSecurityAttestation_(environment) {
  var raw = environment.getProperty(KSP_PROPERTY_KEYS.DEPLOYMENT_SECURITY_ATTESTATION_JSON);
  if (!raw) return null;
  var value;
  try {
    value = JSON.parse(raw);
  } catch (ignored) {
    throw kspInstallerError_('DEPLOYMENT_SECURITY_ATTESTATION_INVALID', 'Deployment attestation is malformed.');
  }
  kspAssert_(kspIsPlainObject_(value) &&
    value.version === KSP_DEPLOYMENT_SECURITY_ATTESTATION_VERSION &&
    /^[0-9a-f]{64}$/.test(String(value.deploymentIdentitySha256 || '')) &&
    /^\d{4}-\d{2}-\d{2}T/.test(String(value.confirmedAt || '')),
  'DEPLOYMENT_SECURITY_ATTESTATION_INVALID', 'Deployment attestation is invalid.');
  return value;
}

function kspBuildDeploymentReadinessStatus_(environment, resourceSummary) {
  var identity = kspGetWebAppDeploymentIdentity_(environment);
  if (!identity) {
    return kspBuildInstallerStatus_(KSP_INSTALLER_STATES.READY_FOR_DEPLOYMENT,
      'Apps Scriptで会社限定のWeb Appを1回デプロイし、デプロイ設定を確認してください。',
      { resourceSummary: resourceSummary });
  }

  var attestation;
  try {
    attestation = kspReadDeploymentSecurityAttestation_(environment);
  } catch (error) {
    var invalid = kspInstallerSafeError_(error);
    return kspBuildInstallerStatus_(KSP_INSTALLER_STATES.ACTION_REQUIRED, invalid.message,
      { resourceSummary: resourceSummary, error: invalid });
  }
  if (!attestation) {
    var required = kspInstallerSafeError_({ code: 'DEPLOYMENT_SECURITY_ATTESTATION_REQUIRED' });
    return kspBuildInstallerStatus_(KSP_INSTALLER_STATES.ACTION_REQUIRED, required.message,
      { resourceSummary: resourceSummary, error: required });
  }

  var currentHash = String(environment.hashDeploymentIdentity(identity) || '');
  if (!/^[0-9a-f]{64}$/.test(currentHash)) {
    var hashInvalid = kspInstallerSafeError_({ code: 'DEPLOYMENT_SECURITY_ATTESTATION_INVALID' });
    return kspBuildInstallerStatus_(KSP_INSTALLER_STATES.ACTION_REQUIRED, hashInvalid.message,
      { resourceSummary: resourceSummary, error: hashInvalid });
  }
  if (attestation.deploymentIdentitySha256 !== currentHash) {
    var stale = kspInstallerSafeError_({ code: 'DEPLOYMENT_SECURITY_ATTESTATION_STALE' });
    return kspBuildInstallerStatus_(KSP_INSTALLER_STATES.ACTION_REQUIRED, stale.message,
      { resourceSummary: resourceSummary, error: stale });
  }

  return kspBuildInstallerStatus_(KSP_INSTALLER_STATES.READY,
    '管理者が会社限定のデプロイ設定を確認済みです。Web Appを承認済みの社内利用者へ共有できます。',
    { resourceSummary: resourceSummary });
}

function kspRunInstaller_(environment) {
  try {
    kspAuthorizeAndLatchInstaller_(environment);
  } catch (error) {
    var denied = kspInstallerSafeError_(error);
    return kspBuildInstallerStatus_(KSP_INSTALLER_STATES.ACTION_REQUIRED, denied.message, { error: denied });
  }

  try {
    kspPersistInstallerStatus_(environment, kspBuildInstallerStatus_(
      KSP_INSTALLER_STATES.INSTALLING, '導入処理を実行しています。'));

    var setup = kspRunSetup_(environment);
    if (!setup.ok) {
      var setupError = setup.errors && setup.errors[0] ? setup.errors[0] : { code: 'INSTALLER_FAILED' };
      var safeSetupError = kspInstallerSafeError_({ code: setupError.code });
      return kspPersistInstallerStatus_(environment, kspBuildInstallerStatus_(
        KSP_INSTALLER_STATES.FAILED, safeSetupError.message, { error: safeSetupError }));
    }

    kspAuthorizeAndLatchInstaller_(environment);
    var validation = kspRunValidation_(environment);
    if (!validation.ok) {
      var validationError = validation.errors && validation.errors[0] ? validation.errors[0] : { code: 'INSTALLER_FAILED' };
      var safeValidationError = kspInstallerSafeError_({ code: validationError.code });
      return kspPersistInstallerStatus_(environment, kspBuildInstallerStatus_(
        KSP_INSTALLER_STATES.FAILED, safeValidationError.message, { error: safeValidationError }));
    }

    // Installation completion is independent of HEAD/test deployment surfaces.
    // Security attestation remains the separate post-deployment readiness gate.
    return kspPersistInstallerStatus_(environment, kspBuildInstallerStatus_(
      KSP_INSTALLER_STATES.READY_FOR_DEPLOYMENT,
      'Apps Scriptで会社限定のWeb Appをデプロイし、デプロイ設定を確認してください。',
      { resourceSummary: '必要なフォルダ、Backend、Audit、スキーマ、設定を確認しました。' }));
  } catch (error) {
    var safeError = kspInstallerSafeError_(error);
    return kspPersistInstallerStatus_(environment, kspBuildInstallerStatus_(
      KSP_INSTALLER_STATES.FAILED, safeError.message, { error: safeError }));
  }
}

function kspCheckInstallerReadiness_(environment) {
  try {
    var authorization = kspAuthorizeAndLatchInstaller_(environment);
    kspAssert_(authorization.state && authorization.state.config, 'INSTALLATION_STATE_MISSING',
      'installKnowledgeShare を先に実行してください。');
    var validation = kspRunValidation_(environment);
    if (!validation.ok) {
      var validationError = validation.errors && validation.errors[0] ? validation.errors[0] : { code: 'INSTALLER_FAILED' };
      var safeValidationError = kspInstallerSafeError_({ code: validationError.code });
      return kspPersistInstallerStatus_(environment, kspBuildInstallerStatus_(
        KSP_INSTALLER_STATES.FAILED, safeValidationError.message, { error: safeValidationError }));
    }
    return kspPersistInstallerStatus_(environment, kspBuildDeploymentReadinessStatus_(environment,
      '必要なリソースとスキーマを確認しました。'));
  } catch (error) {
    var safeError = kspInstallerSafeError_(error);
    return kspBuildInstallerStatus_(KSP_INSTALLER_STATES.ACTION_REQUIRED, safeError.message, { error: safeError });
  }
}

function kspConfirmInstallerDeploymentSecurity_(environment) {
  try {
    var result = kspWithInstallerLock_(environment, function () {
      var bound = environment.getBoundSpreadsheetContext();
      kspAssert_(bound && bound.id, 'INSTALLER_BOUND_SPREADSHEET_REQUIRED',
        'この確認は導入先スプレッドシートに紐づくApps Scriptから実行してください。');
      kspAssert_(Array.isArray(bound.parentIds) && bound.parentIds.length === 1,
        'INSTALLER_PARENT_AMBIGUOUS', '導入先スプレッドシートの親フォルダを1つにしてください。');
      var identities = environment.getSessionIdentities();
      var active = kspNormalizeInstallerIdentity_(identities && identities.active);
      kspAssert_(active, 'INSTALLER_ACTIVE_USER_REQUIRED', '会社管理者アカウントを識別できません。');
      var state = kspLoadInstallationState_(environment);
      kspAssert_(state && state.config, 'INSTALLATION_STATE_MISSING',
        'installKnowledgeShare を先に実行してください。');
      var owner = kspReadInstallerOwner_(environment);
      var administrators = kspNormalizeEmailList_(state.config.adminEmails || []);
      kspAssert_(administrators.indexOf(active) !== -1, 'INSTALLER_ADMIN_REQUIRED',
        '登録済みの会社管理者アカウントで再実行してください。');
      kspAssert_(owner && administrators.indexOf(owner) !== -1, 'INSTALLER_OWNER_CONFIG_CONFLICT',
        'Installer owner is not present in the authoritative administrator configuration.');
      var identity = kspGetWebAppDeploymentIdentity_(environment);
      kspAssert_(identity, 'WEB_APP_DEPLOYMENT_REQUIRED', 'A Web App deployment is required.');
      var deploymentIdentitySha256 = String(environment.hashDeploymentIdentity(identity) || '');
      kspAssert_(/^[0-9a-f]{64}$/.test(deploymentIdentitySha256),
        'DEPLOYMENT_SECURITY_ATTESTATION_INVALID', 'Deployment identity hash is invalid.');
      var attestation = {
        version: KSP_DEPLOYMENT_SECURITY_ATTESTATION_VERSION,
        deploymentIdentitySha256: deploymentIdentitySha256,
        confirmedAt: environment.nowIso()
      };
      environment.setProperty(KSP_PROPERTY_KEYS.DEPLOYMENT_SECURITY_ATTESTATION_JSON,
        JSON.stringify(attestation));
      return attestation;
    });
    kspAssert_(result, 'DEPLOYMENT_SECURITY_ATTESTATION_INVALID', 'Deployment attestation was not saved.');
    return kspPersistInstallerStatus_(environment, kspBuildDeploymentReadinessStatus_(environment,
      '必要なリソースとスキーマ、および管理者による会社限定デプロイ設定の確認を完了しました。'));
  } catch (error) {
    var safeError = kspInstallerSafeError_(error);
    return kspBuildInstallerStatus_(KSP_INSTALLER_STATES.ACTION_REQUIRED, safeError.message, { error: safeError });
  }
}
// ===== END src/15_Installer.gs =====

// ===== BEGIN src/20_LiveEnvironment.gs =====
function kspCreateAppsScriptEnvironment_() {
  var scriptProperties = PropertiesService.getScriptProperties();

  return {
    nowIso: function () {
      return kspCanonicalInstantIso_(new Date());
    },

    acquireScriptLock: function (timeoutMs) {
      var lock = LockService.getScriptLock();
      if (!lock.tryLock(timeoutMs)) {
        var error = new Error('Could not acquire the setup script lock.');
        error.code = 'SETUP_LOCK_TIMEOUT';
        throw error;
      }
      return lock;
    },

    releaseScriptLock: function (lock) {
      lock.releaseLock();
    },

    getProperty: function (key) {
      return scriptProperties.getProperty(key);
    },

    setProperty: function (key, value) {
      scriptProperties.setProperty(key, String(value));
    },

    deleteProperty: function (key) {
      scriptProperties.deleteProperty(key);
    },

    getResource: function (id) {
      try {
        var file = Drive.Files.get(id, {
          supportsAllDrives: true,
          fields: 'id,name,mimeType,parents,trashed'
        });
        if (!file || file.trashed) {
          return null;
        }
        return {
          id: file.id,
          name: file.name,
          mimeType: file.mimeType,
          parents: file.parents || []
        };
      } catch (error) {
        return null;
      }
    },

    findChildren: function (parentId, name, mimeType) {
      var query = "'" + kspEscapeDriveQueryLiteral_(parentId) + "' in parents" +
        " and trashed = false" +
        " and name = '" + kspEscapeDriveQueryLiteral_(name) + "'" +
        " and mimeType = '" + kspEscapeDriveQueryLiteral_(mimeType) + "'";
      var response = Drive.Files.list({
        q: query,
        spaces: 'drive',
        includeItemsFromAllDrives: true,
        supportsAllDrives: true,
        pageSize: 100,
        fields: 'files(id,name,mimeType,parents)'
      });
      return (response.files || []).map(function (file) {
        return {
          id: file.id,
          name: file.name,
          mimeType: file.mimeType,
          parents: file.parents || []
        };
      });
    },

    createFolder: function (parentId, name) {
      var file = Drive.Files.create({
        name: name,
        mimeType: KSP_MIME_TYPES.FOLDER,
        parents: [parentId]
      }, null, {
        supportsAllDrives: true,
        fields: 'id,name,mimeType,parents'
      });
      return {
        id: file.id,
        name: file.name,
        mimeType: file.mimeType,
        parents: file.parents || []
      };
    },

    renameResource: function (id, name) {
      var file = Drive.Files.update({ name: name }, id, null, {
        supportsAllDrives: true,
        fields: 'id,name,mimeType,parents'
      });
      return {
        id: file.id,
        name: file.name,
        mimeType: file.mimeType,
        parents: file.parents || []
      };
    },

    createSpreadsheet: function (parentId, name) {
      var file = Drive.Files.create({
        name: name,
        mimeType: KSP_MIME_TYPES.SPREADSHEET,
        parents: [parentId]
      }, null, {
        supportsAllDrives: true,
        fields: 'id,name,mimeType,parents'
      });
      return {
        id: file.id,
        name: file.name,
        mimeType: file.mimeType,
        parents: file.parents || []
      };
    },

    renameSheetIfPresent: function (spreadsheetId, fromName, toName) {
      var spreadsheet = SpreadsheetApp.openById(spreadsheetId);
      var fromSheet = spreadsheet.getSheetByName(fromName);
      var toSheet = spreadsheet.getSheetByName(toName);
      kspAssert_(!(fromSheet && toSheet), 'COUNTERPARTY_MASTER_RENAME_CONFLICT',
        'Legacy and canonical Counterparty master sheets both exist.');
      if (!fromSheet) return { action: toSheet ? 'reused' : 'not-found' };
      fromSheet.setName(toName);
      return { action: 'renamed' };
    },

    ensureSheet: function (spreadsheetId, sheetName, expectedHeaders) {
      var spreadsheet = SpreadsheetApp.openById(spreadsheetId);
      var sheet = spreadsheet.getSheetByName(sheetName);
      var created = false;
      if (!sheet) {
        var disposableDefault = kspFindDisposableDefaultSheet_(spreadsheet);
        if (disposableDefault) {
          disposableDefault.setName(sheetName);
          sheet = disposableDefault;
        } else {
          sheet = spreadsheet.insertSheet(sheetName);
        }
        created = true;
      }

      var actualHeaders = kspReadHeadersFromSheet_(sheet);
      kspAssert_(kspUniqueStrings_(actualHeaders).length === actualHeaders.length,
        'DUPLICATE_SHEET_HEADERS', 'Duplicate headers found in ' + sheetName + '.');

      if (actualHeaders.length === 0) {
        sheet.getRange(1, 1, 1, expectedHeaders.length).setValues([expectedHeaders]);
        sheet.setFrozenRows(1);
        return { action: created ? 'created' : 'migrated', addedHeaders: expectedHeaders.slice(), columnCount: expectedHeaders.length };
      }

      var missingHeaders = expectedHeaders.filter(function (header) {
        return actualHeaders.indexOf(header) === -1;
      });
      if (missingHeaders.length > 0) {
        sheet.getRange(1, actualHeaders.length + 1, 1, missingHeaders.length).setValues([missingHeaders]);
        sheet.setFrozenRows(1);
        return {
          action: 'migrated',
          addedHeaders: missingHeaders,
          columnCount: actualHeaders.length + missingHeaders.length
        };
      }

      sheet.setFrozenRows(1);
      return { action: created ? 'created' : 'reused', addedHeaders: [], columnCount: actualHeaders.length };
    },
    readCounterpartyMigrationSnapshot: function (spreadsheetId) {
      var spreadsheet = SpreadsheetApp.openById(spreadsheetId);
      function rows(sheetName) {
        var sheet = spreadsheet.getSheetByName(sheetName);
        kspAssert_(sheet, 'SHEET_NOT_FOUND', 'Sheet not found: ' + sheetName);
        var headers = kspReadHeadersFromSheet_(sheet);
        return kspReadObjectsFromSheet_(sheet, headers);
      }
      return {
        counterpartyRows: rows(KSP_SHEET_NAMES.COUNTERPARTY_MASTER),
        optionRows: rows(KSP_SHEET_NAMES.OPTION_MASTER),
        meetingRows: rows(KSP_SHEET_NAMES.MEETING_INDEX),
        pitchbookRows: rows(KSP_SHEET_NAMES.PITCHBOOK_INDEX)
      };
    },

    applyCounterpartyMigrationPlan: function (spreadsheetId, plan) {
      var spreadsheet = SpreadsheetApp.openById(spreadsheetId);
      function apply(sheetName, patches) {
        var sheet = spreadsheet.getSheetByName(sheetName);
        kspAssert_(sheet, 'SHEET_NOT_FOUND', 'Sheet not found: ' + sheetName);
        var headers = kspReadHeadersFromSheet_(sheet);
        (patches || []).forEach(function (patch) {
          Object.keys(patch.values || {}).forEach(function (header) {
            var columnIndex = headers.indexOf(header);
            kspAssert_(columnIndex !== -1, 'SCHEMA_COLUMNS_MISSING',
              'Missing migration column: ' + sheetName + '.' + header);
            sheet.getRange(Number(patch.rowIndex) + 2, columnIndex + 1).setValue(patch.values[header]);
          });
        });
      }
      apply(KSP_SHEET_NAMES.COUNTERPARTY_MASTER, plan.counterpartyPatches);
      var masterSheet = spreadsheet.getSheetByName(KSP_SHEET_NAMES.COUNTERPARTY_MASTER);
      var masterHeaders = kspReadHeadersFromSheet_(masterSheet);
      kspAppendObjectsToSheet_(masterSheet, masterHeaders, plan.counterpartyAppends || []);
      apply(KSP_SHEET_NAMES.MEETING_INDEX, plan.meetingPatches);
      apply(KSP_SHEET_NAMES.PITCHBOOK_INDEX, plan.pitchbookPatches);
      return {
        counterpartyUpdated: (plan.counterpartyPatches || []).length,
        counterpartyInserted: (plan.counterpartyAppends || []).length,
        meetingUpdated: (plan.meetingPatches || []).length,
        pitchbookUpdated: (plan.pitchbookPatches || []).length,
        legacyMappingCount: Number(plan.legacyMappingCount || 0)
      };
    },

    backfillMeetingCounterpartyFields: function (spreadsheetId) {
      var spreadsheet = SpreadsheetApp.openById(spreadsheetId);
      var sheet = spreadsheet.getSheetByName(KSP_SHEET_NAMES.MEETING_INDEX);
      kspAssert_(sheet, 'SHEET_NOT_FOUND', 'Sheet not found: ' + KSP_SHEET_NAMES.MEETING_INDEX);
      var headers = kspReadHeadersFromSheet_(sheet);
      var rows = kspReadObjectsFromSheet_(sheet, headers);
      var updated = 0;
      rows.forEach(function (row, index) {
        var patch = kspBuildLegacyMeetingCounterpartyBackfill_(row);
        if (!patch) return;
        Object.keys(patch).forEach(function (header) {
          var columnIndex = headers.indexOf(header);
          kspAssert_(columnIndex !== -1, 'SCHEMA_COLUMNS_MISSING', 'Missing Meeting migration column: ' + header);
          sheet.getRange(index + 2, columnIndex + 1).setValue(patch[header]);
        });
        updated += 1;
      });
      return { scanned: rows.length, updated: updated };
    },

    insertMissingRows: function (spreadsheetId, sheetName, keyColumn, rows) {
      var spreadsheet = SpreadsheetApp.openById(spreadsheetId);
      var sheet = spreadsheet.getSheetByName(sheetName);
      kspAssert_(sheet, 'SHEET_NOT_FOUND', 'Sheet not found: ' + sheetName);
      var headers = kspReadHeadersFromSheet_(sheet);
      var existingRows = kspReadObjectsFromSheet_(sheet, headers);
      var existingKeys = {};
      existingRows.forEach(function (row) {
        existingKeys[String(row[keyColumn])] = true;
      });
      var missingRows = rows.filter(function (row) {
        return !existingKeys[String(row[keyColumn])];
      });
      kspAppendObjectsToSheet_(sheet, headers, missingRows);
      return { inserted: missingRows.length, skipped: rows.length - missingRows.length };
    },

    upsertRows: function (spreadsheetId, sheetName, keyColumn, rows, options) {
      var spreadsheet = SpreadsheetApp.openById(spreadsheetId);
      var sheet = spreadsheet.getSheetByName(sheetName);
      kspAssert_(sheet, 'SHEET_NOT_FOUND', 'Sheet not found: ' + sheetName);
      var headers = kspReadHeadersFromSheet_(sheet);
      var existingRows = kspReadObjectsFromSheet_(sheet, headers);
      var rowIndexByKey = {};
      existingRows.forEach(function (row, index) {
        rowIndexByKey[String(row[keyColumn])] = index + 2;
      });

      var inserted = 0;
      var updated = 0;
      var preserved = 0;
      var preserveExistingKeys = options && Array.isArray(options.preserveExistingKeys)
        ? options.preserveExistingKeys.map(String)
        : [];
      rows.forEach(function (row) {
        var key = String(row[keyColumn]);
        var values = headers.map(function (header) {
          return row[header] === undefined || row[header] === null ? '' : row[header];
        });
        if (rowIndexByKey[key] && preserveExistingKeys.indexOf(key) !== -1) {
          preserved += 1;
        } else if (rowIndexByKey[key]) {
          sheet.getRange(rowIndexByKey[key], 1, 1, headers.length).setValues([values]);
          updated += 1;
        } else {
          sheet.appendRow(values);
          inserted += 1;
        }
      });
      return { inserted: inserted, updated: updated, preserved: preserved };
    },

    listTriggers: function () {
      return ScriptApp.getProjectTriggers().map(function (trigger) {
        return {
          id: trigger.getUniqueId(),
          handler: trigger.getHandlerFunction(),
          eventType: String(trigger.getEventType())
        };
      });
    },

    createClockTrigger: function (handler, intervalMinutes) {
      var trigger = ScriptApp.newTrigger(handler).timeBased().everyMinutes(intervalMinutes).create();
      return {
        id: trigger.getUniqueId(),
        handler: trigger.getHandlerFunction(),
        eventType: String(trigger.getEventType())
      };
    },

    createDailyTrigger: function (handler, timezone) {
      var trigger = ScriptApp.newTrigger(handler).timeBased().atHour(2).everyDays(1)
        .inTimezone(timezone || KSP_DEFAULTS.TIMEZONE).create();
      return {
        id: trigger.getUniqueId(),
        handler: trigger.getHandlerFunction(),
        eventType: String(trigger.getEventType())
      };
    },

    deleteTrigger: function (triggerId) {
      var trigger = ScriptApp.getProjectTriggers().filter(function (candidate) {
        return candidate.getUniqueId() === String(triggerId);
      })[0];
      kspAssert_(trigger, 'TRIGGER_NOT_FOUND', 'Trigger is not accessible for migration.');
      ScriptApp.deleteTrigger(trigger);
    },

    getSheetHeaders: function (spreadsheetId, sheetName) {
      var spreadsheet = SpreadsheetApp.openById(spreadsheetId);
      var sheet = spreadsheet.getSheetByName(sheetName);
      kspAssert_(sheet, 'SHEET_NOT_FOUND', 'Sheet not found: ' + sheetName);
      return kspReadHeadersFromSheet_(sheet);
    },

    getColumnValues: function (spreadsheetId, sheetName, columnName) {
      var spreadsheet = SpreadsheetApp.openById(spreadsheetId);
      var sheet = spreadsheet.getSheetByName(sheetName);
      kspAssert_(sheet, 'SHEET_NOT_FOUND', 'Sheet not found: ' + sheetName);
      var headers = kspReadHeadersFromSheet_(sheet);
      var columnIndex = headers.indexOf(columnName);
      kspAssert_(columnIndex !== -1, 'COLUMN_NOT_FOUND', 'Column not found: ' + columnName);
      var lastRow = sheet.getLastRow();
      if (lastRow < 2) {
        return [];
      }
      return sheet.getRange(2, columnIndex + 1, lastRow - 1, 1).getValues()
        .map(function (row) { return String(row[0]); })
        .filter(function (value) { return value !== ''; });
    }
  };
}

function kspCreateInstallerEnvironment_() {
  var environment = kspCreateAppsScriptEnvironment_();

  environment.getBoundSpreadsheetContext = function () {
    var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    if (!spreadsheet) return null;
    var file = Drive.Files.get(spreadsheet.getId(), {
      supportsAllDrives: true,
      fields: 'id,name,parents,trashed'
    });
    if (!file || file.trashed) return null;
    return {
      id: String(file.id || spreadsheet.getId()),
      name: String(file.name || spreadsheet.getName() || ''),
      parentIds: (file.parents || []).map(String)
    };
  };

  environment.getSessionIdentities = function () {
    var active = '';
    var effective = '';
    try { active = Session.getActiveUser().getEmail() || ''; } catch (ignoredActive) {}
    try { effective = Session.getEffectiveUser().getEmail() || ''; } catch (ignoredEffective) {}
    return { active: String(active), effective: String(effective) };
  };

  environment.getWebAppDeploymentIdentity = function () {
    try {
      return String(ScriptApp.getService().getUrl() || '');
    } catch (ignored) {
      return '';
    }
  };

  environment.hashDeploymentIdentity = function (value) {
    var bytes = Utilities.computeDigest(
      Utilities.DigestAlgorithm.SHA_256,
      String(value || ''),
      Utilities.Charset.UTF_8
    );
    return bytes.map(function (byte) {
      var normalized = byte < 0 ? byte + 256 : byte;
      return ('0' + normalized.toString(16)).slice(-2);
    }).join('');
  };

  environment.writeInstallationStatus = function (status) {
    var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    kspAssert_(spreadsheet, 'INSTALLER_BOUND_SPREADSHEET_REQUIRED',
      'Installation status requires a bound Spreadsheet.');
    var sheet = spreadsheet.getSheetByName(KSP_INSTALLATION_SHEET_NAME);
    if (!sheet) sheet = spreadsheet.insertSheet(KSP_INSTALLATION_SHEET_NAME);
    var rows = [
      ['項目', '内容'],
      ['状態', status.state],
      ['次に行うこと', status.nextAction],
      ['作成・再利用した主な項目', status.resourceSummary || ''],
      ['アプリ版', status.releaseVersion],
      ['スキーマ版', String(status.schemaVersion)],
      ['配布元commit', status.sourceCommit || 'modular-source'],
      ['配布profile', status.bundleProfile],
      ['bundle payload SHA-256', status.bundlePayloadSha256 || 'source-mode'],
      ['エラーコード', status.error ? status.error.code : '']
    ];
    sheet.clearContents();
    sheet.getRange(1, 1, rows.length, 2).setValues(rows);
    sheet.setFrozenRows(1);
    sheet.autoResizeColumns(1, 2);
  };

  return environment;
}

function kspReadHeadersFromSheet_(sheet) {
  var lastColumn = sheet.getLastColumn();
  if (lastColumn < 1 || sheet.getLastRow() < 1) {
    return [];
  }
  return sheet.getRange(1, 1, 1, lastColumn).getValues()[0]
    .map(function (value) { return String(value || '').trim(); })
    .filter(function (value) { return value !== ''; });
}

function kspReadObjectsFromSheet_(sheet, headers) {
  var lastRow = sheet.getLastRow();
  if (lastRow < 2 || headers.length === 0) {
    return [];
  }
  var range = sheet.getRange(2, 1, lastRow - 1, headers.length);
  var displayed;
  return range.getValues().map(function (values, rowIndex) {
    var objectValue = {};
    headers.forEach(function (header, index) {
      var value = values[index];
      // Business cells are wall-clock values, not instants. Native getValues()
      // and getSpreadsheetTimeZone() can disagree with the cell representation.
      // Accept only unambiguous supported display shapes, never guess a zone or
      // a locale. Other columns (including true instants) retain their raw type.
      if (value instanceof Date && (header === 'Date' || header === 'Time')) {
        if (!displayed) displayed = range.getDisplayValues();
        value = kspCanonicalSheetBusinessDisplay_(displayed[rowIndex][index], header);
      }
      objectValue[header] = value;
    });
    return objectValue;
  });
}

function kspAppendObjectsToSheet_(sheet, headers, rows) {
  if (!rows || rows.length === 0) {
    return;
  }
  var values = rows.map(function (row) {
    return headers.map(function (header) {
      return row[header] === undefined || row[header] === null ? '' : row[header];
    });
  });
  sheet.getRange(sheet.getLastRow() + 1, 1, values.length, headers.length).setValues(values);
}

function kspFindDisposableDefaultSheet_(spreadsheet) {
  var sheets = spreadsheet.getSheets();
  if (sheets.length !== 1) {
    return null;
  }
  var sheet = sheets[0];
  var name = sheet.getName();
  var defaultNames = ['Sheet1', 'シート1'];
  if (defaultNames.indexOf(name) === -1) {
    return null;
  }
  if (sheet.getLastRow() !== 0 || sheet.getLastColumn() !== 0) {
    return null;
  }
  return sheet;
}
// ===== END src/20_LiveEnvironment.gs =====

// ===== BEGIN src/21_BackendBackup.gs =====
var KSP_BACKUP_KIND = 'backend-daily-v1';
var KSP_BACKUP_PREFIX = 'Knowledge Platform Backend Backup ';
var KSP_BACKUP_RETENTION_DAYS = 30;

function kspBackendBackupName_(dateKey) {
  kspAssert_(kspTemporalIsValidDateKey_(dateKey), 'BACKUP_DATE_INVALID', 'Backup date is invalid.');
  return KSP_BACKUP_PREFIX + dateKey;
}

function kspBackendBackupOwned_(file, folderId, backendId) {
  if (!file || !file.id || file.id === backendId || file.trashed === true ||
    file.mimeType !== KSP_MIME_TYPES.SPREADSHEET ||
    !Array.isArray(file.parents) || file.parents.length !== 1 || file.parents[0] !== folderId) return false;
  var marker = file.appProperties || {};
  return marker.kspBackupKind === KSP_BACKUP_KIND && marker.kspBackendSourceId === backendId &&
    kspTemporalIsValidDateKey_(marker.kspBackupDate) && file.name === kspBackendBackupName_(marker.kspBackupDate);
}

function kspBackendBackupAgeDays_(todayKey, snapshotKey) {
  kspAssert_(kspTemporalIsValidDateKey_(todayKey) && kspTemporalIsValidDateKey_(snapshotKey),
    'BACKUP_DATE_INVALID', 'Backup date is invalid.');
  return (Date.parse(todayKey + 'T00:00:00Z') - Date.parse(snapshotKey + 'T00:00:00Z')) / 86400000;
}

function kspRunBackendDailyBackup_(environment) {
  var result = { ok: false, dateKey: '', snapshot: 'NOT_RUN', retentionTrashed: 0, errorCode: '' };
  var lock = null;
  try {
    lock = environment.acquireScriptLock(KSP_DEFAULTS.LOCK_TIMEOUT_MS);
    var state = kspLoadInstallationState_(environment);
    kspAssert_(state && state.config && state.resources, 'BACKUP_INSTALLATION_MISSING',
      'Backup requires a completed installation.');
    var config = kspNormalizeAndValidateConfig_(state.config);
    var folderId = state.resources[KSP_RESOURCE_KEYS.BACKUP_FOLDER];
    var backendId = state.resources[KSP_RESOURCE_KEYS.BACKEND_SPREADSHEET];
    kspAssert_(folderId && backendId && folderId !== backendId, 'BACKUP_RESOURCE_ID_MISSING',
      'Backup resource IDs are missing or invalid.');
    var folder = environment.getResource(folderId);
    var backend = environment.getResource(backendId);
    kspAssert_(folder && folder.mimeType === KSP_MIME_TYPES.FOLDER &&
      Array.isArray(folder.parents) && folder.parents.length === 1 && folder.parents[0] === config.controlFolderId,
    'BACKUP_FOLDER_BOUNDARY_INVALID', 'Backup folder is outside the restricted control boundary.');
    kspAssert_(backend && backend.mimeType === KSP_MIME_TYPES.SPREADSHEET &&
      Array.isArray(backend.parents) && backend.parents.length === 1 && backend.parents[0] === config.controlFolderId,
    'BACKUP_SOURCE_BOUNDARY_INVALID', 'Backend source is outside the restricted control boundary.');

    var todayKey = environment.todayKey(config.timezone);
    kspAssert_(kspTemporalIsValidDateKey_(todayKey), 'BACKUP_DATE_INVALID', 'Backup date is invalid.');
    result.dateKey = todayKey;
    var listed = environment.listBackupFiles(folderId);
    kspAssert_(Array.isArray(listed), 'BACKUP_LIST_INVALID', 'Backup listing is incomplete.');
    var owned = listed.filter(function (file) { return kspBackendBackupOwned_(file, folderId, backendId); });
    var sameDay = owned.filter(function (file) { return file.appProperties.kspBackupDate === todayKey; });
    kspAssert_(sameDay.length <= 1, 'BACKUP_DUPLICATE_SAME_DAY', 'Multiple accepted snapshots exist for one day.');

    if (sameDay.length) {
      var existing = environment.getBackupFile(sameDay[0].id);
      kspAssert_(kspBackendBackupOwned_(existing, folderId, backendId) &&
        existing.appProperties.kspBackupDate === todayKey,
      'BACKUP_EXISTING_MISMATCH', 'Existing daily snapshot identity changed.');
      result.snapshot = 'REUSED';
    } else {
      var name = kspBackendBackupName_(todayKey);
      var marker = { kspBackupKind: KSP_BACKUP_KIND, kspBackendSourceId: backendId, kspBackupDate: todayKey };
      var copied = environment.copyBackendSpreadsheet(backendId, folderId, name, marker);
      kspAssert_(copied && copied.id && copied.id !== backendId, 'BACKUP_COPY_INVALID',
        'Backup copy did not return a distinct file.');
      var verified = environment.getBackupFile(copied.id);
      kspAssert_(kspBackendBackupOwned_(verified, folderId, backendId) &&
        verified.appProperties.kspBackupDate === todayKey,
      'BACKUP_COPY_VERIFICATION_FAILED', 'Backup copy could not be verified in the dedicated folder.');
      result.snapshot = 'CREATED';
    }

    var expired = owned.filter(function (file) {
      return kspBackendBackupAgeDays_(todayKey, file.appProperties.kspBackupDate) > KSP_BACKUP_RETENTION_DAYS;
    });
    var verifiedExpired = expired.map(function (file) {
      var fresh = environment.getBackupFile(file.id);
      kspAssert_(kspBackendBackupOwned_(fresh, folderId, backendId) &&
        kspBackendBackupAgeDays_(todayKey, fresh.appProperties.kspBackupDate) > KSP_BACKUP_RETENTION_DAYS,
      'BACKUP_RETENTION_BOUNDARY_CHANGED', 'Backup retention candidate changed before cleanup.');
      return fresh;
    });
    verifiedExpired.forEach(function (file) {
      var trashed = environment.trashBackupFile(file.id);
      kspAssert_(trashed && trashed.id === file.id && trashed.trashed === true,
        'BACKUP_TRASH_VERIFICATION_FAILED', 'Backup Trash operation could not be verified.');
      result.retentionTrashed += 1;
    });
    result.ok = true;
    return result;
  } catch (error) {
    result.errorCode = kspGetErrorCode_(error, 'BACKUP_OPERATION_FAILED');
    return result;
  } finally {
    if (lock) environment.releaseScriptLock(lock);
  }
}
// ===== END src/21_BackendBackup.gs =====

// ===== BEGIN src/22_BackendBackupLive.gs =====
function kspCreateBackendBackupEnvironment_() {
  var environment = kspCreateAppsScriptEnvironment_();

  environment.todayKey = function (timezone) {
    kspAssert_(timezone === KSP_DEFAULTS.TIMEZONE, 'BACKUP_TIMEZONE_MISMATCH',
      'Backup timezone must match the Apps Script Business Date boundary.');
    return kspCanonicalBusinessDate_(new Date());
  };

  environment.listBackupFiles = function (folderId) {
    var files = [];
    var pageToken = null;
    var pages = 0;
    do {
      pages += 1;
      kspAssert_(pages <= 100, 'BACKUP_LIST_PAGE_LIMIT', 'Backup folder listing exceeded the safe page limit.');
      var response = Drive.Files.list({
        q: "'" + kspEscapeDriveQueryLiteral_(folderId) + "' in parents and trashed = false",
        spaces: 'drive',
        corpora: 'allDrives',
        includeItemsFromAllDrives: true,
        supportsAllDrives: true,
        pageSize: 100,
        pageToken: pageToken || undefined,
        fields: 'nextPageToken,incompleteSearch,files(id,name,mimeType,parents,trashed,appProperties)'
      });
      kspAssert_(response && !response.incompleteSearch, 'BACKUP_LIST_INCOMPLETE',
        'Backup folder listing is incomplete.');
      files = files.concat(response.files || []);
      pageToken = response.nextPageToken || null;
    } while (pageToken);
    return files;
  };

  environment.getBackupFile = function (fileId) {
    return Drive.Files.get(fileId, {
      supportsAllDrives: true,
      fields: 'id,name,mimeType,parents,trashed,appProperties'
    });
  };

  environment.copyBackendSpreadsheet = function (sourceId, folderId, name, marker) {
    return Drive.Files.copy({
      name: name,
      parents: [folderId],
      appProperties: marker
    }, sourceId, {
      supportsAllDrives: true,
      fields: 'id,name,mimeType,parents,trashed,appProperties'
    });
  };

  environment.trashBackupFile = function (fileId) {
    return Drive.Files.update({ trashed: true }, fileId, null, {
      supportsAllDrives: true,
      fields: 'id,trashed'
    });
  };

  return environment;
}
// ===== END src/22_BackendBackupLive.gs =====

// ===== BEGIN src/30_MeetingCore.gs =====
var KSP_MEETING_WORK_ID = '0005';
var KSP_MEETING_APP_VERSION = '0.2.0';
var KSP_MEETING_DRAFT_TTL_MS = 24 * 60 * 60 * 1000;

var KSP_OPTION_TYPES = Object.freeze({
  LOCATION: 'LOCATION',
  ASSET_CLASS: 'ASSET_CLASS',
  CAPITAL_TYPE: 'CAPITAL_TYPE',
  TEAM: 'TEAM',
  COUNTERPARTY_LP: 'COUNTERPARTY_LP',
  COUNTERPARTY_NISSAY_DEPARTMENT: 'COUNTERPARTY_NISSAY_DEPARTMENT',
  COUNTERPARTY_GROUP_COMPANY: 'COUNTERPARTY_GROUP_COMPANY',
  COUNTERPARTY_CONSULTANT_GATEKEEPER: 'COUNTERPARTY_CONSULTANT_GATEKEEPER',
  COUNTERPARTY_OTHER: 'COUNTERPARTY_OTHER'
});

var KSP_COUNTERPARTY_TYPE_DEFINITIONS = Object.freeze([
  Object.freeze({ code: 'GP', label: 'GP / 運用会社', optionType: '' }),
  Object.freeze({ code: 'LP_ASSET_OWNER', label: 'LP / Asset Owner', optionType: KSP_OPTION_TYPES.COUNTERPARTY_LP }),
  Object.freeze({ code: 'NISSAY_INTERNAL', label: '日本生命', optionType: KSP_OPTION_TYPES.COUNTERPARTY_NISSAY_DEPARTMENT }),
  Object.freeze({ code: 'GROUP_COMPANY', label: 'グループ会社', optionType: KSP_OPTION_TYPES.COUNTERPARTY_GROUP_COMPANY }),
  Object.freeze({ code: 'CONSULTANT_GATEKEEPER', label: 'Consultant / Gatekeeper', optionType: KSP_OPTION_TYPES.COUNTERPARTY_CONSULTANT_GATEKEEPER }),
  Object.freeze({ code: 'OTHER', label: 'その他', optionType: KSP_OPTION_TYPES.COUNTERPARTY_OTHER })
]);

var KSP_MEETING_TYPE_DEFINITIONS = Object.freeze([
  Object.freeze({ code: 'ANNUAL_REVIEW', label: '定例年1回' }),
  Object.freeze({ code: 'OFFICE_VISIT', label: '先方オフィス訪問' }),
  Object.freeze({ code: 'ANNUAL_GENERAL_MEETING', label: '年次総会' })
]);

var KSP_AUDIT_RESULTS = Object.freeze({
  SUCCESS: 'Success',
  FAILURE: 'Failure'
});

var KSP_MEETING_ACTIONS = Object.freeze({
  CREATE: 'MEETING_CREATE'
});

var KSP_MEETING_LIMITS = Object.freeze({
  SHORT_TEXT: 500,
  NOTES: 20000,
  FUND_STRATEGY: 500,
  FOLLOW_UP_NOTE: 2000
});

function kspNormalizeMeetingTypeCodes_(value) {
  var supplied = Array.isArray(value) ? value : String(value || '').split(',');
  var seen = {};
  supplied.map(function (item) { return kspTrimMeetingField_(item); })
    .filter(Boolean).forEach(function (code) { seen[code] = true; });
  var known = {};
  KSP_MEETING_TYPE_DEFINITIONS.forEach(function (definition) { known[definition.code] = true; });
  Object.keys(seen).forEach(function (code) {
    kspAssert_(known[code], 'MEETING_TYPE_CODE_INVALID', 'Meeting type codeが不正です。');
  });
  return KSP_MEETING_TYPE_DEFINITIONS.filter(function (definition) { return seen[definition.code]; })
    .map(function (definition) { return definition.code; }).join(',');
}

function kspNormalizeRelatedPitchbookIds_(value) {
  var supplied = Array.isArray(value) ? value : String(value || '').split(',');
  var seen = {};
  supplied.map(function (item) { return kspTrimMeetingField_(item); })
    .filter(Boolean).forEach(function (id) {
      kspAssert_(/^DOC-\d{6}$/.test(id) && id !== 'DOC-000000',
        'PITCHBOOK_DOCUMENT_ID_INVALID', 'Document IDが不正です。');
      seen[id] = true;
    });
  return Object.keys(seen).sort().join(',');
}

function kspSplitCanonicalIds_(value) {
  return String(value || '').split(',').map(function (item) { return item.trim(); }).filter(Boolean);
}

function kspMeetingTypeLabels_(canonicalCodes) {
  var selected = {};
  kspSplitCanonicalIds_(canonicalCodes).forEach(function (code) { selected[code] = true; });
  return KSP_MEETING_TYPE_DEFINITIONS.filter(function (definition) { return selected[definition.code]; })
    .map(function (definition) { return definition.label; });
}

function kspMeetingCellDate_(value) {
  return kspCanonicalBusinessDate_(value);
}

function kspBuildRelatedPitchbookChoices_(rows, counterpartyId, assetClassId, existingIds) {
  var preserved = {};
  (existingIds || []).forEach(function (id) { preserved[String(id)] = true; });
  var choices = (rows || []).filter(function (row) {
    var id = String(row.Document_ID || '');
    if (!id) return false;
    return preserved[id] || (String(row.Status || '') === KSP_STATUS.ACTIVE &&
      String(row.Counterparty_ID || '') === String(counterpartyId || '') &&
      String(row.Asset_Class_ID || '') === String(assetClassId || ''));
  }).sort(function (left, right) {
    var rightDate = kspMeetingCellDate_(right.Date);
    var leftDate = kspMeetingCellDate_(left.Date);
    var dateCompare = rightDate.localeCompare(leftDate);
    return dateCompare || String(left.Document_ID || '').localeCompare(String(right.Document_ID || ''));
  }).map(function (row) {
    return {
      id: String(row.Document_ID || ''),
      date: kspMeetingCellDate_(row.Date),
      counterpartyId: String(row.Counterparty_ID || ''),
      assetClassId: String(row.Asset_Class_ID || ''),
      title: String(row.Saved_Filename || row.Original_Filename || row.Document_ID || ''),
      status: String(row.Status || ''),
      preserved: Boolean(preserved[String(row.Document_ID || '')])
    };
  });
  var resolved = {};
  choices.forEach(function (item) { resolved[item.id] = true; });
  Object.keys(preserved).filter(function (id) { return !resolved[id]; }).sort().forEach(function (id) {
    choices.push({ id: id, date: '', counterpartyId: '', assetClassId: '', title: id,
      status: '', preserved: true, unresolved: true });
  });
  return choices;
}

function kspCounterpartyTypeDefinition_(code) {
  var normalized = String(code || '').trim();
  return KSP_COUNTERPARTY_TYPE_DEFINITIONS.filter(function (item) { return item.code === normalized; })[0] || null;
}

function kspNormalizeRelatedGpIds_(value, primaryGpId) {
  var supplied = Array.isArray(value) ? value : String(value || '').split(',');
  var seen = {};
  supplied.map(function (item) { return kspTrimMeetingField_(item); }).filter(Boolean).forEach(function (id) {
    kspAssert_(!seen[id], 'MEETING_RELATED_GP_DUPLICATE', '旧形式の関連先情報に重複があります。');
    seen[id] = true;
  });
  if (primaryGpId) seen[String(primaryGpId)] = true;
  return Object.keys(seen).sort().join(',');
}

function kspMeetingCounterpartyType_(row) {
  return String(row && row.Counterparty_Type || '').trim() || (String(row && row.GP_ID || '').trim() ? 'GP' : '');
}

function kspMeetingCounterpartyId_(row) {
  return String(row && row.Counterparty_ID || '').trim() ||
    (kspMeetingCounterpartyType_(row) === 'GP' ? String(row && row.GP_ID || '').trim() : '');
}

function kspCounterpartyEntityKey_(counterpartyId) {
  var id = String(counterpartyId || '').trim();
  return id ? 'COUNTERPARTY:' + id : '';
}

function kspCounterpartyIdFromEntityKey_(entityKey) {
  var match = /^COUNTERPARTY:([A-Za-z0-9_-]+)$/.exec(String(entityKey || '').trim());
  return match ? match[1] : '';
}

function kspMeetingRelatedGpIds_(row) {
  var stored = String(row && row.Related_GP_IDs || '').trim();
  if (stored) return kspNormalizeRelatedGpIds_(stored, '');
  var gpId = String(row && row.GP_ID || '').trim();
  return gpId ? gpId : '';
}

function kspNormalizeMeetingInput_(input) {
  var source = input && typeof input === 'object' ? input : {};
  var suppliedGpId = kspTrimMeetingField_(source.gpId);
  var counterpartyType = kspTrimMeetingField_(source.counterpartyType);
  var counterpartyId = kspTrimMeetingField_(source.counterpartyId) || suppliedGpId;
  return {
    date: kspTrimMeetingField_(source.date),
    time: kspTrimMeetingField_(source.time),
    locationId: kspTrimMeetingField_(source.locationId),
    gpId: suppliedGpId,
    counterpartyType: counterpartyType,
    counterpartyId: counterpartyId,
    relatedGpIds: kspNormalizeRelatedGpIds_(source.relatedGpIds, ''),
    assetClassId: kspTrimMeetingField_(source.assetClassId),
    capitalTypeId: kspTrimMeetingField_(source.capitalTypeId),
    teamId: kspTrimMeetingField_(source.teamId),
    fundStrategy: kspTrimMeetingField_(source.fundStrategy),
    meetingTypeCodes: kspNormalizeMeetingTypeCodes_(source.meetingTypeCodes),
    relatedPitchbookIds: kspNormalizeRelatedPitchbookIds_(source.relatedPitchbookIds),
    followUpRequired: kspToBoolean_(source.followUpRequired, false),
    followUpNote: kspNormalizeMeetingNotes_(source.followUpNote),
    counterparty: kspTrimMeetingField_(source.counterparty),
    internalParticipants: kspTrimMeetingField_(source.internalParticipants),
    notes: kspNormalizeMeetingNotes_(source.notes),
    retryMeetingId: kspTrimMeetingField_(source.retryMeetingId),
    retryFingerprint: kspTrimMeetingField_(source.retryFingerprint)
  };
}

function kspTrimMeetingField_(value) {
  return value === null || value === undefined ? '' : String(value).trim();
}

function kspNormalizeMeetingNotes_(value) {
  if (value === null || value === undefined) {
    return '';
  }
  return String(value).replace(/\r\n?/g, '\n').replace(/\u0000/g, '');
}

function kspBuildMeetingCatalog_(counterpartyRows, optionRows) {
  var counterpartyEntities = (counterpartyRows || [])
    .filter(function (row) { return String(row.Status) === KSP_STATUS.ACTIVE; })
    .map(function (row) {
      var legacyGp = String(row.GP_ID || '');
      var type = String(row.Counterparty_Type || (legacyGp ? 'GP' : ''));
      var id = String(row.Counterparty_ID || legacyGp);
      var definition = kspCounterpartyTypeDefinition_(type);
      return {
        id: id,
        type: type,
        typeLabel: definition ? definition.label : type,
        name: String(row.Counterparty_Name || row.GP_Name || ''),
        status: String(row.Status || ''),
        entityKey: kspCounterpartyEntityKey_(id)
      };
    })
    .filter(function (row) { return row.id && row.name; })
    .sort(function (left, right) {
      return left.name.localeCompare(right.name, 'ja') || left.id.localeCompare(right.id);
    });

  var gps = counterpartyEntities.filter(function (row) { return row.type === 'GP'; });

  var options = (optionRows || [])
    .filter(function (row) { return String(row.Status) === KSP_STATUS.ACTIVE; })
    .map(function (row) {
      return {
        id: String(row.Option_ID),
        type: String(row.Type),
        name: String(row.Name),
        sortOrder: Number(row.Sort_Order) || 0
      };
    })
    .filter(function (row) { return row.id && row.type && row.name; });

  function byType(type) {
    return options
      .filter(function (row) { return row.type === type; })
      .sort(function (left, right) {
        if (left.sortOrder !== right.sortOrder) {
          return left.sortOrder - right.sortOrder;
        }
        return left.name.localeCompare(right.name, 'ja');
      })
      .map(function (row) {
        return { id: row.id, name: row.name, sortOrder: row.sortOrder };
      });
  }

  return {
    gps: gps,
    counterparties: counterpartyEntities,
    assetClasses: byType(KSP_OPTION_TYPES.ASSET_CLASS),
    capitalTypes: byType(KSP_OPTION_TYPES.CAPITAL_TYPE),
    locations: byType(KSP_OPTION_TYPES.LOCATION),
    teams: byType(KSP_OPTION_TYPES.TEAM),
    counterpartyTypes: KSP_COUNTERPARTY_TYPE_DEFINITIONS.map(function (definition) {
      return { code: definition.code, label: definition.label, optionType: definition.optionType };
    }),
    counterpartyEntities: counterpartyEntities
  };
}

function kspValidateMeetingInput_(normalizedInput, catalog) {
  var input = normalizedInput || {};
  var safeCatalog = catalog || { gps: [], assetClasses: [], capitalTypes: [], locations: [] };

  kspAssert_(input.date, 'MEETING_DATE_REQUIRED', '日付は必須です。');
  kspAssert_(input.counterpartyId, 'MEETING_COUNTERPARTY_ENTITY_REQUIRED', '面談先は必須です。');
  kspAssert_(input.assetClassId, 'MEETING_ASSET_CLASS_REQUIRED', 'アセットクラスは必須です。');
  kspAssert_(kspIsValidDateKey_(input.date), 'MEETING_DATE_INVALID', '日付はYYYY-MM-DD形式で入力してください。');
  kspAssert_(!input.time || kspIsValidTimeValue_(input.time), 'MEETING_TIME_INVALID', '時間はHH:MM形式で入力してください。');
  kspAssert_(input.counterparty.length <= KSP_MEETING_LIMITS.SHORT_TEXT,
    'MEETING_COUNTERPARTY_TOO_LONG', '面談相手は500文字以内で入力してください。');
  kspAssert_(input.internalParticipants.length <= KSP_MEETING_LIMITS.SHORT_TEXT,
    'MEETING_INTERNAL_PARTICIPANTS_TOO_LONG', '当社側は500文字以内で入力してください。');
  kspAssert_(input.notes.length <= KSP_MEETING_LIMITS.NOTES,
    'MEETING_NOTES_TOO_LONG', '面談内容は20,000文字以内で入力してください。');
  kspAssert_(input.fundStrategy.length <= KSP_MEETING_LIMITS.FUND_STRATEGY,
    'MEETING_FUND_STRATEGY_TOO_LONG', 'Fund / Strategyは500文字以内で入力してください。');
  kspAssert_(input.followUpNote.length <= KSP_MEETING_LIMITS.FOLLOW_UP_NOTE,
    'MEETING_FOLLOW_UP_NOTE_TOO_LONG', 'フォローアップメモは2,000文字以内で入力してください。');

  var hasRetryId = Boolean(input.retryMeetingId);
  var hasRetryFingerprint = Boolean(input.retryFingerprint);
  kspAssert_(hasRetryId === hasRetryFingerprint, 'MEETING_RETRY_CONTEXT_INCOMPLETE',
    'Retry Meeting ID and fingerprint must be supplied together.');
  if (hasRetryId) {
    kspParseMeetingId_(input.retryMeetingId);
    kspAssert_(/^[0-9a-f]{8}$/.test(input.retryFingerprint), 'MEETING_RETRY_FINGERPRINT_INVALID',
      'Retry fingerprint is invalid.');
  }

  var selectedCounterparty = (safeCatalog.counterpartyEntities || []).filter(function (item) {
    return String(item.id) === input.counterpartyId;
  })[0];
  kspAssert_(selectedCounterparty, 'MEETING_COUNTERPARTY_ENTITY_UNAVAILABLE', '選択された面談先は利用できません。');
  var counterpartyDefinition = kspCounterpartyTypeDefinition_(selectedCounterparty.type);
  kspAssert_(counterpartyDefinition, 'MEETING_COUNTERPARTY_TYPE_INVALID', '面談先種別が不正です。');
  var selected = {
    counterpartyType: counterpartyDefinition,
    counterpartyEntity: selectedCounterparty,
    relatedGps: [],
    gp: null,
    assetClass: kspRequireCatalogItem_(
      safeCatalog.assetClasses,
      input.assetClassId,
      'MEETING_ASSET_CLASS_UNAVAILABLE',
      '選択されたアセットクラスは利用できません。'
    ),
    capitalType: null,
    location: null,
    team: null
  };

  if (input.capitalTypeId) {
    selected.capitalType = kspRequireCatalogItem_(
      safeCatalog.capitalTypes,
      input.capitalTypeId,
      'MEETING_CAPITAL_TYPE_UNAVAILABLE',
      '選択されたEquity / Debtは利用できません。'
    );
  }

  if (input.locationId) {
    selected.location = kspRequireCatalogItem_(
      safeCatalog.locations,
      input.locationId,
      'MEETING_LOCATION_UNAVAILABLE',
      '選択された面談場所は利用できません。'
    );
  }

  if (input.teamId) {
    selected.team = kspRequireCatalogItem_(
      safeCatalog.teams,
      input.teamId,
      'MEETING_TEAM_UNAVAILABLE',
      '選択されたチームは利用できません。'
    );
  }

  var selectablePitchbookIds = {};
  (safeCatalog.relatedPitchbooks || []).forEach(function (item) {
    if (item.preserved || (String(item.status || '') === KSP_STATUS.ACTIVE &&
        String(item.counterpartyId || '') === input.counterpartyId &&
        String(item.assetClassId || '') === input.assetClassId)) {
      selectablePitchbookIds[String(item.id)] = true;
    }
  });
  kspSplitCanonicalIds_(input.relatedPitchbookIds).forEach(function (id) {
    kspAssert_(selectablePitchbookIds[id], 'MEETING_RELATED_PITCHBOOK_UNAVAILABLE',
      '選択された関連Pitchbookは利用できません。');
  });

  return selected;
}

function kspRequireCatalogItem_(items, id, code, message) {
  var found = (items || []).filter(function (item) { return String(item.id) === String(id); })[0];
  kspAssert_(found, code, message);
  return found;
}

function kspFormatMeetingId_(sequenceNumber) {
  var sequence = Number(sequenceNumber);
  kspAssert_(Number.isFinite(sequence) && sequence > 0 && Math.floor(sequence) === sequence,
    'MEETING_SEQUENCE_INVALID', 'Meeting ID sequence must be a positive integer.');
  return 'MTG-' + String(sequence).padStart(6, '0');
}

function kspParseMeetingId_(meetingId) {
  var match = /^MTG-(\d{6})$/.exec(String(meetingId || ''));
  kspAssert_(match, 'MEETING_ID_INVALID', 'Meeting ID is invalid.');
  var sequence = Number(match[1]);
  kspAssert_(sequence > 0, 'MEETING_ID_INVALID', 'Meeting ID is invalid.');
  return sequence;
}

function kspBuildMeetingRequestFingerprint_(input) {
  var canonical = [
    input.date,
    input.time,
    input.locationId,
    input.counterpartyId,
    input.assetClassId,
    input.capitalTypeId,
    input.teamId,
    input.fundStrategy,
    input.meetingTypeCodes,
    input.relatedPitchbookIds,
    input.followUpRequired ? 'true' : 'false',
    input.followUpNote,
    input.counterparty,
    input.internalParticipants,
    input.notes
  ].map(function (value) { return String(value || ''); }).join('\u001f');

  var hash = 2166136261;
  for (var index = 0; index < canonical.length; index += 1) {
    hash ^= canonical.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return ('00000000' + (hash >>> 0).toString(16)).slice(-8);
}

function kspBuildLegacyMeetingRequestFingerprint_(input) {
  var canonical = [
    input.date, input.time, input.locationId, input.gpId, input.assetClassId,
    input.capitalTypeId, input.counterparty, input.internalParticipants, input.notes
  ].map(function (value) { return String(value || ''); }).join('\u001f');
  var hash = 2166136261;
  for (var index = 0; index < canonical.length; index += 1) {
    hash ^= canonical.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return ('00000000' + (hash >>> 0).toString(16)).slice(-8);
}

function kspMeetingUsesOnlyLegacyFields_(input) {
  return !input.teamId && !input.fundStrategy && !input.meetingTypeCodes &&
    !input.relatedPitchbookIds && !input.followUpRequired && !input.followUpNote &&
    input.counterpartyType === 'GP' && input.counterpartyId === input.gpId && input.relatedGpIds === input.gpId;
}

function kspBuildMeetingFilename_(input, selected, meetingId) {
  var segments = [input.date, selected.counterpartyEntity.name, selected.assetClass.name];
  if (selected.capitalType) {
    segments.push(selected.capitalType.name);
  }
  segments.push(meetingId);

  var normalizedSegments = segments.map(kspNormalizeGeneratedNameSegment_);
  kspAssert_(normalizedSegments.every(function (segment) { return segment !== ''; }),
    'MEETING_FILENAME_INVALID', 'Meeting filename contains an empty required segment.');
  return normalizedSegments.join('_');
}

function kspBuildMeetingDocumentText_(input, selected) {
  var lines = ['日付: ' + input.date];
  if (input.time) lines.push('時間: ' + input.time);
  if (selected.location) lines.push('面談場所: ' + selected.location.name);
  lines.push('面談先: ' + selected.counterpartyEntity.name);
  lines.push('面談先種別: ' + selected.counterpartyType.label);
  lines.push('Asset Class: ' + selected.assetClass.name);
  if (selected.capitalType) lines.push('Equity / Debt: ' + selected.capitalType.name);
  if (selected.team) lines.push('Team: ' + selected.team.name);
  if (input.fundStrategy) lines.push('Fund / Strategy: ' + input.fundStrategy);
  var meetingTypeLabels = kspMeetingTypeLabels_(input.meetingTypeCodes);
  if (meetingTypeLabels.length) lines.push('Meeting Type: ' + meetingTypeLabels.join(', '));
  if (input.relatedPitchbookIds) lines.push('Related Pitchbook IDs: ' + input.relatedPitchbookIds);
  if (input.followUpRequired) lines.push('要フォロー: はい');
  if (input.followUpNote.trim()) lines.push('フォローアップメモ: ' + input.followUpNote);
  if (input.counterparty) lines.push('面談相手（氏名・役職）: ' + input.counterparty);
  if (input.internalParticipants) lines.push('当社側: ' + input.internalParticipants);
  if (input.notes.trim()) {
    lines.push('');
    lines.push('面談内容:');
    lines.push(input.notes);
  }
  return lines.join('\n');
}

function kspBuildMeetingMetadata_(input, selected, meetingId, documentInfo, filename) {
  return {
    Meeting_ID: meetingId,
    Date: input.date,
    Time: input.time,
    Location_ID: input.locationId,
    GP_ID: '',
    Counterparty_Type: selected && selected.counterpartyEntity ? selected.counterpartyEntity.type : '',
    Counterparty_ID: input.counterpartyId,
    Related_GP_IDs: '',
    Asset_Class_ID: input.assetClassId,
    Capital_Type_ID: input.capitalTypeId,
    Team_ID: input.teamId,
    Fund_Strategy: input.fundStrategy,
    Meeting_Type_Codes: input.meetingTypeCodes,
    Related_Pitchbook_IDs: input.relatedPitchbookIds,
    Follow_Up_Required: input.followUpRequired,
    Counterparty: input.counterparty,
    Internal_Participants: input.internalParticipants,
    Doc_File_ID: documentInfo ? documentInfo.id : '',
    Doc_URL: documentInfo ? documentInfo.url : '',
    Saved_Filename: filename || '',
    GP_Name: '',
    Counterparty_Name: selected && selected.counterpartyEntity ? selected.counterpartyEntity.name : '',
    Related_GP_Names: '',
    Asset_Class_Name: selected && selected.assetClass ? selected.assetClass.name : '',
    Capital_Type_Name: selected && selected.capitalType ? selected.capitalType.name : '',
    Location_Name: selected && selected.location ? selected.location.name : '',
    Team_Name: selected && selected.team ? selected.team.name : ''
  };
}

function kspBuildMeetingIndexRow_(input, selected, meetingId, documentInfo, filename, actor, nowIso) {
  return {
    Meeting_ID: meetingId,
    Date: input.date,
    Time: input.time,
    Location_ID: input.locationId,
    GP_ID: '',
    Counterparty_Type: selected && selected.counterpartyEntity ? selected.counterpartyEntity.type : '',
    Counterparty_ID: input.counterpartyId,
    Related_GP_IDs: '',
    Asset_Class_ID: input.assetClassId,
    Capital_Type_ID: input.capitalTypeId,
    Team_ID: input.teamId,
    Fund_Strategy: input.fundStrategy,
    Meeting_Type_Codes: input.meetingTypeCodes,
    Related_Pitchbook_IDs: input.relatedPitchbookIds,
    Follow_Up_Required: input.followUpRequired,
    Follow_Up_Note: input.followUpNote,
    Counterparty: input.counterparty,
    Internal_Participants: input.internalParticipants,
    Doc_File_ID: documentInfo.id,
    Doc_URL: documentInfo.url,
    Saved_Filename: filename,
    Status: KSP_STATUS.ACTIVE,
    Version: 1,
    Created_At: nowIso,
    Updated_At: nowIso,
    Created_By: actor,
    Updated_By: actor,
    AI_Document_Name: '',
    AI_Index_Status: KSP_AI_INDEX_STATUS.PENDING,
    AI_Indexed_At: '',
    AI_Content_Hash: '',
    AI_Last_Error: ''
  };
}

function kspMeetingIndexRowMatchesRequest_(row, input, filename) {
  if (!row) return false;
  return kspCanonicalBusinessDate_(row.Date) === input.date &&
    kspCanonicalBusinessTime_(row.Time) === input.time &&
    String(row.Location_ID || '') === input.locationId &&
    kspMeetingCounterpartyId_(row) === input.counterpartyId &&
    String(row.Asset_Class_ID || '') === input.assetClassId &&
    String(row.Capital_Type_ID || '') === input.capitalTypeId &&
    String(row.Team_ID || '') === input.teamId &&
    String(row.Fund_Strategy || '') === input.fundStrategy &&
    String(row.Meeting_Type_Codes || '') === input.meetingTypeCodes &&
    String(row.Related_Pitchbook_IDs || '') === input.relatedPitchbookIds &&
    kspToBoolean_(row.Follow_Up_Required, false) === input.followUpRequired &&
    String(row.Follow_Up_Note || '') === input.followUpNote &&
    String(row.Counterparty || '') === input.counterparty &&
    String(row.Internal_Participants || '') === input.internalParticipants &&
    String(row.Saved_Filename || '') === filename;
}

function kspMeetingInfoFromIndexRow_(row) {
  return {
    id: String(row.Meeting_ID || ''),
    filename: String(row.Saved_Filename || ''),
    documentId: String(row.Doc_File_ID || ''),
    documentUrl: String(row.Doc_URL || ''),
    version: Number(row.Version || 1),
    status: String(row.Status || KSP_STATUS.ACTIVE),
    aiIndexStatus: String(row.AI_Index_Status || KSP_AI_INDEX_STATUS.PENDING),
    reused: true
  };
}

function kspBuildMeetingAuditRow_(params) {
  var options = params || {};
  var metadata = options.metadata || {};
  var auditMetadata = kspMeetingAuditMetadata_(metadata);
  return {
    Event_Timestamp: kspCanonicalInstantIso_(options.timestamp),
    Actor: options.actor || 'UNIDENTIFIED',
    Action: KSP_MEETING_ACTIONS.CREATE,
    Target_Type: 'Meeting',
    Target_ID: options.meetingId || '',
    Result: options.result || KSP_AUDIT_RESULTS.FAILURE,
    Changed_Fields: options.result === KSP_AUDIT_RESULTS.SUCCESS ? kspGetNonEmptyMeetingMetadataFields_(auditMetadata).join(',') : '',
    Before_Metadata_JSON: '',
    After_Metadata_JSON: options.result === KSP_AUDIT_RESULTS.SUCCESS ? JSON.stringify(auditMetadata) : '',
    Batch_ID: '',
    Error_Code: options.errorCode || '',
    Error_Message: options.errorCode ? kspSafePublicErrorMessage_(options.errorCode, 'MEETING') : '',
    Search_Mode: '',
    Question_Or_Instruction: '',
    Date_From: '',
    Date_To: '',
    GP_Filter: '',
    Asset_Class_Filter: '',
    Capital_Type_Filter: '',
    Source_Type_Filter: '',
    Model_ID: '',
    Cited_Source_IDs: ''
  };
}

function kspMeetingAuditMetadata_(metadata) {
  return {
    Meeting_ID: metadata.Meeting_ID || '',
    Date: kspCanonicalBusinessDate_(metadata.Date),
    Time: kspCanonicalBusinessTime_(metadata.Time),
    Location_ID: metadata.Location_ID || '',
    GP_ID: metadata.GP_ID || '',
    Counterparty_Type: metadata.Counterparty_Type || '',
    Counterparty_ID: metadata.Counterparty_ID || '',
    Related_GP_IDs: metadata.Related_GP_IDs || '',
    Asset_Class_ID: metadata.Asset_Class_ID || '',
    Capital_Type_ID: metadata.Capital_Type_ID || '',
    Team_ID: metadata.Team_ID || '',
    Fund_Strategy: metadata.Fund_Strategy || '',
    Meeting_Type_Codes: metadata.Meeting_Type_Codes || '',
    Related_Pitchbook_IDs: metadata.Related_Pitchbook_IDs || '',
    Follow_Up_Required: metadata.Follow_Up_Required === true,
    Counterparty: metadata.Counterparty || '',
    Internal_Participants: metadata.Internal_Participants || '',
    Doc_File_ID: metadata.Doc_File_ID || '',
    Doc_URL: metadata.Doc_URL || '',
    Saved_Filename: metadata.Saved_Filename || ''
  };
}

function kspGetNonEmptyMeetingMetadataFields_(metadata) {
  return Object.keys(kspMeetingAuditMetadata_(metadata)).filter(function (key) {
    var value = metadata[key];
    return value !== '' && value !== null && value !== undefined;
  });
}

function kspResolveActorValue_(email, temporaryUserKey) {
  var normalizedEmail = String(email || '').trim().toLowerCase();
  if (normalizedEmail) return normalizedEmail;
  var normalizedKey = String(temporaryUserKey || '').trim();
  if (normalizedKey) return 'TEMP_USER:' + normalizedKey;
  return 'UNIDENTIFIED';
}

function kspBuildMeetingBootstrapResponse_(catalog) {
  return {
    ok: true,
    workId: KSP_MEETING_WORK_ID,
    appVersion: KSP_MEETING_APP_VERSION,
    draftTtlMs: KSP_MEETING_DRAFT_TTL_MS,
    sharedContextFields: ['date', 'assetClassId', 'capitalTypeId', 'fundStrategy'],
    options: {
      gps: kspDeepClone_(catalog.gps),
      counterparties: kspDeepClone_(catalog.counterparties || catalog.counterpartyEntities || []),
      assetClasses: kspDeepClone_(catalog.assetClasses),
      capitalTypes: kspDeepClone_(catalog.capitalTypes),
      locations: kspDeepClone_(catalog.locations),
      teams: kspDeepClone_(catalog.teams),
      relatedPitchbooks: kspDeepClone_(catalog.relatedPitchbooks || []),
      counterpartyTypes: kspDeepClone_(catalog.counterpartyTypes || []),
      counterpartyEntities: kspDeepClone_(catalog.counterpartyEntities || []),
      meetingTypes: kspDeepClone_(KSP_MEETING_TYPE_DEFINITIONS)
    }
  };
}
// ===== END src/30_MeetingCore.gs =====

// ===== BEGIN src/40_MeetingService.gs =====
function kspGetMeetingBootstrapData_(environment) {
  try {
    var context = kspLoadMeetingRuntimeContext_(environment);
    context.catalog.relatedPitchbooks = (context.pitchbookRows || []).filter(function (row) {
      return String(row.Status || '') === KSP_STATUS.ACTIVE;
    }).map(function (row) {
      return {
        id: String(row.Document_ID || ''), date: kspMeetingCellDate_(row.Date),
        counterpartyId: String(row.Counterparty_ID || ''), assetClassId: String(row.Asset_Class_ID || ''),
        title: String(row.Saved_Filename || row.Original_Filename || row.Document_ID || ''),
        status: String(row.Status || ''), preserved: false
      };
    }).sort(function (left, right) {
      return right.date.localeCompare(left.date) || left.id.localeCompare(right.id);
    });
    return kspBuildMeetingBootstrapResponse_(context.catalog);
  } catch (error) {
    return { ok: false, workId: KSP_MEETING_WORK_ID, error: { code: kspGetErrorCode_(error), message: kspSafePublicErrorMessage_(kspGetErrorCode_(error), 'MEETING') } };
  }
}

function kspRegisterMeeting_(environment, rawInput) {
  var startedAt = environment.nowIso();
  var warnings = [];
  var actor = kspGetMeetingActorSafely_(environment, warnings);
  var context = null;
  var normalizedInput = null;
  var selected = null;
  var meetingId = '';
  var filename = '';
  var fingerprint = '';
  var documentInfo = null;

  try {
    normalizedInput = kspNormalizeMeetingInput_(rawInput);
    context = kspLoadMeetingRuntimeContext_(environment);
    context.catalog.relatedPitchbooks = kspBuildRelatedPitchbookChoices_(
      context.pitchbookRows, normalizedInput.counterpartyId, normalizedInput.assetClassId, []
    );
    selected = kspValidateMeetingInput_(normalizedInput, context.catalog);
    fingerprint = kspBuildMeetingRequestFingerprint_(normalizedInput);

    if (normalizedInput.retryMeetingId) {
      var retryFingerprintMatches = normalizedInput.retryFingerprint === fingerprint ||
        (kspMeetingUsesOnlyLegacyFields_(normalizedInput) &&
          normalizedInput.retryFingerprint === kspBuildLegacyMeetingRequestFingerprint_(normalizedInput));
      kspAssert_(retryFingerprintMatches, 'MEETING_RETRY_REQUEST_CHANGED',
        '入力内容が変更されたため、以前のMeeting IDでは再試行できません。');
      meetingId = normalizedInput.retryMeetingId;
      var allocatedSequence = kspParseMeetingId_(meetingId);
      var nextSequence = environment.getCounterValue(context.backendSpreadsheetId, 'NEXT_MEETING_ID');
      kspAssert_(allocatedSequence < nextSequence, 'MEETING_RETRY_ID_NOT_ALLOCATED',
        '指定されたMeeting IDはこの環境で採番されていません。');
    } else {
      var sequence = environment.allocateCounter(context.backendSpreadsheetId, 'NEXT_MEETING_ID', startedAt);
      meetingId = kspFormatMeetingId_(sequence);
    }

    filename = kspBuildMeetingFilename_(normalizedInput, selected, meetingId);
    var existingRow = environment.findRowByKey(context.backendSpreadsheetId, KSP_SHEET_NAMES.MEETING_INDEX, 'Meeting_ID', meetingId);
    if (existingRow) {
      kspAssert_(kspMeetingIndexRowMatchesRequest_(existingRow, normalizedInput, filename), 'MEETING_RETRY_CONFLICT',
        '同じMeeting IDに異なる登録内容が存在します。');
      return { ok: true, workId: KSP_MEETING_WORK_ID, meeting: kspMeetingInfoFromIndexRow_(existingRow), idempotentReplay: true, warnings: warnings };
    }

    var documentText = kspBuildMeetingDocumentText_(normalizedInput, selected);
    documentInfo = environment.createOrReuseDocument(context.meetingRecordsFolderId, meetingId, filename, documentText);

    var indexRow = kspBuildMeetingIndexRow_(normalizedInput, selected, meetingId, documentInfo, filename, actor, startedAt);
    var indexResult = environment.appendUniqueRow(context.backendSpreadsheetId, KSP_SHEET_NAMES.MEETING_INDEX, 'Meeting_ID', indexRow);
    if (!indexResult.inserted) {
      kspAssert_(kspMeetingIndexRowMatchesRequest_(indexResult.row, normalizedInput, filename), 'MEETING_RETRY_CONFLICT',
        '同じMeeting IDに異なる登録内容が存在します。');
      return { ok: true, workId: KSP_MEETING_WORK_ID, meeting: kspMeetingInfoFromIndexRow_(indexResult.row), idempotentReplay: true, warnings: warnings };
    }

    var metadata = kspBuildMeetingMetadata_(normalizedInput, selected, meetingId, documentInfo, filename);
    var auditWarning = kspTryAppendMeetingAudit_(environment, context.auditSpreadsheetId, {
      timestamp: environment.nowIso(), actor: actor, meetingId: meetingId, result: KSP_AUDIT_RESULTS.SUCCESS, metadata: metadata
    });
    if (auditWarning) warnings.push(auditWarning);

    return {
      ok: true,
      workId: KSP_MEETING_WORK_ID,
      meeting: {
        id: meetingId,
        filename: filename,
        documentId: documentInfo.id,
        documentUrl: documentInfo.url,
        version: 1,
        status: KSP_STATUS.ACTIVE,
        aiIndexStatus: KSP_AI_INDEX_STATUS.PENDING,
        reusedDocument: Boolean(documentInfo.reused)
      },
      warnings: warnings
    };
  } catch (error) {
    if (context && context.auditSpreadsheetId) {
      var failureWarning = kspTryAppendMeetingAudit_(environment, context.auditSpreadsheetId, {
        timestamp: environment.nowIso(), actor: actor, meetingId: meetingId, result: KSP_AUDIT_RESULTS.FAILURE,
        errorCode: kspGetErrorCode_(error), errorMessage: kspSafePublicErrorMessage_(kspGetErrorCode_(error), 'MEETING')
      });
      if (failureWarning) warnings.push(failureWarning);
    }

    return {
      ok: false,
      workId: KSP_MEETING_WORK_ID,
      error: { code: kspGetErrorCode_(error), message: kspSafePublicErrorMessage_(kspGetErrorCode_(error), 'MEETING') },
      retry: meetingId && fingerprint ? { meetingId: meetingId, fingerprint: fingerprint } : null,
      warnings: warnings
    };
  }
}

function kspLoadMeetingRuntimeContext_(environment) {
  var state = environment.getInstallationState();
  kspAssert_(state && state.config && state.resources, 'INSTALLATION_STATE_MISSING',
    'Installation state is missing. Run setupKnowledgePlatform_() first.');

  var backendSpreadsheetId = state.resources[KSP_RESOURCE_KEYS.BACKEND_SPREADSHEET];
  var auditSpreadsheetId = state.resources[KSP_RESOURCE_KEYS.AUDIT_SPREADSHEET];
  var meetingRecordsFolderId = state.resources[KSP_RESOURCE_KEYS.MEETING_RECORDS];
  kspAssert_(backendSpreadsheetId, 'BACKEND_SPREADSHEET_MISSING', 'Backend Spreadsheet is not configured.');
  kspAssert_(auditSpreadsheetId, 'AUDIT_SPREADSHEET_MISSING', 'Audit Spreadsheet is not configured.');
  kspAssert_(meetingRecordsFolderId, 'MEETING_FOLDER_MISSING', 'Meeting Records folder is not configured.');

  var counterpartyRows = environment.readRows(backendSpreadsheetId, KSP_SHEET_NAMES.COUNTERPARTY_MASTER);
  var optionRows = environment.readRows(backendSpreadsheetId, KSP_SHEET_NAMES.OPTION_MASTER);
  var pitchbookRows = environment.readRows(backendSpreadsheetId, KSP_SHEET_NAMES.PITCHBOOK_INDEX);
  return {
    state: state,
    backendSpreadsheetId: backendSpreadsheetId,
    auditSpreadsheetId: auditSpreadsheetId,
    meetingRecordsFolderId: meetingRecordsFolderId,
    pitchbookRows: pitchbookRows,
    catalog: kspBuildMeetingCatalog_(counterpartyRows, optionRows)
  };
}

function kspGetMeetingActorSafely_(environment, warnings) {
  try {
    return environment.getActor() || 'UNIDENTIFIED';
  } catch (error) {
    warnings.push({ code: 'ACTOR_RESOLUTION_FAILED', message: kspSafeOperationalWarning_('ACTOR_RESOLUTION_FAILED') });
    return 'UNIDENTIFIED';
  }
}

function kspTryAppendMeetingAudit_(environment, auditSpreadsheetId, params) {
  try {
    environment.appendRow(auditSpreadsheetId, KSP_SHEET_NAMES.AUDIT_LOG, kspBuildMeetingAuditRow_(params));
    return null;
  } catch (error) {
    return { code: 'AUDIT_WRITE_FAILED', message: kspSafeOperationalWarning_('AUDIT_WRITE_FAILED') };
  }
}
// ===== END src/40_MeetingService.gs =====

// ===== BEGIN src/50_MeetingLiveEnvironment.gs =====
function kspCreateMeetingEnvironment_() {
  var scriptProperties = PropertiesService.getScriptProperties();
  return {
    nowIso: function () { return kspCanonicalInstantIso_(new Date()); },
    getInstallationState: function () {
      var raw = scriptProperties.getProperty(KSP_PROPERTY_KEYS.INSTALLATION_STATE_JSON);
      return kspSafeParseJson_(raw, KSP_PROPERTY_KEYS.INSTALLATION_STATE_JSON) || null;
    },
    getActor: function () {
      var email = '';
      var temporaryUserKey = '';
      try { email = Session.getActiveUser().getEmail(); } catch (ignoredEmail) { email = ''; }
      try { temporaryUserKey = Session.getTemporaryActiveUserKey(); } catch (ignoredKey) { temporaryUserKey = ''; }
      return kspResolveActorValue_(email, temporaryUserKey);
    },
    readRows: function (spreadsheetId, sheetName) {
      var spreadsheet = SpreadsheetApp.openById(spreadsheetId);
      var sheet = spreadsheet.getSheetByName(sheetName);
      kspAssert_(sheet, 'SHEET_NOT_FOUND', 'Sheet not found: ' + sheetName);
      var headers = kspReadHeadersFromSheet_(sheet);
      return kspReadObjectsFromSheet_(sheet, headers);
    },
    getCounterValue: function (spreadsheetId, counterKey) {
      var setting = kspFindSettingRow_(spreadsheetId, counterKey);
      var value = Number(setting.sheet.getRange(setting.rowIndex, setting.valueIndex + 1).getValue());
      kspAssert_(Number.isFinite(value) && value > 0 && Math.floor(value) === value,
        'COUNTER_VALUE_INVALID', 'Counter must be a positive integer: ' + counterKey);
      return value;
    },
    allocateCounter: function (spreadsheetId, counterKey, nowIso) {
      var lock = LockService.getScriptLock();
      if (!lock.tryLock(KSP_DEFAULTS.LOCK_TIMEOUT_MS)) {
        var lockError = new Error('Could not acquire the Meeting ID allocation lock.');
        lockError.code = 'MEETING_ID_LOCK_TIMEOUT';
        throw lockError;
      }
      try {
        var setting = kspFindSettingRow_(spreadsheetId, counterKey);
        var currentValue = Number(setting.sheet.getRange(setting.rowIndex, setting.valueIndex + 1).getValue());
        kspAssert_(Number.isFinite(currentValue) && currentValue > 0 && Math.floor(currentValue) === currentValue,
          'COUNTER_VALUE_INVALID', 'Counter must be a positive integer: ' + counterKey);
        setting.sheet.getRange(setting.rowIndex, setting.valueIndex + 1).setValue(String(currentValue + 1));
        if (setting.updatedAtIndex !== -1) setting.sheet.getRange(setting.rowIndex, setting.updatedAtIndex + 1).setValue(nowIso);
        return currentValue;
      } finally { lock.releaseLock(); }
    },
    findRowByKey: function (spreadsheetId, sheetName, keyColumn, keyValue) {
      var spreadsheet = SpreadsheetApp.openById(spreadsheetId);
      var sheet = spreadsheet.getSheetByName(sheetName);
      kspAssert_(sheet, 'SHEET_NOT_FOUND', 'Sheet not found: ' + sheetName);
      var headers = kspReadHeadersFromSheet_(sheet);
      var found = kspReadObjectsFromSheet_(sheet, headers).filter(function (row) {
        return String(row[keyColumn]) === String(keyValue);
      });
      kspAssert_(found.length <= 1, 'DUPLICATE_KEY_ROWS', 'Multiple rows found for ' + keyColumn + ': ' + keyValue);
      return found.length === 1 ? found[0] : null;
    },
    createOrReuseDocument: function (parentFolderId, meetingId, filename, documentText) {
      var lock = LockService.getScriptLock();
      if (!lock.tryLock(KSP_DEFAULTS.LOCK_TIMEOUT_MS)) {
        var lockError = new Error('Could not acquire the Meeting document lock.');
        lockError.code = 'MEETING_DOCUMENT_LOCK_TIMEOUT';
        throw lockError;
      }
      var file;
      var reused = false;
      try {
        var query = "'" + kspEscapeDriveQueryLiteral_(parentFolderId) + "' in parents" +
          " and trashed = false and name = '" + kspEscapeDriveQueryLiteral_(filename) +
          "' and mimeType = 'application/vnd.google-apps.document'";
        var response = Drive.Files.list({ q: query, spaces: 'drive', includeItemsFromAllDrives: true,
          supportsAllDrives: true, pageSize: 10, fields: 'files(id,name,webViewLink,parents)' });
        var matches = response.files || [];
        kspAssert_(matches.length <= 1, 'DUPLICATE_MEETING_DOCUMENTS', 'Multiple Meeting documents found for ' + meetingId + '.');
        if (matches.length === 1) {
          file = matches[0];
          reused = true;
        } else {
          file = Drive.Files.create({ name: filename, mimeType: 'application/vnd.google-apps.document', parents: [parentFolderId] },
            null, { supportsAllDrives: true, fields: 'id,name,webViewLink,parents' });
        }
      } finally { lock.releaseLock(); }

      try {
        var document = DocumentApp.openById(file.id);
        var body = document.getBody();
        body.clear();
        body.setText(documentText);
        document.saveAndClose();
      } catch (error) {
        error.code = error.code || 'MEETING_DOCUMENT_WRITE_FAILED';
        throw error;
      }
      return { id: file.id, name: file.name || filename,
        url: file.webViewLink || ('https://docs.google.com/document/d/' + file.id + '/edit'), reused: reused };
    },
    appendUniqueRow: function (spreadsheetId, sheetName, keyColumn, row) {
      var lock = LockService.getScriptLock();
      if (!lock.tryLock(KSP_DEFAULTS.LOCK_TIMEOUT_MS)) {
        var lockError = new Error('Could not acquire the Meeting Index write lock.');
        lockError.code = 'MEETING_INDEX_LOCK_TIMEOUT';
        throw lockError;
      }
      try {
        var spreadsheet = SpreadsheetApp.openById(spreadsheetId);
        var sheet = spreadsheet.getSheetByName(sheetName);
        kspAssert_(sheet, 'SHEET_NOT_FOUND', 'Sheet not found: ' + sheetName);
        var headers = kspReadHeadersFromSheet_(sheet);
        var found = kspReadObjectsFromSheet_(sheet, headers).filter(function (existing) {
          return String(existing[keyColumn]) === String(row[keyColumn]);
        });
        kspAssert_(found.length <= 1, 'DUPLICATE_KEY_ROWS', 'Multiple rows found for ' + keyColumn + ': ' + row[keyColumn]);
        if (found.length === 1) return { inserted: false, row: found[0] };
        var values = headers.map(function (header) {
          var value = row[header];
          return value === undefined || value === null ? '' : value;
        });
        sheet.getRange(sheet.getLastRow() + 1, 1, 1, headers.length).setValues([values]);
        return { inserted: true, row: row, rowNumber: sheet.getLastRow() };
      } finally { lock.releaseLock(); }
    },
    appendRow: function (spreadsheetId, sheetName, row) {
      var spreadsheet = SpreadsheetApp.openById(spreadsheetId);
      var sheet = spreadsheet.getSheetByName(sheetName);
      kspAssert_(sheet, 'SHEET_NOT_FOUND', 'Sheet not found: ' + sheetName);
      var headers = kspReadHeadersFromSheet_(sheet);
      var values = headers.map(function (header) {
        var value = row[header];
        return value === undefined || value === null ? '' : value;
      });
      sheet.getRange(sheet.getLastRow() + 1, 1, 1, headers.length).setValues([values]);
      return { rowNumber: sheet.getLastRow() };
    }
  };
}

function kspFindSettingRow_(spreadsheetId, counterKey) {
  var spreadsheet = SpreadsheetApp.openById(spreadsheetId);
  var sheet = spreadsheet.getSheetByName(KSP_SHEET_NAMES.SETTINGS);
  kspAssert_(sheet, 'SETTINGS_SHEET_NOT_FOUND', 'Settings sheet not found.');
  var headers = kspReadHeadersFromSheet_(sheet);
  var keyIndex = headers.indexOf('Key');
  var valueIndex = headers.indexOf('Value');
  var updatedAtIndex = headers.indexOf('Updated_At');
  kspAssert_(keyIndex !== -1 && valueIndex !== -1, 'SETTINGS_SCHEMA_INVALID', 'Settings sheet must include Key and Value columns.');
  var rows = kspReadObjectsFromSheet_(sheet, headers);
  var rowIndex = -1;
  for (var index = 0; index < rows.length; index += 1) {
    if (String(rows[index].Key) === String(counterKey)) { rowIndex = index + 2; break; }
  }
  kspAssert_(rowIndex !== -1, 'COUNTER_NOT_FOUND', 'Counter setting not found: ' + counterKey);
  return { sheet: sheet, rowIndex: rowIndex, valueIndex: valueIndex, updatedAtIndex: updatedAtIndex };
}
// ===== END src/50_MeetingLiveEnvironment.gs =====

