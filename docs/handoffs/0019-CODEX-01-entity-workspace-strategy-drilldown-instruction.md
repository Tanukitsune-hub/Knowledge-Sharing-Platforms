# Work 0019 — CODEX-01 Entity Workspace + Fund / Strategy drill-down

WORK_ID: `0019`
DISPATCH_ID: `0019-CODEX-01`
BALL: `CODEX`
STATUS: `READY`

Repository: `Tanukitsune-hub/Knowledge-Sharing-Platforms`

Branch: `agent/0019-entity-workspace-strategy-drilldown`

Draft PR: `TO_BE_ASSIGNED`

Exact ref: `TO_BE_UPDATED_AFTER_PR_SETUP`

Mode: `BUILD / QUALIFICATION`
Route: `C`
Recommended model: `Luna Max`.

## Read first

Read all applicable `AGENTS.md` / `AGENTS.override.md`, then:

1. `docs/handoffs/0019-instruction.md`;
2. `docs/planning/work0019-entity-workspace-strategy-drilldown.md`;
3. accepted Work 0015 / 0016 / 0022 / 0017 / 0018 reports;
4. `src/125_GpWorkspaceService.gs`, `src/128_RelationshipExplorerService.gs`, navigation/UI/public-surface source and tests.

Architecture is settled. Do not redesign entity identity, relationship persistence, temporal handling, or the five-sheet Backend.

## Primary outcome

Build and qualify one read-only Entity Workspace for all Counterparty Types plus exact Fund / Strategy drill-down, while converging GP Workspace onto the same internal read model.

Do not split this Work into schema/server/UI/runtime sub-Works.

## Required implementation

### 1. Shared Entity Workspace server model

Read only:

- `Meeting_Index`;
- `Pitchbook_Index`;
- `GP_Master`;
- `Option_Master`.

No Meeting body, Pitchbook bytes, Audit read/write, AI/store access, or external data.

Entity identity must be exact `TYPE:ID` using Work 0016 semantics. All accepted entity types and Inactive entities remain selectable.

### 2. Entity-specific semantics

All entities:
- exact direct Meeting metrics/lists;
- latest direct activity;
- Team / Asset Class / Meeting Type mixes;
- informational follow-ups;
- Relationship Explorer context;
- unified timeline;
- bounded omitted counts;
- print read model.

GP mode:
- GP-owned Pitchbooks by exact `GP_ID`;
- direct GP Meetings;
- related non-direct Meetings where GP is in `Related_GP_IDs`;
- no direct/related double-counting;
- explicit relationships;
- Fund / Strategy aggregation/drill.

Non-GP mode:
- direct Meetings only;
- Related GP context from those Meetings;
- Pitchbooks only via explicit `Related_Pitchbook_IDs` from those direct Meetings;
- never infer Pitchbook ownership from Related GP/name/date/Asset Class/Fund / Strategy.

### 3. Fund / Strategy

Group by exact trimmed text. Sorting may be case-insensitive; identity/matching remains exact and case-sensitive.

For each nonblank value return exact counts for Meetings/Pitchbooks/direct/GP-related activity, latest date, open follow-ups, relationship count, bounded items and omitted counts.

Allow optional exact Fund / Strategy selection through the same Entity Workspace read facade and return matching Meetings/Pitchbooks/relationships/safe links.

Do not add a second public drill-down facade.

### 4. GP Workspace compatibility

Keep existing `getGpWorkspaceData(gpId)` compatible. Refactor/delegate so GP Workspace and Entity Workspace do not maintain divergent aggregation logic.

### 5. Public facade

Prefer exactly one new public read facade: `getEntityWorkspaceData(input)` or equivalent.

Baseline public facade = 27. Expected normal completion = 28.

Reads must not Audit.

### 6. UI

Add `Entity Workspace` to navigation with:

- Type -> Entity selector;
- entity header/status;
- summary cards;
- direct Meetings;
- GP direct/related split and GP-owned Pitchbooks;
- non-GP Related GP context and explicitly linked Pitchbooks;
- mixes;
- follow-ups;
- Fund / Strategy table + exact drill panel;
- unified timeline;
- relationship context;
- safe links;
- `window.print()` control and bounded A4 print CSS;
- accessible tables / keyboard controls / empty/truncated states.

Existing GP Workspace must remain usable or redirect cleanly to GP-mode Entity Workspace.

## Deterministic validation

Add focused tests for:

- all entity types and Inactive entity selection;
- exact direct Meeting identity;
- GP direct-vs-related split with no double count;
- GP-owned Pitchbooks;
- non-GP explicitly linked Pitchbooks only;
- no ownership inference;
- exact Fund / Strategy grouping and drill;
- counts before caps / omitted counts / deterministic ordering;
- mixes/follow-ups/timeline;
- Relationship Explorer reuse;
- GP Workspace compatibility;
- safe links;
- no body/file-byte/Audit/AI reads/writes;
- print markup;
- public facade.

Then run focused suites, `npm run check`, temporal validator, public-surface validation, `git diff --check`, and final scoped diff review.

Do not sync Apps Script before deterministic PASS.

## Target-runtime qualification

Use existing synthetic DEV records only.

After positively identifying the existing Apps Script project/private Web App:

1. sync exact tested source once;
2. exact source readback;
3. create exactly one immutable version;
4. update the same private Web App in place; no new deployment or Library mutation;
5. open existing synthetic GP entity;
6. prove GP header/status, direct Meeting, GP-owned Pitchbook, direct/related split, one Fund / Strategy row and exact drill;
7. open existing synthetic LP/non-GP entity;
8. prove direct Meeting, Related GP context, and explicitly linked Pitchbook;
9. prove non-GP does not inherit unrelated GP-owned Pitchbooks through Related GP membership;
10. verify old GP Workspace compatibility/redirect;
11. invoke browser print once; no Drive artifact;
12. final read-only integrity: five sheets/schema 5; rows/files/Masters/Settings/Audit/Script Properties unchanged; AI disabled; zero triggers; no Gemini/File Search; no permission/Library mutation.

If no existing runtime row can prove a non-direct GP-related Meeting, do not mutate data solely to manufacture it. Deterministic regression may prove that branch, but record it clearly while still proving GP and non-GP workspaces end-to-end.

## Non-goals / prohibitions

Do not add schema/sheets/database, Fund / Strategy Master/aliases, fuzzy merge, mutation APIs, Drive print artifacts, AI commentary, multi-entity comparison, Work 0020/0021 features, Gemini/File Search calls, triggers, production data, production rollout, or a second Web App deployment.

## Delivery

Create `docs/handoffs/0019-CODEX-01-entity-workspace-strategy-drilldown-report.md`.

Update `docs/handoffs/0019-report.md`, `0019-instruction.md`, `0019-dispatches.md`, and Draft PR body.

Commit/push all scoped changes and keep PR Draft / Open / unmerged for ChatGPT final review.

Return Work/Dispatch IDs, LOGIC_VALIDATION, TARGET_RUNTIME_QUALIFICATION, application/deployment side-effect states, GP result, non-GP result, Fund / Strategy drill result, GP compatibility, public facade count, Apps Script version, final integrity, report path, final commit, branch/PR, BLOCKER YES/NO.

On full PASS classify:

```text
DEV QUALIFIED — WORK 0019 ENTITY WORKSPACE
LOGIC_VALIDATION: PASS
TARGET_RUNTIME_QUALIFICATION: PASS
APPLICATION_DATA_SIDE_EFFECT_STATE: DISABLED
DEPLOYMENT_SIDE_EFFECT_STATE: GUARDED
READY: YES
BLOCKER: NO
```
