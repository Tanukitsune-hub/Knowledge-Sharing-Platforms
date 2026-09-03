# Work 0021 — Structured Knowledge Search

WORK_ID: `0021`
DISPATCH_ID: `0021-CODEX-06`
BALL: `CODEX`
STATUS: `READY`
MODE: `RECONCILIATION -> FINAL WORK QUALIFICATION`

Active instruction:

`docs/handoffs/0021-CODEX-06-runtime-version-reconciliation-and-final-full-output-instruction.md`

Current report target:

`docs/handoffs/0021-CODEX-06-runtime-version-reconciliation-and-final-full-output-report.md`

Prior six-format report:

`docs/handoffs/0021-CODEX-04-six-format-openai-capability-and-final-work-qualification-report.md`

Runtime locator:

`docs/operations/runtime-artifact-locator.md`

## Current state

Accepted product evidence remains six-format registration, OpenAI exact sync 6/6, grounded source-ID checks 6/6, EML attachment exclusion, and private Web App version 65.

A late/stale CODEX-04 runtime session completed the strict Google editor URL parser change locally and validated it (`25/25` focused, `376/376` canonical, source readback `80/80`). It created immutable Apps Script version 66, then accidentally created version 67 after a stale immediate list readback. Neither version was deployed; the existing Web App remains on version 65. The local scoped commit `516a323d4ee00b3134e79719303ddf81d52d5b4b` was not pushed because the remote branch had already advanced.

`0021-CODEX-05` is superseded before execution because it assumed version 66 still needed to be created.

CODEX-06 must reconcile only the scoped parser/test change onto current remote GitHub state, create no new Apps Script version, verify existing version 66 is the exact intended parser-fix source, update the same Web App to version 66 at most once, run exactly one API-independent FULL_OUTPUT preview, complete final read-only integrity, and stop.

Version 67 remains unused/not deployed. No repeat OpenAI sync/query, no Gemini, no Backend rewrite, no Work 0023, and no version 68.

WORK_ID: `0021`
DISPATCH_ID: `0021-CODEX-06`
BALL: `CODEX`
STATUS: `READY`
