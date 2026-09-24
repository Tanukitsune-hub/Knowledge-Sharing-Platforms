var KSP_THEME_SETTINGS_PROPERTY_KEY = 'KSP_THEME_SETTINGS_V1';
var KSP_THEME_SETTINGS_SCHEMA_VERSION = 1;

var KSP_THEME_TOKEN_DEFINITIONS = Object.freeze([
  { key: 'sidebar.background', group: 'Sidebar', label: 'Sidebar 背景', colorName: 'Charcoal Navy Slate', cssVariable: '--theme-sidebar-background', defaultHex: '#2D3E49' },
  { key: 'sidebar.text', group: 'Sidebar', label: 'Sidebar 文字', colorName: 'Warm Ivory Gold', cssVariable: '--theme-sidebar-text', defaultHex: '#EADDBF' },
  { key: 'sidebar.gold', group: 'Sidebar', label: 'Sidebar Goldアクセント', colorName: 'Antique Gold', cssVariable: '--theme-sidebar-gold', defaultHex: '#D7AE42' },
  { key: 'sidebar.activeBackground', group: 'Sidebar', label: 'Sidebar 選択中背景', colorName: 'Deep Corporate Red', cssVariable: '--theme-sidebar-active-background', defaultHex: '#B5121B' },
  { key: 'sidebar.activeAccent', group: 'Sidebar', label: 'Sidebar 選択中アクセント', colorName: 'Signal Red', cssVariable: '--theme-sidebar-active-accent', defaultHex: '#E02A36' },
  { key: 'main.pageBackground', group: 'Main', label: 'Main ページ背景', colorName: 'Executive Mist Slate', cssVariable: '--theme-main-page-background', defaultHex: '#E7EDF2' },
  { key: 'main.cardBackground', group: 'Main', label: 'Main Card背景', colorName: 'Slate White', cssVariable: '--theme-main-card-background', defaultHex: '#F8FAFB' },
  { key: 'main.sectionHeader', group: 'Main', label: 'Main Section見出し背景', colorName: 'Executive Slate Header', cssVariable: '--theme-main-section-header', defaultHex: '#CDD9E2' },
  { key: 'main.border', group: 'Main', label: 'Main Border', colorName: 'Cool Steel Border', cssVariable: '--theme-main-border', defaultHex: '#BBC9D3' },
  { key: 'text.primary', group: 'Text', label: 'Text メイン文字', colorName: 'Executive Ink', cssVariable: '--theme-text-primary', defaultHex: '#263B49' },
  { key: 'text.secondary', group: 'Text', label: 'Text 補助文字', colorName: 'Muted Slate', cssVariable: '--theme-text-secondary', defaultHex: '#5A6D79' },
  { key: 'action.primary', group: 'Action', label: 'Action Primary button', colorName: 'Executive Steel Blue', cssVariable: '--theme-action-primary', defaultHex: '#405F72' },
  { key: 'action.secondary', group: 'Action', label: 'Action Secondary button', colorName: 'Pale Slate Blue', cssVariable: '--theme-action-secondary', defaultHex: '#DCE5EB' },
  { key: 'state.success', group: 'State', label: 'State Success', colorName: 'Institutional Green', cssVariable: '--theme-state-success', defaultHex: '#1F7A52' },
  { key: 'state.warning', group: 'State', label: 'State Warning', colorName: 'Muted Amber', cssVariable: '--theme-state-warning', defaultHex: '#8B6515' },
  { key: 'state.error', group: 'State', label: 'State Error', colorName: 'Controlled Red', cssVariable: '--theme-state-error', defaultHex: '#B42630' }
]);

