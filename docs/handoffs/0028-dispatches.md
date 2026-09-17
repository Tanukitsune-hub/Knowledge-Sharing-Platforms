# Work 0028 dispatch control

WORK_ID: 0028
DISPATCH_ID: 0028-CODEX-21
ACTIVE_DISPATCH_ID: 0028-CODEX-21
BALL: CODEX
STATUS: READY
MODE: BUILD
PHASE: B1.9 / GUARDED VERSIONED ADMIN CONFIRMATION SURFACE / FINAL R1-R8

## Current state

PR #50のLight designはaccepted/merged済み。Draft PR #51でproduction implementationとtarget-runtime qualificationを収束中。

CODEX-20 return:

```text
PR_HEAD: 4488d9b (exact remote SHAは開始時にread back)
existing fresh bound target: retained
single owner-only WEB_APP: retained / version1
source + immutable version parity: PASS_READ_ONLY
browser arbitrary JS evaluation: READ_ONLY_PAGE_SCOPE
versioned-context confirmation: NOT_RUN / calls0
hash recompare: NOT_RUN
post-readiness: NOT_RUN
R1-R8: NOT_RUN
Google mutations in CODEX20: 0
provider calls: 0
READY: NO
BLOCKER: AUTOMATION_TOOLING_LIMITATION
```

CODEX-20はbrowser harness制約を確認した時点で、禁止されたpage-context mutation評価を試さず停止した。これはapplication failureでもCODEX-19 hash mismatch再発でもない。この停止判断はChatGPT reviewでaccepted。

Controller review:
`docs/handoffs/0028-CODEX-20-controller-review.md`

## Accepted evidence retained

反証がない限り以下を再び開かない。

- PR #50 Light design accepted/merged。
- PR #51 provider-independent production direction。
- schema7 / Pitchbook 4-column append contract。
- prepare lifecycle blocker CLOSED。
- `userinfo.email` scope + closed-vocabulary installer outcome log。
- installer pre/post-deployment stage separation。
- installer/I2 `READY_FOR_DEPLOYMENT` / duplicate0。
- Backend exactly 5 sheets / schema7。
- AI sync FALSE / triggers0 / provider calls0。
- one owner-only version1 WEB_APP authoritative metadata: WEB_APP / USER_DEPLOYING / MYSELF。
- pre-attestation readiness: `ACTION_REQUIRED / DEPLOYMENT_SECURITY_ATTESTATION_REQUIRED`。
- CODEX-19 deterministic: canonical 518/518 / bundle30/30 PASS。
- CODEX-20 target/deployment/source parity read-only PASS。
- historical standalone version75 strategy SUPERSEDED。
- Work 0030 DEFERRED_BY_USER。

CODEX-19でnative editorから保存されたattestationはauthoritative versioned `/exec` hashとMISMATCHした証拠として保持。CODEX-20では上書きしていない。

## Strategy Reset after CODEX-20

Primary Outcomeは不変: accepted Light UI + production contractをfinal container-bound architectureでprovider-independent end-to-end認定する。

CODEX-20で確認されたdecision-impacting gapは、versioned Web App contextからguarded security confirmationを通常の許可されたUI操作で呼び出すdurable operator surfaceが存在しないこと。

Developer Tools、javascript URL、hidden RPC、browser-tool制約回避を運用手順にしない。実運用で再現可能な最小operator pathをproduction sourceへ追加する。

## CODEX-21 scope

Existing targetとexisting single WEB_APP deploymentのみ使用。新target/second deploymentは禁止。

CODEX-21 may:

1. unlinked operator-only deployment-security route/pageを追加する。
2. page renderはread-only、明示button clickのみ既存guarded `confirmKnowledgeShareDeploymentSecurity()` を `google.script.run` で呼ぶ。
3. normal navigation/sidebar/product admin UIからリンクしない。
4. server-side owner/admin fail-closed gateを維持し、route obscurityをauthorizationにしない。
5. private identifier/URL/hash/account/raw errorを表示・記録しない。
6. focused regression + canonical/bundle validationを行う。
7. existing bound targetへexact repaired source/manifestを1回同期する。
8. new immutable versionを1件作成し、existing single WEB_APP deploymentをそのversionへ1回updateする。second deploymentは0。
9. authoritative metadataでsame deployment / WEB_APP / USER_DEPLOYING / MYSELF / current versioned `/exec` を確認。
10. ownerとしてoperator pageを開き、通常button clickでconfirmationを1回実行。
11. persisted attestation hashとauthoritative current versioned `/exec` hashをprivate比較しMATCHのみ受入。
12. MATCH後のみpost-attestation readinessを1回確認し、READYならR1-R8を1 bounded pass実行。

Active instruction:
`docs/handoffs/0028-CODEX-21-versioned-admin-confirmation-surface-instruction.md`

## Mutation / retry boundary

```text
new target: 0
source repair: max1 coherent repair
existing target source sync: max1
new immutable version: max1
existing WEB_APP deployment update: max1
second deployment: 0
second deployment update: 0
security confirmation button click: max1
post-readiness: max1 after MATCH only
R1-R8: one bounded pass after READY only
same-dispatch second repair: 0
historical standalone mutation: 0
physical delete: 0
provider calls: 0
```

MISMATCH、deployment identity drift/security setting broadening、operator authorization failure、またはR1-R8最初のmaterial application failureでSTOPする。同Dispatchで追加repair/retryしない。

## R1-R8 completion gate

R1. schema7 / exactly 5 Backend sheets / accepted resources / AI disabled。
R2. GP + non-GP parent-first Meeting。
R3. tiny non-GP parent-bound file + metadata readback。
R4. existing Meeting follow-up file。
R5. unlink/relink / stable IDs / physical delete0。
R6. relation-only mutation前後のMeeting Google Docs body exact equality。
R7. dedicated Meeting-only non-AI Full Output。
R8. owner-only security/integrity / provider calls0 / AI sync disabled / confidential data0。

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

Work 0028 completion does not automatically activate Work 0030。

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
| 0028-CODEX-20 | no-source versioned-context attempt stopped safely on browser tooling limitation / accepted |
| 0028-CODEX-21 | durable guarded versioned admin confirmation surface + final R1-R8 / READY |

## Completion gate

CODEX-21がsame existing deployment上でauthoritative attestation binding MATCH、post-readiness READY、provider-independent R1-R8 PASSを返す。

ChatGPTがfinal diff/evidenceをreviewし、BLOCKERなしならPR #51を収束・mergeしてWork 0028へCompletion Latchを適用する。その後は開発を止め、ユーザー実機確認へ進む。Work 0030はDEFERREDのまま。

```text
THEME_SCOPE: LIGHT_ONLY
DESIGN_BASELINE: PR_50_MERGED
PR_51: OPEN_DRAFT
ACTIVE_DISPATCH: 0028-CODEX-21
BALL: CODEX
STATUS: READY
TARGET_RUNTIME_STRATEGY: DURABLE_OPERATOR_SURFACE_THEN_FINAL_R1_R8
ACTIVE_BLOCKER: VERSIONED_CONFIRMATION_OPERATOR_PATH_MISSING
NEW_TARGET_AUTHORIZED: NO
SECOND_DEPLOYMENT_AUTHORIZED: NO
PROVIDER_CALLS_AUTHORIZED: NO
WORK_0030: DEFERRED_BY_USER
NEXT_UNUSED_DISPATCH: 0028-CODEX-22
WORK_0028_COMPLETE: NO
```

WORK_ID: 0028
DISPATCH_ID: 0028-CODEX-21
BALL: CODEX
STATUS: READY
