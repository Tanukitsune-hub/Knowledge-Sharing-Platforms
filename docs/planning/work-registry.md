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
| 6 | 0028 | UI/UX surface refinement and terminology with one high-quality Light design | ACTIVE (design only) | Accepted 0027 and 0029 baseline | Review returned CODEX-10 record-centric design package, then final user Light visual acceptance |
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

Work 0028 remains a UI/UX design Work. Current mode is INVESTIGATION, phase A1.14 / CODEX-10 record-centric IA and Knowledge Search correction returned for review / Light only.

Dark/System variants remain canceled. Production implementation remains unauthorized until the final Light family is visually accepted and the user explicitly authorizes BUILD.

Design history:

- CODEX-03: A/B/C Light comparison, PR #40.
- CODEX-04: selected Light cross-page family, PR #41.
- CODEX-05: bounded Light refinement, PR #42.
- CODEX-06: navigation / GP-Entity Workspace consolidation, PR #43.
- CODEX-07: final Light correction, PR #44; controller technical review PASS.
- CODEX-08: Light-only final polish, PR #45; controller technical review PASS.
- CODEX-09: final accumulated user corrections, Draft PR #46; controller technical review PASS / user acceptance pending.
- CODEX-10: returned fresh design-only package; next unused dispatch is CODEX-11. Record-centric IA + final Knowledge Search corrections are represented in the current review package.

PR #46 is the current Light visual baseline / review history. CODEX-10 will supersede only the affected design surfaces.

Current closed Light-only direction:

- persistent left sidebar / desktop-first wide workspace;
- sidebar `#182124`, active `#E1001F` thin left strip only;
- sidebar destinations exactly 7;
- stronger metallic gold icon treatment preserved;
- Knowledge Search Row 1 final: `面談先 / 情報ソース / 開始日 / 終了日 / 全期間`;
- `面談先` uses generic Counterparty Entity semantics, not GP-only;
- Knowledge Search Row 2: `検索モード / AIモデル`;
- Row 3: wide `質問` textarea;
- `情報ソース`: `面談記録・資料 / 面談記録のみ / 資料のみ`;
- `全文出力` is a dedicated non-AI action, not an AI-model option; it exports Meeting Google Docs full text + authoritative Meeting attributes only;
- admin-managed search-mode preset design remains; persistence/server-authoritative prompt resolution is future BUILD;
- `面談実績の集計` lower list remains `日付 / 面談先 / Asset Class / Team / 原資料 / 年1回面談 / オフィス訪問 / 年次総会 / 確認済み`;
- record-centric IA supersedes the previous `面談 / 資料` subtab model in `記録を追加` and `過去の記録`;
- `記録を追加` becomes one surface with `記録種別 = 面談 / データ受領`;
- any new file/Pitchbook registration requires a successfully committed parent record and valid `Meeting_ID` first;
- no standalone Pitchbook registration route/action;
- current Pitchbook GP-required validation is a known design mismatch and must be removed in future BUILD; any existing Meeting counterparty type can own attached files;
- `データ受領` creates a lightweight record with receipt-background memo, issues `Meeting_ID`, then registers files;
- `過去の記録` becomes one record list; record detail owns related-file viewing and later follow-up uploads;
- user-facing related-file `削除` means unlink, not hard delete;
- no independent Pitchbook list and no `資料 → 関連面談` reverse surface;
- prefer preserving `Meeting_Index.Related_Pitchbook_IDs` as active relationship truth and existing Document_ID / file lifecycle;
- future BUILD should prefer a minimal `Meeting_Index` extension such as `Record_Type = MEETING | DATA_RECEIPT`; existing rows map to `MEETING`;
- Work 0027 Gemini qualified-disabled / normal-user hidden preserved;
- Work 0029 shared-admin security behavior preserved;
- production `src/**` / `dist/**`, runtime and deploy remain out of scope.

Authoritative CODEX-10 decisions:

- `docs/handoffs/0028-CODEX-10-knowledge-search-action-corrections.md`
- `docs/handoffs/0028-CODEX-10-record-centric-architecture-decisions.md`
- `docs/handoffs/0028-CODEX-10-record-centric-design-report.md`

Current ball/status:

`docs/handoffs/0028-dispatches.md`

## Next gate

Review the returned `0028-CODEX-10` design-only package and close user Light acceptance. The package includes corrected Light screenshots, validation, and report.

If the returned Light family is visually accepted, apply Completion Latch to the Work 0028 design phase. Production implementation then requires a separate Strategy Reset plus explicit user BUILD authorization. Deployment remains separately scoped.

## Work 0029 collision recovery and dispatch tombstones

Historical `0028-CODEX-01` and `0028-CODEX-02` remain consumed identifiers and are never reused. Work 0029 remains the canonical accepted shared-admin implementation.

## Scope discipline

Only normal primary-flow failure, source/data integrity, credentials/authorization, authoritative citations, material irreversible side effects or required runtime evidence may block delivery. Cosmetic work, broad benchmarks and unrelated hardening remain follow-up.
