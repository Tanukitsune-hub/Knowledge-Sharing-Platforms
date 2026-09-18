# CODEX-19 — installer / deployment stage separation and fresh-bound qualification resume

WORK_ID: 0028
DISPATCH_ID: 0028-CODEX-19
BALL: CODEX
STATUS: READY
MODE: BUILD
PHASE: B1.7 / PRE-DEPLOYMENT READINESS REPAIR / FRESH BOUND QUALIFICATION

## Primary Outcome

CODEX-18でresource作成まで通過したexisting fresh container-bound targetをそのまま再利用し、pre-deployment installer completionとpost-deployment security attestationのstage混同を最小修正する。その後、同targetでinstaller idempotency、owner-only versioned WEB_APP、security readiness、provider-independent R1-R8までend-to-end認定する。

Work 0028完了後は停止する。Azure OpenAI / Work 0030はDEFERRED_BY_USERであり、開始・準備しない。

## Start point

Repository:
`Tanukitsune-hub/Knowledge-Sharing-Platforms`

Continue existing branch / Draft PR #51:

```text
branch: codex/0028-production-contract-build
PR: #51
CODEX-18 return HEAD: 399f80c584c01a0bf771737183e5ea28beb580bb
CODEX-18 source repair commit: cc135b49702fb04207de39b0cf529125a994172e
CODEX-18 generated artifact commit: 98c742a36d4dd42c2b7094fe26fae489b25c1030
```

Before work, fetch latest `origin/main` and read:

- `AGENTS.md`
- `tests/AGENTS.md`
- `docs/agent-governance/work-control.md`
- `docs/agent-governance/dispatch-control.md`
- `docs/handoffs/0028-CODEX-18-controller-review.md`
- PR branch `docs/handoffs/0028-CODEX-18-installer-identity-scope-repair-report.md`
- `docs/handoffs/0028-dispatches.md`
- `docs/operations/apps-script-web-app-deployment.md`
- `docs/decisions/bundle-integrity-and-installer-security.md`

This file is the authoritative CODEX-19 execution contract.

Do not merge/rebase/reset main merely to reconcile controller docs. Preserve unrelated local/uncommitted work.

## Accepted Evidence / Closed Conclusions

Do not reopen without direct contradictory evidence:

- Light design PR #50 accepted/merged.
- PR #51 production direction accepted.
- schema7 / Pitchbook 4-column append contract accepted.
- prepare lifecycle blocker CLOSED.
- CODEX-18 `userinfo.email` scope repair and safe closed-vocabulary installer outcome log are retained.
- focused installer 17/17 PASS.
- canonical 517/517 PASS.
- bundle 29/29 PASS.
- existing fresh bound target identity/source/manifest exact readback PASS.
- repaired I1 passed identity authorization, setup and validation.
- existing target contains status sheet, 4 installer folders, Backend and Audit.
- Backend exactly 5 sheets / schema 7 / AI sync FALSE / trigger 0.
- versioned deployments were 0 at CODEX-18 stop.
- historical standalone version75 runtime strategy is SUPERSEDED and must not be mutated.
- provider calls remain 0.
- Work 0030 remains DEFERRED_BY_USER.

Historical CODEX-17 root cause remains `NOT_CONFIRMED`, but it is no longer decision-relevant. Do not spend work re-proving it.

## Active Blocker

CODEX-18 directly observed:

```text
VERSIONED_DEPLOYMENTS: 0
REPAIRED_I1: ACTION_REQUIRED
ERROR_CODE: DEPLOYMENT_SECURITY_ATTESTATION_REQUIRED
EXPECTED: READY_FOR_DEPLOYMENT
```

Google Apps Script distinguishes the automatically created HEAD deployment/test surface from versioned deployments. The `/dev` web-app test URL is development-only and runs current saved code. It is not sufficient proof that a versioned Web App deployment exists.

Current production code calls deployment-security readiness immediately after installer setup/validation and accepts `/dev` as deployment identity. This can demand attestation before the permitted versioned Web App exists.

Official references for interpretation only:

- https://developers.google.com/apps-script/concepts/deployments
- https://developers.google.com/apps-script/guides/web

## Active Hypothesis

Exactly one:

```text
pre-deployment installer completion and post-deployment security readiness are conflated
-> auto HEAD/test /dev is treated as deployed identity
-> installer demands attestation before versioned deployment creation
```

## Required Repair — minimum coherent change

Repair the stage boundary, not the security requirement.

### Required behavior

