# CODEX-18 — installer identity scope repair / OAuth checkpoint

WORK_ID: 0028
DISPATCH_ID: 0028-CODEX-18
BALL: USER
STATUS: ACTION_REQUIRED
MODE: BUILD

確認日時: 2026-09-17 JST。

## 結果と再開点

minimum scope修正、safe outcome log、回帰テスト、再生成・検証、およびCODEX-17の既存bound targetへの1回だけの同期を完了した。remote bundle/manifestは完全一致。editorで `installKnowledgeShare` を選択して1回実行要求したところ「承認が必要です」となり、権限確認からGoogleの未確認アプリ警告画面を開いた。ユーザーのnative OAuth操作で停止中。修正版I1の完了・safe outcomeはまだ観測していない。

承認後は同Dispatchでread-only実行履歴・safe log・installation stateを回収する。承認後の自動継続の有無を確認してから、未実行が確認された場合のみrepaired I1を1回実行する。再同期しない。I1がFAILなら即STOPし、追加source repair・retryはしない。PASSの場合のみI2を1回、owner-only WEB_APP最大1件、security/readiness、R1-R8へ進む。

## Work Contract / evidence

目的は既存fresh bound target上でinstallerとprovider-independent runtimeを資格確認すること。最短の判定は、identity認可を緩めず不足scopeだけを追加し、既存guarded入口のstate/codeを直接確認すること。証拠順位は対象identity・remote readback・runtime safe outcomeと実resource stateを上位とし、deterministic testsをruntime成功の代用にしない。修正・同期・repaired I1は各1回の予算。新target・historical version75変更・provider call・AI sync有効化・Work0030・PR mergeは対象外。

開始時main: `044a32991fee29a63ef0925485625ad86b642973`。
開始時PR/local HEAD: `5188d4497c4d626adbc6d8c67e1fbb9630404dfd`、primary worktree clean。既存のhistorical detached worktreeは保存し、mainのmerge/rebase/resetは実施していない。最新mainのCODEX-18 instructionを実行契約として使用した。

## Source / validation

- 正本manifestは `src/appsscript.json`。`scripts/build-apps-script-bundle.cjs` の既存生成処理が `dist/appsscript.json` に反映する。`userinfo.email` のみ追加し、従来5 scopesとUSER_DEPLOYING/MYSELFを維持。
- 既存 `installKnowledgeShare` が返す結果をprivate helperでlogする。固定allowlistのstate/code以外を出さず、未知codeは `INSTALLER_FAILED`。email、ID、URL、resource summary、raw error、messageはlogしない。認可処理・owner latch・status persistenceの順序は不変。新public wrapperなし。
- 回帰テスト: blank active / active-effective mismatchでsetup・property/resource/status mutation 0、authorizedでsetup到達、任意private payloadの非記録、generated manifestのscope完全一致。
- focused installer 17/17、manifest 1/1 PASS。
- `npm run check`: 517/517 PASS。foundation、source、temporal、public-surface、bundle gates PASS。
- `npm run check:bundle`: 29/29 PASS（再現性・modular/bundle public surface・runtime delegation parityを含む）。
- `git diff --check`: PASS。LF/CRLFのGit warningのみ。

Source commit: `cc135b49702fb04207de39b0cf529125a994172e`。
Generated artifact commit: `98c742a36d4dd42c2b7094fe26fae489b25c1030`。
Bundle SHA-256: `8540c57ae14798e581f7cc4bce4a86179a2ae9e8d6c2bfaf9388fbb1ea7eb378`。
Manifest SHA-256: `c1d3d6b48cd4d66dbe4cf5d571bdeee35984bd8899ae4da798e5d954572e8e1f`。

## Target / budget

同期前にauthenticated principalの継続、project creator、bound parent、hostの所有・非共有・非trashed・隔離folder配置を確認した。旧accepted sourceの完全一致も確認した後、修正版2 filesを1回PUTしreadback完全一致を確認。versionNumber付きdeploymentは0件。既存auto-HEAD entrypointはqualification deploymentとは扱わない。

CODEX-18: target作成0、source同期1、editor要求1（OAuth待ち）、repaired I1完了観測0、I2 0、qualification deployment 0、business mutation 0。CODEX-17と合算したtargetは同じ1組のみ。CODEX-17 I1本体実行1回と今回のOAuth要求を区別する。private budget/mappingはignored local evidenceにのみ保持し、本reportには保存しない。

```text
ACTIVE_HYPOTHESIS_RESULT: PENDING_NATIVE_OAUTH_AND_REPAIRED_I1
ROOT_CAUSE: NOT_CONFIRMED
SOURCE_CHANGE_SUMMARY: MINIMUM_EMAIL_SCOPE_AND_CLOSED_VOCABULARY_OUTCOME_LOG
MANIFEST_SCOPE_VALIDATION: PASS
FOCUSED_VALIDATION: PASS
CANONICAL_VALIDATION: PASS / 517_OF_517
BUNDLE_IDENTITY: PASS / EXACT_REMOTE_BUNDLE_AND_MANIFEST
EXISTING_TARGET_REUSED: YES
REPAIRED_INSTALLER_I1: OAUTH_PENDING / COMPLETION_NOT_OBSERVED
INSTALLER_IDEMPOTENCY_I2: NOT_RUN
QUALIFICATION_WEB_APP: NOT_CREATED / VERSIONED_DEPLOYMENTS_0
TARGET_RUNTIME_R1_R8: NOT_RUN / INSTALLER_GATE_PENDING
PROVIDER_RUNTIME: OUT_OF_SCOPE / CALLS_0
WORK_0030: DEFERRED_BY_USER
SIDE_EFFECT_STATE: EXISTING_TARGET_SYNC_1 / NEW_TARGET_0 / PROVIDER_CALLS_0 / AI_SYNC_DISABLED
RESIDUAL_SYNTHETIC_RESOURCES: CODEX17_EXISTING_FOLDER_HOST_BOUND_PROJECT_PRESERVED
BLOCKER: NATIVE_GOOGLE_OAUTH_REQUIRED
READY: NO
```

## Shared Knowledge

KNOWLEDGE_RETRIEVAL: PAT-0004
KNOWLEDGE_APPLIED: PAT-0004 — target identityとsource parityを別gateとして同期前後に確認。
NEW_KNOWLEDGE_CANDIDATE: NONE

WORK_ID: 0028
DISPATCH_ID: 0028-CODEX-18
BALL: USER
STATUS: ACTION_REQUIRED
