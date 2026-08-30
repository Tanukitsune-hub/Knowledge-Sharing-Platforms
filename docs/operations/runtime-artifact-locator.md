# Knowledge Share Runtime / Artifact Locator

LAST_VERIFIED_AT: 2026-08-31 JST
LAST_VERIFIED_BY: CODEX-21 exact source readback + bounded OpenAI native qualification + GitHub review closure
STATUS: ACTIVE / VERIFIED RUNTIME, READY FOR CHATGPT FINAL MERGE

## Source

- SOURCE_REPOSITORY: `Tanukitsune-hub/Knowledge-Sharing-Platforms`
- WORK_BRANCH: `agent/0020-ai-provider-core`
- DEPLOYED_SOURCE_COMMIT: `CODEX-21 FINAL COMMIT — exact pushed SHA is recorded in the PR and final return`
- DEPLOYED_SOURCE_DESCRIPTION: CODEX-21 retry/replacement/orphan-cleanup hardening, exact tested source
- CURRENT_GITHUB_DISPATCH: `0020-CODEX-21 — RETURNED`
- CODEX_20_MAIN_INTEGRATION_COMMIT: `655ce6e00b14e20e8ed6af85cef95d872de4caef`
- CODEX_20_FINAL_REPORTING_HEAD: `4176c98344bcbe495b1f062001e2e26e0860479b`
- CURRENT_BRANCH_HEAD: `CODEX-21 FINAL COMMIT — local/remote/PR equality reverified at return`
- LOCAL_WORKSPACE_PATH: `NOT RECORDED IN GITHUB` — keep machine-specific absolute paths local unless explicitly safe and useful

## Application runtime

- TARGET_RUNTIME_TYPE: Google Apps Script V8, standalone project, private Web App
- TARGET_RUNTIME_NAME: `KSP Work 0010 DEV Qualification`
- TARGET_RUNTIME_ID / SCRIPT_ID: `VERIFIED / NOT RECORDED`
- TARGET_RUNTIME_EDITOR_URL: `VERIFIED / NOT RECORDED`
- WEB_APP_DEPLOYMENT_URL: `VERIFIED / NOT RECORDED`
- DEPLOYMENT_ID: `VERIFIED / NOT RECORDED`
- DEPLOYMENT_VERSION: `58`
- ENVIRONMENT: personal DEV / qualification

Important: this is a standalone Apps Script project. It is not container-bound to `Knowledge Platform Backend` or `Knowledge Platform Audit`.

Version 57 remains the historical CODEX-19 baseline. CODEX-21 delivered and read back only the two changed production source files, created immutable version 58, and updated the same existing private Web App deployment once.

## Data and control artifacts

### Backend Spreadsheet

- NAME: `Knowledge Platform Backend`
- FILE_ID: `1ZExmf_5fDfWIq-EUt5Jleo8w1IAkKEgwsWng8OJFPwI`
- ROLE: application Backend data store
- EXPECTED_SHEETS: `GP_Master`, `Settings`, `Pitchbook_Index`, `Meeting_Index`, `Option_Master`

### Audit Spreadsheet

- NAME: `Knowledge Platform Audit`
- FILE_ID: `1xPssW3oAxsLPPUTDyGfM8r-4oKhSOaVor3FjsHuz74U`
- ROLE: restricted Audit store

### DEV control folder

- NAME: `KSP-0010-DEV-Control-20260816`
- FOLDER_ID: `1-ayhSMJ_pPiliNtHWvTg5Z3kPGKgdyY7`
- ROLE: isolated DEV control resources

### DEV knowledge folder

- NAME: `KSP-0010-DEV-Knowledge-20260816`
- FOLDER_ID: `11u5FSCPi5xrmD1pVQX4MDUrebW1PxIs7`
- ROLE: isolated DEV knowledge resources

### Knowledge parent folder

- NAME: `KSP DEV Knowledge Parent`
- FOLDER_ID: `1ZKQCvJbs7o0wYzQJN79bzBn0MTkimB7A`

### Product knowledge root observed in source

- NAME: `Private Assets Knowledge`
- DRIVE_FOLDER_ID: `1b9r_NdS2P0Qwb0-cz2Ix1cXNGM0gLb_b`
- ROLE: authoritative knowledge root used by the application; verify environment intent before production-like mutation

## Current Work 0020 runtime state

- ACTIVE_WORK_ID: `0020`
- ACTIVE_DISPATCH_ID: `0020-CODEX-21`
- PRIMARY_COMPLETION_PROVIDER: OpenAI
- WEB_APP_VERSION: `58`
- NATIVE_ACCEPTANCE_STATE: PASS for CODEX-19 behavior and CODEX-21 review hardening
- OPENAI_CONNECTION_STATE: key configured, Vector Store ready, readiness ACTIVE after disable/re-enable and exact unchanged sync
- SMALL_SYNTHETIC_PITCHBOOK_STATE: `DOC-000017` Active and OpenAI Indexed; CODEX-21 exact sync unchanged with one current provider document and grounded citation PASS
- SMALL_SYNTHETIC_MEETING_STATE: `MTG-000005` Active and OpenAI Indexed; CODEX-21 grounded citation PASS without resync
- LARGE_FIXTURE_STATE: old 5–25 MiB size-matrix Pitchbooks include `OPENAI_INDEX_TIMEOUT`; do not broad-retry or mutate for cosmetic cleanup
- GITHUB_DELIVERY_STATE: current main reconciled; three recovery/cleanup findings closed; zero unresolved review threads; PR Open/unmerged and ready for ChatGPT final merge

## Completed CODEX-19 sequence

1. exact-selection, provider-current, partial-failure/readiness and generic-UI defects reproduced deterministically;
2. optional private-admin exact `sourceType + sourceId` sync implemented fail closed;
3. current provider entries no longer reselected solely due stale legacy Pending state;
4. item-level partial failures preserve provider usability and return safe sync diagnostics;
5. exact source delivered/read back once and the same private Web App updated once to version 57;
6. designated small Meeting/Pitchbook query, metadata, lifecycle and final-integrity qualification passed;
7. stable runtime identities verified and intentionally not recorded to preserve the private boundary.

## Completed CODEX-20 integration

- latest main used: `0d9238293b1f5612956e206d22e4e75cfc767694`;
- normal merge commit: `655ce6e00b14e20e8ed6af85cef95d872de4caef`;
- canonical validation: PASS, 325/325;
- runtime deployment/provider/data mutation: none;
- final PR review then identified three unresolved recovery/cleanup defects, so merge was withheld.

## Completed CODEX-21 update

- focused failure injection and canonical 330/330 validation passed;
- exact tested source delivered/read back once;
- immutable version 58 created and the same private Web App updated once;
- stored API key preserved without reading or exposure;
- exact `DOC-000017` sync returned one unchanged current source with no duplicate upload;
- one bounded grounded query each returned the authoritative `DOC-000017` and `MTG-000005` source;
- `DOC-000018` remained one Active row; old large fixtures received zero sync/lifecycle actions;
- Gemini, FULL_OUTPUT, broad sync, new provider resources, and confidential data remained out of scope;
- three review threads resolved; final count zero; PR remains Open and unmerged.

## Update rule

Update this file whenever any material runtime identity changes, including Apps Script project, deployment/version, Backend/Audit artifact, Drive folder/namespace, delivered source commit or environment transition.

Never store API keys, credentials, signed secret-bearing URLs, confidential source contents or provider secret resource IDs here.
