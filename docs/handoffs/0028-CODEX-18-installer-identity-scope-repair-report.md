# CODEX-18 — identity scope repair / deployment readiness blocker

WORK_ID: 0028
DISPATCH_ID: 0028-CODEX-18
BALL: CHATGPT
STATUS: RETURNED
MODE: BUILD

確認日時: 2026-09-17 JST。

## 結果と再開点

minimum scope修正、safe outcome log、回帰テスト、再生成・検証、およびCODEX-17の既存bound targetへの1回だけの同期を完了した。remote bundle/manifestは完全一致。OAuth checkpointを `514aa241d6b081700cb310e4babd762778b81ecc` に保存した後、ユーザーが承認を完了。同じeditor要求は自動継続し、repaired I1が1回完了していた。再実行はしていない。

safe logは `ACTION_REQUIRED / DEPLOYMENT_SECURITY_ATTESTATION_REQUIRED`。I1の必須条件 `READY_FOR_DEPLOYMENT` に達していないため、その場でSTOPした。以後はread-only evidence回収とreport更新のみ。I2、deployment作成、attestation、readiness関数、R1-R8、追加source repair/retryは実施していない。次の判断はChatGPTへ返す。

## OAuth後の直接観測

- 実行履歴は過去7日間で計2件のみ。CODEX-17の08:02:59の実行に加え、CODEX-18は2026-09-17 08:36:56 JST開始、30.122秒、Head / Editor / installKnowledgeShare / 完了。
- editor log: 08:36:58開始、08:37:25に固定safe state/code、08:37:28完了。「完了」はinstaller受入PASSではない。
- hostに `KnowledgeShare_Installation` が作成され、状態ACTION_REQUIRED、同じsafe error code、schema 7、修正source commitとpayload hashを確認。resource summaryはsetup/schema/settings確認済み。
- 隔離folder直下に既存host、Backend、Audit、knowledge root、Exportsがあり、knowledge root配下にMeeting Records、Pitchbooksがある。確認した各metadataのsharedはfalse。
- Backendは厳密に5 sheets: GP_Master、Option_Master、Meeting_Index、Pitchbook_Index、Settings。SettingsのSCHEMA_VERSIONは7、AI_SYNC_ENABLEDはFALSE。trigger画面は0件。
- 実行後もremote bundle/manifestはexact match、versionNumber付きdeploymentは0件。新target・versioned deploymentは作成していない。

## 仮説評価とblockerの区別

追加scopeとユーザー再承認後にidentity gate・setup・validationを通過したことは、safe outcomeに至るproduction制御フローと作成済みresourceの双方で裏付けられる。元のscope不足仮説を支持するが、CODEX-17の返却error codeは未観測なので、その歴史的root causeはNOT_CONFIRMEDのままとする。

今回直接確認したblockerは **versioned deploymentが0件でもinstallerがdeployment security attestationを要求し、READY_FOR_DEPLOYMENTにならないこと**。productionの `kspBuildDeploymentReadinessStatus_` はservice URLが非空ならattestationを要求し、`kspGetWebAppDeploymentIdentity_` は `/dev` を `/exec` へ正規化する。既存auto-HEAD entrypointをversioned Web Appと区別できていない可能性が高い。ただし今回service URLの生値は取得・保存しておらず、具体的なURL種別は推論。source変更やattestationで迂回せず、別のbounded controller判断が必要。

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

CODEX-18: target作成0、source同期1、editor要求1（OAuth後自動継続）、repaired I1本体実行1、I2 0、qualification deployment 0、business record mutation 0。installerによるstatus/設定/seed書き込みと6 resource作成（4 folders、Backend、Audit）は発生。CODEX-17と合算したtargetは同じ1組のみで、source導入/更新は計2回、installer本体実行は計2回。private budget/mappingはignored local evidenceにのみ保持し、本reportには保存しない。作成物は削除・移動せず次Dispatch用に保持した。

```text
ACTIVE_HYPOTHESIS_RESULT: SUPPORTED / IDENTITY_GATE_PASSED / DISTINCT_READINESS_BLOCKER_OBSERVED
ROOT_CAUSE: NOT_CONFIRMED
SOURCE_CHANGE_SUMMARY: MINIMUM_EMAIL_SCOPE_AND_CLOSED_VOCABULARY_OUTCOME_LOG
MANIFEST_SCOPE_VALIDATION: PASS
FOCUSED_VALIDATION: PASS
CANONICAL_VALIDATION: PASS / 517_OF_517
BUNDLE_IDENTITY: PASS / EXACT_REMOTE_BUNDLE_AND_MANIFEST
EXISTING_TARGET_REUSED: YES
REPAIRED_INSTALLER_I1: FAIL_ACCEPTANCE / EXECUTED_ONCE / ACTION_REQUIRED / DEPLOYMENT_SECURITY_ATTESTATION_REQUIRED
INSTALLER_IDEMPOTENCY_I2: NOT_RUN
QUALIFICATION_WEB_APP: NOT_CREATED / VERSIONED_DEPLOYMENTS_0
TARGET_RUNTIME_R1_R8: NOT_RUN / I1_READINESS_BLOCKER
PROVIDER_RUNTIME: OUT_OF_SCOPE / CALLS_0
WORK_0030: DEFERRED_BY_USER
SIDE_EFFECT_STATE: EXISTING_TARGET_SYNC_1 / I1_1 / INSTALLER_RESOURCES_CREATED / NEW_TARGET_0 / PROVIDER_CALLS_0 / AI_SYNC_DISABLED / TRIGGERS_0
RESIDUAL_SYNTHETIC_RESOURCES: EXISTING_TARGET_PLUS_4_FOLDERS_BACKEND_AUDIT_AND_STATUS_SHEET_PRESERVED
BLOCKER: DEPLOYMENT_SECURITY_ATTESTATION_REQUIRED_WITH_VERSIONED_DEPLOYMENTS_0
READY: NO
```

## Shared Knowledge

KNOWLEDGE_RETRIEVAL: PAT-0004
KNOWLEDGE_APPLIED: PAT-0004 — target identityとsource parityを別gateとして同期前後に確認。
NEW_KNOWLEDGE_CANDIDATE: NONE

WORK_ID: 0028
DISPATCH_ID: 0028-CODEX-18
BALL: CHATGPT
STATUS: RETURNED
