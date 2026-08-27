# Work 0016 — Counterparty entity foundation

WORK_ID: `0016`
DISPATCH_ID: `0016-CODEX-02`
MODE: `BUILD / QUALIFICATION`
BALL: `CODEX`
STATUS: `READY`

Repository: `Tanukitsune-hub/Knowledge-Sharing-Platforms`

Primary design: `docs/planning/work0016-counterparty-entity-foundation.md`

Authoritative decision: `docs/decisions/counterparty-entity-classification.md`

Active execution instruction:

`docs/handoffs/0016-CODEX-02-final-corrected-sync-and-runtime-qualification-instruction.md`

## Primary outcome

Replace the global Meeting GP requirement with the accepted two-stage identity:

`Counterparty Type -> Counterparty Entity`

and prove it end-to-end for one legacy GP Meeting and one new non-GP Meeting in the existing authenticated private Apps Script Web App.

## Completion evidence

Work is complete only when all are true:

1. final source passes focused tests, `npm run check`, `git diff --check`, and public facade remains `24`;
2. exact tested source is synchronized/read back, one immutable version is created, and the existing private `WEB_APP` is updated in place;
3. schema 4 and blank-only legacy GP migration are aligned/read back idempotently in the synthetic target;
4. one legacy GP Meeting retains stable identity and resolves its new Counterparty fields;
5. exactly one non-GP Entity and Meeting persist/reopen/edit/search with one Related GP and explicit Pitchbook relationship;
6. filename, Doc, Index, Audit, Export, and deterministic AI metadata agree;
7. final integrity shows only expected guarded mutations and no duplicate/unexpected state.

Logic-only PASS is insufficient.

## Closed conclusions

- exactly five Backend sheets;
- GP entities remain in `GP_Master`;
- non-GP entities use category-specific `Option_Master` Types;
- no Entity/Counterparty/relation sheet;
- stable composite entity identity is `Counterparty_Type + ':' + Counterparty_ID`;
- existing `Counterparty` remains person/role free text;
- legacy GP rows are backfilled only when new fields are blank;
- Pitchbook remains GP-required;
- Related Pitchbook relationships remain in `Meeting_Index.Related_Pitchbook_IDs`;
- no follow-up workflow, analytics, Entity Workspace, live Gemini qualification, or production rollout in this Work.

## Accepted CODEX-01 evidence

- coherent broad implementation is present;
- deterministic result recorded locally: `211/211 PASS`;
- public facade: `24`;
- schema/migration, legacy GP, non-GP, relationship, search/edit/reopen, GP Workspace, Export/Audit/AI metadata logic: deterministic PASS;
- one saved-source sync occurred before final review fixes;
- no immutable version or deployment update;
- target Web App remains version `31`;
- no target data/trigger/permission/AI-store mutation;
- target-runtime qualification and final integrity: not run.

## ChatGPT final pre-sync review findings

CODEX-02 must close these before synchronization:

1. `kspMeetingCellDate_()` must use the configured `Asia/Tokyo` logical-date contract rather than UTC calendar getters, with a Sheets-like Date regression;
2. Counterparty code `GP` must display as the accepted `GP / 運用会社` label everywhere relevant;
3. Related Pitchbook registration guidance must describe the actual `Related GP + Asset Class` rule;
4. Counterparty quick-add must clear stale Meeting retry state before saving the changed draft.

Do not sync until these fixes and the final relevant diff review pass.

## Authorization and boundary

After deterministic PASS, CODEX-02 may:

- synchronize exact tested source once;
- create one immutable version;
- update the same positively identified private Web App in place;
- align synthetic schema 4 and only the corresponding installation-state schemaVersion;
- add one synthetic non-GP Entity and Meeting and edit it once;
- write only expected metadata-level Audit/state changes.

It may not:

- create another Web App deployment;
- touch Library deployments;
- use confidential/company data;
- change broad permissions;
- enable triggers;
- call billing-enabled Gemini/File Search;
- physically delete or bulk migrate data;
- perform production rollout.

## Current status

`LOGIC_VALIDATION: PASS` for the CODEX-01 local tree, subject to rerun after the four final repairs.

`TARGET_RUNTIME_QUALIFICATION: NOT RUN`

`SIDE_EFFECT_STATE: BOUNDED — stale saved-source sync only; version/deployment/data unchanged`

`READY: NO`

`BLOCKER: YES`

Active ball is CODEX-02. On full PASS apply:

`DEV QUALIFIED — WORK 0016 COUNTERPARTY ENTITY FOUNDATION`

Keep PR #21 Draft / Open / unmerged for ChatGPT final review.
