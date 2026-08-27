const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const index = fs.readFileSync(path.join(root, 'src', 'Index.html'), 'utf8');
const core = fs.readFileSync(path.join(root, 'src', 'ClientCore.html'), 'utf8');
const page = fs.readFileSync(path.join(root, 'src', 'ActivityAnalyticsPage.html'), 'utf8');
const client = fs.readFileSync(path.join(root, 'src', 'ClientActivityAnalytics.html'), 'utf8');

test('Activity Analytics is an integrated page with dependency-free chart and accessible tables', () => {
  assert.match(index, /id="nav-activity-analytics"[^>]*>Activity Analytics<\/button>/);
  assert.match(index, /include_\('ActivityAnalyticsPage'\)/);
  assert.match(index, /include_\('ClientActivityAnalytics'\)/);
  assert.match(core, /'activity-analytics':document\.getElementById\('page-activity-analytics'\)/);
  assert.match(page, /id="activity-period"/);
  assert.match(page, /id="activity-dimension"/);
  assert.match(page, /月次管理反映済み/);
  assert.match(page, /<table class="data-table analytics-table">/);
  assert.equal((page.match(/<caption class="sr-only">/g) || []).length, 4);
  assert.match(client, /serverCall\('getMeetingActivityAnalytics'/);
  assert.match(client, /serverCall\('updateMeetingAdminCheck'/);
  assert.match(client, /<svg class="analytics-svg"/);
  assert.doesNotMatch(client, /Chart\.js|echarts|google\.visualization|DocumentApp|DriveApp/);
});

test('Activity Analytics client keeps stale read responses from replacing newer data and exposes exact omitted counts', () => {
  assert.match(client, /activityAnalyticsRequestSequence/);
  assert.match(client, /requestId!==activityAnalyticsRequestSequence/);
  assert.match(client, /data\.drill&&data\.drill\.omittedCount/);
  assert.match(client, /breakdown\.omittedCount/);
  assert.match(client, /data-activity-admin-meeting/);
});

test('Activity Analytics filter option keys match the server response contract', () => {
  assert.match(client, /\['counterpartyTypes','activity-filter-counterpartyType'\]/);
  assert.match(client, /\['counterpartyEntities','activity-filter-counterpartyEntity'\]/);
  assert.match(client, /\['relatedGps','activity-filter-relatedGp'\]/);
  assert.match(client, /\['assetClasses','activity-filter-assetClass'\]/);
  assert.match(client, /\['teams','activity-filter-team'\]/);
  assert.match(client, /\['meetingTypes','activity-filter-meetingType'\]/);
  assert.match(client, /\['statuses','activity-filter-status'\]/);
  assert.doesNotMatch(client, /\['counterpartyType','activity-filter-counterpartyType'\]/);
});
