const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

function loadAppsScript() {
  const root = path.resolve(__dirname, '..');
  const context = vm.createContext({
    console, JSON, Object, Array, String, Number, Boolean, Date, Math, RegExp,
    Error, TypeError, Set, Map
  });
  for (const file of ['00_Core.gs', '06_CounterpartyMigration.gs']) {
    new vm.Script(fs.readFileSync(path.join(root, 'src', file), 'utf8'), { filename: file })
      .runInContext(context);
  }
  return context;
}

const ksp = loadAppsScript();

function applyPlan(snapshot, plan) {
  const next = JSON.parse(JSON.stringify(snapshot));
  function apply(rows, patches) {
    for (const patch of patches || []) Object.assign(rows[patch.rowIndex], patch.values);
  }
  apply(next.counterpartyRows, plan.counterpartyPatches);
  next.counterpartyRows.push(...JSON.parse(JSON.stringify(plan.counterpartyAppends || [])));
  apply(next.meetingRows, plan.meetingPatches);
  apply(next.pitchbookRows, plan.pitchbookPatches);
  return next;
}

function schema7Snapshot() {
  return {
    counterpartyRows: [
      { GP_ID: 'GP-LEGACY-X', GP_Name: 'Legacy GP', Status: 'Active' }
    ],
    optionRows: [
      { Option_ID: 'OPT-LEGACY-LP', Type: 'COUNTERPARTY_LP', Name: 'Same Name', Status: 'Active' },
      { Option_ID: 'OPT-LEGACY-OTHER', Type: 'COUNTERPARTY_OTHER', Name: 'Same Name', Status: 'Active' }
    ],
    meetingRows: [
      { Meeting_ID: 'MTG-KEEP', GP_ID: 'GP-LEGACY-X', Counterparty_ID: '', Counterparty_Type: '' },
      { Meeting_ID: 'MTG-LP-KEEP', GP_ID: '', Counterparty_ID: 'OPT-LEGACY-LP', Counterparty_Type: 'LP_ASSET_OWNER' }
    ],
    pitchbookRows: [
      { Document_ID: 'DOC-KEEP', File_ID: 'FILE-KEEP', GP_ID: '', Counterparty_ID: 'OPT-LEGACY-OTHER', Counterparty_Type: 'OTHER' }
    ]
  };
}

test('schema7 migration reserves seed IDs, creates type-scoped Counterparties, and preserves record identities', () => {
  const snapshot = schema7Snapshot();
  const plan = ksp.kspBuildCounterpartyMigrationPlan_(snapshot, '2026-09-18T00:00:00.000Z');
  assert.equal(plan.counterpartyPatches.length, 1);
  assert.equal(plan.counterpartyAppends.length, 2);
  assert.equal(plan.meetingPatches.length, 2);
  assert.equal(plan.pitchbookPatches.length, 1);

  const migrated = applyPlan(snapshot, plan);
  const ids = migrated.counterpartyRows.map(row => row.Counterparty_ID);
  assert.deepEqual(ids, ['CP-000031', 'CP-000032', 'CP-000033']);
  assert.equal(new Set(ids).size, ids.length);
  assert.deepEqual(migrated.counterpartyRows.map(row => row.Counterparty_Type),
    ['GP', 'LP_ASSET_OWNER', 'OTHER']);
  assert.deepEqual(migrated.counterpartyRows.slice(1).map(row => row.Counterparty_Name),
    ['Same Name', 'Same Name']);

  assert.equal(migrated.meetingRows[0].Meeting_ID, 'MTG-KEEP');
  assert.equal(migrated.meetingRows[0].Counterparty_ID, 'CP-000031');
  assert.equal(migrated.meetingRows[0].Counterparty_Type, 'GP');
  assert.equal(migrated.meetingRows[1].Counterparty_ID, 'CP-000032');
  assert.equal(migrated.meetingRows[1].Counterparty_Type, 'LP_ASSET_OWNER');
  assert.equal(migrated.pitchbookRows[0].Document_ID, 'DOC-KEEP');
  assert.equal(migrated.pitchbookRows[0].File_ID, 'FILE-KEEP');
  assert.equal(migrated.pitchbookRows[0].Counterparty_ID, 'CP-000033');
  assert.equal(migrated.pitchbookRows[0].Counterparty_Type, 'OTHER');
});

test('schema8 migration replay is idempotent with duplicate0 and stable IDs', () => {
  const first = ksp.kspBuildCounterpartyMigrationPlan_(schema7Snapshot(), '2026-09-18T00:00:00.000Z');
  const migrated = applyPlan(schema7Snapshot(), first);
  const before = JSON.stringify(migrated);
  const replay = ksp.kspBuildCounterpartyMigrationPlan_(migrated, '2026-09-18T00:00:00.000Z');
  assert.equal(ksp.kspCounterpartyMigrationMutationCount_(replay), 0);
  assert.equal(replay.counterpartyAppends.length, 0);
  assert.equal(JSON.stringify(migrated), before);
});

test('migration fails closed on unresolved legacy references', () => {
  const snapshot = schema7Snapshot();
  snapshot.meetingRows.push({ Meeting_ID: 'MTG-BROKEN', GP_ID: 'GP-MISSING' });
  assert.throws(
    () => ksp.kspBuildCounterpartyMigrationPlan_(snapshot, '2026-09-18T00:00:00.000Z'),
    error => error.code === 'COUNTERPARTY_LEGACY_REFERENCE_UNRESOLVED'
  );
});
