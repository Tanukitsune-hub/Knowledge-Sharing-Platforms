const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const BASIS = Object.freeze({
  product: 'Alternative Assets Intelligence',
  release: '0.2.3',
  schema: 9,
  sourceCommit: 'de0128791e4f29739ed6979989d466086bbf7a30',
  bundleSha256: 'ef4fa15273d16d6dfd19fe567f4fdfe75f5dfea1b19e5778bd9dc6df44377a66',
  payloadSha256: '7e403bf2fd48701dc0eab6c8c5fd81230ee97d7821d1413016d55ba34f9ace57'
});
const OUTPUT_DIR = path.join('dist', 'company-multifile');
const GS_NAMES = Object.freeze([
  '00_BundleResources.gs',
  '10_ServerPart01.gs',
  '20_ServerPart02.gs',
  '30_ServerPart03.gs',
  '40_ServerPart04.gs',
  '50_ServerPart05.gs',
  '60_ServerPart06.gs'
]);
const SERVER_PART_LIMIT = 400_000;
const RESOURCE_HARD_LIMIT = 450_000;

function sha256(bytes) {
  return crypto.createHash('sha256').update(bytes).digest('hex');
}

function readBasis(rootDir) {
  const distDir = path.join(rootDir, 'dist');
  const release = JSON.parse(fs.readFileSync(path.join(distDir, 'release-manifest.json'), 'utf8'));
  const bundle = fs.readFileSync(path.join(distDir, 'KnowledgeShare.bundle.gs'));
  const scriptManifest = fs.readFileSync(path.join(distDir, 'appsscript.json'));
  const sourceManifest = fs.readFileSync(path.join(rootDir, 'src', 'appsscript.json'), 'utf8')
    .replace(/^\uFEFF/, '').replace(/\r\n?/g, '\n');
  const sourceOrder = fs.readFileSync(path.join(rootDir, 'scripts', 'bundle-source-order.json'), 'utf8')
    .replace(/^\uFEFF/, '').replace(/\r\n?/g, '\n');

  assert.equal(release.product, BASIS.product, 'accepted product changed');
  assert.equal(release.release_version, BASIS.release, 'accepted release changed');
  assert.equal(release.schema_version, BASIS.schema, 'accepted schema changed');
  assert.equal(release.source_git_commit, BASIS.sourceCommit, 'accepted source commit changed');
  assert.equal(release.bundle_file_sha256, BASIS.bundleSha256, 'accepted bundle hash changed');
  assert.equal(release.bundle_payload_sha256, BASIS.payloadSha256, 'accepted payload hash changed');
  assert.equal(bundle.length, release.bundle_metrics.bytes, 'bundle byte count differs from release manifest');
  assert.equal(sha256(bundle), BASIS.bundleSha256, 'canonical bundle raw bytes differ from accepted release');
  assert.equal(sha256(sourceManifest), release.source_manifest_sha256, 'source manifest differs from accepted release');
  assert.equal(sha256(sourceOrder), release.source_order_sha256, 'source order differs from accepted release');
  assert.deepEqual(JSON.parse(scriptManifest.toString('utf8')), JSON.parse(sourceManifest), 'Apps Script manifest content differs');
  assert.deepEqual(
    release.server_sources.map((item) => item.file),
    JSON.parse(sourceOrder).serverSources.map((name) => 'src/' + name),
    'server source inventory/order changed'
  );
  return { bundle, release, scriptManifest };
}

