# Work 0016 — CODEX-02 final corrected sync and target-runtime qualification

WORK_ID: `0016`
DISPATCH_ID: `0016-CODEX-02`
BALL: `CODEX`
STATUS: `READY`

Repository: `Tanukitsune-hub/Knowledge-Sharing-Platforms`

Branch: `agent/0016-counterparty-entity-foundation`

Mode: `BUILD / QUALIFICATION`

Route: `C — bounded final source repair, one exact Apps Script synchronization, in-place Web App update, and one coherent authenticated runtime campaign`.

Recommended model: `Luna Max`.

## Primary outcome

Finish the already-implemented Work 0016 Counterparty Entity foundation without splitting it into further Works:

`final pre-sync repair -> deterministic validation -> exact source sync -> schema 4 alignment -> existing Web App update -> legacy GP + one non-GP Meeting runtime campaign -> final integrity -> report/push/PR update`.

## Accepted evidence — do not reopen

- Work 0016 product/data architecture is fixed by:
  - `docs/decisions/counterparty-entity-classification.md`;
  - `docs/planning/work0016-counterparty-entity-foundation.md`.
- the complete vertical slice is present on the branch;
- schema 4, append-only columns, and blank-only legacy GP backfill: deterministic PASS;
- legacy GP compatibility: deterministic PASS;
- non-GP create/retry/edit/reopen/search: deterministic PASS;
- Related GP and explicit Pitchbook relationship behavior: deterministic PASS;
- GP Workspace, Knowledge Export, Audit redaction, and deterministic AI metadata propagation: deterministic PASS;
- CODEX-01 final local result: `211/211 PASS`, public facade `24`, `git diff --check` PASS;
- current report commit before this handoff: `4bac661805232178784edd0c1d1260543860b9b3`;
- branch was based on current main and had no missing main commits at CODEX-01 return;
- the existing private Web App remains on immutable version `31`;
- no new version, deployment update, Backend/Audit/Drive/Script Property/trigger/AI-store data mutation occurred in CODEX-01;
- one saved-source synchronization was performed before the four CODEX-01 final-review fixes, so saved editor source is known to be stale and is not acceptance evidence.

Do not reopen the broad schema, identity, storage, or UI architecture.

## ChatGPT independent pre-sync findings

Fix these in the same bounded pre-sync repair before any Apps Script synchronization.

### 1. Logical-date defect — BLOCKER

`src/30_MeetingCore.gs::kspMeetingCellDate_()` derives Date-object calendar parts with UTC getters. Target Sheets rows are read through `getValues()` and the application timezone is `Asia/Tokyo`; a logical local date can therefore display/sort as the preceding UTC date.

Use the existing configured-timezone canonical contract instead of a second UTC algorithm. Prefer reusing `kspCanonicalPitchbookDateKey_()` or one shared equivalent based on:

`Utilities.formatDate(value, KSP_DEFAULTS.TIMEZONE, 'yyyy-MM-dd')`.

Required regression:

- a Sheets-like `Date` value representing `2026-08-29 00:00 Asia/Tokyo` (`2026-08-28T15:00:00.000Z`) maps to `2026-08-29`;
- registration-side Related Pitchbook choice display and ordering use that date;
- string dates remain unchanged;
- test loaders provide only the external `Utilities` adapter needed by production logic and do not duplicate business logic.

### 2. Authoritative GP category label — FIX SOON, close before sync

The accepted decision uses the display label:

`GP / 運用会社`

Update all Work 0016 Counterparty Type UI/bootstrap representations that still show only `GP`. Keep the stable code `GP` unchanged. Add a contract assertion covering both `GP / 運用会社` and `日本生命`.

Do not rename GP Master or change stored IDs.

### 3. Related Pitchbook hint — FIX SOON, close before sync

The Meeting registration hint still says candidates match the selected singular GP. Change it to accurately describe the implemented rule:

`関連GPのいずれか + Asset Classに一致するActive資料`.

Add/update the UI contract assertion.

### 4. Counterparty quick-add retry invalidation — FIX SOON, close before sync

After quick-adding and selecting a new Counterparty Entity, clear any existing Meeting retry fingerprint before persisting the changed draft. The quick-add path changes request identity and must not leave stale retry state.

Add a focused behavioral or sufficiently direct client-contract regression proving the quick-add path clears retry context before saving the changed Meeting draft.

## Pre-sync completion gate

Before touching Apps Script again:

1. implement only the four bounded findings above;
2. run focused tests for Counterparty/date/client behavior;
3. run:
   - `npm run check`;
   - `git diff --check`;
4. inspect the final relevant diff once after all repairs;
5. confirm public facade remains exactly `24`;
6. confirm no secret/private runtime value or unrelated refactor;
7. commit the corrected source/tests/docs locally if needed.

Do not synchronize source until this final review is complete. The purpose is to avoid another post-sync repair cycle.

If a material second architecture is required, stop. Do not broaden the Work.

## Apps Script control-plane recovery

Only after the pre-sync gate passes:

1. prove the same Apps Script project identity and authenticated account context;
2. inventory deployments by authoritative entrypoint type;
3. positively identify the existing private `WEB_APP` with `/exec` at version `31`;
4. exclude all Library or ambiguous deployments;
5. read back saved source and record that it is the known stale CODEX-01 sync, not the final Git source;
6. synchronize the exact final tested source exactly once;
7. perform disposable exact readback of the synchronized source;
8. create exactly one immutable version; expected next version is `32` if no external version was added;
9. update the same existing private Web App deployment in place;
10. preserve execute-as deploying user and access `Only myself`;
11. do not create a second Web App deployment or touch Library deployments.

If project/deployment identity is ambiguous, stop before mutation.

## Synthetic target schema 4 alignment

