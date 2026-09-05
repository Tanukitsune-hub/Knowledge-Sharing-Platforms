# Work 0028 — selected Light family refinement

WORK_ID: 0028
DISPATCH_ID: 0028-CODEX-05
BALL: CODEX
STATUS: READY
MODE: INVESTIGATION
PHASE: A1.7 / LIGHT FAMILY REFINEMENT / DESIGN ONLY

## Primary outcome

PR #41 / CODEX-04で作成したselected Light cross-page familyを、ユーザーの実画面レビューに基づいて1回の横断refinementとして修正する。

目的は新しいdesign directionを作ることではない。選択済みvisual languageを維持しながら、次を改善する。

1. Knowledge Searchのmodel選択を一般ユーザー向けに簡素化する。
2. Meeting/Pitchbook系formのfield配置を横長desktopに最適化する。
3. 全ページで縦方向の占有を抑え、first viewの情報量を改善する。
4. GP Workspaceのsummaryを必要最小限にする。
5. Light main backgroundの黄みを除き、cool light slateへ寄せる。
6. sidebar navigation iconを上質な統一line iconへ改善する。
7. sidebar左下の紗綾形を、より細かく密度のあるrepeatへ修正する。

これはdesign-only dispatch。production implementationではない。

## Starting point / source of truth

Repository: `Tanukitsune-hub/Knowledge-Sharing-Platforms`

Authoritative main at dispatch preparation: `c6701d075030385ee683925c0bbaef36221134ad`.

CODEX-04 baseline:

- Draft PR #41
- branch: `codex/0028-selected-light-family`
- head: `46d16b46535239e2ce91f7d6bf362836bfaf9985`
- artifacts: `docs/design/0028/selected-light-family/**`
- report: `docs/handoffs/0028-CODEX-04-cross-page-light-family-report.md`

開始時に必ず`origin/main`とPR #41 headを取得し、実際のSHAを記録する。PR #41のdesign artifactsをvisual/layout baselineとして使うが、PR #41 branchへ直接追加commitせず、fresh branch `codex/0028-light-family-refinement`を作成する。必要なcurrent main control docsを取り込み、Draft PRをmain向けに作成する。

Read first:

- applicable `AGENTS.md` / `AGENTS.override.md`;
- `docs/planning/work-registry.md`;
- `docs/handoffs/0028-dispatches.md`;
- this instruction;
- `docs/handoffs/0028-CODEX-04-cross-page-light-family-report.md` from PR #41;
- `docs/design/0028/selected-light-family/README.md`;
- `page-layout-review.md`;
- `input-layout-matrix.md`;
- `visual-errata.md`;
- `family.css`;
- current production source needed to verify control/behavior semantics;
- Work 0027 / 0029 accepted boundaries.

## Closed visual language — preserve

Do not restart visual ideation.

Preserve:

- persistent left sidebar / desktop-first wide workspace;
- sidebar base semantic token `#182124`;
- restrained gold accent family;
- active sidebar item left edge only: thin `#E1001F` strip;
- no other ordinary UI use of `#E1001F`;
- bright Light main with white cards;
- correct geometric `紗綾形` motif only;
- B-like workspace shell;
- A-like Knowledge Search clarity;
- C-like moderately dense maintenance tables;
- visible control boundaries;
- Japanese task-oriented wording;
- future Dark `CHART_SURFACE_THEME: LIGHT_FIXED`;
- Work 0027 Gemini current baseline: qualified-disabled / normal-user hidden;
- Work 0029 shared-admin behavior;
- backend/data/provider/security contracts.

Do not add Home, notification, avatar/account menu, investment KPI, network graph, new backend capability, new provider, new dataset, or any feature invented only for the mock.

## User review corrections — required

### 1. Knowledge Search — collapse route/model/thinking presentation

Current mock exposes `実行方法`, `モデル`, `Thinking` separately. This is too much implementation/admin structure for a normal user.

Refine the normal-user surface to one visible model selector, e.g. label `使用モデル`.

The visible options should be user-facing approved model/profile names such as:

- `GPT-5.6 Luna`
- `Gemini 3.7 Flash` only when current provider state/policy would actually make Gemini selectable
- existing `全文出力（AIを使わない）` semantics must remain available without inventing a new backend route

The visible selector may resolve to the current route/provider/model-profile tuple internally in future implementation. Thinking/reasoning level is configured by administrator policy and must not be exposed on the normal-user screen.

Important:

- this dispatch is design-only; do not modify production mapping yet;
- no automatic provider failover;
- do not expose Gemini in the current qualified-disabled/hidden fixture;
- preserve model/policy eligibility rules;
- do not delete admin-side Thinking controls from AI Provider Settings;
- document the future presentation-to-current-contract mapping needed for implementation.

