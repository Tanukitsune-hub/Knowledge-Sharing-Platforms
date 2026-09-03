var KSP_AI_MODEL_ACCESS_STATES = Object.freeze({
  AVAILABLE: 'AVAILABLE',
  UNAVAILABLE: 'UNAVAILABLE',
  UNKNOWN: 'UNKNOWN'
});

var KSP_AI_MODEL_QUALIFICATION_STATES = Object.freeze({
  QUALIFIED: 'QUALIFIED',
  UNQUALIFIED: 'UNQUALIFIED',
  FAILED: 'FAILED'
});

function kspAiModelPolicyError_(code, message) {
  var error = new Error(message || 'AI model policy is invalid.');
  error.code = code;
  return error;
}

function kspAiModelPolicyAssert_(condition, code, message) {
  if (!condition) throw kspAiModelPolicyError_(code, message);
}

function kspAiModelPolicySafeId_(value, code) {
  var normalized = kspAiTrim_(value).toLowerCase();
  kspAiModelPolicyAssert_(/^[a-z][a-z0-9-]{2,63}$/.test(normalized), code || 'AI_MODEL_PROFILE_ID_INVALID');
  return normalized;
}

function kspAiModelPolicySafeText_(value, maximum, code, required) {
  var normalized = kspAiTrim_(value);
  kspAiModelPolicyAssert_(!required || normalized, code);
  kspAiModelPolicyAssert_(normalized.length <= maximum, code);
  return normalized;
}

function kspAiModelPolicyState_(value, allowed, fallback, code) {
  var normalized = kspAiTrim_(value).toUpperCase() || fallback;
  kspAiModelPolicyAssert_(allowed.indexOf(normalized) !== -1, code);
  return normalized;
}

function kspAiModelPolicyThinkingProfile_(raw) {
  var value = raw || {};
  var id = kspAiModelPolicySafeId_(value.thinkingProfileId || value.profileId || value.id,
    'AI_THINKING_PROFILE_ID_INVALID');
  var rawValue = value.rawValue;
  if (rawValue === undefined && value.value !== undefined) rawValue = value.value;
  var providerDefault = value.providerDefault === true || rawValue === null || rawValue === undefined || rawValue === '';
  if (providerDefault) rawValue = null;
  else {
    rawValue = kspAiTrim_(rawValue);
    kspAiModelPolicyAssert_(/^[A-Za-z0-9_-]{1,32}$/.test(rawValue), 'AI_THINKING_VALUE_INVALID');
  }
  return {
    thinkingProfileId: id,
    label: kspAiModelPolicySafeText_(value.label || id, 80, 'AI_THINKING_LABEL_INVALID', true),
    rawValue: rawValue,
    providerDefault: providerDefault,
    enabled: value.enabled !== false,
    qualification: kspAiModelPolicyState_(value.qualification,
      [KSP_AI_MODEL_QUALIFICATION_STATES.QUALIFIED, KSP_AI_MODEL_QUALIFICATION_STATES.UNQUALIFIED,
        KSP_AI_MODEL_QUALIFICATION_STATES.FAILED],
      KSP_AI_MODEL_QUALIFICATION_STATES.UNQUALIFIED, 'AI_THINKING_QUALIFICATION_STATE_INVALID'),
    qualifiedAt: kspAiModelPolicySafeText_(value.qualifiedAt, 40, 'AI_MODEL_TIMESTAMP_INVALID', false)
  };
}

