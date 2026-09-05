# Work 0028 dispatch control

WORK_ID: 0028
DISPATCH_ID: 0028-CODEX-05
ACTIVE_DISPATCH_ID: 0028-CODEX-05
BALL: CHATGPT
STATUS: RETURNED
MODE: INVESTIGATION
PHASE: A1.7 / LIGHT FAMILY REFINEMENT / DESIGN ONLY

## Current ball and authorization

CODEX-04 returned on Draft PR #41 with the selected Light cross-page family. ChatGPT technical review passed the design package, but user visual acceptance remained pending. The user then reviewed the visible Light pages and requested a bounded refinement batch.

CODEX-05 returned the bounded refinement on a fresh design branch. The corrected family preserves the accepted visual direction and source contracts, and does not modify production source/runtime or proceed to Dark/build/deployment.

Instruction: `docs/handoffs/0028-CODEX-05-light-family-refinement-instruction.md`.
Expected report: `docs/handoffs/0028-CODEX-05-light-family-refinement-report.md`.

Authoritative main before CODEX-05 publication was `c6701d075030385ee683925c0bbaef36221134ad`; instruction creation advanced main. CODEX-05 must fetch and record actual current main at execution start.

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

These are refinements, not permission for a new visual direction or backend capability.

## Dispatch history

| Dispatch ID | Disposition |
|---|---|
| N/A | Route A planning/reconciliation. |
| 0028-CODEX-01 | Historical tombstone from superseded shared-admin line; never reuse. |
| 0028-CODEX-02 | Historical tombstone from superseded shared-admin PR #38; never reuse. |
| 0028-CODEX-03 | Product Design A/B/C Light comparison; RETURNED PARTIAL on Draft PR #40. |
| 0028-CODEX-04 | Selected Light cross-page family; RETURNED on Draft PR #41; technical review PASS, user corrections requested. |
| 0028-CODEX-05 | Bounded Light refinement; RETURNED / BALL CHATGPT on a new Draft PR. |

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
LIGHT_REFINEMENT_BATCH: AUTHORIZED
CODEX_05_RETURNED: YES
LIGHT_REFINEMENT_TECHNICAL_RESULT: PASS
USER_LIGHT_ACCEPTANCE: PENDING_REVIEW
SIDEBAR_BASE_COLOR: #182124
SAYAGATA_MOTIF: SELECTED / 92PX REPEAT REFINEMENT COMPLETE
ACTIVE_MENU_ACCENT: #E1001F / THIN LEFT STRIP ONLY
OTHER_E1001F_USAGE: PROHIBITED
NORMAL_USER_THINKING_CONTROL: HIDDEN
LIGHT_MAIN_BACKGROUND: COOL SLATE #F4F7FA
SIDEBAR_ICON_FAMILY: LOCAL LUCIDE SVG PRESENT
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
BALL: CHATGPT
STATUS: RETURNED
