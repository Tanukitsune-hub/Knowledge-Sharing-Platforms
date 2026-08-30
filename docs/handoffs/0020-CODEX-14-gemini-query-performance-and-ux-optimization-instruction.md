# Work 0020 CODEX-14 — Gemini query performance and UX optimization

WORK_ID: `0020`
DISPATCH_ID: `0020-CODEX-14`
MODE: `BUILD / QUALIFICATION`
BALL: `CODEX`
STATUS: `READY`
ROUTE: `C`

## Supersession

`0020-CODEX-13` was committed but not executed. It is superseded by this dispatch because the user explicitly expanded the required usable outcome from a narrow resume-path repair to a coherent latency and user-experience optimization before implementation began.

Keep Work ID `0020`: the outcome remains the same Knowledge Search core and PR. Do not reuse or execute CODEX-13.

## Primary Outcome

Deliver and qualify a responsive, resumable Gemini Knowledge Search experience using the latest stable Flash model and the existing File Search architecture.

The user-visible result must not behave like one frozen multi-minute Apps Script request. It must:

- use stable `gemini-3.7-flash`;
- explicitly optimize generation for grounded retrieval latency;
- start one provider Interaction quickly;
- continue through short resumable polls;
- survive page reload without creating a duplicate query;
- distinguish provider pending from provider failure;
- complete with authoritative citations;
- preserve all existing source, provider, security, lifecycle, and Audit contracts.

Authoritative design decision:
`docs/decisions/gemini-search-latency-and-ux-architecture.md`

## User Decision

- The current latest stable Flash model is sufficient; do not solve latency by switching to a different or weaker model.
- Optimize the surrounding request, File Search use, application lifecycle, and browser UX as one coherent design.
- Preserve the current major architecture and working capabilities; do not rebuild the product unnecessarily.

## Accepted Evidence — Closed

Preserve CODEX-03 through CODEX-12 evidence unless material contradictory evidence appears:

- schema `6`; exactly five Backend sheets;
- FULL_OUTPUT runtime/canonical parity PASS; do not rerun;
- OpenAI disabled and uncalled; no automatic failover;
- one isolated Gemini File Search Store;
- `models/gemini-embedding-2` Store contract;
- direct Blob upload and exact provider-document reconciliation accepted;
- both affected Meetings reconciled without uncertain-row upload/delete;
- one Meeting grounded query succeeded with three authoritative citations;
- one synthetic TXT Pitchbook is already Gemini Indexed with provider identity/content hash;
- authenticated private Web App/admin sync route accepted;
- CODEX-12 exact source delivery/readback `78/78`, immutable version `51`, same private Web App, deployment inventory `9`;
- original synchronous Pitchbook query reached Apps Script max execution at `360.804s`;
- CODEX-12 background request remained in one Apps Script call and locally returned `AI_QUERY_TIMEOUT` after `134.96s`; no provider terminal failure was established;
- focused `43/43` and repository `294/294` PASS are local/repository evidence, not GitHub-hosted CI;
- no lifecycle mutation, OpenAI call, broad sync, new Store/deployment/Library, or confidential data followed.

## Current Official Provider Contract

Use current official Gemini API behavior as of 2026-08-29:

- latest stable Flash: `gemini-3.7-flash`;
- Interactions API is the recommended standard primitive and current File Search examples use it;
- `generation_config.thinking_level` controls latency/intelligence trade-off;
- `generation_config.max_output_tokens` bounds response generation;
- background Interactions are retrieved later rather than requiring one open request;
- pending statuses include `queued` and `in_progress`;
- successful terminal status is `completed`;
- terminal non-success statuses include `requires_action`, `failed`, `cancelled`, `incomplete`, and `budget_exceeded`;
- completed Interaction `usage` may expose safe numeric input/output/thought/tool-use/cached-token counts.

Official references are recorded in the design decision. Do not replace this current contract with stale examples.

## Active Hypothesis

> The current poor user experience is primarily caused by an unoptimized application request/lifecycle, not by use of Gemini 3.7 Flash itself. The request omits an explicit low-latency thinking level and output cap; CODEX-12 still waits and sleeps inside one Apps Script call; the browser cannot securely resume after reload; duplicate start protection is incomplete; and terminal/provider timing evidence is not retained. A single optimized request profile plus secure cross-request START/POLL job lifecycle should materially improve both actual and perceived latency without changing the model or File Search architecture.

### Required baseline proof

Before production changes, reproduce deterministically from current source that:

