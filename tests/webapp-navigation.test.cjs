const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const webApp = fs.readFileSync(path.join(root, 'src', '90_WebApp.gs'), 'utf8');

test('Knowledge Search navigation targets the published Web App outside the HTML-service iframe', () => {
  assert.match(webApp, /ScriptApp\.getService\(\)\.getUrl\(\)/);
  assert.match(webApp, /target=\\?"_top\\?"/);
  assert.match(webApp, /name=\\?"page\\?" value=\\?"knowledge\\?"/);
  assert.doesNotMatch(webApp, /onclick=\\?"window\.location\.search=/);
  assert.match(webApp, /knowledge-back/);
  assert.match(webApp, /window\.location\.search=''/);
  assert.match(webApp, /\.replace\([\s\S]*window\.location\.search=''[\s\S]*''[\s\S]*\)/);
});
