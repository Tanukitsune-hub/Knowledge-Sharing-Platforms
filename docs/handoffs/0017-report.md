# Work 0017 — Meeting activity analytics and monthly administrative checks report

WORK_ID: `0017`
ACTIVE_DISPATCH_ID: `0017-CODEX-02`
BALL: `CODEX`
STATUS: `READY`

## Current result

Work 0017 is functionally qualified except for one user-facing filter option defect discovered in CODEX-01 target-runtime evidence.

Accepted CODEX-01 evidence:

- `LOGIC_VALIDATION: PASS` — focused suites `36/36`, canonical validation `230/230`;
- schema 5, exactly five Backend sheets;
- monthly series, Counterparty Type -> Team breakdown, FY2026 aggregation, exact one-Meeting drill: PASS;
- binary `月次管理反映済み` true/reload/false path with two metadata-only Audit events: PASS;
- no normal Meeting Version/Updated/Doc/follow-up/AI mutation from the admin check: PASS;
- public facade `26`;
- Apps Script version `36` was deployed in CODEX-01;
- final integrity otherwise PASS;
- no Gemini/File Search call or trigger enablement.

## GitHub-verified residual defect

The deployed Counterparty Type filter showed only `未選択`.

GitHub review confirmed the exact cause:

```text
server response: filterOptions.counterpartyTypes
client lookup:    filterOptions.counterpartyType
```

This violates the Work requirement that Counterparty Type be available as a user filter, so Work 0017 is not yet accepted/merged.

## ChatGPT repair

ChatGPT directly corrected the client option key and added a UI contract regression on the existing branch. No Apps Script/runtime mutation was performed by ChatGPT.

Remaining dispatch:

`docs/handoffs/0017-CODEX-02-counterparty-type-filter-finalization-instruction.md`

## Classification

- `BLOCKER`: corrected Counterparty Type filter must be deterministically validated and proven in the actual Web App before merge;
- `FIX SOON`: none beyond that bounded repair;
- `BACKLOG`: GitHub Actions CI and later production/Gemini qualification remain outside this Work.

Current:

```text
LOGIC_VALIDATION: PASS for CODEX-01 baseline; corrected branch revalidation pending
TARGET_RUNTIME_QUALIFICATION: BLOCKED — final filter verification required
SIDE_EFFECT_STATE: GUARDED
READY: NO
BLOCKER: YES
```

PR #23 remains Draft / Open / unmerged.
