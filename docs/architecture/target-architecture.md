# Target Architecture

## Status

本書は現在採用しているend-to-end architectureと責任境界を示す。

Google Workspace中心のauthoritative layerを維持し、その上にGemini File Searchをderived retrieval layerとして追加する。ImplementationはApps Script-firstで進める。

Works 0004–0011は実装・マージ済みで、Work 0012はApps Script公開surfaceとKnowledge Exportのhardeningを完了した。release versionは`0.1.2`。Work 0010–0011のDEV実機qualificationは未観測項目を残している。

## Architecture overview

```text
Authorized users
  A / B / C ...
        |
        | shared Web App URL
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
  ├─ browser state / validation
  ├─ Docs generation / update
  ├─ source upload / rename / numbering
  ├─ master / index maintenance
  ├─ concurrency / retry
  ├─ audit event write
  └─ Gemini File Search sync / query
            |
      +-----+-----------------------------------+
      |                                         |
      v                                         v
Backend Spreadsheet                       Google Shared Drive
  ├─ GP_Master                              ├─ Meeting Records
  ├─ Option_Master                          └─ Pitchbooks
  ├─ Meeting_Index                               |
  ├─ Pitchbook_Index                             v
  └─ Settings                              Gemini File Search
                                                   |
                                                   v
                                           Gemini Flash
                                                   |
                                                   v
                                      grounded output + citations

Restricted admin-only Audit Spreadsheet
```

## Responsibility boundaries

### Apps Script Web App

Normal-user UI only. Users do not directly edit backend / Audit Spreadsheet / File Search.

HTML Serviceのtop-level関数は末尾`_`がない限り`google.script.run`から呼び出せる。通常利用者向けの公開関数はcanonical facade allowlistだけに限定し、setup、validation、installation status、retention、manual sync、diagnostics、trigger、Drive / Docs / Sheets adapterは末尾`_`のprivate関数とする。`ksp` prefixはprivacy boundaryではない。`npm run check`のpublic-surface validatorがこの境界を検査する。

### Shared Drive

Authoritative source:

```text
Private Assets Knowledge
├─ Meeting Records
└─ Pitchbooks
```

Keep folders flat.

- Meeting: Google Docs is authoritative body record.
- Pitchbook/source: original Shared Drive file is authoritative.
- File Search is never authoritative.

### Backend Spreadsheet

Exactly five baseline sheets:

1. `GP_Master`
2. `Option_Master`
3. `Meeting_Index`
4. `Pitchbook_Index`
5. `Settings`

Use stable IDs, never row number or sort order, as durable identity.

### Audit Spreadsheet

Separate Spreadsheet under a Restricted admin-only control folder.

- normal users do not receive direct access
- initial Web App has no Audit Viewer
- Drive permissions, not custom password, form the direct access boundary
- retention: 5 years

## Apps Script-first setup

Idempotent editor-only setup entry points:

```text
setupKnowledgePlatform_()
validateInstallation_()
getInstallationStatus_()
```

Setup creates / reuses / migrates:

- knowledge folders
- backend / audit Spreadsheets
- five backend sheets
- schema / Settings
- Master seeds
- required triggers

Stored resource IDs are preferred. Duplicate exact-name candidates cause explicit failure instead of silent selection.

DEV and PROD use separate Apps Script projects and resource sets.

## Meeting contract

Required:

- Date
- GP
- Asset Class

Optional:

- Time
- Location
- Equity / Debt
- Counterparty
- Internal Participants
- Notes

Fixed Meeting ID example:

```text
MTG-000123
```

Filename:

```text
YYYY-MM-DD_GP_AssetClass_Equity-or-Debt_MTG-XXXXXX
```

Time is excluded. Optional Equity/Debt segment is omitted when absent.

Meeting body is stored only in the Google Doc, not duplicated in `Meeting_Index`.

## Pitchbook / source contract

Required: file, Date, GP, Asset Class.
Optional: Equity / Debt.

Filename:

```text
YYYY-MM-DD_GP_AssetClass_Equity-or-Debt_Sequence.ext
```

Rules:

- sequence starts at `01`
- later additions use destination-context existing max + 1
- old gaps are never closed
- Document ID / Drive File ID remain stable through metadata edits
- problematic filename punctuation is normalized

Initial upload limits:

```text
25MB / file
10 files / selection
100MB total / selection
```

If 25MB proves impractical in Apps Script, lower the limit before adding upload architecture. 100MB/file transport / Cloud fallback is not initial scope.

## Shared browser state / drafts

Meeting and Pitchbook share:

- Date
- GP
- Asset Class
- Equity / Debt

Registration success keeps shared values and clears page-specific fields only.

Text / selection drafts persist for 24h in the same browser. File handles need not survive reload / tab close.

## Masters

### GP Master

- immutable GP ID
- mutable GP name
- Active / Inactive
- alphabetical display
- no manual Sort Order
- quick-add from Meeting/Pitchbook with normalized duplicate check

### Option Master

Types:

- `LOCATION`
- `ASSET_CLASS`
- `CAPITAL_TYPE`

Fields include immutable Option ID, display name, Sort Order, Active / Inactive.

Initial Asset Classes:

```text
PE / VC / Infrastructure / Real Estate / PD / その他
```

Initial Capital Types:

```text
Equity / Debt
```

All users may add / rename / reorder / deactivate / reactivate allowed Masters. Rename / deactivate require confirmation + audit event.

## Backend data contracts

