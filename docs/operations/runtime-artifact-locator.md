# Knowledge Share Runtime / Artifact Locator

LAST_VERIFIED_AT: 2026-09-04 JST  
LAST_VERIFIED_BY: CODEX-01 after version-71 deployment and bounded Gemini E2E
STATUS: ACTIVE / Web App version 71; Work 0027 returned for review

## Source

- SOURCE_REPOSITORY: `Tanukitsune-hub/Knowledge-Sharing-Platforms`
- DEFAULT_BRANCH: `main`
- MAIN_AT_WORK_0027_START: `8c9be2392a1247ff81efc6a153fc0be449b1318b`
- WORK_0020_MERGE_COMMIT: `185fd197cd531bf74e77af33b32e82706bebe0b5`
- WORK_0025_MERGE_COMMIT: `121f2a1c4655ece46c7e07163b0d12866600923e`
- WORK_0021_MERGE_COMMIT: `533c849bd1229827ec77cd5ad6506312ea286940`
- WORK_0023_MERGE_COMMIT: `8b0a2ccde4746b061c232f45b6d1d59c7cc5a54f`
- WORK_0026_MERGE_COMMIT: `40bb7d40506c0839c35742ee0000d89650ff7ad6`
- CURRENT_ACTIVE_WORK: `0027`
- CURRENT_ACTIVE_DISPATCH: `0027-CODEX-01`
- ACTIVE_BRANCH: `agent/0027-gemini-file-search-resilience`

Do not record local workspace paths, private editor/deployment URLs, Script IDs, deployment IDs, Google Drive/Spreadsheet IDs, provider Store/document resource names, credentials or signed URLs in this file.

## Current application runtime

```text
TARGET_RUNTIME_TYPE: Google Apps Script V8 / private Web App
ENVIRONMENT: isolated personal DEV / qualification
DEPLOYMENT_VERSION: 71
ROOT_PAGE_RENDER_AND_BOOTSTRAP: PASS
KNOWLEDGE_PAGE_RENDER_AND_BOOTSTRAP: PASS
LITERAL_INCLUDE_DIRECTIVES: 0
BLOCKING_BROWSER_CONSOLE_ERRORS: 0
SOURCE_DELIVERY_READBACK: PASS / 82 of 82 at Work 0027
VERSION_67: unused / never deploy
VERSION_68: superseded / modular shell failed
VERSION_69: superseded / shell repaired
VERSION_70: superseded / Work 0026 shell PASS
VERSION_71: current / Work 0027 shell PASS
VERSION_72_OR_HIGHER: not created and prohibited in 0027-CODEX-01
```

## Accepted provider baseline

### OpenAI / FULL_OUTPUT

```text
WORK_0020: ACCEPTED
OPENAI: production-capable reference path in personal DEV
FULL_OUTPUT: API-independent production-capable path
OPENAI_ACCEPTED_PATH_PRESERVED: PASS
WORK_0027_OPENAI_LIVE_CALLS_AUTHORIZED: 0
WORK_0027_FULL_OUTPUT_LIVE_CALLS_AUTHORIZED: 0
```

### Gemini — accepted Work 0026 state

```text
PRIMARY_CANDIDATE: gemini-3.8-flash / explicit low / 2048
TRANSPORT: Interactions + File Search
DOC-000017_CURRENT_DOCUMENTS: 1
MTG-000005_CURRENT_DOCUMENTS: 1
DOCUMENT_DUPLICATES: 0
WORK_0026_HISTORICAL_CALL_CLASS: HTTP_OR_CREDENTIAL_FAILURE
GEMINI_OPTIONAL_PROVIDER_STATUS: DISABLED_EXTERNAL_LIMITATION
NORMAL_USER_GEMINI_ROUTE_VISIBLE: NO
```

The Work 0026 call classification is historical and coarse. It is not the current general causal conclusion.

### Gemini — new independent company-GAS evidence

The user supplied a separate non-confidential diagnostic result:

```text
COMPANY_GAS_TO_GEMINI_MODELS: HTTP 200
GEMINI_3_6_AND_3_8_VISIBLE: YES
GEMINI_3_8_INTERACTIONS: HTTP 200 PASS twice
GENERATE_CONTENT: HTTP 200 observed
GENERATE_CONTENT_HIGH_DEMAND: HTTP 503 UNAVAILABLE observed
FILE_SEARCH_STORE_CREATE_DELETE: HTTP 200
API_KEY_AND_BASIC_AUTH: operational
COMPANY_GAS_NETWORK_PATH: operational
FILE_SEARCH_UPLOAD_INDEX_QUERY_CITATION: pending
```

The diagnostic upload failed locally because it manually set ordinary `Content-Length` in `UrlFetchApp`. Current product source does not set ordinary `Content-Length`; it retains the required `X-Goog-Upload-Header-Content-Length`.

## Work 0027 runtime result

```text
AUTH_VS_TRANSIENT_CLASSIFICATION: PASS
TRANSIENT_RETRY: bounded / Retry-After then exponential backoff plus jitter
INTERACTIONS: primary
MODEL_FALLBACK: none
MODELS_VISIBILITY: PASS / HTTP 200
SHORT_GEMINI_3_8_INTERACTIONS: PASS / HTTP 200 / expected token
TEMP_STORE: created exactly 1 / deleted and deletion confirmed
TEMP_SYNTHETIC_DOCUMENT: indexed and exact readback / exactly 1 current document before cleanup
FILE_SEARCH_QUERY: HTTP 500 / api_error / PROVIDER_OR_TRANSIENT_FAILURE / 68,442ms
FILE_SEARCH_EXPECTED_TOKEN_AND_CITATION: NOT ACHIEVED
TERMINAL_OUTCOME: DISABLED_TRANSIENT_PROVIDER_LIMITATION
GEMINI_ENABLED: false
NORMAL_USER_GEMINI_ROUTE: hidden
EXISTING_GEMINI_STORE_OR_SOURCE_MUTATION: none
OPENAI_API_CALLS: 0
FULL_OUTPUT_RUNTIME_CALLS: 0
```

Decision:

`docs/decisions/gemini-gas-runtime-evidence-and-transient-resilience.md`

Detailed instruction:

`docs/handoffs/0027-CODEX-01-gemini-file-search-resilience-and-e2e-qualification-instruction.md`

## Work 0023 bundle/installer baseline

```text
DETERMINISTIC_SINGLE_FILE_BUNDLE: PASS
SOURCE_AND_BUNDLE_PARITY: PASS
INSTALLER_OWNER_LATCH: PASS
CROSS_USER_PARTIAL_TAKEOVER_REJECTION: PASS
DEPLOYMENT_SECURITY_ATTESTATION: PASS
WEB_APP_URL_ONLY_READY_REJECTION: PASS
MUTABLE_GLOBAL_COLLISION_GATE: PASS
PERSONAL_DEV_INSTALL_UPGRADE: PASS
IDEMPOTENT_RERUN_DUPLICATES: 0
```

## Follow-up routing

- Work 0027: CODEX-01 returned for review with cleanup-confirmed `DISABLED_TRANSIENT_PROVIDER_LIMITATION`.
- Separate future Work: representative large-file indexing.
- Planned: historical-material migration.
- Planned: final company Shared Drive/domain-user/provider qualification and rollout.

## Update rule

Update this file whenever a material runtime version, accepted merge, provider qualification state or installation artifact changes. Never store credentials, confidential source contents, private URLs/IDs or provider-private resource identifiers here.
