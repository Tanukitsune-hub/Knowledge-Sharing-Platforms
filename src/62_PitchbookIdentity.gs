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
  var segments = [input.date, selected.gp.name, selected.assetClass.name];
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
    Date: options.input.date,
    GP_ID: options.input.gpId,
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
    row.Batch_ID, row.Document_ID, kspCanonicalPitchbookDateKey_(row.Date), row.GP_ID, row.Asset_Class_ID,
    row.Capital_Type_ID, row.Fund_Strategy, row.Sequence_No, row.Original_Filename, row.Saved_Filename,
    descriptor.sizeBytes, descriptor.mimeType, totalBytes
  ].map(function (value) { return String(value || ''); }).join('\u001f');
  return kspFnv1aHex_(canonical);
}

function kspBuildLegacyPitchbookSlotFingerprint_(row, reservedFile, totalBytes) {
  var descriptor = reservedFile || {};
  var canonical = [
    row.Batch_ID, row.Document_ID, kspCanonicalPitchbookDateKey_(row.Date), row.GP_ID, row.Asset_Class_ID,
    row.Capital_Type_ID, row.Sequence_No, row.Original_Filename, row.Saved_Filename,
    descriptor.sizeBytes, descriptor.mimeType, totalBytes
  ].map(function (value) { return String(value || ''); }).join('\u001f');
  return kspFnv1aHex_(canonical);
}

function kspCanonicalPitchbookDateKey_(value) {
  if (value instanceof Date) {
    if (isNaN(value.getTime())) return '';
    return Utilities.formatDate(value, KSP_DEFAULTS.TIMEZONE, 'yyyy-MM-dd');
  }
  var text = value === null || value === undefined ? '' : String(value).trim();
  var isoDate = /^(\d{4}-\d{2}-\d{2})(?:T|$)/.exec(text);
  return isoDate && kspIsValidDateKey_(isoDate[1]) ? isoDate[1] : text;
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
