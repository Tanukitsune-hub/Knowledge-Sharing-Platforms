# Work 0014 dispatch control

WORK_ID: `0014`
Dispatch ID: `0014-CODEX-05`
BALL: `USER`
STATUS: `ACTION_REQUIRED`

## Current active dispatch

- Dispatch: `0014-CODEX-05`
- Mode: `INCIDENT_RECOVERY / QUALIFICATION`
- Purpose: create one verified synthetic DEV Web App, run the one remaining Pitchbook Fund / Strategy live check, and complete final integrity.
- Instruction: `docs/handoffs/0014-CODEX-05-web-app-recovery-and-final-live-verification-instruction.md`.
- Parent/canonical instruction: `docs/handoffs/0014-instruction.md`.
- Deployment guardrails: `docs/operations/apps-script-web-app-deployment.md`.
- Production storage decision: `docs/decisions/shared-drive-production-root.md`.

The user is temporarily unable to operate the authenticated desktop/browser environment. Do not begin CODEX-05 until the user is present. Resume this same Dispatch ID when the user launches the run.

## Accepted closed evidence

- Work 0014 schema/product design: accepted;
- schema 3 append-only/idempotent migration: PASS;
- CODEX-04 source/test repair: PASS;
- local deterministic result recorded by CODEX-04: `179/179 PASS`;
- public facade: `23`;
- Pitchbook helper repair commit: `4036690cf49555cbc308a16a464606f1da523c0b`;
- exact tested DEV source readback: `59/59 PASS`;
- immutable Apps Script version `28`: exists;
- synthetic DEV data-plane migration and installation-state alignment: PASS/read back;
- legacy Meeting compatibility: PASS;
- rich Meeting create/edit/search round-trip: PASS;
- Meeting ↔ Pitchbook relationship preservation: PASS;
- original failed Pitchbook save caused no duplicate, partial update, or file/row corruption;
- the Library deployment accidentally touched in CODEX-04 was restored; the one-time post-fix Pitchbook save remains unused;
- production Shared Drive-only storage boundary: accepted and unchanged.

## CODEX-04 result

- bounded source/test repair: PASS;
- source synchronization/readback: PASS;
- immutable version `28`: created;
- Web App update: blocked because no positively identified `WEB_APP` entrypoint existed;
- an attempted update reached a Library deployment and was immediately restored;
- live Pitchbook save and final integrity: NOT RUN;
- classification: `NOT QUALIFIED — DEPLOYMENT CONTROL-PLANE BLOCKER BEFORE LIVE PITCHBOOK SAVE`.

## CODEX-05 decision

- application source/tests/schema are frozen;
- never update a deployment unless authoritative metadata proves `WEB_APP` and `/exec`;
- Library or ambiguous deployment IDs are never update targets;
- create exactly one new Web App through the editor, execute as deploying user, access `Only myself`;
- run only the remaining Pitchbook Fund / Strategy save/reopen/search check once;
- then complete final integrity;
- stop on first failure; no second deployment, save retry, or source hypothesis.

PR #17 remains Draft / Open / unmerged pending final live evidence and ChatGPT review.

WORK_ID: `0014`
Dispatch ID: `0014-CODEX-05`
BALL: `USER`
STATUS: `ACTION_REQUIRED`
