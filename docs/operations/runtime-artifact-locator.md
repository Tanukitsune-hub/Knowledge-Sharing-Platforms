# Knowledge Share Runtime / Artifact Locator

LAST_VERIFIED_AT: 2026-09-03 JST
LAST_VERIFIED_BY: Work 0021 CODEX-04 human-assisted six-format runtime campaign
STATUS: ACTIVE / VERIFIED

## Source

- SOURCE_REPOSITORY: `Tanukitsune-hub/Knowledge-Sharing-Platforms`
- DEFAULT_BRANCH: `main`
- WORK_0020_MERGE_COMMIT: `185fd197cd531bf74e77af33b32e82706bebe0b5`
- WORK_0025_MERGE_COMMIT: `121f2a1c4655ece46c7e07163b0d12866600923e`
- DEPLOYED_SOURCE_COMMIT: `5139268` — Work 0021 CODEX-04 first XLSX normalized-index implementation
- DEPLOYED_SOURCE_DESCRIPTION: Work 0021 CODEX-03 accepted surface plus first XLSX normalized OpenAI indexing path; final ZIP-Blob correction at `55190ae` is not deployed
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
- DEPLOYMENT_VERSION: `64`
- ENVIRONMENT: personal DEV / qualification

Version 64 is the current private-Web-App deployment. CODEX-04 created exactly one immutable version and updated the same existing private Web App exactly once.

## Current CODEX-04 pause

The user manually selected all six validated fixtures through the normal native chooser, and the ordinary Web App registration path created six Active authoritative Pitchbooks, `DOC-000019` through `DOC-000024`. The Chrome automation chooser defect is now `FIX SOON / external tooling` rather than a product blocker.

PDF `DOC-000021` and PPTX `DOC-000022` exact OpenAI-only sync passed. Native XLSX `DOC-000024` returned safe `OPENAI_HTTP_400`. Version 64 introduced deterministic XLSX cell-text normalization, but its one exact runtime retry stopped before provider upload with `AI_XLSX_MALFORMED`. The final source correction presents signed bytes as a named ZIP Blob and passes `373/373`; it is committed at `55190ae` but not deployed because the dispatch's one-version/one-update budget is exhausted.

```text
TARGET_RUNTIME_QUALIFICATION: BLOCKED / PARTIAL
WEB_APP_VERSION: 64
NEW_FORMAT_FIXTURES_REGISTERED: 6
OPENAI_EXACT_SYNC_PASS: PDF / PPTX
OPENAI_XLSX: BLOCKED before provider upload on version 64
BLOCKER: VERSION_64_RUNTIME_FINDING_REQUIRES_ONE_ADDITIONAL_BOUNDED_DEPLOYMENT
```

Do not create CODEX-05. Resume the same `0021-CODEX-04` only with explicit authorization for one additional immutable version and one update of the same existing private Web App. Do not repeat registration or the successful PDF/PPTX exact sync.

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

## CODEX-04 remaining final matrix

- FORMAT_SCOPE: `.pdf / .pptx / .xlsx / .docx / .txt / .eml`
- FIXTURE_BUDGET: at most six tiny non-confidential synthetic Pitchbooks through normal registration
- PROHIBITED_TARGETS: `DOC-000018`, old 5–25 MiB timeout fixtures
- PROVIDER_SCOPE: OpenAI only; Gemini disabled/deferred/no-call
- FULL_OUTPUT: Pitchbooks remain reference-only/API-independent
- CURRENT_VERSION: 64
- FINAL_SOURCE_PENDING_DEPLOYMENT: `55190ae` named ZIP-Blob correction
- REQUIRED_EXCEPTION: one additional bounded immutable version and same-Web-App update

## Follow-up routing

- Finish CODEX-04, then ChatGPT final review/merge of Work 0021.
- Distribution/install: Work 0023 after Work 0021 acceptance.
- Gemini: re-evaluate near product completion against then-current APIs/runtime.
- Large OpenAI files: separate bounded Work only if representative operating files require it.

## Update rule

Update this file whenever any material runtime identity changes.
Never store API keys, credentials, signed secret-bearing URLs, confidential source contents or provider secret resource IDs here.
