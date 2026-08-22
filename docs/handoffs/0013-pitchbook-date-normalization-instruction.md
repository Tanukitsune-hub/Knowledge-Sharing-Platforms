# Work 0013 — Completed bounded Pitchbook date-normalization diagnosis

WORK_ID: `0013`

Status: `COMPLETED — DO NOT RE-EXECUTE`

Repository: `Tanukitsune-hub/Knowledge-Sharing-Platforms`

Route used: `B — ChatGPT diagnosis, Codex bounded verification / minimal repair`.

Recommended model used: `Luna Max`.

## Diagnosis

ChatGPT identified one falsifiable hypothesis:

> Google Sheets returns `Pitchbook_Index.Date` as a JavaScript `Date` object or persisted ISO date string, while browser/reservation input uses `YYYY-MM-DD`. Pitchbook context comparison and slot-fingerprint construction were not using one canonical date key, which could cause both repeated sequence numbering and a slot fingerprint mismatch before Drive file creation.

## Outcome

The hypothesis was confirmed and repaired in Work 0013.

The completed implementation:

- introduced one canonical Pitchbook date key;
- applied it to `kspBuildPitchbookSlotFingerprint_`;
- applied it to the existing-context sequence comparison in the reservation path;
- preserved existing native Google Sheets Date values without unnecessary rewrites;
- corrected persisted ISO date readback for the maintenance edit form;
- added focused deterministic regression tests.

Current synthetic DEV evidence recorded in `docs/handoffs/0013-report.md`:

- a new three-file Pitchbook Batch continued at sequences `04 / 05 / 06` rather than restarting at `01`;
- all three rows reached `Active`;
- Drive links were returned through the UI, confirming `File_ID` / `File_URL` propagation;
- metadata date readback returned `2026-08-17`.

Do not rerun this diagnosis or reopen alternative causes without new contradictory evidence.

## Durable Luna Max execution rule

This completed task is the template for future Luna Max debugging work in this repository:

1. ChatGPT performs the root-cause analysis and writes one falsifiable hypothesis.
2. The handoff identifies exact source targets and the expected pre-fix failing test.
3. Luna Max may only:
   - reproduce the stated hypothesis;
   - make one minimal repair when reproduced;
   - run focused deterministic checks;
   - perform one bounded live confirmation.
4. Luna Max must stop when:
   - the pre-fix reproducer does not fail;
   - the one repair attempt does not pass the focused checks;
   - the live case still fails after deterministic PASS;
   - evidence points to a different root cause.
5. A stopped run returns evidence to ChatGPT. It must not explore a second hypothesis, conduct a broad repository scan, refactor broadly, or invent the next diagnosis.
6. Subagents remain mandatory, but are limited to independent verification and patch review rather than competing root-cause exploration.

## Source of truth

- Current report: `docs/handoffs/0013-report.md`
- General residual policy: `docs/handoffs/0013-resume-instruction.md`
- Draft PR: `#11`