Do not create a public/debug wrapper, API executable, or new deployment merely to run setup.

Preferred route:

- use an already-approved private admin execution surface if one is safely available.

If the private setup function remains unavailable, the following bounded synthetic target data-plane alignment is explicitly authorized:

1. snapshot Backend headers/rows, Settings, installation-state property, Audit, Drive source inventory, triggers, and deployment metadata;
2. append exactly these `Meeting_Index` headers, in order, only if absent:
   - `Counterparty_Type`;
   - `Counterparty_ID`;
   - `Related_GP_IDs`;
3. for legacy Meeting rows with existing `GP_ID` and blank new fields, backfill only:
   - `Counterparty_Type = GP`;
   - `Counterparty_ID = existing GP_ID`;
   - `Related_GP_IDs = existing GP_ID`;
4. do not change Meeting IDs, Doc/File IDs, filenames, Status, Version, timestamps, AI fields, or unrelated cells;
5. align the existing `Settings` schema-version value to `4` using its established key/format;
6. only after data readback passes, edit only `KSP_INSTALLATION_STATE_JSON.schemaVersion` to `4`; preserve all resource/config IDs and unrelated fields;
7. read back once and prove an idempotent second evaluation would make no data change;
8. keep exactly five Backend sheets.

Record which route was used. Do not claim private setup execution if it was not observed.

## Bounded authenticated runtime campaign

Use the updated existing `/exec`. Use only synthetic/anonymized target records.

### A. Main-page and legacy GP gate

- open `/exec` once and confirm normal render;
- reopen one accepted legacy GP Meeting;
- verify `Counterparty Type = GP`, existing GP as Entity, and the same GP in Related GP;
- verify stable Meeting ID, Doc/File identity, status, existing filename, and source content remain intact;
- confirm GP Workspace still shows its accepted direct GP records correctly.

### B. One non-GP Entity through the normal path

- add exactly one uniquely named synthetic `LP / Asset Owner` through the normal Meeting quick-add/Master path;
- confirm it is selected automatically, reusable, and stored once in the corresponding Option Master Type;
- confirm quick-add leaves no stale retry fingerprint.

### C. One non-GP Meeting

Create exactly one synthetic non-GP Meeting with:

- Counterparty Type `LP_ASSET_OWNER`;
- the new synthetic Entity;
- one existing synthetic Related GP;
- an Asset Class chosen so one existing Active Pitchbook from that Related GP is eligible;
- exactly one matching Related Pitchbook;
- one non-empty Fund / Strategy or another harmless structured field;
- synthetic person/role and body content only.

Verify exactly one Meeting Doc and one Meeting_Index row, no duplicate, and:

- `GP_ID` blank;
- typed Counterparty fields correct;
- Related GP correct;
- related Pitchbook stable Document ID correct;
- filename uses Counterparty display name;
- Doc uses the new Counterparty labels;
- Audit is metadata-only and excludes body/follow-up note;
- no live Gemini/File Search call.

### D. Reopen, one edit, exact search

- reopen the same Meeting;
- verify all fields and relationship round-trip;
- edit exactly one non-identity field once;
- search exactly by Counterparty Type + Counterparty Entity + Related GP;
- require exactly one target and verify the edited field;
- do not create a second Meeting to work around browser/harness noise.

### E. Export and deterministic AI metadata readback

Without billing-enabled Gemini calls:

- verify the Meeting's deterministic metadata contains `entity_key`, `counterparty_type`, `counterparty_id`, `counterparty_name`, and `related_gp_ids`;
- verify Knowledge Export preview/render metadata resolves Counterparty Type/Entity and Related GP correctly;
- do not create unnecessary Drive export artifacts merely for this check.

## Final integrity

Compare against the pre-campaign snapshot and prove:

- exactly five Backend sheets;
- canonical schema 4 headers;
- legacy GP backfill only where expected;
- exactly one new non-GP Option row;
- exactly one new non-GP Meeting row and Doc;
- only the one authorized Meeting edit/version advance;
- expected counters only;
- expected metadata-level Audit events only;
- no duplicate stable IDs, rows, Docs, files, or options;
- existing GP/Pitchbook/Meeting source identities intact;
- no unexpected Settings, Script Property, trigger, AI/store, permission, or Drive mutation;
- exactly one immutable version and one in-place Web App update in this dispatch;
- Library deployments unchanged.

## Stop rules

- one final pre-sync repair loop covering the four listed findings;
- one source synchronization;
- one immutable version;
- one in-place Web App update;
- one synthetic Entity;
- one synthetic Meeting;
- one edit;
- stop on the first actual application/data-integrity defect after deployment;
- do not perform a second source sync or open a second implementation hypothesis in this dispatch;
- classify browser/Computer Use limitations separately when authoritative readback proves application behavior.

## Reporting and GitHub delivery

Create/update:

- `docs/handoffs/0016-CODEX-02-final-corrected-sync-and-runtime-qualification-report.md`;
- `docs/handoffs/0016-report.md`;
- `docs/handoffs/0016-instruction.md`;
- `docs/handoffs/0016-dispatches.md`;
- Draft PR #21 body.

Commit and push all scoped source/test/report/status changes to the assigned branch.

Keep PR #21 Draft / Open / unmerged. ChatGPT owns final review and merge.

On complete PASS classify:

`DEV QUALIFIED — WORK 0016 COUNTERPARTY ENTITY FOUNDATION`

- `LOGIC_VALIDATION: PASS`;
- `TARGET_RUNTIME_QUALIFICATION: PASS`;
- `SIDE_EFFECT_STATE: GUARDED`;
- `READY: YES`;
- `BLOCKER: NO`.

Production readiness is not claimed.

WORK_ID: `0016`
DISPATCH_ID: `0016-CODEX-02`
BALL: `CODEX`
STATUS: `READY`
