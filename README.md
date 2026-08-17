# Knowledge Sharing Platforms

プライベートアセット領域のMeeting recordsとPitchbook / source materialsを、少ない運用負荷で蓄積し、検索・整理・要約・比較できるようにするナレッジ基盤です。

## Status

Works 0004–0011は実装・マージ済みです。Work 0012では、Apps Scriptの公開ファサード境界、Knowledge Exportの資源上限・リンク整合性、公開エラーの秘匿、および決定論的回帰検証をhardeningしました。アプリケーションrelease versionは`0.1.2`です。

Work 0010–0011で定義されたDEVのブラウザ / Shared Drive / Docs / PDF / Gemini実機qualificationは、環境依存の確認項目として引き続き未観測です。本書は本番デプロイ完了を意味しません。

採用済み:

- Google Workspace / Apps Script-first runtime
- Shared Drive authoritative source
- 5-sheet backend
- separate restricted Audit Spreadsheet
- Meeting / Pitchbook registration + maintenance
- Gemini File Search hosted retrieval
- one configured Gemini Flash model
- 15-minute AI sync
- six initial source formats
- five-mode Knowledge Search
- Gemini-independent Knowledge Export: Active Meeting本文、Pitchbook metadata / authoritative link、Google Docs / PDF
- ChatGPT-led development + Codex residual implementation

## Product overview

```text
Authorized users
      |
      v
Apps Script HTML Service Web App
  ├─ Meeting: New / Past
  ├─ Pitchbook: New / Past
  ├─ Knowledge Search
  │    └─ 自由質問 / 要約 / 時系列 / 比較 / 面談準備
  └─ Master Management
      |
      v
Google Apps Script
      |
 +----+------------------------------+
 |                                   |
 v                                   v
Backend Spreadsheet             Google Shared Drive
5 sheets                        authoritative sources
                                     |
                                     v
                              Gemini File Search
                                     |
                                     v
                              Gemini Flash
                                     |
                                     v
                        output + citations + Drive links

Separate Restricted Audit Spreadsheet
```

## Authoritative storage

```text
Private Assets Knowledge
├─ Meeting Records
└─ Pitchbooks
```

年 / GP / Asset Class等のsubfolderは作らずflat storageとする。

Backend Spreadsheet:

1. `GP_Master`
2. `Option_Master`
3. `Meeting_Index`
4. `Pitchbook_Index`
5. `Settings`

通常利用者はbackend / Audit Spreadsheetを直接操作しない。

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

Meeting bodyはGoogle Docsを正本とし、`Meeting_Index`へ全文duplicateしない。

Fixed ID example:

```text
MTG-000123
```

Filename:

```text
YYYY-MM-DD_GP_AssetClass_Equity-or-Debt_MTG-XXXXXX
```

Timeはfilenameへ入れず、Equity / Debt未選択時はそのsegmentを省略する。

## Pitchbooks / source materials

- drag & drop / multiple files
- required: file, Date, GP, Asset Class
- optional: Equity / Debt
- 25MB/file
- maximum 10 files per selection
- maximum 100MB total per selection
- Apps Script generated filename
- sequence starts at `_01` and continues from existing maximum

```text
YYYY-MM-DD_GP_AssetClass_Equity-or-Debt_Sequence.ext
```

25MBでもApps Script実機上限が確認された場合は、複雑なupload architectureを追加するより安全な低い上限へ変更することを優先する。

## Masters / drafts / maintenance

- GP: immutable ID, mutable display name, Active/Inactive, alphabetical display, quick-add
- Option Master: Location / Asset Class / Equity-Debt, Sort Order, Active/Inactive
- all users may add / rename / reorder / deactivate / reactivate allowed Masters
- shared browser context: Date / GP / Asset Class / Equity-Debt
- text / selection drafts retained for 24h in same browser
- past-record filters: Date From/To, GP, Asset Class, Equity/Debt, Status
- logical Active / Inactive / Reactivate instead of normal-user physical deletion
- same Meeting concurrent edits use optimistic locking

## Audit model

Audit logs are stored in a separate Google Spreadsheet under a Restricted admin-only control folder.

Initial Web App does not need an Audit Viewer or custom password screen. Drive sharing permissions are the direct access control.

Actor attribution is best-effort:

1. email when available
2. otherwise `TEMP_USER:<temporary active user key>` when available
3. otherwise `UNIDENTIFIED`

Persistent personal identification is not a production requirement. Audit is primarily for operational trace, change history, AI-use trace, and failure investigation.

Audit retention: 5 years.

## Gemini knowledge retrieval

```text
Shared Drive = authoritative source
Sheets       = exact metadata / index
File Search  = rebuildable semantic index
Gemini Flash = grounded synthesis
```

Accepted baseline:

- one Gemini File Search Store initially
- exact filtering via Custom Metadata
- semantic retrieval via File Search managed embeddings
- no custom Vector DB / embedding pipeline / tag taxonomy / Knowledge Graph initially
- Web App authorized users share access to all Active indexed sources
- no per-user / per-file retrieval ACL initially
- one configured Gemini Flash model
- no user model selector / Deep mode
- 15-minute Apps Script AI sync worker
- AI failure never rolls back authoritative registration
- citations must return users to the correct Drive source

Initial AI-searchable formats:

```text
.pdf
.pptx
.xlsx
.docx
.txt
.eml
```

`.eml` original remains in Drive; normalized Subject / From / To / Cc / Date / Body text is indexed. Embedded attachments are not auto-indexed. `.msg` is initially out of scope.

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

All five modes share one File Search / metadata / semantic retrieval / Gemini Flash / citation path. Presets change prompt/output template only.

## Knowledge Export / external-AI handoff

- Backend Indexの`Status = Active`だけを対象にする。
- Meetingは正本Google Doc本文を取り込み、Pitchbookは本文を複製せずmetadataとauthoritative Drive linkだけを出力する。
- Meeting 50件超、Pitchbook 200件超、またはMeeting本文250,000文字超はサーバー側で書き出しを停止する。件数超過時はMeeting Docを読み取らない。
- Google Docs / PDFは設定済みのKnowledge Exports sibling folderへ生成し、原資料リンクはstable file IDから検証・生成する。
- 外部AI向け5モードpromptはMaster表示名とstable IDを併記する。prompt本文、原文、回答、chunk、bytesはAuditへ保存しない。
- Exportは正本の派生コピーであり、権限ドリフトと無期限蓄積のリスクがある。production前にfolder permission equivalenceとretention運用を実機確認する。

## Apps Script setup

Normal setup is Apps Script-first.

Administrator/editor runs (normal users cannot call these through `google.script.run`):

```text
setupKnowledgePlatform_()
validateInstallation_()
getInstallationStatus_()
```

Setup creates / reuses / migrates:

- knowledge folders
- backend Spreadsheet
- separate Audit Spreadsheet
- five backend sheets
- Master seeds
- Settings / schema version
- required triggers

Setup is idempotent and is also the repair / migration path.

## Apps Script public surface

Apps Script HTML Serviceでは、top-level関数は末尾`_`がない限りbrowserから呼び出せます。`ksp` prefixはprivacy boundaryではありません。通常利用者向けの公開関数は、Web Appが実際に使用するfacade allowlistだけです。setup、status、validation、retention、manual sync、diagnostics、trigger handler、Drive / Docs / Sheets adapterはprivate関数として保持します。

公開surfaceの回帰検証は`npm run check`に含まれる`public-surface` validatorで実行します。

## Development sequence

- Work 0004: Apps Script scaffold + idempotent setup
- Work 0005: Meeting vertical slice
- Work 0006: Pitchbook vertical slice
- Work 0007: maintenance / concurrency / Masters / Phase 1 qualification
- Work 0008: Gemini File Search thin slice + 自由質問
- Work 0009: 15-minute sync + six formats + EML
- Work 0010: four presets + production qualification
- Work 0011: Knowledge Export / external-AI prompt handoff
- Work 0012: public-surface security hardening and reliability validation

ChatGPT owns design / GitHub / review / completion. Codex is used for residual implementation, testing, runtime validation, and debugging.

## Design principles

1. Keep authoritative storage simple.
2. Separate source of truth from AI index.
3. Prefer metadata for exact filters and embeddings for semantic search.
4. Every AI output must trace back to source.
5. AI failure must not stop source capture.
6. Do not add architecture merely to preserve an arbitrary upload limit or identity requirement.
7. Do not add custom Vector DB, ACL system, Agent framework, or model router until a concrete need is demonstrated.

## Documentation

- [Documentation index](docs/README.md)
- [Product Vision](docs/product/vision.md)
- [Target Architecture](docs/architecture/target-architecture.md)
- [Planning Baseline](docs/planning/mvp-and-roadmap.md)
- [Apps Script Implementation Plan](docs/planning/apps-script-implementation-plan.md)
- [Runtime / Operations](docs/operations/runtime-policy.md)
- [Gemini File Search](docs/ai/gemini-file-search.md)
- [Security](docs/governance/security.md)
- [Audit / Actor Decision](docs/decisions/audit-access-and-user-attribution.md)
- [Upload Limit Decision](docs/decisions/pitchbook-upload-limits.md)

## Repository data policy

公開GitHubには設計、source code、匿名化 / 合成test dataのみを保存する。実Meeting、Pitchbook、個人情報、未公開deal情報、API keys、credentials、internal IDs、private URLsを保存しない。
