# 現行source・機能・表示用語

Source SHA: `c1db45e4e30986fc0cd0df2fcfed3445817a71cd`。以下の位置はこのSHAの`src/`相対です。コード観察でありlive表示の確認ではありません。

正式instruction、root AGENTS、docs/handoffs/AGENTS、src/AGENTS、Work Registry、0028 brief/dispatch/decision/plan、product vision、0027/0029 completion registers、work-control/dispatch-control/runtime-first decisionを参照しました。古いA0制限と古いsrcのWork 0013限定記載は今回の明示的な設計専用指示を拡張しません。

## Surfaceと契約

| 現行page・表示／DOM・handler | request → response / 状態と維持事項 | 提案する整理・source |
|---|---|---|
| shell、11 nav buttons / `pages`, `showPage` | 初期activeはmeeting。`showPage`はpage/activeを切替。起動APIを勝手にlazy化しない | 探す／登録する／振り返る／設定する。`Index.html:13`、`ClientCore.html:13`。初期画面は登録を維持 |
| 面談記録 / `meeting-form`, `meetingValues` | `registerMeeting`へ日付・区分・Entity・asset必須、時間・場所・capital・team・fund・type・relatedGP/Pitchbook・followup・人物・当社側・本文。成功でid/documentUrl、途中失敗retry identity | 必須と任意を分離。本文を必須にしない。`Index.html:31`以降、登録handler102。IDとGoogle Doc正本、入力保持を維持 |
| Pitchbook / `pitchbook-form`, drop zone | prepare/uploadの既存分離、file単位結果・失敗分retry。PDF/PPTX/XLSX/DOCX/TXT/EML、25MB×最大10・合計100MB | 資料を登録。ファイル差替えなし。`Index.html:58`、`ClientPitchbookFiles.html`、`ClientPitchbookFlow.html` |
| 過去面談 / `meeting-past-search`, `searchMeetings` | `searchMeetingRecords(maintenanceSearchPayload)` → records。任意の12種条件、最大100新しい順 | 面談先列は非GPにも対応。`MaintenancePages.html:1`、`ClientMaintenance.html:23` |
| 面談編集 / `openMeetingEdit`, `meeting-edit-form` | `getMeetingMaintenanceRecord(id)` → record、`updateMeetingMaintenance`へexpectedVersionと同一ID＋編集値 | 最新版を読んで保存。Activeのみ編集可能。既存Inactive関連は保持。`ClientMaintenance.html:25`、`110_MaintenanceMeetingService.gs:157` |
| 面談lifecycle / `data-meeting-status` | `changeMeetingStatus({meetingId,expectedVersion,targetStatus})` →再検索。native confirmあり | 削除/復元に表示変更。内部Active/Inactiveのまま。`ClientMaintenance.html:30`、`110_MaintenanceMeetingService.gs:202` |
| 過去資料 / `searchPitchbooks` | `searchPitchbookRecords` → records。date/GP/asset/capital/fund/status、最大100。Pending/Failedも既存選択肢 | GP所有資料という意味を維持。`MaintenancePages.html:60`付近、`ClientMaintenance.html:35` |
| 資料編集・lifecycle / `openPitchbookEdit`, `data-pitchbook-status` | `getPitchbookMaintenanceRecord`、`updatePitchbookMaintenance`、`changePitchbookStatus`。expectedUpdatedAt。原本ありのみ編集、Inactive＋fileIdのみ復元ボタン。Activeは削除可能 | 分類情報の編集。命名context変更時の次番号、file identity保持。`ClientMaintenance.html:36`〜41、`111_MaintenancePitchbookMasterService.gs` |
| Master / `renderMasters`, `masterClickHandler` | `mutateMaster`: ADD/RENAME/REORDER/DEACTIVATE/REACTIVATE、GP/OPTION、固定ID。`quickAddGp`と登録画面のquick-addあり | 選択肢除外/戻す。記録削除と区別。`MaintenancePages.html`末尾、`ClientMaintenance.html:43`〜48、Enhancements |
| GP Workspace / selector `gp-workspace-gpId` | `getGpWorkspaceData(gpId)` → summary/funds/followups/meetings/pitchbooks/relationships。選択変更で読込、requestSequenceで古い応答抑止、印刷 | 読み取り専用・原本link・省略件数。`GpWorkspacePage.html`、`ClientGpWorkspace.html:18,46` |
| Entity Workspace / `nav-entity-workspace` override | 初回`getEntityWorkspaceData({})`でcatalog、entityKey/fundStrategyで詳細。GP direct/related/ownedと非GP明示linkを別表示。print | GP Workspaceと統合削除しない。`EntityWorkspacePage.html`、`ClientEntityWorkspace.html:81,104,125` |
| Activity Analytics / `activity-analytics-refresh`, nav override | `getMeetingActivityAnalytics(activityPayload)`。period/date/dimension/filter、集計後条件変更で再読込。summary/series/breakdown/drill/adminChecks | 面談活動の集計。面談metadataのみ、Pitchbook/投資収益なし。`ActivityAnalyticsPage.html`、`ClientActivityAnalytics.html:14`〜25 |
| 月次管理反映済み / conditional admin card | `updateMeetingAdminCheck`、expected flag/time。返却adminChecksがある時だけ表示 | AI設定のパスワード認証と同一権限と推定しない。`ClientActivityAnalytics.html:24` |
| Relationship Explorer / `relationship-forward/reverse-results` | `getRelationshipExplorerData` → summary/forward/reverse/omitted。詳細は返却データから表示。明示Document_IDのみ | 面談と資料の関連。未解決/Inactive保持。`RelationshipExplorerPage.html`、`ClientRelationshipExplorer.html:22`〜29 |
| 関係詳細の「既存の面談保守で開く」 | 現行handlerは`showPage('meeting-past')`だけ。対象recordを開かない | 「面談一覧へ」。新たな深いリンクを発明しない。`ClientRelationshipExplorer.html:29` |
| ナレッジ検索 / `knowledge-form`, `kPayload` | `searchKnowledge`へroute/mode/questionOrInstruction/filters/selectedEntityKeys/modelProfileId/thinkingProfileId。即時結果またはpending/token、POLL | 質問を上へ。実行方法は明示、条件summary。`KnowledgeSearchPage.html`、`ClientKnowledgeSearch.html` |
| モード / `kApplyMode` | 自由質問は質問必須、要約/時系列追加指示任意、比較Entity2〜5、面談準備EntityまたはGP1件 | 必須対象をdisclosureに隠さない。既存日本語mode値を保持 |
| モデル・Thinking / `kApplyModelPolicy`, `kApplyThinkingChoices` | bootstrapのmodelPoliciesだけを表示。serverはprovider enabled、visible、qualified、access/File Search、thinking tuple等を検証 | 自由入力・未承認モデルを追加しない。`134_AiModelPolicyContracts.gs:275`〜368 |
| route / `kApplyRouteSurface` | GEMINI profilesがなければoption除去。FULL_EXPORTはmodel controlsとAI回答を隠す。route変更時既存pending処理維持 | current Gemini非表示。仮定のenabled説明は別fixture。設定済み≠有効≠適格性確認済み |
| 回答 / `kRenderResult`, `kRenderCitations` | plain text、effectiveSelection/scope、insufficientEvidence、entityEvidence、citationsのtitle/type/id/entity/date/任意page/driveUrl | 文単位cite、snippet、highlightを発明しない。URLなければ無効なlink。根拠不足と原資料への到達を別に示す |
| pending / `kStartKnowledgeQuery`, `kPollKnowledgeQuery` | poll上限12、delay1〜30秒、60秒以降等long表示、sessionStorageにpending state、結果を再確認 | queryの再実行やcancelを追加しない。POLL失敗を直ちに検索失敗と扱わない。token値は画像へ出さない |
| 全文出力 / `kPreviewExport`, `kCreateExport` | `previewKnowledgeExport`で対象確認、packageFingerprintを`createKnowledgeExport`へ。copyはpackageText。promptは`getKnowledgeExportPrompt`、copy確認監査 | Meeting Google Docs本文＋Pitchbook参照だけ。noResults/hardStopでCopy/Docs/PDF不可。prompt copyは同じ禁止条件ではない |
| 管理者 / `manageSharedAdminSession`, `logoutSharedAdminSession` | `manageAiProviderAdminSession`: BOOTSTRAP/UNLOCK/CHANGE_PASSWORD。opaque token sessionStorage、server再検証。logoutはlocal token除去→再読込 | 0029保持。email gate/時間切れ/テーマ連動認証なし。`AiProviderSettingsPage.html:8`、`ClientAiProviderSettings.html:16`〜20 |
| AI設定 / `loadAiProviderAdminData`, mutation handlers | `getAiProviderAdminData` read-only状態、`mutateAiProviderSettings`はadminSessionTokenで保護。接続・有効/停止・同期・policy・qualificationあり | provider statusは記録lifecycleと別。管理者説明のみで実行しない。`ClientAiProviderSettings.html:9,17,22`〜末尾 |

