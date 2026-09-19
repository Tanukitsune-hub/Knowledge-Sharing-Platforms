# Work 0038 dispatch control

WORK_ID: 0038
DISPATCH_ID: 0038-CODEX-02
ACTIVE_DISPATCH_ID: 0038-CODEX-02
BALL: CODEX
STATUS: READY
MODE: BUILD
PHASE: MEETING HEADER / STATUS REFINEMENT

## Primary Outcome

CODEX-01で認定済みのversion15 geometryを保持し、Meeting-create冒頭を`記録を追加 → 下書きをクリア → compact ready status`の1段へ収束する。

## Previous Dispatch

```text
0038-CODEX-01: RETURNED
PR: #60 / Draft / unmerged
HEAD: 1b67faf31722529d270bf3d93691394fe65520f4
REPORTED_SERVED_VERSION: 15
BLOCKER: NONE
```

## Active instruction

`docs/handoffs/0038-CODEX-02-meeting-header-status-instruction.md`

## Closed decisions

- draft explanatory sentence: REMOVE
- initial ready message: MOVE TO TOP ROW
- initial ready status width: COMPACT / CONTENT WIDTH
- operational status behavior: PRESERVE
- PR #60: CONTINUE / DO NOT MERGE

## Safety

```text
NEW_TARGET: 0
SECOND_DEPLOYMENT: 0
PERMISSION_BROADENING: 0
PUBLIC_EXPOSURE: 0
SCHEMA_CHANGE: 0
MIGRATION_CHANGE: 0
PROVIDER_CALLS: 0
AI_SYNC: DISABLED / UNCHANGED
CONFIDENTIAL_DATA: 0
PHYSICAL_DELETE: 0
WORK_0030: DEFERRED_BY_USER
```

```text
NEXT_UNUSED_DISPATCH: 0038-CODEX-03
WORK_0038_COMPLETE: NO
COMPLETION_LATCH: NOT_APPLIED
```

## Dispatch history

| Dispatch | Result |
|---|---|
| 0038-CODEX-01 | latest frozen 2-screen geometry、572/572、bundle 30/30、same deployment version15、4 viewport x 7 pages actual runtime qualificationをPASS。Draft PR #60で返却。 |
| 0038-CODEX-02 | ACTIVE — Meeting-create header/status refinement。 |

WORK_ID: 0038
DISPATCH_ID: 0038-CODEX-02
BALL: CODEX
STATUS: READY