### 2. Past Pitchbook / `過去の資料` — original source action

Current source opens `fileUrl` in a new browser tab/window when the source exists.

Use a clear user-facing action label such as `原資料を開く` rather than an ambiguous `原資料` label.

If current source has no `fileUrl`, do not fabricate an action.

Do not add app-internal preview/download semantics that do not exist.

### 3. Meeting registration / Meeting edit — compact field rows

Use the same arrangement for registration and edit.

Row 1:

`日付 | 開始時間 | 面談場所`

Row 2:

`面談先区分 | 面談先`

Row 3:

`アセットクラス | エクイティ/デット | チーム`

Use proportional widths appropriate to content rather than equal-width columns when helpful. `開始時間` may be narrower; `面談場所` and `面談先` should have enough room for Japanese labels/values.

Keep long text, Fund/Strategy, notes, relations/follow-up in full-width or clearly grouped lower sections as appropriate. Preserve required/optional semantics and all existing payload fields.

### 4. Pitchbook classification edit — one compact row

On `資料の分類情報を編集`, place the following in one desktop row:

`日付 | GP | アセットクラス | エクイティ/デット`

Give GP the largest flexible width. Preserve current edit semantics: no file replacement, source retained, stable ID/current source rules unchanged.

### 5. GP Workspace — compact selector/actions and summary

Move `印刷 / PDF` immediately to the right of `GPを選択`, on the same row where practical.

Remove the visible `有効` KPI and its number.

Remove visible `要フォロー件数` from the headline summary.

The compact summary immediately below should show only:

- `面談` + count
- `資料` + count
- `最終面談日` + date

Prefer one compact horizontal summary row rather than large KPI cards if that reduces vertical height and remains readable.

Do not delete underlying source data/behavior; this is presentation-only.

### 6. Cross-page vertical compaction

Apply the same principle across the entire selected Light family:

- reduce unnecessary vertical whitespace;
- avoid large KPI cards where a compact inline summary is sufficient;
- reduce card/section padding moderately;
- keep short select/date fields on sensible horizontal rows;
- keep long textareas/multi-selects full-width;
- keep required/primary controls in first view;
- collapse low-frequency options only where source semantics remain clear;
- do not make touch/click targets or labels too small merely to save space;
- preserve visual hierarchy and readability;
- at 1366x768, maximize useful first-view content without horizontal page overflow.

This is not a mandate to make every page dense. Use compactness where the content is naturally short/structured.

### 7. Light main background — remove yellow cast

The PR #41 warm/off-white page background reads too yellow to the user.

Shift the page/shell background to a cool very-light slate / blue-gray family while keeping cards true white or near-white.

Target appearance:

- neutral/cool rather than cream/yellow;
- quiet institutional slate;
- works with sidebar `#182124`, restrained gold and white cards;
- borders should be subtle cool gray/slate rather than beige.

Use semantic tokens. A provisional candidate such as `#F4F7FA` for the page background and `#FFFFFF` for cards is acceptable, but exact hue is not permanently closed; the goal is the visual property above and easy later token adjustment.

Do not start a new palette comparison. Produce one corrected Light family.

### 8. Sidebar icons — refined consistent line icon family

The user wants the polished icon feel seen in earlier visual references.

Add a consistent icon to each sidebar destination/group where appropriate.

Requirements:

- refined thin-line icon style;
- consistent stroke, optical size and alignment;
- approximately 18–20px visual size;
- ivory / restrained gold family consistent with sidebar;
- active state remains recognizable through non-red cue + the red left strip;
- do not use red for the icons;
- no emoji;
- no external runtime CDN dependency in the design recommendation;
- prefer inline/local SVG strategy that can later be embedded safely in the Apps Script UI;
- icon meaning must match the actual destination.

Do not let icons increase sidebar width or row height materially.

### 9. Sayagata — denser, smaller-scale repeat

PR #41 sayagata is visually too zoomed / sparse.

Keep the same clean CC0/reference geometry, but reduce repeat tile scale so the lower-left reads as a dense traditional pattern field similar to the chosen reference image.

Guidance:

- materially smaller repeat than the current 168px tile; test approximately 84–100px range and choose one corrected scale;
- thin subdued gold line;
- strongest/densest at lower-left;
- fades toward upper-right;
- must not reduce navigation text contrast or look like an interaction affordance;
- do not distort or redraw the traditional geometry.

## Product Design usage

Use Product Design if available, but this is refinement of one selected system, not ideation of three new directions.

