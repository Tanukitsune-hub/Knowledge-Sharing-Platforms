# Selected Light design tokens

これはproduction CSSではなく、実装前のvisual role仕様です。値は全ページで共通とし、ページ別paletteを作りません。

## Color roles

| Token | Design value | Role / constraint |
|---|---:|---|
| `--sidebar-base` | `#182124` | sidebarの基底。semantic tokenとして一元化 |
| `--active-menu-strip` | `#E1001F` | active menuの左端3pxだけ |
| `--page-surface` | `#F7F6F2` | warm off-white背景 |
| `--card-surface` | `#FFFEFA` | card、answer、table外枠 |
| `--text-primary` | `#263033` | 本文・見出し |
| `--text-secondary` | `#596367` | hint、補助情報 |
| `--accent-gold` | `#8B703E` | 見出し線、primary action、控えめな強調 |
| `--border-subtle` | `#D5D4CB` | card・table区切り |
| `--control-border` | `#959D9E` | input/select/textareaの輪郭 |
| `--selected-surface` | `#353A32` | active menu背景。赤帯だけに依存しない |
| `--chart-surface` | `#FFFEFA` | Light固定のchart interior |
| `--chart-ink` | `#263033` | 軸、目盛り、label、legendのLight固定文字 |

`#E1001F`は変数定義とactive itemの左帯以外で使用しません。required、error、warning、button、link、chart、紗綾形には使用しません。

## Type, space, shape

| Role | Design value |
|---|---|
| Page title | Japanese Mincho系fallback、29px、weightは通常〜中程度 |
| UI text | Yu Gothic UI / Meiryo fallback、14px、line-height 1.55 |
| Label | 12px / semibold、inputとの間6px |
| Hint | 12px、primary textより1段弱い色 |
| Main gutter | 28px（1366px desktop） |
| Sidebar | 236px。狭いdesktopでは208px |
| Card padding / gap | 20–22px / 18px |
| Control | min-height 39px、radius 4px、1px border |
| Table | row 40–48px程度、horizontal overflowはtable単位 |

## Form roles

- 必須は赤いasteriskに依存せず、金色borderの小さな`必須`labelを併記する。
- 任意は低彩度の`任意`をlabelに併記する。
- 日付範囲、区分/Entity、provider/modelのような対は同一rowに置く。
- 質問、面談本文、フォロー、Thinking profiles、Fund / Strategyの長い値は全幅を優先する。
- Primary actionは各flowで1つ。破壊的操作も赤にせず、確認文とbutton labelで意味を示す。
- collapsed filterはactive condition summaryを残す。必須条件は折りたたまない。

## Sidebar motif

紗綾形は「卍を斜めに連続させた文様」という[榛原オンラインミュージアムの説明](https://museum.haibara.co.jp/design-collection/hyakka/13550-268)を基準にし、[Wikimedia CommonsのCC0 line SVG](https://commons.wikimedia.org/wiki/File:Sayagata_(line).svg)をgold lineへ着色して使用しています。生成画像の崩れた線をtraceしていません。

- asset: `sayagata-source.svg`;
- repeat geometry: 168px square;
- location: sidebar lower-left only;
- intensity: lower-leftで最大、upper-rightへmaskで減衰;
- mountains、ore、station、chrysanthemum、cherry、corporate logoを混ぜない。

## Responsive and future Dark

1366×768を主判定にし、1050px未満で4列を2列、760px未満で意味順序のまま1列へ落とします。tableはlocal horizontal scrollを許容します。Meeting/Pitchbookの長いformではaction visibilityを保つsticky footerを提案しますが、これは`FRONTEND_BEHAVIOR`です。

Darkでは外側のshell/card/borderだけを調整し、chartのbackground、axis、ticks、series、text、legendはLightのtokenを維持します。Dark token作成はこのdispatchの範囲外です。
