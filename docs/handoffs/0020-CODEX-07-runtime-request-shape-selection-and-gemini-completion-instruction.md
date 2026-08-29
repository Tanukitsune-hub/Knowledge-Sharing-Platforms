# Work 0020 — CODEX-07 runtime request-shape selection and Gemini completion

WORK_ID: `0020`
DISPATCH_ID: `0020-CODEX-07`
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

Complete Work 0020 by removing the false local upload-finalize gate, selecting an Apps-Script-compatible binary request shape without additional live attempts, and then finishing the already-defined Gemini Meeting + Pitchbook File Search qualification.

Do not redesign the provider-neutral architecture and do not split this outcome into another Work.

## Accepted evidence — closed absent material contradiction

CODEX-03:
- schema `6`, exactly five Backend sheets;
- FULL_OUTPUT runtime PASS;
- Preview / Copy / Google Docs / PDF canonical package parity PASS;
- disabled-provider safe errors/no-failover PASS;
- final integrity PASS.

CODEX-04:
- focused `17/17 PASS`, repository `265/265 PASS`;
- public facade `30`;
- one isolated Gemini File Search Store;
- future zero-code OpenAI administrator activation implemented and deterministically validated;
- OpenAI remained disabled and uncalled.

CODEX-05:
- focused transport/provider validation `68/68 PASS`, repository `274/274 PASS`;
- safe transport-stage error preservation and bounded retry hardening;
- exact source readback, immutable version `45`, same private Web App update.

CODEX-06:
- manual final-upload `Content-Length` removed;
- exact MIME type, bytes, offset `0`, and `upload, finalize` command preserved;
- focused transport `12/12 PASS`, AI-focused `78/78 PASS`, repository `277/277 PASS`;
- exact `78`-file source readback, immutable version `46`, same private Web App update;
- one bounded Meeting attempt stopped locally at `AI_UPLOAD_FINALIZE_REQUEST_INVALID / UPLOAD_FINALIZE_CLIENT` before any provider HTTP response;
- Backend stayed five sheets/schema 6, Meeting/Pitchbook counts 4/16, Audit 71, `AI_SYNC_ENABLED=false`, `OPENAI_ENABLED=false`, batch size restored to 10.

Do not rerun FULL_OUTPUT. Do not live-call OpenAI.

## Strategy Reset

### Closed conclusions

1. The direct Gemini `uploadToFileSearchStore` endpoint remains an official supported REST path.
2. Apps Script `UrlFetchApp.fetch` officially accepts `String`, byte-array, Blob, or JavaScript-object payloads.
3. `UrlFetchApp.getRequest()` is an inspection facility. Its returned object includes `payload`, but the official contract does not require the returned payload to preserve the caller's original runtime type/representation.
4. CODEX-06 made `getRequest()` a hard byte-for-byte projection gate before the real `fetch()`.
5. The deterministic test harness mirrors `options.payload` back unchanged, so it does not model possible target-runtime projection changes.
6. Consequently, `AI_UPLOAD_FINALIZE_REQUEST_INVALID` in CODEX-06 does not prove the corrected `fetch()` request itself is invalid. The production fetch was never reached.

### Active hypothesis — exactly one

> CODEX-06 is blocked by a false-negative request preflight: the target runtime projects the byte-array payload differently from the synthetic harness. Selecting a request shape based on non-mutating target-runtime `getRequest()` compatibility, without requiring projected payload byte identity, will allow exactly one real finalize request to reach Gemini.

Do not open a second live hypothesis in this dispatch.

## Fastest Safe Decisive Action

Use two local/non-mutating candidate request shapes over the same already-verified source bytes:

```text
Candidate A: payload = Apps Script Byte[]
Candidate B: payload = Blob built from the exact same bytes + MIME type
```

Evaluate candidates with `UrlFetchApp.getRequest()` only. Choose one compatible candidate. Then issue exactly one live final-upload request using the chosen candidate.

The candidate selection itself must not perform a provider call or mutate Backend/Store state.

## Required repair

### 1. Fix the preflight contract

Do not compare `getRequest().payload` byte-for-byte to the original Byte[].

Validate authoritative payload integrity directly from the candidate before projection:
- source byte length > 0 and within the existing 25MB product limit;
- exact byte values preserved;
- exact source MIME type preserved;
- request method `post`;
- `X-Goog-Upload-Offset: 0`;
- `X-Goog-Upload-Command: upload, finalize`;
- no manually supplied `Content-Length`.

`getRequest()` may be used to verify only stable request characteristics that the official Apps Script contract actually exposes:
- construction succeeds;
- method;
- effective content type;
- required X-Goog headers;
- absence of a caller-supplied restricted `Content-Length` in request options.

Do not require the projected payload's JavaScript type or byte-for-byte representation to equal the input Byte[].

### 2. Target-runtime candidate selection

Implement a private helper which:

1. builds Candidate A from the exact Byte[];
2. calls `UrlFetchApp.getRequest()` without logging/persisting the upload URL or payload;
3. if A is structurally compatible, selects A;
4. otherwise builds Candidate B as an Apps Script Blob from the same bytes/MIME type;
5. calls `getRequest()` for B;
6. if B is structurally compatible, selects B;
7. if neither can be constructed, fail locally with a safe specific code such as `AI_UPLOAD_FINALIZE_CLIENT_UNSUPPORTED`.

Do not call `fetch()` for both candidates. Exactly one candidate may be sent live.

No upload URL, API key, source body, Store ID, provider raw response, or candidate payload may be persisted in Backend/Audit/GitHub/report/browser.

