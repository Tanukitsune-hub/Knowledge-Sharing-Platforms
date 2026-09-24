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

// ===== BEGIN src/60_PitchbookConstants.gs =====
var KSP_PITCHBOOK_WORK_ID = '0006';
var KSP_PITCHBOOK_APP_VERSION = '0.3.0';
var KSP_PITCHBOOK_DRAFT_TTL_MS = 24 * 60 * 60 * 1000;
var KSP_PITCHBOOK_FUND_STRATEGY_MAX_LENGTH = 500;

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
// ===== END src/60_PitchbookConstants.gs =====

// ===== BEGIN src/61_PitchbookValidation.gs =====
function kspNormalizePitchbookBatchInput_(input) {
  var source = input && typeof input === 'object' ? input : {};
  return {
    requestId: kspTrimPitchbookField_(source.requestId),
    parentMeetingId: kspTrimPitchbookField_(source.parentMeetingId),
    expectedParentVersion: Number(source.expectedParentVersion),
    date: kspTrimPitchbookField_(source.date),
    counterpartyId: kspTrimPitchbookField_(source.counterpartyId),
    gpId: kspTrimPitchbookField_(source.gpId),
    assetClassId: kspTrimPitchbookField_(source.assetClassId),
    capitalTypeId: kspTrimPitchbookField_(source.capitalTypeId),
    fundStrategy: kspTrimPitchbookField_(source.fundStrategy),
    files: Array.isArray(source.files) ? source.files.map(kspNormalizePitchbookFileDescriptor_) : []
  };
}

function kspNormalizePitchbookFileDescriptor_(file, index) {
  var source = file && typeof file === 'object' ? file : {};
  return {
    ordinal: index + 1,
    originalFilename: kspTrimPitchbookField_(source.originalFilename),
    sizeBytes: Number(source.sizeBytes),
    mimeType: kspTrimPitchbookField_(source.mimeType) || 'application/octet-stream'
  };
}

function kspNormalizePitchbookUploadInput_(input) {
  var source = input && typeof input === 'object' ? input : {};
  return {
    parentMeetingId: kspTrimPitchbookField_(source.parentMeetingId),
    expectedParentVersion: Number(source.expectedParentVersion),
    batchId: kspTrimPitchbookField_(source.batchId),
    documentId: kspTrimPitchbookField_(source.documentId),
    slotFingerprint: kspTrimPitchbookField_(source.slotFingerprint),
    originalFilename: kspTrimPitchbookField_(source.originalFilename),
    sizeBytes: Number(source.sizeBytes),
    mimeType: kspTrimPitchbookField_(source.mimeType) || 'application/octet-stream',
    base64Data: kspNormalizeBase64Payload_(source.base64Data)
  };
}

function kspTrimPitchbookField_(value) {
  return value === null || value === undefined ? '' : String(value).trim();
}

function kspNormalizeBase64Payload_(value) {
  var text = value === null || value === undefined ? '' : String(value).trim();
  var marker = text.indexOf('base64,');
  return marker === -1 ? text : text.slice(marker + 7);
}

function kspBuildPitchbookCatalog_(gpRows, optionRows) {
  return kspBuildMeetingCatalog_(gpRows, optionRows);
}

function kspValidatePitchbookBatchInput_(input, catalog) {
  var safeCatalog = catalog || { counterparties: [], assetClasses: [], capitalTypes: [] };
  kspAssert_(input.date, 'PITCHBOOK_DATE_REQUIRED', '日付は必須です。');
  kspAssert_(input.counterpartyId, 'PITCHBOOK_COUNTERPARTY_REQUIRED', '面談先は必須です。');
  kspAssert_(input.assetClassId, 'PITCHBOOK_ASSET_CLASS_REQUIRED', 'アセットクラスは必須です。');
  kspAssert_(kspIsValidDateKey_(input.date), 'PITCHBOOK_DATE_INVALID', '日付はYYYY-MM-DD形式で入力してください。');
  kspAssert_(String(input.fundStrategy || '').length <= KSP_PITCHBOOK_FUND_STRATEGY_MAX_LENGTH,
    'PITCHBOOK_FUND_STRATEGY_TOO_LONG', 'Fund / Strategyは500文字以内で入力してください。');
  kspAssert_(input.files.length >= 1, 'PITCHBOOK_FILE_REQUIRED', 'ファイルを1つ以上選択してください。');
  kspAssert_(input.files.length <= KSP_PITCHBOOK_LIMITS.FILE_COUNT, 'PITCHBOOK_FILE_COUNT_EXCEEDED',
    '1回に選択できるファイルは10件までです。');

  var totalBytes = 0;
  input.files.forEach(function (file) {
    kspValidatePitchbookFileDescriptor_(file);
    totalBytes += file.sizeBytes;
  });
  kspAssert_(totalBytes <= KSP_PITCHBOOK_LIMITS.TOTAL_BYTES, 'PITCHBOOK_TOTAL_SIZE_EXCEEDED',
    '1回の合計ファイルサイズは100MBまでです。');

  var selected = {
    gp: null,
    counterpartyEntity: kspRequirePitchbookCounterparty_(input, safeCatalog),
    assetClass: kspRequireCatalogItem_(
      safeCatalog.assetClasses,
      input.assetClassId,
      'PITCHBOOK_ASSET_CLASS_UNAVAILABLE',
      '選択されたアセットクラスは利用できません。'
    ),
    capitalType: null
  };
  if (input.capitalTypeId) {
    selected.capitalType = kspRequireCatalogItem_(
      safeCatalog.capitalTypes,
      input.capitalTypeId,
      'PITCHBOOK_CAPITAL_TYPE_UNAVAILABLE',
      '選択されたEquity / Debtは利用できません。'
    );
  }
  return { selected: selected, totalBytes: totalBytes };
}

function kspValidatePitchbookFileDescriptor_(file) {
  kspAssert_(file.originalFilename, 'PITCHBOOK_FILENAME_REQUIRED', '元ファイル名がありません。');
  kspAssert_(file.originalFilename.length <= 255, 'PITCHBOOK_FILENAME_TOO_LONG', 'ファイル名は255文字以内にしてください。');
  kspAssert_(!/[\\/\u0000-\u001f\u007f]/.test(file.originalFilename), 'PITCHBOOK_FILENAME_UNSAFE',
    'ファイル名に使用できない文字が含まれています。');
  kspAssert_(Number.isFinite(file.sizeBytes) && file.sizeBytes > 0 && Math.floor(file.sizeBytes) === file.sizeBytes,
    'PITCHBOOK_FILE_SIZE_INVALID', 'ファイルサイズが不正です。');
  kspAssert_(file.sizeBytes <= KSP_PITCHBOOK_LIMITS.FILE_BYTES, 'PITCHBOOK_FILE_SIZE_EXCEEDED',
    '1ファイルの上限は25MBです。');
  var extension = kspGetPitchbookExtension_(file.originalFilename);
  kspAssert_(KSP_PITCHBOOK_ALLOWED_EXTENSIONS.indexOf(extension.toLowerCase()) !== -1,
    'PITCHBOOK_EXTENSION_UNSUPPORTED', '対応していないファイル形式です: .' + extension);
  return extension;
}

function kspValidatePitchbookUploadInput_(input, row, reservation) {
  kspAssert_(input.batchId && /^BAT-\d{6}$/.test(input.batchId), 'PITCHBOOK_BATCH_ID_INVALID', 'Batch IDが不正です。');
  kspParseDocumentId_(input.documentId);
  kspAssert_(/^[0-9a-f]{8}$/.test(input.slotFingerprint), 'PITCHBOOK_SLOT_FINGERPRINT_INVALID',
    'Upload slot fingerprintが不正です。');
  kspAssert_(row, 'PITCHBOOK_SLOT_NOT_FOUND', 'Upload slotが見つかりません。');
  kspAssert_(reservation, 'PITCHBOOK_RESERVATION_NOT_FOUND', 'Batch reservationが見つかりません。');
  var reservedFile = kspFindPitchbookReservationFile_(reservation, input.documentId);
  kspAssert_(reservedFile, 'PITCHBOOK_RESERVATION_FILE_NOT_FOUND', 'Document reservationが見つかりません。');
  kspAssert_(String(row.Batch_ID) === input.batchId, 'PITCHBOOK_BATCH_CONFLICT', 'Batch IDが一致しません。');
  kspAssert_(String(row.Original_Filename) === input.originalFilename, 'PITCHBOOK_FILENAME_CONFLICT',
    '選択されたファイル名が予約済みslotと一致しません。');
  kspAssert_(String(row.Status) !== KSP_PITCHBOOK_STATUS.INACTIVE, 'PITCHBOOK_SLOT_INACTIVE',
    'Inactiveな資料へアップロードできません。');
  var currentFingerprint = kspBuildPitchbookSlotFingerprint_(row, reservedFile, reservation.totalBytes);
  var legacyFingerprint = !String(row.Fund_Strategy || '')
    ? kspBuildLegacyPitchbookSlotFingerprint_(row, reservedFile, reservation.totalBytes) : '';
  kspAssert_(currentFingerprint === input.slotFingerprint || legacyFingerprint === input.slotFingerprint, 'PITCHBOOK_SLOT_FINGERPRINT_CONFLICT',
    'Upload slotの内容が変更されています。');
  kspAssert_(Number(reservedFile.sizeBytes) === input.sizeBytes, 'PITCHBOOK_FILE_SIZE_MISMATCH',
    '選択されたファイルサイズが予約時と一致しません。');
  kspAssert_(String(reservedFile.mimeType || 'application/octet-stream') === input.mimeType, 'PITCHBOOK_MIME_TYPE_MISMATCH',
    '選択されたファイル形式が予約時と一致しません。');
  kspAssert_(Number(reservation.totalBytes) <= KSP_PITCHBOOK_LIMITS.TOTAL_BYTES, 'PITCHBOOK_TOTAL_SIZE_EXCEEDED',
    '1回の合計ファイルサイズは100MBまでです。');
  kspValidatePitchbookFileDescriptor_({
    originalFilename: input.originalFilename,
    sizeBytes: input.sizeBytes,
    mimeType: input.mimeType
  });
  kspAssert_(input.base64Data, 'PITCHBOOK_FILE_DATA_REQUIRED', 'ファイルデータがありません。');
}

function kspGetPitchbookExtension_(filename) {
  var match = /\.([^.]+)$/.exec(String(filename || ''));
  kspAssert_(match && match[1], 'PITCHBOOK_EXTENSION_REQUIRED', '拡張子のあるファイルを選択してください。');
  return match[1];
}
// ===== END src/61_PitchbookValidation.gs =====

// ===== BEGIN src/62_PitchbookIdentity.gs =====
function kspFormatBatchId_(sequenceNumber) {
  return 'BAT-' + kspFormatSixDigitSequence_(sequenceNumber, 'Batch');
}

function kspFormatDocumentId_(sequenceNumber) {
  return 'DOC-' + kspFormatSixDigitSequence_(sequenceNumber, 'Document');
}

function kspParseDocumentId_(documentId) {
  var match = /^DOC-(\d{6})$/.exec(String(documentId || ''));
  kspAssert_(match && Number(match[1]) > 0, 'PITCHBOOK_DOCUMENT_ID_INVALID', 'Document IDが不正です。');
  return Number(match[1]);
}

function kspFormatSixDigitSequence_(sequenceNumber, label) {
  var sequence = Number(sequenceNumber);
  kspAssert_(Number.isFinite(sequence) && sequence > 0 && Math.floor(sequence) === sequence,
    'PITCHBOOK_SEQUENCE_INVALID', (label || 'Sequence') + ' sequence must be a positive integer.');
  return String(sequence).padStart(6, '0');
}

function kspBuildPitchbookFilename_(input, selected, sequenceNo, extension) {
  var segments = [input.date, (selected.counterpartyEntity || selected.gp).name, selected.assetClass.name];
  if (selected.capitalType) segments.push(selected.capitalType.name);
  segments.push(String(Number(sequenceNo)).padStart(2, '0'));
  var normalized = segments.map(kspNormalizeGeneratedNameSegment_);
  kspAssert_(normalized.every(function (segment) { return segment !== ''; }), 'PITCHBOOK_FILENAME_INVALID',
    '保存ファイル名に空の必須要素があります。');
  return normalized.join('_') + '.' + String(extension);
}

function kspBuildPitchbookPendingRow_(params) {
  var options = params || {};
  return {
    Document_ID: options.documentId,
    Batch_ID: options.batchId,
    Parent_Meeting_ID: options.input.parentMeetingId || '',
    Counterparty_Type: options.selected && options.selected.counterpartyEntity
      ? options.selected.counterpartyEntity.type : '',
    Counterparty_ID: options.input.counterpartyId || '',
    Related_GP_IDs: '',
    Date: options.input.date,
    GP_ID: '',
    Asset_Class_ID: options.input.assetClassId,
    Capital_Type_ID: options.input.capitalTypeId,
    Fund_Strategy: options.input.fundStrategy,
    Sequence_No: options.sequenceNo,
    File_ID: '',
    File_URL: '',
    Original_Filename: options.file.originalFilename,
    Saved_Filename: options.savedFilename,
    Status: KSP_PITCHBOOK_STATUS.PENDING,
    Created_At: options.nowIso,
    Updated_At: options.nowIso,
    Created_By: options.actor,
    Updated_By: options.actor,
    AI_Document_Name: '',
    AI_Index_Status: KSP_AI_INDEX_STATUS.NOT_INDEXED,
    AI_Indexed_At: '',
    AI_Content_Hash: '',
    AI_Last_Error: ''
  };
}

function kspBuildPitchbookSlotFingerprint_(row, reservedFile, totalBytes) {
  var descriptor = reservedFile || {};
  var canonical = [
    row.Batch_ID, row.Document_ID, kspCanonicalBusinessDate_(row.Date), row.Counterparty_ID, row.Asset_Class_ID,
    row.Capital_Type_ID, row.Fund_Strategy, row.Sequence_No, row.Original_Filename, row.Saved_Filename,
    descriptor.sizeBytes, descriptor.mimeType, totalBytes
  ].concat(row.Parent_Meeting_ID ? [row.Parent_Meeting_ID] : [])
    .map(function (value) { return String(value || ''); }).join('\u001f');
  return kspFnv1aHex_(canonical);
}

function kspBuildLegacyPitchbookSlotFingerprint_(row, reservedFile, totalBytes) {
  var descriptor = reservedFile || {};
  var canonical = [
    row.Batch_ID, row.Document_ID, kspCanonicalBusinessDate_(row.Date), row.GP_ID, row.Asset_Class_ID,
    row.Capital_Type_ID, row.Sequence_No, row.Original_Filename, row.Saved_Filename,
    descriptor.sizeBytes, descriptor.mimeType, totalBytes
  ].map(function (value) { return String(value || ''); }).join('\u001f');
  return kspFnv1aHex_(canonical);
}

function kspCanonicalPitchbookDateKey_(value) {
  return kspCanonicalBusinessDate_(value);
}

