# Design tokens — selected Light A1.10

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
