# Product Vision

## Purpose

プライベートアセット領域のMeeting recordsとPitchbook / source materialsを、利用者の入力負荷を抑えながら継続的に蓄積し、後から検索・修正・整理・要約・比較できる状態を作る。

Google Workspaceを正本・運用基盤とし、その上にGemini File Searchを再生成可能な検索レイヤーとして載せる、シンプルな業務ツールを目指す。

## Current implementation status

Works 0004–0011は実装・マージ済みで、Work 0012は通常利用者向けApps Script公開ファサードとKnowledge Exportの安全性をhardeningした。アプリケーションrelease versionは`0.1.2`である。Work 0010–0011のDEV実機qualification（Shared Drive固有挙動、Docs/PDFリンク、Gemini、clipboard等）は未観測の項目を残しており、本番デプロイ完了とは扱わない。

## Core user experience

通常利用者は、組織管理下の1つのApps Script HTML Service Web Appを共通URLから利用する。

主要画面:

1. `面談記録` — 新規登録 / 過去記録
2. `Pitchbook` — 新規登録 / 過去資料
3. `ナレッジ検索`
4. `マスター管理`

通常利用者はbackend Sheets、Audit Spreadsheet、File Searchを直接操作しない。

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

Apps Scriptが軽量Google Docsへ入力済み項目を`項目: 値`形式でミラーする。Meeting bodyはDocsを正本とし、`Meeting_Index`へ全文duplicateしない。

Fixed Meeting ID example:

```text
MTG-000123
```

Filename:

```text
YYYY-MM-DD_GP_AssetClass_Equity-or-Debt_MTG-XXXXXX
```

Timeはfilenameへ含めず、Equity / Debt未選択時はそのsegmentを省略する。

## Pitchbooks / source materials

Required:

- file
- Date
- GP
- Asset Class

Optional:

- Equity / Debt

Features:

- drag & drop / multiple files
- generated filename
- sequence starts at `_01`
- later additions continue from existing maximum
- 25MB/file
- 10 files/selection
- 100MB total/selection

```text
YYYY-MM-DD_GP_AssetClass_Equity-or-Debt_Sequence.ext
```

25MBでもApps Script実機制約が確認された場合は、upload architectureを複雑化するより安全な低い上限へ変更することを優先する。

## Shared registration context

Meeting / Pitchbook間で以下をbrowser state共有する。

- Date
- GP
- Asset Class
- Equity / Debt

画面切替 / registration successで共通4項目を自動消去しない。page-specific inputだけを成功時にclearする。text / selection draftは同一browserで24h保持する。

## Past records and corrections

Meeting / Pitchbookともoptional filtersで過去記録を検索できる。

- Date From / To
- GP
- Asset Class
- Equity / Debt
- Status

固定Meeting ID / Document ID / Drive File IDを維持しながらedit / rename / Index syncする。通常操作はActive / Inactive / Reactivateを使用する。

## Masters

- GP: immutable GP ID, mutable name, Active/Inactive, alphabetical display, quick-add
- Location / Asset Class / Equity-Debt: Option Master, immutable Option ID, Sort Order, Active/Inactive
- all users may add / rename / reorder / deactivate / reactivate allowed Masters
- rename / deactivate requires confirmation + audit event
- normal-user physical deletion is not provided

Initial Asset Classes:

```text
PE / VC / Infrastructure / Real Estate / PD / その他
```

## Authoritative storage

```text
Private Assets Knowledge
├─ Meeting Records
└─ Pitchbooks
```

Keep source folders flat.

Backend Spreadsheet:

1. `GP_Master`
2. `Option_Master`
3. `Meeting_Index`
4. `Pitchbook_Index`
5. `Settings`

Audit logs are stored in a separate Restricted admin-only Spreadsheet.

## Audit and access model

Initial Web App users share access to all Active sources. Do not implement per-user / per-file retrieval ACLs initially. Internet-public access is not assumed.

Actor attribution is best-effort:

1. email if available
2. otherwise temporary active user key if available
3. otherwise `UNIDENTIFIED`

Persistent actual-user identification is not required for production operation.

Audit Spreadsheet is restricted by Google Drive sharing permissions and opened directly by admins when needed. Initial Web App does not require an Audit Viewer or custom password screen.

