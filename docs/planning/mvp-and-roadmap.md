# Planning Baseline

## Status

従来のMVP / roadmapは2026-08-14に破棄した。本書は現在のaccepted design、delivery sequence、implementation-time validation、genuine remaining choicesを分けて管理する。

蓄積・修正・運用管理、Gemini File Search retrieval、Knowledge Search 5モードは採用済み。採用済み事項を実装時に理由なく未決定へ戻さない。

## Phase 1 — Accumulation and maintenance

Status: Accepted design, implementation not started.

採用済み:

- 1つのApps Script HTML Service Web Appを複数人で利用
- Meeting: register / search / edit / deactivate / reactivate
- Pitchbook: multi-file register / search / edit / deactivate / reactivate
- GP Master / Option Master
- Shared Driveを正本
- 5-sheet backend
- separate Audit Spreadsheet
- Meeting ID / Document ID / Batch ID
- deterministic filename / persistent sequence
- 24h browser draft retention
- upload limit: 25MB/file, 10 files/selection, 100MB total
- partial failure: success維持、failed fileだけidempotent retry
- all-user Master maintenance
- 5-year audit retention
- Audit SpreadsheetはRestrictedなadmin-only control folderへ配置
- actual-user emailはbest-effort。取得不能でもoperation / production readinessをblockしない

詳細:

- `docs/operations/runtime-policy.md`
- `docs/planning/apps-script-implementation-plan.md`
- `docs/decisions/audit-access-and-user-attribution.md`
- `docs/decisions/pitchbook-upload-limits.md`

## Phase 2 — Gemini knowledge retrieval

Status: Accepted design, implementation not started.

```text
Shared Drive authoritative records
        |
        v
Gemini File Search Store
        |
        | metadata filter + semantic retrieval
        v
Configured Gemini Flash
        |
        v
Knowledge Search
        |
        v
grounded output + citations + Drive links
```

Accepted principles:

- Shared Drive remains authoritative.
- File Search is rebuildable derived index.
- Start with one Store.
- File Search manages chunking / embedding / semantic retrieval.
- Custom Metadata handles exact filters.
- no custom Vector DB / embedding pipeline / tag taxonomy / Knowledge Graph initially.
- Inactive sources are excluded from normal AI retrieval.
- Web App users share one common access boundary across all Active indexed sources.
- one configured Gemini Flash model; no model selector / Deep mode.
- 15-minute Apps Script sync worker.
- AI index failure never rolls back authoritative registration.
- AI query events are written to separate restricted Audit Spreadsheet.

## Knowledge Search target UX

Accepted 5 modes:

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

`未選択` means no filter and is never persisted.

Mode contracts:

- 自由質問: grounded direct Q&A
- 要約: cross-source synthesis, not concatenated per-document summaries
- 時系列: chronology + change / continuity
- 比較: common-dimension comparison, table when useful
- 面談準備: recent materials, changes, unresolved items, reconfirmation points, next questions

All modes use the same retrieval / citation layer and must surface insufficient evidence rather than invent content.

## Initial AI-searchable formats

```text
.pdf
.pptx
.xlsx
.docx
.txt
.eml
```

- `.eml` original remains in Drive.
- AI index uses normalized Subject / From / To / Cc / Date / Body text.
- embedded attachments are not auto-indexed.
- `.msg` is initially out of scope.

## Delivery sequence

### Phase 1 implementation

- Work 0004: scaffold + idempotent setup
- Work 0005: Meeting vertical slice
- Work 0006: Pitchbook vertical slice
- Work 0007: maintenance / concurrency / Masters / Phase 1 qualification

### Phase 2 implementation

- Work 0008: File Search thin slice + 自由質問
- Work 0009: 15-minute sync + six formats + EML
- Work 0010: four preset modes + production qualification

Detailed scope / acceptance / routing: `docs/planning/apps-script-implementation-plan.md`

## Accepted backend extensions for Phase 2

`Meeting_Index` / `Pitchbook_Index`:

```text
AI_Document_Name
AI_Index_Status
AI_Indexed_At
AI_Content_Hash
AI_Last_Error
```

States:

```text
NotIndexed
Pending
Indexed
Failed
```

Settings include:

```text
GEMINI_FILE_SEARCH_STORE_NAME
AI_DEFAULT_MODEL
AI_SYNC_ENABLED
AI_SYNC_INTERVAL_MINUTES
```

Initial sync interval: 15 minutes.

## Audit baseline

Audit Spreadsheet is separate from the backend 5-sheet database and directly accessible only to admins through Drive permissions.

Actor attribution:

1. email when safely available
2. otherwise `TEMP_USER:<temporary key>` when available
3. otherwise `UNIDENTIFIED`

Persistent personal identification is not required for initial production operation.

AI query audit includes:

- Actor
- timestamp
- Search mode
- question / additional instruction
- Date From / To
- GP / Asset Class / Equity-Debt / Source Type filters
- configured model ID
- Success / Failure
- cited source IDs when available

Do not duplicate generated answers, retrieved chunks, embeddings, Meeting full text, or Pitchbook content into Audit Spreadsheet.

## Implementation-time validation — design already decided

These are validations, not open product decisions:

- Apps Script setup can create / reuse / validate intended Workspace resources.
- 25MB/file practical upload path works, or a lower safe limit is observed and adopted.
- Apps Script can connect to Gemini File Search in approved environment.
- six source-format paths work.
- EML normalization quality is acceptable.
- 15-minute worker runs reliably.
- retry is idempotent.
- query / indexing rate limits and cost are operationally acceptable.
- File Search retention / deletion aligns with company rules.
- common access boundary is acceptable for intended users.
- Audit Spreadsheet is not directly accessible to ordinary users.
- citations map to correct Drive sources.

## Genuine remaining implementation choices

Only the following remain genuinely open:

- concrete Gemini Flash model ID
- approved production credential storage / provider
- retry batch size / backoff / rate-limit / cost guardrail values
- comparison mode multi-select UI need

The following are decided and should not be reopened without new material evidence:

- Apps Script-first runtime
- separate restricted Audit Spreadsheet
- actual-user email not required
- upload limit 25MB/file, 10 files, 100MB total
- one shared Active-source access boundary
- 15-minute sync
- six initial formats
- five Knowledge Search modes

## Validation gates

### Phase 1

- setup idempotency
- source / Index / Drive consistency
- stable IDs / sequence
- Meeting / Pitchbook register + update
- 25MB/file / 10 files / 100MB total validation
- partial-failure retry
- concurrency / optimistic locking
- draft retention
- Active / Inactive / Reactivate
- Master permissions / audit events
- Audit Spreadsheet restricted access
- Actor fallback does not block operations

### Phase 2

- source-to-index consistency
- 15-minute worker
- metadata filters
- semantic retrieval
- citations / Drive links
- re-index / Inactive / Reactivate
- retry idempotency
- six source formats / EML normalization
- free question + four presets on one retrieval layer
- AI query audit
- Flash-only behavior
- AI outage isolation from authoritative save
- no confidential data / credential leakage

## Planning rule

Keep the authoritative layer simple. AI is a derived layer. Do not introduce new DBs, ACL systems, Agent frameworks, Knowledge Graphs, model routers, or upload infrastructure without a concrete requirement that the accepted design cannot satisfy.
