# Work 0013 — Residual DEV live qualification policy

WORK_ID: `0013`

Repository: `Tanukitsune-hub/Knowledge-Sharing-Platforms`

Route: `ChatGPT diagnosis first; Luna Max bounded verification / implementation only`.

Target branch: `agent/0013-consolidated-dev-live-qualification`.

Draft PR: `#11`.

Primary report: `docs/handoffs/0013-report.md`.

## Current state

The Pitchbook Date representation defect has been confirmed, repaired, tested, and live-verified. Do not rerun it.

Completed diagnostic record:

`docs/handoffs/0013-pitchbook-date-normalization-instruction.md`

The remaining Work 0013 items are qualification gaps, not authorization for Luna Max to perform open-ended root-cause investigation.

## Mandatory ChatGPT-led diagnosis gate

When a residual live check fails:

1. Luna Max stops at the first safe evidence boundary.
2. It preserves the exact non-secret error code, visible status, relevant row state, command/test result, and smallest reproduction evidence.
3. It does not explore competing hypotheses, scan the repository broadly, refactor, or make a speculative source change.
4. It returns the evidence to ChatGPT.
5. ChatGPT inspects GitHub and available live evidence, identifies one falsifiable hypothesis, and commits a bounded handoff.
6. Luna Max resumes only from that exact handoff/ref.

## Requirements for every bounded Luna Max debugging handoff

The handoff must state:

- one accepted hypothesis;
- evidence supporting the hypothesis;
- exact source files/functions allowed to change;
- the expected pre-fix failing test;
- one minimal allowed repair;
- focused deterministic checks;
- one bounded live confirmation;
- mandatory stop conditions.

## Mandatory Luna Max stop conditions

Luna Max must stop and return evidence when any of the following occurs:

- the pre-fix reproducer does not fail;
- the accepted hypothesis is contradicted;
- the one permitted repair attempt does not pass focused checks;
- deterministic checks pass but the live case still fails;
- a different code path appears to be responsible;
- progress would require a second hypothesis, broad investigation, architecture choice, feature expansion, or unrelated refactor.

A Luna Max run may not transition from one hypothesis to another by itself.

## Subagent rule

Subagent use remains mandatory under applicable `AGENTS.md`, but is bounded to:

- one independent verifier of the stated hypothesis/reproducer;
- one independent reviewer of the minimal patch and regression coverage.

Do not dispatch subagents to explore competing root causes.

## Remaining qualification categories

The remaining Work 0013 categories are:

- a separate native Pitchbook retry / duplicate-protection case;
- practical browser upload-size qualification;
- current-Batch Active / Inactive / Reactivate confirmation;
- safe private administrator setup / validation / status / trigger execution path;
- real Knowledge Export Docs / PDF / hyperlinks / Audit / non-indexing / clipboard;
- disposable Shared Drive behavior when an authorized test location exists;
- billing-enabled Gemini / File Search when an approved DEV credential exists.

These categories may be executed as known test matrices. When they reveal a defect, stop and return evidence for a new ChatGPT-authored bounded handoff.

## User interaction rules

- Ask only for the exact browser sign-in, confirmation, native file selection, or billing action required at that checkpoint.
- Never use blind Windows mouse/keyboard automation or infer an unknown Chrome URL.
- Never ask the user to paste credentials, API keys, tokens, passwords, cookies, or private Google resource IDs into chat.
- Use synthetic/anonymized DEV data only.

## Delivery after a bounded run

- update `docs/handoffs/0013-report.md`;
- run only the checks required by the bounded handoff plus canonical final checks when requested;
- preserve precise `PASS / FAIL / DEFERRED / NOT APPLICABLE` classifications;
- commit/push only scoped source/tests/report/docs changes;
- update Draft PR #11;
- do not merge.

## Completion judgment

Work 0013 may finish as `DEV QUALIFIED WITH RESIDUAL EXTERNAL GAPS` when no implementation blocker remains and unavailable organization-only infrastructure is named precisely. Do not claim `PRODUCTION READY` without actual production-release-critical Shared Drive, browser, upload, Knowledge Export, and Gemini evidence.