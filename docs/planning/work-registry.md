# Work Registry and Delivery Order

Current as of: 2026-09-04

Status: Active planning source of truth

## Purpose

This registry separates stable Work identity from execution priority. Work-specific dispatch state remains authoritative in `docs/handoffs/<WORK_ID>-dispatches.md`.

## Identity rules

1. Never renumber, reuse or recycle an issued Work ID.
2. Keep the same Work ID through implementation, qualification, repair, review and PR stabilization while the primary outcome remains unchanged.
3. Use a new Dispatch ID for each new Codex execution after RETURNED.
4. Create a new Work ID only when the primary outcome materially changes.
5. Only one Work should normally be ACTIVE for implementation.

## Status vocabulary

```text
ACCEPTED   — merged/closed outcome retained as evidence
ACTIVE     — current implementation Work
READY      — fully planned and next in queue
PLANNED    — accepted future outcome, not yet ready
DEFERRED   — intentionally postponed
BLOCKED    — cannot proceed because of a material blocker
SUPERSEDED — outcome replaced by an explicit later decision
```

## Current delivery sequence

| Delivery order | Work ID | Outcome | Status | Dependency | Next action |
|---:|---|---|---|---|---|
| 0 | 0020 | AI provider core, OpenAI File Search, citations, lifecycle, full output | ACCEPTED | — | Preserve accepted OpenAI/FULL_OUTPUT evidence |
| 1 | 0025 | Administrator-governed model and thinking/reasoning selection | ACCEPTED | 0020 | Preserve exact tuple qualification and admin/user policy |
| 2 | 0021 | Structured Knowledge Search, five modes, multi-Entity comparison, six-format matrix | ACCEPTED | 0025 | Preserve merge `533c849b` and version-66 evidence |
| 3 | 0023 | Deterministic single-file bundle and idempotent installer | ACCEPTED | 0021 | Preserve merge `8b0a2ccd` and installer-security evidence |
| 4 | 0026 | Current Gemini Flash / File Search requalification | ACTIVE | CODEX-02 shell/data evidence accepted; external-cause classification not evidenced | Execute `0026-CODEX-03`: repair safe classification and run one bounded requalification |
| 5 | Unassigned future Work | Representative large-file indexing qualification/recovery | DEFERRED | Representative production-size corpus selected | Allocate a separate Work ID; do not mix with provider qualification |
| 6 | Unassigned future Work | Historical-material migration | PLANNED | Product/provider choice and installer stable | Choose manual/hybrid/selective automation from actual corpus |
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

Version 67 is unused/not deployed and must never be deployed.

## Work 0023 accepted boundary

```text
MERGE_COMMIT: 8b0a2ccde4746b061c232f45b6d1d59c7cc5a54f
SOURCE_ARCHITECTURE: modular preserved
DETERMINISTIC_SINGLE_FILE_BUNDLE: PASS
ONE_PASTE_SAVE_AND_EXECUTE: PASS
INSTALLER_OWNER_LATCH: PASS
CROSS_USER_PARTIAL_TAKEOVER_REJECTION: PASS
DEPLOYMENT_SECURITY_ATTESTATION: PASS
MUTABLE_GLOBAL_COLLISION_GATE: PASS
PERSONAL_DEV_INSTALL/UPGRADE: PASS
RERUN_DUPLICATES: 0
LOGIC_VALIDATION: PASS / 402 of 402
BLOCKER: NONE
```

Shared Drive/domain-user company qualification remains a later environment gate.

## Work 0026 active boundary

Primary outcome: qualify one exact current Gemini File Search tuple or leave Gemini disabled with the exact external limitation evidenced, without disturbing accepted OpenAI/FULL_OUTPUT behavior.

Closed CODEX-02 evidence:

```text
PRIVATE_WEB_APP_VERSION: 69
ROOT_AND_KNOWLEDGE_SHELL: PASS
LITERAL_INCLUDE_DIRECTIVES: 0
BLOCKING_BROWSER_CONSOLE_ERRORS: 0
DOC-000017_EXACT_GEMINI_DOCUMENTS: 1
MTG-000005_EXACT_GEMINI_DOCUMENTS: 1
GEMINI_DOCUMENT_DUPLICATES: 0
PRIMARY_3_8_LOW_2048_INTERACTIONS: FAIL / approximately 79 seconds
GEMINI_ROUTE: disabled / hidden
OPENAI_API_CALLED: NO
FULL_OUTPUT_LIVE_CALLED: NO
LOGIC_VALIDATION: PASS / 410 of 410
```

ChatGPT's independent review found that the application collapses materially different Gemini qualification failures into generic `AI_MODEL_QUALIFICATION_FAILED` and writes `DISABLED_EXTERNAL_LIMITATION` before the exact cause is established.

```text
PRODUCT_AVAILABILITY_BLOCKER: NONE
WORK_ACCEPTANCE_BLOCKER: GEMINI_EXTERNAL_LIMITATION_CLASSIFICATION_NOT_EVIDENCED
PR_36_MERGE: BLOCKED
```

Active Dispatch:

`0026-CODEX-03`

Active instruction:

`docs/handoffs/0026-CODEX-03-gemini-failure-classification-and-bounded-requalification-instruction.md`

CODEX-03 authorizes one minimal classification repair deployment as version 70, one same-Web-App update, one required 3.8 Interactions query and at most one mutually exclusive fallback/control query. Version 67 and version 71+ are prohibited. Store creation, source sync/upload, OpenAI calls, FULL_OUTPUT live calls and general experiment loops are prohibited.

## Scope and review discipline

Extend the active Work only for issues that materially affect primary-path completion, data/source integrity, authorization or credential safety, authoritative citation correctness, irreversible effects, or required target-runtime evidence. Route cosmetics, broad benchmarking and non-blocking hardening to follow-up.

## Update rule

Update this registry when a Work becomes active, accepted, blocked, deferred or superseded; when delivery order changes; when a new Work ID is allocated; or when the outcome is split. Do not update it for routine progress ticks inside one Dispatch.