var KSP_THEME_DERIVED_RULES = Object.freeze([
  { key: 'main.surfaceSoft', sourceKey: 'main.cardBackground', cssVariable: '--theme-main-surface-soft', defaultHex: '#EEF3F6' },
  { key: 'main.sectionHeaderTop', sourceKey: 'main.sectionHeader', cssVariable: '--theme-main-section-header-top', defaultHex: '#D7E1E8' },
  { key: 'main.sectionHeaderStrong', sourceKey: 'main.sectionHeader', cssVariable: '--theme-main-section-header-strong', defaultHex: '#BECDD8' },
  { key: 'main.borderStrong', sourceKey: 'main.border', cssVariable: '--theme-main-border-strong', defaultHex: '#A3B5C1' },
  { key: 'text.inkSoft', sourceKey: 'text.primary', cssVariable: '--theme-text-ink-soft', defaultHex: '#4A6170' },
  { key: 'action.primaryDark', sourceKey: 'action.primary', cssVariable: '--theme-action-primary-dark', defaultHex: '#2F4B5D' },
  { key: 'action.primaryTop', sourceKey: 'action.primary', cssVariable: '--theme-action-primary-top', defaultHex: '#526F81' },
  { key: 'action.primaryHover', sourceKey: 'action.primary', cssVariable: '--theme-action-primary-hover', defaultHex: '#607D8D' },
  { key: 'focus.ring', sourceKey: 'action.primary', cssVariable: '--theme-focus-ring', defaultHex: '#6C8798' },
  { key: 'action.primarySoft', sourceKey: 'action.secondary', cssVariable: '--theme-action-primary-soft', defaultHex: '#DCE6EC' },
  { key: 'state.successSoft', sourceKey: 'state.success', cssVariable: '--theme-state-success-soft', defaultHex: '#E4F3EB' },
  { key: 'state.warningSoft', sourceKey: 'state.warning', cssVariable: '--theme-state-warning-soft', defaultHex: '#F8F0D8' },
  { key: 'state.errorSoft', sourceKey: 'state.error', cssVariable: '--theme-state-error-soft', defaultHex: '#F9E8EA' },
  { key: 'sidebar.goldHighlight', sourceKey: 'sidebar.gold', cssVariable: '--theme-sidebar-gold-highlight', defaultHex: '#FFE89A' },
  { key: 'sidebar.goldMid', sourceKey: 'sidebar.gold', cssVariable: '--theme-sidebar-gold-mid', defaultHex: '#C58C25' },
  { key: 'sidebar.goldDeep', sourceKey: 'sidebar.gold', cssVariable: '--theme-sidebar-gold-deep', defaultHex: '#70480D' },
  { key: 'sidebar.goldBrandTop', sourceKey: 'sidebar.gold', cssVariable: '--theme-sidebar-gold-brand-top', defaultHex: '#FFF4BF' },
  { key: 'sidebar.goldBrandMiddle', sourceKey: 'sidebar.gold', cssVariable: '--theme-sidebar-gold-brand-middle', defaultHex: '#EBCB67' },
  { key: 'sidebar.goldBrandBottom', sourceKey: 'sidebar.gold', cssVariable: '--theme-sidebar-gold-brand-bottom', defaultHex: '#A66E18' },
  { key: 'sidebar.goldNavIcon', sourceKey: 'sidebar.gold', cssVariable: '--theme-sidebar-gold-nav-icon', defaultHex: '#F0CF69' },
  { key: 'sidebar.goldNavHover', sourceKey: 'sidebar.gold', cssVariable: '--theme-sidebar-gold-nav-hover', defaultHex: '#FFE999' },
  { key: 'sidebar.goldTextMuted', sourceKey: 'sidebar.gold', cssVariable: '--theme-sidebar-gold-text-muted', defaultHex: '#D8BD7B' },
  { key: 'sidebar.goldTextHover', sourceKey: 'sidebar.gold', cssVariable: '--theme-sidebar-gold-text-hover', defaultHex: '#FFF2C3' },
  { key: 'sidebar.activeDeep', sourceKey: 'sidebar.activeBackground', cssVariable: '--theme-sidebar-active-deep', defaultHex: '#751017' }
]);

function kspThemeDefaultPalette_() {
  var output = {};
  KSP_THEME_TOKEN_DEFINITIONS.forEach(function (definition) {
    output[definition.key] = definition.defaultHex;
  });
  return output;
}

