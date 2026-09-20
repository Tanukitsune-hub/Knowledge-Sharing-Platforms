# Work 0042 — Right-pane visual reference

このdirectoryはWork0042の具体的なvisual baselineをCodexへ渡すための参考資料です。

## Files

- `right-pane-reference.css`
  - user-selected mockupを再現するためのdesign tokens / component recipes。
  - production sourceへそのままcopyする前提ではない。
  - `src/Styles.html`の既存contractを壊さず、必要なshared primitivesへ翻訳して使う。
- `right-pane-reference.html`
  - CSSを適用したrecord-detail static fixture。
  - selected mockupのhierarchy / spacing / card treatment / label-value rows / actionsを具体化する。

## Priority

1. user explicit requirements
2. Work0042 requirements / instruction
3. このvisual reference
4. existing production implementation

## Important boundary

- Sidebarはこのreferenceの対象外。
- 右ペインの全user-reachable surfaceへ同じdesign languageを展開する。
- CSS値の完全コピーより、component hierarchyとvisual consistencyを優先する。
- backend-only / compatibility-only hidden controlsをvisibleにしない。
- dynamic / sequential surfacesもinitial pageと同じlanguageへ収束させる。


## Palette

右ペインは、既存sidebarの格式ある黒・金のdesign languageと調和させる。
sidebar自体は変更せず、右側は可読性を優先して白〜ivory/champagneを面に使い、
goldをheader band、border、icon、active tab、primary action等のaccentとして節度を持って使う。

基準色は既存sidebarの `#D7AE42` / `#FFE89A` / `#C58C25` / `#70480D` family。
genericな青基調SaaS paletteへ寄せない。
