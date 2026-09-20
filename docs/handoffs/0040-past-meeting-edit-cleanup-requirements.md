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

## Additional confirmed scope — Detail screen

### Primary action row

`記録の詳細`のaction rowを左寄せに統一する。

Desktop order:
`Google Docs原本` → `記録を編集` → `記録を削除（Inactive）`

- 3 controlsを同じrowで左から詰めて配置。
- current `.actions`の`justify-content:space-between`により中央/右端へ離れる状態を解消する。
- mobileではsafe wrap可。

### Related-material action area

`関連資料`sectionの操作も左寄せcompact rowへ統一する。

Current UI:
- `既存Document_ID` label/input
- `既存資料を関連付ける` button
- `資料を追加` button

User instruction:
- `既存Document_ID`はinternal identifierでありnormal userが管理するものではないため、user-facing UIから非表示化する。
- 資料関連actionは左寄せで近接配置する。

### Important dependency

current implementationでは`既存資料を関連付ける`が`meeting-detail-documentId`の入力値を直接読み、`changeDetailRelation(documentId,'add')`を実行する。

したがってraw Document_ID inputだけをhiddenにすると、existing-link buttonは操作不能になる。

Implementation前に次のどちらかを確定する:

A. `既存Document_ID`と`既存資料を関連付ける`をnormal UIから両方削除し、`資料を追加`のみ残す。既存資料とのrelation操作は現在関連済みの資料list上のlink/unlinkに限定する。

B. raw Document_ID inputは隠し、`既存資料を関連付ける`は人間向けexisting-material picker/selectへ置換する。これは新しいUI workflowを追加するためscopeが大きい。

Recommendation: A。利用者がDocument_IDを管理しないという今回の意図に最も一致し、最小・安全。

## Detail read-only follow-up presentation

`記録の詳細`には現在`要フォロー` / `フォローメモ`もread-only attributeとして表示されている。

今回のuser intent（follow-up項目は使用予定なし）に合わせ、normal detail presentationからも非表示化する。backend/historical valuesは保持する。

## Closed decision — Existing-material linking

User intent is to keep `既存資料を関連付ける` while removing raw `既存Document_ID` from normal UI.

Therefore:
- raw `既存Document_ID` label/input is removed from normal user-facing UI.
- `既存資料を関連付ける` button remains.
- clicking the button opens a human-readable existing-material picker.
- picker reuses existing `searchPitchbookRecords` / existing maintenance read path where possible; do not introduce new storage.
- default candidate scope should be current Meeting's counterparty + Asset Class, Active materials, bounded result set.
- display human fields such as date / title or saved filename / Fund or Strategy when available.
- do not display raw Document_ID as the primary user-facing identifier.
- already-linked material should not be offered as a normal add candidate.
- selected material is linked through existing relation mutation using its internal Document_ID behind the UI.
- after successful link, refresh the detail view and preserve current relation/unlink semantics.

## Final frozen scope

### Edit form
- hide `要フォロー`.
- hide `フォローアップメモ`.
- ensure `関連資料（詳細画面で操作）` remains truly hidden despite layout CSS.
- preserve historical follow-up values and relatedPitchbookIds when saving unrelated edits.

### Detail view
- hide read-only `要フォロー` / `フォローメモ` attributes.
- primary actions left aligned in one compact row:
  `Google Docs原本` → `記録を編集` → `記録を削除（Inactive）`.
- related-material actions left aligned in one compact row:
  `既存資料を関連付ける` → `資料を追加`.
- raw `既存Document_ID` label/input not visible.
- existing-material button uses human-readable picker.

### Preserve
- existing related-material list.
- open original / classification edit / unlink / relink semantics.
- file add flow.
- Meeting optimistic version semantics.
- Meeting ID / Google Doc identity.
- backend schema and historical values.
- provider/security behavior.

## Dispatch state

Requirements frozen. Ready to issue `0040-CODEX-01`.