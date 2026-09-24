// Focused browser check against production HTML with local synthetic RPC responses.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const http = require('node:http');
const os = require('node:os');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const out = process.env.KSP_UI_EVIDENCE_DIR
  ? path.resolve(process.env.KSP_UI_EVIDENCE_DIR)
  : path.join(os.tmpdir(), 'ksp-work0063-accessible-reorder-focus');
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

const entities = [{ id: 'CP-A', type: 'GP', name: '合成面談先 A', status: 'Active' }];
const option = (type, id, name, sortOrder = 1) => ({ type, id, name, status: 'Active', sortOrder });
const initialOptions = [option('ASSET_CLASS', 'AC-1', 'Private Equity', 1),
  option('ASSET_CLASS', 'AC-2', 'Infrastructure', 2),
  option('ASSET_CLASS', 'AC-3', 'Real Estate', 3),
  option('CAPITAL_TYPE', 'CAP-1', 'Equity'), option('TEAM', 'TEAM-1', '合成チーム'),
  option('LOCATION', 'LOC-1', 'オンライン')];
let masters;
const calls = [];
const record = {
  meetingId: 'MTG-A', version: 1, status: 'Active', date: '2026-09-01', time: '10:00',
  locationId: 'LOC-1', locationName: 'オンライン', counterpartyType: 'GP',
  counterpartyId: 'CP-A', counterpartyEntityName: '合成面談先 A',
  assetClassId: 'AC-1', assetClassName: 'Private Equity', capitalTypeId: 'CAP-1',
  capitalTypeName: 'Equity', teamId: 'TEAM-1', teamName: '合成チーム', fundStrategy: '',
  meetingTypeCodes: [], meetingTypeLabels: [], followUpRequired: false, followUpNote: '',
  counterparty: '', internalParticipants: '', notes: '保存済み本文', documentUrl: '',
  relatedPitchbookIds: [], relatedPitchbooks: []
};
function options() {
  return { gps: entities, counterpartyEntities: entities,
    counterpartyTypes: [{ code: 'GP', label: 'GP' }],
    assetClasses: masters.options.filter(row => row.type === 'ASSET_CLASS'),
    capitalTypes: masters.options.filter(row => row.type === 'CAPITAL_TYPE'),
    teams: masters.options.filter(row => row.type === 'TEAM'),
    locations: masters.options.filter(row => row.type === 'LOCATION'), relatedPitchbooks: [] };
}
const shim = `<script>window.google={script:{run:{withSuccessHandler(success){return{withFailureHandler(failure){return new Proxy({},{get(_,name){return async payload=>{try{const response=await fetch('/rpc',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({name,payload})});const result=await response.json();if(!response.ok)throw new Error(result.error);success(result)}catch(error){failure(error)}}}})}}}}}};</script>`;
const html = render('Index').replace(/<\?!=\s*themeHeadMarkup\s*\?>/, '')
  .replace('<head>', '<head>' + shim);
assert.doesNotMatch(html, /<\?[!=]/);
const server = http.createServer(async (request, response) => {
  if (request.url === '/') {
    response.writeHead(200, { 'content-type': 'text/html;charset=utf-8' });
    response.end(html);
    return;
  }
  if (request.url !== '/rpc') { response.writeHead(204); response.end(); return; }
  let body = '';
  for await (const chunk of request) body += chunk;
  const { name, payload } = JSON.parse(body);
  calls.push({ name, payload });
  let result;
  if (name === 'getMeetingBootstrapData' || name === 'getPitchbookBootstrapData')
    result = { ok: true, options: options() };
  else if (name === 'getPhase1MaintenanceBootstrapData')
    result = { ok: true, options: options(), masters };
  else if (name === 'searchMeetingRecords') result = { ok: true, records: [record] };
  else if (name === 'getMeetingMaintenanceRecord') result = { ok: true, record };
  else if (name === 'getEntityWorkspaceData') result = { ok: true, entities: [] };
  else if (name === 'mutateMaster') {
    assert.equal(payload.action, 'REORDER_BATCH');
    assert.deepEqual(payload.expectedOrderIds, ['AC-1', 'AC-2', 'AC-3']);
    const order = new Map(payload.orderedIds.map((id, index) => [id, index + 1]));
    masters = { counterparties: entities, options: masters.options.map(row =>
      order.has(row.id) ? { ...row, sortOrder: order.get(row.id) } : row) };
    result = { ok: true, masters };
  } else result = { ok: true };
  response.writeHead(200, { 'content-type': 'application/json' });
  response.end(JSON.stringify(result));
});

