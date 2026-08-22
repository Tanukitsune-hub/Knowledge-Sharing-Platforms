# Work 0013 — Pitchbook status parser defect repair

Status: READY_FOR_BOUNDED_CODEX_REPAIR
Route: B/C residual implementation + local/runtime validation after ChatGPT diagnosis
Starting implementation ref: `f9e7ce99e9421b07c3562484a93948500d4cdd4e`
PR: #11 (`agent/0013-consolidated-dev-live-qualification`, Draft / open / unmerged)

## Outcome

Remove the production-only `UNEXPECTED_ERROR` that blocks normal-UI Pitchbook deactivation, make the maintenance tests use the real production Document ID parser instead of a masking test stub, and prove exactly one authorized DEV deactivate/reactivate round-trip on the existing synthetic Work 0013 record without changing authoritative Drive identity.

This is a bounded defect repair inside Work 0013. Do not resume Matrix C or broaden into upload-limit qualification in this run.

## Why Codex is needed

ChatGPT has completed the source-level diagnosis and bounded the repair. Residual work requires local executable test reproduction, source edits, `npm run check`, deployment/sync to the authorized DEV Apps Script environment, and one live UI/runtime confirmation. Those are runtime-dependent tasks and therefore belong in Codex.

## Recommended Codex model

Luna Max.

Rationale: root cause, target call sites, expected pre-fix failure, minimal repair, regression coverage, and live acceptance checks are already specified. Residual work is bounded implementation and validation, not architecture or open-ended diagnosis.

## Mandatory repository instructions and subagents

Before starting work:

1. Read all applicable `AGENTS.md` files, including the repository root, `src/AGENTS.md`, and `tests/AGENTS.md`.
2. Identify and follow the repository-specific subagent-use policy.
3. Use subagents actively and proportionately as required by the applicable `AGENTS.md` files. For this bounded Luna defect run, use them only for independent hypothesis verification and patch/regression review; do not expand scope or duplicate the main implementation.

## Evidence already established by ChatGPT

### Live evidence from the completed 0013 qualification attempt

- Normal UI deactivation of the synthetic `PE_04` Pitchbook failed with the safe message `管理処理を完了できませんでした。`.
- Audit recorded `PITCHBOOK_DEACTIVATE / Failure / UNEXPECTED_ERROR`.
- Backend remained `Active`.
- `File_ID` and `File_URL` remained populated.
- Drive still contained exactly one authoritative source file.
- Therefore the failure occurred before a successful status mutation and did not create an extra Drive file.

### Production source mismatch

- The actual private parser in `src/62_PitchbookIdentity.gs` is `kspParseDocumentId_(documentId)`.
- `src/111_MaintenancePitchbookMasterService.gs` calls the non-existent symbol `kspParsePitchbookDocumentId(documentId)` in `kspChangePitchbookStatus_()` before `environment.updatePitchbookStatusAtomic(...)`.
- `src/100_MaintenanceCore.gs` contains the same stale/non-existent call in `kspValidatePitchbookEditInput_()`.
- `kspGetErrorCode_()` maps an exception without `.code` to `UNEXPECTED_ERROR`, so an Apps Script `ReferenceError` from the missing symbol matches the observed audit code and safe UI message.
- The same mismatch already existed on PR #11 base ref `f3505c29641bce87a3cdf28cfcd6f8ed3313db9d`; it was not introduced by the Work 0013 date-normalization patch.

### Test-harness masking defect

`tests/maintenance-test-loader.cjs` currently declares its own test-only function named `kspParsePitchbookDocumentId(...)`, even though that function does not exist in production source. It then loads the maintenance source files without loading `src/62_PitchbookIdentity.gs`.

This makes the maintenance suite falsely satisfy the stale call and masks the production `ReferenceError`.

## Single falsifiable root-cause hypothesis

The Work 0013 Matrix A `UNEXPECTED_ERROR` is caused by the stale call to undefined `kspParsePitchbookDocumentId(...)`; production should instead call the existing private helper `kspParseDocumentId_(...)`. The maintenance test loader hid this defect by providing a fake implementation under the stale name.

Falsification conditions:

- a production-faithful local reproduction still does not expose the stale-symbol failure before the repair; or
- another legitimate runtime definition of `kspParsePitchbookDocumentId` is found in applicable production source; or
- after the exact call-site repair and deterministic tests pass, the same live DEV action still fails.

If any falsification condition occurs, STOP. Do not invent or pursue a second hypothesis in this run.

## Required repair

Make only the smallest coherent root-cause repair:

