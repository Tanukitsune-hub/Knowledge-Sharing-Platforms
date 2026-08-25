# Work 0014 — Structured meeting context foundation

WORK_ID: `0014`
Dispatch ID: `0014-CODEX-04`
BALL: `CODEX`
STATUS: `BLOCKED`

Repository: `Tanukitsune-hub/Knowledge-Sharing-Platforms`

Mode: `BUILD / QUALIFICATION`

Primary design:

`docs/planning/work0014-structured-meeting-context.md`

Active execution instruction:

`docs/handoffs/0014-CODEX-04-pitchbook-maintenance-helper-repair-instruction.md`

## Primary outcome

Deliver the structured Meeting/Pitchbook context foundation and prove it end-to-end in synthetic DEV.

Required product surface remains:

- optional Team attribution using Option Master;
- optional Fund / Strategy on Meeting and Pitchbook;
- three Meeting type checkboxes;
- Meeting ↔ Pitchbook stable-ID association;
- follow-up flag and note;
- create/edit/search/export round-trip and migration compatibility.

## Closed design conclusions

Do not reopen without material contradiction:

- keep exactly five Backend sheets;
- Team is an Option Master type, seeded PD / AE, optional for legacy and new Meeting records;
- Fund / Strategy is optional free text, not a Fund master;
- Meeting types use stable codes in one canonical comma-separated field;
- Meeting↔Pitchbook relationships use immutable Document IDs in Meeting_Index, not Drive URLs or a relation sheet;
- Follow-up is a flag plus optional note, not a workflow engine;
- GP one-page, analytics, monthly admin checks, and legacy converter are follow-on Works;
- Shared Drive-specific production and billing-enabled Gemini/File Search qualification are outside Work 0014.

## Production storage boundary

`docs/decisions/shared-drive-production-root.md` remains authoritative:

- production does not use or transit through My Drive;
- `knowledgeParentFolderId` targets an organization-controlled Shared Drive folder;
- `Private Assets Knowledge` is created/reused beneath that folder;
- Meeting Records and Pitchbooks are authoritative;
- no production My Drive fallback/staging path may be introduced.

## Accepted evidence — do not reopen

- Work 0014 schema/data model and broad implementation: accepted;
- deterministic validation before the live defect: `176/176 PASS`;
- public facade: 23 functions;
- schema 3 append-only/idempotent migration: PASS;
- synthetic DEV data-plane migration and installation-state alignment: PASS/read back;
- Web App recovery: PASS — one normal deployment, immutable version `27`, `/exec` rendered;
- legacy Meeting live compatibility: PASS;
- rich Meeting create/edit/search live round-trip: PASS;
- Meeting ↔ Pitchbook relationship live preservation: PASS;
- the failed Pitchbook edit produced no duplicate or partial row/file mutation.

## CODEX-04 result

The bounded source/test repair is complete:

- focused tests: `47/47 PASS`;
- `npm run check`: `179/179 PASS`;
- public facade: `23`;
- `git diff --check`: PASS;
- tested synthetic DEV source readback: `59/59 PASS`;
- exactly one immutable version created: `28`.

The live Pitchbook save was not attempted. Current Apps Script deployment readback exposes the CODEX-03/CODEX-04 item as a Library entrypoint rather than an updateable Web App entrypoint, and the existing `/exec` returns page not found. A Library deployment touched by the failed CLI update was restored to its original version `27`; no new Web App deployment was created and all other deployments remain unchanged.

## ChatGPT root-cause diagnosis

The deterministic maintenance harness masked missing production business helpers:

- `src/111_MaintenancePitchbookMasterService.gs` calls `kspBuildPitchbookSavedFilename(...)`;
- `src/120_MaintenanceLiveEnvironment.gs` calls `kspPitchbookContextMatchesRow(...)`;
- neither helper exists in production `src` at the failing ref;
- `tests/maintenance-test-loader.cjs` injects both helper implementations into the test VM, causing deterministic tests to pass against behavior unavailable in Apps Script runtime.

The same path also compares a raw Sheets `Date` value with a normalized `YYYY-MM-DD` string, which can incorrectly classify a Fund / Strategy-only edit as a context move.

This is one bounded application-defect family. Do not open a second hypothesis in CODEX-04.

## Remaining blocker

The required existing Web App deployment is not currently available for an in-place version update. Creating another Web App deployment was prohibited by CODEX-04, so live Pitchbook verification and final integrity remain pending.

## Completion

Current classification:

`NOT QUALIFIED — DEPLOYMENT CONTROL-PLANE BLOCKER BEFORE LIVE PITCHBOOK SAVE`

`BLOCKER: YES`

PR #17 remains Draft / Open / unmerged until ChatGPT final review and merge decision.
