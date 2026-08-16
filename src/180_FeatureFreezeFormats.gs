var KSP_FEATURE_FREEZE_WORK_ID = '0009';
var KSP_FEATURE_FREEZE_APP_VERSION = '0.5.0';

var KSP_FEATURE_FREEZE_DEFAULTS = Object.freeze({
  MAX_SOURCE_BYTES: 25 * 1024 * 1024,
  MAX_EML_DEPTH: 8,
  MAX_EML_PARTS: 100,
  MAX_EML_OUTPUT_CHARS: 2 * 1024 * 1024
});

var KSP_AI_READ_STRATEGIES = Object.freeze({
  MEETING_TEXT: 'MEETING_TEXT',
  DIRECT_BINARY: 'DIRECT_BINARY',
  TEXT: 'TEXT',
  EML_NORMALIZED_TEXT: 'EML_NORMALIZED_TEXT'
});

var KSP_AI_FORMAT_REGISTRY = Object.freeze({
  pdf: Object.freeze({
    extension: 'pdf',
    acceptedMimeTypes: Object.freeze(['application/pdf', 'application/octet-stream']),
    uploadMimeType: 'application/pdf',
    readStrategy: KSP_AI_READ_STRATEGIES.DIRECT_BINARY
  }),
  pptx: Object.freeze({
    extension: 'pptx',
    acceptedMimeTypes: Object.freeze([
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'application/octet-stream'
    ]),
    uploadMimeType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    readStrategy: KSP_AI_READ_STRATEGIES.DIRECT_BINARY
  }),
  xlsx: Object.freeze({
    extension: 'xlsx',
    acceptedMimeTypes: Object.freeze([
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/octet-stream'
    ]),
    uploadMimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    readStrategy: KSP_AI_READ_STRATEGIES.DIRECT_BINARY
  }),
  docx: Object.freeze({
    extension: 'docx',
    acceptedMimeTypes: Object.freeze([
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/octet-stream'
    ]),
    uploadMimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    readStrategy: KSP_AI_READ_STRATEGIES.DIRECT_BINARY
  }),
  txt: Object.freeze({
    extension: 'txt',
    acceptedMimeTypes: Object.freeze(['text/plain', 'application/octet-stream']),
    uploadMimeType: 'text/plain',
    readStrategy: KSP_AI_READ_STRATEGIES.TEXT
  }),
  eml: Object.freeze({
    extension: 'eml',
    acceptedMimeTypes: Object.freeze(['message/rfc822', 'application/octet-stream', 'text/plain']),
    uploadMimeType: 'text/plain',
    readStrategy: KSP_AI_READ_STRATEGIES.EML_NORMALIZED_TEXT
  })
});

function kspGetAiFormatExtensions() {
  return Object.keys(KSP_AI_FORMAT_REGISTRY);
}

function kspGetAiFormatDefinition(extension) {
  var normalized = kspAiTrim(extension).toLowerCase();
  var definition = KSP_AI_FORMAT_REGISTRY[normalized] || null;
  if (!definition) {
    var error = new Error('AI indexing does not support this source extension: ' + normalized);
    error.code = 'AI_FORMAT_UNSUPPORTED';
    error.retryable = false;
    error.permanent = true;
    throw error;
  }
  return definition;
}

function kspNormalizeAiMimeType(value) {
  return kspAiTrim(value).toLowerCase().split(';')[0].trim();
}

function kspValidateAiSourceDescriptor(extension, mimeType, byteLength) {
  var definition = kspGetAiFormatDefinition(extension);
  var normalizedMime = kspNormalizeAiMimeType(mimeType) || 'application/octet-stream';
  kspAssert(definition.acceptedMimeTypes.indexOf(normalizedMime) !== -1,
    'AI_SOURCE_MIME_MISMATCH',
    'Source MIME type does not match .' + definition.extension + ': ' + normalizedMime);
  var length = Number(byteLength);
  kspAssert(Number.isFinite(length) && length > 0 && Math.floor(length) === length,
    'AI_SOURCE_SIZE_INVALID', 'AI source size must be a positive integer.');
  kspAssert(length <= KSP_FEATURE_FREEZE_DEFAULTS.MAX_SOURCE_BYTES,
    'AI_SOURCE_TOO_LARGE', 'AI source exceeds the 25MB product limit.');
  return definition;
}