function kspAiModelPolicyProfile_(raw) {
  var value = raw || {};
  var provider = kspNormalizeAiProvider_(value.provider);
  kspAiModelPolicyAssert_(provider, 'AI_MODEL_PROFILE_PROVIDER_INVALID');
  var modelId = kspAiModelPolicySafeText_(value.modelId, 128, 'AI_MODEL_ID_INVALID', true);
  kspAiModelPolicyAssert_(/^[A-Za-z0-9][A-Za-z0-9._:/-]{0,127}$/.test(modelId), 'AI_MODEL_ID_INVALID');
  var thinkingProfiles = Array.isArray(value.thinkingProfiles) ? value.thinkingProfiles : [];
  kspAiModelPolicyAssert_(thinkingProfiles.length > 0 && thinkingProfiles.length <= 12,
    'AI_THINKING_PROFILES_INVALID');
  var thinkingSeen = {};
  thinkingProfiles = thinkingProfiles.map(function (item) {
    var normalized = kspAiModelPolicyThinkingProfile_(item);
    kspAiModelPolicyAssert_(!thinkingSeen[normalized.thinkingProfileId], 'AI_THINKING_PROFILE_DUPLICATE');
    thinkingSeen[normalized.thinkingProfileId] = true;
    return normalized;
  });
  if (provider === KSP_AI_PROVIDERS.GEMINI &&
      (modelId === 'gemini-3.8-flash' || modelId === 'gemini-3.7-flash')) {
    thinkingProfiles.forEach(function (thinking) {
      if (!thinking.providerDefault) {
        kspAiModelPolicyAssert_(['low', 'medium', 'high'].indexOf(String(thinking.rawValue).toLowerCase()) !== -1,
          'AI_THINKING_VALUE_INVALID');
      }
    });
  }
  var defaultThinkingProfileId = kspAiModelPolicySafeId_(
    value.defaultThinkingProfileId || thinkingProfiles[0].thinkingProfileId,
    'AI_THINKING_DEFAULT_INVALID');
  kspAiModelPolicyAssert_(thinkingSeen[defaultThinkingProfileId], 'AI_THINKING_DEFAULT_INVALID');
  var maximum = value.maxOutputTokens;
  if (maximum === '' || maximum === undefined || maximum === null) maximum = null;
  else {
    maximum = Number(maximum);
    kspAiModelPolicyAssert_(Number.isFinite(maximum) && Math.floor(maximum) === maximum && maximum >= 1 && maximum <= 65536,
      'AI_MODEL_OUTPUT_LIMIT_INVALID');
  }
  var enabled = value.enabled !== false;
  var userVisible = value.userVisible !== false;
  var isProviderDefault = value.isProviderDefault === true;
  var qualification = kspAiModelPolicyState_(value.qualification,
    [KSP_AI_MODEL_QUALIFICATION_STATES.QUALIFIED, KSP_AI_MODEL_QUALIFICATION_STATES.UNQUALIFIED,
      KSP_AI_MODEL_QUALIFICATION_STATES.FAILED],
    KSP_AI_MODEL_QUALIFICATION_STATES.UNQUALIFIED, 'AI_MODEL_QUALIFICATION_STATE_INVALID');
  var fileSearch = value.fileSearch === true;
  var qualifiedAt = kspAiModelPolicySafeText_(value.qualifiedAt, 40, 'AI_MODEL_TIMESTAMP_INVALID', false);
  var migrateAcceptedDefault = provider === KSP_AI_PROVIDERS.OPENAI && isProviderDefault && fileSearch &&
    qualification === KSP_AI_MODEL_QUALIFICATION_STATES.QUALIFIED && thinkingProfiles.length === 1 &&
    thinkingProfiles[0].providerDefault && (!value.thinkingProfiles[0] || value.thinkingProfiles[0].qualification === undefined);
  if (migrateAcceptedDefault) {
    thinkingProfiles[0].qualification = KSP_AI_MODEL_QUALIFICATION_STATES.QUALIFIED;
    thinkingProfiles[0].qualifiedAt = qualifiedAt;
  }
  kspAiModelPolicyAssert_(!isProviderDefault || enabled, 'AI_MODEL_DEFAULT_INVALID');
  return {
    profileId: kspAiModelPolicySafeId_(value.profileId, 'AI_MODEL_PROFILE_ID_INVALID'),
    provider: provider,
    modelId: modelId,
    displayName: kspAiModelPolicySafeText_(value.displayName || modelId, 120, 'AI_MODEL_DISPLAY_NAME_INVALID', true),
    family: kspAiModelPolicySafeText_(value.family || modelId, 80, 'AI_MODEL_FAMILY_INVALID', true),
    enabled: enabled,
    userVisible: userVisible,
    isProviderDefault: isProviderDefault,
    apiAccess: kspAiModelPolicyState_(value.apiAccess,
      [KSP_AI_MODEL_ACCESS_STATES.AVAILABLE, KSP_AI_MODEL_ACCESS_STATES.UNAVAILABLE, KSP_AI_MODEL_ACCESS_STATES.UNKNOWN],
      KSP_AI_MODEL_ACCESS_STATES.UNKNOWN, 'AI_MODEL_ACCESS_STATE_INVALID'),
    qualification: qualification,
    fileSearch: fileSearch,
    thinkingProfiles: thinkingProfiles,
    defaultThinkingProfileId: defaultThinkingProfileId,
    maxOutputTokens: maximum,
    qualifiedStoreName: kspAiModelPolicySafeText_(value.qualifiedStoreName, 256,
      'AI_MODEL_QUALIFICATION_IDENTITY_INVALID', false),
    qualifiedRequestProfileVersion: kspAiModelPolicySafeText_(value.qualifiedRequestProfileVersion, 80,
      'AI_MODEL_QUALIFICATION_IDENTITY_INVALID', false),
    createdAt: kspAiModelPolicySafeText_(value.createdAt, 40, 'AI_MODEL_TIMESTAMP_INVALID', false),
    updatedAt: kspAiModelPolicySafeText_(value.updatedAt, 40, 'AI_MODEL_TIMESTAMP_INVALID', false),
    qualifiedAt: qualifiedAt,
    safeNote: kspAiModelPolicySafeText_(value.safeNote, 240, 'AI_MODEL_SAFE_NOTE_INVALID', false)
  };
}

