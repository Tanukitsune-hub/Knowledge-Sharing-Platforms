var KSP_MEETING_WORK_ID = '0005';
var KSP_MEETING_APP_VERSION = '0.2.0';
var KSP_MEETING_DRAFT_TTL_MS = 24 * 60 * 60 * 1000;

var KSP_OPTION_TYPES = Object.freeze({
  LOCATION: 'LOCATION',
  ASSET_CLASS: 'ASSET_CLASS',
  CAPITAL_TYPE: 'CAPITAL_TYPE',
  TEAM: 'TEAM',
  COUNTERPARTY_LP: 'COUNTERPARTY_LP',
  COUNTERPARTY_NISSAY_DEPARTMENT: 'COUNTERPARTY_NISSAY_DEPARTMENT',
  COUNTERPARTY_GROUP_COMPANY: 'COUNTERPARTY_GROUP_COMPANY',
  COUNTERPARTY_CONSULTANT_GATEKEEPER: 'COUNTERPARTY_CONSULTANT_GATEKEEPER',
  COUNTERPARTY_OTHER: 'COUNTERPARTY_OTHER'
});

var KSP_COUNTERPARTY_TYPE_DEFINITIONS = Object.freeze([
  Object.freeze({ code: 'GP', label: 'GP / 運用会社', optionType: '' }),
  Object.freeze({ code: 'LP_ASSET_OWNER', label: 'LP / Asset Owner', optionType: KSP_OPTION_TYPES.COUNTERPARTY_LP }),
  Object.freeze({ code: 'NISSAY_INTERNAL', label: '日本生命', optionType: KSP_OPTION_TYPES.COUNTERPARTY_NISSAY_DEPARTMENT }),
  Object.freeze({ code: 'GROUP_COMPANY', label: 'グループ会社', optionType: KSP_OPTION_TYPES.COUNTERPARTY_GROUP_COMPANY }),
  Object.freeze({ code: 'CONSULTANT_GATEKEEPER', label: 'Consultant / Gatekeeper', optionType: KSP_OPTION_TYPES.COUNTERPARTY_CONSULTANT_GATEKEEPER }),
  Object.freeze({ code: 'OTHER', label: 'その他', optionType: KSP_OPTION_TYPES.COUNTERPARTY_OTHER })
]);

var KSP_MEETING_TYPE_DEFINITIONS = Object.freeze([
  Object.freeze({ code: 'ANNUAL_REVIEW', label: '定例年1回' }),
  Object.freeze({ code: 'OFFICE_VISIT', label: '先方オフィス訪問' }),
  Object.freeze({ code: 'ANNUAL_GENERAL_MEETING', label: '年次総会' })
]);

var KSP_AUDIT_RESULTS = Object.freeze({
  SUCCESS: 'Success',
  FAILURE: 'Failure'
});

var KSP_MEETING_ACTIONS = Object.freeze({
  CREATE: 'MEETING_CREATE'
});

var KSP_MEETING_LIMITS = Object.freeze({
  SHORT_TEXT: 500,
  NOTES: 20000,
  FUND_STRATEGY: 500,
  FOLLOW_UP_NOTE: 2000
});

function kspNormalizeMeetingTypeCodes_(value) {
  var supplied = Array.isArray(value) ? value : String(value || '').split(',');
  var seen = {};
  supplied.map(function (item) { return kspTrimMeetingField_(item); })
    .filter(Boolean).forEach(function (code) { seen[code] = true; });
  var known = {};
  KSP_MEETING_TYPE_DEFINITIONS.forEach(function (definition) { known[definition.code] = true; });
  Object.keys(seen).forEach(function (code) {
    kspAssert_(known[code], 'MEETING_TYPE_CODE_INVALID', 'Meeting type codeが不正です。');
  });
  return KSP_MEETING_TYPE_DEFINITIONS.filter(function (definition) { return seen[definition.code]; })
    .map(function (definition) { return definition.code; }).join(',');
}

