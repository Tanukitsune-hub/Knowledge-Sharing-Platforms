var KSP_KNOWLEDGE_EXPORT_WORK_ID = '0011';
var KSP_KNOWLEDGE_EXPORT_APP_VERSION = '0.1.0';

var KSP_KNOWLEDGE_EXPORT_SOURCE_TYPES = Object.freeze({
  MEETING: 'Meeting',
  PITCHBOOK: 'Pitchbook',
  NEWS: 'News',
  ASSESSMENT: 'Internal Assessment'
});

var KSP_KNOWLEDGE_EXPORT_OUTPUT_TYPES = Object.freeze({
  GOOGLE_DOCS: 'GOOGLE_DOCS',
  PDF: 'PDF'
});

var KSP_KNOWLEDGE_EXPORT_ACTIONS = Object.freeze({
  PREVIEW: 'KNOWLEDGE_EXPORT_PREVIEW',
  GOOGLE_DOCS: 'KNOWLEDGE_EXPORT_GOOGLE_DOCS',
  PDF: 'KNOWLEDGE_EXPORT_PDF',
  PROMPT_COPY: 'KNOWLEDGE_EXPORT_PROMPT_COPY'
});

var KSP_KNOWLEDGE_EXPORT_LIMITS = Object.freeze({
  WARNING_MEETINGS: 30,
  WARNING_MEETING_CHARACTERS: 150000,
  HARD_STOP_MEETINGS: 50,
  HARD_STOP_MEETING_CHARACTERS: 250000,
  HARD_STOP_PITCHBOOKS: 200,
  MAX_PROMPT_LENGTH: 5000,
  MAX_PREVIEW_MILLIS: 20000,
  MAX_SOURCE_ID_REPORT: 40,
  THROTTLE_SECONDS: 2,
  IDEMPOTENCY_SECONDS: 300
});

var KSP_KNOWLEDGE_EXPORT_MODE_ORDER = KSP_KNOWLEDGE_MODE_ORDER;

function kspGetKnowledgeExportModeDefinition_(mode) {
  try {
    var definition = kspGetKnowledgeModeDefinition_(mode);
    definition.gpRequired = definition.targetRequired;
    return definition;
  } catch (error) {
    error.code = 'KNOWLEDGE_EXPORT_MODE_INVALID';
    throw error;
  }
}

function kspGetKnowledgeExportModeDefinitions_() {
  return kspGetKnowledgeModeDefinitions_().map(function (definition) {
    definition.gpRequired = definition.targetRequired;
    return definition;
  });
}

function kspNormalizeKnowledgeExportInput_(input) {
  var source = input && typeof input === 'object' ? input : {};
  var output = kspKnowledgeRequestWithLegacyFilterAliases_(kspNormalizeCanonicalKnowledgeRequest_(source));
  output.previewFingerprint = String(source.previewFingerprint || '').trim();
  output.outputType = String(source.outputType || '').trim();
  output.copyConfirmed = source.copyConfirmed === true;
  return output;
}

// Full Output ignores AI mode, prompt, and profiles while retaining selected source
// and Entity scope. Build a new request; never mutate caller-owned UI/search state.
function kspNormalizeKnowledgeFullOutputInput_(input) {
  var source = input && typeof input === 'object' ? input : {};
  var filters = kspKnowledgeRequestFilters_(source);
  var nested = source.filters && typeof source.filters === 'object' ? source.filters : {};
  var hasSelection = Object.prototype.hasOwnProperty.call(source, 'sourceTypes') ||
    Boolean(kspAiTrim_(source.sourceType)) ||
    Object.prototype.hasOwnProperty.call(nested, 'sourceTypes') ||
    Boolean(kspAiTrim_(nested.sourceType));
  if (!hasSelection) filters.sourceTypes = [KSP_KNOWLEDGE_EXPORT_SOURCE_TYPES.MEETING];
  var selectedEntityKeys = Array.isArray(source.selectedEntityKeys) ? source.selectedEntityKeys : [];
  return kspNormalizeKnowledgeExportInput_({
    route: KSP_AI_ROUTES.FULL_EXPORT,
    mode: selectedEntityKeys.length >= KSP_KNOWLEDGE_MULTI_ENTITY_MIN
      ? KSP_KNOWLEDGE_SEARCH_MODES.COMPARISON : KSP_KNOWLEDGE_SEARCH_MODES.SUMMARY,
    questionOrInstruction: '',
    selectedEntityKeys: selectedEntityKeys,
    sourceTypes: filters.sourceTypes,
    filters: filters,
    previewFingerprint: source.previewFingerprint,
    outputType: source.outputType
  });
}

function kspKnowledgeExportPublicFilters_(input) {
  return kspKnowledgeRequestFilters_(input);
}

function kspValidateKnowledgeExportFilters_(input, catalog) {
  var value = input || kspNormalizeKnowledgeExportInput_({});
  if (value.dateFrom) kspAssert_(kspIsValidDateKey_(value.dateFrom), 'KNOWLEDGE_EXPORT_DATE_FROM_INVALID', 'Date Fromが不正です。');
  if (value.dateTo) kspAssert_(kspIsValidDateKey_(value.dateTo), 'KNOWLEDGE_EXPORT_DATE_TO_INVALID', 'Date Toが不正です。');
  if (value.dateFrom && value.dateTo) {
    kspAssert_(value.dateFrom <= value.dateTo, 'KNOWLEDGE_EXPORT_DATE_RANGE_INVALID', 'Date FromはDate To以前にしてください。');
  }
  var canonical = kspValidateCanonicalKnowledgeRequest_(value);
  value.sourceTypes = canonical.sourceTypes;
  value.filters = canonical.filters;
  var filters = kspKnowledgeRequestFilters_(value);
  if (filters.entityKey) {
    kspAssert_(Boolean(kspCounterpartyIdFromEntityKey_(filters.entityKey)),
      'AI_ENTITY_FILTER_INVALID', 'Counterparty Entityが不正です。');
    if (filters.gpId) kspAssert_(kspCounterpartyIdFromEntityKey_(filters.entityKey) === filters.gpId,
      'AI_ENTITY_GP_CONFLICT', 'Counterparty EntityとGPが一致しません。');
  }
  kspValidateKnowledgeFilterIds_(value, catalog || kspBuildKnowledgeSearchCatalog_([], []));
  return value;
}

