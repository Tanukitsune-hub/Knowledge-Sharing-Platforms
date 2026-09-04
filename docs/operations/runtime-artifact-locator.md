# Knowledge Share Runtime / Artifact Locator

LAST_VERIFIED_AT: 2026-09-04 JST
LAST_VERIFIED_BY: Codex during 0026-CODEX-02 target-runtime qualification
STATUS: ACTIVE / Web App version 69 shell qualified; Gemini disabled on external limitation

## Source

- SOURCE_REPOSITORY: `Tanukitsune-hub/Knowledge-Sharing-Platforms`
- DEFAULT_BRANCH: `main`
- WORK_0020_MERGE_COMMIT: `185fd197cd531bf74e77af33b32e82706bebe0b5`
- WORK_0025_MERGE_COMMIT: `121f2a1c4655ece46c7e07163b0d12866600923e`
- WORK_0021_MERGE_COMMIT: `533c849bd1229827ec77cd5ad6506312ea286940`
- WORK_0023_MERGE_COMMIT: `8b0a2ccde4746b061c232f45b6d1d59c7cc5a54f`
- DEPLOYED_SOURCE_COMMIT: `a467dae183707af8e925aba12bfa96912bdb790f`
- DEPLOYED_SOURCE_DESCRIPTION: Work 0026 current Gemini implementation plus modular-template repair; exact source readback passed before version 69 creation
- MODULAR_TEMPLATE_REPAIR_COMMIT: `681768824f298eff24439b2ee69c9ce159af1e0e`
- CURRENT_ACTIVE_WORK: `0026 — terminal / ready for ChatGPT final review`
- CURRENT_ACTIVE_DISPATCH: `0026-CODEX-02 — RETURNED`
- CURRENT_GITHUB_INSTRUCTION: `docs/handoffs/0026-CODEX-02-runtime-template-repair-and-gemini-qualification-instruction.md`
- ACTIVE_BRANCH: `agent/0026-gemini-current-api-requalification`
- PR: `#36 / Draft / Open / unmerged`
- LOCAL_WORKSPACE_PATH: `NOT RECORDED IN GITHUB`

## Accepted application runtime

- TARGET_RUNTIME_TYPE: Google Apps Script V8, standalone project, private Web App
- TARGET_RUNTIME_NAME: `KSP Work 0010 DEV Qualification`
- TARGET_RUNTIME_ID / SCRIPT_ID: `VERIFIED / NOT RECORDED`
- TARGET_RUNTIME_EDITOR_URL: `VERIFIED / NOT RECORDED`
- WEB_APP_DEPLOYMENT_URL: `VERIFIED / NOT RECORDED`
- DEPLOYMENT_ID: `VERIFIED / NOT RECORDED`
- DEPLOYMENT_VERSION: `69`
- ENVIRONMENT: personal DEV / qualification

Immutable-version state:

```text
VERSION_66: prior accepted Work 0021 Web App baseline / no longer deployed
VERSION_67: accidental immutable version / source identical to version 66 at qualification / unused and never deploy
VERSION_68: prior Work 0026 source / modular include expansion failed / no longer deployed
VERSION_69: current deployed Work 0026 source / exact readback 82 of 82 / root and Knowledge Search shell PASS
VERSION_70_OR_HIGHER: not created / not authorized in CODEX-02
```

## Work 0021 accepted product evidence

```text
PR_34: MERGED
MERGE_COMMIT: 533c849bd1229827ec77cd5ad6506312ea286940
NORMAL_REGISTRATION: PASS — 6/6
OPENAI_EXACT_SYNC: PASS — 6/6
OPENAI_GROUNDED_QUERY_AND_SOURCE_ID: PASS — 6/6
EML_ATTACHMENT_BOUNDARY: PASS
FULL_OUTPUT_SIX_FORMAT_REFERENCE_PARITY: PASS
LOGIC_VALIDATION: PASS — 376/376
ACCEPTED_WEB_APP_VERSION: 66
UNRESOLVED_REVIEW_THREADS: 0
GITHUB_CI_ACTUALLY_RAN: NO
BLOCKER: NONE
```

The final API-independent FULL_OUTPUT preview resolved `DOC-000019` through `DOC-000024` as six authoritative references with no Pitchbook body. Final Backend readback returned all six rows Active with Drive links.

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

## Accepted Work 0020 / 0025 reference

```text
PRIMARY_COMPLETION_PROVIDER: OpenAI
SMALL_SYNTHETIC_PITCHBOOK: DOC-000017 / Active / OpenAI Indexed
SMALL_SYNTHETIC_MEETING: MTG-000005 / Active / OpenAI Indexed
OPENAI_MODEL_PROFILE: openai-current-default / gpt-5.6-terra / provider-default
OPENAI_PROFILE_QUALIFICATION: PASS
LARGE_FIXTURE_STATE: separate follow-up
```

