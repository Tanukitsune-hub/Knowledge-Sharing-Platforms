# Knowledge Share Runtime / Artifact Locator

LAST_VERIFIED_AT: 2026-08-31 JST
LAST_VERIFIED_BY: Codex browser qualification + Apps Script source/deployment readback + ChatGPT GitHub verification
STATUS: ACTIVE / VERIFIED (sensitive runtime identities intentionally redacted)

## Source

- SOURCE_REPOSITORY: `Tanukitsune-hub/Knowledge-Sharing-Platforms`
- WORK_BRANCH: `agent/0020-ai-provider-core`
- DEPLOYED_SOURCE_COMMIT: `d61dc166c835d65e8bbabd17dc2894b4aef69cd8`
- DEPLOYED_SOURCE_DESCRIPTION: final CODEX-19 exact tested source and qualification records
- CURRENT_GITHUB_INTEGRATION_DISPATCH: `0020-CODEX-20`
- CURRENT_INTEGRATION_HEAD: `NOT YET FINAL — CODEX-20 handoff/tracking commits are newer than the deployed source and make no runtime change`
- LOCAL_WORKSPACE_PATH: `NOT RECORDED IN GITHUB` — keep machine-specific absolute paths local unless explicitly safe and useful

## Application runtime

- TARGET_RUNTIME_TYPE: Google Apps Script V8, standalone project, private Web App
- TARGET_RUNTIME_NAME: `KSP Work 0010 DEV Qualification`
- TARGET_RUNTIME_ID / SCRIPT_ID: `VERIFIED / NOT RECORDED`
- TARGET_RUNTIME_EDITOR_URL: `VERIFIED / NOT RECORDED`
- WEB_APP_DEPLOYMENT_URL: `VERIFIED / NOT RECORDED`
- DEPLOYMENT_ID: `VERIFIED / NOT RECORDED`
- DEPLOYMENT_VERSION: `57`
- ENVIRONMENT: personal DEV / qualification

Important: this is a standalone Apps Script project. It is not container-bound to `Knowledge Platform Backend` or `Knowledge Platform Audit`.

CODEX-20 is GitHub integration-only. It must not create an Apps Script version, update the Web App, call an AI provider, or mutate runtime data. Version 57 remains the deployed target until a later explicitly authorized deployment.

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
- ACTIVE_DISPATCH_ID: `0020-CODEX-20 — GitHub integration only`
- PRIMARY_COMPLETION_PROVIDER: OpenAI
- WEB_APP_VERSION: `57`
- NATIVE_ACCEPTANCE_STATE: PASS / FUNCTIONALLY READY
- OPENAI_CONNECTION_STATE: key configured, Vector Store ready, readiness ACTIVE after disable/re-enable and exact unchanged sync
- SMALL_SYNTHETIC_PITCHBOOK_STATE: `DOC-000017` Active and OpenAI Indexed; exact final sync unchanged without duplicate
- SMALL_SYNTHETIC_MEETING_STATE: `MTG-000005` Active and OpenAI Indexed; native grounded query/citation PASS
- LARGE_FIXTURE_STATE: old 5–25 MiB size-matrix Pitchbooks include `OPENAI_INDEX_TIMEOUT`; do not broad-retry or mutate for cosmetic cleanup
- GITHUB_DELIVERY_STATE: PR #26 requires latest-main reconciliation before final merge

## Completed CODEX-19 sequence

1. exact-selection, provider-current, partial-failure/readiness and generic-UI defects reproduced deterministically;
2. optional private-admin exact `sourceType + sourceId` sync implemented fail closed;
3. current provider entries no longer reselected solely due stale legacy Pending state;
4. item-level partial failures preserve provider usability and return safe sync diagnostics;
5. exact source delivered/read back once and the same private Web App updated once to version 57;
6. designated small Meeting/Pitchbook query, metadata, lifecycle and final-integrity qualification passed;
7. stable runtime identities verified and intentionally not recorded to preserve the private boundary.

## Identity verification result

The standalone Apps Script identity, stable editor target, existing private Web App deployment, access mode and deployed version were directly verified. Their private values are intentionally not stored in this repository.

## CODEX-20 update requirement

Before CODEX-20 returns, replace `CURRENT_INTEGRATION_HEAD` with the exact pushed merge/integration commit and state explicitly that no runtime deployment occurred. Keep `DEPLOYED_SOURCE_COMMIT` pinned to `d61dc166c835d65e8bbabd17dc2894b4aef69cd8` unless a later dispatch explicitly deploys another source.

## Update rule

Update this file whenever any material runtime identity changes, including Apps Script project, deployment/version, Backend/Audit artifact, Drive folder/namespace, delivered source commit or environment transition.

Never store API keys, credentials, signed secret-bearing URLs, confidential source contents or provider secret resource IDs here.
