# Target Architecture

Current as of: 2026-08-26

Status: Active

This document defines the accepted end-to-end architecture and responsibility boundaries. Delivery/qualification policy is governed by `docs/decisions/target-runtime-first-development.md`.

Google Workspace is the authoritative operating layer. Gemini File Search is a derived/rebuildable retrieval layer. Implementation is Apps Script-first and target-runtime-first: production source paths are exercised early in the actual target runtime with isolated test data/resources and guarded side effects.

## 1. Architecture overview

```text
Authorized users
        |
        | organization-controlled Web App
        v
Apps Script HTML Service Web App
  ├─ Meeting: New / Past
  ├─ Pitchbook: New / Past
  ├─ Knowledge Search
  │    └─ 自由質問 / 要約 / 時系列 / 比較 / 面談準備
  └─ Master Management
        |
        v
Google Apps Script V8
  ├─ browser state / validation
  ├─ Docs generation / update
  ├─ source upload / rename / numbering
  ├─ master / index maintenance
  ├─ concurrency / retry
  ├─ audit event write
  ├─ Knowledge Export
  └─ Gemini File Search sync / query
        |
   +----+----------------------------------+
   |                                       |
   v                                       v
Backend Spreadsheet                  Shared Drive
  ├─ GP_Master                         ├─ Meeting Records
  ├─ Option_Master                     └─ Pitchbooks
  ├─ Meeting_Index                           |
  ├─ Pitchbook_Index                         v
  └─ Settings                         Gemini File Search
                                              |
                                              v
                                      Gemini Flash
                                              |
                                              v
                                grounded output + citations

Separate Restricted Audit Spreadsheet
```

## 2. Runtime, data, and exposure boundary

### Target runtime

The delivered system must work in:

- the organization-controlled Apps Script V8 project/runtime;
- the final Web App execution/deployment shape;
- Google Drive / Shared Drive / Sheets / Docs semantics;
- supported browser behavior;
- the company-approved Gemini/File Search environment when AI capability is in scope.

A local JavaScript harness, test loader, CI runner, alternate Apps Script project, My Drive substitute, or mock is not the target runtime merely because it can execute similar code.

### Isolated test data/resources

Target-runtime qualification uses synthetic or appropriately anonymized data and clearly identified test folders, Spreadsheets, Docs, files, records, accounts, stable IDs, or namespaces. Test records do not mix with authoritative production records.

### Guarded side effects

The following remain separately disabled, guarded, test-only, or explicitly authorized:

- installable triggers;
- Gemini/File Search billing-enabled operations;
- confidential source indexing;
- real users / broad Web App exposure;
- external recipients;
- physical delete / bulk mutation / retention purge;
- production migration;
- irreversible permission changes.

Using the actual target runtime does not itself authorize production data or rollout.

### Separate staging

A separate DEV/Staging runtime is optional, not architectural default. It requires a material safety, regulatory, segregation, blast-radius, migration, rollback, concurrency, scale, cost, or platform reason that cannot be addressed through isolated resources and guarded effects in the actual target runtime.

If used, its unique evidence, differences from the target, synchronization route, and retirement condition must be recorded. It cannot establish readiness for target capabilities it does not faithfully reproduce.

## 3. Responsibility boundaries

### Apps Script Web App

The Web App is the normal-user interface. Users do not directly edit backend, Audit Spreadsheet, or File Search state.

Only the canonical normal-user facade is top-level/browser-callable. Setup, validation, installation status, retention, manual sync, diagnostics, trigger handlers, raw Drive/Docs/Sheets adapters, and destructive helpers remain private/editor-only. A `ksp` prefix is not a privacy boundary.

The public-surface validator in `npm run check` enforces this boundary.

### Shared Drive

Authoritative source layout:

```text
Private Assets Knowledge
├─ Meeting Records
└─ Pitchbooks
```

- Meeting Google Doc is the authoritative body record.
- Original Pitchbook/source file is authoritative.
- File Search and Knowledge Export are derived copies and never replace source authority.
- Folder structure remains simple unless a concrete operating requirement justifies change.

