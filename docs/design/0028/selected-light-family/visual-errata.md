# Visual errata — A1.10 Light-only final polish

Source SHA: `960d225c388912791443cbc68efe5e5426f2a9d2`  
Baseline: Draft PR #44 / `7a82b530b51227d1cc44a8cbd2b4e4b225c57d6d`

## PR #44からの補正

- `Light navigation` overviewをreview-only artifactとして明記し、Web Appの初期画面を`ナレッジ検索`とした。
- Sidebarからstandalone `面談と資料の関連`を削除し、destinationを7件にした。
- `面談実績の集計`と`プルダウンの管理`の間に、約1 rowの余白を含むpointed gold separatorを追加した。Text group headingは追加していない。
- Brand、sidebar icon、separator、card ruleをrestrained champagne / antique metallic goldへpolishした。
- `過去の記録 / 面談`に`関連資料 n件`とresolved / Inactive / unresolved detailを追加した。
- `過去の記録 / 資料`に`関連面談 n件`とexplicit reverse lookup detailを追加した。
- Theme scopeをLight onlyとして明記し、Dark/System/theme controlを成果物から外した。

## 維持したvisual contract

- Sidebar base `#182124`、main background `#F4F7FA`、white card、cool gray borderを維持した。
- `#E1001F`はactive menuのleft stripだけで使用する。Active stateは背景・border・textでも識別する。
- Local thin-line SVG icon、92px repeatのclean sayagata、compact form/list/analytics layoutを維持した。
- Knowledge Searchはvisible model selector 1件、normal-user Thinking / Geminiは非表示のままにした。

## Source contract boundary

- Relationship truthは`Meeting_Index.Related_Pitchbook_IDs`の明示Document IDだけ。GP一致によるrelationship inferenceは行わない。
- Relation mutationはMeeting registration/editだけ。Past Recordsはread-only viewで、新endpoint、sheet、DB、relation modelを追加しない。
- Meeting / Pitchbookのdataset、handler、validation、lifecycleは統合していない。
- GP / non-GPは別の既存read facadeへmappingし、server facadeやrelation modelを統合していない。
- Work 0027のGemini qualified-disabled / normal-user hidden baselineと、Work 0029のshared-admin session/logout/password-change behaviorを維持した。

## Static artifactの限界

Keyboard操作、focus order、contrast数値、screen reader、Apps Script runtime、provider、server mapping、save persistenceは未検証であり、PASSを主張しません。
