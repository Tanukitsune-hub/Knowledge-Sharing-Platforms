# Work 0014 dispatch control

WORK_ID: `0014`
Dispatch ID: `0014-CODEX-03`
BALL: `CODEX`
STATUS: `BLOCKED`

Current active dispatch:

- `0014-CODEX-03`
- Mode: `QUALIFICATION / INCIDENT_RECOVERY`
- Purpose: recover exactly one synthetic DEV Web App deployment from the frozen accepted source, then execute the bounded Work 0014 normal-UI smoke.
- Instruction: `docs/handoffs/0014-CODEX-03-web-app-deployment-recovery-and-smoke-instruction.md`.
- Parent/canonical instruction: `docs/handoffs/0014-instruction.md`.
- Deployment guardrails: `docs/operations/apps-script-web-app-deployment.md`.
- Production storage decision: `docs/decisions/shared-drive-production-root.md`.

Accepted closed evidence:

- Work 0014 implementation: PASS;
- deterministic validation: `176/176 PASS`;
- public facade: 23 functions unchanged;
- schema 3 append-only/idempotent deterministic migration: PASS;
- Meeting/Pitchbook/relationship/legacy deterministic behavior: PASS;
- exact synthetic DEV source sync: `59/59 PASS`;
- immutable Apps Script version 26: accepted pre-recovery version;
- ChatGPT-applied synthetic DEV data-plane schema 3 migration: PASS/read back;
- installation-state schemaVersion alignment to 3: PASS/read back;
- production Shared Drive-only storage boundary: accepted and unchanged.

Strategy Reset:

- `0014-CODEX-02` directly observed that active deployments are Library only and no Web App `/exec` currently exists;
- this contradicts the prior Web App-existence assumption but does not contradict application-source evidence;
- application source remains frozen;
- do not diagnose historical deployment disappearance;
- user explicitly authorizes one new synthetic DEV Web App deployment.

CODEX-03 result:

- deployment recovery: `PASS` — one Web App deployment and one automatically generated immutable version `27`; execute-as deploying user; access `Only myself`; Library deployments unchanged;
- main `/exec` gate: `PASS`;
- legacy Meeting: `PASS`;
- rich Meeting create/edit/search round-trip: `PASS`;
- relationship preservation through temporary linked-Pitchbook inactivation and restoration: `PASS`;
- Pitchbook Fund / Strategy: `FAIL` — the first and only save returned `管理処理を完了できませんでした。`, with no persisted value, duplicate, or partial update;
- final integrity: `NOT RUN — stopped at the first actual application defect`;
- classification: `NOT QUALIFIED — LIVE SMOKE STOPPED AT PITCHBOOK FUND / STRATEGY APPLICATION DEFECT`;
- `BLOCKER: YES`.

No retry, source diagnosis, second hypothesis, or further live mutation is authorized under this dispatch.

Report: `docs/handoffs/0014-CODEX-03-web-app-deployment-recovery-and-smoke-report.md`.

PR #17 remains Draft / Open / unmerged pending ChatGPT final review.

WORK_ID: `0014`
Dispatch ID: `0014-CODEX-03`
BALL: `CODEX`
STATUS: `BLOCKED`
