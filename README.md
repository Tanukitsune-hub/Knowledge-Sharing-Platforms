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

面談登録画面の入力項目と必須 / 任意は以下とします。

- 日付: 必須。手入力またはカレンダー選択
- 時間: 任意。入力時は`HH:mm`へ正規化
- 面談場所: 任意。Option Masterから選択
- GP: 必須。GP Masterから選択。存在しない場合は画面上でクイック追加可能
- Asset Class: 必須。Option Masterから選択
- エクイティ / デット: 任意。Option Masterから選択
- 面談相手: 任意。自由入力
- 当社側: 任意。自由入力
- 面談内容: 任意。大きな自由記載欄

面談実績だけを先に記録できるよう、日付・GP・Asset Classだけでも登録可能とします。

面談内容欄は十分な高さを持たせ、長文は欄内で縦スクロールします。横スクロールは使用せず、文字を自動折り返しし、入力した改行は保持します。

登録するとApps Scriptが軽量なGoogle Docsを生成します。表や過度な装飾を使わず、入力済み項目だけを`項目: 値`形式でコンパクトにミラーします。任意項目が未入力の場合は、その行を省略します。

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

面談Docsの基本ファイル名は以下とし、時間はファイル名に含めません。任意のエクイティ / デットが未選択の場合は、その要素を省略して不要な区切りを残しません。

```text
YYYY-MM-DD_GP_AssetClass_Equity-or-Debt_MTG-XXXXXX
```

例:

```text
2026-08-15_KKR_Infrastructure_Equity_MTG-000123
2026-08-15_KKR_Infrastructure_MTG-000124
```

日付、GP等を後から修正した場合もMeeting IDは変更しません。

### Past meeting records

面談記録ページ内に`新規登録`と`過去記録`の切替を設けます。

過去記録の検索条件はすべて任意とし、以下を用意します。

- 日付 From / To
- GP
- Asset Class
- Equity / Debt
- Status: Active / Inactive / すべて

条件を指定しない場合は新しい面談から表示します。一覧には日付、時間、GP、Asset Class、Equity / Debt、面談場所、面談相手等を表示し、長い面談本文は一覧に表示しません。

編集時は既存の面談入力フォームへ読み込み、同じMeeting IDと同じGoogle Docsを更新します。メタデータ変更時はDocs本文、Index、必要に応じてファイル名を同期更新します。物理削除は行わず、Active / Inactiveの切替と再有効化を行います。同一面談の同時編集はVersion / Updated Atで競合検知し、古い画面からの上書きを拒否します。

### Pitchbooks and other source materials

- HTML ServiceのPitchbook登録画面からファイルを登録する。
- ドラッグ＆ドロップと複数ファイルの一括登録に対応する。
- ファイル、日付、GP、Asset Classは必須とする。
- エクイティ / デットは任意とする。
- Apps Scriptが入力項目を保存ファイル名に使用し、利用者に保存ファイル名を自由入力させない。
- 1ファイル目から常に連番を付ける。
- 後日、同じ登録コンテキストで追加した場合は既存の最大連番の次を採番する。
- 元の拡張子を維持する。
- ファイル名生成時は `/`、`&` 等の記号を除外し、不要な空白や区切りを整える。

エクイティ / デットが選択されている場合:

```text
YYYY-MM-DD_GP_AssetClass_Equity-or-Debt_Sequence.ext
```

未選択の場合:

```text
YYYY-MM-DD_GP_AssetClass_Sequence.ext
```

例:

```text
2026-08-15_KKR_Infrastructure_Equity_01.pdf
2026-08-15_KKR_Infrastructure_02.pdf
```

### Past Pitchbooks

Pitchbookページ内にも`新規登録`と`過去資料`の切替を設けます。

検索条件は面談と同様に、日付 From / To、GP、Asset Class、Equity / Debt、Statusをすべて任意で指定できます。一覧は1ファイル1件とし、元ファイルを開く操作と編集操作を提供します。

編集可能なメタデータは日付、GP、Asset Class、Equity / Debtです。修正時はPitchbook IndexとDrive上の保存ファイル名を同期更新します。変更後の登録コンテキストですでに連番が存在する場合は、そのコンテキストの既存最大番号の次を新たに採番します。旧コンテキスト側の欠番は詰め直しません。Document IDとDrive File IDは変更しません。

