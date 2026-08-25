# Work 0014 — Structured meeting context foundation

WORK_ID: `0014`

Mode: `BUILD`

## Primary outcome

Extend the existing Meeting/Pitchbook workflows with the structured context needed for later GP one-page views, meeting-to-material traceability, follow-up management, and activity analytics, while preserving legacy records and the existing five-sheet backend architecture.

This Work is a data-capture/search foundation. It does not build the later GP dashboard or analytics views themselves.

## Why this is next

Work 0013 closed the current DEV qualification and Web App recovery scope. The next useful product step is to make the underlying records rich enough for later summary and analytics features.

The following accepted user requirements are grouped here because they are all record-level metadata and share the same migration/UI/search path:

- Team attribution;
- Fund / Strategy;
- Meeting type flags;
- Meeting ↔ Pitchbook association;
- follow-up flag and note.

Building dashboards before these fields exist would create derived views over incomplete data and force rework.

## Data model

Preserve the existing Backend Spreadsheet tabs. Do not add a sixth backend sheet.

### Option_Master

Add one new option type:

`TEAM`

Seed values:

- `OPT-TEAM-001` — `PD`
- `OPT-TEAM-002` — `AE`

Team uses the existing Option Master maintenance model:

- immutable Option ID;
- mutable display name;
- Sort Order;
- Active / Inactive;
- all-user maintenance under the existing permissions/audit rules.

Team selection is single-select and optional. Both legacy and new Meeting records may remain unset.

### Meeting_Index appended columns

Append only; do not reorder or rewrite existing columns.

- `Team_ID`
- `Fund_Strategy`
- `Meeting_Type_Codes`
- `Related_Pitchbook_IDs`
- `Follow_Up_Required`
- `Follow_Up_Note`

Legacy rows remain valid with blank values in the new columns.

### Pitchbook_Index appended column

- `Fund_Strategy`

Legacy rows remain valid with a blank value.

## Field contracts

### Team

- optional single-select from active `TEAM` options;
- stored by stable Option ID in `Meeting_Index.Team_ID`;
- never infer a Team for legacy rows;
- do not force a default Team for new records.

### Fund / Strategy

- optional free text;
- maximum 500 characters;
- available in both Meeting and Pitchbook register/edit/search surfaces;
- Meeting and Pitchbook forms share this value in the existing browser shared-draft mechanism in the same spirit as Date / GP / Asset Class / Equity-Debt;
- do not introduce a Fund master or normalization taxonomy in this Work.

### Meeting types

UI uses three independent checkboxes. Multiple values may be selected.

Stable codes:

- `ANNUAL_REVIEW` — 定例年1回
- `OFFICE_VISIT` — 先方オフィス訪問
- `ANNUAL_GENERAL_MEETING` — 年次総会

Store `Meeting_Type_Codes` as a canonical comma-separated list in the code order above, without spaces. Blank means no type selected.

Unknown codes must fail closed during write validation. Existing blank values are valid.

### Meeting ↔ Pitchbook association

- one Meeting may link zero or more Pitchbooks;
- store only immutable Pitchbook `Document_ID` values in `Meeting_Index.Related_Pitchbook_IDs` as a canonical comma-separated list;
- do not store private Drive URLs as the relationship key;
- new selectable links are limited to Active Pitchbooks matching the selected GP and Asset Class;
- sort choices by Date descending, then Document ID;
- an already-linked Pitchbook that later becomes Inactive must not be silently removed from an existing Meeting;
- reverse lookup from Pitchbook to Meeting may scan Meeting_Index; do not add a relation sheet in this Work.

The Meeting edit surface must allow adding/removing links. Registration may also set links when matching Pitchbooks already exist.

### Follow-up

- `Follow_Up_Required`: boolean-like persisted value using the repository's existing normalization conventions; false/unset is allowed;
- `Follow_Up_Note`: optional, maximum 2,000 characters;
- UI: `要フォロー` checkbox plus optional note;
- Past Records adds `要フォローのみ` filtering;
- no completion state, owner, deadline, reminder, or workflow automation in this Work.

Follow-up note text is source content and must not be duplicated into Audit metadata.

## Meeting document representation

Meeting authoritative Google Docs should include the new human-readable context when present:

