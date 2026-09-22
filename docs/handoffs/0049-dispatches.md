# Work 0049 dispatch control

WORK_ID: 0049
DISPATCH_ID: 0049-CODEX-01
ACTIVE_DISPATCH_ID: 0049-CODEX-01
BALL: CHATGPT
STATUS: RETURNED
MODE: BUILD
PHASE: DRAFT PR REVIEW

## Primary Outcome

全mutation / user-triggered long-running actionで、button spinner + action-specific processing label + status / aria-busyを一貫して提供する。

## Authoritative instruction

- `docs/handoffs/0049-CODEX-01-async-feedback-standardization-instruction.md`
- `docs/handoffs/0049-async-operation-feedback-requirements.md`

## Return evidence

- `docs/handoffs/0049-CODEX-01-async-feedback-standardization-report.md`
- owner-only Web App version31
- focused tests 14/14 PASS
- `npm run check` 645/645 PASS
- bundle validation 30/30 PASS
- final data drift 0
- blocker none

## Hard boundary

```text
BASELINE: Work0048 version30
MUTATION_SURFACE_COVERAGE: APP_WIDE
MASTER_OPTION_ADD_FIRST_CLICK_FEEDBACK: REQUIRED
SHARED_BUSY_BUTTON_HELPER: REQUIRED_OR_EQUIVALENT
STATUS_BUSY_REUSE: REQUIRED
ARIA_BUSY: REQUIRED
DUPLICATE_REQUEST_PREVENTION: PRESERVE
BUSINESS_LOGIC_CHANGE: 0 expected
BACKEND_API_CHANGE: 0 expected
SCHEMA_CHANGE: 0
MIGRATION_CHANGE: 0
PERMISSION_BROADENING: 0
EXPECTED_FINAL_SERVED_VERSION: 31
WORK_0030: DEFERRED_BY_USER
```

```text
NEXT_UNUSED_DISPATCH: 0049-CODEX-02
WORK_0049_COMPLETE: NO
COMPLETION_LATCH: NOT_APPLIED
```

WORK_ID: 0049
DISPATCH_ID: 0049-CODEX-01
BALL: CHATGPT
STATUS: RETURNED
