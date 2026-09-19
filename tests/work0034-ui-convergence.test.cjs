const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = name => fs.readFileSync(path.join(root, 'src', name), 'utf8');
const index = read('Index.html');
const pages = read('MaintenancePages.html');
const maintenance = read('ClientMaintenance.html');
const workspacePage = read('EntityWorkspacePage.html');
const workspaceClient = read('ClientEntityWorkspace.html');
const styles = read('Styles.html');

test('all normal pages share the left-aligned 2000px content contract and sidebar content fits its own width', () => {
  assert.match(styles, /\.page\{[^}]*width:100%[^}]*max-width:2000px[^}]*margin-left:0[^}]*margin-right:auto/);
  assert.match(styles, /\.page-header\{[^}]*width:236px[^}]*overflow-y:auto[^}]*overflow-x:hidden/);
  assert.match(styles, /\.sidebar-motif\{[^}]*left:2px[^}]*width:232px/);
  assert.match(styles, /\.nav button\{[^}]*width:100%[^}]*min-width:0/);
});

test('Meeting create keeps canonical placement while tightening date/time and quick-add presentation', () => {
  assert.match(index, /id="meeting-quick-add-counterparty"/);
  assert.match(styles, /#meeting-quick-add-counterparty\{[^}]*width:50%[^}]*linear-gradient/);
  assert.match(styles, /#page-meeting #meeting-date,#page-meeting #meeting-time\{width:100%;max-width:none\}/);
  assert.match(styles, /meeting-field-date\{grid-column:1\/span 2;grid-row:1\}/);
  assert.match(styles, /meeting-field-time\{grid-column:3\/span 1;grid-row:1\}/);
});

test('Past Meetings exposes the clean 12-column filter and sends safe backend defaults', () => {
  assert.match(pages, /class="filter-grid meeting-past-filter-grid"/);
  assert.match(pages, /class="field maintenance-backend-filter" hidden aria-hidden="true"><label for="meeting-past-capitalTypeId">Equity \/ Debt/);
  assert.match(pages, /class="field maintenance-backend-filter" hidden aria-hidden="true"><label><input id="meeting-past-followUpOnly"/);
  assert.doesNotMatch(pages, /id="meeting-past-meetingTypeCode"/);
  assert.equal((pages.match(/data-meeting-type-filter="meeting-past"/g)||[]).length,3);
  assert.match(styles, /meeting-past-date-from-field\{grid-column:1\/span 2;grid-row:2\}/);
  assert.match(styles, /meeting-past-date-to-field\{grid-column:3\/span 2;grid-row:2\}/);
  assert.match(styles, /meeting-past-counterparty-field\{grid-column:1\/span 4;grid-row:3\}/);
  assert.match(styles, /meeting-past-asset-field\{grid-column:5\/span 2;grid-row:2\}/);
  assert.match(styles, /meeting-past-team-field\{grid-column:7\/span 2;grid-row:2\}/);
  assert.match(pages, /id="meeting-past-fundStrategy" type="hidden"/);
  assert.match(styles, /meeting-past-types-field\{grid-column:5\/span 6;grid-row:3\}/);
  assert.match(pages, /id="meeting-past-filterStatus" type="hidden" value="Active"/);
  assert.match(maintenance, /meetingTypeCode:meetingTypeCodes\.length===1\?meetingTypeCodes\[0\]:''/);
  assert.match(maintenance, /meetingTypeCodes,followUpOnly:followUpNode\?followUpNode\.checked:false/);
  assert.match(maintenance, /capitalTypeId:capitalTypeNode\?capitalTypeNode\.value:''/);
  assert.match(maintenance, /status:meetingPast\?'Active'/);
});

test('Counterparty Summary uses one selector and count-only active summary without type identity', () => {
  assert.doesNotMatch(workspacePage, /entity-workspace-type|面談先種別/);
  assert.match(workspacePage, /id="entity-workspace-entity"/);
  assert.doesNotMatch(workspaceClient, /entityWorkspacePopulateTypes|el\('entity-workspace-type'\)/);
  assert.match(workspaceClient, /entity-workspace-identity'\)\.textContent=entity\.counterpartyId/);
  assert.match(workspaceClient, /\['Meetings',s\.activeMeetingCount\+'件'\]/);
  assert.match(workspaceClient, /\['Pitchbooks',s\.pitchbookActiveCount\+'件'\]/);
  const printHeader = workspaceClient.match(/el\('entity-workspace-print'\)\.innerHTML=([\s\S]*?)<\/header>/);
  assert.ok(printHeader);
  assert.doesNotMatch(printHeader[1], /counterpartyTypeLabel|summary\.meetingCount|summary\.pitchbookCount/);
});
