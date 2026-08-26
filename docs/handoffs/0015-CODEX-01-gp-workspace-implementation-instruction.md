# Work 0015 — CODEX-01 GP workspace implementation

WORK_ID: `0015`
DISPATCH_ID: `0015-CODEX-01`
MODE: `BUILD`
BALL: `CODEX`
STATUS: `READY`

Repository: `Tanukitsune-hub/Knowledge-Sharing-Platforms`

Route: `C — bounded production-source UI/service implementation plus authenticated target-runtime qualification`.

Recommended model: `Luna Max` — the product/data design is fixed and the remaining work is scoped implementation, testing, deployment update, and browser verification.

## Primary Outcome

Implement the Work 0015 read-only GP Workspace and prove one useful GP-centric end-to-end slice in the existing authenticated Apps Script Web App.

An authorized user must be able to select a GP and see a compact summary, Fund / Strategy context, recent Meetings/Pitchbooks, open follow-ups, resolved Meeting↔Pitchbook relationships, and a bounded A4 landscape print/PDF brief.

## Acceptance Evidence and Hierarchy

Strongest first:

1. actual authenticated Web App/browser shows the GP Workspace from the exact tested source;
2. one existing synthetic GP returns correct authoritative counts and Work 0014 structured context;
3. accepted Meeting↔Pitchbook relationship and follow-up state render correctly;
4. dedicated print-only brief reaches the normal browser print surface and remains bounded without creating Drive artifacts;
5. authoritative before/after readback proves no Backend/Audit/Drive/Script Property/trigger mutation from workspace use;
6. deterministic production-service/client/public-surface regressions pass;
7. `npm run check` and `git diff --check` pass.

Browser/native evidence outranks mocks for render, print, actual Apps Script object shapes, and side-effect absence.

## Fastest Safe Decisive Action

Implement only this vertical slice:

`GP selector -> getGpWorkspaceData(gpId) -> workspace render -> print-only brief -> read-only target-runtime verification`.

Do not add dashboard analytics, persistence, AI summary, or export artifacts.

## Target Runtime, Test Data, and Side Effects

- `TARGET_RUNTIME`: existing private Apps Script Web App, same supported authenticated browser/account context accepted in Work 0014.
- `ISOLATED_TEST_DATA`: reuse the existing accepted synthetic Work 0014 GP/Meeting/Pitchbook/follow-up/relationship records where possible.
- `SIDE_EFFECT_STATE`: application data writes `DISABLED`; source synchronization/version/deployment update only after deterministic PASS.
- `STAGING_DECISION`: Not required.

Before any Apps Script mutation, prove the exact project and existing Web App entrypoint per `docs/operations/apps-script-web-app-deployment.md`.

## Sources of Truth and Closed Conclusions

Read first:

- all applicable `AGENTS.md` / `AGENTS.override.md`;
- `docs/planning/work0015-gp-workspace-one-page-summary.md`;
- `docs/handoffs/0015-instruction.md`;
- `docs/decisions/target-runtime-first-development.md`;
- `docs/operations/apps-script-web-app-deployment.md`;
- relevant Work 0014 source/data contracts.

Closed design conclusions:

- five Backend sheets only;
- no GP profile master/new persistent fields;
- one new read-only normal-user endpoint is authorized: `getGpWorkspaceData`;
- public facade expected count increases from 23 to 24;
- no Meeting body reads;
- no Pitchbook content reads;
- no Audit writes for workspace views;
- browser `window.print()` / Save as PDF is the report path;
- Work 0016 owns charts/time-series/admin checks.

Do not reopen these without material contradictory evidence.

## Required Scope

### 1. Server read model

Add production private business logic for GP Workspace and expose exactly one new normal-user facade:

`getGpWorkspaceData(gpId)`

Prefer a dedicated private GP Workspace service/module, reusing existing Backend/Master/read helpers rather than duplicating storage access.

The endpoint must:

- require a stable GP ID and find exactly one GP Master row;
- allow both Active and Inactive GPs;
- scan all Meeting/Pitchbook rows for exact counts;
- ignore blank Fund / Strategy values rather than infer them;
- use existing logical-date normalization and display maps;
- sort deterministic newest-first with stable-ID tie break;
- cap response lists while returning honest omitted counts;
- resolve Meeting `Related_Pitchbook_IDs` against all Pitchbook rows, including Inactive targets;
- preserve unresolved IDs visibly rather than dropping them;
- return safe source links only through existing conventions;
- return full follow-up note only for authorized display in this response; do not Audit or persist it elsewhere;
- perform no write/audit/AI/Drive-content operations.

Display caps fixed by design:

- recent Meetings: 20;
- recent Pitchbooks: 20;
- follow-ups: 20;
- relationship Meeting rows: 20.

Fund / Strategy aggregation may return up to 20 sorted values plus omitted count.

Snapshot counts must use the full GP record sets, not the capped arrays.

### 2. Response semantics

Return a stable safe object containing at least:

- `gp` — ID, name, status;
- `summary` — Meeting total/Active, Pitchbook total/Active, Active follow-up count, last Meeting logical date;
- `fundStrategies` — text, Meeting count, Pitchbook count, latest logical date;
- `recentMeetings`;
- `recentPitchbooks`;
- `followUps`;
- `relationships`;
- `omittedCounts`.

Exact naming may follow repository conventions; preserve these semantics.

### 3. Normal Web App UI

Add `GP Workspace` to the existing same-document navigation.

Page requirements:

- no GP selected by default;
- GP selector includes Active and Inactive GP Master values;
- selecting a GP loads the read model once and renders the workspace;
- changing GP replaces the view cleanly;
- loading/error/empty states are clear;
- Inactive GP is visibly labeled;
- optional blank fields render as `—` or are omitted cleanly;
- links use the existing safe URL pattern and open in a new tab with `noopener`;
- no new client-side persistence is needed.

Render sections fixed in `docs/planning/work0015-gp-workspace-one-page-summary.md`.

### 4. Print/PDF brief

Create a dedicated print-only container derived from the same loaded response.

Print limits:

- Fund / Strategy: 8;
- Meetings: 5;
- Pitchbooks: 5;
- follow-ups: 5;
- relationship rows: 5.

Show `+N more` when truncated.

Add print CSS for A4 landscape, hide navigation/non-GP content/controls, compact long text, and avoid unbounded row heights. The print button calls `window.print()`.

Do not create Google Docs/PDF files in Drive.

### 5. Public surface and safe errors

- add `getGpWorkspaceData` to the public allowlist;
- expected public facade: exactly `24`;
- no other new browser-callable top-level functions;
- add safe user-facing missing/unknown GP errors as needed;
- private helpers keep trailing `_` convention.

### 6. Read-only invariant

Workspace service and client use must not mutate:

- Backend;
- Audit;
- Drive source folders/files;
- Script Properties;
- triggers;
- Gemini/File Search.

No workspace-view Audit event is required in this Work.

## Suggested implementation boundaries

Use repository conventions; the following is a preferred shape, not a requirement if an equally small existing pattern is better:

- one private server module such as `src/160_GpWorkspaceService.gs`;
- one page include such as `src/GpWorkspacePage.html`;
- one client include such as `src/ClientGpWorkspace.html`;
- small additions to `src/90_WebApp.gs`, `src/Index.html`, `src/Styles.html`, `src/ClientBootstrap.html` / existing bootstrap hook;
- focused tests for server aggregation, client contract/markup, public surface, and read-only behavior.

Do not refactor unrelated navigation, maintenance, search, export, or AI code.

## Deterministic validation

Add focused tests before the full suite.

Required regression coverage:

1. GP ID selects exactly one Active or Inactive GP; missing/unknown GP fails safely;
2. exact snapshot counts come from full record sets even when display arrays are capped;
3. latest logical dates and deterministic ordering use configured timezone-safe date paths;
4. Fund / Strategy aggregates Meeting/Pitchbook counts and latest date; blanks ignored;
5. follow-ups include only Active Meeting rows with `Follow_Up_Required=true`;
6. relationship resolver preserves Inactive targets and shows unresolved Document IDs;
7. legacy blank structured fields map without failure;
8. list caps/omitted counts are correct;
9. response does not include Meeting body or Pitchbook content bytes;
10. server read model does not call audit/write/rename/create/AI adapters;
11. client markup contains GP Workspace page, selector, print-only brief, and print action;
12. print brief uses fixed display limits and `+N more` behavior;
13. safe Drive/Docs link handling is preserved;
14. public facade is exactly `24`, with no new privileged public function.

