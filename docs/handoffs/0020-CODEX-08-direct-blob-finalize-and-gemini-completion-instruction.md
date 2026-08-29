# Work 0020 — CODEX-08 direct Blob finalize and Gemini completion

WORK_ID: `0020`
DISPATCH_ID: `0020-CODEX-08`
BALL: `CODEX`
STATUS: `READY`
MODE: `INVESTIGATION / BUILD / QUALIFICATION`
ROUTE: `C`
RECOMMENDED_MODEL: `Sol High`

Repository: `Tanukitsune-hub/Knowledge-Sharing-Platforms`
Branch: `agent/0020-ai-provider-core`
Draft PR: `#26`
Exact execution ref: supplied by ChatGPT after control-document commits are complete.

## Primary outcome

Complete Work 0020 by removing the remaining self-imposed Apps Script request-inspection blocker, issuing exactly one real Gemini File Search finalize request with an officially supported Blob payload, and—only after Meeting indexing passes—completing the already-defined Meeting + Pitchbook retrieval/lifecycle qualification.

Do not redesign the provider-neutral product architecture and do not split this outcome into another Work.

## Accepted evidence — closed absent material contradiction

### CODEX-03
- schema `6`, exactly five Backend sheets;
- FULL_OUTPUT runtime PASS;
- Preview / Copy / Google Docs / PDF canonical package parity PASS;
- disabled-provider safe errors/no-failover PASS;
- final integrity PASS.

### CODEX-04
- focused `17/17 PASS`, repository `265/265 PASS`;
- public facade `30`;
- one isolated Gemini File Search Store;
- future zero-code OpenAI administrator activation implemented and deterministically validated;
- OpenAI remained disabled and uncalled.

### CODEX-05
- focused `68/68 PASS`, repository `274/274 PASS`;
- safe provider transport-stage error preservation;
- bounded retry hardening for transient idempotent requests;
- exact source readback, immutable Apps Script version `45`, same private Web App update.

### CODEX-06
- caller-supplied final-upload `Content-Length` removed;
- focused transport `12/12 PASS`, AI-focused `78/78 PASS`, repository `277/277 PASS`;
- exact source readback, version `46`, same private Web App update;
- Gate A stopped locally before provider HTTP due to request preflight.

### CODEX-07
- Byte[] / Blob candidate-selection logic implemented;
- transport `17/17 PASS`, focused AI/provider `41/41 PASS`, repository `282/282 PASS`;
- exact `78`-file source sync/readback, immutable version `47`, same private Web App update;
- one bounded manual sync produced no accepted Gemini Meeting Document / Backend `Indexed` state;
- safe diagnostic remained `AI_UPLOAD_FINALIZE_REQUEST_INVALID / UPLOAD_FINALIZE_CLIENT` with provider HTTP status/body absent;
- Backend stayed five sheets/schema 6, source row counts unchanged, batch size restored to `10`, Audit unchanged, `AI_SYNC_ENABLED=false`, `OPENAI_ENABLED=false`.

Do not rerun FULL_OUTPUT. Do not live-call OpenAI.

## Strategy Reset

### Closed conclusions

1. Gemini `fileSearchStores/*:uploadToFileSearchStore` remains an official supported REST indexing path.
2. Apps Script `UrlFetchApp.fetch(url, params)` officially accepts byte-array and Blob payloads.
3. `UrlFetchApp.getRequest()` is an optional inspection facility; it is not a provider requirement and is not required before `fetch()`.
4. CODEX-06 and CODEX-07 both allowed the local `getRequest()` compatibility/preflight layer to prevent the actual corrected final `UrlFetchApp.fetch()` from being proven.
5. Provider HTTP status/body remained absent. Therefore neither dispatch proved that Gemini rejected the corrected post-`Content-Length` request.
6. Gemini's alternative `Files API -> fileSearchStores.importFile` path does not avoid this transport layer: uploading the temporary Gemini File also uses the same resumable `upload, finalize` pattern. It is not a useful escape route for the current Apps Script finalize problem.
7. After repeated bounded attempts, further refinements to `getRequest()` as a production gate have negative decision value. Stop using inspection as a prerequisite for the live send.

### Active hypothesis — exactly one

> The remaining blocker is the production-side `getRequest()`/candidate preflight itself. Building one exact Blob from the already-validated source bytes/MIME type and passing it directly to `UrlFetchApp.fetch()`—without any hard `getRequest()` gate—will either produce an accepted Gemini upload operation or, for the first time, yield a genuine provider HTTP/operation error that changes the next decision.