1. Gemini request creation does not include `generation_config.thinking_level`;
2. it does not include `generation_config.max_output_tokens`;
3. `kspGeminiQueryInteractionLive_()` sleeps/polls in one Apps Script execution and locally throws `AI_QUERY_TIMEOUT` after its internal limit;
4. the browser waits on one long `searchKnowledge` call and has no resumable query token;
5. `queued` and `budget_exceeded` are not handled by a complete state machine;
6. page reload and duplicate START cannot be proven to preserve one provider Interaction.

If these baseline observations do not reproduce, stop without implementing a different hypothesis.

## Fastest Safe Decisive Action

Implement one coherent optimized query lifecycle, not a series of unrelated patches:

```text
browser immediate feedback
-> short START call
-> one background Gemini Interaction
-> opaque server-owned query token
-> adaptive browser polling through short POLL calls
-> same Interaction until terminal
-> one answer/citation mapping
-> one terminal Audit outcome
```

Do not use a longer single Apps Script execution as the solution.

## Required Request Profile

For the normal Gemini Knowledge Search route, the exact provider request must include:

```json
{
  "model": "gemini-3.7-flash",
  "background": true,
  "generation_config": {
    "thinking_level": "low",
    "max_output_tokens": 2048
  }
}
```

Also preserve:

- existing File Search tool;
- exact File Search Store identity;
- existing metadata filter semantics;
- existing grounded Japanese prompt contract;
- existing citation parsing/mapping;
- current API revision header required by the implemented Interactions contract.

Use a named private constant/request-profile version rather than scattering literals. Do not add normal-user controls for model/thinking/output settings in this Work.

Before the live query, authoritatively confirm the target runtime model setting is exactly `gemini-3.7-flash`. If it is not, use the existing administrator setting path to set/read back that stable model only; do not introduce a new model selector flow.

## Required Cross-Request Lifecycle

Prefer reusing the existing public `searchKnowledge` facade with an explicit safe action such as START/POLL so the public facade count remains `30`.

### START

- validate/normalize the request once;
- compute a request fingerprint from provider, model, request-profile version, mode, normalized filters, and a hash of the question—not the raw question stored in job state;
- if the same authorized actor already has a non-expired identical pending job, return the existing opaque token without creating a second Interaction;
- otherwise POST exactly one background Interaction;
- if immediately terminal, finalize normally;
- if `queued` or `in_progress`, persist minimal server-side state and return `pending` immediately;
- do not call `Utilities.sleep`, do not poll, and do not write a failure Audit for pending.

### Server-side job state

Retain only what is needed to resume and finalize safely:

- opaque token key/hash;
- raw provider Interaction ID server-side only;
- actor/session binding available in the current identity model;
- request fingerprint and question hash;
- mode and stable filter IDs/dates required for final mapping/Audit;
- model/request-profile version;
- created/expiry timestamps;
- poll count and safe timing aggregates;
- terminal/Audit-written marker.

Do not store the API key, raw source content, raw provider payload, or raw question text in client storage. Do not return raw Interaction ID, Store ID, provider document ID, or provider payload to the browser.

Use a bounded expiry/cleanup policy suitable for page reload and manual resume. A 60-minute server-side job lifetime and a shorter terminal-idempotency window are reasonable defaults unless existing repository constraints require a safer equivalent.

### POLL

Each POLL call:

- validates opaque token, expiry, actor binding, and stored state;
- performs at most one provider GET for the same Interaction;
- never creates another Interaction;
- returns `pending` for `queued` or `in_progress`;
- finalizes `completed` through the existing answer/citation path;
- safely terminalizes `requires_action`, `failed`, `cancelled`, `incomplete`, and `budget_exceeded`;
- fails closed on unknown status;
- writes no pending failure Audit;
- writes exactly one terminal Audit outcome per Interaction;
- remains idempotent on duplicate terminal polls.

A browser auto-poll observation limit must not become `AI_QUERY_TIMEOUT` while the provider remains pending. Preserve the token and return a non-error long-running state.

## Required Browser UX

Update the Knowledge Search client as the smallest coherent responsive job UI:

- show immediate local feedback before the START server response;
- preserve the previous completed answer/citations while a new query runs;
- prevent double-click/duplicate START;
- after START pending, release the long blocking request state and show elapsed time;
- poll adaptively: short initial intervals, then back off to a maximum interval; do not hammer Apps Script;
- show useful non-error progress copy, for example:
  - initial: `資料を検索しています…`;
  - extended: `関連資料を確認し、回答を作成しています…`;
  - long-running: `処理は継続中です。画面を再読み込みしても再開できます。`;
