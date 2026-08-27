# Work 0015 — GP workspace / one-page summary

WORK_ID: `0015`

Mode: `BUILD`

## Primary outcome

Add one read-only GP Workspace to the existing Web App so an authorized user can select any GP and immediately understand its current record context from the accepted Work 0014 structured data.

The workspace must provide:

- a compact GP-level snapshot;
- recent Meetings;
- recent Pitchbooks;
- open follow-up items;
- Fund / Strategy context;
- Meeting ↔ Pitchbook relationship resolution;
- a dedicated A4 one-page print/PDF brief using the browser's normal print / Save as PDF flow.

This Work is a presentation/read model. It must not add persistent product fields, a new backend sheet, a GP profile database, or AI-generated summary text.

## Why this is next

Work 0014 made Team, Fund / Strategy, Meeting types, stable Meeting↔Pitchbook links, and follow-up fields authoritative and searchable. Work 0015 turns that structure into a useful GP-centric view before the later counterparty/entity and analytics expansion.

The current post-0015 sequence is:

`0014 structured records -> 0015 GP workspace -> 0016 counterparty entity foundation -> 0017 activity analytics/admin checks`.

## Product shape

Add one navigation item:

`GP Workspace`

The page starts with a GP selector populated from the existing GP Master. Both Active and Inactive GPs may be selected so historical context remains visible. Inactive GPs are visibly labeled; do not hide their historical records.

No GP is selected by default.

### Screen workspace

After selecting a GP, show the following.

#### GP header

- GP display name;
- stable GP ID in secondary text;
- Active / Inactive badge;
- print / PDF button.

#### Snapshot cards

Use exact full-record counts, not counts from truncated UI lists:

- Meetings — total and Active count;
- Pitchbooks — total and Active count;
- 要フォロー — Active Meeting rows where `Follow_Up_Required` is true;
- Last Meeting — most recent logical Meeting date, or `—`.

Do not add time-series charts here; those belong to Work 0017 after the Work 0016 counterparty/entity foundation.

#### Fund / Strategy

Aggregate non-blank free-text Fund / Strategy values across Meeting and Pitchbook rows for the selected GP.

For each displayed value show:

- text;
- Meeting count;
- Pitchbook count;
- latest logical date across either source.

Sort by latest date descending, then case-insensitive text. Legacy blank values are ignored rather than inferred.

#### Recent Meetings

Show up to 20 newest Meeting rows for the selected GP, sorted by logical Date descending then stable Meeting ID.

Display compactly:

- Date;
- Asset Class;
- Equity / Debt when present;
- Team when present;
- Fund / Strategy when present;
- Meeting type labels when present;
- 要フォロー badge when applicable;
- related Pitchbook count;
- status;
- Google Doc link when available.

Do not read or duplicate the authoritative Meeting body text in this Work.

#### Recent Pitchbooks

Show up to 20 newest Pitchbook rows for the selected GP, sorted by logical Date descending then stable Document ID.

Display:

- Date;
- Asset Class;
- Equity / Debt when present;
- Fund / Strategy when present;
- filename;
- status;
- authoritative file link when available.

#### 要フォロー

Show up to 20 Active Meeting rows where `Follow_Up_Required` is true.

Display:

- Date;
- Fund / Strategy when present;
- Team when present;
- follow-up note;
- Meeting Doc link when available.

The note is authorized source content and may be shown in this read-only workspace, but it must not be added to Audit or other metadata stores.

#### Meeting ↔ Pitchbook relationships

Show up to 20 newest Meetings that contain one or more `Related_Pitchbook_IDs`.

For each Meeting:

- Date and Meeting ID;
- Fund / Strategy when present;
- resolved Pitchbook relationships using immutable Document IDs;
- resolved filename / status / file link when the target exists;
- preserve and visibly mark an unresolved Document ID instead of silently dropping it;
- preserve Inactive linked Pitchbooks and label them Inactive.

The canonical relationship remains `Meeting_Index.Related_Pitchbook_IDs`; this Work creates no relation sheet.

### Truncation honesty

The server must scan the full selected-GP record set so headline counts are exact, then cap display lists.

Return/display omitted counts whenever a list exceeds its UI cap. Never imply the visible list is the complete history when it is truncated.

## Dedicated one-page print / PDF brief

Implement a separate print-only rendering derived from the same GP Workspace response. Do not create Drive artifacts.

The normal screen page may scroll. The print brief must be deliberately bounded for A4 landscape:

- GP header and snapshot cards;
- up to 8 Fund / Strategy items;
- latest 5 Meetings;
- latest 5 Pitchbooks;
- up to 5 follow-up items;
- up to 5 Meeting↔Pitchbook relationship rows;
- `+N more` indicators where content is omitted.

Use a dedicated print-only container and print stylesheet:

- `@page { size: A4 landscape; ... }`;
- hide normal navigation, controls, and non-GP pages;
- show only the print brief;
- use compact typography and fixed section limits;
- avoid page breaks inside compact rows/cards where practical;
- line-clamp/clip long notes and names in the print brief rather than allowing unbounded height.

The print button should call the normal browser print flow (`window.print()`), allowing the user to print or Save as PDF. No generated Google Doc/PDF is required in Work 0015.

## Server read model

Add one normal-user read endpoint:

`getGpWorkspaceData(gpId)`

Implement the production business logic in private source code; do not put business behavior only in test loaders.

The endpoint should reuse existing authoritative Backend/Master read paths where practical and return a bounded safe response similar to:

```text
{
  ok,
  gp,
  summary,
  fundStrategies,
  recentMeetings,
  recentPitchbooks,
  followUps,
  relationships,
  omittedCounts
}
```

Exact property naming may follow repository conventions, but the semantics above are fixed.

### GP identity

- select by stable GP ID;
- require exactly one matching GP Master row;
- allow Active or Inactive GP rows;
- return safe public error for missing/unknown GP;
- do not infer or auto-create GP records.

### Data sources

Use existing:

- `GP_Master`;
- `Option_Master` display names;
- `Meeting_Index`;
- `Pitchbook_Index`.

Do not read:

- Meeting Google Doc body;
- Pitchbook binary content;
- Gemini/File Search;
- Audit as a data source for the workspace.

### Read-only invariant

Loading/selecting/printing a GP Workspace must not:

- update Backend rows;
- rename/create/move Drive files;
- write Audit rows;
- change Script Properties;
- create triggers;
- call Gemini/File Search.

## Public surface

One new normal-user facade function is authorized for this Work:

`getGpWorkspaceData`

Update the public-surface allowlist and regression expectations deliberately. The expected public facade count therefore increases by one from the Work 0014 accepted count.

Do not expose private helper functions.

## Legacy and missing-data behavior

- blank Team / Fund / Strategy / Meeting types / relationships / follow-up fields remain valid;
- missing optional values display as `—` or are omitted cleanly;
- Inactive GP and source records remain readable in historical context;
- unknown relationship Document IDs are shown as unresolved IDs;
- no automatic data repair or migration occurs when viewing the workspace.

## Security and URL handling

- normal Web App access boundary remains unchanged;
- Drive/Docs links use the existing safe-link handling conventions;
- no raw runtime IDs, private Web App URLs, or organization-specific folder identifiers are committed or reported;
- Follow_Up_Note remains source content and is not copied into Audit;
- no Meeting body or Pitchbook body is duplicated into the workspace response.

## Target runtime, isolated data, and side effects

`TARGET_RUNTIME`: existing organization-controlled Apps Script Web App and supported authenticated browser.

`ISOLATED_TEST_DATA`: reuse the existing accepted synthetic GP/Meeting/Pitchbook records from Work 0014 when possible. Do not create new records merely for Work 0015 if the accepted synthetic relationship/follow-up data is sufficient.

`SIDE_EFFECT_STATE`: application data writes disabled; only source synchronization, immutable version creation, and in-place update of the positively identified existing private Web App deployment are allowed after logic validation passes.

`STAGING_DECISION`: Not required. Use the actual existing private target Web App with synthetic data under the target-runtime-first policy.

## Acceptance evidence and hierarchy

Strongest evidence first:

1. authenticated target-runtime browser renders the new GP Workspace from the exact tested source;
2. selecting an existing synthetic GP returns exact counts and expected structured data from authoritative Backend readback;
3. relationship view resolves the accepted Work 0014 Meeting↔Pitchbook link, including stable IDs and status;
4. follow-up view exposes the accepted synthetic follow-up state without any new Audit/data mutation;
5. print-only one-page brief renders from the same response and the print action reaches the normal browser print surface without creating Drive artifacts;
6. authoritative before/after readback confirms the workspace is read-only;
7. deterministic service/client contracts cover aggregation, ordering, truncation, legacy blanks, unresolved relationships, inactive records, URL safety, and public-surface exposure;
8. canonical `npm run check` and `git diff --check` pass.

## Non-goals

Do not implement in Work 0015:

- GP descriptive profile fields or a GP profile master;
- editable GP notes;
- AI-generated GP summaries;
- Meeting body summarization;
- charts or monthly/quarterly/yearly/fiscal-year activity analytics;
- monthly administrative check workflow;
- follow-up owner/deadline/completion/reminder workflow;
- Fund/Strategy master taxonomy;
- relation sheet or sixth Backend sheet;
- new database;
- Drive-generated GP report artifacts;
- legacy bulk converter/import;
- Shared Drive production permission qualification;
- billing-enabled Gemini/File Search live qualification;
- production rollout/readiness declaration.

## Follow-on

After Work 0015 acceptance, proceed to Work 0016 for the Counterparty entity foundation. Meeting activity analytics and the monthly administrative check workflow follow in Work 0017.
