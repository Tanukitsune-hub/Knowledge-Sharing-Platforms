const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { buildArtifacts, PAYLOAD_PLACEHOLDER, sha256 } = require('./build-apps-script-bundle.cjs');
const {
  collectTopLevelFunctionDeclarations,
  collectTopLevelVariableDeclarations
} = require('./public-surface.cjs');

function validateTopLevelDeclarationCollisions(source, file = '<inline>') {
  const functions = collectTopLevelFunctionDeclarations(source, file);
  const globals = collectTopLevelVariableDeclarations(source, file);
  const globalCounts = globals.reduce((result, item) => {
    result[item.name] = (result[item.name] || 0) + 1;
    return result;
  }, {});
  const duplicateGlobals = Object.entries(globalCounts)
    .filter(([, count]) => count > 1)
    .map(([name]) => name);
  if (duplicateGlobals.length) {
    throw new Error(`Duplicate top-level globals in bundle: ${duplicateGlobals.join(', ')}`);
  }
  const globalNames = new Set(globals.map((item) => item.name));
  const functionGlobalCollisions = [...new Set(functions
    .map((item) => item.name)
    .filter((name) => globalNames.has(name)))];
  if (functionGlobalCollisions.length) {
    throw new Error(`Function/global name collisions in bundle: ${functionGlobalCollisions.join(', ')}`);
  }
  return { functions, globals };
}

function validateBundle(rootDir = path.resolve(__dirname, '..')) {
  const distDir = path.join(rootDir, 'dist');
  const manifestPath = path.join(distDir, 'release-manifest.json');
  if (!fs.existsSync(manifestPath)) throw new Error('dist/release-manifest.json is missing; run npm run build:bundle.');
  const releaseManifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  const expected = buildArtifacts({ rootDir, sourceCommit: releaseManifest.source_git_commit, write: false });
  for (const [name, content] of Object.entries(expected.artifacts)) {
    const actualPath = path.join(distDir, name);
    if (!fs.existsSync(actualPath)) throw new Error(`Generated artifact is missing: dist/${name}`);
    if (fs.readFileSync(actualPath, 'utf8') !== content) throw new Error(`Generated artifact is stale or non-deterministic: dist/${name}`);
  }

  const bundle = expected.artifacts['KnowledgeShare.bundle.gs'];
  new vm.Script(bundle, { filename: 'KnowledgeShare.bundle.gs' });
  const payloadToken = `"bundlePayloadSha256":"${releaseManifest.bundle_payload_sha256}"`;
  if (bundle.split(payloadToken).length !== 2) throw new Error('Bundle payload hash field is missing or ambiguous.');
  const canonical = bundle.replace(payloadToken, `"bundlePayloadSha256":"${PAYLOAD_PLACEHOLDER}"`);
  if (sha256(canonical) !== releaseManifest.bundle_payload_sha256) throw new Error('Bundle payload hash mismatch.');
  if (sha256(bundle) !== releaseManifest.bundle_file_sha256) throw new Error('Bundle file checksum mismatch.');

  const inventory = validateTopLevelDeclarationCollisions(bundle, 'KnowledgeShare.bundle.gs');
  const declarations = inventory.functions;
  const counts = declarations.reduce((result, item) => {
    result[item.name] = (result[item.name] || 0) + 1;
    return result;
  }, {});
  const duplicates = Object.entries(counts).filter(([, count]) => count > 1).map(([name]) => name);
  if (duplicates.length) throw new Error(`Duplicate top-level functions in bundle: ${duplicates.join(', ')}`);

  const sourceDir = path.join(rootDir, 'src');
  const htmlNames = new Set(releaseManifest.html_resources.map((item) => path.basename(item.file, '.html')));
  const referenced = [];
  for (const file of fs.readdirSync(sourceDir).filter((name) => /\.(?:gs|html)$/.test(name))) {
    const source = fs.readFileSync(path.join(sourceDir, file), 'utf8');
    for (const match of source.matchAll(/(?:kspCreateHtmlTemplate_|include_)\(\s*['"]([^'"]+)['"]\s*\)/g)) referenced.push(match[1]);
    if (file.endsWith('.html')) {
      for (const match of source.matchAll(/<script>([\s\S]*?)<\/script>/g)) new vm.Script(match[1], { filename: `${file}.client.js` });
    }
  }
  const unresolved = [...new Set(referenced)].filter((name) => !htmlNames.has(name));
  if (unresolved.length) throw new Error(`Unresolved HTML resources: ${unresolved.join(', ')}`);

  const forbidden = [
    /C:\\Users\\/i,
    /script\.google\.com\/macros\/s\//i,
    /AKIA[0-9A-Z]{16}/,
    /sk-[A-Za-z0-9_-]{20,}/
  ];
  for (const pattern of forbidden) if (pattern.test(bundle)) throw new Error(`Forbidden private/secret-bearing bundle content matched ${pattern}.`);
  if (/^(?:Drive|SpreadsheetApp|DocumentApp|UrlFetchApp|ScriptApp|PropertiesService)\.[A-Za-z_$][\w$]*\s*\(/m.test(bundle)) {
    throw new Error('Potential dangerous Google service execution exists at top level.');
  }

  return releaseManifest;
}

if (require.main === module) {
  const manifest = validateBundle();
  console.log(`Validated Apps Script bundle: ${manifest.bundle_metrics.server_source_count} server sources, ${manifest.bundle_metrics.embedded_html_count} HTML resources.`);
}

module.exports = { validateBundle, validateTopLevelDeclarationCollisions };
