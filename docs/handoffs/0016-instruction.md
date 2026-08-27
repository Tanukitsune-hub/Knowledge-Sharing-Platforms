# Work 0016 — Counterparty entity foundation

WORK_ID: `0016`
DISPATCH_ID: `0016-CODEX-03`
MODE: `BUILD / QUALIFICATION`
BALL: `CODEX`
STATUS: `RETURNED / BLOCKED`

Repository: `Tanukitsune-hub/Knowledge-Sharing-Platforms`

Primary design: `docs/planning/work0016-counterparty-entity-foundation.md`

Authoritative decision: `docs/decisions/counterparty-entity-classification.md`

Active execution instruction:

`docs/handoffs/0016-CODEX-03-edit-state-property-check-and-final-qualification-instruction.md`

## Primary outcome

Replace the global Meeting GP requirement with the accepted two-stage identity:

`Counterparty Type -> Counterparty Entity`

and prove it end-to-end for one legacy GP Meeting and the single synthetic non-GP Meeting already created in CODEX-02.

## Completion evidence

Work is complete only when all are true:

1. accepted logic evidence remains valid and any new source repair, if required, is fully revalidated;
2. schema 4 / five-sheet Backend / installation-state schemaVersion 4 remain correct;
3. legacy GP Meeting compatibility remains intact;
4. the existing synthetic non-GP Meeting persists/reopens/edits/searches with its Related GP and explicit Pitchbook relationship;
5. filename, Doc, Index, Audit, Export, and deterministic AI metadata agree;
6. final integrity shows only expected guarded mutations and no duplicate/unexpected state;
7. no BLOCKER remains.

## Closed conclusions

- exactly five Backend sheets;
- GP entities remain in `GP_Master`;
- non-GP entities use category-specific `Option_Master` Types;
- no Entity/Counterparty/relation sheet;
- stable composite identity is `Counterparty_Type + ':' + Counterparty_ID`;
- existing `Counterparty` remains person/role free text;
- legacy GP rows are backfilled only when new fields are blank;
- Pitchbook remains GP-required;
- Related Pitchbook relationships remain in `Meeting_Index.Related_Pitchbook_IDs`;
- no follow-up workflow, analytics, Entity Workspace, live Gemini qualification, or production rollout in this Work.

## Accepted evidence through CODEX-02

- focused validation: `89/89 PASS`;
- canonical `npm run check`: `212/212 PASS`;
- `git diff --check`: PASS;
- public facade: `24`;
- exact deployable-source readback: `62/62`;
- schema 4 / five Backend sheets / installation-state schemaVersion 4: PASS;
- existing private Web App updated in place to immutable version `32`;
- legacy GP compatibility: PASS;
- GP Workspace compatibility: PASS;
- exactly one synthetic LP / Asset Owner Entity exists;
- exactly one synthetic non-GP Meeting exists with blank legacy `GP_ID`, typed Counterparty fields, one Related GP, one matching Related Pitchbook, expected filename/Doc representation;
- non-GP Meeting create and reopen: PASS;
- visible structured fields and relationships round-tripped on reopen;
- Meeting remained Active at Version 1 after the CODEX-02 stop;
- no duplicate Entity/Meeting, extra update Audit event, Gemini/File Search call, trigger enablement, second sync/version/deployment occurred.

## Strategy Reset after CODEX-02

CODEX-02 stopped because hidden `meeting-edit-meetingId` and `meeting-edit-expectedVersion` controls were reported blank after reopen.

GitHub review shows `openMeetingEdit()` synchronously sets:

```js
el('meeting-edit-meetingId').value = r.meetingId;
el('meeting-edit-expectedVersion').value = r.version;
el('meeting-edit-id').textContent = r.meetingId + ' / Version ' + r.version;
```

The runtime heading was observed correctly. The reviewed source contains one pair of hidden controls and no later intentional clear of those edit values. A programmatic input `.value` need not be reflected in the serialized HTML `value` attribute.

Therefore the prior observation is reclassified from a confirmed application defect to **unresolved observer-vs-live-property ambiguity** until the actual DOM `.value` properties are read directly.

## CODEX-03 authorization and boundary

First use version 32 without any source synchronization to inspect the live `.value` properties of the two hidden controls after reopening the same synthetic Meeting.

If both properties contain the correct Meeting ID and Version 1:

- no source change is authorized or needed;
- continue the one non-identity edit/save, exact post-edit search, Export preview/read-model metadata verification, and final integrity;
- keep Web App on version 32.

If either live property is genuinely blank:

- capture direct evidence;
- establish one concrete source-level cause;
- use one minimal repair hypothesis only;
- add an executable client regression that proves the live edit-state properties;
- rerun focused + canonical validation;
- at most one exact source sync, one new immutable version, and one in-place existing Web App update are authorized.

Do not create another synthetic Entity or Meeting. Do not create a new deployment, touch Library deployments, enable triggers, call billing-enabled Gemini/File Search, use confidential data, or perform production rollout.

## CODEX-03 outcome

- Direct version 32 property inspection proved both hidden edit identity/version `.value` properties were empty after reopen; the issue was not only an attribute observation limitation.
- The one authorized client-state repair passed focused validation and `npm run check` (`213/213`), synchronized `62/62` files once, created immutable version `33`, and updated the existing private Web App in place.
- The reused synthetic non-GP Meeting completed one edit/save, Version 2 readback, exact Type + Entity + Related GP search, Knowledge Export Preview, Doc metadata, and deterministic metadata checks.
- Final integrity stopped on the first actual defect: the successful update Audit listed `Date` as changed for an `Internal_Participants`-only edit because its Before/After snapshots used different representations of the same Asia/Tokyo business date.

`LOGIC_VALIDATION: PASS`

`TARGET_RUNTIME_QUALIFICATION: BLOCKED — NOT QUALIFIED`

`SIDE_EFFECT_STATE: GUARDED`

`READY: NO`

`BLOCKER: YES — final Audit date representation integrity defect; no second repair or hypothesis was opened.`

Detailed report:

`docs/handoffs/0016-CODEX-03-edit-state-property-check-and-final-qualification-report.md`

Keep PR #21 Draft / Open / unmerged for ChatGPT final review.

WORK_ID: `0016`
DISPATCH_ID: `0016-CODEX-03`
BALL: `CODEX`
STATUS: `READY`