function kspFnv1aHex_(text) {
  var hash = 2166136261;
  for (var index = 0; index < String(text).length; index += 1) {
    hash ^= String(text).charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return ('00000000' + (hash >>> 0).toString(16)).slice(-8);
}

function kspPitchbookSlotFromRow_(row, reservedFile, totalBytes) {
  var descriptor = reservedFile || {};
  var slot = {
    parentMeetingId: String(row.Parent_Meeting_ID || ''),
    batchId: String(row.Batch_ID || ''),
    documentId: String(row.Document_ID || ''),
    sequenceNo: Number(row.Sequence_No || 0),
    originalFilename: String(row.Original_Filename || ''),
    savedFilename: String(row.Saved_Filename || ''),
    status: String(row.Status || KSP_PITCHBOOK_STATUS.PENDING),
    fileId: String(row.File_ID || ''),
    fileUrl: String(row.File_URL || ''),
    sizeBytes: Number(descriptor.sizeBytes || 0),
    mimeType: String(descriptor.mimeType || ''),
    slotFingerprint: kspBuildPitchbookSlotFingerprint_(row, descriptor, totalBytes)
  };
  if (descriptor.ordinal) slot.ordinal = Number(descriptor.ordinal);
  return slot;
}

function kspBuildPitchbookReservation_(batchId, input, rows, totalBytes) {
  return {
    batchId: batchId,
    parentMeetingId: input.parentMeetingId || '',
    parentVersion: input.expectedParentVersion,
    totalBytes: Number(totalBytes || 0),
    createdAt: '',
    files: rows.map(function (row, index) {
      var descriptor = input.files[index];
      return {
        documentId: String(row.Document_ID),
        ordinal: Number(descriptor.ordinal || index + 1),
        sizeBytes: Number(descriptor.sizeBytes),
        mimeType: descriptor.mimeType || 'application/octet-stream',
        uploadState: 'READY',
        claimToken: '',
        claimedAt: '',
        fileId: '',
        fileUrl: ''
      };
    })
  };
}

function kspFindPitchbookReservationFile_(reservation, documentId) {
  return reservation && Array.isArray(reservation.files)
    ? reservation.files.filter(function (file) { return String(file.documentId) === String(documentId); })[0] || null
    : null;
}
// ===== END src/62_PitchbookIdentity.gs =====

// ===== BEGIN src/63_PitchbookAudit.gs =====
function kspBuildPitchbookAuditRow_(params) {
  var options = params || {};
  var row = options.row || {};
  var success = options.result === KSP_AUDIT_RESULTS.SUCCESS;
  var metadata = {
    Batch_ID: row.Batch_ID || '',
    Document_ID: row.Document_ID || '',
    Date: kspCanonicalBusinessDate_(row.Date),
    GP_ID: row.GP_ID || '',
    Asset_Class_ID: row.Asset_Class_ID || '',
    Capital_Type_ID: row.Capital_Type_ID || '',
    Fund_Strategy: row.Fund_Strategy || '',
    Sequence_No: row.Sequence_No || '',
    File_ID: row.File_ID || '',
    File_URL: row.File_URL || '',
    Original_Filename: row.Original_Filename || '',
    Saved_Filename: row.Saved_Filename || '',
    Status: row.Status || ''
  };
  return {
    Event_Timestamp: kspCanonicalInstantIso_(options.timestamp),
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
// ===== END src/63_PitchbookAudit.gs =====

// ===== BEGIN src/70_PitchbookPrepareService.gs =====
function kspGetPitchbookBootstrapData_(environment) {
  try {
    var context = kspLoadPitchbookRuntimeContext_(environment);
    var response = kspBuildPitchbookBootstrapResponse_(context.catalog);
    response.prepareRequestGeneration = kspPitchbookPrepareGeneration_(
      environment.getCounterValue(context.backendSpreadsheetId, 'NEXT_BATCH_ID'));
    return response;
  } catch (error) {
    return { ok: false, workId: KSP_PITCHBOOK_WORK_ID,
      error: { code: kspGetErrorCode_(error), message: kspSafePublicErrorMessage_(kspGetErrorCode_(error), 'PITCHBOOK') } };
  }
}

function kspPreparePitchbookBatch_(environment, rawInput) {
  var warnings = [];
  var actor = kspGetPitchbookActorSafely_(environment, warnings);
  try {
    var context = kspLoadPitchbookRuntimeContext_(environment);
    var input = kspNormalizePitchbookBatchInput_(rawInput);
    kspAssert_(input.requestId, 'PITCHBOOK_PREPARE_REQUEST_ID_REQUIRED', 'Prepare request IDが必要です。');
    if (input.requestId) {
      kspAssert_(/^[A-Za-z0-9_-]{8,128}$/.test(input.requestId), 'PITCHBOOK_PREPARE_REQUEST_ID_INVALID',
        'Prepare request IDが不正です。');
      // Capture the normalized caller payload before authoritative parent defaults.
      var semanticScope = kspNormalizePitchbookBatchInput_(input);
      delete semanticScope.expectedParentVersion; // CAS refresh is not a different allocation request.
      input.prepareRequestScope = JSON.stringify(semanticScope);
    }
    var parent = kspRequirePitchbookParent_(environment, context.backendSpreadsheetId,
      input.parentMeetingId, input.expectedParentVersion);
    var validation = { selected: null, totalBytes: 0 };
    var reserved = environment.reservePitchbookBatch(
      context.backendSpreadsheetId,
      input,
      validation.selected,
      validation.totalBytes,
      actor,
      environment.nowIso()
    );
    return {
      ok: true,
      workId: KSP_PITCHBOOK_WORK_ID,
      batchId: reserved.reservation.batchId,
      requestId: input.requestId || '',
      idempotentReplay: reserved.idempotentReplay === true,
      slots: reserved.rows.map(function (row) {
        var descriptor = kspFindPitchbookReservationFile_(reserved.reservation, row.Document_ID);
        var slot = kspPitchbookSlotFromRow_(row, descriptor, reserved.reservation.totalBytes);
        slot.parentVersion = Number(parent.Version);
        return slot;
      }),
      warnings: warnings
    };
  } catch (error) {
    return {
      ok: false,
      workId: KSP_PITCHBOOK_WORK_ID,
      error: { code: kspGetErrorCode_(error), message: kspSafePublicErrorMessage_(kspGetErrorCode_(error), 'PITCHBOOK') },
      warnings: warnings
    };
  }
}
// ===== END src/70_PitchbookPrepareService.gs =====

// ===== BEGIN src/71_PitchbookUploadService.gs =====
function kspUploadPitchbookFile_(environment, rawInput) {
  var warnings = [];
  var actor = kspGetPitchbookActorSafely_(environment, warnings);
  var context = null;
  var input = kspNormalizePitchbookUploadInput_(rawInput);
  var row = null;
  var reservation = null;
  var reservedFile = null;
  var fileInfo = null;
  var claim = null;
  var reservationValidated = false;
  var parentClaim = null;
  try {
    context = kspLoadPitchbookRuntimeContext_(environment);
    row = environment.findRowByKey(context.backendSpreadsheetId, KSP_SHEET_NAMES.PITCHBOOK_INDEX,
      'Document_ID', input.documentId);
    kspAssert_(row && row.Parent_Meeting_ID && String(row.Parent_Meeting_ID) === input.parentMeetingId,
      'PITCHBOOK_PARENT_CONFLICT', '資料の登録元記録が一致しません。');
    var parent = environment.findRowByKey(context.backendSpreadsheetId, KSP_SHEET_NAMES.MEETING_INDEX,
      'Meeting_ID', input.parentMeetingId);
    kspAssert_(parent && parent.Status === KSP_STATUS.ACTIVE, 'PITCHBOOK_PARENT_UNAVAILABLE', '親記録を利用できません。');
    if (row && String(row.Status) === KSP_PITCHBOOK_STATUS.ACTIVE && row.File_ID) {
      kspAssert_(String(row.Batch_ID) === input.batchId, 'PITCHBOOK_BATCH_CONFLICT', 'Batch IDが一致しません。');
      kspAssert_(String(row.Original_Filename) === input.originalFilename, 'PITCHBOOK_FILENAME_CONFLICT',
        '選択されたファイル名が登録済み資料と一致しません。');
      return kspFinishPitchbookLink_(environment, input, { ok: true, workId: KSP_PITCHBOOK_WORK_ID,
        slot: { batchId: String(row.Batch_ID), documentId: String(row.Document_ID),
          sequenceNo: Number(row.Sequence_No || 0), originalFilename: String(row.Original_Filename || ''),
          savedFilename: String(row.Saved_Filename || ''), status: String(row.Status),
          fileId: String(row.File_ID), fileUrl: String(row.File_URL || ''),
          sizeBytes: input.sizeBytes, mimeType: input.mimeType, slotFingerprint: input.slotFingerprint },
        idempotentReplay: true, warnings: warnings });
    }

    reservation = environment.getPitchbookReservation(input.batchId);
    reservedFile = kspFindPitchbookReservationFile_(reservation, input.documentId);
    kspValidatePitchbookUploadInput_(input, row, reservation);
    kspRequirePitchbookParent_(environment, context.backendSpreadsheetId, input.parentMeetingId, input.expectedParentVersion);
    parentClaim = environment.claimRecordEdit('Meeting', input.parentMeetingId, KSP_SHEET_NAMES.MEETING_INDEX,
      'Meeting_ID', 'Version', input.expectedParentVersion, environment.nowIso(), KSP_MAINTENANCE_LIMITS.EDIT_CLAIM_TTL_MS);
    kspAssert_(parentClaim.row.Status === KSP_STATUS.ACTIVE, 'PITCHBOOK_PARENT_UNAVAILABLE', '親記録を利用できません。');
    reservationValidated = true;

    var decoded = environment.decodeBase64(input.base64Data);
    kspAssert_(decoded && decoded.length === input.sizeBytes, 'PITCHBOOK_FILE_SIZE_MISMATCH',
      '送信されたファイルサイズが選択時のサイズと一致しません。');
    kspAssert_(decoded.length <= KSP_PITCHBOOK_LIMITS.FILE_BYTES, 'PITCHBOOK_FILE_SIZE_EXCEEDED',
      '1ファイルの上限は25MBです。');

    claim = environment.claimPitchbookUpload(input.batchId, input.documentId, environment.nowIso());
    if (claim.fileInfo) {
      fileInfo = claim.fileInfo;
    } else {
      try {
        fileInfo = environment.createOrReusePitchbookFile(
          context.pitchbooksFolderId,
          row,
          decoded,
          input.mimeType
        );
        environment.completePitchbookUploadClaim(
          input.batchId,
          input.documentId,
          claim.claimToken,
          fileInfo,
          environment.nowIso()
        );
      } catch (uploadError) {
        environment.releasePitchbookUploadClaim(
          input.batchId,
          input.documentId,
          claim.claimToken,
          uploadError.message || String(uploadError),
          environment.nowIso()
        );
        throw uploadError;
      }
    }

    row = environment.completePitchbookRow(
      context.backendSpreadsheetId,
      input.documentId,
      fileInfo,
      actor,
      environment.nowIso(),
      { parentMeetingId: input.parentMeetingId, expectedParentVersion: input.expectedParentVersion, parentClaim: parentClaim }
    );
    environment.clearPitchbookReservationIfComplete(
      context.backendSpreadsheetId,
      input.batchId
    );

    var auditWarning = kspTryAppendPitchbookAudit_(environment, context.auditSpreadsheetId, {
      timestamp: environment.nowIso(), actor: actor, result: KSP_AUDIT_RESULTS.SUCCESS,
      action: fileInfo.reused ? KSP_PITCHBOOK_ACTIONS.RETRY : KSP_PITCHBOOK_ACTIONS.REGISTER,
      row: row
    });
    if (auditWarning) warnings.push(auditWarning);

    environment.releaseRecordEditClaim(parentClaim);
    parentClaim = null;
    return kspFinishPitchbookLink_(environment, input, { ok: true, workId: KSP_PITCHBOOK_WORK_ID,
      slot: kspPitchbookSlotFromRow_(row, reservedFile, reservation.totalBytes),
      reusedFile: Boolean(fileInfo.reused), warnings: warnings });
  } catch (error) {
    // Saved file metadata remains in the reservation after a completion/CAS conflict.
    // Never downgrade newer state; retry must reuse the file and fresh parent state.
    if (context && row && reservationValidated && !fileInfo &&
        !/^(PITCHBOOK_COMPLETION_CONFLICT|PITCHBOOK_INDEX_LOCK_TIMEOUT|PITCHBOOK_UPLOAD_CLAIM_CONFLICT|RECORD_EDIT_CLAIM_LOST|STALE_RECORD_VERSION)$/.test(kspGetErrorCode_(error))) {
      try {
        row = environment.failPitchbookRow(
          context.backendSpreadsheetId,
          input.documentId,
          fileInfo,
          actor,
          environment.nowIso()
        );
      } catch (markError) {
        warnings.push({ code: 'PITCHBOOK_FAIL_STATUS_WRITE_FAILED', message: kspSafeOperationalWarning_('PITCHBOOK_FAIL_STATUS_WRITE_FAILED') });
      }
      var auditWarning = kspTryAppendPitchbookAudit_(environment, context.auditSpreadsheetId, {
        timestamp: environment.nowIso(), actor: actor, result: KSP_AUDIT_RESULTS.FAILURE,
        action: KSP_PITCHBOOK_ACTIONS.RETRY, row: row || {}, batchId: input.batchId,
        documentId: input.documentId, errorCode: kspGetErrorCode_(error), errorMessage: kspSafePublicErrorMessage_(kspGetErrorCode_(error), 'PITCHBOOK')
      });
      if (auditWarning) warnings.push(auditWarning);
    }
    return {
      ok: false,
      workId: KSP_PITCHBOOK_WORK_ID,
      error: { code: kspGetErrorCode_(error), message: kspSafePublicErrorMessage_(kspGetErrorCode_(error), 'PITCHBOOK') },
      retry: row ? kspPitchbookSlotFromRow_(row, reservedFile, reservation ? reservation.totalBytes : 0) : null,
      warnings: warnings
    };
  } finally {
    if (parentClaim) {
      try { environment.releaseRecordEditClaim(parentClaim); }
      catch (releaseError) { warnings.push({code:'PARENT_CLAIM_RELEASE_FAILED',message:'処理権の解除を確認できません。時間をおいて再確認してください。'}); }
    }
  }
}

function kspFinishPitchbookLink_(environment, input, response) {
  var linked = kspUpdateMeetingRelations_(environment, {meetingId:input.parentMeetingId,
    expectedVersion:input.expectedParentVersion,documentId:input.documentId,operation:'add'});
  response.fileSaved = true;
  response.linkConfirmed = linked.ok;
  response.slot.parentMeetingId = input.parentMeetingId;
  response.slot.parentVersion = linked.ok ? linked.version : input.expectedParentVersion;
  response.parentVersion = response.slot.parentVersion;
  if (!linked.ok) {
    response.ok = false;
    response.error = linked.error;
    response.retry = response.slot;
    response.retryStage = 'LINK_ONLY';
  }
  return response;
}
// ===== END src/71_PitchbookUploadService.gs =====

// ===== BEGIN src/72_PitchbookContext.gs =====
function kspLoadPitchbookRuntimeContext_(environment) {
  var state = environment.getInstallationState();
  kspAssert_(state && state.config && state.resources, 'INSTALLATION_STATE_MISSING',
    'Installation state is missing. Run setupKnowledgePlatform_() first.');
  var backendSpreadsheetId = state.resources[KSP_RESOURCE_KEYS.BACKEND_SPREADSHEET];
  var auditSpreadsheetId = state.resources[KSP_RESOURCE_KEYS.AUDIT_SPREADSHEET];
  var pitchbooksFolderId = state.resources[KSP_RESOURCE_KEYS.PITCHBOOKS];
  kspAssert_(backendSpreadsheetId, 'BACKEND_SPREADSHEET_MISSING', 'Backend Spreadsheet is not configured.');
  kspAssert_(auditSpreadsheetId, 'AUDIT_SPREADSHEET_MISSING', 'Audit Spreadsheet is not configured.');
  kspAssert_(pitchbooksFolderId, 'PITCHBOOK_FOLDER_MISSING', 'Pitchbooks folder is not configured.');
  var counterpartyRows = environment.readRows(backendSpreadsheetId, KSP_SHEET_NAMES.COUNTERPARTY_MASTER);
  var optionRows = environment.readRows(backendSpreadsheetId, KSP_SHEET_NAMES.OPTION_MASTER);
  return {
    state: state,
    backendSpreadsheetId: backendSpreadsheetId,
    auditSpreadsheetId: auditSpreadsheetId,
    pitchbooksFolderId: pitchbooksFolderId,
    catalog: kspBuildPitchbookCatalog_(counterpartyRows, optionRows)
  };
}

function kspGetPitchbookActorSafely_(environment, warnings) {
  try {
    return environment.getActor() || 'UNIDENTIFIED';
  } catch (error) {
    warnings.push({ code: 'ACTOR_RESOLUTION_FAILED', message: kspSafeOperationalWarning_('ACTOR_RESOLUTION_FAILED') });
    return 'UNIDENTIFIED';
  }
}

function kspTryAppendPitchbookAudit_(environment, auditSpreadsheetId, params) {
  try {
    environment.appendRow(auditSpreadsheetId, KSP_SHEET_NAMES.AUDIT_LOG, kspBuildPitchbookAuditRow_(params));
    return null;
  } catch (error) {
    return { code: 'AUDIT_WRITE_FAILED', message: kspSafeOperationalWarning_('AUDIT_WRITE_FAILED') };
  }
}
// ===== END src/72_PitchbookContext.gs =====

// ===== BEGIN src/73_ParentRelations.gs =====
// Parent binding and relation-only updates. No Docs/Drive content mutation here.
function kspRequirePitchbookParent_(environment, backendId, meetingId, expectedVersion) {
  kspAssert_(/^MTG-\d{6}$/.test(String(meetingId || '')), 'PITCHBOOK_PARENT_REQUIRED', '保存済みの記録を選択してください。');
  var parent = environment.findRowByKey(backendId, KSP_SHEET_NAMES.MEETING_INDEX, 'Meeting_ID', meetingId);
  kspAssert_(parent && String(parent.Status) === KSP_STATUS.ACTIVE && parent.Doc_File_ID,
    'PITCHBOOK_PARENT_UNAVAILABLE', '親記録が存在しないか利用できません。');
  kspAssert_(Number.isInteger(Number(expectedVersion)) && Number(expectedVersion) > 0 &&
    Number(parent.Version) === Number(expectedVersion), 'STALE_RECORD_VERSION', '親記録の最新情報を読み直してください。');
  return parent;
}

function kspApplyPitchbookParentContext_(input, parent) {
  input.counterpartyId = kspMeetingCounterpartyId_(parent);
  kspAssert_(input.counterpartyId, 'PITCHBOOK_COUNTERPARTY_UNAVAILABLE', '親記録の面談先を確認してください。');
  input.date = input.date || kspCanonicalBusinessDate_(parent.Date);
  input.assetClassId = input.assetClassId || String(parent.Asset_Class_ID || '');
  input.capitalTypeId = input.capitalTypeId || String(parent.Capital_Type_ID || '');
  input.fundStrategy = input.fundStrategy || String(parent.Fund_Strategy || '');
}

function kspRequirePitchbookCounterparty_(input, catalog) {
  var entity = (catalog.counterpartyEntities || []).filter(function (item) {
    return item.id === input.counterpartyId;
  })[0];
  kspAssert_(entity, 'PITCHBOOK_COUNTERPARTY_UNAVAILABLE', '親記録の面談先を確認してください。');
  return entity;
}

function kspRelationIds_(row) {
  return String(row.Related_Pitchbook_IDs || '').split(',').map(function (id) { return id.trim(); }).filter(Boolean);
}

function kspBuildMeetingRelationPatch_(parent, document, input, actor, nowIso) {
  kspAssert_(parent && parent.Status === KSP_STATUS.ACTIVE, 'PITCHBOOK_PARENT_UNAVAILABLE', '有効な記録を選択してください。');
  kspAssert_(document && document.Document_ID === input.documentId && document.File_ID &&
    (document.Status === KSP_STATUS.ACTIVE || document.Status === KSP_STATUS.INACTIVE),
    'PITCHBOOK_AUTHORITATIVE_FILE_MISSING', '資料の原本を確認できません。');
  kspAssert_(input.operation === 'add' || input.operation === 'remove', 'RELATION_OPERATION_INVALID', '関連操作が不正です。');
  var ids = kspRelationIds_(parent), present = ids.indexOf(input.documentId) !== -1;
  // Readback replay is safe even if the successful earlier response was lost.
  if ((input.operation === 'add') === present) return {};
  kspAssert_(Number.isInteger(Number(input.expectedVersion)) && Number(input.expectedVersion) > 0 &&
    Number(parent.Version) === Number(input.expectedVersion), 'STALE_RECORD_VERSION', '最新の記録を読み直してください。');
  if (input.operation === 'add') ids.push(input.documentId);
  else ids = ids.filter(function (id) { return id !== input.documentId; });
  return { Related_Pitchbook_IDs: ids.join(','), Version: Number(parent.Version) + 1,
    Updated_At: nowIso, Updated_By: actor, AI_Index_Status: KSP_AI_INDEX_STATUS.PENDING, AI_Last_Error: '' };
}

function kspUpdateMeetingRelations_(environment, rawInput) {
  var input = rawInput || {}, warnings = [];
  try {
    kspAssert_(/^MTG-\d{6}$/.test(String(input.meetingId || '')) && /^DOC-\d{6}$/.test(String(input.documentId || '')),
      'RELATION_ID_INVALID', '記録または資料のIDが不正です。');
    var actor = kspGetMaintenanceActorSafely_(environment, warnings);
    var result = environment.updateMeetingRelationsAtomic({meetingId:String(input.meetingId),
      documentId:String(input.documentId),expectedVersion:Number(input.expectedVersion),operation:String(input.operation)}, actor, environment.nowIso());
    var state = environment.getInstallationState();
    kspTryMaintenanceAudit_(environment, state.resources[KSP_RESOURCE_KEYS.AUDIT_SPREADSHEET], {
      timestamp:environment.nowIso(),actor:actor,action:'MEETING_RELATION_' + String(input.operation).toUpperCase(),
      targetType:'Meeting',targetId:String(input.meetingId),result:KSP_AUDIT_RESULTS.SUCCESS,
      changedFields:['Related_Pitchbook_IDs'],after:{Document_ID:String(input.documentId),Version:Number(result.Version)}
    }, warnings);
    return {ok:true, meetingId:String(result.Meeting_ID), version:Number(result.Version),
      relatedPitchbookIds:kspRelationIds_(result), warnings:warnings};
  } catch (error) { return kspMaintenanceFailure_(error, warnings); }
}

function kspAssertNoParentEditClaim_(properties, meetingId, nowIso) {
  var key = kspMaintenanceClaimKey_('Meeting', meetingId);
  var claim = kspSafeParseJson_(properties.getProperty(key), key);
  kspAssert_(!claim || Number(claim.expiresAtMs || 0) <= new Date(kspCanonicalInstantIso_(nowIso)).getTime(),
    'RECORD_EDIT_IN_PROGRESS', '記録の処理中です。完了後に再試行してください。');
}

function kspAttachParentRelationAdapters_(environment, properties) {
  environment.updateMeetingRelationsAtomic = function (input, actor, nowIso) {
    var lock = kspMaintenanceAcquireLock_('relation-only update');
    try {
      var state = environment.getInstallationState();
      var backendId = state.resources[KSP_RESOURCE_KEYS.BACKEND_SPREADSHEET];
      var parent = kspMaintenanceFindSheetRow_(backendId, KSP_SHEET_NAMES.MEETING_INDEX, 'Meeting_ID', input.meetingId);
      var document = kspMaintenanceFindSheetRow_(backendId, KSP_SHEET_NAMES.PITCHBOOK_INDEX, 'Document_ID', input.documentId);
      kspAssertNoParentEditClaim_(properties, input.meetingId, nowIso);
      var fields = kspBuildMeetingRelationPatch_(parent && parent.row, document && document.row, input, actor, nowIso);
      if (!Object.keys(fields).length) return parent.row;
      // Dirty the derived source first. An interruption leaves conservative re-sync,
      // never a fabricated relation; authoritative retrieval always rechecks links.
      kspMaintenanceWriteSheetFieldsWithRollback_(document.sheet, document.headers, document.rowNumber,
        { AI_Index_Status:KSP_AI_INDEX_STATUS.PENDING, AI_Last_Error:'' }, document.row);
      kspMaintenanceWriteSheetFieldsWithRollback_(parent.sheet, parent.headers, parent.rowNumber, fields, parent.row);
      return Object.assign({}, parent.row, fields);
    } finally { lock.releaseLock(); }
  };
}
// ===== END src/73_ParentRelations.gs =====

// ===== BEGIN src/80_PitchbookLiveEnvironment.gs =====
var KSP_PITCHBOOK_RESERVATION_PREFIX = 'KSP_PITCHBOOK_BATCH_';
var KSP_PITCHBOOK_UPLOAD_CLAIM_TTL_MS = 10 * 60 * 1000;

function kspCreatePitchbookEnvironment_() {
  var environment = kspCreateMaintenanceEnvironment_();
  var scriptProperties = PropertiesService.getScriptProperties();
  kspAttachPitchbookReservationAdapters_(environment, scriptProperties);
  kspAttachPitchbookClaimAdapters_(environment, scriptProperties);
  kspAttachPitchbookDriveAdapters_(environment);
  kspAttachPitchbookIndexAdapters_(environment, scriptProperties);
  return environment;
}
// ===== END src/80_PitchbookLiveEnvironment.gs =====

// ===== BEGIN src/81_PitchbookReservationAdapters.gs =====
function kspAttachPitchbookReservationAdapters_(meetingEnvironment, scriptProperties) {
  meetingEnvironment.reservePitchbookBatch = function (spreadsheetId, input, selected, totalBytes, actor, nowIso) {
    kspAssert_(input.requestId, 'PITCHBOOK_PREPARE_REQUEST_ID_REQUIRED', 'Prepare request IDが必要です。');
    var lock = LockService.getScriptLock();
    if (!lock.tryLock(KSP_DEFAULTS.LOCK_TIMEOUT_MS)) {
      var lockError = new Error('Could not acquire the Pitchbook reservation lock.');
      lockError.code = 'PITCHBOOK_RESERVATION_LOCK_TIMEOUT';
      throw lockError;
    }
    try {
      var requestKey = input.requestId ? kspPitchbookPrepareRequestKey_(input.requestId) : '';
      var semanticScope = kspNormalizePitchbookBatchInput_(input);
      delete semanticScope.expectedParentVersion;
      var scope = requestKey ? JSON.stringify([String(spreadsheetId), String(actor),
        input.prepareRequestScope || JSON.stringify(semanticScope)]) : '';
      var parent = kspRequirePitchbookParent_(meetingEnvironment, spreadsheetId,
        input.parentMeetingId, input.expectedParentVersion);
      kspAssertNoParentEditClaim_(scriptProperties, input.parentMeetingId, nowIso);
      var spreadsheet = SpreadsheetApp.openById(spreadsheetId);
      var indexSheet = spreadsheet.getSheetByName(KSP_SHEET_NAMES.PITCHBOOK_INDEX);
      kspAssert_(indexSheet, 'SHEET_NOT_FOUND', 'Sheet not found: ' + KSP_SHEET_NAMES.PITCHBOOK_INDEX);
      var headers = kspReadHeadersFromSheet_(indexSheet);
      var existingRows = kspReadObjectsFromSheet_(indexSheet, headers);
      var batchSetting = kspFindSettingRow_(spreadsheetId, 'NEXT_BATCH_ID');
      var documentSetting = kspFindSettingRow_(spreadsheetId, 'NEXT_DOCUMENT_ID');
      var batchSequence = kspReadPositiveSettingValue_(batchSetting, 'NEXT_BATCH_ID');
      var documentSequence = kspReadPositiveSettingValue_(documentSetting, 'NEXT_DOCUMENT_ID');
      var prior = requestKey ? kspSafeParseJson_(scriptProperties.getProperty(requestKey), requestKey) : null;
      if (prior) {
        kspAssert_(prior.scope === scope, 'PITCHBOOK_PREPARE_REQUEST_CONFLICT',
          'Prepare request IDの利用者・内容・親記録が一致しません。');
        return kspReadbackPitchbookPrepare_(prior, existingRows, scriptProperties, batchSequence, documentSequence);
      }
      var generation = kspPitchbookPrepareGeneration_(batchSequence);
      if (requestKey) kspAssert_(kspPitchbookRequestGeneration_(input.requestId) === generation,
        'PITCHBOOK_PREPARE_REQUEST_RETIRED', '古い予約tokenは再採番できません。保存結果を確認してください。');
      // Only a new allocation derives defaults from the current parent. Replay keeps
      // its original immutable row context, even after unrelated parent links advance CAS.
      kspApplyPitchbookParentContext_(input, parent);
      if (requestKey) {
        var catalog = kspBuildPitchbookCatalog_(
          meetingEnvironment.readRows(spreadsheetId, KSP_SHEET_NAMES.COUNTERPARTY_MASTER),
          meetingEnvironment.readRows(spreadsheetId, KSP_SHEET_NAMES.OPTION_MASTER));
        var validation = kspValidatePitchbookBatchInput_(input, catalog);
        selected = validation.selected;
        totalBytes = validation.totalBytes;
      }
      // A crashed allocation must not let a different request reuse its counters.
      var properties = scriptProperties.getProperties();
      var pendingKeys = Object.keys(properties).filter(function (key) {
        return key.indexOf(KSP_PITCHBOOK_RESERVATION_PREFIX + 'REQUEST_') === 0;
      });
      var unresolved = 0;
      pendingKeys.forEach(function (key) {
        var intent = kspSafeParseJson_(properties[key], key);
        if (intent && intent.state !== 'COMPLETE') {
          unresolved += 1;
          kspAssert_(unresolved <= 32, 'PITCHBOOK_PREPARE_UNCERTAIN', '未確定の予約を確認してください。');
          kspAssert_(intent.spreadsheetId === String(spreadsheetId), 'PITCHBOOK_PREPARE_UNCERTAIN',
            '未確定の予約先を確認してください。');
          kspReadbackPitchbookPrepare_(intent, existingRows, scriptProperties, batchSequence, documentSequence);
        }
      });
      var retireKeys = kspPitchbookPrepareRetirementKeys_(properties, pendingKeys, generation);
      if (requestKey) kspAssert_(pendingKeys.length - retireKeys.length < 32,
        'PITCHBOOK_PREPARE_UNCERTAIN', '未確定の予約履歴を確認してください。');
      var batchKeys = Object.keys(properties).filter(function (key) {
        return /^BAT-\d{6}$/.test(key.slice(KSP_PITCHBOOK_RESERVATION_PREFIX.length)) &&
          key.indexOf(KSP_PITCHBOOK_RESERVATION_PREFIX) === 0;
      });
      var completedBatchKeys = batchKeys.filter(function (key) {
        var batchId = key.slice(KSP_PITCHBOOK_RESERVATION_PREFIX.length);
        var rows = existingRows.filter(function (row) { return String(row.Batch_ID) === batchId; });
        return rows.length > 0 && rows.every(function (row) {
          return row.Status === KSP_PITCHBOOK_STATUS.ACTIVE && row.File_ID && row.File_URL;
        });
      });
      kspAssert_(batchKeys.length - completedBatchKeys.length < 32,
        'PITCHBOOK_PREPARE_UPLOAD_BACKLOG', '未完了の資料登録を完了してから追加してください。');
      var maxSequence = existingRows.reduce(function (maximum, row) {
        var sameContext = kspCanonicalBusinessDate_(row.Date) === kspCanonicalBusinessDate_(input.date) &&
          kspMeetingCounterpartyId_(row) === input.counterpartyId &&
          String(row.Asset_Class_ID || '') === input.assetClassId &&
          String(row.Capital_Type_ID || '') === input.capitalTypeId;
        return sameContext ? Math.max(maximum, Number(row.Sequence_No) || 0) : maximum;
      }, 0);
      var batchId = kspFormatBatchId_(batchSequence);
      var rows = input.files.map(function (file, index) {
        var sequenceNo = maxSequence + index + 1;
        var documentId = kspFormatDocumentId_(documentSequence + index);
        var savedFilename = kspBuildPitchbookFilename_(
          input,
          selected,
          sequenceNo,
          kspGetPitchbookExtension_(file.originalFilename)
        );
        return kspBuildPitchbookPendingRow_({
          batchId: batchId,
          documentId: documentId,
          sequenceNo: sequenceNo,
          input: input,
          selected: selected,
          file: file,
          savedFilename: savedFilename,
          actor: actor,
          nowIso: nowIso
        });
      });
      var existingDocumentIds = {};
      existingRows.forEach(function (row) { existingDocumentIds[String(row.Document_ID)] = true; });
      rows.forEach(function (row) {
        kspAssert_(!existingDocumentIds[String(row.Document_ID)], 'PITCHBOOK_DOCUMENT_ID_COLLISION',
          'Document ID already exists: ' + row.Document_ID);
      });
      kspAssert_(!existingRows.some(function (row) { return String(row.Batch_ID) === batchId; }),
        'PITCHBOOK_BATCH_ID_COLLISION', 'Batch IDが既に存在します。');
      var values = rows.map(function (row) {
        return headers.map(function (header) {
          var value = row[header];
          return value === undefined || value === null ? '' : value;
        });
      });
      var reservation = kspBuildPitchbookReservation_(batchId, input, rows, totalBytes);
      reservation.createdAt = nowIso;
      var intent = requestKey ? {
        state: 'INTENT', scope: scope, spreadsheetId: String(spreadsheetId),
        nextBatch: batchSequence + 1, nextDocument: documentSequence + rows.length,
        reservation: reservation, manifests: rows.map(kspPitchbookPrepareRowManifest_)
      } : null;
      if (!intent) retireKeys.concat(completedBatchKeys).forEach(function (key) { scriptProperties.deleteProperty(key); });
      if (intent) {
        var intentText = JSON.stringify(intent);
        kspAssert_(encodeURIComponent(intentText).replace(/%[0-9A-F]{2}/g, 'x').length <= 8000,
          'PITCHBOOK_PREPARE_INTENT_TOO_LARGE', '予約情報が大きすぎます。ファイル数を減らしてください。');
        // NEXT_BATCH_ID is the existing monotonic retired-token guard. No clock,
        // per-token tombstones, new sheet or unbounded historical properties.
        retireKeys.concat(completedBatchKeys).forEach(function (key) { scriptProperties.deleteProperty(key); });
        scriptProperties.setProperty(requestKey, intentText);
        kspAssert_(scriptProperties.getProperty(requestKey) === intentText,
          'PITCHBOOK_PREPARE_UNCERTAIN', '予約intentを確認できません。');
      }
      // Durable reservation precedes counter/row mutation; never retry a partial write blindly.
      scriptProperties.setProperty(kspPitchbookReservationKey_(batchId), JSON.stringify(reservation));
      batchSetting.sheet.getRange(batchSetting.rowIndex, batchSetting.valueIndex + 1).setValue(String(batchSequence + 1));
      documentSetting.sheet.getRange(documentSetting.rowIndex, documentSetting.valueIndex + 1)
        .setValue(String(documentSequence + rows.length));
      if (batchSetting.updatedAtIndex !== -1) batchSetting.sheet.getRange(batchSetting.rowIndex, batchSetting.updatedAtIndex + 1).setValue(nowIso);
      if (documentSetting.updatedAtIndex !== -1) documentSetting.sheet.getRange(documentSetting.rowIndex, documentSetting.updatedAtIndex + 1).setValue(nowIso);
      indexSheet.getRange(indexSheet.getLastRow() + 1, 1, values.length, headers.length).setValues(values);
      if (intent) {
        SpreadsheetApp.flush();
        kspReadbackPitchbookPrepare_(intent, kspReadObjectsFromSheet_(indexSheet, headers), scriptProperties,
          kspReadPositiveSettingValue_(batchSetting, 'NEXT_BATCH_ID'),
          kspReadPositiveSettingValue_(documentSetting, 'NEXT_DOCUMENT_ID'));
        intent.state = 'COMPLETE';
        scriptProperties.setProperty(requestKey, JSON.stringify(intent));
      }
      return { rows: rows, reservation: reservation };
    } finally {
      lock.releaseLock();
    }
  };

  meetingEnvironment.getPitchbookReservation = function (batchId) {
    return kspSafeParseJson_(
      scriptProperties.getProperty(kspPitchbookReservationKey_(batchId)),
      kspPitchbookReservationKey_(batchId)
    );
  };

}

function kspPitchbookPrepareGeneration_(nextBatch) {
  kspAssert_(Number.isSafeInteger(Number(nextBatch)) && Number(nextBatch) > 0,
    'COUNTER_VALUE_INVALID', 'Batch counterを確認してください。');
  return Math.floor((Number(nextBatch) - 1) / 16) + 1;
}

function kspPitchbookRequestGeneration_(requestId) {
  var match = /^g([1-9]\d*)_[A-Za-z0-9_-]{8,96}$/.exec(String(requestId || ''));
  return match && Number.isSafeInteger(Number(match[1])) ? Number(match[1]) : 0;
}

function kspPitchbookPrepareRetirementKeys_(properties, keys, generation) {
  var prefix = KSP_PITCHBOOK_RESERVATION_PREFIX + 'REQUEST_';
  var eligible = keys.filter(function (key) {
    var intent = kspSafeParseJson_(properties[key], key);
    return intent && intent.state === 'COMPLETE' &&
      kspPitchbookRequestGeneration_(key.slice(prefix.length)) < generation;
  }).sort(function (left, right) {
    var a = kspSafeParseJson_(properties[left], left), b = kspSafeParseJson_(properties[right], right);
    return Number(a.nextBatch) - Number(b.nextBatch) || left.localeCompare(right);
  });
  // Retain the latest 32 requests (at least the current 16-admission generation).
  return eligible.slice(0, Math.max(0, keys.length - 31));
}

function kspPitchbookPrepareRequestKey_(requestId) {
  kspAssert_(/^[A-Za-z0-9_-]{8,128}$/.test(String(requestId || '')),
    'PITCHBOOK_PREPARE_REQUEST_ID_INVALID', 'Prepare request IDが不正です。');
  return KSP_PITCHBOOK_RESERVATION_PREFIX + 'REQUEST_' + requestId;
}

function kspPitchbookPrepareRowManifest_(row) {
  return JSON.stringify(['Document_ID', 'Batch_ID', 'Parent_Meeting_ID', 'Counterparty_Type', 'Counterparty_ID',
    'Related_GP_IDs', 'GP_ID', 'Asset_Class_ID', 'Capital_Type_ID', 'Fund_Strategy', 'Sequence_No',
    'Original_Filename', 'Saved_Filename', 'Created_By'].map(function (field) {
      return String(row[field] === undefined || row[field] === null ? '' : row[field]);
    }).concat([kspCanonicalBusinessDate_(row.Date), kspCanonicalInstantIso_(row.Created_At)]));
}

function kspReadbackPitchbookPrepare_(intent, existingRows, properties, nextBatch, nextDocument) {
  var expected = intent && intent.reservation;
  var uncertain = 'PITCHBOOK_PREPARE_UNCERTAIN';
  kspAssert_(expected && expected.files && expected.files.length >= 1 && expected.files.length <= KSP_PITCHBOOK_LIMITS.FILE_COUNT &&
    intent.manifests && intent.manifests.length === expected.files.length &&
    nextBatch >= intent.nextBatch && nextDocument >= intent.nextDocument, uncertain, '予約の確定状態を確認できません。');
  var rows = existingRows.filter(function (row) { return String(row.Batch_ID) === expected.batchId; });
  kspAssert_(rows.length === expected.files.length, uncertain, '予約row集合が一致しません。');
  var ordered = expected.files.map(function (descriptor, index) {
    var matches = existingRows.filter(function (row) { return String(row.Document_ID) === descriptor.documentId; });
    kspAssert_(matches.length === 1 && kspPitchbookPrepareRowManifest_(matches[0]) === intent.manifests[index],
      uncertain, '予約rowの内容が一致しません。');
    var row = matches[0];
    kspAssert_([KSP_PITCHBOOK_STATUS.PENDING, KSP_PITCHBOOK_STATUS.FAILED, KSP_PITCHBOOK_STATUS.ACTIVE].indexOf(String(row.Status)) !== -1 &&
      (String(row.Status) !== KSP_PITCHBOOK_STATUS.ACTIVE || (row.File_ID && row.File_URL)),
      uncertain, '予約rowの状態が不正です。');
    return row;
  });
  var key = kspPitchbookReservationKey_(expected.batchId);
  var current = kspSafeParseJson_(properties.getProperty(key), key);
  if (!current) {
    kspAssert_(ordered.every(function (row) { return row.Status === KSP_PITCHBOOK_STATUS.ACTIVE && row.File_ID && row.File_URL; }),
      uncertain, '未完了のreservationがありません。');
    current = expected; // Completed-upload cleanup is read-only; do not recreate the property.
  }
  var identity = function (reservation) {
    return JSON.stringify([reservation.batchId, reservation.parentMeetingId, Number(reservation.parentVersion),
      Number(reservation.totalBytes), (reservation.files || []).map(function (file) {
        return [file.documentId, Number(file.ordinal), Number(file.sizeBytes), file.mimeType];
      })]);
  };
  kspAssert_(identity(current) === identity(expected), uncertain, 'Reservationの内容が一致しません。');
  return { rows: ordered, reservation: current, idempotentReplay: true };
}

function kspPitchbookReservationKey_(batchId) {
  return KSP_PITCHBOOK_RESERVATION_PREFIX + String(batchId || '');
}

function kspReadPositiveSettingValue_(setting, key) {
  var value = Number(setting.sheet.getRange(setting.rowIndex, setting.valueIndex + 1).getValue());
  kspAssert_(Number.isFinite(value) && value > 0 && Math.floor(value) === value,
    'COUNTER_VALUE_INVALID', 'Counter must be a positive integer: ' + key);
  return value;
}

// ===== END src/81_PitchbookReservationAdapters.gs =====

// ===== BEGIN src/82_PitchbookClaimAdapters.gs =====
function kspAttachPitchbookClaimAdapters_(meetingEnvironment, scriptProperties) {
  meetingEnvironment.claimPitchbookUpload = function (batchId, documentId, nowIso) {
    var lock = LockService.getScriptLock();
    if (!lock.tryLock(KSP_DEFAULTS.LOCK_TIMEOUT_MS)) {
      var lockError = new Error('Could not acquire the Pitchbook upload claim lock.');
      lockError.code = 'PITCHBOOK_UPLOAD_CLAIM_LOCK_TIMEOUT';
      throw lockError;
    }
    try {
      var key = kspPitchbookReservationKey_(batchId);
      var reservation = kspSafeParseJson_(scriptProperties.getProperty(key), key);
      kspAssert_(reservation, 'PITCHBOOK_RESERVATION_NOT_FOUND', 'Batch reservationが見つかりません。');
      var file = kspFindPitchbookReservationFile_(reservation, documentId);
      kspAssert_(file, 'PITCHBOOK_RESERVATION_FILE_NOT_FOUND', 'Document reservationが見つかりません。');
      if (file.fileId) {
        return { claimToken: '', fileInfo: { id: file.fileId, url: file.fileUrl || '', reused: true } };
      }
      var canonicalNowIso = kspCanonicalInstantIso_(nowIso);
      if (file.uploadState === 'UPLOADING' && file.claimedAt) {
        var claimedAtIso = kspCanonicalInstantIso_(file.claimedAt);
        var claimedAtMs = claimedAtIso ? new Date(claimedAtIso).getTime() : NaN;
        var nowMs = canonicalNowIso ? new Date(canonicalNowIso).getTime() : NaN;
        if (Number.isFinite(claimedAtMs) && Number.isFinite(nowMs) && nowMs - claimedAtMs < KSP_PITCHBOOK_UPLOAD_CLAIM_TTL_MS) {
          var inProgress = new Error('同じファイルのアップロードが進行中です。少し待って再試行してください。');
          inProgress.code = 'PITCHBOOK_UPLOAD_IN_PROGRESS';
          throw inProgress;
        }
      }
      file.uploadState = 'UPLOADING';
      file.claimToken = Utilities.getUuid();
      file.claimedAt = canonicalNowIso;
      scriptProperties.setProperty(key, JSON.stringify(reservation));
      return { claimToken: file.claimToken, fileInfo: null };
    } finally {
      lock.releaseLock();
    }
  };

  meetingEnvironment.completePitchbookUploadClaim = function (batchId, documentId, claimToken, fileInfo, nowIso) {
    kspUpdatePitchbookReservationClaim_(scriptProperties, batchId, documentId, claimToken, function (file) {
      file.uploadState = 'UPLOADED';
      file.claimToken = '';
      file.claimedAt = kspCanonicalInstantIso_(nowIso);
      file.fileId = fileInfo.id;
      file.fileUrl = fileInfo.url || '';
    });
  };

  meetingEnvironment.releasePitchbookUploadClaim = function (batchId, documentId, claimToken, errorMessage, nowIso) {
    kspUpdatePitchbookReservationClaim_(scriptProperties, batchId, documentId, claimToken, function (file) {
      file.uploadState = 'FAILED';
      file.claimToken = '';
      file.claimedAt = kspCanonicalInstantIso_(nowIso);
      file.lastError = String(errorMessage || '');
    });
  };

}

function kspUpdatePitchbookReservationClaim_(scriptProperties, batchId, documentId, claimToken, updater) {
  var lock = LockService.getScriptLock();
  if (!lock.tryLock(KSP_DEFAULTS.LOCK_TIMEOUT_MS)) {
    var lockError = new Error('Could not acquire the Pitchbook reservation update lock.');
    lockError.code = 'PITCHBOOK_RESERVATION_UPDATE_LOCK_TIMEOUT';
    throw lockError;
  }
  try {
    var key = kspPitchbookReservationKey_(batchId);
    var reservation = kspSafeParseJson_(scriptProperties.getProperty(key), key);
    kspAssert_(reservation, 'PITCHBOOK_RESERVATION_NOT_FOUND', 'Batch reservationが見つかりません。');
    var file = kspFindPitchbookReservationFile_(reservation, documentId);
    kspAssert_(file, 'PITCHBOOK_RESERVATION_FILE_NOT_FOUND', 'Document reservationが見つかりません。');
    if (claimToken) {
      kspAssert_(String(file.claimToken || '') === String(claimToken), 'PITCHBOOK_UPLOAD_CLAIM_CONFLICT',
        'Upload claimが一致しません。');
    }
    updater(file);
    scriptProperties.setProperty(key, JSON.stringify(reservation));
  } finally {
    lock.releaseLock();
  }
}

// ===== END src/82_PitchbookClaimAdapters.gs =====

// ===== BEGIN src/83_PitchbookDriveAdapters.gs =====
function kspAttachPitchbookDriveAdapters_(meetingEnvironment) {
  meetingEnvironment.decodeBase64 = function (base64Data) {
    return Utilities.base64Decode(base64Data);
  };

  meetingEnvironment.createOrReusePitchbookFile = function (parentFolderId, row, bytes, mimeType) {
    var query = "'" + kspEscapeDriveQueryLiteral_(parentFolderId) + "' in parents and trashed = false" +
      " and appProperties has { key='kspDocumentId' and value='" +
      kspEscapeDriveQueryLiteral_(String(row.Document_ID)) + "' }";
    var response = Drive.Files.list({ q: query, spaces: 'drive', includeItemsFromAllDrives: true,
      supportsAllDrives: true, pageSize: 10, fields: 'files(id,name,webViewLink,parents,appProperties)' });
    var matches = response.files || [];
    kspAssert_(matches.length <= 1, 'DUPLICATE_PITCHBOOK_FILES',
      'Multiple Drive files found for ' + row.Document_ID + '.');
    if (matches.length === 1) {
      return { id: matches[0].id, name: matches[0].name,
        url: matches[0].webViewLink || '', reused: true };
    }
    var blob = Utilities.newBlob(bytes, mimeType || 'application/octet-stream', String(row.Original_Filename));
    var created = Drive.Files.create({
      name: String(row.Saved_Filename),
      parents: [parentFolderId],
      appProperties: { kspDocumentId: String(row.Document_ID), kspBatchId: String(row.Batch_ID) }
    }, blob, { supportsAllDrives: true, fields: 'id,name,webViewLink,parents,appProperties' });
    return { id: created.id, name: created.name, url: created.webViewLink || '', reused: false };
  };
}
// ===== END src/83_PitchbookDriveAdapters.gs =====

// ===== BEGIN src/84_PitchbookIndexAdapters.gs =====
function kspAttachPitchbookIndexAdapters_(meetingEnvironment, scriptProperties) {
  meetingEnvironment.completePitchbookRow = function (spreadsheetId, documentId, fileInfo, actor, nowIso, expected) {
    return kspUpdatePitchbookRowLive_(spreadsheetId, documentId, function (row, spreadsheet) {
      var claim = expected && expected.parentClaim;
      var parentId = String(expected && expected.parentMeetingId || '');
      var expectedVersion = Number(expected && expected.expectedParentVersion);
      var claimKey = kspMaintenanceClaimKey_('Meeting', parentId);
      var stored = kspSafeParseJson_(scriptProperties.getProperty(claimKey), claimKey);
      var nowMs = Date.now();
      kspAssert_(parentId && String(row.Parent_Meeting_ID || '') === parentId &&
        Number.isInteger(expectedVersion) && expectedVersion > 0 &&
        claim && claim.claimKey === claimKey && claim.claimToken &&
        stored && stored.claimToken === claim.claimToken && stored.entity === 'Meeting' &&
        String(stored.recordId) === parentId && String(stored.expectedToken) === String(expectedVersion) &&
        Number.isFinite(Number(stored.expiresAtMs)) && Number(stored.expiresAtMs) > nowMs,
        'PITCHBOOK_COMPLETION_CONFLICT', '親記録の処理権が変更または失効しました。最新情報で再試行してください。');
      var parentSheet = spreadsheet.getSheetByName(KSP_SHEET_NAMES.MEETING_INDEX);
      kspAssert_(parentSheet, 'PITCHBOOK_COMPLETION_CONFLICT', '親記録を確認できません。');
      var parents = kspReadObjectsFromSheet_(parentSheet, kspReadHeadersFromSheet_(parentSheet)).filter(function (parent) {
        return String(parent.Meeting_ID || '') === parentId;
      });
      kspAssert_(parents.length === 1 && parents[0].Status === KSP_STATUS.ACTIVE &&
        parents[0].Doc_File_ID && Number(parents[0].Version) === expectedVersion &&
        (row.Status === KSP_PITCHBOOK_STATUS.PENDING || row.Status === KSP_PITCHBOOK_STATUS.FAILED || row.Status === KSP_PITCHBOOK_STATUS.ACTIVE),
        'PITCHBOOK_COMPLETION_CONFLICT', '親記録または資料が変更されました。最新情報で再試行してください。');
      if (String(row.Status) === KSP_PITCHBOOK_STATUS.ACTIVE && row.File_ID) return row;
      row.File_ID = fileInfo.id;
      row.File_URL = fileInfo.url || '';
      row.Status = KSP_PITCHBOOK_STATUS.ACTIVE;
      row.Updated_At = nowIso;
      row.Updated_By = actor;
      row.AI_Index_Status = KSP_AI_INDEX_STATUS.PENDING;
      return row;
    });
  };

  meetingEnvironment.failPitchbookRow = function (spreadsheetId, documentId, fileInfo, actor, nowIso) {
    return kspUpdatePitchbookRowLive_(spreadsheetId, documentId, function (row) {
      if (String(row.Status) === KSP_PITCHBOOK_STATUS.ACTIVE) return row;
      if (fileInfo) {
        row.File_ID = fileInfo.id || row.File_ID;
        row.File_URL = fileInfo.url || row.File_URL;
      }
      row.Status = KSP_PITCHBOOK_STATUS.FAILED;
      row.Updated_At = nowIso;
      row.Updated_By = actor;
      return row;
    });
  };

  meetingEnvironment.clearPitchbookReservationIfComplete = function (spreadsheetId, batchId) {
    var spreadsheet = SpreadsheetApp.openById(spreadsheetId);
    var sheet = spreadsheet.getSheetByName(KSP_SHEET_NAMES.PITCHBOOK_INDEX);
    kspAssert_(sheet, 'SHEET_NOT_FOUND', 'Sheet not found: ' + KSP_SHEET_NAMES.PITCHBOOK_INDEX);
    var headers = kspReadHeadersFromSheet_(sheet);
    var rows = kspReadObjectsFromSheet_(sheet, headers).filter(function (row) {
      return String(row.Batch_ID) === String(batchId);
    });
    if (rows.length > 0 && rows.every(function (row) { return String(row.Status) === KSP_PITCHBOOK_STATUS.ACTIVE; })) {
      scriptProperties.deleteProperty(kspPitchbookReservationKey_(batchId));
      return true;
    }
    return false;
  };

}

function kspUpdatePitchbookRowLive_(spreadsheetId, documentId, updater) {
  var lock = LockService.getScriptLock();
  if (!lock.tryLock(KSP_DEFAULTS.LOCK_TIMEOUT_MS)) {
    var lockError = new Error('Could not acquire the Pitchbook Index update lock.');
    lockError.code = 'PITCHBOOK_INDEX_LOCK_TIMEOUT';
    throw lockError;
  }
  try {
    var spreadsheet = SpreadsheetApp.openById(spreadsheetId);
    var sheet = spreadsheet.getSheetByName(KSP_SHEET_NAMES.PITCHBOOK_INDEX);
    kspAssert_(sheet, 'SHEET_NOT_FOUND', 'Sheet not found: ' + KSP_SHEET_NAMES.PITCHBOOK_INDEX);
    var headers = kspReadHeadersFromSheet_(sheet);
    var rows = kspReadObjectsFromSheet_(sheet, headers);
    var indexes = [];
    rows.forEach(function (row, index) {
      if (String(row.Document_ID) === String(documentId)) indexes.push(index);
    });
    kspAssert_(indexes.length === 1, indexes.length === 0 ? 'PITCHBOOK_SLOT_NOT_FOUND' : 'DUPLICATE_KEY_ROWS',
      'Expected exactly one Pitchbook row for ' + documentId + '.');
    var updated = updater(kspDeepClone_(rows[indexes[0]]), spreadsheet);
    var values = headers.map(function (header) {
      var value = updated[header];
      return value === undefined || value === null ? '' : value;
    });
    sheet.getRange(indexes[0] + 2, 1, 1, headers.length).setValues([values]);
    return updated;
  } finally {
    lock.releaseLock();
  }
}
// ===== END src/84_PitchbookIndexAdapters.gs =====

// ===== BEGIN src/90_WebApp.gs =====
function doGet(event) {
  var page = event && event.parameter ? String(event.parameter.page || '') : '';

  // Unlinked operator surface. The RPC's server authorization, not this route,
  // is the security boundary. Rendering never performs confirmation.
  if (page === 'deployment-security') {
    return kspCreateHtmlTemplate_('DeploymentSecurityOperator').evaluate()
      .setTitle('デプロイ設定の確認 | Private Assets Intelligence')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.DEFAULT);
  }

  if (page === 'knowledge') {
    var knowledgeTemplate = kspCreateHtmlTemplate_('KnowledgeSearch');
    knowledgeTemplate.themeHeadMarkup = kspGetThemeHeadMarkup_();
    return knowledgeTemplate.evaluate()
      .setTitle('ナレッジ検索 | Private Assets Intelligence')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.DEFAULT);
  }

  var indexTemplate = kspCreateHtmlTemplate_('Index');
  indexTemplate.themeHeadMarkup = kspGetThemeHeadMarkup_();
  return indexTemplate.evaluate()
    .setTitle('Private Assets Intelligence')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.DEFAULT);
}

