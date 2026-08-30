# Work 0020 CODEX-16 — Direct Gemini provider control qualification

WORK_ID: `0020`
DISPATCH_ID: `0020-CODEX-16`
BALL: `USER`
STATUS: `ACTION_REQUIRED`
MODE: `QUALIFICATION`
ROUTE: `C` after the secret prerequisite is satisfied

## Primary outcome

Determine, without another application architecture change, whether the remaining failure is caused by:

1. the current Google project/API credential or base Gemini model access;
2. Gemini File Search generally;
3. the existing File Search Store;
4. metadata filtering;
5. the `gemini-embedding-2` Store path; or
6. Apps Script / `UrlFetchApp` integration.

Return one evidence-backed classification and the cheapest decisive next action. Do not attempt another speculative product implementation in this dispatch.

## Accepted evidence — closed

Preserve the accepted Work 0020 evidence:

- schema `6` and exactly five Backend sheets;
- FULL_OUTPUT runtime/canonical parity PASS; do not rerun;
- OpenAI disabled and uncalled; no automatic provider failover;
- Gemini document upload/reconciliation PASS;
- one Meeting query previously completed with three authoritative citations;
- CODEX-14 request profile, short START/POLL lifecycle, duplicate suppression, reload resume, and pending-state UX PASS;
- CODEX-14 Interactions + File Search remained provider-pending for at least `600000ms`;
- CODEX-15 Generate Content + File Search returned the safe service-unavailable category after `83364ms` with zero citations;
- CODEX-15 deterministic validation PASS: `109/109` focused and `307/307` repository checks;
- no metadata/lifecycle/final-integrity gate was completed after the query failure;
- GitHub Actions and commit status checks did not run.

## Important source-state finding

CODEX-15 did not accept Generate Content as the normal query transport, but the pushed source currently sets:

```text
QUERY_TRANSPORT = GENERATE_CONTENT
```

Therefore version `54` and PR `#26` are not user-ready and must not be merged as a qualified Gemini route. Do not treat this diagnostic default as an accepted transport.

## User prerequisite

The direct controls must run outside Apps Script with an API key from the same Google Cloud project used by the current personal DEV deployment.

The user must ensure one of the following before Codex execution:

- the existing project key is already available in the local Codex process as `GEMINI_API_KEY`; or
- a temporary diagnostic key is created in the same Google Cloud project and set locally as `GEMINI_API_KEY`.

Secret handling requirements:

- never paste the key into ChatGPT, the Codex prompt, GitHub, a report, test output, command history, screenshots, or logs;
- do not print, hash, partially reveal, or echo the key;
- do not store the key in repository files or `.env` files under the repository;
- if a temporary key is created, the user may revoke it after this qualification;
- if no same-project key is available locally, return `BALL: USER / STATUS: ACTION_REQUIRED` without running provider controls.

## Execution environment

Use an ephemeral local directory outside the repository and the current official Google Gen AI SDK. Do not add an SDK dependency to the application repository merely for this qualification.

Before provider calls:

1. confirm the key is present without printing its value;
2. confirm the selected project context is the intended personal DEV project where possible without exposing IDs;
3. record SDK/runtime versions only;
4. ensure SDK automatic retries are disabled or explicitly observable. One logical control must not silently become multiple provider queries.

## Evidence matrix

Run controls in order. Stop at the earliest result that makes later controls unable to change the decision. Each permitted model query is executed exactly once.

All source content must be synthetic, short, non-confidential text.

### Control A — base model without File Search

Use:

```text
model: gemini-3.7-flash
thinking level: low
max output tokens: 64
File Search tool: none
```

Ask for a fixed one-line synthetic response.

Purpose: prove the key/project/model/generative path independently of File Search.

Acceptance:

- normal response within `30000ms`;
- no retry;
- safe HTTP/status category recorded.

If Control A fails, stop. Classify `GEMINI_PROJECT_KEY_OR_BASE_MODEL_PATH`.

### Control B — existing Store direct SDK query, no metadata filter

Only when the existing Store resource name can be read locally from the authorized DEV settings without displaying or reporting it:

- use the same `gemini-3.7-flash`;
- use the existing Store;
- use a question that should match the accepted synthetic Pitchbook;
- omit metadata filter;
- bound the call at `90000ms`;
- do not upload, alter, or delete anything in the existing Store.

If the Store name cannot be obtained locally without exposing it, record `NOT_AVAILABLE` and continue to the fresh-store controls.

### Control C — existing Store direct SDK query with exact metadata filter

Run only if Control B completed successfully with a grounded result.

Use the exact synthetic `source_type` and `source_id` filter. Require at least one grounded/citation reference corresponding to the synthetic source.

Purpose: isolate metadata-filter behavior from retrieval itself.

### Control D — fresh temporary text-only Store with `gemini-embedding-001`

Create one temporary File Search Store using:

```text
embedding model: models/gemini-embedding-001
```

Upload one tiny synthetic TXT with unique marker text and stable synthetic custom metadata. Wait for authoritative active/indexed state. Query it once without metadata filter using `gemini-3.7-flash`, low thinking, and a small output cap.

