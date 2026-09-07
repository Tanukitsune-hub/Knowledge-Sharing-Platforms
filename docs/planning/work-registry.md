# Work Registry and Delivery Order

Current as of: 2026-09-07
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
| 6 | 0028 | UI/UX surface refinement and terminology with one high-quality Light design, without backend redesign | ACTIVE (design only) | Accepted 0027 and 0029 baseline | Execute prepared `0028-CODEX-09`, then final user Light visual acceptance |
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

Routine AI Provider Settings administration remains unlocked by the accepted shared administrator password contract. Browser-side opaque session token, server validation, logout and password rotation semantics are preserved.

## Active design boundary

### Work 0028

Work 0028 remains a UI/UX refinement Work, not a system redesign. Current mode is INVESTIGATION, phase A1.12 / Light-only final user corrections.

Dark/System variants remain canceled. Production implementation remains unauthorized until the final Light family is visually accepted and the user explicitly authorizes BUILD.

Design history:

- CODEX-03: A/B/C Light comparison, PR #40.
- CODEX-04: selected Light cross-page family, PR #41.
- CODEX-05: bounded Light refinement, PR #42.
- CODEX-06: navigation / GP-Entity Workspace consolidation, PR #43.
- CODEX-07: final Light correction, PR #44; controller technical review PASS.
- CODEX-08: Light-only final polish, PR #45 head `2a1843048f76b6a48cec35fcdfe2c5b116c7e3dd`; 14-page render, 11 screenshots, Product Design QA and deterministic validation PASS; controller technical review PASS.
- CODEX-09: `codex/0028-final-light-user-corrections`で最終Light修正を完成。15画面・screenshots・検証・reportを返却。BALL CHATGPT / STATUS RETURNED。

PR #45 remains the visual baseline / review history. CODEX-09 will create a fresh Draft PR from current main and must preserve current controller files.

Current closed Light-only direction and CODEX-09 corrections:

- production starts at `ナレッジ検索`;
- persistent left sidebar / desktop-first wide workspace;
- sidebar `#182124`, active `#E1001F` thin left strip only;
- sidebar destinations exactly 7;
- gold icon treatment to be strengthened beyond PR #45, with permissive-license local-vendored external SVG allowed if needed, no runtime remote dependency;
- Knowledge Search visible primary layout:
  - Row 1 `GP / 情報ソース / 開始日 / 終了日 / 全期間`;
  - default rolling 3 years, `全期間` OFF;
  - Row 2 `検索モード / AIモデル`;
  - Row 3 wide / larger `質問` textarea;
- Knowledge Search `情報ソース` options: `面談記録・資料 / 面談記録のみ / 資料のみ` while preserving existing Meeting/Pitchbook File Search contracts;
- `全文出力（AIを使わない）` is Meeting-only and excludes Pitchbook body / reference links;
- search-mode design becomes admin-managed preset registry concept: `自由質問` protected/editable; non-free modes gray read-only fixed prompt; admin design supports display name / fixed prompt / enabled / sort order / generic preset addition; existing `比較` / `面談準備` special semantics preserved;
- admin-managed preset persistence and server-side authoritative fixed-prompt resolution are future BUILD requirements, not CODEX-09 implementation;
- `面談実績の集計` lower Meeting table visible columns: `日付 / 面談先 / Asset Class / Team / 原資料 / 年1回面談 / オフィス訪問 / 年次総会 / 確認済み`; existing `meetingTypeCodes` display as `○ / —`; `確認済み` remains existing admin-check mapping;
- Past Records explicit Meeting↔Pitchbook relationship integration preserved;
- Work 0027 Gemini qualified-disabled / normal-user hidden preserved;
- Work 0029 shared-admin security behavior preserved;
- production `src/**` / `dist/**`, runtime and deploy remain out of scope.

Authoritative CODEX-09 instruction:
`docs/handoffs/0028-CODEX-09-final-light-user-corrections-instruction.md`

Authoritative decision details:

- `docs/handoffs/0028-CODEX-09-analytics-meeting-type-columns-decisions.md`
- `docs/handoffs/0028-CODEX-09-knowledge-search-layout-and-mode-policy-decisions.md`

Current ball/status:
`docs/handoffs/0028-dispatches.md`

## Next gate

`0028-CODEX-09`の新規Draft PR・修正後Light screenshots・検証・reportをreviewし、ユーザーの最終visual acceptanceを得る。

If the returned Light family is visually accepted, apply Completion Latch to the Work 0028 design phase. Production implementation then requires a separate Strategy Reset plus explicit user BUILD authorization. Deployment remains separately scoped.

## Work 0029 collision recovery and dispatch tombstones

Historical `0028-CODEX-01` and `0028-CODEX-02` remain consumed identifiers from the superseded shared-admin line and are never reused. Work 0029 remains the canonical accepted shared-admin implementation.

## Scope discipline

Only normal primary-flow failure, source/data integrity, credentials/authorization, authoritative citations, material irreversible side effects or required runtime evidence may block delivery. Cosmetic work, broad benchmarks and unrelated hardening remain follow-up.
