# Work 0021 — CODEX-06 runtime-version reconciliation and final FULL_OUTPUT report

WORK_ID: `0021`
DISPATCH_ID: `0021-CODEX-06`
BALL: `CHATGPT`
STATUS: `RETURNED`

## Outcome

CODEX-06 reconciled only the strict Google editor URL parser and its deterministic tests from the late CODEX-04 local commit onto the current GitHub branch. No stale CODEX-04 tracking changes were imported.

The tested repository source, current Apps Script HEAD, immutable version 66, and immutable version 67 matched across all 80 deployable files. This directly establishes that version 66 contains the intended parser repair and that no source mutation occurred between versions 66 and 67.

The existing version-65 deployment was independently read back as the unique expected `WEB_APP` entrypoint with HTTPS `/exec`, `MYSELF` access, and `USER_DEPLOYING` execution. It was updated exactly once to existing immutable version 66. Version 67 remains unused and was not deployed. No new immutable version was created.

Exactly one API-independent FULL_OUTPUT preview was run against the six-format fixture scope. It resolved `DOC-000019` through `DOC-000024` exactly once each, included only authoritative Pitchbook reference metadata/links, and included no Pitchbook body marker. Because the deliberate scope was Pitchbook-only, the UI retained its designed no-Meeting hard stop; this prevented artifact creation but did not prevent inspection of the returned 6/6 reference package. The prior `DOC-000022` authoritative-link failure did not recur.

Final read-only Backend search returned the six expected Active records with one Drive link each. The safe administrator status remained OpenAI key configured, Vector Store ready, and OpenAI enabled. No OpenAI or Gemini API call, registration, sync, query, Backend rewrite, source-file mutation, or lifecycle action occurred in this Dispatch.

## Repository reconciliation and validation

```text
STARTING_REMOTE_REF: 757c18b97fd7c099c672e2bdac5594300b6891d7
SCOPED_REFERENCE_COMMIT: 516a323d4ee00b3134e79719303ddf81d52d5b4b
REAPPLIED_PATHS: src/155_KnowledgeExportContracts.gs; tests/knowledge-export.test.cjs
STALE_TRACKING_IMPORTED: NO
SCOPED_BLOB_MATCH_TO_REFERENCE: PASS — 2/2
FOCUSED_KNOWLEDGE_EXPORT_TESTS: PASS — 25/25
LOGIC_VALIDATION: PASS — 376/376
AGENT_FOUNDATION: PASS
TEMPORAL_VALIDATION: PASS
PUBLIC_SURFACE_VALIDATION: PASS
GIT_DIFF_CHECK: PASS
IMPLEMENTATION_COMMIT: 9d7319d1ffe126e8fbd65b373385acd97d5d868d
```

The parser accepts exact HTTPS paths for Google Document, Presentation, and Spreadsheets editors while retaining approved Drive URL forms. HTTP, look-alike hosts, malformed or unsupported paths, missing IDs, and row/Drive identity mismatches remain rejected.

## Version and deployment reconciliation

```text
VERSION_66_EXISTS: YES
VERSION_67_EXISTS: YES
VERSION_68_OR_LATER_EXISTS: NO
TESTED_REPOSITORY_TO_VERSION_66: PASS — 80/80
REMOTE_HEAD_TO_VERSION_66: PASS — 80/80
VERSION_66_TO_VERSION_67: PASS — 80/80
APPS_SCRIPT_VERSION_66_VERIFIED: PASS
SOURCE_PUSH_IN_CODEX_06: 0 — HEAD was already exact
NEW_APPS_SCRIPT_VERSION_CREATED_IN_CODEX_06: NO
PRE_UPDATE_DEPLOYMENT_VERSION: 65
EXISTING_WEB_APP_UPDATE_COUNT: 1
POST_UPDATE_DEPLOYMENT_VERSION: 66
POST_UPDATE_ENTRYPOINT: WEB_APP / HTTPS /exec
POST_UPDATE_ACCESS: MYSELF
POST_UPDATE_EXECUTE_AS: USER_DEPLOYING
VERSION_67_STATE: UNUSED_NOT_DEPLOYED
```

## Final FULL_OUTPUT qualification

The one preview used the exact six-format registration scope: 2026-09-01, the designated synthetic GP, Infrastructure, Equity, `CODEX-04 Six Format Matrix`, and Pitchbook source type.

```text
FULL_OUTPUT_PREVIEW_COUNT: 1
REFERENCE_SOURCE_COUNT: 6
DOC_000019_THROUGH_DOC_000024_PRESENT: PASS — each exactly once
UNEXPECTED_PITCHBOOK_SOURCE_IDS: 0
AUTHORITATIVE_REFERENCE_HEADING: PASS
PITCHBOOK_BODY_MARKER_PRESENT: NO
MEETING_COUNT_IN_EXACT_PITCHBOOK_SCOPE: 0
ARTIFACT_CREATED: NO — designed no-Meeting guard
DOC_000022_LINK_FAILURE_RECURRED: NO
FULL_OUTPUT_FORMAT_REFERENCE_PARITY: PASS
```

The deterministic mixed-source contract continues to prove that Meeting Google Docs text is the only FULL_OUTPUT body content while Pitchbooks remain reference-only. The runtime preview directly proved the repaired six-format reference boundary; it did not attempt to create a reference-only artifact.

## Final read-only integrity

```text
AUTHORITATIVE_ROWS: DOC-000019 through DOC-000024
AUTHORITATIVE_ROW_COUNT: 6
ACTIVE_ROWS: 6/6
DRIVE_LINKS_PRESENT: 6/6
FORMAT_SET: DOCX / EML / PDF / PPTX / TXT / XLSX
OPENAI_SAFE_STATUS: KEY_CONFIGURED / VECTOR_STORE_READY / ENABLED
OPENAI_API_CALLED_IN_DISPATCH: NO
GEMINI_API_CALLED: NO
REGISTRATION_OR_SYNC_REPEATED: NO
BACKEND_ROWS_REWRITTEN: NO
PROVIDER_RESOURCES_MUTATED: NO
```

## Completion latch

```text
REPOSITORY_RECONCILIATION: PASS
GOOGLE_EDITOR_URL_PARSER: PASS
LOGIC_VALIDATION: PASS — 376/376
SOURCE_READBACK: PASS — 80/80
APPS_SCRIPT_VERSION_66_VERIFIED: PASS
APPS_SCRIPT_VERSION_67_STATE: UNUSED_NOT_DEPLOYED
NEW_VERSION_CREATED_IN_CODEX_06: NO
RUNTIME_DEPLOYMENT_VERSION: 66
FULL_OUTPUT_FORMAT_REFERENCE_PARITY: PASS
FINAL_PROVIDER_INTEGRITY: PASS
OPENAI_API_CALLED_IN_DISPATCH: NO
GEMINI_API_CALLED: NO
GITHUB_CI_ACTUALLY_RAN: NO
READY_FOR_CHATGPT_FINAL_MERGE: YES
BLOCKER: NONE
FINAL_COMMIT: final report/tracking commit recorded as PR #34 head
```

WORK_ID: `0021`
DISPATCH_ID: `0021-CODEX-06`
BALL: `CHATGPT`
STATUS: `RETURNED`
