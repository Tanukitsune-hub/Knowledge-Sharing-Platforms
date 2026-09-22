# Work 0050 — Theme Color Tool requirements

WORK_ID: 0050
STATUS: PLANNED
MODE: BUILD
DEPENDENCY: Work0049 ACCEPTED
ACTIVE_DISPATCH: NONE
BALL: NONE

## Primary Outcome

管理者ページ > テーマ設定に、色を視覚的に探し、HEX / RGBを確認・コピーし、選択したTheme tokenへそのまま適用できる「カラー調整ツール」を追加する。

既存Work0045のTheme Settings contract
`preview -> 保存 / 変更を破棄 / 既定の配色に戻す`
を維持し、カラー調整ツールはそのpreview workflowへ統合する。

## UX target

テーマ設定panel上部に専用toolを追加する。

推奨構成:

```text
カラー調整ツール

[ 2D saturation/value picker ]   選択中の色
[ hue slider                 ]   █████████
                                HEX  #2D3E49 [コピー]
                                RGB  45, 62, 73

適用先 [ Sidebar 背景 ▼ ] [この色を適用]

[対応時のみ: 画面から色を取得]
```

## Color picking interaction

### Visual picker

リング型より、以下の組み合わせを優先する。

- large 2D saturation/value field
- horizontal hue slider

理由:
- desktopで細かく調整しやすい
- mobileでもlayoutしやすい
- ringより省スペース
- current business UIへ馴染みやすい

### Current color state

tool内で常に以下を表示:
- current color swatch
- HEX: `#RRGGBB`
- RGB: `R, G, B`

picker操作、HEX入力、Theme tokenからの読み込みのいずれでも同期する。

### HEX input

- accepted format: `#RRGGBB`
- lowercase input可
- normalize display to uppercase
- malformed inputはtool内でvalidation error
- invalid stateではTheme tokenへapply不可

### RGB display

- read-only displayでよい
- `R, G, B`の10進値
- HEXからdeterministic conversion

RGB direct editは初期scopeでは不要。

## Theme integration

### Selected target token

既存16 basic colorsから適用先を選択可能にする。

Source of truth:
- `docs/design/theme-palette-registry.md`
- Work0045 runtime theme definitions

Target list:
- Sidebar 5
- Main 4
- Text 2
- Action 2
- State 3

Total: 16

### Token -> color tool

16色一覧の任意のrow / color controlを選ぶと:
-そのtokenをactive targetにする
- current token colorをColor Toolへload
- HEX / RGB / picker positionsを同期

### Color tool -> token

`この色を適用`:
- active target tokenのdraft valueを更新
- existing Theme Settings live previewへ反映
- existing `未保存のプレビュー` stateへ移行
- server mutation 0
- Theme Saveを押すまでpersistしない

### Direct token editing compatibility

既存16色rowのsmall color input / HEX inputは維持する。

- direct row edit
- Color Tool edit
の両方が同じdraft paletteを操作する。

どちらかで変更したら他方へ即時同期する。

## Copy

`コピー` button:
- current HEXをclipboardへcopy
- success status: `HEXコードをコピーしました。`
- clipboard unavailable時はfail-safeでHEX fieldを選択しmanual copy可能にする
- copyはTheme draft / persisted stateを変更しない

## Eyedropper progressive enhancement

対応browserでは:
- `画面から色を取得`
- EyeDropper API等のbrowser-native capabilityを利用
- 取得色をColor Tool current colorへload
- 取得だけではTheme tokenを変更しない
- `この色を適用`で初めてdraftへ反映

非対応browser:
- buttonをhidden または disabled + short hint
- error扱いにしない
- core functionalityは完全に利用可能

Eyedropper availabilityに依存してacceptanceを決めない。

## Preview / persistence semantics

Color Tool自体はpersistしない。

```text
Color Tool current color
  -> この色を適用
  -> Theme draft palette
  -> existing live preview
  -> existing 保存
  -> KSP_THEME_SETTINGS_V1
```

`変更を破棄`:
- Work0045 contractどおりpersisted paletteへ戻す
- Color Toolもactive tokenのreverted valueへ同期

`既定の配色に戻す`:
- runtime override delete
- Theme draftをWork0044 defaultsへ戻す
- Color Toolも同期

## Visual design

Use Work0044 / Work0045 current visual system.

- card / section heading / button styles reused
- no new unrelated palette
- responsive 1440 / 390
- tool panel should not dominate the page
- picker should remain usable without horizontal overflow
- current color swatch large enough to compare visually

## Accessibility

- keyboard accessible controls
- hue slider operable via keyboard
- 2D field must have keyboard fallback or numeric/HEX path sufficient for full functionality
- visible labels
- focus states consistent
- color is not the sole carrier of state; HEX/RGB text always shown
- reduced motion respected

## Implementation preference

Avoid heavy third-party color picker library unless clearly justified.

Prefer:
- native Canvas / DOM + pointer events
or
- lightweight custom SVG/CSS implementation

No network dependency.

Color conversion helpers:
- HEX <-> RGB
- RGB <-> HSV/HSL as needed for picker positions

Keep deterministic and unit-tested.

## Acceptance Evidence

### A. Picker

- hue change updates current color
- 2D saturation/value change updates current color
- HEX updates in real time
- RGB updates in real time
- valid HEX direct input updates picker/swatches
- invalid HEX blocks Apply

### B. Token integration

For all 16 tokens:
- token row -> tool loads exact current draft
- Apply -> exact token draft changes
- live preview changes
- no server mutation before Save
- existing Save persists as Work0045 contract

### C. Sync

- row color input change -> Color Tool sync when same token active
- row HEX change -> Color Tool sync
- discard -> both row and tool revert
- reset -> both revert to defaults

### D. Copy

- copy button places exact uppercase HEX on clipboard
- no palette mutation
- fallback behavior works when clipboard API unavailable

### E. Eyedropper

If supported:
- button visible
- sampled color reflected in HEX/RGB
- server mutation 0

If unsupported:
- core Color Tool remains fully usable
- no console error

### F. Regression

- Theme Settings existing 16 fields preserved
- Save / Discard / Reset unchanged
- Work0049 busy feedback standard preserved
- admin tabs preserved
- 7 normal pages nonblank
- 2560 / 1440 / 1280 / 390
- console material error/warn 0
- schema/migration/provider/permission changes 0

## Non-goals

- custom palette library / saved favorite colors
- multiple named themes
- per-user themes
- gradient editor
- alpha/transparency
- RGB direct editing
- CSS arbitrary input
- Theme backend schema redesign
- Work0030
