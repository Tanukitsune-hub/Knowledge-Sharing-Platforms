# Work 0028 report

WORK_ID: 0028
ACTIVE_DISPATCH_ID: 0028-CODEX-02
BALL: CODEX
STATUS: READY
MODE: BUILD

## Current outcome

Work 0028 is prepared but not implemented. CODEX-01 was superseded before execution after the user authorized a temporary disclosed bootstrap password for the current personal-DEV installation; CODEX-02 is the active execution contract.

```text
BASE_MAIN: b0efbbfd8a5ce5c2e3b3d64f5ccba56838306ef2
CURRENT_PRIVATE_WEB_APP_VERSION: 73
IMPLEMENTATION: NOT_RUN
LOGIC_VALIDATION: NOT_RUN
TARGET_RUNTIME_QUALIFICATION: NOT_RUN
WORK_ACCEPTANCE: NOT_MET
BLOCKER: IMPLEMENTATION_NOT_RUN
```

The accepted design is a shared administrator password for routine AI Provider Settings mutation. The safe management page remains readable while locked. Shared administrator unlock is independent of Google account/email, has no time-based expiry, persists only for the browser page session using `sessionStorage`, and ends on explicit logout/browser-session end. Password change is part of the same management flow and invalidates prior tokens.

For current personal DEV, Codex may use the temporary bootstrap password supplied in the dispatch prompt. The product must not hard-code it or persist plaintext, and future passwords remain arbitrary UI-entered credentials.

Work 0027 provider state must remain unchanged: Gemini 3.7 qualified-disabled/hidden; OpenAI/FULL_OUTPUT accepted paths preserved.

Detailed execution contract: `docs/handoffs/0028-CODEX-02-shared-admin-password-bootstrap-instruction.md`.
