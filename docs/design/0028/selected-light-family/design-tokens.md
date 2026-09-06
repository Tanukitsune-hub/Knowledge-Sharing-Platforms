# Design tokens — selected Light A1.8

PR #42のvisual tokensを変更せず、semantic tokenとして継続します。

| Token | Value | Use |
|---|---:|---|
| --sidebar-base | #182124 | persistent sidebar |
| --paper | #F4F7FA | cool slate page background |
| --surface | #FFFFFF | cards / controls |
| --ink | #26333A | body text |
| --muted | #5B6871 | helper/meta text |
| --gold | #8B703E | restrained heading/action accent |
| --line | #D3DCE4 | cool border |
| --control | #8796A1 | visible input border |
| --selected | #303B3D | active sidebar background |
| --active-strip | #E1001F | active sidebar item left strip only |
| --chart-paper | #FFFFFF | future DarkでもLight固定 |
| --chart-ink | #26333A | chart axis/label/legend |

## Component rules

- Sidebar: 236px desktop、activeはbackground/border/text + 3px left strip。赤をicon、button、alert、badgeへ展開しない。
- Icon: local Lucide SVG、19×19px、同じstroke family、ivory/restrained gold filter。外部runtime CDNなし。
- Sayagata: sayagata-source.svg、92×92px repeat、lower-leftが濃くupper-rightへfade。interactiveには見せない。
- Card: white、1px cool border、6px radius、moderately compact padding。
- Control: white、visible border、min-height 36–37px。label直下4px。
- Internal tab: gold/border/surfaceでcurrentを示す。赤は使用しない。
- Table: separate datasetごとに独立し、horizontal page overflowを作らない。必要な場合のみtable wrapper内をscroll可能にする。
- Chart: interiorはLight固定。Dark実装はこのdispatchでは行わない。

#E1001Fの通常要素使用数は0をvalidationで確認します。
