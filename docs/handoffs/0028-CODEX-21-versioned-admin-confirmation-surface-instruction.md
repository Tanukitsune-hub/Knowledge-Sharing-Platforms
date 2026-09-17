# CODEX-21 — guarded versioned admin confirmation surface + final qualification

WORK_ID: 0028
DISPATCH_ID: 0028-CODEX-21
BALL: CODEX
STATUS: READY
MODE: BUILD
PHASE: B1.9 / GUARDED VERSIONED ADMIN CONFIRMATION SURFACE / FINAL R1-R8

## Primary Outcome

CODEX-20のbrowser harness tooling limitationを、実運用にも使える最小durable operator surfaceで解消する。existing fresh container-bound targetとexisting single owner-only WEB_APPを継続利用し、actual versioned `/exec` contextからdeployment security confirmationを正常にbindingした後、provider-independent R1-R8までend-to-end認定する。

Work 0028完了後は停止する。Azure OpenAI / Work 0030はDEFERRED_BY_USERであり開始・準備しない。

## Start point

Repository:
`Tanukitsune-hub/Knowledge-Sharing-Platforms`

Continue existing branch / Draft PR #51:

```text
branch: codex/0028-production-contract-build
PR: #51
CODEX-20 return head: 4488d9b (resolve exact remote HEAD before work)
```

Read first:

- `AGENTS.md`
- `tests/AGENTS.md`
- `docs/agent-governance/work-control.md`
- `docs/agent-governance/dispatch-control.md`
- `docs/handoffs/0028-CODEX-20-controller-review.md`
- PR branch `docs/handoffs/0028-CODEX-20-versioned-runtime-attestation-qualification-report.md`
- `docs/handoffs/0028-dispatches.md`
- `docs/operations/apps-script-web-app-deployment.md`
- `docs/decisions/bundle-integrity-and-installer-security.md`

Do not merge/rebase/reset main merely to import these control docs. Read authoritative main docs separately and preserve branch application work.

