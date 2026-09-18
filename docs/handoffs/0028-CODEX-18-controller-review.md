# CODEX-18 controller review — installer / deployment readiness stage separation

WORK_ID: 0028
DISPATCH_ID: 0028-CODEX-18
BALL: CHATGPT
STATUS: REVIEW
MODE: BUILD

## 結論

CODEX-18の停止判断を受理する。追加scope後のrepaired I1は、identity認可、installer owner/bootstrap、setup、validationまで通過し、fresh bound targetに必要なinstaller resourceを作成した。Backendは5 sheets、schema 7、AI syncはFALSE、trigger 0、provider calls 0である。

一方、versioned deploymentが0件にもかかわらず、installerの最終stateが `ACTION_REQUIRED / DEPLOYMENT_SECURITY_ATTESTATION_REQUIRED` となり、契約上必要な `READY_FOR_DEPLOYMENT` に到達しなかった。この結果はWork 0028のBLOCKERであり、I2/deployment/R1-R8へ進まなかったCODEX-18の停止は正しい。

CODEX-17で直接error codeを観測できなかったため、当時の歴史的root cause自体は `NOT_CONFIRMED` のままとする。ただし、`userinfo.email` 追加後にidentity/setup/validationが通過したため、identity scope問題は運用上解消済みとし、以後の主仮説として再度開かない。

## Accepted Evidence

以下は反証がない限り閉じる。

- PR #50 Light design accepted / merged。
- PR #51のprovider-independent production実装方向。
- schema7 / Pitchbook 4-column append contract。
- prepare lifecycle blocker CLOSED。
- CODEX-18 source repair: `userinfo.email` scope + closed-vocabulary safe outcome log。
- focused installer 17/17 PASS。
- canonical `npm run check` 517/517 PASS。
- bundle 29/29 PASS。
- existing fresh bound targetのidentity/source/manifest exact readback。
- repaired I1でidentity/setup/validation通過。
- installer-created 4 folders + Backend + Audit + status sheetが存在。
- Backend 5 sheets / schema 7 / AI sync FALSE / trigger 0。
- versionNumber付きdeployment 0。
- Direct OpenAI / Gemini / Azure OpenAI calls 0。
- Work 0030 DEFERRED_BY_USER。

## 直接確認した新BLOCKER

```text
VERSIONED_DEPLOYMENTS: 0
INSTALLER_RESULT: ACTION_REQUIRED
ERROR_CODE: DEPLOYMENT_SECURITY_ATTESTATION_REQUIRED
EXPECTED_PRE_DEPLOYMENT_STATE: READY_FOR_DEPLOYMENT
```

sourceでは、setup/validation成功後の `kspRunInstaller_()` が `kspBuildDeploymentReadinessStatus_()` を直接呼ぶ。同helperは `environment.getWebAppDeploymentIdentity()` が非空ならdeployment attestationを要求する。

さらに `kspGetWebAppDeploymentIdentity_()` は `/dev` を許容し、`/exec` へ正規化する。したがってfresh Apps Script projectのHEAD/test surfaceをversioned Web App identityと区別できない。

Google Apps Script公式仕様では、project作成時にhead deploymentが自動作成され、head deploymentはcurrent codeに同期するtest用である。versioned deploymentは特定versionへ接続する別物である。またweb appのtest deployment URLは `/dev` で終わり、最新保存コードを実行するdevelopment用surfaceである。

Official references:

- https://developers.google.com/apps-script/concepts/deployments
- https://developers.google.com/apps-script/guides/web

よって、non-empty `/dev` / HEAD surfaceを「versioned Web Appが既に存在する」証拠としてpre-deployment installer gateに使うのは不適切である。

## Active Hypothesis

```text
installer setup/validation completion
-> kspBuildDeploymentReadinessStatus_ called too early
-> auto HEAD/test /dev surface is treated as deployment identity
-> attestation required before versioned deployment can be created
-> staged installer flow deadlocks at I1
```

この仮説は、versioned deployment 0という直接観測、Google公式のHEAD/versioned区別、現production sourceの制御フローが一致しており、CODEX-19の唯一のactive hypothesisとする。

## Repair principle

securityを弱めず、stageを分離する。

1. `installKnowledgeShare()` は、identity/setup/validation成功後はpre-deployment state `READY_FOR_DEPLOYMENT` を返す。
2. installer完了時点ではHEAD/test `/dev` の有無をversioned deployment proofに使用しない。
3. `checkKnowledgeShareReadiness()` はpost-deployment security gateとして維持し、versioned Web App作成後はattestationなしで `ACTION_REQUIRED`、正しいadmin attestation後のみ `READY` とする。
4. `confirmKnowledgeShareDeploymentSecurity()` のadmin/owner fail-closed guardは維持する。
5. qualificationでは、保存されたattestation hashがApps Script API / editorで直接確認した実versioned WEB_APP `/exec` identityのSHA-256と一致することをprivate evidenceで照合する。ID/URL/hash値そのものはreportへ保存しない。

ここで目的は「attestationを回避する」ことではなく、「pre-deployment installer completion」と「post-deployment security attestation」を正しい順番へ戻すこと。

## Fastest Safe Decisive Action

次Dispatch `0028-CODEX-19` で、pre-deployment state transitionだけを限定修正する。existing targetを再利用し、source/manifestを1回だけ同期する。

修正後はinstallerを1回だけ実行する。この実行は既存resourceに対するidempotent rerunであり、以下を同時に証明する。

- previous I1で作成済みresourceを重複させない。
- setup/validation成功後のstateが `READY_FOR_DEPLOYMENT` になる。
- I2 idempotencyを満たす。

PASS時のみ、owner-only versioned WEB_APPを1件作成し、authoritative deployment metadataを確認する。その後security attestation/readiness、R1-R8へ進む。

## Mutation / retry budget

```text
new target: 0
existing target source sync: max 1
installer rerun / I2: max 1
new versioned WEB_APP: max 1
security confirmation: max 1
R1-R8 campaign: one bounded pass
source repair after first CODEX-19 runtime failure: 0
second deployment: 0
physical delete: 0
provider calls: 0
```

installer rerunが `READY_FOR_DEPLOYMENT` にならない、versioned deployment metadataが期待contractと一致しない、またはattestation hashと実versioned `/exec` identityが一致しない場合はSTOPしてChatGPTへ返す。同Dispatchで次のrepairを重ねない。

## Completion gate remains

Work 0028は、installer/idempotency、owner-only versioned Web App/security readiness、provider-independent R1-R8をexisting fresh bound targetでend-to-end確認するまで未完了。

Work 0030は引き続きDEFERREDであり、Work 0028完了後も自動開始しない。

WORK_ID: 0028
DISPATCH_ID: 0028-CODEX-18
BALL: CHATGPT
STATUS: REVIEW
