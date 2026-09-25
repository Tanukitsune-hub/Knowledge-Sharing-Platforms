// ===== BEGIN src/134_AiModelPolicyContracts.gs =====
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
      (modelId === 'gemini-3.8-flash' || modelId === 'gemini-3.7-flash' ||
        modelId === 'gemini-3.6-flash')) {
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
// ===== END src/134_AiModelPolicyContracts.gs =====

// ===== BEGIN src/140_AiSourceModels.gs =====
function kspIsParentBoundPitchbookEligible_(row, meetingRows) {
  if (!row || String(row.Status || '') !== KSP_STATUS.ACTIVE) return false;
  if (!kspAiTrim_(row.Parent_Meeting_ID)) return true;
  var documentId = kspAiTrim_(row.Document_ID);
  return Boolean(documentId && (meetingRows || []).some(function (meeting) {
    return meeting && kspAiTrim_(meeting.Meeting_ID) && String(meeting.Status || '') === KSP_STATUS.ACTIVE &&
      kspMaintenanceSplitCodes_(meeting.Related_Pitchbook_IDs).indexOf(documentId) !== -1;
  }));
}

function kspPitchbookAiContext_(row, maps) {
  var bound = Boolean(kspAiTrim_(row.Parent_Meeting_ID));
  var id = kspMeetingCounterpartyId_(row);
  var type = String((maps && maps.counterpartyTypes || {})[id] || kspAiTrim_(row.Counterparty_Type));
  var valid = /^(?:CP-\d{6}|GP-.+)$/.test(id) && (!type || KSP_COUNTERPARTY_TYPE_DEFINITIONS.some(function (item) {
    return item.code === type;
  }));
  return {
    valid: valid, parentMeetingId: kspAiTrim_(row.Parent_Meeting_ID),
    counterpartyType: type, counterpartyId: id, entityKey: valid ? 'COUNTERPARTY:' + id : '',
    relatedGpIds: ''
  };
}

function kspApplyPitchbookAiContext_(source, row, maps) {
  var context = kspPitchbookAiContext_(row, maps);
  kspAssert_(!context.parentMeetingId || context.valid, 'AI_PARENT_SOURCE_CONTEXT_INVALID', '資料の面談先contextが不正です。');
  source.parentMeetingId = context.parentMeetingId;
  source.entityKey = context.entityKey;
  source.counterpartyType = context.counterpartyType;
  source.counterpartyId = context.counterpartyId;
  source.counterpartyName = (maps.counterparties || {})[context.counterpartyId] || context.counterpartyId;
  source.relatedGpIds = context.relatedGpIds;
  if (context.parentMeetingId) {
    source.gpId = context.counterpartyType === 'GP' ? context.counterpartyId : '';
    source.gpName = source.gpId ? (maps.gps[source.gpId] || source.gpId) : '';
  }
  return source;
}

function kspParentBoundSourceHash_(environment, source) {
  if (!source.parentMeetingId) return source;
  // The immutable reservation context participates in derived identity, not the filename.
  source.contentHash = environment.hashText(JSON.stringify([
    source.contentHash, source.parentMeetingId, source.entityKey, source.relatedGpIds,
    source.dateKey, source.assetClassId, source.capitalTypeId, source.fundStrategy
  ]));
  return source;
}

function kspBuildAiMasterMaps_(counterpartyRows, optionRows) {
  var maps = { gps: {}, assetClasses: {}, capitalTypes: {}, teams: {}, counterparties: {}, counterpartyTypes: {} };
  (counterpartyRows || []).forEach(function (row) {
    var id = row && String(row.Counterparty_ID || row.GP_ID || '');
    if (id) {
      var name = String(row.Counterparty_Name || row.GP_Name || id);
      var type = String(row.Counterparty_Type || (row.GP_ID ? 'GP' : ''));
      maps.counterparties[id] = name;
      maps.counterparties['COUNTERPARTY:' + id] = name;
      maps.counterpartyTypes[id] = type;
      if (type === 'GP') maps.gps[id] = name;
    }
  });
  (optionRows || []).forEach(function (row) {
    if (!row || !row.Option_ID) return;
    var target = null;
    if (String(row.Type) === 'ASSET_CLASS') target = maps.assetClasses;
    if (String(row.Type) === 'CAPITAL_TYPE') target = maps.capitalTypes;
    if (String(row.Type) === 'TEAM') target = maps.teams;
    if (target) target[String(row.Option_ID)] = String(row.Name || row.Option_ID);
  });
  return maps;
}

function kspAiSourceKey_(sourceType, sourceId) {
  return String(sourceType) + ':' + String(sourceId);
}

function kspBuildMeetingAiSource_(row, maps, text, contentHash) {
  kspAssert_(row && row.Meeting_ID, 'AI_MEETING_ROW_INVALID', 'Meeting row is invalid.');
  kspAssert_(row.Doc_File_ID, 'AI_MEETING_DOC_MISSING', 'Meeting Google Doc is missing.');
  var counterpartyType = String((maps.counterpartyTypes || {})[kspMeetingCounterpartyId_(row)] || kspMeetingCounterpartyType_(row));
  var counterpartyId = kspMeetingCounterpartyId_(row);
  return {
    sourceType: KSP_AI_SOURCE_TYPES.MEETING,
    sourceId: String(row.Meeting_ID),
    dateKey: kspCanonicalBusinessDate_(row.Date),
    gpId: String(row.GP_ID || ''),
    gpName: maps.gps[String(row.GP_ID || '')] || String(row.GP_ID || ''),
    entityKey: 'COUNTERPARTY:' + counterpartyId,
    counterpartyType: counterpartyType,
    counterpartyId: counterpartyId,
    counterpartyName: (maps.counterparties || {})[counterpartyId] || counterpartyId,
    relatedGpIds: '',
    assetClassId: String(row.Asset_Class_ID || ''),
    assetClassName: maps.assetClasses[String(row.Asset_Class_ID || '')] || String(row.Asset_Class_ID || ''),
    capitalTypeId: String(row.Capital_Type_ID || ''),
    capitalTypeName: maps.capitalTypes[String(row.Capital_Type_ID || '')] || String(row.Capital_Type_ID || ''),
    teamId: String(row.Team_ID || ''),
    teamName: (maps.teams || {})[String(row.Team_ID || '')] || String(row.Team_ID || ''),
    fundStrategy: String(row.Fund_Strategy || ''),
    meetingTypeCodes: String(row.Meeting_Type_Codes || ''),
    relatedPitchbookIds: String(row.Related_Pitchbook_IDs || ''),
    followUpRequired: kspToBoolean_(row.Follow_Up_Required, false),
    driveUrl: String(row.Doc_URL || ''),
    savedFilename: String(row.Saved_Filename || row.Meeting_ID),
    displayName: String(row.Saved_Filename || row.Meeting_ID) + '.txt',
    mimeType: 'text/plain',
    text: String(text || ''),
    contentHash: String(contentHash || '')
  };
}

function kspGetPitchbookExtensionForAi_(row) {
  var name = String((row && (row.Saved_Filename || row.Original_Filename)) || '');
  var match = /\.([^.]+)$/.exec(name);
  return match ? match[1].toLowerCase() : '';
}

function kspBuildPitchbookAiSource_(row, maps, text, contentHash) {
  kspAssert_(row && row.Document_ID, 'AI_PITCHBOOK_ROW_INVALID', 'Pitchbook row is invalid.');
  kspAssert_(row.File_ID, 'AI_PITCHBOOK_FILE_MISSING', 'Pitchbook source file is missing.');
  var extension = kspGetPitchbookExtensionForAi_(row);
  kspAssert_(extension === 'txt', 'AI_FORMAT_DEFERRED_TO_WORK_0009',
    'Work 0008 indexes Meeting text and TXT sources only.');
  return kspApplyPitchbookAiContext_({
    sourceType: KSP_AI_SOURCE_TYPES.PITCHBOOK,
    sourceId: String(row.Document_ID),
    dateKey: kspCanonicalBusinessDate_(row.Date),
    gpId: String(row.GP_ID || ''),
    gpName: maps.gps[String(row.GP_ID || '')] || String(row.GP_ID || ''),
    entityKey: 'COUNTERPARTY:' + kspMeetingCounterpartyId_(row),
    counterpartyType: String((maps.counterpartyTypes || {})[kspMeetingCounterpartyId_(row)] || ''),
    counterpartyId: kspMeetingCounterpartyId_(row),
    counterpartyName: (maps.counterparties || {})[kspMeetingCounterpartyId_(row)] || kspMeetingCounterpartyId_(row),
    relatedGpIds: '',
    assetClassId: String(row.Asset_Class_ID || ''),
    assetClassName: maps.assetClasses[String(row.Asset_Class_ID || '')] || String(row.Asset_Class_ID || ''),
    capitalTypeId: String(row.Capital_Type_ID || ''),
    capitalTypeName: maps.capitalTypes[String(row.Capital_Type_ID || '')] || String(row.Capital_Type_ID || ''),
    fundStrategy: String(row.Fund_Strategy || ''),
    driveUrl: String(row.File_URL || ''),
    savedFilename: String(row.Saved_Filename || row.Original_Filename || row.Document_ID),
    displayName: String(row.Saved_Filename || row.Original_Filename || row.Document_ID),
    mimeType: 'text/plain',
    text: String(text || ''),
    contentHash: String(contentHash || '')
  }, row, maps);
}

function kspAiWorkItemFromRow_(sourceType, row) {
  return {
    sourceType: sourceType,
    sourceId: sourceType === KSP_AI_SOURCE_TYPES.MEETING ? String(row.Meeting_ID || '') : String(row.Document_ID || ''),
    row: row
  };
}

function kspIsAiWorkEligible_(item, nowIso, settings) {
  var row = item.row || {};
  var sourceStatus = String(row.Status || '');
  var aiStatus = String(row.AI_Index_Status || KSP_AI_INDEX_STATUS.NOT_INDEXED);
  if (sourceStatus === KSP_STATUS.INACTIVE) {
    return Boolean(row.AI_Document_Name) || aiStatus === KSP_AI_INDEX_STATUS.INDEXED || aiStatus === KSP_AI_INDEX_STATUS.FAILED;
  }
  if (sourceStatus !== KSP_STATUS.ACTIVE) return false;
  if (aiStatus === KSP_AI_INDEX_STATUS.PENDING) return true;
  if (aiStatus === KSP_AI_INDEX_STATUS.INDEXED && !row.AI_Document_Name) return true;
  if (aiStatus !== KSP_AI_INDEX_STATUS.FAILED) return false;
  var lastError = kspParseAiLastError_(row.AI_Last_Error);
  if (lastError.permanent || !lastError.retryable || lastError.attempt >= settings.maxRetryAttempts) return false;
  return !lastError.nextAttemptAt ||
    kspTemporalInstantComparisonKey_(lastError.nextAttemptAt) <= kspTemporalInstantComparisonKey_(nowIso);
}

function kspSelectAiWorkItems_(meetingRows, pitchbookRows, nowIso, settings) {
  var items = [];
  (meetingRows || []).forEach(function (row) {
    var item = kspAiWorkItemFromRow_(KSP_AI_SOURCE_TYPES.MEETING, row);
    if (kspIsAiWorkEligible_(item, nowIso, settings)) items.push(item);
  });
  (pitchbookRows || []).forEach(function (row) {
    var item = kspAiWorkItemFromRow_(KSP_AI_SOURCE_TYPES.PITCHBOOK, row);
    item.retrievalEligible = kspIsParentBoundPitchbookEligible_(row, meetingRows);
    if (!item.retrievalEligible && String(row.Status) === KSP_STATUS.ACTIVE) {
      if (row.AI_Document_Name || row.AI_Content_Hash) items.push(item);
      return;
    }
    if (kspIsAiWorkEligible_(item, nowIso, settings)) items.push(item);
  });
  items.sort(function (left, right) {
    var leftInactive = String(left.row.Status) === KSP_STATUS.INACTIVE ? 0 : 1;
    var rightInactive = String(right.row.Status) === KSP_STATUS.INACTIVE ? 0 : 1;
    if (leftInactive !== rightInactive) return leftInactive - rightInactive;
    var leftTime = kspTemporalInstantComparisonKey_(left.row.Updated_At || left.row.Created_At);
    var rightTime = kspTemporalInstantComparisonKey_(right.row.Updated_At || right.row.Created_At);
    if (leftTime !== rightTime) return leftTime.localeCompare(rightTime);
    return kspAiSourceKey_(left.sourceType, left.sourceId).localeCompare(kspAiSourceKey_(right.sourceType, right.sourceId));
  });
  return items.slice(0, settings.syncBatchSize);
}

function kspBuildAiSource_(environment, item, maps) {
  var row = item.row;
  var text;
  if (item.sourceType === KSP_AI_SOURCE_TYPES.MEETING) {
    text = environment.readMeetingText(String(row.Doc_File_ID || ''));
    return kspBuildMeetingAiSource_(row, maps, text, environment.hashText(text));
  }
  var extension = kspGetPitchbookExtensionForAi_(row);
  if (extension !== 'txt') {
    var unsupported = new Error('Work 0008 indexes Meeting text and TXT sources only.');
    unsupported.code = 'AI_FORMAT_DEFERRED_TO_WORK_0009';
    unsupported.retryable = false;
    unsupported.permanent = true;
    throw unsupported;
  }
  text = environment.readTextFile(String(row.File_ID || ''));
  return kspParentBoundSourceHash_(environment,
    kspBuildPitchbookAiSource_(row, maps, text, environment.hashText(text)));
}
// ===== END src/140_AiSourceModels.gs =====

// ===== BEGIN src/141_AiSyncHelpers.gs =====
function kspBuildAiSyncReport_(nowIso, settings) {
  return {
    workId: KSP_AI_WORK_ID,
    startedAt: nowIso,
    finishedAt: null,
    ok: true,
    syncEnabled: settings.syncEnabled,
    selected: 0,
    indexed: 0,
    reused: 0,
    unchanged: 0,
    removed: 0,
    deferred: 0,
    failed: 0,
    skippedClaims: 0,
    items: [],
    errors: []
  };
}

function kspAiDocumentMatchesSource_(documentValue, sourceId, contentHash) {
  var metadata = documentValue && documentValue.customMetadata ? documentValue.customMetadata : {};
  return String(metadata.source_id || '') === String(sourceId) &&
    String(metadata.content_hash || '') === String(contentHash);
}

function kspDeleteAiDocuments_(environment, storeName, sourceId, storedDocumentName, documents) {
  var names = {};
  if (storedDocumentName) names[String(storedDocumentName)] = true;
  (documents || []).forEach(function (documentValue) {
    if (documentValue && documentValue.name) names[String(documentValue.name)] = true;
  });
  Object.keys(names).forEach(function (name) {
    environment.deleteFileSearchDocument(storeName, name);
  });
}

function kspApplyAiIndexedPatch_(environment, item, documentValue, contentHash, nowIso) {
  environment.updateAiRow(item.sourceType, item.sourceId, {
    AI_Document_Name: String(documentValue.name || ''),
    AI_Index_Status: KSP_AI_INDEX_STATUS.INDEXED,
    AI_Indexed_At: nowIso,
    AI_Content_Hash: contentHash,
    AI_Last_Error: ''
  });
}

function kspProcessInactiveAiItem_(environment, storeName, item, report) {
  var row = item.row || {};
  var documents = environment.findFileSearchDocumentsBySource(storeName, item.sourceId);
  kspDeleteAiDocuments_(environment, storeName, item.sourceId, row.AI_Document_Name, documents);
  environment.updateAiRow(item.sourceType, item.sourceId, {
    AI_Document_Name: '',
    AI_Index_Status: KSP_AI_INDEX_STATUS.NOT_INDEXED,
    AI_Indexed_At: '',
    AI_Content_Hash: '',
    AI_Last_Error: ''
  });
  report.removed += 1;
  report.items.push({ sourceType: item.sourceType, sourceId: item.sourceId, action: 'removed' });
}

function kspProcessActiveAiItem_(environment, storeName, item, maps, report, nowIso) {
  var row = item.row || {};
  if (item.sourceType === KSP_AI_SOURCE_TYPES.PITCHBOOK && kspGetPitchbookExtensionForAi_(row) !== 'txt') {
    var deferredDocuments = environment.findFileSearchDocumentsBySource(storeName, item.sourceId);
    kspDeleteAiDocuments_(environment, storeName, item.sourceId, row.AI_Document_Name, deferredDocuments);
    environment.updateAiRow(item.sourceType, item.sourceId, {
      AI_Document_Name: '',
      AI_Index_Status: KSP_AI_INDEX_STATUS.NOT_INDEXED,
      AI_Indexed_At: '',
      AI_Content_Hash: '',
      AI_Last_Error: kspBuildAiLastError_({
        attempt: 1,
        retryable: false,
        permanent: true,
        code: 'AI_FORMAT_DEFERRED_TO_WORK_0009',
        message: 'Work 0008 indexes Meeting text and TXT sources only.'
      })
    });
    report.deferred += 1;
    report.items.push({ sourceType: item.sourceType, sourceId: item.sourceId, action: 'deferred', code: 'AI_FORMAT_DEFERRED_TO_WORK_0009' });
    return;
  }
  var source = kspBuildAiSource_(environment, item, maps);
  if (String(row.AI_Content_Hash || '') === source.contentHash && row.AI_Document_Name) {
    report.unchanged += 1;
    report.items.push({ sourceType: item.sourceType, sourceId: item.sourceId, action: 'unchanged' });
    return;
  }

  var documents = environment.findFileSearchDocumentsBySource(storeName, item.sourceId);
  var matching = documents.filter(function (documentValue) {
    return kspAiDocumentMatchesSource_(documentValue, item.sourceId, source.contentHash);
  });
  if (matching.length > 0) {
    var selected = matching[0];
    var extras = documents.filter(function (documentValue) { return documentValue.name !== selected.name; });
    kspDeleteAiDocuments_(environment, storeName, item.sourceId, '', extras);
    kspApplyAiIndexedPatch_(environment, item, selected, source.contentHash, nowIso);
    report.reused += 1;
    report.items.push({ sourceType: item.sourceType, sourceId: item.sourceId, action: 'reconciled', documentName: selected.name });
    return;
  }

  kspDeleteAiDocuments_(environment, storeName, item.sourceId, row.AI_Document_Name, documents);
  var uploaded = environment.uploadSourceToFileSearchStore(storeName, source);
  kspAssert_(uploaded && uploaded.name, 'AI_UPLOAD_DOCUMENT_MISSING', 'File Search upload did not return a Document.');
  kspApplyAiIndexedPatch_(environment, item, uploaded, source.contentHash, nowIso);
  report.indexed += 1;
  report.items.push({ sourceType: item.sourceType, sourceId: item.sourceId, action: 'indexed', documentName: uploaded.name });
}

function kspRecordAiFailure_(environment, item, error, settings, nowIso, report) {
  var previous = kspParseAiLastError_(item.row && item.row.AI_Last_Error);
  var attempt = previous.attempt + 1;
  var retryable = kspIsAiErrorRetryable_(error) && !error.permanent && attempt < settings.maxRetryAttempts;
  var permanent = Boolean(error.permanent) || !retryable;
  var nextAttemptAt = retryable ? kspCalculateAiRetryAt_(nowIso, attempt, settings) : '';
  var code = kspGetErrorCode_(error, 'AI_SYNC_FAILED');
  var patch = {
    AI_Document_Name: '',
    AI_Index_Status: KSP_AI_INDEX_STATUS.FAILED,
    AI_Indexed_At: '',
    AI_Content_Hash: '',
    AI_Last_Error: kspBuildAiLastError_({
      attempt: attempt,
      retryable: retryable,
      permanent: permanent,
      nextAttemptAt: nextAttemptAt,
      code: code,
      message: error && error.message ? error.message : String(error)
    })
  };
  report.failed += 1;
  environment.updateAiRow(item.sourceType, item.sourceId, patch);
  report.items.push({
    sourceType: item.sourceType,
    sourceId: item.sourceId,
    action: 'failed',
    code: code,
    retryable: retryable,
    nextAttemptAt: nextAttemptAt
  });
}
// ===== END src/141_AiSyncHelpers.gs =====

// ===== BEGIN src/142_AiSyncWorker.gs =====
function kspRunAiSync_(environment) {
  var startedAt = environment.nowIso();
  var context = environment.loadAiContext();
  environment.ensureAiSettings(kspGetAiSettingSeedRows_(startedAt));
  context = environment.loadAiContext();
  var settings = kspNormalizeAiSettings_(context.settings);
  var report = kspBuildAiSyncReport_(startedAt, settings);
  if (!settings.syncEnabled) {
    report.finishedAt = environment.nowIso();
    return report;
  }

  var store = environment.ensureFileSearchStore(settings, KSP_AI_DEFAULTS.STORE_DISPLAY_NAME);
  var storeName = store.name;
  var items = kspSelectAiWorkItems_(context.meetingRows, context.pitchbookRows, startedAt, settings);
  report.selected = items.length;
  var maps = kspBuildAiMasterMaps_(kspContextCounterpartyRows_(context), context.optionRows);

  items.forEach(function (item) {
    var claim = environment.claimAiSource(item.sourceType, item.sourceId, startedAt, KSP_AI_DEFAULTS.CLAIM_TTL_MILLIS);
    if (!claim) {
      report.skippedClaims += 1;
      report.items.push({ sourceType: item.sourceType, sourceId: item.sourceId, action: 'claimed-elsewhere' });
      return;
    }
    try {
      if (String(item.row.Status) === KSP_STATUS.INACTIVE || item.retrievalEligible === false) {
        kspProcessInactiveAiItem_(environment, storeName, item, report);
      } else {
        kspProcessActiveAiItem_(environment, storeName, item, maps, report, environment.nowIso());
      }
    } catch (error) {
      try {
        kspRecordAiFailure_(environment, item, error, settings, environment.nowIso(), report);
      } catch (recordError) {
        report.ok = false;
        report.errors.push({
          sourceType: item.sourceType,
          sourceId: item.sourceId,
          code: kspGetErrorCode_(recordError),
          message: recordError.message || String(recordError)
        });
      }
    } finally {
      environment.releaseAiSourceClaim(item.sourceType, item.sourceId, claim.token);
    }
  });

  report.finishedAt = environment.nowIso();
  report.ok = report.errors.length === 0;
  return report;
}
// ===== END src/142_AiSyncWorker.gs =====

// ===== BEGIN src/150_KnowledgeSearchModels.gs =====
function kspBuildKnowledgeSearchCatalog_(counterpartyRows, optionRows, meetingRows, pitchbookRows) {
  var counterparties = (counterpartyRows || []).map(function (row) {
    return { id: String(row.Counterparty_ID || row.GP_ID || ''), name: String(row.Counterparty_Name || row.GP_Name || ''),
      type: String(row.Counterparty_Type || (row.GP_ID ? 'GP' : '')), status: String(row.Status || '') };
  }).filter(function (item) { return item.id && item.name && item.type; }).sort(function (left, right) {
    return left.name.localeCompare(right.name, 'ja');
  });
  var options = (optionRows || []).map(function (row) {
    return {
      id: String(row.Option_ID || ''), type: String(row.Type || ''), name: String(row.Name || ''),
      status: String(row.Status || ''), sortOrder: Number(row.Sort_Order) || 0
    };
  }).filter(function (item) { return item.id && item.type && item.name; });
  function byType(type) {
    return options.filter(function (item) { return item.type === type; }).sort(function (left, right) {
      return left.sortOrder - right.sortOrder || left.name.localeCompare(right.name, 'ja');
    }).map(function (item) {
      return { id: item.id, name: item.name, status: item.status, sortOrder: item.sortOrder };
    });
  }
  var counterpartyEntities = counterparties.map(function (counterparty) {
    return { id: 'COUNTERPARTY:' + counterparty.id, entityKey: 'COUNTERPARTY:' + counterparty.id,
      counterpartyId: counterparty.id, type: counterparty.type, name: counterparty.name,
      status: counterparty.status };
  });
  var fundStrategies = {};
  (meetingRows || []).concat(pitchbookRows || []).forEach(function (row) {
    var value = kspAiTrim_(row && row.Fund_Strategy);
    if (value) fundStrategies[value] = true;
  });
  return {
    counterparties: counterparties,
    gps: counterparties.filter(function (item) { return item.type === 'GP'; }),
    assetClasses: byType(KSP_OPTION_TYPES.ASSET_CLASS),
    capitalTypes: byType(KSP_OPTION_TYPES.CAPITAL_TYPE),
    teams: byType(KSP_OPTION_TYPES.TEAM),
    counterpartyTypes: KSP_COUNTERPARTY_TYPE_DEFINITIONS.map(function (definition) {
      return { id: definition.code, code: definition.code, name: definition.label, label: definition.label };
    }),
    counterpartyEntities: counterpartyEntities,
    meetingTypes: KSP_MEETING_TYPE_DEFINITIONS.map(function (definition) {
      return { id: definition.code, code: definition.code, name: definition.label, label: definition.label };
    }),
    fundStrategies: Object.keys(fundStrategies).sort().map(function (value) { return { id: value, name: value }; }),
    followUpOptions: [
      { id: KSP_KNOWLEDGE_FOLLOW_UP_FILTERS.REQUIRED, name: '必要' },
      { id: KSP_KNOWLEDGE_FOLLOW_UP_FILTERS.NOT_REQUIRED, name: '不要' }
    ],
    sourceTypes: [
      { id: KSP_AI_SOURCE_TYPES.MEETING, name: 'Meeting' },
      { id: KSP_AI_SOURCE_TYPES.PITCHBOOK, name: 'Pitchbook' }
    ]
  };
}

function kspValidateKnowledgeFilterIds_(input, catalog) {
  var filters = kspKnowledgeRequestFilters_(input);
  var safeCatalog = catalog || { gps: [], assetClasses: [], capitalTypes: [], teams: [], counterpartyTypes: [], counterpartyEntities: [], fundStrategies: [] };
  if (filters.gpId) {
    kspRequireCatalogItem_(safeCatalog.gps, filters.gpId, 'AI_GP_FILTER_UNAVAILABLE', '選択されたGPは利用できません。');
  }
  if (filters.assetClassId) {
    kspRequireCatalogItem_(
      safeCatalog.assetClasses,
      filters.assetClassId,
      'AI_ASSET_CLASS_FILTER_UNAVAILABLE',
      '選択されたアセットクラスは利用できません。'
    );
  }
  if (filters.capitalTypeId) {
    kspRequireCatalogItem_(
      safeCatalog.capitalTypes,
      filters.capitalTypeId,
      'AI_CAPITAL_TYPE_FILTER_UNAVAILABLE',
      '選択されたEquity / Debtは利用できません。'
    );
  }
  if (filters.teamId) {
    kspRequireCatalogItem_(safeCatalog.teams, filters.teamId,
      'AI_TEAM_FILTER_UNAVAILABLE', '選択されたチームは利用できません。');
  }
  if (filters.counterpartyType) {
    kspRequireCatalogItem_(safeCatalog.counterpartyTypes, filters.counterpartyType,
      'AI_COUNTERPARTY_TYPE_FILTER_UNAVAILABLE', '選択されたCounterparty Typeは利用できません。');
  }
  if (filters.entityKey) {
    var selectedEntity = kspRequireCatalogItem_(safeCatalog.counterpartyEntities, filters.entityKey,
      'AI_ENTITY_FILTER_UNAVAILABLE', '選択されたCounterparty Entityは利用できません。');
    if (filters.counterpartyType) {
      kspAssert_(selectedEntity.type === filters.counterpartyType,
        'AI_ENTITY_TYPE_CONFLICT', 'Counterparty TypeとEntityが一致しません。');
    }
    if (filters.gpId) {
      kspAssert_(selectedEntity.type === 'GP' && selectedEntity.counterpartyId === filters.gpId,
        'AI_ENTITY_GP_CONFLICT', 'Counterparty EntityとGPが一致しません。');
    }
  }
  if (filters.fundStrategy) {
    kspRequireCatalogItem_(safeCatalog.fundStrategies, filters.fundStrategy,
      'AI_FUND_STRATEGY_FILTER_UNAVAILABLE', '選択されたFund / Strategyは利用できません。');
  }
  if (filters.relatedGpId) {
    kspRequireCatalogItem_(safeCatalog.relatedGps || safeCatalog.gps, filters.relatedGpId,
      'AI_RELATED_GP_FILTER_UNAVAILABLE', '旧形式の検索条件は利用できません。');
  }
  if (filters.meetingTypeCode) {
    kspRequireCatalogItem_(safeCatalog.meetingTypes || [], filters.meetingTypeCode,
      'AI_MEETING_TYPE_FILTER_UNAVAILABLE', '選択されたMTG種別は利用できません。');
  }
  (input && input.selectedEntityKeys || []).forEach(function (entityKey) {
    kspRequireCatalogItem_(safeCatalog.counterpartyEntities, entityKey,
      'AI_ENTITY_FILTER_UNAVAILABLE', '選択されたCounterparty Entityは利用できません。');
  });
  return input;
}

function kspBuildAuthoritativeSourceMaps_(meetingRows, pitchbookRows) {
  var maps = { bySourceId: {}, bySourceKey: {}, byAiDocumentName: {}, byProviderDocumentId: {} };

  function addMapping(map, key, source) {
    var normalizedKey = kspAiTrim_(key);
    if (!normalizedKey) return;
    if (!Object.prototype.hasOwnProperty.call(map, normalizedKey)) {
      map[normalizedKey] = source;
      return;
    }
    if (map[normalizedKey] === null) return;
    if (!kspKnowledgeSourceIdentityEquivalent_(map[normalizedKey], source)) map[normalizedKey] = null;
  }

  function add(source) {
    if (!source.sourceId) return;
    var sourceKey = kspAiSourceKey_(source.sourceType, source.sourceId);
    addMapping(maps.bySourceKey, sourceKey, source);
    addMapping(maps.bySourceId, source.sourceId, source);
    addMapping(maps.byAiDocumentName, source.aiDocumentName, source);
    (source.providerDocumentIds || []).forEach(function (providerDocumentId) {
      addMapping(maps.byProviderDocumentId, providerDocumentId, source);
    });
  }

  (meetingRows || []).forEach(function (row) {
    var counterpartyType = kspMeetingCounterpartyType_(row);
    var counterpartyId = kspMeetingCounterpartyId_(row);
    add({
      sourceType: KSP_AI_SOURCE_TYPES.MEETING,
      sourceId: String(row.Meeting_ID || ''),
      fileId: String(row.Doc_File_ID || ''),
      date: kspCanonicalBusinessDate_(row.Date),
      driveUrl: String(row.Doc_URL || ''),
      savedFilename: String(row.Saved_Filename || row.Meeting_ID || ''),
      entityKey: kspCounterpartyEntityKey_(counterpartyId),
      counterpartyType: counterpartyType,
      status: String(row.Status || ''),
      aiDocumentName: String(row.AI_Document_Name || ''),
      providerContentHashes: kspKnowledgeSourceProviderContentHashes_(row),
      contentHash: kspKnowledgeSourceContentHash_(row),
      providerDocumentIds: kspKnowledgeSourceProviderDocumentIds_(row),
      geminiProviderIdentity: kspKnowledgeSourceGeminiProviderIdentity_(row)
    });
  });

  (pitchbookRows || []).forEach(function (row) {
    var context = kspPitchbookAiContext_(row);
    add({
      sourceType: KSP_AI_SOURCE_TYPES.PITCHBOOK,
      sourceId: String(row.Document_ID || ''),
      fileId: String(row.File_ID || ''),
      date: kspCanonicalBusinessDate_(row.Date),
      driveUrl: String(row.File_URL || ''),
      savedFilename: String(row.Saved_Filename || row.Original_Filename || row.Document_ID || ''),
      entityKey: context.entityKey,
      counterpartyType: context.counterpartyType,
      counterpartyId: context.counterpartyId,
      relatedGpIds: context.relatedGpIds,
      parentMeetingId: context.parentMeetingId,
      retrievalEligible: kspIsParentBoundPitchbookEligible_(row, meetingRows) && (!context.parentMeetingId || context.valid),
      status: String(row.Status || ''),
      aiDocumentName: String(row.AI_Document_Name || ''),
      providerContentHashes: kspKnowledgeSourceProviderContentHashes_(row),
      contentHash: kspKnowledgeSourceContentHash_(row),
      providerDocumentIds: kspKnowledgeSourceProviderDocumentIds_(row),
      geminiProviderIdentity: kspKnowledgeSourceGeminiProviderIdentity_(row)
    });
  });

  return maps;
}

function kspKnowledgeSourceIdentityEquivalent_(left, right) {
  return left && right && left.sourceType === right.sourceType &&
    left.sourceId === right.sourceId && left.contentHash === right.contentHash &&
    left.entityKey === right.entityKey && left.status === right.status &&
    left.retrievalEligible === right.retrievalEligible;
}

function kspParentBoundCitationContextMatches_(source, metadata) {
  if (!source.parentMeetingId) return true;
  return kspAiTrim_(metadata.entity_key) === source.entityKey &&
    kspAiTrim_(metadata.counterparty_type) === source.counterpartyType &&
    kspAiTrim_(metadata.counterparty_id) === source.counterpartyId;
}

function kspKnowledgeSourceProviderContentHashes_(row) {
  var hashes = { OPENAI: '', GEMINI: '' };
  if (row && row.AI_Provider_State_JSON && typeof kspParseAiProviderState_ === 'function') {
    try {
      var state = kspParseAiProviderState_(row.AI_Provider_State_JSON, row);
      hashes.OPENAI = kspAiTrim_(state.OPENAI && state.OPENAI.contentHash);
      hashes.GEMINI = kspAiTrim_(state.GEMINI && state.GEMINI.contentHash);
    } catch (ignored) { /* Keep malformed derived state fail-closed for strict OpenAI citations. */ }
  }
  if (!hashes.GEMINI && row && row.AI_Content_Hash) hashes.GEMINI = String(row.AI_Content_Hash);
  return hashes;
}

function kspKnowledgeSourceContentHash_(row) {
  var hashes = kspKnowledgeSourceProviderContentHashes_(row);
  return hashes.OPENAI || hashes.GEMINI || '';
}

function kspKnowledgeSourceGeminiProviderIdentity_(row) {
  var output = {
    valid: true,
    status: '',
    storeName: '',
    contentHash: '',
    documentNames: []
  };
  try {
    var state = kspParseAiProviderState_(row && row.AI_Provider_State_JSON, row);
    var entry = state && state.GEMINI ? state.GEMINI : {};
    output.status = kspAiTrim_(entry.status);
    output.storeName = kspAiTrim_(entry.storeName);
    output.contentHash = kspAiTrim_(entry.contentHash);
    output.documentNames = kspUniqueStrings_([
      kspAiTrim_(entry.documentName),
      kspAiTrim_(entry.providerDocumentId),
      kspAiTrim_(row && row.AI_Document_Name)
    ].filter(function (value) { return Boolean(value); }));
  } catch (ignored) {
    output.valid = false;
  }
  return output;
}

function kspKnowledgeSourceProviderDocumentIds_(row) {
  var ids = [];
  if (row && row.AI_Document_Name) ids.push(String(row.AI_Document_Name));
  if (row && row.AI_Provider_State_JSON && typeof kspParseAiProviderState_ === 'function') {
    try {
      var state = kspParseAiProviderState_(row.AI_Provider_State_JSON, row);
      [KSP_AI_PROVIDERS.OPENAI, KSP_AI_PROVIDERS.GEMINI].forEach(function (provider) {
        if (state[provider] && state[provider].providerDocumentId) ids.push(String(state[provider].providerDocumentId));
        if (state[provider] && state[provider].documentName) ids.push(String(state[provider].documentName));
      });
    } catch (ignored) { /* Keep source identity authoritative if derived state is malformed. */ }
  }
  return kspUniqueStrings_(ids);
}

function kspGeminiCitationSourceCategory_(value) {
  var source = kspAiTrim_(value);
  if (!source) return 'EMPTY';
  return /^fileSearchStores\/[^/]+\/documents\/[^/]+$/.test(source)
    ? 'DOCUMENT_RESOURCE' : 'CONTENT_TEXT';
}

function kspGeminiCitationDocumentMatches_(documentValue, storeName, sourceType, sourceId, contentHash) {
  var documentName = kspAiTrim_(documentValue && documentValue.name);
  var rawMetadata = documentValue && documentValue.rawCustomMetadata !== undefined
    ? documentValue.rawCustomMetadata
    : documentValue && (documentValue.customMetadata || documentValue.custom_metadata || {});
  var metadataIdentity = kspNormalizeCitationMetadataIdentity_(rawMetadata);
  var metadata = metadataIdentity.metadata;
  var state = kspAiTrim_(documentValue && documentValue.state).toUpperCase();
  return Boolean(metadataIdentity.valid && metadataIdentity.complete && documentName &&
    documentName.indexOf(storeName + '/documents/') === 0 &&
    (state === 'ACTIVE' || state === 'STATE_ACTIVE') &&
    kspAiTrim_(metadata.source_type) === sourceType &&
    kspAiTrim_(metadata.source_id) === sourceId &&
    kspAiTrim_(metadata.content_hash) === contentHash);
}

function kspResolveGeminiKnowledgeCitations_(rawCitations, sourceMaps, options) {
  var maps = sourceMaps || { bySourceKey: {} };
  var settings = options || {};
  var environment = settings.environment || {};
  var config = settings.config || {};
  var storeName = kspAiTrim_(settings.storeName || config.storeName);
  var warnings = [];
  var candidates = [];
  var blockedSourceKeys = {};
  var resolutionCache = {};
  var evidence = {
    rawCitationCount: 0,
    resolvedCitationCount: 0,
    returnedSourceCategory: 'EMPTY',
    documentUriStoreMatched: false,
    metadataSourceTypeMatched: false,
    metadataSourceIdMatched: false,
    metadataContentHashMatched: false,
    authoritativeSourceActiveMatched: false,
    currentGeminiHashMatched: false,
    providerDocumentUniqueMatched: false,
    providerDocumentReadbackMatched: false,
    storedDocumentReferenceMatched: false
  };

  function reject(sourceKey, code, message) {
    warnings.push({ code: code, message: message });
    if (sourceKey) blockedSourceKeys[sourceKey] = true;
  }

  (rawCitations || []).forEach(function (citation) {
    evidence.rawCitationCount += 1;
    var sourceCategory = kspGeminiCitationSourceCategory_(citation && citation.source);
    if (evidence.returnedSourceCategory === 'EMPTY' || evidence.returnedSourceCategory === sourceCategory) {
      evidence.returnedSourceCategory = sourceCategory;
    } else {
      evidence.returnedSourceCategory = 'MIXED';
    }
    if (!citation || citation.type !== 'file_citation') {
      reject('', 'GEMINI_CITATION_IDENTITY_INVALID', 'Gemini citation identity was invalid and was excluded.');
      return;
    }
    var metadataIdentity = kspNormalizeCitationMetadataIdentity_(
      citation.rawMetadata !== undefined ? citation.rawMetadata : citation.metadata
    );
    var metadata = metadataIdentity.metadata;
    var sourceType = kspAiTrim_(metadata.source_type);
    var sourceId = kspAiTrim_(metadata.source_id);
    var contentHash = kspAiTrim_(metadata.content_hash);
    var sourceKey = sourceType && sourceId ? kspAiSourceKey_(sourceType, sourceId) : '';
    if (!metadataIdentity.valid || !metadataIdentity.complete ||
        citation.metadataIdentityValid === false || citation.metadataIdentityComplete === false ||
        citation.metadataIdentityConflicting === true) {
      reject(sourceKey, metadataIdentity.conflicting || citation.metadataIdentityConflicting === true
        ? 'GEMINI_CITATION_METADATA_CONFLICT' : 'GEMINI_CITATION_IDENTITY_INVALID',
      'Gemini citation metadata was incomplete or conflicting and was excluded.');
      return;
    }
    var documentUri = kspAiTrim_(citation.documentUri || citation.document_uri);
    if (!storeName || documentUri !== storeName || !/^fileSearchStores\/[^/]+$/.test(storeName)) {
      reject(sourceKey, 'GEMINI_CITATION_STORE_MISMATCH', 'Gemini citation Store identity did not match the trusted Store.');
      return;
    }
    evidence.documentUriStoreMatched = true;
    var authoritative = maps.bySourceKey ? maps.bySourceKey[sourceKey] : null;
    if (!authoritative) {
      reject(sourceKey, 'GEMINI_CITATION_SOURCE_NOT_FOUND', 'Gemini citation could not be matched to one authoritative source.');
      return;
    }
    if (!kspParentBoundCitationContextMatches_(authoritative, metadata)) {
      reject(sourceKey, 'AI_CITATION_CONTEXT_CONFLICT', '資料の面談先contextが一致しない引用を除外しました。');
      return;
    }
    if (authoritative.status !== KSP_STATUS.ACTIVE || authoritative.retrievalEligible === false) {
      reject(sourceKey, 'GEMINI_CITATION_SOURCE_INACTIVE', 'An inactive Gemini citation source was excluded.');
      return;
    }
    evidence.metadataSourceTypeMatched = authoritative.sourceType === sourceType;
    evidence.metadataSourceIdMatched = authoritative.sourceId === sourceId;
    evidence.authoritativeSourceActiveMatched = true;
    var geminiIdentity = authoritative.geminiProviderIdentity || {};
    if (geminiIdentity.valid !== true || geminiIdentity.status !== KSP_AI_INDEX_STATUS.INDEXED ||
        !geminiIdentity.contentHash || geminiIdentity.contentHash !== contentHash) {
      reject(sourceKey, 'GEMINI_CITATION_IDENTITY_STALE', 'Gemini citation content identity was stale or unavailable.');
      return;
    }
    evidence.metadataContentHashMatched = true;
    evidence.currentGeminiHashMatched = true;
    if (geminiIdentity.storeName && geminiIdentity.storeName !== storeName) {
      reject(sourceKey, 'GEMINI_CITATION_STORE_MISMATCH', 'Authoritative Gemini state belongs to another Store.');
      return;
    }

    var cacheKey = sourceKey + '|' + contentHash;
    if (!Object.prototype.hasOwnProperty.call(resolutionCache, cacheKey)) {
      var resolution = { ok: false, code: 'GEMINI_CITATION_DOCUMENT_READBACK_FAILED' };
      try {
        kspAssert_(typeof environment.findProviderDocumentsBySource === 'function' &&
          typeof environment.readProviderDocument === 'function',
        'AI_DOCUMENT_READBACK_FAILED', 'Gemini citation document readback is unavailable.');
        var documents = environment.findProviderDocumentsBySource(
          KSP_AI_PROVIDERS.GEMINI, config, sourceType, sourceId
        );
        if (!Array.isArray(documents) || documents.length !== 1) {
          resolution.code = documents && documents.length > 1
            ? 'GEMINI_CITATION_DOCUMENT_AMBIGUOUS' : 'GEMINI_CITATION_DOCUMENT_NOT_FOUND';
        } else if (!kspGeminiCitationDocumentMatches_(documents[0], storeName, sourceType, sourceId, contentHash)) {
          resolution.code = 'GEMINI_CITATION_DOCUMENT_CONFLICT';
        } else {
          var expectedSource = { sourceType: sourceType, sourceId: sourceId, contentHash: contentHash };
          var readback = environment.readProviderDocument(
            KSP_AI_PROVIDERS.GEMINI, config, documents[0], expectedSource
          );
          if (kspAiTrim_(readback && readback.name) !== kspAiTrim_(documents[0].name) ||
              !kspGeminiCitationDocumentMatches_(readback, storeName, sourceType, sourceId, contentHash)) {
            resolution.code = 'GEMINI_CITATION_DOCUMENT_CONFLICT';
          } else {
            var references = kspUniqueStrings_((geminiIdentity.documentNames || []).map(kspAiTrim_)
              .filter(function (value) { return Boolean(value); }));
            if (references.length && (references.length !== 1 || references[0] !== kspAiTrim_(readback.name))) {
              resolution.code = 'GEMINI_CITATION_DOCUMENT_CONFLICT';
            } else {
              resolution = { ok: true, document: readback };
            }
          }
        }
      } catch (ignoredReadbackError) {
        resolution.code = 'GEMINI_CITATION_DOCUMENT_READBACK_FAILED';
      }
      resolutionCache[cacheKey] = resolution;
    }
    var currentResolution = resolutionCache[cacheKey];
    if (!currentResolution.ok) {
      reject(sourceKey, currentResolution.code, 'Gemini citation document identity could not be verified.');
      return;
    }
    evidence.providerDocumentUniqueMatched = true;
    evidence.providerDocumentReadbackMatched = true;
    evidence.storedDocumentReferenceMatched = true;
    candidates.push({ citation: citation, authoritative: authoritative, sourceKey: sourceKey });
  });

  var seen = {};
  var citations = [];
  candidates.forEach(function (candidate) {
    if (blockedSourceKeys[candidate.sourceKey]) return;
    var authoritative = candidate.authoritative;
    if (!authoritative.driveUrl || !/^https:\/\//i.test(authoritative.driveUrl)) {
      reject(candidate.sourceKey, 'AI_CITATION_DRIVE_URL_INVALID', 'Citation source has no valid authoritative HTTPS Drive URL.');
      return;
    }
    var pageNumber = candidate.citation.pageNumber ? Number(candidate.citation.pageNumber) : null;
    var key = authoritative.sourceType + ':' + authoritative.sourceId + '|' + String(pageNumber || '');
    if (seen[key]) return;
    seen[key] = true;
    citations.push({
      sourceType: authoritative.sourceType,
      sourceId: authoritative.sourceId,
      date: authoritative.date,
      title: authoritative.savedFilename,
      entityKey: authoritative.entityKey || '',
      counterpartyType: authoritative.counterpartyType || '',
      driveUrl: authoritative.driveUrl,
      pageNumber: pageNumber
    });
  });
  evidence.resolvedCitationCount = citations.length;
  return { citations: citations, warnings: warnings, evidence: evidence };
}

function kspMapKnowledgeCitations_(rawCitations, sourceMaps) {
  var maps = sourceMaps || { bySourceId: {}, bySourceKey: {}, byAiDocumentName: {}, byProviderDocumentId: {} };
  var warnings = [];
  var seen = {};
  var citations = [];

  (rawCitations || []).forEach(function (citation) {
    var metadata = citation && citation.metadata ? kspMetadataArrayToMap_(citation.metadata) : {};
    var sourceId = kspAiTrim_(metadata.source_id);
    var sourceType = kspAiTrim_(metadata.source_type);
    var provenance = kspAiTrim_(citation && citation.provenance);
    var strictOpenAiCitation = provenance === 'INLINE_CITATION' || provenance === 'RETRIEVED_SOURCE';
    var authoritative = null;

    if (strictOpenAiCitation) {
      var providerDocumentId = kspAiTrim_(citation && (citation.fileId || citation.file_id || citation.source));
      var contentHash = kspAiTrim_(metadata.content_hash);
      if (!providerDocumentId || !sourceType || !sourceId || !contentHash) {
        warnings.push({
          code: 'OPENAI_CITATION_IDENTITY_INVALID',
          message: 'OpenAI citation identity was incomplete and was excluded.'
        });
        return;
      }
      authoritative = maps.bySourceKey ? maps.bySourceKey[kspAiSourceKey_(sourceType, sourceId)] : null;
      var providerAuthoritative = maps.byProviderDocumentId
        ? maps.byProviderDocumentId[providerDocumentId] : null;
      if (!authoritative || !providerAuthoritative) {
        warnings.push({
          code: 'OPENAI_CITATION_SOURCE_NOT_FOUND',
          message: 'OpenAI citation could not be matched to one authoritative source.'
        });
        return;
      }
      if (!kspKnowledgeSourceIdentityEquivalent_(authoritative, providerAuthoritative)) {
        warnings.push({
          code: 'OPENAI_CITATION_IDENTITY_CONFLICT',
          message: 'OpenAI citation identity conflicted with the authoritative source.'
        });
        return;
      }
      var openAiHash = authoritative.providerContentHashes
        ? kspAiTrim_(authoritative.providerContentHashes.OPENAI) : '';
      if (!openAiHash || openAiHash !== contentHash) {
        warnings.push({
          code: 'OPENAI_CITATION_IDENTITY_STALE',
          message: 'OpenAI citation content identity was stale or unavailable.'
        });
        return;
      }
    } else {
      authoritative = sourceId && sourceType && maps.bySourceKey
        ? maps.bySourceKey[kspAiSourceKey_(sourceType, sourceId)] : null;
      if (!authoritative && sourceId) authoritative = maps.bySourceId[sourceId] || null;
      if (!authoritative && citation && (citation.fileId || citation.file_id || citation.source)) {
        var legacyProviderDocumentId = String(citation.fileId || citation.file_id || citation.source);
        authoritative = maps.byProviderDocumentId ? maps.byProviderDocumentId[legacyProviderDocumentId] : null;
        if (!authoritative && maps.byAiDocumentName) authoritative = maps.byAiDocumentName[legacyProviderDocumentId] || null;
      }
      if (!authoritative && citation && citation.source) {
        authoritative = maps.byAiDocumentName[String(citation.source)] || null;
        if (authoritative) sourceId = authoritative.sourceId;
      }
    }

    if (!authoritative) {
      warnings.push({
        code: 'AI_CITATION_SOURCE_NOT_FOUND',
        message: 'Citation could not be matched to an authoritative source record.'
      });
      return;
    }
    if (!kspParentBoundCitationContextMatches_(authoritative, metadata)) {
      warnings.push({ code: 'AI_CITATION_CONTEXT_CONFLICT', message: '資料の面談先contextが一致しない引用を除外しました。' });
      return;
    }
    if (authoritative.status !== KSP_STATUS.ACTIVE || authoritative.retrievalEligible === false) {
      warnings.push({
        code: 'AI_CITATION_SOURCE_INACTIVE',
        message: 'An inactive source citation was excluded.',
        sourceId: authoritative.sourceId
      });
      return;
    }
    if (!authoritative.driveUrl || !/^https:\/\//i.test(authoritative.driveUrl)) {
      warnings.push({
        code: 'AI_CITATION_DRIVE_URL_INVALID',
        message: 'Citation source has no valid authoritative HTTPS Drive URL.',
        sourceId: authoritative.sourceId
      });
      return;
    }

    var pageNumber = citation && citation.pageNumber ? Number(citation.pageNumber) : null;
    var key = authoritative.sourceType + ':' + authoritative.sourceId + '|' + String(pageNumber || '');
    if (seen[key]) return;
    seen[key] = true;
    var normalizedCitation = {
      sourceType: authoritative.sourceType,
      sourceId: authoritative.sourceId,
      date: authoritative.date,
      title: authoritative.savedFilename || (citation ? citation.fileName : ''),
      entityKey: authoritative.entityKey || '',
      counterpartyType: authoritative.counterpartyType || '',
      driveUrl: authoritative.driveUrl,
      pageNumber: pageNumber
    };
    if (provenance) normalizedCitation.provenance = provenance;
    citations.push(normalizedCitation);
  });

  return { citations: citations, warnings: warnings };
}

function kspBuildKnowledgeSearchAuditRow_(params) {
  var options = params || {};
  var input = options.input || {};
  var sourceIds = (options.citations || []).map(function (citation) { return citation.sourceId; });
  var telemetry = typeof kspBuildSafeKnowledgeQueryTelemetry_ === 'function'
    ? kspBuildSafeKnowledgeQueryTelemetry_(
      options.telemetry && options.telemetry.state,
      options.telemetry && options.telemetry.providerStatus,
      options.telemetry && options.telemetry.response,
      options.telemetry || {}
    ) : {};
  telemetry.route = kspAiTrim_(options.provider || input.route);
  telemetry.mode = input.mode || KSP_KNOWLEDGE_SEARCH_MODES.FREE_QUESTION;
  telemetry.structured_filters = kspKnowledgeFilterAuditMetadata_(input);
  if ((input.selectedEntityKeys || []).length) telemetry.selected_entity_keys = input.selectedEntityKeys.slice();
  if ((options.entityEvidence || []).length) {
    telemetry.entity_evidence = options.entityEvidence.map(function (item) {
      return { entity_key: item.entityKey, status: item.evidenceStatus, cited_source_count: Number(item.citationCount || 0) };
    });
  }
  return {
    Event_Timestamp: kspCanonicalInstantIso_(options.timestamp),
    Actor: options.actor || 'UNIDENTIFIED',
    Action: 'AI_QUERY',
    Target_Type: 'KnowledgeSearch',
    Target_ID: options.interactionId || '',
    Result: options.result || KSP_AUDIT_RESULTS.FAILURE,
    Changed_Fields: '',
    Before_Metadata_JSON: '',
    After_Metadata_JSON: JSON.stringify(telemetry),
    Batch_ID: '',
    Error_Code: options.errorCode || '',
    Error_Message: options.errorCode ? kspSafePublicErrorMessage_(options.errorCode, 'SEARCH') : '',
    Search_Mode: input.mode || KSP_KNOWLEDGE_SEARCH_MODES.FREE_QUESTION,
    Question_Or_Instruction: '',
    Date_From: kspKnowledgeRequestFilters_(input).dateFrom,
    Date_To: kspKnowledgeRequestFilters_(input).dateTo,
    GP_Filter: kspKnowledgeRequestFilters_(input).gpId,
    Asset_Class_Filter: kspKnowledgeRequestFilters_(input).assetClassId,
    Capital_Type_Filter: kspKnowledgeRequestFilters_(input).capitalTypeId,
    Source_Type_Filter: kspKnowledgeRequestFilters_(input).sourceType,
    Model_ID: options.modelId || '',
    Cited_Source_IDs: kspUniqueStrings_(sourceIds).join(',')
  };
}
// ===== END src/150_KnowledgeSearchModels.gs =====

// ===== BEGIN src/151_KnowledgeSearchService.gs =====
function kspGetKnowledgeSearchBootstrap_(environment) {
  try {
    var context = environment.loadAiContext();
    var settings = kspNormalizeAiSettings_(context.settings);
    return {
      ok: true,
      workId: KSP_AI_WORK_ID,
      appVersion: KSP_AI_APP_VERSION,
      configured: Boolean(settings.storeName && settings.modelId),
      implementedModes: [KSP_AI_SEARCH_MODES.FREE_QUESTION],
      targetModes: ['自由質問', '要約', '時系列', '比較', '面談準備'],
      options: kspBuildKnowledgeSearchCatalog_(kspContextCounterpartyRows_(context), context.optionRows,
        context.meetingRows, context.pitchbookRows),
      syncIntervalMinutes: settings.syncIntervalMinutes
    };
  } catch (error) {
    return {
      ok: false,
      workId: KSP_AI_WORK_ID,
      error: { code: kspGetErrorCode_(error), message: kspSafePublicErrorMessage_(kspGetErrorCode_(error), 'SEARCH') }
    };
  }
}

function kspGetAiActorSafely_(environment, warnings) {
  try {
    return environment.getActor() || 'UNIDENTIFIED';
  } catch (error) {
    warnings.push({ code: 'ACTOR_RESOLUTION_FAILED', message: kspSafeOperationalWarning_('ACTOR_RESOLUTION_FAILED') });
    return 'UNIDENTIFIED';
  }
}

function kspTryAppendKnowledgeAudit_(environment, auditSpreadsheetId, row, warnings) {
  try {
    environment.appendAuditRow(auditSpreadsheetId, row);
  } catch (error) {
    warnings.push({ code: 'AUDIT_WRITE_FAILED', message: kspSafeOperationalWarning_('AUDIT_WRITE_FAILED') });
  }
}

function kspRunFreeQuestion_(environment, rawInput) {
  var warnings = [];
  var actor = kspGetAiActorSafely_(environment, warnings);
  var input = kspNormalizeKnowledgeSearchInput_(rawInput);
  var context = null;
  var settings = null;
  var auditSpreadsheetId = '';

  try {
    kspAssert_(kspClaimPublicOperation_(environment, 'KNOWLEDGE_SEARCH', actor, 'FREE_QUESTION', 2),
      'AI_RATE_LIMITED', '検索が集中しています。少し待って再試行してください。');
    input = kspValidateKnowledgeSearchInput_(input);
    context = environment.loadAiContext();
    settings = kspNormalizeAiSettings_(context.settings);
    auditSpreadsheetId = context.auditSpreadsheetId;
    kspAssert_(settings.storeName, 'AI_STORE_NOT_CONFIGURED', 'Gemini File Search Storeが設定されていません。');
    kspAssert_(settings.modelId, 'AI_MODEL_NOT_CONFIGURED', 'Gemini Flash model IDが設定されていません。');

    var catalog = kspBuildKnowledgeSearchCatalog_(kspContextCounterpartyRows_(context), context.optionRows,
      context.meetingRows, context.pitchbookRows);
    kspValidateKnowledgeFilterIds_(input, catalog);
    var metadataFilter = kspBuildMetadataFilter_(input);
    var request = kspBuildInteractionRequest_({
      storeName: settings.storeName,
      modelId: settings.modelId,
      question: input.question,
      metadataFilter: metadataFilter
    });
    var rawResponse = environment.queryFileSearch(request);
    var parsed = kspParseInteractionResponse_(rawResponse);
    var citationContext = environment.loadAiContext();
    var mapped = kspMapKnowledgeCitations_(
      parsed.citations,
      kspBuildAuthoritativeSourceMaps_(citationContext.meetingRows, citationContext.pitchbookRows)
    );
    warnings = warnings.concat(mapped.warnings);

    var answer = parsed.answer;
    var insufficientEvidence = !answer || mapped.citations.length === 0;
    if (!answer) answer = '確認できる根拠が不足しています。';
    if (insufficientEvidence) {
      warnings.push({
        code: 'AI_INSUFFICIENT_EVIDENCE',
        message: '回答または根拠となる資料が不足しています。'
      });
    }

    var successAudit = kspBuildKnowledgeSearchAuditRow_({
      timestamp: environment.nowIso(),
      actor: actor,
      input: input,
      modelId: settings.modelId,
      interactionId: parsed.interactionId,
      result: KSP_AUDIT_RESULTS.SUCCESS,
      citations: mapped.citations
    });
    kspTryAppendKnowledgeAudit_(environment, auditSpreadsheetId, successAudit, warnings);

    return {
      ok: true,
      workId: KSP_AI_WORK_ID,
      mode: KSP_AI_SEARCH_MODES.FREE_QUESTION,
      answer: answer,
      citations: mapped.citations,
      insufficientEvidence: insufficientEvidence,
      metadataFilter: metadataFilter,
      interactionId: parsed.interactionId,
      warnings: warnings
    };
  } catch (error) {
    if (context && auditSpreadsheetId) {
      var failureAudit = kspBuildKnowledgeSearchAuditRow_({
        timestamp: environment.nowIso(),
        actor: actor,
        input: input,
        modelId: settings ? settings.modelId : '',
        result: KSP_AUDIT_RESULTS.FAILURE,
        errorCode: kspGetErrorCode_(error),
        errorMessage: kspSafePublicErrorMessage_(kspGetErrorCode_(error), 'SEARCH'),
        citations: []
      });
      kspTryAppendKnowledgeAudit_(environment, auditSpreadsheetId, failureAudit, warnings);
    }
    return {
      ok: false,
      workId: KSP_AI_WORK_ID,
      error: { code: kspGetErrorCode_(error), message: kspSafePublicErrorMessage_(kspGetErrorCode_(error), 'SEARCH') },
      warnings: warnings
    };
  }
}
// ===== END src/151_KnowledgeSearchService.gs =====

// ===== BEGIN src/152_KnowledgeFilterContracts.gs =====
var KSP_KNOWLEDGE_SEARCH_MODES = Object.freeze({
  FREE_QUESTION: '自由質問',
  SUMMARY: '要約',
  TIMELINE: '時系列',
  COMPARISON: '比較',
  MEETING_PREP: '面談準備'
});

var KSP_KNOWLEDGE_MODE_ORDER = Object.freeze([
  KSP_KNOWLEDGE_SEARCH_MODES.FREE_QUESTION,
  KSP_KNOWLEDGE_SEARCH_MODES.SUMMARY,
  KSP_KNOWLEDGE_SEARCH_MODES.TIMELINE,
  KSP_KNOWLEDGE_SEARCH_MODES.COMPARISON,
  KSP_KNOWLEDGE_SEARCH_MODES.MEETING_PREP
]);

var KSP_KNOWLEDGE_FOLLOW_UP_FILTERS = Object.freeze({
  REQUIRED: 'REQUIRED',
  NOT_REQUIRED: 'NOT_REQUIRED'
});

var KSP_KNOWLEDGE_MULTI_ENTITY_MIN = 2;
var KSP_KNOWLEDGE_MULTI_ENTITY_MAX = 5;
var KSP_KNOWLEDGE_ADVANCED_SOURCE_ID_MAX = 40;

function kspGetKnowledgeModeDefinition_(mode) {
  var definitions = {};
  definitions[KSP_KNOWLEDGE_SEARCH_MODES.FREE_QUESTION] = {
    mode: KSP_KNOWLEDGE_SEARCH_MODES.FREE_QUESTION,
    inputLabel: '質問',
    placeholder: '例: 最近の資料では、APACインフラの投資機会についてどのような見解が示されていますか？',
    inputRequired: true,
    targetRequired: false,
    instruction: '質問への直接回答を先に示し、資料で確認できる根拠、反証または不確実性、証拠不足を整理してください。',
    apiInstructions: [
      '最初に質問への直接回答を示し、その後に根拠となる要点を簡潔に整理してください。',
      '確認できる反証、不確実性、証拠不足も区別してください。'
    ]
  };
  definitions[KSP_KNOWLEDGE_SEARCH_MODES.SUMMARY] = {
    mode: KSP_KNOWLEDGE_SEARCH_MODES.SUMMARY,
    inputLabel: '追加指示',
    placeholder: '任意: リスクと投資機会を中心に整理してください。',
    inputRequired: false,
    targetRequired: false,
    instruction: '複数資料を横断して統合し、主要テーマ、重要事実・見解、変化、矛盾、証拠不足を整理してください。',
    apiInstructions: [
      '複数資料を横断して統合し、資料ごとの要約を単純に並べないでください。',
      '主要テーマ、重要事実・見解、裏付けられた変化や矛盾、証拠不足の順で整理してください。'
    ]
  };
  definitions[KSP_KNOWLEDGE_SEARCH_MODES.TIMELINE] = {
    mode: KSP_KNOWLEDGE_SEARCH_MODES.TIMELINE,
    inputLabel: '追加指示',
    placeholder: '任意: 過去12か月の変化を中心に整理してください。',
    inputRequired: false,
    targetRequired: false,
    instruction: '日付順に整理し、変化、継続事項、比較不能な期間、証拠が途切れる期間を区別してください。',
    apiInstructions: [
      '日付または期間順に整理し、前期からの変化と継続している事項を区別してください。',
      '異なる資料が異なる話題を扱うだけの場合は変化と断定せず、証拠が途切れる期間を明示してください。'
    ]
  };
  definitions[KSP_KNOWLEDGE_SEARCH_MODES.COMPARISON] = {
    mode: KSP_KNOWLEDGE_SEARCH_MODES.COMPARISON,
    inputLabel: '追加指示',
    placeholder: '任意: 投資機会、リスク、見通しの共通軸で比較してください。',
    inputRequired: false,
    targetRequired: false,
    instruction: '選択した2–5件の面談先を共通の項目で比較し、それぞれの根拠と情報が足りない点を示してください。',
    apiInstructions: [
      '選択Entityごとに資料で確認できる事実を帰属させ、共通軸の簡潔な比較表を作成してください。',
      '裏付けられた共通点、相違点、時系列の変化、証拠の非対称性を区別してください。',
      '根拠のないEntityは証拠不足と明示し、資料にない評価軸、順位付け、優劣、投資推奨を作らないでください。'
    ]
  };
  definitions[KSP_KNOWLEDGE_SEARCH_MODES.MEETING_PREP] = {
    mode: KSP_KNOWLEDGE_SEARCH_MODES.MEETING_PREP,
    inputLabel: '追加指示',
    placeholder: '任意: 次回面談で確認したいテーマを入力してください。',
    inputRequired: false,
    targetRequired: true,
    instruction: '選択した面談先との面談に向け、主な更新、変化、未解決点、確認事項、質問候補、資料で確認できない点を整理してください。資料にない情報は補わず、投資判断を自動生成しないでください。',
    apiInstructions: [
      '選択された単一EntityまたはGPとの次回面談に向けた実務的なBriefを作成してください。',
      '最近の更新、過去からの変化、未解決論点、再確認事項、質問候補、証拠不足を整理してください。',
      '質問候補は取得資料で確認できる未解決点や変化に結び付け、投資判断や推奨を自動生成しないでください。'
    ]
  };
  var normalized = kspAiTrim_(mode) || KSP_KNOWLEDGE_SEARCH_MODES.FREE_QUESTION;
  kspAssert_(definitions[normalized], 'AI_SEARCH_MODE_INVALID', '検索モードが不正です。');
  return kspDeepClone_(definitions[normalized]);
}

function kspGetKnowledgeModeDefinitions_() {
  return KSP_KNOWLEDGE_MODE_ORDER.map(function (mode) {
    var definition = kspGetKnowledgeModeDefinition_(mode);
    delete definition.apiInstructions;
    return definition;
  });
}

function kspNormalizeKnowledgeFollowUpFilter_(value) {
  if (value === true || String(value).toUpperCase() === KSP_KNOWLEDGE_FOLLOW_UP_FILTERS.REQUIRED ||
      String(value).toLowerCase() === 'true') return KSP_KNOWLEDGE_FOLLOW_UP_FILTERS.REQUIRED;
  if (value === false || String(value).toUpperCase() === KSP_KNOWLEDGE_FOLLOW_UP_FILTERS.NOT_REQUIRED ||
      String(value).toLowerCase() === 'false') return KSP_KNOWLEDGE_FOLLOW_UP_FILTERS.NOT_REQUIRED;
  return '';
}

function kspNormalizeKnowledgeFilters_(value) {
  var source = value && typeof value === 'object' ? value : {};
  return {
    dateFrom: kspAiTrim_(source.dateFrom),
    dateTo: kspAiTrim_(source.dateTo),
    counterpartyType: kspAiTrim_(source.counterpartyType).toUpperCase(),
    entityKey: kspAiTrim_(source.entityKey || source.counterpartyEntityKey),
    gpId: kspAiTrim_(source.gpId),
    assetClassId: kspAiTrim_(source.assetClassId),
    capitalTypeId: kspAiTrim_(source.capitalTypeId),
    teamId: kspAiTrim_(source.teamId),
    fundStrategy: kspAiTrim_(source.fundStrategy),
    followUp: kspNormalizeKnowledgeFollowUpFilter_(source.followUp !== undefined ? source.followUp : source.followUpRequired),
    sourceType: kspAiTrim_(source.sourceType),
    sourceId: kspAiTrim_(source.sourceId),
    relatedGpId: kspAiTrim_(source.relatedGpId || source.relatedGp),
    meetingTypeCode: kspAiTrim_(source.meetingTypeCode || source.meetingType).toUpperCase()
  };
}

function kspKnowledgeRequestFilters_(request) {
  var source = request && typeof request === 'object' ? request : {};
  return kspNormalizeKnowledgeFilters_(source.filters && typeof source.filters === 'object' ? source.filters : source);
}

function kspKnowledgeRequestWithLegacyFilterAliases_(request) {
  var output = request || {};
  var filters = kspKnowledgeRequestFilters_(output);
  output.filters = filters;
  Object.keys(filters).forEach(function (key) { output[key] = filters[key]; });
  return output;
}

function kspNormalizeCanonicalKnowledgeRequest_(input) {
  var source = input && typeof input === 'object' ? input : {};
  var instruction = source.questionOrInstruction !== undefined ? source.questionOrInstruction :
    (source.question !== undefined ? source.question : source.instruction);
  var rawEntities = Array.isArray(source.selectedEntityKeys) ? source.selectedEntityKeys :
    (Array.isArray(source.selectedEntities) ? source.selectedEntities : []);
  var filters = kspKnowledgeRequestFilters_(source);
  var selectedEntityKeys = rawEntities.map(kspAiTrim_).filter(Boolean);
  if ((filters.relatedGpId || filters.meetingTypeCode) && !filters.sourceType) {
    filters.sourceType = KSP_AI_SOURCE_TYPES.MEETING;
  }
  return {
    route: kspAiTrim_(source.route || source.provider).toUpperCase(),
    mode: kspAiTrim_(source.mode) || KSP_KNOWLEDGE_SEARCH_MODES.FREE_QUESTION,
    questionOrInstruction: kspAiTrim_(instruction),
    filters: filters,
    selectedEntityKeys: selectedEntityKeys,
    resolvedSourceIds: Array.isArray(source.resolvedSourceIds)
      ? source.resolvedSourceIds.map(kspAiTrim_).filter(Boolean) : [],
    advancedFilterResolved: source.advancedFilterResolved === true,
    modelProfileId: kspAiTrim_(source.modelProfileId).toLowerCase(),
    thinkingProfileId: kspAiTrim_(source.thinkingProfileId).toLowerCase()
  };
}

function kspValidateCanonicalKnowledgeRequest_(request) {
  var input = kspNormalizeCanonicalKnowledgeRequest_(request || {});
  var filters = kspKnowledgeRequestFilters_(input);
  var definition = kspGetKnowledgeModeDefinition_(input.mode);
  if (definition.inputRequired) {
    kspAssert_(input.questionOrInstruction, 'AI_QUESTION_REQUIRED', '質問を入力してください。');
  }
  kspAssert_(input.questionOrInstruction.length <= KSP_AI_DEFAULTS.MAX_QUESTION_LENGTH,
    'AI_QUESTION_TOO_LONG', '質問または追加指示は5,000文字以内で入力してください。');
  if (filters.dateFrom) kspAssert_(kspIsValidDateKey_(filters.dateFrom), 'AI_DATE_FROM_INVALID', 'Date Fromが不正です。');
  if (filters.dateTo) kspAssert_(kspIsValidDateKey_(filters.dateTo), 'AI_DATE_TO_INVALID', 'Date Toが不正です。');
  if (filters.dateFrom && filters.dateTo) {
    kspAssert_(filters.dateFrom <= filters.dateTo, 'AI_DATE_RANGE_INVALID', 'Date FromはDate To以前にしてください。');
  }
  if (filters.sourceType) {
    kspAssert_(filters.sourceType === KSP_AI_SOURCE_TYPES.MEETING || filters.sourceType === KSP_AI_SOURCE_TYPES.PITCHBOOK,
      'AI_SOURCE_TYPE_INVALID', 'Source Typeが不正です。');
  }
  if (filters.entityKey) {
    kspAssert_(Boolean(kspCounterpartyIdFromEntityKey_(filters.entityKey)),
      'AI_ENTITY_FILTER_INVALID', 'Counterparty Entityが不正です。');
    if (filters.gpId) {
      kspAssert_(kspCounterpartyIdFromEntityKey_(filters.entityKey) === filters.gpId,
        'AI_ENTITY_GP_CONFLICT', 'Counterparty EntityとGPが一致しません。');
    }
  }
  var selectedEntityKeys = input.selectedEntityKeys || [];
  var selectedSeen = {};
  selectedEntityKeys.forEach(function (entityKey) {
    kspAssert_(Boolean(kspCounterpartyIdFromEntityKey_(entityKey)),
      'AI_ENTITY_FILTER_INVALID', '選択されたCounterparty Entityが不正です。');
    kspAssert_(!selectedSeen[entityKey], 'AI_MULTI_ENTITY_DUPLICATE', '同じEntityを複数回選択できません。');
    selectedSeen[entityKey] = true;
  });
  if (selectedEntityKeys.length >= KSP_KNOWLEDGE_MULTI_ENTITY_MIN) {
    kspAssert_(input.mode === KSP_KNOWLEDGE_SEARCH_MODES.COMPARISON,
      'AI_MULTI_ENTITY_MODE_REQUIRED', '2–5 Entity選択は比較モードでのみ利用できます。');
    kspAssert_(selectedEntityKeys.length <= KSP_KNOWLEDGE_MULTI_ENTITY_MAX,
      'AI_MULTI_ENTITY_COUNT_INVALID', '比較するEntityは2–5件で選択してください。');
    kspAssert_(!filters.entityKey, 'AI_MULTI_ENTITY_AMBIGUOUS_SCOPE',
      '複数Entity比較では単一Entityフィルターを同時に指定できません。');
  }
  if (input.mode === KSP_KNOWLEDGE_SEARCH_MODES.COMPARISON && selectedEntityKeys.length === 1) {
    kspAssert_(filters.entityKey === selectedEntityKeys[0],
      filters.entityKey ? 'AI_MULTI_ENTITY_AMBIGUOUS_SCOPE' : 'AI_MULTI_ENTITY_COUNT_INVALID',
      filters.entityKey ? '比較Entityと単一Entityフィルターが一致しません。' :
        '明示的なEntity比較では2–5件を選択してください。');
  }
  if (definition.targetRequired) {
    kspAssert_(filters.entityKey || filters.gpId, 'AI_MEETING_PREP_TARGET_REQUIRED',
      '面談準備ではCounterparty EntityまたはGPを選択してください。');
  }
  if ((filters.teamId || filters.followUp || filters.relatedGpId || filters.meetingTypeCode) &&
      filters.sourceType !== KSP_AI_SOURCE_TYPES.MEETING) {
    kspAssert_(false, 'AI_FILTER_SOURCE_TYPE_INCOMPATIBLE',
      'チーム、MTG種別はMeetingにのみ適用できます。Source TypeをMeetingにしてください。');
  }
  return input;
}

function kspKnowledgeFilterAuditMetadata_(request) {
  var filters = kspKnowledgeRequestFilters_(request);
  var output = {};
  Object.keys(filters).forEach(function (key) {
    if (filters[key] !== '' && filters[key] !== null && filters[key] !== undefined) output[key] = filters[key];
  });
  var selected = request && Array.isArray(request.selectedEntityKeys) ? request.selectedEntityKeys : [];
  if (selected.length) output.selectedEntityKeys = selected.slice();
  return output;
}

function kspKnowledgeScopeSummary_(request) {
  var input = request || {};
  var filters = kspKnowledgeRequestFilters_(input);
  var parts = [];
  if (filters.dateFrom || filters.dateTo) parts.push('期間 ' + (filters.dateFrom || '…') + '–' + (filters.dateTo || '…'));
  if (filters.counterpartyType) parts.push('面談先種別 指定あり');
  if (filters.entityKey) parts.push('面談先 指定あり');
  if ((input.selectedEntityKeys || []).length) parts.push('比較対象 ' + input.selectedEntityKeys.length + '件');
  if (filters.assetClassId) parts.push('アセットクラス 指定あり');
  if (filters.capitalTypeId) parts.push('Equity / Debt 指定あり');
  if (filters.teamId) parts.push('チーム 指定あり');
  if (filters.fundStrategy) parts.push('Fund / Strategy ' + filters.fundStrategy);
  if (filters.meetingTypeCode) parts.push('MTG種別 指定あり');
  parts.push('対象資料 ' + (filters.sourceType === 'Meeting' ? '面談記録' :
    filters.sourceType === 'Pitchbook' ? '保存資料' : '面談記録と保存資料'));
  return parts.join(' / ');
}

function kspBuildCanonicalKnowledgePrompt_(request) {
  var input = kspValidateCanonicalKnowledgeRequest_(request);
  var definition = kspGetKnowledgeModeDefinition_(input.mode);
  var lines = [
    '社内ナレッジベースから取得された資料だけを根拠として、日本語で回答してください。',
    '根拠が不足する箇所は推測で埋めず、確認できない点と証拠不足を明示してください。',
    '外部知識や一般論を、資料に記載された事実として扱わないでください。',
    '重要な事実・比較・変化には、取得資料に対応する出典情報を付けてください。',
    '',
    'モード: ' + definition.mode,
    '選択範囲: ' + kspKnowledgeScopeSummary_(input)
  ].concat(definition.apiInstructions || []);
  if ((input.selectedEntityKeys || []).length >= KSP_KNOWLEDGE_MULTI_ENTITY_MIN) {
    lines.push('比較対象Entity（この安定キー以外を根拠に含めない）:');
    input.selectedEntityKeys.forEach(function (entityKey) { lines.push('- ' + entityKey); });
    lines.push('各Entityの事実と出典を対応付け、証拠がないEntityは明示的に証拠不足と記載してください。');
  }
  if (input.mode === KSP_KNOWLEDGE_SEARCH_MODES.FREE_QUESTION) lines.push('質問:', input.questionOrInstruction);
  else if (input.questionOrInstruction) lines.push('追加指示:', input.questionOrInstruction);
  return lines.join('\n');
}

function kspKnowledgeExactTokens_(value) {
  return kspMaintenanceSplitCodes_(value).map(kspAiTrim_).filter(Boolean);
}

function kspResolveKnowledgeAdvancedSourceIds_(request, meetingRows) {
  var input = kspKnowledgeRequestWithLegacyFilterAliases_(kspNormalizeCanonicalKnowledgeRequest_(request));
  var filters = kspKnowledgeRequestFilters_(input);
  if (!filters.relatedGpId && !filters.meetingTypeCode) return input;
  input.filters.sourceType = KSP_AI_SOURCE_TYPES.MEETING;
  input.sourceType = KSP_AI_SOURCE_TYPES.MEETING;
  var sourceIds = (meetingRows || []).filter(function (row) {
    if (String(row.Status || '') !== KSP_STATUS.ACTIVE) return false;
    if (filters.relatedGpId && kspKnowledgeExactTokens_(kspMeetingRelatedGpIds_(row)).indexOf(filters.relatedGpId) === -1) return false;
    if (filters.meetingTypeCode && kspKnowledgeExactTokens_(row.Meeting_Type_Codes).indexOf(filters.meetingTypeCode) === -1) return false;
    return typeof kspKnowledgeExportRowMatches_ !== 'function' || kspKnowledgeExportRowMatches_(row, input);
  }).map(function (row) { return kspAiTrim_(row.Meeting_ID); }).filter(Boolean);
  sourceIds = kspUniqueStrings_(sourceIds);
  kspAssert_(sourceIds.length <= KSP_KNOWLEDGE_ADVANCED_SOURCE_ID_MAX,
    'AI_ADVANCED_FILTER_TOO_BROAD', '該当するMeetingが多すぎます。条件を絞ってください。');
  input.resolvedSourceIds = sourceIds;
  input.advancedFilterResolved = true;
  return kspKnowledgeRequestWithLegacyFilterAliases_(input);
}

function kspBuildKnowledgeEntityEvidence_(request, catalog, citations) {
  var selected = request && Array.isArray(request.selectedEntityKeys) ? request.selectedEntityKeys : [];
  var entities = catalog && catalog.counterpartyEntities || [];
  return selected.map(function (entityKey) {
    var catalogItem = entities.filter(function (item) { return item.entityKey === entityKey; })[0] || {};
    var entityCitations = (citations || []).filter(function (citation) { return citation.entityKey === entityKey; });
    return {
      entityKey: entityKey,
      counterpartyType: catalogItem.type || '',
      displayName: catalogItem.name || entityKey,
      evidenceStatus: entityCitations.length ? 'CITED' : 'NO_EVIDENCE',
      citationCount: entityCitations.length,
      citations: entityCitations
    };
  });
}

function kspGuardKnowledgeComparisonCitations_(request, catalog, citations) {
  var selected = request && Array.isArray(request.selectedEntityKeys) ? request.selectedEntityKeys : [];
  if (selected.length < KSP_KNOWLEDGE_MULTI_ENTITY_MIN) {
    return { citations: citations || [], warnings: [], entityEvidence: [] };
  }
  var allowed = {};
  selected.forEach(function (entityKey) { allowed[entityKey] = true; });
  var rejected = false;
  var kept = (citations || []).filter(function (citation) {
    if (allowed[citation.entityKey]) return true;
    rejected = true;
    return false;
  });
  var evidence = kspBuildKnowledgeEntityEvidence_(request, catalog, kept);
  var warnings = [];
  if (rejected) warnings.push({
    code: 'AI_UNSELECTED_ENTITY_CITATION',
    message: '選択外EntityのCitationを検出したため比較結果から除外しました。'
  });
  evidence.filter(function (item) { return item.evidenceStatus === 'NO_EVIDENCE'; }).forEach(function (item) {
    warnings.push({ code: 'AI_ENTITY_EVIDENCE_GAP', message: item.displayName + 'の根拠資料が確認できません。' });
  });
  return { citations: kept, warnings: warnings, entityEvidence: evidence, rejectedUnselected: rejected };
}
// ===== END src/152_KnowledgeFilterContracts.gs =====

// ===== BEGIN src/155_KnowledgeExportContracts.gs =====
var KSP_KNOWLEDGE_EXPORT_WORK_ID = '0011';
var KSP_KNOWLEDGE_EXPORT_APP_VERSION = '0.1.0';

var KSP_KNOWLEDGE_EXPORT_SOURCE_TYPES = Object.freeze({
  MEETING: 'Meeting',
  PITCHBOOK: 'Pitchbook'
});

var KSP_KNOWLEDGE_EXPORT_OUTPUT_TYPES = Object.freeze({
  GOOGLE_DOCS: 'GOOGLE_DOCS',
  PDF: 'PDF'
});

var KSP_KNOWLEDGE_EXPORT_ACTIONS = Object.freeze({
  PREVIEW: 'KNOWLEDGE_EXPORT_PREVIEW',
  GOOGLE_DOCS: 'KNOWLEDGE_EXPORT_GOOGLE_DOCS',
  PDF: 'KNOWLEDGE_EXPORT_PDF',
  PROMPT_COPY: 'KNOWLEDGE_EXPORT_PROMPT_COPY'
});

var KSP_KNOWLEDGE_EXPORT_LIMITS = Object.freeze({
  WARNING_MEETINGS: 30,
  WARNING_MEETING_CHARACTERS: 150000,
  HARD_STOP_MEETINGS: 50,
  HARD_STOP_MEETING_CHARACTERS: 250000,
  HARD_STOP_PITCHBOOKS: 200,
  MAX_PROMPT_LENGTH: 5000,
  MAX_PREVIEW_MILLIS: 20000,
  MAX_SOURCE_ID_REPORT: 40,
  THROTTLE_SECONDS: 2,
  IDEMPOTENCY_SECONDS: 300
});

var KSP_KNOWLEDGE_EXPORT_MODE_ORDER = KSP_KNOWLEDGE_MODE_ORDER;

function kspGetKnowledgeExportModeDefinition_(mode) {
  try {
    var definition = kspGetKnowledgeModeDefinition_(mode);
    definition.gpRequired = definition.targetRequired;
    return definition;
  } catch (error) {
    error.code = 'KNOWLEDGE_EXPORT_MODE_INVALID';
    throw error;
  }
}

function kspGetKnowledgeExportModeDefinitions_() {
  return kspGetKnowledgeModeDefinitions_().map(function (definition) {
    definition.gpRequired = definition.targetRequired;
    return definition;
  });
}

function kspNormalizeKnowledgeExportInput_(input) {
  var source = input && typeof input === 'object' ? input : {};
  var output = kspKnowledgeRequestWithLegacyFilterAliases_(kspNormalizeCanonicalKnowledgeRequest_(source));
  output.previewFingerprint = String(source.previewFingerprint || '').trim();
  output.outputType = String(source.outputType || '').trim();
  output.copyConfirmed = source.copyConfirmed === true;
  return output;
}

// Full Output intentionally ignores AI mode, prompt, profiles and comparison context.
// Build a new request; never mutate caller-owned UI/search state.
function kspNormalizeKnowledgeFullOutputInput_(input) {
  var source = input && typeof input === 'object' ? input : {};
  var filters = kspKnowledgeRequestFilters_(source);
  filters.sourceType = KSP_KNOWLEDGE_EXPORT_SOURCE_TYPES.MEETING;
  filters.sourceId = '';
  return kspNormalizeKnowledgeExportInput_({
    route: KSP_AI_ROUTES.FULL_EXPORT,
    mode: KSP_KNOWLEDGE_SEARCH_MODES.SUMMARY,
    questionOrInstruction: '',
    selectedEntityKeys: [],
    filters: filters,
    previewFingerprint: source.previewFingerprint,
    outputType: source.outputType
  });
}

function kspKnowledgeExportPublicFilters_(input) {
  return kspKnowledgeRequestFilters_(input);
}

function kspValidateKnowledgeExportFilters_(input, catalog) {
  var value = input || kspNormalizeKnowledgeExportInput_({});
  if (value.dateFrom) kspAssert_(kspIsValidDateKey_(value.dateFrom), 'KNOWLEDGE_EXPORT_DATE_FROM_INVALID', 'Date Fromが不正です。');
  if (value.dateTo) kspAssert_(kspIsValidDateKey_(value.dateTo), 'KNOWLEDGE_EXPORT_DATE_TO_INVALID', 'Date Toが不正です。');
  if (value.dateFrom && value.dateTo) {
    kspAssert_(value.dateFrom <= value.dateTo, 'KNOWLEDGE_EXPORT_DATE_RANGE_INVALID', 'Date FromはDate To以前にしてください。');
  }
  if (value.sourceType) {
    kspAssert_(value.sourceType === KSP_KNOWLEDGE_EXPORT_SOURCE_TYPES.MEETING ||
      value.sourceType === KSP_KNOWLEDGE_EXPORT_SOURCE_TYPES.PITCHBOOK,
      'KNOWLEDGE_EXPORT_SOURCE_TYPE_INVALID', 'Source Typeが不正です。');
  }
  var filters = kspKnowledgeRequestFilters_(value);
  if (filters.entityKey) {
    kspAssert_(Boolean(kspCounterpartyIdFromEntityKey_(filters.entityKey)),
      'AI_ENTITY_FILTER_INVALID', 'Counterparty Entityが不正です。');
    if (filters.gpId) kspAssert_(kspCounterpartyIdFromEntityKey_(filters.entityKey) === filters.gpId,
      'AI_ENTITY_GP_CONFLICT', 'Counterparty EntityとGPが一致しません。');
  }
  kspValidateKnowledgeFilterIds_({ filters: filters }, catalog || kspBuildKnowledgeSearchCatalog_([], []));
  return value;
}

function kspValidateKnowledgeExportPromptInput_(input, catalog) {
  var value = kspValidateKnowledgeExportFilters_(input, catalog);
  var definition = kspGetKnowledgeExportModeDefinition_(value.mode);
  kspValidateCanonicalKnowledgeRequest_(value);
  kspValidateKnowledgeFilterIds_(value, catalog || kspBuildKnowledgeSearchCatalog_([], []));
  kspAssert_(value.questionOrInstruction.length <= KSP_KNOWLEDGE_EXPORT_LIMITS.MAX_PROMPT_LENGTH,
    'KNOWLEDGE_EXPORT_PROMPT_TOO_LONG', '質問または追加指示は5,000文字以内で入力してください。');
  if (definition.inputRequired) {
    kspAssert_(value.questionOrInstruction, 'KNOWLEDGE_EXPORT_PROMPT_REQUIRED', '質問を入力してください。');
  }
  return value;
}

function kspValidateKnowledgeExportCopyInput_(input, catalog) {
  var value = kspValidateKnowledgeExportPromptInput_(input, catalog);
  kspAssert_(value.copyConfirmed, 'KNOWLEDGE_EXPORT_COPY_NOT_CONFIRMED',
    'コピー成功の確認がありません。');
  return value;
}

function kspValidateKnowledgeExportOutputType_(outputType) {
  var value = String(outputType || '').trim();
  kspAssert_(value === KSP_KNOWLEDGE_EXPORT_OUTPUT_TYPES.GOOGLE_DOCS ||
    value === KSP_KNOWLEDGE_EXPORT_OUTPUT_TYPES.PDF,
    'KNOWLEDGE_EXPORT_OUTPUT_TYPE_INVALID', '出力形式が不正です。');
  return value;
}

function kspKnowledgeExportDate_(value) {
  return kspCanonicalBusinessDate_(value);
}

function kspKnowledgeExportUpdatedAt_(value) {
  return kspCanonicalInstantIso_(value);
}

function kspIsKnowledgeExportDriveUrl_(value) {
  return Boolean(kspKnowledgeExportUrlFileId_(value));
}

function kspKnowledgeExportUrlFileId_(value) {
  var url = String(value || '').trim();
  var match = /^https:\/\/docs\.google\.com\/(?:document|presentation|spreadsheets)\/d\/([^/?#&]+)(?:[/?#]|$)/i.exec(url);
  if (match) return match[1];
  match = /^https:\/\/drive\.google\.com\/file\/d\/([^/?#&]+)(?:[/?#]|$)/i.exec(url);
  if (match) return match[1];
  match = /^https:\/\/drive\.google\.com\/(?:open|uc)\?[^#]*\bid=([^&#]+)/i.exec(url);
  return match ? match[1] : '';
}

function kspKnowledgeExportUrlMatchesId_(value, fileId) {
  return Boolean(fileId) && kspKnowledgeExportUrlFileId_(value) === String(fileId);
}

function kspBuildKnowledgeExportCanonicalUrl_(sourceType, fileId) {
  var id = String(fileId || '').trim();
  kspAssert_(id, 'KNOWLEDGE_EXPORT_FILE_ID_MISSING', '原資料のファイルIDがありません。');
  return sourceType === KSP_KNOWLEDGE_EXPORT_SOURCE_TYPES.MEETING
    ? 'https://docs.google.com/document/d/' + id + '/edit'
    : 'https://drive.google.com/open?id=' + id;
}

function kspKnowledgeExportSourceError_(code, sourceId, message) {
  var error = new Error(message || 'Knowledge Export source integrity failed.');
  error.code = code;
  error.sourceId = String(sourceId || '');
  return error;
}

function kspKnowledgeExportSafeMessage_(code, error) {
  var messages = {
    KNOWLEDGE_EXPORT_MODE_INVALID: '書き出しモードが不正です。',
    KNOWLEDGE_EXPORT_GP_REQUIRED: '面談準備ではGPを選択してください。',
    KNOWLEDGE_EXPORT_DATE_FROM_INVALID: 'Date Fromが不正です。',
    KNOWLEDGE_EXPORT_DATE_TO_INVALID: 'Date Toが不正です。',
    KNOWLEDGE_EXPORT_DATE_RANGE_INVALID: 'Date FromはDate To以前にしてください。',
    KNOWLEDGE_EXPORT_SOURCE_TYPE_INVALID: 'Source Typeが不正です。',
    AI_GP_FILTER_UNAVAILABLE: '選択されたGPは利用できません。',
    AI_ASSET_CLASS_FILTER_UNAVAILABLE: '選択されたアセットクラスは利用できません。',
    AI_CAPITAL_TYPE_FILTER_UNAVAILABLE: '選択されたEquity / Debtは利用できません。',
    AI_TEAM_FILTER_UNAVAILABLE: '選択されたチームは利用できません。',
    AI_COUNTERPARTY_TYPE_FILTER_UNAVAILABLE: '選択した面談先種別は利用できません。',
    AI_ENTITY_FILTER_UNAVAILABLE: '選択した面談先は利用できません。',
    AI_FUND_STRATEGY_FILTER_UNAVAILABLE: '選択されたFund / Strategyは利用できません。',
    AI_ENTITY_TYPE_CONFLICT: '面談先の種別が一致しません。',
    AI_ENTITY_GP_CONFLICT: '面談先とGPの指定が一致しません。',
    AI_MULTI_ENTITY_COUNT_INVALID: '比較する面談先を2–5件選択してください。',
    AI_MULTI_ENTITY_DUPLICATE: '同じ面談先を複数回選択できません。',
    AI_MULTI_ENTITY_MODE_REQUIRED: '面談先の複数選択は比較モードで利用できます。',
    AI_MULTI_ENTITY_AMBIGUOUS_SCOPE: '複数の面談先と単一の面談先を同時に指定できません。',
    AI_RELATED_GP_FILTER_UNAVAILABLE: '旧形式の検索条件は利用できません。',
    AI_MEETING_TYPE_FILTER_UNAVAILABLE: '選択されたMTG種別は利用できません。',
    AI_FILTER_SOURCE_TYPE_INCOMPATIBLE: 'チームとMTG種別は「面談記録のみ」で利用できます。',
    KNOWLEDGE_EXPORT_PROMPT_REQUIRED: '自由質問では質問を入力してください。',
    KNOWLEDGE_EXPORT_PROMPT_TOO_LONG: '質問または追加指示は5,000文字以内で入力してください。',
    KNOWLEDGE_EXPORT_COPY_NOT_CONFIRMED: 'コピー成功の確認がないため、監査記録を作成できません。',
    KNOWLEDGE_EXPORT_OUTPUT_TYPE_INVALID: '出力形式が不正です。',
    KNOWLEDGE_EXPORT_PREVIEW_REQUIRED: '先に対象資料を確認してください。',
    KNOWLEDGE_EXPORT_PREVIEW_STALE: 'プレビューが古くなっています。再度プレビューを実行してください。',
    KNOWLEDGE_EXPORT_NO_RESULTS: '条件に合う有効な資料はありません。',
    KNOWLEDGE_EXPORT_LIMIT_EXCEEDED: '対象資料が書き出し上限を超えています。フィルターを絞ってください。',
    KNOWLEDGE_EXPORT_MEETING_DOCUMENT_MISSING: '面談記録のGoogle Docs原本が見つかりません。',
    KNOWLEDGE_EXPORT_MEETING_URL_MISSING: '面談記録の原本リンクがありません。',
    KNOWLEDGE_EXPORT_MEETING_LINK_MISMATCH: '面談記録の原本リンクが一致しません。',
    KNOWLEDGE_EXPORT_MEETING_DOCUMENT_READ_FAILED: '面談記録のGoogle Docs原本を読み込めません。',
    KNOWLEDGE_EXPORT_PITCHBOOK_FILE_MISSING: '保存資料の原本ファイルが見つかりません。',
    KNOWLEDGE_EXPORT_PITCHBOOK_URL_MISSING: '保存資料の原本リンクがありません。',
    KNOWLEDGE_EXPORT_PITCHBOOK_LINK_MISMATCH: '保存資料の原本リンクが一致しません。',
    KNOWLEDGE_EXPORT_PITCHBOOK_METADATA_INVALID: '保存資料の原本ファイルを開くことができません。',
    KNOWLEDGE_EXPORT_PITCHBOOK_FILE_READ_FAILED: '保存資料の原本ファイルを読み込めません。',
    KNOWLEDGE_EXPORT_RATE_LIMITED: '処理が集中しています。少し待って再試行してください。',
    KNOWLEDGE_EXPORTS_FOLDER_MISSING: '書き出し先フォルダが見つかりません。',
    KNOWLEDGE_EXPORTS_FOLDER_INVALID: '書き出し先フォルダを確認できません。',
    KNOWLEDGE_EXPORT_ARTIFACT_MISSING: '書き出したファイルが見つかりません。',
    KNOWLEDGE_EXPORT_ARTIFACT_URL_MISSING: '書き出したファイルのリンクがありません。',
    KNOWLEDGE_EXPORT_ARTIFACT_URL_MISMATCH: '書き出したファイルのリンクが一致しません。',
    KNOWLEDGE_EXPORT_DOCUMENT_CREATE_FAILED: 'Google Docsの書き出しを完了できませんでした。',
    KNOWLEDGE_EXPORT_DOCUMENT_URL_MISSING: '作成したGoogle Docsのリンクがありません。',
    KNOWLEDGE_EXPORT_PDF_EMPTY: 'PDFの内容が空です。',
    KNOWLEDGE_EXPORT_PDF_CREATE_FAILED: 'PDFの書き出しを完了できませんでした。',
    KNOWLEDGE_EXPORT_PDF_URL_MISSING: '作成したPDFのリンクがありません。',
    KNOWLEDGE_EXPORT_ARTIFACT_CREATE_FAILED: '書き出しファイルを作成できませんでした。',
    KNOWLEDGE_EXPORT_FILE_ID_MISSING: '書き出したファイルが見つかりません。'
  };
  var safe = messages[code] || '資料を書き出せませんでした。';
  var sourceId = error && error.sourceId ? String(error.sourceId) : '';
  if (sourceId && /^(?:MTG|DOC)-[A-Za-z0-9_-]{1,80}$/.test(sourceId) &&
      /KNOWLEDGE_EXPORT_(?:MEETING|PITCHBOOK)/.test(code)) {
    safe += ' 対象ID: ' + sourceId + '。';
  }
  return safe;
}

function kspKnowledgeExportSafeWarning_(code) {
  var messages = {
    ACTOR_RESOLUTION_FAILED: 'Actor情報を取得できないため、匿名扱いで記録します。',
    AUDIT_WRITE_FAILED: '監査メタデータを記録できませんでした。',
    KNOWLEDGE_EXPORT_TEMP_DOCUMENT_CLEANUP_FAILED: 'PDFは作成されましたが、一時Google Docを自動削除できませんでした。'
  };
  return messages[code] || '書き出し後の処理を完了できませんでした。';
}

function kspKnowledgeExportRowMatches_(row, input) {
  if (String(row.Status || '') !== KSP_STATUS.ACTIVE) return false;
  var date = kspKnowledgeExportDate_(row.Date);
  if (input.dateFrom && date < input.dateFrom) return false;
  if (input.dateTo && date > input.dateTo) return false;
  var counterpartyType = kspMeetingCounterpartyType_(row) || (row.Document_ID && row.GP_ID ? 'GP' : '');
  var counterpartyId = kspMeetingCounterpartyId_(row) || (row.Document_ID ? String(row.GP_ID || '') : '');
  var entityKey = kspCounterpartyEntityKey_(counterpartyId);
  if (input.counterpartyType && counterpartyType !== input.counterpartyType) return false;
  if (input.entityKey && entityKey !== input.entityKey) return false;
  if ((input.selectedEntityKeys || []).length >= KSP_KNOWLEDGE_MULTI_ENTITY_MIN &&
      input.selectedEntityKeys.indexOf(entityKey) === -1) return false;
  if (input.gpId && String(row.GP_ID || '') !== input.gpId) return false;
  if (input.assetClassId && String(row.Asset_Class_ID || '') !== input.assetClassId) return false;
  if (input.capitalTypeId && String(row.Capital_Type_ID || '') !== input.capitalTypeId) return false;
  if (input.teamId && String(row.Team_ID || '') !== input.teamId) return false;
  if (input.fundStrategy && String(row.Fund_Strategy || '').trim() !== input.fundStrategy) return false;
  if (input.followUp === KSP_KNOWLEDGE_FOLLOW_UP_FILTERS.REQUIRED &&
      !kspToBoolean_(row.Follow_Up_Required, false)) return false;
  if (input.followUp === KSP_KNOWLEDGE_FOLLOW_UP_FILTERS.NOT_REQUIRED &&
      kspToBoolean_(row.Follow_Up_Required, false)) return false;
  if (input.relatedGpId &&
      kspKnowledgeExactTokens_(kspMeetingRelatedGpIds_(row)).indexOf(input.relatedGpId) === -1) return false;
  if (input.meetingTypeCode &&
      kspKnowledgeExactTokens_(row.Meeting_Type_Codes).indexOf(input.meetingTypeCode) === -1) return false;
  return true;
}

function kspBuildKnowledgeExportSource_(sourceType, row) {
  var id = sourceType === KSP_KNOWLEDGE_EXPORT_SOURCE_TYPES.MEETING
    ? String(row.Meeting_ID || '') : String(row.Document_ID || '');
  kspAssert_(id, 'KNOWLEDGE_EXPORT_SOURCE_ID_MISSING', 'Active source IDがありません。');
  var date = kspKnowledgeExportDate_(row.Date);
  var revisionToken = [
    sourceType,
    id,
    date,
    sourceType === KSP_KNOWLEDGE_EXPORT_SOURCE_TYPES.MEETING ? String(row.Version || '') : '',
    kspKnowledgeExportUpdatedAt_(row.Updated_At),
    String(row.Doc_File_ID || row.File_ID || ''),
    String(row.Doc_URL || row.File_URL || ''),
    kspCanonicalBusinessTime_(row.Time),
    String(row.Location_ID || ''),
    String(row.Counterparty || ''),
    String(row.Internal_Participants || ''),
    String(row.Saved_Filename || ''),
    String(row.Original_Filename || ''),
    String(row.GP_ID || ''),
    kspMeetingCounterpartyType_(row),
    kspMeetingCounterpartyId_(row),
    kspMeetingRelatedGpIds_(row),
    String(row.Asset_Class_ID || ''),
    String(row.Capital_Type_ID || ''),
    String(row.Team_ID || ''),
    String(row.Fund_Strategy || ''),
    String(row.Meeting_Type_Codes || ''),
    String(row.Related_Pitchbook_IDs || ''),
    String(row.Follow_Up_Note || ''),
    String(kspToBoolean_(row.Follow_Up_Required, false))
  ].join('\u001f');
  return {
    sourceType: sourceType,
    sourceId: id,
    date: date,
    entityKey: kspCounterpartyEntityKey_(kspMeetingCounterpartyId_(row) || String(row.GP_ID || '')),
    revisionToken: revisionToken,
    row: kspDeepClone_(row)
  };
}

function kspResolveKnowledgeExportSources_(meetingRows, pitchbookRows, input) {
  var sources = [];
  // Keep the existing function signature; Pitchbook rows are deliberately ignored.
  (meetingRows || []).forEach(function (row) {
    if (kspKnowledgeExportRowMatches_(row, input)) {
      sources.push(kspBuildKnowledgeExportSource_(KSP_KNOWLEDGE_EXPORT_SOURCE_TYPES.MEETING, row));
    }
  });

  var entityOrder = {};
  (input.selectedEntityKeys || []).forEach(function (entityKey, index) { entityOrder[entityKey] = index; });
  return sources.sort(function (left, right) {
    if ((input.selectedEntityKeys || []).length >= KSP_KNOWLEDGE_MULTI_ENTITY_MIN) {
      var leftEntityOrder = Object.prototype.hasOwnProperty.call(entityOrder, left.entityKey) ? entityOrder[left.entityKey] : 999;
      var rightEntityOrder = Object.prototype.hasOwnProperty.call(entityOrder, right.entityKey) ? entityOrder[right.entityKey] : 999;
      if (leftEntityOrder !== rightEntityOrder) return leftEntityOrder - rightEntityOrder;
    }
    var dateCompare = left.date.localeCompare(right.date);
    if (dateCompare !== 0) return dateCompare;
    var idCompare = left.sourceId.localeCompare(right.sourceId);
    if (idCompare !== 0) return idCompare;
    return left.sourceType.localeCompare(right.sourceType);
  });
}

function kspKnowledgeExportHash_(text) {
  if (typeof Utilities !== 'undefined' && Utilities.computeDigest && Utilities.DigestAlgorithm && Utilities.Charset) {
    var bytes = Utilities.computeDigest(
      Utilities.DigestAlgorithm.SHA_256,
      String(text || ''),
      Utilities.Charset.UTF_8
    );
    return bytes.map(function (byte) {
      var value = Number(byte) & 255;
      return ('0' + value.toString(16)).slice(-2);
    }).join('');
  }
  var hash = 2166136261;
  var second = 2654435761;
  var value = String(text || '');
  for (var index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
    second ^= value.charCodeAt(index);
    second = Math.imul(second, 2246822519);
  }
  return ('00000000' + (hash >>> 0).toString(16)).slice(-8) +
    ('00000000' + (second >>> 0).toString(16)).slice(-8);
}

function kspKnowledgeExportCatalogToken_(catalog) {
  var value = catalog || {};
  return kspKnowledgeExportHash_(JSON.stringify({
    gps: (value.gps || []).map(function (item) { return [item.id, item.name, item.status]; }),
    assetClasses: (value.assetClasses || []).map(function (item) { return [item.id, item.name, item.status]; }),
    capitalTypes: (value.capitalTypes || []).map(function (item) { return [item.id, item.name, item.status]; }),
    teams: (value.teams || []).map(function (item) { return [item.id, item.name, item.status]; }),
    counterpartyTypes: (value.counterpartyTypes || []).map(function (item) { return [item.code, item.label, item.optionType]; }),
    counterpartyEntities: (value.counterpartyEntities || []).map(function (item) { return [item.type, item.id, item.name, item.status]; }),
    fundStrategies: (value.fundStrategies || []).map(function (item) { return [item.id, item.name]; })
  }));
}

function kspBuildKnowledgeExportFingerprint_(sources, filters, catalog) {
  var normalizedFilters = filters || {};
  var tokens = (sources || []).map(function (source) {
    return source.revisionToken + '\u001d' + String(source.contentToken || '');
  });
  return 'ksp3-' + kspKnowledgeExportHash_(JSON.stringify({
    route: KSP_AI_ROUTES.FULL_EXPORT,
    mode: normalizedFilters.mode || KSP_KNOWLEDGE_SEARCH_MODES.FREE_QUESTION,
    instructionHash: kspKnowledgeExportHash_(normalizedFilters.questionOrInstruction || ''),
    filters: kspKnowledgeExportPublicFilters_(normalizedFilters),
    catalog: kspKnowledgeExportCatalogToken_(catalog),
    sources: tokens
  })) + '-' + tokens.length;
}

function kspBuildKnowledgeExportLimitState_(meetingCount, meetingCharacterCount, pitchbookCount) {
  var warningReasons = [];
  var hardStopReasons = [];
  if (meetingCount > KSP_KNOWLEDGE_EXPORT_LIMITS.WARNING_MEETINGS) {
    warningReasons.push('Meetingが' + meetingCount + '件あります（警告基準: 30件超）。');
  }
  if (meetingCharacterCount > KSP_KNOWLEDGE_EXPORT_LIMITS.WARNING_MEETING_CHARACTERS) {
    warningReasons.push('Meeting原文が' + meetingCharacterCount + '文字あります（警告基準: 150,000文字超）。');
  }
  if (meetingCount > KSP_KNOWLEDGE_EXPORT_LIMITS.HARD_STOP_MEETINGS) {
    hardStopReasons.push('Meetingが' + meetingCount + '件で上限50件を超えています。');
  }
  if (meetingCharacterCount > KSP_KNOWLEDGE_EXPORT_LIMITS.HARD_STOP_MEETING_CHARACTERS) {
    hardStopReasons.push('Meeting原文が' + meetingCharacterCount + '文字で上限250,000文字を超えています。');
  }
  if (pitchbookCount > KSP_KNOWLEDGE_EXPORT_LIMITS.HARD_STOP_PITCHBOOKS) {
    hardStopReasons.push('Pitchbookが' + pitchbookCount + '件で上限200件を超えています。');
  }
  return {
    warning: warningReasons.length > 0,
    warningReasons: warningReasons,
    hardStop: hardStopReasons.length > 0,
    hardStopReasons: hardStopReasons
  };
}

function kspBuildKnowledgeExportSourceIdRepresentation_(sourceIds) {
  var ids = (sourceIds || []).map(String);
  var maximum = KSP_KNOWLEDGE_EXPORT_LIMITS.MAX_SOURCE_ID_REPORT;
  if (ids.length <= maximum) return ids.join(',');
  return ids.slice(0, maximum).join(',') + ',...(total=' + ids.length + ')';
}

function kspKnowledgeExportExtension_(filename) {
  var match = /\.([A-Za-z0-9]+)$/.exec(String(filename || ''));
  return match ? '.' + match[1].toLowerCase() : '';
}

function kspBuildKnowledgeExportFilename_(input, nowIso, outputType) {
  var parts = ['Knowledge_Export'];
  var filters = kspKnowledgeExportPublicFilters_(input);
  [filters.counterpartyType, filters.entityKey, filters.gpId, filters.assetClassId,
    filters.capitalTypeId, filters.teamId, filters.fundStrategy, filters.followUp, filters.sourceType,
    filters.dateFrom, filters.dateTo].forEach(function (value) {
    var segment = kspNormalizeGeneratedNameSegment_(value);
    if (segment) parts.push(segment);
  });
  var timestamp = kspCanonicalInstantIso_(nowIso).replace(/[^0-9]/g, '').slice(0, 14);
  if (timestamp) parts.push(timestamp);
  var name = parts.join('_').slice(0, 140);
  return outputType === KSP_KNOWLEDGE_EXPORT_OUTPUT_TYPES.PDF ? name + '.pdf' : name;
}

function kspBuildKnowledgeExportPackageTitle_(input) {
  var value = input || {};
  var parts = ['面談記録の全文出力'];
  var filters = kspKnowledgeExportPublicFilters_(value);
  [filters.counterpartyType, filters.entityKey, (input.selectedEntityKeys || []).join('+'), filters.gpId, filters.assetClassId,
    filters.capitalTypeId, filters.teamId, filters.fundStrategy, filters.followUp, filters.sourceType,
    filters.dateFrom, filters.dateTo].forEach(function (filterValue) {
    var segment = kspNormalizeGeneratedNameSegment_(filterValue);
    if (segment) parts.push(segment);
  });
  return parts.join(' / ').slice(0, 180);
}

function kspBuildKnowledgeExportRenderModel_(input, meetings, pitchbooks, maps, title) {
  var safeMaps = maps || { gp: {}, assetClass: {}, capitalType: {}, location: {}, team: {}, counterparty: {} };
  var meetingSections = (meetings || []).map(function (item) {
    var row = item.source.row;
    var counterpartyId = kspMeetingCounterpartyId_(row);
    var counterpartyType = String((safeMaps.counterpartyType || {})[counterpartyId] ||
      kspMeetingCounterpartyType_(row));
    var definition = kspCounterpartyTypeDefinition_(counterpartyType);
    var lines = [
      'Meeting ID: ' + item.source.sourceId,
      '日付: ' + item.source.date,
      '面談先区分: ' + (definition ? definition.label : counterpartyType),
      '面談先: ' + ((safeMaps.counterparty || {})[counterpartyId] || '登録情報なし'),
      'アセットクラス: ' + (safeMaps.assetClass[String(row.Asset_Class_ID || '')] || String(row.Asset_Class_ID || ''))
    ];
    if (row.Time) lines.push('時間: ' + kspCanonicalBusinessTime_(row.Time));
    if (row.Capital_Type_ID) lines.push('Equity / Debt: ' + (safeMaps.capitalType[String(row.Capital_Type_ID)] || String(row.Capital_Type_ID)));
    if (row.Location_ID) lines.push('面談場所: ' + (safeMaps.location[String(row.Location_ID)] || String(row.Location_ID)));
    if (row.Counterparty) lines.push('面談相手: ' + String(row.Counterparty));
    if (row.Internal_Participants) lines.push('当社側: ' + String(row.Internal_Participants));
    if (row.Team_ID) lines.push('チーム: ' + (safeMaps.team[String(row.Team_ID)] || String(row.Team_ID)));
    if (row.Fund_Strategy) lines.push('Fund / Strategy: ' + String(row.Fund_Strategy));
    var meetingTypes = kspMeetingTypeLabels_(row.Meeting_Type_Codes);
    if (meetingTypes.length) lines.push('MTG種別: ' + meetingTypes.join(', '));
    if (row.Related_Pitchbook_IDs) lines.push('関連資料のDocument ID: ' + String(row.Related_Pitchbook_IDs));
    lines.push('Google Docs原本: ' + String(item.source.canonicalUrl || row.Doc_URL || ''));
    return {
      entityKey: item.source.entityKey || kspCounterpartyEntityKey_(counterpartyId),
      entityLabel: (safeMaps.counterparty || {})[counterpartyId] || '登録情報なし',
      heading: '面談記録 ' + item.source.sourceId + ' / ' + item.source.date,
      metadataLines: lines,
      body: item.body
    };
  });
  return {
    title: title || kspBuildKnowledgeExportPackageTitle_(input),
    headerLines: ['面談記録の全文出力', '対象範囲: ' + kspKnowledgeScopeSummary_(input)],
    meetingSections: meetingSections,
    pitchbookLines: [],
    pitchbookReferencesOnly: false
  };
}

function kspBuildKnowledgeExportPlainText_(model) {
  var lines = [String(model.title || '面談記録の全文出力')].concat(model.headerLines || [], ['']);
  var currentEntityKey = '';
  (model.meetingSections || []).forEach(function (section, index) {
    if (section.entityKey && section.entityKey !== currentEntityKey) {
      if (index > 0) lines.push('\f');
      lines.push('面談先: ' + (section.entityLabel || '登録情報なし'), '');
      currentEntityKey = section.entityKey;
    } else if (index > 0) lines.push('\f');
    lines.push(section.heading);
    lines = lines.concat(section.metadataLines || []);
    lines.push('', section.body || '');
  });
  return lines.join('\n');
}

function kspKnowledgeExportPromptLabel_(items, id) {
  var value = String(id || '');
  if (!value) return '未選択';
  var found = (items || []).filter(function (item) { return String(item.id) === value; })[0];
  return found ? String(found.name) : '登録情報なし';
}

function kspBuildKnowledgeExportPrompt_(input, catalog) {
  var definition = kspGetKnowledgeExportModeDefinition_(input.mode);
  var filters = kspKnowledgeExportPublicFilters_(input);
  var safeCatalog = catalog || {};
  var sourceType = filters.sourceType === KSP_KNOWLEDGE_EXPORT_SOURCE_TYPES.MEETING ? '面談記録' :
    filters.sourceType === KSP_KNOWLEDGE_EXPORT_SOURCE_TYPES.PITCHBOOK ? '保存資料' : '面談記録と保存資料';
  var lines = [
    '添付した面談記録の全文と、必要に応じて別途添付した原資料だけを根拠に、日本語で回答してください。',
    '資料にない事実は推測・創作せず、確認できない点と証拠不足を明示してください。',
    '重要な事実や比較には、可能な範囲で資料タイトル、Meeting ID、Document IDなどの出典名を付けてください。',
    '',
    'モード: ' + definition.mode,
    '開始日: ' + (filters.dateFrom || '未選択'),
    '終了日: ' + (filters.dateTo || '未選択'),
    '面談先区分: ' + (filters.counterpartyType || '未選択'),
    '面談先: ' + kspKnowledgeExportPromptLabel_(safeCatalog.counterpartyEntities, filters.entityKey),
    '比較対象の面談先: ' + ((input.selectedEntityKeys || []).length
      ? input.selectedEntityKeys.map(function (entityKey) {
        return kspKnowledgeExportPromptLabel_(safeCatalog.counterpartyEntities, entityKey);
      }).join(', ') : '未選択'),
    'アセットクラス: ' + kspKnowledgeExportPromptLabel_(safeCatalog.assetClasses, filters.assetClassId),
    'Equity / Debt: ' + kspKnowledgeExportPromptLabel_(safeCatalog.capitalTypes, filters.capitalTypeId),
    'チーム: ' + kspKnowledgeExportPromptLabel_(safeCatalog.teams, filters.teamId),
    'Fund / Strategy: ' + (filters.fundStrategy || '未選択'),
    'MTG種別: ' + (filters.meetingTypeCode || '未選択'),
    '対象資料: ' + sourceType,
    '',
    definition.instruction,
    '面談記録にはGoogle Docs原本の全文と登録情報を含みます。保存資料の本文とリンクは含みません。',
    '保存資料の本文を分析する場合は、別途添付した原本を、許可された資料検索で参照してください。'
  ];
  if (input.questionOrInstruction) lines.push('', '質問または追加指示:', input.questionOrInstruction);
  return lines.join('\n');
}

function kspKnowledgeExportActionForOutput_(outputType) {
  return outputType === KSP_KNOWLEDGE_EXPORT_OUTPUT_TYPES.PDF
    ? KSP_KNOWLEDGE_EXPORT_ACTIONS.PDF : KSP_KNOWLEDGE_EXPORT_ACTIONS.GOOGLE_DOCS;
}

function kspBuildKnowledgeExportAuditRow_(params) {
  var options = params || {};
  var input = options.input || {};
  var counts = options.counts || {};
  var metadata = kspDeepClone_(options.metadata || {});
  metadata.meetingCount = Number(counts.meetingCount || 0);
  metadata.meetingCharacterCount = Number(counts.meetingCharacterCount || 0);
  metadata.pitchbookCount = Number(counts.pitchbookCount || 0);
  metadata.route = KSP_AI_ROUTES.FULL_EXPORT;
  metadata.mode = input.mode || KSP_KNOWLEDGE_SEARCH_MODES.FREE_QUESTION;
  metadata.structuredFilters = kspKnowledgeFilterAuditMetadata_(input);
  return {
    Event_Timestamp: kspCanonicalInstantIso_(options.timestamp),
    Actor: options.actor || 'UNIDENTIFIED',
    Action: options.action || KSP_KNOWLEDGE_EXPORT_ACTIONS.PREVIEW,
    Target_Type: 'KnowledgeExport',
    Target_ID: options.targetId || '',
    Result: options.result || KSP_AUDIT_RESULTS.FAILURE,
    Changed_Fields: '',
    Before_Metadata_JSON: '',
    After_Metadata_JSON: JSON.stringify(metadata),
    Batch_ID: '',
    Error_Code: options.errorCode || '',
    Error_Message: options.errorCode ? kspKnowledgeExportSafeMessage_(options.errorCode, options.error) : '',
    Search_Mode: input.mode || '',
    Question_Or_Instruction: '',
    Date_From: input.dateFrom || '',
    Date_To: input.dateTo || '',
    GP_Filter: input.gpId || '',
    Asset_Class_Filter: input.assetClassId || '',
    Capital_Type_Filter: input.capitalTypeId || '',
    Source_Type_Filter: input.sourceType || '',
    Model_ID: '',
    Cited_Source_IDs: options.sourceIds || ''
  };
}
// ===== END src/155_KnowledgeExportContracts.gs =====

// ===== BEGIN src/156_KnowledgeExportService.gs =====
function kspGetKnowledgeExportActorSafely_(environment, warnings) {
  try {
    return environment.getActor() || 'UNIDENTIFIED';
  } catch (error) {
    warnings.push({ code: 'ACTOR_RESOLUTION_FAILED', message: kspKnowledgeExportSafeWarning_('ACTOR_RESOLUTION_FAILED') });
    return 'UNIDENTIFIED';
  }
}

function kspTryAppendKnowledgeExportAudit_(environment, auditSpreadsheetId, row, warnings) {
  if (!auditSpreadsheetId) return;
  try {
    environment.appendRow(auditSpreadsheetId, KSP_SHEET_NAMES.AUDIT_LOG, row);
  } catch (error) {
    warnings.push({ code: 'AUDIT_WRITE_FAILED', message: kspKnowledgeExportSafeWarning_('AUDIT_WRITE_FAILED') });
  }
}

function kspKnowledgeExportCounts_(preview) {
  return {
    meetingCount: Number(preview.meetingCount || 0),
    meetingCharacterCount: Number(preview.meetingCharacterCount || 0),
    pitchbookCount: Number(preview.pitchbookCount || 0)
  };
}

function kspKnowledgeExportIndexCounts_(sources) {
  return (sources || []).reduce(function (counts, source) {
    if (source.sourceType === KSP_KNOWLEDGE_EXPORT_SOURCE_TYPES.MEETING) counts.meetingCount += 1;
    if (source.sourceType === KSP_KNOWLEDGE_EXPORT_SOURCE_TYPES.PITCHBOOK) counts.pitchbookCount += 1;
    return counts;
  }, { meetingCount: 0, pitchbookCount: 0 });
}

function kspKnowledgeExportAssertBudget_(budget) {
  if (Date.now() - budget.startedAt > KSP_KNOWLEDGE_EXPORT_LIMITS.MAX_PREVIEW_MILLIS) {
    var error = new Error('Knowledge Export preview budget exceeded.');
    error.code = 'KNOWLEDGE_EXPORT_PREVIEW_BUDGET_EXCEEDED';
    throw error;
  }
}

function kspBuildKnowledgeExportIndexPreview_(input, sources, catalog) {
  var counts = kspKnowledgeExportIndexCounts_(sources);
  var limits = kspBuildKnowledgeExportLimitState_(counts.meetingCount, 0, counts.pitchbookCount);
  var sourceIds = (sources || []).slice(0, KSP_KNOWLEDGE_EXPORT_LIMITS.MAX_SOURCE_ID_REPORT)
    .map(function (source) { return source.sourceId; });
  return {
    workId: KSP_KNOWLEDGE_EXPORT_WORK_ID,
    filters: kspKnowledgeExportPublicFilters_(input),
    mode: input.mode,
    scopeSummary: kspKnowledgeScopeSummary_(input),
    meetingCount: counts.meetingCount,
    meetingCharacterCount: null,
    characterCountDeferred: true,
    pitchbookCount: counts.pitchbookCount,
    warning: limits.warning,
    warningReasons: limits.warningReasons,
    hardStop: limits.hardStop,
    hardStopReasons: limits.hardStopReasons,
    noResults: counts.meetingCount === 0,
    sourceIds: sourceIds,
    sourceIdCount: (sources || []).length,
    previewFingerprint: kspBuildKnowledgeExportFingerprint_(sources, input, catalog)
  };
}

function kspMaterializeKnowledgeExportSources_(environment, sources, budget) {
  var meetings = [];
  var pitchbooks = [];
  var materializationBudget = budget || { startedAt: Date.now(), meetingReads: 0 };

  (sources || []).forEach(function (source) {
    kspKnowledgeExportAssertBudget_(materializationBudget);
    var row = source.row || {};
    if (source.sourceType === KSP_KNOWLEDGE_EXPORT_SOURCE_TYPES.MEETING) {
      var documentId = String(row.Doc_File_ID || '');
      if (!documentId) {
        throw kspKnowledgeExportSourceError_('KNOWLEDGE_EXPORT_MEETING_DOCUMENT_MISSING', source.sourceId,
          'Meetingの権威あるGoogle Docがありません。');
      }
      if (!kspIsKnowledgeExportDriveUrl_(row.Doc_URL)) {
        throw kspKnowledgeExportSourceError_('KNOWLEDGE_EXPORT_MEETING_URL_MISSING', source.sourceId,
          'Meetingの権威あるDriveリンクがありません。');
      }
      if (!kspKnowledgeExportUrlMatchesId_(row.Doc_URL, documentId)) {
        throw kspKnowledgeExportSourceError_('KNOWLEDGE_EXPORT_MEETING_LINK_MISMATCH', source.sourceId,
          'MeetingのGoogle Docリンクと安定IDが一致しません。');
      }
      var body;
      try {
        body = environment.getDocumentText(documentId);
      } catch (error) {
        throw kspKnowledgeExportSourceError_('KNOWLEDGE_EXPORT_MEETING_DOCUMENT_READ_FAILED', source.sourceId,
          'Meetingの権威あるGoogle Docを読み取れません。');
      }
      materializationBudget.meetingReads += 1;
      kspKnowledgeExportAssertBudget_(materializationBudget);
      if (body === null || body === undefined) {
        throw kspKnowledgeExportSourceError_('KNOWLEDGE_EXPORT_MEETING_DOCUMENT_READ_FAILED', source.sourceId,
          'Meetingの権威あるGoogle Docを読み取れません。');
      }
      body = String(body);
      source.contentToken = body.length + ':' + kspKnowledgeExportHash_(body);
      source.canonicalUrl = kspBuildKnowledgeExportCanonicalUrl_(KSP_KNOWLEDGE_EXPORT_SOURCE_TYPES.MEETING, documentId);
      meetings.push({ source: source, body: body });
    } else {
      var fileId = String(row.File_ID || '');
      if (!fileId) {
        throw kspKnowledgeExportSourceError_('KNOWLEDGE_EXPORT_PITCHBOOK_FILE_MISSING', source.sourceId,
          'Pitchbookの権威あるDriveファイルがありません。');
      }
      if (!kspIsKnowledgeExportDriveUrl_(row.File_URL)) {
        throw kspKnowledgeExportSourceError_('KNOWLEDGE_EXPORT_PITCHBOOK_URL_MISSING', source.sourceId,
          'Pitchbookの権威あるDriveリンクがありません。');
      }
      if (!kspKnowledgeExportUrlMatchesId_(row.File_URL, fileId)) {
        throw kspKnowledgeExportSourceError_('KNOWLEDGE_EXPORT_PITCHBOOK_LINK_MISMATCH', source.sourceId,
          'PitchbookのDriveリンクと安定IDが一致しません。');
      }
      var metadata;
      try {
        kspAssert_(typeof environment.getDriveFileMetadata === 'function',
          'KNOWLEDGE_EXPORT_PITCHBOOK_METADATA_INVALID', 'PitchbookのDriveメタデータを確認できません。');
        metadata = environment.getDriveFileMetadata(fileId);
      } catch (error) {
        throw kspKnowledgeExportSourceError_('KNOWLEDGE_EXPORT_PITCHBOOK_METADATA_INVALID', source.sourceId,
          'PitchbookのDriveメタデータを確認できません。');
      }
      var metadataMimeType = String(metadata && metadata.mimeType || '');
      if (!metadata || String(metadata.id || '') !== fileId || !metadataMimeType || metadata.trashed === true ||
          metadataMimeType === 'application/vnd.google-apps.folder' ||
          (metadata.webViewLink && !kspKnowledgeExportUrlMatchesId_(metadata.webViewLink, fileId))) {
        throw kspKnowledgeExportSourceError_('KNOWLEDGE_EXPORT_PITCHBOOK_METADATA_INVALID', source.sourceId,
          'PitchbookのDriveメタデータを確認できません。');
      }
      // FULL_EXPORT is deliberately reference-only for Pitchbooks. Metadata above
      // confirms the authoritative file identity and boundary; this path must not
      // inspect source text, media, Blob, or bytes.
      source.canonicalUrl = kspBuildKnowledgeExportCanonicalUrl_(KSP_KNOWLEDGE_EXPORT_SOURCE_TYPES.PITCHBOOK, fileId);
      source.referenceOnly = true;
      pitchbooks.push({ source: source });
    }
  });

  return { meetings: meetings, pitchbooks: pitchbooks };
}

function kspBuildKnowledgeExportPreviewFromMaterials_(input, sources, materials, catalog, masterMaps) {
  var meetingCharacterCount = (materials.meetings || []).reduce(function (total, item) {
    return total + item.body.length;
  }, 0);
  var counts = {
    meetingCount: (materials.meetings || []).length,
    meetingCharacterCount: meetingCharacterCount,
    pitchbookCount: (materials.pitchbooks || []).length
  };
  var limits = kspBuildKnowledgeExportLimitState_(
    counts.meetingCount, counts.meetingCharacterCount, counts.pitchbookCount
  );
  var sourceIds = (sources || []).slice(0, KSP_KNOWLEDGE_EXPORT_LIMITS.MAX_SOURCE_ID_REPORT)
    .map(function (source) { return source.sourceId; });
  var renderModel = kspBuildKnowledgeExportRenderModel_(
    input,
    materials.meetings,
    materials.pitchbooks,
    masterMaps || { gp: {}, assetClass: {}, capitalType: {}, location: {}, team: {}, counterparty: {} },
    kspBuildKnowledgeExportPackageTitle_(input)
  );
  var packageText = kspBuildKnowledgeExportPlainText_(renderModel);
  var previewFingerprint = kspBuildKnowledgeExportFingerprint_(sources, input, catalog);
  return {
    workId: KSP_KNOWLEDGE_EXPORT_WORK_ID,
    filters: kspKnowledgeExportPublicFilters_(input),
    mode: input.mode,
    scopeSummary: kspKnowledgeScopeSummary_(input),
    meetingCount: counts.meetingCount,
    meetingCharacterCount: counts.meetingCharacterCount,
    pitchbookCount: counts.pitchbookCount,
    warning: limits.warning,
    warningReasons: limits.warningReasons,
    hardStop: limits.hardStop,
    hardStopReasons: limits.hardStopReasons,
    noResults: counts.meetingCount === 0,
    sourceIds: sourceIds,
    sourceIdCount: (sources || []).length,
    previewFingerprint: previewFingerprint,
    packageFingerprint: previewFingerprint,
    packageText: packageText,
    pitchbookReferencesOnly: false
  };
}

function kspKnowledgeExportErrorResponse_(error, warnings, preview) {
  var response = {
    ok: false,
    workId: KSP_KNOWLEDGE_EXPORT_WORK_ID,
    error: (function () {
      var code = kspGetErrorCode_(error);
      return { code: code, message: kspKnowledgeExportSafeMessage_(code, error) };
    }()),
    warnings: warnings || []
  };
  if (preview) response.preview = preview;
  if (preview) response.counts = kspKnowledgeExportCounts_(preview);
  return response;
}

function kspRunKnowledgeExportPreview_(environment, rawInput) {
  var warnings = [];
  var actor = kspGetKnowledgeExportActorSafely_(environment, warnings);
  var input = kspNormalizeKnowledgeFullOutputInput_(rawInput);
  var context = null;
  var auditSpreadsheetId = '';
  var preview = null;
  var sources = [];

  try {
    kspAssert_(kspClaimPublicOperation_(environment, 'KNOWLEDGE_EXPORT_PREVIEW', actor, '',
      KSP_KNOWLEDGE_EXPORT_LIMITS.THROTTLE_SECONDS), 'KNOWLEDGE_EXPORT_RATE_LIMITED',
      '少し待ってから再試行してください。');
    context = environment.loadKnowledgeExportContext();
    auditSpreadsheetId = context.auditSpreadsheetId || '';
    var catalog = kspBuildKnowledgeSearchCatalog_(kspContextCounterpartyRows_(context), context.optionRows,
      context.meetingRows, context.pitchbookRows);
    input = kspValidateKnowledgeExportFilters_(input, catalog);
    sources = kspResolveKnowledgeExportSources_(context.meetingRows, context.pitchbookRows, input);
    var indexCounts = kspKnowledgeExportIndexCounts_(sources);
    var indexLimits = kspBuildKnowledgeExportLimitState_(indexCounts.meetingCount, 0, indexCounts.pitchbookCount);
    if (indexLimits.hardStop) {
      preview = kspBuildKnowledgeExportIndexPreview_(input, sources, catalog);
    } else {
      var materials = kspMaterializeKnowledgeExportSources_(environment, sources, { startedAt: Date.now(), meetingReads: 0 });
      preview = kspBuildKnowledgeExportPreviewFromMaterials_(input, sources, materials, catalog,
        kspBuildAllMasterMaps_(kspContextCounterpartyRows_(context), context.optionRows));
    }
    kspTryAppendKnowledgeExportAudit_(environment, auditSpreadsheetId, kspBuildKnowledgeExportAuditRow_({
      timestamp: environment.nowIso(),
      actor: actor,
      action: KSP_KNOWLEDGE_EXPORT_ACTIONS.PREVIEW,
      targetId: preview.previewFingerprint,
      result: KSP_AUDIT_RESULTS.SUCCESS,
      input: input,
      counts: kspKnowledgeExportCounts_(preview),
      sourceIds: kspBuildKnowledgeExportSourceIdRepresentation_(preview.sourceIds),
      metadata: { warning: preview.warning, hardStop: preview.hardStop, noResults: preview.noResults }
    }), warnings);
    return { ok: true, workId: KSP_KNOWLEDGE_EXPORT_WORK_ID, preview: preview, warnings: warnings };
  } catch (error) {
    if (context && auditSpreadsheetId) {
      kspTryAppendKnowledgeExportAudit_(environment, auditSpreadsheetId, kspBuildKnowledgeExportAuditRow_({
        timestamp: environment.nowIso(),
        actor: actor,
        action: KSP_KNOWLEDGE_EXPORT_ACTIONS.PREVIEW,
        targetId: preview ? preview.previewFingerprint : '',
        result: KSP_AUDIT_RESULTS.FAILURE,
        input: input,
        counts: preview ? kspKnowledgeExportCounts_(preview) : {},
        sourceIds: kspBuildKnowledgeExportSourceIdRepresentation_(sources.map(function (source) { return source.sourceId; })),
        errorCode: kspGetErrorCode_(error),
        error: error,
        errorMessage: kspKnowledgeExportSafeMessage_(kspGetErrorCode_(error), error),
        metadata: {}
      }), warnings);
    }
    return kspKnowledgeExportErrorResponse_(error, warnings, preview);
  }
}

function kspRunKnowledgeExportCreation_(environment, rawInput) {
  var warnings = [];
  var actor = kspGetKnowledgeExportActorSafely_(environment, warnings);
  var input = kspNormalizeKnowledgeFullOutputInput_(rawInput);
  var context = null;
  var auditSpreadsheetId = '';
  var preview = null;
  var sources = [];
  var idempotencyKey = '';

  try {
    context = environment.loadKnowledgeExportContext();
    auditSpreadsheetId = context.auditSpreadsheetId || '';
    var catalog = kspBuildKnowledgeSearchCatalog_(kspContextCounterpartyRows_(context), context.optionRows,
      context.meetingRows, context.pitchbookRows);
    input = kspValidateKnowledgeExportFilters_(input, catalog);
    input.outputType = kspValidateKnowledgeExportOutputType_(input.outputType);
    kspAssert_(input.previewFingerprint, 'KNOWLEDGE_EXPORT_PREVIEW_REQUIRED', '先に対象資料を確認してください。');
    idempotencyKey = kspBuildPublicOperationCacheKey_('KNOWLEDGE_EXPORT_CREATE', actor,
      input.previewFingerprint + '|' + input.outputType);
    if (typeof environment.getPublicIdempotency === 'function') {
      var cachedResult = environment.getPublicIdempotency(idempotencyKey);
      if (cachedResult) {
        cachedResult.idempotentReplay = true;
        return cachedResult;
      }
    }
    kspAssert_(kspClaimPublicOperation_(environment, 'KNOWLEDGE_EXPORT_CREATE', actor,
      input.previewFingerprint + '|' + input.outputType, KSP_KNOWLEDGE_EXPORT_LIMITS.THROTTLE_SECONDS),
      'KNOWLEDGE_EXPORT_RATE_LIMITED', '少し待ってから再試行してください。');
    sources = kspResolveKnowledgeExportSources_(context.meetingRows, context.pitchbookRows, input);
    var indexCounts = kspKnowledgeExportIndexCounts_(sources);
    var indexLimits = kspBuildKnowledgeExportLimitState_(indexCounts.meetingCount, 0, indexCounts.pitchbookCount);
    var materials;
    if (indexLimits.hardStop) {
      preview = kspBuildKnowledgeExportIndexPreview_(input, sources, catalog);
      kspAssert_(!preview.hardStop, 'KNOWLEDGE_EXPORT_LIMIT_EXCEEDED',
        preview.hardStopReasons.join(' ') + ' フィルターを絞ってください。');
    } else {
      materials = kspMaterializeKnowledgeExportSources_(environment, sources, { startedAt: Date.now(), meetingReads: 0 });
      preview = kspBuildKnowledgeExportPreviewFromMaterials_(input, sources, materials, catalog,
        kspBuildAllMasterMaps_(kspContextCounterpartyRows_(context), context.optionRows));
    }
    if (preview.previewFingerprint !== input.previewFingerprint) {
      var staleError = new Error('プレビューが古くなっています。再度プレビューを実行してください。');
      staleError.code = 'KNOWLEDGE_EXPORT_PREVIEW_STALE';
      throw staleError;
    }
    kspAssert_(!preview.noResults, 'KNOWLEDGE_EXPORT_NO_RESULTS', '一致するActiveな資料がありません。');
    kspAssert_(!preview.hardStop,
      'KNOWLEDGE_EXPORT_LIMIT_EXCEEDED',
      preview.hardStopReasons.join(' ') + ' フィルターを絞ってください。');

    var maps = kspBuildAllMasterMaps_(kspContextCounterpartyRows_(context), context.optionRows);
    var title = kspBuildKnowledgeExportFilename_(input, environment.nowIso(), input.outputType);
    var renderModel = kspBuildKnowledgeExportRenderModel_(
      input, materials.meetings, materials.pitchbooks, maps,
      kspBuildKnowledgeExportPackageTitle_(input)
    );
    var packageText = kspBuildKnowledgeExportPlainText_(renderModel);
    kspAssert_(packageText === preview.packageText,
      'KNOWLEDGE_EXPORT_PACKAGE_CHANGED', '全文出力パッケージがプレビュー後に変更されています。');
    var artifact = environment.createKnowledgeExportArtifact({
      folderId: context.knowledgeExportsFolderId,
      filename: title,
      outputType: input.outputType,
      model: renderModel
    });
    kspAssert_(artifact && artifact.id, 'KNOWLEDGE_EXPORT_ARTIFACT_MISSING', '生成された書き出しのIDを確認できません。');
    kspAssert_(artifact.url && kspIsKnowledgeExportDriveUrl_(artifact.url),
      'KNOWLEDGE_EXPORT_ARTIFACT_URL_MISSING', '生成された書き出しのDriveリンクを確認できません。');
    kspAssert_(kspKnowledgeExportUrlMatchesId_(artifact.url, artifact.id),
      'KNOWLEDGE_EXPORT_ARTIFACT_URL_MISMATCH', '生成された書き出しのリンク整合性を確認できません。');
    if (artifact.warnings && artifact.warnings.length) {
      warnings = warnings.concat(artifact.warnings.map(function (warning) {
        var code = String(warning && warning.code || 'KNOWLEDGE_EXPORT_ARTIFACT_WARNING');
        return { code: code, message: kspKnowledgeExportSafeWarning_(code) };
      }));
    }

    kspTryAppendKnowledgeExportAudit_(environment, auditSpreadsheetId, kspBuildKnowledgeExportAuditRow_({
      timestamp: environment.nowIso(),
      actor: actor,
      action: kspKnowledgeExportActionForOutput_(input.outputType),
      targetId: artifact.id,
      result: KSP_AUDIT_RESULTS.SUCCESS,
      input: input,
      counts: kspKnowledgeExportCounts_(preview),
      sourceIds: kspBuildKnowledgeExportSourceIdRepresentation_(preview.sourceIds),
      metadata: {
        outputType: input.outputType,
        artifactId: artifact.id,
        driveUrl: artifact.url,
        filename: artifact.name || title,
        warningCount: warnings.length,
        warningCodes: warnings.map(function (warning) { return warning.code; })
      }
    }), warnings);
    var creationResult = {
      ok: true,
      workId: KSP_KNOWLEDGE_EXPORT_WORK_ID,
      artifact: { id: artifact.id, url: artifact.url, name: artifact.name || title, outputType: input.outputType },
      preview: preview,
      packageFingerprint: preview.packageFingerprint || preview.previewFingerprint,
      packageText: packageText,
      warnings: warnings
    };
    if (idempotencyKey && typeof environment.setPublicIdempotency === 'function') {
      environment.setPublicIdempotency(idempotencyKey, creationResult, KSP_KNOWLEDGE_EXPORT_LIMITS.IDEMPOTENCY_SECONDS);
    }
    return creationResult;
  } catch (error) {
    if (context && auditSpreadsheetId) {
      kspTryAppendKnowledgeExportAudit_(environment, auditSpreadsheetId, kspBuildKnowledgeExportAuditRow_({
        timestamp: environment.nowIso(),
        actor: actor,
        action: kspKnowledgeExportActionForOutput_(input.outputType),
        targetId: '',
        result: KSP_AUDIT_RESULTS.FAILURE,
        input: input,
        counts: preview ? kspKnowledgeExportCounts_(preview) : {},
        sourceIds: kspBuildKnowledgeExportSourceIdRepresentation_(sources.map(function (source) { return source.sourceId; })),
        errorCode: kspGetErrorCode_(error),
        error: error,
        errorMessage: kspKnowledgeExportSafeMessage_(kspGetErrorCode_(error), error),
        metadata: {}
      }), warnings);
    }
    return kspKnowledgeExportErrorResponse_(error, warnings, preview);
  }
}

function kspGetKnowledgeExportPrompt_(environment, rawInput) {
  try {
    var context = environment.loadKnowledgeExportContext();
    var catalog = kspBuildKnowledgeSearchCatalog_(kspContextCounterpartyRows_(context), context.optionRows,
      context.meetingRows, context.pitchbookRows);
    var input = kspValidateKnowledgeExportPromptInput_(
      kspNormalizeKnowledgeExportInput_(rawInput),
      catalog
    );
    return {
      ok: true,
      workId: KSP_KNOWLEDGE_EXPORT_WORK_ID,
      mode: input.mode,
      filters: kspKnowledgeExportPublicFilters_(input),
      prompt: kspBuildKnowledgeExportPrompt_(input, catalog)
    };
  } catch (error) {
    return kspKnowledgeExportErrorResponse_(error, []);
  }
}

function kspRecordKnowledgeExportPromptCopy_(environment, rawInput) {
  var warnings = [];
  var actor = kspGetKnowledgeExportActorSafely_(environment, warnings);
  var input = kspNormalizeKnowledgeExportInput_(rawInput);
  var context = null;
  var auditSpreadsheetId = '';
  try {
    context = environment.loadKnowledgeExportContext();
    auditSpreadsheetId = context.auditSpreadsheetId || '';
    input = kspValidateKnowledgeExportCopyInput_(input,
      kspBuildKnowledgeSearchCatalog_(kspContextCounterpartyRows_(context), context.optionRows,
        context.meetingRows, context.pitchbookRows));
    kspTryAppendKnowledgeExportAudit_(environment, auditSpreadsheetId, kspBuildKnowledgeExportAuditRow_({
      timestamp: environment.nowIso(),
      actor: actor,
      action: KSP_KNOWLEDGE_EXPORT_ACTIONS.PROMPT_COPY,
      result: KSP_AUDIT_RESULTS.SUCCESS,
      input: input,
      metadata: { copied: true }
    }), warnings);
    return { ok: true, workId: KSP_KNOWLEDGE_EXPORT_WORK_ID, warnings: warnings };
  } catch (error) {
    return kspKnowledgeExportErrorResponse_(error, warnings);
  }
}
// ===== END src/156_KnowledgeExportService.gs =====

// ===== BEGIN src/157_KnowledgeExportLiveEnvironment.gs =====
function kspCreateKnowledgeExportEnvironment_() {
  var environment = kspCreateMaintenanceEnvironment_();

  environment.loadKnowledgeExportContext = function () {
    var context = kspLoadMaintenanceContext_(environment);
    var state = environment.getInstallationState();
    var folderId = state && state.resources ? state.resources[KSP_RESOURCE_KEYS.KNOWLEDGE_EXPORTS] : '';
    kspAssert_(folderId, 'KNOWLEDGE_EXPORTS_FOLDER_MISSING', 'Knowledge Exports folderが設定されていません。');
    kspValidateKnowledgeExportFolder_(folderId, state && state.config ? state.config.knowledgeParentFolderId : '');
    context.knowledgeExportsFolderId = folderId;
    return context;
  };

  environment.createKnowledgeExportArtifact = function (options) {
    var input = options || {};
    kspAssert_(input.folderId, 'KNOWLEDGE_EXPORTS_FOLDER_MISSING', 'Knowledge Exports folderが設定されていません。');
    var state = environment.getInstallationState();
    kspValidateKnowledgeExportFolder_(
      input.folderId,
      state && state.config ? state.config.knowledgeParentFolderId : ''
    );
    var temporaryDocumentId = '';
    var pdfFileId = '';
    try {
      var temporaryName = input.outputType === KSP_KNOWLEDGE_EXPORT_OUTPUT_TYPES.PDF
        ? String(input.filename) + ' (temporary)' : String(input.filename);
      var documentFile = Drive.Files.create({
        name: temporaryName,
        mimeType: 'application/vnd.google-apps.document',
        parents: [input.folderId]
      }, null, {
        supportsAllDrives: true,
        fields: 'id,name,mimeType,webViewLink,parents,trashed'
      });
      temporaryDocumentId = documentFile.id;
      kspAssertKnowledgeExportCreatedFile_(
        documentFile, input.folderId, 'application/vnd.google-apps.document',
        'KNOWLEDGE_EXPORT_DOCUMENT_CREATE_FAILED'
      );
      kspWriteKnowledgeExportDocument_(temporaryDocumentId, input.model);

      if (input.outputType === KSP_KNOWLEDGE_EXPORT_OUTPUT_TYPES.GOOGLE_DOCS) {
        kspAssert_(documentFile.id,
          'KNOWLEDGE_EXPORT_DOCUMENT_URL_MISSING', '生成されたGoogle Docのリンクを確認できません。');
        return {
          id: documentFile.id,
          name: documentFile.name || input.filename,
          url: 'https://docs.google.com/document/d/' + documentFile.id + '/edit',
          warnings: []
        };
      }

      var pdfBlob = kspExportKnowledgeDocumentPdf_(temporaryDocumentId);
      var pdfFile = Drive.Files.create({
        name: String(input.filename),
        mimeType: 'application/pdf',
        parents: [input.folderId]
      }, pdfBlob, {
        supportsAllDrives: true,
        fields: 'id,name,mimeType,webViewLink,parents,trashed,size'
      });
      pdfFileId = pdfFile.id;
      kspAssertKnowledgeExportCreatedFile_(
        pdfFile, input.folderId, 'application/pdf', 'KNOWLEDGE_EXPORT_PDF_CREATE_FAILED'
      );
      kspAssert_(pdfFile.id, 'KNOWLEDGE_EXPORT_PDF_URL_MISSING', '生成されたPDFのリンクを確認できません。');

      var warnings = [];
      try {
        kspTrashKnowledgeExportFile_(temporaryDocumentId);
      } catch (cleanupError) {
        warnings.push({
          code: 'KNOWLEDGE_EXPORT_TEMP_DOCUMENT_CLEANUP_FAILED',
          message: 'PDFは作成されましたが、一時Google Docを自動削除できませんでした。'
        });
      }
      temporaryDocumentId = '';
      return {
        id: pdfFile.id,
        name: pdfFile.name || input.filename,
        url: 'https://drive.google.com/open?id=' + pdfFile.id,
        warnings: warnings
      };
    } catch (error) {
      if (pdfFileId) {
        try { kspTrashKnowledgeExportFile_(pdfFileId); } catch (ignoredPdfCleanup) { /* Preserve original error. */ }
      }
      if (temporaryDocumentId) {
        try { kspTrashKnowledgeExportFile_(temporaryDocumentId); } catch (ignoredDocumentCleanup) { /* Preserve original error. */ }
      }
      error.code = error.code || 'KNOWLEDGE_EXPORT_ARTIFACT_CREATE_FAILED';
      throw error;
    }
  };

  return environment;
}

function kspExportKnowledgeDocumentPdf_(documentId) {
  kspAssert_(documentId, 'KNOWLEDGE_EXPORT_DOCUMENT_ID_MISSING',
    'PDF変換対象のGoogle Docを確認できません。');
  var url = 'https://www.googleapis.com/drive/v3/files/' + encodeURIComponent(documentId) +
    '/export?mimeType=' + encodeURIComponent('application/pdf');
  var response = UrlFetchApp.fetch(url, {
    method: 'get',
    headers: {
      Authorization: 'Bearer ' + ScriptApp.getOAuthToken()
    },
    muteHttpExceptions: true
  });
  var responseCode = response.getResponseCode();
  kspAssert_(responseCode >= 200 && responseCode < 300,
    'KNOWLEDGE_EXPORT_PDF_EXPORT_FAILED', 'Google DocをPDFへ変換できませんでした。');
  var blob = response.getBlob();
  kspAssert_(blob && blob.getBytes && blob.getBytes().length > 0,
    'KNOWLEDGE_EXPORT_PDF_EMPTY', 'PDFの内容が空です。');
  return blob;
}

function kspValidateKnowledgeExportFolder_(folderId, expectedParentId) {
  kspAssert_(folderId && expectedParentId, 'KNOWLEDGE_EXPORTS_FOLDER_INVALID',
    'Knowledge Exportsフォルダの親境界を確認できません。');
  var folder = Drive.Files.get(folderId, {
    supportsAllDrives: true,
    fields: 'id,mimeType,parents,trashed'
  });
  kspAssert_(folder && !folder.trashed && folder.mimeType === KSP_MIME_TYPES.FOLDER &&
    (folder.parents || []).indexOf(expectedParentId) !== -1,
    'KNOWLEDGE_EXPORTS_FOLDER_INVALID',
    'Knowledge Exportsフォルダが設定された親フォルダ直下にありません。');
  return folder;
}

function kspAssertKnowledgeExportCreatedFile_(file, folderId, expectedMimeType, errorCode) {
  kspAssert_(file && file.id && file.mimeType === expectedMimeType && !file.trashed &&
    (file.parents || []).indexOf(folderId) !== -1,
    errorCode || 'KNOWLEDGE_EXPORT_ARTIFACT_CREATE_FAILED',
    '生成された書き出しファイルの境界を確認できません。');
}

function kspWriteKnowledgeExportDocument_(documentId, model) {
  var document = DocumentApp.openById(documentId);
  var body = document.getBody();
  body.clear();
  kspAppendKnowledgeExportParagraph_(body, String(model.title || 'Knowledge Export'))
    .setHeading(DocumentApp.ParagraphHeading.TITLE);
  (model.headerLines || []).forEach(function (line) {
    kspAppendKnowledgeExportParagraph_(body, String(line));
  });

  var sections = model.meetingSections || [];
  sections.forEach(function (section, index) {
    if (index > 0) body.appendPageBreak();
    kspAppendKnowledgeExportParagraph_(body, String(section.heading || 'Meeting'))
      .setHeading(DocumentApp.ParagraphHeading.HEADING1);
    (section.metadataLines || []).forEach(function (line) {
      kspAppendKnowledgeExportParagraph_(body, String(line));
    });
    kspAppendKnowledgeExportParagraph_(body, String(section.body || ''));
  });

  // Full Output is Meeting-only, including the generated Docs/PDF artifact.
  document.saveAndClose();
}

function kspAppendKnowledgeExportParagraph_(body, value) {
  var text = String(value || '');
  var paragraph = body.appendParagraph(text);
  var editable = paragraph.editAsText();
  var linkPattern = /https?:\/\/[^\s)]+/g;
  var match;
  while ((match = linkPattern.exec(text)) !== null) {
    var link = match[0];
    var end = link.length - 1;
    while (end >= 0 && /[.,;:!?]$/.test(link.substring(0, end + 1))) end -= 1;
    if (end >= 0) editable.setLinkUrl(match.index, match.index + end, link.substring(0, end + 1));
  }
  return paragraph;
}

function kspTrashKnowledgeExportFile_(fileId) {
  kspAssert_(fileId, 'KNOWLEDGE_EXPORT_FILE_ID_MISSING', '書き出しファイルIDがありません。');
  Drive.Files.update({ trashed: true }, fileId, null, {
    supportsAllDrives: true,
    fields: 'id,trashed'
  });
}
// ===== END src/157_KnowledgeExportLiveEnvironment.gs =====

// ===== BEGIN src/160_AiEnvironment.gs =====
function kspCreateAiEnvironment_() {
  var base = kspCreateMaintenanceEnvironment_();
  var scriptProperties = PropertiesService.getScriptProperties();

  base.loadAiContext = function () {
    var state = base.getInstallationState();
    kspAssert_(state && state.resources, 'INSTALLATION_STATE_MISSING', 'Installation stateがありません。');
    var backendSpreadsheetId = state.resources[KSP_RESOURCE_KEYS.BACKEND_SPREADSHEET];
    var auditSpreadsheetId = state.resources[KSP_RESOURCE_KEYS.AUDIT_SPREADSHEET];
    kspAssert_(backendSpreadsheetId, 'BACKEND_SPREADSHEET_MISSING', 'Backend Spreadsheetがありません。');
    kspAssert_(auditSpreadsheetId, 'AUDIT_SPREADSHEET_MISSING', 'Audit Spreadsheetがありません。');
    return {
      state: state,
      backendSpreadsheetId: backendSpreadsheetId,
      auditSpreadsheetId: auditSpreadsheetId,
      settings: kspReadSettingsMapLive_(backendSpreadsheetId),
      meetingRows: base.readRows(backendSpreadsheetId, KSP_SHEET_NAMES.MEETING_INDEX),
      pitchbookRows: base.readRows(backendSpreadsheetId, KSP_SHEET_NAMES.PITCHBOOK_INDEX),
      counterpartyRows: base.readRows(backendSpreadsheetId, KSP_SHEET_NAMES.COUNTERPARTY_MASTER),
      optionRows: base.readRows(backendSpreadsheetId, KSP_SHEET_NAMES.OPTION_MASTER)
    };
  };

  base.ensureAiSettings = function (rows) {
    var state = base.getInstallationState();
    var spreadsheetId = state.resources[KSP_RESOURCE_KEYS.BACKEND_SPREADSHEET];
    return kspUpsertMissingSettingsLive_(spreadsheetId, rows || []);
  };

  base.saveOpenAiApiKey = function (value) {
    var key = kspAiTrim_(value);
    kspAssert_(key && key.length <= 512, 'OPENAI_API_KEY_INVALID', 'OpenAI API key is invalid.');
    scriptProperties.setProperty(KSP_AI_PROPERTY_KEYS.OPENAI_API_KEY, key);
    return true;
  };

  base.saveGeminiApiKey = function (value) {
    var key = kspAiTrim_(value);
    kspAssert_(key && key.length <= 512, 'GEMINI_API_KEY_INVALID', 'Gemini API key is invalid.');
    scriptProperties.setProperty(KSP_AI_PROPERTY_KEYS.API_KEY, key);
    return true;
  };

  base.ensureFileSearchStore = function (settings, displayName) {
    if (settings.storeName) return base.getFileSearchStore(settings.storeName);
    var created = base.createFileSearchStore(
      kspBuildFileSearchStoreCreateRequest_(displayName, settings.embeddingModel)
    );
    kspWriteSettingLive_(
      base.getInstallationState().resources[KSP_RESOURCE_KEYS.BACKEND_SPREADSHEET],
      KSP_AI_SETTINGS.STORE_NAME,
      created.name,
      base.nowIso()
    );
    return created;
  };

  base.getFileSearchStore = function (storeName) {
    try {
      return kspNormalizeFileSearchStore_(kspGeminiJsonRequestLive_('GET', '/' + kspAiStoreResourcePath_(storeName), null, {
        retryPolicy: KSP_GEMINI_RETRY_POLICIES.IDEMPOTENT,
        stage: 'STORE_READ', errorCode: 'AI_STORE_READ_FAILED'
      }));
    } catch (error) {
      if (error && (error.code === 'AI_STORE_READ_FAILED' || error.code === 'AI_CREDENTIAL_NOT_CONFIGURED')) throw error;
      throw kspGeminiStageError_('AI_STORE_READ_FAILED', 'STORE_READ', 0, {}, false);
    }
  };

  base.createFileSearchStore = function (request) {
    try {
      return kspNormalizeFileSearchStore_(kspGeminiJsonRequestLive_('POST', KSP_AI_API.STORES_PATH, request, {
        retryPolicy: KSP_GEMINI_RETRY_POLICIES.MUTATING_CREATE,
        stage: 'STORE_CREATE', errorCode: 'AI_STORE_CREATE_FAILED'
      }));
    } catch (error) {
      if (error && (error.code === 'AI_STORE_CREATE_FAILED' || error.code === 'AI_CREDENTIAL_NOT_CONFIGURED')) throw error;
      throw kspGeminiStageError_('AI_STORE_CREATE_FAILED', 'STORE_CREATE', 0, {}, false);
    }
  };

  base.findFileSearchDocumentsBySource = function (storeName, sourceId) {
    return kspListAllFileSearchDocumentsLive_(storeName).filter(function (documentValue) {
      return String(documentValue.customMetadata.source_id || '') === String(sourceId);
    });
  };

  base.deleteFileSearchDocument = function (storeName, documentName) {
    var normalizedStore = kspAiStoreResourcePath_(storeName);
    var name = kspAiTrim_(documentName);
    kspAssert_(name.indexOf(normalizedStore + '/documents/') === 0, 'AI_DOCUMENT_STORE_MISMATCH',
      'File Search Document does not belong to the configured Store.');
    kspGeminiJsonRequestLive_('DELETE', '/' + name + '?force=true', null, {
      retryPolicy: KSP_GEMINI_RETRY_POLICIES.IDEMPOTENT,
      stage: 'DOCUMENT_DELETE', errorCode: 'AI_DOCUMENT_DELETE_FAILED'
    });
    return true;
  };

  base.listGeminiModels = function () {
    return kspGeminiJsonRequestLive_('GET', '/models?pageSize=1000', null, {
      retryPolicy: KSP_GEMINI_RETRY_POLICIES.IDEMPOTENT,
      stage: 'MODELS_LIST', errorCode: 'AI_GEMINI_MODELS_LIST_FAILED'
    });
  };

  base.deleteFileSearchStore = function (storeName) {
    var normalizedStore = kspAiStoreResourcePath_(storeName);
    kspGeminiJsonRequestLive_('DELETE', '/' + normalizedStore + '?force=true', null, {
      retryPolicy: KSP_GEMINI_RETRY_POLICIES.IDEMPOTENT,
      stage: 'STORE_DELETE', errorCode: 'AI_STORE_DELETE_FAILED'
    });
    return true;
  };

  base.confirmFileSearchStoreDeleted = function (storeName) {
    var normalizedStore = kspAiStoreResourcePath_(storeName);
    try {
      kspGeminiJsonRequestLive_('GET', '/' + normalizedStore, null, {
        retryPolicy: KSP_GEMINI_RETRY_POLICIES.IDEMPOTENT,
        stage: 'STORE_DELETE_CONFIRM', errorCode: 'AI_STORE_DELETE_CONFIRM_FAILED'
      });
      return false;
    } catch (error) {
      return Number(error && error.httpStatus || 0) === 404;
    }
  };

  base.uploadSourceToFileSearchStore = function (storeName, source) {
    return kspUploadSourceLive_(storeName, source);
  };

  base.startQueryFileSearch = function (request) {
    return kspGeminiStartInteractionLive_(request);
  };

  base.pollQueryFileSearch = function (interactionId) {
    return kspGeminiPollInteractionLive_(interactionId);
  };

  base.queryFileSearch = function (request) {
    return kspGeminiQueryInteractionLive_(request);
  };

  base.queryGeminiInteraction = function (request) {
    return kspGeminiQueryInteractionLive_(request);
  };

  base.readMeetingText = function (fileId) {
    kspAssert_(fileId, 'AI_MEETING_DOC_MISSING', 'Meeting Google Docがありません。');
    return DocumentApp.openById(fileId).getBody().getText();
  };

  base.readTextFile = function (fileId) {
    kspAssert_(fileId, 'AI_PITCHBOOK_FILE_MISSING', 'Pitchbook source fileがありません。');
    var response = UrlFetchApp.fetch('https://www.googleapis.com/drive/v3/files/' + encodeURIComponent(fileId) + '?alt=media', {
      method: 'get',
      headers: { Authorization: 'Bearer ' + ScriptApp.getOAuthToken() },
      muteHttpExceptions: true
    });
    kspAssert_(response.getResponseCode() >= 200 && response.getResponseCode() < 300,
      'AI_SOURCE_READ_FAILED', 'TXT sourceを読み込めませんでした。');
    return response.getContentText('UTF-8');
  };

  base.hashText = function (text) {
    var digest = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, String(text || ''), Utilities.Charset.UTF_8);
    return digest.map(function (value) { return ('0' + ((value + 256) % 256).toString(16)).slice(-2); }).join('');
  };

  base.updateAiRow = function (sourceType, sourceId, patch) {
    var context = base.loadAiContext();
    var sheetName = sourceType === KSP_AI_SOURCE_TYPES.MEETING
      ? KSP_SHEET_NAMES.MEETING_INDEX
      : KSP_SHEET_NAMES.PITCHBOOK_INDEX;
    var keyColumn = sourceType === KSP_AI_SOURCE_TYPES.MEETING ? 'Meeting_ID' : 'Document_ID';
    return kspUpdateRowPatchLive_(context.backendSpreadsheetId, sheetName, keyColumn, sourceId, patch);
  };

  base.claimAiSource = function (sourceType, sourceId, nowIso, ttlMillis) {
    return kspClaimAiSourceLive_(scriptProperties, sourceType, sourceId, nowIso, ttlMillis);
  };

  base.releaseAiSourceClaim = function (sourceType, sourceId, token) {
    return kspReleaseAiSourceClaimLive_(scriptProperties, sourceType, sourceId, token);
  };

  base.appendAuditRow = function (spreadsheetId, row) {
    return base.appendRow(spreadsheetId, KSP_SHEET_NAMES.AUDIT_LOG, row);
  };

  return base;
}
// ===== END src/160_AiEnvironment.gs =====

