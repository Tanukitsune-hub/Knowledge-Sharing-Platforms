const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const sourceDir = path.join(root, 'src');
const files = fs.readdirSync(sourceDir).filter((file) => file.endsWith('.gs')).sort();

for (const file of files) {
  const code = fs.readFileSync(path.join(sourceDir, file), 'utf8');
  new vm.Script(code, { filename: file });
}

const manifestPath = path.join(sourceDir, 'appsscript.json');
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
if (manifest.runtimeVersion !== 'V8') {
  throw new Error('appsscript.json must use V8 runtime.');
}
if (!manifest.dependencies?.enabledAdvancedServices?.some((service) => service.serviceId === 'drive')) {
  throw new Error('Drive advanced service must be declared.');
}

console.log(`Validated ${files.length} Apps Script source files and appsscript.json.`);
