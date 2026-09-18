const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const webApp = fs.readFileSync(path.join(root, 'src', '90_WebApp.gs'), 'utf8');
const index = fs.readFileSync(path.join(root, 'src', 'Index.html'), 'utf8');
const clientCore = fs.readFileSync(path.join(root, 'src', 'ClientCore.html'), 'utf8');
const standalone = fs.readFileSync(path.join(root, 'src', 'KnowledgeSearch.html'), 'utf8');
const knowledgePage = fs.readFileSync(path.join(root, 'src', 'KnowledgeSearchPage.html'), 'utf8');
const gpWorkspacePage = fs.readFileSync(path.join(root, 'src', 'GpWorkspacePage.html'), 'utf8');
const entityWorkspacePage = fs.readFileSync(path.join(root, 'src', 'EntityWorkspacePage.html'), 'utf8');
const activityAnalyticsPage = fs.readFileSync(path.join(root, 'src', 'ActivityAnalyticsPage.html'), 'utf8');
const relationshipExplorerPage = fs.readFileSync(path.join(root, 'src', 'RelationshipExplorerPage.html'), 'utf8');

const bootstrap=fs.readFileSync(path.join(root,'src','ClientBootstrap.html'),'utf8');
const sidebar=index.match(/<nav\b[\s\S]*?<\/nav>/)[0];
function assertSidebarButton(id,label){
  const button=sidebar.match(new RegExp('<button id="'+id+'"[^>]*>([\\s\\S]*?)<\\/button>'));
  assert.ok(button, id+' remains in the sidebar');
  assert.equal(button[1].replace(/<[^>]*>/g,'').trim(),label);
}

