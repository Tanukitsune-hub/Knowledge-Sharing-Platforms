function kspRunSetup_(environment) {
  var report = kspCreateReport_('SETUP', environment.nowIso());
  var lock = null;

  try {
    lock = environment.acquireScriptLock(KSP_DEFAULTS.LOCK_TIMEOUT_MS);
    var existingState = kspLoadInstallationState_(environment);
    var config = kspLoadEffectiveConfig_(environment, existingState);
    report.environment = config.environment;

    var resources = kspResolveAllResources_(environment, existingState.resources || {}, config, report);
    report.resources = kspDeepClone_(resources);

    kspEnsureSpreadsheetSchemas_(
      environment,
      resources[KSP_RESOURCE_KEYS.BACKEND_SPREADSHEET],
      kspGetBackendSchemas_(),
      'backend',
      report
    );
    kspEnsureSpreadsheetSchemas_(
      environment,
      resources[KSP_RESOURCE_KEYS.AUDIT_SPREADSHEET],
      kspGetAuditSchema_(),
      'audit',
      report
    );

    var meetingBackfillResult = environment.backfillMeetingCounterpartyFields(
      resources[KSP_RESOURCE_KEYS.BACKEND_SPREADSHEET]
    );
    kspAddAction_(report, 'migration', KSP_SHEET_NAMES.MEETING_INDEX + ':counterparty-entity',
      meetingBackfillResult.updated ? 'migrated' : 'reused', meetingBackfillResult);

    var nowIso = environment.nowIso();
    var gpResult = environment.insertMissingRows(
      resources[KSP_RESOURCE_KEYS.BACKEND_SPREADSHEET],
      KSP_SHEET_NAMES.GP_MASTER,
      'GP_ID',
      kspBuildGpSeedRows_(nowIso)
    );
    kspAddAction_(report, 'seed', KSP_SHEET_NAMES.GP_MASTER, 'upserted', gpResult);

    var optionResult = environment.insertMissingRows(
      resources[KSP_RESOURCE_KEYS.BACKEND_SPREADSHEET],
      KSP_SHEET_NAMES.OPTION_MASTER,
      'Option_ID',
      kspBuildOptionSeedRows_(nowIso)
    );
    kspAddAction_(report, 'seed', KSP_SHEET_NAMES.OPTION_MASTER, 'upserted', optionResult);

    var settingsResult = environment.upsertRows(
      resources[KSP_RESOURCE_KEYS.BACKEND_SPREADSHEET],
      KSP_SHEET_NAMES.SETTINGS,
      'Key',
      kspBuildSettingsRows_(config, resources, nowIso),
      { preserveExistingKeys: kspGetSettingsPreserveExistingKeys_() }
    );
    kspAddAction_(report, 'settings', KSP_SHEET_NAMES.SETTINGS, 'upserted', settingsResult);

    kspEnsureTriggers_(environment, kspGetTriggerRegistry_(config), report);

    var storedState = kspBuildStoredInstallationState_(config, resources, nowIso);
    environment.setProperty(
      KSP_PROPERTY_KEYS.INSTALLATION_STATE_JSON,
      JSON.stringify(storedState)
    );
    environment.deleteProperty(KSP_PROPERTY_KEYS.BOOTSTRAP_CONFIG_JSON);
    kspAddAction_(report, 'state', KSP_PROPERTY_KEYS.INSTALLATION_STATE_JSON, 'saved', {
      schemaVersion: KSP_SCHEMA_VERSION
    });

    kspFinalizeReport_(report, environment.nowIso());
    environment.setProperty(KSP_PROPERTY_KEYS.LAST_SETUP_REPORT_JSON, JSON.stringify(report));
    return report;
  } catch (error) {
    kspAddError_(report, kspGetErrorCode_(error), error.message || String(error), {
      stack: kspStringifyError_(error)
    });
    kspFinalizeReport_(report, environment.nowIso());
    try {
      environment.setProperty(KSP_PROPERTY_KEYS.LAST_SETUP_REPORT_JSON, JSON.stringify(report));
    } catch (ignored) {
      // Preserve the original setup failure.
    }
    return report;
  } finally {
    if (lock) {
      environment.releaseScriptLock(lock);
    }
  }
}

