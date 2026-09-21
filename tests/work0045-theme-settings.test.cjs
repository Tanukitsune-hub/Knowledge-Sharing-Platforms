const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const read = relative => fs.readFileSync(path.join(root, relative), 'utf8');
const registry = JSON.parse(read('docs/design/theme-palette-tokens.json'));

function loadTheme() {
  const context = {
    kspAssert_(condition, code, message) {
      if (!condition) {
        const error = new Error(message || code);
        error.code = code;
        throw error;
      }
    },
    kspDeepClone_: value => JSON.parse(JSON.stringify(value)),
    kspGetErrorCode_: (error, fallback) => error && error.code || fallback
  };
  vm.createContext(context);
  vm.runInContext(read('src/166_ThemeSettings.gs'), context, { filename: '166_ThemeSettings.gs' });
  return context;
}

function plain(value) { return JSON.parse(JSON.stringify(value)); }

function fakeEnvironment(initial = '') {
  let raw = initial;
  const writes = [];
  const deletes = [];
  return {
    readThemeSettings() { return raw; },
    writeThemeSettings(value) { raw = String(value); writes.push(raw); },
    deleteThemeSettings() { raw = ''; deletes.push(true); },
    withThemeSettingsLock(callback) { return callback(); },
    nowIso() { return '2026-09-21T12:34:56.000Z'; },
    _debug: { writes, deletes, raw: () => raw }
  };
}

test('source defaults are the exact 16 accepted Work0044 registry values', () => {
  const theme = loadTheme();
  const defaults = plain(theme.kspThemeDefaultPalette_());
  assert.equal(Object.keys(defaults).length, 16);
  assert.deepEqual(defaults, Object.fromEntries(registry.user_adjustable_tokens.map(item => [item.key, item.hex])));
  const css = read('src/Styles.html');
  for (const definition of plain(theme.KSP_THEME_TOKEN_DEFINITIONS)) {
    assert.ok(css.includes(`${definition.cssVariable}:${definition.defaultHex}`), definition.key);
  }
  const derived = Object.fromEntries(registry.derived_tokens.map(item => [item.key, item.hex]));
  const variables = plain(theme.kspThemeCssVariables_(defaults));
  for (const rule of plain(theme.KSP_THEME_DERIVED_RULES).filter(item => Object.hasOwn(derived, item.key))) {
    assert.equal(variables[rule.cssVariable], derived[rule.key], rule.key);
  }
});

test('palette normalization accepts complete lowercase HEX and rejects missing, unknown, or malformed values', () => {
  const theme = loadTheme();
  const defaults = plain(theme.kspThemeDefaultPalette_());
  const lowercase = Object.fromEntries(Object.entries(defaults).map(([key, value]) => [key, value.toLowerCase()]));
  assert.deepEqual(plain(theme.kspThemeNormalizePalette_(lowercase)), defaults);
  const missing = { ...defaults }; delete missing['state.error'];
  assert.throws(() => theme.kspThemeNormalizePalette_(missing), error => error.code === 'THEME_PALETTE_INVALID');
  assert.throws(() => theme.kspThemeNormalizePalette_({ ...defaults, unknown: '#000000' }), error => error.code === 'THEME_PALETTE_INVALID');
  assert.throws(() => theme.kspThemeNormalizePalette_({ ...defaults, 'state.error': 'red' }), error => error.code === 'THEME_HEX_INVALID');
});

test('stored override parser fails safely to source defaults without emitting arbitrary CSS', () => {
  const theme = loadTheme();
  const defaults = plain(theme.kspThemeDefaultPalette_());
  for (const raw of [
    '{not-json',
    JSON.stringify({ schemaVersion: 1, palette: { ...defaults, arbitrary: '#000000' }, updatedAt: '2026-09-21T00:00:00.000Z' }),
    JSON.stringify({ schemaVersion: 1, palette: { ...defaults, 'main.pageBackground': 'url(javascript:bad)' }, updatedAt: '2026-09-21T00:00:00.000Z' }),
    JSON.stringify({ schemaVersion: 1, palette: defaults })
  ]) {
    const state = plain(theme.kspThemeParseStoredSettings_(raw));
    assert.equal(state.persisted, false);
    assert.equal(state.corruptOverrideIgnored, true);
    assert.deepEqual(state.palette, defaults);
    assert.doesNotMatch(theme.kspThemeCssDeclarations_(state.palette), /url|javascript|arbitrary/i);
  }
});

