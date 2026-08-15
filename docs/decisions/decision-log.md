# Decision Log

本ファイルには現在も有効な重要判断だけを記録する。

## 2026-08-14 — Project direction reset

Status: Accepted

従来のKnowledge Sharing Platforms計画を破棄し、シンプルな蓄積基盤から全面的に再設計する。

### Accepted baseline

- 面談記録とPitchbook等の原資料を、少ない入力負荷で継続的に蓄積する。
- Apps Scriptで一貫した形式・命名規則のGoogle Docsや保存ファイルを生成する。
- 面談記録とPitchbook等の正本は組織管理下のShared Driveへ保存する。
- Google Sheetsにはマスターと最低限の索引・参照情報を保持する。
- 将来、面談記録と原資料を横断して必要な情報を取り出せる状態を目指す。

### Withdrawn

2026-08-14以前に記録されていたUI、AppSheet、検索、RAG、Vector DB、AI処理、MVP、ロードマップ、詳細アーキテクチャ等の個別判断は、現行方針としてすべて撤回する。

必要な要素は今後の詳細検討で改めて判断する。旧計画を根拠に自動的に復活させない。

## 2026-08-14 — Use Apps Script HTML Service as the registration UI

Status: Accepted

通常利用者にはGoogle Sheetsを直接操作させず、Google Apps Script HTML Serviceによる独立したWeb Appを入口とする。

主要画面は面談記録、Pitchbook登録、マスター管理を中心とする。Google SheetsはGP Master、Option Master、Meeting Index、Pitchbook Index等を保持するバックエンドとして扱う。

AppSheetや別の外部Web基盤は現時点では導入しない。

## 2026-08-14 — Share one GP master across meeting and Pitchbook workflows

Status: Accepted

面談記録とPitchbook登録は同じGPマスターを参照する。

- 各GPに変更しない固定GP IDを付与する。
- GP Nameは表示名として変更可能とする。
- StatusとしてActive / Inactiveを持たせる。
- ActiveなGPだけを新規登録画面の選択肢に表示する。
- 選択肢に存在しないGPは新規追加できる。
- 管理画面で新規追加、名称変更、無効化、再有効化を可能にする。
- 過去データはGP IDで紐付け、名称変更や無効化で参照関係を壊さない。
- 参照済みGPの物理削除は初期機能に含めない。
- GP統合は将来必要性が確認された場合に検討する。

## 2026-08-15 — Use one shared Web App for multiple users

Status: Accepted

利用者ごとにSpreadsheetやWeb Appのコピーを作らず、組織管理下の1つのApps Script HTML Service Web Appを共通URLから複数人で利用する。

- GP Master、Option Master、Meeting Index、Pitchbook Index、Shared Drive上の正本は全利用者で共有する。
- 各利用者のブラウザ上の入力状態は独立し、複数人が同時に別々の登録作業を行える前提とする。
- 共通バックエンドへの書込みで競合すると困る部分だけ、Apps ScriptのLockServiceで排他制御する。
- ロック対象にはマスター追加・更新、一意ID採番、Pitchbook連番確定、整合性が必要なIndex更新等を含める。
- ファイルアップロードやDocs生成等を含む処理全体を長時間ロックしない。
- 同一面談記録を複数人が編集する場合は、Meeting IndexのUpdated AtまたはVersionを利用した楽観的ロックで競合を検知する。
- 編集開始後に他利用者が更新していた場合は無条件に上書きせず、保存を止めて最新内容の再読込を求める。

Web Appを「デプロイしたユーザーとして実行」するか「アクセスしているユーザーとして実行」するかは、権限、監査、利用者識別の要件を実機で確認した上で実装時に確定する。恒久運用を個人アカウントに依存させない。

## 2026-08-15 — Fix the meeting input fields and compact Docs mirror format

Status: Accepted

面談登録画面の基本入力項目を以下とする。

1. 日付 — 手入力とカレンダー選択の両方に対応
2. 時間 — 入力
3. 面談場所 — 選択肢
4. GP — 選択肢
5. Asset Class — 選択肢
6. エクイティ / デット — 選択肢
7. 面談相手 — 自由入力
8. 当社側 — 自由入力
9. 面談内容 — 自由記載

面談場所、Asset Class、エクイティ / デットは共通Option Masterで管理し、追加、名称変更、無効化、再有効化を可能にする。GPは独立したGP Masterを使用する。