function include_(filename) {
  return kspReadHtmlResource_(filename);
}

function getMeetingBootstrapData() {
  return kspGetMeetingBootstrapData_(kspCreateMeetingEnvironment_());
}

function registerMeeting(input) {
  return kspRegisterMeeting_(kspCreateMeetingEnvironment_(), input);
}

function getPitchbookBootstrapData() {
  return kspGetPitchbookBootstrapData_(kspCreatePitchbookEnvironment_());
}

function preparePitchbookBatch(input) {
  return kspPreparePitchbookBatch_(kspCreatePitchbookEnvironment_(), input);
}

function uploadPitchbookFile(input) {
  return kspUploadPitchbookFile_(kspCreatePitchbookEnvironment_(), input);
}

function getPhase1MaintenanceBootstrapData() {
  return kspGetPhase1MaintenanceBootstrap_(kspCreateMaintenanceEnvironment_());
}

function searchMeetingRecords(input) {
  return kspSearchMeetingRecords_(kspCreateMaintenanceEnvironment_(), input);
}

function getMeetingMaintenanceRecord(meetingId) {
  return kspGetMeetingMaintenanceRecord_(kspCreateMaintenanceEnvironment_(), meetingId);
}

function updateMeetingMaintenance(input) {
  return kspUpdateMeetingMaintenance_(kspCreateMaintenanceEnvironment_(), input);
}

