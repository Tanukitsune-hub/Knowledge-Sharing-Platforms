# Work 0068 CODEX-01 — 面談実績の集計を手動実行に限定

WORK_ID: 0068
DISPATCH_ID: 0068-CODEX-01
BALL: CHATGPT
STATUS: RETURNED
MODE: BUILD
VALIDATION_TIER: TIER_2_STANDARD

## Outcome

「面談実績の集計」のsidebar navigationとperiod/date/dimension/filter変更から自動集計を外した。初回も2回目以降も、通常の集計は画面内の「集計」buttonから既存の`loadActivityAnalytics`を実行する。集計成功時のrender、status、loaded state、graph/list選択は維持した。月次管理チェックの失敗時に既存データを読み直す回復処理も変更していない。

## Acceptance Evidence

| 項目 | 結果 |
|---|---|
| NAVIGATION_RPC_COUNT_BEFORE_FIRST_RUN | 0（1440px / 390pxとも） |
| PRE_FIRST_RUN_FILTER_RPC_COUNT | 0（period、両date、dimension、5 filtersを変更） |
| MANUAL_RUN_RPC_COUNT | 初回「集計」clickで1。既存のsuccess status、metric描画、`activityAnalyticsLoaded=true`を確認 |
| POST_SUCCESS_CONDITION_CHANGE_RPC_COUNT | 0（同じ9条件を再変更） |
| REENTRY_NAVIGATION_RPC_COUNT | 0（別pageから戻り、list選択と既存結果を保持） |
| SECOND_MANUAL_RUN_RPC_COUNT | 追加で1。変更後のperiod/date/dimension/filtersをpayloadで確認 |
| FOCUSED_TESTS | Activity Analytics UI 4/4 PASS |
| ACTIVITY_ANALYTICS_TESTS | UI + service 10/10 PASS |
| CLIENT_BROWSER_CHECK | production HTML/client + synthetic local RPC、1440px / 390px PASS。page error、console error/warning、外部requestは各0 |
| BUNDLE_VALIDATION | `npm run check:bundle` 30/30 PASS。63 server sources / 23 HTML resources |
| MULTIFILE_PACKAGE_PARITY | 7 `.gs`のraw連結は新bundleとbyte-identical。生成器`--check` PASS、package tests 3/3 PASS |
| CANONICAL_CHECK | `npm run check` 1回、691/691 PASS |
| DIFF_CHECK | `git diff --check` PASS |
| DEPLOYMENT_MUTATION_COUNT | 0 |
| PROVIDER_CALL_COUNT | 0 |
| BUSINESS_DATA_MUTATION_COUNT | 0 |
| BLOCKER | NONE |

## Distribution and scope

- SOURCE_COMMIT: `4f092183d6f5804b79b5ef802c40b234aedd6131`
- BUNDLE_RELEASE: `0.1.2`、SCHEMA: `8`（変更なし）
- NEW_BUNDLE_SHA256: `8ef7c362af8c5da23c792cf20046c8b6f08a044f16fa5b71e3d40f7f46601c27`
- NEW_PAYLOAD_SHA256: `4f307fe4717c3190349f5d80ab0c01126ed39cd3f38c0f1b4ce41607163da690`
- generated bundle、release manifest、Work0067の7-file packageを新しいsource commitに合わせて再生成した。package生成器の固定basisとpackage testの期待hashも同じ新bundleへ更新した。server `.gs`、server part 6ファイル、schema/API/payload contractは変更していない。

## Evidence boundary

- LOGIC_VALIDATION: PASS
- TARGET_RUNTIME_QUALIFICATION: NOT RUN（このDispatchの指定はsynthetic browser check。Apps Script deploymentは対象外）
- SIDE_EFFECT_STATE: repository source/test/derived artifactsのみ更新
- READY: Draft PR review向けにREADY。target-runtime readinessは本reportでは主張しない。
- COMPLETION_LATCH: NOT_APPLIED

## Shared Knowledge

- KNOWLEDGE_RETRIEVAL: PAT-0005
- KNOWLEDGE_APPLIED: NONE
- NEW_KNOWLEDGE_CANDIDATE: NO

WORK_ID: 0068
DISPATCH_ID: 0068-CODEX-01
BALL: CHATGPT
STATUS: RETURNED
