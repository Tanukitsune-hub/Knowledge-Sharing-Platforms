# Page layout review — A1.10 Light-only final polish

Source SHA: `960d225c388912791443cbc68efe5e5426f2a9d2`.

`PRESENTATION_ONLY`は既存controlのlabel、grouping、order、summary表現です。`FRONTEND_BEHAVIOR`はinternal tab、月→date range、対象区分→既存read facade、disclosure、row check update wiring等のclient動作を伴います。Backend semanticsは変えません。

## 全ページ共通のvisual rule

- PR #44の236px sidebar、cool Light surface、white card、cool border、local line icon、92px sayagata、compact densityを維持。
- Sidebarはgroup headingなしの7 destinations。各pageのactive destinationは1件。
- Normal taskとsystem/tool destinationsの間に、約1 rowの余白を含む細いgold separatorを1件だけ置く。
- Gold gradientはbrand、icon、separator、小さなruleへ限定し、nav label本文を装飾しすぎない。
- Selector/actionは可能な場合同row、short fieldは横並び、long textarea/multi-selectは全幅。
- 1050px未満は2列または1列へ緩め、760px未満はDOMの意味順でstackする。
- `#E1001F`はactive sidebar左stripだけ。Internal tab activeとcheckboxにはgold/borderを使う。
- Theme scopeはLight only。Dark/System selector・保存・media queryは追加しない。

## ページ固有のlayout decision

| Page / source | Layout decision | Classification |
|---|---|---|
| Start / `Index.html` | Web App初期画面を`ナレッジ検索`とする。`00-navigation.html`はreview-only | Start mappingはFRONTEND_BEHAVIOR。review artifactはproduct surface外 |
| Navigation / `Index.html` | 7 destinationsをflatに表示。AnalyticsとMasterの間にgold separator | Label/groupingはPRESENTATION_ONLY。page switchingはFRONTEND_BEHAVIOR |
| Knowledge Search | 1 visible model selector、Thinking/Gemini hidden、filter disclosure、answer/citationを維持 | Selector mappingのみFRONTEND_BEHAVIOR |
| 記録を追加 | 面談/資料tab、3-row Meeting form、inline quick add、3 Meeting Type checkbox、compact Pitchbook分類を維持 | GroupingはPRESENTATION_ONLY。tabはFRONTEND_BEHAVIOR |
| 過去の記録 / 面談 | Meeting filter/tableの`関連資料 n件`から、explicit Document IDのresolved / Inactive / unresolved detailを表示 | Read-only detailはPRESENTATION_ONLY。reverse resolveはexisting read contract |
| 過去の記録 / 資料 | Pitchbook filter/tableの`関連面談 n件`から、そのDocument IDを明示参照するMeeting detailを表示 | Read-only detailはPRESENTATION_ONLY。GP一致推定なし |
| Relationship mutation | 関係の追加・削除はMeeting registration/editにだけ残す | Existing `meetingTypeCodes`等と同様にcontract不変 |
| 面談先サマリー | `対象区分 | 対象 | 印刷 / PDF`を1 row。GP/non-GP固有contentを維持 | LabelはPRESENTATION_ONLY。existing facade choiceはFRONTEND_BEHAVIOR |
| 面談実績の集計 | Compact条件、3-item summary、trend chart/table、breakdown chart/table、個別Meeting一覧を維持 | ReorderはPRESENTATION_ONLY。month mapping/disclosure/check wiringはFRONTEND_BEHAVIOR |
| 個別面談 | User-friendly 6列 + 右端`確認済み`。Meeting IDは日付下へ補助表示 | Drill reorderはPRESENTATION_ONLY。check updateはexisting contract |
| プルダウンの管理 | GP/Option Masterのexisting operationsをtask labelで表示 | LabelだけPRESENTATION_ONLY |
| 管理者ページ | Shared-admin unlock、provider status、admin-only Thinking policyを維持 | LabelだけPRESENTATION_ONLY |

## Existing contract mapping

| Visible surface | Existing contract |
|---|---|
| Meeting → related documents | `Meeting_Index.Related_Pitchbook_IDs`のDocument IDをresolve。Inactive/unresolvedも保持 |
| Document → related Meetings | 各Meetingの同列に当該Document IDを含むものだけをreverse lookup |
| Relation edit | Meeting registration/editの既存payload/handler。Past Recordsはread-only |
| GP summary | `getGpWorkspaceData(gpId)` |
| non-GP summary | `getEntityWorkspaceData({entityKey, fundStrategy?})` |
| Merged analytics | `getMeetingActivityAnalytics({period,dateFrom,dateTo,dimension,filters})` |
| Month selector | `YYYY-MM`を当月1日/末日のexisting `dateFrom/dateTo`へ変換 |
| Confirmation checkbox | `adminCheckCompleted` + `adminCheckUpdatedAt`をexpected stateとして`updateMeetingAdminCheck`へ送る |

Facade、dataset、relation model、backend classificationは統合しません。`adminCheckAvailable`の既存single-month eligibilityと権限条件をproduction実装時に維持します。

## 1366×768 and fallback

1366×768ではpage横overflowを0にします。Tableはpageではなく`.table-wrap`内に閉じます。760px未満ではtabs、quick-add、summary selector、analytics controls/chart-table pairを意味順にstackします。

Static referenceではkeyboard順序、focus移動、contrast比、screen reader、Apps Script renderer、save persistenceを確認しません。
