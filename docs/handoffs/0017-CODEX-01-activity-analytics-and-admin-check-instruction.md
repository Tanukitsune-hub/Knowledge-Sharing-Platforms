# Work 0017 — CODEX-01 Activity Analytics and monthly admin check

WORK_ID: `0017`
DISPATCH_ID: `0017-CODEX-01`
BALL: `CODEX`
STATUS: `READY`

Repository: `Tanukitsune-hub/Knowledge-Sharing-Platforms`

Branch: `agent/0017-meeting-activity-analytics`

Draft PR: `TO_BE_ASSIGNED`

Exact ref: `TO_BE_UPDATED_AFTER_PR_SETUP`

Mode: `BUILD / QUALIFICATION`

Route: `C`

Recommended model: `Luna Max`.

## Read first

Read all applicable `AGENTS.md` / `AGENTS.override.md`, then:

1. `docs/handoffs/0017-instruction.md`;
2. `docs/planning/work0017-meeting-activity-analytics.md`;
3. `docs/decisions/temporal-data-contract.md`;
4. `docs/handoffs/0022-report.md` and the Work 0022 detailed report;
5. existing Activity/maintenance/navigation/public-surface source and tests.

Architecture is settled. Do not redesign the Counterparty model, temporal contract, five-sheet Backend, or monthly check into a workflow engine.

## Primary outcome

Build and qualify one `Activity Analytics` page plus one binary `月次管理反映済み` monthly administrative check in one vertical slice.

Do not split this Work into schema/UI/runtime sub-Works.

## Required implementation

### 1. Schema

Append only to `Meeting_Index`:

```text
Admin_Check_Completed
Admin_Check_Updated_At
Admin_Check_Updated_By
```

- increment `KSP_SCHEMA_VERSION` once;
- idempotent setup/migration;
- exactly five Backend sheets;
- blank legacy admin state reads false;
- do not rewrite unrelated existing cells.

### 2. Analytics server model

Read `Meeting_Index` only. Do not read Meeting Docs or Pitchbook bodies.

Support:

- Monthly;
- Calendar quarter;
- Calendar year;
- Fiscal year April–March (`FYyyyy` by starting year);
- custom inclusive range with daily buckets;
- cumulative monthly series from selected start date.

Use only Work 0022 canonical Business Date helpers for temporal interpretation.

Metrics:

- Meeting count;
- Active Meeting count;
- distinct stable Counterparty Entity count;
- open-follow-up count.

Dimensions/filters:

- Counterparty Type;
- Counterparty Entity;
- Related GP;
- Asset Class;
- Team;
- Meeting Type;
- Status.

Keep `未設定` buckets. Count from full matching rows before display caps. Return bounded drill/breakdown arrays plus omitted counts.

### 3. Admin-check mutation

Implement a dedicated narrow mutation.

- set explicit desired boolean state rather than blind toggle;
- validate Meeting identity and current expected admin-check token/state;
- atomic/lock-protected compare-and-write;
- write only the three `Admin_Check_*` fields;
- do not change normal Meeting `Version`, `Updated_At`, `Updated_By`, Doc/file, follow-up fields, or any AI field;
- `Admin_Check_Updated_At` uses canonical Instant UTC ISO;
- `Admin_Check_Updated_By` follows existing best-effort Actor;
- Audit one metadata-only admin-check event with safe before/after state;
- do not include Meeting body or Follow-up note.

### 4. Public facade

Prefer exactly two new normal-user facades:

- analytics read;
- admin-check mutation.

Add them to the explicit public allowlist and safe-error handling. Read-only analytics calls must not write Audit.

### 5. UI

Add `Activity Analytics` to the existing Web App navigation.

Page must include:

- period controls;
- filters;
- headline counts;
- time-series chart and table;
- selected-dimension breakdown and table;
- exact underlying Meeting list;
- monthly admin-check list/control when one month is selected.

