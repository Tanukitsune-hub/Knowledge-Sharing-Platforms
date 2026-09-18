# CODEX-20 — versioned runtime attestation qualification

WORK_ID: 0028
DISPATCH_ID: 0028-CODEX-20
BALL: CODEX
STATUS: READY
MODE: QUALIFICATION
PHASE: B1.8 / VERSIONED RUNTIME ATTESTATION / FINAL R1-R8

## Primary Outcome

CODEX-19で作成済みのsingle owner-only version1 WEB_APPをそのまま利用し、deployment security attestationをactual versioned `/exec` runtime contextへ正しくbindingできるかをsource変更なしで決定的に確認する。

MATCH + readiness READYなら、そのままprovider-independent R1-R8を1 bounded passで完了する。

Work 0028完了後は停止する。Azure OpenAI / Work 0030はDEFERRED_BY_USERであり開始しない。

## Start point

Repository:
`Tanukitsune-hub/Knowledge-Sharing-Platforms`

Continue existing branch / Draft PR #51:

```text
branch: codex/0028-production-contract-build
PR: #51
CODEX-19 return head: 0a678cc (resolve to exact remote HEAD before work)
```

Read first:

- `AGENTS.md`
- `tests/AGENTS.md`
- `docs/agent-governance/work-control.md`
- `docs/agent-governance/dispatch-control.md`
- `docs/handoffs/0028-CODEX-19-controller-review.md`
- PR branch `docs/handoffs/0028-CODEX-19-installer-deployment-stage-repair-report.md`
- `docs/handoffs/0028-dispatches.md`
- `docs/operations/apps-script-web-app-deployment.md`
- `docs/decisions/bundle-integrity-and-installer-security.md`

## Accepted evidence — do not reopen

```text
INSTALLER_STAGE_REPAIR: PASS
INSTALLER_IDEMPOTENCY_I2: PASS / DUPLICATES_0
BACKEND: EXACTLY_5_SHEETS / SCHEMA_7
AI_SYNC: FALSE
TRIGGERS: 0
VERSIONED_WEB_APP: 1 / VERSION_1 / WEB_APP / USER_DEPLOYING / MYSELF
PRE_ATTESTATION_READINESS: ACTION_REQUIRED / DEPLOYMENT_SECURITY_ATTESTATION_REQUIRED
LOGIC_VALIDATION: 518/518 PASS
BUNDLE_VALIDATION: 30/30 PASS
PROVIDER_CALLS: 0
```

The existing target, installer resources, version1 deployment, and current saved attestation are retained evidence. Do not recreate or clean them.

## Active Hypothesis — exactly one

```text
CODEX-19 confirmation ran from editor/head context
-> ScriptApp.getService().getUrl() bound to a non-versioned context-sensitive identity
-> persisted attestation hash mismatched authoritative versioned /exec

Run the same guarded confirmation from actual owner-only versioned /exec browser context
-> deployment identity resolves to the actual versioned Web App
-> persisted attestation hash MATCHES authoritative versioned /exec
```

Do not introduce another hypothesis unless this one is directly falsified.

## Fastest Safe Decisive Action

No source change first.

1. Establish current identity chain read-only:
   - PR branch remote HEAD
   - exact saved source/manifest parity
   - existing target/host/bound project identity
   - exactly one versioned WEB_APP
   - version > 0
   - WEB_APP entrypoint
   - USER_DEPLOYING
   - MYSELF
   - authoritative `/exec` exists
   - no second versioned deployment

2. Open the existing owner-only versioned `/exec` as the deploying owner.

3. Confirm the main page actually renders before mutation.

4. From that browser page execution context, invoke the existing public guarded server function exactly once via the Apps Script HTML Service bridge:

```javascript
google.script.run
  .withSuccessHandler(...)
  .withFailureHandler(...)
  .confirmKnowledgeShareDeploymentSecurity();
```

Use browser automation/runtime evaluation if available. Do not add a button, wrapper, route, query mutation, or source patch merely to invoke it.

Do not ask the user to use Developer Tools or paste/run JavaScript.

5. Read only the returned closed-vocabulary status/state and persisted attestation metadata needed for qualification. Do not record private URL, deployment ID, account, raw hash, token, or identity values.