function kspBuildLegacyMeetingCounterpartyBackfill_(row) {
  var source = row || {};
  var gpId = String(source.GP_ID || '').trim();
  if (!gpId) return null;
  var type = String(source.Counterparty_Type || '').trim();
  var entityId = String(source.Counterparty_ID || '').trim();
  var relatedGpIds = String(source.Related_GP_IDs || '').trim();
  if ((type && type !== 'GP') || (entityId && entityId !== gpId)) return null;
  var patch = {};
  if (!type) patch.Counterparty_Type = 'GP';
  if (!entityId) patch.Counterparty_ID = gpId;
  if (!relatedGpIds) patch.Related_GP_IDs = gpId;
  return Object.keys(patch).length ? patch : null;
}

function kspResolveAllResources_(environment, storedResources, config, report) {
  var resources = kspDeepClone_(storedResources || {});

  var knowledgeRoot = kspResolveResource_(environment, resources, report, {
    key: KSP_RESOURCE_KEYS.KNOWLEDGE_ROOT,
    parentId: config.knowledgeParentFolderId,
    name: KSP_RESOURCE_NAMES.KNOWLEDGE_ROOT,
    mimeType: KSP_MIME_TYPES.FOLDER
  });

  kspResolveResource_(environment, resources, report, {
    key: KSP_RESOURCE_KEYS.MEETING_RECORDS,
    parentId: knowledgeRoot.id,
    name: KSP_RESOURCE_NAMES.MEETING_RECORDS,
    mimeType: KSP_MIME_TYPES.FOLDER
  });

  kspResolveResource_(environment, resources, report, {
    key: KSP_RESOURCE_KEYS.PITCHBOOKS,
    parentId: knowledgeRoot.id,
    name: KSP_RESOURCE_NAMES.PITCHBOOKS,
    mimeType: KSP_MIME_TYPES.FOLDER
  });

  kspResolveResource_(environment, resources, report, {
    key: KSP_RESOURCE_KEYS.KNOWLEDGE_EXPORTS,
    parentId: config.knowledgeParentFolderId,
    name: KSP_RESOURCE_NAMES.KNOWLEDGE_EXPORTS,
    mimeType: KSP_MIME_TYPES.FOLDER
  });

  kspResolveResource_(environment, resources, report, {
    key: KSP_RESOURCE_KEYS.BACKEND_SPREADSHEET,
    parentId: config.controlFolderId,
    name: KSP_RESOURCE_NAMES.BACKEND_SPREADSHEET,
    mimeType: KSP_MIME_TYPES.SPREADSHEET
  });

  kspResolveResource_(environment, resources, report, {
    key: KSP_RESOURCE_KEYS.AUDIT_SPREADSHEET,
    parentId: config.controlFolderId,
    name: KSP_RESOURCE_NAMES.AUDIT_SPREADSHEET,
    mimeType: KSP_MIME_TYPES.SPREADSHEET
  });

  return resources;
}

