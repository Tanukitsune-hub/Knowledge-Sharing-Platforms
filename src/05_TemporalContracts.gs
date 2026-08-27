var KSP_TEMPORAL_DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/;
var KSP_TEMPORAL_TIME_RE = /^(?:[01]\d|2[0-3]):[0-5]\d$/;
var KSP_TEMPORAL_ISO_RE = /^(\d{4})-(\d{2})-(\d{2})T(?:[01]\d|2[0-3]):[0-5]\d:[0-5]\d(?:\.\d{1,9})?(?:Z|[+-](?:0\d|1\d|2[0-3]):[0-5]\d)$/;

function kspTemporalIsValidDateKey_(value) {
  var match = KSP_TEMPORAL_DATE_RE.exec(String(value || ''));
  if (!match) return false;
  var year = Number(match[1]);
  var month = Number(match[2]);
  var day = Number(match[3]);
  if (year < 1 || year > 9999 || month < 1 || month > 12 || day < 1) return false;
  var daysInMonth = [31, (year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0)) ? 29 : 28,
    31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  return day <= daysInMonth[month - 1];
}

function kspTemporalIsValidTimeKey_(value) {
  return KSP_TEMPORAL_TIME_RE.test(String(value || ''));
}

function kspTemporalParseStrictIso_(value) {
  var text = String(value || '').trim();
  var match = KSP_TEMPORAL_ISO_RE.exec(text);
  if (!match || !kspTemporalIsValidDateKey_(match[1] + '-' + match[2] + '-' + match[3])) return null;
  var instant = new Date(text);
  return Number.isNaN(instant.getTime()) ? null : instant;
}

function kspCanonicalBusinessDate_(value) {
  if (value === null || value === undefined || value === '') return '';
  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) return '';
    return Utilities.formatDate(value, KSP_DEFAULTS.TIMEZONE, 'yyyy-MM-dd');
  }
  var text = String(value).trim();
  if (kspTemporalIsValidDateKey_(text)) return text;
  var instant = kspTemporalParseStrictIso_(text);
  return instant ? Utilities.formatDate(instant, KSP_DEFAULTS.TIMEZONE, 'yyyy-MM-dd') : '';
}

function kspCanonicalBusinessTime_(value) {
  if (value === null || value === undefined || value === '') return '';
  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) return '';
    return Utilities.formatDate(value, KSP_DEFAULTS.TIMEZONE, 'HH:mm');
  }
  var text = String(value).trim();
  if (kspTemporalIsValidTimeKey_(text)) return text;
  var instant = kspTemporalParseStrictIso_(text);
  return instant ? Utilities.formatDate(instant, KSP_DEFAULTS.TIMEZONE, 'HH:mm') : '';
}

function kspCanonicalInstantIso_(value) {
  if (value === null || value === undefined || value === '') return '';
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? '' : value.toISOString();
  var text = String(value).trim();
  if (kspTemporalIsValidDateKey_(text) || kspTemporalIsValidTimeKey_(text)) return '';
  var instant = kspTemporalParseStrictIso_(text);
  return instant ? instant.toISOString() : '';
}

function kspTemporalInstantComparisonKey_(value) {
  var canonical = kspCanonicalInstantIso_(value);
  return canonical || (value === null || value === undefined ? '' : String(value).trim());
}

function kspIsValidDateKey_(value) {
  return kspTemporalIsValidDateKey_(value);
}

function kspIsValidTimeValue_(value) {
  return kspTemporalIsValidTimeKey_(value);
}
