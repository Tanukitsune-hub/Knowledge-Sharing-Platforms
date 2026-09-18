var KSP_COUNTERPARTY_TYPES = Object.freeze([
  'GP',
  'LP_ASSET_OWNER',
  'NISSAY_INTERNAL',
  'GROUP_COMPANY',
  'CONSULTANT_GATEKEEPER',
  'OTHER'
]);

var KSP_LEGACY_COUNTERPARTY_OPTION_TYPES = Object.freeze({
  COUNTERPARTY_LP: 'LP_ASSET_OWNER',
  COUNTERPARTY_NISSAY_DEPARTMENT: 'NISSAY_INTERNAL',
  COUNTERPARTY_GROUP_COMPANY: 'GROUP_COMPANY',
  COUNTERPARTY_CONSULTANT_GATEKEEPER: 'CONSULTANT_GATEKEEPER',
  COUNTERPARTY_OTHER: 'OTHER'
});

function kspFormatCounterpartyId_(sequenceNumber) {
  var sequence = Number(sequenceNumber);
  kspAssert_(Number.isFinite(sequence) && sequence > 0 && Math.floor(sequence) === sequence,
    'COUNTERPARTY_SEQUENCE_INVALID', 'Counterparty sequence must be a positive integer.');
  return 'CP-' + String(sequence).padStart(6, '0');
}

function kspIsCounterpartyId_(value) {
  return /^CP-\d{6}$/.test(String(value || ''));
}

function kspParseCounterpartyId_(value) {
  var match = /^CP-(\d{6})$/.exec(String(value || ''));
  kspAssert_(match && Number(match[1]) > 0,
    'COUNTERPARTY_ID_INVALID', 'Counterparty IDが不正です。');
  return Number(match[1]);
}

function kspLegacyOptionCounterpartyType_(optionType) {
  return KSP_LEGACY_COUNTERPARTY_OPTION_TYPES[String(optionType || '')] || '';
}

function kspCounterpartyTypeDefinitionFromCode_(code) {
  var normalized = String(code || '').trim();
  return KSP_COUNTERPARTY_TYPE_DEFINITIONS.filter(function (item) {
    return item.code === normalized;
  })[0] || null;
}

function kspCounterpartyLegacyKey_(sourceType, sourceId) {
  return String(sourceType || '') + ':' + String(sourceId || '');
}

