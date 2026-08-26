# Work 0015 — GP workspace / one-page summary

WORK_ID: `0015`
DISPATCH_ID: `0015-CODEX-01`
MODE: `BUILD`
BALL: `CODEX`
STATUS: `READY`

Repository: `Tanukitsune-hub/Knowledge-Sharing-Platforms`

Primary design:

`docs/planning/work0015-gp-workspace-one-page-summary.md`

Active execution instruction:

`docs/handoffs/0015-CODEX-01-gp-workspace-implementation-instruction.md`

## Primary Outcome

Add a read-only GP Workspace to the existing Web App that turns the accepted Work 0014 structured records into an immediately useful GP-centric screen plus a bounded A4 landscape one-page print/PDF brief.

The user must be able to select any GP and see:

- GP status and exact record-count snapshot;
- Fund / Strategy context;
- recent Meetings;
- recent Pitchbooks;
- open follow-up items;
- Meeting ↔ Pitchbook relationships resolved by stable IDs;
- browser-native print / Save as PDF brief.

## Acceptance Evidence and Hierarchy

1. authenticated target-runtime browser renders the workspace from the exact tested source;
2. an existing synthetic GP returns the expected authoritative structured data and exact counts;
3. accepted Meeting↔Pitchbook relationship and follow-up state render correctly;
4. print-only A4 brief is bounded and reaches the browser print surface without Drive artifacts;
5. Backend/Audit/Drive/Script Property readback proves the workspace is read-only;
6. deterministic aggregation/client/public-surface tests pass;
7. `npm run check` and `git diff --check` pass.

## Fastest Safe Decisive Action

Build one vertical slice only:

`GP selector -> getGpWorkspaceData(gpId) -> workspace render -> print-only brief -> authenticated browser readback`.

Do not build analytics, a GP profile database, AI summaries, or new persistence.

## Target Runtime, Test Data, and Side Effects

- `TARGET_RUNTIME`: the existing authenticated Apps Script Web App and supported browser.
- `ISOLATED_TEST_DATA`: reuse accepted synthetic Work 0014 records; avoid creating new records if possible.
- `SIDE_EFFECT_STATE`: application data writes disabled. After deterministic PASS, source sync + one immutable version + in-place update of the positively identified existing private Web App are allowed.
- `STAGING_DECISION`: Not required.

## Sources of Truth and Closed Conclusions

- Roadmap: `docs/planning/mvp-and-roadmap.md`.
- Design: `docs/planning/work0015-gp-workspace-one-page-summary.md`.
- Work 0014 structured-data contract: `docs/planning/work0014-structured-meeting-context.md`.
- Current target-runtime policy: `docs/decisions/target-runtime-first-development.md`.
- Deployment guardrails: `docs/operations/apps-script-web-app-deployment.md`.

Closed conclusions:

- Work 0014 structured fields and stable relationships are accepted;
- exactly five Backend sheets remain the architecture baseline;
- no GP profile master or Fund master is needed for Work 0015;
- Work 0015 is read-only presentation/aggregation;
- browser-native print / Save as PDF is sufficient; do not create Drive report artifacts;
- charts/time-series analytics belong to Work 0016.

## Required Scope

- one new `GP Workspace` navigation page;
- one normal-user read endpoint `getGpWorkspaceData(gpId)`;
- exact GP-level counts from full backend scans;
- bounded lists with honest omitted counts;
- stable-ID relationship resolution, including Inactive and unresolved links;
- compact follow-up view;
- dedicated print-only A4 landscape brief;
- safe error/link handling;
- public facade expected count increases by exactly one from the accepted Work 0014 baseline.

## Non-Goals and Follow-ups

Non-goals:

- persistent GP descriptive fields/notes;
- AI-generated summaries;
- Meeting body reads/summarization;
- charts/time-series/activity analytics;
- monthly admin workflow;
- follow-up workflow automation;
- schema migration/new Backend sheet/database;
- Drive-generated report artifacts;
- Gemini/File Search;
- production rollout.

Follow-up:

- Work 0016 analytics/admin checks;
- Shared Drive production qualification;
- billing-enabled Gemini/File Search qualification;
- optional GitHub Actions CI.

## Authorization and Write Boundaries

Allowed:

- scoped source/tests/docs on the Work 0015 branch;
- exact source sync after deterministic PASS;
- exactly one immutable Apps Script version;
- in-place update of the positively identified existing private Web App deployment.

Prohibited:

- new Web App deployment;
- Library deployment mutation;
- Backend/Audit row mutation for workspace qualification;
- Drive source mutation;
- Script Property changes;
- trigger changes;
- production data/users/billing/permissions;
- private IDs/URLs in GitHub/report.

## Execution Budget and Strategy Reset

- implementation hypotheses: one coherent design, no architecture reopening absent contradiction;
- deployment mutation: one version + one in-place Web App update maximum;
- browser qualification: one GP selection/render, one print-surface check, one integrity readback; repeat only if the first attempt is invalidated by a clear harness/session failure rather than an application result;
- reset if a second distinct application hypothesis is required, the read-only invariant is violated, or current target identity cannot be proven.

## Required Validation

### Logic Validation

- GP identity / Active-Inactive behavior;
- exact counts independent of UI caps;
- deterministic logical-date ordering;
- Fund / Strategy aggregation;
- recent list caps + omitted counts;
- follow-up filtering;
- stable relationship resolution, Inactive preservation, unresolved-ID visibility;
- legacy blanks;
- URL safety/redaction;
- print brief limits;
- public facade expected count +1;
- canonical full suite and diff hygiene.

### Target-Runtime Qualification

Using existing synthetic data:

- open updated existing `/exec`;
- open GP Workspace;
- select one synthetic GP with accepted Work 0014 Meeting/Pitchbook relationship/follow-up data;
- verify header, exact counts, lists, follow-up, relationship resolution, safe links;
- verify print brief and browser print surface;
- perform authoritative readback proving no Backend/Audit/Drive/Script Property/trigger mutation.

### Side-Effect Enablement

Application data side effects remain disabled. This Work does not authorize production rollout, Gemini billing/indexing, triggers, or permission changes.

## Delivery

Branch:

`agent/0015-gp-workspace-one-page-summary`

Draft PR: create before Codex execution and keep Draft / Open / unmerged until ChatGPT final review.

Codex must create:

`docs/handoffs/0015-CODEX-01-gp-workspace-implementation-report.md`

and update canonical status/dispatch/PR body before return.

## Completion Latch

Work 0015 closes when:

- `LOGIC_VALIDATION: PASS`;
- `TARGET_RUNTIME_QUALIFICATION: PASS`;
- `SIDE_EFFECT_STATE: DISABLED` for application data and unauthorized external effects;
- `READY: YES`;
- no BLOCKER remains.

Once these pass, do not add new dashboard/analytics criteria to Work 0015.