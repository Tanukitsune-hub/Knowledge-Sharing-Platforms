# CODEX-02 — user-facing Counterparty wording convergence

WORK_ID: 0031
DISPATCH_ID: 0031-CODEX-02
BALL: CODEX
STATUS: READY
MODE: BUILD

Continue Work 0031 on the existing PR #53 / branch `codex/0031-counterparty-master-transition`.

Read latest main:
- `docs/handoffs/0031-CODEX-01-controller-review.md`
- `docs/handoffs/0031-dispatches.md`
- `docs/decisions/counterparty-master-unification.md`
- `docs/planning/work0031-counterparty-master-transition.md`

CODEX-01 functional/schema/runtime evidence is accepted and CLOSED unless this wording-only change contradicts it.

## Goal

Make the user-facing terminology exactly match the accepted Counterparty-centered product concept before PR #53 merge.

Required change:
- user-facing `Counterparty Master` heading -> `面談先マスター`

Then inspect the normal rendered UI/source and confirm there is no user-facing:
- `GP Master`
- `GP Workspace`
- `GPサマリー`
- `関連GP`

`GP / 運用会社` is allowed only as a Counterparty Type value/label.

Do not rename technical identifiers such as `Counterparty_Master`, `Counterparty_ID`, migration fields, legacy compatibility code, filenames, or historical reports merely for wording.

## Scope

Minimal UI wording only. No schema, migration, data model, filter logic, master behavior, search behavior, or security changes.

If the audit finds another normal-user GP-primary label, fix only that label in the same pass.

## Validation

After source change:
- focused UI tests as needed
- `npm run check`
- `npm run check:bundle`
- `git diff --check`
- canonical bundle regeneration

Sync to the same existing target once, create at most one new immutable version, and update the same single owner-only deployment once.

Actual owner-only browser smoke:
1. Master page heading visibly reads `面談先マスター`.
2. Meeting create still shows a single `面談先` selector.
3. 面談先サマリー remains available.
4. normal rendered UI contains no `GP Master`, `GP Workspace`, `GPサマリー`, or `関連GP`.
5. GP remains visible only as `GP / 運用会社` type where appropriate.
6. console material error/warn 0.

Preserve:
- schema8
- exactly5 Backend sheets
- existing Counterparty migration state
- version6 accepted data/runtime evidence
- provider0 / AI disabled
- confidential0 / physical delete0
- Work0030 deferred

Do not rerun migration unless the deployment/setup path strictly requires read-only verification; no data rewrite is needed for this wording pass.

Report:
`docs/handoffs/0031-CODEX-02-user-facing-wording-convergence-report.md`

Update PR #53 body, keep Draft, do not merge.

Successful final response:

WORK_ID: 0031
DISPATCH_ID: 0031-CODEX-02
BALL: CHATGPT
STATUS: RETURNED