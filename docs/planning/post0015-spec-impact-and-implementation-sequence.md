# Post-0015 Specification Impact and Implementation Sequence

Current as of: 2026-08-27

Status: Active cross-cutting implementation review

This document records how the accepted post-0015 roadmap changes the current source/schema/UI/search/AI contracts and why the Works are ordered as defined in `docs/planning/mvp-and-roadmap.md`.

## 1. Current source baseline reviewed

At the planning baseline:

- persistent schema is version 3;
- Backend has exactly five sheets;
- `Meeting_Index` contains legacy `GP_ID`, free-text `Counterparty`, structured Team/Fund/Meeting Type/Related Pitchbook/Follow-up columns, and AI state columns;
- Meeting registration requires Date, GP, and Asset Class;
- Meeting filename and Google Doc metadata assume GP as the organization identity;
- related-Pitchbook candidates use one selected GP plus Asset Class;
- Meeting/Pitchbook browser draft shares GP unconditionally;
- Past Meeting search is GP-centric;
- GP Workspace is being delivered in Work 0015;
- AI source metadata already supports GP, Team, Fund/Strategy, Meeting Type, Related Pitchbook IDs, and Follow-up;
- Knowledge Search exact filters currently center on Date, GP, Asset Class, Capital Type, and Source Type;
- Pitchbook remains a GP-owned source record.

These are working contracts, not mistakes. Work 0016 changes them prospectively while preserving legacy behavior.

## 2. Core specification changes

| Current assumption | Prospective contract | Work |
|---|---|---|
| Every Meeting requires GP | Meeting requires Counterparty Type + Entity; GP is one type | 0016 |
| GP list is the only organization master | GP uses GP Master; non-GP entities use typed Option Master rows | 0016 |
| `Counterparty` means organization/person ambiguously | Structured entity fields identify organization; `Counterparty` remains person/role text | 0016 |
| Related Pitchbooks derive from one GP | Candidates derive from `Related_GP_IDs` + Asset Class | 0016 |
| GP always shared to Pitchbook draft | GP shares only from GP-counterparty Meeting | 0016 |
| Analytics dimensions are GP-first | Analytics dimensions are Counterparty Type/Entity + Related GP | 0017 |
| Relationships mainly visible from Meeting edit | Read-only forward/reverse explorer | 0018 |
| Workspace is GP-only | Entity Workspace supports all categories; GP mode includes direct/related activity | 0019 |
| Fund/Strategy appears as a list | Exact-text drill-down across Meetings/Pitchbooks/relationships | 0019 |
| Gemini contracts are deterministic only | Current actual API/Store/model/billing path qualified first | 0020 |
| Knowledge filters are GP-centric | Entity-centered filters and 2–5 entity comparison | 0021 |
| Static GP comparison candidate | Rejected; analytics + Gemini comparison cover the need | 0017/0021 |
| Follow-up workflow candidate | Rejected; keep informational flag/note only | no Work |
| Universal legacy converter candidate | Rejected as mandatory; manual/hybrid/selective decision later | post-0021 |

## 3. Persistent data changes

### Work 0016

Append to `Meeting_Index`:

```text
Counterparty_Type
Counterparty_ID
Related_GP_IDs
```

Add Option Master Types:

```text
COUNTERPARTY_LP
COUNTERPARTY_NISSAY_DEPARTMENT
COUNTERPARTY_GROUP_COMPANY
COUNTERPARTY_CONSULTANT_GATEKEEPER
COUNTERPARTY_OTHER
```

Keep:

```text
GP_ID
Counterparty
Related_Pitchbook_IDs
all existing schema-3 columns
```

Legacy GP migration occurs only when new fields are blank.

### Work 0017

Default minimal administrative-check proposal:

```text
Admin_Check_Completed
Admin_Check_Updated_At
Admin_Check_Updated_By
```

This schema is not final until the real business label/state is confirmed at Work kickoff. Multiple states/checks are not inferred.

### Works 0018–0021

No new Backend sheet. Prefer read models, derived metadata, and append-only Audit/filter columns where required.

## 4. Production source impact matrix

### Core/setup/schema

Likely areas:

- schema version and Meeting headers;
- setup migration/backfill;
- Option type constants, stable ID generation, seeds/upsert behavior;
- safe error messages;
- diagnostics/readback.

Primary files/patterns:

```text
src/00_Core.gs
src/10_Setup.gs
setup tests
```

### Meeting registration and retry

Required changes:

- normalize/validate Counterparty Type/Entity/Related GPs;
- conditional GP mirror;
- request fingerprints and legacy fingerprints;
- entity-aware filename and Doc metadata;
- Index row mapping;
- idempotent retry matching;
- catalog/dependent-select response.

Primary patterns:

```text
src/30_MeetingCore.gs
src/40_MeetingService.gs
Meeting live environment/adapters
Meeting tests
```

### Meeting maintenance/search

Required changes:

- search filters and result mapping;
- edit input/validation;
- legacy parser fallback;
- historical Inactive entity preservation;
- Audit snapshots/changed fields;
- optimistic locking and source-Doc update;
- person/role label clarity.

Primary patterns:

```text
src/100_MaintenanceCore.gs
src/110_MaintenanceMeetingService.gs
src/112_MaintenanceServiceHelpers.gs
src/120_MaintenanceLiveEnvironment.gs
src/121_MaintenanceLiveHelpers.gs
maintenance tests
```

### Browser UI/drafts/bootstrap

Required changes:

- Counterparty Type -> Entity dependent select;
- category-aware quick-add;
- Related GP multi-select;
- conditional GP draft sharing;
- Past Meeting filters;
- clear/edit/reopen behavior;
- safe empty/Inactive states.

Primary patterns:

```text
src/Index.html
src/MaintenancePages.html
src/ClientCore.html
src/ClientBootstrap.html
src/ClientMaintenance*.html
src/Styles.html
client/markup tests
```

### Relationship paths

Required changes:

- candidate resolution from Related GPs;
- existing link preservation;
- reusable forward/reverse resolver;
- list counts/caps/unresolved/Inactive handling;
- Entity/Strategy reuse.

Do not duplicate relationship business logic in client-only code.

### GP/Entity Workspace

Work 0015 GP aggregation must remain compatible after schema migration. Work 0019 should refactor toward one reusable entity read model rather than maintaining GP and Entity aggregators separately.

### Analytics/admin check

Work 0017 adds:

- deterministic Asia/Tokyo bucketing;
- entity-aware dimensions;
- bounded chart/table response;
- exact drill list;
- narrow admin-check mutation and Audit.

No Meeting body reads or analytics database initially.

### Knowledge Export

Propagate readable Counterparty Type/Entity/Related GP metadata while preserving:

- Active-only source eligibility;
- Meeting Doc body authority;
- Pitchbook metadata/link-only behavior;
- count/character limits;
- Audit redaction.

### AI source and metadata

Likely areas:

```text
src/131_AiFileSearchContracts.gs
src/132_AiKnowledgeContracts.gs
src/140_AiSourceModels.gs
src/150_KnowledgeSearchModels.gs
AI/Knowledge Search UI and tests
```

Add single-valued entity metadata deterministically in Work 0016. Do not enable billing calls there.

Work 0020 verifies the current API and basic exact filter. Work 0021 implements advanced filters and multi-entity comparison based on observed behavior.

### Audit schema

Meeting create/update Audit may include Counterparty Type/ID and Related GP IDs. Question/source content remains redacted.

Work 0021 may append bounded structured filter fields. Audit migration stays append-only and separate from the five-sheet Backend.

## 5. Compatibility strategy

- stable Meeting/Document/Batch/Master/File IDs remain unchanged;
- existing `GP_ID` remains readable and mirrored for GP Meetings;
- legacy GP rows backfill only blank new fields;
- legacy Docs with `GP:` remain parseable;
- migration does not bulk-rename/rewrite source Docs/files;
- existing Related Pitchbook IDs remain canonical and are not deleted when candidates change;
- Inactive entity/Master values remain visible in historical edit/read paths;
- GP Workspace must continue working after Work 0016;
- Pitchbook remains GP-required;
- AI metadata changes mark/reindex current sources only under the later authorized AI Work.

## 6. Why the Work order changed

The earlier plan put activity analytics in Work 0016. That would hard-code GP as the principal organization dimension and cause immediate rework when LP/Asset Owner, Nippon Life departments, group companies, and other counterparties are introduced.

The corrected order is:

```text
entity identity
→ analytics
→ relationship exploration
→ entity/strategy workspace
→ actual Gemini core
→ advanced search/comparison
```

This minimizes schema/UI/read-model duplication and lets each later Work reuse accepted production helpers.

## 7. Risk and resolution register

### Entity ID collisions

Risk: Option IDs and GP IDs are independent namespaces.

Resolution: identity is the composite `Counterparty_Type:Counterparty_ID`, never ID alone.

### Same organization in multiple categories

Risk: one legal group may appear as GP and LP/Asset Owner or group company.

Resolution: treat as separate business contexts initially. Add alias/canonical entity only when real use proves necessary.

### Non-GP Pitchbook/source ownership

Risk: some non-GP meetings may have materials not naturally owned by a GP.

Resolution: keep Pitchbook GP-required in Work 0016. Reassess from actual use; do not broaden schema preemptively.

### Related GP multi-value File Search filter

Risk: exact multi-value API support may differ from deterministic assumptions.

Resolution: store deterministic source metadata now, decide encoding/query strategy only after Work 0020 observes the current API. Never claim comma substring matching is exact.

### Fund/Strategy text variants

Risk: free-text variants split aggregation.

Resolution: exact trimmed grouping, visibly separate values. No silent fuzzy merge; add Master/alias only if data quality warrants it.

### Analytics scale

Risk: full Meeting Index scans may become slow.

Resolution: measure actual runtime first. No summary sheet/cache until performance evidence justifies it.

### Historical migration complexity

Risk: diverse formats make universal conversion costly/unreliable.

Resolution: manual-first; automate repeatable subsets only.

## 8. Qualification gates by Work

### 0016

- one legacy GP Meeting maps correctly;
- one non-GP Meeting create/reopen/edit/search;
- Related GP/Pitchbook integrity;
- five sheets/no duplicates/stable IDs.

### 0017

- actual period bucketing and dimension switch;
- one admin-check persist/readback/Audit;
- no source/AI mutation.

### 0018

- same relationship resolves in both directions;
- Inactive/unresolved behavior;
- read-only integrity.

### 0019

- GP parity plus one non-GP Entity Workspace;
- direct/related separation;
- one Fund/Strategy drill-down;
- bounded print surface.

### 0020

- actual Store/model/credential/billing path;
- one Meeting/Pitchbook index/query/citation;
- exact metadata filter;
- update/inactivate/reactivate/delete/rebuild;
- cost/rate-limit/retention evidence.

### 0021

- entity filter;
- 2–5 entity comparison;
- per-entity citations;
- structured filters;
- five modes and accepted format matrix.

## 9. Delivery boundary

Planning updates are ChatGPT-only and do not mutate Apps Script runtime, Backend, Audit, Drive, Store, credentials, deployment, or Work 0015 branch.

Each implementation Work receives its own branch, Draft PR, Work/Dispatch register, exact target identity, mutation budget, logic validation, target-runtime qualification, report, and ChatGPT final review.
