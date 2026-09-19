# Work 0037 dispatch control

WORK_ID: 0037
DISPATCH_ID: 0037-CODEX-02
ACTIVE_DISPATCH_ID: 0037-CODEX-02
BALL: CODEX
STATUS: READY
MODE: BUILD
PHASE: FINAL_REVIEW_REPAIR / MASTER_TAB_DRAFT_OWNERSHIP

## Primary Outcome

Work0037のfrozen UI refinementを保持し、最終レビューで判明したマスター追加フォームのタブ間入力混在・遅延応答による入力消去を修復する。同じPR #59を最小修正で最終受入へ進める。

## Active instruction

`docs/handoffs/0037-CODEX-02-master-tab-state-repair-instruction.md`

Controller review:
`docs/handoffs/0037-CODEX-01-controller-review.md`

Frozen requirements:
`docs/handoffs/0037-ui-refinement-requirements.md`

## CODEX-01返却の扱い

```text
RETURNED_HEAD: d1310034b2fe6b6ff5a847108fdae22d2f8f79c7
PR: #59 / Draft / unmerged
REPORTED_SERVED_VERSION: 12
REPORTED_LOGIC_VALIDATION: 563/563 PASS
REPORTED_BUNDLE_VALIDATION: 30/30 PASS
REPORTED_TARGET_RUNTIME: 7 screens / 2560 / 1440 / 1280 / 390 PASS
CONTROLLER_COUNTEREVIDENCE: SOURCE_FUNCTION_HARNESS
ACTIVE_BLOCKER: MASTER_TAB_DRAFT_OWNERSHIP
WORK_ACCEPTANCE: PENDING
```

CODEX-01の既存証拠はその確認範囲で保持する。今回の反証はMastersの未送信draft・非同期送信に限定し、UI全体を再設計しない。

## CODEX-02の必須成果

- ASSET_CLASS / LOCATION / TEAMごとの入力draft分離・復元。
- 送信開始時type/name/request snapshotの保持。
- 遅い成功/失敗が他タブまたは後から変更した入力を破壊しない。
- 同じ追加の二重実行防止。
- source-based interaction testsと短い同一target runtime確認。

## Closed Conclusions

- Work0036/version11はaccepted baseline。
- Work0037の6画面frozen requirementsは変更しない。
- 追加shared-password gate撤去は明示承認済み。owner-only deploymentは維持。
- Counterparty shared modal、Equity/Debt policy、non-AI Full Outputは保持。
- Work0035はSUPERSEDED。Work0030はDEFERRED_BY_USER。

## Safety / budget

```text
SCHEMA_CHANGE: 0
MIGRATION_CHANGE: 0
PROVIDER_BEHAVIOR_CHANGE: 0
SECURITY_MODEL_CHANGE: 0
NEW_TARGET: 0
SECOND_DEPLOYMENT: 0
PERMISSION_BROADENING: 0
PUBLIC_EXPOSURE: 0
CONFIDENTIAL_DATA: 0
PHYSICAL_DELETE: 0
PROVIDER_CALLS: 0
AI_SYNC: DISABLED / UNCHANGED
REPAIR_RUNTIME_CYCLES: MAX_2
SYNTHETIC_OPTION_CREATE: MAX_1
```

## Dispatch history

| Dispatch | 結果・位置づけ |
|---|---|
| 0037-CODEX-01 | version12へ実装・報告。controller reviewでMasters input-stateの反証を確認。 |
| 0037-CODEX-02 | READY。上記1 failure classの修復のみ。 |

```text
NEXT_UNUSED_DISPATCH: 0037-CODEX-03
WORK_0037_COMPLETE: NO
COMPLETION_LATCH: NOT_APPLIED
```

WORK_ID: 0037
DISPATCH_ID: 0037-CODEX-02
BALL: CODEX
STATUS: READY
