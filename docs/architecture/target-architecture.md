# Target Architecture

Current as of: 2026-08-28

Status: Active

This document defines the accepted end-to-end architecture and responsibility boundaries. Delivery/qualification policy is governed by `docs/decisions/target-runtime-first-development.md`.

Google Workspace is authoritative. OpenAI/Gemini File Search indexes and Knowledge Export artifacts are derived/rebuildable. Production source paths are exercised in the actual target runtime with isolated data/resources and guarded effects.

AI routing and full-output decisions:

- `docs/decisions/ai-provider-selection-and-full-output.md`;
- `docs/ai/provider-neutral-file-search.md`.

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
  │    ├─ 自由質問 / 要約 / 時系列 / 比較 / 面談準備
  │    └─ ChatGPT / Gemini / 全文出力
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
  ├─ canonical AI Source / Knowledge Request / Knowledge Package
  ├─ provider adapters
  │    ├─ OpenAI File Search
  │    └─ Gemini File Search
  └─ Copy / Google Docs / PDF full-output adapters
        |
   +----+--------------------------+--------------------------+
   |                               |                          |
   v                               v                          v
Backend Spreadsheet            Shared Drive          Derived AI/Export layer
  ├─ GP_Master                   ├─ Meeting Records     ├─ OpenAI Vector Store
  ├─ Option_Master               └─ Pitchbooks          ├─ Gemini File Search Store
  ├─ Meeting_Index                                      └─ Knowledge Export artifacts
  ├─ Pitchbook_Index
  └─ Settings