function kspNormalizeAiModelPolicy_(raw) {
  var value = raw;
  if (typeof value === 'string') {
    try { value = value ? JSON.parse(value) : null; }
    catch (error) { throw kspAiModelPolicyError_('AI_MODEL_POLICY_JSON_INVALID'); }
  }
  kspAiModelPolicyAssert_(value && typeof value === 'object' && !Array.isArray(value), 'AI_MODEL_POLICY_INVALID');
  var schemaVersion = Number(value.schemaVersion);
  kspAiModelPolicyAssert_(schemaVersion === KSP_AI_DEFAULTS.MODEL_POLICY_SCHEMA_VERSION,
    'AI_MODEL_POLICY_SCHEMA_UNSUPPORTED');
  var profiles = Array.isArray(value.profiles) ? value.profiles : [];
  kspAiModelPolicyAssert_(profiles.length > 0 && profiles.length <= 50, 'AI_MODEL_PROFILES_INVALID');
  var profileSeen = {};
  var defaults = {};
  var enabledProviders = {};
  profiles = profiles.map(function (item) {
    var profile = kspAiModelPolicyProfile_(item);
    kspAiModelPolicyAssert_(!profileSeen[profile.profileId], 'AI_MODEL_PROFILE_DUPLICATE');
    profileSeen[profile.profileId] = true;
    if (profile.enabled) enabledProviders[profile.provider] = true;
    if (profile.isProviderDefault) {
      kspAiModelPolicyAssert_(!defaults[profile.provider], 'AI_MODEL_DEFAULT_DUPLICATE');
      defaults[profile.provider] = profile.profileId;
    }
    return profile;
  });
  Object.keys(enabledProviders).forEach(function (provider) {
    kspAiModelPolicyAssert_(defaults[provider], 'AI_MODEL_DEFAULT_REQUIRED');
  });
  return {
    schemaVersion: schemaVersion,
    updatedAt: kspAiModelPolicySafeText_(value.updatedAt, 40, 'AI_MODEL_TIMESTAMP_INVALID', false),
    profiles: profiles
  };
}

