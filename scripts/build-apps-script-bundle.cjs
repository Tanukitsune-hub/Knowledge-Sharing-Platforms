const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

const PAYLOAD_PLACEHOLDER = '0'.repeat(64);
const PRODUCT = 'Knowledge Share';

function normalizeText(value) {
  return String(value).replace(/^\uFEFF/, '').replace(/\r\n?/g, '\n');
}

function sha256(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

function readText(file) {
  return normalizeText(fs.readFileSync(file, 'utf8'));
}

function assertUnique(values, label) {
  const duplicates = values.filter((value, index) => values.indexOf(value) !== index);
  if (duplicates.length) throw new Error(`${label} contains duplicates: ${[...new Set(duplicates)].join(', ')}`);
}

function assertExactInventory(actual, expected, label) {
  assertUnique(expected, label);
  const missing = actual.filter((name) => !expected.includes(name));
  const unknown = expected.filter((name) => !actual.includes(name));
  if (missing.length || unknown.length) {
    throw new Error(`${label} coverage mismatch; unlisted=${missing.join(',') || 'none'} missing=${unknown.join(',') || 'none'}`);
  }
}

function safeJson(value, spacing = 0) {
  return JSON.stringify(value, null, spacing).replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');
}

function sourceRecord(sourceDir, file) {
  const content = readText(path.join(sourceDir, file));
  return {
    file: `src/${file}`,
    content,
    bytes: Buffer.byteLength(content, 'utf8'),
    sha256: sha256(content)
  };
}

function parseReleaseContract(coreSource) {
  const releaseMatch = coreSource.match(/var KSP_RELEASE_VERSION = '([^']+)'/);
  const schemaMatch = coreSource.match(/var KSP_SCHEMA_VERSION = (\d+)/);
  if (!releaseMatch || !schemaMatch) throw new Error('Unable to read release/schema contract from 00_Core.gs.');
  return { releaseVersion: releaseMatch[1], schemaVersion: Number(schemaMatch[1]) };
}

function defaultSourceCommit(rootDir) {
  return execFileSync('git', ['rev-parse', 'HEAD'], { cwd: rootDir, encoding: 'utf8' }).trim();
}

