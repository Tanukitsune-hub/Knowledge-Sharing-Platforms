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
| 6 | 0028 | UI/UX surface refinement, terminology and Light/Dark/System without backend redesign | ACTIVE (design only) | Accepted 0027 and 0029 baseline | Draft PR #44 final Light target: controller technical review PASS; user screenshot acceptance pending |
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

Work 0028 remains a UI/UX refinement Work, not a system redesign. Current mode is INVESTIGATION, phase A1.9 / final Light correction + screenshot review.

Design history:

- CODEX-03: A/B/C Light comparison, returned PARTIAL on Draft PR #40.
- CODEX-04: selected Light cross-page family, Draft PR #41.
- CODEX-05: bounded Light refinement, Draft PR #42.
- CODEX-06: navigation / GP-Entity Workspace consolidation, Draft PR #43.
- CODEX-07: final Light correction and screenshot package, Draft PR #44 at head `7a82b530b51227d1cc44a8cbd2b4e4b225c57d6d`.

Draft PR #44 is the current final Light review target. ChatGPT controller technical review is PASS; user visual acceptance is still pending.

Final Light system under review:

- persistent left sidebar / desktop-first wide workspace;
- flat sidebar with exactly 8 user-facing destinations and no group headings;
- sidebar `#182124`;
- cool slate Light page with white cards and cool borders;
- restrained gold accents;
- local refined thin-line SVG icon family;
- dense clean gold sayagata lower-left fading upper-right;
- Nippon Life red `#E1001F` only as the active-item left strip, plus non-red active cue;
- Knowledge Search one visible model/profile selector, normal-user Thinking hidden, Gemini current hidden baseline;
- `記録を追加` and `過去の記録` each use internal `面談 / 資料` tabs while preserving separate datasets/contracts;
- `面談先サマリー` presents GP/non-GP through existing separate read-facade mapping;
- `面談実績の集計` merges monthly history with analytics: compact criteria, summary, period chart + numeric table, breakdown chart + table, individual Meeting list and rightmost `確認済み` checkbox mapped to existing admin-check persistence contract;
- `プルダウンの管理` and `管理者ページ` are user-facing label changes only;
- future Dark chart interior remains `CHART_SURFACE_THEME: LIGHT_FIXED`.

Final sidebar labels:

1. ナレッジ検索
2. 記録を追加
3. 過去の記録
4. 面談先サマリー
5. 面談実績の集計
6. 面談と資料の関連
7. プルダウンの管理
8. 管理者ページ

CODEX-07 evidence:

- 15 rendered pages; horizontal overflow 0/15 at 1366×768;
- active sidebar exactly 1/page;
- 8 flat destinations, group headings 0;
- ordinary red usage 0, active red strip only;
- 13 PNG screenshots saved and major previews embedded in PR #44;
- Product Design QA PASS / no actionable P0/P1/P2;
- browser console warning/error 0 in static harness;
- `git diff --check` PASS;
- production `src/**` / `dist/**` changes NONE.

Static design does not qualify keyboard/focus/contrast/screen-reader/Apps Script runtime/server mapping/admin-check save persistence.

Current execution report: `docs/handoffs/0028-CODEX-07-final-light-correction-report.md` on Draft PR #44.
Current ball/status: `docs/handoffs/0028-dispatches.md`.

## Next gate

User reviews Draft PR #44 screenshots. If accepted, selected Light design closes and the next fresh dispatch creates only the selected Dark family.

If further Light correction is requested, use a fresh Dispatch ID; do not append work to returned CODEX-07.

Production implementation still requires selected Light and Dark approval plus explicit user BUILD authorization. Deployment remains separately scoped.

## Work 0029 collision recovery and dispatch tombstones

Historical `0028-CODEX-01` and `0028-CODEX-02` remain consumed identifiers from the superseded shared-admin line and are never reused. Work 0029 remains the canonical accepted shared-admin implementation.

## Scope discipline

Only normal primary-flow failure, source/data integrity, credentials/authorization, authoritative citations, material irreversible side effects or required runtime evidence may block delivery. Cosmetic work, broad benchmarks and unrelated hardening remain follow-up.
