# Work 0014 — Structured meeting context foundation

WORK_ID: `0014`
Dispatch ID: `0014-CODEX-03`
BALL: `CODEX`
STATUS: `BLOCKED`

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
- immutable Apps Script version `26`: accepted pre-recovery version;
- ChatGPT-applied synthetic DEV data-plane schema-3 migration: PASS/read back;
- `KSP_INSTALLATION_STATE_JSON.schemaVersion = 3`: PASS/read back;
- existing rows, IDs, counters, statuses, source files, AI/Gemini settings and LAST_SETUP_AT preserved.

## CODEX-03 execution result

The deployment/control-plane blocker observed by `0014-CODEX-02` is recovered:

- immediately before deployment, immutable version `26` remained latest and saved remote source matched the accepted 59-file tree;
- exactly one Web App deployment was created, with execute-as deploying user and access `Only myself`;
- Apps Script automatically created exactly one immutable version, `27`;
- the new normal `/exec` rendered successfully;
- all six pre-existing Library deployments remained unchanged.

The bounded live smoke then produced:

- legacy Meeting compatibility: `PASS`;
- rich Meeting create/edit/search round-trip: `PASS`;
- relationship preservation through temporary linked-Pitchbook inactivation and restoration: `PASS`;
- Pitchbook Fund / Strategy: `FAIL` on the first and only save with `管理処理を完了できませんでした。`;
- authoritative readback after the failure: Pitchbook remained Active, Fund / Strategy remained unchanged, row count remained unchanged, and no duplicate or partial update was created;
- final integrity: `NOT RUN — stopped at the first actual application defect`.

Application source remains frozen. No retry, source diagnosis, second hypothesis, or further live mutation is authorized under `0014-CODEX-03`.

## Decisive evidence

The first Pitchbook Fund / Strategy save returned the safe UI error `管理処理を完了できませんでした。`. Backend readback showed that the submitted value was not persisted. This is sufficient to stop the live smoke without opening a second implementation hypothesis.

Report: `docs/handoffs/0014-CODEX-03-web-app-deployment-recovery-and-smoke-report.md`.

## Qualification status

`NOT QUALIFIED — LIVE SMOKE STOPPED AT PITCHBOOK FUND / STRATEGY APPLICATION DEFECT`

`BLOCKER: YES`

## Completion

PR #17 remains Draft / Open / unmerged until ChatGPT final review and merge decision.
