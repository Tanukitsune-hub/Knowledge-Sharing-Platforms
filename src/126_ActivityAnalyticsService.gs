var KSP_ACTIVITY_ANALYTICS_WORK_ID = '0017';
var KSP_ACTIVITY_ANALYTICS_UNSET = '__UNSET__';

var KSP_ACTIVITY_ANALYTICS_PERIODS = Object.freeze({
  MONTHLY: 'monthly',
  QUARTER: 'quarter',
  CALENDAR_YEAR: 'calendarYear',
  FISCAL_YEAR: 'fiscalYear',
  CUSTOM: 'custom',
  CUMULATIVE: 'cumulative'
});

var KSP_ACTIVITY_ANALYTICS_DIMENSIONS = Object.freeze([
  'counterpartyType', 'counterpartyEntity', 'relatedGp', 'assetClass',
  'team', 'meetingType', 'status'
]);

var KSP_ACTIVITY_ANALYTICS_LIMITS = Object.freeze({
  DRILL: 100,
  BREAKDOWN: 50,
  FILTER_OPTIONS: 100
});

var KSP_ACTIVITY_ANALYTICS_ADMIN_ACTION = 'MEETING_ADMIN_CHECK';

function kspActivityNormalizePeriod_(value) {
  var normalized = String(value || '').trim().toLowerCase()
    .replace(/[\s_-]+/g, '');
  var aliases = {
    month: KSP_ACTIVITY_ANALYTICS_PERIODS.MONTHLY,
    monthly: KSP_ACTIVITY_ANALYTICS_PERIODS.MONTHLY,
    quarter: KSP_ACTIVITY_ANALYTICS_PERIODS.QUARTER,
    quarterly: KSP_ACTIVITY_ANALYTICS_PERIODS.QUARTER,
    calendarquarter: KSP_ACTIVITY_ANALYTICS_PERIODS.QUARTER,
    year: KSP_ACTIVITY_ANALYTICS_PERIODS.CALENDAR_YEAR,
    yearly: KSP_ACTIVITY_ANALYTICS_PERIODS.CALENDAR_YEAR,
    calendaryear: KSP_ACTIVITY_ANALYTICS_PERIODS.CALENDAR_YEAR,
    fiscal: KSP_ACTIVITY_ANALYTICS_PERIODS.FISCAL_YEAR,
    fiscalyear: KSP_ACTIVITY_ANALYTICS_PERIODS.FISCAL_YEAR,
    custom: KSP_ACTIVITY_ANALYTICS_PERIODS.CUSTOM,
    range: KSP_ACTIVITY_ANALYTICS_PERIODS.CUSTOM,
    cumulative: KSP_ACTIVITY_ANALYTICS_PERIODS.CUMULATIVE
  };
  return aliases[normalized] || '';
}

function kspActivityNormalizeDimension_(value) {
  var normalized = String(value || '').trim().toLowerCase()
    .replace(/[\s_-]+/g, '');
  var aliases = {
    counterpartytype: 'counterpartyType',
    counterpartyentity: 'counterpartyEntity',
    entity: 'counterpartyEntity',
    relatedgp: 'relatedGp',
    relatedgps: 'relatedGp',
    assetclass: 'assetClass',
    team: 'team',
    meetingtype: 'meetingType',
    status: 'status'
  };
  return aliases[normalized] || '';
}

function kspActivityCanonicalDateInput_(value) {
  if (value === null || value === undefined || value === '') return '';
  var canonical = kspCanonicalBusinessDate_(value);
  kspAssert_(canonical, 'ACTIVITY_ANALYTICS_DATE_INVALID', '分析対象の日付が不正です。');
  return canonical;
}

function kspActivityNormalizeFilterValue_(value) {
  var text = value === null || value === undefined ? '' : String(value).trim();
  return text === '未設定' ? KSP_ACTIVITY_ANALYTICS_UNSET : text;
}