function splitCompleteSections(bundle, release) {
  const text = bundle.toString('utf8');
  assert.ok(Buffer.from(text, 'utf8').equals(bundle), 'bundle is not round-trip UTF-8');
  const begins = [...text.matchAll(/^\/\/ ===== BEGIN (src\/[^\r\n]+\.gs) =====$/gm)];
  const ends = [...text.matchAll(/^\/\/ ===== END (src\/[^\r\n]+\.gs) =====$/gm)];
  assert.equal(begins.length, release.server_sources.length, 'BEGIN count differs from release inventory');
  assert.equal(ends.length, begins.length, 'BEGIN/END counts differ');
  assert.ok(begins.length > 6, 'too few server sections for six parts');
  const resources = Buffer.from(text.slice(0, begins[0].index), 'utf8');
  const resourceText = resources.toString('utf8');
  assert.ok(resourceText.includes('var KSP_BUNDLE_RELEASE_METADATA = Object.freeze('), 'release metadata missing from resource file');
  assert.ok(resourceText.includes('var KSP_BUNDLED_HTML_RESOURCES = Object.freeze('), 'HTML resource assignment missing');
  assert.equal(resourceText.split('var KSP_BUNDLED_HTML_RESOURCES = Object.freeze(').length, 2, 'HTML resource assignment is ambiguous');
  assert.ok(resources.length <= RESOURCE_HARD_LIMIT, 'resource file exceeds 450,000-byte hard limit');
  new vm.Script(resourceText, { filename: GS_NAMES[0] });

  const sections = begins.map((begin, index) => {
    const nextStart = begins[index + 1] ? begins[index + 1].index : text.length;
    const source = text.slice(begin.index, nextStart);
    const sectionEnds = [...source.matchAll(/^\/\/ ===== END (src\/[^\r\n]+\.gs) =====$/gm)];
    assert.equal(begin[1], release.server_sources[index].file, 'section order differs from release inventory');
    assert.equal(sectionEnds.length, 1, 'section must contain exactly one END');
    assert.equal(sectionEnds[0][1], begin[1], 'section BEGIN/END names differ');
    assert.match(source.slice(sectionEnds[0].index + sectionEnds[0][0].length), /^\n+$/, 'content follows section END');
    return { name: begin[1], bytes: Buffer.from(source, 'utf8') };
  });
  return { resources, sections };
}

function balancedServerParts(sections) {
  const count = GS_NAMES.length - 1;
  const size = sections.map((section) => section.bytes.length);
  const prefix = [0];
  for (const bytes of size) prefix.push(prefix[prefix.length - 1] + bytes);
  const mean = prefix[prefix.length - 1] / count;
  const dp = Array.from({ length: count + 1 }, () => Array(sections.length + 1).fill(null));
  dp[0][0] = { cost: 0, previous: -1 };

  for (let part = 1; part <= count; part += 1) {
    for (let end = part; end <= sections.length - (count - part); end += 1) {
      for (let start = part - 1; start < end; start += 1) {
        const prior = dp[part - 1][start];
        const bytes = prefix[end] - prefix[start];
        if (!prior || bytes > SERVER_PART_LIMIT) continue;
        const cost = prior.cost + (bytes - mean) ** 2;
        const best = dp[part][end];
        if (!best || cost < best.cost || (cost === best.cost && start < best.previous)) {
          dp[part][end] = { cost, previous: start };
        }
      }
    }
  }
  assert.ok(dp[count][sections.length], 'six complete server parts cannot meet the 400,000-byte limit');
  const groups = [];
  let end = sections.length;
  for (let part = count; part > 0; part -= 1) {
    const start = dp[part][end].previous;
    groups.unshift(sections.slice(start, end));
    end = start;
  }
  assert.equal(end, 0);
  return groups;
}

function installationGuide() {
  const lines = [
    '# Alternative Assets Intelligence 0.2.3 — 7ファイル導入手順',
    '',
    'このpackageは同じsource commitから生成したsingle-file bundleとbyte-identicalな手動導入用代替artifactです。',
    'release source commit: ' + BASIS.sourceCommit,
    'canonical bundle SHA-256: ' + BASIS.bundleSha256,
    '',
    '1. 既に受け取った会社導入ガイドの手順1～3に従い、導入先Spreadsheet、Apps Script、必要なDrive APIを準備します。',
    '2. Apps Script editorで既存Code.gsを00_BundleResources.gsに名前変更してサンプルコードを消し、残り6個のスクリプトファイルを記載順に作成します。各添付.txtの全文を対応する.gsへ貼り付けてください。',
    ''
  ];
  GS_NAMES.forEach((name, index) => lines.push('   ' + (index + 1) + '. ' + name + ' ← ' + name.replace(/\.gs$/, '.txt')));
  lines.push(
    '',
    '3. 7個の.gsをすべて保存します。部分貼付、内容の編集、ファイル順の変更はしないでください。',
    '4. プロジェクトの設定でappsscript.jsonの表示を有効にし、添付のappsscript.jsonの全文をmanifest editorへ貼り付けて保存します。',
    '5. 同梱のPACKAGE_MANIFEST.jsonで7ファイルの順序・bytes・SHA-256、連結SHA-256、release/schema/source commitを照合できます。',
    '6. 会社導入ガイドの単一bundle貼付手順（手順4）は本書の手順2～4で置き換え、同ガイドの手順5以降に従います。',
    '',
    '初回PilotのWeb Appはexecute-as self / access self onlyを維持します。OpenAI・Geminiは別途設定されるまで無効です。',
    'このWorkでは会社Apps Scriptへの保存・導入・deploymentは行いません。',
    ''
  );
  return Buffer.from(lines.join('\n'), 'utf8');
}

