// Local browser interaction with production HTML and synthetic transport fixtures.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const http = require('node:http');
const os = require('node:os');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const out = process.env.KSP_UI_EVIDENCE_DIR
  ? path.resolve(process.env.KSP_UI_EVIDENCE_DIR)
  : path.join(os.tmpdir(), 'ksp-work0060-past-meeting-browser');
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

const entities = [
  { id: 'CP-A', type: 'GP', name: '合成面談先 A', status: 'Active' },
  { id: 'CP-B', type: 'GP', name: '合成面談先 B', status: 'Active' }
];
const option = (type, id, name) => ({ type, id, name, status: 'Active', sortOrder: 1 });
const masterOptions = [option('ASSET_CLASS', 'AC-1', 'Private Equity'),
  option('CAPITAL_TYPE', 'CAP-1', 'Equity'), option('TEAM', 'TEAM-1', '合成チーム'),
  option('LOCATION', 'LOC-1', 'オンライン')];
const options = {
  gps: entities, counterpartyEntities: entities, counterpartyTypes: [{ code: 'GP', label: 'GP' }],
  assetClasses: [masterOptions[0]], capitalTypes: [masterOptions[1]],
  teams: [masterOptions[2]], locations: [masterOptions[3]], relatedPitchbooks: []
};
const makeRecord = (id, name, date) => ({
  meetingId: id, version: 1, status: 'Active', date, time: '10:00',
  locationId: 'LOC-1', locationName: 'オンライン', counterpartyType: 'GP',
  counterpartyId: id === 'MTG-A' ? 'CP-A' : 'CP-B', counterpartyEntityName: name,
  assetClassId: 'AC-1', assetClassName: 'Private Equity', capitalTypeId: 'CAP-1',
  capitalTypeName: 'Equity', teamId: 'TEAM-1', teamName: '合成チーム',
  fundStrategy: '', meetingTypeCodes: ['ANNUAL_REVIEW'], meetingTypeLabels: ['定例年1回'],
  followUpRequired: false, followUpNote: '', counterparty: '', internalParticipants: '',
  notes: '保存済み本文', documentUrl: '', relatedPitchbookIds: [], relatedPitchbooks: []
});
let records;
const calls = [];
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
  if (name === 'getMeetingBootstrapData' || name === 'getPitchbookBootstrapData') result = { ok: true, options };
  else if (name === 'getPhase1MaintenanceBootstrapData') result = { ok: true, options, masters: { counterparties: entities, options: masterOptions } };
  else if (name === 'searchMeetingRecords') result = { ok: true, records: Object.values(records) };
  else if (name === 'getMeetingMaintenanceRecord') result = { ok: true, record: records[payload] };
  else if (name === 'updateMeetingMaintenance') {
    const current = records[payload.meetingId];
    assert.equal(payload.expectedVersion, current.version);
    records[payload.meetingId] = { ...current, ...payload, version: current.version + 1,
      counterpartyEntityName: entities.find(item => item.id === payload.counterpartyId).name };
    result = { ok: true, record: records[payload.meetingId] };
  } else result = { ok: true };
  response.writeHead(200, { 'content-type': 'application/json' });
  response.end(JSON.stringify(result));
});

