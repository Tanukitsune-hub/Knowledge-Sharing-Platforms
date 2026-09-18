# CODEX-19 — installer stage修正 / attestation binding不一致で停止

WORK_ID: 0028
DISPATCH_ID: 0028-CODEX-19
BALL: CHATGPT
STATUS: RETURNED
MODE: BUILD

確認日: 2026-09-17 JST。

## 結果

既存CODEX-17/18 targetへstage分離修正版を1回同期した。installer rerunは1回で `READY_FOR_DEPLOYMENT / NONE` となり、resource duplicate 0、Backend exactly 5 sheets、schema7、AI sync FALSE、trigger0を確認。I2 idempotencyはPASS。

次にnative editorでowner-only versioned WEB_APPを1件作成し、authoritative API metadataでversion1 / WEB_APP / USER_DEPLOYING / MYSELF / execを確認した。attestation前readinessは期待どおり `ACTION_REQUIRED / DEPLOYMENT_SECURITY_ATTESTATION_REQUIRED`。guarded confirmationを1回実行したが、Script Propertiesに保存されたattestationのdeploymentIdentitySha256と、native deployment完了画面で確認した実versioned `/exec` のSHA-256のprivate比較は **MISMATCH** だった。

必須security gate不合格として直ちにSTOP。post-attestation readiness、R1-R8はNOT RUN。追加source repair、installer retry、再confirmation、second deployment、historical version75変更は0。Work 0028は未完了。controllerによる次のbounded判断が必要。

## Work Contract / authority

最新main `ef3b8b7a276a72e467f809881f91c60dcff9a053` のCODEX-19 instructionを実行契約とした。開始時local/PR HEADは `399f80c584c01a0bf771737183e5ea28beb580bb`、primary worktree clean。既存branch / Draft PR #51を継続し、mainのmerge/rebase/resetやcontrol-doc競合収束は行っていない。既存historical worktreeは保存。

唯一の仮説はpre-deployment completionとpost-deployment readinessの混同。最短の修正は成功時のinstaller返却だけをREADY_FOR_DEPLOYMENTに分離すること。target identity、authoritative metadata、実行結果とpersisted stateをdeterministic checksより上位に扱った。新target0、同期1、installer/I2 1、versioned Web App1、pre-readiness1、confirmation1の予算を使用した。provider/AI sync/Work0030/production data/広域公開は対象外。

## Source / logic validation

- `src/15_Installer.gs`: identity/setup/validation成功後、deployment getterを呼ばずREADY_FOR_DEPLOYMENTをpersist/returnするよう局所変更。
- `checkKnowledgeShareReadiness`、`confirmKnowledgeShareDeploymentSecurity`、URL validation、owner/admin gate、attestation semantics、public surface、manifest scopesは変更していない。CODEX-18のsafe outcome loggingを保持。
- tests: `/dev`あり・attestationなしでもinstaller成功、rerun resource duplicate0、installerはdeployment getter非使用、post-deploymentはattestation必須、guarded confirmation、identity変更時stale、malformed URLのreadiness/confirmation拒否を確認。既存identity/owner/logging testsも維持。
- focused installer: 18/18 PASS。
- `npm run check`: 518/518 PASS。
- `npm run check:bundle`: 30/30 PASS。生成再現性・manifest・source/bundle public surface・runtime parityを含む。
- `git diff --check`: PASS。

Source commit: `3383735556ca7678d64c45c5f948b3ae1bfb7e00`。
Generated artifact commit: `35f1e810d4cc8b916159d1ba573a5619ee56e31b`。

## Runtime evidence

### Preflight / source

authenticated owner継続、project creator、bound project→同じhost→同じ隔離parent、host/parentの所有・非共有・非trashedを確認。CODEX-18のsource/manifest exact match、installer-created resourcesの存在、versioned deployment0を同期前に確認した。repair bundle/manifestの同期は1回、直後のremote readback完全一致。

### Installer / I2

editor log: 08:58:49開始、08:59:02 `READY_FOR_DEPLOYMENT / NONE`、08:59:04完了。status sheetにも同state、errorなし、schema7、修正source commitを確認。

同期前後とrerun後のresource ID集合は一致。隔離folder直下5 items（既存host、Backend、Audit、knowledge root、Exports）、knowledge root配下2 foldersを確認し、duplicate0。BackendはGP_Master / Option_Master / Meeting_Index / Pitchbook_Index / Settingsの5 sheets。Settingsはschema7、AI_SYNC_ENABLED FALSE。native trigger一覧0件。