function kspActivityNormalizeInput_(rawInput) {
  var source = rawInput && typeof rawInput === 'object' ? rawInput : {};
  var suppliedFilters = source.filters && typeof source.filters === 'object' ? source.filters : source;
  var period = kspActivityNormalizePeriod_(source.period || source.periodMode || source.mode || 'monthly');
  var dimension = kspActivityNormalizeDimension_(
    source.dimension || source.breakdownDimension || 'counterpartyType'
  );
  kspAssert_(period, 'ACTIVITY_ANALYTICS_PERIOD_INVALID', '分析期間が不正です。');
  kspAssert_(dimension, 'ACTIVITY_ANALYTICS_DIMENSION_INVALID', '分析項目が不正です。');

  var dateFrom = kspActivityCanonicalDateInput_(
    source.dateFrom !== undefined ? source.dateFrom : source.startDate
  );
  var dateTo = kspActivityCanonicalDateInput_(source.dateTo);
  if (dateFrom && dateTo) {
    kspAssert_(dateFrom <= dateTo, 'ACTIVITY_ANALYTICS_DATE_RANGE_INVALID',
      '分析対象の日付範囲が不正です。');
  }
  if (period === KSP_ACTIVITY_ANALYTICS_PERIODS.CUSTOM) {
    kspAssert_(dateFrom && dateTo, 'ACTIVITY_ANALYTICS_DATE_RANGE_INVALID',
      'カスタム期間には開始日と終了日が必要です。');
  }

  var drillLimit = source.drillLimit === undefined ? source.meetingLimit : source.drillLimit;
  var breakdownLimit = source.breakdownLimit;
  drillLimit = drillLimit === undefined || drillLimit === '' ? KSP_ACTIVITY_ANALYTICS_LIMITS.DRILL : Number(drillLimit);
  breakdownLimit = breakdownLimit === undefined || breakdownLimit === ''
    ? KSP_ACTIVITY_ANALYTICS_LIMITS.BREAKDOWN : Number(breakdownLimit);
  kspAssert_(Number.isFinite(drillLimit) && drillLimit > 0 && Math.floor(drillLimit) === drillLimit &&
    drillLimit <= KSP_ACTIVITY_ANALYTICS_LIMITS.DRILL, 'ACTIVITY_ANALYTICS_LIMIT_INVALID',
    '分析対象Meeting件数上限が不正です。');
  kspAssert_(Number.isFinite(breakdownLimit) && breakdownLimit > 0 && Math.floor(breakdownLimit) === breakdownLimit &&
    breakdownLimit <= KSP_ACTIVITY_ANALYTICS_LIMITS.BREAKDOWN, 'ACTIVITY_ANALYTICS_LIMIT_INVALID',
    '分析内訳件数上限が不正です。');

  return {
    period: period,
    dimension: dimension,
    dateFrom: dateFrom,
    dateTo: dateTo,
    filters: {
      counterpartyType: kspActivityNormalizeFilterValue_(suppliedFilters.counterpartyType),
      counterpartyEntity: kspActivityNormalizeFilterValue_(
        suppliedFilters.counterpartyEntityKey || suppliedFilters.counterpartyEntity || suppliedFilters.counterpartyEntityId
      ),
      counterpartyId: kspActivityNormalizeFilterValue_(suppliedFilters.counterpartyId),
      relatedGp: kspActivityNormalizeFilterValue_(suppliedFilters.relatedGp || suppliedFilters.relatedGpId),
      assetClass: kspActivityNormalizeFilterValue_(suppliedFilters.assetClass || suppliedFilters.assetClassId),
      team: kspActivityNormalizeFilterValue_(suppliedFilters.team || suppliedFilters.teamId),
      meetingType: kspActivityNormalizeFilterValue_(suppliedFilters.meetingType || suppliedFilters.meetingTypeCode),
      status: kspActivityNormalizeFilterValue_(suppliedFilters.status || suppliedFilters.filterStatus)
    },
    drillLimit: drillLimit,
    breakdownLimit: breakdownLimit
  };
}

function kspActivityRowCounterpartyType_(row) {
  return String(kspMeetingCounterpartyType_(row) || '').trim();
}

function kspActivityRowCounterpartyId_(row) {
  return String(kspMeetingCounterpartyId_(row) || '').trim();
}

function kspActivityRowCounterpartyKey_(row) {
  var type = kspActivityRowCounterpartyType_(row);
  var id = kspActivityRowCounterpartyId_(row);
  return type && id ? type + ':' + id : '';
}

function kspActivityRowRelatedGpIds_(row) {
  return kspMaintenanceSplitCodes_(kspMeetingRelatedGpIds_(row));
}

