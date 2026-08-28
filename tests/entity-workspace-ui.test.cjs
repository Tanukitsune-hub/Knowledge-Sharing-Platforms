const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const page = fs.readFileSync(path.join(root, 'src', 'EntityWorkspacePage.html'), 'utf8');
const client = fs.readFileSync(path.join(root, 'src', 'ClientEntityWorkspace.html'), 'utf8');
const index = fs.readFileSync(path.join(root, 'src', 'Index.html'), 'utf8');
const clientScript = client.match(/<script>([\s\S]*?)<\/script>/)[1];

function workspaceData() {
  return {
    ok: true,
    entity: { entityKey: 'LP_ASSET_OWNER:LP-1', counterpartyType: 'LP_ASSET_OWNER', counterpartyTypeLabel: 'LP / Asset Owner', counterpartyId: 'LP-1', name: 'Synthetic LP', status: 'Active', mode: 'NON_GP' },
    summary: { meetingCount: 1, activeMeetingCount: 1, directMeetingCount: 1, relatedMeetingCount: 0, pitchbookCount: 1, pitchbookActiveCount: 1, openFollowUpCount: 0, relationshipCount: 1, latestActivityDate: '2026-08-27' },
    meetings: { all: { totalCount: 1, records: [{ meetingId: 'MTG-1', date: '2026-08-27', activityScope: 'direct', activityScopeLabel: 'Direct', counterpartyTypeLabel: 'LP / Asset Owner', counterpartyEntityName: 'Synthetic LP', teamName: 'PD', fundStrategy: 'Synthetic Fund', status: 'Active', documentUrl: '' }], omittedCount: 0 }, direct: { totalCount: 1, records: [], omittedCount: 0 }, related: { totalCount: 0, records: [], omittedCount: 0 } },
    pitchbooks: { totalCount: 1, records: [{ documentId: 'DOC-1', date: '2026-08-27', gpId: 'GP-1', gpName: 'Synthetic GP', fundStrategy: 'Synthetic Fund', status: 'Active', fileUrl: '' }], omittedCount: 0 },
    linkedPitchbooks: { totalCount: 1, records: [{ documentId: 'DOC-1', date: '2026-08-27', gpId: 'GP-1', gpName: 'Synthetic GP', fundStrategy: 'Synthetic Fund', status: 'Active', fileUrl: '' }], omittedCount: 0 },
    ownedPitchbooks: { totalCount: 0, records: [], omittedCount: 0 },
    relatedGps: [{ id: 'GP-1', name: 'Synthetic GP', status: 'Active' }],
    fundStrategies: { totalCount: 1, records: [{ text: 'Synthetic Fund', meetingCount: 1, pitchbookCount: 1, directMeetingCount: 1, relatedMeetingCount: 0, latestDate: '2026-08-27', openFollowUpCount: 0, relationshipCount: 1 }], omittedCount: 0 },
    followUps: { totalCount: 0, records: [], omittedCount: 0 },
    mixes: { teams: [{ label: 'PD', count: 1 }], assetClasses: [{ label: 'Infrastructure', count: 1 }], meetingTypes: [{ label: '定例年1回', count: 1 }] },
    relationships: [{ meetingId: 'MTG-1', date: '2026-08-27', fundStrategy: 'Synthetic Fund', relatedPitchbooks: [{ documentId: 'DOC-1', savedFilename: 'synthetic.pdf', status: 'Active', fileUrl: '' }] }],
    timeline: { totalCount: 3, records: [{ kind: 'Meeting', id: 'MTG-1', date: '2026-08-27', status: 'Active', sourceUrl: '' }], omittedCount: 2 },
    drillDown: null,
    omittedCounts: { directMeetings: 0, relatedMeetings: 0, pitchbooks: 0, fundStrategies: 0, followUps: 0, relationships: 0, timeline: 2 }
  };
}

