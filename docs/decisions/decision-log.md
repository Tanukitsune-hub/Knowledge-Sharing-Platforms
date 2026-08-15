# Decision Log

本ファイルには現在も有効な主要判断だけを記録する。2026-08-14以前の旧product / UI / AppSheet / RAG / Vector DB / MVP / roadmap decisionsは撤回済み。

Detailed domain sources take precedence:

- architecture: `docs/architecture/target-architecture.md`
- implementation: `docs/planning/apps-script-implementation-plan.md`
- runtime / audit: `docs/operations/runtime-policy.md`
- Gemini retrieval: `docs/ai/gemini-file-search.md`
- security: `docs/governance/security.md`

## 2026-08-14 — Reset project direction

Status: Accepted

Build a simple private-assets knowledge base around Google Workspace rather than a complex knowledge-sharing platform.

- Shared Drive is authoritative source.
- users interact through one Apps Script Web App.
- Sheets hold Masters / Index / Settings, not duplicated full source content.
- keep storage simple and independent from future AI convenience.

## 2026-08-15 — One shared Apps Script Web App

Status: Accepted

- one organization-controlled Web App for all authorized users
- no per-user Spreadsheet / Web App copies
- same app contains Meeting, Pitchbook, Knowledge Search, Master Management
- normal users do not directly edit backend / audit stores
- browser draft state is per user/browser

## 2026-08-15 — Meeting contract

Status: Accepted

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

Meeting body is authoritative in Google Docs and is not duplicated in `Meeting_Index`.

Fixed Meeting ID example: `MTG-000123`.

Filename:

```text
YYYY-MM-DD_GP_AssetClass_Equity-or-Debt_MTG-XXXXXX
```

Time is excluded. Optional Equity/Debt segment is omitted when absent.

## 2026-08-15 — Shared registration context / drafts

Status: Accepted

Meeting and Pitchbook share browser-state:

- Date
- GP
- Asset Class
- Equity / Debt

Registration success keeps shared values and clears page-specific values only.

Text / selection drafts persist for 24h in the same browser. File handles need not survive reload / tab close.

## 2026-08-15 — Pitchbook identity / filename / retry

Status: Accepted

- fixed Document ID / Batch ID
- filename uses Date / GP / Asset Class / optional Equity-Debt / Sequence
- sequence starts at `01`
- later additions use destination-context current max + 1
- historical sequence gaps are not closed
- metadata edits keep Document ID / Drive File ID
- batch processing is file-granular
- failed-file retry reuses identity / reserved sequence and avoids duplicate Drive / Index records

## 2026-08-15 — Flat Shared Drive source structure

Status: Accepted

```text
Private Assets Knowledge
├─ Meeting Records
└─ Pitchbooks
```

No year / GP / Asset Class source subfolders initially.

## 2026-08-15 — Five-sheet backend

Status: Accepted

```text
GP_Master
Option_Master
Meeting_Index
Pitchbook_Index
Settings
```

Use stable IDs rather than row numbers.

`Created_By / Updated_By` are Actor fields in practice and may contain email, temporary user key, or `UNIDENTIFIED` under the 2026-08-16 actor decision.

AI fields in Meeting / Pitchbook Index:

```text
AI_Document_Name
AI_Index_Status
AI_Indexed_At
AI_Content_Hash
AI_Last_Error
```

AI states:

```text
NotIndexed / Pending / Indexed / Failed
```

## 2026-08-15 — Masters

Status: Accepted

GP Master:

- immutable GP ID
- mutable GP name
- Active / Inactive
- alphabetical display
- quick-add with normalized duplicate check

Option Master types:

```text
LOCATION
ASSET_CLASS
CAPITAL_TYPE
```

Initial Asset Classes:

```text
PE / VC / Infrastructure / Real Estate / PD / その他
```

Initial Capital Types:

```text
Equity / Debt
```

All authorized users may add / rename / reorder / deactivate / reactivate allowed Masters. Rename / deactivate requires confirmation + audit event.

