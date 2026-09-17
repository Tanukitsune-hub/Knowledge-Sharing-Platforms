# Work 0028 dispatch control

WORK_ID: 0028
DISPATCH_ID: 0028-CODEX-20
ACTIVE_DISPATCH_ID: 0028-CODEX-20
BALL: CODEX
STATUS: READY
MODE: QUALIFICATION
PHASE: B1.8 / VERSIONED RUNTIME ATTESTATION / FINAL R1-R8

## Current state

PR #50のLight designはaccepted/merged済み。Draft PR #51でproduction implementationとtarget-runtime qualificationを収束中。

CODEX-19 return:

```text
PR_HEAD: 0a678cc (exact remote SHAはPR branchでread backする)
existing fresh bound target: retained
installer stage repair: PASS
installer rerun / I2: READY_FOR_DEPLOYMENT / duplicate0
Backend: exactly 5 sheets
schema: 7
AI sync: FALSE
triggers: 0
versioned WEB_APP: exactly 1 / version1 / USER_DEPLOYING / MYSELF
pre-attestation readiness: ACTION_REQUIRED / DEPLOYMENT_SECURITY_ATTESTATION_REQUIRED
security confirmation: executed once from native editor
attestation vs authoritative versioned /exec: MISMATCH
post-readiness: NOT_RUN
R1-R8: NOT_RUN
provider calls: 0
READY: NO
```

CODEX-19はattestation binding mismatchで停止し、追加修正、再confirmation、version2、deployment update、second deployment、post-readiness、R1-R8を行わなかった。この停止判断はChatGPT reviewでaccepted。

Controller review:
`docs/handoffs/0028-CODEX-19-controller-review.md`

## Accepted evidence retained

反証がない限り以下を再び開かない。

- PR #50 Light design accepted/merged。
- PR #51 provider-independent production direction。
- schema7 / Pitchbook 4-column append contract。
- prepare lifecycle blocker CLOSED。
- `userinfo.email` scope + safe closed-vocabulary installer outcome log。
- CODEX-19 installer stage repair。
- focused/canonical/bundle deterministic validation PASS。
- existing fresh bound target identity/source/manifest parity。
- installer/I2 `READY_FOR_DEPLOYMENT` / duplicate0。
- Backend exactly 5 sheets / schema7。
- one owner-only version1 WEB_APP authoritative metadata。
- AI sync FALSE / trigger0 / provider calls0。
- historical standalone version75 strategy SUPERSEDED。
- Work 0030 DEFERRED_BY_USER。

## Active blocker

Direct observation:

```text
SECURITY_CONFIRMATION_CONTEXT: NATIVE_EDITOR
ATTESTATION_TO_AUTHORITATIVE_VERSIONED_EXEC: MISMATCH
POST_ATTESTATION_READINESS: NOT_RUN
R1_R8: NOT_RUN
```

`ScriptApp.getService().getUrl()` は実行context依存であり、development mode web app実行時にはdevelopment URLを返す。HEAD/test deploymentとversioned deploymentは別物である。

CODEX-19はnative editorからconfirmationを実行し、authoritative versioned `/exec` と独立比較したため、まずcontext mismatchを最短で切り分ける。

## Active Hypothesis — CODEX-20

Exactly one:

```text
editor/head-context confirmation
-> getService().getUrl() binds to non-versioned context identity
-> attestation hash MISMATCH

actual versioned /exec browser-context confirmation
-> getService().getUrl() binds to actual versioned WEB_APP identity
-> attestation hash MATCH
```

Source defectはまだ確定しない。

## CODEX-20 scope

Existing CODEX-17/18/19 targetとversion1 owner-only WEB_APPのみ使用。新target/source修正/version2/second deploymentは禁止。

CODEX-20 may:

1. current target/deployment identity chainをread-only再確認する。
2. existing owner-only versioned `/exec` をdeploying ownerで開き、main page renderを確認する。
3. browser page execution contextから既存guarded `confirmKnowledgeShareDeploymentSecurity()` を `google.script.run` で1回だけ呼ぶ。
4. persisted attestation hashとauthoritative versioned `/exec` identity hashをprivateに比較する。
5. MATCH時のみ同じversioned contextから`checkKnowledgeShareReadiness()`を1回確認する。
6. READY時のみprovider-independent R1-R8を1 bounded pass実行する。

Active instruction:
`docs/handoffs/0028-CODEX-20-versioned-runtime-attestation-qualification-instruction.md`

## Mutation / retry boundary

```text
new target: 0
source change: 0
source sync: 0
new version: 0
new deployment: 0
deployment update: 0
security confirmation: max 1
post-readiness: max 1 after MATCH only
R1-R8: one bounded pass after READY only
second repair: 0
historical standalone mutation: 0
physical delete: 0
provider calls: 0
```

MISMATCHが再発した場合はSTOPし、別Dispatchでexplicit authoritative deployment-binding mechanismを設計する。

browser harnessがversioned page contextから`google.script.run`を安全に実行できない場合もsource変更せずSTOPし、tooling limitationとして返す。ユーザーにDeveloper Tools操作は要求しない。

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
| 0028-CODEX-19 | stage repair + I2 PASS + version1 WEB_APP + editor-context attestation mismatch / accepted |
| 0028-CODEX-20 | versioned `/exec` context attestation qualification + final R1-R8 / READY |

## Completion gate

CODEX-20がexisting version1 `/exec` contextでauthoritative attestation binding MATCH、post-readiness READY、provider-independent R1-R8 PASSを返す。

ChatGPTがfinal evidence/diffをreviewし、BLOCKERなしならPR #51を収束・mergeしてWork 0028へCompletion Latchを適用する。その後は開発を止め、ユーザー実機確認へ進む。Work 0030はDEFERREDのまま。

```text
THEME_SCOPE: LIGHT_ONLY
DESIGN_BASELINE: PR_50_MERGED
PR_51: OPEN_DRAFT
ACTIVE_DISPATCH: 0028-CODEX-20
BALL: CODEX
STATUS: READY
TARGET_RUNTIME_STRATEGY: VERSIONED_CONTEXT_ATTESTATION_THEN_FINAL_R1_R8
ACTIVE_BLOCKER: ATTESTATION_BINDING_CONTEXT_MISMATCH
ACTIVE_HYPOTHESIS: EDITOR_CONTEXT_VS_VERSIONED_EXEC_CONTEXT
NEW_TARGET_AUTHORIZED: NO
SOURCE_CHANGE_AUTHORIZED: NO
NEW_DEPLOYMENT_AUTHORIZED: NO
PROVIDER_CALLS_AUTHORIZED: NO
WORK_0030: DEFERRED_BY_USER
NEXT_UNUSED_DISPATCH: 0028-CODEX-21
WORK_0028_COMPLETE: NO
```

WORK_ID: 0028
DISPATCH_ID: 0028-CODEX-20
BALL: CODEX
STATUS: READY
