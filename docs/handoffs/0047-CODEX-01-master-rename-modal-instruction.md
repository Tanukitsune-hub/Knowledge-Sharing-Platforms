# Work 0047 CODEX-01 — empty identity hero cleanup + Master rename modal

WORK_ID: 0047
DISPATCH_ID: 0047-CODEX-01
BALL: CODEX
STATUS: READY
MODE: BUILD

## Primary Outcome

Work0046 version28 accepted baselineを維持し、以下だけを完成させる。

1. 過去の記録 > 記録の詳細で未選択時に見える空pillを消す。
2. マスター管理の名称変更をnative promptから専用modalへ置換する。

## Recommended model

GPT-5.6 Luna Max。

理由: root causeとUX contractは固定済みで、残作業は限定的なHTML/CSS/client implementationとruntime verification。

## Read first

- `docs/handoffs/0047-meeting-detail-master-rename-modal-requirements.md`
- `docs/planning/work0047-meeting-detail-master-rename-modal.md`
- `docs/handoffs/0046-completion-report.md`

## Empty pill

Confirmed cause:
empty `#meeting-detail-identity.meeting-detail-hero` still gets inline-flex / padding / border.

Required:
- initial empty state: hidden
- selected Meeting: existing Meeting ID / Version hero visible
- selection cleared: hidden again
- no extra gap

Prefer the smallest deterministic fix such as:
```css
#meeting-detail-identity.meeting-detail-hero:empty{display:none}
```
unless current runtime behavior requires explicit JS hidden state.

## Rename modal

Replace only Master rename native `prompt()`.

One reusable modal for:
- COUNTERPARTY
- ASSET_CLASS
- LOCATION
- TEAM

Dynamic Japanese title, current name prefilled, `新しい名称` input, `キャンセル`, `変更を保存`, close ×, modal status.

Use existing modal classes / visual language where possible.

Behavior:
- open => focus input
- Enter => submit
- Escape / Cancel / × => close, mutation 0
- valid submit => existing `mutateMaster(... RENAME ...)` exactly once
- success => close + refreshed list
- duplicate/server error => modal stays open, error visible, input preserved
- return focus to trigger when possible
- empty trimmed input rejected client-side
- no native prompt for Master rename

Preserve Work0046:
- dirty Option reorder draft keeps rename disabled
- modal cannot bypass that guard
- opening/canceling modal does not alter reorder draft
- no reorder redesign

## Tests

Focused tests must cover:
- empty hero hidden initial / visible selected / hidden reset
- master rename prompt count 0
- four master categories modal title/prefill
- Cancel mutation 0
- one valid Save = one RENAME RPC
- failure keeps modal open
- Enter / Escape
- dirty reorder rename disabled
- Meeting ID / Version selected hero preserved

Then:
- focused tests
- `npm run check`
- bundle regeneration
- `npm run check:bundle`
- `git diff --check`

## Runtime qualification

Same owner-only Web App.

Expected final served version: 29.

Required runtime:
- Past Meeting initial screenshot/state: empty dot 0
- select Meeting: identity hero visible
- selection clear: empty dot 0
- Master rename modal at 1440 and 390
- verify Counterparty + one Option successful reversible rename flow if safe
- for remaining master types, open/cancel path is sufficient if real rename would alter business data
- final master names equal pre-qualification state
- console material error/warn 0
- Work0046 visible cleanup / staged reorder smoke PASS
- provider calls 0

## Safety

```text
SCHEMA_CHANGE: 0
MIGRATION_CHANGE: 0
REORDER_CONTRACT_CHANGE: 0
PROVIDER_CALLS: 0
AI_SYNC_CHANGE: 0
PERMISSION_BROADENING: 0
PUBLIC_EXPOSURE: 0
FINAL_MASTER_NAME_DRIFT: 0
WORK_0030: DEFERRED_BY_USER
```

## Delivery

Branch:
`codex/0047-master-rename-modal`

Draft PR, do not merge.

Report:
`docs/handoffs/0047-CODEX-01-master-rename-modal-report.md`

Update:
`docs/handoffs/0047-dispatches.md`

Report must include:
- exact empty-pill root cause/fix
- production source files changed
- native prompt removal evidence
- modal keyboard/focus/error evidence
- rename mutation counts
- final master name restoration
- tests/bundle/runtime
- served version
- side effects
- BLOCKER / READY_FOR_CHATGPT_FINAL_REVIEW

WORK_ID: 0047
DISPATCH_ID: 0047-CODEX-01
BALL: CODEX
STATUS: READY
