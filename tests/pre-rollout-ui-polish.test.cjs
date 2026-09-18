const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const source = name => fs.readFileSync(path.join(__dirname, '..', 'src', name), 'utf8');

function loadDateControls(dateInputs = []) {
  const nodes = new Map();
  function node(id = '') {
    const classes = new Set();
    return {
      id, value: '', disabled: false, readOnly: false, options: [], dataset: {}, listeners: {},
      classList: { add: value => classes.add(value), remove: value => classes.delete(value), toggle: (value, on) => on ? classes.add(value) : classes.delete(value) },
      addEventListener(name, handler) { (this.listeners[name] ??= []).push(handler); },
      appendChild() {},
      querySelectorAll() { return []; }
    };
  }
  const document = {
    getElementById(id) { if (!nodes.has(id)) nodes.set(id, node(id)); return nodes.get(id); },
    querySelectorAll(selector) { return selector === 'input[type="date"]' ? dateInputs : []; },
    createElement() { return node(); }
  };
  const context = vm.createContext({ document, window: {}, localStorage: { getItem() { return null; }, setItem() {}, removeItem() {} }, console, Date, Intl, Object, Array, String, Number, Boolean, Set, Map });
  const script = source('ClientDateControls.html').match(/<script>([\s\S]*?)<\/script>/)[1];
  vm.runInContext(script, context, { filename: 'ClientDateControls.html' });
  return { context, nodes };
}

test('Tokyo default period is shared and preserves the Feb 29 anniversary rule', () => {
  const { context } = loadDateControls();
  assert.deepEqual(
    JSON.parse(JSON.stringify(context.kspDefaultDateRange(new Date('2024-02-29T03:00:00Z')))),
    { from: '2021-02-28', to: '2024-02-29' }
  );
  assert.deepEqual(
    JSON.parse(JSON.stringify(context.kspDefaultDateRange(new Date('2026-09-18T03:00:00Z')))),
    { from: '2023-09-18', to: '2026-09-18' }
  );
  const combined = [
    source('ClientKnowledgeSearch.html'), source('ClientMaintenance.html'),
    source('ClientActivityAnalytics.html'), source('ClientRelationshipExplorer.html'),
    source('ClientBootstrap.html')
  ].join('\n');
  for (const pair of [
    ['knowledge-dateFrom', 'knowledge-dateTo'],
    ['meeting-past-dateFrom', 'meeting-past-dateTo'],
    ['pitchbook-past-dateFrom', 'pitchbook-past-dateTo'],
    ['activity-date-from', 'activity-date-to'],
    ['relationship-date-from', 'relationship-date-to']
  ]) assert.ok(combined.includes(`kspSetDefaultDateRange('${pair[0]}','${pair[1]}')`), pair.join(' / '));
});

test('all date controls retain native date type and supported pickers open safely once per interaction', () => {
  let opened = 0;
  const dateInput = {
    disabled: false, readOnly: false, dataset: {}, listeners: {},
    addEventListener(name, handler) { (this.listeners[name] ??= []).push(handler); },
    showPicker() { opened += 1; }
  };
  const fallback = {
    disabled: false, readOnly: false, dataset: {}, listeners: {},
    addEventListener(name, handler) { (this.listeners[name] ??= []).push(handler); }
  };
  const { context } = loadDateControls([dateInput, fallback]);
  context.kspInstallNativeDatePickers(context.document);
  dateInput.listeners.focus[0]({ currentTarget: dateInput });
  dateInput.listeners.click[0]({ currentTarget: dateInput });
  fallback.listeners.click[0]({ currentTarget: fallback });
  assert.equal(opened, 1);
  const html = fs.readdirSync(path.join(__dirname, '..', 'src')).filter(name => name.endsWith('.html')).map(source).join('\n');
  for (const id of ['meeting-date','meeting-edit-date','pitchbook-edit-date','knowledge-dateFrom','knowledge-dateTo','meeting-past-dateFrom','meeting-past-dateTo','activity-date-from','activity-date-to','relationship-date-from','relationship-date-to']) {
    assert.match(html, new RegExp(`id="${id}" type="date"`), id);
  }
});

test('saved-parent recovery exposes the new-record action before the disabled form', () => {
  const index = source('Index.html');
  assert.ok(index.indexOf('id="meeting-entry-actions"') < index.indexOf('id="meeting-form"'));
  assert.equal((index.match(/id="meeting-clear"/g) || []).length, 1);
  const flow = source('ClientPitchbookFlow.html');
  assert.match(flow, /meeting-entry-actions/);
  assert.match(flow, /meeting-clear'\)\.disabled=false/);
  assert.match(flow, /新しい記録を入力/);
  assert.match(source('ClientCore.html'), /window\.scrollTo\(\{top:0,behavior:'auto'\}\)/);
});

test('Past Meetings presents one counterparty concept without a related-GP filter or row subline', () => {
  const page = source('MaintenancePages.html');
  assert.doesNotMatch(page, /meeting-past-relatedGpId/);
  assert.match(page, /<th>面談先<\/th>/);
  const client = source('ClientMaintenance.html');
  const renderer = client.match(/function renderMeetingResults\(records\)\{[^\n]+/)[0];
  assert.match(renderer, /counterpartyEntityName\|\|record\.gpName/);
  assert.doesNotMatch(renderer, /関連GP|relatedGpNames/);
  assert.doesNotMatch(client, /relatedGpId:el\(prefix\+'-relatedGpId'\)\?/, 'legacy related-GP payload is absent');
});

test('user-facing forms use coherent bounded field widths and keep long fields full width', () => {
  const styles = source('Styles.html');
  assert.match(styles, /width:min\(100%,30ch\)/);
  assert.match(styles, /input\[type=date\][^\{]*\{width:min\(100%,17ch\)/);
  assert.match(styles, /\.field\.full\{grid-column:1\/-1\}/);
  assert.match(styles, /\.table-wrap\{max-width:100%\}/);
  assert.match(styles, /record-entry-actions/);
  const knowledge = source('KnowledgeSearchPage.html');
  assert.match(knowledge, /grid-template-columns:repeat\(12,minmax\(0,1fr\)\)/);
  assert.match(knowledge, /knowledge-counterparty-field\{grid-column:1\/span 4\}/);
});
