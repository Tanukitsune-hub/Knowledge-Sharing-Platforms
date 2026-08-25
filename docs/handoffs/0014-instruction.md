# Work 0014 — Structured meeting context foundation

WORK_ID: `0014`
Dispatch ID: `0014-CODEX-04`
BALL: `CODEX`
STATUS: `READY`

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

## Observed blocker

The first and only live Pitchbook Fund / Strategy save returned the safe error:

`管理処理を完了できませんでした。`

The target remained Active, the submitted Fund / Strategy value remained absent, and row/file identity remained intact. The smoke stopped before final integrity.

## ChatGPT root-cause diagnosis

The deterministic maintenance harness masked missing production business helpers:

- `src/111_MaintenancePitchbookMasterService.gs` calls `kspBuildPitchbookSavedFilename(...)`;
- `src/120_MaintenanceLiveEnvironment.gs` calls `kspPitchbookContextMatchesRow(...)`;
- neither helper exists in production `src` at the failing ref;
- `tests/maintenance-test-loader.cjs` injects both helper implementations into the test VM, causing deterministic tests to pass against behavior unavailable in Apps Script runtime.

The same path also compares a raw Sheets `Date` value with a normalized `YYYY-MM-DD` string, which can incorrectly classify a Fund / Strategy-only edit as a context move.

This is one bounded application-defect family. Do not open a second hypothesis in CODEX-04.

## Active repair contract

Dispatch `0014-CODEX-04` must:

1. implement private trailing-underscore production helpers for Pitchbook context matching and saved-filename construction;
2. update production callers to the private helpers;
3. canonicalize Pitchbook date comparison for live Sheets Date values;
4. remove the test loader's injected production business-helper definitions;
5. add live-like Date-object regression coverage;
6. keep the public facade at 23 and preserve schema/product behavior;
7. run focused tests, `npm run check`, and `git diff --check`;
8. only after deterministic PASS, sync exact tested source to synthetic DEV;
9. create one immutable version and update the existing Web App deployment in place, without creating another deployment;
10. retry only the previously failed Pitchbook Fund / Strategy save once, verify reopen/search and stable row/file/sequence/filename identity, then complete final integrity.

If the first post-fix live save fails, stop immediately. No second retry or second diagnosis is authorized.

## Completion

If deterministic validation, Pitchbook live re-verification, and final integrity PASS, classify:

`DEV QUALIFIED — WORK 0014 STRUCTURED CONTEXT FOUNDATION`

`BLOCKER: NO`

PR #17 remains Draft / Open / unmerged until ChatGPT final review and merge decision.
