# Work 0017 — Meeting activity analytics and monthly administrative checks

WORK_ID: `0017`

Status: Planned after Work 0016

Mode: `BUILD`

## Primary outcome

Provide an operational analytics page that shows Meeting activity over time using the structured counterparty/entity foundation, plus a lightweight monthly administrative completion view.

The user can understand:

- how many Meetings occurred;
- how activity changes by period;
- which counterparties / GPs / Asset Classes / Teams drove activity;
- which monthly records still require the agreed administrative step.

## Dependency

Work 0016 must be accepted first. Analytics is built on:

```text
Counterparty_Type
Counterparty_ID
Related_GP_IDs
Asset_Class_ID
Team_ID
Meeting_Type_Codes
Date
Status
```

Do not implement a GP-only analytics model and later retrofit entity categories.

## Analytics periods

Supported period views:

```text
Monthly
Calendar quarter
Calendar year
Fiscal year (April–March)
Custom date range
Cumulative from selected start date
```

All date bucketing uses the configured `Asia/Tokyo` logical Meeting date.

## Metrics

Initial metrics:

- Meeting count;
- Active Meeting count;
- distinct counterparty count;
- optional open-follow-up count as a secondary informational metric only.

Do not turn follow-up into a task workflow.

## Dimensions / filters

The same analytics dataset supports:

```text
Counterparty Type
Counterparty Entity
Related GP
Asset Class
Team
Meeting Type
Status
```

`未設定` remains a valid bucket for legacy/unset Team or optional metadata.

Views should permit:

- overall series;
- one selected dimension breakdown;
- table plus compact chart;
- exact underlying Meeting list for the selected period/filter.

Avoid a highly configurable BI-builder UI. Provide a small set of clear controls and deterministic aggregation.

## Visualizations

Initial chart set:

1. time-series Meeting count;
2. category/entity breakdown for the selected range;
3. cumulative count when cumulative mode is selected.

Use browser-native chart rendering already acceptable to the repository or a small dependency-free implementation. Do not introduce an external dashboard service.

Charts must have accessible tabular equivalents and honest empty/truncated states.

## Monthly administrative check

The page includes a selected-month Meeting list with one lightweight persistent completion control per Meeting.

Before implementation, confirm the exact business label. Default proposal:

```text
月次管理反映済み
```

Default persistence is intentionally minimal:

```text
Admin_Check_Completed
Admin_Check_Updated_At
Admin_Check_Updated_By
```

These columns are append-only on `Meeting_Index`, blank/false for legacy rows, and Audit only metadata-level changes.

If the real process requires multiple independent checks or a Not Applicable state, stop at Work kickoff and revise the contract before schema implementation. Do not silently turn one checkbox into a generic workflow engine.

## Data and performance model

- aggregate from `Meeting_Index`; do not read Meeting Google Doc bodies;
- use full matching rows for exact counts;
- bound UI row payloads and return omitted counts;
- server aggregation must be deterministic and stable-ID based;
- no new analytics database or materialized summary sheet initially;
- if actual target-runtime scale becomes slow, measure first and add the smallest justified cache/summary mechanism in a separate decision.

## Page behavior

Add one `Activity Analytics` page containing:

- period mode and date controls;
- filter controls;
- headline counts;
- time-series chart/table;
- selected-dimension breakdown;
- underlying Meeting list;
- monthly admin check section when a month is selected.

Clicking a Meeting opens the existing authoritative Doc or maintenance record. No duplicate Meeting content is stored in the analytics response.

## Public surface

Prefer one bounded read facade and one narrow admin-check mutation facade rather than many browser-callable functions.

Any new public functions must be explicitly allowlisted and safe-error wrapped. Analytics reads must not Audit every page view. Administrative check mutations must Audit the changed state.

## Shortest target-runtime slice

1. render one monthly series from existing synthetic records;
2. switch one dimension between Counterparty Type and Team;
3. drill to the exact underlying Meeting list;
4. toggle one synthetic Meeting's administrative check once;
5. reopen and confirm persistence/Audit;
6. restore the synthetic check to its baseline if the qualification contract requires a clean final state;
7. verify no Meeting Doc/source file/AI state mutation.

## Logic validation

- Asia/Tokyo month/quarter/year/fiscal-year bucketing;
- cumulative series;
- all dimension filters and `未設定` buckets;
- exact counts independent of display caps;
- stable ordering and omitted counts;
- no Doc-body reads;
- administrative check validation/optimistic update/Audit;
- accessible table equivalent;
- safe empty/error states;
- public surface;
- `npm run check` and `git diff --check`.

## Non-goals

- static multi-GP qualitative comparison;
- AI-generated analytics commentary;
- editable follow-up tasks;
- arbitrary user-defined metrics/dashboards;
- external BI service;
- new summary database by default;
- Relationship Explorer;
- Gemini/File Search live calls;
- production rollout.

## Completion latch

```text
LOGIC_VALIDATION: PASS
TARGET_RUNTIME_QUALIFICATION: PASS
SIDE_EFFECT_STATE: GUARDED
READY: YES
BLOCKER: NO
```
