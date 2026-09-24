// Production client HTML with synthetic local RPC responses; no Workspace or provider calls.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const http = require('node:http');
const os = require('node:os');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const out = process.env.KSP_UI_EVIDENCE_DIR
  ? path.resolve(process.env.KSP_UI_EVIDENCE_DIR)
  : path.join(os.tmpdir(), 'ksp-work0062-field-validation-browser');
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
const shim = `<script>window.google={script:{run:{withSuccessHandler(success){return{withFailureHandler(failure){return new Proxy({},{get(_,name){return async payload=>{try{const response=await fetch('/rpc',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({name,payload})});const result=await response.json();if(!response.ok)throw new Error(result.error);success(result)}catch(error){failure(error)}}}})}}}}}};</script>`;
const html = render('Index').replace(/<\?!=\s*themeHeadMarkup\s*\?>/, '')
  .replace('<head>', '<head>' + shim);
assert.doesNotMatch(html, /<\?[!=]/);

const counterparties = [{ id: 'CP-1', type: 'GP', name: '合成面談先', status: 'Active' }];
const masterOptions = [{ type: 'ASSET_CLASS', id: 'AC-1', name: 'Private Equity', status: 'Active', sortOrder: 1 }];
const options = () => ({ gps: counterparties, counterpartyEntities: counterparties,
  counterpartyTypes: [{ code: 'GP', label: 'GP / 運用会社' }], assetClasses: masterOptions,
  capitalTypes: [], locations: [], teams: [], relatedPitchbooks: [] });
let record;
const calls = [];
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
  if (name === 'getMeetingBootstrapData' || name === 'getPitchbookBootstrapData') result = { ok: true, options: options() };
  else if (name === 'getPhase1MaintenanceBootstrapData') result = { ok: true, options: options(),
    masters: { counterparties, options: masterOptions } };
  else if (name === 'searchMeetingRecords') result = { ok: true, records: [record] };
  else if (name === 'getMeetingMaintenanceRecord') result = { ok: true, record };
  else if (name === 'updateMeetingMaintenance') {
    assert.equal(payload.expectedVersion, record.version);
    record = { ...record, ...payload, version: record.version + 1 };
    result = { ok: true, record };
  } else if (name === 'registerMeeting') result = { ok: true, meeting: { id: 'MTG-NEW', version: 1, status: 'Active' } };
  else if (name === 'quickAddCounterparty') {
    const added = { id: 'CP-NEW', type: payload.type, name: payload.name, status: 'Active' };
    counterparties.push(added);
    result = { ok: true, counterparty: added, masters: { counterparties, options: masterOptions } };
  } else result = { ok: true };
  response.writeHead(200, { 'content-type': 'application/json' });
  response.end(JSON.stringify(result));
});

async function invalidField(page, id, invalid) {
  const field = page.locator('#' + id);
  const error = page.locator('#' + id + '-error');
  assert.equal(await field.getAttribute('aria-describedby'), invalid ? id + '-error' : null);
  assert.equal(await field.getAttribute('aria-invalid'), invalid ? 'true' : null, id);
  assert.equal(await error.isVisible(), invalid, id + ' error visibility');
}

