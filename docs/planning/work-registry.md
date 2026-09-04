# Work Registry and Delivery Order

Current as of: 2026-09-04

Status: Active planning source of truth

## Purpose

This registry separates stable Work identity from execution priority.

A `WORK_ID` is an immutable reference to one outcome/theme. It is not a promise that Works will execute in numeric order. Priority and dependency changes are represented through `DELIVERY_ORDER`, `STATUS`, and `NEXT_ACTION`, not by renumbering historical or planned Works.

This file is the canonical portfolio-level view. Work-specific dispatch state remains authoritative in `docs/handoffs/<WORK_ID>-dispatches.md`.

## Identity rules

1. Never renumber, reuse, or recycle an issued Work ID.
2. Never rename historical handoff/report files solely to make numbering look sequential.
3. Keep the same Work ID through implementation, qualification, repair, review, and PR stabilization while the primary outcome remains unchanged.
4. Use a new Dispatch ID for another Codex execution within the same outcome.
5. Create a new Work ID only when the primary outcome/deliverable materially changes.
6. New Work IDs use the next number after the highest already issued ID. Do not fill old numeric gaps retroactively.
7. Numeric Work order does not override the delivery sequence below.
8. Only one Work should normally be `ACTIVE` for implementation. Planning work may be `READY` without competing for the active execution slot.

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
| 2 | 0021 | Structured Knowledge Search, five modes, multi-Entity comparison, six-format matrix | ACCEPTED | 0025 | Preserve merge `533c849b` and version-66 runtime evidence |
| 3 | 0023 | Deterministic single-file bundle and idempotent installer | ACCEPTED | 0021 | Preserve PR #35 merge `8b0a2ccd`, one-paste and installer-security evidence |
| 4 | 0026 | Current Gemini Flash / File Search requalification | ACTIVE | CODEX-03 terminal result complete; PR #36 final review pending | Review PR #36; merge only after ChatGPT acceptance |
| 5 | Unassigned future Work | Representative large-file indexing qualification/recovery | DEFERRED | Representative production-size corpus selected | Allocate a separate Work ID; do not mix with provider recovery |
| 6 | Unassigned future Work | Historical-material migration | PLANNED | Product/provider choice and installer stable | Choose manual/hybrid/selective automation from the actual corpus |
| 7 | Unassigned future Work | Final company-environment qualification and rollout | PLANNED | Company Shared Drive, credentials, permissions and migration approach ready | Qualify actual company Workspace and enabled providers |

## Work 0021 accepted boundary

```text
PR: #34 / MERGED
MERGE_COMMIT: 533c849bd1229827ec77cd5ad6506312ea286940
PRIVATE_WEB_APP_VERSION: 66
CORE_FILTERS_AND_FIVE_MODES: PASS
MULTI_ENTITY_AND_ADVANCED_FILTERS: PASS
OPENAI_SIX_FORMAT_MATRIX: PASS — 6/6
EML_ATTACHMENT_BOUNDARY: PASS
FULL_OUTPUT_SIX_FORMAT_REFERENCE_PARITY: PASS
LOGIC_VALIDATION: PASS — 376/376
BLOCKER: NONE
```

Version 67 is an unused/not-deployed immutable Apps Script version whose source matched version 66 at final qualification. It is an operational residual only and must not be deployed.

## Work 0023 accepted boundary

Work 0023 is complete and merged through PR #35.

```text
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
PERSONAL_DEV_INSTALL/UPGRADE: PASS
RERUN_DUPLICATES: 0
LOGIC_VALIDATION: PASS — 402/402
WORK_0021_RUNTIME_MUTATED: NO
BLOCKER: NONE
```

Shared Drive/domain-user company qualification remains a later environment gate. It was not claimed by the personal-DEV Work 0023 qualification.

## Work 0026 terminal review boundary

Primary outcome: update and requalify the optional Gemini provider against the current official model, File Search, thinking, citation and lifecycle contracts without disturbing accepted OpenAI/FULL_OUTPUT behavior.

Current bounded candidate policy:

```text
PRIMARY: gemini-3.8-flash / low / max output 2048
ACCESS-ERROR FALLBACK ONLY: gemini-3.7-flash / low / max output 2048
MOVING LATEST ALIASES: prohibited
MINIMAL FOR 3.8/3.7: prohibited
BROAD MODEL/TRANSPORT BENCHMARK: prohibited
```

Required terminal provider status:

```text
QUALIFIED
or
DISABLED_EXTERNAL_LIMITATION
or
BLOCKED_PRODUCT_DEFECT
```

`DISABLED_EXTERNAL_LIMITATION` is acceptable only when current deterministic product/API contracts pass, Gemini remains disabled/hidden, and the exact current provider/account/model/transport/quota/terminal/citation limitation is recorded. A generic application qualification failure is not sufficient evidence.

### CODEX-01 closed evidence