function kspActivityValueMatches_(actual, requested) {
  if (!requested) return true;
  if (requested === KSP_ACTIVITY_ANALYTICS_UNSET) return !actual;
  return String(actual || '') === String(requested);
}

function kspActivityRowMatchesFilters_(row, input, includeDateRange) {
  var filters = input.filters || {};
  var date = kspCanonicalBusinessDate_(row.Date);
  if (!date) return false;
  if (includeDateRange && input.dateFrom && date < input.dateFrom) return false;
  if (includeDateRange && input.dateTo && date > input.dateTo) return false;
  if (!kspActivityValueMatches_(kspActivityRowCounterpartyType_(row), filters.counterpartyType)) return false;
  if (filters.counterpartyEntity && filters.counterpartyEntity !== KSP_ACTIVITY_ANALYTICS_UNSET &&
      filters.counterpartyEntity.indexOf(':') !== -1) {
    if (!kspActivityValueMatches_(kspActivityRowCounterpartyKey_(row), filters.counterpartyEntity)) return false;
  } else if (!kspActivityValueMatches_(kspActivityRowCounterpartyId_(row), filters.counterpartyEntity)) {
    return false;
  }
  if (filters.counterpartyId && !kspActivityValueMatches_(kspActivityRowCounterpartyId_(row), filters.counterpartyId)) return false;
  if (filters.relatedGp) {
    var relatedGpIds = kspActivityRowRelatedGpIds_(row);
    if (filters.relatedGp === KSP_ACTIVITY_ANALYTICS_UNSET) {
      if (relatedGpIds.length) return false;
    } else if (relatedGpIds.indexOf(filters.relatedGp) === -1) {
      return false;
    }
  }
  if (!kspActivityValueMatches_(String(row.Asset_Class_ID || '').trim(), filters.assetClass)) return false;
  if (!kspActivityValueMatches_(String(row.Team_ID || '').trim(), filters.team)) return false;
  if (filters.meetingType) {
    var meetingTypes = kspMaintenanceSplitCodes_(row.Meeting_Type_Codes);
    if (filters.meetingType === KSP_ACTIVITY_ANALYTICS_UNSET) {
      if (meetingTypes.length) return false;
    } else if (meetingTypes.indexOf(filters.meetingType) === -1) {
      return false;
    }
  }
  if (!kspActivityValueMatches_(String(row.Status || '').trim(), filters.status)) return false;
  return true;
}

function kspActivityDateParts_(dateKey) {
  var parts = String(dateKey || '').split('-');
  return { year: Number(parts[0]), month: Number(parts[1]), day: Number(parts[2]) };
}

function kspActivityDaysInMonth_(year, month) {
  if (month === 2) return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0) ? 29 : 28;
  return [4, 6, 9, 11].indexOf(month) !== -1 ? 30 : 31;
}

function kspActivityDateKey_(year, month, day) {
  return String(year).padStart(4, '0') + '-' + String(month).padStart(2, '0') + '-' + String(day).padStart(2, '0');
}

function kspActivityMonthStart_(dateKey) {
  var parts = kspActivityDateParts_(dateKey);
  return kspActivityDateKey_(parts.year, parts.month, 1);
}

function kspActivityMonthEnd_(dateKey) {
  var parts = kspActivityDateParts_(dateKey);
  return kspActivityDateKey_(parts.year, parts.month, kspActivityDaysInMonth_(parts.year, parts.month));
}

function kspActivityShiftMonth_(dateKey, offset) {
  var parts = kspActivityDateParts_(dateKey);
  var zeroBasedMonth = parts.year * 12 + parts.month - 1 + offset;
  var year = Math.floor(zeroBasedMonth / 12);
  var month = zeroBasedMonth % 12 + 1;
  return kspActivityDateKey_(year, month, 1);
}

function kspActivityNextDate_(dateKey) {
  var parts = kspActivityDateParts_(dateKey);
  if (parts.day < kspActivityDaysInMonth_(parts.year, parts.month)) {
    return kspActivityDateKey_(parts.year, parts.month, parts.day + 1);
  }
  return kspActivityShiftMonth_(dateKey, 1);
}

function kspActivityFiscalStartYear_(dateKey) {
  var parts = kspActivityDateParts_(dateKey);
  return parts.month >= 4 ? parts.year : parts.year - 1;
}

