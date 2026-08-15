# Planning Baseline

## Status

従来のMVPとロードマップは2026-08-14に破棄した。本書は、現在の採用済み設計、実装順序、実機検証が必要な事項、そして本当に未決定の事項を分けて記録する。

蓄積・呼び出し・修正・運用管理の基本設計と、Gemini API / File Searchによるナレッジ検索アーキテクチャは採用済み。以降、採用済み事項を「未決定」として再度検討しない。

## Phase 1 — Accumulation and maintenance

Status: Accepted design, implementation not started.

採用済み:

- 1つのApps Script HTML Service Web Appを複数人で利用
- 面談の新規登録 / 過去検索 / 編集 / 無効化 / 再有効化
- Pitchbook / source materialsの複数アップロード / 過去検索 / 編集 / 無効化 / 再有効化
- GP Master / Option Master
- Shared Driveを正本とする
- 5-sheet backend
- Meeting ID / Document ID / Batch ID
- 自動命名 / 継続連番
- 24時間下書き
- 1ファイル100MB、1回最大10ファイル、合計500MB
- 部分失敗時に成功分を維持し、失敗分だけidempotent retry
- 全利用者によるマスター変更
- 5年監査ログ、管理者のみ閲覧
- 本番での実利用者識別を必須条件とする

詳細:

- `docs/architecture/target-architecture.md`
- `docs/operations/runtime-policy.md`

## Phase 2 — Gemini knowledge retrieval

Status: Accepted design, implementation not started.

Gemini File Searchをホスト型RAG / semantic retrieval layerとして採用する。

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

### Accepted retrieval principles

- Shared Driveは正本のまま維持する。
- File Search Storeは再生成可能な派生AIインデックスとする。
- 初期は1 Storeのみ使用する。
- Gemini File Searchにchunking / embedding / vector retrievalを任せる。
- 独自Vector DB、独自Embedding pipeline、自動キーワード/タグ体系、Knowledge Graphを初期実装に入れない。
- exact classificationはCustom Metadata、意味検索はEmbeddingで行う。
- File Search citationをDrive原資料へ接続する。
- AI index障害で正本登録をロールバックしない。
- Inactive資料は通常AI検索から除外する。
- Web App利用者は全員、全Active資料をAI検索できる共通アクセスモデルとする。
- 初期AIモデルはGemini Flash 1モデルのみ。利用者向けモデル選択やDeep modeは持たせない。
- AI同期は15分おきのApps Script time-driven workerを基本とする。
- AI検索も5年保持の管理者専用監査ログへ記録する。

詳細正本: `docs/ai/gemini-file-search.md`

## Knowledge Search target UX

サイドバーに`ナレッジ検索`ページを追加する。

採用済みのTarget UX:

```text
自由質問 | 要約 | 時系列 | 比較 | 面談準備
```

`自由質問`を初期表示とする。

5モードは同じFile Search Store、Metadata Filter、semantic retrieval、Gemini Flash、citation / Drive link処理を共有する。違いはprompt / output templateだけとする。

共通検索条件:

- 日付 From / To
- GP
- Asset Class
- Equity / Debt
- Source Type: Meeting / Pitchbook

すべての任意プルダウンは`未選択`を初期表示する。`未選択`は検索条件を適用しないUI状態であり、MasterまたはFile Search Metadataへ保存しない。

入力欄:

- `自由質問`: 自然言語の質問を入力する。
- `要約 / 時系列 / 比較 / 面談準備`: 同じ入力領域を任意の`追加指示`として利用できる。追加指示がなくても選択範囲からpresetを実行できる。

### Mode contracts

- `自由質問`: 蓄積済み資料に対して任意質問を行い、根拠付きで直接回答する。
- `要約`: 選択範囲の主要テーマ、重要事項、変化点、Takeawayを横断整理する。
- `時系列`: 発言・見方・重要更新を時系列で整理し、変化 / 継続を示す。
- `比較`: GP、資料、期間、戦略等を共通論点で横比較する。可能な場合は表形式を優先する。
- `面談準備`: 最近の面談・資料、主要発言、変化、未解決論点、再確認事項、次回質問候補をBrief化する。

すべてのモードでsource citationと元Drive資料へのリンクを表示し、根拠不足時は不足を明示する。

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

- Outlook保存メールは`.eml`のみ初期対応する。
- Shared Driveには`.eml`原本を保存する。
- AI indexにはSubject / From / To / Cc / Date / Body等を抽出したUTF-8テキスト表現を登録する。
- `.eml`内の添付ファイルは自動indexしない。検索対象としたい添付は別資料として登録する。
- Outlook `.msg`は初期対応外とする。