CODEX-01 implemented and locally validated the current Gemini API/model-policy contract, then created and deployed version 68 once. Direct target-runtime evidence showed the modular Web App returning literal server include directives, so no Gemini or OpenAI call was made. The tested source repair is commit `681768824f298eff24439b2ee69c9ce159af1e0e`.

```text
CODEX_01_LOGIC_VALIDATION: PASS / 410 of 410
VERSION_68: blocked modular shell / no longer deployed
GEMINI_API_CALLED_IN_CODEX_01: NO
OPENAI_API_CALLED_IN_CODEX_01: NO
CODEX_01_BLOCKER: FULL_WEB_APP_MODULAR_TEMPLATE_INCLUDE_RUNTIME_REGRESSION
```

### CODEX-02 closed evidence

CODEX-02 delivered/read back the repair once, created version 69 and updated the same private Web App once. Root and Knowledge Search passed normal/cache-bypassed smoke with zero literal include directives and zero blocking console errors.

The configured Gemini key and Store were accessible. Exact synchronization of only `DOC-000017` and `MTG-000005` established one active exact-metadata document per source and no duplicates. The required `gemini-3.8-flash / low / 2048` Interactions qualification failed after approximately 79 seconds. Gemini remained disabled/hidden; OpenAI and FULL_OUTPUT were not called.

```text
CURRENT_RUNTIME_VERSION: 69 / shell PASS
DOC-000017_EXACT_GEMINI_DOCUMENTS: 1
MTG-000005_EXACT_GEMINI_DOCUMENTS: 1
GEMINI_DOCUMENT_DUPLICATES: 0
PRIMARY_3_8_LOW_2048_INTERACTIONS: FAIL
GEMINI_3_7_FALLBACK: NOT_USED
OPENAI_API_CALLED: NO
FULL_OUTPUT_LIVE_CALLED: NO
LOGIC_VALIDATION: PASS / 410 of 410
```

### ChatGPT review finding and CODEX-03 resolution

ChatGPT independently reviewed PR head `36d748828e9fd16368266e09d095426126586d06`, the CODEX-02 report, relevant source, tests, review threads and CI state.

The reviewed qualification path previously collapsed materially different failures. CODEX-03 repaired it so HTTP/credential, model/access, provider-terminal, no-answer, no-citation, citation identity/metadata mismatch, and response-shape/application failures remain distinct. Unknown and application failures cannot write `DISABLED_EXTERNAL_LIMITATION`.

```text
PRODUCT_AVAILABILITY_BLOCKER: NONE
WORK_ACCEPTANCE_BLOCKER: NONE
EXACT_EXTERNAL_LIMITATION: HTTP_OR_CREDENTIAL_FAILURE
PR_36: Draft / Open / unmerged / ready for ChatGPT final review
```

CODEX-03 terminal evidence:

```text
FAILURE_CLASSIFICATION_REPAIR: PASS
UNKNOWN_FAILURE_RELABELLED_EXTERNAL: NO
LOGIC_VALIDATION: PASS / 420 of 420
SOURCE_DELIVERY_READBACK: PASS / 82 of 82
CURRENT_RUNTIME_VERSION: 70 / shell PASS
GEMINI_QUERY_CALLS: 1
PRIMARY_3_8_INTERACTIONS_CLASS: HTTP_OR_CREDENTIAL_FAILURE
SECOND_CONTROL: NOT_USED
GEMINI_OPTIONAL_PROVIDER_STATUS: DISABLED_EXTERNAL_LIMITATION
NORMAL_USER_GEMINI_ROUTE_VISIBLE: NO
GEMINI_SOURCE_SYNC_OR_UPLOAD: 0
OPENAI_API_CALLED: NO
FULL_OUTPUT_RUNTIME_CALLED: NO
VERSION_67_DEPLOYED: NO
VERSION_71_OR_HIGHER_CREATED: NO
BLOCKER: NONE
```

Final Dispatch:

`0026-CODEX-03 — RETURNED`

Detailed report:

`docs/handoffs/0026-CODEX-03-gemini-failure-classification-and-bounded-requalification-report.md`

## Scope and review discipline

A current Work is extended only for a blocker that materially affects:

- normal primary-path completion;
- data/source identity or integrity;
- authorization, credentials, or confidential-data safety;
- authoritative citation correctness;
- irreversible or material provider/runtime side effects;
- deterministic or required target-runtime qualification.

Cosmetic UX, exhaustive edge-case hardening, broad benchmarking, and non-blocking operational improvements move to `FIX SOON` or `BACKLOG` rather than extending the active Work indefinitely.

## Update rule

Update this registry when:

- a Work becomes active, accepted, blocked, deferred, or superseded;
- the delivery order changes materially;
- a new Work ID is allocated;
- an outcome is split because its deliverables become materially independent.

Do not update it for routine progress ticks inside one active Dispatch.
