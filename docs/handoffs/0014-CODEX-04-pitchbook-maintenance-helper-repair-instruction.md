# Work 0014 — CODEX-04 Pitchbook maintenance helper repair and smoke completion

WORK_ID: `0014`
Dispatch ID: `0014-CODEX-04`
BALL: `CODEX`
STATUS: `READY`

Repository: `Tanukitsune-hub/Knowledge-Sharing-Platforms`

Mode: `BUILD / QUALIFICATION`

Route: `C — ChatGPT-owned root-cause diagnosis; bounded source/test repair, deployment update, and one live re-verification by Codex`.

Recommended model: `Luna Max`.

## Primary outcome

Repair the single observed live Pitchbook Fund / Strategy edit defect without reopening the accepted Work 0014 architecture, then complete the remaining Pitchbook live check and final authoritative integrity readback.

## Accepted evidence — do not reopen

- Work 0014 schema/data model and UI design: accepted.
- deterministic validation before the live defect: `176/176 PASS`.
- schema 3 append-only/idempotent migration: PASS.
- synthetic DEV schema 3 data-plane migration and installation-state alignment: PASS/read back.
- versioned Web App recovery: PASS — one Web App deployment, immutable version `27`, `/exec` main page PASS.
- legacy Meeting compatibility: PASS.
- rich Meeting create/edit/search round-trip: PASS.
- Meeting ↔ Pitchbook relationship preservation: PASS.
- the first Pitchbook Fund / Strategy save failed safely; the target remained Active, the value was not persisted, and no duplicate or partial update was created.
- production Shared Drive-only storage boundary remains accepted and unchanged.

Do not rerun the completed Meeting or relationship smoke.

## ChatGPT root-cause diagnosis

The live failure is caused by a deterministic-test harness masking missing production Pitchbook-maintenance helpers.

Production call path:

- `src/111_MaintenancePitchbookMasterService.gs` calls `kspBuildPitchbookSavedFilename(...)` on every Pitchbook metadata edit;
- `src/120_MaintenanceLiveEnvironment.gs` calls `kspPitchbookContextMatchesRow(...)` when reserving a destination sequence;
- neither function exists in the production `src` tree at the accepted failing ref.

The deterministic maintenance loader instead defines both production-named functions inside `tests/maintenance-test-loader.cjs`. The service tests therefore passed against test-only implementations that are absent from Apps Script runtime.

There is one related live-only date-contract defect in the same path:

- `kspPitchbookContextChanged_()` compares raw `currentRow.Date` with the normalized `YYYY-MM-DD` input string;
- Apps Script Sheets reads date-formatted cells as `Date` objects, while the existing fake rows use strings;
- a Fund / Strategy-only edit can therefore be incorrectly classified as a context move.

This is one bounded defect family: the Pitchbook maintenance service contract exists only in test stubs and does not canonicalize live Sheets dates.

Do not investigate a second hypothesis in this dispatch.

## Required minimal repair

Use private trailing-underscore production helpers. Do not add public facade functions.

### `src/100_MaintenanceCore.gs`

1. Change `kspPitchbookContextChanged_()` so the date comparison uses the canonical Pitchbook date representation rather than raw `String(Date)` comparison.
2. Add private helper:

`kspPitchbookContextMatchesRow_()`

It must compare:

- canonical date;
- GP ID;
- Asset Class ID;
- Capital Type ID.

3. Add private helper:

`kspBuildPitchbookSavedFilename_()`

It must delegate to the existing accepted Pitchbook filename/extension logic rather than maintain a second filename algorithm.

### `src/111_MaintenancePitchbookMasterService.gs`

Update the edit path to call `kspBuildPitchbookSavedFilename_()`.

### `src/120_MaintenanceLiveEnvironment.gs`

Update destination-sequence matching to call `kspPitchbookContextMatchesRow_()`.

### `tests/maintenance-test-loader.cjs`

Remove the test-only definitions of:

- `kspPitchbookContextMatchesRow`
- `kspBuildPitchbookSavedFilename`

The deterministic suite must execute the actual production helpers from `src/100_MaintenanceCore.gs`.

### Regression coverage

Add/adjust focused coverage proving:

