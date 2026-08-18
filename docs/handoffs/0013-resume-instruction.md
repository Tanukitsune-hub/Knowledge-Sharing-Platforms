# Work 0013 — Residual DEV live qualification policy

WORK_ID: `0013`

Repository: `Tanukitsune-hub/Knowledge-Sharing-Platforms`

Route: `ChatGPT diagnosis first; Luna Max bounded verification / implementation only`.

Target branch: `agent/0013-consolidated-dev-live-qualification`.

Draft PR: `#11`.

Primary report: `docs/handoffs/0013-report.md`.

## Current state

The Pitchbook Date representation defect has been confirmed, repaired, tested, and live-verified. Do not rerun it.

The subsequent automated browser qualification stopped before application mutation/upload:

- Matrix A: edit card remained hidden after one automated Edit action, with no application safe error and no browser error;
- Matrix C: automated filechooser timed out and the browser target closed before file selection, FileReader, Apps Script call, Drive write, or Index write.

ChatGPT classifies the next hypothesis as browser-automation/session instability rather than a reproduced application defect. The next execution must therefore use explicit user-assisted browser actions and non-browser authoritative verification.

Active next instruction:

`docs/handoffs/0013-user-assisted-browser-qualification-instruction.md`

Completed Date diagnosis record:

`docs/handoffs/0013-pitchbook-date-normalization-instruction.md`

## Mandatory ChatGPT-led diagnosis gate

When a residual live check fails:

1. Luna Max stops at the first safe evidence boundary.
2. It preserves the exact non-secret error code, visible status, relevant row state, command/test result, and smallest reproduction evidence.
3. It does not explore competing hypotheses, scan the repository broadly, refactor, or make a speculative source change.
4. It returns the evidence to ChatGPT.
5. ChatGPT inspects GitHub and available live evidence, identifies one falsifiable hypothesis or operational bypass, and commits a bounded handoff.
6. Luna Max resumes only from that exact handoff/ref.

## Requirements for every bounded Luna Max debugging handoff

The handoff must state:

- one accepted hypothesis;
- evidence supporting the hypothesis;
- exact source files/functions allowed to change, or explicitly state no source change;
- the expected pre-fix failing test when source repair is involved;
- one minimal allowed repair when source repair is involved;
- focused deterministic checks;
- one bounded live confirmation;
- mandatory stop conditions.

## Mandatory Luna Max stop conditions

Luna Max must stop and return evidence when any of the following occurs:

- the accepted hypothesis is contradicted;
- a required manual user action does not produce the expected UI state;
- the pre-fix reproducer does not fail;
- the one permitted repair attempt does not pass focused checks;
- deterministic checks pass but the live case still fails;
- a different code path appears to be responsible;
- progress would require a second hypothesis, broad investigation, architecture choice, feature expansion, or unrelated refactor.

A Luna Max run may not transition from one hypothesis to another by itself.

## Subagent rule

Subagent use remains mandatory under applicable `AGENTS.md`, but is bounded to independent evidence verification and patch/regression review. Do not dispatch subagents to explore competing root causes.

## Remaining qualification categories

The remaining Work 0013 categories are:

- user-assisted current-Batch Active / Inactive / Reactivate;
- a normal-UI retry/duplicate-protection case when a natural Failed/Pending slot exists;
- user-assisted practical browser upload-size qualification;
- safe private administrator setup / validation / status / trigger execution path;
- real Knowledge Export Docs / PDF / hyperlinks / Audit / non-indexing / clipboard;
- disposable Shared Drive behavior when an authorized test location exists;
- billing-enabled Gemini / File Search when an approved DEV credential exists.

## User interaction rules

- For browser-native actions, prefer explicit user clicks/file selection over Codex browser automation when the automation surface has shown instability.
- Ask only for the exact browser sign-in, confirmation, native file selection, or billing action required at that checkpoint.
- Never use blind Windows mouse/keyboard automation or infer an unknown Chrome URL.
- Never ask the user to paste credentials, API keys, tokens, passwords, cookies, or private Google resource IDs into chat.
- Use synthetic/anonymized DEV data only.

## Delivery after a bounded run

- update `docs/handoffs/0013-report.md`;
- preserve precise `PASS / FAIL / DEFERRED / NOT APPLICABLE` classifications;
- distinguish user-performed browser evidence from authoritative Backend/Drive/Audit verification;
- commit/push only scoped report/source/tests/docs changes;
- update Draft PR #11;
- do not merge.

## Completion judgment

Work 0013 may finish as `DEV QUALIFIED WITH RESIDUAL EXTERNAL GAPS` when no implementation blocker remains and unavailable organization-only infrastructure is named precisely. Do not claim `PRODUCTION READY` without actual production-release-critical Shared Drive, browser, upload, Knowledge Export, and Gemini evidence.
