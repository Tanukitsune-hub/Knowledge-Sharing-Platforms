# CODEX-01 — Build multi-screen UI Studio with fine positioning

WORK_ID: 0035
DISPATCH_ID: 0035-CODEX-01
BALL: CODEX
STATUS: READY
MODE: BUILD

## Goal

Upgrade the accepted Work0033 UI Layout Lab into a multi-screen UI Studio covering all seven current normal navigation tabs, including `記録を追加`, with substantially finer direct positioning.

## Read first

- latest `origin/main`
- root / nearest `AGENTS.md`
- `docs/decisions/multi-screen-ui-studio.md`
- `docs/planning/work0035-multi-screen-ui-studio.md`
- `docs/handoffs/0033-completion-report.md`
- `docs/handoffs/0033-user-layout-candidate-current.json`
- `docs/handoffs/0034-completion-report.md`
- current production source on main only as visual/reference evidence

## Fixed boundary

UI Studio is local-only.

```text
PRODUCTION_SRC_MODIFICATION: 0
DIST_MODIFICATION: 0
APPS_SCRIPT_DEPLOYMENT: 0
NETWORK_CALLS: 0
GOOGLE_CALLS: 0
PROVIDER_CALLS: 0
CONFIDENTIAL_DATA: 0
WORK_0030: DEFERRED_BY_USER
```

Do NOT deploy version11 in Work0035.

## Continue existing tool

Extend:
`tools/ui-layout-lab/`

Do not build an unrelated second editor.

`open-layout-lab.bat` must continue to launch the upgraded Studio.

Rename visible title to something like `UI Studio` / `Layout Lab — Multi-screen` if useful, while preserving discoverability.

## Screens

Implement these seven editable screens:

```text
knowledge              ナレッジ検索
meeting-create         記録を追加
meeting-past           過去の記録
counterparty-summary   面談先サマリー
activity-analytics     面談実績の集計
masters                プルダウンの管理
admin                  管理者ページ
```

### Meeting-create

Must include the already accepted layout, not reset to an old mock.

Baseline must reflect:
- 12-column canonical production candidate
- width100% / max2000
- current visible/hidden fields
- current quick-add treatment concept
- current version10 production state

Support import/migration of Work0033 current candidate and saved variants.

## Baseline fidelity

Use Work0034/version10 production UI as visual baseline.

Each screen should include enough real structure for meaningful layout editing:
- page title
- visible filters/forms
- major action row
- summary/stat cards
- major table/chart/list blocks
- major secondary sections

Use deterministic synthetic content only.

Do not reproduce hidden backend-only controls as normal editable visible blocks unless the user explicitly toggles a developer/debug mode.

## Shared shell editor

Expose shared settings for:
- page width percent
- page max width
- page alignment
- sidebar width
- sidebar gold intensity
- icon depth / shadow intensity
- ornament opacity
- ornament scale
- common card radius
- common block gap
- common form control height

Changing a shared value updates all seven previews.

Allow a screen to preview shared changes without mutating per-screen block specs.

## Screen selector / overview

Top toolbar:
- screen selector
- Previous / Next screen
- Overview button

Overview:
- show seven small preview/status cards or thumbnails
- identify modified/clean screens
- click to open screen

Each screen keeps its own unsaved marker.

## Fine positioning — macro + micro

### Macro grid

Support:
- 12 columns
- 24 columns
- 48 columns

Default new/current Studio editing mode:
`24 columns`.

Conversion must preserve proportions when exact and safely normalize when not exact.

### Micro snap

Support:
- 8px
- 4px (default)
- 2px
- 1px

Direct mouse drag and resize should snap to current micro increment for residual positioning.

Canonical optional micro properties:
- `xOffsetPx`
- `yOffsetPx`
- `widthAdjustPx`

Keep:
- order
- colStart
- colSpan
- breakBefore
- topGapPx
- heightPx

Micro adjustments should be bounded and fail-safe. Large residual offsets should trigger lint warning rather than silently produce fragile layouts.

### Mouse interaction

Selected block:
- direct drag placement
- 8-direction edge/corner handles
- live measurement badge
- alignment guides
- collision/bounds state
- one pointer gesture = one history entry

When dragging:
- macro placement follows grid cell
- remaining pointer distance becomes micro offset snapped to selected px increment

Do not require inspector sliders for ordinary placement.

### Keyboard nudge

When canvas owns focus:
- Arrow = current micro snap one step
- Shift+Arrow = four steps

Do not intercept input/select/textarea/button keyboard interaction.

## Inspector

For selected block show:
- order
- start column
- span
- row break
- top gap
- height
- x offset
- y offset
- width adjustment
- visible

Mouse and inspector must remain synchronized.

## Two-level editing

For screens with complex sections, support:
1. section/card block arrangement
2. editable child controls inside selected form/filter section

At minimum implement child editing where it materially helps:
- knowledge search filters
- meeting-create fields
- meeting-past filters
- counterparty-summary selector/summary sections
- analytics filters
- master forms/sections
- admin setting cards

