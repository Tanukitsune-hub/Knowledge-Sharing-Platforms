# Work 0021 — CODEX-05 Google editor Drive-URL parser fix

WORK_ID: `0021`
DISPATCH_ID: `0021-CODEX-05`
BALL: `NONE`
STATUS: `SUPERSEDED`

## Supersession reason

This instruction was prepared after CODEX-04 returned, but before the stale/concurrent CODEX-04 runtime session finished reporting its actual side effects.

That late CODEX-04 return established that:

```text
APPS_SCRIPT_VERSION_66: CREATED / NOT DEPLOYED
APPS_SCRIPT_VERSION_67: CREATED ACCIDENTALLY / NOT DEPLOYED
PRIVATE_WEB_APP_DEPLOYED_VERSION: 65
LOCAL_SCOPED_PARSER_FIX_COMMIT: 516a323d4ee00b3134e79719303ddf81d52d5b4b
REMOTE_PUSH_OF_LOCAL_FIX: REJECTED DUE REMOTE ADVANCE
```

Therefore this CODEX-05 contract, which expected to create version 66, became stale before execution and must not be run or amended in place.

The next execution request is:

`docs/handoffs/0021-CODEX-06-runtime-version-reconciliation-and-final-full-output-instruction.md`

CODEX-06 starts from current remote GitHub state, reconciles only the scoped parser/test diff, creates no new Apps Script version, and may update the existing private Web App to already-created version 66 only after exact-source verification.

WORK_ID: `0021`
DISPATCH_ID: `0021-CODEX-05`
BALL: `NONE`
STATUS: `SUPERSEDED`
