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
| 4 | 0026 | Current Gemini Flash / File Search requalification | ACCEPTED | 0023 | Preserve PR #36 merge `40bb7d40`; Gemini remains disabled on exact external limitation |
| 5 | Unassigned future Work | Representative large-file indexing qualification/recovery | DEFERRED | Representative production-size corpus selected | Allocate a separate Work ID; do not mix with Gemini requalification |
| 6 | Unassigned future Work | Historical-material migration | PLANNED | Product/provider choice and installer stable | Choose manual/hybrid/selective automation from the actual corpus |
| 7 | Unassigned future Work | Final company-environment qualification and rollout | PLANNED | Company Shared Drive, credentials, permissions and migration approach ready | Qualify actual company Workspace and enabled providers |

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

Work 0026 updated the optional Gemini provider path to the current bounded model/File Search/model-policy contract, repaired the modular Apps Script template regression and added fail-closed failure classification that keeps application defects distinct from external/provider failures.

Final accepted state:

```text
PR: #36 / MERGED
MERGE_COMMIT: 40bb7d40506c0839c35742ee0000d89650ff7ad6
PRIVATE_WEB_APP_VERSION: 70
ROOT_AND_KNOWLEDGE_SHELL: PASS
SOURCE_DELIVERY_READBACK: PASS / 82 of 82
DOC-000017_EXACT_GEMINI_DOCUMENTS: 1
MTG-000005_EXACT_GEMINI_DOCUMENTS: 1
GEMINI_DOCUMENT_DUPLICATES: 0
FAILURE_CLASSIFICATION_REPAIR: PASS
UNKNOWN_FAILURE_RELABELLED_EXTERNAL: NO
PRIMARY_GEMINI_TUPLE: gemini-3.8-flash / explicit low / 2048
GEMINI_QUERY_CALLS_IN_FINAL_CAMPAIGN: 1
PRIMARY_3_8_INTERACTIONS_CLASS: HTTP_OR_CREDENTIAL_FAILURE
SECOND_CONTROL: NOT_USED
GEMINI_OPTIONAL_PROVIDER_STATUS: DISABLED_EXTERNAL_LIMITATION
NORMAL_USER_GEMINI_ROUTE_VISIBLE: NO
OPENAI_ACCEPTED_PATH: PRESERVED
OPENAI_API_CALLED_IN_FINAL_CAMPAIGN: NO
FULL_OUTPUT_RUNTIME_CALLED_IN_FINAL_CAMPAIGN: NO
LOGIC_VALIDATION: PASS / 420 of 420
BUNDLE_PARITY: PASS
UNRESOLVED_REVIEW_THREADS: 0
GITHUB_CI_ACTUALLY_RAN: NO / non-blocking
BLOCKER: NONE
```

`DISABLED_EXTERNAL_LIMITATION` is an accepted fail-closed terminal state. It is not a claim that Gemini File Search works. Future Gemini requalification requires materially new provider/account/API evidence and should not reopen Work 0026 by default.

## Scope and review discipline

A current Work is extended only for a blocker that materially affects normal primary-path completion, data/source integrity, authorization/credential safety, authoritative citation correctness, irreversible side effects or required target-runtime qualification.

Cosmetic UX, exhaustive edge-case hardening, broad benchmarking and non-blocking operational improvements move to follow-up rather than extending the active Work indefinitely.

## Update rule

Update this registry when a Work becomes active, accepted, blocked, deferred or superseded; when delivery order materially changes; or when a new Work ID is allocated.
