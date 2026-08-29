# Work 0020 — CODEX-08 direct Blob finalize and Gemini completion

WORK_ID: `0020`
DISPATCH_ID: `0020-CODEX-08`
BALL: `CODEX`
STATUS: `RETURNED / BLOCKER`
MODE: `INVESTIGATION / BUILD / QUALIFICATION`
ROUTE: `C`
RECOMMENDED_MODEL: `Sol High`

Repository: `Tanukitsune-hub/Knowledge-Sharing-Platforms`
Branch: `agent/0020-ai-provider-core`
Draft PR: `#26`
Exact execution ref: supplied by ChatGPT after control-document commits are complete.

## Primary outcome

Complete Work 0020 by proving one real Gemini File Search Meeting indexing path, then—only after that PASS—finish the bounded Meeting + Pitchbook retrieval/lifecycle qualification.

Do not redesign the provider-neutral product architecture and do not split this outcome into another Work.

## Accepted evidence — closed absent material contradiction

- CODEX-03: schema `6`, exactly five Backend sheets, FULL_OUTPUT runtime/canonical Preview-Copy-Docs-PDF parity PASS, disabled-provider/no-failover PASS, final integrity PASS.
- CODEX-04: focused `17/17`, repository `265/265` PASS, public facade `30`, one isolated Gemini Store, future zero-code OpenAI activation deterministic PASS; OpenAI disabled/uncalled.
- CODEX-05: focused `68/68`, repository `274/274` PASS, safe transport-stage errors, bounded transient retry, exact source readback, version `45`.
- CODEX-06: caller `Content-Length` removed, transport `12/12`, AI-focused `78/78`, repository `277/277` PASS, version `46`; Gate A stopped locally before provider response.
- CODEX-07: Byte[]/Blob candidate logic, transport `17/17`, focused AI/provider `41/41`, repository `282/282` PASS, exact source readback, version `47`; no accepted Meeting Document/Indexed state, provider HTTP status/body absent.

Do not rerun FULL_OUTPUT. Do not live-call OpenAI.

## Strategy Reset

### Newly authoritative source-state finding

Post-CODEX-07 Backend readback materially changes the diagnosis:

- the previously inspected synthetic Meeting is currently Gemini `Failed` with `retryable:false` and `permanent:true` for `AI_UPLOAD_FINALIZE_REQUEST_INVALID`;
- another prior failed Meeting is also permanent-failed;
- other existing synthetic Meetings remain Pending/eligible;
- `kspIsProviderAiWorkEligible_()` intentionally excludes permanent failed entries.

Therefore a provider-neutral sync can complete without reprocessing the stale permanent-failed Meeting. A stale unchanged error must never be accepted as evidence that a new finalize attempt ran.

CODEX-07 did not prove a new Gemini finalize call occurred merely because the old diagnostic remained.

### Other closed conclusions

1. Gemini `fileSearchStores/*:uploadToFileSearchStore` remains an official supported REST path.
2. Apps Script `UrlFetchApp.fetch()` officially accepts byte-array and Blob payloads.
3. `UrlFetchApp.getRequest()` is optional inspection, not a provider prerequisite.
4. Gemini Files API + `importFile` does not bypass this blocker because the temporary Files API upload also uses resumable `upload, finalize`.
5. Further production gating on `getRequest()` has no decision value.

### Active hypothesis — exactly one

> When CODEX-08 explicitly selects one currently eligible Pending/NotIndexed synthetic Meeting and removes `getRequest()` from the live prerequisite path, one direct Blob finalize will either create an ACTIVE Gemini document or finally yield a genuine local/provider transport result.

Do not open another live hypothesis in this dispatch.

## Fastest Safe Decisive Action

### Gate 0 — prove an eligible source is actually selected

Before any source delivery or live Gemini call:

1. read current Meeting provider states;
2. choose exactly one Active synthetic Meeting whose Gemini provider state is `Pending` or `NotIndexed` and is currently eligible under the real selection logic;
3. do **not** use a `Failed/permanent` source merely because it was used in an earlier dispatch;
4. set/confirm the guarded batch size so exactly one eligible source is selected;
5. run the same selection logic without provider mutation and prove `selected=1` for a Meeting;
6. record only safe/redacted evidence that one eligible Meeting was selected; do not persist the stable source ID in GitHub/report/chat.

If there is no eligible Pending/NotIndexed synthetic Meeting, a bounded fallback is authorized: reset **only Gemini-derived AI state** for one existing synthetic Meeting through the existing provider-state contract to `NotIndexed` with blank provider document identity/indexed timestamp/content hash/lastError, including the existing Gemini legacy mirror fields. Do not modify any authoritative Meeting content/metadata. Read back the reset and prove selection before continuing.

A sync returning with the old permanent-failure diagnostic unchanged is **NOT Gate-A evidence**.

### Gate 1 — direct Blob finalize

For the selected eligible Meeting only:

1. validate canonical source bytes, byte count, MIME type, and existing 25MB limit directly;
2. build exactly one Apps Script Blob from those exact bytes/MIME type;
3. start the existing official resumable File Search upload session;
4. treat the provider-issued upload URL as opaque;
5. make exactly one real final request with the Blob;
6. do not call `UrlFetchApp.getRequest()` as a prerequisite;
7. do not manually supply `Content-Length`;
8. preserve `X-Goog-Upload-Offset: 0` and `X-Goog-Upload-Command: upload, finalize`;
9. set `escaping:false` if needed to preserve the provider-issued URL;
10. prove through safe run-local evidence that the finalize `fetch()` was actually invoked exactly once.

