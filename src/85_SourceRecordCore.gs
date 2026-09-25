var KSP_SOURCE_RECORD_TYPES = Object.freeze({
  NEWS: Object.freeze({ key: 'NEWS', idField: 'News_ID', idPrefix: 'NEWS-', counterKey: 'NEXT_NEWS_ID',
    sheetName: 'News_Index', folderKey: 'newsFolderId', dateField: 'Published_Date' }),
  ASSESSMENT: Object.freeze({ key: 'ASSESSMENT', idField: 'Assessment_ID', idPrefix: 'ASMT-',
    counterKey: 'NEXT_ASSESSMENT_ID', sheetName: 'Internal_Assessment_Index',
    folderKey: 'internalAssessmentsFolderId', dateField: 'Assessment_Date' })
});

var KSP_ASSESSMENT_TYPES = Object.freeze([
  Object.freeze({ code: 'IC_DECISION', label: 'IC / 投資判断' }),
  Object.freeze({ code: 'NEGATIVE_NEWS', label: 'ネガティブニュース・不祥事' }),
  Object.freeze({ code: 'CV_DECLINED', label: 'CV / 案件見送り' }),
  Object.freeze({ code: 'GP_FUND_ASSESSMENT', label: 'GP / Fund評価' }),
  Object.freeze({ code: 'OTHER_INTERNAL', label: 'その他社内整理' })
]);

var KSP_SOURCE_REQUEST_TTL_MS = 24 * 60 * 60 * 1000;
var KSP_SOURCE_REQUEST_BUCKETS = 32;
var KSP_SOURCE_REQUEST_BUCKET_LIMIT = 24;

function kspSourceRequestTimestamp_(requestId) {
  var match = /^t(\d{13})_[A-Za-z0-9_-]{8,96}$/.exec(String(requestId || ''));
  kspAssert_(match, 'SOURCE_REQUEST_ID_INVALID', 'Request IDが不正です。');
  return Number(match[1]);
}

function kspSourceRequestBucketKey_(definition, requestId) {
  var bucket = parseInt(kspFnv1aHex_(requestId), 16) % KSP_SOURCE_REQUEST_BUCKETS;
  return 'KSP_SOURCE_REQUEST_' + definition.key + '_' + bucket;
}

function kspSourceDefinition_(kind) {
  var definition = KSP_SOURCE_RECORD_TYPES[String(kind || '').toUpperCase()];
  kspAssert_(definition, 'SOURCE_TYPE_INVALID', '記録種別が不正です。');
  return definition;
}

function kspSourceRecordId_(definition, sequence) {
  return definition.idPrefix + kspFormatSixDigitSequence_(sequence, definition.key);
}

function kspParseSourceRecordId_(definition, id) {
  var text = String(id || '');
  kspAssert_(text.indexOf(definition.idPrefix) === 0 && /^\d{6}$/.test(text.slice(definition.idPrefix.length)) &&
    Number(text.slice(definition.idPrefix.length)) > 0,
    'SOURCE_RECORD_ID_INVALID', '記録IDが不正です。');
  return Number(text.slice(definition.idPrefix.length));
}

function kspSourceCanonicalIds_(value, prefix, required) {
  var source = Array.isArray(value) ? value : String(value || '').split(',');
  var ids = source.map(function (item) { return String(item || '').trim(); }).filter(Boolean);
  var pattern = new RegExp('^' + prefix + '-\\d{6}$');
  ids.forEach(function (id) {
    kspAssert_(pattern.test(id), 'SOURCE_REFERENCE_ID_INVALID', '関連IDの形式が不正です。');
  });
  ids = kspUniqueStrings_(ids).sort();
  if (required) kspAssert_(ids.length > 0, 'SOURCE_COUNTERPARTY_REQUIRED', '面談先を1件以上選択してください。');
  return ids;
}

function kspNormalizeSourceRecordInput_(definition, rawInput) {
  var source = rawInput && typeof rawInput === 'object' ? rawInput : {};
  var file = source.file && typeof source.file === 'object' ? source.file : null;
  return {
    requestId: String(source.requestId || '').trim(),
    retryRecordId: String(source.retryRecordId || '').trim(),
    retryFingerprint: String(source.retryFingerprint || '').trim(),
    inputMode: String(source.inputMode || '').trim(),
    date: String(source.date || source[definition.dateField] || '').trim(),
    title: String(source.title || '').trim(),
    publisher: String(source.publisher || '').trim(),
    url: String(source.url || '').trim(),
    assessmentType: String(source.assessmentType || '').trim(),
    counterpartyIds: kspSourceCanonicalIds_(source.counterpartyIds || source.Counterparty_IDs, 'CP', true),
    assetClassId: String(source.assetClassId || '').trim(),
    fundStrategy: String(source.fundStrategy || '').trim(),
    decisionOrAction: String(source.decisionOrAction || '').trim(),
    relatedMeetingIds: kspSourceCanonicalIds_(source.relatedMeetingIds, 'MTG', false),
    relatedDocumentIds: kspSourceCanonicalIds_(source.relatedDocumentIds, 'DOC', false),
    relatedNewsIds: kspSourceCanonicalIds_(source.relatedNewsIds, 'NEWS', false),
    directText: source.directText === null || source.directText === undefined ? ''
      : String(source.directText).replace(/\r\n?/g, '\n').replace(/\u0000/g, ''),
    file: file ? {
      originalFilename: String(file.originalFilename || '').trim(),
      sizeBytes: Number(file.sizeBytes),
      mimeType: String(file.mimeType || 'application/octet-stream').trim(),
      base64Data: kspNormalizeBase64Payload_(file.base64Data)
    } : null
  };
}

