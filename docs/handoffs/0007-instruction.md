# Work 0007 — Maintenance, concurrency, Masters, and Phase 1 code completion

WORK_ID: `0007`

Repository: `Tanukitsune-hub/Knowledge-Sharing-Platforms`

Route: ChatGPT-owned implementation with local/Codex executable verification for residual implementation work.

Recommended Codex model: `Luna Max` — the product contracts, storage model, UI scope, logical-deletion policy, concurrency model, and validation policy are already decided; the residual task is bounded Apps Script implementation and local verification.

Starting ref: `b5969ea85f9bacb3b57ff30828b1487a7ddb1a9f`

Target branch: `agent/0007-maintenance-masters-phase1`

Before starting, read every applicable `AGENTS.md`, identify the repository-specific subagent-use policy, and follow it. Use subagents actively and proportionately for independent record-maintenance review, optimistic-locking review, Master/audit review, UI contract review, and test review; subagent use is required, not optional.

## Outcome

Complete the non-AI accumulation platform in code. The Apps Script Web App must support Meeting and Pitchbook past-record search, detail retrieval, metadata/content correction, logical inactivation/reactivation, GP/Option Master administration, optimistic concurrency protection, and metadata-only audit logging.

The implementation must remain code-complete and locally validated without deploying to a live Apps Script or Google Workspace environment. Live qualification remains deferred to the final qualification Work.

## Already-Decided Design Choices

- Extend the merged Work 0004–0006 implementation; do not replace its setup, Meeting, Pitchbook, or retry contracts.
- Runtime remains Apps Script V8-compatible plain JavaScript under `src/`.
- Past-record filters are optional Date From/To, GP, Asset Class, Equity/Debt, and Status.
- UI-only `未選択` means no filter and is never persisted.
- Meeting updates retain the same Meeting ID and Google Doc, update the Doc content and deterministic filename, and increment `Version`.
- Same-Meeting stale saves are rejected using expected `Version` / current `Version` optimistic locking.
- Pitchbook updates retain Document ID and Drive File ID. When metadata moves to a different filename context, allocate the next sequence in the destination context; never renumber the old context or close historical gaps.
- Pitchbook stale saves are rejected using the current `Updated_At` token because the accepted Pitchbook schema has no Version column.
- Normal record deletion is logical: `Active / Inactive / Reactivate`; no user-facing physical deletion.
- Inactivation/reactivation marks AI work for later synchronization without requiring Gemini to exist now.
- GP Master uses immutable IDs, mutable names, Active/Inactive, normalized duplicate checks, and alphabetical display; GP has no manual sort order.
- Option Master supports `LOCATION / ASSET_CLASS / CAPITAL_TYPE`, immutable IDs, mutable names, Sort Order, Active/Inactive, normalized duplicate checks, and reordering.
- All authorized Web App users may perform allowed Master changes. Rename/inactivate actions require explicit confirmation in the UI.
- All record and Master changes write metadata-only events to the separate Restricted Audit Spreadsheet.
- Actor attribution remains best-effort and never blocks a normal operation.
- Locks cover only short consistency-critical sections; no long lock across Docs/Drive work.
- Meeting/Pitchbook source bodies and binary contents are never copied into Index or Audit.
- Live Apps Script/Drive/Sheets/Docs/OAuth/deployment validation remains deferred.

## Source of Truth

- `AGENTS.md`
- `src/AGENTS.md`
- `tests/AGENTS.md`
- `docs/product/vision.md`
- `docs/architecture/target-architecture.md`
- `docs/planning/apps-script-implementation-plan.md`
- `docs/operations/runtime-policy.md`
- `docs/decisions/audit-access-and-user-attribution.md`
- Work 0004–0006 implementation and completion reports

## Required Scope

1. Extend the Web App navigation so Meeting and Pitchbook each expose `新規登録` and `過去記録 / 過去資料`, and add a `マスター管理` page.
2. Add server-side search APIs for Meeting and Pitchbook with the accepted optional filters, deterministic sorting, bounded result counts, and user-safe response models.
3. Add Meeting detail retrieval including authoritative Google Doc text.
4. Add Meeting update with:
   - server validation against Master records;
   - expected Version check;
   - same Meeting ID / same Doc File ID;
   - Doc content replacement and filename synchronization;
   - Version increment, Updated At/By, and AI Pending state;
   - metadata-only audit before/after records.
5. Add Meeting Active/Inactive/Reactivate transitions with expected Version and audit.
6. Add Pitchbook metadata update with:
   - expected Updated At check;
   - same Document ID / File ID;
   - destination-context sequence allocation when context changes;
   - deterministic Drive filename synchronization;
   - Updated At/By and AI Pending state;
   - metadata-only audit before/after records.
