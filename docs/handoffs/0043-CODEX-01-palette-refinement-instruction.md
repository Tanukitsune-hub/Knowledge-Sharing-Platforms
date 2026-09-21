# Work 0043 CODEX-01 — palette-only institutional blue theme refinement

WORK_ID: 0043
DISPATCH_ID: 0043-CODEX-01
BALL: CODEX
STATUS: READY
MODE: BUILD

## Primary Outcome

Work0042 version23でaccepted済みのlayout / structure / behaviorを一切再設計せず、配色だけをユーザー承認済みの金融プロフェッショナル向けgrayish-blue themeへ変更する。

Sidebarはdark navyへ変更し、gold text / icons / ornamentは維持。active navigation itemだけrestrained red accentへ変更する。

desktop sidebarのviewport-height mismatchもCSS sizingだけで修正する。

## Recommended model

GPT-5.6 Luna / reasoning max。

理由: design direction / palette / implementation boundaryは確定済みで、今回は限定的なCSS実装とruntime visual qualificationが中心。

## Authoritative sources

- `docs/handoffs/0043-palette-refinement-requirements.md`
- `docs/planning/work0043-palette-refinement.md`
- `docs/design/0043/theme-reference.css`
- `docs/design/0043/theme-reference.html`
- `docs/design/0043/README.md`
- `docs/handoffs/0042-completion-report.md`
- `docs/handoffs/0042-dispatches.md`

## Hard boundary

Production source changeは原則 `src/Styles.html` ONLY。

DO NOT change:
- HTML
- client JS
- server GS
- DOM
- page layout/grid/spacing
- functionality/data semantics
- tabs / drag reorder / delete restore / terminology

If non-CSS production change appears necessary, STOP and RETURN to ChatGPT.

CSS diffで許されるcategoryは2つだけ:
1. palette/theme
2. desktop sidebar viewport-height fix

## Palette

Use the exact approved reference family in `docs/design/0043/theme-reference.css`.

Right pane:
- cool gray-blue institutional tone
- low saturation
- white / blue-gray surfaces
- no warm ivory/champagne dominance
- no bright consumer SaaS blue

Sidebar:
- dark navy background
- existing gold brand/nav/icon/ornament preserved

Active nav:
- deep red background/accent
- gold/cream text/icon readability preserved
- red does not spread to inactive nav or right pane

## Sidebar height

Desktop:
- sidebar top 0
- sidebar bottom = viewport bottom
- height equals window.innerHeight within 1px
- no blank strip below
- internal scroll remains usable

390px:
- preserve Work0042 mobile behavior

## Implementation

Prefer changing Work0042 shared theme variables / selectors instead of adding page-specific overrides.

Do not touch padding, gap, grid-template, width, max-width, font-size, DOM or element ordering except the minimum CSS sizing property required for sidebar viewport-height.

After implementation, scan Work0042 CSS block for obsolete warm ivory/champagne values on primary right-pane surfaces and classify intentional semantic/gold remnants.

## Validation

Required:
- focused Work0043 CSS/theme tests
- `npm run check`
- canonical bundle regeneration
- `npm run check:bundle`
- `git diff --check`

Source-scope guard:
- production source changed files must be `src/Styles.html` only
- generated dist/tests/evidence/docs excluded from this guard

## Actual runtime qualification

Preflight:
- same existing owner-only Web App
- served baseline version23
- source parity
- security boundary unchanged

Deploy budget:
- source sync <=1
- immutable version <=1
- same deployment update <=1
- expected final served version24
- no second deployment / new target

Check 2560 / 1440 / 1280 / 390.

All 7 normal pages:
- nonblank
- cool gray-blue theme consistent
- layout unchanged
- console material error/warn 0

Representative dynamic states:
- Past Meeting detail
- Past Meeting edit / loading
- Knowledge Full Output/result
- admin tabs
- master management
- analytics results
- one modal

Sidebar desktop:
- dark navy
- gold brand/text/icons/ornament
- selected nav deep red
- bright red selection accent visible
- rect top/bottom/height matches viewport
- no bottom blank strip

Regression:
- no layout/functionality change
- provider calls 0
- Work0030 deferred

## Output

Branch:
- `codex/0043-institutional-blue-theme`

Draft PR:
- base main
- do not merge

Report:
- `docs/handoffs/0043-CODEX-01-palette-refinement-report.md`

Update:
- `docs/handoffs/0043-dispatches.md`

Report must include:
- baseline/final head
- exact production source diff scope
- palette token mapping
- old warm color residual classification
- sidebar computed height evidence
- active red evidence
- viewport/runtime sweep
- tests
- served version
- side effects
- BLOCKER / READY_FOR_CHATGPT_FINAL_REVIEW

## Safety

```text
LAYOUT_REDESIGN: 0
FUNCTIONAL_CHANGE: 0
DOM_CHANGE: 0
JS_CHANGE: 0
SERVER_CHANGE: 0
SCHEMA_CHANGE: 0
MIGRATION_CHANGE: 0
NEW_STORAGE: 0
PHYSICAL_DELETE: 0
PROVIDER_CALLS: 0
AI_SYNC_CHANGE: 0
PERMISSION_BROADENING: 0
PUBLIC_EXPOSURE: 0
NEW_TARGET: 0
SECOND_DEPLOYMENT: 0
WORK_0030: DEFERRED_BY_USER
```

PASS:
```text
THEME_REFINEMENT: PASS
LAYOUT_REGRESSION: 0
FUNCTIONAL_REGRESSION: 0
SIDEBAR_VIEWPORT_HEIGHT: PASS
ACTIVE_NAV_RED_ACCENT: PASS
TARGET_RUNTIME_QUALIFICATION: PASS
BLOCKER: NONE
READY_FOR_CHATGPT_FINAL_REVIEW: YES
```

WORK_ID: 0043
DISPATCH_ID: 0043-CODEX-01
BALL: CODEX
STATUS: READY
