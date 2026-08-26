# Work 0014 — CODEX-06 Pitchbook date round-trip and post-save search repair

WORK_ID: `0014`
Dispatch ID: `0014-CODEX-06`
BALL: `CODEX`
STATUS: `READY`

Repository: `Tanukitsune-hub/Knowledge-Sharing-Platforms`

Mode: `BUILD / QUALIFICATION`

Route: `C — ChatGPT-owned root-cause analysis; bounded source/test repair, in-place Web App version update, read-only live search/reopen, and final integrity by Codex`.

Recommended model: `Luna Max`.

## Primary outcome

Make the already-saved synthetic Pitchbook remain discoverable under its unchanged exact Date / GP / Asset Class / Capital Type / Active filters, reopen it and prove the saved Fund / Strategy value, then complete final authoritative integrity without performing a second Pitchbook save.

## Accepted evidence — do not reopen

- Work 0014 product/data model, schema 3, five-sheet architecture, and Shared Drive-only production boundary are accepted.
- schema 3 migration and installation-state alignment: PASS/read back.
- legacy Meeting live compatibility: PASS.
- rich Meeting create/edit/search round-trip: PASS.
- Meeting ↔ Pitchbook relationship preservation: PASS.
- CODEX-04 bounded Pitchbook helper repair: implemented and source-synchronized.
- local deterministic result recorded by CODEX-04: `179/179 PASS`; public facade `23`.
- synthetic DEV source readback: `59/59 PASS`.
- CODEX-05 created exactly one verified private Web App deployment, automatic immutable version `29`, and a working `/exec`.
- CODEX-05 performed the Fund / Strategy save exactly once and it succeeded.
- authoritative Backend contains exactly one Active target row with the saved Fund / Strategy value.
- `Document_ID`, `File_ID`, `Sequence_No`, saved filename, and Active status remained unchanged.
- exactly one successful metadata-level `PITCHBOOK_UPDATE` Audit event was appended.
- no duplicate or partial row/file mutation occurred.

The save has already satisfied its one-write evidence. Do not save the Pitchbook again in CODEX-06.

## ChatGPT root-cause conclusion

Active hypothesis: `PITCHBOOK_DATE_REPRESENTATION_DRIFT_ON_FULL_ROW_WRITE`.

This is supported by the following direct evidence:

1. The CODEX-05 save changed only Fund / Strategy logically, but the success Audit event reported changed fields `Date,Fund_Strategy,Updated_At`.
2. Audit before-metadata represented `Date` as a timestamp/Date object, while after-metadata represented the same logical date as a `YYYY-MM-DD` string.
3. The live Backend cell is now a numeric Google Sheets `DATE` cell in an `Asia/Tokyo` spreadsheet; the Apps Script manifest is also `Asia/Tokyo`.
4. `kspMaintenanceCellText_()` and `kspCanonicalPitchbookDateKey_()` currently derive calendar dates with UTC getters.
5. Pitchbook metadata commit and Pitchbook status changes currently rewrite the full row through `setValues`, while Meeting status already uses partial field writes to avoid changing untouched Date/Time cells.
6. All non-Date search fields remained stable, the exact search passed before the save, and it failed only after the Date object/string/cell representation round-trip.

The smallest complete repair is therefore:

- timezone-aware logical date canonicalization;
- no full-row rewrite of untouched Pitchbook date/timestamp cells;
- logical-date Audit comparison;
- deterministic post-save exact-search regression.

Do not open a second hypothesis in this dispatch unless the required deterministic regression disproves this one. If disproved, stop and return for Strategy Reset.

## Required bounded implementation

### 1. Timezone-aware logical date key

Use the configured application timezone (`KSP_DEFAULTS.TIMEZONE`, currently `Asia/Tokyo`) for Date objects.

Update the canonical date path so that both:

- a Date representing UTC midnight for the logical day; and
- a Date representing midnight in `Asia/Tokyo`

produce the same intended `YYYY-MM-DD` key.

Preferred production behavior for a Date object:

`Utilities.formatDate(value, KSP_DEFAULTS.TIMEZONE, 'yyyy-MM-dd')`

with deterministic test mocks as needed. Do not use raw `getUTCFullYear/getUTCMonth/getUTCDate` for business-date matching.

Apply one canonical implementation consistently to:

- `kspCanonicalPitchbookDateKey_()`;
- the `kind === 'date'` branch of `kspMaintenanceCellText_()`;
- Pitchbook context comparison;
- Pitchbook search and result mapping through their existing call paths.

Do not change timestamp (`Updated_At`) semantics.

### 2. Preserve untouched Pitchbook cell types

A Fund / Strategy-only edit must not rewrite the Date cell or unrelated authoritative cells.

Implement a dedicated partial-write Pitchbook commit path, or an equivalently narrow mechanism, that:

- retains optimistic claim/token checks;
- writes only mutable fields actually required by the Pitchbook metadata edit;
- omits `Date` when its logical canonical value is unchanged;
- writes `Date` only when the user truly changes the logical date;
- preserves `Document_ID`, `Batch_ID`, `File_ID`, `File_URL`, `Original_Filename`, creation metadata, and all unrelated fields;
- preserves claim cleanup and rollback behavior.

Do not weaken concurrency checks.

### 3. Pitchbook status partial writes

Align `updatePitchbookStatusAtomic()` with the existing Meeting status pattern:

- shallow-copy the row for before/after evidence;
- write only `Status`, `Updated_At`, `Updated_By`, `AI_Index_Status`, and `AI_Last_Error`;
- never rewrite Date or unrelated Pitchbook cells during status changes.

