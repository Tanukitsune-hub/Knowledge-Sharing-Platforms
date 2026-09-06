# Work 0028 — Light navigation/workspace consolidation

WORK_ID: 0028
DISPATCH_ID: 0028-CODEX-06
BALL: CODEX
STATUS: READY
MODE: INVESTIGATION
PHASE: A1.8 / LIGHT NAVIGATION + WORKSPACE CONSOLIDATION / DESIGN ONLY

## Primary outcome

PR #42 / CODEX-05で確立したrefined Light visual familyを維持したまま、ユーザーが追加指定したトップレベル導線統合とWorkspace統合をdesign-onlyで反映し、final Light review targetを作る。

新しいvisual directionは作らない。`src/**`、`dist/**`、Apps Script runtime、deployment、provider/credentials/backend/data contractは変更しない。

## Starting point

Repository: `Tanukitsune-hub/Knowledge-Sharing-Platforms`

Execution開始時に最新`origin/main`とPR #42 headを取得して実SHAを記録する。

PR #42 baseline:

- Draft PR #42
- branch: `codex/0028-light-family-refinement`
- head: `64b5c4699422ec271f715741fd31e0350c41cdb6`
- PR #42 is the refined visual/style baseline, not final Light acceptance.

Also read:

- applicable `AGENTS.md` / override;
- `docs/planning/work-registry.md`;
- `docs/handoffs/0028-dispatches.md`;
- this instruction;
- CODEX-05 instruction/report/validation from PR #42;
- `docs/handoffs/0028-CODEX-05-light-family-refinement-amendment-01.md`;
- current `src/Index.html`, `src/GpWorkspacePage.html`, `src/EntityWorkspacePage.html`, `src/ActivityAnalyticsPage.html` and relevant client files;
- Work 0027/0029 accepted boundaries.

## Preserve PR #42 visual decisions

Do not reopen:

- persistent left sidebar / desktop-first wide workspace;
- sidebar `#182124`;
- cool Light page `#F4F7FA`-class slate, white cards, cool borders;
- restrained gold accents;
- active menu left strip only `#E1001F`; no other red ordinary UI;
- refined local thin-line SVG icon family;
- dense clean sayagata around 92px repeat, lower-left→upper-right fade;
- one normal-user model/profile selector; no visible Thinking;
- current Gemini qualified-disabled/hidden fixture;
- compact Meeting/Pitchbook/GP layouts from PR #42;
- future Dark charts `LIGHT_FIXED`.

## Required navigation consolidation

### 1. Registration

Replace two top-level destinations `面談を追加` / `資料を追加` with one top-level destination, preferred label `記録を追加`.

Inside it, use internal sub-tabs:

- `面談`
- `資料`

Preserve two independent forms, draft behavior, handlers, datasets and validation contracts. This is navigation/presentation consolidation only.

Meeting form additionally must:

- keep `未登録の面談先を追加` inline to the right of the 面談先 selector on desktop;
- visibly show the existing three multi-select Meeting Type checkboxes with user-facing labels `年1面談 / オフィス訪問 / 年次総会`;
- preserve existing values `ANNUAL_REVIEW / OFFICE_VISIT / ANNUAL_GENERAL_MEETING` and `meetingTypeCodes` semantics.

### 2. Past records

Replace top-level `過去の面談記録` / `過去の資料` with one top-level destination, preferred label `過去の記録`.

Internal sub-tabs:

- `面談`
- `資料`

Preserve separate search filters, tables, status, edit, delete/inactive, restore/reactivate and source actions. Do not combine Meeting and Pitchbook into one dataset/table.

Pitchbook source action remains `原資料を開く` and retains current new-tab `fileUrl` behavior.

### 3. Monthly Meeting history

Add one clear top-level surface, preferred label `面談履歴`.

Purpose: choose a specific YYYY-MM and review individual Meeting records for that month quickly.

Design it as a simple operational history view, not another analytics dashboard.

Requirements:

- one month selector (`YYYY-MM` style) plus optional minimal filters only if current contract already supports them;
- show the actual Meeting list for that month;
- reuse current Meeting date-range search and/or Activity Analytics monthly+drill capabilities;
- no new backend endpoint/dataset assumed;
- `面談活動の集計` remains a separate analytics destination.

## Workspace consolidation

Current source has both `GP Workspace` and `Entity Workspace`. Entity Workspace already supports GP context while GP Workspace is a GP-specialized read-only view. Consolidate them into one top-level destination, preferred label `Workspace`.

### Unified selector

At top:

- `対象区分`
- `対象`
- `印刷 / PDF` on the same selector/action row where practical

`対象区分` must map to current Counterparty Type / GP semantics; do not invent a new backend classification.

### When GP is selected

Preserve the useful GP-specific presentation from PR #42/current GP Workspace:

- compact summary: `面談` count / `資料` count / `最終面談日` only;
- Fund / Strategy;
- Meeting records;
- Pitchbook/material records;
- explicit Meeting↔Pitchbook relationships;
- print/PDF behavior.

Do not reintroduce visible Active KPI or headline follow-up count.

### When non-GP Entity is selected

Preserve current Entity Workspace semantics:

- Fund / Strategy aggregation/drill;
- direct/related/linked context as applicable;
- Meetings;
- Mixes / Follow-ups where source supports them;
- explicit relationship context including unresolved/Inactive retention;
- activity timeline;
- print/PDF behavior.

