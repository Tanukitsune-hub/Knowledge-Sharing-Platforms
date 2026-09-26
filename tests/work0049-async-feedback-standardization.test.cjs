const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const read = relative => fs.readFileSync(path.join(root, relative), 'utf8');
const core = read('src/ClientCore.html');
const styles = read('src/Styles.html');
const index = read('src/Index.html');
const maintenance = read('src/ClientMaintenance.html');
const enhancements = read('src/ClientMaintenanceEnhancements.html');
const pitchbookFiles = read('src/ClientPitchbookFiles.html');
const pitchbookFlow = read('src/ClientPitchbookFlow.html');
const admin = read('src/ClientAiProviderSettings.html');
const modelSetup = read('src/ClientAiModelSetup.html');
const theme = read('src/ClientThemeSettings.html');
const analytics = read('src/ClientActivityAnalytics.html');
const knowledge = read('src/ClientKnowledgeSearch.html');

function fakeElement(tag = 'button') {
  const classes = new Set();
  return {
    tagName: tag.toUpperCase(), childNodes: [], disabled: false, textContent: '', style: { minWidth: '' }, attrs: {},
    classList: { add: name => classes.add(name), remove: name => classes.delete(name), contains: name => classes.has(name) },
    appendChild(child) { this.childNodes.push(child); return child; },
    replaceChildren(...children) { this.childNodes = children; },
    setAttribute(name, value) { this.attrs[name] = String(value); },
    getBoundingClientRect() { return { width: 124 }; }
  };
}

function loadBusyHelper() {
  const start = core.indexOf('const kspActionBusyStates=');
  const end = core.indexOf('function safeGet(', start);
  assert.ok(start >= 0 && end > start);
  const context = vm.createContext({ document: { createElement: tag => fakeElement(tag) } });
  vm.runInContext(core.slice(start, end), context, { filename: 'ClientCore.busy-helper.js' });
  return context;
}

test('shared action helper is idempotent, preserves nested nodes, and restores controls after failure paths', () => {
  const context = loadBusyHelper();
  const button = fakeElement();
  const icon = fakeElement('svg');
  const label = { textContent: '変更を保存' };
  button.childNodes = [icon, label];
  context.kspSetActionBusy(button, true, '保存中…');
  assert.equal(button.disabled, true);
  assert.equal(button.attrs['aria-busy'], 'true');
  assert.equal(button.classList.contains('ksp-action-busy'), true);
  assert.equal(button.style.minWidth, '124px');
  assert.equal(button.childNodes[0].childNodes[0].textContent, '保存中…');
  context.kspSetActionBusy(button, true, '更新中…');
  assert.equal(button.childNodes[0].childNodes[0].textContent, '更新中…');
  context.kspSetActionBusy(button, false);
  assert.equal(button.disabled, false);
  assert.equal(button.attrs['aria-busy'], 'false');
  assert.deepEqual(button.childNodes, [icon, label]);
  assert.equal(button.style.minWidth, '');
  context.kspSetActionBusy(button, false);
  assert.equal(button.disabled, false);
});

test('shared spinner uses currentColor, avoids layout shrink, and honors reduced motion', () => {
  assert.match(styles, /\.ksp-action-busy-content::before\{[^}]*border:2px solid currentColor[^}]*animation:ksp-status-spin \.75s linear infinite/);
  assert.match(styles, /@media\(prefers-reduced-motion:reduce\)[\s\S]*?\.ksp-action-busy-content::before\{animation:none!important\}/);
  assert.match(core, /getBoundingClientRect\(\)\.width/);
  assert.match(core, /style\.minWidth=Math\.ceil\(width\)\+'px'/);
  const busyCss = styles.slice(styles.indexOf('.ksp-action-busy{'), styles.indexOf('@keyframes ksp-status-spin'));
  assert.doesNotMatch(busyCss, /position:fixed|inset:0|progress/i);
});