6. Independently compute the authoritative versioned `/exec` SHA-256 outside the application using the already-confirmed authoritative deployment identity and compare privately with the persisted attestation hash.

Acceptance:

```text
ATTESTATION_TO_AUTHORITATIVE_VERSIONED_EXEC: MATCH
```

No other outcome is accepted.

## If attestation MATCHES

Continue in the same Dispatch.

1. Invoke `checkKnowledgeShareReadiness()` from the same versioned `/exec` browser context once.
2. Require:

```text
state: READY
error: NONE
```

3. Re-read deployment metadata and ensure the same single version1 owner-only WEB_APP remains authoritative.
4. Confirm source/manifest/deployment count unchanged.
5. Execute provider-independent R1-R8 once.

R1-R8 acceptance remains:

- R1: schema7 / exactly 5 backend sheets / AI disabled.
- R2: GP + non-GP parent-first Meeting registration.
- R3: tiny non-GP parent-bound file + metadata readback.
- R4: follow-up file added to an existing Meeting.
- R5: unlink/relink with stable IDs; physical delete 0.
- R6: authoritative Meeting Google Docs body exact equality before/after relation-only mutation.
- R7: dedicated Meeting-only non-AI Full Output without model/question requirement.
- R8: owner-only runtime/security/integrity; AI sync disabled; provider calls 0; no confidential data.

Stop on the first material application failure. Do not repair and rerun R1-R8 in this Dispatch.

## If attestation MISMATCHES again

STOP immediately.

Do not:

- change source;
- change manifest;
- resync source;
- create version2;
- update the existing deployment;
- create a second deployment;
- run confirmation again;
- run post-readiness;
- run R1-R8.

Return that `ScriptApp.getService().getUrl()` based binding is not proven sufficient even from versioned `/exec` context. A different explicit authoritative deployment-binding mechanism must be designed in a new Dispatch.

## If browser-context invocation is unavailable

If the available browser harness cannot safely evaluate the HTML Service page context / `google.script.run`, STOP without source change.

Classify as automation/tooling limitation, not application failure.

Do not ask the user to use Developer Tools. Do not create a diagnostic surface merely to bypass the tooling limitation.

## Mutation / retry budget

```text
new target: 0
source change: 0
source sync: 0
new version: 0
new deployment: 0
deployment update: 0
security confirmation: max 1
post-readiness check: max 1 after MATCH only
R1-R8: max 1 bounded pass after READY only
provider calls: 0
AI sync enable: 0
physical delete: 0
historical version75 mutation: 0
```

The existing mismatched attestation may be overwritten only by the one authorized confirmation from versioned `/exec` context.

## Provider / Azure boundary

```text
Direct OpenAI calls: 0
Gemini calls: 0
Azure OpenAI calls: 0
AI sync: disabled
provider File Search/citation runtime: OUT_OF_SCOPE
WORK_0030: DEFERRED_BY_USER
```

## Report

Write:

`docs/handoffs/0028-CODEX-20-versioned-runtime-attestation-qualification-report.md`

Report at minimum:

```text
VERSIONED_EXEC_RENDER
VERSIONED_CONTEXT_CONFIRMATION
ATTESTATION_TO_AUTHORITATIVE_VERSIONED_EXEC
POST_ATTESTATION_READINESS
TARGET_RUNTIME_R1_R8
SOURCE_AND_DEPLOYMENT_INTEGRITY
SIDE_EFFECT_STATE
PROVIDER_CALLS
READY
BLOCKER
```

Do not commit/report private URLs, deployment IDs, account/email, tokens, raw attestation hash, or organization-specific runtime IDs.

Continue same branch / Draft PR #51. Do not merge/rebase/reset main and do not merge the PR. Final review/merge/Completion Latch belongs to ChatGPT.

## Return contract

Normal return:

```text
WORK_ID: 0028
DISPATCH_ID: 0028-CODEX-20
BALL: CHATGPT
STATUS: RETURNED
```

Only if a native user action that cannot be performed by the current authenticated browser session is strictly necessary:

```text
WORK_ID: 0028
DISPATCH_ID: 0028-CODEX-20
BALL: USER
STATUS: ACTION_REQUIRED
```

Request only the minimum native UI action and keep the same Dispatch ID.

WORK_ID: 0028
DISPATCH_ID: 0028-CODEX-20
BALL: CODEX
STATUS: READY
