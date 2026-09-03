# Knowledge Share Runtime / Artifact Locator

LAST_VERIFIED_AT: 2026-09-03 JST
LAST_VERIFIED_BY: Work 0021 CODEX-04 version-65 campaign + ChatGPT Drive/Backend/source read-only reconciliation
STATUS: ACTIVE / VERIFIED

## Source

- SOURCE_REPOSITORY: `Tanukitsune-hub/Knowledge-Sharing-Platforms`
- DEFAULT_BRANCH: `main`
- WORK_0020_MERGE_COMMIT: `185fd197cd531bf74e77af33b32e82706bebe0b5`
- WORK_0025_MERGE_COMMIT: `121f2a1c4655ece46c7e07163b0d12866600923e`
- DEPLOYED_SOURCE_COMMIT: `55190ae567bca37aaa5dabff3a2ac881bf43c427`
- DEPLOYED_SOURCE_DESCRIPTION: Work 0021 CODEX-03 surface plus six-format OpenAI indexing and final XLSX named ZIP-Blob path
- CURRENT_ACTIVE_WORK: `0021 — structured Knowledge Search`
- CURRENT_ACTIVE_DISPATCH: `0021-CODEX-05`
- CURRENT_GITHUB_RESUME_AUTHORIZATION: `docs/handoffs/0021-CODEX-05-google-editor-url-parser-fix-instruction.md`
- LOCAL_WORKSPACE_PATH: `NOT RECORDED IN GITHUB`

## Application runtime

- TARGET_RUNTIME_TYPE: Google Apps Script V8, standalone project, private Web App
- TARGET_RUNTIME_NAME: `KSP Work 0010 DEV Qualification`
- TARGET_RUNTIME_ID / SCRIPT_ID: `VERIFIED / NOT RECORDED`
- TARGET_RUNTIME_EDITOR_URL: `VERIFIED / NOT RECORDED`
- WEB_APP_DEPLOYMENT_URL: `VERIFIED / NOT RECORDED`
- DEPLOYMENT_ID: `VERIFIED / NOT RECORDED`
- DEPLOYMENT_VERSION: `65`
- ENVIRONMENT: personal DEV / qualification

Version 65 is the current deployed runtime. Version 66 is authorized for CODEX-05 but not yet created.

## Work 0021 CODEX-04 returned state

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
WEB_APP_VERSION: 65
GEMINI_API_CALLED: NO
```

The final API-independent FULL_OUTPUT preview failed before artifact creation on `DOC-000022` and CODEX-04 returned.

ChatGPT read-only reconciliation established:

- `DOC-000022` row File ID and URL ID match;
- Drive metadata confirms the same non-trashed raw PPTX and valid `docs.google.com/presentation/d/<id>/...` webViewLink;
- `DOC-000024` similarly uses a valid `docs.google.com/spreadsheets/d/<id>/...` webViewLink;
- the current Knowledge Export parser accepts only `docs.google.com/document/d/...` plus existing `drive.google.com` forms.

```text
ROOT_CAUSE: FULL_OUTPUT_GOOGLE_EDITOR_WEBVIEW_URL_SHAPES_OMITTED
DATA_REPAIR_REQUIRED: NO
PROVIDER_REPAIR_REQUIRED: NO
FULL_OUTPUT_FORMAT_REFERENCE_PARITY: FAIL
```

Because CODEX-04 had already returned, the parser repair is a distinct execution request: `0021-CODEX-05`.

CODEX-05 is authorized for exactly one additional immutable Apps Script version and one update of the same private Web App, expected version 66. It permits only the strict Presentation/Spreadsheets URL-parser repair, one FULL_OUTPUT preview, and final read-only integrity. It does not permit repeat registration, OpenAI sync/query, Gemini, broad operations, or version 67.

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

## Work 0021 accepted state through CODEX-03

- CODEX-01: version 61, logic 355/355
- CODEX-02: version 62, logic 360/360, five modes/FULL_OUTPUT/no-failover PASS
- CODEX-03: version 63, logic 368/368, multi-Entity/advanced filters/FULL_OUTPUT PASS

## Follow-up routing

- Complete CODEX-05 strict Google editor URL parser repair and final FULL_OUTPUT gate.
- Then ChatGPT final review/merge of Work 0021.
- Work 0023 bundle/installer follows acceptance.
- Gemini is re-evaluated near product completion.
- Large OpenAI files remain a separate bounded Work if representative files require it.

## Update rule

Update this file whenever a material runtime identity or deployed source changes.
Never store API keys, credentials, signed secret-bearing URLs, confidential source contents, or provider secret resource IDs here.
