function kspNormalizePitchbookBatchInput(input) {
  var source = input && typeof input === 'object' ? input : {};
  return {
    date: kspTrimPitchbookField(source.date),
    gpId: kspTrimPitchbookField(source.gpId),
    assetClassId: kspTrimPitchbookField(source.assetClassId),
    capitalTypeId: kspTrimPitchbookField(source.capitalTypeId),
    files: Array.isArray(source.files) ? source.files.map(kspNormalizePitchbookFileDescriptor) : []
  };
}

function kspNormalizePitchbookFileDescriptor(file, index) {
  var source = file && typeof file === 'object' ? file : {};
  return {
    ordinal: index + 1,
    originalFilename: kspTrimPitchbookField(source.originalFilename),
    sizeBytes: Number(source.sizeBytes),
    mimeType: kspTrimPitchbookField(source.mimeType) || 'application/octet-stream'
  };
}

function kspNormalizePitchbookUploadInput(input) {
  var source = input && typeof input === 'object' ? input : {};
  return {
    batchId: kspTrimPitchbookField(source.batchId),
    documentId: kspTrimPitchbookField(source.documentId),
    slotFingerprint: kspTrimPitchbookField(source.slotFingerprint),
    originalFilename: kspTrimPitchbookField(source.originalFilename),
    sizeBytes: Number(source.sizeBytes),
    mimeType: kspTrimPitchbookField(source.mimeType) || 'application/octet-stream',
    base64Data: kspNormalizeBase64Payload(source.base64Data)
  };
}

function kspTrimPitchbookField(value) {
  return value === null || value === undefined ? '' : String(value).trim();
}

function kspNormalizeBase64Payload(value) {
  var text = value === null || value === undefined ? '' : String(value).trim();
  var marker = text.indexOf('base64,');
  return marker === -1 ? text : text.slice(marker + 7);
}

function kspBuildPitchbookCatalog(gpRows, optionRows) {
  return kspBuildMeetingCatalog(gpRows, optionRows);
}

function kspValidatePitchbookBatchInput(input, catalog) {
  var safeCatalog = catalog || { gps: [], assetClasses: [], capitalTypes: [] };
  kspAssert(input.date, 'PITCHBOOK_DATE_REQUIRED', '日付は必須です。');
  kspAssert(input.gpId, 'PITCHBOOK_GP_REQUIRED', 'GPは必須です。');
  kspAssert(input.assetClassId, 'PITCHBOOK_ASSET_CLASS_REQUIRED', 'Asset Classは必須です。');
  kspAssert(kspIsValidDateKey(input.date), 'PITCHBOOK_DATE_INVALID', '日付はYYYY-MM-DD形式で入力してください。');
  kspAssert(input.files.length >= 1, 'PITCHBOOK_FILE_REQUIRED', 'ファイルを1つ以上選択してください。');
  kspAssert(input.files.length <= KSP_PITCHBOOK_LIMITS.FILE_COUNT, 'PITCHBOOK_FILE_COUNT_EXCEEDED',
    '1回に選択できるファイルは10件までです。');

  var totalBytes = 0;
  input.files.forEach(function (file) {
    kspValidatePitchbookFileDescriptor(file);
    totalBytes += file.sizeBytes;
  });
  kspAssert(totalBytes <= KSP_PITCHBOOK_LIMITS.TOTAL_BYTES, 'PITCHBOOK_TOTAL_SIZE_EXCEEDED',
    '1回の合計ファイルサイズは100MBまでです。');

  var selected = {
    gp: kspRequireCatalogItem(safeCatalog.gps, input.gpId, 'PITCHBOOK_GP_UNAVAILABLE', '選択されたGPは利用できません。'),
    assetClass: kspRequireCatalogItem(
      safeCatalog.assetClasses,
      input.assetClassId,
      'PITCHBOOK_ASSET_CLASS_UNAVAILABLE',
      '選択されたAsset Classは利用できません。'
    ),
    capitalType: null
  };
  if (input.capitalTypeId) {
    selected.capitalType = kspRequireCatalogItem(
      safeCatalog.capitalTypes,
      input.capitalTypeId,
      'PITCHBOOK_CAPITAL_TYPE_UNAVAILABLE',
      '選択されたEquity / Debtは利用できません。'
    );
  }
  return { selected: selected, totalBytes: totalBytes };
}