面談内容入力欄は十分な高さを持ち、長文は欄内で縦スクロールする。横スクロールは使わず、文字を自動折り返しする。改行は保持する。

生成するGoogle Docsは表や装飾を避けた軽量・プレーンな形式とし、`日付: 2026-08-15`、`時間: 10:30` のように各項目を1行でコンパクトにミラーする。面談内容も入力本文をそのまま反映する。

## 2026-08-15 — Share registration context between Meeting and Pitchbook pages

Status: Accepted

面談登録とPitchbook登録で、以下の4項目を共通コンテキストとして扱う。

- 日付
- GP
- Asset Class
- エクイティ / デット

時間は面談ページ固有の項目とし、Pitchbookの保存名や共通コンテキストには使用しない。

- 一方の画面で入力または変更した値は、もう一方にも反映する。
- サイドバーで画面を切り替えても値を保持する。
- 面談またはPitchbookの登録が完了しても共通4項目は保持する。
- 登録完了時には、そのページ固有の入力だけをクリアする。
- サイドバーで別画面へ移動しただけでは、各ページの未登録の書きかけ内容や選択済みファイルを消さない。
- 共通コンテキストと各ページの下書き状態は利用者ブラウザ内で保持し、別利用者には共有しない。

## 2026-08-15 — Use stable Meeting IDs and deterministic meeting filenames

Status: Accepted

各面談記録にはシステムが固定Meeting IDを発行する。例: `MTG-000123`。

面談Docsの基本ファイル名は以下とする。

```text
YYYY-MM-DD_GP_AssetClass_Equity-or-Debt_MTG-XXXXXX
```

- 面談時間はファイル名に含めない。
- Equity / Debtが未選択の場合は、その要素を省略する。
- 同日・同GP・同分類の面談もMeeting IDで識別する。
- 日付、GP、Asset Class等を後から修正してもMeeting IDは変更しない。

## 2026-08-15 — Use shared fields and persistent sequence numbers in Pitchbook filenames

Status: Accepted

Pitchbookの保存ファイル名には日付、GP、Asset Classを必ず使用し、エクイティ / デットは選択されている場合のみ使用する。

基本形:

```text
YYYY-MM-DD_GP_AssetClass_Equity-or-Debt_Sequence.ext
```

Equity / Debt未選択時:

```text
YYYY-MM-DD_GP_AssetClass_Sequence.ext
```

- 利用者に保存ファイル名を自由入力させない。
- 1ファイル目から常に`_01`等の連番を付ける。
- 複数ファイルには順番に連番を付与する。
- 後日、同じ登録コンテキストでファイルを追加した場合は既存最大番号の次を採番する。
- 元の拡張子を維持する。
- `/`、`&`等の記号は命名時に除外し、不要な空白や区切りを整える。

## 2026-08-15 — Keep Shared Drive storage flat

Status: Accepted

Shared Driveの正本保管領域は以下の2フォルダだけとする。

```text
Private Assets Knowledge
├─ Meeting Records
└─ Pitchbooks
```

年、GP、Asset Class等による下位フォルダは作らず、各フォルダ内に規則的なファイル名でフラットに蓄積する。Driveは正本保管に徹し、分類・検索はIndexと将来の検索レイヤーが担う。

## 2026-08-15 — Use five backend Sheets as a small database

Status: Accepted

1つのバックエンドSpreadsheetに以下の5シートを置く。

1. `GP_Master`
2. `Option_Master`
3. `Meeting_Index`
4. `Pitchbook_Index`
5. `Settings`

- 通常利用者は直接編集しない。
- 行番号や並び順を永続識別子として使わず、固定IDでレコードを参照する。
- 面談本文はGoogle Docsを正本とし、Meeting Indexへ重複保存しない。
- PitchbookはShared Drive上の原ファイルを正本とし、Pitchbook Indexは1ファイル1行で参照とメタデータを保持する。
- `Original Filename`と`Saved Filename`の両方を保持する。
- 日常運用では物理削除よりActive / Inactive等の状態管理を優先する。
- `Settings`にはDrive Folder IDやスキーマバージョン等のシステム設定を保持できる。

## 2026-08-15 — Keep meeting-location options coarse

Status: Accepted

面談場所は住所や都市を詳細に構造化せず、運用上の簡易カテゴリとして管理する。

初期候補は以下のような粒度とする。

- 当社オフィス
- 先方オフィス
- セミナー / カンファレンス
- オンライン
- 会食
- その他

