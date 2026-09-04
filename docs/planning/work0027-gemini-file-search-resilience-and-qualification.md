# Work 0027 — Gemini GAS File Search resilience and end-to-end qualification

Current as of: 2026-09-04  
Status: ACTIVE / CODEX-01 READY

WORK_ID: `0027`  
MODE: `BUILD`

## Primary outcome

Apply the smallest coherent Gemini transport repair supported by the independent company-GAS evidence, then execute one bounded synthetic File Search end-to-end qualification.

The usable terminal result is one of:

```text
QUALIFIED_DISABLED
DISABLED_TRANSIENT_PROVIDER_LIMITATION
BLOCKED_PRODUCT_DEFECT
BLOCKED_RESOURCE_CLEANUP
```

## Accepted starting point

```text
MAIN_BASE: 8c9be2392a1247ff81efc6a153fc0be449b1318b
WORK_0026: ACCEPTED / PR #36 merge 40bb7d40506c0839c35742ee0000d89650ff7ad6
PRIVATE_WEB_APP_VERSION: 70 / shell PASS
OPENAI_AND_FULL_OUTPUT: accepted and unchanged
GEMINI_NORMAL_USER_ROUTE: hidden
GITHUB_ACTIONS: absent
```

## New external runtime evidence

The user supplied an independent company-GAS diagnostic proving:

- Gemini Models API is reachable and both `gemini-3.6-flash` and `gemini-3.8-flash` are visible;
- GenerateContent can return HTTP 200;
- `gemini-3.8-flash` Interactions returned HTTP 200 and the expected token twice;
- File Search Store create/delete returned HTTP 200;
- both GenerateContent models returned HTTP 503 `UNAVAILABLE` during a later high-demand period;
- the synthetic upload attempt failed locally because the diagnostic manually set ordinary `Content-Length`.

This evidence is recorded in:

- `docs/handoffs/0027-company-gas-gemini-smoke-evidence.md`
- `docs/decisions/gemini-gas-runtime-evidence-and-transient-resilience.md`

## Current code gaps that matter

1. Gemini live query/create call sites currently disable the existing retry helper.
2. The accepted classifier combines authentication and transient provider failures under `HTTP_OR_CREDENTIAL_FAILURE`.
3. Safe failure telemetry does not yet expose a precise transient retry count/class across all affected paths.
4. The main upload path already avoids ordinary `Content-Length`; this needs a regression test rather than an unjustified protocol change.
5. File Search upload/index/query/citation has not been requalified end to end after the new evidence.

## Required implementation scope

### Failure classes

At minimum keep these distinct:

```text
AUTHENTICATION_OR_PERMISSION_FAILURE
MODEL_ACCESS_OR_UNSUPPORTED
PROVIDER_OR_TRANSIENT_FAILURE
PROVIDER_TERMINAL_<safe status>
COMPLETED_NO_GROUNDED_ANSWER
COMPLETED_NO_FILE_CITATION
CITATION_IDENTITY_OR_METADATA_MISMATCH
RESPONSE_SHAPE_OR_APPLICATION_FAILURE
```

### Bounded retries

- transient: `408 / 429 / 500 / 502 / 503 / 504`;
- permanent by default: `400 / 401 / 403 / 404`;
- `Retry-After` first, otherwise exponential backoff plus jitter;
- idempotent GET/POLL/DELETE: maximum 3 total attempts and cumulative sleep at most 20 seconds;
- mutating create POST: maximum 2 total attempts only after explicit transient HTTP response with no returned resource identity;
- no blind replay after an ambiguous network failure;
- upload finalization recovery must query resumable state or reconcile identity before one safe resume.

### GenerateContent diagnostics

Separate HTTP success, response shape, text extraction, normalized token match, finish/safety reason, and empty/unexpected response.

### Safe telemetry

Reuse existing Audit metadata where practical. Record only:

```text
safe run correlation hash
timestamp
stage
model profile/model
transport
HTTP status
safe provider status/code
classification
attempt/retry count
elapsed time
final result
```

No raw prompts, responses, credentials, authorization headers, source bodies, private URLs, or provider-private resource IDs.

## Target-runtime qualification

Use the existing isolated private Apps Script target runtime and synthetic data only.

Sequence:

1. verify target model visibility;
2. run one short `gemini-3.8-flash` Interactions request;
3. create one temporary File Search Store;
4. upload one tiny synthetic TXT with a unique token;
5. poll indexing with existing bounded operation semantics;
6. query the unique token through Interactions + File Search;
7. require answer token, at least one `file_citation`, and exact synthetic metadata identity;
8. delete the temporary Store/resources in finally;
9. verify the normal-user Gemini route remains hidden until a qualified administrator state is explicitly approved.

## Runtime and provider budget

```text
SOURCE_DELIVERY: max 1
NEW_IMMUTABLE_VERSION: max 1 / expected 71
SAME_PRIVATE_WEB_APP_UPDATE: max 1 / expected 70 -> 71
VERSION_72_OR_HIGHER: prohibited
TEMP_FILE_SEARCH_STORE: max 1
TEMP_SYNTHETIC_DOCUMENT: max 1
MODELS_LIST: max 1
SHORT_INTERACTIONS_CONTROL: max 1 plus bounded transient retry
FILE_SEARCH_QUERY: max 1 plus bounded transient retry
EXISTING_GEMINI_STORE_OR_SOURCES_MUTATED: NO
OPENAI_API_CALLS: 0
FULL_OUTPUT_RUNTIME_CALLS: 0
```

## Acceptance evidence hierarchy

1. target-runtime synthetic File Search answer plus authoritative `file_citation`;
2. exact source delivery/readback and version-71 shell smoke;
3. cleanup readback proving the temporary Store/resource is gone;
4. focused failure/retry/upload regression tests;
5. canonical `npm run check`, bundle reproducibility, agent foundation, and diff hygiene.

## Completion latch

Work 0027 is ready for final review when:

- required deterministic checks pass;
- the target-runtime campaign reaches one allowed terminal result;
- temporary-resource deletion is confirmed; otherwise the Work remains `BLOCKED_RESOURCE_CLEANUP`;
- no existing provider/source data or accepted OpenAI/FULL_OUTPUT path is changed;
- no credential or confidential value appears in GitHub, logs, reports, PR, or browser responses.