function kspNormalizeRelatedPitchbookIds_(value) {
  var supplied = Array.isArray(value) ? value : String(value || '').split(',');
  var seen = {};
  supplied.map(function (item) { return kspTrimMeetingField_(item); })
    .filter(Boolean).forEach(function (id) {
      kspAssert_(/^DOC-\d{6}$/.test(id) && id !== 'DOC-000000',
        'PITCHBOOK_DOCUMENT_ID_INVALID', 'Document IDが不正です。');
      seen[id] = true;
    });
  return Object.keys(seen).sort().join(',');
}

function kspSplitCanonicalIds_(value) {
  return String(value || '').split(',').map(function (item) { return item.trim(); }).filter(Boolean);
}

function kspMeetingTypeLabels_(canonicalCodes) {
  var selected = {};
  kspSplitCanonicalIds_(canonicalCodes).forEach(function (code) { selected[code] = true; });
  return KSP_MEETING_TYPE_DEFINITIONS.filter(function (definition) { return selected[definition.code]; })
    .map(function (definition) { return definition.label; });
}

function kspMeetingCellDate_(value) {
  return kspCanonicalBusinessDate_(value);
}

function kspBuildRelatedPitchbookChoices_(rows, relatedGpIds, assetClassId, existingIds) {
  var preserved = {};
  var related = {};
  (Array.isArray(relatedGpIds) ? relatedGpIds : kspSplitCanonicalIds_(relatedGpIds))
    .forEach(function (id) { related[String(id)] = true; });
  (existingIds || []).forEach(function (id) { preserved[String(id)] = true; });
  var choices = (rows || []).filter(function (row) {
    var id = String(row.Document_ID || '');
    if (!id) return false;
    return preserved[id] || (String(row.Status || '') === KSP_STATUS.ACTIVE &&
      related[String(row.GP_ID || '')] &&
      String(row.Asset_Class_ID || '') === String(assetClassId || ''));
  }).sort(function (left, right) {
    var rightDate = kspMeetingCellDate_(right.Date);
    var leftDate = kspMeetingCellDate_(left.Date);
    var dateCompare = rightDate.localeCompare(leftDate);
    return dateCompare || String(left.Document_ID || '').localeCompare(String(right.Document_ID || ''));
  }).map(function (row) {
    return {
      id: String(row.Document_ID || ''),
      date: kspMeetingCellDate_(row.Date),
      gpId: String(row.GP_ID || ''),
      assetClassId: String(row.Asset_Class_ID || ''),
      title: String(row.Saved_Filename || row.Original_Filename || row.Document_ID || ''),
      status: String(row.Status || ''),
      preserved: Boolean(preserved[String(row.Document_ID || '')])
    };
  });
  var resolved = {};
  choices.forEach(function (item) { resolved[item.id] = true; });
  Object.keys(preserved).filter(function (id) { return !resolved[id]; }).sort().forEach(function (id) {
    choices.push({ id: id, date: '', gpId: '', assetClassId: '', title: id,
      status: '', preserved: true, unresolved: true });
  });
  return choices;
}

function kspCounterpartyTypeDefinition_(code) {
  var normalized = String(code || '').trim();
  return KSP_COUNTERPARTY_TYPE_DEFINITIONS.filter(function (item) { return item.code === normalized; })[0] || null;
}

function kspNormalizeRelatedGpIds_(value, primaryGpId) {
  var supplied = Array.isArray(value) ? value : String(value || '').split(',');
  var seen = {};
  supplied.map(function (item) { return kspTrimMeetingField_(item); }).filter(Boolean).forEach(function (id) {
    kspAssert_(!seen[id], 'MEETING_RELATED_GP_DUPLICATE', '関連GPに重複があります。');
    seen[id] = true;
  });
  if (primaryGpId) seen[String(primaryGpId)] = true;
  return Object.keys(seen).sort().join(',');
}

