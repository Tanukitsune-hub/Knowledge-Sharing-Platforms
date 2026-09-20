# Work 0040 dispatch control

WORK_ID: 0040
DISPATCH_ID: N/A
ACTIVE_DISPATCH_ID: NONE
BALL: USER
STATUS: PREPARING
MODE: BUILD
PHASE: REQUIREMENTS_INTAKE

## Primary Outcome

Past Meeting edit formからunused follow-up UI / non-editable related-material selectorを除去し、legacy valuesを保存時にpreserveする。

## Current closed points

- follow-up checkbox: hide from edit UI
- follow-up memo: hide from edit UI
- related material selector: hide from edit UI
- existing follow-up values: preserve
- existing relatedPitchbookIds: preserve
- detail-screen related-material operations: preserve

## Additional confirmed scope

- Detail primary actions: Google Docs原本 / 記録を編集 / 記録を削除をleft-aligned compact row。
- Related-material actions: left-aligned。
- raw `既存Document_ID` user-facing input: hide/remove。
- Detail read-only `要フォロー` / `フォローメモ`: hide from normal UI while preserving data。

## Pending decision

Current `既存資料を関連付ける` button requires raw Document_ID input.

- Option A (recommended): hide/remove both raw ID input and existing-link button; keep `資料を追加`.
- Option B: replace raw ID flow with human-readable existing-material picker.

Wait for this decision before CODEX-01.

```text
NEXT_UNUSED_DISPATCH: 0040-CODEX-01
WORK_0040_COMPLETE: NO
```

WORK_ID: 0040
DISPATCH_ID: N/A
BALL: USER
STATUS: PREPARING