function kspActivityBucketForDate_(dateKey, period) {
  var parts = kspActivityDateParts_(dateKey);
  if (period === KSP_ACTIVITY_ANALYTICS_PERIODS.CUSTOM) {
    return { key: dateKey, startDate: dateKey, endDate: dateKey };
  }
  if (period === KSP_ACTIVITY_ANALYTICS_PERIODS.MONTHLY ||
      period === KSP_ACTIVITY_ANALYTICS_PERIODS.CUMULATIVE) {
    var monthStart = kspActivityDateKey_(parts.year, parts.month, 1);
    return { key: monthStart.slice(0, 7), startDate: monthStart, endDate: kspActivityMonthEnd_(monthStart) };
  }
  if (period === KSP_ACTIVITY_ANALYTICS_PERIODS.QUARTER) {
    var quarterStartMonth = Math.floor((parts.month - 1) / 3) * 3 + 1;
    var quarterStart = kspActivityDateKey_(parts.year, quarterStartMonth, 1);
    return {
      key: String(parts.year).padStart(4, '0') + '-Q' + String(Math.floor((parts.month - 1) / 3) + 1),
      startDate: quarterStart,
      endDate: kspActivityMonthEnd_(kspActivityShiftMonth_(quarterStart, 2))
    };
  }
  if (period === KSP_ACTIVITY_ANALYTICS_PERIODS.CALENDAR_YEAR) {
    return {
      key: String(parts.year).padStart(4, '0'),
      startDate: kspActivityDateKey_(parts.year, 1, 1),
      endDate: kspActivityDateKey_(parts.year, 12, 31)
    };
  }
  var fiscalStartYear = kspActivityFiscalStartYear_(dateKey);
  return {
    key: 'FY' + String(fiscalStartYear).padStart(4, '0'),
    startDate: kspActivityDateKey_(fiscalStartYear, 4, 1),
    endDate: kspActivityDateKey_(fiscalStartYear + 1, 3, 31)
  };
}

function kspActivityNextBucket_(bucket, period) {
  if (period === KSP_ACTIVITY_ANALYTICS_PERIODS.CUSTOM) {
    var nextDate = kspActivityNextDate_(bucket.startDate);
    return { key: nextDate, startDate: nextDate, endDate: nextDate };
  }
  var monthOffset = period === KSP_ACTIVITY_ANALYTICS_PERIODS.QUARTER ? 3
    : period === KSP_ACTIVITY_ANALYTICS_PERIODS.CALENDAR_YEAR ||
      period === KSP_ACTIVITY_ANALYTICS_PERIODS.FISCAL_YEAR ? 12 : 1;
  return kspActivityBucketForDate_(kspActivityShiftMonth_(bucket.startDate, monthOffset), period);
}

function kspActivityBuildBucketSequence_(startDate, endDate, period) {
  if (!startDate || !endDate) return [];
  var first = kspActivityBucketForDate_(startDate, period);
  var last = kspActivityBucketForDate_(endDate, period);
  var buckets = [];
  var current = first;
  for (var guard = 0; guard < 10000 && current.startDate <= last.startDate; guard += 1) {
    buckets.push(current);
    current = kspActivityNextBucket_(current, period);
  }
  kspAssert_(buckets.length < 10000, 'ACTIVITY_ANALYTICS_DATE_RANGE_INVALID',
    '分析対象の期間が長すぎます。');
  return buckets;
}

function kspActivityBuildMetrics_(rows) {
  var entities = {};
  var activeMeetingCount = 0;
  var openFollowUpCount = 0;
  (rows || []).forEach(function (row) {
    var entityKey = kspActivityRowCounterpartyKey_(row);
    if (entityKey) entities[entityKey] = true;
    if (String(row.Status || '') === KSP_STATUS.ACTIVE) activeMeetingCount += 1;
    if (String(row.Status || '') === KSP_STATUS.ACTIVE && kspToBoolean_(row.Follow_Up_Required, false)) {
      openFollowUpCount += 1;
    }
  });
  return {
    meetingCount: (rows || []).length,
    activeMeetingCount: activeMeetingCount,
    distinctCounterpartyCount: Object.keys(entities).length,
    openFollowUpCount: openFollowUpCount
  };
}

