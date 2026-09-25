function kspCreateSourceRecordEnvironment_() {
  var environment = kspCreateMaintenanceEnvironment_();
  var properties = PropertiesService.getScriptProperties();

  environment.reserveSourceId = function (definition, backendId, input, actor, fingerprint, nowIso) {
    var lock = kspMaintenanceAcquireLock_('source ID allocation');
    try {
      var requestMs = kspSourceRequestTimestamp_(input.requestId);
      var nowMs = new Date(kspCanonicalInstantIso_(nowIso)).getTime();
      kspAssert_(Number.isFinite(nowMs) && requestMs <= nowMs + 5 * 60 * 1000 &&
        nowMs - requestMs <= KSP_SOURCE_REQUEST_TTL_MS,
        'SOURCE_REQUEST_EXPIRED', '古い登録操作は再実行できません。保存結果を確認してください。');
      var requestKey = kspSourceRequestBucketKey_(definition, input.requestId);
      var bucket = kspSafeParseJson_(properties.getProperty(requestKey), requestKey) || {};
      Object.keys(bucket).forEach(function (key) {
        if (Number(bucket[key].createdMs || 0) + KSP_SOURCE_REQUEST_TTL_MS < nowMs) delete bucket[key];
      });
      var request = bucket[input.requestId] || null;
      if (request) {
        kspAssert_(request.actor === actor && request.fingerprint === fingerprint &&
          (!input.retryRecordId || request.id === input.retryRecordId),
          'SOURCE_RETRY_CONFLICT', '同じRequest IDに異なる登録内容があります。');
        return request.id;
      }
      kspAssert_(Object.keys(bucket).length < KSP_SOURCE_REQUEST_BUCKET_LIMIT,
        'SOURCE_REQUEST_LEDGER_FULL', '登録処理の確認待ちが多いため、時間をおいて再試行してください。');
      var setting = kspFindSettingRow_(backendId, definition.counterKey);
      var sequence = kspReadPositiveSettingValue_(setting, definition.counterKey);
      if (input.retryRecordId) {
        var retrySequence = kspParseSourceRecordId_(definition, input.retryRecordId);
        kspAssert_(retrySequence < sequence && input.retryFingerprint === fingerprint,
          'SOURCE_RETRY_CONFLICT', '再試行IDと入力内容が一致しません。');
        bucket[input.requestId] = { id: input.retryRecordId, actor: actor,
          fingerprint: fingerprint, createdMs: requestMs };
        properties.setProperty(requestKey, JSON.stringify(bucket));
        return input.retryRecordId;
      }
      var id = kspSourceRecordId_(definition, sequence);
      setting.sheet.getRange(setting.rowIndex, setting.valueIndex + 1).setValue(String(sequence + 1));
      if (setting.updatedAtIndex !== -1) setting.sheet.getRange(setting.rowIndex, setting.updatedAtIndex + 1).setValue(nowIso);
      bucket[input.requestId] = { id: id, actor: actor, fingerprint: fingerprint, createdMs: requestMs };
      properties.setProperty(requestKey, JSON.stringify(bucket));
      return id;
    } finally { lock.releaseLock(); }
  };

  environment.claimSourceCreate = function (definition, id, nowIso) {
    var lock = kspMaintenanceAcquireLock_('source create claim');
    try {
      var key = 'KSP_SOURCE_CREATE_' + id;
      var current = kspSafeParseJson_(properties.getProperty(key), key);
      var nowMs = new Date(kspCanonicalInstantIso_(nowIso)).getTime();
      kspAssert_(!current || Number(current.expiresAtMs || 0) <= nowMs,
        'SOURCE_CREATE_IN_PROGRESS', '同じ記録の登録が進行中です。少し待って再試行してください。');
      var token = Utilities.getUuid();
      properties.setProperty(key, JSON.stringify({ token: token, expiresAtMs: nowMs + 10 * 60 * 1000 }));
      return { key: key, token: token };
    } finally { lock.releaseLock(); }
  };

  environment.releaseSourceCreate = function (claim) {
    if (!claim) return;
    var lock = kspMaintenanceAcquireLock_('source create claim release');
    try {
      var current = kspSafeParseJson_(properties.getProperty(claim.key), claim.key);
      if (current && current.token === claim.token) properties.deleteProperty(claim.key);
    } finally { lock.releaseLock(); }
  };

  environment.createOrReuseSourceFile = function (definition, folderId, id, input, savedFilename) {
    var payloadHash = kspSourceRecordPayloadSha256_(input);
    var query = "'" + kspEscapeDriveQueryLiteral_(folderId) + "' in parents and trashed = false" +
      " and appProperties has { key='kspSourceRecordId' and value='" + kspEscapeDriveQueryLiteral_(id) + "' }";
    var response = Drive.Files.list({ q: query, spaces: 'drive', includeItemsFromAllDrives: true,
      supportsAllDrives: true, pageSize: 10, fields: 'files(id,name,mimeType,webViewLink,parents,appProperties)' });
    var matches = response.files || [];
    kspAssert_(matches.length <= 1, 'DUPLICATE_SOURCE_FILES', '同じ記録IDの原本が複数あります。');
    var file = matches[0] || null;
    if (file) {
      kspAssertSourceDriveFileMatch_(file, definition, folderId, id, input, savedFilename, payloadHash);
    }
    if (!file) {
      if (input.inputMode === 'DIRECT_TEXT') {
        file = Drive.Files.create({ name: savedFilename, mimeType: 'application/vnd.google-apps.document',
          parents: [folderId], appProperties: { kspSourceRecordId: id,
            kspSourceType: definition.key, kspSourcePayloadSha256: payloadHash } },
          null, { supportsAllDrives: true, fields: 'id,name,mimeType,webViewLink,parents,appProperties' });
      } else {
        var bytes = Utilities.base64Decode(input.file.base64Data);
        kspAssert_(bytes && bytes.length === input.file.sizeBytes,
          'SOURCE_FILE_SIZE_MISMATCH', '送信されたファイルサイズが選択時と一致しません。');
        var blob = Utilities.newBlob(bytes, input.file.mimeType, input.file.originalFilename);
        file = Drive.Files.create({ name: savedFilename, parents: [folderId],
          appProperties: { kspSourceRecordId: id,
            kspSourceType: definition.key, kspSourcePayloadSha256: payloadHash } },
          blob, { supportsAllDrives: true, fields: 'id,name,mimeType,webViewLink,parents,appProperties' });
      }
    }
    kspAssert_(file && file.id &&
      (input.inputMode !== 'DIRECT_TEXT' || file.mimeType === 'application/vnd.google-apps.document'),
      'SOURCE_FILE_CONFLICT', '原本の形式が記録内容と一致しません。');
    if (input.inputMode === 'DIRECT_TEXT') {
      var document = DocumentApp.openById(file.id);
      document.getBody().clear().setText(input.directText);
      document.saveAndClose();
    }
    return { id: String(file.id), url: String(file.webViewLink ||
      (input.inputMode === 'DIRECT_TEXT' ? 'https://docs.google.com/document/d/' + file.id + '/edit' :
        'https://drive.google.com/file/d/' + file.id + '/view')),
      reused: matches.length === 1 };
  };

  environment.assertSourceFilePayload = function (definition, folderId, id, input, savedFilename, fileId) {
    var file = Drive.Files.get(fileId, { supportsAllDrives: true,
      fields: 'id,name,mimeType,parents,appProperties,trashed' });
    kspAssert_(file && String(file.id || '') === fileId && !file.trashed,
      'SOURCE_FILE_CONFLICT', '保存済みの原本が見つかりません。');
    kspAssertSourceDriveFileMatch_(file, definition, folderId, id, input, savedFilename,
      kspSourceRecordPayloadSha256_(input));
  };

  environment.commitSourceRow = function (definition, input, row) {
    var lock = kspMaintenanceAcquireLock_('source create commit');
    try {
      var state = environment.getInstallationState();
      var spreadsheet = SpreadsheetApp.openById(state.resources[KSP_RESOURCE_KEYS.BACKEND_SPREADSHEET]);
      kspValidateSourceLiveReferences_(spreadsheet, definition, input);
      var sheet = spreadsheet.getSheetByName(definition.sheetName);
      kspAssert_(sheet, 'SHEET_NOT_FOUND', '記録Indexが見つかりません。');
      var headers = kspReadHeadersFromSheet_(sheet);
      var existing = kspReadObjectsFromSheet_(sheet, headers).filter(function (current) {
        return String(current[definition.idField] || '') === String(row[definition.idField]);
      });
      kspAssert_(existing.length <= 1, 'DUPLICATE_KEY_ROWS', '同じ記録IDの行が複数あります。');
      if (existing.length === 1) {
        kspAssert_(kspSourceRowMatchesCreate_(definition, existing[0], row),
          'SOURCE_RETRY_CONFLICT', '同じ記録IDに異なる登録内容があります。');
        return { row: existing[0], inserted: false };
      }
      sheet.getRange(sheet.getLastRow() + 1, 1, 1, headers.length).setValues([headers.map(function (header) {
        return row[header] === undefined || row[header] === null ? '' : row[header];
      })]);
      return { row: row, inserted: true };
    } finally { lock.releaseLock(); }
  };

  environment.commitClaimedSourceEdit = function (claim, definition, input, updatedRow) {
    var lock = kspMaintenanceAcquireLock_('source edit commit');
    try {
      var stored = kspSafeParseJson_(properties.getProperty(claim.claimKey), claim.claimKey);
      kspAssert_(stored && stored.claimToken === claim.claimToken && Number(stored.expiresAtMs || 0) > Date.now(),
        'RECORD_EDIT_CLAIM_LOST', '編集権の有効期限が切れました。');
      var state = environment.getInstallationState();
      var spreadsheet = SpreadsheetApp.openById(state.resources[KSP_RESOURCE_KEYS.BACKEND_SPREADSHEET]);
      kspValidateSourceLiveReferences_(spreadsheet, definition, input);
      var found = kspMaintenanceFindSheetRow_(spreadsheet.getId(), definition.sheetName,
        definition.idField, updatedRow[definition.idField]);
      kspAssert_(found && Number(found.row.Version) === Number(claim.expectedToken),
        'STALE_RECORD_VERSION', '他の利用者が先に更新しています。最新情報を読み直してください。');
      kspAssert_(String(found.row.Status || '') === KSP_STATUS.ACTIVE,
        'SOURCE_NOT_ACTIVE', '有効な記録だけ編集できます。');
      var fields = {};
      Object.keys(updatedRow).forEach(function (header) {
        if (header === definition.dateField) {
          if (kspCanonicalBusinessDate_(found.row[header]) !== kspCanonicalBusinessDate_(updatedRow[header])) {
            fields[header] = updatedRow[header];
          }
        } else if (String(found.row[header] === undefined ? '' : found.row[header]) !==
          String(updatedRow[header] === undefined ? '' : updatedRow[header])) fields[header] = updatedRow[header];
      });
      kspMaintenanceWriteSheetFieldsWithRollback_(found.sheet, found.headers, found.rowNumber, fields, found.row);
      properties.deleteProperty(claim.claimKey);
      return Object.assign({}, found.row, fields);
    } finally { lock.releaseLock(); }
  };

  environment.updateSourceStatusAtomic = function (definition, id, expectedVersion, targetStatus, actor, nowIso) {
    var lock = kspMaintenanceAcquireLock_('source status update');
    try {
      var state = environment.getInstallationState();
      var backendId = state.resources[KSP_RESOURCE_KEYS.BACKEND_SPREADSHEET];
      var found = kspMaintenanceFindSheetRow_(backendId, definition.sheetName, definition.idField, id);
      kspAssert_(found, 'SOURCE_NOT_FOUND', '対象記録が見つかりません。');
      var key = kspMaintenanceClaimKey_(definition.key, id);
      var claim = kspSafeParseJson_(properties.getProperty(key), key);
      kspAssert_(!claim || Number(claim.expiresAtMs || 0) <= Date.now(),
        'RECORD_EDIT_IN_PROGRESS', '同じ記録の編集処理中です。');
      kspAssert_(Number(found.row.Version) === Number(expectedVersion),
        'STALE_RECORD_VERSION', '他の利用者が先に更新しています。');
      if (targetStatus === KSP_STATUS.ACTIVE) {
        kspAssert_(String(found.row.Source_File_ID || ''),
          'SOURCE_AUTHORITATIVE_FILE_MISSING', '原本がない記録は復元できません。');
        kspValidateSourceLiveReferences_(SpreadsheetApp.openById(backendId), definition, {
          counterpartyIds: kspSourceCanonicalIds_(found.row.Counterparty_IDs, 'CP', true),
          assetClassId: String(found.row.Asset_Class_ID || ''),
          relatedMeetingIds: kspSourceCanonicalIds_(found.row.Related_Meeting_IDs, 'MTG', false),
          relatedDocumentIds: kspSourceCanonicalIds_(found.row.Related_Document_IDs, 'DOC', false),
          relatedNewsIds: kspSourceCanonicalIds_(found.row.Related_News_IDs, 'NEWS', false)
        });
      }
      var before = Object.assign({}, found.row);
      var fields = { Status: targetStatus, Version: Number(found.row.Version) + 1,
        Updated_At: nowIso, Updated_By: actor, AI_Index_Status: KSP_AI_INDEX_STATUS.NOT_INDEXED,
        AI_Last_Error: '' };
      kspMaintenanceWriteSheetFieldsWithRollback_(found.sheet, found.headers, found.rowNumber, fields, found.row);
      return { before: before, after: Object.assign({}, before, fields) };
    } finally { lock.releaseLock(); }
  };

  return environment;
}

