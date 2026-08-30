# Work 0020 — CODEX-06 Apps Script upload-finalize transport repair and completion

WORK_ID: `0020`
DISPATCH_ID: `0020-CODEX-06`
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

Complete Work 0020 by repairing the Apps Script-specific Gemini upload-finalization request, then finish the already-defined Meeting and Pitchbook File Search qualification without reopening accepted work.

## Accepted evidence — do not reopen absent material contradiction

- CODEX-03: schema `6`, exactly five Backend sheets, FULL_OUTPUT runtime PASS, canonical Preview/Copy/Docs/PDF package parity, disabled-provider/no-failover behavior, and final integrity PASS.
- CODEX-04: focused `17/17 PASS`, repository `265/265 PASS`, public facade `30`, one isolated Gemini Store, and future zero-code OpenAI administrator activation path.
- CODEX-05: focused `68/68 PASS`, repository `274/274 PASS`, temporal/public-surface/diff checks PASS, exact source readback, immutable version `45`, same private Web App updated in place, and a one-Meeting Gate-A attempt that stopped precisely at `AI_UPLOAD_FINALIZE_FAILED / UPLOAD_FINALIZE` before any query.
- OpenAI remains deliberately disabled/unconfigured and must not be live-called.
- FULL_OUTPUT remains closed and must not be rerun absent contradiction.

Current authoritative source state:

```text
Meeting target
  Gemini status: Failed
  safe code: AI_UPLOAD_FINALIZE_FAILED
  safe stage: UPLOAD_FINALIZE
  provider document identity: absent
  indexed timestamp/content hash: absent

Pitchbook sources
  unchanged by CODEX-05

Settings
  restored to baseline
  AI_SYNC_ENABLED=false
  OPENAI_ENABLED=false

Triggers
  0
```

## Strategy Reset

### Active hypothesis

Use exactly one active hypothesis until contradicted:

> The finalize request fails locally in Apps Script before a provider HTTP response is available because the implementation manually supplies the restricted `Content-Length` header. `UrlFetchApp` derives the HTTP content length from the payload itself. The observed `raw provider message: absent` and the current explicit header are consistent with a client-side request-construction failure.

This is a high-confidence hypothesis, not accepted proof. Prove or disprove it through a deterministic Apps Script request preflight and one bounded live Meeting upload.

### Fastest safe decisive action

1. remove manually supplied `Content-Length` from the final upload request;
2. pass the exact payload bytes or Blob with the intended MIME type and let `UrlFetchApp` calculate transport length;
3. preflight the exact request with `UrlFetchApp.getRequest()` before a live call;
4. distinguish local Apps Script request-construction errors from provider HTTP responses;
5. run one Meeting indexing gate.

Do not switch to another upload architecture before this decisive action is tested.

## Required source repair

### 1. Finalize request contract

For the Gemini resumable-upload final step:

- keep method `POST`;
- keep the upload-session URL returned by the start response;
- keep `X-Goog-Upload-Offset: 0`;
- keep `X-Goog-Upload-Command: upload, finalize`;
- keep the exact source MIME type;
- keep the exact source bytes;
- remove any manually supplied `Content-Length` header;
- do not convert the request to multipart/form-data;
- do not stringify or base64-encode the source bytes;
- do not expose the upload URL, API key, source body, private IDs, or payload in browser/Audit/report/GitHub.

Use a Blob when it is the least ambiguous Apps Script representation; otherwise use the exact Byte[] contract. In either case, validate that the request body corresponds to the source byte length without relying on a user-supplied transport header.

### 2. Request preflight

Before the live attempt, use `UrlFetchApp.getRequest(uploadUrl, options)` or an equivalent deterministic adapter projection to prove safely:

- method is POST;
- content type equals the source MIME type;
- X-Goog upload offset/command are exact;
- payload exists and matches the expected byte length;
- no manual `Content-Length` header is present;
- no Authorization or API-key value is returned to logs/tests/reports;
- no upload URL/private resource identifier is persisted.

Tests may use synthetic URLs/bytes only.

### 3. Error classification

Do not collapse a local request-construction exception into a provider transport failure.

At minimum preserve safe distinctions:

```text
AI_UPLOAD_FINALIZE_REQUEST_INVALID
  stage: UPLOAD_FINALIZE_CLIENT

AI_UPLOAD_FINALIZE_FAILED
  stage: UPLOAD_FINALIZE_HTTP
  httpStatus: safe numeric status when actually observed
```

Requirements:

- no raw provider or Apps Script exception text in Backend, browser, Audit, or report;
- safe state may include code, stage, attempt, retryability, and next-attempt time;
- a local client request error is non-retryable until source changes;
- a real retryable provider HTTP error follows the bounded retry policy already implemented;
- do not open a second upload session blindly after an ambiguous finalize outcome without first reconciling exact source identity in the Store.

### 4. Preserve completed CODEX-05 hardening

Retain:

- bounded retry for idempotent transient Gemini REST calls;
- one application query -> one final Audit outcome;
- exact provider-stage error preservation;
- no duplicate Store creation;
- no duplicate active provider document;
- stable-ID-first metadata/citations;
- OpenAI dormant administrator activation path.

## Deterministic validation

Before another live call, add or amend focused tests proving:

- final upload request contains no manual `Content-Length` header;
- method, MIME type, offset, command, and exact payload bytes remain correct;
- synthetic `getRequest`/projection preflight passes;
- local request-construction error maps to `AI_UPLOAD_FINALIZE_REQUEST_INVALID / UPLOAD_FINALIZE_CLIENT` and is not retried;
- actual provider `408/429/500/502/503/504` remains bounded-retryable;
- actual non-retryable `400/401/403` is not retried;
- ambiguous finalize failure reconciles by exact source identity before another upload session;
- no secret/private URL/source body appears in safe diagnostics;
- existing Gemini transport, provider-core, OpenAI-admin, FULL_OUTPUT, temporal, and public-surface tests remain PASS.

Run:

- focused tests;
- `npm run check`;
- temporal validator;
- public-surface validator — remain `30` unless a directly necessary facade change is justified;
- `git diff --check`;
- final relevant-diff review for secrets/private identifiers/unrelated changes.

No live call before deterministic PASS.

## Source delivery

Only if source changes and deterministic validation passes:

- sync exact tested source once;
- exact source readback;
- create exactly one immutable Apps Script version;
- update the same positively identified private Web App in place;
- preserve Web app type, deploying-user execution, and `Only myself` access;
- do not create a new deployment;
- do not mutate Library deployments.

## Target-runtime qualification

### Gate A — one Meeting indexing

Use the same smallest existing synthetic Meeting target.

- temporarily bound provider-neutral sync to one source;
- restore the original setting exactly afterward;
- run one finalize attempt under the corrected transport;
- reconcile the Store by exact `source_type=Meeting` + stable `source_id`;
- PASS only when one Store document exists, Backend Gemini state is `Indexed`, provider identity and content hash are present, and no duplicate active document exists.

If Gate A still fails:

- stop before query;
- report whether it was a local client error or an observed provider HTTP/operation error;
- do not repeat the same live attempt;
- do not switch to Files API/import in this dispatch without another Strategy Reset.

### Gate B — Meeting grounded query

Only after Gate A PASS:

- submit one Meeting-filtered question through the normal Web App;
- permit only internal bounded retry under the accepted policy;
- do not perform a second browser submit;
- require an answer plus stable citation to the exact Meeting and authoritative Drive link;
- require exactly one final application-level Audit result.

### Gate C — one small TXT Pitchbook

Only after Meeting query PASS:

- index one existing small synthetic TXT Pitchbook;
- prove Store document + Backend Indexed state + no duplicate;
- submit one Pitchbook-filtered question;
- require answer and stable citation to the exact Pitchbook/Drive link.

### Gate D — exact filter and lifecycle

Using only the same bounded synthetic sources, prove:

- exact metadata filter;
- update -> reindex without duplicate;
- Inactive exclusion/removal;
- Reactivate restoration;
- exact delete/rebuild;
- one active Gemini document per source.

Restore authoritative source/status values to their accepted baseline when the lifecycle test completes.

### Gate E — closed routes

- OpenAI stays disabled and is not called;
- accepted OpenAI safe-disabled/no-failover evidence remains valid;
- accepted FULL_OUTPUT evidence remains valid and is not rerun.

## Attempt limits and stop rules

- one corrected source synchronization/deployment maximum;
- one live Meeting finalize attempt;
- one Meeting browser submit after indexing PASS;
- one live Pitchbook finalize attempt after Meeting query PASS;
- one Pitchbook browser submit after Pitchbook indexing PASS;
- no broad all-source sync;
- stop on the first post-repair Gate-A failure;
- stop on any non-retryable provider/auth/model/configuration error;
- preserve accepted evidence and do not reopen unrelated architecture.

## Final integrity

Prove:

- exactly five Backend sheets/schema `6`;
- authoritative Meeting/Pitchbook rows and Drive files unchanged except bounded AI-derived state and restored lifecycle status;
- Gemini provider states accurately reflect final indexed test sources;
- no duplicate active provider document;
- OpenAI remains disabled and uncalled;
- `AI_SYNC_ENABLED=false`;
- triggers `0`;
- safe Audit metadata only, with no questions, answers, chunks, source bodies, raw provider payloads, credentials, upload URLs, or Store IDs;
- no unexpected permission, deployment-count, or Library mutation.

## Fallback boundary

If removing the manual `Content-Length` header yields a genuine provider HTTP/operation failure, stop with that exact safe evidence. A later Strategy Reset may adopt the official Files API upload + File Search Store import path, but CODEX-06 must not mix both upload architectures in one evidence campaign.

## Delivery

Create:

`docs/handoffs/0020-CODEX-06-apps-script-content-length-finalize-repair-and-completion-report.md`

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
