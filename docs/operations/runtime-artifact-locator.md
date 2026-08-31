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
- SOURCE_BRANCH_USED_FOR_WORK_0020: `agent/0020-ai-provider-core`
- SOURCE_BRANCH_USED_FOR_WORK_0025: `agent/0025-model-thinking-policy`
- WORK_0020_STATUS: `ACCEPTED / MERGED`
- WORK_0025_STATUS: `ACCEPTED / MERGED`
- CURRENT_ACTIVE_WORK: `0021 — structured Knowledge Search`
- CURRENT_ACTIVE_DISPATCH: `0021-CODEX-04`
- LOCAL_WORKSPACE_PATH: `NOT RECORDED IN GITHUB` — keep machine-specific absolute paths local unless explicitly safe and useful

## Application runtime

- TARGET_RUNTIME_TYPE: Google Apps Script V8, standalone project, private Web App
- TARGET_RUNTIME_NAME: `KSP Work 0010 DEV Qualification`
- TARGET_RUNTIME_ID / SCRIPT_ID: `VERIFIED / NOT RECORDED`
- TARGET_RUNTIME_EDITOR_URL: `VERIFIED / NOT RECORDED`
- WEB_APP_DEPLOYMENT_URL: `VERIFIED / NOT RECORDED`
- DEPLOYMENT_ID: `VERIFIED / NOT RECORDED`
- DEPLOYMENT_VERSION: `63`
- ENVIRONMENT: personal DEV / qualification

Important: this is a standalone Apps Script project. It is not container-bound to `Knowledge Platform Backend` or `Knowledge Platform Audit`.

Version 63 remains the current private-Web-App deployment. CODEX-04 has not created version 64 or modified the deployment.

## Current CODEX-04 pause

CODEX-04 deterministic/local validation reached `371/371` PASS, then stopped before fixture registration or provider/runtime mutation because the browser-assisted local-file upload bridge was unavailable.

The user reports that Chrome extension `Allow access to file URLs / ファイルのURLへのアクセスを許可する` is already ON. Therefore the root cause is not yet proven to be the permission toggle itself.

Current exact side-effect state:

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

## Accepted Work 0025 runtime state

- ACTIVE_WORK_ID: `NONE — Work 0025 accepted and merged`
- WEB_APP_VERSION: `60`
- MODEL_POLICY_STATE: persisted Settings-backed registry with per-thinking qualification; one current qualified default and one hidden/disabled unqualified synthetic profile
- CURRENT_OPENAI_PROFILE: `openai-current-default` / `gpt-5.6-terra` / provider-default thinking
- CURRENT_PROFILE_QUALIFICATION: exact `gpt-5.6-terra` + provider-default omission + File Search tuple qualified
- USER_SELECTOR_STATE: exactly one effective OpenAI model and one provider-default thinking choice; hidden synthetic profile excluded
- OPENAI_CONNECTION_STATE: key configured, Vector Store ready, readiness ACTIVE
- EXACT_SYNC_STATE: Work 0025 evidence preserved; Work 0021 CODEX-02 exact-synced only `DOC-000017` and refreshed attributes in place without upload
- PITCHBOOK_QUERY_STATE: one bounded query returned expected synthetic facts and an authoritative normalized `Pitchbook / DOC-000017` source; older synthetic citations were read only
- MEETING_QUERY_STATE: one bounded query returned expected synthetic facts and an authoritative normalized `Meeting / MTG-000005` source
- FULL_OUTPUT_STATE: accepted Work 0020 runtime evidence preserved
- SIDE_EFFECT_BOUNDARY: no Gemini call, confidential data, new Store/Web App/Library or provider fallback
- GITHUB_DELIVERY_STATE: Draft PR #32 closed as transport workaround; exact replacement PR #33 merged to `main`

## Work 0021 accepted runtime state through CODEX-03

### CODEX-01

- WEB_APP_VERSION: `61`
- LOGIC_VALIDATION: PASS (`355/355` canonical tests)
- initial compound-filter blocker later closed by CODEX-02

### CODEX-02

- DEPLOYED_SOURCE_COMMIT: `a16d835`
- WEB_APP_VERSION: `62`
- LOGIC_VALIDATION: PASS (`360/360`)
- root cause: metadata-only provider drift plus Pitchbook Fund Strategy source omission
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
- PRESERVED_STATE: no Gemini call, broad sync/reindex, `DOC-000018` or large-fixture mutation, confidential data, new Store/Web App/Library/endpoint, provider fallback, or FULL_OUTPUT artifact

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

Update this file whenever any material runtime identity changes, including Apps Script project, deployment/version, Backend/Audit artifact, Drive folder/namespace, delivered source commit or environment transition.

Never store API keys, credentials, signed secret-bearing URLs, confidential source contents or provider secret resource IDs here.
