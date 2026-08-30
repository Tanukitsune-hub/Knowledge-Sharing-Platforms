# Knowledge Share Runtime / Artifact Locator

LAST_VERIFIED_AT: 2026-08-30 JST
LAST_VERIFIED_BY: ChatGPT + user visual confirmation + Google Drive/Sheets metadata
STATUS: ACTIVE / PARTIALLY VERIFIED

## Source

- SOURCE_REPOSITORY: `Tanukitsune-hub/Knowledge-Sharing-Platforms`
- SOURCE_BRANCH: `agent/0020-ai-provider-core`
- SOURCE_COMMIT: current CODEX-19 handoff head; verify exact branch HEAD before source delivery
- LAST_DEPLOYED_SOURCE_BASELINE: CODEX-18 tested source, existing Web App version 56
- LOCAL_WORKSPACE_PATH: `NOT RECORDED IN GITHUB` — keep machine-specific absolute paths local unless explicitly safe and useful

## Application runtime

- TARGET_RUNTIME_TYPE: Google Apps Script V8, standalone project, private Web App
- TARGET_RUNTIME_NAME: `KSP Work 0010 DEV Qualification`
- TARGET_RUNTIME_ID / SCRIPT_ID: `NOT YET VERIFIED`
- TARGET_RUNTIME_EDITOR_URL: `NOT YET VERIFIED`
- WEB_APP_DEPLOYMENT_URL: `NOT YET VERIFIED`
- DEPLOYMENT_ID: `NOT YET VERIFIED`
- DEPLOYMENT_VERSION: `56`
- ENVIRONMENT: personal DEV / qualification

Important: this is a standalone Apps Script project. It is not container-bound to `Knowledge Platform Backend` or `Knowledge Platform Audit`.

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
- ACTIVE_DISPATCH_ID: `0020-CODEX-19`
- PRIMARY_PROVIDER_UNDER_ACCEPTANCE: OpenAI
- WEB_APP_VERSION: `56`
- NATIVE_ACCEPTANCE_STATE: bounded application repair required
- OPENAI_CONNECTION_STATE_AFTER_CODEX18: credential/store self-test passed; aggregate broad sync later set enabled false/readiness ERROR
- SMALL_SYNTHETIC_PITCHBOOK_STATE: `DOC-000017` OpenAI Indexed
- SMALL_SYNTHETIC_MEETING_STATE: `MTG-000005` OpenAI Indexed
- LARGE_FIXTURE_STATE: old 5–25 MiB size-matrix Pitchbooks include `OPENAI_INDEX_TIMEOUT`; do not broad-retry or mutate for cosmetic cleanup

## Active CODEX-19 sequence

1. reproduce exact-selection, partial-failure/readiness and generic-UI defects deterministically;
2. add optional private-admin exact `sourceType + sourceId` sync;
3. prevent current provider entries from being reselected solely due stale legacy Pending state;
4. preserve provider usability on item-level partial failure and return safe sync diagnostics;
5. deliver/read back exact source once and update the same private Web App at most once;
6. use only designated small synthetic Meeting/Pitchbook sources for native query/lifecycle/final-integrity qualification;
7. record Script ID/editor URL/deployment ID/exec URL if safely observed.

## Next identity verification items

Before or immediately after the next authorized Apps Script/Web App deployment action, record:

1. standalone Apps Script Script ID;
2. stable Apps Script editor URL;
3. existing Web App deployment ID;
4. stable `/exec` Web App URL;
5. deployed version;
6. exact source commit delivered to runtime.

Do not infer these values from a Spreadsheet name. Do not replace `NOT YET VERIFIED` with guesses.

## Update rule

Update this file whenever any material runtime identity changes, including Apps Script project, deployment/version, Backend/Audit artifact, Drive folder/namespace, delivered source commit or environment transition.

Never store API keys, credentials, signed secret-bearing URLs, confidential source contents or provider secret resource IDs here.
