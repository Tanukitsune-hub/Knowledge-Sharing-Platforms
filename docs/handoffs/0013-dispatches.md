# Work 0013 dispatch control

WORK_ID: `0013`
Dispatch ID: `0013-CODEX-02`
BALL: `CHATGPT`
STATUS: `BLOCKED`

This file is the current ball/source-of-truth for explicit Codex dispatches under Work 0013.

## Latest dispatch

- Dispatch ID: `0013-CODEX-02`
- Mode: `BUILD — bounded observed PDF defect repair verification`
- Instruction: `docs/handoffs/0013-CODEX-02-pdf-export-transport-fix-verification-instruction.md`
- BALL: `CHATGPT`
- STATUS: `BLOCKED`
- Focused PDF transport regression: `PASS — 4/4`.
- Existing Knowledge Export/UI regression: `FAIL — 17/18 PASS`.
- Decisive evidence: deterministic PDF adapter-path execution raised `ReferenceError: UrlFetchApp is not defined`.
- `npm run check` / `git diff --check`: `NOT RUN — stop condition applied`.
- DEV sync / version / deployment / PDF / clipboard / final integrity: `NOT RUN — deterministic gate failed`.
- Completion latch: not reached; Work 0013 remains not qualified with `BLOCKER: YES`.

No correction, second hypothesis, external synchronization, deployment mutation, or live qualification action was performed after the deterministic failure.

## Previous dispatches — closed

- `0013-CODEX-01`: installation-state repair PASS; Preview PASS; Google Docs export PASS; PDF export failed; clipboard/final integrity not run.

## Accepted closed conclusions

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
Dispatch ID: `0013-CODEX-02`
BALL: `CHATGPT`
STATUS: `BLOCKED`