async function runViewport(browser, url, width, height) {
  records = { 'MTG-A': makeRecord('MTG-A', '合成面談先 A', '2026-09-01'),
    'MTG-B': makeRecord('MTG-B', '合成面談先 B', '2026-09-02') };
  records['MTG-A'].relatedPitchbookIds = ['DOC-A'];
  records['MTG-A'].relatedPitchbooks = [{ id: 'DOC-A', title: '合成資料 A', status: 'Active',
    date: '2026-08-31', counterpartyId: 'CP-A', assetClassId: 'AC-1' }];
  calls.length = 0;
  const page = await browser.newPage({ viewport: { width, height } });
  const pageErrors = [], consoleErrors = [], blockedRequests = [], dialogs = [];
  page.on('pageerror', error => pageErrors.push(error.message));
  page.on('console', message => { if (['error', 'warning'].includes(message.type())) consoleErrors.push(message.text()); });
  await page.route('**/*', route => {
    if (route.request().url().startsWith(url)) return route.continue();
    blockedRequests.push(route.request().url());
    return route.abort();
  });
  const clickWithDialog = async (selector, accept) => {
    page.once('dialog', async dialog => { dialogs.push(dialog.message());
      if (accept) await dialog.accept(); else await dialog.dismiss(); });
    await page.locator(selector).click();
  };
  try {
    await page.goto(url);
    assert.equal(page.url(), url);
    assert.equal(await page.title(), 'Alternative Assets Intelligence');
    await page.locator('#nav-meeting-past').click();
    assert.equal(await page.locator('#page-meeting-past').isVisible(), true);
    assert.match(await page.locator('#page-meeting-past').innerText(), /過去の記録/);
    assert.doesNotMatch(await page.locator('body').innerText(), /Internal Server Error|Vite error|Next.js error/);
    await page.locator('#meeting-past-search').click();
    await page.locator('[data-meeting-detail="MTG-A"]').click();
    await page.waitForFunction(() => document.getElementById('meeting-detail-identity').textContent.includes('MTG-A'));
    await page.locator('#meeting-detail-edit').click();
    await page.waitForFunction(() => document.getElementById('meeting-edit-id').textContent.includes('MTG-A'));
    assert.match(await page.locator('#meeting-edit-id').innerText(), /合成面談先 A \/ 2026-09-01 \/ MTG-A/);
    assert.match(await page.locator('#meeting-detail-files').innerText(), /合成資料 A/);

    await page.locator('#meeting-edit-close').click();
    assert.equal(dialogs.length, 0, 'clean close has no confirmation');
    await page.locator('#meeting-detail-edit').click();
    await page.locator('#meeting-edit-notes').fill('未保存の本文 A');
    await page.locator('#nav-meeting').click();
    await page.locator('#nav-meeting-past').click();
    assert.equal(await page.locator('#meeting-edit-notes').inputValue(), '未保存の本文 A');
    assert.equal(dialogs.length, 0, 'page navigation preserves edit');
    const sameRecordReads = calls.filter(call => call.name === 'getMeetingMaintenanceRecord').length;
    await page.locator('#meeting-detail-edit').click();
    assert.equal(await page.locator('#meeting-edit-notes').inputValue(), '未保存の本文 A');
    assert.equal(calls.filter(call => call.name === 'getMeetingMaintenanceRecord').length, sameRecordReads,
      'reopening the same dirty editor does not reload it');

    await page.locator('[data-meeting-detail="MTG-B"]').click();
    await page.waitForFunction(() => document.getElementById('meeting-detail-identity').textContent.includes('MTG-B'));
    assert.match(await page.locator('#meeting-detail-identity').innerText(), /MTG-B/);
    assert.match(await page.locator('#meeting-edit-id').innerText(), /MTG-A/);
    assert.equal(dialogs.length, 0, 'detail selection preserves edit');
    await clickWithDialog('#meeting-detail-edit', false);
    assert.equal(await page.locator('#meeting-edit-notes').inputValue(), '未保存の本文 A');
    assert.match(await page.locator('#meeting-edit-id').innerText(), /MTG-A/);
    assert.match(await page.locator('#meeting-detail-identity').innerText(), /MTG-B/);
    assert.equal(calls.filter(call => call.name === 'getMeetingMaintenanceRecord' && call.payload === 'MTG-B').length, 1,
      'canceled edit switch does not reload B');
    await clickWithDialog('#meeting-detail-edit', true);
    await page.waitForFunction(() => document.getElementById('meeting-edit-id').textContent.includes('MTG-B'));
    assert.match(await page.locator('#meeting-edit-id').innerText(), /合成面談先 B \/ 2026-09-02 \/ MTG-B/);
    assert.equal(await page.locator('#meeting-edit-notes').inputValue(), '保存済み本文');

    await page.locator('#meeting-edit-notes').fill('未保存の本文 B');
    await clickWithDialog('#meeting-detail-close', false);
    assert.match(await page.locator('#meeting-detail-identity').innerText(), /MTG-B/);
    assert.equal(await page.locator('#meeting-edit-notes').inputValue(), '未保存の本文 B');
    await clickWithDialog('#meeting-detail-close', true);
    assert.equal(await page.locator('#meeting-detail-empty').isVisible(), true);
    assert.equal(await page.locator('#meeting-edit-meetingId').inputValue(), '');
    assert.equal(await page.locator('#meeting-edit-expectedVersion').inputValue(), '0');

    await page.locator('[data-meeting-detail="MTG-A"]').click();
    await page.waitForFunction(() => document.getElementById('meeting-detail-identity').textContent.includes('MTG-A'));
    await page.locator('#meeting-detail-edit').click();
    await page.waitForFunction(() => document.getElementById('meeting-edit-id').textContent.includes('MTG-A'));
    await page.locator('#meeting-edit-notes').fill('保存する本文');
    await clickWithDialog('#meeting-edit-close', false);
    assert.equal(await page.locator('#meeting-edit-notes').inputValue(), '保存する本文');
    await page.locator('#meeting-edit-form button[type="submit"]').click();
    await page.locator('#meeting-edit-id').getByText('更新番号 2').waitFor();
    assert.equal(calls.filter(call => call.name === 'updateMeetingMaintenance').length, 1);
    assert.equal(calls.find(call => call.name === 'updateMeetingMaintenance').payload.expectedVersion, 1);
    assert.deepEqual(calls.find(call => call.name === 'updateMeetingMaintenance').payload.relatedPitchbookIds, ['DOC-A']);
    const beforeCleanClose = dialogs.length;
    await page.locator('#meeting-edit-close').click();
    assert.equal(dialogs.length, beforeCleanClose, 'save refreshes snapshot');
    assert.equal(await page.locator('#meeting-edit-empty').isVisible(), true);

    await page.locator('#meeting-detail-edit').click();
    await page.locator('#meeting-edit-card').scrollIntoViewIfNeeded();
    await page.screenshot({ path: path.join(out, `past-meeting-edit-${width}.png`), fullPage: false });
    const overflowPx = await page.evaluate(() => Math.max(0, document.documentElement.scrollWidth - innerWidth));
    assert.equal(overflowPx, 0, `${width}px horizontal overflow`);
    assert.deepEqual(pageErrors, []);
    assert.deepEqual(consoleErrors, []);
    return { viewport: width, title: await page.title(), overflowPx, dialogCount: dialogs.length,
      calls: calls.filter(call => ['searchMeetingRecords', 'getMeetingMaintenanceRecord', 'updateMeetingMaintenance'].includes(call.name)).length,
      pageErrors, consoleErrors, blockedRequests };
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
    fs.writeFileSync(path.join(out, 'validation.json'), JSON.stringify({
      classification: 'SYNTHETIC_BROWSER_RENDER', result: 'PASS', browser: browser.version(), results
    }, null, 2) + '\n');
    process.stdout.write(JSON.stringify({ result: 'PASS', browser: browser.version(), results, out }, null, 2) + '\n');
  } finally {
    await browser.close();
    await new Promise(resolve => server.close(resolve));
  }
}
main().catch(error => { process.stderr.write(error.stack + '\n'); process.exitCode = 1; });
