# Work 0014 — CODEX-05 Web App recovery and final live verification

WORK_ID: `0014`
Dispatch ID: `0014-CODEX-05`
BALL: `CHATGPT`
STATUS: `BLOCKED`

Repository: `Tanukitsune-hub/Knowledge-Sharing-Platforms`

Mode: `INCIDENT_RECOVERY / QUALIFICATION`

Route: `C — authenticated Apps Script Web App recovery, one bounded live Pitchbook verification, and final integrity`.

Recommended model: `Luna Max`.

## Execution outcome

CODEX-05 executed on 2026-08-27. Deployment recovery and the main-page gate passed. The one authorized Fund / Strategy save succeeded with stable identity and one successful metadata-level Audit event, but the one post-save search returned zero rows under the retained exact filters. Reopen verification and final authoritative integrity were stopped at that first failure.

Current classification: `NOT QUALIFIED — PITCHBOOK POST-SAVE SEARCH FAILED`.

`BLOCKER: YES`

Do not resume this dispatch, repeat the save, create another deployment, or investigate a new source hypothesis without a new explicit handoff.

## Primary outcome

Create exactly one verified synthetic DEV Web App deployment from the already-tested source, run the one previously blocked Pitchbook Fund / Strategy save/reopen/search check, complete final authoritative integrity, and close Work 0014 if all evidence passes.

## Accepted evidence — do not reopen

- Work 0014 data model, schema 3, UI scope, and five-sheet architecture are accepted.
- deterministic validation: `179/179 PASS` as recorded by CODEX-04;
- public facade: `23` functions;
- bounded Pitchbook helper repair commit: `4036690cf49555cbc308a16a464606f1da523c0b`;
- current branch/report head before this deferred handoff: `3a208b357ea5e4ab1115818541ed67b67c9b1dd9`;
- tested Apps Script source synchronization/readback: `59/59 PASS`;
- immutable Apps Script version `28` exists;
- schema 3 data-plane migration and installation-state alignment: PASS/read back;
- legacy Meeting live compatibility: PASS;
- rich Meeting create/edit/search live round-trip: PASS;
- Meeting ↔ Pitchbook relationship preservation: PASS;
- the original failed Pitchbook save caused no persisted value, duplicate, partial row update, or file corruption;
- a Library deployment accidentally touched during CODEX-04 was restored to its prior version and description; no live Pitchbook save was consumed in CODEX-04.

Application source, tests, manifest, schema, Script Properties, and product design are frozen in this dispatch.

## Mandatory deployment-type preflight

Follow `docs/operations/apps-script-web-app-deployment.md`.

Before any deployment mutation:

1. confirm the exact Apps Script project identity and single-account editor context;
2. confirm saved remote source still matches the accepted tested source;
3. inventory deployments using authoritative metadata and the editor UI;
4. classify each candidate by entrypoint type, not description, version number, or remembered URL;
5. do not issue any CLI or API update to a deployment unless the selected entrypoint is positively proven to be `WEB_APP` and exposes `/exec`.

If a candidate is Library, ambiguous, or has no `/exec`, it is not an update target. Never update, delete, archive, or repurpose a Library deployment.

## One authorized deployment mutation

Current evidence says no usable Web App entrypoint exists. Therefore create exactly one new deployment through the Apps Script editor:

- type: `Web app`;
- execute as: deploying user;
- access: `Only myself`;
- source: unchanged accepted source;
- no manual extra version creation before deployment;
- Apps Script may create exactly one immutable version automatically; if latest remains `28`, expected new version is `29`;
- no second deployment in this dispatch.

After saving once, read back and prove:

- entrypoint type is Web App;
- execute-as and access match the approved boundary;
- a normal `/exec` endpoint exists;
- existing Library deployments are unchanged;
- exactly one deployment and at most one automatically generated version were added.

If this proof fails, stop. Do not retry, change source, or touch another deployment.

## Main-page gate

Open the newly generated `/exec` exactly once in the same authenticated account context.

PASS requires the normal application main page to render without page-not-found, Library behavior, Drive-open error, or fatal application error.

If the main page does not render, stop immediately. Do not create a second deployment or use `/dev` as a prerequisite.

## One remaining live application check

Run only the Pitchbook Fund / Strategy check that remained unverified after CODEX-04:

1. reopen the same safe synthetic Active Pitchbook used previously;
2. confirm the prior failed Fund / Strategy value is still absent;
3. record privately the current `Document_ID`, `File_ID`, sequence, filename, status, and update token;
4. enter one non-empty synthetic Fund / Strategy value;
5. save exactly once;
6. reopen and search once;
7. verify the value round-trips;
8. verify `Document_ID`, `File_ID`, sequence, filename, and Active status remain unchanged because date/GP/Asset Class/Capital Type were not changed;
9. verify exactly one expected metadata-level successful `PITCHBOOK_UPDATE` Audit event;
10. verify no duplicate or partial row/file mutation.

If the first save fails, stop immediately. Do not retry and do not investigate a second source hypothesis in this dispatch.

Do not rerun completed Meeting, relationship, upload-size, Knowledge Export, Shared Drive, or Gemini qualification.

## Final authoritative integrity

After the Pitchbook check passes, confirm:

- legacy rows and source files remain intact;
- CODEX-03 rich Meeting and relationship evidence remains intact;
- no duplicate Meeting/Pitchbook rows or files;
- counters changed only for already accepted smoke actions;
- exactly five Backend sheets remain;
- schema-3 headers remain canonical;
- TEAM `PD` / `AE` seeds remain unique;
- no unexpected AI/store/trigger/Script Property mutation;
- `Follow_Up_Note` content is absent from Audit;
- exactly one new Web App deployment was created in CODEX-05;
- all Library deployments remain unchanged.

## Completion

If deployment recovery, the one Pitchbook live verification, and final integrity all PASS, classify:

`DEV QUALIFIED — WORK 0014 STRUCTURED CONTEXT FOUNDATION`

`BLOCKER: NO`

Shared Drive-specific production qualification and billing-enabled Gemini/File Search qualification remain outside Work 0014. Production readiness is not claimed.

## Reporting and GitHub delivery

Create/update:

- `docs/handoffs/0014-CODEX-05-web-app-recovery-and-final-live-verification-report.md`;
- `docs/handoffs/0014-report.md`;
- `docs/handoffs/0014-instruction.md`;
- `docs/handoffs/0014-dispatches.md`;
- Draft PR #17 body.

Commit and push only scoped report/status changes after execution. Keep PR #17 Draft / Open / unmerged for ChatGPT final review and merge.

Do not record raw Apps Script IDs, deployment IDs, private URLs, account identifiers, cookies, OAuth material, or credentials.

WORK_ID: `0014`
Dispatch ID: `0014-CODEX-05`
BALL: `CHATGPT`
STATUS: `BLOCKED`