function kspMeetingCounterpartyType_(row) {
  return String(row && row.Counterparty_Type || '').trim() || (String(row && row.GP_ID || '').trim() ? 'GP' : '');
}

function kspMeetingCounterpartyId_(row) {
  return String(row && row.Counterparty_ID || '').trim() ||
    (kspMeetingCounterpartyType_(row) === 'GP' ? String(row && row.GP_ID || '').trim() : '');
}

function kspMeetingRelatedGpIds_(row) {
  var stored = String(row && row.Related_GP_IDs || '').trim();
  if (stored) return kspNormalizeRelatedGpIds_(stored, '');
  var gpId = String(row && row.GP_ID || '').trim();
  return gpId ? gpId : '';
}

function kspNormalizeMeetingInput_(input) {
  var source = input && typeof input === 'object' ? input : {};
  var suppliedGpId = kspTrimMeetingField_(source.gpId);
  var counterpartyType = kspTrimMeetingField_(source.counterpartyType) || (suppliedGpId ? 'GP' : '');
  var counterpartyId = kspTrimMeetingField_(source.counterpartyId) || (counterpartyType === 'GP' ? suppliedGpId : '');
  var primaryGpId = counterpartyType === 'GP' ? counterpartyId : '';
  return {
    date: kspTrimMeetingField_(source.date),
    time: kspTrimMeetingField_(source.time),
    locationId: kspTrimMeetingField_(source.locationId),
    gpId: primaryGpId,
    counterpartyType: counterpartyType,
    counterpartyId: counterpartyId,
    relatedGpIds: kspNormalizeRelatedGpIds_(source.relatedGpIds, primaryGpId),
    assetClassId: kspTrimMeetingField_(source.assetClassId),
    capitalTypeId: kspTrimMeetingField_(source.capitalTypeId),
    teamId: kspTrimMeetingField_(source.teamId),
    fundStrategy: kspTrimMeetingField_(source.fundStrategy),
    meetingTypeCodes: kspNormalizeMeetingTypeCodes_(source.meetingTypeCodes),
    relatedPitchbookIds: kspNormalizeRelatedPitchbookIds_(source.relatedPitchbookIds),
    followUpRequired: kspToBoolean_(source.followUpRequired, false),
    followUpNote: kspNormalizeMeetingNotes_(source.followUpNote),
    counterparty: kspTrimMeetingField_(source.counterparty),
    internalParticipants: kspTrimMeetingField_(source.internalParticipants),
    notes: kspNormalizeMeetingNotes_(source.notes),
    retryMeetingId: kspTrimMeetingField_(source.retryMeetingId),
    retryFingerprint: kspTrimMeetingField_(source.retryFingerprint)
  };
}

function kspTrimMeetingField_(value) {
  return value === null || value === undefined ? '' : String(value).trim();
}

function kspNormalizeMeetingNotes_(value) {
  if (value === null || value === undefined) {
    return '';
  }
  return String(value).replace(/\r\n?/g, '\n').replace(/\u0000/g, '');
}

function kspBuildMeetingCatalog_(gpRows, optionRows) {
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

  var counterpartyEntities = gps.map(function (gp) {
    return { id: gp.id, type: 'GP', name: gp.name, optionType: '', entityKey: 'GP:' + gp.id };
  });
  KSP_COUNTERPARTY_TYPE_DEFINITIONS.filter(function (definition) { return definition.optionType; })
    .forEach(function (definition) {
      byType(definition.optionType).forEach(function (option) {
        counterpartyEntities.push({
          id: option.id,
          type: definition.code,
          name: option.name,
          optionType: definition.optionType,
          entityKey: definition.code + ':' + option.id
        });
      });
    });

  return {
    gps: gps,
    assetClasses: byType(KSP_OPTION_TYPES.ASSET_CLASS),
    capitalTypes: byType(KSP_OPTION_TYPES.CAPITAL_TYPE),
    locations: byType(KSP_OPTION_TYPES.LOCATION),
    teams: byType(KSP_OPTION_TYPES.TEAM),
    counterpartyTypes: KSP_COUNTERPARTY_TYPE_DEFINITIONS.map(function (definition) {
      return { code: definition.code, label: definition.label, optionType: definition.optionType };
    }),
    counterpartyEntities: counterpartyEntities
  };
}