function kspActivityBuildSeries_(rows, startDate, endDate, period) {
  var buckets = kspActivityBuildBucketSequence_(startDate, endDate, period);
  return buckets.map(function (bucket) {
    var bucketRows = (rows || []).filter(function (row) {
      var date = kspCanonicalBusinessDate_(row.Date);
      return date >= bucket.startDate && date <= bucket.endDate;
    });
    var metrics = kspActivityBuildMetrics_(bucketRows);
    var result = Object.assign({
      key: bucket.key,
      label: bucket.key,
      startDate: bucket.startDate,
      endDate: bucket.endDate,
      bucketMeetingCount: metrics.meetingCount
    }, metrics);
    return result;
  });
}

function kspActivityApplyCumulativeSeries_(series, rows) {
  var output = [];
  (series || []).forEach(function (item) {
    var cumulativeRows = (rows || []).filter(function (row) {
      var date = kspCanonicalBusinessDate_(row.Date);
      return date <= item.endDate;
    });
    var metrics = kspActivityBuildMetrics_(cumulativeRows);
    var result = Object.assign({}, item, {
      meetingCount: metrics.meetingCount,
      activeMeetingCount: metrics.activeMeetingCount,
      distinctCounterpartyCount: metrics.distinctCounterpartyCount,
      openFollowUpCount: metrics.openFollowUpCount,
      cumulativeMeetingCount: metrics.meetingCount,
      cumulativeActiveMeetingCount: metrics.activeMeetingCount,
      cumulativeDistinctCounterpartyCount: metrics.distinctCounterpartyCount,
      cumulativeOpenFollowUpCount: metrics.openFollowUpCount
    });
    output.push(result);
  });
  return output;
}

function kspActivityDimensionValues_(row, dimension) {
  if (dimension === 'counterpartyType') return [kspActivityRowCounterpartyType_(row) || KSP_ACTIVITY_ANALYTICS_UNSET];
  if (dimension === 'counterpartyEntity') return [kspActivityRowCounterpartyKey_(row) || KSP_ACTIVITY_ANALYTICS_UNSET];
  if (dimension === 'relatedGp') {
    var relatedGpIds = kspActivityRowRelatedGpIds_(row);
    return relatedGpIds.length ? relatedGpIds : [KSP_ACTIVITY_ANALYTICS_UNSET];
  }
  if (dimension === 'assetClass') return [String(row.Asset_Class_ID || '').trim() || KSP_ACTIVITY_ANALYTICS_UNSET];
  if (dimension === 'team') return [String(row.Team_ID || '').trim() || KSP_ACTIVITY_ANALYTICS_UNSET];
  if (dimension === 'meetingType') {
    var meetingTypes = kspMaintenanceSplitCodes_(row.Meeting_Type_Codes);
    return meetingTypes.length ? meetingTypes : [KSP_ACTIVITY_ANALYTICS_UNSET];
  }
  return [String(row.Status || '').trim() || KSP_ACTIVITY_ANALYTICS_UNSET];
}

function kspActivityDisplayValue_(value) {
  return value === KSP_ACTIVITY_ANALYTICS_UNSET ? '未設定' : String(value || '');
}

function kspActivityBuildBreakdown_(rows, dimension, limit) {
  var grouped = {};
  (rows || []).forEach(function (row) {
    kspActivityDimensionValues_(row, dimension).forEach(function (value) {
      if (!grouped[value]) grouped[value] = [];
      grouped[value].push(row);
    });
  });
  var items = Object.keys(grouped).map(function (value) {
    return Object.assign({
      key: value,
      value: value,
      label: kspActivityDisplayValue_(value)
    }, kspActivityBuildMetrics_(grouped[value]));
  }).sort(function (left, right) {
    return right.meetingCount - left.meetingCount ||
      left.label.localeCompare(right.label, 'ja') || left.key.localeCompare(right.key);
  });
  return {
    dimension: dimension,
    totalCount: items.length,
    items: items.slice(0, limit),
    omittedCount: Math.max(0, items.length - limit)
  };
}

function kspActivityBuildFilterOption_(value) {
  return { value: value, label: kspActivityDisplayValue_(value) };
}

