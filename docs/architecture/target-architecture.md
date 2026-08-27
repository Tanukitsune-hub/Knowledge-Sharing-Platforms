# Target Architecture

Current as of: 2026-08-27

Status: Active

This document defines the accepted end-to-end architecture and responsibility boundaries. Delivery/qualification policy is governed by `docs/decisions/target-runtime-first-development.md`.

Google Workspace is authoritative. Gemini File Search is derived/rebuildable. Production source paths are exercised in the actual target runtime with isolated data/resources and guarded effects.

## 1. Architecture overview

```text
Authorized users
        |
        v
Apps Script HTML Service Web App
  ├─ Meeting: New / Past
  ├─ Pitchbook: New / Past
  ├─ GP / Entity Workspace
  ├─ Activity Analytics
  ├─ Relationship Explorer
  ├─ Knowledge Search
  │    └─ 自由質問 / 要約 / 時系列 / 比較 / 面談準備
  └─ Master Management
        |
        v
Google Apps Script V8
  ├─ validation / drafts / safe facade
  ├─ Docs generation and update
  ├─ source upload / rename / numbering
  ├─ Masters / Index maintenance
  ├─ concurrency / retry / schema migration
  ├─ Audit metadata
  ├─ Knowledge Export
  └─ Gemini File Search sync/query
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

The delivered system must work through:

- organization-controlled Apps Script V8 project/runtime;
- intended Web App execution/deployment shape;
- Google Drive / Shared Drive / Sheets / Docs semantics;
- supported browser behavior;
- approved Gemini/File Search environment when AI capability is in scope.

Mocks, CI, test loaders, alternate Apps Script projects, or My Drive substitutes do not prove target capabilities they did not execute.

### Isolated test data/resources

Qualification uses synthetic or appropriately anonymized data and clearly identified test folders, Sheets, Docs, files, records, IDs, accounts, Store documents, or namespaces. Test records do not mix with authoritative production records.

### Guarded side effects

Production/confidential data, real users, broad access, billing, triggers, physical delete, bulk migration, retention purge, and irreversible permission changes remain separately disabled/guarded until authorized.

A separate DEV/Staging runtime is optional, not the default. It requires a material safety, regulatory, segregation, blast-radius, rollback, concurrency, scale, cost, or platform reason that cannot be addressed through isolation and guards.

## 3. Responsibility boundaries

### Web App

The Web App is the normal-user interface. Only the explicit allowlisted facade is browser-callable. Setup, validation, installation status, diagnostics, triggers, raw adapters, retention, and destructive helpers remain private/editor-only.

Production business helpers must exist in production source. A test loader may not supply missing production behavior.

### Shared Drive

```text
Private Assets Knowledge
├─ Meeting Records
└─ Pitchbooks
```

- Meeting Google Doc is authoritative for body text.
- Original Pitchbook/source file is authoritative.
- File Search and Knowledge Export are derived and rebuildable.
- Source folders remain flat unless a concrete operating requirement changes the decision.

### Five-sheet Backend

1. `GP_Master`
2. `Option_Master`
3. `Meeting_Index`
4. `Pitchbook_Index`
5. `Settings`

Stable IDs—not row numbers, filenames, URLs, or sort positions—are durable identity. Schema evolution is append-only where practical. No relation/entity/analytics sheet is added without a new explicit decision.

### Restricted Audit

Audit is a separate Spreadsheet under a restricted control folder.

- no direct ordinary-user access;
- Drive permissions form the boundary;
- bounded metadata only;
- no Meeting body, Follow-up note, question, answer, source body, chunks, embeddings, uploaded bytes, secrets, or private runtime IDs.

### Gemini File Search

- one derived/rebuildable Store initially;
- Custom Metadata handles exact filters;
- managed chunking/embeddings handle relevance;
- only Active sources are normally retrievable;
- AI failure never rolls back authoritative capture;
- grounded outputs preserve stable source IDs, citations, and Drive links.

## 4. Setup and project identity

Private editor entry points:

```text
setupKnowledgePlatform_()
validateInstallation_()
getInstallationStatus_()
```

Setup creates/reuses/migrates/repairs folders, five Backend sheets, Audit Spreadsheet, Masters, schemas, Settings, and authorized triggers.

Rules:

- stored exact resource ID first;
- exact-name lookup only without stored ID;
- fail on ambiguity;
- read back project/deployment/resource identity before mutation;
- preserve stable IDs and user-mutated durable data;
- no generic destructive reset;
- no private IDs, URLs, credentials, or local mappings in GitHub.

## 5. Counterparty entity architecture

Detailed decision:

`docs/decisions/counterparty-entity-classification.md`

### Category and entity

Meeting identity evolves to:

```text
Counterparty_Type
Counterparty_ID
```

Fixed category codes:

```text
GP
LP_ASSET_OWNER
NISSAY_INTERNAL
GROUP_COMPANY
CONSULTANT_GATEKEEPER
OTHER
```

Storage:

- GP entities: existing `GP_Master`;
- non-GP entities: category-specific `Option_Master` Types;
- composite stable identity: `Counterparty_Type + ':' + Counterparty_ID`.

No Entity/Counterparty sheet is introduced.

### Meeting schema

Work 0016 appends to `Meeting_Index`:

```text
Counterparty_Type
Counterparty_ID
Related_GP_IDs
```

Existing `GP_ID` remains for compatibility.

- GP Meeting: Counterparty ID and GP_ID mirror the same GP.
- non-GP Meeting: GP_ID may be blank; Related GP context is held in `Related_GP_IDs`.
- existing `Counterparty` free text remains personal-name/role information, not organization identity.
- legacy GP rows are backfilled only when new fields are blank.

### Meeting required contract

Prospective required fields:

```text
Date
Counterparty Type
Counterparty Entity
Asset Class
```

Optional fields include Time, Location, Equity/Debt, Team, Fund/Strategy, Meeting Types, Related GPs, Related Pitchbooks, Follow-up, person/role text, internal participants, and body notes.

### Filename and Doc

```text
YYYY-MM-DD_Counterparty_AssetClass_Equity-or-Debt_MTG-XXXXXX
```

Docs include counterparty type/name, Related GPs, and person/role when present. Migration does not bulk-rename or rewrite existing Docs/files.

## 6. Pitchbook architecture

Pitchbook remains GP-oriented in the selected roadmap.

Required:

```text
file
Date
GP
Asset Class
```

Optional: Equity/Debt, Fund/Strategy.

Stable Document ID, Batch ID, File ID, persistent sequence, partial success, retry, and filename rules remain accepted.

Work 0016 does not generalize Pitchbook ownership to non-GP entities. A later explicit decision is required if actual use needs it.

## 7. Relationship architecture

Canonical relationship:

```text
Meeting_Index.Related_Pitchbook_IDs
```

Related Pitchbook choices for a Meeting use:

- matching Asset Class;
- Pitchbook GP present in Meeting `Related_GP_IDs`;
- Active for new selection.

Existing Inactive, unresolved, or now-out-of-scope links remain visible and preserved.

Work 0018 provides forward/reverse traversal by scanning/indexing this field. No relation sheet and no relationship inference by name/date/text.

## 8. Masters and maintenance

### GP Master

Immutable GP ID, mutable display name, Active/Inactive, normalized duplicate check, quick-add.

### Option Master

Existing Types include Location, Asset Class, Capital Type, Team. Work 0016 adds:

```text
COUNTERPARTY_LP
COUNTERPARTY_NISSAY_DEPARTMENT
COUNTERPARTY_GROUP_COMPANY
COUNTERPARTY_CONSULTANT_GATEKEEPER
COUNTERPARTY_OTHER
```

All use stable Option ID, display name, Sort Order, Active/Inactive, and existing Audit rules. No real department/entity seeds are guessed.

## 9. Workspaces and analytics

- Work 0015: GP Workspace / print brief.
- Work 0017: activity analytics and narrow monthly administrative check.
- Work 0018: bidirectional Relationship Explorer.
- Work 0019: Entity Workspace, direct versus Related GP activity, unified timeline, exact Fund/Strategy drill-down.

Analytics reads `Meeting_Index`, not Meeting Doc bodies. It starts after entity foundation so dimensions are not GP-only.

Follow-up stays an informational flag/note; task owners/deadlines/completion/reminders are not part of this platform.

## 10. Browser state and maintenance

Always shared between Meeting/Pitchbook:

```text
Date
Asset Class
Equity / Debt
Fund / Strategy
```

GP is shared only for a GP-counterparty Meeting. A non-GP Meeting does not infer Pitchbook GP from Related GPs.

Drafts persist 24h in one browser. Normal lifecycle is Active/Inactive/Reactivate. Stable IDs and optimistic locking remain durable.

## 11. AI metadata architecture

Meeting AI metadata evolves append-only to include:

```text
entity_key
counterparty_type
counterparty_id
counterparty_name
related_gp_ids
```

Pitchbook derives:

```text
counterparty_type = GP
counterparty_id = GP_ID
entity_key = GP:<GP_ID>
```

Existing metadata—source ID/type, date, GP, Asset Class, Capital Type, Team, Fund/Strategy, Meeting Type, Follow-up, Drive URL—remains.

Related GP is multi-valued. Exact encoding/filter behavior is decided from actual File Search behavior in Work 0020/0021; comma substring matching is not treated as exact.

## 12. Gemini qualification and search

Work 0020 qualifies a bounded personal-PC core using an isolated Store and synthetic/non-confidential sources:

- one Meeting and one Pitchbook;
- index/query/citation;
- update/inactivate/reactivate/delete/rebuild;
- costs, retries, rate limits, retention, and cleanup.

Work 0021 expands to structured filters, five modes, 2–5 entity comparison, and accepted formats.

Static GP comparison is not a separate product. Numeric comparison belongs to analytics; qualitative comparison belongs to Gemini.

## 13. Historical migration and production

Historical migration is manual-first. Selective automation is used only for repeatable subsets with clear benefit.

Final company production qualification occurs last and includes Shared Drive parentage/permissions, company Web App, Backend/Audit boundaries, production Gemini credentials/billing, real users, retention/cleanup/rollback, and authorized triggers.

## 14. Validation architecture

Report separately:

```text
LOGIC_VALIDATION
TARGET_RUNTIME_QUALIFICATION
SIDE_EFFECT_STATE
READY
```

Logic validation covers schemas, transformations, identities, filenames, filters, relationships, retry, concurrency, redaction, security, and contracts.

Target-runtime qualification covers actual Apps Script, Workspace object shapes, persistence, Shared Drive parentage/permissions, Docs links, browser behavior, Gemini indexing/query/citations, and authorized trigger behavior.

The normal implementation proof is the shortest isolated create/persist/reopen/search/readback path.

## 15. Work sequence

Work 0014 is accepted historical evidence. Current/planned sequence:

```text
0015 GP Workspace
→ 0016 Counterparty entity foundation
→ 0017 analytics / monthly checks
→ 0018 Relationship Explorer
→ 0019 Entity Workspace / Fund-Strategy drill-down
→ 0020 personal-PC Gemini core
→ 0021 structured filters / multi-entity comparison
→ historical migration
→ final production qualification
```
