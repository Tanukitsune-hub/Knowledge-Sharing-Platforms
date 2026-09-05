# Work 0028 dispatch control

WORK_ID: 0028
ACTIVE_DISPATCH_ID: 0028-CODEX-01
BALL: CODEX
STATUS: READY
MODE: BUILD

## Current dispatch

`0028-CODEX-01` — shared-password administrator mode for the AI Provider Settings management page, without normal-operation dependence on a named Google account.

Instruction: `docs/handoffs/0028-CODEX-01-shared-admin-password-instruction.md`
Report: `docs/handoffs/0028-CODEX-01-shared-admin-password-report.md`

```text
BASE_MAIN: b0efbbfd8a5ce5c2e3b3d64f5ccba56838306ef2
CURRENT_PRIVATE_WEB_APP: version 73
WORK_ACCEPTANCE: NOT_MET
BLOCKER: IMPLEMENTATION_NOT_RUN
ADMIN_PAGE_READ_ONLY: all authorized Web App users
ADMIN_MUTATIONS_AFTER_MIGRATION: shared password session required
ACCOUNT_BOUND_ADMIN_AFTER_MIGRATION: prohibited for AI Provider Settings mutations
ADMIN_AUTO_TIMEOUT: none
CLIENT_SESSION_STORAGE: sessionStorage only
GEMINI: preserve Work 0027 qualified-disabled state
```

All runtime passwords, password verifiers, salts, signing secrets, admin-session tokens, private URLs/IDs and account identifiers are sensitive. Never commit or report their values. Any user password entry happens only in the Web App UI; do not ask the user to paste it into chat, Codex, terminal, logs or GitHub.

CODEX-01 may request user-assisted browser actions to type the initial shared administrator password directly into the Web App and later re-enter it for unlock verification. Those user actions stay under the same Dispatch ID. After Codex returns, any new instruction or rerun requires `0028-CODEX-02`.

WORK_ID: 0028
ACTIVE_DISPATCH_ID: 0028-CODEX-01
BALL: CODEX
STATUS: READY