1. the maintenance loader does not inject production business helpers;
2. a live-like Pitchbook row with `Date` as a JavaScript `Date` object and an unchanged date/GP/Asset Class/Capital Type is not treated as a context move when only Fund / Strategy changes;
3. Fund / Strategy edit preserves existing `Document_ID`, `File_ID`, `Sequence_No`, and filename when context is unchanged;
4. a true context change still allocates the correct destination sequence and filename;
5. the two new helpers remain private and public facade count remains unchanged;
6. the pre-fix ref would fail the new regression because the production helpers are absent / the raw Date comparison is incorrect.

Update `tests/AGENTS.md` with one durable rule: deterministic harnesses may stub external services/adapters, but must not define production-named business helpers that are absent from the source tree.

## Scope boundaries

Do not change:

- schema version or sheet headers;
- Meeting implementation;
- relationship design;
- UI layout or product fields;
- public facade allowlist;
- Script Properties;
- backend data migration;
- Shared Drive production decision;
- Gemini/File Search behavior;
- existing Library deployments;
- the current Web App deployment ID.

Do not create a second Web App deployment.

## Deterministic validation

Run focused tests first, including the new live-like Date-object regression.

Then run:

`npm run check`

`git diff --check`

PASS requires:

- all tests PASS;
- Apps Script validator PASS;
- public facade remains exactly `23` functions;
- no test-only production helper definitions remain;
- no unrelated diff or secret/private runtime value.

Stop if the bounded repair does not make all deterministic gates PASS. Do not open a second hypothesis.

## DEV synchronization and deployment

Only after deterministic PASS:

1. synchronize the exact tested `src` tree once to the already identity-confirmed synthetic DEV Apps Script project;
2. verify remote readback matches the tested source;
3. create exactly one new immutable Apps Script version;
4. update the existing Work 0014 Web App deployment in place to that version;
5. preserve deployment type `Web app`, execute-as deploying user, access `Only myself`;
6. do not create another deployment and do not modify Library deployments.

## Live re-verification

Use the existing `/exec` for the updated deployment.

Run only the previously failed Pitchbook check:

1. reopen the same safe synthetic Active Pitchbook used in CODEX-03;
2. confirm the prior failed value is still absent and the row/file identity is unchanged;
3. set one non-empty synthetic Fund / Strategy value;
4. save exactly once;
5. reopen/search once and verify the value round-trips;
6. verify `Document_ID`, `File_ID`, sequence, and filename remain unchanged because the other context fields were unchanged;
7. verify exactly one expected metadata-level success Audit event and no duplicate/partial row/file mutation.

If the first post-fix save fails, stop immediately. Do not retry and do not investigate a second cause.

## Final integrity

After live Pitchbook PASS, complete the final Work 0014 readback:

- legacy rows/files remain intact;
- the rich Meeting and relationship evidence from CODEX-03 remains intact;
- no duplicate Meeting/Pitchbook rows or files;
- expected counters only;
- exactly five Backend sheets and canonical schema-3 headers;
- TEAM PD/AE seeds remain unique;
- no unexpected AI/store/trigger/Script Property mutation;
- Follow_Up_Note is absent from Audit content;
- only the existing Web App deployment was version-updated;
- Library deployments remain untouched.

## Completion

If deterministic validation, the one Pitchbook live re-verification, and final integrity all PASS, classify:

`DEV QUALIFIED — WORK 0014 STRUCTURED CONTEXT FOUNDATION`

`BLOCKER: NO`

Shared Drive-specific production qualification and billing-enabled Gemini/File Search qualification remain outside Work 0014. Production readiness is not claimed.

## Reporting

Create/update:

- `docs/handoffs/0014-CODEX-04-pitchbook-maintenance-helper-repair-report.md`;
- `docs/handoffs/0014-report.md`;
- `docs/handoffs/0014-instruction.md`;
- `docs/handoffs/0014-dispatches.md`;
- Draft PR #17 body.

Commit and push the bounded source/test/docs changes to:

`agent/0014-structured-meeting-context-foundation`

Keep PR #17 Draft / Open / unmerged. ChatGPT owns final review and merge.

WORK_ID: `0014`
Dispatch ID: `0014-CODEX-04`
BALL: `CODEX`
STATUS: `READY`