Acceptance:

- upload/index completes within the bounded provider operation window;
- query completes within `90000ms`;
- at least one grounded/citation reference maps to the synthetic source.

### Control E — same temporary `gemini-embedding-001` Store with metadata filter

Run only if Control D passes. Query the same Store once with the exact synthetic metadata filter.

Purpose: distinguish general File Search success from metadata-filter failure.

### Control F — fresh temporary Store with `gemini-embedding-2`

Run only if Controls D and E pass.

Create one separate temporary Store using:

```text
embedding model: models/gemini-embedding-2
```

Upload the same tiny synthetic TXT and query once with the exact metadata filter.

Purpose: isolate the current embedding-model Store path.

## Cleanup

For every temporary Store or uploaded resource created by this dispatch:

- delete it in a `finally`-style cleanup path;
- verify deletion when the API permits;
- never delete or modify the existing Knowledge Share Store;
- report only `CLEANUP: PASS | PARTIAL | FAIL`, never resource IDs.

A cleanup failure is a BLOCKER and must be reported with the safe resource type and next manual cleanup action, without exposing the identifier in chat or GitHub.

## Safe evidence schema

For each control, report only:

```text
CONTROL
RESULT: PASS | FAIL | NOT_RUN | NOT_AVAILABLE
LATENCY_MS
HTTP_STATUS: numeric when safely available, otherwise NOT_AVAILABLE
ERROR_CLASS: stable safe enum only
GROUNDING_OR_CITATION_COUNT
PROVIDER_ATTEMPTS
CLEANUP
```

Do not report:

- API key or key fingerprint;
- Google project ID/number;
- Store, document, file, Interaction, deployment, Spreadsheet, or Drive IDs;
- source text, user question, raw provider body, request URL, or headers.

## Decision rules

Use the first supported classification:

```text
A fails
-> GEMINI_PROJECT_KEY_OR_BASE_MODEL_PATH

A passes; D fails
-> GEMINI_FILE_SEARCH_GENERAL_OR_PROJECT_PATH

D passes; E fails
-> GEMINI_FILE_SEARCH_METADATA_FILTER_PATH

D and E pass; F fails
-> GEMINI_FILE_SEARCH_EMBEDDING_2_PATH

Fresh controls pass; existing Store B/C fail
-> EXISTING_FILE_SEARCH_STORE_PATH

Direct existing/fresh controls pass; Apps Script paths remain failed
-> APPS_SCRIPT_URLFETCH_INTEGRATION_PATH
```

Do not claim a Google provider incident unless the direct same-project controls support that conclusion. Do not infer the failure class solely from the public message `Gemini search service unavailable`.

## Application boundary

This dispatch is diagnostic qualification only.

Do not:

- modify application source, settings, transport defaults, schema, Store configuration, or Web App deployment;
- run another query through the current Web App;
- use real Meeting/Pitchbook content;
- rotate the existing production key;
- create a new Google project;
- enable paid Priority service;
- call OpenAI or rerun FULL_OUTPUT;
- merge/rebase current `main`;
- merge PR `#26`.

After the evidence matrix, return to ChatGPT for the next implementation or provider action. The unaccepted `GENERATE_CONTENT` default must be corrected in a later authorized dispatch before any merge or user-ready deployment.

## Validation

No application test rerun is required unless diagnostic files are accidentally touched. The repository working tree must remain unchanged except for the CODEX-16 report/tracking updates committed after the controls.

Create:

`docs/handoffs/0020-CODEX-16-direct-provider-control-qualification-report.md`

Update:

- `docs/handoffs/0020-report.md`
- `docs/handoffs/0020-instruction.md`
- `docs/handoffs/0020-dispatches.md`
- PR `#26`

Commit and push only report/tracking changes.

Report at minimum:

```text
BASE_MODEL_CONTROL
EXISTING_STORE_UNFILTERED_CONTROL
EXISTING_STORE_FILTERED_CONTROL
FRESH_EMBEDDING_001_UNFILTERED_CONTROL
FRESH_EMBEDDING_001_FILTERED_CONTROL
FRESH_EMBEDDING_2_FILTERED_CONTROL
DIRECT_PROVIDER_CLASSIFICATION
TEMP_RESOURCE_CLEANUP
APPLICATION_SOURCE_CHANGED: NO
READY: NO
BLOCKER
FINAL_COMMIT
GITHUB_CI_ACTUALLY_RAN
```

## Final chat contract

A completed qualification return must begin and end with:

```text
WORK_ID: 0020
DISPATCH_ID: 0020-CODEX-16
BALL: CHATGPT
STATUS: RETURNED
```

If the same-project API key is not available locally, begin and end with:

```text
WORK_ID: 0020
DISPATCH_ID: 0020-CODEX-16
BALL: USER
STATUS: ACTION_REQUIRED
```

WORK_ID: `0020`
DISPATCH_ID: `0020-CODEX-16`
BALL: `USER`
STATUS: `ACTION_REQUIRED`
