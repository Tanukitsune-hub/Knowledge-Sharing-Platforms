# Work 0005 — Meeting vertical slice

WORK_ID: `0005`

Repository: `Tanukitsune-hub/Knowledge-Sharing-Platforms`

Route: ChatGPT-owned implementation with local/Codex executable verification for residual implementation work.

Recommended Codex model: `Luna Max` — the product, storage, Meeting contract, and validation policy are already decided; the residual task is bounded Apps Script implementation and local verification.

Starting ref: `172c0b6081a997b37418ec12d8e2748f3669fea0`

Target branch: `agent/0005-meeting-vertical-slice`

Before starting, read every applicable `AGENTS.md`, identify the repository-specific subagent-use policy, and follow it. Use subagents actively and proportionately for independent implementation review, UI/UX contract review, test review, and failure-path cross-checking; subagent use is required, not optional.

## Outcome

Deliver the first user-facing end-to-end workflow: an Apps Script HTML Service Web App where an authorized user can register a Meeting, receive a stable Meeting ID, create the authoritative Google Doc representation, append the metadata row to `Meeting_Index`, append a best-effort Actor audit event to the separate Audit Spreadsheet, and preserve browser drafts for 24 hours.

The implementation must be code-complete and locally validated without deploying to a live Apps Script or Google Workspace environment. Live qualification remains deferred to the final qualification Work.

## Already-Decided Design Choices

- Runtime is Apps Script V8-compatible plain JavaScript with `.gs`, `.html`, and `appsscript.json` under `src/`.
- Work 0004 setup/schema/adapters are the implementation baseline and must be extended rather than replaced.
- Normal users access one Apps Script HTML Service Web App; backend Sheets and Audit Spreadsheet are not directly exposed.
- Meeting required fields: Date, GP, Asset Class.
- Meeting optional fields: Time, Location, Equity/Debt, Counterparty, Internal Participants, free-form notes.
- Meeting body text lives only in the authoritative Google Doc and is not duplicated into `Meeting_Index`.
- Meeting ID is immutable and formatted like `MTG-000123`.
- Meeting filename: `YYYY-MM-DD_GP_AssetClass_Equity-or-Debt_MTG-XXXXXX`; omit absent Equity/Debt and never include Time.
- Google Doc content is compact: only populated fields, one-line `項目: 値` metadata, preserved note line breaks.
- Shared browser context consists of Date, GP, Asset Class, and Equity/Debt. Meeting Time is page-specific.
- Shared context remains after successful registration; Meeting-specific fields clear after success.
- Text/selection drafts persist in the same browser for 24 hours. File-handle persistence is irrelevant to Meeting.
- Actor attribution is best-effort: email, else temporary user key, else `UNIDENTIFIED`; Actor failure never blocks registration.
- Audit logs are written to the separate Restricted Audit Spreadsheet. No Web App Audit Viewer is required.
- Live Apps Script/Drive/Sheets/Docs/OAuth/deployment validation is deferred. Use fakes and local tests now.

## Source of Truth

- `AGENTS.md`
- `src/AGENTS.md`
- `tests/AGENTS.md`
- `docs/product/vision.md`
- `docs/architecture/target-architecture.md`
- `docs/planning/apps-script-implementation-plan.md`
- `docs/operations/runtime-policy.md`
- `docs/decisions/audit-access-and-user-attribution.md`
- Work 0004 implementation and report

## Required Scope

1. Add the HTML Service Web App shell and administrator/user entry points needed to render and initialize the Meeting page.
2. Add server-side initial-state loading for Active GP, Asset Class, Equity/Debt, and Location options from backend master sheets.
3. Add Meeting request normalization and validation on both client and server.
4. Add deterministic Meeting ID allocation using the existing Settings counter and a short Script Lock critical section.
5. Add deterministic filename generation using authoritative display names and existing normalization helpers.
6. Add compact Google Doc content generation that preserves Meeting note line breaks and omits empty optional fields.
7. Add a Meeting service flow that:
   - resolves installed resources;
   - validates master IDs and Active status;
   - allocates or reuses a retry Meeting ID;
   - creates or reuses the authoritative Google Doc;
   - appends exactly one `Meeting_Index` row;
   - appends a structured audit event;
   - returns a structured success/failure result.
