const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const sourceDir = path.join(root, 'src');
const files = fs.readdirSync(sourceDir).filter((file) => file.endsWith('.gs')).sort();
for (const file of files) new vm.Script(fs.readFileSync(path.join(sourceDir, file), 'utf8'), { filename: file });

const manifest = JSON.parse(fs.readFileSync(path.join(sourceDir, 'appsscript.json'), 'utf8'));
if (manifest.runtimeVersion !== 'V8') throw new Error('appsscript.json must use V8 runtime.');
if (!manifest.dependencies?.enabledAdvancedServices?.some((service) => service.serviceId === 'drive')) throw new Error('Drive advanced service must be declared.');
for (const requiredScope of ['https://www.googleapis.com/auth/drive','https://www.googleapis.com/auth/documents','https://www.googleapis.com/auth/spreadsheets']) {
  if (!manifest.oauthScopes?.includes(requiredScope)) throw new Error(`Missing required OAuth scope: ${requiredScope}`);
}
const html = fs.readFileSync(path.join(sourceDir, 'Index.html'), 'utf8');
const scriptMatch = html.match(/<script>([\s\S]*?)<\/script>/);
if (!scriptMatch) throw new Error('Index.html must include an inline client script.');
new vm.Script(scriptMatch[1], { filename: 'Index.client.js' });
for (const requiredToken of ['id="meeting-form"','getMeetingBootstrapData','registerMeeting','KSP_MEETING_RETRY_KEY','localStorage','24 * 60 * 60 * 1000']) {
  if (!html.includes(requiredToken)) throw new Error(`Index.html is missing required Meeting UI token: ${requiredToken}`);
}
console.log(`Validated ${files.length} Apps Script source files, Index.html, and appsscript.json.`);
