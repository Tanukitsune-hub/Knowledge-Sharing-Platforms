# Knowledge Share Runtime / Artifact Locator

LAST_VERIFIED_AT: 2026-08-31 JST
LAST_VERIFIED_BY: CODEX-01 exact source readback + bounded Work 0025 model-policy/OpenAI qualification
STATUS: ACTIVE / VERIFIED

## Source

- SOURCE_REPOSITORY: `Tanukitsune-hub/Knowledge-Sharing-Platforms`
- DEFAULT_BRANCH: `main`
- WORK_0020_MERGE_COMMIT: `185fd197cd531bf74e77af33b32e82706bebe0b5`
- DEPLOYED_SOURCE_COMMIT: `200898cc0632c6ddf075409369c8b8548d43c330`
- DEPLOYED_SOURCE_DESCRIPTION: Work 0025 CODEX-01 administrator-governed model/thinking policy, exact tested source
- SOURCE_BRANCH_USED_FOR_WORK_0020: `agent/0020-ai-provider-core`
- WORK_0020_STATUS: `ACCEPTED / MERGED`
- LOCAL_WORKSPACE_PATH: `NOT RECORDED IN GITHUB` — keep machine-specific absolute paths local unless explicitly safe and useful

## Application runtime

- TARGET_RUNTIME_TYPE: Google Apps Script V8, standalone project, private Web App
- TARGET_RUNTIME_NAME: `KSP Work 0010 DEV Qualification`
- TARGET_RUNTIME_ID / SCRIPT_ID: `VERIFIED / NOT RECORDED`
- TARGET_RUNTIME_EDITOR_URL: `VERIFIED / NOT RECORDED`
- WEB_APP_DEPLOYMENT_URL: `VERIFIED / NOT RECORDED`
- DEPLOYMENT_ID: `VERIFIED / NOT RECORDED`
- DEPLOYMENT_VERSION: `59`
- ENVIRONMENT: personal DEV / qualification

Important: this is a standalone Apps Script project. It is not container-bound to `Knowledge Platform Backend` or `Knowledge Platform Audit`.

Version 59 is the current verified private-Web-App baseline. It preserves the accepted Work 0020 OpenAI path and adds the Work 0025 administrator-governed model/thinking policy vertical slice.

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

## Accepted Work 0020 runtime state

- ACTIVE_WORK_ID: `NONE — Work 0020 accepted and merged`
- PRIMARY_COMPLETION_PROVIDER: OpenAI
- WEB_APP_VERSION: `58`
- NATIVE_ACCEPTANCE_STATE: PASS
- OPENAI_CONNECTION_STATE: key configured, Vector Store ready, readiness ACTIVE
- SMALL_SYNTHETIC_PITCHBOOK_STATE: `DOC-000017` Active and OpenAI Indexed; exact final sync unchanged with one current provider document and grounded citation PASS
- SMALL_SYNTHETIC_MEETING_STATE: `MTG-000005` Active and OpenAI Indexed; grounded citation PASS
- LARGE_FIXTURE_STATE: old 5–25 MiB size-matrix Pitchbooks include `OPENAI_INDEX_TIMEOUT`; separate follow-up only, not a Work 0020 blocker
- GITHUB_DELIVERY_STATE: PR #26 merged to `main`; zero unresolved review threads at merge

## Work 0025 runtime state

- ACTIVE_WORK_ID: `0025 — CODEX-01 complete / Draft PR #32 open`
- WEB_APP_VERSION: `59`
- MODEL_POLICY_STATE: persisted Settings-backed registry; one current qualified default and one hidden/disabled synthetic profile
- CURRENT_OPENAI_PROFILE: `openai-current-default` / `gpt-5.6-terra` / provider-default thinking
- CURRENT_PROFILE_QUALIFICATION: API access available and File Search qualified
- USER_SELECTOR_STATE: exactly one effective OpenAI model and one provider-default thinking choice; hidden synthetic profile excluded
- OPENAI_CONNECTION_STATE: key configured, Vector Store ready, readiness ACTIVE
- EXACT_SYNC_STATE: `DOC-000017` selected once and returned unchanged with zero failure
- PITCHBOOK_QUERY_STATE: one bounded query returned one authoritative normalized `Pitchbook / DOC-000017` source
- MEETING_QUERY_STATE: one bounded query returned one authoritative normalized `Meeting / MTG-000005` source
- FULL_OUTPUT_STATE: accepted Work 0020 runtime evidence preserved; Work 0025 verified AI controls hidden and did not run FULL_OUTPUT
- FINAL_ROW_STATE: one Active `DOC-000017`, one Active `DOC-000018`, one Active `MTG-000005`
- SIDE_EFFECT_BOUNDARY: no Gemini call, broad sync, large-fixture retry/mutation, confidential data, new Store/Web App/Library or provider fallback

## Follow-up routing

- Next large product slice: Work 0021 structured Knowledge Search / filters / comparison, consuming the completed Work 0025 effective-policy resolver.
- Model/thinking control implementation: Work 0025 CODEX-01 complete; preserve version-59 evidence and route optional discovery/user-preference refinements separately.
- Distribution/install: Work 0023 after intended feature surface stabilization.
- Gemini: re-evaluate near product completion against current APIs/runtime rather than continuing the historical troubleshooting loop now.
- Large OpenAI files: create a separate bounded Work only if representative operating files require asynchronous indexing/progress handling.

## Update rule

Update this file whenever any material runtime identity changes, including Apps Script project, deployment/version, Backend/Audit artifact, Drive folder/namespace, delivered source commit or environment transition.

Never store API keys, credentials, signed secret-bearing URLs, confidential source contents or provider secret resource IDs here.
