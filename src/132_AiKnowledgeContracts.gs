function kspEscapeMetadataFilterString_(value) {
  return String(value).replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

function kspBuildMetadataFilter_(filters) {
  var input = filters || {};
  var clauses = [];
  function addComparison(key, operator, value) {
    var normalized = kspAiTrim_(value);
    if (normalized) clauses.push(key + ' ' + operator + ' "' + kspEscapeMetadataFilterString_(normalized) + '"');
  }
  addComparison('date_key', '>=', input.dateFrom);
  addComparison('date_key', '<=', input.dateTo);
  addComparison('gp_id', '=', input.gpId);
  addComparison('asset_class_id', '=', input.assetClassId);
  addComparison('capital_type_id', '=', input.capitalTypeId);
  addComparison('source_type', '=', input.sourceType);
  return clauses.join(' AND ');
}

function kspNormalizeKnowledgeSearchInput_(input) {
  var source = input && typeof input === 'object' ? input : {};
  return {
    mode: KSP_AI_SEARCH_MODES.FREE_QUESTION,
    question: kspAiTrim_(source.question),
    dateFrom: kspAiTrim_(source.dateFrom),
    dateTo: kspAiTrim_(source.dateTo),
    gpId: kspAiTrim_(source.gpId),
    assetClassId: kspAiTrim_(source.assetClassId),
    capitalTypeId: kspAiTrim_(source.capitalTypeId),
    sourceType: kspAiTrim_(source.sourceType)
  };
}

function kspValidateKnowledgeSearchInput_(input) {
  kspAssert_(input.question, 'AI_QUESTION_REQUIRED', '質問を入力してください。');
  kspAssert_(input.question.length <= KSP_AI_DEFAULTS.MAX_QUESTION_LENGTH,
    'AI_QUESTION_TOO_LONG', '質問は5,000文字以内で入力してください。');
  if (input.dateFrom) kspAssert_(kspIsValidDateKey_(input.dateFrom), 'AI_DATE_FROM_INVALID', 'Date Fromが不正です。');
  if (input.dateTo) kspAssert_(kspIsValidDateKey_(input.dateTo), 'AI_DATE_TO_INVALID', 'Date Toが不正です。');
  if (input.dateFrom && input.dateTo) {
    kspAssert_(input.dateFrom <= input.dateTo, 'AI_DATE_RANGE_INVALID', 'Date FromはDate To以前にしてください。');
  }
  if (input.sourceType) {
    kspAssert_(input.sourceType === KSP_AI_SOURCE_TYPES.MEETING || input.sourceType === KSP_AI_SOURCE_TYPES.PITCHBOOK,
      'AI_SOURCE_TYPE_INVALID', 'Source Typeが不正です。');
  }
  return input;
}

function kspBuildFreeQuestionPrompt_(question) {
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

function kspBuildInteractionRequest_(params) {
  var options = params || {};
  var modelId = kspAiTrim_(options.modelId);
  var storeName = kspAiStoreResourcePath_(options.storeName);
  var question = kspAiTrim_(options.question);
  kspAssert_(modelId, 'AI_MODEL_NOT_CONFIGURED', 'Gemini Flash model IDが設定されていません。');
  kspAssert_(question, 'AI_QUESTION_REQUIRED', '質問を入力してください。');
  var tool = {
    type: 'file_search',
    file_search_store_names: [storeName]
  };
  var metadataFilter = kspAiTrim_(options.metadataFilter);
  if (metadataFilter) tool.metadata_filter = metadataFilter;
  return {
    model: modelId,
    input: kspBuildFreeQuestionPrompt_(question),
    tools: [tool],
    background: true,
    generation_config: {
      thinking_level: KSP_AI_DEFAULTS.QUERY_THINKING_LEVEL,
      max_output_tokens: KSP_AI_DEFAULTS.QUERY_MAX_OUTPUT_TOKENS
    }
  };
}

function kspNormalizeCitationAnnotation_(annotation) {
  var value = annotation || {};
  var type = kspAiTrim_(value.type || 'file_citation');
  if (type && type !== 'file_citation') return null;
  var metadata = kspMetadataArrayToMap_(value.customMetadata || value.custom_metadata || []);
  return {
    type: 'file_citation',
    fileName: kspAiTrim_(value.fileName || value.file_name),
    source: kspAiTrim_(value.source),
    pageNumber: Number(value.pageNumber || value.page_number || 0) || null,
    metadata: metadata
  };
}

function kspParseInteractionResponse_(response) {
  var value = response || {};
  var answerParts = [];
  var citations = [];
  (value.steps || []).forEach(function (step) {
    if (!step || String(step.type) !== 'model_output') return;
    (step.content || []).forEach(function (block) {
      if (!block || String(block.type) !== 'text') return;
      if (block.text !== undefined && block.text !== null) answerParts.push(String(block.text));
      (block.annotations || []).forEach(function (annotation) {
        var normalized = kspNormalizeCitationAnnotation_(annotation);
        if (normalized) citations.push(normalized);
      });
    });
  });
  var seen = {};
  citations = citations.filter(function (citation) {
    var sourceId = kspAiTrim_(citation.metadata.source_id);
    var key = sourceId || [citation.fileName, citation.source, citation.pageNumber || ''].join('|');
    if (seen[key]) return false;
    seen[key] = true;
    return true;
  });
  return {
    answer: answerParts.join('\n').trim(),
    citations: citations,
    interactionId: kspAiTrim_(value.id || value.name),
    rawStatus: kspAiTrim_(value.status)
  };
}

function kspNormalizeGeminiGenerateContentResponse_(response) {
  var value = response || {};
  var candidate = (value.candidates || [])[0] || {};
  var content = candidate.content || {};
  var answerParts = [];
  (content.parts || []).forEach(function (part) {
    if (!part || part.text === undefined || part.text === null || part.thought === true) return;
    answerParts.push(String(part.text));
  });
  if (!answerParts.length && value.text !== undefined && value.text !== null) answerParts.push(String(value.text));

  var grounding = candidate.groundingMetadata || candidate.grounding_metadata ||
    value.groundingMetadata || value.grounding_metadata || {};
  var chunks = grounding.groundingChunks || grounding.grounding_chunks || [];
  var citations = [];
  chunks.forEach(function (chunk) {
    var retrieved = chunk && (chunk.retrievedContext || chunk.retrieved_context);
    if (!retrieved) return;
    var metadata = kspMetadataArrayToMap_(
      retrieved.customMetadata || retrieved.custom_metadata || retrieved.metadata || []
    );
    var sourceType = kspAiTrim_(metadata.source_type);
    var sourceId = kspAiTrim_(metadata.source_id);
    if (!sourceType || !sourceId) return;
    var pageNumber = Number(
      retrieved.pageNumber || retrieved.page_number || metadata.page_number || metadata.pageNumber || 0
    ) || null;
    citations.push({
      type: 'file_citation',
      fileName: kspAiTrim_(retrieved.title || retrieved.displayName || retrieved.display_name || retrieved.uri),
      source: kspAiTrim_(retrieved.uri || retrieved.fileSearchStore || retrieved.file_search_store),
      pageNumber: pageNumber,
      metadata: metadata
    });
  });
  var seen = {};
  citations = citations.filter(function (citation) {
    var metadata = kspMetadataArrayToMap_(citation.metadata);
    var key = [metadata.source_type, metadata.source_id, citation.pageNumber || ''].join('|');
    if (seen[key]) return false;
    seen[key] = true;
    return true;
  });
  return {
    answer: answerParts.join('\n').trim(),
    citations: citations,
    interactionId: '',
    rawStatus: 'completed',
    finishReason: kspAiTrim_(candidate.finishReason || candidate.finish_reason),
    usage: kspDeepClone_(value.usageMetadata || value.usage_metadata || value.usage || {})
  };
}
