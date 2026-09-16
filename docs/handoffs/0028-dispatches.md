# Work 0028 dispatch control

WORK_ID: 0028
DISPATCH_ID: 0028-CODEX-19
ACTIVE_DISPATCH_ID: 0028-CODEX-19
BALL: CODEX
STATUS: READY
MODE: BUILD
PHASE: B1.7 / PRE-DEPLOYMENT READINESS REPAIR / FRESH BOUND QUALIFICATION

## Current state

PR #50のLight designはaccepted/merged済み。Draft PR #51でproduction implementationとtarget-runtime qualificationを収束中。

CODEX-18 return:

```text
PR_HEAD: 399f80c584c01a0bf771737183e5ea28beb580bb
existing fresh bound target: retained
userinfo.email scope repair: applied
safe installer outcome logging: applied
identity/setup/validation: PASS
installer-created resources: present
Backend: exactly 5 sheets
schema: 7
AI sync: FALSE
triggers: 0
versioned deployments: 0
repaired I1: ACTION_REQUIRED / DEPLOYMENT_SECURITY_ATTESTATION_REQUIRED
I2: NOT_RUN
R1-R8: NOT_RUN
provider calls: 0
READY: NO
```

CODEX-18は、repaired I1が契約上必要な `READY_FOR_DEPLOYMENT` に到達しなかった時点で、追加repair/retry、I2、deployment、R1-R8を行わず停止した。この停止判断はChatGPT reviewでaccepted。

Controller review:
`docs/handoffs/0028-CODEX-18-controller-review.md`

## Accepted evidence retained

反証がない限り以下を再び開かない。

- PR #50 Light design accepted/merged。
- PR #51 provider-independent production direction。
- schema7 / Pitchbook 4-column append contract。
- prepare lifecycle blocker CLOSED。
- CODEX-18 `userinfo.email` scope + safe closed-vocabulary installer outcome log。
- focused installer 17/17 PASS。
- canonical 517/517 PASS。
- bundle 29/29 PASS。
- existing fresh bound target identity/source/manifest exact readback。
- repaired I1 identity/setup/validation PASS。
- installer resources present / Backend 5 sheets / schema7。
- AI sync FALSE / trigger0 / provider calls0。
- historical standalone version75 strategy SUPERSEDED。
- Work 0030 DEFERRED_BY_USER。

CODEX-17の歴史的root causeはerror code未観測のため `NOT_CONFIRMED` のままだが、decision-impactはなく、再調査しない。

## Active blocker

Direct observation:

```text
VERSIONED_DEPLOYMENTS: 0
INSTALLER_RESULT: ACTION_REQUIRED
ERROR_CODE: DEPLOYMENT_SECURITY_ATTESTATION_REQUIRED
EXPECTED_PRE_DEPLOYMENT_STATE: READY_FOR_DEPLOYMENT
```

Google Apps Scriptではproject作成時にHEAD deploymentが自動作成され、HEADはcurrent codeへ同期するtest用surfaceである。versioned deploymentは特定versionへ紐づく別物。web app test URLの `/dev` はdevelopment用であり、versioned Web App存在の証拠ではない。

Current production flowはsetup/validation成功後にdeployment-security readinessを直ちに評価し、`/dev` をdeployment identityとして扱うため、versioned Web App作成前にattestationを要求できる。

## Active Hypothesis — CODEX-19

Exactly one:

```text
pre-deployment installer completion
and post-deployment security readiness are conflated
-> auto HEAD/test /dev is treated as deployed identity
-> installer deadlocks before versioned deployment creation
```

## CODEX-19 scope

Existing CODEX-17/18 target only。新target禁止。

CODEX-19 may:

1. `installKnowledgeShare()` の成功後stateをpre-deployment `READY_FOR_DEPLOYMENT` に限定修正する。
2. `checkKnowledgeShareReadiness()` / `confirmKnowledgeShareDeploymentSecurity()` のpost-deployment fail-closed security semanticsは維持する。
3. targeted regression testsを追加・修正する。
4. deterministic bundle/manifestを再生成・検証する。
5. existing bound targetへrepaired exact source/manifestを1回だけ同期する。
6. installerを1回だけrerunし、`READY_FOR_DEPLOYMENT` + duplicate0を確認する。この1回をI2 idempotency証拠とする。
7. PASS時のみowner-only versioned WEB_APPを1件作成する。
8. authoritative deployment metadataを確認し、attestation前後readinessを検証する。
9. stored attestation hashとauthoritative versioned `/exec` identity hashをprivateに照合し、`MATCH` のみ受入。
10. security readiness PASS後にprovider-independent R1-R8を1 bounded pass実行する。

