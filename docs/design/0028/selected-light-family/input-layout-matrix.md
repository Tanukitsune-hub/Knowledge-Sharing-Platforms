# Input layout matrix — A1.10 Light-only final family

| Surface / group | Requiredness | Desktop layout | Primary action / boundary | Classification |
|---|---|---|---|---|
| Knowledge question | 自由質問のみrequired | 全幅textarea | 検索をfirst view | PRESENTATION_ONLY |
| Knowledge mode / model | mode + visible profile | 検索モード 1fr / 使用モデル 2fr | visible selector 1個。normal-user Thinking/Geminiなし | MappingのみFRONTEND_BEHAVIOR |
| Knowledge filters | optional / mode条件あり | date/GP/type 4列、残りdetails | 検索 / 条件をクリア | DisclosureはFRONTEND_BEHAVIOR |
| 記録を追加 tab | — | compact 面談 / 資料 | Sidebar destinationは1件 | FRONTEND_BEHAVIOR |
| Meeting row 1 | Date required | 日付 .8fr / 開始時間 .5fr / 面談場所 1.8fr | 常時 | PRESENTATION_ONLY |
| Meeting row 2 | Type/Entity required | 面談先区分 .8fr / 面談先 1.55fr / quick add | 登録時quick addをinline | PRESENTATION_ONLY |
| Meeting row 3 | Asset required | Asset 1.25fr / Equity-Debt .8fr / Team 1.25fr | 常時 | PRESENTATION_ONLY |
| Meeting Type | optional / multi | 3 checkboxをcompact同row | 年1面談 / オフィス訪問 / 年次総会をvisible | Values/contracts preserved |
| Meeting long/detail | optional | Fund/notes/relations/follow-upは全幅またはlower section | 登録 / 変更を保存 | Disclosure/stickyはFRONTEND_BEHAVIOR |
| Pitchbook classification | Date/GP/Asset required | 日付 / GP最大 / Asset / Equity-Debt | 登録 / 変更を保存 | PRESENTATION_ONLY |
| Pitchbook file | file required on registration | 全幅drop | File limits/partial retry維持 | Existing behavior |
| 過去の記録 tab | — | compact 面談 / 資料 | Sidebar destinationは1件 | FRONTEND_BEHAVIOR |
| Meeting relationship detail | explicit ID list | 一覧の`関連資料 n件` + full-width detail table | resolved / Inactive / unresolved、source link | PRESENTATION_ONLY / existing read semantics |
| Pitchbook relationship detail | reverse explicit lookup | 一覧の`関連面談 n件` + full-width detail table | Date / counterparty / type / strategy / source | PRESENTATION_ONLY / existing read semantics |
| 面談先サマリー selector | target required | 対象区分 .72fr / 対象 1.55fr / 印刷-PDF | Selector/action同row | Facade choiceはFRONTEND_BEHAVIOR |
| Analytics primary | period/dimension | 期間単位 .75fr / 対象月 .8fr / 内訳 1fr / 集計 | 月次stateをfirst view | Month mappingはFRONTEND_BEHAVIOR |
| Analytics custom dates | Custom等でrequired | 開始日 / 終了日を対象月と置換 | Duplicate date controlsを同時表示しない | FRONTEND_BEHAVIOR |
| Analytics advanced filters | optional | 3列details | 7 existing filterのみ | DisclosureはFRONTEND_BEHAVIOR |
| Analytics chart/table | response-driven | chart 1.35fr / numeric table .8fr | 同一seriesを照合 | PRESENTATION_ONLY |
| Monthly Meeting rows | single-month eligibility | 7-column table | `原資料を開く` / 右端`確認済み` | ReorderはPRESENTATION_ONLY |
| Admin check | existing saved flag | 15px checkbox、row右端 | `adminCheckCompleted` ON/OFF | Existing update/concurrency contract |
| Admin unlock | password | 1列 | 管理者モードを開始 | Existing shared-admin behavior |
| Admin Thinking policy | admin-only | full-width text/control | プロファイルを保存 | Normal userには表示しない |

Long Japanese selector values use `min-width:0` and wider tracks. 1050px以下ではanalytics chart/tableを縦にし、760px以下ではcontrolsを意味順にstackします。Horizontal page overflowは禁止です。
