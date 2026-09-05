# Knowledge Share Runtime / Artifact Locator

LAST_RUNTIME_EVIDENCE_AT: 2026-09-05 JST
LAST_RUNTIME_EVIDENCE_BY: Codex, CODEX-04 read-only recovery
LATEST_CONTROLLER_ACTION: CODEX-04 evidence reviewed; CODEX-05 strict resolver repair authorized
STATUS: version 72 remains deployed; CODEX-05 READY, not executed

## Source and current ball

SOURCE_REPOSITORY: `Tanukitsune-hub/Knowledge-Sharing-Platforms`
DEFAULT_BRANCH: `main`
MAIN_AT_REVIEW: `8c9be2392a1247ff81efc6a153fc0be449b1318b`
ACTIVE_BRANCH: `agent/0027-gemini-file-search-resilience`
REVIEWED_IMPLEMENTATION: `acd3aa08a3ecc01a7b0852afef8f58202934af82`
REVIEWED_CODEX_02_FINAL_REF: `0032a9cdb69cc1431566dee82f7e2c2196ddee50`
REVIEWED_CODEX_03_FINAL_REF: `745e34d8a04df4aaea8a9373775106b4b08b4523`
REVIEWED_CODEX_04_FINAL_REF: `18226013d6f98a5cb2bffdf72ced52e766a8b698`
PR: `#37 / Draft / Open / unmerged`
CURRENT_ACTIVE_WORK: `0027`
CURRENT_ACTIVE_DISPATCH: `0027-CODEX-05`
BALL: `CODEX`
STATUS: `READY`

Current ball is authoritative in `docs/handoffs/0027-dispatches.md`. Local workspace paths, private URLs/IDs, provider resource names, credentials and signed URLs must not appear here.

## Observed application runtime

```text
TARGET_RUNTIME: Google Apps Script V8 / private Web App
ENVIRONMENT: isolated personal DEV / qualification
DEPLOYMENT_VERSION: 72
ROOT_AND_KNOWLEDGE_BOOTSTRAP: PASS in CODEX-02
LITERAL_INCLUDE_DIRECTIVES: 0
BLOCKING_CONSOLE_ERRORS: 0
SOURCE_READBACK: PASS / 82 of 82 in CODEX-02
VERSION_67: unused / never deploy
VERSION_68: superseded / modular shell failed
VERSION_69: superseded / shell repaired
VERSION_70: superseded / Work 0026 shell PASS
VERSION_71: superseded / CODEX-01 shell PASS
VERSION_72: current / CODEX-02 shell PASS
VERSION_73_CREATED_IN_CODEX_03_OR_04: NO
```

CODEX-03/04 changed no immutable version or deployment. CODEX-05 may perform one final source delivery/readback, create at most version 73 and update the same verified private Web App once (72 -> 73), only after the detailed instruction's gates. This is authorization, not observed execution. Version 74+ is unauthorized; version 67 remains prohibited. Follow `docs/operations/apps-script-web-app-deployment.md` and preserve WEB_APP /exec, USER_DEPLOYING and MYSELF settings.

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
AUTHORITATIVE_CITATION_IDENTITY_MATCH: FAIL
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
BLOCKER: GEMINI_3_7_FILE_CITATION_IDENTITY_OR_METADATA_MISMATCH
```

CODEX-03's temporary invocation-path modification is excluded from qualification evidence. It was removed. CODEX-05 must use the ordinary guarded administrator Web App route, never a latch bypass or temporary handler interception.

## CODEX-05 boundary

No new evidence recovery or model sweep. Implement the recovered Store-plus-metadata/current-document identity contract shared with normal search. One temporary Store/TXT and one logical 3.7 File Search confirmation with current quota preflight, exact readback and finally cleanup. No Models/short-generation/3.6/3.8/GenerateContent/OpenAI/FULL_OUTPUT calls. No existing business/provider resources changed. Only a new correctly bound result can qualify the exact model; old missing Document evidence remains missing and temporary Store identity never becomes the configured Store.

Instruction: `docs/handoffs/0027-CODEX-05-strict-citation-resolver-instruction.md`.
CODEX-05 implementation and runtime confirmation: NOT_RUN.

## Next phases

After personal-DEV citation qualification: representative large files, historical-material migration and separately approved company Shared Drive/domain-user/provider/quota qualification. No confidential indexing, billing change or rollout is enabled by this locator.
