# Target Architecture

## Status

本書は2026-08-15時点で採用している全体アーキテクチャを示す。

2026-08-14以前の旧計画は現行方針として扱わない。蓄積・修正基盤はGoogle Workspace中心のシンプルな構成を維持し、その上にGemini API / File Searchを検索・要約レイヤーとして追加する。

詳細契約:

- Product / UX: `docs/product/vision.md`
- Planning / delivery: `docs/planning/mvp-and-roadmap.md`
- Runtime / operations: `docs/operations/runtime-policy.md`
- Gemini retrieval: `docs/ai/gemini-file-search.md`
- Security: `docs/governance/security.md`

## Architecture overview

```text
Multiple authorized users
  A / B / C ...
        |
        | same shared URL
        v
Apps Script HTML Service Web App
  ├─ Meeting: New / Past Records
  ├─ Pitchbook: New / Past Files
  ├─ Knowledge Search
  │    └─ 自由質問 / 要約 / 時系列 / 比較 / 面談準備
  └─ Master Management
            |
            v
Google Apps Script
  ├─ browser state / validation
  ├─ Meeting Docs generation / update
  ├─ source upload / rename / numbering
  ├─ master / index maintenance
  ├─ concurrency control
  ├─ audit events
  └─ Gemini File Search sync / query
            |
      +-----+----------------------------------+
      |                                        |
      v                                        v
Google Sheets                            Google Shared Drive
  ├─ GP_Master                             ├─ Meeting Records
  ├─ Option_Master                         └─ Pitchbooks
  ├─ Meeting_Index                              |
  ├─ Pitchbook_Index                            | derived AI index
  └─ Settings                                   v
                                          Gemini File Search Store
                                          ├─ Documents / Chunks
                                          ├─ managed Embeddings
                                          └─ Custom Metadata
                                                   |
                                                   v
                                          configured Gemini Flash
                                                   |
                                                   v
                                        grounded output + citations

Separate admin-only Audit Spreadsheet
```

## Responsibility boundaries

### Apps Script HTML Service Web App

通常利用者が操作する共通UI。利用者ごとにWeb AppやSpreadsheetをコピーしない。

主要画面:

1. `面談記録` — 新規登録 / 過去記録
2. `Pitchbook` — 新規登録 / 過去資料
3. `ナレッジ検索`
4. `マスター管理`

通常利用者にはbackend Spreadsheet、Audit Spreadsheet、File Search Storeを直接操作させない。

### Google Shared Drive

実データの正本を保管する。

```text
Private Assets Knowledge
├─ Meeting Records
└─ Pitchbooks
```

年、GP、Asset Class等のサブフォルダを作らずフラットに蓄積する。

- Meeting: Google Docsが本文の正本。
- Pitchbook / source materials: Shared Drive上の原ファイルが正本。
- Gemini File Searchは派生インデックスであり正本ではない。

### Backend Spreadsheet

1つのSpreadsheetを小さなdatabase / indexとして使用する。

1. `GP_Master`
2. `Option_Master`
3. `Meeting_Index`
4. `Pitchbook_Index`
5. `Settings`

行番号や表示順を永続識別子として使用しない。

### Audit Spreadsheet

既存5-sheet backendとは分離した管理者専用Spreadsheetへ監査ログを保存する。5年間保持し、通常利用者には閲覧させない。

## Shared registration context

MeetingとPitchbook登録で以下を利用者ブラウザ内の共通状態として扱う。

- 日付
- GP
- Asset Class
- Equity / Debt

一方の画面で変更した値はもう一方へ反映する。

- サイドバー画面切替では消さない。
- 登録成功後も共通4項目は保持する。
- 登録成功時はページ固有入力だけをクリアする。
- 面談時間はMeeting固有項目とする。
- テキスト・選択値の下書きは同一ブラウザで24時間保持する。
- 再読込 / タブ終了後の選択ファイル本体は復元しない。

## Meeting records

Required:

- Date
- GP
- Asset Class

Optional:

- Time
- Location
- Equity / Debt
- Counterparty
- Internal Participants
- Meeting Notes

面談内容は自由記載とする。長文入力欄は縦スクロール、文字折り返し、改行保持を行う。

Apps Scriptが軽量なGoogle Docsを生成し、入力済み項目だけを`項目: 値`形式でコンパクトにミラーする。本文はDocsだけを正本とする。

固定Meeting ID:

```text
MTG-000123
```

基本命名:

```text
YYYY-MM-DD_GP_AssetClass_Equity-or-Debt_MTG-XXXXXX
```

- Timeはファイル名に含めない。
- Equity / Debt未選択時はその要素を省略する。
- Metadata変更後もMeeting IDは維持する。

## Pitchbooks / source materials

Registration:

- drag & drop / file picker
- multiple files
- file, Date, GP, Asset Class required
- Equity / Debt optional
- 1ファイル100MBまで
- 1回最大10ファイル
- 1回合計500MBまで

基本命名:

```text
YYYY-MM-DD_GP_AssetClass_Equity-or-Debt_Sequence.ext
```

Equity / Debt未選択時:

```text
YYYY-MM-DD_GP_AssetClass_Sequence.ext
```

- 1件目から`01`等の連番を付ける。
- 後日追加は同一コンテキストの既存最大番号の次を使う。
- Metadata変更で別コンテキストへ移動した場合は移動先最大番号の次を使う。
- 旧コンテキストの欠番は詰め直さない。
- `/`、`&`等は保存名生成時に除去 / 正規化する。
- 元拡張子を維持する。

Initial AI-searchable source extensions:

```text
.pdf
.pptx
.xlsx
.docx
.txt
.eml
```

`.eml`はShared Driveへ原本保存し、File SearchにはSubject / From / To / Cc / Date / Body等を抽出したUTF-8テキストをindexする。内包添付は自動indexせず、必要な添付は別資料として登録する。`.msg`は初期対応外とする。

## Past records and corrections

Meeting / Pitchbookとも過去記録を検索・編集できる。

Optional filters:

- Date From / To
- GP
- Asset Class
- Equity / Debt
- Status

検索用プルダウンは`未選択`を初期値とし、`未選択`はfilterを適用しないUI状態とする。Masterやsource Metadataへ保存しない。

### Meeting update

- same Meeting ID
- same Google Doc
- Metadata / Docs body / Index / relevant filenameを同期更新
- Version / Updated Atでstale saveを拒否

### Pitchbook update

- same Document ID
- same Drive File ID
- Metadata / Index / relevant filenameを同期更新
- 別命名コンテキストへ変更する場合は移動先の次連番を採番

通常利用者向け物理削除は行わず、Active / Inactive / Reactivateを使用する。

## Masters

### GP Master

- immutable GP ID
- mutable GP Name
- Active / Inactive
- GP表示は常にアルファベット順
- manual Sort Orderなし
- Meeting / Pitchbook画面から未登録GPをquick-add可能
- 前後空白 / case-insensitive exact duplicate check

### Option Master

Types:

- `LOCATION`
- `ASSET_CLASS`
- `CAPITAL_TYPE`

Option fields include immutable Option ID, Name, Sort Order, Active / Inactive.

Asset Class initial values:

1. PE
2. VC
3. Infrastructure
4. Real Estate
5. PD
6. その他

Equity / Debt initial values:

1. Equity
2. Debt

Meeting location initial candidates:

- 当社オフィス
- 先方オフィス
- セミナー / カンファレンス
- オンライン
- 会食
- その他

全利用者がMasterの追加、名称変更、並び替え、無効化、再有効化を実行できる。名称変更 / 無効化には確認を入れ、監査ログへ記録する。通常操作で物理削除しない。

## Backend data contracts

### `GP_Master`

```text
GP_ID, GP_Name, Status, Created_At, Updated_At, Created_By, Updated_By
```

### `Option_Master`

```text
Option_ID, Type, Name, Sort_Order, Status, Created_At, Updated_At, Created_By, Updated_By
```

### `Meeting_Index`

```text
Meeting_ID, Date, Time, Location_ID, GP_ID, Asset_Class_ID, Capital_Type_ID,
Counterparty, Internal_Participants, Doc_File_ID, Doc_URL, Saved_Filename,
Status, Version, Created_At, Updated_At, Created_By, Updated_By,
AI_Document_Name, AI_Index_Status, AI_Indexed_At, AI_Content_Hash, AI_Last_Error
```

### `Pitchbook_Index`

```text
Document_ID, Batch_ID, Date, GP_ID, Asset_Class_ID, Capital_Type_ID, Sequence_No,
File_ID, File_URL, Original_Filename, Saved_Filename, Status,
Created_At, Updated_At, Created_By, Updated_By,
AI_Document_Name, AI_Index_Status, AI_Indexed_At, AI_Content_Hash, AI_Last_Error
```

### `Settings`

```text
Key, Value, Description, Updated_At
```

Settings contains system references / counters / schema / admin / audit / Gemini configuration. Credentials are not stored in user-facing Sheets.

AI index states:

```text
NotIndexed
Pending
Indexed
Failed
```

## Multi-user concurrency

1つのWeb Appを複数人で同時利用する。

LockServiceは以下の短い共有書込み区間だけに使用する。

- master writes
- Meeting / Document / Batch ID issuance
- Pitchbook sequence allocation
- consistency-sensitive Index writes

ファイルアップロード、Docs生成、Gemini indexing全体を長時間ロックしない。

同一Meetingの同時編集はVersion / Updated Atによるoptimistic lockingで古い保存を拒否する。

## Partial failure and retry

Pitchbook / source-material batchはファイル単位で処理する。

- success filesは維持する。
- failed filesだけ再試行する。
- same Batch ID / Document ID / reserved sequenceを使う。
- retry前にDrive / Indexの既存状態を確認する。
- duplicate Drive file / duplicate Index rowを作らない。
- sequence gapsを詰め直さない。

## Gemini File Search retrieval layer

