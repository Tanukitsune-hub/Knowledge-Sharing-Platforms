# Work 0020 CODEX-13 — Resumable Gemini query lifecycle and final qualification

WORK_ID: `0020`
DISPATCH_ID: `0020-CODEX-13`
MODE: `INVESTIGATION -> BUILD / QUALIFICATION`
BALL: `CODEX`
STATUS: `READY`
ROUTE: `C`

## Primary Outcome

Close the remaining Work 0020 blocker by making Gemini background Interaction search genuinely asynchronous across short Web App calls, then prove one grounded synthetic Pitchbook query with an authoritative citation and complete the already-defined metadata/lifecycle/final-integrity gates.

Preserve all accepted CODEX-03 through CODEX-12 evidence. Do not reopen Meeting reconciliation, Meeting query, FULL_OUTPUT, provider-neutral routing, sourceType sync, or direct-Blob upload without material contradictory evidence.

## Acceptance Evidence and Hierarchy

Strongest first:

1. Target-runtime synthetic Pitchbook query reaches a documented terminal Gemini Interaction state through a resumable cross-request flow, without Apps Script maximum-execution timeout.
2. A terminal `completed` query produces at least one authoritative Pitchbook citation and exactly one terminal `AI_QUERY` Audit outcome.
3. Exact metadata filter and update / Inactive / Reactivate / delete-rebuild lifecycle gates pass with no duplicate provider document.
4. Final Backend/provider/Audit/settings/trigger/deployment integrity passes.
5. Deterministic focused tests and canonical repository checks pass.

A browser loading indicator, one Apps Script invocation timeout, or a local polling deadline is weaker evidence than the provider Interaction terminal state and authoritative Audit.

## Closed Evidence

- schema `6`, exactly five Backend sheets;
- FULL_OUTPUT runtime/canonical parity PASS and must not be rerun;
- OpenAI deliberately disabled and uncalled; no automatic failover;
- one isolated Gemini Store;
- CODEX-11 Gemini Document reconciliation PASS for the two affected Meetings, with no uncertain-row upload/delete;
- one Meeting grounded query PASS with authoritative Audit and three citations;
- one synthetic TXT Pitchbook is already Gemini Indexed with provider document identity/content hash;
- CODEX-12 proved the original synchronous query hit Apps Script max execution at `360.804s`;
- CODEX-12 background repair set `background=true`, but still polled inside the same Apps Script invocation for `24 * 5s` and then locally raised `AI_QUERY_TIMEOUT` after the Interaction remained non-completed;
- CODEX-12 final Web App execution completed safely at `134.96s`, Audit recorded `AI_QUERY_TIMEOUT`, zero citations, and no lifecycle mutation followed;
- final CODEX-12 commit: `6373ec1bb70f341eb6878ede51b17eb0cfc4286a`;
- GitHub-hosted CI did not run for that commit.

## Current Official Provider Contract

Treat the current Gemini Interactions API as authoritative for this dispatch:

- `background=true` is specifically intended to return an Interaction ID immediately so the client can poll/reconnect later instead of keeping one HTTP request open;
- documented statuses include `in_progress`, `requires_action`, `completed`, `failed`, `cancelled`, and `incomplete`;
- `incomplete` is terminal and must not be treated as `in_progress`;
- `interactions.get(id)` is the provider-supported retrieval path for background work.

## One Active Hypothesis

> CODEX-12 converted the request to a background Interaction but did not convert the application lifecycle to asynchronous/resumable. It still holds one Apps Script/Web App invocation while polling, declares a local timeout after about 120 seconds, and loses resumability. In addition, the documented terminal status `incomplete` is not classified as terminal. The remaining Pitchbook blocker is therefore an incomplete background-Interaction state machine in the application, not evidence that Gemini File Search or the Indexed Pitchbook itself failed.

### Confirming observations

Before production changes, reproduce deterministically that the current CODEX-12 baseline:

1. receives `in_progress` with an Interaction ID;
2. polls within the same function until the 24-poll deadline;
3. returns `AI_QUERY_TIMEOUT` and exposes no resume path for that Interaction;
4. treats documented `incomplete` as nonterminal and eventually times out rather than classifying it.

### Falsifying observation