## includeとoverrideの確認

`Index.html:75`〜90でpage fragments/ClientCore/GP/Entity/Knowledge/Adminをinclude、105〜111でPitchbook files/flow、Maintenance、**MaintenanceEnhancements**、Analytics、Relationship、Bootstrapをinclude。Enhancementsが`bootstrapMaintenance`と`performMasterMutation`を後から置換し、master更新後にGP Workspace・maintenance・登録選択肢を更新します。古い関数定義だけを設計根拠にしていません。

Entity/Analytics/Relationship/Adminは各nav onclickで必要なloadを追加します。ナビの見た目を変える際も上書きを失わないこと。Coreのdraftはguarded localStorage＋24時間、queryとadminは別のsessionStorageです。bootstrap fragmentsには実際の`google.script.run`があるため、この調査では一切ロード・実行していません。

Stylesの現行はmax-width1120、pill nav、2列form/3列filter、固定色、720px breakpoint、横scroll table、SVG棒グラフとprint局所ルール。新案は情報配置案であり、現在すでにsidebarがあるという主張ではありません。

## 条件の正確な意味

**maintenanceの初期Status未選択は全状態**です。`100_MaintenanceCore.gs:52,157`は空statusを制限せず、`ClientMaintenance.html::maintenanceSearchPayload`は選択値を渡します。モックの表示中はユーザーがActiveを明示選択した比較状態であり、新defaultではありません。初期値は空のまま、表示だけ「すべて」にできます。全状態一覧では削除後も行が削除済みとして残り得ます。「通常一覧から必ず消える」という無条件の説明をしません。

