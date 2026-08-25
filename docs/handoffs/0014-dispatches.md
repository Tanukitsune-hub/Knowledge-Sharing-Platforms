# Work 0014 dispatch control

WORK_ID: `0014`
Dispatch ID: `0014-CODEX-03`
BALL: `CODEX`
STATUS: `READY`

Current active dispatch:

- `0014-CODEX-03`
- Mode: `QUALIFICATION / INCIDENT_RECOVERY`
- Purpose: create exactly one synthetic DEV Web App deployment from the frozen accepted source, then complete the bounded Work 0014 normal-UI smoke and final integrity checks.
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

Authorized decisive action:

- immediately before deployment, verify latest immutable version is still 26 and saved remote source is unchanged;
- create exactly ONE new deployment via Apps Script editor, explicitly type `Web app`;
- Google editor is expected to auto-create exactly one new immutable version, 27, as part of that deployment;
- execute as deploying user;
- access `Only myself`;
- do not manually create a version before deployment;
- do not modify/delete Library deployments;
- do not create a second deployment;
- open the resulting `/exec` once and stop on first recovery failure;
- if recovery passes, complete the bounded normal-UI Work 0014 smoke and final integrity readback.

PR #17 remains Draft / Open / unmerged pending ChatGPT final review.

WORK_ID: `0014`
Dispatch ID: `0014-CODEX-03`
BALL: `CODEX`
STATUS: `READY`
