# Work 0019 — Entity Workspace + Fund / Strategy drill-down

WORK_ID: `0019`
DISPATCH_ID: `0019-CODEX-01`
MODE: `BUILD / QUALIFICATION`
BALL: `CODEX`
STATUS: `READY`

Repository: `Tanukitsune-hub/Knowledge-Sharing-Platforms`

Primary plan: `docs/planning/work0019-entity-workspace-strategy-drilldown.md`

Accepted predecessors: Work 0015, 0016, 0022, 0017, 0018.

## Primary outcome

Deliver one reusable read-only Entity Workspace for every accepted Counterparty Type, with exact Fund / Strategy drill-down, while converging the old GP Workspace onto the same internal read model.

## Fixed architecture

- Entity identity is exactly `Counterparty_Type + ':' + Counterparty_ID`.
- Backend remains exactly five sheets; schema remains `5`; no migration.
- Application data is read-only.
- Work 0022 temporal helpers are authoritative.
- Work 0018 explicit stable-ID relationship semantics are authoritative.
- No Meeting body reads, Pitchbook byte reads, Audit reads/writes, Gemini/File Search, triggers, external stores, or production rollout.
- Fund / Strategy identity is exact trimmed free text. Sorting may be case-insensitive; grouping/matching may not fuzzy-merge or alias values.
- Print/PDF is browser-native `window.print()` only; no Drive artifact.

## Entity semantics

All entity types from Work 0016 must be selectable, including Inactive entities.

All entities show entity identity/status, exact direct Meeting counts, recent direct Meetings, Team/Asset Class/Meeting Type mixes, informational follow-ups, Relationship context, latest activity, timeline, omitted counts, and print brief.

GP mode additionally shows:
- GP-owned Pitchbooks by exact `Pitchbook_Index.GP_ID`;
- direct GP Meetings;
- related non-direct Meetings where GP is explicitly in `Related_GP_IDs`;
- direct vs related counts/lists without double-counting a direct Meeting as related;
- Fund / Strategy aggregation/drill across GP-visible scope.

Non-GP mode shows:
- direct Meetings only;
- Related GP context from those Meetings;
- Pitchbooks only through explicit `Related_Pitchbook_IDs` from those direct Meetings;
- no ownership inferred from Related GP/name/date/Asset Class/Fund / Strategy.

## Fund / Strategy drill-down

For each exact nonblank value expose Meeting count, Pitchbook count, direct count, GP-related count where applicable, latest date, open follow-up count, explicit relationship count, bounded items, and omitted counts.

Use the same Entity Workspace read facade with an optional exact Fund / Strategy selector to return matching Meetings, Pitchbooks, relationships, and safe links. Do not add a separate drill-down facade.

## GP Workspace compatibility / public surface

Keep `getGpWorkspaceData(gpId)` usable, but do not preserve a divergent aggregation engine. It should delegate or adapt to the new shared Entity Workspace model.

Prefer exactly one new normal-user facade: `getEntityWorkspaceData(input)`.
Public baseline is 27; expected normal completion is 28.

## UI

Add `Entity Workspace` with Type -> Entity selector, summary, direct Meetings, GP direct/related split and owned Pitchbooks, non-GP Related GP/explicit linked materials, mixes, follow-ups, Fund / Strategy rows/drill, unified timeline, relationship context, safe links, accessible tables, bounded/empty states, and browser print.

Existing GP Workspace route must remain usable or redirect cleanly to GP-mode Entity Workspace.

## Target-runtime campaign

Use existing synthetic DEV data only.

1. deterministic validation first;
2. sync exact tested source once and exact readback;
3. create one immutable Apps Script version;
4. update the same private Web App in place; no new deployment;
5. open an existing GP entity and prove header/status, direct Meeting, GP-owned Pitchbook, direct/related split, Fund / Strategy row and exact drill;
6. open the existing synthetic LP/non-GP entity and prove direct Meeting, Related GP context, and explicitly linked Pitchbook;
7. confirm non-GP does not inherit unrelated GP-owned Pitchbooks merely through Related GP membership;
8. verify GP Workspace compatibility;
9. invoke browser print once and confirm no Drive artifact/data mutation;
10. final integrity: five sheets/schema 5; Meeting/Pitchbook/Masters/Settings/Audit/Script Properties/files unchanged; AI disabled; zero triggers; no Gemini/File Search; no permission/Library mutation.

If the existing synthetic rows do not contain a non-direct related-GP Meeting suitable for runtime proof, do not mutate authoritative data to manufacture one solely for qualification; deterministic regression can cover that branch while runtime still proves GP and non-GP workspaces end-to-end.

## Deterministic validation

Cover all entity types/Inactive selection, exact direct identity, GP direct-vs-related no-double-count, GP-owned Pitchbooks, non-GP explicit-linked-only semantics, no ownership inference, exact Fund / Strategy grouping/drill, caps/omitted counts/order, mixes/follow-ups/timeline, Relationship Explorer reuse, GP Workspace compatibility, safe links, no body/file-byte/Audit/AI access, print surface, public facade, `npm run check`, temporal validator, and `git diff --check`.

## Side-effect boundary

Application data: `DISABLED`.
Deployment/source delivery after deterministic PASS: `GUARDED`.

## Completion latch

```text
DEV QUALIFIED — WORK 0019 ENTITY WORKSPACE
LOGIC_VALIDATION: PASS
TARGET_RUNTIME_QUALIFICATION: PASS
APPLICATION_DATA_SIDE_EFFECT_STATE: DISABLED
DEPLOYMENT_SIDE_EFFECT_STATE: GUARDED
READY: YES
BLOCKER: NO
```

Keep PR Draft / Open / unmerged until ChatGPT final review.
