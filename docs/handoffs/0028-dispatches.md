# Work 0028 dispatch control

WORK_ID: 0028
DISPATCH_ID: 0028-CODEX-05
ACTIVE_DISPATCH_ID: 0028-CODEX-05
BALL: CODEX
STATUS: READY
MODE: INVESTIGATION
PHASE: A1.7 / LIGHT FAMILY REFINEMENT / DESIGN ONLY

## Current ball and authorization

CODEX-04 returned on Draft PR #41 with the selected Light cross-page family. ChatGPT technical review passed the design package, but user visual acceptance remained pending. The user then reviewed the visible Light pages and requested a bounded refinement batch.

CODEX-05 is authorized to refine the existing selected Light family only. It must preserve the accepted visual direction and source contracts, and must not modify production source/runtime or proceed to Dark/build/deployment.

Instruction: `docs/handoffs/0028-CODEX-05-light-family-refinement-instruction.md`.
Latest required amendment: `docs/handoffs/0028-CODEX-05-light-family-refinement-amendment-01.md`.
Expected report: `docs/handoffs/0028-CODEX-05-light-family-refinement-report.md`.

The amendment is part of the same active Dispatch ID and does not create a new Codex dispatch. CODEX-05 must read both instruction files before execution and record actual current main at start.

PR #41 baseline:

- Draft PR: #41
- branch: `codex/0028-selected-light-family`
- head: `46d16b46535239e2ce91f7d6bf362836bfaf9985`
- technical review: PASS
- final user visual acceptance: NOT YET

## Closed selected Light direction

Preserve across refinement:

- persistent left sidebar / desktop-first wide workspace;
- B-like shell, A-like Knowledge Search clarity, C-like maintenance density;
- sidebar semantic token `#182124`;
- restrained gold accents;
- clean geometric gold sayagata lower-left fading upper-right;
- active sidebar item left strip only `#E1001F`, plus non-red active cue;
- no other `#E1001F` ordinary UI use;
- white Light cards and visible control boundaries;
- Japanese task-oriented labels;
- later Dark charts `CHART_SURFACE_THEME: LIGHT_FIXED`;
- Work 0027 and Work 0029 accepted behavior.

## User-requested refinement batch

CODEX-05 must apply these corrections:

1. Knowledge Search: replace normal-user `実行方法 / モデル / Thinking` presentation with one visible model/profile selector; Thinking remains admin policy only. Preserve Full Output semantics and current Gemini hidden baseline.
2. Past Pitchbook: source action should clearly read `原資料を開く` and retain current new-tab source URL behavior; do not invent preview/download behavior.
3. Meeting register/edit desktop rows: `日付 | 開始時間 | 面談場所`; `面談先区分 | 面談先`; `アセットクラス | エクイティ/デット | チーム`.
4. Pitchbook classification edit: `日付 | GP | アセットクラス | エクイティ/デット` in one desktop row, GP widest.
5. GP Workspace: move print/PDF next to GP selector; remove visible Active KPI and follow-up count; compact headline summary to Meeting count / Document count / last Meeting date only.
6. Apply reasonable cross-page vertical compaction without harming readability or control target sizes.
7. Remove yellow/cream cast from Light main background and move to cool very-light slate/blue-gray; keep white cards and cool borders. Tokenize for easy later hue tuning.
8. Add a consistent refined thin-line SVG icon family to sidebar destinations without external runtime CDN dependency or materially increasing row height.
9. Make the sayagata repeat materially denser/smaller scale than PR #41 while preserving clean geometry and lower-left→upper-right fade.
10. Meeting register/edit: place existing `未登録の面談先を追加` inline to the right of the 面談先 dropdown on desktop, with natural narrow fallback.
11. Consolidate normal-user registration navigation: one top-level `記録を追加`-type destination with internal `面談 / 資料` sub-tabs, while preserving separate forms/datasets/contracts.
12. Consolidate normal-user past-record navigation: one top-level `過去の記録` destination with internal `面談 / 資料` sub-tabs, while preserving separate tables/status/edit/delete/restore/source semantics.
13. Meeting register/edit: visibly present the existing three multi-select Meeting Type checkboxes, user-facing labels `年1面談 / オフィス訪問 / 年次総会` as the preferred wording, preserving existing values and `meetingTypeCodes` payload.
14. Add a clear user-facing `面談履歴` surface for choosing a specific YYYY-MM and reviewing that month's individual Meeting records. Ground it in current date-range Meeting search / Activity Analytics monthly+drill capabilities; do not invent a new backend. Preserve `面談活動の集計` as the separate analytics view.

Detailed constraints for items 10–14 are authoritative in Amendment 01.

These are refinements, not permission for a new visual direction or backend capability.

## Dispatch history

| Dispatch ID | Disposition |
|---|---|
| N/A | Route A planning/reconciliation. |
| 0028-CODEX-01 | Historical tombstone from superseded shared-admin line; never reuse. |
| 0028-CODEX-02 | Historical tombstone from superseded shared-admin PR #38; never reuse. |
| 0028-CODEX-03 | Product Design A/B/C Light comparison; RETURNED PARTIAL on Draft PR #40. |
| 0028-CODEX-04 | Selected Light cross-page family; RETURNED on Draft PR #41; technical review PASS, user corrections requested. |
| 0028-CODEX-05 | Current bounded Light refinement, including Amendment 01; READY / BALL CODEX. |

## Gates

CODEX-05 returns a corrected Light visual family to ChatGPT and user review.

After the corrected Light family is accepted: create only the selected Dark family.
After Light/Dark approval: explicit user authorization is still required before production BUILD.
Deployment remains separately scoped.

## Evidence state

```text
USER_DIRECTION_SELECTED: YES
SELECTED_LIGHT_VISUAL_LANGUAGE: FIXED
CODEX_04_RETURNED: YES
PR_41_TECHNICAL_REVIEW: PASS
USER_LIGHT_ACCEPTANCE: CORRECTIONS_REQUESTED
LIGHT_REFINEMENT_BATCH: AUTHORIZED
CODEX_05_AMENDMENT_01: REQUIRED
SIDEBAR_BASE_COLOR: #182124
SAYAGATA_MOTIF: SELECTED / DENSITY REFINEMENT REQUIRED
ACTIVE_MENU_ACCENT: #E1001F / THIN LEFT STRIP ONLY
OTHER_E1001F_USAGE: PROHIBITED
NORMAL_USER_THINKING_CONTROL: REMOVE FROM VISIBLE LIGHT DESIGN
LIGHT_MAIN_BACKGROUND: COOL SLATE REFINEMENT REQUIRED
SIDEBAR_ICON_FAMILY: REFINEMENT REQUIRED
REGISTER_NAV_CONSOLIDATION: REQUIRED
PAST_RECORD_NAV_CONSOLIDATION: REQUIRED
MEETING_TYPE_CHECKBOXES: EXISTING / MUST BE VISIBLE
MONTHLY_MEETING_HISTORY_SURFACE: REQUIRED / EXISTING CONTRACT REUSE
SELECTED_DARK_MOCK: NOT_STARTED
PRODUCTION_IMPLEMENTATION_AUTHORIZED: NO
SOURCE_CODE_CHANGED: NO
RUNTIME_CHANGED: NO
READY_FOR_PRODUCTION_BUILD: NO
WORK_0028_COMPLETE: NO
```

WORK_ID: 0028
DISPATCH_ID: 0028-CODEX-05
ACTIVE_DISPATCH_ID: 0028-CODEX-05
BALL: CODEX
STATUS: READY
