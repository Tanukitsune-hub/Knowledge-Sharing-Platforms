# Work 0040 — Past Meeting edit/detail cleanup

WORK_ID: 0040
STATUS: ACTIVE
MODE: BUILD
PHASE: READY_FOR_CODEX

## Primary Outcome

`過去の記録`のdetail/edit workflowをnormal-user向けに整理し、unused follow-up UIとraw internal Document IDを除去しつつ、既存データとrelated-material機能を保持する。

## Baseline

```text
APPLICATION_BASELINE_MERGE: 4fe28048e90df1a264dea836e8909d80ada0be57
SERVED_BASELINE_VERSION: 19
WORK_0039: ACCEPTED
WORK_0030: DEFERRED_BY_USER
```

## Acceptance Evidence

1. source/UI:
- edit formに要フォロー/フォローアップメモ/related selectorが表示されない
- detail viewにもfollow-up read-only attributesが表示されない
- action rowsがleft aligned
- raw Document_IDがnormal UIにない
- existing-material picker works with human-readable choices

2. preservation:
- edit save does not clear existing followUpRequired/followUpNote
- edit save does not change relatedPitchbookIds
- relation add/unlink behavior preserved
- Meeting ID / Doc / optimistic version preserved

3. runtime:
- existing Meeting with legacy follow-up valuesをread/edit/saveし、hidden values unchanged
- existing relation remains unchanged through unrelated edit
- human-readable picker links an existing synthetic material without raw ID entry
- 2560 / 1440 / 1280 / 390
- console material error/warn0

## Fastest Safe Decisive Action

- retain hidden compatibility state for preservation where practical
- fix `[hidden]` CSS precedence explicitly
- reuse existing pitchbook search/read APIs for picker
- no new backend/storage unless current read facade cannot supply candidates

## Non-Goals

- deleting historical follow-up data
- schema/migration
- redesigning the entire Past Records page
- provider work
- Work0030

## Retry cap

Maximum 2 coherent repair/runtime cycles.

## Completion

ChatGPT reviews Draft PR and actual runtime evidence, then merges and applies Completion Latch.