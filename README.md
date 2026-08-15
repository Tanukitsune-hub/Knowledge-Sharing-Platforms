# Knowledge Sharing Platforms

プライベートアセット領域の面談記録とPitchbook / source materialsを、少ない運用負荷で蓄積し、必要なときに検索・整理・要約・比較できるようにするナレッジ基盤プロジェクトです。

## Status

現在はplanning phaseです。runtime実装、試験、デプロイ、本番運用、live Gemini integrationはいずれも未開始です。

- 2026-08-14: 旧計画を破棄し、Google Workspace中心のシンプルな蓄積基盤から再設計
- 2026-08-15: Gemini API / File Searchによる検索・要約レイヤーを採用

蓄積・修正・運用管理の基本仕様と、Gemini File Search retrieval architecture、Knowledge Searchの5モードTarget UXは採用済みです。今後の主作業は実装と実機検証であり、採用済み仕様を理由なく未決定へ戻しません。

## Product overview

```text
Authorized users
      |
      v
Apps Script HTML Service Web App
  ├─ 面談記録: 新規登録 / 過去記録
  ├─ Pitchbook: 新規登録 / 過去資料
  ├─ ナレッジ検索
  │    └─ 自由質問 / 要約 / 時系列 / 比較 / 面談準備
  └─ マスター管理
      |
      v
Google Apps Script
      |
 +----+-----------------------------+
 |                                  |
 v                                  v
Google Sheets                 Google Shared Drive
5-sheet backend               authoritative sources
                                    |
                                    | derived index
                                    v
                             Gemini File Search Store
                                    |
                                    v
                         configured Gemini Flash
                                    |
                                    v
                    grounded output + citations + Drive links

Separate admin-only Audit Spreadsheet
```

## Authoritative storage

Shared Driveを正本とします。

```text
Private Assets Knowledge
├─ Meeting Records
└─ Pitchbooks
```

各フォルダ内は年・GP・Asset Class等で細分化せず、規則的なファイル名でフラットに保存します。

Backend Spreadsheet:

1. `GP_Master`
2. `Option_Master`
3. `Meeting_Index`
4. `Pitchbook_Index`
5. `Settings`

通常利用者はbackend Sheetsを直接編集しません。

## Meeting records

Required:

- 日付
- GP
- Asset Class

Optional:

- 時間
- 面談場所
- Equity / Debt
- 面談相手
- 当社側
- 面談内容

Apps Scriptが軽量なGoogle Docsへ入力済み項目を`項目: 値`形式でミラーします。面談本文はDocsだけを正本とし、Indexへ全文を重複保存しません。

固定Meeting ID:

```text
MTG-000123
```

基本命名:

```text
YYYY-MM-DD_GP_AssetClass_Equity-or-Debt_MTG-XXXXXX
```

Equity / Debt未選択時はその要素を省略し、Timeはファイル名に含めません。

## Pitchbooks / source materials

- drag & drop / multiple files
- file, Date, GP, Asset Class required
- Equity / Debt optional
- 1ファイル100MBまで
- 1回最大10ファイル、合計500MBまで
- 保存名はApps Scriptが自動生成
- 1件目から`_01`等を付け、後日追加は既存最大番号の続き

```text
YYYY-MM-DD_GP_AssetClass_Equity-or-Debt_Sequence.ext
```

Initial AI-searchable formats:

```text
.pdf
.pptx
.xlsx
.docx
.txt
.eml
```

Outlook保存メールは`.eml`のみ初期対応します。原本はShared Driveへ保存し、AI indexにはSubject / From / To / Cc / Date / Body等を抽出したテキスト表現を使用します。`.eml`内の添付は自動indexせず、必要な添付は別資料として登録します。`.msg`は初期対応外です。

## Masters

- GPは`GP_Master`で固定ID管理し、画面上は常にアルファベット順
- 未登録GPはMeeting / Pitchbook登録画面からquick-add可能
- Asset Class、Equity / Debt、面談場所は`Option_Master`で管理
- OptionはSort Orderで並び替え可能
- マスターの追加・名称変更・並び替え・無効化・再有効化は全利用者が可能
- 名称変更 / 無効化は確認ダイアログ＋監査ログ
- 物理削除は通常操作として提供しない

Asset Class initial values:

`PE / VC / Infrastructure / Real Estate / PD / その他`

## Past records and corrections

