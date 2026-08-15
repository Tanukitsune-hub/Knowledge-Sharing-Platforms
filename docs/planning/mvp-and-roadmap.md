# Planning Baseline

## Status

従来のMVPとロードマップは2026-08-14に破棄した。本書は現在の確定事項と、次に詰めるべき実装論点を記録する。

蓄積・呼び出し・修正・運用管理の基本設計は概ねfreeze可能な状態まで確定した。次の開発フェーズとして、Gemini API / File Searchによるナレッジ検索・要約レイヤーを採用する。

## Phase 1 — Accumulation and maintenance

採用済み:

- 1つのApps Script HTML Service Web Appを複数人で利用
- 面談の新規登録 / 過去検索 / 編集 / 無効化 / 再有効化
- Pitchbookの複数アップロード / 過去検索 / 編集 / 無効化 / 再有効化
- GP Master / Option Master
- Shared Driveを正本とする
- 5-sheet backend
- Meeting ID / Document ID / Batch ID
- 自動命名 / 継続連番
- 24時間下書き
- 100MB / file、10 files / batch、500MB / batch
- 部分失敗再試行
- 5年監査ログ

詳細:

- `docs/architecture/target-architecture.md`
- `docs/operations/runtime-policy.md`

## Phase 2 — Gemini knowledge retrieval

Status: Accepted design, implementation not started.

Gemini File Searchをホスト型RAG / semantic retrieval layerとして採用する。

### Core design

```text
Shared Drive authoritative records
        |
        | derived index
        v
Gemini File Search Store
        |
        | metadata filter + semantic retrieval
        v
Gemini API
        |
        v
Knowledge Search UI
        |
        v
answer + citations + Drive links
```

### Accepted principles

- Shared Driveは正本のまま維持する。
- File Search Storeは再生成可能な派生AIインデックスとする。
- 初期は1 Storeのみ使用する。
- Gemini File Searchにchunking / embedding / vector retrievalを任せる。
- 独自Vector DBを初期実装に入れない。
- 自動キーワード/タグ体系を初期実装に入れない。
- exact classificationはCustom Metadata、意味検索はEmbeddingで行う。
- File SearchからのcitationをDrive原資料へ接続する。
- AI index障害で正本登録をロールバックしない。
- Inactive資料は通常AI検索から除外する。

詳細正本: `docs/ai/gemini-file-search.md`

## Knowledge Search UI baseline

サイドバーに`ナレッジ検索`ページを追加する。

初期入力:

- 自由質問
- 日付 From / To
- GP
- Asset Class
- Equity / Debt
- Source Type: Meeting / Pitchbook

すべての検索用プルダウンは`未選択`を初期表示する。

`未選択`は検索条件を適用しないUI状態であり、MasterまたはFile Search Metadataには保存しない。

## Initial AI retrieval release

まず以下だけを完成させる。

1. MeetingをFile Searchへindex
2. PitchbookをFile Searchへindex
3. 新規 / 更新 / 無効化 / 再有効化をAI indexへ同期
4. ナレッジ検索画面
5. 自由質問
6. Metadata filter
7. semantic retrieval
8. grounded answer
9. citation表示
10. 元Drive資料を開く
11. AI index失敗 / retry管理

## Later output modes

初期検索が安定した後、同じretrieval layerを利用して以下を追加できる。

- 要約
- 時系列整理
- GP比較 / 資料比較
- 面談準備

これらは別検索基盤を作らず、prompt / structured output templateとして実装する。

## Index changes for Phase 2

`Meeting_Index` / `Pitchbook_Index`へ追加:

```text
AI_Document_Name
AI_Index_Status
AI_Indexed_At
AI_Content_Hash
AI_Last_Error
```

状態:

`NotIndexed / Pending / Indexed / Failed`

`Settings`へ追加候補:

```text
GEMINI_FILE_SEARCH_STORE_NAME
AI_DEFAULT_MODEL
AI_DEEP_MODEL
AI_SYNC_ENABLED
AI_EMBEDDING_MODEL
```

## Next implementation decisions / validation

設計として大枠は採用済み。実装フェーズで以下を実機確認する。

- 会社承認済みGemini API / Google Cloud projectの利用条件
- credentialの組織承認済み保管方式
- Apps ScriptからのFile Search API接続
- 100MB Pitchbookのresumable upload
- File Search対応拡張子の実用ホワイトリスト
- sync worker / retry cadence
- query / indexing rate limitsと費用管理
- 利用者アクセス権とFile Searchの派生データ保持ルール
- AI query監査を既存監査ログへどこまで記録するか
- default / deep modelの実機選定

上記は現在の保存・Index契約を変更せずに実装時検証で決める。

## Validation gates

Phase 2のリリース条件には最低限以下を含める。

- source-to-index同期の整合
- metadata filterの正確性
- semantic retrievalの妥当性
- citationsとDriveリンクの一致
- source更新時のre-index
- Inactive除外 / Reactivate復帰
- retry idempotency
- 100MB pathの検証
- AI障害で正本登録が壊れないこと
- confidential data / credentialsがGitHubや不適切なログへ出ないこと

## Planning rule

既存の蓄積層をAI都合で複雑化しない。AI retrievalは正本の上に独立した派生レイヤーとして載せる。

新しいDB、タグ体系、Agent、Knowledge Graph等を追加する場合は、File Searchで満たせない具体的な要件が確認されてから判断する。
