const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { buildArtifacts, PAYLOAD_PLACEHOLDER, sha256 } = require('../scripts/build-apps-script-bundle.cjs');
const {
  validateBundle,
  validateTopLevelDeclarationCollisions
} = require('../scripts/validate-apps-script-bundle.cjs');
const { collectTopLevelVariableDeclarations } = require('../scripts/public-surface.cjs');

const rootDir = path.resolve(__dirname, '..');

test('repeated bundle builds are byte-identical and fully covered', () => {
  const sourceCommit = 'a'.repeat(40);
  const first = buildArtifacts({ rootDir, sourceCommit, write: false });
  const second = buildArtifacts({ rootDir, sourceCommit, write: false });
  assert.deepEqual(first.artifacts, second.artifacts);
  assert.equal(first.releaseManifest.bundle_metrics.server_source_count,
    fs.readdirSync(path.join(rootDir, 'src')).filter((name) => name.endsWith('.gs')).length);
  assert.equal(first.releaseManifest.bundle_metrics.embedded_html_count,
    fs.readdirSync(path.join(rootDir, 'src')).filter((name) => name.endsWith('.html')).length);
});

test('payload and final-file hashes recompute under the versioned canonical contract', () => {
  const built = buildArtifacts({ rootDir, sourceCommit: 'b'.repeat(40), write: false });
  const bundle = built.artifacts['KnowledgeShare.bundle.gs'];
  const payloadToken = `"bundlePayloadSha256":"${built.releaseManifest.bundle_payload_sha256}"`;
  const canonical = bundle.replace(payloadToken, `"bundlePayloadSha256":"${PAYLOAD_PLACEHOLDER}"`);
  assert.equal(sha256(canonical), built.releaseManifest.bundle_payload_sha256);
  assert.equal(sha256(bundle), built.releaseManifest.bundle_file_sha256);
  assert.equal(Buffer.byteLength(bundle, 'utf8'), built.releaseManifest.bundle_metrics.bytes);
  assert.equal([...bundle].length, built.releaseManifest.bundle_metrics.characters);
});

test('generated manifest preserves V8, Drive v3, approved scopes, and no Gmail scope', () => {
  const built = buildArtifacts({ rootDir, sourceCommit: 'c'.repeat(40), write: false });
  const manifest = JSON.parse(built.artifacts['appsscript.json']);
  assert.equal(manifest.runtimeVersion, 'V8');
  assert.ok(manifest.dependencies.enabledAdvancedServices.some((service) =>
    service.serviceId === 'drive' && service.version === 'v3'));
  assert.equal(manifest.oauthScopes.some((scope) => /gmail/i.test(scope)), false);
});

test('exact committed dist artifacts pass freshness, syntax, inventory, and leakage validation', () => {
  const manifest = validateBundle(rootDir);
  assert.match(manifest.source_git_commit, /^[0-9a-f]{40}$/);
  assert.doesNotThrow(() => new vm.Script(fs.readFileSync(path.join(rootDir, 'dist', 'KnowledgeShare.bundle.gs'), 'utf8')));
});

test('top-level global inventory handles var let const and ignores non-code and nested scopes', () => {
  const source = [
    "var first = /var ignoredRegex = '[,;]'/;",
    "let second = 'const ignoredString = 1';",
    'const third = `let ignoredTemplate = ${1 + 1}`;',
    '// var ignoredLineComment = 1;',
    '/* let ignoredBlockComment = 1; */',
    'function nestedScope() { var ignoredNested = 1; let alsoIgnored = 2; }',
    'var fourth = 8 / 2, fifth = { values: [1, 2] };'
  ].join('\n');
  assert.deepEqual(
    collectTopLevelVariableDeclarations(source).map((item) => item.name),
    ['first', 'second', 'third', 'fourth', 'fifth']
  );
});

test('bundle collision gate rejects duplicate top-level globals', () => {
  assert.throws(
    () => validateTopLevelDeclarationCollisions('var duplicate = 1;\nconst duplicate = 2;'),
    /Duplicate top-level globals.*duplicate/
  );
});

test('bundle collision gate rejects function and global name collisions', () => {
  assert.throws(
    () => validateTopLevelDeclarationCollisions('var ratio = 8 / 2; function collide() {}\nlet collide = 1;'),
    /Function\/global name collisions.*collide/
  );
});
