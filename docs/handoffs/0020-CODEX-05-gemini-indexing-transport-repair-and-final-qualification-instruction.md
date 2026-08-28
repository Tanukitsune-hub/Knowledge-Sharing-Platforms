# Work 0020 — CODEX-05 Gemini indexing/transport repair and final qualification

WORK_ID: `0020`
DISPATCH_ID: `0020-CODEX-05`
BALL: `CODEX`
STATUS: `READY`
MODE: `INVESTIGATION / BUILD / QUALIFICATION`
ROUTE: `C`
RECOMMENDED_MODEL: `Sol High`

Repository: `Tanukitsune-hub/Knowledge-Sharing-Platforms`
Branch: `agent/0020-ai-provider-core`
Draft PR: `#26`
Exact execution ref: supplied in the ChatGPT dispatch prompt after activation metadata is finalized.

## Primary outcome

Complete Work 0020 by repairing the live Gemini File Search indexing/transport path, then proving grounded retrieval and lifecycle behavior for both Meeting and Pitchbook sources.

Do not redesign the provider-neutral architecture and do not split this outcome into another Work.

## Accepted evidence — do not reopen absent material contradiction

CODEX-03:

- schema `6`, exactly five Backend sheets;
- FULL_OUTPUT runtime PASS;
- Preview / Copy / Google Docs / PDF share one canonical package/fingerprint;
- Pitchbooks remain references only in FULL_OUTPUT;
- OpenAI and Gemini disabled-provider/no-failover behavior PASS;
- final integrity PASS;
- same private Web App, no second deployment, no Library mutation.

CODEX-04:

- focused provider/admin/public-surface validation `17/17 PASS`;
- repository validation `265/265 PASS`;
- temporal validation and `git diff --check` PASS;
- public facade `30`;
- one isolated Gemini File Search Store created;
- future OpenAI administrator activation path implemented and deterministically validated;
- OpenAI remained disabled/unconfigured and was not called.

Keep these product boundaries closed:

```text
Gemini File Search
  -> Meeting + Pitchbook/source materials

ChatGPT / OpenAI
  -> visible but deliberately disabled in this personal DEV
  -> future operator flow is already implemented

全文出力
  -> Meeting Google Docs full text
  -> optional Pitchbook reference metadata + Drive links only
```

## Strategy reset and authoritative findings

The CODEX-04 classification was too narrow. The live failure is not yet proven to be a retrieval-only defect.

Authoritative readback after CODEX-04 shows:

1. the Audit contains two `AI_QUERY / Failure / AI_HTTP_500` rows for the same Meeting search flow, 39 seconds apart, even though the report described one submitted search and no retry;
2. both synthetic Meeting rows have Gemini provider state `Failed` with no provider document ID, document name, content hash, indexed timestamp, or Store association;
3. multiple synthetic TXT Pitchbook rows also have Gemini provider state `Failed` with no provider document ID;
4. therefore no accepted evidence proves that either source type was indexed before the search was attempted;
5. the Store exists, but a Store existing is not evidence that it contains retrievable sources.

Do not classify Gemini itself as unavailable based only on the two HTTP 500 search outcomes. First establish the indexing state and exact transport failure.

## Active hypothesis

Use exactly one active hypothesis until contradicted:

> The primary blocker is the Gemini upload/index path and its loss of actionable error detail. The Meeting retrieval was attempted against a Store without accepted indexed source documents. A separate bounded retry gap also exists for transient 5xx responses because the direct REST client currently performs one request per call.

The first decisive action is to make one source index successfully with exact safe evidence. Do not begin another user-facing search before that gate passes.

## Required investigation and repair

### 1. Snapshot and reconcile current state

Before source changes or paid calls, capture a redacted read-only snapshot of:

- exact branch/head and Apps Script project/deployment identity;
- current private Web App version and access boundary;
- Gemini Store existence and safe document counts;
- Backend schema and provider-state columns;
- Meeting/Pitchbook provider states;
- Audit count and the two `AI_HTTP_500` records;
- Settings, with secret and Store ID values redacted;
- triggers and deployment/Library counts.