function kspBuildProviderDefaultThinkingProfile_(qualification, qualifiedAt) {
  return {
    thinkingProfileId: KSP_AI_DEFAULTS.PROVIDER_DEFAULT_THINKING_PROFILE_ID,
    label: 'プロバイダ標準',
    rawValue: null,
    providerDefault: true,
    enabled: true,
    qualification: qualification || KSP_AI_MODEL_QUALIFICATION_STATES.UNQUALIFIED,
    qualifiedAt: qualifiedAt || ''
  };
}

function kspBuildMigratedOpenAiModelPolicy_(settings, options) {
  var source = settings || {};
  var runtime = options || {};
  var nowIso = kspAiTrim_(runtime.nowIso);
  var modelId = kspAiTrim_(runtime.modelId || source.openaiModelId || KSP_AI_DEFAULTS.OPENAI_DEFAULT_MODEL);
  var ready = runtime.qualified === true || (source.openaiEnabled &&
    ['ACTIVE', 'ACTIVE_WITH_SYNC_ERRORS', 'READY_FOR_SYNC'].indexOf(source.openaiReadiness) !== -1);
  var access = runtime.accessible === true || ready;
  return kspNormalizeAiModelPolicy_({
    schemaVersion: KSP_AI_DEFAULTS.MODEL_POLICY_SCHEMA_VERSION,
    updatedAt: nowIso,
    profiles: [{
      profileId: KSP_AI_DEFAULTS.OPENAI_DEFAULT_PROFILE_ID,
      provider: KSP_AI_PROVIDERS.OPENAI,
      modelId: modelId,
      displayName: modelId,
      family: modelId,
      enabled: true,
      userVisible: true,
      isProviderDefault: true,
      apiAccess: access ? KSP_AI_MODEL_ACCESS_STATES.AVAILABLE : KSP_AI_MODEL_ACCESS_STATES.UNKNOWN,
      qualification: ready ? KSP_AI_MODEL_QUALIFICATION_STATES.QUALIFIED : KSP_AI_MODEL_QUALIFICATION_STATES.UNQUALIFIED,
      fileSearch: ready,
      thinkingProfiles: [kspBuildProviderDefaultThinkingProfile_(ready
        ? KSP_AI_MODEL_QUALIFICATION_STATES.QUALIFIED : KSP_AI_MODEL_QUALIFICATION_STATES.UNQUALIFIED,
      ready ? nowIso : '')],
      defaultThinkingProfileId: KSP_AI_DEFAULTS.PROVIDER_DEFAULT_THINKING_PROFILE_ID,
      maxOutputTokens: null,
      createdAt: nowIso,
      updatedAt: nowIso,
      qualifiedAt: ready ? nowIso : '',
      safeNote: 'Work 0020 qualified OpenAI default migration.'
    }]
  });
}

function kspBuildLegacyProviderModelPolicy_(provider, config, nowIso) {
  var normalizedProvider = kspNormalizeAiProvider_(provider);
  var modelId = kspAiTrim_(config && config.modelId);
  var thinkingProfiles = normalizedProvider === KSP_AI_PROVIDERS.GEMINI ? [{
    thinkingProfileId: 'legacy-low', label: 'Low', rawValue: 'low', providerDefault: false, enabled: true
  }] : [kspBuildProviderDefaultThinkingProfile_(KSP_AI_MODEL_QUALIFICATION_STATES.QUALIFIED, nowIso || '')];
  thinkingProfiles.forEach(function (thinking) {
    thinking.qualification = KSP_AI_MODEL_QUALIFICATION_STATES.QUALIFIED;
    thinking.qualifiedAt = nowIso || '';
  });
  return kspNormalizeAiModelPolicy_({
    schemaVersion: KSP_AI_DEFAULTS.MODEL_POLICY_SCHEMA_VERSION,
    updatedAt: nowIso || '',
    profiles: [{
      profileId: normalizedProvider.toLowerCase() + '-legacy-default',
      provider: normalizedProvider,
      modelId: modelId,
      displayName: modelId,
      family: modelId,
      enabled: true,
      userVisible: true,
      isProviderDefault: true,
      apiAccess: config && config.credentialConfigured === false ? 'UNAVAILABLE' : 'AVAILABLE',
      qualification: 'QUALIFIED',
      fileSearch: true,
      thinkingProfiles: thinkingProfiles,
      defaultThinkingProfileId: thinkingProfiles[0].thinkingProfileId,
      maxOutputTokens: normalizedProvider === KSP_AI_PROVIDERS.GEMINI ? KSP_AI_DEFAULTS.QUERY_MAX_OUTPUT_TOKENS : null,
      createdAt: nowIso || '', updatedAt: nowIso || '', qualifiedAt: nowIso || '', safeNote: 'Legacy compatibility profile.'
    }]
  });
}