function changeMeetingStatus(input) {
  return kspChangeMeetingStatus_(kspCreateMaintenanceEnvironment_(), input);
}

function searchPitchbookRecords(input) {
  return kspSearchPitchbookRecords_(kspCreateMaintenanceEnvironment_(), input);
}

function getPitchbookMaintenanceRecord(documentId) {
  return kspGetPitchbookMaintenanceRecord_(kspCreateMaintenanceEnvironment_(), documentId);
}

function updatePitchbookMaintenance(input) {
  return kspUpdatePitchbookMaintenance_(kspCreateMaintenanceEnvironment_(), input);
}

function changePitchbookStatus(input) {
  return kspChangePitchbookStatus_(kspCreateMaintenanceEnvironment_(), input);
}

function mutateMaster(input) {
  return kspMutateMaster_(kspCreateMaintenanceEnvironment_(), input);
}

function quickAddCounterparty(input) {
  var source = input && typeof input === 'object' ? input : {};
  return kspQuickAddCounterparty_(kspCreateMaintenanceEnvironment_(), source.name, source.type);
}

function updateMeetingRelations(input) {
  return kspUpdateMeetingRelations_(kspCreateMaintenanceEnvironment_(), input);
}

function getEntityWorkspaceData(input) {
  return kspGetEntityWorkspaceData_(kspCreateEntityWorkspaceEnvironment_(), input);
}

function getMeetingActivityAnalytics(input) {
  return kspGetMeetingActivityAnalytics_(kspCreateActivityAnalyticsEnvironment_(), input);
}

function getRelationshipExplorerData(input) {
  return kspGetRelationshipExplorerData_(kspCreateRelationshipExplorerEnvironment_(), input);
}

function updateMeetingAdminCheck(input) {
  return kspUpdateMeetingAdminCheck_(kspCreateActivityAnalyticsEnvironment_(), input);
}

function runAuditRetentionCleanup_() {
  return kspRunAuditRetentionCleanup_(kspCreateMaintenanceEnvironment_());
}

function getPhase1Diagnostics_() {
  return kspGetPhase1Diagnostics_(kspCreateMaintenanceEnvironment_());
}
// ===== END src/90_WebApp.gs =====

// ===== BEGIN src/99_EntryPoints.gs =====
function setupKnowledgePlatform_() {
  var originalTriggerRegistry = kspGetTriggerRegistry_;
  kspGetTriggerRegistry_ = function (config) {
    return originalTriggerRegistry(config).map(function (rule) {
      if (rule.handler === 'runAiSyncWorker_') {
        var copy = kspDeepClone_(rule);
        copy.available = true;
        return copy;
      }
      return rule;
    });
  };
  try {
    return kspRunSetup_(kspCreateAppsScriptEnvironment_());
  } finally {
    kspGetTriggerRegistry_ = originalTriggerRegistry;
  }
}

function validateInstallation_() {
  return kspRunValidation_(kspCreateAppsScriptEnvironment_());
}

function getInstallationStatus_() {
  return kspGetStatus_(kspCreateAppsScriptEnvironment_());
}

function runBackendDailyBackup_() {
  var result = kspRunBackendDailyBackup_(kspCreateBackendBackupEnvironment_());
  Logger.log(JSON.stringify({ operation: 'BACKEND_DAILY_BACKUP', ok: result.ok,
    snapshot: result.snapshot, retentionTrashed: result.retentionTrashed, errorCode: result.errorCode }));
  return result;
}

function runBackendDailyBackupNow() {
  var result = kspRunBackendDailyBackup_(kspCreateBackendBackupEnvironment_());
  Logger.log(JSON.stringify({ operation: 'BACKEND_DAILY_BACKUP', ok: result.ok,
    snapshot: result.snapshot, retentionTrashed: result.retentionTrashed, errorCode: result.errorCode }));
  return result;
}

function getBootstrapConfigTemplate_() {
  return kspGetBootstrapConfigTemplate_();
}

function installKnowledgeShare() {
  var status = kspRunInstaller_(kspCreateInstallerEnvironment_());
  kspLogInstallerOutcome_(status);
  return status;
}

