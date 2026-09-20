# Work 0041 dispatch control

WORK_ID: 0041
DISPATCH_ID: 0041-CODEX-01
ACTIVE_DISPATCH_ID: 0041-CODEX-01
BALL: CHATGPT
STATUS: RETURNED
MODE: BUILD
PHASE: FINAL REVIEW

## Primary Outcome

`過去の記録`のpersistent empty-state、明確なloading UX、整列した一覧、通常利用者向け`削除`、管理者ページ`削除記録の管理` / 復元workflowをsame owner-only production runtimeで完成させる。

## Baseline

```text
APPLICATION_BASELINE_MERGE: f4283c6b57c6413178d6a2c4173d4970604ee751
FINAL_SERVED_BASELINE_VERSION: 20
WORK_0040: ACCEPTED
COMPLETION_LATCH: APPLIED
WORK_0030: DEFERRED_BY_USER
```

## Authoritative sources

- `docs/handoffs/0041-past-meeting-usability-and-delete-record-management-requirements.md`
- `docs/planning/work0041-past-meeting-usability-and-delete-record-management.md`
- `docs/handoffs/0041-CODEX-01-past-meeting-usability-and-delete-record-management-instruction.md`

## Closed decisions

- detail / related / editは未選択empty-state込みで初期からvisible
- editは未選択時disabled
- loadingはvisible + indeterminate、fake percentageなし
- table cellをflexにせずinner action wrapperをflex化
- normal Active action labelは`削除`
- backend delete semanticsはActive -> Inactive
- normal Past Meetingにrestore controlを置かない
- Admin section名は`削除記録の管理`
- default admin statusはInactive / `削除済み`
- restoreはexisting status mutation / optimistic concurrency / Auditを再利用
- Work0040 accepted behaviorをpreserve
- Work0030はDEFERRED_BY_USER

## Safety

```text
SCHEMA_CHANGE: 0
MIGRATION_CHANGE: 0
NEW_STORAGE: 0
PHYSICAL_DELETE: 0
PROVIDER_CALLS: 0
AI_SYNC: DISABLED / UNCHANGED
PERMISSION_BROADENING: 0
PUBLIC_EXPOSURE: 0
NEW_TARGET: 0
SECOND_DEPLOYMENT: 0
REAL_BUSINESS_RECORD_MUTATION: 0
```

## Runtime mutation budget

```text
SOURCE_SYNC_MAX: 1
IMMUTABLE_VERSION_CREATE_MAX: 1
SAME_DEPLOYMENT_UPDATE_MAX: 1
EXPECTED_FINAL_SERVED_VERSION: 21
```

Second deploymentが必要ならStrategy Resetし、ChatGPTへRETURNする。

## CODEX-01 return

```text
BRANCH: codex/0041-past-meeting-usability
DRAFT_PR: #63
RUNTIME_QUALIFIED_APPLICATION_HEAD: b73274261312754bf7e3698e409e2f4b92635c8b
FINAL_SERVED_VERSION: 21
LOGIC_VALIDATION: PASS / 591 tests
BUNDLE_VALIDATION: PASS / 30 tests
TARGET_RUNTIME_QUALIFICATION: PASS
DELETE_RESTORE_E2E: PASS / Version 12 -> 13 -> 14
LIFECYCLE_AUDIT_SEQUENCE: PASS
PROVIDER_CALLS: 0
AI_SYNC: DISABLED
PHYSICAL_DELETE: 0
BLOCKER: NONE
READY_FOR_CHATGPT_FINAL_REVIEW: YES
```

Report:
- `docs/handoffs/0041-CODEX-01-past-meeting-usability-report.md`

```text
NEXT_UNUSED_DISPATCH: 0041-CODEX-02
WORK_0041_COMPLETE: NO
COMPLETION_LATCH: NOT_APPLIED
```

WORK_ID: 0041
DISPATCH_ID: 0041-CODEX-01
BALL: CHATGPT
STATUS: RETURNED
