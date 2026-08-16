function kspBuildFileSearchStoreCreateRequest(displayName, embeddingModel) {
  return {
    displayName: kspAiTrim(displayName) || KSP_AI_DEFAULTS.STORE_DISPLAY_NAME,
    embeddingModel: kspAiTrim(embeddingModel) || KSP_AI_DEFAULTS.EMBEDDING_MODEL
  };
}

function kspNormalizeFileSearchStore(response) {
  var value = response || {};
  var name = kspAiTrim(value.name);
  kspAssert(/^fileSearchStores\/[^/]+$/.test(name), 'AI_STORE_RESPONSE_INVALID',
    'File Search Store response does not contain a valid resource name.');
  return {
    name: name,
    displayName: kspAiTrim(value.displayName || value.display_name),
    embeddingModel: kspAiTrim(value.embeddingModel || value.embedding_model),
    activeDocumentsCount: Number(value.activeDocumentsCount || value.active_documents_count || 0),
    pendingDocumentsCount: Number(value.pendingDocumentsCount || value.pending_documents_count || 0),
    failedDocumentsCount: Number(value.failedDocumentsCount || value.failed_documents_count || 0)
  };
}

function kspAiStoreResourcePath(storeName) {
  var name = kspAiTrim(storeName);
  kspAssert(/^fileSearchStores\/[^/]+$/.test(name), 'AI_STORE_NAME_INVALID',
    'File Search Store name is invalid.');
  return name;
}

function kspBuildAiCustomMetadata(source) {
  var metadata = [];
  function addString(key, value) {
    var normalized = kspAiTrim(value);
    if (normalized) metadata.push({ key: key, stringValue: normalized });
  }
  addString('source_type', source.sourceType);
  addString('source_id', source.sourceId);
  addString('date_key', source.dateKey);
  addString('gp_id', source.gpId);
  addString('gp_name', source.gpName);
  addString('asset_class_id', source.assetClassId);
  addString('asset_class_name', source.assetClassName);
  addString('capital_type_id', source.capitalTypeId);
  addString('capital_type_name', source.capitalTypeName);
  addString('drive_url', source.driveUrl);
  addString('saved_filename', source.savedFilename);
  addString('content_hash', source.contentHash);
  return metadata;
}

function kspBuildFileSearchUploadMetadata(source) {
  return {
    displayName: source.displayName || source.savedFilename || source.sourceId + '.txt',
    customMetadata: kspBuildAiCustomMetadata(source),
    mimeType: source.mimeType || 'text/plain'
  };
}

function kspNormalizeFileSearchOperation(response) {
  var value = response || {};
  var errorValue = value.error || null;
  return {
    name: kspAiTrim(value.name),
    done: Boolean(value.done),
    error: errorValue ? {
      code: Number(errorValue.code || 0),
      message: kspAiTrim(errorValue.message),
      status: kspAiTrim(errorValue.status)
    } : null,
    response: value.response || null,
    metadata: value.metadata || null
  };
}

function kspMetadataArrayToMap(metadata) {
  if (metadata && !Array.isArray(metadata) && typeof metadata === 'object') {
    return kspDeepClone(metadata);
  }
  var output = {};
  (metadata || []).forEach(function (entry) {
    if (!entry || !entry.key) return;
    var value = entry.stringValue;
    if (value === undefined) value = entry.string_value;
    if (value === undefined) value = entry.numericValue;
    if (value === undefined) value = entry.numeric_value;
    if (value === undefined) value = entry.stringListValue || entry.string_list_value;
    output[String(entry.key)] = value;
  });
  return output;
}

function kspNormalizeFileSearchDocument(response) {
  var value = response || {};
  var metadata = value.customMetadata || value.custom_metadata || [];
  var name = kspAiTrim(value.name);
  kspAssert(/^fileSearchStores\/[^/]+\/documents\/[^/]+$/.test(name),
    'AI_DOCUMENT_RESPONSE_INVALID', 'File Search Document response is invalid.');
  return {
    name: name,
    displayName: kspAiTrim(value.displayName || value.display_name),
    state: kspAiTrim(value.state),
    customMetadata: kspMetadataArrayToMap(metadata),
    rawCustomMetadata: kspDeepClone(metadata)
  };
}

function kspNormalizeFileSearchDocumentList(response) {
  var value = response || {};
  var documents = value.documents || value.fileSearchDocuments || value.file_search_documents || [];
  return {
    documents: documents.map(kspNormalizeFileSearchDocument),
    nextPageToken: kspAiTrim(value.nextPageToken || value.next_page_token)
  };
}
