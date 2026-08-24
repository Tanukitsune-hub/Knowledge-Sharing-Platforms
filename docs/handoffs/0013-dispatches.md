# Work 0013 dispatch control

WORK_ID: `0013`
Dispatch ID: `0013-CODEX-03`
BALL: `CODEX`
STATUS: `READY`

This file is the current ball/source-of-truth for explicit Codex dispatches under Work 0013.

## Active dispatch

- Dispatch ID: `0013-CODEX-03`
- Mode: `BUILD / QUALIFICATION — deterministic test-harness alignment, then bounded DEV verification`
- Instruction: `docs/handoffs/0013-CODEX-03-test-harness-urlfetchapp-alignment-instruction.md`
- BALL: `CODEX`
- STATUS: `READY`
- Primary outcome: align the stale Knowledge Export PDF integration test with the already-approved `UrlFetchApp` + OAuth REST transport, restore the deterministic gate, then run the one authorized post-fix PDF / clipboard / final-integrity qualification.
- Application source is frozen; only the deterministic test harness and evidence/report documents may change before runtime verification.

## Previous dispatch — returned

### `0013-CODEX-02`

- Focused PDF transport regression: `PASS — 4/4`.
- Existing Knowledge Export/UI regression: `FAIL — 17/18 PASS`.
- Decisive evidence: the existing PDF adapter-path test raised `ReferenceError: UrlFetchApp is not defined` because its VM still modeled the removed `Drive.Files.export()` path.
- `npm run check` / `git diff --check`: not run due to the stop condition.
- DEV sync / version / deployment / PDF / clipboard / final integrity: not run.
- Classification: deterministic validation failed before DEV synchronization.
- No external mutation occurred.

## Closed conclusions — do not reopen

- PDF production repair using authenticated Drive v3 REST export remains the accepted implementation; its dedicated tests pass `4/4`.
- Web App recovery and versioned `/exec`: PASS.
- Integrated navigation: PASS by direct user live confirmation.
- Matrix A/B/C and upload sizing: accepted.
- Matrix D: `DEFERRED — PRIVATE ADMIN EXECUTION SURFACE LIMITATION`; closed and non-blocking.
- Knowledge Export installation-state repair: PASS.
- Matrix E Preview: PASS.
- Google Docs export: PASS.
- Shared Drive-specific qualification: deferred external gap.
- Billing-enabled Gemini/File Search qualification: deferred external gap.

PR #11 must remain Draft / Open / unmerged.

WORK_ID: `0013`
Dispatch ID: `0013-CODEX-03`
BALL: `CODEX`
STATUS: `READY`