### 4. Logical Audit comparison

Normalize `Date` in `kspPitchbookAuditSnapshot_()` to the canonical logical date key.

A Fund / Strategy-only edit must report only the true logical changes, such as:

- `Fund_Strategy`;
- `Updated_At`;
- other intentionally changed metadata, if applicable.

It must not report `Date` when the logical day is unchanged.

### 5. Regression coverage

Add focused tests proving all of the following:

1. UTC-midnight and Asia/Tokyo-midnight Date representations of the same business day canonicalize to the same `YYYY-MM-DD`.
2. Exact Date/GP/Asset Class/Capital Type/Active search returns the target after a Fund / Strategy-only edit and a Sheets-like Date round-trip.
3. Fund / Strategy-only edit does not write the Date column and preserves its prior raw cell value/type.
4. Fund / Strategy-only Audit changed fields exclude `Date`.
5. A true logical date/context change still writes Date, allocates the correct sequence/filename, and remains searchable under the new context.
6. Pitchbook deactivate/reactivate does not write the Date column.
7. Existing Meeting behavior and public facade count remain unchanged.
8. The new regression fails on the pre-CODEX-06 source or otherwise demonstrates the observed defect, not merely the proposed implementation.

Update `tests/AGENTS.md` with a durable rule:

- tests for Sheets date fields must cover the configured timezone and preserve untouched cell types;
- metadata-only updates must not rewrite unrelated Date/Time cells.

## Scope boundaries

Do not change:

- schema version or headers;
- product fields or UI layout;
- Meeting implementation except shared date helper wiring strictly required by the canonical date function;
- public facade allowlist;
- Script Properties;
- data migration or current saved Pitchbook value;
- Drive source files;
- Shared Drive production decision;
- Gemini/File Search logic;
- existing Library deployments;
- Web App access boundary.

Do not create a new Web App deployment.

## Deterministic validation

Run focused date/search/maintenance adapter/service tests first.

Then run:

`npm run check`

`git diff --check`

PASS requires:

- all tests PASS;
- Apps Script source validation PASS;
- public facade remains exactly `23`;
- no unrelated diff;
- no private IDs, URLs, account data, or runtime secrets in source/tests/docs.

If the active hypothesis is disproved or any deterministic gate fails, stop. Do not deploy or open a second hypothesis.

## DEV synchronization and deployment

Only after deterministic PASS:

1. synchronize the exact tested `src` tree once to the already identity-confirmed synthetic DEV Apps Script project;
2. read back and prove exact source equality;
3. create exactly one new immutable Apps Script version;
4. update the existing positively identified CODEX-05 Web App deployment in place to that version;
5. preserve type `Web app`, execute-as deploying user, access `Only myself`;
6. prove `WEB_APP` plus the existing `/exec` before mutation and again after mutation;
7. do not create another deployment and do not touch Library deployments.

If latest version is still `29`, expected new immutable version is `30`.

## Live re-verification — read only

Use the updated existing `/exec`.

Do not edit or save any record.

Run exactly:

1. one search using the retained exact Date / GP / Asset Class / Capital Type / Active filters;
2. confirm exactly one target row is returned;
3. reopen that target once;
4. confirm the already-saved synthetic Fund / Strategy value is displayed;
5. confirm `Document_ID`, `File_ID`, `Sequence_No`, filename, and Active status remain unchanged;
6. confirm CODEX-06 created no new `PITCHBOOK_UPDATE` Audit event because no write was performed.

If the exact search still returns zero or more than one target row, stop immediately. Do not broaden filters, save again, or open a second source hypothesis.

## Final authoritative integrity

After search/reopen PASS, complete the previously deferred final readback:

- exactly one target Pitchbook row and one source file;
- no duplicate Meeting/Pitchbook rows or files;
- legacy rows/files remain intact;
- CODEX-03 rich Meeting and relationship evidence remains intact;
- expected counters only;
- exactly five Backend sheets and canonical schema-3 headers;
- TEAM `PD` / `AE` seeds remain unique;
- no unexpected AI/store/trigger/Script Property mutation;
- `Follow_Up_Note` content remains absent from Audit;
- CODEX-05 successful save Audit event remains exactly one;
- CODEX-06 adds no Pitchbook update Audit event;
- one existing Web App deployment was version-updated in place;
- Library deployments remain unchanged.

## Completion

If deterministic validation, read-only exact search/reopen, and final integrity all PASS, classify:

`DEV QUALIFIED — WORK 0014 STRUCTURED CONTEXT FOUNDATION`

`BLOCKER: NO`

Shared Drive-specific production qualification, billing-enabled Gemini/File Search qualification, and optional GitHub Actions CI remain outside Work 0014. Production readiness is not claimed.

## Reporting and GitHub delivery

Create/update:

- `docs/handoffs/0014-CODEX-06-pitchbook-date-roundtrip-search-repair-report.md`;
- `docs/handoffs/0014-report.md`;
- `docs/handoffs/0014-instruction.md`;
- `docs/handoffs/0014-dispatches.md`;
- Draft PR #17 body.

Commit and push the bounded source/test/docs changes to:

`agent/0014-structured-meeting-context-foundation`

Keep PR #17 Draft / Open / unmerged for ChatGPT final review and merge.

WORK_ID: `0014`
Dispatch ID: `0014-CODEX-06`
BALL: `CODEX`
STATUS: `READY`
