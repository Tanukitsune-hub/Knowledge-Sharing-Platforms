# Work 0020 — AI Provider Core

WORK_ID: `0020`
DISPATCH_ID: `0020-CODEX-15`
BALL: `CODEX`
STATUS: `RETURNED`
MODE: `INVESTIGATION -> BUILD / QUALIFICATION`

Primary plan:
`docs/planning/work0020-personal-pc-gemini-core-qualification.md`

Active instruction:
`docs/handoffs/0020-CODEX-15-gemini-provider-path-isolation-and-final-qualification-instruction.md`

Accepted latency/UX architecture:
`docs/decisions/gemini-search-latency-and-ux-architecture.md`

## Primary Outcome

Deliver and qualify one provider-neutral Knowledge Search core with exactly three user-facing routes:

```text
ChatGPT
Gemini
全文出力
```

Gemini must use the user-approved stable `gemini-3.7-flash`, return grounded authoritative citations, and provide a practically usable search experience. OpenAI remains deliberately disabled/uncalled. FULL_OUTPUT remains accepted and must not be rerun.

## Accepted Evidence — Closed

- schema `6`; exactly five Backend sheets;
- FULL_OUTPUT runtime/canonical parity PASS;
- no automatic provider failover; OpenAI disabled/uncalled;
- one existing Gemini File Search Store using the accepted embedding configuration;
- direct Blob upload and exact provider-document reconciliation PASS;
- both affected Meeting documents reconciled without uncertain-row upload/delete;
- one grounded Meeting query completed with three authoritative citations;
- one synthetic TXT Pitchbook remains Gemini Indexed;
- CODEX-14 request profile PASS: `background=true`, `thinking_level=low`, `max_output_tokens=2048`;
- CODEX-14 application lifecycle PASS: short START, later one-GET POLLs, opaque server-owned token, duplicate START suppression, terminal idempotency;
- CODEX-14 browser UX PASS: immediate feedback, previous-result preservation, adaptive polling, reload resume, manual recheck, no false timeout;
- CODEX-14 deterministic validation `301/301 PASS`, temporal/public-surface/diff checks PASS, public facade `30`;
- exact Apps Script source readback `78/78`; immutable version `53`; same owner-only private Web App updated in place;
- one CODEX-14 synthetic Pitchbook Interaction remained provider-pending after at least `600000ms`; no second START, citation, terminal failure Audit, source/lifecycle mutation, or infrastructure expansion occurred.

CODEX-14 commit identity:

```text
implementation: f63cb59d990a1392dfbd7be6efbb6bcbe63fb5c5
qualification/report: 3935ab7c5eea4e1fe3a18574625fec4522c70e25
final returned branch head: bc8a0e8e801b4afeb828cc6a1e18087435764535
```

CODEX-14 is accepted for the application request/lifecycle/UX work. It did not satisfy Gemini query completion or Work readiness.

## Current Blocker

The already-indexed small synthetic TXT Pitchbook, queried with the stable Flash model, low thinking, bounded output, narrow scope, and correct cross-request polling, remained `queued/in_progress` for more than ten minutes.

This is no longer evidence of a frozen Apps Script request. The remaining unresolved layer is the provider query path:

```text
Gemini Interactions API
+ File Search tool
+ current project/API key/provider routing
```

No authoritative Pitchbook citation exists, so metadata-filter and update/Inactive/Reactivate/delete-rebuild gates remain incomplete.

Use these Work-level classifications:

```text
STATE_INTEGRITY: PASS — no unintended side effects from the pending query
FINAL_INTEGRITY: PARTIAL — lifecycle completion gates not run
GEMINI_RUNTIME: BLOCKED / PROVIDER_LONG_RUNNING
READY: NO
BLOCKER: YES
```

## Strategy Reset — CODEX-15

One active hypothesis:

> The greater-than-ten-minute pending state is pathological behavior in the current Interactions + File Search execution path. One bounded query against the same indexed synthetic source through the officially supported Generate Content + File Search path will determine whether the problem is path-specific or affects Gemini File Search more broadly.

Fastest safe decisive action:

1. POLL the existing CODEX-14 opaque job once, read-only.
2. If it has completed with an authoritative Pitchbook citation, accept it and finish lifecycle gates without changing query transport.
3. Otherwise implement and deterministically validate one internal Generate Content + File Search adapter.
4. Deliver once and execute one exact synthetic Pitchbook query.
5. If it returns within `90000ms` with an authoritative citation, select that supported transport and finish the lifecycle gates.
6. If it also stalls/fails/is too slow, stop. Do not add another architecture; classify an external Gemini File Search/project/provider-path blocker and identify the next user/provider action.

Detailed execution, safety, response-normalization, telemetry, cancellation, CacheService, and stop rules are in the active handoff.

## Important Corrections

- CODEX-13 actually executed locally and returned `PROVIDER_LONG_RUNNING`, but its local commit was not pushed. Treat it as user-supplied late local evidence superseded by CODEX-14, not as `NOT EXECUTED` and not as GitHub-authoritative source.
- Apps Script `CacheService` is best-effort and may evict entries before their requested expiry. If Interactions remains the normal transport, durable pending-state persistence is a completion blocker. If Generate Content becomes the normal fast transport, it is a follow-up for the inactive rollback path.
- GitHub Actions and commit status checks remain absent; local deterministic results are not GitHub-hosted CI evidence.

## Boundaries

- no model downgrade or unpinned alias;
- no blind Interactions retry;
- no OpenAI live call or automatic failover;
- no FULL_OUTPUT rerun;
- no confidential/live source data or broad sync;
- no Store split/new Store, reindex for diagnosis, chunking change, or duplicate summary layer;
- no browser API key, raw provider ID, paid service-tier change, fresh project/key, new Web App/Library/webhook/public debug endpoint;
- no current-main integration during CODEX-15 provider-path diagnosis.

## Target Final Classification

```text
SELECTED_GEMINI_QUERY_TRANSPORT: INTERACTIONS | GENERATE_CONTENT
GEMINI_QUERY_LATENCY_MS: <= 90000 for the isolated one-document qualification
PITCHBOOK_AUTHORITATIVE_CITATIONS: >= 1
METADATA_FILTER: PASS
LIFECYCLE: PASS
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

Once reached, apply the Completion Latch. Broader representative latency benchmarking and user-selectable thinking levels are later Works.

## CODEX-15 return

CODEX-15 completed its one read-only POLL and one bounded Generate Content +
File Search query. The prior opaque job was expired, and the Generate Content
query returned the safe `Gemini search service unavailable` category after
`83364ms` with zero authoritative Pitchbook citations. No retry or dependent
lifecycle mutation was performed.

Current Work classification:

```text
GEMINI_RUNTIME: BLOCKED / GEMINI_FILE_SEARCH_PROVIDER_PATH
PITCHBOOK_AUTHORITATIVE_CITATIONS: 0
METADATA_FILTER: NOT RUN
LIFECYCLE: NOT RUN
LOGIC_VALIDATION: PASS
FULL_OUTPUT_RUNTIME: PASS — accepted prior evidence
FINAL_INTEGRITY: NOT RUN
READY: NO
BLOCKER: YES
```

Report:
`docs/handoffs/0020-CODEX-15-gemini-provider-path-isolation-and-final-qualification-report.md`
