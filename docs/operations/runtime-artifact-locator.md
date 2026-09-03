# Knowledge Share Runtime / Artifact Locator

LAST_VERIFIED_AT: 2026-09-03 JST
LAST_VERIFIED_BY: Work 0021 CODEX-06 final runtime qualification
STATUS: ACTIVE / VERIFIED

## Source

- SOURCE_REPOSITORY: `Tanukitsune-hub/Knowledge-Sharing-Platforms`
- DEFAULT_BRANCH: `main`
- WORK_0020_MERGE_COMMIT: `185fd197cd531bf74e77af33b32e82706bebe0b5`
- WORK_0025_MERGE_COMMIT: `121f2a1c4655ece46c7e07163b0d12866600923e`
- DEPLOYED_SOURCE_COMMIT: `9d7319d1ffe126e8fbd65b373385acd97d5d868d`
- DEPLOYED_SOURCE_DESCRIPTION: Work 0021 complete surface including six-format OpenAI support and strict Google Document/Presentation/Spreadsheets editor URL parsing
- CURRENT_ACTIVE_WORK: `0021 — structured Knowledge Search`
- CURRENT_ACTIVE_DISPATCH: `0021-CODEX-06 — RETURNED / PASS`
- CURRENT_GITHUB_INSTRUCTION: `docs/handoffs/0021-CODEX-06-runtime-version-reconciliation-and-final-full-output-instruction.md`
- LOCAL_WORKSPACE_PATH: `NOT RECORDED IN GITHUB`

## Application runtime

- TARGET_RUNTIME_TYPE: Google Apps Script V8, standalone project, private Web App
- TARGET_RUNTIME_NAME: `KSP Work 0010 DEV Qualification`
- TARGET_RUNTIME_ID / SCRIPT_ID: `VERIFIED / NOT RECORDED`
- TARGET_RUNTIME_EDITOR_URL: `VERIFIED / NOT RECORDED`
- WEB_APP_DEPLOYMENT_URL: `VERIFIED / NOT RECORDED`
- DEPLOYMENT_ID: `VERIFIED / NOT RECORDED`
- DEPLOYMENT_VERSION: `66`
- ENVIRONMENT: personal DEV / qualification

Current immutable-version state from the returned stale CODEX-04 runtime session:

```text
VERSION_65: prior deployed Web App
VERSION_66: current deployed Web App / exact parser-fix source verified 80/80
VERSION_67: accidental immutable version / source identical to version 66 / unused and not deployed
VERSION_68_OR_LATER: not authorized
```

The extra immutable version 67 has no current product effect because it is not deployed. It remains an operational residual.

## Work 0021 accepted product evidence

Six tiny non-confidential Pitchbooks were registered through the normal Web App flow:

```text
DOCX: DOC-000019
EML:  DOC-000020
PDF:  DOC-000021
PPTX: DOC-000022
TXT:  DOC-000023
XLSX: DOC-000024
```

Accepted runtime evidence:

```text
NORMAL_REGISTRATION: PASS — 6/6
OPENAI_EXACT_SYNC: PASS — 6/6
OPENAI_GROUNDED_QUERY_AND_SOURCE_ID: PASS — 6/6
EML_ATTACHMENT_BOUNDARY: PASS
WEB_APP_DEPLOYED_VERSION: 66
GEMINI_API_CALLED: NO
```

The version-65 API-independent FULL_OUTPUT preview failed before artifact creation on `DOC-000022` because its URL parser omitted valid Google Presentation/Spreadsheets editor URL forms. CODEX-06 resolved this defect in version 66: the one final preview returned all six authoritative references without Pitchbook bodies, and the `DOC-000022` link failure did not recur.

Verified root cause:

```text
ROOT_CAUSE: FULL_OUTPUT_GOOGLE_EDITOR_WEBVIEW_URL_SHAPES_OMITTED
DATA_REPAIR_REQUIRED: NO
PROVIDER_REPAIR_REQUIRED: NO
```

The late CODEX-04 local/runtime run implemented the strict parser repair and passed:

```text
FOCUSED: 25/25
CANONICAL: 376/376
APPS_SCRIPT_SOURCE_READBACK: 80/80
LOCAL_SCOPED_COMMIT: 516a323d4ee00b3134e79719303ddf81d52d5b4b
REMOTE_PUSH: rejected after remote advanced
```

## Completed CODEX-06 boundary

CODEX-05 is superseded/not executed because its runtime assumptions became stale.

CODEX-06 matched the tested source, Apps Script HEAD, version 66, and version 67 across 80/80 deployable files, updated the same private Web App once to existing version 66, created no new version, and left version 67 unused.

One API-independent FULL_OUTPUT preview resolved `DOC-000019` through `DOC-000024` as six authoritative references with no Pitchbook body. Final Backend readback returned all six rows Active with Drive links; the safe OpenAI state remained configured, ready, and enabled without a provider API call.

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

## Accepted Work 0020 state

- PRIMARY_COMPLETION_PROVIDER: OpenAI
- WEB_APP_VERSION: `58`
- NATIVE_ACCEPTANCE_STATE: PASS
- SMALL_SYNTHETIC_PITCHBOOK_STATE: `DOC-000017` Active and OpenAI Indexed
- SMALL_SYNTHETIC_MEETING_STATE: `MTG-000005` Active and OpenAI Indexed
- LARGE_FIXTURE_STATE: separate follow-up

## Accepted Work 0025 state

- WEB_APP_VERSION: `60`
- MODEL_POLICY_STATE: Settings-backed registry with per-thinking qualification
- CURRENT_OPENAI_PROFILE: `openai-current-default` / `gpt-5.6-terra` / provider-default thinking
- CURRENT_PROFILE_QUALIFICATION: PASS
- GITHUB_DELIVERY_STATE: PR #33 merged

## Work 0021 accepted state

- CODEX-01: version 61, logic 355/355
- CODEX-02: version 62, logic 360/360, five modes/FULL_OUTPUT/no-failover PASS
- CODEX-03: version 63, logic 368/368, multi-Entity/advanced filters/FULL_OUTPUT PASS
- CODEX-04: version 65, six-format OpenAI sync/query 6/6 and EML attachment boundary PASS
- CODEX-06: version 66, logic 376/376, six-format FULL_OUTPUT reference parity and final read-only integrity PASS

## Follow-up routing

- ChatGPT final review/merge of Work 0021 PR #34.
- Work 0023 bundle/installer follows acceptance.
- Gemini is re-evaluated near product completion.
- Large OpenAI files remain a separate bounded Work if representative files require it.

## Update rule

Update this file whenever a material runtime identity or deployed source changes.
Never store API keys, credentials, signed secret-bearing URLs, confidential source contents, or provider secret resource IDs here.
