# Knowledge Share Runtime / Artifact Locator

LAST_VERIFIED_AT: 2026-09-04 JST
LAST_VERIFIED_BY: Codex during Work 0026 CODEX-01
STATUS: BLOCKED / version-68 modular Web App rendering regression

## Source

- SOURCE_REPOSITORY: `Tanukitsune-hub/Knowledge-Sharing-Platforms`
- DEFAULT_BRANCH: `main`
- WORK_0020_MERGE_COMMIT: `185fd197cd531bf74e77af33b32e82706bebe0b5`
- WORK_0025_MERGE_COMMIT: `121f2a1c4655ece46c7e07163b0d12866600923e`
- WORK_0021_MERGE_COMMIT: `533c849bd1229827ec77cd5ad6506312ea286940`
- WORK_0023_MERGE_COMMIT: `8b0a2ccde4746b061c232f45b6d1d59c7cc5a54f`
- DEPLOYED_SOURCE_COMMIT: `e8885da8b85f286dcfbb3bf8c5b538852cef71a8`
- DEPLOYED_SOURCE_DESCRIPTION: Work 0026 current Gemini implementation plus merged Work 0023 resource loader; target runtime exposes unexpanded modular HTML include directives
- CURRENT_ACTIVE_WORK: `0026 — current Gemini Flash / File Search requalification`
- CURRENT_ACTIVE_DISPATCH: `0026-CODEX-01 — RETURNED / BLOCKED`
- CURRENT_GITHUB_INSTRUCTION: `docs/handoffs/0026-CODEX-01-current-gemini-flash-file-search-requalification-instruction.md`
- ACTIVE_BRANCH: `agent/0026-gemini-current-api-requalification`
- LOCAL_WORKSPACE_PATH: `NOT RECORDED IN GITHUB`

## Accepted application runtime

- TARGET_RUNTIME_TYPE: Google Apps Script V8, standalone project, private Web App
- TARGET_RUNTIME_NAME: `KSP Work 0010 DEV Qualification`
- TARGET_RUNTIME_ID / SCRIPT_ID: `VERIFIED / NOT RECORDED`
- TARGET_RUNTIME_EDITOR_URL: `VERIFIED / NOT RECORDED`
- WEB_APP_DEPLOYMENT_URL: `VERIFIED / NOT RECORDED`
- DEPLOYMENT_ID: `VERIFIED / NOT RECORDED`
- DEPLOYMENT_VERSION: `68`
- ENVIRONMENT: personal DEV / qualification

Immutable-version state:

```text
VERSION_66: prior accepted Work 0021 Web App baseline / no longer deployed
VERSION_67: accidental immutable version / source identical to version 66 at qualification / unused and never deployed
VERSION_68: deployed once in Work 0026 / source readback 82 of 82 / Web App modular include expansion failed
NEXT VERSION: not authorized by returned CODEX-01
```

Version 67 is an operational residual only and must not be deployed.

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
WEB_APP_DEPLOYED_VERSION: 66
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

## Accepted Work 0020 state

- PRIMARY_COMPLETION_PROVIDER: OpenAI
- NATIVE_ACCEPTANCE_STATE: PASS
- SMALL_SYNTHETIC_PITCHBOOK_STATE: `DOC-000017` Active and OpenAI Indexed
- SMALL_SYNTHETIC_MEETING_STATE: `MTG-000005` Active and OpenAI Indexed
- LARGE_FIXTURE_STATE: separate follow-up

## Accepted Work 0025 state

- MODEL_POLICY_STATE: Settings-backed registry with per-thinking qualification
- CURRENT_OPENAI_PROFILE: `openai-current-default` / `gpt-5.6-terra` / provider-default thinking
- CURRENT_PROFILE_QUALIFICATION: PASS
- GITHUB_DELIVERY_STATE: PR #33 merged

## Accepted Work 0023 bundle/installer distribution

```text
PR_35: MERGED
MERGE_COMMIT: 8b0a2ccde4746b061c232f45b6d1d59c7cc5a54f
DETERMINISTIC_BUNDLE_BUILD: PASS
EMBEDDED_HTML_RESOURCE_LOADER: PASS
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
WEB_APP_RENDER_FROM_BUNDLE: PASS
FINAL_BUNDLE_SOURCE_COMMIT: b3556585bd4e9240793ee04a6a5f5f9d6e679561
ISOLATED_IMMUTABLE_VERSION: 2
WORK_0021_RUNTIME_MUTATED: NO
OPENAI_API_CALLED: NO
GEMINI_API_CALLED: NO
LOGIC_VALIDATION: PASS — 402/402
BLOCKER: NONE
```

The isolated qualification set remains under `マイドライブ/Chat GPT-Codex-Only/KSP Work 0023 Qualification`. It proves the personal-DEV one-paste/install/security path and is not a personal-template dependency. Shared Drive/domain-user company qualification remains a later company-environment gate.

## Work 0026 current Gemini baseline

Current preferred official candidate at activation:

```text
MODEL: gemini-3.8-flash
STAGE: stable / GA
FILE_SEARCH: supported
THINKING_LEVELS: low, medium, high
MINIMAL: unsupported
LIVE_TARGET: low / max output 2048
ONLY_ACCESS-ERROR_FALLBACK: gemini-3.7-flash / low / 2048
```

Existing repository/runtime residuals to reconcile:

```text
CURRENT_QUERY_TRANSPORT_DEFAULT: GENERATE_CONTENT
CURRENT_QUERY_THINKING/OUTPUT: fixed low / 2048 rather than selected model-policy tuple
CURRENT_LIVE_MODEL_QUALIFICATION: OpenAI-only
PRIOR_GEMINI_BACKGROUND_INTERACTIONS: provider long-running / no citation
PRIOR_GEMINI_GENERATE_CONTENT: approximately 83 seconds / no citation
```

CODEX-01 safely observed the existing Gemini key as present without reading it, but stopped before Store reconciliation or any provider call because version 68 did not expand modular HTML includes. The branch contains commit `681768824f298eff24439b2ee69c9ce159af1e0e`, which restores file-template evaluation in modular mode while preserving bundle mode. It passed deterministic validation but was not deployed after the runtime blocker because no second version/update was authorized.

## Follow-up routing

- Blocked: version 68 must not be treated as a usable Web App; a new Dispatch must authorize deployment of the tested modular-template repair before Gemini qualification resumes.
- Later company gate: Shared Drive/domain-user and company credential qualification.
- Separate deferred Work: representative large-file indexing qualification.
- Planned after product/provider decisions: historical-material migration and final company rollout.

## Update rule

Update this file whenever a material runtime identity, deployed source, accepted merge, selected Gemini model/transport outcome, or active installation artifact changes.
Never store API keys, credentials, signed secret-bearing URLs, confidential source contents, raw provider payloads, or provider private resource IDs here.