No Byte[] live A/B test. Blob is the only live representation in this dispatch.

## Required implementation

### Remove production hard preflight

The live upload path must not require `UrlFetchApp.getRequest()` to succeed. A private deterministic inspection helper may remain, but it cannot gate live execution, be public, or persist upload URLs/payloads/secrets.

### Blob integrity

Validate authoritative bytes before projection/network:
- non-empty and <=25MB;
- exact byte values preserved by Blob readback;
- canonical MIME type preserved;
- bounded display name.

Do not stringify, base64-wrap, or re-encode an already-built canonical binary source.

### Final request

```text
method: POST
payload: exact Blob
X-Goog-Upload-Offset: 0
X-Goog-Upload-Command: upload, finalize
muteHttpExceptions: true
no caller Content-Length
opaque upload URL; escaping:false if required
```

Do not append the API key to the provider-issued upload URL unless the official session contract requires it.

### Safe result classification

- local `fetch()` exception before response -> `AI_UPLOAD_FINALIZE_CLIENT_FAILED / UPLOAD_FINALIZE_CLIENT`; no raw exception text; STOP.
- provider HTTP non-2xx -> `AI_UPLOAD_FINALIZE_FAILED / UPLOAD_FINALIZE_HTTP`; retain numeric status in bounded execution evidence only; no raw response persistence; STOP after this one Gate-A session.
- provider HTTP 2xx -> parse/poll bounded operation, require success, read ACTIVE File Search Document, verify exact `source_type`, `source_id`, `content_hash`, update Backend Gemini provider state to `Indexed`, and prove one active document only.

Do not infer success/failure from a pre-existing Backend error. Gate A PASS/FAIL must be tied to this dispatch's selected source and run-local finalize evidence.

## Deterministic validation before live execution

At minimum prove:

- permanent-failed source is not selected by normal eligibility logic;
- Pending/NotIndexed source is selected;
- guarded fallback provider-state reset, if used, touches derived Gemini state only and then makes the source eligible;
- live upload path never calls `getRequest()`;
- exact Blob bytes/MIME preserved;
- no caller `Content-Length`;
- offset `0`, `upload, finalize`, opaque URL handling;
- one selected source -> one finalize `fetch()`;
- stale provider error cannot be interpreted as a new run result;
- local exception and provider HTTP errors receive safe distinct codes;
- 2xx operation -> ACTIVE document -> exact stable metadata;
- OpenAI/future activation tests stay green;
- no Gemini-to-OpenAI failover;
- public facade remains expected.

Run focused Gemini transport tests, focused AI/provider tests, `npm run check`, temporal/public-surface validators, `git diff --check`, and final relevant-diff/secret review. No live call before PASS.

## Corrected source delivery

Only after deterministic PASS:
- sync exact tested source once and read it back;
- create exactly one immutable Apps Script version;
- update the same positively identified private Web App in place;
- preserve execution/access/deployment/Library boundaries;
- do not create a new deployment or Gemini Store.

## Target-runtime qualification

### Gate A — Meeting indexing

Use Gate-0-selected eligible synthetic Meeting. One provider-neutral admin sync action only.

PASS requires all of:
- selected Meeting count exactly one;
- real Blob finalize `fetch()` invoked exactly once in this dispatch;
- provider HTTP 2xx + successful operation;
- one ACTIVE Document read back;
- exact Meeting stable metadata;
- Backend Gemini state `Indexed`;
- no duplicate active document.

If any requirement fails, STOP. Do not continue to query/Pitchbook gates.

### Gate B — Meeting grounded query

Only after Gate A PASS: one Meeting-filtered Web App query; require grounded answer, authoritative Meeting citation/Drive link, one application operation -> one final Audit outcome, no failover.

### Gate C — one small TXT Pitchbook

Only after Gate B PASS: index one existing small synthetic TXT Pitchbook, prove ACTIVE/Indexed/exact metadata, run one Pitchbook-filtered query, require authoritative Pitchbook citation/Drive link.

### Gate D — filter/lifecycle

Using only bounded synthetic sources, prove exact metadata filter; update -> reindex without duplicate; Inactive removal/exclusion; Reactivate restoration; exact delete/rebuild; one active Gemini document per source.

### Gate E — final integrity

Prove five Backend sheets/schema `6`; authoritative source data restored except intended provider-derived state; `AI_SYNC_ENABLED=false`; batch size restored exactly; `OPENAI_ENABLED=false` and OpenAI uncalled; FULL_OUTPUT accepted evidence unchanged; triggers `0`; Audit remains safe/redacted; no new Store/deployment/Library/permission/confidential-data mutation.

## Attempt limits / Strategy Reset

- one corrected source delivery maximum;
- one live Meeting final-upload attempt before any query;
- no Byte[] live fallback;
- no Files API/importFile fallback in this dispatch;
- stop on first Gate-A failure;
- if Blob `fetch()` itself throws locally before provider response, classify Apps Script direct resumable transport as incompatible and return for architectural Strategy Reset;
- if a real provider HTTP/operation error appears, return that exact safe evidence; do not open another hypothesis in the same run.

## Delivery

Create `docs/handoffs/0020-CODEX-08-direct-blob-finalize-and-gemini-completion-report.md` and update `0020-report.md`, `0020-instruction.md`, `0020-dispatches.md`, and PR #26. Commit/push scoped changes. Keep PR #26 Draft / Open / unmerged.

On full PASS:

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
