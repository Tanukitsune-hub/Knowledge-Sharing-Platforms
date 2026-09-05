# Selected Light design tokens — refined

値は全ページで共通です。ページ別paletteやcomponent variantを作らず、将来のproduction実装でもsemantic roleを保ちます。

## Color roles

| Token | Refined value | Role / constraint |
|---|---:|---|
| `--sidebar-base` | `#182124` | persistent sidebar基底 |
| `--active-menu-strip` | `#E1001F` | active item左端3pxだけ |
| `--page-surface` | `#F4F7FA` | cool very-light slate / blue-gray |
| `--card-surface` | `#FFFFFF` | card、answer、table外枠 |
| `--text-primary` | `#26333A` | 本文・見出し |
| `--text-secondary` | `#5B6871` | hint、補助情報 |
| `--accent-gold` | `#8B703E` | 見出し線、primary action、控えめな強調 |
| `--border-subtle` | `#D3DCE4` | cool grayのcard・table区切り |
| `--control-border` | `#8796A1` | input/select/textareaの明瞭な輪郭 |
| `--selected-surface` | `#303B3D` | active menu背景。赤帯だけに依存しない |
| `--chart-surface` | `#FFFFFF` | `CHART_SURFACE_THEME: LIGHT_FIXED` |
| `--chart-ink` | `#26333A` | 軸、目盛、label、legendのLight固定文字 |

`#E1001F`は変数定義とactive itemの左帯以外で使用しません。required、error、warning、button、link、icon、chart、紗綾形には使用しません。

## Type, space, shape

| Role | Refined value |
|---|---|
| Page title | Japanese Mincho fallback、27px |
| UI text | Yu Gothic UI / Meiryo fallback、14px、line-height 1.55 |
| Label | 12px / semibold、inputとの間4px |
| Hint | 12px、secondary token |
| Main gutter | 24px（1366 desktop） |
| Sidebar | 236px、狭いdesktopでは208px |
| Card padding / gap | 15px 18px / 12px |
| Grid gap | 10px 18px |
| Control | min-height 37px、radius 4px、1px border |
| Table | cell padding 9px 10px、local overflow only |
| Sidebar row | min-height 35px、19px icon |

Compact化は短いstructured fieldとsummaryへ限定します。Textarea、multi-select、長いselector、回答、citation、status説明は必要幅を維持します。

## Form-width roles

- Meeting row 1: `日付 .8fr | 開始時間 .5fr | 面談場所 1.8fr`;
- Meeting row 2: `面談先区分 .9fr | 面談先 2.1fr`;
- Meeting row 3: `Asset Class 1.25fr | Equity / Debt .8fr | Team 1.25fr`;
- Pitchbook classification: `日付 .85fr | GP 2fr | Asset Class 1.2fr | Equity / Debt 1fr`;
- Fund / Strategy、面談内容、notes、関連GP/Pitchbook、admin Thinking profilesは全幅;
- required / optionalは文字labelを併記し、色だけで区別しない;
- 1050px未満は意味順序を保った2列、760px未満は1列へ落とす。

## Sidebar icon family

Lucideのindividual SVGを`icons/`へlocal保存し、19px、同一stroke family、同一filter colorで表示します。外部runtime CDN、icon font、emoji、red iconは使いません。

| Destination | Asset |
|---|---|
| ナレッジ検索 | `icons/search.svg` |
| 過去の面談記録 | `icons/notebook-text.svg` |
| 過去の資料 | `icons/file-text.svg` |
| 面談を登録 | `icons/notebook-pen.svg` |
| 資料を登録 | `icons/file-plus.svg` |
| GP Workspace | `icons/building-2.svg` |
| Entity Workspace | `icons/users.svg` |
| 面談活動の集計 | `icons/chart-column.svg` |
| 面談と資料の関連 | `icons/link-2.svg` |
| マスター管理 | `icons/database.svg` |
| AIプロバイダ設定 | `icons/settings-2.svg` |

Licenseは`icons/LICENSE.txt`に同梱します。Production実装時は同じlocal SVGをinline resourceまたはlocal static resourceとして取り込み、外部network fetchを追加しません。

## Sidebar motif

`sayagata-source.svg`のCC0 line geometryを歪めず反復します。

- repeat geometry: `92px 92px`（PR #41: `168px 168px`）;
- location: sidebar lower-left only、height 292px;
- intensity: lower-leftで最大、upper-rightへmaskで減衰;
- thin subdued gold line、pointer-eventsなし;
- navigation labelやactive stateを妨げない;
- mountains、ore、station、chrysanthemum、cherry、corporate logoを混ぜない。

## Future Dark boundary

Dark tokenはこのdispatchで作りません。将来Darkでもchart background、axis、ticks、series、text、legendは上記Light固定tokenを維持し、外側のshell/card/borderだけを調整します。
