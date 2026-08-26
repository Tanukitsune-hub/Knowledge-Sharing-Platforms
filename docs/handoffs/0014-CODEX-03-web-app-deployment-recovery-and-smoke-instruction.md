# Work 0014 — CODEX-03 Web App deployment recovery and synthetic DEV smoke

WORK_ID: `0014`
Dispatch ID: `0014-CODEX-03`
BALL: `CODEX`
STATUS: `READY`

Repository: `Tanukitsune-hub/Knowledge-Sharing-Platforms`

Mode: `QUALIFICATION / INCIDENT_RECOVERY`

Route: `C — one bounded Apps Script Web App deployment recovery, then synthetic DEV smoke`.

Recommended model: `Luna Max`.

Rationale: application implementation, deterministic validation, source synchronization, schema-3 data migration, and installation-state alignment are already accepted. The remaining work is a settled control-plane recovery action plus bounded live verification. Do not investigate why the prior Web App deployment is absent unless the one authorized recovery action itself fails.

## Primary outcome

Restore one normal versioned synthetic DEV Web App `/exec` execution surface from the already-tested/frozen source, then complete the previously deferred Work 0014 normal-UI smoke and integrity checks.

## Strategy Reset

New direct evidence from `0014-CODEX-02` contradicts the earlier assumption that an active Web App deployment still exists:

- active deployment list exposes Library entry points only;
- immutable version `26` exists but no active Web App `/exec` exists;
- this is a deployment/control-plane state issue, not an application-source defect.

Preserve all accepted evidence below. Reopen only the Web App deployment existence conclusion.

Do not perform root-cause archaeology for why the previous Web App deployment disappeared. Follow:

`docs/operations/apps-script-web-app-deployment.md`

## Accepted evidence — do not reopen

- Work 0014 application implementation: PASS.
- `npm run check`: `176/176 PASS`.
- public facade: `23` functions, unchanged.
- `git diff --check`: PASS.
- independent regression/security review: PASS.
- persistent schema version `3`: accepted.
- deterministic append-only/idempotent migration: PASS.
- Meeting create/edit/search/draft/retry deterministic coverage: PASS.
- Pitchbook Fund / Strategy deterministic coverage: PASS.
- relationship behavior deterministic coverage: PASS.
- legacy compatibility: PASS.
- exact `59/59` source synchronization to the identity-confirmed synthetic DEV Apps Script project: PASS.
- immutable Apps Script version `26`: accepted pre-recovery source version.
- ChatGPT-applied synthetic DEV data-plane schema-3 migration: PASS/read back.
- `KSP_INSTALLATION_STATE_JSON.schemaVersion = 3`: PASS/read back in CODEX-02.
- production Shared Drive-only storage decision remains accepted and unchanged; this dispatch is synthetic DEV only.

## Current Google deployment-versioning rule

Google Apps Script editor automatically creates a new immutable version when a new deployment is created. Therefore a new Web App deployment through the approved editor UI is expected to create version `27` from the currently saved/frozen source.

Before deployment, verify the latest immutable version is still `26`. If another version already exists, STOP and return to ChatGPT before creating a deployment.

No source edit, save/push change, or ref synchronization is authorized before deployment. The new version must therefore represent the already-tested/frozen saved source.

## Source freeze

Application source, tests, manifest, schema design, public facade, Script Properties, backend data model, and deployment code are FROZEN.

Do not:

- edit any `.gs`, `.html`, manifest, test, or schema source;
- manually create a version before deployment;
- push or pull source;
- change Script Properties;
- create API executable or public/debug wrapper;
- delete, update, or repurpose Library deployments;
- create more than one Web App deployment;
- use `/dev` as a prerequisite;
- change production/Shared Drive settings.

## One authorized deployment mutation

The user explicitly authorizes Codex to deploy the synthetic DEV Web App.

Use the already identity-confirmed Apps Script project and the confirmed single-account editor context.

1. Verify latest immutable version is `26` and the remote saved source is still the accepted Work 0014 source. Do not modify it.
2. Open `Deploy` → `New deployment` in the Apps Script editor.
3. Select deployment type `Web app` explicitly.
4. Execute as: deploying user.
5. Access: `Only myself` for this synthetic DEV qualification.
6. Use one concise synthetic DEV description; no private IDs/URLs in GitHub/report.
7. Deploy exactly once. Google is expected to create exactly one new immutable version, `27`, as part of this new deployment.
8. Read back deployment metadata and confirm:
   - exactly one new deployment was added;
   - entrypoint type is Web App, not Library;
   - deployment version is `27`;
   - execute-as/access match the required boundary;
   - it exposes a normal `/exec` endpoint;
   - existing Library deployments are unchanged.

