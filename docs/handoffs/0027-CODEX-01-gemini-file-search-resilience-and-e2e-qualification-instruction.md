# Work 0027 — CODEX-01 Gemini File Search resilience and E2E qualification

WORK_ID: `0027`  
DISPATCH_ID: `0027-CODEX-01`  
BALL: `CODEX`  
STATUS: `READY`  
MODE: `BUILD`

## 1. Primary outcome

Make the smallest coherent repair supported by the new independent company-GAS evidence, then prove or safely bound one complete Gemini File Search path:

```text
GAS
-> Gemini Models
-> Interactions
-> temporary File Search Store
-> synthetic upload
-> indexing/poll
-> File Search answer
-> file_citation
-> cleanup
```

Terminal outcome must be exactly one of:

```text
QUALIFIED_DISABLED
DISABLED_TRANSIENT_PROVIDER_LIMITATION
BLOCKED_PRODUCT_DEFECT
```

## 2. Starting ref and GitHub authority

Repository:

`Tanukitsune-hub/Knowledge-Sharing-Platforms`

Branch:

`agent/0027-gemini-file-search-resilience`

Expected starting main:

`8c9be2392a1247ff81efc6a153fc0be449b1318b`

Execute the current GitHub branch head after verifying it contains this instruction. Do not reset or discard newer work.

Read the nearest `AGENTS.md` files, `docs/handoffs/0027-company-gas-gemini-smoke-evidence.md`, and all Work 0027 decision/planning/handoff files before editing.

## 3. Accepted evidence that must not be reopened

```text
WORK_0026: ACCEPTED / PR #36 merge 40bb7d40506c0839c35742ee0000d89650ff7ad6
PRIVATE_WEB_APP_VERSION_70_SHELL: PASS
OPENAI_AND_FULL_OUTPUT: ACCEPTED
GEMINI_ROUTE: hidden
COMPANY_GAS_GEMINI_MODELS: HTTP 200
COMPANY_GAS_GEMINI_3_8_INTERACTIONS: HTTP 200 PASS twice
COMPANY_GAS_FILE_SEARCH_STORE_CREATE_DELETE: HTTP 200
GENERATE_CONTENT_HIGH_DEMAND: HTTP 503 UNAVAILABLE / transient provider evidence
```

The independent diagnostic is user-supplied runtime evidence. Do not pretend it was executed by this repository.

## 4. Active hypothesis

Hypothesis:

The current product remains disabled because live mutating query call sites do not use the existing bounded retry mechanism and the accepted classifier still combines authentication with transient provider capacity. The current main upload shape should avoid the diagnostic's `Content-Length` failure because it lets `UrlFetchApp` set ordinary Content-Length automatically.

Confirming observations:

- `kspGeminiStartInteractionLive_`, `kspGeminiQueryInteractionLive_`, and `kspGeminiGenerateContentLive_` currently pass `retry:false`;
- 503 and authentication failures collapse into `HTTP_OR_CREDENTIAL_FAILURE`;
- upload finalization headers omit ordinary `Content-Length`.

Falsifying observations:

- target runtime reproduces an ordinary `Content-Length` error from current main;
- File Search fails at response parsing, citation identity, or source integrity after transient errors are excluded;
- a safe retry cannot be implemented without duplicate provider mutation.

If falsified, stop as `BLOCKED_PRODUCT_DEFECT`; do not open a second hypothesis in the same run.

## 5. Required pre-fix tests

Add focused failing tests before source changes for:

1. 503/UNAVAILABLE maps to `PROVIDER_OR_TRANSIENT_FAILURE`, not credential failure.
2. 401/403 plus auth/permission evidence maps to `AUTHENTICATION_OR_PERMISSION_FAILURE`.
3. 429/408/5xx retry; 400/401/403/404 do not.
4. valid `Retry-After` takes precedence.
5. maximum attempts and cumulative sleep budget are enforced.
6. an ambiguous network error on a mutating POST is not blindly replayed.
7. no Apps Script request option contains ordinary `Content-Length`.
8. resumable session start retains `X-Goog-Upload-Header-Content-Length`.
9. HTTP 200 GenerateContent with valid extracted text but missing expected token is a content mismatch, not connectivity failure.
10. empty/unexpected response, finish/safety limit, no answer, no citation, and citation mismatch remain distinct.
11. safe diagnostics never expose raw provider messages, credentials, private URLs/IDs, Store/document identities, prompts, or source bodies.

## 6. Minimal source repair

Likely source scope:

- `src/130_AiConstants.gs`
- `src/160_AiEnvironment.gs`
- `src/161_GeminiRestClient.gs`
- `src/164_AiProviderCore.gs`
- `src/165_AiProviderAdmin.gs`
- relevant focused tests
- generated `dist/` artifacts

Do not edit generated bundle files by hand.

### 6.1 Failure classification

Replace the coarse combined class for future observations with:

```text
AUTHENTICATION_OR_PERMISSION_FAILURE
PROVIDER_OR_TRANSIENT_FAILURE
MODEL_ACCESS_OR_UNSUPPORTED
```

Preserve the existing response/citation/application classes.

Historical Work 0026 evidence remains in Git history. New normalization may read the old value safely but must not emit it for new runtime results.

### 6.2 Retry policy

Transient status allowlist:

```text
408, 429, 500, 502, 503, 504
```

Client/permanent default:

```text
400, 401, 403, 404
```

Rules:

- `Retry-After` first;
- otherwise exponential backoff plus jitter;
- idempotent GET/POLL/DELETE: maximum 3 total attempts, cumulative sleep <= 20 seconds;
- Interaction or other mutating create: maximum 2 total attempts only after an explicit transient HTTP response and only when no provider resource identity was returned;
- do not retry an ambiguous network/timeout exception for a mutating create;
- no model fallback and no cross-provider fallback.