test('Knowledge Search navigation is an integrated same-document showPage page', () => {
  assertSidebarButton('nav-knowledge','ナレッジ検索');
  assert.equal((index.match(/id="nav-knowledge"/g) || []).length, 1);
  assert.doesNotMatch(index, /\?page=knowledge/);
  assert.doesNotMatch(index, /knowledge-back/);
  assert.match(index, /include_\('KnowledgeSearchPage'\)/);
  assert.match(index, /include_\('ClientKnowledgeSearch'\)/);
  assert.match(clientCore, /knowledge:document\.getElementById\('page-knowledge'\)/);
  assert.match(clientCore, /function showPage\(name\)/);
  assert.match(clientCore, /Object\.keys\(pages\)\.forEach\(name=>\{/);
  const ids = Array.from(knowledgePage.matchAll(/\bid="([^"]+)"/g), match => match[1]);
  assert.equal(new Set(ids).size, ids.length);
  assert.match(knowledgePage, /<section id="page-knowledge" class="page">/);
  assert.ok(fs.existsSync(path.join(root, 'src', 'KnowledgeSearchPage.html')));
  assert.match(standalone, /include_\('KnowledgeSearchPage'\)/);
  assert.match(standalone, /include_\('ClientKnowledgeSearch'\)/);
  assert.match(standalone, /page-knowledge'\)\.classList\.add\('active'\)/);
  assert.doesNotMatch(webApp, /id="nav-knowledge"/);
  assert.doesNotMatch(webApp, /target="_top"/);
  assert.doesNotMatch(webApp, /window\.location\.search/);
  assert.doesNotMatch(webApp, /\.replace\(/);
});

test('GP Workspace navigation is an integrated same-document page', () => {
  assert.doesNotMatch(sidebar,/nav-gp-workspace/);
  assertSidebarButton('nav-entity-workspace','面談先サマリー');
  assert.match(bootstrap,/id="summary-show-gp"/);
  assert.match(index, /include_\('GpWorkspacePage'\)/);
  assert.match(index, /include_\('ClientGpWorkspace'\)/);
  assert.match(clientCore, /'gp-workspace':document\.getElementById\('page-gp-workspace'\)/);
  assert.match(gpWorkspacePage, /<section id="page-gp-workspace" class="page">/);
  const ids = Array.from(gpWorkspacePage.matchAll(/\bid="([^"]+)"/g), match => match[1]);
  assert.equal(new Set(ids).size, ids.length);
});

test('Activity Analytics navigation is an integrated same-document page', () => {
  assertSidebarButton('nav-activity-analytics','面談実績の集計');
  assert.match(index, /include_\('ActivityAnalyticsPage'\)/);
  assert.match(index, /include_\('ClientActivityAnalytics'\)/);
  assert.match(clientCore, /'activity-analytics':document\.getElementById\('page-activity-analytics'\)/);
  assert.match(activityAnalyticsPage, /<section id="page-activity-analytics" class="page">/);
  const ids = Array.from(activityAnalyticsPage.matchAll(/\bid="([^"]+)"/g), match => match[1]);
  assert.equal(new Set(ids).size, ids.length);
});

test('Entity Workspace navigation is an integrated same-document read-only page', () => {
  assertSidebarButton('nav-entity-workspace','面談先サマリー');
  assert.match(index, /include_\('EntityWorkspacePage'\)/);
  assert.match(index, /include_\('ClientEntityWorkspace'\)/);
  assert.match(clientCore, /'entity-workspace':document\.getElementById\('page-entity-workspace'\)/);
  assert.match(entityWorkspacePage, /<section id="page-entity-workspace" class="page">/);
  const ids = Array.from(entityWorkspacePage.matchAll(/\bid="([^"]+)"/g), match => match[1]);
  assert.equal(new Set(ids).size, ids.length);
});

test('Relationship Explorer navigation is an integrated same-document read-only page', () => {
  assert.doesNotMatch(sidebar,/nav-relationship-explorer/);
  assert.match(index,/<button id="nav-relationship-explorer"[^>]*hidden[^>]*tabindex="-1"/);
  assertSidebarButton('nav-meeting-past','過去の記録');
  assert.match(index, /include_\('RelationshipExplorerPage'\)/);
  assert.match(index, /include_\('ClientRelationshipExplorer'\)/);
  assert.match(clientCore, /'relationship-explorer':document\.getElementById\('page-relationship-explorer'\)/);
  assert.match(relationshipExplorerPage, /<section id="page-relationship-explorer" class="page">/);
  const ids = Array.from(relationshipExplorerPage.matchAll(/\bid="([^"]+)"/g), match => match[1]);
  assert.equal(new Set(ids).size, ids.length);
});

test('showPage switches Knowledge Search, GP Workspace, and Meeting without changing the document', () => {
  const script = clientCore.match(/<script>([\s\S]*?)<\/script>/);
  assert.ok(script);
  const nodes = new Map();
  const markup=fs.readdirSync(path.join(root,'src')).filter(name=>name.endsWith('.html')).map(name=>fs.readFileSync(path.join(root,'src',name),'utf8')).join('\n');
  const actualIds=new Set(Array.from(markup.matchAll(/\bid="([^"]+)"/g),match=>match[1]));
  function node(id) {
    if (!nodes.has(id)) {
      const state = { active: false };
      nodes.set(id, {
        id,
        value: '',
        disabled: false,
        textContent: '',
        classList: {
          add(name) {if(name==='active')state.active=true;},
          toggle(name, enabled) {
            if (name === 'active') state.active = Boolean(enabled);
          },
          contains(name) {
            return name === 'active' && state.active;
          }
        },
        addEventListener() {},prepend() {},
        _state: state
      });
    }
    return nodes.get(id);
  }
  const context = {
    document: { getElementById: id=>actualIds.has(id)?node(id):null },
    localStorage: { getItem() { return null; }, setItem() {}, removeItem() {} }
  };
  vm.runInNewContext(script[1], context, { filename: 'ClientCore.js' });

  context.showPage('knowledge');
  assert.equal(node('page-knowledge').classList.contains('active'), true);
  assert.equal(node('page-meeting').classList.contains('active'), false);
  assert.equal(node('nav-knowledge').classList.contains('active'), true);
  assert.equal(node('nav-meeting').classList.contains('active'), false);

  context.summarySwitch={};
  const gpHandler=bootstrap.split(/\r?\n/).find(line=>line.startsWith("el('summary-show-gp').onclick="));
  assert.ok(gpHandler);
  vm.runInNewContext(gpHandler,context);
  node('summary-show-gp').onclick();
  assert.equal(node('page-gp-workspace').classList.contains('active'), true);
  assert.equal(node('page-knowledge').classList.contains('active'), false);
  assert.equal(context.document.getElementById('nav-gp-workspace'),null);
  assert.equal(node('nav-entity-workspace').classList.contains('active'),true);
  assert.equal(node('nav-knowledge').classList.contains('active'), false);

  context.showPage('meeting');
  assert.equal(node('page-gp-workspace').classList.contains('active'), false);
  assert.equal(node('page-knowledge').classList.contains('active'), false);
  assert.equal(node('page-meeting').classList.contains('active'), true);
  assert.equal(node('nav-knowledge').classList.contains('active'), false);
  assert.equal(node('nav-meeting').classList.contains('active'), true);

  context.showPage('knowledge');
  assert.equal(node('page-knowledge').classList.contains('active'), true);
  assert.equal(node('page-meeting').classList.contains('active'), false);

  context.showPage('activity-analytics');
  assert.equal(node('page-activity-analytics').classList.contains('active'), true);
  assert.equal(node('page-knowledge').classList.contains('active'), false);
  assert.equal(node('nav-activity-analytics').classList.contains('active'), true);

  context.showPage('entity-workspace');
  assert.equal(node('page-entity-workspace').classList.contains('active'), true);
  assert.equal(node('page-activity-analytics').classList.contains('active'), false);
  assert.equal(node('nav-entity-workspace').classList.contains('active'), true);

  for(const legacy of ['relationship-explorer','pitchbook','pitchbook-past']){
    context.showPage(legacy);
    assert.equal(node('page-meeting-past').classList.contains('active'),true);
    assert.equal(node('nav-meeting-past').classList.contains('active'),true);
    assert.equal(node('page-relationship-explorer').classList.contains('active'),false);
    assert.equal(node('page-pitchbook-past').classList.contains('active'),false);
    assert.equal(node('nav-relationship-explorer').classList.contains('active'),false);
  }
});
