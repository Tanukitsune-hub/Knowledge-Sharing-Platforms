# Work 0044 — Executive Navy Slate theme reference

Work0043でaccepted済みのlayout / DOM / functionality / terminologyを固定したまま、配色だけを微調整するためのGitHub referenceです。

## Palette contract

- Sidebar background: exact `#2d3e49`
- Sidebar text / icon / ornament: existing metallic gold family
- Selected navigation: existing restrained red family
- Right pane page: cool pale slate blue `#e7edf2`
- Header bands: pageより一段濃い `#cdd9e2` / `#becdd8`
- Cards and inputs: near-white `#f8fafb` with cool blue-gray borders
- Primary / secondary / tertiary actions: blue-slate family
- Warning / destructive states: semantic distinctionを維持する範囲だけwarm/redを許可

## Files

- `theme-reference.css`: exact tokens and component mapping
- `theme-reference.html`: local static comparison fixture

## Production boundary

Production source changeは`src/Styles.html`のpalette/theme CSSだけです。HTML、JavaScript、Apps Script service、schema、migration、data semantics、grid、spacing、navigation IAは変更しません。

CSSだけで要件を実現できない場合はscopeを拡張せずBLOCKERとして返します。

