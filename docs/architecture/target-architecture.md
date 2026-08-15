# Target Architecture

## Status

本書は2026-08-15時点で採用している全体アーキテクチャを示す。

2026-08-14以前の旧計画は現行方針として扱わない。蓄積・修正基盤はGoogle Workspace中心のシンプルな構成を維持し、その上にGemini API / File Searchを検索・要約レイヤーとして追加する。

検索・AIの詳細契約は`docs/ai/gemini-file-search.md`、実運用ルールは`docs/operations/runtime-policy.md`を参照する。

## Architecture overview

```text
Multiple users
  A / B / C ...
        |
        | shared URL
        v
Apps Script HTML Service Web App
  ├─ Meeting: New / Past Records
  ├─ Pitchbook: New / Past Files
  ├─ Knowledge Search
  └─ Master Management
            |
            v
Google Apps Script
  ├─ UI state / validation
  ├─ Meeting Docs generation / update
  ├─ Pitchbook upload / rename / numbering
  ├─ master / index maintenance
  ├─ concurrency control
  └─ Gemini File Search sync / query
            |
      +-----+------------------------------+
      |                                    |
      v                                    v
Google Sheets                        Google Shared Drive
  ├─ GP_Master                         ├─ Meeting Records
  ├─ Option_Master                     └─ Pitchbooks
  ├─ Meeting_Index                           |
  ├─ Pitchbook_Index                         | derived AI index
  └─ Settings                                v
                                      Gemini File Search Store
                                      ├─ Documents / Chunks
                                      ├─ managed Embeddings
                                      └─ Custom Metadata
                                               |
                                               v
                                           Gemini API
                                               |
                                               v
                                    grounded answer + citations
```

## Responsibility boundaries

### Apps Script Web App

通常利用者が操作する唯一のUIとする。通常利用者にはバックエンドSpreadsheetを直接編集させない。

主要画面:

1. 面談記録: 新規登録 / 過去記録
2. Pitchbook: 新規登録 / 過去資料
3. ナレッジ検索
4. マスター管理

### Google Shared Drive

正本を保管する。

```text
Private Assets Knowledge
├─ Meeting Records
└─ Pitchbooks
```

年、GP、Asset Class等のサブフォルダを作らずフラットに蓄積する。

Shared Drive上のGoogle Docs / Pitchbookが権威ある原資料であり、Gemini File Searchはその派生インデックスとする。

### Backend Spreadsheet

1つのSpreadsheetに以下を保持する。

- `GP_Master`
- `Option_Master`
- `Meeting_Index`
- `Pitchbook_Index`
- `Settings`

行番号や並び順ではなく固定IDで参照する。

面談本文は`Meeting_Index`へ全文を重複保存せずGoogle Docsを正本とする。PitchbookもShared Drive上の原ファイルを正本とする。

## Shared registration context

面談とPitchbookで以下を利用者ブラウザ内の共通コンテキストとして扱う。

- 日付
- GP
- Asset Class
- Equity / Debt

サイドバーで画面を切り替えても保持し、一方で変更した値を他方へ反映する。面談時間は面談固有項目とする。

## Meeting records

必須:

- 日付
- GP
- Asset Class

任意:

- 時間
- 面談場所
- Equity / Debt
- 面談相手
- 当社側
- 面談内容

Google Docsは入力済み項目だけを`項目: 値`形式でコンパクトにミラーし、本文の改行を保持する。

固定Meeting IDを発行する。

```text
MTG-000123
```

Docs基本命名:

```text
YYYY-MM-DD_GP_AssetClass_Equity-or-Debt_MTG-XXXXXX
```

Equity / Debtが未選択の場合はその要素を省略する。Meeting IDは後から表示項目を変更しても変えない。

## Pitchbooks

- ドラッグ＆ドロップ / ファイル選択
- 複数ファイル一括登録
- 1ファイル100MBまで
- 1回最大10ファイル、合計500MBまで
- ファイル、日付、GP、Asset Classは必須
- Equity / Debtは任意

基本命名:

```text
YYYY-MM-DD_GP_AssetClass_Equity-or-Debt_Sequence.ext
```

Equity / Debt未選択時:

```text
YYYY-MM-DD_GP_AssetClass_Sequence.ext
```

1件目から`01`等の連番を付け、同一登録コンテキストへの後日追加は既存最大番号の次を使う。`/`、`&`等の不要な記号は保存名生成時に除去する。

## Past records and logical deletion

面談・Pitchbookとも過去記録を検索・編集できる。

検索条件はすべて任意:

- 日付 From / To
- GP
- Asset Class
- Equity / Debt
- Status

固定Meeting ID / Document ID / Drive File IDを維持したままメタデータと必要な保存名を同期更新する。

通常操作では物理削除せずActive / Inactiveを使用し、再有効化可能とする。

## Masters

### GP Master

- immutable GP ID
- mutable GP Name
- Active / Inactive
- 選択肢は常にアルファベット順
- 面談 / Pitchbook画面から未登録GPをクイック追加可能
- 追加、名称変更、無効化、再有効化は全利用者に許可