function kspAiModelPolicyFromSettings_(settings, provider, config, nowIso) {
  var source = settings || {};
  if (source.modelPolicyJson) return kspNormalizeAiModelPolicy_(source.modelPolicyJson);
  return kspBuildLegacyProviderModelPolicy_(provider, config, nowIso);
}

function kspAiModelPolicyRejectRawInjection_(input) {
  var source = input && typeof input === 'object' ? input : {};
  ['model', 'modelId', 'thinking', 'thinkingLevel', 'reasoning', 'reasoningEffort', 'maxOutputTokens']
    .forEach(function (key) {
      kspAiModelPolicyAssert_(source[key] === undefined || source[key] === null || source[key] === '',
        'AI_MODEL_POLICY_RAW_VALUE_REJECTED');
    });
}

function kspResolveAiModelSelection_(settings, provider, rawInput, config, nowIso) {
  kspAiModelPolicyRejectRawInjection_(rawInput);
  var normalizedProvider = kspNormalizeAiProvider_(provider);
  kspAiModelPolicyAssert_(normalizedProvider, 'AI_MODEL_PROFILE_PROVIDER_INVALID');
  var policy = kspAiModelPolicyFromSettings_(settings, normalizedProvider, config, nowIso);
  var requestedProfileId = kspAiTrim_(rawInput && rawInput.modelProfileId).toLowerCase();
  var requestedProfile = requestedProfileId
    ? policy.profiles.filter(function (item) { return item.profileId === requestedProfileId; })[0] : null;
  kspAiModelPolicyAssert_(!requestedProfile || requestedProfile.provider === normalizedProvider,
    'AI_MODEL_PROFILE_PROVIDER_MISMATCH');
  var candidates = policy.profiles.filter(function (profile) { return profile.provider === normalizedProvider; });
  var profile = requestedProfileId
    ? requestedProfile
    : candidates.filter(function (item) { return item.isProviderDefault; })[0];
  kspAiModelPolicyAssert_(profile, requestedProfileId ? 'AI_MODEL_SELECTION_STALE' : 'AI_MODEL_DEFAULT_REQUIRED');
  kspAiModelPolicyAssert_(profile.enabled && profile.userVisible, 'AI_MODEL_PROFILE_DISABLED');
  kspAiModelPolicyAssert_(profile.apiAccess === KSP_AI_MODEL_ACCESS_STATES.AVAILABLE,
    'AI_MODEL_PROFILE_INACCESSIBLE');
  kspAiModelPolicyAssert_(profile.qualification === KSP_AI_MODEL_QUALIFICATION_STATES.QUALIFIED && profile.fileSearch,
    'AI_MODEL_PROFILE_UNQUALIFIED');
  if (normalizedProvider === KSP_AI_PROVIDERS.GEMINI) {
    kspAiModelPolicyAssert_(profile.qualifiedStoreName &&
      profile.qualifiedStoreName === kspAiTrim_(config && config.storeName) &&
      profile.qualifiedRequestProfileVersion === KSP_AI_DEFAULTS.QUERY_REQUEST_PROFILE_VERSION,
    'AI_MODEL_PROFILE_UNQUALIFIED');
  }
  var requestedThinkingId = kspAiTrim_(rawInput && rawInput.thinkingProfileId).toLowerCase();
  var thinkingId = requestedThinkingId || profile.defaultThinkingProfileId;
  var thinking = profile.thinkingProfiles.filter(function (item) {
    return item.thinkingProfileId === thinkingId;
  })[0];
  kspAiModelPolicyAssert_(thinking, requestedThinkingId ? 'AI_THINKING_SELECTION_STALE' : 'AI_THINKING_DEFAULT_INVALID');
  kspAiModelPolicyAssert_(thinking.enabled, 'AI_THINKING_PROFILE_DISABLED');
  kspAiModelPolicyAssert_(thinking.qualification === KSP_AI_MODEL_QUALIFICATION_STATES.QUALIFIED,
    'AI_THINKING_PROFILE_UNQUALIFIED');
  return {
    profileId: profile.profileId,
    provider: profile.provider,
    modelId: profile.modelId,
    displayName: profile.displayName,
    thinkingProfileId: thinking.thinkingProfileId,
    thinkingRawValue: thinking.providerDefault ? null : thinking.rawValue,
    thinkingProviderDefault: thinking.providerDefault,
    maxOutputTokens: profile.maxOutputTokens
  };
}

