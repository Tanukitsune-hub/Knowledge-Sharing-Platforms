# Work 0027 dispatch control

WORK_ID: `0027`  
ACTIVE_DISPATCH_ID: `0027-CODEX-01`  
BALL: `CODEX`  
STATUS: `READY`

## Current dispatch

### 0027-CODEX-01 — Gemini transient resilience and File Search end-to-end qualification

Primary outcome:

```text
repair precise transient/auth classification
-> enable bounded safe retry behavior
-> preserve correct resumable-upload headers
-> execute one synthetic File Search E2E
-> terminate as QUALIFIED_DISABLED, DISABLED_TRANSIENT_PROVIDER_LIMITATION, BLOCKED_PRODUCT_DEFECT, or BLOCKED_RESOURCE_CLEANUP
```

Detailed instruction:

`docs/handoffs/0027-CODEX-01-gemini-file-search-resilience-and-e2e-qualification-instruction.md`

Report:

`docs/handoffs/0027-CODEX-01-gemini-file-search-resilience-and-e2e-qualification-report.md`

## Closed evidence

```text
MAIN_BASE: 8c9be2392a1247ff81efc6a153fc0be449b1318b
WORK_0026: ACCEPTED
PRIVATE_WEB_APP_VERSION: 70 / shell PASS
COMPANY_GAS_TO_GEMINI: reachable
GEMINI_3_8_INTERACTIONS: HTTP 200 PASS twice in independent diagnostic
FILE_SEARCH_STORE_CREATE_DELETE: HTTP 200 PASS
GENERATE_CONTENT_503: provider/transient high-demand evidence
DIAGNOSTIC_UPLOAD_FAILURE: local ordinary Content-Length defect
GEMINI_NORMAL_USER_ROUTE: hidden
```

## Bounds

```text
SOURCE_DELIVERY: max 1
IMMUTABLE_VERSION: max 1 / expected 71
SAME_WEB_APP_UPDATE: max 1
VERSION_72_OR_HIGHER: prohibited
TEMP_STORE: max 1
TEMP_DOCUMENT: max 1
EXISTING_STORE_SOURCE_MUTATION: prohibited
OPENAI_API: 0
FULL_OUTPUT_LIVE: 0
```

A return from Codex requires a new Dispatch ID for any later execution. User-assisted editor/browser continuation within the same run retains `0027-CODEX-01`.
