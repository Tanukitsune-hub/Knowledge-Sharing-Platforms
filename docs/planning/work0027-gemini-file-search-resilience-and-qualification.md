# Work 0027 — Gemini GAS File Search resilience and end-to-end qualification

Current as of: 2026-09-04  
Status: CODEX-02 READY / stable-model baseline qualification

WORK_ID: `0027`  
MODE: `BUILD`

## Primary outcome

Make one Gemini Interactions + File Search route work end to end in the isolated personal DEV Apps Script runtime, with exact source identity and authoritative citation, before attempting company-environment qualification.

The model does not need to be the newest available model. The exact bounded order is:

```text
PRIMARY: gemini-3.7-flash / explicit low / max output 2048
QUALIFICATION-ONLY FALLBACK: gemini-3.6-flash / explicit low / max output 2048
```

No automatic model or provider fallback is permitted in normal Knowledge Search.

## Accepted starting point

```text
MAIN_BASE_AT_WORK_START: 8c9be2392a1247ff81efc6a153fc0be449b1318b
WORK_0026: ACCEPTED / PR #36 merge 40bb7d40506c0839c35742ee0000d89650ff7ad6
PR_37: Draft / Open / unmerged
CODEX_01_IMPLEMENTATION_COMMIT: d0456516cae5e65e68d5789e3e8e5338cffd6823
CODEX_01_FINAL_COMMIT: 2c6cd20bfe6a4ef3b6262160b4126266307222dd
PRIVATE_WEB_APP_VERSION: 71 / shell PASS
OPENAI_AND_FULL_OUTPUT: accepted and unchanged
GEMINI_NORMAL_USER_ROUTE: hidden
```

## External and CODEX-01 runtime evidence

Independent company-GAS evidence established:

- Gemini Models API is reachable;
- `gemini-3.6-flash` and `gemini-3.8-flash` were visible;
- GenerateContent returned HTTP 200 in one run and provider HTTP 503 high-demand responses in another;
- `gemini-3.8-flash` short Interactions returned HTTP 200 twice;
- File Search Store create/delete returned HTTP 200;
- the independent upload failure was caused by ordinary `Content-Length` in the diagnostic code.

CODEX-01 then established in the product runtime:

```text
AUTH_VS_TRANSIENT_CLASSIFICATION: PASS
BOUNDED_RETRY_POLICY: PASS
RESUMABLE_UPLOAD_RECOVERY: PASS
SOURCE_READBACK: PASS / 82 of 82
PRIVATE_WEB_APP_VERSION_71: shell PASS
MODELS_VISIBILITY: PASS
SHORT_GEMINI_3_8_INTERACTIONS: PASS
TEMP_STORE_CREATE: PASS
SYNTHETIC_TXT_UPLOAD_INDEX_READBACK: PASS / exactly one current document
FILE_SEARCH_QUERY_3_8: HTTP 500 / api_error / PROVIDER_OR_TRANSIENT_FAILURE / 68,442ms
TEMP_STORE_DELETE_AND_CONFIRMATION: PASS
```

This closes upload/indexing as the active hypothesis. The remaining decisive question is whether a stable older supported model completes the File Search query and citation path.

## Closed implementation scope

Preserve the CODEX-01 implementation:

1. authentication/permission and provider/transient classifications are distinct;
2. retry only `408 / 429 / 500 / 502 / 503 / 504`;
3. `400 / 401 / 403 / 404` are non-retry by default;
4. `Retry-After` precedes exponential backoff plus jitter;
5. mutating ambiguous outcomes are not blindly replayed;
6. ordinary `Content-Length` is forbidden;
7. required `X-Goog-Upload-Header-Content-Length` is preserved;
8. resumable session state is queried before one safe finalize resume;
9. HTTP connectivity and content/citation validation are separate;
10. safe telemetry excludes credentials, provider-private identities and content.

## CODEX-02 required scope

### Model parameterization

Generalize Work-0027 qualification-only hardcoding so that safe diagnostics, E2E evidence, model visibility, short Interactions and File Search requests correctly support:

```text
gemini-3.7-flash
gemini-3.6-flash
```

Do not call 3.8 in CODEX-02.

### Candidate progression

Use one shared temporary Store and one synthetic document.

1. Attempt 3.7.
2. Stop immediately if 3.7 passes.
3. Attempt 3.6 only after an allowed model-specific/transient/content-limitation outcome from 3.7.
4. Do not attempt 3.6 after authentication failure, citation identity mismatch, response-shape/application defect, source-integrity failure or cleanup uncertainty.

### Acceptance result

Success requires:

```text
TERMINAL_OUTCOME: QUALIFIED_DISABLED
QUALIFIED_MODEL_ID: gemini-3.7-flash or gemini-3.6-flash
SHORT_INTERACTIONS: PASS for the selected candidate
FILE_SEARCH_ANSWER_TOKEN: PASS
FILE_CITATION: PASS
AUTHORITATIVE_METADATA_MATCH: PASS
TEMP_RESOURCE_CLEANUP: PASS
GEMINI_ENABLED: false
NORMAL_USER_GEMINI_ROUTE: hidden
```

Persist only the exact passing model/thinking/output tuple as the qualified default candidate. Do not leave 3.8 as the effective qualified model.

## Target-runtime and mutation bounds

```text
SOURCE_DELIVERY: max 1
NEW_IMMUTABLE_VERSION: exactly 1 / expected 72
SAME_PRIVATE_WEB_APP_UPDATE: max 1 / expected 71 -> 72
VERSION_73_OR_HIGHER: prohibited
TEMP_FILE_SEARCH_STORE: max 1
TEMP_SYNTHETIC_DOCUMENT: max 1
CANDIDATE_MODELS: max 2
MODELS_LIST: max 1 logical request
SHORT_INTERACTIONS_PER_ATTEMPTED_MODEL: max 1 logical request plus bounded retry
FILE_SEARCH_QUERY_PER_ATTEMPTED_MODEL: max 1 logical request plus bounded retry
TOTAL_PROVIDER_WALL_CLOCK_BEFORE_CLEANUP: max 300 seconds
EXISTING_GEMINI_STORE_OR_SOURCE_MUTATION: 0
OPENAI_API_CALLS: 0
FULL_OUTPUT_RUNTIME_CALLS: 0
```

## Evidence hierarchy

1. target-runtime token answer plus exact `file_citation` on 3.7 or 3.6;
2. cleanup readback proving no temporary resource remains;
3. exact source delivery/readback and version-72 shell smoke;
4. focused candidate-progression and no-fallback regression tests;
5. canonical checks, bundle reproducibility, secret scan and diff hygiene.

## Terminal outcomes

```text
QUALIFIED_DISABLED
DISABLED_TRANSIENT_PROVIDER_LIMITATION
DISABLED_MODEL_ACCESS_LIMITATION
BLOCKED_PRODUCT_DEFECT
BLOCKED_RESOURCE_CLEANUP
```

Only `QUALIFIED_DISABLED` satisfies Work acceptance. Other outcomes stop safely with the exact blocker retained.

## Active dispatch

`0027-CODEX-02`

Detailed instruction:

`docs/handoffs/0027-CODEX-02-stable-model-file-search-baseline-instruction.md`
