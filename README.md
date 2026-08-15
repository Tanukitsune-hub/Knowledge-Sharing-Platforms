# Knowledge Sharing Platforms

プライベートアセット領域の面談記録とPitchbook等の資料を、できるだけ少ない運用負荷で蓄積し、将来必要な情報を取り出せるようにするためのナレッジ基盤プロジェクトです。

## Status

現在は再設計後の計画フェーズです。実装・試験・デプロイ・本番運用はいずれも未開始です。

2026-08-14に従来のプロダクト構想、UI方針、アーキテクチャ、MVP計画を破棄し、より単純な構成を新しい出発点として採用しました。旧計画は本リポジトリの現行方針として扱いません。

## Current baseline

利用者向けの入口は、Google Apps Script HTML Serviceで作る独立したWeb Appとします。Google Sheetsはマスター、索引、設定を保持するバックエンドとして使い、通常利用者が直接編集する前提にしません。

利用者ごとにSpreadsheetやWeb Appをコピーせず、組織管理下の1つの共通Web Appを複数人で同時利用します。各利用者のブラウザ内の入力状態は独立させます。

### Shared registration context

面談記録とPitchbook登録では、以下の4項目を共通コンテキストとして扱います。

- 日付
- GP
- Asset Class
- エクイティ / デット

サイドバーで面談記録とPitchbook登録を切り替えても、これら4項目の入力値は保持します。どちらかの画面で変更した値は、もう一方の画面にも反映します。

登録完了後も共通4項目は保持します。一方、時間、面談本文や参加者、Pitchbookの選択ファイル等のページ固有データは、そのページの登録完了時にクリアします。画面切替だけでは、登録前の書きかけ内容や選択済みファイルを消しません。

### Meeting records

面談登録画面の入力項目は以下とします。

- 日付: 手入力またはカレンダー選択
- 時間: 入力
- 面談場所: Option Masterから選択
- GP: GP Masterから選択。存在しない場合は追加可能
- Asset Class: Option Masterから選択
- エクイティ / デット: Option Masterから選択
- 面談相手: 自由入力
- 当社側: 自由入力
- 面談内容: 大きな自由記載欄

面談内容欄は十分な高さを持たせ、長文は欄内で縦スクロールします。横スクロールは使用せず、文字を自動折り返しし、入力した改行は保持します。

登録するとApps Scriptが軽量なGoogle Docsを生成します。表や過度な装飾を使わず、入力内容をコンパクトにミラーします。

```text
日付: 2026-08-15
時間: 10:30
面談場所: 当社オフィス
GP: KKR
Asset Class: Infrastructure
エクイティ/デット: Equity
面談相手: John Smith, Jane Doe
当社側: 近藤、○○

面談内容:
入力した本文をそのまま反映する。
```

各面談には変更しないMeeting IDを自動発行します。例: `MTG-000123`。

面談Docsの基本ファイル名は以下とし、時間はファイル名に含めません。

```text
YYYY-MM-DD_GP_AssetClass_Equity-or-Debt_MTG-XXXXXX
```

例:

```text
2026-08-15_KKR_Infrastructure_Equity_MTG-000123
```

日付、GP等を後から修正した場合もMeeting IDは変更しません。

### Pitchbooks and other source materials

- HTML ServiceのPitchbook登録画面からファイルを登録する。
- ドラッグ＆ドロップと複数ファイルの一括登録に対応する。
- 利用者が入力する項目は、面談記録と共有する日付、GP、Asset Class、エクイティ / デットの4項目とする。
- Apps Scriptが4項目を保存ファイル名に使用し、利用者に保存ファイル名を自由入力させない。
- 1ファイル目から常に連番を付ける。
- 後日、同じ4項目の組み合わせで追加した場合は既存の最大連番の次を採番する。
- 元の拡張子を維持する。
- ファイル名生成時は `/`、`&` 等の記号を除外し、不要な空白や区切りを整える。

基本形は以下とします。

```text
YYYY-MM-DD_GP_AssetClass_Equity-or-Debt_Sequence.ext
```

例:

```text
2026-08-15_KKR_Infrastructure_Equity_01.pdf
2026-08-15_KKR_Infrastructure_Equity_02.pdf
```

### Masters

GPは独立したGP Masterとして管理します。各GPには固定GP ID、表示名、Active / Inactiveを持たせます。名称変更、追加、無効化、再有効化をWeb Appから行えます。

面談場所、Asset Class、エクイティ / デットは共通のOption Masterで管理し、カテゴリごとに追加、名称変更、無効化、再有効化を行えるようにします。

