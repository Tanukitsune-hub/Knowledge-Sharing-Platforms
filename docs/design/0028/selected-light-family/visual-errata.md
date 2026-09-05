# Visual errata and accepted deviations

この文書は、添付されたselected Light reference、PR #41 baseline、current source contractの差を固定します。画像内の誤記や欠落をproduction仕様として扱いません。

## 添付referenceから採用しない要素

| Reference上の表現 | 採用しない理由 | Corrected reference |
|---|---|---|
| `Knowledge Share GAS` | 製品名への`GAS`追加はsource contractにない | `Knowledge Share` |
| Home、通知bell、avatar/account menu | current sourceにないnavigation/capability | 11 destinationのpersistent sidebarのみ |
| `実行方法`、`モデル`、`Thinking`の個別control | 今回の通常利用者向け決定と不一致 | `使用モデル`のselector 1個 |
| Gemini option | current fixtureはqualified-disabled / normal-user hidden | 通常利用者のselectorから除外 |
| `全文出力` toggle | 既存semanticsと今回のvisible model/profile selectionを分断する | `全文出力（AIを使わない）`を同じselectorのoptionとして表示 |
| `許可済みの選択肢のみ` checkbox | 通常利用者向けのsource controlではない | 管理者が許可した選択肢のみ表示することをhelper textで説明 |
| `0/500` | current sourceにその制限はない | 文字数表示を作らない |
| citationの架空URL/架空preview | current sourceはdocument-level link contract | `fileUrl`がある資料だけ`原資料を開く` |
| 崩れた紗綾形 | repeatable geometryではない | CC0 line geometryを92px repeatで使用 |

## PR #40 / PR #41から再導入しない事項

- MeetingとPitchbookをcombined datasetにしない。
- Analyticsを投資performance dashboardにしない。
- Relationshipをnetwork graphにしない。
- file replacement、app内preview、download専用actionを追加しない。
- normal-user画面へGeminiまたはThinkingを出さない。
- GP Workspaceのheadlineへ`有効`、`要フォロー件数`を戻さない。
- Master availability、provider readiness、record lifecycleを同じ状態語彙にしない。
- Work 0029のshared-admin session/logout/password-change behaviorを変更しない。

## CODEX-05 targeted correction round

初回refinement captureでは、通常利用者向け`使用モデル`のhelper textに内部のroute/model/Thinkingという語が残っていました。1回のtargeted correctionで、`管理者が許可した選択肢だけが表示されます。自動切替は行いません。`へ修正し、18ページを再生成・再captureしました。追加iterationは行っていません。

`過去の資料`では、`fileUrl`がある2行にだけ`原資料を開く`を表示し、新しいbrowser tabで開くcurrent semanticsを注記しました。`fileUrl`がない行にactionはありません。

## 意図した差

- main backgroundはユーザーレビューに従いcool slate `#F4F7FA`へ修正し、cardはwhite、borderはcool grayにしました。
- sidebar iconはhandcrafted SVGではなく、localに保存したLucide static SVGを同じ19px/stroke familyとして使います。外部runtime CDNは不要です。
- sayagataは同じclean geometryを維持し、PR #41の約168pxから92px repeatへ縮小しました。
- Meeting/Pitchbook/GPのfieldとsummaryは、1366×768のfirst viewを有効に使うため縦方向をcompactにしています。

## Static artifactの限界

HTML referenceはinertです。keyboard順序、focus移動、contrast実測、screen reader、custom confirmation、Apps Script runtime、provider responseは検証していません。これらは将来production実装が明示承認された後のtarget-browser/runtime qualification対象です。
