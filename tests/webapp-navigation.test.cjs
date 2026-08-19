const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const webApp = fs.readFileSync(path.join(root, 'src', '90_WebApp.gs'), 'utf8');

test('Knowledge Search navigation uses official top-level anchor routing', () => {
  assert.match(webApp, /ScriptApp\.getService\(\)\.getUrl\(\)/);
  assert.match(webApp, /<a id=\"nav-knowledge\" href=\"' \+ webAppUrl \+ '\?page=knowledge\" target=\"_top\">/);
  assert.match(webApp, /<a id=\"knowledge-back\" href=\"' \+ webAppUrl \+ '\" target=\"_top\">/);
  assert.doesNotMatch(webApp, /<form method=\"get\"/);
  assert.doesNotMatch(webApp, /onclick=\"window\.location\.search=/);
  assert.match(webApp, /window\.location\.search=''/);
  assert.match(webApp, /\.replace\([\s\S]*window\.location\.search=''[\s\S]*''[\s\S]*\)/);
});
