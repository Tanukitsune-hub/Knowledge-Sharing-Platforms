# Work 0019 — CODEX-02 GP Workspace compatibility finalization

WORK_ID: `0019`
DISPATCH_ID: `0019-CODEX-02`
BALL: `CODEX`
STATUS: `READY`
MODE: `BUILD / QUALIFICATION`
ROUTE: `C`

Repository: `Tanukitsune-hub/Knowledge-Sharing-Platforms`
Branch: `agent/0019-entity-workspace-strategy-drilldown`
Draft PR: `#25`

## Accepted evidence — do not reopen

CODEX-01 remains accepted for the new Entity Workspace itself:

- `247/247 PASS`, focused `34/34 PASS`;
- Entity Workspace GP mode: Direct `3`, Related `1`, GP-owned Pitchbooks `16` in target runtime;
- non-GP explicit-link-only Pitchbook behavior: PASS;
- exact Fund / Strategy drill: PASS;
- public facade `28`;
- Apps Script version `39` deployment update: PASS;
- five Backend sheets / schema `5`;
- application data unchanged, Audit `64`, AI disabled, zero triggers;
- no Gemini/File Search call.

Do not redesign or reimplement those areas.

## Review finding to repair

ChatGPT final review found one backward-compatibility defect in the legacy Work 0015 GP Workspace facade.

Before Work 0019, `getGpWorkspaceData(gpId)` was a **direct-counterparty GP view**. Its Meeting totals/recent Meetings/follow-ups/relationship list were derived only from Meetings whose counterparty is that GP (and whose compatibility `GP_ID` mirrors the same GP).

CODEX-01 changed the compatibility adapter so the legacy facade now includes non-GP Meetings where the selected GP appears only in `Related_GP_IDs`. The new Entity Workspace should continue to show Direct + Related separately, but the legacy GP Workspace compatibility facade must not silently change its historical semantics.

This is the only blocker.

## Required repair

1. Keep the new Entity Workspace behavior unchanged:
   - GP Entity Workspace still shows Direct and Related separately;
   - target-runtime baseline remains Direct `3` / Related `1` for the accepted synthetic GP.

2. Restore legacy `getGpWorkspaceData(gpId)` semantics using the **shared Work 0019 helpers/read model**, not a second divergent business implementation:
   - Meeting totals/active totals = direct GP Meetings only;
   - recent Meetings = direct GP Meetings only;
   - active follow-ups = direct GP Meetings only;
   - relationship list = explicit relationships originating from direct GP Meetings only;
   - Fund / Strategy Meeting counts = direct GP Meetings only;
   - GP-owned Pitchbooks remain exact `GP_ID` ownership as before;
   - Fund / Strategy Pitchbook counts remain GP-owned Pitchbooks;
   - stable IDs, safe links, ordering, caps and omitted counts remain compatible;
   - related-only non-GP Meetings must not leak into the legacy facade.

3. The compatibility adapter may reuse `kspEntityWorkspaceMapMeeting_`, `kspEntityWorkspaceMapPitchbook_`, `kspEntityWorkspaceBuildFundStrategies_`, `kspEntityWorkspaceBuildRelationshipRecords_`, cap/sort helpers, and the shared Entity Workspace call. Do not restore the removed standalone Work 0015 aggregation implementation wholesale.

4. Update regression tests so they prove both contracts simultaneously:
   - Entity Workspace GP mode still includes Direct + Related (`4` total in the deterministic fixture);
   - legacy GP Workspace returns only the `2` direct GP Meetings in that same fixture;
   - no recent legacy GP Meeting has `activityScope === 'related'`;
   - legacy active-follow-up and relationships are direct-only;
   - related-only Fund / Strategy values do not appear in the legacy GP Workspace;
   - GP-owned Pitchbooks remain unchanged;
   - compatibility still delegates/reuses Work 0019 shared helpers.

## Validation

Run:

- focused Entity/GP Workspace compatibility tests;
- full `npm run check`;
- temporal validator;
- public-surface validator — must remain `28`;
- `git diff --check`;
- scoped diff review.

Do not sync Apps Script until deterministic validation passes.

## Target-runtime finalization

Using the same existing synthetic DEV installation and records only:

1. positively identify the same Apps Script project and existing private Web App;
2. synchronize the exact corrected tested source once;
3. exact source readback;
4. create exactly one new immutable Apps Script version (expected next natural version is `40`; verify rather than assume);
5. update the same existing private Web App in place; no new deployment/Library mutation;
6. verify Entity Workspace GP mode still shows Direct `3` / Related `1`;
7. verify the old GP Workspace facade/view now returns the historical direct-only Meeting total `3` and excludes the one related-only non-GP Meeting;
8. verify GP-owned Pitchbook total remains `16` and existing Fund / Strategy/direct relationships remain coherent;
9. verify the LP/non-GP Entity Workspace remains unchanged;
10. final integrity: five sheets/schema 5, source rows/files/Masters/Settings/Audit/Script Properties unchanged, Audit remains `64`, AI disabled, trigger `0`, no Gemini/File Search, no permission/Library mutation.

Do not invoke browser print again unless required by a direct regression. CODEX-01 print evidence is accepted.

## Delivery

Create:

`docs/handoffs/0019-CODEX-02-gp-workspace-compatibility-finalization-report.md`

Update:

- `docs/handoffs/0019-report.md`;
- `docs/handoffs/0019-dispatches.md`;
- `docs/handoffs/0019-instruction.md` only if needed for final status consistency;
- PR #25 body.

Commit and push all scoped changes. Keep PR #25 Draft / Open / unmerged for ChatGPT final review.

Return:

- Work ID / Dispatch ID;
- focused/full validation;
- Entity Workspace Direct/Related result;
- legacy GP Workspace direct-only result;
- GP-owned Pitchbook result;
- LP/non-GP regression result;
- public facade;
- Apps Script version;
- final integrity;
- report path;
- final commit;
- branch / Draft PR;
- BLOCKER YES/NO.

On full PASS:

```text
DEV QUALIFIED — WORK 0019 ENTITY WORKSPACE
LOGIC_VALIDATION: PASS
TARGET_RUNTIME_QUALIFICATION: PASS
APPLICATION_DATA_SIDE_EFFECT_STATE: DISABLED
DEPLOYMENT_SIDE_EFFECT_STATE: GUARDED
GP_WORKSPACE_BACKWARD_COMPATIBILITY: PASS
READY: YES
BLOCKER: NO
```
