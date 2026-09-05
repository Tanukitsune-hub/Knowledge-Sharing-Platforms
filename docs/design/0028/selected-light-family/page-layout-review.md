# Page layout review

Source SHA: `c6701d075030385ee683925c0bbaef36221134ad`。`PRESENTATION_ONLY`は既存controlの視覚的な並び替え・grouping・表示語変更、`FRONTEND_BEHAVIOR`はdisclosure、sticky action、custom confirmation等の小さなclient動作を伴う提案です。いずれもbackend contractを変えません。

## 全ページ共通

Sidebar、heading、card、field、table、status、buttonのvisual ruleは共通tokenを使います。active stateは左帯・背景・border・textの複数手掛かり、mainはwarm-white、操作controlは1px以上の輪郭で統一します。ページごとの違いは情報順序と密度だけです。

## ページ固有のdecision

| Page / source | 現行配置の観察 | 提案配置と理由 | 分類 |
|---|---|---|---|
| Knowledge Search / `KnowledgeSearchPage.html`, `ClientKnowledgeSearch.html` | route/mode/model/filter/questionが分散。modeごとに必須targetが変わる | 質問を最上段全幅、mode/route、model/thinking、主要期間/GP/sourceを順に置く。低頻度filterはsummary付き開閉。比較2–5件と面談準備targetは開閉外 | 基本はPRESENTATION_ONLY。詳細条件とactive summaryはFRONTEND_BEHAVIOR |
| 過去Meeting / `MaintenancePages.html` | 12条件と一覧。行の`GP`相当は非GPも含む | 開始/終了、面談先区分/面談先を常時表示。残りを詳細条件。列名は面談先、IDと更新版を同じcell。最大100件をaction近くに表示 | PRESENTATION_ONLY。filter disclosureはFRONTEND_BEHAVIOR |
| 過去Pitchbook / 同上 | Meetingとは別dataset。Pending/Failed/Inactiveを含む | 開始/終了、GP、状態を常時表示。原資料有無で編集/復元eligibilityを変えない。登録失敗を削除済みと混同しない | PRESENTATION_ONLY。filter disclosureはFRONTEND_BEHAVIOR |
| Meeting登録・編集 / `Index.html`, `MaintenancePages.html` | required/optionalが2列で連続し、関連selectと本文も同じ流れ | required 4項目をfirst view。日時・場所・分類を2列。Fund/Strategyと本文は全幅。関連GP/Pitchbook・follow-upを任意sectionへ。actionを下部で常時確認可能にする | groupingはPRESENTATION_ONLY。disclosure/sticky footer/custom conflict surfaceはFRONTEND_BEHAVIOR |
| Pitchbook登録・編集 / 同上 | 5分類の後にdrop zone。editは分類だけでfile差替えなし | 日付/GP、Asset/Capitalを対にし、Fundを全幅。upload constraintをdrop zone内にまとめる。editは原資料保持を別cardで明示 | groupingはPRESENTATION_ONLY。sticky footerはFRONTEND_BEHAVIOR |
| GP Workspace / `GpWorkspacePage.html` | selector、summary、fund/followup、Meeting/Pitchbook/relationship | selectorと印刷を先頭。4指標、Fund/要フォローを並列、MeetingとPitchbookは別table。relationshipは未解決/Inactiveも表示 | PRESENTATION_ONLY |
| Entity Workspace / `EntityWorkspacePage.html` | Type/Entity選択後、GPとnon-GPでcontext panelを分岐 | Type/Entityを同row。Fund drill、direct/related/owned、mix/follow-up、relationship、timelineを既存の意味順で表示。GP/non-GPを別visualで確認 | PRESENTATION_ONLY。Fund row選択の既存動作は維持 |
| 面談活動の集計 / `ActivityAnalyticsPage.html` | period/date/dimensionと7 filterが同じgrid。2 chart + tables + conditional admin check | period/dimension/dateを常時表示、残りfilterを開閉。headline→Light固定chart→同じ値のtable→drill。月次管理cardは既存条件時だけ | groupingはPRESENTATION_ONLY。filter disclosureはFRONTEND_BEHAVIOR |
| Relationship Explorer / `RelationshipExplorerPage.html` | 10 filter、forward/reverse tables、detail | 日付/面談先を常時表示、関連/分類/statusを開閉。summary→forward→reverse→selected detail。graphや推定linkは追加しない | PRESENTATION_ONLY。filter disclosureはFRONTEND_BEHAVIOR |
| Master管理 / `MaintenancePages.html`, enhancements | GP/Option addとtable、prompt/confirmでrename/reorder/status | GPとOptionを別card。操作語を`選択肢から除外/選択肢に戻す`へ。stable IDと状態を同時に見せる。記録の削除/復元と別文脈 | label/groupingはPRESENTATION_ONLY。native prompt/confirmを独自panelへ変える場合はFRONTEND_BEHAVIOR |
| AI Provider Settings / `AiProviderSettingsPage.html` | admin auth、OpenAI、Gemini、model policyが縦に連続 | locked first viewはsessionとread-only provider state。接続/同期とmodel policyは詳細へ。unlocked visualでlogout、新password/confirm、全既存controlを確認 | groupingはPRESENTATION_ONLY。disclosureはFRONTEND_BEHAVIOR。token/session/server validationは不変 |

## Landing and navigation

初期pageは現行どおりMeeting登録です。`Home`、notification、avatar、account menuは追加しません。11 destinationを`探す / 登録する / 振り返る / 設定する`へ視覚groupingしますが、handlerとpage IDは維持します。

## State surfaces

- loadingとlong-runningを分け、long-runningでは既存`結果を再確認`だけを提示;
- no results、provider error、insufficient evidenceを同じerrorに統合しない;
- answerはplain text、document-level citation、source identity、Drive linkを維持。sentence marker/snippetを追加しない;
- delete confirmationは通常検索対象から外れること、データ/原資料を保持し復元可能なことを説明;
- sourceのnative `confirm`をstyled dialogへ変える場合はFRONTEND_BEHAVIORとして別途keyboard/focus確認が必要;
- optimistic-lock conflict、partial upload failure、保存済み、emptyを`14-record-states.html`に集約。

## 1366×768 and fallback

Knowledge Searchの質問・mode・route・主要filter・実行action、Meetingのrequired 4項目とsticky action、Pitchbookのrequired分類・drop zone・sticky actionを1366×768で確認しました。Mobile fallbackは設計上の意味順を維持するだけで、今回のdesktop-first gateでは画像を追加していません。