async function runViewport(browser, url, width, height) {
  masters = { counterparties: entities, options: initialOptions.map(row => ({ ...row })) };
  calls.length = 0;
  const page = await browser.newPage({ viewport: { width, height }, hasTouch: width === 390 });
  const errors = [], blocked = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  await page.route('**/*', route => {
    if (route.request().url().startsWith(url)) return route.continue();
    blocked.push(route.request().url());
    return route.abort();
  });
  const activeId = () => page.evaluate(() => document.activeElement.id);
  const rowIds = () => page.locator('#option-master-results .master-sort-row')
    .evaluateAll(rows => rows.map(row => row.dataset.masterOptionId));
  try {
    await page.goto(url);
    await page.locator('#nav-masters').focus();
    await page.keyboard.press('Enter');
    await page.locator('#page-masters').waitFor({ state: 'visible' });
    assert.equal(await activeId(), '', 'master page heading has no authored ID');
    assert.equal(await page.evaluate(() => document.activeElement.closest('#page-masters') !== null), true);
    assert.equal(await page.evaluate(() => document.activeElement.tagName), 'H2');
    assert.equal(await page.evaluate(() => document.activeElement.tabIndex), -1);
    await page.locator('[data-master-tab="ASSET_CLASS"]').click();
    await page.locator('#option-master-results .master-sort-row').first().waitFor();
    assert.deepEqual(await rowIds(), ['AC-1', 'AC-2', 'AC-3']);
    assert.equal(await page.locator('[data-master-option-id="AC-1"] [data-master-move="up"]').isDisabled(), true);
    assert.equal(await page.locator('[data-master-option-id="AC-3"] [data-master-move="down"]').isDisabled(), true);

    const secondUp = page.locator('[data-master-option-id="AC-2"] [data-master-move="up"]');
    await secondUp.focus();
    await page.keyboard.press('Enter');
    assert.deepEqual(await rowIds(), ['AC-2', 'AC-1', 'AC-3']);
    assert.equal(await page.evaluate(() => document.activeElement.closest('.master-sort-row').dataset.masterOptionId), 'AC-2');
    assert.equal(await page.evaluate(() => document.activeElement.dataset.masterMove), 'down');
    assert.match(await page.locator('#master-reorder-dirty').innerText(), /未保存/);
    assert.equal(calls.filter(call => call.name === 'mutateMaster').length, 0);
    await page.keyboard.press('Enter');
    assert.deepEqual(await rowIds(), ['AC-1', 'AC-2', 'AC-3']);
    assert.equal(await page.evaluate(() => document.activeElement.closest('.master-sort-row').dataset.masterOptionId), 'AC-2');
    assert.equal(await page.locator('#master-reorder-dirty').innerText(), '');

    const thirdUp = page.locator('[data-master-option-id="AC-3"] [data-master-move="up"]');
    if (width === 390) await thirdUp.tap(); else await thirdUp.click();
    assert.deepEqual(await rowIds(), ['AC-1', 'AC-3', 'AC-2']);
    await page.locator('#master-reorder-reset').click();
    assert.deepEqual(await rowIds(), ['AC-1', 'AC-2', 'AC-3']);
    assert.equal(await page.locator('#master-reorder-save').isDisabled(), true);

    await page.locator('[data-master-option-id="AC-3"] [data-master-move="up"]').focus();
    await page.keyboard.press('Space');
    assert.deepEqual(await rowIds(), ['AC-1', 'AC-3', 'AC-2']);
    await page.locator('#master-reorder-save').focus();
    await page.keyboard.press('Enter');
    await page.waitForFunction(() => document.getElementById('master-reorder-dirty').textContent === ''
      && document.getElementById('masters-status').textContent.includes('更新しました'));
    assert.deepEqual(calls.filter(call => call.name === 'mutateMaster').map(call => call.payload.orderedIds),
      [['AC-1', 'AC-3', 'AC-2']]);
    assert.equal(await page.locator('#master-reorder-dirty').innerText(), '');
    await page.screenshot({ path: path.join(out, `masters-${width}.png`), fullPage: false });

    await page.locator('#nav-meeting-past').focus();
    await page.keyboard.press('Enter');
    assert.equal(await page.evaluate(() => document.activeElement.textContent.trim()), '過去の記録');
    await page.locator('#meeting-past-search').click();
    await page.locator('[data-meeting-detail="MTG-A"]').focus();
    await page.keyboard.press('Enter');
    await page.waitForFunction(() => document.activeElement.id === 'meeting-detail-heading');
    await page.locator('#meeting-detail-edit').focus();
    await page.keyboard.press('Enter');
    await page.waitForFunction(() => document.activeElement.id === 'meeting-edit-heading');
    await page.locator('#meeting-edit-notes').fill('未保存の本文');
    await page.locator('#nav-knowledge').click();
    assert.equal(await activeId(), 'nav-knowledge', 'pointer nav keeps button focus');
    await page.locator('#nav-meeting-past').focus();
    await page.keyboard.press('Enter');
    assert.equal(await page.locator('#meeting-edit-notes').inputValue(), '未保存の本文');
    assert.equal(await page.evaluate(() => document.activeElement.textContent.trim()), '過去の記録');
    await page.locator('#nav-entity-workspace').focus();
    await page.keyboard.press('Enter');
    assert.equal(await page.evaluate(() => document.activeElement.closest('#page-entity-workspace') !== null), true);
    assert.equal(await page.evaluate(() => document.activeElement.tagName), 'H2');
    await page.screenshot({ path: path.join(out, `entity-nav-${width}.png`), fullPage: false });
    assert.equal(await page.evaluate(() => Math.max(0, document.documentElement.scrollWidth - innerWidth)), 0);
    assert.deepEqual(errors, []);
    return { width, keyboardReorderAndSave: true, touchOrClickReorder: true,
      detailEditFocus: true, dirtyEditPreserved: true, errors, blocked,
      syntheticMasterMutations: calls.filter(call => call.name === 'mutateMaster').length };
  } finally { await page.close(); }
}

async function main() {
  fs.mkdirSync(out, { recursive: true });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const url = `http://127.0.0.1:${server.address().port}/`;
  const browser = await chromium.launch({ channel: 'chromium', headless: true });
  try {
    const results = [];
    for (const [width, height] of [[1440, 900], [390, 844]])
      results.push(await runViewport(browser, url, width, height));
    const evidence = { classification: 'SYNTHETIC_BROWSER_RENDER', result: 'PASS',
      browser: browser.version(), results };
    fs.writeFileSync(path.join(out, 'validation.json'), JSON.stringify(evidence, null, 2) + '\n');
    process.stdout.write(JSON.stringify({ ...evidence, out }, null, 2) + '\n');
  } finally {
    await browser.close();
    await new Promise(resolve => server.close(resolve));
  }
}
main().catch(error => { process.stderr.write(error.stack + '\n'); process.exitCode = 1; });