If current production code already has a secure cross-request resume path and correctly terminalizes `incomplete`, do not implement this hypothesis. Return for Strategy Reset.

## Fastest Safe Decisive Action

Reproduce the two lifecycle gaps above deterministically. If they reproduce, implement one coherent minimal repair: start the Gemini background Interaction in one short server call, return a safe opaque pending token, and poll that same Interaction through subsequent short Web App calls until provider terminal state. Do not extend the single Apps Script invocation toward the six-minute ceiling.

## Required Scope

Expected source scope only as needed:

- `src/161_GeminiRestClient.gs` — separate start/get/terminal classification; retain transport redaction and Api-Revision contract;
- `src/164_AiProviderCore.gs` — resumable provider search lifecycle and one terminal Audit outcome;
- `src/170_AiEntryPoints.gs` — reuse the existing `searchKnowledge` public facade for START/POLL if practical; avoid a new public function;
- `src/ClientKnowledgeSearch.html` — client-side bounded polling of the same safe token;
- `src/160_AiEnvironment.gs` and/or a narrow private helper only if server-side pending-state persistence is required;
- `src/130_AiConstants.gs` only for bounded poll/expiry constants;
- directly relevant tests.

Do not refactor unrelated search/export/admin/provider code.

## Required Behavior

### Background Interaction lifecycle

1. START creates exactly one Gemini Interaction with `background=true` and immediately returns from the Apps Script call when provider status is nonterminal.
2. The browser receives only a safe opaque query token, never an API key, Store ID, provider document ID, raw provider payload, or other user's pending state.
3. The provider Interaction ID and normalized request context remain server-side and are bound to the opaque token with an expiry/cleanup rule.
4. POLL uses a later short Apps Script call to GET the same Interaction exactly once per poll cycle; it does not create another Interaction.
5. `in_progress` returns `pending` without failure Audit.
6. `completed` uses the existing parsing/citation mapping and writes exactly one terminal Success Audit row.
7. `failed`, `cancelled`, `requires_action`, and `incomplete` are terminal and must be classified safely. They must not fall through to a local timeout loop. Raw provider text remains redacted.
8. A browser/user polling window may be bounded, but reaching that UI observation bound must not falsely mark the provider Interaction as failed or discard resumability. Preserve a safe pending token until its server-side expiry.
9. Terminal or expired state cleans up the pending server-side record. Duplicate browser polls after terminal completion must not create duplicate terminal Audit rows or duplicate queries.

### Security / public surface

- Prefer the existing `searchKnowledge` public facade with an explicit safe START/POLL contract so the approved public surface remains `30`.
- Poll tokens must be unguessable and server-validated. Bind them to the initiating safe actor/session context as strongly as the existing Web App identity model permits.
- Never trust a client-supplied raw provider Interaction ID as authorization to fetch an Interaction.
- No debug/public endpoint.

## Deterministic Validation

Before delivery, tests must include at minimum:

- current-baseline regression: in-progress beyond 24 polls loses resumability / becomes local timeout;
- current-baseline regression: `incomplete` is not terminalized;
- START returns pending quickly from one provider POST and does not sleep/poll in the same server call;
- POLL `in_progress` performs one GET and returns pending;
- POLL `completed` returns answer/citations through existing mapping;
- terminal `failed`, `cancelled`, `requires_action`, `incomplete` classifications are safe and bounded;
- pending token is opaque, server-validated, expiry-aware, and cannot be used to access another pending query;
- terminal Audit is written once only; pending polls write no failure Audit;
- duplicate terminal poll is idempotent;
- disabled OpenAI remains untouched and no provider failover appears;
- public facade count does not increase if the existing facade strategy is used;
- focused tests PASS;
- `npm run check` PASS;
- temporal validation PASS;
- public-surface validation PASS;
- `git diff --check` PASS.

## Delivery Budget

Only if all deterministic gates pass:

- synchronize/read back the exact tested source once;
- create at most one immutable Apps Script version;
- update the same positively identified private Web App in place once;
- no second Web App, Store, Library, permission widening, trigger, or public endpoint.

Do not merge/rebase current `main` during this bounded runtime repair. Integrate current main only after the Work 0020 runtime blocker closes and before final PR merge.

## Target-Runtime Qualification

After delivery:

1. Confirm version/deployment identity and safe settings.
2. Submit exactly one new synthetic Pitchbook query START through the normal private Web App.
3. Confirm START returns quickly as `pending` with a safe token if provider is not immediately terminal.
4. Poll the same token through separate Web App calls; do not submit another query.
5. Observe up to a bounded 10-minute qualification window for the same Interaction. Polling GETs are allowed; a second Interaction creation is not.
6. If provider reaches `completed`, require at least one authoritative Pitchbook citation and one terminal Success Audit row.
7. If provider reaches another documented terminal state, record the safe status and STOP for Strategy Reset; do not invent another transport hypothesis.
8. If the Interaction is still `in_progress` at the qualification observation bound, preserve resumability and return `BLOCKED / PROVIDER_LONG_RUNNING`; do not convert it to `AI_QUERY_TIMEOUT` or create a second query.

### Remaining lifecycle after query PASS

Only after the Pitchbook query gate passes:

- exact metadata filter;
- update -> reindex without duplicate;
- Inactive -> provider removal/exclusion;
- Reactivate -> restoration;
- exact derived-document delete/rebuild;
- restore intended synthetic Active lifecycle;
- final five-sheet/schema/provider/Audit/settings/trigger/deployment integrity.

Before every provider-mutating lifecycle SYNC:

```text
AI_SYNC_BATCH_SIZE = numeric 1
-> authoritative readback = numeric 1
-> execute exactly one bounded mutation
-> restore numeric 10 afterward
```

## Non-Goals / Prohibited

- no OpenAI live call;
- no FULL_OUTPUT rerun;
- no broad sync or confidential data;
- no new Gemini Store;
- no second Web App or Library mutation;
- no raw Interaction ID as a client authorization token;
- no extending one Apps Script call toward the max-execution ceiling as the primary fix;
- no repeated new Pitchbook queries;
- no current-main integration during the bounded runtime repair;
- no unrelated refactor.

## Strategy Reset / Stop Rules

Stop and return to ChatGPT if:

- the deterministic baseline gaps do not reproduce;
- the provider returns a documented terminal non-completed status in the single live query;
- a security/public-surface constraint cannot be met without architecture expansion;
- one delivered repair plus one live query start fails for a materially different reason;
- the same Interaction remains `in_progress` after the bounded qualification observation window.

Do not open a second hypothesis inside this dispatch.

## Completion Latch

Target Work classification after all remaining gates:

```text
LOGIC_VALIDATION: PASS
SCHEMA_ALIGNMENT: PASS
OPENAI_RUNTIME: SAFE_DISABLED_ERROR — deliberately deferred
GEMINI_DOCUMENT_RECONCILIATION: PASS
GEMINI_RUNTIME: PASS
FULL_OUTPUT_RUNTIME: PASS
FINAL_INTEGRITY: PASS
READY: YES
BLOCKER: NO
```

## Required Report and Final Chat Contract

Create:
`docs/handoffs/0020-CODEX-13-resumable-gemini-query-lifecycle-and-final-qualification-report.md`

Update:
- `docs/handoffs/0020-report.md`
- `docs/handoffs/0020-instruction.md`
- `docs/handoffs/0020-dispatches.md`
- PR `#26`

Commit and push scoped changes.

Report at minimum:

- `GEMINI_BACKGROUND_LIFECYCLE`
- `PITCHBOOK_QUERY_OUTCOME`
- `PITCHBOOK_PROVIDER_TERMINAL_STATUS`
- `PITCHBOOK_AUTHORITATIVE_CITATIONS`
- `LOGIC_VALIDATION`
- `GEMINI_DOCUMENT_RECONCILIATION`
- `GEMINI_RUNTIME`
- `FULL_OUTPUT_RUNTIME`
- `FINAL_INTEGRITY`
- `READY`
- `BLOCKER`
- `FINAL_COMMIT`
- `GITHUB_CI_ACTUALLY_RAN`

The Codex final chat response MUST begin before any other text with:

```text
WORK_ID: 0020
DISPATCH_ID: 0020-CODEX-13
BALL: CHATGPT
STATUS: RETURNED
```

Repeat the same four lines at the very end of the final chat response. If a native user action is genuinely required, use `BALL: USER` and `STATUS: ACTION_REQUIRED` instead. Missing either identity block is a reporting-contract failure.