function kspValidateKnowledgeExportPromptInput_(input, catalog) {
  var value = kspValidateKnowledgeExportFilters_(input, catalog);
  var definition = kspGetKnowledgeExportModeDefinition_(value.mode);
  kspValidateCanonicalKnowledgeRequest_(value);
  kspValidateKnowledgeFilterIds_(value, catalog || kspBuildKnowledgeSearchCatalog_([], []));
  kspAssert_(value.questionOrInstruction.length <= KSP_KNOWLEDGE_EXPORT_LIMITS.MAX_PROMPT_LENGTH,
    'KNOWLEDGE_EXPORT_PROMPT_TOO_LONG', '質問または追加指示は5,000文字以内で入力してください。');
  if (definition.inputRequired) {
    kspAssert_(value.questionOrInstruction, 'KNOWLEDGE_EXPORT_PROMPT_REQUIRED', '質問を入力してください。');
  }
  return value;
}

function kspValidateKnowledgeExportCopyInput_(input, catalog) {
  var value = kspValidateKnowledgeExportPromptInput_(input, catalog);
  kspAssert_(value.copyConfirmed, 'KNOWLEDGE_EXPORT_COPY_NOT_CONFIRMED',
    'コピー成功の確認がありません。');
  return value;
}

function kspValidateKnowledgeExportOutputType_(outputType) {
  var value = String(outputType || '').trim();
  kspAssert_(value === KSP_KNOWLEDGE_EXPORT_OUTPUT_TYPES.GOOGLE_DOCS ||
    value === KSP_KNOWLEDGE_EXPORT_OUTPUT_TYPES.PDF,
    'KNOWLEDGE_EXPORT_OUTPUT_TYPE_INVALID', '出力形式が不正です。');
  return value;
}

function kspKnowledgeExportDate_(value) {
  return kspCanonicalBusinessDate_(value);
}

function kspKnowledgeExportUpdatedAt_(value) {
  return kspCanonicalInstantIso_(value);
}

function kspIsKnowledgeExportDriveUrl_(value) {
  return Boolean(kspKnowledgeExportUrlFileId_(value));
}

