# CODEX-02 — マスター追加フォームのタブ別入力状態修復 report

WORK_ID: 0037
DISPATCH_ID: 0037-CODEX-02
BALL: CHATGPT
STATUS: RETURNED
MODE: BUILD

## Outcome

PR #59の`MASTER_TAB_DRAFT_OWNERSHIP`だけを修復した。ASSET_CLASS / LOCATION / TEAMの未送信draftを分離し、登録開始時のtype・name・request identityを固定した。遅い成功・失敗は送信元draftだけへ帰属し、別タブまたは送信後に更新した入力を消さない。同じ追加の二重送信も抑止する。

same existing target / same single owner-only Web Appをversion13へ更新し、source parityと通常browser経路を確認した。

```text
OUTCOME: PASS
FAILURE_CLASS: MASTER_TAB_DRAFT_OWNERSHIP / CLOSED
FINAL_SERVED_VERSION: 13
READY_FOR_CHATGPT_FINAL_REVIEW: YES
BLOCKER: NONE
```

## 修正前再現

`src/ClientMaintenance.html`を直接読み込む隔離DOM/RPC harnessを先に追加し、修正前sourceで次を確認した。

```text
PRE_FIX_FOCUSED_TESTS: 0/4 PASS / 4 FAIL
D1_CROSS_TAB_DRAFT_LEAK: REPRODUCED
D2_LATE_SUCCESS_CLEARS_OTHER_DRAFT: REPRODUCED
D3_FAILURE_ORIGIN_OWNERSHIP: REPRODUCED
D4_DUPLICATE_SUBMIT: REPRODUCED
LIVE_MUTATION: 0
```

mock側へ別実装を置かず、テストはproduction HTMLのscriptをVMで実行している。

## Implemented scope

- `MASTER_OPTION_TAB_TYPES`をASSET_CLASS / LOCATION / TEAMの明示allowlistとして追加。
- 3区分ごとのRAM draftを保持し、タブ切替元の保存と切替先の復元を実装。COUNTERPARTY経由でもOption draftは混在しない。
- 一覧再描画・再読込前に現在のOption draftを保存し、active tabと全draftを維持。
- OPTION追加開始時にtype・name・request IDをsnapshot。
- 成功時は送信元draftがsnapshotと同一の場合だけclear。別タブと送信後の新しい入力は保持。
- 失敗時は送信元区分を含むsafe errorを表示し、全draftを保持。
- pending request lockとsubmit button disableで二重送信を抑止。

schema、migration、backend service、security、provider、他画面layoutは変更していない。

## D1–D4 evidence

| Contract | Logic evidence | Actual runtime evidence | Result |
|---|---|---|---|
| D1 draft分離・復元 | production-source VMで3 Option tabs + COUNTERPARTY経由を検証 | Asset ClassとTeamへ別draftを入力し、空の切替先と両方の復元を確認 | PASS |
| D2 遅い成功 | deferred Promiseでpayload `ASSET_CLASS`固定、Team draft保持、同タブnewer draft保持を検証 | local production browser harnessで250ms遅延成功中のtab切替・Team入力保持を確認。Google実機ではtiming合わせのmutationを実施せず | PASS |
| D3 遅い失敗 | deferred failureで送信元・別タブdraft保持とorigin labelを検証 | timingを作るための実機mutationは行わず、production-source deterministic evidenceを採用 | PASS |
| D4 回帰 | duplicate RPC 1件、refresh保持、allowlistを検証 | 実機再読込でactive Asset ClassとAsset/Team両draft保持、既存Counterparty modalをCancel mutation0で確認 | PASS |

## Logic validation

```text
FOCUSED_MASTER_STATE_TESTS: 4/4 PASS
FOCUSED_WORK0037_TESTS_TOTAL: 11/11 PASS
LOCAL_PRODUCTION_BROWSER_HARNESS: PASS
NPM_RUN_CHECK: 567/567 PASS
CANONICAL_BUNDLE_REGENERATION: PASS
NPM_RUN_CHECK_BUNDLE: 30/30 PASS
GIT_DIFF_CHECK: PASS
```