function checkKnowledgeShareReadiness() {
  return kspCheckInstallerReadiness_(kspCreateInstallerEnvironment_());
}

function confirmKnowledgeShareDeploymentSecurity() {
  return kspConfirmInstallerDeploymentSecurity_(kspCreateInstallerEnvironment_());
}

function previewKnowledgeExport(input) {
  return kspRunKnowledgeExportPreview_(kspCreateKnowledgeExportEnvironment_(), input);
}

function createKnowledgeExport(input) {
  return kspRunKnowledgeExportCreation_(kspCreateKnowledgeExportEnvironment_(), input);
}

function getKnowledgeExportPrompt(input) {
  return kspGetKnowledgeExportPrompt_(kspCreateKnowledgeExportEnvironment_(), input);
}

function recordKnowledgeExportPromptCopy(input) {
  return kspRecordKnowledgeExportPromptCopy_(kspCreateKnowledgeExportEnvironment_(), input);
}
// ===== END src/99_EntryPoints.gs =====

// ===== BEGIN src/100_MaintenanceCore.gs =====
var KSP_MAINTENANCE_WORK_ID = '0007';
var KSP_MAINTENANCE_APP_VERSION = '0.4.0';
var KSP_AUDIT_RETENTION_YEARS = 5;

var KSP_MAINTENANCE_ACTIONS = Object.freeze({
  MEETING_UPDATE: 'MEETING_UPDATE',
  MEETING_DEACTIVATE: 'MEETING_DEACTIVATE',
  MEETING_REACTIVATE: 'MEETING_REACTIVATE',
  PITCHBOOK_UPDATE: 'PITCHBOOK_UPDATE',
  PITCHBOOK_DEACTIVATE: 'PITCHBOOK_DEACTIVATE',
  PITCHBOOK_REACTIVATE: 'PITCHBOOK_REACTIVATE',
  COUNTERPARTY_ADD: 'COUNTERPARTY_ADD',
  COUNTERPARTY_RENAME: 'COUNTERPARTY_RENAME',
  COUNTERPARTY_DEACTIVATE: 'COUNTERPARTY_DEACTIVATE',
  COUNTERPARTY_REACTIVATE: 'COUNTERPARTY_REACTIVATE',
  OPTION_ADD: 'OPTION_ADD',
  OPTION_RENAME: 'OPTION_RENAME',
  OPTION_REORDER: 'OPTION_REORDER',
  OPTION_REORDER_BATCH: 'OPTION_REORDER',
  OPTION_DEACTIVATE: 'OPTION_DEACTIVATE',
  OPTION_REACTIVATE: 'OPTION_REACTIVATE',
  AUDIT_RETENTION_CLEANUP: 'AUDIT_RETENTION_CLEANUP'
});

var KSP_MASTER_ENTITY = Object.freeze({ COUNTERPARTY: 'COUNTERPARTY', OPTION: 'OPTION' });
var KSP_MASTER_MUTATION = Object.freeze({
  ADD: 'ADD', RENAME: 'RENAME', REORDER: 'REORDER', REORDER_BATCH: 'REORDER_BATCH',
  DEACTIVATE: 'DEACTIVATE', REACTIVATE: 'REACTIVATE'
});

var KSP_MAINTENANCE_LIMITS = Object.freeze({
  DEFAULT_RESULTS: 100,
  MAX_RESULTS: 500,
  EDIT_CLAIM_TTL_MS: 5 * 60 * 1000,
  MASTER_NAME: 200
});

function kspNormalizeRecordSearch_(input) {
  var source = input && typeof input === 'object' ? input : {};
  var legacyMeetingTypeCode = kspMaintenanceTrim_(source.meetingTypeCode);
  var rawMeetingTypeCodes = Array.isArray(source.meetingTypeCodes) ? source.meetingTypeCodes : [];
  var meetingTypeCodes = [];
  rawMeetingTypeCodes.forEach(function (value) {
    kspMaintenanceSplitCodes_(value).forEach(function (code) {
      if (meetingTypeCodes.indexOf(code) === -1) meetingTypeCodes.push(code);
    });
  });
  if (legacyMeetingTypeCode && meetingTypeCodes.indexOf(legacyMeetingTypeCode) === -1) {
    meetingTypeCodes.push(legacyMeetingTypeCode);
  }
  return {
    dateFrom: kspMaintenanceTrim_(source.dateFrom),
    dateTo: kspMaintenanceTrim_(source.dateTo),
    gpId: kspMaintenanceTrim_(source.gpId),
    counterpartyType: kspMaintenanceTrim_(source.counterpartyType),
    counterpartyId: kspMaintenanceTrim_(source.counterpartyId),
    relatedGpId: kspMaintenanceTrim_(source.relatedGpId),
    assetClassId: kspMaintenanceTrim_(source.assetClassId),
    capitalTypeId: kspMaintenanceTrim_(source.capitalTypeId),
    teamId: kspMaintenanceTrim_(source.teamId),
    fundStrategy: kspMaintenanceTrim_(source.fundStrategy),
    meetingTypeCode: legacyMeetingTypeCode,
    meetingTypeCodes: meetingTypeCodes,
    followUpOnly: kspToBoolean_(source.followUpOnly, false),
    status: kspMaintenanceTrim_(source.status),
    limit: source.limit === null || source.limit === undefined || source.limit === ''
      ? KSP_MAINTENANCE_LIMITS.DEFAULT_RESULTS : Number(source.limit)
  };
}

function kspValidateRecordSearch_(search) {
  if (search.dateFrom) {
    kspAssert_(kspIsValidDateKey_(search.dateFrom), 'SEARCH_DATE_FROM_INVALID', 'From日付が不正です。');
  }
  if (search.dateTo) {
    kspAssert_(kspIsValidDateKey_(search.dateTo), 'SEARCH_DATE_TO_INVALID', 'To日付が不正です。');
  }
  if (search.dateFrom && search.dateTo) {
    kspAssert_(search.dateFrom <= search.dateTo, 'SEARCH_DATE_RANGE_INVALID', 'From日付はTo日付以前にしてください。');
  }
  kspAssert_(search.limit > 0 && search.limit <= KSP_MAINTENANCE_LIMITS.MAX_RESULTS,
    'SEARCH_LIMIT_INVALID', '検索件数上限が不正です。');
  (search.meetingTypeCodes || []).forEach(function (meetingTypeCode) {
    kspAssert_(['ANNUAL_REVIEW', 'OFFICE_VISIT', 'ANNUAL_GENERAL_MEETING'].indexOf(meetingTypeCode) !== -1,
      'SEARCH_MEETING_TYPE_INVALID', 'Meeting type filterが不正です。');
  });
  if (search.counterpartyType) {
    kspAssert_(Boolean(kspCounterpartyTypeDefinition_(search.counterpartyType)),
      'SEARCH_COUNTERPARTY_TYPE_INVALID', '面談先区分filterが不正です。');
  }
  return search;
}

function kspMaintenanceTrim_(value) {
  return value === null || value === undefined ? '' : String(value).trim();
}

function kspMaintenanceCellText_(value, kind) {
  if (kind === 'date') return kspCanonicalBusinessDate_(value);
  if (kind === 'time') return kspCanonicalBusinessTime_(value);
  if (kind === 'iso') return kspCanonicalInstantIso_(value);
  return value === null || value === undefined ? '' : String(value);
}

function kspMaintenancePositiveInteger_(value, fallback) {
  var numberValue = Number(value);
  return Number.isFinite(numberValue) && numberValue > 0 && Math.floor(numberValue) === numberValue
    ? numberValue : fallback;
}

function kspMaintenanceSplitCodes_(value) {
  return String(value || '').split(',').map(function (item) { return item.trim(); }).filter(Boolean);
}

function kspMaintenanceMeetingTypeLabels_(value) {
  var labels = {
    ANNUAL_REVIEW: '定例年1回',
    OFFICE_VISIT: '先方オフィス訪問',
    ANNUAL_GENERAL_MEETING: '年次総会'
  };
  return kspMaintenanceSplitCodes_(value).map(function (code) { return labels[code] || code; });
}

function kspBuildMaintenanceRelatedPitchbookChoices_(rows, counterpartyId, assetClassId, existingIds) {
  var preserved = {};
  (existingIds || []).forEach(function (id) { preserved[String(id)] = true; });
  var choices = (rows || []).filter(function (row) {
    var id = String(row.Document_ID || '');
    return id && (preserved[id] || (String(row.Status || '') === KSP_STATUS.ACTIVE &&
      String(row.Counterparty_ID || '') === String(counterpartyId || '') &&
      String(row.Asset_Class_ID || '') === String(assetClassId || '')));
  }).map(function (row) {
    return {
      id: String(row.Document_ID || ''), date: kspMaintenanceCellText_(row.Date, 'date'),
      counterpartyId: String(row.Counterparty_ID || ''), assetClassId: String(row.Asset_Class_ID || ''),
      title: String(row.Saved_Filename || row.Original_Filename || row.Document_ID || ''),
      status: String(row.Status || ''), preserved: Boolean(preserved[String(row.Document_ID || '')])
    };
  }).sort(function (left, right) {
    return right.date.localeCompare(left.date) || left.id.localeCompare(right.id);
  });
  var resolved = {};
  choices.forEach(function (item) { resolved[item.id] = true; });
  Object.keys(preserved).filter(function (id) { return !resolved[id]; }).sort().forEach(function (id) {
    choices.push({ id: id, date: '', counterpartyId: '', assetClassId: '', title: id,
      status: '', preserved: true, unresolved: true });
  });
  return choices;
}

function kspRecordMatchesSearch_(row, search, maps) {
  var date = kspMaintenanceCellText_(row.Date, 'date');
  if (search.dateFrom && date < search.dateFrom) return false;
  if (search.dateTo && date > search.dateTo) return false;
  if (search.gpId && String(row.GP_ID || '') !== search.gpId) return false;
  var counterpartyId = kspMeetingCounterpartyId_(row);
  var resolvedType = maps && maps.counterpartyType ? String(maps.counterpartyType[counterpartyId] || '')
    : kspMeetingCounterpartyType_(row);
  if (search.counterpartyType && resolvedType !== search.counterpartyType) return false;
  if (search.counterpartyId && kspMeetingCounterpartyId_(row) !== search.counterpartyId) return false;
  if (search.relatedGpId && kspMaintenanceSplitCodes_(kspMeetingRelatedGpIds_(row)).indexOf(search.relatedGpId) === -1) return false;
  if (search.assetClassId && String(row.Asset_Class_ID || '') !== search.assetClassId) return false;
  if (search.capitalTypeId && String(row.Capital_Type_ID || '') !== search.capitalTypeId) return false;
  if (search.teamId && String(row.Team_ID || '') !== search.teamId) return false;
  if (search.fundStrategy && String(row.Fund_Strategy || '').toLocaleLowerCase('ja').indexOf(search.fundStrategy.toLocaleLowerCase('ja')) === -1) return false;
  if (search.meetingTypeCodes && search.meetingTypeCodes.length) {
    var rowMeetingTypeCodes = kspMaintenanceSplitCodes_(row.Meeting_Type_Codes);
    if (!search.meetingTypeCodes.some(function (code) { return rowMeetingTypeCodes.indexOf(code) !== -1; })) return false;
  }
  if (search.followUpOnly && !kspToBoolean_(row.Follow_Up_Required, false)) return false;
  if (search.status && String(row.Status || '') !== search.status) return false;
  return true;
}

function kspSearchRows_(rows, search, mapper, maps) {
  return (rows || [])
    .filter(function (row) { return kspRecordMatchesSearch_(row, search, maps); })
    .sort(function (left, right) {
      var dateCompare = kspMaintenanceCellText_(right.Date, 'date').localeCompare(kspMaintenanceCellText_(left.Date, 'date'));
      if (dateCompare !== 0) return dateCompare;
      var updateCompare = kspTemporalInstantComparisonKey_(right.Updated_At).localeCompare(
        kspTemporalInstantComparisonKey_(left.Updated_At)
      );
      if (updateCompare !== 0) return updateCompare;
      return String(left.Meeting_ID || left.Document_ID || '').localeCompare(
        String(right.Meeting_ID || right.Document_ID || '')
      );
    })
    .slice(0, search.limit)
    .map(mapper);
}

function kspBuildCatalogMaps_(catalog) {
  var maps = { gp: {}, assetClass: {}, capitalType: {}, location: {}, team: {}, counterparty: {}, counterpartyType: {} };
  (catalog.gps || []).forEach(function (item) { maps.gp[item.id] = item.name; });
  (catalog.assetClasses || []).forEach(function (item) { maps.assetClass[item.id] = item.name; });
  (catalog.capitalTypes || []).forEach(function (item) { maps.capitalType[item.id] = item.name; });
  (catalog.locations || []).forEach(function (item) { maps.location[item.id] = item.name; });
  (catalog.teams || []).forEach(function (item) { maps.team[item.id] = item.name; });
  (catalog.counterpartyEntities || []).forEach(function (item) {
    maps.counterparty[item.id] = item.name;
    maps.counterparty[item.entityKey || kspCounterpartyEntityKey_(item.id)] = item.name;
    maps.counterparty[item.type + ':' + item.id] = item.name;
    maps.counterpartyType[item.id] = item.type;
  });
  return maps;
}

function kspBuildAllMasterMaps_(counterpartyRows, optionRows) {
  var maps = { gp: {}, assetClass: {}, capitalType: {}, location: {}, team: {}, counterparty: {}, counterpartyType: {} };
  (counterpartyRows || []).forEach(function (row) {
    var id = String(row.Counterparty_ID || row.GP_ID || '');
    if (id) {
      var name = String(row.Counterparty_Name || row.GP_Name || '');
      var type = String(row.Counterparty_Type || (row.GP_ID ? 'GP' : ''));
      maps.counterparty[id] = name;
      maps.counterparty[kspCounterpartyEntityKey_(id)] = name;
      maps.counterparty[type + ':' + id] = name;
      maps.counterpartyType[id] = type;
      if (type === 'GP') maps.gp[id] = name;
    }
  });
  (optionRows || []).forEach(function (row) {
    var target = String(row.Type || '') === KSP_OPTION_TYPES.ASSET_CLASS ? maps.assetClass
      : String(row.Type || '') === KSP_OPTION_TYPES.CAPITAL_TYPE ? maps.capitalType
      : String(row.Type || '') === KSP_OPTION_TYPES.LOCATION ? maps.location
      : String(row.Type || '') === KSP_OPTION_TYPES.TEAM ? maps.team : null;
    if (target && row.Option_ID) target[String(row.Option_ID)] = String(row.Name || '');
  });
  return maps;
}

function kspMapMeetingSearchResult_(row, maps) {
  var counterpartyId = kspMeetingCounterpartyId_(row);
  var counterpartyType = String((maps.counterpartyType || {})[counterpartyId] || kspMeetingCounterpartyType_(row));
  var relatedGpIds = kspMaintenanceSplitCodes_(kspMeetingRelatedGpIds_(row));
  return {
    meetingId: String(row.Meeting_ID || ''),
    date: kspMaintenanceCellText_(row.Date, 'date'),
    time: kspMaintenanceCellText_(row.Time, 'time'),
    gpId: String(row.GP_ID || ''),
    gpName: maps.gp[String(row.GP_ID || '')] || '',
    counterpartyType: counterpartyType,
    counterpartyId: counterpartyId,
    counterpartyEntityName: (maps.counterparty || {})[counterpartyId] || '',
    relatedGpIds: relatedGpIds,
    relatedGpNames: relatedGpIds.map(function (id) { return maps.gp[id] || id; }),
    assetClassId: String(row.Asset_Class_ID || ''),
    assetClassName: maps.assetClass[String(row.Asset_Class_ID || '')] || '',
    capitalTypeId: String(row.Capital_Type_ID || ''),
    capitalTypeName: maps.capitalType[String(row.Capital_Type_ID || '')] || '',
    locationId: String(row.Location_ID || ''),
    locationName: maps.location[String(row.Location_ID || '')] || '',
    teamId: String(row.Team_ID || ''),
    teamName: (maps.team || {})[String(row.Team_ID || '')] || '',
    fundStrategy: String(row.Fund_Strategy || ''),
    meetingTypeCodes: kspMaintenanceSplitCodes_(row.Meeting_Type_Codes),
    meetingTypeLabels: kspMaintenanceMeetingTypeLabels_(row.Meeting_Type_Codes),
    relatedPitchbookIds: kspMaintenanceSplitCodes_(row.Related_Pitchbook_IDs),
    followUpRequired: kspToBoolean_(row.Follow_Up_Required, false),
    followUpNote: String(row.Follow_Up_Note || ''),
    counterparty: String(row.Counterparty || ''),
    internalParticipants: String(row.Internal_Participants || ''),
    documentId: String(row.Doc_File_ID || ''),
    documentUrl: String(row.Doc_URL || ''),
    filename: String(row.Saved_Filename || ''),
    status: String(row.Status || ''),
    version: Number(row.Version || 0),
    updatedAt: kspMaintenanceCellText_(row.Updated_At, 'iso')
  };
}

function kspMapPitchbookSearchResult_(row, maps) {
  return {
    documentId: String(row.Document_ID || ''),
    batchId: String(row.Batch_ID || ''),
    parentMeetingId: String(row.Parent_Meeting_ID || ''),
    counterpartyType: String((maps.counterpartyType || {})[kspMeetingCounterpartyId_(row)] || kspMeetingCounterpartyType_(row)),
    counterpartyId: kspMeetingCounterpartyId_(row),
    counterpartyName: (maps.counterparty || {})[kspMeetingCounterpartyId_(row)] || '',
    relatedGpIds: kspMeetingRelatedGpIds_(row),
    date: kspMaintenanceCellText_(row.Date, 'date'),
    gpId: String(row.GP_ID || ''),
    gpName: maps.gp[String(row.GP_ID || '')] || '',
    assetClassId: String(row.Asset_Class_ID || ''),
    assetClassName: maps.assetClass[String(row.Asset_Class_ID || '')] || '',
    capitalTypeId: String(row.Capital_Type_ID || ''),
    capitalTypeName: maps.capitalType[String(row.Capital_Type_ID || '')] || '',
    fundStrategy: String(row.Fund_Strategy || ''),
    sequenceNo: Number(row.Sequence_No || 0),
    fileId: String(row.File_ID || ''),
    fileUrl: String(row.File_URL || ''),
    originalFilename: String(row.Original_Filename || ''),
    savedFilename: String(row.Saved_Filename || ''),
    status: String(row.Status || ''),
    updatedAt: kspMaintenanceCellText_(row.Updated_At, 'iso')
  };
}

