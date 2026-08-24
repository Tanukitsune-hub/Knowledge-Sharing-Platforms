# Work 0013 dispatch control

WORK_ID: `0013`
Dispatch ID: `0013-CODEX-01`
BALL: `CODEX`
STATUS: `READY`

This file is the current ball/source-of-truth for active Codex dispatches under Work 0013.

Earlier Work 0013 runs predate explicit Dispatch ID adoption and are retained in the historical handoff/report files. Dispatch numbering begins here with the first explicitly dispatch-controlled run; no legacy run is renumbered retroactively.

## Active dispatch

- Dispatch ID: `0013-CODEX-01`
- Mode: `QUALIFICATION / bounded DEV configuration repair`
- Primary Outcome: complete the missing Knowledge Export installation-state migration in the already confirmed synthetic DEV Apps Script project, then resume Matrix E through Preview, Docs, PDF, clipboard, and integrity readback.
- Instruction: `docs/handoffs/0013-CODEX-01-knowledge-export-installation-state-repair-instruction.md`
- Recommended model: `Luna Max`
- BALL: `CODEX`
- STATUS: `READY`
- Fastest Safe Decisive Action: patch the existing `KSP_INSTALLATION_STATE_JSON` once to register the already-created `Knowledge Exports` folder and current schema/app version, then retry Preview once.
- Non-goals: Matrix D retry, source/test/manifest changes, new Web App deployment, API executable, public wrapper, Shared Drive qualification, Gemini/File Search qualification.
- Completion latch: if Matrix E passes with Matrix D remaining only the allowed private-execution-surface deferral and no blocker, classify Work 0013 `DEV QUALIFIED WITH RESIDUAL EXTERNAL GAPS` and stop.

## Accepted closed conclusions

- Web App recovery: PASS.
- Versioned `/exec`: PASS.
- Integrated navigation: PASS by direct user live confirmation.
- Matrix D: `DEFERRED — PRIVATE ADMIN EXECUTION SURFACE LIMITATION`; closed for Work 0013.
- Knowledge Export Preview failure cause: missing Work 0011 DEV migration state for `Knowledge Exports`, not a navigation defect.
- ChatGPT has already created the missing sibling `Knowledge Exports` folder and updated Backend Settings to schema `2` / app `0.1.2` with the export-folder setting; readback PASS.

WORK_ID: `0013`
Dispatch ID: `0013-CODEX-01`
BALL: `CODEX`
STATUS: `READY`
