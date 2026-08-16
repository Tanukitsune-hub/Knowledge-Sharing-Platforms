function kspRunSetup(environment) {
  var report = kspCreateReport('SETUP', environment.nowIso());
  var lock = null;

  try {
    lock = environment.acquireScriptLock(KSP_DEFAULTS.LOCK_TIMEOUT_MS);
    var existingState = kspLoadInstallationState(environment);
    var config = kspLoadEffectiveConfig(environment, existingState);
    report.environment = config.environment;

    var resources = kspResolveAllResources(environment, existingState.resources || {}, config, report);
    report.resources = kspDeepClone(resources);

    kspEnsureSpreadsheetSchemas(
      environment,
      resources[KSP_RESOURCE_KEYS.BACKEND_SPREADSHEET],
      kspGetBackendSchemas(),
      'backend',
      report
    );
    kspEnsureSpreadsheetSchemas(
      environment,
      resources[KSP_RESOURCE_KEYS.AUDIT_SPREADSHEET],
      kspGetAuditSchema(),
      'audit',
      report
    );

    var nowIso = environment.nowIso();
    var gpResult = environment.insertMissingRows(
      resources[KSP_RESOURCE_KEYS.BACKEND_SPREADSHEET],
      KSP_SHEET_NAMES.GP_MASTER,
      'GP_ID',
      kspBuildGpSeedRows(nowIso)
    );
    kspAddAction(report, 'seed', KSP_SHEET_NAMES.GP_MASTER, 'upserted', gpResult);

    var optionResult = environment.insertMissingRows(
      resources[KSP_RESOURCE_KEYS.BACKEND_SPREADSHEET],
      KSP_SHEET_NAMES.OPTION_MASTER,
      'Option_ID',
      kspBuildOptionSeedRows(nowIso)
    );
    kspAddAction(report, 'seed', KSP_SHEET_NAMES.OPTION_MASTER, 'upserted', optionResult);

    var settingsResult = environment.upsertRows(
      resources[KSP_RESOURCE_KEYS.BACKEND_SPREADSHEET],
      KSP_SHEET_NAMES.SETTINGS,
      'Key',
      kspBuildSettingsRows(config, resources, nowIso),
      { preserveExistingKeys: kspGetSettingsPreserveExistingKeys() }
    );
    kspAddAction(report, 'settings', KSP_SHEET_NAMES.SETTINGS, 'upserted', settingsResult);

    kspEnsureTriggers(environment, kspGetTriggerRegistry(config), report);

    var storedState = kspBuildStoredInstallationState(config, resources, nowIso);
    environment.setProperty(
      KSP_PROPERTY_KEYS.INSTALLATION_STATE_JSON,
      JSON.stringify(storedState)
    );
    environment.deleteProperty(KSP_PROPERTY_KEYS.BOOTSTRAP_CONFIG_JSON);
    kspAddAction(report, 'state', KSP_PROPERTY_KEYS.INSTALLATION_STATE_JSON, 'saved', {
      schemaVersion: KSP_SCHEMA_VERSION
    });

    kspFinalizeReport(report, environment.nowIso());
    environment.setProperty(KSP_PROPERTY_KEYS.LAST_SETUP_REPORT_JSON, JSON.stringify(report));
    return report;
  } catch (error) {
    kspAddError(report, kspGetErrorCode(error), error.message || String(error), {
      stack: kspStringifyError(error)
    });
    kspFinalizeReport(report, environment.nowIso());
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

function kspResolveAllResources(environment, storedResources, config, report) {
  var resources = kspDeepClone(storedResources || {});

  var knowledgeRoot = kspResolveResource(environment, resources, report, {
    key: KSP_RESOURCE_KEYS.KNOWLEDGE_ROOT,
    parentId: config.knowledgeParentFolderId,
    name: KSP_RESOURCE_NAMES.KNOWLEDGE_ROOT,
    mimeType: KSP_MIME_TYPES.FOLDER
  });

  kspResolveResource(environment, resources, report, {
    key: KSP_RESOURCE_KEYS.MEETING_RECORDS,
    parentId: knowledgeRoot.id,
    name: KSP_RESOURCE_NAMES.MEETING_RECORDS,
    mimeType: KSP_MIME_TYPES.FOLDER
  });

  kspResolveResource(environment, resources, report, {
    key: KSP_RESOURCE_KEYS.PITCHBOOKS,
    parentId: knowledgeRoot.id,
    name: KSP_RESOURCE_NAMES.PITCHBOOKS,
    mimeType: KSP_MIME_TYPES.FOLDER
  });

  kspResolveResource(environment, resources, report, {
    key: KSP_RESOURCE_KEYS.KNOWLEDGE_EXPORTS,
    parentId: config.knowledgeParentFolderId,
    name: KSP_RESOURCE_NAMES.KNOWLEDGE_EXPORTS,
    mimeType: KSP_MIME_TYPES.FOLDER
  });

  kspResolveResource(environment, resources, report, {
    key: KSP_RESOURCE_KEYS.BACKEND_SPREADSHEET,
    parentId: config.controlFolderId,
    name: KSP_RESOURCE_NAMES.BACKEND_SPREADSHEET,
    mimeType: KSP_MIME_TYPES.SPREADSHEET
  });

  kspResolveResource(environment, resources, report, {
    key: KSP_RESOURCE_KEYS.AUDIT_SPREADSHEET,
    parentId: config.controlFolderId,
    name: KSP_RESOURCE_NAMES.AUDIT_SPREADSHEET,
    mimeType: KSP_MIME_TYPES.SPREADSHEET
  });

  return resources;
}

function kspResolveResource(environment, resources, report, specification) {
  var storedId = resources[specification.key];
  var resource;

  if (storedId) {
    resource = environment.getResource(storedId);
    kspAssert(resource, 'STORED_RESOURCE_NOT_FOUND',
      'Stored resource is not accessible: ' + specification.key + ' (' + storedId + ').');
    kspAssert(resource.mimeType === specification.mimeType, 'STORED_RESOURCE_TYPE_MISMATCH',
      'Stored resource has the wrong MIME type: ' + specification.key + '.');
    kspAssert((resource.parents || []).indexOf(specification.parentId) !== -1,
      'STORED_RESOURCE_PARENT_MISMATCH',
      'Stored resource is outside the configured parent boundary: ' + specification.key + '.');
    if (resource.name !== specification.name) {
      kspAddWarning(report, 'STORED_RESOURCE_RENAMED',
        'Stored resource name differs from the accepted default; the stored ID remains authoritative.', {
          key: specification.key,
          expectedName: specification.name,
          actualName: resource.name,
          id: resource.id
        });
    }
    kspAddAction(report, 'resource', specification.key, 'reused', {
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

  kspAssert(matches.length <= 1, 'DUPLICATE_RESOURCE_CANDIDATES',
    'Multiple exact-name resources found for ' + specification.name + '.');

  if (matches.length === 1) {
    resource = matches[0];
    kspAddAction(report, 'resource', specification.key, 'reused', {
      id: resource.id,
      name: resource.name,
      source: 'exact-name'
    });
  } else if (specification.mimeType === KSP_MIME_TYPES.FOLDER) {
    resource = environment.createFolder(specification.parentId, specification.name);
    kspAddAction(report, 'resource', specification.key, 'created', {
      id: resource.id,
      name: resource.name
    });
  } else if (specification.mimeType === KSP_MIME_TYPES.SPREADSHEET) {
    resource = environment.createSpreadsheet(specification.parentId, specification.name);
    kspAddAction(report, 'resource', specification.key, 'created', {
      id: resource.id,
      name: resource.name
    });
  } else {
    throw new Error('Unsupported setup resource MIME type: ' + specification.mimeType);
  }

  resources[specification.key] = resource.id;
  return resource;
}

function kspEnsureSpreadsheetSchemas(environment, spreadsheetId, schemas, category, report) {
  Object.keys(schemas).forEach(function (sheetName) {
    var result = environment.ensureSheet(spreadsheetId, sheetName, schemas[sheetName]);
    kspAddAction(report, 'schema', category + ':' + sheetName, result.action, result);
  });
}

function kspEnsureTriggers(environment, registry, report) {
  var existingTriggers = environment.listTriggers();

  registry.forEach(function (rule) {
    if (!rule.enabled) {
      kspAddAction(report, 'trigger', rule.key, 'skipped', { reason: 'disabled' });
      return;
    }

    kspAssert(rule.available !== false, 'TRIGGER_HANDLER_NOT_AVAILABLE',
      'Trigger handler is not implemented in the current application version: ' + rule.handler + '.');

    var matches = existingTriggers.filter(function (trigger) {
      return trigger.handler === rule.handler && trigger.eventType === rule.eventType;
    });

    if (matches.length > 0) {
      kspAddAction(report, 'trigger', rule.key, 'reused', {
        count: matches.length,
        handler: rule.handler,
        eventType: rule.eventType
      });
      if (matches.length > 1) {
        kspAddWarning(report, 'DUPLICATE_EXISTING_TRIGGERS',
          'Multiple matching triggers already exist; setup did not create another trigger.', {
            key: rule.key,
            count: matches.length
          });
      }
      return;
    }

    var created = environment.createClockTrigger(rule.handler, rule.intervalMinutes);
    existingTriggers.push(created);
    kspAddAction(report, 'trigger', rule.key, 'created', {
      handler: rule.handler,
      eventType: rule.eventType,
      intervalMinutes: rule.intervalMinutes,
      id: created.id || null
    });
  });
}
function kspRunValidation(environment) {
  var report = kspCreateReport('VALIDATE', environment.nowIso());

  try {
    var state = kspLoadInstallationState(environment);
    kspAssert(state && state.config && state.resources, 'INSTALLATION_STATE_MISSING',
      'Installation state is missing. Run setupKnowledgePlatform() first.');

    var config = kspNormalizeAndValidateConfig(state.config);
    report.environment = config.environment;
    report.resources = kspDeepClone(state.resources);

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
      kspAssert(id, 'RESOURCE_ID_MISSING', 'Missing stored resource ID: ' + check[0]);
      var resource = environment.getResource(id);
      kspAssert(resource, 'RESOURCE_NOT_ACCESSIBLE', 'Resource is not accessible: ' + check[0]);
      kspAssert(resource.mimeType === check[1], 'RESOURCE_TYPE_MISMATCH',
        'Resource has unexpected MIME type: ' + check[0]);
      kspAddAction(report, 'validation', check[0], 'passed', { id: id });
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
      kspAssert((resource.parents || []).indexOf(check[1]) !== -1,
        'RESOURCE_PARENT_MISMATCH', 'Resource is outside the configured parent boundary: ' + check[0]);
      kspAddAction(report, 'validation', check[0] + ':parent', 'passed', { parentId: check[1] });
    });

    kspValidateSchemas(
      environment,
      state.resources[KSP_RESOURCE_KEYS.BACKEND_SPREADSHEET],
      kspGetBackendSchemas(),
      'backend',
      report
    );
    kspValidateSchemas(
      environment,
      state.resources[KSP_RESOURCE_KEYS.AUDIT_SPREADSHEET],
      kspGetAuditSchema(),
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

    kspGetGpSeedDefinitions().forEach(function (seed) {
      kspAssert(gpIds.indexOf(seed[0]) !== -1, 'GP_SEED_MISSING', 'Missing GP seed: ' + seed[0]);
    });
    kspGetOptionSeedDefinitions().forEach(function (seed) {
      kspAssert(optionIds.indexOf(seed[0]) !== -1, 'OPTION_SEED_MISSING', 'Missing Option seed: ' + seed[0]);
    });
    kspAddAction(report, 'validation', 'master-seeds', 'passed', {
      gpSeedCount: kspGetGpSeedDefinitions().length,
      optionSeedCount: kspGetOptionSeedDefinitions().length
    });

    var triggerRegistry = kspGetTriggerRegistry(config);
    var existingTriggers = environment.listTriggers();
    triggerRegistry.forEach(function (rule) {
      if (!rule.enabled) {
        return;
      }
      var found = existingTriggers.some(function (trigger) {
        return trigger.handler === rule.handler && trigger.eventType === rule.eventType;
      });
      kspAssert(found, 'TRIGGER_MISSING', 'Required trigger is missing: ' + rule.key);
    });

    return kspFinalizeReport(report, environment.nowIso());
  } catch (error) {
    kspAddError(report, kspGetErrorCode(error), error.message || String(error), {
      stack: kspStringifyError(error)
    });
    return kspFinalizeReport(report, environment.nowIso());
  }
}

function kspValidateSchemas(environment, spreadsheetId, schemas, category, report) {
  Object.keys(schemas).forEach(function (sheetName) {
    var actualHeaders = environment.getSheetHeaders(spreadsheetId, sheetName);
    var missing = schemas[sheetName].filter(function (header) {
      return actualHeaders.indexOf(header) === -1;
    });
    kspAssert(missing.length === 0, 'SCHEMA_COLUMNS_MISSING',
      category + ':' + sheetName + ' is missing columns: ' + missing.join(', '));
    kspAddAction(report, 'validation', category + ':' + sheetName, 'passed', {
      columnCount: actualHeaders.length
    });
  });
}

function kspGetStatus(environment) {
  var state;
  try {
    state = kspLoadInstallationState(environment);
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
    appVersion: state.appVersion || null,
    schemaVersion: state.schemaVersion || null,
    environment: state.config ? state.config.environment : null,
    updatedAt: state.updatedAt || null,
    resources: kspDeepClone(resources),
    missingResourceKeys: missingResourceKeys
  };
}
