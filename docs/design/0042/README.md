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