async function runViewport(browser, url, width, height) {
  record = { meetingId: 'MTG-1', version: 1, status: 'Active', date: '2026-09-24', time: '',
    counterpartyId: 'CP-1', counterpartyEntityName: '合成面談先', assetClassId: 'AC-1',
    assetClassName: 'Private Equity', locationId: '', teamId: '', fundStrategy: '',
    meetingTypeCodes: [], meetingTypeLabels: [], relatedPitchbookIds: [], relatedPitchbooks: [],
    followUpRequired: false, followUpNote: '', counterparty: '', internalParticipants: '',
    notes: '保存済み本文', documentUrl: '' };
  counterparties.splice(1);
  calls.length = 0;
  const page = await browser.newPage({ viewport: { width, height } });
  const pageErrors = [], consoleErrors = [], blockedRequests = [];
  page.on('pageerror', error => pageErrors.push(error.message));
  page.on('console', message => { if (message.type() === 'error') consoleErrors.push(message.text()); });
  await page.route('**/*', route => {
    if (route.request().url().startsWith(url)) return route.continue();
    blockedRequests.push(route.request().url());
    return route.abort();
  });
  const rpcCount = name => calls.filter(call => call.name === name).length;
  const submit = async form => page.locator('#' + form + ' button[type="submit"]').click();
  try {
    await page.goto(url);
    await page.locator('#nav-meeting').click();
    await page.locator('#meeting-submit').waitFor({ state: 'visible' });
    await page.waitForFunction(() => !document.getElementById('meeting-submit').disabled);
    for (const field of ['date', 'counterpartyId', 'assetClassId']) await invalidField(page, 'meeting-' + field, false);
    await page.locator('#meeting-notes').fill('保持する登録下書き');
    await page.locator('#meeting-date').fill('');
    await page.locator('#meeting-counterpartyId').selectOption('');
    await page.locator('#meeting-assetClassId').selectOption('');
    await submit('meeting-form');
    for (const field of ['date', 'counterpartyId', 'assetClassId']) await invalidField(page, 'meeting-' + field, true);
    assert.equal(await page.evaluate(() => document.activeElement.id), 'meeting-date');
    assert.equal(await page.locator('#meeting-notes').inputValue(), '保持する登録下書き');
    assert.equal(rpcCount('registerMeeting'), 0);
    await page.locator('#page-meeting > .card').screenshot({ path: path.join(out, `registration-${width}.png`) });
    await page.locator('#meeting-date').fill('2026-09-24');
    await invalidField(page, 'meeting-date', false);
    await page.locator('#meeting-assetClassId').selectOption('AC-1');
    await invalidField(page, 'meeting-assetClassId', false);
    await page.locator('#meeting-counterpartyId').selectOption('CP-1');
    await invalidField(page, 'meeting-counterpartyId', false);
    assert.doesNotMatch(await page.locator('#meeting-status').innerText(), /必須項目/);
    for (const [field, value] of [['date', '2026-09-24'], ['counterpartyId', 'CP-1'], ['assetClassId', 'AC-1']]) {
      const control = page.locator('#meeting-' + field);
      if (field === 'date') await control.fill(''); else await control.selectOption('');
      await submit('meeting-form');
      await invalidField(page, 'meeting-' + field, true);
      assert.equal(await page.evaluate(() => document.activeElement.id), 'meeting-' + field);
      assert.equal(rpcCount('registerMeeting'), 0);
      if (field === 'date') await control.fill(value); else await control.selectOption(value);
      await invalidField(page, 'meeting-' + field, false);
    }
    await page.locator('#meeting-counterpartyId').selectOption('');
    await submit('meeting-form');
    await invalidField(page, 'meeting-counterpartyId', true);
    await page.locator('#meeting-quick-add-counterparty').click();
    await page.locator('#counterparty-modal-type').selectOption('GP');
    await page.locator('#counterparty-modal-name').fill('追加した合成面談先');
    await page.locator('#counterparty-modal-submit').click();
    await page.waitForFunction(() => document.getElementById('meeting-counterpartyId').value === 'CP-NEW');
    await invalidField(page, 'meeting-counterpartyId', false);
    await submit('meeting-form');
    await page.waitForFunction(() => document.getElementById('meeting-status').textContent.includes('記録を保存しました'));
    assert.equal(rpcCount('registerMeeting'), 1);
    assert.equal(calls.find(call => call.name === 'registerMeeting').payload.notes, '保持する登録下書き');

    await page.locator('#nav-meeting-past').click();
    await page.locator('#meeting-past-search').click();
    await page.locator('[data-meeting-detail="MTG-1"]').click();
    await page.waitForFunction(() => document.getElementById('meeting-detail-identity').textContent.includes('MTG-1'));
    await page.locator('#meeting-detail-edit').click();
    await page.waitForFunction(() => document.getElementById('meeting-edit-id').textContent.includes('MTG-1'));
    await page.locator('#meeting-edit-notes').fill('未保存の編集本文');
    for (const field of ['date', 'counterpartyId', 'assetClassId']) {
      const control = page.locator('#meeting-edit-' + field);
      if (field === 'date') await control.fill(''); else await control.selectOption('');
    }
    await submit('meeting-edit-form');
    for (const field of ['date', 'counterpartyId', 'assetClassId']) await invalidField(page, 'meeting-edit-' + field, true);
    assert.equal(await page.evaluate(() => document.activeElement.id), 'meeting-edit-date');
    assert.equal(await page.locator('#meeting-edit-notes').inputValue(), '未保存の編集本文');
    assert.equal(await page.evaluate(() => meetingEditIsDirty()), true);
    assert.equal(rpcCount('updateMeetingMaintenance'), 0);
    await page.keyboard.press('Escape');
    await page.locator('#meeting-edit-card').screenshot({ path: path.join(out, `edit-${width}.png`) });
    await page.locator('#meeting-edit-date').fill('2026-09-24');
    await page.locator('#meeting-edit-counterpartyId').selectOption('CP-1');
    await page.locator('#meeting-edit-assetClassId').selectOption('AC-1');
    for (const field of ['date', 'counterpartyId', 'assetClassId']) await invalidField(page, 'meeting-edit-' + field, false);
    await submit('meeting-edit-form');
    await page.waitForFunction(() => document.getElementById('meeting-edit-id').textContent.includes('更新番号 2'));
    assert.equal(rpcCount('updateMeetingMaintenance'), 1);
    assert.equal(calls.find(call => call.name === 'updateMeetingMaintenance').payload.expectedVersion, 1);
    assert.equal(await page.evaluate(() => meetingEditIsDirty()), false);
    assert.equal(await page.locator('#meeting-edit-notes').inputValue(), '未保存の編集本文');
    const overflowPx = await page.evaluate(() => Math.max(0, document.documentElement.scrollWidth - innerWidth));
    assert.equal(overflowPx, 0);
    assert.deepEqual(pageErrors, []);
    assert.deepEqual(consoleErrors, []);
    assert.deepEqual(blockedRequests, []);
    return { viewport: width, overflowPx, registerCalls: rpcCount('registerMeeting'),
      editCalls: rpcCount('updateMeetingMaintenance'), pageErrors, consoleErrors, blockedRequests };
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
