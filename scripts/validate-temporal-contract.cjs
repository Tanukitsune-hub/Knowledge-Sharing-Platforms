const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const sourceDir = path.join(root, 'src');
const sourceFiles = fs.readdirSync(sourceDir)
  .filter(file => file.endsWith('.gs'))
  .sort();
const source = Object.fromEntries(sourceFiles.map(file => [
  file, fs.readFileSync(path.join(sourceDir, file), 'utf8')
]));
const production = sourceFiles.map(file => source[file]).join('\n');
const errors = [];

function requireCondition(condition, message) {
  if (!condition) errors.push(message);
}

const helperNames = [
  'kspCanonicalBusinessDate_',
  'kspCanonicalBusinessTime_',
  'kspCanonicalInstantIso_'
];
helperNames.forEach(name => {
  const locations = sourceFiles.filter(file => new RegExp('function\\s+' + name + '\\s*\\(').test(source[file]));
  requireCondition(locations.length === 1 && locations[0] === '05_TemporalContracts.gs',
    name + ' must have exactly one production definition in src/05_TemporalContracts.gs.');
});

const temporalContract = source['05_TemporalContracts.gs'] || '';
requireCondition(temporalContract.includes("Utilities.formatDate(value, KSP_DEFAULTS.TIMEZONE, 'yyyy-MM-dd')"),
  'Business Date Date-object normalization must use KSP_DEFAULTS.TIMEZONE.');
requireCondition(temporalContract.includes("Utilities.formatDate(value, KSP_DEFAULTS.TIMEZONE, 'HH:mm')"),
  'Business Time Date-object normalization must use KSP_DEFAULTS.TIMEZONE.');
requireCondition(/KSP_TEMPORAL_ISO_RE/.test(temporalContract) &&
  /kspTemporalParseStrictIso_/.test(temporalContract),
  'Strict ISO parsing must be centralized in the temporal contract.');

const utcCalendarGetter = /\.(?:getUTCFullYear|getUTCMonth|getUTCDate|getUTCHours|getUTCMinutes)\s*\(/g;
sourceFiles.forEach(file => {
  const text = source[file];
  [...text.matchAll(utcCalendarGetter)].forEach(match => {
    const before = text.slice(0, match.index);
    const allowedRetention = file === '100_MaintenanceCore.gs' &&
      before.lastIndexOf('function kspAuditRetentionCutoff_') !== -1;
    requireCondition(allowedRetention,
      'UTC calendar API is not allowed outside the retention-duration boundary: ' + match[0] + '.');
  });
});

const localCalendarGetter = /\.(?:getFullYear|getMonth|getDate|getHours|getMinutes)\s*\(/g;
requireCondition(!localCalendarGetter.test(production),
  'Local calendar getters must not implement Business Date or Business Time.');

[
  [/dateKey\s*:\s*String\s*\(\s*row\.Date\b/, 'AI date_key must use the canonical Business Date helper.'],
  [/\bdate\s*:\s*String\s*\(\s*row\.Date\b/, 'Search/result dates must use the canonical Business Date helper.'],
  [/\bDate\s*:\s*row\.Date\b/, 'Audit snapshots must not store raw Date cells.'],
  [/String\s*\(\s*row\.Time\b/, 'Export/search boundaries must not stringify raw Time cells.'],
  [/new Date\s*\(\s*row\.(?:Date|Time)\b/, 'Business Date/Time cells must not be parsed as generic instants.']
].forEach(([pattern, message]) => requireCondition(!pattern.test(production), message));

[
  ['kspMeetingCellDate_', 'kspCanonicalBusinessDate_'],
  ['kspCanonicalPitchbookDateKey_', 'kspCanonicalBusinessDate_'],
  ['kspKnowledgeExportDate_', 'kspCanonicalBusinessDate_']
].forEach(([wrapper, delegate]) => {
  const exact = new RegExp(
    'function\\s+' + wrapper + '\\s*\\(value\\)\\s*\\{\\s*return\\s+' + delegate + '\\(value\\);\\s*\\}'
  );
  requireCondition(exact.test(production), wrapper + ' must be a thin delegate to ' + delegate + '.');
});

requireCondition(/function\s+kspMaintenanceCellText_\s*\([^)]*\)\s*\{[\s\S]*kspCanonicalBusinessDate_\(/.test(production),
  'Maintenance date mapping must delegate to the canonical Business Date helper.');
requireCondition(/function\s+kspMaintenanceCellText_\s*\([^)]*\)\s*\{[\s\S]*kspCanonicalBusinessTime_\(/.test(production),
  'Maintenance time mapping must delegate to the canonical Business Time helper.');
requireCondition(/function\s+kspMaintenanceCellText_\s*\([^)]*\)\s*\{[\s\S]*kspCanonicalInstantIso_\(/.test(production),
  'Maintenance instant mapping must delegate to the canonical Instant helper.');

[
  'maintenance-test-loader.cjs',
  'ai-test-loader.cjs',
  'meeting.test.cjs',
  'pitchbook.test.cjs'
].forEach(file => {
  const text = fs.readFileSync(path.join(root, 'tests', file), 'utf8');
  requireCondition(!/function\s+ksp(?:CanonicalBusinessDate|CanonicalBusinessTime|CanonicalInstantIso|IsValidDateKey|IsValidTimeValue)_?\s*\(/.test(text),
    file + ' must not define production-named temporal business logic.');
  requireCondition(text.includes('05_TemporalContracts.gs'),
    file + ' must load the production temporal contract.');
});

const temporalRegression = fs.readFileSync(
  path.join(root, 'tests', 'temporal-contract.test.cjs'), 'utf8'
);
[
  'Business Date',
  'Business Time',
  'Instant',
  'Asia/Tokyo',
  'kspMeetingIndexRowMatchesRequest_',
  'kspBuildKnowledgeExportSource_',
  'kspChangedMetadataFields_',
  'kspBuildLegacyPitchbookSlotFingerprint_'
].forEach(token => requireCondition(temporalRegression.includes(token),
  'Temporal regression coverage is missing: ' + token + '.'));

const packageJson = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
requireCondition(String(packageJson.scripts && packageJson.scripts.check || '')
  .includes('node scripts/validate-temporal-contract.cjs'),
  'npm run check must execute scripts/validate-temporal-contract.cjs.');

const manifest = JSON.parse(fs.readFileSync(path.join(sourceDir, 'appsscript.json'), 'utf8'));
requireCondition(manifest.timeZone === 'Asia/Tokyo',
  'Apps Script manifest timezone must remain Asia/Tokyo.');

if (errors.length) {
  throw new Error('Temporal contract validation failed:\n- ' + errors.join('\n- '));
}

console.log('Validated temporal contract: ' + helperNames.length +
  ' canonical helpers, ' + temporalRegression.split('\n').length +
  ' regression lines, Asia/Tokyo boundary.');
