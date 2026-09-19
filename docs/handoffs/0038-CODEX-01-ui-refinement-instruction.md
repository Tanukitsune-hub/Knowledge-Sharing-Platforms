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
`AI検索モード → AIモデル → intentional gap → 非AI出力`

12-column target:
- AI検索モード: columns 1-3
- AIモデル: columns 4-6
- column 7: intentionally blank / visual separation
- 非AI出力: columns 8-9

Do not send non-AI output to far right edge. It should remain visually near the AI controls but clearly separated from them.

Keep visible non-AI presentation:
- field label `非AI出力`
- button `全文出力`

Do not rename `全文出力` unless required by existing exact source contract.

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
Row 5: 登録                         資料を添付（任意）
Row 6: 面談内容 full width
```

Concrete grid intent:
- `.meeting-field-counterparty-person`: col1/span6 row3
- `.meeting-field-internal-participants`: col1/span6 row4
- `.meeting-field-submit`: col1/span3 (or fit-content inside left half) row5
- `#attachment-section`: col7/span6; grid-row:3/span3
- `.meeting-field-notes`: col1/span12 row6

`登録` must be immediately below the 当社側 input, left aligned and compact.

Do not place Register to the right of 当社側 anymore.

### Attachment block

`資料を添付（任意）` must occupy the right side of the participant region with enough vertical space.

Version13 inner workspace was roughly 83/17. Make the drop area narrower.

Target inner split:
- drop area approximately 70%
- action column approximately 30%

Use a safe minimum action-column width so these labels do not clip:
- `資料選択をクリア`
- `未完了分を再試行`

Actions remain vertically stacked, clear first then retry.

Rename button exact text:
`選択をクリア` -> `資料選択をクリア`

Do not change clear behavior.

Attachment panel should stretch vertically across rows 3-5 and visually align with the participant/register region. Avoid a cramped short box.

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
- desktop columns 1-3 / 4-6 / gap7 / output8-9
- mobile stack order
- non-AI Full Output provider-independent behavior preserved
- Meeting participant/register/attachment grid coordinates
- attachment row span / vertical sizing contract
- inner attachment split materially narrower than version13 (~70/30)
- exact `資料選択をクリア` text
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
3. desktop Row3 mode -> model -> gap -> non-AI output
4. non-AI Full Output works without provider call
5. Meeting-create participant/register/attachment geometry at 2560 / 1440 / 1280
6. mobile safe stack at 390
7. exact `資料選択をクリア` label
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