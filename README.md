# Knowledge Sharing Platforms

プライベートアセット領域の面談記録とPitchbook等を、少ない運用負荷で蓄積し、必要なときに検索・整理・要約できるようにするナレッジ基盤プロジェクトです。

## Status

現在は再設計後の計画フェーズです。実装・試験・デプロイ・本番運用はいずれも未開始です。

2026-08-14に旧計画を破棄し、Google Workspace中心のシンプルな蓄積基盤から再設計しました。2026-08-15に、蓄積した情報をGemini API / File Searchで検索・整理する第2フェーズの方針を採用しました。

## Product structure

```text
利用者
  |
  v
Apps Script HTML Service Web App
  ├─ 面談記録: 新規登録 / 過去記録
  ├─ Pitchbook: 新規登録 / 過去資料
  ├─ ナレッジ検索
  └─ マスター管理
        |
        v
Google Apps Script
        |
   +----+-------------------------+
   |                              |
   v                              v
Google Sheets                Google Shared Drive
5-sheet backend              authoritative records
   |                              |
   |                              | AI index/sync
   |                              v
   |                       Gemini File Search Store
   |                              |
   +------------------------------+
                                  |
                                  v
                              Gemini API
                                  |
                                  v
                         grounded answer + citations
```

## Authoritative storage

Shared Driveを正本とします。

```text
Private Assets Knowledge
├─ Meeting Records
└─ Pitchbooks
```

各フォルダ内は年・GP・Asset Class等で細分化せず、規則的なファイル名でフラットに保存します。

Google SheetsはWeb Appの小さなバックエンドDBとして使用します。

1. `GP_Master`
2. `Option_Master`
3. `Meeting_Index`
4. `Pitchbook_Index`
5. `Settings`

通常利用者はSheetsを直接編集しません。

## Meeting records

必須項目:

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

Apps Scriptが軽量なGoogle Docsへ`項目: 値`形式でミラーします。面談本文はDocsだけを正本とし、Indexへ全文を重複保存しません。

各面談には固定Meeting IDを発行します。

```text
YYYY-MM-DD_GP_AssetClass_Equity-or-Debt_MTG-XXXXXX
```

Equity / Debt未選択時はその要素を省略します。

## Pitchbooks

- ドラッグ＆ドロップ / 複数ファイル登録
- 1ファイル100MBまで
- 1回最大10ファイル、合計500MBまで
- ファイル、日付、GP、Asset Classは必須
- Equity / Debtは任意
- 保存名はApps Scriptが自動生成
- 1件目から`_01`等を付け、後日追加は既存最大番号の続き

```text
YYYY-MM-DD_GP_AssetClass_Equity-or-Debt_Sequence.ext
```

## Masters

- GPは`GP_Master`で固定ID管理し、画面上は常にアルファベット順。
- 未登録GPは面談 / Pitchbook登録画面からクイック追加可能。
- Asset Class、Equity / Debt、面談場所は`Option_Master`で管理。
- Optionの追加・名称変更・並び替え・無効化・再有効化はマスター管理画面から行う。
- マスター変更は全利用者が可能。物理削除は通常操作として提供しない。

Asset Class初期値:

`PE / VC / Infrastructure / Real Estate / PD / その他`

## Past records and corrections

面談・Pitchbookとも、過去記録を以下の任意条件で検索できます。

- 日付 From / To
- GP
- Asset Class
- Equity / Debt
- Status

編集時は固定IDとDrive File IDを維持し、Indexと保存ファイル名を同期更新します。削除ではなくActive / Inactiveで管理し、再有効化できます。

## Multi-user and operations

- 組織管理下の1つのWeb Appを複数人で利用
- LockServiceでID採番・連番・マスター更新等の短い競合区間だけを排他制御
- 同一面談の同時編集はVersion / Updated Atで古い保存を拒否
- 下書きは同一ブラウザで24時間保持
- Pitchbook部分失敗は成功分を維持し、失敗分だけ同じID / 連番で再試行
- 監査ログは5年間保持し、管理者のみ閲覧

詳細は`docs/operations/runtime-policy.md`を参照してください。

## Gemini knowledge retrieval

蓄積した面談記録とPitchbookをGemini File Search Storeへ同期し、Google管理のchunk / embeddingを使ってsemantic searchします。

重要な役割分担:

```text
Shared Drive = 正本
Sheets       = 正確なMetadata / Index
File Search  = 再生成可能なAI検索インデックス
Gemini API   = 関連箇所を基に回答・要約・比較
```

初期はFile Search Storeを1つだけ使用し、GP / Asset Class等はCustom Metadataで絞ります。独自Vector DBや自動キーワードタグ体系は導入しません。

ナレッジ検索画面の初期フィルター:

- 日付 From / To
- GP
- Asset Class
- Equity / Debt
- Source Type: Meeting / Pitchbook

すべてのプルダウンはUI上の`未選択`を初期値とし、`未選択`は「その条件を検索に使わない」という意味です。`未選択`自体をMasterやFile Search Metadataへ保存しません。

回答はFile Search Citationを使い、元のMeeting / PitchbookとDrive URLを表示します。

新規登録・更新・無効化・再有効化はFile Search側へ同期します。AI indexingに失敗しても、正本の登録・更新自体はロールバックしません。

詳細設計: `docs/ai/gemini-file-search.md`

## Design principles

1. 正本とAIインデックスを分離する。
2. 利用者にはシンプルなWeb Appだけを見せる。
3. Metadataで正確に絞り、Embeddingで意味検索する。
4. AI回答から必ず原資料へ戻れるようにする。
5. AI検索のために独自Vector DBやタグ体系を先回りして作らない。
6. AI機能の障害で正本の登録・修正を止めない。
7. 実際の機密情報、認証情報、APIキーをGitHubへ保存しない。

## Documentation

- [文書索引](docs/README.md)
- [全体アーキテクチャ](docs/architecture/target-architecture.md)
- [計画ベースライン](docs/planning/mvp-and-roadmap.md)
- [Runtime / Operations](docs/operations/runtime-policy.md)
- [Gemini File Search retrieval design](docs/ai/gemini-file-search.md)
- [Security / Information Handling](docs/governance/security.md)
- [Decision Log](docs/decisions/decision-log.md)

## Repository data policy

この公開GitHubリポジトリには設計書、将来のソースコード、匿名化または合成したテストデータのみを保存します。実際の面談記録、Pitchbook、個人情報、未公開ファンド・ディール情報、APIキー、認証情報、組織内ID、private URLは保存しません。
