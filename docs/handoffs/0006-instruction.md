# Work 0006 — Pitchbook vertical slice

WORK_ID: `0006`

Repository: `Tanukitsune-hub/Knowledge-Sharing-Platforms`

Route: ChatGPT-owned implementation with local/Codex executable verification for residual implementation work.

Recommended Codex model: `Luna Max` — the upload limits, persistent contracts, UI scope, failure behavior, and validation policy are already decided; the residual task is bounded Apps Script implementation and local verification.

Starting ref: `b99d734d6b2d52adf3266f54443bde9666833ef3`

Target branch: `agent/0006-pitchbook-vertical-slice`

Before starting, read every applicable `AGENTS.md`, identify the repository-specific subagent-use policy, and follow it. Use subagents actively and proportionately for independent implementation review, UI/upload contract review, retry/idempotency review, and test review; subagent use is required, not optional.

## Outcome

Add the second user-facing end-to-end workflow to the Apps Script HTML Service Web App: Pitchbook/source-material registration with drag-and-drop or file selection, shared Date/GP/Asset Class/Equity-Debt context, file-granular validation, stable Batch ID and Document IDs, deterministic persistent sequence numbers, Shared Drive storage, `Pitchbook_Index` persistence, separate audit logging, and retry of failed files using the same identities and reserved sequence numbers.

The implementation must be code-complete and locally validated without deploying to a live Apps Script or Google Workspace environment. Live qualification remains deferred to the final qualification Work.

## Already-Decided Design Choices

- Extend the Work 0004 setup baseline and Work 0005 Web App/Meeting implementation; do not replace them.
- Runtime remains Apps Script V8-compatible plain JavaScript under `src/`.
- Pitchbook required inputs: file, Date, GP, Asset Class. Equity / Debt is optional.
- Shared context with Meeting: Date, GP, Asset Class, Equity / Debt. Switching pages and successful registration do not clear these four values.
- Upload limit: 25MB per file, 10 files per selection, 100MB total per selection. Client and server validation must use the same constants.
- Initial accepted source extensions: `.pdf`, `.pptx`, `.xlsx`, `.docx`, `.txt`, `.eml`.
- Each batch has immutable Batch ID; each file has immutable Document ID and reserved Sequence No.
- Filename: `YYYY-MM-DD_GP_AssetClass_Equity-or-Debt_Sequence.ext`; omit absent Equity/Debt, preserve the original extension, and start sequence at `01`.
- Later files in the same naming context use the current maximum sequence plus one. Gaps are never closed.
- Processing is file-granular. One file failure never rolls back successfully registered files.
- Failed files retry with the same Batch ID, Document ID, and reserved Sequence No.
- Retry must avoid duplicate Drive files and duplicate `Pitchbook_Index` rows.
- Initial state distinguishes at least `Pending`, `Active`, `Failed`, and `Inactive` in the Pitchbook status field.
- Source files in Shared Drive are authoritative; Index contains metadata/references, not duplicated file contents.
- Audit Actor is best-effort and audit-write failure must not roll back an authoritative successful file registration.
- File handles need not survive page reload. Metadata/selection draft may persist for 24 hours, but files may require reselection.
- No live Apps Script/Drive/Sheets/OAuth/deployment validation in this Work.

## Source of Truth

- `AGENTS.md`
- `src/AGENTS.md`
- `tests/AGENTS.md`
- `docs/product/vision.md`
- `docs/architecture/target-architecture.md`
- `docs/planning/apps-script-implementation-plan.md`
- `docs/operations/runtime-policy.md`
- `docs/decisions/pitchbook-upload-limits.md`
- `docs/decisions/audit-access-and-user-attribution.md`
- Work 0004 and Work 0005 implementation/report

## Required Scope

1. Extend the Web App shell with an explicit Meeting/Pitchbook page selector while preserving the existing Meeting workflow.
2. Add a Pitchbook registration surface supporting drag-and-drop and multi-file selection.
3. Load the same Active GP, Asset Class, and Equity/Debt master options used by Meeting.
4. Implement shared browser context so changes in Date/GP/Asset Class/Equity-Debt are reflected between Meeting and Pitchbook sections and retained for 24 hours.
5. Implement client and server validation for:
   - required metadata;
   - 1–10 files;
   - 25MB/file;
   - 100MB total;
   - accepted extensions;
   - safe original filenames and non-empty extensions.
