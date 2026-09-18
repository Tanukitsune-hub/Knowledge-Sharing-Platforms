const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');

test('standalone GP Workspace server implementation is removed', () => {
  assert.equal(fs.existsSync(path.join(root, 'src', '125_GpWorkspaceService.gs')), false);
  const webApp = fs.readFileSync(path.join(root, 'src', '90_WebApp.gs'), 'utf8');
  assert.doesNotMatch(webApp, /function getGpWorkspaceData\s*\(/);
  assert.match(webApp, /function getEntityWorkspaceData\s*\(/);
});