function kspResolveResource_(environment, resources, report, specification) {
  var storedId = resources[specification.key];
  var resource;

  if (storedId) {
    resource = environment.getResource(storedId);
    kspAssert_(resource, 'STORED_RESOURCE_NOT_FOUND',
      'Stored resource is not accessible: ' + specification.key + ' (' + storedId + ').');
    kspAssert_(resource.mimeType === specification.mimeType, 'STORED_RESOURCE_TYPE_MISMATCH',
      'Stored resource has the wrong MIME type: ' + specification.key + '.');
    kspAssert_((resource.parents || []).indexOf(specification.parentId) !== -1,
      'STORED_RESOURCE_PARENT_MISMATCH',
      'Stored resource is outside the configured parent boundary: ' + specification.key + '.');
    if (resource.name !== specification.name) {
      kspAddWarning_(report, 'STORED_RESOURCE_RENAMED',
        'Stored resource name differs from the accepted default; the stored ID remains authoritative.', {
          key: specification.key,
          expectedName: specification.name,
          actualName: resource.name,
          id: resource.id
        });
    }
    kspAddAction_(report, 'resource', specification.key, 'reused', {
      id: resource.id,
      name: resource.name,
      source: 'stored-id'
    });
    return resource;
  }

  var matches = environment.findChildren(
    specification.parentId,
    specification.name,
    specification.mimeType
  );

  kspAssert_(matches.length <= 1, 'DUPLICATE_RESOURCE_CANDIDATES',
    'Multiple exact-name resources found for ' + specification.name + '.');

  if (matches.length === 1) {
    resource = matches[0];
    kspAddAction_(report, 'resource', specification.key, 'reused', {
      id: resource.id,
      name: resource.name,
      source: 'exact-name'
    });
  } else if (specification.mimeType === KSP_MIME_TYPES.FOLDER) {
    resource = environment.createFolder(specification.parentId, specification.name);
    kspAddAction_(report, 'resource', specification.key, 'created', {
      id: resource.id,
      name: resource.name
    });
  } else if (specification.mimeType === KSP_MIME_TYPES.SPREADSHEET) {
    resource = environment.createSpreadsheet(specification.parentId, specification.name);
    kspAddAction_(report, 'resource', specification.key, 'created', {
      id: resource.id,
      name: resource.name
    });
  } else {
    throw new Error('Unsupported setup resource MIME type: ' + specification.mimeType);
  }

  resources[specification.key] = resource.id;
  return resource;
}

function kspEnsureSpreadsheetSchemas_(environment, spreadsheetId, schemas, category, report) {
  Object.keys(schemas).forEach(function (sheetName) {
    var result = environment.ensureSheet(spreadsheetId, sheetName, schemas[sheetName]);
    kspAddAction_(report, 'schema', category + ':' + sheetName, result.action, result);
  });
}