- store only the opaque token and non-sensitive display state in `sessionStorage`;
- resume the same job after page reload without creating another Interaction;
- stop automatic polling after a bounded UI observation window but keep a manual `結果を再確認` action while the server job is valid;
- clear pending state on terminal completion, safe terminal failure, or expiry;
- do not expose raw provider identifiers or private telemetry in the normal UI.

No browser-direct Gemini request and no client-side API key.

## Safe Performance Telemetry

Record enough safe terminal telemetry to distinguish application overhead from provider thinking/tool use without adding a new sheet.

Prefer a compact redacted JSON object in the existing Restricted Audit metadata field, containing only:

- request-profile version;
- thinking level;
- max output tokens;
- provider terminal status;
- START latency;
- poll count;
- maximum individual POLL latency;
- provider elapsed time when timestamps are available;
- total input/output/thought/tool-use/cached tokens when returned;
- already-permitted stable filter scope.

Do not record raw question text, source text, raw provider response, API key, raw Interaction ID, Store ID, or provider document ID.

Return or log the same safe numeric metrics for qualification reporting as needed, but do not surface them to normal users.

## Retrieval / Indexing Boundaries

Do not change or requalify these without new material evidence:

- one File Search Store;
- existing `models/gemini-embedding-2` configuration;
- current metadata keys/filter semantics;
- accepted synthetic Pitchbook indexing;
- default chunking;
- Meeting/Pitchbook in the same Store.

Do not split Stores, reindex accepted documents, alter chunking, add precomputed summaries, add another retrieval service, move to legacy Generate Content, enable Priority inference, or create another model route in this dispatch.

Reason: the failing case is one already-indexed small TXT Pitchbook under a narrow source-type filter. There is no current evidence that Store size, file size, source-type name, chunking, or period caused the timeout.

## Expected Source Scope

Only as needed:

- `src/130_AiConstants.gs` — named request-profile/job/poll constants;
- `src/132_AiKnowledgeContracts.gs` and/or `src/182_FeatureFreezeKnowledge.gs` — exact request profile and prompt contract without duplicate paths;
- `src/160_AiEnvironment.gs` — provider start/get and minimal server state adapters;
- `src/161_GeminiRestClient.gs` — separate one-call create/get/status normalization; remove same-call wait loop from the user path;
- `src/164_AiProviderCore.gs` — START/POLL orchestration, dedupe, mapping, terminal Audit idempotency, safe metrics;
- `src/170_AiEntryPoints.gs` — reuse existing facade contract;
- `src/ClientKnowledgeSearch.html` — responsive polling/resume UX;
- directly relevant tests.

Avoid unrelated refactors. Resolve duplicate/legacy request-builder paths only to the minimum extent required to guarantee one canonical Gemini request profile.

## Deterministic Validation

Add direct tests proving at minimum:

### Request profile

- exact stable model remains `gemini-3.7-flash`;
- `background=true`;
- `generation_config.thinking_level=low`;
- `generation_config.max_output_tokens=2048`;
- File Search Store/tool and metadata filter remain exact;
- no extra provider route/failover.

### Lifecycle

- START performs one POST, no sleep, no GET, and returns pending quickly for `queued`/`in_progress`;
- identical pending START for the same authorized actor/fingerprint reuses one job and does not POST again;
- different actor/token cannot access the job;
- POLL performs at most one GET and no sleep;
- pending statuses write no terminal/failure Audit;
- completed returns existing answer/citations and writes exactly one Success Audit;
- `requires_action`, `failed`, `cancelled`, `incomplete`, and `budget_exceeded` terminate safely;
- unknown status fails closed;
- duplicate terminal poll is idempotent;
- expired token fails safely and cleans state;
- raw provider identifiers never appear in browser response.

### UX

- duplicate submit cannot create a second START;
- sessionStorage stores only the opaque token/non-sensitive state;
- reload resumes via POLL rather than START;
- pending beyond the automatic UI observation window remains resumable and is not rendered as provider failure;
- prior result remains visible while a new query is pending;
- manual result check resumes the same token.

### Repository gates

- focused tests PASS;
- `npm run check` PASS;
- temporal validation PASS;
- public-surface validation PASS and public facade remains `30` unless an unavoidable exact reason is documented and returned for review;
- `git diff --check` PASS.

## Delivery Budget

Only after deterministic gates PASS:

- synchronize/read back the exact tested application source once;
- create at most one immutable Apps Script version;
- update the same positively identified private Web App in place once;
- no second Web App, Store, Library, trigger, permission widening, or public/debug endpoint.

Do not merge/rebase current `main` during this bounded runtime implementation. Integrate latest main only after the runtime blocker closes and before final Work merge.

## Target-Runtime Qualification

Use the existing isolated synthetic data and the already-Indexed synthetic TXT Pitchbook.