function deferred() {
  let resolve;
  let reject;
  const promise = new Promise((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
}

function masterAddHarness(type) {
  const wait = deferred();
  const calls = [];
  const statuses = [];
  const controls = [{ disabled: false }, { disabled: false }];
  const input = { value: 'Synthetic ' + type, disabled: false };
  const button = { disabled: false, busyLabel: '', attrs: {}, setAttribute(name, value) { this.attrs[name] = String(value); } };
  const form = {
    attrs: {}, events: {},
    querySelector() { return button; },
    addEventListener(name, handler) { this.events[name] = handler; },
    setAttribute(name, value) { this.attrs[name] = String(value); }
  };
  const context = vm.createContext({
    Promise, String,
    activeMasterTab: type,
    masterMutationBusy: false,
    masterOptionAddRequest: null,
    masterOptionAddSequence: 0,
    masterOptionDrafts: { ASSET_CLASS: '', LOCATION: '', TEAM: '' },
    MASTER_TAB_LABELS: { ASSET_CLASS: 'アセットクラス', LOCATION: '面談場所', TEAM: 'チーム' },
    maintenanceBootstrap: { masters: { counterparties: [], options: [] } },
    document: { querySelectorAll() { return controls; } },
    el(id) { if (id === 'option-add-form') return form; if (id === 'option-add-name') return input; return { disabled: false }; },
    isMasterOptionTab(value) { return ['ASSET_CLASS', 'LOCATION', 'TEAM'].includes(value); },
    masterOrderDirty() { return false; },
    saveMasterOptionDraft(value) { context.masterOptionDrafts[value] = input.value; },
    async performMasterMutation(payload) { calls.push(payload); return wait.promise; },
    masterResetOrderDraft() {},
    renderMasters() { input.disabled = false; controls.forEach(node => { node.disabled = false; }); },
    showStatus(id, kind, message) { statuses.push({ id, kind, message }); },
    kspSetActionBusy(target, busy, labelText) { target.disabled = busy; target.busyLabel = busy ? labelText : ''; target.setAttribute('aria-busy', String(busy)); },
    kspSetRegionBusy(target, busy) { target.setAttribute('aria-busy', String(busy)); }
  });
  const start = maintenance.indexOf("el('option-add-form').addEventListener");
  const end = maintenance.indexOf('function masterClickHandler', start);
  vm.runInContext(maintenance.slice(start, end), context, { filename: 'ClientMaintenance.option-add.js' });
  return { context, wait, calls, statuses, controls, input, button, form };
}

for (const type of ['ASSET_CLASS', 'LOCATION', 'TEAM']) {
  test(`${type} Add shows first-click feedback, blocks a duplicate RPC, and restores controls`, async () => {
    const harness = masterAddHarness(type);
    const pending = harness.form.events.submit({ preventDefault() {}, currentTarget: harness.form });
    assert.equal(harness.calls.length, 1);
    assert.equal(harness.calls[0].action, 'ADD');
    assert.equal(harness.calls[0].type, type);
    assert.equal(harness.button.disabled, true);
    assert.equal(harness.button.attrs['aria-busy'], 'true');
    assert.equal(harness.button.busyLabel, '追加中…');
    assert.equal(harness.form.attrs['aria-busy'], 'true');
    assert.equal(harness.input.disabled, true);
    assert.equal(harness.controls.every(node => !node.disabled), true);
    assert.equal(harness.statuses.at(-1).kind, 'info busy');
    await harness.form.events.submit({ preventDefault() {}, currentTarget: harness.form });
    assert.equal(harness.calls.length, 1);
    harness.wait.resolve({ ok: true });
    await pending;
    assert.equal(harness.button.disabled, false);
    assert.equal(harness.button.attrs['aria-busy'], 'false');
    assert.equal(harness.input.disabled, false);
  });
}

test('Master Option Add failure restores controls and shows a visible error without retrying', async () => {
  const harness = masterAddHarness('ASSET_CLASS');
  const pending = harness.form.events.submit({ preventDefault() {}, currentTarget: harness.form });
  harness.wait.reject(new Error('synthetic failure'));
  await pending;
  assert.equal(harness.calls.length, 1);
  assert.equal(harness.button.disabled, false);
  assert.equal(harness.input.disabled, false);
  assert.equal(harness.statuses.at(-1).kind, 'error');
  assert.match(harness.statuses.at(-1).message, /synthetic failure/);
});

test('app-wide mutation and long-operation feedback matrix remains wired before each RPC', () => {
  const matrix = [
    ['Meeting registration', index, /setMeetingBusy\(true\)[\s\S]*?serverCall\('registerMeeting'/, /登録中…/],
    ['Meeting edit save', maintenance, /kspSetActionBusy\(submit,true,'保存中…'\)[\s\S]*?serverCall\('updateMeetingMaintenance'/, /meeting-edit-status','info busy/],
    ['Meeting delete', maintenance + enhancements, /kspSetActionBusy\([^,]+,true,'削除中…'\)[\s\S]*?serverCall\('changeMeetingStatus'/, /meeting-detail-status','info busy','削除中…/],
    ['Counterparty quick add', enhancements, /setCounterpartyModalBusy\(true\)[\s\S]*?serverCall\('quickAddCounterparty'/, /counterpartyModalStatus\('info busy','登録中…/],
    ['Material upload', pitchbookFlow, /setPitchbookBusy\(true,trigger\)[\s\S]*?serverCall\('preparePitchbookBatch'/, /資料を保存中…/],
    ['Material link or unlink', enhancements, /kspSetActionBusy\(trigger,true,operation==='remove'[\s\S]*?linkParentDocument\(documentId,operation\)/, /関連付け中…/],
    ['Pitchbook metadata save', maintenance, /kspSetActionBusy\(submit,true,'保存中…'\)[\s\S]*?serverCall\('updatePitchbookMaintenance'/, /pitchbook-edit-status','info busy/],
    ['Pitchbook deactivate or reactivate', maintenance, /kspSetActionBusy\(button,true,label\+'中…'\)[\s\S]*?serverCall\('changePitchbookStatus'/, /pitchbook-past-status','info busy/],
    ['Master rename', maintenance, /setMasterRenameModalBusy\(true\)[\s\S]*?performMasterMutation\(payload\)/, /masterRenameModalStatus\('info busy/],
    ['Master deactivate or reactivate', maintenance, /kspSetActionBusy\(status,true,actionLabel\+'中…'\)[\s\S]*?performMasterMutation/, /masters-status','info busy/],
    ['Master reorder', maintenance, /kspSetActionBusy\(button,true,'保存中…'\)[\s\S]*?action:'REORDER_BATCH'/, /並び順を保存中…/],
    ['Deleted record restore', admin, /kspSetActionBusy\(trigger,true,'復元中…'\)[\s\S]*?serverCall\(config\.status,\{\[config\.idKey\]:record\[config\.idKey\]\|\|record\.id,expectedVersion:record\.version,targetStatus:'Active'\}/, /admin-deleted-status','info busy/],
    ['Theme save and reset', theme, /themeSettingsSetBusy\(true,themeSettingsElement\('theme-settings-save'\),'保存中…'\)[\s\S]*?serverCall\('mutateThemeSettings'/, /themeSettingsSetBusy\(true,themeSettingsElement\('theme-settings-reset'\),'初期化中…'\)/],
    ['Provider stop', modelSetup, /kspSetActionBusy\(button,true,'停止中…'\)[\s\S]*?serverCall\('mutateAiProviderSettings'/, /接続を停止しました/],
    ['Provider model save', modelSetup, /aiSetupSetBusy\(true\)[\s\S]*?serverCall\(aiSetupCredentialMode\?'saveAiCredentialSetup':'saveAiModelSetup'/, /選択したモデルで4種類の合成資料を確認中/],
    ['Provider sync', modelSetup, /aiSetupSetBusy\(true\);aiSetupMessage\('ai-setup-sync-status','info busy','選択資料を同期中…'\)[\s\S]*?serverCall\('mutateAiProviderSettings'/, /aiProviderAdminSyncMessage/],
    ['Analytics Admin Check', analytics, /checkbox\.setAttribute\('aria-busy','true'\)[\s\S]*?serverCall\('updateMeetingAdminCheck'/, /activity-admin-check-status','info busy/],
    ['AI search and pending', knowledge, /kShowStatus\('info busy','AI検索を開始中…'\);kSetBusy\(true\)[\s\S]*?kStartKnowledgeQuery/, /kShowPendingStatus[\s\S]*?busy/],
    ['Full Output Docs PDF', knowledge, /kSetExportBusy\(true,trigger,label\)[\s\S]*?kServerCall\('createKnowledgeExport'/, /PDFを作成中…/]
  ];
  for (const [name, source, beforeRpc, feedback] of matrix) {
    assert.match(source, beforeRpc, `${name}: busy feedback must start before RPC`);
    assert.match(source, feedback, `${name}: operation-specific feedback missing`);
  }
});

test('async form handlers retain their form reference across await boundaries', () => {
  assert.match(maintenance, /const form=event\.currentTarget,payload=/);
  assert.match(maintenance, /finally\{pitchbookMutationBusy=false;[\s\S]*?form\.querySelectorAll/);
  assert.match(maintenance, /const form=event\.currentTarget,type=activeMasterTab/);
  assert.doesNotMatch(maintenance, /finally\{[^}]*event\.currentTarget\.querySelectorAll/);
});

test('Work0048 manual-search-only wiring remains unchanged by async feedback', () => {
  assert.match(admin, /nav-ai-provider-settings'\)\.addEventListener\('click',\(\)=>loadAiProviderAdminData\(false\)\)/);
  assert.doesNotMatch(admin, /nav-ai-provider-settings'[\s\S]{0,180}searchAdminDeletedMeetings/);
  assert.doesNotMatch(admin, /selectAdminTab\([^)]*\)[\s\S]{0,180}searchAdminDeletedMeetings/);
});
