# 選択済みLight family — A1.9 final correction

WORK_ID: 0028

DISPATCH_ID: 0028-CODEX-07

BASE_MAIN_SHA: 02cc825fce3ed7debdeaaefe6ff5dd97f926e9f1

BASE_LIGHT_PR43_SHA: cd43591b65b22e52aea10dd52107850fff4aed7f

MODE: INVESTIGATION / DESIGN ONLY

Draft PR #43をpre-final Light baselineとして、確定済みvisual languageを変えずにsidebar labelsとActivity Analyticsの情報配置を最終補正した静的設計資料です。Production `src/**`、`dist/**`、Apps Script runtime、deployment、provider、credential、backend/data contractは変更していません。

Product Design pluginのuser-context preflight、product grounding、source-to-render comparison、design QAを使用しました。新しいdirectionのideationとImageGenは行わず、PR #43とcurrent sourceを基準にdeterministic HTML/CSS/local SVGを生成しています。

## Final top-level navigation

1. ナレッジ検索
2. 記録を追加
3. 過去の記録
4. 面談先サマリー
5. 面談実績の集計
6. 面談と資料の関連
7. プルダウンの管理
8. 管理者ページ

Sidebarにgroup headingはありません。`記録を追加`と`過去の記録`の`面談 / 資料`は画面内tabです。各referenceのactive sidebar destinationは1件です。

## Final correction boundary

- `面談先サマリー`はPR #43の1入口を維持し、GPなら`getGpWorkspaceData`、非GPなら`getEntityWorkspaceData`へ対応するfuture frontend routingとする。Public facade、read model、relation modelは統合しない。
- `面談実績の集計`はstandalone月次履歴をexisting Activity Analyticsへ吸収する。`期間単位=月次`では対象月を既存date rangeへ変換する想定で、新endpoint/datasetは追加しない。
- Trend chartとperiod table、breakdown chartとbreakdown tableを各1 rowへ置く。同じexisting series/breakdownを表現し、別集計を作らない。
- 月次個別Meeting一覧の右端に`確認済み`checkboxを置き、existing `adminCheckCompleted`、`updateMeetingAdminCheck`、expected state/timestampによる更新契約へ対応させる。独立した月次管理cardは置かない。
- Meeting/Pitchbookのform、handler、draft、validation、status lifecycleは引き続き分離する。Meeting Type 3値とinline quick add、Pitchbookの`原資料を開く`を維持する。

## Visual artifacts

- [Final screenshot review](final-light-review/README.md)
- [Visual index](index.html)
- [Browser/static validation](navigation-validation.md)
- [Product Design QA](design-qa.md)
- [Page layout decisions](page-layout-review.md)
- [Input layout matrix](input-layout-matrix.md)
- [Visual errata](visual-errata.md)

`page-manifest.json`は15画面、`source-controls.json`はcurrent sourceから抽出した197 control、`render-design.py`は同じHTML referenceを生成します。`validate-final-light.py`はflat navigation、統合Analytics、source contract labels/tokensを検証します。

## Preserved visual system

Sidebar `#182124`、main `#F4F7FA`、white card、cool gray border、restrained gold、local Lucide 19px line icon、92px repeatのclean sayagataをPR #43から維持しています。`#E1001F`はactive sidebar item左端3px stripだけです。Knowledge Searchはvisible model selector 1個、normal-user Thinking/Geminiは非表示です。Future Darkのchart interiorは`LIGHT_FIXED`です。

## Evidence boundary

1366×768 browser viewportでstatic render、layout、local navigation、checkboxのvisible toggleを確認しました。Static referenceからkeyboard、focus behavior、contrast実測、screen reader、Apps Script HTML Service、runtime、provider、server mapping、checkbox persistenceのPASSは主張しません。
