# Work 0016 — CODEX-03 edit-state property check and final qualification

WORK_ID: `0016`
DISPATCH_ID: `0016-CODEX-03`
BALL: `CODEX`
STATUS: `READY`
MODE: `QUALIFICATION` with one bounded repair path only if direct runtime evidence proves a real source defect

Repository: `Tanukitsune-hub/Knowledge-Sharing-Platforms`

Branch: `agent/0016-counterparty-entity-foundation`

Draft PR: `#21`

Recommended model: `Sol High` — the product architecture is closed, but the remaining blocker is an unresolved target-runtime observation/root-cause question rather than routine implementation.

## Primary outcome

Finish Work 0016 without creating more scope:

`resolve edit-state observation -> complete the already-started non-GP edit/search/export checks -> final integrity -> report/push/PR update`.

Reuse the exact synthetic LP Entity and non-GP Meeting already created in CODEX-02. Do not create another Entity, Meeting, Pitchbook, Web App deployment, or test dataset merely to repeat qualification.

## Accepted evidence — do not reopen

From CODEX-01/02 and ChatGPT GitHub review:

- broad Counterparty Entity implementation is present;
- focused validation `89/89 PASS` and canonical `212/212 PASS`;
- public facade exactly `24`;
- exact deployable-source readback `62/62`;
- schema `4`, exactly five Backend sheets, installation-state schemaVersion `4`;
- existing private Web App updated in place to immutable version `32`;
- legacy GP compatibility PASS;
- GP Workspace compatibility PASS;
- exactly one synthetic LP / Asset Owner Entity exists;
- exactly one synthetic non-GP Meeting exists with one Related GP and one matching Related Pitchbook;
- that Meeting was created and reopened successfully; visible structured fields and relationship values round-tripped;
- the Meeting remained Active at Version `1` after CODEX-02; no edit/save retry, duplicate row, duplicate Entity, extra update Audit event, Gemini/File Search call, trigger enablement, second sync/version/deployment occurred;
- PR #21 is Draft/Open/unmerged and branch is not behind main;
- GitHub Actions/status checks are not configured, so deterministic PASS values are local observed evidence.

Do not repeat source sync/version/deployment or schema migration unless the direct property check below proves a genuine application defect and a source repair is actually required.

## ChatGPT independent review of the CODEX-02 blocker

GitHub source at the CODEX-02 final commit shows `openMeetingEdit()` performs these assignments synchronously from the same `r` object:

```js
el('meeting-edit-meetingId').value = r.meetingId;
el('meeting-edit-expectedVersion').value = r.version;
el('meeting-edit-id').textContent = r.meetingId + ' / Version ' + r.version;
```

The runtime heading was observed with the expected Meeting ID and Version 1. The hidden inputs are declared once in `MaintenancePages.html`, and the reviewed PR diff contains no later path that intentionally clears those hidden edit values after `openMeetingEdit()`.

A programmatic assignment to an input's `.value` property does not require the serialized HTML `value` attribute to change. Therefore CODEX-02's "blank hidden controls" observation is not sufficient by itself to prove an application defect if it inspected attributes/markup rather than the live DOM property.

Treat the blocker as **unresolved observation ambiguity** until the exact live `.value` properties are checked.

## Step 1 — decisive no-write property check on version 32

Use the existing authenticated private `/exec` at version `32`. Do not synchronize source or create a version first.

Reopen the exact existing synthetic non-GP Meeting once through the normal Past Meeting -> Edit path.

After the edit card has settled, inspect in page context (not markup serialization, not accessibility text, not `getAttribute('value')` alone):

```js
const id = document.getElementById('meeting-edit-meetingId');
const ver = document.getElementById('meeting-edit-expectedVersion');
({
  meetingIdProperty: id && id.value,
  meetingIdAttribute: id && id.getAttribute('value'),
  meetingIdDefaultValue: id && id.defaultValue,
  versionProperty: ver && ver.value,
  versionAttribute: ver && ver.getAttribute('value'),
  versionDefaultValue: ver && ver.defaultValue,
  heading: document.getElementById('meeting-edit-id')?.textContent || ''
})
```

Acceptance for this step:

- `meetingIdProperty` equals the reopened Meeting ID;
- `versionProperty` equals `1` before the edit;
- heading names the same Meeting and Version 1.

It is acceptable and expected for the HTML `value` attribute/default value to be blank if the live `.value` property is correct.

### If the live `.value` properties are correct

Classify CODEX-02's blocker as an observer/attribute-vs-property limitation, not an application defect.

Do **not** modify source, synchronize Apps Script, create version 33, or update the deployment. Continue directly to the remaining qualification on version 32.

### If either live `.value` property is genuinely blank

Then the application defect is confirmed.

Before any mutation:

1. capture the heading and both live properties;
2. identify the concrete source-level cause from the actual runtime/source path;
3. use only one minimal repair hypothesis;
4. add a regression that executes the client edit-open state sufficiently to prove both live values are populated from the returned record, not merely a regex assertion.