test('shared save writes one normalized Script Properties JSON and reset deletes it', () => {
  const theme = loadTheme();
  const environment = fakeEnvironment();
  const defaults = plain(theme.kspThemeDefaultPalette_());
  const saved = plain(theme.kspMutateThemeSettings_(environment, { action: 'SAVE', palette: defaults }));
  assert.equal(saved.ok, true);
  assert.equal(saved.persisted, true);
  assert.equal(environment._debug.writes.length, 1);
  assert.deepEqual(JSON.parse(environment._debug.writes[0]), {
    schemaVersion: 1,
    palette: defaults,
    updatedAt: '2026-09-21T12:34:56.000Z'
  });
  const reset = plain(theme.kspMutateThemeSettings_(environment, { action: 'RESET' }));
  assert.equal(reset.ok, true);
  assert.equal(reset.persisted, false);
  assert.equal(environment._debug.deletes.length, 1);
  assert.equal(environment._debug.raw(), '');
});

test('invalid save is fail-closed and leaves the shared property unchanged', () => {
  const theme = loadTheme();
  const environment = fakeEnvironment();
  const defaults = plain(theme.kspThemeDefaultPalette_());
  const result = plain(theme.kspMutateThemeSettings_(environment, {
    action: 'SAVE', palette: { ...defaults, 'action.primary': '#12345Z' }
  }));
  assert.equal(result.ok, false);
  assert.equal(result.error.code, 'THEME_HEX_INVALID');
  assert.equal(environment._debug.writes.length, 0);
  assert.equal(environment._debug.raw(), '');
});

test('initial render injects validated variables and bootstrap data before body paint on both routes', () => {
  const webapp = read('src/90_WebApp.gs');
  const index = read('src/Index.html');
  const knowledge = read('src/KnowledgeSearch.html');
  assert.match(webapp, /knowledgeTemplate\.themeHeadMarkup\s*=\s*kspGetThemeHeadMarkup_\(\)/);
  assert.match(webapp, /indexTemplate\.themeHeadMarkup\s*=\s*kspGetThemeHeadMarkup_\(\)/);
  for (const template of [index, knowledge]) {
    assert.ok(template.indexOf("include_('Styles')") < template.indexOf('themeHeadMarkup'));
    assert.ok(template.indexOf('themeHeadMarkup') < template.indexOf('</head>'));
  }
  const theme = loadTheme();
  theme.PropertiesService = { getScriptProperties: () => ({ getProperty: () => '' }) };
  const markup = theme.kspGetThemeHeadMarkup_();
  assert.match(markup, /^<style id="ksp-initial-theme">:root\{/);
  assert.match(markup, /<script id="ksp-theme-bootstrap" type="application\/json">/);
  assert.doesNotMatch(markup, /undefined|javascript:/i);
});

test('admin theme UI has three accessible tabs, 16-field rendering, preview controls, and no browser persistence', () => {
  const page = read('src/AiProviderSettingsPage.html');
  const admin = read('src/ClientAiProviderSettings.html');
  const client = read('src/ClientThemeSettings.html');
  assert.equal((page.match(/data-admin-tab=/g) || []).length, 3);
  assert.match(page, />AIプロバイダ設定<\/button>[\s\S]*>削除記録の管理<\/button>[\s\S]*>テーマ設定<\/button>/);
  assert.match(page, /id="theme-settings-save"[\s\S]*>保存<\/button>/);
  assert.match(page, /id="theme-settings-discard"[\s\S]*>変更を破棄<\/button>/);
  assert.match(page, /id="theme-settings-reset"[\s\S]*>既定の配色に戻す<\/button>/);
  assert.match(admin, /const tabs=\['provider','deleted','theme'\]/);
  assert.match(admin, /\['ArrowLeft','ArrowRight','Home','End'\]/);
  assert.match(client, /themeSettingsState\.definitions\.forEach/);
  assert.match(client, /picker\.type='color'/);
  assert.match(client, /未保存のプレビュー/);
  assert.match(client, /mutateThemeSettings/);
  assert.doesNotMatch(client + page, /localStorage|UserProperties/);
});

test('bundle order and public surface include only the intended theme module and facades', () => {
  const order = JSON.parse(read('scripts/bundle-source-order.json'));
  assert.equal(order.serverSources.filter(name => name === '166_ThemeSettings.gs').length, 1);
  assert.equal(order.htmlResources.filter(name => name === 'ClientThemeSettings.html').length, 1);
  const surface = read('scripts/public-surface.cjs');
  assert.match(surface, /'getThemeSettingsData'/);
  assert.match(surface, /'mutateThemeSettings'/);
  const declarations = [...read('src/166_ThemeSettings.gs').matchAll(/^function\s+([A-Za-z_$][\w$]*)\s*\(/gm)].map(match => match[1]);
  assert.equal(declarations.every(name => name.endsWith('_')), true);
});
