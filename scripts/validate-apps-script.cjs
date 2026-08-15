const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const sourceDir = path.join(root, 'src');
const gsFiles = fs.readdirSync(sourceDir).filter((file) => file.endsWith('.gs')).sort();
for (const file of gsFiles) {
  new vm.Script(fs.readFileSync(path.join(sourceDir, file), 'utf8'), { filename: file });
}

const manifest = JSON.parse(fs.readFileSync(path.join(sourceDir, 'appsscript.json'), 'utf8'));
if (manifest.runtimeVersion !== 'V8') throw new Error('appsscript.json must use V8 runtime.');
if (!manifest.dependencies?.enabledAdvancedServices?.some((service) => service.serviceId === 'drive')) {
  throw new Error('Drive advanced service must be declared.');
}
for (const requiredScope of [
  'https://www.googleapis.com/auth/drive',
  'https://www.googleapis.com/auth/documents',
  'https://www.googleapis.com/auth/spreadsheets'
]) {
  if (!manifest.oauthScopes?.includes(requiredScope)) throw new Error(`Missing required OAuth scope: ${requiredScope}`);
}

const htmlFiles = fs.readdirSync(sourceDir).filter((file) => file.endsWith('.html')).sort();
let clientScriptCount = 0;
for (const file of htmlFiles) {
  const html = fs.readFileSync(path.join(sourceDir, file), 'utf8');
  const matches = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)];
  for (let index = 0; index < matches.length; index += 1) {
    new vm.Script(matches[index][1], { filename: `${file}#script-${index + 1}` });
    clientScriptCount += 1;
  }
}

const indexHtml = fs.readFileSync(path.join(sourceDir, 'Index.html'), 'utf8');
for (const requiredToken of [
  'id="meeting-form"',
  'id="pitchbook-form"',
  'id="meeting-view-past"',
  'id="pitchbook-view-past"',
  'id="page-masters"',
  "include('ClientMaintenance')",
  "include('ClientMasters')",
  'meeting-edit-save',
  'pitchbook-edit-save',
  'master-results-body'
]) {
  if (!indexHtml.includes(requiredToken)) throw new Error(`Index.html is missing required token: ${requiredToken}`);
}

console.log(`Validated ${gsFiles.length} Apps Script files, ${htmlFiles.length} HTML files, ${clientScriptCount} client scripts, and appsscript.json.`);
