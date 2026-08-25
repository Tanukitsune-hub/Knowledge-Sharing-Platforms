# Work 0014 — Structured meeting context foundation

WORK_ID: `0014`
Dispatch ID: `0014-CODEX-02`
BALL: `CODEX`
STATUS: `READY`

Repository: `Tanukitsune-hub/Knowledge-Sharing-Platforms`

Mode: `BUILD / QUALIFICATION`

Primary design:

`docs/planning/work0014-structured-meeting-context.md`

Active execution instruction:

`docs/handoffs/0014-CODEX-02-dev-schema3-smoke-qualification-instruction.md`

## Primary outcome

Add structured Meeting/Pitchbook context required by later GP summary and analytics features while preserving legacy data and the five-sheet backend architecture, then prove the new fields end-to-end in synthetic DEV.

Required product surface:

- optional Team attribution using Option Master;
- optional Fund / Strategy on Meeting and Pitchbook;
- three Meeting type checkboxes;
- Meeting ↔ Pitchbook stable-ID association;
- follow-up flag and note;
- create/edit/search/export round-trip and migration compatibility.

## Closed design conclusions

Do not reopen without material contradiction:

- keep the existing five Backend sheets;
- Team is an Option Master type, seeded PD / AE, optional for legacy and new Meeting records;
- Fund / Strategy is optional free text, not a new master;
- Meeting types use stable codes in one canonical comma-separated column;
- Meeting↔Pitchbook relationships are stored in Meeting_Index by immutable Document IDs, not Drive URLs or a relation sheet;
- Follow-up is a flag plus optional note, not a workflow engine;
- GP one-page, analytics, admin monthly checks, and legacy converter are follow-on Works;
- Shared Drive-specific and billing-enabled Gemini live qualification are outside Work 0014.

## Production storage boundary inherited by Work 0014

The accepted production storage decision is authoritative:

`docs/decisions/shared-drive-production-root.md`

Work 0014 must preserve this boundary even though Shared Drive-specific live qualification is out of scope:

- production does not use or transit through My Drive;
- `knowledgeParentFolderId` points to a selected folder inside the organization-controlled Shared Drive;
- the application creates/reuses `Private Assets Knowledge` beneath that selected folder;
- `Meeting Records` and `Pitchbooks` remain authoritative beneath `Private Assets Knowledge`;
- no new code may introduce a production My Drive fallback or staging path;
- real Drive/folder IDs and URLs must not be committed.

## Accepted implementation evidence — do not reopen

Dispatch `0014-CODEX-01` completed:

- implementation across setup/schema, Meeting, Pitchbook, maintenance/search, browser draft state, Knowledge Export, and derived AI metadata: PASS;
- deterministic validation: `176/176 PASS`;
- public facade: 23 functions, unchanged;
- `git diff --check`: PASS;
- deterministic schema 3 append-only/idempotent migration: PASS;
- deterministic Meeting/Pitchbook/relationship/legacy round trips: PASS;
- exact tested 59-file source synchronization to confirmed synthetic DEV: PASS;
- immutable Apps Script version 26: created;
- existing Web App deployment: updated in place; no second deployment.

The CODEX-01 stop was only `PRIVATE ADMIN EXECUTION SURFACE LIMITATION`, already known from Work 0013; it was not an application-source defect.

## ChatGPT-completed synthetic DEV migration

ChatGPT applied and read back the exact schema 3 data-plane migration required by the committed source, without calling private admin functions or changing source/deployment:

- `Meeting_Index`: appended `Team_ID`, `Fund_Strategy`, `Meeting_Type_Codes`, `Related_Pitchbook_IDs`, `Follow_Up_Required`, `Follow_Up_Note`;
- `Pitchbook_Index`: appended `Fund_Strategy`;
- `Option_Master`: canonical headers confirmed and missing PD/AE TEAM seeds inserted;
- `Settings.SCHEMA_VERSION`: updated to `3`;
- existing rows, IDs, counters, statuses, source files, AI fields, Gemini settings, and `LAST_SETUP_AT`: preserved;
- readback: PASS.

The first sheet migration request failed atomically because the Meeting grid had only 26 columns; no mutation occurred. ChatGPT expanded only that grid to 29 columns and then applied the migration once successfully.

## Remaining acceptance evidence

Only the bounded `0014-CODEX-02` qualification remains:

- align existing `KSP_INSTALLATION_STATE_JSON.schemaVersion` to `3` through Project Settings if not already current, without changing other Script Properties/config/resources;
- legacy Meeting smoke;
- one rich Meeting create/edit/search round-trip;
- one Pitchbook Fund / Strategy live round-trip;
- relationship live behavior where safely observable;
- final integrity readback.

Do not call or expose private administrator functions. Do not change source/tests/manifest/schema design or deployment in CODEX-02.

## Acceptance evidence

Work 0014 is accepted when:

- deterministic implementation evidence above remains accepted;
- synthetic DEV structured-field smoke passes;
- legacy Meeting/Pitchbook compatibility is retained;
- no duplicate/corrupt source rows/files or counter regressions appear;
- Audit stays metadata-only and does not duplicate `Follow_Up_Note` content;
- no blocker remains.

## Non-goals

No new backend sheet, Fund master, dashboard, chart, reminder, production rollout, Shared Drive qualification, Gemini billing qualification, or broad refactor.

## Completion

If CODEX-02 passes, classify:

`DEV QUALIFIED — WORK 0014 STRUCTURED CONTEXT FOUNDATION`

`BLOCKER: NO`

PR #17 remains Draft / Open / unmerged until ChatGPT final review and merge decision.
