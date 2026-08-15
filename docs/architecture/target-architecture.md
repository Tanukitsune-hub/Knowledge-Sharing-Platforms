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
  ├─ Meeting Registration / Past Records
  ├─ Pitchbook Registration / Past Files
  └─ Master Management
            |
            v
Google Apps Script
  ├─ shared client-side registration context
  ├─ validation / registration / edit logic
  ├─ Google Docs generation / update
  ├─ Pitchbook rename / numbering / save
  ├─ master maintenance / sort order
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

1. 面談記録: 新規登録 / 過去記録
2. Pitchbook: 新規登録 / 過去資料
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

面談入力項目と必須 / 任意は以下とする。

- 日付: 必須。手入力とカレンダー選択の両方に対応
- 時間: 任意
- 面談場所: 任意。Option Masterの選択肢
- GP: 必須。GP Masterの選択肢。存在しない場合はクイック追加可能
- Asset Class: 必須。Option Masterの選択肢
- エクイティ / デット: 任意。Option Masterの選択肢
- 面談相手: 任意。自由入力
- 当社側: 任意。自由入力
- 面談内容: 任意。自由記載

面談実績だけを先に登録できるよう、日付・GP・Asset Classだけでも登録可能とする。

面談内容欄は十分な高さを持つ固定領域とし、長文は入力欄内で縦スクロールする。横スクロールは使用せず、文字は自動折り返しする。入力した改行は保持する。

サイドバーでPitchbook画面へ移動しても、未登録の時間、参加者、面談内容等は保持し、戻った際に続きから編集できるようにする。

Apps ScriptがGoogle Docsを生成する。Docsは軽量なプレーンテキスト中心とし、装飾、表、余計な空行を避ける。入力済み項目だけを`項目: 値`形式でコンパクトにミラーし、未入力の任意項目は行ごと省略する。

各面談には変更しないMeeting IDを発行する。例: `MTG-000123`。

面談Docsの基本ファイル名は以下とし、時間はファイル名に含めない。

```text
YYYY-MM-DD_GP_AssetClass_Equity-or-Debt_MTG-XXXXXX
```

エクイティ / デットが未選択の場合は、その要素を省略する。

```text
2026-08-15_KKR_Infrastructure_MTG-000123
```

日付や分類を後から変更した場合は表示部分を更新できるが、Meeting IDは変更しない。

生成DocsをShared Driveの`Meeting Records`へ保存し、Meeting Indexへ参照を記録する。

## Past meeting records

面談記録ページ内で`新規登録`と`過去記録`を切り替える。

検索条件はすべて任意とする。

- 日付 From / To
- GP
- Asset Class
- Equity / Debt
- Status: Active / Inactive / すべて

条件未指定時は新しい順に表示する。一覧では日付、時間、GP、Asset Class、Equity / Debt、面談場所、面談相手等を表示し、長い面談本文は表示しない。

編集時は既存の面談入力フォームに読み込む。更新では同じMeeting IDと同じGoogle Docsを維持し、メタデータ、Docs本文、必要に応じてDocsファイル名、Meeting Indexを同期する。

物理削除は通常操作に含めず、Active / Inactive切替と再有効化を行う。同じ面談を複数人が編集する場合はVersion / Updated Atによる楽観的ロックで古い保存を拒否する。

## Pitchbook registration

- ドラッグ＆ドロップまたはファイル選択で登録する。
- 複数ファイルを一度に選択できる。
- ファイル、日付、GP、Asset Classは必須とする。
- エクイティ / デットは任意とする。
- 複数ファイルには同じ登録コンテキストを共通適用する。
- 保存ファイル名を利用者に自由入力させない。
- Apps Scriptが入力項目を使用して保存名を生成する。
- 1ファイル目から必ず連番を付ける。
- 後日同じ登録コンテキストで追加する場合は、既存の最大連番の次を採番する。
- 元の拡張子を維持する。
- ファイル名生成時は `/`、`&` 等の記号を除外し、不要な空白や区切りを整える。
- 登録成功後は選択ファイルのみクリアし、共通4項目は保持する。

エクイティ / デットが選択されている場合:

```text
YYYY-MM-DD_GP_AssetClass_Equity-or-Debt_Sequence.ext
```

未選択の場合:

```text
YYYY-MM-DD_GP_AssetClass_Sequence.ext
```

保存後、Pitchbook Indexへ参照情報を記録する。

## Past Pitchbooks

Pitchbookページ内で`新規登録`と`過去資料`を切り替える。

検索条件はすべて任意とし、日付 From / To、GP、Asset Class、Equity / Debt、Statusを用いる。結果は1ファイル1件で表示し、原ファイルを開く操作と編集操作を提供する。

編集可能なメタデータは日付、GP、Asset Class、Equity / Debtとする。修正時はPitchbook IndexとDrive上の保存ファイル名を同期する。変更後の登録コンテキストに既存ファイルがある場合は、その既存最大番号の次を採番する。旧コンテキスト側の欠番は詰め直さない。

Document IDとDrive File IDは変更しない。物理削除ではなくActive / Inactive切替と再有効化を用いる。初期実装ではファイル差し替えを行わず、誤った原ファイルは無効化し、正しいファイルを新規登録する。

## Masters

### GP Master

面談登録とPitchbook登録の両方から参照する。

最低限の論理項目は以下。

- GP ID: 作成後に変えない内部識別子
- GP Name: 利用者に表示する名称
- Status: Active / Inactive
- Created At / Updated At
- Created By / Updated By