Use dependency-free HTML/CSS/SVG/DOM rendering. No chart library/external BI dependency.

Meeting links should reuse existing safe Doc/maintenance navigation. Do not duplicate Meeting body content in the analytics response.

Provide accessible tabular equivalents and honest empty/truncated states.

## Deterministic validation

Add focused tests for:

- every period mode and FY boundary;
- Work 0022 Tokyo canonical date consumption;
- cumulative calculation;
- every dimension/filter and `未設定`;
- exact metrics before caps;
- stable ordering/omitted counts;
- no Doc-body read adapter use;
- admin mutation happy path, stale-state rejection, idempotent desired-state behavior, Audit redaction;
- admin mutation does not alter Meeting Version/Updated_At/AI fields;
- schema migration/idempotency;
- public facade;
- UI markup/accessible table/empty state as appropriate.

Then run:

- focused suites;
- `npm run check`;
- `git diff --check`;
- public-surface validation;
- final scoped diff review.

Do not synchronize Apps Script before deterministic PASS.

## Target-runtime qualification

Use the existing private synthetic installation and existing records only.

After positively identifying the existing Apps Script project and current private Web App:

1. synchronize exact tested source once;
2. exact source readback;
3. create exactly one immutable version;
4. update the same existing private `WEB_APP` in place;
5. do not create a new deployment or touch Library deployments.

Campaign:

1. run/setup the append-only schema migration and confirm five sheets/new headers/schema version;
2. open Activity Analytics and render a monthly series;
3. switch breakdown Counterparty Type -> Team;
4. drill to the exact underlying Meeting list and verify headline/list counts;
5. use the existing synthetic Meeting with baseline blank/false admin state;
6. set `月次管理反映済み=true` once and confirm persistence after reload, one metadata-only Audit event, and unchanged normal Meeting Version/Updated_At/AI/Doc state;
7. restore to baseline false once if needed for clean final state, accounting for exactly one additional admin-check Audit event;
8. verify one fiscal-year or boundary aggregation read using the accepted temporal contract;
9. final integrity: no duplicate rows/files/options, no unexpected settings/counters, no AI/File Search call, no trigger/permission/Library mutation.

## Non-goals / prohibitions

Do not:

- implement Relationship Explorer or Entity Workspace;
- add AI commentary;
- add task/reminder workflow or multiple admin-check states;
- add a new sheet/database/materialized analytics store without measured blocker;
- add an external chart library/service;
- call Gemini/File Search;
- enable triggers;
- use company/confidential data;
- perform production rollout;
- create another Web App deployment.

## Stop conditions

Stop only for a material blocker or Strategy Reset condition in the canonical Work instruction. Minor defects should be repaired within this dispatch with bounded tests and requalification.

## Delivery

Create:

`docs/handoffs/0017-CODEX-01-activity-analytics-and-admin-check-report.md`

Update:

- `docs/handoffs/0017-report.md`;
- `docs/handoffs/0017-instruction.md`;
- `docs/handoffs/0017-dispatches.md`;
- Draft PR body.

Commit and push all scoped changes. Keep the PR Draft / Open / unmerged for ChatGPT final review.

Return:

- Work ID / Dispatch ID;
- LOGIC_VALIDATION;
- TARGET_RUNTIME_QUALIFICATION;
- SIDE_EFFECT_STATE;
- schema/migration result;
- analytics period/dimension result;
- exact counts/drill result;
- admin-check persistence/Audit result;
- no-Doc/no-Version/no-AI mutation result;
- public facade count;
- Apps Script version;
- final integrity;
- report path;
- final commit;
- branch / Draft PR;
- BLOCKER YES/NO.

On full PASS classify:

```text
DEV QUALIFIED — WORK 0017 MEETING ACTIVITY ANALYTICS
LOGIC_VALIDATION: PASS
TARGET_RUNTIME_QUALIFICATION: PASS
SIDE_EFFECT_STATE: GUARDED
READY: YES
BLOCKER: NO
```
