# Decision Log

本ファイルには現在も有効な主要判断だけを記録する。2026-08-14以前の旧product / UI / AppSheet / RAG / Vector DB / MVP / roadmap decisionsは撤回済み。

Detailed domain sources take precedence:

- architecture: `docs/architecture/target-architecture.md`
- implementation: `docs/planning/apps-script-implementation-plan.md`
- runtime / audit: `docs/operations/runtime-policy.md`
- target-runtime delivery: `docs/decisions/target-runtime-first-development.md`
- Gemini retrieval: `docs/ai/gemini-file-search.md`
- security: `docs/governance/security.md`

## 2026-08-14 — Reset project direction

Status: Accepted

Build a simple private-assets knowledge base around Google Workspace rather than a complex knowledge-sharing platform.

- Shared Drive is authoritative source.
- Users interact through one Apps Script Web App.
- Sheets hold Masters / Index / Settings, not duplicated full source content.
- Keep storage simple and independent from future AI convenience.

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

Optional baseline:

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

Time is excluded. Optional Equity/Debt segment is omitted when absent. Later append-only fields and relationships follow their accepted Work/decision documents.

## 2026-08-15 — Shared registration context / drafts

Status: Accepted

Meeting and Pitchbook share browser-state for Date, GP, Asset Class, Equity / Debt, and accepted later shared metadata.

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

No year / GP / Asset Class source subfolders initially. Production parentage follows `docs/decisions/shared-drive-production-root.md` once that decision is merged.

## 2026-08-15 — Five-sheet backend

Status: Accepted

```text
GP_Master
Option_Master
Meeting_Index
Pitchbook_Index
Settings
```

Use stable IDs rather than row numbers. Append-only schema evolution may add columns but does not add a new relation/database sheet without a new explicit decision.

`Created_By / Updated_By` are Actor fields and may contain email, temporary user key, or `UNIDENTIFIED`.

AI fields:

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

Option Master types include Location, Asset Class, Capital Type, and accepted later append-only types such as Team.

All authorized users may add / rename / reorder / deactivate / reactivate allowed Masters. Rename / deactivate requires confirmation + audit event.

## 2026-08-15 — Past records / logical deactivation / concurrency

Status: Accepted

- Past-record filters are optional and use stable IDs where applicable.
- UI-only `未選択` is never persisted.
- Normal users use Active / Inactive / Reactivate rather than physical deletion.
- Same-Meeting edits use Version / Updated At optimistic locking.
- LockService protects only short consistency-critical writes.

## 2026-08-15 — Gemini File Search retrieval

Status: Accepted

- Shared Drive remains authoritative.
- Gemini File Search is a derived / rebuildable hosted retrieval index.
- Start with one Store.
- File Search manages chunking / embeddings / semantic retrieval.
- Custom Metadata provides exact filters.
- No custom Vector DB / embedding pipeline / tag taxonomy / Knowledge Graph initially.
- Only Active sources are normally retrievable.
- AI indexing failure never rolls back authoritative source capture.
- Citations link back to original Drive source.

## 2026-08-15 — AI access / sync / model / formats

Status: Accepted

- authorized Web App users share access to all Active indexed sources
- no per-user / per-file retrieval ACL initially
- one configured Gemini Flash model
- no user model selector / Deep mode
- 15-minute Apps Script AI sync worker
- initial formats: `.pdf / .pptx / .xlsx / .docx / .txt / .eml`
- EML original remains in Drive; normalized Subject / From / To / Cc / Date / Body is indexed
- EML embedded attachments are not auto-indexed
- `.msg` is initially out of scope

Billing-enabled Gemini / File Search operation remains separately authorized under the target-runtime side-effect boundary.

## 2026-08-15 — Five-mode Knowledge Search

Status: Accepted

```text
自由質問 | 要約 | 時系列 | 比較 | 面談準備
```

- 自由質問 is default.
- Shared filters: Date From/To, GP, Asset Class, Equity/Debt, Source Type, plus accepted later structured filters.
- All modes share one retrieval / citation layer.
- Presets change prompt / output template only.
- Every mode surfaces citations / Drive links.
- Insufficient evidence must be stated rather than invented.