Then run focused tests, `npm run check`, `git diff --check`, and final diff review.

Only if that bounded repair passes may you:

- synchronize the exact repaired source once;
- read back exact match;
- create exactly one new immutable version (expected `33` if no external version appeared);
- update the same positively identified private Web App in place;
- preserve deploying-user / Only-myself access;
- create no new deployment and touch no Library deployment.

If the direct property check is blank but no concrete cause can be established within one repair hypothesis, stop and report instead of speculative edits.

## Step 2 — finish the existing non-GP edit/save

Reuse the same synthetic non-GP Meeting. Do not create another one.

After Step 1 establishes valid hidden live properties (either on version 32 or after the one bounded repair):

1. change exactly one non-identity field once (prefer the harmless field planned in CODEX-02, e.g. Fund / Strategy or another already-used structured field);
2. save through the normal edit form once;
3. require successful optimistic-concurrency update;
4. read back the same Meeting ID and source Doc identity;
5. require Version to advance exactly once from `1` to `2`;
6. verify Counterparty Type/Entity, Related GP, Related Pitchbook, filename/source identity, and all other untouched identity fields remain correct;
7. verify exactly one expected Meeting update Audit event and no source body/follow-up-note duplication into Audit.

No save retry unless the application returns an explicit normal concurrency outcome. Do not create another Meeting to bypass UI noise.

## Step 3 — exact post-edit search

Use the normal Past Meeting filters:

- Counterparty Type = the synthetic `LP_ASSET_OWNER`;
- Counterparty Entity = the existing synthetic Entity;
- Related GP = the existing Related GP.

Require exactly one target Meeting and verify the edited field and Version 2.

## Step 4 — Export and deterministic AI metadata

Do not call billing-enabled Gemini/File Search.

Using existing read/preview paths only:

- verify deterministic Meeting metadata contains `entity_key`, `counterparty_type`, `counterparty_id`, `counterparty_name`, `related_gp_ids`;
- run Knowledge Export preview/read-model verification for the same Meeting and confirm Counterparty Type/Entity and Related GP resolve correctly;
- do not create a Drive export artifact merely to prove the preview metadata if preview/read-model evidence is sufficient.

## Step 5 — final integrity

Use the preserved CODEX-02 pre-campaign snapshot/evidence where available and current authoritative readback. Account only for the mutations already accepted in CODEX-02 plus the single authorized edit from this dispatch.

Prove:

- exactly five Backend sheets;
- schema 4 remains canonical;
- installation-state schemaVersion remains 4;
- exactly one synthetic non-GP Option Entity total;
- exactly one synthetic non-GP Meeting row and source Doc total;
- that Meeting is Active at Version 2 after the one edit;
- exactly the expected create/edit Audit events, metadata-only;
- no duplicate stable IDs, rows, Docs, files, or Options;
- legacy GP and existing Pitchbook/Meeting identities unchanged;
- expected counters only;
- no unexpected Settings, Script Property, trigger, AI/store, permission, Drive, deployment, or Library mutation;
- if no source repair was needed, Web App remains version 32 and this dispatch creates no source sync/version/deployment mutation;
- if a confirmed source repair was needed, exactly one sync, one new immutable version, and one in-place Web App update occurred in this dispatch.

## Validation / reporting

If no source changed, do not rerun broad deterministic tests merely for ceremony; the accepted `212/212` evidence remains closed. Run only any small diagnostic/client check materially needed to support the final conclusion.

If source changed, rerun focused tests plus canonical `npm run check` and `git diff --check` before synchronization.

Create:

`docs/handoffs/0016-CODEX-03-edit-state-property-check-and-final-qualification-report.md`

Update:

- `docs/handoffs/0016-report.md`
- `docs/handoffs/0016-instruction.md`
- `docs/handoffs/0016-dispatches.md`
- Draft PR #21 body

Commit and push all scoped report/status changes and any genuinely necessary source/test repair.

Keep PR #21 Draft / Open / unmerged. ChatGPT owns final review and merge.

## Stop rules

- no new Entity or Meeting;
- one direct live-property observation;
- if property is correct: zero source sync/version/deployment changes;
- if property is truly blank: one source hypothesis, one repair loop, at most one source sync/version/in-place deployment update;
- one Meeting edit/save;
- one exact search;
- one Export preview/read-model check;
- one final integrity pass;
- do not reopen accepted architecture or earlier evidence without material contradiction.

On full PASS classify:

`DEV QUALIFIED — WORK 0016 COUNTERPARTY ENTITY FOUNDATION`

- `LOGIC_VALIDATION: PASS`;
- `TARGET_RUNTIME_QUALIFICATION: PASS`;
- `SIDE_EFFECT_STATE: GUARDED`;
- `READY: YES`;
- `BLOCKER: NO`.

Production readiness is not claimed.

WORK_ID: `0016`
DISPATCH_ID: `0016-CODEX-03`
BALL: `CODEX`
STATUS: `READY`