function kspNormalizeAiByteArray(bytes) {
  var values = bytes || [];
  kspAssert(Array.isArray(values) || typeof values.length === 'number',
    'AI_SOURCE_BYTES_INVALID', 'AI source bytes are invalid.');
  return Array.prototype.map.call(values, function (value) {
    var numberValue = Number(value);
    if (numberValue < 0) numberValue += 256;
    kspAssert(Number.isFinite(numberValue) && numberValue >= 0 && numberValue <= 255,
      'AI_SOURCE_BYTES_INVALID', 'AI source contains an invalid byte.');
    return Math.floor(numberValue);
  });
}

function kspAiHashBytesFallback(bytes) {
  var normalized = kspNormalizeAiByteArray(bytes);
  var hash = 2166136261;
  normalized.forEach(function (value) {
    hash ^= value;
    hash = Math.imul(hash, 16777619);
  });
  return ('00000000' + (hash >>> 0).toString(16)).slice(-8);
}

function kspAiSourcePayloadBytes(source) {
  if (source && source.payloadKind === 'binary') return kspNormalizeAiByteArray(source.bytes || []);
  var text = String(source && source.text !== undefined ? source.text : '');
  if (typeof Utilities !== 'undefined' && Utilities.newBlob) {
    return kspNormalizeAiByteArray(Utilities.newBlob(text, source.mimeType || 'text/plain').getBytes());
  }
  var bytes = [];
  for (var index = 0; index < text.length; index += 1) {
    var codePoint = text.charCodeAt(index);
    if (codePoint < 128) bytes.push(codePoint);
    else if (codePoint < 2048) {
      bytes.push(192 | (codePoint >> 6), 128 | (codePoint & 63));
    } else {
      bytes.push(224 | (codePoint >> 12), 128 | ((codePoint >> 6) & 63), 128 | (codePoint & 63));
    }
  }
  return bytes;
}

function kspEmlNormalizeLineEndings(value) {
  return String(value === null || value === undefined ? '' : value).replace(/\r\n?/g, '\n');
}

function kspEmlSplitHeaderBody(raw) {
  var normalized = kspEmlNormalizeLineEndings(raw);
  var separator = normalized.indexOf('\n\n');
  kspAssert(separator >= 0, 'AI_EML_MALFORMED', 'EML has no header/body separator.');
  return { headerText: normalized.slice(0, separator), bodyText: normalized.slice(separator + 2) };
}

function kspEmlParseHeaders(headerText) {
  var unfolded = kspEmlNormalizeLineEndings(headerText).replace(/\n[ \t]+/g, ' ');
  var headers = {};
  unfolded.split('\n').forEach(function (line) {
    if (!line) return;
    var colon = line.indexOf(':');
    if (colon <= 0) return;
    var key = line.slice(0, colon).trim().toLowerCase();
    var value = line.slice(colon + 1).trim();
    if (!headers[key]) headers[key] = [];
    headers[key].push(value);
  });
  return headers;
}

function kspEmlHeader(headers, name) {
  var values = headers && headers[String(name).toLowerCase()] ? headers[String(name).toLowerCase()] : [];
  return values.length ? values.join(', ') : '';
}

function kspEmlParseHeaderParameters(value) {
  var source = String(value || '');
  var pieces = source.split(';');
  var output = { value: pieces.shift().trim().toLowerCase(), parameters: {} };
  pieces.forEach(function (piece) {
    var match = /^\s*([^=]+)=\s*(?:"([^"]*)"|([^;]*))\s*$/.exec(piece);
    if (!match) return;
    output.parameters[String(match[1]).trim().toLowerCase()] = String(match[2] !== undefined ? match[2] : match[3]).trim();
  });
  return output;
}

