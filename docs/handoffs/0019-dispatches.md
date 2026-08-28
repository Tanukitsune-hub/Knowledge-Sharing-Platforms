# Work 0019 dispatch control

WORK_ID: `0019`
DISPATCH_ID: `0019-CODEX-02`
BALL: `CODEX`
STATUS: `READY`

## Active dispatch

### 0019-CODEX-02 — READY

- mode: `BUILD / QUALIFICATION`;
- purpose: restore Work 0015 GP Workspace direct-only semantics without changing the new Entity Workspace Direct/Related model;
- recommended model: `Luna Max` — defect and repair boundary are fully identified;
- branch: `agent/0019-entity-workspace-strategy-drilldown`;
- Draft PR: `#25` — Open / Draft / unmerged;
- instruction: `docs/handoffs/0019-CODEX-02-gp-workspace-compatibility-finalization-instruction.md`;
- CODEX-01 implementation head before review repair: `56e5353a516f5c97dc73dcb24701e7c344b40c06`;
- blocker: legacy `getGpWorkspaceData(gpId)` silently broadened from direct-only Meetings to Direct + Related.

## Completed dispatch

### 0019-CODEX-01 — RETURNED / ACCEPTED EXCEPT COMPATIBILITY BLOCKER

Accepted evidence that must not be reopened absent contradiction:

- Entity Workspace implementation and target runtime: PASS;
- deterministic validation: `247/247 PASS`, focused `34/34 PASS`;
- target runtime: PASS on Apps Script version `39`;
- GP Entity Workspace: Direct `3` / Related `1`;
- non-GP explicit-link-only behavior: PASS;
- Fund / Strategy drill: PASS;
- application-data side effects: `DISABLED`;
- deployment side effects: `GUARDED`;
- public facade: `28`;
- Backend exactly five sheets / schema `5`;
- Audit `64`, AI disabled, trigger `0`;
- print evidence accepted and not to be repeated.

## Accepted predecessor evidence

- Work 0015 GP Workspace accepted;
- Work 0016 Counterparty Entity accepted;
- Work 0022 temporal contract accepted;
- Work 0017 Activity Analytics accepted;
- Work 0018 Relationship Explorer accepted/merged under PR #24.

## Ball control

Only `0019-CODEX-02` is active. No parallel Codex dispatch.

WORK_ID: `0019`
DISPATCH_ID: `0019-CODEX-02`
BALL: `CODEX`
STATUS: `READY`