## Accepted Work 0023 bundle/installer distribution

```text
PR_35: MERGED
MERGE_COMMIT: 8b0a2ccde4746b061c232f45b6d1d59c7cc5a54f
DETERMINISTIC_BUNDLE_BUILD: PASS
EMBEDDED_HTML_RESOURCE_LOADER: PASS in bundle-mode qualification
REPRODUCIBLE_RELEASE_HASHES: PASS
SOURCE_AND_BUNDLE_PARITY: PASS
EXACT_ONE_PASTE_FEASIBILITY: PASS
FIRST_INSTALL_OWNER_LATCH: PASS
CROSS_USER_PARTIAL_RESUME_REJECTION: PASS
WEB_APP_URL_ONLY_READY_REJECTION: PASS
DEPLOYMENT_SECURITY_ADMIN_ATTESTATION: PASS
MUTABLE_GLOBAL_COLLISION_GATE: PASS
PERSONAL_DEV_INSTALL/UPGRADE: PASS
IDEMPOTENT_RERUN: PASS / duplicates 0
LOGIC_VALIDATION: PASS — 402/402
BLOCKER: NONE at Work 0023 acceptance
```

The Work 0026 modular-runtime regression does not invalidate the accepted one-file bundle result; it exposed that the shared resource loader must preserve `createTemplateFromFile(...)` specifically in modular Apps Script mode. The branch repair does so while keeping bundle mode string-template evaluation.

## Work 0026 final code/provider baseline

Current official candidate baseline rechecked by ChatGPT on 2026-09-04:

```text
MODEL: gemini-3.8-flash
STAGE: stable
FILE_SEARCH: supported
THINKING_LEVELS: low, medium, high
MINIMAL: unsupported
LIVE_TARGET: explicit low / max output 2048
ONLY_ACCESS-ERROR_FALLBACK: gemini-3.7-flash / low / 2048
INTERACTIONS_ENDPOINT: /v1beta/interactions
FILE_SEARCH_FILTER: metadata_filter
CITATION: file_citation
```

Current branch and runtime after CODEX-02:

```text
QUERY_TRANSPORT_DEFAULT: INTERACTIONS
QUERY_REQUEST_PROFILE_VERSION: gemini-interactions-file-search-v2
NORMAL_GEMINI_REQUEST: server-resolved model/thinking/output/store identity
GEMINI_ADMIN_FLOW: implemented / deterministic and runtime PASS through exact tuple attempt
GEMINI_EXACT_TUPLE_QUALIFICATION: FAIL / 3.8 low 2048 returned safe final failure after approximately 79 seconds
GEMINI_ROUTE_VISIBILITY: hidden because exact tuple did not qualify
MODULAR_TEMPLATE_REPAIR: implemented / deployed / root and Knowledge Search PASS
LOGIC_VALIDATION: PASS / 410 of 410
BUNDLE_BYTES: 971044
BUNDLE_SHA256: c234c849ad86571140622ca5a4913dbf04122d9dc81642a4710a3ebabf3f5c75
```

CODEX-02 safely confirmed the existing Gemini key and Store, exact-synchronized only `DOC-000017` and `MTG-000005`, and established one active metadata-matching Gemini document per source with no duplicate. The 3.8 exact-tuple qualification did not produce the required grounded answer and authoritative citation. No explicit model-access/model-unsupported response opened the 3.7 fallback, so Gemini remains `DISABLED_EXTERNAL_LIMITATION` and absent from normal-user choices. OpenAI remains active and was not called.

## CODEX-02 completed budget

CODEX-02 may perform at most:

```text
APPS_SCRIPT_SOURCE_DELIVERY: 1 / complete
NEW_IMMUTABLE_VERSION: 1 / version 69
SAME_PRIVATE_WEB_APP_UPDATE: 1 / 68 -> 69
VERSION_67_DEPLOYMENT: NO
VERSION_70_OR_HIGHER: NO
OPENAI_API_CALLS: 0
FULL_OUTPUT_RUNTIME_CALLS: 0
```

Root and Knowledge Search showed zero literal include directives and completed normal bootstrap before the first Gemini call. The bounded provider campaign reused the existing Store and touched only the two authorized small synthetic sources.

## Follow-up routing

- Final review: PR #36 with Work 0026 terminal status `DISABLED_EXTERNAL_LIMITATION`.
- Later company gate: Shared Drive/domain-user and company credential qualification.
- Separate deferred Work: representative large-file indexing qualification.
- Planned after product/provider decisions: historical-material migration and final company rollout.

## Update rule

Update this file whenever a material runtime identity, deployed source, accepted merge, selected Gemini model/transport outcome, or active installation artifact changes.
Never store API keys, credentials, signed secret-bearing URLs, confidential source contents, raw provider payloads, or provider private resource IDs here.
