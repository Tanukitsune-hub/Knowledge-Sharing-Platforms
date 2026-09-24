# Theme Palette Registry

- Status: WORK0064_REVIEW_CANDIDATE
- Theme: Executive Navy Slate
- Registry version: 3
- Source: Work0044 / served version25、text.secondary補正案: Work0064

このファイルはWork IDから独立した配色の正本です。Work0044でユーザーが実画面確認したpaletteを基礎とし、Work0064では補助文字のみcontrast基準に合わせて補正します。Work0064の変更はChatGPT final review待ちです。

Machine-readable source:
- `docs/design/theme-palette-tokens.json`

## 管理原則

- layout / DOM / functionalityとは分離して管理する。
- 色だけを調整するWorkでは、このregistryを最初に参照する。
- runtime theme設定では、このregistryの値を「既定の配色」とする。保存済みcustom paletteは変更しない。
- hover / focus / soft background等はderived tokenとして扱い、利用者向けの基本設定項目を増やしすぎない。
- semantic success / warning / errorは意味識別を維持する。
- theme overrideが存在しない場合は必ずこの既定値へ戻る。

## 基本16項目 — Work0044 baseline + Work0064補正案

| # | 区分 | 設定項目 | 色名 | Color Code |
|---:|---|---|---|---|
| 1 | Sidebar | 背景 | Charcoal Navy Slate | `#2D3E49` |
| 2 | Sidebar | 文字 | Warm Ivory Gold | `#EADDBF` |
| 3 | Sidebar | Goldアクセント | Antique Gold | `#D7AE42` |
| 4 | Sidebar | 選択中背景 | Deep Corporate Red | `#B5121B` |
| 5 | Sidebar | 選択中アクセント | Signal Red | `#E02A36` |
| 6 | Main | ページ背景 | Executive Mist Slate | `#E7EDF2` |
| 7 | Main | Card背景 | Slate White | `#F8FAFB` |
| 8 | Main | Section見出し背景 | Executive Slate Header | `#CDD9E2` |
| 9 | Main | Border | Cool Steel Border | `#BBC9D3` |
| 10 | Text | メイン文字 | Executive Ink | `#263B49` |
| 11 | Text | 補助文字 | Muted Slate | `#5A6D79` |
| 12 | Action | Primary button | Executive Steel Blue | `#405F72` |
| 13 | Action | Secondary button | Pale Slate Blue | `#DCE5EB` |
| 14 | State | Success | Institutional Green | `#1F7A52` |
| 15 | State | Warning | Muted Amber | `#8B6515` |
| 16 | State | Error | Controlled Red | `#B42630` |

## Derived tokens — current exact values

| Token | 色名 | Color Code |
|---|---|---|
| main.surfaceSoft | Soft Slate Surface | `#EEF3F6` |
| main.sectionHeaderTop | Slate Header Highlight | `#D7E1E8` |
| main.sectionHeaderStrong | Deep Slate Header | `#BECDD8` |
| main.borderStrong | Steel Border Strong | `#A3B5C1` |
| text.inkSoft | Slate Ink Soft | `#4A6170` |
| action.primaryDark | Executive Blue Deep | `#2F4B5D` |
| action.primaryTop | Executive Blue Highlight | `#526F81` |
| action.primaryHover | Executive Blue Hover | `#607D8D` |
| focus.ring | Slate Focus | `#6C8798` |
| state.successSoft | Soft Success Green | `#E4F3EB` |
| state.warningSoft | Soft Warning Amber | `#F8F0D8` |
| state.errorSoft | Soft Error Red | `#F9E8EA` |
| sidebar.goldHighlight | Gold Highlight | `#FFE89A` |
| sidebar.goldDeep | Deep Antique Gold | `#70480D` |
| sidebar.activeDeep | Deep Corporate Red Shadow | `#751017` |

## Work0045 handoff rule

Theme設定機能は、このregistryの基本16項目を利用者が編集するUIとし、GitHub上のこの値は不変のfallback defaultとして扱う。runtime overrideは別の共有設定領域へ保存し、repositoryの既定値を上書きしない。
