# Gemini File Search Retrieval Decision

Date: 2026-08-15

Status: Accepted

## Decision

蓄積済みのMeeting RecordsとPitchbooksを横断して情報を検索・整理・要約するAIレイヤーとしてGemini API File Searchを採用する。

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

## AI synchronization

- 正本登録を先に完了させ、AI index同期を派生処理として扱う。
- 新規 / 更新 / 無効化 / 再有効化をFile Searchへ同期する。
- Inactive資料は通常AI検索に含めない。
- AI indexing失敗で正本登録をロールバックしない。
- retryは固定source IDとAI Document参照を使ってidempotentにする。

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

## Initial release

1. File Search同期
2. ナレッジ検索画面
3. Metadata Filter
4. Semantic retrieval
5. Geminiによるgrounded answer
6. Citation表示
7. Drive原資料へのリンク

要約、時系列、比較、面談準備は同じretrieval layer上の後続preset output modeとする。

## Rationale

既存の構造化MetadataとGoogle管理のEmbedding検索を組み合わせることで、保存基盤を複雑化せずに意味検索と出典付きAI回答を実現できる。独自Vector DBやタグ体系を保守する必要を初期段階で持ち込まない。

## Detailed design

`docs/ai/gemini-file-search.md`
