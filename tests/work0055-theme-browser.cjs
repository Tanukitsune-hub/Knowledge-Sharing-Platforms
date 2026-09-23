// Synthetic browser rendering of the production Theme panel only.
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const out = process.env.KSP_UI_EVIDENCE_DIR
  ? path.resolve(process.env.KSP_UI_EVIDENCE_DIR)
  : path.join(os.tmpdir(), 'ksp-work0055-theme-browser');
const playwrightPath = process.env.KSP_PLAYWRIGHT_PATH || path.join(
  process.env.USERPROFILE, '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const { chromium } = require(playwrightPath);
const read = name => fs.readFileSync(path.join(root, 'src', name), 'utf8');
const hash = bytes => crypto.createHash('sha256').update(bytes).digest('hex');

const themeContext = {
  kspAssert_(condition, code, message) {
    if (!condition) { const error = new Error(message); error.code = code; throw error; }
  },
  kspDeepClone_: value => JSON.parse(JSON.stringify(value)),
  kspGetErrorCode_: (error, fallback) => error && error.code || fallback
};
vm.createContext(themeContext);
vm.runInContext(read('166_ThemeSettings.gs'), themeContext);
const themeState = themeContext.kspThemeStateResponse_({
  palette: themeContext.kspThemeDefaultPalette_(), persisted: false,
  updatedAt: '', corruptOverrideIgnored: false
});
const bootstrap = '<script id="ksp-theme-bootstrap" type="application/json">'
  + JSON.stringify(themeState).replace(/</g, '\\u003c') + '</script>';
const shim = `<script>
window.__themeCalls=[];
function showStatus(id,kind,message){const node=document.getElementById(id);node.className='status '+kind+' visible';node.textContent=message}
function clearStatus(id){const node=document.getElementById(id);node.className='status';node.textContent=''}
function kspSetActionBusy(button,busy){button.disabled=busy}
function kspSetRegionBusy(node,busy){node.setAttribute('aria-busy',String(busy))}
async function serverCall(name,payload){
  window.__themeCalls.push({name,payload});
  const state=JSON.parse(document.getElementById('ksp-theme-bootstrap').textContent);
  return {...state,persisted:true,palette:payload.palette,updatedAt:'2026-09-23T00:00:00.000Z'};
}
</script>`;
const html = '<!doctype html><html><head><meta charset="utf-8">' + read('Styles.html')
  + '</head><body><main class="app-shell">' + read('AiProviderSettingsPage.html')
  + '</main>' + bootstrap + shim + read('ClientThemeSettings.html') + '</body></html>';

async function main() {
  fs.mkdirSync(out, { recursive: true });
  const browser = await chromium.launch({ channel: 'chromium', headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const pageErrors = [], consoleErrors = [], blockedRequests = [];
  page.on('pageerror', error => pageErrors.push(error.message));
  page.on('console', message => {
    if (['error', 'warning'].includes(message.type())) consoleErrors.push(message.text());
  });
  await page.route('**/*', route => { blockedRequests.push(route.request().url()); return route.abort(); });
  try {
    await page.setContent(html);
    await page.evaluate(() => {
      document.getElementById('page-ai-provider-settings').classList.add('active');
      document.getElementById('admin-panel-theme').hidden = false;
      document.getElementById('admin-tab-provider').classList.remove('active');
      document.getElementById('admin-tab-provider').setAttribute('aria-selected', 'false');
      document.getElementById('admin-tab-theme').classList.add('active');
      document.getElementById('admin-tab-theme').setAttribute('aria-selected', 'true');
    });
    await page.locator('#theme-color-target').selectOption('action.primary');
    const hue = page.locator('#theme-color-hue');
    const swatch = page.locator('#theme-color-swatch');
    assert.equal(await hue.getAttribute('type'), 'range');
    assert.deepEqual([await hue.getAttribute('min'), await hue.getAttribute('max')], ['0', '359']);
    const track = await page.evaluate(() => [...document.styleSheets]
      .flatMap(sheet => [...sheet.cssRules])
      .find(rule => String(rule.selectorText || '').includes('::-webkit-slider-runnable-track'))
      ?.style.backgroundImage || '');
    assert.match(track, /linear-gradient/);
    for (const color of ['255, 0, 0', '255, 255, 0', '0, 255, 0', '0, 255, 255', '0, 0, 255', '255, 0, 255']) {
      assert.ok(track.includes(color), 'rainbow stop ' + color);
    }
    const dimensions = await swatch.boundingBox();
    assert.ok(Math.abs(dimensions.width - 116) <= 1, 'swatch width');
    assert.ok(Math.abs(dimensions.height - 58) <= 1, 'swatch height');
    await hue.focus();
    await hue.press('Home');
    assert.equal(await hue.inputValue(), '0');
    const leftThumb = hash(await hue.screenshot());
    await hue.press('End');
    assert.equal(await hue.inputValue(), '359');
    const rightThumb = hash(await hue.screenshot());
    assert.notEqual(leftThumb, rightThumb, 'native vertical indicator moves with keyboard');
    const hueBox = await hue.boundingBox();
    await hue.click({ position: { x: hueBox.width / 2, y: hueBox.height / 2 } });
    const midpointHue = Number(await hue.inputValue());
    assert.ok(midpointHue >= 170 && midpointHue <= 190, 'pointer selects middle hue');
    const selectedHex = await page.locator('#theme-color-hex').inputValue();
    const selectedRgb = await page.locator('#theme-color-rgb').textContent();
    assert.equal(selectedRgb, [1, 3, 5].map(index => parseInt(selectedHex.slice(index, index + 2), 16)).join(', '));
    assert.equal(await page.evaluate(() => window.__themeCalls.length), 0);
    await page.screenshot({ path: path.join(out, 'theme-1440.png'), fullPage: false });
    await page.locator('#theme-color-apply').click();
    assert.match(await page.locator('#theme-settings-status').textContent(), /未保存のプレビュー/);
    assert.equal(await page.evaluate(() => window.__themeCalls.length), 0, 'apply is preview only');
    await page.locator('#theme-settings-discard').click();
    assert.equal(await page.locator('#theme-color-hex').inputValue(), '#405F72');
    assert.equal(await page.evaluate(() => window.__themeCalls.length), 0, 'discard does not persist');
    await page.locator('#theme-color-hex').fill('#A1B2C3');
    await page.locator('#theme-color-apply').click();
    await page.locator('#theme-settings-save').click();
    await page.waitForFunction(() => document.getElementById('theme-settings-status').textContent.includes('保存しました'));
    const calls = await page.evaluate(() => window.__themeCalls);
    assert.equal(calls.length, 1);
    assert.equal(calls[0].name, 'mutateThemeSettings');
    assert.equal(calls[0].payload.action, 'SAVE');
    assert.equal(calls[0].payload.palette['action.primary'], '#A1B2C3');
    await page.setViewportSize({ width: 390, height: 844 });
    const mobile = await page.evaluate(() => ({
      overflowPx: Math.max(0, document.documentElement.scrollWidth - innerWidth),
      hueWidth: document.getElementById('theme-color-hue').getBoundingClientRect().width,
      swatchWidth: document.getElementById('theme-color-swatch').getBoundingClientRect().width,
      swatchHeight: document.getElementById('theme-color-swatch').getBoundingClientRect().height
    }));
    assert.equal(mobile.overflowPx, 0);
    assert.ok(mobile.hueWidth > 200);
    assert.ok(Math.abs(mobile.swatchWidth - 116) <= 1);
    assert.ok(Math.abs(mobile.swatchHeight - 58) <= 1);
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.screenshot({ path: path.join(out, 'theme-390.png'), fullPage: false });
    assert.deepEqual(pageErrors, []);
    assert.deepEqual(consoleErrors, []);
    assert.deepEqual(blockedRequests, []);
    const evidence = {
      classification: 'SYNTHETIC_RENDER_ONLY', result: 'PASS', browser: browser.version(),
      viewports: [1440, 390], rainbowTrack: true, indicatorMoved: leftThumb !== rightThumb,
      hueAfterPointer: midpointHue, swatch: { width: dimensions.width, height: dimensions.height },
      mobile, previewRpcCount: 0, saveRpcCount: calls.length,
      pageErrors, consoleErrors, blockedRequests,
      sourceHashes: Object.fromEntries(['Styles.html', 'AiProviderSettingsPage.html', 'ClientThemeSettings.html']
        .map(name => [name, hash(read(name))]))
    };
    fs.writeFileSync(path.join(out, 'validation.json'), JSON.stringify(evidence, null, 2) + '\n');
    process.stdout.write(JSON.stringify(evidence, null, 2) + '\n');
  } finally {
    await browser.close();
  }
}

main().catch(error => { process.stderr.write(error.stack + '\n'); process.exitCode = 1; });