### Versioned Web App

native「新しいデプロイ」でWeb app、自分として実行、自分のみを確認し1回作成。09:02のversion1完了画面を確認。API readbackではversioned deployment1件、versionNumber1、WEB_APP、USER_DEPLOYING、MYSELF、exec endpointあり。

immutable versionのbundleはexact match。最初のbyte-exact検査ではmanifest差分を検出したためread-onlyで分類した。差分はnative editorが除いた末尾改行1文字のみであり、JSON semantic equalityおよび `remote + newline == expected` を確認した。source/security設定の変化ではないためsecurity確認へ継続した。再同期・再生成・second deploymentは行っていない。

### Security / binding

1. pre-attestation readinessは09:04:15開始、09:04:23完了、1回のみ。status sheetでACTION_REQUIRED / DEPLOYMENT_SECURITY_ATTESTATION_REQUIREDを確認。
2. owner-only設定を確認した同じversioned Web Appに対し、confirmationは09:05:22開始、09:05:24完了、1回のみ。
3. native project settingsのScript Propertiesから保存attestationをprivateに読み、deployment完了画面のversioned exec identityをapplication外でSHA-256計算して比較。**MISMATCH**。
4. 直ちにSTOP。post-attestation readiness未実行。application内の状態がREADYを示し得ることだけでは、独立したbinding検証の失敗を覆せない。

事実として確定したblockerは「保存attestationが実versioned exec identityと一致しない」こと。既存のservice URL / dev正規化経路によりHEAD/test identityへ結び付いた可能性があるが、別identityの同定や2回目のsource repairは行っていない。private URL、ID、account、hash値はreportに記載しない。

## Matrix / side effects

```text
LOGIC_VALIDATION: PASS / 518_OF_518 / BUNDLE_30_OF_30
TARGET_RUNTIME_QUALIFICATION: BLOCKED_AT_ATTESTATION_BINDING
INSTALLER_STAGE_REPAIR: PASS
INSTALLER_IDEMPOTENCY_I2: PASS / RERUN_1 / DUPLICATES_0
VERSIONED_WEB_APP: PASS_METADATA / CREATED_1 / VERSION_1 / OWNER_ONLY
PRE_ATTESTATION_READINESS: PASS_EXPECTED_ACTION_REQUIRED
SECURITY_CONFIRMATION: EXECUTED_ONCE
ATTESTATION_TO_AUTHORITATIVE_DEPLOYMENT: MISMATCH
POST_ATTESTATION_READINESS: NOT_RUN
R1: NOT_RUN_AS_CAMPAIGN / BASELINE_SCHEMA_AND_RESOURCE_EVIDENCE_PASS
R2: NOT_RUN
R3: NOT_RUN
R4: NOT_RUN
R5: NOT_RUN
R6: NOT_RUN
R7: NOT_RUN
R8: NOT_RUN
SIDE_EFFECT_STATE: SOURCE_SYNC_1 / INSTALLER_RERUN_1 / VERSIONED_WEB_APP_1 / ATTESTATION_WRITE_1 / NEW_TARGET_0
PROVIDER_CALLS: OPENAI_0 / GEMINI_0 / AZURE_OPENAI_0
AI_SYNC: FALSE
TRIGGERS: 0
BUSINESS_RECORD_WRITES: 0
PHYSICAL_DELETE: 0
HISTORICAL_VERSION75_MUTATIONS: 0
WORK_0030: DEFERRED_BY_USER
BLOCKER: ATTESTATION_HASH_MISMATCH
READY: NO
```

既存synthetic target、installer resources、status/settings、version1 owner-only deployment、保存attestationを証拠として保持。cleanup/delete/permission変更は行っていない。以後の継続時は新targetやsecond deploymentを暗黙に作らず、この状態からcontroller契約を再設定する。

## Shared Knowledge

KNOWLEDGE_RETRIEVAL: PAT-0004
KNOWLEDGE_APPLIED: PAT-0004 — target identity、source parity、versioned entrypointを独立した証拠gateとして確認。
NEW_KNOWLEDGE_CANDIDATE: YES

WORK_ID: 0028
DISPATCH_ID: 0028-CODEX-19
BALL: CHATGPT
STATUS: RETURNED