Do not open a second live hypothesis in this dispatch.

## Fastest Safe Decisive Action

For the selected synthetic Meeting only:

1. validate the source bytes, byte count, MIME type, and 25MB product limit directly;
2. build exactly one Apps Script Blob from those exact bytes using the source MIME type and bounded display name;
3. start the existing official resumable File Search upload session;
4. use the provider-issued upload URL as an opaque URL;
5. issue exactly one real final request using the Blob payload;
6. do not call `UrlFetchApp.getRequest()` as a precondition;
7. do not manually supply `Content-Length`;
8. preserve `X-Goog-Upload-Offset: 0` and `X-Goog-Upload-Command: upload, finalize`;
9. set `escaping:false` for the provider-issued upload URL if required to preserve it byte-for-byte as an opaque URL under Apps Script's URL escaping behavior;
10. classify the actual result.

No Byte[] vs Blob live A/B test. Blob is the single live representation for CODEX-08.

## Required implementation

### 1. Remove production hard preflight

The live Gemini upload path must not require `UrlFetchApp.getRequest()` to succeed.

You may retain a private/test-only helper for deterministic request-shape inspection, but:
- it must not run in the target-runtime production indexing path;
- it must not determine whether `fetch()` is allowed;
- it must not be exposed publicly;
- it must not log/persist upload URLs, payloads, credentials, or source bodies.

Delete dead candidate-selection complexity if it has no remaining product value after this reset.

### 2. One authoritative Blob construction

Build the finalize payload from the already-normalized source bytes:

- exact byte values preserved;
- byte count > 0;
- <= existing 25MB product limit;
- MIME type exactly the canonical AI source MIME type;
- bounded display name;
- Blob byte readback and MIME integrity may be checked directly before network mutation.

Do not stringify binary content. Do not base64-wrap it. Do not re-encode text after the canonical source builder has already produced the source payload.

### 3. Finalize request

Use the official resumable-session result and make one final request with:

```text
method: POST
payload: exact Blob
X-Goog-Upload-Offset: 0
X-Goog-Upload-Command: upload, finalize
muteHttpExceptions: true
no caller Content-Length
```

Use the upload URL as an opaque provider-issued URL. If the current Apps Script default URL escaping could transform reserved characters, set `escaping:false` on this request and cover that in deterministic tests.

Do not append the API key to the provider-issued upload URL unless the official session contract explicitly requires it. Preserve the authorization/session semantics returned by the upload-start request.

### 4. Result classification

This dispatch must finally distinguish:

#### Local `UrlFetchApp.fetch()` exception before provider response
Return a safe code such as:

`AI_UPLOAD_FINALIZE_CLIENT_FAILED / UPLOAD_FINALIZE_CLIENT`

Include no raw exception text in browser/Audit/GitHub/report. Treat it as non-retryable within this dispatch and STOP after the single live attempt.

#### Provider HTTP non-2xx
Capture the numeric HTTP status in ephemeral execution evidence and return a safe stage/code such as:

`AI_UPLOAD_FINALIZE_FAILED / UPLOAD_FINALIZE_HTTP`

Do not persist or expose raw provider response text. Follow existing retry policy only where the operation is proven idempotent/reconcilable; do not create duplicate documents. For this Gate-A one-attempt qualification, do not initiate another full upload session after the first final response.

#### Provider HTTP 2xx
- parse the returned long-running operation;
- poll within the already-bounded operation contract;
- require operation success;
- resolve the resulting File Search Document;
- authoritative readback must show ACTIVE state and exact `source_type`, `source_id`, and `content_hash` metadata;
- Backend Gemini provider state must become `Indexed` with one provider document identity and indexed timestamp;
- prove no duplicate active Gemini document for that stable source.

## Deterministic validation before live execution

Update focused tests so they prove actual product behavior rather than a fake `getRequest()` representation.

At minimum prove:

- live upload path never calls `UrlFetchApp.getRequest()`;
- exact Blob bytes and MIME are preserved;
- no caller `Content-Length` exists;
- finalize request has offset `0` and command `upload, finalize`;
- opaque upload URL is passed unchanged and `escaping:false` is used if the implementation requires it;
- one source causes one finalize `fetch()` call;
- local fetch exception -> safe local client code, no raw exception leak;
- provider 400/401/403 -> safe non-retryable HTTP classification;
- provider 408/429/500/502/503/504 -> safe transient classification consistent with existing bounded retry/reconciliation contract, with no duplicate upload session/document behavior;
- provider 2xx operation flow -> poll -> ACTIVE document -> exact stable metadata;
- provider state keeps safe code/stage/attempt only;
- OpenAI path and future activation tests remain green;
- no Gemini-to-OpenAI fallback;
- public facade remains expected.

Run:

- focused Gemini transport tests;
- focused AI/provider tests;
- `npm run check`;
- temporal validator;
- public-surface validator;
- `git diff --check`;
- final relevant diff review for secrets/private IDs/unrelated changes.

No live call before deterministic PASS.

## Corrected source delivery

Only if source changes and deterministic validation passes:

- confirm branch still matches the authorized exact ref ancestry;
- sync exact tested source once;
- exact source readback;
- create exactly one immutable Apps Script version;
- update the same positively identified private Web App in place;
- preserve Web app type, deploying-user execution, `Only myself` access, `/exec`, deployment count, and Library separation;
- do not create a new deployment or Store.

## Target-runtime qualification

### Gate A — one Meeting indexing

Temporarily bound sync to exactly one existing synthetic Meeting using the existing guarded batch-size mechanism. Restore exact original value/type after the attempt.

Run one provider-neutral admin sync action.

PASS requires:
- the real Blob finalize `fetch()` was invoked exactly once;
- provider HTTP 2xx / successful operation observed;
- one ACTIVE File Search Document read back;
- exact Meeting `source_type`, stable `source_id`, `content_hash` metadata;
- Backend Gemini provider state `Indexed`;
- no duplicate active provider document.

If Gate A fails at a local fetch exception, provider HTTP error, operation error, or document-readback error: STOP and return that exact safe stage/status. Do not continue to query/Pitchbook gates.

### Gate B — Meeting grounded query

Only after Gate A PASS, submit one Meeting-filtered question through the normal Web App.

PASS requires:
- grounded answer;
- citation maps via stable source identity to the exact authoritative Meeting/Drive link;
- one application operation -> one final Audit outcome;
- no provider failover.

### Gate C — one small TXT Pitchbook

Only after Gate B PASS:
- index one existing small synthetic TXT Pitchbook;
- prove ACTIVE document + exact stable metadata + Backend Indexed state;
- submit one Pitchbook-filtered query;
- require authoritative Pitchbook citation/Drive link.

### Gate D — filter and lifecycle

Using only the already-bounded synthetic sources, prove:
- exact metadata filter;
- update -> reindex without duplicate;
- Inactive exclusion/removal;
- Reactivate restoration;
- exact delete/rebuild;
- one active Gemini document per source.

### Gate E — final integrity

Prove:
- exactly five Backend sheets/schema `6`;
- authoritative source rows/Drive files restored to baseline except intended provider-derived state;
- `AI_SYNC_ENABLED=false`;
- batch size restored exactly;
- `OPENAI_ENABLED=false`, OpenAI uncalled;
- FULL_OUTPUT accepted evidence remains unchanged and was not rerun absent contradiction;
- triggers `0`;
- Audit contains only bounded safe metadata, no questions/answers/chunks/source bodies/raw payloads/credentials/Store IDs/upload URLs;
- no new Store, Web App deployment, Library, permission, or confidential-data mutation.

## Attempt limits and Strategy Reset

- one corrected source synchronization/deployment maximum;
- exactly one live Meeting final-upload attempt before any query;
- no Byte[] live fallback after Blob failure;
- no Files API/importFile fallback in the same dispatch because it shares the same resumable upload transport;
- stop on first Gate-A failure;
- if direct Blob `fetch()` still throws locally before a provider response, classify the Apps Script runtime transport as incompatible for this path and return for an architectural Strategy Reset rather than another header/preflight iteration;
- if a genuine provider HTTP/operation error appears, return that evidence; do not invent another hypothesis in the same run.

## Delivery

Create:

`docs/handoffs/0020-CODEX-08-direct-blob-finalize-and-gemini-completion-report.md`

Update:
- `docs/handoffs/0020-report.md`;
- `docs/handoffs/0020-instruction.md`;
- `docs/handoffs/0020-dispatches.md`;
- PR `#26` body.

Commit and push all scoped changes. Keep PR #26 Draft / Open / unmerged for ChatGPT final review.

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
