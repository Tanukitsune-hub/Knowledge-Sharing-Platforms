# Work 0016 — Counterparty entity foundation

WORK_ID: `0016`

Status: Planned / next after Work 0015 acceptance

Mode: `BUILD`

## Primary outcome

Replace the Meeting workflow's global GP requirement with a structured two-stage counterparty selection while preserving all existing GP records, IDs, files, relations, search behavior, and the five-sheet Backend.

Normal users select:

```text
面談先区分
  -> 個別面談先
```

The resulting structured identity becomes the common basis for later analytics, relationship exploration, Entity Workspace, Knowledge metadata, and Gemini comparison.

Authoritative decision:

`docs/decisions/counterparty-entity-classification.md`

## Why this precedes analytics

The previously planned Work 0016 analytics would otherwise be built around a GP-only dimension and then immediately rewritten to support LP / Asset Owner, Nippon Life departments, group companies, and other counterparties.

The foundation therefore moves first. Meeting activity analytics becomes Work 0017.

## Fixed product contract

Counterparty types:

```text
GP
LP_ASSET_OWNER
NISSAY_INTERNAL
GROUP_COMPANY
CONSULTANT_GATEKEEPER
OTHER
```

Data source per type:

- `GP`: existing `GP_Master`;
- all other types: category-specific rows in existing `Option_Master`.

New Option Master Types:

```text
COUNTERPARTY_LP
COUNTERPARTY_NISSAY_DEPARTMENT
COUNTERPARTY_GROUP_COMPANY
COUNTERPARTY_CONSULTANT_GATEKEEPER
COUNTERPARTY_OTHER
```

No sixth Backend sheet is added.

## Persistent schema

Increment persistent schema once from the Work 0014 baseline.

Append to `Meeting_Index` only:

```text
Counterparty_Type
Counterparty_ID
Related_GP_IDs
```

Keep all existing columns, including:

```text
GP_ID
Counterparty
Related_Pitchbook_IDs
```

Semantics:

- `Counterparty_Type + ':' + Counterparty_ID` is the stable composite entity key.
- Existing `Counterparty` remains personal-name/role free text and is relabeled in UI.
- `GP_ID` remains populated for GP-counterparty Meetings and blank for non-GP Meetings.
- `Related_GP_IDs` is a canonical stable-ID list; the selected GP is auto-included for GP Meetings.

## Migration

Forward-only, idempotent, data-preserving migration:

1. append the three columns;
2. add the new Option Master Types without guessing real organization/department seeds;
3. for legacy Meeting rows with `GP_ID` and blank new fields only:
   - `Counterparty_Type = GP`;
   - `Counterparty_ID = existing GP_ID`;
   - `Related_GP_IDs = existing GP_ID`;
4. preserve existing Docs, filenames, rows, statuses, versions, counters, AI fields, links, user-mutated Masters, Settings, and Script Properties;
5. do not bulk-rename or rewrite legacy source Docs/files.

Migration must safely rerun without duplicate options, repeated updates, or changed timestamps on already-migrated rows unless repair is required.

## Registration UI

Replace the mandatory GP selector on Meeting New with:

1. `面談先区分` single-select;
2. dependent `面談先` single-select;
3. category-aware quick-add;
4. optional `関連GP` multi-select;
5. existing person field relabeled `面談相手（氏名・役職）`.

Behavior:

- no default category/entity;
- selected entity required;
- Inactive values are unavailable for new selection;
- quick-add GP uses GP Master;
- non-GP quick-add uses the corresponding Option Master Type;
- category changes clear an incompatible entity selection after confirmation or explicit user action;
- Related GP selections survive only while valid;
- GP category auto-includes the selected GP in Related GP IDs.

## Edit / search / lifecycle

Past Meeting search adds:

```text
面談先区分
面談先
関連GP
```

Existing filters remain:

```text
Date
Asset Class
Equity / Debt
Team
Fund / Strategy
Meeting Type
要フォロー
Status
```

Edit/reopen must preserve historical Inactive counterparties and existing relationship IDs.

Active / Inactive / Reactivate, optimistic locking, retry fingerprints, Audit redaction, and stable Meeting ID/Doc behavior remain unchanged.

## Filename and authoritative Doc

New filename:

```text
YYYY-MM-DD_Counterparty_AssetClass_Equity-or-Debt_MTG-XXXXXX
```

New/edited Docs use:

```text
面談先区分
面談先
関連GP
面談相手（氏名・役職）
```

Legacy `GP:` Docs remain readable. Editing a legacy GP Meeting may migrate its displayed metadata to the new labels while preserving Meeting ID and Doc File ID.

## Meeting to Pitchbook relation

Candidate rules for new links:

- Active Pitchbook;
- same Asset Class;
- Pitchbook GP is present in `Related_GP_IDs`.

Existing links remain visible and retained if Inactive, unresolved, or outside the current candidate rule.

This Work does not create a relation sheet or Relationship Explorer page; Work 0018 owns the broader reverse-lookup UX.

## Shared Meeting/Pitchbook draft state

Always shared:

```text
Date
Asset Class
Equity / Debt
Fund / Strategy
```

GP is shared to Pitchbook only when Meeting Counterparty Type is `GP`.

A non-GP Meeting does not auto-populate Pitchbook GP from Related GP selections.

## Downstream propagation

Update all relevant production paths:

- Meeting create/retry/edit/search/result mapping;
- Meeting Google Doc and filename;
- GP Workspace compatibility for GP Meetings;
- Knowledge Export metadata;
- AI source metadata;
- Audit metadata/redaction;
- browser drafts;
- Master Management;
- public safe errors.

AI metadata baseline:

```text
entity_key
counterparty_type
counterparty_id
counterparty_name
related_gp_ids
```

Pitchbook AI sources derive:

```text
counterparty_type = GP
counterparty_id = GP_ID
entity_key = GP:<GP_ID>
```

Work 0016 must not call billing-enabled Gemini/File Search. It only establishes deterministic metadata contracts for later personal-PC qualification.

## Existing specification changes

This Work prospectively supersedes the following old assumptions:

- Meeting `GP` required for every record;
- Meeting filename always uses GP;
- Meeting/Pitchbook shared browser context always shares GP;
- Meeting related-Pitchbook choices always derive from one `GP_ID`;
- Past Meeting counterpart filtering is GP-only.

Pitchbook's own required GP contract remains unchanged.

## Shortest target-runtime slice

After logic validation:

1. migrate the exact existing target resources to the new schema once;
2. reopen one accepted legacy GP Meeting and confirm automatic GP mapping;
3. add one synthetic non-GP entity through the normal Master path;
4. register one synthetic non-GP Meeting with one Related GP and one matching Related Pitchbook;
5. reopen, edit one field, and search using Counterparty Type + Counterparty Entity + Related GP;
6. verify filename/Doc/Index/Audit/relationship readback;
7. confirm legacy GP Workspace remains correct for GP records;
8. final integrity: stable IDs, no duplicate rows/files/options, five sheets, expected counters only.

## Logic validation

Required deterministic coverage:

- fixed category code validation and labels;
- category-to-master-source mapping;
- non-GP Option ID generation and type validation;
- legacy schema backfill/idempotency;
- conditional GP mirror behavior;
- composite entity key;
- Related GP canonicalization and GP auto-inclusion;
- related-Pitchbook candidate resolution;
- create/retry/edit/search round-trip;
- filename and Doc representation;
- legacy parser compatibility;
- shared-draft rules;
- GP Workspace compatibility;
- Knowledge Export/AI metadata mapping;
- Audit excludes source bodies and Follow-up note;
- public facade count remains intentional;
- canonical `npm run check` and `git diff --check`.

## Target-runtime and side-effect boundary

- actual existing private Apps Script Web App;
- synthetic/anonymized records only;
- application source sync/version/deployment update only after logic PASS;
- no confidential/company data;
- no Gemini billing/index calls;
- no triggers;
- no broad users/permissions;
- no physical delete or bulk production migration.

## Non-goals

- follow-up task workflow;
- activity charts/admin checks;
- static GP comparison;
- Relationship Explorer page;
- Entity Workspace generalization;
- Fund/Strategy Master;
- non-GP Pitchbook ownership;
- alias/merge across duplicate organizations;
- live Gemini qualification;
- production rollout.

## Completion latch

```text
LOGIC_VALIDATION: PASS
TARGET_RUNTIME_QUALIFICATION: PASS
SIDE_EFFECT_STATE: GUARDED / application production-data effects disabled
READY: YES
BLOCKER: NO
```

The Work is not complete from schema/unit tests alone. One legacy GP and one new non-GP Meeting must persist/reopen/search in the actual target runtime.
