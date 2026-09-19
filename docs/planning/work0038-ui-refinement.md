# Work 0038 — Post-version13 UI refinement

WORK_ID: 0038
STATUS: ACTIVE
MODE: BUILD
PHASE: READY_FOR_CODEX

## Primary Outcome

Work0037/version13をaccepted baselineとして、Knowledge SearchとMeeting-createの追加UI refinementを最小変更でproductionへ反映し、same owner-only Web Appでactual runtime認定する。

Authoritative requirements:
`docs/handoffs/0038-ui-refinement-requirements.md`

## Work Contract

### Acceptance Evidence

Evidence hierarchy:
1. actual owner-only Web App rendered UI / interaction / console
2. target/deployment/source parity
3. focused deterministic tests + canonical check/bundle
4. source inspection

Required actual evidence:
- 2560 / 1440 / 1280 / 390
- Knowledge Search Row3 exact order/spacing and label
- non-AI Full Output still provider-independent
- Meeting-create participant/register/attachment geometry
- attachment clear label exact text
- Meeting submit/file interactions regression-free
- console material error/warn0

### Fastest Safe Decisive Action

1. latest main/version13 parity確認
2. 2画面だけsource/CSSを変更
3. focused tests + canonical validation
4. same targetにsource sync1 / immutable version1 / same deployment update1
5. actual browser qualification

### Required Scope

- Knowledge Search mode label/order/spacing
- Meeting-create register placement
- Meeting-create attachment placement/inner width
- attachment clear label rename
- necessary tests/bundle

### Non-Goals

- schema/migration
- search/provider/business logic redesign
- other tabs
- sidebar/theme redesign
- Work0030
- Work0035 UI Studio

### Closed Conclusions

- baseline: Work0037/version13
- Knowledge Search initial mode remains 要約
- non-AI Full Output behavior unchanged
- Meeting-create Meeting Type behavior unchanged
- Counterparty modal unchanged
- Equity/Debt policy unchanged
- admin owner-only boundary unchanged

### Retry cap

Maximum 2 coherent repair/runtime cycles.

### Completion

After actual UI evidence + tests pass, ChatGPT reviews PR and applies Completion Latch.
## Latest frozen refinement — 2026-09-20

- Knowledge Row3: AI mode col1-3, AI model col4-6, non-AI output col7-8. Non-AI output aligns with Asset Class start7.
- Meeting attachment: right half row3/span2 only, height aligned to 面談相手+当社側; Register remains row5 left.
- Remove attachment help text `記録保存 → ファイル保存 → 関連付けの順に処理します。`.
- Shorten drop zone vertically.
- Move `資料選択をクリア` / `未完了分を再試行` directly below drop zone; no right-side action column.
## Latest geometry override — 2026-09-20 (2)

- Meeting participant region widens to 7/12.
- Attachment region narrows to 5/12 and remains row3/span2.
- Register sits row5 left.
- Clear/Retry sit row5 right, outside attachment block.
- Drop zone uses full attachment width.
- Attachment help remains removed; vertical size remains equal to two participant fields.