function kspActivityBuildFilterOptions_(rows) {
  var sets = {
    counterpartyTypes: {}, counterpartyEntities: {}, relatedGps: {},
    assetClasses: {}, teams: {}, meetingTypes: {}, statuses: {}
  };
  (rows || []).forEach(function (row) {
    var type = kspActivityRowCounterpartyType_(row) || KSP_ACTIVITY_ANALYTICS_UNSET;
    var entity = kspActivityRowCounterpartyKey_(row) || KSP_ACTIVITY_ANALYTICS_UNSET;
    var related = kspActivityRowRelatedGpIds_(row);
    sets.counterpartyTypes[type] = true;
    sets.counterpartyEntities[entity] = true;
    (related.length ? related : [KSP_ACTIVITY_ANALYTICS_UNSET]).forEach(function (value) { sets.relatedGps[value] = true; });
    sets.assetClasses[String(row.Asset_Class_ID || '').trim() || KSP_ACTIVITY_ANALYTICS_UNSET] = true;
    sets.teams[String(row.Team_ID || '').trim() || KSP_ACTIVITY_ANALYTICS_UNSET] = true;
    var meetingTypes = kspMaintenanceSplitCodes_(row.Meeting_Type_Codes);
    (meetingTypes.length ? meetingTypes : [KSP_ACTIVITY_ANALYTICS_UNSET]).forEach(function (value) { sets.meetingTypes[value] = true; });
    sets.statuses[String(row.Status || '').trim() || KSP_ACTIVITY_ANALYTICS_UNSET] = true;
  });
  function mapSet(set) {
    return Object.keys(set).map(kspActivityBuildFilterOption_).sort(function (left, right) {
      if (left.value === KSP_ACTIVITY_ANALYTICS_UNSET) return 1;
      if (right.value === KSP_ACTIVITY_ANALYTICS_UNSET) return -1;
      return left.label.localeCompare(right.label, 'ja') || left.value.localeCompare(right.value);
    }).slice(0, KSP_ACTIVITY_ANALYTICS_LIMITS.FILTER_OPTIONS);
  }
  return {
    counterpartyTypes: mapSet(sets.counterpartyTypes),
    counterpartyEntities: mapSet(sets.counterpartyEntities),
    relatedGps: mapSet(sets.relatedGps),
    assetClasses: mapSet(sets.assetClasses),
    teams: mapSet(sets.teams),
    meetingTypes: mapSet(sets.meetingTypes),
    statuses: mapSet(sets.statuses)
  };
}

function kspActivityMapMeeting_(row) {
  var relatedGpIds = kspActivityRowRelatedGpIds_(row);
  var meetingTypeCodes = kspMaintenanceSplitCodes_(row.Meeting_Type_Codes);
  var documentUrl = '';
  if (typeof kspGpWorkspaceSafeLink_ === 'function') {
    documentUrl = kspGpWorkspaceSafeLink_(row.Doc_URL, row.Doc_File_ID);
  }
  return {
    meetingId: String(row.Meeting_ID || ''),
    date: kspCanonicalBusinessDate_(row.Date),
    time: kspCanonicalBusinessTime_(row.Time),
    counterpartyType: kspActivityRowCounterpartyType_(row),
    counterpartyId: kspActivityRowCounterpartyId_(row),
    counterpartyEntityKey: kspActivityRowCounterpartyKey_(row),
    relatedGpIds: relatedGpIds,
    assetClassId: String(row.Asset_Class_ID || ''),
    teamId: String(row.Team_ID || ''),
    meetingTypeCodes: meetingTypeCodes,
    followUpRequired: kspToBoolean_(row.Follow_Up_Required, false),
    status: String(row.Status || ''),
    version: Number(row.Version || 0),
    updatedAt: kspCanonicalInstantIso_(row.Updated_At),
    documentUrl: documentUrl,
    adminCheckCompleted: kspToBoolean_(row.Admin_Check_Completed, false),
    adminCheckUpdatedAt: kspCanonicalInstantIso_(row.Admin_Check_Updated_At),
    adminCheckUpdatedBy: String(row.Admin_Check_Updated_By || '')
  };
}

function kspActivityLoadContext_(environment, requireAudit) {
  var state = environment.getInstallationState();
  kspAssert_(state && state.resources, 'INSTALLATION_STATE_MISSING', 'Installation stateがありません。');
  var backendSpreadsheetId = state.resources[KSP_RESOURCE_KEYS.BACKEND_SPREADSHEET];
  var auditSpreadsheetId = state.resources[KSP_RESOURCE_KEYS.AUDIT_SPREADSHEET];
  kspAssert_(backendSpreadsheetId, 'BACKEND_SPREADSHEET_MISSING', 'Backend Spreadsheetがありません。');
  if (requireAudit) kspAssert_(auditSpreadsheetId, 'AUDIT_SPREADSHEET_MISSING', 'Audit Spreadsheetがありません。');
  return {
    state: state,
    backendSpreadsheetId: backendSpreadsheetId,
    auditSpreadsheetId: auditSpreadsheetId
  };
}

