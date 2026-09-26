// Production Knowledge Search HTML with isolated synthetic RPC replies only.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const http = require('node:http');
const os = require('node:os');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const out = process.env.KSP_UI_EVIDENCE_DIR ? path.resolve(process.env.KSP_UI_EVIDENCE_DIR) : path.join(os.tmpdir(), 'ksp-work0072-ui-evidence');
const { chromium } = require(process.env.KSP_PLAYWRIGHT_PATH || path.join(process.env.USERPROFILE, '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright'));

function render(name, parents = []) {
  assert.match(name, /^[A-Za-z0-9_-]+$/);
  assert.ok(!parents.includes(name), 'include cycle');
  return fs.readFileSync(path.join(root, 'src', name + '.html'), 'utf8')
    .replace(/<\?!=\s*include_\('([^']+)'\);?\s*\?>/g, (_, child) => render(child, [...parents, name]));
}
const html = render('Index').replace(/<\?!=\s*themeHeadMarkup\s*\?>/, '');
assert.doesNotMatch(html, /<\?[!=]/, 'production includes resolved');
const server = http.createServer((request, response) => {
  response.writeHead(request.url === '/' ? 200 : 204, { 'content-type': 'text/html;charset=utf-8' });
  response.end(request.url === '/' ? html : '');
});
const entity = { id: 'CP-SYNTH', name: 'Synthetic Counterparty', type: 'GP', status: 'Active' };
const secondEntity = { id: 'CP-SYNTH-2', name: 'Second Synthetic Counterparty', type: 'GP', status: 'Active' };
const options = {
  counterparties: [entity, secondEntity], gps: [entity, secondEntity], counterpartyEntities: [entity, secondEntity].map(item => ({ id: 'COUNTERPARTY:' + item.id, entityKey: 'COUNTERPARTY:' + item.id, name: item.name, type: 'GP', status: 'Active' })),
  counterpartyTypes: [{ id: 'GP', name: 'GP' }], assetClasses: [{ id: 'AC-SYNTH', name: 'Private Equity', status: 'Active' }],
  capitalTypes: [], teams: [{ id: 'TEAM-SYNTH', name: 'Synthetic Team', status: 'Active' }], locations: [], meetingTypes: [], fundStrategies: [],
  sourceTypes: [
    { id: 'Meeting', name: '面談メモ' }, { id: 'Pitchbook', name: '保存資料' },
    { id: 'News', name: 'ニュース' }, { id: 'Internal Assessment', name: '評価（ICメモ、社内整理等）' }
  ]
};
const fixtures = {
  getMeetingBootstrapData: { ok: true, options },
  getPitchbookBootstrapData: { ok: true, options, prepareRequestGeneration: 1 },
  getPhase1MaintenanceBootstrapData: { ok: true, options, masters: { counterparties: [entity], options: [] } },
  getSourceRecordBootstrapData: { ok: true, options, uploadFormats: [], assessmentTypes: [] },
  getKnowledgeSearchBootstrapData: {
    ok: true, options, providers: { OPENAI: { configured: false }, GEMINI: { configured: false } },
    modelPolicies: { OPENAI: { profiles: [{ profileId: 'synthetic-model', displayName: 'Synthetic model', isDefault: true,
      thinkingProfiles: [{ thinkingProfileId: 'provider-default', label: 'Default', isDefault: true }] }] }, GEMINI: { profiles: [] } },
    modeDefinitions: [{ mode: '要約', instruction: '資料を要約してください。', inputRequired: false }, { mode: '自由質問', inputRequired: true }]
  },
  getMeetingActivityAnalytics: { ok: true, filterOptions: {}, period: {}, headline: {}, series: [], breakdown: { items: [] }, drill: { records: [] } },
  previewKnowledgeExport: { ok: true, preview: { mode: '全文出力', scopeSummary: 'Synthetic 4-source scope', sourceIdCount: 4,
    sourceIds: ['MTG-SYNTH', 'DOC-SYNTH', 'NEWS-SYNTH', 'ASMT-SYNTH'], totalCharacterCount: 120,
    packageText: '面談メモ\nMeeting body\n保存資料\nPitchbook body\nニュース\nNews body\n評価（ICメモ、社内整理等）\n当時の社内評価',
    hardStop: false, noResults: false } }
};
const result = { ok: true, mode: '要約', scopeSummary: 'Synthetic authoritative scope', answer: 'Synthetic grounded answer',
  citations: [{ sourceType: 'Internal Assessment', sourceId: 'ASMT-SYNTH', title: 'Synthetic assessment',
    driveUrl: 'https://docs.google.com/document/d/synthetic-assessment/edit', date: '2026-09-25',
    provenanceSummary: '当時の社内評価' }], entityEvidence: [] };