function kspThemeNormalizeHex_(value) {
  var normalized = String(value === undefined || value === null ? '' : value).trim().toUpperCase();
  kspAssert_(/^#[0-9A-F]{6}$/.test(normalized), 'THEME_HEX_INVALID', '色は#RRGGBB形式で入力してください。');
  return normalized;
}

function kspThemeNormalizePalette_(palette) {
  kspAssert_(palette && typeof palette === 'object' && !Array.isArray(palette),
    'THEME_PALETTE_INVALID', 'テーマ設定を確認できませんでした。');
  var expectedKeys = KSP_THEME_TOKEN_DEFINITIONS.map(function (definition) { return definition.key; });
  var actualKeys = Object.keys(palette);
  kspAssert_(actualKeys.length === expectedKeys.length && actualKeys.every(function (key) {
    return expectedKeys.indexOf(key) !== -1;
  }), 'THEME_PALETTE_INVALID', 'テーマ設定は基本16色をすべて指定してください。');
  var normalized = {};
  expectedKeys.forEach(function (key) { normalized[key] = kspThemeNormalizeHex_(palette[key]); });
  return normalized;
}

function kspThemeHexChannels_(hex) {
  var normalized = kspThemeNormalizeHex_(hex);
  return [parseInt(normalized.slice(1, 3), 16), parseInt(normalized.slice(3, 5), 16), parseInt(normalized.slice(5, 7), 16)];
}

function kspThemeChannelsHex_(channels) {
  return '#' + channels.map(function (channel) {
    var bounded = Math.max(0, Math.min(255, Math.round(Number(channel) || 0)));
    return ('0' + bounded.toString(16).toUpperCase()).slice(-2);
  }).join('');
}

function kspThemeDerivedHex_(sourceHex, sourceDefaultHex, targetDefaultHex) {
  var source = kspThemeHexChannels_(sourceHex);
  var sourceDefault = kspThemeHexChannels_(sourceDefaultHex);
  var targetDefault = kspThemeHexChannels_(targetDefaultHex);
  return kspThemeChannelsHex_(source.map(function (channel, index) {
    return channel + targetDefault[index] - sourceDefault[index];
  }));
}

function kspThemeCssVariables_(palette) {
  var normalized = kspThemeNormalizePalette_(palette);
  var defaults = kspThemeDefaultPalette_();
  var output = {};
  KSP_THEME_TOKEN_DEFINITIONS.forEach(function (definition) {
    output[definition.cssVariable] = normalized[definition.key];
  });
  KSP_THEME_DERIVED_RULES.forEach(function (rule) {
    output[rule.cssVariable] = kspThemeDerivedHex_(
      normalized[rule.sourceKey], defaults[rule.sourceKey], rule.defaultHex);
  });
  return output;
}

function kspThemeStoredUpdatedAt_(value) {
  var text = String(value || '');
  kspAssert_(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(text) && !isNaN(Date.parse(text)),
    'THEME_SETTINGS_INVALID', '保存済みテーマ設定を確認できませんでした。');
  return text;
}

function kspThemeParseStoredSettings_(raw) {
  var defaults = kspThemeDefaultPalette_();
  if (!raw) return { palette: defaults, persisted: false, updatedAt: '', corruptOverrideIgnored: false };
  try {
    var parsed = JSON.parse(String(raw));
    kspAssert_(parsed && typeof parsed === 'object' && !Array.isArray(parsed),
      'THEME_SETTINGS_INVALID', '保存済みテーマ設定を確認できませんでした。');
    var keys = Object.keys(parsed);
    kspAssert_(keys.length === 3 && ['schemaVersion', 'palette', 'updatedAt'].every(function (key) {
      return keys.indexOf(key) !== -1;
    }), 'THEME_SETTINGS_INVALID', '保存済みテーマ設定を確認できませんでした。');
    kspAssert_(Number(parsed.schemaVersion) === KSP_THEME_SETTINGS_SCHEMA_VERSION,
      'THEME_SETTINGS_INVALID', '保存済みテーマ設定を確認できませんでした。');
    return {
      palette: kspThemeNormalizePalette_(parsed.palette),
      persisted: true,
      updatedAt: kspThemeStoredUpdatedAt_(parsed.updatedAt),
      corruptOverrideIgnored: false
    };
  } catch (ignored) {
    return { palette: defaults, persisted: false, updatedAt: '', corruptOverrideIgnored: true };
  }
}

function kspThemeReadState_(environment) {
  kspAssert_(environment && typeof environment.readThemeSettings === 'function',
    'THEME_STORAGE_UNAVAILABLE', 'テーマ設定を読み込めませんでした。');
  return kspThemeParseStoredSettings_(environment.readThemeSettings());
}

function kspThemeSafeDefinitions_() {
  return KSP_THEME_TOKEN_DEFINITIONS.map(function (definition) {
    return {
      key: definition.key,
      group: definition.group,
      label: definition.label,
      colorName: definition.colorName,
      cssVariable: definition.cssVariable,
      defaultHex: definition.defaultHex
    };
  });
}

function kspThemeSafeDerivedRules_() {
  var defaults = kspThemeDefaultPalette_();
  return KSP_THEME_DERIVED_RULES.map(function (rule) {
    return {
      sourceKey: rule.sourceKey,
      sourceDefaultHex: defaults[rule.sourceKey],
      cssVariable: rule.cssVariable,
      defaultHex: rule.defaultHex
    };
  });
}

function kspThemeStateResponse_(state) {
  return {
    ok: true,
    workId: '0045',
    schemaVersion: KSP_THEME_SETTINGS_SCHEMA_VERSION,
    palette: kspDeepClone_(state.palette),
    defaults: kspThemeDefaultPalette_(),
    persisted: Boolean(state.persisted),
    updatedAt: String(state.updatedAt || ''),
    corruptOverrideIgnored: Boolean(state.corruptOverrideIgnored),
    definitions: kspThemeSafeDefinitions_(),
    derivedRules: kspThemeSafeDerivedRules_()
  };
}

function kspGetThemeSettingsData_(environment) {
  try {
    return kspThemeStateResponse_(kspThemeReadState_(environment));
  } catch (ignored) {
    return {
      ok: false,
      workId: '0045',
      error: { code: 'THEME_STORAGE_UNAVAILABLE', message: 'テーマ設定を読み込めませんでした。' }
    };
  }
}

function kspThemeMutationFailure_(error) {
  var code = kspGetErrorCode_(error, 'THEME_SETTINGS_UPDATE_FAILED');
  var message = code === 'THEME_HEX_INVALID' ? '色は#RRGGBB形式で入力してください。'
    : code === 'THEME_PALETTE_INVALID' ? 'テーマ設定は基本16色をすべて指定してください。'
      : code === 'THEME_ACTION_INVALID' ? 'テーマ設定の操作が不正です。'
        : 'テーマ設定を更新できませんでした。';
  return { ok: false, workId: '0045', error: { code: code, message: message } };
}

function kspMutateThemeSettings_(environment, input) {
  var action = String(input && input.action || '').trim().toUpperCase();
  try {
    kspAssert_(action === 'SAVE' || action === 'RESET', 'THEME_ACTION_INVALID', 'Theme action is invalid.');
    kspAssert_(environment && typeof environment.withThemeSettingsLock === 'function',
      'THEME_STORAGE_UNAVAILABLE', 'Theme settings lock is unavailable.');
    return environment.withThemeSettingsLock(function () {
      if (action === 'RESET') {
        environment.deleteThemeSettings();
        return kspThemeStateResponse_(kspThemeReadState_(environment));
      }
      var palette = kspThemeNormalizePalette_(input && input.palette);
      var stored = {
        schemaVersion: KSP_THEME_SETTINGS_SCHEMA_VERSION,
        palette: palette,
        updatedAt: String(environment.nowIso())
      };
      kspThemeStoredUpdatedAt_(stored.updatedAt);
      environment.writeThemeSettings(JSON.stringify(stored));
      return kspThemeStateResponse_(kspThemeReadState_(environment));
    });
  } catch (error) {
    return kspThemeMutationFailure_(error);
  }
}

function kspCreateThemeSettingsEnvironment_() {
  var properties = PropertiesService.getScriptProperties();
  return {
    readThemeSettings: function () {
      return properties.getProperty(KSP_THEME_SETTINGS_PROPERTY_KEY) || '';
    },
    writeThemeSettings: function (value) {
      properties.setProperty(KSP_THEME_SETTINGS_PROPERTY_KEY, String(value));
    },
    deleteThemeSettings: function () {
      properties.deleteProperty(KSP_THEME_SETTINGS_PROPERTY_KEY);
    },
    withThemeSettingsLock: function (callback) {
      var lock = LockService.getScriptLock();
      lock.waitLock(KSP_DEFAULTS.LOCK_TIMEOUT_MS);
      try { return callback(); }
      finally { lock.releaseLock(); }
    },
    nowIso: function () { return new Date().toISOString(); }
  };
}

function kspThemeCssDeclarations_(palette) {
  var variables = kspThemeCssVariables_(palette);
  return Object.keys(variables).map(function (name) { return name + ':' + variables[name]; }).join(';');
}

function kspThemeBootstrapJson_(state) {
  return JSON.stringify(kspThemeStateResponse_(state))
    .replace(/</g, '\\u003C').replace(/>/g, '\\u003E').replace(/&/g, '\\u0026')
    .replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');
}

function kspGetThemeHeadMarkup_() {
  var state;
  try { state = kspThemeReadState_(kspCreateThemeSettingsEnvironment_()); }
  catch (ignored) { state = kspThemeParseStoredSettings_(''); }
  return '<style id="ksp-initial-theme">:root{' + kspThemeCssDeclarations_(state.palette) + '}</style>' +
    '<script id="ksp-theme-bootstrap" type="application/json">' + kspThemeBootstrapJson_(state) + '</script>';
}
