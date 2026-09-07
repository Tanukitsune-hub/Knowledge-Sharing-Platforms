# 選択済みLight family — CODEX-10

現在のreview packageは[CODEX-10 Knowledge Search corrections](action-corrections/README.md)と[record-centric IA correction](record-centric-qa/README.md)です。
最新[QA](design-qa.md)、[検証](record-centric-qa/validation.md)、[Knowledge Search画像一覧](action-corrections/index.html)、[record-centric画像一覧](record-centric-qa/index.html)を参照してください。
`render-design.py`は現在のCODEX-10 artifactを再生成します。Canonical baseは`origin/main` `27bdf999d4716ee321ba8ba31a134745e220fa41`、Production source SHAは`9fa668619a0b91fb60ed53f696363d3954cf709e`、visual baselineはCODEX-09 / PR #46です。

以下はCODEX-09以前の履歴です。gold・検索配置・preset設定・面談種別列についてはCODEX-09、Knowledge Searchの面談先と全文出力action、record-centric IAについては上記CODEX-10が優先します。

## CODEX-08 historical record

WORK_ID: 0028
DISPATCH_ID: 0028-CODEX-08
BASE_MAIN_SHA: `960d225c388912791443cbc68efe5e5426f2a9d2`
BASE_LIGHT_PR44_SHA: `7a82b530b51227d1cc44a8cbd2b4e4b225c57d6d`
MODE: INVESTIGATION / DESIGN ONLY

Draft PR #44をreview historyとして保持し、確定済みLight visual familyへ最終polishを加えた静的設計資料です。Production `src/**`、`dist/**`、Apps Script runtime、deployment、provider、credential、backend/data contractは変更していません。

Product Design pluginのuser-context preflight、product grounding、source-to-render comparison、design QAを使用しました。新しいdirectionのideationとImageGenは行わず、PR #44とcurrent sourceを基準にdeterministic HTML/CSS/local SVGを生成しています。

## Product start and final navigation

Web Appの初期画面は`ナレッジ検索`です。`00-navigation.html`はsidebar review用で、production pageやvisual acceptance targetではありません。

1. ナレッジ検索
2. 記録を追加
3. 過去の記録
4. 面談先サマリー
5. 面談実績の集計
6. プルダウンの管理
7. 管理者ページ

Sidebarにtext group headingはありません。`面談実績の集計`とsystem/tool destinationsの間には、約1行の余白と先端が尖り中央がわずかに膨らむgold separatorを置きます。各referenceのactive sidebar destinationは1件です。

## Final polish boundary

- `面談と資料の関連`を独立destinationから外し、`過去の記録 / 面談`の`関連資料`と`過去の記録 / 資料`の`関連面談`へ統合した。
- 関係の正本は`Meeting_Index.Related_Pitchbook_IDs`の明示Document IDのみ。GP一致による推定を行わない。
- Meeting側はresolved / Inactive / unresolvedを区別し、資料側はそのDocument IDを明示参照するMeetingだけをreverse lookupで示す。
- 関係の追加・削除は既存Meeting registration/edit contractに残し、Past Recordsへmutation actionを追加しない。
- Brand、thin-line icon、separator、小さなruleをrestrained champagne / antique metallic goldへ調整した。強いglow、animation、mirror-like shine、3D表現は使わない。
- Light only。Dark / System / theme selector / theme persistence / `prefers-color-scheme`は作成しない。

## Visual artifacts

- [Light-only final screenshot review](light-only-final-polish/README.md)
- [Visual index](index.html)
- [Browser/static validation](navigation-validation.md)
- [Product Design QA](design-qa.md)
- [Page layout decisions](page-layout-review.md)
- [Input layout matrix](input-layout-matrix.md)
- [Visual errata](visual-errata.md)

`page-manifest.json`はreview-only navigation referenceを含む14画面です。`source-controls.json`はcurrent sourceから抽出した197 controlです。`render-design.py`は同じHTML referenceを再生成し、`validate-light-only-polish.py`はLight-only境界、7 destinations、relationship統合、source contract labels/tokensを検証します。

## Preserved visual system

Sidebar `#182124`、main `#F4F7FA`、white card、cool gray border、local Lucide 19px line icon、92px repeatのclean sayagataを維持しています。`#E1001F`はactive sidebar item左端3px stripだけです。Knowledge Searchはvisible model selector 1個、normal-user Thinking/Geminiは非表示です。

## Evidence boundary

1366×768 browser viewportでstatic render、layout、local navigation、checkboxのvisible toggleを確認しました。Static referenceからkeyboard、focus behavior、contrast実測、screen reader、Apps Script HTML Service、runtime、provider、server mapping、checkbox persistenceのPASSは主張しません。
