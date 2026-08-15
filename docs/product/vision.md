# Product Vision

## Purpose

プライベートアセット領域の面談記録とPitchbook / source materialsを、利用者の入力負荷を抑えながら継続的に蓄積し、後から検索・修正・整理・要約・比較できる状態を作る。

本プロジェクトは、複雑なナレッジ共有SNSや独立した大規模検索基盤を先に作ることを目的としない。Google Workspaceを正本・運用基盤とし、その上にGemini File Searchを再生成可能な検索レイヤーとして載せる、シンプルな業務ツールを目指す。

## Core user experience

通常利用者は、組織管理下の1つのGoogle Apps Script HTML Service Web Appを共通URLから利用する。Google SheetsやAIインデックスを直接操作しない。

主要画面は以下とする。

1. `面談記録` — 新規登録 / 過去記録
2. `Pitchbook` — 新規登録 / 過去資料
3. `ナレッジ検索`
4. `マスター管理`

## Accumulation and maintenance

### Meeting records

面談登録の必須項目:

- 日付
- GP
- Asset Class

任意項目:

- 時間
- 面談場所
- Equity / Debt
- 面談相手
- 当社側
- 面談内容

面談本文は自由記載とし、Apps Scriptが入力済み項目だけをコンパクトなGoogle Docsへミラーする。Google Docsを面談本文の正本とし、`Meeting_Index`へ本文全文を重複保存しない。

各面談には固定Meeting IDを付与する。

```text
MTG-000123
```

基本ファイル名:

```text
YYYY-MM-DD_GP_AssetClass_Equity-or-Debt_MTG-XXXXXX
```

Equity / Debtが未選択の場合はその要素を省略し、面談時間はファイル名に含めない。

### Pitchbooks / source materials

登録画面はドラッグ＆ドロップと複数ファイル選択に対応する。

必須:

- ファイル
- 日付
- GP
- Asset Class

任意:

- Equity / Debt

保存ファイル名は利用者に自由入力させず、Apps Scriptが自動生成する。

```text
YYYY-MM-DD_GP_AssetClass_Equity-or-Debt_Sequence.ext
```

1件目から`_01`等の連番を付け、後日同じ登録コンテキストへ追加する場合は既存最大番号の次を使う。既存の欠番は詰め直さない。

アプリ上限は1ファイル100MB、1回最大10ファイル、合計500MBとする。

初期AI検索対象形式:

```text
.pdf
.pptx
.xlsx
.docx
.txt
.eml
```

Outlook保存メールは`.eml`のみ初期対応する。原本はShared Driveへ保存し、AI検索にはSubject / From / To / Cc / Date / Body等を抽出したテキスト表現を使用する。`.eml`内の添付は自動indexせず、必要な添付は別資料として登録する。`.msg`は初期対応外とする。

### Shared registration context

面談とPitchbookの登録画面では以下の4項目を利用者ブラウザ内で共有する。

- 日付
- GP
- Asset Class
- Equity / Debt

画面切替や登録完了で共通4項目を自動消去しない。ページ固有の入力だけを登録成功時にクリアする。テキスト・選択値の下書きは同一ブラウザで24時間保持する。

### Past records and corrections

面談・Pitchbookとも以下の任意条件で過去記録を検索できる。

- 日付 From / To
- GP
- Asset Class
- Equity / Debt
- Status

固定Meeting ID / Document ID / Drive File IDを維持しながら編集・名称同期を行う。通常利用者向けの物理削除は提供せず、Active / Inactiveと再有効化で管理する。

## Masters

GPは`GP_Master`、面談場所 / Asset Class / Equity-Debtは`Option_Master`で管理する。

- GPには固定GP IDを持たせる。
- GP表示は常にアルファベット順とする。
- 未登録GPは面談 / Pitchbook登録画面からクイック追加できる。
- Asset Class、Equity / Debt、面談場所はSort Orderで並び替え可能とする。
- マスターの追加、名称変更、並び替え、無効化、再有効化は全利用者が実行できる。
- 名称変更 / 無効化は確認ダイアログを表示し、監査ログへ記録する。
- 物理削除は通常操作に含めない。

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

## Authoritative storage

正本は組織管理下のShared Driveへ置く。

```text
Private Assets Knowledge
├─ Meeting Records
└─ Pitchbooks
```

年、GP、Asset Class等によるサブフォルダは作らずフラットに保存する。

Google Sheetsは小さなバックエンドDBとして以下の5シートを持つ。

1. `GP_Master`
2. `Option_Master`
3. `Meeting_Index`
4. `Pitchbook_Index`
5. `Settings`

監査ログはこの5シートとは分離した管理者専用Spreadsheetへ保存する。

## Knowledge retrieval with Gemini

蓄積済みのActiveなMeeting / Pitchbook / source materialsをGemini File Search Storeへ同期し、Custom Metadataによる正確な絞り込みとEmbeddingによるsemantic retrievalを組み合わせる。

```text
Shared Drive = 正本
Sheets       = 正確なMetadata / Index
File Search  = 再生成可能な検索インデックス
Gemini Flash = 取得した根拠を整理・要約・比較するモデル
```

