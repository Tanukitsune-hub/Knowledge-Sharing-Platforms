# Runtime and Operations Policy

## Status

本書は、蓄積・呼び出し・修正機能および採用済みGemini File Search検索レイヤーを実運用するための確定運用ルールを記録する。Apps Script Web App、Google Sheets、Google Docs、Shared Drive、Gemini File Searchを安全かつ簡単に運用するためのルールである。

## Draft retention

- 面談記録、Pitchbook登録、共有コンテキストの未登録入力は利用者ブラウザ内で保持する。
- サイドバーでページを切り替えるだけでは下書きや選択済みファイルを消さない。
- ページ再読込、誤ってタブを閉じた場合に備え、テキスト・選択値の下書きは同じブラウザで24時間保持し、自動復元できるようにする。
- 24時間を超えた下書きは自動復元対象外とする。
- ブラウザのセキュリティ制約上、ページ再読込またはタブ終了後のPitchbookファイル本体は復元しない。日付、GP、Asset Class、Equity / Debt等は復元し、ファイルだけ再選択する。
- 明示的な`下書きをクリア`操作を用意し、確認後に当該利用者ブラウザ内の下書きと共有コンテキストを削除できるようにする。
- 下書き本文をGoogle SheetsやShared Driveへ自動保存しない。

## Pitchbook / source-material upload limits

- 1ファイルのアプリ上限は100MBとする。
- 1回の一括登録は最大10ファイルとする。
- 1回の一括登録の合計上限は500MBとする。
- 上限超過はアップロード開始前に画面側で通知し、Apps Script / サーバー側でも同じ条件を検証する。
- 大容量ファイルを1つの巨大なApps Scriptリクエストへ載せることを前提にせず、100MBまで安定して扱える転送方式を実装時に選択する。

初期のAI検索対象ファイル形式は以下とする。

```text
.pdf
.pptx
.xlsx
.docx
.txt
.eml
```

- Outlook保存メールは`.eml`のみ初期対応する。
- `.eml`はShared Driveへ原本保存し、AI indexにはSubject / From / To / Cc / Date / Body等を抽出したUTF-8テキスト表現を使用する。
- `.eml`に内包された添付ファイルは自動indexせず、必要な添付は別資料として登録する。
- Outlook `.msg`は初期対応外とする。
- AI検索非対応形式であっても、別途許容されたShared Drive原資料として保存すること自体は妨げない。AI対象外は`NotIndexed`として区別する。

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

- 本番の基本構成は、組織管理下のデプロイ主体としてWeb Appを実行し、Sheets / Shared Drive / Gemini APIへのバックエンド権限をアプリ側へ集約する方式を第一選択とする。
- 恒久運用を個人アカウントに依存させない。
- すべての登録・変更・AI検索操作について、実際に操作した利用者を監査ログへ記録できることを本番リリース条件とする。
- 会社Google Workspace環境で利用者メール等を安定して取得できない場合は、アクセスユーザーとして実行する方式または別の組織承認済み識別方法へ切り替える。利用者を識別できない状態で本番運用を開始しない。
- execute-as方式の最終設定は上記条件を満たすことを実機で確認して確定するが、権限集約と監査の両立を優先する。

## Master permissions

- GP Master、Asset Class、Equity / Debt、面談場所のマスター変更は全利用者に許可する。
- 全利用者が、許可された範囲で追加、名称変更、並び替え、無効化、再有効化を実行できる。
- 物理削除は通常操作として提供しない。
- 名称変更および無効化は共有選択肢へ影響するため、実行前に確認ダイアログを表示する。
- 重複名称チェックを行う。
- すべてのマスター変更を監査ログへ記録する。

## AI retrieval access

- Web Appの利用を許可された全利用者は`ナレッジ検索`を利用できる。
- 初期版では全利用者がFile Search Store内のすべてのActive Meeting / Pitchbook / source materialを検索できる。
- GP別、ファイル別、利用者別のAI検索ACLは初期実装に含めない。
- 監査ログの閲覧権限はこれとは別で、管理者だけに限定する。

## AI synchronization

- 正本の登録・更新を先に完了し、AI index同期は非同期の派生処理として扱う。
- 登録 / 更新時は必要なAI状態を`Pending`とし、利用者操作をGemini同期完了まで待たせない。
- Apps Scriptのtime-driven workerを15分おきに実行する。
- workerは`Pending`および再試行可能な`Failed`を処理する。
- 再試行はstable source IDとFile Search Document参照を使ってidempotentにする。
- 非対応形式や恒久エラーを無限に再試行しない。
- 新規 / 更新した情報はAI検索へ反映されるまで最大15分程度かかる場合がある旨をUIで案内できるようにする。
- AI index障害を理由にShared Drive / backend Indexの正本登録をロールバックしない。

## AI model policy

- 初期版はGemini Flash系モデル1つだけを使用する。
- 利用者向けのモデル選択、Deep mode、上位モデル切替は設けない。
- 具体的なFlash model IDは`Settings`の`AI_DEFAULT_MODEL`で管理し、実装コードへ固定しない。

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
- AI indexのindex / re-index / delete / retry / failure
- AI Knowledge Search query

通常操作の基本ログ項目は以下とする。

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

AI queryでは追加で少なくとも以下を記録する。

- Question text
- Date From / To
- GP filter
- Asset Class filter
- Equity / Debt filter
- Source Type filter
- Configured Flash model ID
- Cited source IDs when available

Gemini回答全文、retrieved chunk全文、Embedding、面談本文全文やPitchbookファイル内容は監査ログへ複製しない。監査に必要な質問・メタデータだけを記録し、原資料内容の不要な複製を避ける。

## Operational principle

利用者の通常操作は簡単に保ちつつ、失敗時にデータを失わないこと、同じデータを二重登録しないこと、誰が何を変更・検索したか追跡できることを優先する。高度なワークフロー、細かなアクセス制御、複数AIモデル等は、実運用で必要性が確認されるまで追加しない。
