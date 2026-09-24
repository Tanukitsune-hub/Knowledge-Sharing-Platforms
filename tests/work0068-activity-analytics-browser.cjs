// Production HTML and client scripts with synthetic local RPC responses only.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const playwrightPath = process.env.KSP_PLAYWRIGHT_PATH || path.join(
  process.env.USERPROFILE, '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const { chromium } = require(playwrightPath);

function render(name, parents = []) {
  assert.match(name, /^[A-Za-z0-9_-]+$/);
  assert.ok(!parents.includes(name));
  return fs.readFileSync(path.join(root, 'src', name + '.html'), 'utf8')
    .replace(/<\?!=\s*include_\('([^']+)'\);?\s*\?>/g,
      (_, child) => render(child, [...parents, name]));
}
const html = render('Index').replace(/<\?!=\s*themeHeadMarkup\s*\?>/, '');
assert.doesNotMatch(html, /<\?[!=]/);
const server = http.createServer((request, response) => {
  if (request.url === '/') {
    response.writeHead(200, { 'content-type': 'text/html;charset=utf-8' });
    response.end(html);
  } else { response.writeHead(204); response.end(); }
});

const options = { gps: [], counterpartyEntities: [], counterpartyTypes: [], assetClasses: [],
  capitalTypes: [], teams: [], locations: [], meetingTypes: [], fundStrategies: [], relatedPitchbooks: [] };
const filterIds = [
  'activity-filter-counterpartyEntity', 'activity-filter-assetClass', 'activity-filter-team',
  'activity-filter-meetingType', 'activity-filter-status'
];
const filterOptions = Object.fromEntries(
  ['counterpartyEntities', 'assetClasses', 'teams', 'meetingTypes', 'statuses']
    .map(key => [key, [{ value: key + '-A', label: key + ' A' }, { value: key + '-B', label: key + ' B' }]])
);
const fixtures = {
  getMeetingBootstrapData: { ok: true, options },
  getPitchbookBootstrapData: { ok: true, options },
  getPhase1MaintenanceBootstrapData: { ok: true, options, masters: { counterparties: [], options: [] } },
  getKnowledgeSearchBootstrapData: { ok: true, options,
    providers: { OPENAI: { configured: false }, GEMINI: { configured: false } },
    modelPolicies: { OPENAI: { profiles: [] }, GEMINI: { profiles: [] } },
    modeDefinitions: [{ mode: '要約', inputRequired: false, instruction: '要約してください。' }] },
  getMeetingActivityAnalytics: { ok: true, filterOptions,
    period: { mode: 'quarter', startDate: '2026-01-01', endDate: '2026-06-30', bucketCount: 2 },
    headline: { meetingCount: 7, activeMeetingCount: 6, distinctCounterpartyCount: 3 },
    series: [{ label: '2026 Q1', meetingCount: 7, activeMeetingCount: 6, distinctCounterpartyCount: 3 }],
    breakdown: { items: [], totalCount: 0, omittedCount: 0 },
    drill: { records: [], omittedCount: 0 } }
};