function kspValidateMeetingInput_(normalizedInput, catalog) {
  var input = normalizedInput || {};
  var safeCatalog = catalog || { gps: [], assetClasses: [], capitalTypes: [], locations: [] };

  kspAssert_(input.date, 'MEETING_DATE_REQUIRED', '日付は必須です。');
  kspAssert_(input.counterpartyType, 'MEETING_COUNTERPARTY_TYPE_REQUIRED', '面談先区分は必須です。');
  var counterpartyDefinition = kspCounterpartyTypeDefinition_(input.counterpartyType);
  kspAssert_(counterpartyDefinition, 'MEETING_COUNTERPARTY_TYPE_INVALID', '面談先区分が不正です。');
  kspAssert_(input.counterpartyId, 'MEETING_COUNTERPARTY_ENTITY_REQUIRED', '面談先は必須です。');
  kspAssert_(input.assetClassId, 'MEETING_ASSET_CLASS_REQUIRED', 'Asset Classは必須です。');
  kspAssert_(kspIsValidDateKey_(input.date), 'MEETING_DATE_INVALID', '日付はYYYY-MM-DD形式で入力してください。');
  kspAssert_(!input.time || kspIsValidTimeValue_(input.time), 'MEETING_TIME_INVALID', '時間はHH:MM形式で入力してください。');
  kspAssert_(input.counterparty.length <= KSP_MEETING_LIMITS.SHORT_TEXT,
    'MEETING_COUNTERPARTY_TOO_LONG', '面談相手は500文字以内で入力してください。');
  kspAssert_(input.internalParticipants.length <= KSP_MEETING_LIMITS.SHORT_TEXT,
    'MEETING_INTERNAL_PARTICIPANTS_TOO_LONG', '当社側は500文字以内で入力してください。');
  kspAssert_(input.notes.length <= KSP_MEETING_LIMITS.NOTES,
    'MEETING_NOTES_TOO_LONG', '面談内容は20,000文字以内で入力してください。');
  kspAssert_(input.fundStrategy.length <= KSP_MEETING_LIMITS.FUND_STRATEGY,
    'MEETING_FUND_STRATEGY_TOO_LONG', 'Fund / Strategyは500文字以内で入力してください。');
  kspAssert_(input.followUpNote.length <= KSP_MEETING_LIMITS.FOLLOW_UP_NOTE,
    'MEETING_FOLLOW_UP_NOTE_TOO_LONG', 'フォローアップメモは2,000文字以内で入力してください。');

  var hasRetryId = Boolean(input.retryMeetingId);
  var hasRetryFingerprint = Boolean(input.retryFingerprint);
  kspAssert_(hasRetryId === hasRetryFingerprint, 'MEETING_RETRY_CONTEXT_INCOMPLETE',
    'Retry Meeting ID and fingerprint must be supplied together.');
  if (hasRetryId) {
    kspParseMeetingId_(input.retryMeetingId);
    kspAssert_(/^[0-9a-f]{8}$/.test(input.retryFingerprint), 'MEETING_RETRY_FINGERPRINT_INVALID',
      'Retry fingerprint is invalid.');
  }

  var selectedCounterparty = (safeCatalog.counterpartyEntities || []).filter(function (item) {
    return String(item.type) === input.counterpartyType && String(item.id) === input.counterpartyId;
  })[0];
  kspAssert_(selectedCounterparty, 'MEETING_COUNTERPARTY_ENTITY_UNAVAILABLE', '選択された面談先は利用できません。');
  var relatedGps = kspSplitCanonicalIds_(input.relatedGpIds).map(function (id) {
    return kspRequireCatalogItem_(safeCatalog.gps, id, 'MEETING_RELATED_GP_INVALID', '関連GPを確認してください。');
  });
  var selected = {
    counterpartyType: counterpartyDefinition,
    counterpartyEntity: selectedCounterparty,
    relatedGps: relatedGps,
    gp: input.counterpartyType === 'GP' ?
      kspRequireCatalogItem_(safeCatalog.gps, input.counterpartyId, 'MEETING_GP_UNAVAILABLE', '選択されたGPは利用できません。') : null,
    assetClass: kspRequireCatalogItem_(
      safeCatalog.assetClasses,
      input.assetClassId,
      'MEETING_ASSET_CLASS_UNAVAILABLE',
      '選択されたAsset Classは利用できません。'
    ),
    capitalType: null,
    location: null,
    team: null
  };

  if (input.capitalTypeId) {
    selected.capitalType = kspRequireCatalogItem_(
      safeCatalog.capitalTypes,
      input.capitalTypeId,
      'MEETING_CAPITAL_TYPE_UNAVAILABLE',
      '選択されたEquity / Debtは利用できません。'
    );
  }

  if (input.locationId) {
    selected.location = kspRequireCatalogItem_(
      safeCatalog.locations,
      input.locationId,
      'MEETING_LOCATION_UNAVAILABLE',
      '選択された面談場所は利用できません。'
    );
  }

  if (input.teamId) {
    selected.team = kspRequireCatalogItem_(
      safeCatalog.teams,
      input.teamId,
      'MEETING_TEAM_UNAVAILABLE',
      '選択されたTeamは利用できません。'
    );
  }

  var selectablePitchbookIds = {};
  (safeCatalog.relatedPitchbooks || []).forEach(function (item) {
    if (item.preserved || (String(item.status || '') === KSP_STATUS.ACTIVE &&
        kspSplitCanonicalIds_(input.relatedGpIds).indexOf(String(item.gpId || '')) !== -1 &&
        String(item.assetClassId || '') === input.assetClassId)) {
      selectablePitchbookIds[String(item.id)] = true;
    }
  });
  kspSplitCanonicalIds_(input.relatedPitchbookIds).forEach(function (id) {
    kspAssert_(selectablePitchbookIds[id], 'MEETING_RELATED_PITCHBOOK_UNAVAILABLE',
      '選択された関連Pitchbookは利用できません。');
  });

  return selected;
}