function kspApplyAiModelSelectionToConfig_(config, selection) {
  var output = kspDeepClone_(config || {});
  output.modelId = selection.modelId;
  output.modelProfileId = selection.profileId;
  output.thinkingProfileId = selection.thinkingProfileId;
  output.thinkingRawValue = selection.thinkingRawValue;
  output.thinkingProviderDefault = selection.thinkingProviderDefault;
  output.maxOutputTokens = selection.maxOutputTokens;
  return output;
}

function kspGetEffectiveAiModelChoices_(settings, provider, config, nowIso) {
  var normalizedProvider = kspNormalizeAiProvider_(provider);
  if (!normalizedProvider || !config || !config.enabled) return { provider: normalizedProvider || '', profiles: [] };
  var policy = kspAiModelPolicyFromSettings_(settings, normalizedProvider, config, nowIso);
  return {
    provider: normalizedProvider,
    profiles: policy.profiles.filter(function (profile) {
      var defaultThinking = profile.thinkingProfiles.filter(function (thinking) {
        return thinking.thinkingProfileId === profile.defaultThinkingProfileId;
      })[0];
      var currentGeminiIdentity = normalizedProvider !== KSP_AI_PROVIDERS.GEMINI ||
        (profile.qualifiedStoreName && profile.qualifiedStoreName === kspAiTrim_(config.storeName) &&
          profile.qualifiedRequestProfileVersion === KSP_AI_DEFAULTS.QUERY_REQUEST_PROFILE_VERSION);
      return profile.provider === normalizedProvider && profile.enabled && profile.userVisible && defaultThinking &&
        defaultThinking.enabled && defaultThinking.qualification === KSP_AI_MODEL_QUALIFICATION_STATES.QUALIFIED &&
        profile.apiAccess === KSP_AI_MODEL_ACCESS_STATES.AVAILABLE &&
        profile.qualification === KSP_AI_MODEL_QUALIFICATION_STATES.QUALIFIED && profile.fileSearch && currentGeminiIdentity;
    }).map(function (profile) {
      return {
        profileId: profile.profileId,
        modelId: profile.modelId,
        displayName: profile.displayName,
        family: profile.family,
        isDefault: profile.isProviderDefault,
        defaultThinkingProfileId: profile.defaultThinkingProfileId,
        thinkingProfiles: profile.thinkingProfiles.filter(function (thinking) {
          return thinking.enabled && thinking.qualification === KSP_AI_MODEL_QUALIFICATION_STATES.QUALIFIED;
        }).map(function (thinking) {
          return { thinkingProfileId: thinking.thinkingProfileId, label: thinking.label, isDefault: thinking.thinkingProfileId === profile.defaultThinkingProfileId };
        })
      };
    })
  };
}

