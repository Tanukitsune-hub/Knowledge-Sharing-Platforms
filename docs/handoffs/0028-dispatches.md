# Work 0028 dispatch control

WORK_ID: 0028
ACTIVE_DISPATCH_ID: 0028-CODEX-02
BALL: CODEX
STATUS: READY
MODE: BUILD

## Current dispatch

`0028-CODEX-02` — shared-password administrator mode plus current personal-DEV bootstrap using the temporary disclosed password supplied in the dispatch prompt.

Instruction: `docs/handoffs/0028-CODEX-02-shared-admin-password-bootstrap-instruction.md`
Report: `docs/handoffs/0028-CODEX-02-shared-admin-password-bootstrap-report.md`

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
PASSWORD_CHANGE_UI: required
TEMP_DEV_BOOTSTRAP_PASSWORD: supplied in dispatch prompt / not a product default
GEMINI: preserve Work 0027 qualified-disabled state
```

The temporary personal-DEV bootstrap password may be disclosed to Codex for this run and entered by Codex in the normal Web App UI. It must not be hard-coded as a product default or persisted in plaintext. Real future passwords, password verifiers, salts, signing secrets, admin-session tokens, private URLs/IDs and account identifiers remain sensitive and must never be committed or reported.

## Superseded dispatch

`0028-CODEX-01` — SUPERSEDED before execution after the user explicitly removed the USER password-entry requirement and authorized a temporary disclosed bootstrap password for DEV. Do not execute or resume CODEX-01.

Any new Codex run after CODEX-02 returns requires `0028-CODEX-03`.

WORK_ID: 0028
ACTIVE_DISPATCH_ID: 0028-CODEX-02
BALL: CODEX
STATUS: READY