function kspValidatePitchbookFileDescriptor(file) {
  kspAssert(file.originalFilename, 'PITCHBOOK_FILENAME_REQUIRED', '元ファイル名がありません。');
  kspAssert(file.originalFilename.length <= 255, 'PITCHBOOK_FILENAME_TOO_LONG', 'ファイル名は255文字以内にしてください。');
  kspAssert(!/[\\/\u0000-\u001f\u007f]/.test(file.originalFilename), 'PITCHBOOK_FILENAME_UNSAFE',
    'ファイル名に使用できない文字が含まれています。');
  kspAssert(Number.isFinite(file.sizeBytes) && file.sizeBytes > 0 && Math.floor(file.sizeBytes) === file.sizeBytes,
    'PITCHBOOK_FILE_SIZE_INVALID', 'ファイルサイズが不正です。');
  kspAssert(file.sizeBytes <= KSP_PITCHBOOK_LIMITS.FILE_BYTES, 'PITCHBOOK_FILE_SIZE_EXCEEDED',
    '1ファイルの上限は25MBです。');
  var extension = kspGetPitchbookExtension(file.originalFilename);
  kspAssert(KSP_PITCHBOOK_ALLOWED_EXTENSIONS.indexOf(extension.toLowerCase()) !== -1,
    'PITCHBOOK_EXTENSION_UNSUPPORTED', '対応していないファイル形式です: .' + extension);
  return extension;
}

function kspValidatePitchbookUploadInput(input, row, reservation) {
  kspAssert(input.batchId && /^BAT-\d{6}$/.test(input.batchId), 'PITCHBOOK_BATCH_ID_INVALID', 'Batch IDが不正です。');
  kspParseDocumentId(input.documentId);
  kspAssert(/^[0-9a-f]{8}$/.test(input.slotFingerprint), 'PITCHBOOK_SLOT_FINGERPRINT_INVALID',
    'Upload slot fingerprintが不正です。');
  kspAssert(row, 'PITCHBOOK_SLOT_NOT_FOUND', 'Upload slotが見つかりません。');
  kspAssert(reservation, 'PITCHBOOK_RESERVATION_NOT_FOUND', 'Batch reservationが見つかりません。');
  var reservedFile = kspFindPitchbookReservationFile(reservation, input.documentId);
  kspAssert(reservedFile, 'PITCHBOOK_RESERVATION_FILE_NOT_FOUND', 'Document reservationが見つかりません。');
  kspAssert(String(row.Batch_ID) === input.batchId, 'PITCHBOOK_BATCH_CONFLICT', 'Batch IDが一致しません。');
  kspAssert(String(row.Original_Filename) === input.originalFilename, 'PITCHBOOK_FILENAME_CONFLICT',
    '選択されたファイル名が予約済みslotと一致しません。');
  kspAssert(String(row.Status) !== KSP_PITCHBOOK_STATUS.INACTIVE, 'PITCHBOOK_SLOT_INACTIVE',
    'Inactiveな資料へアップロードできません。');
  kspAssert(kspBuildPitchbookSlotFingerprint(row, reservedFile, reservation.totalBytes) === input.slotFingerprint, 'PITCHBOOK_SLOT_FINGERPRINT_CONFLICT',
    'Upload slotの内容が変更されています。');
  kspAssert(Number(reservedFile.sizeBytes) === input.sizeBytes, 'PITCHBOOK_FILE_SIZE_MISMATCH',
    '選択されたファイルサイズが予約時と一致しません。');
  kspAssert(String(reservedFile.mimeType || 'application/octet-stream') === input.mimeType, 'PITCHBOOK_MIME_TYPE_MISMATCH',
    '選択されたファイル形式が予約時と一致しません。');
  kspAssert(Number(reservation.totalBytes) <= KSP_PITCHBOOK_LIMITS.TOTAL_BYTES, 'PITCHBOOK_TOTAL_SIZE_EXCEEDED',
    '1回の合計ファイルサイズは100MBまでです。');
  kspValidatePitchbookFileDescriptor({
    originalFilename: input.originalFilename,
    sizeBytes: input.sizeBytes,
    mimeType: input.mimeType
  });
  kspAssert(input.base64Data, 'PITCHBOOK_FILE_DATA_REQUIRED', 'ファイルデータがありません。');
}

function kspGetPitchbookExtension(filename) {
  var match = /\.([^.]+)$/.exec(String(filename || ''));
  kspAssert(match && match[1], 'PITCHBOOK_EXTENSION_REQUIRED', '拡張子のあるファイルを選択してください。');
  return match[1];
}
