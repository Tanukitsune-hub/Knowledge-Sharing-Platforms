# Work 0028 dispatch control

WORK_ID: 0028
DISPATCH_ID: 0028-CODEX-06
ACTIVE_DISPATCH_ID: 0028-CODEX-06
BALL: CODEX
STATUS: READY
MODE: INVESTIGATION
PHASE: A1.8 / LIGHT NAVIGATION + WORKSPACE CONSOLIDATION / DESIGN ONLY

## Current ball and authorization

CODEX-05 returned on Draft PR #42 after applying the bounded Light visual refinement. PR #42 is the current refined visual/style baseline and remains Draft/unmerged. The user then requested one more bounded design pass focused on navigation consolidation and Workspace consolidation.

CODEX-06 is authorized for design-only navigation/workspace consolidation. It must preserve PR #42 visual tokens/layout refinements and all existing backend/data/provider/security contracts. It must not modify production source/runtime or proceed to Dark/build/deployment.

Instruction: `docs/handoffs/0028-CODEX-06-navigation-workspace-consolidation-instruction.md`.
Expected report: `docs/handoffs/0028-CODEX-06-navigation-workspace-consolidation-report.md`.

PR #42 baseline:

- Draft PR: #42
- branch: `codex/0028-light-family-refinement`
- head: `64b5c4699422ec271f715741fd31e0350c41cdb6`
- visual refinement: PASS per CODEX-05 report
- final user Light acceptance: NOT YET

## Preserved selected Light direction

Preserve across CODEX-06:

- persistent left sidebar / desktop-first wide workspace;
- sidebar `#182124`;
- cool light slate page / white cards / cool borders;
- restrained gold accents;
- local refined thin-line SVG icon family;
- clean dense gold sayagata lower-left fading upper-right;
- active sidebar item left strip only `#E1001F` plus non-red cue;
- no other `#E1001F` ordinary UI use;
- Knowledge Search one visible model/profile selector and no normal-user Thinking;
- current Gemini qualified-disabled / normal-user hidden baseline;
- compact form/layout refinements from PR #42;
- future Dark charts `CHART_SURFACE_THEME: LIGHT_FIXED`;
- Work 0027 and Work 0029 accepted behavior.

## User-requested CODEX-06 changes

1. Consolidate top-level Meeting/Pitchbook registration into one `記録を追加` destination with internal `面談 / 資料` sub-tabs. Preserve separate forms/datasets/contracts.
2. Consolidate top-level past Meeting/Pitchbook maintenance into one `過去の記録` destination with internal `面談 / 資料` sub-tabs. Preserve separate search/table/status/edit/delete/restore/source semantics.
3. Add a clear `面談履歴` top-level surface: choose YYYY-MM and review that month’s individual Meetings, reusing existing Meeting date-range search / Activity Analytics monthly+drill capabilities without new backend.
4. Keep `面談活動の集計` separate as analytics.
5. Meeting register/edit: keep existing three Meeting Type checkboxes visibly available as `年1面談 / オフィス訪問 / 年次総会`, preserving existing values/payload semantics.
6. Meeting register/edit: keep existing quick-add counterparty action inline to the right of the counterparty selector on desktop.
7. Consolidate `GP Workspace` and `Entity Workspace` into one top-level `Workspace` destination.
8. Unified Workspace uses `対象区分 / 対象 / 印刷・PDF` selector/action row. GP selection preserves GP-specific compact summary/content; non-GP selection preserves Entity-specific context/content. Future implementation may select the existing GP or Entity read facade; no backend merge is authorized.

## Preferred final sidebar structure

### 探す
- ナレッジ検索
- 面談履歴

### 記録する
- 記録を追加

### 振り返る
- 過去の記録
- Workspace
- 面談活動の集計
- 面談と資料の関連

### 設定する
- マスター管理
- AIプロバイダ設定

Internal `面談 / 資料` tabs are not separate sidebar destinations.

## Dispatch history

| Dispatch ID | Disposition |
|---|---|
| N/A | Route A planning/reconciliation. |
| 0028-CODEX-01 | Historical tombstone from superseded shared-admin line; never reuse. |
| 0028-CODEX-02 | Historical tombstone from superseded shared-admin PR #38; never reuse. |
| 0028-CODEX-03 | Product Design A/B/C Light comparison; RETURNED PARTIAL on Draft PR #40. |
| 0028-CODEX-04 | Selected Light cross-page family; RETURNED on Draft PR #41; technical review PASS. |
| 0028-CODEX-05 | Bounded Light visual refinement; RETURNED on Draft PR #42; visual/style baseline for next pass. |
| 0028-CODEX-06 | Current Light navigation/workspace consolidation; READY / BALL CODEX. |

## Gates

CODEX-06 returns the consolidated Light family to ChatGPT/user review.

After the consolidated Light family is accepted: create only the selected Dark family.
After Light/Dark approval: explicit user authorization is still required before production BUILD.
Deployment remains separately scoped.

## Evidence state

```text
USER_DIRECTION_SELECTED: YES
SELECTED_LIGHT_VISUAL_LANGUAGE: FIXED
CODEX_05_RETURNED: YES
PR_42_REFINED_LIGHT_BASELINE: YES
USER_LIGHT_ACCEPTANCE: ADDITIONAL_CONSOLIDATION_REQUESTED
REGISTER_NAV_CONSOLIDATION: REQUIRED
PAST_RECORD_NAV_CONSOLIDATION: REQUIRED
MONTHLY_MEETING_HISTORY_SURFACE: REQUIRED / EXISTING CONTRACT REUSE
MEETING_TYPE_CHECKBOXES: EXISTING / MUST BE VISIBLE
COUNTERPARTY_QUICK_ADD_INLINE: REQUIRED
WORKSPACE_CONSOLIDATION: REQUIRED
GP_AND_ENTITY_READ_CONTRACTS: PRESERVE / DO_NOT_MERGE BACKEND
SIDEBAR_BASE_COLOR: #182124
ACTIVE_MENU_ACCENT: #E1001F / THIN LEFT STRIP ONLY
OTHER_E1001F_USAGE: PROHIBITED
SELECTED_DARK_MOCK: NOT_STARTED
PRODUCTION_IMPLEMENTATION_AUTHORIZED: NO
SOURCE_CODE_CHANGED: NO
RUNTIME_CHANGED: NO
READY_FOR_PRODUCTION_BUILD: NO
WORK_0028_COMPLETE: NO
```

WORK_ID: 0028
DISPATCH_ID: 0028-CODEX-06
ACTIVE_DISPATCH_ID: 0028-CODEX-06
BALL: CODEX
STATUS: READY