function executeClient(serverCall) {
  const nodes = new Map();
  function node(id) {
    if (!nodes.has(id)) {
      const classes = new Set();
      nodes.set(id, {
        id, value: '', disabled: false, innerHTML: '', textContent: '', className: '', options: [],
        classList: { add(name) { classes.add(name); }, remove(name) { classes.delete(name); }, toggle(name, value) { if (value) classes.add(name); else classes.delete(name); }, contains(name) { return classes.has(name); } },
        addEventListener(type, listener) { this['_listener_' + type] = listener; },
        appendChild(child) { this.options.push(child); },
        closest() { return null; }
      });
    }
    return nodes.get(id);
  }
  let printCalls = 0;
  const context = {
    el: node,
    document: { createElement() { return { value: '', textContent: '' }; } },
    kspEscapeHtml(value) { return String(value == null ? '' : value); },
    kspSafeDriveUrl(value) { return String(value || ''); },
    showStatus() {},
    serverCall,
    window: { print() { printCalls += 1; } }
  };
  vm.runInNewContext(clientScript, context, { filename: 'ClientEntityWorkspace.js' });
  return { context, node, getPrintCalls: () => printCalls };
}

test('Entity Workspace is integrated, read-only, and has bounded print markup', () => {
  assert.match(index, /id="nav-entity-workspace"[^>]*type="button">Entity Workspace<\/button>/);
  assert.match(index, /include_\('EntityWorkspacePage'\)/);
  assert.match(index, /include_\('ClientEntityWorkspace'\)/);
  assert.match(page, /id="page-entity-workspace"/);
  assert.match(page, /id="entity-workspace-type"/);
  assert.match(page, /id="entity-workspace-entity"/);
  assert.match(page, /id="entity-workspace-fund"/);
  assert.match(page, /id="entity-workspace-print-button"/);
  assert.match(client, /serverCall\('getEntityWorkspaceData'/);
  assert.match(client, /window\.print\(\)/);
  assert.doesNotMatch(client, /registerMeeting|updateMeetingMaintenance|mutateMaster|createKnowledgeExport|localStorage|appendRow|Audit/);
  const ids = Array.from(page.matchAll(/\bid="([^"]+)"/g), match => match[1]);
  assert.equal(new Set(ids).size, ids.length);
});

test('Entity Workspace client loads catalog, selected entity, exact drill, and print without writes', async () => {
  const calls = [];
  const data = workspaceData();
  const runtime = executeClient(async (method, payload) => {
    calls.push([method, payload]);
    if (!payload.entityKey) return { ok: true, entityTypes: [{ code: 'GP', label: 'GP / 運用会社', entityCount: 1 }, { code: 'LP_ASSET_OWNER', label: 'LP / Asset Owner', entityCount: 1 }], entityOptions: [{ entityKey: 'LP_ASSET_OWNER:LP-1', type: 'LP_ASSET_OWNER', id: 'LP-1', name: 'Synthetic LP', status: 'Active' }] };
    if (!payload.fundStrategy) return data;
    return { ...data, drillDown: { selected: payload.fundStrategy, counts: { meetings: 1, pitchbooks: 1, relationships: 1 }, meetings: { records: data.meetings.all.records, totalCount: 1, omittedCount: 0 }, pitchbooks: { records: data.pitchbooks.records, totalCount: 1, omittedCount: 0 }, relationships: { records: data.relationships, totalCount: 1, omittedCount: 0 }, omittedCounts: { meetings: 0, pitchbooks: 0, relationships: 0 } } };
  });
  await runtime.context.loadEntityWorkspaceCatalog();
  assert.deepEqual(calls.map(call => call[0]), ['getEntityWorkspaceData']);
  runtime.node('entity-workspace-type').value = 'LP_ASSET_OWNER';
  runtime.context.entityWorkspacePopulateEntities('LP_ASSET_OWNER', 'LP_ASSET_OWNER:LP-1');
  runtime.node('entity-workspace-entity').value = 'LP_ASSET_OWNER:LP-1';
  await runtime.context.loadEntityWorkspace();
  assert.equal(calls.length, 2);
  assert.match(runtime.node('entity-workspace-name').textContent, /Synthetic LP/);
  assert.match(runtime.node('entity-workspace-related-gps').innerHTML, /Related GP/);
  await runtime.context.loadEntityWorkspaceFund('Synthetic Fund');
  assert.equal(calls.length, 3);
  assert.match(runtime.node('entity-workspace-drill').innerHTML, /Synthetic Fund/);
  runtime.node('entity-workspace-print-button').onclick();
  assert.equal(runtime.getPrintCalls(), 1);
  assert.equal(calls.length, 3);
});