Knowledge SearchのfilterはdateFrom/dateTo、counterpartyType、entityKey、gpId、assetClassId、capitalTypeId、teamId、fundStrategy、followUp、relatedGpId、meetingTypeCode、sourceType。比較はselectedEntityKeys。Team/要フォロー/関連GP/Meeting Typeの指定時はMeetingへsourceTypeが変わる既存処理を明示します。sourceType空はMeetingとPitchbookの両方です。

全文出力limitsは`155_KnowledgeExportContracts.gs:20`以降：warning 30 Meeting / 150,000字、hard stop 50 Meeting / 250,000字 / 200 Pitchbook、preview 20秒、source ID報告最大40。判定は既存コードが正本で、画像では上限判定の成功を主張しません。対象なしと上限超過を同一のAIエラーにしません。条件変更でpreviewを無効化、stale fingerprintでは再確認します。

## 現在表示 → 推奨表示 → 維持値

以下は今回採る表示辞書です。画像生成の誤記はこの辞書の変更ではありません。sourceの関数名は同SHAで一意に検索できます。Master名・モデルprofile表示名など動的データは翻訳しません。

| source位置 | 現在の実表示 | 推奨表示 | 維持する内部値／管理者表示 | 理由 |
|---|---|---|---|---|
| Index nav | 面談記録 | 面談を登録 | meeting / nav-meeting | 一覧と区別 |
| Index nav | Pitchbook | 資料を登録 | pitchbook | 登録行為を明示 |
| Index nav | 過去面談 / 過去資料 | 過去の面談記録 / 過去の資料 | meeting-past / pitchbook-past | 対象明確化 |
| Index nav | GP Workspace / Entity Workspace | GP Workspace / Entity Workspace（説明にGP別／面談先別） | 両destination | 今回の画像と統一。重複とみなして削らない |
| Index nav | Activity Analytics | 面談活動の集計 | activity-analytics | 投資成績と誤解しない |
| Index nav | Relationship Explorer | 面談と資料の関連 | relationship-explorer | 明示関連のみ |
| Index nav | AIプロバイダ設定 | AIプロバイダ設定 | ai-provider-settings | 管理者領域を明確に維持 |
| MaintenancePages/list renderer | GP（面談列） | 面談先 | counterpartyEntityName等 | 非GP面談対応 |
| MaintenancePages/Pitchbook | GP | GP | gpId | 資料所有者を変えない |
| ClientMaintenance/change status | 無効化 | 削除 | targetStatus=Inactive | 非表示化の記録操作 |
| 同上 | 再有効化 | 復元 | targetStatus=Active | eligibilityはそのまま |
| 同上 badge/option | Active / Inactive | 表示中 / 削除済み | Active / Inactive | option value明示が必須 |
| MaintenancePages/status option | 未選択 | すべて | 空文字 | 全状態という実際の検索動作 |
| 同上 | Status | 表示対象（filter）／状態（row） | status | 操作と結果を区別 |
| ClientMaintenance/version | Version | 更新版（詳細） | expectedVersion / version | locking値を削らない |
| ClientMaintenance/pitchbook | Pending / Failed | 登録処理中 / 登録失敗 | Pending / Failed | provider準備状態と区別 |
| 同上 | 登録画面で再試行 | 登録画面で再試行 | 原本なしの既存扱い | 復元/差替えと誤認防止 |
| ClientMaintenance/masterClickHandler | 無効化 / 再有効化 | 選択肢から除外 / 選択肢に戻す | DEACTIVATE / REACTIVATE | historical recordは保持 |
| ClientCore/addOptions、edit preserved options | （Inactive）/（Inactive・現在値） | （選択肢から除外済み）/（除外済み・現在値） | MasterのInactive | 記録の削除済みと区別 |
| ClientMaintenance/relatedPitchbooks | （Inactive・既存リンク） | （削除済み・既存リンク） | 選択済みID保持 | 関連を消さない |
| Maintenance/GP/Entity/source links | Doc / 開く / 原本 | 原資料を開く | 既存URL/ID/安全性判定 | 遷移先明確化 |
| MaintenancePages | 面談記録を修正 | 面談記録を編集 | updateMeetingMaintenance | 日常語に統一 |
| MaintenancePages | 資料Metadataを修正 | 資料の分類情報を編集 | updatePitchbookMaintenance | 本文差替えではない |
| 各filter | Date From / Date To | 開始日 / 終了日（期間） | dateFrom/dateTo | 日本語統一 |
| 各page | Asset Class | 資産クラス | assetClassId、Master値 | 分類値は翻訳しない |
| 各page | Equity / Debt | Equity / Debt | capitalTypeId | 業務語維持 |
| 各page | Team / Fund / Strategy / Meeting Type | 担当チーム / ファンド／戦略 / 面談種別 | teamId/fundStrategy/meetingTypeCode | 表示のみ |
| Knowledge/Entity/Analytics/Relationship | Counterparty Type / Counterparty Entity / Related GP | 面談先区分 / 面談先 / 関連GP | 型/ID/entityKey | 登録画面と揃える |
| KnowledgeSearchPage | Source Type / Meeting / Pitchbook | 資料の種類 / 面談 / 資料 | 空/Meeting/Pitchbook | 空は両方 |
| KnowledgeSearchPage | 実行ルート | 実行方法 | OPENAI/GEMINI/FULL_EXPORT | 利用者が明示選択 |
| 同上 | ChatGPT / Gemini / 全文出力 | ChatGPT / Gemini / 全文出力（AIを使わない） | route値・visibility | 外見だけで統合しない |
| 同上 | 検索モード、5 option | 同じ表示 | 自由質問/要約/時系列/比較/面談準備 | モード契約固定 |
| 同上 | 比較Entity（2–5件） | 比較対象（2–5件） | selectedEntityKeys | 数と型を維持 |
| 同上 | モデル / Thinking | モデル / Thinking（許可済みの選択肢のみ） | profile IDs、実displayName/label | 品質や速度を約束しない |
| 134_AiModelPolicyContracts:188 | プロバイダ標準 | プロバイダ既定（説明案） | provider-default | 固定モデル名称にしない |
| ClientKnowledgeSearch/kRenderCitations | authoritative citation / 原資料Citation | 確認できる出典 / 原資料の出典 | authoritative resolver、citation fields | 文単位保証を作らない |
| 同上/entity evidence | このEntityのauthoritative citationはありません。 | この面談先の原資料の出典はありません。 | entityEvidence | Entityごとに不足明示 |
| 同上/no citations | 参照可能な原資料Citationはありません。 | 参照可能な原資料がありません。 | citations空 | 架空linkを付けない |
| 各list | 該当なし | 条件に一致する記録がありません。条件を見直してください。 | records空 | 次の既存操作を示す |
| ClientKnowledgeSearch/kShowPendingStatus | 検索を処理中です。経過… | 同趣旨を維持 | pending/longRunning | エラーと分ける |
| KnowledgeSearchPage | 結果を再確認 | 結果を再確認 | POLL queryToken | 新規検索と区別 |
| KnowledgeSearchPage/export | 対象資料を確認 / コピー / Google Docs / PDF / AI用プロンプトをコピー | 維持 | preview/package/出力type/prompt | 既存出力を落とさない |
| ClientKnowledgeSearch/export | 一致するActiveなMeetingがないため、全文出力できません。 | 一致する表示中のMeetingがないため、全文出力できません。 | noResults | Pitchbookだけで本文出力不可 |
| ClientRelationshipExplorer/detail | 既存の面談保守で開く | 面談一覧へ | showPageのみ | 自動編集を約束しない |
| ClientAiProviderSettings:9 | 資格済み（無効） | 適格性確認済み・停止中 | QUALIFIED_DISABLED | record削除でも未qualificationでもない |
| 同上 | 同期準備完了 / 有効（一部同期エラー） | 維持（管理者） | READY_FOR_SYNC/ACTIVE_WITH_SYNC_ERRORS | indexと登録を分ける |
| 同上/sync message | Indexed / Metadata refreshed / Unchanged / Removed / Failed | 管理者では維持＋検索準備の処理件数と説明 | provider sync counts | Removedを物理削除と呼ばない |
| AiProviderSettingsPage/Admin client | ロック中 / ロック解除済み / ロック解除 / ログアウト / パスワードを変更 | 維持 | 0029認証/session contracts | 意味変更禁止 |

## 観察の限界

repository内の画像拡張子とProduct Designの保存contextを対象に確認したところ、参照可能な既存スクリーンショット／保存contextはありませんでした。非公開Web Appは訪問せず、実画像参照を添付したと偽っていません。後続の画像生成へは、会話で実際に表示・確認した生成モックをreferenceとして渡しました。現行UIはHTML/CSS/handlerに基づく観察であり、rendered auditではありません。
