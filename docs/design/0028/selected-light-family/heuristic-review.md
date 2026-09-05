# Seven-scenario heuristic review

同じ架空データ・期間・用語・provider状態を使ったexpert walkthroughです。静的mockから時間や利用者成功率を作っていません。Click数は画面上の想定操作、decisionは値の選択や確認を指し、typingは除外します。

| # | Start → end / expected path | Clicks / decisions | Health and finding |
|---:|---|---:|---|
| 1 | Meeting登録 → 過去Meetingの絞込結果。sidebar、主要4条件、検索 | 2 + 条件4 | GOOD。destinationとprincipal fieldsがfirst viewにあり、optional条件はsummary付き |
| 2 | 過去Meeting結果 → 編集 → 保存/競合理解 | 2 + record/changed fields | GOOD。ID/更新版/面談先で照合し、sticky saveとconflict banner。custom conflict surfaceは実装後検証が必要 |
| 3 | Active row → 削除 → 確認 → retained state | 2 + destructive confirmation | GOOD。編集と別actionで、通常検索対象から外れること・data/原資料保持・復元可能を説明。styled dialogはFRONTEND_BEHAVIOR |
| 4 | 過去一覧 → 削除済みrow → 復元 | 2、filter指定時は+2 | GOOD。status未選択は全状態なので削除済みも表示可能。原資料のないFailed Pitchbookには復元を出さない |
| 5 | 任意page → Knowledge Search → 質問/条件 → 検索 | 2 + route/mode/条件 | GOOD。質問、mode、route、policy選択、主要filter、actionが線形。比較/面談準備required targetは隠さない |
| 6 | 回答 → evidence warning → citation → 原資料 | 1 | GOOD。回答、根拠不足、資料identity、原資料actionを順に読む。document-level contractを維持 |
| 7 | ChatGPT / Gemini / 全文出力を選ぶ | AI: 2 / full output: preview+output | GOOD。ChatGPTは選択可能、Geminiはcurrent baselineで非表示、全文出力はAIなしを明記。自動failoverなし |

## Cross-page review

- Navigation: 11 destinationを4 groupへ整理し、current initial Meeting registrationを維持。
- Input placement: required/primary fieldsをfirst view、long inputを全幅、secondary filtersをdetailへ。
- Density: maintenance/analytics/relationshipは比較しやすいtable、Workspaceはsummaryとdetailの段階構成。
- State clarity: record lifecycle、Master availability、provider readinessを別語彙・別surfaceで表す。
- Source traceability: answer/citation/Drive actionを1 card内で順序化。架空URLを入れない。

## Accessibility risks and limits

Active navは赤帯だけに依存せず背景/border/textも変わり、required/optionalも文字で示します。Control outlineと`focus-visible`設計値はありますが、keyboard順序、focus移動、native/custom confirmation、screen reader、contrast実測、zoomは静的captureでは判定できません。これらはproduction実装後のtarget-browser qualification項目です。