function kspBuildCounterpartyMigrationPlan_(snapshot, nowIso) {
  var source = snapshot || {};
  var counterpartyRows = source.counterpartyRows || [];
  var optionRows = source.optionRows || [];
  var meetingRows = source.meetingRows || [];
  var pitchbookRows = source.pitchbookRows || [];
  var usedIds = {};
  var provenanceToId = {};
  var idToType = {};
  var maxSequence = 0;
  var counterpartyPatches = [];
  var counterpartyAppends = [];

  function rememberId(id) {
    var normalized = String(id || '').trim();
    if (!normalized) return;
    var sequence = kspParseCounterpartyId_(normalized);
    kspAssert_(!usedIds[normalized], 'COUNTERPARTY_ID_DUPLICATE',
      'Counterparty IDが重複しています。');
    usedIds[normalized] = true;
    maxSequence = Math.max(maxSequence, sequence);
  }

  function rememberProvenance(sourceType, sourceId, counterpartyId) {
    if (!sourceType || !sourceId) return;
    var key = kspCounterpartyLegacyKey_(sourceType, sourceId);
    kspAssert_(!provenanceToId[key] || provenanceToId[key] === counterpartyId,
      'COUNTERPARTY_PROVENANCE_CONFLICT', 'Legacy source mappingが競合しています。');
    provenanceToId[key] = counterpartyId;
  }

  counterpartyRows.forEach(function (row) {
    if (String(row.Counterparty_ID || '').trim()) rememberId(row.Counterparty_ID);
  });
  // IDs reserved by the canonical GP seed mapping must never be consumed by an
  // unrelated legacy row before insertMissingRows() restores the full seed set.
  maxSequence = Math.max(maxSequence, kspGetCounterpartySeedDefinitions_().length);
  counterpartyRows.forEach(function (row) {
    var id = String(row.Counterparty_ID || '').trim();
    if (id) rememberProvenance(
      String(row.Legacy_Source_Type || '').trim(),
      String(row.Legacy_Source_ID || '').trim(),
      id
    );
  });

  function nextId() {
    do { maxSequence += 1; } while (usedIds[kspFormatCounterpartyId_(maxSequence)]);
    var id = kspFormatCounterpartyId_(maxSequence);
    usedIds[id] = true;
    return id;
  }

  function preferredGpSeedId(legacyGpId) {
    var definitions = kspGetCounterpartySeedDefinitions_();
    for (var index = 0; index < definitions.length; index += 1) {
      if (definitions[index][4] === legacyGpId && !usedIds[definitions[index][0]]) {
        usedIds[definitions[index][0]] = true;
        maxSequence = Math.max(maxSequence, kspParseCounterpartyId_(definitions[index][0]));
        return definitions[index][0];
      }
    }
    return nextId();
  }

  counterpartyRows.forEach(function (row, index) {
    var legacyGpId = String(row.GP_ID || '').trim();
    var sourceType = String(row.Legacy_Source_Type || '').trim() || (legacyGpId ? 'GP_MASTER' : '');
    var sourceId = String(row.Legacy_Source_ID || '').trim() || legacyGpId;
    var id = String(row.Counterparty_ID || '').trim();
    if (!id && sourceType === 'GP_MASTER' && sourceId) {
      id = provenanceToId[kspCounterpartyLegacyKey_(sourceType, sourceId)] || preferredGpSeedId(sourceId);
    }
    if (!id) return;
    var name = String(row.Counterparty_Name || row.GP_Name || '').trim();
    var type = String(row.Counterparty_Type || '').trim() || (sourceType === 'GP_MASTER' ? 'GP' : '');
    kspAssert_(name, 'COUNTERPARTY_NAME_REQUIRED', 'Counterparty nameが必要です。');
    kspAssert_(KSP_COUNTERPARTY_TYPES.indexOf(type) !== -1,
      'COUNTERPARTY_TYPE_INVALID', 'Counterparty Typeが不正です。');
    kspAssert_(!idToType[id] || idToType[id] === type,
      'COUNTERPARTY_TYPE_CONFLICT', 'Counterparty IDのTypeが競合しています。');
    idToType[id] = type;
    rememberProvenance(sourceType, sourceId, id);
    var patch = {
      Counterparty_ID: id,
      Counterparty_Name: name,
      Counterparty_Type: type,
      Status: String(row.Status || KSP_STATUS.ACTIVE),
      Created_At: row.Created_At || nowIso,
      Updated_At: row.Updated_At || nowIso,
      Created_By: row.Created_By || 'SYSTEM',
      Updated_By: row.Updated_By || 'SYSTEM',
      Legacy_Source_Type: sourceType,
      Legacy_Source_ID: sourceId
    };
    var changed = Object.keys(patch).some(function (key) {
      return String(row[key] === undefined || row[key] === null ? '' : row[key]) !== String(patch[key]);
    });
    if (changed) counterpartyPatches.push({ rowIndex: index, values: patch });
  });

  optionRows.slice().sort(function (left, right) {
    return String(left.Option_ID || '').localeCompare(String(right.Option_ID || ''));
  }).forEach(function (row) {
    var type = kspLegacyOptionCounterpartyType_(row.Type);
    if (!type) return;
    var legacyId = String(row.Option_ID || '').trim();
    var key = kspCounterpartyLegacyKey_('OPTION_MASTER', legacyId);
    if (provenanceToId[key]) return;
    var id = nextId();
    provenanceToId[key] = id;
    idToType[id] = type;
    counterpartyAppends.push({
      Counterparty_ID: id,
      Counterparty_Name: String(row.Name || '').trim(),
      Counterparty_Type: type,
      Status: String(row.Status || KSP_STATUS.ACTIVE),
      Created_At: row.Created_At || nowIso,
      Updated_At: row.Updated_At || nowIso,
      Created_By: row.Created_By || 'SYSTEM',
      Updated_By: row.Updated_By || 'SYSTEM',
      Legacy_Source_Type: 'OPTION_MASTER',
      Legacy_Source_ID: legacyId
    });
  });

  function resolveLegacyReference(row) {
    var current = String(row.Counterparty_ID || '').trim();
    if (/^CP-\d{6}$/.test(current)) return current;
    var type = String(row.Counterparty_Type || '').trim();
    if (current) {
      var currentSource = type === 'GP' || /^GP-/.test(current) ? 'GP_MASTER' : 'OPTION_MASTER';
      if (provenanceToId[kspCounterpartyLegacyKey_(currentSource, current)]) {
        return provenanceToId[kspCounterpartyLegacyKey_(currentSource, current)];
      }
    }
    var gpId = String(row.GP_ID || '').trim();
    if (gpId) return provenanceToId[kspCounterpartyLegacyKey_('GP_MASTER', gpId)] || '';
    return '';
  }

  function buildReferencePatches(rows, keyName) {
    return rows.reduce(function (patches, row, index) {
      var legacyPresent = String(row.Counterparty_ID || row.GP_ID || '').trim();
      var resolved = resolveLegacyReference(row);
      kspAssert_(!legacyPresent || resolved, 'COUNTERPARTY_LEGACY_REFERENCE_UNRESOLVED',
        keyName + 'のlegacy Counterparty referenceを解決できません。');
      if (resolved) {
        var resolvedType = idToType[resolved] || '';
        kspAssert_(resolvedType, 'COUNTERPARTY_REFERENCE_TYPE_UNRESOLVED',
          keyName + 'のCounterparty Typeを解決できません。');
        if (String(row.Counterparty_ID || '') !== resolved ||
            String(row.Counterparty_Type || '') !== resolvedType) {
          patches.push({
            rowIndex: index,
            values: { Counterparty_ID: resolved, Counterparty_Type: resolvedType }
          });
        }
      }
      return patches;
    }, []);
  }

  return {
    counterpartyPatches: counterpartyPatches,
    counterpartyAppends: counterpartyAppends,
    meetingPatches: buildReferencePatches(meetingRows, 'Meeting'),
    pitchbookPatches: buildReferencePatches(pitchbookRows, 'Pitchbook'),
    legacyMappingCount: Object.keys(provenanceToId).length
  };
}

function kspCounterpartyMigrationMutationCount_(plan) {
  var source = plan || {};
  return (source.counterpartyPatches || []).length +
    (source.counterpartyAppends || []).length +
    (source.meetingPatches || []).length +
    (source.pitchbookPatches || []).length;
}
