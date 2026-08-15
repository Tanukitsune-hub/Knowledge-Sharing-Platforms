# Work 0004 — Apps Script scaffold and idempotent core setup

WORK_ID: `0004`

Repository: `Tanukitsune-hub/Knowledge-Sharing-Platforms`

Route: ChatGPT-owned implementation with Codex/local-runtime verification for residual executable work.

Recommended Codex model: `Luna Max` — the product and setup design are already decided; the residual work is bounded Apps Script implementation, local tests, and routine verification.

Starting ref: `0ce7d5d551b7175f673718ee6861bf44287d8d06`

Target branch: `agent/0004-apps-script-core-setup`

Before starting, read every applicable `AGENTS.md`, identify the repository-specific subagent-use policy, and follow it. Use subagents actively and proportionately for independent implementation review, test review, and contract cross-checking; subagent use is required, not optional.

## Outcome

Create the first executable repository baseline for the Apps Script application. The repository must contain an Apps Script-compatible source scaffold, an idempotent setup/repair path, explicit schema and seed contracts, and local tests that validate the setup logic without connecting to a live Google environment.

A future administrator must be able to configure Script Properties and call:

- `setupKnowledgePlatform()`
- `validateInstallation()`
- `getInstallationStatus()`

The functions may remain unqualified against live Google Workspace until the final live-qualification Work, but their contracts and pure logic must be implemented and locally testable now.

## Already-Decided Design Choices

- Runtime: Apps Script V8-compatible plain JavaScript.
- Normal deployment/setup must not require Node.js, clasp, TypeScript, a bundler, or an external server.
- Developer/Codex tooling may use Node.js and clasp optionally.
- Shared Drive is authoritative; source root contains only `Meeting Records` and `Pitchbooks`.
- Backend Spreadsheet has baseline sheets `GP_Master`, `Option_Master`, `Meeting_Index`, `Pitchbook_Index`, and `Settings`.
- Audit logs use a separate Restricted admin-only Spreadsheet.
- Setup is idempotent and is also the repair/migration path.
- Stored resource IDs take precedence; exact-name discovery is used only when IDs are absent.
- Multiple exact-name candidates are an explicit failure, not a silent selection.
- Schema changes use forward migration via `SCHEMA_VERSION`; setup does not destructively recreate existing resources.
- Master seed records use stable IDs and are upserted.
- Trigger creation is deduplicated by handler/type.
- DEV and PROD are separate Apps Script projects and resource sets.
- Live Apps Script, Drive, Sheets, OAuth, deployment, and Gemini validation are deferred until final live qualification except for a truly blocking contract ambiguity.

## Source of Truth

- `AGENTS.md`
- `docs/planning/apps-script-implementation-plan.md`
- `docs/architecture/target-architecture.md`
- `docs/operations/runtime-policy.md`
- `docs/governance/security.md`
- `docs/decisions/apps-script-first-implementation.md`
- `docs/decisions/audit-access-and-user-attribution.md`
- `docs/decisions/pitchbook-upload-limits.md`

## Required Scope

1. Add an Apps Script source directory containing:
   - manifest;
   - public setup/status entry points;
   - configuration parsing and validation;
   - schema/version contracts;
   - stable Master seed definitions;
   - resource discovery/create/reuse orchestration;
   - trigger registry/deduplication logic;
   - structured setup and validation reports;
   - thin Apps Script service adapters so pure logic can be tested without live services.
2. Implement setup behavior for the accepted resource topology:
   - `Private Assets Knowledge / Meeting Records / Pitchbooks`;
   - separate Backend Spreadsheet;
   - separate Audit Spreadsheet;
   - five baseline backend sheets;
   - Settings/resource references;
   - Master seeds;
   - installable-trigger registry.
3. Add lightweight local executable validation using Node’s standard test runner or an equally small existing-free approach.
4. Test at least:
   - bootstrap config parsing/validation;
   - schema definitions and forward-migration planning;
   - stable seed upsert behavior;
   - trigger deduplication;
   - filename/name normalization needed by setup;
   - first-run create plan versus second-run reuse plan;
   - duplicate exact-name candidate failure;
   - structured report shape.
5. Add concise developer/setup documentation for the scaffold and local tests.
6. Update repository guidance only where exact source/test commands become known.

## Non-Goals

- Live creation of Google folders, Spreadsheets, triggers, or deployments in a real account.
- Meeting, Pitchbook, past-record, Master-management, or Knowledge Search UI implementation.
- Gemini API/File Search integration.
- Production credentials or organization-specific IDs.
- Audit Viewer or password-based application authentication.
- Destructive reset/teardown.
- 100MB-per-file transport or any Cloud fallback runtime.
- Reconsideration of accepted product architecture.

## Acceptance Criteria

- Apps Script source is syntactically valid for V8 and has no production dependency on Node.js or a bundler.
- Public setup/status functions exist with stable documented return contracts.
- A valid bootstrap config can produce a deterministic installation plan.
- Re-running setup against an already-satisfied fake environment produces reuse/skip actions and no duplicates.
- Multiple exact-name matches produce an explicit error.
- Schema/seed/trigger logic is centralized rather than duplicated.
- Backend and Audit resources are represented as separate resources.
- All local tests pass.
- No live Google environment is contacted by the test suite.
- No secrets, real records, private URLs, or organization-specific IDs are committed.

## Required Validation Evidence

- Exact local commands executed.
- Test counts and observed results.
- Static/syntax validation results for Apps Script files.
- A concise example of first-run and second-run structured setup reports generated with fakes.
- Diff review confirming no live credentials/data and no out-of-scope feature work.

## Write Boundaries

Expected write scope:

- Apps Script source/manifest paths introduced by this Work.
- local test/tooling files introduced by this Work.
- concise implementation/setup documentation.
- `docs/handoffs/0004-report.md`.
- minimal updates to `AGENTS.md` or documentation indexes only when needed to record exact executable paths/commands.

Do not alter accepted product behavior outside Work 0004.

## Delivery

- Work only on `agent/0004-apps-script-core-setup`.
- Keep commits scoped and intentional.
- Open or update a Draft PR against `main`.
- Create `docs/handoffs/0004-report.md` and commit/push it with the implementation.
- Link both instruction and report in the PR description.
- Do not merge or deploy.

## Escalation Conditions

Escalate only if:

- accepted setup/resource contracts are materially contradictory;
- an Apps Script platform contract makes the accepted setup design infeasible based on authoritative evidence;
- safe idempotency cannot be achieved without materially changing persistent resource contracts;
- implementation would require secrets, live confidential data, or destructive operations;
- scope would need to expand into Work 0005 or later.

Do not escalate merely because live Google validation is deferred, hosted CI is unavailable, or optional polish remains.

## Completion Report

Report:

- completed outcome;
- material files/components changed;
- validation actually executed and observed;
- branch, commit, and Draft PR;
- blockers and non-blocking residual issues;
- material limitations on confidence caused by deferred live qualification.