function kspAiModelPolicyForAdmin_(policy) {
  return {
    schemaVersion: policy.schemaVersion,
    updatedAt: policy.updatedAt,
    profiles: policy.profiles.map(function (profile) {
      var safe = kspDeepClone_(profile);
      delete safe.qualifiedStoreName;
      delete safe.qualifiedRequestProfileVersion;
      return safe;
    })
  };
}

function kspPersistAiModelPolicy_(environment, context, policy) {
  var normalized = kspNormalizeAiModelPolicy_(policy);
  kspAiModelPolicyAssert_(environment && typeof environment.writeAiSetting === 'function',
    'AI_MODEL_POLICY_WRITE_UNAVAILABLE');
  environment.writeAiSetting(KSP_AI_SETTINGS.MODEL_POLICY_JSON, JSON.stringify(normalized), environment.nowIso());
  if (context && context.settings) context.settings[KSP_AI_SETTINGS.MODEL_POLICY_JSON] = JSON.stringify(normalized);
  return normalized;
}

function kspAiModelQualificationSignature_(profile) {
  var value = profile || {};
  return JSON.stringify({
    provider: value.provider,
    modelId: value.modelId,
    thinkingProfiles: (value.thinkingProfiles || []).map(function (thinking) {
      return {
        thinkingProfileId: thinking.thinkingProfileId,
        rawValue: thinking.providerDefault ? null : thinking.rawValue,
        providerDefault: Boolean(thinking.providerDefault),
        enabled: thinking.enabled !== false
      };
    }),
    defaultThinkingProfileId: value.defaultThinkingProfileId,
    maxOutputTokens: value.maxOutputTokens
  });
}

function kspUpsertAiModelProfile_(policy, rawProfile, nowIso) {
  var current = kspNormalizeAiModelPolicy_(policy);
  var input = rawProfile || {};
  var profileId = kspAiModelPolicySafeId_(input.profileId, 'AI_MODEL_PROFILE_ID_INVALID');
  var existing = current.profiles.filter(function (item) { return item.profileId === profileId; })[0] || null;
  var nextRaw = kspDeepClone_(input);
  nextRaw.profileId = profileId;
  nextRaw.apiAccess = existing ? existing.apiAccess : KSP_AI_MODEL_ACCESS_STATES.UNKNOWN;
  nextRaw.qualification = existing ? existing.qualification : KSP_AI_MODEL_QUALIFICATION_STATES.UNQUALIFIED;
  nextRaw.qualifiedAt = existing ? existing.qualifiedAt : '';
  nextRaw.qualifiedStoreName = existing ? existing.qualifiedStoreName : '';
  nextRaw.qualifiedRequestProfileVersion = existing ? existing.qualifiedRequestProfileVersion : '';
  nextRaw.createdAt = existing ? existing.createdAt : nowIso;
  nextRaw.updatedAt = nowIso;
  if (existing && input.fileSearch === undefined) nextRaw.fileSearch = existing.fileSearch;
  if (!existing) nextRaw.fileSearch = false;
  var normalizedProfile = kspAiModelPolicyProfile_(nextRaw);
  var contractChanged = !existing || kspAiModelQualificationSignature_(existing) !==
    kspAiModelQualificationSignature_(normalizedProfile);
  if (existing && !contractChanged) {
    normalizedProfile.thinkingProfiles.forEach(function (thinking) {
      var prior = existing.thinkingProfiles.filter(function (item) {
        return item.thinkingProfileId === thinking.thinkingProfileId;
      })[0];
      if (!prior) return;
      thinking.qualification = prior.qualification;
      thinking.qualifiedAt = prior.qualifiedAt;
    });
  }
  if (contractChanged) {
    normalizedProfile.apiAccess = KSP_AI_MODEL_ACCESS_STATES.UNKNOWN;
    normalizedProfile.qualification = KSP_AI_MODEL_QUALIFICATION_STATES.UNQUALIFIED;
    normalizedProfile.fileSearch = false;
    normalizedProfile.qualifiedAt = '';
    normalizedProfile.qualifiedStoreName = '';
    normalizedProfile.qualifiedRequestProfileVersion = '';
    normalizedProfile.thinkingProfiles.forEach(function (thinking) {
      thinking.qualification = KSP_AI_MODEL_QUALIFICATION_STATES.UNQUALIFIED;
      thinking.qualifiedAt = '';
    });
  }
  var profiles = current.profiles.filter(function (item) { return item.profileId !== profileId; });
  if (normalizedProfile.isProviderDefault) {
    profiles.forEach(function (item) {
      if (item.provider === normalizedProfile.provider) item.isProviderDefault = false;
    });
  }
  profiles.push(normalizedProfile);
  return kspNormalizeAiModelPolicy_({
    schemaVersion: current.schemaVersion,
    updatedAt: nowIso,
    profiles: profiles
  });
}

