# Security and Information Handling Baseline

## Status

詳細なガバナンス設計は未確定。本書では、計画段階でも外してはいけない最低条件だけを定める。

## Baseline requirements

1. 実際の面談記録、Pitchbook、未公開の投資情報、個人情報、認証情報を公開GitHubへ保存しない。
2. 実データの正本は組織管理下のGoogle Workspace / Shared Driveに置く。
3. 個人アカウント、個人Drive、個人APIキーを本番運用の永続的な所有主体にしない。
4. 検索またはAI機能を追加する場合は、利用者が本来アクセスできない原資料へアクセスを広げない。
5. AIが生成した回答・要約を、原資料確認なしに正式記録や投資判断として自動確定しない。
6. 原資料への参照可能性を維持する。

## GitHub data policy

GitHub上のテストには匿名化または合成データのみを使用する。実在のGP、人物、ファンド等を使う場合も、機密の面談内容やprivate URL等を含めない。

## Not decided yet

- Shared Driveの具体的なアクセスモデル
- 検索サービスの権限継承方式
- Gemini / Vertex AI等の利用可否
- ログ、監査、保持期間
- データ削除・訂正手順
- 本番OAuth / service account構成

これらは実装対象が具体化した段階で、会社のGoogle Workspaceおよび情報管理ルールに合わせて設計する。
