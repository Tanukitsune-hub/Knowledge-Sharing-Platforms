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

function kspGetAiFormatExtensions_() {
  return Object.keys(KSP_AI_FORMAT_REGISTRY);
}

function kspGetAiFormatDefinition_(extension) {
  var normalized = kspAiTrim_(extension).toLowerCase();
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

function kspNormalizeAiMimeType_(value) {
  return kspAiTrim_(value).toLowerCase().split(';')[0].trim();
}

function kspValidateAiSourceDescriptor_(extension, mimeType, byteLength) {
  var definition = kspGetAiFormatDefinition_(extension);
  var normalizedMime = kspNormalizeAiMimeType_(mimeType) || 'application/octet-stream';
  kspAssert_(definition.acceptedMimeTypes.indexOf(normalizedMime) !== -1,
    'AI_SOURCE_MIME_MISMATCH',
    'Source MIME type does not match .' + definition.extension + ': ' + normalizedMime);
  var length = Number(byteLength);
  kspAssert_(Number.isFinite(length) && length > 0 && Math.floor(length) === length,
    'AI_SOURCE_SIZE_INVALID', 'AI source size must be a positive integer.');
  kspAssert_(length <= KSP_FEATURE_FREEZE_DEFAULTS.MAX_SOURCE_BYTES,
    'AI_SOURCE_TOO_LARGE', 'AI source exceeds the 25MB product limit.');
  return definition;
}

function kspNormalizeAiByteArray_(bytes) {
  var values = bytes || [];
  kspAssert_(Array.isArray(values) || typeof values.length === 'number',
    'AI_SOURCE_BYTES_INVALID', 'AI source bytes are invalid.');
  return Array.prototype.map.call(values, function (value) {
    var numberValue = Number(value);
    if (numberValue < 0) numberValue += 256;
    kspAssert_(Number.isFinite(numberValue) && numberValue >= 0 && numberValue <= 255,
      'AI_SOURCE_BYTES_INVALID', 'AI source contains an invalid byte.');
    return Math.floor(numberValue);
  });
}

function kspAiHashBytesFallback_(bytes) {
  var normalized = kspNormalizeAiByteArray_(bytes);
  var hash = 2166136261;
  normalized.forEach(function (value) {
    hash ^= value;
    hash = Math.imul(hash, 16777619);
  });
  return ('00000000' + (hash >>> 0).toString(16)).slice(-8);
}

function kspAiSourcePayloadBytes_(source) {
  if (source && source.payloadKind === 'binary') return kspNormalizeAiByteArray_(source.bytes || []);
  var text = String(source && source.text !== undefined ? source.text : '');
  if (typeof Utilities !== 'undefined' && Utilities.newBlob) {
    return kspNormalizeAiByteArray_(Utilities.newBlob(text, source.mimeType || 'text/plain').getBytes());
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

function kspEmlNormalizeLineEndings_(value) {
  return String(value === null || value === undefined ? '' : value).replace(/\r\n?/g, '\n');
}

function kspEmlSplitHeaderBody_(raw) {
  var normalized = kspEmlNormalizeLineEndings_(raw);
  var separator = normalized.indexOf('\n\n');
  kspAssert_(separator >= 0, 'AI_EML_MALFORMED', 'EML has no header/body separator.');
  return { headerText: normalized.slice(0, separator), bodyText: normalized.slice(separator + 2) };
}

function kspEmlParseHeaders_(headerText) {
  var unfolded = kspEmlNormalizeLineEndings_(headerText).replace(/\n[ \t]+/g, ' ');
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

function kspEmlHeader_(headers, name) {
  var values = headers && headers[String(name).toLowerCase()] ? headers[String(name).toLowerCase()] : [];
  return values.length ? values.join(', ') : '';
}

function kspEmlParseHeaderParameters_(value) {
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

function kspEmlDecodeBase64Bytes_(value) {
  var alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  var source = String(value || '').replace(/\s+/g, '').replace(/=+$/g, '');
  var bits = 0;
  var bitCount = 0;
  var output = [];
  for (var index = 0; index < source.length; index += 1) {
    var digit = alphabet.indexOf(source.charAt(index));
    kspAssert_(digit >= 0, 'AI_EML_BASE64_INVALID', 'EML contains invalid base64 data.');
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

function kspEmlDecodeQuotedPrintableBytes_(value, headerMode) {
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
      var utf8 = kspAiSourcePayloadBytes_({ payloadKind: 'text', text: source.charAt(index), mimeType: 'text/plain' });
      output = output.concat(utf8);
    }
  }
  return output;
}

function kspEmlWindows1252Character_(value) {
  var map = {
    128: '€', 130: '‚', 131: 'ƒ', 132: '„', 133: '…', 134: '†', 135: '‡', 136: 'ˆ',
    137: '‰', 138: 'Š', 139: '‹', 140: 'Œ', 142: 'Ž', 145: '‘', 146: '’', 147: '“',
    148: '”', 149: '•', 150: '–', 151: '—', 152: '˜', 153: '™', 154: 'š', 155: '›',
    156: 'œ', 158: 'ž', 159: 'Ÿ'
  };
  return map[value] || String.fromCharCode(value);
}

function kspEmlDecodeUtf8_(bytes) {
  var values = kspNormalizeAiByteArray_(bytes);
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

function kspEmlDecodeBytes_(bytes, charset) {
  var normalizedCharset = kspAiTrim_(charset || 'utf-8').toLowerCase().replace(/["']/g, '');
  if (typeof Utilities !== 'undefined' && Utilities.newBlob) {
    try { return Utilities.newBlob(kspNormalizeAiByteArray_(bytes)).getDataAsString(normalizedCharset || 'UTF-8'); }
    catch (ignored) { }
  }
  if (!normalizedCharset || normalizedCharset === 'utf-8' || normalizedCharset === 'utf8' || normalizedCharset === 'us-ascii' || normalizedCharset === 'ascii') {
    return kspEmlDecodeUtf8_(bytes);
  }
  if (normalizedCharset === 'iso-8859-1' || normalizedCharset === 'latin1' || normalizedCharset === 'windows-1252' || normalizedCharset === 'cp1252') {
    return kspNormalizeAiByteArray_(bytes).map(kspEmlWindows1252Character_).join('');
  }
  return kspEmlDecodeUtf8_(bytes);
}

function kspEmlDecodeRawHeaderUtf8_(value) {
  var source = String(value || '');
  if (!/[\u0080-\u00ff]/.test(source)) return source;
  var bytes = [];
  for (var index = 0; index < source.length; index += 1) {
    var code = source.charCodeAt(index);
    if (code > 255) return source;
    bytes.push(code);
  }
  var decoded = kspEmlDecodeUtf8_(bytes);
  return decoded.indexOf('\uFFFD') === -1 ? decoded : source;
}

function kspEmlDecodeEncodedWords_(value) {
  var decoded = String(value || '').replace(/=\?([^?]+)\?([bBqQ])\?([^?]*)\?=/g, function (_, charset, encoding, data) {
    var bytes = String(encoding).toUpperCase() === 'B'
      ? kspEmlDecodeBase64Bytes_(data)
      : kspEmlDecodeQuotedPrintableBytes_(data, true);
    return kspEmlDecodeBytes_(bytes, charset);
  });
  return kspEmlDecodeRawHeaderUtf8_(decoded).replace(/\s{2,}/g, ' ').trim();
}

function kspEmlDecodePartBody_(bodyText, transferEncoding, charset) {
  var encoding = kspAiTrim_(transferEncoding).toLowerCase();
  var bytes;
  if (encoding === 'base64') bytes = kspEmlDecodeBase64Bytes_(bodyText);
  else if (encoding === 'quoted-printable') bytes = kspEmlDecodeQuotedPrintableBytes_(bodyText, false);
  else bytes = kspAiSourcePayloadBytes_({ payloadKind: 'text', text: kspEmlNormalizeLineEndings_(bodyText), mimeType: 'text/plain' });
  return kspEmlDecodeBytes_(bytes, charset || 'utf-8');
}

function kspEmlSplitMultipart_(bodyText, boundary) {
  var marker = '--' + boundary;
  var closing = marker + '--';
  var parts = [];
  var current = [];
  var active = false;
  kspEmlNormalizeLineEndings_(bodyText).split('\n').forEach(function (line) {
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

function kspEmlIsAttachment_(headers, contentType) {
  var disposition = kspEmlParseHeaderParameters_(kspEmlHeader_(headers, 'content-disposition'));
  if (disposition.value === 'attachment') return true;
  if (disposition.parameters.filename) return true;
  if (contentType.parameters.name) return true;
  return false;
}

function kspEmlCollectBodyCandidates_(rawPart, depth, state) {
  var traversal = state || { parts: 0 };
  traversal.parts += 1;
  kspAssert_(traversal.parts <= KSP_FEATURE_FREEZE_DEFAULTS.MAX_EML_PARTS, 'AI_EML_TOO_MANY_PARTS', 'EML contains too many MIME parts.');
  kspAssert_(depth <= KSP_FEATURE_FREEZE_DEFAULTS.MAX_EML_DEPTH, 'AI_EML_TOO_DEEP', 'EML multipart nesting is too deep.');
  var split = kspEmlSplitHeaderBody_(rawPart);
  var headers = kspEmlParseHeaders_(split.headerText);
  var contentType = kspEmlParseHeaderParameters_(kspEmlHeader_(headers, 'content-type') || 'text/plain; charset=utf-8');
  if (kspEmlIsAttachment_(headers, contentType)) return { plain: [], html: [] };
  if (contentType.value.indexOf('multipart/') === 0) {
    var boundary = contentType.parameters.boundary;
    kspAssert_(boundary, 'AI_EML_BOUNDARY_MISSING', 'Multipart EML has no boundary.');
    return kspEmlSplitMultipart_(split.bodyText, boundary).reduce(function (result, part) {
      var nested = kspEmlCollectBodyCandidates_(part, depth + 1, traversal);
      result.plain = result.plain.concat(nested.plain);
      result.html = result.html.concat(nested.html);
      return result;
    }, { plain: [], html: [] });
  }
  if (contentType.value !== 'text/plain' && contentType.value !== 'text/html') return { plain: [], html: [] };
  var decoded = kspEmlDecodePartBody_(split.bodyText, kspEmlHeader_(headers, 'content-transfer-encoding'), contentType.parameters.charset || 'utf-8').trim();
  if (!decoded) return { plain: [], html: [] };
  return contentType.value === 'text/plain' ? { plain: [decoded], html: [] } : { plain: [], html: [decoded] };
}

function kspEmlDecodeHtmlEntities_(value) {
  var named = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' };
  return String(value || '').replace(/&(#x[0-9a-f]+|#\d+|amp|lt|gt|quot|apos|nbsp);/gi, function (_, entity) {
    var lower = entity.toLowerCase();
    if (named[lower] !== undefined) return named[lower];
    if (lower.indexOf('#x') === 0) return String.fromCharCode(parseInt(lower.slice(2), 16));
    return String.fromCharCode(parseInt(lower.slice(1), 10));
  });
}

function kspEmlHtmlToText_(value) {
  return kspEmlDecodeHtmlEntities_(String(value || '')
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

function kspNormalizeEmlText_(rawEml) {
  var normalized = kspEmlNormalizeLineEndings_(rawEml);
  var split = kspEmlSplitHeaderBody_(normalized);
  var headers = kspEmlParseHeaders_(split.headerText);
  var candidates = kspEmlCollectBodyCandidates_(normalized, 0, { parts: 0 });
  var body = candidates.plain.length ? candidates.plain.join('\n\n') : kspEmlHtmlToText_(candidates.html.join('\n\n'));
  var fields = [
    ['Subject', kspEmlDecodeEncodedWords_(kspEmlHeader_(headers, 'subject'))],
    ['From', kspEmlDecodeEncodedWords_(kspEmlHeader_(headers, 'from'))],
    ['To', kspEmlDecodeEncodedWords_(kspEmlHeader_(headers, 'to'))],
    ['Cc', kspEmlDecodeEncodedWords_(kspEmlHeader_(headers, 'cc'))],
    ['Date', kspEmlDecodeEncodedWords_(kspEmlHeader_(headers, 'date'))]
  ];
  var lines = [];
  fields.forEach(function (field) { if (field[1]) lines.push(field[0] + ': ' + field[1]); });
  kspAssert_(body, 'AI_EML_BODY_EMPTY', 'EML contains no indexable non-attachment body.');
  lines.push('', 'Body:', body);
  var output = lines.join('\n').replace(/\n{3,}/g, '\n\n').trim();
  kspAssert_(output.length <= KSP_FEATURE_FREEZE_DEFAULTS.MAX_EML_OUTPUT_CHARS,
    'AI_EML_OUTPUT_TOO_LARGE', 'Normalized EML text is too large.');
  return output;
}

function kspNormalizeEml_(rawEml) {
  return kspNormalizeEmlText_(rawEml);
}
