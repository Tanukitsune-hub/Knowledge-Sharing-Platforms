# Work Registry and Delivery Order

Current as of: 2026-09-04

Status: Active planning source of truth

## Purpose

This registry separates stable Work identity from execution priority.

A `WORK_ID` is an immutable reference to one outcome/theme. It is not a promise that Works will execute in numeric order. Priority and dependency changes are represented through `DELIVERY_ORDER`, `STATUS`, and `NEXT_ACTION`, not by renumbering historical or planned Works.

Work-specific dispatch state remains authoritative in `docs/handoffs/<WORK_ID>-dispatches.md`.

## Identity rules

1. Never renumber, reuse, or recycle an issued Work ID.
2. Keep the same Work ID through implementation, qualification, repair, review and PR stabilization while the primary outcome remains unchanged.
3. Use a new Dispatch ID for each new Codex execution within the same outcome.
4. Create a new Work ID only when the primary outcome materially changes.
5. Only one Work should normally be ACTIVE for implementation.

## Status vocabulary

```text
ACCEPTED   — merged/closed outcome; retained as evidence
ACTIVE     — current implementation Work
READY      — fully planned and next in queue
PLANNED    — accepted future outcome, not yet ready to execute
DEFERRED   — intentionally postponed until a stated dependency/phase
BLOCKED    — cannot proceed because of a material external or technical blocker
SUPERSEDED — outcome replaced by another explicit decision/Work
```

## Current delivery sequence

| Delivery order | Work ID | Outcome | Status | Dependency | Next action |
|---:|---|---|---|---|---|
| 0 | 0020 | AI provider core, OpenAI File Search, citations, lifecycle, full output | ACCEPTED | — | Preserve accepted OpenAI/FULL_OUTPUT evidence |
| 1 | 0025 | Administrator-governed model and thinking/reasoning selection | ACCEPTED | 0020 | Preserve exact tuple qualification and admin/user policy |
| 2 | 0021 | Structured Knowledge Search, five modes, multi-Entity comparison, six-format matrix | ACCEPTED | 0025 | Preserve merge `533c849b` and version-66 evidence |
| 3 | 0023 | Deterministic single-file bundle and idempotent installer | ACCEPTED | 0021 | Preserve PR #35 merge `8b0a2ccd` and installer-security evidence |
| 4 | 0026 | Current Gemini Flash / File Search requalification | ACCEPTED | 0023 | Preserve PR #36 merge `40bb7d40`; its one-call failure remains historical evidence |
| 5 | 0027 | Gemini GAS transient resilience and synthetic File Search E2E qualification | BLOCKED | CODEX-02 3.7 answer/citation returned but exact citation identity failed | Allocate `0027-CODEX-03` only for the verified citation identity/metadata mismatch |
| 6 | Unassigned future Work | Representative large-file indexing qualification/recovery | DEFERRED | Small synthetic provider path qualified | Allocate a separate Work ID; do not mix with 0027 |
| 7 | Unassigned future Work | Historical-material migration | PLANNED | Product/provider choice and installer stable | Choose manual/hybrid/selective automation from the actual corpus |
| 8 | Unassigned future Work | Final company-environment qualification and rollout | PLANNED | Company Shared Drive, credentials, permissions and migration approach ready | Qualify actual company Workspace and enabled providers |

## Work 0021 accepted boundary

```text
PR: #34 / MERGED
MERGE_COMMIT: 533c849bd1229827ec77cd5ad6506312ea286940
PRIVATE_WEB_APP_VERSION: 66
CORE_FILTERS_AND_FIVE_MODES: PASS
MULTI_ENTITY_AND_ADVANCED_FILTERS: PASS
OPENAI_SIX_FORMAT_MATRIX: PASS / 6 of 6
EML_ATTACHMENT_BOUNDARY: PASS
FULL_OUTPUT_SIX_FORMAT_REFERENCE_PARITY: PASS
LOGIC_VALIDATION: PASS / 376 of 376
BLOCKER: NONE
```

Version 67 is an unused/not-deployed immutable Apps Script version and must not be deployed.

## Work 0023 accepted boundary

```text
PR: #35 / MERGED
MERGE_COMMIT: 8b0a2ccde4746b061c232f45b6d1d59c7cc5a54f
SOURCE_ARCHITECTURE: MODULAR_PRESERVED
DETERMINISTIC_SINGLE_FILE_BUNDLE: PASS
ONE_PASTE_SAVE_AND_EXECUTE: PASS
BUNDLE_HASHES_AND_MANIFEST: PASS
INSTALLER_OWNER_LATCH: PASS
CROSS_USER_PARTIAL_TAKEOVER_REJECTION: PASS
DEPLOYMENT_SECURITY_ATTESTATION: PASS
WEB_APP_URL_ONLY_READY_REJECTION: PASS
MUTABLE_GLOBAL_COLLISION_GATE: PASS
PERSONAL_DEV_INSTALL_UPGRADE: PASS
RERUN_DUPLICATES: 0
LOGIC_VALIDATION: PASS / 402 of 402
BLOCKER: NONE
```

Shared Drive/domain-user company qualification remains a later environment gate.

## Work 0026 accepted boundary

Work 0026 updated the optional Gemini provider path, repaired the modular Apps Script template regression and added fail-closed failure classification that keeps application defects distinct from external/provider failures.