function buildArtifacts(options = {}) {
  const rootDir = path.resolve(options.rootDir || path.join(__dirname, '..'));
  const sourceDir = path.join(rootDir, 'src');
  const distDir = path.join(rootDir, 'dist');
  const orderPath = path.join(rootDir, 'scripts', 'bundle-source-order.json');
  const order = JSON.parse(readText(orderPath));
  const sourceCommit = String(options.sourceCommit || defaultSourceCommit(rootDir)).trim();
  if (!/^[0-9a-f]{40}$/.test(sourceCommit)) throw new Error('sourceCommit must be a full lowercase Git commit SHA.');
  if (!order.profile || !order.hashCanonicalizationVersion) throw new Error('Bundle profile/hash contract is missing.');

  const actualServer = fs.readdirSync(sourceDir).filter((name) => name.endsWith('.gs')).sort();
  const actualHtml = fs.readdirSync(sourceDir).filter((name) => name.endsWith('.html')).sort();
  assertExactInventory(actualServer, order.serverSources, 'serverSources');
  assertExactInventory(actualHtml, order.htmlResources, 'htmlResources');

  const serverSources = order.serverSources.map((file) => sourceRecord(sourceDir, file));
  const htmlSources = order.htmlResources.map((file) => sourceRecord(sourceDir, file));
  const manifestContent = readText(path.join(sourceDir, 'appsscript.json'));
  JSON.parse(manifestContent);
  const release = parseReleaseContract(serverSources.find((record) => record.file === 'src/00_Core.gs').content);

  const metadata = {
    product: PRODUCT,
    releaseVersion: release.releaseVersion,
    schemaVersion: release.schemaVersion,
    sourceCommit,
    bundleProfile: order.profile,
    hashCanonicalizationVersion: order.hashCanonicalizationVersion,
    bundlePayloadSha256: PAYLOAD_PLACEHOLDER
  };
  const htmlMap = Object.fromEntries(htmlSources.map((record) => [path.basename(record.file, '.html'), record.content]));

  const sections = [
    '// GENERATED FILE. DO NOT EDIT.',
    '// Authoritative source: src/ and scripts/bundle-source-order.json',
    `var KSP_BUNDLE_RELEASE_METADATA = Object.freeze(${safeJson(metadata)});`,
    `var KSP_BUNDLED_HTML_RESOURCES = Object.freeze(${safeJson(htmlMap, 2)});`,
    ''
  ];
  for (const record of serverSources) {
    sections.push(`// ===== BEGIN ${record.file} =====`, record.content.replace(/\n$/, ''), `// ===== END ${record.file} =====`, '');
  }
  const canonicalBundle = `${sections.join('\n')}\n`;
  const payloadHash = sha256(canonicalBundle);
  const placeholderToken = `"bundlePayloadSha256":"${PAYLOAD_PLACEHOLDER}"`;
  if (canonicalBundle.split(placeholderToken).length !== 2) throw new Error('Payload hash placeholder must occur exactly once.');
  const bundle = canonicalBundle.replace(placeholderToken, `"bundlePayloadSha256":"${payloadHash}"`);
  const fileHash = sha256(bundle);
  const bundleMetrics = {
    bytes: Buffer.byteLength(bundle, 'utf8'),
    characters: [...bundle].length,
    lines: bundle.split('\n').length - 1,
    server_source_count: serverSources.length,
    embedded_html_count: htmlSources.length
  };

  const releaseManifest = {
    product: PRODUCT,
    release_version: release.releaseVersion,
    schema_version: release.schemaVersion,
    source_git_commit: sourceCommit,
    bundle_profile: order.profile,
    hash_canonicalization_version: order.hashCanonicalizationVersion,
    bundle_payload_sha256: payloadHash,
    bundle_file_sha256: fileHash,
    source_manifest_sha256: sha256(manifestContent),
    source_order_sha256: sha256(readText(orderPath)),
    bundle_metrics: bundleMetrics,
    server_sources: serverSources.map(({ file, bytes, sha256: digest }) => ({ file, bytes, sha256: digest })),
    html_resources: htmlSources.map(({ file, bytes, sha256: digest }) => ({ file, bytes, sha256: digest }))
  };
  const releaseManifestText = `${safeJson(releaseManifest, 2)}\n`;
  const generatedManifest = `${safeJson(JSON.parse(manifestContent), 2)}\n`;
  const installGuide = `# Knowledge Share ${release.releaseVersion} installation\n\n` +
    `Source commit: \`${sourceCommit}\`  \n` +
    `Bundle SHA-256: \`${fileHash}\`  \n` +
    `Payload SHA-256: \`${payloadHash}\`\n\n` +
    `1. Create a Google Spreadsheet in the intended company Drive folder.\n` +
    `2. Open Extensions -> Apps Script and add the Drive API service.\n` +
    `3. Replace the default Code.gs contents with the complete KnowledgeShare.bundle.gs once, then save.\n` +
    `4. Select and run installKnowledgeShare, approve only the expected Google permissions, and confirm READY_FOR_DEPLOYMENT in KnowledgeShare_Installation.\n` +
    `5. Deploy one company-restricted Web App. Manually verify it executes as the deploying administrator and is restricted to the approved company/domain audience.\n` +
    `6. Run confirmKnowledgeShareDeploymentSecurity, then checkKnowledgeShareReadiness, and confirm READY. Re-attest after any deployment URL or security-setting change.\n\n` +
    `Do not split or edit the generated bundle. OpenAI and Gemini remain disabled until separately configured.\n`;

  const artifacts = {
    'KnowledgeShare.bundle.gs': bundle,
    'appsscript.json': generatedManifest,
    'INSTALL.md': installGuide,
    'release-manifest.json': releaseManifestText
  };
  if (options.write !== false) {
    fs.mkdirSync(distDir, { recursive: true });
    for (const [name, content] of Object.entries(artifacts)) fs.writeFileSync(path.join(distDir, name), content, 'utf8');
  }
  return { artifacts, releaseManifest };
}

function parseArguments(argv) {
  const options = {};
  for (let index = 0; index < argv.length; index += 1) {
    if (argv[index] === '--source-commit') options.sourceCommit = argv[++index];
    else if (argv[index] === '--no-write') options.write = false;
    else throw new Error(`Unknown argument: ${argv[index]}`);
  }
  return options;
}

if (require.main === module) {
  const result = buildArtifacts(parseArguments(process.argv.slice(2)));
  console.log(`Built deterministic Apps Script bundle: ${result.releaseManifest.bundle_metrics.bytes} bytes, ${result.releaseManifest.bundle_metrics.lines} lines.`);
}

module.exports = { PAYLOAD_PLACEHOLDER, buildArtifacts, normalizeText, sha256 };
