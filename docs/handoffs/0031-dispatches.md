# Work 0031 dispatch control

WORK_ID: 0031
DISPATCH_ID: 0031-CODEX-01
ACTIVE_DISPATCH_ID: 0031-CODEX-01
BALL: CODEX
STATUS: READY
MODE: BUILD
PHASE: COUNTERPARTY MASTER / SCHEMA8 / AUTONOMOUS COMPLETION

## Primary Outcome

GP中心のbusiness modelを廃止し、すべての面談先・資料主体をCounterparty_Masterへ統合する。GPはCounterparty_Typeの1値のみ。

## Active instruction

`docs/handoffs/0031-CODEX-01-counterparty-master-transition-instruction.md`

## Accepted design

`docs/decisions/counterparty-master-unification.md`

```text
TARGET_SCHEMA: 8
BACKEND_SHEETS: EXACTLY_5
PRIMARY_MASTER: Counterparty_Master
COUNTERPARTY_ID: CP-*
GP_ROLE: Counterparty_Type only
RELATED_GP_USER_CONCEPT: REMOVE
WORK_0030: DEFERRED_BY_USER
```

## Closed evidence from Work 0028

Reopen only if contradicted by Work0031 changes:
- version5 Date/Time readback
- parent-first Meeting/file flow
- stable IDs / unlink-relink / Docs preservation
- non-AI Full Output
- native date picker / responsive UI
- owner-only deployment security
- provider0 / AI disabled

## Execution strategy

Route C / autonomous completion.

Codex first inventories active GP dependencies, then continues in the same dispatch through schema8 implementation, schema7 migration, deterministic tests, same-target migration, same-deployment update, and actual browser R1-R10 qualification.

Ordinary defects do not return ball. Up to 3 coherent repair/runtime cycles.

## Fixed safety boundary

```text
NEW_TARGET: 0
SECOND_PARALLEL_DEPLOYMENT: 0
REAL_CONFIDENTIAL_DATA: 0
PHYSICAL_DELETE: 0
PERMISSION_BROADENING: 0
DIRECT_OPENAI/GEMINI/AZURE: 0
AI_SYNC: DISABLED
```

## Completion gate

schema8 migration/fresh install/idempotency、Counterparty-centered UI/data/search/material/master/analytics、actual R1-R10、logic/bundle、BLOCKER NONE。

```text
NEXT_UNUSED_DISPATCH: 0031-CODEX-02
WORK_0031_COMPLETE: NO
```

WORK_ID: 0031
DISPATCH_ID: 0031-CODEX-01
BALL: CODEX
STATUS: READY