Separate Restricted Audit Spreadsheet
```

## 2. Runtime, data, and exposure boundary

### Target runtime

The delivered system must work through:

- organization-controlled Apps Script V8 project/runtime;
- intended Web App execution/deployment shape;
- Google Drive / Shared Drive / Sheets / Docs semantics;
- supported browser behavior;
- every AI provider enabled by the target environment when AI is in scope.

Mocks, CI, test loaders, alternate Apps Script projects, or My Drive substitutes do not prove capabilities they did not execute.

### Isolated test data/resources

Qualification uses synthetic or appropriately anonymized test folders, Sheets, Docs, files, records, IDs, accounts, provider Stores/documents, and namespaces. Test records do not mix with authoritative company production records.

### Guarded side effects

Production/confidential data, real users, broad access, billing, triggers, physical delete, bulk migration, retention purge, and irreversible permission changes remain separately disabled/guarded until authorized.

A separate DEV/Staging runtime is optional, not the default. It requires a material safety, regulatory, segregation, blast-radius, rollback, concurrency, scale, cost, or platform reason that cannot be addressed through isolation and guards.

## 3. Responsibility boundaries

### Web App

The Web App is the normal-user interface. Only the explicit allowlisted facade is browser-callable. Setup, validation, installation status, diagnostics, triggers, raw adapters, retention, credentials, provider Store administration, and destructive helpers remain private/editor-only.

Production business helpers must exist in production source. A test loader may not supply missing production behavior.

### Shared Drive

```text
Private Assets Knowledge
├─ Meeting Records
└─ Pitchbooks
```

- Meeting Google Doc is authoritative for body text.
- Original Pitchbook/source file is authoritative.
- AI indexes and Knowledge Export are derived and rebuildable.
- Source folders remain flat unless a concrete operating requirement changes the decision.

### Five-sheet Backend

1. `GP_Master`
2. `Option_Master`
3. `Meeting_Index`
4. `Pitchbook_Index`
5. `Settings`

Stable IDs—not row numbers, filenames, URLs, or sort positions—are durable identity. Schema evolution is append-only where practical. No relation/entity/analytics/provider-state sheet is added without a new explicit decision.

### Restricted Audit

Audit is a separate Spreadsheet under a restricted control folder.

- no direct ordinary-user access;
- Drive permissions form the boundary;
- bounded metadata only;
- no Meeting body, Follow-up note, question, answer, source body, full-output body, chunks, embeddings, uploaded bytes, credentials, raw provider payloads, or private runtime IDs.

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

Meeting identity:

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

Meeting schema includes:

```text
Counterparty_Type
Counterparty_ID
Related_GP_IDs
```

Existing `GP_ID` remains for compatibility.

- GP Meeting: Counterparty ID and GP_ID mirror the same GP.
- non-GP Meeting: GP_ID may be blank; Related GP context is held in `Related_GP_IDs`.
- existing `Counterparty` free text remains personal-name/role information.
- legacy GP rows are backfilled only when new fields are blank.

Prospective required fields:

```text
Date
Counterparty Type
Counterparty Entity
Asset Class
```

Optional fields include Time, Location, Equity/Debt, Team, Fund/Strategy, Meeting Types, Related GPs, Related Pitchbooks, Follow-up, person/role text, internal participants, and body notes.

Filename:

```text
YYYY-MM-DD_Counterparty_AssetClass_Equity-or-Debt_MTG-XXXXXX
```

Migration does not bulk-rename or rewrite existing Docs/files.

## 6. Pitchbook architecture

Pitchbook remains GP-oriented in the selected roadmap.

Required:

```text
file
Date
GP
Asset Class
```

Optional: Equity/Debt and Fund/Strategy.

Stable Document ID, Batch ID, File ID, persistent sequence, partial success, retry, and filename rules remain accepted.

Non-GP Pitchbook ownership requires a later explicit decision if actual use proves it necessary.

## 7. Relationship architecture

Canonical relationship:

```text
Meeting_Index.Related_Pitchbook_IDs
```

Related Pitchbook choices use:

- matching Asset Class;
- Pitchbook GP present in Meeting `Related_GP_IDs`;
- Active for new selection.

Existing Inactive, unresolved, or now-out-of-scope links remain visible and preserved.

Work 0018 provides forward/reverse traversal by scanning/indexing this field. No relation sheet and no relationship inference by name/date/text.

## 8. Masters and maintenance

### GP Master

Immutable GP ID, mutable display name, Active/Inactive, normalized duplicate check, quick-add.

### Option Master

Existing Types include Location, Asset Class, Capital Type, Team and:

```text
COUNTERPARTY_LP
COUNTERPARTY_NISSAY_DEPARTMENT
COUNTERPARTY_GROUP_COMPANY
COUNTERPARTY_CONSULTANT_GATEKEEPER
COUNTERPARTY_OTHER
```

All use stable Option ID, display name, Sort Order, Active/Inactive, and accepted Audit rules. Real department/entity seeds are not guessed.

## 9. Workspaces and analytics

- Work 0015: GP Workspace / print brief.
- Work 0017: activity analytics and narrow monthly administrative check.
- Work 0018: bidirectional Relationship Explorer.
- Work 0019: Entity Workspace, direct versus Related GP activity, unified timeline, exact Fund/Strategy drill-down.

Analytics reads `Meeting_Index`, not Meeting Doc bodies. Follow-up stays an informational flag/note; task owners/deadlines/completion/reminders are outside this platform.

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

## 11. Provider-neutral AI source and request architecture

### User choices

Exactly:

```text
ChatGPT
Gemini
全文出力
```

Internal routes:

```text
OPENAI
GEMINI
FULL_EXPORT
```

No automatic cross-provider failover. A disabled/unconfigured provider returns a safe provider-specific error.

### Canonical AI Source

Meeting metadata includes:

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

Existing metadata—source ID/type, date, GP, Asset Class, Capital Type, Team, Fund/Strategy, Meeting Type, Follow-up, Drive URL, filename, and content hash—remains.

### Canonical Knowledge Request

One request model owns:

- selected route;
- mode;
- question/additional instruction;
- structured filters;
- selected Entities;
- source scope;
- request fingerprint.

### Canonical Knowledge Package

Full output resolves authoritative sources and builds one deterministic package. Copy, Google Docs, and PDF consume the same package and fingerprint.

The full-text preview is at the bottom of the section/page, fixed-height, and internally scrollable. `コピー / Google Docs / PDF` buttons appear above the body so users can output without reading or page-scrolling through it.

## 12. Provider adapters and Stores

### OpenAI

- user label: `ChatGPT`;
- OpenAI API and File Search/Vector Store;
- provider-native indexing/query/filter/citation/polling/cleanup inside the adapter.

### Gemini

- user label: `Gemini`;
- Gemini API and File Search Store;
- provider-native indexing/query/filter/citation/polling/cleanup inside the adapter.

Both normalize to one answer/citation model with stable source IDs and authoritative Drive links.

File Search is the required default source-reading path for both providers. Full-context API submission is not a substitute for this architecture.

## 13. Independent provider index state

OpenAI and Gemini derived state is independent. A single ambiguous `AI_Index_Status` cannot represent both providers.

Work 0020 performs append-only migration while retaining exactly five Backend sheets. Preferred authoritative representation is one validated versioned provider-state object per source keyed by `OPENAI` and `GEMINI`, with migration from legacy Gemini-oriented fields when blank.

Per provider:

```text
document/store reference
NotIndexed / Pending / Indexed / Failed
indexed_at
content_hash
safe last error
```

Legacy fields remain preserved for compatibility/evidence; they are not destructively removed.

Server-side settings distinguish provider enablement, Store identity, and model alias. Credentials never enter GitHub, browser responses, Audit, exports, source files, or ordinary-user Sheets.

## 14. AI synchronization lifecycle

For each enabled provider independently:

### Registration

1. save authoritative source/Index;
2. mark provider state Pending;
3. return authoritative success independently;
4. bounded direct/private worker indexes;
5. success -> Indexed;
6. failure -> Failed without rollback.

### Update

Preserve stable source ID/Drive file, replace/supersede prior provider document, index current content/metadata, and avoid duplicate active documents.

### Inactivation / Reactivation

Inactive source exits normal retrieval. Reactivation indexes the current authoritative source.

### Rebuild

Derived Store documents may be deleted/rebuilt by exact provider/source identity without altering Drive sources.

A recurring sync trigger is not enabled in the personal-PC core. Schedule only under separate authorization.

## 15. Knowledge Search modes and filters

Modes:

```text
自由質問 | 要約 | 時系列 | 比較 | 面談準備
```

Planned filters:

```text
Date From / To
Counterparty Type
Counterparty Entity
Related GP where exact behavior permits
Asset Class
Equity / Debt
Team
Fund / Strategy
Meeting Type
要フォロー
Source Type
```

The canonical filter model is provider-neutral. Each adapter translates exact semantics or returns an explicit limitation. Comma substring matching is not treated as exact.

Comparison selects 2–5 Entities across categories. Numeric comparison remains in analytics; qualitative source-grounded comparison belongs to Knowledge Search.

## 16. Audit and redaction

Allowed bounded metadata:

```text
Timestamp
Actor
provider route
search mode
structured filter IDs
configured model alias
result
cited stable source IDs
safe error/limitation code
```

Current policy redacts question/additional-instruction text.

Do not store answers, retrieved chunks, source/full-output bodies, embeddings, uploaded bytes, credentials, raw provider payloads, or private Store identifiers.

## 17. Work 0020 and 0021

### Work 0020 — provider core

Qualifies:

- three-choice UI;
- provider-neutral contracts;
- independent provider state;
- OpenAI/Gemini File Search adapters;
- enabled-provider index/query/citation lifecycle;
- disabled-provider safe errors/no failover;
- full-output Copy/Docs/PDF parity and internal-scroll layout;
- update/inactivate/reactivate/delete/rebuild;
- cost/retry/rate-limit/retention evidence.

### Work 0021 — intended search product

Expands to:

- structured filters;
- five modes;
- 2–5 Entity comparison;
- per-Entity citations;
- enabled-provider parity matrices;
- full-output parity for the same filters/modes;
- accepted six-format bounded matrix.

## 18. Historical migration and production

Historical migration is manual-first. Selective automation is used only for repeatable subsets with clear benefit.

Final company production qualification occurs last and includes Shared Drive parentage/permissions, company Web App, Backend/Audit boundaries, real users, full-output artifacts/retention, and every AI provider enabled by company policy:

- approved credentials/billing;
- Store ownership/identity;
- indexing/query/filter/citation;
- update/inactivate/cleanup/retention;
- safe errors/no failover;
- scheduled triggers where authorized.

The company may enable OpenAI, Gemini, both, or neither. Personal-PC success is not company production readiness.

## 19. Validation architecture

Report separately:

```text
LOGIC_VALIDATION
TARGET_RUNTIME_QUALIFICATION
SIDE_EFFECT_STATE
READY
```

AI Works additionally report:

```text
OPENAI_RUNTIME / OPENAI_SEARCH_MATRIX
GEMINI_RUNTIME / GEMINI_SEARCH_MATRIX
FULL_OUTPUT_RUNTIME / FULL_OUTPUT_MATRIX
```

Logic validation covers schemas, transformations, identities, filenames, filters, relationships, retry, concurrency, redaction, provider contracts, and package parity.

Target-runtime qualification covers actual Apps Script, Workspace object shapes, persistence, Shared Drive parentage/permissions, Docs links, browser behavior, enabled-provider Stores/indexing/query/citations, full-output artifacts, and authorized trigger behavior.

## 20. Work sequence

```text
0015 GP Workspace
→ 0016 Counterparty entity foundation
→ 0022 temporal data contract hardening
→ 0017 analytics / monthly checks
→ 0018 Relationship Explorer
→ 0019 Entity Workspace / Fund-Strategy drill-down
→ 0020 AI provider core / OpenAI + Gemini File Search / full output
→ 0021 structured filters / five modes / multi-Entity / provider parity
→ historical migration
→ final production qualification
```
