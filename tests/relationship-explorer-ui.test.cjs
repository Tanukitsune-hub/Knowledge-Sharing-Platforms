const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const page = fs.readFileSync(path.join(root, 'src', 'RelationshipExplorerPage.html'), 'utf8');
const client = fs.readFileSync(path.join(root, 'src', 'ClientRelationshipExplorer.html'), 'utf8');
const clientScript = client.match(/<script>([\s\S]*?)<\/script>/)[1];

function explorerData() {
  const meeting = {
    meetingId: 'MTG-000001', date: '2026-08-20', time: '09:30',
    counterpartyType: 'LP_ASSET_OWNER', counterpartyTypeLabel: 'LP / Asset Owner',
    counterpartyId: 'LP-1', counterpartyEntityKey: 'LP_ASSET_OWNER:LP-1',
    counterpartyEntityName: 'Synthetic LP', relatedGpIds: ['GP-2'], relatedGpNames: ['Synthetic GP Two'],
    assetClassId: 'AC-1', assetClassName: 'Infrastructure', teamId: 'TEAM-1', teamName: 'PD',
    fundStrategy: 'Meeting Fund', status: 'Active', documentUrl: '', relatedPitchbookIds: ['DOC-1']
  };
  const pitchbook = {
    documentId: 'DOC-1', date: '2026-08-19', gpId: 'GP-2', gpName: 'Synthetic GP Two',
    assetClassId: 'AC-1', assetClassName: 'Infrastructure', fundStrategy: 'Pitchbook Fund',
    status: 'Inactive', savedFilename: 'DOC-1.pdf', fileUrl: 'https://drive.google.com/file/d/file-1/view'
  };
  return {
    ok: true, workId: '0018', summary: {
      relationships: 1, meetings: 1, pitchbooks: 1, unresolved: 0,
      inactiveMeetings: 0, inactivePitchbooks: 1
    },
    filterOptions: {
      counterpartyTypes: [{ value: 'LP_ASSET_OWNER', label: 'LP / Asset Owner' }],
      counterpartyEntities: [{ value: meeting.counterpartyEntityKey, label: 'Synthetic LP / ' + meeting.counterpartyEntityKey }],
      relatedGps: [{ value: 'GP-2', label: 'Synthetic GP Two / GP-2' }],
      pitchbookGps: [{ value: 'GP-2', label: 'Synthetic GP Two / GP-2' }],
      assetClasses: [{ value: 'AC-1', label: 'Infrastructure / AC-1' }],
      fundStrategies: [{ value: 'Meeting Fund', label: 'Meeting Fund' }],
      meetingStatuses: [{ value: 'Active', label: 'Active' }],
      pitchbookStatuses: [{ value: 'Inactive', label: 'Inactive' }]
    },
    forward: { totalCount: 1, omittedCount: 0, records: [{ ...meeting, relatedPitchbooks: [pitchbook], relatedPitchbookCount: 1, fullRelatedPitchbookCount: 1 }] },
    reverse: { totalCount: 1, omittedCount: 0, records: [{ ...pitchbook, referencingMeetings: [meeting], referencingMeetingCount: 1, fullReferencingMeetingCount: 1 }] },
    readModel: { documentBodyRead: false, pitchbookBytesRead: false, auditRead: false },
    sideEffects: { writes: 0, auditWrites: 0, aiCalls: 0 }
  };
}

function executeClient(serverCall) {
  const nodes = new Map();
  function node(id) {
    if (!nodes.has(id)) {
      const classes = new Set();
      nodes.set(id, {
        id, value: '', innerHTML: '', textContent: '', options: [],
        classList: {
          add(name) { classes.add(name); },
          remove(name) { classes.delete(name); },
          contains(name) { return classes.has(name); }
        },
        addEventListener(type, listener) { this['_listener_' + type] = listener; },
        appendChild(child) { this.options.push(child); },
        insertAdjacentHTML(position, html) { this.innerHTML += html; }
      });
    }
    return nodes.get(id);
  }
  const context = {
    el: node,
    document: { createElement() { return { value: '', textContent: '' }; } },
    kspSafeDriveUrl(value) { return String(value || ''); },
    kspEscapeHtml(value) { return String(value == null ? '' : value); },
    clearStatus() {},
    showStatus() {},
    serverCall,
    showPage(name) { context._shownPage = name; }
  };
  vm.runInNewContext(clientScript, context, { filename: 'ClientRelationshipExplorer.js' });
  return { context, node };
}

test('Relationship Explorer page exposes accessible filters and both tabular directions', () => {
  assert.match(page, /id="page-relationship-explorer" class="page"/);
  for (const id of [
    'relationship-date-from', 'relationship-date-to', 'relationship-counterparty-type',
    'relationship-counterparty-entity', 'relationship-related-gp', 'relationship-pitchbook-gp',
    'relationship-asset-class', 'relationship-fund-strategy', 'relationship-meeting-status',
    'relationship-pitchbook-status', 'relationship-forward-results', 'relationship-reverse-results',
    'relationship-forward-detail', 'relationship-reverse-detail'
  ]) assert.match(page, new RegExp(`id="${id}"`));
  assert.match(page, /<caption class="sr-only">MeetingからPitchbookへの明示的関係<\/caption>/);
  assert.match(page, /<caption class="sr-only">PitchbookからMeetingへの逆引き関係<\/caption>/);
  assert.match(page, /Meeting Counterparty/);
  assert.match(page, /Pitchbook GP/);
  assert.match(client, /serverCall\('getRelationshipExplorerData'/);
  assert.equal((client.match(/serverCall\('getRelationshipExplorerData'/g) || []).length, 1);
  assert.doesNotMatch(client, /registerMeeting|updateMeetingMaintenance|changeMeetingStatus|createKnowledgeExport|DocumentApp|DriveApp|appendRow|Audit/);
});

test('Relationship Explorer client loads read-only data and renders distinct counterparty/GP details', async () => {
  const calls = [];
  const runtime = executeClient(async (method, payload) => {
    calls.push([method, payload]);
    return explorerData();
  });
  await runtime.context.loadRelationshipExplorer();
  assert.equal(calls.length, 1);
  assert.equal(calls[0][0], 'getRelationshipExplorerData');
  assert.equal(runtime.node('relationship-summary').innerHTML.includes('Unresolved'), true);
  assert.match(runtime.node('relationship-forward-results').innerHTML, /MTG-000001/);
  assert.match(runtime.node('relationship-reverse-results').innerHTML, /DOC-1/);

  runtime.node('relationship-forward-results')._listener_click({
    target: { closest() { return { dataset: { relationshipMeeting: 'MTG-000001' } }; } }
  });
  assert.match(runtime.node('relationship-forward-detail').innerHTML, /Meeting Counterparty/);
  assert.match(runtime.node('relationship-forward-detail').innerHTML, /Pitchbook GP/);
  assert.match(runtime.node('relationship-forward-detail').innerHTML, /既存の面談保守で開く/);
  assert.equal(runtime.node('relationship-forward-detail').innerHTML.includes('must never escape'), false);

  runtime.node('relationship-reverse-results')._listener_click({
    target: { closest() { return { dataset: { relationshipPitchbook: 'DOC-1' } }; } }
  });
  assert.match(runtime.node('relationship-reverse-detail').innerHTML, /Pitchbook GP/);
  assert.match(runtime.node('relationship-reverse-detail').innerHTML, /Meeting Counterparty/);
  assert.equal(calls.length, 1, 'selecting a detail does not issue another RPC or write');
});