Meeting / Pitchbookとも以下の任意条件で過去記録を検索できます。

- Date From / To
- GP
- Asset Class
- Equity / Debt
- Status

検索用プルダウンは`未選択`を初期表示し、`未選択`は「filterを適用しない」を意味します。MasterやMetadataへ保存しません。

固定ID / Drive File IDを維持しながら編集し、Indexと保存ファイル名を同期します。通常操作ではActive / Inactive / Reactivateを使います。

## Multi-user and operations

- 組織管理下の1つのWeb Appを複数人で利用
- 共通4項目（日付 / GP / Asset Class / Equity-Debt）はMeeting / Pitchbook間でbrowser state共有
- テキスト / 選択値の下書きは同一ブラウザで24時間保持
- LockServiceはID採番・連番・マスター更新等の短い競合区間だけを排他制御
- 同一Meetingの同時編集はVersion / Updated Atで古い保存を拒否
- Pitchbook部分失敗は成功分を維持し、失敗分だけ同じID / 連番でretry
- 監査ログは5年間保持し、管理者のみ閲覧
- 本番では実際の操作利用者を識別できることを必須とする

詳細: `docs/operations/runtime-policy.md`

## Gemini knowledge retrieval

役割分担:

```text
Shared Drive = authoritative source
Sheets       = exact metadata / index
File Search  = rebuildable semantic retrieval index
Gemini Flash = grounded synthesis / summary / comparison
```

採用済み方針:

- Gemini API File Searchをhosted RAG / semantic retrieval layerとして使用
- 初期はFile Search Storeを1つだけ使用
- GP / Asset Class等はCustom Metadataでexact filtering
- File Searchにchunking / Embedding / vector storage / semantic retrievalを任せる
- 独自Vector DB / custom embedding pipeline / tag taxonomy / Knowledge Graphは初期導入しない
- Web App利用者は全員、すべてのActive indexed sourceを検索可能
- 初期AIモデルはconfigured Gemini Flash 1モデルのみ
- 利用者向けモデル選択 / Deep modeなし
- AI syncは15分おきのApps Script time-driven worker
- AI indexing失敗で正本登録をrollbackしない
- AI queryも5年監査ログ対象
- Citationから元Drive資料へ戻れるようにする

## Knowledge Search target UX

採用済み5モード:

```text
自由質問 | 要約 | 時系列 | 比較 | 面談準備
```

`自由質問`をdefault modeとします。

Shared filters:

- Date From / To
- GP
- Asset Class
- Equity / Debt
- Source Type: Meeting / Pitchbook

5モードは同じFile Search Store、Metadata Filter、semantic retrieval、Gemini Flash、Citation / Drive link処理を共有します。presetはprompt / output templateのみを切り替えます。

実装は`自由質問`を先行して共通retrieval layerを安定化し、その後`要約 / 時系列 / 比較 / 面談準備`を同じ画面へ追加できます。ただし5モード構成自体は採用済みTarget UXです。

## Design principles

1. 正本とAIインデックスを分離する。
2. 利用者にはシンプルなWeb Appだけを見せる。
3. Metadataで正確に絞り、Embeddingで意味検索する。
4. AI回答から必ず原資料へ戻れるようにする。
5. AI検索のために独自Vector DBやタグ体系を先回りして作らない。
6. AI障害で正本の登録・修正を止めない。
7. 採用済み仕様と「実装時に検証が必要」を混同しない。
8. 実際の機密情報、認証情報、APIキーを公開GitHubへ保存しない。

## Documentation

- [文書索引](docs/README.md)
- [Product Vision](docs/product/vision.md)
- [Target Architecture](docs/architecture/target-architecture.md)
- [Planning Baseline](docs/planning/mvp-and-roadmap.md)
- [Runtime / Operations](docs/operations/runtime-policy.md)
- [Gemini File Search retrieval design](docs/ai/gemini-file-search.md)
- [Security / Information Handling](docs/governance/security.md)
- [Decision Log](docs/decisions/decision-log.md)
- [Gemini retrieval decision](docs/decisions/gemini-file-search-retrieval.md)

## Repository data policy

この公開GitHubリポジトリには設計書、将来のソースコード、匿名化または合成したテストデータのみを保存します。実際の面談記録、Pitchbook、個人情報、未公開ファンド・ディール情報、APIキー、認証情報、組織内ID、private URLは保存しません。