Do not place API keys, Store IDs, private URLs, raw provider payloads, or source bodies in GitHub/report/chat.

### 2. Reproduce the indexing failure without broad mutation

Use the smallest synthetic source:

1. one existing synthetic Meeting Google Doc;
2. only after Meeting indexing PASS, one existing small synthetic TXT Pitchbook.

Do not sync all 20 records merely to diagnose the first source.

Before any new search, prove for the Meeting:

- source body was read;
- content hash was produced;
- upload session request was issued with the current official Gemini File Search REST contract;
- upload/finalization operation completed;
- Store document readback contains exact `source_type=Meeting` and stable `source_id`;
- Backend Gemini provider state is `Indexed` and contains one derived document identity;
- no duplicate active document exists.

If indexing fails, stop before query and return the exact safe failure code and stage.

### 3. Repair error preservation

The current provider state/report collapses observed indexing failures to generic `AI_SYNC_FAILED`.

Preserve a safe, actionable stage/code without persisting raw error text or provider payloads. At minimum distinguish:

- Store read/create failure;
- upload-session start failure;
- upload finalization failure;
- operation polling/timeout/failure;
- document readback/normalization failure;
- source read/format/size failure;
- query HTTP failure;
- citation normalization failure.

Requirements:

- provider state `lastError` records safe code, attempt, retryability, and next-attempt time only;
- admin sync summary exposes safe per-provider/per-stage counts or codes;
- browser/Audit do not receive raw provider messages, Store IDs, source bodies, or credentials;
- no generic `AI_SYNC_FAILED` when the underlying transport stage is known.

### 4. Align Gemini upload transport to current official REST contract

Verify current official Gemini File Search documentation at execution time.

Inspect and test the exact resumable upload flow:

- start URL and Store resource path;
- `X-Goog-Upload-Protocol`, command, content length, and content type headers;
- start body fields accepted by the current API;
- extraction of the upload URL from Apps Script response headers;
- final upload offset, command, MIME type, and explicit byte length;
- operation resource normalization and polling;
- final File Search document normalization;
- custom metadata shape and stable-ID values.

Do not silently remove metadata or source identity. Do not upload authoritative Drive URLs or unnecessary private display metadata when stable IDs suffice.

### 5. Add bounded retry for transient Gemini REST failures

The direct Apps Script REST client must implement bounded exponential backoff with jitter for transient transport failures and HTTP:

```text
408, 429, 500, 502, 503, 504
```

Requirements:

- maximum `4` total attempts per idempotent query/read operation;
- honor a valid `Retry-After` value when available, otherwise exponential backoff + jitter;
- no retry for authentication, authorization, invalid model, invalid request/filter, or other non-retryable 4xx;
- one browser submit remains one application operation and produces one final `AI_QUERY` Audit result, not one row per internal transport attempt;
- retry telemetry is safe counts/codes only;
- do not retry Store creation in a way that can create duplicate Stores;
- for upload operations, retry only at a stage proven idempotent or reconcile by exact source identity before another upload.

### 6. Deterministic tests before another live attempt

Add focused regression coverage proving:

- Gemini upload start request matches the current official contract;
- final upload has correct MIME type and explicit byte length;
- upload URL header variants are normalized;
- operation polling and document extraction work;
- custom metadata contains exact `source_type` and `source_id`;
- known upload-stage failures preserve their safe code instead of `AI_SYNC_FAILED`;
- query `500 -> 503 -> success` returns success within the attempt cap;
- repeated transient failure stops at the cap;
- `400/401/403` are not retried;
- one application query produces one Audit outcome despite internal retries;
- Store creation is not duplicated;
- one source cannot have duplicate active provider documents;
- existing OpenAI activation tests continue to pass;
- OpenAI is never called in this runtime.

Run:

- focused tests;
- `npm run check`;
- temporal validator;
- public-surface validator;
- `git diff --check`;
- one final relevant-diff review for secrets/private IDs/unrelated changes.

No live call before deterministic PASS.

## Corrected source delivery

Only if source changed and deterministic validation passes:

- sync exact tested source once;
- exact source readback;
- create exactly one immutable Apps Script version;
- update the same positively identified private Web App in place;
- preserve Web app type, deploying-user execution, and `Only myself` access;
- do not create a new deployment;
- do not mutate Library deployments.

## Target-runtime qualification order

### Gate A — Meeting indexing

Run one bounded provider-neutral sync for one synthetic Meeting.

PASS requires Store document readback + Backend `Indexed` state + exact metadata + no duplicate.

### Gate B — Meeting retrieval

Submit one Meeting-filtered question through the normal Web App.

Internal transient retries are permitted under the new bounded policy. Do not issue a second browser submit.

PASS requires:

- answer returned;
- citation maps through `source_type + source_id` to the exact authoritative Meeting/Drive link;
- one final successful Audit row for the application operation;
- no duplicate failure/success Audit rows for the same submit.

### Gate C — Pitchbook indexing and retrieval

Index one small existing synthetic TXT Pitchbook, then submit one Pitchbook-filtered question.

PASS requires exact stable citation to that Pitchbook and authoritative Drive link.

### Gate D — filter and lifecycle

Using the same bounded synthetic sources, prove:

- exact metadata filter;
- update -> reindex without duplicate;
- Inactive exclusion/removal;
- Reactivate restoration;
- exact delete/rebuild;
- one active provider document per source.

Do not manufacture confidential data.

### Gate E — OpenAI and FULL_OUTPUT

- OpenAI remains disabled/unconfigured and is not live-called;
- accepted OpenAI safe-disabled/no-failover evidence remains valid;
- accepted FULL_OUTPUT evidence remains closed and is not rerun absent contradiction.

## Attempt limits and stop rules

- one corrected source sync/deployment maximum in this dispatch;
- one Meeting browser submit, with at most four internal transient attempts;
- one Pitchbook browser submit, with at most four internal transient attempts;
- no broad all-source sync before the two-source path passes;
- stop immediately if Meeting indexing fails after the correction;
- stop immediately on a non-retryable provider error;
- stop if the same post-repair failure repeats at the attempt cap;
- do not open a second production hypothesis without a Strategy Reset in the report.

## Final integrity

Prove:

- exactly five Backend sheets/schema `6`;
- authoritative Meeting/Pitchbook rows and Drive files unchanged except the explicitly bounded lifecycle status transitions that are restored to baseline;
- Gemini provider states accurately reflect final indexed sources;
- no duplicate active provider documents;
- OpenAI remains disabled and uncalled;
- `AI_SYNC_ENABLED=false` at completion;
- triggers `0`;
- Audit contains only bounded safe metadata and no questions, answers, chunks, source bodies, raw provider payloads, credentials, or private Store IDs;
- no permission, deployment-count, or Library mutation beyond one authorized in-place Web App update when source changed.

## Delivery

Create:

`docs/handoffs/0020-CODEX-05-gemini-indexing-transport-repair-and-final-qualification-report.md`

Update:

- `docs/handoffs/0020-report.md`;
- `docs/handoffs/0020-instruction.md`;
- `docs/handoffs/0020-dispatches.md`;
- PR `#26` body.

Commit and push all scoped changes. Keep PR `#26` Draft / Open / unmerged for ChatGPT final review.

On full PASS classify:

```text
DEV QUALIFIED — WORK 0020 AI PROVIDER CORE
LOGIC_VALIDATION: PASS
SCHEMA_ALIGNMENT: PASS
OPENAI_RUNTIME: SAFE_DISABLED_ERROR — deliberately deferred by user
GEMINI_RUNTIME: PASS
FULL_OUTPUT_RUNTIME: PASS
FINAL_INTEGRITY: PASS
READY: YES
BLOCKER: NO
```
