# Work 0053 — Japanese UI copy polish plan

WORK_ID: 0053
STATUS: ACTIVE
MODE: BUILD
BASELINE: Work0052 version34
ACTIVE_DISPATCH: 0053-CODEX-02
BALL: CODEX

## Primary Outcome

全user-facing copyを自然で一貫した日本語へ整え、accepted product brandを `Private Assets Intelligence` へ統一する。

## Fastest Safe Decisive Action

1. `docs/design/product-brand.md` と user-facing string inventoryを確認する。
2. brand surfaceを `Private Assets Intelligence` に統一し、subtitleを削除する。
3. `docs/design/ui-japanese-copy-guidelines.md`に沿って候補を分類。
4. awkward / technical / English leakageだけを限定修正。
5. brand / terminology consistency testsを追加。
6. 1440 / 390 browser review。
7. no logic-change diffを確認。
8. same owner-only runtimeへbounded deploy。
9. ChatGPT final review。

## Routing

Route C planned.

Recommended model:
- GPT-5.6 Sol High

Reason:
複数画面・error map・generated outputへ跨る文言を、意味を変えずに一貫して修正する必要がある。

## Safety

```text
PRIMARY_CHANGE_TYPE: USER_FACING_COPY_ONLY
BUSINESS_LOGIC_CHANGE: 0
BACKEND_API_CHANGE: 0
SCHEMA_CHANGE: 0
MIGRATION_CHANGE: 0
PERMISSION_CHANGE: 0
WORK_0030: DEFERRED_BY_USER
```


## Baseline reconciliation

The old stacked PR #75 was produced before Work0051/0052 reached accepted version34.
Do not merge it directly.

Reconcile only the Work0053 semantic copy/brand changes onto latest main, preserving all accepted Work0051/0052 source and regenerated artifacts.

Keep the visible `管理者ページ` label. Do not implement Work0054 in this Work.

Known Entity Workspace 390px overflow is Work0056 follow-up; Work0053 may not worsen it.
