const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const {
  PUBLIC_FACADE_ALLOWLIST,
  OPERATOR_ENTRYPOINT_ALLOWLIST,
  collectRepositoryPublicSurface,
  collectTopLevelFunctionDeclarations
} = require('../scripts/public-surface.cjs');

const rootDir = path.resolve(__dirname, '..');
const bundle = fs.readFileSync(path.join(rootDir, 'dist', 'KnowledgeShare.bundle.gs'), 'utf8');

function loadBundle() {
  const context = vm.createContext({ console });
  new vm.Script(bundle, { filename: 'KnowledgeShare.bundle.gs' }).runInContext(context);
  return context;
}

function loadModularDistributionResources() {
  const context = vm.createContext({ console });
  for (const file of ['00_Core.gs', '01_DistributionResources.gs']) {
    new vm.Script(fs.readFileSync(path.join(rootDir, 'src', file), 'utf8'), { filename: file })
      .runInContext(context);
  }
  return context;
}

test('bundle and modular source expose the same normal and guarded public surfaces', () => {
  const sourceNames = collectRepositoryPublicSurface(rootDir)
    .filter((item) => !item.name.endsWith('_')).map((item) => item.name).sort();
  const bundleNames = collectTopLevelFunctionDeclarations(bundle)
    .filter((item) => !item.name.endsWith('_')).map((item) => item.name).sort();
  assert.deepEqual(bundleNames, sourceNames);
  assert.deepEqual(bundleNames, [...PUBLIC_FACADE_ALLOWLIST, ...OPERATOR_ENTRYPOINT_ALLOWLIST].sort());
});

test('bundle resource loader renders both top-level pages and every include from embedded HTML', () => {
  const context = loadBundle();
  context.HtmlService = {
    XFrameOptionsMode: { DEFAULT: 'DEFAULT' },
    createTemplate(content) {
      return { evaluate: () => ({
        content,
        setTitle() { return this; },
        setXFrameOptionsMode() { return this; }
      }) };
    }
  };
  const index = context.doGet({ parameter: {} });
  const search = context.doGet({ parameter: { page: 'knowledge' } });
  assert.match(index.content, /id="meeting-form"/);
  assert.match(search.content, /include_\('KnowledgeSearchPage'\)/);
  assert.match(context.kspReadHtmlResource_('KnowledgeSearchPage'), /knowledge-mode/);
  for (const name of Object.keys(context.KSP_BUNDLED_HTML_RESOURCES)) {
    assert.equal(context.kspReadHtmlResource_(name), context.KSP_BUNDLED_HTML_RESOURCES[name]);
  }
});

test('modular resource loader preserves Apps Script file-template evaluation', () => {
  const context = loadModularDistributionResources();
  const calls = [];
  context.HtmlService = {
    createTemplate() {
      calls.push('string');
      throw new Error('modular mode must not use a string template');
    },
    createTemplateFromFile(name) {
      calls.push(`file:${name}`);
      return { mode: 'file', name };
    }
  };
  assert.deepEqual(context.kspCreateHtmlTemplate_('Index'), { mode: 'file', name: 'Index' });
  assert.deepEqual(calls, ['file:Index']);
});

test('representative accepted facades delegate identically in bundle mode without provider calls', () => {
  const context = loadBundle();
  const cases = [
    ['registerMeeting', 'kspRegisterMeeting_', 'kspCreateMeetingEnvironment_', [{ Date: '2026-01-01' }]],
    ['uploadPitchbookFile', 'kspUploadPitchbookFile_', 'kspCreatePitchbookEnvironment_', [{ name: 'synthetic.txt' }]],
    ['searchMeetingRecords', 'kspSearchMeetingRecords_', 'kspCreateMaintenanceEnvironment_', [{}]],
    ['getGpWorkspaceData', 'kspGetGpWorkspaceData_', 'kspCreateGpWorkspaceEnvironment_', ['GP-TEST']],
    ['getEntityWorkspaceData', 'kspGetEntityWorkspaceData_', 'kspCreateEntityWorkspaceEnvironment_', [{}]],
    ['getMeetingActivityAnalytics', 'kspGetMeetingActivityAnalytics_', 'kspCreateActivityAnalyticsEnvironment_', [{}]],
    ['getRelationshipExplorerData', 'kspGetRelationshipExplorerData_', 'kspCreateRelationshipExplorerEnvironment_', [{}]],
    ['searchKnowledge', 'kspRunProviderKnowledgeSearch_', 'kspCreateProviderNeutralAiEnvironment_', [{}]],
    ['previewKnowledgeExport', 'kspRunKnowledgeExportPreview_', 'kspCreateKnowledgeExportEnvironment_', [{}]],
    ['getAiProviderAdminData', 'kspGetAiProviderAdminData_', 'kspCreateProviderNeutralAiEnvironment_', []]
  ];
  for (const [facade, helper, environmentFactory, args] of cases) {
    const marker = `${facade}-ok`;
    context[environmentFactory] = () => ({ marker: facade });
    context[helper] = (environment) => ({ marker, environment: environment.marker });
    assert.equal(context[facade](...args).marker, marker, facade);
  }
});

test('bundle metadata matches the exact release manifest', () => {
  const context = loadBundle();
  const manifest = JSON.parse(fs.readFileSync(path.join(rootDir, 'dist', 'release-manifest.json'), 'utf8'));
  assert.equal(context.KSP_BUNDLE_RELEASE_METADATA.sourceCommit, manifest.source_git_commit);
  assert.equal(context.KSP_BUNDLE_RELEASE_METADATA.bundlePayloadSha256, manifest.bundle_payload_sha256);
  assert.equal(context.KSP_BUNDLE_RELEASE_METADATA.bundleProfile, manifest.bundle_profile);
});
