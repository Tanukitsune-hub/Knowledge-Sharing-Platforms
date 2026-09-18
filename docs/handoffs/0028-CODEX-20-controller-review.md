# CODEX-20 controller review — tooling limitation / next repair boundary

WORK_ID: 0028
DISPATCH_ID: 0028-CODEX-20
BALL: CHATGPT
STATUS: REVIEW
MODE: QUALIFICATION -> STRATEGY RESET TO BUILD

確認日: 2026-09-17 JST。

## Review conclusion

CODEX-20の停止判断を受理する。

existing target、single owner-only version1 WEB_APP、saved source / immutable version parityはread-onlyで再確認された。一方、現在のbrowser harnessでは任意JavaScript evaluationがread-only page scopeに限定され、既存通常UIにはdeployment security confirmationを呼ぶoperator controlがない。そのためversioned `/exec` contextから `google.script.run.confirmKnowledgeShareDeploymentSecurity()` を安全に実行できず、confirmationを0回のまま停止した。

これは `AUTOMATION_TOOLING_LIMITATION` であり、application failureでもCODEX-19のhash mismatch再発でもない。

## Accepted evidence retained

```text
INSTALLER_STAGE_REPAIR: PASS
INSTALLER_IDEMPOTENCY_I2: PASS / DUPLICATES_0
BACKEND: EXACTLY_5_SHEETS / SCHEMA_7
AI_SYNC: FALSE
TRIGGERS: 0
VERSIONED_WEB_APP: EXACTLY_1 / VERSION_1 / WEB_APP / USER_DEPLOYING / MYSELF
PRE_ATTESTATION_READINESS: ACTION_REQUIRED / DEPLOYMENT_SECURITY_ATTESTATION_REQUIRED
LOGIC_VALIDATION: 518/518 PASS
BUNDLE_VALIDATION: 30/30 PASS
CODEX20_SOURCE_AND_DEPLOYMENT_INTEGRITY: PASS_READ_ONLY
CODEX20_CONFIRMATION_CALLS: 0
PROVIDER_CALLS: 0
```

CODEX-19でnative editorから書かれたattestationはauthoritative versioned `/exec` hashとMISMATCHしたまま保持する。CODEX-20はこれを上書きしていない。

## Strategy Reset

Primary Outcomeは不変:
accepted Light UI + production contractをfinal container-bound architectureでprovider-independentにend-to-end認定する。

CODEX-20で明らかになったのは、security confirmationそのものではなく、versioned Web App contextからguarded confirmationを通常の許可されたUI操作で呼び出すdurable operator surfaceが存在しないこと。

Developer Tools、javascript URL、hidden browser RPC、tool制約回避を運用手順にしない。実運用でもdeployment security confirmationを再現可能にする必要があるため、次の最小修正は一時的テストwrapperではなく、normal user navigationから独立したguarded operator-only confirmation surfaceとする。

## CODEX-21 direction

次Dispatchではexisting targetを継続し、次の最小durable surfaceのみ追加する。

- versioned Web App上にunlinked operator-only deployment-security route/pageを追加する。
- pageは通常のsidebar/navigation/search/admin product UIからリンクしない。
- page自身は秘密URLをsecurity boundaryにしない。server-side `confirmKnowledgeShareDeploymentSecurity()` の既存owner/admin fail-closed gateを唯一の権限判定とする。
- GET/render時には一切mutationしない。明示的なbutton clickから `google.script.run.confirmKnowledgeShareDeploymentSecurity()` を呼ぶ。
- response表示はclosed vocabularyのstate/error code等に限定し、email、ID、deployment URL/hash、private mappingを表示しない。
- normal user product surface、provider behavior、Meeting/Pitchbook business flowは変更しない。

この修正はbrowser harnessで通常button clickとして実行可能であり、arbitrary page-context JavaScript evaluationを不要にする。

## Runtime continuation boundary

CODEX-21はsource repair後、existing bound targetへ1回だけ同期し、新しいimmutable versionを1つ作成して、既存single WEB_APP deploymentをそのversionへ1回だけupdateする。second deploymentは作らない。

更新後のauthoritative metadataで同じdeployment identity / WEB_APP / USER_DEPLOYING / MYSELFを確認してからoperator-only pageをownerとして開き、buttonを1回だけclickする。

受入:

```text
ATTESTATION_TO_AUTHORITATIVE_VERSIONED_EXEC: MATCH
POST_ATTESTATION_READINESS: READY
```

この2つが成立した場合のみR1-R8を1 bounded passで実行する。

再MISMATCH、operator page authorization failure、existing deployment update identity drift、または最初のmaterial R1-R8 failureでSTOP。同Dispatchで追加repair、second version、second deployment update、second confirmationは行わない。

## Provider / Azure boundary

```text
Direct OpenAI calls: 0
Gemini calls: 0
Azure OpenAI calls: 0
AI sync: disabled
WORK_0030: DEFERRED_BY_USER
```

Azure OpenAIは引き続き保留。Work 0028完了後も自動開始しない。

## Controller disposition

CODEX-20は `ACCEPTED_AS_SAFE_TOOLING_STOP`。

次Dispatch: `0028-CODEX-21`。

WORK_ID: 0028
DISPATCH_ID: 0028-CODEX-20
BALL: NONE
STATUS: ACCEPTED
