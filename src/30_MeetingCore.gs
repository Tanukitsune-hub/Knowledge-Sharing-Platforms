var KSP_MEETING_WORK_ID = '0005';
var KSP_MEETING_APP_VERSION = '0.2.0';
var KSP_MEETING_DRAFT_TTL_MS = 24 * 60 * 60 * 1000;

var KSP_OPTION_TYPES = Object.freeze({
  LOCATION: 'LOCATION',
  ASSET_CLASS: 'ASSET_CLASS',
  CAPITAL_TYPE: 'CAPITAL_TYPE'
});

var KSP_AUDIT_RESULTS = Object.freeze({
  SUCCESS: 'Success',
  FAILURE: 'Failure'
});

var KSP_MEETING_ACTIONS = Object.freeze({
  CREATE: 'MEETING_CREATE'
});

var KSP_MEETING_LIMITS = Object.freeze({
  SHORT_TEXT: 500,
  NOTES: 20000
});

function kspNormalizeMeetingInput(input) {
  var source = input && typeof input === 'object' ? input : {};
  return {
    date: kspTrimMeetingField(source.date),
    time: kspTrimMeetingField(source.time),
    locationId: kspTrimMeetingField(source.locationId),
    gpId: kspTrimMeetingField(source.gpId),
    assetClassId: kspTrimMeetingField(source.assetClassId),
    capitalTypeId: kspTrimMeetingField(source.capitalTypeId),
    counterparty: kspTrimMeetingField(source.counterparty),
    internalParticipants: kspTrimMeetingField(source.internalParticipants),
    notes: kspNormalizeMeetingNotes(source.notes),
    retryMeetingId: kspTrimMeetingField(source.retryMeetingId),
    retryFingerprint: kspTrimMeetingField(source.retryFingerprint)
  };
}

function kspTrimMeetingField(value) {
  return value === null || value === undefined ? '' : String(value).trim();
}

function kspNormalizeMeetingNotes(value) {
  if (value === null || value === undefined) {
    return '';
  }
  return String(value).replace(/\r\n?/g, '\n').replace(/\u0000/g, '');
}

function kspBuildMeetingCatalog(gpRows, optionRows) {
  var gps = (gpRows || [])
    .filter(function (row) { return String(row.Status) === KSP_STATUS.ACTIVE; })
    .map(function (row) {
      return { id: String(row.GP_ID), name: String(row.GP_Name) };
    })
    .filter(function (row) { return row.id && row.name; })
    .sort(function (left, right) {
      return left.name.toLowerCase().localeCompare(right.name.toLowerCase(), 'en');
    });

  var options = (optionRows || [])
    .filter(function (row) { return String(row.Status) === KSP_STATUS.ACTIVE; })
    .map(function (row) {
      return {
        id: String(row.Option_ID),
        type: String(row.Type),
        name: String(row.Name),
        sortOrder: Number(row.Sort_Order) || 0
      };
    })
    .filter(function (row) { return row.id && row.type && row.name; });

  function byType(type) {
    return options
      .filter(function (row) { return row.type === type; })
      .sort(function (left, right) {
        if (left.sortOrder !== right.sortOrder) {
          return left.sortOrder - right.sortOrder;
        }
        return left.name.localeCompare(right.name, 'ja');
      })
      .map(function (row) {
        return { id: row.id, name: row.name, sortOrder: row.sortOrder };
      });
  }

  return {
    gps: gps,
    assetClasses: byType(KSP_OPTION_TYPES.ASSET_CLASS),
    capitalTypes: byType(KSP_OPTION_TYPES.CAPITAL_TYPE),
    locations: byType(KSP_OPTION_TYPES.LOCATION)
  };
}