function kspParseMeetingDocumentText_(text) {
  var source = String(text || '').replace(/\r\n?/g, '\n');
  var notesMarker = '\n\n面談内容:\n';
  var markerIndex = source.indexOf(notesMarker);
  var metadataText = markerIndex === -1 ? source : source.slice(0, markerIndex);
  var notes = markerIndex === -1 ? '' : source.slice(markerIndex + notesMarker.length);
  var values = {};
  metadataText.split('\n').forEach(function (line) {
    var separator = line.indexOf(':');
    if (separator === -1) return;
    var label = line.slice(0, separator).trim();
    var value = line.slice(separator + 1).trim();
    values[label] = value;
  });
  return {
    date: values['日付'] || '',
    time: values['時間'] || '',
    locationName: values['面談場所'] || '',
    gpName: values.GP || '',
    counterpartyTypeLabel: values['面談先種別'] || values['面談先区分'] || '',
    counterpartyEntityName: values['面談先'] || values.GP || '',
    relatedGpNames: values['関連GP'] || values.GP || '',
    assetClassName: values['Asset Class'] || '',
    capitalTypeName: values['Equity / Debt'] || '',
    counterparty: values['面談相手（氏名・役職）'] || values['面談相手'] || '',
    internalParticipants: values['当社側'] || '',
    followUpNote: values['フォローアップメモ'] || '',
    notes: notes
  };
}

function kspNormalizeMeetingEditInput_(input) {
  var normalized = kspNormalizeMeetingInput_(input);
  var source = input && typeof input === 'object' ? input : {};
  normalized.meetingId = kspMaintenanceTrim_(input && input.meetingId);
  normalized.expectedVersion = Number(input && input.expectedVersion);
  normalized.teamId = kspMaintenanceTrim_(source.teamId);
  normalized.fundStrategy = kspMaintenanceTrim_(source.fundStrategy);
  normalized.meetingTypeCodes = typeof kspNormalizeMeetingTypeCodes_ === 'function'
    ? kspNormalizeMeetingTypeCodes_(source.meetingTypeCodes)
    : kspMaintenanceSplitCodes_(source.meetingTypeCodes).join(',');
  normalized.relatedPitchbookIds = typeof kspNormalizeRelatedPitchbookIds_ === 'function'
    ? kspNormalizeRelatedPitchbookIds_(source.relatedPitchbookIds)
    : kspMaintenanceSplitCodes_(source.relatedPitchbookIds).sort().join(',');
  normalized.followUpRequired = kspToBoolean_(source.followUpRequired, false);
  normalized.followUpNote = source.followUpNote === null || source.followUpNote === undefined
    ? '' : String(source.followUpNote).replace(/\r\n?/g, '\n').replace(/\u0000/g, '');
  delete normalized.retryMeetingId;
  delete normalized.retryFingerprint;
  return normalized;
}

function kspValidateMeetingEditInput_(input, catalog) {
  kspParseMeetingId_(input.meetingId);
  kspAssert_(Number.isFinite(input.expectedVersion) && input.expectedVersion > 0 && Math.floor(input.expectedVersion) === input.expectedVersion,
    'MEETING_EXPECTED_VERSION_INVALID', 'Meeting Versionが不正です。');
  kspAssert_(input.fundStrategy.length <= 500, 'MEETING_FUND_STRATEGY_TOO_LONG',
    'Fund / Strategyは500文字以内で入力してください。');
  kspAssert_(input.followUpNote.length <= 2000, 'MEETING_FOLLOW_UP_NOTE_TOO_LONG',
    'フォローアップメモは2,000文字以内で入力してください。');
  return kspValidateMeetingInput_(input, catalog);
}

function kspBuildMeetingEditedRow_(currentRow, input, actor, nowIso, filename) {
  var updated = kspDeepClone_(currentRow);
  updated.Date = input.date;
  updated.Time = input.time;
  updated.Location_ID = input.locationId;
  updated.GP_ID = '';
  updated.Counterparty_Type = input.counterpartyType || '';
  updated.Counterparty_ID = input.counterpartyId;
  updated.Related_GP_IDs = '';
  updated.Asset_Class_ID = input.assetClassId;
  updated.Capital_Type_ID = input.capitalTypeId;
  updated.Team_ID = input.teamId;
  updated.Fund_Strategy = input.fundStrategy;
  updated.Meeting_Type_Codes = input.meetingTypeCodes;
  updated.Related_Pitchbook_IDs = input.relatedPitchbookIds;
  updated.Follow_Up_Required = input.followUpRequired;
  updated.Follow_Up_Note = input.followUpNote;
  updated.Counterparty = input.counterparty;
  updated.Internal_Participants = input.internalParticipants;
  updated.Saved_Filename = filename;
  updated.Version = Number(currentRow.Version || 0) + 1;
  updated.Updated_At = nowIso;
  updated.Updated_By = actor;
  updated.AI_Index_Status = KSP_AI_INDEX_STATUS.PENDING;
  updated.AI_Last_Error = '';
  return updated;
}

function kspNormalizePitchbookEditInput_(input) {
  var source = input && typeof input === 'object' ? input : {};
  return {
    documentId: kspMaintenanceTrim_(source.documentId),
    expectedUpdatedAt: kspMaintenanceTrim_(source.expectedUpdatedAt),
    date: kspMaintenanceTrim_(source.date),
    counterpartyId: kspMaintenanceTrim_(source.counterpartyId || source.gpId),
    assetClassId: kspMaintenanceTrim_(source.assetClassId),
    capitalTypeId: kspMaintenanceTrim_(source.capitalTypeId),
    fundStrategy: kspMaintenanceTrim_(source.fundStrategy)
  };
}

function kspValidatePitchbookEditInput_(input, catalog) {
  kspAssert_(input.counterpartyId, 'PITCHBOOK_COUNTERPARTY_REQUIRED', '面談先を確認してください。');
  kspParseDocumentId_(input.documentId);
  kspAssert_(input.expectedUpdatedAt, 'PITCHBOOK_EXPECTED_UPDATED_AT_REQUIRED', '更新トークンがありません。');
  kspAssert_(kspIsValidDateKey_(input.date), 'PITCHBOOK_DATE_INVALID', '日付が不正です。');
  kspAssert_(String(input.fundStrategy || '').length <= 500,
    'PITCHBOOK_FUND_STRATEGY_TOO_LONG', 'Fund / Strategyは500文字以内で入力してください。');
  var selected = {
    counterpartyEntity: kspRequirePitchbookCounterparty_(input, catalog),
    assetClass: kspRequireCatalogItem_(catalog.assetClasses, input.assetClassId,
      'PITCHBOOK_ASSET_CLASS_UNAVAILABLE', '選択されたアセットクラスは利用できません。'),
    capitalType: null
  };
  if (input.capitalTypeId) {
    selected.capitalType = kspRequireCatalogItem_(catalog.capitalTypes, input.capitalTypeId,
      'PITCHBOOK_CAPITAL_TYPE_UNAVAILABLE', '選択されたEquity / Debtは利用できません。');
  }
  return selected;
}

function kspPitchbookContextChanged_(currentRow, input) {
  return !kspPitchbookContextMatchesRow_(currentRow, input);
}

function kspPitchbookContextMatchesRow_(row, input) {
  return kspCanonicalBusinessDate_(row.Date) === kspCanonicalBusinessDate_(input.date) &&
    kspMeetingCounterpartyId_(row) === input.counterpartyId &&
    String(row.Asset_Class_ID || '') === input.assetClassId &&
    String(row.Capital_Type_ID || '') === input.capitalTypeId;
}

function kspBuildPitchbookSavedFilename_(input, selected, sequenceNo, originalFilename) {
  return kspBuildPitchbookFilename_(
    input, selected, sequenceNo, kspGetPitchbookExtension_(originalFilename)
  );
}

function kspBuildPitchbookEditedRow_(currentRow, input, actor, nowIso, sequenceNo, filename) {
  var updated = kspDeepClone_(currentRow);
  updated.Date = input.date;
  updated.GP_ID = '';
  updated.Counterparty_Type = input.counterpartyType || '';
  updated.Counterparty_ID = input.counterpartyId;
  updated.Related_GP_IDs = '';
  updated.Asset_Class_ID = input.assetClassId;
  updated.Capital_Type_ID = input.capitalTypeId;
  updated.Fund_Strategy = input.fundStrategy;
  updated.Sequence_No = sequenceNo;
  updated.Saved_Filename = filename;
  updated.Updated_At = nowIso;
  updated.Updated_By = actor;
  updated.AI_Index_Status = KSP_AI_INDEX_STATUS.PENDING;
  updated.AI_Last_Error = '';
  return updated;
}

function kspNormalizeMasterName_(value) {
  var normalized = value === null || value === undefined ? '' : String(value);
  if (normalized.normalize) normalized = normalized.normalize('NFKC');
  return normalized.trim().replace(/\s+/g, ' ').toLocaleLowerCase('en');
}

function kspDisplayMasterName_(value) {
  var display = value === null || value === undefined ? '' : String(value);
  if (display.normalize) display = display.normalize('NFKC');
  return display.trim().replace(/\s+/g, ' ');
}

function kspNextCounterpartyId_(rows) {
  var maximum = (rows || []).reduce(function (maxValue, row) {
    var match = /^CP-(\d{6})$/.exec(String(row.Counterparty_ID || ''));
    return match ? Math.max(maxValue, Number(match[1])) : maxValue;
  }, 0);
  return 'CP-' + String(maximum + 1).padStart(6, '0');
}

function kspOptionPrefix_(type) {
  var prefixes = {
    ASSET_CLASS: 'AC', CAPITAL_TYPE: 'CT', LOCATION: 'LOC', TEAM: 'TEAM',
    COUNTERPARTY_LP: 'CPLP', COUNTERPARTY_NISSAY_DEPARTMENT: 'CPND',
    COUNTERPARTY_GROUP_COMPANY: 'CPGC', COUNTERPARTY_CONSULTANT_GATEKEEPER: 'CPCG',
    COUNTERPARTY_OTHER: 'CPOT'
  };
  kspAssert_(prefixes[type], 'OPTION_TYPE_INVALID', 'Option Typeが不正です。');
  return prefixes[type];
}

function kspNextOptionId_(rows, type) {
  var prefix = kspOptionPrefix_(type);
  var pattern = new RegExp('^OPT-' + prefix + '-(\\d{3})$');
  var maximum = (rows || []).reduce(function (maxValue, row) {
    if (String(row.Type || '') !== type) return maxValue;
    var match = pattern.exec(String(row.Option_ID || ''));
    return match ? Math.max(maxValue, Number(match[1])) : maxValue;
  }, 0);
  return 'OPT-' + prefix + '-' + String(maximum + 1).padStart(3, '0');
}

function kspFindNormalizedMasterDuplicate_(rows, entity, type, name, excludedId) {
  var normalized = kspNormalizeMasterName_(name);
  return (rows || []).filter(function (row) {
    if (entity === KSP_MASTER_ENTITY.COUNTERPARTY) {
      return String(row.Counterparty_ID || '') !== String(excludedId || '') &&
        String(row.Counterparty_Type || '') === type &&
        kspNormalizeMasterName_(row.Counterparty_Name) === normalized;
    }
    return String(row.Option_ID || '') !== String(excludedId || '') &&
      String(row.Type || '') === type && kspNormalizeMasterName_(row.Name) === normalized;
  })[0] || null;
}

function kspNormalizeMasterMutation_(input) {
  var source = input && typeof input === 'object' ? input : {};
  function normalizeIds(values) {
    return (Array.isArray(values) ? values : []).map(function (value) {
      return kspMaintenanceTrim_(value);
    }).filter(Boolean);
  }
  return {
    entity: kspMaintenanceTrim_(source.entity).toUpperCase(),
    action: kspMaintenanceTrim_(source.action).toUpperCase(),
    id: kspMaintenanceTrim_(source.id),
    type: kspMaintenanceTrim_(source.type).toUpperCase(),
    name: kspDisplayMasterName_(source.name),
    sortOrder: Number(source.sortOrder),
    expectedOrderIds: normalizeIds(source.expectedOrderIds),
    orderedIds: normalizeIds(source.orderedIds),
    returnExistingOnDuplicate: Boolean(source.returnExistingOnDuplicate)
  };
}

function kspValidateMasterMutation_(input) {
  kspAssert_(input.entity === KSP_MASTER_ENTITY.COUNTERPARTY || input.entity === KSP_MASTER_ENTITY.OPTION,
    'MASTER_ENTITY_INVALID', 'Master種別が不正です。');
  kspAssert_(Object.keys(KSP_MASTER_MUTATION).some(function (key) {
    return KSP_MASTER_MUTATION[key] === input.action;
  }), 'MASTER_ACTION_INVALID', 'Master操作が不正です。');
  if (input.action === KSP_MASTER_MUTATION.ADD || input.action === KSP_MASTER_MUTATION.RENAME) {
    kspAssert_(input.name, 'MASTER_NAME_REQUIRED', '名称は必須です。');
    kspAssert_(input.name.length <= KSP_MAINTENANCE_LIMITS.MASTER_NAME,
      'MASTER_NAME_TOO_LONG', '名称が長すぎます。');
  }
  if (input.entity === KSP_MASTER_ENTITY.OPTION) {
    if (input.action === KSP_MASTER_MUTATION.ADD) kspOptionPrefix_(input.type);
    if (input.action === KSP_MASTER_MUTATION.REORDER) {
      kspAssert_(Number.isFinite(input.sortOrder) && input.sortOrder > 0 && Math.floor(input.sortOrder) === input.sortOrder,
        'OPTION_SORT_ORDER_INVALID', 'Sort Orderは正の整数にしてください。');
    }
    if (input.action === KSP_MASTER_MUTATION.REORDER_BATCH) {
      kspAssert_(['ASSET_CLASS', 'LOCATION', 'TEAM'].indexOf(input.type) !== -1,
        'OPTION_REORDER_TYPE_INVALID', 'このMaster種別は手動並び替えできません。');
      kspAssert_(input.expectedOrderIds.length > 0 && input.orderedIds.length > 0,
        'OPTION_REORDER_IDS_REQUIRED', '並び順の完全なID一覧が必要です。');
      kspAssert_(input.expectedOrderIds.length <= KSP_MAINTENANCE_LIMITS.MAX_RESULTS &&
        input.orderedIds.length <= KSP_MAINTENANCE_LIMITS.MAX_RESULTS,
        'OPTION_REORDER_IDS_INVALID', '並び替え対象が多すぎます。');
    }
  } else {
    if (input.action === KSP_MASTER_MUTATION.ADD) {
      kspAssert_(Boolean(kspCounterpartyTypeDefinition_(input.type)),
        'COUNTERPARTY_TYPE_INVALID', '面談先種別が不正です。');
    }
    kspAssert_(input.action !== KSP_MASTER_MUTATION.REORDER && input.action !== KSP_MASTER_MUTATION.REORDER_BATCH,
      'COUNTERPARTY_REORDER_NOT_ALLOWED', '面談先は名称順で表示するため手動並び替えできません。');
  }
  if (input.action !== KSP_MASTER_MUTATION.ADD && input.action !== KSP_MASTER_MUTATION.REORDER_BATCH) {
    kspAssert_(input.id, 'MASTER_ID_REQUIRED', 'Master IDが必要です。');
  }
  return input;
}

function kspBuildOptionBatchReorderPlan_(rows, input, actor, nowIso) {
  var sameType = (rows || []).filter(function (row) {
    return String(row.Type || '') === String(input.type || '');
  }).slice().sort(function (left, right) {
    return Number(left.Sort_Order || 0) - Number(right.Sort_Order || 0) ||
      String(left.Option_ID || '').localeCompare(String(right.Option_ID || ''));
  });
  var currentIds = sameType.map(function (row) { return String(row.Option_ID || ''); });
  var expectedIds = (input.expectedOrderIds || []).map(String);
  var orderedIds = (input.orderedIds || []).map(String);
  var uniqueOrdered = {};
  orderedIds.forEach(function (id) {
    kspAssert_(!uniqueOrdered[id], 'OPTION_REORDER_IDS_INVALID', '並び順に重複IDがあります。');
    uniqueOrdered[id] = true;
  });
  kspAssert_(currentIds.length === expectedIds.length && currentIds.every(function (id, index) {
    return id === expectedIds[index];
  }), 'OPTION_REORDER_CONFLICT', '並び順が他の更新で変更されています。再読込してください。');
  kspAssert_(orderedIds.length === currentIds.length && currentIds.every(function (id) {
    return Boolean(uniqueOrdered[id]);
  }), 'OPTION_REORDER_SET_MISMATCH', '並び順のID一覧が現在のMasterと一致しません。');

  var orderById = {};
  orderedIds.forEach(function (id, index) { orderById[id] = index + 1; });
  var plannedRows = (rows || []).map(function (row) {
    var copy = kspDeepClone_(row);
    if (String(copy.Type || '') === String(input.type || '')) {
      copy.Sort_Order = orderById[String(copy.Option_ID || '')];
      copy.Updated_At = nowIso;
      copy.Updated_By = actor;
    }
    return copy;
  });
  var affectedRowsById = {};
  plannedRows.filter(function (row) { return String(row.Type || '') === String(input.type || ''); })
    .forEach(function (row) { affectedRowsById[String(row.Option_ID || '')] = row; });
  var affectedRows = orderedIds.map(function (id) { return kspDeepClone_(affectedRowsById[id]); });
  return {
    rows: plannedRows,
    before: kspDeepClone_(sameType[0]),
    after: kspDeepClone_(affectedRows[0]),
    affectedBefore: sameType.map(kspDeepClone_),
    affectedRows: affectedRows
  };
}

function kspBuildMaintenanceAuditRow_(params) {
  var options = params || {};
  return {
    Event_Timestamp: kspCanonicalInstantIso_(options.timestamp),
    Actor: options.actor || 'UNIDENTIFIED',
    Action: options.action || '',
    Target_Type: options.targetType || '',
    Target_ID: options.targetId || '',
    Result: options.result || KSP_AUDIT_RESULTS.FAILURE,
    Changed_Fields: (options.changedFields || []).join(','),
    Before_Metadata_JSON: options.before ? JSON.stringify(options.before) : '',
    After_Metadata_JSON: options.after ? JSON.stringify(options.after) : '',
    Batch_ID: options.batchId || '',
    Error_Code: options.errorCode || '',
    Error_Message: options.errorCode ? kspSafePublicErrorMessage_(options.errorCode, 'MAINTENANCE') : '',
    Search_Mode: '', Question_Or_Instruction: '', Date_From: '', Date_To: '',
    GP_Filter: '', Counterparty_Filter: '', Counterparty_Type_Filter: '',
    Asset_Class_Filter: '', Capital_Type_Filter: '', Source_Type_Filter: '',
    Model_ID: '', Cited_Source_IDs: ''
  };
}

function kspMeetingAuditSnapshot_(row) {
  return {
    Meeting_ID: row.Meeting_ID || '', Date: kspMaintenanceCellText_(row.Date, 'date'),
    Time: kspMaintenanceCellText_(row.Time, 'time'),
    Location_ID: row.Location_ID || '', GP_ID: row.GP_ID || '',
    Counterparty_Type: kspMeetingCounterpartyType_(row),
    Counterparty_ID: kspMeetingCounterpartyId_(row),
    Related_GP_IDs: kspMeetingRelatedGpIds_(row),
    Asset_Class_ID: row.Asset_Class_ID || '', Capital_Type_ID: row.Capital_Type_ID || '',
    Team_ID: row.Team_ID || '', Fund_Strategy: row.Fund_Strategy || '',
    Meeting_Type_Codes: row.Meeting_Type_Codes || '', Related_Pitchbook_IDs: row.Related_Pitchbook_IDs || '',
    Follow_Up_Required: kspToBoolean_(row.Follow_Up_Required, false),
    Counterparty: row.Counterparty || '', Internal_Participants: row.Internal_Participants || '',
    Doc_File_ID: row.Doc_File_ID || '', Doc_URL: row.Doc_URL || '',
    Saved_Filename: row.Saved_Filename || '', Status: row.Status || '',
    Version: Number(row.Version || 0), Updated_At: kspCanonicalInstantIso_(row.Updated_At)
  };
}