async function runViewport(browser, url, width, height) {
  const page = await browser.newPage({ viewport: { width, height } });
  const pageErrors = [], consoleErrors = [], blockedRequests = [];
  page.on('pageerror', error => pageErrors.push(error.message));
  page.on('console', message => {
    if (['error', 'warning'].includes(message.type())) consoleErrors.push(message.text());
  });
  await page.route('**/*', route => {
    if (route.request().url().startsWith(url)) return route.continue();
    blockedRequests.push(route.request().url());
    return route.abort();
  });
  await page.addInitScript(data => {
    window.__activityRpcCalls = [];
    window.google = { script: { run: { withSuccessHandler(success) {
      return { withFailureHandler() {
        return new Proxy({}, { get(_, name) { return payload => {
          window.__activityRpcCalls.push({ name, payload });
          queueMicrotask(() => success(data[name] || { ok: true }));
        }; } });
      } };
    } } } };
  }, fixtures);
  const rpcCalls = () => page.evaluate(() => window.__activityRpcCalls
    .filter(call => call.name === 'getMeetingActivityAnalytics'));
  const selectFilter = async (id, suffix, firstRun) => {
    const key = {
      'activity-filter-counterpartyEntity': 'counterpartyEntities',
      'activity-filter-assetClass': 'assetClasses',
      'activity-filter-team': 'teams',
      'activity-filter-meetingType': 'meetingTypes',
      'activity-filter-status': 'statuses'
    }[id];
    if (firstRun) await page.locator('#' + id).evaluate((node, key) => {
      for (const suffix of ['A', 'B']) {
        const option = document.createElement('option');
        option.value = key + '-' + suffix;
        option.textContent = option.value;
        node.appendChild(option);
      }
    }, key);
    await page.locator('#' + id).selectOption(key + '-' + suffix);
  };
  try {
    await page.goto(url);
    await page.waitForFunction(() => !document.getElementById('meeting-submit').disabled);
    await page.locator('#nav-activity-analytics').click();
    assert.equal(await page.locator('#page-activity-analytics').isVisible(), true);
    assert.equal((await rpcCalls()).length, 0);
    assert.equal(await page.locator('#activity-analytics-status').innerText(), '');
    assert.notEqual(await page.locator('#page-activity-analytics').getAttribute('aria-busy'), 'true');
    assert.equal(await page.locator('#activity-analytics-refresh').isDisabled(), false);

    await page.locator('#activity-period').selectOption('quarter');
    await page.locator('#activity-date-from').fill('2026-01-01');
    await page.locator('#activity-date-to').fill('2026-06-30');
    await page.locator('#activity-dimension').selectOption('assetClass');
    for (const id of filterIds) await selectFilter(id, 'A', true);
    assert.equal((await rpcCalls()).length, 0);

    await page.locator('#activity-analytics-refresh').click();
    await page.waitForFunction(() => document.getElementById('activity-analytics-status').textContent.includes('集計しました。'));
    const firstCalls = await rpcCalls();
    assert.equal(firstCalls.length, 1);
    assert.equal(firstCalls[0].payload.period, 'quarter');
    assert.equal(firstCalls[0].payload.dateFrom, '2026-01-01');
    assert.equal(firstCalls[0].payload.dateTo, '2026-06-30');
    assert.equal(firstCalls[0].payload.dimension, 'assetClass');
    assert.equal(await page.evaluate(() => activityAnalyticsLoaded), true);
    assert.match(await page.locator('#activity-headline').innerText(), /7\s*面談件数/);

    await page.locator('#activity-period').selectOption('monthly');
    await page.locator('#activity-date-from').fill('2026-07-01');
    await page.locator('#activity-date-to').fill('2026-12-31');
    await page.locator('#activity-dimension').selectOption('team');
    for (const id of filterIds) await selectFilter(id, 'B', false);
    assert.equal((await rpcCalls()).length, 1);
    await page.locator('[data-activity-view="list"]').click();
    await page.locator('#nav-knowledge').click();
    await page.locator('#nav-activity-analytics').click();
    assert.equal((await rpcCalls()).length, 1);
    assert.equal(await page.locator('[data-activity-view="list"]').getAttribute('aria-selected'), 'true');
    assert.equal(await page.locator('#activity-analytics-status').innerText(), '集計しました。');

    await page.locator('#activity-analytics-refresh').click();
    await page.waitForFunction(() => !document.getElementById('activity-analytics-refresh').disabled);
    const secondCalls = await rpcCalls();
    assert.equal(secondCalls.length, 2);
    assert.equal(secondCalls[1].payload.period, 'monthly');
    assert.equal(secondCalls[1].payload.dateFrom, '2026-07-01');
    assert.equal(secondCalls[1].payload.dateTo, '2026-12-31');
    assert.equal(secondCalls[1].payload.dimension, 'team');
    assert.deepEqual(secondCalls[1].payload.filters, {
      counterpartyType: '', counterpartyEntity: 'counterpartyEntities-B', assetClass: 'assetClasses-B',
      team: 'teams-B', meetingType: 'meetingTypes-B', status: 'statuses-B'
    });
    assert.deepEqual(pageErrors, []);
    assert.deepEqual(consoleErrors, []);
    assert.deepEqual(blockedRequests, []);
    return { viewport: width, navigationRpcCountBeforeFirstRun: 0, preFirstRunFilterRpcCount: 0,
      manualRunRpcCount: 1, postSuccessConditionChangeRpcCount: 0,
      reentryNavigationRpcCount: 0, secondManualRunRpcCount: 1,
      pageErrors, consoleErrors, blockedRequests };
  } finally { await page.close(); }
}

async function main() {
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const url = 'http://127.0.0.1:' + server.address().port + '/';
  const browser = await chromium.launch({ channel: 'chromium', headless: true });
  try {
    const evidence = [];
    for (const [width, height] of [[1440, 1000], [390, 844]])
      evidence.push(await runViewport(browser, url, width, height));
    process.stdout.write(JSON.stringify({ result: 'PASS', classification: 'SYNTHETIC_BROWSER', evidence }, null, 2) + '\n');
  } finally {
    await browser.close();
    await new Promise(resolve => server.close(resolve));
  }
}
main().catch(error => { process.stderr.write(error.stack + '\n'); process.exitCode = 1; });
