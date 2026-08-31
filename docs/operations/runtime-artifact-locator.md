# Knowledge Share Runtime / Artifact Locator

LAST_VERIFIED_AT: 2026-08-31 JST
LAST_VERIFIED_BY: Work 0021 CODEX-04 local six-format qualification pause
STATUS: ACTIVE / VERIFIED

## Source

- SOURCE_REPOSITORY: `Tanukitsune-hub/Knowledge-Sharing-Platforms`
- DEFAULT_BRANCH: `main`
- WORK_0020_MERGE_COMMIT: `185fd197cd531bf74e77af33b32e82706bebe0b5`
- WORK_0025_MERGE_COMMIT: `121f2a1c4655ece46c7e07163b0d12866600923e`
- DEPLOYED_SOURCE_COMMIT: `d5af191ad83b990f6023e3e41b53f194db629e4b` — Work 0021 CODEX-03 implementation
- DEPLOYED_SOURCE_DESCRIPTION: Work 0021 CODEX-03 explicit multi-Entity comparison, per-Entity attribution, advanced exact filters and FULL_OUTPUT parity source
- CURRENT_ACTIVE_WORK: `0021 — structured Knowledge Search`
- CURRENT_ACTIVE_DISPATCH: `0021-CODEX-04`
- LOCAL_WORKSPACE_PATH: `NOT RECORDED IN GITHUB`

## Application runtime

- TARGET_RUNTIME_TYPE: Google Apps Script V8, standalone project, private Web App
- TARGET_RUNTIME_NAME: `KSP Work 0010 DEV Qualification`
- TARGET_RUNTIME_ID / SCRIPT_ID: `VERIFIED / NOT RECORDED`
- TARGET_RUNTIME_EDITOR_URL: `VERIFIED / NOT RECORDED`
- WEB_APP_DEPLOYMENT_URL: `VERIFIED / NOT RECORDED`
- DEPLOYMENT_ID: `VERIFIED / NOT RECORDED`
- DEPLOYMENT_VERSION: `63`
- ENVIRONMENT: personal DEV / qualification

Version 63 remains the current private-Web-App deployment. CODEX-04 has not created version 64 or modified the deployment.

## Current CODEX-04 pause

CODEX-04 deterministic/local validation reached `371/371` PASS, then stopped before fixture registration or provider/runtime mutation because the browser-assisted local-file upload bridge was unavailable.

The user reports that Chrome extension `Allow access to file URLs / ファイルのURLへのアクセスを許可する` is already ON. Therefore the root cause is not yet proven to be the permission toggle itself.

```text
TARGET_RUNTIME_QUALIFICATION: BLOCKED / NOT RUN
WEB_APP_VERSION: 63 / UNCHANGED
RUNTIME_MUTATION: NONE
PROVIDER_MUTATION: NONE
NEW_FORMAT_FIXTURES_REGISTERED: 0
BLOCKER: BROWSER_LOCAL_FILE_UPLOAD_BRIDGE_UNAVAILABLE_PENDING_DIAGNOSIS
```

Resume the same `0021-CODEX-04` after diagnosing actual browser mode/profile/session, stale extension state, and local workspace-file readability. Do not mutate Drive/Backend/OpenAI/deployment during diagnosis and do not create CODEX-05 solely for this pause.

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

### DEV knowledge folder

- NAME: `KSP-0010-DEV-Knowledge-20260816`
- FOLDER_ID: `11u5FSCPi5xrmD1pVQX4MDUrebW1PxIs7`

### Knowledge parent folder

- NAME: `KSP DEV Knowledge Parent`
- FOLDER_ID: `1ZKQCvJbs7o0wYzQJN79bzBn0MTkimB7A`

### Product knowledge root observed in source

- NAME: `Private Assets Knowledge`
- DRIVE_FOLDER_ID: `1b9r_NdS2P0Qwb0-cz2Ix1cXNGM0gLb_b`

## Accepted Work 0020 runtime state

- PRIMARY_COMPLETION_PROVIDER: OpenAI
- WEB_APP_VERSION: `58`
- NATIVE_ACCEPTANCE_STATE: PASS
- SMALL_SYNTHETIC_PITCHBOOK_STATE: `DOC-000017` Active and OpenAI Indexed
- SMALL_SYNTHETIC_MEETING_STATE: `MTG-000005` Active and OpenAI Indexed
- LARGE_FIXTURE_STATE: old 5–25 MiB size-matrix Pitchbooks remain a separate follow-up

## Accepted Work 0025 runtime state

- WEB_APP_VERSION: `60`
- MODEL_POLICY_STATE: persisted Settings-backed registry with per-thinking qualification
- CURRENT_OPENAI_PROFILE: `openai-current-default` / `gpt-5.6-terra` / provider-default thinking
- CURRENT_PROFILE_QUALIFICATION: exact tuple qualified
- GITHUB_DELIVERY_STATE: replacement PR #33 merged to `main`

## Work 0021 accepted runtime state through CODEX-03

### CODEX-01

- WEB_APP_VERSION: `61`
- LOGIC_VALIDATION: PASS (`355/355`)

### CODEX-02

- WEB_APP_VERSION: `62`
- LOGIC_VALIDATION: PASS (`360/360`)
- exact in-place attribute reconciliation: PASS
- five modes / FULL_OUTPUT / Gemini-disabled no-failover: PASS

### CODEX-03

- DEPLOYED_SOURCE_COMMIT: `d5af191ad83b990f6023e3e41b53f194db629e4b`
- WEB_APP_VERSION: `63`
- LOGIC_VALIDATION: PASS (`368/368`)
- OPENAI_MULTI_ENTITY_COMPARISON: PASS
- OPENAI_ADVANCED_EXACT_FILTER: PASS
- FULL_OUTPUT_MULTI_ENTITY_PARITY: PASS
- FINAL_PROVIDER_STATE: accepted 16-completed-document baseline structurally unchanged

## CODEX-04 intended final matrix after resume

- FORMAT_SCOPE: `.pdf / .pptx / .xlsx / .docx / .txt / .eml`
- FIXTURE_BUDGET: at most six tiny non-confidential synthetic Pitchbooks through normal registration
- PROHIBITED_TARGETS: `DOC-000018`, old 5–25 MiB timeout fixtures
- PROVIDER_SCOPE: OpenAI only; Gemini disabled/deferred/no-call
- FULL_OUTPUT: Pitchbooks remain reference-only/API-independent
- EXPECTED_VERSION: stay 63 if source unchanged; at most one version 64 if tested Apps Script source changes are required

## Follow-up routing

- Finish CODEX-04, then ChatGPT final review/merge of Work 0021.
- Distribution/install: Work 0023 after Work 0021 acceptance.
- Gemini: re-evaluate near product completion against then-current APIs/runtime.
- Large OpenAI files: separate bounded Work only if representative operating files require it.

## Update rule

Update this file whenever any material runtime identity changes.
Never store API keys, credentials, signed secret-bearing URLs, confidential source contents or provider secret resource IDs here.