function kspKnowledgeExportUrlFileId_(value) {
  var url = String(value || '').trim();
  var match = /^https:\/\/docs\.google\.com\/(?:document|presentation|spreadsheets)\/d\/([^/?#&]+)(?:[/?#]|$)/i.exec(url);
  if (match) return match[1];
  match = /^https:\/\/drive\.google\.com\/file\/d\/([^/?#&]+)(?:[/?#]|$)/i.exec(url);
  if (match) return match[1];
  match = /^https:\/\/drive\.google\.com\/(?:open|uc)\?[^#]*\bid=([^&#]+)/i.exec(url);
  return match ? match[1] : '';
}

function kspKnowledgeExportUrlMatchesId_(value, fileId) {
  return Boolean(fileId) && kspKnowledgeExportUrlFileId_(value) === String(fileId);
}

function kspBuildKnowledgeExportCanonicalUrl_(sourceType, fileId, isGoogleDoc) {
  var id = String(fileId || '').trim();
  kspAssert_(id, 'KNOWLEDGE_EXPORT_FILE_ID_MISSING', '原資料のファイルIDがありません。');
  return sourceType === KSP_KNOWLEDGE_EXPORT_SOURCE_TYPES.MEETING || isGoogleDoc
    ? 'https://docs.google.com/document/d/' + id + '/edit'
    : 'https://drive.google.com/open?id=' + id;
}

function kspKnowledgeExportSourceError_(code, sourceId, message) {
  var error = new Error(message || 'Knowledge Export source integrity failed.');
  error.code = code;
  error.sourceId = String(sourceId || '');
  return error;
}

function kspKnowledgeExportSafeMessage_(code, error) {
  var messages = {
    KNOWLEDGE_EXPORT_MODE_INVALID: '書き出しモードが不正です。',
    KNOWLEDGE_EXPORT_GP_REQUIRED: '面談準備ではGPを選択してください。',
    KNOWLEDGE_EXPORT_DATE_FROM_INVALID: 'Date Fromが不正です。',
    KNOWLEDGE_EXPORT_DATE_TO_INVALID: 'Date Toが不正です。',
    KNOWLEDGE_EXPORT_DATE_RANGE_INVALID: 'Date FromはDate To以前にしてください。',
    KNOWLEDGE_EXPORT_SOURCE_TYPE_INVALID: 'Source Typeが不正です。',
    AI_SOURCE_TYPES_REQUIRED: '対象資料を1件以上選択してください。',
    AI_SOURCE_TYPES_INVALID: '対象資料の選択が不正です。',
    AI_SOURCE_TYPES_CONFLICT: '対象資料の選択が一致しません。',
    AI_SOURCE_TYPE_INVALID: '対象資料の種類が不正です。',
    AI_ADVANCED_FILTER_TOO_BROAD: '対象資料が多すぎます。フィルターを絞ってください。',
    AI_GP_FILTER_UNAVAILABLE: '選択されたGPは利用できません。',
    AI_ASSET_CLASS_FILTER_UNAVAILABLE: '選択されたアセットクラスは利用できません。',
    AI_CAPITAL_TYPE_FILTER_UNAVAILABLE: '選択されたEquity / Debtは利用できません。',
    AI_TEAM_FILTER_UNAVAILABLE: '選択されたチームは利用できません。',
    AI_COUNTERPARTY_TYPE_FILTER_UNAVAILABLE: '選択した面談先種別は利用できません。',
    AI_ENTITY_FILTER_UNAVAILABLE: '選択した面談先は利用できません。',
    AI_FUND_STRATEGY_FILTER_UNAVAILABLE: '選択されたFund / Strategyは利用できません。',
    AI_ENTITY_TYPE_CONFLICT: '面談先の種別が一致しません。',
    AI_ENTITY_GP_CONFLICT: '面談先とGPの指定が一致しません。',
    AI_MULTI_ENTITY_COUNT_INVALID: '比較する面談先を2–5件選択してください。',
    AI_MULTI_ENTITY_DUPLICATE: '同じ面談先を複数回選択できません。',
    AI_MULTI_ENTITY_MODE_REQUIRED: '面談先の複数選択は比較モードで利用できます。',
    AI_MULTI_ENTITY_AMBIGUOUS_SCOPE: '複数の面談先と単一の面談先を同時に指定できません。',
    AI_RELATED_GP_FILTER_UNAVAILABLE: '旧形式の検索条件は利用できません。',
    AI_MEETING_TYPE_FILTER_UNAVAILABLE: '選択されたMTG種別は利用できません。',
    AI_FILTER_SOURCE_TYPE_INCOMPATIBLE: 'チーム、MTG種別、フォローアップは「面談メモ」のみ選択した場合に利用できます。',
    KNOWLEDGE_EXPORT_PROMPT_REQUIRED: '自由質問では質問を入力してください。',
    KNOWLEDGE_EXPORT_PROMPT_TOO_LONG: '質問または追加指示は5,000文字以内で入力してください。',
    KNOWLEDGE_EXPORT_COPY_NOT_CONFIRMED: 'コピー成功の確認がないため、監査記録を作成できません。',
    KNOWLEDGE_EXPORT_OUTPUT_TYPE_INVALID: '出力形式が不正です。',
    KNOWLEDGE_EXPORT_PREVIEW_REQUIRED: '先に対象資料を確認してください。',
    KNOWLEDGE_EXPORT_PREVIEW_STALE: 'プレビューが古くなっています。再度プレビューを実行してください。',
    KNOWLEDGE_EXPORT_NO_RESULTS: '条件に合う有効な資料はありません。',
    KNOWLEDGE_EXPORT_LIMIT_EXCEEDED: '対象資料が書き出し上限を超えています。フィルターを絞ってください。',
    KNOWLEDGE_EXPORT_MEETING_DOCUMENT_MISSING: '面談記録のGoogle Docs原本が見つかりません。',
    KNOWLEDGE_EXPORT_MEETING_URL_MISSING: '面談記録の原本リンクがありません。',
    KNOWLEDGE_EXPORT_MEETING_LINK_MISMATCH: '面談記録の原本リンクが一致しません。',
    KNOWLEDGE_EXPORT_MEETING_DOCUMENT_READ_FAILED: '面談記録のGoogle Docs原本を読み込めません。',
    KNOWLEDGE_EXPORT_PITCHBOOK_FILE_MISSING: '保存資料の原本ファイルが見つかりません。',
    KNOWLEDGE_EXPORT_PITCHBOOK_URL_MISSING: '保存資料の原本リンクがありません。',
    KNOWLEDGE_EXPORT_PITCHBOOK_LINK_MISMATCH: '保存資料の原本リンクが一致しません。',
    KNOWLEDGE_EXPORT_PITCHBOOK_METADATA_INVALID: '保存資料の原本ファイルを開くことができません。',
    KNOWLEDGE_EXPORT_PITCHBOOK_FILE_READ_FAILED: '保存資料の原本ファイルを読み込めません。',
    KNOWLEDGE_EXPORT_SOURCE_INTEGRITY_FAILED: '選択した資料の原本を確認できません。',
    KNOWLEDGE_EXPORT_SOURCE_READ_FAILED: '選択した資料の原本本文を読み込めません。',
    KNOWLEDGE_EXPORT_UNSUPPORTED_MATERIALIZATION: '選択した資料の形式は全文出力に対応していません。',
    KNOWLEDGE_EXPORT_SCOPE_MISMATCH: '検索範囲と原本の対応を確認できません。',
    KNOWLEDGE_EXPORT_RATE_LIMITED: '処理が集中しています。少し待って再試行してください。',
    KNOWLEDGE_EXPORTS_FOLDER_MISSING: '書き出し先フォルダが見つかりません。',
    KNOWLEDGE_EXPORTS_FOLDER_INVALID: '書き出し先フォルダを確認できません。',
    KNOWLEDGE_EXPORT_ARTIFACT_MISSING: '書き出したファイルが見つかりません。',
    KNOWLEDGE_EXPORT_ARTIFACT_URL_MISSING: '書き出したファイルのリンクがありません。',
    KNOWLEDGE_EXPORT_ARTIFACT_URL_MISMATCH: '書き出したファイルのリンクが一致しません。',
    KNOWLEDGE_EXPORT_DOCUMENT_CREATE_FAILED: 'Google Docsの書き出しを完了できませんでした。',
    KNOWLEDGE_EXPORT_DOCUMENT_URL_MISSING: '作成したGoogle Docsのリンクがありません。',
    KNOWLEDGE_EXPORT_PDF_EMPTY: 'PDFの内容が空です。',
    KNOWLEDGE_EXPORT_PDF_CREATE_FAILED: 'PDFの書き出しを完了できませんでした。',
    KNOWLEDGE_EXPORT_PDF_URL_MISSING: '作成したPDFのリンクがありません。',
    KNOWLEDGE_EXPORT_ARTIFACT_CREATE_FAILED: '書き出しファイルを作成できませんでした。',
    KNOWLEDGE_EXPORT_FILE_ID_MISSING: '書き出したファイルが見つかりません。'
  };
  var safe = messages[code] || '資料を書き出せませんでした。';
  var sourceId = error && error.sourceId ? String(error.sourceId) : '';
  if (sourceId && /^(?:MTG|DOC|NEWS|ASMT)-[A-Za-z0-9_-]{1,80}$/.test(sourceId) &&
      /KNOWLEDGE_EXPORT_(?:MEETING|PITCHBOOK|SOURCE|UNSUPPORTED)/.test(code)) {
    safe += ' 対象ID: ' + sourceId + '。';
  }
  var extension = error && String(error.extension || '').toLowerCase();
  if (code === 'KNOWLEDGE_EXPORT_UNSUPPORTED_MATERIALIZATION' && /^(?:pdf|pptx|docx|xlsx|txt|eml)$/.test(extension)) {
    safe += ' 形式: .' + extension + '。';
  }
  return safe;
}

function kspKnowledgeExportSafeWarning_(code) {
  var messages = {
    ACTOR_RESOLUTION_FAILED: 'Actor情報を取得できないため、匿名扱いで記録します。',
    AUDIT_WRITE_FAILED: '監査メタデータを記録できませんでした。',
    KNOWLEDGE_EXPORT_TEMP_DOCUMENT_CLEANUP_FAILED: 'PDFは作成されましたが、一時Google Docを自動削除できませんでした。'
  };
  return messages[code] || '書き出し後の処理を完了できませんでした。';
}

function kspKnowledgeExportRowMatches_(row, input) {
  if (String(row.Status || '') !== KSP_STATUS.ACTIVE) return false;
  var date = kspKnowledgeExportDate_(row.Date);
  if (input.dateFrom && date < input.dateFrom) return false;
  if (input.dateTo && date > input.dateTo) return false;
  var counterpartyType = kspMeetingCounterpartyType_(row) || (row.Document_ID && row.GP_ID ? 'GP' : '');
  var counterpartyId = kspMeetingCounterpartyId_(row) || (row.Document_ID ? String(row.GP_ID || '') : '');
  var entityKey = kspCounterpartyEntityKey_(counterpartyId);
  if (input.counterpartyType && counterpartyType !== input.counterpartyType) return false;
  if (input.entityKey && entityKey !== input.entityKey) return false;
  if ((input.selectedEntityKeys || []).length >= KSP_KNOWLEDGE_MULTI_ENTITY_MIN &&
      input.selectedEntityKeys.indexOf(entityKey) === -1) return false;
  if (input.gpId && String(row.GP_ID || '') !== input.gpId) return false;
  if (input.assetClassId && String(row.Asset_Class_ID || '') !== input.assetClassId) return false;
  if (input.capitalTypeId && String(row.Capital_Type_ID || '') !== input.capitalTypeId) return false;
  if (input.teamId && String(row.Team_ID || '') !== input.teamId) return false;
  if (input.fundStrategy && String(row.Fund_Strategy || '').trim() !== input.fundStrategy) return false;
  if (input.followUp === KSP_KNOWLEDGE_FOLLOW_UP_FILTERS.REQUIRED &&
      !kspToBoolean_(row.Follow_Up_Required, false)) return false;
  if (input.followUp === KSP_KNOWLEDGE_FOLLOW_UP_FILTERS.NOT_REQUIRED &&
      kspToBoolean_(row.Follow_Up_Required, false)) return false;
  if (input.relatedGpId &&
      kspKnowledgeExactTokens_(kspMeetingRelatedGpIds_(row)).indexOf(input.relatedGpId) === -1) return false;
  if (input.meetingTypeCode &&
      kspKnowledgeExactTokens_(row.Meeting_Type_Codes).indexOf(input.meetingTypeCode) === -1) return false;
  return true;
}

function kspBuildKnowledgeExportSource_(sourceType, row) {
  var fields = {};
  fields[KSP_KNOWLEDGE_EXPORT_SOURCE_TYPES.MEETING] = ['Meeting_ID', 'Date', 'Doc_File_ID', 'Doc_URL'];
  fields[KSP_KNOWLEDGE_EXPORT_SOURCE_TYPES.PITCHBOOK] = ['Document_ID', 'Date', 'File_ID', 'File_URL'];
  fields[KSP_KNOWLEDGE_EXPORT_SOURCE_TYPES.NEWS] = ['News_ID', 'Published_Date', 'Source_File_ID', 'Source_URL'];
  fields[KSP_KNOWLEDGE_EXPORT_SOURCE_TYPES.ASSESSMENT] = ['Assessment_ID', 'Assessment_Date', 'Source_File_ID', 'Source_URL'];
  var sourceFields = fields[sourceType];
  kspAssert_(sourceFields, 'KNOWLEDGE_EXPORT_SOURCE_TYPE_INVALID', 'Source Typeが不正です。');
  var id = String(row[sourceFields[0]] || '');
  kspAssert_(id, 'KNOWLEDGE_EXPORT_SOURCE_ID_MISSING', 'Active source IDがありません。');
  var date = kspKnowledgeExportDate_(row[sourceFields[1]]);
  var counterpartyIds = sourceType === KSP_KNOWLEDGE_EXPORT_SOURCE_TYPES.NEWS ||
    sourceType === KSP_KNOWLEDGE_EXPORT_SOURCE_TYPES.ASSESSMENT
    ? kspSourceCanonicalIds_(row.Counterparty_IDs, 'CP', false)
    : [kspMeetingCounterpartyId_(row) || String(row.GP_ID || '')].filter(Boolean);
  var revisionFields = [
    'Version', 'Doc_File_ID', 'Doc_URL', 'File_ID', 'File_URL', 'Source_File_ID', 'Source_URL',
    'Input_Mode', 'Source_Mime_Type', 'Original_Filename', 'Saved_Filename', 'Title',
    'Publisher', 'URL', 'Assessment_Type', 'Decision_Or_Action', 'Counterparty_IDs',
    'Related_Meeting_IDs', 'Related_Document_IDs', 'Related_News_IDs', 'GP_ID',
    'Counterparty_Type', 'Counterparty_ID', 'Related_GP_IDs', 'Asset_Class_ID',
    'Capital_Type_ID', 'Team_ID', 'Fund_Strategy', 'Meeting_Type_Codes',
    'Related_Pitchbook_IDs', 'Location_ID', 'Counterparty', 'Internal_Participants',
    'Follow_Up_Note', 'Follow_Up_Required'
  ];
  var revisionToken = JSON.stringify([sourceType, id, date,
    kspKnowledgeExportUpdatedAt_(row.Updated_At), kspCanonicalBusinessTime_(row.Time)]
    .concat(revisionFields.map(function (field) { return String(row[field] || ''); })));
  return {
    sourceType: sourceType,
    sourceId: id,
    date: date,
    fileId: String(row[sourceFields[2]] || ''),
    sourceUrl: String(row[sourceFields[3]] || ''),
    entityKey: counterpartyIds.length === 1 ? kspCounterpartyEntityKey_(counterpartyIds[0]) : '',
    entityKeys: counterpartyIds.map(kspCounterpartyEntityKey_),
    counterpartyIds: counterpartyIds,
    revisionToken: revisionToken,
    row: kspDeepClone_(row)
  };
}

function kspResolveKnowledgeExportSources_(context, input) {
  var scope = context || {};
  var requested = input || {};
  kspAssert_(requested.advancedFilterResolved === true && Array.isArray(requested.resolvedSourceIds),
    'KNOWLEDGE_EXPORT_SCOPE_MISMATCH', '検索範囲が確定していません。');
  var wanted = {};
  requested.resolvedSourceIds.forEach(function (id) {
    kspAssert_(!wanted[id], 'KNOWLEDGE_EXPORT_SCOPE_MISMATCH', '検索対象IDが重複しています。');
    wanted[id] = true;
  });
  var sources = [];
  [
    [KSP_KNOWLEDGE_EXPORT_SOURCE_TYPES.MEETING, scope.meetingRows || [], 'Meeting_ID'],
    [KSP_KNOWLEDGE_EXPORT_SOURCE_TYPES.PITCHBOOK, scope.pitchbookRows || [], 'Document_ID'],
    [KSP_KNOWLEDGE_EXPORT_SOURCE_TYPES.NEWS, scope.newsRows || [], 'News_ID'],
    [KSP_KNOWLEDGE_EXPORT_SOURCE_TYPES.ASSESSMENT, scope.assessmentRows || [], 'Assessment_ID']
  ].forEach(function (definition) {
    definition[1].forEach(function (row) {
      var sourceId = String(row[definition[2]] || '');
      if (!wanted[sourceId]) return;
      kspAssert_(String(row.Status || '') === KSP_STATUS.ACTIVE &&
        requested.sourceTypes.indexOf(definition[0]) !== -1,
        'KNOWLEDGE_EXPORT_SCOPE_MISMATCH', '選択したActive原本と検索範囲が一致しません。');
      sources.push(kspBuildKnowledgeExportSource_(definition[0], row));
    });
  });
  kspAssert_(sources.length === requested.resolvedSourceIds.length,
    'KNOWLEDGE_EXPORT_SCOPE_MISMATCH', '検索対象IDと原本が一致しません。');

  var entityOrder = {};
  (requested.selectedEntityKeys || []).forEach(function (entityKey, index) { entityOrder[entityKey] = index; });
  return sources.sort(function (left, right) {
    if ((requested.selectedEntityKeys || []).length >= KSP_KNOWLEDGE_MULTI_ENTITY_MIN) {
      var leftEntityOrder = Object.prototype.hasOwnProperty.call(entityOrder, left.entityKey) ? entityOrder[left.entityKey] : 999;
      var rightEntityOrder = Object.prototype.hasOwnProperty.call(entityOrder, right.entityKey) ? entityOrder[right.entityKey] : 999;
      if (leftEntityOrder !== rightEntityOrder) return leftEntityOrder - rightEntityOrder;
    }
    var dateCompare = left.date.localeCompare(right.date);
    if (dateCompare !== 0) return dateCompare;
    var idCompare = left.sourceId.localeCompare(right.sourceId);
    if (idCompare !== 0) return idCompare;
    return left.sourceType.localeCompare(right.sourceType);
  });
}

function kspKnowledgeExportHash_(text) {
  if (typeof Utilities !== 'undefined' && Utilities.computeDigest && Utilities.DigestAlgorithm && Utilities.Charset) {
    var bytes = Utilities.computeDigest(
      Utilities.DigestAlgorithm.SHA_256,
      String(text || ''),
      Utilities.Charset.UTF_8
    );
    return bytes.map(function (byte) {
      var value = Number(byte) & 255;
      return ('0' + value.toString(16)).slice(-2);
    }).join('');
  }
  var hash = 2166136261;
  var second = 2654435761;
  var value = String(text || '');
  for (var index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
    second ^= value.charCodeAt(index);
    second = Math.imul(second, 2246822519);
  }
  return ('00000000' + (hash >>> 0).toString(16)).slice(-8) +
    ('00000000' + (second >>> 0).toString(16)).slice(-8);
}

function kspKnowledgeExportCatalogToken_(catalog) {
  var value = catalog || {};
  return kspKnowledgeExportHash_(JSON.stringify({
    gps: (value.gps || []).map(function (item) { return [item.id, item.name, item.status]; }),
    assetClasses: (value.assetClasses || []).map(function (item) { return [item.id, item.name, item.status]; }),
    capitalTypes: (value.capitalTypes || []).map(function (item) { return [item.id, item.name, item.status]; }),
    teams: (value.teams || []).map(function (item) { return [item.id, item.name, item.status]; }),
    counterpartyTypes: (value.counterpartyTypes || []).map(function (item) { return [item.code, item.label, item.optionType]; }),
    counterpartyEntities: (value.counterpartyEntities || []).map(function (item) { return [item.type, item.id, item.name, item.status]; }),
    fundStrategies: (value.fundStrategies || []).map(function (item) { return [item.id, item.name]; })
  }));
}

function kspBuildKnowledgeExportFingerprint_(sources, filters, catalog) {
  var normalizedFilters = filters || {};
  var tokens = (sources || []).map(function (source) {
    return source.revisionToken + '\u001d' + String(source.contentToken || '');
  });
  return 'ksp3-' + kspKnowledgeExportHash_(JSON.stringify({
    route: KSP_AI_ROUTES.FULL_EXPORT,
    mode: normalizedFilters.mode || KSP_KNOWLEDGE_SEARCH_MODES.FREE_QUESTION,
    instructionHash: kspKnowledgeExportHash_(normalizedFilters.questionOrInstruction || ''),
    sourceTypes: normalizedFilters.sourceTypes || [],
    resolvedSourceIds: normalizedFilters.resolvedSourceIds || [],
    filters: kspKnowledgeExportPublicFilters_(normalizedFilters),
    catalog: kspKnowledgeExportCatalogToken_(catalog),
    sources: tokens
  })) + '-' + tokens.length;
}

function kspBuildKnowledgeExportLimitState_(meetingCount, meetingCharacterCount, pitchbookCount, totalCharacterCount) {
  var warningReasons = [];
  var hardStopReasons = [];
  if (meetingCount > KSP_KNOWLEDGE_EXPORT_LIMITS.WARNING_MEETINGS) {
    warningReasons.push('Meetingが' + meetingCount + '件あります（警告基準: 30件超）。');
  }
  if (meetingCharacterCount > KSP_KNOWLEDGE_EXPORT_LIMITS.WARNING_MEETING_CHARACTERS) {
    warningReasons.push('Meeting原文が' + meetingCharacterCount + '文字あります（警告基準: 150,000文字超）。');
  }
  if (Number(totalCharacterCount || 0) > meetingCharacterCount &&
      totalCharacterCount > KSP_KNOWLEDGE_EXPORT_LIMITS.WARNING_MEETING_CHARACTERS) {
    warningReasons.push('選択資料の本文が' + totalCharacterCount + '文字あります（警告基準: 150,000文字超）。');
  }
  if (meetingCount > KSP_KNOWLEDGE_EXPORT_LIMITS.HARD_STOP_MEETINGS) {
    hardStopReasons.push('Meetingが' + meetingCount + '件で上限50件を超えています。');
  }
  if (meetingCharacterCount > KSP_KNOWLEDGE_EXPORT_LIMITS.HARD_STOP_MEETING_CHARACTERS) {
    hardStopReasons.push('Meeting原文が' + meetingCharacterCount + '文字で上限250,000文字を超えています。');
  }
  if (Number(totalCharacterCount || 0) > meetingCharacterCount &&
      totalCharacterCount > KSP_KNOWLEDGE_EXPORT_LIMITS.HARD_STOP_MEETING_CHARACTERS) {
    hardStopReasons.push('選択資料の本文が' + totalCharacterCount + '文字で上限250,000文字を超えています。');
  }
  if (pitchbookCount > KSP_KNOWLEDGE_EXPORT_LIMITS.HARD_STOP_PITCHBOOKS) {
    hardStopReasons.push('Pitchbookが' + pitchbookCount + '件で上限200件を超えています。');
  }
  return {
    warning: warningReasons.length > 0,
    warningReasons: warningReasons,
    hardStop: hardStopReasons.length > 0,
    hardStopReasons: hardStopReasons
  };
}

function kspBuildKnowledgeExportSourceIdRepresentation_(sourceIds) {
  var ids = (sourceIds || []).map(String);
  var maximum = KSP_KNOWLEDGE_EXPORT_LIMITS.MAX_SOURCE_ID_REPORT;
  if (ids.length <= maximum) return ids.join(',');
  return ids.slice(0, maximum).join(',') + ',...(total=' + ids.length + ')';
}

function kspKnowledgeExportExtension_(filename) {
  var match = /\.([A-Za-z0-9]+)$/.exec(String(filename || ''));
  return match ? '.' + match[1].toLowerCase() : '';
}

function kspBuildKnowledgeExportFilename_(input, nowIso, outputType) {
  var parts = ['Knowledge_Export'];
  var filters = kspKnowledgeExportPublicFilters_(input);
  [filters.counterpartyType, filters.entityKey, filters.gpId, filters.assetClassId,
    filters.capitalTypeId, filters.teamId, filters.fundStrategy, filters.followUp,
    (input.sourceTypes || []).join('+'),
    filters.dateFrom, filters.dateTo].forEach(function (value) {
    var segment = kspNormalizeGeneratedNameSegment_(value);
    if (segment) parts.push(segment);
  });
  var timestamp = kspCanonicalInstantIso_(nowIso).replace(/[^0-9]/g, '').slice(0, 14);
  if (timestamp) parts.push(timestamp);
  var name = parts.join('_').slice(0, 140);
  return outputType === KSP_KNOWLEDGE_EXPORT_OUTPUT_TYPES.PDF ? name + '.pdf' : name;
}

function kspBuildKnowledgeExportPackageTitle_(input) {
  var value = input || {};
  var parts = ['ナレッジ全文出力'];
  var filters = kspKnowledgeExportPublicFilters_(value);
  [filters.counterpartyType, filters.entityKey, (input.selectedEntityKeys || []).join('+'), filters.gpId, filters.assetClassId,
    filters.capitalTypeId, filters.teamId, filters.fundStrategy, filters.followUp,
    (input.sourceTypes || []).join('+'),
    filters.dateFrom, filters.dateTo].forEach(function (filterValue) {
    var segment = kspNormalizeGeneratedNameSegment_(filterValue);
    if (segment) parts.push(segment);
  });
  return parts.join(' / ').slice(0, 180);
}

function kspBuildKnowledgeExportRenderModel_(input, materialsOrMeetings, mapsOrPitchbooks, titleOrMaps, legacyTitle) {
  var materials = Array.isArray(materialsOrMeetings)
    ? { sources: (materialsOrMeetings || []).concat(mapsOrPitchbooks || []) }
    : (materialsOrMeetings || { sources: [] });
  var safeMaps = Array.isArray(materialsOrMeetings) ? titleOrMaps : mapsOrPitchbooks;
  var title = Array.isArray(materialsOrMeetings) ? legacyTitle : titleOrMaps;
  safeMaps = safeMaps || { gp: {}, assetClass: {}, capitalType: {}, location: {}, team: {}, counterparty: {} };
  var sourceSections = (materials.sources || []).map(function (item) {
    var source = item.source;
    var row = source.row || {};
    var label = kspAiSourceLabel_(source.sourceType);
    var counterpartyNames = (source.counterpartyIds || []).map(function (id) {
      return (safeMaps.counterparty || {})[id] || id;
    });
    var lines = [
      '出典種別: ' + label,
      '原本ID: ' + source.sourceId,
      '日付: ' + source.date,
      '面談先: ' + (counterpartyNames.join(' / ') || '登録情報なし'),
      'アセットクラス: ' + ((safeMaps.assetClass || {})[String(row.Asset_Class_ID || '')] || String(row.Asset_Class_ID || ''))
    ];
    if (row.Title) lines.push('タイトル: ' + String(row.Title));
    if (row.Fund_Strategy) lines.push('Fund / Strategy: ' + String(row.Fund_Strategy));
    if (source.sourceType === KSP_KNOWLEDGE_EXPORT_SOURCE_TYPES.MEETING) {
      var counterpartyType = String((safeMaps.counterpartyType || {})[source.counterpartyIds[0]] ||
        kspMeetingCounterpartyType_(row));
      var definition = kspCounterpartyTypeDefinition_(counterpartyType);
      if (counterpartyType) lines.push('面談先区分: ' + (definition ? definition.label : counterpartyType));
      if (row.Time) lines.push('時間: ' + kspCanonicalBusinessTime_(row.Time));
      if (row.Capital_Type_ID) lines.push('Equity / Debt: ' + ((safeMaps.capitalType || {})[String(row.Capital_Type_ID)] || String(row.Capital_Type_ID)));
      if (row.Location_ID) lines.push('面談場所: ' + ((safeMaps.location || {})[String(row.Location_ID)] || String(row.Location_ID)));
      if (row.Counterparty) lines.push('面談相手: ' + String(row.Counterparty));
      if (row.Internal_Participants) lines.push('当社側: ' + String(row.Internal_Participants));
      if (row.Team_ID) lines.push('チーム: ' + ((safeMaps.team || {})[String(row.Team_ID)] || String(row.Team_ID)));
      var meetingTypes = kspMeetingTypeLabels_(row.Meeting_Type_Codes);
      if (meetingTypes.length) lines.push('MTG種別: ' + meetingTypes.join(', '));
      if (row.Related_Pitchbook_IDs) lines.push('関連Document ID: ' + String(row.Related_Pitchbook_IDs));
    } else if (source.sourceType === KSP_KNOWLEDGE_EXPORT_SOURCE_TYPES.PITCHBOOK) {
      if (row.Original_Filename) lines.push('原ファイル名: ' + String(row.Original_Filename));
    } else if (source.sourceType === KSP_KNOWLEDGE_EXPORT_SOURCE_TYPES.NEWS) {
      if (row.Publisher) lines.push('発行元: ' + String(row.Publisher));
      if (row.URL) lines.push('公開元URL: ' + String(row.URL));
    } else if (source.sourceType === KSP_KNOWLEDGE_EXPORT_SOURCE_TYPES.ASSESSMENT) {
      var type = (KSP_ASSESSMENT_TYPES || []).filter(function (entry) {
        return entry.code === String(row.Assessment_Type || '');
      })[0];
      lines.push('来歴: 当時の社内評価（外部事実ではありません）');
      if (row.Assessment_Type) lines.push('評価種別: ' + (type ? type.label : String(row.Assessment_Type)));
      if (row.Decision_Or_Action) lines.push('判断・対応: ' + String(row.Decision_Or_Action));
      if (row.Related_Meeting_IDs) lines.push('関連Meeting ID: ' + String(row.Related_Meeting_IDs));
      if (row.Related_Document_IDs) lines.push('関連Document ID: ' + String(row.Related_Document_IDs));
      if (row.Related_News_IDs) lines.push('関連News ID: ' + String(row.Related_News_IDs));
    }
    lines.push('原本URL: ' + String(source.canonicalUrl || source.sourceUrl || ''));
    return {
      sourceType: source.sourceType,
      sourceId: source.sourceId,
      entityKey: source.entityKey,
      entityLabel: counterpartyNames.length === 1 ? counterpartyNames[0] : '',
      heading: label + ' ' + source.sourceId + ' / ' + source.date,
      metadataLines: lines,
      body: String(item.body || '')
    };
  });
  return {
    title: title || kspBuildKnowledgeExportPackageTitle_(input),
    headerLines: ['選択資料の全文出力', '対象範囲: ' + kspKnowledgeScopeSummary_(input)],
    sourceSections: sourceSections,
    meetingSections: sourceSections.filter(function (section) {
      return section.sourceType === KSP_KNOWLEDGE_EXPORT_SOURCE_TYPES.MEETING;
    }),
    pitchbookLines: [],
    pitchbookReferencesOnly: false
  };
}

function kspBuildKnowledgeExportPlainText_(model) {
  var lines = [String(model.title || 'ナレッジ全文出力')].concat(model.headerLines || [], ['']);
  var currentEntityKey = '';
  (model.sourceSections || model.meetingSections || []).forEach(function (section, index) {
    if (section.entityKey && section.entityKey !== currentEntityKey) {
      if (index > 0) lines.push('\f');
      lines.push('面談先: ' + (section.entityLabel || '登録情報なし'), '');
      currentEntityKey = section.entityKey;
    } else if (index > 0) lines.push('\f');
    lines.push(section.heading);
    lines = lines.concat(section.metadataLines || []);
    lines.push('', section.body || '');
  });
  return lines.join('\n');
}

function kspKnowledgeExportPromptLabel_(items, id) {
  var value = String(id || '');
  if (!value) return '未選択';
  var found = (items || []).filter(function (item) { return String(item.id) === value; })[0];
  return found ? String(found.name) : '登録情報なし';
}

function kspBuildKnowledgeExportPrompt_(input, catalog) {
  var definition = kspGetKnowledgeExportModeDefinition_(input.mode);
  var filters = kspKnowledgeExportPublicFilters_(input);
  var safeCatalog = catalog || {};
  var sourceLabels = (input.sourceTypes || []).map(kspAiSourceLabel_).join('、');
  var lines = [
    '添付した選択資料の全文だけを根拠に、日本語で回答してください。',
    '資料にない事実は推測・創作せず、確認できない点と証拠不足を明示してください。',
    '重要な事実や比較には、資料タイトル、出典種別、安定IDを付けてください。',
    '評価（ICメモ、社内整理等）は当時の社内評価として扱い、外部事実と混同しないでください。',
    '',
    'モード: ' + definition.mode,
    '開始日: ' + (filters.dateFrom || '未選択'),
    '終了日: ' + (filters.dateTo || '未選択'),
    '面談先区分: ' + (filters.counterpartyType || '未選択'),
    '面談先: ' + kspKnowledgeExportPromptLabel_(safeCatalog.counterpartyEntities, filters.entityKey),
    '比較対象の面談先: ' + ((input.selectedEntityKeys || []).length
      ? input.selectedEntityKeys.map(function (entityKey) {
        return kspKnowledgeExportPromptLabel_(safeCatalog.counterpartyEntities, entityKey);
      }).join(', ') : '未選択'),
    'アセットクラス: ' + kspKnowledgeExportPromptLabel_(safeCatalog.assetClasses, filters.assetClassId),
    'Equity / Debt: ' + kspKnowledgeExportPromptLabel_(safeCatalog.capitalTypes, filters.capitalTypeId),
    'チーム: ' + kspKnowledgeExportPromptLabel_(safeCatalog.teams, filters.teamId),
    'Fund / Strategy: ' + (filters.fundStrategy || '未選択'),
    'MTG種別: ' + (filters.meetingTypeCode || '未選択'),
    '対象資料: ' + sourceLabels,
    '',
    definition.instruction,
    '各sectionには原本の本文、安定ID、原本URL、来歴を含みます。'
  ];
  if (input.questionOrInstruction) lines.push('', '質問または追加指示:', input.questionOrInstruction);
  return lines.join('\n');
}

function kspKnowledgeExportActionForOutput_(outputType) {
  return outputType === KSP_KNOWLEDGE_EXPORT_OUTPUT_TYPES.PDF
    ? KSP_KNOWLEDGE_EXPORT_ACTIONS.PDF : KSP_KNOWLEDGE_EXPORT_ACTIONS.GOOGLE_DOCS;
}

function kspBuildKnowledgeExportAuditRow_(params) {
  var options = params || {};
  var input = options.input || {};
  var counts = options.counts || {};
  var metadata = kspDeepClone_(options.metadata || {});
  metadata.meetingCount = Number(counts.meetingCount || 0);
  metadata.meetingCharacterCount = Number(counts.meetingCharacterCount || 0);
  metadata.pitchbookCount = Number(counts.pitchbookCount || 0);
  metadata.newsCount = Number(counts.newsCount || 0);
  metadata.assessmentCount = Number(counts.assessmentCount || 0);
  metadata.totalCharacterCount = Number(counts.totalCharacterCount || 0);
  metadata.sourceTypes = Array.isArray(input.sourceTypes) ? input.sourceTypes.slice() : [];
  metadata.route = KSP_AI_ROUTES.FULL_EXPORT;
  metadata.mode = input.mode || KSP_KNOWLEDGE_SEARCH_MODES.FREE_QUESTION;
  metadata.structuredFilters = kspKnowledgeFilterAuditMetadata_(input);
  return {
    Event_Timestamp: kspCanonicalInstantIso_(options.timestamp),
    Actor: options.actor || 'UNIDENTIFIED',
    Action: options.action || KSP_KNOWLEDGE_EXPORT_ACTIONS.PREVIEW,
    Target_Type: 'KnowledgeExport',
    Target_ID: options.targetId || '',
    Result: options.result || KSP_AUDIT_RESULTS.FAILURE,
    Changed_Fields: '',
    Before_Metadata_JSON: '',
    After_Metadata_JSON: JSON.stringify(metadata),
    Batch_ID: '',
    Error_Code: options.errorCode || '',
    Error_Message: options.errorCode ? kspKnowledgeExportSafeMessage_(options.errorCode, options.error) : '',
    Search_Mode: input.mode || '',
    Question_Or_Instruction: '',
    Date_From: input.dateFrom || '',
    Date_To: input.dateTo || '',
    GP_Filter: input.gpId || '',
    Asset_Class_Filter: input.assetClassId || '',
    Capital_Type_Filter: input.capitalTypeId || '',
    Source_Type_Filter: JSON.stringify(input.sourceTypes || []),
    Model_ID: '',
    Cited_Source_IDs: options.sourceIds || ''
  };
}