GPの選択肢は常にGP Nameのアルファベット順で表示する。表示順を人手で管理するSort Orderは持たない。

面談・Pitchbook登録画面のGPプルダウンには`新しいGPを追加`を用意する。クイック追加では前後空白と大文字小文字を無視した重複確認を行い、追加成功後はそのGPを現在の選択値にする。

名称変更、無効化、再有効化等はマスター管理画面から行う。参照済みGPの物理削除は初期機能に含めない。

主要GPは初期seedとして登録する。初期候補にはAdvent International、Apollo、Ardian、Audax、Bain Capital、Blackstone、Brookfield、Carlyle、CD&R、CVC、EQT、General Atlantic、GIP、H.I.G.、HarbourVest、Harrison Street、Hines、Insight Partners、KKR、Macquarie、Neuberger Berman、New Mountain Capital、PAI Partners、Partners Group、Permira、Silver Lake、Stonepeak、TPG、Vista Equity Partners、Warburg Pincus等を含める。

### Option Master

以下の選択肢を1つの共通Option Masterで管理する。

- 面談場所
- Asset Class
- エクイティ / デット

カテゴリごとに固定Option ID、Type、表示名、Sort Order、Active / Inactiveを持たせる。登録画面からは新規Optionを追加せず、マスター管理画面から追加、名称変更、並び替え、無効化、再有効化を行う。

Asset Classの初期値と初期順序:

1. PE
2. VC
3. Infrastructure
4. Real Estate
5. PD
6. その他

Equity / Debtの初期値は`Equity`、`Debt`とする。

面談場所は詳細住所や都市ではなく、運用上の簡易カテゴリとする。初期候補は以下のような粒度とする。

- 当社オフィス
- 先方オフィス
- セミナー / カンファレンス
- オンライン
- 会食
- その他

Asset Class、Equity / Debt、面談場所の表示順はSort Orderによりマスター管理画面から変更できる。

## Master Management UI

マスター管理画面は、GP、Asset Class、Equity / Debt、面談場所を分かりやすく切り替えて管理できる構成とする。

- GP: 追加、名称変更、無効化、再有効化。表示は常にアルファベット順。
- Asset Class: 追加、名称変更、並び替え、無効化、再有効化。
- Equity / Debt: 追加、名称変更、並び替え、無効化、再有効化。
- 面談場所: 追加、名称変更、並び替え、無効化、再有効化。

## Backend Spreadsheet

バックエンドSpreadsheetは人が日常的に閲覧・編集する台帳ではなく、Web Appの小さなデータベースとして扱う。

基本構成は5シートだけとする。

### `GP_Master`

```text
GP_ID, GP_Name, Status, Created_At, Updated_At, Created_By, Updated_By
```

### `Option_Master`

```text
Option_ID, Type, Name, Sort_Order, Status, Created_At, Updated_At, Created_By, Updated_By
```

### `Meeting_Index`

```text
Meeting_ID, Date, Time, Location_ID, GP_ID, Asset_Class_ID, Capital_Type_ID,
Counterparty, Internal_Participants, Doc_File_ID, Doc_URL, Saved_Filename,
Status, Version, Created_At, Updated_At, Created_By, Updated_By
```

Date、GP_ID、Asset_Class_IDは必須。その他の面談入力由来項目は任意を許容する。面談本文は重複保存せず、Docsを正本とする。

### `Pitchbook_Index`

```text
Document_ID, Batch_ID, Date, GP_ID, Asset_Class_ID, Capital_Type_ID, Sequence_No,
File_ID, File_URL, Original_Filename, Saved_Filename, Status,
Created_At, Updated_At, Created_By, Updated_By
```

1ファイル1行とする。Capital_Type_IDは任意を許容する。Original FilenameとSaved Filenameの両方を保持する。

### `Settings`

```text
Key, Value, Description, Updated_At
```

初期設定候補:

- MEETING_FOLDER_ID
- PITCHBOOK_FOLDER_ID
- NEXT_GP_NO
- NEXT_OPTION_NO
- NEXT_MEETING_NO
- NEXT_DOCUMENT_NO
- NEXT_BATCH_NO
- SCHEMA_VERSION

採番はLockService配下で更新し、一度発行したIDを再利用しない。バックエンドでは行番号や表示順を永続識別子として使わない。通常操作では物理削除を避け、Active / Inactive等の状態で管理する。

Created By / Updated Byは利用者識別が取得可能な実行方式では記録し、取得できない場合は空欄を許容する。

## Validation rules

入力画面とApps Scriptサーバー側の両方で同じ必須条件を検証する。

Meeting:

- 日付、GP、Asset Class: 必須
- その他: 任意

Pitchbook:

- 1件以上のファイル、日付、GP、Asset Class: 必須
- Equity / Debt: 任意

入力エラーや保存エラーが発生した場合、利用者の書きかけ入力を消さない。

## Multi-user concurrency rules

複数人が同じWeb Appを同時利用することを通常ケースとして扱う。

以下の共有状態を変更する短い処理ではApps ScriptのLockServiceを用いて排他制御する。

- GP / Optionの新規追加やマスター更新
- Meeting ID / Document ID / Batch ID等の一意ID採番
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
- 高度な検索UI
- 自動要約・自動タグ付け

## Architectural rule

保存・蓄積の仕組みは、将来の検索方式を変更しても作り直さなくてよいように、Google Docsと原資料を正本として単純に保つ。利用者向けUIはHTML Serviceに閉じ、Google Sheetsはマスター・索引・設定のバックエンドとして扱う。Driveは正本保管に徹し、フォルダ階層を分類ロジックにしない。