### Backend Spreadsheet

Baseline sheets:

1. `GP_Master`
2. `Option_Master`
3. `Meeting_Index`
4. `Pitchbook_Index`
5. `Settings`

Stable IDs—not row numbers or sort positions—are durable identity. Schema evolution is append-only where practical.

### Audit Spreadsheet

Audit is a separate Spreadsheet under a Restricted admin-only control folder.

- normal users receive no direct access;
- initial Web App has no Audit Viewer;
- Drive permissions, not a custom password, form the access boundary;
- retention is five years;
- Audit stores bounded metadata, not source bodies, prompts/answers, chunks, embeddings, uploaded bytes, secrets, or private runtime IDs.

### Gemini File Search

- one derived/rebuildable Store initially;
- Custom Metadata handles exact filtering;
- managed embeddings/semantic retrieval handle relevance;
- only Active sources are normally retrievable;
- AI indexing/query failure never rolls back authoritative source capture;
- grounded outputs preserve source IDs, citations, and Drive links.

## 4. Apps Script setup and project identity

Editor-only/private entry points:

```text
setupKnowledgePlatform_()
validateInstallation_()
getInstallationStatus_()
```

Setup creates/reuses/migrates/repairs:

- knowledge folders;
- backend and Audit Spreadsheets;
- baseline sheets;
- schema/Settings;
- Master seeds;
- required triggers only when trigger enablement is authorized.

Rules:

- use stored exact resource IDs first;
- use exact-name lookup only when no stored ID exists;
- fail on ambiguous candidates rather than guess;
- read back exact Apps Script project, deployment, resource IDs, parentage, and status before mutation;
- preserve stable IDs and user-mutated durable data;
- no generic production reset or destructive teardown;
- no organization-specific IDs, private URLs, credentials, or local mappings in GitHub.

Production business helpers must exist in production source. A test loader may not inject a missing production-named function and then treat the harness PASS as runtime readiness.

## 5. Meeting contract

Required baseline:

- Date;
- GP;
- Asset Class.

Optional baseline:

- Time;
- Location;
- Equity / Debt;
- Counterparty;
- Internal Participants;
- Notes.

Later accepted structured fields and relations use stable IDs and append-only schema changes.

Fixed ID example:

```text
MTG-000123
```

Filename:

```text
YYYY-MM-DD_GP_AssetClass_Equity-or-Debt_MTG-XXXXXX
```

Time is excluded and absent optional segments are omitted. Meeting body remains only in the authoritative Google Doc, not duplicated into `Meeting_Index`.

## 6. Pitchbook/source contract

Required baseline: file, Date, GP, Asset Class.

Optional baseline: Equity / Debt.

Filename:

```text
YYYY-MM-DD_GP_AssetClass_Equity-or-Debt_Sequence.ext
```

Rules:

- sequence starts at `01`;
- later additions use destination-context current max + 1;
- historical gaps are not closed;
- Document ID and Drive File ID remain stable through metadata edits;
- filename punctuation is normalized;
- batch processing is file-granular;
- retry reuses Batch ID / Document ID / reserved sequence and prevents duplicate Drive/Index records.

Initial limits:

```text
25MB / file
10 files / selection
100MB total / selection
```

If actual Apps Script behavior requires a lower safe limit, lower it before adding complex upload infrastructure.

## 7. Shared browser state, drafts, and maintenance

Meeting and Pitchbook share accepted common context such as Date, GP, Asset Class, and Capital Type. Registration success keeps shared values and clears page-specific values only.

Text/selection drafts persist for 24h in the same browser. File handles need not survive reload/tab close.

Normal lifecycle is Active / Inactive / Reactivate. Physical deletion is not a normal-user operation.

Meeting edits preserve Meeting ID/Doc and use Version/Updated At optimistic locking. Pitchbook edits preserve Document ID/Drive File ID.

## 8. Masters and durable identities

GP Master:

- immutable GP ID;
- mutable display name;
- Active/Inactive;
- normalized duplicate check;
- quick-add where accepted.

