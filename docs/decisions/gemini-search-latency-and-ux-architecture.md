# Gemini Search Latency and UX Architecture

Status: ACCEPTED FOR WORK 0020 IMPLEMENTATION
Decision date: 2026-08-29
Scope: Knowledge Search / Gemini File Search / Apps Script Web App

## Decision

Keep the current provider stack and optimize how it is used:

```text
Gemini 3.7 Flash (stable, pinned)
+ Gemini Interactions API
+ Gemini File Search
+ server-side API key
+ short cross-request START/POLL calls
+ responsive resumable Web App UX
```

Do not replace Gemini 3.7 Flash with a slower model, do not move the API key into the browser, and do not replace the modular provider architecture merely to hide latency.

The primary latency/UX problem is the application contract around the provider, not demonstrated model inadequacy:

- the current request does not set `generation_config`, so Gemini 3 dynamic thinking is not explicitly constrained for retrieval-oriented work;
- the current request does not bound output tokens;
- CODEX-12 uses `background=true` but still holds one Apps Script invocation open while polling, then converts a nonterminal provider Interaction into a local timeout;
- the current browser waits on one long `google.script.run` call and cannot resume the same provider Interaction after reload;
- the current terminal-state mapping is incomplete.

Official Gemini documentation identifies Gemini 3.7 Flash as the latest stable Flash model, recommends the Interactions API as the standard primitive, documents File Search through Interactions, and provides `thinking_level` and `max_output_tokens` controls. Background Interactions are intended to be retrieved later rather than keeping one HTTP request open.

Authoritative references:

- https://ai.google.dev/gemini-api/docs/models
- https://ai.google.dev/gemini-api/docs/latest-model
- https://ai.google.dev/gemini-api/docs/file-search
- https://ai.google.dev/gemini-api/docs/text-generation
- https://ai.google.dev/api/interactions-api

## Request profile

The normal Knowledge Share Gemini search profile is:

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

The existing File Search tool and exact metadata filters remain attached to the request.

Rationale:

- `low` thinking is appropriate for grounded retrieval, summarization, chronology, comparison, and meeting-preparation tasks where the source documents—not unconstrained reasoning—must dominate the answer;
- 2,048 output tokens are sufficient for the current concise Japanese work-product contract and prevent unexpectedly long generation;
- a future explicit “deep analysis” mode may use a higher thinking level, but it is not part of Work 0020 and must not slow the default path.

Use the stable pinned model ID rather than an unpinned `*-latest` alias so target-runtime evidence remains reproducible.

## Query lifecycle

### START

One short Apps Script call:

1. normalize and validate the request;
2. calculate a deterministic request fingerprint from provider, model, request profile, normalized filters, mode, and question hash;
3. reuse an existing live pending job for the same authorized actor/fingerprint rather than creating a duplicate Interaction;
4. otherwise create exactly one background Interaction;
5. retain the raw provider Interaction ID only in server-side state;
6. return immediately with either a terminal result or an opaque expiring query token.

START must not sleep or poll.

### POLL

Each later Apps Script call:

1. validates the opaque token, actor binding, expiry, and stored request context;
2. performs at most one provider GET for the same Interaction;
3. returns `pending` or a terminal result;
4. never creates another Interaction.

Provider statuses:

- pending: `queued`, `in_progress`;
- success: `completed`;
- terminal non-success: `requires_action`, `failed`, `cancelled`, `incomplete`, `budget_exceeded`;
- unknown status: fail closed with a safe error.

A browser observation limit is not a provider failure. Reaching the UI auto-poll limit preserves the query token and exposes a manual resume action; it must not write `AI_QUERY_TIMEOUT` while the provider remains pending.

## Server-side job state and idempotency

Store only the minimum server-side state needed to resume safely:

- opaque token hash/key;
- provider Interaction ID;
- authorized actor/session binding available in the current Web App identity model;
- request fingerprint;
- mode and stable filter IDs/dates needed for final citation mapping and Audit;
- model/request-profile version;
- created/expiry timestamps;
- terminal-delivery/Audit marker;
- terminal response only for the short idempotency window needed to survive duplicate polls.