```text
PR: #36 / MERGED
MERGE_COMMIT: 40bb7d40506c0839c35742ee0000d89650ff7ad6
PRIVATE_WEB_APP_VERSION: 70
ROOT_AND_KNOWLEDGE_SHELL: PASS
SOURCE_DELIVERY_READBACK: PASS / 82 of 82
DOC-000017_EXACT_GEMINI_DOCUMENTS: 1
MTG-000005_EXACT_GEMINI_DOCUMENTS: 1
GEMINI_DOCUMENT_DUPLICATES: 0
UNKNOWN_FAILURE_RELABELLED_EXTERNAL: NO
PRIMARY_GEMINI_TUPLE: gemini-3.8-flash / explicit low / 2048
PRIMARY_3_8_INTERACTIONS_CLASS: HTTP_OR_CREDENTIAL_FAILURE
GEMINI_OPTIONAL_PROVIDER_STATUS: DISABLED_EXTERNAL_LIMITATION
NORMAL_USER_GEMINI_ROUTE_VISIBLE: NO
OPENAI_ACCEPTED_PATH: PRESERVED
LOGIC_VALIDATION: PASS / 420 of 420
BLOCKER: NONE
```

Post-acceptance company-GAS diagnostics proved general Gemini connectivity, valid basic authentication, target-model visibility and two successful `gemini-3.8-flash` Interactions calls. The historical Work 0026 class is not the current general root-cause conclusion.

## Work 0027 active boundary

Primary outcome:

```text
split authentication from provider-transient failures
-> add bounded safe retry behavior
-> preserve correct GAS resumable-upload behavior
-> qualify one stable Gemini model through upload/index/query/citation/cleanup in personal DEV
```

### CODEX-01 accepted branch evidence

```text
IMPLEMENTATION_COMMIT: d0456516cae5e65e68d5789e3e8e5338cffd6823
FINAL_COMMIT: 2c6cd20bfe6a4ef3b6262160b4126266307222dd
LOGIC_VALIDATION: PASS / 431 of 431
PRIVATE_WEB_APP_VERSION: 71 / shell PASS
MODELS_VISIBILITY: PASS
SHORT_GEMINI_3_8_INTERACTIONS: PASS
TEMP_STORE_CREATE: PASS
SYNTHETIC_UPLOAD_INDEX_READBACK: PASS / exactly one current document
FILE_SEARCH_QUERY_3_8: HTTP 500 / api_error / PROVIDER_OR_TRANSIENT_FAILURE
TEMP_STORE_DELETE_AND_CONFIRMATION: PASS
GEMINI_NORMAL_USER_ROUTE: disabled and hidden
```

CODEX-01 proves the product upload/index/readback path works. It did not meet the user’s personal-DEV grounded answer and citation objective.

### Strategy reset

```text
ACTIVE_DISPATCH: 0027-CODEX-02
PRIMARY_CANDIDATE: gemini-3.7-flash / explicit low / 2048
QUALIFICATION_ONLY_FALLBACK: gemini-3.6-flash / explicit low / 2048
GEMINI_3_8_RERUN: prohibited
NORMAL_USER_AUTOMATIC_MODEL_FALLBACK: prohibited
TEMP_STORE_AND_DOCUMENT: one shared set
EXPECTED_PRIVATE_WEB_APP_VERSION: 72
```

Work acceptance requires `QUALIFIED_DISABLED` on 3.7 or 3.6 with expected token, exact `file_citation`, authoritative metadata match and cleanup confirmation. Any other safe terminal result retains an exact Work blocker.

### CODEX-02 returned evidence

```text
IMPLEMENTATION_COMMIT: acd3aa0
LOGIC_VALIDATION: PASS / 440 of 440
PRIVATE_WEB_APP_VERSION: 72 / shell PASS
SOURCE_READBACK: PASS / 82 of 82
GEMINI_3_7_SHORT_INTERACTIONS: PASS / HTTP 200
GEMINI_3_7_FILE_SEARCH_TOKEN: PASS
GEMINI_3_7_FILE_CITATION: PASS / 1
GEMINI_3_7_AUTHORITATIVE_METADATA_MATCH: FAIL
GEMINI_3_6: NOT_RUN / STOP_DISALLOWED
TEMP_RESOURCE_CLEANUP: PASS
GEMINI_NORMAL_USER_ROUTE: disabled and hidden
TERMINAL_OUTCOME: BLOCKED_PRODUCT_DEFECT
WORK_ACCEPTANCE_BLOCKER: GEMINI_3_7_FILE_CITATION_IDENTITY_OR_METADATA_MISMATCH
```

The 3.6 fallback was correctly not called because citation identity/metadata mismatch is a non-progression condition. Accepted OpenAI/FULL_OUTPUT behavior remains available.

Current dispatch:

`0027-CODEX-02 / BALL: CHATGPT / STATUS: RETURNED`

Detailed instruction:

`docs/handoffs/0027-CODEX-02-stable-model-file-search-baseline-instruction.md`

## Scope and review discipline

A current Work is extended only for a blocker that materially affects normal primary-path completion, data/source integrity, authorization/credential safety, authoritative citation correctness, irreversible side effects or required target-runtime qualification.

Cosmetic UX, exhaustive edge-case hardening, broad benchmarking and non-blocking operational improvements move to follow-up rather than extending the active Work indefinitely.

## Update rule

Update this registry when a Work becomes active, accepted, blocked, deferred or superseded; when delivery order materially changes; or when a new Work ID is allocated.
