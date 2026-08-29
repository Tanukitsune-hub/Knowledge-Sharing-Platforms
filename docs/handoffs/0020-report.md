# Work 0020 report

WORK_ID: `0020`
ACTIVE_DISPATCH_ID: `0020-CODEX-14`
BALL: `CHATGPT`
DISPATCH_STATUS: `RETURNED / BLOCKER`
WORK_READY: `NO`
BLOCKER: `YES`

## Current classification

```text
GEMINI_MODEL: gemini-3.7-flash — user-approved stable Flash
GEMINI_REQUEST_PROFILE: PASS — background=true, thinking_level=low, max_output_tokens=2048
GEMINI_BACKGROUND_LIFECYCLE: PASS — one short START, opaque server-side state, separate POLL, no START sleep/poll
GEMINI_USER_EXPERIENCE: PASS — immediate feedback, dedupe, adaptive polling, reload resume, manual recheck, non-error long-running state
PITCHBOOK_AUTHORITATIVE_CITATIONS: NOT RUN — provider remained pending
LOGIC_VALIDATION: PASS — CODEX-14 deterministic and repository gates
SCHEMA_ALIGNMENT: PASS
OPENAI_RUNTIME: SAFE_DISABLED_ERROR — deliberately deferred/disabled; uncalled
GEMINI_DOCUMENT_RECONCILIATION: PASS
GEMINI_RUNTIME: BLOCKED / PROVIDER_LONG_RUNNING
FULL_OUTPUT_RUNTIME: PASS — accepted prior evidence; not rerun
FINAL_INTEGRITY: PASS — no pending-query data/control-plane side effect
READY: NO
BLOCKER: YES
```

## CODEX-12 GitHub-verified result

GitHub source of truth confirms:

- branch `agent/0020-ai-provider-core`;
- CODEX-12 final commit `6373ec1bb70f341eb6878ede51b17eb0cfc4286a`;
- PR `#26` remains Draft / Open / unmerged;
- CODEX-12 delta is one commit touching the CODEX-12 report/tracking docs, Gemini query constants/environment/client transport/provider core, and direct transport tests;
- focused `43/43 PASS` and `npm run check 294/294 PASS` are repository/Codex evidence;
- GitHub Actions runs `0` and commit status checks `0`, so no GitHub-hosted CI PASS claim is allowed.

Target-runtime evidence:

- the original synchronous Pitchbook query terminated at Apps Script maximum execution after `360.804s` with no normal Pitchbook `AI_QUERY` Audit outcome;
- CODEX-12 then implemented `background=true` but retained polling inside the same Apps Script call;
- exact source readback `78/78`, immutable Apps Script version `51`, same private Web App updated in place, deployment inventory `9` unchanged;
- exactly one post-repair Pitchbook query returned safe application-generated `AI_QUERY_TIMEOUT` after `134.96s`;
- Audit recorded one Pitchbook `AI_QUERY` Failure with `Error_Code=AI_QUERY_TIMEOUT` and zero citations;
- no provider terminal `failed/cancelled/requires_action/incomplete/budget_exceeded` outcome was established;
- no lifecycle mutation followed; settings remained safe and OpenAI/FULL_OUTPUT were untouched.

Detailed report:
`docs/handoffs/0020-CODEX-12-pitchbook-query-outcome-and-final-qualification-report.md`

## User decision and current provider review

The user confirmed that the current latest stable Flash model is sufficient and requested end-to-end optimization of the surrounding system for speed and user experience rather than a model downgrade.

Current official Gemini API documentation identifies `gemini-3.7-flash` as the latest stable Flash model and provides explicit `thinking_level` and `max_output_tokens` controls through the Interactions API. File Search is supported through Interactions, and background execution is intended to be retrieved across later requests.

Current repository source already targets `gemini-3.7-flash`, but the active request path does not include `generation_config.thinking_level` or `generation_config.max_output_tokens`. It sets `background=true`, then sleeps/polls `24 * 5s` inside one Apps Script execution and raises a local timeout if the Interaction remains pending. The browser waits on that long `searchKnowledge` call and has no proven secure page-reload resume or identical-pending-query reuse path.

Therefore the currently observed latency cannot be attributed to Flash model inadequacy, Store size, Pitchbook file size, period length, or File Search indexing. The decisive confirmed defect is an unoptimized request/application lifecycle; provider thinking/tool latency remains unmeasured because safe terminal telemetry is incomplete.

## Accepted architecture

Decision:
`docs/decisions/gemini-search-latency-and-ux-architecture.md`