function kspValidateSourceMasterReferences_(definition, input, counterpartyRows, optionRows, relatedRows) {
  var catalog = kspBuildMeetingCatalog_(counterpartyRows, optionRows);
  input.counterpartyIds.forEach(function (id) {
    kspRequireCatalogItem_(catalog.counterpartyEntities, id,
      'SOURCE_COUNTERPARTY_UNAVAILABLE', '選択された面談先は利用できません。');
  });
  if (input.assetClassId) kspRequireCatalogItem_(catalog.assetClasses, input.assetClassId,
    'SOURCE_ASSET_CLASS_UNAVAILABLE', '選択されたアセットクラスは利用できません。');
  if (definition.key === 'ASSESSMENT' && relatedRows) {
    [
      [input.relatedMeetingIds, relatedRows.meetings, 'Meeting_ID'],
      [input.relatedDocumentIds, relatedRows.documents, 'Document_ID'],
      [input.relatedNewsIds, relatedRows.news, 'News_ID']
    ].forEach(function (group) {
      group[0].forEach(function (id) {
        kspAssert_((group[1] || []).some(function (row) {
          return String(row[group[2]] || '') === id && String(row.Status || '') === KSP_STATUS.ACTIVE;
        }), 'SOURCE_REFERENCE_UNAVAILABLE', '選択された関連記録は利用できません。');
      });
    });
  }
  return catalog;
}

function kspValidateSourceRecordInput_(definition, input, catalog) {
  kspAssert_(kspIsValidDateKey_(input.date), 'SOURCE_DATE_INVALID', '日付を正しく入力してください。');
  kspAssert_(input.title && input.title.length <= 255, 'SOURCE_TITLE_INVALID', 'タイトルを255文字以内で入力してください。');
  kspAssert_(input.fundStrategy.length <= 500, 'SOURCE_FUND_STRATEGY_TOO_LONG', 'Fund / Strategyは500文字以内で入力してください。');
  kspAssert_(input.inputMode === 'DIRECT_TEXT' || input.inputMode === 'UPLOAD_FILE',
    'SOURCE_INPUT_MODE_INVALID', '本文入力またはファイルを選択してください。');
  if (definition.key === 'NEWS') {
    kspAssert_(input.publisher && input.publisher.length <= 255, 'NEWS_PUBLISHER_REQUIRED',
      '発行元を255文字以内で入力してください。');
    kspAssert_(!input.url || /^https?:\/\//i.test(input.url), 'NEWS_URL_INVALID', 'URLはhttpsまたはhttpで入力してください。');
  } else {
    kspAssert_(KSP_ASSESSMENT_TYPES.some(function (item) { return item.code === input.assessmentType; }),
      'ASSESSMENT_TYPE_INVALID', '評価区分を選択してください。');
  }
  kspValidateSourceMasterReferences_(definition, input, catalog.counterpartyRows, catalog.optionRows, catalog.relatedRows);
  if (input.inputMode === 'DIRECT_TEXT') {
    kspAssert_(input.directText.trim() && !input.file,
      'SOURCE_CONTENT_ROUTE_INVALID', '本文入力かファイルのどちらか一方を指定してください。');
  } else {
    kspAssert_(!input.directText.trim() && input.file,
      'SOURCE_CONTENT_ROUTE_INVALID', '本文入力かファイルのどちらか一方を指定してください。');
    kspValidatePitchbookFileDescriptor_(input.file);
    kspAssert_(input.file.base64Data, 'SOURCE_FILE_DATA_REQUIRED', 'ファイルデータがありません。');
  }
  kspSourceRequestTimestamp_(input.requestId);
  return true;
}

function kspSourceRecordPayloadJson_(input) {
  return JSON.stringify({
    inputMode: input.inputMode, date: input.date, title: input.title, publisher: input.publisher,
    url: input.url, assessmentType: input.assessmentType, counterpartyIds: input.counterpartyIds,
    assetClassId: input.assetClassId, fundStrategy: input.fundStrategy,
    decisionOrAction: input.decisionOrAction, relatedMeetingIds: input.relatedMeetingIds,
    relatedDocumentIds: input.relatedDocumentIds, relatedNewsIds: input.relatedNewsIds,
    directText: input.directText, file: input.file
  });
}

function kspSourceRecordFingerprint_(input) {
  return kspFnv1aHex_(kspSourceRecordPayloadJson_(input));
}

function kspSourceRecordPayloadSha256_(input) {
  var bytes = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256,
    kspSourceRecordPayloadJson_(input), Utilities.Charset.UTF_8);
  return bytes.map(function (byte) {
    return ('0' + (Number(byte) & 255).toString(16)).slice(-2);
  }).join('');
}

