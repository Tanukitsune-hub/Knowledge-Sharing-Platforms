# CODEX-01 — Implement Work0038 frozen UI refinement

WORK_ID: 0038
DISPATCH_ID: 0038-CODEX-01
BALL: CODEX
STATUS: READY
MODE: BUILD

## Authoritative contract

Read latest `origin/main`, root/nearest `AGENTS.md`, then:
- `docs/handoffs/0038-ui-refinement-requirements.md`
- `docs/planning/work0038-ui-refinement.md`
- `docs/handoffs/0038-dispatches.md`
- `docs/handoffs/0037-completion-report.md`

Requirements are frozen. Do not broaden redesign.

## Baseline

```text
PRODUCTION_BASELINE: Work0037 / version13
MERGE_BASELINE: PR #59 / 6e9fc1d1d6a3578fc101fa2eef5849b62e0cd255
OWNER_ONLY_DEPLOYMENT: preserve
SCHEMA8: preserve
AI_SYNC: disabled / preserve
WORK_0030: DEFERRED_BY_USER
```

## Primary Outcome

Implement exactly two screen refinements: Knowledge Search Row3 semantics/placement and Meeting-create participant/register/attachment layout.

## 1. Knowledge Search

### Label

Change label:
`検索モード` -> `AI検索モード`

Do not change mode values or semantics.

### Row 3 exact desktop order

Use source/DOM order and visual order:
`AI検索モード → AIモデル → 非AI出力`

12-column target:
- AI検索モード: columns 1-3
- AIモデル: columns 4-6
- 非AI出力: columns 7-8

`AIモデル` must sit immediately beside `AI検索モード`; do not leave an intentional blank column between them.

`非AI出力` must align horizontally with the `Asset Class` field one row above. In the accepted version13 Knowledge filter row, Asset Class starts at column7, so non-AI output also starts at column7. This supersedes the prior column8 target.

Keep visible non-AI presentation:
- field label `非AI出力`
- button `全文出力`

Do not rename `全文出力`.

On mobile <=720px stack in the same semantic order:
1. AI検索モード
2. AIモデル
3. 非AI出力

### Preserve

- initial/default mode remains `要約`
- clear resets to `要約`
- non-AI Full Output is usable without configured AI model
- Full Output does not invoke AI provider
- AI search button / instruction field behavior unchanged

## 2. Meeting-create

### Participant / attachment region

Re-layout desktop as:

```text
left columns 1-6                    right columns 7-12
Row 3: 面談相手                     資料を添付（任意）
Row 4: 当社側                       資料を添付（任意）
Row 5: 登録
Row 6: 面談内容 full width
```

Concrete grid intent:
- `.meeting-field-counterparty-person`: col1/span6 row3
- `.meeting-field-internal-participants`: col1/span6 row4
- `.meeting-field-submit`: col1/span3 (or compact inside left half) row5
- `#attachment-section`: col7/span6; grid-row:3/span2
- `.meeting-field-notes`: col1/span12 row6

`登録` must be immediately below the 当社側 input, left aligned and compact.

Attachment block height must visually equal the combined height of the left-side 面談相手 + 当社側 fields. It must end with row4 and must NOT extend into the Register row5.

### Attachment block

Remove the user-facing help text exactly represented by:
`記録保存 → ファイル保存 → 関連付けの順に処理します。`

Do not leave an empty spacer in its place.

Make the drop zone vertically shorter than version13.

Place action buttons immediately BELOW the drop zone, not to its right.

Desktop attachment internal structure:
1. heading `資料を添付（任意）`
2. compact drop zone
3. compact action row directly below drop zone

Action row:
- `資料選択をクリア`
- `未完了分を再試行`

Prefer horizontal side-by-side buttons on desktop with a normal gap. If width becomes unsafe, allow wrapping without clipping. Do not create a dedicated right-side action column.

Preserve file summary/list/status below as needed without making the visible empty-state panel exceed the two-field vertical target. When files/status are actually present, content may naturally expand below; the alignment requirement applies to the normal empty/default state.

### Mobile

At <=720px safe stack:
1. 面談相手
2. 当社側
3. 登録
4. 資料を添付（任意）
5. 面談内容

Attachment inner workspace may become one column on mobile.

### Preserve

- Meeting Type row1 accepted behavior
- Date/Time/Location/Team/Asset layout
- Counterparty/Fund row
- submit validation/busy/retry semantics
- file drop/click/clear/retry semantics
- notes accepted height
- Counterparty modal
- Equity/Debt hidden policy

## 3. Focused tests

Add/update tests for at least:
- exact `AI検索モード` label
- Knowledge Row3 DOM order = mode / model / full output
- desktop columns 1-3 / 4-6 / output7-8
- non-AI output horizontal start matches Asset Class start
- mobile stack order
- non-AI Full Output provider-independent behavior preserved
- Meeting participant/register/attachment grid coordinates
- attachment grid-row = 3/span2, not spanning Register row
- default attachment block visual height contract matches the two participant fields
- attachment help text removed
- drop zone vertical size reduced from version13
- exact `資料選択をクリア` text
- clear/retry buttons below drop zone, no right action column
- existing clear/retry behavior unchanged
- mobile stack
- Work0037 Masters state repair regression

Run:
- focused tests
- `npm run check`
- canonical bundle regeneration
- `npm run check:bundle`
- `git diff --check`

## 4. Target runtime qualification

Use SAME existing organization-controlled Apps Script project and SAME single owner-only versioned Web App.

Before mutation read-only verify:
- target identity
- current served version13
- saved source parity
- immutable version13 parity
- single owner-only deployment

Then shortest mutation path:
- source sync max1 per coherent cycle
- immutable version max1 per coherent cycle
- same deployment update max1 per coherent cycle

Actual browser checks:
1. Knowledge Search 2560 / 1440 / 1280 / 390
2. exact `AI検索モード` label
3. desktop Row3 mode -> model immediately adjacent -> non-AI output aligned with Asset Class
4. non-AI Full Output works without provider call
5. Meeting-create participant/register/attachment geometry at 2560 / 1440 / 1280, including attachment height matching participant+internal fields
6. mobile safe stack at 390
7. attachment help text absent; exact `資料選択をクリア` label; clear/retry directly under drop zone
8. file clear/retry controls remain operable
9. Register button remains operable/validated
10. all 7 nav pages remain nonblank
11. console material error/warn0

## 5. Safety

```text
NEW_TARGET: 0
SECOND_DEPLOYMENT: 0
PERMISSION_BROADENING: 0
PUBLIC_EXPOSURE: 0
SCHEMA_CHANGE: 0
MIGRATION_CHANGE: 0
PROVIDER_TRANSITION: 0
CONFIDENTIAL_DATA: 0
PHYSICAL_DELETE: 0
WORK_0030: DEFERRED_BY_USER
```

Provider calls must remain 0 during qualification. Full Output is non-AI.

## Git delivery

Branch:
`codex/0038-ui-refinement`

Create exactly one Draft PR. Do not merge.

Report:
`docs/handoffs/0038-CODEX-01-ui-refinement-report.md`

## Return contract

After implementation + tests + target runtime qualification:
```text
WORK_ID: 0038
DISPATCH_ID: 0038-CODEX-01
BALL: CHATGPT
STATUS: RETURNED
```

Ordinary CSS/HTML/JS/test defects are owned and repaired autonomously. Maximum 2 coherent repair/runtime cycles.