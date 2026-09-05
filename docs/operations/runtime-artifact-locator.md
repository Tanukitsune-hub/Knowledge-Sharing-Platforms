# Knowledge Share Runtime / Artifact Locator

LAST_RUNTIME_EVIDENCE_AT: 2026-09-05 JST
LAST_RUNTIME_EVIDENCE_BY: Codex, CODEX-05 guarded qualification
LATEST_CONTROLLER_ACTION: CODEX-05 returned QUALIFIED_DISABLED for ChatGPT final review
STATUS: version 73 deployed; personal-DEV Gemini 3.7 qualified but disabled/hidden

## Source and current ball

SOURCE_REPOSITORY: `Tanukitsune-hub/Knowledge-Sharing-Platforms`
DEFAULT_BRANCH: `main`
MAIN_AT_REVIEW: `8c9be2392a1247ff81efc6a153fc0be449b1318b`
ACTIVE_BRANCH: `agent/0027-gemini-file-search-resilience`
REVIEWED_IMPLEMENTATION: `40905f23d8c6bab5b76e7fb2f34f96b912aeb2f7`
REVIEWED_CODEX_02_FINAL_REF: `0032a9cdb69cc1431566dee82f7e2c2196ddee50`
REVIEWED_CODEX_03_FINAL_REF: `745e34d8a04df4aaea8a9373775106b4b08b4523`
REVIEWED_CODEX_04_FINAL_REF: `18226013d6f98a5cb2bffdf72ced52e766a8b698`
CODEX_05_IMPLEMENTATION_REF: `40905f23d8c6bab5b76e7fb2f34f96b912aeb2f7`
PR: `#37 / Draft / Open / unmerged`
CURRENT_ACTIVE_WORK: `0027`
CURRENT_ACTIVE_DISPATCH: `0027-CODEX-05`
BALL: `CHATGPT`
STATUS: `RETURNED`

Current ball is authoritative in `docs/handoffs/0027-dispatches.md`. Local workspace paths, private URLs/IDs, provider resource names, credentials and signed URLs must not appear here.

## Observed application runtime

```text
TARGET_RUNTIME: Google Apps Script V8 / private Web App
ENVIRONMENT: isolated personal DEV / qualification
DEPLOYMENT_VERSION: 73
ROOT_AND_KNOWLEDGE_BOOTSTRAP: PASS in CODEX-05
LITERAL_INCLUDE_DIRECTIVES: 0
BLOCKING_CONSOLE_ERRORS: 0
SOURCE_READBACK: PASS / 82 of 82 in CODEX-05
VERSION_67: unused / never deploy
VERSION_68: superseded / modular shell failed
VERSION_69: superseded / shell repaired
VERSION_70: superseded / Work 0026 shell PASS
VERSION_71: superseded / CODEX-01 shell PASS
VERSION_72: superseded / CODEX-02 shell PASS
VERSION_73: current / CODEX-05 strict resolver shell and qualification PASS
VERSION_74_OR_HIGHER_CREATED: NO
```

CODEX-05 delivered/read back source once, created version 73 once, and updated the same verified private Web App once from 72 to 73. Readback preserved `WEB_APP` `/exec`, `USER_DEPLOYING`, and `MYSELF`. Its authorization is consumed. Version 74+ remains unauthorized and version 67 remains prohibited.

## Accepted merges and provider boundary

- Work 0020: `185fd197cd531bf74e77af33b32e82706bebe0b5`
- Work 0025: `121f2a1c4655ece46c7e07163b0d12866600923e`
- Work 0021: `533c849bd1229827ec77cd5ad6506312ea286940`
- Work 0023: `8b0a2ccde4746b061c232f45b6d1d59c7cc5a54f`
- Work 0026: `40bb7d40506c0839c35742ee0000d89650ff7ad6`

OpenAI and API-independent FULL_OUTPUT are accepted reference paths in personal DEV, not company qualification. CODEX-05 permits no live calls to them. Installer/bundle owner, attestation, source parity and duplicate-prevention evidence remain closed.

Work 0026's coarse HTTP_OR_CREDENTIAL_FAILURE is historical only. Prior exact DOC-000017/MTG-000005 evidence remains one document each with no duplicates; no existing source or Store may be changed by CODEX-05. Independent company-GAS evidence remains in `docs/handoffs/0027-company-gas-gemini-smoke-evidence.md`.

## Latest Gemini runtime evidence

