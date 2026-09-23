# Backend日次バックアップと復旧

Work0051は `Knowledge Platform Backend` のGoogle Spreadsheet全体を日次でcopyする。Audit、Meeting Docs、Pitchbook原本、Knowledge Exports、Apps Script sourceは対象外。copy元のBackendは変更しない。

## 導入と確認

既存installationでは、受入れ後の正規 `installKnowledgeShare()` / `setupKnowledgePlatform_()` 経路を管理者が再実行する。setupは `controlFolderId` 直下の `Knowledge Platform Backups` を作成または再利用し、`runBackendDailyBackup_` の日次CLOCK triggerを1件に整える。再実行でfolderとtriggerを増やさない。Web Appの通常操作からbackupを開始しない。

日付はinstallation timezone（通常 `Asia/Tokyo`）で `YYYY-MM-DD` とする。snapshot名は `Knowledge Platform Backend Backup YYYY-MM-DD`。Drive `appProperties` にbackup種別、日付、copy元Backend IDを記録する。triggerが同日に再実行された場合、検証済みsnapshotを再利用する。

日次jobは30日を**超えた**app-owned snapshotだけを、専用folder内のparent / MIME / name / marker / source IDを再確認してTrashへ移す。ちょうど30日のsnapshotは残す。完全削除はしない。folderやsourceの境界が不明な場合はjobを失敗させ、cleanupしない。

## 復旧時

1. 必要な日付のsnapshotを `Knowledge Platform Backups` で特定する。
2. snapshotのsheetと内容を読み取り、対象時点を確認する。
3. 現行Backendとの差分、復旧範囲、利用者影響を確認してから、別途承認されたincident手順で復旧する。

このWorkには自動restoreや現行Backendの上書きは含めない。trigger実行結果はApps Script実行ログの `BACKEND_DAILY_BACKUP`、`ok`、`snapshot`、`retentionTrashed`、`errorCode` で確認できる。ログにDrive IDや内容は出さない。

Work0051 stacked implementation時点では、実Drive folder/file作成、trigger作成、Trash、Apps Script sync/deployは未実施。target-runtime qualificationはChatGPT final review後の別gateに残る。
