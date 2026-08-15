# Runtime and Operations Policy

## Status

本書は、蓄積・呼び出し・修正機能および採用済みGemini File Search検索レイヤーを実運用するための確定運用ルールを記録する。

採用済み仕様と実装時検証を混同しない。実機確認が必要という理由だけで、確定済み仕様を未決定として扱わない。

## Draft retention

- Meeting、Pitchbook登録、共有コンテキストの未登録入力は利用者ブラウザ内で保持する。
- サイドバー画面切替だけでは下書きや選択済みファイルを消さない。
- テキスト・選択値の下書きは同じブラウザで24時間保持し、自動復元できるようにする。
- 24時間を超えた下書きは自動復元対象外とする。
- ページ再読込 / タブ終了後のPitchbookファイル本体は復元しない。Metadataは復元し、ファイルだけ再選択する。
- `下書きをクリア`操作を用意する。
- 下書き本文をSheets / Shared Driveへ自動保存しない。

## Pitchbook / source-material upload limits

初期上限:

```text
25MB / file
10 files / selection
100MB / selection total
```

- client-sideとserver-sideで同じ条件を検証する。
- 複数ファイルはfile-granularに処理し、1つの巨大requestへまとめることを前提にしない。
- 25MB以内でもApps Script実機上限が確認された場合は、architectureを複雑化して上限を維持するより安全な低い上限へ変更することを優先する。
- 初期版で100MB/file専用chunk uploadやCloud fallbackを実装しない。

詳細Decision: `docs/decisions/pitchbook-upload-limits.md`

## Initial AI-searchable formats

```text
.pdf
.pptx
.xlsx
.docx
.txt
.eml
```

- `.eml`はShared Driveへ原本保存し、AI indexにはSubject / From / To / Cc / Date / Body等を抽出したUTF-8テキスト表現を使用する。
- `.eml`内の添付ファイルは自動indexせず、必要な添付は別資料として登録する。
- `.msg`は初期対応外とする。
- AI検索非対応形式でも、許容されたShared Drive原資料として保存すること自体は妨げない。AI対象外は`NotIndexed`として区別する。

## Partial failure and retry

複数Pitchbookの一括登録はfile-granularに状態管理する。

### Identity and state

- 一括登録ごとに固定`Batch_ID`を発行する。
- 各ファイルに固定`Document_ID`と連番を割り当てる。
- Pitchbook状態は少なくとも`Pending / Active / Failed / Inactive`を区別する。
- 一度発行したDocument ID、Batch ID、連番を再利用しない。

### Failure behavior

- 1ファイルが失敗しても、他ファイルの処理を可能な範囲で継続する。
- 正常登録済みファイルをバッチ全体の失敗でrollbackしない。
- 失敗ファイルは`Failed`として記録し、ファイル単位の結果を表示する。
- 失敗分だけ再試行できる。
- retryでは同じDocument IDと予約済み連番を使用し、重複recordを作らない。
- 欠番は詰め直さない。
- Drive保存とIndex更新の途中で失敗した場合は、retry前に既存File ID / Document IDを確認し、二重Drive file / Index rowを作らない。

## Web App execution and actor attribution

- 初期本番構成は、組織管理下のデプロイ主体としてWeb Appを実行し、Sheets / Shared Drive / Gemini APIへのバックエンド権限をアプリ側へ集約する方式を第一選択とする。
- 恒久運用を個人所有のアカウント / credentialへ依存させない。
- 実利用者emailを取得できる場合は監査Actorとして記録する。
- emailを取得できない場合は`Session.getTemporaryActiveUserKey()`を利用できれば`TEMP_USER:<key>`として記録する。
- どちらも利用できない場合は`UNIDENTIFIED`を許容する。
- Actorを恒久的に本人特定できないことだけを理由に、登録・変更・AI検索を失敗させたりPROD-ready判定を拒否したりしない。
- Temporary Active User Keyは匿名の運用トレース用であり、恒久的な本人識別子として扱わない。

詳細Decision: `docs/decisions/audit-access-and-user-attribution.md`

## Master permissions

