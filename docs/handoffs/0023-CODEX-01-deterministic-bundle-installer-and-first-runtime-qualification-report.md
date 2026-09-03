# Work 0023 — CODEX-01 deterministic bundle, installer core, and first runtime qualification report

WORK_ID: `0023`
DISPATCH_ID: `0023-CODEX-01`
BALL: `CHATGPT`
STATUS: `RETURNED`
MODE: `BUILD / QUALIFICATION`

## Outcome

The modular `src/` tree remains authoritative. A deterministic single-file Apps Script release kit and guarded installer/readiness path were implemented and qualified through the authorized first isolated runtime slice.

The exact generated bundle was pasted once into one `Code.gs`, saved, parsed by Apps Script, exposed both installer functions in the editor selector, and executed successfully. The first run reached `READY_FOR_DEPLOYMENT`; an authorized rerun created zero duplicate resources. One restricted Web App version was then created in the isolated project, readiness reached `READY`, and the representative top-level product surfaces rendered from the embedded bundle resources.

The available safe target was a personal DEV folder, not a test Shared Drive. This proves the first one-paste/installer/Web App slice only and is not represented as complete company Shared Drive qualification.

## Implementation

- Added an explicit reviewed source-order manifest covering every authoritative server and HTML source exactly once.
- Added deterministic bundle generation and validation, including canonical payload hash and final-file checksum verification.
- Embedded 22 HTML resources inertly and routed modular/bundle rendering through one resource-loader abstraction.
- Added guarded `installKnowledgeShare()` and `checkKnowledgeShareReadiness()` editor entry points.
- Reused the existing setup/validation engine and retained fail-closed bound-Spreadsheet, identity, administrator, and duplicate-resource checks.
- Added the human-readable `KnowledgeShare_Installation` status sheet and persisted release/schema/source/profile/payload metadata.
- Kept OpenAI, Gemini, and recurring AI synchronization disabled by default.
- Added focused build, runtime-parity, authorization, idempotency, partial-resume, and failure-path tests.

Generated release kit:

```text
dist/KnowledgeShare.bundle.gs
dist/appsscript.json
dist/release-manifest.json
dist/INSTALL.md
```

## Deterministic evidence

```text
RELEASE_VERSION: 0.1.2
SCHEMA_VERSION: 6
BUNDLE_PROFILE: company-single-file-v1
BUNDLE_SOURCE_COMMIT: 363842e94182284c80001b19a4641e2a622f5ad1
BUNDLE_BYTE_COUNT: 935143
BUNDLE_CHARACTER_COUNT: 902369
BUNDLE_LINE_COUNT: 15496
SERVER_SOURCE_COUNT: 59
EMBEDDED_HTML_RESOURCE_COUNT: 22
REPEATED_BUILD_BYTE_IDENTITY: PASS
BUNDLE_PAYLOAD_HASH_RECOMPUTATION: PASS
BUNDLE_FILE_CHECKSUM_RECOMPUTATION: PASS
SOURCE_ORDER_AND_COVERAGE: PASS
COMBINED_SERVER_PARSE: PASS
EMBEDDED_CLIENT_SCRIPT_PARSE: PASS
SECRET_PRIVATE_ID_LOCAL_PATH_FIXTURE_SCAN: PASS
```

`npm run check:bundle` passed 14/14 focused tests. The canonical repository suite passed 390/390 tests.

## Target-runtime evidence

Safe isolated location:

```text
マイドライブ/Chat GPT-Codex-Only/KSP Work 0023 Qualification
LOCATION_CLASSIFICATION: PERSONAL_DEV_ONLY
```

No runtime ID, deployment URL, account identity, or credential is recorded in this report.

Observed sequence:

1. Created one fresh bound host Spreadsheet in the isolated folder.
2. Created one source file and pasted the exact 902,369-character generated bundle once.
3. Saved successfully; Apps Script displayed `installKnowledgeShare` and `checkKnowledgeShareReadiness` as selectable functions.
4. Added only Advanced Drive v3.
5. Authorized and ran `installKnowledgeShare` once; execution completed in about 40 seconds.
6. Confirmed `READY_FOR_DEPLOYMENT`, exact release metadata, required hierarchy, five Backend sheets, and one Audit sheet.
7. Confirmed OpenAI, Gemini, and recurring AI sync settings were `FALSE`.
8. Ran the installer a second time; execution completed in about 19 seconds and every authoritative resource count remained one.
9. Created one immutable version and one restricted, versioned Web App deployment in the isolated project. The platform's built-in HEAD/test deployment remains separate and was not counted as a release deployment.
10. Ran `checkKnowledgeShareReadiness`; the persisted state became `READY` with no error code.
11. Re-read the remote source and proved its only server file still exactly matched `dist/KnowledgeShare.bundle.gs`.
12. Rendered Meeting, Pitchbook, prior Meeting, prior material, GP Workspace, Entity Workspace, Activity Analytics, Relationship Explorer, master maintenance, Knowledge Search, and AI provider settings surfaces. Asynchronous Entity/Analytics/Relationship pages reached their completed states.