function kspEnsureTriggers_(environment, registry, report) {
  var existingTriggers = environment.listTriggers();

  registry.forEach(function (rule) {
    var legacyHandlers = rule.legacyHandlers || [];
    var legacyMatches = existingTriggers.filter(function (trigger) {
      return trigger.eventType === rule.eventType && legacyHandlers.indexOf(trigger.handler) !== -1;
    });
    legacyMatches.forEach(function (trigger) {
      kspAssert_(typeof environment.deleteTrigger === 'function', 'TRIGGER_MIGRATION_UNSUPPORTED',
        'Trigger migration requires a deleteTrigger adapter.');
      kspAssert_(trigger.id, 'TRIGGER_MIGRATION_ID_MISSING',
        'Legacy trigger migration requires a trigger ID.');
      environment.deleteTrigger(trigger.id);
      kspAddAction_(report, 'trigger', rule.key, 'migrated', {
        removedHandler: trigger.handler,
        replacementHandler: rule.handler,
        eventType: rule.eventType,
        id: trigger.id
      });
    });
    if (legacyMatches.length) {
      existingTriggers = existingTriggers.filter(function (trigger) {
        return legacyMatches.indexOf(trigger) === -1;
      });
    }

    if (!rule.enabled) {
      kspAddAction_(report, 'trigger', rule.key, 'skipped', { reason: 'disabled' });
      return;
    }

    kspAssert_(rule.available !== false, 'TRIGGER_HANDLER_NOT_AVAILABLE',
      'Trigger handler is not implemented in the current application version: ' + rule.handler + '.');

    var matches = existingTriggers.filter(function (trigger) {
      return trigger.handler === rule.handler && trigger.eventType === rule.eventType;
    });

    if (matches.length > 0) {
      kspAddAction_(report, 'trigger', rule.key, 'reused', {
        count: matches.length,
        handler: rule.handler,
        eventType: rule.eventType
      });
      if (matches.length > 1) {
        kspAddWarning_(report, 'DUPLICATE_EXISTING_TRIGGERS',
          'Multiple matching triggers already exist; setup did not create another trigger.', {
            key: rule.key,
            count: matches.length
          });
      }
      return;
    }

    var created = environment.createClockTrigger(rule.handler, rule.intervalMinutes);
    existingTriggers.push(created);
    kspAddAction_(report, 'trigger', rule.key, 'created', {
      handler: rule.handler,
      eventType: rule.eventType,
      intervalMinutes: rule.intervalMinutes,
      id: created.id || null
    });
  });
}
function kspRunValidation_(environment) {
  var report = kspCreateReport_('VALIDATE', environment.nowIso());

  try {
    var state = kspLoadInstallationState_(environment);
    kspAssert_(state && state.config && state.resources, 'INSTALLATION_STATE_MISSING',
      'Installation state is missing. Run setupKnowledgePlatform_() first.');

    var config = kspNormalizeAndValidateConfig_(state.config);
    report.environment = config.environment;
    report.resources = kspDeepClone_(state.resources);

    var resourceChecks = [
      [KSP_RESOURCE_KEYS.KNOWLEDGE_ROOT, KSP_MIME_TYPES.FOLDER],
      [KSP_RESOURCE_KEYS.MEETING_RECORDS, KSP_MIME_TYPES.FOLDER],
      [KSP_RESOURCE_KEYS.PITCHBOOKS, KSP_MIME_TYPES.FOLDER],
      [KSP_RESOURCE_KEYS.KNOWLEDGE_EXPORTS, KSP_MIME_TYPES.FOLDER],
      [KSP_RESOURCE_KEYS.BACKEND_SPREADSHEET, KSP_MIME_TYPES.SPREADSHEET],
      [KSP_RESOURCE_KEYS.AUDIT_SPREADSHEET, KSP_MIME_TYPES.SPREADSHEET]
    ];

    resourceChecks.forEach(function (check) {
      var id = state.resources[check[0]];
      kspAssert_(id, 'RESOURCE_ID_MISSING', 'Missing stored resource ID: ' + check[0]);
      var resource = environment.getResource(id);
      kspAssert_(resource, 'RESOURCE_NOT_ACCESSIBLE', 'Resource is not accessible: ' + check[0]);
      kspAssert_(resource.mimeType === check[1], 'RESOURCE_TYPE_MISMATCH',
        'Resource has unexpected MIME type: ' + check[0]);
      kspAddAction_(report, 'validation', check[0], 'passed', { id: id });
    });

    var parentChecks = [
      [KSP_RESOURCE_KEYS.KNOWLEDGE_ROOT, config.knowledgeParentFolderId],
      [KSP_RESOURCE_KEYS.MEETING_RECORDS, state.resources[KSP_RESOURCE_KEYS.KNOWLEDGE_ROOT]],
      [KSP_RESOURCE_KEYS.PITCHBOOKS, state.resources[KSP_RESOURCE_KEYS.KNOWLEDGE_ROOT]],
      [KSP_RESOURCE_KEYS.KNOWLEDGE_EXPORTS, config.knowledgeParentFolderId],
      [KSP_RESOURCE_KEYS.BACKEND_SPREADSHEET, config.controlFolderId],
      [KSP_RESOURCE_KEYS.AUDIT_SPREADSHEET, config.controlFolderId]
    ];
    parentChecks.forEach(function (check) {
      var resource = environment.getResource(state.resources[check[0]]);
      kspAssert_((resource.parents || []).indexOf(check[1]) !== -1,
        'RESOURCE_PARENT_MISMATCH', 'Resource is outside the configured parent boundary: ' + check[0]);
      kspAddAction_(report, 'validation', check[0] + ':parent', 'passed', { parentId: check[1] });
    });

    kspValidateSchemas_(
      environment,
      state.resources[KSP_RESOURCE_KEYS.BACKEND_SPREADSHEET],
      kspGetBackendSchemas_(),
      'backend',
      report
    );
    kspValidateSchemas_(
      environment,
      state.resources[KSP_RESOURCE_KEYS.AUDIT_SPREADSHEET],
      kspGetAuditSchema_(),
      'audit',
      report
    );

    var gpIds = environment.getColumnValues(
      state.resources[KSP_RESOURCE_KEYS.BACKEND_SPREADSHEET],
      KSP_SHEET_NAMES.GP_MASTER,
      'GP_ID'
    );
    var optionIds = environment.getColumnValues(
      state.resources[KSP_RESOURCE_KEYS.BACKEND_SPREADSHEET],
      KSP_SHEET_NAMES.OPTION_MASTER,
      'Option_ID'
    );

    kspGetGpSeedDefinitions_().forEach(function (seed) {
      kspAssert_(gpIds.indexOf(seed[0]) !== -1, 'GP_SEED_MISSING', 'Missing GP seed: ' + seed[0]);
    });
    kspGetOptionSeedDefinitions_().forEach(function (seed) {
      kspAssert_(optionIds.indexOf(seed[0]) !== -1, 'OPTION_SEED_MISSING', 'Missing Option seed: ' + seed[0]);
    });
    kspAddAction_(report, 'validation', 'master-seeds', 'passed', {
      gpSeedCount: kspGetGpSeedDefinitions_().length,
      optionSeedCount: kspGetOptionSeedDefinitions_().length
    });

    var triggerRegistry = kspGetTriggerRegistry_(config);
    var existingTriggers = environment.listTriggers();
    triggerRegistry.forEach(function (rule) {
      if (!rule.enabled) {
        return;
      }
      var found = existingTriggers.some(function (trigger) {
        return trigger.handler === rule.handler && trigger.eventType === rule.eventType;
      });
      kspAssert_(found, 'TRIGGER_MISSING', 'Required trigger is missing: ' + rule.key);
    });

    return kspFinalizeReport_(report, environment.nowIso());
  } catch (error) {
    kspAddError_(report, kspGetErrorCode_(error), error.message || String(error), {
      stack: kspStringifyError_(error)
    });
    return kspFinalizeReport_(report, environment.nowIso());
  }
}