function kspMarkAiModelProfileQualification_(policy, profileId, result, nowIso) {
  var current = kspNormalizeAiModelPolicy_(policy);
  var normalizedId = kspAiModelPolicySafeId_(profileId, 'AI_MODEL_PROFILE_ID_INVALID');
  var found = false;
  current.profiles.forEach(function (profile) {
    if (profile.profileId !== normalizedId) return;
    found = true;
    var thinkingResults = result && Array.isArray(result.thinkingResults) ? result.thinkingResults : null;
    profile.thinkingProfiles.forEach(function (thinking) {
      var tupleResult = thinkingResults ? thinkingResults.filter(function (item) {
        return item.thinkingProfileId === thinking.thinkingProfileId;
      })[0] : thinking.enabled ? result : null;
      if (!tupleResult) return;
      thinking.qualification = tupleResult.passed
        ? KSP_AI_MODEL_QUALIFICATION_STATES.QUALIFIED : KSP_AI_MODEL_QUALIFICATION_STATES.FAILED;
      thinking.qualifiedAt = tupleResult.passed ? nowIso : '';
    });
    var defaultThinking = profile.thinkingProfiles.filter(function (thinking) {
      return thinking.thinkingProfileId === profile.defaultThinkingProfileId;
    })[0];
    var defaultQualified = Boolean(defaultThinking && defaultThinking.enabled &&
      defaultThinking.qualification === KSP_AI_MODEL_QUALIFICATION_STATES.QUALIFIED);
    profile.apiAccess = result && result.accessible === false
      ? KSP_AI_MODEL_ACCESS_STATES.UNAVAILABLE : result && (result.accessible === true || result.passed)
        ? KSP_AI_MODEL_ACCESS_STATES.AVAILABLE : KSP_AI_MODEL_ACCESS_STATES.UNKNOWN;
    profile.qualification = defaultQualified
      ? KSP_AI_MODEL_QUALIFICATION_STATES.QUALIFIED : KSP_AI_MODEL_QUALIFICATION_STATES.FAILED;
    profile.fileSearch = defaultQualified;
    profile.qualifiedAt = defaultQualified ? nowIso : '';
    profile.qualifiedStoreName = defaultQualified && profile.provider === KSP_AI_PROVIDERS.GEMINI
      ? kspAiTrim_(result && result.storeName) : '';
    profile.qualifiedRequestProfileVersion = defaultQualified && profile.provider === KSP_AI_PROVIDERS.GEMINI
      ? kspAiTrim_(result && result.requestProfileVersion) : '';
    profile.updatedAt = nowIso;
  });
  kspAiModelPolicyAssert_(found, 'AI_MODEL_SELECTION_STALE');
  current.updatedAt = nowIso;
  return kspNormalizeAiModelPolicy_(current);
}
