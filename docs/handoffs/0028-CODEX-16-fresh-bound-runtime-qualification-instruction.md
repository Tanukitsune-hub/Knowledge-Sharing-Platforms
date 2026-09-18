# CODEX-16 — fresh container-bound target runtime qualification

WORK_ID: 0028
DISPATCH_ID: 0028-CODEX-16
BALL: CODEX
STATUS: READY
MODE: BUILD
PHASE: B1.5 / STRATEGY RESET / FRESH BOUND TARGET QUALIFICATION

## Primary Outcome

Draft PR #51のaccepted provider-independent production implementationを、final company install architectureと同じfresh container-bound Google Spreadsheet targetでend-to-end認定する。

成功条件:

- generated distribution bundleからfresh installが成立
- schema 7 / accepted resourcesがtarget runtimeで成立
- qualification WEB_APP `/exec`からR1-R8 primary flowがPASS
- provider calls 0
- real confidential data 0
- existing historical standalone project/deploymentへの追加mutation 0

## Start point

Repository:
`Tanukitsune-hub/Knowledge-Sharing-Platforms`

Continue existing branch / Draft PR #51:

```text
branch: codex/0028-production-contract-build
PR: #51
returned HEAD: 751df8350b9f08cb5a6650e5bd21d1e7793f8ab7
frozen source commit: 5842a07255a10415d39d524fd8ec174450248855
bundle commit: 2ab8b262c7211af5464f3201a77c6e45484cdc6c
accepted focused: 78/78
accepted canonical: 515/515
accepted bundle: 27/27
```

Read first:

- latest `origin/main`
- applicable `AGENTS.md`
- `docs/handoffs/0028-CODEX-15-controller-review.md`
- this instruction
- `docs/decisions/modular-source-single-bundle-distribution.md`
- `docs/operations/apps-script-web-app-deployment.md`
- `docs/decisions/company-azure-openai-provider.md`

Do not merge/rebase main into PR branch merely to import control docs. `docs/handoffs/0028-dispatches.md` and `docs/planning/work-registry.md` are ChatGPT-owned.

## Strategy Reset / Closed Conclusions

Do not retry the historical standalone target.

The following are CLOSED:

- Execution API `scripts.run` is not the qualification route.
- container-bound installer is correct and must not be weakened for standalone.
- private `_` functions are not to be exposed or wrapped merely for qualification.
- historical standalone deployment remains version75 and is not the target of this dispatch.
- PR #51 source direction is accepted for runtime qualification.
- prepare lifecycle blocker is CLOSED.
- Direct OpenAI/Gemini/Azure provider live qualification is Work 0030.

Do not modify existing historical standalone Apps Script saved source, version75 deployment, access, properties, resources or credentials in this dispatch.

## Fresh target boundary

Create exactly one isolated qualification target under the currently authenticated owner account.

Use clearly synthetic names. Do not include company/confidential/project-private identifiers in names or reports.

Allowed new resources:

```text
one isolated qualification folder
one host Google Spreadsheet
one container-bound Apps Script project
installer-created Knowledge Share folders/Backend/Audit/Exports inside that isolated parent
one qualification WEB_APP deployment
synthetic Meeting Docs / tiny test files / export artifacts required by R1-R8
```

No second target in this dispatch.

Do not use an existing real Shared Drive/company production folder. Use an isolated non-confidential DEV/qualification parent where creating disposable test resources is safe.

If no safe isolated location can be positively identified, return `BALL: USER / STATUS: ACTION_REQUIRED` asking only for the user to choose/create a safe DEV folder. Do not request IDs/URLs in chat.

## Install source

Use the exact generated distribution corresponding to the accepted bundle commit.

Authoritative artifacts:

```text
dist/KnowledgeShare.bundle.gs
dist/appsscript.json
dist/release-manifest.json
```

The bound project must contain the exact accepted generated bundle behavior. Do not develop in the bound project.