function kspActivityResolveBounds_(rows, input) {
  var datedRows = (rows || []).map(function (row) { return kspCanonicalBusinessDate_(row.Date); })
    .filter(Boolean).sort();
  var startDate = input.dateFrom || (datedRows.length ? datedRows[0] : '');
  var endDate = input.dateTo || (datedRows.length ? datedRows[datedRows.length - 1] : '');
  if (startDate && endDate) {
    kspAssert_(startDate <= endDate, 'ACTIVITY_ANALYTICS_DATE_RANGE_INVALID',
      '分析対象の日付範囲が不正です。');
  }
  return { startDate: startDate, endDate: endDate };
}

function kspGetMeetingActivityAnalytics_(environment, rawInput) {
  try {
    var context = kspActivityLoadContext_(environment, false);
    var input = kspActivityNormalizeInput_(rawInput);
    var rows = environment.readRows(context.backendSpreadsheetId, KSP_SHEET_NAMES.MEETING_INDEX) || [];
    var filterRows = rows.filter(function (row) { return kspActivityRowMatchesFilters_(row, input, false); });
    var bounds = kspActivityResolveBounds_(filterRows, input);
    var matchingRows = filterRows.filter(function (row) {
      var date = kspCanonicalBusinessDate_(row.Date);
      return (!input.dateFrom || date >= input.dateFrom) && (!input.dateTo || date <= input.dateTo);
    });
    var series = kspActivityBuildSeries_(matchingRows, bounds.startDate, bounds.endDate, input.period);
    if (input.period === KSP_ACTIVITY_ANALYTICS_PERIODS.CUMULATIVE) {
      series = kspActivityApplyCumulativeSeries_(series, matchingRows);
    }
    var drillAll = matchingRows.slice().sort(function (left, right) {
      return kspCanonicalBusinessDate_(right.Date).localeCompare(kspCanonicalBusinessDate_(left.Date)) ||
        kspTemporalInstantComparisonKey_(right.Updated_At).localeCompare(kspTemporalInstantComparisonKey_(left.Updated_At)) ||
        String(left.Meeting_ID || '').localeCompare(String(right.Meeting_ID || ''));
    }).map(kspActivityMapMeeting_);
    var drill = {
      totalCount: drillAll.length,
      records: drillAll.slice(0, input.drillLimit),
      omittedCount: Math.max(0, drillAll.length - input.drillLimit)
    };
    var singleMonth = input.period === KSP_ACTIVITY_ANALYTICS_PERIODS.MONTHLY && series.length === 1;
    var breakdown = kspActivityBuildBreakdown_(matchingRows, input.dimension, input.breakdownLimit);
    return {
      ok: true,
      workId: KSP_ACTIVITY_ANALYTICS_WORK_ID,
      period: {
        mode: input.period,
        dateFrom: input.dateFrom,
        dateTo: input.dateTo,
        startDate: bounds.startDate,
        endDate: bounds.endDate,
        bucketCount: series.length
      },
      dimension: input.dimension,
      filters: kspDeepClone_(input.filters),
      headline: kspActivityBuildMetrics_(matchingRows),
      series: series,
      breakdown: breakdown,
      drill: drill,
      omittedCounts: { drill: drill.omittedCount, breakdown: breakdown.omittedCount },
      filterOptions: kspActivityBuildFilterOptions_(rows),
      adminChecks: singleMonth ? drill.records : [],
      adminCheckAvailable: singleMonth,
      readModel: { source: 'Meeting_Index', documentBodyRead: false }
    };
  } catch (error) {
    var code = kspGetErrorCode_(error);
    return {
      ok: false,
      workId: KSP_ACTIVITY_ANALYTICS_WORK_ID,
      error: { code: code, message: kspSafePublicErrorMessage_(code, 'ANALYTICS') }
    };
  }
}

function kspNormalizeBooleanInput_(value) {
  if (value === true || value === false) return value;
  if (value === 'true' || value === '1' || value === 1) return true;
  if (value === 'false' || value === '0' || value === 0) return false;
  return null;
}

