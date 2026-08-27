const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const page = fs.readFileSync(path.join(root, 'src', 'GpWorkspacePage.html'), 'utf8');
const client = fs.readFileSync(path.join(root, 'src', 'ClientGpWorkspace.html'), 'utf8');
const styles = fs.readFileSync(path.join(root, 'src', 'Styles.html'), 'utf8');
const enhancement = fs.readFileSync(path.join(root, 'src', 'ClientMaintenanceEnhancements.html'), 'utf8');
const clientScript = client.match(/<script>([\s\S]*?)<\/script>/)[1];

function workspaceData(gpId = 'GP-000001', name = 'Alpha GP') {
  return {
    ok: true,
    gp: { id: gpId, name, status: 'Active' },
    summary: {
      meetingTotal: 1,
      meetingActive: 1,
      pitchbookTotal: 1,
      pitchbookActive: 1,
      activeFollowUpCount: 1,
      lastMeetingDate: '2026-08-27'
    },
    fundStrategies: [{ text: 'Fund A', meetingCount: 1, pitchbookCount: 1, latestDate: '2026-08-27' }],
    recentMeetings: [{
      meetingId: 'MTG-000001', date: '2026-08-27', assetClassName: 'Infrastructure',
      capitalTypeName: 'Equity', teamName: 'PD', fundStrategy: 'Fund A',
      meetingTypeLabels: ['Annual Review'], followUpRequired: true,
      relatedPitchbookIds: ['DOC-000001'], status: 'Active', documentUrl: ''
    }],
    recentPitchbooks: [{
      documentId: 'DOC-000001', date: '2026-08-27', assetClassName: 'Infrastructure',
      capitalTypeName: 'Equity', fundStrategy: 'Fund A', savedFilename: 'synthetic.pdf',
      status: 'Active', fileUrl: ''
    }],
    followUps: [{
      meetingId: 'MTG-000001', date: '2026-08-27', teamName: 'PD', fundStrategy: 'Fund A',
      followUpNote: 'Synthetic follow-up', documentUrl: ''
    }],
    relationships: [{
      meetingId: 'MTG-000001', date: '2026-08-27', fundStrategy: 'Fund A',
      pitchbooks: [{ documentId: 'DOC-000001', unresolved: false, savedFilename: 'synthetic.pdf', status: 'Active', fileUrl: '' }]
    }],
    omittedCounts: { fundStrategies: 0, recentMeetings: 0, recentPitchbooks: 0, followUps: 0, relationships: 0 }
  };
}

function executeClient(serverCall) {
  const nodes = new Map();
  function node(id) {
    if (!nodes.has(id)) {
      const classes = new Set();
      nodes.set(id, {
        id, value: '', disabled: false, innerHTML: '', textContent: '', className: '', options: [],
        classList: {
          add(name) { classes.add(name); },
          remove(name) { classes.delete(name); },
          contains(name) { return classes.has(name); }
        },
        addEventListener(type, listener) { this['_listener_' + type] = listener; },
        appendChild(child) { this.options.push(child); }
      });
    }
    return nodes.get(id);
  }
  let printCalls = 0;
  const statuses = [];
  const context = {
    el: node,
    document: { createElement() { return { value: '', textContent: '' }; } },
    escapeHtml(value) { return String(value == null ? '' : value); },
    kspSafeDriveUrl(value) { return String(value || ''); },
    clearStatus(id) { statuses.push({ id, kind: 'clear' }); },
    showStatus(id, kind, message) { statuses.push({ id, kind, message }); },
    serverCall,
    window: { print() { printCalls += 1; } }
  };
  vm.runInNewContext(clientScript, context, { filename: 'ClientGpWorkspace.js' });
  return { context, node, statuses, getPrintCalls: () => printCalls };
}

