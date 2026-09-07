# CODEX-14 — editor/operator runtime qualification for PR #51

WORK_ID: 0028
DISPATCH_ID: 0028-CODEX-14
BALL: CODEX
STATUS: READY
MODE: BUILD
PHASE: B1.3 / EDITOR-APPROVED RUNTIME QUALIFICATION

## Primary Outcome

PR #51のCODEX-13 frozen production sourceを、追加のExecution API/OAuth surfaceを作らず、既存Apps Script editor operator entrypoint + verified versioned Web App `/exec`を使ってtarget runtimeで認定する。

成功条件はprovider-independent primary flow R1–R8のPASS。Azure OpenAI / Direct OpenAI / Geminiのprovider runtimeは本dispatchでは実行しない。

## Start point

Repository:
`Tanukitsune-hub/Knowledge-Sharing-Platforms`

Continue existing branch / PR:

```text
branch: codex/0028-production-contract-build
PR: #51
returned HEAD: 7b1241fc03c6bee6f7fb0ec0748aa3c1ae4bc577
CODEX-13 frozen source: 5842a07255a10415d39d524fd8ec174450248855
CODEX-13 bundle commit: 2ab8b262c7211af5464f3201a77c6e45484cdc6c
```

Read first:

- latest `origin/main`
- applicable `AGENTS.md`
- `docs/handoffs/0028-CODEX-13-controller-review.md`
- this instruction
- `docs/operations/apps-script-web-app-deployment.md`
- `docs/decisions/company-azure-openai-provider.md`

Do not merge/rebase main into PR branch merely to import control docs. `docs/handoffs/0028-dispatches.md` and `docs/planning/work-registry.md` are ChatGPT-owned.

## Closed Conclusions

- prepare lifecycle blocker is CLOSED. Do not redesign it unless a direct runtime defect disproves accepted evidence.
- source direction of PR #51 is accepted for runtime qualification.
- HTTP 403 from CODEX-13 is an Execution API authorization-path issue, not an application defect.
- Do not use `scripts.run` for `getInstallationStatus_` or other private functions.
- Do not create an API executable deployment, OAuth client, new Cloud project, public diagnostic wrapper, or expand OAuth scopes for this Work.
- private setup/status/diagnostic functions remain private.
- editor-visible operator entrypoints are the approved control plane:
  - `installKnowledgeShare()`
  - `checkKnowledgeShareReadiness()`
  - `confirmKnowledgeShareDeploymentSecurity()` only if readiness requires it after security metadata is positively rechecked.
- normal business flow qualification uses the verified Web App `/exec` and existing normal-user public facades.
- provider calls are 0. Azure runtime is Work 0030.

## Evidence hierarchy

1. authoritative Apps Script / Workspace readback
2. versioned `/exec` observed browser behavior and execution history
3. exact saved source / immutable version / bundle parity
4. deterministic evidence already accepted
5. inference

## Pre-mutation identity refresh

Before any source or runtime mutation, fresh read-only proof:

```text
Git source ref
-> Apps Script project
-> current saved source
-> current immutable version 75
-> intended existing WEB_APP deployment
-> /exec
-> execute-as = USER_DEPLOYING
-> access = MYSELF
-> browser account = expected owner context
-> current observed version-75 Web App execution
```

If any link is contradictory or unknown, STOP with mutation 0.

Multiple WEB_APP deployments in inventory are not by themselves ambiguity. Identify the intended deployment using project/source/version/entrypoint/account continuity.

## Runtime mutation path

Only after identity proof.

### Step 1 — exact source push

Push exactly the reviewed CODEX-13 modular source to the same Apps Script project saved source.

- source push budget: max 1
- do not push generated bundle over modular source unless the existing project is positively proven to be bundle-mode; preserve the current source mode
- verify remote saved source parity after push
- if parity is not exact, STOP before setup/version/deployment

### Step 2 — editor readiness / setup

Use the Apps Script editor under the already-proven owner browser context.

1. Run `checkKnowledgeShareReadiness()` from the editor.
2. If append-only schema/setup is required, run `installKnowledgeShare()` once from the editor.
3. Run `checkKnowledgeShareReadiness()` again.
4. If and only if readiness explicitly requires deployment security confirmation, re-read intended deployment metadata and verify `WEB_APP + /exec + USER_DEPLOYING + MYSELF`; then run `confirmKnowledgeShareDeploymentSecurity()` from the editor.

Do not call private `_` functions from browser client or Execution API.

Do not request or apply access expansion, OAuth scope expansion, API executable creation, Cloud project switch, new credential, or secret mutation.

### Step 3 — version and deployment

When readiness and saved-source parity are satisfactory:

- create exactly one immutable version from the reviewed saved source
- record the version number privately/report only the non-sensitive version number
- update the already positively identified existing WEB_APP deployment to that version
- deployment mutation budget: max 1
- new deployment: forbidden
- Library/ambiguous deployment mutation: forbidden

Read back after update:

- same deployment identity
- entrypoint WEB_APP
- same intended `/exec`
- USER_DEPLOYING / MYSELF unchanged
- immutable version points to exact reviewed source