初期はFile Search Storeを1つだけ使用する。独自Vector DB、独自Embedding pipeline、自動キーワードタグ体系、Knowledge Graphは導入しない。

Web App利用者は全員、File Search Store内のすべてのActive資料を検索できる共通アクセスモデルとする。利用者別 / ファイル別retrieval ACLは初期版に含めない。

AI同期は正本登録と分離し、15分おきのApps Script time-driven workerで処理する。AI indexing失敗を理由に正本登録をロールバックしない。

初期AIモデルは設定されたGemini Flash 1モデルのみとし、利用者向けモデル選択やDeep modeは設けない。

## Knowledge Search target UX

ナレッジ検索画面は以下の5モードをTarget UXとして採用する。

```text
自由質問 | 要約 | 時系列 | 比較 | 面談準備
```

`自由質問`を初期表示とする。

5モードは同じFile Search Store、Metadata Filter、semantic retrieval、Gemini Flash、Citation / Drive link処理を共有し、presetはprompt / output templateだけを切り替える。

共通フィルター:

- 日付 From / To
- GP
- Asset Class
- Equity / Debt
- Source Type: Meeting / Pitchbook

任意プルダウンは`未選択`を初期表示とする。`未選択`は「その条件で絞らない」というUI状態であり、MasterやFile Search Metadataへ保存しない。

各モードの目的:

- `自由質問`: 任意質問へ根拠付きで回答する。
- `要約`: 選択範囲の主要テーマ・重要事項・変化点を横断整理する。
- `時系列`: 発言・見方・重要更新を時系列で整理し、変化と継続を示す。
- `比較`: GP、資料、期間、戦略等を共通論点で横比較する。
- `面談準備`: 最近の面談・資料、主要発言、変化、未解決論点、再確認事項、次回質問候補をBrief化する。

すべてのモードでsource citationと元Drive資料へのリンクを表示し、根拠が不足する場合は不足を明示する。

実装は共通検索基盤を安定させるため`自由質問`を先行し、同じretrieval layerへ4つのpresetを段階追加してよい。ただし5モード構成自体は採用済みのTarget UXとする。

## Operations and governance

- 1つの組織管理下Web Appを複数人で利用する。
- LockServiceはID採番・連番・マスター更新等の短い共有書込み区間だけに使う。
- 同一面談の同時編集はVersion / Updated Atで古い保存を拒否する。
- Pitchbookの部分失敗は成功分を維持し、失敗分だけ同じID / 連番で再試行する。
- 監査ログは5年間保持し、管理者のみ閲覧できる。
- AI検索も監査対象とし、利用者、日時、モード、質問 / 追加指示、filters、使用モデル、結果、cited source IDs等を記録する。
- Gemini回答全文、retrieved chunk全文、Embedding、原資料本文は監査ログへ複製しない。
- 本番では実際の操作利用者を識別できることを必須とする。
- 実データをGeminiへ送る構成は会社承認済みGoogle Cloud / Gemini API環境だけを使用する。

## Principles

- シンプルさを最優先する。
- 正本とAIインデックスを分離する。
- 利用者にはWeb Appだけを見せ、SheetsやAIインデックスを直接操作させない。
- 人間の入力負荷を増やしすぎない。
- 面談本文は自由記載を維持する。
- 表記揺れが問題になる項目は共有マスターを使う。
- Driveフォルダを分類目的で細分化せずMetadataで管理する。
- Metadataで正確に絞り、Embeddingで意味検索する。
- AI回答から原資料へ戻れるtraceabilityを必須とする。
- AI障害で正本の登録・修正を止めない。
- File Searchで満たせるうちは独自Vector DB、タグ体系、Agent framework等を追加しない。

## Explicit non-goals for the initial product

- AppSheet前提のUI
- Apps Script HTML Serviceとは別の外部Webフロントエンド
- Wiki、SNS、Like、コメント等の共有機能
- Gmail / Outlook mailbox全体の自動取り込み
- 複雑な手動タグ体系
- 自動分類の作り込み
- 独自Vector DB / 独自Embedding基盤
- Knowledge Graph
- 利用者別 / ファイル別AI retrieval ACL
- 複数AIモデルの利用者切替
- Outlook `.msg`解析
- `.eml`添付の自動index
- AIによる投資判断や正式記録の自動確定
- 同一AI検索リクエストでの公開Web自動補完

## Current phase

設計フェーズ。蓄積・呼び出し・修正・運用管理の基本仕様とGemini File Searchによる検索アーキテクチャは採用済み。

実装開始前後に残るものは、採用済み設計の再検討ではなく、会社環境・Apps Script・Gemini API上での実機検証と、具体的なruntime設定の確定が中心となる。

詳細は以下を参照する。

- `docs/architecture/target-architecture.md`
- `docs/planning/mvp-and-roadmap.md`
- `docs/operations/runtime-policy.md`
- `docs/ai/gemini-file-search.md`
- `docs/governance/security.md`
