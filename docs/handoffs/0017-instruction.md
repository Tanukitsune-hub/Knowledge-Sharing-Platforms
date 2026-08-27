# Work 0017 — Meeting activity analytics and monthly administrative checks

WORK_ID: `0017`
DISPATCH_ID: `0017-CODEX-01`
MODE: `BUILD / QUALIFICATION`
BALL: `CODEX`
STATUS: `READY`

Repository: `Tanukitsune-hub/Knowledge-Sharing-Platforms`

Primary plan:

`docs/planning/work0017-meeting-activity-analytics.md`

Accepted predecessor contracts:

- Work 0016 Counterparty Entity foundation;
- Work 0022 repository-wide temporal data contract.

## Primary outcome

Deliver one usable `Activity Analytics` page that gives exact Meeting activity counts/time series/dimension breakdowns/drill lists and one lightweight monthly administrative completion control labeled `月次管理反映済み`.

The Work is one coherent vertical slice. Do not stop at schema-only, server-only, or UI-only completion.

## Acceptance evidence — strongest first

1. Existing private Apps Script Web App renders analytics from actual synthetic `Meeting_Index` rows, switches dimensions, drills to the exact underlying list, and persists/reopens the monthly admin check.
2. Schema migration is append-only/idempotent, Backend remains exactly five sheets, and `KSP_SCHEMA_VERSION` advances once.
3. All period buckets and filters consume the accepted Work 0022 temporal contract; no independent date parsing implementation is introduced.
4. Exact metrics use full matching rows before UI caps; bounded payloads expose omitted counts honestly.
5. Analytics never reads Meeting Doc bodies and does not Audit read-only page views.
6. Monthly admin-check mutation changes only `Admin_Check_Completed`, `Admin_Check_Updated_At`, and `Admin_Check_Updated_By`; it does not mutate Meeting `Version`, Meeting `Updated_At`, Doc/file content, AI state, follow-up content, or unrelated fields.
7. Admin-check Audit is metadata-only and concurrency-safe.
8. Dependency-free chart + accessible table equivalents, empty/error states, public-surface allowlist, deterministic tests, exact source readback, and final integrity all pass.

## Persistent schema

Append to `Meeting_Index` only:

```text
Admin_Check_Completed
Admin_Check_Updated_At
Admin_Check_Updated_By
```

Semantics are fixed in the primary plan. No new sheet and no generic workflow engine.

## Analytics contract

Periods:

- Monthly;
- Calendar quarter;
- Calendar year;
- Fiscal year April–March, label by starting year (`FY2026` = 2026-04-01..2027-03-31);
- Custom inclusive date range with daily buckets;
- cumulative monthly series from selected start date.

Metrics:

- Meeting count;
- Active Meeting count;
- distinct stable Counterparty Entity count;
- open-follow-up count as secondary information.

Dimensions/filters:

- Counterparty Type;
- Counterparty Entity;
- Related GP;
- Asset Class;
- Team;
- Meeting Type;
- Status.

Legacy/unset optional values remain visible as `未設定` rather than being dropped.

## Admin-check mutation boundary

Use a dedicated narrow mutation, not the normal Meeting edit path.

- optimistic compare must use the current admin-check state/token;
- do not increment normal Meeting `Version`;
- do not touch normal Meeting `Updated_At` / `Updated_By`;
- do not mark AI Pending or change any AI field;
- use the existing best-effort Actor contract;
- `Admin_Check_Updated_At` is canonical UTC Instant;
- Audit before/after includes only safe metadata needed to explain the admin-check state change;
- no Meeting body, Follow-up note, private source content, or unrelated metadata.

## Public surface

Prefer exactly two new bounded public facades:

- one analytics read facade;
- one monthly admin-check mutation facade.

Any equivalent naming is acceptable if explicitly allowlisted and safe-error wrapped. No analytics page-view Audit.

## Fastest safe decisive implementation

Implement in one pass:

schema/setup migration -> server aggregation/filter/bucketing -> read facade -> admin mutation/Audit -> Activity Analytics UI/chart/table -> tests/static checks -> source sync/version/in-place Web App update -> bounded target-runtime qualification -> final integrity.

## Target-runtime campaign

Use the existing private synthetic installation and existing records only.

1. Migrate the existing Backend to the new schema once and verify five sheets/schema headers.
2. Render one monthly series from existing rows.
3. Switch the selected breakdown between `Counterparty Type` and `Team`.
4. Drill to the exact underlying Meeting list and verify counts.
5. Reuse one existing synthetic Meeting whose baseline admin check is blank/false.
6. Set `月次管理反映済み` to true exactly once; reopen/read back; verify one metadata-only Audit event and no normal Meeting Version/AI/Doc mutation.
7. Restore to the baseline false state once if a clean final state is desired; if restored, expect exactly one additional admin-check Audit event and no other mutation.
8. Verify exact date/period behavior uses Work 0022 canonical Business Date.
9. Final integrity: no duplicates, no source-file mutation, no AI/File Search call, no trigger/permission/Library mutation, expected counters/settings only.

## Deterministic validation

Must cover:

- month/quarter/calendar-year/fiscal-year/custom/cumulative buckets;
- Tokyo boundary consumption via Work 0022 helper, not a duplicate parser;
- all dimensions/filters and `未設定`;
- exact full-row metrics independent of caps;
- stable ordering and omitted counts;
- no Doc-body reads;
- admin-check mutation validation, concurrency, Audit redaction;
- no Meeting Version/Updated_At/AI mutation from admin check;
- schema migration/idempotency;
- accessible table equivalents and safe empty/error states;
- public surface;
- `npm run check`;
- `git diff --check`.

## Non-goals

- arbitrary BI/dashboard builder;
- AI commentary;
- task/reminder workflow;
- multiple admin-check states or N/A;
- external chart/BI dependency;
- new analytics database/summary sheet without measured need;
- Relationship Explorer;
- Gemini/File Search live calls;
- production rollout.

## Stop / reset conditions

Stop for Strategy Reset only if:

- the single binary admin check proves insufficient for the actual process;
- exact aggregation cannot be achieved from `Meeting_Index` without a material new storage layer;
- target-runtime scale proves the read facade unusably slow and requires a new caching decision;
- source/deployment identity is ambiguous;
- a material accepted predecessor contract is contradicted.

Do not stop for minor UI/detail issues that can be repaired within this Work.

## Completion latch

```text
DEV QUALIFIED — WORK 0017 MEETING ACTIVITY ANALYTICS
LOGIC_VALIDATION: PASS
TARGET_RUNTIME_QUALIFICATION: PASS
SIDE_EFFECT_STATE: GUARDED
READY: YES
BLOCKER: NO
```

Keep the implementation PR Draft / Open / unmerged until ChatGPT final review.