- GP Master、Asset Class、Equity / Debt、面談場所のMaster変更は全利用者に許可する。
- 追加、名称変更、並び替え、無効化、再有効化を許可する。
- 物理削除は通常操作として提供しない。
- 名称変更 / 無効化は確認ダイアログを表示する。
- 重複名称チェックを行う。
- Master変更は監査ログへ記録する。

## AI retrieval access

- Web App利用を許可された利用者はKnowledge Searchを利用できる。
- 初期版では全利用者がFile Search Store内のすべてのActive Meeting / Pitchbook / source materialを検索できる。
- GP別、file別、利用者別AI retrieval ACLは初期実装に含めない。
- インターネット一般公開を前提とせず、Web App自体の利用許可範囲を共通アクセス境界とする。

## Knowledge Search modes

採用済みTarget UX:

```text
自由質問 | 要約 | 時系列 | 比較 | 面談準備
```

- `自由質問`をdefault modeとする。
- 5モードは同じFile Search Store、Metadata Filter、semantic retrieval、Gemini Flash、Citation / Drive link処理を共有する。
- preset modeでは質問欄を任意の`追加指示`として利用できる。
- 5モード構成自体は採用済みであり、段階実装を理由に未決定扱いしない。

## AI synchronization

- 正本登録 / 更新を先に完了し、AI index同期は非同期派生処理とする。
- 登録 / 更新時はAI状態を`Pending`とし、利用者操作をGemini同期完了まで待たせない。
- Apps Script time-driven workerを15分おきに実行する。
- workerは`Pending`とretryable `Failed`を処理する。
- retryはstable source IDとFile Search Document参照を使ってidempotentにする。
- unsupported / permanent failureを無限retryしない。
- 新規 / 更新情報はAI検索反映まで最大15分程度かかる場合がある旨をUIで案内できるようにする。
- AI index障害を理由にShared Drive / backend Indexの正本登録をrollbackしない。

## AI model policy

- 初期版はGemini Flash系モデル1つだけを使用する。
- 利用者向けmodel selector、Deep mode、上位モデル切替を設けない。
- concrete model IDは`Settings.AI_DEFAULT_MODEL`で管理し、コードへ固定しない。

## Audit log

### Storage and access

- 監査ログは通常backendの5シートとは別のAudit Spreadsheetへ保存する。
- Audit Spreadsheetは管理者専用control folderへ置く。
- control folder / Audit SpreadsheetのDrive共有はRestrictedを基本とし、許可された管理者だけが直接閲覧できる状態にする。
- 通常利用者へAudit Spreadsheetを共有しない。
- 初期版ではWeb App内にAudit Viewerを実装しない。管理者は必要時にSpreadsheetを直接開く。
- 独自passwordやSheet保護を主アクセス制御にせず、Google Drive共有権限をアクセス境界とする。
- 監査ログは5年間保持し、5年を超えたログは定期処理で削除する。
- `Settings`に`AUDIT_LOG_SPREADSHEET_ID`等の参照設定を保持できる。

### Logged events

少なくとも以下を記録する。

- Meeting: register / update / deactivate / reactivate
- Pitchbook: register / retry / metadata update / deactivate / reactivate / failure
- GP / Option Master: add / rename / reorder / deactivate / reactivate
- AI index: index / re-index / delete / retry / failure
- Knowledge Search: 全5モード実行

通常操作の基本ログ項目:

- Event timestamp
- Actor
- Action
- Target type
- Target ID
- Result: Success / Failure
- Changed fields
- Before / After metadata when applicable
- Batch ID when applicable
- Error code / short error message when applicable

AI queryでは追加で少なくとも以下を記録する。

- Search mode
- Question / additional instruction text
- Date From / To
- GP filter
- Asset Class filter
- Equity / Debt filter
- Source Type filter
- Configured Flash model ID
- Cited source IDs when available

Gemini回答全文、retrieved chunk全文、Embedding、Meeting本文全文、Pitchbook内容は監査ログへ複製しない。

## Operational principle

利用者操作は簡単に保ちつつ、失敗時のdata loss回避、duplicate防止、変更 / AI利用の運用トレースを優先する。

実利用者の恒久的本人識別、細かなアクセス制御、Web App内Audit Viewer、複数AIモデル等は、実運用で必要性が確認されるまで追加しない。
