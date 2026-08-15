# Planning Baseline

## Status

従来のMVPとロードマップは2026-08-14に破棄した。本書は詳細なロードマップではなく、次の検討を始めるための現在の確定事項と未決定事項を記録する。

## Current direction

まず「知識を正しく、継続的に蓄積できること」を優先する。

現時点で採用している中心要素は以下。

1. Apps Script HTML Serviceによる1つの共通Web App
2. 面談記録の新規登録・過去記録編集
3. Pitchbookのドラッグ＆ドロップ / 複数ファイル登録
4. GP Master / Option Masterの管理画面
5. Apps Scriptによる軽量な面談Google Docs生成
6. Meeting ID / Document IDによる固定識別
7. Pitchbookの自動命名、継続連番、Shared Drive保存
8. 1つのバックエンドSpreadsheetに5シートを集約
9. Shared Driveは`Meeting Records`と`Pitchbooks`の2フォルダだけに分け、各フォルダ内はフラットに蓄積

## Current UX decisions

### Meeting

入力項目は以下とする。

- 日付: 手入力 / カレンダー
- 時間: 入力
- 面談場所: 選択
- GP: 選択
- Asset Class: 選択
- エクイティ / デット: 選択
- 面談相手: 自由入力
- 当社側: 自由入力
- 面談内容: 自由記載

面談内容欄は十分な高さを持たせ、長文は欄内縦スクロール、横方向は自動折り返しとする。

Google Docsは表や装飾を避け、各項目を`項目: 値`形式でコンパクトにミラーする。面談本文はDocsを正本とし、Sheetへ本文を重複保存しない。

### Shared context

面談とPitchbookで以下を共有し、サイドバーでページを切り替えても利用者ブラウザ内で保持する。

- 日付
- GP
- Asset Class
- エクイティ / デット

登録後も共有4項目は保持し、各ページ固有の入力だけをクリアする。

### Pitchbook

- ドラッグ＆ドロップまたはファイル選択
- 複数ファイルの一括選択
- 共有4項目だけを入力
- 自由な保存ファイル名入力は行わない
- 1ファイル目から必ず`_01`等の連番を付ける
- 後日同じ4項目の組み合わせで追加した場合は既存最大番号の次を採番する
- `/`、`&`等の記号は保存名生成時に除外する
- 元の拡張子を維持する

基本命名形:

```text
YYYY-MM-DD_GP_AssetClass_Equity-or-Debt_Sequence.ext
```

### Meeting Docs naming

各面談に固定Meeting IDを発行する。

```text
YYYY-MM-DD_GP_AssetClass_Equity-or-Debt_MTG-XXXXXX
```

時間はファイル名に含めない。表示情報を後から変更してもMeeting IDは変更しない。

### Masters

GPは独立した`GP_Master`を使用する。

面談場所、Asset Class、エクイティ / デットは`Option_Master`でType別に管理する。

各マスターはWeb Appから追加、名称変更、無効化、再有効化できる。参照済みレコードを日常操作で物理削除しない。

面談場所は詳細住所・都市ではなく簡易カテゴリに留める。初期候補は`当社オフィス`、`先方オフィス`、`セミナー / カンファレンス`、`オンライン`、`会食`、`その他`等。

## Backend Spreadsheet baseline

1つのSpreadsheetに以下の5シートを置く。

1. `GP_Master`
2. `Option_Master`
3. `Meeting_Index`
4. `Pitchbook_Index`
5. `Settings`

通常利用者は直接編集しない。行番号や並び順ではなく固定IDで参照する。

`Meeting_Index`は構造化情報とDocs参照を保持し、本文は持たない。`Pitchbook_Index`は1ファイル1行で原ファイル名と保存ファイル名の両方を記録する。

## Shared Drive baseline

```text
Private Assets Knowledge
├─ Meeting Records
└─ Pitchbooks
```

サブフォルダは作らずフラットに蓄積する。分類・検索はIndexと将来の検索レイヤーに任せる。

## Not yet planned

以下はまだ詳細を決めていない。

- 各バックエンドシートの最終カラム名、データ型、必須 / 任意
- Settingsに保持する値と採番方式の最終形
- 過去面談記録の検索条件、一覧表示、無効化記録の復元UI
- 登録途中で一部処理だけ失敗した場合のロールバック / 再試行 / 二重登録防止
- 大容量ファイルのアップロード方式と実用上の上限
- Web Appのexecute-as設定、利用者識別、監査ログ
- GP重複登録時の統合機能
- 検索方式
- AI Q&A
- RAG / Vector DB
- 検索画面
- 自動分類・自動要約
- 実装フェーズ分割
- リリース条件

## Planning rule

次の設計作業では、一度に全体を固めない。利用者の運用が単純であること、実装が容易であること、将来の検索拡張を妨げないことを確認しながら、必要な事項だけ順番に決定する。

旧計画から要件や技術選定を自動的に復活させない。必要なものがあれば、新しい方針の中で改めて採否を判断する。