### GP_Master

```text
GP_ID, GP_Name, Status, Created_At, Updated_At, Created_By, Updated_By
```

### Option_Master

```text
Option_ID, Type, Name, Sort_Order, Status, Created_At, Updated_At, Created_By, Updated_By
```

### Meeting_Index

```text
Meeting_ID, Date, Time, Location_ID, GP_ID, Asset_Class_ID, Capital_Type_ID,
Counterparty, Internal_Participants, Doc_File_ID, Doc_URL, Saved_Filename,
Status, Version, Created_At, Updated_At, Created_By, Updated_By,
AI_Document_Name, AI_Index_Status, AI_Indexed_At, AI_Content_Hash, AI_Last_Error
```

### Pitchbook_Index

```text
Document_ID, Batch_ID, Date, GP_ID, Asset_Class_ID, Capital_Type_ID, Sequence_No,
File_ID, File_URL, Original_Filename, Saved_Filename, Status,
Created_At, Updated_At, Created_By, Updated_By,
AI_Document_Name, AI_Index_Status, AI_Indexed_At, AI_Content_Hash, AI_Last_Error
```

### Settings

```text
Key, Value, Description, Updated_At
```

`Created_By / Updated_By` use best-effort Actor representation: email → temporary user key → `UNIDENTIFIED`. Persistent personal identity is not required.

## Past records / logical deletion

Optional filters:

- Date From / To
- GP
- Asset Class
- Equity / Debt
- Status

`未選択` means no filter and is never persisted.

Meeting edits keep same Meeting ID + Doc. Pitchbook edits keep same Document ID + Drive File ID.

Normal users use Active / Inactive / Reactivate rather than physical delete.

## Concurrency / retry

- LockService only around short consistency-critical writes.
- Same-Meeting edits use Version/Updated At optimistic locking.
- batch Pitchbook processing is file-granular.
- failed-file retry reuses same Batch ID / Document ID / reserved sequence.
- retry checks existing Drive / Index state to prevent duplicates.

## Web App access / Actor model

Initial common access boundary:

- authorized Web App users can access all Active source records
- no per-user / per-file retrieval ACL initially
- internet-public access is not assumed

Initial execution preference: run as organization-controlled deployer to centralize backend permissions.

Audit Actor:

1. email if safely available
2. else `TEMP_USER:<key>` if available
3. else `UNIDENTIFIED`

Missing persistent identity does not block operation or release.

## Gemini File Search layer

- one Store initially
- exact filtering via Custom Metadata
- semantic retrieval via File Search managed embeddings
- no custom Vector DB / embedding pipeline / tag taxonomy / Knowledge Graph initially
- only Active records retrievable
- AI indexing is derived and independently retryable

Initial metadata:

```text
source_type
source_id
date_key
gp_id
gp_name
asset_class_id
asset_class_name
capital_type_id
capital_type_name
drive_url
saved_filename
```

AI states:

```text
NotIndexed
Pending
Indexed
Failed
```

## AI synchronization

```text
Authoritative save
      |
      v
AI_Index_Status = Pending
      |
      v
15-minute Apps Script worker
      |
      +--> Indexed
      └--> Failed -> retry when retryable
```

- stable source IDs / AI Document references make retry idempotent
- permanent failures are not retried forever
- Inactive removes AI Document
- Reactivate re-indexes current authoritative source
- AI failure never rolls back authoritative save

## Initial AI source formats

```text
.pdf
.pptx
.xlsx
.docx
.txt
.eml
```

EML original remains in Drive; normalized Subject / From / To / Cc / Date / Body is indexed. Embedded attachments are not auto-indexed. `.msg` is out of scope initially.

## Knowledge Search target UX

```text
自由質問 | 要約 | 時系列 | 比較 | 面談準備
```

Shared filters:

- Date From / To
- GP
- Asset Class
- Equity / Debt
- Source Type

All modes share the same Store / metadata / semantic retrieval / configured Flash / citation path. Presets change prompt/output template only.

Every output must surface citations / Drive links and explicitly indicate insufficient evidence when appropriate.

## Knowledge Export target contract

- Backend Indexで`Status = Active`のMeeting / Pitchbookだけを対象にする。
- Meeting本文の文字数は正本Google Docから計測する。件数がMeeting 50件超またはPitchbook 200件超なら、先にexact countを返してDoc materializationを行わない。
- Meeting本文250,000文字超はartifactを作成しない。
- `Doc_URL` / `File_URL`は`Doc_File_ID` / `File_ID`と一致することを確認し、必要ならstable IDからcanonical URLを生成する。不一致、欠落、trashed/folder/未アクセスの原本はexport全体を停止する。
- Generated Google Docsにはsource URLを明示的なhyperlinkとして書き込む。PDFはsource-link textを保持する。
- 外部AI promptは5モード共通・provider-neutralで、Master表示名とstable IDを併記する。Auditはmetadata-onlyでprompt本文やsource bodyを保存しない。

## Implementation boundary

Development follows:

- 0004 scaffold + setup
- 0005 Meeting
- 0006 Pitchbook
- 0007 maintenance / Masters / Phase 1 qualification
- 0008 File Search thin slice + 自由質問
- 0009 sync + six formats + EML
- 0010 four presets + production qualification
- 0011 Knowledge Export / external-AI prompt handoff
- 0012 Apps Script public-surface security hardening and reliability validation

Detailed execution source: `docs/planning/apps-script-implementation-plan.md`.