### File Search Store

初期は`Private Assets Knowledge`に相当する1 Storeだけを使用する。

- GP / year / Asset ClassごとにStoreを分けない。
- exact filteringはCustom Metadataを使う。
- File Searchにchunking / Embedding / vector storage / semantic retrievalを任せる。
- 独自Vector DB / embedding pipeline / tag taxonomy / Knowledge Graphを初期実装に含めない。

Initial File Search Metadata:

```text
source_type
source_id
date_key
gp_id
gp_name
asset_class_id
asset_class_name
capital_type_id
capital_type_name
drive_url
saved_filename
```

任意項目が未選択なら該当Metadataを省略する。

### AI access boundary

Web App利用権限を初期AI検索の共通アクセス境界とする。

- Web App利用者は全員Knowledge Searchを利用できる。
- 全利用者が全Active indexed sourceを検索可能。
- 利用者別 / GP別 / source別retrieval ACLは初期版に含めない。
- Audit閲覧は別権限で管理者だけに限定する。

### AI model

初期は設定されたGemini Flash 1モデルだけを使用する。利用者向けモデル選択 / Deep modeは設けない。具体的model IDは`Settings`の`AI_DEFAULT_MODEL`で管理する。

### AI synchronization

正本登録 / 更新を先に完了し、AI indexingを非同期の派生処理として扱う。

```text
Authoritative save
      |
      v
AI_Index_Status = Pending
      |
      v
15-minute Apps Script worker
      |
      +--> Indexed
      └--> Failed -> retry when retryable
```

- 15分おきのtime-driven workerを使用する。
- retryはstable source ID / File Search Document referenceを使いidempotentにする。
- unsupported / permanent failureを無限retryしない。
- 100MB File Search uploadはresumable / chunked transportを使用する。
- Apps Scriptで100MB経路が安定しない場合はAI-index transportだけを組織承認済みGoogle Cloud runtimeへ切り出せる。Web App / Shared Drive / Index contractsは維持する。
- Inactive化は対応File Search Documentを削除する。
- Reactivate時は現在の正本をre-indexする。

## Knowledge Search target UX

採用済みTarget UX:

```text
自由質問 | 要約 | 時系列 | 比較 | 面談準備
```

`自由質問`をdefault modeとする。

Shared filters:

- Date From / To
- GP
- Asset Class
- Equity / Debt
- Source Type: Meeting / Pitchbook

5モードは同じretrieval layerを共有する。

```text
Mode + question / additional instruction
        |
        +--> Metadata Filters
        |
        v
Gemini File Search semantic retrieval
        |
        v
Relevant chunks
        |
        v
Configured Gemini Flash
        |
        v
Mode-specific prompt / output template
        |
        v
Grounded output + citations + Drive links
```

Mode contracts:

- `自由質問`: 任意質問へ根拠付きで回答。
- `要約`: 選択範囲をテーマ横断で統合要約。
- `時系列`: 発言 / 見方 / 更新を時系列で整理し変化と継続を示す。
- `比較`: GP / source / period / strategy等を共通軸で比較。
- `面談準備`: 最近の情報、変化、未解決論点、再確認事項、次回質問候補をBrief化。

preset modeでは同じ入力領域を任意の`追加指示`として使用できる。

すべてのモードでCitationとDrive linkを表示し、根拠不足時は不足を明示する。

実装は`自由質問`を先行して共通retrieval layerを安定化し、その後4 presetを同じ画面へ追加してよい。5モード構成自体は採用済みであり未決定ではない。

## Audit

監査ログは5年間保持し、管理者だけが閲覧できる。

対象:

- Meeting registration / update / deactivate / reactivate
- Pitchbook registration / retry / metadata update / deactivate / reactivate / failure
- Master add / rename / reorder / deactivate / reactivate
- AI index / re-index / delete / retry / failure
- Knowledge Search across all five modes

AI query audit includes at least:

- user
- timestamp
- search mode
- question / additional instruction
- filters
- configured Flash model ID
- Success / Failure
- cited source IDs

Gemini回答全文、retrieved chunk全文、Embedding、原資料本文は監査ログへ複製しない。

## Production identity and credentials

- 本番では登録・変更・AI検索を行った実利用者を識別できることを必須とする。
- 組織管理下のデプロイ主体としてbackend権限を集約する方式を第一選択とする。
- 利用者識別が安定しない場合はaccess-user execution等の組織承認済み代替方式へ切り替える。
- 個人所有のdeployment / credentialへ恒久依存しない。
- Gemini API credentialをGitHub、client HTML、user-facing Sheets、source documentsへ保存しない。

## Implementation boundary

現在はplanning phaseでありruntime実装・deployment・production operationは未開始。

確定済み設計と実装時検証を混同しない。会社環境やAPI挙動の検証が必要でも、そのことだけを理由に採用済み仕様を「未決定」と扱わない。

実装時のgenuine remaining choicesとvalidation gatesは`docs/planning/mvp-and-roadmap.md`を参照する。