function kspValidateMeetingInput(normalizedInput, catalog) {
  var input = normalizedInput || {};
  var safeCatalog = catalog || { gps: [], assetClasses: [], capitalTypes: [], locations: [] };

  kspAssert(input.date, 'MEETING_DATE_REQUIRED', '日付は必須です。');
  kspAssert(input.gpId, 'MEETING_GP_REQUIRED', 'GPは必須です。');
  kspAssert(input.assetClassId, 'MEETING_ASSET_CLASS_REQUIRED', 'Asset Classは必須です。');
  kspAssert(kspIsValidDateKey(input.date), 'MEETING_DATE_INVALID', '日付はYYYY-MM-DD形式で入力してください。');
  kspAssert(!input.time || kspIsValidTimeValue(input.time), 'MEETING_TIME_INVALID', '時間はHH:MM形式で入力してください。');
  kspAssert(input.counterparty.length <= KSP_MEETING_LIMITS.SHORT_TEXT,
    'MEETING_COUNTERPARTY_TOO_LONG', '面談相手は500文字以内で入力してください。');
  kspAssert(input.internalParticipants.length <= KSP_MEETING_LIMITS.SHORT_TEXT,
    'MEETING_INTERNAL_PARTICIPANTS_TOO_LONG', '当社側は500文字以内で入力してください。');
  kspAssert(input.notes.length <= KSP_MEETING_LIMITS.NOTES,
    'MEETING_NOTES_TOO_LONG', '面談内容は20,000文字以内で入力してください。');

  var hasRetryId = Boolean(input.retryMeetingId);
  var hasRetryFingerprint = Boolean(input.retryFingerprint);
  kspAssert(hasRetryId === hasRetryFingerprint, 'MEETING_RETRY_CONTEXT_INCOMPLETE',
    'Retry Meeting ID and fingerprint must be supplied together.');
  if (hasRetryId) {
    kspParseMeetingId(input.retryMeetingId);
    kspAssert(/^[0-9a-f]{8}$/.test(input.retryFingerprint), 'MEETING_RETRY_FINGERPRINT_INVALID',
      'Retry fingerprint is invalid.');
  }

  var selected = {
    gp: kspRequireCatalogItem(safeCatalog.gps, input.gpId, 'MEETING_GP_UNAVAILABLE', '選択されたGPは利用できません。'),
    assetClass: kspRequireCatalogItem(
      safeCatalog.assetClasses,
      input.assetClassId,
      'MEETING_ASSET_CLASS_UNAVAILABLE',
      '選択されたAsset Classは利用できません。'
    ),
    capitalType: null,
    location: null
  };

  if (input.capitalTypeId) {
    selected.capitalType = kspRequireCatalogItem(
      safeCatalog.capitalTypes,
      input.capitalTypeId,
      'MEETING_CAPITAL_TYPE_UNAVAILABLE',
      '選択されたEquity / Debtは利用できません。'
    );
  }

  if (input.locationId) {
    selected.location = kspRequireCatalogItem(
      safeCatalog.locations,
      input.locationId,
      'MEETING_LOCATION_UNAVAILABLE',
      '選択された面談場所は利用できません。'
    );
  }

  return selected;
}

function kspRequireCatalogItem(items, id, code, message) {
  var found = (items || []).filter(function (item) { return String(item.id) === String(id); })[0];
  kspAssert(found, code, message);
  return found;
}

function kspIsValidDateKey(value) {
  var match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value || ''));
  if (!match) {
    return false;
  }
  var year = Number(match[1]);
  var month = Number(match[2]);
  var day = Number(match[3]);
  var date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}

function kspIsValidTimeValue(value) {
  return /^(?:[01]\d|2[0-3]):[0-5]\d$/.test(String(value || ''));
}

function kspFormatMeetingId(sequenceNumber) {
  var sequence = Number(sequenceNumber);
  kspAssert(Number.isFinite(sequence) && sequence > 0 && Math.floor(sequence) === sequence,
    'MEETING_SEQUENCE_INVALID', 'Meeting ID sequence must be a positive integer.');
  return 'MTG-' + String(sequence).padStart(6, '0');
}

function kspParseMeetingId(meetingId) {
  var match = /^MTG-(\d{6})$/.exec(String(meetingId || ''));
  kspAssert(match, 'MEETING_ID_INVALID', 'Meeting ID is invalid.');
  var sequence = Number(match[1]);
  kspAssert(sequence > 0, 'MEETING_ID_INVALID', 'Meeting ID is invalid.');
  return sequence;
}