- Team display name;
- Fund / Strategy;
- Meeting type display labels;
- 要フォロー and follow-up note.

Do not duplicate Pitchbook binary/content into Meeting Docs. Related Pitchbook relationships may be represented by stable Document IDs and readable filenames/titles when already available, but the canonical relationship remains the Index IDs.

## UI / workflow requirements

### Meeting register/edit

Add:

- Team single-select;
- Fund / Strategy text field;
- three Meeting type checkboxes;
- Related Pitchbooks multi-select/checklist;
- 要フォロー checkbox;
- follow-up note.

Related Pitchbook choices refresh from the selected GP + Asset Class context without losing valid already-selected links during edit.

Draft retention must cover the new editable fields where appropriate.

### Pitchbook register/edit

Add optional `Fund / Strategy` and preserve it through prepare/upload/retry/edit flows.

### Past Records search

Meeting search adds optional filters:

- Team;
- Fund / Strategy text;
- Meeting type;
- 要フォローのみ.

Results/edit payloads expose the new fields and related Pitchbook IDs safely.

Pitchbook search adds optional Fund / Strategy text filtering.

## Knowledge Export / downstream metadata

Without changing the existing Gemini-independent export architecture:

- include Team, Fund / Strategy, Meeting type, follow-up flag, and related Pitchbook IDs as readable metadata when present;
- include Pitchbook Fund / Strategy in Pitchbook metadata output;
- do not duplicate follow-up note into Audit;
- do not create a new AI index or run Gemini live qualification here.

AI source-model metadata may be extended deterministically where required so later re-indexing can carry the new structured fields, but Work 0014 does not enable or live-qualify Gemini/File Search.

## Migration and compatibility

- increment the schema version once for the appended persistent columns/options;
- migration is forward-only and idempotent;
- preserve existing Meeting/Pitchbook rows, IDs, counters, statuses, files, AI fields, and user-mutable Master data;
- seed PD/AE only when missing; do not overwrite renamed/reordered/deactivated existing TEAM options on rerun;
- legacy rows with blank new fields must remain searchable/editable;
- existing retry fingerprints must be deliberately versioned/updated so retry safety includes the new mutable inputs without making old successful records invalid.

## Audit and security

- record metadata-level changes using existing audit conventions;
- do not duplicate Meeting notes or Follow_Up_Note into Audit body/metadata fields;
- related Pitchbook relationships are recorded by stable Document IDs, not private URLs;
- do not expose new privileged public functions;
- preserve the existing public-surface allowlist and safe-error policy.

## Acceptance evidence

Priority order:

1. schema/setup migration tests prove append-only idempotent migration and legacy compatibility;
2. Meeting create/edit/search round-trip all new fields;
3. Team master seed/maintenance behavior works and Team remains optional;
4. Meeting type normalization/validation is deterministic;
5. Meeting ↔ Pitchbook links use stable IDs, filter new choices by GP+Asset Class, and preserve existing links when a Pitchbook becomes Inactive;
6. Pitchbook Fund / Strategy survives prepare/upload/retry/edit/search;
7. Past Records filters Team / Fund-Strategy / Meeting type / follow-up correctly;
8. Knowledge Export includes the intended metadata and Audit remains content-redacted;
9. deterministic repository validation passes, including public-surface and Apps Script validators;
10. synthetic DEV live smoke proves one new rich Meeting create/edit/search cycle and one Pitchbook Fund / Strategy cycle without corrupting an existing legacy Meeting.

## Non-goals

Do not implement in Work 0014:

- GP one-page summary/dashboard;
- meeting-count charts or monthly/quarterly/yearly/fiscal-year analytics;
- monthly administrative transcription-check page;
- follow-up completion workflow, owners, deadlines, reminders, or notifications;
- Fund/Strategy master taxonomy;
- new backend sheets or external databases;
- legacy Word/Excel/TXT converter or bulk migration UI;
- Shared Drive-specific qualification;
- billing-enabled Gemini/File Search live qualification;
- production rollout/readiness declaration.

## Follow-on sequence

After Work 0014, preferred product sequence is:

- Work 0015: GP workspace / one-page summary and Meeting↔Pitchbook relationship views;
- Work 0016: meeting-activity analytics and administrative monthly check workflow;
- later: legacy converter/bulk ingestion and the remaining external production qualification work.
