# Input layout matrix — A1.8 consolidated Light family

| Surface / group | Requiredness | Desktop layout | Primary action / boundary | Classification |
|---|---|---|---|---|
| Knowledge question | 自由質問のみrequired | 全幅textarea | 検索をfirst view | PRESENTATION_ONLY |
| Knowledge mode / model | mode + visible profile | 検索モード 1fr / 使用モデル 2fr | visible selector 1個。normal-user Thinking/Geminiなし | mappingのみFRONTEND_BEHAVIOR |
| Knowledge filters | optional / mode条件あり | date/GP/type 4列、残りdetails | 検索 / 条件をクリア | disclosureはFRONTEND_BEHAVIOR |
| 面談履歴 month | YYYY-MM required | 年月 / 表示 / mapping hint | 表示 | month→既存date rangeはFRONTEND_BEHAVIOR |
| 記録を追加 tab | — | compact 面談 / 資料 | sidebar destinationは1件 | FRONTEND_BEHAVIOR |
| Meeting row 1 | Date required | 日付 .8fr / 開始時間 .5fr / 面談場所 1.8fr | 常時 | PRESENTATION_ONLY |
| Meeting row 2 | Type/Entity required | 面談先区分 .8fr / 面談先 1.55fr / quick add | 登録時quick addをinline | PRESENTATION_ONLY |
| Meeting row 3 | Asset required | Asset 1.25fr / Equity-Debt .8fr / Team 1.25fr | 常時 | PRESENTATION_ONLY |
| Meeting Type | optional / multi | 3 checkboxをcompact同row | 年1面談 / オフィス訪問 / 年次総会をvisible | PRESENTATION_ONLY |
| Meeting Type values | unchanged | ANNUAL_REVIEW / OFFICE_VISIT / ANNUAL_GENERAL_MEETING | meetingTypeCodesへ複数値 | contract preserved |
| Meeting long/detail | optional | Fund/notes/relations/follow-upは全幅またはlower section | 登録 / 変更を保存 | disclosure/stickyはFRONTEND_BEHAVIOR |
| Pitchbook classification | Date/GP/Asset required | 日付 / GP(最大) / Asset / Equity-Debt | 登録 / 変更を保存 | PRESENTATION_ONLY |
| Pitchbook file | file required on registration | 全幅drop | file limits/partial retry維持 | existing behavior |
| 過去の記録 tab | — | compact 面談 / 資料 | sidebar destinationは1件 | FRONTEND_BEHAVIOR |
| Past Meeting filters | optional | date/type/entity 4列、残りdetails | Meeting専用検索 | disclosureのみFRONTEND_BEHAVIOR |
| Past Pitchbook filters | optional | date/GP/status 4列、残りdetails | Pitchbook専用検索 | 同上 |
| Workspace selector | target required | 対象区分 .72fr / 対象 1.55fr / 印刷-PDF | selector/action同row | facade choiceはFRONTEND_BEHAVIOR |
| GP content | selection-dependent | compact summary + section/table | existing GP read facade | PRESENTATION_ONLY |
| Entity Fund drill | optional | full-width selector + table | same Entity facade with fundStrategy | existing behavior |
| Analytics | existing payload | period/dimension/date 4列 | 集計 | disclosureのみFRONTEND_BEHAVIOR |
| Relationship | optional | date/type/entity 4列 | 読み込む | disclosureのみFRONTEND_BEHAVIOR |
| Master add | existing required fields | input + action | 追加 | PRESENTATION_ONLY |
| Admin unlock | password | 1列 | 管理者モードを開始 | existing shared-admin behavior |
| Admin Thinking policy | admin-only | full-width text/control | プロファイルを保存 | normal userには表示しない |

Long Japanese selector values use min-width:0 and wider flex tracks. Quick-add and Workspace action wrap below controls at narrow width without changingDOMの意味順序を変えません。Horizontal page overflowは禁止です。
