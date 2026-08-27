# Work 0017 — Meeting activity analytics and monthly administrative checks

WORK_ID: `0017`

Status: Implementation-ready after accepted Work 0016 and Work 0022

Mode: `BUILD`

## Primary outcome

Provide an operational analytics page that shows Meeting activity over time using the structured counterparty/entity foundation, plus a lightweight monthly administrative completion view.

The user can understand:

- how many Meetings occurred;
- how activity changes by period;
- which counterparties / GPs / Asset Classes / Teams drove activity;
- which monthly records still require the agreed administrative step.

## Dependencies / closed foundations

Work 0016 and Work 0022 are accepted and completion-latched.

Analytics is built on:

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

Every period/filter/bucket calculation must consume the accepted Work 0022 temporal contract. Do not add another date parser or fiscal-year date algorithm outside the analytics bucketing logic.

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

All bucketing uses canonical Business Date in configured `Asia/Tokyo`.

Fiscal-year labels use the starting year: `FY2026` means `2026-04-01` through `2027-03-31`.

For deterministic initial behavior:

- Monthly -> `YYYY-MM` buckets;
- Calendar quarter -> `YYYY-Q1..Q4` buckets;
- Calendar year -> `YYYY` buckets;
- Fiscal year -> `FYyyyy` buckets;
- Custom date range -> exact-date (`YYYY-MM-DD`) buckets inside the selected inclusive range;
- Cumulative -> monthly buckets from the selected start date, with running Meeting count.

Do not add adaptive/automatic granularity in this Work.

## Metrics

Initial metrics:

- Meeting count;
- Active Meeting count;
- distinct counterparty count using stable composite entity identity;
- open-follow-up count as a secondary informational metric only.

Metrics are computed from the full matching row set before display caps.

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

`未設定` remains a valid bucket for legacy/unset optional metadata.

Views should permit:

- overall series;
- one selected dimension breakdown;
- table plus compact chart;
- exact underlying Meeting list for the selected period/filter.

Avoid a highly configurable BI-builder UI. Provide a small set of clear controls and deterministic aggregation.

## Visualizations

Initial chart set:

1. time-series Meeting count;
2. selected-dimension breakdown for the selected range;
3. cumulative count when cumulative mode is selected.

Use dependency-free browser rendering (HTML/CSS/SVG as appropriate). Do not introduce an external dashboard/chart service or library solely for this Work.

Charts must have accessible tabular equivalents and honest empty/truncated states.

## Monthly administrative check — confirmed contract

Business label is confirmed for this Work as:

```text
月次管理反映済み
```

It is exactly one binary state. Do not add Not Applicable, multiple checks, workflow states, assignments, deadlines, reminders, or task management.

Append to `Meeting_Index`:

```text
Admin_Check_Completed
Admin_Check_Updated_At
Admin_Check_Updated_By
```

Semantics:

- legacy blank `Admin_Check_Completed` reads as false;
- new state is written as a boolean-compatible value through the existing Sheets conventions;
- `Admin_Check_Updated_At` is canonical Instant UTC ISO;
- `Admin_Check_Updated_By` uses the existing best-effort Actor contract;
- admin-check mutation must not change Meeting identity, Meeting `Version`, Meeting `Updated_At`, Doc/file content, AI index state, follow-up content, or unrelated fields;
- use a narrow optimistic concurrency contract based on the current admin-check state/token rather than reusing the normal Meeting edit mutation;
- Audit records metadata-only before/after admin-check state and actor/timestamp; no Meeting body or Follow-up note content.

The schema change is append-only and therefore increments `KSP_SCHEMA_VERSION` once.

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
- monthly admin-check section when a month is selected.

Clicking a Meeting opens the existing authoritative Doc or maintenance record. No duplicate Meeting content is stored in the analytics response.

## Public surface

Prefer exactly one bounded read facade and one narrow admin-check mutation facade.

Any new public functions must be explicitly allowlisted and safe-error wrapped. Analytics reads must not Audit page views. Administrative check mutations must Audit the changed state.

Expected public-facade delta is `+2` unless implementation can safely reuse an already-approved facade without broadening its contract.

## Shortest target-runtime slice

1. migrate the exact existing synthetic Backend to the new append-only schema once;
2. render one monthly series from existing synthetic records;
3. switch one dimension between Counterparty Type and Team;
4. drill to the exact underlying Meeting list;
5. set one existing synthetic Meeting's `月次管理反映済み` from false/blank to true exactly once;
6. reopen and confirm persistence plus one metadata-only Audit event;
7. set it back to its baseline false state exactly once if needed for a clean final state, and account for the second Audit event explicitly;
8. verify no Meeting Doc/source file/Meeting Version/AI state mutation;
9. complete final schema/data/integrity readback.

## Logic validation

- Work 0022 canonical Business Date is the only temporal input contract;
- Asia/Tokyo month/quarter/year/fiscal-year bucketing;
- cumulative series;
- all dimension filters and `未設定` buckets;
- exact counts independent of display caps;
- stable ordering and omitted counts;
- no Doc-body reads;
- administrative check validation/concurrency/Audit;
- admin check does not increment Meeting Version or mark AI Pending;
- accessible table equivalent;
- safe empty/error states;
- public surface;
- schema migration/idempotency;
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