The normal one-code-paste editor project used Apps Script's inferred OAuth scope flow. The consent screen showed the required Drive, Docs, Sheets, script-management, and external-request permissions and no Gmail permission. Advanced Drive v3 and the required Drive/Sheets operations worked. Shared Drive behavior and domain-user access remain unobserved because this safe target was personal DEV; therefore OAuth/service qualification is conservatively classified as a partial environment limitation.

Authorization rejection, first-run active/effective-user ambiguity, unauthorized rerun, partial resume, and ambiguous duplicate behavior were proven deterministically. A second live normal-user account was not introduced solely to repeat the forged-call test.

## Side effects and integrity

- Work 0021 Backend, Audit, knowledge folders, Apps Script project, and version-66 Web App were not touched.
- OpenAI and Gemini were not called.
- No provider Store, personal template dependency, Gmail label, trigger, confidential source, or public deployment was created.
- The isolated installer created only its expected host status sheet, folders, Backend, Audit, schema, settings, one immutable version, and one restricted versioned Web App deployment.
- During initial host binding setup, one accidental extra isolated qualification Spreadsheet was identified exactly and moved to Trash. This is recoverable; no out-of-scope item was moved or deleted.
- The final isolated hierarchy contains exactly one host, one knowledge root, one Meeting folder, one Pitchbook folder, one export folder, one Backend, and one Audit.

## Validation

```text
npm run check:bundle: PASS — 14/14
npm run check: PASS — 390/390
python tools/validate_agent_foundation.py: PASS
git diff --check: PASS
GITHUB_CI_ACTUALLY_RAN: NO
```

## Completion latch

```text
SOURCE_ARCHITECTURE: MODULAR_PRESERVED
BUNDLE_BUILD: PASS
SOURCE_ORDER_AND_COVERAGE: PASS
HTML_EMBED_AND_LOADER_PARITY: PASS
BUNDLE_PAYLOAD_HASH: PASS
BUNDLE_FILE_CHECKSUM: PASS
RELEASE_MANIFEST: PASS
BUNDLE_PARSE: PASS
BUNDLE_TEST_PARITY: PASS
INSTALLER_AUTHORIZATION: PASS
INSTALLER_FIRST_RUN_IDENTITY_GATE: PASS
INSTALLER_IDEMPOTENCY: PASS
INSTALLER_PARTIAL_RESUME: PASS
NORMAL_OPERATOR_MANUAL_SOURCE_FILES: 1
BUNDLE_BYTE_COUNT: 935143
BUNDLE_CHARACTER_COUNT: 902369
BUNDLE_LINE_COUNT: 15496
ONE_PASTE_SAVE_AND_EXECUTE: PASS
OAUTH_AND_SERVICE_PARITY: PARTIAL_ENVIRONMENT_LIMITATION
FRESH_INSTALL: PARTIAL_ENVIRONMENT_LIMITATION
FRESH_INSTALL_LOCATION: PERSONAL_DEV_ONLY
WEB_APP_RENDER_FROM_BUNDLE: PASS
RERUN_DUPLICATES_CREATED: 0
WORK_0021_RUNTIME_MUTATED: NO
OPENAI_API_CALLED: NO
GEMINI_API_CALLED: NO
LOGIC_VALIDATION: PASS
GITHUB_CI_ACTUALLY_RAN: NO
STRATEGY_RESET_REQUIRED: NO
READY_FOR_CHATGPT_REVIEW: YES
BLOCKER: NONE
FINAL_COMMIT: reported from the final pushed PR head
PR: #35 / Draft / Open / unmerged
```

Residual follow-up: perform the same bounded install and access checks in an organization-approved Shared Drive/domain-user environment before calling the company deployment path fully qualified.

WORK_ID: `0023`
DISPATCH_ID: `0023-CODEX-01`
BALL: `CHATGPT`
STATUS: `RETURNED`