Active instruction:
`docs/handoffs/0028-CODEX-19-installer-deployment-stage-repair-instruction.md`

## Mutation / retry boundary

```text
new target: 0
existing target source sync: max 1
installer rerun / I2: max 1
new versioned WEB_APP: max 1
deployment update: 0
security confirmation: max 1
R1-R8: one bounded pass
second source repair after target failure: 0
second deployment: 0
historical standalone mutation: 0
physical delete: 0
provider calls: 0
```

Installer rerunが `READY_FOR_DEPLOYMENT` にならない、versioned WEB_APPをauthoritativeに証明できない、attestation hashがactual `/exec` identityと一致しない、またはR1-R8で最初のmaterial application failureが出た場合はSTOPしてChatGPTへ返す。

## Provider / Azure boundary

User decision 2026-09-17: Azure OpenAI transition is deferred.

```text
Direct OpenAI calls: 0
Gemini calls: 0
Azure OpenAI calls: 0
AI sync: disabled
provider File Search/citation runtime: OUT_OF_SCOPE
WORK_0030: DEFERRED_BY_USER
```

Work 0028 completion does not automatically activate Work 0030.

## Dispatch history

| Dispatch | Disposition |
|---|---|
| 0028-CODEX-01 / 02 | historical tombstone; never reuse |
| 0028-CODEX-03..09 | Light design iterations |
| 0028-CODEX-10 | PR #47/#48/#49 consumed history |
| 0028-CODEX-11 | PR #50 accepted/merged Light baseline |
| 0028-CODEX-12 | PR #51 production BUILD / deterministic PASS / runtime incomplete |
| 0028-CODEX-13 | prepare lifecycle blocker CLOSED / Execution API 403 |
| 0028-CODEX-14 | saved source parity / standalone mismatch |
| 0028-CODEX-15 | historical standalone strategy superseded |
| 0028-CODEX-16 | interrupted / no durable return |
| 0028-CODEX-17 | recovery + fresh target + initial identity-gate failure / accepted |
| 0028-CODEX-18 | identity scope repair + resources established + readiness-stage blocker / accepted |
| 0028-CODEX-19 | pre-deployment readiness stage repair + existing-target final qualification / READY |

## Completion gate

CODEX-19がexisting targetで、installer/idempotency `READY_FOR_DEPLOYMENT`、one owner-only versioned WEB_APP、security readiness + authoritative attestation binding、provider-independent R1-R8のreviewable evidenceを返す。

ChatGPTがfinal diff/evidenceをreviewし、BLOCKERなしならPR #51を収束・mergeしてWork 0028へCompletion Latchを適用する。その後は開発を止め、ユーザー実機確認へ進む。Work 0030はDEFERREDのまま。

```text
THEME_SCOPE: LIGHT_ONLY
DESIGN_BASELINE: PR_50_MERGED
PR_51: OPEN_DRAFT
ACTIVE_DISPATCH: 0028-CODEX-19
BALL: CODEX
STATUS: READY
TARGET_RUNTIME_STRATEGY: REPAIR_STAGE_THEN_RESUME_EXISTING_FRESH_BOUND_TARGET
ACTIVE_BLOCKER: PRE_DEPLOYMENT_ATTESTATION_DEADLOCK
ACTIVE_HYPOTHESIS: INSTALLER_AND_POST_DEPLOYMENT_READINESS_CONFLATED
NEW_TARGET_AUTHORIZED: NO
PROVIDER_CALLS_AUTHORIZED: NO
WORK_0030: DEFERRED_BY_USER
NEXT_UNUSED_DISPATCH: 0028-CODEX-20
WORK_0028_COMPLETE: NO
```

WORK_ID: 0028
DISPATCH_ID: 0028-CODEX-19
BALL: CODEX
STATUS: READY
