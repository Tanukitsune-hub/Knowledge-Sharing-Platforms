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
| 6 | 0028 | Portable shared-password administrator mode | ACTIVE | 0027 accepted | Implement shared admin auth and one personal-DEV UI qualification |
| 7 | Unassigned future Work | Representative large-file qualification/recovery | DEFERRED | Small synthetic Gemini path qualified | Allocate separate Work |
| 8 | Unassigned future Work | Historical-material migration | PLANNED | Provider/installer stable | Select approach from actual corpus |
| 9 | Unassigned future Work | Final company qualification and rollout | PLANNED | Company credentials, Shared Drive, permissions, migration ready | Qualify approved company environment/providers |

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

## Work 0028 current contract

The user chose a shared administrator password rather than named-account administration for routine management. The AI Provider Settings page remains safely readable by all authorized Web App users. After one-time migration/bootstrap, existing provider/model mutations require a valid shared administrator-session token and must not depend on Google active/effective email.

```text
CURRENT_DISPATCH: 0028-CODEX-01
MODE: BUILD
BALL: CODEX
STATUS: READY
BASE_MAIN: b0efbbfd8a5ce5c2e3b3d64f5ccba56838306ef2
CURRENT_PRIVATE_WEB_APP: version 73
ADMIN_AUTO_TIMEOUT: none
CLIENT_ADMIN_TOKEN_STORAGE: sessionStorage only
PROVIDER_LIVE_CALLS_AUTHORIZED: 0
WORK_ACCEPTANCE: NOT_MET
BLOCKER: IMPLEMENTATION_NOT_RUN
```

Password plaintext must never be persisted. Server-side Script Properties hold only non-plaintext verifier/signing material. Password rotation invalidates previous tokens. Existing account/email administration is retained only as the initial bootstrap gate while no shared password is configured. Installer/setup/deployment/readiness owner checks are outside Work 0028 and must remain unchanged.

Decision: `docs/decisions/shared-admin-password-mode.md`.
Plan: `docs/planning/work0028-shared-admin-password.md`.

## Scope discipline

Only normal primary-flow failure, source/data integrity, credentials/authorization, authoritative citations, material irreversible side effects, or required runtime evidence may block delivery. Cosmetic work, broad benchmarks and unrelated hardening remain follow-up.
