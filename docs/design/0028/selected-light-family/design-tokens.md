# CODEX-11 最新reviewへの案内

現在の成果・操作デモ・画像・契約・validationは[integrity-light-review/README.md](integrity-light-review/README.md)を参照してください。
再生成は`render-design.py`、現行design検証は`validate-integrity.py`です。
以下はCODEX-10以前の履歴です。「現在」「PASS」「禁止」等の記述は当時のsnapshotであり、最新CODEX-11 instruction/reviewを上書きしません。旧validatorも当時のsnapshot専用です。

# Design tokens — selected Light CODEX-10

CODEX-09では`corrections.css`がgold・検索配置・モード設定・種別列を更新します。金色は`#fff3ba / #e4b34a / #c18b24 / #84601e`を含むhighlight/rich/shadow、local Lucide maskは22px。以下はCODEX-08の基礎token記録です。

PR #44のcool Light visual systemを維持し、gold treatmentだけをrestrained champagne / antique metallic rangeへpolishしました。

| Token | Value | Use |
|---|---:|---|
| `--sidebar-base` | `#182124` | persistent sidebar |
| `--paper` | `#F4F7FA` | cool slate page background |
| `--surface` | `#FFFFFF` | cards / controls |
| `--ink` | `#26333A` | body text |
| `--muted` | `#5B6871` | helper/meta text |
| `--gold` | `#8B703E` | restrained text/rule accent |
| `--gold-deep` | `#765625` | metallic gradient shade |
| `--gold-mid` | `#B38A45` | metallic gradient body |
| `--gold-highlight` | `#E0C98F` | restrained highlight |
| `--gold-shadow` | `#785723` | brand gradient terminal shade |
| `--line` | `#D3DCE4` | cool border |
| `--control` | `#8796A1` | visible input border |
| `--selected` | `#303B3D` | active sidebar background |
| `--active-strip` | `#E1001F` | active sidebar item left strip only |
| `--chart-paper` | `#FFFFFF` | Light chart interior |
| `--chart-ink` | `#26333A` | chart axis/label/legend |

## Component rules

- Sidebar: 236px desktop、7 destinationsのflat list。activeはbackground/border/text + 3px left strip。赤をicon、button、alert、badgeへ展開しない。
- Separator: 21px slot内に3pxのpointed lineを置き、中央だけわずかに膨らませる。約1 rowのbreathing spaceを兼ね、text headingは置かない。
- Gold: brand、icon、separator、small ruleだけにsubtle highlight/shadeを使う。nav label本文はplain ivory、strong glow / animation / mirror / loud 3Dは使わない。
- Icon: local Lucide SVG、19×19px、同じstroke family、ivory/restrained gold filter。外部runtime CDNなし。
- Sayagata: `sayagata-source.svg`、92×92px repeat、lower-leftが濃くupper-rightへfade。interactiveには見せない。
- Card: white、1px cool border、6px radius、moderately compact padding。
- Control: white、visible border、min-height 36–39px。label直下4–6px。
- Internal tab: gold/border/surfaceでcurrentを示す。赤は使用しない。
- Table: Meeting/Pitchbook datasetを別surfaceのまま保ち、horizontal page overflowを作らない。必要な場合だけtable wrapper内をscroll可能にする。
- Analytics: chart/tableを横並びにし、同じseriesまたはbreakdownを視覚と数値で照合する。

Theme scopeはLight onlyです。Dark/System token、selector、persistence、`prefers-color-scheme`はこのfamilyに追加しません。
