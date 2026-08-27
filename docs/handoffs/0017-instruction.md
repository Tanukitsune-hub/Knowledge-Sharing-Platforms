# Work 0017 — Meeting activity analytics and monthly administrative checks

WORK_ID: `0017`
DISPATCH_ID: `0017-CODEX-02`
MODE: `BUILD / QUALIFICATION`
BALL: `CODEX`
STATUS: `READY`

Repository: `Tanukitsune-hub/Knowledge-Sharing-Platforms`

Primary plan:

`docs/planning/work0017-meeting-activity-analytics.md`

Active residual instruction:

`docs/handoffs/0017-CODEX-02-counterparty-type-filter-finalization-instruction.md`

## Primary outcome

Deliver one usable `Activity Analytics` page that gives exact Meeting activity counts/time series/dimension breakdowns/drill lists and one lightweight monthly administrative completion control labeled `月次管理反映済み`.

## Fixed contract

- Work 0016 Counterparty Entity foundation and Work 0022 temporal contract are accepted predecessors;
- Backend remains exactly five sheets;
- `Meeting_Index` appends only `Admin_Check_Completed`, `Admin_Check_Updated_At`, `Admin_Check_Updated_By`;
- analytics reads `Meeting_Index` only and never Meeting Doc bodies;
- admin-check mutation changes only the three admin fields and metadata-only Audit state;
- no normal Meeting Version/Updated/Doc/follow-up/AI mutation from admin check;
- dimensions/filters include Counterparty Type, Counterparty Entity, Related GP, Asset Class, Team, Meeting Type, and Status;
- charts remain dependency-free with accessible table equivalents;
- no AI commentary, workflow engine, external BI, Relationship Explorer, Gemini/File Search call, triggers, or production rollout.

## Accepted CODEX-01 evidence

Do not reopen absent direct contradiction:

- schema 5 / exactly five Backend sheets: PASS;
- monthly series, Counterparty Type -> Team breakdown, FY2026 aggregation: PASS;
- exact underlying Meeting drill: PASS;
- admin check true -> reload -> false, exactly two metadata-only Audit events: PASS;
- no normal Meeting Version/Updated/Doc/follow-up/AI mutation: PASS;
- public facade: 26;
- Apps Script version 36 was deployed in CODEX-01;
- final integrity otherwise PASS;
- no Gemini/File Search call or trigger enablement.

## Remaining BLOCKER

CODEX-01 runtime evidence showed the Counterparty Type filter control contained only `未選択`.

GitHub review proved a one-key mismatch:

```text
server: filterOptions.counterpartyTypes
client: filterOptions.counterpartyType
```

Because Counterparty Type is a required user filter, Work 0017 is not yet accepted/merged.

ChatGPT has already applied the minimal branch repair and regression. CODEX-02 owns only deterministic revalidation, one corrected source synchronization/version/in-place Web App update, direct UI filter verification, final integrity, report/commit/push/PR update.

## Completion latch

Complete only after CODEX-02 proves:

```text
DEV QUALIFIED — WORK 0017 MEETING ACTIVITY ANALYTICS
LOGIC_VALIDATION: PASS
TARGET_RUNTIME_QUALIFICATION: PASS
SIDE_EFFECT_STATE: GUARDED
READY: YES
BLOCKER: NO
```

PR #23 remains Draft / Open / unmerged until ChatGPT final review.
