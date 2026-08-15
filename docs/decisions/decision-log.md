# Decision Log

本ファイルには、現在も有効な主要判断だけを記録する。2026-08-14以前の旧プロダクト / UI / AppSheet / RAG / Vector DB / MVP / roadmap等の判断は撤回済みであり、現行要件として扱わない。

詳細契約は以下を優先する。

- 全体アーキテクチャ: `docs/architecture/target-architecture.md`
- 実運用: `docs/operations/runtime-policy.md`
- Gemini retrieval: `docs/ai/gemini-file-search.md`
- Security: `docs/governance/security.md`
- 実装順序と残課題: `docs/planning/mvp-and-roadmap.md`

## 2026-08-14 — Reset project direction

Status: Accepted

Knowledge Sharing Platformsを、複雑な共有プラットフォームではなく「少ない運用負荷で面談記録と原資料を蓄積し、必要な情報を後から取り出せる基盤」から再設計する。

- Google Workspaceを基本の入力・正本保管環境とする。
- 通常利用者にはGoogle Sheetsを直接編集させない。
- Shared Driveへ原資料を保存し、Sheetsにはマスター・Index・設定を保持する。
- 将来検索を見据えても、保存構造をAI都合で複雑化しない。

2026-08-15にGemini File Search検索レイヤーが採用され、この「将来検索」の具体方式は後続判断として確定した。

## 2026-08-14 / 15 — Use one shared Apps Script Web App

Status: Accepted

通常利用者の入口は、組織管理下の1つのGoogle Apps Script HTML Service Web Appとする。

- 利用者ごとにSpreadsheet / Web Appを複製しない。
- 面談記録、Pitchbook、ナレッジ検索、マスター管理を同一Web Appで提供する。
- 通常利用者はbackend Sheetsを直接編集しない。
- 各利用者のブラウザ上の未登録入力状態は独立させる。
- 恒久運用を個人アカウントへ依存させない。

本番のexecute-as方式は、組織管理下のデプロイ主体として実行してbackend権限を集約する方式を第一選択とする。ただし実利用者を安定して識別できることをリリース条件とし、識別できない場合はアクセスユーザー実行等の組織承認済み方式へ切り替える。

## 2026-08-15 — Fix Meeting registration contract

Status: Accepted

Meeting必須項目:

- 日付
- GP
- Asset Class

Meeting任意項目:

- 時間
- 面談場所
- Equity / Debt
- 面談相手
- 当社側
- 面談内容

面談実績だけを日付・GP・Asset Classで登録できる。

面談内容は大きな自由記載欄とし、縦スクロール、文字折り返し、改行保持を行う。

Apps Scriptが軽量なGoogle Docsを生成し、入力済み項目だけを`項目: 値`形式でミラーする。面談本文はDocsを正本とし、`Meeting_Index`へ全文を重複保存しない。

## 2026-08-15 — Share registration context

Status: Accepted

MeetingとPitchbook登録で以下を共通コンテキストとして扱う。

- 日付
- GP
- Asset Class
- Equity / Debt

- 一方で変更した値はもう一方へ反映する。
- サイドバー画面切替で消さない。
- 登録完了後も共通4項目は保持する。
- 登録成功時はページ固有入力だけをクリアする。
- 面談時間はMeeting固有項目とする。
- テキスト・選択値の下書きは同一ブラウザで24時間保持する。
- 再読込 / タブ終了後のファイル本体は復元せず、必要なら再選択する。

## 2026-08-15 — Use stable IDs and deterministic filenames

Status: Accepted

### Meeting

固定Meeting ID例:

```text
MTG-000123
```

基本ファイル名:

```text
YYYY-MM-DD_GP_AssetClass_Equity-or-Debt_MTG-XXXXXX
```

- 面談時間は含めない。
- Equity / Debt未選択時はその要素を省略する。
- Metadataを後から修正してもMeeting IDは変更しない。

### Pitchbook / source materials

固定Document ID / Batch IDを使用する。

基本ファイル名:

```text
YYYY-MM-DD_GP_AssetClass_Equity-or-Debt_Sequence.ext
```