7. Add Pitchbook Active/Inactive/Reactivate transitions with expected Updated At and audit.
8. Add GP Master operations: list, add, rename, inactivate, reactivate.
9. Add Option Master operations: list by type, add, rename, reorder, inactivate, reactivate.
10. Use normalized duplicate checks and stable ID allocation under short locks. Do not overwrite immutable IDs.
11. Add a small Phase 1 diagnostics endpoint/model covering resource separation, schema presence, Actor fallback result, and current implementation capabilities without performing destructive or live external checks.
12. Extend client-side UI for search/result tables, detail/edit dialogs or panels, stale-save messaging, logical status actions, Master confirmation flows, and refresh after mutation.
13. Add local tests with fake adapters covering search filtering, Meeting stale-save rejection, Meeting update/status changes, Pitchbook destination-sequence movement, Pitchbook stale-save rejection, Master duplicate handling/IDs/reordering/status, audit redaction, and Phase 1 diagnostics.
14. Add concise implementation documentation and `docs/handoffs/0007-report.md`.

## Non-Goals

- Gemini API/File Search, AI worker execution, Knowledge Search, or citation rendering.
- Physical deletion or destructive reset.
- File replacement for an Active Pitchbook.
- Per-user source ACLs, custom authentication, or a Web App Audit Viewer.
- Live Apps Script/Shared Drive/Spreadsheet/Docs/browser qualification.
- Production deployment or credentials.
- Major visual redesign or optional dashboard/reporting features.
- Changing the accepted five-sheet backend or separate Audit Spreadsheet contracts.

## Acceptance Criteria

- Existing Meeting and Pitchbook registration workflows remain available and unchanged in their core contracts.
- Meeting/Pitchbook past records can be filtered by every accepted optional filter.
- Meeting updates preserve ID/Doc and reject stale Version saves.
- Pitchbook updates preserve Document ID/File ID and allocate the destination next sequence only when the naming context changes.
- Logical inactivation/reactivation works for both source types and is audited.
- GP/Option additions use stable unique IDs; duplicate normalized names are rejected within the relevant Master scope.
- GP display is alphabetical; Option display/reordering follows Sort Order.
- Rename/inactivate/reactivate changes are audited without source bodies/binary contents.
- Actor resolution failure does not block any normal mutation.
- Phase 1 diagnostics return an inspectable non-destructive result.
- Existing Work 0004–0006 syntax contracts remain compatible and local tests pass.
- Tests perform no live Google calls and no real records, private URLs, credentials, or organization IDs are committed.

## Required Validation Evidence

- Exact local command(s) executed.
- Apps Script/HTML/manifest syntax validation results.
- Existing and new test counts actually observed.
- Fake Meeting stale-save and successful-update evidence.
- Fake Pitchbook destination-context sequence allocation evidence.
- Fake Master duplicate/status/reorder evidence.
- Diff/test review confirming source notes and file contents are absent from Index/Audit payloads.
- Confirmation that no live Google Workspace/Gemini call was made.

## Write Boundaries

Expected writes:

- `src/` maintenance/Master services, adapters, entry points, and client UI partials.
- `tests/` and minimal validation tooling updates.
- concise implementation documentation.
- `docs/handoffs/0007-report.md`.
- minimal setup/schema migration changes only if directly required by accepted Work 0007 behavior.

Do not alter accepted product behavior outside Work 0007.

## Delivery

- Work only on `agent/0007-maintenance-masters-phase1`.
- Keep commits scoped and intentional.
- Open a Draft PR against `main`.
- Commit/push `docs/handoffs/0007-report.md` with the implementation.
- Link instruction and report in the PR description.
- Do not deploy during this Work.

## Escalation Conditions

Escalate only if:

- current persistent contracts materially prevent safe maintenance or logical status transitions;
- optimistic concurrency cannot be achieved without a material schema redesign;
- implementation would require live confidential data, credentials, destructive operations, or Work 0008+ scope;
- authoritative Apps Script/Drive contracts show the accepted design is infeasible;
- safe Master ID allocation cannot be achieved without changing immutable-ID contracts.

Do not escalate because live qualification is deferred, Actor identity is incomplete, hosted CI is unavailable, or optional UX polish remains.

## Completion Report

Report:

- completed outcome;
- material files/components changed;
- exact validation executed and observed;
- branch, implementation commit, report commit, and Draft PR;
- blockers and non-blocking residual issues;
- limitations caused by deferred live qualification.
