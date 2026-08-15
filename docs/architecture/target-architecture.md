# Minimal Target Architecture

## Status

本書は2026-08-15時点で確定した最小構成だけを示す。旧アーキテクチャは破棄済みであり、AppSheet、外部Web基盤、Gemini API、Vertex AI、RAG、Vector DB等を既定の構成要素として扱わない。

## Confirmed baseline

```text
Multiple users
  A / B / C ...
        |
        | same shared URL
        v
Apps Script HTML Service Web App
  ├─ Meeting Registration / Edit
  ├─ Pitchbook Registration
  └─ Master Management
            |
            v
Google Apps Script
  ├─ shared client-side registration context
  ├─ validation / registration logic
  ├─ Google Docs generation
  ├─ Pitchbook rename / numbering / save
  ├─ master maintenance
  └─ concurrency control
            |
      +-----+--------------------+
      |                          |
      v                          v
Google Sheets                Google Shared Drive
  ├─ GP_Master                 ├─ Meeting Records
  ├─ Option_Master             └─ Pitchbooks
  ├─ Meeting_Index
  ├─ Pitchbook_Index
  └─ Settings

              ↓ 将来追加

Search / Retrieval / AI layer
  方式は未決定
```

## Apps Script HTML Service Web App

通常利用者の入口とする。Google Sheetsを直接操作させない。

主要画面は以下を中心とする。

1. 面談記録の新規登録・過去記録編集
2. Pitchbook登録
3. マスター管理

Web Appは利用者ごとにコピーしない。組織管理下の1つの共通デプロイとURLを複数人で利用し、各利用者のブラウザ上の入力状態は独立させる。

サイドバーで画面を切り替える単一のWeb Appとし、画面切替だけでは各画面の未登録の入力状態を消さない。

## Shared registration context

面談記録とPitchbook登録で以下の4項目を共通コンテキストとして扱う。

- 日付
- GP
- Asset Class
- エクイティ / デット

一方の画面で入力・変更した値はもう一方にも反映する。サイドバーで画面を切り替えても保持する。

面談またはPitchbookの登録が完了しても共通4項目は維持し、続けてもう一方を登録できるようにする。登録完了時には、そのページ固有の入力だけをクリアする。面談の時間は共通コンテキストに含めない。

共通コンテキストと各ページの未登録下書きは利用者ブラウザ内の状態として扱い、別利用者とは共有しない。

## Meeting registration

面談入力項目は以下とする。

- 日付: 手入力とカレンダー選択の両方に対応
- 時間: 入力
- 面談場所: Option Masterの選択肢
- GP: GP Masterの選択肢。存在しない場合は追加可能
- Asset Class: Option Masterの選択肢
- エクイティ / デット: Option Masterの選択肢
- 面談相手: 自由入力
- 当社側: 自由入力
- 面談内容: 自由記載

面談内容欄は十分な高さを持つ固定領域とし、長文は入力欄内で縦スクロールする。横スクロールは使用せず、文字は自動折り返しする。入力した改行は保持する。

サイドバーでPitchbook画面へ移動しても、未登録の時間、参加者、面談内容等は保持し、戻った際に続きから編集できるようにする。

Apps ScriptがGoogle Docsを生成する。Docsは軽量なプレーンテキスト中心とし、装飾、表、余計な空行を避ける。

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

各面談には変更しないMeeting IDを発行する。例: `MTG-000123`。

面談Docsの基本ファイル名は以下とし、時間はファイル名に含めない。

```text
YYYY-MM-DD_GP_AssetClass_Equity-or-Debt_MTG-XXXXXX
```

日付や分類を後から変更した場合は表示部分を更新できるが、Meeting IDは変更しない。

生成DocsをShared Driveの`Meeting Records`へ保存し、Meeting Indexへ参照を記録する。

## Pitchbook registration

- ドラッグ＆ドロップまたはファイル選択で登録する。
- 複数ファイルを一度に選択できる。
- 入力項目は共有コンテキストの日付、GP、Asset Class、エクイティ / デットの4項目とする。
- 複数ファイルには同じ4項目を共通適用する。
- 保存ファイル名を利用者に自由入力させない。
- Apps Scriptが4項目を使用して保存名を生成する。
- 1ファイル目から必ず連番を付ける。
- 後日同じ4項目の組み合わせで追加する場合は、既存の最大連番の次を採番する。
- 元の拡張子を維持する。
- ファイル名生成時は `/`、`&` 等の記号を除外し、不要な空白や区切りを整える。
- 登録成功後は選択ファイルのみクリアし、共通4項目は保持する。

基本命名形は以下とする。

```text
YYYY-MM-DD_GP_AssetClass_Equity-or-Debt_Sequence.ext
```

例:

```text
2026-08-15_KKR_Infrastructure_Equity_01.pdf
2026-08-15_KKR_Infrastructure_Equity_02.pdf
```

保存後、Pitchbook Indexへ参照情報を記録する。

## Masters

### GP Master

面談登録とPitchbook登録の両方から参照する。

最低限の論理項目は以下。

- GP ID: 作成後に変えない内部識別子
- GP Name: 利用者に表示する名称
- Status: Active / Inactive
- Created At
- Updated At

Web Appのマスター管理画面から、新規追加、名称変更、無効化、再有効化を行う。

過去データはGP名ではなくGP IDで紐付ける。名称変更で参照関係を壊さない。参照済みGPの物理削除は初期機能に含めない。

### Option Master

以下の選択肢を1つの共通Option Masterで管理する。

- 面談場所
- Asset Class
- エクイティ / デット

カテゴリごとに固定Option ID、Type、表示名、Active / Inactiveを持たせ、Web Appから追加、名称変更、無効化、再有効化を行う。

面談場所は詳細住所や都市ではなく、運用上の簡易カテゴリとする。初期候補は以下のような粒度とする。

- 当社オフィス
- 先方オフィス
- セミナー / カンファレンス
- オンライン
- 会食
- その他

## Backend Spreadsheet

バックエンドSpreadsheetは人が日常的に閲覧・編集する台帳ではなく、Web Appの小さなデータベースとして扱う。

基本構成は5シートだけとする。

### `GP_Master`

GPの正規化と状態を保持する。レコードはGP IDで参照する。

### `Option_Master`

面談場所、Asset Class、エクイティ / デットの選択肢をTypeで区別して保持する。

### `Meeting_Index`

面談の構造化情報とGoogle Docsへの参照を保持する。面談本文は重複保存せず、Docsを正本とする。

想定項目は以下。

- Meeting ID
- Date
- Time
- Location ID
- GP ID
- Asset Class ID
- Capital Type ID
- Counterparty
- Internal Participants
- Doc File ID
- Doc URL
- Status
- Created At
- Updated At
- Version

### `Pitchbook_Index`

1ファイル1行で原資料の構造化情報と参照を保持する。

想定項目は以下。

- Document ID
- Date
- GP ID
- Asset Class ID
- Capital Type ID
- Sequence
- File ID
- File URL
- Original Filename
- Saved Filename
- Status
- Created At

### `Settings`

利用者向けマスターではないシステム設定を保持する。例としてMeeting Records / PitchbooksのDrive Folder ID、スキーマバージョン等を保持する。採番をSettingsで保持する場合も、同時実行時はLockService配下で更新する。

バックエンドでは行番号や表示順を永続識別子として使わない。固定IDで参照する。通常操作では物理削除を避け、Active / Inactive等の状態で管理する。

## Multi-user concurrency rules

複数人が同じWeb Appを同時利用することを通常ケースとして扱う。

以下の共有状態を変更する短い処理ではApps ScriptのLockServiceを用いて排他制御する。

- GP / Optionの新規追加やマスター更新
- Meeting ID / Document ID等の一意ID採番
- Pitchbook連番の取得・確定
- 同一処理内で整合性が必要なIndex更新

ファイルアップロードやDocs本文生成など処理全体を長時間ロックせず、必要なクリティカルセクションだけをロックする。

同じ面談記録を複数人が同時編集する場合は、Meeting IndexのUpdated AtまたはVersionを利用した楽観的ロックで競合を検知する。開いた後に別利用者が更新していた場合は保存を中止し、最新内容の再読込を求める。

Web Appを「デプロイしたユーザーとして実行」するか「アクセスしているユーザーとして実行」するかは、組織の権限設計、監査要件、利用者識別の必要性を実機確認してから決定する。個人アカウント依存の恒久運用にはしない。

## Google Shared Drive

正本保管用のフォルダは以下の2つだけとする。

```text
Private Assets Knowledge
├─ Meeting Records
└─ Pitchbooks
```

各フォルダ内では年、GP、Asset Class等のサブフォルダを作らず、規則的なファイル名でフラットに蓄積する。分類や絞り込みはIndexと将来の検索レイヤーが担う。

## Future retrieval layer

面談記録と原資料を横断して情報を呼び出す層を将来追加する。

現時点では以下を決定しない。

- 通常検索と意味検索の具体的な組み合わせ
- Gemini / Vertex AI等の利用方法
- RAG構成
- Vector DB
- 検索UI
- 自動要約・自動タグ付け

## Architectural rule

保存・蓄積の仕組みは、将来の検索方式を変更しても作り直さなくてよいように、Google Docsと原資料を正本として単純に保つ。利用者向けUIはHTML Serviceに閉じ、Google Sheetsはマスター・索引・設定のバックエンドとして扱う。Driveは正本保管に徹し、フォルダ階層を分類ロジックにしない。