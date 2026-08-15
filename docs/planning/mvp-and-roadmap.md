# Planning Baseline

## Status

従来のMVPとロードマップは2026-08-14に破棄した。本書は詳細なロードマップではなく、次の検討を始めるための現在の確定事項と未決定事項を記録する。

## Current direction

まず「知識を正しく、継続的に蓄積できること」を優先する。

現時点で採用している中心要素は以下。

1. Apps Script HTML Serviceによる1つの共通Web App
2. 面談記録の新規登録・過去記録検索 / 編集 / 無効化 / 再有効化
3. Pitchbookのドラッグ＆ドロップ / 複数ファイル登録・過去資料検索 / 編集 / 無効化 / 再有効化
4. GP Master / Option Masterの管理画面
5. Apps Scriptによる軽量な面談Google Docs生成・更新
6. Meeting ID / Document ID / Batch IDによる固定識別
7. Pitchbookの自動命名、継続連番、Shared Drive保存
8. 1つのバックエンドSpreadsheetに5シートを集約
9. Shared Driveは`Meeting Records`と`Pitchbooks`の2フォルダだけに分け、各フォルダ内はフラットに蓄積

## Current UX decisions

### Meeting

入力項目と必須 / 任意は以下とする。

- 日付: 必須。手入力 / カレンダー
- 時間: 任意
- 面談場所: 任意。選択
- GP: 必須。選択。未登録GPはクイック追加可能
- Asset Class: 必須。選択
- エクイティ / デット: 任意。選択
- 面談相手: 任意。自由入力
- 当社側: 任意。自由入力
- 面談内容: 任意。自由記載

面談実績だけを登録できるよう、日付・GP・Asset Classだけで登録可能とする。

面談内容欄は十分な高さを持たせ、長文は欄内縦スクロール、横方向は自動折り返しとする。

Google Docsは表や装飾を避け、入力済み項目だけを`項目: 値`形式でコンパクトにミラーする。面談本文はDocsを正本とし、Sheetへ本文を重複保存しない。

### Shared context

面談とPitchbookで以下を共有し、サイドバーでページを切り替えても利用者ブラウザ内で保持する。

- 日付
- GP
- Asset Class
- エクイティ / デット

登録後も共有4項目は保持し、各ページ固有の入力だけをクリアする。Equity / Debtが未選択の場合も、その未選択状態を共有する。

### Pitchbook

- ドラッグ＆ドロップまたはファイル選択
- 複数ファイルの一括選択
- ファイル、日付、GP、Asset Classは必須
- Equity / Debtは任意
- 自由な保存ファイル名入力は行わない
- 1ファイル目から必ず`_01`等の連番を付ける
- 後日同じ登録コンテキストで追加した場合は既存最大番号の次を採番する
- `/`、`&`等の記号は保存名生成時に除外する
- 元の拡張子を維持する

Equity / Debt選択時:

```text
YYYY-MM-DD_GP_AssetClass_Equity-or-Debt_Sequence.ext
```

未選択時:

```text
YYYY-MM-DD_GP_AssetClass_Sequence.ext
```

### Meeting Docs naming

各面談に固定Meeting IDを発行する。

```text
YYYY-MM-DD_GP_AssetClass_Equity-or-Debt_MTG-XXXXXX
```

時間はファイル名に含めない。Equity / Debt未選択時はその要素を省略する。表示情報を後から変更してもMeeting IDは変更しない。

## Past-record workflows

### Meeting

`新規登録` / `過去記録`を切り替える。

検索条件はすべて任意。

- 日付 From / To
- GP
- Asset Class
- Equity / Debt
- Status: Active / Inactive / すべて

条件なしでは新しい順に表示する。一覧には日付、時間、GP、Asset Class、Equity / Debt、面談場所、面談相手等を表示し、長い面談本文は表示しない。

編集では同じMeeting ID / Google Docsを維持し、入力フォーム、Docs、Index、必要なファイル名を同期更新する。物理削除はせず無効化 / 再有効化を行う。同時編集はVersion / Updated Atで競合検知する。

### Pitchbook

`新規登録` / `過去資料`を切り替える。

検索条件は面談と同じく、日付 From / To、GP、Asset Class、Equity / Debt、Statusをすべて任意とする。

一覧は1ファイル1件。ファイルを開く操作と編集操作を提供する。

編集可能なメタデータは日付、GP、Asset Class、Equity / Debt。修正時はIndexとDrive上の保存ファイル名を同期する。変更後コンテキストに既存ファイルがある場合は既存最大連番の次を採番し、旧コンテキスト側の欠番は詰め直さない。Document ID / Drive File IDは維持する。

Pitchbookも物理削除せず無効化 / 再有効化を行う。初期実装ではファイル差し替えを行わず、誤ファイルは無効化し正しいファイルを新規登録する。