Then run:

`npm run check`

`git diff --check`

If any relevant deterministic gate fails, repair only within this design. Reset if a material second architecture is required.

## Target-Runtime Qualification

Only after deterministic PASS:

1. prove exact Apps Script project and positively identified existing `WEB_APP` + `/exec`;
2. synchronize the exact tested source once;
3. disposable readback must match the tested source;
4. create exactly one new immutable version;
5. update the existing verified Web App deployment in place;
6. preserve execute-as deploying user and access `Only myself`;
7. do not create a second Web App deployment or touch Library deployments.

Use the updated existing `/exec`.

### Native browser smoke

Use one existing synthetic GP that already has Work 0014 structured data. Do not create/edit/save source records for this smoke.

Verify once:

- GP Workspace nav/page renders;
- GP selector includes the expected GP and can select it;
- GP header/status renders;
- snapshot counts match authoritative Backend readback;
- Fund / Strategy appears when present;
- recent Meeting/Pitchbook rows render;
- accepted follow-up item renders when present;
- accepted Meeting↔Pitchbook relationship resolves to the expected stable ID and filename/status;
- no unresolved relationship is silently hidden if one exists in test fixtures;
- safe Doc/File links are present when source links exist;
- print brief contains the expected bounded sections;
- print button reaches the browser's normal print surface; cancel/close without saving a file if needed.

### Final read-only integrity

Compare before/after authoritative state and prove workspace use caused no change to:

- Meeting/Pitchbook row counts or contents;
- GP/Option Masters;
- Audit row count/content;
- Drive source file count/names;
- Settings/counters/AI/store fields;
- Script Properties;
- triggers.

Deployment version/readback is the only authorized external mutation.

If browser/print automation cannot observe the native print dialog but the button invocation is directly observed and no application defect is indicated, classify the unobservable print-dialog internals separately rather than treating a harness limitation as a product failure. The print-only DOM/CSS and browser invocation still require evidence.

## Non-Goals

Do not implement:

- GP profile fields/notes;
- AI-generated summary;
- Meeting body reads;
- charts/time-series analytics;
- monthly admin checks;
- follow-up workflow;
- new schema/backend sheet/database;
- Drive-generated report artifact;
- legacy converter;
- Shared Drive production qualification;
- Gemini billing/live qualification;
- production rollout.

## Execution Budget and Stop Rules

- one implementation architecture;
- one deterministic repair loop per concrete failure class;
- one Apps Script source sync;
- one immutable version;
- one in-place Web App update;
- one target GP browser smoke;
- no source-data writes during target-runtime qualification.

Stop and return to ChatGPT if:

- target project/deployment identity is ambiguous;
- a data mutation is required to make the workspace work;
- the five-sheet/no-new-persistence contract becomes infeasible;
- a second architecture is needed;
- target-runtime evidence shows a material application defect outside this bounded design.

## Delivery

Branch:

`agent/0015-gp-workspace-one-page-summary`

PR: keep Draft / Open / unmerged.

Create/update:

- `docs/handoffs/0015-CODEX-01-gp-workspace-implementation-report.md`;
- `docs/handoffs/0015-report.md`;
- `docs/handoffs/0015-instruction.md`;
- `docs/handoffs/0015-dispatches.md`;
- PR body.

Commit and push all scoped source/test/docs changes.

Do not commit runtime IDs, private URLs, account data, OAuth material, Script Property values, or organization-specific folder IDs.

## Completion Latch

Return `READY: YES` only if:

- `LOGIC_VALIDATION: PASS`;
- `TARGET_RUNTIME_QUALIFICATION: PASS` for the GP Workspace screen/read model and bounded print surface;
- `SIDE_EFFECT_STATE: DISABLED` for application data and unauthorized effects;
- `BLOCKER: NO`.

On return:

WORK_ID: `0015`
DISPATCH_ID: `0015-CODEX-01`
BALL: `CHATGPT`
STATUS: `RETURNED`

Keep PR Draft / Open / unmerged for ChatGPT final review.