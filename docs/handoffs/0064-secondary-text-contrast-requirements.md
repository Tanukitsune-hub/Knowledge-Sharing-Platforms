# Work 0064 — secondary text contrast

WORK_ID: 0064
STATUS: ACTIVE
MODE: BUILD
VALIDATION_TIER: TIER_2_STANDARD

## Primary Outcome

既定Themeの小さい補助文字が主要背景上で通常文字のcontrast 4.5:1以上となるよう最小限に補正し、Theme設定でも`text.secondary`の低contrast組み合わせを警告できるようにする。

## Current Accepted Baseline

現行default:
- `text.secondary = #6B7E8A`
- `main.pageBackground = #E7EDF2`
- `main.cardBackground = #F8FAFB`
- derived `main.surfaceSoft = #EEF3F6`

現行defaultの`text.secondary`はこれら主要背景の一部で4.5:1未満となることが確認済み。

## Scope A — Default secondary text color

- `text.secondary`のdefaultを、現行Navy / Slate visual identityを維持する範囲で必要最小限に暗くする。
- 少なくとも以下3背景に対して通常文字4.5:1以上を満たすこと。
  - page background
  - card background
  - derived soft surface
- 色相を不必要に変えず、現行Muted Slateの性格を維持する。
- server側theme defaultとstatic CSS fallbackを一致させる。
- default変更に必要な直接結合test / fixtureのみ更新する。
- persisted custom Themeのpaletteはmigration / overwriteしない。

参考候補として`#5A6D79`は上記3背景で4.5:1以上となるが、これを固定要件とはしない。より小さく自然な変更を計算で確認できる場合はそちらを採用してよい。

## Scope B — Theme contrast warning

既存`themeSettingsRenderContrast`のwarningへ、`text.secondary`の主要background pairを追加する。

少なくとも:
- 補助文字 / ページ背景
- 補助文字 / Card背景
- 補助文字 / soft surface

soft surfaceは既存derived theme ruleと同じ計算を使い、固定色を別contractとして二重管理しないこと。

warning thresholdは通常文字4.5:1。

## UX / Compatibility Rules

- warningは現行どおりadvisoryとし、保存blockingに変更しない。
- Theme color tool、preview、save / discard / reset semanticsは維持する。
- persisted custom Themeに低contrast設定があっても自動補正・migrationしない。warningのみ。
- Work0055でaccepted済みのhue bar / indicator / swatch behaviorを維持する。
- primary text、button、state colors等をこのWorkのついでに調整しない。

## Non-Goals

- Theme token体系の再設計
- 16色UIの再設計
- user-saved palette migration / rewrite
- formal WCAG certification
- 他のcontrast issue探索
- typography変更
- provider / deployment変更

## Acceptance Evidence

### Defaults
- new default `text.secondary`とpage background: >= 4.5:1
- new default `text.secondary`とcard background: >= 4.5:1
- new default `text.secondary`とderived soft surface: >= 4.5:1
- server defaultとstatic CSS fallbackが同一。
- existing persisted custom paletteはread時に変更されない。

### Theme warning
- default paletteではsecondary contrast warningが出ない。
- `text.secondary`を意図的に低contrastへ変更すると該当warningが出る。
- page/card/derived softのいずれかが低contrastなら検知できる。
- warningがsaveをblockしない。
- Work0055 color-tool behavior維持。

### Validation
- focused contrast/default/persistence tests PASS。
- Theme browser desktop / 390px PASS。
- contrast ratioをコードで数値確認。
- `npm run check` 1回 PASS。
- generated bundle更新時のみbundle validation。
- provider call / deployment / business-data mutation 0。
- unrelated pages / 過去Work全件へDecision-Impact理由なしに拡張しない。

## Completion Boundary

ChatGPT final reviewまでACCEPTED / Completion Latchは適用しない。
