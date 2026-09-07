# Visual errata — A1.9 final Light correction

Source SHA: `02cc825fce3ed7debdeaaefe6ff5dd97f926e9f1`
Baseline: Draft PR #43 / `cd43591b65b22e52aea10dd52107850fff4aed7f`

## PR #43からの補正

- sidebarのgroup headingを削除し、8件のflat destinationだけにした。
- `Workspace`を`面談先サマリー`、`マスター管理`を`プルダウンの管理`、`AIプロバイダ設定`を`管理者ページ`へ変更した。
- 独立した`面談履歴`を削除し、`面談実績の集計`へ月次一覧を統合した。
- 集計条件、compact summary、推移、内訳、個別面談一覧を1ページにまとめた。推移と内訳はchart / numeric tableを各1 rowで対応させた。
- 個別面談一覧の右端に`確認済み`を置き、既存の`adminCheckCompleted` / `updateMeetingAdminCheck` / expected timestamp semanticsとの対応を明記した。
- 資料のsource actionは`原資料を開く`に統一した。`fileUrl`がない行にactionは作っていない。

## 維持したvisual contract

- sidebar base `#182124`、main background `#F4F7FA`、white card、cool gray border、restrained goldを維持した。
- `#E1001F`はactive menuのleft stripだけで使用する。active stateは背景・border・textでも識別する。
- local thin-line SVG icon、92px repeatのclean sayagata、compact form/list layoutを維持した。
- Knowledge Searchはvisible model selector 1件、normal-user Thinking / Geminiは非表示のままにした。

## Source contract boundary

- Meeting / Pitchbookのdataset、handler、validation、lifecycleは統合していない。
- GP / non-GPは別の既存read facadeへmappingする想定を維持し、server facadeやrelation modelを統合していない。
- 月次はexisting date rangeへ変換するpresentation designであり、新endpointや新datasetを追加していない。
- checkboxは既存admin check persistenceの表示位置変更であり、権限や保存契約を増やしていない。
- Work 0027のGemini qualified-disabled / normal-user hidden baselineと、Work 0029のshared-admin session/logout/password-change behaviorを維持した。

## Static artifactの限界

keyboard操作、focus order、contrast数値、screen reader、Apps Script runtime、provider、server mapping、save persistenceは未検証であり、PASSを主張しない。