## Accepted evidence — do not reopen

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
CODEX20_EXISTING_TARGET_IDENTITY: PASS_READ_ONLY
CODEX20_CONFIRMATION_CALLS: 0
PROVIDER_CALLS: 0
```

Current persisted attestation from CODEX-19 is known MISMATCH evidence and may be overwritten only by the authorized CODEX-21 versioned-context confirmation after the repaired operator surface is deployed.

## Active problem

The guarded server function already exists, but there is no permitted ordinary UI action that invokes it from the actual versioned Web App context. Current browser harness arbitrary JavaScript evaluation is read-only. Developer Tools, javascript URLs, hidden RPC, or browser-tool bypasses are not acceptable deployment operations.

This is now an application operability gap, not merely a harness problem: deployment security confirmation must have a repeatable supported operator path.

## Required minimal design

Add exactly one unlinked operator-only deployment-security surface on the Web App.

Requirements:

1. `doGet` may route an explicit operator-only page identifier to a minimal HTML page.
2. The operator page must NOT be linked from normal sidebar/navigation, Knowledge Search, Meeting, analytics, or ordinary admin product UI.
3. GET/render must be read-only. Do not mutate or attest merely by opening the page.
4. The page exposes one explicit confirmation button. A normal browser click calls existing guarded `confirmKnowledgeShareDeploymentSecurity()` through `google.script.run`.
5. Existing server-side owner/admin authorization remains authoritative and fail-closed. Do not weaken or bypass it.
6. The page must not treat obscurity/query-string secrecy as authorization.
7. Do not expose email, account, Script ID, deployment ID, private URL, hash, property value, credential, token, raw error, or internal mapping.
8. UI result is limited to safe state/error code/short operator guidance already represented by existing installer status vocabulary.
9. Do not add a generic arbitrary-function runner, debug console, hidden eval bridge, or reusable mutation harness.
10. Normal product behavior and AI/provider paths remain unchanged.

Prefer the smallest source surface that satisfies these constraints. Do not redesign normal UI.

## Logic validation

Add/adjust focused deterministic coverage proving at minimum:

- operator page/route exists in production source and bundle;
- page render itself does not invoke confirmation;
- one explicit button path invokes only `confirmKnowledgeShareDeploymentSecurity()`;
- no arbitrary server function name/input path exists;
- normal navigation does not link to the operator route;
- unauthorized/invalid confirmation remains fail-closed through existing server contract;
- private identifiers are absent from operator HTML/result handling;
- existing installer/readiness tests remain passing.

Run smallest focused tests first, then:

```text
npm run check
npm run check:bundle
git diff --check
```

Regenerate deterministic distribution through canonical build process only. Never hand-edit `dist/KnowledgeShare.bundle.gs`.

## Target mutation budget

Use the same existing target only.

```text
new target: 0
source repair: max 1 coherent repair
existing target source sync: max 1
new immutable version: max 1
existing WEB_APP deployment update: max 1
second deployment: 0
second deployment update: 0
operator confirmation click: max 1
authoritative hash comparison: max 1
post-attestation readiness: max 1
R1-R8 campaign: one bounded pass
historical standalone mutation: 0
physical delete: 0
provider calls: 0
```

Before mutation, positively re-establish project/host/deployment identity and remote source state. Preserve private IDs/URLs only in ignored local evidence.

## Existing deployment update

After logic validation PASS:

1. Sync the exact repaired generated source/manifest to the existing bound project once.
2. Exact readback.
3. Create exactly one new immutable version from that repaired source.
4. Update the existing single owner-only WEB_APP deployment to that version once. Do not create another deployment.
5. Read back authoritative metadata and prove:
   - same existing deployment identity;
   - versionNumber is the newly created version;
   - entryPointType WEB_APP;
   - executeAs USER_DEPLOYING;
   - access MYSELF;
   - versioned `/exec` present.
6. Open the existing owner-only versioned `/exec` as deploying owner and verify main page render before operator action.

If deployment identity changes unexpectedly, settings broaden, source/version mismatch occurs, or update is ambiguous, STOP before confirmation.

## Versioned-context confirmation

Using normal browser UI actions only:

1. Navigate the same versioned `/exec` to the dedicated operator-only route/page.
2. Verify the page does not mutate on load.
3. Click the confirmation button exactly once.
4. Wait for the safe result.
5. Read persisted attestation privately.
6. Independently compute authoritative current versioned `/exec` SHA-256 outside the application.
7. Compare only privately.

Required gate:

```text
ATTESTATION_TO_AUTHORITATIVE_VERSIONED_EXEC: MATCH
```

Do not print URL/hash/account/private IDs in chat/GitHub/report.

If MISMATCH, unauthorized state, unexpected error, or confirmation cannot be triggered through the normal button, STOP. Do not patch again in this Dispatch.

## Post-attestation readiness

Only after MATCH:

- call/read `checkKnowledgeShareReadiness()` once through an allowed normal surface/context;
- require `READY` and no error;
- re-read authoritative deployment metadata to confirm same single owner-only deployment;
- confirm AI sync remains disabled and provider calls remain 0.

If readiness is not READY, STOP.

## R1-R8 final campaign

Only after security readiness PASS, execute one bounded provider-independent synthetic campaign:

R1. schema7 / exactly 5 Backend sheets / AI disabled / accepted resources.
R2. GP + non-GP parent-first Meeting registration.
R3. tiny non-GP parent-bound file + metadata readback.
R4. follow-up file added to existing Meeting.
R5. unlink/relink / stable IDs / physical delete 0.
R6. exact authoritative Meeting Google Docs body equality before/after relation-only mutation.
R7. dedicated Meeting-only non-AI Full Output works without AI model/question/provider.
R8. owner-only runtime/security/integrity, provider calls 0, AI sync disabled, confidential data 0.

Use synthetic/anonymized values only. Stop on first material application failure. Do not repair/retry inside this Dispatch after such a failure.

## Provider / Azure boundary

```text
Direct OpenAI calls: 0
Gemini calls: 0
Azure OpenAI calls: 0
AI sync: disabled
provider File Search/citation runtime: OUT_OF_SCOPE
WORK_0030: DEFERRED_BY_USER
```

## Git / report

Continue same branch and Draft PR #51. Do not merge.

Report:
`docs/handoffs/0028-CODEX-21-versioned-admin-confirmation-surface-report.md`

Report must include:

```text
WORK_ID
DISPATCH_ID
START_REMOTE_PR_HEAD
SOURCE_CHANGE_SUMMARY
FOCUSED_VALIDATION
CANONICAL_VALIDATION
BUNDLE_VALIDATION
EXISTING_TARGET_REUSED
SOURCE_SYNC_COUNT
NEW_VERSION_COUNT
EXISTING_DEPLOYMENT_UPDATE_COUNT
VERSIONED_WEB_APP_METADATA
OPERATOR_PAGE_RENDER
CONFIRMATION_CLICK_COUNT
ATTESTATION_TO_AUTHORITATIVE_VERSIONED_EXEC
POST_ATTESTATION_READINESS
TARGET_RUNTIME_R1_R8
PROVIDER_CALLS
AI_SYNC
SIDE_EFFECT_STATE
BLOCKER
READY
```

No private IDs/URLs/hashes/accounts/credentials.

## Return contract

If user OAuth/native click is unexpectedly required and cannot be completed by the available authenticated browser actions, retain this Dispatch ID and return:

```text
WORK_ID: 0028
DISPATCH_ID: 0028-CODEX-21
BALL: USER
STATUS: ACTION_REQUIRED
```

with only minimal ordinary UI steps. Do not ask for Developer Tools or JavaScript execution.

Otherwise final return must begin and end exactly:

```text
WORK_ID: 0028
DISPATCH_ID: 0028-CODEX-21
BALL: CHATGPT
STATUS: RETURNED
```

PR merge and Work 0028 Completion Latch remain ChatGPT-owned.
