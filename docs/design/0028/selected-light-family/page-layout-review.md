# Page layout review — CODEX-10 record-centric Light family

`PRESENTATION_ONLY`は既存Light familyのlabel、grouping、order、summary表現です。`FRONTEND_BEHAVIOR`はparent-first state、details、file actions等のclient動作を伴います。Backend semanticsはdesign-onlyで変更しません。

## 全ページ共通のvisual rule

- PR #46の236px sidebar、cool Light surface、white card、cool border、local line icon、92px sayagata、compact densityを維持。
- Sidebarはgroup headingなしの7 destinations。各pageのactive sidebar destinationは1件。
- Normal taskとsystem/tool destinationsの間に、約1 rowの余白を含む細いgold separatorを1件だけ置く。
- Gold gradientはbrand、icon、separator、小さなruleへ限定し、nav label本文を装飾しすぎない。
- Selector/actionは可能な場合同row、short fieldは横並び、long textarea/file areaは全幅。
- 1050px未満は2列または1列へ緩め、760px未満はDOMの意味順でstackする。
- `#E1001F`はactive sidebar左stripだけ。Theme scopeはLight only。

## ページ固有のlayout decision

| Page / source | Layout decision | Classification |
|---|---|---|
| Start / `Index.html` | Web App初期画面を`ナレッジ検索`とする。`00-navigation.html`はreview-only | Start mappingはFRONTEND_BEHAVIOR |
| Navigation / `Index.html` | 7 destinationsをflatに表示。AnalyticsとMasterの間にgold separator | Label/groupingはPRESENTATION_ONLY |
| Knowledge Search | `面談先 / 情報ソース / 開始日 / 終了日 / 全期間`、Row 2のmode/model、wide question、独立`全文出力` | Selector/action mappingはFRONTEND_BEHAVIOR |
| 記録を追加 | Meeting-onlyの面談記録を先頭に置き、親Meeting first、任意関連資料を同じsurfaceで示す | Parent-first orderingはFuture BUILD contract |
| 面談 record | Date、counterparty、classification、notes、optional related filesを階層化 | Form groupingはPRESENTATION_ONLY |
| 過去の記録 | 一つのrecord listとrecord detail内のrelated-file table。subtabと独立資料一覧は作らない | Detail/action mappingはFRONTEND_BEHAVIOR |
| Related files | `Meeting_Index.Related_Pitchbook_IDs`のexplicit Document ID、原資料、追加、unlinkを表示 | Existing relationship truth |
| Pitchbook route | 独立add/list/edit surfaceを作らず、valid parent `Meeting_ID` firstを明示 | Future BUILD constraint |
| 面談先サマリー | `対象区分 | 対象 | 印刷 / PDF`を1 row。GP/non-GP固有contentを維持 | Facade choiceはFRONTEND_BEHAVIOR |
| 面談実績の集計 | Compact条件、summary、trend、breakdown、個別Meeting一覧、admin checkを維持 | Month mapping/check wiringはFRONTEND_BEHAVIOR |
| プルダウンの管理 | GP/Option Masterのexisting operationsをtask labelで表示 | LabelはPRESENTATION_ONLY |
| 管理者ページ | Shared-admin unlock、provider status、admin-only Thinking policyを維持 | Existing auth/provider boundary |

## Relationship and registration contract mapping

| Visible surface | Existing / future contract |
|---|---|
| Parent Meeting | Existing stable `Meeting_ID`; no additional record-type storage is introduced |
| New related file | Validate parent `Meeting_ID`, register file, then append resulting `Document_ID` to `Meeting_Index.Related_Pitchbook_IDs` |
| Related-file delete | User-facing unlink from current record; not physical delete or immediate Pitchbook destruction |
| Record detail | Meeting body/metadata plus explicit related Document IDs; follow-up uploads reuse the parent record |
| Knowledge Search | Meeting / Pitchbook source behavior and Full Output boundary remain separate |

No new Record_Index, relation table, network model, production endpoint, or runtime handler is introduced by this design package.

## 1366×768 and fallback

1366×768ではpage横overflowを0にします。Tableはpageではなく`.table-wrap`内に閉じます。760px未満ではflow, file panel, action rowを意味順にstackします。

Static referenceではkeyboard順序、focus移動、contrast比、screen-reader behavior、Apps Script renderer、save persistenceを確認しません。