Pitchbookも物理削除せずActive / Inactiveで管理し、Inactiveから再有効化できます。初期実装ではファイル差し替え機能を持たせず、誤った原ファイルは無効化して正しいファイルを新規登録します。

### Masters

GPは独立したGP Masterとして管理します。各GPには固定GP ID、表示名、Active / Inactiveを持たせます。

- GPの選択肢は常にGP Nameのアルファベット順で表示する。
- 面談・Pitchbook登録画面のGPプルダウンから`新しいGPを追加`を選び、クイック追加できる。
- GP追加時は前後空白と大文字小文字を無視した重複確認を行う。
- 追加したGPはその場で選択状態にする。
- GPの名称変更、無効化、再有効化等はマスター管理画面から行う。

主要GPは初期データとしてあらかじめ登録します。初期候補にはAdvent International、Apollo、Ardian、Audax、Bain Capital、Blackstone、Brookfield、Carlyle、CD&R、CVC、EQT、General Atlantic、GIP、H.I.G.、HarbourVest、Harrison Street、Hines、Insight Partners、KKR、Macquarie、Neuberger Berman、New Mountain Capital、PAI Partners、Partners Group、Permira、Silver Lake、Stonepeak、TPG、Vista Equity Partners、Warburg Pincus等を含めます。

面談場所、Asset Class、エクイティ / デットは共通のOption Masterで管理します。これらは登録画面から追加せず、マスター管理画面で追加、名称変更、並び替え、無効化、再有効化を行います。

マスター管理画面は`GP / Asset Class / Equity / Debt / 面談場所`を分かりやすく切り替えられる構成とします。

Asset Classの初期値と初期表示順は以下とします。

1. PE
2. VC
3. Infrastructure
4. Real Estate
5. PD
6. その他

Asset Class、Equity / Debt、面談場所は`Sort_Order`を持ち、マスター管理画面から表示順を変更できるようにします。Equity / Debtの初期値は`Equity`、`Debt`です。

面談場所は住所や都市を詳細に管理せず、運用上必要な簡易カテゴリに留めます。初期候補は`当社オフィス`、`先方オフィス`、`セミナー / カンファレンス`、`オンライン`、`会食`、`その他`等です。

無効化した選択肢は新規登録画面から外しますが、過去データとの紐付けは維持します。

### Backend Spreadsheet

1つのバックエンドSpreadsheetに、以下の5シートだけを基本構成として持ちます。

1. `GP_Master`
2. `Option_Master`
3. `Meeting_Index`
4. `Pitchbook_Index`
5. `Settings`

通常利用者は直接編集せず、Web App経由で読み書きします。行番号や並び順を識別子として使わず、固定IDでレコードを管理します。データは原則として物理削除せず、Active / Inactiveで管理します。

最終カラム構成は以下を基本契約とします。

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

Settingsには`MEETING_FOLDER_ID`、`PITCHBOOK_FOLDER_ID`、`NEXT_GP_NO`、`NEXT_OPTION_NO`、`NEXT_MEETING_NO`、`NEXT_DOCUMENT_NO`、`NEXT_BATCH_NO`、`SCHEMA_VERSION`等を保持できます。採番更新はLockService配下で行い、一度発行したIDを再利用しません。

Meeting本文はDocsを正本とし、Meeting Indexには本文を重複保存しません。PitchbookもShared Drive上の原ファイルを正本とし、Indexには検索・管理に必要なメタデータと参照だけを保持します。`Created_By / Updated_By`は取得可能な実行方式であれば記録し、取得できない場合は空欄を許容します。

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
9. 登録項目を必要以上に必須化せず、面談実績だけでも残せるようにする。
10. 原資料を正本として保持し、将来の検索結果やAI回答から原資料へ戻れる設計にする。
11. 技術選定は必要になった時点で行い、RAG、Vector DB、外部Web基盤等を先回りして導入しない。
12. 実際の機密情報、面談記録、Pitchbook、認証情報をGitHubへ保存しない。

## Not decided yet

以下は今後の検討事項です。

- マスター管理機能の変更・無効化を全利用者へ許可するか、管理者へ限定するか
- ブラウザ更新・タブ終了後まで下書きを保持するか、明示的な入力クリア操作をどうするか
- 大容量Pitchbookの実用上の上限、対応ファイル形式、アップロード方式
- 登録途中で一部処理だけ失敗した場合の再試行・二重登録防止
- Web Appの実行主体設定と利用者識別・監査ログの詳細
- GP重複登録時の統合機能
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