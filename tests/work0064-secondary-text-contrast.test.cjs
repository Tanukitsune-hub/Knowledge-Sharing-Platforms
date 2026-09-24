const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const read = relative => fs.readFileSync(path.join(root, relative), 'utf8');
const plain = value => JSON.parse(JSON.stringify(value));
const server = {
  kspAssert_(condition, code, message) {
    if (!condition) throw Object.assign(new Error(message), { code });
  },
  kspDeepClone_: plain,
  kspGetErrorCode_: (error, fallback) => error && error.code || fallback
};
vm.createContext(server);
vm.runInContext(read('src/166_ThemeSettings.gs'), server);

const clientSource = read('src/ClientThemeSettings.html');
const clientBody = clientSource.slice(clientSource.indexOf('<script>') + 8,
  clientSource.lastIndexOf('themeSettingsState=themeSettingsBootstrap();'));
function clientFor(palette) {
  const statuses = [];
  const client = {
    statuses,
    showStatus(id, kind, message) { statuses.push({ id, kind, message }); },
    clearStatus(id) { statuses.push({ id, kind: 'clear', message: '' }); }
  };
  vm.createContext(client);
  vm.runInContext(clientBody, client);
  client.fixture = { ...plain(server.kspThemeStateResponse_({ palette, persisted: false,
    updatedAt: '', corruptOverrideIgnored: false })) };
  vm.runInContext('themeSettingsState=fixture;themeSettingsDraft=fixture.palette', client);
  return client;
}
function warningFor(palette) {
  const client = clientFor(palette);
  client.themeSettingsRenderContrast();
  return { text: client.statuses.at(-1).message, client };
}

test('secondary default is the minimum equal-channel darkening with three ratios above 4.5', () => {
  const defaults = plain(server.kspThemeDefaultPalette_());
  const css = read('src/Styles.html');
  assert.equal(defaults['text.secondary'], '#5A6D79');
  assert.match(css, /--theme-text-secondary:#5A6D79/);
  assert.match(css, /--muted:#5A6D79/);
  assert.match(css, /--rp-muted:#5a6d79/);
  const registry = JSON.parse(read('docs/design/theme-palette-tokens.json'));
  assert.equal(registry.user_adjustable_tokens.find(item => item.key === 'text.secondary').hex,
    defaults['text.secondary']);
  const backgrounds = {
    page: defaults['main.pageBackground'], card: defaults['main.cardBackground'],
    soft: server.kspThemeCssVariables_(defaults)['--theme-main-surface-soft']
  };
  const client = clientFor(defaults);
  const expected = { page: 4.5644766263, card: 5.1454814219, soft: 4.8191551951 };
  for (const [name, background] of Object.entries(backgrounds)) {
    const ratio = client.themeSettingsContrastRatio(defaults['text.secondary'], background);
    assert.ok(Math.abs(ratio - expected[name]) < 1e-8, `${name}: ${ratio}`);
    assert.ok(ratio >= 4.5, `${name}: ${ratio}`);
  }
  assert.ok(client.themeSettingsContrastRatio('#5B6E7A', backgrounds.page) < 4.5,
    'one step lighter on each channel misses the page threshold');
  assert.equal(warningFor(defaults).text, '', 'default produces no warning');
});

test('warning detects page, card, and derived soft surface from current draft', () => {
  const defaults = plain(server.kspThemeDefaultPalette_());
  const page = warningFor({ ...defaults, 'main.pageBackground': '#DDE6ED' }).text;
  assert.match(page, /補助文字 \/ ページ背景/);
  assert.doesNotMatch(page, /補助文字 \/ Card背景|補助文字 \/ soft surface/);

  const card = warningFor({ ...defaults, 'main.cardBackground': '#5A6D79' }).text;
  assert.match(card, /補助文字 \/ Card背景/);
  const softOnlyPalette = { ...defaults, 'main.cardBackground': '#E7EDF2' };
  const softClient = clientFor(softOnlyPalette);
  assert.equal(softClient.themeSettingsCssVariables(softOnlyPalette)['--theme-main-surface-soft'], '#DDE6ED');
  const soft = warningFor(softOnlyPalette).text;
  assert.match(soft, /補助文字 \/ soft surface/);
  assert.doesNotMatch(soft, /補助文字 \/ ページ背景|補助文字 \/ Card背景/);

  const all = warningFor({ ...defaults, 'text.secondary': '#F8FAFB' }).text;
  for (const label of ['補助文字 / ページ背景', '補助文字 / Card背景', '補助文字 / soft surface'])
    assert.ok(all.includes(label), label);
});

test('stored custom secondary stays unchanged and low contrast is advisory for save', () => {
  const defaults = plain(server.kspThemeDefaultPalette_());
  const palette = { ...defaults, 'text.secondary': '#6B7E8A' };
  let raw = JSON.stringify({ schemaVersion: 1, palette, updatedAt: '2026-09-24T00:00:00.000Z' });
  let writes = 0;
  const environment = {
    readThemeSettings() { return raw; },
    writeThemeSettings(value) { writes++; raw = value; },
    withThemeSettingsLock(callback) { return callback(); },
    nowIso() { return '2026-09-24T01:00:00.000Z'; }
  };
  const readback = plain(server.kspGetThemeSettingsData_(environment));
  assert.equal(readback.persisted, true);
  assert.equal(readback.palette['text.secondary'], '#6B7E8A');
  assert.equal(writes, 0, 'read does not migrate saved palette');
  assert.match(warningFor(readback.palette).text, /補助文字 \/ ページ背景/);
  const saved = plain(server.kspMutateThemeSettings_(environment, { action: 'SAVE', palette }));
  assert.equal(saved.ok, true);
  assert.equal(saved.palette['text.secondary'], '#6B7E8A');
  assert.equal(writes, 1, 'contrast warning does not block explicit save');
});
