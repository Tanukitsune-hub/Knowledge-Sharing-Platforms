# Knowledge Share Runtime / Artifact Locator

LAST_VERIFIED_AT: 2026-08-31 JST
LAST_VERIFIED_BY: Work 0021 CODEX-03 multi-Entity comparison and advanced exact-filter qualification
STATUS: ACTIVE / VERIFIED

## Source

- SOURCE_REPOSITORY: `Tanukitsune-hub/Knowledge-Sharing-Platforms`
- DEFAULT_BRANCH: `main`
- WORK_0020_MERGE_COMMIT: `185fd197cd531bf74e77af33b32e82706bebe0b5`
- WORK_0025_MERGE_COMMIT: `121f2a1c4655ece46c7e07163b0d12866600923e`
- DEPLOYED_SOURCE_COMMIT: `d5af191ad83b990f6023e3e41b53f194db629e4b` implementation commit; final CODEX-03 documentation commit follows on the same branch
- DEPLOYED_SOURCE_DESCRIPTION: Work 0021 CODEX-03 explicit multi-Entity comparison, per-Entity attribution, advanced exact filters and FULL_OUTPUT parity source
- SOURCE_BRANCH_USED_FOR_WORK_0020: `agent/0020-ai-provider-core`
- SOURCE_BRANCH_USED_FOR_WORK_0025: `agent/0025-model-thinking-policy`
- WORK_0020_STATUS: `ACCEPTED / MERGED`
- WORK_0025_STATUS: `ACCEPTED / MERGED`
- CURRENT_ACTIVE_WORK: `0021 — structured Knowledge Search`
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

Version 63 is the current private-Web-App deployment. It preserves the accepted Work 0020/0025 source and policy baseline plus the Work 0021 version-62 core, and adds explicit 2–5 Entity comparison, per-Entity authoritative citation attribution, exact Related GP / Meeting Type filters, and matching FULL_OUTPUT semantics. Exact source readback passed `80/80`; bounded OpenAI comparison, advanced-filter and FULL_OUTPUT runtime gates passed.

No later Work 0021 dispatch may create another immutable version without a fresh committed instruction and deterministic validation. Active final planned dispatch is CODEX-04 bounded six-format/provider-capability qualification; do not reopen the accepted version-63 comparison/filter qualification absent contradictory evidence.

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
- FULL_OUTPUT_STATE: accepted Work 0020 runtime evidence preserved; Work 0025 verified AI controls hidden and did not run FULL_OUTPUT
- SIDE_EFFECT_BOUNDARY: no Gemini call, broad source sync, large-fixture retry/mutation, confidential data, new Store/Web App/Library or provider fallback
- GITHUB_DELIVERY_STATE: Draft PR #32 closed as transport workaround; exact replacement PR #33 merged to `main`

## Work 0021 starting baseline

- ACTIVE_WORK_ID: `0021`
- STARTING_WEB_APP_VERSION: `60`
- PRIMARY_RUNTIME_ROUTE: OpenAI + FULL_OUTPUT
- GEMINI_STATE: disabled/deferred; safe no-failover behavior must remain
- DESIGNATED_EXISTING_SOURCES: `DOC-000017`, `MTG-000005`
- PROHIBITED_TEST_TARGETS: `DOC-000018` and old 5–25 MiB fixtures unless an explicit later Work authorizes them

## Work 0021 CODEX-01 runtime state

- WEB_APP_VERSION: `61`
- LOGIC_VALIDATION: PASS (`355/355`)
- initial compound-filter runtime blocker returned and was subsequently closed by CODEX-02

## Work 0021 CODEX-02 runtime state

- DEPLOYED_SOURCE_COMMIT: `a16d835`
- WEB_APP_VERSION: `62`
- LOGIC_VALIDATION: PASS (`360/360`)
- ROOT_CAUSE: current-content provider attributes omitted `fund_strategy` and `counterparty_id`; Pitchbook sync source omitted Fund Strategy
- EXACT_ATTRIBUTE_SYNC: in-place metadata reconciliation; no upload or duplicate
- OPENAI_RUNTIME_GATE: PASS
- FIVE_MODE_RUNTIME_CORE: PASS
- FULL_OUTPUT_RUNTIME_PARITY: PASS
- GEMINI_NO_FAILOVER: PASS — no Gemini API call
- FINAL_PROVIDER_STATE: 16/16 completed documents; one current provider document each for `DOC-000017` and `MTG-000005`

## Work 0021 CODEX-03 runtime state

- DEPLOYED_SOURCE_COMMIT: `d5af191ad83b990f6023e3e41b53f194db629e4b`
- WEB_APP_VERSION: `63`
- LOGIC_VALIDATION: PASS (`368/368`; temporal/public-surface validation PASS)
- APPS_SCRIPT_READBACK: PASS (`80/80`)
- OPENAI_MULTI_ENTITY_COMPARISON: PASS — `GP:GP-000031` and `LP_ASSET_OWNER:OPT-CPLP-001`; zero unselected-Entity citations
- OPENAI_ADVANCED_EXACT_FILTER: PASS — exact Related GP + Meeting Type scope returned only authoritative `MTG-000004`
- FULL_OUTPUT_MULTI_ENTITY_PARITY: PASS
- FINAL_PROVIDER_STATE: accepted 16-completed-document baseline structurally unchanged; no sync/upload/index/update/delete/lifecycle operation
- BLOCKER: NONE; ready for CODEX-04
- PRESERVED_STATE: no Gemini call, broad sync/reindex, `DOC-000018` or large-fixture mutation, confidential data, new Store/Web App/Library/endpoint, provider fallback, or FULL_OUTPUT artifact

## Work 0021 CODEX-04 starting boundary

- ACTIVE_DISPATCH_ID: `0021-CODEX-04`
- STARTING_WEB_APP_VERSION: `63`
- PRIMARY_OUTCOME: bounded `pdf / pptx / xlsx / docx / txt / eml` OpenAI capability/citation matrix and final Work 0021 qualification
- EXISTING_FORMAT_INVENTORY: current authoritative Pitchbooks are effectively TXT only for this matrix; no small complete six-format set exists
- AUTHORIZED_NEW_FIXTURES: at most six tiny non-confidential synthetic Pitchbooks through the normal product registration flow
- PROHIBITED: `DOC-000018`, old Matrix-C 5–25 MiB timeout fixtures, broad sync, Gemini live call, new provider/runtime infrastructure
- DEPLOYMENT_RULE: if source changes, at most one new immutable version and one update of the same private Web App; if source does not change, keep version 63 rather than making a no-op deployment

## Follow-up routing

- Work 0021 CODEX-04 is the final planned search-product dispatch. On PASS, return PR #34 for ChatGPT final merge.
- Distribution/install: Work 0023 after Work 0021 merge.
- Gemini: re-evaluate near product completion against current APIs/runtime rather than continuing the historical troubleshooting loop now.
- Large OpenAI files: create a separate bounded Work only if representative operating files require asynchronous indexing/progress handling.

## Update rule

Update this file whenever any material runtime identity changes, including Apps Script project, deployment/version, Backend/Audit artifact, Drive folder/namespace, delivered source commit or environment transition.

Never store API keys, credentials, signed secret-bearing URLs, confidential source contents or provider secret resource IDs here.