function kspSourceSavedFilename_(definition, input, id) {
  var stem = [input.date, input.title, id].map(kspNormalizeGeneratedNameSegment_).join('_');
  return input.inputMode === 'DIRECT_TEXT' ? stem :
    stem + '.' + kspGetPitchbookExtension_(input.file.originalFilename).toLowerCase();
}

function kspBuildSourceRecordRow_(definition, input, id, fileInfo, actor, nowIso, filename) {
  var row = {
    Title: input.title, Counterparty_IDs: input.counterpartyIds.join(','),
    Asset_Class_ID: input.assetClassId, Fund_Strategy: input.fundStrategy,
    Input_Mode: input.inputMode, Source_File_ID: fileInfo.id,
    Source_URL: fileInfo.url, Source_Mime_Type: input.inputMode === 'DIRECT_TEXT'
      ? 'application/vnd.google-apps.document' : input.file.mimeType,
    Original_Filename: input.file ? input.file.originalFilename : '', Saved_Filename: filename,
    Status: KSP_STATUS.ACTIVE, Version: 1,
    Created_At: nowIso, Updated_At: nowIso, Created_By: actor, Updated_By: actor,
    AI_Document_Name: '', AI_Index_Status: KSP_AI_INDEX_STATUS.NOT_INDEXED,
    AI_Indexed_At: '', AI_Content_Hash: '', AI_Last_Error: '', AI_Provider_State_JSON: ''
  };
  row[definition.idField] = id;
  row[definition.dateField] = input.date;
  if (definition.key === 'NEWS') { row.Publisher = input.publisher; row.URL = input.url; }
  else {
    row.Assessment_Type = input.assessmentType;
    row.Decision_Or_Action = input.decisionOrAction;
    row.Related_Meeting_IDs = input.relatedMeetingIds.join(',');
    row.Related_Document_IDs = input.relatedDocumentIds.join(',');
    row.Related_News_IDs = input.relatedNewsIds.join(',');
  }
  return row;
}

function kspMapSourceRecord_(definition, row, maps) {
  var ids = kspSourceCanonicalIds_(row.Counterparty_IDs, 'CP', false);
  var response = {
    id: String(row[definition.idField] || ''), date: kspCanonicalBusinessDate_(row[definition.dateField]),
    title: String(row.Title || ''), counterpartyIds: ids,
    counterpartyNames: ids.map(function (id) { return maps && maps.counterparty ? maps.counterparty[id] || id : id; }),
    assetClassId: String(row.Asset_Class_ID || ''),
    assetClassName: maps && maps.assetClass ? maps.assetClass[String(row.Asset_Class_ID || '')] || '' : '',
    fundStrategy: String(row.Fund_Strategy || ''), inputMode: String(row.Input_Mode || ''),
    sourceFileId: String(row.Source_File_ID || ''), sourceUrl: String(row.Source_URL || ''),
    sourceMimeType: String(row.Source_Mime_Type || ''),
    originalFilename: String(row.Original_Filename || ''), savedFilename: String(row.Saved_Filename || ''),
    status: String(row.Status || ''), version: Number(row.Version || 0),
    updatedAt: kspCanonicalInstantIso_(row.Updated_At)
  };
  if (definition.key === 'NEWS') {
    response.newsId = response.id; response.publisher = String(row.Publisher || '');
    response.url = String(row.URL || '');
  } else {
    response.assessmentId = response.id; response.assessmentType = String(row.Assessment_Type || '');
    response.assessmentTypeLabel = (KSP_ASSESSMENT_TYPES.filter(function (type) {
      return type.code === response.assessmentType;
    })[0] || {}).label || response.assessmentType;
    response.decisionOrAction = String(row.Decision_Or_Action || '');
    response.relatedMeetingIds = kspSourceCanonicalIds_(row.Related_Meeting_IDs, 'MTG', false);
    response.relatedDocumentIds = kspSourceCanonicalIds_(row.Related_Document_IDs, 'DOC', false);
    response.relatedNewsIds = kspSourceCanonicalIds_(row.Related_News_IDs, 'NEWS', false);
  }
  return response;
}