function kspRequireCatalogItem_(items, id, code, message) {
  var found = (items || []).filter(function (item) { return String(item.id) === String(id); })[0];
  kspAssert_(found, code, message);
  return found;
}

function kspFormatMeetingId_(sequenceNumber) {
  var sequence = Number(sequenceNumber);
  kspAssert_(Number.isFinite(sequence) && sequence > 0 && Math.floor(sequence) === sequence,
    'MEETING_SEQUENCE_INVALID', 'Meeting ID sequence must be a positive integer.');
  return 'MTG-' + String(sequence).padStart(6, '0');
}

function kspParseMeetingId_(meetingId) {
  var match = /^MTG-(\d{6})$/.exec(String(meetingId || ''));
  kspAssert_(match, 'MEETING_ID_INVALID', 'Meeting ID is invalid.');
  var sequence = Number(match[1]);
  kspAssert_(sequence > 0, 'MEETING_ID_INVALID', 'Meeting ID is invalid.');
  return sequence;
}

function kspBuildMeetingRequestFingerprint_(input) {
  var canonical = [
    input.date,
    input.time,
    input.locationId,
    input.gpId,
    input.counterpartyType,
    input.counterpartyId,
    input.relatedGpIds,
    input.assetClassId,
    input.capitalTypeId,
    input.teamId,
    input.fundStrategy,
    input.meetingTypeCodes,
    input.relatedPitchbookIds,
    input.followUpRequired ? 'true' : 'false',
    input.followUpNote,
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

function kspBuildLegacyMeetingRequestFingerprint_(input) {
  var canonical = [
    input.date, input.time, input.locationId, input.gpId, input.assetClassId,
    input.capitalTypeId, input.counterparty, input.internalParticipants, input.notes
  ].map(function (value) { return String(value || ''); }).join('\u001f');
  var hash = 2166136261;
  for (var index = 0; index < canonical.length; index += 1) {
    hash ^= canonical.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return ('00000000' + (hash >>> 0).toString(16)).slice(-8);
}

function kspMeetingUsesOnlyLegacyFields_(input) {
  return !input.teamId && !input.fundStrategy && !input.meetingTypeCodes &&
    !input.relatedPitchbookIds && !input.followUpRequired && !input.followUpNote &&
    input.counterpartyType === 'GP' && input.counterpartyId === input.gpId && input.relatedGpIds === input.gpId;
}

function kspBuildMeetingFilename_(input, selected, meetingId) {
  var segments = [input.date, selected.counterpartyEntity.name, selected.assetClass.name];
  if (selected.capitalType) {
    segments.push(selected.capitalType.name);
  }
  segments.push(meetingId);

  var normalizedSegments = segments.map(kspNormalizeGeneratedNameSegment_);
  kspAssert_(normalizedSegments.every(function (segment) { return segment !== ''; }),
    'MEETING_FILENAME_INVALID', 'Meeting filename contains an empty required segment.');
  return normalizedSegments.join('_');
}

function kspBuildMeetingDocumentText_(input, selected) {
  var lines = ['日付: ' + input.date];
  if (input.time) lines.push('時間: ' + input.time);
  if (selected.location) lines.push('面談場所: ' + selected.location.name);
  lines.push('面談先区分: ' + selected.counterpartyType.label);
  lines.push('面談先: ' + selected.counterpartyEntity.name);
  if (selected.relatedGps.length) lines.push('関連GP: ' + selected.relatedGps.map(function (gp) { return gp.name; }).join(', '));
  lines.push('Asset Class: ' + selected.assetClass.name);
  if (selected.capitalType) lines.push('Equity / Debt: ' + selected.capitalType.name);
  if (selected.team) lines.push('Team: ' + selected.team.name);
  if (input.fundStrategy) lines.push('Fund / Strategy: ' + input.fundStrategy);
  var meetingTypeLabels = kspMeetingTypeLabels_(input.meetingTypeCodes);
  if (meetingTypeLabels.length) lines.push('Meeting Type: ' + meetingTypeLabels.join(', '));
  if (input.relatedPitchbookIds) lines.push('Related Pitchbook IDs: ' + input.relatedPitchbookIds);
  if (input.followUpRequired) lines.push('要フォロー: はい');
  if (input.followUpNote.trim()) lines.push('フォローアップメモ: ' + input.followUpNote);
  if (input.counterparty) lines.push('面談相手（氏名・役職）: ' + input.counterparty);
  if (input.internalParticipants) lines.push('当社側: ' + input.internalParticipants);
  if (input.notes.trim()) {
    lines.push('');
    lines.push('面談内容:');
    lines.push(input.notes);
  }
  return lines.join('\n');
}

function kspBuildMeetingMetadata_(input, selected, meetingId, documentInfo, filename) {
  return {
    Meeting_ID: meetingId,
    Date: input.date,
    Time: input.time,
    Location_ID: input.locationId,
    GP_ID: input.gpId,
    Counterparty_Type: input.counterpartyType,
    Counterparty_ID: input.counterpartyId,
    Related_GP_IDs: input.relatedGpIds,
    Asset_Class_ID: input.assetClassId,
    Capital_Type_ID: input.capitalTypeId,
    Team_ID: input.teamId,
    Fund_Strategy: input.fundStrategy,
    Meeting_Type_Codes: input.meetingTypeCodes,
    Related_Pitchbook_IDs: input.relatedPitchbookIds,
    Follow_Up_Required: input.followUpRequired,
    Counterparty: input.counterparty,
    Internal_Participants: input.internalParticipants,
    Doc_File_ID: documentInfo ? documentInfo.id : '',
    Doc_URL: documentInfo ? documentInfo.url : '',
    Saved_Filename: filename || '',
    GP_Name: selected && selected.gp ? selected.gp.name : '',
    Counterparty_Name: selected && selected.counterpartyEntity ? selected.counterpartyEntity.name : '',
    Related_GP_Names: selected && selected.relatedGps ? selected.relatedGps.map(function (gp) { return gp.name; }).join(', ') : '',
    Asset_Class_Name: selected && selected.assetClass ? selected.assetClass.name : '',
    Capital_Type_Name: selected && selected.capitalType ? selected.capitalType.name : '',
    Location_Name: selected && selected.location ? selected.location.name : '',
    Team_Name: selected && selected.team ? selected.team.name : ''
  };
}

function kspBuildMeetingIndexRow_(input, selected, meetingId, documentInfo, filename, actor, nowIso) {
  return {
    Meeting_ID: meetingId,
    Date: input.date,
    Time: input.time,
    Location_ID: input.locationId,
    GP_ID: input.gpId,
    Counterparty_Type: input.counterpartyType,
    Counterparty_ID: input.counterpartyId,
    Related_GP_IDs: input.relatedGpIds,
    Asset_Class_ID: input.assetClassId,
    Capital_Type_ID: input.capitalTypeId,
    Team_ID: input.teamId,
    Fund_Strategy: input.fundStrategy,
    Meeting_Type_Codes: input.meetingTypeCodes,
    Related_Pitchbook_IDs: input.relatedPitchbookIds,
    Follow_Up_Required: input.followUpRequired,
    Follow_Up_Note: input.followUpNote,
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

function kspMeetingIndexRowMatchesRequest_(row, input, filename) {
  if (!row) return false;
  return kspCanonicalBusinessDate_(row.Date) === input.date &&
    kspCanonicalBusinessTime_(row.Time) === input.time &&
    String(row.Location_ID || '') === input.locationId &&
    String(row.GP_ID || '') === input.gpId &&
    kspMeetingCounterpartyType_(row) === input.counterpartyType &&
    kspMeetingCounterpartyId_(row) === input.counterpartyId &&
    kspMeetingRelatedGpIds_(row) === input.relatedGpIds &&
    String(row.Asset_Class_ID || '') === input.assetClassId &&
    String(row.Capital_Type_ID || '') === input.capitalTypeId &&
    String(row.Team_ID || '') === input.teamId &&
    String(row.Fund_Strategy || '') === input.fundStrategy &&
    String(row.Meeting_Type_Codes || '') === input.meetingTypeCodes &&
    String(row.Related_Pitchbook_IDs || '') === input.relatedPitchbookIds &&
    kspToBoolean_(row.Follow_Up_Required, false) === input.followUpRequired &&
    String(row.Follow_Up_Note || '') === input.followUpNote &&
    String(row.Counterparty || '') === input.counterparty &&
    String(row.Internal_Participants || '') === input.internalParticipants &&
    String(row.Saved_Filename || '') === filename;
}

function kspMeetingInfoFromIndexRow_(row) {
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

function kspBuildMeetingAuditRow_(params) {
  var options = params || {};
  var metadata = options.metadata || {};
  var auditMetadata = kspMeetingAuditMetadata_(metadata);
  return {
    Event_Timestamp: kspCanonicalInstantIso_(options.timestamp),
    Actor: options.actor || 'UNIDENTIFIED',
    Action: KSP_MEETING_ACTIONS.CREATE,
    Target_Type: 'Meeting',
    Target_ID: options.meetingId || '',
    Result: options.result || KSP_AUDIT_RESULTS.FAILURE,
    Changed_Fields: options.result === KSP_AUDIT_RESULTS.SUCCESS ? kspGetNonEmptyMeetingMetadataFields_(auditMetadata).join(',') : '',
    Before_Metadata_JSON: '',
    After_Metadata_JSON: options.result === KSP_AUDIT_RESULTS.SUCCESS ? JSON.stringify(auditMetadata) : '',
    Batch_ID: '',
    Error_Code: options.errorCode || '',
    Error_Message: options.errorCode ? kspSafePublicErrorMessage_(options.errorCode, 'MEETING') : '',
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

function kspMeetingAuditMetadata_(metadata) {
  return {
    Meeting_ID: metadata.Meeting_ID || '',
    Date: kspCanonicalBusinessDate_(metadata.Date),
    Time: kspCanonicalBusinessTime_(metadata.Time),
    Location_ID: metadata.Location_ID || '',
    GP_ID: metadata.GP_ID || '',
    Counterparty_Type: metadata.Counterparty_Type || '',
    Counterparty_ID: metadata.Counterparty_ID || '',
    Related_GP_IDs: metadata.Related_GP_IDs || '',
    Asset_Class_ID: metadata.Asset_Class_ID || '',
    Capital_Type_ID: metadata.Capital_Type_ID || '',
    Team_ID: metadata.Team_ID || '',
    Fund_Strategy: metadata.Fund_Strategy || '',
    Meeting_Type_Codes: metadata.Meeting_Type_Codes || '',
    Related_Pitchbook_IDs: metadata.Related_Pitchbook_IDs || '',
    Follow_Up_Required: metadata.Follow_Up_Required === true,
    Counterparty: metadata.Counterparty || '',
    Internal_Participants: metadata.Internal_Participants || '',
    Doc_File_ID: metadata.Doc_File_ID || '',
    Doc_URL: metadata.Doc_URL || '',
    Saved_Filename: metadata.Saved_Filename || ''
  };
}

function kspGetNonEmptyMeetingMetadataFields_(metadata) {
  return Object.keys(kspMeetingAuditMetadata_(metadata)).filter(function (key) {
    var value = metadata[key];
    return value !== '' && value !== null && value !== undefined;
  });
}

function kspResolveActorValue_(email, temporaryUserKey) {
  var normalizedEmail = String(email || '').trim().toLowerCase();
  if (normalizedEmail) return normalizedEmail;
  var normalizedKey = String(temporaryUserKey || '').trim();
  if (normalizedKey) return 'TEMP_USER:' + normalizedKey;
  return 'UNIDENTIFIED';
}

function kspBuildMeetingBootstrapResponse_(catalog) {
  return {
    ok: true,
    workId: KSP_MEETING_WORK_ID,
    appVersion: KSP_MEETING_APP_VERSION,
    draftTtlMs: KSP_MEETING_DRAFT_TTL_MS,
    sharedContextFields: ['date', 'assetClassId', 'capitalTypeId', 'fundStrategy'],
    options: {
      gps: kspDeepClone_(catalog.gps),
      assetClasses: kspDeepClone_(catalog.assetClasses),
      capitalTypes: kspDeepClone_(catalog.capitalTypes),
      locations: kspDeepClone_(catalog.locations),
      teams: kspDeepClone_(catalog.teams),
      relatedPitchbooks: kspDeepClone_(catalog.relatedPitchbooks || []),
      counterpartyTypes: kspDeepClone_(catalog.counterpartyTypes || []),
      counterpartyEntities: kspDeepClone_(catalog.counterpartyEntities || []),
      meetingTypes: kspDeepClone_(KSP_MEETING_TYPE_DEFINITIONS)
    }
  };
}
