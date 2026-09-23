# Work 0055 — Theme Color Tool visual refinement plan

WORK_ID: 0055
STATUS: PLANNED
MODE: BUILD
DEPENDENCY: Work0054 ACCEPTED
ACTIVE_DISPATCH: NONE
BALL: NONE

## Primary Outcome

Hue controlをrainbow track + vertical indicatorへ仕上げ、selected-color swatchを横長にして色確認をしやすくする。

## Fastest Safe Decisive Action

Primarily CSS-level refinement:
- `src/Styles.html`
- tests / browser evidence

Only touch `src/ClientThemeSettings.html` if cross-browser slider value/marker behavior cannot be achieved while preserving native range semantics.

## Design target

Hue:
```text
RAINBOW_TRACK: REQUIRED
NATIVE_RANGE_SEMANTICS: PRESERVE
THUMB_STYLE: VERTICAL_BAR
TRACK_COLORS: red-yellow-green-cyan-blue-magenta-red
KEYBOARD: PRESERVE
```

Swatch:
```text
BASELINE: 58px x 58px
TARGET: ~116px x 58px
MOBILE_OVERFLOW: 0
```

## Non-goals

- new color model
- circular hue wheel
- changing 2D saturation/value picker behavior
- Theme persistence changes
- additional Theme tokens
- backend/API changes
- Work0030
