# Page layout review — A1.8 navigation / Workspace consolidation

Source SHA: c5aa1c189c1e915a44f676ac1a8358a5f189e4bb。

PRESENTATION_ONLYは既存controlのlabel、grouping、order、summary表現です。FRONTEND_BEHAVIORはinternal tab、年月→date range、対象区分→既存read facade選択、disclosure等のclient動作を伴います。Backend semanticsは変えません。

## 全ページ共通のvisual rule

- PR #42のsidebar、cool Light surface、white card、gold accent、cool border、line icon、92px sayagata、compact densityを維持。
- sidebarを9 destinationへ整理し、各pageのactive destinationを1件にする。
- internal 面談 / 資料、Workspace対象切替はmain content側に置き、sidebar destinationを増やさない。
- selector/actionは同row、short fieldは横並び、long textarea/multi-selectは全幅。
- 1050px未満は2列へ緩め、760px未満はDOMの意味順で1列/wrapへ落とす。
- #E1001Fはactive sidebar左stripだけ。internal tab activeにはgoldとborderを使う。

## ページ固有のlayout decision

| Page / source | Layout decision | Classification |
|---|---|---|
| Navigation / Index.html | Meeting/Pitchbook registration、past maintenance、GP/Entity Workspaceをmain側の3 destinationへまとめる。Analytics、relationship、settingsは維持 | navigation groupingはFRONTEND_BEHAVIOR。handler/payloadは不変 |
| Knowledge Search / KnowledgeSearchPage.html | PR #42の1 visible model selector、Thinking/Gemini hidden、filter disclosure、answer/citationを維持 | selector mappingは将来FRONTEND_BEHAVIOR |
| 面談履歴 / MaintenancePages.html, ActivityAnalyticsPage.html | YYYY-MM 1件と表示を同row。下にindividual Meeting table。Analyticsのchart/KPIは持ち込まない | month→dateFrom/dateToまたはmonthly+drillはFRONTEND_BEHAVIOR。新endpointなし |
| 記録を追加 / Index.html | internal 面談 / 資料 tab。両formは別DOM/handler/draft/payloadのまま | tab切替だけFRONTEND_BEHAVIOR |
| Meeting register/edit / Index.html, MaintenancePages.html | 3-row proportional layout。登録時は面談先selector右にquick add。3 Meeting Type checkboxはdetails外でvisible | grouping/labelはPRESENTATION_ONLY。checkbox values不変 |
| Pitchbook registration | PR #42の4-field classification、full-width Fund、file drop、partial retryを維持 | groupingはPRESENTATION_ONLY |
| 過去の記録 / MaintenancePages.html, ClientMaintenance.html | internal 面談 / 資料 tab。filter/table/status/actionsを別surfaceに維持 | tab切替はFRONTEND_BEHAVIOR。search/update/status handlerは不変 |
| Pitchbook source action | fileUrlがあるrowだけ原資料を開く。productionはexisting new-tab behavior | labelはPRESENTATION_ONLY |
| Workspace / GpWorkspacePage.html, EntityWorkspacePage.html | 対象区分 | 対象 | 印刷 / PDFを1 row。選択によりGP/非GP contentを切替 | selector→existing facade routingはFRONTEND_BEHAVIOR |
| GP selected | summaryは面談 / 資料 / 最終面談日のみ。Fund、具体follow-up、Meeting、Pitchbook、explicit relationshipを維持 | PRESENTATION_ONLY |
| non-GP selected | Fund aggregation/drill、direct/related、related GP、linked Pitchbook、Meeting、Mixes/Follow-ups、unresolved/Inactive relation、timelineを維持 | PRESENTATION_ONLY |
| Activity Analytics / ActivityAnalyticsPage.html | 件数推移・内訳・分析として別destinationを維持 | 既存payload/read facade不変 |
| Relationship Explorer | explicit Document ID relationのtableを維持。network graphなし | PRESENTATION_ONLY |
| Master / Provider settings | PR #42 compact layout、selection availability、shared-admin、admin Thinking controlを維持 | behavior不変 |

## Existing facade separation

| Visible target | Existing public facade | Existing read model / semantics |
|---|---|---|
| GP | getGpWorkspaceData(gpId) | GP direct scope互換。Entity serviceを内部利用していてもpublic facadeは独立 |
| 非GP Entity | getEntityWorkspaceData({entityKey, fundStrategy?}) | Counterparty Type / Entity catalog、direct/related、explicit relation、Fund drill |
| 面談履歴 | searchMeetingRecords({dateFrom,dateTo,...}) または getMeetingActivityAnalytics({period:'monthly',dateFrom,dateTo,...}).drill | Meeting_Indexのindividual Meeting。新datasetなし |

Facade、dataset、relation model、backend classificationは統合しません。

## 1366×768 and fallback

1366×768ではsidebar + mainのpage横overflowを0にし、sidebarが9 destinationを保持しつつfirst useful contentを前倒しします。Tableはpageではなく.table-wrap内に閉じます。760px未満ではtabs、counterparty quick-add row、Workspace selector row、month selector rowを意味順にstackします。

Static referenceではkeyboard順序、focus移動、contrast比、screen reader、Apps Script rendererを確認しません。