1. `installKnowledgeShare()` after successful identity/setup/validation must persist and return `READY_FOR_DEPLOYMENT` regardless of an automatically available HEAD/test `/dev` surface.
2. Pre-deployment installer completion must not infer versioned deployment existence from `/dev`.
3. `checkKnowledgeShareReadiness()` remains the post-deployment readiness gate.
4. After a versioned Web App exists, readiness without attestation must not become `READY`.
5. `confirmKnowledgeShareDeploymentSecurity()` keeps current administrator/owner fail-closed authorization.
6. A matching valid attestation is still required before final `READY`.
7. Do not weaken URL validation, identity guards, owner latch, deployment attestation, access restrictions, or public surface.

Prefer the smallest production change. A dedicated pre-deployment status builder or an equivalent localized stage separation is acceptable. Do not introduce deployment-management APIs into the product merely to detect deployment existence.

### Regression coverage

At minimum prove deterministically:

- installer with a non-empty `/dev` test URL and no attestation -> `READY_FOR_DEPLOYMENT` after setup/validation;
- installer rerun remains idempotent and does not duplicate resources;
- `checkKnowledgeShareReadiness()` with deployment identity but no attestation -> `ACTION_REQUIRED / DEPLOYMENT_SECURITY_ATTESTATION_REQUIRED`;
- valid guarded confirmation -> `READY`;
- changed deployment identity invalidates prior attestation;
- malformed deployment identity remains fail-closed in post-deployment readiness/confirmation;
- existing identity/owner tests and safe logging remain passing.

Remove or correct any prior deterministic assertion that encoded `/dev` as sufficient evidence to block I1 with deployment attestation.

## Validation before target mutation

Run the smallest relevant tests first, then canonical gates:

1. focused installer tests;
2. manifest/distribution tests affected by the change;
3. `npm run check`;
4. `npm run check:bundle`;
5. regenerate deterministic `dist/**` from canonical source;
6. exact bundle/manifest parity/reproducibility checks;
7. `git diff --check`.

If logic validation fails, repair within the same bounded source change before target sync. Do not mutate the target until deterministic gates pass.

Commit the coherent source/test change and regenerated artifacts to PR #51 branch. Keep human-facing report/docs in Japanese; code/identifiers/path/protocol labels remain English.

## Existing target mutation boundary

Use the exact existing CODEX-17/18 fresh bound target only.

Before mutation, read-only verify:

- same authenticated owner/principal continuity;
- bound project -> same host Spreadsheet -> same isolated parent;
- host/parent remain owner-only/non-shared/non-trashed;
- current remote source/manifest matches CODEX-18 returned exact artifact;
- installer resources from CODEX-18 remain present;
- versioned deployment count remains 0 unless contradictory evidence appeared after CODEX-18.

If target identity is ambiguous or unexpected mutation is observed, STOP and return to ChatGPT.

After preflight, sync the repaired exact bundle/manifest to the existing target exactly once. Exact-read back after sync.

No new target may be created.

## Installer recovery / idempotency gate

Run `installKnowledgeShare()` exactly once after repaired source sync.

Because CODEX-18 already created the installation resources, this single run is both:

- recovery evidence that the corrected stage returns `READY_FOR_DEPLOYMENT`, and
- the one allowed I2 idempotency rerun.

Acceptance:

```text
state: READY_FOR_DEPLOYMENT
error: none
resource duplicates: 0
Backend: exactly 5 sheets
schema: 7
AI sync: FALSE
triggers: 0
```

Do not run installer a second time in CODEX-19.

If this gate fails, STOP. Do not perform another source repair/retry in the same Dispatch.

## Versioned WEB_APP gate

Only after installer/idempotency PASS:

Create exactly one qualification deployment explicitly typed `Web app` through the approved editor/native flow.

Required settings:

- versioned deployment, non-zero immutable version;
- execute as deploying user;
- access restricted to deploying user / `MYSELF`;
- generated endpoint is `/exec`;
- no broad/domain/public access;
- no update/mutation to historical version75 or any Library deployment.

Before any existing-deployment update, follow `docs/operations/apps-script-web-app-deployment.md`. For this fresh target, prefer one new versioned WEB_APP; do not repurpose ambiguous/head deployments.

Read back authoritative Apps Script deployment metadata and privately establish:

```text
entrypoint: WEB_APP
versionNumber: > 0
execute-as/access: approved restricted values
/exec identity: present
```

Do not include deployment ID, private URL, account identity, or raw private metadata in GitHub/report/chat.

## Security readiness gate

After the versioned Web App is proven:

1. Run `checkKnowledgeShareReadiness()` once before attestation.
   - expected: `ACTION_REQUIRED / DEPLOYMENT_SECURITY_ATTESTATION_REQUIRED`.
