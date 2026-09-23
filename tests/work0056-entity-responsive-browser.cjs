// Local browser measurement of the production Entity Workspace DOM and CSS only.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const out = process.env.KSP_UI_EVIDENCE_DIR
  ? path.resolve(process.env.KSP_UI_EVIDENCE_DIR)
  : path.join(os.tmpdir(), 'ksp-work0056-entity-browser');
const playwrightPath = process.env.KSP_PLAYWRIGHT_PATH || path.join(
  process.env.USERPROFILE, '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const { chromium } = require(playwrightPath);
const read = name => fs.readFileSync(path.join(root, 'src', name), 'utf8');
const html = '<!doctype html><html lang="ja"><head><meta charset="utf-8">'
  + '<meta name="viewport" content="width=device-width,initial-scale=1">' + read('Styles.html')
  + '</head><body><main class="app-shell">' + read('EntityWorkspacePage.html')
  + '</main></body></html>';

async function measure(page, width, height) {
  await page.setViewportSize({ width, height });
  return page.evaluate(() => {
    const sample = selector => {
      const node = document.querySelector(selector);
      const rect = node.getBoundingClientRect();
      const style = getComputedStyle(node);
      return {
        left: rect.left, right: rect.right, width: rect.width,
        minWidth: style.minWidth, overflowX: style.overflowX,
        clientWidth: node.clientWidth, scrollWidth: node.scrollWidth
      };
    };
    return {
      viewport: innerWidth,
      overflowPx: Math.max(0, document.documentElement.scrollWidth - innerWidth),
      page: sample('#page-entity-workspace'),
      selector: sample('#entity-workspace-entity'),
      grid: sample('.entity-workspace-grid'),
      card: sample('.entity-workspace-grid > .card'),
      tableWrap: sample('.entity-workspace-grid > .card .table-wrap'),
      table: sample('.entity-workspace-grid > .card .data-table'),
      summaryCards: [...document.querySelectorAll('.entity-summary-card')].map(node => {
        const rect = node.getBoundingClientRect();
        return { left: rect.left, right: rect.right, width: rect.width, text: node.textContent.trim() };
      }),
      gridColumns: getComputedStyle(document.querySelector('.entity-workspace-grid')).gridTemplateColumns.split(' ').length
    };
  });
}

async function main() {
  fs.mkdirSync(out, { recursive: true });
  const browser = await chromium.launch({ channel: 'chromium', headless: true });
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  const pageErrors = [], consoleErrors = [], blockedRequests = [];
  page.on('pageerror', error => pageErrors.push(error.message));
  page.on('console', message => {
    if (['error', 'warning'].includes(message.type())) consoleErrors.push(message.text());
  });
  await page.route('**/*', route => {
    blockedRequests.push(route.request().url());
    return route.abort();
  });
  try {
    await page.setContent(html);
    await page.evaluate(() => {
      document.querySelector('#page-entity-workspace').classList.add('active');
      document.querySelector('#entity-workspace-content').classList.remove('hidden-panel');
      document.querySelector('#entity-workspace-name').textContent = 'Synthetic Counterparty';
      document.querySelector('#entity-workspace-summary').innerHTML = [
        ['面談件数', '1件'], ['保存資料数', '1件'], ['最後の面談日', '2026-09-23']
      ].map(([label, value]) => '<div class="card entity-summary-card"><span>'
        + label + '</span><strong>' + value + '</strong></div>').join('');
    });
    const mobile = await measure(page, 390, 844);
    await page.screenshot({ path: path.join(out, 'entity-390.png'), fullPage: false });
    const desktop = await measure(page, 1440, 900);
    await page.screenshot({ path: path.join(out, 'entity-1440.png'), fullPage: false });
    const diagnostic = process.env.KSP_UI_DIAGNOSE === '1';
    const evidence = {
      classification: 'SYNTHETIC_RENDER_ONLY',
      result: diagnostic ? 'BASELINE' : 'PASS',
      browser: browser.version(), mobile, desktop,
      pageErrors, consoleErrors, blockedRequests
    };
    const name = diagnostic ? 'baseline.json' : 'validation.json';
    fs.writeFileSync(path.join(out, name), JSON.stringify(evidence, null, 2) + '\n');
    if (!diagnostic) {
      assert.equal(mobile.overflowPx, 0, 'expanded mobile page has no horizontal overflow');
      assert.equal(desktop.overflowPx, 0, 'desktop page has no horizontal overflow');
      assert.equal(mobile.summaryCards.length, 3);
      assert.ok(mobile.summaryCards.every(card => card.left >= 0 && card.right <= 390));
      assert.ok(mobile.selector.left >= 0 && mobile.selector.right <= 390);
      assert.ok(mobile.card.right <= 390, 'grid card is bounded by viewport');
      assert.ok(mobile.tableWrap.scrollWidth > mobile.tableWrap.clientWidth, 'table scrolls inside wrapper');
      assert.ok(mobile.tableWrap.right <= 390);
      assert.equal(mobile.gridColumns, 1);
      assert.equal(desktop.gridColumns, 2);
      assert.deepEqual(pageErrors, []);
      assert.deepEqual(consoleErrors, []);
      assert.deepEqual(blockedRequests, []);
    }
    process.stdout.write(JSON.stringify(evidence, null, 2) + '\n');
  } finally {
    await browser.close();
  }
}

main().catch(error => { process.stderr.write(error.stack + '\n'); process.exitCode = 1; });
