# Work 0028 dispatch control

WORK_ID: 0028
DISPATCH_ID: 0028-CODEX-06
ACTIVE_DISPATCH_ID: 0028-CODEX-06
BALL: CHATGPT
STATUS: REVIEW
MODE: INVESTIGATION
PHASE: A1.8 / LIGHT NAVIGATION + WORKSPACE CONSOLIDATION / DESIGN ONLY

## Current ball and review state

CODEX-06 returned on Draft PR #43 after consolidating the selected Light navigation and Workspace while preserving PR #42 visual/style decisions. ChatGPT controller review has checked the PR metadata, changed paths, CODEX-06 report, Product Design QA and navigation validation.

Controller judgment: `TECHNICAL_REVIEW_PASS / USER_LIGHT_ACCEPTANCE_PENDING`.

Draft PR #43:

- branch: `codex/0028-light-navigation-consolidation`
- head: `cd43591b65b22e52aea10dd52107850fff4aed7f`
- base source recorded by CODEX-06: `c5aa1c189c1e915a44f676ac1a8358a5f189e4bb`
- design-only / Draft / unmerged
- production `src/**`, `dist/**`, runtime, deployment, provider/credential/backend/data contract: unchanged

## Accepted technical evidence for this review gate

- 16 visual pages render; 1366×768 horizontal overflow 0/16;
- active sidebar destination exactly 1 per page;
- sidebar base `#182124`;
- ordinary UI `#E1001F` usage 0; active left strip exactly 1 per page;
- PR #42 visual system preserved: cool slate Light surface, white cards, restrained gold, local thin-line SVG icons, dense 92px sayagata;
- `記録を追加` is one top-level destination with `面談 / 資料` internal tabs, while Meeting/Pitchbook contracts remain separate;
- `過去の記録` is one top-level destination with separate `面談 / 資料` maintenance surfaces and separate semantics;
- `面談履歴` uses YYYY-MM and individual Meeting rows, with existing date-range / monthly+drill contracts documented as the future implementation mapping and no new backend;
- Meeting Type checkboxes remain the existing three values and are visible;
- quick-add counterparty is inline on desktop;
- `Workspace` is one top-level destination; GP and non-GP views preserve their current specialized content while future implementation may route to the existing GP or Entity read facade rather than merging server contracts;
- Product Design QA found one duplicate Workspace target-control P2, corrected it in the single allowed correction pass, and reported no remaining actionable P0/P1/P2;
- browser console warning/error 0 in the static design harness;
- `git diff --check` PASS;
- static design evidence does not claim keyboard/focus/contrast/screen-reader/Apps Script runtime/provider/server-mapping PASS.

## Preserved selected Light direction

The following remains closed unless the user explicitly changes it:

- persistent left sidebar / desktop-first wide workspace;
- sidebar `#182124`;
- cool light slate page / white cards / cool borders;
- restrained gold accents;
- local refined thin-line SVG icon family;
- clean dense gold sayagata lower-left fading upper-right;
- active sidebar item left strip only `#E1001F` plus non-red active cue;
- no other `#E1001F` ordinary UI use;
- Knowledge Search one visible model/profile selector and no normal-user Thinking;
- current Gemini qualified-disabled / normal-user hidden baseline;
- compact Meeting/Pitchbook/Workspace layouts;
- future Dark charts `CHART_SURFACE_THEME: LIGHT_FIXED`;
- Work 0027 and Work 0029 accepted behavior.

## Consolidated Light navigation under review

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
| 0028-CODEX-05 | Bounded Light visual refinement; RETURNED on Draft PR #42; visual/style baseline. |
| 0028-CODEX-06 | Light navigation/Workspace consolidation; RETURNED on Draft PR #43; controller technical review PASS, user visual acceptance pending. |

## Next gate

The user reviews Draft PR #43 as the current final Light visual target. If accepted, Light design is closed and the next fresh dispatch may create only the selected Dark family. If the user requests further Light corrections, allocate a fresh Dispatch ID; do not append work to returned CODEX-06.

Production implementation remains unauthorized until selected Light and Dark are both approved and the user explicitly authorizes BUILD. Deployment remains separately scoped.

## Evidence state

```text
USER_DIRECTION_SELECTED: YES
SELECTED_LIGHT_VISUAL_LANGUAGE: FIXED
CODEX_06_RETURNED: YES
DRAFT_PR_43: OPEN / DESIGN ONLY / UNMERGED
CONTROLLER_TECHNICAL_REVIEW: PASS
USER_LIGHT_ACCEPTANCE: PENDING
REGISTER_NAV_CONSOLIDATION: PASS
PAST_RECORD_NAV_CONSOLIDATION: PASS
MONTHLY_MEETING_HISTORY_SURFACE: PASS / EXISTING CONTRACT REUSE DESIGN
MEETING_TYPE_CHECKBOXES: PASS / EXISTING VALUES PRESERVED
COUNTERPARTY_QUICK_ADD_INLINE: PASS
WORKSPACE_CONSOLIDATION: PASS
GP_CONTEXT_PRESERVED: PASS
NON_GP_CONTEXT_PRESERVED: PASS
GP_AND_ENTITY_READ_CONTRACTS: PRESERVE / DO_NOT MERGE BACKEND
SIDEBAR_BASE_COLOR: #182124
ACTIVE_MENU_ACCENT: #E1001F / THIN LEFT STRIP ONLY
OTHER_E1001F_USAGE: NONE
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
BALL: CHATGPT
STATUS: REVIEW
