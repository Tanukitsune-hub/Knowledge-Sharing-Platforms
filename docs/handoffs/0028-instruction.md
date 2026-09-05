# Work 0028 instruction

WORK_ID: 0028
DISPATCH_ID: 0028-CODEX-01
BALL: CODEX
STATUS: READY
MODE: BUILD

## Primary outcome

Replace routine AI Provider Settings mutation authorization with a shared administrator password that is independent of the current user's Google account/email. Keep the management page safely readable to all authorized Web App users. Do not add time-based admin-session expiry.

Current detailed instruction:

`docs/handoffs/0028-CODEX-01-shared-admin-password-instruction.md`

Current ball:

`docs/handoffs/0028-dispatches.md`

Current result:

`docs/handoffs/0028-report.md`

## Closed design choices

- one shared administrator password;
- no Google account/email dependency for normal AI Provider Settings mutations after migration;
- no 30-minute or other timed expiry;
- browser unlock stored only as an opaque token in `sessionStorage`;
- explicit logout clears browser unlock;
- password change invalidates all previous tokens;
- password plaintext never persisted;
- existing account/email admin remains only as the one-time bootstrap gate when no shared credential exists;
- installer/setup/deployment/readiness operator authorization is outside this Work and must not be weakened.

Work 0027 is ACCEPTED. Preserve Gemini 3.7 as qualified-disabled/hidden and preserve accepted OpenAI/FULL_OUTPUT behavior.

Read root/nearest AGENTS, the Work 0028 decision/plan, and the Apps Script deployment guardrails before implementation.
