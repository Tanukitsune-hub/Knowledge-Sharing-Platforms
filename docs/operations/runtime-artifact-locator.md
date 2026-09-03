# Knowledge Share Runtime / Artifact Locator

LAST_VERIFIED_AT: 2026-09-03 JST
LAST_VERIFIED_BY: Codex Work 0023 CODEX-01 qualification + ChatGPT final-review reconciliation
STATUS: ACTIVE / VERIFIED

## Source

- SOURCE_REPOSITORY: `Tanukitsune-hub/Knowledge-Sharing-Platforms`
- DEFAULT_BRANCH: `main`
- WORK_0020_MERGE_COMMIT: `185fd197cd531bf74e77af33b32e82706bebe0b5`
- WORK_0025_MERGE_COMMIT: `121f2a1c4655ece46c7e07163b0d12866600923e`
- WORK_0021_MERGE_COMMIT: `533c849bd1229827ec77cd5ad6506312ea286940`
- WORK_0021_FINAL_HEAD: `73dde6efd26249e57efbb14f025f5d3c5bf485bf`
- DEPLOYED_SOURCE_COMMIT: `9d7319d1ffe126e8fbd65b373385acd97d5d868d`
- DEPLOYED_SOURCE_DESCRIPTION: accepted Work 0021 surface including six-format OpenAI support and strict Google Document/Presentation/Spreadsheets editor URL parsing
- CURRENT_ACTIVE_WORK: `0023 — generated single-file bundle and idempotent installer`
- CURRENT_ACTIVE_DISPATCH: `0023-CODEX-02 — READY`
- CURRENT_GITHUB_INSTRUCTION: `docs/handoffs/0023-CODEX-02-installer-owner-latch-and-deployment-readiness-security-instruction.md`
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

Immutable-version state:

```text
VERSION_66: current deployed Web App / accepted Work 0021 source verified 80/80
VERSION_67: accidental immutable version / source identical to version 66 at qualification / unused and not deployed
```

Version 67 is an operational residual only and has no product effect.

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

The final API-independent FULL_OUTPUT preview resolved `DOC-000019` through `DOC-000024` as six authoritative references with no Pitchbook body. Final Backend readback returned all six rows Active with Drive links. OpenAI and Gemini were not called in the final dispatch.

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

## Work 0023 CODEX-01 bundle qualification

Work 0023 owns distribution/install only. CODEX-01 preserved the accepted business behavior and runtime evidence above.

CODEX-01 evidence:

```text
PR: #35 / Draft / Open / unmerged
DETERMINISTIC_BUNDLE_BUILD: PASS
EMBEDDED_HTML_RESOURCE_LOADER: PASS
REPRODUCIBLE_RELEASE_HASHES: PASS
SOURCE_AND_BUNDLE_PARITY: PASS
EXACT_ONE_PASTE_FEASIBILITY: PASS
IDEMPOTENT_RERUN: PASS / duplicates 0
WEB_APP_RENDER_FROM_BUNDLE: PASS
FRESH_INSTALL: PARTIAL_ENVIRONMENT_LIMITATION
FRESH_INSTALL_LOCATION: PERSONAL_DEV_ONLY
ISOLATED_RUNTIME_ID / URL: VERIFIED / NOT RECORDED
ISOLATED_IMMUTABLE_VERSION: 1
ISOLATED_VERSIONED_WEB_APP_DEPLOYMENTS: 1
WORK_0021_RUNTIME_MUTATED: NO
OPENAI_API_CALLED: NO
GEMINI_API_CALLED: NO
```

The isolated qualification set is under `マイドライブ/Chat GPT-Codex-Only/KSP Work 0023 Qualification`. This location was used only because no safe test Shared Drive target was available; it is not a product template or company deployment dependency. Runtime IDs and private URLs are intentionally not recorded.

The company installation path remains one code paste plus unavoidable Google platform steps and does not depend on personal Drive, Git, Node.js, terminal, or clasp on the operator machine. Full company qualification still requires an organization-approved Shared Drive/domain-user target.

## Work 0023 final-review findings / CODEX-02

The deterministic bundle and one-paste strategy remain accepted. Three exact release-contract gaps must close before PR #35 merges:

```text
FIRST_INSTALL_OWNER_LATCH: INCOMPLETE
PARTIAL_INSTALL_CROSS_USER_TAKEOVER_REJECTION: INCOMPLETE
WEB_APP_URL_ONLY_READY_REJECTION: FAIL
DEPLOYMENT_SECURITY_ADMIN_ATTESTATION: NOT IMPLEMENTED
MUTABLE_GLOBAL_COLLISION_GATE: INCOMPLETE
```

CODEX-02 must atomically persist the first verified installer before setup mutation, reject a different-user partial resume, require explicit guarded administrator confirmation of deployment access/execute-as settings before `READY`, and add duplicate mutable-global/function-global collision validation. It must regenerate the exact bundle and requalify only the isolated personal-DEV installation.

No Work 0021 runtime or AI provider call is authorized.

## Follow-up routing

- Active: `0023-CODEX-02` installer security completion and bounded personal-DEV requalification.
- Later company gate: Shared Drive/domain-user qualification.
- Deferred near completion: Gemini re-evaluation against then-current APIs/runtime.
- Separate deferred Work: representative large-file indexing qualification if needed by the real corpus.

## Update rule

Update this file whenever a material runtime identity, deployed source, accepted merge, or active installation artifact changes.
Never store API keys, credentials, signed secret-bearing URLs, confidential source contents, or provider secret resource IDs here.