## 2026-08-15 / 16 — Apps Script-first implementation

Status: Accepted; environment/delivery method updated on 2026-08-26

- production runtime is Apps Script V8 JavaScript
- normal setup does not require Node.js / clasp / external server
- `setupKnowledgePlatform_()` is the editor-only idempotent create / reuse / migration / repair path; normal users cannot call setup through `google.script.run`
- ChatGPT owns design / GitHub / review / completion
- Codex handles residual implementation / tests / exact-source synchronization / target-runtime validation / debugging
- production business behavior must exist in production source; test loaders may not supply missing production helpers

The former permanent DEV/PROD project separation is superseded by the target-runtime-first decision below.

## 2026-08-17 — Knowledge Export and Apps Script public-surface hardening

Status: Accepted and implemented in Work 0012

- Only canonical normal-user facade functions are top-level/browser-callable; setup, status, validation, retention, manual sync, diagnostics, triggers, and raw adapters remain private.
- Legacy `runAiSyncWorker` triggers migrate to private `runAiSyncWorker_` during idempotent setup.
- Knowledge Export resolves Active Backend Index rows, hard-stops count limits before Meeting Doc reads, binds source links to stable file IDs, writes explicit Docs hyperlinks, and returns canonical artifact URLs.
- Provider-neutral five-mode prompts use Master display names with stable IDs.
- Audit stores metadata only; prompt text, answers, source bodies, chunks, embeddings, and bytes are excluded.
- Short-lived actor-bucket throttling and export idempotency are the minimal abuse controls.
- `Knowledge Exports` is a derived-copy boundary; permission equivalence and retention/deletion operations remain target-runtime qualification items.

## 2026-08-16 — Lower upload limits

Status: Accepted

```text
25MB / file
10 files / selection
100MB total / selection
```

This replaces 100MB/file / 500MB/batch. Do not add complex upload architecture merely to preserve a larger arbitrary limit. If 25MB is impractical in actual Apps Script behavior, lower the limit first.

Detailed decision: `docs/decisions/pitchbook-upload-limits.md`.

## 2026-08-16 — Separate restricted Audit Spreadsheet / best-effort Actor

Status: Accepted

- Audit logs are stored in a separate Google Spreadsheet under a Restricted admin-only control folder.
- Initial Web App does not require Audit Viewer or custom password authentication.
- Actor priority: email → `TEMP_USER:<key>` → `UNIDENTIFIED`.
- Persistent actual-user identity is not a release requirement and missing identity must not block normal operations.
- Audit purpose is operational trace / change history / AI-use trace / failure investigation, not strict non-repudiation.

Detailed decision: `docs/decisions/audit-access-and-user-attribution.md`.

## 2026-08-26 — Target-runtime-first development

Status: Accepted

For new Work after active Work 0014 closes or safely stops:

- implement the shortest coherent slice directly in production source paths and the actual Apps Script / Workspace / Web App target runtime;
- use isolated synthetic/anonymized data and clearly segregated test resources;
- keep production/confidential data, real users, billing, triggers, public exposure, destructive writes, and other consequential effects separately disabled or guarded;
- run focused `LOGIC_VALIDATION`, then bounded `TARGET_RUNTIME_QUALIFICATION` before broad feature expansion;
- do not declare runtime-dependent Work ready from CI, mocks, simulators, alternate runtimes, synthetic harnesses, or test-only helpers alone;
- create a separate DEV/Staging runtime only when a documented material reason provides unique safety or evidence not achievable through isolation/guards in the target runtime.

This supersedes the default feature-complete → final DEV live qualification sequence and permanent DEV/PROD project separation. Historical evidence remains historical evidence.

Detailed decision: `docs/decisions/target-runtime-first-development.md`.

## Current genuine implementation choices

Only material unresolved choices remain open, including:

- concrete approved Gemini model / credential / billing route
- retry batch size / backoff / rate-limit / cost guardrails based on observed runtime behavior
- safe practical upload limit if actual Apps Script behavior requires a lower value
- production rollout / permission / cleanup route when real data and users are introduced
- whether a future high-risk migration/concurrency campaign uniquely requires separate staging

Other adopted design should not be reopened without new material evidence.
