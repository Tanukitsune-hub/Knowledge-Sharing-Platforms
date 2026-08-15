# Security and Information Handling Baseline

## Status

詳細なガバナンス設計は会社ルール確認に従うが、本書では現在採用している蓄積基盤とGemini File Search検索レイヤーに適用する最低条件を定める。

## Baseline requirements

1. 実際の面談記録、Pitchbook、未公開の投資情報、個人情報、認証情報を公開GitHubへ保存しない。
2. 実データの正本は組織管理下のGoogle Workspace / Shared Driveに置く。
3. 個人アカウント、個人Drive、個人APIキーを本番運用の永続的な所有主体にしない。
4. Gemini File SearchはShared Driveの正本を置き換えず、再生成可能な派生AIインデックスとして扱う。
5. Gemini API / File Searchへ実データを送る本番構成は、会社承認済みGoogle Cloud / Gemini API環境だけを使用する。
6. APIキーやcredentialをGitHub、クライアントHTML、ユーザー向けSheets、原資料へ保存しない。
7. File SearchのDocument / Embeddingは削除するまで保持される前提で、無効化・削除・保持ポリシーに応じて明示的に同期削除する。
8. 通常AI検索ではInactiveなMeeting / Pitchbookを検索対象にしない。
9. AI回答から利用者が元のShared Drive原資料へ戻れるtraceabilityを維持する。
10. AIが生成した回答・要約を、原資料確認なしに正式記録や投資判断として自動確定しない。
11. AI indexing障害でShared Drive上の正本登録や修正をロールバックしない。
12. 本番では登録・変更・AI利用を行った実利用者を必要な範囲で識別し、監査要件を満たせることを必須とする。
13. 利用者を識別できない状態のWeb Appを本番運用しない。

## Gemini File Search data handling

- Shared Drive: authoritative source.
- File Search Store: derived retrieval index.
- Google-managed chunks / embeddingsを利用し、独自Vector DBへ機密データを追加複製しない初期設計とする。
- Custom Metadataには検索・citationに必要な固定ID、分類、Drive URL等だけを入れる。
- `未選択`等のUI状態をmetadataとして保存しない。
- 面談本文全文やPitchbook内容を監査ログへ複製しない。
- File Searchからsourceを削除してもShared Drive正本には影響させない。

## Credentials

Credentialの具体的な保管方式は会社環境で実装時に確定するが、以下を必須とする。

- organization-approved ownership
- server-side only
- no hard-coded secret in repository
- no secret returned to browser client
- rotation可能な構成

## Master permissions

GP Master、Asset Class、Equity / Debt、面談場所のマスター変更は全利用者に許可する。

利用者が実行できる操作は、追加、名称変更、並び替え、無効化、再有効化とする。物理削除は通常操作として提供しない。

名称変更・無効化は共有選択肢へ影響するため確認ダイアログを表示し、すべてのマスター変更を監査ログへ記録する。

## Audit policy

### Retention

- 監査ログは5年間保持する。
- 5年を超えたログは定期処理で削除する。

### Access

- 監査ログは管理者だけが閲覧できる。
- 通常利用者には監査ログのSpreadsheetを共有せず、Web App上の監査ログ画面も管理者だけに表示・許可する。
- 管理者一覧は組織管理可能な設定で保持する。

### Storage

- 通常の5バックエンドSheetとは分離した管理者専用Spreadsheetへ監査ログを保存する。
- バックエンド`Settings`には監査ログSpreadsheet IDや管理者設定への参照を保持できる。

### Scope

少なくとも以下を記録する。

- 面談記録: 新規登録、更新、無効化、再有効化
- Pitchbook: 登録、再試行、メタデータ変更、無効化、再有効化、失敗
- マスター: 追加、名称変更、並び替え、無効化、再有効化
- AI layer: index / re-index / delete / retryの成否と、会社要件に応じたquery利用メタデータ

基本ログ項目は、日時、利用者、操作、対象種別、対象ID、Success / Failure、変更項目、必要に応じた変更前後メタデータ、Batch ID、短いエラー情報とする。

AI queryについて、質問本文や取得チャンクを無条件に監査ログへ複製しない。会社の監査要件に必要な範囲で利用者、時刻、filter条件、実行結果等を記録する。

## Web App identity and execution

組織管理下のデプロイ主体として実行し、Sheets / Shared Drive / Gemini APIへのバックエンド権限をアプリ側へ集約する方式を第一選択とする。

ただし、対象Google Workspace環境で実際の操作ユーザーを安定して識別できることをリリース前に必ず実機検証する。利用者識別が取得できない場合は、アクセスユーザーとして実行する方式または別の組織承認済み識別方法へ切り替える。

恒久運用を個人所有のデプロイや個人認証情報へ依存させない。

## Logical deletion and AI synchronization

通常操作では、面談記録、Pitchbook、GP、Optionを物理削除せず、Active / Inactive等の状態で管理する。

Meeting / PitchbookをInactiveにした場合、通常AI検索から除外するため対応するFile Search Documentを削除する。再有効化時は現在のShared Drive正本を再indexする。

法令・社内規程等に基づく実データの完全削除手順が必要になった場合は、Shared Drive、backend Index、File Search派生データ、監査保持義務を含めた管理者手順として通常利用者操作と分離して設計する。

## Release blockers for AI layer

以下が確認できない場合はAI検索機能を本番リリースしない。

- 会社承認済みGemini API / Google Cloud利用環境
- credentialの安全なserver-side保管
- 利用者アクセス境界
- File Search派生データの保持 / 削除運用
- citationから正しい原資料へ戻れること
- Inactive資料が通常検索に混入しないこと
- AI障害が正本データを破損させないこと

## GitHub data policy

GitHub上のテストには匿名化または合成データのみを使用する。実在のGP、人物、ファンド等を使う場合も、機密の面談内容、API credential、private URL等を含めない。

## References

- `docs/ai/gemini-file-search.md`
- `docs/operations/runtime-policy.md`
- `docs/architecture/target-architecture.md`