## Master decisions

### GP

- GPは`GP_Master`で管理する。
- GP選択肢は常にGP Nameのアルファベット順で表示する。
- 面談 / Pitchbook登録画面から未登録GPをクイック追加できる。
- クイック追加時は前後空白と大文字小文字を無視して重複確認する。
- 追加したGPはその場で選択状態にする。
- 名称変更、無効化、再有効化はマスター管理画面から行う。
- 主要GPは初期seedとして登録する。

初期seed候補にはAdvent International、Apollo、Ardian、Audax、Bain Capital、Blackstone、Brookfield、Carlyle、CD&R、CVC、EQT、General Atlantic、GIP、H.I.G.、HarbourVest、Harrison Street、Hines、Insight Partners、KKR、Macquarie、Neuberger Berman、New Mountain Capital、PAI Partners、Partners Group、Permira、Silver Lake、Stonepeak、TPG、Vista Equity Partners、Warburg Pincus等を含める。

### Option Master

登録画面からOptionは追加せず、マスター管理画面で追加、名称変更、並び替え、無効化、再有効化を行う。

Asset Class初期値:

1. PE
2. VC
3. Infrastructure
4. Real Estate
5. PD
6. その他

Equity / Debt初期値:

1. Equity
2. Debt

面談場所初期候補:

- 当社オフィス
- 先方オフィス
- セミナー / カンファレンス
- オンライン
- 会食
- その他

Asset Class、Equity / Debt、面談場所は`Sort_Order`を持ち、マスター管理画面から並び替えできる。GPはSort Orderではなくアルファベット順を自動適用する。

## Backend Spreadsheet baseline

1つのSpreadsheetに以下の5シートを置く。

1. `GP_Master`
2. `Option_Master`
3. `Meeting_Index`
4. `Pitchbook_Index`
5. `Settings`

通常利用者は直接編集しない。行番号や並び順ではなく固定IDで参照する。

### Final column contracts

`GP_Master`

```text
GP_ID, GP_Name, Status, Created_At, Updated_At, Created_By, Updated_By
```

`Option_Master`

```text
Option_ID, Type, Name, Sort_Order, Status, Created_At, Updated_At, Created_By, Updated_By
```

`Meeting_Index`

```text
Meeting_ID, Date, Time, Location_ID, GP_ID, Asset_Class_ID, Capital_Type_ID,
Counterparty, Internal_Participants, Doc_File_ID, Doc_URL, Saved_Filename,
Status, Version, Created_At, Updated_At, Created_By, Updated_By
```

Date / GP_ID / Asset_Class_IDは必須。他の面談入力由来項目は任意を許容する。本文は持たない。

`Pitchbook_Index`

```text
Document_ID, Batch_ID, Date, GP_ID, Asset_Class_ID, Capital_Type_ID, Sequence_No,
File_ID, File_URL, Original_Filename, Saved_Filename, Status,
Created_At, Updated_At, Created_By, Updated_By
```

1ファイル1行。Capital_Type_IDは任意。Original Filename / Saved Filenameの両方を保持する。

`Settings`

```text
Key, Value, Description, Updated_At
```

初期Key候補:

- MEETING_FOLDER_ID
- PITCHBOOK_FOLDER_ID
- NEXT_GP_NO
- NEXT_OPTION_NO
- NEXT_MEETING_NO
- NEXT_DOCUMENT_NO
- NEXT_BATCH_NO
- SCHEMA_VERSION

採番はLockService配下で更新し、一度発行したIDを再利用しない。

## Shared Drive baseline

```text
Private Assets Knowledge
├─ Meeting Records
└─ Pitchbooks
```

サブフォルダは作らずフラットに蓄積する。分類・検索はIndexと将来の検索レイヤーに任せる。

## Not yet planned

以下はまだ詳細を決めていない。

- マスター管理の名称変更 / 無効化等を全利用者へ許可するか、管理者へ限定するか
- ブラウザ更新・タブ終了後まで下書きを保持するか、入力クリア操作をどうするか
- 登録途中で一部処理だけ失敗した場合のロールバック / 再試行 / 二重登録防止
- 大容量ファイルのアップロード方式、対応形式、実用上の上限
- Web Appのexecute-as設定、利用者識別、監査ログ
- GP重複登録時の統合機能
- 検索方式
- AI Q&A
- RAG / Vector DB
- 高度な検索画面
- 自動分類・自動要約
- 実装フェーズ分割
- リリース条件

## Planning rule

次の設計作業では、一度に全体を固めない。利用者の運用が単純であること、実装が容易であること、将来の検索拡張を妨げないことを確認しながら、必要な事項だけ順番に決定する。

旧計画から要件や技術選定を自動的に復活させない。必要なものがあれば、新しい方針の中で改めて採否を判断する。