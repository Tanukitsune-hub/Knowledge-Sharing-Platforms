# Work 0014 report

WORK_ID: `0014`
Dispatch ID: `0014-CODEX-06`
BALL: `CODEX`
STATUS: `READY`

## GitHub-verified current state

PR #17 is Draft / Open / unmerged. CODEX-05 created a valid private synthetic DEV Web App and version `29`. The Fund / Strategy save succeeded exactly once and authoritative Backend/Audit readback is intact.

Work 0014 remains incomplete only because the exact post-save Pitchbook search returned zero rows and the final integrity matrix has not run.

## Accepted evidence

- structured Meeting/Pitchbook implementation: accepted;
- schema 3 append-only/idempotent migration: PASS;
- synthetic DEV migration and installation-state alignment: PASS/read back;
- legacy Meeting live compatibility: PASS;
- rich Meeting create/edit/search live round-trip: PASS;
- relationship preservation: PASS;
- CODEX-04 source/test repair: implemented;
- local deterministic result recorded by CODEX-04: `179/179 PASS`;
- public facade: `23`;
- source synchronization/readback: `59/59 PASS`;
- CODEX-05 private Web App/version `29`/main `/exec`: PASS;
- Pitchbook Fund / Strategy save exactly once: PASS;
- saved value and stable Document/File/sequence/filename/Active identity: PASS;
- unique target row and no duplicate/partial mutation: PASS;
- exactly one successful metadata-level `PITCHBOOK_UPDATE` Audit event: PASS.

## Independent GitHub/Drive review

GitHub source, branch, commit, PR, handoffs, and current code paths were inspected. The repository still has no GitHub Actions workflow or status check, so the reported deterministic PASS remains local Codex evidence rather than GitHub CI evidence.

Direct Backend/Audit readback confirmed:

- the target remains one Active row with the saved Fund / Strategy value;
- all exact non-Date search identifiers remain unchanged;
- the success Audit event lists `Date,Fund_Strategy,Updated_At` as changed even though the logical Date was not edited;
- before-Audit Date is a timestamp/Date representation and after-Audit Date is a `YYYY-MM-DD` string for the same logical day;
- the live Date cell is a numeric Google Sheets Date;
- the spreadsheet and Apps Script manifest are both `Asia/Tokyo`.

Code inspection confirmed:

- `kspMaintenanceCellText_()` and `kspCanonicalPitchbookDateKey_()` use UTC getters for Date objects;
- exact search filters use that derived date key;
- Pitchbook metadata commit rewrites the whole row through `setValues`;
- Pitchbook status also rewrites the whole row;
- Meeting status already uses partial-field writes specifically to preserve untouched Date/Time cells.

## Root-cause classification

Active hypothesis:

`PITCHBOOK_DATE_REPRESENTATION_DRIFT_ON_FULL_ROW_WRITE`

Confidence: high.

The save altered the Date cell's runtime/storage representation while retaining the same displayed logical day. The search path then applied representation-sensitive UTC calendar-day extraction. This is the only search field with direct evidence of an unintended post-save change.

## Problem classification

### BLOCKER

- timezone-aware business-date canonicalization;
- partial Pitchbook edit/status writes preserving untouched Date and unrelated cells;
- logical Date Audit comparison;
- deterministic post-save exact-search regression;
- one read-only exact search/reopen after deployment update;
- final authoritative integrity.

### FIX SOON

- add durable test guidance for configured-timezone Date cells and no unrelated Date/Time rewrites.

### BACKLOG

- optional GitHub Actions CI;
- Shared Drive-specific production qualification;
- billing-enabled Gemini/File Search qualification.

## Active handoff

`docs/handoffs/0014-CODEX-06-pitchbook-date-roundtrip-search-repair-instruction.md`

CODEX-06 must not save the target again. The accepted saved value will be verified through one read-only exact search and one reopen after the bounded repair.

Current classification:

`REPAIR READY — PITCHBOOK DATE ROUND-TRIP / POST-SAVE SEARCH`

`BLOCKER: YES`

PR #17 remains Draft / Open / unmerged pending CODEX-06 and ChatGPT final review.