test('GP Workspace client loads once per selected GP and starts without a default selection', () => {
  assert.match(page, /id="gp-workspace-gpId"><option value="">未選択<\/option>/);
  assert.match(client, /addEventListener\('change',event=>loadGpWorkspace\(event\.target\.value\)\)/);
  assert.equal((client.match(/serverCall\('getGpWorkspaceData'/g) || []).length, 1);
  assert.match(client, /requestSequence!==gpWorkspaceRequestSequence/);
  assert.match(enhancement, /populateGpWorkspaceOptions\(maintenanceBootstrap\.masters\.gps\|\|\[\]\)/);
});

test('GP Workspace renders safe source links, unresolved relationships, and no persistence', () => {
  assert.match(client, /kspSafeDriveUrl\(url\)/);
  assert.match(client, /target="_blank" rel="noopener"/);
  assert.match(client, /未解決:/);
  assert.doesNotMatch(client, /localStorage|safeSet|writeEnvelope|createKnowledgeExport|registerMeeting|updateMeetingMaintenance/);
});

test('print brief is A4 landscape, fixed-cap, bounded, and invokes native print only', () => {
  assert.match(page, /id="gp-workspace-print-button"/);
  assert.match(client, /fundStrategies:8,recentMeetings:5,recentPitchbooks:5,followUps:5,relationships:5,relationshipTargets:3/);
  assert.match(client, /window\.print\(\)/);
  assert.match(client, /\+['"]?\+?escapeHtml\(count\).*more/);
  assert.doesNotMatch(client, /createKnowledgeExport|\.pdf|DocumentApp|DriveApp/);
  assert.match(styles, /@page\{size:A4 landscape/);
  assert.match(styles, /\.app-shell>:not\(#gp-workspace-print\)\{display:none!important\}/);
  assert.match(styles, /-webkit-line-clamp:2/);
  assert.match(styles, /max-height:190mm/);
});

test('runtime client skips blank selection, makes one RPC, and ignores stale responses', async () => {
  const pending = new Map();
  const calls = [];
  const runtime = executeClient((method, gpId) => {
    calls.push([method, gpId]);
    return new Promise(resolve => pending.set(gpId, resolve));
  });

  await runtime.context.loadGpWorkspace('');
  assert.equal(calls.length, 0);

  const first = runtime.context.loadGpWorkspace('GP-000001');
  const second = runtime.context.loadGpWorkspace('GP-000002');
  assert.deepEqual(calls, [
    ['getGpWorkspaceData', 'GP-000001'],
    ['getGpWorkspaceData', 'GP-000002']
  ]);
  pending.get('GP-000002')(workspaceData('GP-000002', 'Second GP'));
  await second;
  assert.equal(runtime.node('gp-workspace-name').textContent, 'Second GP');
  pending.get('GP-000001')(workspaceData('GP-000001', 'Stale GP'));
  await first;
  assert.equal(runtime.node('gp-workspace-name').textContent, 'Second GP');
});

test('runtime print brief applies client caps and print click creates no RPC', async () => {
  const calls = [];
  const runtime = executeClient(async (method, gpId) => {
    calls.push([method, gpId]);
    const data = workspaceData(gpId);
    data.relationships = Array.from({ length: 6 }, (_, index) => ({
      meetingId: 'MTG-' + String(index + 1).padStart(6, '0'),
      date: '2026-08-27',
      fundStrategy: 'Fund A',
      pitchbooks: Array.from({ length: 5 }, (_unused, targetIndex) => ({
        documentId: 'DOC-' + String(index * 10 + targetIndex + 1).padStart(6, '0'),
        unresolved: false,
        status: 'Active'
      }))
    }));
    data.omittedCounts.relationships = 2;
    return data;
  });

  await runtime.context.loadGpWorkspace('GP-000001');
  assert.equal(calls.length, 1);
  const printHtml = runtime.node('gp-workspace-print').innerHTML;
  assert.match(printHtml, /\+2 more/);
  assert.match(printHtml, /\+3 more/);
  assert.equal(runtime.node('gp-workspace-print-button').disabled, false);
  runtime.node('gp-workspace-print-button').onclick();
  assert.equal(runtime.getPrintCalls(), 1);
  assert.equal(calls.length, 1);
});
