# Work 0013 — Residual DEV live qualification

WORK_ID: `0013`

Repository: `Tanukitsune-hub/Knowledge-Sharing-Platforms`

Route: `C — Codex residual authenticated DEV qualification and observed-defect remediation`.

Recommended Codex model: `Luna Max`.

Rationale: Work 0013 has already established the current hardened DEV Web App deployment, normal bootstrap/master loading, and the unchanged deterministic baseline. The remaining work is a bounded set of interactive/browser/Workspace/Gemini qualification checks. Luna Max is an execution/verification model in this Work, not the owner of open-ended root-cause discovery.

Current residual starting ref before the ChatGPT diagnosis update: `aa805a26544ce6b3bc9bdd2f18bd7f9828379b2f`.

Target branch: `agent/0013-consolidated-dev-live-qualification`.

Draft PR: `#11`.

Primary current report: `docs/handoffs/0013-report.md`.

## Mandatory ChatGPT-led diagnosis rule

Do not conduct open-ended root-cause investigation under this general residual instruction.

When a live check fails:

1. stop at the first safe evidence boundary;
2. preserve the exact non-secret error code, row/status state, and smallest reproduction evidence;
3. do not explore competing hypotheses or make a speculative source change;
4. return the evidence to ChatGPT;
5. resume only from a new or updated GitHub handoff that states one falsifiable hypothesis, exact source targets, expected failing test, allowed repair, validation steps, and stop conditions.

For the current Pitchbook `Pending` / empty `File_ID` / repeated sequence issue, the only authorized next execution source is:

`docs/handoffs/0013-pitchbook-date-normalization-instruction.md`

Do not continue general investigation of that issue from this file.

## Purpose

Continue the same Work 0013 objective. Do not create a new Work ID and do not rerun completed qualification from scratch.

The prior run confirmed:

- the Work 0012 hardened source was pushed to the synthetic DEV Apps Script project;
- a current DEV Web App was created through the official Apps Script deployment UI and loads successfully;
- the current Pitchbook page, Master options, upload contract, failed-slot restoration, and retry UI render without browser errors;
- normal bootstrap/facade smoke works without exposing resource IDs or private diagnostic objects;
- `npm run check` and `npm run test` remained `154/154 PASS`, and `git diff --check` passed;
- no current-source defect was reproduced in that run, so no speculative source change was made.

Treat those observations as prior PASS evidence unless a bounded later run observes contradictory evidence.

## Residual qualification categories

The remaining qualification categories are:

- current Pitchbook browser upload/retry/update/status and practical upload limit;
- real Knowledge Export Docs/PDF/clipboard/Audit/non-indexing;
- safe private administrator/trigger execution path;
- authorized disposable Shared Drive behavior when available;
- billing-enabled Gemini/File Search when available.

Each category must use a ChatGPT-prepared bounded handoff whenever diagnosis or source repair is needed. Luna Max may execute a known test matrix, but must stop and return evidence instead of inventing the next diagnosis.

## User interaction rules

The user is expected to be physically at the PC for interactive qualification.

- Initiate supported sign-in/consent/billing flows instead of merely telling the user to configure them later.
- For native file selection, name the exact synthetic file(s) and ask only for that selection action.
- Never use blind Windows mouse/keyboard automation or infer an unknown Chrome URL.
- Never ask the user to paste secrets or private Google identifiers into chat.
- Do not abandon independent remaining checks because one interactive checkpoint is waiting.

## General defect handling

Fix only defects covered by a ChatGPT-authored bounded diagnosis handoff.

A bounded handoff must define:

- the accepted hypothesis;
- evidence supporting it;
- exact files/functions in scope;
- a pre-fix reproducer that must fail;
- one minimal allowed repair;
- focused deterministic checks;
- one live confirmation;
- mandatory stop conditions when the hypothesis is not reproduced or the live case still fails.

Do not broaden from one hypothesis to another in the same Luna run.

## Final validation and report

After a bounded residual run:

- run the checks explicitly required by that handoff;
- update `docs/handoffs/0013-report.md` rather than creating a new Work report;
- retain exact `PASS / FAIL / DEFERRED / NOT APPLICABLE` classifications;
- explicitly distinguish `DEV QUALIFIED` from `PRODUCTION READY`;
- do not claim hosted CI PASS without an actual workflow run;
- remove qualification-only local/deployment artifacts that are no longer required;
- commit and push only scoped report/source/test/doc changes to the same branch;
- update Draft PR #11;
- do not merge.

## Completion judgment

Work 0013 can be considered complete with external production gaps only when all capabilities available in the authorized DEV environment have actually been exercised or have a precise external limitation. A failed live capability must not be carried as an unexplained `DEFERRED`: it must either be resolved through a bounded ChatGPT-authored handoff or stopped with sufficient evidence for ChatGPT to diagnose the next step.

Shared Drive and billing-enabled Gemini may remain explicit external production gaps when the organization/test infrastructure is genuinely unavailable.

## Completion response

Return only the fields required by the active bounded handoff.