# CODEX-02 — Meeting-create header/status refinement

WORK_ID: 0038
DISPATCH_ID: 0038-CODEX-02
BALL: CODEX
STATUS: READY
MODE: BUILD

## Context

CODEX-01 completed the frozen Knowledge Search + Meeting-create geometry and returned on Draft PR #60.

```text
PR: #60
CODEX-01_HEAD: 1b67faf31722529d270bf3d93691394fe65520f4
REPORTED_FINAL_SERVED_VERSION: 15
REPORTED_LOGIC_VALIDATION: 572/572 PASS
REPORTED_BUNDLE_VALIDATION: 30/30 PASS
REPORTED_TARGET_RUNTIME: PASS
PR_MERGE: NOT PERFORMED
```

Preserve CODEX-01 accepted evidence within its observed scope. Do not redo or redesign unrelated surfaces.

## Authoritative sources

Read latest `origin/main`, root/nearest `AGENTS.md`, then:
- `docs/handoffs/0038-ui-refinement-requirements.md`
- `docs/planning/work0038-ui-refinement.md`
- `docs/handoffs/0038-dispatches.md`
- `docs/handoffs/0038-CODEX-01-ui-refinement-report.md` from PR branch if needed

## Primary Outcome

Apply only the latest Meeting-create top-of-card refinement while preserving CODEX-01 geometry and behavior.

## Exact UI change

### 1. First row

At the very top of the Meeting-create card, create one compact header row in this order:

`記録を追加` → `下書きをクリア` → `面談入力の準備ができました。`

Requirements:
- Keep `記録を追加` as the page/card heading.
- Place `下書きをクリア` immediately to the right of the heading.
- Place the initial-ready status after the clear button.
- Keep spacing compact and visually balanced.
- Do not make this row a full-width tinted information bar unless required for accessibility.

### 2. Remove explanatory draft copy

Delete the visible copy:
`下書きや入力内容を消去して、新しい記録を開始できます。`

Do not leave an empty spacer.

### 3. Move initial-ready status

Current bootstrap success:
`面談入力の準備ができました。`

must render in the top header row, not at the bottom of the form.

The ready message must be compact / content-width, not a full-width status block.

Implementation options:
- move/reuse `#meeting-status` into the header row; OR
- add a dedicated initial-ready inline status and keep operational status separately.

Choose the simpler implementation that preserves all existing behavior.

### 4. Preserve operational status

Do NOT lose:
- required-field validation errors
- submit success/error
- retry-related feedback
- bootstrap failure errors
- other Meeting status messages

Do not duplicate the same status at top and bottom.

If reusing one status node at top, make sure longer error/success messages can wrap safely and are not clipped by compact styling.

### 5. Responsive

Desktop:
- heading + clear + status in one row.

Mobile / narrow:
- safe wrapping is allowed.
- semantic order remains heading -> clear -> status.
- no horizontal overflow.

## Preserve CODEX-01

Do not change unless needed to prevent regression:
- Knowledge Search geometry/labels
- Meeting participant span7 / attachment span5
- attachment row3/span2
- Register row5 left
- clear/retry row5 right
- attachment help removed
- file clear label `資料選択をクリア`
- notes height
- Meeting Type
- Counterparty modal
- Equity/Debt policy
- Work0037 Masters repair
- owner-only deployment boundary

## Focused tests

Add/update tests for:
- top row contains heading then clear button then ready status in DOM/visual order
- removed draft explanatory copy absent
- bootstrap ready message appears only in top region
- no duplicate ready message
- operational meeting status errors/success still render
- desktop no overflow
- 390px safe wrap
- CODEX-01 geometry regression checks remain PASS

Run:
- focused tests
- `npm run check`
- canonical bundle regeneration
- `npm run check:bundle`
- `git diff --check`

## Runtime qualification

Use same existing target / same single owner-only Web App.

Because CODEX-01 already qualified all 7 screens, keep runtime scope minimal:
- Meeting-create at 2560 / 1440 / 1280 / 390
- verify top row order / compact status
- verify explanatory copy absent
- verify required-field validation still visible
- verify all 7 nav pages nonblank as a smoke check
- console material error/warn0

Provider calls 0. No record/file mutation required.

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

Continue SAME branch / SAME Draft PR #60.

Branch:
`codex/0038-ui-refinement`

Do not create a new PR. Do not merge.

Report:
`docs/handoffs/0038-CODEX-02-meeting-header-status-report.md`

## Return

```text
WORK_ID: 0038
DISPATCH_ID: 0038-CODEX-02
BALL: CHATGPT
STATUS: RETURNED
```