Do not expose table cells or chart internals as draggable elements.

## Project model

Implement one stable project JSON.

Recommended canonical shape:

```json
{
  "projectSpecVersion": 1,
  "baseline": "work0034-version10",
  "shared": {},
  "screens": {
    "knowledge": {},
    "meeting-create": {},
    "meeting-past": {},
    "counterparty-summary": {},
    "activity-analytics": {},
    "masters": {},
    "admin": {}
  }
}
```

Screen schema may be promoted beyond Work0033 spec v2 if required. If so:
- deterministic v2 migration
- no destructive local variant reset
- current Meeting candidate preserved

## State / variants

Implement:
- current screen undo/redo
- shared setting undo/redo or safe project history
- reset current screen
- reset whole project
- named project variants in localStorage
- load/delete project variant
- per-screen dirty marker
- project dirty marker

Bound history to avoid unbounded memory.

## Export / import

Support:
- current screen JSON copy/download
- entire project JSON copy/download
- standalone old Meeting JSON import
- project JSON import
- exact canonical roundtrip
- invalid import fail-closed

## Handoff

Support:
- `Codexに渡す — current screen`
- `全画面のdesign summary`

Current-screen handoff must include:
- shared shell values relevant to the screen
- screen blocks/fields
- macro grid
- micro offsets
- viewport intent
- visual-only implementation boundary

All-screen summary should not imply all screens must be deployed at once.

## Presets

Project-wide:
- Current Production v10
- Compact Institutional
- Balanced Professional
- Memo / Data Focus

Screen-specific presets may be added where useful.

Applying a preset produces normal editable state.

## Design lint

Per-screen warnings:
- collision/out-of-bounds
- huge micro offset
- too narrow control
- excessive gap
- mobile risk
- inconsistent control heights

Project-wide warnings:
- inconsistent page max width
- common card/control token drift
- sidebar/shared token divergence

No numeric score.

## Responsive preview

At minimum:
- Wide 2560
- Laptop 1440
- Compact 1280
- Mobile 390

Viewport switch is preview-only and must never mutate canonical desktop specs.

Meeting-create retains Work0034 topology behavior.

Other screens should preserve desktop topology unless the screen definition explicitly models a responsive rule.

Mobile may use a one-column projection without changing desktop data.

## Reference images

Maintain local-only screenshot overlay, now scoped per screen.

Image bytes:
- tab-memory only
- not localStorage
- not repository
- never transmitted

## Tests

Node standard library only.

Add focused tests covering at least:
- exactly 7 screen IDs
- baseline validity all screens
- unique block IDs per screen
- project validation
- project stable JSON roundtrip
- current screen export
- project import fail-closed
- meeting v1/v2 migration
- existing Meeting candidate preservation
- 12/24/48 conversion
- 8/4/2/1 micro snap normalization
- micro offset bounds
- direct placement/resize math
- screen switch state preservation
- shared setting propagation
- screen-specific isolation
- project localStorage migration/save/load model
- per-screen dirty state
- current-screen handoff
- all-screen summary
- viewport non-mutation
- no runtime network dependency
- no `src/`/`dist/` production modifications

Run:
- focused Studio tests
- `npm run check`
- `git diff --check`

Do not regenerate production bundle.

## Browser qualification

Chrome file:// automation limitation is known. Do not invent production/runtime changes to bypass it.

Perform any deterministic static/browser harness work available without violating the local-only contract, then return a concise USER checklist for actual `open-layout-lab.bat` verification if needed.

USER manual pass should cover:
1. all 7 screens switch and render
2. Meeting-create existing candidate present
3. edit Meeting-create and 3+ other screens
4. direct drag and corner resize
5. 48-column precision
6. 4px and 1/2px micro nudge
7. shared page/sidebar setting propagates to all screens
8. per-screen edit does not leak
9. overview modified indicators
10. save/load project variant
11. whole-project export/import roundtrip
12. current-screen handoff
13. 2560/1440/1280/390 preview
14. per-screen reference image
15. console material error/warn0

## Git

Branch:
`codex/0035-multi-screen-ui-studio`

Create one Draft PR. Do not merge.

Report:
`docs/handoffs/0035-CODEX-01-multi-screen-ui-studio-report.md`

## Autonomous completion

Own implementation/debug/deterministic validation in one Dispatch.

Up to 3 coherent repair cycles. Do not return for ordinary HTML/CSS/JS/test failures.

Return early only for:
- production source change requirement
- external dependency/network requirement
- material architecture boundary change
- retry budget exhaustion

## Return contract

If USER local verification is required:
```text
WORK_ID: 0035
DISPATCH_ID: 0035-CODEX-01
BALL: USER
STATUS: ACTION_REQUIRED
```

After USER qualification is incorporated:
```text
WORK_ID: 0035
DISPATCH_ID: 0035-CODEX-01
BALL: CHATGPT
STATUS: RETURNED
```