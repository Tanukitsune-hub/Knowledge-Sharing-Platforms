# Work Registry and Delivery Order

Current as of: 2026-09-05
Status: Active planning source of truth

## Purpose and identity rules

Work IDs identify stable outcomes, not execution order. Never renumber or reuse an issued ID. Keep the same Work through implementation, qualification, repair and PR convergence while its outcome remains unchanged. Give each new Codex execution a new Dispatch ID. Normally only one Work is active for implementation. Current ball is authoritative in `docs/handoffs/<WORK_ID>-dispatches.md`.

Statuses: ACCEPTED, ACTIVE, READY, PLANNED, DEFERRED, BLOCKED, SUPERSEDED.

## Current delivery sequence

| Order | Work ID | Outcome | Status | Dependency | Next action |
|---:|---|---|---|---|---|
| 0 | 0020 | Provider core, OpenAI File Search, citations, lifecycle, full output | ACCEPTED | — | Preserve accepted evidence |
| 1 | 0025 | Administrator model/thinking policy | ACCEPTED | 0020 | Preserve exact tuple policy |
| 2 | 0021 | Structured search, five modes, multi-Entity, six formats | ACCEPTED | 0025 | Preserve PR #34 and version-66 evidence |
| 3 | 0023 | Deterministic single-file bundle and installer | ACCEPTED | 0021 | Preserve PR #35 and installer security |
| 4 | 0026 | Current Gemini API requalification and fail-closed safety | ACCEPTED | 0023 | Preserve PR #36 and its historical boundary |
| 5 | 0027 | Personal-DEV Gemini File Search baseline and citation integrity | ACCEPTED | 0026 | Preserve PR #37 merge and version-73 qualified-disabled evidence |
| 6 | 0028 | UI/UX surface refinement and terminology simplification without backend redesign | ACTIVE | 0027 accepted baseline | Produce three comparable mocks and select a direction before source implementation |
| 7 | 0029 | Portable shared-password administrator mode | ACTIVE | Version-74 feature qualification preserved; GitHub ID reconciliation required | Port validated implementation to latest main, align Work ID, then one version-75 smoke |
| 8 | Unassigned future Work | Representative large-file qualification/recovery | DEFERRED | Small synthetic Gemini path qualified | Allocate separate Work |
| 9 | Unassigned future Work | Historical-material migration | PLANNED | Provider/installer stable | Select approach from actual corpus |
| 10 | Unassigned future Work | Final company qualification and rollout | PLANNED | Company credentials, Shared Drive, permissions, migration ready | Qualify approved company environment/providers |

## Accepted boundaries

### Work 0021
PR #34 merge `533c849bd1229827ec77cd5ad6506312ea286940`; private version 66. Core filters/five modes, multi-Entity/advanced filters, OpenAI six-format matrix 6/6, EML attachment boundary and FULL_OUTPUT six-format reference parity PASS. Logic 376/376.

### Work 0023
PR #35 merge `8b0a2ccde4746b061c232f45b6d1d59c7cc5a54f`. Deterministic bundle/installer, owner latch, takeover rejection, deployment attestation, source parity, and idempotent install evidence accepted.

### Work 0026
PR #36 merge `40bb7d40506c0839c35742ee0000d89650ff7ad6`; version 70 shell/readback accepted. Its old coarse Gemini failure classification is historical only and was superseded as a general causal explanation by later Work 0027 evidence.

### Work 0027
PR #37 merge `9cd5d2984d0d584ed05c447ed09d2ddf0e1e2366`; implementation `40905f23d8c6bab5b76e7fb2f34f96b912aeb2f7`; final branch head `497ecff400624330f1d5041de166f6c6e3485220`.

```text
PRIVATE_WEB_APP_VERSION: 73
MODEL: gemini-3.7-flash / explicit low / 2048 / Interactions + File Search
TERMINAL_OUTCOME: QUALIFIED_DISABLED
LOGIC_VALIDATION: PASS / 448 of 448
BUNDLE_VALIDATION: PASS / 27 of 27
SOURCE_READBACK: PASS / 82 of 82
TARGET_RUNTIME_QUALIFICATION: PASS
AUTHORITATIVE_CITATION: PASS
TEMP_RESOURCE_CLEANUP: PASS
GEMINI_ENABLED: false
NORMAL_USER_GEMINI_VISIBILITY: false
BLOCKER: NONE
```

The accepted strict Gemini citation resolver binds the returned Store and exact metadata tuple to one current Active authoritative source/current Gemini hash and one independently verified current provider document. Qualification and normal immediate/POLL mapping share this resolver. OpenAI/FULL_OUTPUT behavior remains preserved.

The optional sanitized Audit persistence gap is `FIX_SOON`, not a blocker. Representative large files, migration, company qualification, rollout, future-model qualification, and administrator-authorization redesign are separate future outcomes.

## Active design boundary

### Work 0028

Work 0028 is a UI/UX refinement Work, not a system redesign.

Phase A is design-only and has no Codex dispatch. It must compare three distinct visual directions over the same accepted functional surface before any `src/` edits or runtime changes.

The governing decision is `docs/decisions/ui-surface-language-and-backend-preservation.md` and the active brief is `docs/handoffs/0028-instruction.md`.

Key boundary:

- preserve Work 0027 backend/data/provider/runtime semantics;
- user-facing labels may differ from internal implementation terms;
- normal-user `Inactive` behavior may surface as `削除`, with clear confirmation copy explaining retained/restorable data where material;
- do not silently convert current ChatGPT/Gemini/全文出力 route semantics into automatic routing;
- if a preferred mock would require backend redesign, alter the mock rather than the system unless a separate explicit product decision is made;
- source implementation begins only after user design selection.

## Work 0029 collision recovery

The shared-administrator-password implementation was initially developed on an isolated branch using Work ID 0028 before the controller observed that authoritative `main` had already assigned 0028 to the UI/UX Work above. The product implementation reached personal-DEV version 74 and passed its bounded functional qualification, but PR #38 was stopped unmerged with `GITHUB_WORK_ID_COLLISION`.

Work 0029 is the canonical identity for that shared-admin outcome. It must start from current main, preserve the UI/UX Work 0028 files, port only the validated shared-admin product/test changes, correct shared-admin Work metadata to 0029, regenerate distribution artifacts, and perform one version-75 runtime alignment smoke. The old PR #38 remains superseded history and must not merge.

## Scope discipline

Only normal primary-flow failure, source/data integrity, credentials/authorization, authoritative citations, material irreversible side effects, or required runtime evidence may block delivery. Cosmetic work, broad benchmarks and unrelated hardening remain follow-up.