面談場所は住所や都市を詳細に管理せず、運用上必要な簡易カテゴリに留めます。初期候補は `当社オフィス`、`先方オフィス`、`セミナー / カンファレンス`、`オンライン`、`会食`、`その他` 等です。

無効化した選択肢は新規登録画面から外しますが、過去データとの紐付けは維持します。

### Backend Spreadsheet

1つのバックエンドSpreadsheetに、以下の5シートだけを基本構成として持ちます。

1. `GP_Master`
2. `Option_Master`
3. `Meeting_Index`
4. `Pitchbook_Index`
5. `Settings`

通常利用者は直接編集せず、Web App経由で読み書きします。行番号や並び順を識別子として使わず、固定IDでレコードを管理します。データは原則として物理削除せず、Active / Inactiveで管理します。

Meeting本文はDocsを正本とし、Meeting Indexには本文を重複保存しません。PitchbookもShared Drive上の原ファイルを正本とし、Indexには検索・管理に必要なメタデータと参照だけを保持します。

### Shared Drive

Shared Drive内の正本保管領域は、サブフォルダを細分化せず以下の2フォルダとします。

```text
Private Assets Knowledge
├─ Meeting Records
└─ Pitchbooks
```

各フォルダ内では年、GP、Asset Class等による下位フォルダを作らず、規則的なファイル名でフラットに蓄積します。分類・検索はIndexと将来の検索レイヤーが担います。

### Multi-user operation

- 全員が同じWeb App URLを利用し、利用者ごとのコピーは作らない。
- 各利用者の画面上の入力状態は独立させ、複数人が同時に別々の登録作業をできるようにする。
- マスター更新、一意ID採番、Pitchbook連番、整合性が必要なIndex更新等の短い共有書込みだけをLockServiceで排他制御する。
- アップロードやDocs生成等を含む処理全体を長時間ロックしない。
- 同じ面談記録を複数人が編集する場合はUpdated AtまたはVersionで競合を検知し、古い画面からの無条件上書きを防ぐ。
- Web Appの実行主体設定は、組織の権限・監査要件を確認して実装時に確定する。恒久運用を個人アカウントに依存させない。

## Design principles

1. 最初から複雑なプラットフォームを作らない。
2. 利用者にはシンプルなHTML画面だけを見せ、管理用Sheetsを通常操作から切り離す。
3. 1つの共通Web Appと共有バックエンドを複数人で利用し、利用者ごとのコピーを増やさない。
4. 面談とPitchbookで共通する入力は1回入力すれば再利用できるようにする。
5. 入力と保存の仕組みを先に完成させ、検索・AIはその上に後から載せる。
6. 面談本文は自由記載を維持し、Docsは軽量・プレーンに保つ。
7. GPや選択肢の表記揺れは共有マスターで抑え、人の自由入力に依存しない。
8. Driveは正本保管、Sheetsはマスター・索引・設定、Web Appは利用者操作という役割分担を維持する。
9. 原資料を正本として保持し、将来の検索結果やAI回答から原資料へ戻れる設計にする。
10. 技術選定は必要になった時点で行い、RAG、Vector DB、外部Web基盤等を先回りして導入しない。
11. 実際の機密情報、面談記録、Pitchbook、認証情報をGitHubへ保存しない。

## Not decided yet

以下は今後の検討事項です。

- GP Master / Option Master / Meeting Index / Pitchbook Index / Settingsの最終カラム定義とデータ型
- 過去面談記録の検索条件と編集画面の細部
- 大容量Pitchbookの実用上の上限とアップロード方式
- 登録途中で一部処理だけ失敗した場合の再試行・二重登録防止
- Web Appの実行主体設定と利用者識別・監査ログの詳細
- 全文検索、意味検索、AI Q&Aの実装方式
- 検索UI
- Gemini、Vertex AIその他AI機能の利用範囲
- RAG / Vector DBの要否
- 詳細なMVP、ロードマップ、実装順序

## Documentation

- [文書索引](docs/README.md)
- [プロダクト方針](docs/product/vision.md)
- [最小アーキテクチャ](docs/architecture/target-architecture.md)
- [現時点の計画](docs/planning/mvp-and-roadmap.md)
- [情報管理の最低条件](docs/governance/security.md)
- [意思決定記録](docs/decisions/decision-log.md)

## Repository data policy

この公開GitHubリポジトリには、設計書、将来のソースコード、匿名化または合成したテストデータのみを保存します。実際の面談記録、Pitchbook、個人情報、未公開ファンド・ディール情報、APIキー、認証情報、組織内ID、private URLは保存しません。