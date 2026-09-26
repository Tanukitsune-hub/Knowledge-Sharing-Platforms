const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const source = fs.readFileSync(path.join(__dirname, '..', 'src', 'ClientKnowledgeSearch.html'), 'utf8');
function productionFunction(name) {
  const start = source.search(new RegExp('(?:async )?function ' + name + '\\('));
  assert.notEqual(start, -1, name);
  const tail = source.slice(start);
  const next = tail.slice(1).search(/\n(?:async )?function /);
  return next < 0 ? tail : tail.slice(0, next + 1);
}
function deferred() {
  let resolve;
  const promise = new Promise(done => { resolve = done; });
  return { promise, resolve };
}
function runtime(names, overrides = {}) {
  const state = {
    queryRequestSequence: 0, pendingQueryToken: '', pendingQueryFingerprint: '',
    pendingQueryRoute: 'OPENAI', pendingQueryPollCount: 0, pendingQueryPolling: false,
    pendingQueryAutoStopped: false, pendingQueryStartedAt: 0, pendingQueryTimer: null
  };
  const current = { payload: null };
  const effects = { render: 0, status: [], clear: 0, poll: 0 };
  const context = vm.createContext({
    knowledgeState: state,
    kPayload: () => current.payload,
    kServerCall: () => { throw new Error('unexpected RPC'); },
    kSetBusy() {}, kPersistPendingQuery() {}, kShowPendingStatus() {},
    kScheduleKnowledgePoll() {}, kClearPendingQueryForTerminal() {},
    kRenderResult() { effects.render += 1; },
    kShowStatus(kind, message) { effects.status.push([kind, message]); },
    kClearPendingQuery() { effects.clear += 1; state.pendingQueryToken = ''; },
    kEl() { return { classList: { add() {} } }; },
    KSP_QUERY_AUTO_POLL_LIMIT: 12,
    ...overrides
  });
  new vm.Script(names.map(productionFunction).join('\n')).runInContext(context);
  return { state, current, effects, context, call: expression => vm.runInContext(expression, context) };
}
const payload = question => ({ route: 'OPENAI', mode: '自由質問', questionOrInstruction: question,
  filters: { sourceTypes: ['Meeting'], dateFrom: '2026-09-01' }, selectedEntityKeys: [],
  modelProfileId: 'model-1', thinkingProfileId: 'thinking-1' });

test('query fingerprint includes question identity without storing its raw text', () => {
  const run = runtime(['kKnowledgeQueryFingerprint']);
  run.current.payload = payload('質問 A');
  const a = run.call('kKnowledgeQueryFingerprint(kPayload())');
  run.current.payload = payload('質問 B');
  const b = run.call('kKnowledgeQueryFingerprint(kPayload())');
  assert.notEqual(a, b);
  assert.doesNotMatch(a, /質問 A/);
  assert.doesNotMatch(b, /質問 B/);
  run.current.payload = payload('質問 A');
  assert.equal(run.call('kKnowledgeQueryFingerprint(kPayload())'), a);
});

test('query fingerprint changes with the selected source scope', () => {
  const run = runtime(['kKnowledgeQueryFingerprint']);
  run.current.payload = payload('同じ質問');
  const meeting = run.call('kKnowledgeQueryFingerprint(kPayload())');
  run.current.payload = { ...payload('同じ質問'), filters: { sourceTypes: ['Meeting', 'News'], dateFrom: '2026-09-01' } };
  assert.notEqual(run.call('kKnowledgeQueryFingerprint(kPayload())'), meeting);
});

test('late start response cannot establish pending state after input identity changes', async () => {
  const response = deferred();
  const run = runtime(['kKnowledgeQueryFingerprint', 'kKnowledgeRequestIsCurrent', 'kStartKnowledgeQuery'],
    { kServerCall: () => response.promise });
  run.current.payload = payload('質問 A');
  run.state.queryRequestSequence = 1;
  const fingerprint = run.call('kKnowledgeQueryFingerprint(kPayload())');
  const request = run.context.kStartKnowledgeQuery(run.current.payload, 1, fingerprint);
  run.current.payload = payload('質問 B');
  run.state.queryRequestSequence = 2;
  response.resolve({ ok: true, pending: true, queryToken: 'old-token' });
  assert.equal((await request).stale, true);
  assert.equal(run.state.pendingQueryToken, '');
  assert.deepEqual(run.effects.status, []);
});

test('late poll response cannot restore old answer or success after pending invalidation', async () => {
  const response = deferred();
  const run = runtime(['kKnowledgeQueryFingerprint', 'kKnowledgeRequestIsCurrent', 'kPollKnowledgeQuery'],
    { kServerCall: () => response.promise });
  run.current.payload = payload('質問 A');
  run.state.queryRequestSequence = 1;
  run.state.pendingQueryToken = 'old-token';
  run.state.pendingQueryFingerprint = run.call('kKnowledgeQueryFingerprint(kPayload())');
  const poll = run.context.kPollKnowledgeQuery({ route: 'OPENAI' }, null);
  run.current.payload = payload('質問 B');
  run.state.queryRequestSequence = 2;
  run.state.pendingQueryToken = '';
  response.resolve({ ok: true, answer: 'old answer' });
  await poll;
  assert.equal(run.effects.render, 0);
  assert.deepEqual(run.effects.status, []);
});

test('pending resume accepts only the current payload fingerprint', () => {
  const effects = { polls: 0, status: [], clears: 0 };
  const run = runtime(['kKnowledgeQueryFingerprint', 'kResumePendingKnowledgeQuery'], {
    kPollKnowledgeQuery() { effects.polls += 1; },
    kClearPendingQuery() { effects.clears += 1; },
    kShowStatus(kind, message) { effects.status.push([kind, message]); }
  });
  run.current.payload = payload('質問 A');
  run.state.pendingQueryToken = 'pending-token';
  run.state.pendingQueryFingerprint = run.call('kKnowledgeQueryFingerprint(kPayload())');
  run.current.payload = payload('質問 B');
  run.call('kResumePendingKnowledgeQuery()');
  assert.equal(effects.clears, 1);
  assert.equal(effects.polls, 0);
  assert.match(effects.status[0][1], /再実行/);
  run.state.pendingQueryToken = 'current-token';
  run.state.pendingQueryFingerprint = run.call('kKnowledgeQueryFingerprint(kPayload())');
  run.call('kResumePendingKnowledgeQuery()');
  assert.equal(effects.polls, 1);
  assert.equal(run.state.queryRequestSequence, 1);
});
