# Seven-scenario heuristic review

同じsynthetic data、期間、用語、provider状態を使ったexpert walkthroughです。静的mockから操作時間や利用者成功率を作っていません。Click数は画面上の想定操作、decisionは値の選択や確認を指し、typingは除外します。

| # | Start → end / expected path | Clicks / decisions | Health and finding |
|---:|---|---:|---|
| 1 | 面談を登録 → 過去Meetingの絞込結果。sidebar、主要4条件、検索 | 2 + 条件4 | GOOD。登録の3行field group、主要action、一覧filterがfirst viewにあり、optional条件はsummary付きdisclosure |
| 2 | 過去Meeting結果 → 編集 → 保存/競合理解 | 2 + record/changed fields | GOOD。登録と編集で同じ3行layout。ID/更新版/面談先で照合し、競合時は再読込を促す。runtimeの競合処理は未検証 |
| 3 | Active row → 削除 → 確認 → retained state | 2 + destructive confirmation | GOOD。編集と別actionで、通常検索対象から外れること、data/原資料保持、復元可能を説明。styled dialogは`FRONTEND_BEHAVIOR` |
| 4 | 過去一覧 → 削除済みrow → 復元 | 2、filter指定時は+2 | GOOD。status未選択は全状態なので削除済みも表示可能。原資料のないFailed Pitchbookには復元を出さない |
| 5 | 任意page → Knowledge Search → 質問/条件 → 検索 | 2 + mode/model/条件 | GOOD。質問、検索mode、`使用モデル` 1 selector、主要filter、actionを線形化。通常利用者のThinkingは非表示 |
| 6 | 回答 → evidence warning → citation → 原資料 | 1 | GOOD。回答、根拠不足、資料identity、`原資料を開く`を順に読む。document-level citation contractを維持 |
| 7 | GPT-5.6 Luna / 全文出力を選ぶ | 1 | GOOD。通常利用者は1 selectorから明示選択。Geminiはcurrent fixtureで非表示、全文出力はAIを使わないと明記。自動failoverなし。Thinkingはadmin policyに維持 |

## Cross-page review

- Navigation: 11 destinationを4 groupへ整理し、19px thin-line local SVG iconを同じoptical sizeで配置しました。active destinationは各ページ1個です。
- Input placement: required/primary fieldsをfirst view、short fieldsを意味のあるrowへ、long inputを全幅、secondary filtersをdetailsへ配置しました。
- Density: maintenance/analytics/relationshipは比較しやすいtable、Workspaceはcompact summaryとdetailの順です。すべてを高密度にはしていません。
- Surface: mainはcool slate、cardはwhite、control/borderはcool grayです。goldはsection/icon/textの控えめなaccentです。
- State clarity: record lifecycle、Master availability、provider readinessを別語彙・別surfaceで表します。
- Source traceability: answer/citation/source actionを1 card内で順序化し、架空URLを入れていません。

## Accessibility risks and limits

Active navは赤帯だけに依存せず背景/border/textも変わり、required/optionalも文字で示します。Control outlineと`focus-visible`設計値はありますが、keyboard順序、focus移動、native/custom confirmation、screen reader、contrast実測、zoomは静的captureでは判定できません。これらはproduction実装後のtarget-browser qualification項目です。
