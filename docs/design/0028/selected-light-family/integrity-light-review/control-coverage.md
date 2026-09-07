# 既存control対応表（197 entries）

source-controls.jsonの機械抽出inventoryを個別にrouteした表です。source SHAは`9fa668619a0b91fb60ed53f696363d3954cf709e`。mainとのproduction差分なしを確認。残置は設計上の操作/契約を残す意味で、全buttonの実サービス接続を意味しません。locked/代表stateのみに残る操作も明示しています。

既存197 controlsに加え、CODEX-11はファイル別結果、link undo、分類補助、独立export失敗stateを追加しました。既存のsourceは削除していません。

| source位置 / control | disposition | 移設先・境界 |
|---|---|---|
| `Index.html:15` / `nav-meeting` | 残置 | sidebar 7 destinations（初期01） |
| `Index.html:16` / `nav-pitchbook` | 独立入口を明示廃止 | 03 任意資料 / 05 親detail。資料単独routeなし |
| `Index.html:17` / `nav-meeting-past` | 残置 | sidebar 7 destinations（初期01） |
| `Index.html:18` / `nav-pitchbook-past` | 独立入口を明示廃止 | 03 任意資料 / 05 親detail。資料単独routeなし |
| `Index.html:19` / `nav-gp-workspace` | 入口統合・read分離維持 | 09/10 面談先サマリー |
| `Index.html:20` / `nav-entity-workspace` | 入口統合・read分離維持 | 09/10 面談先サマリー |
| `Index.html:21` / `nav-activity-analytics` | 残置 | sidebar 7 destinations（初期01） |
| `Index.html:22` / `nav-relationship-explorer` | 独立入口を明示廃止 | 03 任意資料 / 05 親detail。資料単独routeなし |
| `Index.html:23` / `nav-masters` | 残置 | sidebar 7 destinations（初期01） |
| `Index.html:24` / `nav-knowledge` | 残置 | sidebar 7 destinations（初期01） |
| `Index.html:25` / `nav-ai-provider-settings` | 残置 | sidebar 7 destinations（初期01） |
| `Index.html:33` / `meeting-date` | 残置 | 03 基本情報・本文/参加者/Team/Fund/3checkbox/関連GP/フォロー・登録/clear |
| `Index.html:34` / `meeting-time` | 残置 | 03 基本情報・本文/参加者/Team/Fund/3checkbox/関連GP/フォロー・登録/clear |
| `Index.html:35` / `meeting-locationId` | 残置 | 03 基本情報・本文/参加者/Team/Fund/3checkbox/関連GP/フォロー・登録/clear |
| `Index.html:36` / `meeting-counterpartyType` | 残置 | 03 基本情報・本文/参加者/Team/Fund/3checkbox/関連GP/フォロー・登録/clear |
| `Index.html:37` / `meeting-counterpartyId` | 残置 | 03 基本情報・本文/参加者/Team/Fund/3checkbox/関連GP/フォロー・登録/clear |
| `Index.html:37` / `meeting-quick-add-counterparty` | 残置 | 03 基本情報・本文/参加者/Team/Fund/3checkbox/関連GP/フォロー・登録/clear |
| `Index.html:38` / `meeting-relatedGpIds` | 残置 | 03 基本情報・本文/参加者/Team/Fund/3checkbox/関連GP/フォロー・登録/clear |
| `Index.html:39` / `meeting-assetClassId` | 残置 | 03 基本情報・本文/参加者/Team/Fund/3checkbox/関連GP/フォロー・登録/clear |
| `Index.html:40` / `meeting-capitalTypeId` | 残置 | 03 基本情報・本文/参加者/Team/Fund/3checkbox/関連GP/フォロー・登録/clear |
| `Index.html:41` / `meeting-teamId` | 残置 | 03 基本情報・本文/参加者/Team/Fund/3checkbox/関連GP/フォロー・登録/clear |
| `Index.html:42` / `meeting-fundStrategy` | 残置 | 03 基本情報・本文/参加者/Team/Fund/3checkbox/関連GP/フォロー・登録/clear |
| `Index.html:43` / `ANNUAL_REVIEW` | 残置 | 03 基本情報・本文/参加者/Team/Fund/3checkbox/関連GP/フォロー・登録/clear |
| `Index.html:43` / `OFFICE_VISIT` | 残置 | 03 基本情報・本文/参加者/Team/Fund/3checkbox/関連GP/フォロー・登録/clear |
| `Index.html:43` / `ANNUAL_GENERAL_MEETING` | 残置 | 03 基本情報・本文/参加者/Team/Fund/3checkbox/関連GP/フォロー・登録/clear |
| `Index.html:44` / `meeting-relatedPitchbookIds` | 補助操作へ移設 | 03/05/07 既存資料を関連付ける。Document_ID再利用 |
| `Index.html:45` / `meeting-followUpRequired` | 残置 | 03 基本情報・本文/参加者/Team/Fund/3checkbox/関連GP/フォロー・登録/clear |
| `Index.html:46` / `meeting-followUpNote` | 残置 | 03 基本情報・本文/参加者/Team/Fund/3checkbox/関連GP/フォロー・登録/clear |
| `Index.html:47` / `meeting-counterparty` | 残置 | 03 基本情報・本文/参加者/Team/Fund/3checkbox/関連GP/フォロー・登録/clear |
| `Index.html:48` / `meeting-internalParticipants` | 残置 | 03 基本情報・本文/参加者/Team/Fund/3checkbox/関連GP/フォロー・登録/clear |
| `Index.html:49` / `meeting-notes` | 残置 | 03 基本情報・本文/参加者/Team/Fund/3checkbox/関連GP/フォロー・登録/clear |
| `Index.html:52` / `meeting-clear` | 残置 | 03 基本情報・本文/参加者/Team/Fund/3checkbox/関連GP/フォロー・登録/clear |
| `Index.html:52` / `meeting-submit` | 残置 | 03 基本情報・本文/参加者/Team/Fund/3checkbox/関連GP/フォロー・登録/clear |
| `Index.html:62` / `pitchbook-date` | 親detail補助へ移設 | 05 #classification date/Asset/Capital/Fund。新規初期値は親から（資料日付は別）。差替えなし |
| `Index.html:63` / `pitchbook-gpId` | GP限定入力を置換 | 03/07 親Counterparty、既存資料は再帰属させない |
| `Index.html:63` / `pitchbook-quick-add-gp` | GP限定入力を置換 | 03/07 親Counterparty、既存資料は再帰属させない |
| `Index.html:64` / `pitchbook-assetClassId` | 親detail補助へ移設 | 05 #classification date/Asset/Capital/Fund。新規初期値は親から（資料日付は別）。差替えなし |
| `Index.html:65` / `pitchbook-capitalTypeId` | 親detail補助へ移設 | 05 #classification date/Asset/Capital/Fund。新規初期値は親から（資料日付は別）。差替えなし |
| `Index.html:66` / `pitchbook-fundStrategy` | 親detail補助へ移設 | 05 #classification date/Asset/Capital/Fund。新規初期値は親から（資料日付は別）。差替えなし |
| `Index.html:67` / `pitchbook-files` | 単一formへ移設 | 03/07 #record-files、登録、clear、file別retry / 05 後日追加 |
| `Index.html:69` / `pitchbook-clear` | 単一formへ移設 | 03/07 #record-files、登録、clear、file別retry / 05 後日追加 |
| `Index.html:69` / `pitchbook-retry` | 単一formへ移設 | 03/07 #record-files、登録、clear、file別retry / 05 後日追加 |
| `Index.html:69` / `pitchbook-submit` | 単一formへ移設 | 03/07 #record-files、登録、clear、file別retry / 05 後日追加 |
| `MaintenancePages.html:5` / `meeting-past-dateFrom` | 残置/詳細へ配置 | 05 日付・面談先・詳細分類/状態・要フォロー・検索（server絞込み非実装） |
| `MaintenancePages.html:6` / `meeting-past-dateTo` | 残置/詳細へ配置 | 05 日付・面談先・詳細分類/状態・要フォロー・検索（server絞込み非実装） |
| `MaintenancePages.html:7` / `meeting-past-counterpartyType` | 残置/詳細へ配置 | 05 日付・面談先・詳細分類/状態・要フォロー・検索（server絞込み非実装） |
| `MaintenancePages.html:8` / `meeting-past-counterpartyId` | 残置/詳細へ配置 | 05 日付・面談先・詳細分類/状態・要フォロー・検索（server絞込み非実装） |
| `MaintenancePages.html:9` / `meeting-past-relatedGpId` | 残置/詳細へ配置 | 05 日付・面談先・詳細分類/状態・要フォロー・検索（server絞込み非実装） |
| `MaintenancePages.html:10` / `meeting-past-assetClassId` | 残置/詳細へ配置 | 05 日付・面談先・詳細分類/状態・要フォロー・検索（server絞込み非実装） |
| `MaintenancePages.html:11` / `meeting-past-capitalTypeId` | 残置/詳細へ配置 | 05 日付・面談先・詳細分類/状態・要フォロー・検索（server絞込み非実装） |
| `MaintenancePages.html:12` / `meeting-past-teamId` | 残置/詳細へ配置 | 05 日付・面談先・詳細分類/状態・要フォロー・検索（server絞込み非実装） |
| `MaintenancePages.html:13` / `meeting-past-fundStrategy` | 残置/詳細へ配置 | 05 日付・面談先・詳細分類/状態・要フォロー・検索（server絞込み非実装） |
| `MaintenancePages.html:14` / `meeting-past-meetingTypeCode` | 残置/詳細へ配置 | 05 日付・面談先・詳細分類/状態・要フォロー・検索（server絞込み非実装） |
| `MaintenancePages.html:15` / `meeting-past-followUpOnly` | 残置/詳細へ配置 | 05 日付・面談先・詳細分類/状態・要フォロー・検索（server絞込み非実装） |
| `MaintenancePages.html:16` / `meeting-past-filterStatus` | 残置/詳細へ配置 | 05 日付・面談先・詳細分類/状態・要フォロー・検索（server絞込み非実装） |
| `MaintenancePages.html:18` / `meeting-past-search` | 残置/詳細へ配置 | 05 日付・面談先・詳細分類/状態・要フォロー・検索（server絞込み非実装） |
| `MaintenancePages.html:23` / `meeting-edit-close` | 残置 | 07 全編集項目と保存 / 05へ戻る。expectedVersionはfuture BUILD |
| `MaintenancePages.html:25` / `meeting-edit-meetingId` | 非表示契約を保持 | 05 detail / 07 edit; stable ID・expectedVersion等はfuture server検証 |
| `MaintenancePages.html:25` / `meeting-edit-expectedVersion` | 非表示契約を保持 | 05 detail / 07 edit; stable ID・expectedVersion等はfuture server検証 |
| `MaintenancePages.html:27` / `meeting-edit-date` | 残置 | 07 全編集項目と保存 / 05へ戻る。expectedVersionはfuture BUILD |
| `MaintenancePages.html:28` / `meeting-edit-time` | 残置 | 07 全編集項目と保存 / 05へ戻る。expectedVersionはfuture BUILD |
| `MaintenancePages.html:29` / `meeting-edit-locationId` | 残置 | 07 全編集項目と保存 / 05へ戻る。expectedVersionはfuture BUILD |
| `MaintenancePages.html:30` / `meeting-edit-counterpartyType` | 残置 | 07 全編集項目と保存 / 05へ戻る。expectedVersionはfuture BUILD |
| `MaintenancePages.html:31` / `meeting-edit-counterpartyId` | 残置 | 07 全編集項目と保存 / 05へ戻る。expectedVersionはfuture BUILD |
| `MaintenancePages.html:32` / `meeting-edit-relatedGpIds` | 残置 | 07 全編集項目と保存 / 05へ戻る。expectedVersionはfuture BUILD |
| `MaintenancePages.html:33` / `meeting-edit-assetClassId` | 残置 | 07 全編集項目と保存 / 05へ戻る。expectedVersionはfuture BUILD |
| `MaintenancePages.html:34` / `meeting-edit-capitalTypeId` | 残置 | 07 全編集項目と保存 / 05へ戻る。expectedVersionはfuture BUILD |
| `MaintenancePages.html:35` / `meeting-edit-teamId` | 残置 | 07 全編集項目と保存 / 05へ戻る。expectedVersionはfuture BUILD |
| `MaintenancePages.html:36` / `meeting-edit-fundStrategy` | 残置 | 07 全編集項目と保存 / 05へ戻る。expectedVersionはfuture BUILD |
| `MaintenancePages.html:37` / `ANNUAL_REVIEW` | 残置 | 07 全編集項目と保存 / 05へ戻る。expectedVersionはfuture BUILD |
| `MaintenancePages.html:37` / `OFFICE_VISIT` | 残置 | 07 全編集項目と保存 / 05へ戻る。expectedVersionはfuture BUILD |
| `MaintenancePages.html:37` / `ANNUAL_GENERAL_MEETING` | 残置 | 07 全編集項目と保存 / 05へ戻る。expectedVersionはfuture BUILD |
| `MaintenancePages.html:38` / `meeting-edit-relatedPitchbookIds` | 補助操作へ移設 | 03/05/07 既存資料を関連付ける。Document_ID再利用 |
| `MaintenancePages.html:39` / `meeting-edit-followUpRequired` | 残置 | 07 全編集項目と保存 / 05へ戻る。expectedVersionはfuture BUILD |
| `MaintenancePages.html:40` / `meeting-edit-followUpNote` | 残置 | 07 全編集項目と保存 / 05へ戻る。expectedVersionはfuture BUILD |
| `MaintenancePages.html:41` / `meeting-edit-counterparty` | 残置 | 07 全編集項目と保存 / 05へ戻る。expectedVersionはfuture BUILD |
| `MaintenancePages.html:42` / `meeting-edit-internalParticipants` | 残置 | 07 全編集項目と保存 / 05へ戻る。expectedVersionはfuture BUILD |
| `MaintenancePages.html:43` / `meeting-edit-notes` | 残置 | 07 全編集項目と保存 / 05へ戻る。expectedVersionはfuture BUILD |
| `MaintenancePages.html:45` / `button-45` | 残置 | 07 全編集項目と保存 / 05へ戻る。expectedVersionはfuture BUILD |
| `MaintenancePages.html:55` / `pitchbook-past-dateFrom` | 専用一覧を明示廃止・集約 | 05 親一覧filter＋関連資料。資料自体の分類/状態はdetail。legacy管理は別gate |
| `MaintenancePages.html:56` / `pitchbook-past-dateTo` | 専用一覧を明示廃止・集約 | 05 親一覧filter＋関連資料。資料自体の分類/状態はdetail。legacy管理は別gate |
| `MaintenancePages.html:57` / `pitchbook-past-gpId` | 専用一覧を明示廃止・集約 | 05 親一覧filter＋関連資料。資料自体の分類/状態はdetail。legacy管理は別gate |
| `MaintenancePages.html:58` / `pitchbook-past-assetClassId` | 専用一覧を明示廃止・集約 | 05 親一覧filter＋関連資料。資料自体の分類/状態はdetail。legacy管理は別gate |
| `MaintenancePages.html:59` / `pitchbook-past-capitalTypeId` | 専用一覧を明示廃止・集約 | 05 親一覧filter＋関連資料。資料自体の分類/状態はdetail。legacy管理は別gate |
| `MaintenancePages.html:60` / `pitchbook-past-fundStrategy` | 専用一覧を明示廃止・集約 | 05 親一覧filter＋関連資料。資料自体の分類/状態はdetail。legacy管理は別gate |
| `MaintenancePages.html:61` / `pitchbook-past-filterStatus` | 専用一覧を明示廃止・集約 | 05 親一覧filter＋関連資料。資料自体の分類/状態はdetail。legacy管理は別gate |
| `MaintenancePages.html:63` / `pitchbook-past-search` | 専用一覧を明示廃止・集約 | 05 親一覧filter＋関連資料。資料自体の分類/状態はdetail。legacy管理は別gate |
| `MaintenancePages.html:68` / `pitchbook-edit-close` | 親detail補助へ移設 | 05 #classification date/Asset/Capital/Fund。新規初期値は親から（資料日付は別）。差替えなし |
| `MaintenancePages.html:70` / `pitchbook-edit-documentId` | 非表示契約を保持 | 05 detail / 07 edit; stable ID・expectedVersion等はfuture server検証 |
| `MaintenancePages.html:70` / `pitchbook-edit-expectedUpdatedAt` | 非表示契約を保持 | 05 detail / 07 edit; stable ID・expectedVersion等はfuture server検証 |
| `MaintenancePages.html:72` / `pitchbook-edit-date` | 親detail補助へ移設 | 05 #classification date/Asset/Capital/Fund。新規初期値は親から（資料日付は別）。差替えなし |
| `MaintenancePages.html:73` / `pitchbook-edit-gpId` | GP限定入力を置換 | 03/07 親Counterparty、既存資料は再帰属させない |
| `MaintenancePages.html:74` / `pitchbook-edit-assetClassId` | 親detail補助へ移設 | 05 #classification date/Asset/Capital/Fund。新規初期値は親から（資料日付は別）。差替えなし |
| `MaintenancePages.html:75` / `pitchbook-edit-capitalTypeId` | 親detail補助へ移設 | 05 #classification date/Asset/Capital/Fund。新規初期値は親から（資料日付は別）。差替えなし |
| `MaintenancePages.html:76` / `pitchbook-edit-fundStrategy` | 親detail補助へ移設 | 05 #classification date/Asset/Capital/Fund。新規初期値は親から（資料日付は別）。差替えなし |
| `MaintenancePages.html:78` / `button-78` | 単一formへ移設 | 03/07 #record-files、登録、clear、file別retry / 05 後日追加 |
| `MaintenancePages.html:86` / `masters-refresh` | 残置 | 13-masters 管理操作の設計参照。実master変更なし |
| `MaintenancePages.html:89` / `gp-add-name` | 残置 | 13-masters 管理操作の設計参照。実master変更なし |
| `MaintenancePages.html:89` / `button-89` | 残置 | 13-masters 管理操作の設計参照。実master変更なし |
| `MaintenancePages.html:93` / `option-add-type` | 残置 | 13-masters 管理操作の設計参照。実master変更なし |
| `MaintenancePages.html:93` / `option-add-name` | 残置 | 13-masters 管理操作の設計参照。実master変更なし |
| `MaintenancePages.html:93` / `button-93` | 残置 | 13-masters 管理操作の設計参照。実master変更なし |
| `KnowledgeSearchPage.html:6` / `knowledge-route` | 通常UI非表示 | 01 許可済みAIモデルへ写像 / 14 管理者policy。Work 0027 hidden維持 |
| `KnowledgeSearchPage.html:14` / `knowledge-mode` | 残置/配置整理 | 01 共通filter・mode/model・質問・詳細・search/clear |
| `KnowledgeSearchPage.html:25` / `knowledge-model-profile` | 残置/配置整理 | 01 共通filter・mode/model・質問・詳細・search/clear |
| `KnowledgeSearchPage.html:29` / `knowledge-thinking-profile` | 通常UI非表示 | 01 許可済みAIモデルへ写像 / 14 管理者policy。Work 0027 hidden維持 |
| `KnowledgeSearchPage.html:36` / `knowledge-dateFrom` | 残置/配置整理 | 01 共通filter・mode/model・質問・詳細・search/clear |
| `KnowledgeSearchPage.html:37` / `knowledge-dateTo` | 残置/配置整理 | 01 共通filter・mode/model・質問・詳細・search/clear |
| `KnowledgeSearchPage.html:38` / `knowledge-counterpartyType` | 重複入力を統合 | 01 #search-counterparty の単一entityKey |
| `KnowledgeSearchPage.html:39` / `knowledge-entityKey` | 重複入力を統合 | 01 #search-counterparty の単一entityKey |
| `KnowledgeSearchPage.html:40` / `knowledge-entityKeys` | 残置 | 01 #compare-entities; compare送信はselectedEntityKeysのみ |
| `KnowledgeSearchPage.html:41` / `knowledge-gpId` | 重複入力を統合 | 01 #search-counterparty の単一entityKey |
| `KnowledgeSearchPage.html:42` / `knowledge-assetClassId` | 残置/配置整理 | 01 共通filter・mode/model・質問・詳細・search/clear |
| `KnowledgeSearchPage.html:43` / `knowledge-capitalTypeId` | 残置/配置整理 | 01 共通filter・mode/model・質問・詳細・search/clear |
| `KnowledgeSearchPage.html:44` / `knowledge-teamId` | 残置/配置整理 | 01 共通filter・mode/model・質問・詳細・search/clear |
| `KnowledgeSearchPage.html:45` / `knowledge-fundStrategy` | 残置/配置整理 | 01 共通filter・mode/model・質問・詳細・search/clear |
| `KnowledgeSearchPage.html:46` / `knowledge-followUp` | 残置/配置整理 | 01 共通filter・mode/model・質問・詳細・search/clear |
| `KnowledgeSearchPage.html:47` / `knowledge-relatedGpId` | 残置/配置整理 | 01 共通filter・mode/model・質問・詳細・search/clear |
| `KnowledgeSearchPage.html:48` / `knowledge-meetingTypeCode` | 残置/配置整理 | 01 共通filter・mode/model・質問・詳細・search/clear |
| `KnowledgeSearchPage.html:49` / `knowledge-sourceType` | 残置/配置整理 | 01 共通filter・mode/model・質問・詳細・search/clear |
| `KnowledgeSearchPage.html:53` / `knowledge-instruction` | 残置/配置整理 | 01 共通filter・mode/model・質問・詳細・search/clear |
| `KnowledgeSearchPage.html:59` / `knowledge-clear` | 残置/配置整理 | 01 共通filter・mode/model・質問・詳細・search/clear |
| `KnowledgeSearchPage.html:60` / `knowledge-submit` | 残置/配置整理 | 01 共通filter・mode/model・質問・詳細・search/clear |
| `KnowledgeSearchPage.html:65` / `knowledge-recheck` | 状態例に保持 | 15-representative-states 再試行。実provider再実行なし |
| `KnowledgeSearchPage.html:81` / `knowledge-export-preview-button` | 移設 | 01 #full-export-run 独立非AIbutton |
| `KnowledgeSearchPage.html:87` / `knowledge-export-copy` | 残置 | 01 export preview内のcopy/Docs/PDF設計例（実ファイル生成なし） |
| `KnowledgeSearchPage.html:88` / `knowledge-export-docs` | 残置 | 01 export preview内のcopy/Docs/PDF設計例（実ファイル生成なし） |
| `KnowledgeSearchPage.html:89` / `knowledge-export-pdf` | 残置 | 01 export preview内のcopy/Docs/PDF設計例（実ファイル生成なし） |
| `KnowledgeSearchPage.html:96` / `knowledge-export-prompt` | 補助操作へ移設 | 01 外部AI用プロンプト（デモ）; 原文転送/clipboard実行なし |
| `KnowledgeSearchPage.html:101` / `knowledge-export-prompt-text` | 補助操作へ移設 | 01 外部AI用プロンプト（デモ）; 原文転送/clipboard実行なし |
| `GpWorkspacePage.html:5` / `gp-workspace-print-button` | 残置 | 09/10 summary; read facadeは別、印刷/対象/戦略参照、資料操作は05 detail |
| `GpWorkspacePage.html:7` / `gp-workspace-gpId` | 残置 | 09/10 summary; read facadeは別、印刷/対象/戦略参照、資料操作は05 detail |
| `EntityWorkspacePage.html:5` / `entity-workspace-print-button` | 残置 | 09/10 summary; read facadeは別、印刷/対象/戦略参照、資料操作は05 detail |
| `EntityWorkspacePage.html:8` / `entity-workspace-type` | 残置 | 09/10 summary; read facadeは別、印刷/対象/戦略参照、資料操作は05 detail |
| `EntityWorkspacePage.html:9` / `entity-workspace-entity` | 残置 | 09/10 summary; read facadeは別、印刷/対象/戦略参照、資料操作は05 detail |
| `EntityWorkspacePage.html:18` / `entity-workspace-fund` | 残置 | 09/10 summary; read facadeは別、印刷/対象/戦略参照、資料操作は05 detail |
| `ActivityAnalyticsPage.html:7` / `activity-period` | 残置/詳細へ集約 | 11-analytics; 月次条件＋詳細、集計、9列。runtime集計は非実装 |
| `ActivityAnalyticsPage.html:8` / `activity-date-from` | 残置/詳細へ集約 | 11-analytics; 月次条件＋詳細、集計、9列。runtime集計は非実装 |
| `ActivityAnalyticsPage.html:9` / `activity-date-to` | 残置/詳細へ集約 | 11-analytics; 月次条件＋詳細、集計、9列。runtime集計は非実装 |
| `ActivityAnalyticsPage.html:10` / `activity-dimension` | 残置/詳細へ集約 | 11-analytics; 月次条件＋詳細、集計、9列。runtime集計は非実装 |
| `ActivityAnalyticsPage.html:11` / `activity-filter-counterpartyType` | 残置/詳細へ集約 | 11-analytics; 月次条件＋詳細、集計、9列。runtime集計は非実装 |
| `ActivityAnalyticsPage.html:12` / `activity-filter-counterpartyEntity` | 残置/詳細へ集約 | 11-analytics; 月次条件＋詳細、集計、9列。runtime集計は非実装 |
| `ActivityAnalyticsPage.html:13` / `activity-filter-relatedGp` | 残置/詳細へ集約 | 11-analytics; 月次条件＋詳細、集計、9列。runtime集計は非実装 |
| `ActivityAnalyticsPage.html:14` / `activity-filter-assetClass` | 残置/詳細へ集約 | 11-analytics; 月次条件＋詳細、集計、9列。runtime集計は非実装 |
| `ActivityAnalyticsPage.html:15` / `activity-filter-team` | 残置/詳細へ集約 | 11-analytics; 月次条件＋詳細、集計、9列。runtime集計は非実装 |
| `ActivityAnalyticsPage.html:16` / `activity-filter-meetingType` | 残置/詳細へ集約 | 11-analytics; 月次条件＋詳細、集計、9列。runtime集計は非実装 |
| `ActivityAnalyticsPage.html:17` / `activity-filter-status` | 残置/詳細へ集約 | 11-analytics; 月次条件＋詳細、集計、9列。runtime集計は非実装 |
| `ActivityAnalyticsPage.html:19` / `activity-analytics-refresh` | 残置/詳細へ集約 | 11-analytics; 月次条件＋詳細、集計、9列。runtime集計は非実装 |
| `RelationshipExplorerPage.html:7` / `relationship-date-from` | 専用入口廃止・親detailへ集約 | 05 一覧filter＋明示関連。逆引専用filterのUIは廃止、legacy orphan管理はBUILD前に別途固定 |
| `RelationshipExplorerPage.html:8` / `relationship-date-to` | 専用入口廃止・親detailへ集約 | 05 一覧filter＋明示関連。逆引専用filterのUIは廃止、legacy orphan管理はBUILD前に別途固定 |
| `RelationshipExplorerPage.html:9` / `relationship-counterparty-type` | 専用入口廃止・親detailへ集約 | 05 一覧filter＋明示関連。逆引専用filterのUIは廃止、legacy orphan管理はBUILD前に別途固定 |
| `RelationshipExplorerPage.html:10` / `relationship-counterparty-entity` | 専用入口廃止・親detailへ集約 | 05 一覧filter＋明示関連。逆引専用filterのUIは廃止、legacy orphan管理はBUILD前に別途固定 |
| `RelationshipExplorerPage.html:11` / `relationship-related-gp` | 専用入口廃止・親detailへ集約 | 05 一覧filter＋明示関連。逆引専用filterのUIは廃止、legacy orphan管理はBUILD前に別途固定 |
| `RelationshipExplorerPage.html:12` / `relationship-pitchbook-gp` | 専用入口廃止・親detailへ集約 | 05 一覧filter＋明示関連。逆引専用filterのUIは廃止、legacy orphan管理はBUILD前に別途固定 |
| `RelationshipExplorerPage.html:13` / `relationship-asset-class` | 専用入口廃止・親detailへ集約 | 05 一覧filter＋明示関連。逆引専用filterのUIは廃止、legacy orphan管理はBUILD前に別途固定 |
| `RelationshipExplorerPage.html:14` / `relationship-fund-strategy` | 専用入口廃止・親detailへ集約 | 05 一覧filter＋明示関連。逆引専用filterのUIは廃止、legacy orphan管理はBUILD前に別途固定 |
| `RelationshipExplorerPage.html:15` / `relationship-meeting-status` | 専用入口廃止・親detailへ集約 | 05 一覧filter＋明示関連。逆引専用filterのUIは廃止、legacy orphan管理はBUILD前に別途固定 |
| `RelationshipExplorerPage.html:16` / `relationship-pitchbook-status` | 専用入口廃止・親detailへ集約 | 05 一覧filter＋明示関連。逆引専用filterのUIは廃止、legacy orphan管理はBUILD前に別途固定 |
| `RelationshipExplorerPage.html:18` / `relationship-explorer-clear` | 専用入口廃止・親detailへ集約 | 05 一覧filter＋明示関連。逆引専用filterのUIは廃止、legacy orphan管理はBUILD前に別途固定 |
| `RelationshipExplorerPage.html:18` / `relationship-explorer-refresh` | 専用入口廃止・親detailへ集約 | 05 一覧filter＋明示関連。逆引専用filterのUIは廃止、legacy orphan管理はBUILD前に別途固定 |
| `AiProviderSettingsPage.html:16` / `shared-admin-bootstrap-password` | 管理者状態契約を保持 | 14-provider locked例 / 15代表state。bootstrap・logout・rotation・接続/同期等の実操作は非実装（廃止ではない） |
| `AiProviderSettingsPage.html:18` / `shared-admin-bootstrap-confirmation` | 管理者状態契約を保持 | 14-provider locked例 / 15代表state。bootstrap・logout・rotation・接続/同期等の実操作は非実装（廃止ではない） |
| `AiProviderSettingsPage.html:19` / `shared-admin-bootstrap` | 管理者状態契約を保持 | 14-provider locked例 / 15代表state。bootstrap・logout・rotation・接続/同期等の実操作は非実装（廃止ではない） |
| `AiProviderSettingsPage.html:23` / `shared-admin-unlock-password` | 管理者状態契約を保持 | 14-provider locked例 / 15代表state。bootstrap・logout・rotation・接続/同期等の実操作は非実装（廃止ではない） |
| `AiProviderSettingsPage.html:24` / `shared-admin-unlock` | 管理者状態契約を保持 | 14-provider locked例 / 15代表state。bootstrap・logout・rotation・接続/同期等の実操作は非実装（廃止ではない） |
| `AiProviderSettingsPage.html:27` / `shared-admin-logout` | 管理者状態契約を保持 | 14-provider locked例 / 15代表state。bootstrap・logout・rotation・接続/同期等の実操作は非実装（廃止ではない） |
| `AiProviderSettingsPage.html:29` / `shared-admin-new-password` | 管理者状態契約を保持 | 14-provider locked例 / 15代表state。bootstrap・logout・rotation・接続/同期等の実操作は非実装（廃止ではない） |
| `AiProviderSettingsPage.html:31` / `shared-admin-new-password-confirmation` | 管理者状態契約を保持 | 14-provider locked例 / 15代表state。bootstrap・logout・rotation・接続/同期等の実操作は非実装（廃止ではない） |
| `AiProviderSettingsPage.html:32` / `shared-admin-change-password` | 管理者状態契約を保持 | 14-provider locked例 / 15代表state。bootstrap・logout・rotation・接続/同期等の実操作は非実装（廃止ではない） |
| `AiProviderSettingsPage.html:45` / `ai-provider-openai-key-input` | 管理者状態契約を保持 | 14-provider locked例 / 15代表state。bootstrap・logout・rotation・接続/同期等の実操作は非実装（廃止ではない） |
| `AiProviderSettingsPage.html:47` / `ai-provider-sync-source` | 管理者状態契約を保持 | 14-provider locked例 / 15代表state。bootstrap・logout・rotation・接続/同期等の実操作は非実装（廃止ではない） |
| `AiProviderSettingsPage.html:53` / `ai-provider-sync-source-id` | 管理者状態契約を保持 | 14-provider locked例 / 15代表state。bootstrap・logout・rotation・接続/同期等の実操作は非実装（廃止ではない） |
| `AiProviderSettingsPage.html:54` / `ai-provider-openai-enable` | 管理者状態契約を保持 | 14-provider locked例 / 15代表state。bootstrap・logout・rotation・接続/同期等の実操作は非実装（廃止ではない） |
| `AiProviderSettingsPage.html:55` / `ai-provider-openai-disable` | 管理者状態契約を保持 | 14-provider locked例 / 15代表state。bootstrap・logout・rotation・接続/同期等の実操作は非実装（廃止ではない） |
| `AiProviderSettingsPage.html:56` / `ai-provider-openai-sync` | 管理者状態契約を保持 | 14-provider locked例 / 15代表state。bootstrap・logout・rotation・接続/同期等の実操作は非実装（廃止ではない） |
| `AiProviderSettingsPage.html:70` / `ai-provider-gemini-key-input` | 管理者状態契約を保持 | 14-provider locked例 / 15代表state。bootstrap・logout・rotation・接続/同期等の実操作は非実装（廃止ではない） |
| `AiProviderSettingsPage.html:72` / `ai-provider-gemini-sync-source` | 管理者状態契約を保持 | 14-provider locked例 / 15代表state。bootstrap・logout・rotation・接続/同期等の実操作は非実装（廃止ではない） |
| `AiProviderSettingsPage.html:74` / `ai-provider-gemini-sync-source-id` | 管理者状態契約を保持 | 14-provider locked例 / 15代表state。bootstrap・logout・rotation・接続/同期等の実操作は非実装（廃止ではない） |
| `AiProviderSettingsPage.html:75` / `ai-provider-gemini-connect` | 管理者状態契約を保持 | 14-provider locked例 / 15代表state。bootstrap・logout・rotation・接続/同期等の実操作は非実装（廃止ではない） |
| `AiProviderSettingsPage.html:76` / `ai-provider-gemini-enable` | 管理者状態契約を保持 | 14-provider locked例 / 15代表state。bootstrap・logout・rotation・接続/同期等の実操作は非実装（廃止ではない） |
| `AiProviderSettingsPage.html:77` / `ai-provider-gemini-disable` | 管理者状態契約を保持 | 14-provider locked例 / 15代表state。bootstrap・logout・rotation・接続/同期等の実操作は非実装（廃止ではない） |
| `AiProviderSettingsPage.html:78` / `ai-provider-gemini-sync` | 管理者状態契約を保持 | 14-provider locked例 / 15代表state。bootstrap・logout・rotation・接続/同期等の実操作は非実装（廃止ではない） |
| `AiProviderSettingsPage.html:87` / `ai-model-profile-select` | 管理者限定契約を保持 | 14-provider のlocked profile参照。migrate/qualifyは通常UI非表示・今回操作なし |
| `AiProviderSettingsPage.html:90` / `ai-model-profile-id` | 管理者限定契約を保持 | 14-provider のlocked profile参照。migrate/qualifyは通常UI非表示・今回操作なし |
| `AiProviderSettingsPage.html:91` / `ai-model-provider` | 管理者限定契約を保持 | 14-provider のlocked profile参照。migrate/qualifyは通常UI非表示・今回操作なし |
| `AiProviderSettingsPage.html:92` / `ai-model-id` | 管理者限定契約を保持 | 14-provider のlocked profile参照。migrate/qualifyは通常UI非表示・今回操作なし |
| `AiProviderSettingsPage.html:93` / `ai-model-display-name` | 管理者限定契約を保持 | 14-provider のlocked profile参照。migrate/qualifyは通常UI非表示・今回操作なし |
| `AiProviderSettingsPage.html:94` / `ai-model-family` | 管理者限定契約を保持 | 14-provider のlocked profile参照。migrate/qualifyは通常UI非表示・今回操作なし |
| `AiProviderSettingsPage.html:95` / `ai-model-max-output` | 管理者限定契約を保持 | 14-provider のlocked profile参照。migrate/qualifyは通常UI非表示・今回操作なし |
| `AiProviderSettingsPage.html:99` / `ai-model-thinking-profiles` | 管理者限定契約を保持 | 14-provider のlocked profile参照。migrate/qualifyは通常UI非表示・今回操作なし |
| `AiProviderSettingsPage.html:102` / `ai-model-default-thinking` | 管理者限定契約を保持 | 14-provider のlocked profile参照。migrate/qualifyは通常UI非表示・今回操作なし |
| `AiProviderSettingsPage.html:103` / `ai-model-enabled` | 管理者限定契約を保持 | 14-provider のlocked profile参照。migrate/qualifyは通常UI非表示・今回操作なし |
| `AiProviderSettingsPage.html:104` / `ai-model-user-visible` | 管理者限定契約を保持 | 14-provider のlocked profile参照。migrate/qualifyは通常UI非表示・今回操作なし |
| `AiProviderSettingsPage.html:105` / `ai-model-provider-default` | 管理者限定契約を保持 | 14-provider のlocked profile参照。migrate/qualifyは通常UI非表示・今回操作なし |
| `AiProviderSettingsPage.html:113` / `ai-model-policy-migrate` | 管理者限定契約を保持 | 14-provider のlocked profile参照。migrate/qualifyは通常UI非表示・今回操作なし |
| `AiProviderSettingsPage.html:114` / `ai-model-profile-save` | 管理者限定契約を保持 | 14-provider のlocked profile参照。migrate/qualifyは通常UI非表示・今回操作なし |
| `AiProviderSettingsPage.html:115` / `ai-model-profile-qualify` | 管理者限定契約を保持 | 14-provider のlocked profile参照。migrate/qualifyは通常UI非表示・今回操作なし |
