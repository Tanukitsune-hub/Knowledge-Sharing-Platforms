function kspEscapeMetadataFilterString(value) {
  return String(value).replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

function kspBuildMetadataFilter(filters) {
  var input = filters || {};
  var clauses = [];
  function addComparison(key, operator, value) {
    var normalized = kspAiTrim(value);
    if (normalized) clauses.push(key + ' ' + operator + ' "' + kspEscapeMetadataFilterString(normalized) + '"');
  }
  addComparison('date_key', '>=', input.dateFrom);
  addComparison('date_key', '<=', input.dateTo);
  addComparison('gp_id', '=', input.gpId);
  addComparison('asset_class_id', '=', input.assetClassId);
  addComparison('capital_type_id', '=', input.capitalTypeId);
  addComparison('source_type', '=', input.sourceType);
  return clauses.join(' AND ');
}

function kspNormalizeKnowledgeSearchInput(input) {
  var source = input && typeof input === 'object' ? input : {};
  return {
    mode: KSP_AI_SEARCH_MODES.FREE_QUESTION,
    question: kspAiTrim(source.question),
    dateFrom: kspAiTrim(source.dateFrom),
    dateTo: kspAiTrim(source.dateTo),
    gpId: kspAiTrim(source.gpId),
    assetClassId: kspAiTrim(source.assetClassId),
    capitalTypeId: kspAiTrim(source.capitalTypeId),
    sourceType: kspAiTrim(source.sourceType)
  };
}

function kspValidateKnowledgeSearchInput(input) {
  kspAssert(input.question, 'AI_QUESTION_REQUIRED', '質問を入力してください。');
  kspAssert(input.question.length <= KSP_AI_DEFAULTS.MAX_QUESTION_LENGTH,
    'AI_QUESTION_TOO_LONG', '質問は5,000文字以内で入力してください。');
  if (input.dateFrom) kspAssert(kspIsValidDateKey(input.dateFrom), 'AI_DATE_FROM_INVALID', 'Date Fromが不正です。');
  if (input.dateTo) kspAssert(kspIsValidDateKey(input.dateTo), 'AI_DATE_TO_INVALID', 'Date Toが不正です。');
  if (input.dateFrom && input.dateTo) {
    kspAssert(input.dateFrom <= input.dateTo, 'AI_DATE_RANGE_INVALID', 'Date FromはDate To以前にしてください。');
  }
  if (input.sourceType) {
    kspAssert(input.sourceType === KSP_AI_SOURCE_TYPES.MEETING || input.sourceType === KSP_AI_SOURCE_TYPES.PITCHBOOK,
      'AI_SOURCE_TYPE_INVALID', 'Source Typeが不正です。');
  }
  return input;
}

function kspBuildFreeQuestionPrompt(question) {
  return [
    '社内ナレッジベースに登録された資料だけを根拠として、日本語で回答してください。',
    '最初に質問への直接回答を示し、その後に根拠となる要点を簡潔に整理してください。',
    '根拠が不足する場合は、推測で補わず「確認できる根拠が不足しています」と明示してください。',
    '外部知識や一般論を、資料に書かれている事実のように扱わないでください。',
    '',
    '質問:',
    question
  ].join('\n');
}

function kspBuildInteractionRequest(params) {
  var options = params || {};
  var modelId = kspAiTrim(options.modelId);
  var storeName = kspAiStoreResourcePath(options.storeName);
  var question = kspAiTrim(options.question);
  kspAssert(modelId, 'AI_MODEL_NOT_CONFIGURED', 'Gemini Flash model IDが設定されていません。');
  kspAssert(question, 'AI_QUESTION_REQUIRED', '質問を入力してください。');
  var tool = {
    type: 'file_search',
    file_search_store_names: [storeName]
  };
  var metadataFilter = kspAiTrim(options.metadataFilter);
  if (metadataFilter) tool.metadata_filter = metadataFilter;
  return {
    model: modelId,
    input: kspBuildFreeQuestionPrompt(question),
    tools: [tool]
  };
}

function kspNormalizeCitationAnnotation(annotation) {
  var value = annotation || {};
  var type = kspAiTrim(value.type || 'file_citation');
  if (type && type !== 'file_citation') return null;
  var metadata = kspMetadataArrayToMap(value.customMetadata || value.custom_metadata || []);
  return {
    type: 'file_citation',
    fileName: kspAiTrim(value.fileName || value.file_name),
    source: kspAiTrim(value.source),
    pageNumber: Number(value.pageNumber || value.page_number || 0) || null,
    metadata: metadata
  };
}

function kspParseInteractionResponse(response) {
  var value = response || {};
  var answerParts = [];
  var citations = [];
  (value.steps || []).forEach(function (step) {
    if (!step || String(step.type) !== 'model_output') return;
    (step.content || []).forEach(function (block) {
      if (!block || String(block.type) !== 'text') return;
      if (block.text !== undefined && block.text !== null) answerParts.push(String(block.text));
      (block.annotations || []).forEach(function (annotation) {
        var normalized = kspNormalizeCitationAnnotation(annotation);
        if (normalized) citations.push(normalized);
      });
    });
  });
  var seen = {};
  citations = citations.filter(function (citation) {
    var sourceId = kspAiTrim(citation.metadata.source_id);
    var key = sourceId || [citation.fileName, citation.source, citation.pageNumber || ''].join('|');
    if (seen[key]) return false;
    seen[key] = true;
    return true;
  });
  return {
    answer: answerParts.join('\n').trim(),
    citations: citations,
    interactionId: kspAiTrim(value.id || value.name),
    rawStatus: kspAiTrim(value.status)
  };
}
