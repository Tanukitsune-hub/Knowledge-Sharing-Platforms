# Theme Palette Registry

Status: CURRENT_TUNING_BASELINE  
Theme: Executive Navy Slate  
Registry version: 1

このファイルはWork IDから独立した配色の正本です。
今後「もう少し暗く」「見出しだけ濃く」「ボタンだけ落ち着かせる」等の微調整を行う場合、まずこのregistryを更新し、その後production CSSへ反映します。

Machine-readable source:
- `docs/design/theme-palette-tokens.json`

## 管理原則

- layout / DOM / functionalityとは分離して管理する。
- 色だけを調整するWorkでは、このregistryを最初に参照する。
- `USER_LOCKED` はユーザー明示指定。勝手に変更しない。
- `PRESERVE` は現行方向性を維持。
- `TUNABLE` は今後の見た目調整で変更可能。
- `SEMANTIC` はsuccess / warning / errorの意味識別を優先。
- hover / focus / soft background等はderived tokenとして管理し、利用者向け設定項目を増やしすぎない。

## 利用者向け基本16項目

| # | 区分 | 設定項目 | 色名 | Color Code | Status |
|---:|---|---|---|---|---|
| 1 | Sidebar | 背景 | Charcoal Navy Slate | `#2D3E49` | USER_LOCKED |
| 2 | Sidebar | 文字 | Warm Ivory Gold | `#F3E3B0` | PRESERVE |
| 3 | Sidebar | Goldアクセント | Antique Gold | `#D7AE42` | PRESERVE |
| 4 | Sidebar | 選択中背景 | Deep Corporate Red | `#B5121B` | PRESERVE |
| 5 | Sidebar | 選択中アクセント | Signal Red | `#E02A36` | PRESERVE |
| 6 | Main | ページ背景 | Mist Blue Gray | `#EEF4F9` | TUNABLE |
| 7 | Main | Card背景 | Ice White Blue | `#F8FBFD` | TUNABLE |
| 8 | Main | Section見出し背景 | Slate Header Blue | `#BDD0E4` | TUNABLE |
| 9 | Main | Border | Cool Steel Border | `#B8C8D6` | TUNABLE |
| 10 | Text | メイン文字 | Executive Ink Navy | `#1D3550` | TUNABLE |
| 11 | Text | 補助文字 | Muted Slate | `#667C90` | TUNABLE |
| 12 | Action | Primary button | Steel Executive Blue | `#507393` | TUNABLE |
| 13 | Action | Secondary button | Pale Steel Blue | `#D9E5EF` | TUNABLE |
| 14 | State | Success | Institutional Green | `#2E7D5B` | SEMANTIC |
| 15 | State | Warning | Muted Amber | `#9A6B1F` | SEMANTIC |
| 16 | State | Error | Controlled Red | `#B33A45` | SEMANTIC |

## Derived colors

基本16項目から内部UI用に派生させる色です。通常は個別調整しません。

| Token | 色名 | Color Code | 用途 |
|---|---|---|---|
| main.sectionHeaderStrong | Deep Slate Header | `#A9C0D7` | 強めのsection/table header |
| main.surfaceSoft | Soft Blue Surface | `#F1F6FA` | inset / empty / soft panel |
| main.borderStrong | Steel Border Strong | `#9FB3C4` | focus近傍、強めの境界 |
| action.primaryHover | Steel Blue Deep | `#42627F` | Primary hover |
| action.secondaryText | Slate Action Ink | `#35536D` | Secondary button text |
| focus.ring | Focus Blue | `#6D8FA9` | focus ring |
| state.successSoft | Soft Success Green | `#E4F2EB` | success background |
| state.warningSoft | Soft Warning Amber | `#F7F0DD` | warning background |
| state.errorSoft | Soft Error Red | `#F8E9EB` | error background |
| sidebar.goldHighlight | Gold Highlight | `#FFE89A` | logo / icon highlight |
| sidebar.goldDeep | Deep Antique Gold | `#70480D` | gold shadow/depth |
| sidebar.activeDeep | Deep Corporate Red Shadow | `#751017` | active nav gradient/shadow |

## 現在の見た目の狙い

- Sidebar: `#2D3E49` を面として使い、goldとredでidentityを出す。
- Main background: `#EEF4F9` の薄い青灰色。
- Card: `#F8FBFD` で背景との差をわずかに作る。
- Section header: `#BDD0E4` とし、page背景より明確に1段濃くする。
- Primary action: `#507393`。鮮やかなconsumer blueにはしない。
- Secondary action: `#D9E5EF`。黄色系actionは通常actionとして使わない。
- Warningのyellow/amberはsemantic warningに限定する。

## Future tuning workflow

例:
- 「見出しをもう少し濃く」→ `main.sectionHeader`
- 「全体をもう少し白く」→ `main.pageBackground` / `main.cardBackground`
- 「ボタンを暗く」→ `action.primary`
- 「Sidebarを少し青寄り」→ `sidebar.background`（ただし現在USER_LOCKED）
- 「赤を少し落ち着かせる」→ `sidebar.activeBackground` / `sidebar.activeAccent`

変更時はtoken単位で差分を記録し、layout / behavior変更と混ぜない。
