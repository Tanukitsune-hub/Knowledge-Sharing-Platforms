# Work 0020 CODEX-15 — Gemini provider-path isolation and final qualification

WORK_ID: `0020`
DISPATCH_ID: `0020-CODEX-15`
MODE: `INVESTIGATION -> BUILD / QUALIFICATION`
BALL: `CODEX`
STATUS: `READY`
ROUTE: `C`

## Primary Outcome

Finish Work 0020 without another blind retry.

Determine whether the remaining pathological latency is specific to the Gemini Interactions + File Search query path or to Gemini File Search more generally. Use the cheapest bounded target-runtime evidence, select the fastest supported query transport only if the evidence is decisive, then complete the grounded synthetic Pitchbook and already-defined lifecycle/final-integrity gates.

Keep the user-approved model and corpus architecture:

```text
gemini-3.7-flash
one existing File Search Store
existing indexed Meeting and synthetic Pitchbook documents
existing metadata and authoritative citation mapping
```

Do not change model family, split/rebuild the Store, alter chunking, or add another retrieval database in this dispatch.

## Sources of Truth

Repository and runtime identity:

- repository: `Tanukitsune-hub/Knowledge-Sharing-Platforms`;
- branch: `agent/0020-ai-provider-core`;
- starting ref: use the exact branch head supplied in the ChatGPT dispatch prompt;
- Draft PR: `#26`;
- deployed private Web App: the same positively identified owner-only Web App, currently version `53`;
- current Apps Script source delivery: exact `78/78` readback recorded by CODEX-14.

CODEX-14 commit identity:

```text
implementation commit: f63cb59d990a1392dfbd7be6efbb6bcbe63fb5c5
qualification/report commit: 3935ab7c5eea4e1fe3a18574625fec4522c70e25
final branch head after documentation alignment: bc8a0e8e801b4afeb828cc6a1e18087435764535
```

Detailed prior report:
`docs/handoffs/0020-CODEX-14-gemini-query-performance-and-ux-optimization-report.md`

Current official references:

- `https://ai.google.dev/gemini-api/docs/file-search`
- `https://ai.google.dev/gemini-api/docs/generate-content/file-search`
- `https://ai.google.dev/api/interactions-api`

The official Gemini documentation supports File Search through both the recommended Interactions API and the Generate Content API. Generate Content returns grounding metadata and custom metadata that can be normalized into the existing authoritative citation contract.

## Accepted Evidence — Closed

Preserve these conclusions unless material contradictory evidence appears:

- schema `6`; exactly five Backend sheets;
- FULL_OUTPUT runtime/canonical parity PASS; do not rerun;
- OpenAI disabled and uncalled; no automatic provider failover;
- one existing Gemini File Search Store using the accepted embedding configuration;
- direct Blob upload and exact Gemini Document reconciliation PASS;
- two affected Meeting documents reconciled without uncertain-row upload/delete;
- one Meeting query completed with three authoritative citations;
- one small synthetic TXT Pitchbook remains Gemini Indexed;
- CODEX-14 request profile PASS: `background=true`, `thinking_level=low`, `max_output_tokens=2048`;
- CODEX-14 application lifecycle PASS: short START, separate one-GET POLLs, opaque actor-bound token, duplicate START suppression, terminal idempotency;
- CODEX-14 browser UX PASS for immediate feedback, previous-result preservation, adaptive polling, reload resume, manual recheck, and no false timeout;
- CODEX-14 logic validation `301/301 PASS`, temporal/public-surface/diff checks PASS, public facade `30`;
- CODEX-14 START returned pending in about `9.1s`, individual POLL calls were at most about `9.7s`, and the same Interaction remained provider-pending after at least `600s`;
- no second START, failure Audit, source mutation, Store/deployment/Library expansion, OpenAI call, or FULL_OUTPUT rerun occurred.

CODEX-14 proved that the former frozen Apps Script request was fixed. It did not prove a usable Gemini query completion time.

## ChatGPT Review Corrections

Use the following classifications prospectively:

- CODEX-14 `STATE_INTEGRITY: PASS`: the pending query caused no unintended data/control-plane mutation.
- Work-level `FINAL_INTEGRITY: PARTIAL`: the metadata/lifecycle completion gates were not run.
- `FINAL_COMMIT` for the returned branch is `bc8a0e8e801b4afeb828cc6a1e18087435764535`; do not substitute the earlier implementation or report commit.
- CODEX-13 did execute locally and returned `PROVIDER_LONG_RUNNING`, but its local commit was not independently pushed. Record it as user-supplied late local evidence superseded by CODEX-14, not as `NOT EXECUTED` and not as GitHub-authoritative source.

## Active Hypothesis

> The remaining greater-than-ten-minute pending state is pathological behavior in the current Gemini Interactions + File Search execution path, not an Apps Script waiting-loop defect and not demonstrated model inadequacy. The same indexed synthetic Pitchbook queried once through the officially supported Generate Content + File Search path should complete materially faster and return grounding metadata. If it does, the provider-neutral Gemini adapter can use Generate Content as the normal fast query transport while retaining the accepted File Search Store, model, filters, citations, and server-side credential boundary.

### Confirming observation

The existing CODEX-14 Interaction remains nonterminal or ends without an authoritative Pitchbook citation, while one bounded Generate Content + File Search query using the same model, Store, exact synthetic source, prompt intent, and metadata completes within the interactive acceptance bound and returns authoritative grounding metadata.

### Falsifying observation

Generate Content + File Search also stalls, times out, or fails to return authoritative grounding from the same already-indexed synthetic source. In that case, do not add another query transport or retrieval architecture; classify the blocker as Gemini File Search / project / credential / provider-path external behavior and return for user/provider escalation.

## Fastest Safe Decisive Action

### Phase 0 — read-only disposition of the existing CODEX-14 job

Before source, deployment, Settings, source-row, or provider-document mutation:

1. Use the preserved opaque token and normal POLL path once.
2. Record only safe evidence:
   - current normalized provider status;
   - total elapsed time;
   - safe created/updated timestamps if returned;
   - safe step-type/status enums;
   - numeric usage counters if terminal;
   - citation count if terminal.
3. Do not create a new Interactions query.
4. If it has completed with at least one authoritative Pitchbook citation, accept that query gate and proceed directly to the remaining metadata/lifecycle/final-integrity gates; do not implement the alternate transport.
5. If it reached a documented terminal non-success state, record it and continue to the one Generate Content diagnostic below.
6. If it remains pending or the CacheService token has been evicted/expired, record that fact and continue. Cache loss is not provider completion evidence.
7. After evidence capture, one cancellation of the still-running synthetic background Interaction is authorized only if it can be done through the official cancel method without adding a public/debug endpoint or exposing the raw Interaction ID. Failure to cancel is not permission for further mutation.

### Phase 1 — deterministic Generate Content adapter

Implement and test one provider-internal Gemini Generate Content + File Search adapter. It must:

- use `gemini-3.7-flash`;
- use low thinking and a bounded output compatible with the current `2048`-token normal profile;
- use the same File Search Store and normalized metadata filter;
- keep the API key server-side;
- normalize answer text, grounding metadata, grounding chunks, custom metadata, and page number into the existing provider-neutral citation model;
- require authoritative `source_type` and `source_id` mapping before accepting a citation;
- preserve safe error redaction and one terminal Audit outcome;
- expose no raw Store/document/provider identifiers to the browser;
- add no automatic provider failover;
- add no new public function if the existing `searchKnowledge` facade can carry the chosen server-side transport.

Do not make Generate Content the normal transport before its deterministic and live evidence passes.

Deterministic tests must cover at least:

- exact request shape for model, prompt, File Search Store, metadata filter, low thinking, and output cap;
- successful text normalization;
- grounding metadata/custom metadata citation normalization;
- missing/ambiguous/unmapped citation fails safe or produces explicit insufficient-evidence behavior;
- provider HTTP and malformed-response redaction;
- OpenAI behavior unchanged;
- existing Interactions START/POLL tests remain green;
- public facade count does not increase;
- focused tests PASS;
- `npm run check` PASS;
- temporal validation PASS;
- public-surface validation PASS;
- `git diff --check` PASS.

### Phase 2 — one bounded target-runtime Generate Content query

Only after deterministic PASS:

- synchronize and read back the exact tested source once;
- create at most one immutable Apps Script version;
- update the same private Web App in place once;
- preserve deploying-user execution, owner-only access, Store count, deployment inventory, Library state, Settings, and triggers.

Submit exactly one narrow query using the existing synthetic TXT Pitchbook with an exact metadata filter including its `source_type`, `source_id`, and `content_hash` where supported by the current metadata-filter contract. Use a question tied to the unique synthetic content. Do not upload or reindex the Pitchbook.

Record separately:

```text
GENERATE_CONTENT_SERVER_MS
GENERATE_CONTENT_PROVIDER_HTTP_STATUS
GENERATE_CONTENT_FINISH_REASON
GENERATE_CONTENT_INPUT_TOKENS
GENERATE_CONTENT_OUTPUT_TOKENS
GENERATE_CONTENT_THOUGHT_TOKENS
GENERATE_CONTENT_TOOL_USE_TOKENS
GENERATE_CONTENT_CITATION_COUNT
```

Store only safe numeric/enumerated telemetry. Do not store the question, source text, raw response, API key, Store ID, provider document ID, or raw provider URI.

Interactive acceptance for this isolated one-document test:

```text
target: <= 60,000 ms
hard Work 0020 acceptance ceiling: <= 90,000 ms
citations: >= 1 authoritative Pitchbook citation
terminal Audit outcomes: exactly 1
```

A result slower than the hard ceiling may establish correctness but does not satisfy the user-approved speed/UX outcome.

## Evidence-Gated Decision

### A. Existing Interactions job completes acceptably

If Phase 0 yields a grounded authoritative Pitchbook result and its actual elapsed time is usable, do not add or activate Generate Content. Finish the lifecycle gates with the accepted Interactions transport.

### B. Generate Content passes and Interactions remains pathological

If the Generate Content query completes within the hard acceptance ceiling with at least one authoritative Pitchbook citation:

1. make Generate Content the normal Gemini Knowledge Search query transport under the existing provider abstraction;
2. preserve the CODEX-14 Interactions START/POLL implementation as a non-default rollback path for final review; do not automatically fail over between transports;
3. retain immediate feedback, previous-result preservation, duplicate-submit protection, safe Audit, and redaction in the normal UI;
4. record the transport enum/version in safe Audit telemetry;
5. do not expose a user transport selector in Work 0020.

Then complete the remaining gates below.

### C. Generate Content also fails or is too slow

If the one bounded Generate Content query fails, stalls, reaches Apps Script maximum execution, returns no authoritative citation, or exceeds the hard acceptance ceiling:

- stop without another query or speculative patch;
- do not split/rebuild the Store, change model, rotate the key, add Priority inference, add another retrieval layer, or alter chunking;
- preserve all accepted application work;
- return `BLOCKED / GEMINI_FILE_SEARCH_PROVIDER_PATH` with the exact safe evidence;
- identify the next user/provider action as either a fresh isolated Gemini project/key A/B qualification or Google support escalation, but do not perform it without a new explicit authorization.

## Remaining Lifecycle Gates After a Fast Grounded Query

Only after one query transport passes the grounded citation and latency gates:

1. exact metadata-filter exclusion/inclusion;
2. source update -> reindex without duplicate provider document;
3. Inactive -> provider removal and query exclusion;
4. Reactivate -> restoration and query inclusion;
5. exact derived-document delete/rebuild;
6. restore the intended synthetic Active lifecycle;
7. final five-sheet/schema/provider/Audit/settings/trigger/deployment integrity.

Before every provider-mutating lifecycle SYNC:

```text
AI_SYNC_BATCH_SIZE = numeric 1
-> authoritative readback = numeric 1
-> exactly one bounded mutation
-> restore numeric 10 afterward
```

No provider query retry is allowed. Use at most one query per required lifecycle observation.

## CacheService Follow-up Gate

Current resumable Interactions state is stored in Apps Script `CacheService`. Treat it as best-effort short-term state, not durable storage: Google documents that cached data can disappear before its requested expiry.

- If Interactions remains the normal transport, durable pending-state persistence is a completion blocker and must move to an existing restricted/server-side durable store without adding a normal-user sheet.
- If Generate Content becomes the normal fast transport, keep CacheService only for the inactive rollback path and record durable Interactions persistence as a non-blocking follow-up.

Do not expand this into a new storage architecture unless the selected normal transport requires it.

## Authorization and Boundaries

Authorized:

- read-only status check of the existing CODEX-14 job;
- one official cancellation of that synthetic job after evidence capture if still running;
- one minimal Generate Content File Search adapter;
- one deterministic validation cycle;
- one source delivery/readback, version, and same-Web-App update;
- one live Generate Content synthetic Pitchbook query;
- bounded lifecycle operations only after query PASS;
- updates to Work 0020 handoffs, report, dispatch register, and PR #26.

Prohibited:

- another Interactions START merely to retry;
- model downgrade or unpinned `*-latest` alias;
- OpenAI live call or automatic failover;
- FULL_OUTPUT rerun;
- confidential or production data;
- broad sync;
- Store split, new Store, reindex for diagnosis, chunking changes, or duplicate summaries;
- browser API key or raw provider ID exposure;
- paid Priority/Flex tier change;
- new Web App, Library, webhook, public/debug endpoint, or external proxy;
- fresh project/key creation or credential rotation without a new explicit user authorization;
- current-main integration during the bounded provider-path diagnosis.

## Completion Latch

Target Work classification:

```text
SELECTED_GEMINI_QUERY_TRANSPORT: INTERACTIONS | GENERATE_CONTENT
GEMINI_QUERY_LATENCY_MS: <= 90000 for isolated one-document qualification
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

Once reached, do not add more latency experiments to Work 0020. A representative multi-size/multi-mode benchmark and user-selectable thinking level belong to later Works.

## Required Delivery

Create:

`docs/handoffs/0020-CODEX-15-gemini-provider-path-isolation-and-final-qualification-report.md`

Update:

- `docs/handoffs/0020-instruction.md`;
- `docs/handoffs/0020-report.md`;
- `docs/handoffs/0020-dispatches.md`;
- PR `#26`.

Commit and push all scoped changes.

Report at minimum:

```text
EXISTING_INTERACTION_DISPOSITION
EXISTING_INTERACTION_TOTAL_ELAPSED_MS
EXISTING_INTERACTION_CANCELLED
GENERATE_CONTENT_FILE_SEARCH
GENERATE_CONTENT_SERVER_MS
SELECTED_GEMINI_QUERY_TRANSPORT
PITCHBOOK_AUTHORITATIVE_CITATIONS
METADATA_FILTER
LIFECYCLE
LOGIC_VALIDATION
GEMINI_DOCUMENT_RECONCILIATION
GEMINI_RUNTIME
FULL_OUTPUT_RUNTIME
STATE_INTEGRITY
FINAL_INTEGRITY
READY
BLOCKER
IMPLEMENTATION_COMMIT
QUALIFICATION_REPORT_COMMIT
FINAL_BRANCH_HEAD
GITHUB_CI_ACTUALLY_RAN
```

## Mandatory Final Chat Contract

The Codex final chat response MUST begin before any other text with:

```text
WORK_ID: 0020
DISPATCH_ID: 0020-CODEX-15
BALL: CHATGPT
STATUS: RETURNED
```

Repeat the same four lines at the very end. If a genuine native user action is required, use `BALL: USER` and `STATUS: ACTION_REQUIRED` instead. Missing either block is a reporting-contract failure.