function kspEmlDecodeBase64Bytes(value) {
  var alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  var source = String(value || '').replace(/\s+/g, '').replace(/=+$/g, '');
  var bits = 0;
  var bitCount = 0;
  var output = [];
  for (var index = 0; index < source.length; index += 1) {
    var digit = alphabet.indexOf(source.charAt(index));
    kspAssert(digit >= 0, 'AI_EML_BASE64_INVALID', 'EML contains invalid base64 data.');
    bits = (bits << 6) | digit;
    bitCount += 6;
    if (bitCount >= 8) {
      bitCount -= 8;
      output.push((bits >> bitCount) & 255);
      bits &= (1 << bitCount) - 1;
    }
  }
  return output;
}

function kspEmlDecodeQuotedPrintableBytes(value, headerMode) {
  var source = String(value || '');
  if (headerMode) source = source.replace(/_/g, ' ');
  source = source.replace(/=\r?\n/g, '');
  var output = [];
  for (var index = 0; index < source.length; index += 1) {
    if (source.charAt(index) === '=' && /^[0-9A-Fa-f]{2}$/.test(source.slice(index + 1, index + 3))) {
      output.push(parseInt(source.slice(index + 1, index + 3), 16));
      index += 2;
      continue;
    }
    var code = source.charCodeAt(index);
    if (code <= 255) output.push(code);
    else {
      var utf8 = kspAiSourcePayloadBytes({ payloadKind: 'text', text: source.charAt(index), mimeType: 'text/plain' });
      output = output.concat(utf8);
    }
  }
  return output;
}

function kspEmlWindows1252Character(value) {
  var map = {
    128: '€', 130: '‚', 131: 'ƒ', 132: '„', 133: '…', 134: '†', 135: '‡', 136: 'ˆ',
    137: '‰', 138: 'Š', 139: '‹', 140: 'Œ', 142: 'Ž', 145: '‘', 146: '’', 147: '“',
    148: '”', 149: '•', 150: '–', 151: '—', 152: '˜', 153: '™', 154: 'š', 155: '›',
    156: 'œ', 158: 'ž', 159: 'Ÿ'
  };
  return map[value] || String.fromCharCode(value);
}

function kspEmlDecodeUtf8(bytes) {
  var values = kspNormalizeAiByteArray(bytes);
  var output = '';
  for (var index = 0; index < values.length;) {
    var first = values[index++];
    if (first < 128) { output += String.fromCharCode(first); continue; }
    var needed = first >= 240 ? 3 : first >= 224 ? 2 : 1;
    var codePoint = first & (needed === 3 ? 7 : needed === 2 ? 15 : 31);
    var valid = true;
    for (var offset = 0; offset < needed; offset += 1) {
      var next = values[index++];
      if (next === undefined || (next & 192) !== 128) { valid = false; break; }
      codePoint = (codePoint << 6) | (next & 63);
    }
    if (!valid) { output += '\uFFFD'; continue; }
    if (codePoint <= 65535) output += String.fromCharCode(codePoint);
    else {
      codePoint -= 65536;
      output += String.fromCharCode(55296 + (codePoint >> 10), 56320 + (codePoint & 1023));
    }
  }
  return output;
}

