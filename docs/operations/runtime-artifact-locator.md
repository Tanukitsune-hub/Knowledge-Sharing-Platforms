# Knowledge Share Runtime / Artifact Locator

LAST_VERIFIED_AT: 2026-08-30 JST
LAST_VERIFIED_BY: ChatGPT + user visual confirmation + Google Drive metadata
STATUS: ACTIVE / PARTIALLY VERIFIED

## Source

- SOURCE_REPOSITORY: `Tanukitsune-hub/Knowledge-Sharing-Platforms`
- SOURCE_BRANCH: `agent/0020-ai-provider-core`
- SOURCE_COMMIT: `747dc1c905023022c29db4f3f16b6d5ab887cdf7` at last locator update; verify again before deployment
- LOCAL_WORKSPACE_PATH: `NOT RECORDED IN GITHUB` — keep machine-specific absolute paths local; record only when repository visibility and privacy policy make it safe

## Application runtime

- TARGET_RUNTIME_TYPE: Google Apps Script V8, standalone project, private Web App
- TARGET_RUNTIME_NAME: `KSP Work 0010 DEV Qualification`
- TARGET_RUNTIME_ID / SCRIPT_ID: `NOT YET VERIFIED`
- TARGET_RUNTIME_EDITOR_URL: `NOT YET VERIFIED`
- WEB_APP_DEPLOYMENT_URL: `NOT YET VERIFIED`
- DEPLOYMENT_ID: `NOT YET VERIFIED`
- DEPLOYMENT_VERSION: `55`
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
- ROLE: authoritative knowledge root used by the application; verify environment intent before any production-like mutation

## Current Work 0020 runtime state

- ACTIVE_WORK_ID: `0020`
- ACTIVE_DISPATCH_ID: `0020-CODEX-18`
- PRIMARY_PROVIDER_UNDER_ACCEPTANCE: OpenAI
- WEB_APP_VERSION: `55`
- NATIVE_ACCEPTANCE_STATE: user action required
- REQUIRED_SEQUENCE:
  1. private Web App: `APIキーを保存して接続確認`
  2. require `READY_FOR_SYNC`
  3. `資料を同期して利用開始`
  4. bounded Meeting/Pitchbook native qualification
  5. metadata/lifecycle qualification
  6. final native integrity

## Next verification items

At the next authorized Apps Script/Web App interaction, record all of the following before or immediately after the action:

1. standalone Apps Script Script ID;
2. stable Apps Script editor URL;
3. existing Web App deployment ID;
4. stable `/exec` Web App URL;
5. currently deployed version;
6. source branch/commit corresponding to that deployment.

Do not infer these values from a Spreadsheet name. Do not replace `NOT YET VERIFIED` with guesses.

## Update rule

Update this file whenever any material runtime identity changes, including:

- Apps Script project replacement;
- Web App deployment replacement or version update;
- Backend/Audit Spreadsheet replacement;
- Drive control/knowledge folder replacement;
- source branch/commit delivered to runtime;
- environment transition from personal DEV to company runtime.

Never store API keys, credentials, signed secret-bearing URLs, confidential source contents, or provider secret resource IDs here.
