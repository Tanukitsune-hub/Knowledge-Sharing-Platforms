// Production HTML and client scripts with local synthetic RPC responses only.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const http = require('node:http');
const os = require('node:os');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const out = process.env.KSP_UI_EVIDENCE_DIR
  ? path.resolve(process.env.KSP_UI_EVIDENCE_DIR)
  : path.join(os.tmpdir(), 'ksp-work0061-result-browser');
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
const catalog = { ok: true, entityOptions: [
  { entityKey: 'GP:A', id: 'A', type: 'GP', name: '合成面談先 A', status: 'Active' },
  { entityKey: 'GP:B', id: 'B', type: 'GP', name: '合成面談先 B', status: 'Active' }
] };
const options = { gps: [], counterpartyEntities: catalog.entityOptions.map(item => ({
  id: item.entityKey, entityKey: item.entityKey, type: item.type, name: item.name, status: item.status
})), counterpartyTypes: [], assetClasses: [], capitalTypes: [], teams: [], locations: [],
meetingTypes: [], fundStrategies: [], relatedPitchbooks: [] };
const fixtures = {
  getMeetingBootstrapData: { ok: true, options },
  getPitchbookBootstrapData: { ok: true, options },
  getPhase1MaintenanceBootstrapData: { ok: true, options, masters: { counterparties: [], options: [] } },
  getKnowledgeSearchBootstrapData: { ok: true,
    providers: { OPENAI: { configured: true }, GEMINI: { configured: false } },
    modelPolicies: { OPENAI: { profiles: [{ profileId: 'model-1', displayName: '合成モデル',
      isDefault: true, thinkingProfiles: [{ thinkingProfileId: 'low', label: 'Low', isDefault: true }] }] } },
    modeDefinitions: [
      { mode: '自由質問', inputRequired: true, instruction: '' },
      { mode: '要約', inputRequired: false, instruction: '要約してください。' },
      { mode: '時系列', inputRequired: false, instruction: '時系列で整理してください。' },
      { mode: '比較', inputRequired: false, instruction: '比較してください。' },
      { mode: '面談準備', targetRequired: true, instruction: '面談準備をしてください。' }
    ], options },
  getEntityWorkspaceData: catalog
};
function entityData(key) {
  const name = key === 'GP:A' ? '合成面談先 A' : '合成面談先 B';
  const fund = key === 'GP:A' ? 'Fund A' : 'Fund B';
  return { ok: true, entity: { entityKey: key, name, status: 'Active', mode: 'GP' },
    summary: { activeMeetingCount: 1, pitchbookActiveCount: 0, latestDirectMeetingDate: '2026-09-24' },
    fundStrategies: { records: [{ text: fund, meetingCount: 1, pitchbookCount: 0,
      directMeetingCount: 1, relatedMeetingCount: 0, latestDate: '2026-09-24', relationshipCount: 0 }], omittedCount: 0 },
    meetings: { all: { records: [], omittedCount: 0 }, direct: { records: [], omittedCount: 0 },
      related: { records: [], omittedCount: 0 } },
    pitchbooks: { records: [], omittedCount: 0 }, relationships: [], timeline: { records: [], omittedCount: 0 },
    mixes: { teams: [], assetClasses: [], meetingTypes: [] }, drillDown: null, omittedCounts: {} };
}
const answer = text => ({ ok: true, mode: '自由質問', scopeSummary: '合成資料', answer: text,
  effectiveSelection: { modelProfileId: 'model-1', thinkingProfileId: 'low' },
  citations: [], entityEvidence: [] });