function kspBuildMeetingRequestFingerprint(input) {
  var canonical = [
    input.date,
    input.time,
    input.locationId,
    input.gpId,
    input.assetClassId,
    input.capitalTypeId,
    input.counterparty,
    input.internalParticipants,
    input.notes
  ].map(function (value) { return String(value || ''); }).join('\u001f');

  var hash = 2166136261;
  for (var index = 0; index < canonical.length; index += 1) {
    hash ^= canonical.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return ('00000000' + (hash >>> 0).toString(16)).slice(-8);
}

function kspBuildMeetingFilename(input, selected, meetingId) {
  var segments = [input.date, selected.gp.name, selected.assetClass.name];
  if (selected.capitalType) {
    segments.push(selected.capitalType.name);
  }
  segments.push(meetingId);

  var normalizedSegments = segments.map(kspNormalizeGeneratedNameSegment);
  kspAssert(normalizedSegments.every(function (segment) { return segment !== ''; }),
    'MEETING_FILENAME_INVALID', 'Meeting filename contains an empty required segment.');
  return normalizedSegments.join('_');
}

function kspBuildMeetingDocumentText(input, selected) {
  var lines = ['日付: ' + input.date];
  if (input.time) lines.push('時間: ' + input.time);
  if (selected.location) lines.push('面談場所: ' + selected.location.name);
  lines.push('GP: ' + selected.gp.name);
  lines.push('Asset Class: ' + selected.assetClass.name);
  if (selected.capitalType) lines.push('Equity / Debt: ' + selected.capitalType.name);
  if (input.counterparty) lines.push('面談相手: ' + input.counterparty);
  if (input.internalParticipants) lines.push('当社側: ' + input.internalParticipants);
  if (input.notes.trim()) {
    lines.push('');
    lines.push('面談内容:');
    lines.push(input.notes);
  }
  return lines.join('\n');
}

function kspBuildMeetingMetadata(input, selected, meetingId, documentInfo, filename) {
  return {
    Meeting_ID: meetingId,
    Date: input.date,
    Time: input.time,
    Location_ID: input.locationId,
    GP_ID: input.gpId,
    Asset_Class_ID: input.assetClassId,
    Capital_Type_ID: input.capitalTypeId,
    Counterparty: input.counterparty,
    Internal_Participants: input.internalParticipants,
    Doc_File_ID: documentInfo ? documentInfo.id : '',
    Doc_URL: documentInfo ? documentInfo.url : '',
    Saved_Filename: filename || '',
    GP_Name: selected && selected.gp ? selected.gp.name : '',
    Asset_Class_Name: selected && selected.assetClass ? selected.assetClass.name : '',
    Capital_Type_Name: selected && selected.capitalType ? selected.capitalType.name : '',
    Location_Name: selected && selected.location ? selected.location.name : ''
  };
}

function kspBuildMeetingIndexRow(input, selected, meetingId, documentInfo, filename, actor, nowIso) {
  return {
    Meeting_ID: meetingId,
    Date: input.date,
    Time: input.time,
    Location_ID: input.locationId,
    GP_ID: input.gpId,
    Asset_Class_ID: input.assetClassId,
    Capital_Type_ID: input.capitalTypeId,
    Counterparty: input.counterparty,
    Internal_Participants: input.internalParticipants,
    Doc_File_ID: documentInfo.id,
    Doc_URL: documentInfo.url,
    Saved_Filename: filename,
    Status: KSP_STATUS.ACTIVE,
    Version: 1,
    Created_At: nowIso,
    Updated_At: nowIso,
    Created_By: actor,
    Updated_By: actor,
    AI_Document_Name: '',
    AI_Index_Status: KSP_AI_INDEX_STATUS.PENDING,
    AI_Indexed_At: '',
    AI_Content_Hash: '',
    AI_Last_Error: ''
  };
}

function kspMeetingIndexRowMatchesRequest(row, input, filename) {
  if (!row) return false;
  return String(row.Date || '') === input.date &&
    String(row.Time || '') === input.time &&
    String(row.Location_ID || '') === input.locationId &&
    String(row.GP_ID || '') === input.gpId &&
    String(row.Asset_Class_ID || '') === input.assetClassId &&
    String(row.Capital_Type_ID || '') === input.capitalTypeId &&
    String(row.Counterparty || '') === input.counterparty &&
    String(row.Internal_Participants || '') === input.internalParticipants &&
    String(row.Saved_Filename || '') === filename;
}

function kspMeetingInfoFromIndexRow(row) {
  return {
    id: String(row.Meeting_ID || ''),
    filename: String(row.Saved_Filename || ''),
    documentId: String(row.Doc_File_ID || ''),
    documentUrl: String(row.Doc_URL || ''),
    version: Number(row.Version || 1),
    status: String(row.Status || KSP_STATUS.ACTIVE),
    aiIndexStatus: String(row.AI_Index_Status || KSP_AI_INDEX_STATUS.PENDING),
    reused: true
  };
}

function kspBuildMeetingAuditRow(params) {
  var options = params || {};
  var metadata = options.metadata || {};
  return {
    Event_Timestamp: options.timestamp || '',
    Actor: options.actor || 'UNIDENTIFIED',
    Action: KSP_MEETING_ACTIONS.CREATE,
    Target_Type: 'Meeting',
    Target_ID: options.meetingId || '',
    Result: options.result || KSP_AUDIT_RESULTS.FAILURE,
    Changed_Fields: options.result === KSP_AUDIT_RESULTS.SUCCESS ? kspGetNonEmptyMeetingMetadataFields(metadata).join(',') : '',
    Before_Metadata_JSON: '',
    After_Metadata_JSON: options.result === KSP_AUDIT_RESULTS.SUCCESS ? JSON.stringify(kspMeetingAuditMetadata(metadata)) : '',
    Batch_ID: '',
    Error_Code: options.errorCode || '',
    Error_Message: options.errorMessage || '',
    Search_Mode: '',
    Question_Or_Instruction: '',
    Date_From: '',
    Date_To: '',
    GP_Filter: '',
    Asset_Class_Filter: '',
    Capital_Type_Filter: '',
    Source_Type_Filter: '',
    Model_ID: '',
    Cited_Source_IDs: ''
  };
}

function kspMeetingAuditMetadata(metadata) {
  return {
    Meeting_ID: metadata.Meeting_ID || '',
    Date: metadata.Date || '',
    Time: metadata.Time || '',
    Location_ID: metadata.Location_ID || '',
    GP_ID: metadata.GP_ID || '',
    Asset_Class_ID: metadata.Asset_Class_ID || '',
    Capital_Type_ID: metadata.Capital_Type_ID || '',
    Counterparty: metadata.Counterparty || '',
    Internal_Participants: metadata.Internal_Participants || '',
    Doc_File_ID: metadata.Doc_File_ID || '',
    Doc_URL: metadata.Doc_URL || '',
    Saved_Filename: metadata.Saved_Filename || ''
  };
}

function kspGetNonEmptyMeetingMetadataFields(metadata) {
  return Object.keys(kspMeetingAuditMetadata(metadata)).filter(function (key) {
    var value = metadata[key];
    return value !== '' && value !== null && value !== undefined;
  });
}

function kspResolveActorValue(email, temporaryUserKey) {
  var normalizedEmail = String(email || '').trim().toLowerCase();
  if (normalizedEmail) return normalizedEmail;
  var normalizedKey = String(temporaryUserKey || '').trim();
  if (normalizedKey) return 'TEMP_USER:' + normalizedKey;
  return 'UNIDENTIFIED';
}

function kspBuildMeetingBootstrapResponse(catalog) {
  return {
    ok: true,
    workId: KSP_MEETING_WORK_ID,
    appVersion: KSP_MEETING_APP_VERSION,
    draftTtlMs: KSP_MEETING_DRAFT_TTL_MS,
    sharedContextFields: ['date', 'gpId', 'assetClassId', 'capitalTypeId'],
    options: {
      gps: kspDeepClone(catalog.gps),
      assetClasses: kspDeepClone(catalog.assetClasses),
      capitalTypes: kspDeepClone(catalog.capitalTypes),
      locations: kspDeepClone(catalog.locations)
    }
  };
}