### Option Master

Typeで以下を管理する。

- LOCATION
- ASSET_CLASS
- CAPITAL_TYPE

Optionには固定Option ID、表示名、Sort Order、Active / Inactiveを持たせる。

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

面談場所は詳細住所ではなく、当社オフィス、先方オフィス、セミナー / カンファレンス、オンライン、会食、その他等の簡易カテゴリとする。

## Multi-user concurrency

1つの組織管理下Web Appを複数人で同時利用する。

LockServiceは以下の短い共有書込み区間だけに使用する。

- master追加・更新
- Meeting / Document / Batch ID採番
- Pitchbook連番確定
- 整合性が必要なIndex更新

同一面談の同時編集はVersion / Updated Atで競合検知し、古い保存を拒否する。

詳細は`docs/operations/runtime-policy.md`。

# AI retrieval layer

## Adopted technology

Gemini APIのFile Searchを採用する。

File Search StoreはGoogle側がDocumentをchunk化し、Embeddingを作成・保持し、semantic searchを提供するホスト型RAGインデックスとして利用する。

初期実装では独自Vector DB、独自Embedding pipeline、自動キーワードタグ体系を作らない。

## One Store first

初期は`Private Assets Knowledge`に相当する1つのFile Search Storeを使用する。

GP / Asset Class / 年等でStoreを分割しない。Exact filterはCustom Metadataで行う。

容量やretrieval latencyに実測上の問題が出た場合のみStore分割を検討する。

## Source synchronization

### Meeting

Google Docs本文をApps Scriptで読み取り、検索用の軽量テキストDocumentとしてFile Searchへ同期する。

### Pitchbook

File Search対応形式は原ファイルを同期する。100MBまでの大容量ファイルはresumable uploadを使う。

AI同期は正本登録と分離する。AI indexingの失敗を理由に正本登録をロールバックしない。

## File Search metadata

初期Metadata:

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

任意項目が未選択の場合は該当Metadataを省略する。

## Knowledge Search UI

サイドバーに`ナレッジ検索`を追加する。

初期項目:

- 自由質問
- 日付 From / To
- GP
- Asset Class
- Equity / Debt
- Source Type: Meeting / Pitchbook

すべてのプルダウンはUI上の`未選択`を初期値とする。

`未選択`は「この条件で絞り込まない」というUI状態であり、MasterやFile Search Metadataへ保存しない。

## Query flow

```text
Question
   +--> selected UI filters -> File Search metadata_filter
   |
   v
File Search semantic retrieval
   |
   v
relevant chunks
   |
   v
Gemini synthesis
   |
   v
answer + citations + Drive links
```

正確な分類はMetadataで絞り、曖昧な意味検索はEmbeddingに任せる。

## Citations

Gemini File Searchのfile citationとCustom Metadataを利用して、回答に以下を表示する。

- source type
- source ID
- saved filename / meeting label
- Drive link

利用者はAI回答から必ず元のShared Drive資料へ戻れるようにする。

## AI indexing state

`Meeting_Index`と`Pitchbook_Index`へ以下を追加する。

```text
AI_Document_Name
AI_Index_Status
AI_Indexed_At
AI_Content_Hash
AI_Last_Error
```

状態:

```text
NotIndexed
Pending
Indexed
Failed
```

新規・更新時はPendingからindexし、失敗時はFailedとして再試行可能にする。

Inactive化時はFile Search Documentを削除し、再有効化時は再indexする。

## AI settings

`Settings`に少なくとも以下を追加する。

```text
GEMINI_FILE_SEARCH_STORE_NAME
AI_DEFAULT_MODEL
AI_DEEP_MODEL
AI_SYNC_ENABLED
AI_EMBEDDING_MODEL
```

モデル名をビジネスロジックへ固定しない。

APIキー等のcredentialはGitHub、ユーザー向けSheet、原資料へ保存しない。

## Initial AI feature scope

初期リリース:

1. File Search同期
2. ナレッジ検索画面
3. 自由質問
4. Metadata filter
5. grounded answer
6. citations
7. Drive原資料を開く

後続拡張として同じretrieval layer上に、要約、時系列整理、比較、面談準備等のpreset output modeを追加できる。

## Validation

AIリリース前に少なくとも以下を確認する。

- Meeting / Pitchbookのindexと検索
- metadata filter
- `未選択`がfilterを掛けないこと
- Citationから正しいDrive原資料へ戻れること
- source更新時の再index
- Inactiveの除外 / Reactivateの復元
- AI indexing失敗が正本登録を壊さないこと
- retryで重複Documentを作らないこと
- 100MBファイルのresumable uploadまたは検証済みfallback
- credential / confidential dataの不適切な露出がないこと

## Detailed references

- AI retrieval: `docs/ai/gemini-file-search.md`
- Runtime: `docs/operations/runtime-policy.md`
- Planning: `docs/planning/mvp-and-roadmap.md`
- Security: `docs/governance/security.md`