- Equity / Debt未選択時はその要素を省略する。
- 1件目から`_01`等の連番を付ける。
- 後日同じ登録コンテキストへ追加する場合は既存最大番号の次を使う。
- Metadata変更で別コンテキストへ移動した場合も移動先の既存最大番号の次を使う。
- 旧コンテキストの欠番は詰め直さない。
- 元拡張子を維持する。
- `/`、`&`等の問題になりやすい記号は保存名生成時に除去・正規化する。

## 2026-08-15 — Keep Shared Drive flat

Status: Accepted

```text
Private Assets Knowledge
├─ Meeting Records
└─ Pitchbooks
```

年、GP、Asset Class等によるサブフォルダは作らない。分類・検索はbackend IndexとGemini File Search retrieval layerが担う。

Meeting Google DocsとPitchbook / source filesが正本であり、File Searchは正本ではない。

## 2026-08-15 — Use five backend Sheets as a small database

Status: Accepted

1つのbackend Spreadsheetに以下の5シートを置く。

1. `GP_Master`
2. `Option_Master`
3. `Meeting_Index`
4. `Pitchbook_Index`
5. `Settings`

通常利用者は直接編集しない。行番号や表示順を永続IDとして使わない。

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
Status, Version, Created_At, Updated_At, Created_By, Updated_By,
AI_Document_Name, AI_Index_Status, AI_Indexed_At, AI_Content_Hash, AI_Last_Error
```

### `Pitchbook_Index`

```text
Document_ID, Batch_ID, Date, GP_ID, Asset_Class_ID, Capital_Type_ID, Sequence_No,
File_ID, File_URL, Original_Filename, Saved_Filename, Status,
Created_At, Updated_At, Created_By, Updated_By,
AI_Document_Name, AI_Index_Status, AI_Indexed_At, AI_Content_Hash, AI_Last_Error
```

### `Settings`

```text
Key, Value, Description, Updated_At
```

少なくともDrive Folder ID、ID counters、`SCHEMA_VERSION`、管理者 / 監査参照、Gemini File Search Store名、Flash model ID、AI sync設定等を保持できる。

`Created_By / Updated_By`は本番では実利用者を記録できることを必須とする。利用者識別ができない構成を「空欄で許容して本番運用する」ことはしない。

AI index statusは`NotIndexed / Pending / Indexed / Failed`を使用する。

## 2026-08-15 — Finalize Masters

Status: Accepted

### GP Master

- immutable GP ID
- mutable GP Name
- Active / Inactive
- 選択肢は常にGP Nameのアルファベット順
- Sort Orderは持たない
- Meeting / Pitchbook画面から未登録GPをクイック追加できる
- 前後空白と大文字小文字を無視した重複確認を行う
- 追加したGPをその場で選択する

主要GPを初期seedとして登録する。代表候補にはAdvent International、Apollo、Ardian、Audax、Bain Capital、Blackstone、Brookfield、Carlyle、CD&R、CVC、EQT、General Atlantic、GIP、H.I.G.、HarbourVest、Harrison Street、Hines、Insight Partners、KKR、Macquarie、Neuberger Berman、New Mountain Capital、PAI Partners、Partners Group、Permira、Silver Lake、Stonepeak、TPG、Vista Equity Partners、Warburg Pincus等を含める。

### Option Master

Type:

- `LOCATION`
- `ASSET_CLASS`
- `CAPITAL_TYPE`

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

面談場所初期候補:

- 当社オフィス
- 先方オフィス
- セミナー / カンファレンス
- オンライン
- 会食
- その他

OptionはSort Orderで並び替え可能とする。

マスターの追加、名称変更、並び替え、無効化、再有効化は全利用者に許可する。名称変更・無効化には確認ダイアログを表示し、すべて監査ログへ記録する。通常操作では物理削除しない。

## 2026-08-15 — Add past-record management and logical deactivation

Status: Accepted

Meeting / Pitchbookページはそれぞれ`新規登録`と`過去記録 / 過去資料`を切り替える。

検索条件はすべて任意:

- 日付 From / To
- GP
- Asset Class
- Equity / Debt
- Status

検索用プルダウンはUI専用の`未選択`を初期値とし、`未選択`は「その条件で絞らない」を意味する。Masterやsource Metadataへ保存しない。

Meeting更新は同じMeeting ID / Google Docsを維持し、Metadata、本文、Index、必要な保存名を同期する。

Pitchbook更新は同じDocument ID / Drive File IDを維持し、Metadataと保存名を同期する。

通常利用者向け物理削除は提供せず、Active / Inactive / Reactivateを使用する。

同一Meetingの同時編集はVersion / Updated Atによる楽観的ロックで古い保存を拒否する。

## 2026-08-15 — Finalize upload, retry, and audit operations

Status: Accepted

### Upload limits

- 1ファイル100MBまで
- 1回最大10ファイル
- 1回合計500MBまで

### Partial failure

Pitchbook / source-material batchはファイル単位で処理する。

- 成功済みファイルは他ファイル失敗を理由にロールバックしない。
- 失敗分だけ再試行する。
- 同じBatch ID / Document ID / 予約済み連番を使う。
- retry前にDrive / Index状態を確認し、二重ファイル / 二重Index行を作らない。
- 欠番は詰め直さない。

### Audit

- 監査ログは5年間保持する。
- 通常backend 5シートとは別の管理者専用Spreadsheetへ保存する。
- 通常利用者は閲覧できない。
- 面談、Pitchbook、Master、AI index、AI queryの対象操作を記録する。
- 面談本文全文、Pitchbook内容、Gemini回答全文、retrieved chunk全文、Embeddingは監査ログへ複製しない。

詳細は`docs/operations/runtime-policy.md`を正本とする。

## 2026-08-15 — Adopt Gemini File Search retrieval

Status: Accepted

蓄積済みMeeting / Pitchbook / source materialsを横断検索・整理・要約するAIレイヤーとしてGemini API File Searchを採用する。

- Shared Driveは正本のまま維持する。
- File Search Storeは再生成可能な派生検索インデックスとする。
- 初期は1 Storeのみ使用する。
- File Searchにchunking、Embedding、vector storage、semantic retrievalを任せる。
- exact filteringはCustom Metadataを利用する。
- 独自Vector DB、独自Embedding pipeline、自動キーワードタグ体系、Knowledge Graphは初期実装に含めない。
- Inactive資料は通常AI検索から除外する。
- AI index障害で正本登録をロールバックしない。
- CitationとMetadataを使い元Drive資料へ戻れるようにする。

詳細Decision: `docs/decisions/gemini-file-search-retrieval.md`

## 2026-08-15 — Finalize AI access, sync, model, formats, and audit

Status: Accepted

- Web App利用者は全員、すべてのActive indexed sourceを検索できる。
- 利用者別 / ファイル別retrieval ACLは初期版に含めない。
- 初期AIモデルは設定されたGemini Flash 1モデルだけを使用し、利用者向けモデル選択やDeep modeは設けない。
- AI syncは15分おきのApps Script time-driven workerを使用する。
- 新規 / 更新は正本処理を先に完了し、AI状態を`Pending`として非同期indexする。
- AI queryを5年監査ログ対象とする。

初期AI検索対象形式:

```text
.pdf
.pptx
.xlsx
.docx
.txt
.eml
```

`.eml`は原本をShared Driveに保存し、Subject / From / To / Cc / Date / Body等をテキスト化してindexする。添付ファイルは自動indexせず、必要な添付は別登録する。`.msg`は初期対応外とする。

## 2026-08-15 — Adopt five-mode Knowledge Search target UX

Status: Accepted

ナレッジ検索画面のTarget UXは以下の5モードとする。

```text
自由質問 | 要約 | 時系列 | 比較 | 面談準備
```

- `自由質問`を初期表示とする。
- 共通フィルターはDate From / To、GP、Asset Class、Equity / Debt、Source Typeとする。
- すべての任意プルダウンは`未選択`を初期値とし、`未選択`はfilterを適用しないUI状態とする。
- 5モードは同じFile Search Store、Metadata Filter、semantic retrieval、Gemini Flash、Citation / Drive link処理を共有する。
- presetは別検索基盤ではなくprompt / output templateとして実装する。
- preset時は質問欄を任意の`追加指示`として利用できる。
- すべてのモードでsource citationと元Drive資料へのリンクを表示する。
- 根拠不足時は不足を明示し、推測で補完しない。

実装は`自由質問`を先行し、同じretrieval layerへ`要約 / 時系列 / 比較 / 面談準備`を段階追加してよい。ただし5モード構成自体は採用済みTarget UXであり、未決定事項ではない。