8. Make retry after partial failure safe. A structured failure after ID allocation must return enough retry state to reuse the same Meeting ID and avoid duplicate Docs/Index rows.
9. Add best-effort Actor resolution and ensure Actor lookup failure never blocks the Meeting operation.
10. Add browser-side draft/shared-context persistence with a 24-hour expiry and explicit clear action.
11. Add local tests with fake adapters for validation, ID/filename generation, Doc text, happy path, draft-state pure logic where practical, partial failure/retry idempotency, audit payload, and no Meeting-body duplication into Index/Audit.
12. Add concise implementation documentation and `docs/handoffs/0005-report.md`.

## Non-Goals

- Pitchbook upload or Pitchbook UI.
- Past-record search/edit/deactivate/reactivate.
- Full Master management screens or GP quick-add; Work 0005 may read existing Active masters only.
- Gemini API/File Search, AI status synchronization, or Knowledge Search.
- Live Google Workspace writes, Apps Script deployment, OAuth, or trigger execution.
- Per-user source ACLs, custom authentication, or an Audit Viewer.
- Physical deletion workflows.
- Reconsideration of accepted Meeting, storage, or audit design.

## Acceptance Criteria

- `doGet()` returns a Web App HTML surface containing a usable Meeting registration form.
- Date, GP, and Asset Class are required on both client and server.
- A minimal valid request can produce a stable Meeting ID, deterministic filename, authoritative Doc payload, one Meeting Index row, and one audit event in the fake environment.
- Optional empty fields are omitted from the Doc text and filename.
- Notes preserve line breaks and are absent from `Meeting_Index` and Audit payloads.
- Repeating a retry with the same allocated Meeting ID does not create a second Doc or second Index row.
- Failure returns structured information and does not erase the browser draft.
- Successful registration clears Meeting-specific fields but preserves shared Date/GP/Asset Class/Equity-Debt context.
- Draft/shared-context state expires after 24 hours and may be explicitly cleared.
- Actor email/key unavailability does not fail registration.
- Existing Work 0004 tests remain passing and new local tests pass.
- Tests perform no live Google calls and no secrets or real data are committed.

## Required Validation Evidence

- Exact local command(s) executed.
- Apps Script syntax/manifest validation result.
- Existing and new test counts with observed results.
- Fake happy-path evidence showing Meeting ID, filename, Doc text, Index row, and audit event.
- Fake retry evidence showing no duplicate Doc/Index row.
- Diff review confirming Meeting notes are not copied into Index or Audit.
- Confirmation that no live Google Workspace/Gemini call was made.

## Write Boundaries

Expected writes:

- `src/` Apps Script server/client files needed for the Meeting vertical slice.
- `tests/` and minimal local validation tooling updates.
- concise implementation documentation.
- `docs/handoffs/0005-report.md`.
- minimal package/script updates required for executable validation.

Do not alter accepted product behavior outside Work 0005.

## Delivery

- Work only on `agent/0005-meeting-vertical-slice`.
- Keep commits scoped and intentional.
- Open a Draft PR against `main`.
- Commit/push `docs/handoffs/0005-report.md` with the implementation.
- Link both instruction and report in the PR description.
- Do not merge or deploy during the implementation handoff.

## Escalation Conditions

Escalate only if:

- Work 0004 contracts materially prevent a safe Meeting implementation;
- stable retry/idempotency cannot be achieved without changing the accepted persistent schema;
- implementation would require live confidential data, credentials, or destructive operations;
- Apps Script platform contracts make the accepted Meeting design infeasible based on authoritative evidence;
- scope must expand into Work 0006 or later.

Do not escalate because live Google qualification is deferred, Actor email is unavailable, hosted CI is unavailable, or optional visual polish remains.

## Completion Report

Report:

- completed outcome;
- material files/components changed;
- exact validation executed and observed;
- branch, implementation commit, report commit, and Draft PR;
- blockers and non-blocking residual issues;
- limitations caused by deferred live qualification.
