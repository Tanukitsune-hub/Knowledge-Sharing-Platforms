# Work 0016 — CODEX-04 Audit date canonicalization and final integrity

WORK_ID: `0016`
DISPATCH_ID: `0016-CODEX-04`
BALL: `CODEX`
STATUS: `READY`
MODE: `BUILD / QUALIFICATION`

Repository: `Tanukitsune-hub/Knowledge-Sharing-Platforms`

Branch: `agent/0016-counterparty-entity-foundation`

Draft PR: `#21`

Recommended model: `Luna Max` — root cause is now concrete and the remaining implementation/runtime work is narrow and deterministic.

## Primary outcome

Finish Work 0016 by correcting the final Meeting Audit representation defect and proving final integrity without reopening already accepted behavior.

Residual path:

`canonicalize Meeting Audit Date/Time snapshot -> focused/full validation -> one exact source sync -> one immutable version -> same private WEB_APP update in place -> reuse existing synthetic Meeting for one final verification edit -> verify latest Audit -> final integrity -> report/push/PR update`.

## Accepted evidence — do not reopen

Keep all CODEX-03 PASS evidence closed unless directly contradicted:

- schema 4 and exactly five Backend sheets: PASS;
- installation-state schemaVersion 4: PASS;
- legacy GP compatibility: PASS;
- GP Workspace compatibility: PASS;
- Counterparty Entity model and non-GP create/reopen: PASS;
- Related GP / matching Related Pitchbook: PASS;
- client edit-state repair: PASS;
- same synthetic non-GP Meeting edited once and advanced to Version 2: PASS;
- exact Counterparty Type + Entity + Related GP search: PASS;
- Knowledge Export Preview/read-only metadata: PASS;
- deterministic entity/counterparty/Related GP metadata: PASS;
- Audit redaction of Meeting body and Follow-up note: PASS;
- public facade: `24`;
- CODEX-03 deterministic validation: focused `21/21`, canonical `213/213`, `git diff --check` PASS;
- exact deployable-source readback: `62/62`;
- existing private Web App is on immutable version `33`;
- no Gemini/File Search call or trigger enablement occurred.

Do not create another synthetic Entity or Meeting. Do not repeat search/Export/GP Workspace qualification merely for completeness.

## Confirmed root cause

`src/100_MaintenanceCore.gs::kspMeetingAuditSnapshot_()` currently snapshots:

```js
Date: row.Date || ''
Time: row.Time || ''
```

The pre-edit live Sheets row can carry a `Date` object while the committed edited row carries the same logical business date as `YYYY-MM-DD`. `kspChangedMetadataFields_()` compares serialized values, so the same logical date is falsely reported as changed.

The Pitchbook Audit path already canonicalizes Date. Meeting search/read models also use `kspMaintenanceCellText_()`.

## Required repair

Make one narrow representation-normalization repair in the Meeting Audit snapshot:

- canonicalize Meeting `Date` using the existing configured-timezone maintenance date contract;
- canonicalize Meeting `Time` through the existing maintenance time contract as the same representation class, so a Sheets Date object and an equivalent `HH:MM` string do not create a false Audit change;
- do not alter `kspChangedMetadataFields_()` globally;
- do not alter Meeting persistence semantics, schema, concurrency, filenames, Docs, or public facade.

Preferred form:

```js
Date: kspMaintenanceCellText_(row.Date, 'date')
Time: kspMaintenanceCellText_(row.Time, 'time')
```

or an exactly equivalent reuse of the existing authoritative normalization helpers.

## Required regressions

Add focused executable coverage that proves:

1. `kspMeetingAuditSnapshot_()` produces the same logical Date for a Sheets-like Date object and `YYYY-MM-DD` string representing the same Asia/Tokyo business date;
2. equivalent nonblank Time represented as a Date object and `HH:MM` string does not create a false `Time` change;
3. an `Internal_Participants`-only Meeting update starting from a Sheets-like Date row does **not** list `Date` or `Time` in `Changed_Fields`;
4. that update does list the actual user field plus expected technical fields (`Version`, `Updated_At`);
5. Before/After Audit Date values are both canonical `YYYY-MM-DD`;
6. Meeting body and Follow-up note remain absent from Audit.