async function run(browser, url, width) {
  const page = await browser.newPage({ viewport: { width, height: width === 1440 ? 900 : 844 } });
  const errors = [], blocked = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.route('**/*', route => {
    if (route.request().url().startsWith(url)) return route.continue();
    blocked.push(route.request().url());
    return route.abort();
  });
  await page.addInitScript(({ fixtures, result }) => {
    window.__knowledgeCalls = [];
    window.__knowledgeReplies = {};
    window.google = { script: { run: { withSuccessHandler(success) { return { withFailureHandler(failure) {
      return new Proxy({}, { get(_, name) { return payload => {
        window.__knowledgeCalls.push({ name, payload });
        const reply = Object.prototype.hasOwnProperty.call(window.__knowledgeReplies, name) ? window.__knowledgeReplies[name] :
          name === 'searchKnowledge' ? (payload && payload.queryPhase === 'POLL' ? result : { ok: true, pending: true, queryToken: 'QUERY-SYNTH', pollAfterMillis: 30000 }) :
          fixtures[name] || { ok: true };
        queueMicrotask(() => { try { success(typeof reply === 'function' ? reply(payload) : reply); } catch (error) { failure(error); } });
      }; } });
    } }; } } } };
  }, { fixtures, result });
  const calls = () => page.evaluate(() => window.__knowledgeCalls);
  const overflow = () => page.evaluate(() => Math.max(0, document.documentElement.scrollWidth - innerWidth));
  const checked = () => page.locator('#knowledge-source-group input[type="checkbox"]:checked').evaluateAll(nodes => nodes.map(node => node.value));
  try {
    await page.goto(url);
    await page.locator('#nav-knowledge').click();
    await page.waitForFunction(() => !document.getElementById('knowledge-submit').disabled);
    assert.deepEqual(await checked(), ['Meeting']);
    assert.equal(await page.locator('#knowledge-source-meeting').isChecked(), true);
    assert.equal(await overflow(), 0, width + ' initial overflow');

    await page.locator('#knowledge-source-meeting').focus();
    await page.keyboard.press('Space');
    assert.deepEqual(await checked(), []);
    assert.equal(await page.evaluate(() => document.activeElement.id), 'knowledge-source-meeting');
    assert.equal(await page.locator('#knowledge-submit').isDisabled(), true);
    assert.equal(await page.locator('#knowledge-full-output').isDisabled(), true);
    assert.match(await page.locator('#knowledge-status').textContent(), /情報ソースを1つ以上選択/);
    await page.keyboard.press('Space');
    assert.deepEqual(await checked(), ['Meeting']);

    await page.locator('#knowledge-source-assessment').focus();
    await page.keyboard.press('Space');
    assert.equal(await page.evaluate(() => document.activeElement.id), 'knowledge-source-assessment');
    await page.locator('#knowledge-source-news').focus();
    await page.keyboard.press('Space');
    await page.locator('#knowledge-source-pitchbook').focus();
    await page.keyboard.press('Space');
    assert.deepEqual(await checked(), ['Meeting', 'Pitchbook', 'News', 'Internal Assessment']);
    assert.equal(await overflow(), 0, width + ' mixed scope overflow');
    await page.screenshot({ path: path.join(out, 'knowledge-scope-' + width + '.png'), fullPage: false });

    await page.locator('#knowledge-teamId').selectOption('TEAM-SYNTH');
    assert.match(await page.locator('#knowledge-status').textContent(), /面談メモ.*のみ/);
    assert.deepEqual(await checked(), ['Meeting', 'Pitchbook', 'News', 'Internal Assessment']);
    const beforeConflict = (await calls()).filter(item => item.name === 'searchKnowledge').length;
    await page.locator('#knowledge-submit').click();
    assert.equal((await calls()).filter(item => item.name === 'searchKnowledge').length, beforeConflict);
    await page.locator('#knowledge-teamId').selectOption('');

    await page.locator('#knowledge-submit').click();
    await page.waitForFunction(() => document.getElementById('knowledge-status').textContent.includes('検索を処理中'));
    const pending = await page.locator('#knowledge-status').textContent();
    for (const label of ['面談メモ', '保存資料', 'ニュース', '評価（ICメモ、社内整理等）']) assert.ok(pending.includes(label), label + ' pending');
    await page.locator('#knowledge-recheck').click();
    await page.waitForFunction(() => document.getElementById('knowledge-answer').textContent.includes('Synthetic grounded answer'));
    const queryCalls = (await calls()).filter(item => item.name === 'searchKnowledge');
    assert.deepEqual(queryCalls[0].payload.filters.sourceTypes, ['Meeting', 'Pitchbook', 'News', 'Internal Assessment']);
    assert.equal(queryCalls[0].payload.filters.sourceType, undefined);
    const scope = await page.locator('#knowledge-result-scope').textContent();
    for (const label of ['面談メモ', '保存資料', 'ニュース', '評価（ICメモ、社内整理等）']) assert.ok(scope.includes(label), label + ' result');
    assert.match(await page.locator('#knowledge-citations').textContent(), /当時の社内評価/);

    await page.locator('#knowledge-full-output').click();
    await page.waitForFunction(() => document.getElementById('knowledge-export-body-preview').textContent.includes('Meeting body'));
    const exportCall = (await calls()).findLast(item => item.name === 'previewKnowledgeExport');
    assert.deepEqual(exportCall.payload.filters.sourceTypes, queryCalls[0].payload.filters.sourceTypes);
    assert.match(await page.locator('#knowledge-export-scope').textContent(), /面談メモ・保存資料・ニュース・評価（ICメモ、社内整理等）/);
    assert.equal(await overflow(), 0, width + ' export overflow');
    await page.screenshot({ path: path.join(out, 'knowledge-export-' + width + '.png'), fullPage: false });

    await page.locator('#knowledge-mode').selectOption('比較');
    await page.locator('#knowledge-entityKeys').selectOption(['COUNTERPARTY:CP-SYNTH', 'COUNTERPARTY:CP-SYNTH-2']);
    await page.locator('#knowledge-full-output').click();
    await page.waitForFunction(() => document.getElementById('knowledge-export-body-preview').textContent.includes('News body'));
    const comparisonExport = (await calls()).findLast(item => item.name === 'previewKnowledgeExport');
    assert.deepEqual(comparisonExport.payload.filters.sourceTypes, ['Meeting', 'Pitchbook', 'News', 'Internal Assessment']);
    assert.equal(comparisonExport.payload.filters.entityKey, '', 'comparison must clear a stale single Entity');
    assert.deepEqual(comparisonExport.payload.selectedEntityKeys, ['COUNTERPARTY:CP-SYNTH', 'COUNTERPARTY:CP-SYNTH-2']);
    assert.equal(comparisonExport.payload.filters.sourceTypes.filter(type => type === 'News').length, 1,
      'multi-Entity selection must send the News source category once');

    await page.reload();
    await page.locator('#nav-knowledge').click();
    await page.waitForFunction(() => !document.getElementById('knowledge-submit').disabled);
    assert.deepEqual(await checked(), ['Meeting'], 'fresh load must not restore source selection');
    assert.deepEqual(errors, []);
    assert.deepEqual(blocked, []);
    return { width, initial: ['Meeting'], mixed: queryCalls[0].payload.filters.sourceTypes, exportScope: exportCall.payload.filters.sourceTypes, overflowPx: await overflow(), pageErrors: errors.length, blockedRequests: blocked.length };
  } finally { await page.close(); }
}

async function main() {
  fs.mkdirSync(out, { recursive: true });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const url = 'http://127.0.0.1:' + server.address().port + '/';
  const browser = await chromium.launch({ channel: 'chromium', headless: true });
  try { for (const width of [1440, 390, 320]) console.log(JSON.stringify(await run(browser, url, width))); }
  finally { await browser.close(); await new Promise(resolve => server.close(resolve)); }
}
main().catch(error => { console.error(error.stack); process.exitCode = 1; });