Do not store the API key, raw source body, raw provider payload, or user question text in client storage. The client may keep only the opaque token and non-sensitive display state in `sessionStorage` so a page reload can resume the same query.

Duplicate START and duplicate terminal POLL calls must be idempotent. Exactly one terminal `AI_QUERY` Audit row is allowed for one provider Interaction. Pending polls write no failure Audit.

## Browser UX

The Web App must behave as a responsive job UI, not a frozen request form:

- show immediate local feedback when search is submitted;
- preserve the previous result while a new query is pending;
- return from START quickly and show elapsed time;
- use adaptive client polling (short intervals initially, then back off to a maximum interval);
- show a non-error “still searching” message when processing exceeds the normal interactive window;
- persist the opaque token in `sessionStorage` and resume after reload;
- prevent double-click/duplicate Interaction creation;
- after the bounded automatic observation window, stop automatic polling but keep a “check result again” action;
- never display raw provider IDs, payloads, credentials, Store names, or private diagnostic data.

Streaming directly from the browser is not adopted because the API key must remain server-side and Apps Script `google.script.run` is not a streaming transport. Cross-request polling is the smallest secure architecture that fits the existing Web App.

## Safe performance telemetry

A terminal query should retain only safe numeric/enum telemetry, preferably in the existing Restricted Audit metadata field rather than a new sheet:

- request profile version;
- thinking level and output-token cap;
- provider terminal status;
- local START latency;
- poll count and maximum individual POLL latency;
- provider elapsed time when timestamps are available;
- total input, output, thought, tool-use, and cached tokens when returned by Gemini;
- source-type filter and other stable non-secret scope identifiers already permitted in Audit.

Do not record the user question, source text, raw provider response, API key, raw Interaction ID, Store ID, or provider document ID.

These measurements distinguish model thinking, File Search tool use, provider queuing, and Apps Script/UI overhead without exposing content.

## Retrieval and indexing decisions

Keep the current single File Search Store, `models/gemini-embedding-2`, stable metadata, and metadata-filter design for Work 0020.

Do not currently:

- split Meeting and Pitchbook into separate Stores;
- reindex accepted documents;
- change chunking configuration;
- add a second retrieval layer;
- precompute duplicate summaries;
- enable Priority inference or another paid latency tier;
- replace Interactions with the legacy Generate Content API.

Reason: the failing live case is one already-indexed small synthetic TXT Pitchbook with a narrow source-type filter. There is no evidence that Store size, file size, default chunking, or source-type naming caused the timeout. Those changes would add cost and migration risk without changing the decisive current observation.

Chunking and Store partitioning may be benchmarked later against representative non-confidential real-sized documents only if the completed Interaction telemetry shows File Search/tool-use latency or retrieval quality is the limiting factor.

## Acceptance evidence

Work 0020 is not considered user-ready merely because a provider call eventually finishes. Required evidence includes:

```text
MODEL_PROFILE: gemini-3.7-flash / thinking low / max output 2048
START_SERVER_SLEEP_OR_POLL: 0
POLL_PROVIDER_GETS_PER_CALL: <= 1
RAW_PROVIDER_ID_EXPOSED_TO_CLIENT: NO
DUPLICATE_START_CREATES_SECOND_INTERACTION: NO
PAGE_RELOAD_RESUME: PASS
PENDING_POLL_FAILURE_AUDIT: 0
TERMINAL_AUDIT_PER_INTERACTION: 1
PITCHBOOK_AUTHORITATIVE_CITATION: >= 1
UI_FALSE_TIMEOUT_WHILE_PROVIDER_PENDING: NO
```

For the isolated target-runtime qualification, record actual START latency, individual POLL latency, total provider elapsed time, terminal status, and safe usage-token breakdown. A long provider duration is not hidden; it is classified separately from application responsiveness.

## Completion and later optimization

Work 0020 completes when the provider-neutral core works end to end, the optimized request/lifecycle/UX contract is proven with isolated data, the required Pitchbook citation and lifecycle gates pass, and final integrity passes.

A broader latency benchmark over representative Meeting/Pitchbook sizes and query modes should be a separate follow-up Work after Work 0020 closes. It must not reopen the completed core unless it finds material contradictory evidence.