これらはOption Masterの`LOCATION`カテゴリとして管理し、必要に応じて追加、名称変更、無効化、再有効化できる。

## 2026-08-15 — Set master seeds and ordering behavior

Status: Accepted

Asset Classの初期値と初期表示順を以下とする。

1. PE
2. VC
3. Infrastructure
4. Real Estate
5. PD
6. その他

Equity / Debtの初期値は`Equity`、`Debt`とする。

- Asset Class、Equity / Debt、面談場所はOption Masterの`Sort_Order`を持ち、マスター管理画面から並び替えできる。
- GPはSort Orderを持たず、選択肢を常にGP Nameのアルファベット順で表示する。
- 主要GPは初期seedとして登録する。
- 面談 / Pitchbook画面のGPプルダウンから未登録GPをクイック追加できる。
- クイック追加時は前後空白と大文字小文字を無視して重複確認し、追加後はそのGPを現在の選択値にする。
- Asset Class、Equity / Debt、面談場所の新規追加は登録画面ではなくマスター管理画面から行う。

## 2026-08-15 — Finalize backend Sheet column contracts

Status: Accepted

`GP_Master`

```text
GP_ID, GP_Name, Status, Created_At, Updated_At, Created_By, Updated_By
```

`Option_Master`

```text
Option_ID, Type, Name, Sort_Order, Status, Created_At, Updated_At, Created_By, Updated_By
```

`Meeting_Index`

```text
Meeting_ID, Date, Time, Location_ID, GP_ID, Asset_Class_ID, Capital_Type_ID,
Counterparty, Internal_Participants, Doc_File_ID, Doc_URL, Saved_Filename,
Status, Version, Created_At, Updated_At, Created_By, Updated_By
```

`Pitchbook_Index`

```text
Document_ID, Batch_ID, Date, GP_ID, Asset_Class_ID, Capital_Type_ID, Sequence_No,
File_ID, File_URL, Original_Filename, Saved_Filename, Status,
Created_At, Updated_At, Created_By, Updated_By
```

`Settings`

```text
Key, Value, Description, Updated_At
```

- MeetingではDate、GP_ID、Asset_Class_IDのみ必須。その他の面談入力由来項目は任意を許容する。
- Pitchbookではファイル、Date、GP_ID、Asset_Class_IDを必須とし、Capital_Type_IDは任意を許容する。
- Created By / Updated Byは取得可能なWeb App実行方式では記録し、取得できない場合は空欄を許容する。
- SettingsにはDrive Folder ID、採番値、SCHEMA_VERSION等を保持し、採番更新はLockService配下で行う。
- 一度発行したIDを再利用しない。

## 2026-08-15 — Allow lightweight meeting records and optional capital type

Status: Accepted

面談実績だけを登録する運用を許容する。

Meetingの必須項目:

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

Google Docsでは未入力の任意項目の行を省略する。

Pitchbookではファイル、日付、GP、Asset Classを必須、Equity / Debtを任意とする。

入力画面とApps Scriptサーバー側の両方で同じ必須条件を検証し、エラー時に書きかけ入力を消さない。

## 2026-08-15 — Add past Meeting and Pitchbook management with logical deactivation

Status: Accepted

### Meeting

面談ページ内で`新規登録`と`過去記録`を切り替える。

検索条件はすべて任意とし、以下を提供する。

- 日付 From / To
- GP
- Asset Class
- Equity / Debt
- Status: Active / Inactive / すべて

条件未指定時は新しい順に表示する。編集時は同じMeeting IDとGoogle Docsを維持し、フォーム、Docs、Index、必要な保存ファイル名を同期更新する。物理削除は行わず、無効化と再有効化を行う。

### Pitchbook

Pitchbookページ内で`新規登録`と`過去資料`を切り替える。

検索条件は面談と同じく、日付 From / To、GP、Asset Class、Equity / Debt、Statusをすべて任意とする。

編集可能なメタデータは日付、GP、Asset Class、Equity / Debtとする。変更時はPitchbook IndexとDrive上の保存ファイル名を同期する。変更先コンテキストに既存ファイルがある場合は、その最大連番の次を新たに採番する。旧コンテキストの欠番は詰め直さない。Document IDとDrive File IDは維持する。

Pitchbookも物理削除せず無効化 / 再有効化を行う。初期実装ではファイル差し替え機能を持たず、誤ファイルは無効化し、正しいファイルを新規登録する。