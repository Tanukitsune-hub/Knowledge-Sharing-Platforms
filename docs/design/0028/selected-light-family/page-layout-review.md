# Page layout review — A1.9 final Light correction

Source SHA: `02cc825fce3ed7debdeaaefe6ff5dd97f926e9f1`.

`PRESENTATION_ONLY`は既存controlのlabel、grouping、order、summary表現です。`FRONTEND_BEHAVIOR`はinternal tab、月→date range、対象区分→既存read facade、disclosure、row check update wiring等のclient動作を伴います。Backend semanticsは変えません。

## 全ページ共通のvisual rule

- PR #43の236px sidebar、cool Light surface、white card、gold accent、cool border、local line icon、92px sayagata、compact densityを維持。
- Sidebarはgroup headingなしの8 destination。各pageのactive destinationは1件。
- Selector/actionは可能な場合同row、short fieldは横並び、long textarea/multi-selectは全幅。
- 1050px未満は2列または1列へ緩め、760px未満はDOMの意味順でstackする。
- `#E1001F`はactive sidebar左stripだけ。Internal tab activeとcheckboxにはgold/borderを使う。

## ページ固有のlayout decision

| Page / source | Layout decision | Classification |
|---|---|---|
| Navigation / `Index.html` | 8 destinationをflatに表示。`記録を追加`と`過去の記録`の面談/資料は画面内tab | Label/groupingはPRESENTATION_ONLY。page switchingはFRONTEND_BEHAVIOR |
| Knowledge Search | PR #43の1 visible model selector、Thinking/Gemini hidden、filter disclosure、answer/citationを維持 | Selector mappingのみFRONTEND_BEHAVIOR |
| 記録を追加 | 面談/資料tab、3-row Meeting form、inline quick add、3 Meeting Type checkbox、compact Pitchbook分類を維持 | GroupingはPRESENTATION_ONLY。tabはFRONTEND_BEHAVIOR |
| 過去の記録 | 面談/資料のfilter/table/status/actionを別surfaceに維持 | TabのみFRONTEND_BEHAVIOR。Dataset/handler不変 |
| 面談先サマリー | `対象区分 | 対象 | 印刷 / PDF`を1 row。GP/non-GP固有contentを維持 | LabelはPRESENTATION_ONLY。existing facade choiceはFRONTEND_BEHAVIOR |
| 面談実績の集計 / `ActivityAnalyticsPage.html` | Compact条件card、3-item summary、trend chart/table、breakdown chart/table、個別Meeting一覧を同一pageへ配置 | ReorderはPRESENTATION_ONLY。month mapping/disclosure/check wiringはFRONTEND_BEHAVIOR |
| 集計条件 | 月次stateでは`期間単位 | 対象月 | 内訳 | 集計`。他期間では開始日/終了日へ切替。7 filterはdetails | Existing payload fieldsを維持 |
| Analytics summary | `面談 / 面談先 / 要フォロー`のみheadline。Activeはunderlying dataとして維持 | PRESENTATION_ONLY |
| Trend / breakdown | Chartと同じ数値tableを1 rowで比較 | PRESENTATION_ONLY / same existing response data |
| 個別面談 | User-friendly 6列 + 右端`確認済み`。Meeting IDは日付下へ補助表示 | Drill reorderはPRESENTATION_ONLY。check updateはexisting contract |
| Relationship | Explicit Document ID relation tableを維持。Network graphなし | PRESENTATION_ONLY |
| プルダウンの管理 | GP/Option Masterのexisting operationsをtask labelで表示 | LabelだけPRESENTATION_ONLY |
| 管理者ページ | Shared-admin unlock、provider status、admin-only Thinking policyを維持 | LabelだけPRESENTATION_ONLY |

## Existing contract mapping

| Visible surface | Existing contract |
|---|---|
| GP summary | `getGpWorkspaceData(gpId)` |
| non-GP summary | `getEntityWorkspaceData({entityKey, fundStrategy?})` |
| Merged analytics | `getMeetingActivityAnalytics({period,dateFrom,dateTo,dimension,filters})` |
| Month selector | `YYYY-MM`を当月1日/末日のexisting `dateFrom/dateTo`へ変換 |
| Confirmation checkbox | `adminCheckCompleted` + `adminCheckUpdatedAt`をexpected stateとして`updateMeetingAdminCheck`へ送る |

Facade、dataset、relation model、backend classificationは統合しません。`adminCheckAvailable`の既存single-month eligibilityと権限条件をproduction実装時に維持します。

## 1366×768 and fallback

1366×768ではpage横overflowを0にし、conditions/summary/trendの先頭をfirst viewへ置きます。Tableはpageではなく`.table-wrap`内に閉じます。760px未満ではtabs、quick-add、summary selector、analytics controls/chart-table pairを意味順にstackします。

Static referenceではkeyboard順序、focus移動、contrast比、screen reader、Apps Script renderer、save persistenceを確認しません。