If deployment update fails, STOP. Do not create a second deployment.

### Step 4 — open `/exec`

Open the verified existing `/exec` in the proven browser account and confirm the new version serves successfully.

Observe corresponding Apps Script execution history where available. Do not infer success from source parity alone.

## Synthetic runtime acceptance matrix

Use clearly synthetic/anonymized data only. Prefix records/files so they are unambiguously test data. Never use real confidential content.

### R1 Schema / setup

PASS requires:

- `KSP_SCHEMA_VERSION = 7` effective in target runtime
- `Pitchbook_Index` includes exactly the four appended columns:
  - `Parent_Meeting_ID`
  - `Counterparty_Type`
  - `Counterparty_ID`
  - `Related_GP_IDs`
- pre-existing columns/rows are preserved
- setup/readiness rerun is idempotent
- no new sheet/database

### R2 GP + non-GP Meeting

Using normal Web App flow:

- create one synthetic GP Meeting
- create one synthetic non-GP Meeting using one existing allowed non-GP Counterparty Type/Entity
- capture stable Meeting_ID / Version / Google Docs identity
- do not create any Pitchbook before parent Meeting commit succeeds

### R3 Parent-bound tiny file

For the non-GP Meeting:

- attach one tiny supported synthetic file
- require stable Document_ID and Drive file creation
- authoritative Pitchbook row readback must match:
  - Parent_Meeting_ID = parent
  - Counterparty_Type = parent
  - Counterparty_ID = parent
  - Related_GP_IDs = parent snapshot
  - GP_ID remains blank unless parent is GP
- relation list contains Document_ID

Do not call any AI provider.

### R4 Existing Meeting follow-up

From Past Records / saved Meeting context:

- add a second tiny file to the same parent Meeting
- no new Meeting_ID
- new Document_ID only
- parent metadata remains correct

### R5 Unlink / relink

- use visible `削除` action to unlink one file from current Meeting
- verify Document_ID / Drive file still exist
- no physical delete
- no Pitchbook-wide Inactive/Reactivate unless explicitly requested by a separate lifecycle operation
- relink same Document_ID
- authoritative relation list reflects each state

### R6 Meeting Google Docs body preservation

Before relation-only mutation, obtain authoritative Meeting body through the existing normal product/read path or directly opened authoritative Google Doc.

After unlink and after relink, obtain it again.

Require exact body-text equality. Also verify Date/Time and unrelated business metadata are unchanged.

Do not add a diagnostic wrapper solely to read the body.

### R7 Independent Full Output

Without entering an AI question/model:

- run dedicated `全文出力`
- scope to the synthetic Meeting(s)
- require Meeting-only source count and authoritative Docs body/business attributes
- require Pitchbook body absent
- require Pitchbook reference-link section absent
- exercise bounded no-result or invalid-date safe error once without destructive side effect

Do not call any provider API.

### R8 Integrity / security

Read-only/non-destructive proof:

- Gemini remains disabled/normal-user hidden as previously accepted
- shared-admin login/security contract remains functional and no credential rotation occurs
- no provider credential/resource IDs are extracted into logs/report
- provider calls = 0
- physical delete = 0
- real confidential writes = 0
- access expansion = 0
- triggers not unexpectedly introduced/enabled

## Synthetic cleanup

Because physical delete is outside this Work:

- prefer inactivating clearly synthetic Meeting records after evidence capture
- unlink synthetic relations if cleanup does not destroy required evidence
- do not physically delete source files/Docs merely for cleanup
- report residual synthetic resource types/counts without private IDs/URLs

Do not compromise acceptance evidence to force cleanup.

## Stop conditions

STOP immediately on the first runtime failure after mutation begins.

Do not:

- change source after runtime failure
- try a second deployment
- create an API executable
- broaden OAuth scopes
- change Cloud project
- enable provider calls
- add public qualification wrappers
- switch to another hypothesis in the same dispatch

Return the failure and exact observed layer.

## Validation before runtime

Because CODEX-13 already passed deterministic gates and source is frozen, do not wastefully rerun broad tests before identity unless the branch changed unexpectedly.

If source has not changed since frozen source:

- verify commit/content continuity
- reuse accepted 78/78, 515/515, 27/27 evidence

If an unexpected source difference exists, STOP and return to ChatGPT before runtime mutation.

## Required report

Create:

`docs/handoffs/0028-CODEX-14-editor-runtime-qualification-report.md`

Include separate fields:

```text
SOURCE_CONTINUITY
EDITOR_OPERATOR_PATH
REMOTE_SOURCE_PARITY
SETUP_READINESS
IMMUTABLE_VERSION
WEB_APP_DEPLOYMENT
TARGET_RUNTIME_R1_R8
PROVIDER_CALLS: 0
SIDE_EFFECT_STATE
RESIDUAL_SYNTHETIC_RESOURCES
BLOCKER
READY
```

Never include private project/deployment/resource IDs, private URLs, account addresses, credentials, OAuth tokens, or source bodies.

Return:

```text
WORK_ID: 0028
DISPATCH_ID: 0028-CODEX-14
BALL: CHATGPT
STATUS: RETURNED
MODE: BUILD
```
