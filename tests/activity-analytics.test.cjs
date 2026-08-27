const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

function formatDateInTimeZone(value, timezone, pattern) {
  const parts = new Intl.DateTimeFormat('en-CA', pattern === 'HH:mm'
    ? { timeZone: timezone, hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }
    : { timeZone: timezone, year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(value);
  const byType = Object.fromEntries(parts.map(part => [part.type, part.value]));
  return pattern === 'HH:mm' ? `${byType.hour}:${byType.minute}` : `${byType.year}-${byType.month}-${byType.day}`;
}

function loadActivitySource() {
  const context = vm.createContext({
    console, JSON, Object, Array, String, Number, Boolean, Date, Math, RegExp,
    Error, TypeError, Set, Map, Intl,
    Utilities: { formatDate: formatDateInTimeZone }
  });
  for (const file of [
    '00_Core.gs', '05_TemporalContracts.gs', '61_PitchbookValidation.gs',
    '62_PitchbookIdentity.gs', '30_MeetingCore.gs', '100_MaintenanceCore.gs',
    '112_MaintenanceServiceHelpers.gs', '125_GpWorkspaceService.gs',
    '126_ActivityAnalyticsService.gs'
  ]) {
    new vm.Script(fs.readFileSync(path.join(__dirname, '..', 'src', file), 'utf8'), { filename: file }).runInContext(context);
  }
  return context;
}

const ksp = loadActivitySource();

function keys(items) {
  return Array.from(items, item => item.key);
}

function meeting(id, date, overrides = {}) {
  return {
    Meeting_ID: id,
    Date: date,
    Time: '',
    GP_ID: overrides.GP_ID === undefined ? 'GP-1' : overrides.GP_ID,
    Asset_Class_ID: overrides.Asset_Class_ID === undefined ? 'AC-PE' : overrides.Asset_Class_ID,
    Team_ID: overrides.Team_ID === undefined ? 'TEAM-PD' : overrides.Team_ID,
    Counterparty_Type: overrides.Counterparty_Type === undefined ? 'GP' : overrides.Counterparty_Type,
    Counterparty_ID: overrides.Counterparty_ID === undefined ? 'GP-1' : overrides.Counterparty_ID,
    Related_GP_IDs: overrides.Related_GP_IDs === undefined ? 'GP-1' : overrides.Related_GP_IDs,
    Meeting_Type_Codes: overrides.Meeting_Type_Codes === undefined ? 'ANNUAL_REVIEW' : overrides.Meeting_Type_Codes,
    Follow_Up_Required: overrides.Follow_Up_Required === undefined ? false : overrides.Follow_Up_Required,
    Status: overrides.Status === undefined ? 'Active' : overrides.Status,
    Version: 3,
    Updated_At: '2026-08-01T00:00:00.000Z',
    Updated_By: 'synthetic',
    Doc_File_ID: `doc-${id}`,
    Doc_URL: `https://docs.google.com/document/d/doc-${id}/edit`,
    Saved_Filename: `${id}.doc`,
    Admin_Check_Completed: overrides.Admin_Check_Completed,
    Admin_Check_Updated_At: overrides.Admin_Check_Updated_At || '',
    Admin_Check_Updated_By: overrides.Admin_Check_Updated_By || '',
    ...overrides
  };
}

function createEnvironment(rows) {
  const state = { resources: { backendSpreadsheetId: 'backend', auditSpreadsheetId: 'audit' } };
  const calls = [];
  const audits = [];
  let tick = 0;
  const env = {
    nowIso() {
      tick += 1;
      return `2026-08-28T00:00:${String(tick).padStart(2, '0')}.000Z`;
    },
    getInstallationState() {
      calls.push('getInstallationState');
      return JSON.parse(JSON.stringify(state));
    },
    readRows(id, sheet) {
      calls.push(`readRows:${id}:${sheet}`);
      assert.equal(sheet, 'Meeting_Index');
      return rows.map(row => ({ ...row }));
    },
    getActor() {
      calls.push('getActor');
      return 'synthetic@example.invalid';
    },
    appendRow(id, sheet, row) {
      calls.push(`appendRow:${id}:${sheet}`);
      audits.push({ ...row });
    },
    updateMeetingAdminCheckAtomic(meetingId, expectedCompleted, expectedUpdatedAt, desiredCompleted, actor, nowIso) {
      calls.push('updateMeetingAdminCheckAtomic');
      const row = rows.find(candidate => candidate.Meeting_ID === meetingId);
      if (!row) throw Object.assign(new Error('missing'), { code: 'ADMIN_CHECK_NOT_FOUND' });
      const currentCompleted = ksp.kspToBoolean_(row.Admin_Check_Completed, false);
      const currentUpdatedAt = ksp.kspCanonicalInstantIso_(row.Admin_Check_Updated_At);
      if (currentCompleted !== expectedCompleted || currentUpdatedAt !== expectedUpdatedAt) {
        throw Object.assign(new Error('stale'), { code: 'ADMIN_CHECK_STALE' });
      }
      const before = { ...row };
      if (currentCompleted === desiredCompleted) return { changed: false, before, after: { ...before } };
      row.Admin_Check_Completed = desiredCompleted;
      row.Admin_Check_Updated_At = ksp.kspCanonicalInstantIso_(nowIso);
      row.Admin_Check_Updated_By = actor;
      return { changed: true, before, after: { ...row } };
    }
  };
  env._debug = { calls, audits, rows };
  return env;
}

function baseRows() {
  return [
    meeting('MTG-000001', '2026-03-31', { Follow_Up_Required: true }),
    meeting('MTG-000002', new Date('2026-03-31T15:00:00.000Z'), {
      Counterparty_Type: 'LP_ASSET_OWNER', Counterparty_ID: 'OPT-CPLP-001',
      Related_GP_IDs: 'GP-1,GP-2', Team_ID: 'TEAM-AE', Meeting_Type_Codes: 'OFFICE_VISIT'
    }),
    meeting('MTG-000003', '2026-04-01', { Counterparty_ID: 'GP-2', Related_GP_IDs: 'GP-2', Status: 'Inactive' }),
    meeting('MTG-000004', '2026-12-31', {
      Counterparty_Type: '', Counterparty_ID: '', Related_GP_IDs: '', Team_ID: '', Meeting_Type_Codes: ''
    }),
    meeting('MTG-000005', '2027-03-31', { Counterparty_ID: 'GP-3', Related_GP_IDs: 'GP-3' })
  ];
}

test('period buckets consume Tokyo canonical Business Date and include fiscal boundary', () => {
  const env = createEnvironment(baseRows());
  const range = { dateFrom: '2026-03-31', dateTo: '2026-04-01', dimension: 'counterpartyType' };
  const monthly = ksp.kspGetMeetingActivityAnalytics_(env, { ...range, period: 'monthly' });
  assert.equal(monthly.ok, true, JSON.stringify(monthly));
  assert.deepEqual(keys(monthly.series), ['2026-03', '2026-04']);
  assert.deepEqual(Array.from(monthly.series, item => item.meetingCount), [1, 2]);

  const quarter = ksp.kspGetMeetingActivityAnalytics_(env, { ...range, period: 'quarter' });
  assert.deepEqual(keys(quarter.series), ['2026-Q1', '2026-Q2']);
  const fiscal = ksp.kspGetMeetingActivityAnalytics_(env, { ...range, period: 'fiscalYear' });
  assert.deepEqual(keys(fiscal.series), ['FY2025', 'FY2026']);
  const year = ksp.kspGetMeetingActivityAnalytics_(env, { ...range, period: 'calendarYear' });
  assert.deepEqual(keys(year.series), ['2026']);
  const custom = ksp.kspGetMeetingActivityAnalytics_(env, { ...range, period: 'custom' });
  assert.deepEqual(keys(custom.series), ['2026-03-31', '2026-04-01']);
  assert.equal(env._debug.calls.filter(call => call.startsWith('readRows')).length, 5);
});

test('cumulative monthly series returns running exact Meeting counts', () => {
  const env = createEnvironment(baseRows());
  const result = ksp.kspGetMeetingActivityAnalytics_(env, {
    period: 'cumulative', dateFrom: '2026-03-31', dateTo: '2027-03-31', dimension: 'team'
  });
  assert.equal(result.ok, true, JSON.stringify(result));
  const march2027 = result.series.find(item => item.key === '2027-03');
  assert.equal(march2027.meetingCount, 5);
  assert.equal(march2027.cumulativeMeetingCount, 5);
  assert.equal(result.headline.meetingCount, 5);
});

test('filters and every supported dimension preserve unset buckets', () => {
  const rows = baseRows();
  const env = createEnvironment(rows);
  const filters = { dateFrom: '2026-01-01', dateTo: '2027-12-31', filters: { relatedGp: 'GP-2' } };
  const result = ksp.kspGetMeetingActivityAnalytics_(env, { ...filters, period: 'monthly', dimension: 'counterpartyEntity' });
  assert.equal(result.headline.meetingCount, 2);
  assert.ok(result.breakdown.items.some(item => item.key === 'LP_ASSET_OWNER:OPT-CPLP-001'));
  assert.ok(result.filterOptions.teams.some(item => item.value === '__UNSET__'));

  for (const dimension of ['counterpartyType', 'counterpartyEntity', 'relatedGp', 'assetClass', 'team', 'meetingType', 'status']) {
    const dimensionResult = ksp.kspGetMeetingActivityAnalytics_(env, { period: 'calendarYear', dimension });
    assert.equal(dimensionResult.ok, true, `${dimension}: ${JSON.stringify(dimensionResult)}`);
    assert.equal(dimensionResult.breakdown.dimension, dimension);
  }
});

test('full metrics precede drill and breakdown caps and no Doc body adapter is used', () => {
  const env = createEnvironment(baseRows());
  const result = ksp.kspGetMeetingActivityAnalytics_(env, {
    period: 'calendarYear', dimension: 'status', drillLimit: 1, breakdownLimit: 1
  });
  assert.equal(result.headline.meetingCount, 5);
  assert.equal(result.drill.totalCount, 5);
  assert.equal(result.drill.records.length, 1);
  assert.equal(result.drill.omittedCount, 4);
  assert.equal(result.breakdown.totalCount, 2);
  assert.equal(result.breakdown.items.length, 1);
  assert.equal(result.breakdown.omittedCount, 1);
  assert.equal(result.readModel.source, 'Meeting_Index');
  assert.equal(result.readModel.documentBodyRead, false);
  assert.deepEqual(env._debug.calls, ['getInstallationState', 'readRows:backend:Meeting_Index']);
});

test('admin check is narrow, optimistic, idempotent, and metadata-only', () => {
  const rows = baseRows();
  const target = rows[0];
  const beforeNormal = { Version: target.Version, Updated_At: target.Updated_At, Updated_By: target.Updated_By, Doc_File_ID: target.Doc_File_ID, Follow_Up_Note: target.Follow_Up_Note, AI_Index_Status: target.AI_Index_Status };
  const env = createEnvironment(rows);
  const first = ksp.kspUpdateMeetingAdminCheck_(env, {
    meetingId: target.Meeting_ID, desiredCompleted: true,
    expectedAdminCheckCompleted: false, expectedAdminCheckUpdatedAt: ''
  });
  assert.equal(first.ok, true, JSON.stringify(first));
  assert.equal(first.changed, true);
  assert.equal(rows[0].Admin_Check_Completed, true);
  assert.equal(env._debug.audits.length, 1);
  assert.equal(env._debug.audits[0].Action, 'MEETING_ADMIN_CHECK');
  assert.deepEqual(env._debug.audits[0].Changed_Fields.split(','), ['Admin_Check_Completed', 'Admin_Check_Updated_At', 'Admin_Check_Updated_By']);
  assert.doesNotMatch(env._debug.audits[0].Before_Metadata_JSON + env._debug.audits[0].After_Metadata_JSON, /Follow_Up_Note|Doc_File_ID|Version|AI_/);
  assert.deepEqual({ Version: rows[0].Version, Updated_At: rows[0].Updated_At, Updated_By: rows[0].Updated_By, Doc_File_ID: rows[0].Doc_File_ID, Follow_Up_Note: rows[0].Follow_Up_Note, AI_Index_Status: rows[0].AI_Index_Status }, beforeNormal);

  const idempotent = ksp.kspUpdateMeetingAdminCheck_(env, {
    meetingId: target.Meeting_ID, desiredCompleted: true,
    expectedAdminCheckCompleted: true, expectedAdminCheckUpdatedAt: first.adminCheck.updatedAt
  });
  assert.equal(idempotent.ok, true);
  assert.equal(idempotent.changed, false);
  assert.equal(env._debug.audits.length, 1);

  const stale = ksp.kspUpdateMeetingAdminCheck_(env, {
    meetingId: target.Meeting_ID, desiredCompleted: false,
    expectedAdminCheckCompleted: false, expectedAdminCheckUpdatedAt: ''
  });
  assert.equal(stale.ok, false);
  assert.equal(stale.error.code, 'ADMIN_CHECK_STALE');
  assert.equal(env._debug.audits.length, 1);
});
