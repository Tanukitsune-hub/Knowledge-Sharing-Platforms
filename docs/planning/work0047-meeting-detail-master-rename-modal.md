# Work 0047 — Meeting detail empty hero + Master rename modal plan

WORK_ID: 0047
STATUS: ACCEPTED
MODE: BUILD
BASELINE: Work0046 version28
ACTIVE_DISPATCH: NONE
BALL: NONE

## Primary Outcome

未選択時の空Meeting identity pillを除去し、Master名称変更を専用modalへ置換する。

## Fastest Safe Decisive Action

1. latest main / Work0046 accepted baseline確認。
2. empty identity heroのroot causeをfocused testで固定。
3. `:empty` またはequivalent最小修正で未選択時だけ非表示。
4. existing modal styleを再利用したMaster Rename modalを追加。
5. native `prompt()` rename pathをmodal formへ置換。
6. reorder dirty guard / backend mutation contractを維持。
7. focused tests + npm / bundle。
8. same owner-only Web Appへ1回deploy。
9. Past Meeting initial/select/clear + 4 Master rename flowsをruntime確認。
10. ChatGPT reviewへ返却。

## Expected production scope

Likely:
- `src/MaintenancePages.html`
- `src/ClientMaintenance.html`
- `src/Styles.html`

Backend `.gs`変更は原則不要。

If backend change becomes necessary, explain why and keep existing mutation semantics unchanged.

## Deployment budget

```text
SOURCE_SYNC: <=1
IMMUTABLE_VERSION: <=1
EXISTING_DEPLOYMENT_UPDATE: <=1
NEW_TARGET: 0
SECOND_DEPLOYMENT: 0
EXPECTED_FINAL_SERVED_VERSION: 29
ACCESS_CHANGE: 0
```

## Non-goals

- schema / migration
- provider
- permission
- reorder redesign
- generic replacement of all confirm / prompt UI


## Accepted Outcome

Work0047 completed in PR #69 / version29.
Completion Latch applied. No further Work0047 action is required unless a material regression is found.
