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

ナレッジ検索画面は以下の5モードを持つTarget UXとする。

```text
自由質問 | 要約 | 時系列 | 比較 | 面談準備
```

- `自由質問`を初期表示とする。
- 5モードは同じFile Search Store、Metadata Filter、semantic retrieval、Gemini Flash、citation / Drive link処理を共有する。
- `要約 / 時系列 / 比較 / 面談準備`は別検索基盤ではなく、同じretrieval layer上のprompt / output templateとして実装する。
- 実装は`自由質問`を先行して安定化し、その後4つのpresetを追加する段階導入を許容する。ただし5モード構成自体は採用済みTarget UXとして扱う。

共通検索条件:

- 日付 From / To
- GP
- Asset Class
- Equity / Debt
- Source Type: Meeting / Pitchbook

すべての任意プルダウンは`未選択`を初期値とする。`未選択`は「その条件で絞らない」というUI状態であり、MasterやFile Search Metadataへ保存しない。

入力欄は、`自由質問`では質問本文、preset modeでは任意の`追加指示`として利用できる。

Presetの基本目的:

- `要約`: 選択範囲の主要テーマ、重要事項、変化点を横断整理する。
- `時系列`: 発言・見方・更新を時系列で整理し、変化 / 継続を示す。
- `比較`: GP、資料、期間、戦略等を共通論点で横比較する。
- `面談準備`: 最近の面談・資料、主要発言、変化、未解決論点、再確認事項、次回質問候補をBrief化する。

すべてのモードでCitationと元Drive資料へのリンクを表示し、根拠不足時は不足を明示する。

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

Knowledge Searchの全5モード実行を既存の5年監査ログ対象に含める。

AI queryでは少なくとも以下を管理者専用監査ログへ記録する。

- User identity
- Event timestamp
- Search mode
- Question / additional instruction text
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

## Initial delivery

First usable release:

1. File Search同期
2. 15分AI sync worker
3. ナレッジ検索画面
4. `自由質問`
5. Metadata Filter
6. Semantic retrieval
7. Gemini Flashによるgrounded answer
8. Citation表示
9. Drive原資料へのリンク
10. AI query監査
11. `.pdf / .pptx / .xlsx / .docx / .txt / .eml`対応

Common retrieval layer安定後に、同じ画面へ`要約 / 時系列 / 比較 / 面談準備`を追加する。

## Rationale

既存の構造化MetadataとGoogle管理のEmbedding検索を組み合わせることで、保存基盤を複雑化せずに意味検索と出典付きAI回答を実現できる。独自Vector DBやタグ体系を保守する必要を初期段階で持ち込まず、全利用者共通アクセス、Flash単一モデル、15分同期という単純な運用から開始する。

5モードを同じretrieval layer上のprompt / output templateとして扱うことで、自由度と定型業務の使いやすさを両立しつつ、検索基盤の重複実装を避ける。

## Detailed design

`docs/ai/gemini-file-search.md`