function kspEmlDecodeBytes(bytes, charset) {
  var normalizedCharset = kspAiTrim(charset || 'utf-8').toLowerCase().replace(/["']/g, '');
  if (typeof Utilities !== 'undefined' && Utilities.newBlob) {
    try { return Utilities.newBlob(kspNormalizeAiByteArray(bytes)).getDataAsString(normalizedCharset || 'UTF-8'); }
    catch (ignored) { }
  }
  if (!normalizedCharset || normalizedCharset === 'utf-8' || normalizedCharset === 'utf8' || normalizedCharset === 'us-ascii' || normalizedCharset === 'ascii') {
    return kspEmlDecodeUtf8(bytes);
  }
  if (normalizedCharset === 'iso-8859-1' || normalizedCharset === 'latin1' || normalizedCharset === 'windows-1252' || normalizedCharset === 'cp1252') {
    return kspNormalizeAiByteArray(bytes).map(kspEmlWindows1252Character).join('');
  }
  return kspEmlDecodeUtf8(bytes);
}

function kspEmlDecodeRawHeaderUtf8(value) {
  var source = String(value || '');
  if (!/[\u0080-\u00ff]/.test(source)) return source;
  var bytes = [];
  for (var index = 0; index < source.length; index += 1) {
    var code = source.charCodeAt(index);
    if (code > 255) return source;
    bytes.push(code);
  }
  var decoded = kspEmlDecodeUtf8(bytes);
  return decoded.indexOf('\uFFFD') === -1 ? decoded : source;
}

function kspEmlDecodeEncodedWords(value) {
  var decoded = String(value || '').replace(/=\?([^?]+)\?([bBqQ])\?([^?]*)\?=/g, function (_, charset, encoding, data) {
    var bytes = String(encoding).toUpperCase() === 'B'
      ? kspEmlDecodeBase64Bytes(data)
      : kspEmlDecodeQuotedPrintableBytes(data, true);
    return kspEmlDecodeBytes(bytes, charset);
  });
  return kspEmlDecodeRawHeaderUtf8(decoded).replace(/\s{2,}/g, ' ').trim();
}

function kspEmlDecodePartBody(bodyText, transferEncoding, charset) {
  var encoding = kspAiTrim(transferEncoding).toLowerCase();
  var bytes;
  if (encoding === 'base64') bytes = kspEmlDecodeBase64Bytes(bodyText);
  else if (encoding === 'quoted-printable') bytes = kspEmlDecodeQuotedPrintableBytes(bodyText, false);
  else bytes = kspAiSourcePayloadBytes({ payloadKind: 'text', text: kspEmlNormalizeLineEndings(bodyText), mimeType: 'text/plain' });
  return kspEmlDecodeBytes(bytes, charset || 'utf-8');
}

function kspEmlSplitMultipart(bodyText, boundary) {
  var marker = '--' + boundary;
  var closing = marker + '--';
  var parts = [];
  var current = [];
  var active = false;
  kspEmlNormalizeLineEndings(bodyText).split('\n').forEach(function (line) {
    if (line === marker || line === closing) {
      if (active && current.length) parts.push(current.join('\n'));
      current = [];
      active = line !== closing;
      return;
    }
    if (active) current.push(line);
  });
  if (active && current.length) parts.push(current.join('\n'));
  return parts;
}

function kspEmlIsAttachment(headers, contentType) {
  var disposition = kspEmlParseHeaderParameters(kspEmlHeader(headers, 'content-disposition'));
  if (disposition.value === 'attachment') return true;
  if (disposition.parameters.filename) return true;
  if (contentType.parameters.name) return true;
  return false;
}

function kspEmlCollectBodyCandidates(rawPart, depth, state) {
  var traversal = state || { parts: 0 };
  traversal.parts += 1;
  kspAssert(traversal.parts <= KSP_FEATURE_FREEZE_DEFAULTS.MAX_EML_PARTS, 'AI_EML_TOO_MANY_PARTS', 'EML contains too many MIME parts.');
  kspAssert(depth <= KSP_FEATURE_FREEZE_DEFAULTS.MAX_EML_DEPTH, 'AI_EML_TOO_DEEP', 'EML multipart nesting is too deep.');
  var split = kspEmlSplitHeaderBody(rawPart);
  var headers = kspEmlParseHeaders(split.headerText);
  var contentType = kspEmlParseHeaderParameters(kspEmlHeader(headers, 'content-type') || 'text/plain; charset=utf-8');
  if (kspEmlIsAttachment(headers, contentType)) return { plain: [], html: [] };
  if (contentType.value.indexOf('multipart/') === 0) {
    var boundary = contentType.parameters.boundary;
    kspAssert(boundary, 'AI_EML_BOUNDARY_MISSING', 'Multipart EML has no boundary.');
    return kspEmlSplitMultipart(split.bodyText, boundary).reduce(function (result, part) {
      var nested = kspEmlCollectBodyCandidates(part, depth + 1, traversal);
      result.plain = result.plain.concat(nested.plain);
      result.html = result.html.concat(nested.html);
      return result;
    }, { plain: [], html: [] });
  }
  if (contentType.value !== 'text/plain' && contentType.value !== 'text/html') return { plain: [], html: [] };
  var decoded = kspEmlDecodePartBody(split.bodyText, kspEmlHeader(headers, 'content-transfer-encoding'), contentType.parameters.charset || 'utf-8').trim();
  if (!decoded) return { plain: [], html: [] };
  return contentType.value === 'text/plain' ? { plain: [decoded], html: [] } : { plain: [], html: [decoded] };
}

function kspEmlDecodeHtmlEntities(value) {
  var named = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' };
  return String(value || '').replace(/&(#x[0-9a-f]+|#\d+|amp|lt|gt|quot|apos|nbsp);/gi, function (_, entity) {
    var lower = entity.toLowerCase();
    if (named[lower] !== undefined) return named[lower];
    if (lower.indexOf('#x') === 0) return String.fromCharCode(parseInt(lower.slice(2), 16));
    return String.fromCharCode(parseInt(lower.slice(1), 10));
  });
}

function kspEmlHtmlToText(value) {
  return kspEmlDecodeHtmlEntities(String(value || '')
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, ' ')
    .replace(/<(br|\/p|\/div|\/li|\/tr|h[1-6])\b[^>]*>/gi, '\n')
    .replace(/<[^>]+>/g, ' '))
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n[ \t]+/g, '\n')
    .replace(/[ \t]{2,}/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function kspNormalizeEmlText(rawEml) {
  var normalized = kspEmlNormalizeLineEndings(rawEml);
  var split = kspEmlSplitHeaderBody(normalized);
  var headers = kspEmlParseHeaders(split.headerText);
  var candidates = kspEmlCollectBodyCandidates(normalized, 0, { parts: 0 });
  var body = candidates.plain.length ? candidates.plain.join('\n\n') : kspEmlHtmlToText(candidates.html.join('\n\n'));
  var fields = [
    ['Subject', kspEmlDecodeEncodedWords(kspEmlHeader(headers, 'subject'))],
    ['From', kspEmlDecodeEncodedWords(kspEmlHeader(headers, 'from'))],
    ['To', kspEmlDecodeEncodedWords(kspEmlHeader(headers, 'to'))],
    ['Cc', kspEmlDecodeEncodedWords(kspEmlHeader(headers, 'cc'))],
    ['Date', kspEmlDecodeEncodedWords(kspEmlHeader(headers, 'date'))]
  ];
  var lines = [];
  fields.forEach(function (field) { if (field[1]) lines.push(field[0] + ': ' + field[1]); });
  kspAssert(body, 'AI_EML_BODY_EMPTY', 'EML contains no indexable non-attachment body.');
  lines.push('', 'Body:', body);
  var output = lines.join('\n').replace(/\n{3,}/g, '\n\n').trim();
  kspAssert(output.length <= KSP_FEATURE_FREEZE_DEFAULTS.MAX_EML_OUTPUT_CHARS,
    'AI_EML_OUTPUT_TOO_LARGE', 'Normalized EML text is too large.');
  return output;
}

function kspNormalizeEml(rawEml) {
  return kspNormalizeEmlText(rawEml);
}