function kspPitchbookAuditSnapshot_(row) {
  return {
    Document_ID: row.Document_ID || '', Batch_ID: row.Batch_ID || '', Date: kspCanonicalBusinessDate_(row.Date),
    GP_ID: row.GP_ID || '', Counterparty_ID: kspMeetingCounterpartyId_(row),
    Asset_Class_ID: row.Asset_Class_ID || '',
    Capital_Type_ID: row.Capital_Type_ID || '', Fund_Strategy: row.Fund_Strategy || '', Sequence_No: Number(row.Sequence_No || 0),
    File_ID: row.File_ID || '', File_URL: row.File_URL || '',
    Original_Filename: row.Original_Filename || '', Saved_Filename: row.Saved_Filename || '',
    Status: row.Status || '', Updated_At: kspCanonicalInstantIso_(row.Updated_At)
  };
}

function kspMasterAuditSnapshot_(entity, row) {
  if (entity === KSP_MASTER_ENTITY.COUNTERPARTY) {
    return { Counterparty_ID: row.Counterparty_ID || '', Counterparty_Name: row.Counterparty_Name || '',
      Counterparty_Type: row.Counterparty_Type || '', Status: row.Status || '',
      Updated_At: kspCanonicalInstantIso_(row.Updated_At) };
  }
  return {
    Option_ID: row.Option_ID || '', Type: row.Type || '', Name: row.Name || '',
    Sort_Order: Number(row.Sort_Order || 0), Status: row.Status || '', Updated_At: kspCanonicalInstantIso_(row.Updated_At)
  };
}

function kspOptionOrderAuditSnapshot_(rows) {
  return (rows || []).map(function (row) {
    return { Option_ID: row.Option_ID || '', Type: row.Type || '', Name: row.Name || '', Sort_Order: Number(row.Sort_Order || 0) };
  }).sort(function (left, right) {
    if (left.Type !== right.Type) return left.Type.localeCompare(right.Type);
    if (left.Sort_Order !== right.Sort_Order) return left.Sort_Order - right.Sort_Order;
    return left.Option_ID.localeCompare(right.Option_ID);
  });
}

function kspChangedMetadataFields_(before, after) {
  var keys = kspUniqueStrings_(Object.keys(before || {}).concat(Object.keys(after || {})));
  return keys.filter(function (key) {
    return JSON.stringify((before || {})[key]) !== JSON.stringify((after || {})[key]);
  });
}

function kspActorKind_(actor) {
  var value = String(actor || 'UNIDENTIFIED');
  if (value.indexOf('TEMP_USER:') === 0) return 'TEMP_USER';
  if (value === 'UNIDENTIFIED') return 'UNIDENTIFIED';
  return 'EMAIL';
}

function kspBuildSchemaDiagnostic_(expectedSchemas, actualBySheet) {
  return Object.keys(expectedSchemas || {}).map(function (sheetName) {
    var actual = (actualBySheet && actualBySheet[sheetName]) || [];
    var missing = expectedSchemas[sheetName].filter(function (header) { return actual.indexOf(header) === -1; });
    return { sheet: sheetName, present: actual.length > 0, missingColumns: missing, ok: missing.length === 0 };
  });
}

function kspAuditRetentionCutoff_(nowIso, years) {
  var canonicalNowIso = kspCanonicalInstantIso_(nowIso);
  kspAssert_(canonicalNowIso, 'AUDIT_RETENTION_NOW_INVALID', '基準日時が不正です。');
  var now = new Date(canonicalNowIso);
  var cutoff = new Date(now.getTime());
  cutoff.setUTCFullYear(cutoff.getUTCFullYear() - Number(years || KSP_AUDIT_RETENTION_YEARS));
  return kspCanonicalInstantIso_(cutoff);
}
// ===== END src/100_MaintenanceCore.gs =====

// ===== BEGIN src/110_MaintenanceMeetingService.gs =====
function kspGetPhase1Diagnostics_(environment) {
  try {
    var state = environment.getInstallationState();
    kspAssert_(state && state.resources, 'INSTALLATION_STATE_MISSING', 'Installation stateがありません。');
    var backendId = state.resources[KSP_RESOURCE_KEYS.BACKEND_SPREADSHEET] || '';
    var auditId = state.resources[KSP_RESOURCE_KEYS.AUDIT_SPREADSHEET] || '';
    var backendHeaders = {};
    var auditHeaders = {};
    Object.keys(kspGetBackendSchemas_()).forEach(function (sheetName) {
      backendHeaders[sheetName] = environment.getSheetHeaders(backendId, sheetName);
    });
    Object.keys(kspGetAuditSchema_()).forEach(function (sheetName) {
      auditHeaders[sheetName] = environment.getSheetHeaders(auditId, sheetName);
    });
    var backendChecks = kspBuildSchemaDiagnostic_(kspGetBackendSchemas_(), backendHeaders);
    var auditChecks = kspBuildSchemaDiagnostic_(kspGetAuditSchema_(), auditHeaders);
    var actorWarnings = [];
    var actor = kspGetMaintenanceActorSafely_(environment, actorWarnings);
    var resourceSeparation = Boolean(backendId && auditId && backendId !== auditId);
    var schemasHealthy = backendChecks.concat(auditChecks).every(function (check) { return check.ok; });
    return {
      ok: true,
      workId: KSP_MAINTENANCE_WORK_ID,
      healthy: resourceSeparation && schemasHealthy,
      resources: {
        backendConfigured: Boolean(backendId),
        auditConfigured: Boolean(auditId),
        backendAuditSeparated: resourceSeparation
      },
      schemas: { backend: backendChecks, audit: auditChecks },
      actor: { kind: kspActorKind_(actor), warningCount: actorWarnings.length },
      capabilities: {
        setup: true,
        meetingRegistration: true,
        pitchbookRegistration: true,
        meetingMaintenance: true,
        pitchbookMaintenance: true,
        masterManagement: true,
        auditRetentionCleanup: true,
        geminiFileSearch: false,
        liveQualified: false
      }
    };
  } catch (error) {
    return kspMaintenanceFailure_(error);
  }
}

function kspGetPhase1MaintenanceBootstrap_(environment) {
  try {
    var context = kspLoadMaintenanceContext_(environment);
    return {
      ok: true,
      workId: KSP_MAINTENANCE_WORK_ID,
      appVersion: KSP_MAINTENANCE_APP_VERSION,
      options: kspBuildMeetingBootstrapResponse_(context.catalog).options,
      statuses: [KSP_STATUS.ACTIVE, KSP_STATUS.INACTIVE, KSP_PITCHBOOK_STATUS.PENDING, KSP_PITCHBOOK_STATUS.FAILED],
      optionTypes: [KSP_OPTION_TYPES.ASSET_CLASS, KSP_OPTION_TYPES.CAPITAL_TYPE,
        KSP_OPTION_TYPES.LOCATION, KSP_OPTION_TYPES.TEAM],
      masters: kspBuildMasterResponse_(kspContextCounterpartyRows_(context), context.optionRows)
    };
  } catch (error) {
    return kspMaintenanceFailure_(error);
  }
}

function kspSearchMeetingRecords_(environment, rawSearch) {
  try {
    var context = kspLoadMaintenanceContext_(environment);
    var search = kspValidateRecordSearch_(kspNormalizeRecordSearch_(rawSearch));
    var maps = kspBuildAllMasterMaps_(kspContextCounterpartyRows_(context), context.optionRows);
    return {
      ok: true,
      workId: KSP_MAINTENANCE_WORK_ID,
      records: kspSearchRows_(context.meetingRows, search, function (row) {
        return kspMapMeetingSearchResult_(row, maps);
      })
    };
  } catch (error) {
    return kspMaintenanceFailure_(error);
  }
}

function kspSearchPitchbookRecords_(environment, rawSearch) {
  try {
    var context = kspLoadMaintenanceContext_(environment);
    var search = kspNormalizeRecordSearch_(rawSearch);
    search.teamId = '';
    search.meetingTypeCode = '';
    search.meetingTypeCodes = [];
    search.followUpOnly = false;
    search = kspValidateRecordSearch_(search);
    var maps = kspBuildAllMasterMaps_(kspContextCounterpartyRows_(context), context.optionRows);
    return {
      ok: true,
      workId: KSP_MAINTENANCE_WORK_ID,
      records: kspSearchRows_(context.pitchbookRows, search, function (row) {
        return kspMapPitchbookSearchResult_(row, maps);
      })
    };
  } catch (error) {
    return kspMaintenanceFailure_(error);
  }
}

function kspGetMeetingMaintenanceRecord_(environment, meetingId) {
  try {
    var context = kspLoadMaintenanceContext_(environment);
    var row = kspRequireSingleRow_(context.meetingRows, 'Meeting_ID', meetingId, 'MEETING_NOT_FOUND');
    var text = environment.getDocumentText(String(row.Doc_File_ID || ''));
    var parsed = kspParseMeetingDocumentText_(text);
    var maps = kspBuildAllMasterMaps_(kspContextCounterpartyRows_(context), context.optionRows);
    var record = kspMapMeetingSearchResult_(row, maps);
    record.notes = parsed.notes;
    record.relatedPitchbooks = kspBuildMaintenanceRelatedPitchbookChoices_(
      context.pitchbookRows, record.counterpartyId, row.Asset_Class_ID, record.relatedPitchbookIds
    );
    return { ok: true, workId: KSP_MAINTENANCE_WORK_ID, record: record };
  } catch (error) {
    return kspMaintenanceFailure_(error);
  }
}

function kspUpdateMeetingMaintenance_(environment, rawInput) {
  var warnings = [];
  var actor = kspGetMaintenanceActorSafely_(environment, warnings);
  var context = null;
  var claim = null;
  var snapshot = null;
  var currentRow = null;
  try {
    context = kspLoadMaintenanceContext_(environment);
    var input = kspNormalizeMeetingEditInput_(rawInput);
    claim = environment.claimRecordEdit(
      'Meeting', input.meetingId, KSP_SHEET_NAMES.MEETING_INDEX,
      'Meeting_ID', 'Version', input.expectedVersion, environment.nowIso(), KSP_MAINTENANCE_LIMITS.EDIT_CLAIM_TTL_MS
    );
    currentRow = claim.row;
    var currentTeamId = String(currentRow.Team_ID || '');
    context.catalog.teams = (context.catalog.teams || []).filter(function (team) {
      return String(team.status || '') === KSP_STATUS.ACTIVE || String(team.id || '') === currentTeamId;
    });
    var currentCounterpartyId = kspMeetingCounterpartyId_(currentRow);
    context.catalog.counterpartyEntities = (context.catalog.counterpartyEntities || []).filter(function (entity) {
      return String(entity.status || '') === KSP_STATUS.ACTIVE || String(entity.id || '') === currentCounterpartyId;
    });
    context.catalog.relatedPitchbooks = kspBuildMaintenanceRelatedPitchbookChoices_(
      context.pitchbookRows, input.counterpartyId, input.assetClassId,
      kspMaintenanceSplitCodes_(currentRow.Related_Pitchbook_IDs)
    );
    var selected = kspValidateMeetingEditInput_(input, context.catalog);
    input.counterpartyType = selected.counterpartyEntity.type;
    kspAssert_(String(currentRow.Status || '') === KSP_STATUS.ACTIVE,
      'MEETING_NOT_ACTIVE', 'Activeな面談だけ編集できます。');
    var filename = kspBuildMeetingFilename_(input, selected, input.meetingId);
    var documentText = kspBuildMeetingDocumentText_(input, selected);
    snapshot = environment.getDocumentSnapshot(String(currentRow.Doc_File_ID || ''));
    environment.updateMeetingDocument(String(currentRow.Doc_File_ID || ''), filename, documentText);
    var nowIso = environment.nowIso();
    var updatedRow = kspBuildMeetingEditedRow_(currentRow, input, actor, nowIso, filename);
    var committed = environment.commitClaimedRowEdit(
      claim, KSP_SHEET_NAMES.MEETING_INDEX, 'Meeting_ID', input.meetingId,
      'Version', input.expectedVersion, updatedRow
    );
    kspTryMaintenanceAudit_(environment, context.auditSpreadsheetId, {
      timestamp: environment.nowIso(), actor: actor, action: KSP_MAINTENANCE_ACTIONS.MEETING_UPDATE,
      targetType: 'Meeting', targetId: input.meetingId, result: KSP_AUDIT_RESULTS.SUCCESS,
      before: kspMeetingAuditSnapshot_(currentRow), after: kspMeetingAuditSnapshot_(committed),
      changedFields: kspChangedMetadataFields_(kspMeetingAuditSnapshot_(currentRow), kspMeetingAuditSnapshot_(committed))
    }, warnings);
    return { ok: true, workId: KSP_MAINTENANCE_WORK_ID,
      record: kspMapMeetingSearchResult_(committed, kspBuildCatalogMaps_(context.catalog)), warnings: warnings };
  } catch (error) {
    if (snapshot && currentRow) {
      try {
        if (!claim || environment.isRecordEditClaimOwned(claim)) {
          environment.restoreDocumentSnapshot(String(currentRow.Doc_File_ID || ''), snapshot);
        } else {
          warnings.push({ code: 'MEETING_DOCUMENT_RESTORE_SKIPPED', message: '編集権が別処理へ移ったため、古いDoc snapshotの復元を行いませんでした。' });
        }
      } catch (restoreError) { warnings.push({ code: 'MEETING_DOCUMENT_RESTORE_FAILED', message: kspSafeOperationalWarning_('MEETING_DOCUMENT_RESTORE_FAILED') }); }
    }
    if (claim) {
      try { environment.releaseRecordEditClaim(claim); }
      catch (releaseError) { warnings.push({ code: 'MEETING_EDIT_CLAIM_RELEASE_FAILED', message: kspSafeOperationalWarning_('MEETING_EDIT_CLAIM_RELEASE_FAILED') }); }
    }
    if (context) {
      kspTryMaintenanceAudit_(environment, context.auditSpreadsheetId, {
        timestamp: environment.nowIso(), actor: actor, action: KSP_MAINTENANCE_ACTIONS.MEETING_UPDATE,
        targetType: 'Meeting', targetId: rawInput && rawInput.meetingId,
        result: KSP_AUDIT_RESULTS.FAILURE, errorCode: kspGetErrorCode_(error), errorMessage: kspSafePublicErrorMessage_(kspGetErrorCode_(error), 'MAINTENANCE')
      }, warnings);
    }
    return kspMaintenanceFailure_(error, warnings);
  }
}

function kspChangeMeetingStatus_(environment, rawInput) {
  var warnings = [];
  var actor = kspGetMaintenanceActorSafely_(environment, warnings);
  var context = null;
  try {
    context = kspLoadMaintenanceContext_(environment);
    var input = rawInput || {};
    var meetingId = kspMaintenanceTrim_(input.meetingId);
    var expectedVersion = Number(input.expectedVersion);
    kspAssert_(Number.isFinite(expectedVersion) && expectedVersion > 0 && Math.floor(expectedVersion) === expectedVersion,
      'MEETING_EXPECTED_VERSION_INVALID', 'Meeting Versionが不正です。');
    var targetStatus = kspMaintenanceTrim_(input.targetStatus);
    kspParseMeetingId_(meetingId);
    kspAssert_(targetStatus === KSP_STATUS.ACTIVE || targetStatus === KSP_STATUS.INACTIVE,
      'MEETING_TARGET_STATUS_INVALID', '面談Statusが不正です。');
    var result = environment.updateStatusAtomic(
      KSP_SHEET_NAMES.MEETING_INDEX, 'Meeting_ID', meetingId,
      'Version', expectedVersion, targetStatus, actor, environment.nowIso()
    );
    var action = targetStatus === KSP_STATUS.ACTIVE
      ? KSP_MAINTENANCE_ACTIONS.MEETING_REACTIVATE : KSP_MAINTENANCE_ACTIONS.MEETING_DEACTIVATE;
    kspTryMaintenanceAudit_(environment, context.auditSpreadsheetId, {
      timestamp: environment.nowIso(), actor: actor, action: action,
      targetType: 'Meeting', targetId: meetingId, result: KSP_AUDIT_RESULTS.SUCCESS,
      before: kspMeetingAuditSnapshot_(result.before), after: kspMeetingAuditSnapshot_(result.after),
      changedFields: ['Status', 'Version', 'Updated_At', 'Updated_By', 'AI_Index_Status']
    }, warnings);
    return { ok: true, workId: KSP_MAINTENANCE_WORK_ID,
      record: kspMapMeetingSearchResult_(result.after, kspBuildCatalogMaps_(context.catalog)), warnings: warnings };
  } catch (error) {
    if (context) kspTryMaintenanceAudit_(environment, context.auditSpreadsheetId, {
      timestamp: environment.nowIso(), actor: actor,
      action: rawInput && rawInput.targetStatus === KSP_STATUS.ACTIVE
        ? KSP_MAINTENANCE_ACTIONS.MEETING_REACTIVATE : KSP_MAINTENANCE_ACTIONS.MEETING_DEACTIVATE,
      targetType: 'Meeting', targetId: rawInput && rawInput.meetingId,
      result: KSP_AUDIT_RESULTS.FAILURE, errorCode: kspGetErrorCode_(error), errorMessage: kspSafePublicErrorMessage_(kspGetErrorCode_(error), 'MAINTENANCE')
    }, warnings);
    return kspMaintenanceFailure_(error, warnings);
  }
}
// ===== END src/110_MaintenanceMeetingService.gs =====

// ===== BEGIN src/111_MaintenancePitchbookMasterService.gs =====
function kspGetPitchbookMaintenanceRecord_(environment, documentId) {
  try {
    var context = kspLoadMaintenanceContext_(environment);
    var row = kspRequireSingleRow_(context.pitchbookRows, 'Document_ID', documentId, 'PITCHBOOK_NOT_FOUND');
    return { ok: true, workId: KSP_MAINTENANCE_WORK_ID,
      record: kspMapPitchbookSearchResult_(row, kspBuildCatalogMaps_(context.catalog)) };
  } catch (error) {
    return kspMaintenanceFailure_(error);
  }
}