If the latest pre-deploy version is not `26`, the resulting new version is not `27`, deployment creation fails, or the resulting entrypoint is not a versioned Web App `/exec`, STOP. Do not create a second deployment and do not change source.

## Web App recovery gate

Open the newly generated `/exec` exactly once.

PASS requires:

- normal main page renders;
- no page-not-found / Library endpoint behavior;
- no visible application fatal error;
- no authoritative Meeting/Pitchbook mutation merely from opening the main page.

If the main page does not render, STOP immediately. Do not create a second deployment, refresh-loop, change source, or test `/dev`.

## Work 0014 synthetic DEV smoke

Only after the recovery gate passes, continue the normal-UI smoke on the same `/exec`.

### A. Legacy Meeting

- open one existing legacy Meeting;
- verify the new optional Work 0014 fields are blank/unset where expected;
- confirm the record remains readable/editable;
- do not alter unrelated legacy content.

### B. Rich Meeting create

Create exactly one synthetic Meeting with:

- Team selected;
- non-empty Fund / Strategy;
- at least two Meeting type flags;
- at least one Related Pitchbook if a valid matching synthetic Active Pitchbook exists;
- `要フォロー` enabled;
- synthetic follow-up note.

PASS requires exactly one Meeting row and exactly one source Google Doc, with no duplicate.

### C. Reopen / edit / search

- reopen the new Meeting;
- verify Team, Fund / Strategy, Meeting types, relationship IDs, follow-up flag/note round-trip;
- edit one structured field and save once;
- search using Team + Meeting type + follow-up-only filters;
- verify Fund / Strategy and relationship display remain correct.

### D. Relationship preservation

If a safe synthetic linked Pitchbook exists:

- temporarily inactivate that linked Pitchbook once;
- reopen/edit the Meeting;
- verify the existing relationship is preserved;
- restore the synthetic Pitchbook once.

If no safe candidate exists, classify only this item:

`DEFERRED — SAFE SYNTHETIC RELATIONSHIP TOGGLE NOT AVAILABLE`

This item alone is non-blocking because deterministic coverage is already accepted.

### E. Pitchbook Fund / Strategy

Create or edit exactly one synthetic Pitchbook with non-empty Fund / Strategy and verify normal search/reopen round-trip.

Do not rerun upload-size qualification.

### F. Final integrity

Read back and confirm:

- no duplicate Meeting/Pitchbook rows or files;
- expected ID counters advanced only by smoke actions actually performed;
- legacy rows remain intact;
- exactly five Backend sheets remain;
- schema-3 headers remain canonical;
- TEAM PD/AE seeds remain present without duplicate;
- no unexpected AI/store/trigger mutation;
- Audit contains only expected metadata-level events;
- Follow_Up_Note text is not duplicated into Audit metadata/body;
- exactly one Web App deployment and one automatically generated version were added in this dispatch;
- existing Library deployments remain untouched.

## Stop conditions

Stop immediately on the first actual application/data-integrity defect or deployment-recovery failure.

Do not open a second source hypothesis or create a second deployment in this dispatch.

## Completion

If Web App recovery, required normal-UI smoke, and final integrity PASS, classify:

`DEV QUALIFIED — WORK 0014 STRUCTURED CONTEXT FOUNDATION`

`BLOCKER: NO`

A relationship-toggle DEFERRED due to lack of a safe synthetic candidate is allowed and non-blocking.

Shared Drive-specific production qualification and billing-enabled Gemini/File Search qualification remain outside Work 0014. Production readiness is not claimed.

## Reporting / delivery

Create/update:

- `docs/handoffs/0014-CODEX-03-web-app-deployment-recovery-and-smoke-report.md`;
- `docs/handoffs/0014-report.md`;
- `docs/handoffs/0014-instruction.md`;
- `docs/handoffs/0014-dispatches.md`;
- Draft PR #17 body.

Do not record raw Apps Script project ID, deployment ID, `/exec` URL, account identifiers, OAuth material, cookies, or credentials.

Commit/push report-only/status changes to `agent/0014-structured-meeting-context-foundation`.

Keep PR #17 Draft / Open / unmerged. ChatGPT owns final review and merge.

Completion response must contain only:

- Work ID;
- Dispatch ID;
- Web App deployment recovery result;
- created version result;
- main-page `/exec` gate result;
- legacy Meeting smoke result;
- rich Meeting round-trip result;
- relationship live result;
- Pitchbook Fund / Strategy live result;
- final integrity result;
- report path;
- final commit;
- branch;
- Draft PR;
- `BLOCKER: YES / NO`;
- one-line evidence for any FAIL/DEFERRED item.
