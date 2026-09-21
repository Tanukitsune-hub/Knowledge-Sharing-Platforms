# Work 0043 — palette refinement requirements

WORK_ID: 0043
STATUS: ACCEPTED
MODE: BUILD
PHASE: COMPLETE
BALL: NONE
ACTIVE_DISPATCH: NONE

## Baseline

```text
BASELINE_PRODUCT: Work0042
FINAL_SERVED_VERSION: 23
WORK_0042: ACCEPTED
WORK_0030: DEFERRED_BY_USER
```

## Primary Outcome

Work0042でacceptedになったlayout / page structure / interaction / functionalityを一切再設計せず、配色だけをユーザー承認済みの金融プロフェッショナル向けgrayish-blue themeへ変更する。

Sidebarはdark navyへ変更し、既存のgold typography / icon / ornamentを維持する。active navigation itemにはrestrained red accentを復活させる。

追加で、desktop sidebarの下端がbrowser viewportと揃うようCSS sizingだけを修正する。

## Absolute scope boundary

Production implementationは原則 `src/Styles.html` のCSS変更だけで完結させる。

許可:
- color tokens
- background / border / shadow / text / focus / semantic state colors
- sidebar background / active state colors
- desktop sidebar viewport-height sizingに必要なCSS property

禁止:
- HTML DOM structure変更
- grid / column / row / spacing / padding / margin / width等のpage layout変更
- typography size / hierarchy変更
- JS behavior変更
- Apps Script / API / service変更
- routing / navigation IA変更
- Work0042 feature semantics変更

もしapproved theme実現にCSS以外のproduction source変更が必要なら、勝手にscopeを広げずBLOCKERとしてChatGPTへ返す。

Generated dist / tests / evidenceはcanonical workflowに必要な範囲で更新してよい。

## Concrete visual reference

User-approved paletteは以下をauthoritative visual referenceとする。

- `docs/design/0043/theme-reference.css`
- `docs/design/0043/theme-reference.html`
- `docs/design/0043/README.md`

Work0042のvisual hierarchy / component geometryはそのまま維持し、上記referenceのpaletteだけをproductionへ翻訳する。

## Approved palette

### Right pane

方向:
- cool gray-blue
- understated / institutional
- financial professional
- calm, low saturation
- warm ivory / champagne castを排除
- bright consumer-SaaS blueにはしない

Reference tokens:
- page: `#eaf0f5`
- page deep: `#dfe7ee`
- surface: `#f9fbfc`
- surface soft: `#f2f6f9`
- header: `#dce7f0`
- header strong: `#cfdce7`
- border: `#c3d0da`
- border strong: `#aabac8`
- ink: `#18324a`
- ink soft: `#40596f`
- muted: `#65798a`
- blue accent: `#315f7e`
- blue dark: `#23485f`
- focus: `#5f819a`

Semantic success / warning / dangerは識別性を維持し、blue-grayへ無理に統一しない。

### Sidebar

Background:
- dark navy
- reference: `#0b2846 / #103555 / #071d34`
- black/brown castを避ける

Gold:
- existing Work0042 gold languageを維持
- `#d7ae42 / #ffe89a / #c58c25 / #70480d`
- brand text / nav text / icons / ornamentはgold familyを維持

### Active navigation

現在選択中のnavigation itemだけred accentを使う。

Reference:
- red: `#b5121b`
- deep red: `#751017`
- bright accent: `#e02a36`
- soft border: `#d94a52`

Intent:
- active locationが一目で分かる
- goldとの併用で格式感を維持
- 他nav itemやright-paneへredを広げない

## Sidebar viewport-height fix

Desktopでsidebarの上端 / 下端をbrowser viewportと一致させる。

Acceptance:
- top = 0
- bottom = viewport bottom
- computed height ≈ `window.innerHeight`（1px tolerance）
- unnecessary outer gap 0
- sidebar contentがviewportより長い場合はexisting internal scroll usabilityを維持
- right-pane scroll / document heightへsidebar heightを追従させない

Desktop 2560 / 1440 / 1280で直接確認する。

390pxではWork0042 accepted mobile sidebar behaviorを維持し、desktop fixed-height contractを無理に適用しない。

## Preserve — Work0042 Completion Latch

以下は再設計・変更しない。

- all page layouts
- all form field placement
- Meeting detail / editor structure
- Knowledge Search layout / Full Output
- admin 2 tabs
- master drag reorder
- delete / restore
- loading / empty / disabled states
- user-facing terminology
- entity / analytics drill-down
- modal / attachment layout
- sidebar IA / width / nav ordering
- optimistic concurrency / Audit
- provider/model behavior
- security boundary

## Acceptance Evidence

### A. Source scope

Production source diff:
- expected: `src/Styles.html` only
- any other `src/*` change = BLOCKER unless ChatGPT explicitly approved

Review CSS diff and classify every change as:
1. palette/theme
2. desktop sidebar viewport-height fix

No third category allowed.

### B. Palette

Actual runtime:
- warm ivory/champagne dominance absent from right-pane main surfaces
- cool gray-blue page/card/header/table/input/status language consistent across all 7 pages
- sidebar dark navy
- gold brand/nav/icon/ornament preserved
- active nav deep red + bright red accent visible

### C. Layout preservation

Compare representative bounding boxes / grid placements against Work0042 baseline or source contracts.

No intentional change to:
- 12-column desktop layouts
- card order
- field placement
- button placement
- table structure
- modal geometry
- admin/master tab behavior

### D. Dynamic states

Because only palette changes, reuse Work0042 reachable-state inventory. Verify representative dynamic surfaces receive the theme automatically:
- Past Meeting detail/edit/loading
- Knowledge result / Full Output
- modal
- admin tabs
- master management
- analytics result

Do not add or remove hidden surfaces.

### E. Sidebar height

At desktop viewports:
- sidebar rect top = 0
- sidebar rect bottom ≈ viewport height
- no visible blank strip below sidebar
- sidebar internal scroll remains usable

### F. Runtime

- all 7 pages nonblank
- 2560 / 1440 / 1280 / 390
- console material error/warn 0
- provider calls 0
- schema / migration / permission / public exposure change 0

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
WORK_0030: DEFERRED_BY_USER
```
