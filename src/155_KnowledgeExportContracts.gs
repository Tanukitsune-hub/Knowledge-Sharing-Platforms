var KSP_KNOWLEDGE_EXPORT_WORK_ID = '0011';
var KSP_KNOWLEDGE_EXPORT_APP_VERSION = '0.1.0';

var KSP_KNOWLEDGE_EXPORT_SOURCE_TYPES = Object.freeze({
  MEETING: 'Meeting',
  PITCHBOOK: 'Pitchbook'
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

var KSP_KNOWLEDGE_EXPORT_MODE_ORDER = Object.freeze([
  '自由質問', '要約', '時系列', '比較', '面談準備'
]);

function kspGetKnowledgeExportModeDefinition_(mode) {
  var definitions = {
    '自由質問': {
      mode: '自由質問',
      inputLabel: '質問',
      placeholder: '例: 最近の資料で確認できる主な変化を整理してください。',
      inputRequired: true,
      gpRequired: false,
      instruction: '質問への直接回答を先に示し、資料で確認できる根拠と出典名を整理してください。'
    },
    '要約': {
      mode: '要約',
      inputLabel: '追加指示',
      placeholder: '任意: リスクと投資機会を中心に整理してください。',
      inputRequired: false,
      gpRequired: false,
      instruction: '複数資料を横断して統合し、主要テーマ、重要事実、変化、矛盾、示唆の順に整理してください。'
    },
    '時系列': {
      mode: '時系列',
      inputLabel: '追加指示',
      placeholder: '任意: 過去12か月の変化を中心に整理してください。',
      inputRequired: false,
      gpRequired: false,
      instruction: '日付順に整理し、前後の変化、継続事項、証拠が途切れる期間を区別してください。'
    },
    '比較': {
      mode: '比較',
      inputLabel: '追加指示',
      placeholder: '任意: 投資機会、リスク、見通しの共通軸で比較してください。',
      inputRequired: false,
      gpRequired: false,
      instruction: '資料で共通して確認できる軸だけで比較し、共通点、相違点、合意、不一致を示してください。'
    },
    '面談準備': {
      mode: '面談準備',
      inputLabel: '追加指示',
      placeholder: '任意: 次回面談で確認したいテーマを入力してください。',
      inputRequired: false,
      gpRequired: true,
      instruction: '選択されたGPとの面談に向け、主要アップデート、変化、未解決論点、再確認事項、質問候補を整理してください。'
    }
  };

  var normalized = String(mode || '').trim() || '自由質問';
  kspAssert_(definitions[normalized], 'KNOWLEDGE_EXPORT_MODE_INVALID', 'モードが不正です。');
  return definitions[normalized];
}

function kspGetKnowledgeExportModeDefinitions_() {
  return KSP_KNOWLEDGE_EXPORT_MODE_ORDER.map(function (mode) {
    return kspDeepClone_(kspGetKnowledgeExportModeDefinition_(mode));
  });
}

function kspNormalizeKnowledgeExportInput_(input) {
  var source = input && typeof input === 'object' ? input : {};
  var instruction = source.questionOrInstruction !== undefined ? source.questionOrInstruction :
    (source.question !== undefined ? source.question : source.instruction);
  return {
    mode: String(source.mode || '').trim() || '自由質問',
    questionOrInstruction: String(instruction === null || instruction === undefined ? '' : instruction).trim(),
    dateFrom: String(source.dateFrom || '').trim(),
    dateTo: String(source.dateTo || '').trim(),
    gpId: String(source.gpId || '').trim(),
    assetClassId: String(source.assetClassId || '').trim(),
    capitalTypeId: String(source.capitalTypeId || '').trim(),
    sourceType: String(source.sourceType || '').trim(),
    previewFingerprint: String(source.previewFingerprint || '').trim(),
    outputType: String(source.outputType || '').trim(),
    copyConfirmed: source.copyConfirmed === true
  };
}

function kspKnowledgeExportPublicFilters_(input) {
  var source = input || {};
  return {
    dateFrom: String(source.dateFrom || ''),
    dateTo: String(source.dateTo || ''),
    gpId: String(source.gpId || ''),
    assetClassId: String(source.assetClassId || ''),
    capitalTypeId: String(source.capitalTypeId || ''),
    sourceType: String(source.sourceType || '')
  };
}

function kspValidateKnowledgeExportFilters_(input, catalog) {
  var value = input || kspNormalizeKnowledgeExportInput_({});
  var definition = kspGetKnowledgeExportModeDefinition_(value.mode);
  if (definition.gpRequired) {
    kspAssert_(value.gpId, 'KNOWLEDGE_EXPORT_GP_REQUIRED', '面談準備ではGPを選択してください。');
  }
  if (value.dateFrom) kspAssert_(kspIsValidDateKey_(value.dateFrom), 'KNOWLEDGE_EXPORT_DATE_FROM_INVALID', 'Date Fromが不正です。');
  if (value.dateTo) kspAssert_(kspIsValidDateKey_(value.dateTo), 'KNOWLEDGE_EXPORT_DATE_TO_INVALID', 'Date Toが不正です。');
  if (value.dateFrom && value.dateTo) {
    kspAssert_(value.dateFrom <= value.dateTo, 'KNOWLEDGE_EXPORT_DATE_RANGE_INVALID', 'Date FromはDate To以前にしてください。');
  }
  if (value.sourceType) {
    kspAssert_(value.sourceType === KSP_KNOWLEDGE_EXPORT_SOURCE_TYPES.MEETING ||
      value.sourceType === KSP_KNOWLEDGE_EXPORT_SOURCE_TYPES.PITCHBOOK,
      'KNOWLEDGE_EXPORT_SOURCE_TYPE_INVALID', 'Source Typeが不正です。');
  }
  kspValidateKnowledgeFilterIds_(value, catalog || kspBuildKnowledgeSearchCatalog_([], []));
  return value;
}

function kspValidateKnowledgeExportPromptInput_(input, catalog) {
  var value = kspValidateKnowledgeExportFilters_(input, catalog);
  var definition = kspGetKnowledgeExportModeDefinition_(value.mode);
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
  var match = /^https:\/\/docs\.google\.com\/document\/d\/([^/?#&]+)(?:[/?#]|$)/i.exec(url);
  if (match) return match[1];
  match = /^https:\/\/drive\.google\.com\/file\/d\/([^/?#&]+)(?:[/?#]|$)/i.exec(url);
  if (match) return match[1];
  match = /^https:\/\/drive\.google\.com\/(?:open|uc)\?[^#]*\bid=([^&#]+)/i.exec(url);
  return match ? match[1] : '';
}

function kspKnowledgeExportUrlMatchesId_(value, fileId) {
  return Boolean(fileId) && kspKnowledgeExportUrlFileId_(value) === String(fileId);
}

function kspBuildKnowledgeExportCanonicalUrl_(sourceType, fileId) {
  var id = String(fileId || '').trim();
  kspAssert_(id, 'KNOWLEDGE_EXPORT_FILE_ID_MISSING', '原資料のファイルIDがありません。');
  return sourceType === KSP_KNOWLEDGE_EXPORT_SOURCE_TYPES.MEETING
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
    AI_GP_FILTER_UNAVAILABLE: '選択されたGPは利用できません。',
    AI_ASSET_CLASS_FILTER_UNAVAILABLE: '選択されたAsset Classは利用できません。',
    AI_CAPITAL_TYPE_FILTER_UNAVAILABLE: '選択されたEquity / Debtは利用できません。',
    KNOWLEDGE_EXPORT_PROMPT_REQUIRED: '自由質問では質問を入力してください。',
    KNOWLEDGE_EXPORT_PROMPT_TOO_LONG: '質問または追加指示は5,000文字以内で入力してください。',
    KNOWLEDGE_EXPORT_COPY_NOT_CONFIRMED: 'コピー成功の確認がないため、監査記録を作成できません。',
    KNOWLEDGE_EXPORT_OUTPUT_TYPE_INVALID: '出力形式が不正です。',
    KNOWLEDGE_EXPORT_PREVIEW_REQUIRED: '先に対象資料を確認してください。',
    KNOWLEDGE_EXPORT_PREVIEW_STALE: 'プレビューが古くなっています。再度プレビューを実行してください。',
    KNOWLEDGE_EXPORT_NO_RESULTS: '一致するActiveな資料がありません。',
    KNOWLEDGE_EXPORT_LIMIT_EXCEEDED: '対象資料が書き出し上限を超えています。フィルターを絞ってください。',
    KNOWLEDGE_EXPORT_MEETING_DOCUMENT_MISSING: 'Meetingの権威あるGoogle Docを確認できません。',
    KNOWLEDGE_EXPORT_MEETING_URL_MISSING: 'Meetingの権威あるDriveリンクを確認できません。',
    KNOWLEDGE_EXPORT_MEETING_LINK_MISMATCH: 'Meeting原本のリンク整合性を確認できません。',
    KNOWLEDGE_EXPORT_MEETING_DOCUMENT_READ_FAILED: 'Meetingの権威あるGoogle Docを読み取れません。',
    KNOWLEDGE_EXPORT_PITCHBOOK_FILE_MISSING: 'Pitchbook原本を確認できません。',
    KNOWLEDGE_EXPORT_PITCHBOOK_URL_MISSING: 'Pitchbookの権威あるDriveリンクを確認できません。',
    KNOWLEDGE_EXPORT_PITCHBOOK_LINK_MISMATCH: 'Pitchbook原本のリンク整合性を確認できません。',
    KNOWLEDGE_EXPORT_PITCHBOOK_METADATA_INVALID: 'PitchbookのDriveメタデータを確認できません。',
    KNOWLEDGE_EXPORT_PITCHBOOK_FILE_READ_FAILED: 'Pitchbook原本を確認できません。',
    KNOWLEDGE_EXPORT_RATE_LIMITED: '処理が集中しています。少し待って再試行してください。',
    KNOWLEDGE_EXPORTS_FOLDER_MISSING: 'Knowledge Exportsフォルダが設定されていません。',
    KNOWLEDGE_EXPORTS_FOLDER_INVALID: 'Knowledge Exportsフォルダの境界を確認できません。',
    KNOWLEDGE_EXPORT_ARTIFACT_MISSING: '生成された書き出しのIDを確認できません。',
    KNOWLEDGE_EXPORT_ARTIFACT_URL_MISSING: '生成された書き出しのDriveリンクを確認できません。',
    KNOWLEDGE_EXPORT_ARTIFACT_URL_MISMATCH: '生成された書き出しのリンク整合性を確認できません。',
    KNOWLEDGE_EXPORT_DOCUMENT_CREATE_FAILED: '生成されたGoogle Docの境界を確認できません。',
    KNOWLEDGE_EXPORT_DOCUMENT_URL_MISSING: '生成されたGoogle Docのリンクを確認できません。',
    KNOWLEDGE_EXPORT_PDF_EMPTY: 'PDFの内容が空です。',
    KNOWLEDGE_EXPORT_PDF_CREATE_FAILED: '生成されたPDFの境界を確認できません。',
    KNOWLEDGE_EXPORT_PDF_URL_MISSING: '生成されたPDFのリンクを確認できません。',
    KNOWLEDGE_EXPORT_ARTIFACT_CREATE_FAILED: '書き出しファイルを作成できませんでした。',
    KNOWLEDGE_EXPORT_FILE_ID_MISSING: '書き出しファイルIDがありません。'
  };
  var safe = messages[code] || 'Knowledge Exportを処理できませんでした。';
  var sourceId = error && error.sourceId ? String(error.sourceId) : '';
  if (sourceId && /^(?:MTG|DOC)-[A-Za-z0-9_-]{1,80}$/.test(sourceId) &&
      /KNOWLEDGE_EXPORT_(?:MEETING|PITCHBOOK)/.test(code)) {
    safe += ' 対象ID: ' + sourceId + '。';
  }
  return safe;
}

function kspKnowledgeExportSafeWarning_(code) {
  var messages = {
    ACTOR_RESOLUTION_FAILED: 'Actor情報を取得できないため、匿名扱いで記録します。',
    AUDIT_WRITE_FAILED: '監査メタデータを記録できませんでした。',
    KNOWLEDGE_EXPORT_TEMP_DOCUMENT_CLEANUP_FAILED: 'PDFは作成されましたが、一時Google Docを自動削除できませんでした。'
  };
  return messages[code] || 'Knowledge Exportの補足処理に失敗しました。';
}

function kspKnowledgeExportRowMatches_(row, input) {
  if (String(row.Status || '') !== KSP_STATUS.ACTIVE) return false;
  var date = kspKnowledgeExportDate_(row.Date);
  if (input.dateFrom && date < input.dateFrom) return false;
  if (input.dateTo && date > input.dateTo) return false;
  if (input.gpId && String(row.GP_ID || '') !== input.gpId) return false;
  if (input.assetClassId && String(row.Asset_Class_ID || '') !== input.assetClassId) return false;
  if (input.capitalTypeId && String(row.Capital_Type_ID || '') !== input.capitalTypeId) return false;
  return true;
}

function kspBuildKnowledgeExportSource_(sourceType, row) {
  var id = sourceType === KSP_KNOWLEDGE_EXPORT_SOURCE_TYPES.MEETING
    ? String(row.Meeting_ID || '') : String(row.Document_ID || '');
  kspAssert_(id, 'KNOWLEDGE_EXPORT_SOURCE_ID_MISSING', 'Active source IDがありません。');
  var date = kspKnowledgeExportDate_(row.Date);
  var revisionToken = [
    sourceType,
    id,
    date,
    sourceType === KSP_KNOWLEDGE_EXPORT_SOURCE_TYPES.MEETING ? String(row.Version || '') : '',
    kspKnowledgeExportUpdatedAt_(row.Updated_At),
    String(row.Doc_File_ID || row.File_ID || ''),
    String(row.Doc_URL || row.File_URL || ''),
    kspCanonicalBusinessTime_(row.Time),
    String(row.Location_ID || ''),
    String(row.Counterparty || ''),
    String(row.Internal_Participants || ''),
    String(row.Saved_Filename || ''),
    String(row.Original_Filename || ''),
    String(row.GP_ID || ''),
    kspMeetingCounterpartyType_(row),
    kspMeetingCounterpartyId_(row),
    kspMeetingRelatedGpIds_(row),
    String(row.Asset_Class_ID || ''),
    String(row.Capital_Type_ID || ''),
    String(row.Team_ID || ''),
    String(row.Fund_Strategy || ''),
    String(row.Meeting_Type_Codes || ''),
    String(row.Related_Pitchbook_IDs || ''),
    String(kspToBoolean_(row.Follow_Up_Required, false))
  ].join('\u001f');
  return {
    sourceType: sourceType,
    sourceId: id,
    date: date,
    revisionToken: revisionToken,
    row: kspDeepClone_(row)
  };
}

function kspResolveKnowledgeExportSources_(meetingRows, pitchbookRows, input) {
  var sources = [];
  var includeMeetings = !input.sourceType || input.sourceType === KSP_KNOWLEDGE_EXPORT_SOURCE_TYPES.MEETING;
  var includePitchbooks = !input.sourceType || input.sourceType === KSP_KNOWLEDGE_EXPORT_SOURCE_TYPES.PITCHBOOK;

  if (includeMeetings) {
    (meetingRows || []).forEach(function (row) {
      if (kspKnowledgeExportRowMatches_(row, input)) {
        sources.push(kspBuildKnowledgeExportSource_(KSP_KNOWLEDGE_EXPORT_SOURCE_TYPES.MEETING, row));
      }
    });
  }
  if (includePitchbooks) {
    (pitchbookRows || []).forEach(function (row) {
      if (kspKnowledgeExportRowMatches_(row, input)) {
        sources.push(kspBuildKnowledgeExportSource_(KSP_KNOWLEDGE_EXPORT_SOURCE_TYPES.PITCHBOOK, row));
      }
    });
  }

  return sources.sort(function (left, right) {
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
    counterpartyEntities: (value.counterpartyEntities || []).map(function (item) { return [item.type, item.id, item.name, item.status]; })
  }));
}

function kspBuildKnowledgeExportFingerprint_(sources, filters, catalog) {
  var normalizedFilters = filters || {};
  var tokens = (sources || []).map(function (source) {
    return source.revisionToken + '\u001d' + String(source.contentToken || '');
  });
  return 'ksp2-' + kspKnowledgeExportHash_(JSON.stringify({
    filters: kspKnowledgeExportPublicFilters_(normalizedFilters),
    catalog: kspKnowledgeExportCatalogToken_(catalog),
    sources: tokens
  })) + '-' + tokens.length;
}

function kspBuildKnowledgeExportLimitState_(meetingCount, meetingCharacterCount, pitchbookCount) {
  var warningReasons = [];
  var hardStopReasons = [];
  if (meetingCount > KSP_KNOWLEDGE_EXPORT_LIMITS.WARNING_MEETINGS) {
    warningReasons.push('Meetingが' + meetingCount + '件あります（警告基準: 30件超）。');
  }
  if (meetingCharacterCount > KSP_KNOWLEDGE_EXPORT_LIMITS.WARNING_MEETING_CHARACTERS) {
    warningReasons.push('Meeting原文が' + meetingCharacterCount + '文字あります（警告基準: 150,000文字超）。');
  }
  if (meetingCount > KSP_KNOWLEDGE_EXPORT_LIMITS.HARD_STOP_MEETINGS) {
    hardStopReasons.push('Meetingが' + meetingCount + '件で上限50件を超えています。');
  }
  if (meetingCharacterCount > KSP_KNOWLEDGE_EXPORT_LIMITS.HARD_STOP_MEETING_CHARACTERS) {
    hardStopReasons.push('Meeting原文が' + meetingCharacterCount + '文字で上限250,000文字を超えています。');
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
  [filters.gpId, filters.assetClassId, filters.capitalTypeId, filters.sourceType,
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
  var parts = ['Knowledge Export', String(value.mode || '自由質問')];
  var filters = kspKnowledgeExportPublicFilters_(value);
  [filters.gpId, filters.assetClassId, filters.capitalTypeId, filters.sourceType,
    filters.dateFrom, filters.dateTo].forEach(function (filterValue) {
    var segment = kspNormalizeGeneratedNameSegment_(filterValue);
    if (segment) parts.push(segment);
  });
  return parts.join(' / ').slice(0, 180);
}

function kspBuildKnowledgeExportRenderModel_(input, meetings, pitchbooks, maps, title) {
  var safeMaps = maps || { gp: {}, assetClass: {}, capitalType: {}, location: {}, team: {}, counterparty: {} };
  var meetingSections = (meetings || []).map(function (item) {
    var row = item.source.row;
    var counterpartyType = kspMeetingCounterpartyType_(row);
    var counterpartyId = kspMeetingCounterpartyId_(row);
    var definition = kspCounterpartyTypeDefinition_(counterpartyType);
    var relatedGpIds = kspMaintenanceSplitCodes_(kspMeetingRelatedGpIds_(row));
    var lines = [
      'Meeting ID: ' + item.source.sourceId,
      'Date: ' + item.source.date,
      'Counterparty Type: ' + (definition ? definition.label : counterpartyType),
      'Counterparty Entity: ' + ((safeMaps.counterparty || {})[counterpartyType + ':' + counterpartyId] || counterpartyId),
      'Asset Class: ' + (safeMaps.assetClass[String(row.Asset_Class_ID || '')] || String(row.Asset_Class_ID || ''))
    ];
    if (relatedGpIds.length) lines.push('Related GP: ' + relatedGpIds.map(function (id) {
      return (safeMaps.gp || {})[id] || id;
    }).join(', '));
    if (row.Time) lines.push('Time: ' + kspCanonicalBusinessTime_(row.Time));
    if (row.Capital_Type_ID) lines.push('Equity / Debt: ' + (safeMaps.capitalType[String(row.Capital_Type_ID)] || String(row.Capital_Type_ID)));
    if (row.Location_ID) lines.push('Location: ' + (safeMaps.location[String(row.Location_ID)] || String(row.Location_ID)));
    if (row.Counterparty) lines.push('Counterparty: ' + String(row.Counterparty));
    if (row.Internal_Participants) lines.push('Internal Participants: ' + String(row.Internal_Participants));
    if (row.Team_ID) lines.push('Team: ' + (safeMaps.team[String(row.Team_ID)] || String(row.Team_ID)));
    if (row.Fund_Strategy) lines.push('Fund / Strategy: ' + String(row.Fund_Strategy));
    var meetingTypes = kspMeetingTypeLabels_(row.Meeting_Type_Codes);
    if (meetingTypes.length) lines.push('Meeting Type: ' + meetingTypes.join(', '));
    if (kspToBoolean_(row.Follow_Up_Required, false)) lines.push('要フォロー: はい');
    if (row.Related_Pitchbook_IDs) lines.push('Related Pitchbook IDs: ' + String(row.Related_Pitchbook_IDs));
    lines.push('Authoritative Google Doc: ' + String(item.source.canonicalUrl || row.Doc_URL || ''));
    return {
      heading: 'Meeting ' + item.source.sourceId + ' / ' + item.source.date,
      metadataLines: lines,
      body: item.body
    };
  });
  var pitchbookLines = (pitchbooks || []).map(function (item) {
    var row = item.source.row;
    var filename = String(row.Saved_Filename || row.Original_Filename || '');
    return [
      'Document ID: ' + item.source.sourceId,
      'Date: ' + item.source.date,
      'GP: ' + (safeMaps.gp[String(row.GP_ID || '')] || String(row.GP_ID || '')),
      'Asset Class: ' + (safeMaps.assetClass[String(row.Asset_Class_ID || '')] || String(row.Asset_Class_ID || '')),
      row.Capital_Type_ID ? 'Equity / Debt: ' + (safeMaps.capitalType[String(row.Capital_Type_ID)] || String(row.Capital_Type_ID)) : '',
      row.Fund_Strategy ? 'Fund / Strategy: ' + String(row.Fund_Strategy) : '',
      'Saved filename: ' + filename,
      'File extension: ' + kspKnowledgeExportExtension_(filename),
      'Authoritative Drive link: ' + String(item.source.canonicalUrl || row.File_URL || '')
    ].filter(function (line) { return line; }).join('\n');
  });
  return {
    title: title || kspBuildKnowledgeExportPackageTitle_(input),
    meetingSections: meetingSections,
    pitchbookLines: pitchbookLines,
    pitchbookReferencesOnly: true
  };
}

function kspBuildKnowledgeExportPlainText_(model) {
  var lines = [String(model.title || 'Knowledge Export'), ''];
  (model.meetingSections || []).forEach(function (section, index) {
    if (index > 0) lines.push('\f');
    lines.push(section.heading);
    lines = lines.concat(section.metadataLines || []);
    lines.push('', section.body || '');
  });
  if ((model.pitchbookLines || []).length) {
    lines.push('', 'Pitchbooks / reference metadata and authoritative links only', '');
    lines = lines.concat(model.pitchbookLines);
  }
  return lines.join('\n');
}

function kspKnowledgeExportPromptLabel_(items, id) {
  var value = String(id || '');
  if (!value) return '未選択';
  var found = (items || []).filter(function (item) { return String(item.id) === value; })[0];
  return found ? String(found.name) + ' (' + value + ')' : value;
}

function kspBuildKnowledgeExportPrompt_(input, catalog) {
  var definition = kspGetKnowledgeExportModeDefinition_(input.mode);
  var filters = kspKnowledgeExportPublicFilters_(input);
  var safeCatalog = catalog || {};
  var sourceType = filters.sourceType || '未選択（Meeting と Pitchbook の両方）';
  var lines = [
    '添付したKnowledge Exportと、必要に応じて別途添付した原資料だけを根拠に、日本語で回答してください。',
    '資料にない事実は推測・創作せず、確認できない点と証拠不足を明示してください。',
    '重要な事実や比較には、可能な範囲で資料タイトル、Meeting ID、Document IDなどの出典名を付けてください。',
    '',
    'モード: ' + definition.mode,
    'Date From: ' + (filters.dateFrom || '未選択'),
    'Date To: ' + (filters.dateTo || '未選択'),
    'GP: ' + kspKnowledgeExportPromptLabel_(safeCatalog.gps, filters.gpId),
    'Asset Class: ' + kspKnowledgeExportPromptLabel_(safeCatalog.assetClasses, filters.assetClassId),
    'Equity / Debt: ' + kspKnowledgeExportPromptLabel_(safeCatalog.capitalTypes, filters.capitalTypeId),
    'Source Type: ' + sourceType,
    '',
    definition.instruction,
    'Meeting sectionは権威あるGoogle Docsの完全な原文を含みます。Pitchbook sectionは参照metadataと権威あるDrive linkのみを含み、Pitchbook本文は含みません。',
    'この全文出力はPitchbook本文を含みません。Pitchbook本文の分析が必要な場合は、許可された資料検索ルートで別途アップロードされた原資料を参照してください。'
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
    Source_Type_Filter: input.sourceType || '',
    Model_ID: '',
    Cited_Source_IDs: options.sourceIds || ''
  };
}