function kspNormalizeMeetingAdminCheckInput_(rawInput) {
  var source = rawInput && typeof rawInput === 'object' ? rawInput : {};
  var meetingId = kspMaintenanceTrim_(source.meetingId || source.id);
  var desired = kspNormalizeBooleanInput_(
    source.desiredCompleted !== undefined ? source.desiredCompleted : source.completed
  );
  var expected = source.expectedAdminCheckCompleted !== undefined
    ? source.expectedAdminCheckCompleted : source.expectedCompleted;
  var expectedCompleted = kspNormalizeBooleanInput_(expected);
  var expectedUpdatedAt = source.expectedAdminCheckUpdatedAt !== undefined
    ? source.expectedAdminCheckUpdatedAt : source.expectedUpdatedAt;
  expectedUpdatedAt = expectedUpdatedAt === null || expectedUpdatedAt === undefined ? '' : String(expectedUpdatedAt).trim();
  if (expectedUpdatedAt) {
    expectedUpdatedAt = kspCanonicalInstantIso_(expectedUpdatedAt);
    kspAssert_(expectedUpdatedAt, 'ADMIN_CHECK_STATE_INVALID', '月次管理状態の更新トークンが不正です。');
  }
  kspAssert_(meetingId, 'ADMIN_CHECK_MEETING_ID_REQUIRED', 'Meeting IDがありません。');
  if (typeof kspParseMeetingId_ === 'function') kspParseMeetingId_(meetingId);
  kspAssert_(desired !== null && expectedCompleted !== null, 'ADMIN_CHECK_STATE_REQUIRED',
    '月次管理状態がありません。');
  return {
    meetingId: meetingId,
    desiredCompleted: desired,
    expectedCompleted: expectedCompleted,
    expectedUpdatedAt: expectedUpdatedAt
  };
}

function kspMeetingAdminCheckSnapshot_(row) {
  return {
    Admin_Check_Completed: kspToBoolean_(row && row.Admin_Check_Completed, false),
    Admin_Check_Updated_At: kspCanonicalInstantIso_(row && row.Admin_Check_Updated_At),
    Admin_Check_Updated_By: String(row && row.Admin_Check_Updated_By || '')
  };
}

function kspUpdateMeetingAdminCheck_(environment, rawInput) {
  var warnings = [];
  var actor = 'UNIDENTIFIED';
  var context = null;
  var input = null;
  try {
    input = kspNormalizeMeetingAdminCheckInput_(rawInput);
    actor = kspGetMaintenanceActorSafely_(environment, warnings);
    context = kspActivityLoadContext_(environment, true);
    var result = environment.updateMeetingAdminCheckAtomic(
      input.meetingId, input.expectedCompleted, input.expectedUpdatedAt,
      input.desiredCompleted, actor, environment.nowIso()
    );
    var before = kspMeetingAdminCheckSnapshot_(result.before);
    var after = kspMeetingAdminCheckSnapshot_(result.after);
    if (result.changed) {
      kspTryMaintenanceAudit_(environment, context.auditSpreadsheetId, {
        timestamp: environment.nowIso(), actor: actor, action: KSP_ACTIVITY_ANALYTICS_ADMIN_ACTION,
        targetType: 'Meeting', targetId: input.meetingId, result: KSP_AUDIT_RESULTS.SUCCESS,
        before: before, after: after,
        changedFields: ['Admin_Check_Completed', 'Admin_Check_Updated_At', 'Admin_Check_Updated_By']
      }, warnings);
    }
    return {
      ok: true,
      workId: KSP_ACTIVITY_ANALYTICS_WORK_ID,
      meetingId: input.meetingId,
      changed: Boolean(result.changed),
      idempotent: !result.changed,
      adminCheck: {
        completed: after.Admin_Check_Completed,
        updatedAt: after.Admin_Check_Updated_At,
        updatedBy: after.Admin_Check_Updated_By
      },
      warnings: warnings
    };
  } catch (error) {
    return {
      ok: false,
      workId: KSP_ACTIVITY_ANALYTICS_WORK_ID,
      error: { code: kspGetErrorCode_(error), message: kspSafePublicErrorMessage_(kspGetErrorCode_(error), 'ANALYTICS') },
      warnings: warnings
    };
  }
}
