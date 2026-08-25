# Work 0014 — Structured meeting context foundation

WORK_ID: `0014`
Dispatch ID: `0014-CODEX-03`
BALL: `CODEX`
STATUS: `READY`

Repository: `Tanukitsune-hub/Knowledge-Sharing-Platforms`

Mode: `BUILD / QUALIFICATION / INCIDENT_RECOVERY`

Primary design:

`docs/planning/work0014-structured-meeting-context.md`

Active execution instruction:

`docs/handoffs/0014-CODEX-03-web-app-deployment-recovery-and-smoke-instruction.md`

Deployment guardrails:

`docs/operations/apps-script-web-app-deployment.md`

## Primary outcome

Deliver the structured Meeting/Pitchbook context foundation and prove it end-to-end in synthetic DEV without changing the already-accepted application implementation.

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

## Accepted implementation evidence — do not reopen

- Work 0014 source implementation: PASS;
- deterministic validation: `176/176 PASS`;
- public facade: 23 functions unchanged;
- `git diff --check`: PASS;
- deterministic schema-3 append-only/idempotent migration: PASS;
- deterministic Meeting/Pitchbook/relationship/legacy behavior: PASS;
- exact synthetic DEV source synchronization: `59/59 PASS`;
- immutable Apps Script version `26`: exists;
- ChatGPT-applied synthetic DEV data-plane schema-3 migration: PASS/read back;
- `KSP_INSTALLATION_STATE_JSON.schemaVersion = 3`: PASS/read back;
- existing rows, IDs, counters, statuses, source files, AI/Gemini settings and LAST_SETUP_AT preserved.

## Strategy Reset

Dispatch `0014-CODEX-02` directly observed that the active Apps Script deployment list currently contains Library entry points only. No active Web App `/exec` exists for version 26.

This contradicts the earlier Web App-existence assumption, but it does not contradict application-source, schema, migration, or deterministic evidence. Only the deployment-existence conclusion is reopened.

Do not investigate historical deployment disappearance unless the one approved recovery action fails. Application source is frozen.

The user explicitly authorizes Codex to deploy the synthetic DEV Web App.

## Active decisive action

Dispatch `0014-CODEX-03` must:

1. create exactly ONE new Apps Script deployment of type `Web app`;
2. use existing immutable version `26` — do not create version 27;
3. execute as deploying user;
4. restrict access to `Only myself`;
5. leave all Library deployments untouched;
6. confirm the resulting entrypoint is a normal `/exec` Web App;
7. open `/exec` once and require the main page to render;
8. only after that gate passes, complete the bounded Work 0014 synthetic DEV normal-UI smoke and final integrity readback.

Do not create a second deployment, change source/tests/manifest/schema, change Script Properties, use `/dev` as a prerequisite, or add a public/debug/API executable surface.

## Acceptance evidence remaining

- Web App deployment recovery PASS;
- main-page `/exec` gate PASS;
- legacy Meeting live compatibility PASS;
- one rich Meeting create/edit/search round-trip PASS;
- relationship preservation live where safely observable (lack of a safe synthetic toggle candidate may be DEFERRED/non-blocking because deterministic coverage is accepted);
- one Pitchbook Fund / Strategy live round-trip PASS;
- final integrity PASS;
- no duplicate deployment/source/data mutation beyond the authorized smoke.

## Completion

If the required recovery/smoke/integrity checks pass, classify:

`DEV QUALIFIED — WORK 0014 STRUCTURED CONTEXT FOUNDATION`

`BLOCKER: NO`

PR #17 remains Draft / Open / unmerged until ChatGPT final review and merge decision.
