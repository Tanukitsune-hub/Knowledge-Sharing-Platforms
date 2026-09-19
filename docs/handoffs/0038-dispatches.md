# Work 0038 dispatch control

WORK_ID: 0038
DISPATCH_ID: 0038-CODEX-01
ACTIVE_DISPATCH_ID: 0038-CODEX-01
BALL: CODEX
STATUS: READY
MODE: BUILD
PHASE: IMPLEMENTATION / TARGET RUNTIME QUALIFICATION

## Primary Outcome

Work0037/version13をbaselineに、Knowledge Search Row3とMeeting-create participant/register/attachment regionをfrozen requirementsどおり収束する。

## Authoritative sources

- `docs/handoffs/0038-ui-refinement-requirements.md`
- `docs/planning/work0038-ui-refinement.md`
- `docs/handoffs/0038-CODEX-01-ui-refinement-instruction.md`

## Closed decisions

- Knowledge Row3: `AI検索モード → AIモデル → gap → 非AI出力`
- Meeting: left participant/internal/register; right attachment; notes below
- attachment clear label: `資料選択をクリア`

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
NEXT_UNUSED_DISPATCH: 0038-CODEX-02
WORK_0038_COMPLETE: NO
COMPLETION_LATCH: NOT_APPLIED
```

WORK_ID: 0038
DISPATCH_ID: 0038-CODEX-01
BALL: CODEX
STATUS: READY
## Latest user refinement — authoritative override

- Knowledge: AI model immediately beside AI mode; non-AI output start7 aligned with Asset Class.
- Meeting: attachment col7/span6 row3/span2; same default height as 面談相手+当社側 combined.
- Remove attachment processing-order help text.
- Shorten drop zone height.
- Move clear/retry buttons directly below drop zone; remove right-side action-column layout.

Same `0038-CODEX-01` continues. No new Dispatch.
## Latest user refinement — authoritative override (2)

- Participant fields: col1/span7.
- Attachment block: col8/span5, row3/span2.
- Register: row5 left.
- Clear/Retry: row5 right, same row as Register, outside attachment block.
- Attachment drop zone uses full narrowed block width.
- Prior instruction `buttons directly below drop zone inside attachment` is SUPERSEDED.

Same `0038-CODEX-01` continues. No new Dispatch.