async function runViewport(browser, url, width, height) {
  const page = await browser.newPage({ viewport: { width, height } });
  const pageErrors = [], consoleErrors = [], blockedRequests = [];
  page.on('pageerror', error => pageErrors.push(error.message));
  page.on('console', message => { if (['error', 'warning'].includes(message.type())) consoleErrors.push(message.text()); });
  await page.route('**/*', route => {
    if (route.request().url().startsWith(url)) return route.continue();
    blockedRequests.push(route.request().url());
    return route.abort();
  });
  await page.addInitScript(data => {
    window.__rpc = { calls: [], held: [] };
    window.google = { script: { run: { withSuccessHandler(success) {
      return { withFailureHandler(failure) {
        return new Proxy({}, { get(_, name) { return payload => {
          window.__rpc.calls.push({ name, payload });
          if (name === 'searchKnowledge' || (name === 'getEntityWorkspaceData' && payload && payload.entityKey))
            window.__rpc.held.push({ name, payload, success, failure });
          else queueMicrotask(() => success(data[name] || { ok: true }));
        }; } });
      } };
    } } } };
  }, fixtures);
  const waitHeld = async count => page.waitForFunction(n => window.__rpc.held.length >= n, count);
  const resolve = (index, result) => page.evaluate(({ index, result }) => window.__rpc.held[index].success(result), { index, result });
  try {
    await page.goto(url);
    assert.equal(page.url(), url);
    assert.equal(await page.title(), 'Alternative Assets Intelligence');
    assert.match(await page.locator('#page-knowledge').innerText(), /AI検索モード/);
    assert.doesNotMatch(await page.locator('body').innerText(), /Internal Server Error|Vite error|Next.js error/);
    await page.waitForFunction(() => !document.getElementById('knowledge-submit').disabled);
    await page.locator('#knowledge-mode').selectOption('自由質問');
    await page.locator('#knowledge-instruction').fill('質問 A');
    await page.locator('#knowledge-submit').click();
    await waitHeld(1);
    await resolve(0, answer('回答 A'));
    await page.waitForFunction(() => document.getElementById('knowledge-answer').textContent === '回答 A');
    assert.equal(await page.locator('#knowledge-result').isVisible(), true);
    await page.locator('#knowledge-instruction').fill('質問 B');
    assert.equal(await page.locator('#knowledge-result').isVisible(), false);
    await page.locator('#knowledge-submit').click();
    await waitHeld(2);
    await page.locator('#knowledge-instruction').fill('質問 C');
    await resolve(1, answer('遅い回答 B'));
    assert.equal(await page.locator('#knowledge-result').isVisible(), false);
    assert.doesNotMatch(await page.locator('#knowledge-status').innerText(), /回答しました/);
    await page.locator('#knowledge-submit').click();
    await waitHeld(3);
    await resolve(2, { ok: true, pending: true, queryToken: 'synthetic-token', pollAfterMillis: 30000 });
    await page.waitForFunction(() => !document.getElementById('knowledge-recheck').hidden);
    const stored = await page.evaluate(() => sessionStorage.getItem('ksp.knowledge.query.v1'));
    assert.ok(stored);
    assert.doesNotMatch(stored, /質問 C/);
    await page.locator('#knowledge-recheck').click();
    await waitHeld(4);
    await page.locator('#knowledge-instruction').fill('質問 D');
    await resolve(3, answer('遅いpoll回答 C'));
    assert.equal(await page.locator('#knowledge-result').isVisible(), false);
    assert.doesNotMatch(await page.locator('#knowledge-status').innerText(), /回答しました/);
    assert.equal(await page.evaluate(() => sessionStorage.getItem('ksp.knowledge.query.v1')), null);
    await page.locator('#knowledge-submit').click();
    await waitHeld(5);
    await resolve(4, answer('現在の回答 D'));
    await page.waitForFunction(() => document.getElementById('knowledge-answer').textContent === '現在の回答 D');
    assert.equal(await page.locator('#knowledge-result').isVisible(), true);
    await page.locator('#knowledge-result').scrollIntoViewIfNeeded();
    await page.screenshot({ path: path.join(out, `knowledge-${width}.png`), fullPage: false });

    await page.locator('#nav-entity-workspace').click();
    await page.waitForFunction(() => document.querySelectorAll('#entity-workspace-entity option').length >= 3);
    await page.locator('#entity-workspace-entity').selectOption('GP:A');
    await waitHeld(6);
    await resolve(5, entityData('GP:A'));
    await page.waitForFunction(() => document.getElementById('entity-workspace-name').textContent === '合成面談先 A');
    await page.locator('#entity-workspace-entity').selectOption('GP:B');
    await waitHeld(7);
    assert.equal(await page.locator('#entity-workspace-content').isVisible(), false);
    assert.match(await page.locator('#entity-workspace-status').innerText(), /合成面談先 B.*読み込んでいます/);
    await resolve(6, { ok: false, error: { message: '合成読込失敗' } });
    await page.waitForFunction(() => document.getElementById('entity-workspace-status').textContent.includes('合成読込失敗'));
    assert.equal(await page.locator('#entity-workspace-content').isVisible(), false);
    assert.match(await page.locator('#entity-workspace-status').innerText(), /合成面談先 B/);
    await page.locator('#entity-workspace-entity').selectOption('GP:A');
    await waitHeld(8);
    await page.locator('#entity-workspace-entity').selectOption('GP:B');
    await waitHeld(9);
    await resolve(8, entityData('GP:B'));
    await page.waitForFunction(() => document.getElementById('entity-workspace-name').textContent === '合成面談先 B');
    await resolve(7, entityData('GP:A'));
    assert.equal(await page.locator('#entity-workspace-name').innerText(), '合成面談先 B');
    await page.locator('#entity-workspace-fund').selectOption('Fund B');
    await waitHeld(10);
    const drill = entityData('GP:B');
    drill.drillDown = { selected: 'Fund B', counts: { meetings: 0, pitchbooks: 0, relationships: 0 },
      meetings: { records: [] }, pitchbooks: { records: [] }, relationships: { records: [] } };
    await resolve(9, drill);
    await page.waitForFunction(() => document.getElementById('entity-workspace-drill').textContent.includes('詳細: Fund B'));
    await page.locator('#entity-workspace-content').scrollIntoViewIfNeeded();
    await page.screenshot({ path: path.join(out, `entity-${width}.png`), fullPage: false });
    const overflowPx = await page.evaluate(() => Math.max(0, document.documentElement.scrollWidth - innerWidth));
    assert.equal(overflowPx, 0);
    assert.deepEqual(pageErrors, []);
    assert.deepEqual(consoleErrors, []);
    assert.deepEqual(blockedRequests, []);
    return { viewport: width, title: await page.title(), overflowPx,
      localRpcCount: await page.evaluate(() => window.__rpc.calls.length), pageErrors, consoleErrors, blockedRequests };
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
