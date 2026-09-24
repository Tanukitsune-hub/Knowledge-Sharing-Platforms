const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');
const { buildPackage } = require('../scripts/build-company-multifile-package.cjs');

const root = path.join(__dirname, '..');
const packageDir = path.join(root, 'dist', 'company-multifile');
const acceptedBundle = fs.readFileSync(path.join(root, 'dist', 'KnowledgeShare.bundle.gs'));
const acceptedRelease = JSON.parse(fs.readFileSync(path.join(root, 'dist', 'release-manifest.json'), 'utf8'));
const packageManifest = JSON.parse(fs.readFileSync(path.join(packageDir, 'PACKAGE_MANIFEST.json'), 'utf8'));
const names = [
  '00_BundleResources.gs',
  '10_ServerPart01.gs',
  '20_ServerPart02.gs',
  '30_ServerPart03.gs',
  '40_ServerPart04.gs',
  '50_ServerPart05.gs',
  '60_ServerPart06.gs'
];

function sha256(bytes) {
  return crypto.createHash('sha256').update(bytes).digest('hex');
}

test('seven ordered .gs files raw-concatenate to the accepted bundle', () => {
  const actualNames = fs.readdirSync(packageDir).filter((name) => name.endsWith('.gs')).sort();
  assert.deepEqual(actualNames, names);
  assert.deepEqual(packageManifest.ordered_files.map((file) => file.name), names);
  const parts = names.map((name) => fs.readFileSync(path.join(packageDir, name)));
  const concatenated = Buffer.concat(parts);
  assert.ok(concatenated.equals(acceptedBundle));
  assert.equal(sha256(concatenated), '8ef7c362af8c5da23c792cf20046c8b6f08a044f16fa5b71e3d40f7f46601c27');
  assert.equal(packageManifest.concatenated_sha256, sha256(concatenated));
  assert.equal(packageManifest.canonical_bundle_sha256, acceptedRelease.bundle_file_sha256);
  assert.equal(packageManifest.canonical_bundle_payload_sha256, acceptedRelease.bundle_payload_sha256);
  assert.equal(packageManifest.concatenated_bytes, acceptedBundle.length);
  assert.equal(Math.max(...parts.map((part) => part.length)) <= 400_000, true);
  for (let index = 0; index < parts.length; index += 1) {
    assert.equal(packageManifest.ordered_files[index].bytes, parts[index].length);
    assert.equal(packageManifest.ordered_files[index].sha256, sha256(parts[index]));
    new vm.Script(parts[index].toString('utf8'), { filename: names[index] });
  }
});

test('resource assignment stays complete and every server section stays in one file', () => {
  const resource = fs.readFileSync(path.join(packageDir, names[0]), 'utf8');
  const context = {};
  vm.runInNewContext(resource, context, { filename: names[0] });
  assert.equal(context.KSP_BUNDLE_RELEASE_METADATA.bundlePayloadSha256, acceptedRelease.bundle_payload_sha256);
  assert.deepEqual(
    Object.keys(context.KSP_BUNDLED_HTML_RESOURCES).sort(),
    acceptedRelease.html_resources.map((item) => path.basename(item.file, '.html')).sort()
  );
  const allSections = [];
  for (const name of names.slice(1)) {
    const content = fs.readFileSync(path.join(packageDir, name), 'utf8');
    assert.match(content, /^\/\/ ===== BEGIN src\/[^\n]+ =====/);
    assert.match(content, /\/\/ ===== END src\/[^\n]+ =====\n\n$/);
    const begins = [...content.matchAll(/^\/\/ ===== BEGIN (src\/[^\r\n]+\.gs) =====$/gm)].map((match) => match[1]);
    const ends = [...content.matchAll(/^\/\/ ===== END (src\/[^\r\n]+\.gs) =====$/gm)].map((match) => match[1]);
    assert.ok(begins.length > 0);
    assert.deepEqual(begins, ends);
    assert.deepEqual(
      packageManifest.ordered_files.find((item) => item.name === name).source_sections,
      begins
    );
    allSections.push(...begins);
  }
  assert.deepEqual(allSections, acceptedRelease.server_sources.map((item) => item.file));
});

test('plain-text attachments, Apps Script manifest, and regeneration remain byte-identical', () => {
  for (const name of names) {
    const code = fs.readFileSync(path.join(packageDir, name));
    const text = fs.readFileSync(path.join(packageDir, name.replace(/\.gs$/, '.txt')));
    assert.ok(text.equals(code));
  }
  const packagedScriptManifest = fs.readFileSync(path.join(packageDir, 'appsscript.json'));
  const acceptedScriptManifest = fs.readFileSync(path.join(root, 'dist', 'appsscript.json'));
  assert.ok(packagedScriptManifest.equals(acceptedScriptManifest));
  assert.equal(packageManifest.appsscript_json.sha256, sha256(packagedScriptManifest));
  assert.equal(packageManifest.release_version, acceptedRelease.release_version);
  assert.equal(packageManifest.schema_version, acceptedRelease.schema_version);
  assert.equal(packageManifest.bundle_source_commit, acceptedRelease.source_git_commit);
  const expected = buildPackage({ rootDir: root, write: false });
  for (const [name, bytes] of expected.files) {
    assert.ok(fs.readFileSync(path.join(packageDir, name)).equals(bytes), 'non-deterministic file: ' + name);
  }
  buildPackage({ rootDir: root, check: true });
});