function buildPackage(options = {}) {
  const rootDir = path.resolve(options.rootDir || path.join(__dirname, '..'));
  const { bundle, release, scriptManifest } = readBasis(rootDir);
  const { resources, sections } = splitCompleteSections(bundle, release);
  const groups = balancedServerParts(sections);
  const gsBuffers = [resources, ...groups.map((group) => Buffer.concat(group.map((section) => section.bytes)))];
  const reconstructed = Buffer.concat(gsBuffers);
  assert.ok(reconstructed.equals(bundle), 'seven-file raw concatenation differs from canonical bundle');
  assert.equal(sha256(reconstructed), BASIS.bundleSha256);

  const orderedFiles = GS_NAMES.map((name, index) => {
    const bytes = gsBuffers[index];
    const limit = index === 0 ? RESOURCE_HARD_LIMIT : SERVER_PART_LIMIT;
    assert.ok(bytes.length <= limit, name + ' exceeds size limit');
    new vm.Script(bytes.toString('utf8'), { filename: name });
    return {
      name,
      bytes: bytes.length,
      sha256: sha256(bytes),
      text_attachment: name.replace(/\.gs$/, '.txt'),
      source_sections: index === 0 ? [] : groups[index - 1].map((section) => section.name)
    };
  });
  const packageManifest = {
    format: 'company-multifile-v1',
    product: BASIS.product,
    release_version: BASIS.release,
    schema_version: BASIS.schema,
    bundle_source_commit: BASIS.sourceCommit,
    canonical_bundle_sha256: BASIS.bundleSha256,
    canonical_bundle_payload_sha256: BASIS.payloadSha256,
    concatenated_bytes: reconstructed.length,
    concatenated_sha256: sha256(reconstructed),
    ordered_files: orderedFiles,
    appsscript_json: {
      name: 'appsscript.json',
      bytes: scriptManifest.length,
      sha256: sha256(scriptManifest)
    }
  };
  const files = new Map();
  orderedFiles.forEach((entry, index) => {
    files.set(entry.name, gsBuffers[index]);
    files.set(entry.text_attachment, Buffer.from(gsBuffers[index]));
  });
  files.set('appsscript.json', scriptManifest);
  files.set('PACKAGE_MANIFEST.json', Buffer.from(JSON.stringify(packageManifest, null, 2) + '\n', 'utf8'));
  files.set('INSTALL.md', installationGuide());

  const outputDir = path.join(rootDir, OUTPUT_DIR);
  if (options.write !== false || options.check === true) {
    if (options.check === true) {
      assert.ok(fs.existsSync(outputDir), 'generated package directory is missing');
      assert.deepEqual(fs.readdirSync(outputDir).sort(), [...files.keys()].sort(), 'generated package file inventory differs');
      for (const [name, bytes] of files) {
        assert.ok(fs.readFileSync(path.join(outputDir, name)).equals(bytes), 'generated file differs: ' + name);
      }
    } else {
      if (fs.existsSync(outputDir)) {
        const extra = fs.readdirSync(outputDir).filter((name) => !files.has(name));
        assert.deepEqual(extra, [], 'unexpected files in package directory');
      }
      fs.mkdirSync(outputDir, { recursive: true });
      for (const [name, bytes] of files) fs.writeFileSync(path.join(outputDir, name), bytes);
    }
  }
  return { packageManifest, files };
}

if (require.main === module) {
  const args = process.argv.slice(2);
  if (args.length > 1 || (args[0] && args[0] !== '--check')) {
    throw new Error('Usage: node scripts/build-company-multifile-package.cjs [--check]');
  }
  const result = buildPackage({ check: args[0] === '--check' });
  const sizes = result.packageManifest.ordered_files.map((entry) => entry.bytes);
  console.log(
    (args[0] === '--check' ? 'Validated' : 'Built') +
    ' company multi-file package: 7 .gs files; max ' +
    Math.max(...sizes) + ' bytes; SHA-256 ' + result.packageManifest.concatenated_sha256
  );
}

module.exports = { BASIS, GS_NAMES, buildPackage, sha256 };
