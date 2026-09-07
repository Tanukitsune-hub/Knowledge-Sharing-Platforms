# Input layout matrix — CODEX-10 record-centric Light family

| Surface / group | Requiredness | Desktop layout | Primary action / boundary | Classification |
|---|---|---|---|---|
| Knowledge question | 自由質問のみrequired | 全幅textarea | 検索をfirst view | PRESENTATION_ONLY |
| Knowledge mode / model | mode + visible profile | 検索モード 1fr / 許可済みAI profile 2fr | visible selector 1個。normal-user Thinking/Geminiなし | MappingのみFRONTEND_BEHAVIOR |
| Knowledge filters | optional / mode条件あり | 面談先・source・dateを5列、残りdetails | 検索 / 全文出力 / 条件をクリア | DisclosureはFRONTEND_BEHAVIOR |
| 記録種別 | required | 単一selector | `MEETING` / `DATA_RECEIPT` | FRONTEND_BEHAVIOR |
| Parent-first flow | parent required before files | 3-step flow card | 親record登録 → `Meeting_ID`発行 → file registration | Future BUILD contract |
| 面談 record | Date / 面談先 / Asset required | Meeting fields + long text lower section | 関連資料は任意 | PRESENTATION_ONLY |
| 面談 related files | optional | 全幅drop + file table | 親record保存後に資料を追加 | Existing file-level retry boundary |
| データ受領 record | Date / 受領元 / Asset / background required | receipt fields + full-width memo | 面談-only fieldは表示しない | PRESENTATION_ONLY |
| データ受領 files | at least one file required | 全幅drop + file table | 親record保存後に受領資料を登録 | Existing file-level retry boundary |
| 過去の記録 filters | optional | date / record type / counterparty row + details | 記録一覧を検索 | FRONTEND_BEHAVIOR |
| 過去の記録 list | record anchors | one table for Meeting and Data Receipt | 詳細を開く / 編集 | PRESENTATION_ONLY |
| Record detail related files | explicit Document IDs | full-width detail table | 原資料を開く / 資料を追加 / 削除（紐付け解除） | Existing relationship truth |
| Standalone Pitchbook route | prohibited | no add/list/edit page | parent `Meeting_ID` first only | Future BUILD constraint |
| Reverse file → Meeting surface | prohibited | no independent relation tab/list | record detail owns related files | Future BUILD constraint |
| 面談先サマリー selector | target required | 対象区分 .72fr / 対象 1.55fr / 印刷-PDF | Selector/action同row | Facade choiceはFRONTEND_BEHAVIOR |
| Analytics primary | period/dimension | 期間単位 .75fr / 対象月 .8fr / 内訳 1fr / 集計 | 月次stateをfirst view | Month mappingはFRONTEND_BEHAVIOR |
| Monthly Meeting rows | single-month eligibility | 9-column table | `原資料を開く` / 右端`確認済み` | Existing admin-check contract |
| Admin unlock | password | 1列 | 管理者モードを開始 | Existing shared-admin behavior |
| Admin Thinking policy | admin-only | full-width text/control | プロファイルを保存 | Normal userには表示しない |

Long Japanese selector values use `min-width:0` and wider tracks. 1050px以下ではanalytics chart/tableを縦にし、760px以下ではcontrolsを意味順にstackします。Horizontal page overflowは禁止します。