function kspValidateSchemas_(environment, spreadsheetId, schemas, category, report) {
  Object.keys(schemas).forEach(function (sheetName) {
    var actualHeaders = environment.getSheetHeaders(spreadsheetId, sheetName);
    var missing = schemas[sheetName].filter(function (header) {
      return actualHeaders.indexOf(header) === -1;
    });
    kspAssert_(missing.length === 0, 'SCHEMA_COLUMNS_MISSING',
      category + ':' + sheetName + ' is missing columns: ' + missing.join(', '));
    kspAddAction_(report, 'validation', category + ':' + sheetName, 'passed', {
      columnCount: actualHeaders.length
    });
  });
}

function kspGetStatus_(environment) {
  var state;
  try {
    state = kspLoadInstallationState_(environment);
  } catch (error) {
    return {
      installed: false,
      ok: false,
      error: error.message || String(error)
    };
  }

  var resources = state && state.resources ? state.resources : {};
  var requiredKeys = Object.keys(KSP_RESOURCE_KEYS).map(function (constantKey) {
    return KSP_RESOURCE_KEYS[constantKey];
  });
  var missingResourceKeys = requiredKeys.filter(function (key) { return !resources[key]; });

  return {
    installed: Boolean(state && state.config && missingResourceKeys.length === 0),
    ok: true,
    componentWorkId: state.componentWorkId || KSP_COMPONENT_WORK_ID,
    releaseVersion: state.releaseVersion || state.appVersion || KSP_RELEASE_VERSION,
    appVersion: state.appVersion || null,
    schemaVersion: state.schemaVersion || null,
    environment: state.config ? state.config.environment : null,
    updatedAt: state.updatedAt || null,
    resources: kspDeepClone_(resources),
    missingResourceKeys: missingResourceKeys
  };
}
