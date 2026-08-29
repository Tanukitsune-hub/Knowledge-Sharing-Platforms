# Work 0020 — AI Provider Core

WORK_ID: `0020`
DISPATCH_ID: `0020-CODEX-14`
BALL: `CODEX`
STATUS: `RETURNED / BLOCKER`
MODE: `BUILD / QUALIFICATION`

Primary plan:
`docs/planning/work0020-personal-pc-gemini-core-qualification.md`

Active instruction:
`docs/handoffs/0020-CODEX-14-gemini-query-performance-and-ux-optimization-instruction.md`

Accepted latency/UX architecture:
`docs/decisions/gemini-search-latency-and-ux-architecture.md`

## Primary outcome

Deliver and qualify one provider-neutral Knowledge Search core with exactly three user-facing routes:

```text
ChatGPT
Gemini
全文出力
```

Gemini must be a responsive and resumable work experience rather than one frozen multi-minute Apps Script call. OpenAI remains deliberately disabled/uncalled. FULL_OUTPUT remains accepted and must not be rerun.

## User decision

- keep the latest stable Flash model, pinned as `gemini-3.7-flash`;
- do not treat a model downgrade as the latency solution;
- optimize the surrounding request profile, File Search invocation, Apps Script lifecycle, browser feedback, resumability, duplicate prevention, and safe performance evidence as one coherent design;
- preserve the current major architecture and working functionality.

## Accepted evidence — closed absent material contradiction

- schema `6`; exactly five Backend sheets;
- FULL_OUTPUT runtime/canonical parity PASS;
- no automatic provider failover; OpenAI disabled/uncalled;
- one isolated Gemini Store using the accepted embedding configuration;
- direct Blob upload and sourceType bounded-sync contracts accepted;
- authenticated private Web App administrator SYNC route proven;
- Gemini Document reconciliation PASS for both CODEX-10 affected Meetings without uncertain-row upload/delete;
- one grounded Meeting query PASS with authoritative Audit and three citations;
- one synthetic TXT Pitchbook remains Gemini Indexed with provider document identity/content hash;
- CODEX-12 deterministic validation PASS: focused `43/43`, repository `294/294`, temporal/public/diff PASS, public facade `30`;
- CODEX-12 exact source readback `78/78`, immutable Apps Script version `51`, same private Web App updated in place;
- original synchronous Pitchbook query hit Apps Script max execution at `360.804s`;
- post-repair Pitchbook query returned application-generated `AI_QUERY_TIMEOUT` after `134.96s`, zero citations, with no provider terminal failure established;
- no lifecycle mutation, OpenAI call, FULL_OUTPUT rerun, broad sync, new Store/deployment/Library followed.

Detailed CODEX-12 report:
`docs/handoffs/0020-CODEX-12-pitchbook-query-outcome-and-final-qualification-report.md`

## Strategy Reset for CODEX-14

`0020-CODEX-13` was committed but not executed. The user then expanded the required usable outcome from a narrow cross-request resume repair to coherent performance and user-experience optimization. CODEX-13 is therefore `SUPERSEDED / NOT EXECUTED`; do not run or report under it.

Current CODEX-12 source has several coupled gaps:

```text
no explicit thinking level or output-token cap
+ background Interaction polled inside one Apps Script call
+ local timeout while provider remains nonterminal
+ no secure reload/resume contract
+ incomplete duplicate-START protection
+ incomplete provider terminal-status mapping
+ insufficient safe latency/tool/thinking evidence
```

One active hypothesis:

> Gemini 3.7 Flash is an appropriate model, but the application is using it through an unoptimized request and lifecycle. An exact low-latency request profile plus secure cross-request START/POLL state, responsive browser UX, deduplication, and safe telemetry should remove false timeouts and materially improve both actual and perceived latency without replacing the model or File Search architecture.

## Required request and lifecycle contract

Normal Gemini Knowledge Search request:

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

Preserve the existing File Search tool, Store, metadata filters, grounded Japanese prompt, citations, and API-revision contract.

Application lifecycle:

```text
immediate browser feedback
-> one short START call
-> exactly one background Interaction
-> opaque expiring client token with provider ID retained server-side
-> later short POLL calls, at most one provider GET each
-> same Interaction until provider terminal state
-> exactly one terminal Audit outcome
```

`queued` and `in_progress` are pending. `completed` is successful terminal. `requires_action`, `failed`, `cancelled`, `incomplete`, and `budget_exceeded` are terminal non-success. A UI observation limit must not become a provider failure while the provider remains pending.

Browser UX must prevent duplicate START, preserve the prior answer while a new search runs, use adaptive polling, resume the same opaque token after reload through `sessionStorage`, and retain a manual result-check path after automatic polling stops.

Safe performance evidence must distinguish START/POLL/application overhead from provider elapsed time and returned numeric thinking/tool/token usage without storing questions, source text, raw provider payloads, or raw provider IDs.

## Remaining completion gates

After a grounded Pitchbook query with authoritative citation passes:

1. exact metadata filter;
2. update -> reindex without duplicate;
3. Inactive removal/exclusion;
4. Reactivate restoration;
5. exact delete/rebuild of the derived provider document;
6. restore intended synthetic lifecycle;
7. final Backend/provider/Audit/settings/trigger/deployment integrity.

Before every provider-mutating lifecycle SYNC:

```text
AI_SYNC_BATCH_SIZE = numeric 1
-> authoritative numeric 1 readback
-> execute one bounded mutation
-> restore numeric 10 afterward
```

## Boundaries

- no model downgrade or unpinned `*-latest` alias;
- no OpenAI live call;
- no FULL_OUTPUT rerun;
- no broad sync or confidential data;
- no Store split/new Store, reindex, chunking experiment, or duplicate summary layer;
- no browser API key or browser-direct Gemini request;
- no paid Priority inference enablement;
- no new Web App/Library/public debug endpoint;
- no repeated new Pitchbook query;
- no raw provider Interaction ID as client authorization token;
- no long same-call polling loop;
- no current-main merge/rebase during this bounded implementation;
- GitHub-hosted CI is not assumed; report whether it actually ran.

Current `main` has advanced independently. Integrate latest main only after the runtime blocker closes and before final PR merge.

## Target final classification

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

## CODEX-14 execution result

CODEX-14 delivered the exact request profile and cross-request query/UX lifecycle. Deterministic validation passed (`301/301`, temporal/public-surface/diff checks, public facade `30`), exact source readback was `78/78`, version `53` was created, and the same private Web App was updated in place.

The one authorized synthetic Pitchbook Interaction returned a non-error pending state, survived one reload/resume via the same opaque token, and remained pending through the bounded observation window. No second Interaction, false `AI_QUERY_TIMEOUT`, pending failure Audit, lifecycle mutation, or provider retry occurred. The explicit handoff stop condition therefore applies:

```text
GEMINI_RUNTIME: BLOCKED / PROVIDER_LONG_RUNNING
READY: NO
BLOCKER: YES
```

Detailed report:
`docs/handoffs/0020-CODEX-14-gemini-query-performance-and-ux-optimization-report.md`

The target final classification below remains the intended completion state for a future authorized strategy reset; it is not claimed by CODEX-14.

Completion Latch applies only after ChatGPT final review, current-main integration, and merge.