Prefer deterministic HTML/CSS/SVG visual references over ImageGen for exact controls/text/layout. Image generation is not needed to invent a new design direction.

If a visual correction pass is needed, limit to one targeted correction round. Do not enter iterative regeneration loops.

## Required page coverage

Update/re-render all affected selected-Light family references so the design remains coherent across the existing major page set and auxiliary states.

At minimum directly inspect after correction:

1. Knowledge Search
2. Past Meeting
3. Past Pitchbook
4. Meeting registration
5. Meeting edit
6. Pitchbook registration
7. Pitchbook edit/classification
8. GP Workspace
9. Entity Workspace
10. Activity Analytics
11. Relationship Explorer
12. Master management
13. AI Provider Settings
14. representative search/record states

Do not alter page capability just to make screenshots prettier.

## Validation

Re-run at least:

- all selected visual pages render;
- 1366x768 horizontal page overflow = none;
- active sidebar destination exactly one per page;
- sidebar computed base = `#182124`;
- `#E1001F` ordinary-element use = none; only active left strip;
- Knowledge Search normal-user visual has one model selector and no visible Thinking control;
- current Gemini hidden fixture remains hidden;
- Meeting register/edit use the specified 3-row compact arrangement;
- Pitchbook classification edit uses one-row 4-field layout at desktop width;
- GP Workspace headline summary contains only Meeting count / Document count / last Meeting date;
- sidebar icon family present and visually consistent;
- sayagata repeat visibly denser than PR #41 while preserving clean geometry;
- page background is cool/slate, not cream/yellow;
- `git diff --check`;
- no production path changes.

Static design evidence must not be reported as keyboard/focus/contrast/runtime PASS.

## Allowed changes / non-goals

Allowed:

- `docs/design/0028/selected-light-family/**` or a clearly versioned refinement subfolder;
- CODEX-05 report;
- dispatch/report metadata on the execution branch;
- screenshots/static HTML/CSS/SVG/design docs.

Not allowed:

- `src/**`;
- `dist/**`;
- Apps Script deployment/runtime;
- backend/server contracts;
- provider credentials/state mutation;
- Dark family;
- production implementation;
- Work 0027/0029 reopening.

## Delivery

Create a fresh branch based on the PR #41 design baseline plus current main control state, preferably:

`codex/0028-light-family-refinement`

Open a new Draft PR against `main`. Do not merge.

Treat PR #41 as the pre-refinement baseline. The new Draft PR should state that it supersedes PR #41 for final Light visual acceptance while preserving PR #41 as review history.

Required report:

`docs/handoffs/0028-CODEX-05-light-family-refinement-report.md`

PR body should include direct visual preview images for at least:

- Knowledge Search
- Meeting registration
- Pitchbook classification edit
- GP Workspace
- one dense list/analytics screen

so GitHub Mobile can review them without scrolling through HTML diffs.

## Return format

```text
WORK_ID: 0028
DISPATCH_ID: 0028-CODEX-05
BALL: CHATGPT
STATUS: RETURNED
MODE: INVESTIGATION
PHASE: A1.7 / LIGHT FAMILY REFINEMENT / DESIGN ONLY
BASE_MAIN_SHA: <actual>
BASE_LIGHT_PR41_SHA: 46d16b46535239e2ce91f7d6bf362836bfaf9985
KNOWLEDGE_MODEL_SELECTOR_SIMPLIFIED: PASS | PARTIAL | BLOCKED
NORMAL_USER_THINKING_HIDDEN: PASS | PARTIAL | BLOCKED
MEETING_FORM_COMPACT_LAYOUT: PASS | PARTIAL | BLOCKED
PITCHBOOK_CLASSIFICATION_COMPACT_LAYOUT: PASS | PARTIAL | BLOCKED
GP_WORKSPACE_COMPACT_SUMMARY: PASS | PARTIAL | BLOCKED
CROSS_PAGE_VERTICAL_COMPACTION: PASS | PARTIAL | BLOCKED
LIGHT_SLATE_BACKGROUND: PASS | PARTIAL | BLOCKED
SIDEBAR_ICON_FAMILY: PASS | PARTIAL | BLOCKED
SAYAGATA_DENSITY_REFINED: PASS | PARTIAL | BLOCKED
SOURCE_CONTRACT_PARITY: PASS | PARTIAL | FAIL
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
REPORT_PATH: docs/handoffs/0028-CODEX-05-light-family-refinement-report.md
```

WORK_ID: 0028
DISPATCH_ID: 0028-CODEX-05
BALL: CODEX
STATUS: READY