### Implementation mapping note

This dispatch is design-only. The visual can present one unified Workspace while future production implementation may route to existing GP read facade or Entity read facade based on selected type/entity. Do not merge server contracts or fabricate cross-facade data.

## Proposed final top-level navigation

Use the fewest clear destinations while preserving capability. Preferred structure:

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

Exact Japanese label microcopy may be refined only for clarity, but do not add destinations/capabilities.

At most one sidebar active destination per screen. Internal `面談 / 資料` sub-tabs are not separate sidebar destinations.

## Density / responsiveness

Keep the PR #42 vertical compaction. Do not add large hero/KPI cards merely because destinations were merged. At 1366x768, primary selector/action and the first useful content should remain visible where possible. Maintain no horizontal page overflow.

## Product Design / artifacts

Use Product Design if useful, but prioritize deterministic HTML/CSS/SVG over ImageGen. No new 3-way ideation.

Update/re-render the Light family so the navigation no longer shows obsolete separate destinations. Include representative states for:

- `記録を追加` with `面談` selected;
- `記録を追加` with `資料` selected;
- `過去の記録` with each sub-tab;
- `面談履歴` month-selected list;
- unified `Workspace` with GP selected;
- unified `Workspace` with non-GP selected;
- Knowledge Search;
- Analytics/Relationship/Settings for sidebar consistency.

## Validation

At minimum:

- no separate top-level Meeting/Pitchbook registration destinations;
- one `記録を追加` top-level destination + 2 internal sub-tabs;
- no separate top-level past Meeting/Pitchbook destinations;
- one `過去の記録` top-level destination + 2 internal sub-tabs;
- `面談履歴` exists and is clearly operational monthly history, not analytics duplication;
- Meeting type three existing checkboxes visible and values documented unchanged;
- quick-add counterparty inline beside selector on desktop;
- no separate top-level GP Workspace / Entity Workspace;
- one `Workspace` top-level destination;
- GP selected visual preserves GP-specific summary/content;
- non-GP selected visual preserves Entity-specific content;
- existing read-facade separation documented for future implementation;
- PR #42 visual tokens/icons/sayagata/slate background preserved;
- sidebar active destination exactly one;
- `#E1001F` ordinary elements = 0; active strip only;
- 1366x768 horizontal page overflow = 0;
- `git diff --check`;
- production path changes = none.

Static mocks do not prove keyboard/focus/contrast/runtime.

## Delivery

Fresh branch preferred:

`codex/0028-light-navigation-consolidation`

Open a new Draft PR against `main`. Do not modify/merge PR #42; keep it as the pre-consolidation refined baseline. New PR should state it supersedes PR #42 only as the final Light visual review target.

Required report:

`docs/handoffs/0028-CODEX-06-navigation-workspace-consolidation-report.md`

PR body must include direct mobile-friendly visual previews for at least:

1. final sidebar/navigation overview;
2. `記録を追加` / 面談;
3. `過去の記録` / 資料;
4. `面談履歴`;
5. unified Workspace / GP;
6. unified Workspace / non-GP.

## Return format

```text
WORK_ID: 0028
DISPATCH_ID: 0028-CODEX-06
BALL: CHATGPT
STATUS: RETURNED
MODE: INVESTIGATION
PHASE: A1.8 / LIGHT NAVIGATION + WORKSPACE CONSOLIDATION / DESIGN ONLY
BASE_MAIN_SHA: <actual>
BASE_LIGHT_PR42_SHA: 64b5c4699422ec271f715741fd31e0350c41cdb6
REGISTER_NAV_CONSOLIDATION: PASS | PARTIAL | BLOCKED
PAST_RECORD_NAV_CONSOLIDATION: PASS | PARTIAL | BLOCKED
MONTHLY_MEETING_HISTORY_SURFACE: PASS | PARTIAL | BLOCKED
MEETING_TYPE_CHECKBOXES_VISIBLE: PASS | PARTIAL | BLOCKED
COUNTERPARTY_QUICK_ADD_INLINE: PASS | PARTIAL | BLOCKED
WORKSPACE_CONSOLIDATION: PASS | PARTIAL | BLOCKED
GP_CONTEXT_PRESERVED: PASS | PARTIAL | BLOCKED
NON_GP_CONTEXT_PRESERVED: PASS | PARTIAL | BLOCKED
SOURCE_CONTRACT_PARITY: PASS | PARTIAL | FAIL
PR42_VISUAL_SYSTEM_PRESERVED: PASS | PARTIAL | FAIL
SIDEBAR_BASE: #182124
ACTIVE_MENU_ACCENT: #E1001F / LEFT STRIP ONLY
OTHER_E1001F_USAGE: NONE
GEMINI_NORMAL_USER_VISIBILITY: HIDDEN
DARK_MOCK: NOT_STARTED
PRODUCTION_IMPLEMENTATION_AUTHORIZED: NO
SOURCE_CODE_CHANGED: NO
RUNTIME_CHANGED: NO
READY_FOR_PRODUCTION_BUILD: NO
BLOCKER: <NONE or precise blocker>
BRANCH: <actual>
DRAFT_PR: <actual>
FINAL_COMMIT: <actual>
REPORT_PATH: docs/handoffs/0028-CODEX-06-navigation-workspace-consolidation-report.md
```

WORK_ID: 0028
DISPATCH_ID: 0028-CODEX-06
BALL: CODEX
STATUS: READY