2. Manually/native verify the deployment is the same owner-only versioned WEB_APP just read back.
3. Run `confirmKnowledgeShareDeploymentSecurity()` exactly once.
4. Read the saved attestation privately.
5. Compute SHA-256 of the authoritative versioned `/exec` identity outside the application and compare it with the stored `deploymentIdentitySha256`.
   - report only `MATCH` / `MISMATCH`; never report the URL/hash/ID.
6. Run `checkKnowledgeShareReadiness()` once after confirmation.
   - expected: `READY`.

This hash comparison is mandatory. It proves that the attestation is bound to the actual versioned Web App rather than an unrelated HEAD/test identity.

If hash comparison is `MISMATCH`, or any security/readiness step fails, STOP. Do not patch again or create a second deployment in this Dispatch.

## Provider-independent R1-R8

Only after security readiness PASS, run one bounded provider-independent runtime pass on the same target.

R1 — fresh schema/resource contract
- schema7, exactly 5 Backend sheets;
- AI sync disabled;
- no provider configuration/call required;
- owner-only qualification access.

R2 — GP + non-GP parent-first Meeting
- create synthetic GP Meeting and synthetic non-GP Meeting through production path;
- stable parent Meeting IDs before related-file registration.

R3 — parent-bound tiny file
- add one tiny synthetic file to the non-GP Meeting;
- read back parent/counterparty metadata and relationship.

R4 — follow-up file
- add a second tiny synthetic file to an existing Meeting;
- confirm same Meeting identity and separate file identity.

R5 — unlink / relink
- visible delete semantics = unlink from current Meeting only;
- relink succeeds with stable file/document IDs;
- physical delete count 0.

R6 — authoritative Meeting Docs body
- capture exact Google Docs body before relation-only mutation;
- add/unlink/relink as required;
- exact body equality after relation-only mutation.

R7 — dedicated Full Output
- Meeting-only, non-AI Full Output works without model/question/provider;
- no provider call.

R8 — security/integrity
- owner-only deployment remains restricted;
- readiness remains READY;
- AI sync disabled;
- trigger count remains expected;
- provider calls 0;
- no unauthorized sharing / physical delete / real confidential data.

Use only synthetic/anonymized data. Keep IDs/private URLs out of GitHub and chat.

## Mutation / retry budget

```text
new target: 0
existing target source sync: max 1
installer rerun / I2: max 1
new versioned WEB_APP: max 1
deployment update: 0
pre-attestation readiness check: max 1
security confirmation: max 1
post-attestation readiness check: max 1
R1-R8: one bounded pass
source repair after first runtime failure: 0
second deployment: 0
historical standalone mutation: 0
physical delete: 0
Direct OpenAI calls: 0
Gemini calls: 0
Azure OpenAI calls: 0
```

## User action handling

If a native Google authorization or deployment UI action truly requires the user, keep the same Dispatch ID and return:

```text
WORK_ID: 0028
DISPATCH_ID: 0028-CODEX-19
BALL: USER
STATUS: ACTION_REQUIRED
```

Ask only for the minimum native action. Do not ask the user to paste private IDs, URLs, account emails, tokens, or credentials into chat.

After the user completes the native action, resume the same Dispatch rather than creating another Dispatch ID.

## Stop conditions / Strategy Reset

Immediately STOP and return to ChatGPT if any of the following occurs:

- target identity or source parity becomes ambiguous;
- installer rerun is not `READY_FOR_DEPLOYMENT`;
- duplicate installer resources appear;
- deployment is not positively proven as versioned `WEB_APP` + `/exec` + approved restricted settings;
- attestation hash != authoritative versioned `/exec` identity hash;
- readiness does not become READY after confirmation;
- first material R1-R8 application failure;
- provider call, AI sync activation, real-data write, unauthorized sharing, or physical delete occurs;
- another source repair/deployment would be required.

Do not consume remaining budget merely because it exists.

## Report / return

Write:
`docs/handoffs/0028-CODEX-19-installer-deployment-stage-repair-report.md`

Update PR #51 body with the return summary. Do not merge PR #51.

Report separately:

- `LOGIC_VALIDATION`
- `TARGET_RUNTIME_QUALIFICATION`
- installer/idempotency state
- versioned WEB_APP/security readiness
- attestation-to-authoritative-deployment hash `MATCH/MISMATCH`
- R1-R8 evidence
- `SIDE_EFFECT_STATE`
- `PROVIDER_CALLS`
- `BLOCKER`
- `READY`

Final Codex chat response MUST begin and end with:

```text
WORK_ID: 0028
DISPATCH_ID: 0028-CODEX-19
BALL: CHATGPT
STATUS: RETURNED
```

If native user action is required, use the USER/ACTION_REQUIRED block defined above instead.

WORK_ID: 0028
DISPATCH_ID: 0028-CODEX-19
BALL: CODEX
STATUS: READY
