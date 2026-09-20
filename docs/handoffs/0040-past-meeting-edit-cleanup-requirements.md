# Work 0040 — Past Meeting edit form cleanup

WORK_ID: 0040
STATUS: ACTIVE
MODE: BUILD
PHASE: REQUIREMENTS_INTAKE

## Baseline

```text
APPLICATION_BASELINE_MERGE: 4fe28048e90df1a264dea836e8909d80ada0be57
SERVED_BASELINE_VERSION: 19
WORK_0039: ACCEPTED
WORK_0030: DEFERRED_BY_USER
```

## Primary Outcome

`過去の記録 > 記録の詳細 > 記録を編集`で開く`面談記録を修正`フォームから、通常利用しないfollow-up UIと操作不能なrelated-material selectorを除去し、既存データを破壊しない。

## User-observed issue

Screenshot 2026-09-20 shows:
- `要フォロー` checkbox
- `フォローアップメモ` textarea
- `関連資料（詳細画面で操作）` selector

がedit formに見えている。

## Current implementation findings

### Related materials

`meeting-edit-relatedPitchbookIds` wrapperにはすでにHTML `hidden`が付いているが、edit-form CSSの`.field` layout ruleがUA `hidden`表示を実質上書きしている。

このselector自体はdisabledで、relation operationは`記録の詳細`screen側で実施する。

### Follow-up fields

`meeting-edit-followUpRequired` / `meeting-edit-followUpNote`はvisible edit controlsとして残り、`updateMeetingMaintenance` payloadにも含まれる。

## Frozen requirements so far

### Edit form visibility

- `要フォロー` checkboxをedit formのnormal UIから非表示化。
- `フォローアップメモ` textareaをedit formのnormal UIから非表示化。
- `関連資料（詳細画面で操作）` selectorを確実に非表示化。

### Data preservation

- existing historical `followUpRequired` / `followUpNote` valuesは、他fieldをeditして保存しても変更・消去しない。
- existing `relatedPitchbookIds`は、他fieldをeditして保存しても変更・unlinkしない。
- backend schema / historical data cleanupは行わない。

Implementation may keep compatibility controls hidden in DOM or preserve values in client state; choose the smallest robust approach.

### Preserve

- `記録の詳細`screenのrelated-material operationsは維持。
- original document links / add files / link-unlink / classification behavior unchanged。
- Meeting ID / Google Doc / optimistic version semantics unchanged。
- Meeting Type edit remains available。
- normal Meeting edit fields remain available。
- schema/migration/provider/security changes 0。

## Pending

User message ended with `また、同じく` and appears incomplete. Do not dispatch Codex until any continuation is captured or user confirms no additional requirement.