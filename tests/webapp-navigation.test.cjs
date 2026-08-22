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

test('Knowledge Search navigation is an integrated same-document showPage page', () => {
  assert.match(index, /<button id="nav-knowledge"[^>]*type="button">ナレッジ検索<\/button>/);
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

test('showPage switches Knowledge Search and Meeting without changing the document', () => {
  const script = clientCore.match(/<script>([\s\S]*?)<\/script>/);
  assert.ok(script);
  const nodes = new Map();
  function node(id) {
    if (!nodes.has(id)) {
      const state = { active: false };
      nodes.set(id, {
        id,
        value: '',
        disabled: false,
        textContent: '',
        classList: {
          toggle(name, enabled) {
            if (name === 'active') state.active = Boolean(enabled);
          },
          contains(name) {
            return name === 'active' && state.active;
          }
        },
        addEventListener() {},
        _state: state
      });
    }
    return nodes.get(id);
  }
  const context = {
    document: { getElementById: node },
    localStorage: { getItem() { return null; }, setItem() {}, removeItem() {} }
  };
  vm.runInNewContext(script[1], context, { filename: 'ClientCore.js' });

  context.showPage('knowledge');
  assert.equal(node('page-knowledge').classList.contains('active'), true);
  assert.equal(node('page-meeting').classList.contains('active'), false);
  assert.equal(node('nav-knowledge').classList.contains('active'), true);
  assert.equal(node('nav-meeting').classList.contains('active'), false);

  context.showPage('meeting');
  assert.equal(node('page-knowledge').classList.contains('active'), false);
  assert.equal(node('page-meeting').classList.contains('active'), true);
  assert.equal(node('nav-knowledge').classList.contains('active'), false);
  assert.equal(node('nav-meeting').classList.contains('active'), true);

  context.showPage('knowledge');
  assert.equal(node('page-knowledge').classList.contains('active'), true);
  assert.equal(node('page-meeting').classList.contains('active'), false);
});
