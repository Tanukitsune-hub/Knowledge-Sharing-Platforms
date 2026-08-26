# Work 0015 — GP workspace / one-page summary

WORK_ID: `0015`
DISPATCH_ID: `0015-CODEX-02`
MODE: `BUILD / QUALIFICATION`
BALL: `CODEX`
STATUS: `READY`

Repository: `Tanukitsune-hub/Knowledge-Sharing-Platforms`

Primary design:

`docs/planning/work0015-gp-workspace-one-page-summary.md`

Active execution instruction:

`docs/handoffs/0015-CODEX-02-finalize-readonly-qualification-and-delivery-instruction.md`

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

## Accepted CODEX-01 Evidence

Do not reopen:

- `LOGIC_VALIDATION: PASS — 203/203`;
- public facade: `24`;
- exact tested source synchronization and immutable Apps Script version `31`;
- existing verified private Web App updated in place;
- GP Workspace screen and selected synthetic GP data: PASS;
- relationship and follow-up display: PASS;
- bounded print-only DOM/CSS: PASS;
- print button reached the browser's normal native print surface: PASS.

The product design requires browser-native `window.print()` and permits Save as PDF; it does not require automation to save a PDF, operate a printer, or inspect the Windows print-dialog internals. The CODEX-01 handoff explicitly classified an unobservable native dialog as an automation limitation when invocation was observed.

Therefore the print/PDF brief acceptance item is closed:

`PRINT / PDF BRIEF: PASS — NATIVE PRINT SURFACE REACHED`

## Remaining Completion Evidence

1. preserve and validate the exact CODEX-01 local source/test tree;
2. complete one fresh read-only before/after integrity comparison without invoking print again;
3. prove application-data side effects remain disabled;
4. create reports;
5. commit, push, and update Draft PR #20.

## Fastest Safe Decisive Action

Resume the same local checkout, preserve the uncommitted GP Workspace changes, run the deterministic checks once, perform one read-only GP Workspace call with authoritative before/after snapshots, then deliver to GitHub.

Do not resync or redeploy Apps Script version `31`.

## Target Runtime, Test Data, and Side Effects

- `TARGET_RUNTIME`: the existing authenticated Apps Script Web App and supported browser.
- `ISOLATED_TEST_DATA`: accepted synthetic Work 0014 records.
- `SIDE_EFFECT_STATE`: application data writes disabled. Version `31` deployment evidence is already accepted; CODEX-02 authorizes no further deployment mutation.
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
- browser-native print-surface invocation is sufficient; no Drive report artifact or OS-dialog qualification is required;
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
- public facade count exactly `24`;
- final read-only integrity and complete GitHub delivery.

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
- production rollout;
- native print-dialog or physical/PDF-save qualification.

Follow-up:

- Work 0016 analytics/admin checks;
- Shared Drive production qualification;
- billing-enabled Gemini/File Search qualification;
- optional GitHub Actions CI.

## Authorization and Write Boundaries

Allowed:

- preserve and commit the existing scoped local source/tests/docs;
- exact deterministic validation;
- one read-only GP Workspace call with authoritative before/after readback;
- report/PR updates.

Prohibited:

- discarding expected uncommitted CODEX-01 work;
- another Apps Script sync/version/deployment update;
- new Web App deployment;
- Library deployment mutation;
- Backend/Audit row mutation;
- Drive source mutation or generated report artifact;
- Script Property changes;
- trigger changes;
- print dialog re-test;
- production data/users/billing/permissions;
- private IDs/URLs in GitHub/report.

## Execution Budget and Strategy Reset

- deterministic validation: one exact-tree run;
- target-runtime integrity: one before/after read-only comparison;
- print: no further invocation;
- deployment: zero mutations;
- reset if expected local changes are missing, an authoritative mutation is observed, or a second architecture is required.

## Required Validation

### Logic Validation

Run focused GP Workspace tests if available, then:

- `npm run check`;
- `git diff --check`.

Expected result: `203/203 PASS`, public facade `24`.

### Target-Runtime Qualification

Accepted screen/print evidence remains closed. Complete only final read-only integrity:

- capture authoritative before snapshot;
- invoke/load the GP Workspace once for the same synthetic GP;
- capture authoritative after snapshot;
- prove no Backend/Audit/Drive/Script Property/trigger/AI mutation;
- confirm deployment remains version `31`.

### Side-Effect Enablement

Application data side effects remain disabled. This Work does not authorize production rollout, Gemini billing/indexing, triggers, permission changes, or Drive report generation.

## Delivery

Branch:

`agent/0015-gp-workspace-one-page-summary`

Draft PR #20 remains Draft / Open / unmerged until ChatGPT final review.

Codex must create:

- `docs/handoffs/0015-CODEX-01-gp-workspace-implementation-report.md`;
- `docs/handoffs/0015-CODEX-02-finalize-readonly-qualification-and-delivery-report.md`;

and update canonical report/dispatch/PR status before return.

## Completion Latch

Work 0015 closes when:

- `LOGIC_VALIDATION: PASS`;
- `TARGET_RUNTIME_QUALIFICATION: PASS` for screen/read model, relationships/follow-up, native print-surface invocation, and read-only integrity;
- `SIDE_EFFECT_STATE: DISABLED` for application data and unauthorized external effects;
- `READY: YES`;
- no BLOCKER remains.

Once these pass, do not add native-dialog, PDF-file, dashboard, or analytics criteria to Work 0015.
