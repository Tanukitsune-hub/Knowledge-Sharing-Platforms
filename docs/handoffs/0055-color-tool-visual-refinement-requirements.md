# Work 0055 — カラー調整ツール visual refinement

WORK_ID: 0055
STATUS: ACTIVE
MODE: BUILD
VALIDATION_TIER: TIER_2_STANDARD
BASELINE: Work0054 accepted / Work0057 validation policy

## Primary Outcome

管理者ページ > テーマ設定 > カラー調整ツールを、現在の機能を維持したまま直感的に色を選びやすいUIへ改善する。

ユーザー確定要件:
- 色相controlを、虹色のbar上を縦indicatorが左右に移動する見た目にする。
- 「選択中の色」swatchを横方向に約2倍へ拡大する。現状58×58pxを基準に、約116×58px。
- 390pxを含むmobileで新しいhorizontal overflowを発生させない。

## Existing behavior to preserve

- hueは0–359でHSV stateと同期する。
- SV field、HEX、RGB、適用先、コピー、EyeDropper、プレビュー、保存/破棄/既定色へのresetを維持する。
- keyboard操作とaccessibility semanticsを維持する。
- Themeのbackend/storage/schema/APIを変更しない。
- Work0054の管理者ページaccess modelを変更しない。

## Required Scope

主対象:
- `src/AiProviderSettingsPage.html`
- `src/ClientThemeSettings.html`
- `src/Styles.html`
- 必要なfocused tests
- generated bundle / manifest

実装方針は既存native range inputを再利用してよい。虹色barと現在hue位置の縦indicatorが視覚的に明確で、input valueと常に同期する最小実装を選ぶ。

## Acceptance Evidence

- hue barが赤→黄→緑→シアン→青→マゼンタ→赤の連続色相として見える。
- current hue位置に縦indicatorが表示され、pointer/keyboard/input変更に追従する。
- hue値と既存HSV/HEX/RGB同期を壊さない。
- selected-color swatchが約116×58px。
- desktopのTheme tabで既存color-tool操作が維持される。
- 390pxのTheme tabで新規horizontal overflow 0。
- focused tests PASS。
- canonical checkは変更面との結合を確認するため1回。
- relevant browser checkはTheme tabのdesktop + 390pxのみ。全7画面、全過去Work、provider、backup、deploymentの再検証はしない。
- target-runtime qualification / deployは、local/synthetic evidenceでsettleできない具体的runtime差が見つからない限り不要。
- BLOCKER: NONE。

## Non-Goals

- 16色theme tokenの再設計
- palette既定値変更
- Theme backend/storage変更
- 管理者ページの他2タブ変更
- 全体visual redesign
- Work0056 Entity Workspace mobile overflow
- deployment/version更新を証拠作成だけのために行う

## Completion

Acceptance達成後、関連diff/整合性を1回確認して停止する。追加の全画面regressionやtarget-runtime qualificationを習慣的に追加しない。
