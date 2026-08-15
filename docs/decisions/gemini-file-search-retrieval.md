# Gemini File Search Retrieval Decision

Date: 2026-08-15

Status: Accepted

## Decision

蓄積済みのMeeting RecordsとPitchbooks / source materialsを横断して情報を検索・整理・要約するAIレイヤーとしてGemini API File Searchを採用する。

## Accepted architecture

- Shared Driveを正本として維持する。
- Gemini File Search Storeを再生成可能な派生検索インデックスとして利用する。
- 初期は1つのFile Search StoreへMeeting / Pitchbookを統合する。
- File Searchにchunking、Embedding、semantic retrievalを任せる。
- 正確な分類・絞り込みはCustom Metadataを利用する。
- 独自Vector DB、独自Embedding pipeline、自動キーワード/タグ体系は初期実装に含めない。
- File Search CitationとCustom Metadataを用いてAI回答から元のDrive資料へ戻れるようにする。

## Knowledge Search UI

検索画面には以下を置く。

- 自由質問
- 日付 From / To
- GP
- Asset Class
- Equity / Debt
- Source Type: Meeting / Pitchbook

すべての任意プルダウンは`未選択`を初期値とする。`未選択`は「その条件で絞らない」というUI状態であり、MasterやFile Search Metadataへ保存しない。

初期版では利用者向けモデル選択やDeep modeを置かない。

## Access model

- Web App利用者は全員Knowledge Searchを利用できる。
- 初期版では全利用者がFile Search Store内のすべてのActive Meeting / Pitchbook / source materialを検索できる。
- 利用者別、GP別、ファイル別のretrieval ACLは初期実装に含めない。
- 監査ログ閲覧は従来どおり管理者だけに限定する。

## AI model

- 初期版はGemini Flash系モデル1つだけを使用する。
- ユーザーがモデルを選ぶUIは設けない。
- 具体的なFlash model IDは`Settings`の`AI_DEFAULT_MODEL`で管理し、コードへ固定しない。

## AI synchronization

- 正本登録を先に完了させ、AI index同期を派生処理として扱う。
- 登録 / 更新時はAI状態を`Pending`とし、利用者操作をGemini同期完了まで待たせない。
- Apps Scriptのtime-driven workerを15分おきに実行する。
- 新規 / 更新 / 無効化 / 再有効化をFile Searchへ同期する。
- Inactive資料は通常AI検索に含めない。
- AI indexing失敗で正本登録をロールバックしない。
- retryは固定source IDとAI Document参照を使ってidempotentにする。
- 非対応形式や恒久エラーを無限に再試行しない。

## Supported source formats

初期AI検索対象:

```text
.pdf
.pptx
.xlsx
.docx
.txt
.eml
```

Outlook保存メールは`.eml`のみ初期対応する。Shared Driveには`.eml`原本を保存し、AI indexにはSubject / From / To / Cc / Date / Body等を抽出したUTF-8テキスト表現を登録する。

`.eml`内の添付ファイルは初期版では自動indexしない。検索対象としたい添付は別資料として登録する。

Outlook `.msg`は初期対応外とする。

## AI query audit

Knowledge Searchの実行を既存の5年監査ログ対象に含める。

AI queryでは少なくとも以下を管理者専用監査ログへ記録する。

- User identity
- Event timestamp
- Question text
- Date From / To
- GP / Asset Class / Equity-Debt / Source Type filters
- Configured Flash model ID
- Success / Failure
- Cited source IDs when available
- Short error information when applicable

Gemini回答全文、retrieved chunk全文、Embedding、原資料本文は監査ログへ複製しない。

## Index extension

`Meeting_Index`と`Pitchbook_Index`へ以下を追加する。

```text
AI_Document_Name
AI_Index_Status
AI_Indexed_At
AI_Content_Hash
AI_Last_Error
```

状態は`NotIndexed / Pending / Indexed / Failed`とする。

`Settings`には少なくとも以下を追加できる。

```text
GEMINI_FILE_SEARCH_STORE_NAME
AI_DEFAULT_MODEL
AI_SYNC_ENABLED
AI_SYNC_INTERVAL_MINUTES
```

初期同期間隔は15分とする。

## Initial release

1. File Search同期
2. 15分AI sync worker
3. ナレッジ検索画面
4. Metadata Filter
5. Semantic retrieval
6. Gemini Flashによるgrounded answer
7. Citation表示
8. Drive原資料へのリンク
9. AI query監査
10. `.pdf / .pptx / .xlsx / .docx / .txt / .eml`対応

要約、時系列、比較、面談準備は同じretrieval layer上の後続preset output modeとする。

## Rationale

既存の構造化MetadataとGoogle管理のEmbedding検索を組み合わせることで、保存基盤を複雑化せずに意味検索と出典付きAI回答を実現できる。独自Vector DBやタグ体系を保守する必要を初期段階で持ち込まず、全利用者共通アクセス、Flash単一モデル、15分同期という単純な運用から開始する。

## Detailed design

`docs/ai/gemini-file-search.md`