One source-install mutation is allowed on the fresh bound project. It may be performed through the editor or Apps Script Projects content update, but must preserve the fact that the project was created from the host Spreadsheet and remains container-bound.

After source install:

- verify bundle/manifest identity against repository artifact
- enable only the Advanced Drive service declared by the accepted manifest if required
- do not add provider credentials
- do not enable AI sync

If source/manifest identity is not exact, STOP before installer execution.

## Installer qualification

Run from the bound Apps Script editor under the same authenticated owner context.

### I1 First install

Run exactly once:

`installKnowledgeShare()`

Expected terminal state before deployment:

`READY_FOR_DEPLOYMENT`

PASS requires:

- bound Spreadsheet recognized
- owner/admin identity accepted
- isolated parent inferred
- accepted resources created/reused inside isolated boundary
- 5 backend sheets only
- schema 7
- AI sync disabled
- no unexpected recurring trigger
- installation status sheet written

If the installer returns ACTION_REQUIRED for a normal Google authorization consent prompt, return same Dispatch as `BALL: USER / ACTION_REQUIRED` with concise UI steps. Do not ask for credentials/tokens.

Any other first installer failure -> STOP. Do not repair source in the same dispatch.

### I2 Idempotency

After successful first install, run `installKnowledgeShare()` one additional time only to verify idempotency.

PASS requires no duplicate resources/sheets/seeds/triggers and same authoritative installation state.

This second call is idempotency evidence, not a repair retry.

## Qualification WEB_APP deployment

After `READY_FOR_DEPLOYMENT`:

Create exactly one qualification WEB_APP deployment for this fresh bound target.

Required security posture for this DEV qualification:

- execute as deploying user / owner
- access only the same authenticated owner context (`MYSELF` equivalent)
- no public/domain-wide access expansion

New deployment count in this dispatch: max 1.

Do not reuse or modify historical version75 deployment.

After deployment:

1. read back deployment identity / WEB_APP entrypoint / access / execute-as
2. run `confirmKnowledgeShareDeploymentSecurity()` from the bound editor
3. run `checkKnowledgeShareReadiness()`
4. require `READY`
5. open the qualification `/exec` and observe successful `doGet`/bootstrap execution

If any deployment/readiness step fails, STOP. Do not create a second deployment.

## Provider-independent runtime acceptance R1-R8

All record/file content must be synthetic and non-confidential.

### R1 — fresh schema/setup

PASS requires authoritative readback:

- schema version 7
- `Pitchbook_Index` includes append contract columns:
  - `Parent_Meeting_ID`
  - `Counterparty_Type`
  - `Counterparty_ID`
  - `Related_GP_IDs`
- 5-sheet backend preserved
- setup/installer rerun idempotent
- AI sync disabled

### R2 — GP + non-GP parent-first Meeting

Through the actual qualification `/exec`:

- create one synthetic GP Meeting
- create one synthetic non-GP Meeting using an allowed non-GP counterparty type/entity
- require stable Meeting_ID / Version / authoritative Google Docs identity
- no file/Pitchbook row may exist before parent Meeting commit succeeds

Use synthetic names/content only.

### R3 — non-GP parent-bound tiny file

Attach one tiny supported synthetic file to the non-GP Meeting.

Require authoritative readback:

- stable Document_ID
- Drive file exists
- `Parent_Meeting_ID` matches parent
- `Counterparty_Type / Counterparty_ID` match parent
- `Related_GP_IDs` matches authoritative parent snapshot
- `GP_ID` remains blank unless the actual parent context is GP
- parent Meeting relation list contains Document_ID

Provider call 0.

### R4 — follow-up file on existing Meeting

From Past Records / saved Meeting detail:

- add a second tiny synthetic file to the same Meeting
- Meeting_ID unchanged
- a new Document_ID only
- parent metadata remains coherent

### R5 — unlink / relink

Use visible file `削除` to unlink one file from the current Meeting.

Require:

- Document_ID remains
- Drive file remains
- physical delete 0
- Pitchbook-wide Status unchanged unless a separate lifecycle action was explicitly invoked (do not invoke one here)
- relation list removes the Document_ID

Then relink the same Document_ID and confirm relation restoration.

### R6 — authoritative Meeting Docs body preservation

Before unlink, capture authoritative Meeting Google Docs body text.

Capture again after unlink and after relink.

Require exact body-text equality. Also verify unrelated business fields including Date/Time remain unchanged.

Do not add diagnostic/public wrappers for this readback. Use authoritative Drive/Docs read path or opened source document.

### R7 — dedicated Full Output

Without entering an AI question/model/provider credential:

- run dedicated `全文出力`
- scope to the synthetic Meeting(s)
- require Meeting-only source count
- require authoritative Docs body + Meeting business attributes
- require Pitchbook body absent
- require Pitchbook reference-link section absent
- exercise one bounded no-result or invalid-date safe error

Provider call 0.

### R8 — security/integrity

Fresh-target expectations:

- AI sync remains disabled
- Gemini remains unavailable/hidden to normal user by default
- no Direct OpenAI/Gemini/Azure provider credential is configured or called
- no provider resource IDs created
- no provider calls
- no unexpected trigger
- admin/shared-admin production credential is not invented, copied or rotated for this synthetic target
- normal admin surface fails closed/unconfigured where credential is not set
- access remains owner-only
- real confidential writes 0

Work 0029 historical shared-admin runtime evidence remains Accepted Evidence and is not requalified by inventing a synthetic secret.

## Cleanup / retained synthetic evidence

Physical delete is not authorized.

After evidence capture:

- mark synthetic Meeting records Inactive where safe
- unlink relations only if doing so does not destroy needed evidence
- leave isolated qualification folder/resources intact for audit and possible Work 0030 reuse
- report residual resource types/counts only; no private IDs/URLs

The fresh bound qualification target may be reused by Work 0030 for Azure synthetic provider qualification after Work 0028 acceptance.

## Mutation / retry bounds

- historical standalone mutations: 0
- fresh target creation: 1
- source install into fresh bound project: 1
- installer initial call: 1
- installer idempotency call after successful initial install: 1
- WEB_APP deployments: 1
- deployment updates: 0 unless the deployment UI itself creates an immutable version as part of its single creation
- business-flow matrix: one bounded pass
- source repair: 0 unless a direct fresh-target application defect is observed; if observed, STOP and return to ChatGPT rather than patching in the same run

First non-consent runtime failure -> STOP.

## Provider boundary

```text
Direct OpenAI calls: 0
Gemini calls: 0
Azure OpenAI calls: 0
Actual File Search / citation provider runtime: DEFERRED_TO_WORK_0030
```

Provider-neutral deterministic metadata/citation evidence from PR #51 remains accepted.

## Required report

Create/update on PR #51 branch:

`docs/handoffs/0028-CODEX-16-fresh-bound-runtime-qualification-report.md`

Separate clearly:

```text
INSTALLER_QUALIFICATION
LOGIC_VALIDATION: ACCEPTED_FROM_CODEX13 or rerun only if source changed (source change is not expected)
BUNDLE_IDENTITY
TARGET_RUNTIME_R1_R8
PROVIDER_RUNTIME_QUALIFICATION: DEFERRED_TO_WORK_0030 / CALLS_0
SIDE_EFFECT_STATE
RESIDUAL_SYNTHETIC_RESOURCES
BLOCKER
READY
```

Do not record private IDs/URLs/accounts/credentials.

Return:

```text
WORK_ID: 0028
DISPATCH_ID: 0028-CODEX-16
BALL: CHATGPT
STATUS: RETURNED
MODE: BUILD
```

If human OAuth/native Google UI confirmation is genuinely required:

```text
WORK_ID: 0028
DISPATCH_ID: 0028-CODEX-16
BALL: USER
STATUS: ACTION_REQUIRED
```

Resume under the same Dispatch after the user completes only that interaction.