```text
CODEX_01_3_8: HTTP 500 / api_error after successful upload/index/readback
CODEX_02_3_7_SHORT: HTTP 200 / 1470ms
CODEX_02_3_7_FILE_SEARCH: HTTP 200 / expected token / 1 normalized file_citation
CODEX_02_QUERY_ATTEMPTS_RETRIES: 2 / 1
CODEX_02_QUERY_LATENCY_MS: 34992
CODEX_02_AUTHORITATIVE_CITATION_IDENTITY_MATCH: FAIL
CODEX_04_STORED_INTERACTION: RECOVERED / ID and raw values not retained
CODEX_04_CITATION_SOURCE_CATEGORY: CONTENT_TEXT
CODEX_04_DOCUMENT_URI_CATEGORY: STORE
CODEX_04_EXACT_CUSTOM_METADATA: PRESENT
CODEX_04_RAW_UNIQUE_CITATIONS: 3 / 1
CODEX_04_ORIGINAL_DOCUMENT_NAME: UNAVAILABLE
CODEX_04_SAME_PROJECT_TIER: Free
CODEX_04_QUOTA_OBSERVATION: 2026-09-05 11:05 JST
CODEX_04_LAST_HOUR_3_7_RPM_TPM_RPD: 3/5 / 394/250000 / 3/20
CODEX_04_CODEX_03_429_QUOTA_CATEGORY: UNKNOWN
CODEX_04_COMPLIANT_ADMIN_ROUTE: AVAILABLE / not invoked
CODEX_05_MODEL: gemini-3.7-flash / explicit low / 2048 / Interactions File Search
CODEX_05_TERMINAL_OUTCOME: QUALIFIED_DISABLED
CODEX_05_EXPECTED_TOKEN: PASS
CODEX_05_REAL_FILE_CITATION: PASS / at least 1
CODEX_05_AUTHORITATIVE_NORMALIZED_CITATIONS: PASS / exactly 1
CODEX_05_STORE_METADATA_CURRENT_DOCUMENT_BINDING: PASS
CODEX_05_NORMAL_IMMEDIATE_POLL_MAPPING_PARITY: PASS
CODEX_05_TEMP_STORE_DOCUMENT: 1 / 1 / deletion and absence confirmed
CODEX_05_GUARDED_ACTION_DURATION_MS: 25554
CODEX_05_POST_RUN_3_7_RPM_TPM_RPD: 1/5 / 200/250000 / 1/20
CODEX_05_RESPONSE_EMBEDDED_ATTEMPT_RETRY_QUERY_LATENCY: NOT_RETAINED
CODEX_05_SAFE_AUDIT_APPEND: NOT_OBSERVED / non-blocking evidence-retention follow-up
CODEX_03_DIAGNOSTIC_HTTP: 429 / too_many_requests
CODEX_03_DIAGNOSTIC_ATTEMPTS_RETRIES: 2 / 1
CODEX_03_DIAGNOSTIC_CUMULATIVE_SLEEP_MS: 514
CODEX_03_DIAGNOSTIC_LATENCY_MS: 21825
CODEX_03_MODEL_OUTPUT_AND_CITATIONS: 0 / 0
CODEX_03_TEMP_RESOURCE_CLEANUP: PASS / reported deletion confirmation
CODEX_03_MUTABLE_SOURCE_RESTORATION: PASS / reported 82 of 82
GEMINI_ENABLED: false
NORMAL_USER_GEMINI_VISIBILITY: false
EXISTING_SOURCE_OR_STORE_MUTATION: 0
OPENAI_FULL_OUTPUT_LIVE_CALLS: 0
BLOCKER: NONE
```

CODEX-03's temporary invocation-path modification is excluded from qualification evidence and was removed. CODEX-05 used the ordinary guarded administrator Web App route without a latch bypass or temporary handler interception; that authority is consumed.

## CODEX-05 completed boundary

The recovered Store-plus-metadata/current-document identity contract is shared with normal search and qualified by one temporary Store/TXT plus one logical 3.7 File Search confirmation. Cleanup was confirmed. Models/short-generation/3.6/3.8/GenerateContent/OpenAI/FULL_OUTPUT were not called. No existing business/provider resource changed, and the temporary Store was never configured as an application Store.

Instruction: `docs/handoffs/0027-CODEX-05-strict-citation-resolver-instruction.md`.
Report: `docs/handoffs/0027-CODEX-05-strict-citation-resolver-report.md`.
CODEX-05 implementation and runtime confirmation: PASS / QUALIFIED_DISABLED.

## Next phases

Representative large files, historical-material migration and separately approved company Shared Drive/domain-user/provider/quota qualification remain later Work. Gemini activation, confidential indexing, billing change, rollout and PR merge are not enabled by this locator.
