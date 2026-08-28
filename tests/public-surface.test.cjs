const test = require('node:test');
const assert = require('node:assert/strict');
const {
  PUBLIC_FACADE_ALLOWLIST,
  collectTopLevelFunctionDeclarations,
  validatePublicSurface
} = require('../scripts/public-surface.cjs');

test('top-level function inventory ignores comments, strings, and nested declarations', () => {
  const source = `
    // function fakeComment() {}
    const text = "function fakeString() {}";
    /* function fakeBlock() {} */
    const apostrophePattern = /'/g;
    function publicEntry() {}
    const object = { value: 'function fakeObjectText() {}' };
    function outer() { function nested() {} }
    function privateEntry_() {}
  `;
  assert.deepEqual(
    collectTopLevelFunctionDeclarations(source).map((item) => item.name),
    ['publicEntry', 'outer', 'privateEntry_']
  );
});

test('repository exposes only the canonical normal-user facade', () => {
  const result = validatePublicSurface();
  assert.equal(PUBLIC_FACADE_ALLOWLIST.length, 27);
  assert.deepEqual(
    result.publicDeclarations.map((item) => item.name).sort(),
    [...PUBLIC_FACADE_ALLOWLIST].sort()
  );
  assert.ok(result.privateDeclarations.some((item) => item.name === 'kspWriteKnowledgeExportDocument_'));
  assert.ok(result.privateDeclarations.some((item) => item.name === 'kspTrashKnowledgeExportFile_'));
  assert.ok(result.privateDeclarations.some((item) => item.name === 'runAiSyncWorker_'));
});