## Knowledge Export / external-AI handoff

Knowledge ExportはGemini資格情報に依存せず、Backend Indexで`Active`の資料を解決する。Meetingは正本Google Doc本文を含め、Pitchbookは本文を複製せずmetadataとstable File IDに結び付いたauthoritative Drive linkだけを含める。Google DocsまたはPDFをKnowledge Exports sibling folderへ生成する。

サーバーはMeeting 50件超、Pitchbook 200件超、またはMeeting本文250,000文字超で処理を停止し、件数超過時にはMeeting Docを読み取らない。5モードの外部AI向けpromptはGP、Asset Class、Equity / Debtの表示名とstable IDを併記する。Prompt本文、原文、回答、chunk、embedding、bytesはAuditへ保存しない。

Exportは正本の派生コピーであり、権限設定のドリフトと無期限蓄積のリスクを持つ。permission equivalenceとretention運用はproduction前にDEVで確認する。

## Knowledge retrieval with Gemini

```text
Shared Drive = authoritative source
Sheets       = exact metadata / index
File Search  = rebuildable semantic retrieval index
Gemini Flash = grounded synthesis / summary / comparison
```

Accepted baseline:

- one Gemini File Search Store initially
- Custom Metadata for exact filtering
- File Search managed embeddings for semantic retrieval
- no custom Vector DB / embedding pipeline / tag taxonomy / Knowledge Graph initially
- only Active records retrievable
- one configured Gemini Flash model
- no model selector / Deep mode
- 15-minute AI sync worker
- AI indexing failure never rolls back authoritative registration
- every grounded output links back to source

Initial AI-searchable formats:

```text
.pdf
.pptx
.xlsx
.docx
.txt
.eml
```

EML original remains in Drive; normalized Subject / From / To / Cc / Date / Body is indexed. Embedded attachments are not auto-indexed. `.msg` is initially out of scope.

## Knowledge Search target UX

```text
自由質問 | 要約 | 時系列 | 比較 | 面談準備
```

`自由質問` is default.

Shared filters:

- Date From / To
- GP
- Asset Class
- Equity / Debt
- Source Type: Meeting / Pitchbook

5 modes share one retrieval / citation layer; presets change prompt/output template only.

Mode purpose:

- 自由質問: grounded Q&A
- 要約: cross-source synthesis
- 時系列: chronology + change / continuity
- 比較: common-dimension comparison
- 面談準備: recent information, changes, unresolved topics, reconfirmation points, next questions

All modes show source citations / Drive links and surface insufficient evidence rather than inventing content.

## Apps Script-first setup

Administrator runs idempotent setup functions to create / reuse / validate Workspace resources.

```text
setupKnowledgePlatform_()
validateInstallation_()
getInstallationStatus_()
```

These are editor-only/private Apps Script entry points; normal users cannot call them through `google.script.run`.

Normal production setup does not require Node.js, clasp, external server, custom DB, or manual construction of all Sheets / triggers / Master seeds.

## Principles

- simplicity first
- authoritative source and AI index are separate
- users interact through one Web App
- do not over-structure free-form Meeting notes
- use shared Masters only where normalization matters
- keep Drive flat; classify through metadata
- exact filters via metadata, semantic relevance via embeddings
- every AI output must trace back to source
- AI failure must not block source capture
- do not add architecture to preserve arbitrary upload limits or user-identification requirements

## Explicit non-goals for initial product

- AppSheet-based UI
- separate external web frontend
- Wiki / SNS / Like / comments
- mailbox-wide automatic ingestion
- custom Vector DB / embedding infrastructure
- Knowledge Graph
- complex tag taxonomy
- per-user / per-file AI ACL
- multiple user-selectable AI models
- Web App internal Audit Viewer
- custom audit password authentication
- strict persistent user identity / non-repudiation
- Outlook `.msg`
- automatic EML attachment indexing
- AI autonomous investment decisions
- public-web enrichment inside same retrieval request

## Current phase

Implementation-ready planning. Product design is largely settled; remaining work is implementation, runtime validation, and a small number of concrete settings described in `docs/planning/apps-script-implementation-plan.md`.