A 503 response may take tens of seconds before it arrives. Do not reuse the existing four-attempt default blindly for interactive calls.

### 6.3 Resumable upload

Do not set ordinary `Content-Length` in `UrlFetchApp` request headers.

Do not remove the required `X-Goog-Upload-Header-Content-Length` from upload-session initiation.

For finalize interruption or 5xx:

1. query the same upload session with `X-Goog-Upload-Command: query`;
2. read only safe status/received-offset headers;
3. if active and the offset is safe, resume/finalize at the server-reported offset at most once;
4. if already terminated/final, reconcile the exact expected synthetic document;
5. if state is ambiguous, stop instead of blindly resending.

Prevent duplicate documents by exact source metadata/content hash reconciliation.

### 6.4 GenerateContent diagnostics

Maintain separate evidence for:

```text
HTTP status
response structure
text extraction
normalized expected-token inclusion
finish/safety reason
empty/unexpected response
```

Do not convert HTTP 200 plus token mismatch into a network/credential error.

### 6.5 Safe telemetry

Use existing Audit metadata where possible. Add a non-secret correlation hash and the minimum stage/model/transport/status/provider-code/classification/attempt/elapsed/final-result fields.

Do not create a new log sheet unless existing storage cannot satisfy the requirement.

## 7. Deterministic validation

Run focused tests first, then:

```text
npm run check
npm run check:bundle
python tools/validate_agent_foundation.py
git diff --check
```

Build the bundle twice and prove byte identity. Run the repository secret scan and inspect the final diff for credentials, private URLs/IDs, provider messages, and synthetic source text beyond a harmless fixed token.

## 8. Source delivery and Web App boundary

Only after deterministic PASS:

1. deliver the exact tested modular source once;
2. read back every deployable source file;
3. create exactly one immutable version, expected `71`;
4. update the same private Web App exactly once from version 70 to 71;
5. do not create version 72 or higher;
6. verify root and Knowledge Search rendering/bootstrap, zero literal includes, and zero blocking console errors.

If shell/readback fails, stop before provider-resource mutation.

## 9. Synthetic target-runtime campaign

Use one harmless random-looking token generated for this run. Do not use confidential data or existing authoritative records.

Sequence:

1. Models API: verify `gemini-3.8-flash` visible.
2. Short Interactions: one minimal token response.
3. Create one temporary Store with a Work-0027-specific non-sensitive display name.
4. Upload one tiny TXT containing the unique token through the repaired production upload path.
5. Poll the returned operation using bounded one-GET polling.
6. Read back exactly one active document with expected synthetic metadata/content hash.
7. Query the token using `gemini-3.8-flash / explicit low / 2048`, Interactions, File Search, and exact metadata filter.
8. Require:
   - completed response;
   - extracted answer contains the normalized token;
   - at least one `file_citation`;
   - citation maps to the exact synthetic source metadata.
9. In `finally`, delete the temporary document if separately required and delete the temporary Store.
10. Read back cleanup where the API supports it.

No existing Store, `DOC-000017`, `MTG-000005`, six-format fixture, or production/company source may be changed.

## 10. Provider and mutation budgets

```text
MODELS_LIST: 1
SHORT_INTERACTIONS_LOGICAL_REQUEST: 1 plus only the authorized bounded transient retry
TEMP_STORE_CREATE: 1 logical request plus only the authorized bounded transient retry
TEMP_UPLOAD: 1 logical upload session
UPLOAD_FINALIZE_RESUME: max 1 after session query
INDEX_OPERATION_POLLS: existing bounded maximum, one GET per poll
FILE_SEARCH_LOGICAL_QUERY: 1 plus only the authorized bounded transient retry
TEMP_STORE_DELETE: 1 logical cleanup request plus bounded idempotent retry
SOURCE_DELIVERY: 1
IMMUTABLE_VERSION: 1 / expected 71
WEB_APP_UPDATE: 1
OPENAI_API_CALLS: 0
FULL_OUTPUT_LIVE_CALLS: 0
```

## 11. Terminal decision

### QUALIFIED_DISABLED

Use only if full synthetic upload/index/query/citation/cleanup passes. Keep Gemini hidden/disabled pending ChatGPT final review.

### DISABLED_TRANSIENT_PROVIDER_LIMITATION

Use only if exact 429/408/5xx provider evidence exhausts the bounded policy, no product defect is observed, and cleanup succeeds or the cleanup limitation is precisely recorded.

### BLOCKED_PRODUCT_DEFECT

Use for an application upload/header/parser/citation/source-integrity/idempotency/security defect or failed required cleanup caused by product code.

Do not relabel a product defect as transient provider behavior.

## 12. GitHub delivery

Keep the PR Draft/Open/unmerged.

Update:

- this CODEX-01 report;
- `docs/handoffs/0027-dispatches.md`;
- `docs/handoffs/0027-instruction.md`;
- `docs/planning/work0027-gemini-file-search-resilience-and-qualification.md`;
- `docs/planning/work-registry.md`;
- `docs/operations/runtime-artifact-locator.md`;
- PR body.

Commit and push the scoped result.

## 13. Required final return

The final chat response and report must begin and end with:

```text
WORK_ID: 0027
DISPATCH_ID: 0027-CODEX-01
BALL: CHATGPT
STATUS: RETURNED
```

Report exact branch/head, implementation commit, final commit, changed files, tests, version/deployment evidence, each E2E stage, safe retry counts/classes, cleanup, secret scan, blockers, and allowed terminal outcome.
