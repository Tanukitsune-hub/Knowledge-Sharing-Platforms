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
| 6 | 0028 | UI/UX surface refinement, terminology and Light/Dark/System without backend redesign | ACTIVE (design only) | Accepted 0027 and 0029 baseline | 0028-CODEX-03 READY: Product Design Light A/B/C artifacts/review; no production implementation |
| 7 | 0029 | Portable shared-password administrator mode | ACCEPTED | Work 0028 preserved; canonical port and version-75 smoke passed | Preserve PR #39 merge and version-75 configured/locked evidence; rotate temporary DEV password later |
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

The optional sanitized Audit persistence gap is `FIX_SOON`, not a blocker. Representative large files, migration, company qualification, rollout and future-model qualification are separate future outcomes.

### Work 0029
PR #39 merge `872dbec83d17e6dfe1f33d8260006c2124d38a6c`; canonical implementation `9fa668619a0b91fb60ed53f696363d3954cf709e`; final branch head `b29ee3e538e72c4641f8d825e304fea1c186a265`.

```text
PRIVATE_WEB_APP_VERSION: 75
FOCUSED_TESTS: PASS / 59 of 59
LOGIC_VALIDATION: PASS / 456 of 456
BUNDLE_VALIDATION: PASS / 27 of 27
SOURCE_READBACK: PASS / 82 of 82
TARGET_RUNTIME_QUALIFICATION: PASS
SHARED_ADMIN_CREDENTIAL: configured
FINAL_ADMIN_STATE: locked
ACCOUNT_INDEPENDENT_ADMIN_SESSION: PASS
SESSIONSTORAGE_RELOAD_AND_SERVER_REVALIDATION: PASS
EXPLICIT_LOGOUT: PASS
PROVIDER_DATA_MUTATIONS: 0
WORK_0028_CONTROL_FILES_PRESERVED: PASS
BLOCKER: NONE
```

Routine AI Provider Settings administration is now unlocked by a shared administrator password rather than Google account/email after bootstrap. There is no timed session expiry. The browser stores only an opaque signed token in `sessionStorage`; server-side validation guards every existing AI Provider Settings mutation. Password rotation invalidates older token generations. Installer/setup/deployment/readiness account checks remain unchanged.

The temporary personal-DEV administrator password remains intentionally temporary and should be changed later through the accepted password-change UI. GitHub CI did not run and is not acceptance evidence.

## Active design boundary

### Work 0028

Work 0028 is a UI/UX refinement Work, not a system redesign. Current mode is INVESTIGATION, phase A1 / DESIGN ONLY.

After Work 0029 closed, the user approved the controller's approach and requested the next Codex prompt using Product Design. `0028-CODEX-03` is now issued and READY for design-artifact execution only. No Codex execution, completed visual evidence, production implementation or runtime change is asserted by issuing the instruction.

Current execution contract: `docs/handoffs/0028-CODEX-03-product-design-light-mocks-instruction.md`.
Current ball and dispatch history: `docs/handoffs/0028-dispatches.md`.
Work brief: `docs/handoffs/0028-instruction.md`.
Preservation policy: `docs/decisions/ui-surface-language-and-backend-preservation.md`.
Earlier research/inventory plan: `docs/planning/work0028-ui-ux-and-theme-plan.md`.

The current contract supersedes the older plan's A0-only permission/status, first-dispatch numbering, pre-0029 baseline and separate-Dark-chart assumptions; other useful research and preservation constraints remain in force.

Key boundary:

- preserve accepted Work 0027 backend/data/provider behavior and Work 0029 administrator unlock/session/logout/password-change behavior;
- source-grounded Product Design execution produces three comparable Light directions and a seven-scenario heuristic review;
- B workspace + A search clarity + C readable table density is the adopted starting approach, not selection of an unseen mock;
- prefer visible interactive boundaries; do not erase discoverability for a borderless aesthetic;
- user-facing wording may differ from internal terms, but payloads, lifecycle and eligibility stay unchanged;
- preserve explicit ChatGPT/Gemini/full-output routes, policy and authoritative evidence; current Gemini remains disabled/hidden;
- theme selection is System/Light/Dark with browser-local storage, not account synchronization or backend persistence;
- CHART_SURFACE_THEME: LIGHT_FIXED: chart interiors reuse the selected Light appearance in Dark; only the outer shell adapts, without a second palette/renderer;
- adjust designs that require backend redesign instead of changing the system;
- ChatGPT retains final review/acceptance; user Light selection precedes selected Dark design; production implementation still needs selected Light/Dark approval plus explicit authorization;
- no production source/runtime/credential/provider changes or deployment in CODEX-03.

## Work 0029 collision recovery and dispatch tombstones

The shared-administrator-password implementation was initially developed on an isolated branch using Work ID 0028 before the controller observed that authoritative `main` had already assigned 0028 to the UI/UX Work above. The product implementation reached personal-DEV version 74 and passed its bounded functional qualification, but PR #38 was stopped unmerged with `GITHUB_WORK_ID_COLLISION`.

Work 0029 became the canonical identity. CODEX-01 selectively ported the validated product/test changes onto current main, corrected only shared-admin Work metadata to 0029, regenerated distribution artifacts from the canonical implementation commit, and passed one version-75 runtime alignment smoke. Work 0028 control files remained byte-identical during that reconciliation. ChatGPT reviewed the result, merged PR #39, and applied the Work 0029 completion latch. PR #38 remains superseded, closed and unmerged.

Historical `0028-CODEX-01` and `0028-CODEX-02` remain consumed identifiers on the superseded line. They are recorded as tombstones, not recycled for UI/UX. The next UI/UX dispatch is therefore `0028-CODEX-03`. Do not import the conflicting branch, renumber historical dispatches, allocate a duplicate Work or reopen 0029.

## Scope discipline

Only normal primary-flow failure, source/data integrity, credentials/authorization, authoritative citations, material irreversible side effects, or required runtime evidence may block delivery. Cosmetic work, broad benchmarks and unrelated hardening remain follow-up.