Do not weaken existing assertions.

## Deterministic gate

Before Apps Script mutation:

- run focused Meeting/Maintenance tests;
- run `npm run check`;
- run `git diff --check`;
- confirm public facade remains exactly `24`;
- inspect the final relevant diff once;
- confirm no unrelated source change.

## Runtime control plane

Only after deterministic PASS:

1. positively identify the same Apps Script project and existing private `WEB_APP` currently on version `33`;
2. exclude Library/ambiguous deployments;
3. synchronize the exact final tested source once;
4. exact deployable-source readback;
5. create exactly one immutable version; expected next version is `34` if no external version was created;
6. update the same private Web App deployment in place;
7. do not create a second Web App deployment.

## Minimal target-runtime verification

Reuse the existing synthetic LP / Asset Owner and the existing synthetic non-GP Meeting from CODEX-02/03. It should currently be Active at Version 2.

Do exactly one additional normal non-identity edit on that same Meeting, preferably changing `Internal_Participants` to another harmless synthetic value.

Verify:

- same Meeting ID;
- Version advances exactly once from 2 to 3;
- no duplicate Meeting/Doc/Entity;
- latest successful `MEETING_UPDATE` Audit event has canonical Before/After Date values;
- latest `Changed_Fields` excludes `Date` and `Time` when they were not edited;
- latest `Changed_Fields` includes `Internal_Participants`, `Version`, and `Updated_At`;
- no body text or Follow-up note appears in Audit.

The earlier CODEX-03 Audit event containing the false `Date` change is historical qualification evidence. **Do not edit, delete, or repair that prior Audit row.** Record it as a known pre-fix event and prove the new post-fix event is correct.

Do not create another Entity or Meeting. Do not call Gemini/File Search. Do not enable triggers.

## Final integrity

Perform one final readback and require:

- exactly five Backend sheets and schema 4 unchanged;
- installation-state schemaVersion 4 unchanged;
- exactly one synthetic non-GP Entity and one synthetic non-GP Meeting;
- target Meeting Active, same stable IDs/source Doc/relationship, Version 3 after the one authorized verification edit;
- GP Master and Pitchbook Index unchanged;
- no duplicate IDs, filenames, Docs, or options;
- only expected setting/counter state from prior accepted work;
- old malformed CODEX-03 Audit event preserved unchanged;
- one new correct post-fix Meeting update Audit event only;
- no unexpected Audit, Drive, Script Property, trigger, AI/store, permission, version, or deployment mutation;
- no Gemini/File Search action;
- exactly one source sync, one new immutable version, and one in-place Web App update in CODEX-04.

## Stop rules

- one source repair hypothesis only: Meeting Audit representation canonicalization;
- one deterministic repair loop for concrete failures caused by that patch;
- one source sync;
- one immutable version;
- one in-place Web App update;
- one verification edit on the existing Meeting;
- no new test records;
- stop on any new material application/data-integrity defect rather than broadening scope.

## Delivery

Create:

`docs/handoffs/0016-CODEX-04-audit-date-canonicalization-and-final-integrity-report.md`

Update:

- `docs/handoffs/0016-report.md`;
- `docs/handoffs/0016-instruction.md`;
- `docs/handoffs/0016-dispatches.md`;
- Draft PR #21 body.

Commit and push all scoped source/tests/docs changes. Keep PR #21 Draft / Open / unmerged for ChatGPT final review.

On full PASS classify:

`DEV QUALIFIED — WORK 0016 COUNTERPARTY ENTITY FOUNDATION`

- `LOGIC_VALIDATION: PASS`;
- `TARGET_RUNTIME_QUALIFICATION: PASS`;
- `SIDE_EFFECT_STATE: GUARDED`;
- `READY: YES`;
- `BLOCKER: NO`.

Production readiness is not claimed.

WORK_ID: `0016`
DISPATCH_ID: `0016-CODEX-04`
BALL: `CODEX`
STATUS: `READY`
