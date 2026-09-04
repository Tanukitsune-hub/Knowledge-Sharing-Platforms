# Knowledge Share Runtime / Artifact Locator

LAST_VERIFIED_AT: 2026-09-04 JST  
LAST_VERIFIED_BY: ChatGPT after independent CODEX-01 review and stable-model strategy reset  
STATUS: ACTIVE / Web App version 71; CODEX-02 ready

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
- CURRENT_ACTIVE_DISPATCH: `0027-CODEX-02`
- ACTIVE_BRANCH: `agent/0027-gemini-file-search-resilience`
- PR: `#37 / Draft / Open / unmerged`

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
SOURCE_DELIVERY_READBACK: PASS / 82 of 82 at CODEX-01
VERSION_67: unused / never deploy
VERSION_68: superseded / modular shell failed
VERSION_69: superseded / shell repaired
VERSION_70: superseded / Work 0026 shell PASS
VERSION_71: current / Work 0027 CODEX-01 shell PASS
VERSION_72: authorized only for CODEX-02 after deterministic PASS
VERSION_73_OR_HIGHER: prohibited in CODEX-02
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
PRIMARY_0026_CANDIDATE: gemini-3.8-flash / explicit low / 2048
TRANSPORT: Interactions + File Search
DOC-000017_CURRENT_DOCUMENTS: 1
MTG-000005_CURRENT_DOCUMENTS: 1
DOCUMENT_DUPLICATES: 0
WORK_0026_HISTORICAL_CALL_CLASS: HTTP_OR_CREDENTIAL_FAILURE
GEMINI_OPTIONAL_PROVIDER_STATUS: disabled
NORMAL_USER_GEMINI_ROUTE_VISIBLE: NO
```

The Work 0026 class is historical and not the current general causal conclusion.

## Independent company-GAS evidence

```text
COMPANY_GAS_TO_GEMINI_MODELS: HTTP 200
GEMINI_3_6_AND_3_8_VISIBLE: YES
GEMINI_3_8_INTERACTIONS: HTTP 200 PASS twice
GENERATE_CONTENT: HTTP 200 observed
GENERATE_CONTENT_HIGH_DEMAND: HTTP 503 UNAVAILABLE observed
FILE_SEARCH_STORE_CREATE_DELETE: HTTP 200
API_KEY_AND_BASIC_AUTH: operational
COMPANY_GAS_NETWORK_PATH: operational
```

The independent diagnostic upload failed locally because it manually set ordinary `Content-Length`. Current product source does not set ordinary `Content-Length` and preserves required resumable-upload headers.

## CODEX-01 runtime result

```text
IMPLEMENTATION_COMMIT: d0456516cae5e65e68d5789e3e8e5338cffd6823
FINAL_COMMIT: 2c6cd20bfe6a4ef3b6262160b4126266307222dd
AUTH_VS_TRANSIENT_CLASSIFICATION: PASS
TRANSIENT_RETRY: bounded / Retry-After then exponential backoff plus jitter
RESUMABLE_UPLOAD_RECOVERY: PASS
MODELS_VISIBILITY: PASS / HTTP 200
SHORT_GEMINI_3_8_INTERACTIONS: PASS / HTTP 200
TEMP_STORE: created exactly 1 / deleted and deletion confirmed
TEMP_SYNTHETIC_DOCUMENT: indexed and exact readback / exactly 1 current document
FILE_SEARCH_QUERY_3_8: HTTP 500 / api_error / PROVIDER_OR_TRANSIENT_FAILURE / 68,442ms
FILE_SEARCH_EXPECTED_TOKEN_AND_CITATION: NOT ACHIEVED
PRIVATE_WEB_APP_VERSION: 71
GEMINI_ENABLED: false
NORMAL_USER_GEMINI_ROUTE: hidden
EXISTING_GEMINI_STORE_OR_SOURCE_MUTATION: none
OPENAI_API_CALLS: 0
FULL_OUTPUT_RUNTIME_CALLS: 0
```

CODEX-01 proves the upload/index/readback path and cleanup. It does not prove that 3.7 or 3.6 File Search fails.

## CODEX-02 qualification boundary

```text
PRIMARY_CANDIDATE: gemini-3.7-flash / explicit low / 2048
QUALIFICATION_ONLY_FALLBACK: gemini-3.6-flash / explicit low / 2048
GEMINI_3_8_RERUN: prohibited
NORMAL_USER_AUTOMATIC_MODEL_FALLBACK: prohibited
TEMP_STORE: max 1
TEMP_DOCUMENT: max 1
EXPECTED_DEPLOYMENT_VERSION: 72
SOURCE_DELIVERY: max 1
SAME_WEB_APP_UPDATE: max 1 / 71 -> 72
VERSION_73_OR_HIGHER: prohibited
```

Success requires expected token, `file_citation`, authoritative metadata match and cleanup confirmation on 3.7 or 3.6. Gemini remains disabled/hidden pending final review.

Detailed instruction:

`docs/handoffs/0027-CODEX-02-stable-model-file-search-baseline-instruction.md`

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

- Active: Work 0027 CODEX-02 stable-model personal-DEV File Search qualification.
- After small synthetic qualification: representative large-file indexing.
- Planned: historical-material migration.
- Planned: final company Shared Drive/domain-user/provider qualification and rollout.

## Update rule

Update this file whenever a material runtime version, accepted merge, provider qualification state or installation artifact changes. Never store credentials, confidential source contents, private URLs/IDs or provider-private resource identifiers here.
