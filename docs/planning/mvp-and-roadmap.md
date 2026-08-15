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
Gemini Flash
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
- Web App利用者は全員、全Active資料をAI検索できる共通アクセスモデルとする。
- 初期モデルはGemini Flashのみ。利用者向けモデル選択UIは持たせない。
- AI同期は15分おきのApps Script time-driven workerを基本とする。
- AI検索も5年保持の管理者専用監査ログへ記録する。

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

初期版ではモデル選択、Deep Search等の切替UIは置かない。

## Initial source-format whitelist

AI検索対象として初期対応するファイル形式は以下とする。

```text
.pdf
.pptx
.xlsx
.docx
.txt
.eml
```

Outlook保存メールは`.eml`のみ初期対応とし、Shared Driveには元ファイルを保存する。AI indexにはSubject / From / To / Cc / Date / Body等を抽出したUTF-8テキスト表現を登録する。

`.eml`内の添付ファイルは初期版では自動indexしない。検索対象としたい添付ファイルは別資料として登録する。

Outlook `.msg`は初期対応外とする。

## Initial AI retrieval release

まず以下だけを完成させる。

1. MeetingをFile Searchへindex
2. Pitchbook / source materialsをFile Searchへindex
3. 新規 / 更新 / 無効化 / 再有効化をAI indexへ同期
4. 15分間隔のAI sync worker
5. ナレッジ検索画面
6. 自由質問
7. Metadata filter
8. semantic retrieval
9. Gemini Flashによるgrounded answer
10. citation表示
11. 元Drive資料を開く
12. AI index失敗 / retry管理
13. AI query監査

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
AI_SYNC_ENABLED
AI_SYNC_INTERVAL_MINUTES
```

初期方針:

```text
AI_SYNC_INTERVAL_MINUTES = 15
AI_DEFAULT_MODEL = configured Gemini Flash model
```

## AI query audit baseline

Knowledge Searchの実行を既存の5年監査ログ対象に含める。

少なくとも以下を記録する。

- 利用者
- 日時
- 質問本文
- Date From / To
- GP filter
- Asset Class filter
- Equity / Debt filter
- Source Type filter
- 実行したFlash model ID
- Success / Failure
- cited source IDs
- 必要に応じて短いerror情報

Gemini回答全文、retrieved chunk全文、Embedding、原資料本文は監査ログへ複製しない。

## Next implementation decisions / validation

設計として大枠と運用方針は採用済み。実装フェーズで以下を実機確認する。

- 会社承認済みGemini API / Google Cloud projectの利用条件
- credentialの組織承認済み保管方式
- Apps ScriptからのFile Search API接続
- 100MB Pitchbookのresumable upload
- `.pdf / .pptx / .xlsx / .docx / .txt / .eml`各形式の実機index確認
- EMLのheader/body抽出品質
- query / indexing rate limitsと費用管理
- File Search派生データの保持 / 削除運用が会社ルールに適合すること
- 具体的なGemini Flash model IDの選定

上記は現在の保存・Index契約を変更せずに実装時検証で決める。

## Validation gates

Phase 2のリリース条件には最低限以下を含める。

- source-to-index同期の整合
- 15分sync workerの動作
- metadata filterの正確性
- semantic retrievalの妥当性
- citationsとDriveリンクの一致
- source更新時のre-index
- Inactive除外 / Reactivate復帰
- retry idempotency
- 100MB pathの検証
- 対応6形式のindex検証
- EML本文の正しいテキスト化
- Web App全利用者が共通AI検索範囲へアクセスできること
- AI query監査の記録内容と管理者限定閲覧
- Flash固定でモデル選択UIが存在しないこと
- AI障害で正本登録が壊れないこと
- confidential data / credentialsがGitHubや不適切なログへ出ないこと

## Planning rule

既存の蓄積層をAI都合で複雑化しない。AI retrievalは正本の上に独立した派生レイヤーとして載せる。

新しいDB、タグ体系、Agent、Knowledge Graph等を追加する場合は、File Searchで満たせない具体的な要件が確認されてから判断する。