Normal request profile:

```text
model = gemini-3.7-flash
background = true
thinking_level = low
max_output_tokens = 2048
```

Application contract:

```text
immediate browser feedback
-> one short START call
-> exactly one provider Interaction
-> opaque server-owned resumable token
-> later short POLL calls, one provider GET maximum each
-> same Interaction until terminal
-> exactly one terminal Audit outcome
```

Pending statuses are `queued` and `in_progress`. Terminal non-success statuses are `requires_action`, `failed`, `cancelled`, `incomplete`, and `budget_exceeded`. A browser observation limit must not falsely mark a pending provider Interaction as failed.

The UX must prevent duplicate START, preserve the previous result, show elapsed progress, back off polling, resume after page reload using only an opaque token in `sessionStorage`, and provide a manual result check after automatic polling stops.

Safe terminal telemetry must distinguish START/POLL overhead, provider elapsed time, and numeric thought/tool/token usage without retaining raw questions, source text, provider payloads, or raw provider identities.

## Strategy Reset — CODEX-14

`0020-CODEX-13` was committed but not executed. The user then materially expanded the execution contract from a narrow resume-path repair to coherent request, lifecycle, performance-evidence, and UX optimization. CODEX-13 is therefore `SUPERSEDED / NOT EXECUTED`.

Active instruction:
`docs/handoffs/0020-CODEX-14-gemini-query-performance-and-ux-optimization-instruction.md`

One active hypothesis:

> The latest stable Flash model is appropriate, but the application is invoking it through an unconstrained thinking/output profile and a non-resumable same-call polling lifecycle. One coherent low-latency request profile plus secure cross-request state, duplicate suppression, responsive browser UX, and safe telemetry will remove false timeouts and materially improve usability while preserving File Search and the provider-neutral architecture.

## CODEX-14 actual execution result

The exact tested source was delivered once and read back with `78/78` parity. One immutable Apps Script version (`53`) was created and the same private Web App was updated in place; the Web App type/security boundary and deployment inventory were preserved.

The one authorized synthetic Pitchbook START returned to pending in approximately `9115ms`. One reload/resume path and one manual recheck used the same opaque job token; no second START was observed. The maximum browser-observed POLL round trip was `9691ms`. The same Interaction remained nonterminal at the bounded `>=600000ms` observation limit. The UI preserved a non-error long-running state and did not generate `AI_QUERY_TIMEOUT`.

The pending state produced no terminal AI_QUERY Audit row. Read-only integrity confirmed schema 6, five Backend sheets, settings, source rows/files, Audit, Script Properties, triggers (`0`), Store/deployment/Library boundaries, and OpenAI-disabled state were unchanged. Because no terminal successful query was observed, citation, metadata/lifecycle, and dependent final qualification gates were not run.

Detailed report:
`docs/handoffs/0020-CODEX-14-gemini-query-performance-and-ux-optimization-report.md`

The handoff's stop condition applies: preserve the resumable token and classify the provider as `PROVIDER_LONG_RUNNING`; do not retry or create a second query in this dispatch.

## Findings

### BLOCKER

1. No grounded Pitchbook query with authoritative citation has passed.
2. Exact metadata-filter and update/Inactive/Reactivate/delete-rebuild gates remain dependent on a terminal successful Pitchbook query.

### FOLLOW_UP

- GitHub-hosted CI/check evidence remains absent.
- Work branch is behind newer `main`; integrate current main only after the runtime blocker closes and before final Work merge.
- A representative Meeting/Pitchbook latency benchmark across document sizes and modes should be a separate Work after the core closes; it must not delay Work 0020 completion.

### OPTIONAL

None added to the active implementation. Do not split Stores, alter chunking, reindex accepted documents, add another retrieval layer, or enable paid Priority inference without material evidence from completed safe telemetry.

## Accepted evidence preserved

- CODEX-03 through CODEX-11 accepted schema/FULL_OUTPUT/provider/upload/reconciliation/Meeting-query evidence remains closed.
- Synthetic Pitchbook indexing is accepted and must not be repeated merely to diagnose query lifecycle.
- CODEX-12 request-shape tests and delivery evidence remain accepted for what they observed.

## Target final matrix (not reached in CODEX-14)

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

WORK_ID: `0020`
ACTIVE_DISPATCH_ID: `0020-CODEX-14`
BALL: `CHATGPT`
DISPATCH_STATUS: `RETURNED / BLOCKER`
WORK_READY: `NO`
BLOCKER: `YES`
