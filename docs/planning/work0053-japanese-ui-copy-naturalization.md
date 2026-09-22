# Work 0053 — Japanese UI copy polish plan

WORK_ID: 0053
STATUS: PLANNED
MODE: BUILD
DEPENDENCY: Work0052 ACCEPTED
ACTIVE_DISPATCH: NONE
BALL: NONE

## Primary Outcome

全user-facing copyを自然で一貫した日本語へ整える。

## Fastest Safe Decisive Action

1. user-facing string inventoryを作る。
2. `docs/design/ui-japanese-copy-guidelines.md`に沿って候補を分類。
3. awkward / technical / English leakageだけを限定修正。
4. terminology consistency testsを追加。
5. 1440 / 390 browser review。
6. no logic-change diffを確認。
7. same owner-only runtimeへbounded deploy。
8. ChatGPT final review。

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