## Delivery sequence

Target UXとしては5モードすべて採用済みだが、実装は共通検索基盤の安定性を優先して段階化できる。

### Phase 2A — First usable retrieval release

1. MeetingをFile Searchへindex
2. Pitchbook / source materialsをFile Searchへindex
3. 新規 / 更新 / 無効化 / 再有効化をAI indexへ同期
4. 15分間隔のAI sync worker
5. ナレッジ検索画面
6. `自由質問`
7. Metadata Filter
8. semantic retrieval
9. Gemini Flashによるgrounded answer
10. citation表示
11. 元Drive資料を開く
12. AI index失敗 / retry管理
13. AI query監査

### Phase 2B — Preset modes on the same retrieval layer

共通検索基盤が安定した後、同じ画面・同じretrieval layerへ追加する。

1. `要約`
2. `時系列`
3. `比較`
4. `面談準備`

段階実装しても、5モード構成自体を未決定へ戻さない。

## Accepted backend extensions for Phase 2

`Meeting_Index` / `Pitchbook_Index`へ以下を追加する。

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

`Settings`では少なくとも以下を使用する。

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

Knowledge Searchの全5モード実行を既存の5年監査ログ対象に含める。

少なくとも以下を記録する。

- 利用者
- 日時
- Search mode
- 質問本文 / 追加指示
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

## Implementation-time validation — design is already decided

以下は「仕様が未決定」なのではなく、採用済み設計が会社環境と実機で成立することを確認する項目である。検証失敗時だけ、該当する実装手段を最小範囲で再検討する。

- 会社承認済みGemini API / Google Cloud projectを実データ用途で利用できること
- Apps ScriptからGemini File Search APIへ接続できること
- 100MBファイルをresumable / chunked uploadで安定してindexできること
- `.pdf / .pptx / .xlsx / .docx / .txt / .eml`各形式のindex経路
- EMLのheader / body抽出品質
- 15分time-driven workerの実動作
- query / indexing rate limitsと費用が実運用上許容可能であること
- File Search派生データの保持 / 削除運用が会社ルールに適合すること
- Web App利用者全員が全Active資料を検索可能という共通アクセス境界が会社運用と一致すること
- AI query監査が5年保持・管理者限定閲覧で成立すること
- Citationから正しいDrive原資料へ戻れること

## Genuine remaining implementation choices

現時点で本当に未確定なのは、採用済み設計を壊さない範囲の具体的な実装設定・UI微調整である。

- 実際に使用するGemini Flash model ID
- API credentialの会社承認済みserver-side保管方式
- 100MB AI index transportをApps Scriptだけで完結できない場合に使う組織承認済みGoogle Cloud runtimeの具体形
- retryの1回あたり処理件数、backoff、rate-limit / cost guardrailの具体値
- 比較モードでmulti-select UIを追加するか。初期はfilters / 追加指示で開始し、実利用で必要性を確認して判断する

これら以外の採用済み仕様を、実装時に理由なく再オープンしない。

## Validation gates

### Phase 1

- source / Index / Drive参照の整合
- Meeting ID / Document ID / Batch IDの安定性
- 自動命名・継続連番
- 同時書込み・楽観的ロック
- 24時間下書き
- 部分失敗retryのidempotency
- Active / Inactive / Reactivate
- マスター権限と監査
- 実利用者識別

### Phase 2

- source-to-index同期の整合
- 15分sync workerの動作
- metadata filterの正確性
- semantic retrievalの妥当性
- citationsとDriveリンクの一致
- source更新時のre-index
- Inactive除外 / Reactivate復帰
- retry idempotency
- 100MB path
- 対応6形式のindex
- EML本文の正しいテキスト化
- Web App全利用者が共通AI検索範囲へアクセスできること
- AI query監査の記録内容と管理者限定閲覧
- Flash固定でモデル選択UIが存在しないこと
- `自由質問`がdefault modeとして動作すること
- 4つのpresetが同じretrieval / citation layerを利用すること
- 要約 / 時系列 / 比較 / 面談準備が根拠のない内容を補完しないこと
- AI障害で正本登録が壊れないこと
- confidential data / credentialsがGitHubや不適切なログへ出ないこと

## Planning rule

既存の蓄積層をAI都合で複雑化しない。AI retrievalは正本の上に独立した派生レイヤーとして載せる。

新しいDB、タグ体系、Agent、Knowledge Graph等を追加する場合は、File Searchで満たせない具体的な要件が確認されてから判断する。

採用済み仕様と実装時検証を混同しない。検証が必要という理由だけで、確定済み設計を「未決定」と表現しない。