Option Master:

- immutable Option ID;
- accepted Types such as Location, Asset Class, Capital Type, Team, and later approved fields;
- mutable display name / Sort Order / Active/Inactive.

Authorized users may add, rename, reorder, deactivate, and reactivate allowed Masters. Rename/deactivate requires confirmation and Audit.

## 9. Core persisted contracts

`Created_By` / `Updated_By` use best-effort Actor representation: email → `TEMP_USER:<key>` → `UNIDENTIFIED`.

Baseline AI fields on Meeting/Pitchbook indexes:

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

Settings include the approved Store/model/sync configuration but never secret values in user-facing sheets or GitHub.

## 10. Concurrency and retry

Use LockService only around short consistency-critical writes:

- ID counters;
- sequence reservation;
- Master mutation;
- one-time setup/migration state;
- trigger registry;
- bounded retention cleanup acquisition.

Do not hold locks during file uploads, Docs generation, Gemini calls, long Drive operations, browser waits, or broad batches.

Same-Meeting edits use optimistic locking. Pitchbook partial success is preserved. Retry is idempotent and duplicate-safe.

## 11. Web App access and Actor

Initial common access boundary:

- authorized Web App users may access accepted Active source records;
- no per-user/per-GP/per-file retrieval ACL initially;
- internet-public access is not assumed;
- organization-controlled deployer execution is the initial preference to centralize backend permissions.

Actor resolution:

1. safe email if available;
2. `TEMP_USER:<key>` when available;
3. `UNIDENTIFIED`.

Missing persistent identity does not block normal operation.

## 12. AI synchronization and formats

Authoritative save completes independently of AI:

```text
Authoritative save
      |
      v
AI_Index_Status = Pending
      |
      v
bounded Apps Script worker
      |
      +--> Indexed
      └--> Failed -> retry when retryable
```

- stable source IDs and stored AI references make retry idempotent;
- permanent failures are not retried indefinitely;
- Inactive removes normal retrieval availability;
- Reactivate re-indexes the current authoritative source;
- content hash prevents unnecessary duplicate indexing.

Initial formats:

```text
.pdf / .pptx / .xlsx / .docx / .txt / .eml
```

EML original remains in Drive; normalized Subject/From/To/Cc/Date/Body is indexed. Embedded attachments are not automatically indexed. `.msg` is initially out of scope.

## 13. Knowledge Search and Export

Knowledge Search modes:

```text
自由質問 | 要約 | 時系列 | 比較 | 面談準備
```

All modes share one Store/metadata/semantic retrieval/model/citation path. Presets change prompt/output template only. Outputs distinguish grounded facts, synthesis, uncertainty, and insufficient evidence.

Knowledge Export:

- uses only Active Backend Index rows;
- includes authoritative Meeting text;
- includes Pitchbook metadata and authoritative stable-ID-bound links, not Pitchbook body duplication;
- enforces count/character limits before expensive reads;
- writes explicit source hyperlinks in generated Docs/PDF text;
- produces provider-neutral prompts;
- stores Audit metadata only;
- remains a derived-copy boundary requiring permission and retention evidence before production rollout.

## 14. Validation architecture

Report separately:

```text
LOGIC_VALIDATION
TARGET_RUNTIME_QUALIFICATION
SIDE_EFFECT_STATE
READY
```

Logic validation covers schemas, transformations, IDs, filenames, filters, retry, concurrency, redaction, security rules, and contracts.

Target-runtime qualification covers actual Apps Script, Workspace object shapes, persistence, Shared Drive parentage/permissions, Docs links, browser behavior, Gemini indexing/query/citations, and authorized trigger behavior.

The normal implementation proof is the shortest isolated create/persist/reopen/search/readback path. Broader feature expansion follows after the native slice passes.

## 15. Historical Work map

Works 0004–0014 remain historical implementation/evidence routes. Work 0014 completes or safely stops under PR #17's existing evidence boundary. New Work follows the current target-runtime-first plan in `docs/planning/apps-script-implementation-plan.md`.