## 2026-08-15 — Past records / logical deactivation / concurrency

Status: Accepted

Optional past-record filters:

- Date From / To
- GP
- Asset Class
- Equity / Debt
- Status

`未選択` is UI-only no-filter state and is never persisted.

Normal users use Active / Inactive / Reactivate rather than physical deletion.

Same-Meeting edits use Version / Updated At optimistic locking.

LockService only protects short consistency-critical writes.

## 2026-08-15 — Gemini File Search retrieval

Status: Accepted

- Shared Drive remains authoritative.
- Gemini File Search is a derived / rebuildable hosted retrieval index.
- start with one Store.
- File Search manages chunking / embeddings / semantic retrieval.
- Custom Metadata provides exact filters.
- no custom Vector DB / embedding pipeline / tag taxonomy / Knowledge Graph initially.
- only Active sources are normally retrievable.
- AI indexing failure never rolls back authoritative source capture.
- citations link back to original Drive source.

## 2026-08-15 — AI access / sync / model / formats

Status: Accepted

- authorized Web App users share access to all Active indexed sources.
- no per-user / per-file retrieval ACL initially.
- one configured Gemini Flash model.
- no user model selector / Deep mode.
- 15-minute Apps Script AI sync worker.
- initial formats: `.pdf / .pptx / .xlsx / .docx / .txt / .eml`.
- EML original remains in Drive; normalized Subject / From / To / Cc / Date / Body is indexed.
- EML embedded attachments are not auto-indexed.
- `.msg` is initially out of scope.

## 2026-08-15 — Five-mode Knowledge Search

Status: Accepted

```text
自由質問 | 要約 | 時系列 | 比較 | 面談準備
```

- 自由質問 is default.
- shared filters: Date From/To, GP, Asset Class, Equity/Debt, Source Type.
- all modes share one retrieval / citation layer.
- presets change prompt / output template only.
- every mode surfaces citations / Drive links.
- insufficient evidence must be stated rather than invented.

## 2026-08-15 / 16 — Apps Script-first implementation

Status: Accepted

- production runtime is Apps Script V8 JavaScript.
- normal setup does not require Node.js / clasp / external server.
- `setupKnowledgePlatform()` is idempotent create / reuse / migration / repair path.
- DEV / PROD use separate Apps Script projects / resources.
- ChatGPT owns design / GitHub / review / completion.
- Codex handles residual implementation / tests / runtime validation / debugging.

Implementation sequence:

1. 0004 scaffold + setup
2. 0005 Meeting
3. 0006 Pitchbook
4. 0007 maintenance / Masters / Phase 1 qualification
5. 0008 File Search thin slice + 自由質問
6. 0009 sync + six formats + EML
7. 0010 four presets + production qualification

## 2026-08-16 — Lower upload limits

Status: Accepted

```text
25MB / file
10 files / selection
100MB total / selection
```

This replaces 100MB/file / 500MB/batch.

Do not add complex upload architecture merely to preserve a larger arbitrary limit. If 25MB is impractical in Apps Script, lower the limit first.

Detailed decision: `docs/decisions/pitchbook-upload-limits.md`.

## 2026-08-16 — Separate restricted Audit Spreadsheet / best-effort Actor

Status: Accepted

Audit logs are stored in a separate Google Spreadsheet under a Restricted admin-only control folder.

Initial Web App does not require Audit Viewer or custom password authentication.

Actor priority:

1. email if safely available
2. `TEMP_USER:<temporary active user key>` when available
3. `UNIDENTIFIED`

Persistent actual-user identity is not a release requirement and missing identity must not block normal operations.

Audit purpose is operational trace / change history / AI-use trace / failure investigation, not strict non-repudiation.

Detailed decision: `docs/decisions/audit-access-and-user-attribution.md`.

## Current genuine implementation choices

Only these remain genuinely open:

- concrete Gemini Flash model ID
- approved production credential provider / storage
- retry batch size / backoff / rate-limit / cost guardrail values
- comparison mode multi-select UI need

Other adopted design should not be reopened without new material evidence.
