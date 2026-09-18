const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { buildArtifacts } = require('../scripts/build-apps-script-bundle.cjs');
const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'src/DeploymentSecurityOperator.html'), 'utf8');

function loadClient() {
  const button = { disabled: false, addEventListener(event, handler) {
    assert.equal(event, 'click'); this.click = handler;
  } };
  const result = { textContent: '未実行' };
  let calls = 0;
  let success;
  let failure;
  const run = {
    withSuccessHandler(handler) { success = handler; return this; },
    withFailureHandler(handler) { failure = handler; return this; },
    confirmKnowledgeShareDeploymentSecurity(...args) { assert.equal(args.length, 0); calls += 1; }
  };
  const context = vm.createContext({
    document: { getElementById(id) { return id === 'confirm-deployment' ? button : result; } },
    google: { script: { run } }
  });
  vm.runInContext(html.match(/<script>([\s\S]*?)<\/script>/)[1], context);
  return { button, result, calls: () => calls, success: value => success(value), failure: value => failure(value) };
}

test('production and bundle operator GET render only the static unlinked page', () => {
  const bundle = buildArtifacts({ sourceCommit: 'a'.repeat(40), write: false }).artifacts['KnowledgeShare.bundle.gs'];
  for (const source of [fs.readFileSync(path.join(root, 'src/90_WebApp.gs'), 'utf8'), bundle]) {
    const rendered = [];
    const context = vm.createContext({ HtmlService: { XFrameOptionsMode: { DEFAULT: 'DEFAULT' } } });
    vm.runInContext(source, context);
    context.kspCreateHtmlTemplate_ = name => {
      rendered.push(name);
      return { evaluate: () => ({ setTitle() { return this; }, setXFrameOptionsMode() { return this; } }) };
    };
    context.confirmKnowledgeShareDeploymentSecurity = () => { assert.fail('GET must not confirm'); };
    context.doGet({ parameter: { page: 'deployment-security', confirm: 'true' } });
    assert.deepEqual(rendered, ['DeploymentSecurityOperator']);
    if (context.KSP_BUNDLED_HTML_RESOURCES) {
      assert.equal(context.KSP_BUNDLED_HTML_RESOURCES.DeploymentSecurityOperator, html.replace(/\r\n/g, '\n'));
    }
  }
});

test('page load makes no RPC; the one explicit button calls only the guarded confirmation once', () => {
  const client = loadClient();
  assert.equal(client.calls(), 0);
  assert.equal(client.result.textContent, '未実行');
  assert.equal((html.match(/<button\b/g) || []).length, 1);
  client.button.click(); client.button.click();
  assert.equal(client.calls(), 1);
  assert.equal(client.button.disabled, true);
  assert.doesNotMatch(html, /\beval\s*\(|new Function|script\.run\s*\[|localStorage|sessionStorage|console\./);
});

test('operator result exposes only fixed state/code, including denied and untrusted errors', () => {
  for (const response of [
    { state: 'READY', error: null, nextAction: 'private@example.invalid', sourceCommit: 'private-value' },
    { state: 'ACTION_REQUIRED', error: { code: 'INSTALLER_ADMIN_REQUIRED', message: 'raw-private' } },
    { state: 'private-state', error: { code: 'private-code', message: 'raw-private' } }
  ]) {
    const client = loadClient(); client.button.click(); client.success(response);
    assert.ok(['READY / NONE', 'ACTION_REQUIRED / INSTALLER_ADMIN_REQUIRED', 'FAILED / INSTALLER_FAILED'].includes(client.result.textContent));
    assert.doesNotMatch(client.result.textContent, /private|@/);
  }
  const client = loadClient(); client.button.click(); client.failure(new Error('raw-private'));
  assert.doesNotMatch(client.result.textContent, /raw-private/);
});

test('normal product HTML has no operator route or confirmation call', () => {
  for (const file of fs.readdirSync(path.join(root, 'src')).filter(f => f.endsWith('.html') && f !== 'DeploymentSecurityOperator.html')) {
    assert.doesNotMatch(fs.readFileSync(path.join(root, 'src', file), 'utf8'), /deployment-security|DeploymentSecurityOperator|confirmKnowledgeShareDeploymentSecurity/);
  }
});
