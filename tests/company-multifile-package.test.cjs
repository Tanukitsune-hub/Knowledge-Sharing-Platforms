const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');
const { BASIS, buildPackage } = require('../scripts/build-company-multifile-package.cjs');

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

test('independent candidate pin rejects source and hash drift in a self-consistent release manifest', () => {
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'ksp0071-package-pin-'));
  try {
    for (const [source,target] of [
      ['dist/KnowledgeShare.bundle.gs','dist/KnowledgeShare.bundle.gs'],
      ['dist/appsscript.json','dist/appsscript.json'],
      ['src/appsscript.json','src/appsscript.json'],
      ['scripts/bundle-source-order.json','scripts/bundle-source-order.json']
    ]) {
      const destination=path.join(temp,target);fs.mkdirSync(path.dirname(destination),{recursive:true});
      fs.copyFileSync(path.join(root,source),destination);
    }
    for (const [field,expected] of [
      ['source_git_commit',/accepted source commit changed/],
      ['bundle_file_sha256',/accepted bundle hash changed/],
      ['bundle_payload_sha256',/accepted payload hash changed/]
    ]) {
      fs.writeFileSync(path.join(temp,'dist','release-manifest.json'),JSON.stringify({...acceptedRelease,[field]:'0'.repeat(acceptedRelease[field].length)}));
      assert.throws(()=>buildPackage({rootDir:temp,write:false}),expected,field+' drift must fail');
    }
  } finally {fs.rmSync(temp,{recursive:true,force:true})}
});

test('seven ordered .gs files raw-concatenate to the accepted bundle', () => {
  const actualNames = fs.readdirSync(packageDir).filter((name) => name.endsWith('.gs')).sort();
  assert.deepEqual(actualNames, names);
  assert.deepEqual(packageManifest.ordered_files.map((file) => file.name), names);
  const parts = names.map((name) => fs.readFileSync(path.join(packageDir, name)));
  const concatenated = Buffer.concat(parts);
  assert.ok(concatenated.equals(acceptedBundle));
  assert.equal(sha256(concatenated), '01e3d541d536a0c68cc94405f1454f57c28e2d4db6c99e9949a9743e9ab9e464');
  assert.equal(acceptedRelease.source_git_commit, BASIS.sourceCommit);
  assert.equal(acceptedRelease.bundle_file_sha256, BASIS.bundleSha256);
  assert.equal(acceptedRelease.bundle_payload_sha256, BASIS.payloadSha256);
  assert.equal(packageManifest.concatenated_sha256, sha256(concatenated));
  assert.equal(packageManifest.canonical_bundle_sha256, acceptedRelease.bundle_file_sha256);
  assert.equal(packageManifest.canonical_bundle_payload_sha256, acceptedRelease.bundle_payload_sha256);
  assert.equal(packageManifest.concatenated_bytes, acceptedBundle.length);
  assert.equal(parts[0].length <= 450_000, true, 'HTML resource file exceeds its hard limit');
  assert.equal(Math.max(...parts.slice(1).map((part) => part.length)) <= 400_000, true,
    'server part exceeds its hard limit');
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
