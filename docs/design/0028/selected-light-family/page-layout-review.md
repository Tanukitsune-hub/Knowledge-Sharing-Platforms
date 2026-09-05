# Page layout review — A1.7 refinement

Source SHA: `1a6966beae11e6b0d1e9744e78333ee925fce662`。`PRESENTATION_ONLY`は既存controlの並び、grouping、label、summary表現の変更です。`FRONTEND_BEHAVIOR`はselectorから既存payload tupleへのmapping、disclosure、sticky action、custom confirmation等のclient動作を伴います。いずれもbackend semanticsを変えません。

## 全ページ共通のvisual rule

- sidebar、active state、gold accent、control border、typographyはPR #41のclosed familyを維持;
- page `#F4F7FA`、card `#FFFFFF`、border `#D3DCE4`へcool slate化;
- card padding、section gap、table cellを約20–30%圧縮し、control heightは36–37px以上を維持;
- short structured fieldsだけを横並びにし、long input、multi-select、answer/citationは全幅;
- 11 destinationへ同じLucide thin-line icon familyを19pxで表示;
- sayagataは同じgeometryを168pxから92px repeatへ縮小;
- activeは非赤の背景・border・textと左端`#E1001F` stripで示す。

## ページ固有のlayout decision

| Page / source | Refined layout | Contract classification |
|---|---|---|
| Knowledge Search / `KnowledgeSearchPage.html`, `ClientKnowledgeSearch.html` | 質問を全幅。その下を`検索モード | 使用モデル`。通常利用者の`実行ルート / model profile / Thinking`を1つのvisible selectorへまとめ、current fixtureはGPT-5.6 Luna / 全文出力だけを表示。期間/GP/資料種類を次row、残りfilterをsummary付きdetails | selector表示はPRESENTATION_ONLY。既存`route + modelProfileId + admin thinkingProfileId`へresolveする処理はFRONTEND_BEHAVIORでproduction未実装 |
| 過去Meeting / `MaintenancePages.html` | date/type/entityを1 row、secondary filterをdetails、compact table。原資料actionを`原資料を開く`へ明確化 | label/groupingはPRESENTATION_ONLY。filter disclosureはFRONTEND_BEHAVIOR |
| 過去Pitchbook / 同上 | date/GP/statusを1 row。`fileUrl`があるrowだけ`原資料を開く`、ないrowは再試行案内だけ | PRESENTATION_ONLY。new-tab behaviorは既存handlerを維持 |
| Meeting登録・編集 / `Index.html`, `MaintenancePages.html` | 両方で同じ3行: `日付 | 開始時間 | 面談場所`; `面談先区分 | 面談先`; `Asset Class | Equity / Debt | Team`。Fund、participants、本文はlower section | groupingはPRESENTATION_ONLY。sticky footer/conflict surfaceはFRONTEND_BEHAVIOR |
| Pitchbook登録 / `Index.html` | classificationを4-field row + full-width Fund、drop zone、file state、sticky action。file limitsをdrop zone内に保持 | groupingはPRESENTATION_ONLY。sticky actionはFRONTEND_BEHAVIOR |
| Pitchbook分類編集 / `MaintenancePages.html` | `日付 | GP | Asset Class | Equity / Debt`を1 row、GPを2fr。Fundは全幅、保持原資料は別card | PRESENTATION_ONLY。file replacementは追加しない |
| GP Workspace / `GpWorkspacePage.html` | GP selector右へ`印刷 / PDF`。summaryは`面談 / 資料 / 最終面談日`のcompact horizontal rowだけ。Fundと具体的なfollow-up、Meeting/Pitchbook/relationship detailは下位sectionで維持 | PRESENTATION_ONLY。underlying Active/follow-up dataは削除しない |
| Entity Workspace / `EntityWorkspacePage.html` | Type/Entity、Fund drill、direct/related/owned、mix/timelineの意味順を維持。summaryやtable gapだけcompact化 | PRESENTATION_ONLY。既存Fund row selectionは維持 |
| Activity Analytics / `ActivityAnalyticsPage.html` | period/dimension/dateを1 row、secondary filterはdetails、headlineをcompact row、chart interiorはLight固定、同値tableとdrillを維持 | groupingはPRESENTATION_ONLY。filter disclosureはFRONTEND_BEHAVIOR |
| Relationship Explorer / `RelationshipExplorerPage.html` | primary filter、compact summary、forward/reverse/detail table。explicit ID関係だけを表示 | PRESENTATION_ONLY。network graphや推定linkなし |
| Master管理 / `MaintenancePages.html` | add controlsとtableをcompact化。`選択肢から除外 / 選択肢に戻す`をrecord削除と分離 | label/groupingはPRESENTATION_ONLY。custom dialogはFRONTEND_BEHAVIOR |
| AI Provider Settings / `AiProviderSettingsPage.html` | locked state、read-only provider status、admin detailsを同じfamilyで圧縮。admin側Thinking profile controlは全幅で維持 | groupingはPRESENTATION_ONLY。shared-admin/session/server validationは不変 |
| Search / record state boards | loading、long-running、empty、error、full export、delete/restore、partial failure、optimistic conflictを個別surfaceで維持 | PRESENTATION_ONLY。実際のstate transitionは未実装 |

## Knowledge selector mapping boundary

Normal-user screenはcurrent backend fieldを削除しません。将来のclient implementationでvisible valueを次へ変換します。

- GPT-5.6 Luna → `route=OPENAI`、許可されたOpenAI profile、管理者既定Thinking profile;
- Full Output → `route=FULL_EXPORT`、model/thinking fieldをpayloadへ含めない;
- Gemini → provider enabledかつmodel profile qualified/user-visibleのときだけ候補化。current Work 0027 fixtureでは非表示;
- fallback → 追加しない。選択されたrouteだけを実行。

## 1366×768 and fallback

CSS viewport 1366×768で18ページの`scrollWidth <= clientWidth`を確認しました。Meetingの3行とPitchbook分類4-field rowはdesktopで同一lineに収まり、GP summary/action、Search answer、Analytics chartがfirst viewへ前倒しされています。1050px未満は2列、760px未満はDOMの意味順を保って1列へ落とします。

Static referenceではkeyboard順序、focus移動、contrast比、screen reader、Apps Script rendererを確認していません。