render harnessはproduction sourceを組み立て、実際のtab/input/submit handlerを操作した。全7画面の既存checkとconsole error/warn0も維持した。

## Target runtime preflight / release

mutation前にCODEX-01のaccepted sourceとread-only比較した。

```text
SAME_EXISTING_TARGET: PASS
SAME_SINGLE_DEPLOYMENT: PASS
BASELINE_VERSION: 12
BASELINE_SAVED_SOURCE_PARITY: PASS
BASELINE_IMMUTABLE_SOURCE_PARITY: PASS
DEPLOYMENT_TYPE: WEB_APP
EXECUTE_AS: USER_DEPLOYING
ACCESS: MYSELF
```

実施したmutationと最終readback:

```text
REPAIR_RUNTIME_CYCLES: 1/2
SOURCE_SYNCS: 1
IMMUTABLE_VERSION_CREATES: 1
SAME_DEPLOYMENT_UPDATES: 1
FINAL_SERVED_VERSION: 13
FINAL_SAVED_SOURCE_PARITY: PASS
FINAL_IMMUTABLE_SOURCE_PARITY: PASS
NEW_TARGET: 0
SECOND_DEPLOYMENT: 0
```

private URL、deployment ID、Script ID、account等はreportへ記録していない。

## Actual browser qualification

deploying ownerとしてversion13のsame versioned `/exec`を通常browser UIで確認した。

```text
ASSET_CLASS_TO_TEAM_EMPTY_TARGET: PASS
ASSET_CLASS_DRAFT_RESTORE: PASS
TEAM_DRAFT_RESTORE: PASS
ACTIVE_TAB_AFTER_REFRESH: PASS
ALL_DRAFTS_AFTER_REFRESH: PASS
COUNTERPARTY_MODAL_OPEN_CANCEL: PASS / MUTATION_0
NORMAL_NAVIGATION: 7/7 NONBLANK
CONSOLE_MATERIAL_ERROR_WARN: 0
SYNTHETIC_OPTION_CREATE: 0
```

D2/D3はinstructionどおり実機応答速度を合わせるための書き込みを繰り返さず、production-source deferred testとlocal rendered browserの遅延RPCで認定した。actual Google runtimeでは通常tab/refresh/modal経路だけを確認した。

## Preserved CODEX-01 evidence

CODEX-01のversion12で確認済みだったfrozen UI、7画面・4 viewport、Past Active固定、non-AI Full Output、Analytics一年初期期間、Counterparty modal、provider0等はその観測範囲で保持した。今回のsource差分はMasters client stateだけであり、local production browser harnessで全7画面の既存checksを再通過した。

## Side-effect state

```text
PROVIDER_CALLS: 0
AI_SYNC: DISABLED / UNCHANGED
CONFIDENTIAL_DATA: 0
PHYSICAL_DELETE: 0
SYNTHETIC_OPTION_CREATE: 0
SCHEMA_CHANGE: 0
MIGRATION_CHANGE: 0
PROVIDER_BEHAVIOR_CHANGE: 0
SECURITY_MODEL_CHANGE: 0
PERMISSION_BROADENING: 0
PUBLIC_EXPOSURE: 0
WORK_0030: DEFERRED_BY_USER
PR_MERGE: NOT PERFORMED
```

## Shared Knowledge

KNOWLEDGE_RETRIEVAL: RULE-0001, RULE-0002, PAT-0002
KNOWLEDGE_APPLIED: RULE-0001, RULE-0002, PAT-0002
NEW_KNOWLEDGE_CANDIDATE: NO

## Return state

```text
LOGIC_VALIDATION: PASS
TARGET_RUNTIME_QUALIFICATION: PASS
SIDE_EFFECT_STATE: SAFE
BLOCKER: NONE
READY_FOR_CHATGPT_FINAL_REVIEW: YES
WORK_0037_COMPLETE: NO / CHATGPT FINAL REVIEW PENDING
COMPLETION_LATCH: NOT_APPLIED
```

WORK_ID: 0037
DISPATCH_ID: 0037-CODEX-02
BALL: CHATGPT
STATUS: RETURNED
