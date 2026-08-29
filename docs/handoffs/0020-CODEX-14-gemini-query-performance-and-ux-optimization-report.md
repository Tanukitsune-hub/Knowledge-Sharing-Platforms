# Work 0020 CODEX-14 — Gemini query performance and UX optimization report

WORK_ID: `0020`
DISPATCH_ID: `0020-CODEX-14`
MODE: `BUILD / QUALIFICATION`
BRANCH: `agent/0020-ai-provider-core`

## Result

```text
GEMINI_MODEL: gemini-3.7-flash
GEMINI_REQUEST_PROFILE: PASS — background=true, thinking_level=low, max_output_tokens=2048
GEMINI_BACKGROUND_LIFECYCLE: PASS — short START, server-owned resumable state, one GET maximum per POLL, no START sleep/poll
GEMINI_USER_EXPERIENCE: PASS — immediate feedback, previous-result preservation, duplicate-submit guard, adaptive polling, reload resume, manual recheck, long-running non-error state
START_LATENCY_MS: 9115 — browser-observed return to pending state
POLL_CALL_MAX_LATENCY_MS: 9691 — browser-observed maximum during this qualification
PROVIDER_TOTAL_ELAPSED_MS: >=600000 — still nonterminal at the bounded observation limit
PROVIDER_USAGE_SAFE_METRICS: NOT AVAILABLE — no terminal provider response was observed; no question/source content or provider identifiers were stored
PITCHBOOK_QUERY_OUTCOME: PROVIDER_LONG_RUNNING
PITCHBOOK_PROVIDER_TERMINAL_STATUS: PENDING_AT_BOUND — no documented terminal status observed
PITCHBOOK_AUTHORITATIVE_CITATIONS: NOT RUN — blocked by the nonterminal Interaction
DUPLICATE_INTERACTION_CREATION: PASS — exactly one START; reload and manual recheck used the same opaque token
PAGE_RELOAD_RESUME: PASS — the same pending job resumed through POLL after one reload and Knowledge Search re-display
START_SERVER_SLEEP_OR_POLL: PASS — 0 in the normal query START path
POLL_PROVIDER_GETS_PER_CALL: PASS — <=1 by deterministic contract tests
UI_FALSE_TIMEOUT_WHILE_PROVIDER_PENDING: PASS — no AI_QUERY_TIMEOUT; long-running state remained non-error
LOGIC_VALIDATION: PASS — 301/301; temporal validation PASS; public-surface validation PASS; public facade 30; git diff --check PASS
GEMINI_DOCUMENT_RECONCILIATION: PASS — accepted CODEX-11 evidence preserved
GEMINI_RUNTIME: BLOCKED / PROVIDER_LONG_RUNNING
FULL_OUTPUT_RUNTIME: PASS — accepted prior evidence preserved; not rerun
SCHEMA_ALIGNMENT: PASS — schema 6 and five Backend sheets preserved
FINAL_INTEGRITY: PASS — authoritative readback found no application-data, Audit, settings, trigger, Store, Library, or deployment side effect from the pending query
READY: NO
BLOCKER: YES — the single authorized Interaction remained provider-pending at the bounded observation limit
FINAL_COMMIT: 3935ab7
GITHUB_CI_ACTUALLY_RAN: NO — no workflow run or commit status was present for commit 3935ab7
```

## Implementation delivered

- Added the named Gemini request profile while retaining the pinned stable model and existing File Search tool/filter contract.
- Split normal query execution into one background START and separate short POLL calls; pending states do not create failure Audit rows.
- Added server-side opaque resumable job state, actor binding, expiry, identical-pending deduplication, terminal-result/Audit idempotency, and safe numeric telemetry.
- Added handling for `queued`, `in_progress`, `completed`, `requires_action`, `failed`, `cancelled`, `incomplete`, `budget_exceeded`, and unknown statuses.
- Added responsive browser behavior: immediate feedback, previous-result preservation, duplicate-submit prevention, adaptive polling, sessionStorage token resume, long-running messaging, and manual recheck.

## Deterministic evidence

The exact tested source passed the focused AI transport/provider/UI suite (`72/72`) and the repository check (`301/301`). Temporal validation, public-surface validation, and diff hygiene passed; the public facade remained `30`. A pre-change probe reproduced the missing request profile, same-call sleep/poll timeout, incomplete status handling, and missing browser resumability/deduplication.

## Delivery evidence

- Exact source synchronization and remote readback: `78/78` files matched.
- One immutable Apps Script version was created: version `53`.
- The positively identified existing private Web App was updated in place to version `53`; its Web App type, deploying-user execution, `Only myself` access, and deployment inventory remained unchanged.
- Target settings readback confirmed `DEV`, `Asia/Tokyo`, `AI_SYNC_ENABLED=false`, `AI_SYNC_BATCH_SIZE=10`, `GEMINI_ENABLED=true`, and the pinned `gemini-3.7-flash` model. OpenAI remained disabled and uncalled.

## Target-runtime evidence

One new narrow synthetic Pitchbook query was submitted. The browser returned promptly to a pending state, displayed non-error progress, and never issued a second START. One page reload followed by reopening Knowledge Search resumed the same opaque-token job through POLL. Automatic polling stopped at its bounded UI window; one authorized manual recheck continued the same job. The job remained pending through the handoff's ten-minute observation bound, so no grounded citation or dependent lifecycle mutation was attempted.

The current pending query produced no terminal AI_QUERY Audit row. Read-only integrity checks confirmed the five Backend sheets, schema 6, source rows/files, Audit state, settings/counters, Script Properties, triggers (`0`), Store count, and deployment boundary remained unchanged. No OpenAI call, FULL_OUTPUT rerun, lifecycle mutation, new Store, new deployment, Library mutation, or raw provider identifier exposure occurred.

## Completion classification

This dispatch stops under the explicit handoff rule for a provider-pending Interaction:

```text
GEMINI_RUNTIME: BLOCKED / PROVIDER_LONG_RUNNING
READY: NO
BLOCKER: YES
```

The opaque query token remains resumable. It must not be converted to `AI_QUERY_TIMEOUT`, and no second query was created. Grounded Pitchbook citation, metadata filtering, provider lifecycle, and final Work completion gates remain not run because they depend on a terminal successful query.

No source or deployment retry is authorized within CODEX-14.
