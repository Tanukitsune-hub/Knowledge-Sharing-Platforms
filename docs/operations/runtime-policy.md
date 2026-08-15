# Runtime and Operations Policy

## Status

本書は、蓄積・呼び出し・修正機能を実運用するための確定運用ルールを記録する。プロダクト機能や検索 / AI方式を広げる文書ではなく、既に採用したApps Script Web App、Google Sheets、Google Docs、Shared Drive構成を安全かつ簡単に運用するためのルールである。

## Draft retention

- 面談記録、Pitchbook登録、共有コンテキストの未登録入力は利用者ブラウザ内で保持する。
- サイドバーでページを切り替えるだけでは下書きや選択済みファイルを消さない。
- ページ再読込、誤ってタブを閉じた場合に備え、テキスト・選択値の下書きは同じブラウザで24時間保持し、自動復元できるようにする。
- 24時間を超えた下書きは自動復元対象外とする。
- ブラウザのセキュリティ制約上、ページ再読込またはタブ終了後のPitchbookファイル本体は復元しない。日付、GP、Asset Class、Equity / Debt等は復元し、ファイルだけ再選択する。
- 明示的な`下書きをクリア`操作を用意し、確認後に当該利用者ブラウザ内の下書きと共有コンテキストを削除できるようにする。
- 下書き本文をGoogle SheetsやShared Driveへ自動保存しない。

## Pitchbook upload limits

- 1ファイルのアプリ上限は100MBとする。
- 1回の一括登録は最大10ファイルとする。
- 1回の一括登録の合計上限は500MBとする。
- 上限超過はアップロード開始前に画面側で通知し、Apps Script / サーバー側でも同じ条件を検証する。
- 大容量ファイルを1つの巨大なApps Scriptリクエストへ載せることを前提にせず、100MBまで安定して扱える転送方式を実装時に選択する。
- 対応拡張子の最終ホワイトリストは実装時の実機検証で確定する。

## Partial failure and retry

複数Pitchbookの一括登録は、バッチ全体を1つの成否にまとめず、1ファイル単位で状態を管理する。

### Identity and state

- 一括登録ごとに固定`Batch_ID`を発行する。
- 各ファイルに固定`Document_ID`と連番を割り当てる。
- Pitchbookの状態は少なくとも`Pending / Active / Failed / Inactive`を区別できるようにする。
- 一度発行したDocument ID、Batch ID、連番を再利用しない。

### Failure behavior

- 途中の1ファイルが失敗しても、他ファイルの登録処理は可能な範囲で継続する。
- 正常登録済みファイルをバッチ全体の失敗を理由にロールバックしない。
- 失敗ファイルは`Failed`として記録し、利用者へファイル単位の結果を表示する。
- 失敗分だけを再試行できる操作を提供する。
- 再試行では同じDocument IDと予約済み連番を使用し、新しい重複レコードを作らない。
- 失敗やメタデータ変更による連番の欠番は詰め直さない。
- Drive保存とIndex更新の途中で失敗した場合は、再試行前に既存File ID / Document IDを確認し、二重ファイル・二重Index行を作らない。

## Web App execution and user attribution

- 本番の基本構成は、組織管理下のデプロイ主体としてWeb Appを実行し、Sheets / Shared Driveへの書込み権限をアプリ側へ集約する方式を第一選択とする。
- 恒久運用を個人アカウントに依存させない。
- すべての登録・変更操作について、実際に操作した利用者を監査ログへ記録できることを本番リリース条件とする。
- 会社Google Workspace環境で利用者メール等を安定して取得できない場合は、アクセスユーザーとして実行する方式または別の組織承認済み識別方法へ切り替える。利用者を識別できない状態で本番運用を開始しない。
- execute-as方式の最終設定は上記条件を満たすことを実機で確認して確定するが、権限集約と監査の両立を優先する。

## Master permissions

- GP Master、Asset Class、Equity / Debt、面談場所のマスター変更は全利用者に許可する。
- 全利用者が、許可された範囲で追加、名称変更、並び替え、無効化、再有効化を実行できる。
- 物理削除は通常操作として提供しない。
- 名称変更および無効化は共有選択肢へ影響するため、実行前に確認ダイアログを表示する。
- 重複名称チェックを行う。
- すべてのマスター変更を監査ログへ記録する。

## Audit log

### Retention and access

- 監査ログは5年間保持する。
- 通常利用者は監査ログを閲覧できない。
- Web Appの監査ログ閲覧機能は管理者だけに表示・許可する。
- 管理者は`Settings`の`ADMIN_EMAILS`等、組織管理可能な設定で管理する。
- 5年を超えた監査ログは定期処理で削除する。

### Storage

- 既存の5バックエンドSheet構成は維持する。
- 監査ログは通常バックエンドSpreadsheetとは分離した管理者専用Spreadsheetへ保存する。
- `Settings`に`AUDIT_LOG_SPREADSHEET_ID`等の参照設定を保持できる。

### Logged events

少なくとも以下を記録する。

- 面談の新規登録、更新、無効化、再有効化
- Pitchbookの登録、再試行、メタデータ変更、無効化、再有効化、失敗
- GP / Option Masterの追加、名称変更、並び替え、無効化、再有効化

監査ログの基本項目は以下とする。

- Event timestamp
- User identity
- Action
- Target type
- Target ID
- Result: Success / Failure
- Changed fields
- Before / After metadata when applicable
- Batch ID when applicable
- Error code / short error message when applicable

面談本文全文やPitchbookファイル内容は監査ログへ複製しない。監査に必要なメタデータだけを記録し、機密情報の不要な重複と容量増加を避ける。

## Operational principle

利用者の通常操作は簡単に保ちつつ、失敗時にデータを失わないこと、同じデータを二重登録しないこと、誰が何を変更したか追跡できることを優先する。高度なワークフローや承認機能は、実運用で必要性が確認されるまで追加しない。
