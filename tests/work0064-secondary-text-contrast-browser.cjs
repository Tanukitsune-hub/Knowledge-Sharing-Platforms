// Production Theme panel in a local browser with an in-memory synthetic theme service.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const out = process.env.KSP_UI_EVIDENCE_DIR
  ? path.resolve(process.env.KSP_UI_EVIDENCE_DIR)
  : path.join(os.tmpdir(), 'ksp-work0064-secondary-text-contrast');
const playwrightPath = process.env.KSP_PLAYWRIGHT_PATH || path.join(
  process.env.USERPROFILE, '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const { chromium } = require(playwrightPath);
const read = name => fs.readFileSync(path.join(root, 'src', name), 'utf8');
const context = {
  kspAssert_(condition, code, message) {
    if (!condition) throw Object.assign(new Error(message), { code });
  },
  kspDeepClone_: value => JSON.parse(JSON.stringify(value)),
  kspGetErrorCode_: (error, fallback) => error && error.code || fallback
};
vm.createContext(context);
vm.runInContext(read('166_ThemeSettings.gs'), context);
const initial = context.kspThemeStateResponse_({ palette: context.kspThemeDefaultPalette_(),
  persisted: false, updatedAt: '', corruptOverrideIgnored: false });
const bootstrap = '<script id="ksp-theme-bootstrap" type="application/json">'
  + JSON.stringify(initial).replace(/</g, '\\u003c') + '</script>';
const shim = `<script>
window.__themeCalls=[];
function showStatus(id,kind,message){const node=document.getElementById(id);node.className='status '+kind+' visible';node.textContent=message}
function clearStatus(id){const node=document.getElementById(id);node.className='status';node.textContent=''}
function kspSetActionBusy(button,busy){button.disabled=busy}
function kspSetRegionBusy(node,busy){node.setAttribute('aria-busy',String(busy))}
async function serverCall(name,payload){
  window.__themeCalls.push({name,payload});
  const baseline=JSON.parse(document.getElementById('ksp-theme-bootstrap').textContent);
  if(payload.action==='RESET')return {...baseline,persisted:false,palette:baseline.defaults,updatedAt:''};
  return {...baseline,persisted:true,palette:payload.palette,updatedAt:'2026-09-24T00:00:00.000Z'};
}
</script>`;
const html = '<!doctype html><html><head><meta charset="utf-8">' + read('Styles.html')
  + '</head><body><main class="app-shell">' + read('AiProviderSettingsPage.html')
  + '</main>' + bootstrap + shim + read('ClientThemeSettings.html') + '</body></html>';

async function runViewport(browser, width, height) {
  const page = await browser.newPage({ viewport: { width, height } });
  const errors = [], blocked = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  await page.route('**/*', route => { blocked.push(route.request().url()); return route.abort(); });
  try {
    await page.setContent(html);
    await page.evaluate(() => {
      document.getElementById('page-ai-provider-settings').classList.add('active');
      document.getElementById('admin-panel-theme').hidden = false;
    });
    const secondary = page.locator('[data-theme-hex="text.secondary"]');
    const warning = page.locator('#theme-contrast-warning');
    assert.equal(await secondary.inputValue(), '#5A6D79');
    assert.equal(await warning.textContent(), '');
    assert.equal(await page.evaluate(() => getComputedStyle(document.documentElement)
      .getPropertyValue('--theme-text-secondary').trim()), '#5A6D79');
    await page.screenshot({ path: path.join(out, `theme-default-${width}.png`), fullPage: false });

    await secondary.fill('#F8FAFB');
    const text = await warning.textContent();
    for (const label of ['補助文字 / ページ背景', '補助文字 / Card背景', '補助文字 / soft surface'])
      assert.ok(text.includes(label), label);
    assert.equal(await page.locator('#theme-settings-save').isEnabled(), true);
    assert.equal(await page.evaluate(() => window.__themeCalls.length), 0, 'preview has no RPC');
    await warning.scrollIntoViewIfNeeded();
    await page.screenshot({ path: path.join(out, `theme-warning-${width}.png`), fullPage: false });

    await page.locator('#theme-settings-save').click();
    await page.waitForFunction(() => document.getElementById('theme-settings-status').textContent.includes('保存しました'));
    assert.equal(await page.evaluate(() => window.__themeCalls.length), 1);
    assert.equal(await page.evaluate(() => window.__themeCalls[0].payload.palette['text.secondary']), '#F8FAFB');
    assert.match(await warning.textContent(), /補助文字 \/ soft surface/);

    await secondary.fill('#5A6D79');
    assert.equal(await warning.textContent(), '');
    await page.locator('#theme-settings-discard').click();
    assert.equal(await secondary.inputValue(), '#F8FAFB');
    assert.match(await warning.textContent(), /補助文字 \/ Card背景/);
    assert.equal(await page.evaluate(() => window.__themeCalls.length), 1, 'discard has no RPC');

    page.once('dialog', dialog => dialog.accept());
    await page.locator('#theme-settings-reset').click();
    await page.waitForFunction(() => document.getElementById('theme-settings-status').textContent.includes('既定の配色に戻しました'));
    assert.equal(await secondary.inputValue(), '#5A6D79');
    assert.equal(await warning.textContent(), '');
    assert.equal(await page.evaluate(() => window.__themeCalls.length), 2);
    assert.equal(await page.evaluate(() => window.__themeCalls[1].payload.action), 'RESET');
    const overflowPx = await page.evaluate(() => Math.max(0, document.documentElement.scrollWidth - innerWidth));
    assert.equal(overflowPx, 0);
    assert.deepEqual(errors, []);
    assert.deepEqual(blocked, []);
    return { width, defaultWarning: false, lowContrastWarning: true,
      advisorySave: true, discardAndReset: true, overflowPx, errors, blocked,
      syntheticMutationCalls: 2 };
  } finally { await page.close(); }
}

async function main() {
  fs.mkdirSync(out, { recursive: true });
  const browser = await chromium.launch({ channel: 'chromium', headless: true });
  try {
    const results = [];
    for (const [width, height] of [[1440, 900], [390, 844]])
      results.push(await runViewport(browser, width, height));
    const evidence = { classification: 'SYNTHETIC_BROWSER_RENDER', result: 'PASS',
      browser: browser.version(), results };
    fs.writeFileSync(path.join(out, 'validation.json'), JSON.stringify(evidence, null, 2) + '\n');
    process.stdout.write(JSON.stringify({ ...evidence, out }, null, 2) + '\n');
  } finally { await browser.close(); }
}
main().catch(error => { process.stderr.write(error.stack + '\n'); process.exitCode = 1; });