1. In `src/111_MaintenancePitchbookMasterService.gs`, change the stale parser call in `kspChangePitchbookStatus_()` from `kspParsePitchbookDocumentId(documentId)` to the existing private production helper `kspParseDocumentId_(documentId)`.
2. In `src/100_MaintenanceCore.gs`, change the same stale parser call in `kspValidatePitchbookEditInput_()` to `kspParseDocumentId_(input.documentId)`.
3. In `tests/maintenance-test-loader.cjs`, remove the fake test-only `kspParsePitchbookDocumentId(...)` implementation and load `src/62_PitchbookIdentity.gs` so the test VM uses the same parser source as production.
4. Add focused regression coverage in the existing maintenance tests for both affected maintenance paths. Do not add a parallel parser implementation.

Do not create a compatibility alias named `kspParsePitchbookDocumentId`. A non-underscore top-level helper would weaken the repository's private-helper/public-surface convention and would preserve the stale API instead of removing it.

## Expected pre-fix failing test

First make the test loader production-faithful (remove the fake parser and load `62_PitchbookIdentity.gs`) and add a regression that executes `kspChangePitchbookStatus_()` for a valid synthetic `DOC-000001` deactivation.

Before changing the production call sites, that regression must demonstrate the defect: the call resolves to the service failure path because `kspParsePitchbookDocumentId` is undefined, producing `UNEXPECTED_ERROR` rather than reaching the fake environment's atomic status update.

Also add a focused validator regression that exercises `kspValidatePitchbookEditInput_()` with a valid production-format Document ID so the second stale call site cannot regress silently.

If the pre-fix regression does not fail for the expected missing-symbol reason, STOP and report the discrepancy.

## Post-fix acceptance checks

Local checks:

- The focused regression(s) pass after the two call-site replacements.
- Invalid Document IDs still surface `PITCHBOOK_DOCUMENT_ID_INVALID` through the real parser.
- `tests/maintenance-test-loader.cjs` no longer defines a parallel Pitchbook Document ID parser.
- Production source contains no remaining executable call to `kspParsePitchbookDocumentId(...)`.
- `npm run check` passes completely. Do not claim any unrun check.

Live DEV confirmation — exactly one bounded Matrix A round-trip on the existing authorized synthetic Work 0013 record:

1. Sync/deploy the repaired branch to the same authorized DEV environment using the repository's established workflow.
2. Refresh/reload the normal UI so the repaired deployment is actually active.
3. On the existing synthetic `PE_04` record, perform one normal-UI deactivation.
4. Verify backend `Status = Inactive`.
5. Verify the same `File_ID` and `File_URL` are preserved.
6. Verify Drive still contains exactly one authoritative source file for that record; deactivation must not delete, duplicate, rename unexpectedly, or replace the file.
7. Verify Audit contains `PITCHBOOK_DEACTIVATE / Success` and no `UNEXPECTED_ERROR` for the successful action.
8. Perform one normal-UI reactivation to restore the synthetic record to `Active`.
9. Verify the same `File_ID` / `File_URL` and one-file Drive invariant again.
10. Verify Audit contains `PITCHBOOK_REACTIVATE / Success`.

After this one round-trip, STOP. Do not continue to Matrix C or probe upload-size boundaries in this run. Matrix B remains `NOT APPLICABLE TO NORMAL UI` unless new evidence changes that conclusion.

## Constraints / non-goals

- DEV synthetic data only. No production actions.
- No destructive cleanup outside the exact synthetic record involved in this confirmation.
- Preserve authoritative Drive identity and data.
- No new public qualification wrapper or public helper.
- No unrelated UI, AI, upload, schema, setup, or architecture changes.
- Do not bump release version for this bounded defect unless an applicable `AGENTS.md` rule explicitly requires it.
- Do not alter the prior `0013-report.md` evidence to make the old failed run look successful.

## Git / PR requirements

- Work on `agent/0013-consolidated-dev-live-qualification` from the exact instruction-bearing ref supplied in the Codex execution request.
- Keep PR #11 Draft / open / unmerged.
- Commit the repair, regression tests, and report normally; push the branch.
- Write `docs/handoffs/0013-pitchbook-status-parser-defect-report.md` under the applicable `AGENTS.md` rules.
- In that report record: pre-fix reproduction evidence; exact files changed; focused checks; full `npm run check`; live DEV deactivate/reactivate evidence; backend/Drive/Audit invariants; commit; branch; PR; and BLOCKER status.
- Link both this instruction file and the defect report in PR #11.

## Stop / escalation conditions

STOP and report `BLOCKER: YES` without broadening diagnosis if any of the following occurs:

- the stated pre-fix missing-symbol hypothesis is not reproduced;
- a legitimate production definition of `kspParsePitchbookDocumentId` is found;
- the minimal repair fails focused checks or `npm run check`;
- deployment/sync cannot prove the repaired code is live in DEV;
- the normal-UI live action still fails after deterministic checks pass;
- `File_ID`, `File_URL`, or Drive one-file invariants are violated;
- evidence points to another root cause.

If all acceptance checks above pass, report `BLOCKER: NO` for this parser defect only. Work 0013 overall is not complete until ChatGPT reviews the repair and separately decides how to resume the remaining qualification, including Matrix C.