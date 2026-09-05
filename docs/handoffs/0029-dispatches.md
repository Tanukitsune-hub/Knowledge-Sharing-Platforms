# Work 0029 dispatch control

WORK_ID: 0029
ACTIVE_DISPATCH_ID: 0029-CODEX-01
BALL: CODEX
STATUS: READY
MODE: BUILD

## Current dispatch

`0029-CODEX-01` — reconcile the already-qualified shared administrator password implementation onto latest main under the correct Work identity, preserve Work 0028 UI/UX control, and align runtime once to version 75.

Instruction: `docs/handoffs/0029-CODEX-01-shared-admin-reconciliation-instruction.md`
Report: `docs/handoffs/0029-CODEX-01-shared-admin-reconciliation-report.md`

```text
LATEST_MAIN_AT_PREP: e90d6f31205249b6de7720896708cdef3e0ba212
AUTHORITATIVE_WORK_0028: UI/UX surface refinement / ACTIVE DESIGN
SUPERSEDED_SHARED_ADMIN_PR: #38 / close without merge
PRESERVED_SHARED_ADMIN_IMPLEMENTATION: af96c145e999ac7bed9d7aa4862e41b87ad17c82
PRESERVED_RUNTIME: version 74 / configured and locked / functional PASS
CANONICAL_WORK: 0029
CURRENT_PRIVATE_WEB_APP: version 74
WORK_ACCEPTANCE: NOT_MET
BLOCKER: GITHUB_RECONCILIATION_PENDING
```

No provider/model/data call or mutation is authorized. The temporary DEV password `password` is explicitly authorized for the bounded Web App unlock smoke only and must never become a source default or be persisted as plaintext.

Do not modify or replace the main Work 0028 control/decision files. Any subsequent Codex run after this dispatch returns is `0029-CODEX-02`.

WORK_ID: 0029
ACTIVE_DISPATCH_ID: 0029-CODEX-01
BALL: CODEX
STATUS: READY
