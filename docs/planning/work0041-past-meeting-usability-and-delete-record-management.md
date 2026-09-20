# Work 0041 — 過去の記録 usability / 削除記録の管理 plan

WORK_ID: 0041
STATUS: ACCEPTED
MODE: BUILD
BALL: NONE
ACTIVE_DISPATCH: NONE

## Primary Outcome

`過去の記録`で可能な操作を初期表示から理解でき、待機中かどうかも明確に判断できるUIへ改善する。同時に、通常利用者の削除UIを簡潔に保ったまま、管理者ページに安全な`削除記録の管理`と復元経路を設ける。

## Dependency

Work0040 accepted production baseline。Work0040がCompletion Latch適用済みになるまで実装を開始しない。

## Fastest Safe Decisive Action

1. Work0040 acceptance後のlatest mainから開始。
2. current Past Meeting DOM / status mutation / admin page facadeを再利用。
3. hidden-panelを単純解除するのではなく、未選択empty-state + disabled controlsとしてstateを明示。
4. loading stateはclient-side共通patternへ可能な範囲で収束。
5. table cellはtable-cellのまま、inner action wrapperだけflex化。
6. deleteはuser-facing labelだけ変更し、backendはInactive semanticsを維持。
7. 管理者ページは既存Meeting search/status mutationを再利用し、新storageを作らない。
8. owner-only runtimeでdelete -> admin restore -> normal list再表示をend-to-end確認。

## Required Scope

- Past Meeting persistent detail / related / edit empty-state
- loading UX
- list border alignment
- `無効化` -> `削除`
- admin `削除記録の管理`
- Inactive -> Active restore path

## Closed Conclusions

- normal-user画面へ復元controlを置かない。
- 管理者section名は`削除記録の管理`。
- deleteはsoft delete（Inactive）のまま。
- progress percentageは実測不能なら表示しない。
- empty-stateを非表示より優先する。
- Work0040 accepted behaviorをpreserveする。

## Target runtime acceptance sequence

1. `過去の記録` initial empty-state確認。
2. search busy state確認。
3. result row border alignment確認。
4. detail busy -> loaded確認。
5. edit busy -> loaded -> save busy確認。
6. synthetic Active Meetingを`削除`。
7. normal Active searchから消えることを確認。
8. 管理者ページ`削除記録の管理`でInactive表示。
9. `復元`実行。
10. normal `過去の記録`へ戻り再表示。
11. 2560 / 1440 / 1280 / 390 sweep。
12. console material error/warn 0。

## Completion Latch

Primary Outcomeがsame owner-only runtimeでend-to-end PASSし、delete/restoreのoptimistic concurrency / Auditを維持、schema/migration/physical delete 0、tests/bundle PASS、BLOCKERなし、GitHub更新後にCompletion Latchを適用する。