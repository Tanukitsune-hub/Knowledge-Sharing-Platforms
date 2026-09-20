# CODEX-01 — Past Meeting edit/detail cleanup

WORK_ID: 0040
DISPATCH_ID: 0040-CODEX-01
BALL: CODEX
STATUS: READY
MODE: BUILD

## Authoritative contract

Read latest `origin/main`, root/nearest `AGENTS.md`, then:
- `docs/handoffs/0040-past-meeting-edit-cleanup-requirements.md`
- `docs/planning/work0040-past-meeting-edit-cleanup.md`
- `docs/handoffs/0040-dispatches.md`
- `docs/handoffs/0039-completion-report.md`

## Baseline

```text
APPLICATION_BASELINE_MERGE: 4fe28048e90df1a264dea836e8909d80ada0be57
SERVED_BASELINE_VERSION: 19
OWNER_ONLY_DEPLOYMENT: preserve
WORK_0039: ACCEPTED
WORK_0030: DEFERRED_BY_USER
```

## Primary Outcome

Clean up `過去の記録 > 記録の詳細 > 記録を編集` so internal/unused fields disappear from normal UI without losing historical values or related-material functionality.

## 1. Meeting edit form

Normal UI must NOT show:
- `要フォロー` checkbox
- `フォローアップメモ` textarea
- `関連資料（詳細画面で操作）` selector

Important:
- `meeting-edit-relatedPitchbookIds` currently has HTML `hidden`, but edit-grid CSS can override its effective display. Fix this robustly, e.g. scoped `[hidden]{display:none!important}` or equivalent.
- legacy follow-up values and relatedPitchbookIds MUST survive unrelated edit/save unchanged.

Smallest safe approach is allowed:
- keep compatibility controls/state hidden in DOM and populate them, OR
- preserve values in explicit edit state.

Do not hard-reset follow-up fields to false/blank.
Do not unlink related materials during ordinary edit.

## 2. Detail read-only attributes

Remove from normal detail presentation:
- `要フォロー`
- `フォローメモ`

Backend/historical values remain intact.

Do not remove other detail attributes unless explicitly required.

## 3. Primary action row

Current general `.actions` spreads controls across the row.

For Meeting detail primary actions, left-align one compact row in this exact order:
`Google Docs原本` → `記録を編集` → `記録を削除（Inactive）`

On Inactive record, preserve current lifecycle label behavior (`記録を復元`) but keep the same left-aligned position.

Use a dedicated scoped class; do not globally change every `.actions` group.

Mobile/narrow may wrap safely.

## 4. Related-material action row

Raw internal identifier is not a user-managed concept.

Normal UI must NOT show:
- `既存Document_ID` label
- raw Document ID input

Keep these actions as a compact left-aligned row:
`既存資料を関連付ける` → `資料を追加`

### Existing-material picker

`既存資料を関連付ける` must remain usable without raw ID entry.

On click, open a small accessible picker/modal/list using existing read APIs where possible.

Candidate defaults:
- current Meeting counterparty
- current Meeting Asset Class
- Active materials
- bounded result count

Prefer reusing `searchPitchbookRecords` or an existing maintenance read facade. Do not create new storage. Add a new read-only facade only if truly required.

Candidate display must be human-readable:
- date
- title / saved filename
- Fund / Strategy when available
- other useful classification if already present

Do NOT use raw Document_ID as the primary visible choice.

Already-linked materials should be excluded or clearly disabled.

On selection:
- internally use the material's Document_ID
- call existing relation mutation path
- preserve current optimistic/retry/relation semantics
- refresh Meeting detail
- show success/error status

Cancel/Esc/backdrop behavior should be safe if a modal is used. No mutation before explicit selection.

## 5. Preserve related-material detail operations

Do not break:
- related material list
- 原本 open
- 分類を編集
- unlink / undo-unlink behavior
- `資料を追加` upload path

## 6. Focused tests

Add/update tests for at least:
- edit follow-up controls not visible
- edit related selector truly hidden even with grid CSS
- legacy follow-up values preserved through unrelated update
- relatedPitchbookIds preserved through unrelated update
- detail follow-up attributes absent
- primary action row left aligned/order
- related action row left aligned/order
- raw Document_ID label/input absent from normal UI
- existing-material picker uses human-readable labels
- already-linked item not normally selectable
- picker selection links correct internal ID
- add-files / existing relation / unlink regression
- mobile safe wrap

Run:
- focused tests
- `npm run check`
- canonical bundle regeneration
- `npm run check:bundle`
- `git diff --check`

## 7. Target runtime qualification

Use SAME existing owner-only Web App.

Use isolated synthetic data only.

Required actual evidence:
1. Past Records -> detail -> edit
2. follow-up UI absent in edit
3. related edit selector absent
4. detail follow-up attributes absent
5. primary actions left aligned
6. related actions left aligned
7. raw Document_ID absent
8. existing-material picker shows human-readable candidates
9. link one synthetic existing material via picker; relation appears after refresh
10. unrelated Meeting edit preserves pre-existing follow-up values and relations
11. 2560 / 1440 / 1280 / 390
12. all 7 normal pages nonblank smoke
13. console material error/warn0

Provider calls 0.

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

Maximum 2 coherent repair/runtime cycles.

## Git delivery

Branch: `codex/0040-past-meeting-edit-cleanup`
Create exactly one Draft PR. Do not merge.
Report: `docs/handoffs/0040-CODEX-01-past-meeting-edit-cleanup-report.md`

## Return

```text
WORK_ID: 0040
DISPATCH_ID: 0040-CODEX-01
BALL: CHATGPT
STATUS: RETURNED
```