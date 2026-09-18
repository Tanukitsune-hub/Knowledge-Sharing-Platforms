const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');

test('standalone GP Workspace UI is removed in favor of the counterparty summary', () => {
  assert.equal(fs.existsSync(path.join(root, 'src', 'GpWorkspacePage.html')), false);
  assert.equal(fs.existsSync(path.join(root, 'src', 'ClientGpWorkspace.html')), false);
  const index = fs.readFileSync(path.join(root, 'src', 'Index.html'), 'utf8');
  const bootstrap = fs.readFileSync(path.join(root, 'src', 'ClientBootstrap.html'), 'utf8');
  assert.doesNotMatch(index, /GpWorkspacePage|ClientGpWorkspace|nav-gp-workspace/);
  assert.doesNotMatch(bootstrap, /summary-show-gp|loadGpWorkspace/);
  assert.match(index, /面談先サマリー/);
});