function kspAssertSourceDriveFileMatch_(file, definition, folderId, id, input, savedFilename, payloadHash) {
  var expectedMimeType = input.inputMode === 'DIRECT_TEXT' ?
    'application/vnd.google-apps.document' : input.file.mimeType;
  kspAssert_(String(file.name || '') === savedFilename &&
    String(file.mimeType || '') === expectedMimeType &&
    Array.isArray(file.parents) && file.parents.indexOf(folderId) !== -1 &&
    file.appProperties && file.appProperties.kspSourceRecordId === id &&
    file.appProperties.kspSourceType === definition.key &&
    file.appProperties.kspSourcePayloadSha256 === payloadHash,
  'SOURCE_FILE_CONFLICT', '既存の原本が今回の記録内容と一致しません。');
}

function kspValidateSourceLiveReferences_(spreadsheet, definition, input) {
  var counterpartySheet = spreadsheet.getSheetByName(KSP_SHEET_NAMES.COUNTERPARTY_MASTER);
  var optionSheet = spreadsheet.getSheetByName(KSP_SHEET_NAMES.OPTION_MASTER);
  kspAssert_(counterpartySheet && optionSheet, 'SOURCE_MASTER_UNAVAILABLE', 'マスターを確認できません。');
  var related = null;
  if (definition.key === 'ASSESSMENT') {
    related = {};
    [
      ['meetings', KSP_SHEET_NAMES.MEETING_INDEX],
      ['documents', KSP_SHEET_NAMES.PITCHBOOK_INDEX],
      ['news', KSP_SHEET_NAMES.NEWS_INDEX]
    ].forEach(function (entry) {
      var sheet = spreadsheet.getSheetByName(entry[1]);
      kspAssert_(sheet, 'SOURCE_REFERENCE_SHEET_MISSING', '関連記録を確認できません。');
      related[entry[0]] = kspReadObjectsFromSheet_(sheet, kspReadHeadersFromSheet_(sheet));
    });
  }
  kspValidateSourceMasterReferences_(definition, input,
    kspReadObjectsFromSheet_(counterpartySheet, kspReadHeadersFromSheet_(counterpartySheet)),
    kspReadObjectsFromSheet_(optionSheet, kspReadHeadersFromSheet_(optionSheet)), related);
}

function kspSourceRowMatchesCreate_(definition, existing, requested) {
  var fields = [definition.idField, definition.dateField, 'Title', 'Counterparty_IDs', 'Asset_Class_ID',
    'Fund_Strategy', 'Input_Mode', 'Source_File_ID', 'Source_Mime_Type', 'Original_Filename',
    'Saved_Filename'].concat(definition.key === 'NEWS' ? ['Publisher', 'URL'] :
      ['Assessment_Type', 'Decision_Or_Action', 'Related_Meeting_IDs', 'Related_Document_IDs', 'Related_News_IDs']);
  return fields.every(function (field) {
    return field === definition.dateField
      ? kspCanonicalBusinessDate_(existing[field]) === kspCanonicalBusinessDate_(requested[field])
      : String(existing[field] || '') === String(requested[field] || '');
  });
}