1. Confirm exact deployment identity and safe settings.
2. Confirm `GEMINI_DEFAULT_MODEL=gemini-3.7-flash` by authoritative readback.
3. Submit exactly one new narrow Pitchbook START through the normal private Web App.
4. Record actual browser-immediate feedback and START call latency.
5. If pending, confirm the browser receives only an opaque token and the server retains the provider ID.
6. Reload the page once during pending state and prove the same query resumes without a second Interaction creation.
7. Poll the same token through separate short calls; record each call duration and verify one GET maximum per call.
8. Observe the same Interaction for up to 10 minutes automatically/manual as defined by the UI. Do not create a second Interaction.
9. If `completed`, require:
   - at least one authoritative Pitchbook citation;
   - exactly one terminal Success `AI_QUERY` Audit;
   - safe latency/usage metrics with no content/provider identifiers;
   - no duplicate Interaction or terminal Audit.
10. If another documented terminal status occurs, record the safe class and STOP for Strategy Reset.
11. If still `queued`/`in_progress` at the observation bound, preserve resumability and return `BLOCKED / PROVIDER_LONG_RUNNING`, not `AI_QUERY_TIMEOUT`.

Application responsiveness is a separate gate from provider total duration:

```text
START_SERVER_SLEEP_OR_POLL: 0
POLL_PROVIDER_GETS_PER_CALL: <= 1
UI_FALSE_TIMEOUT_WHILE_PROVIDER_PENDING: NO
PAGE_RELOAD_RESUME: PASS
DUPLICATE_INTERACTION_CREATION: 0
```

Report actual timings; do not invent a PASS for an unobserved latency threshold.

## Remaining Lifecycle After Pitchbook Query PASS

Only after the grounded Pitchbook query passes:

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
-> authoritative numeric 1 readback
-> execute one bounded mutation
-> restore numeric 10 afterward
```

## Prohibited / Non-Goals

- no model downgrade or alternate model route;
- no `gemini-flash-latest` alias in place of the pinned stable ID;
- no OpenAI live call;
- no FULL_OUTPUT rerun;
- no broad sync or confidential data;
- no Store split/new Store;
- no reindex/chunking experiment;
- no browser API key or direct browser Gemini call;
- no second Web App/Library/public debug endpoint;
- no paid Priority inference enablement;
- no repeated new Pitchbook query;
- no raw provider ID as client authorization token;
- no long same-call polling loop;
- no unrelated current-main integration.

## Stop / Strategy Reset

Stop and return to ChatGPT if:

- baseline observations do not reproduce;
- secure opaque resumability requires a material architecture expansion outside the stated scope;
- deterministic gates fail after one coherent repair attempt;
- the single live Interaction reaches a documented terminal non-success state;
- a materially different provider/application failure appears;
- the same Interaction remains pending after the bounded observation window.

Do not open a second competing hypothesis inside this dispatch.

## Completion Latch

Target Work classification:

```text
GEMINI_REQUEST_PROFILE: PASS
GEMINI_BACKGROUND_LIFECYCLE: PASS
GEMINI_USER_EXPERIENCE: PASS
PITCHBOOK_AUTHORITATIVE_CITATIONS: >= 1
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
`docs/handoffs/0020-CODEX-14-gemini-query-performance-and-ux-optimization-report.md`

Update:

- `docs/handoffs/0020-report.md`;
- `docs/handoffs/0020-instruction.md`;
- `docs/handoffs/0020-dispatches.md`;
- PR `#26`.

Commit and push scoped changes.

Report at minimum:

- `GEMINI_MODEL`
- `GEMINI_REQUEST_PROFILE`
- `GEMINI_BACKGROUND_LIFECYCLE`
- `GEMINI_USER_EXPERIENCE`
- `START_LATENCY_MS`
- `POLL_CALL_MAX_LATENCY_MS`
- `PROVIDER_TOTAL_ELAPSED_MS`
- `PROVIDER_USAGE_SAFE_METRICS`
- `PITCHBOOK_QUERY_OUTCOME`
- `PITCHBOOK_PROVIDER_TERMINAL_STATUS`
- `PITCHBOOK_AUTHORITATIVE_CITATIONS`
- `DUPLICATE_INTERACTION_CREATION`
- `PAGE_RELOAD_RESUME`
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
DISPATCH_ID: 0020-CODEX-14
BALL: CHATGPT
STATUS: RETURNED
```

Repeat the same four lines at the very end. If a genuine native user action is required, use `BALL: USER` and `STATUS: ACTION_REQUIRED`. Missing either identity block is a reporting-contract failure.