### 3. Keep provider transport evidence distinct

After candidate selection:

- if `UrlFetchApp.fetch()` itself throws before an HTTP response, classify as local client transport;
- if an HTTP response exists, preserve safe HTTP status/stage without raw provider text;
- if the provider returns an operation, continue existing bounded polling;
- if a Document is produced, verify `source_type`, stable `source_id`, content hash, active state, and one-document identity.

Do not collapse a known stage to generic `AI_SYNC_FAILED`.

### 4. Deterministic regression coverage

Before source delivery, add tests proving:

- projected payload may be a different representation without causing false rejection;
- Byte[] candidate can be selected when `getRequest` accepts it;
- Blob candidate is selected when Byte[] candidate construction fails but Blob succeeds;
- both candidates failing produces one safe non-retryable client error and zero `fetch` finalization calls;
- exactly one finalization `fetch` occurs when a candidate is selected;
- original byte integrity and MIME type are validated before projection;
- no manual `Content-Length` is supplied;
- existing transient HTTP retry behavior remains bounded;
- existing one-application-query -> one-final-Audit contract remains PASS;
- no OpenAI call or fallback is introduced;
- all existing provider/admin/public-surface tests remain PASS.

Run:
- focused Gemini transport/provider tests;
- `npm run check`;
- temporal validator;
- public-surface validator;
- `git diff --check`;
- relevant diff review for secrets/private IDs/unrelated change.

No live call before deterministic PASS.

## Corrected source delivery

Only if source changes and deterministic validation passes:

- sync exact tested source once;
- exact source readback;
- create exactly one immutable Apps Script version;
- update the same positively identified private Web App in place;
- preserve Web app type, deploying-user execution, and `Only myself` access;
- no new deployment;
- no Library mutation.

## Target-runtime qualification

### Gate A — one Meeting indexing attempt

Temporarily bound selection to one existing synthetic Meeting using the existing reversible setting procedure.

The upload implementation may evaluate both request candidates locally, but may issue exactly one live finalize `fetch()`.

PASS requires:
- one selected compatible request shape;
- provider HTTP/operation path reached;
- one active File Search Document read back;
- exact `source_type=Meeting` and stable `source_id`;
- Backend Gemini provider state `Indexed` with content hash/indexed timestamp;
- no duplicate active provider document.

If Gate A still fails locally before provider HTTP, stop and report whether A/B construction failed. Do not retry or switch architecture in the same dispatch.

If Gate A returns a genuine provider HTTP/operation error, stop with exact safe status/stage. Do not retry outside the already-approved transient retry policy.

### Gate B — Meeting grounded query

Only after Gate A PASS:
- submit one Meeting-filtered query through the normal Web App;
- internal transient retry is allowed under the accepted bounded policy;
- one browser submit -> one final Audit outcome;
- citation maps through stable source identity to the authoritative Meeting/Drive link.

### Gate C — TXT Pitchbook indexing/query

Only after Gate B PASS:
- index one small existing synthetic TXT Pitchbook;
- verify exact active Document/stable metadata/no duplicate;
- submit one Pitchbook-filtered query;
- citation maps to the exact authoritative Pitchbook Drive link.

### Gate D — metadata/lifecycle

Using only the bounded synthetic Meeting/Pitchbook sources, prove:
- exact metadata filter;
- update -> reindex with no duplicate;
- Inactive exclusion/removal;
- Reactivate restoration;
- exact delete/rebuild;
- one active provider document per source.

Restore temporary source/status/settings changes to the accepted baseline where required.

### Gate E — final integrity

Prove:
- exactly five Backend sheets/schema `6`;
- authoritative Meeting/Pitchbook data intact apart from bounded restored lifecycle changes;
- provider states accurate;
- no duplicate active provider documents;
- `AI_SYNC_ENABLED=false`;
- `OPENAI_ENABLED=false` and OpenAI uncalled;
- triggers `0`;
- Audit contains safe metadata only;
- no new Store, deployment, Library, permission, or confidential-data mutation.

Accepted FULL_OUTPUT runtime PASS remains closed.

## Fallback boundary

Gemini officially supports both direct `uploadToFileSearchStore` and Files-API-then-`importFile` workflows. Do **not** implement the Files API/import fallback in CODEX-07.

Reason: after CODEX-06 the corrected direct final-upload `fetch()` has still never been executed. The current decisive test is to remove the false preflight gate and observe one real direct-upload result.

If CODEX-07 proves that both Apps Script request shapes are locally unsupported, or reaches a stable non-retryable direct-upload incompatibility, return to ChatGPT for a Strategy Reset before adopting Files API/import.

## Attempt limits / stop rules

- one corrected source sync/deployment maximum;
- one live Meeting finalize request maximum after local candidate selection;
- one Meeting browser submit only after Gate A PASS;
- one Pitchbook live index/query path only after Meeting PASS;
- no broad all-source sync;
- no OpenAI live call;
- no FULL_OUTPUT rerun;
- stop immediately at first new non-retryable Gate-A failure;
- do not open another architecture in the same dispatch.

## Delivery

Create:
`docs/handoffs/0020-CODEX-07-runtime-request-shape-selection-and-gemini-completion-report.md`

Update:
- `docs/handoffs/0020-report.md`;
- `docs/handoffs/0020-instruction.md`;
- `docs/handoffs/0020-dispatches.md`;
- PR `#26` body.

Commit/push all scoped changes. Keep PR #26 Draft / Open / unmerged for ChatGPT final review.

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