function kspUpdatePitchbookMaintenance_(environment, rawInput) {
  var warnings = [];
  var actor = kspGetMaintenanceActorSafely_(environment, warnings);
  var context = null;
  var claim = null;
  var fileSnapshot = null;
  var currentRow = null;
  try {
    context = kspLoadMaintenanceContext_(environment);
    var input = kspNormalizePitchbookEditInput_(rawInput);
    var storedContext = kspRequireSingleRow_(context.pitchbookRows, 'Document_ID', input.documentId, 'PITCHBOOK_NOT_FOUND');
    if (storedContext.Parent_Meeting_ID) {
      input.counterpartyId = kspMeetingCounterpartyId_(storedContext);
    }
    var selected = kspValidatePitchbookEditInput_(input, context.catalog);
    input.counterpartyType = selected.counterpartyEntity.type;
    claim = environment.claimRecordEdit(
      'Pitchbook', input.documentId, KSP_SHEET_NAMES.PITCHBOOK_INDEX,
      'Document_ID', 'Updated_At', input.expectedUpdatedAt, environment.nowIso(), KSP_MAINTENANCE_LIMITS.EDIT_CLAIM_TTL_MS
    );
    currentRow = claim.row;
    kspAssert_(String(currentRow.File_ID || ''), 'PITCHBOOK_AUTHORITATIVE_FILE_MISSING',
      'Drive原本がない資料はメタデータ編集できません。');
    var sequenceNo = Number(currentRow.Sequence_No || 0);
    if (kspPitchbookContextChanged_(currentRow, input)) {
      sequenceNo = environment.reservePitchbookEditSequence(claim, input);
    }
    var filename = kspBuildPitchbookSavedFilename_(input, selected, sequenceNo, currentRow.Original_Filename);
    fileSnapshot = environment.getDriveFileSnapshot(String(currentRow.File_ID));
    environment.renameDriveFile(String(currentRow.File_ID), filename);
    var nowIso = environment.nowIso();
    var updatedRow = kspBuildPitchbookEditedRow_(currentRow, input, actor, nowIso, sequenceNo, filename);
    var committed = environment.commitClaimedPitchbookEdit(
      claim, input.documentId, input.expectedUpdatedAt, updatedRow
    );
    kspTryMaintenanceAudit_(environment, context.auditSpreadsheetId, {
      timestamp: environment.nowIso(), actor: actor, action: KSP_MAINTENANCE_ACTIONS.PITCHBOOK_UPDATE,
      targetType: 'Pitchbook', targetId: input.documentId, batchId: currentRow.Batch_ID,
      result: KSP_AUDIT_RESULTS.SUCCESS, before: kspPitchbookAuditSnapshot_(currentRow),
      after: kspPitchbookAuditSnapshot_(committed),
      changedFields: kspChangedMetadataFields_(kspPitchbookAuditSnapshot_(currentRow), kspPitchbookAuditSnapshot_(committed))
    }, warnings);
    return { ok: true, workId: KSP_MAINTENANCE_WORK_ID,
      record: kspMapPitchbookSearchResult_(committed, kspBuildCatalogMaps_(context.catalog)), warnings: warnings };
  } catch (error) {
    if (fileSnapshot && currentRow) {
      try {
        if (!claim || environment.isRecordEditClaimOwned(claim)) {
          environment.restoreDriveFileSnapshot(String(currentRow.File_ID || ''), fileSnapshot);
        } else {
          warnings.push({ code: 'PITCHBOOK_FILENAME_RESTORE_SKIPPED', message: '編集権が別処理へ移ったため、古いfilename snapshotの復元を行いませんでした。' });
        }
      } catch (restoreError) { warnings.push({ code: 'PITCHBOOK_FILENAME_RESTORE_FAILED', message: kspSafeOperationalWarning_('PITCHBOOK_FILENAME_RESTORE_FAILED') }); }
    }
    if (claim) {
      try { environment.releaseRecordEditClaim(claim); }
      catch (releaseError) { warnings.push({ code: 'PITCHBOOK_EDIT_CLAIM_RELEASE_FAILED', message: kspSafeOperationalWarning_('PITCHBOOK_EDIT_CLAIM_RELEASE_FAILED') }); }
    }
    if (context) kspTryMaintenanceAudit_(environment, context.auditSpreadsheetId, {
      timestamp: environment.nowIso(), actor: actor, action: KSP_MAINTENANCE_ACTIONS.PITCHBOOK_UPDATE,
      targetType: 'Pitchbook', targetId: rawInput && rawInput.documentId,
      result: KSP_AUDIT_RESULTS.FAILURE, errorCode: kspGetErrorCode_(error), errorMessage: kspSafePublicErrorMessage_(kspGetErrorCode_(error), 'MAINTENANCE')
    }, warnings);
    return kspMaintenanceFailure_(error, warnings);
  }
}

function kspChangePitchbookStatus_(environment, rawInput) {
  var warnings = [];
  var actor = kspGetMaintenanceActorSafely_(environment, warnings);
  var context = null;
  try {
    context = kspLoadMaintenanceContext_(environment);
    var input = rawInput || {};
    var documentId = kspMaintenanceTrim_(input.documentId);
    var expectedUpdatedAt = kspMaintenanceTrim_(input.expectedUpdatedAt);
    kspAssert_(expectedUpdatedAt, 'PITCHBOOK_EXPECTED_UPDATED_AT_REQUIRED', '更新トークンがありません。');
    var targetStatus = kspMaintenanceTrim_(input.targetStatus);
    kspParseDocumentId_(documentId);
    kspAssert_(targetStatus === KSP_STATUS.ACTIVE || targetStatus === KSP_STATUS.INACTIVE,
      'PITCHBOOK_TARGET_STATUS_INVALID', 'Pitchbook Statusが不正です。');
    var result = environment.updatePitchbookStatusAtomic(
      documentId, expectedUpdatedAt, targetStatus, actor, environment.nowIso()
    );
    var action = targetStatus === KSP_STATUS.ACTIVE
      ? KSP_MAINTENANCE_ACTIONS.PITCHBOOK_REACTIVATE : KSP_MAINTENANCE_ACTIONS.PITCHBOOK_DEACTIVATE;
    kspTryMaintenanceAudit_(environment, context.auditSpreadsheetId, {
      timestamp: environment.nowIso(), actor: actor, action: action,
      targetType: 'Pitchbook', targetId: documentId, batchId: result.after.Batch_ID,
      result: KSP_AUDIT_RESULTS.SUCCESS, before: kspPitchbookAuditSnapshot_(result.before),
      after: kspPitchbookAuditSnapshot_(result.after),
      changedFields: ['Status', 'Updated_At', 'Updated_By', 'AI_Index_Status']
    }, warnings);
    return { ok: true, workId: KSP_MAINTENANCE_WORK_ID,
      record: kspMapPitchbookSearchResult_(result.after, kspBuildCatalogMaps_(context.catalog)), warnings: warnings };
  } catch (error) {
    if (context) kspTryMaintenanceAudit_(environment, context.auditSpreadsheetId, {
      timestamp: environment.nowIso(), actor: actor,
      action: rawInput && rawInput.targetStatus === KSP_STATUS.ACTIVE
        ? KSP_MAINTENANCE_ACTIONS.PITCHBOOK_REACTIVATE : KSP_MAINTENANCE_ACTIONS.PITCHBOOK_DEACTIVATE,
      targetType: 'Pitchbook', targetId: rawInput && rawInput.documentId,
      result: KSP_AUDIT_RESULTS.FAILURE, errorCode: kspGetErrorCode_(error), errorMessage: kspSafePublicErrorMessage_(kspGetErrorCode_(error), 'MAINTENANCE')
    }, warnings);
    return kspMaintenanceFailure_(error, warnings);
  }
}

function kspMutateMaster_(environment, rawInput) {
  var warnings = [];
  var actor = kspGetMaintenanceActorSafely_(environment, warnings);
  var context = null;
  try {
    context = kspLoadMaintenanceContext_(environment);
    var input = kspValidateMasterMutation_(kspNormalizeMasterMutation_(rawInput));
    var result = environment.mutateMasterAtomic(input, actor, environment.nowIso());
    var action = kspMasterActionName_(input);
    var beforeAudit = result.before ? kspMasterAuditSnapshot_(input.entity, result.before) : null;
    var afterAudit = kspMasterAuditSnapshot_(input.entity, result.after);
    var changedFields = result.before
      ? kspChangedMetadataFields_(beforeAudit, afterAudit)
      : Object.keys(afterAudit);
    if (input.entity === KSP_MASTER_ENTITY.OPTION && input.action === KSP_MASTER_MUTATION.REORDER) {
      beforeAudit = { moved: beforeAudit, affectedOptions: kspOptionOrderAuditSnapshot_(result.affectedBefore) };
      afterAudit = { moved: afterAudit, affectedOptions: kspOptionOrderAuditSnapshot_(result.affectedRows) };
      changedFields = ['Option_Order'];
    } else if (input.entity === KSP_MASTER_ENTITY.OPTION && input.action === KSP_MASTER_MUTATION.REORDER_BATCH) {
      beforeAudit = { affectedOptions: kspOptionOrderAuditSnapshot_(result.affectedBefore) };
      afterAudit = { affectedOptions: kspOptionOrderAuditSnapshot_(result.affectedRows) };
      changedFields = ['Option_Order'];
    }
    kspTryMaintenanceAudit_(environment, context.auditSpreadsheetId, {
      timestamp: environment.nowIso(), actor: actor, action: action,
      targetType: input.entity === KSP_MASTER_ENTITY.COUNTERPARTY ? 'Counterparty_Master' : 'Option_Master',
      targetId: input.action === KSP_MASTER_MUTATION.REORDER_BATCH ? input.type :
        (input.entity === KSP_MASTER_ENTITY.COUNTERPARTY ? result.after.Counterparty_ID : result.after.Option_ID),
      result: KSP_AUDIT_RESULTS.SUCCESS,
      before: beforeAudit,
      after: afterAudit,
      changedFields: changedFields
    }, warnings);
    var refreshed = kspLoadMaintenanceContext_(environment);
    return { ok: true, workId: KSP_MAINTENANCE_WORK_ID,
      record: result.after, masters: kspBuildMasterResponse_(refreshed.counterpartyRows, refreshed.optionRows), warnings: warnings };
  } catch (error) {
    if (context) kspTryMaintenanceAudit_(environment, context.auditSpreadsheetId, {
      timestamp: environment.nowIso(), actor: actor,
      action: kspMasterActionName_(kspNormalizeMasterMutation_(rawInput || {})),
      targetType: rawInput && rawInput.entity,
      targetId: rawInput && (rawInput.action === KSP_MASTER_MUTATION.REORDER_BATCH ? rawInput.type : rawInput.id),
      result: KSP_AUDIT_RESULTS.FAILURE, errorCode: kspGetErrorCode_(error), errorMessage: kspSafePublicErrorMessage_(kspGetErrorCode_(error), 'MAINTENANCE')
    }, warnings);
    return kspMaintenanceFailure_(error, warnings);
  }
}

function kspQuickAddCounterparty_(environment, name, type) {
  var result = kspMutateMaster_(environment, { entity: KSP_MASTER_ENTITY.COUNTERPARTY,
    action: KSP_MASTER_MUTATION.ADD, name: name, type: type, returnExistingOnDuplicate: true });
  if (result.ok) result.counterparty = { id: result.record.Counterparty_ID,
    name: result.record.Counterparty_Name, type: result.record.Counterparty_Type, status: result.record.Status };
  return result;
}

function kspQuickAddGp_(environment, name) {
  return kspQuickAddCounterparty_(environment, name, 'GP');
}

function kspRunAuditRetentionCleanup_(environment) {
  var warnings = [];
  var actor = kspGetMaintenanceActorSafely_(environment, warnings);
  var context = null;
  try {
    context = kspLoadMaintenanceContext_(environment);
    var nowIso = environment.nowIso();
    var cutoff = kspAuditRetentionCutoff_(nowIso, KSP_AUDIT_RETENTION_YEARS);
    var result = environment.deleteAuditRowsBefore(context.auditSpreadsheetId, cutoff);
    kspTryMaintenanceAudit_(environment, context.auditSpreadsheetId, {
      timestamp: environment.nowIso(), actor: actor, action: KSP_MAINTENANCE_ACTIONS.AUDIT_RETENTION_CLEANUP,
      targetType: 'Audit_Log', targetId: '', result: KSP_AUDIT_RESULTS.SUCCESS,
      after: { cutoff: cutoff, deletedRows: result.deletedRows }, changedFields: ['deletedRows']
    }, warnings);
    return { ok: true, workId: KSP_MAINTENANCE_WORK_ID,
      cutoff: cutoff, deletedRows: result.deletedRows, warnings: warnings };
  } catch (error) {
    return kspMaintenanceFailure_(error, warnings);
  }
}
// ===== END src/111_MaintenancePitchbookMasterService.gs =====

// ===== BEGIN src/112_MaintenanceServiceHelpers.gs =====
function kspWorkspaceSafeDriveLink_(value, fileId) {
  var candidate = String(value || '').trim();
  var expectedId = String(fileId || '').trim();
  if (!expectedId || !/^https:\/\/(?:drive|docs)\.google\.com\//i.test(candidate)) return '';
  var escapedId = expectedId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp('/d/' + escapedId + '(?:/|$)').test(candidate) ||
    new RegExp('[?&]id=' + escapedId + '(?:&|$)').test(candidate) ? candidate : '';
}

function kspBuildMaintenanceCatalog_(counterpartyRows, optionRows) {
  var counterparties = (counterpartyRows || []).map(function (row) {
    var legacyGp = String(row.GP_ID || '');
    return {
      id: String(row.Counterparty_ID || legacyGp),
      name: String(row.Counterparty_Name || row.GP_Name || ''),
      type: String(row.Counterparty_Type || (legacyGp ? 'GP' : '')),
      status: String(row.Status || '')
    };
  }).filter(function (row) { return row.id && row.name && row.type; })
    .sort(function (left, right) {
      return left.name.localeCompare(right.name, 'ja') || left.id.localeCompare(right.id);
    });
  var options = (optionRows || []).map(function (row) {
    return {
      id: String(row.Option_ID || ''),
      type: String(row.Type || ''),
      name: String(row.Name || ''),
      sortOrder: Number(row.Sort_Order || 0),
      status: String(row.Status || '')
    };
  }).filter(function (row) { return row.id && row.type && row.name; });
  function byType(type) {
    return options.filter(function (row) { return row.type === type; })
      .sort(function (left, right) {
        if (left.sortOrder !== right.sortOrder) return left.sortOrder - right.sortOrder;
        return left.name.localeCompare(right.name, 'ja');
      });
  }
  var counterpartyEntities = counterparties.map(function (counterparty) {
    return { id: counterparty.id, type: counterparty.type, name: counterparty.name,
      status: counterparty.status, entityKey: 'COUNTERPARTY:' + counterparty.id };
  });
  return {
    counterparties: counterparties,
    gps: counterparties.filter(function (item) { return item.type === 'GP'; }),
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

function kspLoadMaintenanceContext_(environment) {
  var state = environment.getInstallationState();
  kspAssert_(state && state.resources, 'INSTALLATION_STATE_MISSING', 'Installation stateがありません。');
  var backendSpreadsheetId = state.resources[KSP_RESOURCE_KEYS.BACKEND_SPREADSHEET];
  var auditSpreadsheetId = state.resources[KSP_RESOURCE_KEYS.AUDIT_SPREADSHEET];
  kspAssert_(backendSpreadsheetId, 'BACKEND_SPREADSHEET_MISSING', 'Backend Spreadsheetがありません。');
  kspAssert_(auditSpreadsheetId, 'AUDIT_SPREADSHEET_MISSING', 'Audit Spreadsheetがありません。');
  var counterpartyRows = environment.readRows(backendSpreadsheetId, KSP_SHEET_NAMES.COUNTERPARTY_MASTER);
  var optionRows = environment.readRows(backendSpreadsheetId, KSP_SHEET_NAMES.OPTION_MASTER);
  return {
    state: state,
    backendSpreadsheetId: backendSpreadsheetId,
    auditSpreadsheetId: auditSpreadsheetId,
    meetingRows: environment.readRows(backendSpreadsheetId, KSP_SHEET_NAMES.MEETING_INDEX),
    pitchbookRows: environment.readRows(backendSpreadsheetId, KSP_SHEET_NAMES.PITCHBOOK_INDEX),
    counterpartyRows: counterpartyRows,
    optionRows: optionRows,
    catalog: kspBuildMaintenanceCatalog_(counterpartyRows, optionRows)
  };
}

function kspRequireSingleRow_(rows, keyColumn, keyValue, notFoundCode) {
  var matches = (rows || []).filter(function (row) { return String(row[keyColumn]) === String(keyValue); });
  kspAssert_(matches.length <= 1, 'DUPLICATE_KEY_ROWS', '同じIDの行が複数あります: ' + keyValue);
  kspAssert_(matches.length === 1, notFoundCode, '対象レコードが見つかりません: ' + keyValue);
  return matches[0];
}

function kspBuildMasterResponse_(counterpartyRows, optionRows) {
  var counterparties = (counterpartyRows || []).map(function (row) {
    var legacyGp = String(row.GP_ID || '');
    return { id: String(row.Counterparty_ID || legacyGp), name: String(row.Counterparty_Name || row.GP_Name || ''),
      type: String(row.Counterparty_Type || (legacyGp ? 'GP' : '')), status: String(row.Status || ''),
      updatedAt: kspCanonicalInstantIso_(row.Updated_At) };
  }).sort(function (left, right) { return left.name.localeCompare(right.name, 'ja') || left.id.localeCompare(right.id); });
  var options = (optionRows || []).map(function (row) {
    return { id: String(row.Option_ID || ''), type: String(row.Type || ''), name: String(row.Name || ''),
      sortOrder: Number(row.Sort_Order || 0), status: String(row.Status || ''), updatedAt: kspCanonicalInstantIso_(row.Updated_At) };
  }).sort(function (left, right) {
    if (left.type !== right.type) return left.type.localeCompare(right.type);
    if (left.sortOrder !== right.sortOrder) return left.sortOrder - right.sortOrder;
    return left.name.localeCompare(right.name, 'ja');
  });
  return { counterparties: counterparties, options: options };
}

function kspGetMaintenanceActorSafely_(environment, warnings) {
  try { return environment.getActor() || 'UNIDENTIFIED'; }
  catch (error) { warnings.push({ code: 'ACTOR_RESOLUTION_FAILED', message: kspSafeOperationalWarning_('ACTOR_RESOLUTION_FAILED') }); return 'UNIDENTIFIED'; }
}

function kspTryMaintenanceAudit_(environment, auditSpreadsheetId, params, warnings) {
  try { environment.appendRow(auditSpreadsheetId, KSP_SHEET_NAMES.AUDIT_LOG, kspBuildMaintenanceAuditRow_(params)); }
  catch (error) { warnings.push({ code: 'AUDIT_WRITE_FAILED', message: kspSafeOperationalWarning_('AUDIT_WRITE_FAILED') }); }
}

function kspMaintenanceFailure_(error, warnings) {
  return { ok: false, workId: KSP_MAINTENANCE_WORK_ID,
    error: { code: kspGetErrorCode_(error), message: kspSafePublicErrorMessage_(kspGetErrorCode_(error), 'MAINTENANCE') }, warnings: warnings || [] };
}

function kspMasterActionName_(input) {
  var entity = input && input.entity === KSP_MASTER_ENTITY.OPTION ? 'OPTION' : 'COUNTERPARTY';
  var action = input && input.action ? input.action : 'UNKNOWN';
  return KSP_MAINTENANCE_ACTIONS[entity + '_' + action] || (entity + '_' + action);
}
// ===== END src/112_MaintenanceServiceHelpers.gs =====

