function kspBuildFileSearchStoreCreateRequest_(displayName, embeddingModel) {
  return {
    displayName: kspAiTrim_(displayName) || KSP_AI_DEFAULTS.STORE_DISPLAY_NAME,
    embeddingModel: kspAiTrim_(embeddingModel) || KSP_AI_DEFAULTS.EMBEDDING_MODEL
  };
}

function kspNormalizeFileSearchStore_(response) {
  var value = response || {};
  var name = kspAiTrim_(value.name);
  kspAssert_(/^fileSearchStores\/[^/]+$/.test(name), 'AI_STORE_RESPONSE_INVALID',
    'File Search Store response does not contain a valid resource name.');
  return {
    name: name,
    displayName: kspAiTrim_(value.displayName || value.display_name),
    embeddingModel: kspAiTrim_(value.embeddingModel || value.embedding_model),
    activeDocumentsCount: Number(value.activeDocumentsCount || value.active_documents_count || 0),
    pendingDocumentsCount: Number(value.pendingDocumentsCount || value.pending_documents_count || 0),
    failedDocumentsCount: Number(value.failedDocumentsCount || value.failed_documents_count || 0)
  };
}

function kspAiStoreResourcePath_(storeName) {
  var name = kspAiTrim_(storeName);
  kspAssert_(/^fileSearchStores\/[^/]+$/.test(name), 'AI_STORE_NAME_INVALID',
    'File Search Store name is invalid.');
  return name;
}

function kspBuildAiCustomMetadata_(source) {
  var metadata = [];
  function addString(key, value) {
    var normalized = kspAiTrim_(value);
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

function kspBuildFileSearchUploadMetadata_(source) {
  return {
    displayName: source.displayName || source.savedFilename || source.sourceId + '.txt',
    customMetadata: kspBuildAiCustomMetadata_(source),
    mimeType: source.mimeType || 'text/plain'
  };
}

function kspNormalizeFileSearchOperation_(response) {
  var value = response || {};
  var errorValue = value.error || null;
  return {
    name: kspAiTrim_(value.name),
    done: Boolean(value.done),
    error: errorValue ? {
      code: Number(errorValue.code || 0),
      message: kspAiTrim_(errorValue.message),
      status: kspAiTrim_(errorValue.status)
    } : null,
    response: value.response || null,
    metadata: value.metadata || null
  };
}

function kspMetadataArrayToMap_(metadata) {
  if (metadata && !Array.isArray(metadata) && typeof metadata === 'object') {
    return kspDeepClone_(metadata);
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

function kspNormalizeFileSearchDocument_(response) {
  var value = response || {};
  var metadata = value.customMetadata || value.custom_metadata || [];
  var name = kspAiTrim_(value.name);
  kspAssert_(/^fileSearchStores\/[^/]+\/documents\/[^/]+$/.test(name),
    'AI_DOCUMENT_RESPONSE_INVALID', 'File Search Document response is invalid.');
  return {
    name: name,
    displayName: kspAiTrim_(value.displayName || value.display_name),
    state: kspAiTrim_(value.state),
    customMetadata: kspMetadataArrayToMap_(metadata),
    rawCustomMetadata: kspDeepClone_(metadata)
  };
}

function kspNormalizeFileSearchDocumentList_(response) {
  var value = response || {};
  var documents = value.documents || value.fileSearchDocuments || value.file_search_documents || [];
  return {
    documents: documents.map(kspNormalizeFileSearchDocument_),
    nextPageToken: kspAiTrim_(value.nextPageToken || value.next_page_token)
  };
}