6. Add Batch ID and Document ID formatting/allocation using existing Settings counters and short LockService critical sections.
7. Add deterministic naming-context and sequence allocation. Reserve sequences in a short lock, include Pending/Failed rows when determining current max, and never renumber historical rows.
8. Implement a prepare-batch flow that appends exactly one Pending `Pitchbook_Index` row for each selected file and returns stable upload slots.
9. Implement file upload flow that:
   - validates the prepared slot and request fingerprint;
   - decodes/validates the file payload;
   - creates or reuses the authoritative Drive file;
   - uses stable Drive app properties or another deterministic identity marker for idempotent recovery;
   - updates the existing Index row to Active with File ID/URL;
   - records an audit event;
   - returns a structured per-file result.
10. On failure, retain the prepared row/identity, mark the slot Failed when possible, return a structured result, and permit retry with the same IDs/sequence.
11. Add a retry-failed-files client flow. Within the same page session, retain selected File objects; after reload, retain slot metadata but ask the user to reselect matching files.
12. Add local tests with fake adapters covering validation, ID formatting, sequence reservation, deterministic filenames, happy path, mixed success/failure, retry idempotency, recovery after Drive-create/Index-update interruption, audit redaction, and preservation of successful files.
13. Add concise implementation documentation and `docs/handoffs/0006-report.md`.

## Non-Goals

- Past Pitchbook search/edit/deactivate/reactivate UI.
- File replacement of an existing Active Pitchbook.
- Full Master management UI or GP quick-add.
- Gemini API/File Search indexing or AI synchronization.
- `.msg` support or automatic extraction/indexing of `.eml` attachments.
- Live Google Workspace writes, Apps Script deployment, OAuth, or browser qualification.
- Per-user source ACLs, custom authentication, or Audit Viewer.
- 100MB-per-file upload transport, chunk manager, or Cloud fallback runtime.
- Reconsideration of accepted storage, naming, upload, or audit design.

## Acceptance Criteria

- Existing Meeting registration remains present and its existing contracts are not weakened.
- The Web App contains a usable Pitchbook registration page with drag/drop and multiple-file selection.
- Client/server limits are exactly 25MB/file, 10 files, 100MB total.
- A valid multi-file request creates one Batch ID and one stable Document ID/reserved Sequence per file.
- Saved filenames are deterministic, preserve extension, start at `_01`, and continue from the naming-context maximum.
- Pending rows are created once and retries reuse them.
- Mixed batch results preserve successful files and identify failed files individually.
- Retry with the same slot does not create a duplicate Drive file or Index row.
- A simulated failure after Drive creation can recover the existing file and finish the same Index row.
- File binary/content is never copied into `Pitchbook_Index` or Audit rows.
- Audit write failure does not roll back a committed authoritative file.
- Successful registration keeps shared metadata context, clears current file selection, and clears completed retry state.
- Metadata/slot draft expires after 24 hours and can be explicitly cleared; browser reload is allowed to require file reselection.
- Existing Work 0004/0005 logic remains syntactically compatible and all local tests pass.
- Tests perform no live Google calls and no secrets or real data are committed.

## Required Validation Evidence

- Exact local commands executed.
- Apps Script/HTML/manifest syntax validation result.
- Existing and new test counts with observed results.
- Fake mixed-result evidence showing one Batch ID, stable per-file IDs/sequences, successful file preservation, and failed-file retry.
- Fake interruption/recovery evidence showing no duplicate file or Index row.
- Diff review confirming no file content/base64 is stored in Index or Audit.
- Confirmation that no live Google Workspace/Gemini call was made.

## Write Boundaries

Expected writes:

- `src/` files needed for Pitchbook core/service/adapters and the shared Web App UI.
- `tests/` and minimal local validation tooling updates.
- concise implementation documentation.
- `docs/handoffs/0006-report.md`.
- minimal manifest/package/script updates required for validation.

Do not alter accepted product behavior outside Work 0006.

## Delivery

- Work only on `agent/0006-pitchbook-vertical-slice`.
- Keep commits scoped and intentional.
- Open a Draft PR against `main`.
- Commit/push `docs/handoffs/0006-report.md` with the implementation.
- Link instruction and report in the PR description.
- Do not merge or deploy during the implementation handoff.

## Escalation Conditions

Escalate only if:

- current Work 0004/0005 contracts materially prevent safe file-granular persistence;
- retry/idempotency cannot be achieved without changing the accepted persistent schema;
- implementation would require live confidential data, credentials, destructive operations, or 100MB transport complexity;
- authoritative Apps Script/Drive contracts show the accepted design is infeasible;
- scope must expand into Work 0007 or later.

Do not escalate because live qualification is deferred, file handles do not survive reload, Actor identity is incomplete, hosted CI is unavailable, or the safe practical upload limit may later be lower than 25MB.

## Completion Report

Report:

- completed outcome;
- material files/components changed;
- exact validation executed and observed;
- branch, implementation commit, report commit, and Draft PR;
- blockers and non-blocking residual issues;
- limitations caused by deferred live qualification.
