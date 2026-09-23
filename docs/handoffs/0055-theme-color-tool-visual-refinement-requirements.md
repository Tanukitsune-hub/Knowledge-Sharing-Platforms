# Work 0055 — Theme Color Tool hue bar / swatch refinement requirements

WORK_ID: 0055
STATUS: PLANNED
MODE: BUILD
DEPENDENCY: Work0054 ACCEPTED
ACTIVE_DISPATCH: NONE
BALL: NONE

## Primary Outcome

Work0050で導入したTheme Color Toolの視認性を改善する。

1. 色相sliderを「現在の色相位置が一目で分かるrainbow bar」にする。
2. slider thumbは丸いnative knobではなく、bar上を左右に移動する縦棒indicatorとして見せる。
3. 「選択中の色」swatchを現在より横方向に約2倍へ拡大する。

## Hue bar

Current control:
- `#theme-color-hue`
- value range 0–359
- existing HSV logic / keyboard behavior is preserved

Required visual:
- horizontal hue spectrum:
  red -> yellow -> green -> cyan -> blue -> magenta -> red
- spectrum must fill the actual track/bar, not merely appear behind an opaque native track
- selected hue is indicated by a clearly visible vertical marker / thumb
- marker travels continuously across the bar with the range value
- marker must remain visible on both light and dark portions of the spectrum
- do not add a second redundant hue display

Preferred implementation:
- keep semantic `input[type=range]` for keyboard/accessibility
- custom CSS for track and thumb
- WebKit/Blink and Firefox range pseudo-elements as needed
- thumb appearance: narrow vertical bar, approximately 3–5px visual width, taller than the hue bar
- use contrasting border/shadow so the marker is visible at any hue

Accessibility:
- native range semantics preserved
- Arrow keys preserved
- focus-visible preserved
- no color-only instruction required for operation

## Selected-color swatch

Current:
- `.theme-color-swatch` = 58px × 58px

Required:
- preserve height around 58px
- expand horizontal width to approximately 116px
- same border / radius family
- no layout overflow at 390px
- label `選択中の色` remains adjacent and readable

Target:
```text
SWATCH_HEIGHT: 58px
SWATCH_WIDTH: ~116px
```

Minor responsive adjustment is allowed only if required to prevent narrow-screen overflow, but desktop target should be approximately 2x current width.

## Preserve

- Work0050 HSV / HEX / RGB conversion logic
- 2D saturation/value picker
- direct HEX input
- RGB output
- Copy
- token selector
- `この色を適用`
- EyeDropper progressive enhancement
- Theme draft / preview / Save / Discard / Reset semantics
- 16 Theme tokens
- Work0049 async feedback
- no new persistence
- no backend/schema/provider changes

## Acceptance Evidence

- hue spectrum visible across full effective slider track
- native opaque track does not hide spectrum
- selected hue marker rendered as vertical bar
- marker position follows hue 0 / 60 / 120 / 180 / 240 / 300 / 359
- mouse/pointer and keyboard hue changes still update HEX/RGB/swatch
- focus-visible PASS
- selected color swatch approximately doubles in width vs Work0050 baseline
- desktop 1440 PASS
- mobile 390 PASS, horizontal overflow 0
- Color Tool existing focused tests PASS
- `npm run check` PASS
- bundle PASS
- business/backend/persistence semantics change 0
- Work0030 remains DEFERRED_BY_USER
